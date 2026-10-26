/* Arrow Builder (bands 1 and 2). The student builds the free-body diagram with one slider per force; the net force appears only after Commit. */
SK.boot('arrow', function (ctx) {
  var g = SK.g, band = ctx.band, stage = ctx.stage, side = ctx.side, el = SK.el, KEYS = [['W', 'Gravity W', 'w', 'down'], ['N', 'Normal N', 'c', 'up'], ['T', 'Tension T', 'c', 'up'], ['f', 'Friction f', 'f', 'left'], ['F', 'Applied F', 'c', 'right']];
  var SC = band === 1 ? [
    { id: 'rest', text: 'A 5.1 kg book rests on a table. Nobody pushes it.', m: 5.1, F: 0, f: 0, aha: 'Nothing is left over: the net force is zero, so the book stays at rest.' },
    { id: 'steady', text: 'A 5.1 kg crate slides at constant speed. A 20 N push keeps it going.', m: 5.1, F: 20, f: 20, aha: 'Push and friction cancel. Steady motion has no net force.' },
    { id: 'speed', text: 'A 5.1 kg crate speeds up to the right. The push is 30 N and friction is 10 N.', m: 5.1, F: 30, f: 10, aha: 'The net arrow is whatever is left: 20 N to the right, so it speeds up.' }
  ] : [{ id: 'match', text: 'A crate slides to the right with 8 N of friction. Set the mass, then build the diagram so it speeds up at 1.5 m/s².', m: 4, F: null, f: 8, at: 1.5, aha: 'To get a = 1.5 m/s² the net force must be m × 1.5, so the push is friction plus that.' }];
  var cur = SC[0], vals = { W: 0, N: 0, T: 0, f: 0, F: 0 }, sliders = {}, committed = false, sc = 1.8, step = band === 1 ? 5 : 1;
  var fig = el('div'); stage.appendChild(fig);
  var picks = el('div', 'row'); side.appendChild(picks);
  var story = el('p', 'qtext'); side.appendChild(story);
  var ctl = el('div'); side.appendChild(ctl);
  var read = el('div', 'sk-read sk-hidden', 'The net force appears after you commit.'); side.appendChild(read);
  var msg = el('p', 'msg'); side.appendChild(msg);
  var mass;
  function draw() { fig.innerHTML = SK.fbd(KEYS.map(function (k) { return { dir: k[3], N: vals[k[0]], label: k[0], kind: k[2] }; }), { scale: sc, alt: 'Your free-body diagram' }); }
  function mval() { return mass ? mass.get() : cur.m; }
  function build(s) {
    cur = s; committed = false; ctl.textContent = ''; msg.textContent = ''; read.className = 'sk-read sk-hidden'; read.textContent = 'The net force appears after you commit.';
    story.textContent = s.text; vals = { W: 0, N: 0, T: 0, f: 0, F: 0 }; mass = null;
    if (band === 2) mass = SK.slider(ctl, { label: 'Mass', min: 2, max: 6, step: 0.5, value: s.m, unit: 'kg', digits: 1 });
    KEYS.forEach(function (k) { sliders[k[0]] = SK.slider(ctl, { label: k[1], min: 0, max: k[0] === 'W' || k[0] === 'N' ? 60 : 40, step: step, value: 0, unit: 'N', digits: 0, onInput: function (v) { vals[k[0]] = v; draw(); } }); });
    SK.button(ctl, 'Commit', commit); draw();
  }
  function commit() {
    var m = mval(), W = m * g, target = band === 1 ? { W: W, N: W, T: 0, f: cur.f, F: cur.F } : null, bad = [];
    var net = vals.F - vals.f, vnet = vals.N - vals.W - 0 + vals.T, a = net / m;
    if (band === 1) KEYS.forEach(function (k) { var t = target[k[0]], tol = k[0] === 'W' || k[0] === 'N' ? 5 : 0.01; if (Math.abs(vals[k[0]] - t) > tol) bad.push(k[1]); });
    else { if (Math.abs(vals.W - W) > 1.5) bad.push('Gravity W'); if (Math.abs(vals.N - W) > 1.5) bad.push('Normal N'); if (vals.T > 0) bad.push('Tension T'); if (vals.f !== cur.f) bad.push('Friction f'); if (Math.abs(a - cur.at) > 0.15) bad.push('the push F'); }
    committed = true; read.className = 'sk-read';
    read.innerHTML = 'Net, up and down: <b>' + SK.f(vnet) + ' N</b><br>Net, left and right: <b>' + SK.f(Math.abs(net)) + ' N ' + (net > 0 ? 'right' : net < 0 ? 'left' : '') + '</b><br>Acceleration: <b>' + SK.f(a, 2) + ' m/s²</b>';
    msg.className = 'msg ' + (bad.length ? 'bad' : 'ok'); msg.textContent = bad.length ? 'Check: ' + bad.join(', ') + '. Adjust and commit again.' : cur.aha;
  }
  if (SC.length > 1) SC.forEach(function (s, i) { SK.button(picks, ['At rest', 'Steady motion', 'Speeding up'][i], function () { build(s); }); });
  build(SC[0]);
});
