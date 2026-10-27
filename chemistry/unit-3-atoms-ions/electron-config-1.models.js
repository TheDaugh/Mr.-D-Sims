/* Models tab for Electron Configurations I (the Formalize tab). Reads SPEC.models and SPEC.MOVES from the Day Card; nothing is re-derived.
     M1 watch      the steps appear on "Next move"; no input
     M2 with me    the student types move 4 (write) and draws move 5 (boxes); one try, then the step shows
     M3 you do     the student answers all six moves; each unlocks when the last is answered
   The six moves stay in a rail on the left. Every model ends with its slip as a boxed "Watch for" note.
   Moves 1, 2, 3 and 6 of M3 need a question each; the card does not word them, so they are asked from the model's own numbers (see the PR). */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, qdone = LK.qdone, SP = window.SPECS['electron-config-1'], C = SP.content, L = SP.ladder, UI = window.EC_UI = {};
  var REL = { 'watch': 'Watch', 'with-me': 'With me', 'you-do': 'Your turn' };
  var S = function () { return LE.S(); }, esc = function (s) { return LE.esc(String(s)); };
  var qid = function (M, j) { return 'mod.' + M.id + '.' + j; };
  var name = function (M) { return C.NAME[M.Z]; };

  /* ---------- the questions behind a move ---------- */
  function worked(M, j) { return '<b>Model:</b> ' + esc(M.steps[j].text); }
  function cfgQ(M, j, prompt) { return SP.dress({ id: qid(M, j), type: 'config', head: 'Move ' + (j + 1) + ' · ' + C.MOVES[j], prompt: prompt, answer: M.predictAnswer, maxMiss: 1, worked: worked(M, j) }); }
  function numQ(M, j, prompt, answer) { return { id: qid(M, j), type: 'num', head: 'Move ' + (j + 1) + ' · ' + C.MOVES[j], prompt: prompt, answer: answer, unit: '', maxMiss: 1, keypad: true, worked: worked(M, j) }; }
  /* move 5: draw the boxes of the last subshell. Click a box to cycle empty, one arrow, a pair. Any arrangement with the right counts passes. */
  function boxesQ(M, j) {
    var f = C.fill(M.Z), last = f[f.length - 1], sub = last[0], want = C.occupancy(M.Z)[sub];
    return { id: qid(M, j), type: 'custom', head: 'Move ' + (j + 1) + ' · ' + C.MOVES[j], prompt: 'Draw the ' + sub + ' boxes for ' + name(M) + '. Click a box to add an arrow.', answer: last[1], keyText: M.steps[j].text, maxMiss: 1, worked: worked(M, j),
      build: function (host, ctl, api) {
        var self = this, cur = want.map(function () { return 0; }), over = !!api.done;
        function draw(focus) {
          var o = {}; o[sub] = over ? want : cur; host.innerHTML = L.svg({ order: [sub], occupancy: o, interactive: !over, axis: false });
          if (focus != null) { var g = host.querySelector('.cl-box[data-k="' + focus + '"]'); if (g) g.focus(); }
        }
        function bump(g) { if (over || !g) return; var k = +g.getAttribute('data-k'); cur[k] = (cur[k] + 1) % 3; draw(k); }
        host.addEventListener('click', function (e) { bump(e.target.closest && e.target.closest('.cl-box')); });
        host.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var g = e.target.closest && e.target.closest('.cl-box'); if (g) { e.preventDefault(); bump(g); } } });
        self.reveal = function () { over = true; draw(); };
        var chk = el('button', 'btn', 'Check'); chk.type = 'button'; ctl.appendChild(chk); chk.disabled = over;
        chk.onclick = function () {
          if (over) return;
          if (cur.slice().sort().join() === want.slice().sort().join()) { over = true; chk.disabled = true; draw(); api.solve(); }
          else { api.miss('Not quite.'); if (LE.qs(self.id) && LE.qs(self.id).done) chk.disabled = true; }
        };
        draw();
      } };
  }
  function orderQ(M, j) {
    var f = C.fill(M.Z).map(function (p) { return p[0]; }), swap = function (a, b) { var x = f.slice(), i = x.indexOf(a), k = x.indexOf(b); if (i < 0 || k < 0) return null; x[i] = b; x[k] = a; return x.join(', '); };
    var wrong = [swap('4s', '3d') || swap('2s', '2p'), swap('2s', '2p') === f.join(', ') ? null : swap('2s', '2p'), swap('3s', '3p')].filter(function (x, i, a) { return x && x !== f.join(', ') && a.indexOf(x) === i; }).slice(0, 2);
    return { id: qid(M, j), type: 'choice', head: 'Move ' + (j + 1) + ' · ' + C.MOVES[j], prompt: 'Which order do the electrons fill, lowest energy first?', options: [f.join(', ')].concat(wrong), answer: 0, maxMiss: 1, worked: worked(M, j) };
  }
  function leftAfter3p(M) { var left = M.Z; for (var i = 0; i < C.fill(M.Z).length; i++) { left -= C.fill(M.Z)[i][1]; if (C.fill(M.Z)[i][0] === '3p') break; } return left; }
  function asked(M, j) {
    if (M.mode === 'with-me') { if (M.typedMoves.indexOf(j + 1) < 0) return null; return [j === 3 ? cfgQ(M, j, 'Write the configuration of ' + name(M) + ' (Z = ' + M.Z + ').') : boxesQ(M, j)]; }
    if (M.mode !== 'you-do') return null;
    return [[numQ(M, 0, 'How many electrons does a neutral atom of ' + name(M) + ' (Z = ' + M.Z + ') have to place?', M.Z), orderQ(M, 1),
      numQ(M, 2, 'How many electrons are left after 3p is full?', leftAfter3p(M)), cfgQ(M, 3, 'Write the configuration of ' + name(M) + '.'), boxesQ(M, 4),
      numQ(M, 5, 'Add the raised numbers in your configuration. What do they total?', M.Z)][j]];
  }
  var moveDone = function (M, j) { var qs = asked(M, j); return !qs || qs.every(function (q) { return qdone(q.id); }); };
  function modelDone(M) { var st = S().d.mod || { n: {} }; return (st.n[M.id] || 0) >= 6 && moveDone(M, 5); }
  UI.modelDone = modelDone;
  UI.modelsDone = function () { return C.models.every(modelDone); };

  /* ---------- the tab ---------- */
  UI.modelsStep = function (K) {
    return { id: 'models', label: 'Models',
      render: function (card, c) {
        var st = S().d.mod = S().d.mod || { i: 0, n: {} };
        K.head(card, 'Models', 'I can write a configuration and draw the boxes in six moves.', 'Watch one, work one with Mr. D, then do one yourself.');
        var chips = el('div', 'row'); card.appendChild(chips);
        C.models.forEach(function (M, k) {
          var b = el('button', 'btn small' + (k === st.i ? ' primary' : ''), (modelDone(M) ? '✓ ' : '') + M.id); b.type = 'button';
          b.disabled = k > st.i && !(k > 0 && modelDone(C.models[k - 1])) ; b.onclick = function () { st.i = k; LE.save(); LE.render(); }; chips.appendChild(b);
        });
        var mi = Math.min(st.i, C.models.length - 1), M = C.models[mi], shown = st.n[M.id] || 0;
        var grid = el('div', 'ecm-grid'); card.appendChild(grid);
        var rail = el('ol', 'ecm-rail'); rail.setAttribute('aria-label', 'The six moves'); grid.appendChild(rail);
        var cur = Math.max(0, shown - 1);
        C.MOVES.forEach(function (mv, j) {
          var li = el('li', null, (j + 1) + '. ' + mv); if (j < shown && (j < shown - 1 || moveDone(M, j))) li.className = 'done'; if (shown > 0 && j === cur) li.className += ' cur'; rail.appendChild(li);
        });
        var main = el('div', 'ecm-main'); grid.appendChild(main);
        main.appendChild(el('p', 'qhead', 'Model ' + (mi + 1) + ' of ' + C.models.length + ' · ' + REL[M.mode]));
        main.appendChild(el('p', 'qtext', M.problem));
        var wrap = el('div', 'ecm-steps'); main.appendChild(wrap);
        if (shown === 0) { var go = el('button', 'btn primary', 'Move 1'); go.type = 'button'; go.onclick = function () { st.n[M.id] = 1; LE.save(); LE.render(); }; wrap.appendChild(go); return; }
        /* the ladder appears once it would not give an answer away: after move 4 when watching, after the drawing otherwise */
        if ((M.mode === 'watch' && shown >= 4) || (M.mode !== 'watch' && moveDone(M, 4) && shown >= 5)) {
          var fg = el('figure', 'ecm-fig'); fg.innerHTML = L.svg({ occupancy: C.occupancy(M.Z) }); fg.appendChild(el('figcaption', null, name(M) + ': ' + C.pretty(C.cfg(M.Z)))); wrap.appendChild(fg);
        }
        for (var j = 0; j < shown; j++) {
          var qs = asked(M, j);
          if (!qs) { var p = el('p', 'ecm-step'); p.innerHTML = '<b>Move ' + (j + 1) + ' · ' + esc(C.MOVES[j]) + '.</b> ' + esc(M.steps[j].text); wrap.appendChild(p); continue; }
          qs.forEach(function (q) { q.onDone = function () { LE.render(); }; LE.ask(wrap, q); });
        }
        if (shown < 6) {
          if (moveDone(M, shown - 1)) { var nx = el('button', 'btn primary', 'Next move'); nx.type = 'button'; nx.onclick = function () { st.n[M.id] = shown + 1; LE.save(); LE.render(); }; wrap.appendChild(nx); }
          return;
        }
        if (!moveDone(M, 5)) return;
        var note = el('div', 'ecm-slip'); note.innerHTML = '<b>Watch for:</b> ' + esc(M.slip); wrap.appendChild(note);
        if (mi + 1 < C.models.length) { var nm = el('button', 'btn primary', 'Next model'); nm.type = 'button'; nm.onclick = function () { st.i = mi + 1; LE.save(); LE.render(); window.scrollTo(0, 0); }; wrap.appendChild(nm); }
        else wrap.appendChild(el('p', 'msg ok', 'All the models are done. Continue to Build.'));
        LE.gate();
      },
      canLeave: function () { return UI.modelsDone(); },
      teacher: function () {
        var rows = C.models.map(function (M) { return '<li><b>' + M.id + ' (' + REL[M.mode] + '): ' + esc(M.problem) + '</b> Answer: ' + esc(C.pretty(M.predictAnswer)) + '. <i>Watch for: ' + esc(M.slip) + '</i></li>'; }).join('');
        return '<p>Three models on one six-move rail. M1: watch (each step appears on “Next move”). M2: the student types move 4 and draws move 5, one try, then the step shows. M3: the student answers every move; each unlocks when the last is answered. The boxes pass with any arrangement that has the right counts.</p><ol>' + rows + '</ol>';
      } };
  };
  /* a section for the student's notes: the steps of each model they finished */
  UI.notesSection = function () {
    var done = C.models.filter(modelDone); if (!done.length) return null;
    return { title: 'Models', blocks: done.map(function (M) { return { type: 'box', label: M.id + ' ' + name(M) + ':', text: M.steps.map(function (s) { return s.text; }).join(' ') + ' Watch for: ' + M.slip }; }) };
  };

  var css = document.createElement('style');
  css.textContent = '.ecm-grid{display:grid;grid-template-columns:230px 1fr;gap:18px;margin-top:12px;align-items:start}.ecm-rail{list-style:none;margin:0;padding:0;border:1px solid var(--line);border-radius:8px;background:var(--stage)}' +
    '.ecm-rail li{padding:8px 12px;border-bottom:1px solid var(--line);font-size:.95rem;color:var(--muted)}.ecm-rail li:last-child{border-bottom:0}.ecm-rail li.done{color:var(--good)}.ecm-rail li.cur{background:var(--accent);color:#fff}' +
    '.ecm-main{min-width:0}.ecm-step{margin:.6rem 0}.ecm-fig{margin:10px 0;max-width:360px;border:1px solid var(--line);border-radius:8px;background:var(--stage);padding:6px}.ecm-fig figcaption{font:600 .9rem var(--mono);color:var(--muted);text-align:center}' +
    '.ecm-slip{margin:12px 0;padding:10px 14px;border:2px solid var(--gold);border-radius:8px;background:color-mix(in srgb,var(--gold) 8%,var(--surface))}@media (max-width:720px){.ecm-grid{grid-template-columns:1fr}}';
  document.head.appendChild(css);
})();
