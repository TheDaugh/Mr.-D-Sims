# Physics Unit 3, last part: friction, inclines, systems, springs (Honors)

The rest of the Forces unit, after the third law. Built with the chem Unit 4 approach (skill `unit-backwards-pipeline`): standards → test → day map → each day's materials → study guide. The UbD v3 files in this folder are the source; this README right-sizes them the way chem Unit 4 right-sized its standards.

Textbook: FHSST *Physics* (`physics/resources/fhsstphy.pdf`) is used lightly. Its forces chapter (ch. 5) is thin and has no friction, connected-systems or Hooke's law sections; 4.7.1 (block on an incline) and 10.3 (normal forces) are usable. Problems come mostly from our own sheets and `physics/challenge-problems/`.

Honors, not college prep: the math stays (components, μN, system then object). What gets cut is breadth, not rigor.

## The physics tweak: one new thing per practice day

Notes days teach each idea on clean textbook cases (ideal rope, massless pulley, a block on a ramp). Each practice day then points the same ideas at **one real thing students have not seen**. The test does the same: exactly one item is a new real thing, in the stretch slot. Everything else on the test is the textbook cases.

| Real thing | Ideas it uses | Where |
|---|---|---|
| Canton Avenue, Beechview: 37% grade, the steepest street in the continental US, close to impassable on ice | inclines, static friction, slip angle (tan θ = 0.37, θ ≈ 20°; dry tire vs. ice) | Day 3 practice |
| Hyatt Regency skywalks, Kansas City, 1981: two stacked walkways on hanger rods; the as-built two-rod design put both walkways' weight on the upper walkway's connection | FBDs, tension, equilibrium, one design vs. the other | Day 6 practice |
| A hanging chain: each link holds up every link below it | tension in a rope that has mass (T grows link by link toward the top) | Day 6 practice |
| The cargo ramp (from the UbD performance task) | everything, in the ramp-and-pulley sandbox | Day 8 practice |
| Ski patrol lowering a rescue sled down a 25° slope at constant speed (kept off every sheet, slip and quiz) | incline, kinetic friction, tension, ΣF = 0 | Test, stretch (Q10) |

## Standards

Core is what a C student must show on the test; stretch is the one item at the end of the test. UbD target numbers are in brackets.

| # | Core: the student can… | Bloom's | Stretch | Bloom's |
|---|---|---|---|---|
| 3.10 | name third-law pairs (source and receiver) and say why they do not cancel; use one tension along an ideal rope over an ideal pulley [F10, F11] (already taught; quiz and test only) | Understand | explain why a rope with mass has a different tension at each end | Analyze |
| 3.11 | tell static from kinetic friction; use f_k = μ_k N and f_s ≤ μ_s N; draw friction opposite the sliding or the would-be sliding [F12] | Apply | explain why the first push is harder than keeping it moving | Understand |
| 3.12 | split weight on an incline into mg sin θ along the ramp and mg cos θ into it; find N and a on a frictionless ramp [F14] | Apply | find the slip angle (tan θ = μ_s) and the acceleration on a ramp with kinetic friction | Apply |
| 3.13 | solve two connected objects (table and hanging mass, Atwood machine): the system for a, then one object for T [F13] | Apply | add kinetic friction to the table-top mass | Apply |
| 3.14 | use F = kx; find k as the slope of F against x; predict a stretch [F15] | Apply | a spring scale in an accelerating elevator | Apply |
| 3.15 | predict in words before calculating, and check whether the answer makes sense [F16, F19] | Evaluate | revise a prediction when one condition changes | Evaluate |

Cut: multi-pulley mechanical advantage, pulleys with mass, springs in series and parallel, the drag equation, circular motion, torque, ramps with more than one hanging mass.

From the UbD v3 schedule, dropped or parked: the friction sim (slot 22, the sandbox covers it), the philosophy day (slot 23; parked as a ready sub plan), whiteboard modeling (slot 28), and the dossier defenses (slot 30). The cargo ramp task becomes the Day 8 practice day instead of a written report plus an oral panel.

## Test

`forces-test.pdf` and `forces-test-key.pdf` (39 points, 10 questions, 4 pages; Q10 is the stretch item). Source: `src/test/test.tex` (pdflatex; a `mode.tex` beside it holds `\keytrue` or `\keyfalse`, as in chem). A: third law and tension (3 points, carried over). B: friction. C: inclines. D: connected objects. E: springs. Stretch: the rescue sled. Equation box at the top; students must know mg sin θ and mg cos θ themselves. The same equations, plus sin, cos and tan, are on `forces-equation-sheet.pdf` (two half-sheets to a page; source `src/eq-sheet/`), which students keep for the unit and get on the test.

Test numbers to keep off every sheet, slip and quiz: the 20 kg box with μ_s 0.50 and μ_k 0.30 (pushes of 60 N and 120 N); the 10 kg crate on a 30° frictionless ramp (and 40°); the 3.0 kg cart with a 1.0 kg hanging mass; the 5.0 kg and 3.0 kg Atwood machine; the spring with k = 50 N/m (2.0 N per 0.040 m) and a 1.5 kg mass; springs of 200 and 400 N/m pulled with 10 N; the 800 N tow truck; the 5.0 kg bag; the 90 kg sled on 25° with μ_k 0.10.

## Day map (10 class days, 50 minutes each)

Rhythm, as in chem: two notes days, then a practice day; a quiz after two blocks; then review and test. No lab materials yet, so a physics practice day opens on an online sim (predict, run, record) and then moves to a written worksheet built around that day's real thing. The third law already had its own quiz, so the Day 7 quiz covers only 3.11 to 3.14.

| Day | Type | Standards | Sim first | Real thing |
|---|---|---|---|---|
| 1 | Notes: friction, static and kinetic (built) | 3.11 | | |
| 2 | Notes: inclines (built) | 3.12 | | |
| 3 | Practice (built) | 3.11–3.12 | Friction Sandbox (`physics/sandbox/friction-push.html`, new), then the ramp sandbox for the slip angle (`physics/sandbox/ramp-pulley.html`, counterweight 0) | Canton Avenue |
| 4 | Notes: connected systems | 3.13 | | |
| 5 | Notes: springs and Hooke's law | 3.14 | | |
| 6 | Practice | 3.13–3.14 | Two-Block Lab (`physics/lessons/sims/twoblock.html`); a spring sim (none in the repo: build a small one, or PhET Hooke's Law as a stand-in) | Hyatt skywalks; hanging chain |
| 7 | Quiz (25 min) + flex | 3.11–3.14 | flex: reteach from the exit slips | |
| 8 | Practice: everything | all | ramp-and-pulley sandbox (`physics/sandbox/ramp-pulley.html`) | the cargo ramp |
| 9 | Review (study guide) | all | | |
| 10 | Test | all | | |

## What a day is made of (copied from chem Unit 4)

**Notes day:** Cornell notes (two pages, key-word blanks, terms in the left column, a check at the foot of each part, an exit check and a summary) + key; a lesson board on the physics whiteboard (`physics/whiteboard/index.html#lesson=<id>`, the first physics lesson boards); a numbered, color-coded board script.

**Practice day:** warm-up (three retrieval questions), the sim (predictions logged before each run), then the sheet: review, concepts, practice, and the real-thing problem, with Set B for finishers on the same sheet with space below; exit slips (4-of-5 decides the next day); key with likely errors; run sheet.

Pen colors for the physics boards (proposal): blue for objects and axes, red for forces, green for new words, purple for components.

## Day 1: friction (3.11)

| Piece | File |
|---|---|
| Cornell notes | `day-01-friction-notes.docx`, `day-01-friction-notes-key.docx`, previews `.pdf`; source `src/day-01-notes/` (`python3 figs.py`, then `node make.js` and `node make.js key`) |
| Lesson board | `physics/whiteboard/index.html#lesson=friction` (source `tools/whiteboard/src/lessons/physics-friction.js`), the first physics lesson board |
| Board script | `day-01-friction-board-script.pdf` (source `.tex`, xelatex) |

Four parts (what friction is, static, kinetic, solving), a check at the foot of each, an exit check and a summary. One 12 kg crate all day: N = 118 N, μs = 0.40 (47 N), μk = 0.25 (29 N), a 55 N push (a = 2.1 m/s²). Checks use 10 kg with μs 0.60 and 20 N, and 8.0 kg with μs 0.55 and 40 N; the exit uses a 15 kg toolbox with μk 0.15 and a 50 N pull. None is a test number. Pens for every physics board: blue objects, axes and motion; red forces; green new words; purple components (from day 2).

## Day 2: inclines (3.12)

| Piece | File |
|---|---|
| Cornell notes | `day-02-inclines-notes.docx`, `day-02-inclines-notes-key.docx`, previews `.pdf`; source `src/day-02-notes/` (`python3 figs.py`, then `node make.js` and `node make.js key`) |
| Lesson board | `physics/whiteboard/index.html#lesson=inclines` (source `tools/whiteboard/src/lessons/physics-inclines.js`) |
| Board script | `day-02-inclines-board-script.pdf` (source `.tex`, xelatex) |

Four parts (tilted axes, splitting the weight, normal force and acceleration, friction on a ramp), a check at the foot of each, an exit check and a summary. One 5.0 kg block on a 20° ramp all day: mg = 49 N, along 16.8 N, N = 46 N, a = 3.4 m/s² with no friction; μk = 0.20 gives fk = 9.2 N and a = 1.5 m/s². Exit uses 4.0 kg on 35°. Purple (components) starts today. The slip angle (tan θ = μs) is held for the Day 3 practice (Canton Avenue); it is one of the script's "ahead" questions.

## Day 3: practice, friction and inclines (3.11, 3.12)

Online first, then paper. The real thing: Canton Avenue, Pittsburgh (37% grade, θ = 20.3°; a parked 1500 kg car needs 5,100 N of static friction; dry μs 0.70 holds, icy μs 0.10 does not; mass cancels, so it holds only if μs ≥ tan θ).

| Piece | File |
|---|---|
| Friction Sandbox (new, replaces the old Friction Ramp sim) | `physics/sandbox/friction-push.html`, `#key` for the teacher key; physics in `friction-push-model.js`, checkpoints in `friction-push-checkpoints.js` |
| Student sheet (2 pages: review, concepts, practice, Canton Avenue, a finisher) | `day-03-practice-sheet.docx`, `.pdf` |
| Practice Set B (its own sheet, no label) | `day-03-practice-sheet-b.docx`, `.pdf` |
| Exit slips (four to a page) | `day-03-practice-exit-slips.docx`, `.pdf` |
| Key with the likely error for every item, the slip answers, the 4-of-5 decision and where to reteach | `day-03-practice-key.docx`, `.pdf` |
| Teacher run sheet | `day-03-practice-run-sheet.docx`, `.pdf` |
| Board | `physics/whiteboard/index.html#lesson=practice3` (`tools/whiteboard/src/lessons/physics-practice-3.js`): warm-up, the two sandboxes and Canton Avenue, whiteboard rounds, exit check |

Sources in `src/day-03-practice/` (`python3 figs.py`, then `node make.js sheet|setb|slips|key|run`). No item copies a test item or uses a test number.

**The Friction Sandbox.** A crate on a warehouse floor with a push machine behind it. Surfaces (wood, rubber, steel, carpet, ice, or your own μs and μk), mass, planet; a steady push or "Grow the push" (10 N per second). Linked views: force arrows, instruments with a speed graph, and the friction-against-push graph (it climbs to μs N, drops to μk N, and stays flat). Predict, then push (logged and tallied); Record table with copy and CSV. Three checkpoints with the shared rule (3 right in a row, 3 misses lock, today's unlock code): how big is friction, read μ from a mystery crate's graph, find the acceleration. Every answer is typed. The old `physics/lessons/sims/friction.html` stays inside the slot 4 FBD lesson, unchanged.

## Every board, one page

`teacher/boards.html` lists every lesson board by class and unit, with a button for each frame. A new board shows up there after `node tools/whiteboard/build.mjs`; title it `Physics Unit 3 · Day N · Topic` so it sorts.

## Open for Ian

- A small spring sim for Day 6 is the one missing sim (PhET Hooke's Law works until then).
- The Rope Tension Profile and Elevator Scale sims (`physics/lessons/sims/`) are unused here; the elevator fits the 3.14 stretch if wanted.
