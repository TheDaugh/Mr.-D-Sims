// Room art and hover pictures for the physics lab, drawn in code (no images). The chemistry room engine calls these through window.VLAB_HOST:
//   art(kit)  -> { tileId: draw(x, y, state, tile) }   the isometric objects: track, balance, bar_shelf
//   icons     -> { id: draw(R, color) }                24x24 pictures for hover tips, the shelf screen and the carrying row
// The kit is the room renderer's own drawing helpers (box, fl, poly, P, R, tileAt, room).

export const art = ({ box, fl, poly, P, tileAt, room }) => ({
  // Four tiles wide: rail, cart with the fan on top, bars stacked on the cart, motion sensor at the far end.
  track: (x, y) => {
    let i = 0; while (tileAt(room, x - 1 - i, y)?.id === "track") i++;
    box(x, y + 0.3, 1, 0.4, 3, "#9aa4ae");                                  // the rail, one piece per tile
    box(x + 0.1, y + 0.25, 0.12, 0.5, 2, "#6b7480"); box(x + 0.78, y + 0.25, 0.12, 0.5, 2, "#6b7480");
    if (i === 0) { box(x + 0.05, y + 0.3, 0.12, 0.4, 7, "#6b7480", 3); }    // end stop
    if (i === 1) {                                                          // the cart (first half): body, wheels, the fan and its force sensor
      box(x + 0.15, y + 0.22, 0.85, 0.56, 4, "#5aa0d8", 3);
      box(x + 0.2, y + 0.18, 0.1, 0.12, 2, "#2b2f36", 3); box(x + 0.2, y + 0.7, 0.1, 0.12, 2, "#2b2f36", 3);
      box(x + 0.25, y + 0.35, 0.3, 0.3, 9, "#e8943a", 7);                   // fan housing
      box(x + 0.58, y + 0.45, 0.14, 0.14, 3, "#3ecf6a", 7);                 // force sensor
      box(x + 0.3, y + 0.45, 0.2, 0.1, 1, "#fff4e0", 16);                   // blades
    }
    if (i === 2) {                                                          // the cart (second half) with the bars stacked on it
      box(x, y + 0.22, 0.75, 0.56, 4, "#5aa0d8", 3);
      box(x + 0.7, y + 0.18, 0.1, 0.12, 2, "#2b2f36", 3); box(x + 0.7, y + 0.7, 0.1, 0.12, 2, "#2b2f36", 3);
      box(x + 0.1, y + 0.3, 0.5, 0.4, 3, "#2b2f36", 7); box(x + 0.1, y + 0.3, 0.5, 0.4, 3, "#3b3f46", 10);
    }
    if (i === 3) { box(x + 0.3, y + 0.22, 0.4, 0.56, 14, "#2f9e5a", 3); box(x + 0.38, y + 0.3, 0.1, 0.4, 5, "#cfeedd", 9); }   // motion sensor
  },
  // A small scale with a pan.
  balance: (x, y) => {
    box(x, y, 1, 1, 8, "#b98b5e");
    box(x + 0.15, y + 0.25, 0.7, 0.55, 4, "#58606b", 8);
    box(x + 0.25, y + 0.35, 0.5, 0.35, 1, "#c9ced6", 12);                   // the pan
    fl(x + 0.15, y + 0.8, 0.12, 0.5, 8.5, 10.5, "#27341f"); fl(x + 0.15, y + 0.8, 0.16, 0.36, 9, 10, "#9fe870");   // the readout
  },
  // Dark bars on a shelf.
  bar_shelf: (x, y) => {
    box(x + 0.05, y, 0.9, 0.6, 14, "#8a6a47");
    for (let r = 0; r < 2; r++) for (let j = 0; j < 3; j++) { fl(x + 0.05, y + 0.6, 0.1 + j * 0.28, 0.1 + j * 0.28 + 0.2, 2 + r * 6, 5 + r * 6, "#2b2f36"); fl(x + 0.05, y + 0.6, 0.1 + j * 0.28, 0.1 + j * 0.28 + 0.2, 5 + r * 6, 6 + r * 6, "#4a4f58"); }
  }
});

export const icons = {
  bar: (R) => { R(3, 9, 18, 8, "#2b2f36"); R(3, 9, 18, 2, "#4a4f58"); R(3, 17, 18, 1, "#0006"); R(6, 12, 4, 1, "#6b7480"); },
  cart: (R) => { R(3, 10, 18, 6, "#5aa0d8"); R(3, 14, 18, 2, "#3c7fb8"); R(5, 17, 4, 4, "#2b2f36"); R(15, 17, 4, 4, "#2b2f36"); R(5, 5, 5, 5, "#e8943a"); R(11, 7, 3, 3, "#3ecf6a"); },
  bar_shelf: (R) => { R(3, 3, 18, 18, "#8a6a47"); R(4, 4, 16, 16, "#6d5236"); R(4, 11, 16, 1, "#8a6a47"); for (let i = 0; i < 2; i++) for (let r = 0; r < 2; r++) { R(5 + i * 8, 5 + r * 8, 6, 4, "#2b2f36"); R(5 + i * 8, 5 + r * 8, 6, 1, "#4a4f58"); } },
  track: (R) => { R(2, 16, 20, 3, "#9aa4ae"); R(3, 19, 2, 3, "#6b7480"); R(19, 19, 2, 3, "#6b7480"); R(4, 10, 11, 6, "#5aa0d8"); R(5, 5, 4, 5, "#e8943a"); R(10, 7, 4, 3, "#2b2f36"); R(18, 8, 4, 8, "#2f9e5a"); },
  stepcard: (R) => { R(3, 4, 18, 14, "#2f3b33"); R(3, 4, 18, 1, "#8a6a47"); R(5, 7, 10, 1, "#eef2ea"); R(5, 10, 13, 1, "#eef2ea"); R(5, 13, 8, 1, "#eef2ea"); R(4, 18, 16, 2, "#8a6a47"); },
  notice: (R) => { R(4, 3, 16, 17, "#a07c55"); R(6, 5, 12, 13, "#f4f4f0"); R(8, 8, 8, 1, "#566170"); R(8, 11, 8, 1, "#566170"); R(8, 14, 5, 1, "#566170"); R(11, 2, 2, 3, "#c0392b"); }
};
