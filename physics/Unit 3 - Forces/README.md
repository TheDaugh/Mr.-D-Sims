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
| 4 | Notes: connected systems (built) | 3.13 | | |
| 5 | Notes: springs and Hooke's law (built) | 3.14 | | |
| 6 | Practice (built) | 3.13–3.14 | Virtual Lab 6, the Spring Scale Bench (`physics/virtual-lab/index.html?lab=06-spring-scales`, new, 25 minutes); the Spring Sandbox stays as free play | Hyatt skywalks; hanging chain |
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

## Day 4: connected objects (3.13)

| Piece | File |
|---|---|
| Cornell notes | `day-04-systems-notes.docx`, `day-04-systems-notes-key.docx`, previews `.pdf`; source `src/day-04-notes/` (`python3 figs.py`, then `node make.js` and `node make.js key`) |
| Lesson board | `physics/whiteboard/index.html#lesson=systems` (`tools/whiteboard/src/lessons/physics-systems.js`) |
| Board script | `day-04-systems-board-script.pdf` (source `.tex`, xelatex) |

Four parts (systems, a table and a hanging mass, the Atwood machine, friction on the table), a check at the foot of each, an exit check and a summary. System first for a, then one object for T, and every tension is checked from the other object. Numbers: 2.0 + 4.0 kg carts pulled with 12 N; a 5.0 kg cart with a 2.0 kg hanging mass (a 2.8, T 14 N); Atwood 4.0 and 6.0 kg (a 1.96, T 47 N); the cart with μk 0.20 (a 1.4, T 16.8 N). The exit uses 3.0 kg with 1.5 kg and an Atwood of 2.0 and 8.0 kg. None is a test number.

## Day 5: springs (3.14)

| Piece | File |
|---|---|
| Cornell notes | `day-05-springs-notes.docx`, `day-05-springs-notes-key.docx`, previews `.pdf`; source `src/day-05-notes/` (`python3 figs.py`, then `node make.js` and `node make.js key`) |
| Lesson board | `physics/whiteboard/index.html#lesson=springs` (`tools/whiteboard/src/lessons/physics-springs.js`) |
| Board script | `day-05-springs-board-script.pdf` (source `.tex`, xelatex) |

Four parts (Hooke's law, k from a graph, a hanging mass, a spring in a system), a check at the foot of each, an exit check and a summary. Part 4 puts a spring in the Day 4 carts' rope, so the spring reads the tension students already found. Numbers: 80 N/m and 0.15 m (12 N); 3 N per 0.025 m (120 N/m); 0.60 kg on it (0.049 m); a 200 N/m spring in the carts' rope (0.020 m). The exit uses 250 N/m, 80 N/m and 0.50 kg. None is a test number. The elevator spring scale (the 3.14 stretch) is only an "ahead" question in the script.

## Day 6: practice, connected objects and springs (3.13, 3.14)

Online first (25 minutes from the bell), then paper. The real things: the Hyatt Regency skywalks (Kansas City, July 17, 1981, 114 dead; as built, the nut under the upper walkway held both walkways) and a chain with mass (each link holds everything below it).

| Piece | File |
|---|---|
| Virtual Lab 6, the Spring Scale Bench (new; modeled on the photoelectron lab) | `physics/virtual-lab/index.html?lab=06-spring-scales`, `#key` for the teacher key; `physics/virtual-lab/src/engine/scales.js`, `src/ui/scales.js`, `content/labs/06-spring-scales.json` |
| Student sheet (2 pages: review, concepts, practice, the chain, the skywalks, a finisher) | `day-06-practice-sheet.docx`, `.pdf` |
| Practice Set B (its own sheet, no label: friction on the table, a rope with mass, the elevator scale) | `day-06-practice-sheet-b.docx`, `.pdf` |
| Exit slips (four to a page) | `day-06-practice-exit-slips.docx`, `.pdf` |
| Key with the likely error for every item, the slip answers, the 4-of-5 decision and where to reteach | `day-06-practice-key.docx`, `.pdf` |
| Teacher run sheet | `day-06-practice-run-sheet.docx`, `.pdf` |
| Board | `physics/whiteboard/index.html#lesson=practice6` (`tools/whiteboard/src/lessons/physics-practice-6.js`): open the lab and the hook, the huddle (minute 13), whiteboard rounds, exit check |

Sources in `src/day-06-practice/` (`python3 figs.py`, then `node make.js sheet|setb|slips|key|run`). No item copies a test item or uses a test number. The 40 kN walkway load and 60 kN nut limit on the sheet are labeled "suppose".

**The Spring Scale Bench.** One spring scale, four rigs. A: hang 0.1 to 0.4 kg beside a ruler, record three, type k (seeded per student from 20 to 60 N/m, never 50; within 4%); after that the scale reads in newtons. B: the scale in the string of a cart (1.5, 2.0 or 4.0 kg) pulled by a hanging mass (0.25, 0.5 or 1.0 kg): held it reads mg; predict, release, and it reads Mmg/(M + m). C: two walkways on rods, people on each; the rods read the same in both designs, the circled nut doubles as built; then the real story. D: six links (seeded 0.10 to 0.25 kg) and a bucket; click a gap to move the scale; predict the top before reading it. Three checks on the shared rule (spring, string, hang), every answer typed, generated per student, hints that name the mistake (centimetres, mass for weight, the held value, the acceleration, forgetting the bucket, the whole chain). One notes huddle at the middle (five blanks, board frame 1). Locked mode, demo, `#key`.

## The Spring Sandbox (for Day 6)

`physics/sandbox/spring-hang.html` (`#key` for the teacher key; physics in `spring-hang-model.js`, checkpoints in `spring-hang-checkpoints.js`). A spring on a lab stand beside a ruler that reads the stretch; four springs (20, 60, 150, 400 N/m, `author_set`) or your own k; 0.05 to 3 kg; four planets; an elevator speeding up or slowing down (the 3.14 stretch). Let go (it bounces about 1.4 times past where it settles, then settles) or lower gently; past 45 cm the spring snaps. Force arrows, instruments, a force-against-stretch graph built from recorded points. Predict the stretch in centimetres first (within 10% or half a centimetre counts; a snap on the bounce is graded against where it would settle). Three checkpoints: how hard does it pull, find a mystery spring's k (k and the spring force hidden), predict the stretch. No question uses the test's springs (50, 200, 400 N/m). Stands in for the Hooke's law lab until there are springs and hangers.

## Every board, one page

`teacher/boards.html` lists every lesson board by class and unit, with a button for each frame. A new board shows up there after `node tools/whiteboard/build.mjs`; title it `Physics Unit 3 · Day N · Topic` so it sorts.

## Open for Ian

- The Rope Tension Profile and Elevator Scale sims (`physics/lessons/sims/`) are unused here; the elevator fits the 3.14 stretch if wanted.
