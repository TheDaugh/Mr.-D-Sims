/* Practice day 1 of Unit 4: lessons 4.1 (two-way tables) and 4.2 (association). Content only; checker/engine.js runs it. */
import { h, rnd, ri, pick, pct, tableEl, barsSvg } from "./util.js";

const CTX = [
  { who: "students", head: "Grade", lab: ["Senior", "Junior"], grp: ["seniors", "juniors"], cols: ["Job", "No job"], yes: "have a job" },
  { who: "students", head: "Lives in", lab: ["House", "Apartment"], grp: ["students in a house", "students in an apartment"], cols: ["Dog", "No dog"], yes: "have a dog" },
  { who: "students", head: "Grade level", lab: ["Underclass", "Upperclass"], grp: ["underclassmen", "upperclassmen"], cols: ["iPhone", "Other"], yes: "use an iPhone" },
  { who: "customers", head: "Time", lab: ["Morning", "Afternoon"], grp: ["morning customers", "afternoon customers"], cols: ["Coffee", "No coffee"], yes: "buy coffee" },
  { who: "players", head: "Team", lab: ["Varsity", "JV"], grp: ["varsity players", "JV players"], cols: ["Stretches", "Does not"], yes: "stretch before games" },
  { who: "students", head: "Grade", lab: ["Freshman", "Sophomore"], grp: ["freshmen", "sophomores"], cols: ["Bikes", "Does not"], yes: "bike to school" }
];

/* Band 1: small round groups (20 to 50), percents in tens. Band 2: groups to 120. Band 3: any group in fives, percents in fives,
   so answers need rounding. assoc: true = clearly different, false = the same percent. */
function makeTable(c, band, assoc) {
  const R = band === 1 ? [ri(2, 5) * 10, ri(2, 5) * 10] : band === 2 ? [ri(2, 12) * 10, ri(2, 12) * 10] : [ri(4, 24) * 5, ri(4, 24) * 5];
  const step = band === 3 ? 5 : 10, gap = band === 1 ? 40 : band === 2 ? 30 : 20;
  let p0 = ri(2, 8) * 10, p1;
  if (band === 3) p0 = ri(3, 17) * 5;
  if (assoc === false) p1 = p0; else if (assoc === true) { do { p1 = ri(1, Math.floor(95 / step)) * step; } while (Math.abs(p1 - p0) < gap); } else p1 = ri(1, Math.floor(90 / step)) * step;
  const yes = [Math.round(R[0] * p0 / 100), Math.round(R[1] * p1 / 100)];
  const n = [[yes[0], R[0] - yes[0]], [yes[1], R[1] - yes[1]]];
  return { c, n, R, C: [n[0][0] + n[1][0], n[0][1] + n[1][1]], N: R[0] + R[1] };
}
/* One percent question. Band 1 asks within a row only; band 2 adds "of all"; band 3 adds the column out-of and the one-cell (joint) question. */
function pctQ(t, band) {
  const c = t.c, r = ri(0, 1), kind = pick(band === 1 ? ["row"] : band === 2 ? ["row", "row", "all"] : ["row", "col", "all", "joint"]);
  if (kind === "row") return { text: `Of the ${c.grp[r]}, what percent ${c.yes}?`, part: t.n[r][0], outof: t.R[r], why: `the ${c.grp[r]} total` };
  if (kind === "col") return { text: `Of the ${c.who} who ${c.yes}, what percent are ${c.grp[r]}?`, part: t.n[r][0], outof: t.C[0], why: `the total of ${c.who} who ${c.yes}` };
  if (kind === "all") return { text: `What percent of all the ${c.who} ${c.yes}?`, part: t.C[0], outof: t.N, why: "the grand total, everyone" };
  return { text: `What percent of all the ${c.who} are ${c.grp[r]} who ${c.yes}?`, part: t.n[r][0], outof: t.N, why: "the grand total, everyone" };
}

const TYPES_ = [
  { id: "read", title: "Read the table", sub: "Find the row, find the column, read where they meet.", skill: "stats.4-1.read",
    make(b) {
      const t = makeTable(pick(CTX), b), c = t.c, r = ri(0, 1), col = ri(0, 1), k = b === 1 ? "cell" : pick(b === 2 ? ["cell", "row"] : ["cell", "row", "col"]);
      if (k === "cell") return { t, text: `How many ${c.grp[r]} are in the "${c.cols[col]}" column?`, answer: t.n[r][col], hint: `Find the ${c.lab[r]} row and the ${c.cols[col]} column. Read where they meet.` };
      if (k === "row") return { t, text: `How many ${c.grp[r]} were asked in all?`, answer: t.R[r], hint: `All the ${c.grp[r]} is the total at the end of the ${c.lab[r]} row.` };
      return { t, text: `How many ${c.who} in all are in the "${c.cols[col]}" column?`, answer: t.C[col], hint: `A whole column's total is in the Total row at the bottom of the ${c.cols[col]} column.` };
    }, input: "num", check: (q, v) => +v === q.answer },
  { id: "outof", title: "Pick the out-of", sub: "The out-of is the group right after \"Of the\". \"Of all\" means everyone.", skill: "stats.4-1.outof",
    make(b) {
      const t = makeTable(pick(CTX), b), p = pctQ(t, b);
      return { t, text: p.text + " Which number is the out-of?", answer: p.outof, opts: [...new Set([t.R[0], t.R[1], t.C[0], t.C[1], t.N])], hint: `Read the words after "Of the" (or "of all"). Here the out-of is ${p.why}.` };
    }, input: "mc", check: (q, v) => +v === q.answer },
  { id: "pct", title: "Percent from a table", sub: "percent = part ÷ out-of × 100. Round to a whole percent.", skill: "stats.4-1.percent",
    make(b) {
      const t = makeTable(pick(CTX), b), p = pctQ(t, b);
      return { t, text: p.text, answer: pct(p.part, p.outof), hint: `The out-of is ${p.why}: ${p.outof}. The part is ${p.part}. Divide, then times 100.` };
    }, input: "num", unit: "%", check: (q, v) => Math.abs(+v - q.answer) <= 1 },
  { id: "assoc", title: "Is there an association?", sub: "Compare percents, not counts.", skill: "stats.4-2.association",
    make(b) {
      const c = pick(CTX), a = rnd() < 0.5, t = makeTable(c, b, a), P = [pct(t.n[0][0], t.R[0]), pct(t.n[1][0], t.R[1])];
      const hi = P[0] >= P[1] ? 0 : 1, lo = 1 - hi;
      const right = a ? `There is an association. Of the ${c.grp[hi]}, ${P[hi]}% ${c.yes}, but of the ${c.grp[lo]}, only ${P[lo]}%.`
                      : `There is no association. ${P[0]}% of the ${c.grp[0]} and ${P[1]}% of the ${c.grp[1]} ${c.yes}.`;
      const big = t.n[0][0] >= t.n[1][0] ? 0 : 1;
      const wrong = [
        a ? `There is no association. ${P[0]}% of the ${c.grp[0]} and ${P[1]}% of the ${c.grp[1]} ${c.yes}.`
          : `There is an association. Of the ${c.grp[0]}, ${P[0]}% ${c.yes}, but of the ${c.grp[1]}, ${P[1] >= 40 ? P[1] - 30 : P[1] + 30}%.`,
        t.n[0][0] === t.n[1][0] ? `There is no association, because the two groups have different totals.` : `There is an association, because ${t.n[big][0]} ${c.grp[big]} ${c.yes} and only ${t.n[1 - big][0]} ${c.grp[1 - big]} do.`,
        `There is an association. ${pct(t.n[0][0], t.N)}% of all ${c.who} are ${c.grp[0]} who ${c.yes}.`
      ];
      return { t, text: `Is ${c.head.toLowerCase()} associated with whether they ${c.yes}? Pick the best answer.`, answer: right, opts: [right, ...wrong].sort(() => rnd() - 0.5),
        hint: `Turn each group into a percent of its own group. ${c.grp[0]}: ${t.n[0][0]} ÷ ${t.R[0]} = ${P[0]}%. ${c.grp[1]}: ${t.n[1][0]} ÷ ${t.R[1]} = ${P[1]}%. Same or different?` };
    }, input: "mc", check: (q, v) => v === q.answer },
  { id: "seg", title: "Read a segmented bar graph", sub: "Each bar is one group out of 100. Read where the line sits.", skill: "stats.4-2.segmented",
    make(b) {
      const c = pick(CTX), st = b === 3 ? 5 : 10, P = [ri(1, 100 / st - 1) * st, ri(1, 100 / st - 1) * st], r = ri(0, 1), ask = b === 1 ? "yes" : pick(["yes", "no"]);
      return { c, P, text: ask === "yes" ? `What percent of the ${c.grp[r]} ${c.yes}?` : `What percent of the ${c.grp[r]} do not ${c.yes}?`,
        answer: ask === "yes" ? P[r] : 100 - P[r], hint: `Find the line inside the ${c.lab[r]} bar and read the percent axis. The ${c.cols[0]} part is the shaded bottom; the rest of the bar is ${c.cols[1]}, and the bar adds to 100.` };
    }, input: "num", unit: "%", check: (q, v) => Math.abs(+v - q.answer) <= 2 }
];

const WARM_TABLE = { c: CTX[0], n: [[24, 16], [18, 42]], R: [40, 60], C: [42, 58], N: 100 };
const WARM = [
  { text: "How many seniors have a job?", t: WARM_TABLE, answer: 24, input: "num" },
  { text: "12 out of 40 is what percent?", answer: 30, input: "num", unit: "%" },
  { text: "Of the seniors, what percent have a job? Pick the out-of.", t: WARM_TABLE, answer: 40, opts: [100, 40, 42], input: "mc" }
];

const STARS_ = [
  { id: "undo", title: "★ Undo it: percent to count", sub: "count = percent ÷ 100 × out-of.", skill: "stats.4-2.undo",
    make() {
      const c = pick(CTX), r = ri(0, 1), R = ri(4, 24) * 5, p = ri(1, 19) * 5, n = Math.round(R * p / 100);
      return { c, P: r === 0 ? [p, ri(1, 19) * 5] : [ri(1, 19) * 5, p], text: `There are ${R} ${c.grp[r]}. Read their bar. How many of them ${c.yes}?`, answer: n,
        hint: `Their bar says ${p}%. Undo the × 100: ${p} ÷ 100 = ${p / 100}. Undo the ÷ out-of: ${p / 100} × ${R}.` };
    }, input: "num", check: (q, v) => Math.abs(+v - q.answer) <= 0.5 },
  { id: "error", title: "★ Spot the mistake", sub: "Read the student's claim and find what went wrong.", skill: "stats.4-2.error",
    make() {
      const t = makeTable(pick(CTX), 3), c = t.c, r = ri(0, 1), kind = pick(["total", "count", "col", "none"]);
      let claim, answer;
      const D = { total: "Used the grand total as the out-of instead of the group's total", count: "Compared counts instead of percents", col: "Used the wrong group as the out-of (the column, not the row)", none: "Nothing is wrong" };
      if (kind === "total") { claim = `"Of the ${c.grp[r]}, ${pct(t.n[r][0], t.N)}% ${c.yes}, because ${t.n[r][0]} ÷ ${t.N}."`; answer = D.total; }
      else if (kind === "col") { claim = `"Of the ${c.grp[r]}, ${pct(t.n[r][0], t.C[0])}% ${c.yes}, because ${t.n[r][0]} ÷ ${t.C[0]}."`; answer = D.col; }
      else if (kind === "count") { const big = t.n[0][0] >= t.n[1][0] ? 0 : 1; claim = `"${c.grp[big][0].toUpperCase() + c.grp[big].slice(1)} are more likely to ${c.yes.replace(/^have /, "have ")}, because ${t.n[big][0]} is more than ${t.n[1 - big][0]}."`; answer = D.count; }
      else { claim = `"Of the ${c.grp[r]}, ${pct(t.n[r][0], t.R[r])}% ${c.yes}, because ${t.n[r][0]} ÷ ${t.R[r]}."`; answer = D.none; }
      if (kind === "count" && pct(t.n[0][0], t.R[0]) === pct(t.n[1][0], t.R[1]) && t.n[0][0] === t.n[1][0]) return this.make();
      return { t, text: `A student says: ${claim} What is wrong?`, answer, opts: Object.values(D).sort(() => rnd() - 0.5),
        hint: kind === "none" ? `Check it: the out-of for "Of the ${c.grp[r]}" is ${t.R[r]}, and the part is ${t.n[r][0]}. Does the claim use those?` : `Ask two things: which number is the out-of here, and is the claim comparing percents or counts?` };
    }, input: "mc", check: (q, v) => v === q.answer }
];

const PET = { c: Object.assign({}, CTX[0], { cols: ["Pet", "No pet"], yes: "have a pet" }), n: [[20, 20], [30, 30]], R: [40, 60], C: [50, 50], N: 100 };
const NOTES = [
  { head: "A two-way table counts people two ways at once", pic: () => tableEl(WARM_TABLE), guide: "Each row is a group (seniors, juniors). Each column is an answer (job, no job). The Total row and column add them up.",
    say: "To read a count, find the row, find the column, and read where they meet.",
    ask: { prompt: "How many juniors have no job?", options: ["42", "18", "60", "58"], answer: 0, why: "Junior row, No job column: 42." } },
  { head: "Every percent is out of some group", pic: () => tableEl(WARM_TABLE), guide: "Same table. The senior total is 40, the job total is 42, the grand total is 100.",
    say: "The out-of is the group right after \"Of the\". \"Of all\" means everyone, the grand total.",
    ask: { prompt: "\"Of the seniors, what percent have a job?\" What is the out-of?", options: ["40, the seniors", "100, everyone", "42, the job-holders", "24"], answer: 0, why: "\"Of the seniors\" means out of the 40 seniors." } },
  { head: "percent = part ÷ out-of × 100", pic: () => tableEl(WARM_TABLE), guide: "The part is the seniors who have a job: 24. The out-of is the seniors: 40.",
    say: "Divide the part by the out-of, then multiply by 100.",
    ask: { prompt: "Of the seniors, what percent have a job?", options: ["60%", "24%", "57%", "40%"], answer: 0, why: "24 ÷ 40 = 0.6, and 0.6 × 100 = 60%." } },
  { head: "Compare percents, not counts", pic: () => tableEl(PET), guide: "The same 100 students and pets. More juniors have pets (30 against 20), but there are more juniors too.",
    say: "Turn each group into a percent of its own group. Different percents: associated. The same: not associated.",
    ask: { prompt: "20 of 40 seniors and 30 of 60 juniors have a pet. Is grade associated with having a pet?", options: ["No. Both are 50%.", "Yes. 30 is more than 20.", "Yes. Juniors are a bigger group.", "No. Pets are not a grade."], answer: 0, why: "20 ÷ 40 = 50% and 30 ÷ 60 = 50%. Same percent, no association." } },
  { head: "A segmented bar graph shows the percents", pic: () => barsSvg(CTX[0], [60, 30], { labels: true }), guide: "One bar per group, each stretched to 100. The shaded bottom is the job part; the line inside the bar sits at its percent.",
    say: "Lines at different heights mean the variables are associated. Level lines mean they are not.",
    ask: { prompt: "What does this graph show?", options: ["An association: 60% of seniors have a job, but only 30% of juniors.", "No association: both bars reach 100.", "More juniors have jobs.", "60 seniors have a job."], answer: 0, why: "The lines sit at 60 and 30. Different heights, so grade and having a job are associated." } },
  { head: "Say it with both percents", pic: () => barsSvg(CTX[0], [60, 30], { labels: true }), guide: "This is the sentence the test asks for.",
    say: "There is an association. Of the ___, ___% ___, but of the ___, only ___%.",
    ask: { prompt: "Which sentence is complete?", options: ["There is an association. Of the seniors, 60% have a job, but of the juniors, only 30%.", "There is an association.", "Seniors have more jobs.", "There is an association because 24 is more than 18."], answer: 0, why: "It says yes or no, and gives both percents as the reason." } }
];

/* engine shape: q.pic holds the pictures; checks become tolerances */
const asType = (T) => ({ title: T.title, sub: T.sub, skill: T.skill, input: T.input, unit: T.unit,
  tol: T.id === "pct" ? 1 : T.id === "seg" ? 2 : T.id === "undo" ? 0.5 : 0,
  make(b) { const q = T.make(b); q.pic = [q.t ? tableEl(q.t) : null, q.c && q.P ? barsSvg(q.c, q.P) : null].filter(Boolean); return q; } });
const types = Object.fromEntries([...TYPES_, ...STARS_].map(T => [T.id, asType(T)]));

/* Part 4 is a sim: build the segmented bars for two tables (sliders, within 1 point of each group's percent). */
const sims = { build: { title: "Build the bars", sub: "Work out each group's percent, then slide the line in its bar to that percent.", skill: "stats.4-2.build",
  run(app, done, api) {
    const ST = api.state; ST.build = ST.build || 0; const KEY = api.key, save = api.save;
const rounds = 2, wrap = h("div");
  app.append(h("div", { class: "card text" }, "Build the segmented bar graph for each table. Work out each group's percent, then slide the line in its bar to that percent."), wrap);
  function round() {
    const c = pick(CTX), t = makeTable(c, ST.build === 0 ? 2 : 3), P = [pct(t.n[0][0], t.R[0]), pct(t.n[1][0], t.R[1])], cur = [50, 50];
    const svgHost = h("div"), status = h("div", { class: "fb no" }, "Not yet. Each bar's line should sit at that group's percent.");
    const draw = () => svgHost.replaceChildren(barsSvg(c, cur));
    let doneR = false;
    const test = () => { if (doneR) return; if (Math.abs(cur[0] - P[0]) <= 1 && Math.abs(cur[1] - P[1]) <= 1) { doneR = true; status.className = "fb ok"; status.textContent = "✔ That matches the table."; ST.build++; save(); setTimeout(() => { if (ST.build >= rounds) done(); else { wrap.replaceChildren(); round(); } }, 900); } };
    const sliders = [0, 1].map(i => { const r = h("input", { type: "range", min: 0, max: 100, step: 1, value: 50, "aria-label": c.lab[i] + " line" }), v = h("div", { class: "val" }, "50%");
      r.addEventListener("input", () => { cur[i] = +r.value; v.textContent = r.value + "%"; draw(); test(); }); return h("div", { class: "sliderrow" }, h("b", {}, c.lab[i] + ": " + c.cols[0]), r, v); });
    const card = h("div", { class: "card" }, h("div", { class: "q" }, `Table ${ST.build + 1} of ${rounds}`), tableEl(t), svgHost, ...sliders, status,
      h("div", { class: "row" }, h("button", { class: "btn ghost", onclick: (e) => e.currentTarget.after(h("div", { class: "hintbox" }, `💡 ${c.grp[0]}: ${t.n[0][0]} ÷ ${t.R[0]}. ${c.grp[1]}: ${t.n[1][0]} ÷ ${t.R[1]}. Times 100 each.`)) }, "💡 Hint")));
    if (KEY) card.append(h("div", { class: "keyline" }, h("b", {}, "KEY "), `${c.lab[0]} ${P[0]}%, ${c.lab[1]} ${P[1]}%`));
    wrap.append(card); draw();
  }
  round();
  } } };

export default {
  id: "stats-4-1-4-2-practice", title: "Practice: 4.1 and 4.2", warmSub: "Three quick review questions from 4.1.",
  intro: "A warm-up, picture notes, then six short parts on two-way tables and association, two star tabs, then mixed practice.",
  warm: WARM.map(w => Object.assign({}, w, { pic: w.t ? () => tableEl(w.t) : null })),
  notes: NOTES, parts: ["read", "outof", "pct", "build", "assoc", "seg"], stars: ["undo", "error"], mix: ["read", "outof", "pct", "assoc", "seg"],
  types, sims,
  bands: [[1, "Groups of 20 to 50, percents in tens; only \"Of the [group]\" questions; association gaps of 40 points or none."], [2, "Groups up to 120; adds \"of all\" questions and row totals; gaps of 30."], [3, "The standard. Groups in fives, percents in fives (rounding); column out-of and one-cell questions; gaps of 20; graphs in fives."]],
  timing: [["Warm-up", "2-3 min", "3 easy review items from 4.1, no lock."], ["Notes", "6-8 min", "Six picture cards, one question each. A tutorial: no huddle, no code."],
    ["Parts 1-6", "20-25 min", "About 3-4 min a part when the student gets three in a row quickly; the bar builder about 4 min. Each miss adds a fresh question."],
    ["★1, ★2", "6-8 min", "Extension. Same rule: three in a row."], ["Practice", "to the mark", "Mixed questions at the standard until the end mark (42 min Mon-Thu, the bell Friday). End opens then."]]
};
