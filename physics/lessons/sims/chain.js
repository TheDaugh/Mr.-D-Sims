/* Chain at the Table Edge (band 6). A uniform chain on a frictionless table, y hanging over the edge: only the hanging part pulls, so a = g y / L.
   Then y'' = (g/L) y and y(t) = y0 cosh(sqrt(g/L) t). The y(t) plot stays hidden until the student commits a prediction. */
SK.boot('chain', function (ctx) {
  var g = SK.g, stage = ctx.stage, side = ctx.side, el = SK.el, t = 0, y0 = 0.6, trace = [], running = false, raf = 0, last = 0, revealed = false;
  var fig = el('div'), plot = el('div'); stage.appendChild(fig); stage.appendChild(plot);
  var ctl = el('div'); side.appendChild(ctl);
  var L = SK.slider(ctl, { label: 'Chain length', min: 1.5, max: 3, step: 0.5, value: 2, unit: 'm', digits: 1, onInput: reset });
  var Y = SK.slider(ctl, { label: 'Starting overhang y0', min: 0.2, max: 1.2, step: 0.1, value: 0.6, unit: 'm', digits: 1, onInput: reset });
  var row = el('div', 'row'); ctl.appendChild(row);
  var play = SK.button(row, 'Play', function () { if (running) pause(); else start(); }), stepB = SK.button(row, 'Step 0.1 s', function () { pause(); advance(0.1); }), rs = SK.button(row, 'Reset', reset);
  var read = el('div', 'sk-read'), host = el('div'); side.appendChild(read); side.appendChild(host);
  function k() { return Math.sqrt(g / L.get()); }
  function yAt(tt) { return Y.get() * Math.cosh(k() * tt); }
  function tEnd() { return Math.acosh(L.get() / Y.get()) / k(); }
  function reset() { pause(); t = 0; trace = [[0, Y.get()]]; draw(); }
  function pause() { running = false; cancelAnimationFrame(raf); play.textContent = 'Play'; }
  function start() { if (t >= tEnd()) { t = 0; trace = [[0, Y.get()]]; } running = true; play.textContent = 'Pause'; last = performance.now(); raf = requestAnimationFrame(loop); }
  function loop(now) { if (!running) return; advance(Math.min(0.05, (now - last) / 1000)); last = now; if (running) raf = requestAnimationFrame(loop); }
  function advance(dt) { t = Math.min(tEnd(), t + dt); trace.push([t, yAt(t)]); if (t >= tEnd()) pause(); draw(); }
  function draw() {
    var Lm = L.get(), y = yAt(t), sc = 150 / Lm, W = 380, H = 230, ex = 150, ty = 40, table = '<rect x="20" y="' + ty + '" width="' + (ex - 20) + '" height="14" style="fill:var(--line)"/><rect x="' + (ex - 8) + '" y="' + ty + '" width="8" height="170" style="fill:var(--line)"/>';
    var onT = (Lm - y) * sc, o = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px" role="img" aria-label="Chain at the table edge">' + table;
    o += '<line x1="' + Math.max(20, ex - onT) + '" y1="' + (ty - 5) + '" x2="' + ex + '" y2="' + (ty - 5) + '" stroke-width="7" stroke-linecap="round" style="stroke:var(--ink)"/>';
    o += '<line x1="' + (ex + 6) + '" y1="' + (ty - 5) + '" x2="' + (ex + 6) + '" y2="' + (ty - 5 + y * sc) + '" stroke-width="7" stroke-linecap="round" style="stroke:var(--accent)"/>';
    o += '<text x="' + (ex + 20) + '" y="' + (ty + 18 + y * sc / 2) + '" font-size="15" font-weight="700" style="fill:var(--accent)">y = ' + SK.f(y, 2) + ' m</text></svg>';
    fig.innerHTML = o + '<p class="hint">Only the hanging part pulls: its weight (1 kg per metre) is the whole net force on the chain.</p>' + SK.fbd([{ dir: 'right', N: y * g, label: 'pull', kind: 'c' }], { w: 380, h: 110, bw: 60, bh: 30, scale: 3, alt: 'Net force on the chain' });
    read.innerHTML = 'Time: <b>' + SK.f(t, 2) + ' s</b><br>Overhang y: <b>' + SK.f(y, 2) + ' m</b><br>Acceleration: ' + (revealed ? '<b>' + SK.f(g * y / Lm, 2) + ' m/s²</b> (a = g y / L)' : '<span class="sk-hidden">hidden until you commit</span>');
    drawPlot();
  }
  function drawPlot() {
    if (!revealed) { plot.innerHTML = '<p class="sk-hidden" style="padding:12px">The y(t) plot appears after you commit your prediction.</p>'; return; }
    var W = 640, H = 220, te = tEnd(), Lm = L.get(), X = function (v) { return 56 + v / te * (W - 76); }, Yp = function (v) { return H - 36 - v / Lm * (H - 56); }, a0 = g * Y.get() / Lm, par = [], i;
    for (i = 0; i <= 40; i++) { var tt = te * i / 40, v = Y.get() + 0.5 * a0 * tt * tt; if (v <= Lm * 1.02) par.push(X(tt).toFixed(1) + ',' + Yp(Math.min(v, Lm)).toFixed(1)); }
    plot.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px" role="img" aria-label="Overhang against time"><line x1="56" y1="' + (H - 36) + '" x2="' + (W - 14) + '" y2="' + (H - 36) + '" style="stroke:var(--muted)"/><line x1="56" y1="12" x2="56" y2="' + (H - 36) + '" style="stroke:var(--muted)"/>' +
      '<polyline fill="none" stroke-width="2.5" stroke-dasharray="6 5" points="' + par.join(' ') + '" style="stroke:var(--muted)"/><polyline fill="none" stroke-width="3.5" points="' + trace.map(function (p) { return X(p[0]).toFixed(1) + ',' + Yp(p[1]).toFixed(1); }).join(' ') + '" style="stroke:var(--accent)"/>' +
      '<text x="' + (W / 2) + '" y="' + (H - 8) + '" font-size="14" text-anchor="middle" style="fill:var(--ink)">time t (s)</text><text x="14" y="' + (H / 2) + '" font-size="14" text-anchor="middle" transform="rotate(-90 14 ' + (H / 2) + ')" style="fill:var(--ink)">overhang y (m)</text>' + SK.ticks(X(0), X(te), H - 36, 12, 0, te, 0, Lm, 1, 1) + '<text x="76" y="26" font-size="14" style="fill:var(--accent)">solid: the chain</text><text x="76" y="44" font-size="14" style="fill:var(--muted)">dashed: constant acceleration</text></svg>';
  }
  SK.askChoice(host, { prompt: 'Predict first: as the chain slides off, is its acceleration constant, like a falling body?', options: ['Yes, constant', 'No, it grows as more chain hangs'], answer: 1, why: 'a = g y / L, so it grows with y. The motion is exponential, not parabolic.', onDone: function () { revealed = true; draw(); host.appendChild(el('p', 'msg', 'Press Play. The solid line is y0 cosh(√(g/L) t); the dashed line is what constant acceleration would give.')); } });
  reset();
});
