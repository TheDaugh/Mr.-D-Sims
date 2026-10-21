/* TEMPLATE LESSON (chemistry): the wiring is LK.standard (physics/lessons/engine/standard.js). Edit spec.js for the teaching; edit only the Explore picture here. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el;
  LK.standard(window.SPECS['tpl-chem'], { prefix: 'TPK', explore: function (card, c, K) {
    /* Grams of water become a crowd of molecules. One drawn molecule stands for 0.25 mol. */
    var box = el('div', 'sim'); card.appendChild(box);
    box.innerHTML = '<svg id="tpl-wat" viewBox="0 0 520 150" role="img" aria-label="Water molecules in a flask" style="width:100%;max-width:640px;background:var(--stage);border:1px solid var(--line);border-radius:8px"></svg>';
    var row = el('div', 'row'); card.appendChild(row);
    var l = el('label', null, 'Grams of water '), inp = el('input'), o = el('b', null, '36');
    inp.type = 'range'; inp.min = 9; inp.max = 72; inp.step = 9; inp.value = 36; l.appendChild(inp); l.appendChild(o); row.appendChild(l);
    var out = el('p', 'qtext'); card.appendChild(out);
    function mol(x, y) { return '<g transform="translate(' + x + ',' + y + ') scale(1.5)"><line x1="0" y1="0" x2="-9" y2="9" stroke="#7a8a99" stroke-width="2"/><line x1="0" y1="0" x2="9" y2="9" stroke="#7a8a99" stroke-width="2"/><circle r="8" fill="#e5533d" stroke="#142230"/><circle cx="-10" cy="10" r="5" fill="#e8eef5" stroke="#142230"/><circle cx="10" cy="10" r="5" fill="#e8eef5" stroke="#142230"/></g>'; }
    function upd() {
      var g = +inp.value, n = g / 18, count = Math.round(n * 4), s = '';
      for (var i = 0; i < count; i++) s += mol(48 + (i % 8) * 60, 34 + Math.floor(i / 8) * 52);
      box.querySelector('#tpl-wat').innerHTML = '<rect x="8" y="6" width="504" height="138" rx="14" fill="#eaf3ff" stroke="#9db6d8" stroke-width="2"/>' + s; o.textContent = g;
      out.textContent = g + ' g ÷ 18 g/mol = ' + LE.fmt(n, 2) + ' mol · about ' + LE.fmt(n * 6.02, 2) + ' × 10²³ molecules (each drawing = 0.25 mol)';
    }
    inp.oninput = upd; upd();
  } });
})();
