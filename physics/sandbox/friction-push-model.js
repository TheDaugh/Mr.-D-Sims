/* Friction sandbox: the physics, with no drawing. Used by friction-push.html and by tests/unit/friction-push.test.js.

   The scene: a crate on a long, flat warehouse floor. A push machine behind it pushes to the right with a force F that the student sets
   (a steady push) or that grows at a fixed rate from zero (the "grow the push" button, which draws the friction-against-push graph).
   Positions in metres (x, right is positive), forces in newtons, accelerations in m/s^2.

   Rules that make it honest physics:
   - The machine pushes and never pulls, so F >= 0. It stays in contact with the crate.
   - At rest, static friction matches the push while F <= mu_s N, so the crate stays put and friction = F. Past mu_s N it slides.
   - Sliding, kinetic friction mu_k N points against the motion and does not depend on the speed or the push.
   - If the push drops below mu_k N, the crate slows. When friction stops it, it stops dead (v = 0) and static friction decides again.
   - N = m g on a flat floor with a sideways push. g comes from the planet.
   Surface coefficients are typical textbook values for each pair (author_set: a reasonable value from the usual ranges, not measured). */
(function (root) {
  "use strict";
  var PLANETS = { earth: 9.8, moon: 1.62, mars: 3.71, jupiter: 24.8 };
  var SURFACES = {                                   // author_set, typical textbook values
    wood: { name: "Wood crate on a wood floor", mus: 0.50, muk: 0.30 },
    rubber: { name: "Rubber mat on concrete", mus: 0.90, muk: 0.70 },
    steel: { name: "Steel crate on a steel floor", mus: 0.60, muk: 0.40 },
    carpet: { name: "Cardboard box on carpet", mus: 0.45, muk: 0.35 },
    ice: { name: "Crate on ice", mus: 0.10, muk: 0.05 }
  };
  var RATE = 10;                                     // N per second when the push grows
  var F_MAX = 500;                                   // the machine's limit

  function forces(p) {
    var g = p.g || 9.8, N = p.m * g, mus = p.mus, muk = Math.min(p.muk, p.mus);
    return { g: g, N: N, mus: mus, muk: muk, fmax: mus * N, fk: muk * N };
  }
  function fresh() { return { x: 0, v: 0, a: 0, f: 0, F: 0, t: 0, moving: false, started: false }; }

  /* One time step with push F (>= 0). Mutates and returns st. st.f is the friction on the crate, right positive (so it is usually negative). */
  function step(p, st, dt, F) {
    var q = forces(p), EPS = 1e-4, a, f;
    F = Math.max(0, Math.min(F_MAX, F)); st.F = F;
    if (Math.abs(st.v) < EPS) {
      if (F <= q.fmax) { a = 0; f = -F; st.v = 0; }
      else { f = -q.fk; a = (F + f) / p.m; st.started = true; }
    } else { f = -Math.sign(st.v) * q.fk; a = (F + f) / p.m; }
    var vn = st.v + a * dt;
    if (st.v > 0 && vn < 0) { vn = 0; a = -st.v / dt; f = -q.fk; }     // friction stops it within this step; next step static friction decides
    st.v = vn; st.x += vn * dt; st.t += dt; st.a = a; st.f = f; st.moving = Math.abs(st.v) >= EPS;
    return st;
  }

  /* What a crate at rest does under a steady push F: "rest" or "slides". */
  function verdict(p, F) { return F <= forces(p).fmax ? "rest" : "slides"; }
  /* friction on a crate at rest under push F, or on one that is sliding (size, newtons) */
  function friction(p, F) { var q = forces(p); return F <= q.fmax ? F : q.fk; }
  /* acceleration from rest under a steady push F */
  function accel(p, F) { var q = forces(p); return F <= q.fmax ? 0 : (F - q.fk) / p.m; }

  function analyze(p, F) {
    var q = forces(p);
    return { g: q.g, N: q.N, mus: q.mus, muk: q.muk, fmax: q.fmax, fk: q.fk, verdict: verdict(p, F), friction: friction(p, F), a: accel(p, F),
             keepGoing: q.fk, drop: q.fmax - q.fk };
  }

  var api = { PLANETS: PLANETS, SURFACES: SURFACES, RATE: RATE, F_MAX: F_MAX, forces: forces, fresh: fresh, step: step,
              verdict: verdict, friction: friction, accel: accel, analyze: analyze };
  root.FrictionModel = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
