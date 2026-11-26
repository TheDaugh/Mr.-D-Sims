// Lab 6 (the Spring Scale Bench): the pure parts. Nothing here draws or touches the page.
// Four rigs, one spring scale: A calibrate it (find k), B put it in the string of a cart on a table pulled by a hanging mass,
// C read the rods and the nut of the Hyatt skywalk model in both designs, D read the tension between the links of a hanging chain.
// The checkpoint questions are generated here (shared rule: shared/virtual-lab/checkpoint.js), so no two in a row are the same.
export const G = 9.8;
export const hash = (s) => { let x = 2166136261; for (const c of String(s)) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; };
const pick = (pool, key) => pool[hash(key) % pool.length];
const r1 = (v) => Math.round(v * 10) / 10, r2 = (v) => Math.round(v * 100) / 100;

// Length is the lab's `lengthMin` or ?min=NN on the address; the one huddle sits at the middle (STANDARD.md).
export const lengthOf = (lab, search) => { const q = Number(new URLSearchParams(search || "").get("min")); return q >= 8 && q <= 60 ? q : lab.lengthMin || 25; };
export const huddleAt = (len) => Math.round(len / 2);

// ---------- Part A: the scale's own spring, seeded per student. None of the test's springs (50, 200, 400 N/m). ----------
export const K_POOL = [20, 24, 30, 36, 40, 45, 60];
export const scaleK = (seed) => pick(K_POOL, seed + "|scale-k");
export const CAL_MASSES = [0.1, 0.2, 0.3, 0.4];                       // kg; the largest stretches the softest scale 19.6 cm, inside the 30 cm ruler
export const stretchCm = (k, m) => r1((m * G / k) * 100);              // what the ruler shows, to 0.1 cm
// A typed k counts within 4 percent: the ruler is read to a millimetre.
export const kOk = (k, typed) => { const v = num(typed); return Number.isFinite(v) && Math.abs(v - k) <= 0.04 * k; };
export function kHint(k, rows, typed) {
  const v = num(typed); if (!Number.isFinite(v)) return "num";
  if (Math.abs(v - k / 100) <= 0.05 * k / 100) return "cm";             // used centimetres for x
  if (Math.abs(v - k / G) <= 0.05 * k / G) return "mass";                // used mass, not weight
  if (Math.abs(v - G / k) <= 0.06 * G / k || (rows[0] && Math.abs(v - rows[0].x / 100 / (rows[0].m * G)) < 0.01)) return "flip";   // x over F
  return "rows";
}

// ---------- Part B: cart on a frictionless table, string over a pulley, hanging mass; the scale is in the string ----------
export const CARTS = [1.5, 2.0, 4.0];                                  // never the test's 3.0 kg cart with a 1.0 kg hanging mass
export const HANGS = [0.25, 0.5, 1.0];
export const heldT = (M, m) => m * G;                                  // held still: the hanging mass is in equilibrium
export const releasedT = (M, m) => (M * m * G) / (M + m);             // released: both speed up together, a = mg / (M + m), T = M a
export const accel = (M, m) => (m * G) / (M + m);
export const PREDS = ["more", "same", "less"];                         // released, the scale reads ___ than held
export const predAnswer = "less";

// ---------- Part C: the Hyatt skywalk model. Two walkways hang one above the other from the same rods. ----------
export const WALK_KG = 2.0, PERSON_KG = 0.5;
export const walkW = (crowd) => r2((WALK_KG + PERSON_KG * crowd) * G);
// design "one": one long rod from the ceiling to the lower walkway; each walkway sits on its own nut on that rod.
// design "two" (as built): an upper rod from the ceiling to the upper walkway's beam, and a lower rod hanging from that same beam.
export function hyatt(design, crowdUp, crowdLow) {
  const up = walkW(crowdUp), low = walkW(crowdLow);
  return { up, low, upperRod: r2(up + low), lowerRod: low, nut: design === "two" ? r2(up + low) : up };
}
export const HY_CHOICES = ["own", "both", "lower"];                    // in the as-built design the upper nut holds: its own walkway / both walkways / only the lower one
export const hyAnswer = "both";

// ---------- Part D: a hanging chain with mass, and a bucket on the bottom link ----------
export const LINKS = 6;
export const LINK_POOL = [0.1, 0.15, 0.2, 0.25];
export const linkKg = (seed) => pick(LINK_POOL, seed + "|link-kg");
export const BUCKETS = [0, 0.5, 1.0];
// Gap j is just above link j, counting links from the bottom (gap 6 is where the chain meets the ceiling). It holds the links below it and the bucket.
export const chainT = (j, mLink, bucket) => r2((j * mLink + bucket) * G);
export const answerOk = (want, typed) => { const v = num(typed); return Number.isFinite(v) && Math.abs(v - want) <= Math.max(0.02 * Math.abs(want), 0.05); };

// ---------- checkpoints ----------
export const CK_TYPES = ["spring", "string", "hang"];
export const num = (s) => { const m = /-?\d+(?:\.\d+)?|-?\.\d+/.exec(String(s ?? "").replace(/,/g, "")); return m ? Number(m[0]) : NaN; };
// Question pools: none of the test's numbers (k 50, 200, 400; 1.5 kg on 50 N/m; 3.0 kg cart with 1.0 kg; the 5.0 kg bag).
const Q = {
  spring: { k: [15, 18, 22, 28, 32, 44, 55, 64, 72, 90], m: [0.15, 0.25, 0.35, 0.6, 0.8] },
  string: { M: [1.2, 1.5, 2.5, 3.5, 4.0, 6.0], m: [0.3, 0.4, 0.6, 0.8, 1.5, 2.0] },
  chain: { N: [5, 6, 7, 8], mL: [0.12, 0.18, 0.3, 0.4], B: [0, 0.6, 1.2, 2.0] },
  walk: { W: [1500, 1800, 2200, 2600, 3000, 3400] }
};
function make(type, n, seed) {
  const k = (s) => seed + "|" + type + "|" + n + "|" + s;
  if (type === "spring") {
    const K = pick(Q.spring.k, k("k")), m = pick(Q.spring.m, k("m")), x = r1(m * G / K * 100);
    if (n % 2 === 0) return { type, n, form: "findK", m, x, ans: r1(m * G / (x / 100)), unit: "N/m", key: `k${m}|${x}` };
    return { type, n, form: "findF", k: K, x, ans: r2(K * x / 100), unit: "N", key: `f${K}|${x}` };
  }
  if (type === "string") {
    const M = pick(Q.string.M, k("M")), m = pick(Q.string.m, k("m")), held = n % 3 === 1;
    return { type, n, M, m, held, ans: r2(held ? heldT(M, m) : releasedT(M, m)), unit: "N", key: `${M}|${m}|${held}` };
  }
  if (n % 2 === 0) {
    const N = pick(Q.chain.N, k("N")), mL = pick(Q.chain.mL, k("mL")), B = pick(Q.chain.B, k("B")), j = 1 + (hash(k("j")) % (N - 1));
    return { type, n, form: "chain", N, mL, B, j, ans: chainT(j, mL, B), unit: "N", key: `c${N}|${mL}|${B}|${j}` };
  }
  const up = pick(Q.walk.W, k("up")), low = pick(Q.walk.W, k("low")), at = ["nut2", "nut1", "upper", "lower"][hash(k("at")) % 4];
  const ans = at === "nut1" ? up : at === "lower" ? low : up + low;
  return { type, n, form: "walk", up, low, at, ans, unit: "N", key: `w${up}|${low}|${at}` };
}
// never the same question twice in a row: if n would repeat n − 1, the seed is nudged
export function question(type, n, seed) {
  let q = make(type, n, seed), i = 0; const prev = n > 0 ? make(type, n - 1, seed) : null;
  while (prev && q.key === prev.key && i < 9) { q = make(type, n, seed + "~" + ++i); }
  return q;
}
export const grade = (item, attempt) => answerOk(item.ans, attempt);
// The code of the hint. It points at what the student did, never gives the answer.
export function diagnose(item, attempt) {
  const v = num(attempt), near = (w) => Number.isFinite(w) && Math.abs(v - w) <= Math.max(0.03 * Math.abs(w), 0.05);
  if (!Number.isFinite(v)) return "num";
  if (item.type === "spring") {
    if (item.form === "findK") { if (near(item.m * G / item.x)) return "cm"; if (near(item.m / (item.x / 100))) return "mass"; return "springK"; }
    if (near(item.k * item.x)) return "cm"; return "springF";
  }
  if (item.type === "string") {
    if (!item.held && near(heldT(item.M, item.m))) return "held";
    if (item.held && near(releasedT(item.M, item.m))) return "still";
    if (near(accel(item.M, item.m))) return "accel";
    if (near(item.M * G) || near((item.M + item.m) * G)) return "cart";
    return "string";
  }
  if (item.form === "chain") {
    if (near(item.ans / G)) return "mass";
    if (near((item.N * item.mL + item.B) * G)) return "whole";
    if (item.B && near(item.j * item.mL * G)) return "bucket";
    if (near(((item.j + 1) * item.mL + item.B) * G) || near(((item.j - 1) * item.mL + item.B) * G)) return "count";
    return "below";
  }
  if (item.at === "nut2" && near(item.up)) return "own";
  if (item.at !== "nut2" && item.at !== "upper" && near(item.up + item.low)) return "whole";
  return "below";
}

// ---------- the huddle blanks: the teacher writes these on the board; students copy. Any non-empty copy lets a student on. ----------
export const BLANKS = [
  { id: "b1", pre: "A spring scale reads F = k", post: ", the stretch times the spring constant.", ans: ["x"] },
  { id: "b2", pre: "Held still, the hanging mass is in equilibrium, so T =", post: "", ans: ["mg"] },
  { id: "b3", pre: "Released, the hanging mass speeds up downward, so T is", post: "than mg.", ans: ["less", "smaller"] },
  { id: "b4", pre: "A rope, rod or link holds the weight of everything", post: "it.", ans: ["below", "under", "beneath"] },
  { id: "b5", pre: "Each piece of a chain is in equilibrium: T above = T below +", post: "of that piece.", ans: ["weight", "mg", "theweight"] }];
export const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9/]/g, "");
export const blankOk = (b, text) => b.ans.map(norm).includes(norm(text));
