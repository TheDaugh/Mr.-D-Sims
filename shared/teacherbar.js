/* MrD.teacherBar: the one teacher bar every lesson shows when its address ends in #key.

   #key is the single teacher switch on every lesson in every class. It shows the real student page, with:
     - every step open and every huddle code skipped (so you can see exactly what students see),
     - the correct answers marked on the page,
     - locked mode off,
     - this bar: today's codes, the unlock-anyone code, a clock simulator, and the teacher page.
   (#preview still works as an old alias for #key.)

   MrD.isKey()                         true when #key (or #preview) is in the address
   MrD.teacherBar(host, opts)          draw the bar into an element
        opts.course   "physics" | "chem" | "calc"
        opts.lessonId id used for the codes
        opts.gates    [{key:"h1", label:"Huddle 1"}, ...]
        opts.teacher  relative path to the course teacher page (from the lesson)
        opts.root     relative path to the repo root, e.g. "../../"
        opts.extra    optional array of DOM nodes (a band picker, a reset button)
   Needs bell.js and codes.js first. */
(function () {
  "use strict";
  var MrD = (window.MrD = window.MrD || {});

  MrD.isKey = function () { return /(?:^|[#&])(key|preview)\b/.test(String(location.hash || "")); };

  var css = ".mrd-tb{position:sticky;top:0;z-index:50;background:#7a1f12;color:#fff;font:600 14px/1.35 system-ui,sans-serif;padding:8px 12px;margin:0 0 12px;display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;border-radius:0 0 8px 8px}" +
    ".mrd-tb b.tag{background:#fff;color:#7a1f12;border-radius:4px;padding:1px 7px;letter-spacing:.04em}" +
    ".mrd-tb .code{font:800 17px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.12em;background:rgba(255,255,255,.16);border-radius:4px;padding:0 7px}" +
    ".mrd-tb .dim{opacity:.85;font-weight:400}.mrd-tb a{color:#fff}.mrd-tb select,.mrd-tb button{font:inherit;color:#1c2530;border-radius:5px;border:0;padding:2px 8px;cursor:pointer}" +
    ".mrd-tb[hidden]{display:none}";
  var st = document.createElement("style"); st.textContent = css; document.head.append(st);

  function e(tag, cls, text) { var x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; }

  /* Seconds from now-simulator choices, using today's date (or the next Mon/Fri when needed). */
  function simDate(course, kind) {
    var d = new Date(), want = kind === "friday" ? 5 : null;
    if (want != null) { while (d.getDay() !== want) d.setDate(d.getDate() + 1); }
    else { while (d.getDay() === 0 || d.getDay() === 6 || d.getDay() === 5) d.setDate(d.getDate() + 1); }   // a Mon-Thu
    var list = MrD.bell.periods(course, d), p = list[0];
    if (!p) return null;
    var t;
    if (kind === "start") t = new Date(p.start.getTime() + 10 * 60000);
    else if (kind === "mark") t = new Date(p.endMark.getTime() + 60000);
    else if (kind === "friday") t = new Date(p.start.getTime() + 10 * 60000);
    else if (kind === "home") t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 15, 30);
    else return null;
    var pad = function (n) { return String(n).padStart(2, "0"); };
    return t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate()) + "T" + pad(t.getHours()) + ":" + pad(t.getMinutes());
  }

  MrD.teacherBar = function (host, o) {
    if (!host) return;
    host.textContent = ""; host.className = "mrd-tb"; host.hidden = false;
    var c = MrD.bell.clock(o.course), root = o.root || "";
    host.append(e("b", "tag", "TEACHER KEY"));

    var mode = c.mode === "class"
      ? (c.friday ? "Friday class: locked to the bell " : "Class in session: notes end " ) + MrD.bell.fmtTime(c.friday ? c.session.end : c.session.endMark)
      : (c.gates ? "School hours, not this class's period" : "Home mode: no huddle codes");
    host.append(e("span", "dim", mode));

    (o.gates || []).forEach(function (g) {
      var w = e("span"); w.append((g.label || g.key) + " "); w.append(e("span", "code", MrD.codes.gate(o.lessonId, g.key))); host.append(w);
    });
    var u = e("span"); u.append("Unlock any locked student "); u.append(e("span", "code", MrD.codes.override())); host.append(u);
    if (!c.gates) host.append(e("span", "dim", "(codes are not asked for right now)"));

    var sel = e("select"); sel.setAttribute("aria-label", "Pretend it is");
    [["", "Clock: real time"], ["start", "Pretend: 10 min into class"], ["mark", "Pretend: just past the end mark"], ["friday", "Pretend: Friday class"], ["home", "Pretend: after 3 PM"]].forEach(function (p) {
      var op = e("option", null, p[1]); op.value = p[0]; sel.append(op);
    });
    var cur = /now=([0-9T:\-]+)/.exec(location.hash); if (cur) sel.options[0].textContent = "Clock: pretending " + cur[1].replace("T", " ");
    sel.onchange = function () {
      var h = location.hash.replace(/[#&]?now=[0-9T:\-]+/g, "").replace(/^#?&?/, "");
      if (!/(^|&)key\b/.test(h)) h = (h ? h + "&" : "") + "key";
      if (sel.value) { var v = simDate(o.course, sel.value); if (v) h += "&now=" + v; }
      location.hash = "#" + h; location.reload();
    };
    host.append(sel);

    if (o.teacher) { var a = e("a", null, "Teacher page"); a.href = o.teacher; host.append(a); }
    var all = e("a", null, "All classes: codes + live view"); all.href = root + "teacher/index.html"; host.append(all);
    (o.extra || []).forEach(function (n) { host.append(n); });
  };
})();
