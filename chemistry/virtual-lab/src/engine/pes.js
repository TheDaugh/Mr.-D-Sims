// The photoelectron model for the spectrometer (Lab 5). Pure functions, no DOM. The chemistry numbers come from
// chemistry/shared/pes-data.js; this file holds only the physics:
//   kinetic energy = photon energy - binding energy,   a subshell frees electrons only if photon energy > binding energy,
//   speed from kinetic energy:  KE = (1/2) m v^2.
// Energies in MJ/mol (what the AP axis uses). 1 eV = 0.0964853 MJ/mol.

export const N_A = 6.02214076e23;          // 1/mol
export const M_E = 9.1093837015e-31;       // kg
export const EV_TO_MJ = 0.0964853;
export const H_EV_NM = 1239.841984;        // eV nm: photon energy (eV) = 1239.84 / wavelength (nm); labels only

export const kineticEnergy = (photonMJ, bindingMJ) => photonMJ - bindingMJ;
export const frees = (photonMJ, bindingMJ) => photonMJ > bindingMJ;
// One electron: KE per mole (MJ/mol) -> joules per electron -> speed in m/s.
export const speedFromKE = (keMJ) => (keMJ > 0 ? Math.sqrt((2 * keMJ * 1e6 / N_A) / M_E) : 0);

// Light dial: slider 0..1 on a log scale from 0.2 to 200 MJ/mol (red light ~0.17 to X-ray). Labels name the band.
export const LIGHT_MIN = 0.2, LIGHT_MAX = 400;
export const photonFromSlider = (u) => LIGHT_MIN * Math.pow(LIGHT_MAX / LIGHT_MIN, Math.max(0, Math.min(1, u)));
export const sliderFromPhoton = (e) => Math.log(e / LIGHT_MIN) / Math.log(LIGHT_MAX / LIGHT_MIN);
// Plain-word band names. Visible light is about 1.65 to 3.1 eV, i.e. 0.16 to 0.30 MJ/mol: here "visible" is 0.2 to 0.35.
export function lightBand(photonMJ) { return photonMJ < 0.35 ? "visible" : photonMJ < 12 ? "ultraviolet" : "X-ray"; }

// What a given light does to a given element's subshell list [{sub,count,MJ}].
export function freed(spec, photonMJ) {
  return spec.filter((o) => frees(photonMJ, o.MJ)).map((o) => ({ sub: o.sub, count: o.count, MJ: o.MJ, keMJ: kineticEnergy(photonMJ, o.MJ), speed: speedFromKE(kineticEnergy(photonMJ, o.MJ)) }));
}

// Detector. Each fired photon frees at most one electron. Hit probability per freed subshell is proportional to its electron count
// (a teaching simplification: no photoionization cross-sections). Brightness only sets photons per second; it never changes which peaks appear.
// `rng` is a function returning [0,1). Returns the subshell hit, or null (photon passed through).
export function fireOne(spec, photonMJ, rng) {
  const f = freed(spec, photonMJ); if (!f.length) return null;
  const total = f.reduce((a, o) => a + o.count, 0), pick = rng() * total; let acc = 0;
  for (const o of f) { acc += o.count; if (pick < acc) return o; }
  return f[f.length - 1];
}
export const rateFromBrightness = (b) => Math.round(20 * Math.pow(25, Math.max(0, Math.min(1, b))));   // photons per second, 20..500

// Histogram of binding energies measured so far: counts per subshell, each electron's binding energy known exactly (an ideal analyzer).
export function newTally(spec) { return Object.fromEntries(spec.map((o) => [o.sub, 0])); }
export function addHit(tally, hit) { if (hit) tally[hit.sub] += 1; return tally; }
// The peaks the finished spectrum shows: relative heights from counts, normalised so the tallest is 1.
export function peaksFromTally(spec, tally) {
  const max = Math.max(1, ...spec.map((o) => tally[o.sub] || 0));
  return spec.map((o) => ({ sub: o.sub, MJ: o.MJ, count: o.count, hits: tally[o.sub] || 0, h: (tally[o.sub] || 0) / max }));
}
// Ideal spectrum (the model the student rebuilds): heights are the electron counts, relative to the tallest.
export function idealPeaks(spec) {
  const max = Math.max(...spec.map((o) => o.count));
  return spec.map((o) => ({ sub: o.sub, MJ: o.MJ, count: o.count, h: o.count / max }));
}

// AP axes: binding energy in MJ/mol, log scale, decreasing left to right.
export function axis(minMJ, maxMJ, width) { const a = Math.log(maxMJ), b = Math.log(minMJ); return { x: (mj) => ((a - Math.log(mj)) / (a - b)) * width, mj: (px) => Math.exp(a - (px / width) * (a - b)) }; }
export const AXIS_MIN = 0.3, AXIS_MAX = 600;   // MJ/mol: covers K 4s (about 0.42) to Ca 1s (about 380)
