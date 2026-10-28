# The virtual lab standard

Every virtual lab (chemistry, physics, any course) follows this. If a lab or a note disagrees, this file wins; where it disagrees with `docs/LESSON-STANDARD.md` on huddles, labs follow the guided lessons (two huddle codes, one daily code, called by the clock).

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
