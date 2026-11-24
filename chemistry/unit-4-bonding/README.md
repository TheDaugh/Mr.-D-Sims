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

Rhythm: two notes days, then a practice day; review day; test.

| Day | Type | Standards | Status |
|---|---|---|---|
| 1 | Notes: periodic trends | 4.0 | built (below) |
| 2 | Notes: why atoms bond, Lewis dot symbols | 4.1, 4.2 | to build |
| 3 | Practice: trends and Lewis symbols | 4.0–4.2 | to build |
| 4 | Notes: ionic bonds, ion charges | 4.3 | to build |
| 5 | Notes: ionic formulas and names | 4.4 | to build |
| 6 | Practice | 4.3–4.4 | to build |
| 7 | Notes: covalent bonds, Lewis structures | 4.5 | to build |
| 8 | Notes: naming molecular compounds; bond types | 4.6, 4.7 | to build |
| 9 | Practice | 4.5–4.7 | to build |
| 10 | Review (study guide) | all | to build |
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
