/* Elevator Scale (bands 2, 3 and 6). The reading stays hidden until the student commits a prediction. N = m(g + a), up positive. */
SK.boot('elevator', function (ctx) {
  var g = SK.g, band = ctx.band, stage = ctx.stage, side = ctx.side, el = SK.el, pts = [], gate = null, fitHost = null;
  var fig = el('div'), plot = el('div'); stage.appendChild(fig); stage.appendChild(plot);
  var ctl = el('div'); side.appendChild(ctl);
  var m = SK.slider(ctl, { label: 'Mass', min: 40, max: 100, step: 5, value: 60, unit: 'kg', digits: 0, onInput: function () { pts = []; newGate(); } });
  var a = SK.slider(ctl, { label: 'Elevator acceleration (up is positive)', min: -3, max: 3, step: 0.5, value: 0, unit: 'm/s²', digits: 1, onInput: function () { newGate(); } });
  var read = el('div', 'sk-read'), host = el('div'), fitBox = el('div'); side.appendChild(read); side.appendChild(host); side.appendChild(fitBox);
  function mystery() { var v = ((Math.round(m.get() / 5) * 7) % 11 - 5) * 0.5; return v === 0 ? 1.5 : v; }
  function A() { return band === 3 ? mystery() : band === 2 ? 0 : a.get(); }
  function N() { return m.get() * (g + A()); }
  if (band === 2) { a.set(0); a.input.disabled = true; }
  if (band === 3) a.row.style.display = 'none';
  function draw(revealN) {
    var mm = m.get(), forces = [{ dir: 'down', N: mm * g, label: 'W', kind: 'w' }];
    if (revealN) forces.push({ dir: 'up', N: N(), label: 'N', kind: 'c' });
    fig.innerHTML = SK.fbd(forces, { scale: 0.12, alt: 'Free-body diagram of the person' });
  }
  function readout(revealed) {
    if (band === 3) { read.innerHTML = 'Scale reads: <b>' + SK.f(N(), 0) + ' N</b><br>Elevator acceleration: ' + (revealed ? '<b>' + SK.f(A(), 1) + ' m/s²</b>' : '<span class="sk-hidden">hidden until you commit</span>'); }
    else read.innerHTML = 'Scale reads: ' + (revealed ? '<b>' + SK.f(N(), 0) + ' N</b>' : '<span class="sk-hidden">hidden until you commit</span>') + '<br>Weight mg: ' + SK.f(m.get() * g, 0) + ' N';
  }
  function newGate() {
    host.textContent = ''; draw(false); readout(false);
    var q = band === 3 ? { prompt: 'The scale reads ' + SK.f(N(), 0) + ' N for this ' + m.get() + ' kg person. Find the elevator acceleration. Up is positive.', unit: 'm/s²', answer: A() }
      : { prompt: band === 2 ? 'The elevator rises at constant speed. What will the scale read?' : 'Set an acceleration, then predict the scale reading.', unit: 'N', answer: N() };
    gate = SK.askNum(host, { prompt: q.prompt, unit: q.unit, answer: q.answer, tol: 0.02, onDone: function () { draw(true); readout(true); if (band === 6) addPoint(); } });
  }
  function addPoint() {
    pts.push([A(), N()]); drawPlot();
    if (pts.length >= 3 && !fitBox.firstChild) {
      fitBox.appendChild(el('p', null, 'Three points make a line. Read its slope and intercept, and say what each one is.'));
      var s = SK.askNum(fitBox, { prompt: 'Slope of N against a:', unit: 'kg', answer: m.get(), tol: 0.03, label: 'Slope' });
      var i = SK.askNum(fitBox, { prompt: 'Intercept (N when a = 0):', unit: 'N', answer: m.get() * g, tol: 0.03, label: 'Intercept', onDone: function () { fitBox.appendChild(el('p', 'msg ok', 'The slope is the mass. The intercept is the weight mg.')); } });
    }
  }
  function drawPlot() {
    if (band !== 6) return;
    var W = 640, H = 240, mm = m.get(), lo = mm * (g - 3.3), hi = mm * (g + 3.3), X = function (v) { return 50 + (v + 3.3) / 6.6 * (W - 70); }, Y = function (v) { return H - 34 - (v - lo) / (hi - lo) * (H - 56); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px" role="img" aria-label="N against a"><line x1="50" y1="' + (H - 34) + '" x2="' + (W - 14) + '" y2="' + (H - 34) + '" style="stroke:var(--muted)"/><line x1="50" y1="14" x2="50" y2="' + (H - 34) + '" style="stroke:var(--muted)"/>';
    s += '<text x="' + (W / 2) + '" y="' + (H - 8) + '" font-size="14" text-anchor="middle" style="fill:var(--ink)">acceleration a (m/s²)</text><text x="14" y="' + (H / 2) + '" font-size="14" text-anchor="middle" transform="rotate(-90 14 ' + (H / 2) + ')" style="fill:var(--ink)">scale N (N)</text>';
    if (pts.length >= 3) { var n = pts.length, sx = 0, sy = 0, sxx = 0, sxy = 0; pts.forEach(function (p) { sx += p[0]; sy += p[1]; sxx += p[0] * p[0]; sxy += p[0] * p[1]; }); var den = n * sxx - sx * sx; if (den > 1e-9) { var k = (n * sxy - sx * sy) / den, b = (sy - k * sx) / n; s += '<line x1="' + X(-3.3) + '" y1="' + Y(b - 3.3 * k) + '" x2="' + X(3.3) + '" y2="' + Y(b + 3.3 * k) + '" stroke-width="3" style="stroke:var(--accent)"/>'; } }
    pts.forEach(function (p) { s += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="6" style="fill:var(--warn)"/>'; });
    plot.innerHTML = s + SK.ticks(X(-3), X(3), H - 34, 14, -3, 3, lo, hi, 0, 0) + '</svg>';
  }
  newGate();
});
