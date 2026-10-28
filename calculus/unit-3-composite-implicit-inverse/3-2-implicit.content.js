/* LESSON (calculus 3.2): the wiring is LK.standard (physics/lessons/engine/standard.js). Edit spec.js for the teaching; edit only the Explore picture here. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el;
  LK.standard(window.SPECS['3-2-implicit'], { prefix: 'IMP', explore: function (card, c, K) {
    /* The circle x² + y² = 25. One x, two points, two tangents: the slope needs both coordinates. */
    var box = el('div', 'sim'); card.appendChild(box);
    var W = 520, H = 320, CX = 260, CY = 160, S = 28, R = 5;
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="The circle x squared plus y squared equals 25 with a tangent line at the upper and lower point for the same x" style="width:100%;max-width:640px;background:var(--stage);border:1px solid var(--line);border-radius:8px">' +
      '<line x1="14" y1="' + CY + '" x2="' + (W - 14) + '" y2="' + CY + '" stroke="#7a8a99"/><line x1="' + CX + '" y1="10" x2="' + CX + '" y2="' + (H - 10) + '" stroke="#7a8a99"/>' +
      '<text x="' + (W - 26) + '" y="' + (CY + 20) + '" font-size="15" fill="#142230">x</text><text x="' + (CX + 8) + '" y="24" font-size="15" fill="#142230">y</text>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + (R * S) + '" fill="none" stroke="#2b4fd9" stroke-width="3"/>' +
      '<line id="imp-guide" stroke="#7a8a99" stroke-dasharray="4 4"/>' +
      '<line id="imp-up" stroke="#b3412e" stroke-width="2.5"/><line id="imp-dn" stroke="#1c7d4a" stroke-width="2.5"/>' +
      '<circle id="imp-pu" r="6" fill="#b3412e"/><circle id="imp-pd" r="6" fill="#1c7d4a"/></svg>';
    var row = el('div', 'row'); card.appendChild(row);
    var l = el('label', null, 'Point x '), P = el('input'), o = el('b', null, '3'); P.type = 'range'; P.min = -4.5; P.max = 4.5; P.step = 0.5; P.value = 3;
    P.oninput = function () { o.textContent = (+P.value).toFixed(1); upd(); }; l.appendChild(P); l.appendChild(o); row.appendChild(l);
    var out = el('p', 'qtext'); card.appendChild(out);
    function sx(x) { return CX + x * S; } function sy(y) { return CY - y * S; }
    function line(node, x, y, m) { var dx = 1.6; node.setAttribute('x1', sx(x - dx)); node.setAttribute('y1', sy(y - m * dx)); node.setAttribute('x2', sx(x + dx)); node.setAttribute('y2', sy(y + m * dx)); }
    function upd() {
      var x = +P.value, y = Math.sqrt(R * R - x * x), mu = -x / y + 0, md = x / y + 0;
      line(box.querySelector('#imp-up'), x, y, mu); line(box.querySelector('#imp-dn'), x, -y, md);
      var pu = box.querySelector('#imp-pu'), pd = box.querySelector('#imp-pd'), g = box.querySelector('#imp-guide');
      pu.setAttribute('cx', sx(x)); pu.setAttribute('cy', sy(y)); pd.setAttribute('cx', sx(x)); pd.setAttribute('cy', sy(-y));
      g.setAttribute('x1', sx(x)); g.setAttribute('y1', sy(y)); g.setAttribute('x2', sx(x)); g.setAttribute('y2', sy(-y));
      out.textContent = 'x = ' + x.toFixed(1) + '   ·   upper: y = ' + LE.fmt(y, 2) + ', slope −x/y = ' + LE.fmt(mu, 2) + '   ·   lower: y = ' + LE.fmt(-y, 2) + ', slope −x/y = ' + LE.fmt(md, 2);
    }
    upd();
  } });
})();
