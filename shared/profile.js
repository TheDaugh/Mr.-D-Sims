/* MrD.profile: keeps each student's scores on their own device, in a form the review portal can read.

   A lesson calls MrD.profile.record(rec) once, when the student reaches their stamp:
     { course:"physics", lesson:"newtons-first-law", title:"Newton's First Law", first:"Sam", period:"3", day:"2026-10-19",
       reached:7, of:9,
       items:[ { skill:"S1", title:"Balanced forces", band:2, firstTry:true, ok:true }, ... ] }
   A skill is the smallest thing a lesson measures. portal/standards.json says which standard each skill counts toward,
   so changing a standard never means touching a lesson.

   Nothing leaves the device unless the student (or you) exports the JSON file.
     MrD.profile.all()           every saved record
     MrD.profile.record(rec)     save or replace today's record for this lesson
     MrD.profile.exportJSON()    a JSON string  { app, version, exported, records:[...] }
     MrD.profile.importJSON(txt) merge a file; returns how many records were added or replaced
     MrD.profile.clear()         wipe this device's scores */
(function () {
  "use strict";
  var MrD = (window.MrD = window.MrD || {}), KEY = "mrd.profile.v1";

  function read() { try { var v = JSON.parse(localStorage.getItem(KEY)); if (v && Array.isArray(v.records)) return v; } catch (e) { } return { app: "mrd-profile", version: 1, records: [] }; }
  function write(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); return true; } catch (e) { return false; } }
  function id(r) { return [r.course, r.lesson, r.day, String(r.first || "").toLowerCase(), String(r.period || "").toLowerCase()].join("|"); }

  function clean(r) {
    var items = (r.items || []).map(function (x) {
      return { skill: String(x.skill), title: x.title ? String(x.title) : undefined, band: x.band == null ? null : +x.band, firstTry: !!x.firstTry, ok: !!x.ok };
    });
    return { course: String(r.course), lesson: String(r.lesson), title: String(r.title || r.lesson), first: String(r.first || ""), period: String(r.period || ""),
      day: String(r.day), reached: r.reached | 0, of: r.of | 0, items: items, source: r.source || "lesson", saved: Date.now() };
  }

  MrD.profile = {
    all: function () { return read().records; },
    record: function (rec) {
      if (!rec || !rec.items || !rec.items.length) return false;
      if (MrD.isKey && MrD.isKey()) return false;                 // the teacher's own test runs are not scores
      var p = read(), c = clean(rec), k = id(c), i;
      for (i = 0; i < p.records.length; i++) if (id(p.records[i]) === k) { p.records[i] = c; return write(p); }
      p.records.push(c); return write(p);
    },
    exportJSON: function () { var p = read(); return JSON.stringify({ app: "mrd-profile", version: 1, exported: new Date().toISOString(), records: p.records }, null, 1); },
    importJSON: function (txt) {
      var j; try { j = JSON.parse(txt); } catch (e) { throw new Error("That file is not valid JSON."); }
      var recs = Array.isArray(j) ? j : j && j.records;
      if (!Array.isArray(recs)) throw new Error("No scores found in that file.");
      var p = read(), n = 0;
      recs.forEach(function (r) {
        if (!r || !r.course || !r.lesson || !r.day || !Array.isArray(r.items)) return;
        var c = clean(r), k = id(c), i, found = false;
        for (i = 0; i < p.records.length; i++) if (id(p.records[i]) === k) { p.records[i] = c; found = true; break; }
        if (!found) p.records.push(c);
        n++;
      });
      write(p); return n;
    },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) { } },
    key: KEY
  };
})();
