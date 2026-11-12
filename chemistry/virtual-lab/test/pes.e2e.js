/* Lab 5 (photoelectron spectroscopy), end to end in Chromium. Needs a static server at the repo root:
     python3 -m http.server 8123 &
     node chemistry/virtual-lab/test/pes.e2e.js          (PLAYWRIGHT_DIR=... if playwright is not at /opt/node-tools; SHOTS=<dir> to keep screenshots)
   Plays a whole period: prelab cards, door, spectrometer, the guided lithium sweep, every free run, the three checkpoints, a forced lock,
   the PIN unlock and the two-question redo, the help button, the draw bench, the four mystery cells, Model A, hand-in, a reload with a lock
   in place, the teacher page, and the bundled key over file://. The clock is pinned before the period, so locked mode is off. */
import { createRequire } from "node:module";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR || "/opt/node-tools/node_modules/playwright");
const ORIGIN = process.env.BASE || "http://localhost:8123", SHOTS = process.env.SHOTS || "", PIN = "";
const ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const fails = [], check = (c, m) => { if (!c) { fails.push(m); console.log("FAIL " + m); } else console.log("ok   " + m); };
if (SHOTS && !existsSync(SHOTS)) mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch(), ctx = await browser.newContext({ reducedMotion: "reduce", timezoneId: "America/New_York", viewport: { width: 1280, height: 720 }, acceptDownloads: true }), page = await ctx.newPage();
page.setDefaultTimeout(9000);
const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.route(/fonts\./, (r) => r.abort());
await page.route("**/content/config.json", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ modeVerifiers: {} }) }));
await page.clock.setFixedTime(new Date("2026-10-21T07:30:00-04:00"));
const shot = async (n) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${n}.png` }); };
const H = (f, a) => page.evaluate(`(() => { const k = window.__vl.fl.hooks; return (${f.toString()})(k, ${JSON.stringify(a ?? null)}); })()`);
const st = () => H((k) => { const s = k.state(); return JSON.parse(JSON.stringify(s)); });
const step = () => H((k) => k.stepId());
const setRange = (id, v) => page.$eval(id, (el, x) => { el.value = x; el.dispatchEvent(new Event("input", { bubbles: true })); }, String(v));
const url = ORIGIN + "/chemistry/virtual-lab/index.html?lab=pes&seed=11";

// ---------- intro, cards, walk in ----------
await page.goto(url); await page.waitForSelector("#student");
check((await page.locator("#pesHook").count()) === 1, "intro shows an unlabeled spectrum as the hook");
check(/What element makes this spectrum/.test(await page.locator("#introBody").innerText()), "intro asks what element it is, then states the goal");
check(/Goal:/.test(await page.locator("#introBody").innerText()), "intro states the goal");
check((await page.locator("#introDemo").count()) === 1, "the demo button is on the intro screen");
await page.fill("#student", "Test Student"); await page.click("#introGo");
await page.waitForSelector("#cardNext");
const cards = []; for (let i = 0; i < 3; i++) { cards.push(await page.locator("#prelabBody").innerText()); if (i < 2) await page.click("#cardNext"); }
check(/Photoelectron/.test(cards[0]) && /how hard an electron is to knock loose/i.test(cards[1]) && /Peak/.test(cards[2]), "three cards define photoelectron, binding energy and peak in plain words");
check(!/wavelength|predict/i.test(cards.join(" ")), "cards never use wavelengths or ask for a prediction");
await page.click("#cardDone"); await page.waitForTimeout(200);
check((await page.locator("#dlgPrelab[open]").count()) === 0, "cards done opens the lab");
const walkTo = async (route) => { const D = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] }; for (const c of route) { await page.evaluate((d) => window.__vl.walk(d[0], d[1]), D[c]); await page.waitForTimeout(135); } };
await walkTo("UUUUUURRU"); await page.keyboard.press("e"); await page.waitForSelector("#dlgNotebook[open]");
check((await page.locator("#pesSpectrum").count()) === 1 && (await page.locator("#pesColor").count()) === 1 && (await page.locator("#pesBright").count()) === 1 && (await page.locator("#pesFire").count()) === 1, "spectrometer opens with spectrum, color, brightness and Fire on one screen");
await shot("spectrometer-start");

// ---------- Part A: lithium, guided sweep ----------
const arrowText = async () => page.evaluate(() => { const g = document.querySelector(".guide, #guide, [class*=guide]"); return g && !g.hidden ? g.innerText : ""; });
check((await H((k) => k.canPick(10))) === false && (await H((k) => k.canPick(3))) === true, "step 1 opens lithium only");
await page.click("#pesCell_3"); await setRange("#pesBright", 1000);
await page.click("#pesFire"); await setRange("#pesColor", 30); await page.waitForTimeout(900);
let d = await H((k) => ({ hits: k.det().hits, ph: k.det().photons }));
check(d.hits === 0 && d.ph > 20, "visible light frees nothing from lithium, however many photons fire (" + d.ph + " photons, " + d.hits + " electrons)");
check(/too weak/i.test(await page.locator("#dlgNotebook").innerText()), "the screen says the light is too weak");
await setRange("#pesColor", 330); await page.waitForTimeout(1200);
d = await H((k) => ({ hits: k.det().hits, seen: k.subsSeen() }));
check(d.hits > 0 && d.seen.join() === "2s", "ultraviolet frees only lithium's 2s electron first");
await page.click("#pesSpectrum", { position: { x: 400, y: 100 } }).catch(() => {});
const pxs = await H((k) => k.peakX("2s")); const box = await page.locator("#pesSpectrum").boundingBox();
await page.mouse.click(box.x + pxs * (box.width / 560), box.y + 120);
check(/2s: 1 electrons|2s: 1 electron/.test(await page.locator("#pesPeak").innerText()), "clicking a peak shows subshell, electron count and energy: " + (await page.locator("#pesPeak").innerText()));
await setRange("#pesColor", 700); await page.waitForTimeout(1500);
await page.click("#pesStop");
check((await st()).li.done === true, "lithium's whole spectrum is a finished guided run");
await shot("spectrometer-li");
check((await step()) === "free", "step 2 opens after lithium");

// ---------- Part A: free runs ----------
async function fullRun(Z) {
  await page.click("#pesCell_" + Z); await setRange("#pesColor", 1000); await setRange("#pesBright", 1000); await page.click("#pesFire");
  await page.waitForFunction(() => { const k = window.__vl.fl.hooks, d = k.det(); return d.hits >= 450 && d.spec && k.subsSeen().length === d.spec.length; }, null, { polling: 100 }); if (await page.locator("#pesStop").isEnabled()) await page.click("#pesStop");
}
for (const Z of [10, 11, 16, 4]) await fullRun(Z);
const runs = (await st()).runs; check(runs.filter((r) => r.phase === "free" && r.complete).length === 4, "Ne, Na, S and one free choice are logged as complete free runs");
check((await step()) === "cp1", "Checkpoint 1 opens");

// ---------- checkpoints ----------
const seed = () => H((k) => k.seed());
const cpItem = async (type) => page.evaluate(([ty, sd, n]) => window.PESPractice.labSpec(n, ty, sd), [type, await seed(), await H((k, ty) => k.state().cp[ty].n, type)]);
const cpAnswer = async (type, mode) => { const it = await cpItem(type); return { it, ans: it.ans }; };
async function answerRead(right) {
  const { it } = await cpAnswer("read"); const a = right ? String(it.ans) : (typeof it.ans === "number" ? String(it.ans + 3) : (it.ans === "1s" ? "2p" : "1s"));
  await page.fill("#pesAnswer", a); await page.click("#pesCheck"); return it;
}
await page.waitForSelector("#pesAnswer");
check(/Checkpoint|In a row/.test(await page.locator("#pesStep").innerText()), "Checkpoint 1 shows a question and the streak");
check((await page.locator("#pesCpSpec").count()) === 1, "a generated spectrum is shown for the read question");
const w1 = await answerRead(false);
const msg = await page.locator("#pesStep .pesMsg").first().innerText();
check(/Not yet/.test(msg) && !msg.includes("Right"), "a miss says so: " + msg.slice(0, 80));
check(!(typeof w1.ans === "number" ? new RegExp("\\b" + w1.ans + " electrons\\b").test(msg.replace(/Ne run.*?6 tall/, "")) : msg.includes("is " + w1.ans)), "the hint does not give the answer");
const w2 = await cpItem("read"); check(JSON.stringify(w2.p) !== JSON.stringify(w1.p), "after a miss the next variant is different");
for (let i = 0; i < 3; i++) await answerRead(true);
check((await st()).cp.read.passed === true && (await step()) === "bdraw", "three right in a row passes Checkpoint 1");
check((await st()).cp.read.att.length === 4, "every attempt is recorded (" + (await st()).cp.read.att.length + ")");

// ---------- Part B: the draw bench ----------
async function setBars(sel, bars) {
  for (let i = 0; i < 6; i++) { const s = `${sel} .pesSlot[data-i="${i}"]`; for (let c = 0; c < 6; c++) await page.click(`${s} button[aria-label$="shorter"]`); await page.selectOption(`${s} select`, bars[i] ? bars[i].sub : ""); for (let c = 0; c < (bars[i] ? bars[i].count : 0); c++) await page.click(`${s} button[aria-label$="taller"]`); }
}
const CFG = (sym) => page.evaluate((z) => window.PESData.occupied(z).map((o) => ({ sub: o.sub, count: o.count })), [..."H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca".split(" ")].indexOf(sym) + 1);
check(/Draw the spectrum for O/.test(await page.locator("#pesStep").innerText()), "Part B starts with oxygen");
check((await page.locator("#pesDraw").count()) === 1, "the draw bench is on the same screen");
await setBars("#pesDraw", Array.from({ length: 6 }, () => ({ sub: "1s", count: 1 }))); await page.click("#pesCheck");
check(/6 bars of height 1/.test(await page.locator("#pesStep").innerText()), "one bar per electron gets the hint about the Ne run");
await setBars("#pesDraw", [{ sub: "1s", count: 2 }, { sub: "2p", count: 4 }, { sub: "2s", count: 2 }]); await page.click("#pesCheck");
check(/2p bar sits left of your 2s/.test(await page.locator("#pesStep").innerText()), "2p left of 2s gets a hint that points at the real Ne run");
await setBars("#pesDraw", [{ sub: "2p", count: 4 }, { sub: "2s", count: 2 }, { sub: "1s", count: 2 }]); await page.click("#pesCheck");
check(/other way/.test(await page.locator("#pesStep").innerText()), "an increasing axis gets the hint about the AP axis");
await setBars("#pesDraw", await CFG("O")); await page.click("#pesCheck"); check((await st()).draws.O.ok === true, "the right drawing for O is accepted");
await page.click("#pesCompare"); await page.waitForFunction(() => window.__vl.fl.hooks.state().draws.O.compared, null, { polling: 150 }); await shot("compare-O");
check(await page.locator("#pesStep").innerText().then((t) => /Mg/.test(t)), "after comparing O the bench moves on to Mg");
for (const sym of ["Mg", "Si"]) {
  if (sym === "Si") check(/period 3, group 14/.test(await page.locator("#pesStep").innerText()) && (await page.locator("#pesTable").count()) === 1, "Si is drawn from its place on the table");
  await setBars("#pesDraw", await CFG(sym)); await page.click("#pesCheck"); await page.click("#pesCompare"); await page.waitForFunction((k) => window.__vl.fl.hooks.state().draws[k].compared, sym, { polling: 150 });
}
check((await step()) === "cp2", "O, Mg and Si compared: Checkpoint 2 opens");

// ---------- Checkpoint 2: three misses lock the screen ----------
await shot("cp2");
for (let i = 0; i < 3; i++) await page.click("#pesCheck");
await page.waitForSelector("#pesLock:not([hidden])");
check(/Get Mr\. D/.test(await page.locator("#pesLock").innerText()), "three misses in a row lock the screen and say to get Mr. D");
check(!/hint|answer is/i.test(await page.locator("#pesLock").innerText()), "the lock screen shows no answer");
await shot("lock");
await page.keyboard.press("Escape"); await page.waitForTimeout(150);
check((await page.locator("#dlgNotebook[open]").count()) === 1, "Escape does not close the locked screen");
check(await page.locator("#pesFire").isDisabled() && await page.locator("#pesCell_10").isDisabled(), "the carousel and Fire are dead while locked");
let rec0 = await st(); check(rec0.lock && rec0.lock.type === "draw" && rec0.locks.length === 1, "the lock is in the saved state");
// reload: the lock survives; so does "Start over"
await page.goto(url); await page.waitForSelector("#pesLock:not([hidden])", { timeout: 8000 }).catch(() => {});
check((await page.locator("#pesLock:not([hidden])").count()) === 1, "after a reload the lock is still there (and there was no start-over prompt)");
await page.goto(url + "&resume=1"); await page.waitForSelector("#pesLock:not([hidden])", { timeout: 8000 }).catch(() => {});
check((await page.locator("#pesLock:not([hidden])").count()) === 1, "a resumed save keeps the lock");
await page.fill("#pesPin", "0000"); await page.click("#pesPinGo"); await page.waitForTimeout(300);
check(/not right/.test(await page.locator("#pesLock").innerText()) && (await st()).lock, "a wrong PIN does not unlock");
await page.fill("#pesPin", await page.evaluate(() => window.MrD.codes.override())); await page.click("#pesPinGo"); await page.waitForSelector("#pesLock", { state: "hidden" });
let s1 = await st(); check(!s1.lock && s1.cp.draw.redo && s1.cp.draw.need === 2 && s1.cp.read.passed && !s1.cp.read.redo, "the right PIN unlocks and resets only the draw type (2 fresh variants needed)");
check(/Mr\. D unlocked/.test(await page.locator("#pesStep").innerText()), "the screen says how many new questions are needed");
async function drawCp(right) {
  const it = (await cpItem("draw")), bars = right ? it.ans : [];
  if (right) await setBars("#pesDraw", bars); await page.click("#pesCheck"); return it;
}
const v1 = await drawCp(true); const v2 = await cpItem("draw");
check(JSON.stringify(v1.p) !== JSON.stringify(v2.p), "the redo gives a fresh variant");
await drawCp(true);
s1 = await st(); check(s1.cp.draw.passed && !s1.cp.draw.redo, "two fresh variants in a row finish the redo and pass Checkpoint 2");
check((await step()) === "mystery", "Part C opens");

// ---------- the help button ----------
await page.click("#pesHelp"); await page.waitForSelector("#pesLock:not([hidden])");
s1 = await st(); check(s1.lock.reason === "help" && s1.helps.length === 1 && s1.lock.type === "match", "I need Mr. D locks the screen and is logged as a help request");
await page.fill("#pesPin", await page.evaluate(() => window.MrD.codes.override())); await page.click("#pesPinGo"); await page.waitForSelector("#pesLock", { state: "hidden" });
async function matchCp(right) { const it = await cpItem("match"); if (right) { await page.click(`#pesTable .pesEl[data-z="${it.ans.Z}"]`); await page.fill("#pesPeriod", String(it.ans.period)); await page.fill("#pesGroup", String(it.ans.group)); } await page.click("#pesCheck"); return it; }
check((await st()).cp.match.redo === true, "a help unlock also asks for two fresh variants of that type");
await matchCp(true); await matchCp(true);
check(!(await st()).cp.match.redo && (await step()) === "mystery", "two right resume Part C (Checkpoint 3 still has to be passed later)");

// ---------- Part C: mystery cells ----------
const mysCells = [];
for (const k of ["A", "B", "C", "D"]) {
  await fullRun(k); const mz = (await st()).mys[k].Z; mysCells.push(mz);
  if (k === "A") { const wrong = mz === 1 ? 2 : 1; await page.click(`#pesTable .pesEl[data-z="${wrong}"]`); await page.fill("#pesPeriod", "1"); await page.fill("#pesValence", "1"); await page.click("#pesCheck"); check(/peaks|electrons/.test(await page.locator("#pesStep .pesMsg").first().innerText()), "a wrong element gets a hint about the peaks, not the name"); }
  const pe = await page.evaluate((z) => [window.PESPractice.periodOf(z), window.PESPractice.valenceOf(z)], mz);
  await page.click(`#pesTable .pesEl[data-z="${mz}"]`); await page.fill("#pesPeriod", String(pe[0])); await page.fill("#pesValence", String(pe[1])); await page.click("#pesCheck");
}
check(mysCells[0] <= 10 && mysCells[1] <= 10 && mysCells[2] <= 18 && mysCells[3] <= 20 && new Set(mysCells).size === 4, "A and B are within Z 10, C within 18, D within 20, all different: " + mysCells.join(","));
check(/classmate says/.test(await page.locator("#pesStep").innerText()), "mystery D brings the flawed claim to correct");
const wrongSub = await H((k) => k.det().spec[k.det().spec.length - 1].sub); const px = async (sub) => { const b = await page.locator("#pesSpectrum").boundingBox(); return { b, x: await H((k, s) => k.peakX(s), sub) }; };
let q = await px(wrongSub); await page.mouse.click(q.b.x + q.x * (q.b.width / 560), q.b.y + 150);
check((await st()).flaw.tries === 1 && !(await st()).flaw.ok, "clicking the wrong peak does not correct the claim");
const leftSub = await H((k) => k.det().spec[0].sub); q = await px(leftSub); await page.mouse.click(q.b.x + q.x * (q.b.width / 560), q.b.y + 150);
check((await st()).flaw.ok === true && (await step()) === "cp3", "clicking the leftmost peak corrects the claim; Checkpoint 3 opens");
for (let i = 0; i < 3; i++) await matchCp(true);
check((await st()).cp.match.passed && (await step()) === "modelA", "Checkpoint 3 passed: Part D opens");

// ---------- Part D: Model A ----------
await page.click("#pesModelShow"); await page.waitForSelector("#pesFit", { timeout: 8000 }); await shot("model-A");
check((await H((k) => k.det().overlay && k.det().overlay.modelBars.length)) === 2, "Model A's two bars are drawn over neon's real spectrum");
await page.click("#pesFit"); check(/Look again/.test(await page.locator("#pesStep").innerText()), "choosing fit tells the student to look again");
await page.click("#pesNoFit"); check((await st()).modelA.choice === "nofit" && (await st()).modelA.first === "fit" && (await step()) === "phos", "choosing no fit records the choice; Part E opens");

// ---------- Part E: phosphorus last ----------
check(/period 3, group 15/.test(await page.locator("#pesStep").innerText()), "phosphorus is drawn from the table, last");
await setBars("#pesDraw", await CFG("P")); await page.click("#pesCheck"); await page.click("#pesCompare"); await page.waitForFunction(() => window.__vl.fl.hooks.state().draws.P.compared, null, { polling: 150 });
check((await step()) === "done", "every step is done");
check(!/AI|slip|stamp/i.test(await page.locator("#pesStep").innerText()), "no slip or stamp on the last step");

// ---------- hand in ----------
await page.click("#pesHand"); await page.waitForSelector("#dlgDone[open]");
const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#doneDl")]);
const rec = JSON.parse(readFileSync(await dl.path(), "utf8"));
check(rec.lab === "photoelectron" && rec.activeSec >= 0 && rec.pes && rec.pes.runs.length >= 13, "the record holds every run (" + (rec.pes && rec.pes.runs.length) + ")");
check(rec.pes.checkpoints.read.attempts.length === 4 && rec.pes.checkpoints.draw.attempts.length >= 5 && rec.pes.checkpoints.match.attempts.length >= 5, "the record holds every checkpoint attempt");
check(rec.pes.locks.length === 2 && rec.pes.locks.every((l) => l.unlockedAt) && rec.pes.helps.length === 1, "the record holds both locks, both unlocks and the help request");
check(["O", "Mg", "Si", "P"].every((k) => rec.pes.draws[k].ok && rec.pes.draws[k].compared) && ["A", "B", "C", "D"].every((k) => rec.pes.mystery[k].ok) && rec.pes.modelA.choice === "nofit", "the record holds draw, mystery and Model A results");
check(!(await page.locator("#donePrint").isVisible()) && !(await page.locator("#print").isVisible()), "there is no print button and no stamp");
check(rec.code === undefined && rec.minActive === undefined, "the record carries no end stamp or report code");
const quests = await page.evaluate(() => window.__vl.quests().length); check(quests === 17, "17 quests in the list (" + quests + ")");
await shot("done");

// ---------- the teacher page ----------
const tp = await ctx.newPage(); const terrs = []; tp.on("pageerror", (e) => terrs.push(e.message)); tp.on("console", (m) => { if (m.type() === "error") terrs.push(m.text()); });
await tp.route(/fonts\./, (r) => r.abort());
await tp.goto(ORIGIN + "/chemistry/virtual-lab/teacher.html"); await tp.waitForSelector("#drop");
await tp.evaluate((txt) => window.__teacher.load([new File([txt], "lab-record-test.json")]), JSON.stringify(rec)); await tp.waitForSelector("#pesRoster tbody tr");
const row = await tp.locator("#pesRoster tbody tr").first().innerText();
check(/Test Student|seed11/.test(row) || /yes/.test(row), "the roster card shows the student's row");
check(/2/.test(row) && /yes/.test(row), "the roster card shows hand-in, locks and unlocks: " + row.replace(/\s+/g, " ").slice(0, 160));
await tp.click("#pesRoster button:has-text('Detail')"); const dt = await tp.locator("#pesDetail").innerText();
check(/Locks/.test(dt) && /asked for help/.test(dt) && /three misses/.test(dt) && /Runs/.test(dt) && /Mystery cells/.test(dt) && /Timeline/.test(dt), "the detail lists locks, help requests, runs, mystery cells and the timeline");
const codeNow = await tp.evaluate(() => window.MrD.codes.override()); check(/^\d{4}$/.test(codeNow) && (await tp.locator("#codeUnlock").innerText()) === codeNow && (await tp.locator("#codeH1").innerText()) === await tp.evaluate(() => window.MrD.codes.huddle()), "the lab teacher page shows today's unlock and huddle codes");
check(terrs.length === 0, "no errors on the teacher page " + terrs.slice(0, 2).join("|"));

// ---------- the bundled key over file:// ----------
const { execFileSync } = await import("node:child_process");
let built = false; try { execFileSync("node", ["tools/bundle.mjs"], { cwd: ROOT + "chemistry/virtual-lab", stdio: "pipe" }); built = true; } catch (e) { console.log(String(e.stderr || e).slice(0, 300)); }
check(built && existsSync(ROOT + "chemistry/virtual-lab/dist/teacher-key.html"), "tools/bundle.mjs builds dist/teacher-key.html");
if (built) {
  const kp = await ctx.newPage(); const kerrs = []; kp.on("pageerror", (e) => kerrs.push(e.message)); kp.on("console", (m) => { if (m.type() === "error") kerrs.push(m.text()); });
  await kp.goto("file://" + ROOT + "chemistry/virtual-lab/dist/teacher-key.html?lab=pes&seed=11"); await kp.waitForSelector("#btnKey:not([hidden])", { timeout: 10000 });
  await kp.click("#btnKey"); await kp.waitForSelector("#dlgKey[open]"); const key = await kp.locator("#keyBody").innerText();
  check(/50-minute/.test(key) && /Unlock code/.test(key) && /Unlock code/.test(key) && /bypassed by a determined student/.test(key), "the key has the timing, the PIN setup and the lock caveat");
  check(/One bar per electron/.test(key) && /2p drawn left of 2s/.test(key) && /Taller means higher energy/.test(key) && /Axis read as increasing/.test(key) && /Same 1s energy for every element/.test(key), "the key lists the five wrong pictures and what each hint targets");
  check(/tunable light source/.test(key) && /Vaporized samples/.test(key) && /no photoionization cross-sections/.test(key) && /noPPE/.test(key), "the key names every simplification, including noPPE");
  check(/42 of the \d+ subshell energies are calculated/.test(key) && /NISTDFT-LDA/.test(key), "the key lists the calculated values as unverified");
  check(kerrs.length === 0, "no errors in the bundled key over file:// " + kerrs.slice(0, 2).join("|"));
  await kp.screenshot({ path: SHOTS ? `${SHOTS}/key.png` : "/dev/null" }).catch(() => {});
}
