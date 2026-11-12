# Mr. D's Sims

Classroom sims, guided lessons and virtual labs for Mr. D's physics, chemistry, calculus and statistics classes. It is a static site (plain HTML and JavaScript, no build step), and most pages are a single file that runs in any modern browser, so there is nothing to install and they work on Chromebooks and phones.

Open `index.html` for the front page. It links to `physics/`, `chemistry/`, `calculus/` and `stats/`. Each course page is a full-screen hub organized by unit, with cards for **Lessons**, **Virtual labs** and **Sims**.

## Where things live

| Folder | What it is |
|---|---|
| `physics/`, `chemistry/`, `calculus/`, `stats/` | The four courses. Each has a hub page and a list file that feeds it (`physics/sims.js`, `chemistry/labs.js`, `calculus/sims.js`, `stats/sims.js`). |
| `shared/` | Code every lesson and lab uses: the school clock (`bell.js`), daily codes (`codes.js`), student IDs, locked mode (`lock.js`), printable notes, the one teacher bar, the live view client, the student score profile, the course hub, and the lesson registry (`lessons.js`). |
| `shared/virtual-lab/` | What every virtual lab shares (engine, stage, huddle clock, checkpoints) and `STANDARD.md`, the rules a lab follows. |
| `shared/whiteboard/` | The bundled whiteboard behind the chem and stats boards (see Class boards). |
| `teacher/` | `teacher/index.html`: today's codes, the unlock-any-student code, lock desk, bell schedule, live view, Student IDs, and a link to every lesson's `#key` view and key PDFs. |
| `portal/` | `portal/index.html`: the standards-based review portal. It reads students' scores and gives personalized practice. |
| `templates/` | A runnable template lesson for each course. Every new guided lesson starts here. |
| `tools/` | `new-lesson.mjs` (start a lesson from a template), `build-keys.mjs` (spec to PDF keys, needs `pdflatex`), `check-lessons.mjs` (standard conformance), `build-toolkit.mjs`, and `whiteboard/` (the board build). |
| `keys/` | Generated teacher and make-up key PDFs, by course. |
| `tests/` | Unit tests, a simulated class period for each template, lock and virtual-lab tests, and a load check of every page. `tests/README.md` has every command. |
| `docs/` | The rules: `LESSON-STANDARD.md` and `DAY-RULES.md`, plus the per-slot build files (`slot-4-v2/`, `slot-07/`, `slot-14/`, `slot-15/`). |
| `shared-slides/` | Worked examples of the slides-and-notes workflow. Not part of the site. |
| `live/` | A small Cloudflare Worker for the live view (optional, see `live/README.md`). |
| `CLAUDE.md`, `PROGRESS.md` | Instructions for Claude working in this repo, and a session-by-session log (newest first). |

## Which rules apply

1. `CLAUDE.md` holds Ian's standing decisions. Its "Supersedes" block wins over everything else.
2. `docs/LESSON-STANDARD.md` is the standard for guided lessons: rules 1-11, "Standard v2" 12-21, and "Standard v3" (the day by the bell).
3. `docs/DAY-RULES.md` is the run of show and per-slot handoff for new slots.
4. `shared/virtual-lab/STANDARD.md` is the standard for virtual labs. **A sim day is a virtual lab, never a guided lesson page** (Ian, 2026-11-11).

Most older lessons predate v2 and keep working as they are. Do not copy them to make a new lesson; run `node tools/new-lesson.mjs` (see Building new lessons).

## Physics

The `physics/` folder has a hub at `physics/index.html` that lists everything by unit. The list lives in `physics/sims.js`; add an entry there to add a card.

| Unit | Pages |
|---|---|
| Newton's Laws | Guided lessons `newtons-first-law`, `newtons-second-law` (fan-cart track) and `fbd-net-force` (Free-Body Diagrams and Net Force, slot 4; built on the v2 engine, with a projector page and key PDFs), and the Virtual Lab 5 fan cart (`virtual-lab/`). |
| `motion-and-graphs/` | `graphs`, `bouncing-graphs`, `ticker-timer`, `motion-graphs` |
| `free-fall/` | `gravity`, `terminal-velocity`, `bounce-meter` |
| `projectiles/` | `projectiles`, `falling-target`, `ballistic-trolley`, `projectile-concept-checker` |
| `predict-first/` | `predict-first` (Two Carts, Hill Roll, Cut the String; each asks for a prediction before the run) |
| `challenge-problems/` | `exploding-projectile`, `ball-and-bullet`, `rolling-disc` (solve on paper, enter the answer, the sim tests it) |

The first ten rebuild the LabVIEW originals (Graphs.exe, Gravity.exe and so on). Instructions and theory text come from the originals wherever the executables contained it. Ticker Timer, Motion Graphs and Projectiles held little readable text, so those three follow their titles and may differ from the old programs.

`projectile-concept-checker` is an older student-facing checker (name screen, gated questions, simulator tasks, hints on wrong answers, a completion stamp). Add `#key` to its address for the teacher key. Rebuild it on the engine before using it as a guided lesson.

### Lessons and the engine

`physics/lessons/` holds the guided lessons and the shared lesson engine (`engine/lesson.js`, `lesson.css`, `standard.js`, `lesson-kit.js`, `assess.js`, `ice-sim.js`, `cart-sim.js`). The engine is also used by chemistry, calculus and stats lessons. A lesson is a page plus content files in `content/`.

| File | What it is |
|---|---|
| `newtons-first-law.html`, `newtons-second-law.html` | Legacy guided lessons (v1 engine pages). Add `#key` to the address for the teacher key on every screen. |
| `fbd-net-force.html` | Slot 4, the Free-Body Diagrams and Net Force lesson (v2). `-projector.html` is the class view; `-worksheet.docx` is the paper version. |
| `teacher.html` | Today's codes, the answer key, the stamp checker, and a reader for student report codes. |
| `*-outline.md` | One-page outline of each lesson. |
| `content/` | Question banks and investigation parts (`nfl-*`, `n2l-*`) and the `fbd-net-force` spec and content. |
| `sims/` | Small sims (`arrow`, `chain`, `elevator`, `friction`, `rope`, `twoblock`) that the Free-Body Diagrams lesson offers for the bands that need them. |

Students build their own notes as they work. At the end they can print the notes as a PDF or download a `.tex` file (compiles with pdflatex or on Overleaf).

### Physics virtual lab

`physics/virtual-lab/` is Virtual Lab 5, the fan cart (slot 7 in the old numbering). It runs in the shared lab room through `window.VLAB_HOST` (`src/host.js`). It is one of the labs the checkpoint rule has not been applied to yet (`"legacy"` in its lab JSON); see `shared/virtual-lab/STANDARD.md`.

### Where the Forces unit is going (planned, not built yet)

The Honors Physics Forces unit plan (UbD v3, 2026-11-12) replaces the fan-cart lab and the built-apparatus days with **sandbox sims**: free play first, variables students can change, linked views (force arrows, motion strobe, graph, speedometer), a Record button that builds the student's own data table, and a prediction logged before each run. Two are needed: a cart-and-hanging-mass sandbox (slots 8 to 10) and a ramp-and-pulley sandbox (slots 19, 25, 26, 29). Real labs stay only where the gear is cheap (spring scales, coffee filters, a tilted board, Hooke's law). Until the sandboxes exist, the fan-cart lab and the Newton's Second Law lesson are the stand-ins. The two physical builds (a cart and track, a ramp-and-pulley rig) are archived in the UbD schedule, not deleted. Per `shared/virtual-lab/STANDARD.md`, the sandboxes are virtual labs, not guided lessons.

## Chemistry

The `chemistry/` folder holds guided lessons and virtual labs, with a hub page at `chemistry/index.html` that lists them by unit. Each entry in `labs.js` has a `type` of `lesson`, `lab` or `sim`. To add one, put the page in its unit folder and add one entry to `chemistry/labs.js`. Chemistry pages share `chemistry/shared/lab.css`, so keep the `../shared/lab.css` link when copying one.

| Unit | Pages |
|---|---|
| 2 · Properties of Matter | `heating-curve.html`, `specific-heat.html` (calorimetry with a mystery metal), and the virtual labs Unknown White Solids and Heating Curves of Unknown Solids |
| 3 · Atoms and Ions | Lessons: Atom Discovery, Rutherford's Gold Foil, Counting Particles, Coulomb's Law and the Shell Model, Electron Configurations I, Photoelectron Spectroscopy. Virtual labs: Rutherford's Gold Foil, Flame Tests, Photoelectron Spectroscopy, the Pull Bench (effective nuclear charge). |

Unit 3 follows the UbD schedule in the unit's Stage 1 file (25 numbered slots, with slot 10 split into 10A and 10B).

### Virtual labs

`chemistry/virtual-lab/` is the shared lab room and host (`src/ui/app.js`); a lab is chosen with `?lab=<key>` (`heating`, `rutherford`, `flame`, `pes`, `zeff`; no key opens the unknown-solids lab). Each lab is a JSON file in `content/labs/` plus its own module. Labs follow `shared/virtual-lab/STANDARD.md`: a demo, `#key` creative mode, the huddle clock, and checkpoints (3 right in a row, 3 misses lock the screen, today's unlock code frees it). `chemistry/virtual-lab/PLAN.md` is the original build plan; `chemistry/virtual-lab/teacher.html` shows the codes and records. A lab Ian cannot find is not done: it needs a hub card in `chemistry/labs.js`.

### Teacher switch and locked mode

Every guided lesson and virtual lab uses the same teacher switch: add `#key` to its address. You see the real student page with every step open, the correct answers marked, huddle codes skipped, locked mode off and a teacher bar with today's codes. There is no separate key page to rebuild. `chemistry/teacher.html` has the chemistry codes, lock desk and stamp checker.

`shared/lock.js` is the locked mode. Every guided lesson and virtual lab uses it, and template-built lessons turn it on by default. Fullscreen, every exit logged, a lock from the second exit that needs a per-student code, and a code after closing the page. It runs only during the course's period, until the 42-minute mark Monday to Thursday and the whole period on Friday. The lock desk (in `#key` and on `teacher/index.html`) shows one **unlock-any-student** code (`MrD.codes.override()`) that frees every locked student, so you are never locked out. It deters. It cannot stop a Chromebook from opening a tab, so real enforcement stays with the school's Chromebook management.

### Class boards

`chemistry/whiteboard/` and `stats/whiteboard/` are Excalidraw-based whiteboards with premade stencils for direct-instruction days. They also hold the **lesson boards** (`#lesson=<id>`, for example `chemistry/whiteboard/index.html#lesson=zeff` and `stats/whiteboard/index.html#lesson=3.4`): a pre-drawn day with answers under covers. See `shared/whiteboard/README.md`.

## Calculus

The `calculus/` folder holds AP Calculus AB sims and lessons, with a hub at `calculus/index.html`. The list lives in `calculus/sims.js`; add one entry there to add a card.

| Unit | Pages |
|---|---|
| 2 · Differentiation | 2.5 Sine and Cosine, 2.6 eˣ and ln x, 2.7 Product Rule, 2.8 Quotient Rule |
| 3 · Composite, Implicit and Inverse Functions | 3.1 Chain Rule, 3.2 Implicit Differentiation, 3.3 Inverse Functions, 3.4 Inverse Trig, 3.5 Higher-Order Derivatives, a Review + Quiz (3.1 to 3.3) and a Review + Test (Unit 3) |
| 4 · Contextual Applications | 4.1 Derivatives in Context, 4.2 Position, Velocity and Acceleration, 4.3 Rates in Other Contexts |
| 6 · Integration and Accumulation of Change | `accumulation-lab.html` (the accumulation machine and Riemann sums) |

Guided lessons share code in `calculus/shared/`:

- `mathcheck.js` reads typed answers (`x^2`, `3x`, `e^x`, `sin(x)`) and checks them by numeric equivalence, so any equivalent form counts.
- `qkit.js` draws a question with a live math preview, a hint ladder, named wrong answers, and a result the lesson uses to adjust difficulty. `xkit.js` has the plot, tangent and slider helpers the Unit 4 lessons use.
- `concepts.js` is the concept key; `lesson.css` has the shared styles and print layout; `katex/` is KaTeX 0.19.0 (MIT license) so math renders offline.

Students never see their path; difficulty moves with the student. Some lessons are self-paced (no clock, no huddle, no stamp). Teacher access is `#key` on the lesson address; the course teacher page and `teacher/index.html` hold the codes. Progress and notes live in the student's browser on that device; scores for the review portal are saved there too.

## Statistics

`stats/` holds the Intro Statistics Unit 3 (The Normal Distribution) lessons, with a hub at `stats/index.html` fed by `stats/sims.js` and a teacher page at `stats/teacher.html`. The unit plan lists 3.1 to 3.8 (3.1 Normal Curve, 3.2 z-Scores, 3.3 z-Table, Review 3.1 to 3.3, 3.4 Area Below and Above, 3.5 Area Between, 3.6 Boundary Values, 3.7 Normal Models in Context, 3.8 Unit Review). Built as online lessons so far: **3.6 Finding Boundary Values** and the **3.1 to 3.3 Review**; cards for the rest show as "soon". Days 3.4, 3.5 and 3.6 also have pre-drawn lesson boards on the stats board (`stats/whiteboard/index.html#lesson=3.4`, `3.5`, `3.6`). `stats/shared/` has the shared stats widgets (curve, z-table, tiles, ruler, dot plot, histogram); see `stats/shared/README.md`. The statistics bell times in `shared/bell.js` are placeholders until Ian sets the real period.

## Building new lessons

`templates/` has a runnable template lesson for each course, and `tools/new-lesson.mjs` starts a new lesson from one:

```
node tools/new-lesson.mjs <physics|chem|calc|stats> <lesson-id> "<Title>" [--unit <folder>]
```

A lesson's teaching lives in one `spec.js`; the page, the PDF keys (`keys/`) and the tests all read it. Start at `templates/README.md`. New chemistry and physics **sim days are virtual labs**, not lesson pages: see `shared/virtual-lab/STANDARD.md`. Before calling anything done, run the checks in `CLAUDE.md` and `tests/README.md`.

## Using them

- **Locally:** double-click `index.html`, or any sim file. Some pages (the lesson tests, labs that load JSON) need a local server: `python3 -m http.server 8123` from the repo root.
- **On the web:** Netlify deploys the `main` branch only. Work on a branch; nothing is live until it is merged to `main`, and Ian decides when.
- **Bounce Meter** can listen through the microphone. Browsers only allow that over `https` (the deployed site is fine) or from a local file. If the microphone is blocked, the page has a simulated ball.

## Editing

Older sims are plain HTML with the styles and script inside the file. The physics constants sit at the top of each `<script>` block, and the instruction and theory text is ordinary HTML near the end of the page body. Lessons and labs built on the engine keep their teaching in a spec or lab JSON file instead.

## One clock for every class

`shared/bell.js` knows the periods (physics 9:00; chemistry 10:40 and 1:50; calculus 12:10; Friday 40-minute periods; statistics is a placeholder). Huddle codes are asked for only on weekdays 7:00 AM to 3:00 PM; after 3:00 PM, or at home, none. Today's codes are readable from 7:00 AM. Guided notes end at the 42-minute mark Monday to Thursday and at the bell on Friday. To change a time, edit the SCHEDULE block in that one file.

Newer slots (Standard v3) have two huddle codes a day: huddle 1 at minute 3 and huddle 2 at minute 25. A sim day (virtual lab) has one notes huddle in the middle. Older lessons have one code a day. Read `docs/LESSON-STANDARD.md` and `docs/DAY-RULES.md` before building the next lesson.
