# Chemistry Unit 4: Periodic trends, bonding and naming (college prep)

Everything for the unit lives here. Spine: FHSST *Chemistry Grades 10–12* (`chemistry/resources/Chemistry_Grade_10-12.pdf`), chapters 3.8 and 4, plus 1.3 and 12.2 for names and formulas. College prep: no ionization-energy equations, no Z_eff numbers, no shielding calculations.

Built with the unit pipeline (skill `unit-backwards-pipeline`): standards → test → day map → each day's materials → study guide.

## Standards

Core is what a C student must show on the test; stretch is the one item at the end of the test.

| # | Core: the student can… | Bloom's | Stretch | Bloom's |
|---|---|---|---|---|
| 4.0 | describe how atomic size, reactivity and electronegativity change across a period and down a group, and explain them with "more shells" or "more protons on the same shell" (no numbers) | Understand | rank three or four elements and justify the order in a claim-evidence-reasoning paragraph | Analyze |
| 4.1 | explain that atoms bond to get a full outer level (octet rule), and why noble gases do not bond | Understand | explain bonding as atoms reaching a lower energy | Understand |
| 4.2 | draw Lewis dot symbols for groups 1, 2 and 13–18, and count unpaired electrons | Apply | predict how many bonds an atom usually makes | Apply |
| 4.3 | show an ionic bond as electrons moving from a metal to a nonmetal; predict each ion's charge from its group | Apply | explain high melting points and conducting when dissolved | Understand |
| 4.4 | write and name binary ionic compounds (lowest whole-number ratio) | Apply | five common polyatomic ions; Roman numerals | Apply |
| 4.5 | draw Lewis structures for H₂, HCl, H₂O, NH₃, CH₄; recognize double and triple bonds in O₂, N₂, CO₂ when shown | Apply | draw double or triple bonds without help | Apply |
| 4.6 | name molecular compounds with prefixes; write formulas from names | Apply | | |
| 4.7 | classify a bond as ionic, covalent or metallic from the elements; use the sea of electrons for conducting and bending | Analyze | electronegativity → polar or nonpolar covalent | Analyze |

Cut: oxidation numbers, VSEPR shapes, the bond-energy curve, formal charge, resonance.

## Test

- `unit-4-test.pdf`, `unit-4-test-key.pdf` (61 points, 19 questions; Q19 is the stretch item). Source: `src/unit-4-test/test.tex` (set `\keytrue` or `\keyfalse` in a `mode.tex` beside it; pdflatex).

## Day map (draft; the number of days before winter break is still to be set)

Rhythm: two notes days, then a practice day; a quiz after every two of those blocks (so Quiz 1 follows Day 6; the next follows the next two blocks); review day; test.

| Day | Type | Standards | Status |
|---|---|---|---|
| 1 | Notes: periodic trends | 4.0 | built (below) |
| 2 | Notes: why atoms bond, Lewis dot symbols | 4.1, 4.2 | built (below) |
| 3 | Practice: trends and Lewis symbols | 4.0–4.2 | built (below) |
| 4 | Notes: ionic bonds, ion charges | 4.3 | built |
| 5 | Notes: ionic formulas and names | 4.4 | built |
| 6 | Practice | 4.3–4.4 | built |
| Quiz 1 | Quiz after Days 1 to 6 (25 min, 28 points) | 4.0–4.4 | built (below) |
| 7 | Notes: covalent bonds, Lewis structures | 4.5 | built |
| 8 | Notes: naming molecular compounds; bond types | 4.6, 4.7 | built |
| 9 | Practice | 4.5–4.7 | built |
| 10 | Review (study guide) | all | built (no board yet) |
| 11 | Test | all | built |

## What a day is made of

**Notes day**
1. Trailer (optional, 1–2 min): the hook, played before the notes.
2. Cornell notes (`day-NN-*-notes.docx`, key beside it): printed body with key-word blanks, terms in the left column, one check question at the foot of each part, an exit check and summary at the end. Two pages.
3. Lesson board on the chem board (`chemistry/whiteboard/index.html#lesson=<id>`): preset pictures only, empty space to draw in, a green Words box per frame, the check under a cover.
4. Board script (`day-NN-*-board-script.pdf`): numbered steps (SAY, DRAW in the pen color with a picture of the result, ASK, WORDS, CHECK), time checkpoints, and behind/ahead plans. Pens: blue shells and distance, red protons and pull, green new words, purple shared electrons.

**Practice day**
1. Warm-up: three retrieval questions from earlier days.
2. Game or lab on the site (for example the Trends Lab) for the first part of class.
3. Problem sheet: review, concept questions, practice, then a hidden-tier challenge on its own sheet.
4. Exit check. The 4-of-5 rule decides whether the next day is new material or more practice.

## Day 1: periodic trends (4.0)

| Piece | File |
|---|---|
| Trailer | `element-trailer.html` ("Where did salt come from?") |
| Cornell notes | `day-01-trends-notes.docx`, `day-01-trends-notes-key.docx`, preview `day-01-trends-notes.pdf`; source `src/day-01-notes/` (`node make.js` and `node make.js key`; figures from `python3 figs.py`) |
| Lesson board | `chemistry/whiteboard/index.html#lesson=trends` (source `tools/whiteboard/src/lessons/chem-trends.js`) |
| Board script | `day-01-trends-board-script.pdf` (source `.tex`, xelatex) |
| Game / lab | `trends-explorer.html` (Trends Lab), for the Day 3 practice day |

`energy-diorama.html` is unfinished and parked; leave it alone.

## Day 2: why atoms bond, Lewis dot symbols (4.1, 4.2)

| Piece | File |
|---|---|
| Cornell notes | `day-02-bonding-notes.docx`, `day-02-bonding-notes-key.docx`, preview `day-02-bonding-notes.pdf`; source `src/day-02-notes/` (`node make.js` and `node make.js key`; figures from `python3 figs.py`) |
| Lesson board | `chemistry/whiteboard/index.html#lesson=bonding` (source `tools/whiteboard/src/lessons/chem-bonding.js`) |
| Board script | `day-02-bonding-board-script.pdf` (source `.tex`, xelatex) |

Four parts (valence electrons, the octet rule, Lewis dot symbols, unpaired electrons), a check at the foot of each, an exit check and a summary. Dots follow the unit test: one on each side (top, right, bottom, left), then pair up starting at the top. Left out on purpose: "lower energy" (the 4.1 stretch) and predicting how many bonds an atom makes (the 4.2 stretch); neither has a test question.

## Day 3: practice, trends and Lewis symbols (4.0 to 4.2)

Half online, half paper. The online half is the Trends Lab (4.0 only); the paper half does the Lewis symbols and unpaired electrons, which the lab does not touch.

| Piece | File |
|---|---|
| Student sheet (two pages: review, concepts, practice) | `day-03-practice-sheet.docx`, `.pdf` |
| Practice Set B (its own sheet, no labels) | `day-03-practice-sheet-b.docx`, `.pdf` |
| Exit slips (four to a page) | `day-03-practice-exit-slips.docx`, `.pdf` |
| Key with the likely error for every item, the exit answers and the 4-of-5 decision | `day-03-practice-key.docx`, `.pdf` |
| Teacher run sheet | `day-03-practice-run-sheet.docx`, `.pdf` |
| Board | `chemistry/whiteboard/index.html#lesson=practice3` (source `tools/whiteboard/src/lessons/chem-practice-3.js`): warm-up, Trends Lab prompt, whiteboard rounds, exit check |
| Lab | `trends-explorer.html` (Trends Lab, black at 20 minutes after the bell) |

Sources are in `src/day-03-practice/` (`node make.js sheet|setb|slips|key|run`; figures from `python3 figs.py`). No item copies a test item (the test draws Ca, Al, P and Br and asks about phosphorus).


## Day 4

| File | What it is |
|---|---|
| `day-04-ionic-notes.docx` / `.pdf` | Cornell notes, 2 pages: ions, ion charges, the ionic bond, naming ions |
| `day-04-ionic-notes-key.docx` | Key |
| `day-04-ionic-board-script.pdf` / `.tex` | Numbered, color-coded script |
| Board | `chemistry/whiteboard/index.html#lesson=ionic` (`tools/whiteboard/src/lessons/chem-ionic.js`) |

Examples avoid the test's: Li with F, Mg with O, Ca with O. No formulas (day 5). Sources in `src/day-04-notes/`.

## Day 5

| File | What it is |
|---|---|
| `day-05-formulas-notes.docx` / `.pdf` | Cornell notes, 2 pages: balanced charge, writing a formula, naming, formula from a name |
| `day-05-formulas-notes-key.docx` | Key |
| `day-05-formulas-board-script.pdf` / `.tex` | Numbered, color-coded script |
| Board | `chemistry/whiteboard/index.html#lesson=formulas` (`tools/whiteboard/src/lessons/chem-formulas.js`) |

Examples avoid the test's formulas (MgCl₂, Al₂O₃, CaS, Li₃N, KBr, CaO, AlCl₃, Na₂S): Na₂O, MgBr₂, Al₂S₃, Ca₃N₂, BaF₂, K₂O, CaF₂, K₃P, BaCl₂, Ga₂O₃. Sources in `src/day-05-notes/`.

## Day 6

Practice for 4.3 and 4.4, half online (Trends Lab stage 2 "one of each" and stage 3 "the dish"), half paper. The 4-of-5 rule on the slips decides Day 7.

| File | What it is |
|---|---|
| `day-06-practice-sheet.docx` / `.pdf` | Main sheet, 2 pages: ions, ionic bond dots, formulas, names |
| `day-06-practice-sheet-b.docx` / `.pdf` | Set B for finishers (CER on 1:1 and 1:2, group from a formula, an ion from its electrons) |
| `day-06-practice-exit-slips.docx` / `.pdf` | Exit slips, four to a page |
| `day-06-practice-key.docx` / `.pdf` | Key, likely errors, and where to reteach each slip item |
| `day-06-practice-run-sheet.docx` / `.pdf` | Teacher run sheet |
| Board | `chemistry/whiteboard/index.html#lesson=practice6` (`tools/whiteboard/src/lessons/chem-practice-6.js`) |

Sources in `src/day-06-practice/`. No sheet or slip item copies a test item.


## Quiz 1 (after Day 6)

| File | What it is |
|---|---|
| `unit-4-quiz-1.pdf` / `unit-4-quiz-1-key.pdf` | 10 questions, 28 points, covers 4.0 to 4.4. New items only: none repeats a test item |
| Source | `src/quiz-1/quiz.tex` (pdflatex with a `mode.tex` holding `\keytrue` or `\keyfalse`, as the test) |

## Day 7

| File | What it is |
|---|---|
| `day-07-covalent-notes.docx` / `.pdf`, `-notes-key.docx` | Cornell notes, 2 pages: sharing, the shared pair, more bonds, double and triple |
| `day-07-covalent-board-script.pdf` / `.tex` | Numbered, color-coded script |
| Board | `#lesson=covalent` (`chem-covalent.js`) |

The notes teach H₂, HCl, H₂O, NH₃, CH₄, O₂, N₂ and CO₂ (the standard lists them); its checks and exit use H₂S, PH₃, N₂ and water's lone pairs.

## Day 8

| File | What it is |
|---|---|
| `day-08-naming-notes.docx` / `.pdf`, `-notes-key.docx` | Cornell notes, 2 pages: prefixes, name and formula, three kinds of bonds, sea of electrons |
| `day-08-naming-board-script.pdf` / `.tex` | Numbered, color-coded script |
| Board | `#lesson=naming` (`chem-naming.js`) |

Examples avoid the test's names (SO₂, N₂O₅, CCl₄, CO₂, N₂O₄, PCl₃, CO) and classifications (NaCl, H₂O, Cu, MgO, Fe).

## Day 9

Practice for 4.5 to 4.7, half online (Trends Lab stage 2 hydrogen pairs and the stage 3 dish), half paper. The 4-of-5 rule on the slips decides whether Day 10 is the review.

| File | What it is |
|---|---|
| `day-09-practice-sheet.docx` / `.pdf` | Main sheet, 2 pages |
| `day-09-practice-sheet-b.docx` / `.pdf` | Set B (CER on CH₄ and NH₃, H₂Se, metallic vs ionic solids) |
| `day-09-practice-exit-slips.docx` / `.pdf`, `-key`, `-run-sheet` | Slips, key with reteach map, run sheet |
| Board | `#lesson=practice9` (`chem-practice-9.js`) |

## Day 10: review (study guide)
Study guide mirrors the test part by part (A trends, B why atoms bond, C ions and ionic compounds, D molecular compounds, E bond types, stretch), with a "Know this" box per part and new atoms and compounds, none of them the test's.

| Piece | File |
|---|---|
| Study guide (4 pages) | `day-10-review-study-guide.pdf` |
| Key (3 pages) | `day-10-review-study-guide-key.pdf` |
| Run sheet | `day-10-review-run-sheet.pdf` |
| Source | `src/day-10-review/guide.tex`, `run.tex` (key vs student via `mode.tex`) |

No board for Day 10 yet; the run sheet points to the Day 1 to Day 8 boards for reteach.

## Stickers
Unit 4 sticker page, #121 to #144 (24 stickers, 3 rare), in `stickers/` (`unit4-stickers-121-144.pdf`, contact sheet, SVGs, `build.py`). Numbers append to the existing set #1 to #120.
