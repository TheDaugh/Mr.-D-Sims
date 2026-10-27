/* EnergyLadder: the energy ladder for electron configurations, drawn in code.
   (Not chemistry/shared/ladder.js, which is the hidden difficulty ladder.)
   One figure serves the Orbital Filler sim (interactive), question pictures, the huddle figure and the board page (interactive: false).
   Pure part (no DOM, unit tested):
     EnergyLadder.svg(o)        the picture as an SVG string
                              o = { order:[subshells bottom to top], occupancy:{ '2p':[2,1,1] }, hideRow:'3d', interactive:bool,
                                    tags:{ '1s':1 }, numbers:{ '1s':1 }, flash:{ sub, k }, axis:bool, alt }
                              occupancy: per subshell, one number per box: 0 empty, 1 one electron, 2 a pair
     EnergyLadder.newRun(Z)     a run of the sim: { Z, order:[[sub,k]], boxes:{sub:[...]}, rej:{aufbau,pauli,hund} }
     EnergyLadder.place(run, sub, k)   { ok:true } or { ok:false, rule, reason }; a rejected electron is counted and not placed
     EnergyLadder.config(run), left(run), full(run), occupancy(run), fillOrder(run)
   DOM part:
     EnergyLadder.mount(host, { run, onChange })   the Orbital Filler: drag an electron from the tray (or click a box) */
(function (root) {
  'use strict';
  var ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p'];
  var BOXES = { s: 1, p: 3, d: 5 };
  var WHY = { aufbau: 'A lower subshell still has room.', pauli: 'A box holds 2 electrons, spins opposite.', hund: 'Another box in this subshell is empty. Fill it first.' };
  var nb = function (sub) { return BOXES[sub.charAt(1)]; };

  /* ---------- rules (pure) ---------- */
  function emptyBoxes() { var b = {}; ORDER.forEach(function (s) { var a = [], i; for (i = 0; i < nb(s); i++) a.push(0); b[s] = a; }); return b; }
  function newRun(Z) { return { Z: Z, order: [], boxes: emptyBoxes(), rej: { aufbau: 0, pauli: 0, hund: 0 } }; }
  function placed(run) { return run.order.length; }
  function left(run) { return run.Z - placed(run); }
  function full(run) { return left(run) <= 0; }
  function room(run, sub) { return run.boxes[sub].some(function (n) { return n < 2; }); }
  /* Pauli first (the box is full), then Aufbau (a lower subshell has room), then Hund (a sibling box is empty). */
  function place(run, sub, k) {
    var arr = run.boxes[sub], rule = null, i;
    if (!arr || arr[k] === undefined || full(run)) return { ok: false, rule: null, reason: '' };
    if (arr[k] >= 2) rule = 'pauli';
    else {
      for (i = 0; i < ORDER.indexOf(sub); i++) if (room(run, ORDER[i])) { rule = 'aufbau'; break; }
      if (!rule && arr[k] === 1 && arr.some(function (n) { return n === 0; })) rule = 'hund';
    }
    if (rule) { run.rej[rule]++; return { ok: false, rule: rule, reason: WHY[rule] }; }
    arr[k]++; run.order.push([sub, k]); return { ok: true };
  }
  function occupancy(run) { var o = {}; ORDER.forEach(function (s) { o[s] = run.boxes[s].slice(); }); return o; }
  function config(run) {
    return ORDER.map(function (s) { var n = run.boxes[s].reduce(function (a, b) { return a + b; }, 0); return n ? s + n : ''; }).filter(Boolean).join(' ');
  }
  function fillOrder(run) { var seen = []; run.order.forEach(function (p) { if (seen.indexOf(p[0]) < 0) seen.push(p[0]); }); return seen; }

  /* ---------- the picture (pure) ---------- */
  var ROW = 46, TOP = 20, BX = 108, BW = 44, BH = 34, GAP = 6, W = 420;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var INK = 'style="stroke:var(--ink,#142230)" stroke="#142230"', FILL = 'style="fill:var(--ink,#142230)" fill="#142230"';
  function arrow(x, y0, y1, up) {   // a spin arrow inside a box: shaft plus a head at the tip
    var tip = up ? y0 : y1, base = up ? y1 : y0, d = up ? 1 : -1;
    return '<line x1="' + x + '" y1="' + base + '" x2="' + x + '" y2="' + (tip + d * 5) + '" stroke-width="2.4" stroke-linecap="round" ' + INK + '/>' +
      '<polygon points="' + x + ',' + tip + ' ' + (x - 5) + ',' + (tip + d * 8) + ' ' + (x + 5) + ',' + (tip + d * 8) + '" ' + FILL + '/>';
  }
  function svg(o) {
    o = o || {}; var order = o.order || ORDER, occ = o.occupancy || {}, n = order.length, axis = o.axis !== false, inter = !!o.interactive;
    var H = TOP + n * ROW + (axis ? 22 : 8), parts = [], desc = [];
    order.forEach(function (sub, i) {
      var cy = TOP + (n - 1 - i) * ROW + ROW / 2, y = cy - BH / 2, boxes = occ[sub] || [], b, num = nb(sub), hidden = o.hideRow === sub;
      parts.push('<text x="' + (BX - 14) + '" y="' + (cy + 6) + '" font-size="19" font-weight="700" text-anchor="end" font-family="Source Sans 3,Arial,sans-serif" style="fill:var(--ink,#142230)" fill="#142230">' + esc(sub) + '</text>');
      parts.push('<line x1="' + (BX - 8) + '" y1="' + (cy + BH / 2 + 5) + '" x2="' + (BX + num * (BW + GAP) - GAP + 8) + '" y2="' + (cy + BH / 2 + 5) + '" stroke="#cbd6e0" style="stroke:var(--line,#cbd6e0)" stroke-width="1" stroke-dasharray="2 4"/>');
      for (b = 0; b < num; b++) {
        var x = BX + b * (BW + GAP), v = hidden ? 0 : (boxes[b] || 0), cx = x + BW / 2, bad = o.flash && o.flash.sub === sub && o.flash.k === b;
        var lab = sub + ' box ' + (b + 1) + ', ' + (hidden ? 'hidden' : v === 0 ? 'empty' : v === 1 ? 'one electron' : 'two electrons');
        parts.push('<g class="cl-box' + (bad ? ' cl-bad' : '') + '" data-sub="' + sub + '" data-k="' + b + '"' + (inter ? ' tabindex="0" role="button" aria-label="' + lab + '" style="cursor:pointer"' : '') + '>' +
          '<rect x="' + x + '" y="' + y + '" width="' + BW + '" height="' + BH + '" rx="4" stroke-width="2" ' + (hidden ? 'stroke-dasharray="4 3" ' : '') +
          (bad ? 'fill="#fbe3df" stroke="#b3412e" style="fill:var(--bad-bg,#fbe3df);stroke:var(--warn,#b3412e)"' : 'fill="#f7fafc" stroke="#7a8a99" style="fill:var(--stage,#f7fafc);stroke:var(--muted,#7a8a99)"') + '/>' +
          (hidden ? '<text x="' + cx + '" y="' + (cy + 6) + '" font-size="17" text-anchor="middle" style="fill:var(--muted,#566878)" fill="#566878">?</text>' :
            v === 1 ? arrow(cx, y + 5, y + BH - 5, true) : v === 2 ? arrow(cx - 8, y + 5, y + BH - 5, true) + arrow(cx + 8, y + 5, y + BH - 5, false) : '') + '</g>');
      }
      var tag = (o.tags && o.tags[sub]) || (o.numbers && o.numbers[sub]);
      if (tag) parts.push('<circle cx="' + (W - 24) + '" cy="' + cy + '" r="13" fill="#2b4fd9" style="fill:var(--accent,#2b4fd9)"/><text x="' + (W - 24) + '" y="' + (cy + 5) + '" font-size="14" font-weight="700" text-anchor="middle" fill="#fff">' + tag + '</text>');
      if (!hidden && boxes.length) desc.push(sub + ' ' + boxes.reduce(function (a, c) { return a + c; }, 0));
    });
    if (axis) {
      var y0 = TOP + n * ROW + 4;
      parts.push('<line x1="30" y1="' + y0 + '" x2="30" y2="' + (TOP - 4) + '" stroke-width="2.4" ' + INK + '/><polygon points="30,' + (TOP - 12) + ' 24,' + (TOP + 2) + ' 36,' + (TOP + 2) + '" ' + FILL + '/>');
      parts.push('<text transform="translate(14,' + (TOP + n * ROW / 2) + ') rotate(-90)" font-size="15" text-anchor="middle" font-family="Source Sans 3,Arial,sans-serif" style="fill:var(--muted,#566878)" fill="#566878">Energy</text>');
    }
    var alt = o.alt || ('Energy ladder, lowest subshell at the bottom. ' + (desc.length ? 'Electrons: ' + desc.join(', ') + '.' : 'No electrons yet.'));
    return '<svg class="cl-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(alt) + '" style="width:100%;height:auto;max-width:' + (n === 1 ? 300 : 440) + 'px">' + parts.join('') + '</svg>';
  }

  /* ---------- the Orbital Filler widget (DOM) ---------- */
  var styled = false;
  function addCss() {
    if (styled || typeof document === 'undefined') return; styled = true;
    var s = document.createElement('style');
    s.textContent = '.cl-wrap{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;margin:10px 0}.cl-fig{flex:1 1 320px;max-width:440px;background:var(--stage,#f7fafc);border:1px solid var(--line,#cbd6e0);border-radius:8px;padding:6px}' +
      '.cl-side{flex:1 1 200px;display:flex;flex-direction:column;gap:10px}.cl-read{display:flex;gap:18px;font:600 1rem var(--mono,monospace)}.cl-read b{font-size:1.4rem}' +
      '.cl-tray{min-height:54px;display:flex;align-items:center;gap:10px;padding:8px 12px;border:2px dashed var(--line,#cbd6e0);border-radius:10px}.cl-e{width:38px;height:38px;border-radius:50%;background:var(--accent,#2b4fd9);color:#fff;font:700 1.1rem var(--body,sans-serif);display:flex;align-items:center;justify-content:center;cursor:grab;touch-action:none;user-select:none;border:0}' +
      '.cl-e:focus-visible{outline:3px solid var(--gold,#b7791f)}.cl-e.cl-fly{position:fixed;z-index:50;pointer-events:none;opacity:.9;transform:translate(-50%,-50%)}.cl-msg{min-height:1.6em;margin:0}.cl-box:focus-visible rect{stroke:var(--gold,#b7791f);stroke-width:3}.cl-box:hover rect{stroke:var(--accent,#2b4fd9)}';
    document.head.appendChild(s);
  }
  function mount(host, o) {
    addCss(); var run = o.run, flash = null, nums = null;
    host.textContent = '';
    var wrap = document.createElement('div'); wrap.className = 'cl-wrap'; host.appendChild(wrap);
    var fig = document.createElement('div'); fig.className = 'cl-fig'; wrap.appendChild(fig);
    var side = document.createElement('div'); side.className = 'cl-side'; wrap.appendChild(side);
    var read = document.createElement('div'); read.className = 'cl-read'; read.setAttribute('aria-live', 'polite'); side.appendChild(read);
    var tray = document.createElement('div'); tray.className = 'cl-tray'; side.appendChild(tray);
    var msg = document.createElement('p'); msg.className = 'cl-msg hint'; msg.setAttribute('role', 'status'); side.appendChild(msg);
    function numbers() { nums = {}; fillOrder(run).forEach(function (s, i) { nums[s] = i + 1; }); }
    function draw(focus) {
      fig.innerHTML = svg({ occupancy: occupancy(run), interactive: !full(run), flash: flash, numbers: nums });
      read.innerHTML = '<span>Electrons placed <b>' + placed(run) + '</b></span><span>Electrons left <b>' + left(run) + '</b></span>';
      tray.textContent = '';
      if (!full(run)) {
        var e = document.createElement('button'); e.type = 'button'; e.className = 'cl-e'; e.textContent = 'e⁻'; e.setAttribute('aria-label', 'Electron. Drag it into a box, or click a box.'); tray.appendChild(e);
        var t = document.createElement('span'); t.className = 'hint'; t.textContent = 'Drag the electron into a box, or click a box.'; tray.appendChild(t);
        e.addEventListener('pointerdown', drag);
      } else tray.textContent = 'All ' + run.Z + ' electrons are placed.';
      if (focus) { var g = fig.querySelector('.cl-box[data-sub="' + focus[0] + '"][data-k="' + focus[1] + '"]'); if (g) g.focus(); }
    }
    function drop(sub, k, via) {
      var res = place(run, sub, +k), f = via === 'key' ? [sub, k] : null; flash = null;
      if (!res.ok && res.rule) { flash = { sub: sub, k: +k }; msg.textContent = res.reason; setTimeout(function () { flash = null; draw(f); }, 700); }
      else if (res.ok) { msg.textContent = ''; if (full(run)) { numbers(); msg.textContent = 'Your order, bottom to top, is numbered on the ladder.'; } }
      draw(f); if (o.onChange) o.onChange(run, res);
    }
    function drag(ev) {
      ev.preventDefault(); var src = ev.currentTarget, fly = src.cloneNode(true); fly.classList.add('cl-fly'); document.body.appendChild(fly);
      function at(e) { fly.style.left = e.clientX + 'px'; fly.style.top = e.clientY + 'px'; } at(ev);
      function up(e) {
        document.removeEventListener('pointermove', at); document.removeEventListener('pointerup', up); fly.remove();
        var hit = document.elementsFromPoint(e.clientX, e.clientY).filter(function (x) { return x.closest && x.closest('.cl-box'); })[0], g = hit && hit.closest('.cl-box');
        if (g && fig.contains(g)) drop(g.getAttribute('data-sub'), g.getAttribute('data-k'), 'drag');
      }
      document.addEventListener('pointermove', at); document.addEventListener('pointerup', up);
    }
    fig.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('.cl-box'); if (g && !full(run)) drop(g.getAttribute('data-sub'), g.getAttribute('data-k'), 'click'); });
    fig.addEventListener('keydown', function (e) { var g = e.target.closest && e.target.closest('.cl-box'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (!full(run)) drop(g.getAttribute('data-sub'), g.getAttribute('data-k'), 'key'); } });
    if (full(run)) numbers();
    draw();
    return { redraw: draw, run: run };
  }

  var API = { ORDER: ORDER, WHY: WHY, svg: svg, newRun: newRun, place: place, left: left, full: full, config: config, occupancy: occupancy, fillOrder: fillOrder, mount: mount };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EnergyLadder = API;
})(typeof window !== 'undefined' ? window : globalThis);
