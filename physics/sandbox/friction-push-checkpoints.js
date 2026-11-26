/* Friction sandbox: the checkpoint questions, with no drawing. Used by friction-push.html and tests/unit/friction-push.test.js.

   Three checkpoint types, each asked with the shared rule (shared/virtual-lab/checkpoint.js): 3 right in a row, a miss resets the streak and
   shows a hint, the next question is freshly generated, 3 misses lock the screen until Mr. D types today's unlock code. Every question is
   generated from a seed (student ID, type, question number), so a retry never shows the same question and a neighbour has a different one.
   Every answer is a typed number, so none can be guessed. The truth always comes from FrictionModel, the same physics the sim runs.

     cp1  How big is friction?   a crate, mu_s, mu_k and a steady push: type the friction force (half the pushes hold, half slide)
     cp2  Read the graph         a mystery crate (mass shown, mu hidden): grow the push, read the graph, type mu_s or mu_k
     cp3  Find the acceleration  a crate, mu_s, mu_k and a steady push: type a (one in three pushes holds, so a = 0)
   Hints name the student's mistake when it is a known one and point at the sandbox. No hint gives the answer. */
(function (root) {
  "use strict";
  var M = root.FrictionModel || require("./friction-push-model.js");
  var NAMES = { cp1: "How big is friction?", cp2: "Read the graph", cp3: "Find the acceleration" };
  var TYPES = ["cp1", "cp2", "cp3"];
  var TOL = 0.03, MU_TOL = 0.03;

  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  var r05 = function (x) { return Math.round(x * 20) / 20; };
  var near = function (x, want, tol) { return Math.abs(x - want) <= Math.max(Math.abs(want) * tol, 0.05); };

  /* a crate with a push that holds (want "rest") or slides (want "slides"), at least 20% from the edge, push a whole number of newtons */
  function crate(r, want) {
    for (var i = 0; i < 400; i++) {
      var m = 4 + Math.floor(r() * 37), mus = 0.25 + 0.05 * Math.floor(r() * 12), muk = Math.max(0.1, r05(mus - 0.1 - 0.05 * Math.floor(r() * 3)));
      var p = { m: m, mus: mus, muk: muk, g: 9.8 }, q = M.forces(p);
      var F = want === "rest" ? Math.round(q.fmax * (0.3 + 0.5 * r())) : Math.round(q.fmax * (1.2 + 0.6 * r()));
      if (F < 5 || F > M.F_MAX) continue;
      if (want === "rest" ? F > 0.8 * q.fmax : F < 1.2 * q.fmax) continue;
      if (want === "rest" && Math.abs(F - q.fk) < 0.15 * q.fk) continue;        // a wrong "mu_k N" answer must not land on the right one
      return { p: p, F: F };
    }
    return want === "rest" ? { p: { m: 10, mus: 0.5, muk: 0.3, g: 9.8 }, F: 20 } : { p: { m: 10, mus: 0.5, muk: 0.3, g: 9.8 }, F: 80 };
  }
  var says = function (c) { return "A " + c.p.m + " kg crate on a flat floor, μs = " + c.p.mus.toFixed(2) + ", μk = " + c.p.muk.toFixed(2) + ", pushed with a steady " + c.F + " N"; };

  function gen(type, who, n) {
    var r = rng(hash(who + ":" + type + ":" + n)), off = hash(who) % 2, c;
    if (type === "cp1") {
      c = crate(r, (n + off) % 2 ? "slides" : "rest");
      return { type: type, n: n, crate: c, kind: "number", unit: "N", label: "Friction in newtons", answer: M.friction(c.p, c.F), tol: TOL,
               prompt: says(c) + ", starting from rest. How big is the friction force on it? Use g = 9.8 m/s². You can set this up in the sandbox to check." };
    }
    if (type === "cp2") {
      var m = 5 + Math.floor(r() * 26), mus = 0.3 + 0.05 * Math.floor(r() * 11), muk = Math.max(0.1, r05(mus - 0.1 - 0.05 * Math.floor(r() * 3)));
      var which = (n + off) % 2 ? "muk" : "mus";
      return { type: type, n: n, mystery: { m: m, mus: mus, muk: muk, g: 9.8 }, which: which, kind: "number", unit: "", label: which === "mus" ? "μs" : "μk",
               answer: which === "mus" ? mus : muk, tol: MU_TOL, abs: true,
               prompt: "Press Load the mystery crate. It is " + m + " kg, and its surface is hidden. Grow the push from zero and read the friction graph. What is " + (which === "mus" ? "μs, the static coefficient" : "μk, the kinetic coefficient") + "? Type it to two decimal places." };
    }
    c = crate(r, n % 3 === (off ? 1 : 2) ? "rest" : "slides");
    return { type: type, n: n, crate: c, kind: "number", unit: "m/s²", label: "Acceleration in m/s²", answer: M.accel(c.p, c.F), tol: TOL,
             prompt: says(c) + ", starting from rest. What is its acceleration? Use g = 9.8 m/s²." };
  }

  /* a: a number (or a string from an input). Returns { ok, code, hint }. */
  function grade(q, a) {
    var x = Number(a);
    if (a === "" || a === null || a === undefined || !isFinite(x)) return { ok: false, code: "EMPTY", hint: "Type a number first." };
    if (q.type === "cp2") {
      var okM = Math.abs(x - q.answer) <= q.tol;
      if (okM) return { ok: true, code: "OK", hint: "" };
      var other = q.which === "mus" ? q.mystery.muk : q.mystery.mus, N = q.mystery.m * 9.8;
      if (x > 1.5) return { ok: false, code: "FORCE", hint: "That looks like a force in newtons, not a coefficient. μ = friction ÷ N, and N = m g = " + N.toFixed(1) + " N for this crate." };
      if (Math.abs(x - other) <= q.tol) return { ok: false, code: "SWAP", hint: q.which === "mus" ? "That is the level after the drop: the sliding friction. μs comes from the top of the climb, just before it breaks loose." : "That is the top of the climb, just before it breaks loose. μk comes from the flat level after the drop, while it slides." };
      return { ok: false, code: "READ", hint: "Load the mystery crate again and grow the push. Read the friction " + (q.which === "mus" ? "at the top of the climb" : "on the flat part after the drop") + ", then divide by N = m g." };
    }
    var ok = near(x, q.answer, q.tol);
    if (ok) return { ok: true, code: "OK", hint: "" };
    var p = q.crate.p, F = q.crate.F, f = M.forces(p), holds = F <= f.fmax;
    if (q.type === "cp1") {
      if (holds && near(x, f.fmax, q.tol)) return { ok: false, code: "LIMIT", hint: "μs N is only the most static friction can give. Is the crate sliding? If it is not, friction matches the push." };
      if (holds && near(x, f.fk, q.tol)) return { ok: false, code: "KIN", hint: "μk is for a crate that slides. Does this push beat μs N? Set it up in the sandbox and look." };
      if (!holds && near(x, F, q.tol)) return { ok: false, code: "MATCH", hint: "Friction matches the push only while the crate holds. Compare the push with μs N. Once it slides, which coefficient do you use?" };
      if (!holds && near(x, f.fmax, q.tol)) return { ok: false, code: "STATIC", hint: "The crate is sliding, so static friction is gone. Which coefficient goes with sliding?" };
      return { ok: false, code: "OFF", hint: "Find N = m g first. Then compare the push with μs N to see whether the crate holds or slides." };
    }
    if (holds) return { ok: false, code: "HOLD", hint: "Compare the push with μs N first. Does the crate move at all?" };
    if (near(x, F / p.m, q.tol)) return { ok: false, code: "NOFRIC", hint: "That is the push alone divided by the mass. Friction also acts while it slides: ΣF = push − friction." };
    if (near(x, (F - f.fmax) / p.m, q.tol)) return { ok: false, code: "MUS", hint: "Once it slides, the friction is μk N, not μs N." };
    return { ok: false, code: "OFF", hint: "Steps: N = m g; compare the push with μs N; if it slides, friction = μk N and a = (push − friction) ÷ m." };
  }

  var api = { NAMES: NAMES, TYPES: TYPES, TOL: TOL, MU_TOL: MU_TOL, gen: gen, grade: grade, hash: hash, crate: crate };
  root.FrictionCheckpoints = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
