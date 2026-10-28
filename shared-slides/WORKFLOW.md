# Workflow: from a lesson slot to a projector deck and a notes sheet

Written from the Unit 3 / Lesson 10 build. The order matters; most of the rework came from skipping a step.

## 0. Know what Ian rejects
- Click-and-wait slides that students copy down. A fast class finishes in 25 minutes because nothing asks them to decide anything.
- "Fun" coloring guides, memes, and gif loops.
- Notes that either say "copy what is on the board" (blocky packet) or give everything and ask for nothing (concept summary).
- Role cards. Stations must be real hands-on.

He wants evidence-based practice: retrieval, predict then reveal, worked examples that fade, error hunts, hinge questions, exit tickets. And students who can predict what a reaction does from structure, not memorize it.

## 1. Start from the sources, not from the topic
Read, in this order: the UBD docs for the unit (targets, assessments, slot), `docs/DAY-RULES.md`, `CLAUDE.md` standing decisions, the previous slot's content. Then write down what this slot owns and what it must not touch (slot 10 owns ions, shorthand, valence, Lewis dots; nothing from slot 11 bleeds in). Settle conventions once and keep them everywhere (here: the s pair of a Lewis dot goes on top; atoms only, no brackets or charges yet).

## 2. Design the hour as moves, not slides
Sequence: question of the day (a real-life hook with a one-line commitment) -> retrieval from memory -> predict -> watch/reveal -> name the idea -> worked example I do, we do, you do (fading) -> pair practice with a checking tool -> error hunt -> hinge question -> open questions -> exit ticket.

Rules that earned their place:
- **Predict before reveal, every time.** If an animation can run before students commit, it will. Use a static predict slide, or a hold screen inside the animation, then the reveal.
- **Every wrong answer is one specific error.** Build hinge and error-hunt items from the mistakes students actually make (wrong noble gas, forgot the charge, counted the 3d, counted core electrons). Put that map in the speaker notes.
- **Leave one open question per lesson on purpose** ("Do Lewis dots work for d electrons?"). Give the honest answer: it is a main-group model, here is where it breaks.
- **Real-life pictures earn a slot only if they carry the concept.** The question of the day (banana vs potassium) is paid off by a side-by-side animation, not a stock photo.

## 3. Build for the room
- Students sit about 15 ft from a 3.5 ft board. Titles 100 px or larger, body 54-76 px, formulas 84-200 px on a 1920 x 1080 slide. Fill the slide; white space is wasted distance.
- Number every slide, "N / total", bottom right.
- Projector only. Every switch to another screen costs time and attention.
- Reveal with builds (one thing per click), not with a slide per step.
- Embeds in this deck type are self-playing animations: viewers cannot click or type. The teacher drives by advancing slides. Do not promise interactivity the viewer cannot give.
- Formula fonts: Google's subsets drop some superscript characters, so upload a font that has them, use real `<sup>` inside embeds, and keep Unicode superscripts out of body prose.

## 4. Pair the notes sheet with the deck
The sheet is the student's half of the same lesson. Match the deck's order. Print the explanation (the exemplar style: header bar, keyword strip, short text with bold terms, exam-style items with marks and answer lines) and make every blank a decision. Never ask for copying. Prefill the first example, half-fill the second, leave the third blank. Put faint guides where a drawing goes so the answer is the dots, not the layout. Produce a student copy and a key from one `.tex` file with a single switch.

## 5. Red-team before you hand it over
- Run the lesson in your head as a student in the back row: can you read it, can you tell what to do, is there a second where the answer is already on screen?
- Check every slide against the slot's scope and the repo's rules. List the conflicts instead of hiding them (see `README.md`).
- Render the sheet and look at it. A page that compiles can still overflow, misalign or hide a blank.
- Say plainly what you could not test (timers and animations that start when a slide appears were not run in the real viewer).

## 6. Handoff
One branch, never main. Update `PROGRESS.md`. Say what is not on the site until Ian merges.
