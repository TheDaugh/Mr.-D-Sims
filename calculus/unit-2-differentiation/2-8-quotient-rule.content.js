/* LESSON (calculus 2.8): the wiring is LK.standard (physics/lessons/engine/standard.js). Edit the spec for the teaching; only the Explore picture lives here. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el;
  LK.standard(window.SPECS['2-8-quotient-rule'], { prefix: 'QUO', explore: function (card, c, K) {
    /* One picture: the curve h = sin x / x², the measured tangent, and the tempting guess f′/g′ drawn as a dashed line. */
    var box = el('div', 'sim');
    var W = 560, H = 260, X0 = 54, Y0 = 232, XA = 0.4, XB = 4.6, YA = -0.35, YB = 2.2;
    var h = function (x) { return Math.sin(x) / (x * x); };
    var fp = function (x) { return Math.cos(x); }, gp = function (x) { return 2 * x; };
    var rule = function (x) { return (x * x * fp(x) - Math.sin(x) * gp(x)) / (x * x * x * x); };
    var measured = function (x) { var e = 1e-5; return (h(x + e) - h(x - e)) / (2 * e); };
    var guess = function (x) { return fp(x) / gp(x); };
    function px(t) { return X0 + (t - XA) / (XB - XA) * (W - X0 - 20); } function py(y) { return Y0 - (y - YA) / (YB - YA) * (Y0 - 20); }
    var d = ''; for (var t = XA; t <= XB + 1e-9; t += 0.02) d += (d ? 'L' : 'M') + px(t).toFixed(1) + ' ' + py(h(t)).toFixed(1);
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="The curve sin x over x squared with its tangent line and a guessed line" style="width:100%;max-width:600px;display:block;background:var(--stage);border:1px solid var(--line);border-radius:8px">' +
      '<line x1="' + X0 + '" y1="' + py(0) + '" x2="' + (W - 12) + '" y2="' + py(0) + '" stroke="#7a8a99"/><line x1="' + X0 + '" y1="14" x2="' + X0 + '" y2="' + Y0 + '" stroke="#7a8a99"/>' +
      '<path d="' + d + '" fill="none" stroke="#2b4fd9" stroke-width="3.5"/><line id="q-guess" stroke="#c98a12" stroke-width="3" stroke-dasharray="8 6"/><line id="q-tan" stroke="#b3412e" stroke-width="3.5"/><circle id="q-pt" r="7" fill="#142230"/>' +
      '<text x="64" y="30" font-size="20" font-weight="700" fill="#2b4fd9">h = sin x / x²</text><text x="330" y="30" font-size="16" fill="#b3412e">red: true tangent</text><text x="330" y="52" font-size="16" fill="#9a6a0a">dashed: guess f′/g′</text></svg>';
    var svg = box.querySelector('svg'), row = el('div', 'row');
    var wrap = el('div'); wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start'; card.appendChild(wrap);
    var ctl = el('div'); ctl.style.cssText = 'flex:1 1 260px;min-width:240px'; ctl.appendChild(row);
    var s = document.createElement('input'); s.type = 'range'; s.min = 0.5; s.max = 4.5; s.step = 0.25; s.value = 1;
    var lab = el('label', null, 'Move the point '); lab.appendChild(s); row.appendChild(lab);
    var out = el('div', 'qtext'); ctl.appendChild(out);
    function line(id, x, y, m, dx) { var l = svg.querySelector(id); l.setAttribute('x1', px(x - dx)); l.setAttribute('y1', py(y - m * dx)); l.setAttribute('x2', px(x + dx)); l.setAttribute('y2', py(y + m * dx)); }
    function upd() {
      var x = +s.value, y = h(x); line('#q-tan', x, y, measured(x), 0.7); line('#q-guess', x, y, guess(x), 0.7);
      var pt = svg.querySelector('#q-pt'); pt.setAttribute('cx', px(x)); pt.setAttribute('cy', py(y));
      out.innerHTML = '<p>x = <b>' + x + '</b></p><p>Measured slope: <b>' + LE.fmt(measured(x), 3) + '</b></p><p>Rule (g·f′ − f·g′)/g²: <b>' + LE.fmt(rule(x), 3) + '</b></p><p>Guess f′/g′: <b>' + LE.fmt(guess(x), 3) + '</b></p>';
    }
    box.style.cssText = 'flex:1 1 560px;max-width:600px;min-width:320px'; wrap.appendChild(box); wrap.appendChild(ctl);
    s.oninput = upd; upd();
  } });
})();
