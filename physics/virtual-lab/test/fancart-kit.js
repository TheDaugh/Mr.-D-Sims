// Shared helpers for the lab 5 browser tests. Needs a static server at the repo root:  python3 -m http.server 8123 &
// (PLAYWRIGHT_DIR=... if playwright is not at /opt/node-tools; BASE=... for another origin; SHOTS=<dir> writes screenshots at 1280x720)
import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
import { wordProblems } from "./fancart-words.js";
import { tToX, SPEED } from "../src/ui/graphs.js";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR || "/opt/node-tools/node_modules/playwright");
export const ORIGIN = process.env.BASE || "http://localhost:8123", URL_ = ORIGIN + "/physics/virtual-lab/index.html?lab=05-fan-cart";
export const J = (p) => JSON.parse(readFileSync(new URL("../content/" + p, import.meta.url)));
export const D = J("slot-07-data.json"), I = J("slot-07-items.json"), L = J("slot-07-lab-content.json"), lab = J("labs/05-fan-cart.json"), U = lab.ui;
export const SHOTS = process.env.SHOTS || ""; if (SHOTS) mkdirSync(SHOTS, { recursive: true });

export const fails = [];
export const check = (c, m) => { if (!c) { fails.push(m); console.log("FAIL " + m); } else console.log("ok   " + m); };
export const done = (browser) => browser.close().then(() => { console.log(fails.length ? fails.length + " check(s) failed" : "all checks passed"); process.exit(fails.length ? 1 : 0); });

// A page at a pinned moment (default: a Wednesday morning before the physics period, so codes are required and locked mode is off).
export async function open(browser, iso = "2026-10-21T07:30:00-04:00", hash = "") {
  const ctx = await browser.newContext({ reducedMotion: "reduce", timezoneId: "America/New_York", viewport: { width: 1280, height: 720 }, acceptDownloads: true }), page = await ctx.newPage();
  page.setDefaultTimeout(9000);
  const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.route(/fonts\./, (r) => r.abort());
  await page.clock.setFixedTime(new Date(iso));
  await page.goto(URL_ + hash); await page.waitForSelector("#student");
  return { ctx, page, errors, seen: [] };
}
export const launch = () => chromium.launch();

export function kit(env) {
  const { page, seen } = env, vl = (f, a) => page.evaluate(f, a);
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` }); };
  const stageText = () => vl(() => document.querySelector("#stage").innerText);
  // remember what is on screen for the word rule, checked at the end
  const snap = async (where) => { const t = await stageText(); seen.push([where, t]); return t; };
  const move = async (dx, dy, n = 1) => { for (let i = 0; i < n; i++) { await page.waitForTimeout(130); await vl(`__vl.walk(${dx}, ${dy})`); } };
  const route = {
    toShelf: async () => { await move(0, -1, 1); await move(-1, 0, 2); await move(0, -1, 2); await move(-1, 0, 2); await move(0, -1, 2); await move(-1, 0, 1); },
    shelfToBalance: async () => { await move(0, 1, 1); await move(1, 0, 1); await move(0, -1, 1); },
    balanceToTrack: async () => { await move(1, 0, 2); await move(0, -1, 1); },
    trackToShelf: async () => { await move(-1, 0, 3); await move(0, -1, 1); await move(-1, 0, 1); }
  };
  // intro, pre-lab (all three right, a prediction), the hold screen and code 1: the student is in the lab
  const toLab = async (name = "Test Student") => {
    await page.fill("#student", name); await page.click("#introGo"); await page.waitForSelector("#prelabBody .pq");
    for (const [qi, q] of L.prelab.questions.entries()) { const i = await page.locator("#prelabBody .pq").nth(qi).locator("button").evaluateAll((bs, t) => bs.findIndex((b) => b.textContent === t), q.options[q.correct]); await page.locator("#prelabBody .pq").nth(qi).locator("button").nth(i).click(); }
    await page.locator("#pre_force_2").click(); await page.click("#preGo");
    await page.waitForSelector("#dlgHuddle[open]");
    await enterCode("h1"); await page.waitForFunction(() => __vl.S.stage === "lab");
  };
  const code = (n) => vl(`MrD.codes.gateV3("fan-cart", "${n}")`);
  const enterCode = async (n) => { await page.fill("#huddleCode", await code(n)); await page.click("#huddleGo"); await page.waitForFunction((n) => !document.querySelector("#dlgHuddle").open || (n === "h2" && document.querySelector("#huddleClose") && !document.querySelector("#huddleCode")), n); };
  const arrowText = () => vl(() => { const g = document.querySelector("#guide"); return g && !g.hidden ? g.querySelector(".gtext").textContent : null; });
  // wait until the yellow arrow says exactly this (it follows the quest list every quarter second)
  const arrow = async (want, msg) => { let got = null; for (let i = 0; i < 30; i++) { got = await arrowText(); if (got === want) break; await page.waitForTimeout(100); } check(got === want, `${msg}: arrow says "${want}"${got === want ? "" : " (got " + JSON.stringify(got) + ")"}`); };
  const coach = () => vl(() => document.querySelector("#coachText").textContent);
  const quests = () => vl(() => [...document.querySelectorAll("#quests li")].map((l) => l.textContent.replace(/\s+/g, " ").trim()));
  const activeQuest = () => vl(() => (document.querySelector("#quests li.active") || {}).textContent || "");
  const st = () => vl(() => __vl.S.flame);
  // speed graph: drag the two markers with the mouse
  const dragMarker = async (i, t) => {
    const box = await page.locator("#fcSpeed").boundingBox(), cur = await vl((i) => __vl.S.flame.mk[i], i), X = (u) => box.x + (tToX(u) / SPEED.W) * box.width, top = box.y + ((SPEED.T - 8) / SPEED.H) * box.height, mid = box.y + box.height * 0.55;
    await page.mouse.move(X(cur), top); await page.mouse.down(); await page.mouse.move(X((cur + t) / 2), mid); await page.mouse.move(X(t), mid); await page.mouse.up();
  };
  const waitRun = () => page.waitForFunction(() => __vl.S.flame.last && !__vl.S.flame.anim && document.querySelector("#fcRun") && !document.querySelector("#fcRun").disabled, null, { timeout: 8000 });
  // one run: loads the cart, runs, spreads the markers, types the mass and records
  const runOne = async ({ bars, setting, mass, real = false, noRecord = false }) => {
    await page.click("#fcBar" + bars); await page.click("#fcSet" + setting); await page.click("#fcRun"); await waitRun();
    if (real) { await dragMarker(0, 0.2); await dragMarker(1, 1.8); } else { await vl(() => { __vl.fl.moveMarker(0, 0.2); __vl.fl.moveMarker(1, 1.8); __vl.fl.commitRead(); }); }
    const a = parseFloat(await page.textContent("#fcA"));
    if (noRecord) return { a };
    await page.fill("#fcMass", String(mass)); await page.click("#fcRecord"); await page.waitForFunction(() => document.querySelector("#fcMass").value === "");
    return { a };
  };
  // the dialogs, controls and words
  const openDialogsText = () => vl(() => [...document.querySelectorAll("#stage dialog[open]")].map((d) => d.innerText).join("\n"));
  const unnamedControls = (sel) => vl((sel) => [...document.querySelectorAll(sel + " button, " + sel + " input, " + sel + " select, " + sel + " textarea")].filter((e) => !e.id && !e.closest("[hidden]")).map((e) => e.tagName + ":" + (e.textContent || e.type || "").slice(0, 20)), sel);
  const wordCheck = () => { let bad = []; for (const [where, text] of seen) for (const p of wordProblems(L, text, where)) bad.push(`[${where}] ${p}`); return [...new Set(bad)]; };
  return { vl, shot, stageText, snap, move, route, toLab, code, enterCode, arrow, arrowText, coach, quests, activeQuest, st, dragMarker, waitRun, runOne, openDialogsText, unnamedControls, wordCheck };
}
