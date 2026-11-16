/* The ramp-and-pulley sandbox page (physics/sandbox/ramp-pulley.html) in Chromium.
     python3 -m http.server 8123 &
     node tests/ramp-pulley.e2e.js
   Checks: no JS errors; the start card wants a valid ID and period; numbers stay hidden until instruments are on; a predicted run that is right and one that is
   wrong are both logged (table, tally, MrD.profile record) with the settings that were in force; sliders lock during a predicted run; the page never lets the crate
   or the counterweight leave the rig; rain, the Moon and the elevator change what the key and the sim say, the way the physics says; the table copies and exports;
   #key shows the teacher key and no start card. Locked mode itself is in tests/lock.e2e.js. */
const { chromium } = require(process.env.PLAYWRIGHT_DIR || '/opt/npm-tools/node_modules/playwright');
const ORIGIN = process.env.BASE || 'http://localhost:8123', URL = ORIGIN + '/physics/sandbox/ramp-pulley.html';
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('  FAIL ' + m); } };

async function open(browser, hash, at) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage(), errors = []; page.setDefaultTimeout(6000);
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  if (at) await page.clock.install({ time: new Date(at) });
  await page.goto(URL + (hash || '')); await page.waitForTimeout(300);
  return { ctx, page, errors };
}
const rp = (page, fn, arg) => page.evaluate(fn, arg);

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });

  console.log('start card (a Saturday, so no lock)');
  { const { ctx, page, errors } = await open(browser, '', '2026-10-24T11:00:00-04:00');
    ok(await page.locator('#start').isVisible(), 'start card should show for a student');
    ok(await page.locator('#bBegin').isDisabled(), 'Begin should wait for an ID');
    await page.fill('#mrd-id', 'ABC-DEFG'); await page.fill('#mrd-period', '3'); await page.locator('#mrd-period').blur();
    ok(await page.locator('#bBegin').isDisabled(), 'a bad ID must not unlock Begin');
    await page.fill('#mrd-id', '65J-7TGT'); await page.locator('#mrd-id').blur(); await page.waitForTimeout(200);
    ok(await page.locator('#bBegin').isEnabled(), 'a valid ID and a period should unlock Begin');
    await page.click('#bBegin'); await page.waitForTimeout(150);
    ok(!(await page.locator('#start').isVisible()) && await rp(page, () => __rp.started()), 'Begin should open the sandbox');
    ok(!(await page.locator('#inst').isVisible()), 'instrument numbers must be hidden by default');
    await page.check('#tInst'); ok(await page.locator('#inst').isVisible(), 'instruments toggle shows the panel');

    console.log('free play, then a right prediction and a wrong one');
    await page.uncheck('#tInst');
    await rp(page, () => { __rp.set('theta', 35); __rp.set('m1', 10); __rp.set('m2', 2); __rp.set('mus', 0.25); __rp.set('muk', 0.15); });
    await page.click('#bRec'); ok(await rp(page, () => __rp.rows().length) === 0, 'Record before release should not log');
    await page.click('#bGo'); await page.waitForTimeout(100);
    await rp(page, () => __rp.step(240)); ok(await rp(page, () => __rp.st().v) < -0.5, 'crate should be sliding down with these settings');
    await page.click('#bRec'); ok(await rp(page, () => __rp.rows().length) === 1 && await rp(page, () => __rp.rows()[0].pred) === null, 'a free-play record has no prediction');
    await page.click('#bReset');
    await page.click('#bPred'); ok(await page.locator('#predictBar').isVisible(), 'prediction bar should open');
    await page.click('[data-pred="down"]'); ok(await page.locator('#side').getAttribute('data-locked') === 'true', 'sliders lock during a predicted run');
    await rp(page, () => __rp.step(60));
    ok(await rp(page, () => __rp.rows().length) === 2 && await rp(page, () => __rp.rows()[1].ok) === true, 'a right prediction is logged as right');
    ok(await page.locator('#side').getAttribute('data-locked') === 'false', 'sliders free again once the result is in');
    ok(/1 of 1/.test(await page.locator('#tallyTxt').innerText()), 'tally reads 1 of 1');
    await page.click('#bReset'); await rp(page, () => { __rp.set('mus', 0.8); __rp.set('muk', 0.5); });
    await page.click('#bPred'); await page.click('[data-pred="down"]'); await rp(page, () => __rp.step(600));
    ok(await rp(page, () => __rp.rows()[2].ok) === false && await rp(page, () => __rp.rows()[2].res) === 'rest', 'a wrong prediction is logged as wrong, result: stays put');
    ok(/1 of 2/.test(await page.locator('#tallyTxt').innerText()), 'tally reads 1 of 2');
    ok(/arrows/.test(await page.locator('#toast').innerText()), 'a miss points the student at the force arrows, not the answer');
    ok(!/stays put\.?$/.test((await page.locator('#toast').innerText()).split('Your settings')[1] || ''), 'the miss hint must not give the answer');
    const rec = await rp(page, () => MrD.profile.all().filter(r => r.lesson === 'ramp-pulley-sandbox')[0]);
    ok(rec && rec.first === '65J-7TGT' && rec.reached === 1 && rec.of === 2 && rec.items.length === 2, 'profile record holds the ID, 1 of 2 and both items: ' + JSON.stringify(rec && [rec.first, rec.reached, rec.of]));
    ok(rec && rec.course === 'physics' && rec.period === '3', 'profile record is for physics, period 3');

    console.log('table: copy and csv');
    await page.click('#btnTable'); ok(await page.locator('#rows tr').count() === 3, 'three rows in the table');
    await page.click('#btnCopy'); await page.waitForTimeout(150);
    const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
    ok(/angle_deg\tcrate_kg/.test(clip) && clip.split('\n').length === 4, 'copied text has a header and three rows');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#btnCsv')]); ok(/\.csv$/.test(dl.suggestedFilename()), 'csv downloads');
    await page.click('#btnClear'); ok(await page.locator('#rows tr').count() === 0, 'clear empties the table');

    console.log('conditions: rain, Moon, elevator');
    await page.click('#bReset'); await rp(page, () => { __rp.set('theta', 22); __rp.set('m1', 10); __rp.set('m2', 0); __rp.set('mus', 0.5); __rp.set('muk', 0.3); });
    await page.click('#bGo'); await rp(page, () => __rp.step(480)); ok(await rp(page, () => !__rp.st().moving && __rp.st().s === 5), 'dry: crate holds at 22 deg with mu_s 0.5');
    await page.click('#bReset'); await page.check('#cRain'); await page.click('#bGo'); await rp(page, () => __rp.step(480)); ok(await rp(page, () => __rp.st().s) < 5, 'rain: the same crate slides');
    await page.click('#bReset'); await page.uncheck('#cRain'); await rp(page, () => { __rp.set('theta', 35); __rp.set('mus', 0.3); __rp.set('muk', 0.2); });
    await page.click('#bGo'); await rp(page, () => __rp.step(120)); const aEarth = await rp(page, () => __rp.st().a);
    await page.click('#bReset'); await rp(page, () => __rp.set('planet', 'moon')); await page.click('#bGo'); await rp(page, () => __rp.step(120)); const aMoon = await rp(page, () => __rp.st().a);
    ok(Math.abs(aMoon / aEarth - 1.62 / 9.8) < 0.01, 'Moon: same slide, acceleration scaled by g (' + (aMoon / aEarth).toFixed(3) + ')');
    await page.click('#bReset'); await rp(page, () => { __rp.set('planet', 'earth'); __rp.set('aE', 2.5); }); await page.click('#bGo'); await rp(page, () => __rp.step(120)); const aLift = await rp(page, () => __rp.st().a);
    ok(Math.abs(aLift / aEarth - 12.3 / 9.8) < 0.01, 'elevator up: acceleration scaled by (g + a)/g (' + (aLift / aEarth).toFixed(3) + ')');
    ok(errors.length === 0, 'JS errors: ' + errors.join(' | '));
    await ctx.close(); }

  console.log('the rig keeps everything in bounds at every angle');
  { const { ctx, page, errors } = await open(browser, '#key');
    ok(!(await page.locator('#start').isVisible()), '#key skips the start card');
    ok(await page.locator('#btnKey').isVisible(), '#key shows the Key button');
    await page.click('#btnKey'); const keyTxt = await page.locator('#keyPanel').innerText();
    ok(/slides down the ramp|slides up the ramp|stays put/.test(keyTxt) && /unlock code/i.test(keyTxt), 'the key states the verdict and the unlock code');
    for (const th of [0, 10, 25, 45, 70, 80]) for (const m2 of [0, 5, 50]) {
      const r = await rp(page, ([th, m2]) => { __rp.reset(); __rp.set('theta', th); __rp.set('m1', 3); __rp.set('m2', m2); __rp.set('mus', 0.05); __rp.set('muk', 0.0); __rp.release(); __rp.step(240 * 12); const s = __rp.st(), lim = RampModel.limits(th, m2 > 0); return [s.s, lim.lo, lim.hi]; }, [th, m2]);
      ok(r[0] >= r[1] - 1e-9 && r[0] <= r[2] + 1e-9, 'crate left its limits at ' + th + ' deg, counterweight ' + m2 + ': ' + r.join(' / '));
    }
    ok(errors.length === 0, 'JS errors: ' + errors.join(' | '));
    await ctx.close(); }

  await browser.close();
  console.log(bad ? bad + ' problem(s)' : 'ramp-pulley sandbox: all checks pass'); process.exit(bad ? 1 : 0);
})();
