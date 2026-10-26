# Progress

Update this at the end of every session. Newest entry first.

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
