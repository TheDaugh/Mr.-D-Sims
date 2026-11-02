# Chem board

A whiteboard for direct-instruction notes, with pasteable chemistry organizers. It is [Excalidraw](https://github.com/excalidraw/excalidraw) (MIT license, free), bundled into this repo so it runs from the site with no account and no calls to excalidraw.com.

Open `chemistry/whiteboard/index.html` (linked from the chemistry teacher page). The Library panel on the right holds the stencils: click one, then move, resize (corner handles), rotate (top handle) or ungroup it (Ctrl+Shift+G). Pen, text, shapes and arrows are the toolbar at the top.

Shelves: the Library panel is one flat list, so the board shows one shelf at a time. Tabs along the bottom switch shelves: Electron configuration, Atom pictures, Periodic table, Energy levels. Press + Shelf to make one for a unit or concept. Select drawings on the board and use Add to library, and they land on the shelf that is open. Your shelves and the stencils on them are saved in this browser (localStorage key `mrd-chem-library-v1`), so they do not move to another computer. Built-in stencils always come from the code.

- **Autosave**: every change is saved in the browser you use (localStorage, key `mrd-chem-whiteboard-v1`). Another browser or computer starts empty.
- **Backup**: menu (top left) > Save to disk gives a `.excalidraw` file; Open loads one. Export image gives a PNG or SVG.
- **Offline**: a service worker (`sw.js`) caches the board after the first visit. In Chrome, menu > Cast, save and share > Install page as app gives a window of its own.

## Stencils (36)

| Group | Items |
|---|---|
| Config | rows 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p (labelled); s, p, d boxes (no label); ladders 1s to 3p and 1s to 4p, lowest energy at the bottom; spin up, spin down, spin pair |
| Bohr | empty 2, 3, 4 shells; H, Li, C, O, Na, Cl with electrons; electron dot; nucleus |
| Table | blank; blank with group and period numbers; s, p, d, f blocks shaded (group 3 is drawn in the d block, the f block is 14 wide) |
| Levels | n = 1 to 5 drawn to scale (levels bunch up); 3 and 4 evenly spaced; emission arrow, absorption arrow, photon |

## Adding or changing a stencil

The stencils are code, in `src/stencils.js`: small helpers (`rect`, `ellipse`, `text`, `arrow`) and one `add('Name', [...])` line per item. After a change:

```
cd tools/whiteboard && npm install     # once
node tools/whiteboard/build.mjs        # writes chemistry/whiteboard/app/ (about 8.8 MB, includes the fonts)
```

Commit `app/` with the source. `node_modules` is not committed.
