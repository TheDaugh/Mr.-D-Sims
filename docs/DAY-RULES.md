# Daily materials: rules and handoff (Mr. D, Chemistry Unit 3)

Start every slot chat by attaching this file, the slot-08 files (the worked exemplar) and the UBD docx. Then say: "Do Slot N."

## Who does what
- **Mr. D:** first contact, explaining, drawing on the pen display, reading the room, both huddles.
- **Claude (chat):** one sheet per slot, the data and item bank, the tests, the 5-line coder prompt.
- **Coder:** builds only what the sheet and data say. Pushes to a branch, never merges to main.

## The 42-minute day
0:00-0:03 warm-up (max 3 easy picture items, review only) / 0:03-0:11 huddle 1 (review, hook, first contact, code 1) / 0:11-0:25 explore / 0:25 global stop, huddle 2 (formalize: 3 worked problems, 3 crux questions, code 2) / practice / exit ticket (a drawing on paper; Mr. D scans it by eye).

## Rules
1. Students never meet a term, picture or tool that Mr. D did not explain or a tutorial did not teach. Every term in the sheet is tagged: Mr. D says it / tutorial / earlier lesson. Max 2 tutorials per day, each at most 60 seconds, drawn as pictures.
2. Every figure has a reading guide: what the axes are, what one mark means, where to look first, what a wrong reading looks like.
3. Actual phenomenon or picture first; the abstraction (energy diagram, formulas) comes after huddle 2.
4. Huddle 2 is the most important block: it states what will be tested.
5. Models and steps are presented by Mr. D, not walked through on the site. The site has the attempt, the picture feedback and the hints.
6. Hints: point to the step card, do the first step, show the same move on another example. No hint gives the answer. Each costs a fresh attempt.
7. Three hidden bands, a ramp to the regular-level standard. Every student must complete that standard; the top band IS the standard, with nothing above it and no AP content. Nothing is labeled extension, challenge or optional. No lesson skipping or trimming: ramp the knowledge during explore and after huddle 2 instead.
8. Two huddle codes. Remove the end-of-lesson stamp and the report code. KEEP the locally stored scores (`MrD.profile.record`, saved on the student's own device). No board reveal/fill. The projector page is only the questions plus room to draw.
8b. Global clock: huddle 1 is called at 0:03 (end of warm-up), huddle 2 at 0:25. Lab days may set huddle 2 later, because a lab cannot be cut off at 25 minutes. Placement warm-up is retired. Explore replaces it: it starts at band 1, rises with success, and holds more items than the time allows, so no student runs out before the 0:25 bell.
8c. Huddle 1 is the teacher talking (review, hook, first contact), so students see a hold screen. Huddle 2 is the formalizing tab with the write-on blanks.
9. Teacher key view shows every individual question next to the lesson, plus a few generated problems per band.
10. Cornell/MLA notes are a separate LaTeX deliverable built from the huddle (exemplar pending from Mr. D).
11. Content bounds come from the UBD: nothing from the next day bleeds into today. Slot 10 owns ions, noble-gas shorthand, valence electrons, Lewis dots.
12. Accuracy: every number is sourced, or marked `author_set` in the data. No guessed values.
13. Tests check arithmetic AND teachability: a coder test fails if a content word on a student screen is missing from the sheet's term list.
14. Paper fallback: the explore page must print.

## Five outputs per slot
1. `slot-NN.sheet.pdf` (Mr. D marks this up; it is the only file he opens)
2. `slot-NN.sheet.tex`, 3. data JSON, 4. `items.json`, 5. content test, plus the 5-line coder prompt.

## State of the build (as of 2026-10-27)
- **Slot 8 (flame tests):** RECUT as a lab day in the existing virtual-lab room (pre-lab gate, tutorial quests, flame bench, notebook, CER, huddle 2 late). Sheet (5 pages), flame data, `lab-content.json` and the test (51/51) are written and await Mr. D's markup. The practice set is kept for home only. New lab module `04-flame-tests` is needed (repo has no flame/burner/spectroscope). Lab 01's JSON is the format to follow (prelab, quests with tutorial flags, tests, postlab CER).
- **Already on main (built from the old cards, before these rules):** Chem Slot 9 "Electron Configurations I" and stats 3.6. Treat them as drafts until recut.
- **Slot 9:** old card is obsolete. Recut after Slot 8: hook = the spectrum lines ("why only these lines?"), atom picture (rings) for Z up to 18, energy diagram after huddle 2 for Z up to 36 (4s before 3d), Cr and Cu out, no valence/ions/shorthand. Atom picture may reuse `atomscope.js`; check.
- **Stats slot 11:** old card obsolete; redo in this format. Students were never taught invNorm: needs a calculator tutorial.
- **Engine slots still to do:** 9, 10, 11, 14-18, 20-22. Build the shared electron-structure kit (periodic table, atom picture, energy diagram) once, against Slot 9 only, then map days 10-22 to the pictures they need before building more.

## Open decisions (Mr. D)
- Lab-day shape: warm-up, huddle 1 (pre-lab), lab in the room, huddle 2 late (after data), exit drawing, with no practice bank unless wanted.
- Where the "10 minute" huddle change lives (main has 18 and 32 in `shared/pace.js` and 18 in every template; it is not on main).
- How the typed "explain" item is graded (self-compare with a model answer, or Mr. D reads it).
- Cornell/MLA exemplar (never arrived).
- Calculator model for stats; whether stats needs a z-table tab.
- Whether the repo's four-band standard and `check-lessons --strict` change to three bands.
