# DAY CARD: Stats Unit 3, Slot 11. 3.6 Finding boundary values

route: A (engine lesson, stats template)
cites: Stage 1 Desired Results (Unit 3), slot 11 row, targets T13 and T14, EQ4, U6
content authority: `stats-11.content.js` (data and generators), verified by `stats-11-content.test.js`
status: DRAFT for Ian's review. Not pushed. Not run against the repo's own harness (see Verify).

targets
- T13 (Core): I can find the value that matches a given percentile in a normal distribution.
- T14 (Rigor): I can find a missing mean or SD of a normal distribution from the value of a percentile.
  Student pages never say "Rigor". T14 is the first thing trimmed (see Pacing).

question: How do I go from a percent to a cutoff? (EQ4)

## Wiring (what the coder does)
1. `node tools/new-lesson.mjs stats 3-6-boundary-values "3.6 Finding Boundary Values" --unit unit-3-normal-distribution`
2. Merge the exports of `stats-11.content.js` into the new spec: `skills`, `warmup`, `predicts`, `models`, `exit`, `misconceptions`, `pacing`. Do not rewrite, shorten or re-derive any prompt, step, answer or misconception. List doubts in the PR.
3. Build the Explore sim, the Models tab, the board page and the normal-curve figure described below.
4. Numeric answers carry `tol`. Mark right if the student is within `tol`. This lets a student who rounds z to two decimals pass.
5. Items carry `figure` descriptors (`kind: 'normal'`). Draw them as the `pic` the review spec uses, or with NK.curve. A `?` means unknown.

## WARM-UP  (`warmup`, bands 1 and 2)
Retrieval from 3.5 plus the words 3.6 needs. W5 uses the 68 / 34 rule from 3.4. The `talk` line is for the huddle.

## PREDICT
P1 above or below 30 (90th percentile). P2 estimate first: the 90th percentile sits between 36 (84th) and 42 (about 97.5th). P3 (fastest 20% is below 30) is **added by Claude**. One try, then the reason shows.

## EXPLORE: Slide the boundary
- One idea: the boundary is the value that has a chosen area to its left.
- Picture: a normal curve, mean 30 minutes, SD 6, axis in MINUTES (not z).
- Student drags one boundary until the shaded left area matches a target. Targets in order: 0.50, 0.90, 0.20, 0.95 (`explore.answers` has the values: 30.0, 37.7, 25.0, 39.9).
- Area readout hidden until Commit. After Commit, the value shows in minutes. Predict before the readout: P1 and P2.
- Logged per run: target, boundary dragged to, committed area, tries.
- Not in the card: NK.curve works in z steps (its header says so). This sim needs a minutes axis and a target-area mode. Extend NK.curve or add NK.boundary; the coder decides.

## MODELS  (`models`, the Formalize tab; five moves in a left rail)
| | mode | problem | what the student does |
| --- | --- | --- | --- |
| M1 | watch | 90th percentile of delivery time, N(30, 6) | steps appear on "Next move"; no input |
| M2 | with me | cutoff for the fastest 20% | types moves 2 (area to the left) and 3 (the invNorm entry) |
| M3 | you do | cutoff for the slowest 5% | works all five moves |
| M4 | watch (T14) | missing mean: SD 6, 90th percentile is 40 | |
| M5 | with me (T14) | missing SD: mean 30, 90th percentile is 40 | types moves 3 and 4 |
Moves: Sketch and shade, Area to the left, Enter invNorm, Sense-check, Say it in a sentence. Each model shows its `slip` as a boxed "Watch for" note. M4 and M5 carry `rigor: true`; skip them first when pace trims.
Do NOT use NK.routine (its six moves are the z-table routine).

## BOARD  (projector; `board`)
Same normal-curve figure with `interactive: false`; reveal order is `board.reveal`; Ian presses forward and blanks fill, or writes them himself. Ink on the figure is PENDING Ian's decision 2.

## GATE
Items that count: `gate.items`. The clear/hold rule is PENDING Ian's decision 1. Until then use the standard huddle (rule 17).

## SKILLS  (`skills`: direction, boundary, missing; four bands, a different item type in each cell)
| band | direction (Area or boundary?) | boundary (T13) | missing (T14) |
| --- | --- | --- | --- |
| 1 | sort: plain one-liner | picture: shaded left area given, find the percentile value | word: mean missing, z given |
| 2 | sort: wider wording (cutoff, percentile) | word: top q% or bottom q%, pick the left area | backward: mean missing, find z yourself |
| 3 | sort: a short scenario (refund, "late") | two answers: the middle q%, lower then upper | solve: SD missing |
| 4 | tool choice: normalcdf or invNorm | screen-read, or error-find (wrong tail) | lower-tail percentile, mean or SD missing |
Answers are rounded to 0.1 with `tol` of at least 0.1. SDs stay at 15 or less so a z rounded to 2 decimals stays inside `tol` (tested).

## EXIT  (`exit`, `scoring`)
X1 sort (boundary); X2 75th percentile of N(70, 8) = 75.4; X3 lowest 10% of N(70, 8) = 59.7. All three are **added by Claude**: the Stage 1 doc says only "Exit ticket". T14 is not on the exit.
Scoring borrowed from the chem rule (3 = secure, 2 = developing, 0 to 1 = not yet). The stats docs do not say; confirm.

## MISCONCEPTIONS  (`misconceptions`)
All five are **added by Claude**: wrong tail for a percentile, wrong tail for "slowest 5%", answering with z instead of a value, argument order in invNorm, multiplying instead of dividing by z.

## PACING
Template pace, budget 42, timed huddle at minute 18. Build parts in order: direction, upper-tail boundary, lower-tail boundary, missing mean or SD. The last part is cut first (Stage 1 trim option 4 holds T14 for review). Priority 1 minutes total 22 of 42.

## Verify
- Done: `node --test stats-11-content.test.js` passes 13 of 13 against a scipy `norm.ppf` fixture (999 grid points): every model answer, every generated answer recomputed from the item's own numbers, tail wording checked, the Area-or-boundary labels checked by rule, and a simulated student who rounds z to 2 decimals passes every item.
- Not done: nothing here has been loaded by `tools/check-lessons.mjs`, `tests/unit`, or the e2e runners. The coder runs those and reports what printed.

## Flags for Ian
1. **Only the Stage 1 doc was attached.** I did not see Stage 2 evidence, the Stage 3 learning event for slot 11, or the 3.6 guided notes ("Notes built"). The exit, misconceptions and P3 are mine. Attach the notes and the board blanks can match them word for word.
2. **z-table conflict.** Stage 1 says technology for every boundary and never a z-table. The stats kit adds a Table tab to every stats lesson's Concepts panel automatically (stats/shared/README.md). Decide: switch the Table tab off for 3.6, or leave it.
3. **Calculator.** The doc says "calculator or the class sims". I wrote invNorm(area to the left, mean, SD), which is the TI-84 form. Confirm what students hold.
4. **The "in progress" lesson** in the Stage 1 status column is not in the repo (the stats folder has only the 3.1-3.3 review). If someone started a 3.6 page elsewhere, compare before building.
5. **Engine work this card needs:** a minutes-axis boundary sim, the Models tab, the board reveal, a normal-curve figure for items. None exist for a boundary lesson today.
