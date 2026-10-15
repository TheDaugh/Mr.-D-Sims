// Heating-curve model: a constant-power heater adds energy; temperature follows from the enthalpy of the sample.
// Pure functions only, so the tests can check the plateaus without a browser.
export function profile(s, mass) {
  const m = mass, segs = [];
  const add = (kind, J, from, to) => segs.push({ kind, J, from, to });
  if (s.sub) { // sublimes: solid straight to gas at one temperature, no liquid stage
    add("solid", m * s.cs * (s.sub - s.T0), s.T0, s.sub); add("sublime", m * s.Ls, s.sub, s.sub); add("gas", m * s.cg * (s.Tend - s.sub), s.sub, s.Tend);
    return { segs, total: segs.reduce((a, g) => a + g.J, 0) };
  }
  add("solid", m * s.cs * (s.mp - s.T0), s.T0, s.mp);
  add("melt", m * s.Lf, s.mp, s.mp);
  if (s.Tend <= s.bp) add("liquid", m * s.cl * (s.Tend - s.mp), s.mp, s.Tend);
  else { add("liquid", m * s.cl * (s.bp - s.mp), s.mp, s.bp); add("boil", m * s.Lv, s.bp, s.bp); add("gas", m * s.cg * (s.Tend - s.bp), s.bp, s.Tend); }
  return { segs, total: segs.reduce((a, g) => a + g.J, 0) };
}

// State after E joules: temperature, fraction melted (fm), fraction vaporised (fv), and the phase word.
export function stateAt(prof, E) {
  let rest = Math.max(0, Math.min(E, prof.total)), fm = 0, fv = 0, T = prof.segs[0].from, phase = "solid";
  for (const g of prof.segs) {
    const use = Math.min(rest, g.J), f = g.J > 0 ? use / g.J : 1;
    T = g.from + (g.to - g.from) * f;
    if (g.kind === "sublime") { fv = f; phase = f > 0 && f < 1 ? "subliming" : f >= 1 ? "gas" : phase; }
    if (g.kind === "melt") { fm = f; phase = f > 0 && f < 1 ? "melting" : f >= 1 ? "liquid" : phase; }
    if (g.kind === "boil") { fv = f; fm = 1; phase = f > 0 && f < 1 ? "boiling" : f >= 1 ? "gas" : phase; }
    if (g.kind === "liquid" && f > 0) { fm = 1; phase = "liquid"; }
    if (g.kind === "gas" && f > 0) { fv = 1; phase = "gas"; }
    rest -= use; if (rest <= 0) break;
  }
  return { T, fm, fv, phase };
}

// What the thermometer shows: truth plus a small repeatable wobble, to a tenth of a degree.
export function reading(T, seed, tSec) {
  const x = Math.sin(seed * 127.1 + tSec * 311.7) * 43758.5453, n = (x - Math.floor(x)) - 0.5;
  return Math.round((T + n * 0.4) * 10) / 10;
}

// Which sample letters get which substances for this seed.
export function assign(ids, seed, n) {
  const a = [...ids]; let s = seed >>> 0 || 1;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

// Compare a student's typed table and plotted points with the truth. For the teacher only.
export function checkData(sub, mass, power, rows, tolC = 3) {
  const prof = profile(sub, mass); let good = 0, bad = 0;
  for (const r of rows) {
    const t = +r.t, T = +r.T; if (!Number.isFinite(t) || !Number.isFinite(T) || r.T === "" || r.t === "") continue;
    (Math.abs(stateAt(prof, t * power).T - T) <= tolC ? good++ : bad++);
  }
  return { good, bad };
}
