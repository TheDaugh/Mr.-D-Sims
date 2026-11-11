// Lab 6 UI: the pull bench, one screen. An atom grid (Li to Ca), the atom picture, a Measure button that fills the pull meter, a button that paints the core,
// a table of the student's own readings, a predict box, a mystery atom, and the one huddle (a notes huddle, in the middle of the lab).
// It answers the same calls as the other "kind" labs (see pes.js), so the shared app hosts it. Every word a student sees is in content/labs/06-effective-nuclear-charge.json.
// The model is chemistry/shared/zeff.js (window.Zeff). Length is the lab's `lengthMin` or ?min=NN (engine/zeff-lab.js).
import { h } from "../../../../shared/virtual-lab/dom.js";
import * as L from "../engine/zeff-lab.js";

// Nothing here may run at import time: the shared app imports every lab kind, and a page that does not load ../shared/zeff.js (the physics lab) must still start.
const Zeff = () => window.Zeff;
export const demoTotal = 9;
export const chestQuests = [];
const CSS = `.zeRoot{display:grid;grid-template-columns:330px 1fr 290px;gap:12px;height:620px;position:relative;font-size:13px}.zeRoot h3{margin:0 0 4px;font-size:13px}
.zeGrid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:3px}.zeGrid button{padding:3px 0;min-height:34px;font-size:12px;min-width:0}.zeGrid .on{outline:3px solid #ffd23f}.zeGrid .seen{background:#2b6cb0;color:#fff}
.zeAtom{width:300px;height:300px}.zeAtom svg{width:100%;height:100%}.zeMeter{height:22px;background:#1b2531;border-radius:5px;overflow:hidden;border:1px solid var(--line)}.zeMeter i{display:block;height:100%;background:#f0a020;width:0;transition:width .7s}
.zeRows{width:100%;border-collapse:collapse}.zeRows td,.zeRows th{border-bottom:1px solid var(--line);padding:2px 6px;text-align:left;font-size:12px}.zeCol{overflow:auto}.zeMsg{margin:6px 0;font-weight:600}.zeMsg.ok{color:#58d68d}.zeMsg.no{color:#ffb454}
.zeRoot .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.zeHud{font-size:12px;line-height:1.5}.zeBl{display:block;margin:6px 0}.zeBl input{width:7em;margin:0 6px}`;

const T0 = () => ({ Z: 0, mysMode: false, measured: [], rows: [], shield: false, shieldN: 0, pred: { choice: "", at: 0, ok: false }, mys: { Z: 0, tries: 0, ok: false, att: [] }, blanks: { b1: "", b2: "", b3: "", b4: "", b5: "", b6: "", b7: "" }, huddle: false, handed: false });
export const fresh = () => ({ ...T0(), huddle1: true, h1Forced: true, forced1: true, huddle2: false, h2Auto: false, forced2: false });   // huddle 1 never runs; the one huddle is the shared "huddle 2" slot, set at the middle by the clock below
export function fix(g) { const d = fresh(); for (const k in d) if (g[k] === undefined) g[k] = d[k]; for (const k of ["pred", "mys", "blanks"]) for (const j in d[k]) if (g[k][j] === undefined) g[k][j] = d[k][j]; return g; }
export async function load(lab) { lab.prelab = { questions: [] }; }

export function create(ctx) {
  const Z = Zeff(), MAXPULL = Math.max(...L.ZS.map((z) => Z.pullValue(Z.atom(z))));   // the meter's full scale is the strongest pull in the grid
  const { lab, S, log, say, onChange } = ctx, U = lab.ui, A = lab.arrows, G = () => S.flame, $ = (id) => document.getElementById(id);
  const LEN = L.lengthOf(lab, location.search), MID = L.huddleAt(LEN), god = () => ctx.isKey();
  const live = () => ["lab", "postlab", "done"].includes(S.stage) || ctx.isDemo();
  const ev = (t, d) => { if (!ctx.isDemo()) log.add(t, d); }, changed = () => { if (!ctx.isDemo()) onChange(); };
  const isOpen = () => { const d = $("dlgNotebook"); return !!(d && d.open); };
  const seed = () => String(ctx.studentKey() || "anon") + "|" + (lab.id || "");
  const mysZ = () => (G().mys.Z || (G().mys.Z = L.mysteryZ(seed())));
  const pullTxt = (a) => `${Z.frac(a)} = ${Z.pullValue(a).toFixed(2)}`;
  const canPick = (z) => god() || z !== 12 || !!G().pred.choice || G().measured.includes(12);   // magnesium waits for the prediction

  // ---------- state the quests read ----------
  const col = () => [3, 11, 19].every((z) => G().measured.includes(z));
  const predDone = () => !!G().pred.choice && G().measured.includes(12);
  function questState() { const g = G(); return { z_measure: g.measured.includes(11), z_shield: g.shieldN > 0, z_five: g.measured.length >= 5, _z_five: Math.min(5, g.measured.length), z_col: col(), z_pred: predDone(), z_mys: g.mys.ok, handed: g.handed }; }

  // ---------- actions ----------
  function pick(z, free) {
    const g = G(); if (!live() || (!free && !canPick(z))) return false; g.Z = z; g.shield = false; ev("zeff_pick", { Z: z }); render(); changed(); return true;
  }
  function measure() {
    const g = G(); if (!live() || !g.Z) return; const a = Z.atom(g.Z);
    if (!g.measured.includes(a.Z)) { g.measured.push(a.Z); g.rows.push({ Z: a.Z, pred: g.pred.choice && a.Z === 12 ? g.pred.choice : null }); }
    ev("zeff_measure", { Z: a.Z, pull: Z.frac(a) }); render(true); changed();
  }
  function shield(on) { const g = G(); if (!g.Z || !live()) return; g.shield = on === undefined ? !g.shield : on; if (g.shield) { g.shieldN++; ev("zeff_shield", { Z: g.Z }); } render(); changed(); }
  function predict(c) { const g = G(); if (g.pred.choice) return; g.pred = { choice: c, at: g.measured.length, ok: c === L.predictAnswer(Z) }; ev("zeff_predict", { choice: c, before: g.measured.slice() }); render(); changed(); }
  function nameMystery(z) {
    const g = G(), m = g.mys; if (m.ok) return; m.tries++; const ok = z === mysZ(); m.att.push({ Z: z, ok }); if (ok) m.ok = true; ev("zeff_mystery", { Z: z, ok }); render(); changed();
  }

  // ---------- drawing ----------
  const els = {};
  function mysBody() {
    const g = G(), m = g.mys, a = Z.atom(mysZ()), rings = a.rings.join(", ");
    const msg = m.ok ? h("p", { class: "zeMsg ok" }, `Yes. ${a.name}.`) : m.tries ? h("p", { class: "zeMsg no" }, `Not yet. Add up the electrons in the rings: that is the number of protons. Find that atom.`) : null;
    return [h("h3", {}, U.mysteryHead), h("p", {}, `Rings: ${rings}. Pull on the outer electron: ${pullTxt(a)}.`), msg, h("p", { class: "hint" }, "Click the atom in the grid, using the Mystery button.")].filter(Boolean)
      .concat(m.ok ? [] : [h("button", { id: "zeMysOn", onclick: () => { G().mysMode = !G().mysMode; render(); } }, G().mysMode ? "Stop naming" : "Name it: click an atom")]);
  }
  function render(animate) {
    if (!els.root) return; const g = G(), a = g.Z ? Z.atom(g.Z) : null, mm = g.mysMode && !g.mys.ok;
    for (const z of L.ZS) { const c = $("zeCell_" + z); if (c) { c.disabled = !canPick(z) && !mm; c.classList.toggle("on", g.Z === z); c.classList.toggle("seen", g.measured.includes(z)); } }
    if (a) els.pic.innerHTML = Z.svg(a.Z, { showCore: g.shield, tag: true }); else els.pic.innerHTML = "<p class=hint>Pick an atom.</p>";
    const was = g.measured.includes(g.Z), pull = a && was ? Z.pullValue(a) : 0;
    els.fill.style.width = a && was ? Math.round(Math.min(1, pull / MAXPULL) * 100) + "%" : "0%";
    els.read.textContent = a ? (was ? `${a.name}: rings ${a.rings.join(", ")}. Pull ${pullTxt(a)}.` : `${a.name}: rings ${a.rings.join(", ")}. Press Measure.`) : "Pick an atom in the grid.";
    els.shieldLine.textContent = a && g.shield ? `Core electrons ${a.core}. Z_eff = ${a.Z} − ${a.core} = ${a.zeff}. Outer ring n = ${a.n}.` : "";
    els.measure.disabled = !a || !live(); els.shield.disabled = !a; els.shield.textContent = g.shield ? U.hide : U.shield;
    els.rows.replaceChildren(...g.rows.map((r) => { const q = Z.atom(r.Z); return h("tr", {}, h("td", {}, q.sym), h("td", {}, q.rings.join(",")), h("td", {}, Z.frac(q)), h("td", {}, Z.pullValue(q).toFixed(2))); }));
    els.pred.replaceChildren(h("h3", {}, U.predictHead), g.pred.choice ? h("p", { class: "zeMsg " + (g.measured.includes(12) ? (g.pred.ok ? "ok" : "no") : "") }, g.measured.includes(12) ? (g.pred.ok ? "Your prediction held." : "Your prediction did not hold. Compare the two readings.") : "Locked in. Now pick magnesium and measure.")
      : h("div", { class: "row" }, h("span", {}, "Which holds its outer electron harder?"), h("button", { id: "zePredNa", onclick: () => predict("na") }, "Sodium"), h("button", { id: "zePredMg", onclick: () => predict("mg") }, "Magnesium")));
    els.mys.replaceChildren(...mysBody());
  }
  function build() {
    els.pic = h("div", { id: "zeAtom", class: "zeAtom" }); els.fill = h("i", {}); els.read = h("p", { id: "zeRead", class: "zeHud" }); els.shieldLine = h("p", { id: "zeShield", class: "zeHud" });
    els.measure = h("button", { id: "zeMeasure", class: "primary", onclick: measure }, U.measure); els.shield = h("button", { id: "zeShieldBtn", onclick: () => shield() }, U.shield);
    els.rows = h("tbody", {}); els.pred = h("div", { id: "zePred" }); els.mys = h("div", { id: "zeMys" });
    const grid = h("div", { class: "zeGrid", id: "zeGrid" }, ...L.ZS.map((z) => h("button", { id: "zeCell_" + z, onclick: () => { if (G().mysMode && !G().mys.ok) return nameMystery(z); pick(z); } }, Z.SYM[z])));
    const close = h("button", { class: "x", "data-close": "", style: "position:absolute;right:0;top:-8px;z-index:4" }, "Close ✕");
    els.root = h("div", { class: "zeRoot" }, close,
      h("div", { class: "zeCol" }, h("h3", {}, U.pickHead), grid, h("p", { class: "hint" }, "Top row: lithium to neon. Next: sodium to argon. Last: potassium, calcium."), els.pred, els.mys),
      h("div", {}, els.pic, h("div", { class: "row" }, els.measure, els.shield), els.read, els.shieldLine, h("h3", {}, U.pullHead), h("div", { class: "zeMeter", id: "zeMeter" }, els.fill)),
      h("div", { class: "zeCol" }, h("h3", {}, U.rowsHead), h("table", { class: "zeRows" }, h("thead", {}, h("tr", {}, h("th", {}, "Atom"), h("th", {}, "Rings"), h("th", {}, "Pull"), h("th", {}, "Value"))), els.rows)));
    const st = document.createElement("style"); st.textContent = CSS; els.root.append(st); return els.root;
  }
  const sheet = build(); let lastG = null;
  function step() { if (G() !== lastG) { lastG = G(); render(); } }
  function refresh() { if (!live()) return; render(); const b = $("btnNotebook"); if (b && b.firstChild && b.firstChild.nodeType === 3) b.firstChild.textContent = "⚖ Pull bench"; const hb = $("btnHuddle"); if (hb && hb.firstChild) hb.firstChild.textContent = U.codeLabel; }
  const station = (t) => { if (t.id !== "spectrometer") return false; ev("zeff_open", { at: t.id }); ctx.openNotebook("zeff"); say("You step up to the pull bench."); render(); return true; };

  // ---------- intro, card, guide ----------
  function hookCanvas() { const d = h("div", { class: "zeAtom", style: "width:220px;height:220px" }); d.innerHTML = Z.svg(lab.hook.Z, { showCore: false, tag: true }); return d; }
  function renderIntro(box, c) {
    const key = (k, t) => h("tr", {}, h("td", {}, h("kbd", {}, k)), h("td", {}, t)), name = h("input", { id: "student", type: "text", autocomplete: "name", style: "width:18em", placeholder: "First and last name" });
    const go = h("button", { id: "introGo", class: "primary", disabled: true, onclick: () => c.onIntroDone(name.value.trim()) }, "Start the pre-lab →");
    name.addEventListener("input", () => { go.disabled = name.value.trim().length < 3; }); if (c.S.student) { name.value = c.S.student; go.disabled = name.value.trim().length < 3; }
    box.replaceChildren(h("h2", {}, lab.title), h("div", { class: "row", style: "align-items:flex-start;gap:18px" }, hookCanvas(), h("div", {}, h("h3", {}, lab.hook.ask), h("p", {}, lab.hook.note), h("p", {}, lab.intro), h("p", { class: "zeMsg" }, lab.goal))),
      h("h3", {}, "How this lab works"), h("ol", {}, lab.introSteps.map((t) => h("li", {}, t))), h("h3", {}, "Controls"), h("table", { class: "keys" }, ...lab.keyRows.map(([k, t]) => key(k, t))),
      h("label", { style: "display:block;margin:12px 0" }, "Your name ", name), h("div", { class: "controls foot" }, h("button", { id: "introDemo", onclick: c.onDemo }, "▶ Watch the demo"), go));
  }
  function renderPrelab(box, c) {
    const cd = lab.cards[0], pic = h("div", { class: "zeAtom", style: "width:260px;height:260px" }); pic.innerHTML = Z.svg(11, { showCore: false, tags: { nucleus: 1, core: 2, outer: 3 }, tag: true });
    box.replaceChildren(h("h2", {}, cd.term), h("div", { class: "row", style: "align-items:flex-start;gap:18px" }, pic, h("p", { style: "max-width:36em;font-size:16px" }, cd.body)),
      h("div", { class: "controls foot" }, h("button", { id: "cardDone", class: "primary", onclick: () => c.onPrelabDone() }, "Enter the lab →")));
  }
  function guide(id) {
    const E2 = (e, x) => (e ? ["el", e, x] : null), open = isOpen(), btn = $("btnNotebook");
    switch (id) {
      case "door": return null; case "bench": return null;
      case "z_measure": return open ? (G().Z === 11 ? E2($("zeMeasure"), A.measure) : E2($("zeCell_11"), A.pick)) : E2(btn, "Open the pull bench.");
      case "z_shield": return open ? E2($("zeShieldBtn"), A.shield) : E2(btn, "Open the pull bench.");
    }
    return null;
  }

  // ---------- the one huddle: a notes huddle in the middle ----------
  function huddle(n, hx) {
    if (n !== 2) return hx.finish();
    const g = G(), B = L.BLANKS(Z), box = hx.box, CODE = window.MrD && MrD.codes && MrD.codes.gateV3 ? MrD.codes.gateV3(lab.id, "h1") : hx.code, msg = h("p", { class: "hint", role: "status" });
    const inputs = B.map((b) => { const i = h("input", { id: "zeBlank_" + b.id, type: "text", autocomplete: "off", value: g.blanks[b.id] || "", "aria-label": b.pre }); i.addEventListener("input", () => { g.blanks[b.id] = i.value; sync(); }); return i; });
    const filled = () => B.every((b) => (g.blanks[b.id] || "").trim());
    const code = h("input", { id: "huddleCode", type: "text", inputmode: "numeric", maxlength: "4", autocomplete: "off", "aria-label": U.codeLabel, style: "width:6em" });
    const go = h("button", { id: "huddleGo", class: "primary", onclick: () => { if (hx.isKey || !hx.gates || code.value.trim() === CODE) { g.huddle = true; ev("zeff_huddle", { blanks: B.map((b) => ({ id: b.id, text: g.blanks[b.id], ok: L.blankOk(b, g.blanks[b.id]) })) }); hx.finish(); } else msg.textContent = U.codeWrong; } }, U.codeGo);
    const sync = () => { go.disabled = !filled(); };
    box.replaceChildren(h("h2", {}, U.huddleTitle), h("p", {}, U.huddleText), ...B.map((b, i) => h("label", { class: "zeBl" }, `${i + 1}. ${b.pre} `, inputs[i], ` ${b.post}`)),
      hx.isKey ? h("p", {}, U.keyShows.replace("{code}", CODE)) : !hx.gates ? h("p", { class: "hint" }, U.codeNote) : h("label", {}, U.codeLabel + " ", code), msg, h("div", { class: "controls" }, go)); sync(); hx.open();
  }

  // ---------- key, record ----------
  const tr = (th, ...tds) => h("tr", {}, h("th", {}, th), ...tds.map((t) => h("td", {}, t)));
  function key() {
    const rows = [], B = L.BLANKS(Z);
    rows.push(tr(`Timing (this run is ${LEN} minutes; change it with ?min=NN on the address)`, h("ol", {}, [`0 to 3: intro, the one picture card, walk in.`, `3 to ${MID}: free exploring: measure atoms, Li-Na-K, predict Na or Mg.`, `${MID}: one huddle. Eyes up, copy the board (blanks below). Board: chemistry/whiteboard/index.html#lesson=zeff, frames 1, 2 and 4.`, `${MID} to ${LEN}: the mystery atom, then the paper worksheet.`].map((t) => h("li", {}, t)))));
    rows.push(tr("Huddle blanks", h("ol", {}, B.map((b) => h("li", {}, `${b.pre} ___ ${b.post}  →  ${b.ans[0]}`))), "Any non-empty copy lets a student on; the record keeps what they typed and whether it matched."));
    rows.push(tr("Predict", "Sodium or magnesium? Magnesium holds harder: Z_eff 2 vs 1 at the same outer ring, pull 2/9 vs 1/9. A miss is data, not a mistake: it opens the reason."));
    rows.push(tr("Mystery atom for this student", `${Z.atom(mysZ()).name} (Z = ${mysZ()})`, "Seeded by the student's name."));
    rows.push(tr("Simplifications", h("ul", {}, ["Z_eff = Z − core electrons; valence electrons do not shield each other. Real values are larger; the ranking is the same.", "Pull = Z_eff ÷ n², with n the outer ring number standing in for distance. A classroom number, not a measurement.", "Lithium to calcium only: past calcium the 3d subshell fills and 'core' needs a rule this lab does not teach.", "Thirteen neighbor pairs (for example Be and B) rank differently in measured ionization energy. The lab never asks a student to compare them."])));
    for (const z of L.ZS) { const a = Z.atom(z); rows.push(tr(`${a.sym} (Z = ${z})`, `rings ${a.rings.join(", ")}`, `core ${a.core}, Z_eff ${a.zeff}, n ${a.n}, pull ${pullTxt(a)}`)); }
    return rows;
  }
  function record(base) { const g = G(); return { ...base, prelab: { cards: lab.cards.map((c) => c.id) }, submitted: g.handed, zeff: { lengthMin: LEN, measured: g.measured, shieldPresses: g.shieldN, predict: g.pred, mystery: { Z: g.mys.Z, ok: g.mys.ok, tries: g.mys.tries, attempts: g.mys.att }, huddleBlanks: g.blanks, huddle: g.huddle, handed: g.handed } }; }

  // demo and tests reach in here
  async function demo({ say: cap, walk, wait, api }) {
    const T = lab.demo; await cap(1, T[0], 6000);
    await cap(2, T[1], 3000); await walk("UUUUUURRU"); api.interact(); await wait(2200);
    await cap(3, T[2], 2500); pick(11, true); await wait(1800);
    await cap(4, T[3], 2500); measure(); await wait(2800);
    await cap(5, T[4], 2500); shield(true); await wait(3200);
    await cap(6, T[5], 2500); shield(false); pick(19, true); measure(); await wait(3200);
    await cap(7, T[6], 3000); pick(11, true); await wait(2800);
    await cap(8, T[7], 3000); await wait(3000);
    api.closeNotebook(); await cap(9, T[8], 5000);
  }
  return { zeff: true, sheet, step, refresh, draw: () => {}, station, canOpen: () => live(), showTab: () => {}, hintPicture: () => null, guide, key, print: () => [], record, questState, visible: () => true, unlocked: () => true,
    syncSources: () => {}, answered: () => [], evidence: () => [], recordComplete: () => true, renderPrelab, renderIntro, text: (k) => U[k] || "", holding: () => false, clock: { huddle1AtMin: 999, huddle2AtMin: MID }, bottles: [], huddle, panel: () => ({ title: "", items: [] }),
    controls: h("div", { id: "zeControls" }), demo, hooks: undefined, hk: { pick: (z) => pick(z, true), measure, shield, predict, nameMystery, state: G, mysZ, len: LEN, mid: MID } };
}
