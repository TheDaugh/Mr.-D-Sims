/* MrD.codes: every daily code, computed in one place so the student page, the teacher bar and the
   teacher dashboard can never disagree.  Needs bell.js first (the code day rolls over at 7:00 AM).

   gate(lessonId, key)       THE huddle code for today. One code for every class, course, lesson and huddle,
                             so students never have to carry or compare codes. The arguments are kept so every
                             lesson's existing call still works; they no longer change the result.
   override()                one code per day that unlocks ANY locked student  (shown on every teacher bar)
   lock(lessonId, name, n)   the code for one student's n-th lock               (works for that student only)
   lockOff()                 the code in a #nolock=<code> link
   stamp(lessonId, name, period)   4-digit completion stamp

   These deter. A student who reads the script can work them out. They keep a class together at a huddle. */
(function () {
  "use strict";
  var MrD = (window.MrD = window.MrD || {});

  function fnv(s) {
    var x = 2166136261;
    for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
    return x >>> 0;
  }
  function four(s) { return String(1000 + fnv(s) % 9000); }
  function norm(s) { return String(s == null ? "" : s).toLowerCase().replace(/\s+/g, " ").trim(); }
  function day(d) { return MrD.bell.dayKey(d); }

  MrD.codes = {
    fnv: fnv, norm: norm, day: day,
    huddle: function (d) { return four("huddle|" + day(d)); },
    gate: function (lessonId, key, d) { return four("huddle|" + day(d)); },
    /* v3 lessons (pacing.clock = "v3") have two codes a day: huddle 1 is the same code as huddle(), huddle 2 is its own. Legacy gate() is unchanged. */
    huddle2: function (d) { return four("huddle2|" + day(d)); },
    gateV3: function (lessonId, key, d) { return key === "h2" ? four("huddle2|" + day(d)) : four("huddle|" + day(d)); },
    override: function (d) { return four("override|" + day(d)); },
    lock: function (lessonId, name, n, d) { return four(lessonId + "|" + norm(name) + "|lock" + n + "|" + day(d)); },
    lockOff: function (d) { return four("|off|" + day(d)); },
    stamp: function (lessonId, name, period, d) { return four(lessonId + "|stamp|" + norm(name) + "|" + norm(period) + "|" + day(d)); }
  };
})();
