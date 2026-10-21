# Mr. D's Sims

Classroom simulations. Each one is a single HTML file that runs in any modern browser, so there is nothing to install and they work on Chromebooks and phones.

Open `index.html` for the front page. It links to `physics/`, `chemistry/` and `calculus/`. Each course page is a full-screen hub organized by unit, with tabs for **Lessons**, **Virtual labs** and **Sims**.

| Folder | What it is |
|---|---|
| `shared/` | Code every guided lesson uses: the school clock (`bell.js`), daily codes (`codes.js`), the one teacher bar (`teacherbar.js`), the live view client, student score profile, printable notes, and the course hub. |
| `teacher/` | `teacher/index.html`: today's codes for every lesson, the unlock-any-student code, lock desk, bell schedule and live view. |
| `portal/` | `portal/index.html`: the standards-based review portal that reads students' scores and gives personalized practice. |
| `live/` | A small Cloudflare Worker for the live view (optional, see `live/README.md`). |
| `docs/` | `docs/LESSON-STANDARD.md`: the rules every guided lesson follows and what each class changes when it builds the next one. |

## Physics

The `physics/` folder has a hub at `physics/index.html` that lists sims by unit. The list lives in `physics/sims.js`; add a line there to add a card.

| Unit | Pages |
|---|---|
| `motion-and-graphs/` | `graphs`, `bouncing-graphs`, `ticker-timer`, `motion-graphs` |
| `free-fall/` | `gravity`, `terminal-velocity`, `bounce-meter` |
| `projectiles/` | `projectiles`, `falling-target`, `ballistic-trolley`, `projectile-concept-checker` |
| `predict-first/` | `predict-first` (Two Carts, Hill Roll, Cut the String; each asks for a prediction before the run) |
| `challenge-problems/` | `exploding-projectile`, `ball-and-bullet`, `rolling-disc` (solve on paper, enter the answer, the sim tests it) |

`projectile-concept-checker` is a student-facing checker in the style of the statistics ones: name screen, gated questions, simulator tasks, hints on wrong answers, a core tier and a Challenge tier, and a completion stamp students show you. Add `#key` to its address for the teacher key, or `#preview` for skip buttons.

The first ten rebuild the LabVIEW originals (Graphs.exe, Gravity.exe and so on). Instructions and theory text come from the originals wherever the executables contained it. Ticker Timer, Motion Graphs and Projectiles held little readable text, so those three follow their titles and may differ from the old programs.

## Lessons

`physics/lessons/` holds online lessons built on a shared engine (`engine/lesson.js`, `engine/lesson.css`, `engine/ice-sim.js`, `engine/cart-sim.js`). A lesson is a page plus content files in `content/`.

| File | What it is |
|---|---|
| `newtons-first-law.html` | Student page. Add `#key` to the address for the teacher key on every screen. |
| `teacher.html` | Today's huddle codes, answer key, stamp checker, and a reader for student report codes. |
| `newtons-first-law-outline.md` | One-page outline of the lesson. |
| `newtons-second-law.html` | Second Law student page (fan-cart track). Same `#key` and teacher page. |
| `newtons-second-law-outline.md` | One-page outline of the Second Law lesson. |
| `content/nfl-items.js` | Question bank: warm-up, predictions, explanations in three registers, and six skills with four difficulty bands each. |
| `content/nfl-invest.js` | The four investigation parts. |
| `content/n2l-items.js`, `content/n2l-invest.js` | Second Law question bank and the four cart-track parts. |

Students build their own notes as they work. At the end they can print the notes as a PDF or download a `.tex` file (compiles with pdflatex or on Overleaf).

## Using them

- **Locally:** double-click `index.html`, or any sim file.
- **On the web:** turn on GitHub Pages for this repo (Settings, Pages, deploy from the `main` branch) and share the link.
- **Bounce Meter** can listen through the microphone. Browsers only allow that over `https` (GitHub Pages is fine) or from a local file. If the microphone is blocked, the page has a simulated ball.

## Editing

Every page is plain HTML with its styles and script inside the file. The physics constants sit at the top of each `<script>` block, and the instruction and theory text is ordinary HTML near the end of the page body.

## Chemistry

The `chemistry/` folder holds guided lessons and virtual labs, with a hub page at `chemistry/index.html` that lists them by unit. Each entry in `labs.js` has a `type` of `lesson`, `lab` or `sim`. Each lab opens with the glassware already set up and the instructions on the page. Lessons no longer have a written handout: their notes build on the page and print, save as PDF, or download as `.tex`.

| Unit | Lab |
|---|---|
| 2 · Properties of Matter | `heating-curve.html` (phase changes, temperature, energy) |
| 2 · Properties of Matter | `specific-heat.html` (calorimetry with a mystery metal) |

To add a lab, put the page in its unit folder and add one entry to `chemistry/labs.js`. Chemistry pages share `chemistry/shared/lab.css`, so keep the `../shared/lab.css` link when copying one.

Every guided lesson, in every class, uses the same teacher switch: add `#key` to its address. You see the real student page with every step open, the correct answers marked, huddle codes skipped, locked mode off and a teacher bar with today's codes. There is no separate key page to rebuild. `chemistry/teacher.html` has the chemistry codes, lock desk and stamp checker.

`shared/lock.js` is the locked mode a lesson can opt into (Atom Discovery uses it): fullscreen, every exit logged on the stamp, a lock from the second exit that needs a per-student code, and a code after closing the page. It runs only during chemistry's period, until the 42-minute mark Monday to Thursday and the whole period on Friday. The lock desk (in `#key` and on `teacher/index.html`) shows one **unlock-any-student** code that frees every locked student, so you are never locked out. It deters. It cannot stop a Chromebook from opening a tab, so real enforcement stays with the school's Chromebook management.

## Calculus

The `calculus/` folder holds AP Calculus AB sims, with a hub at `calculus/index.html` that lists them by unit. The list lives in `calculus/sims.js`; add one entry there to add a card.

| Unit | Page |
|---|---|
| 2 · Differentiation | `2-5-sine-cosine.html` (derivatives of sine and cosine, with a slope-tracing sim: tangent toothpick on the curve, a slope graph that fills with measured dots, and a zoomed secant mission) and `2-7-product-rule.html` (5-minute timed warm-up, prediction test, four sim missions, huddle, adaptive build and practice, mastery check, endless practice until the end mark, a concept key). Both adjust to each student and give online notes that print as a PDF and export as `.tex`. Each has a `-teacher.html` page and an outline. |
| 6 · Integration and Accumulation of Change | `accumulation-lab.html` (two tabs: the accumulation machine, where g(x) = ∫f builds up as you drag x, and Riemann sums with left, right, midpoint and trapezoid rules and an error-vs-n plot) |

Most calculus pages are one self-contained file, so the same rules as the physics sims apply: constants and function lists sit at the top of the `<script>` block.

### Guided lessons (Unit 2 onward)
Guided lessons share code in `calculus/shared/`:

- `mathcheck.js` reads typed answers (`x^2`, `3x`, `e^x`, `sin(x)`) and checks them by numeric equivalence, so any equivalent form counts.
- `qkit.js` draws a question with a live math preview, a hint ladder, named wrong answers, and a result the lesson uses to adjust difficulty.
- `lesson.css` has the shared styles and the print layout for student notes.
- `katex/` is KaTeX 0.19.0 (MIT license) so math renders offline.

A lesson is a content file (`*.content.js`, all questions and answers), the student page, and a teacher page. Students never see their path; the lesson moves between four hidden levels.

**Teacher access.** Add `#key` to a lesson's address (the same switch as physics and chemistry). The course teacher page and the all-classes page (`teacher/index.html`) hold the codes. Students finish with a hand-in code; paste it into the decoder on the teacher page. Progress and notes live in the student's browser on that device; scores for the review portal are saved there too.

## One clock for every class

`shared/bell.js` knows the periods (physics 9:00; chemistry 10:40 and 1:50; calculus 12:10; Friday 40-minute periods). Huddle codes are asked for only on weekdays 7:00 AM to 3:00 PM; after 3:00 PM, or at home, none. Today's codes are readable from 7:00 AM. Guided notes end at the 42-minute mark Monday to Thursday and at the bell on Friday. To change a time, edit the SCHEDULE block in that one file. Read `docs/LESSON-STANDARD.md` before building the next lesson.
