# The virtual lab standard

Every virtual lab (chemistry, physics, any course) follows this. A "sim" day IS a virtual lab: never a guided lesson page (that format is retired for physics and chemistry; Ian, 2026-11-11). If a lab or a note disagrees, this file wins; where it disagrees with `docs/LESSON-STANDARD.md` on huddles, labs follow the guided lessons (two huddle codes, one daily code, called by the clock).

## What lives here (`shared/virtual-lab/`)

| File | Purpose |
|---|---|
| `clock.js` | The global huddle clock: huddle 1 at minute 3, huddle 2 at minute 25 of the period, from the bell, never from when a student started. A lab may set `clock.huddle1AtMin` / `clock.huddle2AtMin` later in its content (lab days that need the data first do). |
| `quests.js`, `room.js`, `hazards.js`, `active.js`, `integrity.js`, `log.js`, `mode.js` | Generic engine: quest rules, the tile room and PPE door, hazards, active time, the event log, guided / consequences / sandbox mode. No chemistry or physics facts. |
| `dom.js`, `fit.js`, `guide.js`, `chest.js`, `roomview.js`, `icons.js`, `badge.js`, `stage.css` | The one-screen stage, tutorial arrows, chest screens, the isometric room, icons. |

The host page is still `chemistry/virtual-lab/src/ui/app.js`. Labs from another folder plug in through `window.VLAB_HOST` (see `physics/virtual-lab/src/host.js`). Lab-specific code, content and tests stay in the lab's own folder.

## What every lab has

1. **A demo.** An intro button "Watch the demo" that plays a scripted tour on the real room and bench and keeps nothing (`src/ui/demo.js`, or `demo()` in the lab module). Students need it.
2. **A creative mode: `#key`.** Add `#key` to the address: no name screen, no pre-lab, no huddle stops, goggles and apron on, locked mode off, everything open, a Key button with the answers and the huddle guide. Adding or removing `#key` on an open page restarts it in the right mode. The host does this for every lab; a lab only supplies its Key rows and, if it needs, what "everything open" means (for example, unknown bottles unlocked).
3. **The global huddle clock** (if the lab has huddles). Two codes, both `MrD.codes.gate(...)` (one code a day). Huddle 1 is called at minute 3, huddle 2 at minute 25, by the bell. Outside class (home, after 3 PM) a huddle is a note, never a stop. Labs 1 to 3 (unknown solids, heating, gold foil) predate huddles and do not have them yet; add them when Ian asks for those labs to be rebuilt.
4. **A teacher guide in the Key**: both codes, the huddle 1 script, the huddle 2 definitions, worked solutions, crux questions with the wrong answers to expect, the exit ticket, and the answers to every item. Copied from the day sheet, not invented.
5. **Locked mode** (`lock: true`; `shared/lock.js`), no stamp, no report code, no tiers on the student page, three hidden bands where there are items.
6. **A paper fallback page** if the sheet asks for one.
7. **A word rule test**: chemistry (or physics) words on a student screen must be in the sheet's term list.

## Before you say a lab is done

- `cd chemistry/virtual-lab && npm test`, `cd physics/virtual-lab && npm test`, `node --test tests/unit/*.test.js`.
- `TZ=America/New_York node tests/vlab-standard.e2e.js` (demo, `#key`, the huddle clock, on every lab) and `TZ=America/New_York node tests/lock.e2e.js "virtual lab"`; add the new lab to the `LABS` list in the first and the `TARGETS` in the second.
- The lab's own e2e, and `node tests/smoke.js`.
- A card in the hub list (`chemistry/labs.js` or `physics/sims.js`), a `PLAN.md` line, a `PROGRESS.md` entry.
- It is live only when merged to `main` (Netlify deploys `main` only). Say so, and give the direct URL.

## Length is Ian's call, per lab

A lab is as long or as short as Ian says for that day. Put it in the lab JSON as `lengthMin` (slot 15 is 20) and let it drive everything else: `minActiveMin`, and where the huddle falls (the middle, `lengthMin / 2`). `?min=NN` on the address overrides it for one class without a code change (`engine/zeff-lab.js`, `lengthOf`). Never hard-code 30 to 35 minutes, 42 minutes or a 50-minute table into a lab's text. A short lab is shorter in what it asks (fewer required quests, one idea), never rushed.

## One huddle on a sim day

A sim day has ONE huddle, in the middle, as a notes huddle: students look up and copy what Mr. D writes on the lesson board (`chemistry/whiteboard/index.html#lesson=<id>`) into blanks. Nothing is taught at minute 3 or 25. Set `clock: { huddle1AtMin: 999, huddle2AtMin: mid }` on the kind (huddle 1 never fires; the single huddle uses the shared huddle-2 slot) and use the day's first code (`MrD.codes.gateV3(id, "h1")`), labeled "Huddle code". See `chemistry/virtual-lab/src/ui/zeff.js`.

## Choosing how students interact (use only what the lab needs)

Pick the interaction from the idea, not from a menu habit. One or two per lab is plenty; most labs need no drag and drop. All of these must work with a mouse, a trackpad and the keyboard on a Chromebook.

| Interaction | Use it when | Not when |
|---|---|---|
| **Drag and drop** (move a piece, a weight, an electron, a block onto a target; snap to slots; click-to-place as the fallback) | The idea is about placing or arranging: filling an energy ladder, building an atom or molecule, stacking, balancing, sorting into groups, wiring a circuit | The idea is a number changing. A slider is quicker |
| **Slider or dial** that changes one variable live | The idea is "what happens as this goes up": force, charge, light color, distance, temperature | There is nothing to see change in real time |
| **Pick from a grid or carousel** (elements, samples, objects) | Many similar things to compare; the student chooses the order | The order matters and must be taught |
| **Drag a handle on a graph or diagram** (move a point, a line, a bar, a peak) | The student should draw or fit a relationship before it is shown: sketch the spectrum, move the best-fit line | The graph is only for reading |
| **Click to mark or label** (click a ring, a bar, a peak, a part) | The idea is identifying which part counts: core rings, a peak, a force on a free-body diagram | Labels would give the answer away |
| **Hold to run, release to stop** (press and hold to heat, push, fire) | A process the student controls in time: heating, a push, a launch | The result does not depend on duration |
| **Aim or throw** (drag back to set angle and speed, release) | Projectiles, collisions, scattering, anything with a launch | Nothing is launched |
| **Zoom in and out** (macro to particle view) | The idea lives at the particle level and the observation at the bench | The bench view already shows it |
| **Predict, lock, then reveal** (choose before measuring; the choice is logged) | There is a likely misconception and the data can contradict it. Use at most two per lab | Nothing can surprise the student |
| **Free play with a goal-free sandbox** | The first minutes: let them see what the controls do before any task | The lab is short; spend the time on the tasks |

Rules for all of them: the control says what it does; one idea per screen; every action is logged for the record; show results as pictures first and numbers second; a wrong move gives a hint that points at the student's own data, never the answer; nothing student-facing says extension, challenge, optional or stars.
