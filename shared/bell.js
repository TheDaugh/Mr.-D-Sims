/* MrD.bell: the school clock for every guided lesson (physics, chemistry, calculus, statistics).

   One file decides three things, so no lesson has to:
     1. Is a class in session right now, and when does this lesson end?
        Mon to Thu a period is 50 minutes and guided notes end at the 42-minute mark.
        Friday periods are 40 minutes, so there is no 42-minute mark: the lesson runs to the bell.
     2. Are huddle codes required right now?  Weekdays from 7:00 AM until 3:00 PM.
        After 3:00 PM (and before 7:00 AM, weekends) a student finishing notes at home is never stopped for a code.
     3. Which "school day" is it for code purposes?  The day rolls over at 7:00 AM, not midnight,
        so the teacher can read the day's codes from 7:00 AM on.

   The huddle is global: every class, every guided lesson, pulls its students into the huddle tab huddleMin (10) minutes
   after the bell, by the clock and not by how far a student has got. Change CFG.huddleMin to move it everywhere.

   To change a period time, edit SCHEDULE below.  Nothing else needs to change.

   Testing: add  #now=2026-10-20T09:10  (local time) to any lesson address to pretend it is that moment.
   It only works together with #key, so a student cannot use it to dodge a code. */
(function () {
  "use strict";
  var MrD = (window.MrD = window.MrD || {});

  var SCHEDULE = {
    physics: { label: "Physics",   weekday: [["09:00", "09:50"]],                   friday: [["09:00", "09:40"]] },
    chem:    { label: "Chemistry", weekday: [["10:40", "11:30"], ["13:50", "14:40"]], friday: [["09:40", "10:20"], ["14:00", "14:40"]] },
    calc:    { label: "Calculus",  weekday: [["12:10", "13:00"]],                   friday: [["12:40", "13:20"]] },
    /* Stats runs right after calculus and ends where chemistry's second period begins: 1:00-1:50 Mon-Thu, 1:20-2:00 Friday.
       The Friday pair is inferred from the gap between calculus (ends 1:20) and chemistry (starts 2:00). */
    stats:   { label: "Statistics", weekday: [["13:00", "13:50"]],                   friday: [["13:20", "14:00"]] }
  };
  var CFG = { endMinute: 42, huddleMin: 10, earlyOpenMin: 5, gatesFrom: "07:00", gatesUntil: "15:00" };

  function hm(s) { var p = s.split(":"); return +p[0] * 60 + +p[1]; }
  function minutesOf(d) { return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function at(d, mins) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0); x.setMinutes(mins); return x; }

  /* The moment the lesson should believe it is. #now=... works only when #key is also present. */
  function now() {
    var h = String(location.hash || ""), m = /(?:^|[#&])now=([0-9T:\-]+)/.exec(h);
    if (m && /(?:^|[#&])(key|preview)\b/.test(h)) { var d = new Date(m[1]); if (!isNaN(d)) return d; }
    return new Date();
  }

  /* School day for code purposes: rolls over at 7:00 AM local. */
  function dayKey(d) { d = d || now(); return ymd(new Date(d.getTime() - hm(CFG.gatesFrom) * 60000)); }

  function isFriday(d) { return d.getDay() === 5; }
  function isWeekday(d) { return d.getDay() >= 1 && d.getDay() <= 5; }

  function periods(course, d) {
    var c = SCHEDULE[course]; if (!c) return [];
    d = d || now();
    if (!isWeekday(d)) return [];
    var list = isFriday(d) ? c.friday : c.weekday;
    return list.map(function (p, i) {
      var s = at(d, hm(p[0])), e = at(d, hm(p[1]));
      var friday = isFriday(d);
      /* Mon-Thu: notes end at start + 42.  Friday: the bell is the end, so the lesson stays locked all period. */
      var endMark = friday ? e : new Date(s.getTime() + CFG.endMinute * 60000);
      return { course: course, index: i, start: s, end: e, endMark: endMark, friday: friday, lengthMin: Math.round((e - s) / 60000) };
    });
  }

  /* The class period this moment belongs to for a course, or null. Opens a few minutes early so Start works at the bell. */
  function session(course, d) {
    d = d || now();
    var list = periods(course, d), t = d.getTime(), i, p;
    for (i = 0; i < list.length; i++) {
      p = list[i];
      if (t >= p.start.getTime() - CFG.earlyOpenMin * 60000 && t <= p.end.getTime()) return p;
    }
    return null;
  }

  /* Are huddle codes required right now?  Weekdays 7:00 AM to 3:00 PM only. */
  function gatesOn(d) {
    d = d || now();
    if (!isWeekday(d)) return false;
    var m = minutesOf(d);
    return m >= hm(CFG.gatesFrom) && m < hm(CFG.gatesUntil);
  }

  /* One object a lesson can read each second.
       mode      "class" while this class's period is on, otherwise "home"
       canEnd    guided notes may end now: at the end mark in class, always after the bell or at home
       needsEnd  show the "end my guided notes" button: in class from the end mark on, and the rest of the school day after the bell
       gates     huddle codes are required (weekdays 7:00 AM to 3:00 PM)
       lockOn    locked mode applies: only during this class's period, until the end mark Mon-Thu and until the bell on Friday */
  function clock(course, d) {
    d = d || now();
    var s = session(course, d), t = d.getTime();
    var passed = periods(course, d).some(function (p) { return t > p.end.getTime(); });
    var out = { now: d, dayKey: dayKey(d), gates: gatesOn(d), session: s, mode: s ? "class" : "home", friday: isFriday(d), afterBell: !s && passed };
    if (s) {
      out.minutesIn = Math.max(0, (t - s.start.getTime()) / 60000);
      out.msToEnd = s.endMark.getTime() - t;          // negative once the end mark has passed
      out.msToBell = s.end.getTime() - t;
      out.canEnd = t >= s.endMark.getTime();
      out.lockOn = s.friday ? true : t < s.endMark.getTime();   // Mon-Thu until the 42-minute mark; Friday the whole period
      out.endLabel = s.friday ? "the bell" : CFG.endMinute + " minutes";
    } else {
      out.canEnd = true; out.lockOn = false; out.msToEnd = null; out.msToBell = null; out.endLabel = "";
    }
    out.needsEnd = s ? out.canEnd : (out.afterBell && out.gates);
    return out;
  }

  function fmtClock(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    return Math.floor(s / 60) + ":" + pad(s % 60);
  }
  function fmtTime(d) {
    var h = d.getHours(), m = d.getMinutes();
    return ((h + 11) % 12 + 1) + ":" + pad(m) + " " + (h >= 12 ? "PM" : "AM");
  }

  MrD.bell = {
    SCHEDULE: SCHEDULE, CFG: CFG,
    now: now, dayKey: dayKey, periods: periods, session: session, gatesOn: gatesOn, clock: clock,
    isFriday: isFriday, isWeekday: isWeekday, fmtClock: fmtClock, fmtTime: fmtTime
  };
})();
