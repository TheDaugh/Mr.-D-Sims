/* Two-Block Lab (bands 3, 4 and 5). Pulley, pull, or three-block chain. The tension readout is hidden until the student commits a prediction;
   the diagram toggles between the whole system (internal forces cancel) and each block (the string force appears). */
SK.boot('twoblock', function (ctx) {
  var g = SK.g, band = ctx.band, stage = ctx.stage, side = ctx.side, el = SK.el, CFG = band === 3 ? 'pulley' : band === 4 ? 'pull' : 'chain', view = 'system', revealed = false;
  var fig = el('div'), tg = el('div', 'row'); stage.appendChild(tg); stage.appendChild(fig);
  SK.button(tg, 'Whole system', function () { view = 'system'; draw(); }); SK.button(tg, 'Each block', function () { view = 'blocks'; draw(); });
  var ctl = el('div'); side.appendChild(ctl);
  var m1 = SK.slider(ctl, { label: 'm1', min: 1, max: 8, step: 1, value: 4, unit: 'kg', digits: 0, onInput: change }), m2 = SK.slider(ctl, { label: 'm2', min: 1, max: 8, step: 1, value: 2, unit: 'kg', digits: 0, onInput: change }), m3 = null, mu, F = null;
  if (CFG === 'chain') m3 = SK.slider(ctl, { label: 'm3', min: 1, max: 8, step: 1, value: 3, unit: 'kg', digits: 0, onInput: change });
  if (CFG !== 'chain') mu = SK.slider(ctl, { label: 'Friction μ', min: 0, max: 0.5, step: 0.05, value: CFG === 'pulley' ? 0.2 : 0.2, digits: 2, onInput: change });
  if (CFG !== 'pulley') F = SK.slider(ctl, { label: 'Pull F', min: 5, max: 80, step: 1, value: 30, unit: 'N', digits: 0, onInput: change });
  var read = el('div', 'sk-read'), host = el('div'); side.appendChild(read); side.appendChild(host);
  function phys() {
    var A = m1.get(), B = m2.get(), C = m3 ? m3.get() : 0, u = mu ? mu.get() : 0, f = F ? F.get() : 0, o = {};
    if (CFG === 'pulley') { var a = (B * g - u * A * g) / (A + B); o.a = Math.max(0, a); o.T = a > 0 ? A * (a + u * g) : B * g; o.sys = [{ dir: 'right', N: B * g, label: 'm2 g', kind: 'c' }, { dir: 'left', N: u * A * g, label: 'f', kind: 'f' }]; o.b1 = [{ dir: 'right', N: o.T, label: 'T', kind: 'c' }, { dir: 'left', N: u * A * g, label: 'f', kind: 'f' }]; o.b2 = [{ dir: 'up', N: o.T, label: 'T', kind: 'c' }, { dir: 'down', N: B * g, label: 'm2 g', kind: 'w' }]; }
    if (CFG === 'pull') { var a2 = f / (A + B) - u * g; o.a = Math.max(0, a2); o.T = f * B / (A + B); o.sys = [{ dir: 'right', N: f, label: 'F', kind: 'c' }, { dir: 'left', N: u * (A + B) * g, label: 'f', kind: 'f' }]; o.b1 = [{ dir: 'right', N: f, label: 'F', kind: 'c' }, { dir: 'left', N: o.T, label: 'T', kind: 'c', off: -12 }, { dir: 'left', N: u * A * g, label: 'f', kind: 'f', off: 12 }]; o.b2 = [{ dir: 'right', N: o.T, label: 'T', kind: 'c' }, { dir: 'left', N: u * B * g, label: 'f', kind: 'f', off: 12 }]; }
    if (CFG === 'chain') { var S = A + B + C; o.a = f / S; o.T12 = f * (B + C) / S; o.T = f * C / S; o.sys = [{ dir: 'right', N: f, label: 'F', kind: 'c' }]; o.b1 = [{ dir: 'right', N: f, label: 'F', kind: 'c' }, { dir: 'left', N: o.T12, label: 'T12', kind: 'c' }]; o.b2 = [{ dir: 'right', N: o.T12, label: 'T12', kind: 'c' }, { dir: 'left', N: o.T, label: 'T23', kind: 'c', off: 0 }]; o.b3 = [{ dir: 'right', N: o.T, label: 'T23', kind: 'c' }]; }
    return o;
  }
  function draw() {
    var o = phys(), sc = 1.1, shows = function (list, cap) { return '<figure style="margin:0;flex:1 1 220px"><figcaption class="hint">' + cap + '</figcaption>' + SK.fbd(list.filter(function (f) { return revealed || f.label.indexOf('T') !== 0; }), { w: 300, h: 190, scale: sc, alt: cap }) + '</figure>'; };
    if (view === 'system') fig.innerHTML = '<p class="hint">Whole system: only outside forces count. The string force is inside, so it cancels. Weight and the normal force cancel on the table.</p>' + SK.fbd(o.sys, { scale: 1.6, alt: 'Whole system' });
    else fig.innerHTML = '<p class="hint">Each block alone: the string force now appears. (Weight and the normal force cancel on the table and are left out.)</p><div style="display:flex;flex-wrap:wrap;gap:10px">' + shows(o.b1, 'Block 1') + shows(o.b2, 'Block 2') + (o.b3 ? shows(o.b3, 'Block 3') : '') + '</div>';
    read.innerHTML = 'Acceleration: ' + (revealed ? '<b>' + SK.f(o.a, 2) + ' m/s²</b>' : '<span class="sk-hidden">hidden until you commit</span>') + '<br>' + (CFG === 'chain' ? 'Tension T12: ' + (revealed ? '<b>' + SK.f(o.T12) + ' N</b>' : '<span class="sk-hidden">hidden</span>') + '<br>Tension T23: ' : 'String tension T: ') + (revealed ? '<b>' + SK.f(o.T) + ' N</b>' : '<span class="sk-hidden">hidden until you commit</span>');
  }
  function change() { if (F && CFG === 'pull') { var need = Math.ceil(mu.get() * (m1.get() + m2.get()) * g + 3); F.input.min = need; if (F.get() < need) F.set(need); } host.textContent = ''; revealed = false; draw(); newGate(); }
  function newGate() {
    var o = phys(), q = CFG === 'pulley' ? { p: 'Predict the acceleration of the blocks.', u: 'm/s²', a: o.a } : CFG === 'pull' ? { p: 'Predict the string tension between the blocks.', u: 'N', a: o.T } : { p: 'Predict the tension in the string between block 2 and block 3.', u: 'N', a: o.T };
    SK.askNum(host, { prompt: q.p, unit: q.u, answer: q.a, tol: 0.03, onDone: function () { revealed = true; draw(); host.appendChild(el('p', 'msg', CFG === 'pull' ? 'Change the friction μ and predict again: does the tension change?' : 'Change a slider and predict again.')); } });
  }
  change();
});
