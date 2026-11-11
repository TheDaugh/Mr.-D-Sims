// Lab 6 (the Pull Bench): the pure parts. The atom model is chemistry/shared/zeff.js (window.Zeff); nothing here draws.
// Atoms Z = 3..20. The pull is Z_eff / n^2, a classroom model number (author_set), never a measurement.
export const ZS = Array.from({ length: 18 }, (_, i) => i + 3);
export const hash = (s) => { let x = 2166136261; for (const c of String(s)) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; };
// The mystery atom is seeded by the student, so neighbors get different atoms. Z 4..19 so it has rings to count and is not Li, Na or K (the column the lab runs first).
export const MYSTERY_POOL = [4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 20];
export const mysteryZ = (seed) => MYSTERY_POOL[hash(seed + "|zeff-mystery") % MYSTERY_POOL.length];
// The predict question: sodium or magnesium, which holds its outer electron harder? Answer comes from the model, never typed in.
export const predictAnswer = (Zeff) => Zeff.cmp(Zeff.atom(12), Zeff.atom(11)) > 0 ? "mg" : "na";
// The huddle blanks. Mr. D writes these on the board; students copy. `ok` is what the key shows; any non-empty copy lets the student on.
export const BLANKS = (Zeff) => {
  const na = Zeff.atom(11);
  return [
    { id: "b1", pre: "Core electrons: the electrons", post: "the outer ring.", ans: ["inside", "within", "in"] },
    { id: "b2", pre: "Shielding: core electrons", post: "part of the nucleus's pull.", ans: ["cancel", "block", "reduce", "cancels"] },
    { id: "b3", pre: "Z_eff = Z minus the", post: "electrons.", ans: ["core"] },
    { id: "b4", pre: "Sodium: rings 2 + 8 + 1. Total electrons =", post: "", ans: [String(na.Z)] },
    { id: "b5", pre: "Core = 2 + 8 =", post: "", ans: [String(na.core)] },
    { id: "b6", pre: "Z_eff = 11 − 10 =", post: "", ans: [String(na.zeff)] },
    { id: "b7", pre: "Pull = Z_eff ÷ n² = 1 ÷ 3² =", post: "", ans: [Zeff.frac(na)] }];
};
export const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9/]/g, "");
export const blankOk = (b, text) => b.ans.map(norm).includes(norm(text));
// Length is Ian's call per day: the lab's `lengthMin`, or ?min=NN on the address. The one huddle sits at the middle.
export const lengthOf = (lab, search) => { const q = Number(new URLSearchParams(search || "").get("min")); return q >= 8 && q <= 60 ? q : lab.lengthMin || 20; };
export const huddleAt = (len) => Math.round(len / 2);
// The marking step: the student clicks the inner rings (the electrons in the way). The outer ring is the electron being pulled, so it never counts.
export const markedElectrons = (a, marks) => a.rings.reduce((s, c, i) => s + (i < a.n - 1 && marks && marks[i] ? c : 0), 0);
export const estimateLeft = (a, marks) => a.Z - markedElectrons(a, marks);          // protons left over
export const estimateMatches = (a, marks) => estimateLeft(a, marks) === a.zeff;     // equals the model's Z_eff, which is what the meter shows
