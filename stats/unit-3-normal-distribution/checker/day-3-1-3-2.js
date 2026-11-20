/* Practice day 1 of Unit 3: lessons 3.1 (percentiles, z-scores) and 3.2 (adding and multiplying every value).
   Content only; stats/shared/checker/engine.js runs it. Same push-up class as the notes (mean 20, SD 6). */
import { h, rnd, ri, pick, shuffle, round, dotplotSvg, hopsSvg } from "../../shared/checker/util.js";

const PU = [11, 13, 13, 14, 15, 15, 17, 18, 19, 19, 19, 19, 21, 21, 22, 26, 29, 29, 30, 30];
const CTX = [
  { what: "plant heights", who: "plants", unit: "cm" }, { what: "commute times", who: "workers", unit: "minutes" },
  { what: "minutes of reading", who: "students", unit: "minutes" }, { what: "checkout times", who: "customers", unit: "minutes" },
  { what: "hours of sleep", who: "adults", unit: "hours" }, { what: "test scores", who: "students", unit: "points" }
];
const fmt = (x) => String(round(x, 2));
const sorted = (a) => a.slice().sort((p, q) => p - q);
/* a dotplot data set of n whole numbers, and a value from it */
function dataset(n, lo, hi) { const v = []; for (let i = 0; i < n; i++) v.push(ri(lo, hi)); return sorted(v); }
/* mean and SD for a context, by band: band 1 whole z; band 2 halves; band 3 decimals */
function setup(b) {
  const c = pick(CTX), mean = b === 3 ? ri(20, 90) + pick([0, 0.5]) : ri(2, 9) * 10, sd = b === 3 ? round(ri(15, 120) / 10, 1) : pick([2, 4, 5, 6, 8, 10]);
  const z = b === 1 ? pick([-2, -1, 1, 2]) : b === 2 ? pick([-1.5, -0.5, 0.5, 1.5, 2.5, -2.5]) : round((rnd() * 5 - 2.5), 2);
  if (b < 3) return { c, mean, sd, z, value: round(mean + z * sd, 2) };
  const value = round(mean + z * sd, 1);              // a measured value to one decimal; z is worked out from it
  return { c, mean, sd, value, z: round((value - mean) / sd, 2) };
}

const types = {
  pct: { title: "Percentile from a dotplot", sub: "Count the values at or below it, divide by how many, times 100.", skill: "stats.3-1.percentile", input: "num", unit: "th", tol: 0.5,
    make(b) {
      const n = b === 1 ? 10 : 20, v = dataset(n, 2, b === 1 ? 10 : 14), x = pick(v.slice(2, n - 1)), k = v.filter(t => t <= x).length;
      return { pic: dotplotSvg(v, { lo: Math.min(...v) - 1, hi: Math.max(...v) + 1, hl: null, xlab: "Value" }), text: `There are ${n} values. What percentile is ${x}?`, answer: round(100 * k / n, 0),
        hint: `Count the dots at ${x} or less (include all the dots at ${x}): ${k}. Then ${k} ÷ ${n} × 100.` };
    } },
  z: { title: "Find the z-score", sub: "z = (value − mean) ÷ SD. Subtract first.", skill: "stats.3-1.z", input: "num", tol: 0.01,
    make(b) { const s = setup(b); return { text: `${s.c.what[0].toUpperCase() + s.c.what.slice(1)} have mean ${s.mean} and SD ${s.sd}. Find z for ${fmt(s.value)}.`, answer: round((s.value - s.mean) / s.sd, 2), hint: `${fmt(s.value)} − ${s.mean} = ${fmt(s.value - s.mean)}. Then divide by ${s.sd}. Round to two decimals.` }; } },
  zsay: { title: "Say the z-score", sub: "Context, size, direction, the mean.", skill: "stats.3-1.interpret", input: "mc",
    make(b) {
      const s = setup(b === 1 ? 1 : 2), dir = s.z > 0 ? "above" : "below", other = s.z > 0 ? "below" : "above", a = Math.abs(s.z);
      const right = `${fmt(s.value)} ${s.c.unit} is ${a} standard deviations ${dir} the mean.`;
      return { text: `${s.c.what[0].toUpperCase() + s.c.what.slice(1)}: mean ${s.mean}, SD ${s.sd}. A value of ${fmt(s.value)} has z = ${s.z}. Which sentence says what that means?`, answer: right,
        opts: shuffle([right, `${fmt(s.value)} ${s.c.unit} is ${a} standard deviations ${other} the mean.`, `${fmt(s.value)} ${s.c.unit} is ${a} ${s.c.unit} ${dir} the mean.`, `${fmt(s.value)} ${s.c.unit} is at the ${a}th percentile.`]),
        hint: `z counts standard deviations, not ${s.c.unit}. Its sign says the direction: positive is above, negative is below.` };
    } },
  add: { title: "Add or subtract a constant", sub: "The center moves. The spread and the shape stay.", skill: "stats.3-2.add", input: "num", tol: 0.01,
    make(b) {
      const c = pick(CTX), mean = ri(10, 60), sd = ri(2, 12), med = mean + ri(-3, 3), rng = sd * ri(3, 5), k = (rnd() < 0.7 ? 1 : -1) * ri(2, 15);
      const ask = b === 1 ? pick(["mean", "sd"]) : pick(["mean", "sd", "median", "range"]);
      const ans = { mean: mean + k, sd, median: med + k, range: rng }[ask];
      return { text: `${c.what[0].toUpperCase() + c.what.slice(1)} have mean ${mean}, median ${med}, SD ${sd} and range ${rng}. Every value is ${k > 0 ? "increased" : "decreased"} by ${Math.abs(k)}. What is the new ${ask === "sd" ? "SD" : ask}?`, answer: ans,
        hint: `Adding or subtracting moves the mean and median by ${Math.abs(k)}. The SD and range measure spread, so they stay the same.` };
    } },
  mult: { title: "Multiply every value", sub: "The center and the spread both multiply. The shape stays.", skill: "stats.3-2.multiply", input: "num", tol: 0.01,
    make(b) {
      const c = pick(CTX), mean = ri(10, 60), sd = ri(2, 12), f = b === 1 ? pick([2, 3, 10]) : pick([1.5, 0.5, 1.1, 1.15, 2.5]), ask = pick(["mean", "sd"]);
      return { text: `${c.what[0].toUpperCase() + c.what.slice(1)} have mean ${mean} and SD ${sd}. Every value is multiplied by ${f}. What is the new ${ask === "sd" ? "SD" : "mean"}?`, answer: round((ask === "sd" ? sd : mean) * f, 2),
        hint: `Multiplying stretches everything: the mean and the SD both multiply by ${f}.` };
    } },
  /* star tabs */
  undo: { title: "Undo it: value from z", sub: "value = mean + z × SD", skill: "stats.3-1.undo", input: "num", tol: 0.01,
    make() { const s = setup(3); return { text: `${s.c.what[0].toUpperCase() + s.c.what.slice(1)}: mean ${s.mean}, SD ${s.sd}. Which value has z = ${s.z}?`, answer: round(s.mean + s.z * s.sd, 2), hint: `${s.z} × ${s.sd} = ${fmt(s.z * s.sd)}. Then add the mean, ${s.mean}.` }; } },
  compare: { title: "Who stands out more?", sub: "Turn each value into a z-score. The bigger |z| stands out more.", skill: "stats.3-1.compare", input: "mc",
    make() {
      const a = setup(3), b = setup(3); if (Math.abs(Math.abs(a.z) - Math.abs(b.z)) < 0.2) b.z = round(a.z + (a.z > 0 ? 0.6 : -0.6), 2), b.value = round(b.mean + b.z * b.sd, 2);
      const A = `Ana: ${fmt(a.value)} ${a.c.unit} (mean ${a.mean}, SD ${a.sd})`, B = `Ben: ${fmt(b.value)} ${b.c.unit} (mean ${b.mean}, SD ${b.sd})`;
      const ans = Math.abs(a.z) > Math.abs(b.z) ? "Ana" : "Ben";
      return { text: `${A}. ${B}. Each is compared with their own group. Who stands out more?`, answer: ans, opts: ["Ana", "Ben"], hint: `Find each z: (value − mean) ÷ SD. Compare the sizes, ignoring the signs.` };
    } }
};

/* Part 4 sim: hop to the value. Slide the orange dot until it sits at the asked z-score. */
const sims = { hop: { title: "Hop to the value", sub: "Slide the dot to the value with the z-score asked for. The line counts the hops.", skill: "stats.3-1.hop",
  run(app, done, api) {
    const ST = api.state; ST.k = ST.k || 0; const rounds = 3, wrap = h("div"); app.append(wrap);
    function round_() {
      const mean = ri(4, 9) * 10, sd = pick([4, 5, 6, 8, 10]), z = pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2]), target = mean + z * sd;
      const host = h("div"), val = h("div", { class: "val" }), status = h("div", { class: "fb no" }, `Put the dot at z = ${z}.`);
      const sl = h("input", { type: "range", min: mean - 3 * sd, max: mean + 3 * sd, step: sd / 10, value: mean, "aria-label": "Value" });
      let doneR = false;
      const draw = () => { const v = +sl.value; val.textContent = String(round(v, 1)); host.replaceChildren(hopsSvg(mean, sd, { mark: v }));
        if (!doneR && Math.abs(v - target) < sd / 20) { doneR = true; status.className = "fb ok"; status.textContent = `✔ ${target} is ${Math.abs(z)} SDs ${z > 0 ? "above" : "below"} the mean: ${mean} ${z > 0 ? "+" : "−"} ${Math.abs(z)} × ${sd} = ${target}.`; ST.k++; api.save(); setTimeout(() => { if (ST.k >= rounds) done(); else { wrap.replaceChildren(); round_(); } }, 1500); } };
      sl.addEventListener("input", draw);
      const card = h("div", { class: "card" }, h("div", { class: "q" }, `Task ${ST.k + 1} of ${rounds}: mean ${mean}, SD ${sd}. Put the dot at z = ${z}.`), host, h("div", { class: "sliderrow" }, h("b", {}, "Value"), sl, val), status);
      if (api.key) card.append(h("div", { class: "keyline" }, h("b", {}, "KEY "), String(target)));
      window.__ccSim = { target }; wrap.append(card); draw();
    }
    round_();
  } } };

const notes = [
  { head: "A percentile counts at or below", pic: () => dotplotSvg(PU, { lo: 8, hi: 32, hl: 26, xlab: "Push-ups" }), guide: "20 students' push-ups. The orange dots are the ones at 26 or fewer.",
    say: "A percentile is the percent of values less than or equal to a value.", ask: { prompt: "Sam did 26. What percentile is that?", options: ["80th", "26th", "16th", "20th"], answer: 0, why: "16 of 20 did 26 or fewer: 16 ÷ 20 = 80%." } },
  { head: "Say a percentile", pic: () => dotplotSvg(PU, { lo: 8, hi: 32, hl: 26, xlab: "Push-ups" }), guide: "Same dots. The sentence names the percent, the group and the value.",
    say: "___% of the group had ___ or fewer.", ask: { prompt: "Which sentence says what the 80th percentile means here?", options: ["80% of the class did 26 push-ups or fewer.", "Sam did 80 push-ups.", "Sam did 80% of the push-ups.", "80% of the class did more than 26."], answer: 0, why: "A percentile counts at or below the value." } },
  { head: "A z-score counts hops", pic: () => hopsSvg(20, 6, { k: 2, mark: 26 }), guide: "The class mean is 20 and the SD is 6. Each hop is 6 push-ups.",
    say: "z = (value − mean) ÷ SD: how many SDs a value is from the mean.", ask: { prompt: "What is z for 26 push-ups?", options: ["1", "6", "26", "−1"], answer: 0, why: "(26 − 20) ÷ 6 = 1. One hop above the mean." } },
  { head: "Say a z-score", pic: () => hopsSvg(20, 6, { k: 2, mark: 11 }), guide: "The dot is at 11 push-ups: (11 − 20) ÷ 6 = −1.5.",
    say: "___ is ___ standard deviations above/below the mean.", ask: { prompt: "Which sentence fits z = −1.5?", options: ["11 push-ups is 1.5 standard deviations below the mean.", "11 push-ups is 1.5 push-ups below the mean.", "11 push-ups is 1.5 standard deviations above the mean.", "11 is the 1.5th percentile."], answer: 0, why: "Negative z: below the mean, by 1.5 SDs." } },
  { head: "Adding moves, it does not stretch", pic: () => dotplotSvg(PU.map(v => v + 5), { lo: 13, hi: 37, xlab: "Push-ups + 5" }), guide: "Every student got 5 bonus push-ups. The whole dotplot slid 5 to the right.",
    say: "Adding moves the center by that amount. The spread and the shape stay the same.", ask: { prompt: "The mean was 20 and the SD 6. After +5?", options: ["Mean 25, SD 6", "Mean 25, SD 11", "Mean 20, SD 6", "Mean 100, SD 30"], answer: 0, why: "The center moves 5; the dots are no more spread out." } },
  { head: "Multiplying stretches", pic: () => dotplotSvg(PU.map(v => 2 * v), { lo: 20, hi: 62, step: 4, xlab: "Push-ups × 2" }), guide: "Every count doubled. The dots moved apart.",
    say: "Multiplying multiplies the center and the spread. The shape stays.", ask: { prompt: "The mean was 20 and the SD 6. After × 2?", options: ["Mean 40, SD 12", "Mean 40, SD 6", "Mean 22, SD 8", "Mean 20, SD 12"], answer: 0, why: "Both double." } }
];

export default {
  id: "stats-3-1-3-2-practice", title: "Practice: 3.1 and 3.2", warmSub: "Three quick review questions.",
  intro: "A warm-up, picture notes, then six short parts on percentiles, z-scores and changing every value, two star tabs, then mixed practice.",
  warm: [
    { text: "12 out of 20 is what percent?", answer: 60, input: "num", unit: "%" },
    { text: "26 − 20 = ?", answer: 6, input: "num" },
    { text: "9 ÷ 6 = ?", answer: 1.5, input: "num" }
  ],
  notes, parts: ["pct", "z", "zsay", "hop", "add", "mult"], stars: ["undo", "compare"], mix: ["pct", "z", "zsay", "add", "mult"],
  types, sims,
  bands: [[1, "10-value dotplots; whole-number z (±1, ±2); add or multiply asks for the mean or SD only; multiply by 2, 3 or 10."], [2, "20-value dotplots; z of ±0.5, ±1.5, ±2.5; median and range added."], [3, "The standard. Decimal means and SDs, z to two decimals; multiply by 1.1, 1.15, 1.5, 2.5 or 0.5."]],
  timing: [["Warm-up", "2-3 min", "3 easy review items, no lock."], ["Notes", "6-8 min", "Six picture cards, one question each. A tutorial: no huddle, no code."],
    ["Parts 1-6", "20-25 min", "About 3-4 min a part when the student gets three in a row quickly; the hop sim (3 tasks) about 3 min. Each miss adds a fresh question."],
    ["★1, ★2", "6-8 min", "Extension. Same rule: three in a row."], ["Practice", "to the mark", "Mixed 3.1-3.2 questions at the standard until the end mark. End opens then."]]
};
