/* LESSON (chemistry): Unit 3, Slot 15. The wiring is LK.standard (physics/lessons/engine/standard.js) with these steps replaced, each copied from standard.js and edited:
   Warm-up (three easy review items, no placement: v3), Huddle (huddle 2 adds the three crux questions), Check (the card's exit), Wrap-up (the report code carries the exit result),
   and the Models tab inserted. The teaching is in effective-nuclear-charge.spec.js and the Day Card (day-cards/slot-15.card.md).
   The Explore picture, the Pull Meter, is below. The Models tab is effective-nuclear-charge.models.js.
   v3 clock (pacing.clock = 'v3'): huddle 1 at minute 3 is a hold screen, huddle 2 at minute 25 is the writable Huddle tab. Nothing is trimmed or skipped. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, qdone = LK.qdone, SP = window.SPECS['effective-nuclear-charge'], ID = SP.id, C = SP.content, Zf = SP.zeff, UI = window.ENC_UI;
  var MAXBAND = 3;

  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------- Explore: the Pull Meter ----------
     One run = one pair of atoms. Mark the core rings in each (click a ring), say which atom holds its outer electron harder (logged before the meter shows),
     then the meter shows Z_eff ÷ n² for both. The pair comes from C.pairSpec(n, band, seed): band 1 is one group, band 2 one group or one period,
     band 3 any pair. The band rises with first-try runs (chemistry/shared/ladder.js, clamped to 3) and the pool never runs out. Nobody sees a band. */
  function explore(card, c, K) {
    var S = c.S, pm = S.d.pm = S.d.pm || { n: 0, lad: Ladder.init(1), runs: [], cur: null };
    var seed = hashStr(String(S.first || 'x'));
    card.appendChild(el('p', 'qtext', 'Each run has three steps: mark the core rings, say which atom holds its outer electron harder, then read the pull meter.'));
    var guide = el('details', 'enc-guide'); var sm = el('summary', null, 'How to read the pull meter'); guide.appendChild(sm);
    var gl = el('ul'); [
      'Each bar is one atom. A longer bar means the nucleus holds the outer electron harder.',
      'The number at the end of a bar is Z_eff ÷ n². It is the pull.',
      'Look at the numbers first, then at the bars.',
      'A wrong reading: taking a bar to be the number of protons. The bar is the pull after the core is taken away.'
    ].forEach(function (t) { gl.appendChild(el('li', null, t)); }); guide.appendChild(gl); card.appendChild(guide);

    if (pm.runs.length) {
      var tb = el('table', 'data'); tb.innerHTML = '<thead><tr><th>Atoms</th><th>Core</th><th>Z_eff</th><th>Pull</th><th>You said</th></tr></thead>';
      var body = el('tbody'); pm.runs.slice(-6).forEach(function (r) {
        var tr = el('tr'), a = Zf.atom(r.a), b = Zf.atom(r.b);
        tr.innerHTML = '<td>' + a.sym + ' / ' + b.sym + '</td><td>' + a.core + ' / ' + b.core + '</td><td>' + a.zeff + ' / ' + b.zeff + '</td><td>' + Zf.frac(a) + ' / ' + Zf.frac(b) + '</td><td>' + (r.pred === 'a' ? a.name : r.pred === 'b' ? b.name : 'equally') + (r.ok ? ' ✓' : '') + '</td>';
        body.appendChild(tr);
      });
      tb.appendChild(body); var sc = el('div', 'scroll'); sc.appendChild(tb); card.appendChild(sc);
    }

    if (!pm.cur) {
      var band = Math.min(MAXBAND, pm.lad.band), spec = C.pairSpec(pm.n, band, seed);
      pm.cur = { spec: spec, marks: { a: [], b: [] }, stage: 'mark', miss: 0, pred: null, shown: false }; LE.save();
    }
    var cur = pm.cur, sp = cur.spec, A = Zf.atom(sp.a), B = Zf.atom(sp.b);
    card.appendChild(el('h3', null, 'Run ' + (pm.n + 1) + ': ' + A.name + ' and ' + B.name));
    var row = el('div', 'enc-pair'); card.appendChild(row);
    var hostA = el('figure', 'ecm-fig'), hostB = el('figure', 'ecm-fig'); row.appendChild(hostA); row.appendChild(hostB);
    var msg = el('p', 'msg'); var ctl = el('div', 'row');
    function drawFig(h, atom, key) {
      var marks = cur.marks[key], hit = cur.stage === 'mark';
      h.innerHTML = Zf.svg(atom.Z, cur.stage === 'mark' ? { marks: marks, hit: hit } : { showCore: true });
      h.appendChild(el('figcaption', null, atom.name + ' (Z = ' + atom.Z + ')'));
    }
    function drawBoth() { drawFig(hostA, A, 'a'); drawFig(hostB, B, 'b'); }
    drawBoth();
    function bind(h, key, atom) {
      h.addEventListener('click', function (e) {
        if (cur.stage !== 'mark') return; var t = e.target.closest && e.target.closest('.zr-hit'); if (!t) return;
        var i = +t.getAttribute('data-i'); cur.marks[key][i] = !cur.marks[key][i]; LE.save(); drawFig(h, atom, key);
      });
    }
    bind(hostA, 'a', A); bind(hostB, 'b', B);
    card.appendChild(msg); card.appendChild(ctl);
    if (c.key) card.appendChild(el('p', 'keyline', 'KEY: ' + A.name + ' core ' + A.core + ', Z_eff ' + A.zeff + ', n ' + A.n + ' (' + Zf.frac(A) + ') · ' + B.name + ' core ' + B.core + ', Z_eff ' + B.zeff + ', n ' + B.n + ' (' + Zf.frac(B) + ') · holds harder: ' + (sp.answer === 'a' ? A.name : B.name)));

    function okMarks(atom, m) { for (var i = 0; i < atom.n; i++) if (!!m[i] !== (i < atom.n - 1)) return false; return true; }
    function markFeedback() {
      var bad = [[A, 'a'], [B, 'b']].filter(function (p) { return !okMarks(p[0], cur.marks[p[1]]); });
      var outer = bad.some(function (p) { return !!cur.marks[p[1]][p[0].n - 1]; });
      return outer ? 'Not quite. The outer ring holds the electron we pull on. It is not core.' : 'Not quite. Every ring inside the outer ring is core. Mark them all.';
    }
    function table2() {
      var t = el('table', 'data'); t.innerHTML = '<thead><tr><th></th><th>' + A.name + '</th><th>' + B.name + '</th></tr></thead><tbody>' +
        '<tr><td>Z</td><td>' + A.Z + '</td><td>' + B.Z + '</td></tr><tr><td>Core electrons</td><td>' + A.core + '</td><td>' + B.core + '</td></tr>' +
        '<tr><td>Z_eff = Z − core</td><td>' + A.zeff + '</td><td>' + B.zeff + '</td></tr><tr><td>Outer ring, n</td><td>' + A.n + '</td><td>' + B.n + '</td></tr></tbody>';
      var w = el('div', 'scroll'); w.appendChild(t); return w;
    }
    function btn(label, fn, primary) { var b = el('button', 'btn' + (primary ? ' primary' : ''), label); b.type = 'button'; b.onclick = fn; ctl.appendChild(b); return b; }

    if (cur.stage === 'mark') {
      msg.textContent = 'Click each core ring in both atoms. Core rings turn amber.';
      btn('Check my rings', function () {
        if (okMarks(A, cur.marks.a) && okMarks(B, cur.marks.b)) { cur.stage = 'predict'; LE.save(); LE.render(); return; }
        cur.miss++; if (cur.miss >= 2) {   // two misses: the right marks are drawn, and the run no longer counts as first try
          cur.marks.a = []; cur.marks.b = []; for (var i = 0; i < A.n - 1; i++) cur.marks.a[i] = true; for (i = 0; i < B.n - 1; i++) cur.marks.b[i] = true;
          cur.shown = true; cur.stage = 'predict'; LE.save(); LE.render(); return;
        }
        msg.className = 'msg bad'; msg.textContent = markFeedback(); LE.save();
      }, true);
    } else if (cur.stage === 'predict') {
      card.insertBefore(table2(), msg);
      msg.textContent = 'Which atom holds its outer electron harder?';
      [[A.name, 'a'], [B.name, 'b'], ['They hold it equally', 'eq']].forEach(function (o) { btn(o[0], function () { cur.pred = o[1]; cur.stage = 'meter'; LE.save(); LE.render(); }); });
    } else {
      card.insertBefore(table2(), msg);
      var big = Math.max(Zf.pullValue(A), Zf.pullValue(B)), meter = el('div', 'enc-meter');
      [A, B].forEach(function (a) {
        var v = Zf.pullValue(a), r2 = el('div', 'enc-bar'); r2.innerHTML = '<span class="enc-name">' + a.name + '</span><span class="enc-track"><span class="enc-fill" style="width:' + Math.max(4, Math.round(100 * v / big)) + '%"></span></span><b>' + Zf.frac(a) + '</b>';
        meter.appendChild(r2);
      });
      card.insertBefore(meter, msg);
      var right = cur.pred === sp.answer; msg.className = 'msg ' + (right ? 'ok' : 'bad');
      msg.textContent = (right ? 'You said ' + (sp.answer === 'a' ? A.name : B.name) + '. The meter agrees. ' : 'You said ' + (cur.pred === 'a' ? A.name : cur.pred === 'b' ? B.name : 'equally') + '. The meter says ' + (sp.answer === 'a' ? A.name : B.name) + '. ') + sp.reason;
      btn('Next pair', function () {
        var first = right && !cur.shown && cur.miss === 0; pm.runs.push({ a: sp.a, b: sp.b, band: sp.band, pred: cur.pred, ok: right, first: first, miss: cur.miss });
        Ladder.record(pm.lad, first); if (pm.lad.band > MAXBAND) pm.lad.band = MAXBAND;
        S.band = Math.min(MAXBAND, Math.max(S.band || 1, pm.lad.band)); pm.n++; pm.cur = null; LE.save(); LE.render(); window.scrollTo(0, 0);
      }, true);
    }
  }

  var cfg = LK.standard(SP, { prefix: 'ENC', explore: explore });
  var K = LK.for({ id: ID, course: SP.course, prefix: 'ENC', identity: 'id', title: SP.title, lib: { preds: SP.predicts,
    skills: SP.skills.map(function (sk) { return { id: sk.id, title: sk.title, gen: function (b, r) { var q = sk.gen(Math.min(b, MAXBAND), r); q.type = q.type || 'num'; q.keypad = true; return q; } }; }) } }), T = K.TABS;
  function stepIdx(id) { for (var i = 0; i < cfg.steps.length; i++) if (cfg.steps[i].id === id) return i; return -1; }
  var firstTry = function (id) { var s = LE.qs(id); return !!(s && s.done && s.ok && s.misses === 0); };

  /* ---------- Warm-up: three easy review items, with pictures. No placement (v3): everyone starts at band 1 and Explore does the ramping. ---------- */
  function warmQ(w, i) {
    var q = w.options ? { id: w.id, type: 'choice', options: w.options, answer: w.answer } : { id: w.id, type: 'num', answer: w.answer, unit: '', keypad: true };
    q.head = 'Warm-up ' + (i + 1) + ' of ' + SP.warmup.length; q.prompt = w.prompt; if (w.pic) q.pic = w.pic; q.maxMiss = 1; return q;
  }
  function settle(S) {
    if (!SP.warmup.every(function (w) { return qdone(w.id); }) || S.d.place) return;
    var log = SP.warmup.map(function (w) { return { band: w.band, ok: firstTry(w.id) }; });
    S.d.place = { done: true, placed: 1, log: log, asked: log.length, band: 1, misses: 0, cleared: 1, maxBand: MAXBAND, maxItems: 3 };
    if (!S.band0) { S.band0 = 1; S.band = 1; S.warm = log.filter(function (x) { return x.ok; }).length; S.bandLog.push('start:1'); }
  }
  cfg.steps[stepIdx('warmup')] = { id: 'warmup', label: T.warmup,
    render: function (card, c) {
      var S = c.S; K.head(card, T.warmup, 'I can show what I already know.', 'Up next: you make a prediction.');
      SP.warmup.forEach(function (w, i) { var q = warmQ(w, i); q.onDone = function () { settle(S); LE.save(); setTimeout(LE.render, 700); }; LE.ask(card, q); });
      if (S.d.place && S.d.place.done) card.appendChild(el('p', 'msg ok', 'Warm-up saved. Let’s go.'));
    },
    canLeave: function () { return SP.warmup.every(function (w) { return qdone(w.id); }); },
    teacher: function () {
      return '<p>Three easy questions from earlier lessons, one try each, with pictures. There is no placement: every student starts Explore at band 1 and the pull-meter runs raise it. Answers: ' +
        SP.warmup.map(function (w) { return w.id + ' = ' + LK.plain(w.options ? w.options[w.answer] : w.answer) + ' (' + LK.plain(w.pattern) + ')'; }).join('; ') + '.</p>';
    } };

  /* ---------- Huddle: v3. Huddle 1 (minute 3) is the hold screen the kit draws. Huddle 2 (minute 25) is the writable tab; the three crux questions follow the blanks. ---------- */
  var hs = cfg.steps[stepIdx('huddle')], hRender = hs.render;
  hs.render = function (card, c) {
    hRender(card, c);
    var P = LE.cfg().pacing, key = c.S.hkey || 'h1';
    if (MrD.pace.huddleMode(P, key) === 'hold') return;
    var box = el('div'); box.appendChild(el('h3', null, 'Check what you just wrote'));
    SP.crux.forEach(function (x) {
      var q = x.type === 'choice' ? { id: x.id, type: 'choice', options: x.options, answer: x.answer, maxMiss: 1 } : { id: x.id, type: 'num', answer: x.answer, unit: '', keypad: true, maxMiss: 1 };
      q.head = 'Crux ' + x.id.slice(1); q.prompt = x.prompt; LE.ask(box, q);
    });
    card.appendChild(box);
  };
  hs.teacher = function () {
    var items = SP.crux.map(function (x) { return x.id + (LE.qs(x.id) && LE.qs(x.id).done ? (firstTry(x.id) ? ' (first try)' : ' (missed)') : ' (not reached)'); }).join(', ');
    return '<p><b>Huddle 1 code: ' + LE.codeFor(ID, 'h1') + ' (minute 3, hold screen).</b> Review sodium and lithium from slot 14, the hook is “' + LK.plain(SP.talk[0]) + '”, then show Z_eff = Z − core on lithium (M1). Students see only the code box.</p>' +
      '<p><b>Huddle 2 code: ' + LE.codeFor(ID, 'h2') + ' (minute 25, writable).</b> Define core electrons, shielding and Z_eff, work sodium on the board (students fill the blanks), label the atom. The three crux questions mirror the board and are the items that count: ' + items + '. They state what is tested.</p>';
  };

  /* ---------- Models tab (after the huddle) ---------- */
  cfg.steps.splice(stepIdx('huddle') + 1, 0, UI.modelsStep(K));

  /* ---------- Check: the card's exit. One point each for a first-try right: 3 secure, 2 developing, 0 to 1 not yet. ---------- */
  function exitQ(x) {
    var q = x.type === 'choice' ? { id: x.id, type: 'choice', options: x.options, answer: x.answer, maxMiss: 1 } : { id: x.id, type: 'num', answer: x.answer, unit: '', keypad: true, maxMiss: 2 };
    q.head = 'Check ' + x.id.slice(1); q.prompt = x.prompt; return q;
  }
  function exitScore() { return SP.exit.filter(function (x) { return firstTry(x.id); }).length; }
  function exitLabel(n) { return n >= SP.scoring.secure ? 'secure' : n >= SP.scoring.developing ? 'developing' : 'not yet'; }
  cfg.steps[stepIdx('check')] = { id: 'check', label: T.check,
    render: function (card) { K.head(card, T.check, 'I can do it without help.', 'Up next: your notes. Then draw the sodium atom on your exit slip.'); SP.exit.forEach(function (x) { LE.ask(card, exitQ(x)); }); },
    canLeave: function () { return SP.exit.every(function (x) { return qdone(x.id); }); },
    teacher: function (c) {
      var n = exitScore();
      return '<p>Three questions, one point each for a first-try right. Answers: ' + SP.exit.map(function (x) { return x.id + ' = ' + LK.plain(x.type === 'choice' ? x.options[x.answer] : x.answer); }).join('; ') +
        '. Scoring: ' + SP.scoring.secure + ' secure, ' + SP.scoring.developing + ' developing, ' + SP.scoring.notYet + ' not yet. This student: ' + n + ' (' + exitLabel(n) + '). The exit slip on paper is a drawing: the sodium atom with the core rings marked and Z_eff written.</p>';
    } };

  /* ---------- Wrap-up: the report code carries the exit result (x1-x2-x3). The scores stay on the student's device (MrD.profile.record). ---------- */
  K.profileRecord = function (S) {
    var rec = function (skill, band, id) { var s = LE.qs(id); return s && s.done ? { skill: skill, band: band, firstTry: firstTry(id), ok: !!s.ok } : null; };
    var items = ((S.d.more && S.d.more.log) || []).map(function (x) { return { skill: x.skill, title: x.title, band: x.band, firstTry: x.misses === 0, ok: !!x.ok }; });
    SP.predicts.forEach(function (p, i) { var r = rec('predict-' + (i + 1), 1, p.id); if (r) items.push(r); });
    ((S.d.pm && S.d.pm.runs) || []).forEach(function (r) { items.push({ skill: 'explore-pull', band: r.band, firstTry: !!r.first, ok: !!r.ok }); });
    SP.crux.forEach(function (x) { var r = rec('crux-' + x.id.toLowerCase(), 2, x.id); if (r) items.push(r); });
    SP.exit.forEach(function (x) { var r = rec('check-' + x.id.toLowerCase(), 3, x.id); if (r) items.push(r); });
    return { course: SP.course, lesson: ID, title: SP.title, first: S.first, period: S.period, day: LE.today(), reached: LE.reached().idx + 1, of: LE.reached().of, items: items };
  };
  function reportFields(S) {
    var mlog = (S.d.more && S.d.more.log) || [];
    return ['v1', S.first, S.period, S.band0, S.band, S.warm == null ? '' : S.warm, SP.exit.map(function (x) { return firstTry(x.id) ? 1 : 0; }).join('-'), LE.today(), LE.reached().idx + 1, S.ended ? 't' : 'f',
      mlog.length + '-' + mlog.filter(function (x) { return x.misses === 0; }).length, Object.keys(S.skip || {}).join('+')];
  }
  /* v3 (DAY-RULES 8): no stamp and no report code. The scores stay on this device (profileRecord). */
  cfg.steps[stepIdx('notes')] = { id: 'notes', label: 'Notes',
    render: function (card, c) {
      card.appendChild(el('h2', null, 'Notes'));
      if (window.MrD && MrD.profile) MrD.profile.record(K.profileRecord(c.S));
      var ex = el('div', 'prose'); ex.innerHTML = '<p><b>My notes</b> is a study sheet the page writes from your own work today: your pull-meter runs, your three models and the problems you solved. Print it or save it as a PDF.</p>'; card.appendChild(ex);
      var row = el('div', 'row'), v = el('button', 'btn primary', 'View my notes'); v.type = 'button'; v.onclick = function () { LE.setViewNotes(true); LE.render(); window.scrollTo(0, 0); };
      var pr = el('button', 'btn', 'Print or save as PDF'); pr.type = 'button'; pr.onclick = function () { LE.print(); };
      var tx = el('button', 'btn', 'Download LaTeX (.tex)'); tx.type = 'button'; tx.onclick = function () { LE.downloadTex(); };
      row.appendChild(v); row.appendChild(pr); row.appendChild(tx); card.appendChild(row);
      if (!LE.canEnd()) { card.appendChild(el('h3', null, 'Keep practicing')); card.appendChild(el('p', 'hint', 'The questions keep coming at your level until the clock ends guided notes. Each one goes into your notes.')); K.morePractice(card, c); return; }
      card.appendChild(el('p', 'msg ok', 'Guided notes are over. Put the page away and take out your paper.'));
    },
    teacher: function () { return '<p>No stamp and no report code (v3). Scores are saved on the student’s own device by profileRecord.</p>'; } };

  /* ---------- Notes: the pull-meter table, the models, and the background line ---------- */
  var baseNotes = cfg.notes;
  cfg.notes = function (c) {
    var doc = baseNotes(c), at = -1, extra = [], runs = (c.S.d.pm && c.S.d.pm.runs) || [];
    doc.sections.forEach(function (s, i) { if (s.title === 'Problems I solved') at = i; });
    if (runs.length) extra.push({ title: 'Pull meter', blocks: [{ type: 'table', head: ['Atoms', 'Core', 'Z_eff', 'Pull'], rows: runs.map(function (r) { var a = Zf.atom(r.a), b = Zf.atom(r.b); return [a.sym + ' / ' + b.sym, a.core + ' / ' + b.core, a.zeff + ' / ' + b.zeff, Zf.frac(a) + ' / ' + Zf.frac(b)]; }) }] });
    var ms = UI.notesSection(); if (ms) extra.push(ms);
    doc.sections.splice.apply(doc.sections, [at < 0 ? doc.sections.length : at, 0].concat(extra));
    doc.sections.push({ title: 'Background', blocks: [{ type: 'p', text: SP.backgroundLine }] });
    return doc;
  };

  var css = document.createElement('style');
  css.textContent = '.enc-pair{display:flex;gap:14px;flex-wrap:wrap}.enc-guide{margin:8px 0;padding:6px 10px;border:1px solid var(--line);border-radius:8px}.enc-guide summary{cursor:pointer;font-weight:600}' +
    '.enc-meter{margin:12px 0;max-width:560px}.enc-bar{display:grid;grid-template-columns:110px 1fr 56px;gap:8px;align-items:center;margin:6px 0}.enc-track{display:block;height:18px;background:var(--stage);border:1px solid var(--line);border-radius:9px;overflow:hidden}' +
    '.enc-fill{display:block;height:100%;background:#2a6fb5}';
  document.head.appendChild(css);
})();
