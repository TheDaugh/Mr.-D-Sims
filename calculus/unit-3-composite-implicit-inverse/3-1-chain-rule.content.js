/* LESSON (calculus 3.1): the wiring is LK.standard (physics/lessons/engine/standard.js). Edit spec.js for the teaching; edit only the Explore picture here. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el;
  LK.standard(window.SPECS['3-1-chain-rule'], { prefix: 'CHN', explore: function (card, c, K) {
    /* The curve y = sin(x²), a movable point and its tangent. The readout splits the slope into its two links. */
    var box = el('div', 'sim'); card.appendChild(box);
    var W = 520, H = 300, X0 = 40, Y0 = 150, SX = 190, SY = 115, XMAX = 2.4;
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="The curve y equals sine of x squared with a tangent line at a movable point" style="width:100%;max-width:640px;background:var(--stage);border:1px solid var(--line);border-radius:8px">' +
      '<line x1="' + X0 + '" y1="' + Y0 + '" x2="' + (W - 12) + '" y2="' + Y0 + '" stroke="#7a8a99"/><line x1="' + X0 + '" y1="12" x2="' + X0 + '" y2="' + (H - 12) + '" stroke="#7a8a99"/>' +
      '<text x="' + (W - 22) + '" y="' + (Y0 + 20) + '" font-size="15" fill="#142230">x</text><text x="' + (X0 + 8) + '" y="24" font-size="15" fill="#142230">y</text>' +
      '<path id="chn-curve" fill="none" stroke="#2b4fd9" stroke-width="3"/><line id="chn-tan" stroke="#b3412e" stroke-width="2.5"/><circle id="chn-pt" r="6" fill="#142230"/></svg>';
    var row = el('div', 'row'); card.appendChild(row);
    var l = el('label', null, 'Point x '), P = el('input'), o = el('b', null, '1'); P.type = 'range'; P.min = 0; P.max = XMAX; P.step = 0.1; P.value = 1;
    P.oninput = function () { o.textContent = (+P.value).toFixed(1); upd(); }; l.appendChild(P); l.appendChild(o); row.appendChild(l);
    var out = el('p', 'qtext'); card.appendChild(out);
    function px(x) { return X0 + x * SX; } function py(y) { return Y0 - y * SY; }
    var d = ''; for (var t = 0; t <= XMAX + 0.001; t += 0.01) d += (t ? 'L' : 'M') + px(t).toFixed(1) + ' ' + py(Math.sin(t * t)).toFixed(1);
    box.querySelector('#chn-curve').setAttribute('d', d);
    function upd() {
      var x = +P.value, u = x * x, dydu = Math.cos(u), dudx = 2 * x, m = dydu * dudx, y = Math.sin(u), dx = 0.22;
      var tan = box.querySelector('#chn-tan');
      tan.setAttribute('x1', px(x - dx)); tan.setAttribute('y1', py(y - m * dx)); tan.setAttribute('x2', px(x + dx)); tan.setAttribute('y2', py(y + m * dx));
      var pt = box.querySelector('#chn-pt'); pt.setAttribute('cx', px(x)); pt.setAttribute('cy', py(y));
      out.textContent = 'u = x² = ' + LE.fmt(u, 2) + '   ·   dy/du = cos u = ' + LE.fmt(dydu, 2) + '   ·   du/dx = 2x = ' + LE.fmt(dudx, 2) + '   ·   slope = ' + LE.fmt(m, 2);
    }
    upd();
  } });
})();
