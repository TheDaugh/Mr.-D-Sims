/* Small drawing kit for the stats lesson boards from 3.5 on (3.4 keeps its own copy). Every board is built from frames of
   1500 x 1080 with a free band at the bottom for the buttons. Answers sit under an orange cover: select it and press Delete. */

import { INK, BLUE, RED, GREEN, GRAY, rect, text, line, arrow, labeled } from '../draw.js';
import { graph, normal, ctext } from '../stats.js';

export var FW = 1500, FH = 1080, GAP = 480;
export var CBLUE = '#bcd3ee', CYEL = '#f6e7a8', CORG = '#f4c7a1', CWHITE = '#ffffff';
export { INK, BLUE, RED, GREEN, GRAY, rect, text, line, arrow, labeled, graph, normal, ctext };

export function F(k) { return k * (FW + GAP); }
export function sh(els, dx, dy) { return els.map(function (e) { return Object.assign({}, e, { x: e.x + dx, y: e.y + dy }); }); }
export function cover(x, y, w, h) { return labeled(x, y, w, h, '?', 22, { strokeWidth: 2, strokeColor: '#e8590c', backgroundColor: '#ffd8a8' }); }
/* an answer box: outline, the answer, and the cover that hides it */
export function ans(x, y, w, h, a, size) {
  return [rect(x, y, w, h, { strokeWidth: 2, backgroundColor: '#ffffff' }), ctext(x + w / 2, y + h / 2 - (size || 26) * 0.6, String(a), size || 26, { strokeColor: RED }), cover(x, y, w, h)];
}
export function given(x, y, w, h, t, size) {
  return [rect(x, y, w, h, { strokeWidth: 2, backgroundColor: '#ffffff' }), ctext(x + w / 2, y + h / 2 - (size || 26) * 0.6, String(t), size || 26)];
}
export function title(x0, y0, i, t) {
  return [rect(x0, y0, FW, FH, { strokeWidth: 1, strokeColor: '#adb5bd', id: 'lesson-frame-' + i }), text(x0 + 24, y0 + 16, t, 34, { strokeWidth: 2 })];
}
export function note(x, y, t, size, o) { return text(x, y, t, size || 28, o || {}); }
export function keep(x, y, w, t) { return [rect(x, y, w, 56, { strokeWidth: 2, backgroundColor: '#fff9db' }), note(x + 16, y + 10, t, 26, { strokeWidth: 2 })]; }

/* The pizza curve (mean 30, SD 6) with optional shading and dashed cut lines. */
export var PIZZA = normal(30, 6, 12, 48);
export function pizza(w, h, shade, cuts, ticksOn, tickSize) {
  var ticks = [], v;
  for (v = 12; v <= 48; v += 6) ticks.push([v, ticksOn === false ? '' : String(v)]);
  return graph({ w: w, h: h, lo: 12, hi: 48, ymax: 0.075, yaxis: false, tickSize: tickSize || 20, ticks: ticks, curves: [{ d: PIZZA }], shade: shade || [],
    vlines: (cuts || []).map(function (c) { return { x: c, dash: true }; }) });
}
export function px(w, v) { return 46 + (v - 12) / 36 * w; }

/* The 100 bar: segments sized by percent. segs: [[percent, fill, text or null, answer or null]]. Narrow pieces put their label above. */
export function bar(x, y, w, segs, caption) {
  var out = [], left = 0;
  segs.forEach(function (s) {
    var sw = w * s[0] / 100, narrow = sw < 70, ly = narrow ? y - 44 : y + 14, ay = narrow ? y - 52 : y + 6;
    out.push(rect(x + left, y, sw, 56, { strokeWidth: 2, backgroundColor: s[1] }));
    if (s[2] !== null) out.push(ctext(x + left + sw / 2, ly, s[2], 26, { strokeWidth: 2 }));
    else if (s[3] !== null) out.push.apply(out, ans(x + left + sw / 2 - 45, ay, 90, 44, s[3], 26));
    left += sw;
  });
  out.push(ctext(x + w / 2, y + 64, caption || 'out of every 100 deliveries', 20, { strokeColor: GRAY }));
  return out;
}

/* Text is measured before the Nunito font has loaded, with a narrower fallback, so the last letters were clipped.
   Give every text box 30% more room (same fix as the library stencils). */
export function finish(convert, E) {
  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}
