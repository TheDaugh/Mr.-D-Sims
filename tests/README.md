# Lesson tests

Run from the repo root with a static server (`python3 -m http.server 8123`). Playwright is the only dependency.

| Command | What it checks |
|---|---|
| `node tests/validate-items.js physics/lessons/content/n2l-items.js N2L` | Item bank: cloze placeholders vs blanks, option indexes, hint/worked text present, numeric answers against their independent `chk`, prediction answer at index 0, prompt variety (warning only). |
| `node tests/e2e-lesson.js newtons-second-law 1 2 3 4` | Whole lesson in Chromium at each starting band: no JS errors, every step reachable, codes, practice before the end mark, stamp at the end. The browser clock is pinned to a Wednesday 9:00 AM. `KEY=1` runs in `#key` mode. |

| `node --test tests/unit/` | Pure logic and specs: IDs (every single-character typo is caught), pacing, placement, keypad inserts, huddle blanks, and every `spec.js` (pacing valid, targets one sentence, each generator checkable at every band). |
| `TEMPLATE=physics\|chem\|calc\|stats node tests/template.e2e.js` | A simulated class period through a template: ID check, placement, timed huddle, pace trim, keypad, `#key`, full run to the stamp. `PAGE=<path>` tests a lesson made from the template. |
| `node tests/lock.e2e.js` | Locked mode in every guided lesson and virtual lab that uses it: fullscreen from Start, warning then lock on repeat exits, per-student and unlock-any codes, a code after closing the page, and never locked in `#key`, the teacher build, after 3 PM or with `#nolock`. Add a target to its `TARGETS` list when a new lesson or lab opts in. Run it with `TZ=America/New_York`; in UTC the pinned class times land outside the period and the virtual-lab targets fail on an unmodified checkout too. |
| `node chemistry/virtual-lab/test/flame.e2e.js` | Lab 4 (flame tests) through a whole period in Chromium: pre-lab, huddle 1, the seven salts, a reused splint, locked unknowns, spectroscope and Tutorial 2, practice hints, CER, huddle 2, resume, the paper page. Every screen's text goes through the word rule. |
| `node tests/stats-kit.e2e.js` | The shared stats widgets on `stats/shared/kit-demo.html`: curve (hidden readout, snap, keyboard), z-table (wrong row/column/side, inverse), tiles (mouse, touch, tap, keyboard), ruler, dot plot, histogram, and the Concepts tabs. `SHOTS=<dir>` writes 1366×768 screenshots. |
| `node tools/build-toolkit.mjs` | Writes the one-page printable (`keys/stats/toolkit.pdf`) and fails if it spills past one page. |
| `node tests/smoke.js` | Every lesson, hub, teacher page and the portal load with no JavaScript errors (`KEY=1` also opens each lesson at `#key`). |

## New lesson checklist (spec-based, preferred)

See `templates/README.md`: `node tools/new-lesson.mjs ...`, edit the spec, run the three commands above, `node tools/build-keys.mjs <spec>`.

## New lesson checklist (older engine-only physics lessons)

1. Build the content file with `LK.for({ id, prefix, title, lib })` from `physics/lessons/engine/lesson-kit.js`: it supplies `codeBox`, `morePractice`, `notesStep`, `stamp` and `profileRecord`.
2. In the lesson config set `lib`, `stamp`, `predNames` and `investKey`. `teacher.html` then lists its codes, key and report reader with no edit.
3. Add one line to `shared/lessons.js`, an entry in `physics/sims.js`, and skills in `portal/standards.json`. `portal/adapters.js` needs a line in `physLessons`.
4. Copy `tests/lessons/newtons-second-law.js` and rewrite its `investigate` function. Run both commands above.

## Mixed reviews
`stats/unit-3-normal-distribution/unit-3-review-1-3` is a review: its own steps (Start, Warm-up with six items, interleaved Practice, Wrap-up), no huddle. Run it with `PAGE=stats/unit-3-normal-distribution/unit-3-review-1-3.html TEMPLATE=stats node tests/template.e2e.js`; its overrides are in `tests/lessons/unit-3-review-1-3.e2e.js`, and `tests/unit/review-1-3.test.js` recomputes every answer from the picture and the prompt.

## Per-lesson overrides
`tests/template.e2e.js` loads `tests/lessons/<page-basename>.e2e.js` when it exists. `tests` replaces a template test by name; `extra` adds tests. Slot 4 (`fbd-net-force`) uses it for its six-item check, huddle gate, projector page and portal decode.

## Slot 4 (fbd-net-force)

`PAGE=physics/lessons/fbd-net-force.html TEMPLATE=physics node tests/template.e2e.js` runs the standard tests plus `tests/lessons/fbd-net-force.e2e.js`: the Model problems tab, the shrunken huddle, the six-band ladder (two misses stay at band 1, clean answers reach band 5, Build capped at band 4), derive-first clozes, sims offered only for their bands, banned words on every student page and sim, and the report decode. The tests pin a Wednesday in Eastern time, so run them with `TZ=America/New_York` (or the clock-driven checks fail). `tools/build-keys.mjs` needs `pdflatex`.
