/* Scenes for the visual tutorials (calculus/shared/vtut.js). Each scene draws one picture into a figure host and may add one or two sliders.
   Signature: VT.scenes.name(fig, st, api): st is the frame's parameter object. Every picture is drawn in code, with an aria-label.
   Related rates: balloon (sphere or disk), ladder, cars, cone, cylinder, shadow, formulas, chain, chaingraph.
   Linear approximation: zoom, approx.  Limits: ratio, growth, forms. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, XK = window.XK, VT = window.VT, S = XK.sv, fm = XK.fm;
  var C = { blue: XK.BLUE, red: XK.RED, green: XK.GREEN, orange: XK.ORANGE, ink: XK.INK, grey: '#7a8a99', pale: '#d5dde5', wood: '#8a5a2b', water: '#bcd7ff', puddle: '#cfe0ff' };

  function mk(fig, label, w, h) { var svg = S('svg', { viewBox: '0 0 ' + (w || 420) + ' ' + (h || 300), role: 'img', 'aria-label': label, style: 'width:100%;max-width:' + (w || 420) * 1.25 + 'px;background:var(--stage);border:1px solid var(--line);border-radius:8px;display:block' }); fig.appendChild(svg); return svg; }
  function T(svg, x, y, s, o) { o = o || {}; var t = S('text', { x: x, y: y, 'font-size': o.size || 14, 'font-weight': o.bold ? 700 : 400, fill: o.fill || C.ink, 'text-anchor': o.anchor || 'start' }, svg); t.textContent = s; return t; }
  function Ln(svg, x1, y1, x2, y2, col, w, dash) { var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col || C.ink, 'stroke-width': w || 2, 'stroke-linecap': 'round' }; if (dash) a['stroke-dasharray'] = dash; return S('line', a, svg); }
  function arrow(svg, x1, y1, x2, y2, col, w) {
    var a = Math.atan2(y2 - y1, x2 - x1), h = 10; Ln(svg, x1, y1, x2 - Math.cos(a) * 4, y2 - Math.sin(a) * 4, col, w || 3);
    S('polygon', { points: [x2, y2, x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45), x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)].join(' '), fill: col || C.ink }, svg);
  }
  function slider(fig, label, min, max, step, val, fn) { var row = el('div', 'row'); fig.appendChild(row); return XK.slider(row, label, min, max, step, val, fn); }
  function readout(fig) { var p = el('p', 'qtext vt-read'); fig.appendChild(p); return p; }
  function table(fig, head, rows, cls) {
    var t = el('table', 'vt-tbl' + (cls ? ' ' + cls : '')), tr = el('tr'); head.forEach(function (h) { tr.appendChild(el('th', null, h)); }); t.appendChild(tr);
    var trs = rows.map(function (r) { var x = el('tr'); r.forEach(function (c, i) { x.appendChild(el(i === 0 ? 'th' : 'td', null, String(c))); }); t.appendChild(x); return x; });
    fig.appendChild(t); return trs;
  }
  var big = function (v) { return Math.abs(v) >= 1e6 ? v.toExponential(2).replace('e+', ' × 10^') : fm(v, Math.abs(v) < 10 ? 3 : 2); };

  /* ---------------------------------------------------------------- balloon: a sphere (V) or a disk (A) whose radius r grows */
  VT.scenes.balloon = function (fig, st) {
    var disk = st.kind === 'disk', unit = st.unit || (disk ? 'ft' : 'cm'), r = st.r != null ? st.r : 3, cx = 150, cy = 150, kk = st.k || 20, off = st.k ? 4 : 22;
    var svg = mk(fig, disk ? 'A circular puddle seen from above with its radius r drawn from the center to the edge' : 'A round balloon with its radius r drawn from the center to the surface');
    var shape = S('circle', { cx: cx, cy: cy, r: 60, fill: disk ? C.puddle : '#ffe0d2', stroke: disk ? C.blue : C.red, 'stroke-width': 3 }, svg), rad = Ln(svg, cx, cy, cx + 60, cy, C.ink, 3);
    S('circle', { cx: cx, cy: cy, r: 4, fill: C.ink }, svg); var rl = T(svg, cx + 30, cy - 8, 'r', { size: 20, bold: true, anchor: 'middle' });
    if (!disk) { S('path', { d: 'M150 232 q-8 20 6 34 q8 10 -2 24', fill: 'none', stroke: C.grey, 'stroke-width': 2 }, svg); }
    T(svg, 300, 54, 'r = radius', { bold: true, size: 15 }); T(svg, 300, 80, disk ? 'A = area' : 'V = volume', { bold: true, size: 15, fill: C.orange });
    if (st.rates) T(svg, 300, 112, st.deflate ? 'dr/dt < 0' : 'dr/dt > 0', { size: 14, fill: C.red, bold: true });
    var ang = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4], gs = [];
    if (st.rates) ang.forEach(function () { var g = S('g', {}, svg); gs.push(g); });
    var out = readout(fig), tbl = null;
    function upd(v) {
      r = +v; var px = off + r * kk; shape.setAttribute('r', px); rad.setAttribute('x2', cx + px); rl.setAttribute('x', cx + px / 2);
      if (st.rates) gs.forEach(function (g, i) { g.textContent = ''; var a = ang[i], r0 = px + (st.deflate ? 34 : 6), r1 = px + (st.deflate ? 8 : 34); arrow(g, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, C.red, 3); });
      out.textContent = disk ? 'r = ' + fm(r, 1) + ' ' + unit + '   →   A = πr² = ' + fm(Math.PI * r * r, 1) + ' ' + unit + '²' : 'r = ' + fm(r, 1) + ' ' + unit + '   →   V = (4/3)πr³ = ' + fm(4 / 3 * Math.PI * r * r * r, 1) + ' ' + unit + '³';
      if (tbl) tbl.forEach(function (tr, i) { tr.classList.toggle('on', st.table[i] === r); });
    }
    if (st.table) tbl = table(fig, ['r (' + unit + ')', disk ? 'A (' + unit + '²)' : 'V (' + unit + '³)'], st.table.map(function (x) { return [x, fm(disk ? Math.PI * x * x : 4 / 3 * Math.PI * x * x * x, 1)]; }));
    if (!st.fixed) { var sl = slider(fig, 'Radius r (' + unit + ')', 1, 5, st.table ? 1 : 0.5, r, function () { upd(sl.value); }); }
    upd(r);
  };

  /* ---------------------------------------------------------------- ladder against a wall */
  VT.scenes.ladder = function (fig, st) {
    var L = st.L || 5, x = st.x != null ? st.x : 3, u = st.unit || 'ft', x0 = 100, y0 = 250, sc = 200 / L, lab = st.lab || {};
    var svg = mk(fig, 'A ladder leaning against a wall. The foot is x on the floor, the top is y up the wall, and the ladder is L long.');
    S('rect', { x: x0 - 8, y: 30, width: 8, height: 220, fill: C.pale }, svg); Ln(svg, x0 - 8, y0, 410, y0, C.grey, 4);
    S('path', { d: 'M' + x0 + ' ' + (y0 - 16) + ' L' + (x0 + 16) + ' ' + (y0 - 16) + ' L' + (x0 + 16) + ' ' + y0, fill: 'none', stroke: C.grey, 'stroke-width': 1.5 }, svg);
    var lad = Ln(svg, 0, 0, 0, 0, C.wood, 7), d1 = S('circle', { r: 5, fill: C.ink }, svg), d2 = S('circle', { r: 5, fill: C.ink }, svg);
    var tx = T(svg, 0, 0, '', { size: 18, bold: true, anchor: 'middle', fill: C.blue }), ty = T(svg, x0 - 14, 0, '', { size: 18, bold: true, anchor: 'end', fill: C.green }), tl = T(svg, 0, 0, '', { size: 16, bold: true, anchor: 'middle' });
    var gR = S('g', {}, svg), out = readout(fig);
    function upd(v) {
      x = +v; var y = Math.sqrt(Math.max(0, L * L - x * x)), fx = x0 + x * sc, top = y0 - y * sc;
      lad.setAttribute('x1', fx); lad.setAttribute('y1', y0); lad.setAttribute('x2', x0); lad.setAttribute('y2', top);
      d1.setAttribute('cx', fx); d1.setAttribute('cy', y0); d2.setAttribute('cx', x0); d2.setAttribute('cy', top);
      tx.setAttribute('x', (x0 + fx) / 2); tx.setAttribute('y', y0 + 24); tx.textContent = lab.x || 'x';
      ty.setAttribute('y', (y0 + top) / 2 + 6); ty.textContent = lab.y || 'y';
      var nx = (y0 - top), ny = (x0 - fx), nn = Math.sqrt(nx * nx + ny * ny) || 1; tl.setAttribute('x', (fx + x0) / 2 + (lab.L && lab.L.length > 3 ? 40 : 18) * nx / nn); tl.setAttribute('y', (y0 + top) / 2 + (lab.L && lab.L.length > 3 ? 40 : 18) * ny / nn + 5); tl.textContent = lab.L || 'L';
      gR.textContent = ''; if (st.rates) { arrow(gR, fx + 10, y0 - 14, fx + 52, y0 - 14, C.red, 3); T(gR, fx + 31, y0 - 22, 'dx/dt', { size: 13, fill: C.red, bold: true, anchor: 'middle' }); arrow(gR, x0 - 48, top, x0 - 48, top + 38, C.red, 3); T(gR, x0 - 54, top + 24, 'dy/dt', { size: 13, fill: C.red, bold: true, anchor: 'end' }); }
      out.textContent = st.snap ? (st.say || '') : 'x = ' + fm(x, 1) + ' ' + u + '   ·   y = ' + fm(y, 1) + ' ' + u + '   ·   L = ' + L + ' ' + u + ' (it never changes)';
    }
    if (!st.snap) { var sl = slider(fig, 'Foot distance x (' + u + ')', fm(L * 0.2, 1), fm(L * 0.96, 1), 0.1, x, function () { upd(sl.value); }); }
    upd(x);
  };

  /* ---------------------------------------------------------------- two cars leaving a corner, one east and one north */
  VT.scenes.cars = function (fig, st) {
    var a = st.a || 30, b = st.b || 40, t = st.t || 1, ox = 60, oy = 250, sc = 2.6;
    var svg = mk(fig, 'Two cars leave the same corner. One drives east, the other north. The straight-line distance between them is z.');
    Ln(svg, ox - 20, oy, 410, oy, C.pale, 14); Ln(svg, ox, oy + 20, ox, 20, C.pale, 14); S('circle', { cx: ox, cy: oy, r: 4, fill: C.grey }, svg);
    var hyp = Ln(svg, 0, 0, 0, 0, C.red, 2.5, '7 5'), carA = S('rect', { width: 26, height: 14, rx: 4, fill: C.blue }, svg), carB = S('rect', { width: 14, height: 26, rx: 4, fill: C.orange }, svg);
    var tx = T(svg, 0, 0, 'x', { size: 17, bold: true, anchor: 'middle', fill: C.blue }), ty = T(svg, 0, 0, 'y', { size: 17, bold: true, anchor: 'end', fill: C.orange }), tz = T(svg, 0, 0, 'z', { size: 18, bold: true, anchor: 'middle', fill: C.red }), g = S('g', {}, svg), out = readout(fig);
    function upd(v) {
      t = +v; var x = a * t, y = b * t, z = Math.sqrt(x * x + y * y), px = ox + x * sc, py = oy - y * sc;
      carA.setAttribute('x', px - 13); carA.setAttribute('y', oy - 7); carB.setAttribute('x', ox - 7); carB.setAttribute('y', py - 13);
      hyp.setAttribute('x1', px); hyp.setAttribute('y1', oy); hyp.setAttribute('x2', ox); hyp.setAttribute('y2', py);
      tx.setAttribute('x', (ox + px) / 2); tx.setAttribute('y', oy + 30); ty.setAttribute('x', ox - 14); ty.setAttribute('y', (oy + py) / 2 + 6); tz.setAttribute('x', (px + ox) / 2 + 16); tz.setAttribute('y', (oy + py) / 2 - 6);
      g.textContent = ''; if (st.rates) { arrow(g, px + 16, oy - 22, px + 58, oy - 22, C.blue, 3); T(g, px + 37, oy - 30, 'dx/dt', { size: 13, fill: C.blue, bold: true, anchor: 'middle' }); arrow(g, ox + 22, py - 16, ox + 22, py - 56, C.orange, 3); T(g, ox + 30, py - 38, 'dy/dt', { size: 13, fill: C.orange, bold: true }); }
      out.textContent = 'after ' + fm(t, 1) + ' h:   x = ' + fm(x, 0) + ' mi   ·   y = ' + fm(y, 0) + ' mi   ·   z = ' + fm(z, 1) + ' mi';
    }
    var sl = slider(fig, 'Time (hours)', 0.5, 2, 0.1, t, function () { upd(sl.value); }); upd(t);
  };

  /* ---------------------------------------------------------------- a cone-shaped tank (point down) filling with water */
  VT.scenes.cone = function (fig, st) {
    var R = st.R || 4, H = st.H || 8, h = st.h != null ? st.h : 4, sc = 26, ax = 150, ay = 270, u = st.unit || 'ft';
    var svg = mk(fig, 'A cone-shaped tank, point down, partly full of water. The water surface has radius r and the water is h deep.');
    var water = S('polygon', { fill: C.water, stroke: 'none' }, svg);
    S('polygon', { points: [ax, ay, ax - R * sc, ay - H * sc, ax + R * sc, ay - H * sc].join(' '), fill: 'none', stroke: C.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
    var surf = Ln(svg, 0, 0, 0, 0, C.blue, 3), rr = Ln(svg, 0, 0, 0, 0, C.green, 3), dh = Ln(svg, 0, 0, 0, 0, C.red, 3), tr = T(svg, 0, 0, 'r', { size: 18, bold: true, fill: C.green, anchor: 'middle' }), th = T(svg, 0, 0, 'h', { size: 18, bold: true, fill: C.red });
    T(svg, 412, 78, 'whole tank (never changes)', { size: 12, fill: C.grey, anchor: 'end' }); T(svg, 412, 98, 'radius ' + R + ' ' + u + ', height ' + H + ' ' + u, { size: 14, bold: true, anchor: 'end' });
    var out = readout(fig);
    function upd(v) {
      h = +v; var r = h / H * R, yh = ay - h * sc;
      water.setAttribute('points', [ax, ay, ax - r * sc, yh, ax + r * sc, yh].join(' ')); surf.setAttribute('x1', ax - r * sc); surf.setAttribute('x2', ax + r * sc); surf.setAttribute('y1', yh); surf.setAttribute('y2', yh);
      rr.setAttribute('x1', ax); rr.setAttribute('y1', yh); rr.setAttribute('x2', ax + r * sc); rr.setAttribute('y2', yh); tr.setAttribute('x', ax + r * sc / 2); tr.setAttribute('y', yh - 8);
      dh.setAttribute('x1', ax - 14); dh.setAttribute('y1', ay); dh.setAttribute('x2', ax - 14); dh.setAttribute('y2', yh); th.setAttribute('x', ax - 34); th.setAttribute('y', (ay + yh) / 2 + 6);
      out.textContent = 'h = ' + fm(h, 1) + ' ' + u + '   →   r = ' + fm(r, 2) + ' ' + u + (st.v ? '   ·   V = ⅓πr²h = ' + fm(Math.PI * r * r * h / 3, 1) + ' ' + u + '³' : '') + '   (r is always h ÷ ' + fm(H / R, 0) + ')';
    }
    if (!st.fixed) { var sl = slider(fig, 'Water depth h (' + u + ')', 0.5, H - 0.5, 0.5, h, function () { upd(sl.value); }); }
    upd(h);
  };

  /* ---------------------------------------------------------------- a cylinder tank: the radius is fixed, only the depth changes */
  VT.scenes.cylinder = function (fig, st) {
    var R = st.R || 3, h = st.h != null ? st.h : 5, u = st.unit || 'm', x0 = 110, w = 120, y0 = 262, hs = 20;
    var svg = mk(fig, 'A cylinder-shaped tank with a fixed radius R. The water depth h is the only thing that changes.');
    var water = S('rect', { x: x0, width: w, fill: C.water }, svg); S('path', { d: 'M' + x0 + ' 50 V' + y0 + ' H' + (x0 + w) + ' V50', fill: 'none', stroke: C.ink, 'stroke-width': 3 }, svg);
    Ln(svg, x0, 38, x0 + w, 38, C.green, 3); T(svg, x0 + w / 2, 30, 'R = ' + R + ' ' + u + ' (never changes)', { size: 13, bold: true, fill: C.green, anchor: 'middle' });
    var dh = Ln(svg, 0, 0, 0, 0, C.red, 3), th = T(svg, 0, 0, 'h', { size: 18, bold: true, fill: C.red });
    if (st.flow) { var inn = st.flow === 'in'; arrow(svg, x0 + w + 40, inn ? 44 : 86, x0 + w + 40, inn ? 86 : 44, C.blue, 4); T(svg, x0 + w + 52, 70, inn ? 'water in' : 'water out', { size: 14, bold: true, fill: C.blue }); T(svg, x0 + w + 52, 90, inn ? 'dV/dt > 0' : 'dV/dt < 0', { size: 14, bold: true, fill: C.red }); }
    var out = readout(fig);
    function upd(v) { h = +v; var top = y0 - h * hs; water.setAttribute('y', top); water.setAttribute('height', h * hs); dh.setAttribute('x1', x0 - 16); dh.setAttribute('x2', x0 - 16); dh.setAttribute('y1', y0); dh.setAttribute('y2', top); th.setAttribute('x', x0 - 36); th.setAttribute('y', (y0 + top) / 2 + 6); out.textContent = 'h = ' + fm(h, 1) + ' ' + u + '   →   V = πR²h = ' + fm(Math.PI * R * R * h, 1) + ' ' + u + '³'; }
    var sl = slider(fig, 'Water depth h (' + u + ')', 1, 10, 0.5, h, function () { upd(sl.value); }); upd(h);
  };

  /* ---------------------------------------------------------------- a street lamp, a walker and a shadow (similar triangles) */
  VT.scenes.shadow = function (fig, st) {
    var H = st.H || 15, h = st.h || 6, x = st.x != null ? st.x : 8, lx = 50, gy = 262, sc = 14;
    var svg = mk(fig, 'A street lamp H tall and a person h tall standing x from the lamp. The person casts a shadow of length s on the ground.');
    Ln(svg, 20, gy, 410, gy, C.grey, 4); var big = S('polygon', { fill: 'rgba(43,79,217,.08)' }, svg), small = S('polygon', { fill: 'rgba(194,106,0,.22)' }, svg);
    Ln(svg, lx, gy, lx, gy - H * sc, C.ink, 6); S('circle', { cx: lx, cy: gy - H * sc, r: 8, fill: '#ffd25a', stroke: C.ink, 'stroke-width': 2 }, svg);
    var ray = Ln(svg, 0, 0, 0, 0, C.red, 2.5), body = Ln(svg, 0, 0, 0, 0, C.orange, 6), head = S('circle', { r: 8, fill: C.orange }, svg);
    var tx = T(svg, 0, 0, 'x', { size: 17, bold: true, anchor: 'middle', fill: C.blue }), ts = T(svg, 0, 0, 's', { size: 17, bold: true, anchor: 'middle', fill: C.red });
    T(svg, lx - 8, gy - H * sc - 14, 'H = ' + H + ' ft', { size: 13, bold: true, anchor: 'start' }); var th = T(svg, 0, 0, 'h = ' + h + ' ft', { size: 13, bold: true }), out = readout(fig);
    function upd(v) {
      x = +v; var s = x * h / (H - h), px = lx + x * sc, tip = lx + (x + s) * sc, hy = gy - h * sc;
      ray.setAttribute('x1', lx); ray.setAttribute('y1', gy - H * sc); ray.setAttribute('x2', tip); ray.setAttribute('y2', gy);
      body.setAttribute('x1', px); body.setAttribute('x2', px); body.setAttribute('y1', gy); body.setAttribute('y2', hy + 8); head.setAttribute('cx', px); head.setAttribute('cy', hy);
      big.setAttribute('points', [lx, gy, lx, gy - H * sc, tip, gy].join(' ')); small.setAttribute('points', [px, gy, px, hy, tip, gy].join(' '));
      tx.setAttribute('x', (lx + px) / 2); tx.setAttribute('y', gy + 22); ts.setAttribute('x', (px + tip) / 2); ts.setAttribute('y', gy + 22); th.setAttribute('x', px + 12); th.setAttribute('y', hy - 14);
      out.textContent = 'x = ' + fm(x, 1) + ' ft   ·   shadow s = ' + fm(s, 1) + ' ft   ·   tip of shadow is ' + fm(x + s, 1) + ' ft from the lamp';
    }
    var sl = slider(fig, 'Distance x from the lamp (ft)', 2, 13, 0.5, x, function () { upd(sl.value); }); upd(x);
  };

  /* ---------------------------------------------------------------- formula cards: the shapes a related-rates problem usually hides */
  VT.scenes.formulas = function (fig, st) {
    var cards = [
      ['circle', 'Circle (a puddle)', 'A = πr²', '<circle cx="40" cy="35" r="24" fill="#cfe0ff" stroke="#2b4fd9" stroke-width="3"/><line x1="40" y1="35" x2="64" y2="35" stroke="#142230" stroke-width="2"/>'],
      ['sphere', 'Sphere (a balloon)', 'V = (4/3)πr³', '<circle cx="40" cy="35" r="24" fill="#ffe0d2" stroke="#b3412e" stroke-width="3"/><ellipse cx="40" cy="35" rx="24" ry="7" fill="none" stroke="#b3412e" stroke-width="1.5"/>'],
      ['cylinder', 'Cylinder (a can)', 'V = πr²h', '<ellipse cx="40" cy="16" rx="22" ry="7" fill="#bcd7ff" stroke="#142230" stroke-width="2"/><path d="M18 16 V52 a22 7 0 0 0 44 0 V16" fill="#bcd7ff" stroke="#142230" stroke-width="2"/>'],
      ['cone', 'Cone (a funnel)', 'V = (1/3)πr²h', '<polygon points="40,60 14,12 66,12" fill="#bcd7ff" stroke="#142230" stroke-width="2.5"/>'],
      ['triangle', 'Right triangle (a ladder)', 'x² + y² = z²', '<polygon points="12,56 68,56 12,10" fill="#e9f0e2" stroke="#1c7d4a" stroke-width="3"/><path d="M12 44 H24 V56" fill="none" stroke="#1c7d4a" stroke-width="1.5"/>'],
      ['rect', 'Rectangle (a screen)', 'A = l·w', '<rect x="12" y="14" width="56" height="38" fill="#fff3d6" stroke="#c26a00" stroke-width="3"/>']
    ];
    var box = el('div', 'vt-cards'); fig.appendChild(box);
    cards.forEach(function (c) { var d = el('div', 'vt-card' + (st.hi && st.hi.indexOf(c[0]) >= 0 ? ' hi' : '')); d.innerHTML = '<svg viewBox="0 0 80 66" role="img" aria-label="' + c[1] + '">' + c[3] + '</svg><b>' + c[1] + '</b><br>' + c[2]; box.appendChild(d); });
  };

  /* ---------------------------------------------------------------- chain: t -> r -> A, three boxes and the rates between them */
  VT.scenes.chain = function (fig, st) {
    var n = st.names || ['t', 'r', 'A'], reveal = st.reveal || 3, svg = mk(fig, 'Three boxes in a row: time t leads to the radius r, and r leads to the area A. Arrows between them carry the rates.', 420, 190);
    [[20, n[0], C.grey], [170, n[1], C.blue], [320, n[2], C.orange]].forEach(function (b) { S('rect', { x: b[0], y: 40, width: 80, height: 50, rx: 10, fill: 'var(--surface)', stroke: b[2], 'stroke-width': 3 }, svg); T(svg, b[0] + 40, 73, b[1], { size: 26, bold: true, anchor: 'middle', fill: b[2] }); });
    if (reveal >= 1) { arrow(svg, 102, 65, 168, 65, C.red, 3); T(svg, 135, 32, st.d1 || 'dr/dt', { size: 14, bold: true, anchor: 'middle', fill: C.red }); }
    if (reveal >= 2) { arrow(svg, 252, 65, 318, 65, C.red, 3); T(svg, 285, 32, st.d2 || 'dA/dr', { size: 14, bold: true, anchor: 'middle', fill: C.red }); }
    if (reveal >= 3) { S('path', { d: 'M60 96 V140 H360 V96', fill: 'none', stroke: C.green, 'stroke-width': 3 }, svg); arrow(svg, 360, 130, 360, 98, C.green, 3); T(svg, 210, 134, (st.d3 || 'dA/dt') + ' = ' + (st.d2 || 'dA/dr') + ' · ' + (st.d1 || 'dr/dt'), { size: 15, bold: true, anchor: 'middle', fill: C.green }); T(svg, 210, 170, 'multiply the rates along the way', { size: 13, anchor: 'middle', fill: C.grey }); }
  };

  /* ---------------------------------------------------------------- chaingraph: the slope of r(t) and the slope of r(t)^2 side by side */
  VT.scenes.chaingraph = function (fig, st) {
    var pw = st.power || 2, rf = function (t) { return 1 + t / 2; }, rp = 0.5, F = function (t) { return Math.pow(rf(t), pw); }, Fp = function (t) { return pw * Math.pow(rf(t), pw - 1) * rp; }, t0 = st.t != null ? st.t : 2;
    var box = el('div', 'row'), ymax = pw === 2 ? 10 : 30, ystep = pw === 2 ? 2 : 10; fig.appendChild(box);
    var G1 = XK.plot(box, { xmin: 0, xmax: 4, ymin: 0, ymax: 4, xstep: 1, ystep: 1, w: 260, h: 230, max: 300, xlabel: 't (s)', ylabel: 'r (cm)', label: 'The radius r grows along a straight line as time passes' });
    var G2 = XK.plot(box, { xmin: 0, xmax: 4, ymin: 0, ymax: ymax, xstep: 1, ystep: ystep, w: 260, h: 230, max: 300, xlabel: 't (s)', ylabel: 'r' + (pw === 2 ? '²' : '³'), label: 'The quantity r to the power ' + pw + ' curves upward and gets steeper' });
    XK.curve(G1, rf, 0, 4, C.blue); XK.curve(G2, F, 0, 4, C.blue); var tan1 = XK.line(G1, C.red), tan2 = XK.line(G2, C.red), d1 = XK.dot(G1, C.red), d2 = XK.dot(G2, C.red), out = readout(fig);
    function upd(v) { var t = +v, r = rf(t); XK.setDot(G1, d1, t, r); XK.setDot(G2, d2, t, F(t)); XK.through(G1, tan1, t, r, rp, 1.1); XK.through(G2, tan2, t, F(t), Fp(t), 0.8);
      out.textContent = 't = ' + fm(t, 1) + ':  r = ' + fm(r, 2) + '  ·  slope of r = dr/dt = 0.5  ·  slope of r' + (pw === 2 ? '²' : '³') + ' = ' + (pw === 2 ? '2·r·dr/dt = 2·' + fm(r, 2) + '·0.5' : '3·r²·dr/dt = 3·' + fm(r * r, 2) + '·0.5') + ' = ' + fm(Fp(t), 2); }
    var sl = slider(fig, 'Time t', 0.5, 3.5, 0.5, t0, function () { upd(sl.value); }); upd(t0);
  };

  /* ---------------------------------------------------------------- zoom: a curve and its tangent line merge as the window shrinks */
  var ZF = {
    x2: { f: function (x) { return x * x; }, d: function (x) { return 2 * x; }, a: 1, w: 4, name: 'f(x) = x²' },
    sqrt: { f: Math.sqrt, d: function (x) { return 0.5 / Math.sqrt(x); }, a: 4, w: 6, name: 'f(x) = √x' },
    exp: { f: Math.exp, d: Math.exp, a: 0, w: 4, name: 'f(x) = eˣ' },
    sin: { f: Math.sin, d: Math.cos, a: 1, w: 4, name: 'f(x) = sin x' }
  };
  VT.scenes.zoom = function (fig, st) {
    var F = ZF[st.fn || 'x2'], W = 420, H = 300, a = F.a, fa = F.f(a), m = F.d(a), z0 = st.zoom || 0;
    var svg = mk(fig, 'The graph of ' + F.name + ' near x = ' + a + ' with its tangent line in red. As the window shrinks, the curve and the line look the same.');
    var tanL = S('line', { stroke: C.red, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.85 }, svg), cv = S('path', { fill: 'none', stroke: C.blue, 'stroke-width': 2.5 }, svg), pt = S('circle', { r: 6, fill: C.ink, stroke: '#fff', 'stroke-width': 1.5 }, svg);
    T(svg, 12, 22, F.name, { bold: true, size: 15 }); T(svg, 12, 42, 'blue: the curve · red: the tangent line', { size: 12, fill: C.grey }); var out = readout(fig);
    function upd(v) {
      var z = Math.pow(10, v / 10), wx = F.w / z, hx = wx * H / W, x1 = a - wx / 2, y1 = fa - hx / 2, px = function (x) { return (x - x1) / wx * W; }, py = function (y) { return H - (y - y1) / hx * H; }, d = '', i, x;
      for (i = 0; i <= 120; i++) { x = x1 + wx * i / 120; d += (i ? 'L' : 'M') + px(x).toFixed(1) + ' ' + py(F.f(x)).toFixed(1); }
      cv.setAttribute('d', d); tanL.setAttribute('x1', px(x1)); tanL.setAttribute('y1', py(fa + m * (x1 - a))); tanL.setAttribute('x2', px(x1 + wx)); tanL.setAttribute('y2', py(fa + m * (x1 + wx - a))); pt.setAttribute('cx', px(a)); pt.setAttribute('cy', py(fa));
      var gap = Math.abs(F.f(a + wx / 2) - (fa + m * wx / 2)) / hx * H;
      out.textContent = 'zoom ×' + fm(z, z < 10 ? 1 : 0) + '   ·   the window is ' + fm(wx, wx < 0.1 ? 4 : 2) + ' wide   ·   gap at the edge: ' + fm(gap, gap < 10 ? 1 : 0) + ' pixels';
    }
    var sl = slider(fig, 'Zoom in', 0, 30, 1, z0, function () { upd(sl.value); }); upd(z0);
  };

  /* ---------------------------------------------------------------- approx: the tangent line used as an estimate, and the gap it leaves */
  var AP = {
    sqrt: { f: Math.sqrt, d: function (x) { return 0.5 / Math.sqrt(x); }, a: 4, x0: 5, x: [0, 9], y: [0, 3.5], xs: 1, ys: 0.5, lx: [0, 9], sl: [1, 8.5], name: 'f(x) = √x', xl: 'x', yl: 'f(x)' },
    sq: { f: function (x) { return x * x; }, d: function (x) { return 2 * x; }, a: 2, x0: 3, x: [0, 4], y: [0, 16], xs: 1, ys: 4, lx: [1, 4], sl: [0.5, 3.8], name: 'f(x) = x²', xl: 'x', yl: 'f(x)' },
    temp: { f: function (t) { return 70 + 4 * (t - 3) - 0.5 * (t - 3) * (t - 3); }, d: function (t) { return 4 - (t - 3); }, a: 3, x0: 4, x: [2, 5], y: [64, 76], xs: 1, ys: 2, lx: [2, 5], sl: [3.1, 4.9], name: 'temperature T(t)', xl: 'hour', yl: '°F' }
  };
  VT.scenes.approx = function (fig, st) {
    var P = AP[st.fn || 'sqrt'], a = P.a, fa = P.f(a), m = P.d(a), x0 = st.x0 != null ? st.x0 : P.x0, L = function (x) { return fa + m * (x - a); };
    var G = XK.plot(fig, { xmin: P.x[0], xmax: P.x[1], ymin: P.y[0], ymax: P.y[1], xstep: P.xs, ystep: P.ys, w: 420, h: 290, max: 520, xlabel: P.xl, ylabel: P.yl, label: 'The curve ' + P.name + ', its tangent line at x = ' + a + ' in red, and the gap between them at one chosen x' });
    XK.curve(G, P.f, P.x[0], P.x[1], C.blue); var tl = XK.line(G, C.red); XK.setLine(G, tl, P.lx[0], L(P.lx[0]), P.lx[1], L(P.lx[1])); var da = XK.dot(G, C.ink); XK.setDot(G, da, a, fa);
    var gap = XK.line(G, C.orange, 5), df = XK.dot(G, C.blue), dl = XK.dot(G, C.red), vl = S('line', { stroke: C.grey, 'stroke-dasharray': '4 4' }, G.svg), out = readout(fig);
    T(G.svg, G.px(a) + 8, G.py(fa) + 18, 'a = ' + a, { size: 12, bold: true });
    function upd(v) {
      var x = +v, fx = P.f(x), lx = L(x); XK.setDot(G, df, x, fx); XK.setDot(G, dl, x, lx); XK.setLine(G, gap, x, fx, x, lx); vl.setAttribute('x1', G.px(x)); vl.setAttribute('x2', G.px(x)); vl.setAttribute('y1', G.py(P.y[0])); vl.setAttribute('y2', G.py(Math.min(fx, lx)));
      var d = lx - fx; out.textContent = 'x = ' + fm(x, 2) + '   ·   line L(x) = ' + fm(lx, 3) + '   ·   curve f(x) = ' + fm(fx, 3) + '   ·   the line is ' + (Math.abs(d) < 1e-9 ? 'on the curve' : (d > 0 ? 'ABOVE the curve (estimate too big)' : 'BELOW the curve (estimate too small)'));
    }
    if (!st.fixed) { var sl = slider(fig, 'Move x', P.sl[0], P.sl[1], 0.1, x0, function () { upd(sl.value); }); }
    upd(x0);
  };

  /* ---------------------------------------------------------------- ratio: two functions both heading to 0 at x = a, and the ratio of their values */
  var RP = {
    poly: { f: function (x) { return x * x - 4; }, g: function (x) { return x - 2; }, a: 2, x: [1, 3], y: [-4, 6], ys: 2, fn: 'f(x) = x² − 4', gn: 'g(x) = x − 2', lim: 4 },
    lines: { f: function (x) { return 6 * (x - 1); }, g: function (x) { return 3 * (x - 1); }, a: 1, x: [0, 2], y: [-6, 6], ys: 2, fn: 'f(x) = 6(x − 1)', gn: 'g(x) = 3(x − 1)', lim: 2 },
    exp: { f: function (x) { return Math.exp(2 * x) - 1; }, g: function (x) { return x; }, a: 0, x: [-1, 1], y: [-2, 6], ys: 2, fn: 'f(x) = e²ˣ − 1', gn: 'g(x) = x', lim: 2 },
    sin: { f: function (x) { return Math.sin(3 * x); }, g: function (x) { return x; }, a: 0, x: [-1, 1], y: [-1.5, 1.5], ys: 0.5, fn: 'f(x) = sin 3x', gn: 'g(x) = x', lim: 3 }
  }, HS = [0.5, 0.2, 0.1, 0.05, 0.01];
  VT.scenes.ratio = function (fig, st) {
    var P = RP[st.fn || 'poly'], a = P.a, k0 = st.k != null ? st.k : 0;
    var G = XK.plot(fig, { xmin: P.x[0], xmax: P.x[1], ymin: P.y[0], ymax: P.y[1], xstep: P.x[1] - P.x[0] > 1.5 ? 0.5 : 0.25, ystep: P.ys, w: 420, h: 250, max: 520, xlabel: 'x', ylabel: 'value', label: P.fn + ' in blue and ' + P.gn + ' in orange. Both reach zero at x = ' + a });
    XK.curve(G, P.f, P.x[0], P.x[1], C.blue); XK.curve(G, P.g, P.x[0], P.x[1], C.orange); var vl = XK.line(G, C.grey, 1.5), d1 = XK.dot(G, C.blue), d2 = XK.dot(G, C.orange);
    T(G.svg, 60, 24, P.fn, { fill: C.blue, bold: true, size: 13 }); T(G.svg, 60, 42, P.gn, { fill: C.orange, bold: true, size: 13 });
    var rows = table(fig, ['x', 'f(x)', 'g(x)', 'f(x) ÷ g(x)'], HS.map(function (h) { var x = a + h; return [fm(x, 2), fm(P.f(x), 4), fm(P.g(x), 4), fm(P.f(x) / P.g(x), 4)]; })), out = readout(fig);
    function upd(v) { var k = +v, h = HS[k], x = a + h; XK.setDot(G, d1, x, P.f(x)); XK.setDot(G, d2, x, P.g(x)); XK.setLine(G, vl, x, P.y[0], x, P.y[1]); rows.forEach(function (tr, i) { tr.classList.toggle('on', i === k); }); out.textContent = 'x = ' + fm(x, 2) + ' (' + fm(h, 2) + ' to the right of ' + a + ')   ·   f ÷ g = ' + fm(P.f(x) / P.g(x), 4); }
    var sl = slider(fig, 'Slide x toward ' + a + ' (steps 1 to 5)', 0, 4, 1, k0, function () { upd(sl.value); }); upd(k0);
  };

  /* ---------------------------------------------------------------- growth: who gets big faster as x grows, drawn as bars on a log scale */
  var GP = {
    xex: { f: function (x) { return x; }, g: Math.exp, fn: 'x', gn: 'eˣ' },
    lnx: { f: Math.log, g: function (x) { return x; }, fn: 'ln x', gn: 'x' },
    x2ex: { f: function (x) { return x * x; }, g: Math.exp, fn: 'x²', gn: 'eˣ' },
    x2x3: { f: function (x) { return x * x; }, g: function (x) { return x * x * x; }, fn: 'x²', gn: 'x³' }
  }, XS = [2, 5, 10, 20, 40];
  VT.scenes.growth = function (fig, st) {
    var P = GP[st.fn || 'xex'], k0 = st.k != null ? st.k : 1, svg = mk(fig, 'Two bars, ' + P.fn + ' and ' + P.gn + ', drawn on a log scale. The ' + P.gn + ' bar gets longer much faster as x grows.', 420, 150);
    var b1 = S('rect', { x: 20, y: 30, height: 30, fill: C.blue, rx: 4 }, svg), b2 = S('rect', { x: 20, y: 88, height: 30, fill: C.orange, rx: 4 }, svg), t1 = T(svg, 24, 24, '', { size: 13, bold: true, fill: C.blue }), t2 = T(svg, 24, 82, '', { size: 13, bold: true, fill: C.orange });
    T(svg, 400, 144, 'bars use a log scale', { size: 11, fill: C.grey, anchor: 'end' });
    var rows = table(fig, ['x', P.fn, P.gn, P.fn + ' ÷ ' + P.gn], XS.map(function (x) { return [x, big(P.f(x)), big(P.g(x)), big(P.f(x) / P.g(x))]; })), out = readout(fig), len = function (v) { return 14 + 80 * Math.log10(Math.max(v, 1) + 1); };
    function upd(v) { var k = +v, x = XS[k]; b1.setAttribute('width', len(P.f(x))); b2.setAttribute('width', Math.min(380, len(P.g(x)))); t1.textContent = P.fn + ' = ' + big(P.f(x)); t2.textContent = P.gn + ' = ' + big(P.g(x)); rows.forEach(function (tr, i) { tr.classList.toggle('on', i === k); }); out.textContent = 'x = ' + x + '   ·   ' + P.fn + ' ÷ ' + P.gn + ' = ' + big(P.f(x) / P.g(x)); }
    var sl = slider(fig, 'Slide x (steps 1 to 5)', 0, 4, 1, k0, function () { upd(sl.value); }); upd(k0);
  };

  /* ---------------------------------------------------------------- forms: what plugging in can tell you about a limit */
  VT.scenes.forms = function (fig, st) {
    var rows = [['a number, like 5', 'that number is the limit', 'Stop. You are done.'], ['0/0 or ∞/∞', 'this tells you nothing yet', 'L’Hôpital’s Rule may help'], ['a number ÷ 0, like 3/0', 'the limit is not a finite number', 'The rule does NOT apply']];
    var t = table(fig, ['Plug in x = a and get…', 'It means…', 'So…'], rows); if (st.hi != null) t[st.hi].classList.add('on');
  };
})();
