# Progress

Update this at the end of every session. Newest entry first.

## 2026-10-26: harness setup

Added `CLAUDE.md`, `tools/check-lessons.mjs`, and a scope note at the top of `.claude/skills/guided-lessons/SKILL.md`. No lesson or shared code changed. Baseline: `node --test tests/unit/*.test.js` passes (114 of 114).

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

### Gaps against Ian's decisions (needs Ian)

- **Locked mode is off in every v2 lesson and every template.** Ian's rule is that every guided lesson is locked. Engine lessons only lock with `lock: true` in the config, and no v2 lesson has it, so a lesson built from a template today is not locked. `check-lessons.mjs --strict` fails on this on purpose. Proposed fix: add `lock: true` to the four templates (new lessons inherit it), then to the four v2 lessons, and add each to `TARGETS` in `tests/lock.e2e.js`. This changes what students see in class, so it waits for Ian.
- **The Day 1 / Day 2 split and the mid-lesson formative check are not in `LESSON-STANDARD.md`.** The standard has pacing and a timed huddle but no two-day structure. Proposed: Ian describes the intended shape in a few sentences and it goes into the standard as rule 22 before the next lesson is built.
- `.claude/skills/ispy-art-pipeline` belongs to the Mandarin repo. Proposed: move it there and merge it with `docs/skills.md`.

### Suggested order

1. Ian decides the locked-mode change; apply it to templates first.
2. Rebuild the next chemistry lesson from the chem template, not from `coulombs-law`. It becomes the first v2 chemistry lesson and the new golden example.
3. Register or retire the nine unregistered pages.
4. Migrate legacy lessons one at a time as they come up for rebuild.
