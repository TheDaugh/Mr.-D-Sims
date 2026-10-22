# The guided-lesson standard

Every guided lesson in physics, chemistry and calculus follows the same rules, so a teacher key, a code, a clock and a score mean the same thing in every class. This file says what those rules are, which files provide them, and what each class has to change when it builds the next lesson.

## The rules

1. **One teacher switch: `#key`.** Add it to the address of any guided lesson. You get the real student page with every step open, huddle codes skipped, locked mode off, the correct answers marked, and a teacher bar (today's codes, the unlock-any-student code, a clock simulator, links). `#preview` still works as an old alias. Do not build a separate key page, a skip button, or a redirect to a teacher page.
2. **Time comes from `shared/bell.js`.** A lesson never reads the clock itself. It calls `MrD.bell.clock("physics" | "chem" | "calc")` and uses `gates`, `canEnd`, `needsEnd` and `lockOn`.
3. **Huddle codes: weekdays 7:00 AM to 3:00 PM only.** Outside that window (after 3:00 PM at home, evenings, weekends) the huddle is a note, never a stop. Codes come from `MrD.codes.gate(lessonId, "h1")`, never from a local hash. There is ONE huddle code per day for every class, course and lesson (`MrD.codes.huddle()`); the arguments to `gate` are kept for compatibility and do not change it. Today's code is readable from 7:00 AM (the code day rolls over at 7:00 AM, not midnight).
4. **The lesson ends by the clock, not by finishing the content.** Monday to Thursday the end mark is 42 minutes after the bell; on Friday it is the bell (the lesson stays locked all period). Before the mark, a student who runs out of content gets endless practice at their own level. At the mark an **End my guided notes** banner appears. The stamp records which step the student reached. Outside class (home, after the bell) a student can finish as soon as they reach the end.
5. **Enough practice to reach the mark at any level.** Every lesson has a generator that never runs out (`C.more` in calculus, `NFL.skills[i].gen` in physics, `ChemPractice.spec` in chemistry) and a verification that every generated answer is correct.
6. **Nothing is timed on the student page** unless the timing is the diagnostic. The only timer today is the calculus 5-minute warm-up. Do not print minutes next to sections.
7. **No tiers on the student page.** Do not use the words *extension*, *challenge*, *stars* or *optional*, or a star symbol. Difficulty is hidden and moves with the student. A "bonus" that students may skip teaches them to stop.
8. **Notes the student can print.** A "My notes" button (top right) opens the notes, which fill in as the student works. They print, save as PDF, or download as `.tex`. Physics and calculus build their own page; chemistry uses `shared/notes.js` (a small model of sections, rows and tables).
9. **Say what the notes and the stamp are for**, on the page: "My notes: your own notes for this lesson, printable as a PDF." "The stamp: proof you finished, and how far you got."
10. **Report scores for the review portal.** At the stamp the lesson calls `MrD.profile.record({course, lesson, title, first, period, day, reached, of, items:[{skill, title, band, firstTry, ok}]})`. A skill is the smallest thing the lesson measures. `portal/standards.json` says which standard a skill counts toward, so changing a standard never touches a lesson.
11. **Live view (optional).** Call `MrD.live.attach({course, lessonId, who, snap})` once after the student enters a name. It sends only step, level, counts and the question on screen, never anything outside the lesson page, and nothing in `#key` or when `shared/config.js` has no `liveUrl`.

## Files

| File | Purpose |
|---|---|
| `shared/bell.js` | Periods, code day, `gatesOn`, `clock(course)`, the 42-minute and Friday rules. |
| `shared/codes.js` | Huddle codes, the unlock-any-student code, per-student lock codes, stamps. |
| `shared/teacherbar.js` | `MrD.isKey()` and the one teacher bar. |
| `shared/lock.js` | Fullscreen locked mode. On in every guided lesson and virtual lab. |
| `shared/notes.js` | Printable notes from a small model: print, PDF, `.tex`. |
| `shared/profile.js` | Scores saved on the student's device for the portal; export and import JSON. |
| `shared/live.js`, `live/` | Live view client and the Cloudflare Worker. |
| `shared/lessons.js` | The registry of guided lessons (teacher dashboard and codes read it). **Add one line for every new lesson.** |
| `shared/hub.js`, `shared/hub.css` | The full-screen course hub. Pages pass a `units` list of entries with `type: lesson | lab | sim`. |
| `portal/` | Review portal, `standards.json`, `adapters.js` (report codes and lab reports to records). |

## What each class changes in its next lesson

### Physics (`physics/lessons/`)
Already follows the standard. For the next lesson:
- Copy `newtons-first-law.html` and `content/newtons-first-law.js`. Keep the script tags (config, bell, codes, teacherbar, live, profile) in front of `engine/lesson.js`.
- In the content file set `course:'physics'`, a new `id`, `gates:[{key:'h1',label:'Huddle 1'}, ...]` and a `version`.
- Keep the last step as Notes: practice before the end mark (`morePractice`), stamp and report code after `canEnd`, `MrD.profile.record(...)`.
- Add the lesson to `shared/lessons.js` and give each skill an id that `portal/standards.json` can map (`physics/<lesson-id>/<skill>`).
- **Locked mode** is built into the engine. A lesson config with `lock: true` (both Newton's Laws have it) turns it on during physics's period only (the end mark Mon-Thu, the whole period Friday), never in `#key`, off with `#nolock=<code>`. The Start step's Continue click enters fullscreen; closing the page and reopening asks for a code. A template-built lesson gets it by adding `lock: true` to its config. `tests/lock.e2e.js` covers it.
- `projectile-concept-checker` is an older page with its own tiers, name screen and gate. Rebuild it on the engine before it is used as a guided lesson.

### Chemistry (`chemistry/`)
Before this change a lesson was one 60 KB page with its own gate hash, `PREVIEW` flag, tiers, a separate key page built by a script and a written handout. Now:
- **One flow**, no tiers, no star chips. Parts end into "Keep practicing" (endless, `ChemPractice.spec`) then "Takeaways", then the stamp and notes.
- **Gates** use `MrD.codes.gate(LESSON_ID, "h"+id)` and only stop students on weekdays 7:00 AM to 3:00 PM. In `#key` they show the code instead of stopping.
- **Locked mode** turns on only during chemistry's period (until the 42-minute mark Monday to Thursday, the whole period on Friday), never in `#key`, and the unlock-any-student code frees everyone. Because of the 5-minute early open, a student who opens the page just before the bell is already locked.
- **Notes** come from the page: the Cold Open prediction and reason, each sim's data tables, the rule in the student's own words, the takeaways. Do not make a PDF or Word handout. `notesModel()` in the lesson is the one place to edit.
- To build the next chemistry lesson, copy `atom-discovery.html`, replace `DATA.parts`, the `SKILLS` list, the `TAKEAWAYS` and `notesModel()`, add a generator like `chemistry/shared/practice.js`, and register the lesson in `shared/lessons.js`.
- The old `<lesson>-key.html`, `chemistry/tools/make-key.mjs` and the sheet PDF/docx are gone. Do not bring them back.
- The virtual labs (`chemistry/virtual-lab`) are separate. Their teacher page now has "Scores for the review portal (JSON)". Heating-curve records are not exported yet.

### Calculus (`calculus/unit-2-differentiation/`)
Before this change `#key` redirected to the teacher page, the huddle had a solo bypass, practice stopped at 8 questions, and the warm-up was untimed. Now:
- **`#key`** shows the student page with answers marked (`opt.key` in `qkit.js` draws a `KEY:` line under each field). Level paths, restart and mission buttons live in the teacher bar.
- **Warm-up** has a 5-minute countdown. Unfinished questions count as missed, the time used and the number not reached go into the hand-in code (fields 13 to 15) and the teacher decoder.
- **Hints**: the ladder now ends by revealing one open field at a time. Pass `moreHints:false` to switch it off on a diagnostic question.
- **Practice** continues with `PR2.more(n, level, seed)` on the wrap-up step until the end mark; every generated answer is verified numerically.
- **Concept key** is `calculus/shared/concepts.js`. Add the ideas of each lesson as it is built. An entry with `after:'product-rule'` appears only after the lesson reaches that idea.
- Huddle codes come from `MrD.codes.gate('product-rule-v2','h1')`. The solo bypass is removed: in class there is no way past the huddle without the code, at home there is no huddle.
- To build the next calculus lesson, copy `2-7-product-rule.html` and its content file, change `LESSON_ID`, the content, `STEPS`, and register it in `shared/lessons.js`.

## The review portal

`portal/index.html` reads scores and shows, per standard, where a student is (Strong, Getting there, Review this) with practice from the same generators the lessons use. Sources: the scores saved on the student's device (`mrd.profile.v1`), a JSON file (`Save my scores`, or the class file from a teacher page), pasted physics report codes, pasted calculus hand-in codes, and virtual-lab reports. With more than one student loaded it shows a class overview.

`portal/standards.json` is yours to edit. The *strands* (for example `CHEM-ATOM-2`) are local names; their `codes` point at outside standards. Only `HS-PS1-7` and `HS-PS2-1` are real NGSS codes I am confident in, and even those are the nearest match, not a verified alignment. Everything marked `needsReview` should be checked against your district's documents before it is reported anywhere.

## Known limits

- All of this runs in the student's browser. A student who reads the page source can work out a code, and `#key` is a convenience, not security. Real enforcement stays with Chromebook management.
- The live view needs the Cloudflare Worker deployed once (`live/README.md`). Until then it does nothing.
- "Real view" of a student's page is the live view: step, level, answers, misses, times they left. It cannot show their screen, and by design cannot see anything outside the lesson page.
- Chemistry progress survives a refresh only inside locked mode (the lock saves a snapshot). Physics and calculus save to the device automatically.
- Heating-curve virtual-lab records and the calculus accumulation lab are not wired to the portal.

## Shared kit and tests

Physics lessons build on `physics/lessons/engine/lesson-kit.js` (`LK.for(...)`) for the code box, endless practice, notes/stamp step and portal record, and are checked with `tests/validate-items.js` and `tests/e2e-lesson.js`. See `tests/README.md` for the checklist.

## Standard v2: what new lessons add

New lessons start from a template (`templates/README.md`) and get all of the following. Older lessons (Newton's First and Second Law, Atom Discovery, Rutherford, Counting Particles, calculus 2.7) are untouched and keep working; move them over when you next rebuild them.

12. **Student IDs, no names.** `shared/ids.js`. Each student has a 7-character ID (`K7Q-4M2`) made from name and period with a secret that stays on the teacher's device (`teacher/index.html`, "Student IDs"). The last character is a check character, so a typo is caught on the page. A lesson with `identity: 'id'` asks for the ID instead of a name; the ID is stored where the first name used to be, so stamps, seeds, live view and portal records carry the ID. Grade by ID, and decode only when you need to.
13. **Standard tab names, in this order:** Start, Warm-up, Predict, Explore, Huddle, Build, Practice, Check, Wrap-up (`LK.TABS`). Every tab opens with one line of **Target** (`I can ...`) and one line of **Up next**. No paragraph longer than a sentence; no student writes more than a sentence.
14. **Warm-up places the student.** `shared/place.js`: start at the most basic band, a first-try right moves up, two misses at a band stop, at most 8 items, placed at the highest band cleared. Last lesson's band (from the profile) seeds the start one band lower.
15. **Hints stop early on Cold Open and Predict** (one try, then the reasoning is shown). The full hint ladder belongs to Build, Practice and Check.
16. **Pace plan.** A lesson declares `pacing` once: `{ budgetMin, steps:[{id, prio, min, minItems, parts}], huddles:[{key, atMin}] }` (`shared/pace.js`). Priority 1 never trims, priority 2 shrinks to `minItems`, priority 3 skips first. Priority 1 minutes must total at most 60% of the budget (the tests enforce it). Once a class is 20% of the budget behind, the plan trims what is left to fit the time that remains. Skipped tabs go into the student's notes as "do at home" and into the report code. Pacing applies only in a real class period: `#key` and home mode never trim.
17. **Timed huddle.** The huddle is called by the clock at `atMin`, not by progress. Every student is pulled to the Huddle tab, writes on it (`shared/huddle.js`: definitions, a worked example with write-on blanks, a labeled figure), and Continue returns them to where they were. The same spec produces the make-up key.
18. **Concepts button** (`shared/concepts-panel.js`) on every lesson: one-line points and one equation per concept.
19. **Math input.** `shared/keypad.js` draws a restrained keypad under the answer box: digits for numbers; fraction, power, root, pi, brackets, times, divide and delete for expressions. Typed expressions are graded by numeric equivalence (`calculus/shared/mathcheck.js`) with a live KaTeX preview, so bracket and order-of-operations mistakes are visible before the student checks. (`qkit.js` already had a small insert row; `opt.keypad` swaps it for the shared keypad.)
20. **Keys from one spec.** A lesson's teaching lives in `spec.js` (plain data). The page, the key PDFs and the tests all read it. `node tools/build-keys.mjs <spec>` writes `keys/<course>/<id>-makeup.pdf` (what an absent student copies into their notes; no personal time needed) and `-teacher.pdf` (outline and pacing, huddle script, every level with answers, common misconceptions). The teacher dashboard links both.
21. **Teacher hub** is `teacher/index.html` (linked from the front page): codes, lock desk, live view, lessons with `#key` links and key PDFs, and the Student IDs tool.

### New files

| File | Purpose |
|---|---|
| `shared/ids.js` | ID derivation, check character, roster parsing, the student's ID field. |
| `shared/pace.js`, `shared/place.js` | Pacing/trim decisions and the placement ladder (pure logic, unit tested). |
| `shared/keypad.js`, `shared/huddle.js`, `shared/concepts-panel.js` | The keypad, the writable huddle, the Concepts panel. |
| `physics/lessons/engine/standard.js` | `LK.standard(SPEC, opts)`: builds every standard tab from a spec. Used by all three course templates (chemistry and calculus load the same engine). |
| `templates/<course>/` | `spec.js`, `content.js` (only the Explore picture), `lesson.html`. Runnable examples. |
| `tools/new-lesson.mjs` | Copies a template into the right folder and registers the lesson. |
| `tools/build-keys.mjs` | Spec to PDF keys (needs `pdflatex`). |
| `tests/unit/`, `tests/template.e2e.js`, `tests/smoke.js` | Unit tests, a simulated class period for each template, and a load check of every page. |

The shared engine still lives in `physics/lessons/engine/` for history; chemistry and calculus lessons load it from there. Moving it is a later cleanup.
