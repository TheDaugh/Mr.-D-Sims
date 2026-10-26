/* Friction Ramp (bands 3 and 4). A push ramps up on a block. Friction matches the push until mu_s N, then drops to mu_k N.
   The friction-against-push plot stays hidden until the student commits a prediction. */
SK.boot('friction', function (ctx) {
  var g = SK.g, band = ctx.band, stage = ctx.stage, side = ctx.side, el = SK.el, F = 0, moving = false, running = false, timer = null, trace = [], revealed = false;
  var fig = el('div'), plot = el('div'); stage.appendChild(fig); stage.appendChild(plot);
  var ctl = el('div'); side.appendChild(ctl);
  var m, mus, muk;
  function Nn() { return m.get() * g; }
  function reset() { F = 0; moving = false; trace = []; stop(); draw(); }
  m = SK.slider(ctl, { label: 'Mass', min: 2, max: 10, step: 1, value: 5, unit: 'kg', digits: 0, onInput: function () { reset(); newGate(); } });
  mus = SK.slider(ctl, { label: 'Static coefficient μs', min: 0.3, max: 0.8, step: 0.05, value: 0.5, digits: 2, onInput: function () { if (muk.get() >= mus.get()) muk.set(Math.max(0.1, mus.get() - 0.1)); reset(); newGate(); } });
  muk = SK.slider(ctl, { label: 'Kinetic coefficient μk', min: 0.1, max: 0.7, step: 0.05, value: 0.3, digits: 2, onInput: function () { if (muk.get() >= mus.get()) muk.set(Math.max(0.1, mus.get() - 0.05)); reset(); newGate(); } });
  var pushS = SK.slider(ctl, { label: 'Push F', min: 0, max: 80, step: 1, value: 0, unit: 'N', digits: 0, onInput: function (v) { F = v; step(0); } });
  var row = el('div', 'row'); ctl.appendChild(row);
  var go = SK.button(row, 'Ramp up the push', function () { if (!revealed) return; running = true; timer = setInterval(function () { step(0.5); if (F >= 80) stop(); }, 50); });
  SK.button(row, 'Reset', reset);
  var read = el('div', 'sk-read'), host = el('div'), ans = el('div'); side.appendChild(read); side.appendChild(host); side.appendChild(ans);
  function stop() { running = false; clearInterval(timer); }
  function fric() { var lim = mus.get() * Nn(); if (!moving && F > lim) moving = true; return moving ? muk.get() * Nn() : F; }
  function step(dF) { F = Math.min(80, F + dF); pushS.set(F); var f = fric(); if (revealed) trace.push([F, f]); draw(); }
  function draw() {
    var f = fric(), mm = m.get();
    fig.innerHTML = SK.fbd([{ dir: 'up', N: Nn(), label: 'N', kind: 'c' }, { dir: 'down', N: Nn(), label: 'W', kind: 'w' }, { dir: 'right', N: F, label: 'F', kind: 'c' }, { dir: 'left', N: f, label: 'f', kind: 'f' }], { scale: 1.1, alt: 'Free-body diagram of the block' });
    var a = moving ? (F - f) / mm : 0;
    read.innerHTML = 'Push F: <b>' + SK.f(F) + ' N</b><br>Friction f: <b>' + SK.f(f) + ' N</b><br>' + (moving ? 'Sliding: a = <b>' + SK.f(a, 2) + ' m/s²</b>' : 'Not moving: a = <b>0</b>');
    drawPlot();
  }
  function drawPlot() {
    if (!revealed) { plot.innerHTML = '<p class="sk-hidden" style="padding:16px">The friction plot appears after you commit your prediction.</p>'; return; }
    var W = 640, H = 250, X = function (v) { return 56 + v / 80 * (W - 76); }, Y = function (v) { return H - 38 - v / 60 * (H - 60); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px" role="img" aria-label="Friction against push"><line x1="56" y1="' + (H - 38) + '" x2="' + (W - 14) + '" y2="' + (H - 38) + '" style="stroke:var(--muted)"/><line x1="56" y1="12" x2="56" y2="' + (H - 38) + '" style="stroke:var(--muted)"/>';
    s += '<text x="' + (W / 2) + '" y="' + (H - 8) + '" font-size="14" text-anchor="middle" style="fill:var(--ink)">push F (N)</text><text x="14" y="' + (H / 2) + '" font-size="14" text-anchor="middle" transform="rotate(-90 14 ' + (H / 2) + ')" style="fill:var(--ink)">friction f (N)</text>';
    if (trace.length) s += '<polyline fill="none" stroke-width="3.5" points="' + trace.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(Math.min(60, p[1])).toFixed(1); }).join(' ') + '" style="stroke:var(--accent)"/>';
    plot.innerHTML = s + SK.ticks(X(0), X(80), H - 38, 12, 0, 80, 0, 60, 0, 0) + '<circle cx="' + X(F) + '" cy="' + Y(Math.min(60, fric())) + '" r="6" style="fill:var(--warn)"/></svg>';
  }
  function newGate() {
    host.textContent = ''; ans.textContent = ''; revealed = false; go.disabled = true; draw();
    var lim = mus.get() * Nn(), P = Math.round(0.6 * lim);
    var q = band === 3 ? { prompt: 'A ' + m.get() + ' kg block, μs = ' + SK.f(mus.get(), 2) + '. You push with ' + P + ' N, below the limit, and it does not move. How big is the friction?', unit: 'N', answer: P }
      : { prompt: 'Predict the largest friction force this block can get before it starts to slide.', unit: 'N', answer: lim };
    SK.askNum(host, { prompt: q.prompt, unit: q.unit, answer: q.answer, tol: 0.03, onDone: function () { revealed = true; go.disabled = false; draw(); if (band === 4) readMu(); } });
  }
  function readMu() {
    ans.appendChild(el('p', null, 'Ramp the push up, then read the plot: the top of the climb and the level after the drop.'));
    SK.askNum(ans, { prompt: 'Find μs from the top of the climb. (μs = f / N, with N = mg.)', answer: mus.get(), tol: 0.06, label: 'μs' });
    SK.askNum(ans, { prompt: 'Find μk from the level after the drop.', answer: muk.get(), tol: 0.06, label: 'μk' });
  }
  newGate();
});
