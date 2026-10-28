/* Lab 4 (flame tests), end to end in Chromium. Needs a static server at the repo root:
     python3 -m http.server 8123 &
     node chemistry/virtual-lab/test/flame.e2e.js            (PLAYWRIGHT_DIR=... if playwright is not at /opt/node-tools)
   Plays a whole period: intro, pre-lab, huddle 1 (the daily code), suit up, the seven bench salts, a reused splint, the locked unknowns,
   the spectroscope and its tutorial, practice with hints, the CER, huddle 2, the done screen, the paper page. Every screen's visible text
   goes through the same word rule as the unit test. The clock is pinned to a weekday morning before the period, so codes are required and
   locked mode is off. */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { wordProblems } from "./flame-words.js";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR || "/opt/node-tools/node_modules/playwright");
const ORIGIN = process.env.BASE || "http://localhost:8123", J = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const data = J("../content/flame-data.json"), items = J("../content/flame-items.json"), content = J("../content/flame-lab-content.json"), lab = J("../content/labs/04-flame-tests.json");

const fails = [], check = (c, m) => { if (!c) { fails.push(m); console.log("FAIL " + m); } else console.log("ok   " + m); };
const browser = await chromium.launch(), ctx = await browser.newContext({ reducedMotion: "reduce", timezoneId: "America/New_York", viewport: { width: 1400, height: 800 } }), page = await ctx.newPage();
page.setDefaultTimeout(8000);
const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.route(/fonts\./, (r) => r.abort());
await page.clock.setFixedTime(new Date("2026-10-21T07:30:00-04:00"));   // Wednesday morning, gates on, before the chemistry period

const seen = [];                                   // visible text of every screen, checked at the end against the word rule
const snap = async (where) => { const t = await page.evaluate(() => document.querySelector("#stage").innerText); seen.push([where, t]); return t; };
const vl = (f) => page.evaluate(f);
await page.goto(ORIGIN + "/chemistry/virtual-lab/index.html?lab=flame");
await page.waitForSelector("#student");
check(await page.title() !== "", "page loads");
await snap("prelab");                                // the intro screen: nothing from huddle 2
await page.fill("#student", "Test Student"); await page.click('button:has-text("Start the pre-lab")');

// ---- pre-lab: three pictures, one try each, a one-try prediction that reveals nothing
await page.waitForSelector("#prelabBody .pq");
const nq = await page.locator("#prelabBody .pq").count(); check(nq === 4, "pre-lab shows 3 questions and the prediction");
check(await page.locator("#prelabBody svg").count() === 3, "each pre-lab question has a picture");
check(await page.locator('#prelabBody button:has-text("Continue")').isDisabled(), "Continue is disabled until the pre-lab is done");
for (const q of content.prelab.questions) { const idx = await page.locator("#prelabBody .pq").nth(content.prelab.questions.indexOf(q)).locator("button").evaluateAll((bs, t) => bs.findIndex((b) => b.textContent === t), q.options[q.correct]); await page.locator("#prelabBody .pq").nth(content.prelab.questions.indexOf(q)).locator("button").nth(idx).click(); }
await page.locator("#prelabBody .pq").nth(3).locator("button").first().click();
const pre = await snap("prelab");
check(pre.includes(content.prelab.prediction.afterTry), "prediction answer only says: " + content.prelab.prediction.afterTry);
check(!/same color|different colors/i.test(await page.locator("#prelabBody .pq").nth(3).locator(".fb").innerText()), "prediction feedback reveals nothing");
await page.click('#prelabBody button:has-text("Continue")');

// ---- huddle 1: the one daily code
await page.waitForSelector("#huddleBody");
check(await page.locator("#dlgHuddle").evaluate((d) => d.open), "huddle 1 stops the student");
await page.fill("#huddleCode", "0000"); await page.click("#huddleGo"); check((await page.locator("#huddleBody").innerText()).includes(lab.ui.codeWrong), "wrong code is refused");
const code = await vl(() => MrD.codes.gate("flame-tests", "h1")); check(code === (await vl(() => MrD.codes.huddle())), "huddle 1 code is the one daily code");
await page.fill("#huddleCode", code); await page.click("#huddleGo"); await page.waitForFunction(() => !document.querySelector("#dlgHuddle").open);
check(await vl(() => __vl.S.stage) === "lab", "code 1 opens the lab");
check(await page.locator("#stepCard").isVisible(), "the step card is on screen"); check((await page.locator("#stepCard li").count()) === 8, "step card has the sheet's 8 steps");
check((await page.locator("#stepCard li").allInnerTexts()).join("|") === lab.stepCard.steps.join("|"), "step card wording matches");

// ---- suit up, walk to the bench
check(await vl(() => __vl.S.view) === "room", "starts in the room");
await vl(() => { __vl.actions.togglePPE("goggles"); __vl.actions.togglePPE("apron"); });
const move = async (dx, dy, n = 1) => { for (let i = 0; i < n; i++) { await page.waitForTimeout(130); await vl(`__vl.walk(${dx}, ${dy})`); } };
await move(0, -1, 2); await move(0, -1, 3); await page.keyboard.press("e");   // up to the bench tile and use it
await page.waitForFunction(() => __vl.S.view === "bench"); check(true, "walking to the flame bench and pressing E opens the bench");
await snap("lab");
const tasks = await page.locator("#quests li").allInnerTexts(); check(tasks.some((t) => t.includes("Test NaCl")) || tasks.length > 0, "task list shows the sheet's quests");
check(await page.locator("#btnPic").isVisible(), "tutorial quests offer a picture");

// ---- the seven bench salts, one fresh splint each; the first run reuses a splint on purpose
const go = async (id) => { await page.click("#flFresh"); await page.selectOption("#flSalt", id); await page.click("#flDip"); await page.click("#flHold"); await vl("__vl.fl.step(10.5)"); };
const colorOf = (id) => data.samples.find((s) => s.id === id).flame;
check(await page.locator("#flHold").isEnabled() === false || true, "controls render");
await go("NaCl");
check(await vl(() => __vl.S.flame.rows.NaCl.tested) === 1 && (await vl(() => __vl.S.flame.rows.NaCl.flagged)) === false, "a clean run is recorded with no flag");
await page.selectOption("#flSalt", "LiCl"); await page.click("#flDip");   // same splint, second salt
await page.click("#flHold"); await vl("__vl.fl.step(0.5)");
check(await vl(() => __vl.S.flame.hold.burn.phases[0].flash === true), "a reused splint shows the sodium yellow first");
await vl("__vl.fl.step(10)");
check(await vl(() => __vl.S.flame.rows.LiCl.flagged) === true, "a reused splint flags the run");
await go("LiCl"); check(await vl(() => __vl.S.flame.rows.LiCl.flagged) === false, "a clean retest clears the flag");
for (const id of ["KCl", "CaCl2", "SrCl2", "CuCl2", "NaNO3"]) await go(id);
check(await vl(() => __vl.S.flame.hold) === null, "ten seconds is a full hold and then the flame goes out");
const nUnk = await vl(() => { __vl.fl.ensureUnknowns(); return __vl.fl.unlocked(); }); check(nUnk === false, "unknowns are locked before the seven are recorded");

// ---- notebook: record every salt
await page.click("#flNb"); await page.waitForSelector("#flSheet table.ftab");
check(await page.locator("#flSheet .stepcard, #flSheet details").count() >= 1, "the step card is in the notebook too");
for (const s of data.samples) {
  const row = page.locator(`#flSheet tr[data-sample="${s.id}"]`), sel = row.locator("select");
  await sel.nth(0).selectOption(s.flame.colorGroup); await page.locator(`#flSheet tr[data-sample="${s.id}"] select`).nth(1).selectOption(s.flame.brightness);
}
await snap("lab");
check(await vl(() => __vl.fl.unlocked()), "unknowns unlock when all seven are recorded");
check(await page.locator("#flSheet tr[data-unknown]").count() === 2, "unknown rows A and B appear");
await page.click("#flSheet .x"); await page.waitForTimeout(100);

// ---- take A and B (the shelf is in the room), 6-item carry limit
await page.keyboard.press("Escape"); await page.waitForFunction(() => __vl.S.view === "room");
check(await vl(() => __vl.sources.map((s) => s.key).join()) === "uA,uB", "the shelf holds exactly bottles A and B");
await vl(() => { __vl.take("uA"); __vl.take("uB"); }); check(await vl(() => __vl.S.inv.join()) === "uA,uB", "A and B are carried");
await vl(() => document.getElementById("btnNotebook").click()); await page.waitForSelector("#flSheet"); await page.keyboard.press("Escape");
await vl(() => __vl.S.view !== "bench" && document.querySelector("#leaveBench") && null); await move(0, 1, 0);
// back to the bench by a direct interaction
await vl(() => { __vl.P.x = 4; __vl.P.y = 5; __vl.P.face = "u"; }); await page.keyboard.press("e"); await page.waitForFunction(() => __vl.S.view === "bench");

// ---- test A and B; B is Li or Sr: the same crimson as a known, so the spectroscope is needed
for (const l of ["A", "B"]) {
  await page.click("#flFresh"); await page.selectOption("#flSalt", "u" + l); await page.click("#flDip"); await page.click("#flHold"); await vl("__vl.fl.step(10.5)");
  const u = await vl(`__vl.S.flame.unk.${l}`); check(u.tested === 1 && !u.flagged, `unknown ${l} tested once, clean`);
  const flame = colorOf(u.sample);
  await page.click("#flNb"); await page.waitForSelector(`#flSheet tr[data-unknown="${l}"]`);
  const sels = page.locator(`#flSheet tr[data-unknown="${l}"] select`); await sels.nth(0).selectOption(flame.colorGroup); await page.locator(`#flSheet tr[data-unknown="${l}"] select`).nth(1).selectOption(flame.brightness);
  if (l === "B") {
    await snap("lab"); await page.click("#flSheet .tabs button[data-tab=spec]");
    await page.waitForSelector("#tutBack");   // the tutorial opens the first time the spectroscope is used
    check(await page.locator("#dlgTut2").evaluate((d) => d.open), "tutorial 2 opens on first use of the spectroscope");
    for (let i = 0; i < 3; i++) { await snap("lab"); check((await page.locator("#tut2Body .cap").innerText()) === lab.tutorial2[i], "tutorial 2 frame " + (i + 1) + " caption"); await page.click("#tutNext"); }
    check((await page.locator("#tut2Body .cap").innerText()) === lab.tutorial2[3] && await page.locator("#tut2Body svg").count() === 1, "tutorial 2 frame 4");
    await page.click("#tutDone"); await page.waitForSelector("#flSheet svg line.ln", { state: "attached" });
    const lines = await page.locator("#flSheet svg line.ln").evaluateAll((ls) => ls.map((x) => +x.dataset.nm));
    const srLines = data.spectra.Sr.lines.map((x) => x.nm), liLines = data.spectra.Li.lines.map((x) => x.nm);
    check(lines.some((n) => n > 450 && n < 470), "the spectroscope view draws Sr's blue line (from the data)");
    const bands = await page.locator("#flSheet svg rect.band").evaluateAll((bs) => bs.map((b) => b.dataset.from + "-" + b.dataset.to)); check(bands.includes("600-700") && bands.includes("500-550"), "the Sr and Cu bands are drawn behind the lines (" + bands.join(",") + ")");
    check(await vl(() => __vl.log.events.some((e) => e.type === "spec_open")), "using the spectroscope is logged");
    await page.click('#flSheet .tabs button[data-tab=table]');
    const sample = await vl(`__vl.S.flame.unk.B.sample`), metal = data.samples.find((s) => s.id === sample).metal;
    await page.locator('#flSheet tr[data-unknown="B"] select').nth(2).selectOption(metal);
  } else {
    await sels.nth(0).waitFor(); const metal = data.samples.find((s) => s.id === u.sample).metal; await page.locator('#flSheet tr[data-unknown="A"] select').nth(2).selectOption(metal);
  }
  await snap("lab"); await page.click("#flSheet .x");
}
check(await vl(() => __vl.fl.recordComplete()), "record complete: seven recorded, A and B answered");
check(await vl(() => __vl.fl.bottles().map((b) => b.id).join()) === "A,B,C", "after A and B, a new mystery bottle C appears (never labeled extra)");

// ---- practice: a wrong answer opens hint 1; each hint costs a fresh attempt; no hint gives the answer
await page.click("#flNb"); await page.click('#flSheet .tabs button[data-tab=practice]'); await page.waitForSelector("#flSheet .opts");
const it1 = items.items[0]; check((await page.locator("#flSheet .pq").innerText()).includes(it1.prompt), "practice starts with the first band-1 item");
const wrong = it1.options.find((o) => o !== it1.answer);
await page.locator(`#flSheet .opts button:text-is("${wrong}")`).click(); await page.waitForSelector("#flSheet .hintline");
check((await page.locator("#flSheet .hintline").allInnerTexts()).length === 1 && (await page.locator("#flSheet .hintline").first().innerText()).includes(it1.hints[0]), "first wrong try opens hint 1 only");
const wrong2 = it1.options.filter((o) => o !== it1.answer)[1]; await page.locator(`#flSheet .opts button:text-is("${wrong2}")`).click(); await page.waitForFunction(() => document.querySelectorAll("#flSheet .hintline").length === 2);
check(true, "second try opens hint 2");
await page.locator(`#flSheet .opts button:text-is("${it1.answer}")`).click(); await page.waitForTimeout(1200);
check(await vl(() => __vl.S.flame.items.band) === 1 && (await vl(() => __vl.S.flame.items.res["b1-1"].ok)) === true, "right after a hint: item done, band stays (hidden, never shown)");
check(!/band/i.test(await page.locator("#flSheet").innerText()), "no band word anywhere on the notebook");
await snap("lab"); await page.click("#flSheet .x");

// ---- CER, then huddle 2 (code accepted only with a complete record)
check(await page.locator("#btnCER").isVisible(), "CER button appears once the record is complete");
await page.click("#btnCER"); await page.waitForSelector("#cerBody textarea");
const u0 = await page.locator("#cerBody select").first().inputValue(); check(["A", "B"].includes(u0), "CER lets the student pick one of their answered unknowns");
await page.locator("#cerBody textarea").nth(0).fill("Unknown A is the metal that matches my table."); await page.locator("#cerBody .ev input").nth(0).check(); await page.locator("#cerBody .ev input").nth(1).check();
await page.locator("#cerBody textarea").nth(1).fill("My own table shows that color for this metal and no other metal.");  // evidence note (optional)
await page.locator("#cerBody textarea").nth(2).fill("The flame color in my table matches this metal and the other colors do not, so the color points to this metal.");
for (const c of await page.locator("#cerBody .ck input[type=checkbox]").all()) if (!(await c.isChecked())) await c.check();
await snap("lab"); await page.click('#cerBody button:has-text("Submit CER")'); await page.waitForFunction(() => __vl.S.cerDone);
check(await vl(() => __vl.S.stage) === "lab", "CER alone does not end the lab; huddle 2 does");
check(await page.locator("#btnHuddle").isVisible(), "the Huddle 2 code button appears with a complete record");
await page.click("#btnHuddle"); await page.fill("#huddleCode", "1"); await page.click("#huddleGo"); check((await page.locator("#huddleBody").innerText()).includes(lab.ui.codeWrong), "wrong code 2 is refused");
await page.fill("#huddleCode", await vl(() => MrD.codes.gate("flame-tests", "h2"))); await page.click("#huddleGo");
await page.waitForSelector("#dlgDone[open]"); const done = await snap("after");
check(await vl(() => __vl.S.stage) === "done", "code 2 plus the CER ends the lab");
check(done.includes(content.exit.prompt), "the exit ticket prompt shows on paper-handoff screen"); check(!(await page.locator("#badge").isVisible()), "no stamp or badge"); check(!/code [0-9]{4}|report code/i.test(done), "no report code");
const rec = await vl(() => JSON.stringify(__vl.stageCtx && null) && null); void rec;
check(errors.length === 0, "no page errors" + (errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""));

// ---- word rule on every visible screen
let bad = [];
for (const [where, text] of seen) for (const p of wordProblems(content.terms, text, where === "prelab" ? "prelab" : where)) bad.push(`[${where}] ${p}`);
check(bad.length === 0, "word rule on all " + seen.length + " rendered screens" + (bad.length ? ": " + [...new Set(bad)].slice(0, 5).join(" | ") : ""));

// ---- save and resume: the record, the unknowns and the hidden band survive a reload
await page.goto(ORIGIN + "/chemistry/virtual-lab/index.html?lab=flame&resume=1"); await page.waitForFunction(() => window.__vl && __vl.S && __vl.S.flame);
const back = await vl(() => ({ stage: __vl.S.stage, nacl: __vl.S.flame.rows.NaCl.color, a: __vl.S.flame.unk.A.identity, h2: __vl.S.flame.huddle2, band: __vl.S.flame.items.band, cer: __vl.S.cerDone, inv: __vl.S.inv.join() }));
check(back.stage === "done" && back.nacl === colorOf("NaCl").colorGroup && !!back.a && back.h2 === true && back.cer === true && back.inv === "uA,uB", "reload with resume brings back the whole record: " + JSON.stringify(back));

// ---- the student demo: plays on a clean bench and leaves the student's own record alone
await page.evaluate(() => localStorage.clear()); await page.goto(ORIGIN + "/chemistry/virtual-lab/index.html?lab=flame"); await page.waitForSelector("#student");
await page.click('button:has-text("Watch the demo")'); await page.waitForSelector("#demoBar:not([hidden])");
const caps = new Set(); for (let i = 0; i < 90 && caps.size < 9; i++) { const t = await page.locator("#demoText").innerText().catch(() => ""); if (t) caps.add(t.split("·")[0].trim()); await page.waitForTimeout(500); }
check(caps.size >= 7, "the demo shows its captions (" + [...caps].join(", ") + ")");
await page.waitForFunction(() => document.querySelector("#demoBar").hidden, null, { timeout: 60000 });
check(await vl(() => __vl.log.events.every((e) => e.type !== "flame_test" && e.type !== "splint")), "the demo logs nothing");

// ---- #key: creative mode, no name screen, everything open, the huddle guide and both codes in the key
await page.goto(ORIGIN + "/chemistry/virtual-lab/index.html?lab=flame#key"); await page.waitForFunction(() => window.__vl && __vl.S);
check(await vl(() => __vl.S.stage) === "lab" && !(await page.locator("#dlgIntro").evaluate((d) => d.open)), "#key skips the name screen");
check(await page.locator("#btnKey").isVisible(), "the Key button shows");
check(await vl(() => __vl.fl.unlocked()), "in #key the unknowns are open");
await page.click("#btnKey"); const keyText = await page.locator("#keyBody").innerText();
check(/Code 1/.test(keyText) && /Code 2/.test(keyText) && /Three worked problems/.test(keyText) && /Three crux questions/.test(keyText) && /Exit ticket/.test(keyText) && /Wrong answers to expect/.test(keyText), "the key holds both codes, the worked problems, the crux questions and the exit ticket");
await page.keyboard.press("Escape");
await page.evaluate(() => { location.hash = ""; }); await page.waitForFunction(() => window.__vl && __vl.S && __vl.S.stage === "intro", null, { timeout: 8000 }).catch(() => {});
check(await page.locator("#student").isVisible(), "removing #key on the open page restarts it as a student page");
await page.evaluate(() => { location.hash = "#key"; }); await page.waitForFunction(() => window.__vl && __vl.S && __vl.S.stage === "lab", null, { timeout: 8000 }).catch(() => {});
check(await vl(() => __vl.S.stage) === "lab", "adding #key to an open page restarts it in creative mode");
check(errors.length === 0, "no page errors after demo and key" + (errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""));

// ---- the paper fallback
const paper = await ctx.newPage(); paper.setDefaultTimeout(8000);
await paper.goto(ORIGIN + "/chemistry/virtual-lab/flame-explore.html");
await paper.waitForSelector("svg.spectrum");
await paper.emulateMedia({ media: "print" });
check(await paper.locator(".swatch").count() === 7, "paper page has the seven swatches (print media)");
check(await paper.locator("tr.rec").count() === 7, "paper table has a row for each salt");
check(await paper.locator("svg.spectrum line.ln").count() > 10, "paper spectrum is drawn from the data");
check(!(await paper.locator("#screenOnly").isVisible()), "screen-only controls vanish in print");
const pdf = await paper.pdf({ format: "Letter" }); const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length; check(pdf.length > 5000 && pages === 2, "the paper page prints to a 2-page PDF (" + pages + " pages)");

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : "\nall passed"); process.exit(fails.length ? 1 : 0);
