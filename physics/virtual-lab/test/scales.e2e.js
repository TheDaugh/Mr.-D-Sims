/* Lab 6 (the Spring Scale Bench), end to end in Chromium. Needs a static server at the repo root:
     python3 -m http.server 8123 &
     node physics/virtual-lab/test/scales.e2e.js          (PLAYWRIGHT_DIR=... if playwright is not at /opt/node-tools; SHOTS=<dir> to keep screenshots)
   Walks the real route with the tutorial arrows, uses every control in the four parts, the three checks (a miss gives a hint and a new question,
   three right pass, three misses lock, the lock survives a reload, a wrong code fails, today's code resets only that check, the help button locks),
   the one huddle, hand-in and the record, then plays the demo and checks the student's state is the same before and after. */
import { createRequire } from "node:module";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR || "/opt/node-tools/node_modules/playwright");
const ORIGIN = process.env.BASE || "http://localhost:8123", SHOTS = process.env.SHOTS || "";
const fails = [], check = (c, m) => { if (!c) { fails.push(m); console.log("FAIL " + m); } else console.log("ok   " + m); };
if (SHOTS && !existsSync(SHOTS)) mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch(), ctx = await browser.newContext({ reducedMotion: "reduce", timezoneId: "America/New_York", viewport: { width: 1280, height: 720 }, acceptDownloads: true }), page = await ctx.newPage();
page.setDefaultTimeout(9000);
const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.route(/fonts\./, (r) => r.abort());
await page.clock.setFixedTime(new Date("2026-10-21T07:30:00-04:00"));
const shot = async (n) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/scales-${n}.png` }); };
const hk = (f, a) => page.evaluate(`(() => { const k = window.__vl.fl.hk; return (${f.toString()})(k, ${JSON.stringify(a ?? null)}); })()`);
const st = () => hk((k) => JSON.parse(JSON.stringify(k.state())));
const step = () => hk((k) => k.stepId());
const arrow = async () => page.evaluate(() => { const g = document.getElementById("guide"); return g && !g.hidden ? g.innerText.replace("▼", "").trim() : ""; });
const walkTo = async (route) => { const D = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] }; for (const c of route) { await page.evaluate((d) => window.__vl.walk(d[0], d[1]), D[c]); await page.waitForTimeout(135); } };
const url = ORIGIN + "/physics/virtual-lab/index.html?lab=06-spring-scales";
const Q = (t) => hk((k, ty) => k.question(ty), t);
const answer = async (v) => { await page.fill("#ssCkIn", String(v)); await page.click("#ssCkGo"); await page.waitForTimeout(120); };
const passCheck = async (n) => { for (let i = 0; i < n; i++) await answer((await Q(await hk((k) => ({ cp1: "spring", cp2: "string", cp3: "hang" })[k.stepId()] || ["spring", "string", "hang"].find((t) => k.state().cp[t].redo)))).ans); };

// ---------- intro, cards ----------
await page.goto(url); await page.waitForSelector("#student");
check((await page.locator("#introDemo").count()) === 1, "the demo button is on the intro screen");
check(/Goal:/.test(await page.locator("#introBody").innerText()), "intro states the goal");
check(!/Mr\. D|extension|challenge|optional|★/i.test(await page.locator("#introBody").innerText()), "the intro names no teacher and no tier");
await page.fill("#student", "Test Student"); await page.click("#introGo"); await page.waitForSelector("#cardNext");
check(/F = kx/.test(await page.locator("#prelabBody").innerText()), "card 1 explains the spring scale");
await page.click("#cardNext"); check(/below/.test(await page.locator("#prelabBody").innerText()), "card 2 explains tension and what hangs below");
await page.click("#cardDone"); await page.waitForTimeout(300);

// ---------- tutorial arrows on the real route ----------
check(/door/i.test(await arrow()), "arrow 1 points at the door: " + (await arrow()));
await walkTo("ULLUU"); await page.waitForTimeout(200);
check(/scale bench/i.test(await arrow()), "after the door, the arrow points at the scale bench: " + (await arrow()));
await walkTo("U"); await page.waitForTimeout(150); await page.keyboard.press("e"); await page.waitForSelector("#dlgNotebook[open]"); await page.waitForTimeout(250);
check(/mass/i.test(await arrow()), "in the bench, the arrow says to hang a mass: " + (await arrow()));
await shot("bench-start");

// ---------- Part A ----------
const k = await hk((x) => x.k());
await page.click("#ssMass_1"); await page.waitForTimeout(150);
check(/Record/.test(await arrow()), "after hanging, the arrow points at Record: " + (await arrow()));
check((await page.locator("#ssDial").innerText()).includes(String((Math.round(0.2 * 9.8 / k * 1000) / 10).toFixed(1))), "the dial shows the stretch in cm on the ruler");
await page.click("#ssRecord"); await page.click("#ssRecord"); await page.waitForTimeout(100);
check((await st()).cal.rows.length === 1, "recording the same mass twice keeps one row");
check((await page.locator("#ssK").count()) === 0, "k waits for three masses");
await page.click("#ssMass_0"); await page.click("#ssRecord"); await page.click("#ssMass_3"); await page.click("#ssRecord"); await page.waitForTimeout(150);
check((await page.locator("#ssRight table tr").count()) === 4, "the table holds three rows");
await page.fill("#ssK", String(k / 100)); await page.click("#ssKGo"); await page.waitForTimeout(100);
check(/metres/.test(await page.locator("#ssLeft").innerText()) && !(await st()).cal.ok, "k in the wrong units gets the metres hint");
await page.fill("#ssK", String(k)); await page.click("#ssKGo"); await page.waitForTimeout(150);
check((await st()).cal.ok && (await step()) === "cp1", "the right k calibrates the scale and opens check 1");
check(/N/.test(await page.locator("#ssDial").innerText()), "the calibrated scale also reads in newtons");
await shot("part-a");

// ---------- check 1: a miss gives a hint (never the answer) and a new question; three right pass ----------
let q = await Q("spring"); await answer(q.ans * 1.5 + 2);
const leftTxt = await page.locator("#ssCheck").innerText();
check(/Not yet/.test(leftTxt) && !leftTxt.includes(String(q.ans)), "a wrong answer gets a hint that does not give the number");
check((await Q("spring")).key !== q.key, "a miss serves a new question");
await passCheck(3); check((await st()).cp.spring.passed && (await step()) === "string", "three right in a row pass check 1 and open Part B");
check((await page.locator("#ssTab_B").isEnabled()) && (await page.locator("#ssTab_C").isDisabled()), "Part B is open; Part C is not yet");

// ---------- Part B ----------
await page.click("#ssTab_B"); await page.waitForTimeout(100);
await page.click("#ssRecord"); await page.waitForTimeout(100);
let s = await st(); check(s.str.runs.length === 1 && s.str.runs[0].mode === "held" && Math.abs(s.str.runs[0].T - 0.5 * 9.8) < 0.01, "held still, the scale reads mg");
await page.click("#ssRelease"); await page.waitForTimeout(100); check((await st()).str.mode === "held", "release waits for a prediction");
await page.click("#ssPred_less"); await page.click("#ssRelease"); await page.waitForTimeout(400); await page.click("#ssRecord");
s = await st(); check(s.str.runs[1].mode === "released" && s.str.runs[1].pred === "less" && s.str.runs[1].T < s.str.runs[0].T, "released, it reads less, and the prediction is in the run");
await page.click("#ssCart_2"); await page.click("#ssPred_same"); await page.click("#ssRelease"); await page.waitForTimeout(300); await page.click("#ssRecord");
await shot("part-b");
check((await step()) === "cp2", "a held run and two released setups finish Part B");

// ---------- check 2: three misses lock, the lock survives a reload, a wrong code fails, today's code resets only this check ----------
for (let i = 0; i < 2; i++) { q = await Q("string"); await answer(q.ans + 7); }
check(!(await st()).lock, "two misses do not lock");
q = await Q("string"); await answer(q.ans + 7); await page.waitForSelector("#ssLockBox:not([hidden])");
s = await st(); check(s.lock && s.lock.type === "string" && s.locks.length === 1, "three misses in a row lock the screen");
check(!/= \d/.test(await page.locator("#ssLockBox").innerText()) && !/Mr\. D/.test(await page.locator("#ssLockBox").innerText()), "the lock screen shows no answer and names no teacher");
await page.keyboard.press("Escape"); await page.waitForTimeout(150); check((await page.locator("#dlgNotebook[open]").count()) === 1, "Escape does not close the locked screen");
await page.goto(url + "&resume=1"); await page.waitForSelector("#ssLockBox:not([hidden])", { timeout: 8000 }).catch(() => {});
check((await page.locator("#ssLockBox:not([hidden])").count()) === 1, "after a reload the lock is still there");
await page.fill("#ssPin", "0000"); await page.click("#ssPinGo"); await page.waitForTimeout(200);
check(/not right/.test(await page.locator("#ssLockBox").innerText()) && (await st()).lock, "a wrong code does not unlock");
const today = await page.evaluate(() => MrD.codes.override());
await page.fill("#ssPin", today); await page.click("#ssPinGo"); await page.waitForSelector("#ssLockBox", { state: "hidden" });
s = await st(); check(!s.lock && s.cp.string.redo && s.cp.string.need === 2 && s.cp.spring.passed && !s.cp.spring.redo, "today's code opens it and resets only the string check (2 fresh ones needed)");
check(/unlocked/.test(await page.locator("#ssCheck").innerText()), "the screen says how many new ones are needed");
await passCheck(2); s = await st(); check(s.cp.string.passed && !s.cp.string.redo && (await step()) === "hyatt", "two fresh right pass check 2 and open Part C");

// ---------- Part C ----------
await page.click("#ssTab_C"); await page.waitForTimeout(100);
await page.click("#ssRecord"); check((await page.locator("#ssHy_both").count()) === 0, "the question waits for both designs");
await page.click("#ssDesign_two"); await page.click("#ssRecord"); await page.waitForTimeout(100);
s = await st(); const [one, two] = s.hy.rows; check(one.upperRod === two.upperRod && one.lowerRod === two.lowerRod && Math.abs(two.nut - 2 * one.nut) < 0.01, "the rods read the same; as built, the nut holds twice as much");
await page.click("#ssHy_own"); check(/Compare/.test(await page.locator("#ssLeft").innerText()) && (await step()) === "hyatt", "a wrong choice points back at the readings");
await page.click("#ssHy_both"); await page.waitForTimeout(100);
check(/Kansas City/.test(await page.locator("#ssLeft").innerText()) && (await step()) === "chain", "the right choice tells the real story and opens Part D");
await shot("part-c");

// ---------- Part D ----------
await page.click("#ssTab_D"); await page.waitForTimeout(100);
for (const j of [1, 3, 5]) { await page.click("#ssGap_" + j); await page.click("#ssRecord"); }
s = await st(); check(s.ch.rows.length === 3 && s.ch.rows[0].T < s.ch.rows[1].T && s.ch.rows[1].T < s.ch.rows[2].T, "higher gaps hold more");
await page.click("#ssGap_6"); await page.click("#ssRecord"); check(!(await st()).ch.rows.some((r) => r.at === 6) && /\?/.test(await page.locator("#ssDial").innerText()), "the top cannot be read before the prediction");
await page.fill("#ssTop", "1"); await page.click("#ssTopGo"); await page.waitForTimeout(100);
check(/what you left out/.test(await page.locator("#ssLeft").innerText()), "a wrong prediction is kept and says to compare");
await page.click("#ssRecord"); s = await st(); check(s.ch.rows.some((r) => r.at === 6) && (await step()) === "cp3", "reading the top finishes Part D and opens check 3");
await page.locator(".ssGapHit[data-j='2']").click(); check((await st()).ch.at === 2, "clicking a gap on the chain moves the scale");
await shot("part-d");

// ---------- check 3: the help button locks; after the code, two fresh right pass ----------
await page.click("#ssHelp"); await page.waitForSelector("#ssLockBox:not([hidden])"); s = await st(); check(s.lock.reason === "help" && s.lock.type === "hang" && s.helps.length === 1, "the help button locks the screen and is logged");
await page.fill("#ssPin", today); await page.click("#ssPinGo"); await page.waitForSelector("#ssLockBox", { state: "hidden" });
await passCheck(2); s = await st(); check(s.cp.hang.passed && (await step()) === "done", "two fresh right pass check 3");

// ---------- the one huddle (a note outside class), hand in ----------
check(await page.locator("#ssHand").isEnabled(), "Hand in is open when every part and check is done");
await page.keyboard.press("Escape"); await page.waitForTimeout(300);
await page.evaluate(() => { window.__vl.S.huddleAsk = 1; });
check((await page.locator("#btnHuddle").count()) === 1, "the Huddle code button is in the bar");
await page.click("#btnHuddle"); await page.waitForSelector("#ssBlank_b1");
for (const [i, w] of ["x", "mg", "less", "below", "weight"].entries()) await page.fill("#ssBlank_b" + (i + 1), w);
if (await page.locator("#huddleCode").count()) await page.fill("#huddleCode", await page.evaluate(() => MrD.codes.gateV3("spring-scales", "h1")));
await page.click("#huddleGo"); await page.waitForTimeout(300); check((await st()).huddle === true, "the huddle is done and logged");
await page.click("#btnNotebook"); await page.waitForSelector("#dlgNotebook[open]");
await page.click("#ssHand"); await page.waitForSelector("#dlgDone[open]");
const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#doneDl")]);
const rec = JSON.parse(readFileSync(await dl.path(), "utf8"));
check(rec.lab === "spring-scales" && rec.scales && rec.scales.handed && rec.scales.huddle && rec.scales.k === k, "the record holds the scale, the huddle and the hand-in");
check(rec.scales.calibrate.rows.length === 3 && rec.scales.string.length === 3 && rec.scales.hyatt.ok && rec.scales.chain.prediction && rec.scales.locks.length === 2, "the record holds every part, the prediction and both locks");
check(["spring", "string", "hang"].every((t) => rec.scales.checks[t].passed) && rec.events.some((e) => e.type === "scales_attempt"), "the record holds the three checks and every attempt ");
await shot("done");

// ---------- in class, the bell calls the one huddle at the middle of the lab (minute 13 of 25), and never at minute 3 ----------
for (const [at, want, what] of [["2026-10-21T09:04:00-04:00", false, "no huddle at minute 3"], ["2026-10-21T09:15:00-04:00", true, "the bell calls the one huddle at the middle (minute 13 of 25)"]]) {
  const c3 = await browser.newContext({ reducedMotion: "reduce", timezoneId: "America/New_York", viewport: { width: 1280, height: 720 } }), p3 = await c3.newPage();
  p3.on("pageerror", (e) => errors.push(e.message)); await p3.route(/fonts\./, (r) => r.abort()); await p3.clock.setFixedTime(new Date(at));
  await p3.goto(url); await p3.waitForSelector("#student"); await p3.fill("#student", "Clock Test"); await p3.click("#introGo"); await p3.click("#cardNext"); await p3.click("#cardDone");
  await p3.waitForFunction(() => document.querySelector("#dlgHuddle") && document.querySelector("#dlgHuddle").open, null, { timeout: 6000 }).catch(() => {});
  const open = await p3.evaluate(() => !!(document.querySelector("#dlgHuddle") || {}).open);
  check(open === want && (!want || (await p3.locator("#ssBlank_b1").count()) === 1), what); await c3.close();
}

// ---------- the demo ----------
const ctx2 = await browser.newContext({ reducedMotion: "reduce", timezoneId: "America/New_York", viewport: { width: 1280, height: 720 } }), page2 = await ctx2.newPage();
page2.on("pageerror", (e) => errors.push(e.message)); await page2.route(/fonts\./, (r) => r.abort()); await page2.clock.setFixedTime(new Date("2026-10-21T07:30:00-04:00"));
await page2.goto(url); await page2.waitForSelector("#student"); await page2.fill("#student", "Demo Student"); await page2.click("#introGo"); await page2.click("#cardNext"); await page2.click("#cardDone"); await page2.waitForSelector("#btnDemo", { state: "visible" });
await page2.waitForTimeout(500);
const before = JSON.stringify(await page2.evaluate(() => ({ stage: window.__vl.S.stage, flame: window.__vl.S.flame })));
await page2.click("#btnDemo");
const caps = new Set(); let guard = 0;
while (guard++ < 500) { await page2.waitForTimeout(250); const t = await page2.locator("#demoText").innerText().catch(() => ""); const m = /Demo (\d+) of (\d+)/.exec(t); if (m) caps.add(+m[1]); if (SHOTS && m && !caps.has("s" + m[1])) { caps.add("s" + m[1]); await page2.screenshot({ path: `${SHOTS}/scales-demo-${m[1]}.png` }); } if (!(await page2.locator("#demoBar").isVisible()) && caps.size > 3) break; }
check([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) => caps.has(n)), "the demo shows all 10 captions: " + [...caps].filter((x) => typeof x === "number").join());
const after = JSON.stringify(await page2.evaluate(() => ({ stage: window.__vl.S.stage, flame: window.__vl.S.flame })));
check(before === after, "the student's state is the same after the demo as before");
check((await page2.evaluate(() => window.__vl.log.events.filter((e) => /scales_(hang|record|release|design|gap)/.test(e.type)).length)) === 0, "the demo logged nothing");

check(errors.length === 0, "no page errors " + errors.slice(0, 3).join(" | "));
await browser.close();
if (fails.length) { console.log("\n" + fails.length + " FAILED"); process.exit(1); } else console.log("\nall ok");
