/* Lab 6 (the Pull Bench), end to end in Chromium. Needs a static server at the repo root:
     python3 -m http.server 8123 &
     node chemistry/virtual-lab/test/zeff.e2e.js          (PLAYWRIGHT_DIR=... if playwright is not at /opt/node-tools; SHOTS=<dir> to keep screenshots)
   Walks the real route with the tutorial arrows, uses every control (table, slider, measure, ring marks, predict, mystery), the one huddle, hand-in and the record,
   then plays the demo and checks the student's state is the same before and after. */
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
const shot = async (n) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/zeff-${n}.png` }); };
const hk = (f, a) => page.evaluate(`(() => { const k = window.__vl.fl.hk; return (${f.toString()})(k, ${JSON.stringify(a ?? null)}); })()`);
const st = () => hk((k) => JSON.parse(JSON.stringify(k.state())));
const arrow = async () => page.evaluate(() => { const g = document.getElementById("guide"); return g && !g.hidden ? g.innerText.replace("▼", "").trim() : ""; });
const walkTo = async (route) => { const D = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] }; for (const c of route) { await page.evaluate((d) => window.__vl.walk(d[0], d[1]), D[c]); await page.waitForTimeout(135); } };
const url = ORIGIN + "/chemistry/virtual-lab/index.html?lab=zeff";

// ---------- intro, card ----------
await page.goto(url); await page.waitForSelector("#student");
check((await page.locator("#introDemo").count()) === 1, "the demo button is on the intro screen");
check(/Goal:/.test(await page.locator("#introBody").innerText()), "intro states the goal");
await page.fill("#student", "Test Student"); await page.click("#introGo"); await page.waitForSelector("#cardDone");
check(/outermost ring/.test(await page.locator("#prelabBody").innerText()), "the one picture card explains the nucleus, rings and the pulled electron");
await page.click("#cardDone"); await page.waitForTimeout(300);
check((await page.locator("#btnDemo").isVisible()), "the Demo button is in the top bar");

// ---------- tutorial arrows, step by step, on the real route ----------
check(/door/i.test(await arrow()), "arrow 1 points at the door: " + (await arrow()));
await walkTo("UUUU"); await page.waitForTimeout(200);
check(/pull bench/i.test(await arrow()), "after the door, the arrow points at the pull bench: " + (await arrow()));
await walkTo("UURRU"); await page.waitForTimeout(150); await page.keyboard.press("e"); await page.waitForSelector("#dlgNotebook[open]"); await page.waitForTimeout(250);
check(/Na/.test(await arrow()), "in the bench, the arrow says to click Na: " + (await arrow()));
await shot("bench-start");
check((await page.locator("#zeGrid button").count()) === 18, "the table holds the 18 atoms, lithium to calcium");
await page.click("#zeCell_11"); await page.waitForTimeout(150);
check(/Measure/.test(await arrow()), "after Na, the arrow points at Measure: " + (await arrow()));
check((await page.locator("#zeRings button").count()) === 2, "sodium shows two ring buttons (the inner rings)");
await page.click("#zeMeasure"); await page.waitForTimeout(200);
let s = await st();
check(s.measured.join() === "11" && /1\/9/.test(await page.locator("#zeRead").innerText()), "measuring sodium reads 1/9");
check(/Click ring 1/.test(await arrow()), "the arrow now says to click ring 1: " + (await arrow()));
await page.click("#zeRing_0"); await page.waitForTimeout(150);
check(/bigger/.test(await page.locator("#zeMatch").innerText()) && /ring 2/i.test(await arrow()), "one ring marked: the estimate is bigger than the meter, and the arrow points at ring 2: " + (await arrow()));
await page.click("#zeRing_1"); await page.waitForTimeout(200);
s = await st();
check(/matches/.test(await page.locator("#zeMatch").innerText()) && s.matched.join() === "11", "both inner rings marked: the estimate matches the meter");
check(!(await arrow()) || !/ring/i.test(await arrow()), "the ring arrows go away after the match");
await page.click("#zeRing_1"); check(/smaller|bigger/.test(await page.locator("#zeMatch").innerText()), "unmarking a ring breaks the match and says which way it is off");
await page.click("#zeRing_1");
await shot("sodium-matched");

// ---------- the slider, the table heat map, three matches ----------
await page.$eval("#zeSlider", (el) => { el.value = 5; el.dispatchEvent(new Event("input", { bubbles: true })); });
check((await st()).Z === 5 && /Boron|boron/i.test(await page.locator("#zeName").innerText()), "the proton slider loads the atom (boron at 5)");
await page.click("#zeMeasure"); await page.click("#zeRing_0");
await page.click("#zeCell_19"); await page.click("#zeMeasure"); await page.click("#zeRing_0"); await page.click("#zeRing_1"); await page.click("#zeRing_2");
s = await st(); check(s.matched.sort((a, b) => a - b).join() === "5,11,19", "three atoms matched: " + s.matched);
await page.click("#zeCell_3"); await page.click("#zeMeasure");
check((await page.locator("#zeCell_3").evaluate((el) => el.style.background)) !== "", "a measured atom lights up on the map");
check((await page.locator("#zeCell_4").evaluate((el) => el.style.background)) === "", "an unmeasured atom stays plain");
// the outer ring never counts
await page.click("#zeCell_11"); await page.evaluate(() => window.__vl.fl.hk.toggleRing(2)); check((await st()).marks[11].length <= 2 && !(await st()).marks[11][2], "the outer ring cannot be marked");

// ---------- predict gate, magnesium ----------
await page.click("#zeCell_12");
check((await page.locator("#zeMeasure").isDisabled()) && /prediction first/i.test(await page.locator("#zeLock").innerText()), "magnesium cannot be measured before the prediction");
await page.click("#zePredNa"); await page.click("#zeMeasure"); await page.waitForTimeout(200);
s = await st(); check(s.pred.choice === "na" && !s.pred.ok && s.measured.includes(12), "after a (wrong) prediction, magnesium measures and the miss is recorded");
check(/did not hold/.test(await page.locator("#zePred").innerText()), "the miss says to compare the two readings");

// ---------- mystery atom ----------
const mz = await hk((k) => k.mysZ()); const wrong = mz === 3 ? 4 : 3;
await page.click("#zeMysOn"); await page.click("#zeCell_" + wrong); check(/Not yet/.test(await page.locator("#zeMys").innerText()), "a wrong mystery guess gets a hint about the electrons, not the name");
await page.click("#zeCell_" + mz); check((await st()).mys.ok, "the right atom solves the mystery");
await shot("map");

// ---------- the one huddle (a note outside class), hand in ----------
check(await page.locator("#zeHand").isEnabled(), "Hand in is open after the prediction and the mystery atom");
await page.keyboard.press("Escape"); await page.waitForTimeout(300);
await page.evaluate(() => { const d = window.__vl.S; d.huddleAsk = 1; });
check((await page.locator("#btnHuddle").count()) === 1, "the Huddle code button is in the bar");
await page.click("#btnHuddle"); await page.waitForSelector("#huddleCode, #zeBlank_b1");
const blanks = ["inside", "cancel", "core", "11", "10", "1", "1/9"];
for (let i = 0; i < 7; i++) await page.fill("#zeBlank_b" + (i + 1), blanks[i]);
check(/note/i.test(await page.locator("#huddleBody").innerText()) || (await page.locator("#huddleCode").count()) === 1, "the huddle is a note or asks for the code");
if (await page.locator("#huddleCode").count()) { const code = await page.evaluate(() => MrD.codes.gateV3("zeff-pull", "h1")); await page.fill("#huddleCode", code); }
await page.click("#huddleGo"); await page.waitForTimeout(300);
check((await st()).huddle === true, "the huddle is done and logged");
await page.click("#btnNotebook"); await page.waitForSelector("#dlgNotebook[open]");
check(/core electrons/.test(await page.locator("#zeTally").innerText()), "after the huddle the strip uses the word core electrons");
await page.click("#zeHand"); await page.waitForSelector("#dlgDone[open]");
const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#doneDl")]);
const rec = JSON.parse(readFileSync(await dl.path(), "utf8"));
check(rec.lab === "zeff-pull" && rec.zeff && rec.zeff.handed && rec.zeff.matched.length >= 3 && rec.zeff.huddle, "the record holds the matches, the huddle and the hand-in");
check(rec.zeff.mystery.ok && rec.zeff.predict.choice === "na" && Object.keys(rec.zeff.marks).length >= 3, "the record holds the mystery, the prediction and the ring marks");
check(rec.events.some((e) => e.type === "zeff_mark") && rec.events.some((e) => e.type === "zeff_match"), "the log holds every mark and match");
await shot("done");

// ---------- the demo ----------
const ctx2 = await browser.newContext({ reducedMotion: "reduce", timezoneId: "America/New_York", viewport: { width: 1280, height: 720 } }), page2 = await ctx2.newPage();
page2.on("pageerror", (e) => errors.push(e.message)); await page2.route(/fonts\./, (r) => r.abort()); await page2.clock.setFixedTime(new Date("2026-10-21T07:30:00-04:00"));
await page2.goto(url); await page2.waitForSelector("#student"); await page2.fill("#student", "Demo Student"); await page2.click("#introGo"); await page2.click("#cardDone"); await page2.waitForSelector("#btnDemo", { state: "visible" });
await page2.waitForTimeout(500);
const shot2 = async (n) => { if (SHOTS) await page2.screenshot({ path: `${SHOTS}/zeff-${n}.png` }); };
const before = JSON.stringify(await page2.evaluate(() => ({ stage: window.__vl.S.stage, flame: window.__vl.S.flame })));
await page2.click("#btnDemo");
const caps = new Set(); let guard = 0;
while (guard++ < 400) { await page2.waitForTimeout(250); const t = await page2.locator("#demoText").innerText().catch(() => ""); const m = /Demo (\d+) of (\d+)/.exec(t); if (m) caps.add(+m[1]); if (m && m[1] === "5" && !caps.has("shot")) { caps.add("shot"); await shot2("demo-measure"); } if (!(await page2.locator("#demoBar").isVisible()) && caps.size > 3) break; }
check([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) => caps.has(n)), "the demo shows all 10 captions: " + [...caps].filter((x) => typeof x === "number").join());
const after = JSON.stringify(await page2.evaluate(() => ({ stage: window.__vl.S.stage, flame: window.__vl.S.flame })));
check(before === after, "the student's state is the same after the demo as before");
check((await page2.evaluate(() => window.__vl.log.events.filter((e) => /zeff_(pick|measure|mark|match)/.test(e.type)).length)) === 0, "the demo logged nothing");

check(errors.length === 0, "no page errors " + errors.slice(0, 3).join(" | "));
await browser.close();
if (fails.length) { console.log("\n" + fails.length + " FAILED"); process.exit(1); } else console.log("\nall ok");
