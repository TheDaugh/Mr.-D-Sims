/* ES-module copy of chemistry/shared/foil-model.js. Keep the two in step; test/foil.test.js compares them.
 FoilModel: the alpha-scattering model behind the Rutherford gold-foil lesson. Pure functions, no page code, so a test can check it.
   FoilModel.angle(model, u, v, target, thick)  ->  deflection angle in degrees for one alpha particle
   FoilModel.fire(stream, n, model, target, thick) -> counts per 10° bin for the next n particles of a stream
 model "plum": the positive charge is spread through the whole atom, so every push is tiny (never more than 2.5°).
 model "nuc":  the positive charge is a point nucleus. For one close pass, P(angle > t) = A * cot^2(t/2) (Rutherford's formula), so
               angle = 2 * atan( sqrt(A / u) ) for a random u between 0 and 1.
 A is the chance of a bounce-back (more than 90°): 1 in 4,000 for gold at thickness 1. It grows with foil thickness and with (nuclear charge)^2.
 Real foils rebound about 1 in 8,000 or fewer; the sim uses a stronger nucleus so a class sees rare events in minutes.
 Particles use a low-discrepancy sequence (shifted radical inverse), so a run of 10,000 gives counts very close to the expected ones.
 A student never gets zero rebounds by bad luck, and two runs of the same setup agree. */

var BINS = 18, A0 = 1 / 4000;
// n = atoms per cm³ (×10²²). A also scales with 1/E²: slower alpha particles are pushed harder (d0 = 2Ze²/4πε0E). Default E = 5 MeV.
var E0 = 5;
var TARGETS = { Au: { name: "Gold", Z: 79, n: 5.9 }, Pt: { name: "Platinum", Z: 78, n: 6.62 }, Ag: { name: "Silver", Z: 47, n: 5.86 }, Cu: { name: "Copper", Z: 29, n: 8.49 }, Al: { name: "Aluminum", Z: 13, n: 6.02 }, Pb: { name: "Lead", Z: 82, n: 3.3 } };
function vdc(i) { var f = 0.5, x = 0; while (i > 0) { if (i & 1) x += f; i = Math.floor(i / 2); f /= 2; } return x; }
function rot(x, r) { x += r; return x - Math.floor(x); }
function A(target, thick, E) { var t = TARGETS[target], z = t.Z / 79, e = E0 / (E || E0); return A0 * z * z * (t.n / 5.9) * thick * e * e; }
function angle(model, u, v, target, thick, E) {
  u = Math.max(u, 1e-12);
  if (model === "plum") { var g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); return Math.min(2.5, Math.abs(g) * 0.7); }
  return 2 * Math.atan(Math.sqrt(A(target || "Au", thick || 1, E) / u)) * 180 / Math.PI;
}
/* stream = { i: index of the next particle, r1, r2: shifts in [0,1) }. fire() advances stream.i and returns the new counts. */
function fire(stream, n, model, target, thick, each, E) {
  var h = new Array(BINS).fill(0), th = [];
  for (var k = 0; k < n; k++) {
    var i = stream.i++, a = angle(model, rot(vdc(i + 1), stream.r1), rot(vdc(Math.floor(i / 2) + 7919 + (i % 2) * 104729), stream.r2), target, thick, E);
    var b = Math.min(BINS - 1, Math.floor(a / 10)); h[b]++; if (th.length < 12) th.push(a); if (each) each(a);
  }
  return { hist: h, angles: th };
}
var groups = { straight: [0, 0], deflected: [1, 8], rebound: [9, 17] };
function sum(h, g) { var s = 0; for (var i = groups[g][0]; i <= groups[g][1]; i++) s += h[i] || 0; return s; }

export { BINS, A0, E0, TARGETS, angle, fire, A, sum, groups };
