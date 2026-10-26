/* Rope Tension Profile (bands 5 and 6). A rope with mass is pulled up from the top. The T(x) graph is drawn only after the student picks its shape.
   T(s) at depth s: the mass below s (rope below plus any block) times (g + a). With a block on the end the line stops at the block, not at zero. */
SK.boot('rope', function (ctx) {
  var g = SK.g, band = ctx.band, stage = ctx.stage, side = ctx.side, el = SK.el, shown = false, s = 0.5;
  var fig = el('div'), plot = el('div'); stage.appendChild(fig); stage.appendChild(plot);
  var ctl = el('div'); side.appendChild(ctl);
  var M = SK.slider(ctl, { label: 'Rope mass', min: 1, max: 6, step: 1, value: 3, unit: 'kg', digits: 0, onInput: change }), L = SK.slider(ctl, { label: 'Rope length', min: 1, max: 3, step: 1, value: 2, unit: 'm', digits: 0, onInput: change }), B = null;
  if (band === 6) B = SK.slider(ctl, { label: 'Block on the end', min: 1, max: 5, step: 1, value: 2, unit: 'kg', digits: 0, onInput: change });
  var Fs = SK.slider(ctl, { label: 'Pull F at the top', min: 0, max: 200, step: 1, value: 80, unit: 'N', digits: 0, onInput: change });
  var sl = SK.slider(ctl, { label: 'Measuring point, depth below the top', min: 0, max: 3, step: 0.1, value: 0.5, unit: 'm', digits: 1, onInput: function (v) { s = Math.min(v, L.get()); draw(); } });
  var read = el('div', 'sk-read'), host = el('div'); side.appendChild(read); side.appendChild(host);
  function mb() { return B ? B.get() : 0; }
  function tot() { return M.get() + mb(); }
  function acc() { return Fs.get() / tot() - g; }
  function Ts(x) { return (mb() + M.get() * (1 - x / L.get())) * (g + acc()); }
  function change() { var need = Math.ceil(tot() * g + 2); Fs.input.min = need; if (Fs.get() < need) Fs.set(need); sl.input.max = L.get(); if (s > L.get()) { s = L.get(); sl.set(s); } shown = false; host.textContent = ''; draw(); askShape(); }
  function draw() {
    var W = 360, H = 330, top = 24, bot = 250, x = 90, ys = top + (bot - top) * Math.min(s, L.get()) / L.get();
    var o = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px" role="img" aria-label="Rope pulled up from the top"><line x1="' + x + '" y1="' + top + '" x2="' + x + '" y2="' + bot + '" stroke-width="7" stroke-linecap="round" style="stroke:var(--ink)"/>';
    o += '<line x1="' + x + '" y1="8" x2="' + x + '" y2="' + top + '" stroke-width="5" style="stroke:var(--accent)"/><polygon points="' + x + ',2 ' + (x - 7) + ',14 ' + (x + 7) + ',14" style="fill:var(--accent)"/><text x="' + (x + 14) + '" y="16" font-size="15" font-weight="700" style="fill:var(--accent)">F = ' + Fs.get() + ' N</text>';
    if (B) o += '<rect x="' + (x - 22) + '" y="' + bot + '" width="44" height="34" rx="4" style="fill:var(--stage);stroke:var(--accent)" stroke-width="2.5"/><text x="' + (x + 30) + '" y="' + (bot + 22) + '" font-size="15" style="fill:var(--ink)">' + mb() + ' kg</text>';
    o += '<circle id="pt" cx="' + x + '" cy="' + ys + '" r="9" style="fill:var(--warn);cursor:grab" tabindex="0"/><line x1="' + (x + 12) + '" y1="' + ys + '" x2="' + (x + 70) + '" y2="' + ys + '" style="stroke:var(--warn)"/>';
    o += '<text x="' + (x + 76) + '" y="' + (ys + 5) + '" font-size="15" font-weight="700" style="fill:var(--warn)">' + (shown ? 'T = ' + SK.f(Ts(s)) + ' N' : 'T = ?') + '</text>';
    fig.innerHTML = o + '</svg>';
    var pt = fig.querySelector('#pt'); pt.onpointerdown = function (e) { pt.setPointerCapture(e.pointerId); var svg = fig.querySelector('svg'); pt.onpointermove = function (ev) { var r = svg.getBoundingClientRect(), yy = (ev.clientY - r.top) / r.height * H, v = Math.max(0, Math.min(1, (yy - top) / (bot - top))) * L.get(); s = Math.round(v * 10) / 10; sl.set(s); draw(); }; };
    read.innerHTML = 'Rope accelerates up at <b>' + SK.f(acc(), 2) + ' m/s²</b><br>' + (shown ? 'Tension at depth ' + SK.f(s) + ' m: <b>' + SK.f(Ts(s)) + ' N</b>' : '<span class="sk-hidden">Tension readout appears after you choose the shape.</span>');
    drawPlot();
  }
  function drawPlot() {
    if (!shown) { plot.innerHTML = '<p class="sk-hidden" style="padding:12px">The T(x) graph is drawn after you choose its shape.</p>'; return; }
    var W = 640, H = 220, X = function (v) { return 56 + v / L.get() * (W - 80); }, T0 = Ts(0), Y = function (v) { return H - 36 - v / (T0 * 1.05) * (H - 56); };
    plot.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px" role="img" aria-label="Tension against depth"><line x1="56" y1="' + (H - 36) + '" x2="' + (W - 14) + '" y2="' + (H - 36) + '" style="stroke:var(--muted)"/><line x1="56" y1="12" x2="56" y2="' + (H - 36) + '" style="stroke:var(--muted)"/><line x1="' + X(0) + '" y1="' + Y(Ts(0)) + '" x2="' + X(L.get()) + '" y2="' + Y(Ts(L.get())) + '" stroke-width="3.5" style="stroke:var(--accent)"/><circle cx="' + X(s) + '" cy="' + Y(Ts(s)) + '" r="6" style="fill:var(--warn)"/>' + SK.ticks(X(0), X(L.get()), H - 36, 12, 0, L.get(), 0, T0 * 1.05, 0, 0) + '<text x="' + (W / 2) + '" y="' + (H - 8) + '" font-size="14" text-anchor="middle" style="fill:var(--ink)">depth below the top (m)</text><text x="14" y="' + (H / 2) + '" font-size="14" text-anchor="middle" transform="rotate(-90 14 ' + (H / 2) + ')" style="fill:var(--ink)">tension T (N)</text></svg>';
  }
  function askShape() {
    host.textContent = '';
    SK.askChoice(host, { prompt: 'Before the graph: how does the tension change as you go down the rope?', options: ['It falls in a straight line', 'It stays the same all the way down', 'It rises in a straight line'], answer: 0, why: band === 6 ? 'It falls in a straight line, but it stops at the block, not at zero.' : 'It falls in a straight line to zero at the free end.',
      onDone: function () { shown = true; draw(); askNum(); } });
  }
  function askNum() {
    var q = band === 5 ? { p: 'Predict the tension 0.5 m below the top.', a: Ts(Math.min(0.5, L.get())) } : { p: 'Predict the tension just above the block, at the bottom of the rope.', a: Ts(L.get()) };
    SK.askNum(host, { prompt: q.p, unit: 'N', answer: q.a, tol: 0.03 });
  }
  change();
});
