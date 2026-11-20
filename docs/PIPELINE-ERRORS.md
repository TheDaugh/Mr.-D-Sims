# Unit pipeline: errors met and how to avoid them

Read this before running the unit pipeline (skills: unit-backwards-pipeline, stats-thinking-notes-pack, stats-concept-checker). Found while running it on Intro Stats Unit 3 (2026-11-20), the second unit after Unit 4. Each entry: what went wrong, how to avoid it next time.

## Step 1-2: standards and source
1. **Math Medic's Unit 3 has no learning-targets sheet** (Unit 4 had one). Derive the targets from each lesson's QuickNotes headers in the lesson answer key, plus the quiz items. Do not wait for a targets file.
2. **The lesson answer-key PDF throws font errors in `pdftotext`** ("Missing language pack for 'Adobe-Korea1'"). Harmless; the text still comes out. Math symbols in headings come out wrong ("Standardizing with !-scores" is z-scores). Read headings with that in mind.
3. **The calculator model for stats was listed as an open decision in `docs/DAY-RULES.md`**, but it is settled in the built 3.6 lesson: `normalcdf` and `invNorm`, with the z-table as a back-up (`stats/unit-3-normal-distribution/3-6-boundary-values.content.js`). Grep the repo before asking Ian.
4. **Check what already exists for the unit before building.** Unit 3 already has the 3.4 notes pack (Ian's favorite exemplar), the 3.6 guided lesson (v2), the 3.1-3.3 review page and day cards in `stats/unit-3-normal-distribution/day-cards/`. Build around them; do not duplicate.

## Step 3: the test
5. **Math Medic gives summary statistics but not the data behind a dotplot.** Unit 3 test question 1 shows a dotplot and a table (n 20, mean 5.35, SD 2.9, five-number summary). Search for a dataset that matches every statistic and the percentile count, with the TI quartile method (median of each half), then assert all of them. Found: 1,1,3,3,3,3,4,4,4,5,5,5,6,6,7,8,8,9,10,12 (SD 2.925, which rounds to 2.9).
6. **A question's figure split from its text across a page break** (question 4's axis drawing). Wrap any question with a figure in `\begin{minipage}{\linewidth} ... \end{minipage}`.
7. **LaTeX strings joined in Python lose the space after a control word** (`r"...\par" + r"a)"` becomes `\para)`, an undefined control sequence). Run the regex fix after writing a build file: `re.sub(r'(\\[A-Za-z]+)"(\s*[\n+])', r'\1 "\2', s)`.
8. **`%` in a board-script remark comments out the rest of the line** in LaTeX. Escape it (the shared `script()` helper now does).

## Step 5: notes packs
9. **`\fig{name}` in the shared helpers looks for `name_s.pdf` (student) and `name_a.pdf` (key).** A figure that is the same in both versions fails with "File `x_s.pdf' not found" and a near-empty build. Use `\includegraphics{name.pdf}` for figures that do not change, and `\fig` only when you have made both versions.
10. **There are two copies of `lib.py`.** `stats42/lib.py` has the helpers; `stats4b/lib.py` adds `pack()`, `P()` and `slipbox()`, which build all six documents from one lesson file. Start from the one with `pack()`.
11. **Making a dataset with clean numbers takes a search.** For 3.1 we wanted 20 push-up counts with mean exactly 20, SD 6.0, and whole-number percentiles at the example values. Fix the example values first, then search for the rest at random and assert everything.
12. **Blanks inside `\dfrac` squash into an unreadable stack.** Write a formula with blanks on one line: `(___ − ___) ÷ ___ = ___`. Keep `\dfrac` for formulas that are only printed.
13. **A section header with one line under it at the bottom of a page.** Pass `breaks=('Part 2',)` to `pack()` (or `\newpage` before that `\sect`), and check each rendered page.

## Step 7: practice checkers
14. **The checker engine lived in the Unit 4 folder.** Moved to `stats/shared/checker/` (engine.js, util.js, checker.css); Unit 4's day files import `../../shared/checker/util.js` and its pages load `../shared/checker/engine.js`. New units put only their day files in `<unit>/checker/`.
15. **util.js had no dotplot or number-line pictures** (Unit 4 never needed them). Added `dotplotSvg` and `hopsSvg`. Check util.js for the picture a unit needs before writing its day file.
16. **The Unit 3 hub list in `stats/sims.js` is an old guess** ("3.1 The Normal Curve", "3.3 Reading the z-Table" and so on) that does not match Math Medic's lessons. `tests/unit/stats-course.test.js` asserts exactly 9 Unit 3 entries, so adding a card there breaks the test. Practice days went into a separate "Unit 3 · Practice days" block. Ask Ian before renaming the plan.
17. **Generated values printed with two decimals on counted things** ("91.02 push-ups"). Use only measured contexts (time, height) for decimal bands, round the value shown, and compute the answer from the rounded value, never from the z you started with.
18. **A slider's floating-point steps never exactly equal the target.** Accept a value within a tolerance (a twentieth of the step size's unit), never test with `===`.
19. **Float checks: `(100-99.7)/2 == 0.15` is False in Python.** Wrap decimal asserts in `round(..., 2)`.
20. **`\centerline{\includegraphics...}` in the middle of a sentence pushes the figure off the page edge** and splits the sentence around it. Put a figure on its own line: `\par\centerline{...}\par`.
21. **JavaScript refuses `-x ** 2`** ("Unary operator used immediately before exponentiation"). The whole module fails to load, so the page shows nothing and a test times out waiting for the tabs. Write `-(x ** 2)`. Check the browser console first when a checker page is blank.
22. **Bash substring tricks made titles like "Practice: 3-3 and 3-4".** Write each page's title out in full rather than slicing the day id.
23. **The normal-curve answers in the checkers come from JavaScript, not scipy.** `util.js` has `phi` (Abramowitz-Stegun erf), `normalcdf` and `invNorm`; they were checked against scipy (error under 4 × 10⁻⁷; invNorm(0.9, 30, 4) = 35.126, invNorm(0.3, 7.5, 1) = 6.976). Re-check if they are ever changed.
24. **Part ids are reused as keys by the test runner, so keep them unique across all day files.** Unit 3 named a star tab `fit`, the same id as Unit 4's fit-the-line sim, and the test treated it as that sim.

## Step 8: study guide
25. No new errors. The test-mirroring layout from Unit 4 (one section per test question, a "Know this" box, new numbers, a few answers deliberately different from the test) carried over unchanged.

## Where the Unit 3 run's files are
Notes packs, the test and the study guide were built in a chat workspace and delivered as PDFs plus source zips; only the practice checkers live in this repo (`stats/unit-3-normal-distribution/practice-*.html`, `checker/day-*.js`). Shared checker code: `stats/shared/checker/`.
