# Progress

Update this at the end of every session. Newest entry first.

## 2026-10-27: Unit 3 slot 9, Electron Configurations I (first v2 chemistry lesson)

Built from `node tools/new-lesson.mjs chem electron-config-1 ... --unit unit-3-atoms-ions`, wiring the Day Card (`chemistry/unit-3-atoms-ions/day-cards/slot-09.card.md`, `slot-09.content.js`). Nothing in the content was rewritten.

- Page, spec, Explore and wiring: `electron-config-1.{html,spec.js,content.js}`; Models tab: `electron-config-1.models.js`; board page: `electron-config-1-board.html`.
- New shared figure `chemistry/shared/energy-ladder.js` (rules, SVG, drag widget; also draws question pictures, the huddle figure and the board). Not `ladder.js`, which is the difficulty ladder.
- Engine (additive): `config` answer type and `answer2` in `lesson.js`; `SPEC.buildTarget` in `standard.js` (Build hard-coded "I can use a = F / m" for every course, so the chem template shows a physics sentence too; left as is).
- Tests: `tests/unit/slot-09-content.test.js` (require path only changed), `tests/unit/energy-ladder.test.js`, `tests/lessons/electron-config-1.e2e.js`, lock target, `specs.test.js` accepts `config` items.

Doubts for Ian (the card's list of what I added or interpreted):
1. Target T7 was 113 characters; the spec rule is under 110. "(full form)" became "full" before "ground-state".
2. Huddle: the card gives none. Definitions and the phosphorus example come from `board.reveal` and M1 verbatim (counts and the final total are blanks). Three label lines on the ladder are mine. Concepts (three) come from `hint0` and the board writes; their equations are mine.
3. Warm-up: W1 to W6 replace the placement ladder. Band 2 if W1 to W4 and W5, W6 are all first try, else band 1. Only bands 1 and 2 are placed.
4. Models sit after the Huddle. The pace plan has no `models` step, so they are unbudgeted (the 38 planned minutes do not include them).
5. M3 moves 1, 2, 3 and 6 need questions the card does not word; I asked them from the model's numbers (electron count, order, electrons left after 3p, sum of superscripts). Move 5 "draw the boxes" is click-to-cycle and passes any arrangement with the right counts.
6. Explore: "filling order hidden until the student commits an order" is built as: the order numbers appear on the ladder only when all electrons are placed. Rule priority on a bad drop: Pauli, then Aufbau, then Hund. Prompts for the `rec` items and the three capacities are mine.
7. "Give both" (rules band 4, answer2) has no separator in the prompt; the box says to separate with a comma.
8. Check tab is the card's exit (X1 to X3) and the report code field 7 is now the three first-try bits (`1-1-1`). Exit labels (secure, developing, not yet) are teacher-only.
9. The gate uses the standard huddle code; `gate.items` are listed in the Huddle teacher panel only. Ink on the board is not built (decision 2).
10. Not done: `portal/standards.json` has no strand for electron configurations, so write/read/rules are unmapped. `tools/build-keys.mjs` was not run (no `pdflatex` here), so no key PDFs. The board page is not linked from any hub.

## 2026-10-26 (later): locked mode on for every spec-built lesson

Ian's decision: every guided lesson is locked. Done for Standard v2:

- `physics/lessons/engine/standard.js` now sets `lock: true` for every lesson it builds, so a lesson made from a template is locked without anyone remembering to add it.
- `shared/lock.js` is loaded on the seven v2 pages and templates that lacked it: the four templates, `2-6-exp-log`, `2-8-quotient-rule`, `unit-3-review-1-3` (`fbd-net-force` already had it). New lessons copy the template page, so they inherit the tag.
- `tests/lock.e2e.js` has a target for each of the four templates (the lock engages, one exit warns, the second locks, codes unlock, reopening asks for a code, `#key` and after-3-PM never lock, `#nolock` switches it off).
- `node tools/check-lessons.mjs --strict` now passes: 0 errors, 0 gaps.

Verified, all passing: lock e2e (10 of 10 targets), template e2e for all four courses, page e2e for `fbd-net-force`, `2-6-exp-log`, `2-8-quotient-rule` and `unit-3-review-1-3`, unit tests (114 of 114), smoke (32 pages load clean).

**Needs Ian:** the stats period in `shared/bell.js` is still a placeholder (marked `TODO(Ian)`), and locked mode only turns on inside a class period. Until the real stats times are entered, stats lessons lock at the wrong hours. The new stats lock test pins the placeholder time and should move with it.

## 2026-10-26: harness setup

Added `CLAUDE.md`, `tools/check-lessons.mjs`, and a scope note at the top of `.claude/skills/guided-lessons/SKILL.md`. Baseline: `node --test tests/unit/*.test.js` passes (114 of 114).

### Why new lessons kept coming out different

The skill told builders to copy `coulombs-law.html` (the single-file chemistry build). The standard and the templates say to generate from a spec. Both lived in the repo, and a session that read the skill first built the old way. The skill now points at the standard for new lessons.

### Migration baseline (`node tools/check-lessons.mjs`)

15 registered lessons: 4 on v2, 4 templates, 7 legacy.

| Generation | Lessons |
|---|---|
| v2 | `2-6-exp-log`, `2-8-quotient-rule`, `fbd-net-force`, `unit-3-review-1-3` |
| legacy, physics | `newtons-first-law`, `newtons-second-law` |
| legacy, chemistry | `atom-discovery`, `rutherford-gold-foil`, `counting-particles`, `coulombs-law` (none are on v2) |
| legacy, calculus | `product-rule-v2` (still has its own gate hash or PREVIEW flag) |

Nine pages in lesson folders are not registered in `shared/lessons.js`: six sims under `physics/lessons/sims/`, `calculus/.../2-5-sine-cosine.html`, and the two chemistry unit-2 pages `heating-curve` and `specific-heat`. `projectile-concept-checker` (physics/projectiles) also has its own gate and name screen, as the standard notes.

### Still open (needs Ian)

- **The Day 1 / Day 2 split and the mid-lesson formative check are not in `LESSON-STANDARD.md`.** The standard has pacing and a timed huddle but no two-day structure. Proposed: Ian describes the intended shape in a few sentences and it goes into the standard as rule 22 before the next lesson is built.
- `.claude/skills/ispy-art-pipeline` belongs to the Mandarin repo. Proposed: move it there and merge it with `docs/skills.md`.

### Suggested order

1. Rebuild the next chemistry lesson from the chem template, not from `coulombs-law`. It becomes the first v2 chemistry lesson and the new golden example.
2. Enter the real stats bell times.
3. Register or retire the nine unregistered pages.
4. Migrate legacy lessons one at a time as they come up for rebuild.
