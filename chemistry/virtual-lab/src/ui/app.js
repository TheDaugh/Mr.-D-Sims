// Bench + lab sheet for Lab 1. Chemistry comes from the engine and content files, never from this file.
import { buildWorld, newContainer, add, advance, heat, conductivity, describe, dissolvedGrams, massAccounting } from "../engine/sim.js";
import { fingerprint } from "../engine/lab1.js";
import { Log, downloadJSON } from "../log.js";
import { createRenderer, SLOTS } from "./render.js";
import { createRoomRenderer } from "./roomview.js";
import { $, h, mulberry32 } from "./dom.js";
import { createMicroView } from "./micro.js";
import { microModel, legend } from "../engine/micro.js";
import { renderIntro, renderPrelab, renderCER, theoryNodes } from "./stages.js";
import { runDemo } from "./demo.js";
import { questDone, questProgress } from "../engine/quests.js";
import { drawIcon } from "./icons.js";
import { buildReport } from "../report.js";
import { resolveMode } from "../mode.js";
import { indexHazards, losePoints } from "../engine/hazards.js";
import { parseRoom, step, facingTile, hasPPE, tileAt } from "../engine/room.js";

const SHORT = { NaCl: "Salt", sucrose: "Sugar", NaHCO3: "B.Soda", CaCO3: "Chalk", starch: "Starch", citric: "Citric", water: "Water", vinegar: "Vinegar", iodine: "Iodine" };

async function boot() {
  try {
    const urls = ["content/species.json", "content/reactions.json", "content/labs/01-unknown-solids.json", "content/rooms/main-lab.json", "content/hazards.json", "content/config.json"];
    const [species, reactions, lab, roomDef, hazardData, config] = await Promise.all(urls.map((u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); })));
    const params = new URLSearchParams(location.search), modeInfo = await resolveMode(params, config), key = "vlab:" + lab.id;
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
  const solids = speciesData.species.filter((s) => s.phase === "s").map((s) => s.id);
  const params = new URLSearchParams(location.search);
  const seed = resume ? resume.seed : params.get("seed") ? parseInt(params.get("seed"), 10) : Math.floor(Math.random() * 1e9);
  const rng = mulberry32(seed);
  const order = solids.slice().sort(() => rng() - 0.5);
  const unknowns = order.slice(0, 4).map((id, i) => ({ label: "ABCD"[i], id }));
  const truth = {}; for (const id of solids) truth[id] = fingerprint(world, EL, id, lab.standard);
  const log = new Log();

  const CONT = [
    { key: "b1", label: "B1", name: "Beaker 1", kind: "beaker", cap: 250, empty: 105.0, loc: "bench", slot: 0 },
    { key: "b2", label: "B2", name: "Beaker 2", kind: "beaker", cap: 250, empty: 105.0, loc: "bench", slot: 1 },
    { key: "wg", label: "WG", name: "Watch glass", kind: "watch", cap: 0, empty: 20.0, loc: "bench", slot: 2 }
  ];
  CONT.forEach((c) => { c.c = newContainer(c.name, c.cap); c.tare = 0; c.fizz = 0; });
  const sources = [
    ...unknowns.map((u, i) => ({ key: "u" + u.label, id: u.id, label: `Unknown ${u.label}`, short: u.label, group: "Unknown samples", phase: "s", shelf: 0, idx: i })),
    ...["water", "vinegar", "iodine"].map((id, i) => ({ key: id, id, label: speciesData.species.find((s) => s.id === id).name, short: SHORT[id], group: "Liquids", phase: "l", shelf: 0, idx: 4 + i })),
    ...solids.map((id, i) => ({ key: id, id, label: speciesData.species.find((s) => s.id === id).name + " (known)", short: SHORT[id], group: "Known samples", phase: "s", shelf: 1, idx: i }))
  ];
  sources.forEach((s) => { s.color = speciesData.species.find((x) => x.id === s.id).color; });

  const S = { sel: "b1", srcKey: sources[0].key, ppe: { goggles: false, apron: false, tongs: false }, inv: [], view: "room", panel: null, mode: modeInfo.mode, incident: null, safety: { points: 100, incidents: [] }, plateOn: false, plateC: 150, bulb: null, bulbUntil: 0, feed: [], notebook: {}, student: "", stage: "intro", prelab: { answers: {}, prediction: "" }, cer: {}, submitted: false, cerDone: false, touched: {}, demo: false, nbSeen: 0 };
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
    if (!inc) { box.hidden = true; return; }
    box.hidden = false; const hz = inc.hz, kids = [h("h2", {}, "Incident: " + hz.title), h("p", {}, hz.happened)];
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
  function rawMass(c) { return c.empty + massAccounting(world, c.c).inside; }

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
  function addSubstance() {
    if (!ppeOk(true)) return;
    const c = cur(), src = sources.find((s) => s.key === S.srcKey && S.inv.includes(s.key)), amt = parseFloat($("#amt").value);
    if (!src) return blocked("not_carrying", "You are not carrying that jar. Go back to the room and take it from its shelf.");
    if (!(amt > 0)) return say("Enter an amount first.", "warn");
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
    c.c = newContainer(c.name, c.cap); c.tare = 0; c.fizz = 0; S.touched[c.key] = [];
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
  function stepAll(dt) {
    for (const c of CONT) {
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
      sources: S.inv.map((k, i) => ({ ...sources.find((s) => s.key === k), shelf: 0, idx: i })), selectedSource: S.srcKey, plateOn: S.plateOn, plateC: S.plateC,
      bulb: performance.now() < S.bulbUntil ? S.bulb : null,
      balanceText: onBalance ? `${(rawMass(onBalance) - onBalance.tare).toFixed(1)} g` : "0.0 g",
      containers: CONT.map((c) => {
        const pos = c.loc === "balance" ? SLOTS.balance : c.loc === "hotplate" ? SLOTS.hotplate : SLOTS.bench[c.slot];
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
  ctl.append(
    h("div", { class: "controls" },
      h("label", {}, "Container", h("select", { id: "cont", onchange: (e) => { S.sel = e.target.value; renderControls(); } }, CONT.map((c) => h("option", { value: c.key }, c.name)))),
      h("div", {}, h("div", { class: "hint" }, "Move it to"), h("div", { class: "controls", style: "gap:6px" },
        h("button", { onclick: () => moveTo("bench") }, "Bench"), h("button", { onclick: () => moveTo("balance") }, "Balance"), h("button", { onclick: () => moveTo("hotplate") }, "Hot plate")))),
    h("p", { id: "where", class: "note", style: "margin:10px 0" }),
    h("div", { class: "controls" },
      h("label", {}, "Take from", srcSel),
      h("label", {}, "Amount", h("span", { style: "display:flex;gap:6px;align-items:center" }, h("input", { id: "amt", type: "number", min: "0.1", step: "0.1", value: "1.0", style: "width:90px" }), h("span", { id: "unit" }, "g"))),
      h("button", { class: "primary", onclick: addSubstance }, "Add")),
    h("div", { class: "controls", style: "margin-top:10px" },
      h("button", { onclick: tare }, "Tare balance"), h("button", { onclick: stir }, "Stir"), h("button", { onclick: conduct }, "Test conductivity"),
      h("button", { onclick: () => skip(60) }, "Skip ahead 60 s"), h("button", { onclick: empty }, "Empty & rinse")),
    h("div", { class: "controls", style: "margin-top:10px" },
      h("label", {}, "Hot plate setting", h("span", { style: "display:flex;gap:8px;align-items:center" }, h("input", { id: "plate", type: "range", min: "50", max: "250", step: "10", value: "150", oninput: (e) => setPlate(undefined, +e.target.value) }), h("b", { id: "plateTxt" }, "150 °C"))),
      h("button", { id: "plateBtn", onclick: () => setPlate(!S.plateOn) }, "Turn on")));
  function renderControls() {
    $("#cont").value = S.sel; const c = cur();
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
  $("#steps").replaceChildren(...lab.steps.map((s) => h("li", {}, s)));
  $("#tests").replaceChildren(...lab.tests.map((t) => h("li", {}, h("b", {}, t.name + ". "), t.how)));
  const table = $("#table");
  table.replaceChildren(
    h("thead", {}, h("tr", {}, h("th", {}, "Sample"), lab.tests.map((t) => h("th", {}, t.name)), h("th", {}, "I think it is"))),
    h("tbody", {}, unknowns.map((u) => h("tr", { "data-u": u.label },
      h("th", { scope: "row" }, "Unknown " + u.label),
      lab.tests.map((t) => h("td", {}, h("select", { "data-u": u.label, "data-t": t.key, "aria-label": `${t.name} of unknown ${u.label}` }, h("option", { value: "" }, "—"), t.options.map(([v, l]) => h("option", { value: v }, l))))),
      h("td", {}, h("select", { "data-u": u.label, "data-t": "id", "aria-label": `Identity of unknown ${u.label}` }, h("option", { value: "" }, "—"), solids.map((id) => h("option", { value: id }, speciesData.species.find((s) => s.id === id).name))))))));
  // ---------- go ----------
  // ---------- the room ----------
  const room = parseRoom(roomDef), P = { x: room.start.x, y: room.start.y, face: room.start.face || "u" };
  const roomCanvas = $("#room"), roomR = createRoomRenderer(roomCanvas, room), visited = new Set();
  let lastMove = 0, lastBlock = -1e9;
  const GROUP_OF = (id) => sources.filter((s) => s.group === id);
  function setView(v) {
    S.view = v; closePanel();
    roomCanvas.hidden = v !== "room"; canvas.hidden = v !== "bench"; $("#controlsCard").hidden = v !== "bench";
    $("#viewHint").textContent = v === "room" ? "Arrow keys or WASD move you along the floor tiles (diagonally on screen). Press E, or click an object next to you, to use it." : "Click a jar to choose it, or a container to select it. Esc returns to the room.";
    log.add("view", { to: v });
  }
  function closePanel() { S.panel = null; $("#panelCard").hidden = true; }
  function renderInv() {
    $("#invCount").textContent = `(${S.inv.length}/6)`;
    $("#inv").replaceChildren(...Array.from({ length: 6 }, (_, i) => { const s = sources.find((x) => x.key === S.inv[i]); return s ? h("div", { class: "slot full" }, h("i", { style: `background:${s.color}` }), s.label.replace(" (known)", "")) : h("div", { class: "slot" }, ""); }));
  }
  function take(key) {
    if (S.inv.length >= 6) return blocked("inventory_full", "Your hands are full (6 jars). Return one to a shelf first.");
    S.inv.push(key); const s = sources.find((x) => x.key === key);
    log.add("take", { jar: key, shown_as: s.label }); say(`You take ${s.label}.`); syncUnit(); renderInv(); renderPanel();
  }
  function putBack(key) {
    S.inv = S.inv.filter((k) => k !== key); log.add("return", { jar: key }); say("You put the jar back on the shelf."); syncUnit(); renderInv(); renderPanel();
  }
  function renderPanel() {
    const t = S.panel; if (!t) return;
    $("#panelCard").hidden = false; $("#panelTitle").textContent = t.type === "shelf" ? t.group : t.type === "locker" ? "Locker" : "Tong rack";
    if (t.type === "shelf") $("#panelBody").replaceChildren(...GROUP_OF(t.group).map((s) => { const has = S.inv.includes(s.key); return h("div", {}, h("span", {}, s.label.replace(" (known)", "")), h("button", { onclick: () => (has ? putBack(s.key) : take(s.key)) }, has ? "Put back" : "Take")); }));
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
    if (document.querySelector("dialog[open]") || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (k === "escape") { if (S.panel) closePanel(); else if (S.view === "bench") setView("room"); return; }
    if (!["lab", "postlab", "done"].includes(S.stage)) return;
    if (k === "n") return openNotebook(); if (k === "t") return openDlg("dlgTheory"); if (k === "m") return openMicro();
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
  function record() {
    collectNotebook();
    return { version: 2, lab: lab.id, student: S.student, mode: S.mode, seed, started: log.started, unknowns, notebook: S.notebook, stage: S.stage, submitted: S.submitted, prelab: S.prelab, cer: S.cerDone ? S.cer : null, safety: S.safety, summary: { blocked_hazards: log.count("hazard"), blocked_procedures: log.count("procedure"), checks: log.count("check") }, events: log.events };
  }
  const fileName = (prefix) => `${prefix}-${(S.student || "student").replace(/\W+/g, "-")}.json`;
  $("#download").addEventListener("click", () => { const r = record(); downloadJSON(fileName("lab-record"), r); });

  // ---------- save and resume ----------
  const SAVE_KEY = "vlab:" + lab.id;
  function snapshot() {
    collectNotebook();
    return { version: 1, lab: lab.id, seed, student: S.student, savedAt: new Date().toISOString(), started: log.started, elapsed: (performance.now() - log.t0) / 1000, events: log.events,
      S: { ppe: S.ppe, inv: S.inv, srcKey: S.srcKey, plateOn: S.plateOn, plateC: S.plateC, safety: S.safety, sel: S.sel, stage: S.stage, prelab: S.prelab, cer: S.cer, submitted: S.submitted, cerDone: S.cerDone, touched: S.touched, nbSeen: S.nbSeen }, P, visited: [...visited], notebook: S.notebook,
      cont: CONT.map((c) => ({ key: c.key, loc: c.loc, slot: c.slot, tare: c.tare, c: c.c })) };
  }
  function autosave() { if (S.demo || S.stage === "intro") return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot())); } catch (e) { /* storage blocked: file save still works */ } }
  function restore(sn, quiet) {
    Object.assign(S.ppe, sn.S.ppe); S.inv = sn.S.inv; S.srcKey = sn.S.srcKey; S.plateOn = sn.S.plateOn; S.plateC = sn.S.plateC; S.safety = sn.S.safety; S.sel = sn.S.sel;
    for (const k of ["stage", "prelab", "cer", "submitted", "cerDone", "touched", "nbSeen"]) if (sn.S[k] !== undefined) S[k] = sn.S[k];
    for (const r of sn.cont) { const c = byKey(r.key); c.loc = r.loc; c.slot = r.slot; c.tare = r.tare; c.c = r.c; }
    Object.assign(P, sn.P); sn.visited.forEach((v) => visited.add(v));
    log.events = sn.events; log.started = sn.started; log.t0 = performance.now() - sn.elapsed * 1000;
    $("#student").value = sn.student || "";
    table.querySelectorAll("select").forEach((x) => { const v = (sn.notebook[x.dataset.u] || {})[x.dataset.t]; if (v) x.value = v; });
    $("#plate").value = S.plateC; syncUnit(); renderPPE(); renderInv(); renderControls(); renderSafety();
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
  $("#print").addEventListener("click", () => {
    const rec = record(), r = buildReport(rec, truth, H), mm = (sec) => `${Math.floor(sec / 60)} min ${sec % 60} s`, mark = (ok) => (ok === null ? "—" : ok ? "✔" : "✘");
    const right = Object.entries(S.prelab.answers).filter(([id, i]) => lab.prelab.questions.find((q) => q.id === id).correct === i).length;
    $("#report").replaceChildren(...[
      h("h1", {}, lab.title), h("p", {}, `${r.student} · ${new Date(r.started).toLocaleString()} · ${r.mode} mode · time in lab ${mm(r.seconds)}`),
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
    if (hit.type === "container") { const c = byKey(hit.key), d = describe(world, c.c); return { name: c.name, blurb: c.kind === "watch" ? "Holds solids only. Never liquid." : `${c.cap} mL. ${c.c.solution.mL > 0 ? c.c.solution.mL.toFixed(0) + " mL inside" : "Empty"}${d.undissolvedG > 0.02 ? ", solid at the bottom" : ""}. ${c.c.T.toFixed(0)} °C. ${c.key === S.sel ? "Click again to zoom in on the particles." : "Click to select."}`, icon: c.kind === "watch" ? "watch" : "beaker" };
    
    }
    const sr = sources.find((x) => x.key === hit.key);
    return { name: sr.label, blurb: sr.key.startsWith("u") ? "One of six white solids. Test it to find out which." : sr.phase === "l" ? "A liquid. Measured in mL." : "Known sample to compare against. Measured in g.", icon: "jar", color: sr.color };
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
  const dlg = (id) => document.getElementById(id), openDlg = (id) => { if (!dlg(id).open) dlg(id).showModal(); }, closeDlg = (id) => { if (dlg(id).open) dlg(id).close(); };
  for (const id of ["dlgIntro", "dlgPrelab"]) dlg(id).addEventListener("cancel", (e) => e.preventDefault());
  document.querySelectorAll("dialog [data-close]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));
  const nbCells = () => [...table.querySelectorAll("select")];
  const nbFilled = () => nbCells().filter((x) => x.value).length;
  function lockTable() { nbCells().forEach((x) => { x.disabled = S.submitted; }); const b = $("#nbSubmit"); if (b) b.hidden = S.submitted; $("#nbDone").hidden = !S.submitted; }
  function openNotebook() {
    S.nbSeen = log.events.filter((e) => e.type === "conductivity" || e.type === "observe").length; log.add("notebook_open");
    updateNb(); openDlg("dlgNotebook");
  }
  let confirmSubmit = false;
  function updateNb() {
    const n = nbFilled(), tot = nbCells().length, b = $("#nbSubmit"); if (!b) return;
    b.disabled = n < tot; b.textContent = confirmSubmit ? "Really submit? You cannot change answers after." : "Submit answers";
    $("#nbCount").textContent = S.submitted ? "Submitted." : `${n} of ${tot} boxes filled. No answer check: retest anything you doubt before you submit.`;
  }
  table.addEventListener("change", () => { confirmSubmit = false; updateNb(); });
  $("#nbSubmit").addEventListener("click", () => {
    if (!confirmSubmit) { confirmSubmit = true; return updateNb(); }
    collectNotebook(); S.submitted = true; S.stage = "postlab"; lockTable(); log.add("submit", { notebook: S.notebook }); closeDlg("dlgNotebook");
    say("Answers submitted. Now write your Claim, Evidence, Reasoning.", "obs"); openCER();
  });
  function openCER() { renderCER($("#cerBody"), stageCtx); openDlg("dlgCER"); }
  const stageCtx = {
    lab, S, seed, unknowns,
    getNotebook: () => { collectNotebook(); return S.notebook; },
    onDemo: () => demoStart(),
    onIntroDone: (name) => { S.student = name; S.stage = "prelab"; log.add("stage", { to: "prelab", name }); closeDlg("dlgIntro"); renderPrelab($("#prelabBody"), stageCtx); openDlg("dlgPrelab"); },
    onAnswer: (id, choice, correct) => log.add("prelab_answer", { q: id, choice, correct }),
    onPrelabDone: () => { S.stage = "lab"; log.add("prelab_done", { prediction: S.prelab.prediction }); closeDlg("dlgPrelab"); renderQuests(); say("Pre-lab done. The lab door will open once you have goggles and an apron."); },
    onCerDone: (c) => { S.cer = c; S.cerDone = true; S.stage = "done"; log.add("cer", c); closeDlg("dlgCER"); openDlg("dlgDone"); },
    onCerClose: () => closeDlg("dlgCER")
  };
  $("#theoryBody").replaceChildren(...theoryNodes(lab));
  $("#btnTheory").addEventListener("click", () => openDlg("dlgTheory")); $("#btnNotebook").addEventListener("click", openNotebook);
  $("#btnMicro").addEventListener("click", () => openMicro()); $("#btnDemo").addEventListener("click", () => demoStart());
  $("#btnMenu").addEventListener("click", () => openDlg("dlgMenu")); $("#btnCER").addEventListener("click", openCER);
  $("#doneMenu").addEventListener("click", () => { closeDlg("dlgDone"); openDlg("dlgMenu"); });

  // quest list and coach bar
  let qsig = "";
  function renderQuests() {
    const st = { ppe: S.ppe, notebookFilled: nbFilled(), submitted: S.submitted, cerDone: S.cerDone };
    const items = lab.quests.map((q) => ({ q, done: questDone(q, log.events, st), prog: questProgress(q, log.events, st) }));
    const ai = items.findIndex((i) => !i.done), stage = S.stage, obs = log.events.filter((e) => e.type === "conductivity" || e.type === "observe").length;
    const sig = stage + "|" + items.map((i) => (i.done ? 1 : 0) + ":" + (i.prog ?? "")).join("|") + "|" + (obs > S.nbSeen);
    $("#nbDot").hidden = !(obs > S.nbSeen) || S.submitted; $("#btnCER").hidden = stage !== "postlab";
    if (sig === qsig) return; qsig = sig;
    const doneN = items.filter((i) => i.done).length, from = Math.max(0, (ai < 0 ? items.length : ai) - 1), shown = items.slice(from, from + 5);
    $("#questHead").textContent = `Tasks (${doneN} of ${items.length})`;
    $("#quests").replaceChildren(...shown.map((i) => h("li", { class: i.done ? "done" : i === items[ai] ? "active" : "" }, h("span", { class: "tick" }, i.done ? "✔" : i === items[ai] ? "▶" : "○"), " ", i.q.text, i.q.count > 1 && i.prog !== null && !i.done ? ` (${i.prog}/${i.q.count})` : "")), ...(items.length - from - 5 > 0 ? [h("li", { class: "more" }, `+ ${items.length - from - 5} more`)] : []));
    $("#coachText").textContent = stage === "intro" || stage === "prelab" ? "Finish the pre-lab. The lab door stays locked until you do." : stage === "done" ? "Lab complete. Open Save / Print to hand in your record." : stage === "postlab" && ai < 0 ? "Write your CER with the button at the top." : ai >= 0 ? items[ai].q.hint : "All tasks done.";
  }

  // microscope: click a container twice (or press M) to zoom in
  const micro = createMicroView($("#microCanvas"), (m) => $("#microLegend").replaceChildren(...legend(m).map((l) => h("li", {}, h("i", { style: `background:${l.color}` }), l.text))));
  function openMicro(key) {
    if (!S.demo && !["lab", "postlab", "done"].includes(S.stage)) return;
    const c = byKey(key || S.sel), anon = !S.submitted && (S.touched[c.key] || []).some((k) => k.startsWith("u"));
    $("#microTitle").textContent = `${c.name} under the microscope`; $("#microNote").textContent = anon ? "Particle names are hidden while your unknowns are unidentified. Colors show charge: blue +, red −." : "";
    log.add("micro", { container: c.key });
    micro.open(() => microModel(world, c.c, speciesData.micro, { fizz: c.fizz, anon }), c.name); openDlg("dlgMicro");
  }
  dlg("dlgMicro").addEventListener("close", () => micro.close());

  // scripted demo: runs on the real room and bench, then restores the student's own state
  const demoApi = {
    demo: { running: false, stop() {} },
    freeze() {
      const snap = structuredClone(snapshot()), extra = { feed: S.feed.slice(), view: S.view };
      S.demo = true; demoApi.demo.running = true;
      Object.assign(S.ppe, { goggles: false, apron: false, tongs: false }); S.inv = []; S.panel = null; S.plateOn = false; S.touched = {}; visited.clear();
      Object.assign(P, { x: room.start.x, y: room.start.y, face: "u" });
      CONT.forEach((c, i) => { c.c = newContainer(c.name, c.cap); c.tare = 0; c.fizz = 0; c.loc = "bench"; c.slot = i; }); S.sel = "b1";
      document.querySelectorAll("dialog[open]").forEach((d) => d.close()); setView("room"); renderPPE(); renderInv(); syncUnit();
      return { snap, extra };
    },
    thaw({ snap, extra }) {
      demoApi.removePractice(); visited.clear(); restore(snap, true); S.feed = extra.feed; renderFeed();
      S.demo = false; demoApi.demo.running = false; $("#demoBar").hidden = true; document.querySelectorAll("dialog[open]").forEach((d) => d.close());
      setView(extra.view); renderPPE(); renderInv(); renderControls(); syncUnit(); qsig = "";
    },
    caption(n, text) { $("#demoBar").hidden = false; $("#demoText").textContent = `Demo ${n} of 9 · ${text}`; },
    walk: (d) => walk(d[0], d[1]), interact: () => interact(facingTile(room, P)), closePanel, togglePPE, take,
    addPractice() {
      world.species.set("practice", { id: "practice", name: "Practice salt (NaI)", formula: "NaI", phase: "s", solubility: 184, color: "#f4f4f0", heatEvents: [] });
      EL.NaI = { type: "strong", lambda: 100 }; speciesData.micro.NaI = { kind: "ionic", label: "NaI", ions: [{ label: "Na⁺", color: "#e0a030", per: 1 }, { label: "I⁻", color: "#7a3b9c", per: 1 }] };
      sources.push({ key: "practice", id: "practice", label: "Practice salt", short: "Salt", group: "Practice", phase: "s", shelf: 0, idx: 0, color: "#f4f4f0" });
      S.inv.push("practice"); renderInv(); syncUnit();
    },
    removePractice() { world.species.delete("practice"); delete EL.NaI; delete speciesData.micro.NaI; const i = sources.findIndex((x) => x.key === "practice"); if (i >= 0) sources.splice(i, 1); },
    act: { moveTo, tare, stir, conduct, add: addSubstance, pick: (key, amt) => { S.srcKey = key; syncUnit(); $("#amt").value = amt; } },
    openMicro: () => openMicro("b1"), closeMicro: () => closeDlg("dlgMicro"), openNotebook: () => { updateNb(); openDlg("dlgNotebook"); }, closeNotebook: () => closeDlg("dlgNotebook")
  };
  $("#demoStop").addEventListener("click", () => demoApi.demo.stop());
  async function demoStart() {
    if (S.incident) return say("Finish the incident first.", "warn");
    const wasIntro = dlg("dlgIntro").open; if (wasIntro) { S.student = $("#student").value.trim(); closeDlg("dlgIntro"); }
    await runDemo(demoApi);
    if (S.stage === "intro") { renderIntro($("#introBody"), stageCtx); openDlg("dlgIntro"); }
  }
  const intro = () => { renderIntro($("#introBody"), stageCtx); openDlg("dlgIntro"); };

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
    stepAll(dt); tickIncident(now);
    if (S.view === "room") roomR.draw(P, S.ppe, hasPPE(S.ppe), facingTile(room, P), (now - t0) / 1000); else renderer.draw(view(), (now - t0) / 1000);
    if (now - lastCtl > 250) { renderControls(); renderQuests(); lastCtl = now; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__vl = { H, S, P, room, take, CONT, sources, unknowns, truth, world, seed, log, actions: { moveTo, addSubstance, stir, tare, conduct, empty, skip, setPlate, togglePPE }, stageCtx, demoApi, openMicro, openNotebook, openCER, quests: () => lab.quests, nbCells, select: (k) => { S.sel = k; }, source: (k) => { S.srcKey = k; syncUnit(); } };
}

boot();
