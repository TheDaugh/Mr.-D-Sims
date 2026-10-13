# Virtual Lab: build plan

A tile-based chemistry lab. Students walk a lab room, find equipment and reagents, suit up, carry things to a bench, run the experiment, and hand in a record of what they actually did. Inspired by ChemCollective's VLab, but with a room to explore and real consequences for sloppy setup.

Read sections 1 to 3 first. They hold the decisions. The rest is the build order.

---

## 1. Decisions

### Where do assignments live? In the sim, with a printable report out the back.

| | In-sim checkers | PDF handout (PhET style) |
|---|---|---|
| Sees what students *did* | Yes: every action is logged | No: only the answers they wrote |
| Auto-checks setup (right glassware, right order, PPE) | Yes | No |
| Saves progress | Yes (see 3) | No |
| Easy to print / paste into LMS | Needs an export | Native |

The sim is the only place the *procedure* can be graded, and procedure is the point of this lab. So: instructions and checkpoints live in the sim, and the sim produces a one-page lab report (their data, their calculations, a safety summary) that they can print or upload. A PDF handout can still exist for background reading, but it is not where grading happens.

### Safe vs. unsafe: the teacher sets it, the student never toggles it.

Three modes, chosen by the assignment link (`?mode=guided`) and locked by a teacher code:

1. **Guided** (default). An unsafe action is blocked with the reason: *"You can't pour acid into water you haven't labeled. Goggles first."* Nothing blows up.
2. **Consequences.** Unsafe actions are allowed and the sim shows what really happens (splash, burn, fire, shattered glass). The student gets an incident report, loses the run's safety points, and restarts that step. This is the mode that teaches.
3. **Sandbox.** Everything open, explosions included. Off unless the teacher enables it. Recommended use: unlocks only *after* the student submits the assignment, as a reward.

Why not a student toggle at entry: a student who can pick will pick the fun one. The link carries the mode, so you control it per class period.

Why the disruption problem mostly solves itself in Consequences mode: each incident costs a cooldown (8-second "reset the bench" wait), an incident report to fill in, and a logged penalty. Blowing things up stops being free.

### Saving and visibility: static first, with a drop-in upgrade.

GitHub Pages serves files and stores nothing. So:

- **Progress:** autosave to the browser (`localStorage`) every action, plus a **Save code** button that exports the whole run as a text string/file, and **Load** to restore it. Shared Chromebooks work because the code travels with the student.
- **Handing in:** the sim downloads a `lab-record.json` and the printable report. Students upload both to Google Classroom or Drive.
- **Seeing it:** a small static `teacher.html` loads those JSON files and shows each student's timeline, PPE check, incidents, and answers.
- **Live view later:** the event log (section 7) is already a stream of small JSON events. Posting them to a Google Apps Script web app that writes to a Sheet is a ~40-line change, no new server. Design for it now, build it only if you want it.

Be honest about the limit: a static site cannot stop a determined student from editing the URL or the saved file. For a class activity that is acceptable. For high-stakes grading, add the Sheet logging and compare.

### Tile-based room, not tile-based experiments.

Two layers:

1. **Overworld** (tiles): a top-down lab. Walk with arrows/WASD or tap. Find the reagent shelves, the fume hood, balances, hot plates, sink, eyewash, shower, fire extinguisher, first-aid kit, waste containers, the PPE locker by the door. Pick items up into a 6-slot inventory (you cannot carry the whole stockroom).
2. **Bench** (a close-up screen, not tiles): you stand at a station and the view switches to the work surface. Place glassware on slots, pour/transfer, weigh, heat, measure. Drag-and-drop with click-to-place as the mobile fallback.

This keeps the "locate the equipment" fun without making titration a puzzle of moving sprites.

### Explosions: consequences of specific mistakes, from a short vetted list.

Hazards model standard school-lab safety failures, each tied to a real cause: acid added to water the wrong way, flammables near a flame, heating a sealed container, bleach + ammonia cleaners, alkali metal in water, overheating a test tube, no goggles. Each has a trigger condition, a severity, an animation, and a "what went wrong and why" screen. The sim does **not** model synthesis or optimization of energetic materials. That is both a safety line and a scope line.

---

## 2. Chemistry accuracy rules

"It must be accurate" is the hardest requirement, so it gets rules, not hope.

1. **Closed-world stockroom.** Each lab ships a small, fixed list of substances (8 to 12). Every pair is enumerated in a reaction table that you review. 10 substances = 45 pairs. A pair not listed does not silently mean "nothing happens"; the build fails.
2. **Data, not code.** Substances and reactions are JSON. The engine never contains chemistry facts.
3. **Every reaction row has:** reactants, products, balanced equation, ΔH (kJ/mol), observations (color, precipitate, gas, temperature change), speed (instant / slow / needs heat), hazards, and a `source` field (textbook page, CRC, SDS).
4. **Tests.** Node tests assert known results: mass conservation, charge balance, limiting reactant, ΔT for a known calorimetry case, pH of 0.10 M HCl = 1.00, 0.10 M acetic acid ≈ 2.88. A reaction that fails balance cannot ship.
5. **Fidelity tiers per lab.** Tier 1 = qualitative (what you see). Tier 2 = quantitative (moles, ΔT from ΔH, pH from equilibrium). Each lab declares its tier so the engine does not pretend to more precision than the data supports.
6. **Teacher review file.** The build emits a readable table of every reaction and observation for you to check before students see it.

### Engine model

State is plain data:

```js
state = {
  containers: [{ id, type: "beaker250", contents: { H2O_l: 1.39, NaCl_aq: 0.05 }, T: 22.0, V_mL: 50 }],
  inventory: [...], ppe: { goggles: true, apron: true, gloves: false },
  log: [ /* events, section 7 */ ]
}
```

Rule modules, each a pure function `(container) -> container + events`:

- precipitation (solubility rules, Ksp for the labs that need it)
- acid–base (strong; weak via a charge-balance solve for [H⁺])
- single replacement (activity series)
- combustion / decomposition (needs heat)
- thermal (reuse the heating-curve engine already in `heating-curve.html`: specific heat, latent heat)
- calorimetry (energy balance, already built in `specific-heat.html`)

---

## 3. Folder layout

```
chemistry/virtual-lab/
  PLAN.md
  index.html            entry; reads ?lab= and ?mode=
  src/
    engine/             pure logic, no DOM, testable in Node
      species.js  reactions.js  rules/*.js  thermal.js  hazards.js
    ui/
      overworld.js      tile map, player, interactions, inventory
      bench.js          close-up work surface
      hud.js            instructions, checklist, safety status
    save.js  log.js  report.js
  content/
    species.json  reactions.json
    rooms/main-lab.json          tile map + object placement
    labs/01-unknown-solids.json  assignment: steps, checkpoints, questions
  teacher.html          loads lab-record.json files
  test/                 Node tests for the engine
```

One catch: browsers refuse ES modules opened by double-click (`file://`). The existing sims work by double-click; this one will not unless it is bundled. Pick one:
- **Recommended:** a tiny `esbuild` step that outputs one `dist/virtual-lab.html`, committed, so it works anywhere and on Pages.
- Or: no build; use Pages or `python3 -m http.server` locally.

---

## 4. Overworld details

- 16×16 px tiles scaled up, drawn on one `<canvas>`. Sprites drawn in code or a single small sprite sheet, no external assets.
- Map is JSON: layers `floor`, `walls`, `objects` (each with `id`, `type`, `interact`). Collision is a flag per tile type.
- Interactions: stand adjacent, press **E** or tap. Each object type has a handler: `shelf` (pick a reagent bottle, label visible), `station` (open bench), `locker` (PPE), `sink`, `hood`, `eyewash`, `extinguisher`, `waste`.
- **PPE gate:** the lab door is a trigger tile. Without goggles + apron (+ gloves for lab steps that say so), the player is stopped with a message. Hair-tie and closed-toe-shoes checks optional.
- Safety equipment is findable and *usable*: acid on skin → player must reach the eyewash/shower in time, or the incident escalates. Students who scouted the room do better. That rewards exploring.

## 5. Bench details

- Stations: balance, hot plate, fume hood, general bench. Each has slots.
- Equipment catalog (v1): beaker (50/100/250), Erlenmeyer, graduated cylinder, test tubes + rack, dropper, stir rod, thermometer, balance + weigh boat, spatula, hot plate, tongs, watch glass, wash bottle.
- Actions: pour (volume by hold or number entry), add solid (mass on balance first), stir, heat (hot plate dial), measure (thermometer, pH paper/meter, balance), label.
- Mistakes the engine can see: unlabeled container, wrong glassware for the volume, reading a graduated cylinder wrong (meniscus), heating a closed vessel, adding water to acid, cross-contaminating a dropper (dirty-tool flag).

## 6. Hazard system

```js
{ id: "acid_into_water_wrong", when: (ctx) => ..., severity: "burn",
  guided: "Add acid slowly to water, never the reverse.",
  consequence: { anim: "splash", injury: "chemical burn", needs: ["eyewash"] },
  why: "Dilution releases heat. Adding water to concentrated acid can boil locally and spatter." }
```

Mode handling lives in one place: `if (hazard.fires) { mode === "guided" ? block(hazard.guided) : consequence(hazard) }`. Sandbox adds the bigger animations.

## 7. Event log and report

Every action appends one small JSON event. The log is the grading record, the teacher view, and the future live feed.

```json
{ "t": 214.5, "type": "pour", "from": "bottle_HCl", "to": "beaker_1", "mL": 25.0, "ctx": { "ppe": ["goggles","apron"], "station": "bench2" } }
{ "t": 230.1, "type": "hazard", "id": "no_goggles_at_bench", "mode": "guided", "outcome": "blocked" }
{ "t": 410.0, "type": "checkpoint", "id": "s3_mass_recorded", "value": 5.02, "ok": true }
```

`report.js` turns the log + answers into a printable page: setup checklist, data table, calculations, incidents and what caused them.

## 8. Build order (each step is usable on its own)

| # | Milestone | Done when |
|---|---|---|
| 0 | Data format + engine + Node tests, no UI | `npm test` passes; every substance, reaction and pair reviewed by you (`npm run gate` passes). **Status: code and tests done (13 passing); 9 substances, 5 reactions and 36 pairs await your review in `content/REVIEW.md`.** Lab 1 uses 9 substances, so 36 pairs, not 45. |
| 1 | Bench view + one lab, no room yet | A student can complete Lab 1 at the bench; log is produced. **Status: built and browser-tested (17 tests passing). Needs http(s) to run, not a double-click.** |
| 2 | Overworld + inventory + PPE gate | Student walks, suits up, finds reagents, reaches the bench. **Status: built and browser-tested (23 tests passing). Room is isometric (decided by Ian). One bench station for now; separate balance/hot-plate stations can come later.** |
| 3 | Hazards + the three modes + incident report | Same mistake is blocked in Guided, punished in Consequences |
| 4 | Save code, lab-record export, report, `teacher.html` | You can open a class's records and see who did what |
| 5 | More labs, bundling to one file, polish | Unit 3+ labs added by editing JSON only |

**Recommended Lab 1:** *Identify unknown white solids* (density by displacement, solubility in water, conductivity, melting behavior, a simple acid test). It fits Unit 2, exercises the stockroom, balance, and glassware, and needs almost no reaction chemistry, so you can prove the room, bench, log and modes before the reaction engine has to carry weight. Reaction-heavy labs (precipitation, neutralization, single replacement) follow at Milestone 5.

## 9. Risks worth knowing now

- **Scope.** The room + bench + engine + modes is a real application. Milestones 0 to 1 give you something playable quickly; the room is the part you can cut or delay without losing the lab.
- **Accuracy is a content problem, not a coding problem.** The review file in section 2 is where your time goes.
- **No server.** Section 1's limits apply. Decide early if you want the Google Sheet logging.
- **Devices (decided):** school Chromebooks only, no phone support. Keyboard (WASD/arrows + E) for the room, mouse/trackpad drag for the bench, touchscreen taps work as a bonus. No on-screen d-pad, and the layout targets a laptop screen (about 1366×768) instead of a phone.

## 10. Open questions

1. ~~Devices~~ Decided: Chromebooks only.
2. Do you use Google Classroom or Drive for turning work in? (Decides the hand-in path and whether Sheet logging is worth it.)
3. Which class and unit does the first real lab serve? (I assumed Unit 2, unknown solids.)
4. Do you want the teacher code to be a single class code or one per period?
