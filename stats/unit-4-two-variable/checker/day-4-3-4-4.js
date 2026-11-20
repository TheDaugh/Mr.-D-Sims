/* Practice day 2 of Unit 4: lessons 4.3 (scatterplots) and 4.4 (correlation), with 4.1-4.2 mixed into the practice tab.
   Content only; checker/engine.js runs it. Every scatterplot is generated, and its r is computed, never assumed. */
import { h, rnd, ri, pick, shuffle, round, gauss, corr, cloud, scatterSvg } from "../../shared/checker/util.js";
import D12 from "./day-4-1-4-2.js";

/* x and y for each story; sign is the direction the story really has */
const S = [
  { x: "Hours studied", y: "Quiz score", x0: 0, x1: 10, ym: 75, ys: 10, sign: 1 },
  { x: "Hours worked per week", y: "Test score", x0: 0, x1: 20, ym: 78, ys: 9, sign: -1 },
  { x: "Age of car (years)", y: "Price (thousand $)", x0: 0, x1: 12, ym: 18, ys: 6, sign: -1 },
  { x: "Temperature (°F)", y: "Ice cream sales", x0: 50, x1: 95, ym: 200, ys: 60, sign: 1 },
  { x: "Phone hours a day", y: "Hours of sleep", x0: 0, x1: 8, ym: 7, ys: 1.2, sign: -1 },
  { x: "Height (in)", y: "Arm span (in)", x0: 58, x1: 76, ym: 67, ys: 4, sign: 1 }
];
const LEVEL = { strong: 0.9, moderate: 0.65, weak: 0.3 };
const strengthOf = (r) => Math.abs(r) >= 0.8 ? "strong" : Math.abs(r) >= 0.5 ? "moderate" : "weak";
const dirOf = (r) => Math.abs(r) < 0.15 ? "none" : r > 0 ? "positive" : "negative";
function plot(c, dir, strength, extra = {}) {
  const r = strength === "none" ? 0 : (dir === "positive" ? 1 : -1) * LEVEL[strength];
  const P = cloud(ri(14, 20), r, c.x0, c.x1, c.ym, c.ys, strength === "none" ? 0.08 : 0.05);
  return { P, r: corr(P).r };
}
function curved(c) {   /* a bent pattern: rises then levels off, little noise */
  const n = ri(14, 18), P = [];
  for (let i = 0; i < n; i++) { const t = rnd(); P.push([round(c.x0 + (c.x1 - c.x0) * t, 1), round(c.ym - c.ys * 2 + c.ys * 4 * (1 - (1 - t) ** 3) + c.ys * 0.15 * gauss(), 1)]); }
  return P;
}
function withOutlier(P, c) {
  const k = corr(P), xs = P.map(p => p[0]), x = round((Math.min(...xs) + Math.max(...xs)) / 2 + (rnd() - 0.5) * 2, 1);
  const yLine = k.a + k.b * x, off = c.ys * (2.6 + rnd()) * (rnd() < 0.5 ? -1 : 1);
  return P.concat([[x, round(yLine + off, 1)]]);
}

const PAIRS = [
  ["Hours studied", "Quiz score"], ["Hours of sleep", "Reaction time"], ["Temperature", "Ice cream sales"], ["Age of a car", "Its price"],
  ["Minutes of practice", "Free throws made"], ["Phone hours a day", "Hours of sleep"], ["Rainfall", "Crop yield"], ["Miles driven", "Gas used"],
  ["Hours worked per week", "Test score"], ["Height", "Arm span"]
];
const CAUSE = [
  { s: "Cities with more fire trucks have more fires", lurk: "City size", wrong: ["Fire trucks start fires", "Fires cause fire trucks to break", "The number of firefighters' children"] },
  { s: "Ice cream sales and sunburns rise together", lurk: "Hot, sunny weather", wrong: ["Ice cream causes sunburn", "Sunburn makes people buy ice cream", "The price of sunscreen"] },
  { s: "For elementary students, shoe size and reading score rise together", lurk: "Age", wrong: ["Big feet help reading", "Reading makes feet grow", "The color of the shoes"] },
  { s: "Towns with more libraries have more crimes", lurk: "Population", wrong: ["Libraries cause crime", "Criminals build libraries", "The number of library books"] },
  { s: "Coffee shops and dentists rise together across towns", lurk: "Town population", wrong: ["Coffee causes cavities that need dentists", "Dentists open coffee shops", "The price of coffee"] },
  { s: "Students who own more books score higher on tests", lurk: "How much the family reads and studies at home", wrong: ["Owning books raises scores by itself", "High scores make families buy books", "The size of the bookshelf"] },
  { s: "Hospitals with more doctors have more deaths", lurk: "Hospital size (how many patients)", wrong: ["Doctors cause deaths", "Deaths cause hiring", "The number of parking spaces"] },
  { s: "Drownings and shark sightings rise together", lurk: "Summer: more people swimming", wrong: ["Sharks cause most drownings", "Drownings attract sharks", "The number of lifeguard chairs"] }
];
const LAB = ["A", "B", "C"];

const types = {
  point: { title: "Read a point", sub: "A dot is (across, up): read the x-axis first, then the y-axis.", skill: "stats.4-3.point", input: "num", tol: 0,
    make(b) {
      const c = pick(S), n = 8, P = [];
      const step = b === 1 ? 1 : 2, used = new Set();
      while (P.length < n) { const x = ri(1, 10) * step, y = ri(2, 18) * (b === 3 ? 5 : 1); if (used.has(x)) continue; used.add(x); P.push([x, y]); }
      const lab = {}; [0, 1].forEach((k, i) => lab[k] = LAB[i]);
      const ask = b === 1 ? "y" : b === 2 ? pick(["x", "y"]) : "diff";
      const pic = scatterSvg(P, { labels: lab, xlab: "x", ylab: "y" });
      if (ask === "y") return { pic, text: `What is the y-value of point A?`, answer: P[0][1], hint: `From A go straight across to the y-axis and read the number.` };
      if (ask === "x") return { pic, text: `What is the x-value of point B?`, answer: P[1][0], hint: `From B go straight down to the x-axis and read the number.` };
      return { pic, text: `How much higher is point A than point B? (A's y minus B's y)`, answer: P[0][1] - P[1][1], hint: `Read both y-values: A is ${P[0][1]}... now read B's and subtract. A negative answer means A is lower.` };
    } },
  role: { title: "Explanatory or response", sub: "The explanatory variable might explain the other. It goes across (x). The response goes up (y).", skill: "stats.4-3.role", input: "mc",
    make(b) {
      const [ex, re] = pick(PAIRS), flip = rnd() < 0.5, pair = flip ? `${re} and ${ex.toLowerCase()}` : `${ex} and ${re.toLowerCase()}`;
      const q = b === 3 ? pick(["y", "x"]) : "ex";
      const text = q === "ex" ? `${pair}: which is the explanatory variable?` : q === "x" ? `${pair}: which goes across, on the x-axis?` : `${pair}: which goes up, on the y-axis?`;
      const answer = q === "y" ? re : ex;
      return { text, answer, opts: shuffle([ex, re]), hint: `Ask: which one could explain or cause a change in the other? "${ex}" explains "${re.toLowerCase()}". The explanatory goes across, the response goes up.` };
    } },
  describe: { title: "Describe the scatterplot", sub: "Four words: direction, strength, form, outliers.", skill: "stats.4-3.describe", input: "mc",
    make(b) {
      const c = pick(S), ask = b === 1 ? "direction" : b === 2 ? pick(["direction", "strength"]) : pick(["strength", "form", "outlier"]);
      if (ask === "form") {
        const bent = rnd() < 0.5, P = bent ? curved(c) : plot(c, "positive", "strong").P;
        return { pic: scatterSvg(P, { xlab: c.x, ylab: c.y }), text: "What is the form?", answer: bent ? "curve" : "line", opts: ["line", "curve"], hint: "Picture the path the dots follow. Does it bend, or could a ruler cover it?" };
      }
      if (ask === "outlier") {
        const has = rnd() < 0.5, base = plot(c, pick(["positive", "negative"]), "strong").P, P = has ? withOutlier(base, c) : base;
        return { pic: scatterSvg(P, { xlab: c.x, ylab: c.y }), text: "Is there an outlier?", answer: has ? "yes" : "no", opts: ["yes", "no"], hint: "An outlier is one dot far from the path the others follow, not just the dot at the end." };
      }
      const dir = ask === "direction" ? pick(["positive", "negative", "none"]) : pick(["positive", "negative"]);
      const st = dir === "none" ? "none" : ask === "strength" ? pick(["strong", "moderate", "weak"]) : pick(["strong", "moderate"]);
      const { P, r } = plot(c, dir, st);
      if (ask === "direction") return { pic: scatterSvg(P, { xlab: c.x, ylab: c.y }), text: "What is the direction?", answer: dirOf(r), opts: ["positive", "negative", "none"], hint: "Read left to right. Going up is positive, going down is negative, no trend is none." };
      return { pic: scatterSvg(P, { xlab: c.x, ylab: c.y }), text: "How strong is it?", answer: strengthOf(r), opts: ["strong", "moderate", "weak"], hint: "Strength is how tightly the dots hug one path, not how steep the path is." };
    } },
  rmatch: { title: "Estimate r", sub: "Sign first (direction), then size (how tight).", skill: "stats.4-4.estimate", input: "mc",
    make(b) {
      const c = pick(S), menu = b === 1 ? [-0.9, 0, 0.9] : b === 2 ? [-0.9, -0.5, 0, 0.5, 0.9] : [-0.9, -0.6, -0.3, 0.3, 0.6, 0.9];
      const t = pick(menu), P = cloud(ri(16, 22), t, c.x0, c.x1, c.ym, c.ys, 0.04);
      const opts = b === 1 ? menu : shuffle([t, ...shuffle(menu.filter(x => x !== t)).slice(0, 3)]).sort((p, q) => p - q);
      return { pic: scatterSvg(P, { xlab: c.x, ylab: c.y }), text: "Which is the best estimate of r?", answer: String(t), opts: opts.map(String),
        hint: `Is the trend up (positive r), down (negative r) or flat (near 0)? Then: very tight is near ±1, loose is nearer 0.` };
    } },
  cause: { title: "Correlation is not causation", sub: "A strong r does not prove cause. Look for a lurking variable.", skill: "stats.4-4.cause", input: "mc",
    make(b) {
      const k = pick(CAUSE), r = round(0.7 + rnd() * 0.25, 2);
      return { text: `${k.s} (r = ${r}). Which lurking variable could explain both?`, answer: k.lurk, opts: shuffle([k.lurk, ...k.wrong]),
        hint: "A lurking variable is a third thing that pushes both up together. It is not one of the two variables, and it is not a story where one causes the other." };
    } },
  /* star tabs */
  outlier: { title: "What one dot does to r", sub: "Imagine the red dot gone. Does the pattern get tighter or looser?", skill: "stats.4-4.outlier", input: "mc",
    make() {
      const c = pick(S), base = plot(c, pick(["positive", "negative"]), "strong").P;
      let P, i;
      if (rnd() < 0.6) { P = withOutlier(base, c); i = P.length - 1; }
      else { const k = corr(base), xs = base.map(p => p[0]), x = round(Math.max(...xs) + (c.x1 - c.x0) * 0.35, 1); P = base.concat([[x, round(k.a + k.b * x, 1)]]); i = P.length - 1; }
      const rw = corr(P).r, ro = corr(P.filter((_, j) => j !== i)).r;
      const answer = Math.abs(ro) > Math.abs(rw) + 0.005 ? "r gets stronger (closer to 1 or -1)" : Math.abs(ro) < Math.abs(rw) - 0.005 ? "r gets weaker (closer to 0)" : "r stays about the same";
      return { pic: scatterSvg(P, { xlab: c.x, ylab: c.y, hi: i }), text: `With the red dot, r = ${round(rw, 2)}. If you remove the red dot, what happens to r?`, answer,
        opts: ["r gets stronger (closer to 1 or -1)", "r gets weaker (closer to 0)", "r stays about the same"],
        hint: "A dot off the pattern loosens it, so removing it tightens the rest. A far dot right on the line makes the line look tighter, so removing it loosens it a little." };
    } },
  compare: { title: "Which is stronger?", sub: "Strength is the size of r, not its sign.", skill: "stats.4-4.compare", input: "mc",
    make() {
      let a = round((rnd() * 1.9 - 0.95), 2), b = round((rnd() * 1.9 - 0.95), 2);
      if (rnd() < 0.5) b = round(-a + (rnd() < 0.5 ? 0 : 0.1 * (rnd() < 0.5 ? 1 : -1)), 2);
      const ans = Math.abs(a) > Math.abs(b) ? `r = ${a}` : Math.abs(b) > Math.abs(a) ? `r = ${b}` : "They are equally strong";
      return { text: `Which shows the stronger linear relationship?`, answer: ans, opts: [`r = ${a}`, `r = ${b}`, "They are equally strong"],
        hint: "Drop the sign and compare the sizes. The one closer to 1 is stronger; -0.8 is stronger than 0.5." };
    } }
};

/* Part 4 is a sim: slide r to make the cloud the task asks for. The cloud keeps the same dots and only tightens or loosens. */
const TARGETS = [["a strong positive", (r) => r >= 0.8], ["a moderate negative", (r) => r <= -0.5 && r > -0.8], ["a weak positive", (r) => r > 0.15 && r < 0.5], ["a strong negative", (r) => r <= -0.8], ["no relationship", (r) => Math.abs(r) < 0.15]];
const sims = { make: { title: "Make the scatterplot", sub: "Slide to change how the dots line up. Watch r change with them.", skill: "stats.4-4.make",
  run(app, done, api) {
    const ST = api.state; ST.k = ST.k || 0; const rounds = 3, order = ST.order || (ST.order = shuffle([0, 1, 2, 3, 4]).slice(0, rounds));
    const wrap = h("div"); app.append(wrap);
    function round_() {
      const [label, ok] = TARGETS[order[ST.k]], Z = Array.from({ length: 24 }, () => [gauss(), gauss()]);
      const host = h("div"), rv = h("div", { class: "val" }), status = h("div", { class: "fb no" }, `Make ${label} relationship.`);
      const sl = h("input", { type: "range", min: -100, max: 100, step: 1, value: 0, "aria-label": "Relationship slider" });
      let doneR = false;
      const draw = () => {
        const t = +sl.value / 100, P = Z.map(([z1, z2]) => [round(50 + 15 * z1, 1), round(50 + 15 * (t * z1 + Math.sqrt(1 - t * t) * z2), 1)]);
        const r = corr(P).r; rv.textContent = "r = " + round(r, 2); host.replaceChildren(scatterSvg(P, { xr: [0, 100], yr: [0, 100] }));
        if (!doneR && ok(r)) { doneR = true; status.className = "fb ok"; status.textContent = `✔ That is ${label} relationship: r = ${round(r, 2)}.`; ST.k++; api.save(); setTimeout(() => { if (ST.k >= rounds) done(); else { wrap.replaceChildren(); round_(); } }, 1200); }
      };
      sl.addEventListener("input", draw);
      const card = h("div", { class: "card" }, h("div", { class: "q" }, `Task ${ST.k + 1} of ${rounds}: make ${label} relationship.`), host, h("div", { class: "sliderrow" }, h("b", {}, "Slide"), sl, rv), status);
      if (api.key) card.append(h("div", { class: "keyline" }, h("b", {}, "KEY "), { "a strong positive": "r ≥ 0.8", "a moderate negative": "-0.8 < r ≤ -0.5", "a weak positive": "0.15 < r < 0.5", "a strong negative": "r ≤ -0.8", "no relationship": "|r| < 0.15" }[label]));
      wrap.append(card); draw();
    }
    round_();
  } } };

/* practice mixes today's parts with the 4.1-4.2 ones */
const mixed = Object.assign({}, types);
["read", "outof", "pct", "assoc", "seg"].forEach(id => { mixed["u41-" + id] = D12.types[id]; });

const N = [[2, 60], [3, 66], [4, 70], [5, 74], [6, 80], [7, 84], [8, 88], [1, 55]];
const notes = [
  { head: "A scatterplot shows two number variables", pic: () => scatterSvg(N, { xlab: "Hours studied", ylab: "Quiz score", labels: { 3: "A" } }), guide: "Each dot is one student. Across is hours studied; up is quiz score.",
    say: "To read a dot, go down to the x-axis, then across to the y-axis.", ask: { prompt: "What is student A's quiz score?", options: ["74", "5", "80", "70"], answer: 0, why: "A sits at 5 hours across and 74 points up." } },
  { head: "Explanatory across, response up", pic: () => scatterSvg(N, { xlab: "Hours studied (explanatory)", ylab: "Quiz score (response)" }), guide: "Hours studied might explain the score, so it goes across.",
    say: "The explanatory variable might explain the other one. The response responds.", ask: { prompt: "Minutes of practice and free throws made: which is the explanatory variable?", options: ["Minutes of practice", "Free throws made"], answer: 0, why: "More practice might explain more free throws." } },
  { head: "Direction and strength", pic: () => scatterSvg(cloud(18, -0.9, 0, 20, 78, 9), { xlab: "Hours worked", ylab: "Test score" }), guide: "Read left to right. The dots fall, and they hug one path tightly.",
    say: "Direction: positive goes up, negative goes down. Strength: how tightly the dots hug a path.", ask: { prompt: "Describe this one.", options: ["Strong and negative", "Weak and negative", "Strong and positive", "Weak and positive"], answer: 0, why: "The dots fall (negative) and stay close to one path (strong)." } },
  { head: "Form and outliers", pic: () => { const P = cloud(16, 0.9, 0, 10, 75, 10); P.push([5, 40]); return scatterSvg(P, { xlab: "Hours studied", ylab: "Quiz score", hi: P.length - 1 }); }, guide: "The red dot is far below the path the others follow.",
    say: "Form: does the path look like a line or a curve? An outlier is a dot far from the rest.", ask: { prompt: "What is the red dot?", options: ["An outlier", "The strongest point", "The form", "The response variable"], answer: 0, why: "It is far from the pattern of the other dots." } },
  { head: "r is one number for a linear relationship", pic: () => scatterSvg(cloud(18, 0.6, 50, 95, 200, 60), { xlab: "Temperature (°F)", ylab: "Ice cream sales" }), guide: "r runs from -1 to 1. Its sign is the direction; its size is the strength.",
    say: "Near 1 or -1: strong. Near 0: weak or none. About 0.5 to 0.8: moderate.", ask: { prompt: "Which is the best estimate of r here?", options: ["0.6", "-0.6", "0.95", "0"], answer: 0, why: "Up (positive), and fairly loose: moderate, about 0.6." } },
  { head: "Correlation is not causation", pic: null, guide: "Cities with more fire trucks have more fires, r = 0.9.",
    say: "A strong r means two things move together. A lurking variable can drive both.", ask: { prompt: "What explains both the fire trucks and the fires?", options: ["City size", "Fire trucks start fires", "Fires buy fire trucks", "Nothing: it proves cause"], answer: 0, why: "Big cities have more of both." } }
];

export default {
  id: "stats-4-3-4-4-practice", title: "Practice: 4.3 and 4.4", warmSub: "Three quick review questions.",
  intro: "A warm-up, picture notes, then six short parts on scatterplots and correlation, two star tabs, then mixed practice that also brings back 4.1 and 4.2.",
  warm: [
    { text: "Of the 40 seniors, 10 bike to school. What percent?", answer: 25, input: "num", unit: "%" },
    { text: "Point (4, 9): how far across is it?", answer: 4, input: "num" },
    { text: "Which describes dots that rise left to right in a tight line?", answer: "strong, positive", opts: ["strong, positive", "weak, negative", "strong, negative"], input: "mc" }
  ],
  notes, parts: ["point", "role", "describe", "make", "rmatch", "cause"], stars: ["outlier", "compare"],
  mix: ["point", "role", "describe", "rmatch", "cause", "u41-read", "u41-pct", "u41-assoc", "u41-seg"],
  types: mixed, sims,
  bands: [[1, "Read a y-value on a grid of ones; explanatory only; direction only; r menu of -0.9, 0, 0.9."], [2, "x- or y-values on a grid of twos; strength added; r menu adds ±0.5."], [3, "The standard. Differences between points; which axis; strength, form and outliers; r menu of ±0.3, ±0.6, ±0.9."]],
  timing: [["Warm-up", "2-3 min", "3 easy review items, no lock."], ["Notes", "6-8 min", "Six picture cards, one question each. A tutorial: no huddle, no code."],
    ["Parts 1-6", "20-25 min", "About 3-4 min a part when the student gets three in a row quickly; the scatterplot maker (3 tasks) about 3 min. Each miss adds a fresh question."],
    ["★1, ★2", "6-8 min", "Extension. Same rule: three in a row."], ["Practice", "to the mark", "Mixed 4.1-4.4 questions at the standard until the end mark. End opens then."]]
};
