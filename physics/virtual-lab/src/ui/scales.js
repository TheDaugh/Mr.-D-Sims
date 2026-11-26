// Lab 6 UI: the Spring Scale Bench. One spring scale, four rigs, one screen.
//   Part A: hang known masses on the scale beside a ruler, record the stretches, find k. After that the scale reads in newtons.
//   Part B: the scale goes into the string of a cart on a table pulled by a hanging mass: held still, then released (predict first).
//   Part C: the Hyatt skywalk model, two walkways on rods: read the rods and the upper nut in the design on paper and the design as built.
//   Part D: a hanging chain with mass and a bucket: move the scale from gap to gap, predict the top, then read it.
// Three checkpoints on the shared rule (shared/virtual-lab/checkpoint.js), one notes huddle in the middle, locked mode.
// It answers the same calls as the other "kind" labs (chemistry/virtual-lab/src/ui/zeff.js), so the shared app hosts it.
// Every word a student sees is in content/labs/06-spring-scales.json. The model and the questions are src/engine/scales.js.
import { h } from "../../../../shared/virtual-lab/dom.js";
import * as CK from "../../../../shared/virtual-lab/checkpoint.js";
import * as E from "../engine/scales.js";

export const demoTotal = 10;
export const chestQuests = [];
const CSS = `.ssRoot{display:grid;grid-template-columns:310px 1fr 262px;gap:14px;height:620px;position:relative;font-size:13px;color:#1e2630}
#stage:has(#demoBar:not([hidden])) .ssRoot{height:572px}.ssRoot h3{margin:0 0 4px;font-size:13.5px}.ssCol{overflow:auto;padding-right:2px}
.ssCard{margin:0 0 10px;padding:8px 10px;border:1px solid #c9d3de;border-radius:8px;background:#fff}.ssCard p{margin:4px 0}
.ssRoot .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:5px 0}.ssRoot button{min-height:30px}.ssRoot button.on{outline:3px solid #ffd23f;font-weight:700}
.ssRoot input[type=text]{background:#fff;color:#1e2630;border:1px solid #8fa0b3;border-radius:6px;padding:5px 7px;font:600 15px system-ui,sans-serif;width:6em}
.ssTabs{display:flex;gap:6px;margin:0 0 6px}.ssTabs button{flex:1}.ssMid{display:flex;flex-direction:column;min-width:0}
.ssRig{flex:1;min-height:0;position:relative;background:#f4f7fa;border:1px solid #c9d3de;border-radius:10px}.ssRig svg{position:absolute;inset:4px;width:calc(100% - 8px);height:calc(100% - 8px)}#ssRight{padding-top:30px}
.ssDial{background:#1b2531;color:#9fe870;border-radius:10px;padding:10px;text-align:center;font:700 28px ui-monospace,Menlo,monospace}.ssDial small{display:block;font:600 11px system-ui;color:#c9ced6;margin-bottom:2px}
.ssTbl{width:100%;border-collapse:collapse;margin:6px 0;font-size:11px}.ssTbl th,.ssTbl td{border:1px solid #d3dbe4;padding:2px 4px;text-align:center}.ssTbl th{background:#eef3f8}
.ssMsg{margin:6px 0;font-weight:600}.ssMsg.ok{color:#1f9d55}.ssMsg.no{color:#b36b00}.ssHint{color:#6a7787;font-size:12px;margin:4px 0}
.ssLock{position:absolute;inset:0;background:#0f1620;color:#fff;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:30px}.ssLock[hidden]{display:none}.ssLock h2{font-size:26px;margin:0}.ssLock .pin{font-size:20px;width:7em;text-align:center}.ssLock .ssMsg.no,.ssLock .pesMsg{color:#ffb4a8}
.ssBl{display:block;margin:6px 0}.ssBl input{width:7em;margin:0 6px}.ssStory{background:#fff8e6;border-color:#e8c46a}`;
const fmt = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] === undefined ? "" : o[k]));
const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1), f2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
const nf = (v) => (Math.abs(v) >= 100 ? String(Math.round(v)) : f2(v));

const STEPS = ["calib", "cp1", "string", "cp2", "hyatt", "chain", "cp3", "done"];
const CP_OF = { cp1: "spring", cp2: "string", cp3: "hang" };
const LOCK_TYPE = { calib: "spring", cp1: "spring", string: "string", cp2: "string", hyatt: "hang", chain: "hang", cp3: "hang", done: "hang" };
const PART_OF = { calib: "A", cp1: "A", string: "B", cp2: "B", hyatt: "C", chain: "D", cp3: "D", done: "D" };
const PARTS = ["A", "B", "C", "D"];

const T0 = () => ({ tab: "A", hung: 0, cal: { rows: [], k: "", ok: false, tries: 0, hint: "", att: [] },
  str: { M: 2.0, m: 0.5, mode: "held", pred: "", runs: [] },
  hy: { design: "one", up: 1, low: 1, rows: [], choice: "", tries: 0, ok: false },
  ch: { bucket: 0.5, at: 1, rows: [], pred: null, predTry: "" },
  cp: { spring: CK.track(), string: CK.track(), hang: CK.track() }, lock: null, locks: [], helps: [], blanks: { b1: "", b2: "", b3: "", b4: "", b5: "" }, huddle: false, handed: false });
export const fresh = () => ({ ...T0(), huddle1: true, h1Forced: true, forced1: true, huddle2: false, h2Auto: false, forced2: false });   // huddle 1 never runs; the one huddle is the shared "huddle 2" slot, set at the middle by the clock
export function fix(g) {
  const d = fresh(); for (const k in d) if (g[k] === undefined) g[k] = d[k];
  for (const k of ["cal", "str", "hy", "ch", "blanks"]) for (const j in d[k]) if (g[k][j] === undefined) g[k][j] = d[k][j];
  for (const t of E.CK_TYPES) { if (!g.cp[t]) g.cp[t] = CK.track(); for (const j in d.cp[t]) if (g.cp[t][j] === undefined) g.cp[t][j] = d.cp[t][j]; }
  return g;
}
export async function load(lab) { lab.prelab = { questions: [] }; }

export function create(ctx) {
  const { lab, S, log, say, onChange } = ctx, U = lab.ui, A = lab.arrows, G = () => S.flame, $ = (id) => document.getElementById(id);
  const LEN = E.lengthOf(lab, location.search), MID = E.huddleAt(LEN), god = () => ctx.isKey();
  const live = () => ["lab", "postlab", "done"].includes(S.stage) || ctx.isDemo();
  const ev = (t, d) => { if (!ctx.isDemo()) log.add(t, d); }, changed = () => { if (!ctx.isDemo()) onChange(); };
  const isOpen = () => { const d = $("dlgNotebook"); return !!(d && d.open); };
  const seed = () => String(ctx.studentKey() || "anon") + "|" + (lab.id || "");
  const K = () => E.scaleK(seed()), ML = () => E.linkKg(seed());
  const qOf = (type) => E.question(type, G().cp[type].n, seed());

  // ---------- where the student is ----------
  const aDone = () => { const c = G().cal; return new Set(c.rows.map((r) => r.m)).size >= 3 && c.ok; };
  const bRuns = () => { const r = G().str.runs, rel = new Set(r.filter((x) => x.mode === "released").map((x) => x.M + "|" + x.m)); return { held: r.some((x) => x.mode === "held"), rel: rel.size }; };
  const bDone = () => { const b = bRuns(); return b.held && b.rel >= 2; };
  const cSeen = () => ({ one: G().hy.rows.some((r) => r.design === "one"), two: G().hy.rows.some((r) => r.design === "two") });
  const cDone = () => G().hy.ok;
  const dGaps = () => new Set(G().ch.rows.filter((r) => r.at < E.LINKS).map((r) => r.at)).size;
  const dDone = () => dGaps() >= 3 && !!G().ch.pred && G().ch.rows.some((r) => r.at === E.LINKS);
  function stepId() {
    const g = G(); if (!aDone()) return "calib"; if (!g.cp.spring.passed) return "cp1"; if (!bDone()) return "string"; if (!g.cp.string.passed) return "cp2";
    if (!cDone()) return "hyatt"; if (!dDone()) return "chain"; if (!g.cp.hang.passed) return "cp3"; return "done";
  }
  const stepIdx = () => STEPS.indexOf(stepId());
  const redoType = () => E.CK_TYPES.find((t) => G().cp[t].redo) || null;
  const curCp = () => redoType() || CP_OF[stepId()] || null;
  const blocked = () => !!G().lock || !!redoType();
  const partOpen = (p) => god() || ctx.isDemo() || PARTS.indexOf(p) <= PARTS.indexOf(PART_OF[stepId()]);
  const calibrated = () => G().cal.ok || god();
  function questState() {
    const g = G(), b = bRuns();
    return { a_hang: g.hung > 0, a_record: g.cal.rows.length >= 1, a_rows: new Set(g.cal.rows.map((r) => r.m)).size >= 3, _a_rows: Math.min(3, new Set(g.cal.rows.map((r) => r.m)).size), a_k: g.cal.ok,
      cp1: g.cp.spring.passed, b_runs: bDone(), _b_runs: (b.held ? 1 : 0) + Math.min(2, b.rel), cp2: g.cp.string.passed, c_designs: cDone(), d_chain: dDone(), _d_chain: Math.min(3, dGaps()), cp3: g.cp.hang.passed, handed: g.handed };
  }

  // ---------- the scale's reading for the rig on screen ----------
  let anim = null;   // Part B: the released cart sliding, { t }
  function reading() {
    const g = G();
    if (g.tab === "A") { if (!g.hung) return null; const x = E.stretchCm(K(), g.hung); return { cm: x, N: calibrated() ? g.hung * E.G : null }; }
    if (g.tab === "B") { const s = g.str; return { N: s.mode === "held" ? E.heldT(s.M, s.m) : E.releasedT(s.M, s.m) }; }
    if (g.tab === "C") { const r = E.hyatt(g.hy.design, g.hy.up, g.hy.low); return { N: r.nut, rods: r }; }
    if (g.tab === "D") { if (g.ch.at === E.LINKS && !g.ch.pred && !god()) return { N: null, locked: true }; return { N: E.chainT(g.ch.at, ML(), g.ch.bucket) }; }
    return null;
  }

  // ---------- actions ----------
  const act = () => live() && !blocked();
  function setTab(p) { if (!partOpen(p)) return; G().tab = p; anim = null; ev("scales_tab", { part: p }); render(); changed(); }
  function hang(m) { if (!act()) return; const g = G(); g.hung = m; g.tab = "A"; ev("scales_hang", { m }); render(); changed(); }
  function doRecord() {
    const g = G(); if (!act()) return; const r = reading(); if (!r) return say(U.recNothing, "warn");
    if (g.tab === "A") { if (g.cal.rows.some((x) => x.m === g.hung)) return say(U.recSame, "warn"); g.cal.rows.push({ m: g.hung, F: +f2(g.hung * E.G), x: r.cm }); g.cal.rows.sort((a, b) => a.m - b.m); ev("scales_record", { part: "A", m: g.hung, x: r.cm }); }
    else if (g.tab === "B") { const s = g.str; if (s.mode === "released" && !anim) return say(U.recRelease, "warn"); s.runs.push({ M: s.M, m: s.m, mode: s.mode, pred: s.mode === "released" ? s.lastPred : null, T: +f2(r.N) }); ev("scales_record", { part: "B", M: s.M, m: s.m, mode: s.mode, T: +f2(r.N) }); }
    else if (g.tab === "C") { const y = r.rods; g.hy.rows.push({ design: g.hy.design, up: g.hy.up, low: g.hy.low, upperRod: y.upperRod, nut: y.nut, lowerRod: y.lowerRod }); ev("scales_record", { part: "C", design: g.hy.design, nut: y.nut }); }
    else { if (r.locked) return say(U.topLocked, "warn"); if (!g.ch.rows.some((x) => x.at === g.ch.at && x.bucket === g.ch.bucket)) g.ch.rows.push({ at: g.ch.at, bucket: g.ch.bucket, T: +f2(r.N) }); ev("scales_record", { part: "D", at: g.ch.at, T: +f2(r.N) }); }
    render(); changed();
  }
  function checkK(typed) {
    const g = G(), c = g.cal; if (!act() || c.ok) return; c.tries++; c.k = typed; c.ok = E.kOk(K(), typed); c.hint = c.ok ? "" : U["kHint_" + E.kHint(K(), c.rows, typed)];
    c.att.push({ typed, ok: c.ok, at: new Date().toISOString() }); ev("scales_k", { typed, ok: c.ok, k: K() }); if (c.ok) say(U.kSay, "obs"); render(); changed();
  }
  // Part B
  function setCart(M) { const s = G().str; if (!act()) return; s.M = M; s.mode = "held"; anim = null; render(); changed(); }
  function setHang(m) { const s = G().str; if (!act()) return; s.m = m; s.mode = "held"; anim = null; render(); changed(); }
  function hold() { const s = G().str; if (!act()) return; s.mode = "held"; anim = null; ev("scales_hold", { M: s.M, m: s.m }); render(); changed(); }
  function predict(p) { const s = G().str; if (!act() || s.mode === "released") return; s.pred = p; ev("scales_predict", { p, M: s.M, m: s.m }); render(); changed(); }
  function release() {
    const s = G().str; if (!act()) return; if (!s.pred && !god()) return say(U.predFirst, "warn");
    s.lastPred = s.pred || "less"; s.pred = ""; s.mode = "released"; anim = { t: 0 }; ev("scales_release", { M: s.M, m: s.m, pred: s.lastPred }); render(); changed();
  }
  // Part C
  function setDesign(d) { const y = G().hy; if (!act()) return; y.design = d; ev("scales_design", { d }); render(); changed(); }
  function setCrowd(which, n) { const y = G().hy; if (!act()) return; y[which] = n; render(); changed(); }
  function hyChoose(c) { const y = G().hy; if (!act() || y.ok) return; y.tries++; y.choice = c; y.ok = c === E.hyAnswer; ev("scales_hyatt", { choice: c, ok: y.ok }); render(); changed(); }
  // Part D
  function setBucket(b) { const c = G().ch; if (!act()) return; c.bucket = b; render(); changed(); }
  function moveTo(j) { const c = G().ch; if (!act() || j < 1 || j > E.LINKS) return; c.at = j; ev("scales_gap", { at: j }); render(); changed(); }
  function predictTop(typed) {
    const c = G().ch; if (!act() || c.pred) return; if (!Number.isFinite(E.num(typed))) return say(U.kHint_num, "warn");
    const want = E.chainT(E.LINKS, ML(), c.bucket); c.pred = { typed, bucket: c.bucket, want, ok: E.answerOk(want, typed) }; ev("scales_predict_top", c.pred); render(); changed();
  }
  const ready = () => god() || (stepId() === "done" && !G().lock);
  function handIn() { const g = G(); if (!live() || !ready()) return; g.handed = true; ev("scales_handin", {}); changed(); ctx.closeNotebook(); ctx.finish(); }

  // ----- checkpoints: three right in a row, a hint after a miss that never gives the answer, three misses lock -----
  let cpNote = null;
  function submit(type, attempt) {
    const g = G(); if (!live() || g.lock || curCp() !== type) return; const t = g.cp[type], item = qOf(type), ok = E.grade(item, attempt), code = ok ? null : E.diagnose(item, attempt);
    t.att.push({ n: t.n, q: item.key, ok, hint: code, at: new Date().toISOString() }); ev("scales_attempt", { check: type, n: t.n, q: item.key, answer: attempt, ok, code, redo: t.redo });
    const r = CK.grade(t, ok);
    if (r === "right") cpNote = { type, ok: true, text: `${U.cpRight} ${fmt(U.cpRow, { s: t.streak, n: t.need })}` };
    else if (r === "pass") { cpNote = { type, ok: true, text: U.cpPass }; ev("scales_pass", { check: type }); }
    else { cpNote = { type, ok: false, text: `${U.cpMiss} ${U["cpHint_" + code]} ${U.cpNew}` }; if (r === "lock") { lockNow(type, "misses"); return; } }
    render(); changed();
  }
  function lockNow(type, reason) {
    const g = G(); if (g.lock) return; if (god() && !ctx.isDemo()) { say(U.keyLock, "warn"); return; }
    g.lock = CK.lockInfo(type, reason, stepId()); g.cp[type].atCp = type === curCp(); if (reason === "help") g.cp[type].helps++;
    g.locks.push({ type, reason, step: stepId(), at: g.lock.at, unlockedAt: null }); ev("scales_lock", { check: type, reason }); if (!ctx.isDemo()) CK.mirrorSet(lab.id, g.lock, S.student);
    anim = null; render(); changed();
  }
  function helpNow() { if (!live() || G().lock) return; const g = G(); g.helps.push({ step: stepId(), at: new Date().toISOString() }); ev("scales_help", { step: stepId() }); lockNow(curCp() || LOCK_TYPE[stepId()], "help"); }
  function tryUnlock(code) { const ok = CK.codeOk(code); ev("scales_unlock_try", { ok }); if (ok) realUnlock(); return ok; }
  function realUnlock() {
    const g = G(), L0 = g.lock; if (!L0) return; CK.unlockTrack(g.cp[L0.type]); const last = [...g.locks].reverse().find((x) => !x.unlockedAt); if (last) last.unlockedAt = new Date().toISOString();
    g.lock = null; cpNote = null; ev("scales_unlock", { check: L0.type }); if (!ctx.isDemo()) CK.mirrorClear(lab.id); render(); changed();
  }
  function ensureLockMirror() { if (ctx.isDemo() || G().lock || S.stage !== "lab") return; const m = CK.mirrorGet(lab.id); if (m) { G().lock = { type: m.type, reason: m.reason, step: stepId(), at: m.at }; G().locks.push({ type: m.type, reason: m.reason, at: m.at, unlockedAt: null, restored: true }); } }

  // ---------- the rigs, drawn as SVG ----------
  const C = { ink: "#1e2630", wood: "#b98b5e", steel: "#6b7480", scale: "#e8943a", face: "#fff4e0", mass: "#3b3f46", blue: "#2a6fb5", green: "#2f9e5a", red: "#c0392b", soft: "#9aa4ae", beam: "#7d8b99" };
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 13}" font-family="system-ui,sans-serif" font-weight="${o.w || 600}" fill="${o.fill || C.ink}" text-anchor="${o.anchor || "middle"}">${s}</text>`;
  const rect = (x, y, w, hh, fill, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${o.rx || 3}" fill="${fill}" stroke="${o.stroke || "none"}" stroke-width="${o.sw || 1}"/>`;
  const line = (x1, y1, x2, y2, stroke, sw = 2, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
  const coil = (x, y1, y2, w = 10, n = 9) => { let d = `M${x},${y1}`; const step = (y2 - y1) / (n * 2); for (let i = 1; i <= n * 2; i++) d += ` L${x + (i % 2 ? w : -w)},${y1 + step * i}`; return `<path d="${d} L${x},${y2}" fill="none" stroke="${C.steel}" stroke-width="2"/>`; };
  const hcoil = (x1, x2, y, w = 7, n = 7) => { let d = `M${x1},${y}`; const step = (x2 - x1) / (n * 2); for (let i = 1; i <= n * 2; i++) d += ` L${x1 + step * i},${y + (i % 2 ? w : -w)}`; return `<path d="${d} L${x2},${y}" fill="none" stroke="${C.steel}" stroke-width="2"/>`; };
  // a small spring scale tag on a rod or string: an orange body and a reading
  const tag = (x, y, label, val, vert = true) => (vert ? rect(x - 9, y - 22, 18, 44, C.scale, { rx: 5 }) + rect(x - 5, y - 16, 10, 32, C.face, { rx: 2 }) : rect(x - 22, y - 9, 44, 18, C.scale, { rx: 5 }) + rect(x - 16, y - 5, 32, 10, C.face, { rx: 2 }))
    + `<g>${rect(x + (vert ? 14 : -40), y - (vert ? 13 : 38), 80, 24, "#1b2531", { rx: 5 })}${txt(x + (vert ? 54 : 0), y - (vert ? -4 : 21), val, { fill: "#9fe870", size: 13 })}${label ? txt(x + (vert ? 54 : 0), y - (vert ? 17 : 42), label, { size: 11, fill: "#566170" }) : ""}</g>`;
  function svgA() {
    const g = G(), k = K(), x = g.hung ? E.stretchCm(k, g.hung) : 0, px = 9, top = 90, body = 120, y0 = top + body + 10, yM = y0 + x * px;
    let o = rect(40, 30, 400, 14, C.wood) + line(240, 44, 240, top, C.steel, 3);
    o += rect(222, top, 36, body, C.scale, { rx: 8 }) + rect(230, top + 10, 20, body - 20, C.face, { rx: 3 }) + txt(240, top - 8, U.rigScale, { size: 11, fill: "#566170" });
    o += coil(240, top + body - 6, y0 + x * px - 4, 9, 10) + line(240, y0 + x * px - 4, 240, yM, C.steel, 2);
    if (g.hung) o += rect(215, yM, 50, 26 + g.hung * 40, C.mass, { rx: 4 }) + txt(240, yM + 18 + g.hung * 20, `${g.hung} kg`, { fill: "#fff", size: 12 });
    else o += `<path d="M240,${y0} q8,8 0,14" fill="none" stroke="${C.steel}" stroke-width="2.5"/>`;
    // the ruler beside it: zero at the unstretched hook, 1 cm per tick
    o += rect(300, y0 - 6, 34, 30 * px + 12, "#f6e7b8", { stroke: "#b48a2c" });
    for (let c = 0; c <= 30; c++) { const yy = y0 + c * px; o += line(300, yy, 300 + (c % 5 ? 8 : 16), yy, "#7a5a12", c % 5 ? 1 : 1.6); if (c % 5 === 0) o += txt(326, yy + 4, c, { size: 10, w: 500 }); }
    o += txt(317, y0 + 30 * px + 22, "cm", { size: 11 }) + line(244, yM, 300, yM, C.red, 1.6, "4 3");
    return `<svg viewBox="0 0 480 520" role="img" aria-label="${U.rigAAria}">${o}</svg>`;
  }
  function svgB() {
    const s = G().str, a = E.accel(s.M, s.m), cw = 60 + s.M * 14, tableY = 250, pulX = 420, dMax = pulX - 70 - cw - 70, t = anim ? anim.t : 0, d = Math.min(dMax, 0.5 * a * t * t * 45), done = d >= dMax;
    const cx = 70 + d, hy = tableY + 20 + d, T = s.mode === "held" ? E.heldT(s.M, s.m) : E.releasedT(s.M, s.m);
    let o = rect(20, tableY, 400, 16, C.wood) + rect(40, tableY + 16, 14, 170, C.wood) + rect(386, tableY + 16, 14, 170, C.wood);
    o += `<circle cx="${pulX}" cy="${tableY - 4}" r="16" fill="#cfd6de" stroke="${C.steel}" stroke-width="3"/>` + line(pulX, tableY - 4, 400, tableY + 10, C.steel, 4);
    o += rect(cx, tableY - 40, cw, 36, C.blue, { rx: 6 }) + `<circle cx="${cx + 12}" cy="${tableY - 4}" r="6" fill="#2b2f36"/><circle cx="${cx + cw - 12}" cy="${tableY - 4}" r="6" fill="#2b2f36"/>` + txt(cx + cw / 2, tableY - 17, `${s.M} kg`, { fill: "#fff", size: 12 });
    const sx = (cx + cw + pulX) / 2; o += line(cx + cw, tableY - 22, sx - 22, tableY - 22, C.ink, 2) + line(sx + 22, tableY - 22, pulX, tableY - 22, C.ink, 2) + line(pulX + 16, tableY - 4, pulX + 16, hy, C.ink, 2);
    o += tag(sx, tableY - 22, U.rigScale, `${f2(T)} N`, false);
    o += rect(pulX - 4, hy, 40, 24 + s.m * 30, C.mass, { rx: 4 }) + txt(pulX + 16, hy + 16 + s.m * 15, `${s.m} kg`, { fill: "#fff", size: 11 });
    if (s.mode === "held") o += `<path d="M${cx - 24},${tableY - 30} h18" stroke="${C.red}" stroke-width="5"/>` + txt(cx - 26, tableY - 46, U.rigHand, { size: 11, fill: C.red });
    else o += txt(220, 60, done ? U.rigCaught : fmt(U.rigMoving, { a: f2(a) }), { size: 13, fill: C.green });
    return `<svg viewBox="0 0 480 520" role="img" aria-label="${U.rigBAria}">${o}</svg>`;
  }
  function svgC(y0) {
    const y = y0 || G().hy, r = E.hyatt(y.design, y.up, y.low), two = y.design === "two", top = 46, upY = 210, lowY = 400, rx = 200;
    let o = rect(20, top - 14, 440, 14, C.beam) + txt(30, 18, two ? U.rigTwo : U.rigOne, { size: 13, anchor: "start" });
    const walk = (yy, n, label) => rect(90, yy, 300, 30, "#cfd6de", { stroke: C.steel, sw: 2 }) + rect(80, yy + 30, 320, 10, C.beam) + txt(398, yy + 56, label, { size: 11, fill: "#566170", anchor: "end" }) + Array.from({ length: n }, (_, i) => `<circle cx="${130 + i * 40}" cy="${yy - 10}" r="8" fill="${C.green}"/><rect x="${124 + i * 40}" y="${yy - 3}" width="12" height="3" fill="${C.green}"/>`).join("");
    o += walk(upY, y.up, U.rigUpper) + walk(lowY, y.low, U.rigLower);
    const nut = (x, yy) => `<polygon points="${x - 9},${yy} ${x + 9},${yy} ${x + 12},${yy + 7} ${x + 9},${yy + 14} ${x - 9},${yy + 14} ${x - 12},${yy + 7}" fill="#566170"/>`;
    if (!two) { o += line(rx, top, rx, lowY + 40, C.ink, 5) + nut(rx, upY + 40) + nut(rx, lowY + 40); }
    else { o += line(rx - 14, top, rx - 14, upY + 40, C.ink, 5) + nut(rx - 14, upY + 40) + line(rx + 14, upY, rx + 14, lowY + 40, C.ink, 5) + nut(rx + 14, upY - 14) + nut(rx + 14, lowY + 40); }
    o += tag(two ? rx - 14 : rx, 120, U.rigUpperRod, `${nf(r.upperRod)} N`) + tag(two ? rx + 14 : rx, 320, U.rigLowerRod, `${nf(r.lowerRod)} N`);
    o += `<circle cx="${two ? rx - 14 : rx}" cy="${upY + 47}" r="20" fill="none" stroke="${C.red}" stroke-width="2.5"/>` + `<g>${rect(20, upY + 70, 150, 36, "#1b2531", { rx: 5 })}${txt(95, upY + 84, U.rigNut, { size: 10, fill: "#c9ced6" })}${txt(95, upY + 100, `${nf(r.nut)} N`, { fill: "#ffb4a8", size: 14 })}</g>` + line(two ? rx - 30 : rx - 16, upY + 58, 150, upY + 72, C.red, 1.5);
    return `<svg viewBox="0 0 480 520" role="img" aria-label="${U.rigCAria}">${o}</svg>`;
  }
  function svgD() {
    const c = G().ch, mL = ML(), top = 40, gap = 56, x = 200, bottomY = top + 20 + E.LINKS * gap;
    let o = rect(60, top - 14, 360, 14, C.beam) + txt(330, 70, fmt(U.rigLink, { m: mL }), { size: 12, fill: "#566170" });
    for (let i = 0; i < E.LINKS; i++) {   // link 6 is the top link, link 1 the bottom
      const j = E.LINKS - i, yy = top + 14 + i * gap; o += `<ellipse cx="${x}" cy="${yy + gap / 2}" rx="13" ry="${gap / 2 - 4}" fill="none" stroke="${C.steel}" stroke-width="6"/>` + txt(x - 36, yy + gap / 2 + 4, j, { size: 11, fill: "#566170" });
      // the gap above link j, clickable
      o += `<rect class="ssGapHit" data-j="${j}" x="${x - 30}" y="${yy - 12}" width="60" height="22" fill="${c.at === j ? "rgba(232,148,58,.35)" : "transparent"}" style="cursor:pointer"/>`;
    }
    if (c.bucket) o += line(x, bottomY - 6, x, bottomY + 14, C.steel, 2) + `<path d="M${x - 30},${bottomY + 14} h60 l-8,${30 + c.bucket * 20} h-44 z" fill="${C.blue}"/>` + txt(x, bottomY + 36, `${c.bucket} kg`, { fill: "#fff", size: 11 });
    const yAt = top + 14 + (E.LINKS - c.at) * gap - 1, r = reading();
    o += tag(x + 60, yAt, fmt(U.rigGap, { j: c.at }), r.locked ? U.rigPredictFirst : `${f2(r.N)} N`) + line(x + 14, yAt, x + 50, yAt, C.scale, 2, "3 3");
    return `<svg viewBox="0 0 480 520" role="img" aria-label="${U.rigDAria}">${o}</svg>`;
  }

  // ---------- the left column: the step card for the part on screen, or the checkpoint ----------
  const els = {};
  const btn = (id, label, onclick, on) => h("button", { id, class: on ? "on" : "", onclick }, label);
  function tableOf(head, rows) { return h("table", { class: "ssTbl" }, h("tr", {}, ...head.map((x) => h("th", {}, x))), ...rows.map((r) => h("tr", {}, ...r.map((x) => h("td", {}, String(x)))))); }
  function partA() {
    const g = G(), c = g.cal, n = new Set(c.rows.map((r) => r.m)).size, out = [h("h3", {}, U.aHead), h("p", {}, U.aText)];
    out.push(h("div", { class: "row" }, ...E.CAL_MASSES.map((m, i) => btn("ssMass_" + i, `${m} kg`, () => hang(m), g.hung === m))), h("div", { class: "row" }, btn("ssRecord", U.recordBtn, doRecord)));
    if (c.ok) out.push(h("p", { class: "ssMsg ok" }, fmt(U.kYes, { k: K() })));
    else if (n >= 3) {
      const inp = h("input", { id: "ssK", type: "text", inputmode: "decimal", autocomplete: "off", value: c.k, "aria-label": U.kAsk }); inp.addEventListener("keydown", (e) => { if (e.key === "Enter") checkK(inp.value); });
      out.push(h("p", {}, U.kAsk), h("div", { class: "row" }, "k =", inp, "N/m", h("button", { id: "ssKGo", class: "primary", onclick: () => checkK(inp.value) }, U.checkBtn)));
      if (c.hint) out.push(h("p", { class: "ssMsg no", role: "status" }, c.hint));
    } else out.push(h("p", { class: "ssHint" }, fmt(U.aMore, { n: 3 - n })));
    return out;
  }
  function partB() {
    const s = G().str, b = bRuns(), out = [h("h3", {}, U.bHead), h("p", {}, U.bText)];
    out.push(h("div", { class: "row" }, U.cartWord, ...E.CARTS.map((M, i) => btn("ssCart_" + i, `${M} kg`, () => setCart(M), s.M === M))), h("div", { class: "row" }, U.hangWord, ...E.HANGS.map((m, i) => btn("ssHang_" + i, `${m} kg`, () => setHang(m), s.m === m))));
    out.push(h("div", { class: "row" }, btn("ssHold", U.holdBtn, hold, s.mode === "held"), btn("ssRelease", U.releaseBtn, release, s.mode === "released"), btn("ssRecord", U.recordBtn, doRecord)));
    if (s.mode === "held") out.push(h("p", { class: "ssHint" }, U.predAsk), h("div", { class: "row" }, ...E.PREDS.map((p) => btn("ssPred_" + p, U["pred_" + p], () => predict(p), s.pred === p))));
    out.push(h("p", { class: "ssHint" }, fmt(U.bProgress, { held: b.held ? "✔" : "○", rel: Math.min(2, b.rel) })));
    return out;
  }
  function partC() {
    const y = G().hy, seen = cSeen(), out = [h("h3", {}, U.cHead), h("p", {}, U.cText)];
    out.push(h("div", { class: "row" }, btn("ssDesign_one", U.designOne, () => setDesign("one"), y.design === "one"), btn("ssDesign_two", U.designTwo, () => setDesign("two"), y.design === "two")));
    out.push(h("div", { class: "row" }, U.crowdUp, ...[0, 1, 2, 3].map((n) => btn("ssUp_" + n, String(n), () => setCrowd("up", n), y.up === n))), h("div", { class: "row" }, U.crowdLow, ...[0, 1, 2, 3].map((n) => btn("ssLow_" + n, String(n), () => setCrowd("low", n), y.low === n))));
    out.push(h("div", { class: "row" }, btn("ssRecord", U.recordBtn, doRecord)));
    if (seen.one && seen.two) {
      out.push(h("p", {}, U.hyAsk), h("div", { class: "row" }, ...E.HY_CHOICES.map((c) => btn("ssHy_" + c, U["hy_" + c], () => hyChoose(c), y.choice === c))));
      if (y.ok) out.push(h("div", { class: "ssCard ssStory" }, h("p", { class: "ssMsg ok" }, U.hyYes), h("p", {}, lab.hyatt.story)));
      else if (y.choice) out.push(h("p", { class: "ssMsg no", role: "status" }, U.hyNo));
    } else out.push(h("p", { class: "ssHint" }, U.cMore));
    return out;
  }
  function partD() {
    const c = G().ch, out = [h("h3", {}, U.dHead), h("p", {}, U.dText)];
    out.push(h("div", { class: "row" }, U.bucketWord, ...E.BUCKETS.map((b, i) => btn("ssBucket_" + i, `${b} kg`, () => setBucket(b), c.bucket === b))));
    out.push(h("div", { class: "row" }, U.gapWord, ...Array.from({ length: E.LINKS }, (_, i) => i + 1).map((j) => btn("ssGap_" + j, j === E.LINKS ? U.topWord : String(j), () => moveTo(j), c.at === j))), h("div", { class: "row" }, btn("ssRecord", U.recordBtn, doRecord)));
    if (c.pred) out.push(h("p", { class: "ssMsg " + (c.pred.ok ? "ok" : "no") }, fmt(c.pred.ok ? U.topHeld : U.topMissed, { p: c.pred.typed })));
    else if (dGaps() >= 3 || god()) {
      const inp = h("input", { id: "ssTop", type: "text", inputmode: "decimal", autocomplete: "off", "aria-label": U.topAsk }); inp.addEventListener("keydown", (e) => { if (e.key === "Enter") predictTop(inp.value); });
      out.push(h("p", {}, U.topAsk), h("div", { class: "row" }, inp, "N", h("button", { id: "ssTopGo", class: "primary", onclick: () => predictTop(inp.value) }, U.lockInBtn)));
    } else out.push(h("p", { class: "ssHint" }, fmt(U.dMore, { n: 3 - dGaps() })));
    return out;
  }
  function cpBody(type) {
    const g = G(), t = g.cp[type], item = qOf(type), out = [];
    if (t.redo) out.push(h("p", { class: "ssMsg", role: "status" }, fmt(U.redoNote, { n: t.need })));
    if (cpNote && cpNote.type === type) out.push(h("p", { class: "ssMsg " + (cpNote.ok ? "ok" : "no"), role: "status" }, cpNote.text));
    const q = type === "spring" ? fmt(item.form === "findK" ? U.cpQ_findK : U.cpQ_findF, item) : type === "string" ? fmt(item.held ? U.cpQ_held : U.cpQ_released, item)
      : item.form === "chain" ? fmt(item.B ? U.cpQ_chain : U.cpQ_chain0, item) : fmt(U.cpQ_walk, { ...item, where: U["cpWhere_" + item.at] });
    const inp = h("input", { id: "ssCkIn", type: "text", inputmode: "decimal", autocomplete: "off", "aria-label": U.checkBtn }); inp.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(type, inp.value); });
    out.push(h("h3", {}, U["cpHead_" + type]), h("p", { class: "ssHint" }, fmt(U.cpRow, { s: t.streak, n: t.need })), h("p", {}, q), h("div", { class: "row" }, inp, item.unit, h("button", { id: "ssCkGo", class: "primary", onclick: () => submit(type, inp.value) }, U.checkBtn)));
    return out;
  }
  function leftBody() {
    const g = G(), st = stepId(), cp = curCp(), out = [h("div", { class: "ssCard" }, h("p", { class: "ssHint" }, lab.steps[st]))];
    if (cp && !g.lock) { out.push(h("div", { class: "ssCard", id: "ssCheck" }, ...cpBody(cp))); return out; }
    const body = { A: partA, B: partB, C: partC, D: partD }[g.tab](); out.push(h("div", { class: "ssCard" }, ...body));
    return out;
  }
  function rightBody() {
    const g = G(), r = reading(), out = [];
    const dial = !r ? h("div", { class: "ssDial", id: "ssDial" }, h("small", {}, U.dialHead), "—")
      : g.tab === "A" ? h("div", { class: "ssDial", id: "ssDial" }, h("small", {}, U.dialStretch), `${f1(r.cm)} cm`, r.N !== null ? h("small", { style: "margin-top:4px" }, `${f2(r.N)} N`) : null)
      : h("div", { class: "ssDial", id: "ssDial" }, h("small", {}, g.tab === "C" ? U.dialNut : U.dialHead), r.N === null ? "?" : `${nf(r.N)} N`);
    out.push(dial);
    if (g.tab === "A") out.push(h("h3", { style: "margin-top:10px" }, U.tblA), tableOf(U.colsA, g.cal.rows.map((x) => [x.m, f2(x.F), f1(x.x)])));
    if (g.tab === "B") out.push(h("h3", { style: "margin-top:10px" }, U.tblB), tableOf(U.colsB, g.str.runs.map((x) => [`${x.M} + ${x.m}`, U["mode_" + x.mode], x.pred || "", f2(x.T)])));
    if (g.tab === "C") out.push(h("h3", { style: "margin-top:10px" }, U.tblC), tableOf(U.colsC, g.hy.rows.map((x) => [`${x.design === "two" ? U.designTwoShort : U.designOneShort} (${x.up}, ${x.low})`, nf(x.upperRod), nf(x.nut), nf(x.lowerRod)])));
    if (g.tab === "D") out.push(h("h3", { style: "margin-top:10px" }, U.tblD), tableOf(U.colsD, g.ch.rows.slice().sort((a, b) => a.at - b.at).map((x) => [x.at === E.LINKS ? U.topWord : x.at, x.bucket, f2(x.T)])));
    out.push(h("div", { style: "border-top:1px solid #c9d3de;margin-top:10px;padding-top:8px;text-align:center" }, h("button", { id: "ssHand", class: "primary", disabled: !live() || !ready() ? "" : null, onclick: handIn }, U.handBtn), h("p", { class: "ssHint" }, ready() ? U.handReady : U.handWait),
      h("button", { id: "ssHelp", disabled: !live() || G().lock ? "" : null, onclick: helpNow }, U.helpBtn), h("p", { class: "ssHint" }, U.helpNote)));
    return out;
  }
  let sigL = "", sigR = "";
  function render() {
    if (!els.root) return; const g = G();
    if (!partOpen(g.tab)) g.tab = PART_OF[stepId()];
    els.tabs.replaceChildren(...PARTS.map((p) => h("button", { id: "ssTab_" + p, class: g.tab === p ? "on" : "", disabled: partOpen(p) ? null : "", onclick: () => setTab(p) }, U["tab" + p])));
    els.rig.innerHTML = { A: svgA, B: svgB, C: () => svgC(), D: svgD }[g.tab]();
    const t = curCp(), tk = t ? g.cp[t] : null;
    const sl = JSON.stringify([stepId(), g.tab, g.hung, g.cal, g.str, g.hy, g.ch, t, tk && [tk.n, tk.streak, tk.redo], cpNote && cpNote.text, !!g.lock, god()]);
    if (sl !== sigL) { sigL = sl; els.left.replaceChildren(...leftBody()); }   // rebuild only when something changed: the refresh loop must not wipe a box a student is typing in
    const sr = JSON.stringify([sl, ready(), anim && anim.t > 0]); if (sr !== sigR) { sigR = sr; els.right.replaceChildren(...rightBody()); }
    const lk = g.lock; els.lockBox.hidden = !lk; els.close.hidden = !!lk; const dd = $("dlgNotebook"); if (dd && !ctx.isDemo()) { if (lk) dd.setAttribute("data-gate", ""); else dd.removeAttribute("data-gate"); }
    if (!lk) els.lockBox.dataset.at = ""; else if (els.lockBox.dataset.at !== lk.at) { els.lockBox.dataset.at = lk.at; els.lockBox.replaceChildren(...CK.lockScreen(lk, { head: U.lockHead, miss: U.lockMiss, help: U.lockHelp, body: U.lockBody, word: U.unlockWord, wrong: U.pinWrong }, { pin: "ssPin", go: "ssPinGo", msg: "ssPinMsg" }, () => tryUnlock(CK.todayCode()))); }
  }
  function build() {
    els.tabs = h("div", { class: "ssTabs", id: "ssTabs" }); els.rig = h("div", { class: "ssRig", id: "ssRig" }); els.left = h("div", { class: "ssCol", id: "ssLeft" }); els.right = h("div", { class: "ssCol", id: "ssRight" });
    els.lockBox = h("div", { id: "ssLockBox", class: "ssLock", hidden: "" }); els.close = h("button", { class: "x", "data-close": "", style: "position:absolute;right:0;top:-8px;z-index:4" }, U.closeWord);
    els.root = h("div", { class: "ssRoot" }, els.close, els.left, h("div", { class: "ssMid" }, els.tabs, els.rig), els.right, els.lockBox);
    els.rig.addEventListener("click", (e) => { const r = e.target.closest && e.target.closest(".ssGapHit"); if (r) moveTo(+r.getAttribute("data-j")); });
    const st = document.createElement("style"); st.textContent = CSS; els.root.append(st); return els.root;
  }
  const sheet = build(); let lastG = null;
  function step(dt) {
    if (G() !== lastG) { lastG = G(); cpNote = null; anim = null; ensureLockMirror(); sigL = sigR = ""; render(); }
    if (anim && G().tab === "B" && isOpen()) { anim.t += Math.min(0.1, dt || 0.016); if (anim.t < 4) els.rig.innerHTML = svgB(); if (!anim.shown && anim.t > 0.05) { anim.shown = true; render(); } }
  }
  function refresh() {
    if (!live()) return; ensureLockMirror(); render();
    if (G().lock && !ctx.isDemo() && !god() && S.stage === "lab" && !isOpen()) ctx.openNotebook("scales");
    const b = $("btnNotebook"); if (b && b.firstChild && b.firstChild.nodeType === 3) b.firstChild.textContent = U.benchBtn; const hb = $("btnHuddle"); if (hb && hb.firstChild) hb.firstChild.textContent = U.codeLabel;
  }
  const station = (t) => { if (t.id !== "scale_rig") return false; ev("scales_open", { at: t.id }); ctx.openNotebook("scales"); say(U.stepUp); render(); return true; };

  // ---------- intro, cards, arrows ----------
  function hookSvg() { const d = h("div", { style: "width:220px;height:240px" }); d.innerHTML = svgC({ design: "two", up: 2, low: 2 }); return d; }
  function renderIntro(box, c) {
    const key = (k, t) => h("tr", {}, h("td", {}, h("kbd", {}, k)), h("td", {}, t)), name = h("input", { id: "student", type: "text", autocomplete: "name", style: "width:18em", placeholder: "First and last name" });
    const go = h("button", { id: "introGo", class: "primary", disabled: true, onclick: () => c.onIntroDone(name.value.trim()) }, "Start the pre-lab →");
    name.addEventListener("input", () => { go.disabled = name.value.trim().length < 3; }); if (c.S.student) { name.value = c.S.student; go.disabled = name.value.trim().length < 3; }
    box.replaceChildren(h("h2", {}, lab.title), h("div", { class: "row", style: "align-items:flex-start;gap:18px" }, hookSvg(), h("div", {}, h("h3", {}, lab.hook.ask), h("p", {}, lab.hook.note), h("p", {}, lab.intro), h("p", { class: "ssMsg" }, lab.goal))),
      h("h3", {}, "How this lab works"), h("ol", {}, lab.introSteps.map((t) => h("li", {}, t))), h("h3", {}, "Controls"), h("table", { class: "keys" }, ...lab.keyRows.map(([k, t]) => key(k, t))),
      h("label", { style: "display:block;margin:12px 0" }, "Your name ", name), h("div", { class: "controls foot" }, h("button", { id: "introDemo", onclick: c.onDemo }, "▶ Watch the demo"), go));
  }
  function renderPrelab(box, c) {
    let i = 0; const cards = lab.cards, draw = () => { const cd = cards[i]; box.replaceChildren(h("h2", {}, `Card ${i + 1} of ${cards.length}: ${cd.term}`), h("p", { style: "max-width:40em;font-size:16px" }, cd.body),
      h("div", { class: "controls foot" }, h("button", { id: "cardBack", disabled: i === 0, onclick: () => { i--; draw(); } }, "Back"), i < cards.length - 1 ? h("button", { id: "cardNext", class: "primary", onclick: () => { i++; if (!c.S.demo) log.add("scales_card", { card: cards[i].id }); draw(); } }, "Got it, next") : h("button", { id: "cardDone", class: "primary", onclick: () => c.onPrelabDone() }, "Enter the lab →"))); }; draw();
  }
  function guide(id) {
    const E2 = (e, x) => (e ? ["el", e, x] : null), open = isOpen(), btnNb = $("btnNotebook"), g = G();
    switch (id) {
      case "door": return ["tile", "door", A.door];
      case "bench": return ["tile", "scale_rig", A.bench];
      case "a_hang": return !open ? E2(btnNb, A.open) : g.lock ? null : E2($("ssMass_1"), A.hang);
      case "a_record": return !open ? E2(btnNb, A.open) : g.lock ? null : !g.hung ? E2($("ssMass_1"), A.hang) : E2($("ssRecord"), A.record);
      case "a_rows": return !open || g.lock ? null : E2($("ssMass_" + E.CAL_MASSES.findIndex((m) => !g.cal.rows.some((r) => r.m === m))) || $("ssRecord"), A.more);
      case "a_k": return !open || g.lock || g.cal.ok ? null : E2($("ssK"), A.k);
    }
    return null;
  }

  // ---------- the one huddle: a notes huddle in the middle ----------
  function huddle(n, hx) {
    if (n !== 2) return hx.finish();
    const g = G(), B = E.BLANKS, box = hx.box, CODE = window.MrD && MrD.codes && MrD.codes.gateV3 ? MrD.codes.gateV3(lab.id, "h1") : hx.code, msg = h("p", { class: "hint", role: "status" });
    const inputs = B.map((b) => { const i = h("input", { id: "ssBlank_" + b.id, type: "text", autocomplete: "off", value: g.blanks[b.id] || "", "aria-label": b.pre }); i.addEventListener("input", () => { g.blanks[b.id] = i.value; sync(); }); return i; });
    const filled = () => B.every((b) => (g.blanks[b.id] || "").trim());
    const code = h("input", { id: "huddleCode", type: "text", inputmode: "numeric", maxlength: "4", autocomplete: "off", "aria-label": U.codeLabel, style: "width:6em" });
    const go = h("button", { id: "huddleGo", class: "primary", onclick: () => { if (hx.isKey || !hx.gates || code.value.trim() === CODE) { g.huddle = true; ev("scales_huddle", { blanks: B.map((b) => ({ id: b.id, text: g.blanks[b.id], ok: E.blankOk(b, g.blanks[b.id]) })) }); render(); hx.finish(); } else msg.textContent = U.codeWrong; } }, U.codeGo);
    const sync = () => { go.disabled = !filled(); };
    box.replaceChildren(h("h2", {}, U.huddleTitle), h("p", {}, U.huddleText), ...B.map((b, i) => h("label", { class: "ssBl" }, `${i + 1}. ${b.pre} `, inputs[i], ` ${b.post}`)),
      hx.isKey ? h("p", {}, U.keyShows.replace("{code}", CODE)) : !hx.gates ? h("p", { class: "hint" }, U.codeNote) : h("label", {}, U.codeLabel + " ", code), msg, h("div", { class: "controls" }, go)); sync(); hx.open();
  }

  // ---------- key, record ----------
  const tr = (th, ...tds) => h("tr", {}, h("th", {}, th), ...tds.map((t) => h("td", {}, t)));
  function key() {
    const rows = [], k = K(), mL = ML(), q = (t, n) => { const it = E.question(t, n, seed()); return `${it.key} → ${it.ans} ${it.unit}`; };
    rows.push(tr(`Timing (this run is ${LEN} minutes; change it with ?min=NN on the address)`, h("ol", {}, [`0 to 3: intro, two cards, walk to the bench.`, `3 to 8: Part A, calibrate the scale (find k); checkpoint 1.`, `8 to ${MID}: Part B, the scale in the string, held and released; checkpoint 2.`, `${MID}: one huddle. Eyes up, copy the board (blanks below). Board: physics/whiteboard/index.html#lesson=practice6, frame 1.`, `${MID} to ${LEN}: Part C (the skywalks), Part D (the chain), checkpoint 3, hand in. Then the paper worksheet.`].map((t) => h("li", {}, t)))));
    rows.push(tr("Huddle blanks", h("ol", {}, E.BLANKS.map((b) => h("li", {}, `${b.pre} ___ ${b.post}  →  ${b.ans[0]}`))), "Any non-empty copy lets a student on; the record keeps what they typed and whether it matched."));
    rows.push(tr("This student's scale", `k = ${k} N/m (seeded by name). Stretches: ${E.CAL_MASSES.map((m) => `${m} kg → ${E.stretchCm(k, m)} cm`).join(", ")}. A typed k counts within 4 percent.`));
    rows.push(tr("Part B answers", `Held: T = mg. Released: T = Mmg/(M + m), always less than mg. For example 2.0 kg cart, 0.5 kg hanging: held ${f2(E.heldT(2, 0.5))} N, released ${f2(E.releasedT(2, 0.5))} N. Each release needs a prediction first (more, same or less than held); the record keeps each one.`));
    rows.push(tr("Part C answers", `Rods read the same in both designs: upper rod = both walkways, lower rod = the lower walkway. The nut under the upper walkway holds its own walkway as designed, both walkways as built (twice as much when the walkways match). Walkway model: ${E.WALK_KG} kg plus ${E.PERSON_KG} kg a person.`));
    rows.push(tr("Part D answers", `This student's links: ${mL} kg each, ${E.LINKS} links. Gap j (above link j from the bottom) reads (j × ${mL} + bucket) × 9.8. Top with a 0.5 kg bucket: ${f2(E.chainT(E.LINKS, mL, 0.5))} N.`));
    rows.push(tr("The three checks", "Spring (k from a stretch, or a reading from k and a stretch), string (held or released), hang (a gap in a chain, or a rod or nut in the skywalks). Three right in a row passes each. A miss shows a hint and a new question, so there is nothing to click through. Three misses in a row, or the help button, lock the screen."));
    rows.push(tr("Unlock code", `Type today's unlock code on the student's screen (the "Unlock any locked student" code on the teacher pages; today it is ${CK.todayCode()}). Only that check resets; the student then needs 2 fresh ones right in a row. Every attempt, lock, unlock and help request is in the record.`));
    for (const t of E.CK_TYPES) rows.push(tr(`Checkpoint ${t}`, [0, 1, 2].map((n) => q(t, n)).join(" | "), "First three variants for this student."));
    rows.push(tr("Simplifications", h("ul", {}, ["The spring scale has no mass, so it reads the same pull at both ends.", "The table and the pulley have no friction; the string has no mass and does not stretch.", "The skywalk model is two walkways on one rod; the real hotel hung each walkway from three pairs of rods. The ratio is the same.", "g = 9.8 N/kg everywhere."].map((t) => h("li", {}, t)))));
    return rows;
  }
  function record(base) {
    const g = G(); return { ...base, prelab: { cards: lab.cards.map((c) => c.id) }, submitted: g.handed,
      scales: { lengthMin: LEN, k: K(), linkKg: ML(), calibrate: g.cal, string: g.str.runs, hyatt: { rows: g.hy.rows, choice: g.hy.choice, tries: g.hy.tries, ok: g.hy.ok }, chain: { rows: g.ch.rows, prediction: g.ch.pred },
        checks: Object.fromEntries(E.CK_TYPES.map((t) => [t, { passed: g.cp[t].passed, attempts: g.cp[t].att, unlocks: g.cp[t].unlocks, helps: g.cp[t].helps, redo: g.cp[t].redo }])), locks: g.locks, helps: g.helps, huddleBlanks: g.blanks, huddle: g.huddle, handed: g.handed, step: stepId() } };
  }

  // The demo: walk in, open the bench, hang and record, the string held and released, both skywalk designs, the chain gaps, the help button.
  async function demo({ say: cap, walk, wait, api }) {
    const T = lab.demo, g = () => G();
    await cap(1, T[0], 5000);
    await cap(2, T[1], 2500); await walk("ULLUUU"); api.interact(); await wait(1800);
    await cap(3, T[2], 2000); for (const m of [0.1, 0.2, 0.3]) { hang(m); await wait(700); doRecord(); await wait(500); }
    await cap(4, T[3], 4500);
    await cap(5, T[4], 2000); g().tab = "B"; render(); await wait(1500); predict("less"); await wait(900);
    await cap(6, T[5], 1500); release(); await wait(3500); doRecord(); await wait(1200);
    await cap(7, T[6], 2000); g().tab = "C"; render(); await wait(1500); setDesign("two"); await wait(2500);
    await cap(8, T[7], 2000); g().tab = "D"; render(); for (const j of [1, 3, 5]) { moveTo(j); await wait(800); } await wait(1200);
    await cap(9, T[8], 5000);
    api.closeNotebook(); await cap(10, T[9], 4500);
  }
  return { scales: true, sheet, step, refresh, draw: () => {}, station, canOpen: () => live(), showTab: () => {}, hintPicture: () => null, guide, key, print: () => [], record, questState, visible: () => true, unlocked: () => true,
    syncSources: () => {}, answered: () => [], evidence: () => [], recordComplete: () => true, renderPrelab, renderIntro, text: (k) => U[k] || "", holding: () => false, clock: { huddle1AtMin: 999, huddle2AtMin: MID }, bottles: [], huddle, panel: () => ({ title: "", items: [] }),
    controls: h("div", { id: "ssControls" }), demo, hooks: undefined,
    hk: { hang, record: doRecord, checkK, setCart, setHang, hold, predict, release, setDesign, setCrowd, hyChoose, setBucket, moveTo, predictTop, setTab, submit, tryUnlock, helpNow, question: qOf, state: G, stepId, k: K, linkKg: ML, len: LEN, mid: MID } };
}
