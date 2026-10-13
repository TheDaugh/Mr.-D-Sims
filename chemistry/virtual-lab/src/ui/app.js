// Bench + lab sheet for Lab 1. Chemistry comes from the engine and content files, never from this file.
import { buildWorld, newContainer, add, advance, heat, conductivity, describe, dissolvedGrams, massAccounting } from "../engine/sim.js";
import { fingerprint } from "../engine/lab1.js";
import { Log, downloadJSON } from "../log.js";
import { createRenderer, SLOTS } from "./render.js";

const $ = (s) => document.querySelector(s);
function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in props) {
    if (k === "class") e.className = props[k];
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), props[k]);
    else if (props[k] !== false && props[k] != null) e.setAttribute(k, props[k] === true ? "" : props[k]);
  }
  for (const kid of kids.flat()) if (kid != null) e.append(kid.nodeType ? kid : document.createTextNode(kid));
  return e;
}
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const SHORT = { NaCl: "Salt", sucrose: "Sugar", NaHCO3: "B.Soda", CaCO3: "Chalk", starch: "Starch", citric: "Citric", water: "Water", vinegar: "Vinegar", iodine: "Iodine" };

async function boot() {
  try {
    const urls = ["content/species.json", "content/reactions.json", "content/labs/01-unknown-solids.json"];
    const [species, reactions, lab] = await Promise.all(urls.map((u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); })));
    start(species, reactions, lab);
  } catch (e) {
    $("#boot").replaceChildren(h("p", {}, "This lab has to be opened from the web (GitHub Pages) or a local server. Double-clicking the file does not work because browsers block the files it loads."), h("p", { class: "hint" }, String(e.message || e)));
  }
}

function start(speciesData, reactionData, lab) {
  const world = buildWorld(speciesData, reactionData);
  const EL = speciesData.electrolytes;
  const solids = speciesData.species.filter((s) => s.phase === "s").map((s) => s.id);
  const params = new URLSearchParams(location.search);
  const seed = params.get("seed") ? parseInt(params.get("seed"), 10) : Math.floor(Math.random() * 1e9);
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

  const S = { sel: "b1", srcKey: sources[0].key, ppe: { goggles: false, apron: false, tongs: false }, plateOn: false, plateC: 150, bulb: null, bulbUntil: 0, feed: [], notebook: {}, student: "" };
  const byKey = (k) => CONT.find((c) => c.key === k);

  // ---------- feedback and rules ----------
  function say(text, kind = "info") { S.feed.unshift({ text, kind, t: log.events.length ? log.events[log.events.length - 1].t : 0 }); S.feed = S.feed.slice(0, 40); renderFeed(); }
  function hazard(id, text) { log.add("hazard", { id, mode: "guided", outcome: "blocked" }); say(text, "stop"); }
  function blocked(id, text) { log.add("procedure", { id, outcome: "blocked" }); say(text, "warn"); }
  function ppeOk() {
    if (S.ppe.goggles && S.ppe.apron) return true;
    hazard("no_ppe", "Stop. Put on goggles and an apron before you touch anything in the lab.");
    return false;
  }
  const cur = () => byKey(S.sel);
  function rawMass(c) { return c.empty + massAccounting(world, c.c).inside; }

  // ---------- actions ----------
  function moveTo(loc) {
    if (!ppeOk()) return;
    const c = cur();
    if (c.loc === loc) return;
    if (c.c.T > 50 && !S.ppe.tongs) return hazard("hot_container", `Stop. ${c.name} is ${Math.round(c.c.T)} °C. Equip the tongs before you move it.`);
    if ((loc === "balance" || loc === "hotplate") && CONT.some((o) => o !== c && o.loc === loc)) return blocked("station_busy", `The ${loc === "balance" ? "balance" : "hot plate"} is in use. Move the other container off first.`);
    if (loc === "bench") { const used = CONT.filter((o) => o !== c && o.loc === "bench").map((o) => o.slot); c.slot = [0, 1, 2].find((s) => !used.includes(s)); }
    log.add("move", { container: c.key, from: c.loc, to: loc });
    c.loc = loc;
    say(`${c.name} is on the ${loc === "hotplate" ? "hot plate" : loc}.`);
  }
  function addSubstance() {
    if (!ppeOk()) return;
    const c = cur(), src = sources.find((s) => s.key === S.srcKey), amt = parseFloat($("#amt").value);
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
    catch (e) { if (e.code === "OVERFLOW") { hazard("overflow", `Stop. That would overflow ${c.name} (${c.cap} mL). Nothing was added.`); return; } throw e; }
    log.add("add", { container: c.key, substance: src.id, shown_as: src.label, amount: amt, unit: src.phase === "s" ? "g" : "mL" });
    say(`Added ${amt} ${src.phase === "s" ? "g" : "mL"} of ${src.label} to ${c.name}.`);
  }
  function stir() {
    if (!ppeOk()) return;
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
    if (!ppeOk()) return;
    const c = cur();
    if (c.c.T > 50 && !S.ppe.tongs) return hazard("hot_container", `Stop. ${c.name} is ${Math.round(c.c.T)} °C. Equip the tongs first.`);
    c.c = newContainer(c.name, c.cap); c.tare = 0; c.fizz = 0;
    log.add("empty", { container: c.key }); say(`${c.name} is emptied and rinsed.`);
  }
  function skip(seconds) {
    if (!ppeOk()) return;
    for (let i = 0; i < seconds; i++) stepAll(1);
    log.add("wait", { seconds }); say(`${seconds} seconds pass.`);
  }
  function setPlate(on, c) {
    if (!ppeOk()) return;
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
      sources, selectedSource: S.srcKey, plateOn: S.plateOn, plateC: S.plateC,
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
    if (hit.type === "container") { S.sel = hit.key; renderControls(); } else { S.srcKey = hit.key; $("#src").value = hit.key; syncUnit(); }
  });

  const ppeBox = $("#ppe");
  function renderPPE() {
    ppeBox.replaceChildren(...[["goggles", "Goggles"], ["apron", "Apron"], ["tongs", "Tongs"]].map(([k, name]) =>
      h("button", { "aria-pressed": S.ppe[k], class: S.ppe[k] ? "primary" : "", onclick: () => togglePPE(k) }, (S.ppe[k] ? "✓ " : "") + name)));
  }

  const srcSel = h("select", { id: "src", "aria-label": "Substance", onchange: (e) => { S.srcKey = e.target.value; syncUnit(); } },
    ["Unknown samples", "Liquids", "Known samples"].map((g) => h("optgroup", { label: g }, sources.filter((s) => s.group === g).map((s) => h("option", { value: s.key }, s.label)))));
  function syncUnit() { const s = sources.find((x) => x.key === S.srcKey); $("#unit").textContent = s.phase === "s" ? "g" : "mL"; srcSel.value = S.srcKey; }

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
    $("#feed").replaceChildren(...S.feed.map((f) => h("li", { class: "f-" + f.kind }, f.text)));
  }

  // ---------- lab sheet ----------
  $("#title").textContent = lab.title;
  $("#intro").textContent = lab.intro;
  $("#steps").replaceChildren(...lab.steps.map((s) => h("li", {}, s)));
  $("#tests").replaceChildren(...lab.tests.map((t) => h("li", {}, h("b", {}, t.name + ". "), t.how)));
  const table = $("#table");
  table.replaceChildren(
    h("thead", {}, h("tr", {}, h("th", {}, "Sample"), lab.tests.map((t) => h("th", {}, t.name)), h("th", {}, "I think it is"))),
    h("tbody", {}, unknowns.map((u) => h("tr", { "data-u": u.label },
      h("th", { scope: "row" }, "Unknown " + u.label),
      lab.tests.map((t) => h("td", {}, h("select", { "data-u": u.label, "data-t": t.key, "aria-label": `${t.name} of unknown ${u.label}` }, h("option", { value: "" }, "—"), t.options.map(([v, l]) => h("option", { value: v }, l))))),
      h("td", {}, h("select", { "data-u": u.label, "data-t": "id", "aria-label": `Identity of unknown ${u.label}` }, h("option", { value: "" }, "—"), solids.map((id) => h("option", { value: id }, speciesData.species.find((s) => s.id === id).name))))))));
  function check() {
    let right = 0, wrongCells = 0, filled = 0;
    for (const u of unknowns) {
      const row = table.querySelector(`tr[data-u="${u.label}"]`);
      row.querySelectorAll("select").forEach((sel) => {
        sel.classList.remove("ok", "bad");
        const v = sel.value; if (!v) return; filled++;
        const t = sel.dataset.t, correct = t === "id" ? u.id : truth[u.id][t];
        if (v === correct) { sel.classList.add("ok"); if (t === "id") right++; } else { sel.classList.add("bad"); wrongCells++; }
      });
    }
    log.add("check", { identified_correct: right, wrong_cells: wrongCells, filled });
    const msg = right === 4 && wrongCells === 0 ? "All four identified and every observation matches. Download your lab record." :
      right === 4 ? "All four identities are right, but some recorded observations don't match. Retest the cells marked in red." :
      `${right} of 4 identified correctly. Cells in red don't match what the test should show. Retest them before changing an answer.`;
    $("#result").textContent = msg; $("#result").className = "fb show " + (right === 4 && wrongCells === 0 ? "ok" : "no");
  }
  $("#check").addEventListener("click", check);
  $("#download").addEventListener("click", () => {
    S.student = $("#student").value.trim();
    S.notebook = {}; table.querySelectorAll("select").forEach((s) => { (S.notebook[s.dataset.u] ||= {})[s.dataset.t] = s.value; });
    downloadJSON(`lab-record-${(S.student || "student").replace(/\W+/g, "-")}.json`, { version: 1, lab: lab.id, student: S.student, seed, started: log.started, unknowns, notebook: S.notebook, summary: { blocked_hazards: log.count("hazard"), blocked_procedures: log.count("procedure"), checks: log.count("check") }, events: log.events });
  });

  // ---------- go ----------
  syncUnit(); renderPPE(); renderControls(); renderFeed();
  say("Welcome. Start by putting on goggles and an apron.");
  $("#boot").hidden = true; $("#app").hidden = false;
  let last = performance.now(), t0 = last, lastCtl = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    stepAll(dt);
    renderer.draw(view(), (now - t0) / 1000);
    if (now - lastCtl > 250) { renderControls(); lastCtl = now; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__vl = { S, CONT, sources, unknowns, truth, world, seed, log, actions: { moveTo, addSubstance, stir, tare, conduct, empty, skip, setPlate, togglePPE, check }, select: (k) => { S.sel = k; }, source: (k) => { S.srcKey = k; syncUnit(); } };
}

boot();
