/* LESSON (calculus 3.4): the wiring is LK.standard (physics/lessons/engine/standard.js, selfPaced branch). Edit spec.js for the teaching.
   This file draws the Explore tab: four hands-on stations. Each one is a custom item (X1 to X4) that the student must solve, in order.
   Every picture has a "How to read it" line and prints as a plain figure. No station needs arithmetic: the student moves a point and reads what the picture says. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, NS = 'http://www.w3.org/2000/svg';

  function sv(tag, attrs, parent) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
  function guide(host, text) { var p = el('p', 'hint'); p.appendChild(el('b', null, 'How to read it: ')); p.appendChild(document.createTextNode(text)); host.appendChild(p); }
  function fm(v, d) { return LE.fmt(v, d == null ? 2 : d).replace(/\.?0+$/, ''); }
  var RED = '#b3412e', BLUE = '#2b4fd9', GREEN = '#1c7d4a', ORANGE = '#c26a00';

  /* a square graph from min to max on both axes, with a grid and axes; px/py place things */
  function graph(host, o) {
    var N = 360, pad = 24, sc = (N - 2 * pad) / (o.max - o.min), svg = sv('svg', { viewBox: '0 0 ' + N + ' ' + N, role: 'img', 'aria-label': o.label, style: 'width:100%;max-width:420px;background:var(--stage);border:1px solid var(--line);border-radius:8px;display:block' });
    var G = { svg: svg, px: function (x) { return pad + (x - o.min) * sc; }, py: function (y) { return N - pad - (y - o.min) * sc; } }, t;
    for (t = Math.ceil(o.min); t <= o.max; t++) {
      sv('line', { x1: G.px(t), y1: G.py(o.min), x2: G.px(t), y2: G.py(o.max), stroke: '#d5dde5', 'stroke-width': 1 }, svg);
      sv('line', { x1: G.px(o.min), y1: G.py(t), x2: G.px(o.max), y2: G.py(t), stroke: '#d5dde5', 'stroke-width': 1 }, svg);
    }
    sv('line', { x1: G.px(o.min), y1: G.py(0), x2: G.px(o.max), y2: G.py(0), stroke: '#7a8a99', 'stroke-width': 1.5 }, svg);
    sv('line', { x1: G.px(0), y1: G.py(o.min), x2: G.px(0), y2: G.py(o.max), stroke: '#7a8a99', 'stroke-width': 1.5 }, svg);
    for (t = Math.ceil(o.min); t <= o.max; t += o.tick) if (t !== 0) {
      sv('text', { x: G.px(t), y: G.py(0) + 14, 'font-size': 11, 'text-anchor': 'middle', fill: '#142230' }, svg).textContent = t;
      sv('text', { x: G.px(0) - 5, y: G.py(t) + 4, 'font-size': 11, 'text-anchor': 'end', fill: '#142230' }, svg).textContent = t;
    }
    host.appendChild(svg); return G;
  }
  function path(G, parent, fx, fy, t0, t1, color) {
    var d = '', n = 160, i, t; for (i = 0; i <= n; i++) { t = t0 + (t1 - t0) * i / n; d += (i ? 'L' : 'M') + G.px(fx(t)).toFixed(1) + ' ' + G.py(fy(t)).toFixed(1); }
    return sv('path', { d: d, fill: 'none', stroke: color, 'stroke-width': 3 }, parent);
  }
  function seg(G, parent, color, w) { return sv('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: color, 'stroke-width': w || 2.5 }, parent); }
  function setSeg(G, n, x1, y1, x2, y2) { n.setAttribute('x1', G.px(x1)); n.setAttribute('y1', G.py(y1)); n.setAttribute('x2', G.px(x2)); n.setAttribute('y2', G.py(y2)); }
  /* a tangent line through (x, y) with slope m, about 2L long */
  function tangent(G, n, x, y, m, L) { var d = Math.sqrt(1 + m * m); setSeg(G, n, x - L / d, y - L * m / d, x + L / d, y + L * m / d); }
  function dot(parent, color) { return sv('circle', { r: 6, fill: color, stroke: '#fff', 'stroke-width': 1.5 }, parent); }
  function setDot(G, n, x, y) { n.setAttribute('cx', G.px(x)); n.setAttribute('cy', G.py(y)); }
  function slider(row, label, min, max, step, val, fn) {
    var l = el('label', null, label + ' '), i = el('input'), o = el('b', null, String(val)); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = val; i.setAttribute('aria-label', label);
    i.oninput = function () { o.textContent = i.value; fn(); }; l.appendChild(i); l.appendChild(o); row.appendChild(l); return i;
  }
  function checkBtn(ctl, text, fn) { var b = el('button', 'btn primary', text); b.type = 'button'; b.onclick = fn; ctl.appendChild(b); return b; }
  /* a row of answer buttons: the right one is first in the list, the order is shuffled by seed */
  function choices(host, labels, seed, onPick) {
    var row = el('div', 'row'); host.appendChild(row);
    LE.shuffle(labels.map(function (_, i) { return i; }), LE.seedRng(seed)).forEach(function (i) { var b = el('button', 'btn', labels[i]); b.type = 'button'; b.onclick = function () { onPick(i, b); }; row.appendChild(b); });
    return row;
  }
  var asin = Math.asin, acos = Math.acos, atan = Math.atan, darcsin = function (x) { return 1 / Math.sqrt(1 - x * x); };

  LK.standard(window.SPECS['3-4-inverse-trig'], { prefix: 'IVT', explore: function (card) {
    card.appendChild(el('p', 'qtext', 'Four stations, in order. Move things with the sliders and buttons. There is no clock: take your time, and if you stop, your work is saved on this device for tomorrow.'));

    /* ---- Station 1: the triangle behind arcsin ---- */
    LE.ask(card, { id: 'X1', type: 'custom', head: 'Station 1 · The triangle behind arcsin', maxMiss: 8, answer: 3,
      prompt: 'The hypotenuse is always 1. Slide x, the vertical side, and watch the bottom side. Do the three jobs, then name the rule.',
      keyText: 'Job 1: x = 0.8 (bottom 0.6). Job 2: x = 0.6 (bottom 0.8). Job 3: x about 0.71. Then pick √(1 − x²).',
      worked: 'The Pythagorean theorem gives bottom² + x² = 1², so the bottom side is √(1 − x²).',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: with hypotenuse 1 and a side x, the third side is √(1 − x²).')); return; }
        guide(w, 'A right triangle. The long slanted side is 1. The vertical side is x. The red angle y is the angle whose sine is x, so y = arcsin x. The bottom side is the third side. The dashed arc shows every place the slanted side can reach.');
        var N = 360, S = 280, ox = 30, oy = 300, svg = sv('svg', { viewBox: '0 0 ' + N + ' 330', role: 'img', 'aria-label': 'A right triangle whose slanted side is 1, with a vertical side x, a bottom side, and the angle y at the left', style: 'width:100%;max-width:420px;background:var(--stage);border:1px solid var(--line);border-radius:8px;display:block' });
        sv('path', { d: 'M' + (ox + S) + ' ' + oy + ' A' + S + ' ' + S + ' 0 0 0 ' + ox + ' ' + (oy - S), fill: 'none', stroke: '#9aa8b5', 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }, svg);
        var tri = sv('polygon', { fill: '#eef3fb', stroke: '#142230', 'stroke-width': 2 }, svg), hyp = sv('line', { stroke: BLUE, 'stroke-width': 3 }, svg), vert = sv('line', { stroke: RED, 'stroke-width': 4 }, svg), bot = sv('line', { stroke: GREEN, 'stroke-width': 4 }, svg);
        var tHyp = sv('text', { 'font-size': 13, fill: BLUE }, svg), tVert = sv('text', { 'font-size': 13, fill: RED }, svg), tBot = sv('text', { 'font-size': 13, fill: GREEN, 'text-anchor': 'middle' }, svg), tAng = sv('text', { x: ox + 36, y: oy - 8, 'font-size': 14, fill: RED }, svg);
        tAng.textContent = 'y'; w.appendChild(svg);
        var jobs = [{ t: 'Job 1 of 3: slide x until the bottom side is 0.6.', ok: function (x, a) { return Math.abs(a - 0.6) < 0.005; } }, { t: 'Job 2 of 3: slide x until the bottom side is 0.8.', ok: function (x, a) { return Math.abs(a - 0.8) < 0.005; } }, { t: 'Job 3 of 3: slide x until the bottom side equals the vertical side.', ok: function (x, a) { return Math.abs(a - x) < 0.015; } }], k = 0;
        var head = el('p', 'qtext'), row = el('div', 'row'), out = el('p', 'qtext'), tail = el('div'); w.appendChild(head); w.appendChild(row); w.appendChild(out); w.appendChild(tail);
        var x = 0.5;
        function upd() {
          x = +sl.value / 100; var a = Math.sqrt(1 - x * x), px = ox + S * a, py = oy - S * x;
          tri.setAttribute('points', ox + ',' + oy + ' ' + px + ',' + oy + ' ' + px + ',' + py);
          hyp.setAttribute('x1', ox); hyp.setAttribute('y1', oy); hyp.setAttribute('x2', px); hyp.setAttribute('y2', py);
          vert.setAttribute('x1', px); vert.setAttribute('y1', oy); vert.setAttribute('x2', px); vert.setAttribute('y2', py);
          bot.setAttribute('x1', ox); bot.setAttribute('y1', oy); bot.setAttribute('x2', px); bot.setAttribute('y2', oy);
          tHyp.setAttribute('x', ox + S * a / 2 - 18); tHyp.setAttribute('y', oy - S * x / 2 - 8); tHyp.textContent = '1';
          tVert.setAttribute('x', px + 8); tVert.setAttribute('y', oy - S * x / 2 + 4); tVert.textContent = 'x = ' + fm(x);
          tBot.setAttribute('x', ox + S * a / 2); tBot.setAttribute('y', oy + 18); tBot.textContent = fm(a, 3);
          out.textContent = 'Vertical side x: ' + fm(x) + '   ·   bottom side: ' + fm(a, 3);
        }
        var sl = slider(row, 'Slide x', 5, 99, 1, 50, upd);
        function showJob() { head.textContent = jobs[k].t; }
        var btn = checkBtn(ctl, 'Check: this job is done', function () {
          var a = Math.sqrt(1 - x * x);
          if (jobs[k].ok(x, a)) { k++; if (k === 3) { btn.disabled = true; row.style.display = 'none'; head.textContent = 'Which rule gives the bottom side from x? (The hypotenuse is 1.)'; tail.appendChild(el('p', 'hint', 'The bottom side was 0.6 when x was 0.8, and 0.8 when x was 0.6.'));
              choices(tail, ['√(1 − x²)', '1 − x²', '√(1 + x²)', '1 − x'], 'x1:rule', function (i, b) { if (i === 0) { b.classList.add('good'); api.solve(); } else api.miss('Try x = 0.6: the bottom side was 0.8. Check which rule gives 0.8 from 0.6.'); }); return; }
            showJob(); }
          else api.miss(k === 2 ? 'The bottom side is ' + fm(a, 3) + ' and x is ' + fm(x) + '. They are not equal yet.' : 'The bottom side is ' + fm(a, 3) + '. Slide x until it is ' + (k === 0 ? '0.6' : '0.8') + '.');
        });
        showJob(); upd();
      } });

    /* ---- Station 2: how steep is arcsin? ---- */
    LE.ask(card, { id: 'X2', type: 'custom', head: 'Station 2 · How steep is arcsin?', maxMiss: 8, answer: 2,
      prompt: 'Slide the point along the arcsin curve. The orange line touches the curve. Find the spot for each job.',
      keyText: 'Job 1: x near 0 (slope 1). Job 2: x about 0.85 to 0.88 (slope 2). Then: steeper and steeper.',
      worked: 'Near x = 0 the slope is 1, the smallest it gets. Near x = ±1 the curve gets steeper and steeper. That is the mirror of the flat tangent of sine at its peak.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: arcsin has slope 1 at the middle and gets steeper and steeper toward x = ±1.')); return; }
        guide(w, 'The blue curve is y = arcsin x. The red point rides on it. The orange line touches the curve at the red point. The number under the picture is the slope of the orange line.');
        var G = graph(w, { min: -2, max: 2, tick: 1, label: 'The curve y equals arcsin x in blue, a red point on it, and an orange tangent line' });
        path(G, G.svg, function (t) { return asin(t); }, function (t) { return t; }, -1, 1, BLUE);
        var tg = seg(G, G.svg, ORANGE), rp = dot(G.svg, RED), row = el('div', 'row'), out = el('p', 'qtext'), head = el('p', 'qtext'), tail = el('div'); w.appendChild(head); w.appendChild(row); w.appendChild(out); w.appendChild(tail);
        var jobs = ['Job 1 of 3: put the point where the curve is least steep.', 'Job 2 of 3: put the point where the slope is 2.'], k = 0, x = 0, m = 1;
        function upd() { x = +sl.value / 100; m = darcsin(x); setDot(G, rp, x, asin(x)); tangent(G, tg, x, asin(x), m, 0.7); out.textContent = 'x = ' + fm(x) + '   ·   slope of the orange line: ' + fm(m, 2); }
        var sl = slider(row, 'Slide the point', -99, 99, 1, 50, upd);
        function showJob() { head.textContent = jobs[k]; }
        var btn = checkBtn(ctl, 'Check: this job is done', function () {
          if (k === 0) { if (Math.abs(x) <= 0.05) { k++; showJob(); } else api.miss('The slope here is ' + fm(m, 2) + '. The least steep spot has the smallest slope. Slide toward the middle.'); return; }
          if (Math.abs(m - 2) <= 0.15) {
            btn.disabled = true; row.style.display = 'none'; head.textContent = 'Job 3 of 3: slide the point toward x = 1 in your head. The orange line gets…';
            choices(tail, ['steeper and steeper', 'flatter and flatter', 'closer to slope 1'], 'x2:ends', function (i, b) { if (i === 0) { b.classList.add('good'); api.solve(); } else api.miss('Look at the slopes: 1, then 1.25, then 2. They keep growing as x moves toward 1.'); });
          } else api.miss('The slope here is ' + fm(m, 2) + '. You want 2. ' + (m < 2 ? 'Slide away from the middle.' : 'Slide back toward the middle.'));
        });
        showJob(); upd();
      } });

    /* ---- Station 3: how steep is arctan? ---- */
    LE.ask(card, { id: 'X3', type: 'custom', head: 'Station 3 · How steep is arctan?', maxMiss: 8, answer: 3,
      prompt: 'Slide the point along the arctan curve. Find a spot where the slope is each target.',
      keyText: 'Slope 0.5 at x = 1 (or −1). Slope 0.2 at x = 2 (or −2). Slope 0.1 at x = 3 (or −3).',
      worked: 'The slope is 1 at x = 0 and shrinks toward 0 on both sides: 0.5 at x = ±1, 0.2 at x = ±2, 0.1 at x = ±3. The curve levels off.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: arctan is steepest at x = 0 (slope 1) and levels off on both sides.')); return; }
        guide(w, 'The blue curve is y = arctan x. The red point rides on it. The orange line touches the curve at the red point. The number under the picture is the slope of the orange line.');
        var G = graph(w, { min: -4, max: 4, tick: 1, label: 'The curve y equals arctan x in blue, a red point on it, and an orange tangent line' });
        path(G, G.svg, function (t) { return t; }, function (t) { return atan(t); }, -4, 4, BLUE);
        var tg = seg(G, G.svg, ORANGE), rp = dot(G.svg, RED), row = el('div', 'row'), out = el('p', 'qtext'), head = el('p', 'qtext'); w.appendChild(head); w.appendChild(row); w.appendChild(out);
        var targets = [0.5, 0.2, 0.1], k = 0, x = 0, m = 1;
        function upd() { x = +sl.value / 10; m = 1 / (1 + x * x); setDot(G, rp, x, atan(x)); tangent(G, tg, x, atan(x), m, 1.1); out.textContent = 'x = ' + fm(x, 1) + '   ·   slope of the orange line: ' + fm(m, 2); }
        var sl = slider(row, 'Slide the point', -40, 40, 1, 20, upd);
        function showJob() { head.textContent = 'Job ' + (k + 1) + ' of 3: put the point where the slope is ' + targets[k] + '.'; }
        checkBtn(ctl, 'Check: the slope is right', function () {
          if (Math.abs(m - targets[k]) < 0.011) { k++; if (k === 3) { api.solve(); return; } showJob(); }
          else api.miss('The slope here is ' + fm(m, 2) + '. You want ' + targets[k] + '. ' + (m > targets[k] ? 'That is too steep: slide away from the middle.' : 'That is too flat: slide toward the middle.'));
        });
        showJob(); upd();
      } });

    /* ---- Station 4: arcsin and arccos at the same x ---- */
    LE.ask(card, { id: 'X4', type: 'custom', head: 'Station 4 · arcsin and arccos together', maxMiss: 8, answer: 2,
      prompt: 'Both curves share the same x. The blue point and tangent are arcsin. The orange point and tangent are arccos. Find each spot, then name the orange slope.',
      keyText: 'Round 1: x = ±0.6, orange slope −1.25. Round 2: x = ±0.8, orange slope −1.67 (that is −5/3).',
      worked: 'At the same x, arccos has the same size of slope as arcsin with the opposite sign. The two curves always add up to π/2, so one rises exactly as fast as the other falls.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: at the same x, the slope of arccos is the negative of the slope of arcsin.')); return; }
        guide(w, 'Blue is y = arcsin x and orange is y = arccos x. Each has a dot and a tangent line at the same x. The number under the picture is the slope of the BLUE line only. Look at which way the orange line tilts.');
        var G = graph(w, { min: -2, max: 2, tick: 1, label: 'The curves y equals arcsin x in blue and y equals arccos x in orange, each with a dot and a tangent line at the same x' });
        path(G, G.svg, function (t) { return asin(t); }, function (t) { return t; }, -1, 1, BLUE); path(G, G.svg, function (t) { return acos(t); }, function (t) { return t; }, -1, 1, ORANGE);
        var tb = seg(G, G.svg, BLUE, 2), to = seg(G, G.svg, ORANGE, 2), rb = dot(G.svg, BLUE), ro = dot(G.svg, ORANGE), row = el('div', 'row'), out = el('p', 'qtext'), head = el('p', 'qtext'), tail = el('div'); w.appendChild(head); w.appendChild(row); w.appendChild(out); w.appendChild(tail);
        var rounds = [{ m: 1.25, tol: 0.03, labels: ['−1.25', '1.25', '0.8', '−0.8'] }, { m: 1.67, tol: 0.04, labels: ['−1.67', '1.67', '0.6', '−0.6'] }], k = 0, x = 0, m = 1;
        function upd() { x = +sl.value / 100; m = darcsin(x); setDot(G, rb, x, asin(x)); setDot(G, ro, x, acos(x)); tangent(G, tb, x, asin(x), m, 0.7); tangent(G, to, x, acos(x), -m, 0.7); out.textContent = 'x = ' + fm(x) + '   ·   slope of the blue line (arcsin): ' + fm(m, 2); }
        var sl = slider(row, 'Slide x', -99, 99, 1, 30, upd);
        function showJob() { head.textContent = 'Round ' + (k + 1) + ' of 2: put x where the blue slope is ' + rounds[k].m + '.'; }
        var btn = checkBtn(ctl, 'Check: the blue slope is right', function () {
          var R = rounds[k];
          if (Math.abs(m - R.m) >= R.tol) { api.miss('The blue slope here is ' + fm(m, 2) + '. You want ' + R.m + '. ' + (m < R.m ? 'Slide away from the middle.' : 'Slide toward the middle.')); return; }
          btn.disabled = true; row.style.display = 'none'; tail.innerHTML = ''; head.textContent = 'Round ' + (k + 1) + ' of 2: what is the slope of the ORANGE line?';
          choices(tail, R.labels, 'x4:r' + k, function (i, b) {
            if (i === 0) { b.classList.add('good'); k++; if (k === 2) { api.solve(); return; } tail.innerHTML = ''; row.style.display = ''; btn.disabled = false; showJob(); }
            else api.miss(i === 1 ? 'The orange line tilts DOWN, so its slope is negative.' : 'The orange line is exactly as steep as the blue one. Compare their sizes, then check the direction.');
          });
        });
        showJob(); upd();
      } });
  } });
})();
