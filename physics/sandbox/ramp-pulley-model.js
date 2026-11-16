/* Ramp-and-pulley sandbox: the physics, with no drawing. Used by ramp-pulley.html and by tests/unit/ramp-pulley.test.js.

   The rig: a crate sits on a ramp hinged at the bottom. A rope runs from the crate, parallel to the ramp, over an ideal pulley
   (no mass, no friction) at the top, then straight down to a counterweight. Counterweight 0 means no rope at all.
   Positions are metres along the ramp from the hinge (s, up the ramp is positive). Forces in newtons, accelerations in m/s^2.

   Rules that make it honest physics:
   - The rope pulls but never pushes. With a counterweight it stays taut in both directions (T = m2 (g - a)), so no slack case is needed.
   - Static friction holds the crate while the push along the ramp is no more than mu_s N. Past that, kinetic friction mu_k N opposes the motion.
   - If friction stops a sliding crate, it stops dead (v = 0) and static friction decides whether it stays stopped.
   - Conditions: rain halves both friction coefficients (author_set, a plausible wet-surface drop; not measured). An elevator speeding up or down
     changes the effective g to g + aE for every force in the rig, so the slip verdict does not change but the accelerations do. */
(function (root) {
  "use strict";
  var PLANETS = { earth: 9.8, moon: 1.62, mars: 3.71, jupiter: 24.8 };      // m/s^2, rounded surface values
  var RAIN_FACTOR = 0.5;                                                    // author_set
  var L = 10, S0 = 5, H0 = 3.5, FLOOR = -8, CW_H = 0.6, H_MIN = 0.6, S_MIN = 0.6, BUMP = 1.1, PULLEY_R = 0.3, RISE = 0.5;    // the crate is 1.4 m long and 1.0 m tall; the rope leaves it at mid-height
  var rad = function (d) { return d * Math.PI / 180; };

  /* p: { theta (deg), m1, m2, mus, muk, g, aE (m/s^2, up positive), rain (bool) } */
  function forces(p) {
    var t = rad(p.theta), ge = Math.max(0.05, p.g + (p.aE || 0)), f = p.rain ? RAIN_FACTOR : 1;
    var mus = p.mus * f, muk = Math.min(p.muk, p.mus) * f;
    var N = p.m1 * ge * Math.cos(t), Wpar = p.m1 * ge * Math.sin(t), Pull = p.m2 * ge;
    return { ge: ge, mus: mus, muk: muk, N: N, Wpar: Wpar, Pull: Pull, Fd: Pull - Wpar, fmax: mus * N, fk: muk * N, M: p.m1 + p.m2 };
  }

  /* Where the crate may go: the top bumper, the bottom bumper, and (with a counterweight) the floor and the pulley. */
  function limits(theta, hasCw) {
    var t = rad(theta), Ty = L * Math.sin(t), cy = Ty + (RISE - PULLEY_R) * Math.cos(t);
    var lo = S_MIN, hi = L - BUMP;
    if (hasCw) { lo = Math.max(lo, S0 - (H0 - H_MIN)); hi = Math.min(hi, S0 + (cy - FLOOR - CW_H - H0)); }
    return { lo: lo, hi: hi };
  }

  function fresh() { return { s: S0, v: 0, a: 0, T: 0, f: 0, t: 0, moving: false, stop: null, impact: 0 }; }

  /* One time step. Mutates and returns st. */
  function step(p, st, dt) {
    var q = forces(p), lim = limits(p.theta, p.m2 > 0), EPS = 1e-3, a, f, d;
    st.impact = 0;
    if (Math.abs(st.v) < EPS) {
      if (Math.abs(q.Fd) <= q.fmax) { a = 0; f = -q.Fd; st.v = 0; }
      else { d = Math.sign(q.Fd); a = (q.Fd - d * q.fk) / q.M; f = -d * q.fk; }
    } else { d = Math.sign(st.v); a = (q.Fd - d * q.fk) / q.M; f = -d * q.fk; }
    var vn = st.v + a * dt;
    if (st.v !== 0 && st.v * vn < 0) { vn = 0; a = (vn - st.v) / dt; }      // friction stops the crate; it stays stopped unless static friction gives way
    st.v = vn; st.s += st.v * dt; st.t += dt;
    st.stop = null;
    if (st.s >= lim.hi) { if (st.v > 0.3) st.impact = st.v; st.s = lim.hi; if (st.v > 0) { st.v = 0; a = 0; } st.stop = "top"; }
    if (st.s <= lim.lo) { if (st.v < -0.3) st.impact = -st.v; st.s = lim.lo; if (st.v < 0) { st.v = 0; a = 0; } st.stop = st.stop || "bottom"; }
    st.a = a; st.f = f; st.moving = Math.abs(st.v) >= EPS;
    st.T = p.m2 > 0 ? p.m2 * (q.ge - a) : 0;
    return st;
  }

  /* After the angle or the counterweight changes, keep the crate inside where it is allowed to be. */
  function settle(p, st) { var lim = limits(p.theta, p.m2 > 0); st.s = Math.min(lim.hi, Math.max(lim.lo, st.s)); return st; }

  /* What the crate does if released from rest right now: "rest", "up" or "down". */
  function verdict(p) { var q = forces(p); return Math.abs(q.Fd) <= q.fmax ? "rest" : (q.Fd > 0 ? "up" : "down"); }

  /* The teacher key: every number comes from the same forces() the sim runs on. */
  function analyze(p) {
    var q = forces(p), v = verdict(p), d = Math.sign(q.Fd), a = v === "rest" ? 0 : (q.Fd - d * q.fk) / q.M;
    var ranges = [], on = false, from = 0, th;
    for (th = 0; th <= 85.0001; th += 0.1) {
      var r = verdict({ theta: th, m1: p.m1, m2: p.m2, mus: p.mus, muk: p.muk, g: p.g, aE: p.aE, rain: p.rain }) === "rest";
      if (r && !on) { on = true; from = th; }
      if (!r && on) { on = false; ranges.push([+from.toFixed(1), +(th - 0.1).toFixed(1)]); }
    }
    if (on) ranges.push([+from.toFixed(1), 85]);
    return { ge: q.ge, mus: q.mus, muk: q.muk, N: q.N, Wpar: q.Wpar, Pull: q.Pull, Fd: q.Fd, fmax: q.fmax, fk: q.fk, verdict: v, a: a,
             T: v === "rest" ? q.Pull : (p.m2 > 0 ? p.m2 * (q.ge - a) : 0), restRanges: ranges,
             slipNoCounter: +(Math.atan(q.mus) * 180 / Math.PI).toFixed(1) };
  }

  var api = { PLANETS: PLANETS, RAIN_FACTOR: RAIN_FACTOR, L: L, S0: S0, H0: H0, FLOOR: FLOOR, CW_H: CW_H, BUMP: BUMP, PULLEY_R: PULLEY_R, RISE: RISE,
              forces: forces, limits: limits, fresh: fresh, step: step, settle: settle, verdict: verdict, analyze: analyze };
  root.RampModel = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
