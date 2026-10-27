# DAY CARD: Unit 3, Slot 9. Electron configurations I: levels, sublevels, Aufbau

route: A (engine lesson)   cites: UBD Unit 3 build spec, Slot 9; facts bank rows on Aufbau, capacities, Hund
content authority: `slot-09.content.js` (data and generators), verified by `slot-09-content.test.js`
status: DRAFT for Ian's review. Not pushed. Not run against the repo's own harness (see Verify).

targets
- T7 (Core): I can write ground-state electron configurations (full form) for atoms through Z = 36, and draw orbital diagrams.
  (Ions, noble-gas shorthand and Lewis dots belong to slot 10. Do not build them here.)

question: Where does each electron go, and what decides the order?

## Wiring (what the coder does)
1. `node tools/new-lesson.mjs chem electron-config-1 "Electron Configurations I" --unit unit-3-atoms-ions`
2. Merge the exports of `slot-09.content.js` into the new spec: `skills`, `warmup`, `predicts`, `models`, `exit`, `misconceptions`, `pacing`. Do not rewrite, shorten or re-derive any prompt, step, answer or misconception. List doubts in the PR.
3. Build the Explore sim, the Models tab, the board page and the ladder figure described below.
4. Answer type `config`: read with `sameConfig(student, answer)`. It accepts any spacing, `^`, superscripts, and either 4s-first or shell order.

## WARM-UP  (from the six Foundations questions; bands 1 and 2)
`warmup` W1 to W6. Foundations Q6 ("After 3p, where does the next electron go?") is huddle talk (`talk`), not a warm-up item, because it gives away P1.

## PREDICT
`predicts` P1 (UBD: the 19th electron, 3d or 4s; answer 4s). One try, then the reason shows.
P2 (Hund, three electrons in empty 2p) is **added by Claude**; delete it if you do not want it.

## EXPLORE: Orbital Filler
- One idea: electrons fill the lowest open box, one at a time.
- Picture: an energy ladder of eight subshells, bottom to top 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, with 1, 1, 3, 1, 3, 1, 5, 3 boxes (18 boxes, 36 electrons in all). Energy axis on the left. Drawn from the start.
- Controls: the atom is set by the task (title shows element and Z). The student drags one electron at a time into a box.
- Hidden until the student commits an order: the filling order. Predict before the readout: P1.
- Readouts: electrons placed, electrons left.
- Rejections, each with a one-line reason:
  - Aufbau: "A lower subshell still has room."
  - Pauli: "A box holds 2 electrons, spins opposite."
  - Hund: "Another box in this subshell is empty. Fill it first."
- Logged per run: placement order, rejections by rule, final configuration.
- Recorded table (auto-checked, `recorded`): configurations for Z = 3, 7, 11, 15, 19 written from the filled ladder, then the capacities s 2, p 6, d 10.
- Simplification for the key: the ladder is the neutral-atom order through Z = 36. Cr and Cu are never reachable from the tasks. `background` is one line in the notes, marked in the key, never assessed.

## MODELS  (`models`, the Formalize tab)
| | mode | atom | what the student does |
| --- | --- | --- | --- |
| M1 | watch | phosphorus, Z = 15 | steps appear on "Next move"; no input |
| M2 | with me | sulfur, Z = 16 | types moves 4 (write) and 5 (draw the boxes); one try, then the step shows |
| M3 | you do | iron, Z = 26 | works all six moves in the rail; each unlocks when the last is answered |
Six `MOVES` stay in a left rail. Every model shows its `slip` as a boxed "Watch for" note after the answer.

## BOARD  (projector page; `board`)
- Same ladder figure, drawn by the same code with `interactive: false`.
- Reveal order is `board.reveal`; Ian presses forward and blanks fill, or writes them himself.
- Writing on the figure (ink) is PENDING Ian's decision 2. Build the reveal only.

## GATE
Items that count: `gate.items`. The clear/hold rule is PENDING Ian's decision 1. Until then use the standard huddle (rule 17) and do not change the one-code-per-day behavior.

## SKILLS  (`skills`: write, read, rules; four bands, a different item type in each cell)
| band | write | read | rules |
| --- | --- | --- | --- |
| 1 | word: config for Z 3 to 10 | picture: ladder with every electron drawn, name the element | numeric: capacity of a subshell |
| 2 | word: config for Z 11 to 18 | picture: ladder with N-1 electrons drawn, which subshell gets electron N | numeric: unpaired electrons, Z 11 to 18 |
| 3 | word: config for Z 19 to 36 (not 24, 29) | numeric: read a configuration, give Z | error-find: pick the mistake (capacity, skipped subshell, 3d before 4s is full) |
| 4 | backward: n electrons in 3d, none in 4p, write the config | numeric: unpaired electrons in 3d, picture hidden | backward: k unpaired, all in 3p, which Z (answer and answer2) |
The energy ladder is this lesson's "graph". The true graph item arrives in slot 11 (PES).

## EXIT  (`exit`, `scoring`)
X1 oxygen configuration; X2 capacity of 3d; X3 4s or 3d first. One point each, first try. 3 secure, 2 developing, 0 to 1 not yet.

## MISCONCEPTIONS  (`misconceptions`)
Two from the UBD; the third (a p subshell holds 2) is **added by Claude**.

## PACING
Template pace, budget 42, timed huddle at minute 18 (`pacing`). Priority 1 minutes total 22 of 42.

## Verify
- Done: `node --test slot-09-content.test.js` passes 15 of 15: the model agrees with an independent Madelung-rule solver for Z 1 to 36 (Cr and Cu handled as real exceptions), 300 seeds x 4 bands x 3 skills, backward clues are unique by brute force, no banned words.
- Not done: nothing here has been loaded by `tools/check-lessons.mjs`, `tests/unit`, or the e2e runners. The coder runs those and reports what printed.

## Flags for Ian
1. **Added by Claude, delete freely:** predict P2, misconception 3, warm-up W2 wording, W6.
2. **UBD gap:** the UBD gives no rejection wording and no Explore control details for the sim. The Explore section above is my design.
3. **Engine work this card needs:** a `config` answer type, a ladder figure (`figure.kind: 'ladder'`), the Models tab, the board reveal. None exist in the chem template today.
