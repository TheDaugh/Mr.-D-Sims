/* The spring sandbox page (physics/sandbox/spring-hang.html) in Chromium.
     python3 -m http.server 8123 &
     PLAYWRIGHT_DIR=/opt/node-tools/node_modules/playwright node tests/spring-hang.e2e.js
   Checks: no JS errors; the start card wants an ID; numbers hidden until instruments are on; a numeric prediction right and wrong are both
   logged (table, tally, profile); a snap on the bounce grades against where it would settle; Record refuses until the mass settles;
   lowering gently lands on mg/k; the elevator and the Moon; past the limit it snaps; the mystery spring hides k and the spring force;
   checkpoints (3 right pass, misses lock, wrong code, reload keeps the lock, today's code, 2 right after); #key opens the key with Load. */
const { chromium } = require(process.env.PLAYWRIGHT_DIR || '/opt/node-tools/node_modules/playwright');
const URL = (process.env.BASE || 'http://localhost:8123') + '/physics/sandbox/spring-hang.html';
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
async function open(browser, hash, at) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } }), page = await ctx.newPage(), errors = []; page.setDefaultTimeout(6000);
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource|Permissions policy/.test(m.text())) errors.push(m.text()); });
  if (at) await page.clock.install({ time: new Date(at) });
  await page.goto(URL + (hash || '')); await page.waitForTimeout(400);
  return { ctx, page, errors };
}
const ev = (page, fn, arg) => page.evaluate(fn, arg);
const login = async page => { await page.fill('#mrd-id', '65J-7TGT'); await page.fill('#mrd-period', '3'); await page.locator('#mrd-period').blur(); await page.waitForTimeout(200); await page.click('#bBegin'); };
(async () => {
  const browser = await chromium.launch();
  const SAT = '2026-10-24T10:00:00-04:00';

  console.log('start card, predictions, the record');
  {
    const { ctx, page, errors } = await open(browser, '', SAT);
    ok(await page.locator('#start').isVisible() && await page.locator('#bBegin').isDisabled(), 'start card waits for an ID');
    await login(page); ok(await ev(page, () => __sh.started()), 'Begin starts the sandbox');
    ok(await page.locator('#inst').isHidden(), 'numbers hidden until the instruments are on');
    await ev(page, () => { __sh.set('spring', 'custom'); __sh.set('k', 120); __sh.set('m', 0.6); __sh.predict(4.9); __sh.step(600 * 15); });
    await ev(page, () => { __sh.reset(); __sh.predict(10); __sh.step(600 * 15); });
    const rows = await ev(page, () => __sh.rows());
    ok(rows.length === 2 && rows[0].ok === true && Math.abs(rows[0].x - 0.049) < 0.001 && rows[1].ok === false, 'a right and a wrong prediction are logged: ' + JSON.stringify(rows.map(r => [r.ok, +(r.x * 100).toFixed(2)])));
    ok(/1 of 2/.test(await page.locator('#tallyTxt').innerText()), 'the tally reads 1 of 2');
    await ev(page, () => { __sh.reset(); __sh.set('spring', 'soft'); __sh.set('m', 0.8); __sh.predict(39); __sh.step(600 * 4); });
    ok(await ev(page, () => __sh.st().broken) && await ev(page, () => __sh.items()[2].ok) === true, 'a snap on the bounce is graded against where it would settle (39 cm, right)');
    const rec = await ev(page, () => Object.keys(localStorage).map(x => localStorage.getItem(x)).join(' '));
    ok(/spring-sandbox/.test(rec) && /65J-7TGT/.test(rec), 'the profile record is saved under the student');
    ok(errors.length === 0, 'no errors ' + JSON.stringify(errors));
    await ctx.close();
  }

  console.log('the physics on screen');
  {
    const { ctx, page, errors } = await open(browser, '#key');
    await page.click('#keyPageClose');
    await ev(page, () => { __sh.set('spring', 'custom'); __sh.set('k', 120); __sh.set('m', 0.6); __sh.letGo(); __sh.step(60); __sh.record(); });
    ok((await ev(page, () => __sh.rows())).length === 0, 'Record refuses while the mass is still moving');
    await ev(page, () => { __sh.reset(); __sh.lower(); __sh.record(); });
    const r = await ev(page, () => __sh.rows()[0]); ok(r && Math.abs(r.x - 0.049) < 1e-6, 'lower gently lands on m g / k and records it');
    await ev(page, () => { __sh.reset(); __sh.set('a', 2); __sh.lower(); }); ok(Math.abs(await ev(page, () => __sh.st().x) - 0.059) < 1e-6, 'elevator speeding up going up: 5.9 cm');
    await ev(page, () => { __sh.reset(); __sh.set('a', 0); __sh.set('planet', 'moon'); __sh.lower(); }); ok(Math.abs(await ev(page, () => __sh.st().x) - 0.0081) < 1e-6, 'on the Moon: 0.8 cm');
    await ev(page, () => { __sh.reset(); __sh.set('planet', 'earth'); __sh.set('spring', 'soft'); __sh.set('m', 2); __sh.letGo(); __sh.step(600 * 3); });
    ok(await ev(page, () => __sh.st().broken && __sh.st().landed), '2 kg on the soft spring snaps and lands on the base');
    await page.check('#tGraph'); await page.click('#btnKey'); ok(/unlock code/i.test(await page.locator('#keyPanel').innerText()), 'live numbers show in #key');
    ok(errors.length === 0, 'no errors ' + JSON.stringify(errors));
    await ctx.close();
  }

  console.log('teacher key page');
  {
    const { ctx, page, errors } = await open(browser, '#key');
    ok(await page.locator('#start').isHidden() && await page.locator('#keyPage').isVisible(), '#key opens the key, no start card');
    const t = await page.locator('#kpBody').innerText();
    ok(/Checkpoint 1/.test(t) && /Checkpoint 2/.test(t) && /Checkpoint 3/.test(t), 'the key explains all three checkpoints');
    await page.locator('[data-demo="2"]').click(); await page.waitForTimeout(100);
    ok(await page.locator('#keyPage').isHidden() && await ev(page, () => __sh.P.k === 120 && __sh.P.m === 0.6 && __sh.P.a === 2), 'Load puts the elevator setup in the sandbox');
    ok(errors.length === 0, 'no errors ' + JSON.stringify(errors));
    await ctx.close();
  }

  console.log('checkpoints');
  {
    const { ctx, page, errors } = await open(browser, '', SAT);
    await login(page); await page.click('#btnCp'); await page.waitForTimeout(300);
    const tab = i => page.locator('.cptab').nth(i - 1);
    const want = async t => ev(page, x => { const q = __sh.cp.q(x); return x === 'cp2' ? q.mystery.k : q.answer; }, t);
    const answer = async (t, right) => { const a = await want(t); await page.fill('#cpNum', String(right ? a : a * 1.5 + 3)); await page.click('#cpCheck'); return a; };
    for (let i = 0; i < 3; i++) { await answer('cp1', true); if (i < 2) await page.click('#cpBody .primary'); }
    ok(/passed/i.test(await tab(1).innerText()), 'three right in a row pass checkpoint 1');
    await tab(2).click(); await page.click('#cpLoad'); await page.check('#tInst'); await page.waitForTimeout(250);
    ok(await ev(page, () => !!__sh.mystery()) && await page.locator('#oK').innerText() === '?' && await page.locator('#iS').innerText() === '?' && await page.locator('#rK').isDisabled(), 'the mystery spring hides k and the spring force');
    const k = await want('cp2'); await page.fill('#cpNum', String(k * 1.5 + 3)); await page.click('#cpCheck');
    const fb = await page.locator('#cpBody .fb').innerText(); ok(/Misses in a row: 1/.test(fb) && fb.indexOf(String(k)) < 0, 'a miss gives a hint without the answer');
    await page.click('#cpBody .primary'); await answer('cp2', false); await page.click('#cpBody .primary'); await answer('cp2', false);
    ok(await page.locator('#cpLock').isVisible(), 'three misses in a row lock the screen');
    await page.fill('#cpPin', '0000'); await page.click('#cpGo'); ok(await page.locator('#cpLock').isVisible(), 'a wrong code does not unlock');
    await page.reload(); await page.waitForTimeout(500);
    if (await page.locator('#start').isVisible()) { await page.click('#bBegin').catch(() => {}); await page.waitForTimeout(300); }
    ok(await page.locator('#cpLock').isVisible(), 'a reload keeps the lock');
    await page.fill('#cpPin', await ev(page, () => MrD.codes.override())); await page.click('#cpGo');
    ok(!(await page.locator('#cpLock').isVisible()), "today's code unlocks");
    if (await page.locator('#cpCard').isHidden()) await page.click('#btnCp');
    for (let i = 0; i < 2; i++) { await answer('cp2', true); if (i < 1) await page.click('#cpBody .primary'); }
    ok(/passed/i.test(await tab(2).innerText()), 'after an unlock, two right in a row pass');
    await tab(3).click(); for (let i = 0; i < 3; i++) { await answer('cp3', true); if (i < 2) await page.click('#cpBody .primary'); }
    ok(/3 of 3/.test(await page.locator('#cpCount').innerText()), 'all three checkpoints pass');
    ok(errors.length === 0, 'no errors ' + JSON.stringify(errors));
    await ctx.close();
  }
  await browser.close();
  console.log(bad ? bad + ' failed' : 'all passed'); process.exit(bad ? 1 : 0);
})();
