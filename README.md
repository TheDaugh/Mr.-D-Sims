# Mr. D's Sims

Classroom simulations. Each one is a single HTML file that runs in any modern browser, so there is nothing to install and they work on Chromebooks and phones.

Open `index.html` for the front page. It links to `physics/`, `chemistry/` and `calculus/`, and each has its own hub.

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

## Using them

- **Locally:** double-click `index.html`, or any sim file.
- **On the web:** turn on GitHub Pages for this repo (Settings, Pages, deploy from the `main` branch) and share the link.
- **Bounce Meter** can listen through the microphone. Browsers only allow that over `https` (GitHub Pages is fine) or from a local file. If the microphone is blocked, the page has a simulated ball.

## Editing

Every page is plain HTML with its styles and script inside the file. The physics constants sit at the top of each `<script>` block, and the instruction and theory text is ordinary HTML near the end of the page body.

## Chemistry

The `chemistry/` folder holds daily lesson sims (each with a student sheet PDF) and virtual labs, with a hub page at `chemistry/index.html` that lists them by unit. Each entry in `labs.js` has a `type` of `lesson` or `lab`. Each lab opens with the glassware already set up and the instructions on the page.

| Unit | Lab |
|---|---|
| 2 · Properties of Matter | `heating-curve.html` (phase changes, temperature, energy) |
| 2 · Properties of Matter | `specific-heat.html` (calorimetry with a mystery metal) |

To add a lab, put the page in its unit folder and add one entry to `chemistry/labs.js`. Chemistry pages share `chemistry/shared/lab.css`, so keep the `../shared/lab.css` link when copying one.

A chemistry lesson with a teacher key keeps the key on its own page, `<lesson>-key.html`, not behind `#key`. Build it with `node chemistry/tools/make-key.mjs <lesson>.html` and re-run that after every edit to the lesson. The key page also shows the day's gate codes.

`chemistry/shared/lock.js` is the locked mode a lesson can opt into: fullscreen, every exit logged on the stamp, a lock from the second exit that needs a per-student code from the key page, and a code after closing the page. It deters. It cannot stop a Chromebook from opening a tab, so real enforcement stays with the school's Chromebook management.

## Calculus

The `calculus/` folder holds AP Calculus AB sims, with a hub at `calculus/index.html` that lists them by unit. The list lives in `calculus/sims.js`; add one entry there to add a card.

| Unit | Page |
|---|---|
| 2 · Differentiation | `2-7-product-rule.html` (guided lesson that adjusts to each student: warm-up placement, prediction test, four sim missions, huddle, adaptive build and practice, mastery check, online notes that print as a PDF and export as `.tex`). Also `2-7-product-rule-teacher.html` (class code, facilitation notes, full key, hand-in decoder) and `2-7-product-rule-outline.md`. |
| 6 · Integration and Accumulation of Change | `accumulation-lab.html` (two tabs: the accumulation machine, where g(x) = ∫f builds up as you drag x, and Riemann sums with left, right, midpoint and trapezoid rules and an error-vs-n plot) |

Most calculus pages are one self-contained file, so the same rules as the physics sims apply: constants and function lists sit at the top of the `<script>` block.

### Guided lessons (Unit 2 onward)
Guided lessons share code in `calculus/shared/`:

- `mathcheck.js` reads typed answers (`x^2`, `3x`, `e^x`, `sin(x)`) and checks them by numeric equivalence, so any equivalent form counts.
- `qkit.js` draws a question with a live math preview, a hint ladder, named wrong answers, and a result the lesson uses to adjust difficulty.
- `lesson.css` has the shared styles and the print layout for student notes.
- `katex/` is KaTeX 0.19.0 (MIT license) so math renders offline.

A lesson is a content file (`*.content.js`, all questions and answers), the student page, and a teacher page. Students never see their path; the hidden levels are Build, Apply, Stretch and Extend.

**Teacher access.** Open `calculus/index.html` and click “Teacher view” at the bottom (or add `#teacher` to the address once). Each lesson card then shows its teacher page, a preview link that opens every step and lets you pick a path, and the outline. Adding `#key` to a lesson’s address jumps to its teacher page. The class code on the teacher page changes daily and unlocks the huddle step. Students finish with a hand-in code; paste it into the decoder on the teacher page. There is no server, so progress and notes live in the student’s browser on that device.
