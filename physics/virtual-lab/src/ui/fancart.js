// Lab 5 UI: the fan-cart notebook (track picture, bars, fan setting, Run, the speed graph with two markers, Record; then the Table,
// Graph builder, Checks and CER tabs), the balance and shelf screens, the pre-lab, the two huddle screens, the two tutorials and the
// scripted demo. It answers the same calls as the flame lab's controller, so the shared lab app can host it from this folder.
// All student-facing wording is in content/labs/05-fan-cart.json (lab.ui) or the sheet's own content files.
// The model's formula lives in engine/fancart.js only.
import { h, mulberry32 } from "../../../../chemistry/virtual-lab/src/ui/dom.js";
import * as E from "../engine/fancart.js";
import * as R from "../engine/record.js";
import * as K from "../engine/checks.js";
import { paintTrack, paintSpeed, paintBuilder, tToX, xToT, speedGeom, SPEED, TRACK, builderGeom } from "./graphs.js";
import { PRELAB, speedLines, shapePic } from "./pictures.js";

export const demoTotal = 9;              // the scripted demo has nine captions
export const chestQuests = ["bars", "weigh"];   // quests whose yellow arrow points inside a shelf or balance screen
export const RUN_ANIM_S = 1.2;
const MAX_X = 1.9;                       // metres: the cart's nose reaches the motion sensor (the sheet's nine runs all stop short of this)           // the 2.0 s roll plays at demo-fast speed: 1.2 s on screen

// ---------- state the app saves ----------
export const fresh = () => ({
  cfg: { bars: 0, setting: 1 }, last: null, atEnd: false, mk: [0.9, 1.1], active: 0, rows: R.emptyRows(), pred: { force: null, mass: null, test: null },
  plot: { F: "", m: "", invm: "" }, gx: "F", tab: "table", weighed: { cart: false, bar: false }, trackSeen: false, tut1: false, tut2: false,
  checks: K.newChecks(), h2: { h1: "", h2: "", h3: "" }, huddle1: false, huddle2: false, h1Forced: false, h2Auto: false, cerDone: false, handed: false,
  anim: null, tutNow: 0, lastRead: null, runs: 0
});
export function fix(g) { const d = fresh(); for (const k in d) if (g[k] === undefined) g[k] = d[k]; g.anim = null; g.tutNow = 0; return g; }

export async function load(lab, getJSON) {
  const [data, items, content] = await Promise.all([lab.files.data, lab.files.items, lab.files.content].map(getJSON));
  // the sheet's three content files stay untouched; this only wires them together
  Object.assign(lab, { data, items, content, flameData: data, flameItems: items, prelab: content.prelab, postlab: content.postlab, quests: content.quests, terms: content.terms });
}

const wc = (s) => (String(s).trim().match(/\S+/g) || []).length;
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : "—");

export function create(ctx) {
  const { lab, S, log, say, onChange } = ctx, D = lab.data, I = lab.items, C = lab.content, U = lab.ui, G = () => S.flame;
  const live = () => ["lab", "postlab", "done"].includes(S.stage) || ctx.isDemo();
  const ev = (type, data) => { if (!ctx.isDemo()) log.add(type, data); };
  const $in = (root, sel) => root.querySelector(sel);
  const carried = () => ctx.carried().filter((k) => /^bar\d+$/.test(k)).length;
  const pctx = () => ctx.studentKey();

  // ---------- the shelf: six mass bars ----------
  const bars = () => Array.from({ length: D.cart.bars_on_shelf.value }, (_, i) => ({ key: "bar" + (i + 1), id: "bar", label: U.barWord + " " + (i + 1), short: U.barShort + " " + (i + 1), group: C.room.legend.B.group, phase: "s", shelf: 0, idx: i, color: "#3b3f46", icon: "bar", log: { id: "bar" } }));
  const syncSources = (sources) => { sources.length = 0; sources.push(...bars()); };

  // ---------- the balance: read the cart and one bar ----------
  const weights = () => [{ key: "cart", label: U.cartWord, short: U.cartWord, mass: D.cart.mass_kg.value }, { key: "bar", label: U.barOne, short: U.barShort, mass: D.cart.bar_mass_kg.value }];
  function weigh(k) {
    const w = weights().find((x) => x.key === k); if (!w) return;
    G().weighed[k] = true; ev("weigh", { item: k, kg: w.mass }); say(U.balanceReads.replace("{what}", w.label.toLowerCase()).replace("{m}", f2(w.mass)), "obs");
    onChange(); ctx.refreshPanel();
  }
  const panel = (t) => ({ title: t.name || t.label, verb: U.weighVerb, keep: true, onAll: null, onUse: (it) => weigh(it.key),
    items: weights().map((w) => ({ key: w.key, label: w.label, short: w.short, icon: w.key === "bar" ? "bar" : "cart", blurb: G().weighed[w.key] ? f2(w.mass) + " kg" : "", has: G().weighed[w.key] })) });

  // ---------- the track: the notebook opens here ----------
  function station(t) {
    if (t.id === "track") { G().trackSeen = true; ev("station", { id: "track" }); say(U.atTrack); ctx.openNotebook("table"); return true; }
    if (t.id === "balance") { ev("station", { id: "balance" }); S.panel = t; ctx.refreshPanel(); return true; }
    return false;
  }
  function canOpen() { if (G().trackSeen || ctx.isDemo()) return true; say(U.notebookAtTrack, "warn"); return false; }

  // ---------- the apparatus ----------
  const labels = { track: U.lblTrack, sensor: U.lblSensor, cart: U.lblCart, fan: U.lblFan, bars: U.lblBars, forceSensor: U.lblForceSensor, force: U.lblForce };
  const trackCv = h("canvas", { id: "fcTrack", class: "fcCv", width: TRACK.W, height: TRACK.H, role: "img", "aria-label": U.trackAlt });
  const speedCv = h("canvas", { id: "fcSpeed", class: "fcCv", width: SPEED.W, height: SPEED.H, tabindex: "0", role: "img", "aria-label": U.speedAlt });
  const tcx = trackCv.getContext("2d"), scx = speedCv.getContext("2d");
  let spin = 0, drag = -1, focus = false, runCache = null, dirty = true;
  const lastRun = () => { const l = G().last; if (!l) return null; if (!runCache || runCache.seed !== l.seed || runCache.setting !== l.setting || runCache.bars !== l.bars) runCache = E.run(D, l); return runCache; };
  const reading = () => { const rn = lastRun(); return rn && !G().anim ? E.read(D, rn, G().mk[0], G().mk[1]) : null; };

  function paintAll() {
    const g = G(), l = g.last, running = !!g.anim;
    let x = 0;
    if (l && (running || g.atEnd)) { const ts = running ? Math.min(D.run.duration_s.value, (g.anim.t / RUN_ANIM_S) * D.run.duration_s.value) : D.run.duration_s.value; x = Math.min(MAX_X, E.xAt(D, l.F ?? E.forceOf(D, l.setting), E.massOf(D, l.bars), ts)); }   // the picture stops the cart at the end of the rail
    const shownBars = l && (running || g.atEnd) ? l.bars : g.cfg.bars, shownSetting = l && (running || g.atEnd) ? l.setting : g.cfg.setting;
    paintTrack(tcx, { x, bars: shownBars, spin: spin, push: E.forceOf(D, shownSetting) / E.forceOf(D, 4), labels });
    paintSpeed(scx, { run: running ? null : lastRun(), mk: g.mk, reading: reading(), active: g.active, focus, labels: { x: U.axisTime, y: U.axisSpeed, empty: U.speedEmpty } });
    dirty = false;
  }

  // controls
  const barBtns = Array.from({ length: E.MAX_BARS(D) + 1 }, (_, n) => h("button", { id: "fcBar" + n, class: "fcb", type: "button", onclick: () => setBars(n) }, String(n)));
  const setBtns = E.SETTINGS(D).map((n) => h("button", { id: "fcSet" + n, class: "fcb", type: "button", onclick: () => setSetting(n) }, String(n)));
  const forceTxt = h("span", { id: "fcForce", class: "fcforce" });
  const runBtn = h("button", { id: "fcRun", class: "primary", type: "button", onclick: () => doRun() }, U.run);
  const msgEl = h("p", { id: "fcMsg", class: "hint fcmsg", role: "status" });
  const readA = h("b", { id: "fcA" }, "--"), shaky = h("p", { id: "fcShaky", class: "hint fcshaky", role: "status" });
  const massIn = h("input", { id: "fcMass", type: "number", step: "0.01", min: "0", "aria-label": U.massLabel, style: "width:6.5em", onkeydown: (e) => { if (e.key === "Enter") doRecord(); }, oninput: () => { recMsg.textContent = ""; dirty = true; syncLeft(true); } });
  const recBtn = h("button", { id: "fcRecord", class: "primary", type: "button", onclick: () => doRecord() }, U.record);
  const where = h("p", { id: "fcWhere", class: "hint" }), recMsg = h("p", { id: "fcRecMsg", class: "hint fcbad", role: "status" });
  const tutBtn1 = h("button", { id: "fcTut1", type: "button", class: "fclink", onclick: () => startTutorial(1) }, U.tutReplay + " " + C.tutorials.tutorial1.name);
  const guideBox = (fig, pop) => h("details", { class: "fcGuide" + (pop ? " pop" : ""), id: "fcGuide_" + fig.id }, h("summary", {}, pop ? pop : U.readingGuide), h("div", { class: "fcGuideBody" }, h("p", {}, h("b", {}, fig.title)), h("p", {}, h("i", {}, U.gAxes + " "), fig.axes), h("p", {}, h("i", {}, U.gMark + " "), fig.oneMark), h("p", {}, h("i", {}, U.gLook + " "), fig.lookFirst), h("p", {}, h("i", {}, U.gWrong + " "), fig.wrongReading)));
  const fig = (id) => C.figures.find((f) => f.id === id);

  const left = h("div", { class: "fcLeft" },
    h("div", { class: "fcBlock" }, trackCv),
    h("div", { class: "fcCtl" },
      h("div", { class: "fcRow" }, h("span", { class: "fcLbl" }, U.barsLabel), ...barBtns),
      h("div", { class: "fcRow" }, h("span", { class: "fcLbl" }, U.settingLabel), ...setBtns, forceTxt, runBtn),
      msgEl),
    h("div", { class: "fcBlock" }, speedCv,
      h("div", { class: "fcRead" }, h("div", { id: "fcReadBox", class: "fcbox" }, readA, h("span", {}, U.accelUnit)), guideBox(fig("track-picture"), U.guideTrack), guideBox(fig("speed-graph"), U.guideSpeed), tutBtn1), shaky),
    h("div", { class: "fcRec" }, h("label", {}, U.massLabel + " ", massIn), recBtn, where, recMsg));

  function setBars(n) { const g = G(); if (g.anim || n > carried()) return; if (g.cfg.bars !== n) { g.cfg.bars = n; g.atEnd = false; } msgEl.textContent = ""; dirty = true; syncLeft(true); onChange(); }
  function setSetting(n) { const g = G(); if (g.anim) return; if (g.cfg.setting !== n) { g.cfg.setting = n; g.atEnd = false; } msgEl.textContent = ""; dirty = true; syncLeft(true); onChange(); }
  function notice(txt, kind) { msgEl.textContent = txt; msgEl.className = "hint fcmsg" + (kind === "warn" ? " fcbad" : ""); }

  function doRun() {
    const g = G(); if (!live() || g.anim) return;
    const block = R.runBlock(D, g, g.cfg.bars);
    if (block) { notice(block === "after" ? U.afterCode2 : C.messages.predictLock, "warn"); if (block === "predict") { g.tab = "table"; renderTab(); } return; }
    const seed = E.freshSeed(); g.last = { setting: g.cfg.setting, bars: g.cfg.bars, seed, F: E.forceOf(D, g.cfg.setting) };
    g.mk = [0.9, 1.1]; g.anim = { t: 0 }; g.atEnd = false; g.runs++; g.lastRead = null; recMsg.textContent = ""; notice("");
    ev("run", { setting: g.last.setting, bars: g.last.bars, seed, part: R.partOf(D, g.rows, g.last) || "none" });
    dirty = true; syncLeft(true); onChange();
  }
  function afterRun() {
    const g = G(); g.atEnd = true; dirty = true; syncLeft(true); onChange();
    if (!g.tut1 && !ctx.isDemo()) { g.tut1 = true; startTutorial(1); }
  }

  // markers
  const snap = (t) => Math.min(SPEED.tmax, Math.max(0, Math.round(t / 0.05) * 0.05));
  const cvX = (e) => { const r = speedCv.getBoundingClientRect(); return (e.clientX - r.left) * (SPEED.W / r.width); };
  const shown = () => !!lastRun() && !G().anim;
  function commitRead() { const r = reading(); if (r && r.ok) { G().lastRead = r.a; ev("read", { a: r.a, t1: r.lo, t2: r.hi }); onChange(); } syncLeft(true); }
  function moveMarker(i, t) { const g = G(); g.mk[i] = +snap(t).toFixed(2); g.active = i; dirty = true; syncLeft(true); }
  speedCv.addEventListener("pointerdown", (e) => {
    if (!shown()) return; const x = cvX(e), d = G().mk.map((t) => Math.abs(tToX(t) - x)), i = d[0] <= d[1] ? 0 : 1;
    if (d[i] > 16) return; drag = i; G().active = i; try { speedCv.setPointerCapture(e.pointerId); } catch (err) { /* no capture */ } e.preventDefault(); moveMarker(i, xToT(x));
  });
  speedCv.addEventListener("pointermove", (e) => { if (drag >= 0) moveMarker(drag, xToT(cvX(e))); });
  const endDrag = () => { if (drag >= 0) { drag = -1; commitRead(); } };
  speedCv.addEventListener("pointerup", endDrag); speedCv.addEventListener("pointercancel", endDrag);
  speedCv.addEventListener("focus", () => { focus = true; dirty = true; }); speedCv.addEventListener("blur", () => { focus = false; dirty = true; });
  speedCv.addEventListener("keydown", (e) => {
    if (!shown()) return; const g = G();
    if (e.key === "1" || e.key === "2") { g.active = +e.key - 1; dirty = true; e.preventDefault(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowRight") { moveMarker(g.active, g.mk[g.active] + (e.key === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 0.25 : 0.05)); e.preventDefault(); }
  });
  speedCv.addEventListener("keyup", (e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") commitRead(); });

  // record: the fan force and the acceleration fill in, the student types the mass
  function recordState() {
    const g = G(), rn = lastRun(), rd = reading();
    if (!rn || g.anim) return { ok: false };
    const part = R.partOf(D, g.rows, g.last);
    return { ok: !!(rd && rd.ok && part), part, rd, why: !part ? U.noTable : "" };
  }
  function doRecord() {
    const g = G(); if (!live()) return; const st = recordState(); if (!st.ok) return;
    const typed = parseFloat(massIn.value);
    if (!R.massOk(D, typed, g.last.bars)) { recMsg.textContent = C.messages.massWrong; ev("record_try", { part: st.part, bars: g.last.bars, typed: Number.isFinite(typed) ? typed : null, ok: false }); return; }
    const row = R.addRow(D, g.rows, st.part, g.last, typed, st.rd.a);
    ev("record", { part: st.part, setting: row.setting, bars: row.bars, F: row.F, m: row.m, a: row.a });
    say(U.recorded.replace("{n}", st.part === "test" ? U.testWord : U.partWord + " " + st.part), "obs"); massIn.value = ""; recMsg.textContent = ""; dirty = true;
    syncLeft(true); renderTab(); onChange(); saveProfile();
  }

  let lsig = "";
  function syncLeft(force) {
    const g = G(), have = carried(), rn = lastRun(), rd = reading(), rs = recordState(), blk = R.runBlock(D, g, g.cfg.bars);
    const sig = JSON.stringify([g.cfg, g.last && g.last.seed, !!g.anim, g.mk, rd && rd.ok && rd.a, have, rs.ok, rs.part, !!massIn.value, g.huddle2, blk, g.atEnd]);
    if (!force && sig === lsig && !dirty) return; lsig = sig;
    barBtns.forEach((b, n) => { b.disabled = n > have || !!g.anim; b.classList.toggle("on", g.cfg.bars === n); b.setAttribute("aria-pressed", g.cfg.bars === n); });
    setBtns.forEach((b, i) => { b.disabled = !!g.anim; b.classList.toggle("on", g.cfg.setting === i + 1); b.setAttribute("aria-pressed", g.cfg.setting === i + 1); });
    forceTxt.textContent = U.forceReads.replace("{F}", f2(E.forceOf(D, g.cfg.setting)));
    runBtn.disabled = !!g.anim || !live();
    readA.textContent = rd && rd.ok ? f2(rd.a) : "--";
    shaky.textContent = rn && rd && rd.short ? C.messages.markersClose : "";
    tutBtn1.hidden = !rn;
    recBtn.disabled = !(rs.ok && massIn.value !== "");
    where.textContent = rn && !g.anim ? (rs.part ? U.goesIn.replace("{n}", rs.part === "test" ? U.testWord : U.partWord + " " + rs.part) : U.noTable) : U.recordNeedRun;
    if (g.last && !g.anim) where.textContent += " " + U.lastRunWas.replace("{s}", g.last.setting).replace("{b}", g.last.bars);
    handBtn.hidden = !g.huddle2;
    paintAll();
  }

  // ---------- the right half: tabs ----------
  const tabBody = h("div", { id: "fcTabBody", class: "fcTabBody" }), tabRow = h("div", { class: "tabs", id: "fcTabs" });
  const TABS = [["table", U.tabTable], ["graph", U.tabGraph], ["checks", U.tabChecks], ["cer", U.tabCer]];
  const handBtn = h("button", { id: "fcHandIn", class: "primary", type: "button", hidden: true, onclick: () => handIn() }, U.handIn);
  const right = h("div", { class: "fcRight" }, tabRow, tabBody, h("div", { class: "controls foot" }, handBtn));
  const tutLayer = h("div", { id: "fcTutLayer", class: "fcTutLayer" });
  const sheet = h("div", { id: "fcSheet", class: "fcSheet" }, h("button", { id: "fcClose", class: "x", "data-close": "", onclick: (e) => e.target.closest("dialog").close() }, U.closeWord), h("h2", {}, U.notebookTitle), h("div", { class: "fcCols" }, left, right), tutLayer);
  function drawTabs() { tabRow.replaceChildren(...TABS.map(([k, label]) => h("button", { id: "fcTab_" + k, "data-tab": k, class: G().tab === k ? "on" : "", onclick: () => showTab(k) }, label))); }
  function showTab(k) {
    const g = G(); g.tab = k || g.tab || "table"; renderTab();
    if (g.tab === "graph" && !g.tut2 && !ctx.isDemo()) { g.tut2 = true; setTimeout(() => startTutorial(2), 60); }
  }
  function renderTab() {
    const g = G(); drawTabs();
    const body = g.tab === "graph" ? graphTab() : g.tab === "checks" ? checksTab() : g.tab === "cer" ? cerTab() : tableTab();
    tabBody.replaceChildren(...body.filter(Boolean));
    syncLeft(true);
  }

  // ----- Table tab -----
  function tableTab() {
    const g = G(), after = g.huddle2, cell = (v, d = 2) => (v === undefined ? "—" : typeof v === "number" ? v.toFixed(d) : v);
    const t1 = h("table", { class: "ftab", id: "fcTable1" }, h("thead", {}, h("tr", {}, C.record.part1Columns.map((c) => h("th", {}, c)))),
      h("tbody", {}, R.part1Settings(D).map((s) => { const r = g.rows.p1[s]; return h("tr", { "data-setting": s }, h("th", { scope: "row" }, String(s)), h("td", {}, cell(r && r.F)), h("td", {}, cell(r && r.m)), h("td", {}, cell(r && r.a))); })));
    const heads2 = [...C.record.part2Columns, ...(after ? [U.invmHead] : [])];
    const t2 = h("table", { class: "ftab", id: "fcTable2" }, h("thead", {}, h("tr", {}, heads2.map((c) => h("th", {}, c)))),
      h("tbody", {}, R.part2Bars(D).map((b) => { const r = g.rows.p2[b]; return h("tr", { "data-bars": b }, h("th", { scope: "row" }, String(b)), h("td", {}, cell(r && r.m)), h("td", {}, cell(r && r.F)), h("td", {}, cell(r && r.a)), ...(after ? [h("td", {}, r ? f2(1 / r.m) : "—")] : [])); })));
    const ql = (id) => C.quests.find((q) => q.id === id);
    const predCard = predictCard("mass", C.predictions[1], g.pred.mass);
    const out = [h("h3", {}, U.part1Head), h("p", { class: "hint" }, ql("part1").hint), h("div", { class: "scrollx" }, t1), R.rowCount(g.rows, "1") >= D.part1.length ? h("p", { class: "fcgood", id: "fcGood1" }, C.messages.tableGood) : null,
      predCard, h("h3", {}, U.part2Head), h("p", { class: "hint" }, ql("part2").hint), h("div", { class: "scrollx" }, t2), R.rowCount(g.rows, "2") >= D.part2.length ? h("p", { class: "fcgood", id: "fcGood2" }, C.messages.tableGood) : null];
    if (after) out.push(testCard());
    return out;
  }
  // one-try prediction with a choice: logged, locked, and nothing said about right or wrong
  function predictCard(id, P, picked) {
    const fb = h("div", { class: "fb" + (picked ? " show ok" : ""), role: "status" }, picked ? C.prelab.prediction.afterTry : ""), opts = h("div", { class: "opts" });
    P.options.forEach((o, i) => opts.append(h("button", { id: `fcPred_${id}_${i}`, "data-i": i, class: picked && picked.i === i ? "picked" : "", disabled: !!picked, onclick: () => {
      G().pred[id] = { i, text: o }; ev("predict", { id, choice: o }); say(U.predictLogged, "obs"); onChange(); renderTab(); saveProfile(); } }, o)));
    return h("div", { class: "pq fcPred", id: "fcPredCard_" + id }, h("h3", {}, U.predictHead), h("p", {}, P.q), opts, fb);
  }
  // after code 2: the typed prediction for 3 bars, then the test run's row
  function testCard() {
    const g = G(), P = C.predictions[2], p = g.pred.test, row = g.rows.test;
    const inp = h("input", { id: "fcPredTest", type: "number", step: "0.01", min: "0", disabled: !!p, value: p ? p.value : "", "aria-label": P.q, style: "width:6.5em" });
    const go = h("button", { id: "fcPredTestGo", class: "primary", type: "button", disabled: !!p, onclick: () => { const v = parseFloat(inp.value); if (!Number.isFinite(v)) return; g.pred.test = { value: v }; ev("predict", { id: "test", value: v }); say(U.predictLogged, "obs"); onChange(); renderTab(); saveProfile(); } }, U.lockPred);
    return h("div", { class: "pq fcPred", id: "fcPredCard_test" }, h("h3", {}, U.testHead), h("p", {}, P.q), h("div", { class: "controls" }, inp, h("span", {}, U.unitAccel), go),
      row ? h("div", { class: "scrollx" }, h("table", { class: "ftab", id: "fcTable3" }, h("thead", {}, h("tr", {}, [C.record.part2Columns[0], C.record.part2Columns[1], C.record.part2Columns[2], C.record.part2Columns[3], U.invmHead, U.yourPred].map((c) => h("th", {}, c)))),
        h("tbody", {}, h("tr", {}, h("th", { scope: "row" }, String(row.bars)), h("td", {}, f2(row.m)), h("td", {}, f2(row.F)), h("td", {}, f2(row.a)), h("td", {}, f2(1 / row.m)), h("td", {}, p ? f2(p.value) : "—"))))) : null);
  }

  // ----- Graph builder tab -----
  const XS = [["F", () => U.xForce], ["m", () => U.xMass], ["invm", () => U.xInvm]];
  const xLabel = { F: () => U.axisForce, m: () => U.axisMass, invm: () => U.axisInvm };
  const figOf = { F: "a-vs-F", m: "a-vs-m", invm: "a-vs-invm" };
  const gcv = h("canvas", { id: "fcGraph", class: "fcCv fcGraphCv", width: builderGeom().W, height: builderGeom().H, role: "img", "aria-label": U.graphAlt });
  const gcx = gcv.getContext("2d");
  function paintGraph() {
    const g = G(), x = g.gx, pts = R.dots(g.rows, x), line = g.plot[x];
    paintBuilder(gcx, { x, dots: pts, line, fit: line === "guide" ? R.guideLine(pts) : null, extra: x === "invm" && g.huddle2 ? R.testDot(g.rows) : null, xLabel: xLabel[x](), yLabel: U.axisAccel, labels: { empty: U.graphEmpty } });
  }
  function drawLine(kind) {
    const g = G(), x = g.gx, pts = R.dots(g.rows, x), note = $in(tabBody, "#fcGraphMsg");
    if (pts.length < 3) { note.textContent = C.messages.guideLineNeedsDots; return; }
    g.plot[x] = g.plot[x] === kind ? "" : kind; note.textContent = "";
    if (g.plot[x]) ev("plot", { x, line: kind, dots: pts.length });
    paintGraph(); onChange();
  }
  function graphTab() {
    const g = G(), xs = XS.filter(([k]) => k !== "invm" || g.huddle2); if (g.gx === "invm" && !g.huddle2) g.gx = "F";
    const sel = h("select", { id: "fcAcross", "aria-label": U.across, onchange: (e) => { g.gx = e.target.value; showTabKeep(); } }, xs.map(([k, f]) => h("option", { value: k }, f())));
    sel.value = g.gx;
    const gbox = guideBoxFor(g.gx);
    queueMicrotask(paintGraph);
    return [h("div", { class: "fcRow" }, h("label", {}, U.across + " ", sel), h("span", { class: "fcLbl" }, U.up + ": " + U.axisAccel)), gcv,
      h("div", { class: "gtools" }, h("button", { id: "fcGuide", type: "button", class: g.plot[g.gx] === "guide" ? "on" : "", onclick: () => drawLine("guide") }, U.guideLine), h("button", { id: "fcConnect", type: "button", class: g.plot[g.gx] === "connect" ? "on" : "", onclick: () => drawLine("connect") }, U.connectDots),
        h("button", { id: "fcTut2", type: "button", class: "fclink", onclick: () => startTutorial(2) }, U.tutReplay + " " + C.tutorials.tutorial2.name)),
      h("p", { id: "fcGraphMsg", class: "hint fcbad", role: "status" }), gbox];
  }
  const guideBoxFor = (x) => guideBox(fig(figOf[x]));
  const showTabKeep = () => { renderTab(); };

  // ----- Checks tab -----
  function checksTab() {
    const g = G(), st = g.checks, it = K.nextItem(I, D, st, pctx()), res = st.res[it.id] || { tries: 0, hints: 0 };
    const fb = h("div", { class: "fb", role: "status", id: "fcFb" }), box = h("div", { class: "pq", id: "fcItem", "data-item": it.id });
    const shownHints = []; for (let k = 0; k < res.hints; k++) shownHints.push(h("p", { class: "hintline", id: "fcHint" + (k + 1) }, h("b", {}, U.hintWord + " " + (k + 1) + ". "), it.hints[k]));
    const submit = (choice) => {
      const r = K.answerItem(I, st, it, choice); ev("item", { id: it.id, band: it.band, tries: r.tries, hints: r.hints, state: r.state });
      if (r.state === "right") { fb.className = "fb show ok"; fb.textContent = U.itemRight; } else if (r.state === "closed") { fb.className = "fb show no"; fb.textContent = U.itemClosed; }
      onChange(); saveProfile(); setTimeout(() => { if (G().tab === "checks") renderTab(); }, r.state === "hint" ? 0 : 900);
    };
    const pic = it.figure && it.figure.kind === "speed-graph" ? speedLines(it.figure) : null;
    let ans;
    if (it.type === "num") {
      const inp = h("input", { id: "fcAnswer", type: "number", step: "0.01", "aria-label": it.prompt, style: "width:7em", onkeydown: (e) => { if (e.key === "Enter") go.click(); } });
      const go = h("button", { id: "fcCheck", class: "primary", type: "button", onclick: () => { const v = parseFloat(inp.value); if (Number.isFinite(v)) submit(v); } }, U.checkBtn);
      ans = h("div", { class: "controls" }, inp, h("span", {}, it.unit), go);
    } else if (it.type === "pick-shape") {
      ans = h("div", { class: "fcShapes" }, it.options.map((o, i) => h("button", { id: "fcOpt_" + i, class: "fcShape", type: "button", onclick: () => submit(i) }, shapePic(it.figure.options[i]), h("span", {}, o))));
    } else ans = h("div", { class: "opts" }, it.options.map((o, i) => h("button", { id: "fcOpt_" + i, class: "opt", type: "button", onclick: () => submit(i) }, o)));
    box.append(...[h("p", {}, it.prompt), pic, ans, fb, ...shownHints, res.hints ? h("p", { class: "hint" }, res.hints < K.HINTS_MAX ? U.hintNext : U.hintLast) : null].filter(Boolean));
    return [h("h3", {}, U.checksHead), box];
  }

  // ----- CER tab -----
  function cerTab() {
    const post = lab.postlab, c = S.cer, g = G();
    const claim = h("textarea", { id: "fcClaim", rows: 2, style: "width:100%", "aria-label": U.claimHead }), evid = h("textarea", { id: "fcEvidence", rows: 3, style: "width:100%", "aria-label": U.evidenceHead }), reas = h("textarea", { id: "fcReasoning", rows: 4, style: "width:100%", "aria-label": U.reasoningHead });
    claim.value = c.claim || ""; evid.value = c.evidence || ""; reas.value = c.reasoning || "";
    const st = h("p", { class: "hint", role: "status", id: "fcCerStatus" }), checks = h("div", {}), go = h("button", { id: "fcCerGo", class: "primary", type: "button", disabled: true, onclick: () => submitCer() }, U.submitCer);
    const chips = (list, ta, kind) => h("div", { class: "chips" }, list.map((t, i) => h("button", { id: `fcChip_${kind}_${i}`, class: "chip", type: "button", onclick: () => { const s = ta.selectionStart ?? ta.value.length; ta.value = ta.value.slice(0, s) + t + ta.value.slice(ta.selectionEnd ?? s); ta.focus(); ta.dispatchEvent(new Event("input")); } }, t)));
    const update = () => {
      Object.assign(c, { claim: claim.value, evidence: evid.value, reasoning: reas.value });
      const all = [...checks.querySelectorAll("input")].every((i) => i.checked), ok = wc(claim.value) >= post.minWords.claim && wc(evid.value) >= post.minWords.evidence && wc(reas.value) >= post.minWords.reasoning && all;
      go.disabled = !ok; st.textContent = g.cerDone ? U.cerSaved : ok ? U.cerReady : U.cerNeeded.replace("{c}", post.minWords.claim).replace("{e}", post.minWords.evidence).replace("{r}", post.minWords.reasoning);
    };
    for (const el of [claim, evid, reas]) el.addEventListener("input", update);
    checks.replaceChildren(...post.checklist.map((t, i) => h("label", { class: "ck" }, h("input", { type: "checkbox", id: "fcCk_" + i, onchange: update }), t)));
    function submitCer() { Object.assign(S.cer, { claim: claim.value.trim(), evidence: evid.value.trim(), reasoning: reas.value.trim() }); S.cerDone = true; g.cerDone = true; ev("cer", { ...S.cer, cited: R.cited(S.cer.evidence, g.rows) }); say(U.cerSaved, "obs"); update(); onChange(); saveProfile(); }
    queueMicrotask(update);
    return [h("p", {}, post.prompt), h("h3", {}, U.claimHead), chips(post.starters.claim, claim, "claim"), claim, h("h3", {}, U.evidenceHead), h("p", { class: "hint" }, U.evidenceHint), evid,
      h("h3", {}, U.reasoningHead), chips(post.starters.reasoning, reas, "reasoning"), h("div", { class: "chips" }, post.wordBank.map((t, i) => h("button", { id: "fcChip_bank_" + i, class: "chip", type: "button", onclick: () => { reas.value += (reas.value && !/\s$/.test(reas.value) ? " " : "") + t + " "; reas.dispatchEvent(new Event("input")); } }, t))), reas,
      h("h3", {}, U.checkYourself), checks, st, h("div", { class: "controls" }, go)];
  }

  // ---------- hand in (after code 2) ----------
  function handIn() {
    const g = G(); if (!g.huddle2 || ctx.isDemo()) return;
    g.handed = true; S.submitted = true; ev("hand_in", { rows: R.rowCount(g.rows, "1") + R.rowCount(g.rows, "2") + (g.rows.test ? 1 : 0) }); saveProfile(); ctx.closeNotebook(); ctx.finish();
  }
  // the scores stay on the student's own device (shared/profile.js); nothing else is issued at the end
  function saveProfile() {
    if (ctx.isDemo() || !window.MrD || !MrD.profile || !S.student) return;
    const g = G(), st = g.checks, items = Object.entries(st.res).map(([id, r]) => ({ skill: "fan-cart/" + id.replace(/#\d+$/, ""), title: id, band: r.band, firstTry: !!r.firstTry, ok: !!r.ok }));
    const rows = R.rowCount(g.rows, "1") + R.rowCount(g.rows, "2") + (g.rows.test ? 1 : 0);
    MrD.profile.record({ course: "physics", lesson: "fan-cart", title: lab.title, first: String(S.student).split(/\s+/)[0], period: "", day: MrD.bell ? MrD.bell.dayKey() : new Date().toISOString().slice(0, 10), reached: rows, of: D.part1.length + D.part2.length + 1, items });
  }

  // ---------- the step card: the two steps after code 2 are added once code 2 is in ----------
  let cardSig = "";
  function syncCard() {
    const el = document.getElementById("stepCard"), after = G().huddle2; if (!el || cardSig === String(after)) return; cardSig = String(after);
    const steps = [...lab.stepCard.steps, ...(after ? lab.stepCard.afterCode2 : [])]; el.replaceChildren(h("h3", {}, lab.stepCard.title), h("ol", {}, steps.map((t) => h("li", {}, t))));
  }

  // ---------- pre-lab: three pictures and a one-try prediction that reveals nothing ----------
  function renderPrelab(box, c) {
    const pre = C.prelab, qs = pre.questions, P = S.prelab, btn = h("button", { id: "preGo", class: "primary", disabled: true, onclick: () => c.onPrelabDone() }, U.enterLab), progress = h("p", { class: "hint", role: "status" });
    const upd = () => { const done = Object.keys(P.answers).length, pr = P.predicted !== undefined; progress.textContent = U.preProgress.replace("{n}", done).replace("{t}", qs.length).replace("{p}", pr ? U.preDone : U.preNot); btn.disabled = !(done === qs.length && pr); };
    const qEls = qs.map((q, qi) => {
      const rng = mulberry32(c.seed * 31 + qi + 1), order = q.options.map((_, i) => i).sort(() => rng() - 0.5), fb = h("div", { class: "fb", role: "status" }), opts = h("div", { class: "opts" });
      const lock = (picked) => { opts.querySelectorAll("button").forEach((b) => { b.disabled = true; if (+b.dataset.i === q.correct) b.classList.add("right"); else if (+b.dataset.i === picked) b.classList.add("wrong"); }); fb.className = "fb show " + (picked === q.correct ? "ok" : "no"); fb.textContent = (picked === q.correct ? U.right + " " : U.notQuite + " ") + q.explain; };
      for (const i of order) opts.append(h("button", { id: `pre_${q.id}_${i}`, "data-i": i, onclick: () => { P.answers[q.id] = i; c.onAnswer(q.id, i, i === q.correct); lock(i); upd(); } }, q.options[i]));
      if (q.id in P.answers) lock(P.answers[q.id]);
      return h("div", { class: "pq" }, h("p", {}, h("b", {}, `${qi + 1}. `), q.q), PRELAB[q.id](), opts, fb);
    });
    const pd = pre.prediction, pfb = h("div", { class: "fb", role: "status" }), popts = h("div", { class: "opts" });
    const lockP = (picked) => { popts.querySelectorAll("button").forEach((b) => { b.disabled = true; if (+b.dataset.i === picked) b.classList.add("picked"); }); pfb.className = "fb show ok"; pfb.textContent = pd.afterTry; };
    pd.options.forEach((o, i) => popts.append(h("button", { id: "pre_force_" + i, "data-i": i, onclick: () => { P.predicted = i; P.prediction = pd.options[i]; if (!ctx.isDemo()) log.add("predict", { id: "force", choice: pd.options[i] }); lockP(i); upd(); } }, o)));
    if (P.predicted !== undefined) lockP(P.predicted);
    box.replaceChildren(h("h2", {}, U.preTitle), h("p", { class: "hint" }, U.preHint), h("h3", {}, U.preQuestions), ...qEls, h("h3", {}, U.prePrediction), h("div", { class: "pq" }, h("p", {}, pd.q), popts, pfb), progress, h("div", { class: "controls foot" }, btn));
    upd();
  }

  // ---------- the two huddle screens ----------
  function codeRow(hx, ok, closable) {
    const msg = h("p", { class: "hint", role: "status" }), inp = h("input", { id: "huddleCode", type: "text", inputmode: "numeric", maxlength: "4", autocomplete: "off", "aria-label": U.codeLabel, style: "width:6em" });
    const go = h("button", { id: "huddleGo", class: "primary", onclick: () => { if (inp.value.trim() === hx.code) ok(); else msg.textContent = U.codeWrong; } }, U.codeGo);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") go.click(); });
    if (hx.isKey) return [h("p", {}, U.keyShows.replace("{code}", hx.code)), h("div", { class: "controls" }, h("button", { id: "huddleGo", class: "primary", onclick: ok }, U.codeGo))];
    if (!hx.gates) return [h("p", { class: "hint" }, U.codeNote), h("div", { class: "controls" }, h("button", { id: "huddleGo", class: "primary", onclick: ok }, U.codeGo))];
    return [h("label", {}, U.codeLabel + " ", inp), msg, h("div", { class: "controls" }, go, closable ? h("button", { id: "huddleClose", onclick: () => hx.close() }, U.closeWord) : null)];
  }
  function huddle(n, hx) {
    const g = G(); hx.dlg.classList.toggle("wide", n === 2); hx.dlg.classList.toggle("small", n === 1);
    if (n === 1) {
      const mid = S.stage === "prelab";   // called at minute 3 while the pre-lab is still open: the hold screen sits on top and the student goes back to it
      const ok = () => { if (!mid) return hx.finish(); g.huddle1 = true; ev("huddle", { n: 1 }); hx.close(); onChange(); };
      hx.box.replaceChildren(h("h2", {}, U.huddle1Title), h("p", {}, U.huddle1Text), h("h3", {}, lab.stepCard.title), h("ol", { id: "holdSteps" }, lab.stepCard.steps.map((t) => h("li", {}, t))), ...codeRow(hx, ok, mid));
      hx.open(); const f = hx.box.querySelector("input, button"); if (f) f.focus(); return;
    }
    const H = C.huddle2Tab;
    // Words the sheet holds until code 2 (1/m, per kg) stay off the screen until the code is in; the rest of the tab is up during the huddle.
    const held = (s) => /1\/m|per kg/.test(String(s));
    const draw = (after) => {
      const blank = (b) => { const [pre, post] = b.text.split(/_+/); return h("p", { class: "fcBlankLine" }, pre, h("input", { id: "fcBlank_" + b.id, type: "text", "aria-label": b.id, value: g.h2[b.id] || "", style: "width:9em", oninput: (e) => { g.h2[b.id] = e.target.value; } }), post, after ? h("b", { class: "fcAns" }, " (" + b.answer + ")") : null); };
      const worked = (w) => h("div", { class: "fcWorked", id: "fcWorked_" + w.id }, h("p", {}, h("b", {}, w.id + ". "), w.problem), after ? h("ol", {}, w.steps.map((s) => h("li", {}, s))) : null);
      const crux = (q) => h("li", { id: "fcCrux_" + q.id }, q.q, after ? h("div", { class: "fcAns" }, q.answer) : null);
      const body = [h("h2", {}, U.huddle2Title), h("p", { id: "fcTested" }, H.tested), h("h3", {}, U.blanksHead), ...H.blanks.filter((b) => after || !held(b.text)).map(blank),
        h("h3", {}, U.workedHead), ...H.worked.filter((w) => after || !held(w.problem)).map(worked), h("h3", {}, U.cruxHead), h("ol", {}, H.crux.map(crux))];
      if (after) body.push(h("div", { class: "controls" }, h("button", { id: "huddleClose", class: "primary", onclick: () => hx.close() }, U.closeWord)));
      else body.push(...codeRow(hx, () => { hx.finish(); draw(true); hx.open(); }, true));
      hx.box.replaceChildren(...body);
    };
    draw(false); hx.open();
  }

  // ---------- two tutorials: each caption has a yellow arrow on the real part ----------
  const rectIn = (el) => { const k = document.getElementById("stage").getBoundingClientRect().width / 1280, r = el.getBoundingClientRect(), s = sheet.getBoundingClientRect(); return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k }; };
  const onCanvas = (cv, px, py, W, H) => { const r = rectIn(cv); return [r.x + (px / W) * r.w, r.y + (py / H) * r.h]; };
  const onDot = (i) => { const rn = lastRun(), g = speedGeom(); return onCanvas(speedCv, tToX(rn.t[i]), g.T + g.ph * (1 - rn.v[i] / g.vmax), SPEED.W, SPEED.H); };
  const TUT = {
    1: [
      () => onCanvas(trackCv, 525, 66, TRACK.W, TRACK.H),
      () => onDot(20),
      () => onDot(30),
      () => onCanvas(speedCv, tToX(G().mk[0]), 4, SPEED.W, SPEED.H),
      () => onCanvas(speedCv, tToX(G().mk[1]), 4, SPEED.W, SPEED.H)
    ],
    2: [
      () => { const r = rectIn($in(tabBody, "#fcAcross")); return [r.x + r.w / 2, r.y]; },
      () => onCanvas(gcv, builderGeom().W / 2, builderGeom().H / 2, builderGeom().W, builderGeom().H),
      () => { const r = rectIn($in(tabBody, "#fcGuide")); return [r.x + r.w / 2, r.y]; },
      () => { const r = rectIn($in(tabBody, "#fcConnect")); return [r.x + r.w / 2, r.y]; }
    ]
  };
  function startTutorial(n) {
    const g = G(); if (n === 2 && g.tab !== "graph") { g.tab = "graph"; renderTab(); }
    if (n === 1 && !lastRun()) return;
    g.tutNow = n; tutIdx = 0; ev("tutorial", { n }); drawTut();
  }
  let tutIdx = 0;
  function drawTut() {
    const g = G(), n = g.tutNow; if (!n) { tutLayer.replaceChildren(); return; }
    const T = C.tutorials["tutorial" + n], cap = T.captions, last = tutIdx >= cap.length - 1;
    requestAnimationFrame(() => {
      if (G().tutNow !== n) return; const [x, y] = TUT[n][tutIdx](), k = document.getElementById("stage").getBoundingClientRect().width / 1280, sw = sheet.getBoundingClientRect().width / k, bx = Math.max(150, Math.min(sw - 150, x)) - x;
      const bubble = h("div", { class: "fcTut" + (y < 140 ? " below" : ""), id: "fcTut", style: `left:${Math.round(x)}px;top:${Math.round(y)}px` },
        h("div", { class: "gtext", style: `left:${Math.round(bx)}px` }, h("small", {}, `${T.name} · ${U.tutOf.replace("{i}", tutIdx + 1).replace("{n}", cap.length)}`), h("span", { id: "fcTutText" }, cap[tutIdx]),
          h("span", { class: "fcTutBtns" }, h("button", { id: "fcTutBack", type: "button", disabled: tutIdx === 0, onclick: () => { tutIdx--; drawTut(); } }, U.tutBack),
            last ? h("button", { id: "fcTutDone", type: "button", class: "primary", onclick: () => { G().tutNow = 0; tutLayer.replaceChildren(); onChange(); } }, U.tutDone) : h("button", { id: "fcTutNext", type: "button", class: "primary", onclick: () => { tutIdx++; drawTut(); } }, U.tutNext))),
        h("div", { class: "garrow" }, "▼"));
      tutLayer.replaceChildren(bubble);
    });
  }

  // ---------- yellow arrows for the first-time route (quests flagged tutorial) ----------
  function guide(id) {
    const g = G(); if (g.tutNow) return null;
    const open = !!document.querySelector("#dlgNotebook[open]"), chest = !!document.querySelector("#dlgChest[open]");
    const E1 = (e, x) => (e ? ["el", e, x] : null), q = (sel) => document.querySelector(sel), nb = () => E1(q("#btnNotebook"), U.aOpenNb);
    switch (id) {
      case "door": return ["tile", "door", U.aDoor];
      case "bars": return chest ? E1(q("#chestAll"), U.aTakeAll) : ["tile", "bar_shelf", U.aWalkE];
      case "weigh": return chest ? E1(q("#chestBody .slot:not(.has)") || q("#chestBody .slot"), U.aWeigh) : ["tile", "balance", U.aWalkE];
      case "track": return ["tile", "track", U.aWalkE];
      case "firstrun": return !open ? nb() : g.cfg.bars !== 2 ? E1(q("#fcBar2"), U.aBars2) : g.cfg.setting !== 2 ? E1(q("#fcSet2"), U.aSet2) : E1(q("#fcRun"), U.aRun);
      case "markers": return !open ? nb() : !g.last || g.anim ? E1(q("#fcRun"), U.aRun) : E1(q("#fcSpeed"), U.aMarkers);
      case "record": return !open ? nb() : massIn.value === "" ? E1(q("#fcMass"), U.aMass) : E1(q("#fcRecord"), U.aRecord);
      case "graphF": return R.rowCount(g.rows, "1") < 3 ? null : !open ? nb() : g.tab !== "graph" ? E1(q("#fcTab_graph"), U.aGraphTab) : g.gx !== "F" ? E1(q("#fcAcross"), U.aAcross) : E1(q("#fcGuide"), U.aGuideLine);
    }
    return null;
  }

  // ---------- the clock: hold screen at minute 3, huddle 2 at minute 28 ----------
  let acc = 0;
  function clockWatch(dt) {
    acc += dt; if (acc < 1) return; acc = 0;
    if (ctx.isDemo() || !window.MrD || !MrD.bell || (document.querySelector("#dlgHuddle[open]"))) return;
    const c = MrD.bell.clock(lab.course), g = G(); if (!c.session) return;
    if (c.minutesIn >= C.clock.huddle1AtMin && !g.huddle1 && !g.h1Forced && S.stage === "prelab" && S.student) { g.h1Forced = true; ctx.openHuddle(1); }
    else if (c.minutesIn >= C.clock.huddle2AtMin && !g.huddle2 && !g.h2Auto && S.stage === "lab") { g.h2Auto = true; ctx.openHuddle(2); }
  }

  // ---------- the app's calls ----------
  function step(dt) {
    const g = G();
    if (g.anim) { g.anim.t += dt; spin += dt * 30; dirty = true; if (g.anim.t >= RUN_ANIM_S) { g.anim = null; afterRun(); } }
    if (dirty) paintAll();
    clockWatch(dt);
  }
  // Before the pre-lab is done the step card and the task list are off the screen: the step card is shown to the class at huddle 1 (the hold screen has it).
  let wasEarly = null;
  function syncEarly() {
    const early = ["intro", "prelab"].includes(S.stage) && !ctx.isDemo(), card = document.getElementById("stepCard"), tp = document.getElementById("taskPanel");
    if (early === wasEarly) return; const first = wasEarly === null; wasEarly = early;
    if (card) card.hidden = early; if (tp && (early || !first)) tp.hidden = early;   // the task list comes up once after the pre-lab; the student's own J key rules after that
  }
  function refresh() { syncEarly(); syncCard(); syncLeft(false); }
  const visible = (q) => q.phase !== "after" || G().huddle2 || (q.id === "code2" && !!S.cerDone);
  const questState = () => ({});
  const recordComplete = () => R.tablesDone(D, G().rows);
  function text(k) { return U[k]; }

  // ---------- teacher key, printed report, record ----------
  const bandName = (b) => U.bandWord + " " + b;
  function key() {
    const g = G(), rows = [], tr = (th, ...tds) => h("tr", {}, h("th", {}, th), ...tds.map((t) => h("td", {}, t)));
    rows.push(tr(U.keyStandard, I.standard, ""));
    rows.push(tr(U.keyCodes, `${U.keyCode1}: ${MrD.codes.gateV3(lab.id, "h1")}`, `${U.keyCode2}: ${MrD.codes.gateV3(lab.id, "h2")}`));
    for (const it of I.items) {
      const opts = it.options ? h("ol", {}, it.options.map((o, i) => h("li", { class: i === it.answer ? "fcAns" : "" }, o))) : h("span", {}, `${it.answer} ± ${it.tol} ${it.unit}`);
      rows.push(tr(`${it.id} · ${bandName(it.band)}`, h("div", {}, h("p", {}, it.prompt), opts), h("div", {}, h("ol", {}, it.hints.map((x) => h("li", {}, x))), h("p", { class: "hint" }, it.misc))));
    }
    for (const gk of ["g1", "g2", "g3"]) rows.push(tr(`${gk} · ${bandName(+gk[1])}`, h("ul", {}, I.generators.samples[gk].map((s) => h("li", {}, `${s.prompt} → ${s.answer} ± ${s.tol} ${s.unit}`))), ""));
    const row = (r) => `${U.keyRow}: setting ${r.setting}, bars ${r.bars}, F ${f2(r.F)} N, m ${f2(r.m)} kg, a ${f2(r.a)}`;
    for (const part of ["1", "2"]) for (const r of Object.values(part === "1" ? g.rows.p1 : g.rows.p2)) rows.push(tr(`${U.partWord} ${part}`, row(r), ""));
    if (g.rows.test) rows.push(tr(U.testWord, row(g.rows.test), ""));
    rows.push(tr(U.keyPreds, `${U.keyPre}: ${S.prelab.prediction || "—"}`, `${U.keyMassPred}: ${g.pred.mass ? g.pred.mass.text : "—"}. ${U.keyTestPred}: ${g.pred.test ? f2(g.pred.test.value) : "—"}${g.rows.test ? ` (${U.keyRun} ${f2(g.rows.test.a)})` : ""}`));
    const cc = R.cited(S.cer.evidence || "", g.rows);
    rows.push(tr(U.keyCer, S.cerDone ? h("div", {}, h("p", {}, h("b", {}, U.claimHead + ": "), S.cer.claim), h("p", {}, h("b", {}, U.evidenceHead + ": "), S.cer.evidence), h("p", {}, h("b", {}, U.reasoningHead + ": "), S.cer.reasoning)) : "—", `${U.keyCount}: ${cc.part1} / 2 ${U.partWord} 1, ${cc.part2} / 2 ${U.partWord} 2 — ${cc.ok ? U.keyOk : U.keyShort}`));
    return rows;
  }
  function print() {
    const g = G(), tbl = (cols, rs) => h("table", {}, h("thead", {}, h("tr", {}, cols.map((c) => h("th", {}, c)))), h("tbody", {}, rs.map((r) => h("tr", {}, r.map((c) => h("td", {}, c))))));
    const p1 = R.part1Settings(D).map((s) => { const r = g.rows.p1[s]; return [s, r ? f2(r.F) : "", r ? f2(r.m) : "", r ? f2(r.a) : ""]; }), p2 = R.part2Bars(D).map((b) => { const r = g.rows.p2[b]; return [b, r ? f2(r.m) : "", r ? f2(r.F) : "", r ? f2(r.a) : ""]; });
    return [h("h1", {}, lab.title), h("p", {}, `${S.student || "Student"} · ${new Date(log.started).toLocaleString()}`),
      h("h2", {}, U.part1Head), tbl(C.record.part1Columns, p1), h("h2", {}, U.part2Head), tbl(C.record.part2Columns, p2),
      g.rows.test ? h("p", {}, `${U.testHead}: ${row2(g.rows.test)}`) : null,
      S.cerDone ? h("div", {}, h("h2", {}, U.cerHead), h("p", {}, h("b", {}, U.claimHead + ": "), S.cer.claim), h("p", {}, h("b", {}, U.evidenceHead + ": "), S.cer.evidence), h("p", {}, h("b", {}, U.reasoningHead + ": "), S.cer.reasoning)) : null].filter(Boolean);
  }
  const row2 = (r) => `bars ${r.bars}, mass ${f2(r.m)} kg, fan force ${f2(r.F)} N, acceleration ${f2(r.a)}`;
  function record(base) {
    const g = G(), qs = C.prelab.questions, correct = qs.filter((q) => S.prelab.answers[q.id] === q.correct).length;
    return { ...base, prelab: { correct, total: qs.length, prediction: S.prelab.prediction, answers: S.prelab.answers },
      fancart: { rows: g.rows, predictions: { force: S.prelab.prediction || null, mass: g.pred.mass, test: g.pred.test }, weighed: g.weighed, plots: g.plot, checks: { band: g.checks.band, res: g.checks.res }, huddle1: g.huddle1, huddle2: g.huddle2, huddle2Blanks: g.h2, cited: R.cited(S.cer.evidence || "", g.rows), tablesDone: recordComplete() },
      cer: S.cerDone ? S.cer : null, submitted: g.handed };
  }

  // ---------- the scripted demo: nine captions on the real room and notebook; nothing is kept ----------
  async function demo({ say: cap, walk, wait, live: alive, api }) {
    const trackTile = { id: "track" };
    await cap(1, U.dm1, 2800);
    await cap(2, U.dm2, 1400); await walk("ULLUULLUUL"); api.interact(); await wait(900);
    await cap(3, U.dm3, 1200); for (const k of ["bar1", "bar2", "bar3", "bar4"]) { api.take(k); await wait(250); } await wait(1400); api.closePanel();
    await cap(4, U.dm4, 1400); await walk("DRU"); api.interact(); await wait(900); weigh("cart"); await wait(900); weigh("bar"); await wait(1500); api.closePanel();
    await cap(5, U.dm5, 1400); await walk("RRU"); api.interact(); await wait(1400);
    await cap(6, U.dm6, 1000); const g = G(); setBars(2); await wait(600); setSetting(2); await wait(600); doRun(); await wait(3400);
    await cap(7, U.dm7, 1200); moveMarker(0, 0.3); moveMarker(1, 1.8); commitRead(); await wait(2800);
    await cap(8, U.dm8, 1200); massIn.value = f2(E.massOf(D, 2)); syncLeft(true); await wait(900); doRecord(); await wait(1800);
    for (const [s, b] of [[1, 2], [3, 2], [4, 2]]) { g.last = { setting: s, bars: b, seed: 700 + s, F: E.forceOf(D, s) }; const rn = lastRun(); const r = E.read(D, rn, 0.2, 1.8); R.addRow(D, g.rows, "1", g.last, E.massOf(D, b), r.a); }
    await cap(9, U.dm9, 1000); showTab("graph"); await wait(1000); drawLine("guide"); await wait(3600);
    ctx.closeNotebook();
  }

  const api = { answered: () => [], evidence: () => [], draw: () => {}, step, refresh, controls: h("div", { id: "fcControls" }), sheet, view: renderTab, showTab, hintPicture: () => null, renderPrelab, questState, recordComplete,
    bottles: bars, syncSources, holding: () => !!G().anim, unlocked: () => true, station, panel, canOpen, guide, huddle, key, print, record, demo, visible, text,
    // for the browser tests and the demo
    setBars, setSetting, doRun, doRecord, moveMarker, commitRead, weigh, startTutorial, tutorialText: () => (document.getElementById("fcTutText") || {}).textContent || "", lastRun, reading, massIn, handIn, afterRun, get tab() { return G().tab; } };
  drawTabs(); renderTab();
  return api;
}
