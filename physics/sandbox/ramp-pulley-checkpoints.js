/* Ramp-and-pulley sandbox: the checkpoint questions, with no drawing. Used by ramp-pulley.html and tests/unit/ramp-pulley-checkpoints.test.js.

   Three checkpoint types, each asked with the shared rule (shared/virtual-lab/checkpoint.js): 3 right in a row, a miss resets the streak and shows a hint,
   the next question is freshly generated, 3 misses lock the screen until Mr. D types today's unlock code. Every question is generated from a seed
   (student ID, type, question number), so a retry never shows the same question and a neighbour has a different one. Nothing here is guessable alone:
   a call plus a reason (1 in 12) or a typed angle. The truth always comes from RampModel, the same forces() the sim runs on.

     cp1  Call it              predict stays put / slides up / slides down from the numbers, and say why
     cp2  Find the slip angle  use the sandbox to find the angle where a bare crate just slips; type it (no counterweight)
     cp3  Same ramp, new world  the verdict on Earth is given; say what it is on the Moon, Mars, Jupiter, in an elevator or in the rain, and why
   Hints point at the student's own settings and the force arrows. No hint gives the answer. */
(function (root) {
  "use strict";
  var M = root.RampModel || require("./ramp-pulley-model.js");
  var WORD = { rest: "stays put", up: "slides up the ramp", down: "slides down the ramp" };
  var NAMES = { cp1: "Call it", cp2: "Find the slip angle", cp3: "Same ramp, new world" };
  var TYPES = ["cp1", "cp2", "cp3"];
  var TOL_DEG = 1.5;
  var REASON = {
    up: "The pull up the ramp is bigger than the pull down the ramp plus the most friction can hold.",
    down: "The pull down the ramp is bigger than the pull up the ramp plus the most friction can hold.",
    rest: "The two pulls along the ramp differ by less than the most friction can hold.",
    decoy1: "The heavier of the two masses always wins.",
    g: "Every force in the rig is proportional to g, so the comparison between the forces does not change.",
    wet: "Wet surfaces lower the friction coefficients, so friction can hold less than before.",
    decoy2: "A weaker g makes everything stick more.",
    decoy3: "A bigger g always makes a crate slide."
  };
  var WORLDS = ["moon", "rain", "elevUp", "rain", "mars", "elevDown", "rain", "jupiter"];     // any 3 in a row hold a rain question and a no-change question
  var WORLD_TEXT = { moon: "on the Moon", mars: "on Mars", jupiter: "on Jupiter", rain: "in the rain, with every surface wet", elevUp: "inside an elevator that is speeding up, going up (the whole rig is in the elevator)", elevDown: "inside an elevator that is speeding up, going down (the whole rig is in the elevator)" };
  var WORLD_SET = { moon: { planet: "moon", g: 1.62 }, mars: { planet: "mars", g: 3.71 }, jupiter: { planet: "jupiter", g: 24.8 }, rain: { rain: true }, elevUp: { aE: 2.5 }, elevDown: { aE: -2.5 } };

  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var r05 = function (x) { return Math.round(x * 20) / 20; };
  var base = function (o) { return { theta: o.theta, m1: o.m1, m2: o.m2, mus: o.mus, muk: o.muk, g: 9.8, aE: 0, rain: false }; };
  var rigText = function (p) { return p.theta + "°, crate " + p.m1 + " kg, counterweight " + (p.m2 ? p.m2 + " kg" : "none") + ", μs " + p.mus.toFixed(2) + ", μk " + p.muk.toFixed(2); };

  /* a random rig whose verdict is `want` with a safe margin from the edge. need: optional extra test on forces() */
  function rig(r, want, extra) {
    for (var i = 0; i < 600; i++) {
      var mus = 0.15 + 0.05 * Math.floor(r() * 10), p = base({ theta: 10 + 5 * Math.floor(r() * 11), m1: 4 + Math.floor(r() * 27), m2: (want === "down" && r() < 0.3) ? 0 : 1 + Math.floor(r() * 30), mus: mus, muk: Math.max(0.05, r05(mus - 0.1)) });
      var q = M.forces(p), v = M.verdict(p), m = Math.abs(q.Fd) / q.fmax;
      if (v !== want) continue;
      if (want === "rest" ? !(m <= 0.8) : !(m >= 1.3)) continue;
      if (extra && !extra(q, m)) continue;
      return p;
    }
    return base({ theta: 30, m1: 10, m2: want === "up" ? 30 : (want === "down" ? 0 : 5), mus: 0.3, muk: 0.2 });
  }

  function gen(type, who, n) {
    var seed = hash(who + ":" + type + ":" + n), r = rng(seed), off = hash(who) % 3, q;
    if (type === "cp1") {
      var want = ["rest", "up", "down"][(n + off) % 3], p = rig(r, want);
      /* three real sentences (up, down, rest) and one decoy, in a shuffled order */
      var opts = shuffle(r, ["up", "down", "rest", "decoy1"]);
      return { type: type, n: n, rig: p, truth: want, kind: "pick2", reasons: opts.map(function (k) { return { id: k, text: REASON[k] }; }), answer: { verdict: want, reason: want },
               prompt: "Set the sandbox to " + rigText(p) + ", on Earth. If you let go, what does the crate do, and why?" };
    }
    if (type === "cp2") {
      var list = [0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.7, 0.8, 0.9, 1.0], mus = list[Math.floor(r() * list.length)], m1 = 3 + Math.floor(r() * 38);
      return { type: type, n: n, mus: mus, m1: m1, kind: "number", answer: Math.atan(mus) * 180 / Math.PI, tol: TOL_DEG,
               prompt: "On Earth, with no counterweight and μs = " + mus.toFixed(2) + ", at what ramp angle does a " + m1 + " kg crate just start to slide? Use the sandbox to find it, then type the angle to the nearest degree." };
    }
    /* cp3 */
    var w = WORLDS[(n + off) % WORLDS.length], rain = w === "rain", b;
    if (rain) b = rig(r, "rest", function (q, m) { return m >= 0.6; });
    else b = rig(r, ["rest", "up", "down"][(n + off) % 3]);
    var earth = M.verdict(b), test = Object.assign({}, b, WORLD_SET[w]), now = M.verdict(test);
    var why = rain ? "wet" : "g", ro = shuffle(r, [why, "decoy2", "decoy3", rain ? "g" : "wet"]);
    return { type: type, n: n, rig: b, world: w, truth: now, earth: earth, kind: "pick2", reasons: ro.map(function (k) { return { id: k, text: REASON[k] }; }), answer: { verdict: now, reason: why },
             prompt: "On Earth, with " + rigText(b) + ", the crate " + WORD[earth] + ". Now the same rig is " + WORLD_TEXT[w] + ". What does the crate do, and why?" };
  }

  /* answer: cp1 and cp3 { verdict, reason }, cp2 a number. Returns { ok, code, hint }. */
  function grade(q, a) {
    if (q.type === "cp2") {
      var x = Number(a);
      if (!isFinite(x) || a === "" || a === null) return { ok: false, code: "EMPTY", hint: "Type the angle in degrees, to the nearest degree." };
      if (x < 3 || x > 89) return { ok: false, code: "UNIT", hint: "That does not look like an angle in degrees. Set μs in the sandbox, take the counterweight off, raise the ramp, and watch the crate." };
      var ok = Math.abs(x - q.answer) <= q.tol;
      return { ok: ok, code: ok ? "OK" : "ANGLE", hint: ok ? "" : "Set the sandbox to your " + x + "°, μs " + q.mus.toFixed(2) + " and no counterweight, then Release. What does the crate do? Adjust the angle and try again. Does the crate's mass change where it slips?" };
    }
    var vOk = a && a.verdict === q.answer.verdict, rOk = a && a.reason === q.answer.reason, ok2 = vOk && rOk;
    if (ok2) return { ok: true, code: "OK", hint: "" };
    var code = !vOk ? (rOk ? "V" : "VR") : "R", hint;
    if (q.type === "cp1") hint = !vOk ? "You called it “" + (a && a.verdict ? WORD[a.verdict] : "no answer") + "”. Turn on the force arrows and compare the two arrows that point along the ramp. Then ask how much friction can add: μs times the arrow pressing the crate into the ramp."
                                      : "Your call fits, but the reason does not. Which pull is bigger, and can friction cover the difference?";
    else hint = !vOk ? "Put the force arrows on in the new world and compare them with the arrows on Earth. Which arrows changed, and which did not?"
                     : "Your call fits, but the reason does not. Which part of the rig does this change touch: the forces, or the friction?";
    return { ok: false, code: code, hint: hint };
  }

  var api = { WORD: WORD, NAMES: NAMES, TYPES: TYPES, REASON: REASON, WORLDS: WORLDS, WORLD_SET: WORLD_SET, TOL_DEG: TOL_DEG, gen: gen, grade: grade, hash: hash };
  root.RampCheckpoints = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
