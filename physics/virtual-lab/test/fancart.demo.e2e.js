/* The scripted demo of lab 5, in Chromium:  python3 -m http.server 8123 &   then   node physics/virtual-lab/test/fancart.demo.e2e.js
   Every caption reads "Demo n of N" with the sheet-free wording from the lab file, the tour runs on the real room and notebook, and the student's own state is
   byte-for-byte what it was before: from the middle of a lab, from the intro screen, and when the student stops it early. */
import { launch, open, kit, check, done, U, L } from "./fancart-kit.js";
import { wordProblems } from "./fancart-words.js";

const browser = await launch();
const diff = (a, b) => { const x = JSON.parse(a), y = JSON.parse(b), out = []; const walk = (p, u, v) => { if (JSON.stringify(u) === JSON.stringify(v)) return; if (u && v && typeof u === "object" && typeof v === "object") { for (const k of new Set([...Object.keys(u), ...Object.keys(v)])) walk(p + "." + k, u[k], v[k]); } else out.push(p + ": " + JSON.stringify(u) + " -> " + JSON.stringify(v)); }; walk("", x, y); return out.slice(0, 6).join("; "); };
const state = (page) => page.evaluate(() => JSON.stringify({ flame: __vl.S.flame, inv: __vl.S.inv, stage: __vl.S.stage, cer: __vl.S.cer, cerDone: __vl.S.cerDone, submitted: __vl.S.submitted, prelab: __vl.S.prelab, view: __vl.S.view, panel: __vl.S.panel && __vl.S.panel.id, P: __vl.P, events: __vl.log.events, student: __vl.S.student, feed: __vl.S.feed, stepCard: document.querySelectorAll("#stepCard li").length }));
// play the demo and watch it: the caption each time it changes, the dialogs it opens, where the student's marker moved
async function watch(page, start) {
  const seen = { caps: [], dialogs: new Set(), moved: new Set(), run: false, graph: false }; await start();
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    const s = await page.evaluate(() => ({ bar: !document.querySelector("#demoBar").hidden, text: document.querySelector("#demoText").textContent, dlg: [...document.querySelectorAll("#stage dialog[open]")].map((d) => d.id), P: __vl.P.x + "," + __vl.P.y, demo: __vl.S.demo, last: !!__vl.S.flame.last, plot: __vl.S.flame.plot.F }));
    if (s.bar && s.text && seen.caps[seen.caps.length - 1] !== s.text) seen.caps.push(s.text);
    s.dlg.forEach((d) => seen.dialogs.add(d)); seen.moved.add(s.P); if (s.last) seen.run = true; if (s.plot) seen.graph = true;
    if (!s.bar && !s.demo && seen.caps.length) break; await page.waitForTimeout(80);
  }
  return seen;
}

// ---------- from the middle of a lab ----------
{
  const env = await open(browser), { page, errors } = env, k = kit(env);
  await k.toLab(); await k.route.toShelf(); await page.keyboard.press("e"); await page.waitForSelector("#dlgChest[open]"); await page.keyboard.press("q"); await page.keyboard.press("e");
  await k.route.shelfToBalance(); await page.keyboard.press("e"); await page.keyboard.press("Enter"); await page.keyboard.press("e"); await k.route.balanceToTrack(); await page.keyboard.press("e"); await page.waitForSelector("#dlgNotebook[open]");
  await k.runOne({ bars: 2, setting: 2, mass: "1.00" }); await page.waitForSelector("#fcTut .gtext"); await page.click("#fcTutNext"); await page.click("#fcTutNext"); await page.click("#fcTutNext"); await page.click("#fcTutNext"); await page.click("#fcTutDone");
  await page.click("#fcClose"); await page.waitForTimeout(400);
  const before = await state(page); check(JSON.parse(before).flame.rows.p1[2] && JSON.parse(before).inv.length === 4 && JSON.parse(before).events.length > 20, "the student is mid-lab: four bars carried, a row recorded, a log of " + JSON.parse(before).events.length + " events");
  const seen = await watch(page, () => page.click("#btnDemo"));
  const re = /^Demo (\d+) of (\d+) · (.+)$/s, m = seen.caps.map((c) => re.exec(c));
  check(m.every(Boolean), "every caption reads 'Demo n of N'"); check(new Set(m.map((x) => x[2])).size === 1 && m[0][2] === "9", "N is 9 on every caption");
  check(m.map((x) => +x[1]).join() === "1,2,3,4,5,6,7,8,9", "the captions run 1 of 9 to 9 of 9, each once: " + m.map((x) => x[1]).join());
  check(m.every((x, i) => x[3] === U["dm" + (i + 1)]), "the caption wording is the lab file's, in order");
  check(m.every((x) => wordProblems(L, x[3], "lab").length === 0), "no caption breaks the word rule (nothing held for huddle 2)");
  check(seen.dialogs.has("dlgChest") && seen.dialogs.has("dlgNotebook") && seen.moved.size > 8 && seen.run && seen.graph, "the tour walks the real room, opens the shelf, balance and notebook, runs the cart and draws a graph (" + [...seen.dialogs].join() + ", " + seen.moved.size + " tiles)");
  const after = await state(page); check(after === before, "the student's state is byte-identical before and after the demo (" + before.length + " bytes)" + (after === before ? "" : "\n  " + diff(before, after)));
  check(!(await page.evaluate(() => document.querySelector("#dlgNotebook").open)) && !(await page.evaluate(() => document.querySelector("#dlgChest").open)) && (await page.evaluate(() => __vl.S.view)) === "room", "the tour closes what it opened");
  check(await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem("vlab:fan-cart") || "{}").S?.flame?.rows) === JSON.stringify(__vl.S.flame.rows)), "the saved lab was not overwritten by the tour");
  check(errors.length === 0, "no errors during the tour" + (errors.length ? ": " + errors.join(" | ") : ""));
  // stopping it early restores everything too
  await page.click("#btnDemo"); await page.waitForSelector("#demoBar:not([hidden])"); await page.waitForTimeout(2500); await page.click("#demoStop"); await page.waitForFunction(() => !__vl.S.demo);
  check((await state(page)) === before, "stopping the demo early puts the student's state back too");
  await page.click("#btnDemo"); await page.waitForSelector("#demoBar:not([hidden])"); await page.waitForTimeout(1500); await page.keyboard.press("Escape"); await page.waitForFunction(() => !__vl.S.demo);
  check((await state(page)) === before, "Esc stops it and puts the state back");
  await env.ctx.close();
}

// ---------- from the intro screen ----------
{
  const env = await open(browser), { page, errors } = env, k = kit(env), fresh0 = await state(page);
  const seen = await watch(page, () => page.click("#introDemo")); check(seen.caps.length === 9 && /^Demo 9 of 9/.test(seen.caps[8]), "the demo plays from the intro screen, nine captions");
  await page.waitForSelector("#dlgIntro[open]"); const fresh1 = await state(page); check(fresh1 === fresh0, "the intro screen comes back and the state is as fresh as before the tour" + (fresh1 === fresh0 ? "" : "\n  " + diff(fresh0, fresh1)));
  await page.fill("#student", "Demo Kid"); check(!(await page.locator("#introGo").isDisabled()), "the student can start the pre-lab after the tour");
  check(errors.length === 0, "no errors from the intro tour" + (errors.length ? ": " + errors.join(" | ") : "")); await env.ctx.close();
}
await done(browser);
