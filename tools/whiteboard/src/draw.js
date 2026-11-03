/* Drawing helpers shared by every board's stencils. Each helper returns one Excalidraw "skeleton" element;
   makeItem() turns a list of skeletons into one library item (a single group). */

export var INK = '#1e1e1e';
export var BLUE = '#1971c2';
export var RED = '#e03131';
export var GREEN = '#2f9e44';
export var GRAY = '#868e96';
export var FONT = 6; /* Nunito */
var seq = 0;

function uid(p) { seq += 1; return p + '-' + seq; }

function style(o) {
  var s = { strokeColor: INK, strokeWidth: 2, roughness: 0, backgroundColor: 'transparent', fillStyle: 'solid', opacity: 100 };
  for (var k in o) s[k] = o[k];
  return s;
}
export function rect(x, y, w, h, o) { return style(Object.assign({ type: 'rectangle', x: x, y: y, width: w, height: h }, o)); }
export function ellipse(x, y, w, h, o) { return style(Object.assign({ type: 'ellipse', x: x, y: y, width: w, height: h }, o)); }
export function text(x, y, t, size, o) { return style(Object.assign({ type: 'text', x: x, y: y, text: t, fontSize: size || 20, fontFamily: FONT, strokeWidth: 1 }, o)); }
export function line(x, y, pts, o) { return style(Object.assign({ type: 'line', x: x, y: y, points: pts }, o)); }
export function arrow(x, y, pts, o) { return style(Object.assign({ type: 'arrow', x: x, y: y, points: pts, startArrowhead: null, endArrowhead: 'arrow' }, o)); }
export function labeled(x, y, w, h, t, size, o) {
  return rect(x, y, w, h, Object.assign({ label: { text: t, fontSize: size || 14, fontFamily: FONT, strokeColor: INK } }, o));
}

/* One library item from skeletons. `prefix` ('chem', 'stats') marks built-in items so the board can tell
   them from the ones a teacher saves herself. */
export function makeItem(convert, prefix, name, skeletons) {
  var els = convert(skeletons);
  /* Text is measured when the library is built, which can happen before the Nunito font has loaded; the fallback font is
     narrower, so the last letters of a label were clipped. Give every text box 30% more room (the text is left aligned). */
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  var gid = uid('g');
  els.forEach(function (e) { e.groupIds = [gid].concat(e.groupIds || []); });
  return { id: prefix + ':' + name, status: 'unpublished', created: Date.now(), name: name, elements: els };
}
