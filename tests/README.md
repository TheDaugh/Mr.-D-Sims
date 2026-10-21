# Lesson tests

Run from the repo root with a static server (`python3 -m http.server 8123`). Playwright is the only dependency.

| Command | What it checks |
|---|---|
| `node tests/validate-items.js physics/lessons/content/n2l-items.js N2L` | Item bank: cloze placeholders vs blanks, option indexes, hint/worked text present, numeric answers against their independent `chk`, prediction answer at index 0, prompt variety (warning only). |
| `node tests/e2e-lesson.js newtons-second-law 1 2 3 4` | Whole lesson in Chromium at each starting band: no JS errors, every step reachable, codes, practice before the end mark, stamp at the end. The browser clock is pinned to a Wednesday 9:00 AM. `KEY=1` runs in `#key` mode. |

## New lesson checklist

1. Build the content file with `LK.for({ id, prefix, title, lib })` from `physics/lessons/engine/lesson-kit.js`: it supplies `codeBox`, `morePractice`, `notesStep`, `stamp` and `profileRecord`.
2. In the lesson config set `lib`, `stamp`, `predNames` and `investKey`. `teacher.html` then lists its codes, key and report reader with no edit.
3. Add one line to `shared/lessons.js`, an entry in `physics/sims.js`, and skills in `portal/standards.json`. `portal/adapters.js` needs a line in `physLessons`.
4. Copy `tests/lessons/newtons-second-law.js` and rewrite its `investigate` function. Run both commands above.
