# Mr. D's Sims

Classroom site for Mr. D's physics, chemistry, calculus and stats classes: static HTML and JS, no build step. Netlify deploys `main` only. Students use guided lessons, sims and virtual labs. Ian uses `teacher/index.html` and `portal/`.

## The rule about lessons

A new guided lesson is made from a template, never by copying an older lesson:

```
node tools/new-lesson.mjs <physics|chem|calc|stats> <lesson-id> "<Title>" [--unit <folder>]
```

Then edit the spec (and the Explore picture). The standard is `docs/LESSON-STANDARD.md`: rules 1-11, then "Standard v2" 12-21. If any other file disagrees with it, including a skill, the standard wins. `templates/README.md` walks through the build.

Most existing lessons predate v2 (see `PROGRESS.md` for the list). They keep working; do not use them as a pattern. Move one to v2 only when Ian asks for it to be rebuilt.

## Before you say a lesson is done

```
node tools/check-lessons.mjs --strict                  # standard conformance, about a second
node --test tests/unit/*.test.js                       # glob form; the directory form fails on this Node
TZ=America/New_York TEMPLATE=<course> PAGE=<page> node tests/template.e2e.js
node tests/lock.e2e.js                                 # after adding the lesson to its TARGETS
PLAYWRIGHT_DIR=/opt/node-tools/node_modules/playwright node tests/smoke.js
```

The e2e tests need `python3 -m http.server 8123` running from the repo root. `tests/README.md` has every command. `tools/build-keys.mjs` needs `pdflatex`. Report what ran and what it printed; do not report a check you did not run.

## Where things live

- `shared/`: the clock (`bell.js`), codes (`codes.js`), IDs, pacing, locked mode (`lock.js`), notes, profile, hub, live client. `shared/lessons.js` is the registry; every lesson needs a line there.
- `physics/lessons/engine/`: the shared lesson engine, used by physics, chemistry and calculus lessons. `standard.js` builds every v2 tab from a spec.
- `templates/<course>/`: the runnable examples that new lessons start from.
- `tests/`: unit tests, template e2e, lock e2e, smoke. `portal/standards.json` maps skills to standards.
- `docs/DAY-RULES.md`: the daily-materials rules and handoff (run of show, per-slot outputs, state of the build). Read it before building any new slot.

## Ian's standing decisions (do not reopen)

- One huddle code per day for every class (`MrD.codes.huddle()`). Never a local hash, never a `PREVIEW` flag, never a separate key page. `#key` is the teacher switch.
- No tiers on the student page: no *extension*, *challenge*, *stars*, *optional*, no star symbol. Difficulty is hidden and moves with the student.
- Every guided lesson and virtual lab runs in locked mode (`lock: true` in the lesson config; `shared/lock.js`).
- Lesson ends by the clock (42 minutes Mon-Thu, the whole period Friday), with endless practice before the mark.
- Lab-report grading and feedback make no AI API calls: rubric and proficiency scales Ian clicks. Student records stay on Ian's device; students look up feedback by student ID.
- Direction: experience first, formalize later. Day 1 is the online guided lesson (two days of material); practice and lab follow until the concepts hold. A formative check happens mid-lesson, not only in a JSON file at the end. `LESSON-STANDARD.md` does not yet describe the Day 1 / Day 2 split.

## Supersedes (2026-10-27, Ian): new slots built from docs/DAY-RULES.md

- Two huddle codes per day. Huddle 1 is called at minute 3, huddle 2 at minute 25; lab days may set huddle 2 later.
- Placement warm-up is retired. Warm-up is at most 3 easy review items. Explore starts at band 1, rises with success and holds more items than the time allows.
- No end-of-lesson stamp and no report code. The locally stored scores (`MrD.profile.record`) stay.
- Three hidden bands, not four. They are a ramp to the regular-level standard, which every student completes. No AP content.
- No lesson skipping or trimming. The 60% pacing rule and the fixed tab order do not apply to v3 lessons. Legacy lessons are untouched until rebuilt.
- Where this block disagrees with the rest of this file or `docs/LESSON-STANDARD.md`, this block wins.

## Working rules

- One lesson per session. End by updating `PROGRESS.md`.
- Push to the designated branch; Netlify deploys `main` only.
- `.claude/skills/ispy-art-pipeline` is about the Mandarin app's I-Spy art, not this repo. Ignore it here.
