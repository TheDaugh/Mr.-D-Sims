/* Spring sandbox: the physics, with no drawing. Used by spring-hang.html and by tests/unit/spring-hang.test.js.

   The scene: a spring hangs from a lab stand, with a ruler beside it. A mass hangs on its hook. The whole stand can ride in an elevator
   whose acceleration the student sets (up is positive). x is the stretch past the natural length, in metres, positive down.

   Rules that make it honest physics:
   - Hooke's law: the spring pulls with k x (up when stretched). In the elevator's frame the mass feels g + a, so
       m x'' = m (g + a) - k x - b x',   and it settles at x = m (g + a) / k.
   - A little damping (b = 2 zeta sqrt(k m), zeta = 0.30, author_set) so a released mass bounces a couple of times and settles, like a real
     spring in air. The damping never changes where it settles.
   - Past the elastic limit (a stretch of LIMIT metres) the spring snaps: Hooke's law stops being true, and the mass falls to the base.
     A released mass overshoots (to about 1.4 times its settling stretch), so it can snap on the first bounce even when it would
     settle inside the limit; lowering it gently never overshoots.
   - g comes from the planet. */
(function (root) {
  "use strict";
  var PLANETS = { earth: 9.8, moon: 1.62, mars: 3.71, jupiter: 24.8 };
  var SPRINGS = {                                    // author_set spring constants, N/m
    soft: { name: "Soft spring", k: 20 },
    medium: { name: "Medium spring", k: 60 },
    stiff: { name: "Stiff spring", k: 150 },
    vstiff: { name: "Very stiff spring", k: 400 }
  };
  var LIMIT = 0.45;                                  // m of stretch before it snaps (the ruler reads to 0.50 m)
  var ZETA = 0.30;
  var DROP = 0.75;                                   // m from the natural-length hook position down to the base

  function equilibrium(p) { return p.m * ((p.g || 9.8) + (p.a || 0)) / p.k; }
  function fresh() { return { x: 0, v: 0, t: 0, broken: false, y: 0, vy: 0, landed: false, held: true }; }

  /* One time step. Mutates and returns st. While held, nothing moves (the hand holds the mass at the natural length). */
  function step(p, st, dt) {
    var g = (p.g || 9.8) + (p.a || 0);
    st.t += dt;
    if (st.held) return st;
    if (st.broken) {                                  // free fall to the base, in the elevator's frame
      if (!st.landed) { st.vy += g * dt; st.y += st.vy * dt; if (st.y >= DROP) { st.y = DROP; st.vy = 0; st.landed = true; } }
      return st;
    }
    var b = 2 * ZETA * Math.sqrt(p.k * p.m), acc = g - (p.k * st.x + b * st.v) / p.m;
    st.v += acc * dt; st.x += st.v * dt;
    if (st.x > LIMIT) { st.broken = true; st.y = st.x; st.vy = st.v; }
    return st;
  }
  /* Lower the mass gently: it ends at rest where it would settle (or snaps, if that is past the limit). */
  function lower(p, st) { var xe = equilibrium(p); st.held = false; if (xe > LIMIT) { st.x = LIMIT; st.broken = true; st.y = LIMIT; st.vy = 0; } else { st.x = xe; st.v = 0; } return st; }
  function settled(p, st) { return !st.held && !st.broken && Math.abs(st.v) < 0.003 && Math.abs(st.x - equilibrium(p)) < 0.0015; }
  /* readings: spring force (N, up positive), weight (N), net force on the mass (N, down positive) */
  function readings(p, st) {
    var g = p.g || 9.8, Fs = st.broken ? 0 : p.k * st.x, W = p.m * g;
    return { spring: Fs, weight: W, net: st.held ? 0 : (st.broken ? (st.landed ? 0 : W) : W - Fs), stretch: st.broken ? null : st.x };
  }
  function analyze(p) {
    var xe = equilibrium(p), g = p.g || 9.8;
    return { g: g, W: p.m * g, scale: p.m * (g + (p.a || 0)), xe: xe, snaps: xe > LIMIT, maxMass: LIMIT * p.k / (g + (p.a || 0)), period: 2 * Math.PI * Math.sqrt(p.m / p.k) };
  }

  var api = { PLANETS: PLANETS, SPRINGS: SPRINGS, LIMIT: LIMIT, ZETA: ZETA, DROP: DROP, equilibrium: equilibrium, fresh: fresh, step: step, lower: lower, settled: settled, readings: readings, analyze: analyze };
  root.SpringModel = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
