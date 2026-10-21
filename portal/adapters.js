/* Portal adapters: turn the scores the lessons already produce into the one record format the review portal reads
   ( see shared/profile.js ).  Each adapter returns { course, lesson, title, first, period, day, reached, of, items:[{skill,title,band,firstTry,ok}] }.

     PortalAdapters.physicsReport(code, LE, NFL, N2L)   a physics report code ("NEW~v2~Sam~3~...", either lesson)
     PortalAdapters.calcHandIn(name, period, day, code, PR2)   a calculus hand-in code ("PR2-...")
     PortalAdapters.vlabRecord(report, period)     one student's report from the virtual lab (buildReport output)
     PortalAdapters.bundle(records)                the JSON text the portal imports

   Lessons also save a fuller record on the student's own device. These adapters are for when only the code or the report
   reached you (a code pasted in Classroom, a lab record file). They carry what the code carries, no more. */
(function (root) {
  "use strict";
  var A = {};
  function pad(n) { return String(n).padStart(2, "0"); }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function it(skill, title, band, first, ok) { return { skill: skill, title: title, band: band == null ? null : band, firstTry: !!first, ok: ok == null ? !!first : !!ok }; }

  /* Physics lessons that write a report code. Both start with "NEW", so the lesson is found by trying each id: the checksum includes it.
     PortalAdapters.physicsReport(code, LE, NFL, N2L)  N2L is optional. */
  function physLessons(NFL, N2L) {
    var a = [{ id: "newtons-first-law", title: "Newton’s First Law", lib: NFL }];
    if (N2L) a.push({ id: "newtons-second-law", title: "Newton’s Second Law", lib: N2L });
    return a;
  }
  A.physicsLesson = function (code, LE, NFL, N2L) {
    var L = physLessons(NFL, N2L);
    for (var i = 0; i < L.length; i++) { var r = LE.decodeReport(L[i].id, code); if (r && r.ok && r.fields.length >= 13) return { def: L[i], r: r }; }
    return null;
  };
  A.physicsReport = function (code, LE, NFL, N2L) {
    var hit = A.physicsLesson(code, LE, NFL, N2L);
    if (!hit) return null;
    var f = hit.r.fields, items = [], preds = f[7].split(""), chk = f[9].split("-"), bands = f[4].split("-"), miss = f[5].split("-");
    preds.forEach(function (p, i) { if (p !== "-") items.push(it("predict-" + (i + 1), "Prediction " + (i + 1), +f[3] || 2, p === "A")); });
    if (chk[0] !== undefined) items.push(it("check-c1", "Final check 1", 2, chk[0] === "1"));
    if (chk[1] !== undefined) items.push(it("check-c2", "Final check 2", 2, chk[1] === "1"));
    hit.def.lib.skills.forEach(function (sk, i) { if (bands[i] !== undefined && bands[i] !== "") items.push(it(sk.id, sk.title, +bands[i], +miss[i] === 0)); });
    var more = (f[15] || "").split("-"), n = +more[0] || 0, clean = +more[1] || 0;
    for (var k = 0; k < n; k++) items.push(it("practice", "Extra practice", +f[3] || 2, k < clean));
    return { course: "physics", lesson: hit.def.id, title: hit.def.title, first: f[1], period: f[2], day: f[12], reached: +f[13] || 0, of: 9, items: items, source: "report code" };
  };

  A.calcHandIn = function (name, period, day, code, PR2) {
    var d = PR2.decodeHandIn(name, code);
    if (!d.ok) return { error: d.why };
    var n = d.nums, items = [];
    PR2.READY.forEach(function (q, i) { var miss = !!(n[3] & (1 << i)); items.push(it("calc.warmup." + (q.id || i), q.skill, 1, !miss)); });
    items.push(it("calc.product-rule.idea", "Product rule: the idea", 4, !!n[5]));
    var rest = Math.max(0, (n[4] || 0) - (n[5] ? 1 : 0)); for (var k = 0; k < 3; k++) items.push(it("calc.product-rule.mastery", "Product rule: check", 4, k < rest));
    var tot = n[12] || 0, clean = n[11] || 0; for (var j = 0; j < tot; j++) items.push(it("calc.product-rule", "Product rule", n[2] || 2, j < clean));
    return { course: "calc", lesson: "product-rule-v2", title: "2.7 The Product Rule", first: name, period: period, day: day, reached: n[16] != null ? n[16] : 9, of: 9, items: items, source: "hand-in code" };
  };

  A.vlabRecord = function (r, period) {
    var items = [];
    (r.setup || []).forEach(function (s) { if (s.ok !== null && s.ok !== undefined) items.push(it("chem.lab-safety", s.label, null, s.ok)); });
    (r.tests || []).forEach(function (t) { items.push(it("chem.lab-procedure", t.label, null, t.done)); });
    ((r.grade && r.grade.cells) || []).forEach(function (c) { items.push(it(c.test === "id" ? "chem.identify-unknowns" : "chem.lab-data", c.unknown + ": " + c.test, null, c.ok)); });
    var p = r.prelab; if (p && p.total) for (var i = 0; i < p.total; i++) items.push(it("chem.prelab", "Pre-lab", null, i < p.correct));
    var day = r.started ? ymd(new Date(r.started)) : ymd(new Date());
    return { course: "chem", lesson: "virtual-lab-unknown-solids", title: "Virtual Lab: Unknown White Solids", first: r.student, period: period || "", day: day, reached: r.submitted ? 1 : 0, of: 1, items: items, source: "virtual lab report" };
  };

  A.bundle = function (records) { return JSON.stringify({ app: "mrd-profile", version: 1, exported: new Date().toISOString(), records: records }, null, 1); };

  root.PortalAdapters = A;
  if (typeof module !== "undefined" && module.exports) module.exports = A;
})(typeof window !== "undefined" ? window : globalThis);
