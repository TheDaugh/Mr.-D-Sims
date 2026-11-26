/* Spring sandbox: the checkpoint questions, with no drawing. Used by spring-hang.html and tests/unit/spring-hang.test.js.

   Same rule as every sandbox (shared/virtual-lab/checkpoint.js): 3 right in a row, a miss resets the streak and shows a hint, the next
   question is freshly generated from the student ID, 3 misses lock the screen until today's unlock code. Every answer is a typed number.

     cp1  How hard does it pull?   k, the natural length and the stretched length (cm): type the spring force in newtons
     cp2  Find k                   a mystery spring (k hidden): hang masses, read the stretch on the ruler, type k in N/m
     cp3  Predict the stretch      k and a hanging mass at rest: type the stretch in metres
   Generated values stay away from the test's springs (50, 200 and 400 N/m) and every stretch stays inside the elastic limit. */
(function (root) {
  "use strict";
  var M = root.SpringModel || require("./spring-hang-model.js");
  var NAMES = { cp1: "How hard does it pull?", cp2: "Find k", cp3: "Predict the stretch" };
  var TYPES = ["cp1", "cp2", "cp3"];
  var TOL = 0.03, K_TOL = 0.05, AVOID = [50, 200, 400];

  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  var near = function (x, want, tol) { return Math.abs(x - want) <= Math.max(Math.abs(want) * tol, 1e-9); };
  function pickK(r, lo, hi) { for (;;) { var k = lo + 5 * Math.floor(r() * ((hi - lo) / 5 + 1)); if (AVOID.indexOf(k) < 0) return k; } }

  function gen(type, who, n) {
    var r = rng(hash(who + ":" + type + ":" + n));
    if (type === "cp1") {
      var k = pickK(r, 20, 300), L0 = 10 + Math.floor(r() * 21), x = 2 + Math.floor(r() * 19);      // cm
      return { type: type, n: n, k: k, L0: L0, L: L0 + x, kind: "number", unit: "N", label: "Spring force in newtons", answer: k * x / 100, tol: TOL,
               prompt: "A spring with k = " + k + " N/m is " + L0 + " cm long when nothing hangs on it. It is stretched until it is " + (L0 + x) + " cm long. How hard does it pull?" };
    }
    if (type === "cp2") {
      return { type: type, n: n, mystery: { k: pickK(r, 15, 300) }, kind: "number", unit: "N/m", label: "k in N/m", answer: 0, tol: K_TOL,
               prompt: "Press Load the mystery spring. Its k is hidden. Hang masses on it, read the stretch on the ruler once it settles, and find k in N/m. More than one mass gives you a better answer." };
    }
    for (var i = 0; i < 200; i++) {
      var k3 = pickK(r, 20, 300), m = Math.round((0.1 + r() * 1.9) * 20) / 20, xe = m * 9.8 / k3;
      if (xe >= 0.02 && xe <= 0.40) return { type: type, n: n, k: k3, m: m, kind: "number", unit: "m", label: "Stretch in metres", answer: xe, tol: TOL,
               prompt: "A " + m.toFixed(2) + " kg mass hangs at rest on a spring with k = " + k3 + " N/m. How far is the spring stretched, in metres? Use g = 9.8 m/s²." };
    }
    return { type: type, n: n, k: 100, m: 0.5, kind: "number", unit: "m", label: "Stretch in metres", answer: 0.049, tol: TOL, prompt: "A 0.50 kg mass hangs at rest on a spring with k = 100 N/m. How far is the spring stretched, in metres? Use g = 9.8 m/s²." };
  }
  function answerOf(q) { return q.type === "cp2" ? q.mystery.k : q.answer; }

  function grade(q, a) {
    var x = Number(a), want = answerOf(q);
    if (a === "" || a === null || a === undefined || !isFinite(x)) return { ok: false, code: "EMPTY", hint: "Type a number first." };
    if (near(x, want, q.tol)) return { ok: true, code: "OK", hint: "" };
    if (q.type === "cp1") {
      if (near(x, q.k * q.L / 100, q.tol)) return { ok: false, code: "TOTAL", hint: "x is how far the spring is stretched past its natural length, not its whole length." };
      if (near(x, want * 100, q.tol)) return { ok: false, code: "CM", hint: "k is in newtons per metre, so the stretch has to be in metres too." };
      return { ok: false, code: "OFF", hint: "Find the stretch first (stretched length minus natural length), in metres. Then F = k x." };
    }
    if (q.type === "cp2") {
      if (near(x, want / 9.8, q.tol)) return { ok: false, code: "MASS", hint: "k is force ÷ stretch. The force on the spring is the weight, m g, not the mass." };
      if (near(x, want / 100, q.tol)) return { ok: false, code: "CM", hint: "Read the stretch in metres, not centimetres, before you divide." };
      if (x > 0 && near(1 / x, want, 0.08)) return { ok: false, code: "FLIP", hint: "k is force ÷ stretch, newtons per metre. Check which one you divided by." };
      return { ok: false, code: "READ", hint: "Load the mystery spring again. Lower a mass gently, read the stretch once it settles, then k = m g ÷ x. Try a second mass and check." };
    }
    if (near(x, q.m / q.k, q.tol)) return { ok: false, code: "NOG", hint: "The spring holds up the weight, m g, not the mass. kx = m g." };
    if (near(x, want * 100, q.tol)) return { ok: false, code: "CM", hint: "That looks like centimetres. The answer is asked for in metres." };
    if (x > 0 && near(x, q.k / (q.m * 9.8), q.tol)) return { ok: false, code: "FLIP", hint: "kx = m g, so x = m g ÷ k. Check which one is on top." };
    return { ok: false, code: "OFF", hint: "At rest the spring force equals the weight: k x = m g. Solve for x." };
  }

  var api = { NAMES: NAMES, TYPES: TYPES, TOL: TOL, K_TOL: K_TOL, AVOID: AVOID, gen: gen, grade: grade, answerOf: answerOf, hash: hash };
  root.SpringCheckpoints = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
