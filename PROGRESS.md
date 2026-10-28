# Progress

Update this at the end of every session. Newest entry first.

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
