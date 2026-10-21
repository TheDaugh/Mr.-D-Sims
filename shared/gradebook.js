/* MrD.gradebook: turned-in lab records, proficiency-scale scores and student feedback, all kept in THIS browser.
   Nothing is sent anywhere. No AI, no tokens: feedback is the lab's own level descriptors, picked by the level you click.

   WHERE THINGS LIVE
     records   IndexedDB "mrd-gradebook"       the full lab JSON a student turned in (plots and all). Browsers allow hundreds of MB
                                               here, so a class of records fits; localStorage (about 5 MB) would not.
     scores    localStorage "vlab-rubric:..."  one small object per record {claim:2, evidence:3, ...}. Same keys the teacher page
                                               has always used, so scores you already entered are still there.
     names     localStorage "mrd.gradebook.names"   student ID -> the name you typed for it
     slim      localStorage "mrd.gradebook.slim"    feedback loaded from a feedback file (levels only, no student work)

   IDs: a student's ID is whatever they typed in the lab's name box. Matching ignores case and spaces.

   Needs nothing else. Loaded by chemistry/virtual-lab/teacher.html and portal/feedback.html. */
(function () {
  "use strict";
  var MrD = (window.MrD = window.MrD || {});
  var DBN = "mrd-gradebook", STORE = "records", NAMES = "mrd.gradebook.names", SLIM = "mrd.gradebook.slim", RK = "vlab-rubric:";

  /* A level below this counts as "not yet" and sends the student to the revise-and-practice help. 0..3 scale, so 2 = partly there. */
  var SATISFACTORY = 2;

  /* Lab files, relative to chemistry/virtual-lab/. When you build a new lab, add its file here. */
  var LAB_FILES = ["content/labs/01-unknown-solids.json", "content/labs/02-heating-curves.json", "content/labs/03-rutherford-gold-foil.json"];

  function norm(s) { return String(s == null ? "" : s).toLowerCase().replace(/\s+/g, ""); }
  function ls(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function words(t) { return (String(t || "").trim().match(/\S+/g) || []); }

  /* ---------- records (IndexedDB, with an in-memory fallback when the browser blocks it) ---------- */
  var mem = {}, dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res) {
      try {
        var r = indexedDB.open(DBN, 1);
        r.onupgradeneeded = function () { r.result.createObjectStore(STORE, { keyPath: "key" }); };
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { res(null); };
        r.onblocked = function () { res(null); };
      } catch (e) { res(null); }
    });
    return dbp;
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      if (!d) return fn(null);
      return new Promise(function (res, rej) {
        var t = d.transaction(STORE, mode), s = t.objectStore(STORE), out = fn(s);
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
        t.onerror = t.onabort = function () { rej(t.error); };
      });
    });
  }
  function keyOf(rec) { return [rec.lab, rec.student || "(no name)", rec.started].join("|"); }
  function scoreKey(rec) { return RK + rec.lab + ":" + (rec.student || "(no name)") + ":" + rec.started; }

  var GB = (MrD.gradebook = {
    SATISFACTORY: SATISFACTORY, LAB_FILES: LAB_FILES, norm: norm, keyOf: keyOf, scoreKey: scoreKey,

    /* save one turned-in record (replaces the same student+lab+start) */
    put: function (rec, file) {
      var e = { key: keyOf(rec), lab: rec.lab, student: rec.student || "", started: rec.started, file: file || "", savedAt: Date.now(), rec: rec };
      return tx("readwrite", function (s) { if (!s) { mem[e.key] = e; return; } s.put(e); });
    },
    all: function () {
      return tx("readonly", function (s) {
        if (!s) return Object.keys(mem).map(function (k) { return mem[k]; });
        var q = s.getAll(); return q;
      }).then(function (v) { return v || []; });
    },
    remove: function (key) { return tx("readwrite", function (s) { if (!s) { delete mem[key]; return; } s.delete(key); }); },
    clearAll: function () { return tx("readwrite", function (s) { if (!s) { mem = {}; return; } s.clear(); }); },

    /* scores */
    getScores: function (rec) { return ls(scoreKey(rec)) || {}; },
    setScores: function (rec, scores) { return lsSet(scoreKey(rec), scores); },

    /* names typed on the teacher page, by normalized ID */
    names: function () { return ls(NAMES) || {}; },
    nameOf: function (id) { return GB.names()[norm(id)] || ""; },
    setName: function (id, name) { var n = GB.names(); if (String(name).trim()) n[norm(id)] = String(name).trim(); else delete n[norm(id)]; lsSet(NAMES, n); },

    /* ---------- feedback: pure functions, no storage ---------- */

    /* labDef = a lab JSON (needs postlab.rubric); scores = {key: level}. Returns per-criterion text for the student. */
    feedback: function (labDef, scores) {
      var R = (labDef.postlab && labDef.postlab.rubric) || [], crit = [], total = 0, max = 0, need = [], scored = 0;
      R.forEach(function (c) {
        var top = c.levels.length - 1, v = scores && scores[c.key], has = v !== undefined && v !== null && v !== "", lv = has ? +v : null;
        max += top; if (has) { total += lv; scored++; }
        var ok = has ? lv >= SATISFACTORY : null;
        if (has && !ok) need.push(c.name);
        crit.push({ key: c.key, name: c.name, level: lv, top: top, scored: has, ok: ok,
          now: has ? c.levels[lv] : "", next: has && lv < top ? c.levels[lv + 1] : "" });
      });
      return { criteria: crit, total: total, max: max, scored: scored, of: R.length, complete: scored === R.length, need: need, ok: scored === R.length && !need.length };
    },

    /* The text a student reads (also what the Copy button puts on the clipboard). */
    feedbackText: function (labDef, fb) {
      var L = [labDef.title + ": " + fb.total + " of " + fb.max];
      fb.criteria.forEach(function (c) {
        if (!c.scored) { L.push(c.name + ": not scored yet"); return; }
        L.push(c.name + ": level " + c.level + " of " + c.top + ". " + c.now + (c.next ? ". To reach level " + (c.level + 1) + ": " + c.next + "." : "."));
      });
      return L.join("\n");
    },

    /* Cheap automatic checks on the writing. They show PRESENCE, LENGTH and VOCABULARY, which a script can measure.
       They cannot tell if the science is right, so they never set a level: they sit beside the scale to speed up your click. */
    signals: function (labDef, cer) {
      if (!cer) return [];
      var pl = labDef.postlab || {}, min = pl.minWords || {}, bank = (pl.wordBank || []).map(function (w) { return w.toLowerCase(); });
      var claim = [cer.claim, cer.unknown ? "Unknown " + cer.unknown : "", cer.X ? "X is " + cer.X : "", cer.Y ? "Y is " + cer.Y : ""].join(" ");
      var evid = (cer.evidence || []).join(" ") + " " + (cer.note || ""), reas = cer.reasoning || "", all = (claim + " " + evid + " " + reas).toLowerCase();
      var nums = (evid.match(/\d+(\.\d+)?/g) || []).length, hit = bank.filter(function (w) { return all.indexOf(w) >= 0; });
      var out = [];
      out.push("Claim: " + words(cer.claim).length + " words" + (min.claim ? " (needs " + min.claim + ")" : ""));
      out.push("Evidence: " + words(evid).length + " words, " + nums + " number" + (nums === 1 ? "" : "s") + " quoted" + (min.evidence ? " (needs " + min.evidence + " words)" : ""));
      out.push("Reasoning: " + words(reas).length + " words" + (min.reasoning ? " (needs " + min.reasoning + ")" : ""));
      if (bank.length) out.push("Word-bank terms used: " + (hit.length ? hit.join(", ") : "none") + " (" + hit.length + " of " + bank.length + ")");
      return out;
    },

    /* ---------- student-facing entries, built from records + scores ---------- */

    /* One slim entry per scored record. No student writing, no plots: just who, which lab, which levels. */
    slimFromRecords: function (entries) {
      return entries.map(function (e) {
        var sc = GB.getScores(e.rec), keys = Object.keys(sc);
        if (!keys.length) return null;
        return { id: e.student || "", lab: e.lab, started: e.started, levels: sc };   // no name, no work: a student computer needs neither
      }).filter(Boolean);
    },
    slimStored: function () { var v = ls(SLIM); return v && Array.isArray(v.entries) ? v.entries : []; },
    slimExport: function (entries) { return JSON.stringify({ app: "mrd-lab-feedback", version: 1, exported: new Date().toISOString(), entries: entries }, null, 1); },
    /* merge a feedback file into this computer; returns how many entries were added or replaced */
    slimImport: function (txt) {
      var j; try { j = JSON.parse(txt); } catch (e) { throw new Error("That file is not valid JSON."); }
      if (!j || j.app !== "mrd-lab-feedback" || !Array.isArray(j.entries)) throw new Error("That is not a lab feedback file.");
      var cur = GB.slimStored(), n = 0;
      j.entries.forEach(function (e) {
        if (!e || !e.lab || !e.levels) return;
        var k = e.lab + "|" + norm(e.id) + "|" + e.started, i;
        for (i = 0; i < cur.length; i++) if (cur[i].lab + "|" + norm(cur[i].id) + "|" + cur[i].started === k) { cur[i] = e; break; }
        if (i === cur.length) cur.push(e);
        n++;
      });
      lsSet(SLIM, { entries: cur }); return n;
    },
    slimClear: function () { try { localStorage.removeItem(SLIM); } catch (e) { } },

    /* everything a student with this ID can see on this computer: records saved here (with their scores) plus a loaded feedback file */
    forStudent: function (id) {
      var want = norm(id);
      return GB.all().then(function (all) {
        var mine = all.filter(function (e) { return norm(e.student) === want; }), out = [], seen = {};
        GB.slimFromRecords(mine).concat(GB.slimStored().filter(function (e) { return norm(e.id) === want; })).forEach(function (e) {
          var k = e.lab + "|" + e.started; if (seen[k]) return; seen[k] = 1; out.push(e);
        });
        return out.sort(function (a, b) { return (b.started || 0) - (a.started || 0); });
      });
    }
  });
})();
