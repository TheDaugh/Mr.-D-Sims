// Lab 5 UI: the spectrometer, one screen. Sample carousel, light and brightness dials, Fire and Stop, the spectrum on AP axes, the zoom view,
// the reading guide, and the step card that carries Parts A to E, the three checkpoints, the lock screen and the PIN. It answers the same
// calls as the other "kind" labs (see physics/virtual-lab/src/ui/fancart.js), so the shared app hosts it. Every word a student sees is in
// content/labs/05-photoelectron.json. Chemistry numbers: chemistry/shared/pes-data.js. Physics: engine/pes.js. Questions: pes-practice.js.
import { h } from "../../../../shared/virtual-lab/dom.js";
import { sha256Hex } from "../../../../shared/virtual-lab/mode.js";
import * as E from "../engine/pes.js";
import * as V from "./pesview.js";

const D = window.PESData, Pr = window.PESPractice;
export const demoTotal = 10;
export const chestQuests = [];
const STEPS = ["li", "free", "cp1", "bdraw", "cp2", "mystery", "cp3", "modelA", "phos", "done"];
const CP_OF = { cp1: "read", cp2: "draw", cp3: "match" };
const LOCK_TYPE = { li: "read", free: "read", cp1: "read", bdraw: "draw", cp2: "draw", mystery: "match", cp3: "match", modelA: "match", phos: "match", done: "match" };
const DRAW_ORDER = ["O", "Mg", "Si"], MYS = ["A", "B", "C", "D"], PHASE = { li: "guided", free: "free", mystery: "mystery" };
const Zof = (s) => D.SYMBOLS.indexOf(s) + 1;
const hash = (s) => { let x = 2166136261; for (const c of String(s)) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; };

// ---------- state the app saves (S.flame) ----------
const T0 = () => ({ n: 0, streak: 0, miss: 0, passed: false, need: 3, redo: false, atCp: false, att: [], unlocks: 0, helps: 0 });
const D0 = () => ({ bars: V.newBars(), tries: 0, att: [], compared: false, ok: false, hint: "" });
const M0 = () => ({ Z: 0, ran: false, pick: 0, period: "", val: "", ok: false, tries: 0, att: [], hint: "" });
export const fresh = () => ({
  huddle1: true, huddle2: true, h1Forced: true, h2Auto: true, forced1: true, forced2: true,   // this lab has no huddles: the shared app must never call one
  el: 0, u: 0.05, b: 0.5,
  li: { pick: false, fire: false, low: false, maxMJ: 0, peak: false, done: false },
  runs: [], cp: { read: T0(), draw: T0(), match: T0() }, lock: null, locks: [], helps: [],
  draws: { O: D0(), Mg: D0(), Si: D0(), P: D0() }, cpBars: V.newBars(),
  mys: { A: M0(), B: M0(), C: M0(), D: M0() }, flaw: { ok: false, tries: 0 }, modelA: { seen: false, choice: null, tries: 0, first: null },
  hovHelp: false, handed: false
});
export function fix(g) {
  const d = fresh(); for (const k in d) if (g[k] === undefined) g[k] = d[k];
  for (const k of ["li", "cp", "draws", "mys", "flaw", "modelA"]) for (const j in d[k]) if (g[k][j] === undefined) g[k][j] = d[k][j];
  for (const t of Object.values(g.draws)) if (!t.bars || t.bars.length !== 6) t.bars = V.newBars();
  if (!g.cpBars || g.cpBars.length !== 6) g.cpBars = V.newBars();
  return g;
}
// The lock must survive a reload, and "Start over" on the saved-lab screen must not wipe it: the app asks before it offers that.
export const noRestart = (g) => !!(g && g.lock);
export async function load(lab, getJSON) { try { lab.pinHash = (await getJSON("content/config.json")).pesPinHash || ""; } catch (e) { lab.pinHash = ""; } lab.prelab = { questions: [] }; }

const CSS = `
.pesRoot{display:grid;grid-template-columns:250px 1fr 330px;grid-template-rows:322px 1fr;gap:10px 12px;height:620px;position:relative;font-size:13px}
.pesRoot h3{margin:0 0 4px;font-size:13px}.pesRoot .pes-left{grid-row:1 / 3;display:flex;flex-direction:column;gap:8px;overflow:auto}
.pesCar{display:grid;grid-template-columns:repeat(5,1fr);gap:3px}.pesCar button,.pesMys button{padding:3px 0;font-size:12px;line-height:1.1;min-height:34px}.pesCar small,.pesMys small{display:block;font-size:9px;opacity:.7}
.pesMys{display:grid;grid-template-columns:repeat(4,1fr);gap:3px}.pesCar .on,.pesMys .on{outline:3px solid #ffd23f}
.pesDial input[type=range]{width:100%}.pesBands{display:flex;height:14px;font-size:10px;margin-top:2px;border-radius:3px;overflow:hidden}.pesBands span{text-align:center;color:#111;overflow:hidden;white-space:nowrap}
.pesRoot canvas{display:block;border:1px solid var(--line);border-radius:6px;max-width:100%}
.pesGuideTxt{font-size:10.5px;line-height:1.28;margin:3px 0 0;color:var(--ink)}.pesStepCard h3,.pesRoot h3{font-family:inherit}.pesBandLab{position:relative;height:13px;font-size:10px;margin-bottom:2px}.pesBandLab span{position:absolute;white-space:nowrap}.pesGuideTxt b{color:#ffd23f}
.pesStepCard{grid-column:2 / 4;border:1px solid var(--line);border-radius:10px;padding:8px 12px;overflow:auto;position:relative}
.pesStepCard h3{font-size:14px}.pesStepCard .pesMsg{margin:6px 0;font-weight:600}.pesMsg.ok{color:#58d68d}.pesMsg.no{color:#ffb454}
.pesTable{display:grid;grid-template-columns:repeat(18,24px);grid-auto-rows:24px;gap:2px}.pesEl{font-size:10px;padding:0;line-height:1;border-radius:3px}.pesEl small{display:block;font-size:7px;opacity:.7}.pesEl.on{outline:3px solid #ffd23f}.pesEl.hi{background:#2b6cb0;color:#fff}
.pesBench{margin:6px 0}.pesBenchRow{display:flex;gap:8px}.pesSlot{width:70px;display:flex;flex-direction:column;gap:3px;align-items:center;border:1px solid var(--line);border-radius:6px;padding:3px}
.pesSlot.ok{border-color:#58d68d}.pesSlot.bad{border-color:#ff7a6b}.pesBarBox{height:72px;width:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}.pesBar{width:34px;background:#4f9bd9;border-radius:2px 2px 0 0}
.pesPM{display:flex;gap:4px}.pesPM button{padding:0 9px}.pesSlot select{width:62px}.pesBenchAx{display:flex;justify-content:space-between;font-size:11px;opacity:.8;margin-top:2px;width:470px}
.pesLock{position:absolute;inset:0;background:#0f1620;color:#fff;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;border-radius:10px}
.pesLock[hidden]{display:none}.pesLock h2{font-size:26px;margin:0}.pesLock .pin{font-size:20px;width:7em;text-align:center}
.pesRoot .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.pesRoot .note{font-size:12px;opacity:.9}
.pesRun{font-size:12px}.pesRun b{color:#ffd23f}
`;

export function create(ctx) {
  const { lab, S, log, say, onChange } = ctx, U = lab.ui, A = lab.arrows, G = () => S.flame, $ = (id) => document.getElementById(id);
  const live = () => ["lab", "postlab", "done"].includes(S.stage) || ctx.isDemo();
  const ev = (type, data) => { if (!ctx.isDemo()) log.add(type, data); };
  const seedNum = () => hash(String(ctx.studentKey() || "anon") + "|pes|" + (lab.id || ""));
  const isOpen = () => { const d = $("dlgNotebook"); return !!(d && d.open); };
  const spec = (Z) => (Z ? D.labSpectrum(Z) : null);
  const nameOf = (Z) => (Z ? D.SYMBOLS[Z - 1] : "");
  const changed = () => { if (!ctx.isDemo()) onChange(); };

  // ---------- which step ----------
  const freeSet = () => new Set(G().runs.filter((r) => r.phase === "free" && r.complete).map((r) => r.Z));
  const bDone = () => DRAW_ORDER.every((k) => G().draws[k].ok && G().draws[k].compared);
  const aDone = () => { const f = freeSet(); return [10, 11, 16].every((z) => f.has(z)) && f.size >= 4; };
  const cDone = () => MYS.every((k) => G().mys[k].ok) && G().flaw.ok;
  function stepId() {
    const g = G();
    if (!g.li.done) return "li"; if (!aDone()) return "free"; if (!g.cp.read.passed) return "cp1"; if (!bDone()) return "bdraw"; if (!g.cp.draw.passed) return "cp2";
    if (!cDone()) return "mystery"; if (!g.cp.match.passed) return "cp3"; if (g.modelA.choice !== "nofit") return "modelA"; if (!(g.draws.P.ok && g.draws.P.compared)) return "phos"; return "done";
  }
  const stepIdx = () => STEPS.indexOf(stepId()), god = () => ctx.isKey();
  const redoType = () => Object.keys(G().cp).find((t) => G().cp[t].redo) || null;
  const blocked = () => !!G().lock || !!redoType();
  function questState() {
    const g = G(), f = freeSet(), n = (a) => a.filter(Boolean).length;
    return { li_pick: g.li.pick, li_fire: g.li.fire, li_sweep: g.li.low && g.li.maxMJ >= 0.6, li_peak: g.li.peak, li_done: g.li.done, a_runs: aDone(), _a_runs: Math.min(4, f.size), cp1: g.cp.read.passed, b_draw: bDone(), _b_draw: n(DRAW_ORDER.map((k) => g.draws[k].ok && g.draws[k].compared)),
      cp2: g.cp.draw.passed, c_cells: cDone(), _c_cells: n([...MYS.map((k) => g.mys[k].ok), g.flaw.ok]), cp3: g.cp.match.passed, d_model: g.modelA.choice === "nofit", e_phos: g.draws.P.ok && g.draws.P.compared, handed: g.handed, t_help: g.hovHelp, _knowns: 0 };
  }

  // ---------- the detector ----------
  let det, zoom = { hit: null, t: 99, none: false }, flash = 0, cpNote = null, selPeak = null, lastG = null, rebuild = null;
  const newDet = (Z, label) => { const d = { Z, label: label || "", spec: spec(Z), tally: {}, bins: {}, expo: {}, photons: 0, hits: 0, firing: false, acc: 0, recorded: true, fast: false, overlay: null, t0: 0 };
    if (d.spec) for (const o of d.spec) { d.tally[o.sub] = 0; d.bins[o.sub] = Array(9).fill(0); d.expo[o.sub] = 0; } return d; };
  det = newDet(0);
  const rngS = () => Math.random();
  const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += Math.random(); return (s - 3) / 0.7071; };
  const lightMJ = () => E.photonFromSlider(G().u), speedMul = () => (det.fast ? 14 : 1);
  function pick(id, free = false) {   // id: Z number, or "A".."D" for a mystery cell
    const g = G(); if ((blocked() && !free) || !live()) return false;
    const mys = typeof id === "string"; if (!free && !canPick(id)) return false;
    ensureMys(); const Z = mys ? g.mys[id].Z : id;
    if (det.Z === Z && det.label === (mys ? id : "")) return true;
    if (det.firing) stopRun("switch");
    det = newDet(Z, mys ? id : ""); g.el = mys ? id : Z; selPeak = null; rebuild = null; els.peak.textContent = "Click a peak to see what it is."; zoom = { hit: null, t: 99, none: false };
    if (Z === 3 && !mys) g.li.pick = true;
    ev("pes_pick", { el: mys ? id : nameOf(Z), step: stepId() }); say(mys ? `Mystery cell ${id} is loaded.` : `${nameOf(Z)} vapor is loaded.`);
    syncLeft(); renderStep(); changed(); return true;
  }
  const canPick = (id) => { if (god()) return true; const i = stepIdx(); if (stepId() === "li") return id === 3; if (typeof id === "string") return i >= STEPS.indexOf("mystery") && (MYS.indexOf(id) <= MYS.findIndex((k) => !G().mys[k].ok) || MYS.every((k) => G().mys[k].ok)); return true; };
  function ensureMys() {
    const g = G(); if (MYS.every((k) => g.mys[k].Z)) return; const used = new Set(), r = seedNum();
    MYS.forEach((k, i) => { if (g.mys[k].Z) { used.add(g.mys[k].Z); return; } const pool = []; for (let z = 1; z <= lab.mystery.max[k]; z++) if (!lab.mystery.skip.includes(z) && !used.has(z)) pool.push(z);
      const Z = pool[hash(r + "|" + k) % pool.length]; g.mys[k].Z = Z; used.add(Z); });
  }
  function fire() {
    const g = G(); if (!live() || blocked()) return; if (!det.Z) return say("Pick a sample in the carousel first.", "warn");
    if (det.firing) return; det.firing = true; det.recorded = false; det.t0 = det.t0 || performance.now();
    if (det.Z === 3 && !det.label) g.li.fire = true; ev("pes_fire", { el: det.label || nameOf(det.Z), MJ: +lightMJ().toFixed(3) }); syncLeft(); changed();
  }
  const subsSeen = () => det.spec ? det.spec.filter((o) => det.tally[o.sub] >= 15).map((o) => o.sub) : [];
  function stopRun(why) {
    if (!det.firing && det.recorded) return; det.firing = false; if (!det.hits || det.recorded) { syncLeft(); return; } det.recorded = true;
    const g = G(), step = stepId(), seen = subsSeen(), complete = !!det.spec && seen.length === det.spec.length && det.hits >= 400;
    const run = { Z: det.Z, mys: det.label || null, phase: det.phase || PHASE[step] || "free", step, MJ: +lightMJ().toFixed(3), band: E.lightBand(lightMJ()), bright: +g.b.toFixed(2), photons: det.photons, hits: det.hits, subs: seen, complete, why, at: Math.round((performance.now() - det.t0) / 1000) };
    g.runs.push(run); ev("pes_run", { ...run, el: det.label || nameOf(det.Z) });
    if (det.Z === 3 && !det.label && complete && run.phase === "guided") g.li.done = true;
    if (det.label && complete && run.phase === "mystery") g.mys[det.label].ran = true;
    syncLeft(); renderStep(); changed();
  }
  function clearRun() { if (det.firing) return; const Z = det.Z, l = det.label; det = newDet(Z, l); selPeak = null; zoom = { hit: null, t: 99, none: false }; syncLeft(); }
  // The detector. Brightness sets photons per second and nothing else. A photon frees an electron only if its energy beats the subshell's binding energy.
  function detStep(dt) {
    if (!det.firing || !det.spec) return; const g = G(), MJ = lightMJ(); det.acc += E.rateFromBrightness(g.b) * dt * speedMul(); const n = Math.min(60, Math.floor(det.acc)); det.acc -= n;
    if (det.Z === 3 && !det.label) { if (MJ < 0.35) g.li.low = true; g.li.maxMJ = Math.max(g.li.maxMJ, MJ); }
    const fr = E.freed(det.spec, MJ), tot = fr.reduce((a, o) => a + o.count, 0);
    for (let i = 0; i < n; i++) {
      det.photons++; for (const o of fr) det.expo[o.sub] += 1 / tot;
      const hit = E.fireOne(det.spec, MJ, rngS);
      if (hit) { det.tally[hit.sub]++; det.hits++; const k = Math.max(-V.HALF, Math.min(V.HALF, Math.round(gauss() * V.SIG))); det.bins[hit.sub][k + V.HALF]++;
        if (zoom.t > 0.7) { zoom = { hit: { ...hit, photonMJ: MJ, bindMJ: hit.MJ }, t: 0, none: false }; } }
      else if (zoom.t > 0.7) zoom = { hit: null, t: 0, none: true };
    }
    if (det.hits >= (det.fast ? 900 : 1500)) { stopRun(det.fast ? "compare" : "auto"); onRunEnd(); }
  }
  let onEnd = null; const onRunEnd = () => { const f = onEnd; onEnd = null; if (f) f(); };

  // ---------- drawing ----------
  const peaksNow = () => !det.spec ? [] : det.spec.map((o) => { const u = Math.max(det.expo[o.sub], 1e-9), bins = det.bins[o.sub].map((v) => v / u / 0.332); return { sub: o.sub, MJ: o.MJ, count: o.count, bins, h: Math.max(...bins), hits: det.tally[o.sub] }; }).filter((p) => p.hits > 0);
  function drawAll(dt) {
    if (!isOpen() || !els.spec) return; const shown = peaksNow();
    const ov = det.overlay ? { ...det.overlay, model: rebuild ? Math.min(1, rebuild.t / 2) : det.overlay.model } : null;
    els.geo = V.drawSpectrum(els.spec, shown, { selected: selPeak, overlay: ov, ymax: ov && ov.modelBars ? 9 : 7 }); zoom.t += dt;
    V.drawZoom(els.zoom, { Z: det.Z, spec: det.spec, hit: zoom.hit, t: zoom.t, none: zoom.none && zoom.t < 2.2 });
    if (rebuild) { rebuild.t += dt; if (rebuild.t > 2.4 && rebuild.after) { const f = rebuild.after; rebuild.after = null; f(); } }
    els.run.textContent = det.Z ? (det.firing ? `Counting… ${det.hits} electrons caught from ${det.photons} photons.` : det.hits ? `Stopped. ${det.hits} electrons caught from ${det.photons} photons.` : (zoom.none || det.photons ? "Nothing leaves. This light is too weak." : "Ready. Press Fire.")) : "Pick a sample.";
    els.run.className = "pesRun";
  }
  function onSpecClick(ev0) {
    const r = els.spec.getBoundingClientRect(), x = (ev0.clientX - r.left) * (els.spec.width / r.width), p = peaksNow(), sub = V.peakAt(els.spec, p, x); if (!sub || !det.spec) return;
    const flaw = flawPending();
    if (flaw) return flawClick(sub);
    selPeak = sub; const o = det.spec.find((q) => q.sub === sub);
    els.peak.textContent = `${sub}: ${o.count} ${o.count === 1 ? "electron" : "electrons"} in this subshell, held at ${o.MJ.toFixed(o.MJ < 10 ? 2 : 1)} MJ/mol.`;
    ev("pes_peak", { sub, el: det.label || nameOf(det.Z) }); if (det.Z === 3 && !det.label) { G().li.peak = true; changed(); }
  }

  // ---------- the screen ----------
  const els = {}; let styleOn = false;
  function build() {
    if (!styleOn) { styleOn = true; document.head.append(h("style", {}, CSS)); }
    els.spec = h("canvas", { id: "pesSpectrum", width: 560, height: 250, style: "width:560px;height:250px", "aria-label": "Spectrum: binding energy on the bottom, number of electrons up the side", onclick: onSpecClick });
    els.zoom = h("canvas", { id: "pesZoom", width: 330, height: 172, style: "width:330px;height:172px", "aria-label": "Zoom view of one atom: a photon hits and an electron leaves" });
    els.peak = h("p", { id: "pesPeak", class: "note", style: "margin:3px 0;min-height:16px" }, "Click a peak to see what it is.");
    els.run = h("p", { class: "pesRun", style: "margin:2px 0" });
    els.guide = h("div", { id: "pesReading" }, lab.reading.map(([k, t]) => h("p", { class: "pesGuideTxt" }, h("b", {}, k + ". "), t)));
    els.car = h("div", { id: "pesCarousel", class: "pesCar" }, Array.from({ length: 20 }, (_, i) => i + 1).map((Z) => h("button", { type: "button", id: "pesCell_" + Z, "data-z": Z, onclick: () => pick(Z) }, h("small", {}, String(Z)), nameOf(Z))));
    els.mys = h("div", { id: "pesMysteryCells", class: "pesMys" }, MYS.map((k) => h("button", { type: "button", id: "pesCell_" + k, onclick: () => pick(k) }, h("small", {}, "mystery"), k)));
    els.color = h("input", { type: "range", id: "pesColor", min: 0, max: 1000, step: 1, "aria-label": "Light color", oninput: (e) => { G().u = e.target.value / 1000; syncLeft(); } });
    els.bright = h("input", { type: "range", id: "pesBright", min: 0, max: 1000, step: 1, "aria-label": "Brightness", oninput: (e) => { G().b = e.target.value / 1000; syncLeft(); } });
    els.colorRead = h("div", { id: "pesColorRead" }); els.brightRead = h("div", { id: "pesBrightRead" });
    const bp = (a, b) => (E.sliderFromPhoton(b) - E.sliderFromPhoton(a)) * 100;
    els.bands = h("div", { class: "pesBands" }, h("span", { style: `width:${bp(0.2, 0.35)}%;background:#ffe08a` }, ""), h("span", { style: `width:${bp(0.35, 12)}%;background:#c9a8ff` }, ""), h("span", { style: `width:${bp(12, 400)}%;background:#8fd3ff` }, ""));
    { const c0 = (a, b) => (E.sliderFromPhoton(a) + E.sliderFromPhoton(b)) / 2 * 100; els.bandLab = h("div", { class: "pesBandLab" }, h("span", { style: "left:0" }, U.visibleWord), h("span", { style: `left:${c0(0.35, 12) - 8}%` }, U.uvWord), h("span", { style: `left:${c0(12, 400) - 3}%` }, U.xrayWord)); }
    els.fire = h("button", { id: "pesFire", class: "primary", onclick: fire }, U.fire); els.stop = h("button", { id: "pesStop", onclick: () => stopRun("student") }, U.stop); els.clear = h("button", { id: "pesClear", onclick: clearRun }, U.clear);
    els.stepCard = h("div", { id: "pesStep", class: "pesStepCard" });
    els.lock = h("div", { id: "pesLock", class: "pesLock", hidden: "" });
    els.close = h("button", { class: "x", "data-close": "", style: "position:absolute;right:0;top:-8px;z-index:4" }, "Close ✕");
    els.root = h("div", { class: "pesRoot" }, els.close,
      h("div", { class: "pes-left" },
        h("div", {}, h("h3", {}, U.carousel), els.car, els.mys),
        h("div", { class: "pesDial" }, h("h3", {}, U.lightHead), els.color, els.bands, els.bandLab, els.colorRead),
        h("div", { class: "pesDial" }, h("h3", {}, U.brightHead), els.bright, els.brightRead),
        h("div", { class: "row" }, els.fire, els.stop, els.clear)),
      h("div", {}, els.spec, els.peak, els.run), h("div", {}, h("h3", {}, "Zoom view"), els.zoom, els.guide), els.stepCard, els.lock);
    els.root.addEventListener("mouseover", (e) => { if (e.target.closest && e.target.closest("#pesHelp") && !G().hovHelp) { G().hovHelp = true; changed(); } });
    return els.root;
  }
  const sheet = build();
  function syncLeft() {
    const g = G(), b = blocked(), si = stepIdx();
    for (const Z of Array.from({ length: 20 }, (_, i) => i + 1)) { const c = $("pesCell_" + Z); if (c) { c.disabled = b || (!canPick(Z)); c.classList.toggle("on", det.Z === Z && !det.label); } }
    for (const k of MYS) { const c = $("pesCell_" + k); if (c) { c.disabled = b || !canPick(k); c.classList.toggle("on", det.label === k); } }
    els.color.value = Math.round(g.u * 1000); els.bright.value = Math.round(g.b * 1000);
    const MJ = lightMJ(); els.colorRead.textContent = `${MJ < 10 ? MJ.toFixed(2) : MJ.toFixed(0)} MJ/mol · ${E.lightBand(MJ)}`; els.brightRead.textContent = `${E.rateFromBrightness(g.b)} photons per second`;
    els.fire.disabled = b || det.firing || !det.Z; els.stop.disabled = !det.firing; els.clear.disabled = det.firing || !det.hits; els.color.disabled = b; els.bright.disabled = b;
  }

  // ---------- step card ----------
  let sig = "";
  function renderStep() {
    const g = G(); renderLock(); if (!els.stepCard) return; const st = stepId(), rt = redoType(); sig = [st, !!g.lock, rt, g.cp.read.n, g.cp.draw.n, g.cp.match.n].join("|");
    const kids = [];
    if (rt && !g.lock) { kids.push(h("h3", {}, `Mr. D unlocked your screen. ${U.redoNote.replace("{n}", g.cp[rt].need)}`)); kids.push(...cpBody(rt)); }
    else if (st === "li" || st === "free") kids.push(...partA(st));
    else if (CP_OF[st]) { kids.push(h("h3", {}, lab.steps[st])); kids.push(...cpBody(CP_OF[st])); }
    else if (st === "bdraw") kids.push(...drawBody(DRAW_ORDER.find((k) => !(g.draws[k].ok && g.draws[k].compared)), "Part B"));
    else if (st === "mystery") kids.push(...mysBody());
    else if (st === "modelA") kids.push(...modelBody());
    else if (st === "phos") kids.push(...drawBody("P", "Part E"));
    else kids.push(h("h3", {}, lab.steps.done), h("p", {}, U.handNote), h("div", { class: "row" }, h("button", { id: "pesHand", class: "primary", onclick: handIn }, "Hand in")));
    if (st !== "done") kids.push(h("div", { class: "row", style: "margin-top:8px" }, h("button", { id: "pesHelp", disabled: g.lock ? "" : null, onclick: () => helpNow() }, U.help), h("span", { class: "note" }, "Stuck? This locks your screen until Mr. D comes.")));
    els.stepCard.replaceChildren(...kids); syncLeft();
  }
  function partA(st) {
    const g = G(), f = freeSet(), chip = (Z) => h("span", { class: "pesRun" }, (f.has(Z) ? "✔ " : "○ ") + nameOf(Z) + "   ");
    if (st === "li") return [h("h3", {}, lab.steps.li), h("p", { class: "note" }, g.li.maxMJ >= 0.6 ? "Why is the bottom axis squeezed together? The hardest-held peak would fall off a normal page. Each step on the axis is ten times the last one." : "Light that is too weak frees nothing, however bright. Most visible light frees nothing at all.")];
    const extra = [...f].filter((z) => ![10, 11, 16].includes(z)).length;
    return [h("h3", {}, lab.steps.free), h("p", {}, chip(10), chip(11), chip(16), h("span", { class: "pesRun" }, (extra ? "✔ " : "○ ") + "one you choose")), h("p", { class: "note" }, "A run counts when every peak has shown. Raise the light color if a peak is missing, then press Stop.")];
  }

  // ----- checkpoints: three right in a row, a hint after a miss, never the answer -----
  function cpBody(type) {
    const g = G(), t = g.cp[type], item = Pr.labSpec(t.n, type, seedNum()), out = [];
    if (cpNote && cpNote.type === type) out.push(h("p", { class: "pesMsg " + (cpNote.ok ? "ok" : "no"), role: "status" }, cpNote.text));
    out.push(h("p", { class: "note" }, `${item.title}. In a row: ${t.streak} of ${t.need}.`), h("p", {}, item.q));
    const submit = (attempt) => submitCp(type, attempt);
    if (type === "match") {
      const cv = h("canvas", { id: "pesCpSpec", width: 400, height: 170, style: "width:400px;height:170px" }); setTimeout(() => V.drawSpectrum(cv, Pr.labRecompute({ kind: "draw", Z: item.p.Z }).map((b) => ({ ...b })).map((b) => { const o = D.labSpectrum(item.p.Z).find((q) => q.sub === b.sub); return { sub: b.sub, MJ: o.MJ, count: o.count }; }), { labels: false }), 0);
      let pickZ = 0; const per = h("input", { id: "pesPeriod", type: "number", min: 1, max: 4, style: "width:3.5em", "aria-label": "Period" }), grp = h("input", { id: "pesGroup", type: "number", min: 1, max: 18, style: "width:3.5em", "aria-label": "Group" });
      const tbl = V.periodicTable({ id: "pesTable", onPick: (Z) => { pickZ = Z; tbl.querySelectorAll(".pesEl").forEach((b) => b.classList.toggle("on", +b.dataset.z === Z)); } });
      out.push(h("div", { class: "row", style: "align-items:flex-start" }, cv, h("div", {}, tbl, h("div", { class: "row", style: "margin-top:6px" }, "Period", per, "Group", grp, h("button", { id: "pesCheck", class: "primary", onclick: () => submit({ Z: pickZ, period: per.value, group: grp.value }) }, "Check")))));
    } else if (type === "draw") {
      const bench = V.bench(g.cpBars, () => {}); out.push(bench, h("div", { class: "row" }, h("button", { id: "pesCheck", class: "primary", onclick: () => submit(V.barsOf(g.cpBars)) }, "Check")));
    } else {
      const Z = item.p.Z, cv = h("canvas", { id: "pesCpSpec", width: 400, height: 170, style: "width:400px;height:170px" }); setTimeout(() => V.drawSpectrum(cv, D.labSpectrum(Z).map((o) => ({ sub: o.sub, MJ: o.MJ, count: o.count })), { labels: false }), 0);
      const inp = h("input", { id: "pesAnswer", type: "text", autocomplete: "off", style: "width:6em", "aria-label": "Answer" }); inp.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(inp.value); });
      out.push(h("div", { class: "row" }, cv, h("div", {}, inp, " ", item.unit, h("div", { class: "row", style: "margin-top:6px" }, h("button", { id: "pesCheck", class: "primary", onclick: () => submit(inp.value) }, "Check")))));
    }
    return out;
  }
  function submitCp(type, attempt) {
    const g = G(), t = g.cp[type], item = Pr.labSpec(t.n, type, seedNum()), ok = Pr.grade(item, attempt), diag = ok ? null : Pr.diagnose(item, attempt);
    t.att.push({ n: t.n, p: item.p, ok, hint: diag ? diag.code : null, at: new Date().toISOString() });
    ev("pes_attempt", { type, n: t.n, ok, p: item.p, answer: type === "match" ? { Z: attempt.Z, period: attempt.period, group: attempt.group } : attempt, code: diag ? diag.code : null, redo: t.redo });
    t.n++; if (type === "draw") g.cpBars = V.newBars();
    if (ok) { t.streak++; t.miss = 0; cpNote = { type, ok: true, text: `${U.cpRight} ${t.streak} of ${t.need} in a row.` };
      if (t.streak >= t.need) { if (!t.redo || t.atCp || t.passed) t.passed = true; t.redo = false; t.need = 3; t.streak = 0; cpNote = { type, ok: true, text: U.cpPass }; ev("pes_pass", { type, redo: false }); } }
    else { t.streak = 0; t.miss++; cpNote = { type, ok: false, text: `${U.cpMiss} ${diag.hint} Here is a new one.` }; if (t.miss >= 3) { lockNow(type, "misses"); return; } }
    renderStep(); changed();
  }

  // ----- lock, help and the PIN -----
  function lockNow(type, reason) {
    const g = G(); if (g.lock) return; if (god() && !ctx.isDemo()) { say("Teacher key: a student's screen would lock here.", "warn"); return; } det.firing = false; const step = stepId();
    g.lock = { type, reason, step, at: new Date().toISOString() }; g.cp[type].atCp = CP_OF[step] === type; if (reason === "help") g.cp[type].helps++;
    g.locks.push({ type, reason, step, at: g.lock.at, unlockedAt: null }); ev("pes_lock", { type, reason, step });
    if (!ctx.isDemo()) { try { localStorage.setItem("vlab:" + lab.id + ":lock", JSON.stringify({ type, reason, at: g.lock.at, student: S.student })); } catch (e) { /* the saved lab keeps it too */ } }
    renderStep(); changed();
  }
  function helpNow() { if (!live() || G().lock) return; const g = G(); g.helps.push({ step: stepId(), at: new Date().toISOString() }); ev("pes_help", { step: stepId() }); lockNow(LOCK_TYPE[stepId()], "help"); }
  async function tryUnlock(pin) {
    const g = G(), ok = lab.pinHash ? (await sha256Hex("pes-pin:" + String(pin).trim())) === lab.pinHash : false;
    ev("pes_unlock_try", { ok }); if (!ok) { const m = $("pesPinMsg"); if (m) m.textContent = U.pinWrong; return false; }
    realUnlock(); return true;
  }
  function realUnlock() {
    const g = G(), L = g.lock; if (!L) return; const t = g.cp[L.type]; t.unlocks++; t.streak = 0; t.miss = 0; t.need = 2; t.redo = true;   // only this type is reset
    const last = [...g.locks].reverse().find((x) => !x.unlockedAt); if (last) last.unlockedAt = new Date().toISOString(); g.lock = null; cpNote = null;
    ev("pes_unlock", { type: L.type }); if (!ctx.isDemo()) { try { localStorage.removeItem("vlab:" + lab.id + ":lock"); } catch (e) { /* ignore */ } }
    renderStep(); changed();
  }
  function renderLock() {
    const g = G(), L = g.lock, d = $("dlgNotebook"); if (!els.lock) return; els.lock.hidden = !L; els.close.hidden = !!L;
    if (d && !ctx.isDemo()) { if (L) d.setAttribute("data-gate", ""); else d.removeAttribute("data-gate"); }
    if (!L) return; const pin = h("input", { id: "pesPin", class: "pin", type: "password", inputmode: "numeric", autocomplete: "off", "aria-label": U.unlockWord }); pin.addEventListener("keydown", (e) => { if (e.key === "Enter") go.click(); });
    const go = h("button", { id: "pesPinGo", class: "primary", onclick: () => tryUnlock(pin.value) }, "Unlock");
    els.lock.replaceChildren(h("h2", {}, U.lockHead), h("p", {}, L.reason === "help" ? U.lockHelp : U.lockMiss), h("p", {}, U.lockBody), h("div", { class: "row" }, h("b", {}, U.unlockWord), pin, go), h("p", { id: "pesPinMsg", class: "pesMsg no" }));
  }

  // ----- draw bench (Parts B and E) -----
  function drawBody(k, part) {
    const g = G(), d = g.draws[k], Z = Zof(k), out = [], ans = Pr.labRecompute({ kind: "draw", Z });
    const cfg = k === "Si" || k === "P" ? `${k} (Z = ${Z}) is in period ${Pr.periodOf(Z)}, group ${Pr.groupOf(Z)}. Find it on the table and work out its configuration.` : `${k} (Z = ${Z}): ${Pr.configText(Z)}.`;
    out.push(h("h3", {}, `${part}. Draw the spectrum for ${k}.`), h("p", {}, cfg + " One bar for each subshell: order, height and label."));
    if (d.hint) out.push(h("p", { class: "pesMsg no", role: "status" }, d.hint));
    if (d.ok && !d.compared) out.push(h("p", { class: "pesMsg ok" }, "Your drawing is right. Now compare it with the real run."));
    const marks = d.lastMarks || null, bench = V.bench(d.bars, () => { d.ok = false; }, { id: "pesDraw", marks });
    const showTbl = k === "Si" || k === "P"; const tbl = showTbl ? V.periodicTable({ id: "pesTable", hilite: Z }) : null;
    out.push(h("div", { class: "row", style: "align-items:flex-start" }, bench, tbl));
    out.push(h("div", { class: "row" }, h("button", { id: "pesCheck", class: "primary", onclick: () => checkDraw(k) }, "Check my drawing"), h("button", { id: "pesCompare", disabled: d.tries ? null : "", onclick: () => compare(k) }, "Compare with the real run")));
    return out;
  }
  function checkDraw(k) {
    const g = G(), d = g.draws[k], Z = Zof(k), item = { type: "draw", ans: Pr.labRecompute({ kind: "draw", Z }), p: { kind: "draw", Z } }, bars = V.barsOf(d.bars), r = Pr.gradeDraw(item, bars);
    d.tries++; d.ok = r.ok; d.lastMarks = r.rows.map((x) => ({ ok: x.ok })); const diag = r.ok ? null : Pr.diagnose(item, bars); d.hint = r.ok ? "" : diag.hint; d.att.push({ bars, ok: r.ok, code: diag ? diag.code : null });
    ev("pes_draw", { el: k, ok: r.ok, code: diag ? diag.code : null, bars }); renderStep(); changed();
  }
  // Run the real thing at full light, fast, then draw the student's bars over it and rebuild the model from the electron counts.
  function compare(k, then) {
    const g = G(), Z = typeof k === "number" ? k : Zof(k), sp = spec(Z), mx = Math.max(...sp.map((o) => o.MJ)); if (blocked() || !sp) return;
    if (det.firing) stopRun("switch"); det = newDet(Z, ""); det.fast = true; det.phase = "compare"; det.t0 = performance.now(); g.el = Z; g.u = Math.min(1, E.sliderFromPhoton(mx * 1.3)); selPeak = null; rebuild = null; els.peak.textContent = "Click a peak to see what it is."; zoom = { hit: null, t: 99, none: false };
    onEnd = () => { det.fast = false; const d = typeof k === "string" ? g.draws[k] : null;
      if (d) det.overlay = { student: V.barsOf(d.bars).map((b, i) => ({ ...b, ok: !!(d.lastMarks && d.lastMarks[i] && d.lastMarks[i].ok) })) };
      rebuild = { t: 0, after: () => { if (d) { d.compared = true; ev("pes_compare", { el: k, ok: d.ok }); renderStep(); changed(); } if (then) then(); } }; };
    fire(); syncLeft(); renderStep();
  }

  // ----- mystery cells (Part C) -----
  const flawPending = () => stepId() === "mystery" && MYS.every((k) => G().mys[k].ok) && !G().flaw.ok;
  function flawClick(sub) {
    const g = G(), want = det.spec[0].sub; g.flaw.tries++; const ok = sub === want; if (ok) g.flaw.ok = true;
    ev("pes_flaw", { sub, ok }); els.peak.textContent = ok ? "Yes. The left peak is held hardest. Taller only means more electrons." : "Height counts electrons. Hardest-held is about position on the bottom axis. Look again."; renderStep(); changed();
  }
  function mysBody() {
    const g = G(), cur = MYS.find((k) => !g.mys[k].ok), out = [];
    if (!cur) return [h("h3", {}, lab.steps.mystery), h("p", {}, lab.flaw.say), h("p", { class: "pesMsg" }, lab.flaw.ask), g.flaw.tries && !g.flaw.ok ? h("p", { class: "pesMsg no" }, "Height counts electrons. Hardest-held is about position on the bottom axis.") : null].filter(Boolean);
    const m = g.mys[cur]; ensureMys(); out.push(h("h3", {}, `${lab.steps.mystery} Now: cell ${cur}.`));
    if (!m.ran) { out.push(h("p", {}, `Pick cell ${cur} in the carousel, press Fire, raise the light until every peak shows, then Stop.`)); return out; }
    if (m.hint) out.push(h("p", { class: "pesMsg no", role: "status" }, m.hint));
    let pickZ = m.pick || 0; const per = h("input", { id: "pesPeriod", type: "number", min: 1, max: 4, value: m.period, style: "width:3.5em", "aria-label": "Period" }), val = h("input", { id: "pesValence", type: "number", min: 1, max: 8, value: m.val, style: "width:3.5em", "aria-label": "Valence electrons" });
    const tbl = V.periodicTable({ id: "pesTable", picked: pickZ, onPick: (Z) => { pickZ = Z; m.pick = Z; tbl.querySelectorAll(".pesEl").forEach((b) => b.classList.toggle("on", +b.dataset.z === Z)); } });
    out.push(h("p", { class: "note" }, "Click the element on the table. Period: count the shells in use. Valence electrons: add the last s height and the last p height."),
      h("div", { class: "row", style: "align-items:flex-start" }, tbl, h("div", { class: "row" }, "Period", per, "Valence electrons", val, h("button", { id: "pesCheck", class: "primary", onclick: () => checkMys(cur, pickZ, per.value, val.value) }, "Check"))));
    return out;
  }
  function checkMys(k, pickZ, period, val) {
    const g = G(), m = g.mys[k], Z = m.Z, wantP = Pr.periodOf(Z), wantV = Pr.valenceOf(Z); m.tries++; m.pick = pickZ; m.period = period; m.val = val;
    const okZ = pickZ === Z, okP = +period === wantP, okV = +val === wantV; m.ok = okZ && okP && okV; let code = null;
    if (!pickZ) { m.hint = "Click an element on the table first."; code = "noPick"; }
    else if (!okZ) { const n = D.occupied(pickZ).length; m.hint = n !== D.occupied(Z).length ? `The element you picked gives ${n} peaks. Count the peaks in this spectrum.` : `Add up the heights of the peaks. The element you picked has ${pickZ} electrons.`; code = "Z"; }
    else if (!okP) { m.hint = "Your element is right. Period is the number of shells in use: the highest first number among the peaks."; code = "period"; }
    else if (!okV) { m.hint = "Your element is right. Valence electrons are the last s height plus the last p height."; code = "valence"; }
    else m.hint = "";
    m.att.push({ pick: pickZ, period, val, ok: m.ok, code }); ev("pes_mystery", { cell: k, pick: pickZ ? nameOf(pickZ) : null, period, val, ok: m.ok, code, Z: nameOf(Z) }); renderStep(); changed();
  }

  // ----- Part D: Model A on neon -----
  function modelBody() {
    const g = G(), m = g.modelA, out = [h("h3", {}, lab.steps.modelA), h("p", {}, lab.model.A)];
    if (!m.seen) { out.push(h("button", { id: "pesModelShow", class: "primary", onclick: showModel }, "Show Model A on neon's real run")); return out; }
    out.push(h("p", {}, lab.model.ask)); if (m.choice === "fit") out.push(h("p", { class: "pesMsg no" }, "Look again. Count the peaks in each, and where the dark bars sit against the outlined ones."));
    if (m.choice === "nofit") out.push(h("p", { class: "pesMsg ok" }, lab.model.after));
    out.push(h("div", { class: "row" }, h("button", { id: "pesFit", onclick: () => modelChoice("fit") }, U.fitWord), h("button", { id: "pesNoFit", onclick: () => modelChoice("nofit") }, U.noFitWord)));
    return out;
  }
  function showModel() {
    compare(10, () => { const sp = spec(10), p2 = sp.filter((o) => o.sub[0] === "2"), c2 = p2.reduce((a, o) => a + o.count, 0), mean = p2.reduce((a, o) => a + o.MJ * o.count, 0) / c2;
      det.overlay = { modelBars: [{ MJ: sp[0].MJ, count: 2, label: "shell 1" }, { MJ: mean, count: c2, label: "shell 2" }], model: 1 }; G().modelA.seen = true; ev("pes_modelA_show", {}); renderStep(); changed(); });
  }
  function modelChoice(c) { const m = G().modelA; m.tries++; if (!m.first) m.first = c; m.choice = c; ev("pes_modelA", { choice: c, tries: m.tries }); renderStep(); changed(); }
  function handIn() { const g = G(); g.handed = true; ev("pes_handin", {}); changed(); ctx.finish(); }

  // ---------- intro hook, cards, quest list, guide ----------
  function hookCanvas() { const cv = h("canvas", { width: 420, height: 190, id: "pesHook", style: "width:420px;height:190px" }); const sp = D.labSpectrum(lab.hook.Z).map((o) => ({ sub: o.sub, MJ: o.MJ, count: o.count })); setTimeout(() => V.drawSpectrum(cv, sp, { labels: false }), 0); return cv; }
  function renderIntro(box, c) {
    const key = (k, t) => h("tr", {}, h("td", {}, h("kbd", {}, k)), h("td", {}, t)), name = h("input", { id: "student", type: "text", autocomplete: "name", style: "width:18em", placeholder: "First and last name" });
    const go = h("button", { id: "introGo", class: "primary", disabled: true, onclick: () => c.onIntroDone(name.value.trim()) }, "Start the pre-lab →");
    name.addEventListener("input", () => { go.disabled = name.value.trim().length < 3; }); if (c.S.student) { name.value = c.S.student; go.disabled = name.value.trim().length < 3; }
    box.replaceChildren(h("h2", {}, lab.title), h("div", { class: "row", style: "align-items:flex-start;gap:18px" }, hookCanvas(), h("div", {}, h("h3", {}, lab.hook.ask), h("p", {}, lab.hook.note), h("p", {}, lab.intro), h("p", { class: "pesMsg" }, lab.goal))),
      h("h3", {}, "How this lab works"), h("ol", {}, lab.introSteps.map((t) => h("li", {}, t))), h("h3", {}, "Controls"), h("table", { class: "keys" }, ...lab.keyRows.map(([k, t]) => key(k, t))),
      h("label", { style: "display:block;margin:12px 0" }, "Your name ", name), h("div", { class: "controls foot" }, h("button", { id: "introDemo", onclick: c.onDemo }, "▶ Watch the demo"), go));
  }
  function cardPic(id) {
    const cv = h("canvas", { width: 300, height: 120, style: "width:300px;height:120px" }), x = cv.getContext("2d"); x.fillStyle = BG0; x.fillRect(0, 0, 300, 120); x.lineWidth = 2;
    if (id === "photoelectron") { x.fillStyle = "#9ad07a"; x.beginPath(); x.arc(170, 60, 8, 0, 7); x.fill(); x.strokeStyle = "#e0472c"; x.beginPath(); x.arc(170, 60, 36, 0, 7); x.stroke(); x.strokeStyle = "#ffe08a"; x.beginPath(); for (let i = 0; i < 70; i++) { const px = 10 + i * 1.6, py = 60 + Math.sin(i * 0.8) * 8; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); x.fillStyle = "#7fd1ff"; x.beginPath(); x.arc(250, 24, 6, 0, 7); x.fill(); x.strokeStyle = "rgba(127,209,255,.5)"; x.beginPath(); x.moveTo(176, 56); x.lineTo(250, 24); x.stroke(); }
    else if (id === "binding") { x.fillStyle = "#3a2f1f"; x.fillRect(60, 70, 180, 40); x.fillStyle = "#4f9bd9"; x.beginPath(); x.arc(150, 62, 9, 0, 7); x.fill(); x.fillStyle = "#c9ced6"; x.font = "12px system-ui"; x.fillText("tight hold: big number", 30, 20); x.fillText("loose hold: small number", 150, 110); }
    else { x.fillStyle = "#4f9bd9"; for (const [px, hh] of [[60, 40], [140, 40], [220, 90]]) x.fillRect(px, 105 - hh, 30, hh); x.fillStyle = "#c9ced6"; x.font = "11px system-ui"; x.fillText("place = how hard", 20, 14); x.fillText("height = how many", 150, 14); }
    return cv;
  }
  const BG0 = "#0f1620";
  function renderPrelab(box, c) {
    let i = 0; const cards = lab.cards, draw = () => { const cd = cards[i]; box.replaceChildren(h("h2", {}, `Card ${i + 1} of ${cards.length}: ${cd.term}`), h("div", { class: "row", style: "align-items:flex-start;gap:18px" }, cardPic(cd.id), h("p", { style: "max-width:36em;font-size:16px" }, cd.body)),
      h("div", { class: "controls foot" }, h("button", { id: "cardBack", disabled: i === 0, onclick: () => { i--; draw(); } }, "Back"), i < cards.length - 1 ? h("button", { id: "cardNext", class: "primary", onclick: () => { i++; if (!c.S.demo) log.add("pes_card", { card: cards[i].id }); draw(); } }, "Got it, next") : h("button", { id: "cardDone", class: "primary", onclick: () => c.onPrelabDone() }, "Enter the lab →"))); }; draw();
  }

  function pesGuide(id) {
    const E2 = (e, x) => (e ? ["el", e, x] : null), open = isOpen(), g = G(), btn = $("btnNotebook");
    if (id === "door") return ["tile", "door", A.door]; if (id === "spectro") return ["tile", "spectrometer", A.spectro];
    if (!open) return E2(btn, "Open the spectrometer (press N or click here).");
    if (g.lock) return null;
    switch (id) {
      case "li_pick": return E2($("pesCell_3"), A.pickLi); case "li_fire": return E2($("pesFire"), A.fire);
      case "li_sweep": return E2($("pesColor"), A.sweep); case "li_peak": return E2($("pesSpectrum"), A.peak);
      case "li_done": return det.firing && det.Z === 3 ? (subsAllSeen() ? E2($("pesStop"), "Both peaks are there. Press Stop.") : E2($("pesColor"), A.liDone)) : E2($("pesFire"), A.fire);
      case "t_help": return stepId() === "free" ? E2($("pesHelp"), A.help) : null;
      case "cp1": case "cp2": case "cp3": return stepId().startsWith("cp") ? E2($("pesAnswer") || $("pesDraw") || $("pesTable"), $("pesTable") && !$("pesAnswer") ? A.table : $("pesDraw") ? A.draw : A.check) : null;
      case "b_draw": return stepId() === "bdraw" ? E2($("pesDraw"), A.draw) : null;
      case "c_cells": return stepId() === "mystery" ? E2($("pesTable") || $("pesCell_A"), $("pesTable") ? A.table : "Pick mystery cell A, then Fire.") : null;
    }
    return null;
  }
  const subsAllSeen = () => det.spec && subsSeen().length === det.spec.length;

  // ---------- teacher key, record ----------
  const tr = (th, ...tds) => h("tr", {}, h("th", {}, th), ...tds.map((t) => h("td", {}, t)));
  function key() {
    const rows = [], calc = D.labCalculated(), mj = (x) => x.toFixed(x < 10 ? 3 : 1);
    rows.push(tr("Timing (50-minute period)", h("ol", {}, ["Minutes 0 to 4: intro hook, three cards, walk in.", "4 to 12: Part A lithium sweep, then Ne, Na, S and one free run; Checkpoint 1.", "12 to 22: Part B draw O, Mg and Si and compare; Checkpoint 2.", "22 to 33: Part C four mystery cells, flaw to correct; Checkpoint 3.", "33 to 38: Part D Model A against neon. 38 to 42: Part E phosphorus, then hand in.", "42 to 50: paper worksheet (the graded record). Target on screen: 30 to 35 minutes."].map((t) => h("li", {}, t))), "The lab ends when every step is done. A student who locks waits for Mr. D."));
    rows.push(tr("Lock PIN", h("p", {}, "Students lock after 3 misses in a row on one checkpoint type, or when they press I need Mr. D. Unlock: type the PIN on their screen. Only that type resets; they then need 2 fresh questions right in a row."), h("p", {}, "Set the PIN on the teacher page (PIN card): it prints one line of JSON. Paste it into chemistry/virtual-lab/content/config.json as pesPinHash and push. The page stores a hash, never the PIN.")));
    rows.push(tr("Lock limits", "A lock that runs only on the Chromebook can be bypassed by a determined student (clear site data, a second profile). The log is the deterrent: every attempt, lock, unlock and help request is in the record and on the roster card."));
    rows.push(tr("Misreads and what each hint targets", h("ul", {}, Pr.MISREADS.map((m) => h("li", {}, h("b", {}, m.wrong + ". "), m.targets))), "The hint always points at the student's own run or drawing; it never gives the answer or the next bar."));
    rows.push(tr("Simplifications", h("ul", {}, ["A tunable light source. Real instruments use a fixed lamp (He or Mg Kα); the dial lets students see that light must beat the binding energy.", "Vaporized samples: every element is a gas of free atoms, so no solid-state or molecular effects.", "Peak heights are electron counts. There are no photoionization cross-sections, so real intensity ratios differ.", "Brightness changes only how fast counts build. It never changes which peaks appear.", "One 2p peak: spin-orbit splitting is not shown.", "No chemicals are handled, so the room has noPPE: true and the goggles gate is off.", "Z = 1 to 20 only: no Cr or Cu, because the Aufbau exceptions are not taught."].map((t) => h("li", {}, t))), ""));
    rows.push(tr("Unverified values", `${calc.length} of the ${[...D.labElements()].reduce((a, Z) => a + D.occupied(Z).length, 0)} subshell energies are calculated, not measured (NIST SRD 141, LDA orbital energies, free atoms, source id NISTDFT-LDA). Outermost subshell energies are NIST first ionization energies. Core values are 3 to 20 percent below measurement and calculated valence 2s and 3s sit below measured ones. Order and relative position hold for all 20 elements. Nothing was invented.`, h("ul", {}, calc.map((r) => h("li", {}, `${r.symbol} ${r.sub}: ${r.eV.toFixed(1)} eV`)))));
    for (let Z = 1; Z <= 20; Z++) rows.push(tr(`${D.SYMBOLS[Z - 1]} (Z = ${Z})`, Pr.configText(Z), D.labSpectrum(Z).map((o) => `${o.sub} ${o.count}e at ${mj(o.MJ)} MJ/mol${o.kind === "calculated" ? " (calc)" : ""}`).join("; ")));
    ensureMys(); rows.push(tr("Mystery cells for this student", MYS.map((k) => `${k} = ${nameOf(G().mys[k].Z)}`).join(", "), "Seeded by the student's name. A and B within Z 1 to 10, C within 18, D within 20; elements run in Parts A, B and E are skipped."));
    for (const t of Pr.TYPES) rows.push(tr(`Checkpoint ${t}`, [0, 1, 2].map((n) => { const it = Pr.labSpec(n, t, seedNum()); return `${it.q} → ${typeof it.ans === "object" ? JSON.stringify(it.ans) : it.ans}`; }).join(" | "), "First three variants for this student. Variants never repeat inside the pool."));
    rows.push(tr("Part D answer", "Model A does not fit: neon gives three peaks, Model A gives two (shell 1 holds 2, shell 2 holds 8 at one energy).", "Students write the CER on paper."));
    return rows;
  }
  function record(base) {
    const g = G(), cp = (t) => ({ passed: g.cp[t].passed, attempts: g.cp[t].att, unlocks: g.cp[t].unlocks, helps: g.cp[t].helps, redo: g.cp[t].redo });
    return { ...base, prelab: { cards: lab.cards.map((c) => c.id) }, submitted: g.handed,
      pes: { runs: g.runs, checkpoints: { read: cp("read"), draw: cp("draw"), match: cp("match") }, locks: g.locks, helps: g.helps, locked: !!g.lock, draws: Object.fromEntries(Object.entries(g.draws).map(([k, d]) => [k, { ok: d.ok, compared: d.compared, tries: d.tries, attempts: d.att }])),
        mystery: Object.fromEntries(MYS.map((k) => [k, { el: nameOf(g.mys[k].Z), ok: g.mys[k].ok, tries: g.mys[k].tries, attempts: g.mys[k].att }])), flaw: g.flaw, modelA: g.modelA, handed: g.handed, step: stepId() } };
  }

  // ---------- frame and refresh ----------
  function step(dt) {
    if (G() !== lastG) { lastG = G(); det = newDet(0); zoom = { hit: null, t: 99, none: false }; cpNote = null; rebuild = null; selPeak = null; ensureLockMirror(); if (G().el) { const e = G().el; det = newDet(typeof e === "string" ? G().mys[e].Z : e, typeof e === "string" ? e : ""); } renderStep(); }
    if (live()) detStep(dt); if (isOpen()) { drawAll(dt); if (G().lock && !ctx.isDemo()) { /* the overlay is already up */ } }
  }
  function ensureLockMirror() { if (ctx.isDemo() || G().lock || S.stage !== "lab") return; try { const m = JSON.parse(localStorage.getItem("vlab:" + lab.id + ":lock") || "null"); if (m && m.type) { G().lock = { type: m.type, reason: m.reason, step: stepId(), at: m.at }; G().locks.push({ type: m.type, reason: m.reason, step: stepId(), at: m.at, unlockedAt: null, restored: true }); } } catch (e) { /* ignore */ } }
  function refresh() {
    if (!els.root || !live()) return; ensureLockMirror();
    const s = [stepId(), !!G().lock, redoType(), G().cp.read.n, G().cp.draw.n, G().cp.match.n].join("|"); if (s !== sig) renderStep();
    const L = G().lock; if (L && !ctx.isDemo() && !god() && S.stage === "lab" && !isOpen()) ctx.openNotebook("pes");
    const b = $("btnNotebook"); if (b && b.firstChild && b.firstChild.nodeType === 3) b.firstChild.textContent = "🔬 Spectrometer"; const pr = $("print"), dp = $("donePrint"); if (pr) pr.hidden = true; if (dp) dp.hidden = true; const dd = document.querySelector("#dlgDone .body > p:not(#doneInfo)"); if (dd && !dd.dataset.pes) { dd.dataset.pes = "1"; dd.textContent = "Download your record. It stays on this computer and loads on Mr. D's teacher page. Then hand in your paper worksheet."; }
  }
  const station = (t) => { if (!["spectrometer", "carousel", "draw_bench"].includes(t.id)) return false; ev("pes_open", { at: t.id }); ctx.openNotebook("pes"); say("You step up to the spectrometer."); syncLeft(); renderStep(); return true; };

  // demo and tests reach in here
  const hooks = { reset() { det = newDet(0); zoom = { hit: null, t: 99, none: false }; cpNote = null; rebuild = null; selPeak = null; syncLeft(); renderStep(); }, pick: (z) => pick(z, true), light(u) { G().u = u; syncLeft(); }, bright(b) { G().b = b; syncLeft(); }, fire, stop: () => stopRun("demo"), fast(on) { det.fast = !!on; },
    peak(sub) { selPeak = sub; const o = det.spec.find((q) => q.sub === sub); els.peak.textContent = `${sub}: ${o.count} ${o.count === 1 ? "electron" : "electrons"} in this subshell, held at ${o.MJ.toFixed(2)} MJ/mol.`; },
    showCp(type) { G().cp[type || "read"].n = 0; const t = type || "read"; const el = els.stepCard; el.replaceChildren(h("h3", {}, "Checkpoint 1: read a spectrum"), ...cpBody(t)); const a = $("pesAnswer"); if (a) { const it = Pr.labSpec(0, t, seedNum()); a.value = String(it.ans); } },
    showLock() { const g = G(); g.lock = { type: "read", reason: "misses", step: "cp1", at: new Date().toISOString() }; renderLock(); }, hideLock() { G().lock = null; renderLock(); }, seed: seedNum, peakX: (sub) => { const o = det.spec && det.spec.find((q) => q.sub === sub); return o && els.geo ? els.geo.L + els.geo.ax.x(o.MJ) : null; }, det: () => det, renderStep, stepId, submitCp, helpNow, tryUnlock, state: G, compare, checkDraw, canPick, subsSeen };
  return { pes: true, hooks, demoLines: lab.demo, controls: h("div", { id: "pesControls" }), sheet, step, refresh, draw: () => {}, station, canOpen: () => live(), showTab: () => {}, hintPicture: () => null, guide: pesGuide, pesGuide, key, print: () => [], record, questState, visible: () => true, unlocked: () => true,
    syncSources: () => {}, answered: () => [], evidence: () => [], renderPrelab, renderIntro, recordComplete: () => true, text: (k) => U[k] || "", holding: () => det.firing, clock: undefined, bottles: [], huddle: () => {}, panel: () => ({ title: "", items: [] }) };
}
