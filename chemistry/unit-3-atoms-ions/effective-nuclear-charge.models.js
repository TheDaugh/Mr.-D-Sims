/* Models tab for Effective Nuclear Charge and Shielding (the Formalize tab, after huddle 2). Reads SPEC.models and SPEC.MOVES from the Day Card.
     M1 watch      lithium: the steps appear on "Next move"; no input
     M2 with me    sodium: the student types move 2 (core) and move 3 (Z_eff); one try, then the step shows
     M3 you do     chlorine: the student answers all five moves; each unlocks when the last is answered
   The five moves stay in a rail on the left. Every model ends with its slip as a boxed "Watch for" note.
   Mr. D presents the steps; the site holds the attempt and the feedback. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, qdone = LK.qdone, SP = window.SPECS['effective-nuclear-charge'], C = SP.content, Zf = SP.zeff, UI = window.ENC_UI = {};
  var REL = { 'watch': 'Watch', 'with-me': 'With me', 'you-do': 'Your turn' };
  var S = function () { return LE.S(); }, esc = function (s) { return LE.esc(String(s)); };
  var qid = function (M, j) { return 'mod.' + M.id + '.' + j; };
  var atom = function (M) { return Zf.atom(M.Z); };
  var NMOVES = C.MOVES.length;

  function worked(M, j) { return '<b>Model:</b> ' + esc(M.steps[j].text); }
  function numQ(M, j, prompt, answer) { return { id: qid(M, j), type: 'num', head: 'Move ' + (j + 1) + ' · ' + C.MOVES[j], prompt: prompt, answer: answer, unit: '', maxMiss: 1, keypad: true, worked: worked(M, j) }; }
  function pullQ(M, j) {
    var a = atom(M), right = Zf.frac(a), wrong = [a.zeff + '/' + a.n, a.Z + '/' + (a.n * a.n)].filter(function (x) { return x !== right; });
    var opts = [right].concat(wrong); opts.sort();
    return { id: qid(M, j), type: 'choice', head: 'Move ' + (j + 1) + ' · ' + C.MOVES[j], prompt: 'What is the pull on the outer electron of ' + a.name + '? Pull = Z_eff ÷ n².', options: opts, answer: opts.indexOf(right), maxMiss: 1, worked: worked(M, j) };
  }
  function asked(M, j) {
    var a = atom(M);
    if (M.mode === 'with-me') {
      if (M.typedMoves.indexOf(j + 1) < 0) return null;
      return [j === 1 ? numQ(M, j, 'How many core electrons does ' + a.name + ' have? Rings: ' + a.rings.join(', ') + '.', a.core) : numQ(M, j, 'Z_eff = Z − core. What is Z_eff for ' + a.name + '?', a.zeff)];
    }
    if (M.mode !== 'you-do') return null;
    return [[numQ(M, 0, 'The rings of ' + a.name + ' hold ' + a.rings.join(', ') + ' electrons. How many are in the outer ring?', a.valence),
      numQ(M, 1, 'How many core electrons does ' + a.name + ' have?', a.core),
      numQ(M, 2, 'Z_eff = Z − core. What is Z_eff for ' + a.name + ' (Z = ' + a.Z + ')?', a.zeff),
      numQ(M, 3, 'Which ring number holds the outer electron of ' + a.name + '?', a.n),
      pullQ(M, 4)][j]];
  }
  var moveDone = function (M, j) { var qs = asked(M, j); return !qs || qs.every(function (q) { return qdone(q.id); }); };
  function modelDone(M) { var st = S().d.mod || { n: {} }; return (st.n[M.id] || 0) >= NMOVES && moveDone(M, NMOVES - 1); }
  UI.modelDone = modelDone;
  UI.modelsDone = function () { return C.models.every(modelDone); };

  UI.modelsStep = function (K) {
    return { id: 'models', label: 'Models',
      render: function (card, c) {
        var st = S().d.mod = S().d.mod || { i: 0, n: {} };
        K.head(card, 'Models', 'I can estimate Z_eff and the pull in five moves.', 'Watch one, work one with Mr. D, then do one yourself.');
        var chips = el('div', 'row'); card.appendChild(chips);
        C.models.forEach(function (M, k) {
          var b = el('button', 'btn small' + (k === st.i ? ' primary' : ''), (modelDone(M) ? '✓ ' : '') + M.id); b.type = 'button';
          b.disabled = k > st.i && !(k > 0 && modelDone(C.models[k - 1])); b.onclick = function () { st.i = k; LE.save(); LE.render(); }; chips.appendChild(b);
        });
        var mi = Math.min(st.i, C.models.length - 1), M = C.models[mi], shown = st.n[M.id] || 0, a = atom(M);
        var grid = el('div', 'ecm-grid'); card.appendChild(grid);
        var rail = el('ol', 'ecm-rail'); rail.setAttribute('aria-label', 'The five moves'); grid.appendChild(rail);
        var cur = Math.max(0, shown - 1);
        C.MOVES.forEach(function (mv, j) {
          var li = el('li', null, (j + 1) + '. ' + mv); if (j < shown && (j < shown - 1 || moveDone(M, j))) li.className = 'done'; if (shown > 0 && j === cur) li.className += ' cur'; rail.appendChild(li);
        });
        var main = el('div', 'ecm-main'); grid.appendChild(main);
        main.appendChild(el('p', 'qhead', 'Model ' + (mi + 1) + ' of ' + C.models.length + ' · ' + REL[M.mode]));
        main.appendChild(el('p', 'qtext', M.problem));
        var wrap = el('div', 'ecm-steps'); main.appendChild(wrap);
        if (shown === 0) { var go = el('button', 'btn primary', 'Move 1'); go.type = 'button'; go.onclick = function () { st.n[M.id] = 1; LE.save(); LE.render(); }; wrap.appendChild(go); return; }
        /* the atom picture, plain at first; the core rings are painted once the core has been counted (after move 2 answered or shown) */
        var fg = el('figure', 'ecm-fig'); var coreKnown = shown >= 3 || (shown >= 2 && moveDone(M, 1));
        fg.innerHTML = Zf.svg(M.Z, { showCore: coreKnown }); fg.appendChild(el('figcaption', null, a.name + (coreKnown ? ': core rings amber, outer ring blue' : ''))); wrap.appendChild(fg);
        for (var j = 0; j < shown; j++) {
          var qs = asked(M, j);
          if (!qs) { var p = el('p', 'ecm-step'); p.innerHTML = '<b>Move ' + (j + 1) + ' · ' + esc(C.MOVES[j]) + '.</b> ' + esc(M.steps[j].text); wrap.appendChild(p); continue; }
          qs.forEach(function (q) { q.onDone = function () { LE.render(); }; LE.ask(wrap, q); });
        }
        if (shown < NMOVES) {
          if (moveDone(M, shown - 1)) { var nx = el('button', 'btn primary', 'Next move'); nx.type = 'button'; nx.onclick = function () { st.n[M.id] = shown + 1; LE.save(); LE.render(); }; wrap.appendChild(nx); }
          return;
        }
        if (!moveDone(M, NMOVES - 1)) return;
        var note = el('div', 'ecm-slip'); note.innerHTML = '<b>Watch for:</b> ' + esc(M.slip); wrap.appendChild(note);
        if (mi + 1 < C.models.length) { var nm = el('button', 'btn primary', 'Next model'); nm.type = 'button'; nm.onclick = function () { st.i = mi + 1; LE.save(); LE.render(); window.scrollTo(0, 0); }; wrap.appendChild(nm); }
        else wrap.appendChild(el('p', 'msg ok', 'All the models are done. Continue to Build.'));
        LE.gate();
      },
      canLeave: function () { return UI.modelsDone(); },
      teacher: function () {
        var rows = C.models.map(function (M) { return '<li><b>' + M.id + ' (' + REL[M.mode] + '): ' + esc(M.problem) + '</b> Z_eff = ' + atom(M).zeff + ', pull ' + Zf.frac(atom(M)) + '. <i>Watch for: ' + esc(M.slip) + '</i></li>'; }).join('');
        return '<p>Three models on one five-move rail. M1 watch (each step appears on “Next move”). M2 the student types move 2 and move 3, one try, then the step shows. M3 the student answers every move; each unlocks when the last is answered.</p><ul>' + rows + '</ul>';
      } };
  };
  UI.notesSection = function () {
    var done = C.models.filter(modelDone); if (!done.length) return null;
    return { title: 'Models', blocks: done.map(function (M) { return { type: 'box', label: M.id + ' ' + atom(M).name + ':', text: M.steps.map(function (s) { return s.text; }).join(' ') + ' Watch for: ' + M.slip }; }) };
  };

  var css = document.createElement('style');
  css.textContent = '.ecm-grid{display:grid;grid-template-columns:230px 1fr;gap:18px;margin-top:12px;align-items:start}.ecm-rail{list-style:none;margin:0;padding:0;border:1px solid var(--line);border-radius:8px;background:var(--surface)}' +
    '.ecm-rail li{padding:8px 12px;border-bottom:1px solid var(--line);font-size:.95rem;color:var(--muted)}.ecm-rail li:last-child{border-bottom:0}.ecm-rail li.done{color:var(--good)}.ecm-rail li.cur{background:var(--accent-soft,rgba(42,111,181,.12));color:var(--text)}' +
    '.ecm-main{min-width:0}.ecm-step{margin:.6rem 0}.ecm-fig{margin:10px 0;max-width:320px;border:1px solid var(--line);border-radius:8px;background:var(--stage);padding:6px}.ecm-fig figcaption{font-size:.9rem;padding:4px 6px;color:var(--muted)}' +
    '.ecm-slip{margin:12px 0;padding:10px 14px;border:2px solid var(--gold,#c07a00);border-radius:8px}@media (max-width:720px){.ecm-grid{grid-template-columns:1fr}}';
  document.head.appendChild(css);
})();
