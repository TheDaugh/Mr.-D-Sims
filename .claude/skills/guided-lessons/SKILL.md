---
name: guided-lessons
description: How to build a Mr. D guided lesson (sim + check + hidden routing + gate + ladder + key + worksheet) in this repo. Read before building any new lesson slot. Distilled from Unit 3 slot 7 (Coulomb's law).
---

# Building a guided lesson in this repo

Reference build: `chemistry/unit-3-atoms-ions/coulombs-law.html` (+ `coulombs-law-board.html`, `chemistry/shared/coulomb-practice.js`, `chemistry/shared/ladder.js`, `tests/lessons/coulombs-law*.e2e.js`, `tests/unit/coulomb.test.js`). Copy its shape. The account-level `mrd-lesson-base` and `mrd-chem-lesson` skills sit outside the repo; where they disagree with this file on the single-file chem page, this file matches what is built and tested.

## 0. Before writing
- Read `docs/LESSON-STANDARD.md`, then the newest chem lesson. `atom-discovery.html` is slot 1 and the engine donor (`/* ENGINE */` section).
- If the brief names a content spec, ladder addendum or approved questions and they are not attached, say so once, write original items, and list them under "To check" in the key. Do not stop to ask.
- Decide and note. Ask only when blocked.

## 1. Files
- `<id>.html` single page. Scripts in order: config, bell, codes, teacherbar, ids, live, profile, notes, lock, `../shared/ladder.js`, `../shared/<topic>-practice.js`.
- `<topic>-practice.js` (UMD: `window.X` and `module.exports`) holds **every number the student can see**: check items, simple questions, closing items by slot and band, endless `spec(n,band,seed)`. Each generated item carries its parameters (`p`) so a test can recompute the answer independently. Named wrong answers go in `traps`.
- `<id>-board.html` projector page, `<id>-outline.md`, `<id>-key.md`.
- Register in `chemistry/labs.js` (hub card, `type:"lesson"`, `day`), `shared/lessons.js`, `portal/standards.json` (strand + `chem/chem.<topic>*` skill map), `img/CREDITS.md`.

## 2. Page flow (50-minute period)
Check (10 min cap, soft banner) → hook with a real visual → ~6 simple questions → sim runs (predict, run, tally, explain) → gate → harder diagram → closing ladder + CER → journal → stamp. Guided part sized 30–35 min; the repo's end mark and "End my guided notes" bar come from `MrD.bell` and are copied from the engine.
- Sim: predict is typed and locked **before** the widget appears; the widget has a data table, typed ratio column with named-trap feedback, Pause, Reset, and proportions only. Controls disabled for the variable the run does not change.
- Foundations before the first sim: a labeled static picture of the sim (numbered callouts) as its own required block.
- Text blocks stay at two sentences. No "optional", "extension", "challenge", stars.

## 3. Hidden routing
- The check items tag every wrong option (`lin | inv | invsq | other`) by the functional guess it reveals. `route(answers)` returns `scaf | std | fluent`. It sets the sim scaffold, the ladder start band, and a look-ahead preview for fluent students. **Never print a route name to the student**; the teacher sees it in `#key`, the live prompt, and a compact `check 6/8 [lin,inv,invsq,other]` code in the stamp text.
- `ladder.js` is plain state (`Ladder.init`, `Ladder.record`): two first-try right climb, two misses drop. Keep the state in `ST` so the lock snapshot saves it. Trim the ladder by the clock in class only (after minute 36: 2 slots; after 40: none).

## 4. Gate and live class split
- One gate question with fixed letters A–D (`tag` per option). After the student locks, call `MrD.live.nudge()` so the answer is sent now. Then the existing code stop (`MrD.codes.gate`, weekdays 7:00–3:00 only; skipped in `#key`).
- Live snap fields: `gate` (letter) and `chk` (`lin,inv,invsq,other`). The worker stores whole beats, so no worker change is needed.
- The projector page's Class split panel polls `<worker>/class?course=&lesson=&day=` with the token saved by the teacher page (`localStorage mrd.teacher.live`), fills the bars, filters by period, and falls back to hand-click tally buttons. Needs `liveUrl` in `shared/config.js` and the Cloudflare worker deployed once (`live/README.md`). Test it with the mock in `tests/lessons/coulombs-law-live.e2e.js`.

## 5. Records
Every typed response goes through one `typed(id, prompt, text)` helper into `ST.typed`. Surface it in the stamp screen (copy button and `.txt` download) and at the bottom of the `#key` panel. The atom journal is **one prompt** (before / now / confidence 1–4 / one thing to test), with "before" prefilled from the check.

## 6. Teacher key
`#key` shows the real student page plus a key panel **generated from the same data module** (timings, check answers and tags, sim values, ladder answers by slot×band, gate script, common errors, simplifications, typed log). Mirror it in `<id>-key.md` for scanning. List every simplification (invented units, drawing stubs, model spacing). Put the picker for routes in the teacher bar `extra`.

## 7. Images
Allowlisted Wikimedia domains only; credit license and author in `img/CREDITS.md` and the caption. If downloads fail (HTTP 429 happened), ship a labeled placeholder (`BLOCK.figure` does this on `onerror`), say so in the key and the final report, and do not search other domains. The pixel-art hook is drawn in code so the lesson never depends on a photo.

## 8. Tests (all must pass before reporting)
```
node --test tests/unit/*.test.js          # glob form; the directory form fails on this Node
python3 -m http.server 8123 &
node tests/lessons/<id>.e2e.js            # walkthrough per route at 1366x768, home-mode clock
node tests/lessons/<id>-live.e2e.js
PLAYWRIGHT_DIR=/opt/node-tools/node_modules/playwright node tests/smoke.js
```
Playwright lives at `/opt/node-tools/node_modules/playwright` here. Screenshot Start, Check, a sim, the diagram and the gate at 1366×768 and look at them. Home-mode (pinned 9:00) skips practice after the parts; call `__qa.showPractice()` to test it.

## 9. Worksheet
8–12 items, ≤30 points, printed scales on every free response (claim/evidence/reasoning, work shown, units). Build with python-docx, compute every answer in code with `fractions`, convert with `soffice --headless --convert-to pdf`. **Scale rows must not contain numeric answers.** Send only the `.docx` and `.pdf` in chat.

## 10. Pitfalls we hit
- `h(tag, {disabled: null})` still sets `disabled="null"`. Set properties after creating the element.
- `"ABCD".indexOf("")` is 0. Guard empty gate values before counting.
- Sim axis labels must put the second charge at the tick equal to the distance (label 0..6, not 1..6).
- Gate and other sequentially revealed blocks are not in the DOM until earlier blocks are answered; in tests append the block directly or use `#key`.
- Push to the designated branch. Netlify deploys `main` only.

## 11. Final message (≤5 lines)
What was built, where it sits, what to scan in the key, one open decision.
