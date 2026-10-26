/* Slot 4: Free-body diagrams and net force. The wiring is LK.standard (engine/standard.js) with five steps replaced, each copied from
   standard.js and edited: Warm-up (the Vectors and Proportions Check), Huddle (formative gate + split code), Build (three rungs, hidden bands),
   Check (diagram + net force), and the Wrap-up report. The teaching itself is in fbd-net-force.spec.js. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, SP = window.SPECS['fbd-net-force'], ID = SP.id, qdone = LK.qdone, plain = LK.plain, UI = window.FBD_UI;
  var RUNG = { source: 'A', catalog: 'A', fbd: 'B', netdir: 'B', net: 'B', pair: 'C' };      // never shown to the student
  var TYPE = { ok: 'C', missing: 'M', extra: 'X', size: 'S' };
  function skillById(id) { return SP.skills.filter(function (s) { return s.id === id; })[0]; }
  function skillQ(sk, band, tag, n) { var q = sk.gen(band, LE.seedRng(tag + ':' + n + ':' + band)); q.id = tag + '.' + n; q.type = q.type || 'num'; q.head = sk.title; q.keypad = true; return q; }

  var cfg = LK.standard(SP, { prefix: 'FBD', explore: function (card, c, K) {
    /* The force catalog: click a force, its arrow appears on the block and its row fills in. State is saved for the notes. */
    var S = c.S, seen = S.d.cat = S.d.cat || {}, F = SP.FORCE;
    var box = el('div', 'sim'); card.appendChild(box); card.appendChild(el('p', 'hint', 'Click each force. Its arrow appears and its row in the catalog fills in.'));
    var row = el('div', 'row'); card.appendChild(row);
    var arrows = { W: Object.assign(F('down', 62, 'W'), {}), N: Object.assign(F('up', 62, 'N'), { off: 16 }), T: Object.assign(F('up', 44, 'T'), { off: -16 }), f: F('left', 62, 'f'), F: F('right', 62, 'F') };
    var order = ['W', 'N', 'T', 'f', 'F'], tbl = el('div', 'scroll'); card.appendChild(tbl);
    function draw() { box.innerHTML = SP.fbd(order.filter(function (k) { return seen[k]; }).map(function (k) { return arrows[k]; }), { alt: 'Block with the forces you chose' }); box.style.maxWidth = '480px'; }
    function table() {
      var t = el('table', 'data'); t.innerHTML = '<thead><tr><th>Force</th><th>Source</th><th>Contact or field</th><th>Direction</th></tr></thead>';
      var tb = el('tbody'); SP.catalogRows.forEach(function (r) { var tr = el('tr'), on = seen[r.sym] || c.key; tr.innerHTML = '<td><b>' + r.f + '</b> (' + r.sym + ')</td><td>' + (on ? r.source : '') + '</td><td>' + (on ? r.kind : '') + '</td><td>' + (on ? r.dir : '') + '</td>'; tb.appendChild(tr); });
      t.appendChild(tb); tbl.textContent = ''; tbl.appendChild(t);
    }
    SP.catalogRows.forEach(function (r) { var b = el('button', 'btn' + (seen[r.sym] ? ' primary' : ''), r.f.replace(' (weight)', '')); b.type = 'button'; b.onclick = function () { seen[r.sym] = !seen[r.sym]; LE.save(); b.className = 'btn' + (seen[r.sym] ? ' primary' : ''); draw(); table(); }; row.appendChild(b); });
    draw(); table();
    UI.simButtons(card, LE.band(), ['arrow']);
  } });
  cfg.maxBand = 6;
  cfg.lock = true;
  var K = LK.for({ id: ID, prefix: 'FBD', identity: 'id', title: SP.title, lib: { skills: SP.skills, preds: [] } }), T = K.TABS;
  cfg.steps.splice(cfg.steps.map(function (x) { return x.id; }).indexOf('explore') + 1, 0, UI.modelsStep(K));
  function stepIdx(id) { for (var i = 0; i < cfg.steps.length; i++) if (cfg.steps[i].id === id) return i; return -1; }
  function bitsOf(S) { return SP.vp.map(function (v) { var s = LE.qs(v.id); return s && s.ok && s.misses === 0 ? 1 : 0; }); }

  /* ---------- Warm-up: the Vectors and Proportions Check. Six items, three parts, one try each. Sorts by direction, arithmetic, proportion. ---------- */
  cfg.steps[stepIdx('warmup')] = { id: 'warmup', label: T.warmup,
    render: function (card, c) {
      var S = c.S; K.head(card, 'Warm-up', 'I can add forces on a line and use ratios.', 'Up next: you make three predictions.');
      card.appendChild(el('p', 'hint', 'Six quick questions. One try each. Nothing is graded.'));
      SP.vp.forEach(function (v, i) { var q = v.gen(LE.seedRng('vp:' + v.id)); q.id = v.id; q.type = q.type || 'num'; q.head = 'Question ' + (i + 1) + ' of ' + SP.vp.length; q.maxMiss = 1; q.keypad = true; q.onDone = function () { sortStudent(S); LE.save(); LE.gate(); }; LE.ask(card, q); });
      if (S.d.vp) card.appendChild(el('p', 'msg ok', 'Warm-up saved. Let’s go.' + (S.d.vp.scaffold ? ' Your Build tab starts with an arrow table.' : '')));
    },
    canLeave: function (c) { return SP.vp.every(function (v) { return qdone(v.id); }); },
    teacher: function (c) { var d = c.S.d.vp; return '<p><b>Vectors and Proportions Check</b> (the pre-assessment, run as the opening). Six items, three parts: add forces on a line (V1, V2), direction of a net force (V3, V4), ratio table (V5, V6). One try each. Answers: ' + SP.vp.map(function (v) { var q = v.gen(LE.seedRng('vp:' + v.id)); return v.id + ' ' + (q.type === 'choice' ? plain(q.options[q.answer]) : q.answer + ' ' + q.unit); }).join('; ') + '.</p><p><b>Sorting.</b> A miss on either direction item puts a one-dimensional arrow table at the start of Build. Six clean first tries flags the student for the slot 20 incline extension. Start band from the count right: 0 to 2 right is band 1, 3 to 4 is band 2, 5 to 6 is band 3. Higher bands are earned in Practice and Check.</p>' + (d ? '<p>This device: right ' + d.right + ' of 6; sorted into: ' + (d.scaffold ? 'arrow table first' : 'no scaffold') + (d.fluent ? '; flagged for slot 20' : '') + '.</p>' : ''); } };
  function sortStudent(S) {
    if (!SP.vp.every(function (v) { return qdone(v.id); })) return;
    var bits = bitsOf(S), right = bits.reduce(function (a, b) { return a + b; }, 0), dirMiss = !bits[2] || !bits[3];
    S.d.vp = { bits: bits, right: right, scaffold: dirMiss, fluent: right === 6 };
    if (!S.band0) { S.band0 = [1, 1, 1, 2, 2, 3, 3][right]; S.band = S.band0; S.warm = right; S.bandLog.push('start:' + S.band0); }
  }

  /* ---------- Huddle: formative gate (three diagram checks, one try) -> split code -> Mr. D teaches, the student writes -> teacher code ---------- */
  cfg.steps[stepIdx('huddle')] = { id: 'huddle', label: T.huddle, timed: true,
    render: function (card, c) {
      var S = c.S; K.head(card, 'Huddle with Mr. D', SP.huddleTarget, 'Check in on three diagrams. Mr. D reads the class split.');
      S.d.hud = S.d.hud || {}; var gate = el('div'); card.appendChild(gate);
      gate.appendChild(el('h3', null, 'Check-in: pick the right diagram'));
      SP.gate.forEach(function (g) { var q = {}; for (var k in g) q[k] = g[k]; q.head = 'Check-in: ' + g.title; q.maxMiss = 1; q.onDone = function () { gateDone(S); LE.save(); LE.render(); }; LE.ask(gate, q); });
      if (gateDone(S) || c.key) {
        var g2 = S.d.gate;
        if (g2) { var p = el('p', 'qtext'); p.innerHTML = 'Your check-in code: <b class="stamp" style="font-size:1.4rem">' + g2.code + '</b>'; card.appendChild(p);
          card.appendChild(el('p', 'hint', 'C: right. M: a force missing. X: an extra force. S: arrows the wrong size. Show this to Mr. D.')); }
        K.codeBox(card, c, 'h1', 'Huddle code');
        var back = el('div', 'row'), bb = el('button', 'btn', 'Back to Model problems'); bb.type = 'button'; bb.onclick = function () { LE.forceGoto('models'); }; back.appendChild(bb); card.appendChild(back);
      } else card.appendChild(el('p', 'hint', 'Answer all three to see your check-in code.'));
    },
    canLeave: function (c) { return !!c.S.d.gate && !!c.S.huddle.h1; },
    teacher: function (c) {
      var code = LE.codeFor(ID, 'h1');
      return '<p><b>Huddle code: ' + code + '</b>. Students first answer three fixed diagram checks (one try each: rest, steady motion, speeding up), then see a three-letter check-in code: C right, M a force missing, X an extra “force of motion” or invented force, S arrows the wrong size. <b>Read the class split before you give the huddle code.</b> Ask for the codes aloud, or open the <a href="fbd-net-force-projector.html">projector page</a> and tap the class split (it lists the most common error and the next-day warm-up).</p><p>Keep it to about three minutes: read the split, name the most common slip, then send students back to the Model problems tab. The huddle is pulled in at minute ' + SP.pacing.huddles[0].atMin + ' by the clock, and students return to where they were.</p>' + (c.S.d.gate ? '<p>This device: check-in code <b>' + c.S.d.gate.code + '</b>.</p>' : '');
    } };
  function gateDone(S) {
    if (S.d.gate) return true;
    if (!SP.gate.every(function (g) { return qdone(g.id); })) return false;
    var types = SP.gate.map(function (g) { var st = LE.qs(g.id), w = st && st.wrong && st.wrong.length ? st.wrong[0] : null; return TYPE[w == null ? 'ok' : g.options[w].type]; });
    S.d.gate = { types: types, code: types.join(''), right: types.filter(function (t) { return t === 'C'; }).length }; return true;
  }

  /* ---------- Build: about six simple questions, then diagrams, then harder closing questions. Three rungs (A core, B transfer, C extension), hidden bands. ---------- */
  function buildPlan(n, band) {
    var full = [['source', band], ['source', band], ['source', band], ['catalog', band], ['catalog', band], ['catalog', band],
      ['fbd', 1], ['fbd', 2], ['fbd', band >= 4 ? 4 : 3], ['netdir', band], ['net', band], ['pair', band]];
    var compact = [['source', band], ['catalog', band], ['fbd', 1], ['fbd', band >= 4 ? 4 : 3], ['netdir', band], ['net', band]];
    return n >= 12 ? full : compact;
  }
  function scaffoldQs(S) {
    var r = LE.seedRng('scaffold'), a = 3 + Math.floor(r() * 6), b = 2 + Math.floor(r() * 4), c2 = 1 + Math.floor(r() * (a + b - 2)), net = a + b - c2;
    return [
      { id: 'sc.0', type: 'num', head: 'Arrow table', prompt: 'Forces to the right: ' + a + ' N and ' + b + ' N. Forces to the left: ' + c2 + ' N. Add the forces to the RIGHT. Total?', answer: a + b, unit: 'N', hint: 'Same direction: add.', worked: a + ' + ' + b + ' = ' + (a + b) + ' N to the right.', keypad: true },
      { id: 'sc.1', type: 'num', head: 'Arrow table', prompt: 'Total to the LEFT: just ' + c2 + ' N. Now subtract: right minus left. How big is the net force?', answer: net, unit: 'N', hint: 'Right total minus left total.', worked: (a + b) + ' − ' + c2 + ' = ' + net + ' N.', keypad: true },
      { id: 'sc.2', type: 'choice', head: 'Arrow table', prompt: 'Which way does the net force point?', options: ['To the right', 'To the left', 'It is zero'], answer: 0, hint: 'The bigger total wins.', worked: 'The right total (' + (a + b) + ' N) is bigger, so the net force points right.' }
    ];
  }
  cfg.steps[stepIdx('build')] = { id: 'build', label: T.build,
    render: function (card, c) {
      var S = c.S; K.head(card, T.build, 'I can draw a free-body diagram and find the net force.', 'Up next: practice at your level.');
      var blog = S.d.blog = S.d.blog || [];
      if (S.d.vp && S.d.vp.scaffold) { card.appendChild(el('h3', null, 'Arrow table')); card.appendChild(el('p', 'hint', 'Forces to the right: add. Forces to the left: add. Then subtract.')); scaffoldQs(S).forEach(function (q) { LE.ask(card, q); }); }
      var band = LE.band(), plan = buildPlan(LE.items('build', 12), S.d.bband || (S.d.bband = Math.min(4, band))), n = plan.length;
      plan.forEach(function (it, i) {
        var sk = skillById(it[0]), q = skillQ(sk, it[1], 'b', i); q.head = (i < 6 && n === 12 ? 'Question ' : 'Question ') + (i + 1) + ' of ' + n + ' · ' + sk.title;
        q.onDone = function () { var st = LE.qs(q.id); if (!blog.some(function (x) { return x.id === q.id; })) { blog.push({ id: q.id, skill: sk.id, title: sk.title, band: it[1], misses: st.misses, ok: !!st.ok, secs: st.secs || 0, p: plain(q.prompt), a: LK.answerText(q), w: plain(q.worked), fbd: it[0] === 'fbd' }); } LE.save(); LE.gate(); };
        LE.ask(card, q);
      });
    },
    canLeave: function (c) {
      var S = c.S; if (S.d.vp && S.d.vp.scaffold && !['sc.0', 'sc.1', 'sc.2'].every(qdone)) return false;
      var n = buildPlan(LE.items('build', 12), S.d.bband || Math.min(4, LE.band())).length; for (var i = 0; i < n; i++) if (!qdone('b.' + i)) return false; return true;
    },
    teacher: function (c) {
      var plan = buildPlan(12, c.band || 2), rows = plan.map(function (it, i) { var sk = skillById(it[0]), q = sk.gen(it[1], LE.seedRng('b:' + i + ':' + it[1])); return '<li><b>' + (i + 1) + '. ' + sk.title + '</b> (rung ' + RUNG[it[0]] + ', band ' + it[1] + '): ' + plain(q.prompt) + ' <b>Answer: ' + LK.answerText(q) + '.</b> ' + plain(q.worked) + ' <i>Misconception: ' + q.misc + '</i></li>'; }).join('');
      return '<p>Twelve items in the order: six simple questions on arrows, sources and the force catalog (rung A), three diagrams in the order rest, steady motion, speeding up (rung B), then closing questions on net direction, net force and two objects (rungs B and C). When the class falls behind, Build shrinks to six items. The student never sees a rung or a band. A clean first try moves the next question up a band, one miss holds, two misses move it down with the reasoning shown. Sample items for band ' + (c.band || 2) + ':</p><ol>' + rows + '</ol>';
    } };

  /* ---------- Practice: the v2 ladder (six hidden bands). Never runs out; a clean first try moves up, one miss holds, two misses move down with the reasoning shown. ---------- */
  K.morePractice = UI.morePractice;
  cfg.steps[stepIdx('practice')] = { id: 'practice', label: T.practice,
    render: function (card, c) {
      K.head(card, T.practice, 'I can solve force problems at my level.', 'Up next: a two-question check.');
      UI.morePractice(card, c);
      UI.simButtons(card, LE.band());
    },
    canLeave: function (c) { return (c.S.d.more && c.S.d.more.n || 0) >= LE.items('practice', 4); },
    teacher: function (c) {
      var rows = [1, 2, 3, 4, 5, 6].map(function (b) { return '<li><b>Band ' + b + '</b> (rung ' + UI.rungOf(b) + '): ' + SP.v2.LADDER[b].map(function (g) { var q = g(SP.v2.mk(7 * b + 3)); return '<i>' + UI.TITLE[q.id] + '</i>: ' + plain(q.prompt) + ' <b>Answer: ' + UI.answerText(q) + '.</b> ' + plain(q.worked.join(' ')) + (q.symbolic ? ' <i>Symbolic: ' + plain(q.symbolic) + '</i>' : '') + ' <i>Misconception: ' + plain(q.misc) + '</i>'; }).join('</li><li style="list-style:none">') + '</li>'; }).join('');
      return '<p>Practice never runs out. Everyone does at least four; the hidden band moves up after a clean first try, holds after one miss, and drops after two with the reasoning shown. Bands 4 to 6 ask a “derive first” cloze before the number box opens. This student: band ' + LE.band() + '. The student is shown sims only for their band. One sample per band follows.</p><ul>' + rows + '</ul>';
    } };

  /* ---------- Check: one diagram, one net force, same for the class's level; confidence is not asked here, the gate carries the split ---------- */
  cfg.steps[stepIdx('check')] = { id: 'check', label: T.check,
    render: function (card, c) {
      K.head(card, T.check, 'I can do it without help.', 'Up next: your notes and stamp.');
      UI.checkItems(card, c);
    },
    canLeave: function () { var a = UI.itemState('C1'), b = UI.itemState('C2'); return !!(a && a.done && b && b.done); },
    teacher: function (c) { return '<p>Two questions at the student’s level (band ' + LE.band() + ' on this device), drawn from the same ladder as Practice. Two tries each. Both feed the report code and the portal record.</p>'; } };

  /* ---------- report code, portal record, notes ---------- */
  function allLog(S) { return (S.d.blog || []).concat((S.d.more && S.d.more.log) || []); }
  function reportFields(S) {
    var mlog = (S.d.more && S.d.more.log) || [], c1 = UI.itemState('C1'), c2 = UI.itemState('C2'), v = S.d.vp || { bits: [] }, g = S.d.gate || { code: '' };
    var log = allLog(S).map(function (x) { return [x.skill, RUNG[x.skill] || UI.rungOf(x.band), x.band, x.misses, x.secs].join(','); }).join(';');
    return ['v2', S.first, S.period, S.band0, S.band, S.warm == null ? '' : S.warm,
      (c1 && c1.ok && c1.misses === 0 ? 1 : 0) + '-' + (c2 && c2.ok && c2.misses === 0 ? 1 : 0), LE.today(), LE.reached().idx + 1, S.ended ? 't' : 'f',
      mlog.length + '-' + mlog.filter(function (x) { return x.misses === 0; }).length, Object.keys(S.skip || {}).join('+'),
      (v.bits || []).join(''), g.code, log, (v.scaffold ? 'scaf' : '') + (v.fluent ? (v.scaffold ? '+' : '') + 'fluent' : '')];
  }
  K.profileRecord = function (S) {
    var items = allLog(S).map(function (x) { return { skill: x.skill, title: x.title, band: x.band, firstTry: x.misses === 0, ok: !!x.ok }; }), v = S.d.vp;
    SP.predicts.forEach(function (p, i) { var st = LE.qs(p.id); if (st && st.done) items.push({ skill: 'predict-' + (i + 1), band: S.band0 || 2, firstTry: !!st.ok && st.misses === 0, ok: !!st.ok }); });
    if (v) ['arith', 'dir', 'prop'].forEach(function (part) { SP.vp.forEach(function (x, i) { if (x.part === part) items.push({ skill: 'vp-' + part, band: 1, firstTry: !!v.bits[i], ok: !!v.bits[i] }); }); });
    (S.d.gate && S.d.gate.types || []).forEach(function (t) { items.push({ skill: 'gate-fbd', band: 2, firstTry: t === 'C', ok: t === 'C' }); });
    ['C1', 'C2'].forEach(function (k) { var q = UI.itemState(k), ck = (S.d.chk || {})[k]; if (q && q.done) items.push({ skill: 'check-' + k.toLowerCase(), band: ck ? ck.band : LE.band(), firstTry: q.ok && q.misses === 0, ok: q.ok }); });
    return { course: 'physics', lesson: ID, title: SP.title, first: S.first, period: S.period, day: LE.today(), reached: LE.reached().idx + 1, of: LE.reached().of, items: items };
  };
  cfg.steps[stepIdx('notes')] = K.notesStep({ reportFields: reportFields, teacher: function (c) {
    var v = c.S.d.vp || {};
    return '<p>Stamp for this device: <b>' + K.stamp(c.S) + '</b>. Guided notes end at the 42-minute mark Monday to Thursday (the bell on Friday). A student who finishes early keeps getting practice at their own level until then.</p><p>The report code carries the ID, start band, the six warm-up bits, the check-in code, one entry per Build and Practice question (skill, rung, band, misses, seconds) and the flags: <b>scaf</b> (arrow table first) and <b>fluent</b> (' + (v.fluent ? 'this student: ready for the slot 20 incline extension' : 'six clean first tries on the warm-up means slot 20 incline extension') + '). Paste any code into the portal or the teacher page.</p>';
  } });
  /* Journal (closes the lesson): before, now, confidence 1-4, one thing to test. One sentence each; none of it blocks the stamp. */
  var JR = [['before', 'What I believed before', 'Before today I thought…'], ['now', 'What I believe now', 'Now I think…'], ['test', 'One thing I would test', 'I would test…']];
  var wrapNotes = cfg.steps[stepIdx('notes')], wrapRender = wrapNotes.render;
  wrapNotes.render = function (card, c) {
    var S = c.S, J = S.d.jr = S.d.jr || {};
    card.appendChild(el('h2', null, 'Journal'));
    card.appendChild(el('p', 'target', 'One sentence each. It goes into your notes.'));
    JR.forEach(function (j) { var b = el('div', 'q'); card.appendChild(b); b.appendChild(el('p', 'qhead', j[1])); var ta = el('textarea'); ta.rows = 2; ta.value = J[j[0]] || ''; ta.placeholder = j[2]; ta.setAttribute('aria-label', j[1]); ta.addEventListener('input', function () { J[j[0]] = ta.value; LE.save(); }); b.appendChild(ta); });
    var cr = el('div', 'row'); cr.appendChild(el('span', null, 'Confidence, 1 (guessing) to 4 (could teach it):'));
    [1, 2, 3, 4].forEach(function (n) { var lb = el('label'), rd = document.createElement('input'); rd.type = 'radio'; rd.name = 'jconf'; rd.checked = J.conf === n; rd.onchange = function () { J.conf = n; LE.save(); }; lb.appendChild(rd); lb.appendChild(document.createTextNode(' ' + n)); cr.appendChild(lb); });
    card.appendChild(cr);
    wrapRender(card, c);
  };
  K.stamp = function (S) { return 'FBD-' + MrD.codes.stamp(ID, S.first, S.period); };

  var stdNotes = cfg.notes;
  cfg.notes = function (c) {
    var d = stdNotes(c), S = c.S, secs = d.sections, out = [];
    secs.forEach(function (s, i) {
      out.push(s);
      if (i === 0) {
        var v = S.d.vp; out.push({ title: 'Warm-up: what I know about adding forces', blocks: v ? [{ type: 'table', head: ['Part', 'First try'], rows: [['Add forces on a line', v.bits[0] && v.bits[1] ? 'both right' : 'review'], ['Direction of the net force', v.bits[2] && v.bits[3] ? 'both right' : 'review'], ['Ratio reasoning', v.bits[4] && v.bits[5] ? 'both right' : 'review']] }] : [{ type: 'blank' }] });
      }
      if (s.title === 'My predictions') {
        var md = SP.v2.MODELS.filter(function (M) { return UI.modelDone(M); }), mb = [{ type: 'list', items: SP.v2.MOVES.map(function (m) { return m.n + '. ' + m.name + ': ' + m.say; }) }];
        md.forEach(function (M) { mb.push({ type: 'box', label: M.id + ' ' + M.title + ':', text: M.prompt + ' Answer: ' + plain(String(M.answer)) + ' ' + M.unit + (M.answer2 != null ? ' and ' + M.answer2 + ' N' : '') + '. Watch for: ' + M.slip }); });
        out.push({ title: 'Model problems: the six moves', blocks: mb });
        var seen = S.d.cat || {};
        out.push({ title: 'The force catalog', blocks: [{ type: 'table', head: ['Force', 'Source', 'Contact or field', 'Direction'], rows: SP.catalogRows.map(function (r) { return seen[r.sym] ? [r.f + ' (' + r.sym + ')', r.source, r.kind, r.dir] : [r.f + ' (' + r.sym + ')', '', '', '']; }) }] });
        var blocks = [];
        if (S.d.gate) { blocks.push({ type: 'fbds', items: SP.gate.map(function (g) { return { title: g.title, forces: SP.situations.filter(function (x) { return x.kind === ({ G1: 'rest', G2: 'steady', G3: 'speed' })[g.id]; })[0].forces }; }) }); blocks.push({ type: 'list', items: SP.situations.slice(0, 3).map(function (x) { return x.title + ': ' + x.net; }) }); } else blocks.push({ type: 'blank' }, { type: 'blank' });
        out.push({ title: 'Free-body diagrams and net force', blocks: blocks });
      }
    });
    var bl = (S.d.blog || []).map(function (x) { return { type: 'box', label: x.title + ':', text: x.p + ' → ' + x.a + '. ' + x.w }; });
    var idx = out.map(function (s) { return s.title; }).indexOf('Problems I solved');
    out.splice(idx < 0 ? out.length : idx, 0, { title: 'Build problems', blocks: bl.length ? bl : [{ type: 'p', text: 'Your Build problems appear here.' }] });
    var J = S.d.jr || {};
    out.push({ title: 'Journal', blocks: [{ type: 'box', label: 'What I believed before:', text: J.before || '' }, { type: 'box', label: 'What I believe now:', text: J.now || '' }, { type: 'p', text: 'Confidence (1–4): ' + (J.conf || '____') }, { type: 'box', label: 'One thing I would test:', text: J.test || '' }] });
    d.sections = out; return d;
  };
})();
