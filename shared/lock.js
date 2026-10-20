/* LessonLock: keeps a student's lesson in fullscreen and makes leaving it visible and costly.

   What a web page can and cannot do. It can ask for fullscreen, hold the Esc key (a long press still exits),
   and notice when fullscreen ends, the tab is hidden, the window loses focus, or the page was closed and
   reopened. It cannot stop a Chromebook from opening a tab or closing the window. So the lock works by
   consequence instead of force:
     1. The moment the student leaves, the lesson is covered and the clock for "time away" starts.
     2. Exit 1 gets a warning and a short wait. Exit 2 and later lock the screen until the teacher gives a code.
     3. Every exit is counted on the stamp the student shows the teacher.
     4. Closing the page counts as an exit. Reopening it asks for a code, then restarts the part the student was on.
   The unlock code is per student and per lock number, so one student cannot pass it to a friend.
   Real enforcement belongs to the school's Chromebook management. This is the in-page layer.

   Shared by every class. Lives in /shared so physics and calculus can opt in with the same few lines.
   Needs bell.js and codes.js first. The code day rolls over at 7:00 AM (see bell.js).
   Teacher side: MrD.codes.override() is one code per day that unlocks ANY locked student. It is on every teacher bar.

   Use:  LessonLock.init({id, root, onChange})  once;  LessonLock.enter(name) from the Start click;
         LessonLock.save(part, between, snapshot) at each part;  LessonLock.finish() at the end. */
(function () {
  "use strict";
  var cfg = { id: "lesson", lockAt: 2, waitSec: 8, graceMs: 1500, root: null, onChange: null };
  var S = null, armed = false, overlay = null, away0 = 0, countdown = 0, beat = 0, listening = false, leaving = false;

  var day = function () { return MrD.bell.dayKey(); };
  var norm = function (s) { return MrD.codes.norm(s); };
  /* tag is "lock<n>" for a student's n-th lock, "off" for the #nolock link. */
  var code = function (name, tag) {
    if (tag === "off") return MrD.codes.lockOff();
    return MrD.codes.lock(cfg.id, name, String(tag).replace(/^lock/, ""));
  };
  var overrideOK = function (v) { return String(v).trim() === MrD.codes.override(); };
  var key = function () { return "lock:" + cfg.id + ":" + day(); };
  var load = function () { try { return JSON.parse(localStorage.getItem(key())); } catch (e) { return null; } };
  var store = function () { try { if (S) localStorage.setItem(key(), JSON.stringify(S)); } catch (e) { } };
  var total = function () { return S ? S.exits + S.closes : 0; };
  var stats = function () {
    var a = S ? S.awayMs + (overlay ? Date.now() - away0 : 0) : 0;
    return { exits: S ? S.exits : 0, closes: S ? S.closes : 0, total: total(), awaySec: Math.round(a / 1000), locked: !!overlay };
  };
  var emit = function () { if (cfg.onChange) cfg.onChange(stats()); };

  function el(tag, attrs) {
    var e = document.createElement(tag), k, i, c;
    for (k in (attrs || {})) { if (k === "class") e.className = attrs[k]; else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
    for (i = 2; i < arguments.length; i++) { c = arguments[i]; if (c != null) e.append(c.nodeType ? c : document.createTextNode(c)); }
    return e;
  }

  function enterFs() { // must run inside a click handler
    var d = document.documentElement;
    if (!d.requestFullscreen) return Promise.resolve(false);
    var p;
    try { p = d.requestFullscreen({ navigationUI: "hide" }); } catch (e) { return Promise.resolve(false); }
    return Promise.resolve(p).then(function () {
      try { if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(["Escape"]).catch(function () { }); } catch (e) { }
      return true;
    }, function () { return false; });
  }

  function startBeat() { clearInterval(beat); beat = setInterval(function () { if (S) { S.seen = Date.now(); store(); } }, 5000); }

  /* Fullscreen ends and the tab hides when a page is closed too. The short delay lets a closing page die before it
     counts, so closing is counted once, on reopen, and not twice. */
  var waiting = 0;
  function violation() {
    if (!armed || overlay || leaving || waiting) return;
    waiting = setTimeout(function () {
      waiting = 0;
      if (!armed || overlay || leaving) return;
      S.exits++; away0 = Date.now(); store(); showOverlay(); emit();
    }, 60);
  }

  function closeOverlay() {
    clearInterval(countdown);
    if (overlay) { overlay.remove(); overlay = null; }
    if (cfg.root) cfg.root.inert = false;
    store(); emit();
  }

  function showOverlay() {
    var n = total(), locked = n >= cfg.lockAt, msg = el("div", { class: "ll-msg", "aria-live": "polite" });
    var back = function () {
      enterFs().then(function (ok) {
        if (!ok) { msg.textContent = "Fullscreen did not start. Click again."; return; }
        S.awayMs += Date.now() - away0; closeOverlay();
      });
    };
    var card = el("div", { class: "ll-card", role: "alertdialog", "aria-modal": "true" });
    if (!locked) {
      var btn = el("button", { class: "btn big", disabled: "", onclick: back }, "Wait…"), left = cfg.waitSec;
      card.append(el("h2", {}, "You left the lesson."),
        el("p", {}, "That is exit " + n + ". It is recorded on your stamp for Mr. D. The next exit locks your screen until Mr. D gives you a code."),
        el("div", { class: "ll-row" }, btn), msg);
      var tick = function () { if (left <= 0) { btn.disabled = false; btn.removeAttribute("disabled"); btn.textContent = "Go back to the lesson"; clearInterval(countdown); } else { btn.textContent = "Wait " + left + "…"; left--; } };
      tick(); countdown = setInterval(tick, 1000);
    } else {
      var inp = el("input", { type: "text", inputmode: "numeric", maxlength: "4", autocomplete: "off", "aria-label": "Unlock code from Mr. D", class: "ll-code" });
      var go = el("button", { class: "btn big", onclick: function () {
        if (inp.value.trim() === code(S.name, "lock" + n) || overrideOK(inp.value)) back(); else msg.textContent = "Not the code. Hand up and wait for Mr. D.";
      } }, "Unlock");
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go.click(); });
      card.append(el("h2", {}, "🔒 Locked. Hand up, eyes forward."),
        el("p", {}, "That is exit " + n + ". Your lesson is paused. Mr. D needs to see you and give you a code."),
        el("p", {}, el("b", {}, "Name: "), S.name, "   ", el("b", {}, "Lock number: "), String(n)),
        el("div", { class: "ll-row" }, inp, go), msg);
    }
    overlay = el("div", { class: "ll-ov" }, card);
    document.body.append(overlay);
    if (cfg.root) cfg.root.inert = true;
    var f = card.querySelector("input"); if (f) f.focus();
  }

  function listen() {
    if (listening) return; listening = true;
    window.addEventListener("pagehide", function () { leaving = true; });
    window.addEventListener("pageshow", function () { leaving = false; });
    document.addEventListener("fullscreenchange", function () { if (armed && !document.fullscreenElement) violation(); });
    document.addEventListener("visibilitychange", function () { if (armed && document.hidden) violation(); });
    window.addEventListener("blur", function () {
      setTimeout(function () { if (armed && !overlay && !document.hasFocus()) violation(); }, cfg.graceMs);
    });
  }

  var css = ".ll-ov{position:fixed;inset:0;z-index:2147483000;background:var(--bg,#f5f3ee);display:flex;align-items:center;justify-content:center;padding:16px}" +
    ".ll-card{background:var(--panel,#fff);color:var(--ink,#1c2530);border:3px solid var(--hot,#b83b24);border-radius:14px;max-width:520px;width:100%;padding:22px;text-align:center}" +
    ".ll-card h2{font-size:1.5rem}.ll-row{display:flex;gap:8px;justify-content:center;margin:14px 0}" +
    ".ll-code{width:130px;font-size:1.5rem;text-align:center}.ll-msg{min-height:1.4em;color:var(--bad,#9c2f1f)}";
  var st = document.createElement("style"); st.textContent = css; document.head.append(st);

  window.LessonLock = {
    cfg: cfg,
    init: function (o) { for (var k in o) cfg[k] = o[k]; },
    /* Start of a fresh lesson. keep:true carries the exit counts forward (the challenge tier after the core). */
    enter: function (name, keep) {
      var p = enterFs();
      return p.then(function (ok) {
        if (!ok) return false;
        if (keep && S) { S.done = false; S.seen = Date.now(); }
        else S = { name: name, exits: 0, closes: 0, awayMs: 0, part: 0, between: false, snap: null, seen: Date.now(), done: false, counted: false };
        armed = true; listen(); store(); startBeat(); emit();
        return true;
      });
    },
    /* A record from today that was never finished means the page was closed. Counts as one exit, once. */
    pending: function () {
      var r = load();
      if (!r || r.done) return null;
      if (!r.counted) { r.closes++; r.awayMs += Math.max(0, Date.now() - (r.seen || Date.now())); r.counted = true; S = r; store(); }
      S = r; return r;
    },
    lockNo: function () { return total(); },
    resume: function (codeIn) {
      if (!S) return Promise.resolve("none");
      if (String(codeIn).trim() !== code(S.name, "lock" + total()) && !overrideOK(codeIn)) return Promise.resolve("wrong");
      return enterFs().then(function (ok) {
        if (!ok) return "nofs";
        S.counted = false; armed = true; listen(); store(); startBeat(); emit();
        return "ok";
      });
    },
    save: function (part, between, snap) { if (S) { S.part = part; S.between = !!between; S.snap = snap; S.seen = Date.now(); store(); } },
    finish: function () {
      armed = false; clearInterval(beat);
      if (S) { S.done = true; store(); }
      closeOverlay();
      try { if (document.fullscreenElement) document.exitFullscreen(); if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock(); } catch (e) { }
      emit();
    },
    stats: stats,
    unlockCode: function (name, n) { return code(name, "lock" + n); },
    overrideCode: function () { return MrD.codes.override(); },
    offCode: function () { return code("", "off"); }
  };
})();
