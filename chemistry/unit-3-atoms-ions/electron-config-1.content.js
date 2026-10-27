/* LESSON (chemistry): Unit 3, Slot 9. The wiring is LK.standard (physics/lessons/engine/standard.js) with four steps replaced, each copied from
   standard.js and edited, and the Models tab inserted: Warm-up (the card's six warm-up questions place the student), Check (the card's exit),
   Wrap-up (the report code carries the exit result), Huddle (the card's talk line). The teaching is in electron-config-1.spec.js and the Day Card.
   The Explore picture, the Orbital Filler, is below. The Models tab is electron-config-1.models.js. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, qdone = LK.qdone, SP = window.SPECS['electron-config-1'], ID = SP.id, C = SP.content, L = SP.ladder, UI = window.EC_UI;
  var name = function (Z) { return C.NAME[Z]; };

  /* ---------- Explore: the Orbital Filler ----------
     Five atoms (Z = 3, 7, 11, 15, 19). For each: drag the electrons into the ladder, then write the configuration the ladder shows.
     Then the three capacities. Every rejected electron is counted by rule, per run, for the teacher. */
  function explore(card, c, K) {
    var S = c.S, ec = S.d.ec = S.d.ec || { runs: [] }, tasks = SP.recorded.configs, caps = SP.recorded.capacities;
    var next = -1, i;
    for (i = 0; i < tasks.length; i++) if (!qdone('rec' + tasks[i].Z)) { next = i; break; }
    var done = tasks.filter(function (t) { return qdone('rec' + t.Z); });
    if (done.length) {
      var tb = el('table', 'data'); tb.innerHTML = '<thead><tr><th>Z</th><th>Element</th><th>Configuration</th></tr></thead>';
      var body = el('tbody'); done.forEach(function (t) { var tr = el('tr'); tr.innerHTML = '<td>' + t.Z + '</td><td>' + name(t.Z) + '</td><td>' + C.pretty(t.answer) + '</td>'; body.appendChild(tr); });
      tb.appendChild(body); var sc = el('div', 'scroll'); sc.appendChild(tb); card.appendChild(sc);
    }
    if (next >= 0) {
      var t = tasks[next], Z = t.Z;
      card.appendChild(el('h3', null, 'Atom ' + (next + 1) + ' of ' + tasks.length + ': ' + name(Z) + ' (Z = ' + Z + ')'));
      var run = null; ec.runs.forEach(function (r) { if (r.Z === Z && !r.closed) run = r; });
      if (!run) { run = L.newRun(Z); ec.runs.push(run); LE.save(); }
      var host = el('div'); card.appendChild(host);
      L.mount(host, { run: run, onChange: function (r) { LE.save(); if (L.full(r)) { r.final = L.config(r); LE.save(); LE.render(); } } });
      if (c.key) card.appendChild(el('p', 'keyline', 'KEY: ' + C.cfg(Z) + ' (order: ' + C.fill(Z).map(function (p) { return p[0]; }).join(', ') + ')'));
      if (!L.full(run)) {
        var again = el('button', 'btn small', 'Start this atom over'); again.type = 'button';
        again.onclick = function () { run.closed = true; LE.save(); LE.render(); }; var r2 = el('div', 'row'); r2.appendChild(again); card.appendChild(r2);
      } else {
        var q = SP.dress({ id: 'rec' + Z, type: 'config', head: 'Write what the ladder shows', prompt: 'Read the ladder. Write the configuration of ' + name(Z) + ' (Z = ' + Z + ').', answer: t.answer, maxMiss: 2,
          hint: 'Read the ladder from the bottom: each subshell, then how many electrons it holds.', worked: C.pretty(t.answer) });
        q.onDone = function () { setTimeout(LE.render, 700); }; LE.ask(card, q);
      }
      return;
    }
    card.appendChild(el('h3', null, 'Capacities'));
    ['s', 'p', 'd'].forEach(function (k) {
      LE.ask(card, { id: 'cap_' + k, type: 'num', head: 'From your ladders', prompt: 'How many electrons fit in ' + (k === 'p' || k === 'd' ? 'a ' : 'an ') + k + ' subshell?', answer: caps[k], unit: '', maxMiss: 2, keypad: true,
        hint: 'Count the boxes in the subshell. Each box holds 2.', worked: k + ' holds ' + caps[k] + '.', onDone: function () { LE.render(); } });
    });
    if (['s', 'p', 'd'].every(function (k) { return qdone('cap_' + k); })) card.appendChild(el('p', 'msg ok', 'Table complete: s ' + caps.s + ', p ' + caps.p + ', d ' + caps.d + '.'));
  }

  var cfg = LK.standard(SP, { prefix: 'ELE', explore: explore });
  var K = LK.for({ id: ID, course: SP.course, prefix: 'ELE', identity: 'id', title: SP.title, lib: { preds: SP.predicts,
    skills: SP.skills.map(function (sk) { return { id: sk.id, title: sk.title, gen: function (b, r) { var q = sk.gen(b, r); q.type = q.type || 'num'; q.keypad = true; return q; } }; }) } }), T = K.TABS;
  function stepIdx(id) { for (var i = 0; i < cfg.steps.length; i++) if (cfg.steps[i].id === id) return i; return -1; }
  var firstTry = function (id) { var s = LE.qs(id); return !!(s && s.done && s.ok && s.misses === 0); };

  /* ---------- Warm-up: the card's six questions (bands 1 and 2), one try each. Band 1 is cleared by W1 to W4 first try; band 2 by W5 and W6 as well. ---------- */
  function warmQ(w, i) {
    var q = w.options ? { id: w.id, type: 'choice', options: w.options, answer: w.answer } : { id: w.id, type: 'num', answer: w.answer, unit: '', keypad: true };
    q.head = 'Warm-up ' + (i + 1) + ' of ' + SP.warmup.length; q.prompt = w.prompt; q.maxMiss = 1; return q;
  }
  function place(S) {
    if (!SP.warmup.every(function (w) { return qdone(w.id); })) return;
    var band1 = SP.warmup.filter(function (w) { return w.band === 1; }).every(function (w) { return firstTry(w.id); });
    var band2 = band1 && SP.warmup.filter(function (w) { return w.band === 2; }).every(function (w) { return firstTry(w.id); });
    var placed = band2 ? 2 : 1, log = SP.warmup.map(function (w) { return { band: w.band, ok: firstTry(w.id) }; });
    S.d.place = { done: true, placed: placed, log: log, asked: log.length, band: placed, misses: 0, cleared: band2 ? 2 : band1 ? 1 : 0, maxBand: 4, maxItems: 8 };
    if (!S.band0) { S.band0 = placed; S.band = placed; S.warm = log.filter(function (x) { return x.ok; }).length; S.bandLog.push('start:' + placed); }
  }
  cfg.steps[stepIdx('warmup')] = { id: 'warmup', label: T.warmup,
    render: function (card, c) {
      var S = c.S; K.head(card, T.warmup, 'I can show what I already know.', 'Up next: you make two predictions.');
      SP.warmup.forEach(function (w, i) { var q = warmQ(w, i); q.onDone = function () { place(S); LE.save(); setTimeout(LE.render, 700); }; LE.ask(card, q); });
      if (S.d.place && S.d.place.done) card.appendChild(el('p', 'msg ok', 'Warm-up saved. Let’s go.'));
    },
    canLeave: function (c) { return SP.warmup.every(function (w) { return qdone(w.id); }); },
    teacher: function () {
      return '<p>Six questions, one try each; the first four are the plainest. The student starts at band 1, or band 2 when W1 to W4 are all right first try and W5 and W6 are too. Answers: ' +
        SP.warmup.map(function (w) { return w.id + ' = ' + LK.plain(w.options ? w.options[w.answer] : w.answer) + ' (' + LK.plain(w.pattern) + ')'; }).join('; ') + '.</p>';
    } };

  /* ---------- Huddle: the card's talk line goes in front of the writable huddle; the gate is the standard huddle code (the clear/hold rule is pending). ---------- */
  var hs = cfg.steps[stepIdx('huddle')], hRender = hs.render;
  hs.render = function (card, c) {
    hRender(card, c);
    var first = card.querySelector('.hd-sec'), p = el('p', 'qtext', SP.talk[0]); if (first) first.parentNode.insertBefore(p, first); else card.appendChild(p);
  };
  hs.teacher = function (c) {
    var items = SP.gate.items.map(function (id) { return id + (LE.qs(id) && LE.qs(id).done ? (firstTry(id) ? ' (first try)' : ' (missed)') : ' (not reached)'); }).join(', ');
    return '<p><b>Huddle code: ' + LE.codeFor(ID, 'h1') + '.</b> Pulled in at minute ' + SP.pacing.huddles[0].atMin + ' by the clock. Open with: “' + LK.plain(SP.talk[0]) + '” Then walk the three definitions, work phosphorus (model M1) on the board, and label the ladder. Students fill the blanks as you write them.</p>' +
      '<p>Items that count toward the gate: ' + items + '. The clear/hold rule is pending your decision; until then this is the standard huddle code, one per day for every class.</p>';
  };

  /* ---------- Models tab (after the huddle) ---------- */
  cfg.steps.splice(stepIdx('huddle') + 1, 0, UI.modelsStep(K));

  /* ---------- Check: the card's exit. One point each for a first-try right: 3 secure, 2 developing, 0 to 1 not yet. ---------- */
  function exitQ(x) {
    var q = x.type === 'choice' ? { id: x.id, type: 'choice', options: x.options, answer: x.answer, maxMiss: 1 } : x.type === 'config' ? SP.dress({ id: x.id, type: 'config', answer: x.answer, maxMiss: 2 }) : { id: x.id, type: 'num', answer: x.answer, unit: '', keypad: true, maxMiss: 2 };
    q.head = 'Check ' + x.id.slice(1); q.prompt = x.prompt; return q;
  }
  function exitScore(S) { return SP.exit.filter(function (x) { return firstTry(x.id); }).length; }
  function exitLabel(n) { return n >= SP.scoring.secure ? 'secure' : n >= SP.scoring.developing ? 'developing' : 'not yet'; }
  cfg.steps[stepIdx('check')] = { id: 'check', label: T.check,
    render: function (card, c) { K.head(card, T.check, 'I can do it without help.', 'Up next: your notes and stamp.'); SP.exit.forEach(function (x) { LE.ask(card, exitQ(x)); }); },
    canLeave: function () { return SP.exit.every(function (x) { return qdone(x.id); }); },
    teacher: function (c) {
      var n = exitScore(c.S);
      return '<p>Three questions, one point each for a first-try right. Answers: ' + SP.exit.map(function (x) { return x.id + ' = ' + LK.plain(x.type === 'choice' ? x.options[x.answer] : x.type === 'config' ? C.pretty(x.answer) : x.answer); }).join('; ') +
        '. Scoring: ' + SP.scoring.secure + ' secure, ' + SP.scoring.developing + ' developing, ' + SP.scoring.notYet + ' not yet. This student: ' + n + ' (' + exitLabel(n) + ').</p>';
    } };

  /* ---------- Wrap-up: the report code carries the exit result (x1-x2-x3) in place of the two-question check ---------- */
  K.profileRecord = function (S) {
    var rec = function (skill, band, id) { var s = LE.qs(id); return s && s.done ? { skill: skill, band: band, firstTry: firstTry(id), ok: !!s.ok } : null; };
    var items = ((S.d.more && S.d.more.log) || []).map(function (x) { return { skill: x.skill, title: x.title, band: x.band, firstTry: x.misses === 0, ok: !!x.ok }; });
    SP.predicts.forEach(function (p, i) { var r = rec('predict-' + (i + 1), S.band0 || 1, p.id); if (r) items.push(r); });
    SP.recorded.configs.forEach(function (t) { var r = rec('explore-config', 1, 'rec' + t.Z); if (r) items.push(r); });
    SP.exit.forEach(function (x) { var r = rec('check-' + x.id.toLowerCase(), 2, x.id); if (r) items.push(r); });
    return { course: SP.course, lesson: ID, title: SP.title, first: S.first, period: S.period, day: LE.today(), reached: LE.reached().idx + 1, of: LE.reached().of, items: items };
  };
  function reportFields(S) {
    var mlog = (S.d.more && S.d.more.log) || [];
    return ['v1', S.first, S.period, S.band0, S.band, S.warm == null ? '' : S.warm, SP.exit.map(function (x) { return firstTry(x.id) ? 1 : 0; }).join('-'), LE.today(), LE.reached().idx + 1, S.ended ? 't' : 'f',
      mlog.length + '-' + mlog.filter(function (x) { return x.misses === 0; }).length, Object.keys(S.skip || {}).join('+')];
  }
  cfg.steps[stepIdx('notes')] = K.notesStep({ reportFields: reportFields, teacher: function (c) {
    return '<p>Stamp for this device: <b>' + K.stamp(c.S) + '</b>. The report code lists the ID, the placement band, the check result (three first-try bits, X1 to X3), and any tabs the pace plan skipped.</p>'; } });

  /* ---------- Notes: the filled-in table, the models, and the background line ---------- */
  var baseNotes = cfg.notes;
  cfg.notes = function (c) {
    var doc = baseNotes(c), at = -1, extra = [];
    doc.sections.forEach(function (s, i) { if (s.title === 'Problems I solved') at = i; });
    var done = SP.recorded.configs.filter(function (t) { return qdone('rec' + t.Z); });
    if (done.length) {
      var blocks = [{ type: 'table', head: ['Z', 'Element', 'Configuration'], rows: done.map(function (t) { return [String(t.Z), name(t.Z), C.pretty(t.answer)]; }) }];
      if (['s', 'p', 'd'].every(function (k) { return qdone('cap_' + k); })) blocks.push({ type: 'p', text: 'Capacities: s ' + SP.recorded.capacities.s + ', p ' + SP.recorded.capacities.p + ', d ' + SP.recorded.capacities.d + '.' });
      extra.push({ title: 'Orbital Filler', blocks: blocks });
    }
    var ms = UI.notesSection(); if (ms) extra.push(ms);
    doc.sections.splice.apply(doc.sections, [at < 0 ? doc.sections.length : at, 0].concat(extra));
    doc.sections.push({ title: 'Background', blocks: [{ type: 'p', text: SP.backgroundLine }] });
    return doc;
  };
})();
