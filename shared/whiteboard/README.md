# Class boards (Chem board, Stats board)

A whiteboard for direct-instruction notes, with pasteable organizers. It is [Excalidraw](https://github.com/excalidraw/excalidraw) (MIT license, free), bundled into this repo so it runs from the site with no account and no calls to excalidraw.com. One bundle (`shared/whiteboard/app/`) runs every board; each board is a small page that says which stencils to load.

| Board | Page | Linked from |
|---|---|---|
| Chem board | `chemistry/whiteboard/index.html` | `chemistry/teacher.html`, `teacher/index.html` |
| Stats board | `stats/whiteboard/index.html` | `stats/teacher.html`, `teacher/index.html` |

Add `#all` to a board's address to see every stencil laid out in a grid (never saved; good for checking a change or printing a stencil sheet).

Open the Library panel on the right: click a stencil, then move, resize (corner handles), rotate (top handle) or ungroup it (Ctrl+Shift+G). Pen, text, shapes and arrows are the toolbar at the top.

Shelves: the Library panel is one flat list, so the board shows one shelf at a time. Tabs along the bottom switch shelves. Press + Shelf to make one for a unit or concept. Select drawings on the board and use Add to library, and they land on the shelf that is open. Your shelves and the stencils on them are saved in this browser, so they do not move to another computer. Built-in stencils always come from the code.

- **Autosave**: every change is saved in the browser you use (localStorage; keys `mrd-chem-whiteboard-v1` and `mrd-stats-whiteboard-v1`). The save waits under a second after the last change, and runs at once when the tab is hidden or closed. If the browser cannot save (storage full or blocked), a red bar says so. Another browser or computer starts empty.
- **Backup**: menu (top left) > Save to gives a `.excalidraw` file; Open loads one. Export image gives a PNG or SVG.
- **Menu**: only Open, Save to, Export image, Find, Help, Reset the canvas, Dark mode. The Excalidraw defaults (GitHub, social links, ads) are removed, and the Library's "Browse libraries" button (which goes to excalidraw.com) is hidden.
- **Offline**: each board has a service worker (`sw.js`) that caches it after the first visit. In Chrome, menu > Cast, save and share > Install page as app gives a window of its own.

## Lesson boards

A lesson board is a board with a whole lesson (or the notes huddle of a sim day) already drawn, in teaching order, so the teacher writes, scrolls and explains instead of drawing. Open it with `#lesson=<id>`, for example `stats/whiteboard/index.html#lesson=3.4` (linked from `stats/teacher.html`).

- **Frames**: one screen each (Warm-up, Part 1, Part 2, Part 3 in three frames, Exit and up next). The buttons along the bottom jump to a frame.
- **Answers**: every blank the students fill in has the answer under an orange cover. Select the cover and press Delete to reveal it.
- **Saving**: each lesson board saves under its own key (`mrd-stats-lesson-3.4-v1`), so it never overwrites the plain board. Start over (last button) erases it and redraws the lesson.
- **Shelves**: only the shelves the lesson uses (Normal curve, Routines, Graph tools) show.
- **Source**: `tools/whiteboard/src/lessons/stats-3-4.js` (frames drawn with the same `graph` and `normal` helpers as the stencils; numbers match the 3.4 thinking notes and board script). Rebuild with `node tools/whiteboard/build.mjs`. A new lesson board is a new file in `lessons/` plus one line in `LESSONS` in `app.jsx`.

The chem board has one: `chemistry/whiteboard/index.html#lesson=zeff` (slot 15, the Pull Bench virtual lab). It is the **notes huddle** of a sim day: four frames (core and shielding, sodium worked, label the atom, what is tested); the lab's seven blanks follow frames 1, 2 and 4 in order (frame 3 is skipped). Every blank has its answer under an orange cover. Script: `chemistry/unit-3-atoms-ions/day-cards/slot-15.board.md`.

## Chem stencils (41)

| Group | Items |
|---|---|
| Config | rows 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p (labelled); s, p, d boxes (no label); ladders 1s to 3p and 1s to 4p, lowest energy at the bottom; spin up, spin down, spin pair |
| Bohr | empty 2, 3, 4 shells; H, Li, C, O, Na, Cl with electrons; electron dot; nucleus |
| Table | blank; blank with group and period numbers; s, p, d, f blocks shaded (group 3 is drawn in the d block, the f block is 14 wide) |
| Levels | n = 1 to 5 drawn to scale (levels bunch up); 3 and 4 evenly spaced; emission arrow, absorption arrow, photon |
| Z_eff | Li, Na, K, Mg and Cl with the core rings amber and the outer ring blue; cards for Z_eff = Z − core, the five moves, and pull = Z_eff ÷ n² |

## Stats stencils (29)

| Shelf | Items |
|---|---|
| Word cards | density curve, uniform distribution, skewed right, skewed left, symmetric, normal distribution, the mean follows the tail, area = proportion. Each card is a term, one plain sentence, and three pictures: two examples (green check) and one non-example (red cross) |
| Density curves | blank axes; uniform 0 to 20 (bus wait), with the right tail shaded, uniform 0 to 40, and a height-and-base frame; normal with mean = median; narrow and wide (both area 1); skewed right and left with mean and median lines; histogram turning into a curve |
| Normal curve | SD marks blank and labeled μ ± σ; middle 68, 95 and 99.7 shaded; two 2.5% tails; shade left of, right of, and between two values; same SD with different means; same mean with different SDs |
| Graph tools | number line (labeled and blank), dot, stack of dots, histogram frame, boxplot frame |
| Routines | Look, Mark, Number, Say; Sketch, Mark, Compute, Say; the three forms of the z equation; undo it |

Curves are computed from formulas, so the mean and median lines on the skewed stencils sit where they really are (the skew-right curve has mean 5.0 and median 4.35 on its axis).

## Adding or changing a stencil

The stencils are code, in `tools/whiteboard/src/chem.js` and `tools/whiteboard/src/stats.js`: small helpers (in `draw.js`: `rect`, `ellipse`, `text`, `arrow`) and one `add('Name · item', [...])` line per item. The word before the dot picks the shelf (`SHELVES` at the foot of the file). After a change:

```
cd tools/whiteboard && npm install     # once
node tools/whiteboard/build.mjs        # writes shared/whiteboard/app/ (about 8.8 MB, includes the fonts)
```

Then open the board with `#all` and look at the new stencil. Commit `app/` with the source. `node_modules` is not committed. A new board is a new `<course>/whiteboard/` folder (copy `stats/whiteboard/`), a new entry in `BOARDS` in `app.jsx`, and a new stencils file.
