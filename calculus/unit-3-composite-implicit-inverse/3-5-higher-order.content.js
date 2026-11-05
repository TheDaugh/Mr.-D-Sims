/* LESSON (calculus 3.5): the wiring is LK.standard (physics/lessons/engine/standard.js, selfPaced branch). Edit spec.js for the teaching.
   This file draws the Explore tab: four hands-on stations (X1 to X4), solved in order. Every picture has a "How to read it" line. No arithmetic: the student moves things and reads what the picture says. */
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
  var F0 = function (x) { return x * x * x / 3 - x; }, F1 = function (x) { return x * x - 1; }, F2 = function (x) { return 2 * x; };

  LK.standard(window.SPECS['3-5-higher-order'], { prefix: 'HOD', explore: function (card) {
    card.appendChild(el('p', 'qtext', 'Four stations, in order. Move things with the sliders and buttons. There is no clock: take your time, and if you stop, your work is saved on this device for tomorrow.'));

    /* ---- Station 1: slope of the slope ---- */
    LE.ask(card, { id: 'X1', type: 'custom', head: 'Station 1 · The slope of the slope', maxMiss: 8, answer: 3,
      prompt: 'Two graphs share one slider. The top graph is f. The bottom graph is f′, the slope of f. Do the three jobs.',
      keyText: 'Job 1: x = −1. Job 2: x = 1. Job 3: x = 0 (the red tangent on f′ is flat).',
      worked: 'f′ = 0 where f has a flat tangent (x = ±1). f″ is the slope of f′, and f′ has its lowest point, with a flat tangent, at x = 0, so f″(0) = 0.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: f′ is the slope of f, and f″ is the slope of f′. Flat tangent on f means f′ = 0. Flat tangent on f′ means f″ = 0.')); return; }
        guide(w, 'Blue is f (top). Green is f′ (bottom). The red dot and red tangent ride on f. The orange dot and orange tangent ride on f′ at the same x. The numbers under the pictures are the slopes of the two tangents.');
        var box = el('div', 'row'); w.appendChild(box);
        var A = graph(box, { min: -4, max: 4, tick: 2, label: 'The top graph f, a cubic in blue, with a red dot and tangent' }), B = graph(box, { min: -4, max: 4, tick: 2, label: 'The bottom graph f prime, a parabola in green, with an orange dot and tangent' });
        path(A, A.svg, function (t) { return t; }, F0, -2.2, 2.2, BLUE); path(B, B.svg, function (t) { return t; }, F1, -2.2, 2.2, GREEN);
        var ta = seg(A, A.svg, RED), tb = seg(B, B.svg, ORANGE), da = dot(A.svg, RED), db = dot(B.svg, ORANGE);
        var head = el('p', 'qtext'), row = el('div', 'row'), out = el('p', 'qtext'); w.appendChild(head); w.appendChild(row); w.appendChild(out);
        var x = 0, k = 0, jobs = ['Job 1 of 3: put x where f has a flat tangent, on the LEFT side (x below 0).', 'Job 2 of 3: put x where f has a flat tangent, on the RIGHT side (x above 0).', 'Job 3 of 3: put x where the tangent on the bottom graph f′ is flat.'];
        function upd() { x = +sl.value / 20; setDot(A, da, x, F0(x)); tangent(A, ta, x, F0(x), F1(x), 0.9); setDot(B, db, x, F1(x)); tangent(B, tb, x, F1(x), F2(x), 0.9);
          out.textContent = 'x = ' + fm(x) + '   ·   slope of f (that is f′): ' + fm(F1(x)) + '   ·   slope of f′ (that is f″): ' + fm(F2(x)); }
        var sl = slider(row, 'Slide x', -44, 44, 1, 30, upd);
        checkBtn(ctl, 'Check: this job is done', function () {
          var ok = k === 0 ? Math.abs(x + 1) < 0.06 : k === 1 ? Math.abs(x - 1) < 0.06 : Math.abs(x) < 0.06;
          if (ok) { k++; if (k === 3) { api.solve(); return; } head.textContent = jobs[k]; }
          else api.miss(k < 2 ? 'The slope of f is ' + fm(F1(x)) + ' here. A flat tangent needs slope 0. ' + (k === 0 ? 'Stay on the left side.' : 'Stay on the right side.') : 'The slope of f′ is ' + fm(F2(x)) + ' here. You want a flat orange tangent: slope 0.');
        });
        head.textContent = jobs[0]; upd();
      } });

    /* ---- Station 2: match the trio ---- */
    LE.ask(card, { id: 'X2', type: 'custom', head: 'Station 2 · Match the trio', maxMiss: 9, answer: 3,
      prompt: 'Three graphs are the function f, its derivative f′, and its second derivative f″. They are mixed up and have letters. Say which letter is which.',
      keyText: 'f is the cubic, f′ is the parabola, f″ is the line. (The letters are shuffled for each student.)',
      worked: 'The slope of the cubic f is 0 at its hump and its dip, and the parabola f′ is 0 at those same x values. The slope of the parabola f′ is 0 at its lowest point, and the line f″ is 0 at that same x.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: each graph in the chain is the slope of the one before it.')); return; }
        guide(w, 'Three graphs of one chain: a function, then its derivative, then its derivative again. Look for the x values where one graph has a flat tangent, and check where the next graph touches the x-axis.');
        var fns = [F0, F1, F2], order = LE.shuffle([0, 1, 2], LE.seedRng('x2:order')), box = el('div', 'row'), names = ['f', 'f′', 'f″'], letters = ['A', 'B', 'C'], k = 0;
        w.appendChild(box);
        order.forEach(function (fi, i) { var wrap = el('div'); wrap.style.cssText = 'flex:1 1 150px;max-width:200px'; box.appendChild(wrap);
          var G = graph(wrap, { min: -4, max: 4, tick: 4, label: 'Graph ' + letters[i] }); path(G, G.svg, function (t) { return t; }, fns[fi], -2, 2, [BLUE, GREEN, ORANGE][i]);
          sv('text', { x: 14, y: 22, 'font-size': 20, 'font-weight': 700, fill: '#142230' }, G.svg).textContent = letters[i]; wrap.style.cssText += ';min-width:0'; });
        var head = el('p', 'qtext'), tail = el('div'); w.appendChild(head); w.appendChild(tail);
        var hints = ['Which graph is f? Hint: f is the one whose slope is flat twice. Its graph has a hump and a dip.', 'Which graph is f′? Hint: f′ is 0 at the x values where f has flat tangents.', 'Which graph is f″? Hint: f″ is 0 where f′ has its flat tangent, at its lowest point.'];
        function ask() {
          tail.innerHTML = ''; head.textContent = hints[k];
          var row = el('div', 'row'); tail.appendChild(row);
          letters.forEach(function (L, i) { var b = el('button', 'btn', 'Graph ' + L); b.type = 'button'; b.onclick = function () {
            if (order[i] === k) { b.classList.add('good'); k++; if (k === 3) { tail.innerHTML = ''; head.textContent = 'All three matched.'; api.solve(); } else ask(); }
            else api.miss('Not that one. This graph is ' + names[order[i]] + ', not ' + names[k] + '. ' + (k === 0 ? 'Count the flat spots on each graph.' : 'Line up the flat tangents with where the next graph crosses the x-axis.')); };
            row.appendChild(b); });
        }
        ask();
      } });

    /* ---- Station 3: sine wheel ---- */
    LE.ask(card, { id: 'X3', type: 'custom', head: 'Station 3 · The sine wheel', maxMiss: 8, answer: 2,
      prompt: 'Press Next derivative again and again. Watch the pattern. Then answer two questions.',
      keyText: 'The pattern sin, cos, −sin, −cos repeats every 4. The 7th derivative of sin x is −cos x.',
      worked: 'After 4 derivatives you are back at sin x. 7 leaves remainder 3 when divided by 4, so the 7th derivative is the third step: −cos x.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: sin, cos, −sin, −cos repeat every 4 derivatives.')); return; }
        guide(w, 'The blue curve is the current function. The label shows which derivative this is. Each press takes the derivative of the curve you see.');
        var G = graph(w, { min: -4, max: 4, tick: 2, label: 'The current function, one of sine, cosine, negative sine, negative cosine' });
        var fs = [Math.sin, Math.cos, function (t) { return -Math.sin(t); }, function (t) { return -Math.cos(t); }], nm = ['sin x', 'cos x', '−sin x', '−cos x'], n = 0, pathEl, lab = el('p', 'qtext'), tail = el('div');
        function draw() { if (pathEl) pathEl.remove(); pathEl = path(G, G.svg, function (t) { return t; }, fs[n % 4], -4, 4, BLUE);
          lab.textContent = n === 0 ? 'f(x) = sin x' : 'derivative number ' + n + ': ' + nm[n % 4]; }
        w.appendChild(lab); w.appendChild(tail);
        var btn = checkBtn(ctl, 'Next derivative', function () { n++; draw(); if (n === 4 && !tail.firstChild) { tail.appendChild(el('p', 'qtext', 'Back at sin x. Now answer.')); ask1(); } });
        function ask1() {
          var q = el('p', 'qtext', 'Question 1 of 2: how many derivatives until the pattern repeats?'); tail.appendChild(q);
          choices(tail, ['4', '2', '3', '8'], 'x3:q1', function (i, b) { if (i === 0) { b.classList.add('good'); ask2(); } else api.miss('Count the presses from sin x back to sin x.'); });
        }
        function ask2() {
          tail.innerHTML = ''; tail.appendChild(el('p', 'qtext', 'Question 2 of 2: what is the 7th derivative of sin x? Keep pressing, or use the remainder of 7 divided by 4.'));
          choices(tail, ['−cos x', 'cos x', 'sin x', '−sin x'], 'x3:q2', function (i, b) { if (i === 0) { b.classList.add('good'); btn.disabled = true; api.solve(); } else api.miss('Press the button until derivative number 7 and read the label.'); });
        }
        draw();
      } });

    /* ---- Station 4: three machines ---- */
    LE.ask(card, { id: 'X4', type: 'custom', head: 'Station 4 · Three machines', maxMiss: 8, answer: 3,
      prompt: 'Each machine takes a derivative every time you press its button. Press each one at least 5 times. Then say how each one behaves.',
      keyText: 'x⁴ + 3x² ends at 0. e^(2x) multiplies by 2 each time. 1/x keeps changing and never reaches 0.',
      worked: 'A polynomial loses a degree each time, so it ends at 0. Each derivative of e^(2x) multiplies it by 2. 1/x = x^(−1) gives −x^(−2), then 2x^(−3), and so on: the power only gets more negative, so it never reaches 0.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: polynomials end at 0, e^(kx) multiplies by k each time, 1/x never stops changing.')); return; }
        guide(w, 'Each box shows the current function. The button takes its derivative. The list under it keeps the steps.');
        var M = [{ name: 'Machine A', steps: ['x⁴ + 3x²', '4x³ + 6x', '12x² + 6', '24x', '24', '0', '0'] }, { name: 'Machine B', steps: ['e^(2x)', '2e^(2x)', '4e^(2x)', '8e^(2x)', '16e^(2x)', '32e^(2x)', '64e^(2x)'] }, { name: 'Machine C', steps: ['1/x', '−1/x²', '2/x³', '−6/x⁴', '24/x⁵', '−120/x⁶', '720/x⁷'] }], used = 0, tail = el('div'), box = el('div', 'row');
        w.appendChild(box); w.appendChild(tail);
        M.forEach(function (m) { m.n = 0; var c = el('div'); c.style.cssText = 'flex:1 1 150px;border:1px solid var(--line);border-radius:8px;padding:8px'; c.appendChild(el('b', null, m.name)); m.out = el('p', 'qtext', ''); c.appendChild(m.out);
          var b = el('button', 'btn', 'Next derivative'); b.type = 'button'; c.appendChild(b); m.b = b; box.appendChild(c);
          function show() { m.out.innerHTML = ''; m.steps.slice(0, m.n + 1).forEach(function (s, i) { m.out.appendChild(document.createTextNode((i === 0 ? 'f = ' : 'derivative ' + i + ' = ') + s)); m.out.appendChild(document.createElement('br')); }); }
          b.onclick = function () { if (m.n < 6) { m.n++; show(); } if (M.every(function (q) { return q.n >= 5; }) && !tail.firstChild) ask(); }; show(); });
        var opts = ['ends at 0', 'repeats', 'multiplies by 2 each time', 'keeps changing and never reaches 0'], right = [0, 2, 3], j = 0;
        function ask() { tail.innerHTML = ''; tail.appendChild(el('p', 'qtext', M[j].name + ': how does it behave as you keep going?'));
          choices(tail, opts, 'x4:' + j, function (i, bt) { if (i === right[j]) { bt.classList.add('good'); j++; if (j === 3) { tail.innerHTML = ''; api.solve(); } else ask(); } else api.miss('Look at the steps for ' + M[j].name + ' again. What happens by derivative 5?'); }); }
      } });
  } });
})();
