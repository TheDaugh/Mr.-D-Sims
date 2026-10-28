# Shared slides: how Mr. D's lesson decks and notes get built

This folder holds worked exemplars of the slides-plus-notes workflow, so another project chat can copy the method. The first exemplar is `chem-unit3-lesson10/` (Unit 3, slot 10, Electron Configurations II). It is not part of the site: Netlify never serves it unless it is merged and linked.

Read `WORKFLOW.md` first. It is the thought process. The exemplar folder is the proof.

## What is in an exemplar

- `deck/`: a Claude Slides deck (`deck.json` plus one `slides/<id>.html` per slide, 1920 x 1080). 26 slides, about 75 KB.
- `notes/`: the paired student notes sheet (`.tex`, student PDF, answer key PDF).
- `fonts/`: the formula font used by the deck.
- `WORKFLOW.md` in this folder: how and why.

## Known conflicts with repo rules (for Ian to decide)

- The sheet and deck carry three "Stretch" items. `CLAUDE.md` bans extension, challenge and optional labels on student pages. Stretch 3 (Fe2+ vs Fe3+) and the open question "why does 4s leave first" also go past the regular-level standard.
- "Isoelectronic" is on the keyword strip but is only named in the speaker notes (DAY-RULES rule 1: every term is explained or taught first).
- The deck's `deck.json` points at the uploaded font by an id that only works inside the original artifact. Re-upload `fonts/NotationMono.woff2` to reuse it.
