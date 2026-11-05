/* Lab 5, the demo and the tutorial arrows, in Chromium. Needs:  python3 -m http.server 8123 &   node chemistry/virtual-lab/test/pes-guide.e2e.js
   Demo: plays to the end, every one of the ten captions shows, it takes 40 to 60 seconds, it shows a checkpoint and a lock screen,
   no page errors, and the student's saved state, event log and stored save are byte-identical before and after.
   Tutorial: walks the real route and reads the yellow arrow's text at each step; one in-dialog arrow is screenshotted (SHOTS=<dir>). */
import { createRequire } from "node:module";
import { existsSync, mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR || "/opt/node-tools/node_modules/playwright");
const ORIGIN = process.env.BASE || "http://localhost:8123", SHOTS = process.env.SHOTS || "";
const fails = [], check = (c, m) => { if (!c) { fails.push(m); console.log("FAIL " + m); } else console.log("ok   " + m); };
if (SHOTS && !existsSync(SHOTS)) mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch(), ctx = await browser.newContext({ reducedMotion: "reduce", timezoneId: "America/New_York", viewport: { width: 1280, height: 720 } }), page = await ctx.newPage();
page.setDefaultTimeout(9000);
const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.route(/fonts\./, (r) => r.abort());
await page.clock.setFixedTime(new Date("2026-10-21T07:30:00-04:00"));
const H = (f, a) => page.evaluate(`(() => { const k = window.__vl.fl.hooks; return (${f.toString()})(k, ${JSON.stringify(a ?? null)}); })()`);
const setRange = (id, v) => page.$eval(id, (el, x) => { el.value = x; el.dispatchEvent(new Event("input", { bubbles: true })); }, String(v));
const arrow = async () => { await page.waitForTimeout(520); return page.evaluate(() => { const g = document.querySelector("#guide"); return g && !g.hidden ? g.querySelector(".gtext").textContent : ""; }); };
const walkTo = async (route) => { const D = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] }; for (const c of route) { await page.evaluate((d) => window.__vl.walk(d[0], d[1]), D[c]); await page.waitForTimeout(135); } };

await page.goto(ORIGIN + "/chemistry/virtual-lab/index.html?lab=pes&seed=5"); await page.waitForSelector("#student");
await page.fill("#student", "Guide Tester"); await page.click("#introGo"); await page.waitForSelector("#cardNext"); await page.click("#cardNext"); await page.click("#cardNext"); await page.click("#cardDone");
await page.waitForTimeout(400);

// ---------- the tutorial arrows, step by step ----------
let t = await arrow(); check(/door/i.test(t), "arrow 1, at the start: " + t);
await walkTo("UUUUUU"); t = await arrow(); check(/spectrometer/i.test(t), "arrow 2, past the door: " + t);
await walkTo("RRU"); await page.keyboard.press("e"); await page.waitForSelector("#dlgNotebook[open]"); t = await arrow(); check(/Li|lithium/i.test(t) && /carousel/i.test(t), "arrow 3, in the spectrometer: " + t);
await page.click("#pesCell_3"); t = await arrow(); check(/Fire/.test(t), "arrow 4, after picking Li: " + t);
await setRange("#pesBright", 1000); await page.click("#pesFire"); t = await arrow(); check(/Light color/.test(t) && /low to high/.test(t), "arrow 5, after Fire: " + t);
await setRange("#pesColor", 30); await page.waitForTimeout(500); await setRange("#pesColor", 330); await page.waitForTimeout(900); t = await arrow(); check(/peak/i.test(t), "arrow 6, after the sweep: " + t);
if (SHOTS) await page.screenshot({ path: `${SHOTS}/arrow-in-dialog.png` });
const box0 = await page.evaluate(() => { const g = document.querySelector("#guide").getBoundingClientRect(), c = document.querySelector("#pesSpectrum").getBoundingClientRect(); return { gx: g.left + g.width / 2, gy: g.bottom, cx: [c.left, c.right], cy: [c.top, c.bottom] }; });
check(box0.gx > box0.cx[0] && box0.gx < box0.cx[1] && Math.abs(box0.gy - box0.cy[0]) < 40, "the in-dialog arrow sits just above the spectrum it points at");
const px = await H((k) => k.peakX("2s")), bb = await page.locator("#pesSpectrum").boundingBox(); await page.mouse.click(bb.x + px * (bb.width / 560), bb.y + 150);
t = await arrow(); check(/light color high enough/i.test(t), "arrow 7, after clicking a peak: " + t);
await setRange("#pesColor", 800); await page.waitForFunction(() => window.__vl.fl.hooks.subsSeen().length === 2 && window.__vl.fl.hooks.det().hits > 400, null, { polling: 100 });
t = await arrow(); check(/Stop/.test(t), "arrow 8, both peaks showing: " + t); await page.click("#pesStop");
t = await arrow(); check(/Stuck\?/.test(t) && /Mr\. D/.test(t), "arrow 9, the help button: " + t);
await page.keyboard.press("Escape"); await page.waitForTimeout(200); t = await arrow(); check(/Open the spectrometer/i.test(t), "with the dialog closed the arrow points at the spectrometer button: " + t);
await page.click("#btnNotebook"); await page.waitForSelector("#dlgNotebook[open]"); await page.hover("#pesHelp"); await page.waitForTimeout(600);
const fullRun = async (Z) => { await page.click("#pesCell_" + Z); await setRange("#pesColor", 1000); await setRange("#pesBright", 1000); await page.click("#pesFire"); await page.waitForFunction(() => { const k = window.__vl.fl.hooks, d = k.det(); return d.hits >= 450 && d.spec && k.subsSeen().length === d.spec.length; }, null, { polling: 100 }); if (await page.locator("#pesStop").isEnabled()) await page.click("#pesStop"); };
for (const Z of [10, 11, 16, 4]) await fullRun(Z);
await page.waitForSelector("#pesAnswer"); t = await arrow(); check(/answer/i.test(t) && /Check/.test(t), "arrow 10, Checkpoint 1: " + t);
for (let i = 0; i < 3; i++) { const a = await page.evaluate(async () => { const k = window.__vl.fl.hooks; return window.PESPractice.labSpec(k.state().cp.read.n, "read", k.seed()).ans; }); await page.fill("#pesAnswer", String(a)); await page.click("#pesCheck"); }
await page.waitForSelector("#pesDraw"); t = await arrow(); check(/bar/i.test(t) && /Leftmost/.test(t), "arrow 11, the draw bench: " + t);
await page.screenshot({ path: SHOTS ? `${SHOTS}/arrow-draw.png` : "/dev/null" }).catch(() => {});

// ---------- the demo: nothing the student has changes ----------
const snapshot = () => page.evaluate(() => ({ stage: __vl.S.stage, student: __vl.S.student, flame: __vl.S.flame, prelab: __vl.S.prelab, events: __vl.log.events.length, P: __vl.P, save: localStorage.getItem("vlab:photoelectron") && JSON.parse(localStorage.getItem("vlab:photoelectron")).S }));
await page.keyboard.press("Escape"); await page.waitForTimeout(300);
const before = JSON.stringify(await snapshot());
const t0 = Date.now(); await page.click("#btnDemo"); await page.waitForSelector("#demoBar:not([hidden])");
const caps = new Set(), seenText = [];
for (let i = 0; i < 700; i++) {
  const s = await page.evaluate(() => ({ hidden: document.querySelector("#demoBar").hidden, text: document.querySelector("#demoText").textContent, dlg: document.querySelector("#dlgNotebook[open]") ? document.querySelector("#dlgNotebook").innerText.slice(0, 4000) : "" }));
  if (s.hidden) break; const m = /^Demo (\d+) of 10/.exec(s.text); if (m) caps.add(+m[1]); seenText.push(s); await page.waitForTimeout(120);
}
const secs = (Date.now() - t0) / 1000;
check(caps.size === 10 && [...caps].sort((a, b) => a - b).join() === "1,2,3,4,5,6,7,8,9,10", "the demo shows all ten captions (" + [...caps].join(",") + ")");
check(secs >= 40 && secs <= 60, "the demo takes 40 to 60 seconds (" + secs.toFixed(1) + " s)");
check(/yellow arrows will walk you through each step/.test(seenText.map((s) => s.text).join("|")), "the last caption ends with: yellow arrows will walk you through each step");
check(seenText.some((s) => /Checkpoint 1/.test(s.dlg) && /In a row/.test(s.dlg)), "the demo shows a checkpoint");
check(seenText.some((s) => /Get Mr\. D/.test(s.dlg)), "the demo shows the lock screen");
check(seenText.some((s) => /electrons in this subshell/.test(s.dlg) || /electron in this subshell/.test(s.dlg)), "the demo clicks a peak");
await page.waitForTimeout(500);
const after = JSON.stringify(await snapshot());
check(before === after, "the student's state, log and save are identical before and after the demo" + (before === after ? "" : "\n" + before.slice(0, 300) + "\n" + after.slice(0, 300)));
check((await page.evaluate(() => __vl.S.flame.lock)) === null, "the demo's lock screen did not stay on the student's state");
check(errors.length === 0, "no page errors (" + errors.slice(0, 2).join(" | ") + ")");
console.log(JSON.stringify({ fails: fails.length })); await browser.close(); process.exit(fails.length ? 1 : 0);
