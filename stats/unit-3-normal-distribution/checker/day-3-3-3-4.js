/* Practice day 2 of Unit 3: lessons 3.3 (density curves) and 3.4 (the empirical rule). Practice mixes in 3.1-3.2.
   Content only; stats/shared/checker/engine.js runs it. Same stories as the notes: elevator rides, bus rides N(30, 4). */
import { h, rnd, ri, pick, shuffle, round, normalSvg, uniformSvg, normalcdf } from "../../shared/checker/util.js";
import D12 from "./day-3-1-3-2.js";

const NCTX = [
  { what: "Bus rides", unit: "minutes", mu: 30, sd: 4 }, { what: "Adult sleep", unit: "hours", mu: 7.5, sd: 1 }, { what: "Roll diameters", unit: "cm", mu: 9.2, sd: 0.6 },
  { what: "Test scores", unit: "points", mu: 50, sd: 5 }, { what: "Avocado weights", unit: "oz", mu: 7.2, sd: 0.8 }, { what: "Heights of women", unit: "in", mu: 64, sd: 2.5 }
];
const ER = { 1: 68, 2: 95, 3: 99.7 };
const v = (c, k) => round(c.mu + k * c.sd, 2);
const nm = (c) => `${c.what} are N(${c.mu}, ${c.sd}) ${c.unit}.`;
/* empirical-rule percent between two whole hops a < b (each from -3 to 3) */
function er(a, b) {
  const half = { 1: 34, 2: 47.5, 3: 49.85 }, side = (k) => k === 0 ? 0 : Math.sign(k) * half[Math.abs(k)];
  return round(side(b) - side(a) + (a < 0 && b > 0 ? 0 : 0), 2);
}
function tailPct(c, k, above) { const t = round((100 - ER[Math.abs(k)]) / 2, 2); return above === (k > 0) ? t : round(100 - t, 2); }

const types = {
  unif: { title: "Area on a flat curve", sub: "Area = width × height = proportion.", skill: "stats.3-3.uniform", input: "num", tol: 0.005,
    make(b) {
      const a = 0, w = pick(b === 1 ? [10, 20] : [20, 40, 50]), lo = ri(0, w / 5 - 1) * 5, hi = lo + ri(1, (w - lo) / 5) * 5;
      const kind = b === 1 ? "between" : pick(["between", "under", "over"]);
      const [x, y] = kind === "between" ? [lo, hi] : kind === "under" ? [a, hi] : [lo, w];
      const text = kind === "between" ? `Proportion between ${x} and ${y}?` : kind === "under" ? `Proportion under ${y}?` : `Proportion over ${x}?`;
      return { pic: uniformSvg(a, w, { shade: [x, y] }), text: `A wait is equally likely to be anywhere from 0 to ${w} minutes. ${text}`, answer: round((y - x) / w, 4),
        hint: `Width ${y} − ${x} = ${y - x}. Height 1/${w}. Multiply: ${y - x} ÷ ${w}.` };
    } },
  shape: { title: "Shape and center", sub: "A long tail pulls the mean toward it.", skill: "stats.3-3.shape", input: "mc",
    make(b) {
      const S = [["skewed right, with a long tail toward big values", "The mean is greater than the median"], ["skewed left, with a long tail toward small values", "The mean is less than the median"], ["symmetric and bell-shaped", "The mean and median are about equal"]];
      const STORY = ["Incomes in a town where a few people earn a fortune", "Ages at retirement, where most retire late but a few retire very young", "Rolls of a fair die, many times"];
      const k = ri(0, 2), use = b === 1 ? `A distribution is ${S[k][0]}.` : `${STORY[k]}.`;
      return { text: `${use} Which is true?`, answer: S[k][1], opts: S.map(s => s[1]), hint: "Picture the shape. The mean is pulled toward a long tail; with no tail, it stays with the median." };
    } },
  label: { title: "Label the axis", sub: "Mean in the middle, then one SD each hop.", skill: "stats.3-4.label", input: "num", tol: 0.01,
    make(b) { const c = pick(NCTX), k = b === 1 ? pick([1, -1]) : pick([2, -2, 3, -3, 1, -1]); return { pic: normalSvg(c.mu, c.sd, { labels: false, xlab: c.unit }), text: `${nm(c)} What value is ${Math.abs(k)} SD${Math.abs(k) > 1 ? "s" : ""} ${k > 0 ? "above" : "below"} the mean?`, answer: v(c, k), hint: `Start at ${c.mu} and hop ${c.sd} ${Math.abs(k)} time${Math.abs(k) > 1 ? "s" : ""} ${k > 0 ? "right" : "left"}.` }; } },
  middle: { title: "68-95-99.7", sub: "Within 1, 2, 3 SDs: 68%, 95%, 99.7%.", skill: "stats.3-4.middle", input: "num", unit: "%", tol: 0.05,
    make(b) { const c = pick(NCTX), k = b === 1 ? 1 : pick([1, 2, 3]); return { pic: normalSvg(c.mu, c.sd, { shade: [[v(c, -k), v(c, k)]], xlab: c.unit }), text: `${nm(c)} What percent are between ${v(c, -k)} and ${v(c, k)}?`, answer: ER[k], hint: `${v(c, -k)} and ${v(c, k)} are ${k} SD${k > 1 ? "s" : ""} each side of the mean.` }; } },
  tail: { title: "Tails", sub: "tail = (100 − middle) ÷ 2. Uneven intervals: add the halves.", skill: "stats.3-4.tail", input: "num", unit: "%", tol: 0.05,
    make(b) {
      const c = pick(NCTX);
      if (b < 3 || rnd() < 0.5) { const k = pick(b === 1 ? [1, 2] : [1, 2, 3]) * pick([1, -1]), above = k > 0 ? rnd() < 0.8 : rnd() < 0.2;
        return { pic: normalSvg(c.mu, c.sd, { shade: [above ? [v(c, k), 1e9] : [-1e9, v(c, k)]], xlab: c.unit }), text: `${nm(c)} What percent are ${above ? "above" : "below"} ${v(c, k)}?`, answer: tailPct(c, k, above), hint: `Find the middle percent for ${Math.abs(k)} SD${Math.abs(k) > 1 ? "s" : ""}, then (100 − middle) ÷ 2 for one tail. Is the shaded part a tail or everything but a tail?` }; }
      const a = pick([-2, -1]), bb = pick([1, 2, 3].filter(x => x !== -a));
      return { pic: normalSvg(c.mu, c.sd, { shade: [[v(c, a), v(c, bb)]], xlab: c.unit }), text: `${nm(c)} What percent are between ${v(c, a)} and ${v(c, bb)}?`, answer: er(a, bb), hint: `Split at the mean: half of ${ER[-a]}% on the left plus half of ${ER[bb]}% on the right.` };
    } },
  /* star tabs */
  peak: { title: "Near the peak", sub: "Equal widths: the one closer to the peak holds more area.", skill: "stats.3-3.peak", input: "mc",
    make() {
      const c = pick(NCTX), w = c.sd, a1 = round(c.mu - w * pick([0.5, 0.25]), 2), a2 = round(c.mu + w * pick([1.25, 1.5, 2]), 2);
      const p1 = normalcdf(a1, a1 + w, c.mu, c.sd), p2 = normalcdf(a2, a2 + w, c.mu, c.sd), flip = rnd() < 0.5;
      const A = flip ? [a2, a2 + w] : [a1, a1 + w], B = flip ? [a1, a1 + w] : [a2, a2 + w], pa = flip ? p2 : p1, pb = flip ? p1 : p2;
      const opts = [`${round(A[0], 2)} to ${round(A[1], 2)}`, `${round(B[0], 2)} to ${round(B[1], 2)}`, "They are equal"];
      return { pic: normalSvg(c.mu, c.sd, { shade: [A, B], xlab: c.unit }), text: `${nm(c)} Without calculating, which interval holds more of them?`, answer: pa > pb ? opts[0] : opts[1], opts, hint: "Both intervals are the same width. The curve is tallest at the mean, so the interval nearer the mean has more area." };
    } },
  normalfit: { title: "Is it approximately normal?", sub: "Compare the data's percents with 68, 95 and 99.7.", skill: "stats.3-4.fit", input: "mc",
    make() {
      const yes = rnd() < 0.5, n = 40, w1 = yes ? ri(26, 29) : ri(17, 22), w2 = yes ? ri(37, 39) : ri(30, 34), w3 = yes ? 40 : ri(36, 39);
      return { text: `${n} reaction times. Within 1 SD of the mean: ${w1}. Within 2 SDs: ${w2}. Within 3 SDs: ${w3}. Is the distribution approximately normal?`, answer: yes ? "Yes, the percents are close to 68, 95 and 99.7" : "No, the percents are far from 68, 95 and 99.7",
        opts: ["Yes, the percents are close to 68, 95 and 99.7", "No, the percents are far from 68, 95 and 99.7"], hint: `Turn each count into a percent of ${n}: ${w1} ÷ ${n}, ${w2} ÷ ${n}, ${w3} ÷ ${n}. Compare with 68, 95, 99.7.` };
    } }
};

/* Part 4 sim: shade the area. Drag the two edges to whole hops until the shaded area is the percent asked. */
const TARGETS = [[-1, 1, 68], [-2, 2, 95], [0, 2, 47.5], [-1, 2, 81.5], [1, 3, 15.85], [-2, 1, 81.5], [-3, 0, 49.85]];
const sims = { shade: { title: "Shade the area", sub: "Move the two edges in whole hops. The shaded percent is shown as you go.", skill: "stats.3-4.shade",
  run(app, done, api) {
    const ST = api.state; ST.k = ST.k || 0; const rounds = 3, order = ST.order || (ST.order = shuffle([...TARGETS.keys()]).slice(0, rounds)), wrap = h("div"); app.append(wrap);
    function round_() {
      const [ta, tb, pct] = TARGETS[order[ST.k]], mu = 30, sd = 4, cur = [-3, 3];
      const host = h("div"), val = h("div", { class: "val" }), status = h("div", { class: "fb no" }, `Shade exactly ${pct}% of bus rides.`);
      let doneR = false;
      const draw = () => {
        const a = Math.min(...cur), b = Math.max(...cur), p = er(a, b);
        host.replaceChildren(normalSvg(mu, sd, { shade: a < b ? [[mu + a * sd, mu + b * sd]] : [], xlab: "Bus ride (minutes)" })); val.textContent = `${mu + a * sd} to ${mu + b * sd}: ${p}%`;
        if (!doneR && Math.abs(p - pct) < 0.01 && a < b) { doneR = true; status.className = "fb ok"; status.textContent = `✔ ${mu + a * sd} to ${mu + b * sd} minutes holds ${pct}% of rides.`; ST.k++; api.save(); setTimeout(() => { if (ST.k >= rounds) done(); else { wrap.replaceChildren(); round_(); } }, 1500); }
      };
      const sl = (i, lab) => { const r = h("input", { type: "range", min: -3, max: 3, step: 1, value: cur[i], "aria-label": lab }); r.addEventListener("input", () => { cur[i] = +r.value; draw(); }); return h("div", { class: "sliderrow" }, h("b", {}, lab), r); };
      const card = h("div", { class: "card" }, h("div", { class: "q" }, `Task ${ST.k + 1} of ${rounds}: bus rides are N(30, 4). Shade ${pct}% of rides.`), host, sl(0, "Left edge"), sl(1, "Right edge"), h("div", { class: "row" }, val), status);
      if (api.key) card.append(h("div", { class: "keyline" }, h("b", {}, "KEY "), `${mu + ta * sd} to ${mu + tb * sd}`));
      window.__ccSim = { a: ta, b: tb }; wrap.append(card); draw();
    }
    round_();
  } } };

const mixed = Object.assign({}, types);
["pct", "z", "add", "mult"].forEach(id => { mixed["u31-" + id] = D12.types[id]; });

const notes = [
  { head: "Area is proportion", pic: () => uniformSvg(10, 50, { shade: [20, 35], xlab: "Elevator ride (seconds)" }), guide: "Rides from 10 to 50 seconds, every time equally likely. The orange part is 20 to 35 seconds.",
    say: "A density curve has total area 1. The area over an interval is the proportion of values there.", ask: { prompt: "What proportion of rides take 20 to 35 seconds?", options: ["0.375", "15", "0.35", "0.5"], answer: 0, why: "Width 15, height 1/40: 15 ÷ 40 = 0.375." } },
  { head: "Tails pull the mean", pic: () => normalSvg(30, 4, { xlab: "Bus ride (minutes)" }), guide: "A symmetric curve has its mean and median together at the peak.",
    say: "In a skewed distribution the mean is pulled toward the long tail.", ask: { prompt: "Incomes have a long tail toward big values. Which is bigger?", options: ["The mean", "The median", "They are equal"], answer: 0, why: "The few huge incomes pull the mean up." } },
  { head: "Name it and draw it", pic: () => normalSvg(30, 4, { xlab: "Bus ride (minutes)" }), guide: "Bus rides are N(30, 4). The axis hops 4 minutes at a time from the mean.",
    say: "N(mean, SD). Mean in the middle, then one SD each hop.", ask: { prompt: "What value is 2 SDs below the mean?", options: ["22", "26", "28", "38"], answer: 0, why: "30 − 2 × 4 = 22." } },
  { head: "68-95-99.7", pic: () => normalSvg(30, 4, { shade: [[26, 34]], xlab: "Bus ride (minutes)" }), guide: "The shaded part is within 1 SD of the mean: 26 to 34 minutes.",
    say: "About 68% within 1 SD, 95% within 2, 99.7% within 3.", ask: { prompt: "What percent of rides take 26 to 34 minutes?", options: ["68%", "95%", "34%", "16%"], answer: 0, why: "One SD each side of the mean: 68%." } },
  { head: "Tails", pic: () => normalSvg(30, 4, { shade: [[34, 1e9]], xlab: "Bus ride (minutes)" }), guide: "The shaded part is everything above 34.",
    say: "tail = (100 − middle) ÷ 2.", ask: { prompt: "What percent of rides take over 34 minutes?", options: ["16%", "32%", "34%", "68%"], answer: 0, why: "(100 − 68) ÷ 2 = 16." } },
  { head: "Near the peak", pic: () => normalSvg(7.2, 0.8, { shade: [[7, 8], [8, 9]], xlab: "Avocado weight (oz)" }), guide: "Avocados are N(7.2, 0.8). Two shaded intervals, each 1 ounce wide.",
    say: "Equal widths: the interval nearer the peak holds more area.", ask: { prompt: "Which holds more avocados?", options: ["7 to 8 oz", "8 to 9 oz", "They are equal"], answer: 0, why: "7 to 8 contains the peak at 7.2, where the curve is tallest." } }
];

export default {
  id: "stats-3-3-3-4-practice", title: "Practice: 3.3 and 3.4", warmSub: "Three quick review questions.",
  intro: "A warm-up, picture notes, then six short parts on density curves and the empirical rule, two star tabs, then mixed practice that brings back 3.1 and 3.2.",
  warm: [
    { text: "Width 15, height 1/40. Area = ?", answer: 0.375, input: "num" },
    { text: "30 + 2 × 4 = ?", answer: 38, input: "num" },
    { text: "(100 − 68) ÷ 2 = ?", answer: 16, input: "num" }
  ],
  notes, parts: ["unif", "shape", "label", "shade", "middle", "tail"], stars: ["peak", "normalfit"],
  mix: ["unif", "shape", "label", "middle", "tail", "u31-pct", "u31-z", "u31-add", "u31-mult"],
  types: mixed, sims,
  bands: [[1, "Flat curves 0 to 10 or 20, between only; shapes named; 1 SD only; middle 68%; tails at 1 and 2 SDs, above the right end."], [2, "Flat curves to 50, under and over; 2 and 3 SDs; tails both ways."], [3, "The standard. Shapes from a story; tails at 3 SDs and uneven intervals (add the halves)."]],
  timing: [["Warm-up", "2-3 min", "3 easy review items, no lock."], ["Notes", "6-8 min", "Six picture cards, one question each. A tutorial: no huddle, no code."],
    ["Parts 1-6", "20-25 min", "About 3-4 min a part when the student gets three in a row quickly; the shading sim (3 tasks) about 3 min. Each miss adds a fresh question."],
    ["★1, ★2", "6-8 min", "Extension. Same rule: three in a row."], ["Practice", "to the mark", "Mixed 3.1-3.4 questions at the standard until the end mark. End opens then."]]
};
