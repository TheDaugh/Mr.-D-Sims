/* Chemistry stencils for the whiteboard: electron-configuration boxes, Bohr (energy level) circles,
   blank periodic tables, and energy level ladders. Every item is drawn from the numbers below, so a new
   stencil is a few lines here and `node tools/whiteboard/build.mjs`.

   buildLibrary(convert) -> Excalidraw library items. `convert` is Excalidraw's convertToExcalidrawElements.
   Each item is one group, so it moves and resizes as a single object. Ungroup (Ctrl+Shift+G) to edit parts. */

import { INK, BLUE, rect, ellipse, text, line, arrow, labeled, makeItem } from './draw.js';

function item(convert, name, skeletons) { return makeItem(convert, 'chem', name, skeletons); }

/* ---------- electron configuration boxes ---------- */

var BOX = 40;
var SUB_BOXES = { s: 1, p: 3, d: 5 };
var ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p']; /* bottom to top, the order the sim fills them */

/* one row: label on the left, then the boxes touching. Returns skeletons; (x, y) is the top left of the row. */
function configRow(sub, x, y, labelled) {
  var out = [], n = SUB_BOXES[sub.charAt(sub.length - 1)], bx = x + (labelled ? 52 : 0), i;
  if (labelled) out.push(text(x, y + 8, sub, 24));
  for (i = 0; i < n; i++) out.push(rect(bx + i * BOX, y, BOX, BOX));
  return out;
}

function ladder(subs) {
  /* stacked rows, lowest energy at the bottom, with an Energy arrow on the left */
  var out = [], rowGap = 24, step = BOX + rowGap, top = 40, x0 = 70, i, h = subs.length * step - rowGap;
  subs.forEach(function (sub, k) {
    var y = top + (subs.length - 1 - k) * step;
    out = out.concat(configRow(sub, x0, y, true));
  });
  out.push(arrow(30, top + h, [[0, 0], [0, -(h + 8)]], { strokeWidth: 3 }));
  out.push(text(8, 0, 'Energy', 20));
  return out;
}

function spinArrow(x, y, up) {
  var len = 26;
  return up ? arrow(x, y + len, [[0, 0], [0, -len]], { strokeWidth: 3 }) : arrow(x, y, [[0, 0], [0, len]], { strokeWidth: 3 });
}

/* ---------- Bohr (energy level circles) ---------- */

var RING = [46, 82, 118, 154];

function bohr(rings, counts) {
  var out = [], R = RING[rings - 1] + 10, cx = R, cy = R, r, i, j, k, a, off;
  for (i = 0; i < rings; i++) {
    r = RING[i];
    out.push(ellipse(cx - r, cy - r, 2 * r, 2 * r));
  }
  out.push(ellipse(cx - 20, cy - 20, 40, 40, { backgroundColor: '#e9ecef' }));
  if (counts) {
    for (i = 0; i < counts.length; i++) {
      k = counts[i]; r = RING[i]; off = -90 + i * 25;
      for (j = 0; j < k; j++) {
        a = (off + (360 * j) / k) * Math.PI / 180;
        out.push(ellipse(cx + r * Math.cos(a) - 6, cy + r * Math.sin(a) - 6, 12, 12, { backgroundColor: BLUE, strokeColor: BLUE, strokeWidth: 1 }));
      }
    }
  }
  return out;
}

/* ---------- periodic tables ---------- */

var CELL = 36;
var BLOCK_FILL = { s: '#ffc9c9', p: '#a5d8ff', d: '#b2f2bb', f: '#ffec99' };

/* which cells exist, as [period 1..7][group 1..18] */
function tableCells() {
  var cells = [], p, g, row;
  for (p = 1; p <= 7; p++) {
    row = [];
    for (g = 1; g <= 18; g++) {
      var here;
      if (p === 1) here = (g === 1 || g === 18);
      else if (p <= 3) here = (g <= 2 || g >= 13);
      else here = true;
      if (here) row.push(g);
    }
    cells.push(row);
  }
  return cells;
}

function blockOf(p, g) {
  if (g <= 2 || (p === 1 && g === 18)) return 's';
  if (g >= 13) return 'p';
  return 'd';
}

function periodicTable(opts) {
  var out = [], x0 = opts.numbers ? 30 : 0, y0 = opts.numbers ? 30 : 0, cells = tableCells(), p, i, g, c;
  if (opts.numbers) {
    for (g = 1; g <= 18; g++) out.push(labeled(x0 + (g - 1) * CELL, 0, CELL, 30, String(g), 14, { strokeColor: 'transparent' }));
    for (p = 1; p <= 7; p++) out.push(labeled(0, y0 + (p - 1) * CELL, 30, CELL, String(p), 14, { strokeColor: 'transparent' }));
  }
  for (p = 1; p <= 7; p++) {
    for (i = 0; i < cells[p - 1].length; i++) {
      g = cells[p - 1][i];
      c = opts.blocks ? { backgroundColor: BLOCK_FILL[blockOf(p, g)] } : {};
      out.push(rect(x0 + (g - 1) * CELL, y0 + (p - 1) * CELL, CELL, CELL, c));
    }
  }
  /* f block: two rows of 14 under groups 4 to 17, set apart from the table */
  var fy = y0 + 7 * CELL + 18, r;
  for (r = 0; r < 2; r++) {
    for (i = 0; i < 14; i++) {
      c = opts.blocks ? { backgroundColor: BLOCK_FILL.f } : {};
      out.push(rect(x0 + (3 + i) * CELL, fy + r * CELL, CELL, CELL, c));
    }
  }
  return out;
}

/* ---------- energy level ladders (emission and absorption) ---------- */

function levels(n) {
  /* hydrogen-like spacing: E_n = -1/n^2, so the levels bunch up toward the top.
     Labels for n = 3 and up alternate sides so they do not collide. */
  var out = [], W = 170, H = 360, i, y, e, base = 20, side;
  for (i = 1; i <= n; i++) {
    e = 1 - 1 / (i * i);            /* 0 at n=1, toward 1 as n grows */
    y = base + H - (e / (1 - 1 / (n * n))) * H;
    out.push(line(70, y, [[0, 0], [W, 0]], { strokeWidth: 3 }));
    side = (i <= 2 || i % 2 === 0) ? 'left' : 'right';
    out.push(text(side === 'left' ? 16 : 70 + W + 10, y - 11, 'n = ' + i, 18));
  }
  out.push(arrow(8, base + H + 10, [[0, 0], [0, -(H + 36)]], { strokeWidth: 3 }));
  out.push(text(-6, base - 66, 'Energy', 20));
  return out;
}

function simpleLevels(n) {
  var out = [], W = 170, gap = 60, i, y, names = ['Ground state'];
  for (i = 0; i < n; i++) {
    y = 20 + (n - 1 - i) * gap;
    out.push(line(70, y, [[0, 0], [W, 0]], { strokeWidth: 3 }));
  }
  out.push(arrow(30, 20 + (n - 1) * gap + 12, [[0, 0], [0, -((n - 1) * gap + 40)]], { strokeWidth: 3 }));
  out.push(text(8, -44, 'Energy', 20));
  return out;
}

function photon(x, y, len) {
  /* a wavy line with an arrowhead, pointing right; rotate it with the handle */
  var pts = [], i, n = 40, amp = 7, cycles = Math.max(3, Math.round(len / 28));
  for (i = 0; i <= n; i++) pts.push([(len * i) / n, amp * Math.sin((2 * Math.PI * cycles * i) / n)]);
  return line(x, y, pts, { strokeColor: '#e03131', strokeWidth: 3, roundness: { type: 2 } });
}

/* ---------- the library ---------- */

function buildLibrary(convert) {
  var items = [], i;
  function add(name, sk) { items.push(item(convert, name, sk)); }

  /* Electron configuration */
  ORDER.forEach(function (sub) { add('Config · ' + sub + ' row', configRow(sub, 0, 0, true)); });
  add('Config · s boxes (no label)', configRow('s', 0, 0, false));
  add('Config · p boxes (no label)', configRow('p', 0, 0, false));
  add('Config · d boxes (no label)', configRow('d', 0, 0, false));
  add('Config · ladder 1s to 3p (Z up to 18)', ladder(ORDER.slice(0, 5)));
  add('Config · ladder 1s to 4p (Z up to 36)', ladder(ORDER));
  add('Spin · up arrow', [spinArrow(0, 0, true)]);
  add('Spin · down arrow', [spinArrow(0, 0, false)]);
  add('Spin · pair (fits one box)', [spinArrow(12, 0, true), spinArrow(28, 0, false)]);

  /* Bohr energy level circles */
  add('Bohr · 2 shells', bohr(2));
  add('Bohr · 3 shells', bohr(3));
  add('Bohr · 4 shells', bohr(4));
  add('Bohr · H (1)', bohr(1, [1]));
  add('Bohr · Li (2,1)', bohr(2, [2, 1]));
  add('Bohr · C (2,4)', bohr(2, [2, 4]));
  add('Bohr · O (2,6)', bohr(2, [2, 6]));
  add('Bohr · Na (2,8,1)', bohr(3, [2, 8, 1]));
  add('Bohr · Cl (2,8,7)', bohr(3, [2, 8, 7]));
  add('Bohr · electron dot', [ellipse(0, 0, 12, 12, { backgroundColor: BLUE, strokeColor: BLUE, strokeWidth: 1 })]);
  add('Bohr · nucleus', [ellipse(0, 0, 40, 40, { backgroundColor: '#e9ecef' })]);

  /* Periodic tables */
  add('Table · blank', periodicTable({}));
  add('Table · blank with group and period numbers', periodicTable({ numbers: true }));
  add('Table · s, p, d, f blocks shaded', periodicTable({ blocks: true }));

  /* Energy level ladders */
  add('Levels · n = 1 to 5 (bunch up)', levels(5));
  add('Levels · 3 evenly spaced', simpleLevels(3));
  add('Levels · 4 evenly spaced', simpleLevels(4));
  add('Levels · emission arrow (down)', [arrow(0, 0, [[0, 0], [0, 80]], { strokeColor: '#e03131', strokeWidth: 3 })]);
  add('Levels · absorption arrow (up)', [arrow(0, 80, [[0, 0], [0, -80]], { strokeColor: '#2f9e44', strokeWidth: 3 })]);
  add('Levels · photon (wavy)', [photon(0, 0, 140)]);

  return items;
}

/* Which shelf each built-in stencil sits on, by the word before the dot in its name.
   Add a shelf here, or just use the "+ Shelf" button on the board for your own. */
var SHELVES = [
  { name: 'Electron configuration', prefixes: ['Config', 'Spin'] },
  { name: 'Atom pictures', prefixes: ['Bohr'] },
  { name: 'Periodic table', prefixes: ['Table'] },
  { name: 'Energy levels', prefixes: ['Levels'] }
];

export { buildLibrary, SHELVES };
