/* MrD.live: lets a lesson report where each student is, so the teacher can watch the class on teacher/index.html.

   This shows progress on the lesson page only: step, level, how many questions, misses, the question on screen,
   and how many times the student left. It never sees the laptop, other tabs, or anything outside this page.
   It sends nothing unless MrD.config.liveUrl is set (shared/config.js), and nothing in #key view.

   A lesson calls once after the student enters a name:
     MrD.live.attach({ course:"physics", lessonId:"newtons-first-law", who:function(){return {first:"Sam", period:"3"}},
                       snap:function(){ return { step:"Investigate", stepIdx:3, stepCount:9, band:2, answered:14, misses:3,
                                                prompt:"A puck slides...", exits:0, secs:812 }; } });
   Needs config.js, bell.js. */
(function () {
  "use strict";
  var MrD = (window.MrD = window.MrD || {});
  var timer = 0, last = "", cfgNow = null;

  function clip(s, n) { s = String(s == null ? "" : s).replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  function send() {
    var url = MrD.config && MrD.config.liveUrl;
    if (!url || !cfgNow || MrD.isKey && MrD.isKey()) return;
    if (document.visibilityState !== "visible" && !cfgNow.sendHidden) return;
    var w = cfgNow.who() || {}, s = cfgNow.snap() || {};
    if (!w.first) return;
    var body = {
      course: cfgNow.course, lesson: cfgNow.lessonId, day: MrD.bell.dayKey(),
      first: clip(w.first, 24), period: clip(w.period, 6),
      step: clip(s.step, 30), stepIdx: s.stepIdx | 0, stepCount: s.stepCount | 0, band: s.band == null ? null : +s.band,
      answered: s.answered | 0, misses: s.misses | 0, prompt: clip(s.prompt, 160), exits: s.exits | 0, secs: s.secs | 0,
      stuck: !!s.stuck, done: !!s.done
    };
    var j = JSON.stringify(body);
    try { fetch(url.replace(/\/$/, "") + "/beat", { method: "POST", headers: { "content-type": "application/json" }, body: j, keepalive: true, mode: "cors" }).catch(function () {}); } catch (e) {}
    last = j;
  }

  MrD.live = {
    attach: function (o) {
      cfgNow = o; clearInterval(timer);
      if (!(MrD.config && MrD.config.liveUrl)) return;
      send(); timer = setInterval(send, 10000);
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") send(); });
    },
    nudge: function () { if (cfgNow) send(); },
    stop: function () { clearInterval(timer); cfgNow = null; }
  };
})();
