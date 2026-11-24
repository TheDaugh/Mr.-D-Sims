# Release checks for direct-instruction days

`tools/di_verify.py` is the deterministic check for one DI day (notes, script, sheet, exit slips). The generator fills a small spec and runs it before anything is delivered.

```
python3 -I tools/di_verify.py spec.json --student notes.pdf sheet.pdf --slips slips.pdf 18
```

It fails on: blocks not summing to the period; more than 2 chunks, 3 live questions or 9 keepers; a core practice set too big for the practice minutes; a big question over 14 words, addressed to the student, or not a question; notes and script text that differ; an unresolved `@@placeholder@@`, a teacher's name or a stage direction on student material; exit slips not at six per page. `close(a, b)` asserts that two independent computations of an answer agree. The period is a parameter: 50 for the DI skill, 42 for Mon-Thu lessons in `CLAUDE.md`.

Fixtures: `tests/di-verify/`. Test: `node --test tests/unit/di-verify.test.js`.

## Proposed edits to the `di-day-builder` skill (not yet saved; skill files are saved from the review card)

1. Under "Checks before sending", add first: "Fill the spec and run `tools/di_verify.py` from the Mr.-D-Sims repo on the spec and on the built student files. Fix every FAIL before delivering. Report what it printed."
2. Add a section at the end, "Known failure modes". One line per failure, added only when Ian has corrected the same thing twice:
   - Honors Chem slot 10 packed four concepts, ten live questions, nine copy items and seven worked examples into 17 minutes, so Practice never ran. Cause: no budget before writing. Guard: the content-budget checks in `di_verify.py`.
   - A wall of red italics in the margin hid what mattered. Guard: each margin category keeps its own style; red is only for WATCH FOR.
   - Stage directions on student sheets ("(no talking)", CHECK boxes, "(in your notebook)"). Guard: the student-file scan in `di_verify.py`.
   - Reading-level history in the spoken story. Guard: story is about 90 seconds, extra history in EXPERT margin.

## Risk-tiered use

Every DI day: the script and the acceptance list. Tests, keys and anything graded: also a fresh-context checker that sees only the spec and the output. Once per unit: the traceability check of objectives to test items to activities. Only after a large skill edit: rerun the fixed sample inputs and compare.
