/* Mr. D's lesson engine. Shared by every online lesson.
   A lesson is a config object registered in window.LESSONS_REG (see content/). The engine supplies:
   state + autosave, step gating, per-student seeded numbers, question widgets (choice / num / cloze / text),
   hidden difficulty bands, teacher codes, the #key view, the notes document (print + LaTeX) and the report code.
   The school clock (shared/bell.js) decides when huddle codes are asked for and when guided notes can end. */
(function () {
  'use strict';
  var LE = window.LE = { debug: { qs: {} } };
  var CFG = null, S = null, KEY = false, viewNotes = false, ticker = null, saveTimer = null;
  var MAXMISS = 2;

  /* ---------- utils ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function html(node, h) { node.innerHTML = h; return node; }
  LE.$ = $; LE.el = el; LE.html = html;
  function hash32(s) { var h = 2166136261 >>> 0; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  LE.hash32 = hash32;
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  LE.rng = function (seed) { return mulberry(hash32(seed)); };
  LE.pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  LE.today = function () { return new Date().toLocaleDateString('en-CA'); };
  /* Huddle codes come from the shared module, so the teacher bar and the teacher dashboard always agree. */
  LE.codeFor = function (lessonId, cp) { return MrD.codes.gate(lessonId, cp); };
  /* Huddle codes are asked for only 7:00 AM to 3:00 PM on school days, and never in the #key view. */
  LE.gatesOn = function () { return !KEY && MrD.bell.gatesOn(); };
  LE.clock = function () { return MrD.bell.clock(CFG.course); };
  LE.canEnd = function () { return KEY || LE.clock().canEnd; };
  LE.words = function (s) { var m = String(s || '').trim().match(/\S+/g); return m ? m.length : 0; };
  LE.fmtN = function (x) { return String(+Number(x).toFixed(3)); };
  LE.fmt = function (x, d) { if (!isFinite(x)) return String(x); var s = Number(x).toFixed(d == null ? 2 : d); return s; };
  LE.norm = function (s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9\u03b1-\u03c9\u03a3\u0394.\- ]/g, ' ').replace(/\s+/g, ' ').trim(); };
  function shuffle(arr, r) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  LE.shuffle = shuffle;
  LE.isKey = function () { return KEY; };
  LE.S = function () { return S; };

  /* ---------- report code (teacher reads it back at teacher.html) ---------- */
  LE.encodeReport = function (lessonId, fields) {
    var payload = fields.map(function (f) { return String(f).replace(/[~\s]/g, '_'); }).join('~');
    var chk = (hash32(lessonId + payload) % 46656).toString(36).padStart(3, '0');
    return lessonId.slice(0, 3).toUpperCase() + '~' + payload + '~' + chk;
  };
  LE.decodeReport = function (lessonId, code) {
    var parts = String(code).trim().split('~');
    if (parts.length < 3) return null;
    var chk = parts.pop(), tag = parts.shift(), payload = parts.join('~');
    var ok = (hash32(lessonId + payload) % 46656).toString(36).padStart(3, '0') === chk;
    return { tag: tag, fields: parts, ok: ok };
  };

  /* ---------- state ---------- */
  function storeKey() { return 'le.' + CFG.id + '.v' + CFG.version; }
  function fresh() { return { id: CFG.id, step: CFG.steps[0].id, first: '', period: '', seed: '', band0: 0, band: 0, bandLog: [], t: {}, q: {}, d: {}, huddle: {}, started: Date.now(), max: 0, ended: '', endIdx: 0, hid: 0 }; }
  function load() { try { var v = JSON.parse(localStorage.getItem(storeKey())); if (v && v.id === CFG.id) return v; } catch (e) { } return fresh(); }
  function saveNow() { try { localStorage.setItem(storeKey(), JSON.stringify(S)); } catch (e) { } }
  LE.save = function () { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 150); };
  LE.reset = function () { S = fresh(); saveNow(); LE.render(); };
  LE.band = function () { return S.band || S.band0 || 2; };
  LE.setBand = function (b, why) { b = Math.max(1, Math.min((CFG && CFG.maxBand) || 4, b)); if (b !== S.band) S.bandLog.push(S.band + '>' + b + (why ? ':' + why : '')); S.band = b; LE.save(); };
  LE.seedRng = function (tag) { if (!S.seed) { S.seed = LE.norm(S.first) + '|' + LE.norm(S.period); LE.save(); } return LE.rng(S.seed + '|' + tag); };

  /* ---------- locked mode (shared/lock.js) ----------
     Opt-in per lesson with cfg.lock = true. On only during this class's period (the same clock rule as the chemistry
     lessons: until the end mark Mon-Thu, the whole period Friday), never in #key, and off with #nolock=<code> from the lock desk.
     Fullscreen starts from the click that leaves the Start step. Closing the page and reopening asks for Mr. D's code. */
  var lockArmed = false, lockResume = false;
  function lockWanted() {
    if (!CFG || !CFG.lock || !window.LessonLock || KEY || !S || !S.first || S.ended) return false;
    if ((/nolock=(\d+)/.exec(location.hash) || [])[1] === LessonLock.offCode()) return false;
    return !!LE.clock().lockOn;
  }
  function lockNote(msg) {
    var n = $('lockmsg'); if (!n) { n = el('p', 'msg bad'); n.id = 'lockmsg'; $('stage').appendChild(n); }
    n.textContent = msg;
  }
  function lockChip() {
    var host = $('btn-notes') && $('btn-notes').parentNode; if (!host) return;
    var c = $('lockchip');
    if (!lockArmed) { if (c) c.remove(); return; }
    if (!c) { c = el('span', 'hint'); c.id = 'lockchip'; host.insertBefore(c, host.firstChild); }
    c.textContent = '🔒 left the lesson ' + LessonLock.stats().total + '×';
  }
  /* Runs go() now when no lock is needed; otherwise enters fullscreen first (inside the student's click) and runs go() once it starts. */
  function lockStart(go) {
    if (lockArmed || !lockWanted()) { go(); return; }
    LessonLock.enter(S.first.trim()).then(function (ok) {
      if (!ok) { lockNote('Fullscreen did not start. This lesson needs Chrome on your Chromebook. Tell Mr. D.'); return; }
      lockArmed = true; lockChip(); go();
    });
  }
  function lockFinish() {
    if (!lockArmed) return;
    var st = LessonLock.stats(); S.lockExits = st.total; S.lockAway = st.awaySec;
    lockArmed = false; LessonLock.finish(); lockChip(); saveNow();
  }
  function lockResumeCard(root) {
    var card = el('section', 'card'), n = LessonLock.lockNo();
    card.appendChild(el('h2', null, '🔒 Locked. Hand up, eyes forward.'));
    card.appendChild(el('p', null, 'You closed the lesson. That is lock number ' + n + '. Mr. D needs to see you and give you a code.'));
    var row = el('div', 'row'), inp = el('input'); inp.type = 'text'; inp.inputMode = 'numeric'; inp.maxLength = 4; inp.setAttribute('aria-label', 'Unlock code from Mr. D'); inp.style.width = '6em';
    var btn = el('button', 'btn primary big', 'Unlock'); btn.type = 'button'; row.appendChild(inp); row.appendChild(btn); card.appendChild(row);
    var msg = el('p', 'msg bad'); card.appendChild(msg);
    function go() {
      LessonLock.resume(inp.value).then(function (r) {
        if (r === 'ok') { lockArmed = true; lockResume = false; lockChip(); LE.render(); }
        else msg.textContent = r === 'nofs' ? 'Fullscreen did not start. Click again.' : 'Not the code. Hand up and wait for Mr. D.';
      });
    }
    btn.onclick = go; inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    root.appendChild(card); inp.focus();
  }

  /* ---------- steps and gating ---------- */
  function stepIndex(id) { for (var i = 0; i < CFG.steps.length; i++) if (CFG.steps[i].id === id) return i; return 0; }
  function skipped(id) { return !!(S.skip && S.skip[id]); }
  function stepCan(i) { var st = CFG.steps[i]; if (KEY || st.optional || skipped(st.id)) return true; try { return !!st.canLeave(ctx()); } catch (e) { return false; } }
  function reachable() {
    if (KEY || S.ended) return CFG.steps.length - 1;
    var i = 0; while (i < CFG.steps.length - 1 && stepCan(i)) i++; return i;
  }
  function ctx() { return { S: S, LE: LE, band: LE.band(), key: KEY, cfg: CFG }; }
  LE.goto = function (id) {
    var idx = stepIndex(id); if (idx > reachable() || lockResume) return;
    lockStart(function () { S.step = id; S.max = Math.max(S.max || 0, idx); viewNotes = false; saveNow(); LE.render(); window.scrollTo(0, 0); });
  };
  LE.stepIndex = function (id) { return stepIndex(id || S.step); };
  /* The student presses End at the end mark (or after the bell). Their stamp records the furthest step they reached. */
  LE.endNow = function (why) {
    S.ended = why || 'time'; S.endIdx = Math.max(S.max || 0, stepIndex(S.step)); S.endedAt = Date.now(); lockFinish();
    S.step = CFG.steps[CFG.steps.length - 1].id; saveNow(); LE.render(); window.scrollTo(0, 0);
  };
  LE.reached = function () { var i = S.ended ? S.endIdx : Math.max(S.max || 0, stepIndex(S.step)); return { idx: i, label: CFG.steps[Math.min(i, CFG.steps.length - 1)].label, of: CFG.steps.length }; };
  LE.next = function () {
    var i = stepIndex(S.step);
    if (CFG.steps[i].timed && S.hret) { var back = S.hret; S.hret = ''; if (back !== S.step) { LE.forceGoto(back); return; } }   // a timed huddle hands the student back to where they were
    if (!(i + 1 < CFG.steps.length && stepCan(i))) return;
    var j = i + 1; while (j < CFG.steps.length - 1 && skipped(CFG.steps[j].id)) j++;                                           // trimmed steps are skipped, never the last one
    LE.goto(CFG.steps[j].id);
  };
  /* Move without the reachable() check: used by the clock (timed huddle) and by pacing, never by a student click. */
  LE.forceGoto = function (id) { var idx = stepIndex(id); S.step = id; S.max = Math.max(S.max || 0, idx); viewNotes = false; saveNow(); LE.render(); window.scrollTo(0, 0); };
  /* How many items of a trimmed step to show. Steps call LE.items('build', 4) and get 4, or fewer when the pace plan shrank it. */
  LE.items = function (id, full) { var n = S.trim && S.trim[id]; return n ? Math.min(full, n) : full; };
  LE.isSkipped = skipped;
  LE.gate = function () {
    renderNav();
    var b = $('btn-next'); if (b) b.disabled = !stepCan(stepIndex(S.step));
  };

  function renderNav() {
    var nav = $('steps'); nav.textContent = '';
    var max = reachable(), cur = stepIndex(S.step);
    CFG.steps.forEach(function (st, i) {
      var b = el('button', null, (i + 1) + ' ' + st.label + (skipped(st.id) ? ' (skipped)' : '')); b.type = 'button';
      if (skipped(st.id)) b.className = 'skipped';
      if (i === cur && !viewNotes) b.setAttribute('aria-current', 'step');
      b.disabled = i > max; b.onclick = function () { LE.goto(st.id); };
      nav.appendChild(b);
    });
  }

  /* ---------- timing ---------- */
  var lastCan = null, liveOn = false;
  function tick() {
    if (!S || !S.first || lockResume) return;
    updateEndBar();
    if (document.visibilityState !== 'visible') return;
    S.t[S.step] = (S.t[S.step] || 0) + 1;
    if (S.t[S.step] % 5 === 0) saveNow();
    paceTick();
    var can = LE.canEnd();
    if (lastCan !== null && can !== lastCan && CFG.steps[stepIndex(S.step)].id === CFG.steps[CFG.steps.length - 1].id && !viewNotes) LE.render();
    lastCan = can;
    if (!liveOn && !KEY) { liveOn = true; MrD.live.attach({ course: CFG.course, lessonId: CFG.id, who: function () { return { first: S.first, period: S.period }; }, snap: liveSnap }); }
  }
  /* Pacing (opt-in with cfg.pacing, see shared/pace.js). In a real class period only; #key and home mode never trim or interrupt. */
  function paceBar(msg) {
    var b = $('pacebar'); if (!b) { b = el('div'); b.id = 'pacebar'; b.setAttribute('role', 'status'); b.setAttribute('aria-live', 'polite'); b.style.cssText = 'margin:8px 0;padding:8px 14px;border-radius:8px;background:var(--stage);border:1px solid var(--accent);font-weight:600'; var nav = $('steps'); nav.parentNode.insertBefore(b, nav); }
    b.hidden = !msg; if (msg) b.textContent = msg;
  }
  function paceTick() {
    var P = CFG.pacing; if (!P || KEY || S.ended || !window.MrD || !MrD.pace) return;
    var c = LE.clock(); if (c.mode !== 'class') return;
    var hd = MrD.pace.huddleDue(P, c.minutesIn, S.hfired || []);
    if (hd) {                                                                      // the clock calls the huddle, not the student's progress
      S.hfired = (S.hfired || []).concat(hd.key); S.hkey = hd.key;
      var ts = CFG.steps.filter(function (x) { return x.timed; })[0];
      if (ts && S.step !== ts.id) { S.hret = S.step; LE.forceGoto(ts.id); paceBar('Huddle time. Look up: Mr. D is at the board.'); return; }
    }
    var done = CFG.steps.filter(function (x, i) { return i < stepIndex(S.step) && !x.timed; }).map(function (x) { return x.id; });
    var d = MrD.pace.decide(P, { minutesIn: c.minutesIn, stepId: S.step, doneIds: done });
    var changed = false; S.skip = S.skip || {}; S.trim = S.trim || {};
    d.skip.forEach(function (id) { if (!S.skip[id]) { S.skip[id] = 1; changed = true; } });
    Object.keys(d.items).forEach(function (id) { if (S.trim[id] !== d.items[id]) { S.trim[id] = d.items[id]; changed = true; } });
    if (changed) { saveNow(); paceBar('Pace check: some parts are trimmed so you finish the core. Skipped parts go in your notes as home practice.'); renderNav(); if (S.skip[S.step] && !CFG.steps[stepIndex(S.step)].timed) LE.next(); }
  }
  /* "Time is up" banner. Shown only from the end mark on (or after the bell), never earlier, so there is no countdown to wait out. */
  function updateEndBar() {
    var b = $('endbar'); if (!b) return;
    var last = CFG.steps[CFG.steps.length - 1].id, c = LE.clock();
    var show = !KEY && !!S.first && !S.ended && S.step !== last && c.needsEnd;
    if (show === !b.hidden) return;
    b.hidden = !show; b.textContent = '';
    if (!show) return;
    b.appendChild(el('span', null, c.friday || c.afterBell ? 'The bell has rung. Finish the question you are on, then end your guided notes.' : 'Time for guided notes is up. Finish the question you are on, then end your guided notes.'));
    var eb = el('button', 'btn primary', 'End my guided notes'); eb.type = 'button'; eb.onclick = function () { LE.endNow('time'); }; b.appendChild(eb);
  }
  function liveSnap() {
    var ans = 0, miss = 0, k, prompt = '', stuck = false;
    for (k in S.q) { if (S.q[k].done) ans++; miss += S.q[k].misses || 0; }
    var boxes = document.querySelectorAll('#stage .q');
    for (var i = 0; i < boxes.length; i++) { var qs = S.q[boxes[i].dataset.qid]; if (!qs || !qs.done) { var qt = boxes[i].querySelector('.qtext'); prompt = qt ? qt.textContent : ''; stuck = !!(qs && qs.misses >= 1); break; } }
    var tot = 0; for (k in S.t) tot += S.t[k];
    return { step: CFG.steps[stepIndex(S.step)].label, stepIdx: stepIndex(S.step) + 1, stepCount: CFG.steps.length, band: LE.band(), answered: ans, misses: miss, prompt: prompt, exits: lockArmed ? LessonLock.stats().total : (S.hid || 0), secs: tot, stuck: stuck, done: !!S.ended };
  }

  /* ---------- question widgets ---------- */
  function qState(q) { return S.q[q.id] || (S.q[q.id] = { misses: 0, done: false, ok: false, t0: Date.now() }); }
  LE.qs = function (id) { return S.q[id] || null; };
  function optHtml(o) { return typeof o === 'string' ? o : (o.svg ? o.svg + (o.label ? '<span>' + o.label + '</span>' : '') : o.html); }
  function finish(q, st, box, solved) {
    st.done = true; st.ok = !!solved; st.secs = st.secs || Math.round((Date.now() - st.t0) / 1000);
    if (q.worked && q.type !== 'expr') {
      var w = box.querySelector('.worked'); if (!w) { w = el('p', 'msg ' + (solved ? 'ok' : '')); w.className += ' worked'; box.appendChild(w); }
      html(w, (q.type === 'text' ? '' : (solved ? 'Correct. ' : 'Here is the reasoning. ')) + q.worked);
    }
    LE.save();
    if (q.onDone) q.onDone(st);
    LE.gate();
  }
  function feedbackEl(box) { var f = box.querySelector('.fb'); if (!f) { f = el('p', 'msg bad fb'); box.appendChild(f); } return f; }
  function keyLine(box, text) { if (KEY) box.appendChild(el('p', 'keyline', 'KEY: ' + text)); }

  LE.ask = function (parent, q) {
    var st = qState(q);
    LE.debug.qs[q.id] = q;
    var box = el('div', 'q'); box.dataset.qid = q.id; parent.appendChild(box);
    if (q.head) box.appendChild(el('p', 'qhead', q.head));
    if (q.pic) { var pd = el('div', 'qpic'); html(pd, q.pic); box.appendChild(pd); }   // a picture comes before the question
    if (q.prompt) { var qt = el('p', 'qtext'); html(qt, (window.QKIT && (q.type === 'expr' || q.math)) ? QKIT.inline(q.prompt) : q.prompt); box.appendChild(qt); }
    if (q.remember) box.appendChild(el('p', 'hint qremember', 'Remember: ' + q.remember));
    if (q.type === 'choice') askChoice(box, q, st);
    else if (q.type === 'num') askNum(box, q, st);
    else if (q.type === 'cloze') askCloze(box, q, st);
    else if (q.type === 'text') askText(box, q, st);
    else if (q.type === 'expr') askExpr(box, q, st);
    return box;
  };

  /* Typed math (calculus): hands the box to calculus/shared/qkit.js, which grades by numeric equivalence and shows a KaTeX preview.
     Needs katex, mathcheck.js and qkit.js on the page. q = { type:'expr', answer:'5x^4', vars:['x'], label:'$f\'(x)=$', hints:[], traps:[], worked } */
  function askExpr(box, q, st) {
    if (!window.QKIT) { box.appendChild(el('p', 'msg bad', 'This question needs qkit.js on the page.')); return; }
    if (st.done) { var dn = el('div', 'msg worked ' + (st.ok ? 'ok' : '')); dn.innerHTML = (st.ok ? 'Correct. ' : 'Here is the reasoning. ') + 'Answer: ' + QKIT.tex(window.MC ? MC.toLatex(String(q.answer), q.vars || ['x']) : String(q.answer)) + (q.worked ? QKIT.rich(q.worked) : ''); box.appendChild(dn); return; }
    var slot = el('div'); box.appendChild(slot);
    var field = { id: 'a', type: 'expr', label: q.label || '', answer: q.answer, vars: q.vars || ['x'], traps: q.traps };
    var spec = { id: q.id, fields: [field], hints: q.hints || [], worked: q.worked, why: q.why };
    var opt = { keypad: true, key: KEY, seed: q.id + '|' + S.first, noHints: !!q.noHints, maxTries: q.maxMiss ? q.maxMiss : 0,
      onDone: function (res) { st.misses = res.misses; st.hints = res.hints; st.traps = res.traps; st.assisted = res.assisted; finish(q, st, box, !res.assisted); } };
    QKIT.render(slot, spec, opt);
  }

  function askChoice(box, q, st) {
    var order = q.options.map(function (_, i) { return i; });
    if (!q.fixed) order = shuffle(order, LE.seedRng('order:' + q.id));
    var list = el('div', 'opts' + (q.grid ? ' grid' : '')); box.appendChild(list);
    var btns = {};
    order.forEach(function (i) {
      var b = el('button', 'opt'); b.type = 'button'; b.dataset.i = String(i); html(b, optHtml(q.options[i])); btns[i] = b;
      if (KEY && i === q.answer) b.classList.add('keyans');
      b.onclick = function () {
        if (st.done) return;
        if (i === q.answer) {
          st.pick = i; b.classList.add('good'); Object.keys(btns).forEach(function (k) { btns[k].disabled = true; });
          var f = box.querySelector('.fb'); if (f) f.remove();
          finish(q, st, box, true);
        } else {
          st.misses++; (st.wrong = st.wrong || []).push(i); b.classList.add('bad'); b.disabled = true;
          var fb = feedbackEl(box);
          var why = q.why && q.why[i] ? q.why[i] : (q.noHint ? '' : (q.hint || ''));
          html(fb, why ? 'Not quite. ' + why : 'Not quite.');
          if (st.misses >= (q.maxMiss || MAXMISS)) {
            st.pick = q.answer; btns[q.answer].classList.add('good');
            Object.keys(btns).forEach(function (k) { btns[k].disabled = true; });
            finish(q, st, box, false);
          }
          LE.save(); LE.gate();
        }
      };
      list.appendChild(b);
    });
    if (st.done) {
      Object.keys(btns).forEach(function (k) { btns[k].disabled = true; });
      (st.wrong || []).forEach(function (i) { btns[i].classList.add('bad'); });
      btns[q.answer].classList.add('good');
      if (q.worked) { var w = el('p', 'msg worked ' + (st.ok ? 'ok' : '')); html(w, (st.ok ? 'Correct. ' : 'Here is the reasoning. ') + q.worked); box.appendChild(w); }
    }
    keyLine(box, 'option shown with gold outline');
  }

  function parseNum(v) { var s = String(v).replace(/,/g, '').replace(/\u2212/g, '-').trim(); if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN; return parseFloat(s); }
  LE.numOK = function (val, ans, tol, abs) {
    if (!isFinite(val)) return false;
    if (ans === 0) return Math.abs(val) <= (abs == null ? 0.001 : abs);
    return Math.abs(val - ans) <= Math.max(Math.abs(ans) * (tol == null ? 0.02 : tol), abs || 0);
  };
  function askNum(box, q, st) {
    var row = el('div', 'row'); box.appendChild(row);
    var inp = el('input'); inp.type = 'text'; inp.inputMode = 'decimal'; inp.setAttribute('aria-label', q.label || 'Answer'); inp.autocomplete = 'off';
    row.appendChild(inp);
    if (q.unit) row.appendChild(el('span', null, q.unit));
    if ((q.keypad || CFG.keypad) && window.MrD && MrD.keypad && !st.done) MrD.keypad.attach(inp, { mode: 'number', after: row });
    var btn = el('button', 'btn', 'Check'); btn.type = 'button'; row.appendChild(btn);
    if (st.done) { inp.value = st.val != null ? st.val : ''; inp.disabled = true; btn.disabled = true; if (q.worked) { var w = el('p', 'msg worked ' + (st.ok ? 'ok' : '')); html(w, (st.ok ? 'Correct. ' : 'Here is the reasoning. ') + q.worked); box.appendChild(w); } }
    function go() {
      if (st.done) return;
      var v = parseNum(inp.value);
      var fb = feedbackEl(box);
      if (isNaN(v)) { fb.className = 'msg bad fb'; fb.textContent = 'Enter a number (digits only, no units).'; return; }
      st.val = inp.value;
      if (LE.numOK(v, q.answer, q.tol, q.abs)) {
        fb.remove(); inp.disabled = true; btn.disabled = true; finish(q, st, box, true);
      } else {
        st.misses++; fb.className = 'msg bad fb';
        var msg = (q.near && q.near(v)) || q.hint || '';
        html(fb, msg ? 'Not quite. ' + msg : 'Not quite.');
        if (st.misses >= (q.maxMiss || MAXMISS + 1)) { inp.value = q.revealText != null ? q.revealText : LE.fmtN(q.answer); inp.disabled = true; btn.disabled = true; finish(q, st, box, false); }
        LE.save(); LE.gate();
      }
    }
    btn.onclick = go; inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    keyLine(box, (q.revealText != null ? q.revealText : LE.fmtN(q.answer)) + (q.unit ? ' ' + q.unit : ''));
  }

  function askCloze(box, q, st) {
    var p = el('p', 'prose'); box.appendChild(p);
    var inputs = [];
    var parts = q.text.split(/\{(\d+)\}/);
    parts.forEach(function (s, i) {
      if (i % 2 === 0) { p.appendChild(document.createTextNode(s)); }
      else { var k = +s - 1; var inp = el('input', 'blank'); inp.type = 'text'; inp.autocomplete = 'off'; inp.setAttribute('aria-label', 'Blank ' + (k + 1)); inputs[k] = inp; p.appendChild(inp); }
    });
    if (q.bank) box.appendChild(el('p', 'hint', 'Word bank: ' + q.bank.join(' \u00b7 ')));
    var row = el('div', 'row'); var btn = el('button', 'btn', 'Check'); btn.type = 'button'; row.appendChild(btn); box.appendChild(row);
    if (st.done) { inputs.forEach(function (x, k) { x.value = (st.vals && st.vals[k]) || q.blanks[k][0]; x.disabled = true; x.classList.add('ok'); }); btn.disabled = true; }
    btn.onclick = function () {
      if (st.done) return;
      var vals = inputs.map(function (x) { return x.value; }); st.vals = vals;
      var all = true;
      inputs.forEach(function (x, k) {
        var good = q.blanks[k].some(function (a) { return LE.norm(a) === LE.norm(x.value); });
        x.classList.toggle('ok', good); x.classList.toggle('no', !good && x.value.trim() !== ''); if (!good) all = false;
      });
      var fb = feedbackEl(box);
      if (all) { fb.remove(); inputs.forEach(function (x) { x.disabled = true; }); btn.disabled = true; finish(q, st, box, true); }
      else {
        st.misses++; fb.className = 'msg bad fb'; html(fb, 'Some blanks are not right yet. ' + (q.hint || 'Reread the explanation above.'));
        if (st.misses >= (q.maxMiss || 3)) { inputs.forEach(function (x, k) { x.value = q.blanks[k][0]; x.disabled = true; x.classList.add('ok'); x.classList.remove('no'); }); btn.disabled = true; finish(q, st, box, false); }
        LE.save(); LE.gate();
      }
    };
    keyLine(box, q.blanks.map(function (b) { return b[0]; }).join(' | '));
  }

  function askText(box, q, st) {
    var ta = el('textarea'); ta.rows = q.rows || 3; ta.setAttribute('aria-label', q.label || 'Your answer'); ta.value = st.text || ''; box.appendChild(ta);
    var need = q.minWords || 6;
    var row = el('div', 'row'); var btn = el('button', 'btn primary', 'Lock it in'); btn.type = 'button'; btn.disabled = true;
    var cnt = el('span', 'hint', ''); row.appendChild(btn); row.appendChild(cnt); box.appendChild(row);
    function upd() { var n = LE.words(ta.value); cnt.textContent = n + ' of ' + need + ' words'; btn.disabled = st.done || n < need; }
    ta.addEventListener('input', function () { if (st.done) return; st.text = ta.value; LE.save(); upd(); });
    btn.onclick = function () {
      if (st.done) return; st.text = ta.value;
      if (q.rubric) { st.rubric = q.rubric.map(function (r) { return r.re.test(ta.value) ? 1 : 0; }); }
      ta.disabled = true; btn.disabled = true; finish(q, st, box, true);
    };
    if (st.done) { ta.disabled = true; btn.disabled = true; if (q.worked) { var w = el('p', 'msg worked'); html(w, q.worked); box.appendChild(w); } }
    upd();
    if (KEY && q.rubric) box.appendChild(el('p', 'keyline', 'RUBRIC: ' + q.rubric.map(function (r) { return r.name; }).join(', ')));
  }

  /* ---------- notes document (one structure -> screen, print, LaTeX) ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  LE.esc = esc;
  function fbdSVG(f) { // f = {forces:[{dir,len,label}], title}
    var W = 220, H = 150, cx = 110, cy = 72, out = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(f.title || 'Free-body diagram') + '">';
    out += '<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#142230"/></marker></defs>';
    out += '<rect x="' + (cx - 14) + '" y="' + (cy - 9) + '" width="28" height="18" fill="#cbd6e0" stroke="#142230"/>';
    var V = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    (f.forces || []).forEach(function (a) {
      var d = V[a.dir], L = a.len || 50, x2 = cx + d[0] * (L + 10), y2 = cy + d[1] * (L + 10);
      var x1 = cx + d[0] * 10, y1 = cy + d[1] * 10;
      out += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#142230" stroke-width="2.2" marker-end="url(#ah)"/>';
      var lx = x2 + d[0] * 6 + (d[1] ? 8 : 0), ly = y2 + d[1] * 12 + (d[0] ? -6 : 4);
      out += '<text x="' + lx + '" y="' + ly + '" font-size="13" font-family="serif" fill="#142230" text-anchor="' + (d[0] < 0 ? 'end' : d[0] > 0 ? 'start' : 'start') + '">' + esc(a.label) + '</text>';
    });
    return out + '</svg>';
  }
  LE.fbdSVG = fbdSVG;

  function buildNotesNode() {
    var doc = CFG.notes(ctx()); // {title, sections:[{title, blocks:[...]}]}
    var root = el('div', 'notes-doc');
    root.appendChild(el('h1', null, doc.title));
    var meta = el('div', 'nmeta'); meta.textContent = (S.first || 'Name') + ' \u00b7 Period ' + (S.period || '_') + ' \u00b7 ' + LE.today(); root.appendChild(meta);
    doc.sections.forEach(function (sec) {
      root.appendChild(el('h2', null, sec.title));
      sec.blocks.forEach(function (b) {
        if (b.type === 'p') { var p = el('p'); if (b.em) p.className = 'em'; p.textContent = b.text; root.appendChild(p); }
        else if (b.type === 'blank') { root.appendChild(el('div', 'blank-line')); }
        else if (b.type === 'box') { var bx = el('div', 'nbox'); if (b.label) { var l = el('b'); l.textContent = b.label + ' '; bx.appendChild(l); } bx.appendChild(document.createTextNode(b.text)); root.appendChild(bx); }
        else if (b.type === 'list') { var ul = el('ul'); b.items.forEach(function (t) { ul.appendChild(el('li', null, t)); }); root.appendChild(ul); }
        else if (b.type === 'table') {
          var wrap = el('div', 'scroll'), t = el('table'); var thead = el('thead'), tr = el('tr');
          b.head.forEach(function (h) { tr.appendChild(el('th', null, h)); }); thead.appendChild(tr); t.appendChild(thead);
          var tb = el('tbody'); b.rows.forEach(function (r) { var tr2 = el('tr'); r.forEach(function (c) { tr2.appendChild(el('td', null, c)); }); tb.appendChild(tr2); }); t.appendChild(tb);
          wrap.appendChild(t); root.appendChild(wrap);
        }
        else if (b.type === 'fbds') {
          b.items.forEach(function (f) { var d = el('div', 'nfbd'); d.innerHTML = fbdSVG(f); var c = el('div'); c.textContent = f.title; d.appendChild(c); root.appendChild(d); });
        }
      });
    });
    return root;
  }

  var TEXMAP = { '\u03bc': '\\ensuremath{\\mu}', '\u03a3': '\\ensuremath{\\Sigma}', '\u0394': '\\ensuremath{\\Delta}', '\u03b8': '\\ensuremath{\\theta}', '\u03c0': '\\ensuremath{\\pi}', '\u00b0': '\\ensuremath{^\\circ}', '\u00d7': '\\ensuremath{\\times}', '\u2212': '--', '\u2013': '--', '\u2014': '---', '\u2248': '\\ensuremath{\\approx}', '\u2192': '\\ensuremath{\\rightarrow}', '\u2190': '\\ensuremath{\\leftarrow}', '\u2191': '\\ensuremath{\\uparrow}', '\u2193': '\\ensuremath{\\downarrow}', '\u00b2': '\\ensuremath{^2}', '\u00b3': '\\ensuremath{^3}', '\u2264': '\\ensuremath{\\le}', '\u2265': '\\ensuremath{\\ge}', '\u2260': '\\ensuremath{\\ne}', '\u221a': '\\ensuremath{\\sqrt{\\ }}', '\u00b7': '\\ensuremath{\\cdot}', '\u2019': "'", '\u2018': '`', '\u201c': '``', '\u201d': "''", '\u2026': '\\ldots{}', '\u00a0': '~', '\u03b1': '\\ensuremath{\\alpha}', '\u03c4': '\\ensuremath{\\tau}', '\u2211': '\\ensuremath{\\sum}', '\u2194': '\\ensuremath{\\leftrightarrow}', '\u21d4': '\\ensuremath{\\Leftrightarrow}', '\u2074': '\\ensuremath{^4}', '\u207b': '\\ensuremath{^{-}}', '\u00b9': '\\ensuremath{^1}', '\u00bd': '\\ensuremath{\\tfrac12}', '\u00b1': '\\ensuremath{\\pm}', '\u221e': '\\ensuremath{\\infty}', '\u2080': '\\ensuremath{_0}', '\u2081': '\\ensuremath{_1}', '\u2082': '\\ensuremath{_2}', '\u2083': '\\ensuremath{_3}' };
  function tex(s) {
    s = String(s == null ? '' : s);
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (TEXMAP[c]) out += TEXMAP[c];
      else if ('\\{}$&#^_%~'.indexOf(c) >= 0) out += { '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '$': '\\$', '&': '\\&', '#': '\\#', '^': '\\textasciicircum{}', '_': '\\_', '%': '\\%', '~': '\\textasciitilde{}' }[c];
      else if (c.charCodeAt(0) > 126) out += '?';
      else out += c;
    }
    return out;
  }
  LE.tex = tex;
  function fbdTikz(f) {
    var V = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };
    var out = '\\begin{tikzpicture}[scale=0.9]\n\\draw[fill=gray!25] (-0.4,-0.25) rectangle (0.4,0.25);\n';
    (f.forces || []).forEach(function (a) {
      var d = V[a.dir], L = (a.len || 50) / 40 + 0.3, x1 = d[0] * 0.4, y1 = d[1] * 0.25, x2 = d[0] * (L + 0.3), y2 = d[1] * (L + 0.1);
      var anchor = { up: 'south', down: 'north', left: 'east', right: 'west' }[a.dir];
      out += '\\draw[->, thick] (' + x1.toFixed(2) + ',' + y1.toFixed(2) + ') -- (' + x2.toFixed(2) + ',' + y2.toFixed(2) + ') node[anchor=' + anchor + '] {' + tex(a.label) + '};\n';
    });
    return out + '\\end{tikzpicture}';
  }
  LE.buildTex = function () {
    var doc = CFG.notes(ctx()), o = [];
    o.push('% Newton notes generated by Mr. D\'s lesson page. Compile with pdflatex (Overleaf works).');
    o.push('\\documentclass[11pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage[margin=0.9in]{geometry}\n\\usepackage{amsmath,amssymb}\n\\usepackage{tikz}\n\\usepackage{booktabs,array,tabularx}\n\\usepackage{enumitem}\n\\usepackage{titlesec}\n\\titleformat{\\section}{\\large\\scshape\\bfseries}{}{0pt}{}[\\vspace{-4pt}\\rule{\\textwidth}{0.4pt}]\n\\setlength{\\parindent}{0pt}\\setlength{\\parskip}{4pt}\n\\newcolumntype{Y}{>{\\raggedright\\arraybackslash}X}\n\\begin{document}');
    o.push('\\begin{center}{\\LARGE\\bfseries ' + tex(doc.title) + '}\\\\[4pt]' + tex((S.first || 'Name') + ', Period ' + (S.period || '') + ', ' + LE.today()) + '\\end{center}\\hrule\\vspace{6pt}');
    doc.sections.forEach(function (sec) {
      o.push('\\section*{' + tex(sec.title) + '}');
      sec.blocks.forEach(function (b) {
        if (b.type === 'p') o.push((b.em ? '\\emph{' + tex(b.text) + '}' : tex(b.text)) + '\n');
        else if (b.type === 'blank') o.push('\\rule{\\textwidth}{0.3pt}\\\\[10pt]');
        else if (b.type === 'box') o.push('\\fbox{\\parbox{0.96\\textwidth}{' + (b.label ? '\\textbf{' + tex(b.label) + '} ' : '') + tex(b.text) + '}}\n');
        else if (b.type === 'list') o.push('\\begin{itemize}[leftmargin=*,itemsep=1pt]\n' + b.items.map(function (t) { return '\\item ' + tex(t); }).join('\n') + '\n\\end{itemize}');
        else if (b.type === 'table') {
          var n = b.head.length;
          o.push('\\begin{tabularx}{\\textwidth}{' + new Array(n + 1).join('Y') + '}\\toprule\n' + b.head.map(function (h) { return '\\textbf{' + tex(h) + '}'; }).join(' & ') + ' \\\\\\midrule\n' + b.rows.map(function (r) { return r.map(tex).join(' & ') + ' \\\\'; }).join('\n') + '\n\\bottomrule\\end{tabularx}\n');
        }
        else if (b.type === 'fbds') {
          o.push('\\begin{center}\n' + b.items.map(function (f) { return '\\begin{minipage}{0.3\\textwidth}\\centering ' + fbdTikz(f) + '\\\\ \\small ' + tex(f.title) + '\\end{minipage}'; }).join('\\hfill\n') + '\n\\end{center}');
        }
      });
    });
    o.push('\\end{document}');
    return o.join('\n\n');
  };

  function notesView(root) {
    var bar = el('div', 'row noprint');
    var back = el('button', 'btn', '\u2190 Back to the lesson'); back.type = 'button'; back.onclick = function () { viewNotes = false; LE.render(); };
    var pr = el('button', 'btn primary', 'Print or save as PDF'); pr.type = 'button'; pr.onclick = function () { LE.print(); };
    var tx = el('button', 'btn', 'Download LaTeX (.tex)'); tx.type = 'button'; tx.onclick = function () { LE.downloadTex(); };
    bar.appendChild(back); bar.appendChild(pr); bar.appendChild(tx); root.appendChild(bar);
    root.appendChild(el('p', 'hint noprint', 'These notes fill in as you work. In the print window choose \u201cSave as PDF\u201d as the destination. The .tex file compiles with pdflatex or on Overleaf. Blank lines mean that part is not finished yet.'));
    root.appendChild(buildNotesNode());
  }
  LE.print = function () {
    var pr = $('notes-print-root'); pr.textContent = ''; pr.appendChild(buildNotesNode()); pr.hidden = false;
    var done = function () { pr.hidden = true; pr.textContent = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done); window.print();
  };
  LE.downloadTex = function () {
    var blob = new Blob([LE.buildTex()], { type: 'text/x-tex' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = CFG.id + '-notes-' + (S.first || 'student') + '.tex'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* ---------- render ---------- */
  LE.render = function () {
    var stage = $('stage'); stage.textContent = '';
    renderNav();
    if (lockResume) { lockResumeCard(stage); return; }
    if (viewNotes) { notesView(stage); return; }
    var i = stepIndex(S.step), st = CFG.steps[i]; S.max = Math.max(S.max || 0, i);
    var card = el('section', 'card'); card.dataset.step = st.id; stage.appendChild(card);
    if (KEY && st.teacher) { var kp = el('div', 'keypanel'); kp.appendChild(el('h4', null, 'Teacher key \u00b7 ' + st.label)); var inner = el('div'); html(inner, st.teacher(ctx())); kp.appendChild(inner); stage.insertBefore(kp, card); }
    if (lockArmed) { if (i === CFG.steps.length - 1 && LE.canEnd()) lockFinish(); else LessonLock.save(i, false, null); }   // progress itself saves in S; the lock only needs to know where the student is
    st.render(card, ctx());
    if (i === 0 && lockWanted() && !lockArmed) card.appendChild(el('p', 'hint', '\ud83d\udd12 Locked mode. This lesson runs in fullscreen while class is on. Leaving it (Esc, a new tab, another window, closing the page) is recorded on your stamp. The second time, your screen locks until Mr. D gives you a code.'));
    if (i === CFG.steps.length - 1 && LE.canEnd() && S.lockExits != null) card.appendChild(el('p', 'hint', 'Times you left the lesson: ' + S.lockExits + ' \u00b7 time away ' + Math.floor(S.lockAway / 60) + ':' + ('0' + (S.lockAway % 60)).slice(-2)));
    var row = el('div', 'row');
    if (i > 0) { var bk = el('button', 'btn', 'Back'); bk.type = 'button'; bk.onclick = function () { S.step = CFG.steps[i - 1].id; saveNow(); LE.render(); window.scrollTo(0, 0); }; row.appendChild(bk); }
    if (i + 1 < CFG.steps.length) { var nx = el('button', 'btn primary', 'Continue'); nx.type = 'button'; nx.id = 'btn-next'; nx.onclick = LE.next; row.appendChild(nx); }
    stage.appendChild(row);
    LE.gate();
  };

  function keyBar() {
    var bar = $('keybar'); bar.hidden = !KEY; bar.textContent = '';
    if (!KEY) return;
    var extra = [];
    var bsel = el('label', null, 'Preview level '); var sel = el('select'); for (var bi = 1, bm = (CFG && CFG.maxBand) || 4, bl = []; bi <= bm; bi++) bl.push(bi); bl.forEach(function (b) { var o = el('option', null, String(b)); o.value = String(b); if (b === LE.band()) o.selected = true; sel.appendChild(o); });
    sel.onchange = function () { LE.setBand(+sel.value, 'key'); LE.render(); }; bsel.appendChild(sel); extra.push(bsel);
    var rs = el('button', null, 'Reset this device'); rs.type = 'button'; rs.onclick = function () { if (confirm('Clear saved progress on this device?')) LE.reset(); }; extra.push(rs);
    MrD.teacherBar(bar, { course: CFG.course, lessonId: CFG.id, gates: CFG.gates, teacher: 'teacher.html#' + CFG.id, root: '../../', extra: extra });
  }

  LE.start = function (cfg) {
    CFG = cfg; KEY = MrD.isKey();
    S = load();
    if (CFG.lock && window.LessonLock) {
      LessonLock.init({ id: CFG.id, root: document.querySelector('.wrap'), onChange: lockChip });
      if (lockWanted() && LessonLock.pending()) lockResume = true;   // today's lock record was never finished: the page was closed, so it counts as an exit and needs a code
    }
    document.title = cfg.title + ' \u00b7 Mr. D';
    $('title').textContent = cfg.title; $('subtitle').textContent = cfg.subtitle;
    $('btn-notes').onclick = function () { if (!S.first) return; viewNotes = true; LE.render(); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', function () { KEY = MrD.isKey(); if (KEY) lockResume = false; keyBar(); LE.render(); });
    ticker = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && S && S.first && !KEY) { S.hid = (S.hid || 0) + 1; saveNow(); } });
    window.addEventListener('pagehide', saveNow);
    if (cfg.concepts && window.MrD && MrD.concepts) MrD.concepts.mount($('btn-notes').parentNode, cfg.concepts, { course: cfg.course, tabs: cfg.conceptTabs });
    keyBar(); LE.render();
  };
  LE.cfg = function () { return CFG; };
  LE.setViewNotes = function (v) { viewNotes = !!v; };
})();
