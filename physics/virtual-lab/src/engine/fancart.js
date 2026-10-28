// Fan-cart model: pure logic, no DOM. Every number comes from slot-07-data.json (D).
// The one place the formula lives is accelOf(): a = (F - f) / m, with f the tiny drag of the track.
// No student screen shows it (slot 8 turns the two patterns into the law and names the newton).

export function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
// Box-Muller: two uniform draws make one standard normal draw
export const gauss = (r) => { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
export const round = (x, d = 2) => { const k = 10 ** d; return Math.round(x * k) / k; };

export const forceOf = (D, setting) => D.fan.settings[setting - 1].F_N;
export const massOf = (D, bars) => round(D.cart.mass_kg.value + D.cart.bar_mass_kg.value * bars, 4);
export const accelOf = (D, F, m) => (F - D.track.friction_N.value) / m;                 // the model
export const MAX_BARS = (D) => Math.max(...D.part2.map((r) => r.bars), D.test.bars);   // the cart takes 0 to 4 bars
export const SETTINGS = (D) => D.fan.settings.map((s) => s.setting);

// A reading counts when it is inside the larger of 10 percent or 0.03 m/s2 of what the data file expects.
export const tolerance = (D, want) => Math.max(D.tolerance.a_vs_expected.absolute_mps2, D.tolerance.a_vs_expected.relative * want);
export const within = (D, got, want) => Math.abs(got - want) <= tolerance(D, want) + 1e-9;

// Speeds the motion sensor reports at the times in ts. The reading at 0 s is 0 and uses no random draw.
export function sample(D, F, m, seed, ts) {
  const a = accelOf(D, F, m), r = mulberry32(seed), sigma = D.run.noise_sigma_mps.value;
  return ts.map((t) => (t === 0 ? 0 : round(a * t + sigma * gauss(r), D.run.display_decimals)));
}
// 20 readings a second for 2.0 s: 41 dots
export function runTimes(D) { const n = Math.round(D.run.duration_s.value * D.run.sensor_hz.value); return Array.from({ length: n + 1 }, (_, i) => round(i / D.run.sensor_hz.value, 4)); }
export function run(D, { setting, bars, seed }) {
  const F = forceOf(D, setting), m = massOf(D, bars), t = runTimes(D);
  return { setting, bars, F, m, seed, t, v: sample(D, F, m, seed, t) };
}
export const freshSeed = () => 1 + Math.floor(Math.random() * 2147483646);   // a new random seed each run

// Least-squares line through (xs, ys)
export function lsq(xs, ys) {
  const n = xs.length; if (n < 2) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
  if (sxx === 0) return null;
  const slope = sxy / sxx; return { slope, intercept: my - slope * mx, r2: syy === 0 ? 1 : (sxy * sxy) / (sxx * syy) };
}

// Two markers read the acceleration: the least-squares slope of the speed dots between them.
// Markers closer than 0.5 s give a warning and no number.
export function read(D, rn, a, b) {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  if (hi - lo < D.markers.minSeparation_s.value - 1e-9) return { ok: false, short: true, lo, hi };
  const idx = rn.t.map((t, i) => i).filter((i) => rn.t[i] >= lo - 1e-9 && rn.t[i] <= hi + 1e-9);
  const fit = lsq(idx.map((i) => rn.t[i]), idx.map((i) => rn.v[i]));
  if (!fit) return { ok: false, short: true, lo, hi };
  return { ok: true, a: round(fit.slope, D.run.display_decimals), n: idx.length, lo, hi };
}

// The cart's position down the track at time t (display only)
export const xAt = (D, F, m, t) => 0.5 * accelOf(D, F, m) * t * t;
