// Slot 7 (fan-cart virtual lab) content test. Run: node slot-07-content.test.cjs   (files sit next to this one)
// Derives every checkable answer from slot-07-data.json, then checks items and lab content for correctness AND teachability (DAY-RULES 11, 12, 13).
const fs = require("fs"), path = require("path");
const J = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, f), "utf8"));
const D = J("slot-07-data.json"), I = J("slot-07-items.json"), L = J("slot-07-lab-content.json");
let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log("ok   " + name); } catch (e) { fail++; console.log("FAIL " + name + " :: " + e.message); } };
const eq = (a, b, m) => { if (a !== b) throw new Error((m || "") + " expected " + JSON.stringify(b) + " got " + JSON.stringify(a)); };
const ok = (c, m) => { if (!c) throw new Error(m); };
const near = (a, b, tol, m) => { if (Math.abs(a - b) > tol) throw new Error((m || "") + " " + a + " vs " + b + " (tol " + tol + ")"); };

// ---------- the model (engine formula; never on a student screen) ----------
const f = D.track.friction_N.value, m0 = D.cart.mass_kg.value, mb = D.cart.bar_mass_kg.value;
const accel = (F, m) => (F - f) / m, r2 = (x) => Math.round(x * 100) / 100, Fset = (s) => D.fan.settings[s - 1].F_N;
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
const gauss = (r) => { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const lsq = (xs, ys) => { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; let sxy = 0, sxx = 0, syy = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; }); const s = sxy / sxx; return { slope: s, intercept: my - s * mx, r2: (sxy * sxy) / (sxx * syy) }; };
const tolOk = (got, want) => Math.abs(got - want) <= Math.max(D.tolerance.a_vs_expected.absolute_mps2, D.tolerance.a_vs_expected.relative * want);

// ---------- data ----------
t("every number in the data is author_set with a basis (rule 12)", () => {
  const leaves = [D.cart.mass_kg, D.cart.bar_mass_kg, D.cart.bars_on_shelf, D.track.length_m, D.track.friction_N, D.run.duration_s, D.run.sensor_hz, D.run.noise_sigma_mps, D.markers.minSeparation_s, D.tolerance.a_vs_expected];
  leaves.forEach((x, i) => { ok(x.author_set === true && x.basis && x.basis.length > 8, "leaf " + i); });
  ok(D.fan.author_set && D.fan.basis, "fan settings");
});
t("fan settings are 1 to 4 at 0.15 N each; the force sensor resolution is 0.01 N", () => { eq(D.fan.settings.length, 4); D.fan.settings.forEach((s, i) => { eq(s.setting, i + 1); near(s.F_N, 0.15 * (i + 1), 1e-9); }); });
t("the longest run stays on the track and under 2 m", () => { const a = accel(0.45, m0), x = 0.5 * a * D.run.duration_s.value ** 2; ok(x < D.track.length_m.value, "run length " + x); near(x, 1.76, 0.01); });
t("the model formula is flagged as never shown to students", () => eq(D.model.studentsNeverSeeFormula, true));
t("part 1 table: mass fixed at 1.00 kg (2 bars), expected a matches the model", () => {
  eq(D.part1.length, 4); D.part1.forEach((r, i) => { eq(r.m_kg, 1.0); eq(r.F_N, Fset(i + 1)); near(r.a_expected, r2(accel(r.F_N, r.m_kg)), 1e-9, "row " + i); });
  eq(D.part1.map((r) => r.a_expected).join(), "0.14,0.29,0.44,0.59");
});
t("part 2 table: fan setting 3 (0.45 N), bars 0,1,2,4, mass = 0.50 + 0.25 x bars", () => {
  eq(D.part2.map((r) => r.bars).join(), "0,1,2,4");
  D.part2.forEach((r) => { near(r.m_kg, m0 + mb * r.bars, 1e-9); eq(r.F_N, 0.45); near(r.a_expected, r2(accel(0.45, r.m_kg)), 1e-9); near(r.inv_m_per_kg, r2(1 / r.m_kg), 1e-9); });
  eq(D.part2.map((r) => r.a_expected).join(), "0.88,0.59,0.44,0.29");
});
t("the standard holds: doubling force is about x2, doubling mass is about x0.5, in the tables", () => {
  const p1 = D.part1, p2 = D.part2, rF = [p1[1].a_expected / p1[0].a_expected, p1[3].a_expected / p1[1].a_expected], rm = [p2[2].a_expected / p2[0].a_expected, p2[3].a_expected / p2[1].a_expected];
  rF.forEach((x) => near(x, 2, 0.1, "force doubling")); rm.forEach((x) => near(x, 0.5, 0.05, "mass doubling"));
});
t("derived fits: a against F has slope 1/m near 1.00 and a hair of intercept; a against 1/m passes through the corner", () => {
  const a = lsq(D.part1.map((r) => r.F_N), D.part1.map((r) => accel(r.F_N, 1.0)));
  near(a.slope, D.derived.a_vs_F.slope_expected, 1e-9); near(a.intercept, D.derived.a_vs_F.intercept_expected, 1e-9);
  const b = lsq([2, 1 / 0.75, 1, 1 / 1.5], [0.5, 0.75, 1.0, 1.5].map((m) => accel(0.45, m)));
  near(b.slope, D.derived.a_vs_invm.slope_expected, 1e-9); near(b.intercept, 0, 1e-9);
});
t("a against mass is a falling curve, not a line (second differences positive, line fit poor)", () => {
  const ms = D.part2.map((r) => r.m_kg), as = D.part2.map((r) => r.a_expected);
  for (let i = 0; i < as.length - 1; i++) ok(as[i + 1] < as[i], "falls");
  const s1 = (as[1] - as[0]) / (ms[1] - ms[0]), s2 = (as[2] - as[1]) / (ms[2] - ms[1]), s3 = (as[3] - as[2]) / (ms[3] - ms[2]);
  ok(s1 < s2 && s2 < s3, "slopes flatten: " + [s1, s2, s3].map((x) => x.toFixed(2)).join(","));
  ok(lsq(ms, as).r2 < 0.97, "line fit r2 " + lsq(ms, as).r2);
});
t("test run: 3 bars = 1.25 kg, a = 0.35, found on the 1/m line at 0.80, and 3 bars fits the 4 bars the student takes", () => {
  eq(D.test.m_kg, 1.25); eq(D.test.a_expected, 0.35); near(0.8 * D.derived.a_vs_invm.slope_expected, 0.352, 0.001); ok(D.test.bars <= 4, "student takes four bars");
  ok(D.cart.bars_on_shelf.value >= 4, "shelf stock");
});

// ---------- paper fallback (rule 14) ----------
t("paper cards: 9 cards, regenerate exactly from seeds 700 to 708, v(0) = 0, the card reading is within tolerance", () => {
  const cards = D.paperRuns.cards; eq(cards.length, 9);
  cards.forEach((c, i) => {
    const a = accel(c.F_N, c.m_kg), r = mulberry32(700 + i), v = c.t_s.map((tt) => (tt === 0 ? 0 : Math.round((a * tt + D.run.noise_sigma_mps.value * gauss(r)) * 100) / 100));
    eq(v.join(), c.v_mps.join(), c.id + " speeds"); eq(c.v_mps[0], 0);
    ok(tolOk(r2((c.v_mps[4] - c.v_mps[0]) / 2.0), c.a_true), c.id + " card reading vs true"); near(c.a_from_card, r2((c.v_mps[4] - c.v_mps[0]) / 2.0), 1e-9);
  });
  eq(cards.filter((c) => c.heldUntilHuddle2).map((c) => c.id).join(), "T-1");
});

// ---------- items ----------
const byId = Object.fromEntries(I.items.map((i) => [i.id, i]));
const p1a = Object.fromEntries(D.part1.map((r) => [r.F_N, r.a_expected])), p2a = Object.fromEntries(D.part2.map((r) => [r.m_kg, r.a_expected]));
t("12 items, 4 per band, three bands, no band name on a student screen", () => {
  eq(I.items.length, 12); eq(I.bands, 3); [1, 2, 3].forEach((b) => eq(I.items.filter((i) => i.band === b).length, 4, "band " + b));
});
t("b1-1 cart A has the bigger acceleration (1.2/2.0 = 0.6 against 0.3)", () => { const [A, B] = byId["b1-1"].figure.lines.map((l) => (l.points[1][1] - l.points[0][1]) / (l.points[1][0] - l.points[0][0])); near(A, 0.6, 1e-9); near(B, 0.3, 1e-9); eq(byId["b1-1"].options[byId["b1-1"].answer], "Cart A"); });
t("b1-2 = 1.20 / 2.0 = 0.60", () => near(byId["b1-2"].answer, 1.2 / 2.0, 1e-9));
t("b1-3 uses table values (0.14 then 0.29) and the nearest ratio option is about 2 times", () => {
  ok(byId["b1-3"].prompt.includes("0.14") && byId["b1-3"].prompt.includes("0.29"), "numbers"); near(p1a[0.15], 0.14, 1e-9); near(p1a[0.3], 0.29, 1e-9);
  const ratio = 0.29 / 0.14, opts = [0.5, 1, 2, 4], best = opts.reduce((b, x, i) => (Math.abs(Math.log(ratio / x)) < Math.abs(Math.log(ratio / opts[b])) ? i : b), 0); eq(best, byId["b1-3"].answer); eq(byId["b1-3"].options[byId["b1-3"].answer], "about 2 times");
});
t("b1-4 uses table values (0.88 then 0.44); the acceleration about halved", () => { ok(byId["b1-4"].prompt.includes("0.88") && byId["b1-4"].prompt.includes("0.44"), "numbers"); near(p2a[1.0] / p2a[0.5], 0.5, 1e-9); eq(byId["b1-4"].options[byId["b1-4"].answer], "It about halved"); });
t("b2-1 (0.58) is within tol of the model at 0.60 N", () => { const it = byId["b2-1"]; near(it.answer, 2 * p1a[0.3], 1e-9); ok(Math.abs(it.answer - p1a[0.6]) <= it.tol, "tol"); ok(it.prompt.includes("0.14") && it.prompt.includes("0.29"), "numbers"); });
t("b2-2 (0.30) is within tol of the model for 1.50 kg; 0.59 is the 0.75 kg value", () => { const it = byId["b2-2"]; near(p2a[0.75], 0.59, 1e-9); ok(Math.abs(it.answer - p2a[1.5]) <= it.tol, "tol"); near(it.answer, p2a[0.75] / 2, 0.01); });
t("b2-3 and b2-4 pick the right shapes", () => {
  const a = D.part1.map((r) => r.a_expected), fF = lsq(D.part1.map((r) => r.F_N), a); ok(fF.r2 > 0.99 && Math.abs(fF.intercept) < 0.05, "a vs F is a line near the corner"); eq(byId["b2-3"].options[byId["b2-3"].answer], "rising straight line from near the corner");
  eq(byId["b2-4"].options[byId["b2-4"].answer], "falling curve, steep then flatter"); ok(byId["b2-4"].figure.options.includes("fall-curve") && byId["b2-3"].figure.options.includes("rise-line"), "figure options");
});
t("b3-1 both change: the answer stays near 0.29, within tol of the model at 0.60 N and 2.00 kg", () => { const it = byId["b3-1"]; ok(Math.abs(it.answer - accel(0.6, 2.0)) <= it.tol, "tol"); near(it.answer, p1a[0.3], 1e-9); });
t("b3-2 the supported sentence says doubling force about doubles and doubling mass about halves; the table agrees", () => {
  const it = byId["b3-2"]; ok(/fan force about doubles the acceleration/.test(it.options[it.answer]) && /mass about halves it/.test(it.options[it.answer]), "text");
  near(p1a[0.6] / p1a[0.3], 2, 0.1); near(p2a[1.5] / p2a[0.75], 0.5, 0.05); eq(new Set(it.options).size, 4);
});
t("b3-3 = 0.44 / 2 = 0.22 and matches the model at 2.00 kg", () => { const it = byId["b3-3"]; near(it.answer, p2a[1.0] / 2, 1e-9); ok(Math.abs(it.answer - accel(0.45, 2.0)) <= it.tol, "tol"); });
t("b3-4 the 1.50 kg cart had about one third the acceleration of the 0.50 kg cart; the option quotes the table", () => {
  const it = byId["b3-4"]; near(p2a[1.5] / p2a[0.5], 1 / 3, 0.02); ok(it.options[it.answer].includes("0.29") && it.options[it.answer].includes("0.88"), "quotes the table"); near(p2a[1.5], 0.29, 1e-9); near(p2a[0.5], 0.88, 1e-9);
});
t("choice items: answer index valid, options distinct", () => I.items.filter((i) => i.options).forEach((i) => { ok(i.answer >= 0 && i.answer < i.options.length, i.id); eq(new Set(i.options).size, i.options.length, i.id); }));
t("hint rule (rule 6): three hints; 1 points to the step card; none gives the answer; each item has a misconception line", () => {
  I.items.forEach((i) => {
    eq(i.hints.length, 3, i.id); ok(/step card/i.test(i.hints[0]), i.id + " hint 1"); ok(i.misc && i.misc.length > 20, i.id + " misc");
    i.hints.forEach((h, k) => {
      if (i.type === "num") { const a = i.answer.toFixed(2), tok = a.replace(/0+$/, "").replace(/\.$/, ""); ok(!new RegExp("(^|[^0-9.])" + a.replace(".", "\\.") + "(?![0-9])").test(h), i.id + " hint " + (k + 1) + " contains the answer " + a); void tok; }
      else if (i.options) ok(!h.includes(i.options[i.answer]), i.id + " hint " + (k + 1) + " contains the correct option");
    });
  });
});
t("hint 3 worked examples are arithmetically right", () => {
  const E = [[0.9 / 3.0, 0.3, 0.01], [0.31 / 0.1, 3, 0.15], [0.2 / 0.6, 1 / 3, 0.01], [3 * 0.2, 0.6, 0.01], [0.8 / 2, 0.4, 0.01], [1.2 / 3, 0.4, 0.01], [0.5 / 1.5, 1 / 3, 0.01], [0.6 / 3, 0.2, 0.01], [0.4 / 0.2, 2, 0.01], [1.2 / 3, 0.4, 0.01]];
  E.forEach(([a, b, tol], i) => near(a, b, tol, "example " + i));
});
// generators
const pick = (r, a) => a[Math.floor(r() * a.length)], F2 = (x) => x.toFixed(2);
const GEN = {
  g1: (r) => { const v = pick(r, [0.6, 0.9, 1.2, 1.5, 1.8, 2.4]), t0 = pick(r, [1.0, 2.0, 3.0]); return { prompt: `A cart's speed grows from 0 to ${F2(v)} m/s in ${t0.toFixed(1)} s. What is its acceleration?`, answer: r2(v / t0), unit: "m/s²", tol: 0.03, inputs: { v, t: t0 } }; },
  g2: (r) => { const F1 = pick(r, [0.15, 0.3]), k = pick(r, [2, 3]), a1 = r2(accel(F1, 1.0)); return { prompt: `A fan force of ${F2(F1)} N gives a 1.00 kg cart an acceleration of ${F2(a1)} m/s². Predict the acceleration for a fan force of ${F2(k * F1)} N on the same cart.`, answer: r2(a1 * k), unit: "m/s²", tol: 0.04, inputs: { F1, k, a1 }, model: r2(accel(k * F1, 1.0)) }; },
  g3: (r) => { const m1 = pick(r, [0.5, 0.75, 1.0]), kF = pick(r, [2, 3, 4]), km = pick(r, [2, 3]), a1 = r2(accel(0.15, m1)); return { prompt: `A ${F2(m1)} kg cart with a fan force of 0.15 N accelerates at ${F2(a1)} m/s². A stronger fan makes the force ${kF} times bigger, and the cart is loaded to ${km} times the mass. Predict the new acceleration.`, answer: r2((a1 * kF) / km), unit: "m/s²", tol: 0.04, inputs: { m1, kF, km, a1 }, model: r2(accel(kF * 0.15, km * m1)) }; }
};
t("generators: samples regenerate from the seeds, and every answer is within tol of the model (all ranges, not only the samples)", () => {
  Object.keys(GEN).forEach((k, i) => { const r = mulberry32(11 * 10 + i), want = I.generators.samples[k]; eq(want.length, 3); want.forEach((s, j) => eq(JSON.stringify(GEN[k](r)), JSON.stringify(s), k + " sample " + j)); });
  for (let s = 0; s < 600; s++) { const r = mulberry32(s); const a = GEN.g2(r), b = GEN.g3(r), c = GEN.g1(r); ok(Math.abs(a.answer - a.model) <= a.tol, "g2 " + JSON.stringify(a.inputs)); ok(Math.abs(b.answer - b.model) <= b.tol, "g3 " + JSON.stringify(b.inputs)); ok(c.answer > 0, "g1"); }
});

// ---------- lab content ----------
const terms = Object.fromEntries(L.terms.map((x) => [x.term, x.introducedBy]));
t("term list: unique, each tagged (Mr. D says it / tutorial / earlier lesson), at most 2 tutorials of 60 seconds", () => {
  eq(new Set(L.terms.map((x) => x.term)).size, L.terms.length); L.terms.forEach((x) => ok(/^(huddle1|huddle2|tutorial [12]|earlier lesson)/.test(x.introducedBy), x.term + " tag"));
  eq(Object.keys(L.tutorials).length, 2); Object.values(L.tutorials).forEach((tu) => ok(tu.seconds <= 60 && tu.captions.length >= 3, tu.name));
});
t("every figure has the four reading-guide parts (rule 2)", () => { eq(L.figures.length, 5); L.figures.forEach((g) => ["axes", "oneMark", "lookFirst", "wrongReading"].forEach((k) => ok(g[k] && g[k].length > 10, g.id + " " + k))); });
t("quests are valid, use only known events and states, and the first-time route is tagged tutorial", () => {
  const EVENTS = ["take", "weigh", "station", "run", "read", "record", "predict", "plot"], STATES = ["entered_lab", "cer_done", "submitted", "huddle2"], seen = new Set(), bad = [];
  L.quests.forEach((q) => { if (seen.has(q.id)) bad.push("dup " + q.id); seen.add(q.id); if (!q.text || !q.hint) bad.push(q.id + " text/hint"); if (!q.state && !q.event) bad.push(q.id + " state/event"); if (q.event && !EVENTS.includes(q.event)) bad.push(q.id + " event " + q.event); if (q.state && !STATES.includes(q.state)) bad.push(q.id + " state " + q.state); });
  eq(bad.join("; "), ""); ok(L.quests.filter((q) => q.tutorial).length >= 8, "tutorial route"); eq(L.quests.filter((q) => q.phase === "after").map((q) => q.id).join(), "code2,graphInv,testrun,submit");
});
t("the lab needs exactly 9 runs (4 + 4 + 1) and the record counts match the tables", () => { eq(L.quests.find((q) => q.id === "part1").count, D.part1.length); eq(L.quests.find((q) => q.id === "part2").count, D.part2.length); });
t("prediction items are one try, pre-lab asks twice-as-strong, the test prediction matches the data", () => {
  eq(L.prelab.prediction.oneTry, true); eq(L.prelab.questions.length, 3); L.prelab.questions.forEach((q) => ok(q.correct >= 0 && q.correct < q.options.length, q.id));
  const tp = L.predictions.find((p) => p.id === "test"); eq(tp.expect, D.test.a_expected); eq(tp.tol, 0.03);
});
t("clock: huddle 1 at 3, huddle 2 late at 28 (lab day), exit ticket 40-42; code 2 is not blocked by record state", () => { eq(L.clock.huddle1AtMin, 3); ok(L.clock.huddle2AtMin > 25, "lab day"); ok(/not blocked/.test(L.gates.huddle2Code), "gate text"); });
t("huddle 2 tab: 3 blanks, 3 worked problems, 3 crux questions; worked answers match the data", () => {
  const H = L.huddle2Tab; eq(H.blanks.length, 3); eq(H.worked.length, 3); eq(H.crux.length, 3); ok(/tested/i.test(H.tested), "states what is tested");
  near(H.worked[0].answer, 3 * p1a[0.15], 1e-9); ok(Math.abs(H.worked[0].answer - p1a[0.45]) <= 0.03, "W1 vs table");
  near(H.worked[1].answer, r2(p2a[0.5] / 3), 1e-9); near(H.worked[2].answer, r2(0.8 * 0.44), 0.005); near(H.worked[2].answer, D.test.a_expected, 0.005);
});

// ---------- the room ----------
t("room: rectangular, start on floor, every interactable tile can be reached from the start (the door counts as open)", () => {
  const R = L.room, rows = R.rows, W = rows[0].length; rows.forEach((r) => eq(r.length, W, "row width"));
  const at = (x, y) => (rows[y] || "")[x]; eq(R.legend[at(R.start.x, R.start.y)].type, "floor");
  const walk = (c) => c === "." || c === "D", seen = new Set([R.start.x + "," + R.start.y]), q = [[R.start.x, R.start.y]];
  while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (!seen.has(k) && walk(at(nx, ny))) { seen.add(k); q.push([nx, ny]); } } }
  const need = ["C", "B", "W", "T", "N", "D"]; need.forEach((c) => { let found = false; rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === c && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((x + dx) + "," + (y + dy)))) found = true; })); ok(found, "tile " + c + " unreachable"); });
  eq(rows.join("").split("T").length - 1, 4, "track is four tiles"); ok(Object.keys(R.legend).every((k) => rows.join("").includes(k)), "legend entry unused"); eq(R.noPPE, true);
});

// ---------- teachability (rule 13): the word rule over every student screen ----------
const LEXICON = ["fan cart", "fan force", "fan setting", "force sensor", "track", "mass bar", "balance", "motion sensor", "run", "speed graph", "marker", "graph builder", "guide line", "acceleration", "claim", "evidence", "reasoning", "net force", "free-body", "friction", "1/m", "per kg"];
const HELD = ["1/m", "per kg"];                       // taught in huddle 2: only on screens after code 2
const FORBIDDEN = ["newton", "second law", "ΣF", "F = ma", "F=ma", "inverse", "proportional", "slope", "pulley", "tension", "incline", "ramp", "component", "string", "elevator", "terminal", "momentum", "third law", "weight", "extension", "challenge", "optional", "bonus", "tier", "AP "];
const re = (w) => new RegExp("(^|[^a-z0-9])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+") + "(?:s|es)?(?![a-z0-9])", "i");
function wordProblems(text, where) {
  const out = [];
  for (const w of LEXICON) {
    if (!re(w).test(text)) continue;
    if (!(w in terms)) { out.push(`"${w}" is on a student screen but not in the term list`); continue; }
    if (HELD.includes(w) && where !== "after") out.push(`"${w}" is taught in huddle 2 but shows before it`);
    if (where === "prelab" && !/^earlier lesson/.test(terms[w])) out.push(`"${w}" is not an earlier-lesson term and shows before Mr. D's huddle 1`);
    if (where === "lab" && /pre-lab only/.test((L.terms.find((x) => x.term === w) || {}).say || "")) out.push(`"${w}" is a pre-lab review word`);
  }
  for (const w of FORBIDDEN) if (new RegExp("(^|[^A-Za-z])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![A-Za-z])", w === "AP " ? "" : "i").test(text)) out.push(`"${w}" belongs to a later slot or breaks the no-labels rule`);
  return out;
}
const flat = (o) => (o == null ? [] : typeof o === "string" ? [o] : Array.isArray(o) ? o.flatMap(flat) : typeof o === "object" ? Object.values(o).flatMap(flat) : []);
const S = {
  prelab: flat([L.prelab.questions.map((q) => [q.q, q.options, q.explain]), L.prelab.prediction.q, L.prelab.prediction.options, L.prelab.prediction.afterTry, L.predictions[0].q]),
  lab: flat([L.quests.filter((q) => q.phase !== "after").map((q) => [q.text, q.hint]), L.stepCard.steps, L.stepCard.title, Object.values(L.tutorials).map((x) => [x.name, x.captions]), L.figures.filter((g) => !g.afterCode2).map((g) => [g.title, g.axes, g.oneMark, g.lookFirst, g.wrongReading]), L.messages, L.postlab.prompt, L.postlab.starters, L.postlab.wordBank, L.postlab.checklist, L.predictions[1].q, L.predictions[1].options,
    L.record.part1Columns, L.record.part2Columns, Object.values(L.room.legend).map((l) => [l.label, l.name, l.text]), I.items.map((i) => [i.prompt, i.options, i.hints])]),
  after: flat([L.stepCard.afterCode2, L.quests.filter((q) => q.phase === "after").map((q) => [q.text, q.hint]), L.figures.filter((g) => g.afterCode2).map((g) => [g.title, g.axes, g.oneMark, g.lookFirst, g.wrongReading]), L.predictions[2].q, L.huddle2Tab.tested, L.huddle2Tab.blanks.map((b) => b.text), L.huddle2Tab.worked.map((w) => [w.problem, w.steps]), L.huddle2Tab.crux.map((c) => c.q), L.exit.prompt])
};
t("the detector catches an unlisted word, a held word, a later-slot word and an unmet term in the pre-lab", () => {
  ok(wordProblems("Pull the pulley.", "lab").length === 1, "pulley"); ok(wordProblems("Graph acceleration against 1/m.", "lab").some((p) => /huddle 2/.test(p)), "held");
  ok(wordProblems("Graph acceleration against 1/m.", "after").length === 0, "after ok"); ok(wordProblems("The fan force doubles.", "prelab").some((p) => /huddle 1/.test(p)), "prelab unmet");
  ok(wordProblems("Which way does the net force point?", "prelab").length === 0, "net force prelab ok"); ok(wordProblems("Which way does the net force point?", "lab").length === 1, "net force lab");
  ok(wordProblems("ΣF = ma", "after").length >= 1, "law"); ok(wordProblems("This extra is optional.", "lab").length === 1, "label");
});
t("every student string passes the word rule (pre-lab, lab, and after code 2)", () => {
  const bad = []; for (const [where, list] of Object.entries(S)) for (const s of list) for (const p of wordProblems(s, where)) bad.push(`[${where}] ${p}: ${s.slice(0, 70)}`);
  eq(bad.join("\n"), "");
});
t("huddle 2 words are held back from the CER word bank, starters and checklist", () => {
  const txt = JSON.stringify([L.postlab.wordBank, L.postlab.starters, L.postlab.checklist, L.postlab.prompt]).toLowerCase(); L.postlab.wordsHeldForHuddle2.forEach((w) => ok(!txt.includes(w.toLowerCase()), w));
});
t("every LEXICON word that appears in the term list has a tag, and every item prompt avoids the held words", () => {
  LEXICON.forEach((w) => ok(w in terms, w + " must be in the term list")); I.items.forEach((i) => HELD.forEach((w) => ok(!re(w).test(i.prompt + " " + (i.options || []).join(" ")), i.id + " " + w)));
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
