/* TEMPLATE LESSON (statistics): the wiring is LK.standard (physics/lessons/engine/standard.js). Edit spec.js for the teaching; edit only the Explore picture here. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el;
  LK.standard(window.SPECS['tpl-stats'], { prefix: 'TPS', explore: function (card, c, K) {
    /* A bell curve with a movable value. The shaded part is the distance from the mean to the value. Pretend data: mean 70, SD 10. */
    var box = el('div', 'sim'); card.appendChild(box);
    var W = 520, H = 200, X0 = 20, SPAN = 480, MEAN = 70, SD = 10, LO = 40, HI = 100;
    box.innerHTML = '<svg id="tpl-bell" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="A bell curve with a movable value" style="width:100%;max-width:640px;background:var(--stage);border:1px solid var(--line);border-radius:8px"></svg>';
    var row = el('div', 'row'); card.appendChild(row);
    var l = el('label', null, 'Pretend score '), inp = el('input'), o = el('b', null, '85');
    inp.type = 'range'; inp.min = LO; inp.max = HI; inp.step = 5; inp.value = 85; l.appendChild(inp); l.appendChild(o); row.appendChild(l);
    var out = el('p', 'qtext'); card.appendChild(out);
    function px(v) { return X0 + (v - LO) / (HI - LO) * SPAN; }
    function py(v) { var z = (v - MEAN) / SD; return 175 - 150 * Math.exp(-z * z / 2); }
    function path(a, b) { var d = ''; for (var v = a; v <= b + 1e-9; v += 0.5) d += (d ? 'L' : 'M') + px(v).toFixed(1) + ' ' + py(v).toFixed(1); return d; }
    function upd() {
      var x = +inp.value, z = (x - MEAN) / SD, lo = Math.min(x, MEAN), hi = Math.max(x, MEAN);
      box.querySelector('#tpl-bell').innerHTML = '<path d="' + path(lo, hi) + 'L' + px(hi) + ' 175L' + px(lo) + ' 175Z" fill="#cfe0ff"/><path d="' + path(LO, HI) + '" fill="none" stroke="#2b4fd9" stroke-width="3"/><line x1="' + X0 + '" y1="175" x2="' + (X0 + SPAN) + '" y2="175" stroke="#7a8a99"/><line x1="' + px(MEAN) + '" y1="20" x2="' + px(MEAN) + '" y2="175" stroke="#142230" stroke-width="2"/><circle cx="' + px(x) + '" cy="' + py(x) + '" r="6" fill="#b3412e"/><text x="' + (px(MEAN) - 14) + '" y="192" font-size="13">mean</text>';
      o.textContent = x;
      out.textContent = 'z = (' + x + ' − ' + MEAN + ') / ' + SD + ' = ' + LE.fmt(z, 2) + (z > 0 ? ' (above the mean)' : z < 0 ? ' (below the mean)' : ' (at the mean)');
    }
    inp.oninput = upd; upd();
  } });
})();
