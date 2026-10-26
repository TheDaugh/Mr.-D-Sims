# Task: rebuild slot 4 (Free-body diagrams and net force) around the v2 content

Work on branch `slot-4-fbd` (PR #12). First `git pull`, read `docs/LESSON-STANDARD.md` and `tests/README.md`. Reuse the engine, kit, registry, validator and e2e runner. Never merge. Push to the branch and update PR #12.

## Authority
`physics/lessons/content/fbd-net-force.v2.content.js` is the content. Ian and Claude chat wrote and verified it (`tests/unit/fbd-v2-content.test.js`, 300 seeds, independent solver). You wire it. Do not rewrite, shorten, "improve" or re-derive any prompt, worked step, answer or misconception. If you think an item is wrong, list it in the PR and leave it.

## What changes and why
1. **Formalization replaces the huddle as the heart of the lesson.** Add a **Model problems** tab after Explore. It plays `MODELS` M1 to M5 in order with the six `MOVES` as a fixed left rail.
   - Each model: show the problem, then the Predict question (one try, then `predictAnswer`), then reveal `steps` one at a time with a "Next move" button. The current move highlights in the rail. Draw the FBD in SVG as move 2 appears; draw the whole-system and single-block diagrams for M4 and M5.
   - Gradual release: M1, M2 are "watch" (steps appear on button press, no input). M3, M4 are "with me": move 4 (write the sum of forces) and move 5 (solve) are typed by the student, one try, then the step shows. M5 is "you do": the student works all six moves in the same rail; each move unlocks when the previous is answered; the final answer is a numeric input.
   - M3 has a `youDo` follow-up with `youDoAnswer`.
   - Show `slip` as a boxed "Watch for" note after the answer.
   - Math Medic register: symbols before numbers, units carried, a stated sign convention, a sense-check every time. No paragraphs: each step is one or two sentences.
2. **Huddle shrinks to a 3-minute class check.** Keep the three-diagram gate and the C/M/X/S code. Remove the fill-in-the-blank definitions as the main event; the huddle tab only shows the gate, the code box and a link back to Model problems.
3. **Six hidden bands, not four.** Band 1 core, 2 honors, 3 AP Physics 1, 4 AP C / F=ma, 5 olympiad, 6 college. Each band has four task types in `LADDER[band]`. A band changes the task, not only the numbers. Never show band names, levels or the words extension/challenge to students. Placement: the Vectors and Proportions Check maps 0-2 right to band 1, 3-4 to 2, 5 to 3, 6 to 3 with the `fluent` flag. Adaptation: clean first try moves up one band, one miss holds, two misses drop one band and show the reasoning. Cap the Build tab at band 4; bands 5 and 6 appear only in Practice and Check for students who reach them. Log rung (A bands 1-2, B bands 3-4, C bands 5-6), band, misses and seconds to the report code exactly as now.
4. **Practice and Check use `FBD_V2.make(band, seed)`.** Seed from the student ID so each student sees different numbers. Numeric items use the engine's numeric type (1% tolerance). Items with `answer2` ask for both values. Items with `symbolic` show the symbolic result in the worked step after the student answers, and bands 4 to 6 give a "derive first" line: the student commits a one-line symbolic setup (choose from the engine's cloze) before the number box unlocks. `l5-limits` is a choice item. Add per-item `misc` to the teacher key.
5. **Six sims** from `SIMS`, in `physics/lessons/sims/`, each a small SVG or canvas page on the shared kit, one idea per canvas, 1366×768, page tokens for color, 14px minimum text, subject filling a third of the canvas, large labels. Each sim has the hidden element listed in its spec (predict before the readout shows) and a task card per band. Link each sim from the Practice tab only for students in its bands; Explore keeps Arrow Builder for bands 1-2. Draw everything in code. No placeholders.
   - Arrow Builder, Elevator Scale, Friction Ramp, Two-Block Lab, Rope Tension Profile, Chain at the Table Edge.
   - Physics in each sim must reproduce the formulas in the content file; use `FBD_V2` constants. Show the live FBD next to the numbers.
6. **Keys.** Extend `tools/build-keys.mjs` so the teacher PDF prints all six bands (one sample each) and all five models with steps. Rebuild `keys/physics/fbd-net-force-*.pdf`.

## Scope fence
1-D forces only. No components (slot 20), circular motion, momentum, energy or drag. Gravity is surface weight, g = 9.8 m/s².

## Verify before you report
- `node --test tests/unit/*.test.js` and the slot 4 e2e (add steps for the Model problems tab, the band cap in Build, band 5 and 6 reaching Practice).
- Click through every sim and every model with Playwright at 1366×768 and screenshot each. Look at them.
- Check that a student who misses twice at band 1 stays at band 1 and sees the reasoning; that a student who answers cleanly reaches band 5 within Practice; that no student-facing string contains "extension", "challenge", "optional", minutes or a name.
- Final message: five lines or fewer.
