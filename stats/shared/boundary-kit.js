/* NK.boundary(host, opts): slide one boundary on a normal curve whose axis is the DATA (minutes, points), until the shaded area on the left matches a target.
   Load after normal-kit.js and normal-figure.js. Not z steps: NK.curve works in z, this sim works in the units of the pretend data.
     opts: { mean:30, sd:6, units:'minutes', target:0.9, tol:0.01, start:18, step:0.1, arrow:0.5, label }
   The area stays hidden until the student presses Commit. Moving the boundary after a commit hides it again.
   Keys on the marker: arrows move 0.5, Home / End go to the ends, PageUp / PageDown move 3. A drag snaps to 0.1.
     b.value()  b.committed()  b.setValue(v)  b.commit()  b.on('commit', fn)   fn gets { value, area, target, ok, direction } direction: 'right' | 'left' | null
   A commit is "ok" when the area is within tol of the target (area 0.01 by default). */
(function () {
  'use strict';
  var NK = window.NK, NF = window.NormalFigure, G = NF.geom, NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, text) { var x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; }
  function sv(tag, attrs, parent) { var x = document.createElementNS(NS, tag); for (var k in attrs) x.setAttribute(k, attrs[k]); if (parent) parent.appendChild(x); return x; }
  var r1 = function (x) { return Math.round(x * 10 + 1e-9) / 10; }, clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  NK.boundary = function (host, o) {
    o = Object.assign({ mean: 30, sd: 6, units: 'minutes', target: 0.9, tol: 0.01, step: 0.1, arrow: 0.5, label: 'A normal curve with a boundary you can slide' }, o || {});
    var lo = o.mean + G.ZMIN * o.sd, hi = o.mean + G.ZMAX * o.sd, v = r1(clamp(o.start != null ? o.start : o.mean - 2 * o.sd, lo, hi)), done = false, hand = {}, self = { el: null };
    var zOf = function (x) { return (x - o.mean) / o.sd; }, px = function (x) { return G.X(zOf(x)); }, area = function (x) { return Math.round(NF.cdf(zOf(x)) * 1e4) / 1e4; };
    var wrap = el('div', 'nk-boundary'), svg = sv('svg', { viewBox: '0 0 ' + G.W + ' ' + G.H, role: 'img', 'aria-label': o.label, 'class': 'nk-svg' }, wrap);
    var fill = sv('path', { fill: '#cfe0ff', stroke: 'none' }, svg);
    sv('path', { d: G.curve(G.ZMIN, G.ZMAX), fill: 'none', stroke: '#2b4fd9', 'stroke-width': 3 }, svg);
    sv('line', { x1: G.X0, x2: G.X1, y1: G.BASE, y2: G.BASE, stroke: '#7a8a99', 'stroke-width': 1.5 }, svg);
    sv('line', { x1: G.X(0), x2: G.X(0), y1: G.Y(0), y2: G.BASE, stroke: '#142230', 'stroke-width': 2 }, svg);
    for (var k = -3; k <= 3; k++) {
      sv('line', { x1: G.X(k), x2: G.X(k), y1: G.BASE, y2: G.BASE + 5, stroke: '#7a8a99', 'stroke-width': 1.5 }, svg);
      sv('text', { x: G.X(k), y: G.BASE + 20, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: '#142230' }, svg).textContent = +(o.mean + k * o.sd).toFixed(2);
    }
    sv('text', { x: G.X1, y: G.BASE - 6, 'text-anchor': 'end', 'font-size': 12, fill: '#566170' }, svg).textContent = o.units;
    var g = sv('g', { 'class': 'nk-marker', tabindex: 0, role: 'slider', 'aria-label': 'Boundary, in ' + o.units, 'aria-valuemin': r1(lo), 'aria-valuemax': r1(hi) }, svg);
    sv('line', { y1: G.TOP - 8, y2: G.BASE, 'class': 'nk-mline' }, g);
    sv('circle', { r: 11, cy: G.TOP - 8, 'class': 'nk-mdot' }, g);
    var tx = sv('text', { y: G.TOP - 24, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#b3412e' }, g);
    var readout = el('p', 'nk-readout'); readout.setAttribute('aria-live', 'polite'); wrap.appendChild(readout);
    var btn = el('button', 'nk-btn', 'Commit'); btn.type = 'button'; wrap.appendChild(btn);

    function draw() {
      g.setAttribute('transform', 'translate(' + px(v).toFixed(1) + ',0)'); g.setAttribute('aria-valuenow', v);
      fill.setAttribute('d', G.region(G.ZMIN, zOf(v)));
      tx.textContent = done ? v : '';
      if (!done) { readout.textContent = 'Slide the boundary, then press Commit.'; readout.classList.add('nk-hidden'); btn.hidden = false; }
    }
    function set(x) {
      x = r1(clamp(x, lo, hi)); if (x === v) return; v = x;
      if (done) done = false;
      draw();
    }
    function commit() {
      done = true; var a = area(v), ok = Math.abs(a - o.target) <= o.tol, dir = ok ? null : (a < o.target ? 'right' : 'left');
      draw(); btn.hidden = true; readout.classList.remove('nk-hidden');
      readout.textContent = 'Boundary: ' + v + ' ' + o.units + '. Area to the left: ' + a.toFixed(4) + ' (' + (a * 100).toFixed(1) + '%).';
      var r = { value: v, area: a, target: o.target, ok: ok, direction: dir };
      (hand.commit || []).forEach(function (f) { f(r); }); return r;
    }
    var dragging = false;
    function svgX(ev) { var r = svg.getBoundingClientRect(); return (ev.clientX - r.left) / r.width * G.W; }
    function fromX(x) { return o.mean + (G.ZMIN + (x - G.X0) / (G.X1 - G.X0) * (G.ZMAX - G.ZMIN)) * o.sd; }
    g.style.touchAction = 'none'; g.style.cursor = 'ew-resize';
    g.addEventListener('pointerdown', function (ev) { dragging = true; g.setPointerCapture(ev.pointerId); ev.preventDefault(); g.focus(); });
    g.addEventListener('pointermove', function (ev) { if (dragging) set(fromX(svgX(ev))); });
    var end = function () { dragging = false; }; g.addEventListener('pointerup', end); g.addEventListener('pointercancel', end);
    g.addEventListener('keydown', function (ev) {
      var d = { ArrowLeft: -o.arrow, ArrowDown: -o.arrow, ArrowRight: o.arrow, ArrowUp: o.arrow, PageDown: -3, PageUp: 3 }[ev.key];
      if (ev.key === 'Home') { set(lo); ev.preventDefault(); } else if (ev.key === 'End') { set(hi); ev.preventDefault(); } else if (d != null) { set(v + d); ev.preventDefault(); }
      else if (ev.key === 'Enter' && !done) { commit(); ev.preventDefault(); }
    });
    btn.onclick = commit;
    self.el = wrap; self.svg = svg; self.value = function () { return v; }; self.committed = function () { return done; }; self.setValue = set; self.commit = commit;
    self.on = function (n, f) { (hand[n] = hand[n] || []).push(f); return self; };
    host.appendChild(wrap); draw(); return self;
  };
})();
