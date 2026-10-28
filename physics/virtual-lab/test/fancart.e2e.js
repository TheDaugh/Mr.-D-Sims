/* Lab 5 (the fan cart), end to end in Chromium at 1280x720. Needs a static server at the repo root:
     python3 -m http.server 8123 &
     node physics/virtual-lab/test/fancart.e2e.js            (SHOTS=<dir> writes a screenshot of every stop; PLAYWRIGHT_DIR=... if playwright is not at /opt/node-tools)
   Plays a whole period as a student: intro, pre-lab, huddle 1, door, bars, balance, track, the first run with Tutorial 1, the markers, the nine runs
   (Part 1, the prediction, Part 2, the test), both tutorials, every graph, Checks, CER, huddle 2 and code 2, hand-in, the record download, resume and the
   teacher key. At every step the yellow arrow and the coach line are read and compared with the sheet. Every screen's text goes through the word rule. */
import { launch, open, kit, check, done, D, I, L, lab, U, URL_, SHOTS } from "./fancart-kit.js";
import { numbersIn } from "../src/engine/record.js";
import * as E from "../src/engine/fancart.js";

const browser = await launch(), env = await open(browser), { page, errors } = env, k = kit(env), { vl } = k;
const Q = Object.fromEntries(L.quests.map((q) => [q.id, q])), T = L.tutorials, tol = (got, want) => E.within(D, got, want);
const evs = (t) => page.evaluate((t) => __vl.log.events.filter((e) => e.type === t), t);
const coachIs = async (want, msg) => { let got; for (let i = 0; i < 30; i++) { got = await k.coach(); if (got === want) break; await page.waitForTimeout(100); } check(got === want, msg + (got === want ? "" : ` (got ${JSON.stringify(got)})`)); };
const tab = async (t) => { await page.click("#fcTab_" + t); await page.waitForTimeout(120); };
const tableCell = (sel, ...a) => page.locator(sel).first().innerText();

// ---------- intro and pre-lab ----------
check((await page.title()) === lab.title && lab.title === "Virtual Lab 5", "the page title and HUD say 'Virtual Lab 5', not a lab term");
const intro = await k.snap("prelab");
check(!(await page.locator("#stepCard").isVisible()) && !(await page.locator("#taskPanel").isVisible()), "before the pre-lab the step card and the task list are off the screen (huddle 1 shows the step card)");
check((await k.unnamedControls("#dlgIntro")).length === 0, "every control on the intro screen has an id: " + (await k.unnamedControls("#dlgIntro")));
check(await page.locator("#introDemo").isVisible(), "the demo button is on the intro screen (the lab does not set noDemo)");
await k.shot("01-intro");
await page.fill("#student", "Test Student"); await page.click("#introGo"); await page.waitForSelector("#prelabBody .pq");
check((await page.locator("#prelabBody .pq").count()) === 4 && (await page.locator("#prelabBody svg").count()) === 3, "pre-lab: three pictured questions and a prediction");
check(await page.locator("#preGo").isDisabled(), "Continue stays disabled until the pre-lab is done");
check((await k.unnamedControls("#dlgPrelab")).length === 0, "every pre-lab control has an id");
const q0 = L.prelab.questions[0], wrongI = await page.locator("#prelabBody .pq").nth(0).locator("button").evaluateAll((bs, t) => bs.findIndex((b) => b.textContent !== t), q0.options[q0.correct]);
await page.locator("#prelabBody .pq").nth(0).locator("button").nth(wrongI).click();
check((await page.locator("#prelabBody .fb").nth(0).innerText()).includes(q0.explain) && (await page.locator("#prelabBody .pq").nth(0).locator("button:disabled").count()) === 3, "a wrong pre-lab answer shows the sheet's explanation and locks the question (one try)");
for (const [qi, q] of L.prelab.questions.entries()) if (qi) { const i = await page.locator("#prelabBody .pq").nth(qi).locator("button").evaluateAll((bs, t) => bs.findIndex((b) => b.textContent === t), q.options[q.correct]); await page.locator("#prelabBody .pq").nth(qi).locator("button").nth(i).click(); }
await page.locator("#pre_force_1").click();
const pf = await page.locator("#prelabBody .pq").nth(3).innerText();
check(pf.includes(L.prelab.prediction.afterTry) && (await page.locator("#prelabBody .pq").nth(3).locator("button:disabled").count()) === 4, "the prediction is one try, locked, and says only: " + L.prelab.prediction.afterTry);
check(!/correct|right|wrong/i.test(await page.locator("#prelabBody .pq").nth(3).locator(".fb").innerText()), "the prediction reveals nothing about right or wrong");
const pe = await evs("predict"); check(pe.length === 1 && pe[0].id === "force" && pe[0].choice === L.prelab.prediction.options[1], "the pre-lab prediction is logged with the choice");
await k.snap("prelab"); await k.shot("02-prelab");
check(!(await page.locator("#preGo").isDisabled()), "Continue opens when the pre-lab is done"); await page.click("#preGo");

// ---------- huddle 1: the hold screen with the step card, one daily code ----------
await page.waitForSelector("#dlgHuddle[open]"); await k.snap("lab");
check((await page.locator("#holdSteps li").allInnerTexts()).join("|") === L.stepCard.steps.join("|"), "the hold screen shows the sheet's nine steps, word for word");
check((await page.locator("#huddleBody h2").innerText()) === U.huddle1Title, "huddle 1 is called the hold screen");
await page.fill("#huddleCode", "0000"); await page.click("#huddleGo"); check((await page.locator("#huddleBody").innerText()).includes(U.codeWrong), "a wrong code is refused");
const c1 = await k.code("h1"), c2 = await k.code("h2");
check(c1 === (await vl(() => MrD.codes.huddle())) && c2 === (await vl(() => MrD.codes.huddle2())) && c1 !== c2, "two codes a day: code 1 is the daily huddle code, code 2 is its own");
await k.shot("03-hold");
await page.fill("#huddleCode", c1); await page.click("#huddleGo"); await page.waitForFunction(() => __vl.S.stage === "lab");
await page.waitForFunction(() => !document.querySelector("#taskPanel").hidden);
check(!(await page.locator("#stepCard").isVisible()), "there is no separate step card panel: the task list carries the steps and can be hidden");
check(await page.locator("#taskPanel").isVisible(), "the task list comes up after huddle 1");
await page.keyboard.press("n"); await page.waitForTimeout(200);
check(!(await vl(() => document.querySelector("#dlgNotebook").open)) && (await page.locator("#feed").innerText()).includes(U.notebookAtTrack), "N before the track does nothing but say the notebook opens at the track");
await k.snap("lab");

// ---------- the room: door, bars, balance, track ----------
const tasks = await k.quests();
check(tasks[0].includes(Q.door.text) && tasks.some((t) => t.includes(Q.bars.text) && t.includes("(0/4)")), "the task list shows the sheet's quest texts, with a count on the bars");
await coachIs(Q.door.hint, "the coach line is the door hint, word for word");
await k.arrow(U.aDoor, "door"); await k.shot("04-room-door");
await k.move(0, -1, 1); await k.move(-1, 0, 2); await k.move(0, -1, 2);
check((await evs("door")).length === 1 && (await evs("door"))[0].outcome === "entered", "walking through the door logs entry (no goggles gate)");
await coachIs(Q.bars.hint, "next the coach line is the bars hint"); await k.arrow(U.aWalkE, "bars (walk to the shelf)");
await k.move(-1, 0, 2); await k.move(0, -1, 2); await k.move(-1, 0, 1); await page.keyboard.press("e"); await page.waitForSelector("#dlgChest[open]");
check((await page.locator("#chestBody h2").innerText()) === "Mass bars" && (await page.locator("#chestBody .slot").count()) === 6, "the bar shelf holds six mass bars");
check((await k.unnamedControls("#dlgChest")).length === 0, "every shelf control has an id"); await k.arrow(U.aTakeAll, "bars (in the shelf)"); await k.shot("05-shelf");
await page.keyboard.press("q"); await page.waitForTimeout(150);
check((await vl(() => __vl.S.inv)).join() === "bar1,bar2,bar3,bar4" && (await evs("take")).length === 4 && (await evs("take")).every((e) => e.id === "bar"), "Take all takes four bars (hands are full at four) and logs four take events for the bar");
check((await page.locator("#invCount").innerText()) === "(4/4)", "Carrying shows 4 of 4"); await page.keyboard.press("e");
await coachIs(Q.weigh.hint, "next the coach line is the balance hint"); await k.arrow(U.aWalkE, "weigh (walk to the balance)");
await k.route.shelfToBalance(); await page.keyboard.press("e"); await page.waitForSelector("#dlgChest[open]");
check((await page.locator("#chestBody .slot").count()) === 2, "the balance holds the cart and one bar"); await k.arrow(U.aWeigh, "weigh (at the balance)");
await page.keyboard.press("Enter"); await page.waitForTimeout(150); check((await page.locator("#chestBody").innerText()).includes("0.50 kg"), "the balance reads the cart: 0.50 kg");
await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter"); await page.waitForTimeout(200); check((await page.locator("#chestBody").innerText()).includes("0.25 kg"), "the balance reads one bar: 0.25 kg"); await k.shot("06-balance");
check((await evs("weigh")).map((e) => e.item).join() === "cart,bar", "two weigh events, cart and bar"); await page.keyboard.press("e");
await coachIs(Q.track.hint, "next the coach line is the track hint"); await k.arrow(U.aWalkE, "track");
await k.route.balanceToTrack(); await page.keyboard.press("e"); await page.waitForSelector("#dlgNotebook[open]"); await page.waitForTimeout(250);
check((await evs("station")).some((e) => e.id === "track"), "pressing E at the track logs the station and opens the notebook");

// ---------- the notebook: bars, fan setting, Run ----------
await k.snap("lab"); await k.shot("07-notebook");
check((await k.unnamedControls("#dlgNotebook")).length === 0, "every notebook control has an id: " + (await k.unnamedControls("#dlgNotebook")));
check((await page.locator("#fcForce").innerText()) === "Force sensor: 0.15 N", "the force sensor reads the fan force of setting 1");
await vl(() => { window.__keep = __vl.S.inv; __vl.S.inv = ["bar1", "bar2"]; }); await page.waitForTimeout(400);
check((await page.locator("#fcBar2").isEnabled()) && (await page.locator("#fcBar3").isDisabled()) && (await page.locator("#fcBar4").isDisabled()), "bar buttons are disabled until the student has taken that many");
await vl(() => { __vl.S.inv = window.__keep; }); await page.waitForTimeout(400); check(await page.locator("#fcBar4").isEnabled(), "with four bars all five bar buttons work");
await coachIs(Q.firstrun.hint, "the coach line is the first-run hint"); await k.arrow(U.aBars2, "firstrun, bars"); await page.click("#fcBar2");
await k.arrow(U.aSet2, "firstrun, fan setting"); await page.click("#fcSet2"); check((await page.locator("#fcForce").innerText()) === "Force sensor: 0.30 N", "setting 2 reads 0.30 N");
await k.arrow(U.aRun, "firstrun, Run"); await page.click("#fcRun");
check(await page.locator("#fcRun").isDisabled() && await page.locator("#fcBar0").isDisabled(), "while the cart rolls the controls wait");
await k.waitRun(); const run1 = (await evs("run"))[0]; check(run1 && run1.bars === 2 && run1.setting === 2 && run1.seed > 0, "the run is logged with its bars, setting and a seed");
check((await page.locator("#fcShaky").innerText()) === L.messages.markersClose && (await page.locator("#fcA").innerText()) === "--", "markers start close together: the shaky message and no number");

// ---------- Tutorial 1: five captions, each with a yellow arrow ----------
await page.waitForSelector("#fcTut .gtext"); await page.waitForTimeout(500); check((await k.arrowText()) === null, "while a tutorial's arrows are up the quest arrow waits");
const t1 = [];
for (let i = 0; i < T.tutorial1.captions.length; i++) {
  await page.waitForFunction((want) => (document.getElementById("fcTutText") || {}).textContent === want, T.tutorial1.captions[i]);
  t1.push(await page.textContent("#fcTutText")); const box = await page.locator("#fcTut .garrow").boundingBox(); check(box && box.x > 0 && box.y > 0, "Tutorial 1 caption " + (i + 1) + " has an arrow on screen");
  if (i === 1) await k.shot("08-tutorial1"); if (i < T.tutorial1.captions.length - 1) await page.click("#fcTutNext");
}
check(t1.join("|") === T.tutorial1.captions.join("|"), "Tutorial 1 reads the sheet's five captions in order: " + t1.length); check((await page.textContent("#fcTut small")).includes(T.tutorial1.name), "it is named '" + T.tutorial1.name + "'");
await page.click("#fcTutDone"); check(!(await page.locator("#fcTut").count()), "Done closes it");
const ev2 = (await evs("tutorial")); check(ev2.length === 1 && ev2[0].n === 1, "Tutorial 1 opened once, by itself, after the first run");

// ---------- markers and the reading ----------
await coachIs(Q.markers.hint, "the coach line is the markers hint"); await k.arrow(U.aMarkers, "markers");
await k.dragMarker(0, 0.2); const wide = await page.textContent("#fcA"); check(wide !== "--" && (await evs("read")).length === 1, "a reading appears and is logged once the markers are 0.5 s or more apart");
await k.dragMarker(1, 0.5); check((await page.textContent("#fcA")) === "--" && (await page.textContent("#fcShaky")) === L.messages.markersClose && (await page.locator("#fcRecord").isDisabled()), "markers closer than 0.5 s: " + L.messages.markersClose + " and no number");
await k.dragMarker(1, 1.8); const a1 = parseFloat(await page.textContent("#fcA")); check(tol(a1, 0.29), "markers far apart read " + a1 + ", inside the tolerance of the 0.29 the data expects"); await k.shot("09-markers");
check((await evs("read")).length === 2, "each spread-out reading is a read event");
await k.arrow(U.aMass, "record, mass");
await page.fill("#fcMass", "0.5"); await k.arrow(U.aRecord, "record, Record button"); await page.click("#fcRecord");
check((await page.textContent("#fcRecMsg")) === L.messages.massWrong && !(await vl(() => Object.keys(__vl.S.flame.rows.p1).length)), "a wrong mass shows: " + L.messages.massWrong);
await page.fill("#fcMass", "1.00"); await page.click("#fcRecord"); await page.waitForTimeout(150);
check((await tableCell("#fcTable1 tr[data-setting='2'] td:nth-child(2)")) === "0.30" && (await tableCell("#fcTable1 tr[data-setting='2'] td:nth-child(3)")) === "1.00" && tol(parseFloat(await tableCell("#fcTable1 tr[data-setting='2'] td:nth-child(4)")), 0.29), "Record fills the fan force and the acceleration; the typed mass goes in the table");
check((await evs("record"))[0].part === "1" && (await evs("record"))[0].setting === 2, "the record event names its part and setting"); await k.shot("10-record");
check((await page.locator("#fcWhere").innerText()).includes("Part 1"), "the notebook says which table a run goes in");

// ---------- Part 1: settings 1, 3 and 4 (one with a real mouse drag), the shaky graph, Tutorial 2 ----------
const part1 = [{ s: 1, i: 0 }, { s: 3, i: 2 }, { s: 4, i: 3 }];
const r1 = await k.runOne({ bars: 2, setting: 1, mass: 1.0, real: true }); check(tol(r1.a, D.part1[0].a_expected), "setting 1 reads " + r1.a + " (data: " + D.part1[0].a_expected + ")");
await tab("graph"); await page.waitForSelector("#fcTut .gtext"); const t2 = [];
for (let i = 0; i < T.tutorial2.captions.length; i++) {
  await page.waitForFunction((want) => (document.getElementById("fcTutText") || {}).textContent === want, T.tutorial2.captions[i]); t2.push(await page.textContent("#fcTutText"));
  const box = await page.locator("#fcTut .garrow").boundingBox(); check(box && box.x > 0 && box.y > 0, "Tutorial 2 caption " + (i + 1) + " has an arrow on screen"); if (i < T.tutorial2.captions.length - 1) await page.click("#fcTutNext");
}
check(t2.join("|") === T.tutorial2.captions.join("|"), "Tutorial 2 reads the sheet's four captions in order"); await k.shot("11-tutorial2"); await page.click("#fcTutDone");
await page.click("#fcGuide"); check((await page.textContent("#fcGraphMsg")) === L.messages.guideLineNeedsDots && !(await evs("plot")).length, "Guide line with two dots says: " + L.messages.guideLineNeedsDots);
await tab("table");
for (const { s, i } of part1.slice(1)) { const r = await k.runOne({ bars: 2, setting: s, mass: "1.00" }); check(tol(r.a, D.part1[i].a_expected), `setting ${s} reads ${r.a} (data: ${D.part1[i].a_expected})`); }
check((await page.locator("#fcGood1").innerText()) === L.messages.tableGood, "Part 1 has four rows: " + L.messages.tableGood); await k.shot("12-part1-done");
const rows1 = await vl(() => __vl.S.flame.rows.p1); check(Object.keys(rows1).join() === "1,2,3,4" && D.part1.every((r, i) => rows1[i + 1].F === r.F_N && rows1[i + 1].m === 1), "Part 1 holds settings 1 to 4 at 1.00 kg");

// ---------- the mass prediction gates Part 2; the test run waits for code 2 ----------
await page.click("#fcBar1"); await page.click("#fcSet3"); await page.click("#fcRun"); await page.waitForTimeout(200);
const nRuns = (await evs("run")).length; check((await page.textContent("#fcMsg")) === L.messages.predictLock && nRuns === 4, "Part 2 is locked until the prediction: " + L.messages.predictLock);
check(await page.locator("#fcPredCard_mass").isVisible(), "the prediction card is on the Table tab"); await k.shot("13-predict-lock");
await page.click("#fcPred_mass_0"); const pm = (await evs("predict")).filter((e) => e.id === "mass");
check(pm.length === 1 && pm[0].choice === L.predictions[1].options[0] && (await page.locator("#fcPredCard_mass button:disabled").count()) === 4, "the mass prediction is logged, one try, no hint, nothing graded");
check(!/right|wrong|correct/i.test(await page.locator("#fcPredCard_mass .fb").innerText()), "no right or wrong on the prediction");
await page.click("#fcBar3"); await page.click("#fcRun"); await page.waitForTimeout(200); check((await page.textContent("#fcMsg")) === U.afterCode2 && (await evs("run")).length === 4, "3 bars is the test run: it waits for code 2 (" + U.afterCode2 + ")");

// ---------- Part 2: bars 0, 1, 2 and 4 on setting 3 ----------
await k.runOne({ bars: 1, setting: 1, mass: "0.75", noRecord: true }); check((await page.locator("#fcRecord").isDisabled()) && (await page.textContent("#fcWhere")).includes(U.noTable), "a run that fits no table cannot be recorded (" + U.noTable + ")");
for (const [i, r] of D.part2.entries()) {
  await page.click("#fcBar" + r.bars); await page.click("#fcSet3"); await page.click("#fcRun"); await k.waitRun(); await vl(() => { __vl.fl.moveMarker(0, 0.2); __vl.fl.moveMarker(1, 1.8); __vl.fl.commitRead(); });
  if (r.bars === 2) check((await page.textContent("#fcWhere")).includes("Part 2"), "the run that fits both tables goes in Part 2 now that Part 1 has setting 3");
  const a = parseFloat(await page.textContent("#fcA")); check(tol(a, r.a_expected), `${r.bars} bars read ${a} (data: ${r.a_expected})`);
  await page.fill("#fcMass", String(r.m_kg)); await page.click("#fcRecord"); await page.waitForFunction(() => document.querySelector("#fcMass").value === "");
}
check((await page.locator("#fcGood2").innerText()) === L.messages.tableGood, "Part 2 has four rows"); check(!(await page.locator("#fcTable2 th:has-text('1/m')").count()), "no 1/m column before code 2");
const recs = await evs("record"); check(recs.length === 8 && recs.filter((e) => e.part === "1").length === 4 && recs.filter((e) => e.part === "2").length === 4, "eight records: four in Part 1, four in Part 2");
check((await evs("run")).length >= 9, "the lab took the nine runs of the sheet's tables (four, four and the test comes after code 2)"); await k.shot("14-part2-done");

// ---------- the graph builder ----------
await tab("graph");
check((await page.locator("#fcAcross option").allInnerTexts()).join("|") === [U.xForce, U.xMass].join("|"), "across: fan force or mass (1/m is held until code 2)");
await page.click("#fcGuide"); check((await vl(() => __vl.S.flame.plot.F)) === "guide" && (await evs("plot")).at(-1).x === "F", "fan force against acceleration with the guide line logs a plot event");
const pink = () => page.evaluate(() => { const c = document.getElementById("fcGraph"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0, b = 0; for (let i = 0; i < d.length; i += 4) { if (Math.abs(d[i] - 179) < 14 && Math.abs(d[i + 1] - 65) < 14 && Math.abs(d[i + 2] - 46) < 14) n++; if (d[i] < 70 && d[i + 2] > 140 && d[i + 1] < 130) b++; } return { line: n, dots: b }; });
let px = await pink(); check(px.line > 500 && px.dots > 150, "the graph shows four dots and a straight guide line (" + JSON.stringify(px) + ")"); await k.shot("15-graph-force");
check((await page.locator("#fcGraphMsg").innerText()) === "", "no message once there are enough dots");
await page.selectOption("#fcAcross", "m"); await page.click("#fcConnect"); check((await evs("plot")).at(-1).x === "m" && (await evs("plot")).at(-1).line === "connect", "mass against acceleration with Connect the dots logs a plot event");
px = await pink(); check(px.line > 300, "the dots are joined by a curve"); await k.shot("16-graph-mass");
const g1 = await page.locator("#fcGuide_a-vs-m").textContent(); check([L.figures[3].title, L.figures[3].axes, L.figures[3].oneMark, L.figures[3].lookFirst, L.figures[3].wrongReading].every((s) => g1.includes(s)), "the reading guide below the mass graph carries the sheet's four lines");
check((await k.unnamedControls("#dlgNotebook")).length === 0, "the graph builder's controls all have ids");
await k.snap("lab");

// ---------- Checks: hidden bands, a hint ladder that costs the try ----------
await tab("checks"); const it1 = I.items[0]; check((await page.locator("#fcItem").getAttribute("data-item")) === "b1-1" && (await page.locator("#fcItem").innerText()).includes(it1.prompt) && (await page.locator("#fcItem svg").count()) === 1, "Checks starts at band 1 with the sheet's first item and its picture");
await k.snap("lab"); await k.shot("17-checks");
check(!/band|tier|level|extension|challenge|optional/i.test(await page.locator("#fcTabBody").innerText()), "no band name, tier or label on the Checks tab");
await page.click("#fcOpt_1"); await page.waitForSelector("#fcHint1"); check((await page.locator("#fcHint1").innerText()).includes(it1.hints[0]) && (await page.textContent("#fcItem")).includes(U.hintNext), "a wrong answer opens hint 1 (the step card) and costs the try");
await page.click("#fcOpt_0"); await page.waitForFunction(() => (document.querySelector("#fcItem") || {}).dataset.item !== "b1-1"); check((await vl(() => __vl.S.flame.checks.band)) === 1, "right after a hint: still band 1");
check((await page.locator("#fcItem").getAttribute("data-item")) === "b1-2", "the next band-1 item follows");
await page.fill("#fcAnswer", "0.6"); await page.click("#fcCheck"); await page.waitForFunction(() => (document.querySelector("#fcItem") || {}).dataset.item !== "b1-2"); check((await vl(() => __vl.S.flame.checks.band)) === 2 && (await page.locator("#fcItem").getAttribute("data-item")) === "b2-1", "a clean first try raises the band: the next item is band 2");
check((await vl(() => MrD.profile.all().filter((r) => r.lesson === "fan-cart")[0].items.length)) === 2, "the scores go to MrD.profile on this device");

// ---------- CER ----------
await tab("cer"); const r = await vl(() => __vl.S.flame.rows), f = (x) => x.toFixed(2);
check((await page.locator("#fcTabBody p").first().innerText()) === L.postlab.prompt, "the CER prompt is the sheet's"); await k.snap("lab");
const claim = "When the fan force doubles the acceleration about doubles, and when the mass doubles it is about half.";
const evid = `At ${f(r.p1[1].F)} N the acceleration was ${f(r.p1[1].a)} and at ${f(r.p1[2].F)} N it was ${f(r.p1[2].a)}. At ${f(r.p2[0].m)} kg it was ${f(r.p2[0].a)} and at ${f(r.p2[2].m)} kg it was ${f(r.p2[2].a)}.`;
await page.click("#fcChip_claim_0"); await page.fill("#fcClaim", claim); await page.fill("#fcEvidence", evid); await page.click("#fcChip_reasoning_0"); await page.click("#fcChip_bank_4");
check(await page.locator("#fcCerGo").isDisabled(), "Submit CER waits for the words and the checklist");
await page.fill("#fcReasoning", "This evidence supports my claim because the acceleration went up about double when the force doubled and went down about half when the mass doubled, so my table points the same way both times.");
for (let i = 0; i < 4; i++) { check((await page.locator("#fcCer" + "Go").isDisabled()) === true, "Submit still waits with " + i + " boxes ticked"); await page.check("#fcCk_" + i); }
check(!(await page.locator("#fcCerGo").isDisabled()), "with every box ticked and the words in, Submit CER opens"); await k.shot("18-cer"); await page.click("#fcCerGo");
check((await vl(() => __vl.S.cerDone)) && (await evs("cer")).length === 1, "CER saved and logged"); check((await evs("cer"))[0].cited.ok === true, "the count check finds two numbers from each of the student's own tables in the evidence");
check((await page.locator("#fcCerStatus").innerText()) === U.cerSaved, "the CER says it is saved");
check(!(await vl(() => [...document.querySelectorAll("#quests li")].some((l) => l.textContent.includes("Graph acceleration against 1/m")))), "no 1/m task before code 2"); check((await k.quests()).some((t) => t.includes(Q.code2.text)), "once the CER is in, the task list asks for code 2");
await page.click("#dlgNotebook .x"); await k.snap("lab");

// ---------- huddle 2 and code 2: never blocked by the record ----------
check(await page.locator("#btnHuddle").isVisible(), "the huddle 2 button is on screen"); await page.click("#btnHuddle"); await page.waitForSelector("#huddleBody");
const h2 = await page.locator("#huddleBody").innerText(), H = L.huddle2Tab;
check(h2.includes(H.tested) && h2.includes(H.blanks[0].text.split("______")[0]) && h2.includes(H.worked[0].problem) && h2.includes(H.worked[1].problem) && H.crux.every((c) => h2.includes(c.q)), "huddle 2 shows what is tested, the blanks, the worked problems and the three crux questions");
check(!/1\/m|per kg/.test(h2) && !h2.includes(H.worked[2].problem), "…without 1/m or per kg, which wait for the code"); check(!h2.includes(H.worked[0].steps[0]) && !h2.includes(H.crux[0].answer), "…and without the answers");
await page.fill("#fcBlank_h1", "double"); await page.fill("#fcBlank_h2", "half"); await k.snap("lab"); await k.shot("19-huddle2-before");
check((await k.unnamedControls("#dlgHuddle")).length === 0, "every huddle control has an id");
await page.fill("#huddleCode", c1); await page.click("#huddleGo"); check((await page.locator("#huddleBody").innerText()).includes(U.codeWrong), "code 1 does not open huddle 2");
await k.enterCode("h2"); const h2b = await page.locator("#huddleBody").innerText();
check(H.worked.every((w) => w.steps.every((s) => h2b.includes(s))) && H.crux.every((c) => h2b.includes(c.answer)) && h2b.includes(H.blanks[2].text.split("______")[0]) && /1\/m/.test(h2b), "with the code in, the answers show, and 1/m with them"); await k.shot("20-huddle2-after");
check((await vl(() => __vl.S.flame.huddle2)) && (await vl(() => __vl.S.flame.h2.h1)) === "double", "code 2 is accepted with the typed blanks kept"); await page.click("#huddleClose"); await k.snap("after");
await coachIs(Q.graphInv.hint, "after code 2 the next task is the 1/m graph, with the sheet's hint"); check(!(await page.locator("#btnHuddle").isVisible()), "the huddle button is gone once code 2 is in");

// ---------- after code 2: the 1/m graph, the test run, hand-in ----------
await page.keyboard.press("n"); await page.waitForSelector("#dlgNotebook[open]"); await page.waitForTimeout(200);
check((await page.locator("#fcTable2 th").allInnerTexts()).includes(U.invmHead), "Part 2 gains the 1/m (per kg) column"); const invs = await page.locator("#fcTable2 tbody tr td:nth-child(5)").allInnerTexts(); check(invs.join() === "2.00,1.33,1.00,0.67", "…2.00, 1.33, 1.00, 0.67");
await tab("graph"); check((await page.locator("#fcAcross option").allInnerTexts()).includes(U.xInvm), "1/m is now an axis"); await page.selectOption("#fcAcross", "invm"); await page.click("#fcGuide");
check((await evs("plot")).at(-1).x === "invm", "plotting a against 1/m logs a plot event"); px = await pink(); check(px.line > 500, "the line goes through the corner (" + JSON.stringify(px) + ")"); await k.snap("after"); await k.shot("21-graph-invm");
await tab("table"); check(await page.locator("#fcPredCard_test").isVisible(), "the typed test prediction is on the Table tab");
await page.click("#fcBar3"); await page.click("#fcSet3"); await page.click("#fcRun"); await page.waitForTimeout(200);
check((await page.textContent("#fcMsg")) === L.messages.predictLock && !(await evs("run")).some((e) => e.part === "test"), "the test run waits for a typed prediction: " + L.messages.predictLock);
await page.fill("#fcPredTest", "0.35"); await page.click("#fcPredTestGo"); check((await evs("predict")).at(-1).id === "test" && (await evs("predict")).at(-1).value === 0.35 && await page.locator("#fcPredTest").isDisabled(), "the test prediction is typed once, logged and locked");
await page.click("#fcRun"); await k.waitRun(); check((await evs("run")).at(-1).part === "test", "the test run is logged as the test"); await vl(() => { __vl.fl.moveMarker(0, 0.2); __vl.fl.moveMarker(1, 1.8); __vl.fl.commitRead(); });
const at = parseFloat(await page.textContent("#fcA")); check(tol(at, D.test.a_expected), `3 bars read ${at} (data: ${D.test.a_expected})`);
await page.fill("#fcMass", "1.25"); await page.click("#fcRecord"); await page.waitForSelector("#fcTable3"); check((await page.locator("#fcTable3 tbody td").allInnerTexts()).slice(-1)[0] === "0.35" && (await evs("record")).at(-1).part === "test", "the test row shows the reading beside the student's prediction"); await k.shot("22-test-run");
const allRuns = await evs("run"); check(allRuns.length >= 10 && allRuns.filter((e) => e.part === "1").length >= 4 && allRuns.filter((e) => e.part === "test").length === 1, "the run log holds the Part 1 runs, the Part 2 runs and the one test run (" + allRuns.length + " runs)");
check((await k.unnamedControls("#dlgNotebook")).length === 0, "every notebook control has an id after code 2 too"); await k.snap("after");

// ---------- hand in: no stamp, no report code, scores kept ----------
await tab("table"); check(await page.locator("#fcHandIn").isVisible(), "Hand in is on the notebook after code 2"); await page.click("#fcHandIn"); await page.waitForSelector("#dlgDone[open]");
const dd = await page.locator("#dlgDone").innerText(); check(dd.includes(U.doneInfo) && dd.includes(L.exit.prompt), "hand-in shows the exit ticket prompt: a drawing on paper"); check(!/\b\d{4}\b/.test(dd) && !(await page.locator("#badge").isVisible()), "no stamp and no report code"); await k.snap("after"); await k.shot("23-handin");
check((await vl(() => __vl.S.stage)) === "done" && (await vl(() => __vl.S.submitted)), "the stage is done and the record is submitted");
const prof = await vl(() => MrD.profile.all().filter((r) => r.lesson === "fan-cart")); check(prof.length === 1 && prof[0].course === "physics" && prof[0].first === "Test" && prof[0].reached === 9, "MrD.profile.record kept a physics record with nine runs");
const [dl] = await Promise.all([page.waitForEvent("download"), page.evaluate(() => document.querySelector("#download").click())]); const rec = JSON.parse(await (await import("node:fs")).promises.readFile(await dl.path(), "utf8"));
check(rec.lab === "fan-cart" && rec.fancart.rows.p1[1] && rec.fancart.rows.test.bars === 3 && rec.fancart.predictions.test.value === 0.35 && rec.cer && rec.submitted === true && !("code" in rec) && !("stamp" in rec) && rec.events.length > 50, "the lab record has the tables, three predictions, the CER and the log, and no code");
check(rec.fancart.cited.ok && rec.fancart.huddle1 && rec.fancart.huddle2, "…with the CER count check and both huddles");
const printed = await vl(() => __vl.fl.print().map((n) => n.textContent).join(" ")); check(printed.includes("0.30") && printed.includes("Part 1") && printed.includes(claim), "the printed report carries the tables and the CER");
await page.click("#dlgDoneClose");

// ---------- resume, then the teacher key ----------
const before = JSON.stringify(await vl(() => ({ rows: __vl.S.flame.rows, pred: __vl.S.flame.pred, stage: __vl.S.stage, cer: __vl.S.cer, inv: __vl.S.inv })));
await Promise.all([page.waitForEvent("load"), page.evaluate(() => { location.hash = "#key"; })]); await page.waitForSelector("#boot button"); check((await page.locator("#boot").innerText()).includes("saved lab"), "reopening offers the saved lab");
await page.click('#boot button:has-text("Continue where I left off")'); await page.waitForFunction(() => !document.querySelector("#app").hidden); await page.waitForTimeout(500);
check(JSON.stringify(await vl(() => ({ rows: __vl.S.flame.rows, pred: __vl.S.flame.pred, stage: __vl.S.stage, cer: __vl.S.cer, inv: __vl.S.inv }))) === before, "resume restores the tables, predictions, CER, stage and the bars carried");
await page.keyboard.press("n"); await page.waitForSelector("#dlgNotebook[open]"); check((await page.locator("#fcTable1 tr[data-setting='3'] td").first().innerText()) === "0.45", "the saved rows are back in the notebook"); await page.click("#fcClose");
await page.click("#btnKey"); await page.waitForSelector("#dlgKey[open]"); const key = await page.locator("#keyBody").innerText(); await k.shot("24-key");
check(I.items.every((i) => key.includes(i.id) && key.includes(i.prompt.slice(0, 40))), "the teacher key shows all twelve items next to the lesson");
check(["g1", "g2", "g3"].every((g) => I.generators.samples[g].every((s) => key.includes(s.prompt))), "…with the sheet's three generated problems for each band");
check(key.includes(c1) && key.includes(c2), "…both of today's codes"); check(key.includes("Test run") && key.includes("0.35") && key.includes(L.predictions[1].options[0]), "…the lab record rows and the three predictions with the choice or the typed value");
check(/2 \/ 2 Part 1, 2 \/ 2 Part 2|[2-9] \/ 2 Part 1/.test(key) && key.includes("passes"), "…and the CER with its count check");
check((await page.locator("#keyBody select option").allInnerTexts()).join() === "05-fan-cart", "the lab picker lists this lab only");

// ---------- the word rule and the page's health ----------
const bad = k.wordCheck(); check(bad.length === 0, "every screen passes the word rule (" + env.seen.length + " screens)" + (bad.length ? "\n  " + bad.join("\n  ") : ""));
check(errors.length === 0, "no console or page errors" + (errors.length ? ": " + errors.join(" | ") : ""));

// ---------- the clock: the hold screen at minute 3 even mid pre-lab; huddle 2 at minute 28 ----------
async function inPeriod(iso, fn) {
  const e = await open(browser, iso), kk = kit(e); await e.page.evaluate(() => { location.hash = "#nolock=" + LessonLock.offCode(); }); await fn(e, kk); await e.ctx.close();
}
await inPeriod("2026-10-21T09:04:00-04:00", async (e, kk) => {
  await e.page.fill("#student", "Clock Kid"); await e.page.click("#introGo"); await e.page.waitForSelector("#prelabBody .pq"); await e.page.waitForSelector("#dlgHuddle[open]", { timeout: 4000 });
  check((await e.page.locator("#huddleBody h2").innerText()) === U.huddle1Title, "at minute 3 the hold screen comes up even though the pre-lab is not finished");
  await kk.enterCode("h1"); check((await e.page.evaluate(() => __vl.S.stage)) === "prelab" && (await e.page.evaluate(() => __vl.S.flame.huddle1)), "code 1 returns the student to the pre-lab, not into the lab");
  for (const [qi, q] of L.prelab.questions.entries()) { const i = await e.page.locator("#prelabBody .pq").nth(qi).locator("button").evaluateAll((bs, t) => bs.findIndex((b) => b.textContent === t), q.options[q.correct]); await e.page.locator("#prelabBody .pq").nth(qi).locator("button").nth(i).click(); }
  await e.page.locator("#pre_force_2").click(); await e.page.click("#preGo"); await e.page.waitForFunction(() => __vl.S.stage === "lab");
  check(!(await e.page.evaluate(() => document.querySelector("#dlgHuddle").open)), "finishing the pre-lab goes straight to the lab: the hold screen is not shown twice");
  await e.page.waitForTimeout(2500); check(!(await e.page.evaluate(() => document.querySelector("#dlgHuddle").open)), "at minute 4 huddle 2 has not been called");
});
await inPeriod("2026-10-21T09:27:00-04:00", async (e, kk) => { await kk.toLab(); await e.page.waitForTimeout(2600); check(!(await e.page.evaluate(() => document.querySelector("#dlgHuddle").open)), "at minute 27 huddle 2 has not been called"); });
await inPeriod("2026-10-21T09:28:30-04:00", async (e, kk) => {
  await kk.toLab(); await e.page.waitForSelector("#dlgHuddle[open]", { timeout: 4000 }); check((await e.page.locator("#huddleBody h2").innerText()) === U.huddle2Title && (await e.page.locator("#fcBlank_h1").count()) === 1, "at minute 28 huddle 2 is called: the formalizing tab with its blanks");
  await e.page.click("#huddleClose"); await e.page.waitForTimeout(2200); check(!(await e.page.evaluate(() => document.querySelector("#dlgHuddle").open)) && (await e.page.locator("#btnHuddle").isVisible()), "closing it keeps the button; it does not come back by itself");
  check((await e.page.evaluate(() => __vl.fl.recordComplete())) === false, "…and the record is empty, yet code 2 is accepted: it is never blocked by the table");
  await e.page.click("#btnHuddle"); await kk.enterCode("h2"); check(await e.page.evaluate(() => __vl.S.flame.huddle2), "an empty table still gets code 2");
});
await (async () => {
  const e = await open(browser, "2026-10-21T09:28:30-04:00"), p = e.page; await Promise.all([p.waitForEvent("load"), p.evaluate(() => { location.hash = "#key"; })]); await p.waitForFunction(() => window.__vl && !document.querySelector("#app").hidden);
  check((await p.evaluate(() => __vl.S.stage)) === "lab" && !(await p.evaluate(() => document.querySelector("#dlgIntro").open)), "#key: teacher creative mode skips the intro, the pre-lab and the huddles and never asks for a name");
  await p.keyboard.press("n"); await p.waitForSelector("#dlgNotebook[open]"); check(await p.locator("#fcBar4").isEnabled() && await p.locator("#fcBar3").isEnabled(), "#key: every bar button works with nothing carried");
  await p.click("#fcBar3"); await p.click("#fcSet3"); await p.click("#fcRun"); await p.waitForFunction(() => __vl.S.flame.last && !__vl.S.flame.anim); check((await p.evaluate(() => __vl.S.flame.runs)) === 1, "#key: the test run opens with no code and no prediction");
  await p.click("#fcTab_graph"); check((await p.locator("#fcAcross option").allInnerTexts()).includes(U.xInvm) && await p.locator("#fcHandIn").isVisible(), "#key: 1/m and Hand in are open");
  await e.ctx.close();
})();
await done(browser);
