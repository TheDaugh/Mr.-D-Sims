// The foil apparatus for the Rutherford lab: beam, detector table, the three data questions, the match, the nucleus rebuild and the challenge.
// State lives in S.scat (plain JSON, so it saves and restores). The checks are exported pure functions so a test can run them.
import { h, mulberry32 } from "./dom.js";
import * as FM from "../engine/foil.js";

export const GROUPS = ["straight", "deflected", "rebound"];
const MODEL = { plum: "plum", real: "nuc", mine: "nuc", ch: "nuc" };
const LABEL = { plum: "Plum-pudding model", real: "Real gold foil", mine: "Your nucleus model", ch: "Challenge foil" };
const fmt = (n) => Number(n).toLocaleString("en-US");

export const newScat = () => ({ runs: {}, key: "plum", rate: 2000, firing: false, answers: {}, match: {}, size: 0, ch: { pick: null, pred: null, key: null, done: false }, finished: false });

export function newRun(seed, key, cfg) {
  const r = mulberry32(seed * 7 + { plum: 1, real: 2, mine: 3, ch: 4 }[key]);
  return { key, model: MODEL[key], target: cfg.target || "Au", thick: cfg.thick || 1, n: 0, hist: new Array(FM.BINS).fill(0), stream: { i: 0, r1: r(), r2: r() }, done: false };
}
export const groupSum = (run, g) => FM.sum(run.hist, g);
export function parseNum(s) { const t = String(s).replace(/,/g, "").replace(/\s/g, "").replace(/%/g, "").replace(/^1(in|\/|:)/i, ""); const v = parseFloat(t); return Number.isFinite(v) ? v : null; }
// Check one data answer against the student's own real-foil run.
export function checkData(q, raw, run) {
  const v = parseNum(raw), s = groupSum(run, q.group);
  if (v === null) return { ok: false, want: null, why: "Type a number." };
  if (q.mode === "pct") { const want = (100 * s) / run.n; return { ok: Math.abs(v - want) <= q.tol, want, why: v > 100 || v < 0 ? "A percent runs from 0 to 100." : "" }; }
  if (!s) return { ok: false, want: null, why: "Your run has no rebounds. Check the rows past 90°." };
  const want = run.n / s; return { ok: Math.abs(v - want) / want <= q.relTol, want, why: v < 1 ? "N in \"1 in N\" is at least 1." : "" };
}
export const tallyDone = (sc, lab) => lab.data.every((q) => sc.answers[q.id] && sc.answers[q.id].ok);
export const matchDone = (sc, lab) => lab.match.rows.every((r) => sc.match[r.id] && sc.match[r.id].ok);
export const realRun = (sc) => (sc.runs.real && sc.runs.real.done ? sc.runs.real : null);
// Every count a student could honestly quote: each bin, each group, each total.
export function quotable(sc) {
  const out = new Set();
  // Counts under 10 only count when they are the rebound total or a bin past 90°, so "7" in a sentence cannot match by luck.
  for (const r of Object.values(sc.runs)) { if (!r.n) continue; out.add(r.n); r.hist.forEach((c, i) => { if (c >= 10 || (c > 0 && i >= 9)) out.add(c); }); GROUPS.forEach((g) => { const v = groupSum(r, g); if (v >= 10 || (g === "rebound" && v > 0)) out.add(v); }); }
  return out;
}
export function citesCount(text, sc) {
  const ok = quotable(sc), nums = (String(text).replace(/(\d),(\d)/g, "$1$2").match(/\d+/g) || []).map(Number);
  return nums.some((n) => n >= 2 && ok.has(n));
}
export function evidenceItems(sc) {
  const items = [], span = (b) => `${b * 10}–${b * 10 + 10}°`;
  for (const k of ["plum", "real"]) { const r = sc.runs[k]; if (!r || !r.n) continue;
    items.push(`${LABEL[k]}: ${fmt(r.n)} fired, ${fmt(r.hist[0])} landed at 0–10° (straight through)`);
    if (k === "real") { items.push(`${LABEL[k]}: ${fmt(groupSum(r, "deflected"))} of ${fmt(r.n)} were deflected between 10° and 90°`); items.push(`${LABEL[k]}: ${fmt(groupSum(r, "rebound"))} of ${fmt(r.n)} rebounded past 90°`); const big = r.hist.map((c, i) => [c, i]).filter(([c, i]) => i >= 9 && c > 0)[0]; if (big) items.push(`${LABEL[k]}: ${big[0]} at ${span(big[1])}`); }
    else items.push(`${LABEL[k]}: ${fmt(groupSum(r, "deflected") + groupSum(r, "rebound"))} of ${fmt(r.n)} landed beyond 10°`); }
  return items;
}
export function per100(run) { const t = run.n / 100, hh = run.hist, s = (a, b) => hh.slice(a, b).reduce((x, y) => x + y, 0) / t; return { A: s(0, 1), B: s(1, 3), C: s(3, 9), D: s(9, 18), E: 0 }; }
export function summary(sc) {
  const runs = {}; for (const [k, r] of Object.entries(sc.runs)) runs[k] = { target: r.target, thick: r.thick, n: r.n, done: r.done, hist: r.hist, straight: groupSum(r, "straight"), deflected: groupSum(r, "deflected"), rebound: groupSum(r, "rebound") };
  return { runs, answers: sc.answers, match: sc.match, size: sc.size, challenge: sc.ch };
}

function histCanvas(c, run, ghost, logScale) {
  const g = c.getContext("2d"), W = c.width, H = c.height, L = 38, B = 36, T = 8, bw = (W - L - 6) / FM.BINS;
  g.clearRect(0, 0, W, H); g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); g.font = "11px sans-serif"; g.textBaseline = "middle";
  const max = Math.max(10, ...(run ? run.hist : [0]), ...(ghost ? ghost.hist : [0])), top = logScale ? Math.ceil(Math.log10(max + 1)) : max, y = (v) => H - B - ((H - B - T) * (logScale ? Math.log10(v + 1) : v)) / top;
  g.strokeStyle = "#d0d7de"; g.fillStyle = "#555"; g.textAlign = "right";
  if (logScale) for (let p = 0; p <= top; p++) { const v = Math.pow(10, p) - 1 || 0, yy = y(v); g.beginPath(); g.moveTo(L, yy); g.lineTo(W - 4, yy); g.stroke(); g.fillText(p === 0 ? "0" : "10^" + p, L - 4, yy); }
  else for (let k = 0; k <= 4; k++) { const v = (max * k) / 4, yy = y(v); g.beginPath(); g.moveTo(L, yy); g.lineTo(W - 4, yy); g.stroke(); g.fillText(Math.round(v), L - 4, yy); }
  if (ghost) { g.strokeStyle = "#c0392b"; g.lineWidth = 2; ghost.hist.forEach((v, i) => { if (v > 0) { g.beginPath(); g.moveTo(L + i * bw + 1, y(v)); g.lineTo(L + (i + 1) * bw - 1, y(v)); g.stroke(); } }); g.lineWidth = 1; }
  if (run) run.hist.forEach((v, i) => { if (v > 0) { g.fillStyle = "#2c5aa0"; g.fillRect(L + i * bw + 1, y(v), bw - 2, H - B - y(v)); } });
  g.fillStyle = "#555"; g.textAlign = "center"; for (let i = 0; i < FM.BINS; i += 3) g.fillText(i * 10 + "°", L + i * bw + bw / 2, H - 22);
  g.fillText("angle of hit (degrees)", L + (W - L) / 2, H - 7);
}

export function createScatter(ctx) {
  const { lab, S, log, say } = ctx, A = lab.apparatus, seed = ctx.seed, sc = () => S.scat;
  const notify = () => { refresh(); ctx.onChange && ctx.onChange(); };
  const cfgFor = (key) => (key === "ch" ? { target: sc().ch.cfg.target, thick: sc().ch.cfg.thick } : {});
  function run(key) { return sc().runs[key]; }
  function ensure(key) { if (!run(key)) sc().runs[key] = newRun(seed, key, cfgFor(key)); return run(key); }
  const need = (key) => ({ plum: A.plumNeeded, real: A.realNeeded, mine: A.cap, ch: A.cap }[key]);
  const realUnlocked = () => !!(run("plum") && run("plum").n >= A.plumNeeded);

  // ---- the beam ----
  const beam = h("canvas", { width: 420, height: 150, style: "width:420px;height:150px;border:1px solid var(--line);border-radius:8px;background:#0f1822" });
  const histC = h("canvas", { width: 480, height: 150, style: "width:480px;height:150px;border:1px solid var(--line);border-radius:8px" });
  const flights = []; let carry = 0;
  const logCk = h("input", { type: "checkbox", checked: true, onchange: () => draw() });
  const rate = h("input", { type: "range", min: A.rate.min, max: A.rate.max, step: A.rate.step, value: A.rate.start, "aria-label": "Beam rate", oninput: () => { sc().rate = +rate.value; rateOut.textContent = fmt(rate.value) + " per second"; } });
  const rateOut = h("span", { class: "hint" }, fmt(A.rate.start) + " per second");
  const counter = h("b", { style: "font:700 1.4rem ui-monospace,monospace" }), runLbl = h("div", { style: "font-weight:700" }), note = h("p", { class: "hint", role: "status" });
  const fireBtn = h("button", { class: "primary", onclick: () => toggleFire() }, "Fire");
  const resetBtn = h("button", { onclick: () => startOver() }, "Start this run over");
  function toggleFire() {
    const key = sc().key, r = ensure(key);
    if (r.n >= A.cap) return;
    if (key === "real" && !realUnlocked()) return;
    sc().firing = !sc().firing; if (sc().firing) log.add("scat_fire", { model: key }); notify();
  }
  function startOver() { const key = sc().key; sc().firing = false; delete sc().runs[key]; if (key === "ch") sc().ch.done = false; log.add("scat_reset", { model: key }); say(`${LABEL[key]} cleared. Fire again for a fresh run.`); notify(); }
  function choose(key) { if (sc().firing) sc().firing = false; sc().key = key; ensure(key); notify(); }

  function step(dt) {
    const s = sc(); if (!s.firing) return;
    const r = ensure(s.key); carry += s.rate * dt; const k = Math.min(Math.floor(carry), A.cap - r.n); carry -= Math.floor(carry);
    if (k > 0) {
      let j = 0; const out = FM.fire(r.stream, k, r.model, r.target, r.thick, (a) => { j++; if (a > 10 || j % 40 === 0) flights.push({ a, side: j % 2 ? 1 : -1, born: performance.now() }); });
      out.hist.forEach((c, i) => { r.hist[i] += c; }); r.n += k;
      if (flights.length > 70) flights.splice(0, flights.length - 70);
    }
    const goal = need(s.key); let changed = false;
    if (r.n >= goal && !r.marked) { r.marked = true; r.done = true; log.add("scat_done", { model: s.key, target: r.target, thick: String(r.thick), n: r.n, straight: groupSum(r, "straight"), deflected: groupSum(r, "deflected"), rebound: groupSum(r, "rebound") }); say(`${LABEL[s.key]}: ${fmt(r.n)} particles fired.`, "obs"); changed = true; if (s.key === "ch") s.ch.done = true; if (s.key === "real") say("The real foil is done. Open Find the pattern below.", "obs"); }
    if (r.n >= A.cap) { s.firing = false; changed = true; }
    if (changed) notify();
  }
  function draw() {
    if (!el.isConnected || !el.closest("dialog") || !el.closest("dialog").open) return;
    const g = beam.getContext("2d"), W = 420, H = 150, fx = 220, fy = 75, now = performance.now(), r = run(sc().key);
    g.fillStyle = "#0f1822"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#31465c"; g.beginPath(); g.arc(fx, fy, 66, 0, 7); g.stroke();
    g.fillStyle = "#8a97a6"; g.fillRect(10, fy - 9, 26, 18); g.fillStyle = "#cfe3f5"; g.font = "10px sans-serif"; g.textAlign = "center"; g.fillText("α source", 23, fy + 24);
    g.strokeStyle = sc().firing ? "#7fd6ff" : "#2c4d68"; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(36, fy); g.lineTo(fx - 5, fy); g.stroke(); g.setLineDash([]);
    const col = r && r.model === "plum" ? "#c7a9ff" : "#ffd23f";
    g.fillStyle = col; for (let k = -4; k <= 4; k++) g.fillRect(fx - 3, fy + k * 14 - 2, 6, 4);
    g.fillStyle = "#cfe3f5"; g.fillText(r ? (r.model === "plum" ? "plum-pudding foil" : r.target === "Al" ? "aluminum foil" : "gold foil") : "foil", fx, 142);
    for (let i = flights.length - 1; i >= 0; i--) { const f = flights[i], age = (now - f.born) / 700; if (age > 1) { flights.splice(i, 1); continue; }
      const th = (f.a * Math.PI) / 180 * f.side, len = 66; g.strokeStyle = `rgba(127,214,255,${1 - age})`; g.lineWidth = f.a > 10 ? 2 : 1; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + len * Math.cos(th), fy - len * Math.sin(th)); g.stroke(); }
    g.lineWidth = 1;
    const run0 = sc().key === "mine" ? run("real") : null;
    histCanvas(histC, r, run0, logCk.checked);
  }

  // ---- section 1: pick the model ----
  const seg = h("div", { class: "seg" });
  const unlockNote = h("p", { class: "hint" });
  const reveal = h("div");
  function revealPrediction() {
    const r = realRun(sc()), pl = S.prelab.placement;
    if (!r || !pl) return reveal.replaceChildren();
    const z = lab.prelab.placement.zones, act = per100(r), fm = (v) => (v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(3));
    reveal.replaceChildren(h("h3", {}, "Your prediction against the real foil"), h("table", {}, h("thead", {}, h("tr", {}, h("th", {}, "Where"), h("th", {}, "You placed (of 100)"), h("th", {}, "The real foil gave (per 100)"))),
      h("tbody", {}, z.map((q) => h("tr", {}, h("td", {}, q.label), h("td", {}, pl[q.id] ?? 0), h("td", {}, fm(act[q.id])))))),
      h("p", { class: "hint" }, "Compare the two columns. Where was the real foil closest to your prediction? Where was it very different?"));
  }

  // ---- section: the detector table ----
  const tableBox = h("div", { class: "scrollx" });
  function renderTable() {
    const keys = ["plum", "real", "mine", "ch"].filter((k) => run(k) && run(k).n > 0);
    if (!keys.length) return tableBox.replaceChildren(h("p", { class: "hint" }, "The table fills in as particles hit the detector."));
    const rows = []; for (let b = 0; b < FM.BINS; b++) rows.push(h("tr", {}, h("th", {}, `${b * 10}–${b * 10 + 10}°`), keys.map((k) => h("td", {}, fmt(run(k).hist[b])))));
    tableBox.replaceChildren(h("table", {}, h("thead", {}, h("tr", {}, h("th", {}, "Angle"), keys.map((k) => h("th", {}, LABEL[k])))), h("tbody", {}, rows),
      h("tfoot", {}, h("tr", {}, h("th", {}, "Total fired"), keys.map((k) => h("th", {}, fmt(run(k).n)))))));
  }

  // ---- section 2: find the pattern ----
  const tallyBox = h("div");
  function renderTally() {
    const r = realRun(sc()); tallyBox.replaceChildren();
    if (!r) return tallyBox.append(h("p", { class: "hint" }, "Locked until the real gold foil run reaches 20,000 particles."));
    tallyBox.append(h("p", { class: "hint" }, "Use the Real foil column of the table. Add the rows you need. Hints point back at the table, they never give the number."));
    for (const q of lab.data) {
      const a = sc().answers[q.id] || {}, inp = h("input", { type: "text", inputmode: "decimal", style: "width:9em", value: a.val ?? "", disabled: !!a.ok, "aria-label": q.id }), fb = h("div", { class: "fb" + (a.msg ? " show " + (a.ok ? "ok" : "no") : ""), role: "status" }, a.msg || "");
      const go = h("button", { disabled: !!a.ok, onclick: () => {
        const c = checkData(q, inp.value, r), prev = sc().answers[q.id] || { tries: 0 }; if (!inp.value.trim()) return;
        sc().answers[q.id] = { val: inp.value.trim(), ok: c.ok, tries: prev.tries + 1, msg: c.ok ? "Correct." : (c.why ? c.why + " " : "Not quite. ") + q.hint };
        log.add("scat_answer", { q: q.id, val: inp.value.trim(), ok: c.ok, tries: prev.tries + 1 }); notify();
      } }, "Check");
      tallyBox.append(h("div", { class: "pq" }, h("p", {}, q.q), h("div", { class: "controls" }, inp, h("span", {}, q.mode === "pct" ? "%" : "(N)"), go), fb));
    }
  }

  // ---- section 3: match ----
  const matchBox = h("div");
  function renderMatch() {
    matchBox.replaceChildren(); if (!tallyDone(sc(), lab)) return matchBox.append(h("p", { class: "hint" }, "Locked until the three data questions are right."));
    for (const row of lab.match.rows) {
      const m = sc().match[row.id] || {}, sel = h("select", { disabled: !!m.ok, "aria-label": row.result }, h("option", { value: "" }, "— choose —"), lab.match.meanings.map((x) => h("option", { value: x.id, selected: m.choice === x.id ? "" : null }, x.text)));
      const fb = h("div", { class: "fb" + (m.msg ? " show " + (m.ok ? "ok" : "no") : ""), role: "status" }, m.msg || "");
      sel.addEventListener("change", () => { if (!sel.value) return; const ok = sel.value === row.answer, prev = sc().match[row.id] || { tries: 0 };
        sc().match[row.id] = { choice: sel.value, ok, tries: prev.tries + 1, msg: ok ? "Yes." : "Not quite. " + row.hint }; log.add("scat_match", { row: row.id, choice: sel.value, ok, tries: prev.tries + 1 }); notify(); });
      matchBox.append(h("div", { class: "pq" }, h("p", {}, h("b", {}, row.result), " means "), sel, fb));
    }
  }

  // ---- section 4: rebuild ----
  const SIZES = [100, 50, 20, 5, 1, 0.1, 0.001];
  const atomSvg = h("div"), sizeIn = h("input", { type: "range", min: 0, max: SIZES.length - 1, step: 1, value: 0, "aria-label": "Size of the positive region", oninput: () => { sc().size = +sizeIn.value; log.add("scat_size", { pct: SIZES[+sizeIn.value] }); refresh(); } });
  const sizeOut = h("p"), runMine = h("button", { class: "primary", onclick: () => { sc().key = "mine"; ensure("mine"); sc().firing = true; log.add("scat_fire", { model: "mine" }); notify(); window.scrollTo(0, 0); el.closest(".body").scrollTop = 0; } }, "Run your nucleus model");
  const rebuildNote = h("p", { class: "hint", role: "status" });
  function drawAtom() {
    const p = SIZES[sc().size], rad = Math.max(2.5, 70 * Math.sqrt(p / 100)), plum = p >= 20;
    atomSvg.innerHTML = `<svg viewBox="0 0 200 160" width="260" height="208" role="img" aria-label="Atom with a positive region that is ${p} percent of the atom's width"><circle cx="100" cy="80" r="74" fill="${plum ? "#f4d9dd" : "#fbf5f6"}" stroke="#a9858b" stroke-width="2"/><circle cx="100" cy="80" r="${rad}" fill="#e57a86" stroke="#9c2c3b" stroke-width="1.5"/><text x="100" y="${80 + 4}" font-size="11" text-anchor="middle" fill="#5b0f1a">+</text>${[[52, 45], [150, 50], [60, 118], [143, 112], [100, 18], [100, 142]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#2c5aa0"/>`).join("")}</svg>`;
    sizeOut.textContent = `Positive charge squeezed into ${p}% of the atom's width.`;
  }
  function renderRebuild() {
    const unlocked = matchDone(sc(), lab); drawAtom(); sizeIn.disabled = !unlocked; sizeIn.value = sc().size;
    const small = SIZES[sc().size] <= 1; runMine.disabled = !(unlocked && small) || (run("mine") && run("mine").done);
    const m = run("mine");
    rebuildNote.textContent = !unlocked ? "Locked until the match is right." : m && m.done ? "Your nucleus model is done. In the histogram, the red lines are the real foil's counts; the blue bars are your model's. Do they agree?" : small ? "Run it. The detector will use your nucleus." : "Squeeze the positive charge smaller. The pudding is too soft to push an alpha particle hard, so keep going until it is a tiny dot.";
  }

  // ---- section 5: challenge ----
  const chBox = h("div");
  function renderChallenge() {
    const C = lab.challenge, ch = sc().ch; chBox.replaceChildren(h("p", {}, C.prompt));
    if (!(run("mine") && run("mine").done)) return chBox.append(h("p", { class: "hint" }, "Opens after you have rebuilt the atom."));
    const locked = !!ch.key;
    const pick = h("div", { class: "opts" }, C.change.map((c) => h("label", { class: "ck" }, h("input", { type: "radio", name: "chp", checked: ch.pick === c.id ? "" : null, disabled: locked, onchange: () => { ch.pick = c.id; refresh(); } }), c.text)));
    const pred = h("div", { class: "opts" }, C.predictions.map((c) => h("label", { class: "ck" }, h("input", { type: "radio", name: "chq", checked: ch.pred === c.id ? "" : null, disabled: locked, onchange: () => { ch.pred = c.id; refresh(); } }), c.text)));
    const go = h("button", { class: "primary", disabled: locked || !ch.pick || !ch.pred, onclick: () => { const c = C.change.find((x) => x.id === ch.pick); ch.key = ch.pick; ch.cfg = { target: c.target, thick: c.thick }; delete sc().runs.ch; sc().key = "ch"; ensure("ch"); sc().firing = true; log.add("scat_predict_ch", { change: ch.pick, pred: ch.pred }); log.add("scat_fire", { model: "ch" }); notify(); el.closest(".body").scrollTop = 0; } }, "Lock in my prediction and fire");
    chBox.append(h("h4", {}, "1. What do you change?"), pick, h("h4", {}, "2. What happens to the number of large deflections (10° and up) compared with the normal gold foil?"), pred, go);
    const r = run("ch"), real = realRun(sc());
    if (ch.done && r && real) {
      const big = (x) => groupSum(x, "deflected") + groupSum(x, "rebound"), ratio = big(r) / Math.max(1, big(real)), actual = ratio > 1.3 ? "more" : ratio < 0.7 ? "fewer" : "same";
      const ok = actual === ch.pred; ch.result = { ratio: +ratio.toFixed(2), actual, ok };
      chBox.append(h("div", { class: "fb show " + (ok ? "ok" : "no") }, `You predicted: ${C.predictions.find((x) => x.id === ch.pred).text}. Result: ${fmt(big(r))} large deflections in ${fmt(r.n)} particles, against ${fmt(big(real))} in ${fmt(real.n)} for the normal gold foil (${ratio.toFixed(2)} times as many). ${ok ? "Your prediction held." : "Your prediction missed."} ${C.why[ch.pick]}`));
    }
  }

  // ---- finish ----
  const finishBtn = h("button", { class: "primary", onclick: () => ctx.onFinish() }, "I'm done with the apparatus → write the CER");
  const finishNote = h("span", { class: "hint" });
  const needDone = () => !!(run("plum") && run("plum").n >= A.plumNeeded && realRun(sc()) && tallyDone(sc(), lab) && matchDone(sc(), lab) && run("mine") && run("mine").done);

  const top = h("div", { style: "position:sticky;top:0;z-index:3;background:var(--panel);padding:6px 0;border-bottom:1px solid var(--line)" },
    h("div", { style: "display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start" }, beam, histC,
      h("div", { style: "min-width:200px" }, runLbl, h("div", {}, "Fired: ", counter), h("label", { class: "hint", style: "display:block" }, "Beam rate ", rate), rateOut, h("div", { class: "controls" }, fireBtn, resetBtn), h("label", { class: "ck hint" }, logCk, "Log scale on the bars"))), note);
  const sec = (t, ...kids) => h("details", { open: true }, h("summary", {}, h("b", {}, t)), ...kids);
  const secRun = sec("1 · Run it", h("p", {}, "Run the plum-pudding model first. Then the real gold foil unlocks. The detector files every hit under its angle."), seg, unlockNote, reveal);
  const secTable = sec("Detector table", tableBox);
  const secTally = sec("2 · Find the pattern", tallyBox), secMatch = sec("3 · What each result showed", matchBox);
  const secRebuild = sec("4 · Rebuild the atom", h("div", { style: "display:flex;gap:18px;flex-wrap:wrap;align-items:center" }, atomSvg, h("div", {}, h("p", {}, "Slide to pull the positive charge together. The electrons stay where they are."), sizeIn, sizeOut, runMine, rebuildNote)));
  const secCh = sec("Challenge (optional, for the gold badge)", chBox);
  const el = h("div", {}, top, secRun, secTable, secTally, secMatch, secRebuild, secCh, h("div", { class: "controls foot" }, finishBtn, finishNote));

  function refresh() {
    const s = sc(), r = run(s.key), key = s.key;
    seg.replaceChildren(...["plum", "real"].map((k) => h("button", { class: key === k ? "on" : "", disabled: k === "real" && !realUnlocked(), onclick: () => choose(k) }, k === "plum" ? "Plum pudding" : "Real gold foil")));
    unlockNote.textContent = realUnlocked() ? "" : `The real foil unlocks when the plum-pudding run reaches ${fmt(A.plumNeeded)} particles.`;
    runLbl.textContent = LABEL[key] + (r && r.model === "nuc" && key !== "mine" ? (r.target === "Al" ? " · aluminum" : "") + (r.thick > 1 ? " · double thickness" : "") : "");
    counter.textContent = `${fmt(r ? r.n : 0)} / ${fmt(key === "plum" || key === "real" || key === "mine" || key === "ch" ? (key === "plum" ? A.cap : need(key)) : A.cap)}`;
    const full = r && r.n >= A.cap;
    fireBtn.textContent = s.firing ? "Pause" : r && r.n > 0 && !full ? "Resume" : "Fire"; fireBtn.disabled = !!full || (key === "real" && !realUnlocked());
    resetBtn.disabled = !r || r.n === 0 || (key === "plum" && false);
    note.textContent = key === "plum" ? (r && r.n >= A.plumNeeded ? "Plum-pudding run recorded. Look at the table, then unlock the real foil." : `Fire until the counter reaches ${fmt(A.plumNeeded)}.`) : key === "real" ? "The real foil needs the full 20,000 particles." : "";
    renderTable(); revealPrediction(); renderTally(); renderMatch(); renderRebuild(); renderChallenge();
    finishBtn.disabled = !needDone(); finishNote.textContent = needDone() ? "" : "Finish the plum run, the real run, the data questions, the match and the rebuild first.";
    draw();
  }
  refresh();
  return { el, refresh, step, draw, needDone, stop() { sc().firing = false; } };
}
