/* TEMPLATE LESSON (calculus): the wiring is LK.standard (physics/lessons/engine/standard.js). Edit spec.js for the teaching; edit only the Explore picture here. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el;
  LK.standard(window.SPECS['tpl-calc'], { prefix: 'TPC', explore: function (card, c, K) {
    /* A curve, a movable point and its tangent line. */
      var box = el('div', 'sim'); card.appendChild(box);
      var W = 520, H = 300, X0 = 40, Y0 = 270, SX = 90, SY = 22;
      box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="A curve with a tangent line" style="width:100%;max-width:640px;background:var(--stage);border:1px solid var(--line);border-radius:8px"><line x1="' + X0 + '" y1="' + Y0 + '" x2="' + (W - 10) + '" y2="' + Y0 + '" stroke="#7a8a99"/><line x1="' + X0 + '" y1="10" x2="' + X0 + '" y2="' + Y0 + '" stroke="#7a8a99"/><path id="tpl-curve" fill="none" stroke="#2b4fd9" stroke-width="3"/><line id="tpl-tan" stroke="#b3412e" stroke-width="2.5"/><circle id="tpl-pt" r="6" fill="#142230"/></svg>';
      var row = el('div', 'row'); card.appendChild(row);
      function slider(label, min, max, step, val) { var l = el('label', null, label + ' '); var i = el('input'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = val; var o = el('b', null, String(val)); i.oninput = function () { o.textContent = i.value; upd(); }; l.appendChild(i); l.appendChild(o); row.appendChild(l); return i; }
      var N = slider('Power n', 2, 4, 1, 2), P = slider('Point x', 0.5, 3, 0.25, 1.5);
      var out = el('p', 'qtext'); card.appendChild(out);
      function px(x) { return X0 + x * SX; } function py(y) { return Math.max(8, Y0 - y * SY); }
      function upd() {
        var n = +N.value, x = +P.value, y = Math.pow(x, n), m = n * Math.pow(x, n - 1), d = '';
        for (var t = 0; t <= 3.01; t += 0.05) d += (t ? 'L' : 'M') + px(t).toFixed(1) + ' ' + py(Math.pow(t, n)).toFixed(1);
        box.querySelector('#tpl-curve').setAttribute('d', d);
        var dx = 0.9, tan = box.querySelector('#tpl-tan');
        tan.setAttribute('x1', px(x - dx)); tan.setAttribute('y1', py(y - m * dx)); tan.setAttribute('x2', px(x + dx)); tan.setAttribute('y2', py(y + m * dx));
        var pt = box.querySelector('#tpl-pt'); pt.setAttribute('cx', px(x)); pt.setAttribute('cy', py(y));
        out.textContent = 'x = ' + x + ', slope = ' + n + ' · ' + x + (n > 2 ? '^' + (n - 1) : '') + ' = ' + LE.fmt(m, 2);
      }
      upd();
  } });
})();
