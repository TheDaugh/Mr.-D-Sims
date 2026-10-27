/* Models tab for 3.6 Finding Boundary Values (the Formalize tab). Reads SPEC.models and SPEC.MOVES from the Day Card; nothing is re-derived.
     M1 watch      the steps appear on "Next move"; no input
     M2 with me    the student types move 2 (area to the left) and move 3 (the invNorm entry); one try, then the step shows
     M3 you do     the student works all five moves; each unlocks when the last is answered
     M4 watch      T14: the missing mean
     M5 with me    T14: the missing SD; the student types move 3 (the equation) and move 4 (the SD)
   The five moves stay in a rail on the left. Every model ends with its slip as a boxed "Watch for" note. This is NOT NK.routine (its six moves are the z-table routine).
   What the card does not word is asked here from the model's own numbers: M3 moves 1, 4 and 5, and the form of each typed entry (see the PR).
   Feedback on a wrong try is the card's own misconception text, word for word. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, qdone = LK.qdone, SP = window.SPECS['3-6-boundary-values'], C = SP.content, F = SP.figure, UI = window.BV_UI = {};
  var REL = { 'watch': 'Watch', 'with-me': 'With me', 'you-do': 'Your turn' };
  var S = function () { return LE.S(); }, esc = function (s) { return LE.esc(String(s)); };
  var qid = function (M, j) { return 'mod.' + M.id + '.' + j; };
  var head = function (j) { return 'Move ' + (j + 1) + ' · ' + C.MOVES[j]; };
  var MOVES = C.MOVES.length;

  /* the numbers behind the models, read from the card's problem text (tests/unit/stats-11-wiring.test.js checks they agree) */
  var MEAN = 30, SD = 6, MISS = { X: 40, mean: 30, sd: 6, area: 0.9 }, SIDE = { M1: 'left', M2: 'left', M3: 'right' };

  /* ---------- checking a typed entry (pure; exported for the unit test) ---------- */
  var NUM = /^-?(\d+\.?\d*|\.\d+)$/;
  function parseCall(text) {
    var t = String(text).toLowerCase().replace(/\s+/g, '').replace(/−/g, '-').split('=')[0], m = /^invnorm\(([^()]*)\)$/.exec(t);
    if (!m) return null; var a = m[1].split(','); if (a.length !== 3 || !a.every(function (x) { return NUM.test(x); })) return null;
    return a.map(Number);
  }
  var near = function (a, b) { return Math.abs(a - b) < 1e-9; };
  var tailMsg = function (M) { return M.id === 'M3' ? C.misconceptions[1].fix : M.slip; };
  /* want: [area, mean, SD]. Names the card's own slip when the area is the other tail or the arguments are out of order. */
  UI.diagnoseCall = function (M, text, want) {
    var n = parseCall(text);
    if (!n) return { ok: false, msg: 'Type the command with three numbers in the brackets, separated by commas.' };
    if (near(n[0], want[0]) && near(n[1], want[1]) && near(n[2], want[2])) return { ok: true };
    if (n.slice().sort().join() === want.slice().sort().join()) return { ok: false, msg: C.misconceptions[3].fix };
    if (near(n[0], 1 - want[0]) && near(n[1], want[1]) && near(n[2], want[2])) return { ok: false, msg: tailMsg(M) };
    return { ok: false, msg: 'Check the area, the mean and the SD.' };
  };
  /* value = mean + z × SD with the numbers in, the SD left as SD. z is read as typed, within 0.01. */
  UI.diagnoseEq = function (text, X, mean, z) {
    var t = String(text).toLowerCase().replace(/\s+/g, '').replace(/−/g, '-').replace(/[×·x]/g, '*').replace(/\*+/g, '*'), Z = '\\(?(-?[\\d.]+)\\)?', S1 = '\\(?sd\\)?';
    var forms = ['^' + X + '=' + mean + '\\+' + Z + '\\*?' + S1 + '$', '^' + X + '=' + mean + '\\+' + S1 + '\\*?' + Z + '$', '^' + X + '=' + Z + '\\*?' + S1 + '\\+' + mean + '$', '^' + X + '=' + S1 + '\\*?' + Z + '\\+' + mean + '$'];
    for (var i = 0; i < forms.length; i++) { var m = new RegExp(forms[i]).exec(t); if (m) return Math.abs(parseFloat(m[1]) - z) <= 0.01 ? { ok: true } : { ok: false, msg: 'Check the z. It comes from the area to the left.' }; }
    return { ok: false, msg: 'Use value = mean + z × SD, with the numbers in and the SD left as SD.' };
  };

  /* ---------- the questions behind a move ---------- */
  /* the revealed reasoning: the card's step, then (after a wrong try) the card's own note on the slip. The tab re-renders when a move is finished, so the note rides in the saved state. */
  var note = function (M, j) { var st = LE.qs(qid(M, j)); return st && st.note ? '<br>' + esc(st.note) : ''; };
  var worked = function (M, j) { return '<b>Model:</b> ' + esc(M.steps[j].text) + note(M, j); };
  var remember = function (M, j, nearFn) { return nearFn && function (v) { var m = nearFn(v); if (m) LE.qs(qid(M, j)).note = m; return m; }; };
  function numQ(M, j, prompt, answer, abs, nearFn) { return { id: qid(M, j), type: 'num', head: head(j), prompt: prompt, answer: answer, unit: '', abs: abs + 1e-9, tol: 0, maxMiss: 1, keypad: true, near: remember(M, j, nearFn), worked: worked(M, j) }; }
  function choiceQ(M, j, prompt, right, wrongs) { return { id: qid(M, j), type: 'choice', head: head(j), prompt: prompt, options: [right].concat(wrongs), answer: 0, maxMiss: 1, worked: worked(M, j) }; }
  /* a typed entry with a Check button: check(text) returns { ok, msg } */
  function typedQ(M, j, prompt, hint, check, keyText) {
    return { id: qid(M, j), type: 'custom', head: head(j), prompt: prompt, answer: M.answer, keyText: keyText, maxMiss: 1, worked: worked(M, j),
      build: function (host, ctl, api) {
        host.style.display = 'none';
        var row = el('div', 'row'), inp = el('input'), chk = el('button', 'btn', 'Check');
        inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false; inp.setAttribute('aria-label', 'Your entry'); inp.style.minWidth = '16em'; chk.type = 'button';
        row.appendChild(inp); row.appendChild(chk); ctl.appendChild(row); if (hint) ctl.appendChild(el('p', 'hint', hint));
        var self = this, st = LE.qs(self.id); if (api.done) { inp.value = st.val || ''; inp.disabled = chk.disabled = true; }
        function go() {
          if (api.done) return; var r = check(inp.value); st.val = inp.value;
          if (r.ok) { inp.disabled = chk.disabled = true; api.solve(); } else { st.note = r.msg; api.miss('Not quite. ' + r.msg); if (LE.qs(self.id) && LE.qs(self.id).done) inp.disabled = chk.disabled = true; }
        }
        chk.onclick = go; inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
        self.reveal = function () { inp.value = keyText; inp.disabled = chk.disabled = true; };
      } };
  }
  var leftNear = function (M) { return function (v) { return near(v, 1 - M.area) ? tailMsg(M) : ''; }; };
  var pct = function (a) { return Math.round(a * 100); };

  var BUILD = {
    M2: { 2: function (M, j) { return numQ(M, j, 'What is the area to the left of the cutoff?', M.area, 0.0005, leftNear(M)); },
          3: function (M, j) { var w = [M.area, MEAN, SD]; return typedQ(M, j, 'Type the invNorm entry you would use.', '', function (t) { return UI.diagnoseCall(M, t, w); }, 'invNorm(' + w.join(', ') + ')'); } },
    M3: { 1: function (M, j) { var q = pct(1 - M.area); return choiceQ(M, j, 'Which part do you shade?', 'The right ' + q + '%, which leaves ' + pct(M.area) + '% on the left', ['The left ' + q + '%', 'The middle ' + q + '%']); },
          2: function (M, j) { return numQ(M, j, 'What is the area to the left of the cutoff?', M.area, 0.0005, leftNear(M)); },
          3: function (M, j) { var w = [M.area, MEAN, SD]; return typedQ(M, j, 'Type the invNorm entry you would use.', '', function (t) { return UI.diagnoseCall(M, t, w); }, 'invNorm(' + w.join(', ') + ')'); },
          4: function (M, j) { return choiceQ(M, j, 'Where should the value land?', 'Above 30, between 36 and 42', ['Below 30, between 24 and 30', 'Above 42']); },
          5: function (M, j) { return numQ(M, j, 'Fill in the blank. ' + M.steps[4].text.replace(String(M.answer), '_____'), M.answer, 0.1); } },
    M5: { 3: function (M, j) { var z = C.ppf(MISS.area); return typedQ(M, j, 'Put the numbers into value = mean + z × SD. Leave the SD as SD.', 'Use * for times if you need it.', function (t) { return UI.diagnoseEq(t, MISS.X, MISS.mean, z); }, MISS.X + ' = ' + MISS.mean + ' + (' + z.toFixed(2) + ')(SD)'); },
          4: function (M, j) { return numQ(M, j, 'Solve for the SD.', M.answer, 0.1, function (v) { return near(Math.round(v * 10) / 10, Math.round((MISS.X - MISS.mean) * C.ppf(MISS.area) * 10) / 10) ? C.misconceptions[4].fix : ''; }); } }
  };
  UI.BUILD = BUILD;
  /* which moves a model asks the student to answer: the card's typedMoves, or all of them in "you do" */
  UI.typed = function (M) { return M.mode === 'you-do' ? C.MOVES.map(function (_, i) { return i + 1; }) : (M.typedMoves || []); };
  function asked(M, j) {
    if (UI.typed(M).indexOf(j + 1) < 0) return null;
    var b = BUILD[M.id] && BUILD[M.id][j + 1]; return b ? [b(M, j)] : null;
  }
  var moveDone = function (M, j) { var qs = asked(M, j); return !qs || qs.every(function (q) { return qdone(q.id); }); };
  var through = function (M, k, shown) { return shown > k && moveDone(M, k); };
  function modelDone(M) { var st = S().d.mod || { n: {} }; return (st.n[M.id] || 0) >= MOVES && moveDone(M, MOVES - 1); }
  UI.modelDone = modelDone;
  UI.modelsDone = function () { return C.models.every(modelDone); };

  /* the curve for a model, drawn as far as the moves so far have earned it (the area and the answer are never drawn before the student gives them) */
  UI.figure = function (M, shown) {
    var t = function (k) { return through(M, k, shown); }; if (!t(0)) return null;
    if (M.tag === 'T13') { var side = SIDE[M.id]; return { mean: MEAN, sd: SD, units: 'minutes', shade: side, area: side === 'right' ? 1 - M.area : M.area, areaLabel: t(1), boundary: t(2) ? M.answer : '?' }; }
    var solved = t(3);
    return M.id === 'M4' ? { mean: solved ? M.answer : '?', sd: MISS.sd, units: 'minutes', shade: 'left', area: MISS.area, boundary: MISS.X }
      : { mean: MISS.mean, sd: solved ? M.answer : '?', units: 'minutes', shade: 'left', area: MISS.area, boundary: MISS.X };
  };

  /* ---------- the tab ---------- */
  UI.modelsStep = function (K) {
    return { id: 'models', label: 'Models',
      render: function (card, c) {
        var st = S().d.mod = S().d.mod || { i: 0, n: {} };
        K.head(card, 'Models', 'I can find a boundary value in five moves.', 'Watch one, work one with Mr. D, then do one yourself.');
        card.appendChild(el('p', 'hint', 'Need a calculator? Open Concepts, then Calculator.'));
        var chips = el('div', 'row'); card.appendChild(chips);
        C.models.forEach(function (M, k) {
          var b = el('button', 'btn small' + (k === st.i ? ' primary' : ''), (modelDone(M) ? '✓ ' : '') + M.id); b.type = 'button';
          b.disabled = k > st.i && !(k > 0 && modelDone(C.models[k - 1])); b.onclick = function () { st.i = k; LE.save(); LE.render(); }; chips.appendChild(b);
        });
        var mi = Math.min(st.i, C.models.length - 1), M = C.models[mi], shown = st.n[M.id] || 0;
        var grid = el('div', 'bvm-grid'); card.appendChild(grid);
        var rail = el('ol', 'bvm-rail'); rail.setAttribute('aria-label', 'The five moves'); grid.appendChild(rail);
        var cur = Math.max(0, shown - 1);
        C.MOVES.forEach(function (mv, j) {
          var li = el('li', null, (j + 1) + '. ' + mv); if (j < shown && (j < shown - 1 || moveDone(M, j))) li.className = 'done'; if (shown > 0 && j === cur) li.className += ' cur'; rail.appendChild(li);
        });
        var main = el('div', 'bvm-main'); grid.appendChild(main);
        main.appendChild(el('p', 'qhead', 'Model ' + (mi + 1) + ' of ' + C.models.length + ' · ' + REL[M.mode]));
        main.appendChild(el('p', 'qtext', M.problem));
        var wrap = el('div', 'bvm-steps'); main.appendChild(wrap);
        if (shown === 0) { var go = el('button', 'btn primary', 'Move 1'); go.type = 'button'; go.onclick = function () { st.n[M.id] = 1; LE.save(); LE.render(); }; wrap.appendChild(go); return; }
        var fd = UI.figure(M, shown);
        if (fd) { var fg = el('figure', 'bvm-fig'); fg.innerHTML = F.svg(fd); wrap.appendChild(fg); }
        for (var j = 0; j < shown; j++) {
          var qs = asked(M, j);
          if (!qs) { var p = el('p', 'bvm-step'); p.innerHTML = '<b>Move ' + (j + 1) + ' · ' + esc(C.MOVES[j]) + '.</b> ' + esc(M.steps[j].text); wrap.appendChild(p); continue; }
          qs.forEach(function (q) { q.onDone = function () { LE.render(); }; LE.ask(wrap, q); });
        }
        if (shown < MOVES) {
          if (moveDone(M, shown - 1)) { var nx = el('button', 'btn primary', 'Next move'); nx.type = 'button'; nx.onclick = function () { st.n[M.id] = shown + 1; LE.save(); LE.render(); }; wrap.appendChild(nx); }
          return;
        }
        if (!moveDone(M, MOVES - 1)) return;
        var note = el('div', 'bvm-slip'); note.innerHTML = '<b>Watch for:</b> ' + esc(M.slip); wrap.appendChild(note);
        if (mi + 1 < C.models.length) { var nm = el('button', 'btn primary', 'Next model'); nm.type = 'button'; nm.onclick = function () { st.i = mi + 1; LE.save(); LE.render(); window.scrollTo(0, 0); }; wrap.appendChild(nm); }
        else wrap.appendChild(el('p', 'msg ok', 'All the models are done. Continue to Build.'));
        LE.gate();
      },
      canLeave: function () { return UI.modelsDone(); },
      teacher: function () {
        var rows = C.models.map(function (M) { return '<li><b>' + M.id + ' (' + REL[M.mode] + (M.rigor ? ', held first when pace trims' : '') + '): ' + esc(M.problem) + '</b> Answer: ' + M.answer + '. <i>Watch for: ' + esc(M.slip) + '</i></li>'; }).join('');
        return '<p>Five models on one five-move rail. M1: watch (each step appears on “Next move”). M2: the student types move 2 and move 3, one try, then the step shows. M3: the student works every move; each unlocks when the last is answered. M4 and M5 are the missing mean and SD; M5 asks for moves 3 and 4. A wrong try shows the card’s own misconception text.</p><ol>' + rows + '</ol>';
      } };
  };
  /* a section for the student's notes: the steps of each model they finished */
  UI.notesSection = function () {
    var done = C.models.filter(modelDone); if (!done.length) return null;
    return { title: 'Models', blocks: done.map(function (M) { return { type: 'box', label: M.id + ':', text: M.problem + ' ' + M.steps.map(function (s) { return s.text; }).join(' ') + ' Watch for: ' + M.slip }; }) };
  };

  var css = document.createElement('style');
  css.textContent = '.bvm-grid{display:grid;grid-template-columns:230px 1fr;gap:18px;margin-top:12px;align-items:start}.bvm-rail{list-style:none;margin:0;padding:0;border:1px solid var(--line);border-radius:8px;background:var(--stage)}' +
    '.bvm-rail li{padding:8px 12px;border-bottom:1px solid var(--line);font-size:.95rem;color:var(--muted)}.bvm-rail li:last-child{border-bottom:0}.bvm-rail li.done{color:var(--good)}.bvm-rail li.cur{background:var(--accent);color:#fff}' +
    '.bvm-main{min-width:0}.bvm-step{margin:.6rem 0}.bvm-fig{margin:10px 0;max-width:560px;border:1px solid var(--line);border-radius:8px;background:var(--stage);padding:6px}' +
    '.bvm-slip{margin:12px 0;padding:10px 14px;border:2px solid var(--gold);border-radius:8px;background:color-mix(in srgb,var(--gold) 8%,var(--surface))}@media (max-width:720px){.bvm-grid{grid-template-columns:1fr}}';
  document.head.appendChild(css);
})();
