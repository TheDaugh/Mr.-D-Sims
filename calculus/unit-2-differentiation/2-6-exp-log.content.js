/* LESSON (calculus 2.6): the wiring is LK.standard (physics/lessons/engine/standard.js). Edit the spec for the teaching; only the Explore picture lives here. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el;
  LK.standard(window.SPECS['2-6-exp-log'], { prefix: 'EXL', explore: function (card, c, K) {
    /* One picture: pick a curve, slide a point, read the slope against the height (eˣ) or against 1/x (ln x). */
    var box = el('div', 'sim');
    var W = 560, H = 260, X0 = 50, Y0 = 232;
    var fns = {
      exp: { label: 'y = eˣ', f: Math.exp, d: Math.exp, x0: -2, x1: 3, y0: -0.5, y1: 12, min: -2, max: 2.5, val: 1 },
      ln: { label: 'y = ln x', f: Math.log, d: function (x) { return 1 / x; }, x0: 0, x1: 8, y0: -2.5, y1: 3, min: 0.25, max: 7.5, val: 2 }
    }, cur = 'exp';
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="A curve with a tangent line and a movable point" style="width:100%;max-width:600px;display:block;background:var(--stage);border:1px solid var(--line);border-radius:8px">' +
      '<g id="ex-axes" stroke="#7a8a99"></g><path id="ex-curve" fill="none" stroke="#2b4fd9" stroke-width="3.5"/><line id="ex-tan" stroke="#b3412e" stroke-width="3"/><circle id="ex-pt" r="7" fill="#142230"/><text id="ex-name" x="62" y="28" font-size="20" fill="#142230" font-weight="700"></text></svg>';
    var svg = box.querySelector('svg');
    var wrap = el('div'); wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start'; card.appendChild(wrap);
    var ctl = el('div'); ctl.style.cssText = 'flex:1 1 260px;min-width:240px';
    var tabs = el('div', 'row'); ctl.appendChild(tabs);
    var row = el('div', 'row'); ctl.appendChild(row);
    var slide = document.createElement('input'); slide.type = 'range'; slide.step = 0.25;
    var lab = el('label', null, 'Move the point '); lab.appendChild(slide); row.appendChild(lab);
    var out = el('p', 'qtext'); ctl.appendChild(out);
    var bE = el('button', 'btn', 'y = eˣ'), bL = el('button', 'btn', 'y = ln x'); bE.type = bL.type = 'button'; tabs.appendChild(bE); tabs.appendChild(bL);
    function setCur(k) { cur = k; var F = fns[k]; slide.min = F.min; slide.max = F.max; slide.value = F.val; bE.className = 'btn' + (k === 'exp' ? ' primary' : ''); bL.className = 'btn' + (k === 'ln' ? ' primary' : ''); upd(); }
    bE.onclick = function () { setCur('exp'); }; bL.onclick = function () { setCur('ln'); };
    function upd() {
      var F = fns[cur], x = +slide.value; fns[cur].val = x;
      function px(t) { return X0 + (t - F.x0) / (F.x1 - F.x0) * (W - X0 - 20); } function py(y) { return Y0 - (y - F.y0) / (F.y1 - F.y0) * (Y0 - 20); }
      var ax = '<line x1="' + X0 + '" y1="' + py(0) + '" x2="' + (W - 12) + '" y2="' + py(0) + '"/>' + (F.x0 < 0 ? '<line x1="' + px(0) + '" y1="14" x2="' + px(0) + '" y2="' + Y0 + '"/>' : '<line x1="' + X0 + '" y1="14" x2="' + X0 + '" y2="' + Y0 + '"/>');
      svg.querySelector('#ex-axes').innerHTML = ax;
      var d = '', t0 = cur === 'ln' ? 0.06 : F.x0;
      for (var t = t0; t <= F.x1 + 1e-9; t += (F.x1 - F.x0) / 160) { var yy = F.f(t); if (yy > F.y1 + 1 || yy < F.y0 - 1) continue; d += (d ? 'L' : 'M') + px(t).toFixed(1) + ' ' + py(yy).toFixed(1); }
      svg.querySelector('#ex-curve').setAttribute('d', d);
      var y = F.f(x), m = F.d(x), dx = cur === 'exp' ? 0.6 : 1.4, tan = svg.querySelector('#ex-tan');
      tan.setAttribute('x1', px(x - dx)); tan.setAttribute('y1', py(y - m * dx)); tan.setAttribute('x2', px(x + dx)); tan.setAttribute('y2', py(y + m * dx));
      var pt = svg.querySelector('#ex-pt'); pt.setAttribute('cx', px(x)); pt.setAttribute('cy', py(y));
      svg.querySelector('#ex-name').textContent = F.label;
      out.innerHTML = cur === 'exp' ? 'x = ' + x + '  ·  height y = <b>' + LE.fmt(y, 2) + '</b>  ·  slope = <b>' + LE.fmt(m, 2) + '</b>'
        : 'x = ' + x + '  ·  slope = <b>' + LE.fmt(m, 3) + '</b>  ·  1/x = <b>' + LE.fmt(1 / x, 3) + '</b>';
    }
    box.style.cssText = 'flex:1 1 560px;max-width:600px;min-width:320px'; wrap.appendChild(box); wrap.appendChild(ctl);
    setCur('exp');
  } });
})();
