# Progress

Update this at the end of every session. Newest entry first.


## 2026-11-09: Calculus 4.1, 4.2, 4.3 as online self-paced guided lessons (branch `calc-4-1-to-4-3`)

Ian asked for the first half of Unit 4 as online guided lessons students can do on their own. Read as 4.1 to 4.3 of 4.1 to 4.7 (4.4 Straight-line motion extras / related rates is the next one if "first half" meant four). Built from the calc template, not copied: `4-1-derivative-context` (Interpreting Derivatives in Context), `4-2-motion` (Position, Velocity and Acceleration), `4-3-rates-other` (Rates of Change in Other Contexts). Each is self-paced like 3.5: no clock, no huddle, no stamp; four Explore stations with named wrong-try messages; three hidden bands. New shared helper `calculus/shared/xkit.js` (plot, tangent, slider, shuffled choices). Registered in `shared/lessons.js`, hub group "Unit 4" in `calculus/sims.js` (teacher links), keys in `keys/calc/`, outlines beside each page.

Checks run: `node tools/check-lessons.mjs --strict` 0 errors; `node --test tests/unit/*.test.js` 282 pass (new derivative-context, motion, rates-other tests recompute every answer from the item data; they caught duplicate options in a 4.1 band 3 item, fixed); `TEMPLATE=calc PAGE=... node tests/template.e2e.js` all passed for each of the three; `node tests/lock.e2e.js` all passed; `node tests/smoke.js` 46 pages load clean; Explore tabs viewed in screenshots; keys built with pdflatex. Not done: the earlier Unit 4 print PDFs were not available, so content was rebuilt from the lesson titles, so check it against Ian's own pack. CLAUDE.md's one-lesson-per-session rule was exceeded at Ian's request. Not live until Ian merges.

## 2026-11-05: Stats lesson boards for 3.5 and 3.6 (branch `stats-lesson-boards`)

Added `stats/whiteboard/index.html#lesson=3.5` (percent below, above, between with normalcdf; hops and the standard normal) and `#lesson=3.6` (area or boundary, percentile, invNorm; hops and a lost mean or SD, the Could-tier segment). Five frames each: launcher and story, Parts 1-3, feedback key / exit slip / transfer. Answers under orange covers; numbers match the printed packs (generated and asserted with scipy). New `tools/whiteboard/src/lessons/stats-3-5.js`, `stats-3-6.js` and a small shared `stats-kit.js` (3.4 keeps its own copy). Registered in `app.jsx`, linked from `stats/teacher.html`, both boards' service-worker caches bumped to v5, bundle rebuilt (`shared/whiteboard/app/app.js`). `tests/lesson-board.e2e.js` now takes `LESSON=3.4|3.5|3.6`.

Checks run: `LESSON=3.4/3.5/3.6 node tests/lesson-board.e2e.js` 8 of 8 each; `node tools/check-lessons.mjs --strict` (0 errors); `node --test tests/unit/*.test.js` 210 pass; `node tests/smoke.js` 40 pages load clean. Not run: template e2e and lock e2e (no guided lesson was added).

Context: the 3.5 and 3.6 print packs (thinking notes, board script, R3.5/R3.6, practice, key, exit slips) were built outside the repo. Margin of error (T10) stays in slot 9. Not live until Ian merges.

## 2026-11-04: Stats lesson board for 3.4 (branch `stats-lesson-boards`)

Added the lesson-board mode to the shared whiteboard: `stats/whiteboard/index.html#lesson=3.4` opens the whole 3.4 day pre-drawn in seven frames (warm-up and big question, percent out of 100, hops, predict, the rule and tails, examples, exit ticket and up next). Answers sit under orange covers (select, Delete). Saves under its own key; Start over redraws. Built from `tools/whiteboard/src/lessons/stats-3-4.js`; `app.jsx` has a `LESSONS` registry; `stats.js` now exports `graph`, `normal`, `ctext`. Linked from `stats/teacher.html`. Both boards' service-worker caches bumped to v4.

Checks run: `node tests/lesson-board.e2e.js` (new) 8 of 8; `node tools/check-lessons.mjs --strict`; `node --test tests/unit/*.test.js`; `node tests/smoke.js`. Results are in the session reply.

Context: Ian's feedback on 3.3 (students could not follow area = 1, the algebra, or copy-and-explain at once) led to the 3.4 pack built outside the repo: thinking notes, board script, R3.4, practice sheet, key and exit slips. Margin of error (T10) moved from slot 8 to slot 9; the slot 9 checker has not been changed. Not live until Ian merges.

## 2026-11-03: Stats board, and the chem board rebuilt as a shared board

Ian asked for a whiteboard like the chem one for statistics, after the word-definition problem in 3.3: students do not get a definition from a sentence or from math, so the board has **word cards** (a term, one plain sentence, two examples with a check and one non-example with a cross) for the stats vocabulary, plus curve and routine stencils for direct-instruction days.

- **Stats board**: `stats/whiteboard/` (page, `sw.js`, manifest, icon). 29 stencils on five shelves: Word cards (8), Density curves (9), Normal curve (11), Graph tools (6), Routines (4). Curves come from formulas, and the mean and median lines on the skewed stencils are computed, not placed by eye.
- **One bundle, several boards**: the code moved to `tools/whiteboard/src/` (`app.jsx`, `draw.js`, `chem.js`, `stats.js`); the build writes `shared/whiteboard/app/`. A page sets `window.MRD_BOARD` to choose the stencils. The chem board keeps its address, its saved-board key and its shelf key, so what Ian already saved in a browser still loads. Docs moved to `shared/whiteboard/README.md`.
- **Stats teacher page (new)**: `stats/teacher.html` (codes, unlock code, periods, Stats board card, lessons table). `teacher/index.html` linked "Statistics course hub" to `stats/index.html`, which is the student lesson page, so there was no stats teacher page to land on; it now links both. The statistics bell times in `shared/bell.js` are still placeholders (10:00 to 10:50); the teacher page says so.
- **Red team of the chem board** (run in a browser against the live pages): it loaded, restored the board and shelves on reload, made no calls to other sites, and the service worker went active. Found and fixed: (1) the main menu listed GitHub, social links and an Excalidraw+ ad; replaced by a short menu. (2) The Library's "Browse libraries" button goes to excalidraw.com, against the "no outside calls" claim; hidden. (3) A tab closed within 800 ms of an edit could lose the edit; saving now also runs when the tab is hidden or closed (tested: edit, leave within 200 ms, reopen, the edit is there). (4) A full or blocked browser store failed silently; a red bar now says so. (5) Text labels were measured before the Nunito font loaded and could clip the last letters; every text box now gets 30% more room. Not changed: the shelf tabs sit over the canvas at the bottom (they wrap to two rows on a 1024-wide screen but do not hide the toolbar).
- **Checked**: every stats stencil rendered in the `#all` grid and looked at (first pass found overlapping labels, a left-skew curve too narrow, and word-card pictures running off the card; all fixed); drag from the Library onto the board on both boards; reload keeps the board; fast close keeps the last edit; no console errors; no requests to other sites; service worker active. Not run: the lesson checks (`check-lessons`, e2e), which do not cover this page. See the notes below for what did run.
- Not on `main`: branch `stats-whiteboard`. Netlify deploys when it merges. The shared `app.js` is about 8.5 MB (one copy for both boards, where two would have been 17 MB).
- Next: stencils for the later units as they come (z-score and area pictures), and the 3.3 `di-day-builder` pack is the figure vocabulary for the word cards.

## 2026-11-02: Chem board (whiteboard with chemistry stencils)

For direct-instruction chem days: Ian writes the board notes on a whiteboard and pastes premade organizers instead of drawing them. Built on Excalidraw 0.18.1 (MIT), vendored so it runs from the site: `chemistry/whiteboard/` (`index.html`, `src/app.jsx`, `src/stencils.js`, built `app/`, `sw.js`, README). Build: `node tools/whiteboard/build.mjs` (needs `npm install` in `tools/whiteboard`). Linked from `chemistry/teacher.html`.

- 36 stencils, all drawn in code: electron config rows, s/p/d boxes and 1s-3p / 1s-4p ladders; spin arrows; Bohr shells and six atoms; three blank periodic tables; energy level ladders and emission, absorption and photon arrows.
- Autosave in the browser (localStorage); Save/Open `.excalidraw` as backup; service worker caches it for offline.
- Checked: every stencil rendered in a grid and looked at; drag from the Library onto the board; reload restores the board and the library; service worker active; no console errors. Not run: the repo's lesson checks apply to lessons, not this page.
- Not on `main` yet: branch `chem-whiteboard`. Netlify deploys when it merges. `app/app.js` is 8.1 MB (Excalidraw is big); Netlify serves it compressed.
- Next: a chem version of the `di-day-builder` skill (script, notes, sheet, key, exit slip), using these stencils as the figure vocabulary.

## 2026-11-05: calculus 3.4 Inverse Trig and 3.5 Higher-Order Derivatives (self-paced, interactive)

Ian asked for 3.4 and 3.5 built as guided lessons from the Unit 3 files. (CLAUDE.md says one lesson per session; he asked for two, so both are here.) Both are made with `tools/new-lesson.mjs` and use the self-paced shape from 3.3. Files per lesson: `calculus/unit-3-composite-implicit-inverse/<id>.{html,spec.js,content.js}`, a 300-word outline `<id>-outline.md`, keys `keys/calc/<id>-{makeup,teacher}.pdf`, hub cards in `calculus/sims.js`, registry lines in `shared/lessons.js`, lock target in `tests/lock.e2e.js`.

- 3.4 (`3-4-inverse-trig`): stations are the triangle behind arcsin, steepness of arcsin, steepness of arctan, arcsin vs arccos. Skills: deriv (typed), slope, inside (choice), tangent (typed).
- 3.5 (`3-5-higher-order`): stations are slope of the slope (f and f′), match f/f′/f″, sine wheel, three machines. Skills: second (typed f″), nth, read, implicit (d²y/dx²).
- Engine: `askExpr` in `lesson.js` now passes `q.domain` to the typed field, so answers with square roots are sampled where they are defined.
- Tests: `tests/unit/inverse-trig.test.js` and `higher-order.test.js` check every answer against numeric derivatives of the function in the item, never the lesson's rules. `tests/lessons/<id>.e2e.js` replace the pacing tests and add stations, wrong-try messages, resume and a #key sweep.
- Checks run: unit tests 240 of 240, `check-lessons --strict` 0 errors, calc template e2e all passed for both pages, lock e2e all passed, smoke 43 pages clean, Explore tabs looked at in screenshots at 1366 wide. Keys built with pdflatex.
- Not checked: nobody has played the Build/Practice items by hand beyond the automated run; the term-list rule (DAY-RULES 13) has no coder test; the answer key PDFs were not opened to read.
- Not on `main` yet: branch `calc-3-4-3-5`. Netlify deploys when it merges.

## 2026-11-04: calculus 3.3 Derivatives of Inverse Functions (self-paced, interactive)

Ian asked for the next lesson to be more interactive than calculating, with the skipping removed so a student goes at his own pace and can finish the next day. Files: `calculus/unit-3-composite-implicit-inverse/3-3-inverse.{html,spec.js,content.js}`, keys `keys/calc/3-3-inverse-{makeup,teacher}.pdf`, hub card in `calculus/sims.js`, registry line in `shared/lessons.js`.

- Engine: new opt-in `SPEC.selfPaced` in `standard.js`. No `pacing` at all: no clock, trim, skip, huddle code, end banner (`lesson.js` hides it when `cfg.selfPaced`), stamp or report code. Every tab is required, in order. Warm-up is the spec's 3 review items (`SPEC.review`), no placement; band starts at 1, three bands (`maxBand` 3). The Huddle tab keeps Mr. D's notes plus a required mid-lesson check (`SPEC.mid`). Wrap-up keeps endless practice and `MrD.profile.record`. Locked mode releases when the student reaches Wrap-up. Lessons without `selfPaced` are unchanged.
- Solo student, 2026-11-05: Ian is making these for one student working alone, so the Huddle tab is renamed Notes (read the definitions and example, fill the blanks; no teacher talk). The step id stays `huddle`. The mid-lesson check stays.
- Resume: progress is the existing `le.<id>.v1` localStorage record, so the same device picks up where it stopped on any later day. The student ID reseeds the numbers on any device, but answers do not travel between devices.
- Explore is four required stations built in `content.js` (custom items X1 to X4): mirror a point onto stars, swap rise and run in an orange triangle, a flat tangent turns vertical, and match slope partners. Each has a "How to read it" line. Two observe questions follow.
- Skills: flip the slope (num, band 3 reads a table with decoy rows), where f′ goes (choice), slope of the inverse (num), tangent to the inverse (typed). Hints name a step card, do the first step, and show the same move on another example.
- Tests: `tests/unit/inverse.test.js` checks each answer against f with a numeric derivative, never the inverse formula. `tests/lessons/3-3-inverse.e2e.js` replaces the five standard tests that assume placement, the clock huddle, trim and stamp, and adds stations, wrong-try messages, resume next evening and a #key tab sweep. `specs.test.js` skips pacing validation for self-paced specs; `build-keys.mjs` prints a self-paced outline.
- Checks run: unit tests 220 of 220, `check-lessons --strict` 0 errors, lesson e2e 10 of 10, calc template e2e all passed, lock e2e (target added), smoke 41 pages. Screenshot of the Explore tab at 1366x768 looked at.
- Not checked: the "term list" rule (DAY-RULES 13) has no coder test in this repo yet, so content words were not machine-checked. The three-band ramp is decided by the same bands code; whether the top band should equal the regular standard is Ian's call.
- Not on `main` yet: branch `calc-3-3-inverse`. Netlify deploys when it merges.

## 2026-10-28: calculus 3.2 Implicit Differentiation (v2)

Built from the calc template: `calculus/unit-3-composite-implicit-inverse/3-2-implicit.{html,spec.js,content.js}`, keys in `keys/calc/3-2-implicit-{makeup,teacher}.pdf`. Listed in both places: `shared/lessons.js` (teacher hub, added by the scaffolder) and `calculus/sims.js` (the student page). `templates/README.md` now says so as step 5.

- Skills, in this order (the template keypad test needs the first item to be typed): find dy/dx (typed in x and y, four bands, named traps), differentiate a y-term (choice), slope at a point (clean decimals only: the digit keypad has no fraction key), tangent line (typed, exact fractions; band 4 keeps radicals exact).
- Explore: x² + y² = 25 with one slider; the upper and lower point share an x, each has its own tangent and slope, so −x/y needs both coordinates.
- `tests/unit/implicit.test.js` checks every generated item against the curve itself, never against implicit differentiation: each item carries `F(x,y)` and the true slope is −Fx/Fy from numeric partials. Checked: dy/dx answers at several (x, y); points lie on the curve; tangent lines pass through the point with the true slope; the marked y-term option equals Tx + Ty·p and every wrong option differs. I broke two answers on purpose and the test failed on both.
- Engine: the Predict teacher line printed `$...$` options raw. `standard.js` now renders them with the same `opt()` the student page uses. No effect on lessons without math options.
- Choice-skill options are plain text and unicode; the typed labels use `\tfrac` so the dy/dx fraction clears the input box.
- Checks run: unit tests 200 of 200, `check-lessons --strict` 0 errors, template e2e on the lesson and on the calc template, lock e2e (target added), smoke 36 pages, screenshots of Predict, Explore, Huddle and Build at 1366x768.
- Source for scope: the Unit 3 concept summary and the Math Medic 3.2 packet (circle, product-rule term, tangent line). Questions, numbers and wording are original.
- Not on `main` yet: branch `calc-3-2-implicit`, PR open. Netlify deploys when it merges.

## 2026-10-28: Lab 4 (Flame Tests) teacher key, creative mode, student demo, hub card

Ian could not use `#key` on lab 4 (nothing changed on the name screen), the students had no demo, and there was no huddle script or worked solutions for him.

- `#key` is now a creative mode like the fan cart lab: no name screen, goggles and apron on, unknowns open, codes skipped, Key button shown. Adding or removing `#key` on an open page restarts it in the right mode.
- The Key dialog lists both codes (the one daily code), the huddle 1 script, pre-lab answers, the huddle 2 picture, definitions, three worked problems with the think-aloud lines, three crux questions with the wrong answers to expect, the exit ticket and what to look for, the wrong-answers table, and the practice answers. All copied from the sheet into `content/labs/04-flame-tests.json` (`huddle`); not shown to students.
- Student demo (nine captions on the real bench, nothing kept): `flameScript` in `src/ui/demo.js`.
- Hub card added in `chemistry/labs.js`. `CLAUDE.md` now has a done-checklist for virtual labs.
- Tests: `test/flame.e2e.js` covers the demo, `#key`, and the restart on hash change. Lock e2e (with `TZ=America/New_York`), chemistry and physics virtual-lab suites and the fan cart e2e pass.

## 2026-10-27: Chemistry virtual lab 4, Flame Tests (slot 8, lab day)

Built as a new module in `chemistry/virtual-lab` (`?lab=flame`), from the slot 8 sheet. Nothing in the three content files was rewritten.

- Content: `content/flame-data.json`, `flame-items.json`, `flame-lab-content.json` (byte for byte; hashes pinned in `test/flame.test.js`), `content/labs/04-flame-tests.json` (wiring, `ui` wording, step card and captions copied from the sheet), `content/rooms/flame-lab.json` (the lab 1 room with the bench relabelled Flame bench and one UNKNOWNS shelf).
- Engine and UI: `src/engine/flame.js`, `src/ui/flame.js`, hooks in `app.js`, `stages.js` (theory optional, `keyRows`, `evidenceItems`, `cerUi`), `quests.js` (`flame` state), `index.html`, `stage.css`. Paper page: `flame-explore.html`.
- Built: bench with burner, bottles, splints; 10-second ring; results table; unknowns locked until all seven are recorded; reused-splint rule (sodium yellow first, run flagged); spectroscope drawn from the data; Tutorial 1 (hint pictures on the first five quests) and Tutorial 2 (four frames, opens on first use); step card always on screen; practice hints from items.json (hint k opens after the k-th miss, the answer is never shown); two huddle codes; three hidden bands. Not built: stamps, report codes, board reveal.
- Tests: `test/flame.test.js`, `test/flame-words.test.js` (the word rule), `test/slot-08-content.test.cjs` (the sheet's test, two paths changed), `test/flame.e2e.js`; `tests/lock.e2e.js` has a flame target.

Doubts for Ian (nothing guessed silently):
1. **Code 2 and the one-code rule.** Both gates use `MrD.codes.gate`, which is the one daily code, so code 1 also opens gate 2. Gate 2 only shows a code box when seven flame tests are recorded and both unknowns are answered (the sheet's rule, still marked pending). It does not open by itself, so early finishers keep working; a Huddle 2 button appears when the record is complete. The lab ends when code 2 and the CER are both in.
2. **Practice items.** The data says the practice set is not run in class on a lab day. You asked for hints from items.json, so a Practice tab opens in the notebook once the seven salts are recorded (in class and at home). Say if it should be home only.
3. **Bands.** Hidden. Start at band 1, up one only on a first-try right answer, never down; the band only picks the next item. The sheet says bands change hint depth and the number of extra unknowns but gives no numbers, so every student gets three hints per item and endless extra bottles.
4. **Hint cost.** Hint 1 opens after the first miss, hint 2 after the second, hint 3 after the third; a fourth miss closes the item as missed (the answer is not shown, and the record says so).
5. **b3-4 (explain).** Grading is pending your decision. The sentence is saved in the record and not scored; the model answer is not shown.
6. **Reused splint.** A splint is spent after a hold; a second dip on one splint also counts as reuse. The flash lasts 2 s, read from the K masking text in the data. A flagged run still counts as recorded; a clean retest clears the flag.
7. **Ca.** Marked needs_review in the data; the teacher key (`#key`, Key button) repeats it. Students see Ca's NIST lines like the other rows.
8. **Wording of mine** (all in `content/labs/04-flame-tests.json`, `ui`): button labels, status lines, intro, the huddle screens, the exit-ticket hand-off. The pre-lab pictures, Tutorial 1 pictures and Tutorial 2 frames are drawn by me from the sheet's one-line picture descriptions.
9. **Brightness order** (faint, moderate, bright, very bright) drives the flame glow only; it is an author-set display choice in the wiring file.
10. **Word rule.** The test lists the sheet's 15 words plus a few it would be easy to leak (photon, quantum, orbital...). Slot 7 review words (electron, shell, charge...) may appear in the pre-lab only. Salt and element names and the units the sheet's items use are not checked.
11. **Not done:** no hub link in `chemistry/labs.js`, no reader for lab 4 records in `teacher.html` or the gradebook, no teacher key PDF, no teacher bundle entry. The swatch row is on the paper page, not in the simulator (you show it at huddle 1).
12. `node tests/lock.e2e.js` needs `TZ=America/New_York`; without it the virtual-lab targets fail on an unmodified checkout too. `node tools/review.js --gate` still fails on the unreviewed lab 1 content (unchanged).

## 2026-10-27: docs only, v3 day rules (branch docs/day-rules-v3)

Added `docs/DAY-RULES.md`, a "Standard v3" section in `docs/LESSON-STANDARD.md`, and a "Supersedes" block in `CLAUDE.md`. No code, tests or templates changed. The clock itself (huddles at minute 3 and 25) is a separate code branch. Chem slot 9 and stats 3.6 are already on main from the earlier Day Cards and predate these rules.

## 2026-10-27: Opt-in v3 clock (huddle 1 at minute 3, huddle 2 at minute 25)

Branch `feat/clock-v3`, not merged. A lesson opts in with `pacing: { budgetMin: 42, clock: 'v3' }`; lab days override with `huddles: [{key:'h1',atMin:3},{key:'h2',atMin:33}]`.

- `shared/pace.js`: `isV3`, `huddlesOf`, `huddleMode` ("hold" for v3 huddle 1, else "write"). v3 validates the huddles only and never trims or skips (no 60% rule).
- `shared/codes.js`: `huddle2()` and `gateV3()`. Legacy `gate()` is unchanged, so every old lesson keeps one code and its own `atMin`.
- Engine: `lesson.js` picks `gateV3` for v3; `standard.js` uses `huddlesOf`; `lesson-kit.js` shows a hold screen at v3 huddle 1 and the writable tab at huddle 2. Teacher page and bar show a Huddle 2 code.
- Not done: templates still use `atMin: 18` (new lessons set `clock:'v3'` themselves); `LESSON-STANDARD.md` v3 table covers the rules.
- Checks run: unit 186/186, `check-lessons --strict` 0 errors, template e2e passed for physics, chem, calc and stats, lock e2e passed, smoke 35 pages clean.

## 2026-10-27: Unit 3 slot 11, stats 3.6 Finding Boundary Values (first v2 stats lesson from a Day Card)

Built from `node tools/new-lesson.mjs stats 3-6-boundary-values ... --unit unit-3-normal-distribution`, wiring `day-cards/stats-11.card.md` and `stats-11.content.js`. Nothing in the content was rewritten.

- Page, spec, Explore and wiring: `3-6-boundary-values.{html,spec.js,content.js}`; Models tab: `.models.js`; board page: `3-6-boundary-values-board.html`.
- New shared files: `stats/shared/normal-figure.js` (normal curve on the data axis as an SVG string, Node-safe; draws every item `figure`, the huddle label and the board) and `stats/shared/boundary-kit.js` (`NK.boundary`, the minutes-axis target-area sim). `normal-kit.js` is untouched.
- Tests: `tests/unit/stats-11-content.test.js` (card test, require paths only), `tests/unit/stats-11-wiring.test.js`, `tests/lessons/3-6-boundary-values.e2e.js`, `tests/fixtures/ppf-scipy.json`, lock target. `specs.test.js` now accepts 2-option choice items (the card's Area-or-boundary sort has two).
- Hub and portal: `stats/sims.js` PLAN id `3-6-percentiles` became `3-6-boundary-values` (it had to match the registry id); skills mapped to `STAT-NORMAL-5`.
- Engine: none. Card `tol` is absolute, the engine's is relative, so `dress()` puts it in `abs`.

Doubts for Ian:
1. Models: the card words no questions for typed moves. M2 moves 2 and 3, M3 all five, M5 moves 3 and 4 are asked from the model's numbers (area, the `invNorm(...)` entry, the equation `40 = 30 + (1.28)(SD)`, SD). Wrong tries show the card's misconception `fix` text.
2. Models have no pacing step, so they are unbudgeted (same as chem slot 9).
3. Huddle: definitions are `board.reveal` 1 to 3, the example is M1 with three blanks. The three label lines on the curve are mine. Concepts (four) are built from the card's lines; their equations are mine.
4. Explore: start at 18 min, match within 0.01 of the target area, arrows move 0.5 min, a drag snaps to 0.1. The wording of the target line and the miss/match messages is mine.
5. Build: item i is card part i; the tail parts pick a seeded boundary item on that side where the band allows (bands 3 and 4 may give a two-answer or error-find item).
6. Two-answer items accept either order (engine); the card says lower then upper.
7. Warm-up placement follows chem slot 9: band 2 only if all six are first try, else band 1.
8. Flag 2 (Table tab in the Concepts panel) left as the kit default pending your decision. Gate rule and board ink are pending too.
9. Added after review: the Concepts panel has a Calculator tab (invNorm; normalcdf from a value or z, with percentile) and a Table backward tutorial (`NK.boundaryTabs` in `boundary-kit.js`), ahead of the kit's Table, Routine and Example. This answers flag 2 the other way: the table stays, as a back-up to technology.
10. Not done: `tools/build-keys.mjs` (no `pdflatex` here), so no key PDFs; the board page is not linked from any hub.

## 2026-10-27: Unit 3 slot 9, Electron Configurations I (first v2 chemistry lesson)

Built from `node tools/new-lesson.mjs chem electron-config-1 ... --unit unit-3-atoms-ions`, wiring the Day Card (`chemistry/unit-3-atoms-ions/day-cards/slot-09.card.md`, `slot-09.content.js`). Nothing in the content was rewritten.

- Page, spec, Explore and wiring: `electron-config-1.{html,spec.js,content.js}`; Models tab: `electron-config-1.models.js`; board page: `electron-config-1-board.html`.
- New shared figure `chemistry/shared/energy-ladder.js` (rules, SVG, drag widget; also draws question pictures, the huddle figure and the board). Not `ladder.js`, which is the difficulty ladder.
- Engine (additive): `config` answer type and `answer2` in `lesson.js`; `SPEC.buildTarget` in `standard.js` (Build hard-coded "I can use a = F / m" for every course, so the chem template shows a physics sentence too; left as is).
- Tests: `tests/unit/slot-09-content.test.js` (require path only changed), `tests/unit/energy-ladder.test.js`, `tests/lessons/electron-config-1.e2e.js`, lock target, `specs.test.js` accepts `config` items.

Doubts for Ian (the card's list of what I added or interpreted):
1. Target T7 was 113 characters; the spec rule is under 110. "(full form)" became "full" before "ground-state".
2. Huddle: the card gives none. Definitions and the phosphorus example come from `board.reveal` and M1 verbatim (counts and the final total are blanks). Three label lines on the ladder are mine. Concepts (three) come from `hint0` and the board writes; their equations are mine.
3. Warm-up: W1 to W6 replace the placement ladder. Band 2 if W1 to W4 and W5, W6 are all first try, else band 1. Only bands 1 and 2 are placed.
4. Models sit after the Huddle. The pace plan has no `models` step, so they are unbudgeted (the 38 planned minutes do not include them).
5. M3 moves 1, 2, 3 and 6 need questions the card does not word; I asked them from the model's numbers (electron count, order, electrons left after 3p, sum of superscripts). Move 5 "draw the boxes" is click-to-cycle and passes any arrangement with the right counts.
6. Explore: "filling order hidden until the student commits an order" is built as: the order numbers appear on the ladder only when all electrons are placed. Rule priority on a bad drop: Pauli, then Aufbau, then Hund. Prompts for the `rec` items and the three capacities are mine.
7. "Give both" (rules band 4, answer2) has no separator in the prompt; the box says to separate with a comma.
8. Check tab is the card's exit (X1 to X3) and the report code field 7 is now the three first-try bits (`1-1-1`). Exit labels (secure, developing, not yet) are teacher-only.
9. The gate uses the standard huddle code; `gate.items` are listed in the Huddle teacher panel only. Ink on the board is not built (decision 2).
10. Not done: `portal/standards.json` has no strand for electron configurations, so write/read/rules are unmapped. `tools/build-keys.mjs` was not run (no `pdflatex` here), so no key PDFs. The board page is not linked from any hub.
## 2026-10-27: calculus 3.1 The Chain Rule (v2), first lesson of Unit 3

Built from the calc template: `calculus/unit-3-composite-implicit-inverse/3-1-chain-rule.{html,spec.js,content.js}`, registered in `shared/lessons.js`, keys in `keys/calc/3-1-chain-rule-{makeup,teacher}.pdf`.

- Skills: differentiate a composite (typed, four bands, named traps), name the inside (choice), read a table (inside/outside swap at band 3, tangent estimate at band 4), slope at a point.
- Explore: `y = sin(x²)` with a movable point; the readout splits the slope into dy/du and du/dx.
- `tests/unit/chain-rule.test.js` checks every generated answer against a numeric derivative of the function itself (no chain rule used), and every trap against its answer.
- `tests/lock.e2e.js` has a target for the lesson.
- Engine: `standard.js` hardcoded the Build target as "I can use a = F / m on a new problem." for every lesson. It now reads an optional `SPEC.buildTarget` and keeps the old text as the default, so 2.6, 2.8 and the other lessons are unchanged. Set `buildTarget` in each new spec; the old default is wrong for everything outside physics.
- Choice-skill options do not render `$...$`; write them as plain text or unicode.
- Checks run: unit tests (123 of 123), `check-lessons --strict` (0 errors), template e2e on the lesson and on the calc template, lock e2e, smoke (33 pages), screenshots of Start, Explore, Huddle and Build at 1366x768.
- Not on `main` yet: pushed on branch `calc-3-1-chain-rule` with a PR. Netlify deploys only when Ian merges.
- Source for the content was the Unit 3 concept summary and the Math Medic lesson packets; the questions, numbers and wording are original.

## 2026-10-26 (later): locked mode on for every spec-built lesson

Ian's decision: every guided lesson is locked. Done for Standard v2:

- `physics/lessons/engine/standard.js` now sets `lock: true` for every lesson it builds, so a lesson made from a template is locked without anyone remembering to add it.
- `shared/lock.js` is loaded on the seven v2 pages and templates that lacked it: the four templates, `2-6-exp-log`, `2-8-quotient-rule`, `unit-3-review-1-3` (`fbd-net-force` already had it). New lessons copy the template page, so they inherit the tag.
- `tests/lock.e2e.js` has a target for each of the four templates (the lock engages, one exit warns, the second locks, codes unlock, reopening asks for a code, `#key` and after-3-PM never lock, `#nolock` switches it off).
- `node tools/check-lessons.mjs --strict` now passes: 0 errors, 0 gaps.

Verified, all passing: lock e2e (10 of 10 targets), template e2e for all four courses, page e2e for `fbd-net-force`, `2-6-exp-log`, `2-8-quotient-rule` and `unit-3-review-1-3`, unit tests (114 of 114), smoke (32 pages load clean).

**Needs Ian:** the stats period in `shared/bell.js` is still a placeholder (marked `TODO(Ian)`), and locked mode only turns on inside a class period. Until the real stats times are entered, stats lessons lock at the wrong hours. The new stats lock test pins the placeholder time and should move with it.

## 2026-10-26: harness setup

Added `CLAUDE.md`, `tools/check-lessons.mjs`, and a scope note at the top of `.claude/skills/guided-lessons/SKILL.md`. Baseline: `node --test tests/unit/*.test.js` passes (114 of 114).

### Why new lessons kept coming out different

The skill told builders to copy `coulombs-law.html` (the single-file chemistry build). The standard and the templates say to generate from a spec. Both lived in the repo, and a session that read the skill first built the old way. The skill now points at the standard for new lessons.

### Migration baseline (`node tools/check-lessons.mjs`)

15 registered lessons: 4 on v2, 4 templates, 7 legacy.

| Generation | Lessons |
|---|---|
| v2 | `2-6-exp-log`, `2-8-quotient-rule`, `fbd-net-force`, `unit-3-review-1-3` |
| legacy, physics | `newtons-first-law`, `newtons-second-law` |
| legacy, chemistry | `atom-discovery`, `rutherford-gold-foil`, `counting-particles`, `coulombs-law` (none are on v2) |
| legacy, calculus | `product-rule-v2` (still has its own gate hash or PREVIEW flag) |

Nine pages in lesson folders are not registered in `shared/lessons.js`: six sims under `physics/lessons/sims/`, `calculus/.../2-5-sine-cosine.html`, and the two chemistry unit-2 pages `heating-curve` and `specific-heat`. `projectile-concept-checker` (physics/projectiles) also has its own gate and name screen, as the standard notes.

### Still open (needs Ian)

- **The Day 1 / Day 2 split and the mid-lesson formative check are not in `LESSON-STANDARD.md`.** The standard has pacing and a timed huddle but no two-day structure. Proposed: Ian describes the intended shape in a few sentences and it goes into the standard as rule 22 before the next lesson is built.
- `.claude/skills/ispy-art-pipeline` belongs to the Mandarin repo. Proposed: move it there and merge it with `docs/skills.md`.

### Suggested order

1. Rebuild the next chemistry lesson from the chem template, not from `coulombs-law`. It becomes the first v2 chemistry lesson and the new golden example.
2. Enter the real stats bell times.
3. Register or retire the nine unregistered pages.
4. Migrate legacy lessons one at a time as they come up for rebuild.

## 2026-10-28: virtual lab 5, the fan cart (slot 7), branch `slot-07-fan-cart`

Built from `docs/slot-07/` (the sheet's three JSON files and the content test are copied unchanged into `physics/virtual-lab/content/` and `test/`; content test 39 of 39). Lives in `physics/virtual-lab/` (`index.html?lab=05-fan-cart`), runs on the shared lab app in `chemistry/virtual-lab` through `window.VLAB_HOST` (`src/host.js`).

- Chemistry files touched, hooks only: `src/ui/app.js` (host registry, lab-kind calls, shared content base, course, `gateV3` codes, door/welcome/tutorial strings via `fl.text`), `roomview.js` (art keyed by tile id), `icons.js` (extra icons), `quests.js` (`huddle2` state), `demo.js` (kind script), `chest.js` and `stages.js` (ids on controls). `tests/lock.e2e.js` has a physics target.
- Day rules: hold screen forced at minute 3, huddle 2 at minute 28 with blanks, code 2 never blocked by the record, no stamp or report code, `MrD.profile.record` kept, three hidden bands, three-hint ladder, predictions logged and locked.
- Judgment calls for Ian: huddle 2's third blank and W3 contain 1/m, so they appear only once code 2 is entered; generated Checks problems have no hints in the sheet, so they borrow the bank item's hints 1 and 3 and template hint 2; bars 0 on setting 4 would roll past the 2 m rail (the picture stops the cart; the sheet never asks for it); flame lab still uses legacy `gate()` so its two codes are equal.
- Paper fallback: `physics/virtual-lab/fan-cart-paper.html`. `slot-07.sheet.pdf` was not attached and pdflatex is not installed, so only the `.tex` is in `docs/slot-07/`.

## 2026-10-28: shared slides exemplar (chem Unit 3, slot 10), branch `shared-slides-exemplar`

Added `shared-slides/` with `README.md`, `WORKFLOW.md` and the first exemplar `chem-unit3-lesson10/` (26-slide Claude Slides deck, 2-page notes sheet with key and `.tex`, formula font). Not part of the site and not linked anywhere; nothing here is live until Ian merges. Open for Ian: the three Stretch items and the "why does 4s leave first" question conflict with the no-extension rule and the regular-level standard; "isoelectronic" appears only in speaker notes.

## 2026-11-02: slot 11 photoelectron spectroscopy, data layer only (branch `claude/relaxed-faraday-aclf1z`)

Built: `chemistry/shared/pes-data.js` (Z = 1 to 20; electron counts from Aufbau in code; energies in eV, MJ/mol by 1 eV = 0.0964853), `chemistry/shared/pes-data-sources.md` (one citation id per value), `tests/unit/pes-data.test.js` (6 tests, all pass). Not built yet: the page, the practice generator, the walkthrough, the key, the outline, the hub and standards entries.

Blocked on sources: gas-phase core-level values exist for H, He, Li, Mg, Ne, Ar only. The NIST handbook gives every first ionization energy; the Tartu gas-phase database (repo `UT-XPS/gas-phase-database`, read access) has atomic 1s/2s/2p only for Li, Na (1s, 2s), Mg, Ne, Ar; the X-ray Data Booklet's other rows are solid-state (Fermi level), not gas phase. So Na (no gas-phase 2p), S and P are not in the sim, and the worksheet's Na and S runs and phosphorus exit cannot be built as written. Decision needed from Ian (see the list in the session reply).

## 2026-11-02: slot 11 photoelectron spectroscopy page (branch `claude/relaxed-faraday-aclf1z`)

Built: `chemistry/unit-3-atoms-ions/photoelectron-spectroscopy.html` (single page; screens Start → Warm-up → Huddle 1 → Part 1–4 with Huddle 2 → Exit → Practice; `#key` panel), `chemistry/shared/pes-practice.js` (endless `spec(n, band, seed)`, recomputed from data), `photoelectron-spectroscopy-outline.md` (299 words). Registered on the chemistry hub (`chemistry/labs.js`, type "lesson", day 11) and in `portal/standards.json` (`CHEM-PES-1`, skills `chem.pes.*`).

Checks run: `node --test tests/unit/*.test.js` 210/210 pass (includes the 10 PES tests); `tests/lessons/photoelectron-spectroscopy.js` walkthrough passes at 1366×768 with no JavaScript errors; screenshot of Part 1 top saved to the session scratchpad.

Not done or changed: `shared/lessons.js` not registered (that registry needs a spec file this page does not have, and the spec tests would fail on it); no `details.kt` block (the teacher key lives in the page's `#key` panel); sodium, sulfur and phosphorus are out of the sim, so the worksheet's Na and S runs and phosphorus exit are not built as written; Mg replaces Na, Mg replaces Al in the huddle; quick items show before the task without gating it; student ID is a stub pending the ID system; huddle 1 code is not gated by the gate question (huddle 2 is).

## 2026-11-05: slot 11 photoelectron spectroscopy as a virtual lab (`?lab=pes`)

Built: lab 5 in the room app. `chemistry/virtual-lab/content/labs/05-photoelectron.json` + `content/rooms/spectroscopy.json` (art in `shared/virtual-lab/roomview.js`), station module `src/ui/pes.js` + `pesview.js`, pure model `src/engine/pes.js`, endless generator `spec(n, type, seed)` in `chemistry/shared/pes-practice.js` (read, draw, match; the old `spec(n, band, seed)` still works), calculated fill-ins in `chemistry/shared/pes-data.js` (`labSpectrum`), teacher page roster, key, hub card, PLAN section, outline `chemistry/virtual-lab/photoelectron-lab-outline.md`. `node tools/pes-pin.mjs <pin>` sets the unlock PIN (hash in `content/config.json`).

Decision (Ian, 5 Nov): the 42 subshell energies with no gas-phase measurement come from NIST SRD 141 (LDA free-atom calculation), marked `calculated` in the data, sources file and key. The earlier lesson page does not read them (`simElements()` is still the measured six).

Checks run: `npm test` in chemistry/virtual-lab 98/98 and physics/virtual-lab 39/39; `node --test tests/unit/*.test.js` 232/232; `check-lessons --strict` 0 errors; `tests/smoke.js` 41 pages clean; `test/pes.e2e.js` (whole period, lock, PIN, help, teacher page, bundled key over file://) and `test/pes-guide.e2e.js` (10-caption demo, 53 s, state unchanged; tutorial arrows) pass; `tests/vlab-standard.e2e.js "chem 5"` and `tests/lock.e2e.js "virtual lab pes"` pass. Failing on a clean checkout too, not touched: `npm run gate` (unreviewed content), `flame.e2e.js` line 96, and `vlab-standard` physics huddle 2.

Not done: no word-rule test (no term list for slot 11 in the repo); the lab is live only when `main` deploys.

## 2026-11-09: Unit 3 slot 15, Effective Nuclear Charge and Shielding (v3 sim day)

Built from `node tools/new-lesson.mjs chem effective-nuclear-charge ... --unit unit-3-atoms-ions`. Data and generators in `day-cards/slot-15.content.js`; design in `day-cards/slot-15.card.md`.

- Page, spec, Explore (Pull Meter) and wiring: `effective-nuclear-charge.{html,spec.js,content.js}`; Models tab `.models.js`; shared model and atom picture `chemistry/shared/zeff.js`.
- v3: two huddles (hold at minute 3, writable at 25), 3-item warm-up with no placement, three hidden bands, no stamp and no report code (own Notes step; scores still saved via `MrD.profile.record`).
- Registered: `shared/lessons.js`, hub card (`chemistry/labs.js`, day 15), `portal/standards.json` (CHEM-ATOM-7).
- Tests: `tests/unit/slot-15-content.test.js` (model recomputed independently; dip pairs recomputed against `PESData`), `tests/lessons/effective-nuclear-charge.e2e.js` (overrides the v2 placement, minute-18 huddle, pace-trim and stamp tests with v3 versions; adds Pull Meter, Models, banned words), lock target.
- Worksheet (30 points, scales printed) and key: `effective-nuclear-charge-worksheet{,-key}.{docx,pdf}`. Outline and key in `.md`. `keys/chem/effective-nuclear-charge-makeup.*` built; `build-keys.mjs` teacher key does not support a v3 pace plan (it expects `P.steps`), so it is not built.

For Ian: pull = Z_eff ÷ n² is my classroom number. The 13 pairs where it contradicts measured first ionization energy are left out of every item (slot 17). No projector page. Not on the site until merged to `main`.

## 2026-11-09: Unit 3 slot 14, The table as a map of configurations (DI day bundle)

Built by `docs/slot-14/build_slot14.py` (one source; every number computed from an independent shell-filling model and asserted). Outputs in `docs/slot-14/out/`: typed notes (pdflatex), board script (xelatex, red margin remarks), problem sheet and key, exit slips (docx, one page of six), each with its `.tex` or `.docx` source.

- Big question: if I tell you only where an element sits on the table, what can you say about its electrons? Two chunks (build the table from the ladder; valence configuration from position). Nine keepers, three live questions, a core of eight sheet items (14 of 15 minutes, asserted). Clock sums to 50.
- Table figure through Z = 36 drawn in TikZ; exit slips carry a blank grid (matplotlib) for the drawing.
- Not taught: Cr, Cu, transition-metal ions, the f block (named only). Slot 10 owns valence, shorthand and Lewis dots; today only uses them.
- Not done: the Excalidraw stencils (blank table, energy ladder) are named in the script but not drawn; typed notes and script have no ladder figure (the row-by-row filling table stands in).
- Nothing here is on the site; the files are for printing.

## 2026-11-10 — Slot 15 as a notes huddle; chem lesson board
- Sim days have ONE huddle at minute 21, mode `write` (DAY-RULES 8d; `pace.js` per-huddle `mode`). No minute-3 or minute-25 huddle on slot 15. Other v3 sim days (e.g. slot 9) still use two huddles until rebuilt.
- New lesson board `chemistry/whiteboard/index.html#lesson=zeff` (4 frames, answers under covers) and Z_eff stencil shelf. Board script: `day-cards/slot-15.board.md`.
