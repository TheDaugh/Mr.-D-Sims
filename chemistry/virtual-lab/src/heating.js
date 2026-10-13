// Virtual Lab 2: heating curves. Students heat two unknown samples, type in their own data,
// plot it by hand, and identify each substance. The computer never draws the curve for them.
import { $, h, mulberry32, wordCount } from "./ui/dom.js";
import { Log, downloadJSON } from "./log.js";
import { profile, stateAt, reading, assign } from "./engine/heating.js";
import { theoryNodes, renderPrelab, insertAt } from "./ui/stages.js";

const lab = await fetch("content/labs/02-heating-curves.json").then((r) => r.json()).catch((e) => { $("#boot").textContent = "Open this page from the web (GitHub Pages) or a local server. " + e.message; throw e; });
$("#boot").hidden = true; $("#app").hidden = false;
const KEY = "vlab:heating", PRACTICE = { id: "practice", mass: 10, power: 100, T0: 20, mp: 50, bp: 150, Tend: 90, cs: 2, cl: 2.5, cg: 2, Lf: 200, Lv: 1000 };
const log = new Log(); const demo = { on: false, stop: null };
const qp = new URLSearchParams(location.search);
const mk = (id) => ({ sub: id, t: 0, rows: [], items: [], axes: { title: "", x: "", y: "" } });
function fresh(seed) {
  const ids = assign(lab.substances.map((s) => s.id), seed, lab.samples);
  return { seed, stage: "intro", student: "", prelab: { answers: {}, prediction: "" }, active: "X", samples: { X: mk(ids[0]), Y: mk(ids[1]) }, cer: { X: "", Y: "", claim: "", evidence: [], note: "", reasoning: "" }, interval: 15, speed: 1, cerDone: false };
}
let S = fresh(+qp.get("seed") || 1 + Math.floor(Math.random() * 99999));
const cur = () => S.samples[S.active];
const subOf = (s) => s.sub === "practice" ? PRACTICE : lab.substances.find((x) => x.id === s.sub);
const profOf = (s) => profile(subOf(s), subOf(s).mass);
const durOf = (s) => profOf(s).total / subOf(s).power;
const stateOf = (s) => stateAt(profOf(s), s.t * subOf(s).power);
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const num = (v) => v !== "" && v != null && Number.isFinite(+v);
const goodRows = (s) => s.rows.filter((r) => num(r.t) && num(r.T));
const letters = () => Object.keys(S.samples);

// ---- log at the bottom ----
let feed = [];
function say(text, cls = "") { feed.push({ text, cls }); if (feed.length > 200) feed.shift(); renderFeed(); }
function renderFeed() { const f = $("#feed"); f.replaceChildren(...feed.map((m) => h("div", { class: m.cls ? "f-" + m.cls : "" }, m.text))); f.scrollTop = f.scrollHeight; }
const act = (type, d) => { if (!demo.on) log.add(type, d); };

// ---- dialogs ----
const dlg = (id) => document.getElementById(id), openDlg = (id) => { if (!dlg(id).open) dlg(id).showModal(); }, closeDlg = (id) => { if (dlg(id).open) dlg(id).close(); };
for (const id of ["dlgIntro", "dlgPrelab"]) dlg(id).addEventListener("cancel", (e) => e.preventDefault());
document.querySelectorAll("dialog [data-close]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));

// ---- simulation clock ----
let playing = false, target = null, last = performance.now(), shown = 0;
function setPlaying(on, why) {
  const s = cur(); if (on && s.t >= durOf(s)) { say("This run is finished. The heater has reached the end of its range.", "warn"); on = false; }
  if (on === playing) return; playing = on; if (!on) target = null;
  $("#play").textContent = playing ? "⏸ Pause" : "▶ Play";
  act(playing ? "play" : "pause", { sample: S.active, t: Math.round(s.t) });
  if (why) say(why);
}
function tick(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (playing) {
    const s = cur(), dur = durOf(s); s.t = Math.min(dur, s.t + dt * (target != null ? 20 : S.speed));
    if (target != null && s.t >= target) { s.t = Math.min(target, dur); setPlaying(false); say(`Paused at ${mmss(s.t)}. Write the reading down.`); }
    else if (s.t >= dur) { setPlaying(false); act("run_end", { sample: S.active }); say(`Sample ${S.active}: the run is finished. Fill in any readings you missed using the table, then plot.`, "obs"); renderQuests(); }
  }
  draw(now); requestAnimationFrame(tick);
}
$("#play").addEventListener("click", () => { if (!allowed()) return; setPlaying(!playing, playing ? "" : `Heating Sample ${S.active} at ×${S.speed}.`); });
$("#speed").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; S.speed = +b.dataset.s; act("speed", { speed: S.speed }); syncControls(); });
$("#interval").addEventListener("change", (e) => { S.interval = +e.target.value; });
$("#advance").addEventListener("click", () => {
  if (!allowed()) return; const s = cur(); if (s.t >= durOf(s)) return say("This run is finished.", "warn");
  target = (Math.floor(s.t / S.interval + 1e-9) + 1) * S.interval; playing = false; setPlaying(true); act("advance", { sample: S.active, to: target });
});
const allowed = () => { if (S.stage === "lab" || S.stage === "postlab" || S.stage === "done" || demo.on) return true; say("Finish the pre-lab first.", "stop"); return false; };
function syncControls() {
  $("#speed").querySelectorAll("button").forEach((b) => b.classList.toggle("on", +b.dataset.s === S.speed));
  $("#interval").value = String(S.interval);
}

// ---- sample tabs ----
function renderTabs() {
  $("#tabs").replaceChildren(...letters().map((k) => h("button", { class: k === S.active ? "on" : "", onclick: () => switchTo(k) }, "Sample " + (k === "P" ? "P (practice)" : k) + (k !== "P" && S.samples[k].t >= durOf(S.samples[k]) ? " ✔" : ""))));
}
function switchTo(k) { if (k === S.active) return; setPlaying(false); S.active = k; pend = null; syncAll(); say(`Now looking at Sample ${k}.`); }
function syncAll() { renderTabs(); renderRows(); syncGraphInputs(); drawGraph(); syncControls(); renderQuests(); }

// ---- the bench picture: tube, thermometer, particles ----
const bench = $("#bench"), bx = bench.getContext("2d");
const rng = mulberry32(9), P = Array.from({ length: 40 }, (_, i) => ({ r: rng(), hx: 270 + (i % 8) * 26 + 12, hy: 205 - Math.floor(i / 8) * 20 - 6, x: 0, y: 0, vx: 0, vy: 0, m: 0, w1: 3 + rng() * 4, w2: 3 + rng() * 4, p1: rng() * 6.28, p2: rng() * 6.28 }));
const BOX = { x: 262, y: 30, w: 240, h: 188 };
function draw(now) {
  const s = cur(), st = stateOf(s), k = Math.sqrt((st.T + 273) / 300), tt = now / 1000;
  if (Math.floor(s.t) !== shown) { shown = Math.floor(s.t); $("#rTime").textContent = mmss(s.t); $("#rTemp").textContent = s.t === 0 ? reading(st.T, S.seed, 0).toFixed(1) : reading(st.T, S.seed, shown).toFixed(1); }
  bx.clearRect(0, 0, 520, 250); bx.fillStyle = "#1b2530"; bx.fillRect(0, 0, 520, 250);
  // heater
  const hot = playing ? 1 : 0.55; bx.fillStyle = `rgba(255,${110 + 60 * hot},40,${0.5 + 0.4 * hot})`; bx.fillRect(40, 214, 130, 12); bx.fillStyle = "#3b4654"; bx.fillRect(34, 226, 142, 10);
  // tube
  bx.strokeStyle = "#9fb3c8"; bx.lineWidth = 3; bx.beginPath(); bx.moveTo(60, 40); bx.lineTo(60, 200); bx.arc(105, 200, 45, Math.PI, 0, true); bx.lineTo(150, 40); bx.stroke();
  bx.save(); bx.beginPath(); bx.moveTo(61, 40); bx.lineTo(61, 200); bx.arc(105, 200, 44, Math.PI, 0, true); bx.lineTo(149, 40); bx.closePath(); bx.clip();
  const colH = 120, bottom = 244, sol = colH * (1 - st.fm), liq = colH * (st.fm - st.fv);
  bx.fillStyle = "#ece8da"; bx.fillRect(60, bottom - sol, 90, sol);
  bx.fillStyle = "rgba(120,170,230,.75)"; bx.fillRect(60, bottom - sol - liq, 90, liq);
  if (st.fv > 0) { bx.fillStyle = `rgba(230,240,255,${0.12 + 0.2 * st.fv})`; bx.fillRect(60, 40, 90, bottom - 40 - sol - liq); }
  if (st.phase === "boiling" || (st.phase === "melting" && playing)) for (let i = 0; i < (st.phase === "boiling" ? 9 : 3); i++) { const bxp = 70 + ((i * 37 + tt * 40) % 70), byp = bottom - sol - ((tt * (30 + i * 9) + i * 23) % Math.max(10, liq)); bx.strokeStyle = "rgba(255,255,255,.7)"; bx.lineWidth = 1; bx.beginPath(); bx.arc(bxp, byp, 3 + (i % 3), 0, 6.3); bx.stroke(); }
  bx.restore();
  // thermometer, −40 to 260 °C
  const tx = 200, y0 = 215, y1 = 35, f = (T) => y0 + (y1 - y0) * ((T + 40) / 300);
  bx.fillStyle = "#e9eef3"; bx.fillRect(tx - 6, y1, 12, y0 - y1); bx.beginPath(); bx.arc(tx, y0 + 8, 11, 0, 6.3); bx.fill();
  bx.fillStyle = "#d9392b"; bx.fillRect(tx - 3, f(st.T), 6, y0 - f(st.T)); bx.beginPath(); bx.arc(tx, y0 + 8, 8, 0, 6.3); bx.fill();
  bx.fillStyle = "#c9d3dd"; bx.font = "10px system-ui"; bx.textAlign = "left";
  for (let T = -40; T <= 260; T += 20) { bx.fillRect(tx + 7, f(T), T % 40 === 0 ? 9 : 5, 1); if (T % 40 === 0) bx.fillText(String(T), tx + 19, f(T) + 3); }
  // particles
  bx.strokeStyle = "#6d7f92"; bx.lineWidth = 2; bx.strokeRect(BOX.x, BOX.y, BOX.w, BOX.h);
  bx.fillStyle = "#c9d3dd"; bx.textAlign = "left"; bx.fillText("Particle view (a few of the billions)", BOX.x + 4, BOX.y - 6);
  for (const p of P) {
    const mode = p.r < st.fv ? 2 : p.r < st.fm ? 1 : 0;
    if (mode === 0) { const A = 0.8 + 1.6 * k; p.x = p.hx + A * Math.sin(tt * p.w1 + p.p1); p.y = p.hy + A * Math.sin(tt * p.w2 + p.p2); }
    else {
      if (p.m !== mode) { if (p.m === 0) { p.x = p.hx; p.y = p.hy; } p.m = mode; const a = Math.random() * 6.28; p.vx = Math.cos(a); p.vy = Math.sin(a); }
      if (Math.random() < 0.03) { const a = Math.random() * 6.28; p.vx = Math.cos(a); p.vy = Math.sin(a); }
      const v = (mode === 1 ? 22 : 80) * k; p.x += p.vx * v * 0.016; p.y += p.vy * v * 0.016;
      const top = mode === 1 ? BOX.y + BOX.h - 120 : BOX.y + 6;
      if (p.x < BOX.x + 6 || p.x > BOX.x + BOX.w - 6) { p.vx *= -1; p.x = Math.min(BOX.x + BOX.w - 6, Math.max(BOX.x + 6, p.x)); }
      if (p.y < top || p.y > BOX.y + BOX.h - 6) { p.vy *= -1; p.y = Math.min(BOX.y + BOX.h - 6, Math.max(top, p.y)); }
    }
    bx.fillStyle = mode === 2 ? "#ffc16b" : mode === 1 ? "#7fb3ff" : "#b9c8ff"; bx.beginPath(); bx.arc(p.x, p.y, 5, 0, 6.3); bx.fill();
  }
}

// ---- data table ----
const STATES = ["", "solid", "solid + liquid", "liquid", "liquid + gas", "gas"];
function renderRows() {
  const s = cur();
  $("#rows").replaceChildren(h("thead", {}, h("tr", {}, ["#", "Time (s)", "Temp (°C)", "State"].map((t) => h("th", {}, t)))),
    h("tbody", {}, s.rows.map((r, i) => {
      const sel = h("select", { "aria-label": "State", onchange: (e) => { r.s = e.target.value; } }, STATES.map((o) => h("option", { value: o }, o || "— choose —"))); sel.value = r.s || "";
      const inp = (key, label) => h("input", { type: "number", step: "any", value: r[key] ?? "", "aria-label": label, oninput: (e) => { r[key] = e.target.value; countRows(); } });
      return h("tr", {}, h("td", {}, String(i + 1)), h("td", {}, inp("t", "Time in seconds")), h("td", {}, inp("T", "Temperature in degrees Celsius")), h("td", {}, sel));
    })));
  countRows();
}
function countRows() { const n = goodRows(cur()).length; $("#rowCount").textContent = `${n} complete row${n === 1 ? "" : "s"} (aim for 12 or more).`; renderQuests(); }
$("#addRow").addEventListener("click", () => { if (!allowed()) return; cur().rows.push({ t: "", T: "", s: "" }); renderRows(); const t = $("#rows tbody tr:last-child input"); if (t) t.focus(); act("row_added", { sample: S.active, n: cur().rows.length }); });
$("#delRow").addEventListener("click", () => { cur().rows.pop(); renderRows(); });

// ---- the graph: blank axes; the student places every dot and line ----
const gc = $("#graph"), gx = gc.getContext("2d"), M = { l: 66, r: 16, t: 34, b: 56 };
function axesOf(s) {
  const b = subOf(s), dur = durOf(s), xmax = Math.ceil(dur / 60) * 60, ymin = Math.floor((b.T0 - 10) / 20) * 20, ymax = Math.ceil((b.Tend + 10) / 20) * 20;
  return { xmax, ymin, ymax, xs: 30, ys: ymax - ymin <= 120 ? 10 : 20 };
}
let tool = "p", pend = null, hover = null;
const toPx = (a, x, y) => [M.l + (x / a.xmax) * (gc.width - M.l - M.r), gc.height - M.b - ((y - a.ymin) / (a.ymax - a.ymin)) * (gc.height - M.t - M.b)];
const fromPx = (a, px, py) => {
  let x = ((px - M.l) / (gc.width - M.l - M.r)) * a.xmax, y = a.ymin + ((gc.height - M.b - py) / (gc.height - M.t - M.b)) * (a.ymax - a.ymin);
  const sx = a.xs / 5, sy = a.ys / 5; return [Math.round(x / sx) * sx, a.ymin + Math.round((y - a.ymin) / sy) * sy];
};
function drawGraph(canvas = gc, s = cur()) {
  const c = canvas === gc ? gx : canvas.getContext("2d"), a = axesOf(s), W = canvas.width, H = canvas.height;
  const px = (x, y) => [M.l + (x / a.xmax) * (W - M.l - M.r), H - M.b - ((y - a.ymin) / (a.ymax - a.ymin)) * (H - M.t - M.b)];
  c.fillStyle = "#fff"; c.fillRect(0, 0, W, H);
  c.lineWidth = 1; c.font = "12px system-ui"; c.fillStyle = "#333";
  for (let x = 0; x <= a.xmax; x += a.xs / 5) { const [X] = px(x, a.ymin); c.strokeStyle = x % a.xs === 0 ? "#b9b9b9" : "#ececec"; c.beginPath(); c.moveTo(X, M.t); c.lineTo(X, H - M.b); c.stroke(); }
  for (let y = a.ymin; y <= a.ymax + 1e-9; y += a.ys / 5) { const [, Y] = px(0, y); c.strokeStyle = Math.abs((y - a.ymin) % a.ys) < 1e-6 ? "#b9b9b9" : "#ececec"; c.beginPath(); c.moveTo(M.l, Y); c.lineTo(W - M.r, Y); c.stroke(); }
  c.textAlign = "center"; for (let x = 0; x <= a.xmax; x += a.xs) { const [X] = px(x, a.ymin); c.fillText(String(x), X, H - M.b + 16); }
  c.textAlign = "right"; for (let y = a.ymin; y <= a.ymax; y += a.ys) { const [, Y] = px(0, y); c.fillText(String(y), M.l - 6, Y + 4); }
  c.strokeStyle = "#111"; c.lineWidth = 2; c.strokeRect(M.l, M.t, W - M.l - M.r, H - M.t - M.b);
  c.fillStyle = "#111"; c.textAlign = "center"; c.font = "bold 13px system-ui";
  c.fillText(s.axes.title || "(title)", (W + M.l) / 2, 20); c.fillText(s.axes.x || "(label the x-axis)", (W + M.l) / 2, H - 10);
  c.save(); c.translate(16, (H - M.b + M.t) / 2); c.rotate(-Math.PI / 2); c.fillText(s.axes.y || "(label the y-axis)", 0, 0); c.restore();
  for (const it of s.items) if (it.k === "l") { const [x1, y1] = px(it.x1, it.y1), [x2, y2] = px(it.x2, it.y2); c.strokeStyle = "#1f5fbf"; c.lineWidth = 2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
  for (const it of s.items) if (it.k === "p") { const [X, Y] = px(it.x, it.y); c.fillStyle = "#c62828"; c.beginPath(); c.arc(X, Y, 4.5, 0, 6.3); c.fill(); }
  if (canvas === gc && pend) { const [X, Y] = px(pend.x, pend.y); c.strokeStyle = "#1f5fbf"; c.lineWidth = 2; c.beginPath(); c.arc(X, Y, 6, 0, 6.3); c.stroke(); if (hover) { c.setLineDash([5, 4]); c.beginPath(); c.moveTo(X, Y); c.lineTo(...px(hover[0], hover[1])); c.stroke(); c.setLineDash([]); } }
}
const mouse = (e) => { const r = gc.getBoundingClientRect(); return [(e.clientX - r.left) * gc.width / r.width, (e.clientY - r.top) * gc.height / r.height]; };
gc.addEventListener("mousemove", (e) => { const s = cur(), a = axesOf(s), [x, y] = mouse(e); hover = fromPx(a, x, y); $("#gHint").textContent = `Cursor: ${Math.round(hover[0] * 10) / 10} s, ${Math.round(hover[1] * 10) / 10} °C. ${tool === "p" ? "Click to place a point. Click a point to remove it." : pend ? "Click the other end of the line." : "Click where the line starts."}`; if (pend) drawGraph(); });
gc.addEventListener("click", (e) => {
  if (!allowed()) return; const s = cur(), a = axesOf(s), [mx, my] = mouse(e);
  if (mx < M.l || mx > gc.width - M.r || my < M.t || my > gc.height - M.b) return;
  const [x, y] = fromPx(a, mx, my);
  if (tool === "p") {
    const hit = s.items.findIndex((it) => it.k === "p" && Math.hypot(toPx(a, it.x, it.y)[0] - mx, toPx(a, it.x, it.y)[1] - my) < 8);
    if (hit >= 0) { s.items.splice(hit, 1); act("point_removed", { sample: S.active }); } else { s.items.push({ k: "p", x, y }); act("point", { sample: S.active, x, y }); }
  } else if (!pend) pend = { x, y };
  else { if (pend.x !== x || pend.y !== y) { s.items.push({ k: "l", x1: pend.x, y1: pend.y, x2: x, y2: y }); act("line", { sample: S.active }); } pend = null; }
  drawGraph(); renderQuests();
});
const setTool = (t) => { tool = t; pend = null; $("#toolP").classList.toggle("on", t === "p"); $("#toolL").classList.toggle("on", t === "l"); drawGraph(); };
$("#toolP").addEventListener("click", () => setTool("p")); $("#toolL").addEventListener("click", () => setTool("l"));
$("#undo").addEventListener("click", () => { cur().items.pop(); pend = null; drawGraph(); renderQuests(); });
let clearArm = false;
$("#clearG").addEventListener("click", () => { if (!clearArm) { clearArm = true; $("#clearG").textContent = "Really clear?"; return setTimeout(() => { clearArm = false; $("#clearG").textContent = "Clear graph"; }, 3000); } cur().items = []; clearArm = false; $("#clearG").textContent = "Clear graph"; drawGraph(); renderQuests(); });
for (const [id, key] of [["#gTitle", "title"], ["#gX", "x"], ["#gY", "y"]]) $(id).addEventListener("input", (e) => { cur().axes[key] = e.target.value; drawGraph(); });
function syncGraphInputs() { const a = cur().axes; $("#gTitle").value = a.title; $("#gX").value = a.x; $("#gY").value = a.y; }
const pane = (name) => { $("#paneData").hidden = name !== "data"; $("#paneGraph").hidden = name !== "graph"; $("#tabData").classList.toggle("on", name === "data"); $("#tabGraph").classList.toggle("on", name === "graph"); if (name === "graph") drawGraph(); };
$("#tabData").addEventListener("click", () => pane("data")); $("#tabGraph").addEventListener("click", () => pane("graph"));

// ---- tasks and coach ----
const pts = (s) => s.items.filter((i) => i.k === "p").length, lns = (s) => s.items.filter((i) => i.k === "l").length;
function questDone(q) {
  if (q.id === "cer") return S.cerDone; const k = q.id.slice(-1), s = S.samples[k]; if (!s) return true;
  switch (q.id.slice(0, -1)) { case "run": return s.t >= durOf(s) - 1e-6; case "rows": return goodRows(s).length >= 12; case "plot": return pts(s) >= 12; case "line": return lns(s) >= 3; }
  return false;
}
function renderQuests() {
  if (demo.on) return;
  const qs = lab.quests.filter((q) => q.id === "cer" || S.samples[q.id.slice(-1)]), ds = qs.map(questDone), ai = ds.indexOf(false);
  $("#questHead").textContent = `Tasks (${ds.filter(Boolean).length} of ${qs.length})`;
  $("#quests").replaceChildren(...qs.map((q, i) => h("li", { class: ds[i] ? "done" : i === ai ? "active" : "" }, h("span", { class: "tick" }, ds[i] ? "✔" : i === ai ? "▶" : "○"), q.text)));
  const st = S.stage;
  $("#coachText").textContent = st === "intro" || st === "prelab" ? "Finish the pre-lab. The lab stays locked until you do." : st === "done" ? "Lab complete. Open Save / Hand in to download your record." : ai >= 0 ? qs[ai].hint : "All tasks done.";
}

// ---- stages ----
function pctx() { return { lab, S, seed: S.seed, onAnswer: (id, choice, correct) => act("prelab_answer", { q: id, choice, correct }), onPrelabDone: () => { S.stage = "lab"; act("prelab_done", { prediction: S.prelab.prediction }); closeDlg("dlgPrelab"); renderQuests(); say("Pre-lab done. Heat Sample X first. Pause to write down readings."); } }; }
function showIntro() {
  const key = (k, t) => h("tr", {}, h("td", {}, h("kbd", {}, k)), h("td", {}, t));
  const name = h("input", { id: "student", type: "text", autocomplete: "name", style: "width:18em", placeholder: "First and last name" });
  const go = h("button", { class: "primary", disabled: true, onclick: () => { S.student = name.value.trim(); S.stage = "prelab"; act("stage", { to: "prelab", name: S.student }); closeDlg("dlgIntro"); renderPrelab($("#prelabBody"), pctx()); openDlg("dlgPrelab"); renderQuests(); } }, "Start the pre-lab →");
  name.addEventListener("input", () => { go.disabled = name.value.trim().length < 3; }); name.value = S.student || ""; go.disabled = name.value.trim().length < 3;
  $("#introBody").replaceChildren(h("h2", {}, lab.title), h("p", {}, lab.intro), h("h3", {}, "How this lab works"),
    h("ol", {}, h("li", {}, "Watch the demo to see the controls (about a minute)."), h("li", {}, "Do the pre-lab: read the theory, answer six questions, write a prediction. The lab stays locked until you finish."),
      h("li", {}, "Heat Sample X. Pause to read the thermometer and type the time, temperature and state into the table."), h("li", {}, "Plot your readings on the blank graph yourself: dots first, then straight lines through each piece."), h("li", {}, "Do the same for Sample Y, then write a Claim, Evidence, Reasoning that names both substances.")),
    h("h3", {}, "Controls"), h("table", { class: "keys" }, key("Play / Pause", "Heat continuously. ×5 and ×20 run faster."), key("Advance one step", "Moves the clock exactly one step, then pauses. Best for taking evenly spaced readings."), key("Space", "Play or pause."), key("Graph tab", "Click to place a point. Switch to Line and click the two ends of each straight piece.")),
    h("p", { class: "hint" }, "The bar along the bottom is your log. It tells you what happened."), h("label", { style: "display:block;margin:12px 0" }, "Your name ", name),
    h("div", { class: "controls foot" }, h("button", { onclick: runDemo }, "▶ Watch the demo"), go));
  openDlg("dlgIntro");
}
function prelabScore() { const qs = lab.prelab.questions; return { correct: qs.filter((q) => S.prelab.answers[q.id] === q.correct).length, total: qs.length }; }

// ---- CER ----
function openCER() {
  if (S.stage === "lab") S.stage = "postlab"; const post = lab.postlab, C = S.cer;
  const opts = () => [h("option", { value: "" }, "— choose —"), ...lab.reference.map((r) => h("option", { value: r.id }, r.name))];
  const selX = h("select", {}, ...opts()), selY = h("select", {}, ...opts()); selX.value = C.X || ""; selY.value = C.Y || "";
  const claim = h("textarea", { rows: 2, style: "width:100%", "aria-label": "Claim" }), reasoning = h("textarea", { rows: 6, style: "width:100%", "aria-label": "Reasoning" }), note = h("textarea", { rows: 2, style: "width:100%", placeholder: "Anything else from your data (optional)" });
  claim.value = C.claim || ""; reasoning.value = C.reasoning || ""; note.value = C.note || "";
  const evBox = h("div", { class: "ev" }), checks = h("div", {}), st = h("p", { class: "hint", role: "status" }), picks = new Set(C.evidence || []);
  const items = []; for (const k of letters()) if (k !== "P") for (const r of goodRows(S.samples[k])) items.push(`Sample ${k}, ${r.t} s: ${r.T} °C${r.s ? ", " + r.s : ""}`);
  evBox.replaceChildren(...(items.length ? items.map((t) => h("label", { class: "ck" }, h("input", { type: "checkbox", value: t, checked: picks.has(t) ? "" : null, onchange: (e) => { e.target.checked ? picks.add(t) : picks.delete(t); update(); } }), t)) : [h("p", { class: "hint" }, "Your table is empty. Close this window and record some readings first.")]));
  const submit = h("button", { class: "primary", disabled: true, onclick: () => { S.cerDone = true; S.stage = "done"; act("cer", { ...S.cer }); closeDlg("dlgCER"); openDlg("dlgDone"); renderQuests(); say("CER submitted.", "obs"); } }, "Submit CER");
  function update() {
    const nc = wordCount(claim.value), nr = wordCount(reasoning.value), ne = picks.size + (wordCount(note.value) >= post.minWords.evidence ? 1 : 0), all = [...checks.querySelectorAll("input")].every((i) => i.checked);
    const ok = selX.value && selY.value && nc >= post.minWords.claim && ne >= 2 && nr >= post.minWords.reasoning && all; submit.disabled = !ok;
    st.textContent = ok ? "Ready to submit." : `Needed: both substances chosen, a claim (${post.minWords.claim} words), two pieces of evidence, ${post.minWords.reasoning} words of reasoning (you have ${nr}), and every box ticked.`;
    Object.assign(S.cer, { X: selX.value, Y: selY.value, claim: claim.value, reasoning: reasoning.value, note: note.value, evidence: [...picks] });
  }
  for (const el of [claim, reasoning, note, selX, selY]) el.addEventListener("input", update);
  checks.replaceChildren(...post.checklist.map((t) => h("label", { class: "ck" }, h("input", { type: "checkbox", onchange: update }), t)));
  const chips = (list, ta) => h("div", { class: "chips" }, list.map((t) => h("button", { class: "chip", type: "button", onclick: () => { insertAt(ta, t); update(); } }, t)));
  $("#cerBody").replaceChildren(h("h2", {}, "Claim, Evidence, Reasoning"), h("p", {}, post.prompt),
    h("div", { class: "reftable" }, h("h3", {}, "Reference table"), h("table", { class: "keys" }, h("tbody", {}, lab.reference.map((r) => h("tr", {}, h("td", {}, r.name), h("td", {}, `melts ${r.mp} °C`), h("td", {}, `boils ${r.bp} °C`)))))),
    h("p", {}, "Sample X is ", selX, "  Sample Y is ", selY),
    h("h3", {}, "Claim"), h("p", { class: "hint" }, "One or two sentences that answer the question."), chips(post.starters.claim, claim), claim,
    h("h3", {}, "Evidence"), h("p", { class: "hint" }, "Tick readings from your own table that support the claim. Plateau readings are the strongest."), evBox, note,
    h("h3", {}, "Reasoning"), h("p", { class: "hint" }, "Explain why that evidence points to that substance. Say where the energy goes during a plateau. Evidence says what happened; reasoning says why it matters."), chips(post.starters.reasoning, reasoning), h("div", { class: "chips" }, post.wordBank.map((t) => h("button", { class: "chip", type: "button", onclick: () => { insertAt(reasoning, t + " "); update(); } }, t))), reasoning,
    h("h3", {}, "Check yourself"), checks, st, h("div", { class: "controls foot" }, h("button", { onclick: () => closeDlg("dlgCER") }, "Back to the lab"), submit));
  update(); openDlg("dlgCER");
}

// ---- record, save, load ----
function record() {
  const off = document.createElement("canvas"); off.width = 640; off.height = 400; const samples = {};
  for (const k of letters()) { if (k === "P") continue; const s = S.samples[k]; drawGraph(off, s); samples[k] = { substance: s.sub, t: Math.round(s.t), rows: s.rows, items: s.items, axes: s.axes, plotPng: off.toDataURL("image/png") }; }
  drawGraph();
  return { version: 2, lab: lab.id, student: S.student, seed: S.seed, started: log.started, stage: S.stage, submitted: S.cerDone, prelab: { ...prelabScore(), prediction: S.prelab.prediction, answers: S.prelab.answers }, samples, cer: S.cer, events: log.events, state: S };
}
const snapshot = () => ({ state: S, events: log.events, started: log.started, feed: feed.slice(-60) });
function restore(sn) { S = sn.state; log.events = sn.events || []; log.started = sn.started || log.started; feed = sn.feed || []; renderFeed(); pend = null; setPlaying(false); syncAll(); }
setInterval(() => { if (demo.on || S.stage === "intro") return; try { localStorage.setItem(KEY, JSON.stringify(snapshot())); } catch (e) {} }, 5000);
$("#download").addEventListener("click", () => downloadJSON(`heating-${(S.student || "student").replace(/\W+/g, "-").toLowerCase()}.json`, record()));
$("#load").addEventListener("change", async (e) => { try { const rec = JSON.parse(await e.target.files[0].text()); if (rec.lab !== lab.id || !rec.state) throw 0; restore({ state: rec.state, events: rec.events, started: rec.started }); closeDlg("dlgMenu"); say("Record loaded.", "obs"); resumeStage(); } catch (_) { say("That file is not a record from this lab.", "stop"); } });
$("#doneMenu").addEventListener("click", () => { closeDlg("dlgDone"); openDlg("dlgMenu"); });
$("#btnMenu").addEventListener("click", () => openDlg("dlgMenu")); $("#btnTheory").addEventListener("click", () => openDlg("dlgTheory"));
$("#btnCER").addEventListener("click", () => { if (S.stage === "intro" || S.stage === "prelab") return say("Finish the pre-lab first.", "stop"); openCER(); });
$("#btnDemo").addEventListener("click", () => runDemo());
$("#theoryBody").replaceChildren(...theoryNodes(lab));
document.addEventListener("keydown", (e) => { if (e.target.closest("input,textarea,select,dialog[open]") ) return; if (e.code === "Space") { e.preventDefault(); $("#play").click(); } if (e.key === "t") openDlg("dlgTheory"); });
function resumeStage() { if (S.stage === "intro") showIntro(); else if (S.stage === "prelab") { renderPrelab($("#prelabBody"), pctx()); openDlg("dlgPrelab"); } else if (S.stage === "done") openDlg("dlgDone"); }

// ---- scripted demo on a practice sample ----
async function runDemo() {
  if (demo.on) return; const keep = JSON.stringify(snapshot()), wasOpen = ["dlgIntro", "dlgPrelab"].find((d) => dlg(d).open);
  demo.on = true; closeDlg("dlgIntro"); closeDlg("dlgPrelab"); closeDlg("dlgTheory");
  S.stage = "lab"; S.samples = { P: mk("practice") }; S.active = "P"; S.interval = 10; S.speed = 1; feed = []; renderFeed(); pane("data"); syncAll();
  $("#demoBar").hidden = false; let stopped = false, wake = () => {}; demo.stop = () => { stopped = true; wake(); }; $("#demoStop").onclick = () => demo.stop();
  const wait = (ms) => new Promise((r) => { const t = setTimeout(r, ms * 1.8); wake = () => { clearTimeout(t); r(); }; }), live = () => { if (stopped) throw new Error("stop"); };
  const cap = async (t, ms = 3000) => { live(); $("#demoText").textContent = t; say(t); await wait(ms); live(); };
  const row = () => { const s = cur(); s.rows.push({ t: String(Math.round(s.t)), T: $("#rTemp").textContent, s: ["solid", "solid + liquid", "liquid"][s.rows.length] || "liquid" }); renderRows(); };
  try {
    await cap("This is a practice sample. Your real samples work the same way. Watch the thermometer and the particles.", 3200);
    $("#play").click(); await wait(2500); live(); $("#play").click(); await cap("Press Pause to stop the clock. Then write down the time, the temperature and the state in the data table.", 3200);
    row(); await cap("Here the time and temperature are copied for you. In the real lab you type them yourself.", 3200);
    for (let i = 0; i < 3; i++) { $("#advance").click(); await wait(2300); live(); if (i === 0) await cap("Advance one step moves the clock exactly one step, then pauses. It makes evenly spaced readings easy.", 2600); row(); await wait(900); }
    await cap("Notice the temperature stopped rising while the heater kept running. That flat piece is a plateau: the energy is breaking attractions, not speeding up particles.", 4800);
    $("#tabGraph").click(); setTool("p"); await cap("Now the graph. It starts blank. You place every point yourself by clicking where the reading belongs.", 3000);
    const a = axesOf(cur()); for (const r of cur().rows) { cur().items.push({ k: "p", x: Math.round(+r.t / 6) * 6, y: Math.round(+r.T / 2) * 2 }); drawGraph(); await wait(700); live(); }
    setTool("l"); await cap("Switch to Line. Click the two ends of a straight piece. The plateau should be flat.", 3200);
    const p = cur().items.filter((i) => i.k === "p"); if (p.length > 2) { cur().items.push({ k: "l", x1: p[1].x, y1: p[1].y, x2: p[p.length - 1].x, y2: p[p.length - 1].y }); drawGraph(); } await wait(1600);
    cur().axes = { title: "Heating curve of practice sample", x: "Time (s)", y: "Temperature (°C)" }; syncGraphInputs(); drawGraph(); await cap("Finally, name the graph and label both axes with units. Then do the same for your real samples.", 4000);
    await cap("That is the whole lab. The demo clears itself when it ends.", 2200);
  } catch (e) { if (e.message !== "stop") throw e; }
  setPlaying(false); demo.on = false; $("#demoBar").hidden = true; setTool("p"); pane("data"); restore(JSON.parse(keep)); if (wasOpen) resumeStage();
}

// ---- start ----
(function boot() {
  let sn = null; try { sn = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  if (sn && sn.state && sn.state.stage !== "intro") { restore(sn); say("Welcome back" + (S.student ? ", " + S.student : "") + ". Your work was restored. Use Save / Hand in → Start over if this is a new student.", "warn"); resumeStage(); }
  else { syncAll(); showIntro(); }
  requestAnimationFrame(tick);
})();
$("#reset")?.addEventListener("click", () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); });
window.__hl = { get S() { return S; }, lab, cur, durOf, stateOf, runDemo, record, openCER, setPlaying };
