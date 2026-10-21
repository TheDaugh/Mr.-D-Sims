// The foil apparatus for the Rutherford lab: beam, detector table, the three data questions, the match, the nucleus rebuild and the challenge.
// State lives in S.scat (plain JSON, so it saves and restores). The checks are exported pure functions so a test can run them.
import { h, mulberry32 } from "./dom.js";
import * as FM from "../engine/foil.js";
import { createAtomScope, newScope } from "./atomscope.js";
import { ELEMENTS, element } from "../engine/coulomb.js";
export const DEFAULT = { target: "Au", thick: 1, E: 5 };

export const GROUPS = ["straight", "deflected", "rebound"];
const MODEL = { plum: "plum", real: "nuc", mine: "nuc", ch: "nuc" };
const LABEL = { plum: "Plum-pudding model", real: "Real gold foil", mine: "Your nucleus model", ch: "Challenge foil" };
const fmt = (n) => Number(n).toLocaleString("en-US");

export const newScat = () => ({ runs: {}, key: "plum", rate: 2000, firing: false, answers: {}, match: {}, size: 0, ch: { sel: { ...DEFAULT }, pred: null, key: null, done: false }, scope: newScope(), finished: false });

export function fixScat(sc) { if (!sc.scope) sc.scope = newScope(); if (!sc.ch.sel) sc.ch.sel = { ...DEFAULT }; return sc; }
export function newRun(seed, key, cfg) {
  const r = mulberry32(seed * 7 + { plum: 1, real: 2, mine: 3, ch: 4 }[key]);
  return { key, model: MODEL[key], target: cfg.target || "Au", thick: cfg.thick || 1, E: cfg.E || 5, n: 0, hist: new Array(FM.BINS).fill(0), stream: { i: 0, r1: r(), r2: r() }, done: false };
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
  const runs = {}; for (const [k, r] of Object.entries(sc.runs)) runs[k] = { target: r.target, thick: r.thick, E: r.E, n: r.n, done: r.done, hist: r.hist, straight: groupSum(r, "straight"), deflected: groupSum(r, "deflected"), rebound: groupSum(r, "rebound") };
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
  const cfgFor = (key) => (key === "ch" ? { ...sc().ch.cfg } : { ...DEFAULT });
  function run(key) { return sc().runs[key]; }
  function ensure(key) { if (!run(key)) sc().runs[key] = newRun(seed, key, cfgFor(key)); return run(key); }
  const need = (key) => ({ plum: A.plumNeeded, real: A.realNeeded, mine: A.cap, ch: A.cap }[key]);
  const realUnlocked = () => !!(run("plum") && run("plum").n >= A.plumNeeded);

  // ---- the beam ----
  const beam = h("canvas", { width: 460, height: 190, style: "width:460px;height:190px;border:1px solid var(--line);border-radius:8px;background:#0f1822" });
  const histC = h("canvas", { width: 440, height: 190, style: "width:440px;height:190px;border:1px solid var(--line);border-radius:8px" });
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
  function startOver() { const key = sc().key; sc().firing = false; delete sc().runs[key]; if (key === "ch") Object.assign(sc().ch, { key: null, done: false, result: null, cfg: null }); log.add("scat_reset", { model: key }); say(`${LABEL[key]} cleared. Fire again for a fresh run.`); notify(); }
  function choose(key) { if (sc().firing) sc().firing = false; sc().key = key; ensure(key); notify(); }

  function step(dt) {
    scope.tick(dt);
    const s = sc(); if (!s.firing) return;
    const r = ensure(s.key); carry += s.rate * dt; const k = Math.min(Math.floor(carry), A.cap - r.n); carry -= Math.floor(carry);
    if (k > 0) {
      let j = 0; const out = FM.fire(r.stream, k, r.model, r.target, r.thick, (a) => { j++; if (a > 10 || j % 40 === 0) flights.push({ a, side: j % 2 ? 1 : -1, born: performance.now() }); }, r.E);
      out.hist.forEach((c, i) => { r.hist[i] += c; }); r.n += k;
      if (flights.length > 70) flights.splice(0, flights.length - 70);
    }
    const goal = need(s.key); let changed = false;
    if (r.n >= goal && !r.marked) { r.marked = true; r.done = true; log.add("scat_done", { model: s.key, target: r.target, thick: String(r.thick), E: r.E, n: r.n, straight: groupSum(r, "straight"), deflected: groupSum(r, "deflected"), rebound: groupSum(r, "rebound") }); say(`${LABEL[s.key]}: ${fmt(r.n)} particles fired.`, "obs"); changed = true; if (s.key === "ch") s.ch.done = true; if (s.key === "real") say("The real foil is done. Open Find the pattern below.", "obs"); }
    if (r.n >= A.cap) { s.firing = false; changed = true; }
    if (changed) notify();
  }
  function draw() {
    if (!el.isConnected || !el.closest("dialog") || !el.closest("dialog").open) return;
    const g = beam.getContext("2d"), W = 460, H = 190, SH = 158, now = performance.now(), r = run(sc().key), plum = r && r.model === "plum";
    // A small 3D camera: world x right, y away, z up. Yaw 0.5 rad, pitch 0.55 rad, orthographic. Visible box faces: top, -y, +x.
    const cy = Math.cos(0.5), sy = Math.sin(0.5), cp = Math.cos(0.42), sp = Math.sin(0.42), S = 0.74, ox = 232, oy = 108;
    const P = (x, y, z) => { const u = x * cy + y * sy, v = -x * sy + y * cy; return [ox + u * S, oy - (z * cp + v * sp) * S]; };
    const poly = (pts, fill, stroke) => { g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); } };
    const shade = (c, f) => { const n = parseInt(c.slice(1), 16); return `rgb(${Math.min(255, ((n >> 16) & 255) * f) | 0},${Math.min(255, ((n >> 8) & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
    const box = (x, y, z, w, d, hh, c, edge) => { const e = edge || "rgba(0,0,0,.35)";
      poly([P(x, y, z), P(x + w, y, z), P(x + w, y, z + hh), P(x, y, z + hh)], shade(c, 0.85), e);                      // front (-y)
      poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + hh), P(x + w, y, z + hh)], shade(c, 0.6), e);        // right (+x)
      poly([P(x, y, z + hh), P(x + w, y, z + hh), P(x + w, y + d, z + hh), P(x, y + d, z + hh)], shade(c, 1.15), e); };  // top
    const ringPts = (R, z, a0, a1, n = 40) => { const o = []; for (let k = 0; k <= n; k++) { const t = a0 + ((a1 - a0) * k) / n; o.push(P(R * Math.cos(t), R * Math.sin(t), z)); } return o; };
    // which half of a ring is behind the middle? the half with larger depth v (sin(t) > tan(yaw) * cos(t) direction); angles are found by sampling
    const behind = (t) => -Math.cos(t) * sy + Math.sin(t) * cy > 0;
    const arcWall = (R, z0, z1, wantBehind, fill) => { const n = 60; for (let k = 0; k < n; k++) { const t0 = (Math.PI * 2 * k) / n, t1 = (Math.PI * 2 * (k + 1)) / n; if (behind((t0 + t1) / 2) !== wantBehind) continue; poly([P(R * Math.cos(t0), R * Math.sin(t0), z0), P(R * Math.cos(t1), R * Math.sin(t1), z0), P(R * Math.cos(t1), R * Math.sin(t1), z1), P(R * Math.cos(t0), R * Math.sin(t0), z1)], fill); } };
    // backdrop and floor
    const bg = g.createLinearGradient(0, 0, 0, SH); bg.addColorStop(0, "#161d27"); bg.addColorStop(1, "#0d1219"); g.fillStyle = bg; g.fillRect(0, 0, W, SH);
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(ox + 4, oy + 42, 175, 26, 0, 0, 7); g.fill();
    // table: four legs, then top slab
    for (const [lx, ly] of [[-140, -70], [150, -70], [-140, 64], [150, 64]]) box(lx - 6, ly - 6, -30, 12, 12, 30, "#5a3b22");
    box(-160, -84, -6, 330, 164, 6, "#8a5d36");
    // vacuum pump on the table's right
    box(120, -50, 0, 38, 40, 22, "#2f7d4f"); box(126, -44, 22, 26, 28, 6, "#1d2630"); poly([P(120, -30, 12), P(90, -30, 12), P(90, -30, 14), P(120, -30, 14)], "#c9ced6");
    poly(ringPts(117, 0, 0, Math.PI * 2), "#3a4350", "#69737f"); poly(ringPts(111, 1, 0, Math.PI * 2), "#222a33");   // base plate of the jar
    // zinc-sulfide screen: back half of the green wall first
    arcWall(92, 0, 14, true, "#2a8a48");
    // lead block with a slit, and the foil stand
    box(-128, -14, 0, 26, 28, 22, "#8b929b"); { const a = P(-102, -2, 8), b = P(-102, 2, 14), c2 = P(-102, 2, 8); poly([a, c2, b, P(-102, -2, 14)], "#0b121a"); }
    box(-12, -40, 0, 4, 4, 28, "#5d646d"); box(-12, 36, 0, 4, 4, 28, "#5d646d");
    const foilCol = plum ? "#e8a3c3" : r && r.target !== "Au" ? "#c4ccd4" : "#f0c640";
    box(-2, -38, 3, 3, 76, 26, foilCol, "rgba(255,255,255,.5)");
    // beam
    const [sx, sy2] = P(-102, 0, 11), [fx, fy] = P(0, 0, 11); g.strokeStyle = sc().firing ? "#8fe0ff" : "#2c5d7a"; g.lineWidth = sc().firing ? 2.5 : 1.5; g.setLineDash([6, 3]); g.beginPath(); g.moveTo(sx, sy2); g.lineTo(fx, fy); g.stroke(); g.setLineDash([]);
    // tracks and flashes
    for (let k = flights.length - 1; k >= 0; k--) { const f = flights[k], age = (now - f.born) / 900; if (age > 1) { flights.splice(k, 1); continue; }
      const th = (f.a * Math.PI) / 180, X = 90 * Math.cos(th), Y = 90 * Math.sin(th) * f.side, [ex, ey] = P(X, Y, 11), [tx, ty] = P(X, Y, 7);
      g.strokeStyle = `rgba(140,225,255,${1 - age})`; g.lineWidth = f.a > 10 ? 2.5 : 1.2; g.beginPath(); g.moveTo(fx, fy); g.lineTo(ex, ey); g.stroke();
      const gl = g.createRadialGradient(tx, ty, 0, tx, ty, f.a > 10 ? 11 : 7); gl.addColorStop(0, `rgba(210,255,190,${1 - age})`); gl.addColorStop(1, "rgba(120,255,120,0)"); g.fillStyle = gl; g.beginPath(); g.arc(tx, ty, f.a > 10 ? 11 : 7, 0, 7); g.fill(); }
    g.lineWidth = 1;
    // front half of the screen wall, with a bright top edge
    arcWall(92, 0, 14, false, "#38b060"); g.strokeStyle = "#8be8a8"; g.beginPath(); ringPts(92, 14, 0, Math.PI * 2).forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    // vacuum jar: base collar, glass body (back wall tint, front tint), dome and rim, highlights
    const JR = 112, JH = 66, base = ringPts(JR, 0, 0, Math.PI * 2), top = ringPts(JR, JH, 0, Math.PI * 2);
    const xs = base.map((q) => q[0]), L = Math.min(...xs), Rr = Math.max(...xs), ysb = base.map((q) => q[1]), yst = top.map((q) => q[1]);
    const gl2 = g.createLinearGradient(L, 0, Rr, 0); gl2.addColorStop(0, "rgba(190,225,255,.30)"); gl2.addColorStop(0.35, "rgba(190,225,255,.07)"); gl2.addColorStop(0.8, "rgba(190,225,255,.10)"); gl2.addColorStop(1, "rgba(190,225,255,.32)");
    g.fillStyle = gl2; g.beginPath(); g.moveTo(L, base[Math.round(base.findIndex((q) => q[0] === L))][1]); for (const [x, y] of top) g.lineTo(x, y); g.lineTo(Rr, ysb[xs.indexOf(Rr)]); for (let k = base.length - 1; k >= 0; k--) g.lineTo(base[k][0], base[k][1]); g.closePath(); g.fill();
    g.strokeStyle = "rgba(205,232,255,.75)"; g.lineWidth = 1.5; g.beginPath(); top.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
    g.beginPath(); base.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
    const tl = top[top.findIndex((q) => q[0] === L)], tr = top[xs.indexOf(Rr) % top.length], bl = base[xs.indexOf(L)], br = base[xs.indexOf(Rr)];
    g.beginPath(); g.moveTo(tl[0], tl[1]); g.lineTo(bl[0], bl[1]); g.moveTo(tr[0], tr[1]); g.lineTo(br[0], br[1]); g.stroke();
    // dome cap and highlights
    const cx0 = (L + Rr) / 2, cyT = (tl[1] + tr[1]) / 2; g.strokeStyle = "rgba(205,232,255,.55)"; g.beginPath(); g.ellipse(cx0, cyT, (Rr - L) / 2, 26, 0, Math.PI, Math.PI * 2); g.stroke(); g.fillStyle = "rgba(190,225,255,.06)"; g.fill();
    g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 3; g.beginPath(); g.moveTo(L + 16, tl[1] + 8); g.lineTo(L + 14, bl[1] - 12); g.stroke(); g.lineWidth = 1;
    // label strip below the scene (kept clear of the picture)
    g.fillStyle = "#0a0f15"; g.fillRect(0, SH, W, H - SH); g.font = "10px sans-serif"; g.textAlign = "left"; g.textBaseline = "middle";
    const lg = [["#8b929b", "lead block: radon source"], [foilCol, (plum ? "plum-pudding" : r ? FM.TARGETS[r.target].name.toLowerCase() : "gold") + " foil"], ["#38b060", "green wall: flash screen"]]; let lx0 = 8;
    for (const [c, t] of lg) { g.fillStyle = c; g.fillRect(lx0, SH + 7, 9, 9); g.fillStyle = "#cfe3f5"; g.fillText(t, lx0 + 13, SH + 12); lx0 += 14 + g.measureText(t).width + 12; }
    g.fillStyle = "#cfe3f5"; g.fillText("glass jar: vacuum, so air cannot stop the alphas", 8, SH + 26);
    g.fillStyle = "#1c2b1c"; g.fillRect(W - 96, SH + 14, 88, 18); g.fillStyle = "#9fe870"; g.font = "bold 13px ui-monospace,monospace"; g.textAlign = "right"; g.fillText(String(r ? r.n : 0).padStart(6, "0"), W - 12, SH + 24); g.font = "9px sans-serif"; g.fillStyle = "#cfe3f5"; g.fillText("fired", W - 100, SH + 24); g.textBaseline = "alphabetic";
    const run0 = sc().key === "mine" ? run("real") : null;
    histCanvas(histC, r, run0, logCk.checked); scope.draw();
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

  // ---- section 5: challenge: set up your own experiment ----
  const chBox = h("div");
  const same = (a, b) => a.target === b.target && a.thick === b.thick && a.E === b.E;
  const factor = (c) => FM.A(c.target, c.thick, c.E) / FM.A(DEFAULT.target, DEFAULT.thick, DEFAULT.E);
  function whyText(c) {
    const t = FM.TARGETS[c.target], d = FM.TARGETS[DEFAULT.target], f = (v) => (v >= 10 ? v.toFixed(0) : v.toFixed(2)).replace(/\.?0+$/, "");
    return `Large deflections scale as (protons)² × (atoms per area) × (thickness) ÷ (alpha energy)². Against 5 MeV gold at normal thickness: charge (${t.Z}/${d.Z})² = ×${f(Math.pow(t.Z / d.Z, 2))}; atoms per cm³ ×${f(t.n / d.n)}; thickness ×${f(c.thick / DEFAULT.thick)}; energy (5/${c.E})² = ×${f(Math.pow(5 / c.E, 2))}. Together: ×${f(factor(c))}.`;
  }
  function renderChallenge() {
    const C = lab.challenge, ch = sc().ch, sel = ch.sel || (ch.sel = { ...DEFAULT }); chBox.replaceChildren(h("p", {}, C.prompt));
    if (!(run("mine") && run("mine").done)) return chBox.append(h("p", { class: "hint" }, "Opens after you have rebuilt the atom."));
    const locked = !!ch.key;
    const elSel = h("select", { disabled: locked, "aria-label": "Foil element", onchange: () => { sel.target = elSel.value; refresh(); } }, Object.entries(FM.TARGETS).map(([k, t]) => h("option", { value: k, selected: sel.target === k ? "" : null }, `${t.name} (Z = ${t.Z})`)));
    const eIn = h("input", { type: "range", min: 3, max: 10, step: 0.5, value: sel.E, disabled: locked, "aria-label": "Alpha energy", oninput: () => { sel.E = +eIn.value; eOut.textContent = sel.E.toFixed(1) + " MeV"; renderChallengeBtn(); } }), eOut = h("b", {}, sel.E.toFixed(1) + " MeV");
    const thSel = h("select", { disabled: locked, "aria-label": "Foil thickness", onchange: () => { sel.thick = +thSel.value; refresh(); } }, [0.5, 1, 2].map((t) => h("option", { value: t, selected: sel.thick === t ? "selected" : null }, t === 1 ? "normal (about 0.4 µm)" : t < 1 ? "half as thick" : "twice as thick")));
    const pred = h("div", { class: "opts" }, C.predictions.map((c) => h("label", { class: "ck" }, h("input", { type: "radio", name: "chq", checked: ch.pred === c.id ? "" : null, disabled: locked, onchange: () => { ch.pred = c.id; renderChallengeBtn(); } }), c.text)));
    const go = h("button", { class: "primary", onclick: () => { ch.key = "set"; ch.cfg = { target: sel.target, thick: sel.thick, E: sel.E }; delete sc().runs.ch; sc().key = "ch"; ensure("ch"); sc().firing = true; log.add("scat_predict_ch", { target: sel.target, thick: String(sel.thick), E: sel.E, pred: ch.pred }); log.add("scat_fire", { model: "ch" }); notify(); el.closest(".body").scrollTop = 0; } }, "Lock in my prediction and fire");
    function renderChallengeBtn() { go.disabled = locked || !ch.pred || same(sel, DEFAULT); hintBtn.textContent = same(sel, DEFAULT) ? "Change at least one setting from the normal setup (gold, 5 MeV, normal thickness)." : ""; }
    const hintBtn = h("p", { class: "hint" });
    chBox.append(h("div", { class: "controls" }, h("label", {}, "Foil element ", elSel), h("label", {}, "Alpha energy ", eOut, " ", eIn), h("label", {}, "Foil thickness ", thSel)),
      h("p", { class: "hint" }, "The real source (radon's decay products) gave about 7.7 MeV, and Rutherford's team also tried other metals and thicknesses. Alpha particles are particles, not light: the knob that matters is their energy, which sets their speed. At 5 MeV the de Broglie wavelength is about 1 fm, smaller than a nucleus, so treating them as small charged balls is fair."),
      h("h4", {}, "What happens to the number of large deflections (10° and up) compared with the normal setup?"), pred, go, hintBtn);
    renderChallengeBtn();
    const r = run("ch"), real = realRun(sc());
    if (ch.done && r && real) {
      const big = (x) => groupSum(x, "deflected") + groupSum(x, "rebound"), ratio = big(r) / Math.max(1, big(real)), actual = ratio > 1.3 ? "more" : ratio < 0.7 ? "fewer" : "same";
      const ok = actual === ch.pred; ch.result = { ratio: +ratio.toFixed(2), actual, ok };
      chBox.append(h("div", { class: "fb show " + (ok ? "ok" : "no") }, `You predicted: ${C.predictions.find((x) => x.id === ch.pred).text}. Result: ${fmt(big(r))} large deflections in ${fmt(r.n)} particles, against ${fmt(big(real))} in ${fmt(real.n)} for the normal setup (${ratio.toFixed(2)} times as many). ${ok ? "Your prediction held." : "Your prediction missed."} ${whyText(r)}`));
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
  const scope = createAtomScope({ state: () => S.scat.scope, onShot: (d) => { log.add("scat_shot", d); ctx.onChange && ctx.onChange(); } });
  const matchBtn = h("button", { onclick: () => { const r = run(sc().key), c = r ? element(r.target) : element("Au"); scope.sync({ model: r && r.model === "plum" ? "plum" : "nuc", Z: c.Z, N: c.A - c.Z, E: r ? r.E : 5 }); } }, "Match the foil in the beam");
  const secScope = sec("Atom microscope: what one alpha particle does inside the foil", h("p", {}, "Zoom into one atom of the foil. Click the black field to fire an alpha at that height, or fire a beam. Try the nuclear scale and aim close to the nucleus's centerline. Change the protons, the neutrons and the alpha energy and watch the forces."), matchBtn, scope.el);
  const secTable = sec("Detector table", tableBox);
  const secTally = sec("2 · Find the pattern", tallyBox), secMatch = sec("3 · What each result showed", matchBox);
  const secRebuild = sec("4 · Rebuild the atom", h("div", { style: "display:flex;gap:18px;flex-wrap:wrap;align-items:center" }, atomSvg, h("div", {}, h("p", {}, "Slide to pull the positive charge together. The electrons stay where they are."), sizeIn, sizeOut, runMine, rebuildNote)));
  const secCh = sec("Challenge (optional, for the gold badge)", chBox);
  const el = h("div", {}, top, secRun, secScope, secTable, secTally, secMatch, secRebuild, secCh, h("div", { class: "controls foot" }, finishBtn, finishNote));

  function refresh() {
    const s = sc(), r = run(s.key), key = s.key;
    seg.replaceChildren(...["plum", "real"].map((k) => h("button", { class: key === k ? "on" : "", disabled: k === "real" && !realUnlocked(), onclick: () => choose(k) }, k === "plum" ? "Plum pudding" : "Real gold foil")));
    unlockNote.textContent = realUnlocked() ? "" : `The real foil unlocks when the plum-pudding run reaches ${fmt(A.plumNeeded)} particles.`;
    runLbl.textContent = LABEL[key] + (key === "ch" && r ? ` · ${FM.TARGETS[r.target].name}, ${r.E} MeV, ${r.thick === 1 ? "normal" : r.thick + "×"} thickness` : "");
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
  return { el, refresh, step, draw, needDone, scope, focusScope() { secScope.open = true; secScope.scrollIntoView(); }, stop() { sc().firing = false; scope.stop(); } };
}
