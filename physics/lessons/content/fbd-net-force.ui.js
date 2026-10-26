/* Slot 4 UI for the v2 content (fbd-net-force.v2.content.js). Wiring only: nothing here rewrites a prompt, step, answer or misconception.
   Provides: FBD_UI.modelsStep(K)       the Model problems tab (six moves on a fixed left rail, gradual release)
             FBD_UI.askItem(host, raw, o) one ladder item: numeric (1% tolerance), two-part, choice, with a "derive first" cloze at bands 4 to 6
             FBD_UI.itemState(id)       { done, ok, misses, secs } for an item, two parts folded together
             FBD_UI.morePractice(host, c), FBD_UI.checkItems(card, c), FBD_UI.simButtons(card, band)
   The band is never shown to a student. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, V = window.FBD_V2, SP = window.SPECS['fbd-net-force'], UI = window.FBD_UI = {}, esc = LE.esc, plain = LK.plain;
  var TITLE = { 'l1-source': 'Two objects and the type of force', 'l1-hang': 'A hanging bag at rest', 'l1-net': 'Net force on a line', 'l1-steady': 'Steady motion and friction',
    'l2-a': 'Acceleration from the net force', 'l2-rope': 'A rope and the weight', 'l2-scale': 'A scale at constant speed', 'l2-mass': 'Mass from force and acceleration',
    'l3-pulley': 'A pulley with friction', 'l3-scale': 'A scale reading to acceleration', 'l3-contact': 'The contact force between blocks', 'l3-static': 'Static friction below its limit',
    'l4-atwood': 'Atwood tension', 'l4-rough': 'Tension on a rough floor', 'l4-stack': 'A block on a block', 'l4-stack-hang': 'A hanging stack',
    'l5-rope': 'A rope with mass', 'l5-chain': 'A three-block chain', 'l5-bucket': 'A person in a bucket', 'l5-limits': 'Which formula survives the limits',
    'l6-ramp': 'A force that grows with time', 'l6-chain': 'A chain at the table edge', 'l6-scale': 'An Atwood machine on a scale', 'l6-rope': 'A rope with mass pulling a block' };
  UI.TITLE = TITLE;
  function h32(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  UI.h32 = h32;
  function S() { return LE.S(); }
  function qdone(id) { var s = LE.qs(id); return !!(s && s.done); }
  function fmt(x) { return String(+Number(x).toFixed(3)); }

  /* ---------- one ladder item ---------- */
  function workedHtml(raw) {
    return '<ol class="wk">' + raw.worked.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ol>' + (raw.symbolic ? '<p><b>Symbolic result:</b> ' + esc(raw.symbolic) + '</p>' : '');
  }
  UI.answerText = function (raw) { return raw.type === 'choice' ? plain(raw.options[raw.answer]) : fmt(raw.answer) + (raw.unit ? ' ' + raw.unit : '') + (raw.answer2 != null ? ' and ' + fmt(raw.answer2) + ' ' + (raw.unit2 || raw.unit || '') : ''); };
  UI.itemState = function (id) {
    var a = LE.qs(id), meta = (S().d.im || {})[id] || {}, b = meta.two ? LE.qs(id + '.b') : null;
    if (!a) return null;
    return { done: !!a.done && (!meta.two || !!(b && b.done)), ok: !!a.ok && (!meta.two || !!(b && b.ok)), misses: (a.misses || 0) + (b ? b.misses || 0 : 0), secs: (a.secs || 0) + (b ? b.secs || 0 : 0) };
  };
  /* "Derive first": the symbolic result with one symbol blanked. The student commits it before the number box opens. */
  function deriveCloze(raw, id, band) {
    var head = raw.symbolic.split(',')[0], eq = head.indexOf('='); if (eq < 0) return null;
    var lhs = head.slice(0, eq + 1), rhs = head.slice(eq + 1), re = /[A-Za-zμ][A-Za-z0-9_]*/g, m, toks = [];
    while ((m = re.exec(rhs))) toks.push({ t: m[0], i: m.index });
    if (!toks.length) return null;
    var count = {}; toks.forEach(function (k) { count[LE.norm(k.t)] = (count[LE.norm(k.t)] || 0) + 1; });
    var shown = {}; (lhs.match(/[A-Za-z\u03bc][A-Za-z0-9_]*/g) || []).forEach(function (t) { shown[LE.norm(t)] = 1; });   // a symbol already on the left would give the blank away
    var fresh = toks.filter(function (k) { return !shown[LE.norm(k.t)]; });
    var once = (fresh.length ? fresh : toks).filter(function (k) { return count[LE.norm(k.t)] === 1; }), pool = once.length ? once : (fresh.length ? fresh : toks);
    var pickTok = pool[h32(id + '|' + band) % pool.length], key = LE.norm(pickTok.t), blanks = [], text = '', last = 0, n = 0;
    toks.forEach(function (k) { if (LE.norm(k.t) !== key) return; text += rhs.slice(last, k.i) + '{' + (++n) + '}'; blanks.push([k.t]); last = k.i + k.t.length; });
    text += rhs.slice(last);
    var bank = []; toks.forEach(function (k) { if (bank.indexOf(k.t) < 0) bank.push(k.t); });
    bank.sort(function (a, b) { return h32(id + a) - h32(id + b); });
    return { text: 'Setup: ' + lhs + text, blanks: blanks, bank: bank };
  }
  UI.deriveCloze = deriveCloze;
  /* o = { id, band, head, onDone, tol } */
  UI.askItem = function (host, raw, o) {
    var id = o.id, two = raw.answer2 != null, W = workedHtml(raw), meta = S().d.im = S().d.im || {};
    meta[id] = { two: two };
    function done() { if (o.onDone) o.onDone(); }
    if (raw.type === 'choice') { LE.ask(host, { id: id, type: 'choice', head: o.head, prompt: raw.prompt, options: raw.options, answer: raw.answer, worked: W, maxMiss: 2, onDone: done }); return; }
    var derive = o.band >= 4 && raw.symbolic ? deriveCloze(raw, id, o.band) : null, hasPrompt = true;
    if (derive) {
      LE.ask(host, { id: id + '.d', type: 'cloze', head: o.head + ' · derive first', prompt: raw.prompt, text: derive.text, blanks: derive.blanks, bank: derive.bank, hint: 'Look at the symbols named in the problem.', maxMiss: 2, onDone: function () { LE.render(); } });
      if (!qdone(id + '.d')) return;
      hasPrompt = false;
    }
    var hint = 'Check the signs and the units, then try again.', unit1 = raw.unit;
    LE.ask(host, { id: id, type: 'num', head: derive ? o.head + ' · now the number' : o.head, prompt: hasPrompt ? raw.prompt : 'Now the number.', answer: raw.answer, unit: unit1, tol: o.tol || 0.01, maxMiss: 2, keypad: true, hint: hint, worked: two ? '' : W, onDone: function () { if (two) LE.render(); else done(); } });
    if (two && qdone(id)) LE.ask(host, { id: id + '.b', type: 'num', head: 'Second answer from the same problem', prompt: 'Give the second value the problem asks for.', answer: raw.answer2, unit: raw.unit2 || raw.unit, tol: o.tol || 0.01, maxMiss: 2, keypad: true, hint: hint, worked: W, onDone: done });
  };

  /* ---------- Practice and Check ---------- */
  UI.rungOf = function (band) { return ['A', 'A', 'B', 'B', 'C', 'C'][Math.max(1, Math.min(6, band)) - 1]; };
  UI.morePractice = function (host, c) {
    var s = c.S, M = s.d.more = s.d.more || { n: 0, log: [] }, n = M.n, b = LE.band(), raw = V.make(b, h32(s.first + '|more|' + n + '|' + b)), id = 'more.' + n + '.' + b, box = el('div');
    host.appendChild(box);
    function nextBtn() {
      if (box.querySelector('.nextq')) return;
      var row = el('div', 'row nextq'), nb = el('button', 'btn primary', 'Next question'); nb.type = 'button'; row.appendChild(nb); box.appendChild(row);
      nb.onclick = function () {
        var st = UI.itemState(id), m = st.misses, nbd = m === 0 ? b + 1 : (m === 1 ? b : b - 1);
        M.log.push({ skill: raw.id, title: TITLE[raw.id] || raw.id, band: b, misses: m, ok: st.ok, secs: st.secs, p: plain(raw.prompt), a: UI.answerText(raw), w: plain(raw.worked.join(' ')) });
        LE.setBand(nbd, 'more'); M.n++; LE.save(); LE.render();
      };
    }
    UI.askItem(box, raw, { id: id, band: b, head: 'Practice ' + (n + 1) + ' · ' + (TITLE[raw.id] || ''), onDone: nextBtn });
    var st0 = UI.itemState(id); if (st0 && st0.done) nextBtn();
  };
  UI.checkItems = function (card, c) {
    var s = c.S, b = LE.band();
    ['C1', 'C2'].forEach(function (id, i) {
      var raw = V.make(b, h32(s.first + '|chk|' + i + '|' + b)), host = el('div'); card.appendChild(host);
      UI.askItem(host, raw, { id: id, band: b, head: 'Check ' + (i + 1), onDone: function () { var st = UI.itemState(id); (s.d.chk = s.d.chk || {})[id] = { band: b, skill: raw.id, ok: st.ok, misses: st.misses, secs: st.secs }; LE.save(); LE.gate(); } });
    });
  };

  /* ---------- sims, shown inside the lesson page (a new tab would count as leaving locked mode) ---------- */
  UI.simButtons = function (card, band, only) {
    var sims = V.SIMS.filter(function (m) { return m.bands.indexOf(band) >= 0 && (!only || only.indexOf(m.id) >= 0); });
    if (!sims.length) return;
    var wrap = el('div', 'simlinks'); card.appendChild(wrap);
    wrap.appendChild(el('h3', null, 'Try it in a sim'));
    var row = el('div', 'row'), frame = el('div'); wrap.appendChild(row); wrap.appendChild(frame);
    sims.forEach(function (m) {
      var b = el('button', 'btn', m.title); b.type = 'button';
      b.onclick = function () { frame.textContent = ''; var f = el('iframe'); f.src = 'sims/' + m.id + '.html?band=' + band; f.title = m.title; f.style.cssText = 'width:100%;height:640px;border:1px solid var(--line);border-radius:8px;margin-top:10px;background:var(--surface)'; frame.appendChild(f); f.scrollIntoView({ block: 'nearest' }); };
      row.appendChild(b);
    });
  };

  /* ---------- Model problems ---------- */
  var REL = { 'I do': 'Watch', 'we do': 'With me', 'you do': 'Your turn' };
  var PRED = { M1: { o: ['More than the pull of gravity', 'Equal to the pull of gravity', 'Less than the pull of gravity'], a: 1, key: 'equal' }, M2: { o: ['Constant speed', 'Speeds up', 'Slows down'], a: 1, key: 'speeds up' },
    M3: { o: ['Heavier', 'Equal', 'Lighter'], a: 0, key: 'heavier' }, M4: { o: ['More than 19.6 N', 'Equal to 19.6 N', 'Less than 19.6 N'], a: 2, key: 'less' }, M5: { o: ['More than 24 N', 'Equal to 24 N', 'Less than 24 N'], a: 2, key: 'less' } };
  UI.PRED = PRED;
  /* free-body diagrams per model: [{dir, N, label}] with arrow length proportional to N inside each diagram */
  function diagram(list, alt) {
    var mx = 0; list.forEach(function (f) { mx = Math.max(mx, f.N); });
    return SP.fbd(list.map(function (f) { return { dir: f.dir, len: Math.max(24, Math.round(f.N / mx * 80)), label: f.label }; }), { alt: alt });
  }
  var DIAG = {
    M1: function () { return [['The book', [{ dir: 'up', N: 19.6, label: 'N' }, { dir: 'down', N: 19.6, label: 'W' }], 'Book: N up, W down, same length']]; },
    M2: function () { return [['The crate', [{ dir: 'up', N: 117.6, label: 'N' }, { dir: 'down', N: 117.6, label: 'W' }, { dir: 'right', N: 80, label: 'F' }, { dir: 'left', N: 50, label: 'f' }], 'Crate: F right 80 N, f left 50 N, N and W equal']]; },
    M3: function () { return [['The student', [{ dir: 'up', N: 678, label: 'N' }, { dir: 'down', N: 588, label: 'W' }], 'Student: N up 678 N longer than W down 588 N']]; },
    M4: function () { return [['Block 1 (4.0 kg)', [{ dir: 'right', N: 13.1, label: 'T' }, { dir: 'up', N: 39.2, label: 'N' }, { dir: 'down', N: 39.2, label: 'W' }], 'Block 1: T right 13.1 N, N and W equal'], ['Block 2 (2.0 kg)', [{ dir: 'up', N: 13.1, label: 'T' }, { dir: 'down', N: 19.6, label: 'W2' }], 'Block 2: T up 13.1 N, W2 down 19.6 N']]; },
    M5: function () { return [['Both blocks together', [{ dir: 'right', N: 24, label: 'F' }, { dir: 'up', N: 78.4, label: 'N' }, { dir: 'down', N: 78.4, label: 'W' }], 'System: F right 24 N, N and W equal'], ['The 5.0 kg block alone', [{ dir: 'right', N: 15, label: 'C' }, { dir: 'up', N: 49, label: 'N' }, { dir: 'down', N: 49, label: 'W' }], 'Block: C right 15 N, N and W equal']]; }
  };
  function diagOption(list, alt) { return { svg: diagram(list, alt), label: '', alt: alt }; }
  /* the student's answers for "with me" (moves 4 and 5) and "your turn" (all six): each is one try, then the authored step shows */
  function askFor(M, j) {
    var step = '<b>Model:</b> ' + esc(M.steps[j]), id = 'mod.' + M.id + '.' + j, mv = V.MOVES[j], head = 'Move ' + mv.n + ' · ' + mv.name;
    if (M.release === 'we do' && j === 3) return [{ id: id, type: 'text', head: head, prompt: M.id === 'M3' ? 'Type the sum of forces on the student, in symbols.' : 'Type one equation for each block, in symbols.', minWords: 1, rows: 1, label: 'Sum of forces', worked: step }];
    if (M.release === 'we do' && j === 4) {
      if (M.answer2 != null) return [{ id: id, type: 'num', head: head, prompt: 'Solve for the acceleration. Carry units.', answer: M.answer, unit: M.unit, tol: 0.02, maxMiss: 1, keypad: true, worked: '' }, { id: id + 'b', type: 'num', head: head, prompt: 'Now the string tension.', answer: M.answer2, unit: 'N', tol: 0.02, maxMiss: 1, keypad: true, worked: step }];
      return [{ id: id, type: 'num', head: head, prompt: 'Solve for the scale reading. Carry units.', answer: M.answer, unit: M.unit, tol: 0.02, maxMiss: 1, keypad: true, worked: step }];
    }
    if (M.release !== 'you do') return null;
    var P = { 0: { prompt: 'Which system do you draw first?', options: ['Both blocks together', 'The 5.0 kg block alone', 'The 3.0 kg block alone'] },
      1: { prompt: 'Which free-body diagram is right for the 5.0 kg block alone?', grid: true, options: [
        diagOption([{ dir: 'right', N: 15, label: 'C' }, { dir: 'up', N: 49, label: 'N' }, { dir: 'down', N: 49, label: 'W' }], 'C right, N and W equal'),
        diagOption([{ dir: 'right', N: 24, label: 'F' }, { dir: 'up', N: 49, label: 'N' }, { dir: 'down', N: 49, label: 'W' }], 'F right 24 N, N and W equal'),
        diagOption([{ dir: 'up', N: 49, label: 'N' }, { dir: 'down', N: 49, label: 'W' }], 'N and W only, no horizontal arrow'),
        diagOption([{ dir: 'right', N: 24, label: 'C' }, { dir: 'left', N: 9, label: 'f' }, { dir: 'up', N: 49, label: 'N' }, { dir: 'down', N: 49, label: 'W' }], 'C right and f left, N and W equal')] },
      2: { prompt: 'Which way is positive?', options: ['Right, the way the push goes', 'Left', 'Down'] },
      3: { prompt: 'Write the sum of forces on the 5.0 kg block.', options: ['C = m2 a', 'F = m2 a', 'C − F = m2 a'] },
      5: { prompt: 'Does your answer pass the check?', options: ['Yes. It is less than 24 N, and the 3.0 kg block keeps 9 N, which gives it 3.0 m/s² too.', 'No. It should equal 24 N.', 'No. It should be bigger than 24 N.'] } }[j];
    if (j === 4) return [{ id: id, type: 'num', head: head, prompt: 'Solve for the contact force. Carry units.', answer: M.answer, unit: M.unit, tol: 0.02, maxMiss: 1, keypad: true, worked: step }];
    return [{ id: id, type: 'choice', head: head, prompt: P.prompt, options: P.options, answer: 0, grid: !!P.grid, maxMiss: 1, worked: step }];
  }
  function moveDone(M, j) {
    var qs = askFor(M, j); if (!qs) return true;
    return qs.every(function (q) { return qdone(q.id); });
  }
  function modelDone(M, st) {
    var n = st.n[M.id] || 0; if (n < 6 || !moveDone(M, 5)) return false;
    return !M.youDo || qdone('mod.' + M.id + '.yd');
  }
  UI.modelDone = function (M) { return modelDone(M, S().d.mod || { n: {} }); };
  UI.modelsLeft = function () { var st = S().d.mod || { n: {} }, total = LE.items('models', 5); for (var i = 0; i < total; i++) if (!modelDone(V.MODELS[i], st)) return false; return true; };

  UI.modelsStep = function (K) {
    return { id: 'models', label: 'Model problems',
      render: function (card, c) {
        var s = c.S, st = s.d.mod = s.d.mod || { i: 0, n: {} }, total = LE.items('models', 5);
        K.head(card, 'Model problems', 'I can solve a force problem in six moves.', 'Watch two, work two with Mr. D, then do one yourself.');
        var chips = el('div', 'row'); card.appendChild(chips);
        V.MODELS.slice(0, total).forEach(function (M, k) {
          var b = el('button', 'btn small' + (k === st.i ? ' primary' : ''), (modelDone(M, st) ? '✓ ' : '') + M.id); b.type = 'button'; b.disabled = k > st.i && !modelDone(V.MODELS[k - 1], st) && k !== st.i;
          b.onclick = function () { st.i = k; LE.save(); LE.render(); }; chips.appendChild(b);
        });
        var mi = Math.min(st.i, total - 1), M = V.MODELS[mi], shown = st.n[M.id] || 0;
        var grid = el('div', 'mgrid'); card.appendChild(grid);
        var rail = el('ol', 'mrail'); rail.setAttribute('aria-label', 'The six moves'); grid.appendChild(rail);
        var cur = Math.max(0, shown - 1);
        V.MOVES.forEach(function (mv, j) {
          var li = el('li'); if (j < shown && (j < shown - 1 || moveDone(M, j))) li.className = 'done'; if (shown > 0 && j === cur) li.className += ' cur';
          li.appendChild(el('b', null, mv.n + '. ' + mv.name)); if (shown > 0 && j === cur) li.appendChild(el('span', null, mv.say)); rail.appendChild(li);
        });
        var main = el('div', 'mmain'); grid.appendChild(main);
        main.appendChild(el('p', 'qhead', 'Model ' + (mi + 1) + ' of ' + total + ' · ' + REL[M.release]));
        main.appendChild(el('p', 'qtext', M.title + '.')); main.appendChild(el('p', null, M.prompt));
        var P = PRED[M.id];
        LE.ask(main, { id: 'mod.' + M.id + '.pred', type: 'choice', head: 'Predict first', prompt: M.predict, options: P.o, answer: P.a, fixed: true, maxMiss: 1, worked: esc(M.predictAnswer), onDone: function () { LE.render(); } });
        if (!qdone('mod.' + M.id + '.pred')) return;
        var wrap = el('div', 'msteps'); main.appendChild(wrap);
        if (shown === 0) { var go = el('button', 'btn primary', 'Move 1'); go.type = 'button'; go.onclick = function () { st.n[M.id] = 1; LE.save(); LE.render(); }; wrap.appendChild(go); return; }
        var showFbd = shown >= 2 && (M.release !== 'you do' || moveDone(M, 1));
        if (showFbd) { var dg = el('div', 'mfbd'); DIAG[M.id]().forEach(function (d) { var f = el('figure'); f.innerHTML = diagram(d[1], d[2]); f.appendChild(el('figcaption', null, d[0] + ': ' + d[1].map(function (x) { return x.label + ' = ' + fmt(x.N) + ' N'; }).join(', '))); dg.appendChild(f); }); wrap.appendChild(dg); }
        for (var j = 0; j < shown; j++) {
          var qs = askFor(M, j);
          if (!qs) { var p = el('p', 'mstep'); p.innerHTML = '<b>Move ' + (j + 1) + ' · ' + esc(V.MOVES[j].name) + '.</b> ' + esc(M.steps[j]); wrap.appendChild(p); continue; }
          qs.forEach(function (q, k) { if (k === 0 || qdone(qs[k - 1].id)) { q.onDone = function () { LE.render(); }; LE.ask(wrap, q); } });
        }
        if (shown < 6) {
          if (moveDone(M, shown - 1)) { var nx = el('button', 'btn primary', 'Next move'); nx.type = 'button'; nx.onclick = function () { st.n[M.id] = shown + 1; LE.save(); LE.render(); }; wrap.appendChild(nx); }
          return;
        }
        if (!moveDone(M, 5)) return;
        var note = el('div', 'mslip'); note.innerHTML = '<b>Watch for:</b> ' + esc(M.slip); wrap.appendChild(note);
        if (M.youDo) {
          LE.ask(wrap, { id: 'mod.' + M.id + '.yd', type: 'num', head: 'Your turn', prompt: M.youDo, answer: M.youDoAnswer, unit: 'N', tol: 0.02, maxMiss: 1, keypad: true, worked: 'Same law, N = m(g + a), with a = −1.5. The scale reads ' + M.youDoAnswer + ' N.', onDone: function () { LE.render(); } });
          if (!qdone('mod.' + M.id + '.yd')) return;
        }
        if (mi + 1 < total) { var nm = el('button', 'btn primary', 'Next model'); nm.type = 'button'; nm.onclick = function () { st.i = mi + 1; LE.save(); LE.render(); window.scrollTo(0, 0); }; wrap.appendChild(nm); }
        else wrap.appendChild(el('p', 'msg ok', 'All the model problems are done. Continue to the class check.'));
        LE.gate();
      },
      canLeave: function () { return UI.modelsLeft(); },
      teacher: function () {
        var rows = V.MODELS.map(function (M) { return '<li><b>' + M.id + ' (' + REL[M.release] + '): ' + esc(M.title) + '.</b> ' + esc(M.prompt) + ' <b>Answer: ' + fmt(M.answer) + ' ' + M.unit + (M.answer2 != null ? ' and ' + fmt(M.answer2) + ' N' : '') + (M.youDoAnswer ? '; follow-up ' + M.youDoAnswer + ' N' : '') + '.</b> Predict: ' + esc(M.predictAnswer) + ' <i>Watch for: ' + esc(M.slip) + '</i></li>'; }).join('');
        return '<p>Five models on the same six-move rail. M1 and M2: watch (the steps appear on the button). M3 and M4: the student types move 4 and move 5, one try, then the step shows. M5: the student answers every move, each unlocking the next. When the class is behind, the tab shrinks to the first three.</p><ol>' + rows + '</ol>';
      } };
  };

  var css = document.createElement('style');
  css.textContent = '.mgrid{display:grid;grid-template-columns:230px 1fr;gap:18px;margin-top:12px;align-items:start}.mrail{list-style:none;margin:0;padding:0;border:1px solid var(--line);border-radius:8px;background:var(--stage)}' +
    '.mrail li{padding:8px 12px;border-bottom:1px solid var(--line);font-size:.95rem;display:flex;flex-direction:column;gap:2px;color:var(--muted)}.mrail li:last-child{border-bottom:0}.mrail li.done{color:var(--good)}' +
    '.mrail li.cur{background:var(--accent);color:#fff}.mrail li.cur span{font-size:.85rem;font-weight:400}.mmain{min-width:0}.mfbd{display:flex;flex-wrap:wrap;gap:12px;margin:10px 0}.mfbd figure{margin:0;flex:1 1 260px;max-width:340px;border:1px solid var(--line);border-radius:8px;background:var(--stage);padding:6px}' +
    '.mfbd figcaption{font:600 .85rem var(--mono);color:var(--muted);text-align:center}.mstep{margin:.6rem 0}.mslip{margin:12px 0;padding:10px 14px;border:2px solid var(--gold);border-radius:8px;background:color-mix(in srgb,var(--gold) 8%,var(--surface))}' +
    '.wk{margin:.2rem 0 .2rem 1.2rem;padding:0}@media (max-width:760px){.mgrid{grid-template-columns:1fr}}';
  document.head.appendChild(css);
})();
