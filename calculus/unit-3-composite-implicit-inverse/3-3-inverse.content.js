/* LESSON (calculus 3.3): the wiring is LK.standard (physics/lessons/engine/standard.js, selfPaced branch). Edit spec.js for the teaching.
   This file draws the Explore tab: four hands-on stations. Each one is a custom item (X1 to X4) that the student must solve, in order.
   Every picture has a "How to read it" line and prints as a plain figure. No station needs arithmetic: the student moves things. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, NS = 'http://www.w3.org/2000/svg';

  function sv(tag, attrs, parent) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
  function guide(host, text) { var p = el('p', 'hint'); p.appendChild(el('b', null, 'How to read it: ')); p.appendChild(document.createTextNode(text)); host.appendChild(p); }

  /* a square graph, min to max on both axes, with a grid, axes, the dashed mirror line y = x, and px/py to place things */
  function graph(host, o) {
    var N = 360, pad = 22, sc = (N - 2 * pad) / (o.max - o.min), svg = sv('svg', { viewBox: '0 0 ' + N + ' ' + N, role: 'img', 'aria-label': o.label, style: 'width:100%;max-width:420px;background:var(--stage);border:1px solid var(--line);border-radius:8px;display:block' });
    var G = { svg: svg, px: function (x) { return pad + (x - o.min) * sc; }, py: function (y) { return N - pad - (y - o.min) * sc; } }, t;
    for (t = Math.ceil(o.min); t <= o.max; t++) {
      sv('line', { x1: G.px(t), y1: G.py(o.min), x2: G.px(t), y2: G.py(o.max), stroke: '#d5dde5', 'stroke-width': 1 }, svg);
      sv('line', { x1: G.px(o.min), y1: G.py(t), x2: G.px(o.max), y2: G.py(t), stroke: '#d5dde5', 'stroke-width': 1 }, svg);
    }
    var ax = o.min < 0 ? 0 : o.min;
    sv('line', { x1: G.px(o.min), y1: G.py(ax), x2: G.px(o.max), y2: G.py(ax), stroke: '#7a8a99', 'stroke-width': 1.5 }, svg);
    sv('line', { x1: G.px(ax), y1: G.py(o.min), x2: G.px(ax), y2: G.py(o.max), stroke: '#7a8a99', 'stroke-width': 1.5 }, svg);
    for (t = Math.ceil(o.min); t <= o.max; t += o.tick) if (t !== ax) {
      sv('text', { x: G.px(t), y: G.py(ax) + 14, 'font-size': 11, 'text-anchor': 'middle', fill: '#142230' }, svg).textContent = t;
      sv('text', { x: G.px(ax) - 5, y: G.py(t) + 4, 'font-size': 11, 'text-anchor': 'end', fill: '#142230' }, svg).textContent = t;
    }
    sv('line', { x1: G.px(o.min), y1: G.py(o.min), x2: G.px(o.max), y2: G.py(o.max), stroke: '#7a8a99', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
    sv('text', { x: G.px(o.max) - 4, y: G.py(o.max) + 16, 'font-size': 12, 'text-anchor': 'end', fill: '#5a6b7a' }, svg).textContent = 'y = x';
    host.appendChild(svg); return G;
  }
  /* a path through (x(t), y(t)) for t0..t1 */
  function path(G, parent, fx, fy, t0, t1, color) {
    var d = '', n = 120, i, t; for (i = 0; i <= n; i++) { t = t0 + (t1 - t0) * i / n; d += (i ? 'L' : 'M') + G.px(fx(t)).toFixed(1) + ' ' + G.py(fy(t)).toFixed(1); }
    return sv('path', { d: d, fill: 'none', stroke: color, 'stroke-width': 3 }, parent);
  }
  function seg(G, parent, x1, y1, x2, y2, color, w, dash) { var a = { x1: G.px(x1), y1: G.py(y1), x2: G.px(x2), y2: G.py(y2), stroke: color, 'stroke-width': w || 2.5 }; if (dash) a['stroke-dasharray'] = dash; return sv('line', a, parent); }
  function setSeg(G, n, x1, y1, x2, y2) { n.setAttribute('x1', G.px(x1)); n.setAttribute('y1', G.py(y1)); n.setAttribute('x2', G.px(x2)); n.setAttribute('y2', G.py(y2)); }
  function dot(G, parent, color, r) { return sv('circle', { r: r || 6, fill: color, stroke: '#fff', 'stroke-width': 1.5 }, parent); }
  function setDot(G, n, x, y) { n.setAttribute('cx', G.px(x)); n.setAttribute('cy', G.py(y)); }
  function starAt(G, parent) { return sv('text', { 'font-size': 26, 'text-anchor': 'middle', fill: '#c28a00', stroke: '#7a5600', 'stroke-width': 0.6 }, parent); }
  function slider(row, label, min, max, step, val, fn) {
    var l = el('label', null, label + ' '), i = el('input'), o = el('b', null, String(val)); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = val; i.setAttribute('aria-label', label);
    i.oninput = function () { o.textContent = i.value; fn(); }; l.appendChild(i); l.appendChild(o); row.appendChild(l); return i;
  }
  function checkBtn(ctl, text, fn) { var b = el('button', 'btn primary', text); b.type = 'button'; b.onclick = fn; ctl.appendChild(b); return b; }
  var RED = '#b3412e', BLUE = '#2b4fd9', GREEN = '#1c7d4a', ORANGE = '#c26a00';
  function fm(v) { return LE.fmt(v, 2).replace(/\.?0+$/, ''); }

  LK.standard(window.SPECS['3-3-inverse'], { prefix: 'INV', explore: function (card) {
    card.appendChild(el('p', 'qtext', 'Four stations, in order. Move things with the sliders and buttons. There is no clock: take your time, and if you stop, your work is saved on this device for tomorrow.'));

    /* ---- Station 1: the mirror point ---- */
    LE.ask(card, { id: 'X1', type: 'custom', head: 'Station 1 · Mirror a point', maxMiss: 8, answer: 3,
      prompt: 'Slide the red point along f. Its mirror moves along the inverse. Put the green point on each star, then press Check. There are three stars.',
      keyText: 'Slide x to 2, then −2, then 1. Stars at (4, 2), (−4, −2) and (1.25, 1).',
      worked: 'Mirroring swaps the coordinates: the point (a, b) on f lands at (b, a) on the inverse.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: a point (a, b) on f has its mirror (b, a) on the inverse.')); return; }
        guide(w, 'The blue curve is f. The green curve is its inverse. The dashed line is y = x, the mirror. The red point is on f and the green point is its mirror. A star marks where the green point has to land.');
        var G = graph(w, { min: -6, max: 6, tick: 2, label: 'The curve f in blue, its inverse in green, the mirror line y equals x dashed, a red point on f and its green mirror point' });
        var F = function (x) { return x * x * x / 4 + x; };
        path(G, G.svg, function (t) { return t; }, F, -2.4, 2.4, BLUE); path(G, G.svg, F, function (t) { return t; }, -2.4, 2.4, GREEN);
        var link = seg(G, G.svg, 0, 0, 0, 0, '#7a8a99', 1.5, '3 3'), star = starAt(G, G.svg), rp = dot(G, G.svg, RED), gp = dot(G, G.svg, GREEN);
        var stars = [[4, 2], [-4, -2], [1.25, 1]], k = 0, row = el('div', 'row'), out = el('p', 'qtext'), stat = el('p', 'hint'); w.appendChild(row); w.appendChild(out); w.appendChild(stat);
        var x = 0;
        function upd() {
          x = +sl.value / 5; var y = F(x);
          setDot(G, rp, x, y); setDot(G, gp, y, x); setSeg(G, link, x, y, y, x);
          out.textContent = 'Red point on f: (' + fm(x) + ', ' + fm(y) + ')   ·   green mirror point: (' + fm(y) + ', ' + fm(x) + ')';
          star.setAttribute('x', G.px(stars[k][0])); star.setAttribute('y', G.py(stars[k][1]) + 9); star.textContent = '★';
          stat.textContent = 'Star ' + (k + 1) + ' of 3';
        }
        var sl = slider(row, 'Slide the red point', -12, 12, 1, 0, upd);
        sl.setAttribute('aria-valuetext', 'x value');
        checkBtn(ctl, 'Check: the green point is on the star', function () {
          var y = F(x), s = stars[k];
          if (Math.abs(y - s[0]) < 0.06 && Math.abs(x - s[1]) < 0.06) { k++; if (k === 3) { api.solve(); return; } upd(); }
          else api.miss('The green point is at (' + fm(y) + ', ' + fm(x) + '). The star is at (' + s[0] + ', ' + s[1] + '). Slide the red point until the mirror lands on the star.');
        });
        upd();
      } });

    /* ---- Station 2: swap the triangle ---- */
    LE.ask(card, { id: 'X2', type: 'custom', head: 'Station 2 · Swap rise and run', maxMiss: 8, answer: 3,
      prompt: 'The red triangle shows the slope of f at a point. Build the orange triangle at the mirror point so the orange line just touches the green curve. Press Check. There are three curves.',
      keyText: 'Task 1: rise 1, run 2. Task 2: rise 1, run 4. Task 3: rise 1, run 3 (rise and run swap).',
      worked: 'A mirror swaps rise and run. A slope of 4 over 1 becomes 1 over 4: the slopes are reciprocals.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: if f has slope m, the mirror has slope 1/m.')); return; }
        guide(w, 'The blue curve is f and the green curve is its inverse. The red triangle sits on f: its run is 1 and its rise is the slope. The orange triangle sits on the green curve, at the mirror point. Its run and rise are the two sliders.');
        var G = graph(w, { min: 0, max: 9, tick: 1, label: 'The curve f in blue with a red slope triangle, its inverse in green with an orange triangle you build, and the dashed mirror line' });
        var tasks = [{ name: 'f(x) = x²', f: function (t) { return t * t; }, a: 1, m: 2, tmax: 3 }, { name: 'f(x) = x²', f: function (t) { return t * t; }, a: 2, m: 4, tmax: 3 }, { name: 'f(x) = x³', f: function (t) { return t * t * t; }, a: 1, m: 3, tmax: 2.08 }];
        var layer = sv('g', {}, G.svg), k = 0, head = el('p', 'qtext'), row = el('div', 'row'), out = el('p', 'qtext'); w.appendChild(head); w.appendChild(row); w.appendChild(out);
        var run, rise, T, tri;
        function draw() {
          T = tasks[k]; while (layer.firstChild) layer.removeChild(layer.firstChild);
          path(G, layer, function (t) { return t; }, T.f, 0, T.tmax, BLUE); path(G, layer, T.f, function (t) { return t; }, 0, T.tmax, GREEN);
          var a = T.a, b = T.f(a);
          seg(G, layer, a, b, a + 1, b, RED, 3); seg(G, layer, a + 1, b, a + 1, b + T.m, RED, 3); seg(G, layer, a, b, a + 1, b + T.m, RED, 1.5, '4 3');
          sv('text', { x: G.px(a + 0.5), y: G.py(b) + 15, 'font-size': 12, 'text-anchor': 'middle', fill: RED }, layer).textContent = 'run 1';
          sv('text', { x: G.px(a + 1) + 5, y: G.py(b + T.m / 2) + 4, 'font-size': 12, fill: RED }, layer).textContent = 'rise ' + T.m;
          dot(G, layer, RED).setAttribute('cx', G.px(a)); layer.lastChild.setAttribute('cy', G.py(b));
          dot(G, layer, GREEN).setAttribute('cx', G.px(b)); layer.lastChild.setAttribute('cy', G.py(a));
          tri = { line: seg(G, layer, 0, 0, 0, 0, ORANGE, 2.5), h: seg(G, layer, 0, 0, 0, 0, ORANGE, 3), v: seg(G, layer, 0, 0, 0, 0, ORANGE, 3), tr: sv('text', { 'font-size': 12, 'text-anchor': 'middle', fill: ORANGE }, layer), ts: sv('text', { 'font-size': 12, fill: ORANGE }, layer) };
          head.textContent = 'Curve ' + (k + 1) + ' of 3: ' + T.name + ', at the point (' + a + ', ' + b + ').  The mirror point is (' + b + ', ' + a + ').';
          upd();
        }
        function upd() {
          var r = +run.value, s = +rise.value, b = T.f(T.a), a = T.a;
          setSeg(G, tri.line, b - 10 * r, a - 10 * s, b + 10 * r, a + 10 * s); setSeg(G, tri.h, b, a, b + r, a); setSeg(G, tri.v, b + r, a, b + r, a + s);
          tri.tr.setAttribute('x', G.px(b + r / 2)); tri.tr.setAttribute('y', G.py(a) + 15); tri.tr.textContent = 'run ' + r;
          tri.ts.setAttribute('x', G.px(b + r) + 5); tri.ts.setAttribute('y', G.py(a + s / 2) + 4); tri.ts.textContent = 'rise ' + s;
          out.textContent = 'Your orange line: rise ' + s + ' over run ' + r + '.';
        }
        run = slider(row, 'Orange run', 1, 12, 1, 1, upd); rise = slider(row, 'Orange rise', 1, 12, 1, 1, upd);
        checkBtn(ctl, 'Check: the orange line touches the green curve', function () {
          var r = +run.value, s = +rise.value;
          if (Math.abs(s / r - 1 / T.m) < 1e-9) { k++; if (k === 3) { api.solve(); return; } run.value = 1; rise.value = 1; run.nextSibling.textContent = '1'; rise.nextSibling.textContent = '1'; draw(); }
          else if (Math.abs(s / r - T.m) < 1e-9) api.miss('That copies the slope of f. The mirror swaps rise and run.');
          else api.miss('The orange line cuts the green curve instead of touching it. Compare with the red triangle on f.');
        });
        draw();
      } });

    /* ---- Station 3: flat becomes steep ---- */
    LE.ask(card, { id: 'X3', type: 'custom', head: 'Station 3 · Flat becomes steep', maxMiss: 8, answer: 0,
      prompt: 'Slide the point along f(x) = x³ and watch both tangent lines. Find the spot where the red tangent on f is flat, then press Check.',
      keyText: 'Slide to x = 0.',
      worked: 'At x = 0 the tangent on f is flat (slope 0). Its mirror is vertical: the slope would be 1/0, which is undefined.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: a flat tangent on f becomes a vertical tangent on the inverse.')); return; }
        guide(w, 'The blue curve is f(x) = x³. The green curve is its inverse. The red line touches f at the red point. The orange line touches the inverse at the green point. The numbers under the picture give both slopes.');
        var G = graph(w, { min: -3, max: 3, tick: 1, label: 'The curve y equals x cubed in blue, its inverse in green, a red tangent line on f and an orange tangent line on the inverse' });
        var F = function (t) { return t * t * t; };
        path(G, G.svg, function (t) { return t; }, F, -1.44, 1.44, BLUE); path(G, G.svg, F, function (t) { return t; }, -1.44, 1.44, GREEN);
        var tr = seg(G, G.svg, 0, 0, 0, 0, RED, 2.5), tg = seg(G, G.svg, 0, 0, 0, 0, ORANGE, 2.5), rp = dot(G, G.svg, RED), gp = dot(G, G.svg, GREEN);
        var row = el('div', 'row'), out = el('p', 'qtext'); w.appendChild(row); w.appendChild(out);
        function upd() {
          var x = +sl.value / 10, y = F(x), d = 3 * x * x, L = 1.3, n1 = Math.sqrt(1 + d * d);
          setDot(G, rp, x, y); setDot(G, gp, y, x);
          setSeg(G, tr, x - L / n1, y - L * d / n1, x + L / n1, y + L * d / n1);                    // direction (1, f')
          setSeg(G, tg, y - L * d / n1, x - L / n1, y + L * d / n1, x + L / n1);                    // mirror direction (f', 1)
          out.textContent = 'x = ' + fm(x) + '   ·   slope of f: ' + fm(d) + '   ·   slope of the inverse: ' + (d === 0 ? 'undefined (vertical)' : fm(1 / d));
        }
        var sl = slider(row, 'Slide the point', -14, 14, 1, 10, upd);
        checkBtn(ctl, 'Check: the red tangent is flat', function () {
          if (+sl.value === 0) api.solve(); else api.miss('The red tangent is not flat at x = ' + fm(+sl.value / 10) + '. Look at the red line and slide until it lies flat.');
        });
        upd();
      } });

    /* ---- Station 4: flip it (match the slope pairs) ---- */
    LE.ask(card, { id: 'X4', type: 'custom', head: 'Station 4 · Flip it', maxMiss: 8, answer: 4,
      prompt: 'Each slope on the left is the slope of f at a point. Each slope on the right is the slope of the inverse at the mirror point. Click a slope on the left, then its partner on the right.',
      keyText: '3 with 1/3, −2 with −1/2, 1/5 with 5, 4 with 1/4.',
      worked: 'Each pair is a number and its reciprocal, with the same sign.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: the slope of the inverse is the reciprocal of the slope of f.')); return; }
        guide(w, 'Two columns of slopes. The left column belongs to f. The right column belongs to its inverse at the mirror points. Pick one from each side that go together.');
        var pairs = [['3', '1/3'], ['−2', '−1/2'], ['1/5', '5'], ['4', '1/4']], order = LE.shuffle(pairs.map(function (_, i) { return i; }), LE.seedRng('x4:order'));
        var cols = el('div', 'row'), L = el('div'), R = el('div'), sel = -1, got = 0, bl = [], br = {};
        L.appendChild(el('p', 'qhead', 'Slope of f')); R.appendChild(el('p', 'qhead', 'Slope of the inverse'));
        pairs.forEach(function (p, i) { var b = el('button', 'opt', p[0]); b.type = 'button'; bl[i] = b; L.appendChild(b);
          b.onclick = function () { if (b.disabled) return; bl.forEach(function (x) { x.classList.remove('sel'); }); sel = i; b.classList.add('sel'); }; });
        order.forEach(function (i) { var b = el('button', 'opt', pairs[i][1]); b.type = 'button'; br[i] = b; R.appendChild(b);
          b.onclick = function () {
            if (b.disabled) return;
            if (sel < 0) { api.miss('Pick a slope on the left first.'); return; }
            if (sel === i) { b.classList.add('good'); bl[i].classList.remove('sel'); bl[i].classList.add('good'); b.disabled = true; bl[i].disabled = true; sel = -1; got++; if (got === pairs.length) api.solve(); }
            else { var s = sel; bl[s].classList.remove('sel'); sel = -1; api.miss(pairs[s][0] + ' and ' + pairs[i][1] + ' are not partners. Rise and run swap, then check the sign.'); }
          }; });
        cols.appendChild(L); cols.appendChild(R); cols.style.cssText = 'display:flex;gap:32px;flex-wrap:wrap'; w.appendChild(cols);
      } });
  } });
})();
