// Lab 6 UI: the pull bench, one screen. A periodic table that doubles as the student's pull map (each atom lights up when measured), a proton slider that builds the atom
// as it moves, a big atom picture with clickable rings, a tug-of-war strip (protons against the electrons in the way), a pull meter, a predict box, a mystery atom,
// and the one huddle (a notes huddle, in the middle of the lab). It answers the same calls as the other "kind" labs (see pes.js), so the shared app hosts it.
// Every word a student sees is in content/labs/06-effective-nuclear-charge.json. The model is chemistry/shared/zeff.js (window.Zeff).
// Length is the lab's `lengthMin` or ?min=NN (engine/zeff-lab.js).
import { h } from "../../../../shared/virtual-lab/dom.js";
import * as L from "../engine/zeff-lab.js";

// Nothing here may run at import time: the shared app imports every lab kind, and a page that does not load ../shared/zeff.js (the physics lab) must still start.
const Zeff = () => window.Zeff;
export const demoTotal = 10;
export const chestQuests = [];
const CSS = `.zeRoot{display:grid;grid-template-columns:352px 1fr 262px;gap:16px;height:620px;position:relative;font-size:13px}.zeRoot h3{margin:0 0 4px;font-size:13px}.zeRoot h3 small{font-weight:400;color:#6a7787}
.zeCol{overflow:auto;padding-right:2px}#stage:has(#demoBar:not([hidden])) .zeRoot{height:572px}#stage:has(#demoBar:not([hidden])) .zeAtom{width:290px;height:290px}#stage:has(#demoBar:not([hidden])) .zeTube{height:240px}#stage:has(#demoBar:not([hidden])) .zeTicks{height:240px}.zeMid{display:flex;flex-direction:column;align-items:center;min-width:0}
.zeTab{display:grid;grid-template-columns:20px repeat(8,1fr);gap:3px;align-items:center}.zeTab .gl,.zeTab .pl{font-size:10.5px;color:#6a7787;text-align:center}
.zeTab button{padding:0;min-height:40px;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05;background:#fff;border:1px solid #c9d3de;border-radius:6px}
.zeTab button b{font-size:14px}.zeTab button small{font-size:9.5px;opacity:.7}.zeTab button.on{outline:3px solid #ffd23f;z-index:1}.zeTab button:disabled{opacity:.45}
.zeLegend{display:flex;align-items:center;gap:6px;margin:6px 0 2px;font-size:11px;color:#6a7787}.zeLegend i{flex:1;height:8px;border-radius:4px;background:linear-gradient(90deg,#fff3c4,#d9480f)}
.zeSlide{margin:10px 0 4px;padding:8px 10px;border:1px solid #c9d3de;border-radius:8px;background:#f7fafd}.zeSlide input{width:100%;margin:6px 0 0}
.zeCard,.zeSlide,.zeTab button{color:#1e2630}.zeCard h3,.zeSlide h3,.zeCard label,.zeSlide label{color:#1e2630}.zeCard{margin:10px 0 0;padding:8px 10px;border:1px solid #c9d3de;border-radius:8px;background:#fff}
.zeName{font:700 17px Georgia,serif;margin:0 0 2px;text-align:center}.zeAtom{width:340px;height:340px;max-width:100%}.zeAtom svg{width:100%!important;max-width:none!important;height:100%}
.zePulse{animation:zep 1.6s infinite}@keyframes zep{50%{opacity:.25}}@media (prefers-reduced-motion:reduce){.zePulse{animation:none}}
.zeRingBtns{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:4px 0}.zeRingBtns button[aria-pressed=true]{background:#f6d88f;border-color:#c07a00;font-weight:700}
.zeChips{display:grid;gap:3px;width:100%;max-width:520px;margin:6px 0 2px}.zeChips span{display:flex;align-items:center;justify-content:center;height:20px;border-radius:5px;font:700 13px ui-monospace,Menlo,monospace}
.zeChips .p{background:#2a6fb5;color:#fff}.zeChips .p.keep{box-shadow:0 0 0 2px #ffd23f}.zeChips .e{background:#e0a020;color:#1e2630}.zeChips .e.none{background:transparent}
.zeLine{margin:2px 0;font-size:13px;text-align:center}.zeMsg{margin:6px 0;font-weight:600;text-align:center}.zeMsg.ok{color:#1f9d55}.zeMsg.no{color:#b36b00}
.zeTube{position:relative;width:46px;height:300px;margin:0 auto;border:2px solid #34495e;border-radius:10px;background:#1b2531;overflow:hidden}
.zeTube i{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(0deg,#d9480f,#f0a020);transition:height .8s cubic-bezier(.3,1.4,.5,1)}
.zeTicks{position:absolute;right:-34px;top:0;height:300px;font-size:10.5px;color:#6a7787;pointer-events:none}.zeTicks span{position:absolute;right:0;transform:translateY(50%)}
.zeMeterWrap{position:relative;width:46px;margin:0 auto}.zeBig{font:700 26px ui-monospace,Menlo,monospace;text-align:center;margin:8px 0 0}
.zeRoot .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.zeBl{display:block;margin:6px 0}.zeBl input{width:7em;margin:0 6px}.zeHint{color:#6a7787;font-size:12px;margin:4px 0}`;
const fmt = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] === undefined ? "" : o[k]));
const heat = (v) => { const t = Math.max(0, Math.min(1, v / 2)), a = [255, 243, 196], b = [217, 72, 15]; return `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * t)).join(",")})`; };

const T0 = () => ({ Z: 0, mysMode: false, measured: [], rows: [], marks: {}, markN: 0, matched: [], pred: { choice: "", at: 0, ok: false }, mys: { Z: 0, tries: 0, ok: false, att: [] }, blanks: { b1: "", b2: "", b3: "", b4: "", b5: "", b6: "", b7: "" }, huddle: false, handed: false });
export const fresh = () => ({ ...T0(), huddle1: true, h1Forced: true, forced1: true, huddle2: false, h2Auto: false, forced2: false });   // huddle 1 never runs; the one huddle is the shared "huddle 2" slot, set at the middle by the clock below
export function fix(g) { const d = fresh(); for (const k in d) if (g[k] === undefined) g[k] = d[k]; for (const k of ["pred", "mys", "blanks"]) for (const j in d[k]) if (g[k][j] === undefined) g[k][j] = d[k][j]; delete g.shield; delete g.shieldN; return g; }
export async function load(lab) { lab.prelab = { questions: [] }; }

export function create(ctx) {
  const Z = Zeff(), MAXPULL = Math.max(...L.ZS.map((z) => Z.pullValue(Z.atom(z))));   // the meter's full scale is the strongest pull in the grid (neon)
  const { lab, S, log, say, onChange } = ctx, U = lab.ui, A = lab.arrows, G = () => S.flame, $ = (id) => document.getElementById(id);
  const LEN = L.lengthOf(lab, location.search), MID = L.huddleAt(LEN), god = () => ctx.isKey();
  const live = () => ["lab", "postlab", "done"].includes(S.stage) || ctx.isDemo();
  const ev = (t, d) => { if (!ctx.isDemo()) log.add(t, d); }, changed = () => { if (!ctx.isDemo()) onChange(); };
  const isOpen = () => { const d = $("dlgNotebook"); return !!(d && d.open); };
  const seed = () => String(ctx.studentKey() || "anon") + "|" + (lab.id || "");
  const mysZ = () => (G().mys.Z || (G().mys.Z = L.mysteryZ(seed())));
  const pullTxt = (a) => `${Z.frac(a)} = ${Z.pullValue(a).toFixed(2)}`;
  const canMeasure = (z) => god() || z !== 12 || !!G().pred.choice || G().measured.includes(12);   // magnesium waits for the prediction; you can still look at it and slide past it
  const marksOf = (z) => G().marks[z] || (G().marks[z] = []);
  const markedN = (a) => L.markedElectrons(a, marksOf(a.Z));   // electrons in the rings the student marked
  const matches = (a) => L.estimateMatches(a, marksOf(a.Z));   // the estimate (protons left over) equals what the meter shows

  // ---------- state the quests read ----------
  const col = () => [3, 11, 19].every((z) => G().measured.includes(z));
  const predDone = () => !!G().pred.choice && G().measured.includes(12);
  function questState() { const g = G(); return { z_measure: g.measured.includes(11), z_mark: g.matched.includes(11), z_match3: g.matched.length >= 3, _z_match3: Math.min(3, g.matched.length), z_col: col(), z_pred: predDone(), z_mys: g.mys.ok, handed: g.handed }; }

  // ---------- actions ----------
  function pick(z) { const g = G(); if (!live() || z < 3 || z > 20) return false; g.Z = z; ev("zeff_pick", { Z: z }); render(); changed(); return true; }
  function checkMatch(a) {
    const g = G(); if (!g.measured.includes(a.Z) || !matches(a) || g.matched.includes(a.Z)) return;
    g.matched.push(a.Z); ev("zeff_match", { Z: a.Z, marks: marksOf(a.Z).slice() }); say(fmt(U.matchSay, { name: a.name }), "obs");
  }
  function measure() {
    const g = G(); if (!live() || !g.Z || !canMeasure(g.Z)) return; const a = Z.atom(g.Z);
    if (!g.measured.includes(a.Z)) { g.measured.push(a.Z); g.rows.push({ Z: a.Z, pred: g.pred.choice && a.Z === 12 ? g.pred.choice : null }); }
    ev("zeff_measure", { Z: a.Z, pull: Z.frac(a) }); checkMatch(a); render(true); changed();
  }
  function toggleRing(i) {
    const g = G(); if (!live() || !g.Z) return; const a = Z.atom(g.Z); if (i < 0 || i >= a.n - 1) return;
    const m = marksOf(a.Z); m[i] = !m[i]; g.markN++; ev("zeff_mark", { Z: a.Z, ring: i + 1, on: m[i], marks: m.slice(0, a.n - 1).map(Boolean) }); checkMatch(a); render(); changed();
  }
  const ready = () => god() || (predDone() && G().mys.ok);
  function handIn() { const g = G(); if (!live() || !ready()) return; g.handed = true; ev("zeff_handin", {}); changed(); ctx.closeNotebook(); ctx.finish(); }
  function predict(c) { const g = G(); if (g.pred.choice) return; g.pred = { choice: c, at: g.measured.length, ok: c === L.predictAnswer(Z) }; ev("zeff_predict", { choice: c, before: g.measured.slice() }); render(); changed(); }
  function nameMystery(z) {
    const g = G(), m = g.mys; if (m.ok) return; m.tries++; const ok = z === mysZ(); m.att.push({ Z: z, ok }); if (ok) m.ok = true; ev("zeff_mystery", { Z: z, ok }); render(); changed();
  }

  // ---------- drawing ----------
  const els = {};
  // The atom picture, plus an overlay: a dashed line out to the outer electron, a pulsing ring around it, and (after Measure) a blue arrow back toward the nucleus as thick as the pull.
  function atomSvg(a, showPull) {
    const n = a.n, r = 34 + 34 * (n - 1), ang = -Math.PI / 2 + ((n - 1) % 2) * 0.35, px = 150 + r * Math.cos(ang), py = 150 + r * Math.sin(ang), deg = ((ang + Math.PI) * 180) / Math.PI;
    let o = `<line x1="150" y1="150" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="#2a6fb5" stroke-width="1.4" stroke-dasharray="4 4" opacity=".5"/>`;
    o += `<circle class="zePulse" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="11" fill="none" stroke="#e08a00" stroke-width="2.4"/>`;
    if (showPull) { const w = 2 + 5 * Z.pullValue(a), hw = w / 2 + 5; o += `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)}) rotate(${deg.toFixed(1)})"><line x1="9" y1="0" x2="40" y2="0" stroke="#1d5fa8" stroke-width="${w.toFixed(1)}"/><polygon points="38,${-hw} ${40 + hw},0 38,${hw}" fill="#1d5fa8"/></g>`; }
    return Z.svg(a.Z, { marks: marksOf(a.Z), hit: true, tag: true }).replace(/<\/svg>\s*$/, o + "</svg>");
  }
  function mysBody() {
    const g = G(), m = g.mys, a = Z.atom(mysZ()), rings = a.rings.join(", ");
    const msg = m.ok ? h("p", { class: "zeMsg ok" }, fmt(U.mysYes, { name: a.name })) : m.tries ? h("p", { class: "zeMsg no" }, U.mysNo) : null;
    return [h("h3", {}, U.mysteryHead), h("p", {}, fmt(U.mysInfo, { rings, pull: pullTxt(a) })), msg]
      .filter(Boolean).concat(m.ok ? [] : [h("button", { id: "zeMysOn", onclick: () => { G().mysMode = !G().mysMode; render(); } }, G().mysMode ? U.mysStop : U.mysGo)]);
  }
  function render(animate) {
    if (!els.root) return; const g = G(), a = g.Z ? Z.atom(g.Z) : null, mm = g.mysMode && !g.mys.ok;
    for (const z of L.ZS) { const c = $("zeCell_" + z); if (c) { c.classList.toggle("on", g.Z === z); const was = g.measured.includes(z); c.style.background = was ? heat(Z.pullValue(Z.atom(z))) : ""; c.style.color = was && Z.pullValue(Z.atom(z)) > 1.2 ? "#fff" : ""; c.setAttribute("aria-label", `${Z.NAME[z]}${was ? ", pull " + Z.frac(Z.atom(z)) : ""}`); } }
    if (g.Z) els.slider.value = g.Z;
    els.slideLabel.textContent = a ? fmt(U.slideLabel, { Z: a.Z, name: a.name }) : U.slideNone; els.slider.disabled = !live();
    const was = !!a && g.measured.includes(a.Z), pull = a && was ? Z.pullValue(a) : 0;
    $("zeChipsHead").hidden = !a;
    els.name.textContent = a ? `${a.name[0].toUpperCase()}${a.name.slice(1)}` : "";
    if (a) els.pic.innerHTML = atomSvg(a, was); else els.pic.innerHTML = `<p class="zeHint">${U.pickFirst}</p>`;
    els.ringBtns.replaceChildren(...(a ? a.rings.slice(0, a.n - 1).map((c, i) => h("button", { id: "zeRing_" + i, "aria-pressed": String(!!marksOf(a.Z)[i]), onclick: () => toggleRing(i) }, fmt(U.ringBtn, { i: i + 1, c }))) : []));
    els.ringNote.textContent = a ? (a.n > 1 ? fmt(U.ringNote, { n: a.n }) : "") : "";
    const m = a ? markedN(a) : 0, left = a ? a.Z - m : 0, d = a ? a.n * a.n : 1, inway = g.huddle ? U.inWayNamed : U.inWay;
    els.chips.style.gridTemplateColumns = `repeat(${a ? a.Z : 1},1fr)`;
    els.chips.replaceChildren(...(a ? [...Array(a.Z)].map((_, i) => h("span", { class: "p" + (i >= m ? " keep" : "") }, "+")).concat([...Array(a.Z)].map((_, i) => h("span", { class: "e" + (i < m ? "" : " none") }, i < m ? "−" : ""))) : []));
    els.tally.textContent = a ? fmt(U.tally, { Z: a.Z, m, inway, left }) : "";
    els.dist.textContent = a ? fmt(U.distLine, { n: a.n, d }) : "";
    els.est.textContent = a ? fmt(U.estLine, { left, d, f: (left / d).toFixed(2) }) : "";
    const ok = a && was && matches(a);
    els.match.className = "zeMsg" + (a && was ? (ok ? " ok" : " no") : ""); els.match.textContent = !a ? "" : !was ? U.matchWait : ok ? U.matchYes : left > a.zeff ? U.matchBig : U.matchSmall;
    els.measure.disabled = !a || !live() || !canMeasure(a ? a.Z : 0); els.measure.textContent = was ? U.measureAgain : U.measure;
    els.lock.textContent = a && !canMeasure(a.Z) ? U.lockNote : "";
    els.hand.disabled = !live() || !ready(); els.handNote.textContent = ready() ? U.handReady : U.handWait;
    els.fill.style.height = a && was ? Math.round(Math.min(1, pull / MAXPULL) * 100) + "%" : "0%";
    els.big.textContent = a && was ? pullTxt(a) : "—";
    els.pred.replaceChildren(h("h3", {}, U.predictHead), g.pred.choice ? h("p", { class: "zeMsg " + (g.measured.includes(12) ? (g.pred.ok ? "ok" : "no") : "") }, g.measured.includes(12) ? (g.pred.ok ? U.predHeld : U.predMissed) : U.predLocked)
      : h("div", { class: "row" }, h("span", {}, U.predictAsk), h("button", { id: "zePredNa", onclick: () => predict("na") }, U.sodium), h("button", { id: "zePredMg", onclick: () => predict("mg") }, U.magnesium)));
    els.mys.replaceChildren(...mysBody());
    for (const z of L.ZS) { const c = $("zeCell_" + z); if (c) c.disabled = false; }
    void mm;
  }
  function build() {
    els.name = h("p", { class: "zeName", id: "zeName" }); els.pic = h("div", { id: "zeAtom", class: "zeAtom" }); els.fill = h("i", {}); els.big = h("p", { id: "zeRead", class: "zeBig" });
    els.ringBtns = h("div", { class: "zeRingBtns", id: "zeRings" }); els.ringNote = h("p", { class: "zeHint", id: "zeRingNote" });
    els.chips = h("div", { class: "zeChips", id: "zeChips" }); els.tally = h("p", { class: "zeLine", id: "zeTally" }); els.dist = h("p", { class: "zeLine", id: "zeDist" }); els.est = h("p", { class: "zeLine", id: "zeEst" }); els.match = h("p", { class: "zeMsg", id: "zeMatch", role: "status" });
    els.measure = h("button", { id: "zeMeasure", class: "primary", onclick: measure }, U.measure); els.lock = h("p", { class: "zeHint", id: "zeLock" });
    els.hand = h("button", { id: "zeHand", class: "primary", onclick: handIn }, U.handBtn); els.handNote = h("p", { class: "zeHint", id: "zeHandNote" });
    els.pred = h("div", { id: "zePred", class: "zeCard" }); els.mys = h("div", { id: "zeMys", class: "zeCard" });
    els.slideLabel = h("span", { id: "zeSlideLabel" }); els.slider = h("input", { id: "zeSlider", type: "range", min: 3, max: 20, step: 1, value: 11, "aria-label": U.slideAria });
    els.slider.addEventListener("input", () => { pick(+els.slider.value); });
    const cell = (z) => h("button", { id: "zeCell_" + z, onclick: () => { if (G().mysMode && !G().mys.ok) return nameMystery(z); pick(z); } }, h("b", {}, Z.SYM[z]), h("small", {}, z));
    const rowOf = (label, zs) => [h("span", { class: "pl" }, label), ...[1, 2, 13, 14, 15, 16, 17, 18].map((gp) => { const z = zs.find((q) => Z.atom(q).group === gp); return z ? cell(z) : h("span", {}); })];
    const tab = h("div", { class: "zeTab", id: "zeGrid" }, h("span", {}), ...[1, 2, 13, 14, 15, 16, 17, 18].map((gp) => h("span", { class: "gl" }, gp)), ...rowOf(2, [3, 4, 5, 6, 7, 8, 9, 10]), ...rowOf(3, [11, 12, 13, 14, 15, 16, 17, 18]), ...rowOf(4, [19, 20]));
    const close = h("button", { class: "x", "data-close": "", style: "position:absolute;right:0;top:-8px;z-index:4" }, U.closeWord);
    els.root = h("div", { class: "zeRoot" }, close,
      h("div", { class: "zeCol" }, h("h3", {}, U.mapHead, " ", h("small", {}, U.mapSub)), tab, h("div", { class: "zeLegend" }, h("span", {}, U.weak), h("i", {}), h("span", {}, U.strong)),
        h("div", { class: "zeSlide" }, h("div", {}, U.slideHead, " ", h("b", {}, els.slideLabel)), els.slider), els.pred, els.mys),
      h("div", { class: "zeMid" }, els.name, els.pic, els.ringBtns, els.ringNote, h("h3", { id: "zeChipsHead", style: "margin-top:6px" }, U.chipsHead), els.chips, els.tally, els.dist, els.est, els.match),
      h("div", { class: "zeCol" }, h("h3", {}, U.pullHead), h("div", { class: "zeMeterWrap" }, h("div", { class: "zeTube", id: "zeMeter" }, els.fill), h("div", { class: "zeTicks" }, ...[0, 0.5, 1, 1.5, 2].map((v) => h("span", { style: `bottom:${(v / 2) * 100}%` }, v)))), els.big,
        h("div", { style: "text-align:center;margin-top:10px" }, els.measure), els.lock, h("p", { class: "zeHint" }, U.meterNote), h("div", { style: "border-top:1px solid #c9d3de;margin-top:12px;padding-top:10px;text-align:center" }, els.hand, els.handNote)));
    els.pic.addEventListener("click", (e) => { const r = e.target.closest && e.target.closest(".zr-hit"); if (r) toggleRing(+r.getAttribute("data-i")); });
    const st = document.createElement("style"); st.textContent = CSS; els.root.append(st); return els.root;
  }
  const sheet = build(); let lastG = null;
  function step() { if (G() !== lastG) { lastG = G(); render(); } }
  function refresh() { if (!live()) return; render(); const b = $("btnNotebook"); if (b && b.firstChild && b.firstChild.nodeType === 3) b.firstChild.textContent = "⚖ Pull bench"; const hb = $("btnHuddle"); if (hb && hb.firstChild) hb.firstChild.textContent = U.codeLabel; }
  const station = (t) => { if (t.id !== "pull_rig") return false; ev("zeff_open", { at: t.id }); ctx.openNotebook("zeff"); say(U.stepUp); render(); return true; };

  // ---------- intro, card, guide ----------
  function hookCanvas() { const d = h("div", { class: "zeAtom", style: "width:220px;height:220px" }); d.innerHTML = Z.svg(lab.hook.Z, { tag: true }); return d; }
  function renderIntro(box, c) {
    const key = (k, t) => h("tr", {}, h("td", {}, h("kbd", {}, k)), h("td", {}, t)), name = h("input", { id: "student", type: "text", autocomplete: "name", style: "width:18em", placeholder: "First and last name" });
    const go = h("button", { id: "introGo", class: "primary", disabled: true, onclick: () => c.onIntroDone(name.value.trim()) }, "Start the pre-lab →");
    name.addEventListener("input", () => { go.disabled = name.value.trim().length < 3; }); if (c.S.student) { name.value = c.S.student; go.disabled = name.value.trim().length < 3; }
    box.replaceChildren(h("h2", {}, lab.title), h("div", { class: "row", style: "align-items:flex-start;gap:18px" }, hookCanvas(), h("div", {}, h("h3", {}, lab.hook.ask), h("p", {}, lab.hook.note), h("p", {}, lab.intro), h("p", { class: "zeMsg", style: "text-align:left" }, lab.goal))),
      h("h3", {}, "How this lab works"), h("ol", {}, lab.introSteps.map((t) => h("li", {}, t))), h("h3", {}, "Controls"), h("table", { class: "keys" }, ...lab.keyRows.map(([k, t]) => key(k, t))),
      h("label", { style: "display:block;margin:12px 0" }, "Your name ", name), h("div", { class: "controls foot" }, h("button", { id: "introDemo", onclick: c.onDemo }, "▶ Watch the demo"), go));
  }
  function renderPrelab(box, c) {
    const cd = lab.cards[0], pic = h("div", { class: "zeAtom", style: "width:260px;height:260px" }); pic.innerHTML = Z.svg(11, { tags: { nucleus: 1, core: 2, outer: 3 }, tag: true });
    box.replaceChildren(h("h2", {}, cd.term), h("div", { class: "row", style: "align-items:flex-start;gap:18px" }, pic, h("p", { style: "max-width:36em;font-size:16px" }, cd.body)),
      h("div", { class: "controls foot" }, h("button", { id: "cardDone", class: "primary", onclick: () => c.onPrelabDone() }, "Enter the lab →")));
  }
  // Arrows: the walk in (door, then the bench), then the first atom: pick Na, measure it, mark its inner rings until the estimate matches the meter.
  function guide(id) {
    const E2 = (e, x) => (e ? ["el", e, x] : null), open = isOpen(), btn = $("btnNotebook"), g = G(), na = Z.atom(11);
    switch (id) {
      case "door": return ["tile", "door", A.door];
      case "bench": return ["tile", "pull_rig", A.bench];
      case "z_measure": return !open ? E2(btn, A.open) : g.Z !== 11 ? E2($("zeCell_11"), A.pick) : E2($("zeMeasure"), A.measure);
      case "z_mark": { if (!open) return E2(btn, A.open); if (g.Z !== 11) return E2($("zeCell_11"), A.pick); if (!g.measured.includes(11)) return E2($("zeMeasure"), A.measure); const i = [0, 1].find((k) => !marksOf(11)[k]); return i === undefined ? null : E2($("zeRing_" + i), i === 0 ? A.mark1 : A.mark2); }
    }
    void na; return null;
  }

  // ---------- the one huddle: a notes huddle in the middle ----------
  function huddle(n, hx) {
    if (n !== 2) return hx.finish();
    const g = G(), B = L.BLANKS(Z), box = hx.box, CODE = window.MrD && MrD.codes && MrD.codes.gateV3 ? MrD.codes.gateV3(lab.id, "h1") : hx.code, msg = h("p", { class: "hint", role: "status" });
    const inputs = B.map((b) => { const i = h("input", { id: "zeBlank_" + b.id, type: "text", autocomplete: "off", value: g.blanks[b.id] || "", "aria-label": b.pre }); i.addEventListener("input", () => { g.blanks[b.id] = i.value; sync(); }); return i; });
    const filled = () => B.every((b) => (g.blanks[b.id] || "").trim());
    const code = h("input", { id: "huddleCode", type: "text", inputmode: "numeric", maxlength: "4", autocomplete: "off", "aria-label": U.codeLabel, style: "width:6em" });
    const go = h("button", { id: "huddleGo", class: "primary", onclick: () => { if (hx.isKey || !hx.gates || code.value.trim() === CODE) { g.huddle = true; ev("zeff_huddle", { blanks: B.map((b) => ({ id: b.id, text: g.blanks[b.id], ok: L.blankOk(b, g.blanks[b.id]) })) }); render(); hx.finish(); } else msg.textContent = U.codeWrong; } }, U.codeGo);
    const sync = () => { go.disabled = !filled(); };
    box.replaceChildren(h("h2", {}, U.huddleTitle), h("p", {}, U.huddleText), ...B.map((b, i) => h("label", { class: "zeBl" }, `${i + 1}. ${b.pre} `, inputs[i], ` ${b.post}`)),
      hx.isKey ? h("p", {}, U.keyShows.replace("{code}", CODE)) : !hx.gates ? h("p", { class: "hint" }, U.codeNote) : h("label", {}, U.codeLabel + " ", code), msg, h("div", { class: "controls" }, go)); sync(); hx.open();
  }

  // ---------- key, record ----------
  const tr = (th, ...tds) => h("tr", {}, h("th", {}, th), ...tds.map((t) => h("td", {}, t)));
  function key() {
    const rows = [], B = L.BLANKS(Z);
    rows.push(tr(`Timing (this run is ${LEN} minutes; change it with ?min=NN on the address)`, h("ol", {}, [`0 to 3: intro, the one picture card, walk in.`, `3 to ${MID}: free exploring: pick atoms (table or slider), measure, mark the rings in the way, fill the pull map.`, `${MID}: one huddle. Eyes up, copy the board (blanks below). Board: chemistry/whiteboard/index.html#lesson=zeff, frames 1, 2 and 4.`, `${MID} to ${LEN}: predict Na or Mg, the mystery atom, then the paper worksheet.`].map((t) => h("li", {}, t)))));
    rows.push(tr("Huddle blanks", h("ol", {}, B.map((b) => h("li", {}, `${b.pre} ___ ${b.post}  →  ${b.ans[0]}`))), "Any non-empty copy lets a student on; the record keeps what they typed and whether it matched."));
    rows.push(tr("The marking step", "A student clicks the inner rings (the electrons in the way) and the strip cancels that many protons. The estimate is protons left over ÷ ring number squared. It matches the meter only when every inner ring is marked and the outer ring is not. A miss says only whether the estimate is bigger or smaller than the meter."));
    rows.push(tr("Predict", "Sodium or magnesium? Magnesium holds harder: Z_eff 2 vs 1 at the same outer ring, pull 2/9 vs 1/9. A miss is data, not a mistake: it opens the reason. Magnesium can be viewed and slid past, but not measured until the prediction is made."));
    rows.push(tr("Mystery atom for this student", `${Z.atom(mysZ()).name} (Z = ${mysZ()})`, "Seeded by the student's name."));
    rows.push(tr("Simplifications", h("ul", {}, ["Z_eff = Z − core electrons; valence electrons do not shield each other. Real values are larger; the ranking is the same.", "Pull = Z_eff ÷ n², with n the outer ring number standing in for distance. A classroom number, not a measurement.", "Lithium to calcium only: past calcium the 3d subshell fills and 'core' needs a rule this lab does not teach.", "Thirteen neighbor pairs (for example Be and B) rank differently in measured ionization energy. The lab never asks a student to compare them."])));
    for (const z of L.ZS) { const a = Z.atom(z); rows.push(tr(`${a.sym} (Z = ${z})`, `rings ${a.rings.join(", ")}`, `core ${a.core}, Z_eff ${a.zeff}, n ${a.n}, pull ${pullTxt(a)}`)); }
    return rows;
  }
  function record(base) { const g = G(); return { ...base, prelab: { cards: lab.cards.map((c) => c.id) }, submitted: g.handed, zeff: { lengthMin: LEN, measured: g.measured, markToggles: g.markN, matched: g.matched, marks: g.marks, predict: g.pred, mystery: { Z: g.mys.Z, ok: g.mys.ok, tries: g.mys.tries, attempts: g.mys.att }, huddleBlanks: g.blanks, huddle: g.huddle, handed: g.handed } }; }

  // The demo: walk in, open the bench, load an atom from the table, sweep the slider, measure, mark the rings until the estimate matches, go down a column, light up a row of the map.
  async function demo({ say: cap, walk, wait, api }) {
    const T = lab.demo, sweep = async (from, to) => { for (let z = from; z <= to; z++) { pick(z); await wait(300); } };
    await cap(1, T[0], 6000);
    await cap(2, T[1], 3000); await walk("UUUUUURRU"); api.interact(); await wait(2200);
    await cap(3, T[2], 2500); pick(11); await wait(1800);
    await cap(4, T[3], 1500); await sweep(3, 11); await wait(1200);
    await cap(5, T[4], 2500); measure(); await wait(3200);
    await cap(6, T[5], 3200); toggleRing(0); await wait(1600); toggleRing(1); await wait(3200);
    await cap(7, T[6], 3200); pick(19); await wait(900); measure(); await wait(1800); toggleRing(0); toggleRing(1); toggleRing(2); await wait(2600);
    await cap(8, T[7], 3000); for (const z of [3, 4, 5, 6, 7, 8, 9, 10]) { pick(z); measure(); await wait(450); } await wait(2200);
    await cap(9, T[8], 3000); pick(11); await wait(2800);
    api.closeNotebook(); await cap(10, T[9], 5000);
  }
  return { zeff: true, sheet, step, refresh, draw: () => {}, station, canOpen: () => live(), showTab: () => {}, hintPicture: () => null, guide, key, print: () => [], record, questState, visible: () => true, unlocked: () => true,
    syncSources: () => {}, answered: () => [], evidence: () => [], recordComplete: () => true, renderPrelab, renderIntro, text: (k) => U[k] || "", holding: () => false, clock: { huddle1AtMin: 999, huddle2AtMin: MID }, bottles: [], huddle, panel: () => ({ title: "", items: [] }),
    controls: h("div", { id: "zeControls" }), demo, hooks: undefined, hk: { pick, measure, toggleRing, predict, nameMystery, state: G, mysZ, marked: (z) => markedN(Z.atom(z)), len: LEN, mid: MID } };
}
