/* XK: small drawing and control helpers for the hands-on Explore stations of calculus lessons (Unit 4 on).
   Loaded after the lesson engine (it needs window.LE) and before the lesson's content.js.
   Graphs use data coordinates: XK.plot gives px(x) and py(y); every picture is an SVG with an aria-label. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, NS = 'http://www.w3.org/2000/svg';
  var XK = window.XK = { RED: '#b3412e', BLUE: '#2b4fd9', GREEN: '#1c7d4a', ORANGE: '#c26a00', INK: '#142230' };

  XK.sv = function (tag, attrs, parent) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  XK.guide = function (host, text) { var p = el('p', 'hint'); p.appendChild(el('b', null, 'How to read it: ')); p.appendChild(document.createTextNode(text)); host.appendChild(p); };
  XK.fm = function (v, d) { var s = LE.fmt(v, d == null ? 2 : d); return s.indexOf('.') >= 0 ? s.replace(/\.?0+$/, '') : s; };

  /* A graph from xmin..xmax and ymin..ymax with a light grid, axes and number labels.
     o: {xmin,xmax,ymin,ymax,xstep,ystep,xlabel,ylabel,label,w,h,max}  returns {svg,px,py} */
  XK.plot = function (host, o) {
    var W = o.w || 380, H = o.h || 300, L = 46, R = 12, T = 12, B = 34, S = XK.sv, t, svg;
    var G = { px: function (x) { return L + (x - o.xmin) / (o.xmax - o.xmin) * (W - L - R); }, py: function (y) { return H - B - (y - o.ymin) / (o.ymax - o.ymin) * (H - B - T); } };
    svg = S('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.label, style: 'width:100%;max-width:' + (o.max || 460) + 'px;background:var(--stage);border:1px solid var(--line);border-radius:8px;display:block' });
    G.svg = svg;
    for (t = o.xmin; t <= o.xmax + 1e-9; t += o.xstep) {
      S('line', { x1: G.px(t), y1: G.py(o.ymin), x2: G.px(t), y2: G.py(o.ymax), stroke: '#d5dde5', 'stroke-width': 1 }, svg);
      S('text', { x: G.px(t), y: H - B + 14, 'font-size': 11, 'text-anchor': 'middle', fill: XK.INK }, svg).textContent = XK.fm(t, 2);
    }
    for (t = o.ymin; t <= o.ymax + 1e-9; t += o.ystep) {
      S('line', { x1: G.px(o.xmin), y1: G.py(t), x2: G.px(o.xmax), y2: G.py(t), stroke: '#d5dde5', 'stroke-width': 1 }, svg);
      S('text', { x: L - 5, y: G.py(t) + 4, 'font-size': 11, 'text-anchor': 'end', fill: XK.INK }, svg).textContent = XK.fm(t, 2);
    }
    if (o.ymin <= 0 && o.ymax >= 0) S('line', { x1: G.px(o.xmin), y1: G.py(0), x2: G.px(o.xmax), y2: G.py(0), stroke: '#7a8a99', 'stroke-width': 1.5 }, svg);
    if (o.xmin <= 0 && o.xmax >= 0) S('line', { x1: G.px(0), y1: G.py(o.ymin), x2: G.px(0), y2: G.py(o.ymax), stroke: '#7a8a99', 'stroke-width': 1.5 }, svg);
    if (o.xlabel) S('text', { x: (L + W - R) / 2, y: H - 4, 'font-size': 12, 'text-anchor': 'middle', fill: XK.INK }, svg).textContent = o.xlabel;
    if (o.ylabel) S('text', { x: 12, y: (T + H - B) / 2, 'font-size': 12, 'text-anchor': 'middle', fill: XK.INK, transform: 'rotate(-90 12 ' + (T + H - B) / 2 + ')' }, svg).textContent = o.ylabel;
    host.appendChild(svg); return G;
  };
  XK.curve = function (G, fn, x0, x1, color, w) {
    var d = '', n = 160, i, x; for (i = 0; i <= n; i++) { x = x0 + (x1 - x0) * i / n; d += (i ? 'L' : 'M') + G.px(x).toFixed(1) + ' ' + G.py(fn(x)).toFixed(1); }
    return XK.sv('path', { d: d, fill: 'none', stroke: color, 'stroke-width': w || 3 }, G.svg);
  };
  XK.line = function (G, color, w) { return XK.sv('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: color, 'stroke-width': w || 2.5 }, G.svg); };
  XK.setLine = function (G, n, x1, y1, x2, y2) { n.setAttribute('x1', G.px(x1)); n.setAttribute('y1', G.py(y1)); n.setAttribute('x2', G.px(x2)); n.setAttribute('y2', G.py(y2)); };
  /* the line through (x0, y0) with slope m, drawn from x0 - L to x0 + L (in x units) */
  XK.through = function (G, n, x0, y0, m, L) { XK.setLine(G, n, x0 - L, y0 - m * L, x0 + L, y0 + m * L); };
  XK.dot = function (G, color) { return XK.sv('circle', { r: 6, fill: color, stroke: '#fff', 'stroke-width': 1.5 }, G.svg); };
  XK.setDot = function (G, n, x, y) { n.setAttribute('cx', G.px(x)); n.setAttribute('cy', G.py(y)); };
  XK.slider = function (row, label, min, max, step, val, fn) {
    var l = el('label', null, label + ' '), i = el('input'), o = el('b', null, String(val)); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = val; i.setAttribute('aria-label', label);
    i.oninput = function () { o.textContent = i.value; fn(); }; l.appendChild(i); l.appendChild(o); row.appendChild(l); return i;
  };
  XK.checkBtn = function (ctl, text, fn) { var b = el('button', 'btn primary', text); b.type = 'button'; b.onclick = fn; ctl.appendChild(b); return b; };
  /* a row of answer buttons in an order shuffled by seed; onPick(index in labels, button) */
  XK.choices = function (host, labels, seed, onPick) {
    var row = el('div', 'row'); host.appendChild(row);
    LE.shuffle(labels.map(function (_, i) { return i; }), LE.seedRng(seed)).forEach(function (i) { var b = el('button', 'btn', labels[i]); b.type = 'button'; if (i === 0) b.setAttribute('data-ok', '1'); b.onclick = function () { onPick(i, b); }; row.appendChild(b); });
    return row;
  };
})();
