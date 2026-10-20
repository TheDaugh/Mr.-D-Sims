/* FoilModel: the alpha-scattering model behind the Rutherford gold-foil lesson. Pure functions, no page code, so a test can check it.
     FoilModel.angle(model, u, v, target, thick)  ->  deflection angle in degrees for one alpha particle
     FoilModel.fire(stream, n, model, target, thick) -> counts per 10° bin for the next n particles of a stream
   model "plum": the positive charge is spread through the whole atom, so every push is tiny (never more than 2.5°).
   model "nuc":  the positive charge is a point nucleus. For one close pass, P(angle > t) = A * cot^2(t/2) (Rutherford's formula), so
                 angle = 2 * atan( sqrt(A / u) ) for a random u between 0 and 1.
   A is the chance of a bounce-back (more than 90°): 1 in 4,000 for gold at thickness 1. It grows with foil thickness and with (nuclear charge)^2.
   Real foils rebound about 1 in 8,000 or fewer; the sim uses a stronger nucleus so a class sees rare events in minutes.
   Particles use a low-discrepancy sequence (shifted radical inverse), so a run of 10,000 gives counts very close to the expected ones.
   A student never gets zero rebounds by bad luck, and two runs of the same setup agree. */
(function (root) {
  var BINS = 18, A0 = 1 / 4000;
  var TARGETS = { Au: { name: "Gold", Z: 79 }, Ag: { name: "Silver", Z: 47 }, Al: { name: "Aluminum", Z: 13 } };
  function vdc(i) { var f = 0.5, x = 0; while (i > 0) { if (i & 1) x += f; i = Math.floor(i / 2); f /= 2; } return x; }
  function rot(x, r) { x += r; return x - Math.floor(x); }
  function A(target, thick) { var z = TARGETS[target].Z / 79; return A0 * z * z * thick; }
  function angle(model, u, v, target, thick) {
    u = Math.max(u, 1e-12);
    if (model === "plum") { var g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); return Math.min(2.5, Math.abs(g) * 0.7); }
    return 2 * Math.atan(Math.sqrt(A(target || "Au", thick || 1) / u)) * 180 / Math.PI;
  }
  /* stream = { i: index of the next particle, r1, r2: shifts in [0,1) }. fire() advances stream.i and returns the new counts. */
  function fire(stream, n, model, target, thick, each) {
    var h = new Array(BINS).fill(0), th = [];
    for (var k = 0; k < n; k++) {
      var i = stream.i++, a = angle(model, rot(vdc(i + 1), stream.r1), rot(vdc(Math.floor(i / 2) + 7919 + (i % 2) * 104729), stream.r2), target, thick);
      var b = Math.min(BINS - 1, Math.floor(a / 10)); h[b]++; if (th.length < 12) th.push(a); if (each) each(a);
    }
    return { hist: h, angles: th };
  }
  var groups = { straight: [0, 0], deflected: [1, 8], rebound: [9, 17] };
  function sum(h, g) { var s = 0; for (var i = groups[g][0]; i <= groups[g][1]; i++) s += h[i] || 0; return s; }
  var api = { BINS: BINS, A0: A0, TARGETS: TARGETS, angle: angle, fire: fire, A: A, sum: sum, groups: groups };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.FoilModel = api;
})(typeof window !== "undefined" ? window : globalThis);
