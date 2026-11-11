/* The Pull Bench (chemistry virtual lab 6, slot 15), walked like a student in a real browser.
     python3 -m http.server 8123 &
     TZ=America/New_York node tests/lessons/zeff-lab.e2e.js
   Checks: name -> picture card -> lab; walk to the bench; measure; magnesium waits for the prediction; the column and five-atom quests; the mystery atom;
   NOTHING is called at minute 3 or 25; the one huddle is called at the middle of the lab (lengthMin / 2, or ?min), is a notes huddle, takes the code, fires once;
   ?min=30 moves the huddle; the demo plays and leaves the student's state untouched; the record. */
const { chromium } = require(process.env.PLAYWRIGHT_DIR || '/opt/node-tools/node_modules/playwright');
const ORIGIN = process.env.BASE || 'http://localhost:8123', fails = [];
const check = (c, m) => { if (!c) { fails.push(m); console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const START = new Date('2026-11-12T10:40:00-05:00').getTime(), at = (min) => new Date(START + min * 60000);
const D = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
(async () => {
  const browser = await chromium.launch();
  const open = async (q, when) => { const ctx = await browser.newContext({ reducedMotion: 'reduce', timezoneId: 'America/New_York', viewport: { width: 1366, height: 768 } }), page = await ctx.newPage(); page.setDefaultTimeout(8000);
    page.errors = []; page.on('pageerror', (e) => page.errors.push(e.message)); await page.route(/fonts\./, (r) => r.abort()); await page.clock.install({ time: at(when) }); await page.goto(ORIGIN + '/chemistry/virtual-lab/index.html?lab=zeff' + (q || '')); return { ctx, page }; };
  const mins = (page) => page.evaluate(() => MrD.bell.clock('chem').minutesIn);
  const tickTo = async (page, target) => { for (let i = 0; i < 200; i++) { const m = await mins(page); if (m >= target) return; await page.clock.fastForward(Math.max(1000, Math.round((target - m) * 60000))); await page.waitForTimeout(250); } };
  { // ---- the walk-through, default length 20 (huddle at minute 10)
    const { ctx, page } = await open('', 0.5); await page.waitForSelector('#student'); await page.fill('#student', 'Zeff Tester'); await page.click('#introGo'); await page.waitForSelector('#cardDone');
    check(await page.locator('#cardDone').count() === 1 && /Read the picture/.test(await page.locator('#dlgPrelab h2').innerText()), 'one picture card, then the lab');
    await page.click('#cardDone'); await page.waitForFunction(() => __vl.S.stage === 'lab');
    const walk = async (r) => { for (const c of r) { await page.evaluate((d) => __vl.walk(d[0], d[1]), D[c]); await page.waitForTimeout(140); } };
    await walk('UUUUUURRU'); await page.keyboard.press('e'); await page.waitForSelector('#dlgNotebook[open]'); check(true, 'walked to the pull bench and opened it');
    check(await page.locator('#zeCell_12').isDisabled(), 'magnesium is locked until the student predicts');
    await page.click('#zeCell_11'); await page.click('#zeMeasure'); check(/1\/9/.test(await page.locator('#zeRead').innerText()), 'sodium measures 1/9');
    await page.click('#zeShieldBtn'); check(/Core electrons 10\. Z_eff = 11 − 10 = 1/.test(await page.locator('#zeShield').innerText()), 'show the shielding gives core 10 and Z_eff 1');
    for (const z of [3, 19]) { await page.click('#zeCell_' + z); await page.click('#zeMeasure'); }
    const q = () => page.evaluate(() => __vl.fl.questState()); let st = await q(); check(st.z_col && st.z_measure && st.z_shield && !st.z_pred, 'Li-Na-K quest done, predict not yet');
    await page.click('#zePredMg'); check(await page.locator('#zeCell_12').isEnabled(), 'predicting unlocks magnesium'); await page.click('#zeCell_12'); await page.click('#zeMeasure');
    st = await q(); check(st.z_pred && /held/.test(await page.locator('#zePred').innerText()), 'the prediction is checked against the reading (magnesium holds harder)');
    await page.click('#zeCell_5'); await page.click('#zeMeasure'); st = await q(); check(st.z_five, 'five different atoms measured');
    // mystery: wrong first, then right
    const mz = await page.evaluate(() => __vl.fl.hk.mysZ()); check(mz >= 4 && ![3, 11, 19].includes(mz), 'the mystery atom is seeded for this student (Z = ' + mz + ')');
    await page.click('#zeMysOn'); const wrong = mz === 4 ? 6 : 4; await page.click('#zeCell_' + wrong); check(/Not yet/.test(await page.locator('#zeMys').innerText()), 'a wrong mystery guess points at counting the rings, not the answer');
    await page.click('#zeCell_' + mz); st = await q(); check(st.z_mys, 'naming the mystery atom completes it');
    // the clock: nothing at minute 3, the one huddle at 10
    await page.locator('#dlgNotebook .x').first().click(); await tickTo(page, 3.5); check(!(await page.locator('#dlgHuddle[open]').count()), 'nothing is called at minute 3');
    await tickTo(page, 9.5); check(!(await page.locator('#dlgHuddle[open]').count()), 'nothing is called before the middle');
    await tickTo(page, 10.2); await page.waitForSelector('#dlgHuddle[open]'); const n = await page.locator('#dlgHuddle input[id^=zeBlank_]').count(); check(n === 7, 'the huddle opens at the middle (minute ~10) as a notes huddle with ' + n + ' blanks');
    check(await page.locator('#huddleGo').isDisabled(), 'the huddle will not close until every blank is copied');
    const ans = ['inside', 'cancel', 'core', '11', '10', '1', '1/9']; for (let i = 0; i < 7; i++) await page.fill('#zeBlank_b' + (i + 1), ans[i]);
    await page.fill('#huddleCode', '0000'); await page.click('#huddleGo'); check(/not right/.test(await page.locator('#dlgHuddle').innerText()), 'a wrong huddle code is refused');
    const code = await page.evaluate(() => MrD.codes.gateV3('x', 'h1')); await page.fill('#huddleCode', code); await page.click('#huddleGo'); await page.waitForFunction(() => !document.querySelector('#dlgHuddle').open);
    check(true, 'the daily code closes the huddle'); await tickTo(page, 26); check(!(await page.locator('#dlgHuddle[open]').count()), 'it is called once only, nothing at minute 25');
    const rec = await page.evaluate(() => __vl.fl.record({}).zeff); check(rec.huddle && rec.mystery.ok && rec.predict.ok && rec.measured.length >= 5 && rec.huddleBlanks.b7 === '1/9' && rec.lengthMin === 20, 'the record has the readings, prediction, mystery, huddle blanks and length');
    check(page.errors.length === 0, 'no page errors' + (page.errors.length ? ' ' + page.errors[0] : '')); await ctx.close(); }
  { // ---- length is Ian's call: ?min=30 puts the huddle at minute 15, not 10
    const { ctx, page } = await open('&min=30', 0.5); await page.fill('#student', 'Long Day'); await page.click('#introGo'); await page.waitForSelector('#cardDone'); await page.click('#cardDone'); await page.waitForFunction(() => __vl.S.stage === 'lab');
    check(await page.evaluate(() => __vl.fl.hk.len) === 30 && await page.evaluate(() => __vl.fl.hk.mid) === 15, '?min=30 sets the length to 30 and the huddle to minute 15');
    await tickTo(page, 12); check(!(await page.locator('#dlgHuddle[open]').count()), 'no huddle at minute 12 of a 30-minute lab'); await tickTo(page, 15.3); await page.waitForSelector('#dlgHuddle[open]'); check(true, 'the huddle comes at minute ~16 of a 30-minute lab'); await ctx.close(); }
  { // ---- the demo leaves the student's state alone
    const { ctx, page } = await open('', 0.5); await page.fill('#student', 'Demo Kid'); await page.click('#introGo'); await page.waitForSelector('#cardDone'); await page.click('#cardDone'); await page.waitForFunction(() => __vl.S.stage === 'lab');
    await page.evaluate(() => { __vl.fl.hk.pick(3); __vl.fl.hk.measure(); }); const before = await page.evaluate(() => JSON.stringify(__vl.S.flame));
    await page.click('#btnDemo'); await page.waitForSelector('#demoBar:not([hidden])'); const seen = new Set();
    for (let i = 0; i < 400; i++) { await page.clock.runFor(1000); const t = await page.locator('#demoText').innerText().catch(() => ''); const m = /Demo (\d+) of (\d+)/.exec(t); if (m) seen.add(+m[1]); if (await page.locator('#demoBar').isHidden()) break; }
    check(seen.size === 9, 'the demo shows all 9 captions (' + [...seen].join(',') + ')'); check(await page.evaluate(() => JSON.stringify(__vl.S.flame)) === before, 'the student\'s state is identical after the demo'); check(page.errors.length === 0, 'no errors in the demo'); await ctx.close(); }
  await browser.close(); console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nall passed'); process.exit(fails.length ? 1 : 0);
})();
