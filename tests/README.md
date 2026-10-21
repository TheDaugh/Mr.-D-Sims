# Lesson tests

Run from the repo root with a static server (`python3 -m http.server 8123`). Playwright is the only dependency.

| Command | What it checks |
|---|---|
| `node tests/validate-items.js physics/lessons/content/n2l-items.js N2L` | Item bank: cloze placeholders vs blanks, option indexes, hint/worked text present, numeric answers against their independent `chk`, prediction answer at index 0, prompt variety (warning only). |
| `node tests/e2e-lesson.js newtons-second-law 1 2 3 4` | Whole lesson in Chromium at each starting band: no JS errors, every step reachable, codes, practice before the end mark, stamp at the end. The browser clock is pinned to a Wednesday 9:00 AM. `KEY=1` runs in `#key` mode. |

| `node --test tests/unit/` | Pure logic and specs: IDs (every single-character typo is caught), pacing, placement, keypad inserts, huddle blanks, and every `spec.js` (pacing valid, targets one sentence, each generator checkable at every band). |
| `TEMPLATE=physics\|chem\|calc node tests/template.e2e.js` | A simulated class period through a template: ID check, placement, timed huddle, pace trim, keypad, `#key`, full run to the stamp. `PAGE=<path>` tests a lesson made from the template. |
| `node tests/smoke.js` | Every lesson, hub, teacher page and the portal load with no JavaScript errors (`KEY=1` also opens each lesson at `#key`). |

## New lesson checklist (spec-based, preferred)

See `templates/README.md`: `node tools/new-lesson.mjs ...`, edit the spec, run the three commands above, `node tools/build-keys.mjs <spec>`.

## New lesson checklist (older engine-only physics lessons)

1. Build the content file with `LK.for({ id, prefix, title, lib })` from `physics/lessons/engine/lesson-kit.js`: it supplies `codeBox`, `morePractice`, `notesStep`, `stamp` and `profileRecord`.
2. In the lesson config set `lib`, `stamp`, `predNames` and `investKey`. `teacher.html` then lists its codes, key and report reader with no edit.
3. Add one line to `shared/lessons.js`, an entry in `physics/sims.js`, and skills in `portal/standards.json`. `portal/adapters.js` needs a line in `physLessons`.
4. Copy `tests/lessons/newtons-second-law.js` and rewrite its `investigate` function. Run both commands above.

## Per-lesson overrides
`tests/template.e2e.js` loads `tests/lessons/<page-basename>.e2e.js` when it exists. `tests` replaces a template test by name; `extra` adds tests. Slot 4 (`fbd-net-force`) uses it for its six-item check, huddle gate, projector page and portal decode.
