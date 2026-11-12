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
8d. **A sim day is a virtual lab, never a guided lesson page** (Ian, 2026-11-11; the guided-lesson format is retired for physics and chemistry). It lives in the shared lab room (`chemistry/virtual-lab`, `?lab=<key>`), follows `shared/virtual-lab/STANDARD.md`, and **its length is Ian's call per day** (`lengthMin` in the lab JSON; `?min=NN` overrides). It has ONE huddle, in the middle (`lengthMin / 2`), and it is a notes huddle: nothing is taught at minute 3 or 25 because direct instruction interrupts students who have the lab open. At the huddle everyone looks up and copies what Mr. D writes on the chem lesson board (`#lesson=<id>`) into the write-on blanks; the short board script is `day-cards/slot-<n>.board.md`. Slot 15 (the Pull Bench) is the first.
9. Teacher key view shows every individual question next to the lesson, plus a few generated problems per band.
10. Cornell/MLA notes are a separate LaTeX deliverable built from the huddle (exemplar pending from Mr. D).
11. Content bounds come from the UBD: nothing from the next day bleeds into today. Slot 10 owns ions, noble-gas shorthand, valence electrons, Lewis dots.
12. Accuracy: every number is sourced, or marked `author_set` in the data. No guessed values.
13. Tests check arithmetic AND teachability: a coder test fails if a content word on a student screen is missing from the sheet's term list.
14. Paper fallback: the explore page must print.

## Five outputs per slot
1. `slot-NN.sheet.pdf` (Mr. D marks this up; it is the only file he opens)
2. `slot-NN.sheet.tex`, 3. data JSON, 4. `items.json`, 5. content test, plus the 5-line coder prompt.

## State of the build (as of 2026-11-12; `PROGRESS.md` has the detail)
- **Chem Slot 8 (flame tests):** built as a lab day in the virtual-lab room (`?lab=flame`), with a teacher key, a demo and a hub card.
- **Chem Slot 9 (Electron Configurations I):** built as the first v2 chemistry lesson (page, models, board page). It still uses two huddles; rebuild only when Ian asks.
- **Chem Slot 11 (Photoelectron Spectroscopy):** built as a virtual lab (`?lab=pes`) and as a lesson page.
- **Chem Slot 14 (the table as a map of configurations):** a direct-instruction day bundle in `docs/slot-14/out/` (typed notes, board script, problem sheet and key, exit slips). Print files, not on the site.
- **Chem Slot 15 (effective nuclear charge):** built as the Pull Bench virtual lab (`?lab=zeff`, 20 minutes, one notes huddle in the middle). The guided-lesson version was deleted.
- **Stats:** 3.6 Finding Boundary Values (first v2 stats lesson) and the 3.1 to 3.3 Review are built; lesson boards for 3.4 to 3.6 are on the stats board.
- **Still to do as far as this repo shows:** chem slots 10 (a slides-and-notes exemplar is in `shared-slides/`, no engine page), 16 to 18 and 20 to 22. Confirm with Ian which become virtual labs.
- **Labs still on the old checkpoint rules** (`"legacy"` in their lab JSON): unknown solids, heating, gold foil, flame, fan cart. Shrink that list, do not add to it.
- **Physics:** the Forces unit plan (UbD v3, 2026-11-12) calls for two sandbox sims (cart and hanging mass; ramp and pulley). They are not built. They are virtual labs, so they follow `shared/virtual-lab/STANDARD.md`.

## Open decisions (Mr. D)
- Settled in the built labs (flame, PES, Pull Bench) and `shared/virtual-lab/STANDARD.md`: the lab-day shape (pre-lab, lab in the room, notes huddle) and the checkpoint rule. Revisit only if Ian says.
- Settled in code: huddle 1 at minute 3 and huddle 2 at minute 25 are the defaults in `shared/pace.js`.
- Settled in `CLAUDE.md`: three hidden bands for v3 work. `tools/check-lessons.mjs --strict` has no band-count check, so nothing enforces it.
- Still open: how the typed "explain" item is graded (self-compare with a model answer, or Mr. D reads it).
- Still open: the Cornell/MLA exemplar (never arrived).
- Still open: the calculator model for stats, and whether stats needs a z-table tab.
