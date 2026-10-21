/* TEMPLATE LESSON (physics): the wiring is LK.standard (physics/lessons/engine/standard.js). Edit spec.js for the teaching; edit only the Explore picture here. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el;
  LK.standard(window.SPECS['tpl-physics'], { prefix: 'TPL', explore: function (card, c, K) {
    /* A small honest sim: push a cart. Drag the sliders, press Push, read a = F / m. */
    var box = el('div', 'sim'); card.appendChild(box);
    box.innerHTML = '<svg viewBox="0 0 520 140" role="img" aria-label="Cart on a track" style="width:100%;max-width:640px;background:var(--stage);border:1px solid var(--line);border-radius:8px"><line x1="10" y1="112" x2="510" y2="112" stroke="#7a8a99" stroke-width="2"/><g id="tpl-cart"><rect x="20" y="62" width="70" height="38" rx="6" fill="#dbe6ff" stroke="#2b4fd9" stroke-width="2"/><circle cx="36" cy="106" r="7" fill="#142230"/><circle cx="74" cy="106" r="7" fill="#142230"/><line x1="90" y1="80" x2="120" y2="80" stroke="#1c7d4a" stroke-width="4" id="tpl-arrow"/></g></svg>';
    var row = el('div', 'row'); card.appendChild(row);
    function slider(label, min, max, val) { var l = el('label', null, label + ' '); var i = el('input'); i.type = 'range'; i.min = min; i.max = max; i.value = val; var o = el('b', null, String(val)); i.oninput = function () { o.textContent = i.value; upd(); }; l.appendChild(i); l.appendChild(o); row.appendChild(l); return i; }
    var F = slider('Force (N)', 1, 10, 4), M = slider('Mass (kg)', 1, 5, 2);
    var go = el('button', 'btn primary', 'Push'); go.type = 'button'; row.appendChild(go);
    var out = el('p', 'qtext'); card.appendChild(out);
    function upd() { var a = F.value / M.value; out.textContent = 'a = ' + F.value + ' / ' + M.value + ' = ' + LE.fmt(a, 2) + ' m/s²'; box.querySelector('#tpl-arrow').setAttribute('x2', 90 + 8 * F.value); }
    var raf;
    go.onclick = function () {
      cancelAnimationFrame(raf); var cart = box.querySelector('#tpl-cart'), a = F.value / M.value, t0 = performance.now();
      (function step(now) { var t = (now - t0) / 1000, x = Math.min(380, 0.5 * a * 18 * t * t); cart.setAttribute('transform', 'translate(' + x + ',0)'); if (x < 380 && t < 4) raf = requestAnimationFrame(step); })(t0);
    };
    upd();
  } });
})();
