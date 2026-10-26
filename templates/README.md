# Lesson templates

Four runnable template lessons, one per course. They are the starting point for every new guided lesson, and the reference for what a lesson does.

| Course | Open | Spec |
|---|---|---|
| Physics | `templates/physics/lesson.html` | `templates/physics/spec.js` |
| Chemistry | `templates/chem/lesson.html` | `templates/chem/spec.js` |
| Calculus | `templates/calc/lesson.html` | `templates/calc/spec.js` |
| Statistics | `templates/stats/lesson.html` | `templates/stats/spec.js` |

Add `#key` to see every tab with the answers marked. Add `#key&now=2026-10-21T09:30` to pretend it is a different time in class.

## Start a new lesson

```
node tools/new-lesson.mjs physics newtons-third-law "Newton's Third Law"
node tools/new-lesson.mjs chem    mole-ratios       "Mole Ratios"          --unit unit-4-reactions
node tools/new-lesson.mjs calc    2-8-quotient-rule "2.8 The Quotient Rule" --unit unit-2-differentiation
node tools/new-lesson.mjs stats   3-2-z-scores      "3.2 z-Scores"         --unit unit-3-normal
```

That makes the page, the spec and the content file, and adds the lesson to `shared/lessons.js`. Then:

1. **Edit the spec.** `targets` (three, one sentence each, "I can ..."), `question`, `concepts` (one-line points), `huddle` (definitions, a worked example, a labeled figure; `[[blank]]` is a write-on blank), `predicts`, `skills` (a generator per skill, bands 1 to 4), `misconceptions`, `pacing`.
2. **Edit the Explore picture** in `content.js` (a small SVG or canvas sim). Nothing else lives there.
3. **Check it.** `node --test tests/unit/` validates every spec in the repo (pacing, targets, every generator at every band). Then run the class-period test on your page: `PAGE=<path to your .html> TEMPLATE=<course> node tests/template.e2e.js` (serve the repo first: `python3 -m http.server 8123`).
4. **Build the keys.** `node tools/build-keys.mjs <path to spec>`. Commit the PDFs under `keys/`.
5. Push. Netlify deploys from `main`.

## What the spec rules are

- Every sentence is short. A target is one sentence. A concept point is one line. Huddle blanks are one to three words.
- Priority 1 tabs total at most 60% of the budget. Explore is priority 3 (skipped first), Build is priority 2 (shrinks), the rest are priority 1.
- Skill generators return `{ prompt, answer, unit, hint, worked }` (numbers) or `{ type:'expr', prompt, label, answer, vars, hints, traps, worked }` (typed math). Band 1 is the plainest version of the skill.
- Calculus prompts use `$...$` for math; physics and chemistry use plain text and unicode (m/s², 10²³).

## Rules the engine applies for you

IDs instead of names, placement warm-up, no hint ladder on Predict, a timed huddle you write on, pace trimming, endless practice, notes that fill in, a Concepts button, a keypad, the stamp and report code, and the clock. See `docs/LESSON-STANDARD.md`, rules 12 to 21.
