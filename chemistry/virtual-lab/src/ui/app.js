// Bench + lab sheet for Lab 1. Chemistry comes from the engine and content files, never from this file.
import { buildWorld, newContainer, add, advance, heat, conductivity, describe, dissolvedGrams, massAccounting } from "../engine/sim.js";
import { fingerprint } from "../engine/lab1.js";
import { Log, downloadJSON } from "../log.js";
import { createRenderer, SLOTS } from "./render.js";
import { createRoomRenderer } from "./roomview.js";
import { $, h, mulberry32 } from "./dom.js";
import { createMicroView } from "./micro.js";
import { microModel, legend } from "../engine/micro.js";
import { renderIntro, renderPrelab, renderCER, renderCERHeat, theoryNodes } from "./stages.js";
import { createHeatBook, drawGraph, goodRows } from "./heatbook.js";
import { profile, stateAt, reading, assign } from "../engine/heating.js";
import { runDemo } from "./demo.js";
import { questDone, questProgress } from "../engine/quests.js";
import { drawIcon } from "./icons.js";
import { fitStage } from "./fit.js";
import { createActive } from "../engine/active.js";
import { checkCode } from "../engine/integrity.js";
import { drawBadge } from "./badge.js";
import { buildReport } from "../report.js";
import { resolveMode } from "../mode.js";
import { indexHazards, losePoints } from "../engine/hazards.js";
import { parseRoom, step, facingTile, hasPPE, tileAt } from "../engine/room.js";

fitStage($("#stage"));
const CAP = 10;
const LABS = { "unknown-solids": "01-unknown-solids.json", heating: "02-heating-curves.json" };
const PRACTICE = { id: "practice", mass: 10, power: 100, T0: 20, mp: 50, bp: 150, Tend: 90, cs: 2, cl: 2.5, cg: 2, Lf: 200, Lv: 1000 };
const SHORT = { NaCl: "Salt", sucrose: "Sugar", NaHCO3: "B.Soda", CaCO3: "Chalk", starch: "Starch", citric: "Citric", water: "Water", vinegar: "Vinegar", iodine: "Iodine" };

async function boot() {
  try {
    const params = new URLSearchParams(location.search), labFile = LABS[params.get("lab")] || LABS["unknown-solids"];
    const urls = ["content/species.json", "content/reactions.json", "content/labs/" + labFile, "content/rooms/main-lab.json", "content/hazards.json", "content/config.json"];
    const [species, reactions, lab, roomDef, hazardData, config] = await Promise.all(urls.map((u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); })));
    const modeInfo = await resolveMode(params, config), key = "vlab:" + lab.id;
    let saved = null; try { saved = JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { saved = null; }
    if (saved && (saved.lab !== lab.id || saved.version !== 1)) saved = null;
    const go = (resume) => start(species, reactions, lab, roomDef, hazardData, modeInfo, resume);
    if (!saved) return go(null);
    if (params.get("resume") === "1") return go(saved);
    $("#boot").replaceChildren(h("p", {}, `You have a saved lab${saved.student ? " for " + saved.student : ""} from ${new Date(saved.savedAt).toLocaleString()}.`),
      h("div", { class: "controls" }, h("button", { class: "primary", onclick: () => go(saved) }, "Continue where I left off"),
        h("button", { onclick: () => { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } go(null); } }, "Start over")));
  } catch (e) {
    console.error(e);
    $("#boot").hidden = false;
    $("#boot").replaceChildren(h("p", {}, "This lab has to be opened from the web (GitHub Pages) or a local server. Double-clicking the file does not work because browsers block the files it loads."), h("p", { class: "hint" }, String(e.message || e)));
  }
}

function start(speciesData, reactionData, lab, roomDef, hazardData, modeInfo, resume) {
  $("#boot").hidden = true;
  const world = buildWorld(speciesData, reactionData);
  const EL = speciesData.electrolytes;
  const HEAT = lab.kind === "heating";
  for (const [id, txt] of Object.entries(lab.roomText || {})) for (const e of Object.values(roomDef.legend)) if (e.id === id) e.text = txt;
  const solids = speciesData.species.filter((s) => s.phase === "s").map((s) => s.id);
  const params = new URLSearchParams(location.search);
  const seed = resume ? resume.seed : params.get("seed") ? parseInt(params.get("seed"), 10) : Math.floor(Math.random() * 1e9);
  const rng = mulberry32(seed);
  const order = solids.slice().sort(() => rng() - 0.5);
  const TUT = lab.tutorial || null, CH = lab.challenge || [];
  if (TUT && !HEAT) { order.splice(order.indexOf(TUT.id), 1); order.unshift(TUT.id); }
  const hsubs = HEAT ? assign(lab.substances.map((x) => x.id), seed, lab.tubes.length) : [];
  if (HEAT && TUT) { const at = hsubs.indexOf(TUT.id), ti = lab.tubes.indexOf(TUT.unknown); if (at >= 0 && ti >= 0) [hsubs[at], hsubs[ti]] = [hsubs[ti], hsubs[at]]; }
  const unknowns = HEAT ? lab.tubes.map((L, i) => ({ label: L, id: hsubs[i] })) : order.slice(0, 4).map((id, i) => ({ label: "ABCD"[i], id }));
  const truth = {}; if (!HEAT) for (const id of solids) truth[id] = fingerprint(world, EL, id, lab.standard);
  const TEACHER = window.__TEACHER__ === true;
  const ACT = createActive();
  const log = new Log();
  { const add0 = log.add.bind(log); log.add = (t, d) => { ACT.poke(performance.now() / 1000); return add0(t, d); }; }
  for (const ev of ["keydown", "input", "change"]) $("#stage").addEventListener(ev, () => ACT.poke(performance.now() / 1000), true);

  const CONT = [
    { key: "b1", label: "B1", name: "Beaker 1", kind: "beaker", cap: 250, empty: 105.0, loc: "bench", slot: 0 },
    { key: "b2", label: "B2", name: "Beaker 2", kind: "beaker", cap: 250, empty: 105.0, loc: "bench", slot: 1 },
    { key: "wg", label: "WG", name: "Watch glass", kind: "watch", cap: 0, empty: 20.0, loc: "bench", slot: 2 }
  ].filter((c) => !(HEAT && c.key === "wg"));
  CONT.forEach((c) => { c.c = newContainer(c.name, c.cap); c.tare = 0; c.fizz = 0; });
  const sources = HEAT ? unknowns.map((u, i) => ({ key: "s" + u.label, id: u.label, label: `Sample ${u.label}`, short: u.label, group: "Unknown samples", phase: "s", shelf: 0, idx: i, heatSub: u.id, color: "#e8e4d6" })) : [
    ...unknowns.map((u, i) => ({ key: "u" + u.label, id: u.id, label: `Unknown ${u.label}`, short: u.label, group: "Unknown samples", phase: "s", shelf: 0, idx: i })),
    ...["water", "vinegar", "iodine"].map((id, i) => ({ key: id, id, label: speciesData.species.find((s) => s.id === id).name, short: SHORT[id], group: "Liquids", phase: "l", shelf: 0, idx: 4 + i })),
    ...solids.map((id, i) => ({ key: id, id, label: speciesData.species.find((s) => s.id === id).name + " (known)", short: SHORT[id], group: "Known samples", phase: "s", shelf: 1, idx: i }))
  ];
  if (!HEAT) sources.forEach((s) => { s.color = speciesData.species.find((x) => x.id === s.id).color; });

  const S = { sel: "b1", srcKey: sources[0].key, ppe: { goggles: false, apron: false, tongs: false }, inv: [], view: "room", panel: null, mode: modeInfo.mode, incident: null, safety: { points: 100, incidents: [] }, plateOn: false, plateC: 150, bulb: null, bulbUntil: 0, feed: [], notebook: {}, student: "", stage: "intro", prelab: { answers: {}, prediction: "" }, cer: {}, submitted: false, cerDone: false, touched: {}, demo: false, nbSeen: 0, heat: Object.fromEntries(unknowns.map((u) => [u.label, { rows: [], items: [], axes: { title: "", x: "", y: "" } }])), speed: 1, paused: false, stepTo: null, interval: 15 };
  // ---------- heating model (heating lab only): constant-power plate, temperature from the sample's enthalpy ----------
  const subOfSrc = (src) => (src.heatSub === "practice" ? PRACTICE : lab.substances.find((x) => x.id === src.heatSub));
  const hsub = (c) => (c.heat.sub === "practice" ? PRACTICE : lab.substances.find((x) => x.id === c.heat.sub));
  const hprof = (c) => profile(hsub(c), c.heat.mass);
  const hdur = (c) => hprof(c).total / hsub(c).power;
  const hstate = (c) => stateAt(hprof(c), c.heat.E);
  const hread = (c) => reading(hstate(c).T, seed, Math.floor(c.heat.E / hsub(c).power));
  const axesFor = (k) => { const u = unknowns.find((x) => x.label === k), b = lab.substances.find((x) => x.id === u.id), dur = profile(b, lab.standardMass).total / b.power, ymin = Math.floor((b.T0 - 10) / 20) * 20, ymax = Math.ceil((b.Tend + 10) / 20) * 20; return { xmax: Math.ceil(dur / 60) * 60, ymin, ymax, xs: 30, ys: ymax - ymin <= 120 ? 10 : 20 }; };
  const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  const byKey = (k) => CONT.find((c) => c.key === k);

  // ---------- feedback and rules ----------
  function say(text, kind = "info") { S.feed.push({ text, kind }); S.feed = S.feed.slice(-80); renderFeed(); }
  const H = indexHazards(hazardData);
  function hazard(id, text) { log.add("hazard", { id, mode: S.mode, outcome: "blocked" }); say(text, "stop"); }
  function blocked(id, text) { log.add("procedure", { id, outcome: "blocked" }); say(text, "warn"); }
  // Guided blocks the action. Consequences makes it happen and opens an incident. Sandbox lets it happen, no penalty.
  function fire(id, ctx = {}) {
    const hz = H[id];
    if (S.mode === "guided") { log.add("hazard", { id, mode: "guided", outcome: "blocked" }); say(hz.guided, "stop"); return; }
    if (S.mode === "sandbox") { log.add("hazard", { id, mode: "sandbox", outcome: "consequence" }); say(`${hz.title}. ${hz.happened}`, "stop"); applyEffect(hz, ctx); return; }
    startIncident(hz, ctx);
  }
  function ppeOk(risky = false) {
    if (S.incident) { say("Finish the incident first.", "warn"); return false; }
    if (hasPPE(S.ppe)) return true;
    if (S.mode === "guided") { hazard("no_ppe", "Stop. Put on goggles and an apron before you touch anything in the lab. They are in the locker."); return false; }
    if (!risky || S.mode === "sandbox") return true;
    fire(S.ppe.goggles ? "no_apron" : "no_goggles"); return false;
  }
  function applyEffect(hz, ctx) {
    if (hz.effect === "drop_container" && ctx.container) {
      const c = ctx.container; c.c = newContainer(c.name, c.cap); c.tare = 0; c.fizz = 0; c.loc = "bench"; S.touched[c.key] = [];
      c.slot = [0, 1, 2].find((n) => !CONT.some((o) => o !== c && o.loc === "bench" && o.slot === n)) ?? 0;
      say(`${c.name} shattered. A fresh, empty one is on the bench.`);
    }
  }
  const NEEDS_NAME = { eyewash: "eyewash station", sink: "sink" };
  function startIncident(hz, ctx) {
    S.incident = { hz, ctx, phase: hz.needs ? "treat" : "report", deadline: performance.now() + 30000, treated: false, escalated: false, correct: null, cooldownUntil: 0 };
    S.safety.points = losePoints(S.safety.points, hz.points);
    log.add("hazard", { id: hz.id, mode: S.mode, outcome: "incident", points: hz.points });
    say(`${hz.title}. ${hz.happened}`, "stop");
    if (hz.needs) setView("room");
    renderIncident(); renderSafety();
  }
  function treat() {
    const inc = S.incident; inc.treated = true; inc.phase = "report";
    say(inc.hz.treat, "obs"); log.add("treated", { id: inc.hz.id, at: NEEDS_NAME[inc.hz.needs], seconds_left: Math.round((inc.deadline - performance.now()) / 1000) });
    renderIncident();
  }
  function tickIncident(now) {
    const inc = S.incident; if (!inc) return;
    if (inc.phase === "treat") {
      const left = Math.max(0, Math.ceil((inc.deadline - now) / 1000));
      if (now > inc.deadline) { inc.escalated = true; inc.phase = "report"; S.safety.points = losePoints(S.safety.points, inc.hz.points); say("You took too long. The injury got worse.", "stop"); log.add("escalated", { id: inc.hz.id }); renderIncident(); renderSafety(); }
      else { const e = $("#incLeft"); if (e) e.textContent = left; }
    } else if (inc.phase === "cooldown") {
      const left = Math.max(0, Math.ceil((inc.cooldownUntil - now) / 1000)), e = $("#incLeft"), b = $("#incResume");
      if (e) e.textContent = left; if (b) b.disabled = left > 0;
    }
  }
  function renderIncident() {
    const inc = S.incident, box = $("#incident");
    if (!inc) { box.hidden = true; syncSide(); return; }
    box.hidden = false; syncSide(); const hz = inc.hz, kids = [h("h2", {}, "Incident: " + hz.title), h("p", {}, hz.happened)];
    if (inc.phase === "treat") kids.push(h("p", { class: "f-stop" }, `Get to the ${NEEDS_NAME[hz.needs]} and press E on it. `, h("b", {}, h("span", { id: "incLeft" }, "30"), " s left.")), h("p", { class: "hint" }, "Walk there in the room. If you don't know where it is, look around."));
    if (inc.phase === "report") {
      kids.push(h("p", {}, h("b", {}, "What went wrong: "), hz.why), h("p", {}, hz.quiz.q));
      kids.push(...hz.quiz.options.map(([text, ok], i) => h("div", {}, h("button", { onclick: () => answer(ok) }, text))));
    }
    if (inc.phase === "cooldown") kids.push(h("p", {}, inc.correct ? "Correct." : "Not quite. Re-read what went wrong above."), h("p", {}, "Resetting the bench… ", h("b", {}, h("span", { id: "incLeft" }, "8"), " s")), h("button", { id: "incResume", class: "primary", disabled: true, onclick: closeIncident }, "Back to work"));
    box.replaceChildren(...kids);
  }
  function answer(ok) {
    const inc = S.incident; inc.correct = ok; inc.phase = "cooldown"; inc.cooldownUntil = performance.now() + 8000; renderIncident();
  }
  function closeIncident() {
    const inc = S.incident;
    log.add("incident", { id: inc.hz.id, treated: inc.treated, escalated: inc.escalated, quiz_correct: inc.correct, points_lost: inc.hz.points * (inc.escalated ? 2 : 1) });
    S.safety.incidents.push({ id: inc.hz.id, treated: inc.treated, escalated: inc.escalated, quiz_correct: inc.correct });
    applyEffect(inc.hz, inc.ctx); S.incident = null; renderIncident(); renderSafety();
  }
  function renderSafety() {
    $("#modeLine").textContent = S.mode === "guided" ? "Guided mode: unsafe actions are blocked and explained." : S.mode === "sandbox" ? "Sandbox mode: everything is allowed. Nothing is graded." : `Consequences mode: unsafe actions have real results. Safety points: ${S.safety.points} / 100.`;
  }
  const cur = () => byKey(S.sel);
  function rawMass(c) { return c.empty + massAccounting(world, c.c).inside + (c.heat ? c.heat.mass : 0); }

  // ---------- actions ----------
  function moveTo(loc) {
    if (!ppeOk()) return;
    const c = cur();
    if (c.loc === loc) return;
    if (c.c.T > 50 && !S.ppe.tongs) return fire("hot_container", { container: c });
    if ((loc === "balance" || loc === "hotplate") && CONT.some((o) => o !== c && o.loc === loc)) return blocked("station_busy", `The ${loc === "balance" ? "balance" : "hot plate"} is in use. Move the other container off first.`);
    if (loc === "bench") { const used = CONT.filter((o) => o !== c && o.loc === "bench").map((o) => o.slot); c.slot = [0, 1, 2].find((s) => !used.includes(s)); }
    log.add("move", { container: c.key, from: c.loc, to: loc });
    c.loc = loc;
    say(`${c.name} is on the ${loc === "hotplate" ? "hot plate" : loc}.`);
  }
  function addSample(c, src, amt) {
    if (c.loc !== "balance") return blocked("solid_off_balance", "Weigh solids on the balance. Move the beaker to the balance first.");
    if (amt > 50) return blocked("too_much_solid", "That is more than a tube holds. Use 50 g or less.");
    if (c.heat && c.heat.E > 0) return blocked("add_to_hot", "This sample has already been heated. Empty and rinse the beaker, then start again.");
    if (c.heat && c.heat.sample !== src.id) return blocked("mixed_samples", "That beaker already holds a different sample. Mixing samples ruins both. Empty and rinse it first.");
    c.heat = c.heat || { sample: src.id, sub: src.heatSub, mass: 0, E: 0, ended: false }; c.heat.mass += amt;
    log.add("add", { container: c.key, sample: src.id, shown_as: src.label, amount: amt, unit: "g" });
    say(`Added ${amt} g of ${src.label} to ${c.name}. The balance reads ${(rawMass(c) - c.tare).toFixed(1)} g.`);
  }
  function addSubstance() {
    if (!ppeOk(true)) return;
    const c = cur(), src = sources.find((s) => s.key === S.srcKey && S.inv.includes(s.key)), amt = parseFloat($("#amt").value);
    if (!src) return blocked("not_carrying", "You are not carrying that jar. Go back to the room and take it from its shelf.");
    if (!(amt > 0)) return say("Enter an amount first.", "warn");
    if (HEAT) return addSample(c, src, amt);
    if (src.phase === "s") {
      if (c.loc !== "balance") return blocked("solid_off_balance", "Weigh solids on the balance. Move the container to the balance first.");
      if (amt > 100) return blocked("too_much_solid", "That is more than the spatula can carry. Use 100 g or less.");
    } else {
      if (c.kind === "watch") return blocked("liquid_in_watch_glass", "A watch glass can't hold liquid. Use a beaker.");
      if (c.loc !== "bench") return blocked("liquid_off_bench", "Add liquids with the container on the bench, not on a station.");
      if (amt > 250) return blocked("too_much_liquid", "That is more than the graduated cylinder holds. Use 250 mL or less.");
    }
    try { add(world, c.c, src.id, amt); }
    catch (e) { if (e.code === "OVERFLOW") { fire("overflow", { container: c }); return; } throw e; }
    (S.touched[c.key] ||= []).push(src.key);
    log.add("add", { container: c.key, substance: src.id, shown_as: src.label, amount: amt, unit: src.phase === "s" ? "g" : "mL" });
    say(`Added ${amt} ${src.phase === "s" ? "g" : "mL"} of ${src.label} to ${c.name}.`);
  }
  function stir() {
    if (!ppeOk(true)) return;
    const c = cur();
    if (!(c.c.solution.mL > 0)) return say("There is no liquid to stir.", "warn");
    log.add("stir", { container: c.key });
    const total = Object.values(c.c.solids).reduce((a, b) => a + b, 0), d = describe(world, c.c);
    if (!(total > 0)) return say("You stir. The liquid swirls and looks the same.");
    const f = d.undissolvedG / total;
    say(f < 0.02 ? "You stir. Everything dissolves and the liquid is clear." : f > 0.9 ? "You stir. Almost none of the solid dissolves; it sits in a pile at the bottom." : "You stir. Some of the solid dissolves, but a pile is still left at the bottom.");
  }
  function tare() {
    if (!ppeOk()) return;
    const c = cur();
    if (c.loc !== "balance") return say("Put the container on the balance first.", "warn");
    c.tare = rawMass(c); log.add("tare", { container: c.key }); say("The balance reads 0.0 g.");
  }
  function conduct() {
    if (!ppeOk()) return;
    const c = cur();
    if (c.loc !== "bench") return blocked("tester_off_bench", "Test conductivity with the container on the bench.");
    if (!(c.c.solution.mL > 0)) return say("There is no liquid to test.", "warn");
    const r = conductivity(world, c.c, EL);
    S.bulb = r.bulb; S.bulbUntil = performance.now() + 9000;
    log.add("conductivity", { container: c.key, bulb: r.bulb, kappa_mS_per_cm: Math.round(r.kappa * 100) / 100 });
    say(r.bulb === "bright" ? "The bulb glows brightly." : r.bulb === "dim" ? "The bulb glows dimly." : "The bulb stays off.");
  }
  function empty() {
    if (!ppeOk(true)) return;
    const c = cur();
    if (c.c.T > 50 && !S.ppe.tongs) return fire("hot_container", { container: c });
    c.c = newContainer(c.name, c.cap); c.tare = 0; c.fizz = 0; c.heat = null; S.touched[c.key] = [];
    log.add("empty", { container: c.key }); say(`${c.name} is emptied and rinsed.`);
  }
  function skip(seconds) {
    if (!ppeOk()) return;
    for (let i = 0; i < seconds; i++) stepAll(1);
    log.add("wait", { seconds }); say(`${seconds} seconds pass.`);
  }
  function setPlate(on, c) {
    if (!ppeOk(on === true || (on === undefined && S.plateOn))) return;
    if (on !== undefined) S.plateOn = on;
    if (c !== undefined) S.plateC = c;
    log.add("hotplate", { on: S.plateOn, setC: S.plateC });
    renderControls();
  }
  function togglePPE(k) {
    S.ppe[k] = !S.ppe[k]; log.add("ppe", { item: k, on: S.ppe[k] });
    renderPPE();
  }

  // ---------- time ----------
  function heatStep(c, dt) {
    const onPlate = c.loc === "hotplate" && S.plateOn;
    if (!c.heat) return;
    if (onPlate && !c.heat.ended) {
      const sub = hsub(c), total = hprof(c).total;
      c.heat.E = Math.min(total, c.heat.E + sub.power * dt);
      if (c.heat.E >= total) { c.heat.ended = true; if (!S.demo) log.add("heat_end", { container: c.key, sample: c.heat.sample }); say(`${c.name}: the run is finished. The heater has reached the end of its range.`, "obs"); if (S.stepTo != null) { S.stepTo = null; S.paused = true; } }
    }
    c.c.T = hstate(c).T;
  }
  function stepAll(dt) {
    for (const c of CONT) {
      if (HEAT) { heatStep(c, dt); continue; }
      const before = Object.values(c.c.gasLostMol).reduce((a, b) => a + b, 0);
      for (const ev of advance(world, c.c, dt)) {
        say(`${c.name}: ${ev.observations.join("; ")}.`, "obs");
        log.add("observe", { container: c.key, reaction: ev.id });
      }
      const onPlate = c.loc === "hotplate" && S.plateOn;
      for (const ev of heat(world, c.c, onPlate ? S.plateC : 22, dt)) { say(`${c.name}: ${ev.text}`, "obs"); log.add("observe", { container: c.key, heat: ev.id, aboveC: ev.aboveC }); }
      const rate = (Object.values(c.c.gasLostMol).reduce((a, b) => a + b, 0) - before) / dt;
      c.fizz = Math.max(Math.min(1, rate / 0.004), c.fizz * Math.pow(0.5, dt));
    }
  }

  // ---------- view model ----------
  function liquidColor(c) {
    if (c.seen.starch_iodine) return "#1a1a4a";
    if ((c.solution.comps.I2 || 0) > 0) return "rgba(181,101,29,.85)";
    if ((c.solution.comps.CH3COOH || 0) > 0.001) return "rgba(238,228,184,.85)";
    return "rgba(120,185,235,.78)";
  }
  function pileOf(c) {
    let best = null, bestG = 0;
    for (const id in c.solids) {
      const und = c.solids[id] - dissolvedGrams(world, c, id);
      if (und > bestG && und > 0.02) { best = id; bestG = und; }
    }
    if (!best) return null;
    const sp = world.species.get(best);
    let color = sp.color;
    for (const ev of sp.heatEvents || []) if (c.seen[`${best}@${ev.aboveC}`] && ev.color) color = ev.color;
    return { h: 1 + Math.min(8, Math.round(Math.sqrt(bestG) * 1.6)), color };
  }
  function view() {
    const onBalance = CONT.find((c) => c.loc === "balance");
    return {
      sources: S.inv.map((k, i) => ({ ...sources.find((s) => s.key === k), shelf: 0, idx: i })), selectedSource: S.srcKey, plateOn: S.plateOn, plateC: S.plateC, plateLabel: HEAT ? "HEATING" : undefined,
      bulb: performance.now() < S.bulbUntil ? S.bulb : null,
      balanceText: onBalance ? `${(rawMass(onBalance) - onBalance.tare).toFixed(1)} g` : "0.0 g",
      containers: CONT.map((c) => {
        const pos = c.loc === "balance" ? SLOTS.balance : c.loc === "hotplate" ? SLOTS.hotplate : SLOTS.bench[c.slot];
        if (c.heat) { const st = hstate(c); return { key: c.key, label: c.label, kind: c.kind, cap: c.cap, x: pos.x, y: pos.y, liquidMl: 60 * (st.fm - st.fv), liquidColor: "rgba(120,185,235,.78)", pile: st.fm < 1 ? { h: 1 + Math.round(8 * (1 - st.fm)), color: "#ece8da" } : null, fizz: st.phase === "boiling" ? 0.6 : 0, T: st.T, steam: st.phase === "boiling" || st.phase === "gas", selected: c.key === S.sel }; }
        return { key: c.key, label: c.label, kind: c.kind, cap: c.cap, x: pos.x, y: pos.y, liquidMl: c.c.solution.mL, liquidColor: liquidColor(c.c), pile: pileOf(c.c), fizz: c.fizz, T: c.c.T, steam: c.c.T > 95 && c.c.solution.mL > 0, selected: c.key === S.sel };
      })
    };
  }

  // ---------- DOM ----------
  const canvas = $("#bench"), renderer = createRenderer(canvas);
  canvas.addEventListener("click", (ev) => {
    const r = canvas.getBoundingClientRect();
    const hit = renderer.hit((ev.clientX - r.left) * (320 / r.width), (ev.clientY - r.top) * (180 / r.height));
    if (!hit) return;
    if (hit.type === "container") { if (S.sel === hit.key) openMicro(hit.key); else { S.sel = hit.key; renderControls(); } } else if (hit.type === "source") { S.srcKey = hit.key; syncUnit(); }
  });

  const ppeBox = $("#ppe");
  function renderPPE() {
    ppeBox.replaceChildren(...[["goggles", "Goggles"], ["apron", "Apron"], ["tongs", "Tongs"]].map(([k, name]) =>
      h("span", { class: "chip" + (S.ppe[k] ? " on" : "") }, (S.ppe[k] ? "✓ " : "") + name)));
  }

  const srcSel = h("select", { id: "src", "aria-label": "Substance", onchange: (e) => { S.srcKey = e.target.value; syncUnit(); } });
  function syncUnit() {
    if (!S.inv.includes(S.srcKey)) S.srcKey = S.inv[0] || null;
    srcSel.replaceChildren(...(S.inv.length ? S.inv.map((k) => { const s = sources.find((x) => x.key === k); return h("option", { value: k }, s.label); }) : [h("option", { value: "" }, "(nothing carried)")]));
    const s = sources.find((x) => x.key === S.srcKey);
    $("#unit").textContent = s && s.phase === "l" ? "mL" : "g"; if (s) srcSel.value = S.srcKey;
  }

  const ctl = $("#controls");
  const movers = h("div", { class: "controls" },
    h("label", {}, h("select", { id: "cont", onchange: (e) => { S.sel = e.target.value; renderControls(); } }, CONT.map((c) => h("option", { value: c.key }, c.name)))),
    h("span", { class: "hint" }, "→"), h("button", { id: "mvBench", onclick: () => moveTo("bench") }, "Bench"), h("button", { id: "mvBalance", onclick: () => moveTo("balance") }, "Balance"), h("button", { id: "mvHot", onclick: () => moveTo("hotplate") }, "Hot plate"));
  const adder = h("div", { class: "controls" },
    h("label", {}, srcSel),
    h("label", {}, h("span", { style: "display:flex;gap:4px;align-items:center" }, h("input", { id: "amt", type: "number", min: "0.1", step: "0.1", value: HEAT ? "10.0" : "1.0", style: "width:90px" }), h("span", { id: "unit" }, "g"))),
    h("button", { id: "btnAdd", class: "primary", onclick: addSubstance }, "Add"));
  const timeCtl = () => {
    const seg = h("span", { class: "seg", id: "speedSeg" }, [1, 5, 20].map((n) => h("button", { "data-s": n, onclick: () => { S.speed = n; log.add("speed", { speed: n }); renderControls(); } }, "×" + n)));
    const iv = h("select", { id: "ivSel", "aria-label": "Step size", onchange: (e) => { S.interval = +e.target.value; } }, [10, 15].map((n) => h("option", { value: n }, n + " s")));
    return [h("div", { class: "controls", style: "margin:6px 0 12px" }, h("button", { id: "plateBtn", class: "primary", onclick: () => setPlate(!S.plateOn) }, "Turn plate on"), h("button", { id: "pauseBtn", onclick: () => togglePause() }, "⏸ Pause"), seg, h("label", {}, iv), h("button", { id: "advBtn", onclick: advance1 }, "Advance one step")),
      h("div", { class: "read", style: "margin:0" }, h("div", {}, h("b", { id: "rTime" }, "0:00"), h("span", {}, "Time heated (min:s)")), h("div", {}, h("b", { id: "rTemp" }, "--"), h("span", {}, "Thermometer (°C)")))];
  };
  const [timeRow, timeRead] = HEAT ? timeCtl() : [];
  if (HEAT) ctl.append(timeRead, timeRow);
  ctl.append(movers, h("p", { id: "where", class: "note", style: "margin:10px 0" }), adder,
    ...(HEAT ? [h("div", { class: "controls", style: "margin-top:10px" }, h("button", { id: "btnTare", onclick: tare }, "Tare"), h("button", { onclick: empty }, "Empty & rinse"))] : [
      h("div", { class: "controls", style: "margin-top:10px" },
        h("button", { id: "btnTare", onclick: tare }, "Tare"), h("button", { onclick: stir }, "Stir"), h("button", { onclick: conduct }, "Test conductivity"),
        h("button", { onclick: () => skip(60) }, "Skip ahead 60 s"), h("button", { onclick: empty }, "Empty & rinse")),
      h("div", { class: "controls", style: "margin-top:10px" },
        h("label", {}, "Hot plate setting", h("span", { style: "display:flex;gap:8px;align-items:center" }, h("input", { id: "plate", type: "range", min: "50", max: "250", step: "10", value: "150", oninput: (e) => setPlate(undefined, +e.target.value) }), h("b", { id: "plateTxt" }, "150 °C"))),
        h("button", { id: "plateBtn", onclick: () => setPlate(!S.plateOn) }, "Turn on"))]));
  function togglePause() { S.paused = !S.paused; S.stepTo = null; log.add(S.paused ? "pause" : "play", { sel: S.sel }); renderControls(); }
  function advance1() {
    if (!ppeOk()) return; const c = cur();
    if (!c.heat || c.loc !== "hotplate" || !S.plateOn) return say("Put a weighed sample on the hot plate and turn the plate on first.", "warn");
    if (c.heat.ended) return say("This run is finished.", "warn");
    const t = c.heat.E / hsub(c).power; S.stepTo = (Math.floor(t / S.interval + 1e-9) + 1) * S.interval; S.paused = false; log.add("advance", { container: c.key, to: S.stepTo }); renderControls();
  }
  function renderControls() {
    $("#cont").value = S.sel; const c = cur();
    if (HEAT) {
      const st = c.heat ? hstate(c) : null, t = c.heat ? c.heat.E / hsub(c).power : 0;
      $("#where").textContent = `${c.name} is on the ${c.loc === "hotplate" ? "hot plate" : c.loc}. ` + (c.heat ? `Sample ${c.heat.sample}, ${c.heat.mass.toFixed(1)} g. Hot plate is ${S.plateOn ? "on" : "off"}.` : "It is empty.");
      $("#rTime").textContent = mmss(t); $("#rTemp").textContent = c.heat ? hread(c).toFixed(1) : "--";
      $("#plateBtn").textContent = S.plateOn ? "Turn plate off" : "Turn plate on"; $("#pauseBtn").textContent = S.paused ? "▶ Play" : "⏸ Pause";
      $("#speedSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", +b.dataset.s === S.speed)); $("#ivSel").value = String(S.interval);
      return;
    }
    const d = describe(world, c.c);
    const parts = [];
    if (c.c.solution.mL > 0) parts.push(`${c.c.solution.mL.toFixed(0)} mL of ${c.c.seen.starch_iodine ? "blue-black" : (c.c.solution.comps.I2 || 0) > 0 ? "amber" : "clear"} liquid`);
    if (d.undissolvedG > 0.02) parts.push("solid at the bottom");
    $("#where").textContent = `${c.name} is on the ${c.loc === "hotplate" ? "hot plate" : c.loc}. Temperature ${c.c.T.toFixed(0)} °C. ` + (parts.length ? "You see: " + parts.join(" with ") + "." : "It is empty.");
    $("#plateTxt").textContent = `${S.plateC} °C`; $("#plateBtn").textContent = S.plateOn ? "Turn off" : "Turn on";
  }
  function renderFeed() {
    const box = $("#feed"); box.replaceChildren(...S.feed.map((f) => h("div", { class: "f-" + f.kind }, f.text))); box.scrollTop = box.scrollHeight;
  }

  // ---------- lab sheet ----------
  $("#title").textContent = lab.title;
  const table = HEAT ? document.createElement("table") : $("#table");
  if (!HEAT) { $("#steps").replaceChildren(...lab.steps.map((s) => h("li", {}, s))); $("#tests").replaceChildren(...lab.tests.map((t) => h("li", {}, h("b", {}, t.name + ". "), t.how))); }
  if (!HEAT) table.replaceChildren(
    h("thead", {}, h("tr", {}, h("th", {}, "Sample"), lab.tests.map((t) => h("th", {}, t.name)), h("th", {}, "I think it is"))),
    h("tbody", {}, unknowns.map((u) => h("tr", { "data-u": u.label, ...(CH.includes(u.label) ? { "data-ch": "1", class: "challenge" } : {}) },
      h("th", { scope: "row" }, "Unknown " + u.label + (CH.includes(u.label) ? " (challenge)" : "")),
      lab.tests.map((t) => h("td", {}, h("select", { "data-u": u.label, "data-t": t.key, "aria-label": `${t.name} of unknown ${u.label}` }, h("option", { value: "" }, "—"), t.options.map(([v, l]) => h("option", { value: v }, l))))),
      h("td", {}, h("select", { "data-u": u.label, "data-t": "id", "aria-label": `Identity of unknown ${u.label}` }, h("option", { value: "" }, "—"), solids.map((id) => h("option", { value: id }, speciesData.species.find((s) => s.id === id).name))))))));
  let ready = false;
  const book = HEAT ? createHeatBook({ getData: () => S.heat, axesFor, allowed: () => ["lab", "postlab", "done"].includes(S.stage) || S.demo, act: (t, d) => { if (!S.demo) log.add(t, d); }, onChange: () => { if (ready) renderQuests(); } }) : null;
  if (HEAT) $("#sheet").replaceChildren(h("button", { class: "x", "data-close": "" }, "Close ✕"), h("h2", {}, "Notebook"),
    h("details", {}, h("summary", {}, h("b", {}, "Steps")), h("ol", {}, lab.introSteps.map((t) => h("li", {}, t)))), book.el,
    h("div", { class: "controls foot" }, h("button", { id: "nbToCer", class: "primary", onclick: () => finishData() }, "I'm done with the data → write the CER")));
  // ---------- the room ----------
  const room = parseRoom(roomDef), P = { x: room.start.x, y: room.start.y, face: room.start.face || "u" };
  const roomCanvas = $("#room"), roomR = createRoomRenderer(roomCanvas, room), visited = new Set();
  let lastMove = 0, lastBlock = -1e9;
  const GROUP_OF = (id) => sources.filter((s) => s.group === id);
  function setView(v) {
    S.view = v; closePanel();
    roomCanvas.hidden = v !== "room"; canvas.hidden = v !== "bench"; $("#controlsCard").hidden = v !== "bench";
    syncSide(); $("#leaveBench").hidden = v !== "bench";
    $("#viewHint").textContent = v === "room" ? "Arrow keys or WASD move you along the floor tiles (diagonally on screen). Press E, or click an object next to you, to use it." : "Click a jar to choose it, or a container to select it. Esc returns to the room.";
    log.add("view", { to: v });
  }
  function closePanel() { S.panel = null; $("#panelCard").hidden = true; syncSide(); }
  function syncSide() { $("#helpCard").hidden = !(S.view === "room" && !S.panel && !S.incident); }
  function toggleTasks() { const p = $("#taskPanel"); p.hidden = !p.hidden; $("#btnTasks").classList.toggle("on", !p.hidden); }
  function renderInv() {
    $("#invCount").textContent = `(${S.inv.length}/${CAP})`;
    $("#inv").replaceChildren(...Array.from({ length: CAP }, (_, i) => { const s = sources.find((x) => x.key === S.inv[i]); return s ? h("div", { class: "slot full" }, h("i", { style: `background:${s.color}` }), s.label.replace(" (known)", "")) : h("div", { class: "slot" }, ""); }));
  }
  function take(key) {
    if (S.inv.length >= CAP) return blocked("inventory_full", `Your hands are full (${CAP} jars). Put one back on a shelf first.`);
    S.inv.push(key); const s = sources.find((x) => x.key === key);
    log.add("take", { jar: key, shown_as: s.label }); say(`You take ${s.label}.`); syncUnit(); renderInv(); renderPanel();
  }
  function takeAll(group) { for (const s of GROUP_OF(group)) if (!S.inv.includes(s.key) && S.inv.length < CAP) take(s.key); }
  function putBack(key) {
    S.inv = S.inv.filter((k) => k !== key); log.add("return", { jar: key }); say("You put the jar back on the shelf."); syncUnit(); renderInv(); renderPanel();
  }
  function renderPanel() {
    const t = S.panel; if (!t) return;
    $("#panelCard").hidden = false; syncSide(); $("#panelTitle").textContent = t.type === "shelf" ? t.group : t.type === "locker" ? "Locker" : "Tong rack";
    if (t.type === "shelf" && !GROUP_OF(t.group).length) $("#panelBody").replaceChildren(h("p", { class: "hint" }, "Nothing on this shelf is needed for today's lab."));
    else if (t.type === "shelf") $("#panelBody").replaceChildren(h("div", {}, h("span", { class: "hint" }, "Everything on this shelf"), h("button", { class: "primary", onclick: () => takeAll(t.group) }, "Take all")), ...GROUP_OF(t.group).map((s) => { const has = S.inv.includes(s.key); return h("div", {}, h("span", {}, s.label.replace(" (known)", "")), h("button", { onclick: () => (has ? putBack(s.key) : take(s.key)) }, has ? "Put back" : "Take")); }));
    else {
      const NAME = { goggles: "Goggles", apron: "Apron", tongs: "Tongs" };
      $("#panelBody").replaceChildren(...t.items.map((k) => h("div", {}, h("span", {}, NAME[k]), h("button", { onclick: () => { togglePPE(k); renderPanel(); } }, S.ppe[k] ? (k === "tongs" ? "Put back" : "Take off") : (k === "tongs" ? "Pick up" : "Put on")))));
    }
  }
  function interact(f) {
    const t = f.tile; if (!t || !t.id) return false;
    if (S.incident && t.type === "station") { say("Finish the incident first.", "warn"); return true; }
    if (S.incident && S.incident.phase === "treat" && t.id === S.incident.hz.needs) { treat(); return true; }
    if (!visited.has(t.id)) { visited.add(t.id); log.add("visit", { object: t.id }); }
    if (t.type === "station") { setView("bench"); say("You stand at your bench."); }
    else if (t.type === "shelf" || t.type === "locker" || t.type === "rack") { S.panel = t; renderPanel(); }
    else { closePanel(); say(t.text); }
    return true;
  }
  function walk(dx, dy) {
    if (!S.demo && !["lab", "postlab", "done"].includes(S.stage)) return;
    const now = performance.now(); if (now - lastMove < 110) return; lastMove = now;
    const r = step(room, P, dx, dy, S.mode === "guided" ? S.ppe : { goggles: true, apron: true });
    if (r.blocked && now - lastBlock > 1500) { lastBlock = now; hazard("no_ppe_door", "Stop. The lab door will not open. You need goggles and an apron, and they are in the locker."); }
    if (r.moved) { closePanel(); if (r.tile.type === "door" && !visited.has("entered_lab")) { visited.add("entered_lab"); log.add("door", { outcome: hasPPE(S.ppe) ? "entered" : "entered_without_ppe" }); say(hasPPE(S.ppe) ? "You step into the lab." : "You walk into the lab with no goggles or apron. That is a mistake.", hasPPE(S.ppe) ? "info" : "warn"); } }
  }
  const DIRS = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (S.demo) { if (k === "escape") demoApi.demo.stop(); return; }
    if (k === "escape" && document.querySelector("#stage dialog[open]")) { const d = [...document.querySelectorAll("#stage dialog[open]")].pop(); if (!d.hasAttribute("data-gate") && d.id !== "dlgIntro" && d.id !== "dlgDone") { d.close(); syncVeil(); } return; }
    if (document.querySelector("dialog[open]") || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (k === "escape") { if (S.panel) closePanel(); else if (S.view === "bench") setView("room"); return; }
    if (!["lab", "postlab", "done"].includes(S.stage)) return;
    if (k === "j") return toggleTasks();
    if (k === "n") return openNotebook(); if (k === "t") return openDlg("dlgTheory"); if (k === "m") return openMicro();
    if (HEAT && S.view === "bench" && k === " ") { e.preventDefault(); togglePause(); return; }
    if (S.view !== "room" || e.target.tagName === "BUTTON") return;
    if (DIRS[k]) { e.preventDefault(); walk(...DIRS[k]); }
    else if (k === "e" || k === "enter" || k === " ") { e.preventDefault(); interact(facingTile(room, P)); }
  });
  roomCanvas.addEventListener("click", (ev) => {
    const r = roomCanvas.getBoundingClientRect(), p = roomR.tileFromPoint((ev.clientX - r.left) * (320 / r.width), (ev.clientY - r.top) * (180 / r.height));
    const t = tileAt(room, p.x, p.y); if (!t || !t.id) return;
    if (Math.abs(p.x - P.x) + Math.abs(p.y - P.y) !== 1) return say("Walk next to it first, then press E.", "warn");
    P.face = p.x < P.x ? "l" : p.x > P.x ? "r" : p.y < P.y ? "u" : "d"; interact(facingTile(room, P));
  });
  $("#panelClose").addEventListener("click", closePanel);
  $("#leaveBench").addEventListener("click", () => setView("room"));

  function collectNotebook() {
    S.student = $("#student").value.trim();
    S.notebook = {}; table.querySelectorAll("select").forEach((x) => { (S.notebook[x.dataset.u] ||= {})[x.dataset.t] = x.value; });
  }
  function heatRecord() {
    const off = document.createElement("canvas"); off.width = 640; off.height = 400; const samples = {};
    for (const u of unknowns) { const d = S.heat[u.label]; drawGraph(off, d, axesFor(u.label)); samples[u.label] = { substance: u.id, rows: d.rows, items: d.items, axes: d.axes, plotPng: off.toDataURL("image/png") }; }
    const qs = lab.prelab.questions, correct = qs.filter((q) => S.prelab.answers[q.id] === q.correct).length;
    return { version: 2, lab: lab.id, student: S.student, mode: S.mode, seed, started: log.started, stage: S.stage, submitted: S.cerDone, prelab: { correct, total: qs.length, prediction: S.prelab.prediction, answers: S.prelab.answers }, samples, cer: S.cerDone ? S.cer : null, safety: S.safety, events: log.events };
  }
  function record() {
    const r = baseRecord(); r.activeSec = Math.round(ACT.sec); r.minActive = lab.minActiveMin || 0; r.challenge = challengeDone(); r.code = checkCode({ student: r.student, lab: lab.id, seed, activeSec: r.activeSec, events: log.events.length, cerDone: S.cerDone }); r.codeEvents = log.events.length; return r;
  }
  function baseRecord() {
    if (HEAT) return heatRecord();
    collectNotebook();
    return { version: 2, lab: lab.id, student: S.student, mode: S.mode, seed, started: log.started, unknowns, notebook: S.notebook, stage: S.stage, submitted: S.submitted, prelab: S.prelab, cer: S.cerDone ? S.cer : null, safety: S.safety, summary: { blocked_hazards: log.count("hazard"), blocked_procedures: log.count("procedure"), checks: log.count("check") }, events: log.events };
  }
  const fileName = (prefix) => `${prefix}-${(S.student || "student").replace(/\W+/g, "-")}.json`;
  $("#download").addEventListener("click", () => { const r = record(); downloadJSON(fileName("lab-record"), r); });

  // ---------- save and resume ----------
  const SAVE_KEY = "vlab:" + lab.id;
  function snapshot() {
    collectNotebook();
    return { version: 1, lab: lab.id, seed, student: S.student, savedAt: new Date().toISOString(), started: log.started, activeSec: ACT.sec, elapsed: (performance.now() - log.t0) / 1000, events: log.events,
      S: { ppe: S.ppe, inv: S.inv, srcKey: S.srcKey, plateOn: S.plateOn, plateC: S.plateC, safety: S.safety, sel: S.sel, stage: S.stage, prelab: S.prelab, cer: S.cer, submitted: S.submitted, cerDone: S.cerDone, touched: S.touched, nbSeen: S.nbSeen, heat: S.heat, speed: S.speed, paused: S.paused, interval: S.interval }, P, visited: [...visited], notebook: S.notebook,
      cont: CONT.map((c) => ({ key: c.key, loc: c.loc, slot: c.slot, tare: c.tare, c: c.c, heat: c.heat || null })) };
  }
  function autosave() { if (S.demo || S.stage === "intro") return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot())); } catch (e) { /* storage blocked: file save still works */ } }
  function restore(sn, quiet) {
    Object.assign(S.ppe, sn.S.ppe); S.inv = sn.S.inv; S.srcKey = sn.S.srcKey; S.plateOn = sn.S.plateOn; S.plateC = sn.S.plateC; S.safety = sn.S.safety; S.sel = sn.S.sel;
    for (const k of ["stage", "prelab", "cer", "submitted", "cerDone", "touched", "nbSeen", "heat", "speed", "paused", "interval"]) if (sn.S[k] !== undefined) S[k] = sn.S[k];
    for (const r of sn.cont) { const c = byKey(r.key); c.loc = r.loc; c.slot = r.slot; c.tare = r.tare; c.c = r.c; c.heat = r.heat || null; }
    Object.assign(P, sn.P); sn.visited.forEach((v) => visited.add(v));
    ACT.set(sn.activeSec || 0); log.events = sn.events; log.started = sn.started; log.t0 = performance.now() - sn.elapsed * 1000;
    $("#student").value = sn.student || "";
    table.querySelectorAll("select").forEach((x) => { const v = (sn.notebook[x.dataset.u] || {})[x.dataset.t]; if (v) x.value = v; });
    if (!HEAT) $("#plate").value = S.plateC; if (book) book.refresh(); syncUnit(); renderPPE(); renderInv(); renderControls(); renderSafety();
    lockTable(); if (!quiet) { log.add("resume", { savedAt: sn.savedAt }); say("Welcome back. Your saved lab is restored."); }
  }
  $("#save").addEventListener("click", () => { autosave(); downloadJSON(fileName("lab-save"), snapshot()); say("Progress saved to your Downloads folder, and kept in this browser.", "obs"); });
  $("#load").addEventListener("change", (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((txt) => {
      const sn = JSON.parse(txt); if (sn.lab !== lab.id || sn.version !== 1) throw new Error("That file is not a save from this lab.");
      localStorage.setItem(SAVE_KEY, txt); const q = new URLSearchParams(location.search); q.set("resume", "1"); q.delete("seed"); location.search = q.toString();
    }).catch((err) => say(String(err.message || err), "warn"));
  });

  // ---------- printable report ----------
  const optLabel = (t, v) => ((t.options.find((o) => o[0] === v) || [])[1]) || v;
  function badgeImg(rec) { const cv = document.createElement("canvas"); cv.width = 480; cv.height = 360; drawBadge(cv, { title: lab.badgeTitle || lab.title, student: S.student, gold: rec.challenge, minutes: Math.round(rec.activeSec / 60), code: rec.code, date: new Date().toLocaleDateString() }); return h("img", { src: cv.toDataURL("image/png"), style: "width:3.2in;float:right;margin:0 0 8px 12px" }); }
  function printHeat() {
    const rec = record(), nm = (id) => (lab.reference.find((x) => x.id === id) || {}).name || "(not chosen)";
    $("#report").replaceChildren(
      badgeImg(rec), h("h1", {}, lab.title), h("p", {}, `${S.student || "Student"} · ${new Date(log.started).toLocaleString()} · active lab time ${Math.round(rec.activeSec / 60)} min · code ${rec.code}`),
      h("h2", {}, "Pre-lab"), h("p", {}, `Questions correct: ${rec.prelab.correct} of ${rec.prelab.total}.`), h("p", {}, h("b", {}, "Prediction: "), S.prelab.prediction || "(none)"),
      ...unknowns.flatMap((u) => { const d = rec.samples[u.label], rows = goodRows(S.heat[u.label]); return rows.length || !CH.includes(u.label) ? [h("h2", {}, `Sample ${u.label}${CH.includes(u.label) ? " (challenge)" : ""}`),
        h("table", {}, h("thead", {}, h("tr", {}, ["Time (s)", "Temp (°C)", "State"].map((x) => h("th", {}, x)))), h("tbody", {}, rows.map((r) => h("tr", {}, h("td", {}, r.t), h("td", {}, r.T), h("td", {}, r.s || ""))))),
        h("img", { src: d.plotPng, style: "width:5.2in;max-width:100%" })] : []; }),
      S.cerDone ? h("div", {}, h("h2", {}, "Claim, Evidence, Reasoning"), h("p", {}, `Sample X is ${nm(S.cer.X)}. Sample Y is ${nm(S.cer.Y)}.${S.cer.Z ? " Sample Z is " + nm(S.cer.Z) + "." : ""}`), h("p", {}, h("b", {}, "Claim: "), S.cer.claim), h("p", {}, h("b", {}, "Evidence:")), h("ul", {}, (S.cer.evidence || []).map((x) => h("li", {}, x)), S.cer.note ? h("li", {}, S.cer.note) : null), h("p", {}, h("b", {}, "Reasoning: "), S.cer.reasoning)) : h("p", {}, "CER not submitted.")
    ); window.print();
  }
  $("#print").addEventListener("click", () => {
    if (HEAT) return printHeat();
    const rec = record(), r = buildReport(rec, truth, H), mm = (sec) => `${Math.floor(sec / 60)} min ${sec % 60} s`, mark = (ok) => (ok === null ? "—" : ok ? "✔" : "✘");
    const right = Object.entries(S.prelab.answers).filter(([id, i]) => lab.prelab.questions.find((q) => q.id === id).correct === i).length;
    $("#report").replaceChildren(...[
      badgeImg(rec), h("h1", {}, lab.title), h("p", {}, `code ${rec.code} · active ${Math.round(rec.activeSec / 60)} min · ${r.student} · ${new Date(r.started).toLocaleString()} · ${r.mode} mode · time in lab ${mm(r.seconds)}`),
      h("h2", {}, "Pre-lab"), h("p", {}, `Concept questions correct on the first attempt: ${right} of ${lab.prelab.questions.length}.`), h("p", {}, h("b", {}, "Prediction: "), S.prelab.prediction || "(none)"),
      h("h2", {}, "Setup and safety"), h("ul", {}, r.setup.map((x) => h("li", {}, `${mark(x.ok)} ${x.label}`)), r.points !== null && r.mode === "consequences" ? h("li", {}, `Safety points: ${r.points} / 100`) : null),
      h("p", {}, `Unsafe actions blocked: ${r.blocked.hazards}. Procedure errors blocked: ${r.blocked.procedures}.`),
      r.incidents.length ? h("div", {}, h("h2", {}, "Incidents"), h("ul", {}, r.incidents.map((i) => h("li", {}, h("b", {}, i.title), `. ${i.why} Review question ${i.quizCorrect ? "answered correctly" : "missed"}.`)))) : null,
      h("h2", {}, "Tests you ran"), h("ul", {}, r.tests.map((x) => h("li", {}, `${x.done ? "✔" : "✘"} ${x.label}`))),
      h("h2", {}, "Your observations"),
      h("table", {}, h("thead", {}, h("tr", {}, h("th", {}, "Sample"), lab.tests.map((t) => h("th", {}, t.name)), h("th", {}, "Identified as"))),
        h("tbody", {}, unknowns.map((u) => h("tr", {}, h("th", {}, "Unknown " + u.label), lab.tests.map((t) => h("td", {}, optLabel(t, (S.notebook[u.label] || {})[t.key]) || "—")), h("td", {}, (speciesData.species.find((x) => x.id === (S.notebook[u.label] || {}).id) || {}).name || "—"))))),
      S.cerDone ? h("div", {}, h("h2", {}, "Claim, Evidence, Reasoning"), h("p", {}, h("b", {}, `Unknown ${S.cer.unknown}. Claim: `), S.cer.claim), h("p", {}, h("b", {}, "Evidence: ")), h("ul", {}, S.cer.evidence.map((x) => h("li", {}, x)), S.cer.note ? h("li", {}, S.cer.note) : null), h("p", {}, h("b", {}, "Reasoning: "), S.cer.reasoning)) : null
    ].filter(Boolean));
    window.print();
  });

  // ---------- hover names and pictures ----------
  const tip = $("#tip"), FIX = { balance: ["Balance", "Weighs solids. Tare it with the empty container on it."], hotplate: ["Hot plate", "Heats a container. Anything on it gets hot, so use tongs."], tester: ["Conductivity tester", "A bulb that glows when the liquid carries electric current."] };
  function infoForBench(hit) {
    if (hit.type === "fixture") return { name: FIX[hit.key][0], blurb: FIX[hit.key][1], icon: hit.key };
    if (HEAT && hit.type === "container") { const c = byKey(hit.key); return { name: c.name, blurb: `${c.cap} mL. ${c.heat ? `Sample ${c.heat.sample}, ${c.heat.mass.toFixed(1)} g, ${hread(c).toFixed(1)} °C` : "Empty"}. ${c.key === S.sel ? "Click again to zoom in on the particles." : "Click to select."}`, icon: "beaker" }; }
    if (hit.type === "container") { const c = byKey(hit.key), d = describe(world, c.c); return { name: c.name, blurb: c.kind === "watch" ? "Holds solids only. Never liquid." : `${c.cap} mL. ${c.c.solution.mL > 0 ? c.c.solution.mL.toFixed(0) + " mL inside" : "Empty"}${d.undissolvedG > 0.02 ? ", solid at the bottom" : ""}. ${c.c.T.toFixed(0)} °C. ${c.key === S.sel ? "Click again to zoom in on the particles." : "Click to select."}`, icon: c.kind === "watch" ? "watch" : "beaker" };
    
    }
    const sr = sources.find((x) => x.key === hit.key);
    return { name: sr.label, blurb: sr.heatSub ? "A sealed tube of an unidentified solid. Weigh some out and heat it." : sr.key.startsWith("u") ? "One of six white solids. Test it to find out which." : sr.phase === "l" ? "A liquid. Measured in mL." : "Known sample to compare against. Measured in g.", icon: "jar", color: sr.color };
  }
  function showTip(ev, info) {
    if (!info) { tip.hidden = true; return; }
    $("#tipName").textContent = info.name; $("#tipBlurb").textContent = info.blurb || ""; drawIcon($("#tipIcon"), info.icon, info.color);
    tip.hidden = false; const w = tip.offsetWidth, hgt = tip.offsetHeight;
    tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, ev.clientX + 16)) + "px"; tip.style.top = Math.max(8, Math.min(innerHeight - hgt - 8, ev.clientY + 16)) + "px";
  }
  canvas.addEventListener("mousemove", (ev) => { const r = canvas.getBoundingClientRect(), hit = renderer.hit((ev.clientX - r.left) * (320 / r.width), (ev.clientY - r.top) * (180 / r.height)); showTip(ev, hit && infoForBench(hit)); });
  roomCanvas.addEventListener("mousemove", (ev) => { const r = roomCanvas.getBoundingClientRect(), p = roomR.tileFromPoint((ev.clientX - r.left) * (320 / r.width), (ev.clientY - r.top) * (180 / r.height)), t = tileAt(room, p.x, p.y); showTip(ev, t && t.name ? { name: t.name, blurb: t.text, icon: t.id } : null); });
  for (const cv of [canvas, roomCanvas]) cv.addEventListener("mouseleave", () => { tip.hidden = true; });

  // ---------- dialogs, stages, quests, microscope, demo ----------
  const dlg = (id) => document.getElementById(id), syncVeil = () => { $("#veil").hidden = !document.querySelector("#stage dialog[open]"); };
  const openDlg = (id) => { if (!dlg(id).open) { dlg(id).show(); syncVeil(); } }, closeDlg = (id) => { if (dlg(id).open) { dlg(id).close(); syncVeil(); } };
  document.querySelectorAll("#stage dialog").forEach((d) => { if (d.hasAttribute("data-wide")) d.classList.add("wide"); d.addEventListener("close", syncVeil); });
  for (const id of ["dlgIntro", "dlgPrelab"]) dlg(id).addEventListener("cancel", (e) => e.preventDefault());
  document.querySelectorAll("dialog [data-close]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));
  const nbCells = () => [...table.querySelectorAll("select")];
  const nbReq = () => nbCells().filter((x) => !x.closest("tr[data-ch]"));
  const nbFilled = () => nbReq().filter((x) => x.value).length;
  const chFilled = () => nbCells().filter((x) => x.closest("tr[data-ch]") && x.value).length;
  function lockTable() { if (HEAT) return; nbCells().forEach((x) => { x.disabled = S.submitted; }); const b = $("#nbSubmit"); if (b) b.hidden = S.submitted; $("#nbDone").hidden = !S.submitted; }
  function finishData() {
    if (S.stage === "lab") { S.stage = "postlab"; log.add("data_done", {}); }
    closeDlg("dlgNotebook"); say("Data finished. Now write your Claim, Evidence, Reasoning.", "obs"); openCER(); renderQuests();
  }
  function openNotebook() {
    if (HEAT) { if (!S.paused) { S.paused = true; S.stepTo = null; say("The clock pauses while your notebook is open. Press Play at the bench to continue."); } const hc = cur(); if (hc.heat && S.heat[hc.heat.sample]) book.select(hc.heat.sample); else book.refresh(); log.add("notebook_open"); return openDlg("dlgNotebook"); }
    S.nbSeen = log.events.filter((e) => e.type === "conductivity" || e.type === "observe").length; log.add("notebook_open");
    updateNb(); openDlg("dlgNotebook");
  }
  let confirmSubmit = false;
  function updateNb() {
    const n = nbFilled(), tot = nbReq().length, b = $("#nbSubmit"); if (!b) return;
    b.disabled = n < tot; b.textContent = confirmSubmit ? "Really submit? You cannot change answers after." : "Submit answers";
    $("#nbCount").textContent = S.submitted ? "Submitted." : `${n} of ${tot} boxes filled. No answer check: retest anything you doubt before you submit.`;
  }
  table.addEventListener("change", () => { confirmSubmit = false; updateNb(); });
  $("#nbSubmit")?.addEventListener("click", () => {
    if (!confirmSubmit) { confirmSubmit = true; return updateNb(); }
    collectNotebook(); S.submitted = true; S.stage = "postlab"; lockTable(); log.add("submit", { notebook: S.notebook }); closeDlg("dlgNotebook");
    say("Answers submitted. Now write your Claim, Evidence, Reasoning.", "obs"); openCER();
  });
  function openCER() { (HEAT ? renderCERHeat : renderCER)($("#cerBody"), stageCtx); openDlg("dlgCER"); }
  const stageCtx = {
    lab, S, seed, unknowns,
    getNotebook: () => { collectNotebook(); return S.notebook; },
    getRows: () => Object.fromEntries(Object.keys(S.heat).map((k) => [k, goodRows(S.heat[k])])),
    onDemo: () => demoStart(),
    onIntroDone: (name) => { S.student = name; S.stage = "prelab"; log.add("stage", { to: "prelab", name }); closeDlg("dlgIntro"); renderPrelab($("#prelabBody"), stageCtx); openDlg("dlgPrelab"); },
    onAnswer: (id, choice, correct) => log.add("prelab_answer", { q: id, choice, correct }),
    onPrelabDone: () => { S.stage = "lab"; log.add("prelab_done", { prediction: S.prelab.prediction }); closeDlg("dlgPrelab"); renderQuests(); say("Pre-lab done. The lab door will open once you have goggles and an apron."); },
    onCerDone: (c) => { if (!gateOk()) return showGate(); S.cer = c; S.cerDone = true; S.stage = "done"; log.add("cer", c); closeDlg("dlgCER"); openDone(); },
    onCerClose: () => closeDlg("dlgCER")
  };
  $("#theoryBody").replaceChildren(...theoryNodes(lab));
  $("#btnTheory").addEventListener("click", () => openDlg("dlgTheory")); $("#btnTasks").addEventListener("click", toggleTasks); $("#btnTasks").classList.add("on"); $("#btnNotebook").addEventListener("click", openNotebook);
  $("#btnMicro").addEventListener("click", () => openMicro()); $("#btnDemo").addEventListener("click", () => demoStart());
  $("#btnMenu").addEventListener("click", () => openDlg("dlgMenu")); $("#btnCER").addEventListener("click", () => (S.stage === "done" ? openDone() : openCER()));
  $("#donePrint").addEventListener("click", () => $("#print").click());
  $("#doneDl").addEventListener("click", () => $("#download").click());

  // quest list and coach bar
  const needSec = () => (lab.minActiveMin || 0) * 60, gateOk = () => TEACHER || ACT.sec >= needSec();
  const minTxt = () => `${Math.floor(ACT.sec / 60)} of ${lab.minActiveMin || 0} active minutes`;
  function showGate() { $("#gateMsg").textContent = `You have ${minTxt()}. Your answers are kept. Use the rest of the time to recheck a reading, retest a sample, or try the Challenge, then submit again.`; closeDlg("dlgCER"); openDlg("dlgGate"); }
  function openDone() {
    const r = record(), mins = Math.round(r.activeSec / 60);
    drawBadge($("#badge"), { title: lab.badgeTitle || lab.title, student: S.student, gold: r.challenge, minutes: mins, code: r.code, date: new Date().toLocaleDateString() });
    $("#doneInfo").textContent = r.challenge ? "You finished the required samples and the challenge." : "You finished the required samples. The challenge sample is still open if you want the gold badge.";
    openDlg("dlgDone");
  }
  let qsig = "";
  function renderTimer(now) {
    const t = $("#timer"); if (TEACHER || !lab.minActiveMin) { t.hidden = true; return; }
    t.hidden = S.stage === "intro" || S.stage === "prelab"; const m = Math.floor(ACT.sec / 60), s2 = Math.floor(ACT.sec % 60), ok = ACT.sec >= needSec();
    t.textContent = `⏱ ${m}:${String(s2).padStart(2, "0")} / ${lab.minActiveMin}:00`; t.className = ok ? "ok" : now - lastPoke() > 40 ? "idle" : "";
  }
  const lastPoke = () => ACT.last();
  function qstate() {
    const hk = Object.keys(S.heat); return { ppe: S.ppe, notebookFilled: nbFilled(), challengeFilled: chFilled(), submitted: S.submitted, cerDone: S.cerDone, heat: { rows: Object.fromEntries(hk.map((k) => [k, goodRows(S.heat[k]).length])), plot: Object.fromEntries(hk.map((k) => [k, S.heat[k].items.filter((i) => i.k === "p").length])), lines: Object.fromEntries(hk.map((k) => [k, S.heat[k].items.filter((i) => i.k === "l").length])) } };
  }
  const challengeDone = () => { const st = qstate(); return lab.quests.filter((q) => q.optional).every((q) => questDone(q, log.events, st)); };
  function renderQuests() {
    const st = qstate();
    const items = lab.quests.map((q) => ({ q, done: questDone(q, log.events, st), prog: questProgress(q, log.events, st) }));
    const ai = items.findIndex((i) => !i.done && !i.q.optional), stage = S.stage, obs = log.events.filter((e) => e.type === "conductivity" || e.type === "observe").length;
    const sig = stage + "|" + items.map((i) => (i.done ? 1 : 0) + ":" + (i.prog ?? "")).join("|") + "|" + (obs > S.nbSeen);
    $("#nbDot").hidden = HEAT || !(obs > S.nbSeen) || S.submitted; $("#btnCER").hidden = stage !== "postlab" && stage !== "done"; $("#btnCER").textContent = stage === "done" ? "🏅 Hand in" : "✍ Write CER";
    if (sig === qsig) return; qsig = sig;
    const reqI = items.filter((i) => !i.q.optional), doneN = reqI.filter((i) => i.done).length, from = Math.max(0, (ai < 0 ? items.length : ai) - 1), shown = items.slice(from, from + 5);
    $("#questHead").textContent = `Tasks (${doneN} of ${reqI.length})`;
    $("#quests").replaceChildren(...shown.map((i) => h("li", { class: i.done ? "done" : i === items[ai] ? "active" : "" }, h("span", { class: "tick" }, i.done ? "✔" : i === items[ai] ? "▶" : "○"), " ", i.q.text, i.q.count > 1 && i.prog !== null && !i.done ? ` (${i.prog}/${i.q.count})` : "")), ...(items.length - from - 5 > 0 ? [h("li", { class: "more" }, `+ ${items.length - from - 5} more`)] : []));
    $("#coachText").textContent = stage === "intro" || stage === "prelab" ? "Finish the pre-lab. The lab door stays locked until you do." : stage === "done" ? "Lab complete. Open Save / Print to hand in your record." : stage === "postlab" && ai < 0 ? "Write your CER with the button at the top." : ai >= 0 ? items[ai].q.hint : "All tasks done.";
  }

  // microscope: click a container twice (or press M) to zoom in
  const PHASE_KEY = [{ color: "#b9c8ff", text: "Solid: particles vibrate in place" }, { color: "#7fb3ff", text: "Liquid: particles slide past each other" }, { color: "#ffc16b", text: "Gas: particles fly freely" }];
  const micro = createMicroView($("#microCanvas"), (m) => $("#microLegend").replaceChildren(...(m.phase ? PHASE_KEY : legend(m)).map((l) => h("li", {}, h("i", { style: `background:${l.color}` }), l.text))));
  function openMicro(key) {
    if (!S.demo && !["lab", "postlab", "done"].includes(S.stage)) return;
    const c = byKey(key || S.sel), anon = !S.submitted && (S.touched[c.key] || []).some((k) => k.startsWith("u"));
    $("#microTitle").textContent = `${c.name} under the microscope`; $("#microNote").textContent = anon ? "Particle names are hidden while your unknowns are unidentified. Colors show charge: blue +, red −." : "";
    log.add("micro", { container: c.key });
    micro.open(() => (c.heat ? { T: hstate(c).T, liquidMl: 0, water: false, lattice: [], dissolved: [], gas: [], phase: { fm: hstate(c).fm, fv: hstate(c).fv } } : microModel(world, c.c, speciesData.micro, { fizz: c.fizz, anon })), c.name); openDlg("dlgMicro");
  }
  dlg("dlgMicro").addEventListener("close", () => micro.close());

  // scripted demo: runs on the real room and bench, then restores the student's own state
  const demoApi = {
    demo: { running: false, stop() {} }, heat: HEAT,
    freeze() {
      const snap = structuredClone(snapshot()), extra = { feed: S.feed.slice(), view: S.view };
      S.demo = true; demoApi.demo.running = true;
      Object.assign(S.ppe, { goggles: false, apron: false, tongs: false }); S.inv = []; S.panel = null; S.plateOn = false; S.touched = {}; visited.clear();
      Object.assign(P, { x: room.start.x, y: room.start.y, face: "u" });
      CONT.forEach((c, i) => { c.c = newContainer(c.name, c.cap); c.tare = 0; c.fizz = 0; c.loc = "bench"; c.slot = i; c.heat = null; }); S.sel = "b1";
      if (HEAT) { S.heat = Object.fromEntries(unknowns.map((u) => [u.label, { rows: [], items: [], axes: { title: "", x: "", y: "" } }])); Object.assign(S, { speed: 1, paused: false, stepTo: null, interval: 10 }); book.refresh(); }
      document.querySelectorAll("dialog[open]").forEach((d) => d.close()); setView("room"); renderPPE(); renderInv(); syncUnit();
      return { snap, extra };
    },
    thaw({ snap, extra }) {
      demoApi.removePractice(); visited.clear(); restore(snap, true); S.feed = extra.feed; renderFeed();
      S.demo = false; demoApi.demo.running = false; $("#demoBar").hidden = true; document.querySelectorAll("dialog[open]").forEach((d) => d.close());
      setView(extra.view); renderPPE(); renderInv(); renderControls(); syncUnit(); qsig = "";
    },
    caption(n, text) { $("#demoBar").hidden = false; $("#demoText").textContent = `Demo ${n} of ${HEAT ? 10 : 9} · ${text}`; },
    walk: (d) => walk(d[0], d[1]), interact: () => interact(facingTile(room, P)), closePanel, togglePPE, take,
    addPractice() {
      world.species.set("practice", { id: "practice", name: "Practice salt (NaI)", formula: "NaI", phase: "s", solubility: 184, color: "#f4f4f0", heatEvents: [] });
      EL.NaI = { type: "strong", lambda: 100 }; speciesData.micro.NaI = { kind: "ionic", label: "NaI", ions: [{ label: "Na⁺", color: "#e0a030", per: 1 }, { label: "I⁻", color: "#7a3b9c", per: 1 }] };
      sources.push({ key: "practice", id: "practice", label: HEAT ? "Practice tube" : "Practice salt", short: "Salt", group: "Practice", phase: "s", shelf: 0, idx: 0, color: "#f4f4f0", heatSub: HEAT ? "practice" : undefined });
      S.inv.push("practice"); renderInv(); syncUnit();
    },
    removePractice() { world.species.delete("practice"); delete EL.NaI; delete speciesData.micro.NaI; const i = sources.findIndex((x) => x.key === "practice"); if (i >= 0) sources.splice(i, 1); },
    act: { plate: (on) => setPlate(on), advance: advance1, row() { const c = cur(), t = c.heat.E / hsub(c).power; book.addRow({ t: String(Math.round(t)), T: String(hread(c)), s: hstate(c).phase === "melting" ? "solid + liquid" : hstate(c).phase === "solid" ? "solid" : "liquid" }); }, graph: () => book.pane("graph"), plot() { for (const r of S.heat.X.rows) { book.addPoint(Math.round(+r.t / 6) * 6, Math.round(+r.T / 2) * 2); } S.heat.X.axes = { title: "Heating curve of practice sample", x: "Time (s)", y: "Temperature (°C)" }; book.refresh(); }, moveTo, tare, stir, conduct, add: addSubstance, pick: (key, amt) => { S.srcKey = key; syncUnit(); $("#amt").value = amt; } },
    openMicro: () => openMicro("b1"), closeMicro: () => closeDlg("dlgMicro"), openNotebook: () => { if (HEAT) { book.refresh(); S.paused = true; } else updateNb(); openDlg("dlgNotebook"); }, closeNotebook: () => closeDlg("dlgNotebook")
  };
  $("#demoStop").addEventListener("click", () => demoApi.demo.stop());
  async function demoStart() {
    if (S.incident) return say("Finish the incident first.", "warn");
    const wasIntro = dlg("dlgIntro").open; if (wasIntro) { S.student = $("#student").value.trim(); closeDlg("dlgIntro"); }
    await runDemo(demoApi);
    if (S.stage === "intro") { renderIntro($("#introBody"), stageCtx); openDlg("dlgIntro"); }
  }
  const intro = () => { renderIntro($("#introBody"), stageCtx); openDlg("dlgIntro"); };

  ready = true;
  syncUnit(); renderPPE(); renderControls(); renderFeed(); renderInv(); renderSafety(); setView("room");
  if (modeInfo.rejected) { log.add("mode_rejected", { asked: modeInfo.rejected }); say("This link's mode could not be verified, so you are in Guided mode.", "warn"); }
  say("Welcome. Open the locker (walk up to it, press E) and put on goggles and an apron. Then go through the door.");
  if (resume) restore(resume);
  renderQuests();
  if (S.stage === "intro") intro(); else if (S.stage === "prelab") { renderPrelab($("#prelabBody"), stageCtx); openDlg("dlgPrelab"); }
  setInterval(autosave, 5000);
  $("#boot").hidden = true; $("#app").hidden = false; 
  let last = performance.now(), t0 = last, lastCtl = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    let sdt = dt;
    if (HEAT) {
      if (S.paused) sdt = 0;
      else { sdt = dt * (S.stepTo != null ? 20 : S.speed); const c = cur(); if (S.stepTo != null && c.heat && c.loc === "hotplate" && S.plateOn) sdt = Math.min(sdt, Math.max(S.stepTo - c.heat.E / hsub(c).power, 0)); }
    }
    stepAll(sdt); tickIncident(now);
    if (HEAT && S.stepTo != null) { const c = cur(); if (!c.heat || c.loc !== "hotplate" || !S.plateOn) S.stepTo = null; else if (c.heat.E / hsub(c).power >= S.stepTo - 1e-6) { S.stepTo = null; S.paused = true; say(`Paused at ${mmss(c.heat.E / hsub(c).power)}. Write the reading down.`); } }
    if (S.view === "room") roomR.draw(P, S.ppe, hasPPE(S.ppe), facingTile(room, P), (now - t0) / 1000); else renderer.draw(view(), (now - t0) / 1000);
    ACT.tick(now / 1000, !document.hidden, (S.stage === "lab" || S.stage === "postlab") && !S.demo && !TEACHER, HEAT && S.plateOn && !S.paused);
    if (now - lastCtl > 250) { renderControls(); renderQuests(); renderTimer(now / 1000); lastCtl = now; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__vl = { ACT, H, S, P, room, take, CONT, sources, unknowns, truth, world, seed, log, actions: { moveTo, addSubstance, stir, tare, conduct, empty, skip, setPlate, togglePPE }, stageCtx, demoApi, openMicro, openNotebook, openCER, quests: () => lab.quests, nbCells, select: (k) => { S.sel = k; }, source: (k) => { S.srcKey = k; syncUnit(); } };
}

boot();
