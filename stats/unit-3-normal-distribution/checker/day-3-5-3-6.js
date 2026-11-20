/* Practice day 3 of Unit 3: lessons 3.5 (normalcdf) and 3.6 (invNorm). Content only; stats/shared/checker/engine.js runs it.
   Same stories as the notes: bus rides N(30, 4), sleep N(7.5, 1). Answers come from util.js's normalcdf and invNorm (checked against scipy). */
import { h, rnd, ri, pick, round, normalSvg, normalcdf, invNorm } from "../../shared/checker/util.js";

const NCTX = [
  { what: "Bus rides", unit: "minutes", mu: 30, sd: 4 }, { what: "Adult sleep", unit: "hours", mu: 7.5, sd: 1 }, { what: "Roll diameters", unit: "cm", mu: 9.2, sd: 0.6 },
  { what: "Test scores", unit: "points", mu: 50, sd: 5 }, { what: "Avocado weights", unit: "oz", mu: 7.2, sd: 0.8 }, { what: "Cholesterol levels", unit: "mg/dL", mu: 200, sd: 25 }
];
const nm = (c) => `${c.what} are N(${c.mu}, ${c.sd}) ${c.unit}.`;
const BIG = 1e9;
/* a value a little off a whole hop, so the empirical rule cannot answer it; band 1 keeps it to quarter hops */
const val = (c, b) => round(c.mu + c.sd * (b === 1 ? pick([-1.25, -0.75, 0.75, 1.25, 1.5, -1.5]) : round((rnd() * 4.4 - 2.2), 2)), c.sd < 1 ? 2 : 1);
const P = (x) => round(100 * x, 1);
const call = (lo, hi, c) => `normalcdf(${lo === -BIG ? "-1E99" : lo}, ${hi === BIG ? "1E99" : hi}, ${c.mu}, ${c.sd})`;

const types = {
  left: { title: "Area to the left", sub: "Under a value: normalcdf(-1E99, value, mean, SD).", skill: "stats.3-5.left", input: "num", unit: "%", tol: 0.15,
    make(b) { const c = pick(NCTX), x = val(c, b); return { pic: normalSvg(c.mu, c.sd, { shade: [[-BIG, x]], xlab: c.unit }), text: `${nm(c)} What percent are under ${x}?`, answer: P(normalcdf(-BIG, x, c.mu, c.sd)), hint: `Type ${call(-BIG, x, c)}, then times 100.` }; } },
  right: { title: "Area to the right", sub: "Over a value: normalcdf(value, 1E99, mean, SD).", skill: "stats.3-5.right", input: "num", unit: "%", tol: 0.15,
    make(b) { const c = pick(NCTX), x = val(c, b); return { pic: normalSvg(c.mu, c.sd, { shade: [[x, BIG]], xlab: c.unit }), text: `${nm(c)} What percent are over ${x}?`, answer: P(normalcdf(x, BIG, c.mu, c.sd)), hint: `Over means the upper end is 1E99: ${call(x, BIG, c)}.` }; } },
  between: { title: "Area between", sub: "Between: normalcdf(lower, upper, mean, SD).", skill: "stats.3-5.between", input: "num", unit: "%", tol: 0.15,
    make(b) { const c = pick(NCTX); let x = val(c, b), y = val(c, b); if (x === y) y = round(x + c.sd, 2); if (x > y) [x, y] = [y, x];
      return { pic: normalSvg(c.mu, c.sd, { shade: [[x, y]], xlab: c.unit }), text: `${nm(c)} What percent are between ${x} and ${y}?`, answer: P(normalcdf(x, y, c.mu, c.sd)), hint: `Smaller value first: ${call(x, y, c)}.` }; } },
  pctl: { title: "Percentile to value", sub: "invNorm(area to the left, mean, SD).", skill: "stats.3-6.percentile", input: "num", tol: 0.02,
    make(b) { const c = pick(NCTX), p = b === 1 ? pick([10, 25, 75, 90]) : ri(5, 95); return { pic: normalSvg(c.mu, c.sd, { shade: [[-BIG, invNorm(p / 100, c.mu, c.sd)]], xlab: c.unit }), text: `${nm(c)} Find the ${p}th percentile, to two decimals.`, answer: round(invNorm(p / 100, c.mu, c.sd), 2), hint: `invNorm(${p / 100}, ${c.mu}, ${c.sd}).` }; } },
  top: { title: "Top and bottom percents", sub: "invNorm wants the area to the LEFT. Top p%: put in 1 − p.", skill: "stats.3-6.top", input: "num", tol: 0.02,
    make(b) { const c = pick(NCTX), p = pick([1, 2.5, 5, 10, 15, 20, 25]), top = b === 1 ? true : rnd() < 0.6, left = top ? 1 - p / 100 : p / 100;
      return { pic: normalSvg(c.mu, c.sd, { shade: [top ? [invNorm(left, c.mu, c.sd), BIG] : [-BIG, invNorm(left, c.mu, c.sd)]], xlab: c.unit }), text: `${nm(c)} What value starts the ${top ? "top" : "bottom"} ${p}%? Two decimals.`, answer: round(invNorm(left, c.mu, c.sd), 2),
        hint: top ? `The top ${p}% has ${round(100 - p, 1)}% to its left: invNorm(${round(left, 3)}, ${c.mu}, ${c.sd}).` : `The bottom ${p}% is the area to the left: invNorm(${round(left, 3)}, ${c.mu}, ${c.sd}).` }; } },
  /* star tabs */
  zarea: { title: "From a z-score", sub: "A z-score lives on N(0, 1).", skill: "stats.3-5.z", input: "num", unit: "%", tol: 0.15,
    make() { const z = round(rnd() * 5 - 2.5, 2), below = rnd() < 0.5; return { pic: normalSvg(0, 1, { shade: [below ? [-BIG, z] : [z, BIG]], xlab: "z" }), text: `What percent of values are ${below ? "below" : "above"} z = ${z}?`, answer: P(below ? normalcdf(-BIG, z, 0, 1) : normalcdf(z, BIG, 0, 1)), hint: `Use mean 0 and SD 1: ${below ? `normalcdf(-1E99, ${z}, 0, 1)` : `normalcdf(${z}, 1E99, 0, 1)`}.` }; } },
  mean: { title: "Find the mean", sub: "z = invNorm(area, 0, 1), then mean = value − z × SD.", skill: "stats.3-6.mean", input: "num", tol: 0.15,
    make() { const c = pick(NCTX), p = ri(10, 90), z = round(invNorm(p / 100), 3), x = round(c.mu + z * c.sd + c.sd * round(rnd() - 0.5, 1), 1), mu = round(x - z * c.sd, 1);
      return { text: `${c.what} have SD ${c.sd} ${c.unit}, and ${p}% are below ${x}. What is the mean, to one decimal?`, answer: mu, hint: `z = invNorm(${p / 100}, 0, 1) = ${z}. Then mean = ${x} − (${z})(${c.sd}).` }; } }
};

/* Part 4 sim: find the cutoff. Slide the red line until the shaded area to its left is the percent asked. */
const sims = { cutoff: { title: "Find the cutoff", sub: "Slide the line. The shaded area to its left is shown as you go. This is what invNorm does.", skill: "stats.3-6.cutoff",
  run(app, done, api) {
    const ST = api.state; ST.k = ST.k || 0; const rounds = 3, wrap = h("div"); app.append(wrap);
    function round_() {
      const mu = 30, sd = 4, top = ST.k === 2, p = pick([10, 20, 25, 75, 80, 90]), left = top ? 100 - p : p, target = invNorm(left / 100, mu, sd);
      const host = h("div"), out = h("div", { class: "val" }), status = h("div", { class: "fb no" }, top ? `Mark where the top ${p}% of bus rides begins.` : `Mark the ${p}th percentile of bus rides.`);
      const sl = h("input", { type: "range", min: 18, max: 42, step: 0.05, value: 30, "aria-label": "Cutoff" });
      let doneR = false;
      const draw = () => { const x = +sl.value, a = 100 * normalcdf(-1e9, x, mu, sd);
        host.replaceChildren(normalSvg(mu, sd, { shade: [top ? [x, 1e9] : [-1e9, x]], mark: x, xlab: "Bus ride (minutes)" })); out.textContent = `${round(x, 2)} min: ${round(top ? 100 - a : a, 1)}% shaded`;
        if (!doneR && Math.abs(a - left) <= 0.6) { doneR = true; status.className = "fb ok"; status.textContent = `✔ About ${round(target, 2)} minutes. invNorm(${left / 100}, 30, 4) = ${round(target, 2)}.`; ST.k++; api.save(); setTimeout(() => { if (ST.k >= rounds) done(); else { wrap.replaceChildren(); round_(); } }, 1600); } };
      sl.addEventListener("input", draw);
      const card = h("div", { class: "card" }, h("div", { class: "q" }, `Task ${ST.k + 1} of ${rounds}: bus rides are N(30, 4). ${top ? `Where does the top ${p}% begin?` : `Where is the ${p}th percentile?`}`), host, h("div", { class: "sliderrow" }, h("b", {}, "Cutoff"), sl, out), status);
      if (api.key) card.append(h("div", { class: "keyline" }, h("b", {}, "KEY "), `${round(target, 2)} minutes`));
      window.__ccSim = { target }; wrap.append(card); draw();
    }
    round_();
  } } };

const notes = [
  { head: "normalcdf: a value in, an area out", pic: () => normalSvg(30, 4, { shade: [[-BIG, 25]], xlab: "Bus ride (minutes)" }), guide: "Bus rides N(30, 4). The shaded part is rides under 25 minutes. 25 is not a whole hop, so 68-95-99.7 cannot answer it.",
    say: "normalcdf(lower, upper, mean, SD). For under a value, the lower end is -1E99.", ask: { prompt: "Which do you type for rides under 25 minutes?", options: ["normalcdf(-1E99, 25, 30, 4)", "normalcdf(25, 1E99, 30, 4)", "normalcdf(25, 30, 4, 1)", "invNorm(25, 30, 4)"], answer: 0, why: "Everything left of 25: from -1E99 up to 25. It gives 0.106, about 10.6%." } },
  { head: "Over and between", pic: () => normalSvg(30, 4, { shade: [[27, 33]], xlab: "Bus ride (minutes)" }), guide: "The shaded part is 27 to 33 minutes.",
    say: "Over a value: the upper end is 1E99. Between: type both values, smaller first.", ask: { prompt: "Rides between 27 and 33 minutes?", options: ["normalcdf(27, 33, 30, 4) = 54.7%", "normalcdf(-1E99, 33, 30, 4) = 77.3%", "68%", "normalcdf(33, 27, 30, 4)"], answer: 0, why: "Both ends typed, smaller first." } },
  { head: "From a z-score", pic: () => normalSvg(0, 1, { shade: [[-BIG, -1.4]], xlab: "z" }), guide: "z-scores live on N(0, 1): mean 0, SD 1.",
    say: "For a z-score, use mean 0 and SD 1.", ask: { prompt: "Kelly's roll has z = −1.4. What percent are this size or smaller?", options: ["8.1%", "1.4%", "16%", "91.9%"], answer: 0, why: "normalcdf(-1E99, -1.4, 0, 1) = 0.081." } },
  { head: "invNorm: an area in, a value out", pic: () => normalSvg(30, 4, { shade: [[-BIG, invNorm(0.9, 30, 4)]], mark: invNorm(0.9, 30, 4), xlab: "Bus ride (minutes)" }), guide: "The red line is the 90th percentile: 90% of the area is to its left.",
    say: "invNorm(area to the left, mean, SD) gives the value.", ask: { prompt: "The 90th percentile of rides?", options: ["invNorm(0.90, 30, 4) = 35.13", "invNorm(90, 30, 4)", "normalcdf(-1E99, 0.90, 30, 4)", "invNorm(0.10, 30, 4) = 24.87"], answer: 0, why: "The area as a decimal goes in first." } },
  { head: "Top percents", pic: () => normalSvg(7.5, 1, { shade: [[invNorm(0.95, 7.5, 1), BIG]], mark: invNorm(0.95, 7.5, 1), xlab: "Sleep (hours)" }), guide: "The top 5% of sleepers is the shaded right tail. 95% of the area is to the left of the line.",
    say: "invNorm always wants the area to the left. Top p%: put in 1 − p.", ask: { prompt: "Where does the top 5% of sleep begin?", options: ["invNorm(0.95, 7.5, 1) = 9.14", "invNorm(0.05, 7.5, 1) = 5.86", "invNorm(5, 7.5, 1)", "7.5 + 5"], answer: 0, why: "95% is to its left." } },
  { head: "Finding the mean", pic: null, guide: "Cholesterol: SD 25, and 40% are below 195.",
    say: "Get z from invNorm(area, 0, 1), then mean = value − z × SD.", ask: { prompt: "z = invNorm(0.40, 0, 1) = −0.253. What is the mean?", options: ["195 + 0.253 × 25 = 201.3", "195 − 0.253 × 25 = 188.7", "195", "0.40 × 195"], answer: 0, why: "mean = 195 − (−0.253)(25) = 201.3." } }
];

export default {
  id: "stats-3-5-3-6-practice", title: "Practice: 3.5 and 3.6", warmSub: "Three quick review questions.",
  intro: "A warm-up, picture notes, then six short parts on normalcdf and invNorm, two star tabs, then mixed practice. Have your calculator ready.",
  warm: [
    { text: "Bus rides are N(30, 4). What percent take over 34 minutes?", answer: 16, input: "num", unit: "%" },
    { text: "0.1056 as a percent, to one decimal?", answer: 10.6, input: "num", unit: "%" },
    { text: "Top 10% means what percent is to the left?", answer: 90, input: "num", unit: "%" }
  ],
  notes, parts: ["left", "right", "between", "cutoff", "pctl", "top"], stars: ["zarea", "mean"], mix: ["left", "right", "between", "pctl", "top"],
  types, sims,
  bands: [[1, "Values at quarter and half hops; whole percentiles 10, 25, 75, 90; top percents only."], [2, "Any value within about 2.2 SDs; any percentile 5 to 95; top and bottom."], [3, "The standard: the same, mixed, with two-decimal answers."]],
  timing: [["Warm-up", "2-3 min", "3 easy review items, no lock."], ["Notes", "6-8 min", "Six picture cards, one question each. A tutorial: no huddle, no code."],
    ["Parts 1-6", "20-25 min", "About 3-4 min a part; calculator work makes these a little slower. The cutoff sim (3 tasks) about 3 min. Each miss adds a fresh question."],
    ["★1, ★2", "6-8 min", "Extension. Same rule: three in a row."], ["Practice", "to the mark", "Mixed 3.5-3.6 questions at the standard until the end mark. End opens then."]]
};
