/* Stats concept-checker engine (practice days), in stats/shared/checker/. One engine for every unit, one content file per practice day (in that unit's checker/ folder).
   A page loads the shared classic scripts (config, bell, codes, lock, teacherbar, ids, profile), then:
     import { run } from "../shared/checker/engine.js"; import DAY from "./checker/day-4-1-4-2.js"; run(DAY);
   What every checker does (Ian, 2026-11-19):
   - Tabs across the top, clickable once reached (all of them in #key): Warm-up, Notes, the parts, star tabs, Practice.
   - Warm-up: 3 easy review items, no lock. Notes: a self-paced picture tutorial (the calculus visual-tutorial shape):
     each card has a picture, one line and one question; no huddle, no code, no teacher input.
   - Parts are checkpoints with no click-through (shared/virtual-lab/checkpoint.js): 3 right in a row, generated questions,
     a miss gives a hint built from the student's own question and a fresh one, 3 misses or "I need Mr. D" lock until today's
     MrD.codes.override(); after an unlock, 2 fresh ones. A part may instead be a sim task (DAY.sims[id]).
     Three hidden bands: a right answer moves up one, a miss down one, so a pass ends on band 3, the regular-level standard.
   - Star tabs (gold, extension): Ian asked for them, which overrides the "no tiers" line in CLAUDE.md for these pages.
   - Practice: mixed questions at the standard until the end mark (42 min Mon-Thu, the bell Friday); End opens then, always at home.
   - Locked mode from the Begin click (shared/lock.js). No stamp, no report code. Scores go to MrD.profile.record.
   - #key: teacher bar, every tab open, answers on every question, skip buttons, a key desk (timing, unlock code, bands, samples).
   DAY = { id, title, heading, intro, warm:[item], notes:[card], parts:[id], stars:[id], mix:[id], types:{id:type}, sims:{id:sim},
           bands:[[band, text]], timing:[[tab, minutes, what]] }
     item = { text, pic?:()=>Node, answer, input:"num"|"mc", unit?, opts? }
     card = { head, pic:()=>Node, guide, say, ask:{ prompt, options:[...], answer:index, why } }
     type = { title, sub, skill, input:"num"|"mc", unit?, tol?, make(band) -> { pic?:Node|[Node], text, answer, opts?, hint } }
     sim  = { title, sub?, skill, run(host, done, api) }   api = { key, save(), state }   */
import * as CK from "../../../shared/virtual-lab/checkpoint.js";
import { h } from "../../../shared/virtual-lab/dom.js";
import { rnd, pick } from "./util.js";

export function run(DAY) {
  const KEY = MrD.isKey(), NOLOCK = (/nolock=(\d+)/.exec(location.hash) || [])[1];
  const $ = (i) => document.getElementById(i);
  const app = $("app");
  addEventListener("hashchange", () => location.reload());
  const TYPE = DAY.types;
  const TABS = [{ id: "warm", label: "Warm-up" }, { id: "notes", label: "Notes" }, ...DAY.parts.map((id, i) => ({ id, label: String(i + 1) })),
    ...DAY.stars.map((id, i) => ({ id, label: "★" + (i + 1), star: true })), { id: "mix", label: "Practice" }];
  const CHECK_IDS = [...DAY.parts, ...DAY.stars].filter(id => TYPE[id]);

  /* ---------- state (saved per day, so a reload or a lock does not wipe it) ---------- */
  const SKEY = "cc:" + DAY.id + ":" + MrD.bell.dayKey();
  let ST = null, lockArmed = false;
  const fresh = () => ({ id: "", period: "", tab: 0, reached: 0, done: {}, warm: 0, note: 0, started: false, ended: false, t0: Date.now(),
    cps: Object.fromEntries([...CHECK_IDS, "mix"].map(id => [id, CK.track()])),
    band: Object.fromEntries([...CHECK_IDS.map(id => [id, DAY.stars.includes(id) ? 3 : 1]), ["mix", 3]]),
    lock: null, sim: {}, answered: 0, misses: 0, mixed: 0, items: [] });
  const save = () => { if (KEY) return; try { localStorage.setItem(SKEY, JSON.stringify(ST)); } catch (e) { } if (lockArmed) LessonLock.save(ST.tab, false, null); };
  const load = () => { try { return JSON.parse(localStorage.getItem(SKEY)); } catch (e) { return null; } };
  const clk = () => MrD.bell.clock("stats");
  const fmt = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const nodes = (x) => x == null ? [] : Array.isArray(x) ? x : [x];

  function chips() {
    const c = clk(), extra = [];
    if (c.mode === "class" && c.msToEnd != null && c.msToEnd > 0) extra.push(h("span", { class: "chip clockchip" }, "⏱ " + fmt(c.msToEnd) + " to the end mark"));
    if (lockArmed) extra.push(h("span", { class: "chip" }, "🔒 exits " + LessonLock.stats().total));
    $("chips").replaceChildren(...TABS.map((t, i) => {
      const b = h("button", { type: "button", class: "chip" + (t.star ? " star" : "") + (i === ST.tab && !ST.ended ? " on" : ST.done[t.id] ? " done" : ""), title: t.star ? "Extension" : "" }, (ST.done[t.id] ? "✓ " : "") + t.label);
      b.disabled = !(KEY || (ST.started && i <= ST.reached));
      b.onclick = () => { if (b.disabled || ST.lock) return; ST.tab = i; ST.ended = false; save(); show(); };
      return b;
    }), ...extra);
  }
  function finishTab() { ST.done[TABS[ST.tab].id] = true; ST.tab = Math.min(ST.tab + 1, TABS.length - 1); ST.reached = Math.max(ST.reached, ST.tab); save(); show(); }

  const bandUp = (id) => { ST.band[id] = Math.min(3, ST.band[id] + 1); };
  const bandDown = (id) => { ST.band[id] = Math.max(1, ST.band[id] - 1); };
  function logItem(T, band, ok, first) { ST.items.push({ skill: T.skill, title: T.title, band, firstTry: first, ok }); if (ST.items.length > 300) ST.items.shift(); }

  /* ---------- one checkpoint card (a part or star tab, or endless mixed practice when mix = true) ---------- */
  function checkpointCard(tid, opts) {
    const tr = ST.cps[tid];
    const card = h("div", { class: "card" }), pips = h("div", { class: "streak" }), body = h("div"), fb = h("div");
    const helpBtn = h("button", { class: "btn ghost help", onclick: () => lockFor(tid, "help") }, "I need Mr. D");
    let q = null, T = null, band = 1, missed = false;
    const drawPips = () => pips.replaceChildren(...(opts.mix ? [h("span", {}, "Practice until the end mark. Right so far: " + ST.mixed)] :
      [h("span", {}, "Right in a row:"), ...Array.from({ length: tr.need }, (_, i) => h("span", { class: "pip" + (i < tr.streak ? " on" : "") }))]));
    function next() {
      T = TYPE[opts.mix ? pick(DAY.mix) : tid]; band = ST.band[tid]; missed = false;
      q = T.make(band); window.__ccQ = q; body.replaceChildren();
      nodes(q.pic).forEach(n => body.append(n));
      body.append(h("div", { class: "q" }, q.text));
      if (T.input === "num") {
        const inp = h("input", { type: "number", inputmode: "decimal", step: "any", "aria-label": "Your answer" }), go = h("button", { class: "btn" }, "Check");
        go.onclick = () => { if (inp.value.trim() !== "") answer(inp.value); };
        inp.addEventListener("keydown", e => { if (e.key === "Enter") go.click(); });
        body.append(h("div", { class: "row" }, inp, T.unit ? h("b", {}, T.unit) : null, go)); setTimeout(() => inp.focus(), 0);
      } else q.opts.forEach(o => body.append(h("button", { class: "opt", onclick: (e) => answer(String(o), e.currentTarget) }, String(o))));
      if (KEY) body.append(h("div", { class: "keyline" }, h("b", {}, `KEY (band ${band}) `), String(q.answer) + (T.unit || "")));
      drawPips();
    }
    const check = (v) => T.input === "num" ? Math.abs(+v - +q.answer) <= (q.tol != null ? q.tol : T.tol || 0) + 1e-9 : String(v) === String(q.answer);
    function answer(v, btn) {
      const ok = check(v); tr.att.push({ q: q.text, v, ok, band, at: Date.now() }); ST.answered++; logItem(T, band, ok, !missed);
      const r = CK.grade(tr, ok);
      if (ok) {
        if (btn) btn.classList.add("ok"); bandUp(tid);
        if (opts.mix) { ST.mixed++; tr.streak = 0; }
        if (!opts.mix && r === "pass") { tr.passed = true; save(); fb.replaceChildren(h("div", { class: "fb ok" }, "✔ Three in a row. This part is done.")); drawPips(); setTimeout(() => opts.done(), 900); return; }
        fb.replaceChildren(h("div", { class: "fb ok" }, "✔ Right. Here is a new one.")); save(); setTimeout(next, 700); return;
      }
      ST.misses++; missed = true; bandDown(tid); if (btn) btn.classList.add("no");
      fb.replaceChildren(h("div", { class: "fb no" }, opts.mix ? "✖ Not this time." : "✖ Not this time. Your streak starts over."), h("div", { class: "hintbox" }, "💡 " + q.hint + " Now try a fresh one."));
      save();
      if (r === "lock") { lockFor(tid, "miss"); return; }
      setTimeout(next, 1600);
    }
    card.append(helpBtn, pips, body, fb);
    next();
    return card;
  }

  /* ---------- screens ---------- */
  function screen(title, sub) { chips(); app.replaceChildren(); window.scrollTo(0, 0); app.append(h("h2", {}, title)); if (sub) app.append(h("p", { class: "sub" }, sub)); if (KEY) keyDesk(); }
  function show() {
    if (ST.ended) return showFinal();
    const t = TABS[ST.tab];
    if (t.id === "warm") return showWarm();
    if (t.id === "notes") { screen("Notes", "A picture tutorial. Read each card and answer its question."); return showNotes(); }
    if (t.id === "mix") return showMix();
    return showPart(t);
  }
  function showWarm() {
    screen("Warm-up", DAY.warmSub || "Three quick review questions.");
    const it = DAY.warm[ST.warm];
    if (!it) return finishTab();
    const card = h("div", { class: "card" }), fb = h("div");
    nodes(it.pic && it.pic()).forEach(n => card.append(n));
    card.append(h("div", { class: "q" }, `${ST.warm + 1} of ${DAY.warm.length}. ${it.text}`));
    const answer = (v, btn) => { if (String(v).trim() === String(it.answer) || (it.input === "num" && Math.abs(+v - +it.answer) <= (it.tol || 0))) { if (btn) btn.classList.add("ok"); fb.replaceChildren(h("div", { class: "fb ok" }, "✔ Right.")); ST.warm++; save(); setTimeout(show, 600); } else { if (btn) btn.classList.add("no"); fb.replaceChildren(h("div", { class: "fb no" }, "✖ Not quite. Look again and try once more.")); } };
    if (it.input === "num") { const inp = h("input", { type: "number", step: "any", "aria-label": "Your answer" }), go = h("button", { class: "btn", onclick: () => answer(inp.value) }, "Check"); inp.addEventListener("keydown", e => { if (e.key === "Enter") go.click(); }); card.append(h("div", { class: "row" }, inp, it.unit ? h("b", {}, it.unit) : null, go)); setTimeout(() => inp.focus(), 0); }
    else it.opts.forEach(o => card.append(h("button", { class: "opt", onclick: (e) => answer(o, e.currentTarget) }, String(o))));
    if (KEY) card.append(h("div", { class: "keyline" }, h("b", {}, "KEY "), String(it.answer) + (it.unit || "")), h("button", { class: "btn ghost", onclick: () => { ST.warm++; show(); } }, "Next (key)"));
    card.append(fb); app.append(card);
  }
  function showNotes() {
    const f = DAY.notes[ST.note];
    if (!f) return finishTab();
    const card = h("div", { class: "card tframe" }), fb = h("div"), nextB = h("button", { class: "btn", disabled: "" }, ST.note === DAY.notes.length - 1 ? "Finish the notes →" : "Next →");
    card.append(h("div", { class: "sub" }, `Notes ${ST.note + 1} of ${DAY.notes.length}`), h("h3", {}, f.head), ...nodes(f.pic && f.pic()), h("p", { class: "guide" }, f.guide), h("p", { class: "say" }, f.say), h("div", { class: "q" }, f.ask.prompt));
    const order = f.ask.options.map((_, i) => i).sort(() => rnd() - 0.5);
    order.forEach(i => card.append(h("button", { class: "opt", onclick: (e) => {
      if (i === f.ask.answer) { e.currentTarget.classList.add("ok"); card.querySelectorAll(".opt").forEach(b => b.disabled = true); fb.replaceChildren(h("div", { class: "fb ok" }, "✔ " + f.ask.why)); nextB.disabled = false; }
      else { e.currentTarget.classList.add("no"); e.currentTarget.disabled = true; fb.replaceChildren(h("div", { class: "fb no" }, "✖ Not that one. Read the line above the question again, then try another.")); }
    } }, f.ask.options[i])));
    if (KEY) { card.append(h("div", { class: "keyline" }, h("b", {}, "KEY "), f.ask.options[f.ask.answer])); nextB.disabled = false; }
    nextB.onclick = () => { ST.note++; save(); show(); };
    card.append(fb, h("div", { class: "row" }, nextB));
    app.append(card);
  }
  function showPart(t) {
    const n = DAY.parts.indexOf(t.id), sim = DAY.sims && DAY.sims[t.id], T = TYPE[t.id];
    const title = sim ? sim.title : T.title, sub = sim ? sim.sub : T.sub;
    screen(t.star ? "★ " + title : `Part ${n + 1} of ${DAY.parts.length}: ${title}`, sub);
    if (sim) { const host = h("div"); app.append(host); if (ST.done[t.id]) ST.sim[t.id] = {}; ST.sim[t.id] = ST.sim[t.id] || {}; sim.run(host, finishTab, { key: KEY, save, state: ST.sim[t.id] }); }
    else { if (ST.done[t.id]) Object.assign(ST.cps[t.id], { streak: 0, miss: 0 }); app.append(checkpointCard(t.id, { done: finishTab })); }
    if (KEY) app.append(h("div", { class: "row" }, h("button", { class: "btn ghost", onclick: finishTab }, "Skip this tab (key)")));
    if (ST.lock) showLock();
  }
  let endTimer = null;
  function showMix() {
    screen("Practice", "Mixed questions from every part. Keep going until the end mark.");
    app.append(checkpointCard("mix", { mix: true }));
    const bar = h("div", { class: "endbar" }), btn = h("button", { class: "btn big" }, "End practice"), note = h("span", { class: "sub" });
    const upd = () => { const c = clk(); btn.disabled = !(KEY || c.canEnd); note.textContent = btn.disabled ? `  You can end at the end mark (${fmt(c.msToEnd)} left).` : ""; };
    btn.onclick = () => { if (btn.disabled) return; ST.ended = true; save(); show(); };
    bar.append(btn, note); app.append(bar); upd(); clearInterval(endTimer); endTimer = setInterval(upd, 1000);
    if (ST.lock) showLock();
  }
  function showFinal() {
    if (lockArmed) { LessonLock.finish(); lockArmed = false; }
    record();
    screen("Done for today");
    const unl = Object.values(ST.cps).reduce((a, t) => a + t.unlocks, 0);
    app.append(h("div", { class: "card", style: "text-align:center" },
      h("p", {}, "Your scores are saved on this computer. Turn in your exit ticket on paper."),
      h("table", { class: "sum" },
        h("tr", {}, h("th", {}, "Parts done"), h("td", {}, `${DAY.parts.filter(id => ST.done[id]).length} of ${DAY.parts.length}`)),
        h("tr", {}, h("th", {}, "Star tabs done"), h("td", {}, `${DAY.stars.filter(id => ST.done[id]).length} of ${DAY.stars.length}`)),
        h("tr", {}, h("th", {}, "Questions answered"), h("td", {}, String(ST.answered))),
        h("tr", {}, h("th", {}, "Right in practice"), h("td", {}, String(ST.mixed))),
        h("tr", {}, h("th", {}, "Times Mr. D unlocked you"), h("td", {}, String(unl))),
        h("tr", {}, h("th", {}, "Times you left the page"), h("td", {}, String(KEY ? 0 : LessonLock.stats().total))))));
  }
  function record() {
    if (KEY || !ST.items.length) return;
    try { MrD.profile.record({ course: "stats", lesson: DAY.id, title: DAY.title, first: ST.id, period: ST.period, day: MrD.bell.dayKey(), reached: DAY.parts.filter(id => ST.done[id]).length, of: DAY.parts.length, items: ST.items }); } catch (e) { }
  }

  /* ---------- checkpoint lock (3 misses, or "I need Mr. D") ---------- */
  function lockFor(type, reason) { ST.lock = CK.lockInfo(type, reason, ST.tab); if (!KEY) CK.mirrorSet(DAY.id, ST.lock, ST.id); save(); showLock(); }
  function showLock() {
    if (KEY) { ST.lock = null; return; }
    const L = ST.lock, host = $("cpLockHost");
    host.replaceChildren(...CK.lockScreen(L, { head: "Mr. D needs to see you", miss: "Three misses in a row.", help: "You asked for help.", body: "Raise your hand. Mr. D will look at your work with you, then type today's code.", word: "Code:", wrong: "Not the code. Hand up and wait for Mr. D.", go: "Unlock" },
      { pin: "cpPin", go: "cpGo", msg: "cpMsg" }, () => { CK.unlockTrack(ST.cps[L.type]); ST.lock = null; CK.mirrorClear(DAY.id); save(); $("cpLock").hidden = true; show(); }));
    $("cpLock").hidden = false; setTimeout(() => { const p = $("cpPin"); if (p) p.focus(); }, 0);
  }

  /* ---------- #key: the key desk ---------- */
  let deskEl = null;
  function keyDesk() {
    if (deskEl) { app.append(deskEl); return; }
    const tbl = (head, rows) => h("table", {}, h("tr", {}, ...head.map(x => h("th", {}, x))), ...rows.map(r => h("tr", {}, ...r.map(c => h("td", {}, String(c))))));
    const samples = [];
    DAY.parts.filter(id => TYPE[id]).forEach(id => [1, 2, 3].forEach(b => { for (let i = 0; i < 2; i++) { const q = TYPE[id].make(b); samples.push([TYPE[id].title, b, q.text, String(q.answer) + (TYPE[id].unit || "")]); } }));
    DAY.stars.filter(id => TYPE[id]).forEach(id => { for (let i = 0; i < 3; i++) { const q = TYPE[id].make(3); samples.push(["★ " + TYPE[id].title, "star", q.text, String(q.answer) + (TYPE[id].unit || "")]); } });
    deskEl = h("details", { class: "card kt", id: "keydesk" }, h("summary", {}, h("b", {}, "Teacher key: timing, unlock code, bands, sample problems")),
      h("h3", {}, "About how long"), tbl(["Tab", "Typical", "What"], DAY.timing),
      h("p", {}, h("b", {}, "Unlock any locked student: "), MrD.codes.override(), " (also on the teacher bar)"),
      h("h3", {}, "Bands (hidden from students)"), tbl(["Band", "What changes"], DAY.bands),
      h("h3", {}, "Sample problems"), tbl(["Tab", "Band", "Question", "Answer"], samples));
    app.append(deskEl);
  }

  /* ---------- starting, and locked mode (shared/lock.js) ---------- */
  const lockWanted = () => !KEY && !!ST.id && NOLOCK !== LessonLock.offCode() && !!clk().lockOn;
  function go() { ST.started = true; save(); $("lockres").hidden = true; show(); }
  function startCard() {
    chips(); app.replaceChildren();
    const idHost = h("div"), msg = h("p", { class: "pesMsg no" });
    const btn = h("button", { class: "btn big", id: "bBegin", disabled: "" }, ST.started ? "Continue →" : "Begin →");
    app.append(h("div", { class: "card", id: "start" }, h("h2", {}, DAY.title),
      h("p", {}, DAY.intro + " Each part needs three right in a row. A miss gives you a hint and a fresh question. Three misses in a row, and Mr. D comes to check your work."),
      clk().lockOn && NOLOCK !== LessonLock.offCode() ? h("p", {}, h("b", {}, "This runs full screen. Leaving it is counted.")) : null,
      idHost, btn, msg));
    const ask = MrD.ids.ask(idHost, { id: ST.id, period: ST.period, onChange: (i) => { btn.disabled = !i.valid; msg.textContent = ""; } });
    btn.onclick = () => {
      const info = ask.get(); if (!info.valid) return; ST.id = info.id; ST.period = info.period; MrD.ids.setMe(ST.id, ST.period);
      if (!lockWanted()) return go();
      LessonLock.enter(ST.id).then(ok => { if (!ok) { msg.textContent = "Full screen did not start. This needs Chrome on your Chromebook. Tell Mr. D."; return; } lockArmed = true; go(); });
    };
  }
  function lockResumeCard() {
    $("lockres").hidden = false;
    $("lockresTxt").textContent = "You closed the practice page. That is lock number " + LessonLock.lockNo() + ". Mr. D needs to see you and give you a code.";
    const inp = $("lockCode"); inp.focus();
    const tryIt = () => LessonLock.resume(inp.value).then(r => { if (r === "ok") { lockArmed = true; $("lockMsg").textContent = ""; go(); } else $("lockMsg").textContent = r === "nofs" ? "Full screen did not start. Click again." : "Not the code. Hand up and wait for Mr. D."; });
    $("bUnlock").onclick = tryIt; inp.onkeydown = (e) => { if (e.key === "Enter") tryIt(); };
  }

  window.__cc = { tabs: TABS, st: () => ST, show: () => show() };
  if (KEY) {
    ST = fresh(); ST.started = true;
    MrD.teacherBar($("tb"), { course: "stats", lessonId: DAY.id, gates: [], teacher: "../teacher.html", root: "../../" });
    return show();
  }
  LessonLock.init({ id: DAY.id, root: app, onChange: () => chips() });
  ST = Object.assign(fresh(), load() || {});
  const me = MrD.ids.me(); if (me && !ST.id) { ST.id = me.id; ST.period = me.period; }
  const m = CK.mirrorGet(DAY.id); if (m && !ST.lock) ST.lock = m;
  setInterval(() => { if (lockArmed && !clk().lockOn) { lockArmed = false; LessonLock.finish(); } if (ST.started && !(document.activeElement && document.activeElement.matches("input"))) chips(); }, 2000);
  if (NOLOCK !== LessonLock.offCode() && clk().lockOn && LessonLock.pending()) { lockResumeCard(); return; }
  if (ST.ended) return showFinal();
  startCard();   // also after a reload: a fresh Begin click is needed for full screen, and saved progress is kept
}
