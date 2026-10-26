/* NK: the shared normal-distribution widgets for every stats lesson. Plain JS, no libraries, built for a 1366x768 Chromebook.
     NK.cdf(z) NK.invCdf(p) NK.cdf4(z)      the math (erf series computed at load, never typed in)
     NK.zTable(host, opts)                  the full z-table; modes "lookup", "inverse", "explore"; names the failed step on a wrong click
     NK.curve(host, opts)                   normal curve; draggable markers snap to z steps; shade left/right/between; readout hidden until commit
     NK.ruler(host, opts)                   SD-step ruler: how many SDs from the mean
     NK.dotplot(host, opts)                 dots, a draggable marker, a percentile count
     NK.hist(host, opts)                    bin-width slider; bars morph into a density curve
     NK.tiles(host, opts)                   drag-and-drop tiles and slots: mouse, touch, tap, keyboard
     NK.routine.render(host, opts)          the six-move card: Picture, z, Row, Column, Area, Sentence
     NK.example(host)                       the worked example (every number computed)
     NK.conceptTabs()                       tabs for MrD.concepts.mount: Table, Routine, Example
   Every number a widget invents is labeled "pretend" where it is shown. Styles: normal-kit.css. */
(function (root) {
  'use strict';
  var NK = {}, MINUS = '−';

  /* ---------- math ---------- */
  function erf(x) {                       // all-positive series: no cancellation, good to ~1e-15 for |x| < 6
    var s = x < 0 ? -1 : 1, a = Math.abs(x);
    if (a > 6) return s;
    var term = a, sum = a, n = 0;
    while (term > 1e-18 * sum && n < 400) { n++; term *= 2 * a * a / (2 * n + 1); sum += term; }
    return s * 2 / Math.sqrt(Math.PI) * Math.exp(-a * a) * sum;
  }
  function cdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function round4(v) { return Math.round(v * 1e4 + 1e-9) / 1e4; }
  function cdf4(z) { return round4(cdf(z)); }
  function invCdf(p) { var lo = -9, hi = 9; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (cdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  function pdf(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
  NK.erf = erf; NK.cdf = cdf; NK.cdf4 = cdf4; NK.invCdf = invCdf; NK.pdf = pdf; NK.round4 = round4;

  /* ---------- the table: 69 rows (-3.4 ... 3.4) plus a "-0.0" row so z between -0.09 and -0.01 has a home ---------- */
  var ROWS = [], t;
  for (t = 34; t >= 0; t--) ROWS.push({ id: 'n' + t, neg: true, t: t, label: MINUS + (t / 10).toFixed(1) });
  for (t = 0; t <= 34; t++) ROWS.push({ id: 'p' + t, neg: false, t: t, label: (t / 10).toFixed(1) });
  var ROWBY = {}; ROWS.forEach(function (r) { ROWBY[r.id] = r; });
  function zOf(row, col) { return (row.neg ? -1 : 1) * (row.t * 10 + col) / 100; }
  function cell(row, col) { return cdf4(zOf(row, col)); }
  function locate(z) {                    // z to its row and column: the whole number and first decimal pick the row, the second decimal the column
    var h = Math.round(Math.abs(z) * 100); h = Math.min(h, 349);
    var tenths = Math.floor(h / 10); return { id: (z < 0 ? 'n' : 'p') + tenths, col: h % 10 };
  }
  function fmtA(v) { return v.toFixed(4); }                          // in sentences: 0.8907
  function fmtCell(v) { return v.toFixed(4).replace(/^0/, ''); }      // in the table, where room is tight: .8907
  function fmtZ(z) { return (z < 0 ? MINUS : '') + Math.abs(z).toFixed(2); }
  NK.table = { rows: ROWS, core: ROWS.filter(function (r) { return r.id !== 'n0'; }), cell: cell, zOf: zOf, locate: locate, rowBy: ROWBY, fmt: fmtA };

  /* ---------- diagnosis (pure, tested without a browser) ---------- */
  function sameCell(a, b) { return a.id === b.id && a.col === b.col; }
  function mismatch(click, ref) { return (click.id !== ref.id ? 1 : 0) + (click.col !== ref.col ? 2 : 0); }   // 1 row, 2 column, 3 both
  /* task: { z, want:"left"|"right" }; click: { id, col }. Step 1 of a lookup. */
  NK.diagnoseLookup = function (task, click) {
    var want = task.want || 'left', ref = locate(task.z), refN = locate(-task.z), best = ref, m = mismatch(click, ref), rr = ROWBY[ref.id];
    if (sameCell(click, ref)) return want === 'right' ? { ok: true, kind: 'subtract', stage: 2, value: cell(rr, ref.col), msg: 'Right cell. The table gives the area to the LEFT of z. You need the right, so subtract from 1.' }
      : { ok: true, kind: 'ok', value: cell(rr, ref.col), msg: 'Right cell: the area to the left of z = ' + fmtZ(task.z) + ' is ' + fmtA(cell(rr, ref.col)) + '.' };
    if (want === 'right' && sameCell(click, refN)) return { ok: true, kind: 'ok', value: cell(ROWBY[refN.id], refN.col), msg: 'Good move. The right tail of z equals the left tail of ' + fmtZ(-task.z) + '. That cell is the answer: ' + fmtA(cell(ROWBY[refN.id], refN.col)) + '.' };
    if (want === 'right' && mismatch(click, refN) < m) { best = refN; m = mismatch(click, refN); }
    var zs = fmtZ(task.z), bestRow = ROWBY[best.id], bits = [];
    if (m & 1) bits.push(click.id.charAt(0) !== best.id.charAt(0) && click.id.slice(1) === best.id.slice(1)
      ? 'Wrong row: check the sign. z = ' + fmtZ(zOf(bestRow, best.col)) + ' is ' + (bestRow.neg ? 'negative' : 'positive') + ', so use the rows that start with ' + (bestRow.neg ? MINUS : 'no minus sign') + '.'
      : 'Wrong row. For z = ' + fmtZ(zOf(bestRow, best.col)) + ' the row is ' + bestRow.label + '. You chose row ' + ROWBY[click.id].label + '.');
    if (m & 2) bits.push('Wrong column. The second decimal of ' + fmtZ(zOf(bestRow, best.col)).replace(MINUS, '') + ' is .0' + best.col + '. You chose .0' + click.col + '.');
    return { ok: false, kind: m === 3 ? 'both' : (m === 1 ? 'row' : 'col'), msg: bits.join(' ') };
  };
  /* Step 2 of a right-tail lookup: the student typed a final area. cellValue is the left area they found. */
  NK.diagnoseFinal = function (cellValue, final, want) {
    var need = want === 'right' ? round4(1 - cellValue) : cellValue;
    if (Math.abs(final - need) < 5e-5) return { ok: true, kind: 'ok', value: need, msg: 'Yes. ' + (want === 'right' ? '1 − ' + fmtA(cellValue) + ' = ' + fmtA(need) + '.' : fmtA(need) + '.') };
    if (want === 'right' && Math.abs(final - cellValue) < 5e-5) return { ok: false, kind: 'side', msg: 'That is the area to the LEFT of z. The question asks for the right. Subtract from 1: 1 − ' + fmtA(cellValue) + '.' };
    return { ok: false, kind: 'arith', msg: 'Not quite. ' + (want === 'right' ? 'Take 1 and subtract the table area ' + fmtA(cellValue) + '.' : 'Copy the table area ' + fmtA(cellValue) + '.') };
  };
  /* Inverse: task { p, want }. The table holds left areas, so a right-tail p is looked up as 1 - p. */
  NK.bestCell = function (a) {
    var best = null, d;
    ROWS.forEach(function (r) { for (var c = 0; c < 10; c++) { d = Math.abs(cell(r, c) - a); if (!best || d < best.d - 1e-12) best = { id: r.id, col: c, d: d, v: cell(r, c) }; } });
    return best;
  };
  NK.diagnoseInverse = function (task, click) {
    var want = task.want || 'left', a = want === 'right' ? round4(1 - task.p) : task.p, best = NK.bestCell(a), row = ROWBY[click.id], v = cell(row, click.col), d = Math.abs(v - a);
    if (d <= best.d + 1e-9) return { ok: true, kind: 'ok', z: zOf(row, click.col), value: v, msg: 'Closest cell: ' + fmtA(v) + '. So z = ' + fmtZ(zOf(row, click.col)) + '.' };
    if (want === 'right' && Math.abs(v - task.p) <= NK.bestCell(task.p).d + 1e-9) return { ok: false, kind: 'side', msg: 'You looked for ' + fmtA(task.p) + ', but that is a right-tail area. The table holds areas to the LEFT. Look for 1 − ' + fmtA(task.p) + ' = ' + fmtA(a) + '.' };
    var bR = ROWBY[best.id], k = (click.id !== best.id ? 1 : 0) + (click.col !== best.col ? 2 : 0);
    return { ok: false, kind: k === 3 ? 'both' : (k === 1 ? 'row' : 'col'), msg: (k === 1 ? 'Right column, wrong row.' : k === 2 ? 'Right row, wrong column.' : 'Not the closest cell.') + ' Your cell is ' + fmtA(v) + ', which is ' + d.toFixed(4) + ' away from ' + fmtA(a) + '. Look for the cell closest to ' + fmtA(a) + '.' };
  };

  /* ---------- tiny DOM helpers (browser only) ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, text) { var x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; }
  function sv(tag, attrs, parent) { var x = document.createElementNS(NS, tag); for (var k in attrs) x.setAttribute(k, attrs[k]); if (parent) parent.appendChild(x); return x; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function snap(v, step) { return Math.round(v / step) * step; }
  function emitter(obj) {
    var h = {}; obj.on = function (n, f) { (h[n] = h[n] || []).push(f); return obj; }; obj.emit = function (n, a) { (h[n] || []).forEach(function (f) { f(a); }); };
    return obj;
  }
  /* drag a handle along x in an svg; toVal maps svg x to a value, set(val) applies it. Mouse, touch and pen via pointer events; arrows for the keyboard. */
  function draggable(svg, handle, o) {
    var dragging = false;
    function svgX(ev) { var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return (ev.clientX - r.left) / r.width * vb.width; }
    handle.style.touchAction = 'none'; handle.style.cursor = 'ew-resize';
    handle.addEventListener('pointerdown', function (ev) { dragging = true; handle.setPointerCapture(ev.pointerId); ev.preventDefault(); handle.focus(); });
    handle.addEventListener('pointermove', function (ev) { if (dragging) o.set(o.toVal(svgX(ev))); });
    var end = function () { dragging = false; };
    handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', function (ev) {
      var d = ev.key === 'ArrowLeft' || ev.key === 'ArrowDown' ? -1 : ev.key === 'ArrowRight' || ev.key === 'ArrowUp' ? 1 : 0;
      if (ev.key === 'Home') { o.set(o.min()); ev.preventDefault(); } else if (ev.key === 'End') { o.set(o.max()); ev.preventDefault(); } else if (d) { o.set(o.get() + d * o.step()); ev.preventDefault(); }
    });
  }

  /* ---------- NK.curve ---------- */
  NK.curve = function (host, o) {
    o = Object.assign({ min: -3.5, max: 3.5, step: 0.25, markers: [1], shade: 'left', hideReadout: false, mean: null, sd: null, label: 'Normal curve' }, o || {});
    var W = 620, H = 250, X0 = 28, X1 = W - 28, BASE = H - 52, TOP = 18, zs = o.markers.slice(), shade = o.shade, committed = !o.hideReadout, self = emitter({});
    var wrap = el('div', 'nk-curve'), svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.label, 'class': 'nk-svg' }); wrap.appendChild(svg);
    var X = function (z) { return X0 + (z - o.min) / (o.max - o.min) * (X1 - X0); }, Y = function (z) { return BASE - pdf(z) / 0.4 * (BASE - TOP); };
    var fill = sv('path', { 'class': 'nk-fill' }, svg), line = sv('path', { 'class': 'nk-line', fill: 'none' }, svg), d = '';
    for (var z = o.min; z <= o.max + 1e-9; z += 0.05) d += (d ? 'L' : 'M') + X(z).toFixed(1) + ' ' + Y(z).toFixed(1); line.setAttribute('d', d);
    sv('line', { x1: X0, x2: X1, y1: BASE, y2: BASE, 'class': 'nk-axis' }, svg);
    for (var k = Math.ceil(o.min); k <= Math.floor(o.max); k++) {
      sv('line', { x1: X(k), x2: X(k), y1: BASE, y2: BASE + 5, 'class': 'nk-axis' }, svg);
      sv('text', { x: X(k), y: BASE + 20, 'text-anchor': 'middle', 'class': 'nk-tick' }, svg).textContent = (k < 0 ? MINUS : '') + Math.abs(k);
      if (o.mean != null && o.sd != null) sv('text', { x: X(k), y: BASE + 38, 'text-anchor': 'middle', 'class': 'nk-tick nk-data' }, svg).textContent = +(o.mean + k * o.sd).toFixed(2);
    }
    sv('text', { x: X1, y: BASE - 6, 'text-anchor': 'end', 'class': 'nk-tick' }, svg).textContent = 'z';
    var hs = zs.map(function (zv, i) {
      var g = sv('g', { 'class': 'nk-marker', tabindex: 0, role: 'slider', 'aria-label': 'Marker ' + (i + 1) + ' (z)', 'aria-valuemin': o.min, 'aria-valuemax': o.max }, svg);
      var ln = sv('line', { y1: TOP - 6, y2: BASE, 'class': 'nk-mline' }, g), dot = sv('circle', { r: 11, cy: TOP - 6, 'class': 'nk-mdot' }, g), tx = sv('text', { y: TOP - 2, 'text-anchor': 'middle', 'class': 'nk-mtx' }, g);
      return { g: g, ln: ln, dot: dot, tx: tx };
    });
    var readout = el('p', 'nk-readout'); readout.setAttribute('aria-live', 'polite');
    var btn = el('button', 'nk-btn', 'Show the area'); btn.type = 'button';
    wrap.appendChild(readout); if (o.hideReadout) wrap.appendChild(btn);
    function area() {
      var a = zs[0], b = zs.length > 1 ? zs[1] : zs[0];
      if (shade === 'left') return round4(cdf(a)); if (shade === 'right') return round4(1 - cdf(a)); if (shade === 'between') return round4(cdf(b) - cdf(a)); return null;
    }
    function bounds() { var a = zs[0], b = zs.length > 1 ? zs[1] : zs[0]; return shade === 'left' ? [o.min, a] : shade === 'right' ? [a, o.max] : shade === 'between' ? [a, b] : null; }
    function draw() {
      hs.forEach(function (h, i) { var x = X(zs[i]); h.g.setAttribute('transform', 'translate(' + x + ',0)'); h.g.setAttribute('aria-valuenow', zs[i]); h.tx.textContent = ''; h.dot.setAttribute('cx', 0); h.ln.setAttribute('x1', 0); h.ln.setAttribute('x2', 0); h.tx.setAttribute('x', 0); });
      var bd = bounds();
      if (!bd) fill.setAttribute('d', ''); else { var p = 'M' + X(bd[0]) + ' ' + BASE; for (var q = bd[0]; q <= bd[1] + 1e-9; q += 0.05) p += 'L' + X(q).toFixed(1) + ' ' + Y(q).toFixed(1); p += 'L' + X(bd[1]) + ' ' + Y(bd[1]).toFixed(1) + 'L' + X(bd[1]) + ' ' + BASE + 'Z'; fill.setAttribute('d', p); }
      hs.forEach(function (h, i) { h.g.querySelector('.nk-mtx').textContent = ''; });
      var a = area();
      if (committed) {
        var zt = zs.length > 1 && shade === 'between' ? 'z from ' + fmtZ(zs[0]) + ' to ' + fmtZ(zs[1]) : 'z = ' + fmtZ(zs[0]);
        readout.textContent = a == null ? zt : 'Area ' + (shade === 'between' ? 'between' : shade === 'left' ? 'to the left of' : 'to the right of') + ' ' + (shade === 'between' ? zt.replace('z from ', '').replace(' to ', ' and ') : zt.replace('z = ', '')) + ': ' + a.toFixed(4) + ' (' + (a * 100).toFixed(2) + '%)';
        readout.classList.remove('nk-hidden'); btn.hidden = true;
      } else { readout.textContent = 'Drag the marker, then press "Show the area".'; readout.classList.add('nk-hidden'); btn.hidden = false; }
      self.emit('change', { z: zs.slice(), area: committed ? a : null });
    }
    function setZ(i, v) {
      v = clamp(snap(v, o.step), o.min, o.max);
      if (zs.length > 1) { if (i === 0) v = Math.min(v, zs[1]); else v = Math.max(v, zs[0]); }
      zs[i] = Math.round(v * 1e6) / 1e6; draw();
    }
    hs.forEach(function (h, i) { draggable(svg, h.g, { toVal: function (x) { return o.min + (x - X0) / (X1 - X0) * (o.max - o.min); }, set: function (v) { setZ(i, v); }, get: function () { return zs[i]; }, step: function () { return o.step; }, min: function () { return o.min; }, max: function () { return o.max; } }); });
    btn.onclick = function () { self.commit(); };
    self.el = wrap; self.svg = svg;
    self.setZ = setZ; self.getZ = function () { return zs.slice(); }; self.area = area;
    self.setShade = function (m) { shade = m; draw(); };
    self.commit = function () { committed = true; draw(); self.emit('commit', { z: zs.slice(), area: area() }); };
    self.hide = function () { committed = false; draw(); };
    self.isCommitted = function () { return committed; };
    self.destroy = function () { wrap.remove(); };
    host.appendChild(wrap); draw(); return self;
  };

  /* ---------- NK.ruler ---------- */
  NK.ruler = function (host, o) {
    o = Object.assign({ mean: 70, sd: 10, value: 85, steps: 3, label: 'SD ruler' }, o || {});
    var W = 620, H = 120, X0 = 30, X1 = W - 30, Y = 50, lo = o.mean - o.steps * o.sd, hi = o.mean + o.steps * o.sd, val = o.value, self = emitter({});
    var wrap = el('div', 'nk-ruler'), svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.label, 'class': 'nk-svg' }); wrap.appendChild(svg);
    var X = function (v) { return X0 + (v - lo) / (hi - lo) * (X1 - X0); };
    sv('line', { x1: X0, x2: X1, y1: Y, y2: Y, 'class': 'nk-axis nk-bold' }, svg);
    for (var k = -o.steps; k <= o.steps; k++) {
      sv('line', { x1: X(o.mean + k * o.sd), x2: X(o.mean + k * o.sd), y1: Y - 10, y2: Y + 10, 'class': 'nk-axis nk-bold' }, svg);
      sv('text', { x: X(o.mean + k * o.sd), y: Y + 30, 'text-anchor': 'middle', 'class': 'nk-tick' }, svg).textContent = +(o.mean + k * o.sd).toFixed(2);
      sv('text', { x: X(o.mean + k * o.sd), y: Y + 48, 'text-anchor': 'middle', 'class': 'nk-tick nk-data' }, svg).textContent = k === 0 ? 'mean' : (k > 0 ? '+' : MINUS) + Math.abs(k) + ' SD';
    }
    var g = sv('g', { 'class': 'nk-marker', tabindex: 0, role: 'slider', 'aria-label': 'Value on the ruler', 'aria-valuemin': lo, 'aria-valuemax': hi }, svg);
    sv('line', { y1: 8, y2: Y, 'class': 'nk-mline' }, g); sv('circle', { r: 11, cy: 14, 'class': 'nk-mdot' }, g);
    var readout = el('p', 'nk-readout'); readout.setAttribute('aria-live', 'polite'); wrap.appendChild(readout);
    var stepV = o.sd / 2;
    function draw() { g.setAttribute('transform', 'translate(' + X(val) + ',0)'); g.setAttribute('aria-valuenow', val);
      var z = (val - o.mean) / o.sd; readout.textContent = 'Pretend data: mean ' + o.mean + ', SD ' + o.sd + '. A value of ' + +val.toFixed(2) + ' is ' + (z === 0 ? 'at the mean (z = 0).' : Math.abs(z).toFixed(2) + ' SD ' + (z > 0 ? 'above' : 'below') + ' the mean (z = ' + fmtZ(z) + ').'); self.emit('change', { value: val, z: z }); }
    draggable(svg, g, { toVal: function (x) { return lo + (x - X0) / (X1 - X0) * (hi - lo); }, set: function (v) { val = clamp(snap(v, stepV), lo, hi); draw(); }, get: function () { return val; }, step: function () { return stepV; }, min: function () { return lo; }, max: function () { return hi; } });
    self.el = wrap; self.setValue = function (v) { val = clamp(v, lo, hi); draw(); }; self.getValue = function () { return val; }; self.getZ = function () { return (val - o.mean) / o.sd; };
    host.appendChild(wrap); draw(); return self;
  };

  /* ---------- NK.dotplot ---------- */
  NK.dotplot = function (host, o) {
    o = Object.assign({ data: [2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 8, 9], unit: 'pretend values', step: 1, label: 'Dot plot' }, o || {});
    var data = o.data.slice().sort(function (a, b) { return a - b; }), n = data.length, lo = Math.min.apply(null, data) - 1, hi = Math.max.apply(null, data) + 1, mk = o.marker != null ? o.marker : data[Math.floor(n / 2)];
    var W = 620, H = 220, X0 = 30, X1 = W - 30, BASE = H - 36, R = 8, self = emitter({}), wrap = el('div', 'nk-dotplot'), svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.label, 'class': 'nk-svg' }); wrap.appendChild(svg);
    var X = function (v) { return X0 + (v - lo) / (hi - lo) * (X1 - X0); };
    sv('line', { x1: X0, x2: X1, y1: BASE, y2: BASE, 'class': 'nk-axis' }, svg);
    for (var v = Math.ceil(lo); v <= Math.floor(hi); v++) { sv('line', { x1: X(v), x2: X(v), y1: BASE, y2: BASE + 5, 'class': 'nk-axis' }, svg); sv('text', { x: X(v), y: BASE + 20, 'text-anchor': 'middle', 'class': 'nk-tick' }, svg).textContent = v; }
    var dots = [], stack = {}; data.forEach(function (d) { var s = stack[d] = (stack[d] || 0) + 1; dots.push({ v: d, c: sv('circle', { cx: X(d), cy: BASE - R - (s - 1) * (R * 2 + 1), r: R, 'class': 'nk-dot' }, svg) }); });
    var g = sv('g', { 'class': 'nk-marker', tabindex: 0, role: 'slider', 'aria-label': 'Marker', 'aria-valuemin': lo, 'aria-valuemax': hi }, svg);
    sv('line', { y1: 8, y2: BASE, 'class': 'nk-mline' }, g); sv('circle', { r: 11, cy: 14, 'class': 'nk-mdot' }, g);
    var readout = el('p', 'nk-readout'); readout.setAttribute('aria-live', 'polite'); wrap.appendChild(readout);
    function count() { return data.filter(function (d) { return d <= mk + 1e-9; }).length; }
    function draw() {
      g.setAttribute('transform', 'translate(' + X(mk) + ',0)'); g.setAttribute('aria-valuenow', mk);
      dots.forEach(function (d) { d.c.setAttribute('class', 'nk-dot' + (d.v <= mk + 1e-9 ? ' nk-low' : '')); });
      var c = count(); readout.textContent = c + ' of ' + n + ' dots are at or below ' + +mk.toFixed(2) + '. That is the ' + Math.round(c / n * 100) + 'th percentile. (' + o.unit + ')';
      self.emit('change', { marker: mk, below: c, n: n, percentile: c / n * 100 });
    }
    draggable(svg, g, { toVal: function (x) { return lo + (x - X0) / (X1 - X0) * (hi - lo); }, set: function (val) { mk = clamp(snap(val, o.step), lo, hi); draw(); }, get: function () { return mk; }, step: function () { return o.step; }, min: function () { return lo; }, max: function () { return hi; } });
    self.el = wrap; self.setMarker = function (v) { mk = clamp(v, lo, hi); draw(); }; self.count = count; self.n = n;
    host.appendChild(wrap); draw(); return self;
  };

  /* ---------- NK.hist ---------- */
  NK.hist = function (host, o) {
    o = Object.assign({ mean: 70, sd: 10, n: 240, label: 'Histogram that becomes a density curve' }, o || {});
    var data = []; for (var i = 0; i < o.n; i++) data.push(o.mean + o.sd * invCdf((i + 0.5) / o.n));   // a smooth pretend sample: the same every time
    var lo = o.mean - 4 * o.sd, hi = o.mean + 4 * o.sd, W = 620, H = 250, X0 = 30, X1 = W - 30, BASE = H - 36, TOP = 14, minW = o.sd / 4, maxW = o.sd * 2.5, bw = o.sd * 1.5, self = emitter({});
    var wrap = el('div', 'nk-hist'), svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.label, 'class': 'nk-svg' }); wrap.appendChild(svg);
    var X = function (v) { return X0 + (v - lo) / (hi - lo) * (X1 - X0); }, peak = pdf(0) / o.sd, Yd = function (d) { return BASE - d / (peak * 1.15) * (BASE - TOP); };
    var bars = sv('g', {}, svg), curve = sv('path', { 'class': 'nk-line', fill: 'none' }, svg), d = '';
    for (var v = lo; v <= hi + 1e-9; v += o.sd / 20) d += (d ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Yd(pdf((v - o.mean) / o.sd) / o.sd).toFixed(1); curve.setAttribute('d', d);
    sv('line', { x1: X0, x2: X1, y1: BASE, y2: BASE, 'class': 'nk-axis' }, svg);
    for (var k = -3; k <= 3; k++) sv('text', { x: X(o.mean + k * o.sd), y: BASE + 20, 'text-anchor': 'middle', 'class': 'nk-tick' }, svg).textContent = o.mean + k * o.sd;
    var row = el('div', 'nk-row'), lab = el('label', null, 'Bar width '), sl = el('input'), out = el('b'); sl.type = 'range'; sl.min = 0; sl.max = 100; sl.step = 1; sl.value = 70; lab.appendChild(sl); row.appendChild(lab); row.appendChild(out);
    var readout = el('p', 'nk-readout'); readout.setAttribute('aria-live', 'polite'); wrap.appendChild(row); wrap.appendChild(readout);
    function draw() {
      bw = minW + (maxW - minW) * (sl.value / 100); bars.textContent = '';
      var nb = Math.ceil((hi - lo) / bw), counts = new Array(nb).fill(0); data.forEach(function (x) { var b = Math.floor((x - lo) / bw); if (b >= 0 && b < nb) counts[b]++; });
      counts.forEach(function (c, b) { var dens = c / (o.n * bw), y = Yd(dens); sv('rect', { x: X(lo + b * bw) + 0.5, y: y, width: Math.max(1, X(lo + (b + 1) * bw) - X(lo + b * bw) - 1), height: BASE - y, 'class': 'nk-bar' }, bars); });
      curve.style.opacity = 0.25 + 0.75 * (1 - sl.value / 100);
      out.textContent = +bw.toFixed(2); readout.textContent = (sl.value < 25 ? 'Thin bars trace a smooth curve. That curve is the normal curve. ' : 'Wide bars hide the shape. ') + '(Pretend data: mean ' + o.mean + ', SD ' + o.sd + '; area is the share of data.)';
      self.emit('change', { binWidth: bw });
    }
    sl.oninput = draw; self.el = wrap; self.setWidth = function (frac) { sl.value = Math.round(frac * 100); draw(); }; self.getWidth = function () { return bw; };
    host.appendChild(wrap); draw(); return self;
  };

  /* ---------- NK.zTable ---------- */
  NK.zTable = function (host, o) {
    o = Object.assign({ mode: 'explore', height: 340 }, o || {});
    var self = emitter({}), mode = o.mode, task = null, stage = 1, found = null, cur = { id: 'p0', col: 0 }, locked = false;
    var wrap = el('div', 'nk-zt'), prompt = el('p', 'nk-zt-prompt'), fb = el('p', 'nk-zt-fb'), step2 = el('div', 'nk-zt-step2'), scroller = el('div', 'nk-zt-scroll'), tbl = el('table', 'nk-zt-table'), finger = el('span', 'nk-finger', '👆');
    fb.setAttribute('aria-live', 'polite'); step2.hidden = true; scroller.style.maxHeight = o.height + 'px'; tbl.setAttribute('role', 'grid'); tbl.setAttribute('aria-label', 'z-table: area to the left of z');
    var inp = el('input'), go = el('button', 'nk-btn', 'Check'), lab2 = el('label', null, 'Area to the right: '); inp.type = 'text'; inp.inputMode = 'decimal'; inp.setAttribute('aria-label', 'Area'); go.type = 'button'; lab2.appendChild(inp); step2.appendChild(lab2); step2.appendChild(go);
    var thead = el('thead'), hr = el('tr'), corner = el('th', null, 'z'); corner.scope = 'col'; hr.appendChild(corner);
    for (var c = 0; c < 10; c++) { var th = el('th', 'nk-ch', '.0' + c); th.scope = 'col'; hr.appendChild(th); }
    thead.appendChild(hr); tbl.appendChild(thead);
    var tbody = el('tbody'), tds = {}, rowEls = {}, colEls = [[], [], [], [], [], [], [], [], [], []];
    ROWS.forEach(function (r) {
      var tr = el('tr', r.id === 'n0' ? 'nk-sep' : ''), h = el('th', 'nk-rh', r.label); h.scope = 'row'; tr.appendChild(h); rowEls[r.id] = [h]; tds[r.id] = [];
      for (var c = 0; c < 10; c++) { var td = el('td', null, fmtCell(cell(r, c))); td.setAttribute('role', 'gridcell'); td.dataset.r = r.id; td.dataset.c = c; td.tabIndex = -1; td.setAttribute('aria-label', 'z ' + fmtZ(zOf(r, c)) + ', area ' + fmtA(cell(r, c))); tr.appendChild(td); tds[r.id].push(td); rowEls[r.id].push(td); colEls[c].push(td); }
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody); scroller.appendChild(tbl); scroller.appendChild(finger);
    wrap.appendChild(prompt); wrap.appendChild(scroller); wrap.appendChild(step2); wrap.appendChild(fb);
    var hot = null, hotCol = null;
    function point(id, c) {
      cur = { id: id, col: c };
      if (hot) hot.forEach(function (x) { x.classList.remove('nk-hot'); }); if (hotCol) hotCol.forEach(function (x) { x.classList.remove('nk-hot'); });
      hot = rowEls[id].concat([]); hotCol = colEls[c].concat(Array.prototype.slice.call(hr.children, c + 1, c + 2));
      hot.forEach(function (x) { x.classList.add('nk-hot'); }); hotCol.forEach(function (x) { x.classList.add('nk-hot'); });
      var td = tds[id][c]; finger.style.left = (td.offsetLeft + td.offsetWidth * 0.55) + 'px'; finger.style.top = (td.offsetTop + td.offsetHeight * 0.35) + 'px'; finger.hidden = false;
      return td;
    }
    function mark(td, cls) { td.classList.add(cls); }
    function clearMarks() { Array.prototype.forEach.call(tbody.querySelectorAll('.nk-ok,.nk-bad'), function (x) { x.classList.remove('nk-ok', 'nk-bad'); }); }
    function say(r, bad) { fb.textContent = r.msg; fb.className = 'nk-zt-fb ' + (r.ok ? 'nk-good' : 'nk-warn'); }
    function pick(id, c) {
      var td = point(id, c), r, click = { id: id, col: c }, row = ROWBY[id];
      if (mode === 'explore' || !task) { fb.textContent = 'z = ' + fmtZ(zOf(row, c)) + ' → area to the left = ' + fmtA(cell(row, c)) + ' (about ' + (cell(row, c) * 100).toFixed(2) + '%).'; fb.className = 'nk-zt-fb'; self.emit('pick', { z: zOf(row, c), area: cell(row, c) }); return; }
      if (locked) return;
      clearMarks();
      if (mode === 'inverse') r = NK.diagnoseInverse(task, click); else r = NK.diagnoseLookup(task, click);
      mark(td, r.ok ? 'nk-ok' : 'nk-bad'); say(r);
      if (r.ok && r.kind === 'subtract') { found = r.value; stage = 2; step2.hidden = false; inp.value = ''; inp.focus(); }
      else if (r.ok) { locked = true; step2.hidden = true; }
      self.emit('result', Object.assign({ stage: 1, click: click, task: task }, r)); if (o.onResult) o.onResult(Object.assign({ stage: 1, click: click }, r));
    }
    go.onclick = function () {
      var v = parseFloat(inp.value); if (isNaN(v)) { fb.textContent = 'Type a number like 0.1093.'; fb.className = 'nk-zt-fb nk-warn'; return; }
      var r = NK.diagnoseFinal(found, v, task.want); say(r); if (r.ok) { locked = true; step2.hidden = true; }
      self.emit('result', Object.assign({ stage: 2, task: task }, r)); if (o.onResult) o.onResult(Object.assign({ stage: 2 }, r));
    };
    inp.onkeydown = function (ev) { if (ev.key === 'Enter') go.onclick(); };
    tbody.addEventListener('mouseover', function (ev) { var t = ev.target.closest && ev.target.closest('td'); if (t && !locked) point(t.dataset.r, +t.dataset.c); });
    tbody.addEventListener('click', function (ev) { var t = ev.target.closest && ev.target.closest('td'); if (t) pick(t.dataset.r, +t.dataset.c); });
    tbody.addEventListener('keydown', function (ev) {
      var t = ev.target.closest && ev.target.closest('td'); if (!t) return;
      var i = ROWS.findIndex(function (r) { return r.id === t.dataset.r; }), c = +t.dataset.c, d = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[ev.key];
      if (d) { i = clamp(i + d[0], 0, ROWS.length - 1); c = clamp(c + d[1], 0, 9); var nt = point(ROWS[i].id, c); nt.focus(); ev.preventDefault(); }
      else if (ev.key === 'Enter' || ev.key === ' ') { pick(t.dataset.r, c); ev.preventDefault(); }
    });
    tbody.addEventListener('focusin', function (ev) { var t = ev.target; if (t.tagName === 'TD') point(t.dataset.r, +t.dataset.c); });
    tds.p0[0].tabIndex = 0; tbody.addEventListener('focusin', function () { tds.p0[0].tabIndex = -1; }, { once: true });
    function promptText() {
      if (mode === 'explore' || !task) return o.prompt || 'Click a cell to see its z and its area to the left.';
      if (task.prompt) return task.prompt;
      return mode === 'inverse' ? 'Find z for an area of ' + fmtA(task.p) + ' to the ' + (task.want || 'left') + '. Click the closest cell.' : 'Find the area to the ' + (task.want || 'left') + ' of z = ' + fmtZ(task.z) + '. Click the cell.';
    }
    self.ask = function (t) { task = t; mode = t.mode || (t.p != null ? 'inverse' : 'lookup'); stage = 1; found = null; locked = false; step2.hidden = true; lab2.firstChild.textContent = 'Area to the ' + (t.want || 'left') + ': '; clearMarks(); fb.textContent = ''; fb.className = 'nk-zt-fb'; prompt.textContent = promptText(); self.emit('ask', t); };
    self.explore = function () { task = null; mode = 'explore'; locked = false; step2.hidden = true; clearMarks(); prompt.textContent = promptText(); };
    self.pick = pick; self.cursor = function () { return cur; }; self.el = wrap; self.destroy = function () { wrap.remove(); };
    self.scrollToZ = function (z) { var l = locate(z), td = tds[l.id][l.col]; scroller.scrollTop = Math.max(0, td.offsetTop - scroller.clientHeight / 2); };
    prompt.textContent = promptText(); finger.hidden = true;
    host.appendChild(wrap); if (o.task) self.ask(o.task); return self;
  };

  /* ---------- NK.tiles ---------- */
  /* opts: { tiles:[{id,label}], slots:[{id,label,answer,hint}], hintAfter:2, onDrop(info), onComplete(info), prompt }
     A slot with `answer` (a tile id, or an array of ids) only keeps the right tile: a miss shakes and the tile goes home. A slot without `answer` keeps anything. */
  NK.tiles = function (host, o) {
    o = Object.assign({ hintAfter: 2 }, o || {});
    var self = emitter({}), wrap = el('div', 'nk-tiles'), slotsEl = el('div', 'nk-slots'), bank = el('div', 'nk-bank'), live = el('p', 'nk-live nk-sr'), hintEl = el('p', 'nk-hint');
    live.setAttribute('aria-live', 'assertive'); hintEl.setAttribute('aria-live', 'polite');
    var tileEls = {}, slotEls = {}, place = {}, miss = {}, held = null, cursor = 0, done = false;
    function ok(s, id) { var a = s.answer; return a == null ? true : Array.isArray(a) ? a.indexOf(id) >= 0 : a === id; }
    (o.slots || []).forEach(function (s, i) {
      var d = el('div', 'nk-slot'), l = el('span', 'nk-slabel', s.label || ''), z = el('span', 'nk-zone'); d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-label', 'Slot ' + (i + 1) + ': ' + (s.label || '') + ', empty'); d.dataset.slot = s.id;
      d.appendChild(l); d.appendChild(z); slotsEl.appendChild(d); slotEls[s.id] = { el: d, zone: z, i: i, s: s }; miss[s.id] = 0;
    });
    (o.tiles || []).forEach(function (t) {
      var d = el('div', 'nk-tile'); if (t.html) d.innerHTML = t.html; else d.textContent = t.label; d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-pressed', 'false'); d.dataset.tile = t.id; d.style.touchAction = 'none';
      d.setAttribute('aria-label', 'Tile: ' + (t.label || t.id)); tileEls[t.id] = { el: d, t: t }; bank.appendChild(d); bindTile(d, t);
    });
    wrap.appendChild(slotsEl); wrap.appendChild(bank); wrap.appendChild(hintEl); wrap.appendChild(live);
    function tell(msg) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 10); }
    function slotList() { return (o.slots || []).map(function (s) { return slotEls[s.id]; }); }
    function setHeld(id) {
      if (held) { tileEls[held].el.classList.remove('nk-held'); tileEls[held].el.setAttribute('aria-pressed', 'false'); }
      held = id; slotList().forEach(function (s) { s.el.classList.remove('nk-target'); });
      if (id) { var e = tileEls[id].el; e.classList.add('nk-held'); e.setAttribute('aria-pressed', 'true'); var list = slotList(), j = list.findIndex(function (s) { return !place[s.s.id]; }); cursor = j < 0 ? 0 : j; markCursor(); tell('Picked up ' + (tileEls[id].t.label || id) + '. Arrow keys choose a slot. Enter drops. Escape cancels.'); }
    }
    function markCursor() { slotList().forEach(function (s, i) { s.el.classList.toggle('nk-target', held && i === cursor); }); }
    function shake(e) { e.classList.remove('nk-shake'); void e.offsetWidth; e.classList.add('nk-shake'); }
    function home(id) { var e = tileEls[id].el; e.style.transform = ''; e.style.position = ''; e.style.zIndex = ''; e.style.left = e.style.top = ''; e.classList.remove('nk-drag', 'nk-placed'); bank.appendChild(e); }
    function unplace(sid) { var id = place[sid]; if (!id) return; delete place[sid]; slotEls[sid].el.classList.remove('nk-full'); slotEls[sid].el.setAttribute('aria-label', 'Slot ' + (slotEls[sid].i + 1) + ': ' + (slotEls[sid].s.label || '') + ', empty'); home(id); }
    function drop(id, sid) {
      var S = slotEls[sid], tile = tileEls[id]; if (!S || !tile || done) return;
      if (place[sid]) { if (S.s.answer != null) { shake(S.el); tell('That slot is already right.'); setHeld(null); return; } unplace(sid); }
      Object.keys(place).forEach(function (k) { if (place[k] === id) unplace(k); });
      if (!ok(S.s, id)) {
        miss[sid]++; shake(tile.el); home(id); setHeld(null);
        var msg = 'Not that one. Try again.'; if (miss[sid] >= o.hintAfter) { msg = 'Hint: ' + (S.s.hint || 'Look at the picture again.'); S.el.classList.add('nk-hinted'); }
        hintEl.textContent = msg; tell(msg); self.emit('miss', { tile: id, slot: sid, misses: miss[sid] }); if (o.onDrop) o.onDrop({ tile: id, slot: sid, ok: false, misses: miss[sid] }); return;
      }
      place[sid] = id; S.zone.appendChild(tile.el); tile.el.style.transform = ''; tile.el.style.position = ''; tile.el.classList.add('nk-placed'); tile.el.classList.remove('nk-held', 'nk-drag'); tile.el.setAttribute('aria-pressed', 'false');
      S.el.classList.add('nk-full'); S.el.classList.remove('nk-hinted', 'nk-target'); S.el.setAttribute('aria-label', 'Slot ' + (S.i + 1) + ': ' + (S.s.label || '') + ', holds ' + (tile.t.label || id)); hintEl.textContent = '';
      held = null; tell((tile.t.label || id) + ' placed in ' + (S.s.label || 'slot ' + (S.i + 1)) + '.'); slotList().forEach(function (s) { s.el.classList.remove('nk-target'); });
      self.emit('drop', { tile: id, slot: sid }); if (o.onDrop) o.onDrop({ tile: id, slot: sid, ok: true });
      if ((o.slots || []).every(function (s) { return place[s.id]; })) { done = true; wrap.classList.add('nk-complete'); tell('All slots filled.'); self.emit('complete', self.state()); if (o.onComplete) o.onComplete(self.state()); }
    }
    function bindTile(d, t) {
      var sx = 0, sy = 0, moved = false, down = false, ox = 0, oy = 0;
      d.addEventListener('pointerdown', function (ev) {
        if (done) return; down = true; moved = false; sx = ev.clientX; sy = ev.clientY; d.setPointerCapture(ev.pointerId);
        var r = d.getBoundingClientRect(); ox = ev.clientX - r.left; oy = ev.clientY - r.top;
      });
      d.addEventListener('pointermove', function (ev) {
        if (!down) return; var dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 6) return;
        if (!moved) { moved = true; setHeld(null); d.classList.add('nk-drag'); }
        d.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; d.style.zIndex = 50;
        d.style.pointerEvents = 'none'; var under = document.elementFromPoint(ev.clientX, ev.clientY); d.style.pointerEvents = ''; var s = under && under.closest && under.closest('.nk-slot');
        slotList().forEach(function (x) { x.el.classList.toggle('nk-over', !!s && x.el === s); });
      });
      d.addEventListener('pointerup', function (ev) {
        if (!down) return; down = false; slotList().forEach(function (x) { x.el.classList.remove('nk-over'); });
        if (!moved) { // a tap: pick up, or put down
          var from = Object.keys(place).filter(function (k) { return place[k] === t.id; })[0];
          if (from && slotEls[from].s.answer == null) { unplace(from); setHeld(t.id); return; }
          if (from) return; setHeld(held === t.id ? null : t.id); return; }
        d.style.pointerEvents = 'none'; var under = document.elementFromPoint(ev.clientX, ev.clientY); d.style.pointerEvents = ''; var s = under && under.closest && under.closest('.nk-slot');
        d.classList.remove('nk-drag'); d.style.transform = ''; d.style.zIndex = '';
        if (s) drop(t.id, s.dataset.slot);
      });
      d.addEventListener('pointercancel', function () { down = false; d.classList.remove('nk-drag'); d.style.transform = ''; });
      d.addEventListener('keydown', function (ev) {
        if (done) return; var list = slotList();
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); if (held === t.id) { if (list[cursor]) drop(t.id, list[cursor].s.id); } else setHeld(t.id); }
        else if (held === t.id && /^Arrow/.test(ev.key)) { ev.preventDefault(); cursor = (cursor + (/Left|Up/.test(ev.key) ? -1 : 1) + list.length) % list.length; markCursor(); tell('Slot ' + (cursor + 1) + ' of ' + list.length + ': ' + (list[cursor].s.label || '') + (place[list[cursor].s.id] ? ', full' : ', empty')); }
        else if (ev.key === 'Escape' && held) { setHeld(null); tell('Cancelled.'); }
      });
    }
    slotList().forEach(function (S) {
      S.el.addEventListener('click', function () { if (held) { drop(held, S.s.id); } });
      S.el.addEventListener('keydown', function (ev) { if ((ev.key === 'Enter' || ev.key === ' ') && held) { ev.preventDefault(); drop(held, S.s.id); } });
    });
    self.state = function () { return { placed: Object.assign({}, place), misses: Object.assign({}, miss), done: done }; };
    self.reset = function () { Object.keys(place).forEach(unplace); Object.keys(miss).forEach(function (k) { miss[k] = 0; }); done = false; wrap.classList.remove('nk-complete'); setHeld(null); hintEl.textContent = ''; };
    self.drop = drop; self.el = wrap; self.destroy = function () { wrap.remove(); };
    host.appendChild(wrap); return self;
  };

  /* ---------- NK.routine ---------- */
  NK.routine = {
    moves: [
      { id: 'picture', name: 'Picture', say: 'Sketch the curve. Shade the part the question asks for.' },
      { id: 'z', name: 'z', say: 'Find z. Subtract the mean, then divide by the SD.' },
      { id: 'row', name: 'Row', say: 'Find the row: the whole number and the first decimal of z.' },
      { id: 'col', name: 'Column', say: 'Find the column: the second decimal of z.' },
      { id: 'area', name: 'Area', say: 'Read the cell. It is the area to the LEFT. For the right, subtract from 1.' },
      { id: 'sentence', name: 'Sentence', say: 'Say it in words: "About __% of ___ are ___."' }
    ],
    render: function (host, o) {
      o = o || {}; var card = el('ol', 'nk-routine'); card.setAttribute('aria-label', 'The routine: six moves');
      NK.routine.moves.forEach(function (m, i) {
        var li = el('li', (o.active === i || o.active === m.id ? 'nk-active ' : '') + (o.done && o.done.indexOf(m.id) >= 0 ? 'nk-done' : ''));
        var b = el('b', null, m.name); li.appendChild(b); li.appendChild(el('span', null, ' ' + m.say)); card.appendChild(li);
      });
      if (host) host.appendChild(card); return card;
    }
  };
  /* the worked example: pretend quiz, percent below 85 and above 85. Every number is computed. */
  NK.workedExample = function () {
    var mean = 70, sd = 10, x = 85, z = (x - mean) / sd, loc = locate(z), row = ROWBY[loc.id], a = cell(row, loc.col), right = round4(1 - a);
    return { mean: mean, sd: sd, x: x, z: z, row: row.label, col: '.0' + loc.col, area: a, right: right,
      steps: [
        ['Picture', 'Pretend quiz: mean ' + mean + ', SD ' + sd + '. What percent scored below ' + x + '? Shade the left of ' + x + '.'],
        ['z', 'z = (' + x + ' − ' + mean + ') / ' + sd + ' = ' + z.toFixed(2)],
        ['Row', 'z = ' + z.toFixed(2) + ' → row ' + row.label],
        ['Column', 'second decimal ' + (loc.col === 0 ? '0' : loc.col) + ' → column .0' + loc.col],
        ['Area', 'Where they cross: ' + fmtA(a) + '. That is the area to the left.'],
        ['Sentence', 'About ' + (a * 100).toFixed(2) + '% of pretend scores are below ' + x + '. (Above ' + x + ': 1 − ' + fmtA(a) + ' = ' + fmtA(right) + ', about ' + (right * 100).toFixed(2) + '%.)']
      ] };
  };
  NK.example = function (host) {
    var w = NK.workedExample(), box = el('div', 'nk-example'), ol = el('ol');
    w.steps.forEach(function (s) { var li = el('li'); li.appendChild(el('b', null, s[0] + ': ')); li.appendChild(document.createTextNode(s[1])); ol.appendChild(li); });
    box.appendChild(ol); if (host) host.appendChild(box); return box;
  };
  NK.conceptTabs = function () {
    return [
      { title: 'z-table', build: function (box) { box.appendChild(el('p', 'nk-small', 'Area to the left of z. Row: whole number and first decimal. Column: second decimal.')); NK.zTable(box, { mode: 'explore', height: 360 }); } },
      { title: 'Routine', build: function (box) { NK.routine.render(box); } },
      { title: 'Example', build: function (box) { NK.example(box); } }
    ];
  };

  root.NK = NK; if (typeof module !== 'undefined' && module.exports) module.exports = NK;
})(typeof window !== 'undefined' ? window : globalThis);
