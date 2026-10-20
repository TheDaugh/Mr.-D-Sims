// Real Coulomb physics for the atom microscope. Units: femtometers (fm) and MeV. Nucleus at the origin, alpha particle (charge 2e).
// Closest-approach distance for a head-on hit: d0 = 2 Z e² / (4πε0 E) = 2 Z (1.44 MeV·fm) / E.
// Rutherford's result for a point nucleus: tan(θ/2) = d0 / (2 b), where b is the impact parameter.
export const KE2 = 1.43996;                 // e²/(4πε0), MeV·fm
export const MEV_FM_TO_N = 160.2177;        // 1 MeV/fm in newtons
const MALPHA = 3727.379;                    // alpha mass, MeV/c²
const C = 299792458, HC = 197.327;          // m/s, MeV·fm
export const ELEMENTS = [
  { sym: "Al", name: "Aluminum", Z: 13, A: 27, n: 6.02 }, { sym: "Cu", name: "Copper", Z: 29, A: 64, n: 8.49 }, { sym: "Ag", name: "Silver", Z: 47, A: 108, n: 5.86 },
  { sym: "Pt", name: "Platinum", Z: 78, A: 195, n: 6.62 }, { sym: "Au", name: "Gold", Z: 79, A: 197, n: 5.9 }, { sym: "Pb", name: "Lead", Z: 82, A: 207, n: 3.3 }
];
export const element = (sym) => ELEMENTS.find((e) => e.sym === sym) || ELEMENTS[4];
export const closestApproach = (Z, E) => (2 * Z * KE2) / E;
export const nuclearRadius = (A) => 1.2 * Math.cbrt(A);
export const thetaFromB = (b, Z, E) => 2 * Math.atan(closestApproach(Z, E) / (2 * Math.max(b, 1e-9)));
export const speed = (E) => C * Math.sqrt(1 - 1 / Math.pow(1 + E / MALPHA, 2));         // m/s
export const wavelengthFm = (E) => HC / Math.sqrt(E * (E + 2 * MALPHA));                // de Broglie, fm
export const forceMeVFm = (Z, r) => (2 * Z * KE2) / (r * r);

// Acceleration (m = 1, so v = sqrt(2E)) on an alpha at (x,y) from nuclei, or from a uniform positive sphere (plum pudding).
export function accel(model, Z, nuclei, R, x, y) {
  let ax = 0, ay = 0;
  for (const n of nuclei) {
    const dx = x - n.x, dy = y - n.y, r2 = dx * dx + dy * dy, r = Math.sqrt(r2) || 1e-9;
    const f = model === "plum" ? (r < R ? (2 * Z * KE2 * r) / (R * R * R) : (2 * Z * KE2) / r2) : (2 * Z * KE2) / Math.max(r2, 1);
    ax += (f * dx) / r; ay += (f * dy) / r;
  }
  return [ax, ay];
}
// One alpha step by velocity Verlet with a step tied to the distance from the nearest nucleus.
export function stepAlpha(a, model, Z, nuclei, R, dtMax) {
  let rmin = Infinity; for (const n of nuclei) rmin = Math.min(rmin, Math.hypot(a.x - n.x, a.y - n.y));
  const v = Math.hypot(a.vx, a.vy), dt = Math.min(dtMax, (0.02 * Math.max(rmin, 1)) / v);
  const [ax, ay] = accel(model, Z, nuclei, R, a.x, a.y);
  a.x += a.vx * dt + 0.5 * ax * dt * dt; a.y += a.vy * dt + 0.5 * ay * dt * dt;
  const [bx, by] = accel(model, Z, nuclei, R, a.x, a.y); a.vx += 0.5 * (ax + bx) * dt; a.vy += 0.5 * (ay + by) * dt;
  return { dt, rmin, F: Math.hypot(bx, by) };
}
// Full trajectory for tests: start at x = -x0 with impact parameter b, return the final deflection in degrees.
export function deflection(Z, E, b, model = "nuc", R = 1.44e5, x0 = null) {
  const d0 = closestApproach(Z, E), far = x0 || Math.max(2000 * d0, 20 * Math.abs(b)), a = { x: -far, y: b, vx: Math.sqrt(2 * E), vy: 0 };
  for (let i = 0; i < 400000 && a.x < far; i++) stepAlpha(a, model, Z, [{ x: 0, y: 0 }], R, far);
  return Math.abs((Math.atan2(a.vy, a.vx) * 180) / Math.PI);
}
