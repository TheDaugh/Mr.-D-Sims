/* Sim kit for the six slot-4 sims. Each sim page calls SK.boot(id, init). The page shell, the task card for the student's band, sliders,
   predict-first gates and a live free-body diagram come from here, so a sim file holds only its own physics.
   Colors are page tokens (lesson.css): ink, accent, warn. Physics constants come from FBD_V2 (g = 9.8 m/s²).
   ?band=N picks the task card (the lesson passes it; students never see a band name). With no band, or with #key, the page offers every task. */
(function () {
  'use strict';
  var V = window.FBD_V2, SK = window.SK = { g: V.g, V: V };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  SK.el = el;
  SK.f = function (x, d) { return (+x).toFixed(d == null ? 1 : d); };
  SK.near = function (a, b, tol) { return Math.abs(a - b) <= Math.max(Math.abs(b) * (tol == null ? 0.02 : tol), 0.011); };
  var KEY = /(^|[#&])key\b/.test(location.hash), BAND = +((/[?&]band=(\d)/.exec(location.search) || [])[1] || 0);

  /* shell: header, task card, stage (left), side panel (right). init(ctx) runs again when the task changes. */
  SK.boot = function (id, init) {
    var def = V.SIMS.filter(function (s) { return s.id === id; })[0], app = document.getElementById('app');
    document.title = def.title + ' · Mr. D';
    app.className = 'sk'; app.appendChild(el('h1', null, def.title));
    var tabs = el('div', 'row'), task = el('p', 'sk-task'), grid = el('div', 'sk-grid'), stage = el('div', 'sk-stage'), side = el('div', 'sk-side');
    app.appendChild(tabs); app.appendChild(task); app.appendChild(grid); grid.appendChild(stage); grid.appendChild(side);
    function go(b) {
      stage.textContent = ''; side.textContent = '';
      var keys = def.bands.slice(); var tb = keys.filter(function (k) { return k <= b; }).pop() || keys[0];
      task.innerHTML = '<b>Your task.</b> '; task.appendChild(document.createTextNode(def.task[tb]));
      Array.prototype.forEach.call(tabs.children, function (x) { x.setAttribute('aria-pressed', String(+x.dataset.b === tb)); });
      init({ band: tb, stage: stage, side: side, def: def });
    }
    if (!BAND || KEY) def.bands.forEach(function (b, i) { var x = el('button', 'btn small', 'Task ' + (i + 1)); x.type = 'button'; x.dataset.b = b; x.onclick = function () { go(b); }; tabs.appendChild(x); });
    go(BAND || def.bands[0]);
    if (KEY) { var k = el('p', 'hint', 'Idea: ' + def.aha); app.appendChild(k); }
  };

  SK.slider = function (parent, o) {
    var row = el('label', 'sk-sl'), name = el('span', null, o.label + ' '), val = el('b'), inp = el('input'); inp.type = 'range'; inp.min = o.min; inp.max = o.max; inp.step = o.step; inp.value = o.value;
    function show() { val.textContent = SK.f(inp.value, o.digits == null ? (o.step < 1 ? 2 : 0) : o.digits) + (o.unit ? ' ' + o.unit : ''); }
    inp.oninput = function () { show(); if (o.onInput) o.onInput(+inp.value); }; show();
    name.appendChild(val); row.appendChild(name); row.appendChild(inp); parent.appendChild(row);
    return { get: function () { return +inp.value; }, set: function (v) { inp.value = v; show(); }, input: inp, row: row };
  };
  SK.button = function (parent, text, fn) { var b = el('button', 'btn', text); b.type = 'button'; b.onclick = fn; parent.appendChild(b); return b; };

  /* predict-first gate: a number box. Nothing hidden behind it appears until Commit. */
  SK.askNum = function (parent, o) {
    var box = el('div', 'sk-gate'), p = el('p', null, o.prompt), row = el('div', 'row'), inp = el('input'), btn = el('button', 'btn primary', 'Commit'), msg = el('p', 'msg');
    inp.type = 'text'; inp.inputMode = 'decimal'; inp.setAttribute('aria-label', o.label || 'Your prediction'); inp.style.width = '8em'; btn.type = 'button';
    row.appendChild(inp); if (o.unit) row.appendChild(el('span', null, o.unit)); row.appendChild(btn); box.appendChild(p); box.appendChild(row); box.appendChild(msg); parent.appendChild(box);
    var G = { done: false, ok: false, val: null, box: box };
    btn.onclick = function () {
      var v = parseFloat(String(inp.value).replace(/−/g, '-')); if (!isFinite(v)) { msg.className = 'msg bad'; msg.textContent = 'Enter a number first.'; return; }
      G.done = true; G.val = v; G.ok = SK.near(v, o.answer, o.tol); inp.disabled = btn.disabled = true;
      msg.className = 'msg ' + (G.ok ? 'ok' : 'bad'); msg.textContent = (G.ok ? 'Close. ' : 'Not quite. ') + 'You committed ' + SK.f(v, 2) + (o.unit ? ' ' + o.unit : '') + '. The sim says ' + SK.f(o.answer, 2) + (o.unit ? ' ' + o.unit : '') + '.';
      if (o.onDone) o.onDone(G);
    };
    return G;
  };
  SK.askChoice = function (parent, o) {
    var box = el('div', 'sk-gate'), p = el('p', null, o.prompt), list = el('div', 'opts'), msg = el('p', 'msg'), G = { done: false, ok: false, pick: null, box: box };
    box.appendChild(p); box.appendChild(list); box.appendChild(msg); parent.appendChild(box);
    o.options.forEach(function (t, i) { var b = el('button', 'opt', t); b.type = 'button'; b.onclick = function () { if (G.done) return; G.done = true; G.pick = i; G.ok = i === o.answer; Array.prototype.forEach.call(list.children, function (x, k) { x.disabled = true; if (k === o.answer) x.classList.add('good'); else if (k === i) x.classList.add('bad'); }); msg.className = 'msg ' + (G.ok ? 'ok' : 'bad'); msg.textContent = (G.ok ? 'Yes. ' : 'Not this time. ') + (o.why || ''); if (o.onDone) o.onDone(G); }; list.appendChild(b); });
    return G;
  };

  /* live free-body diagram. forces: [{dir:'up|down|left|right', N, label, kind:'w|c|f'}]; arrow length is proportional to N (px per newton from o.scale, or auto). */
  var VEC = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }, COL = { w: 'var(--ink)', c: 'var(--accent)', f: 'var(--warn)' };
  SK.fbd = function (forces, o) {
    o = o || {}; var W = o.w || 520, H = o.h || 340, cx = W / 2, cy = H / 2, bw = o.bw || 84, bh = o.bh || 52, mx = 0, out = '';
    forces.forEach(function (f) { mx = Math.max(mx, f.N); });
    var auto = mx ? Math.min((H / 2 - bh / 2 - 34) / mx, (W / 2 - bw / 2 - 56) / mx) : 1, sc = o.scale ? Math.min(o.scale, auto) : auto;   // a given scale is an upper bound: an arrow never leaves the canvas
    out += '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (o.alt || 'Free-body diagram') + '" style="width:100%;height:auto;max-width:' + W + 'px">';
    out += '<rect x="' + (cx - bw / 2) + '" y="' + (cy - bh / 2) + '" width="' + bw + '" height="' + bh + '" rx="5" style="fill:var(--stage);stroke:var(--accent)" stroke-width="2.5"/>';
    forces.forEach(function (f) {
      if (!(f.N > 0.001)) return;
      var d = VEC[f.dir], L = Math.max(10, f.N * sc), col = COL[f.kind || 'c'], off = f.off || 0;
      var x1 = cx + d[0] * bw / 2 + (d[1] ? off : 0), y1 = cy + d[1] * bh / 2 + (d[0] ? off : 0), x2 = x1 + d[0] * L, y2 = y1 + d[1] * L, hx = d[1] ? 7 : 0, hy = d[0] ? 7 : 0;
      out += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x2 - d[0] * 9) + '" y2="' + (y2 - d[1] * 9) + '" stroke-width="5" stroke-linecap="round" style="stroke:' + col + '"/>';
      out += '<polygon points="' + x2 + ',' + y2 + ' ' + (x2 - d[0] * 15 + hx) + ',' + (y2 - d[1] * 15 + hy) + ' ' + (x2 - d[0] * 15 - hx) + ',' + (y2 - d[1] * 15 - hy) + '" style="fill:' + col + '"/>';
      var tx = x2 + d[0] * 6 + (d[1] ? 10 : 0), ty = y2 + d[1] * (d[1] > 0 ? 18 : -8) + (d[0] ? -9 : 5), an = d[0] < 0 ? 'end' : 'start';
      out += '<text x="' + tx + '" y="' + ty + '" font-size="16" font-weight="700" text-anchor="' + an + '" style="fill:' + col + '">' + f.label + ' = ' + SK.f(f.N, f.N < 10 ? 2 : 1) + ' N</text>';
    });
    return out + '</svg>';
  };
  /* end-of-axis numbers for a plot: x0,x1 at pixel xs; y0,y1 at pixel ys (viewBox units) */
  SK.ticks = function (xl, xr, yb, yt, vx0, vx1, vy0, vy1, dx, dy) {
    function t(x, y, s, an) { return '<text x="' + x + '" y="' + y + '" font-size="14" text-anchor="' + an + '" style="fill:var(--muted)">' + s + '</text>'; }
    return t(xl, yb + 16, SK.f(vx0, dx || 0), 'middle') + t(xr, yb + 16, SK.f(vx1, dx || 0), 'middle') + t(xl - 6, yb + 4, SK.f(vy0, dy || 0), 'end') + t(xl - 6, yt + 5, SK.f(vy1, dy || 0), 'end');
  };
  var css = el('style'); css.textContent = '.sk{max-width:1260px;margin:0 auto}.sk h1{font-size:1.5rem;margin:.1rem 0 .4rem}.sk-task{margin:.3rem 0 .6rem;padding:8px 12px;border-left:4px solid var(--accent);background:var(--stage);border-radius:0 8px 8px 0}' +
    '.sk-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:16px;align-items:start}.sk-stage{border:1px solid var(--line);border-radius:8px;background:var(--surface);padding:8px;min-width:0}.sk-side{display:flex;flex-direction:column;gap:10px;min-width:0}' +
    '.sk-sl{display:flex;flex-direction:column;gap:2px;font-size:.95rem}.sk-sl input{width:100%}.sk-gate{border:1px solid var(--line);border-radius:8px;padding:8px 12px;background:var(--surface)}.sk-gate p{margin:.2rem 0}' +
    '.sk-read{font:600 1rem var(--mono);padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--stage)}.sk-read b{color:var(--accent)}.sk-hidden{color:var(--muted);font-style:italic}' +
    '.sk svg text{font-family:var(--body)}@media (max-width:900px){.sk-grid{grid-template-columns:1fr}}';
  document.head.appendChild(css);
})();
