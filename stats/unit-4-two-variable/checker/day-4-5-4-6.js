/* Practice day 3 of Unit 4: lessons 4.5 (regression lines: predict, residual, slope and intercept) and 4.6 (extrapolation,
   residual plots). Content only; checker/engine.js runs it. Every number is computed from the line shown. */
import { h, rnd, ri, pick, shuffle, round, gauss, corr, scatterSvg, residSvg } from "../../shared/checker/util.js";

/* a story: line y-hat = a + b x over the data's x range [lo, hi]; units for the sentences */
const LINES = [
  { x: "Hours since full charge", y: "Battery (%)", xs: "hour", ys: "percentage points", yn: "battery", a: 100, b: -8, lo: 0, hi: 10 },
  { x: "Minutes of practice", y: "Free throws made", xs: "minute of practice", ys: "free throws", yn: "free throws made", a: 30, b: 5, lo: 0, hi: 10 },
  { x: "Age of car (years)", y: "Price (thousand $)", xs: "year of age", ys: "thousand dollars", yn: "price", a: 28, b: -1.6, lo: 0, hi: 12 },
  { x: "Hundreds of miles driven", y: "Gas left (gallons)", xs: "hundred miles", ys: "gallons", yn: "gas left", a: 15, b: -3, lo: 0, hi: 5 },
  { x: "Temperature (°F)", y: "Cones sold", xs: "degree", ys: "cones", yn: "cones sold", a: -50, b: 4, lo: 60, hi: 90 },
  { x: "Weeks", y: "Plant height (cm)", xs: "week", ys: "cm", yn: "plant height", a: 2, b: 1.5, lo: 0, hi: 10 }
];
const eq = (L) => `ŷ = ${L.a} ${L.b < 0 ? "−" : "+"} ${Math.abs(L.b)}x`;
/* band 3 nudges the story's numbers to decimals so the arithmetic is not memorized */
function line(b) {
  const L = Object.assign({}, pick(LINES));
  if (b === 3) { L.a = round(L.a + (rnd() - 0.5) * Math.max(2, Math.abs(L.a) * 0.1), 1); L.b = round(L.b * (0.85 + rnd() * 0.3), 2) || L.b; }
  return L;
}
const xIn = (L, b) => b === 1 ? ri(L.lo, L.hi) : round(L.lo + rnd() * (L.hi - L.lo), b === 3 ? 1 : 0);
const yhat = (L, x) => round(L.a + L.b * x, 2);
function dataFor(L, n = 12) {
  const P = []; for (let i = 0; i < n; i++) { const x = round(L.lo + (L.hi - L.lo) * (i + 0.5) / n, 1); P.push([x, round(yhat(L, x) + Math.abs(L.b) * (L.hi - L.lo) * 0.06 * gauss(), 1)]); }
  return P;
}
function residPlot(L, curved) {
  const R = []; for (let i = 0; i < 14; i++) { const x = round(L.lo + (L.hi - L.lo) * i / 13, 1), t = i / 13 - 0.5; R.push([x, round(curved ? 8 * (t * t - 1 / 12) * 3 + 0.4 * gauss() : 1.2 * gauss(), 2)]); }
  return R;
}

const types = {
  predict: { title: "Predict with the line", sub: "Put x into the line. ŷ is the predicted value.", skill: "stats.4-5.predict", input: "num", tol: 0.05,
    make(b) { const L = line(b), x = xIn(L, b); return { text: `${L.y} from ${L.x.toLowerCase()}: ${eq(L)}. Predict when x = ${x}.`, answer: yhat(L, x), hint: `Multiply first: ${L.b} × ${x} = ${round(L.b * x, 2)}. Then add ${L.a}.` }; } },
  resid: { title: "Find the residual", sub: "residual = actual − predicted", skill: "stats.4-5.residual", input: "num", tol: 0.05,
    make(b) {
      const L = line(b), x = xIn(L, b), p = yhat(L, x), r = b === 1 ? ri(-6, 6) || 3 : round((rnd() - 0.5) * 12, b === 3 ? 1 : 0) || 2, act = round(p + r, 2);
      return { text: `${eq(L)}. At x = ${x}, the actual value was ${act}. What is the residual?`, answer: round(act - p, 2), hint: `Predicted first: ${L.a} + ${L.b}(${x}) = ${p}. Then actual minus predicted: ${act} − ${p}.` };
    } },
  sign: { title: "Above or below the line?", sub: "Positive residual: above the line, more than predicted. Negative: below, less than predicted.", skill: "stats.4-5.sign", input: "mc",
    make(b) {
      const L = line(1), P = dataFor(L), i = ri(2, P.length - 3), up = rnd() < 0.5;
      P[i] = [P[i][0], round(yhat(L, P[i][0]) + (up ? 1 : -1) * Math.abs(L.b) * (L.hi - L.lo) * 0.18, 1)];
      const ask = b === 1 ? "sign" : pick(["sign", "more"]);
      const pic = scatterSvg(P, { line: { a: L.a, b: L.b }, hi: i, xlab: L.x, ylab: L.y });
      if (ask === "sign") return { pic, text: "Is the red dot's residual positive or negative?", answer: up ? "positive" : "negative", opts: ["positive", "negative"], hint: "Above the line means the actual value is bigger than the prediction, so actual − predicted is positive." };
      return { pic, text: `Was the red dot's ${L.yn} more or less than the line predicted?`, answer: up ? "more than predicted" : "less than predicted", opts: ["more than predicted", "less than predicted"], hint: "The line is the prediction. A dot above it is more than predicted." };
    } },
  slope: { title: "Say the slope", sub: "For each additional x, the predicted y goes up or down by the slope.", skill: "stats.4-5.slope", input: "mc",
    make(b) {
      const L = line(b === 3 ? 3 : 1), up = L.b > 0, m = Math.abs(L.b);
      const right = `For each additional ${L.xs}, the predicted ${L.yn} goes ${up ? "up" : "down"} by ${m} ${L.ys}.`;
      const wrong = [`For each additional ${L.xs}, the predicted ${L.yn} goes ${up ? "down" : "up"} by ${m} ${L.ys}.`,
        `When x is 0, the predicted ${L.yn} is ${m} ${L.ys}.`,
        b === 3 ? `For each additional ${L.ys.replace(/s$/, "")}, the predicted ${L.x.toLowerCase()} goes ${up ? "up" : "down"} by ${m}.` : `The ${L.yn} is always ${m} ${L.ys}.`];
      return { text: `${eq(L)}, where x is ${L.x.toLowerCase()}. Which sentence says what the slope means?`, answer: right, opts: shuffle([right, ...wrong]),
        hint: `The slope is the number with x: ${L.b}. Its sign says up or down; it is the change in predicted y for each 1 more of x.` };
    } },
  trust: { title: "Can you trust it?", sub: "Inside the data's range, and a residual plot with random scatter: trust it.", skill: "stats.4-6.trust", input: "mc",
    make(b) {
      const L = line(1), kind = b === 1 ? pick(["ok", "extra"]) : pick(["ok", "extra", "curve"]);
      const x = kind === "extra" ? round(L.hi + (L.hi - L.lo) * (0.6 + rnd()), 0) : xIn(L, 2);
      const OPTS = ["Yes, trust it", "No: it is extrapolation, outside the data", "No: the residual plot shows a curve"];
      const answer = kind === "ok" ? OPTS[0] : kind === "extra" ? OPTS[1] : OPTS[2];
      return { pic: residSvg(residPlot(L, kind === "curve"), { xlab: L.x }), text: `The line ${eq(L)} was made from data with x from ${L.lo} to ${L.hi}. Its residual plot is above. Should you trust the prediction at x = ${x}?`,
        answer, opts: OPTS, hint: `Two checks: is ${x} between ${L.lo} and ${L.hi}? And is the residual plot random scatter, or a curve?` };
    } },
  /* star tabs */
  undo: { title: "Undo it: find the actual", sub: "actual = predicted + residual", skill: "stats.4-5.undo", input: "num", tol: 0.05,
    make() { const L = line(3), x = xIn(L, 2), p = yhat(L, x), r = round((rnd() - 0.5) * 10, 1) || 1.5; return { text: `${eq(L)}. At x = ${x} the residual is ${r}. What was the actual value?`, answer: round(p + r, 2), hint: `Predicted: ${L.a} + ${L.b}(${x}) = ${p}. Then actual = predicted + residual.` }; } },
  icept: { title: "What does the intercept mean?", sub: "The y-intercept is the predicted y when x is 0.", skill: "stats.4-5.intercept", input: "mc",
    make() {
      const L = line(3), right = `When x is 0, the predicted ${L.yn} is ${L.a} ${L.ys}.`;
      const wrong = [`For each additional ${L.xs}, the predicted ${L.yn} changes by ${L.a}.`, `The ${L.yn} can never be more than ${L.a}.`, `When the ${L.yn} is 0, x is ${L.a}.`];
      return { text: `${eq(L)}, where x is ${L.x.toLowerCase()}. What does ${L.a} mean?`, answer: right, opts: shuffle([right, ...wrong]), hint: "The number alone is where the line crosses the y-axis: the prediction at x = 0." };
    } }
};

/* Part 4 is a sim: slide the intercept and slope until the line fits as well as the best line (within 10% of its squared error). */
const sims = { fit: { title: "Fit the line", sub: "Move the line until it runs through the middle of the dots. The red bars are the residuals.", skill: "stats.4-5.fit",
  run(app, done, api) {
    const ST = api.state; ST.k = ST.k || 0; const rounds = 2, wrap = h("div"); app.append(wrap);
    function round_() {
      const L = pick(LINES), P = dataFor(L, 10), best = corr(P), sse = (a, b) => P.reduce((s, [x, y]) => s + (y - a - b * x) ** 2, 0), target = sse(best.a, best.b) * 1.1;
      const span = Math.abs(L.b) * (L.hi - L.lo) + 10, aR = [round(best.a - span, 0), round(best.a + span, 0)], bR = [round(best.b - Math.abs(best.b) * 1.5 - 1, 1), round(best.b + Math.abs(best.b) * 1.5 + 1, 1)];
      const ys = P.map(p => p[1]), pad = (Math.max(...ys) - Math.min(...ys)) * 0.25, yR = [Math.min(...ys) - pad, Math.max(...ys) + pad];
      let a = round((Math.max(...ys) + Math.min(...ys)) / 2, 1), b = 0, doneR = false;
      const host = h("div"), meter = h("div", { class: "val" }), status = h("div", { class: "fb no" }, "Not yet. Make the red bars as small as you can.");
      const mk = (label, lo, hi, st, get, set) => { const r = h("input", { type: "range", min: lo, max: hi, step: st, value: get(), "aria-label": label }), v = h("div", { class: "val" }, String(get())); r.addEventListener("input", () => { set(+r.value); v.textContent = r.value; draw(); }); return h("div", { class: "sliderrow" }, h("b", {}, label), r, v); };
      const draw = () => {
        const s = scatterSvg(P, { line: { a, b }, resid: true, xlab: L.x, ylab: L.y, yr: yR }); host.replaceChildren(s);
        const e = sse(a, b); meter.textContent = "squared error " + round(e, 0);
        if (!doneR && e <= target) { doneR = true; status.className = "fb ok"; status.textContent = `✔ That fits. Your line: ŷ = ${a} ${b < 0 ? "−" : "+"} ${Math.abs(b)}x. The best line: ŷ = ${round(best.a, 1)} ${best.b < 0 ? "−" : "+"} ${Math.abs(round(best.b, 2))}x.`; ST.k++; api.save(); setTimeout(() => { if (ST.k >= rounds) done(); else { wrap.replaceChildren(); round_(); } }, 1800); }
      };
      const card = h("div", { class: "card" }, h("div", { class: "q" }, `Line ${ST.k + 1} of ${rounds}`), host,
        mk("Intercept (a)", aR[0], aR[1], 0.1, () => a, (v) => { a = v; }), mk("Slope (b)", bR[0], bR[1], 0.01, () => b, (v) => { b = v; }),
        h("div", { class: "row" }, h("span", {}, "Goal: squared error at most " + round(target, 0)), meter), status);
      if (api.key) card.append(h("div", { class: "keyline" }, h("b", {}, "KEY "), `best line ŷ = ${round(best.a, 1)} ${best.b < 0 ? "−" : "+"} ${Math.abs(round(best.b, 2))}x`));
      window.__ccSim = { a: best.a, b: best.b }; wrap.append(card); draw();
    }
    round_();
  } } };

const B = LINES[0], BP = [[0, 99], [1, 93], [2, 85], [3, 80], [4, 66], [5, 55], [6, 53], [7, 42], [8, 38], [9, 32], [10, 22]];
const notes = [
  { head: "The regression line predicts", pic: () => scatterSvg(BP, { line: { a: 100, b: -8 }, xlab: B.x, ylab: B.y }), guide: "A phone's battery after a full charge. The blue line is ŷ = 100 − 8x. The hat on ŷ means predicted.",
    say: "To predict, put x into the line.", ask: { prompt: "Predict the battery at 4 hours.", options: ["68%", "92%", "32%", "100%"], answer: 0, why: "100 − 8(4) = 100 − 32 = 68." } },
  { head: "residual = actual − predicted", pic: () => scatterSvg(BP, { line: { a: 100, b: -8 }, hi: 5, xlab: B.x, ylab: B.y }), guide: "The red dot is 5 hours: actual 55%, predicted 100 − 8(5) = 60%.",
    say: "Actual first, always. Positive is above the line; negative is below.", ask: { prompt: "What is the red dot's residual?", options: ["−5", "5", "55", "60"], answer: 0, why: "55 − 60 = −5. Below the line: less than predicted." } },
  { head: "Say the slope", pic: () => scatterSvg(BP, { line: { a: 100, b: -8 }, xlab: B.x, ylab: B.y }), guide: "In ŷ = 100 − 8x, the slope is −8, the number with x.",
    say: "For each additional x, the predicted y goes up or down by the slope.", ask: { prompt: "Which sentence is right?", options: ["For each additional hour, the predicted battery goes down by 8 percentage points.", "For each additional hour, the battery goes up by 8.", "The battery starts at 8%.", "Each percentage point takes 8 hours."], answer: 0, why: "Slope −8: down by 8 for each hour, and it is a prediction." } },
  { head: "Say the intercept", pic: () => scatterSvg(BP, { line: { a: 100, b: -8 }, xlab: B.x, ylab: B.y }), guide: "The number alone, 100, is where the line meets the y-axis.",
    say: "When x is 0, the predicted y is the intercept.", ask: { prompt: "What does the 100 mean?", options: ["At 0 hours, the predicted battery is 100%.", "The battery drops 100% each hour.", "The phone lasts 100 hours.", "The residual is 100."], answer: 0, why: "x = 0 is just charged: predicted 100%." } },
  { head: "Extrapolation", pic: () => scatterSvg(BP, { line: { a: 100, b: -8 }, xlab: B.x, ylab: B.y }), guide: "The data runs from 0 to 10 hours. At 15 hours the line says 100 − 8(15) = −20%.",
    say: "Predicting outside the data's x range is extrapolation. Don't trust it.", ask: { prompt: "Should you trust the line at 15 hours?", options: ["No, 15 is outside 0 to 10", "Yes, the line goes forever", "Yes, −20% is fine", "No, 15 is too small"], answer: 0, why: "There is no data past 10 hours, and −20% is impossible." } },
  { head: "Residual plots", pic: () => residSvg(residPlot(B, true), { xlab: B.x }), guide: "Each dot is one residual. The middle line is residual 0: the regression line laid flat.",
    say: "Random scatter: the line is a good model. A curve: the line misses the pattern.", ask: { prompt: "Is a line a good model here?", options: ["No, the residuals make a curve", "Yes, there are dots above and below 0", "Yes, every residual is small", "No, there are too many dots"], answer: 0, why: "The residuals bend in a U, so the data bend and a line misses that." } }
];

export default {
  id: "stats-4-5-4-6-practice", title: "Practice: 4.5 and 4.6", warmSub: "Three quick review questions.",
  intro: "A warm-up, picture notes, then six short parts on regression lines, residuals and when to trust a prediction, two star tabs, then mixed practice.",
  warm: [
    { text: "30 − 0.2(30) = ?", answer: 24, input: "num" },
    { text: "12 − 15 = ?", answer: -3, input: "num" },
    { text: "r = −0.85. How strong is it?", answer: "strong", opts: ["strong", "moderate", "weak"], input: "mc" }
  ],
  notes, parts: ["predict", "resid", "sign", "fit", "slope", "trust"], stars: ["undo", "icept"],
  mix: ["predict", "resid", "sign", "slope", "trust"],
  types, sims,
  bands: [[1, "The lesson lines with whole-number x inside the data; residuals from -6 to 6; above or below only; slope sentences that differ only in up/down; trust with extrapolation or not."], [2, "Any x inside the range; more-or-less-than-predicted; curved residual plots added to trust."], [3, "The standard. Lines with decimal intercept and slope; decimal x; slope distractors that swap x and y."]],
  timing: [["Warm-up", "2-3 min", "3 easy review items, no lock."], ["Notes", "6-8 min", "Six picture cards, one question each. A tutorial: no huddle, no code."],
    ["Parts 1-6", "20-25 min", "About 3-4 min a part when the student gets three in a row quickly; fitting two lines about 4 min. Each miss adds a fresh question."],
    ["★1, ★2", "6-8 min", "Extension. Same rule: three in a row."], ["Practice", "to the mark", "Mixed 4.5-4.6 questions at the standard until the end mark. End opens then."]]
};
