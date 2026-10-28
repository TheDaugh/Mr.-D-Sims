// Checks tab: three hidden bands, a three-hint ladder where every hint costs a fresh attempt, and the generators that keep the
// bank from running out. Pure logic, no DOM. Items come from slot-07-items.json (I).
import { mulberry32, accelOf, round } from "./fancart.js";

export const HINTS_MAX = 3;
export const newChecks = () => ({ band: 1, done: [], res: {}, gen: {}, genItems: {} });

const pick = (r, a) => a[Math.floor(r() * a.length)], F2 = (x) => x.toFixed(2);
// The generators exactly as the sheet's samples were made (seeded mulberry32; the content test regenerates the samples)
export const GEN = {
  g1: (D, r) => { const v = pick(r, [0.6, 0.9, 1.2, 1.5, 1.8, 2.4]), t = pick(r, [1.0, 2.0, 3.0]); return { prompt: `A cart's speed grows from 0 to ${F2(v)} m/s in ${t.toFixed(1)} s. What is its acceleration?`, answer: round(v / t, 2), unit: "m/s²", tol: 0.03, inputs: { v, t } }; },
  g2: (D, r) => { const F1 = pick(r, [0.15, 0.3]), k = pick(r, [2, 3]), a1 = round(accelOf(D, F1, 1.0), 2); return { prompt: `A fan force of ${F2(F1)} N gives a 1.00 kg cart an acceleration of ${F2(a1)} m/s². Predict the acceleration for a fan force of ${F2(k * F1)} N on the same cart.`, answer: round(a1 * k, 2), unit: "m/s²", tol: 0.04, inputs: { F1, k, a1 }, model: round(accelOf(D, k * F1, 1.0), 2) }; },
  g3: (D, r) => { const m1 = pick(r, [0.5, 0.75, 1.0]), kF = pick(r, [2, 3, 4]), km = pick(r, [2, 3]), a1 = round(accelOf(D, 0.15, m1), 2); return { prompt: `A ${F2(m1)} kg cart with a fan force of 0.15 N accelerates at ${F2(a1)} m/s². A stronger fan makes the force ${kF} times bigger, and the cart is loaded to ${km} times the mass. Predict the new acceleration.`, answer: round((a1 * kF) / km, 2), unit: "m/s²", tol: 0.04, inputs: { m1, kF, km, a1 }, model: round(accelOf(D, kF * 0.15, km * m1), 2) }; }
};
const FAMILY = { 1: ["g1", "b1-2"], 2: ["g2", "b2-1"], 3: ["g3", "b3-1"] };   // generator and the bank item whose hint wording it follows

// The sheet gives hints for the 12 bank items only. A generated problem borrows hint 1 (the step card) and hint 3 (the same move on
// another example) from the bank item of its family, and hint 2 (the first step) is that item's hint 2 with this problem's numbers.
const STEP2 = {
  g1: (x) => `First step: the speed gained is ${F2(x.v)} − 0 = ${F2(x.v)} m/s. Next, divide by the time.`,
  g2: (x) => `First step: how many times bigger is ${F2(x.k * x.F1)} N than ${F2(x.F1)} N?`,
  g3: (x) => `First step: make the force ${x.kF} times bigger alone. What happens to the acceleration?`
};
const numRe = (a) => new RegExp("(^|[^0-9.])" + a.replace(".", "\\.") + "(?![0-9])");
export const leaks = (item) => item.type === "num" && item.hints.some((h) => numRe(item.answer.toFixed(2)).test(h));

// The n-th generated problem of a band for one student. A draw whose answer would sit in one of its own hints is skipped.
export function genItem(I, D, key, band, n) {
  const [g, bankId] = FAMILY[band], bank = I.items.find((i) => i.id === bankId), r = mulberry32(fnv(`${key}|${band}|${n}`));
  for (let tries = 0; tries < 60; tries++) {
    const x = GEN[g](D, r), item = { id: `${g}#${n}`, band, type: "num", prompt: x.prompt, answer: x.answer, unit: x.unit, tol: x.tol, hints: [bank.hints[0], STEP2[g](x.inputs), bank.hints[2]], gen: true, inputs: x.inputs };
    if (!leaks(item)) return item;
  }
  throw new Error("could not make a clean problem");
}
export function fnv(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x >>> 0; }

export const bankById = (I) => Object.fromEntries(I.items.map((i) => [i.id, i]));
// The next problem: an unseen bank item at the student's band, else a fresh generated one at that band, so nobody runs out.
export function nextItem(I, D, st, key) {
  const left = I.items.find((i) => i.band === st.band && !st.done.includes(i.id));
  if (left) return left;
  const n = st.gen[st.band] || 0, id = `${FAMILY[st.band][0]}#${n}`;
  return st.genItems[id] || (st.genItems[id] = genItem(I, D, key, st.band, n));
}
export const itemOf = (I, st, id) => bankById(I)[id] || st.genItems[id];

// choice: an option index, or a number for a typed answer
export const isRight = (item, choice) => (item.type === "num" ? Number.isFinite(choice) && Math.abs(choice - item.answer) <= item.tol + 1e-9 : choice === item.answer);
// A wrong try opens the next hint and costs the try. After three hints one more miss closes the item.
export function answerItem(I, st, item, choice) {
  const s = (st.res[item.id] ||= { tries: 0, hints: 0, ok: false, closed: false, firstTry: false, band: item.band });
  if (s.ok || s.closed) return { ...s, state: s.ok ? "right" : "closed" };
  const finish = () => { st.done.push(item.id); if (item.gen) { st.gen[item.band] = (st.gen[item.band] || 0) + 1; delete st.genItems[item.id]; } };
  if (isRight(item, choice)) { s.ok = true; s.firstTry = s.tries === 0; if (s.firstTry) st.band = Math.min(3, st.band + 1); finish(); return { ...s, state: "right" }; }
  s.tries++;
  if (s.hints < HINTS_MAX) { s.hints++; return { ...s, state: "hint", hint: item.hints[s.hints - 1] }; }
  s.closed = true; finish(); return { ...s, state: "closed" };
}
