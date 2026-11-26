/* The friction sandbox page (physics/sandbox/friction-push.html) in Chromium.
     python3 -m http.server 8123 &
     PLAYWRIGHT_DIR=/opt/node-tools/node_modules/playwright node tests/friction-push.e2e.js
   Checks: no JS errors; the start card wants a valid ID and period; numbers stay hidden until instruments are on; a right and a wrong prediction are both
   logged (table, tally, profile record); the push slider locks during a predicted run; growing the push draws friction rising to mu_s N and dropping to mu_k N;
   a sliding crate stops when the push drops below mu_k N and never slides back; the mystery crate hides mu; checkpoints: 3 right pass, misses lock,
   a wrong code fails, today's code unlocks, then 2 right pass; #key opens the teacher key with no start card. Locked mode itself is in tests/lock.e2e.js. */
const { chromium } = require(process.env.PLAYWRIGHT_DIR || '/opt/node-tools/node_modules/playwright');
const URL = (process.env.BASE || 'http://localhost:8123') + '/physics/sandbox/friction-push.html';
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
async function open(browser, hash, at) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } }), page = await ctx.newPage(), errors = []; page.setDefaultTimeout(6000);
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource|Permissions policy/.test(m.text())) errors.push(m.text()); });
  if (at) await page.clock.install({ time: new Date(at) });
  await page.goto(URL + (hash || '')); await page.waitForTimeout(400);
  return { ctx, page, errors };
}
const ev = (page, fn, arg) => page.evaluate(fn, arg);
(async () => {
  const browser = await chromium.launch();
  const SAT = '2026-10-24T10:00:00-04:00';

  console.log('start card, predictions, the record');
  {
    const { ctx, page, errors } = await open(browser, '', SAT);
    ok(await page.locator('#start').isVisible() && await page.locator('#bBegin').isDisabled(), 'start card waits for an ID');
    await page.fill('#mrd-id', '65J-7TGT'); await page.fill('#mrd-period', '3'); await page.locator('#mrd-period').blur(); await page.waitForTimeout(200);
    await page.click('#bBegin'); ok(await ev(page, () => __fp.started()), 'Begin starts the sandbox');
    ok(await page.locator('#inst').isHidden(), 'numbers hidden until the instruments are on');
    await ev(page, () => { __fp.set('surf', 'custom'); __fp.set('m', 12); __fp.set('mus', 0.4); __fp.set('muk', 0.25); __fp.set('F', 30); });
    await page.click('#bPred'); await page.click('[data-pred="rest"]');
    ok(await page.locator('#rF').isDisabled(), 'the push slider locks during a predicted run');
    await ev(page, () => __fp.step(600)); await page.waitForTimeout(100);
    ok(await page.locator('#rF').isEnabled(), 'and frees once the result is in');
    await page.click('#bReset'); await ev(page, () => __fp.set('F', 55)); await page.click('#bPred'); await page.click('[data-pred="rest"]'); await ev(page, () => __fp.step(60));
    const rows = await ev(page, () => __fp.rows());
    ok(rows.length === 2 && rows[0].ok === true && rows[0].f === 30 && rows[1].ok === false && rows[1].res === 'slides' && Math.abs(rows[1].f - 29.4) < 0.1 && Math.abs(rows[1].a - 2.13) < 0.01, 'a right and a wrong prediction are logged with friction and a: ' + JSON.stringify(rows.map(r => [r.ok, r.f, r.a])));
    ok(/1 of 2/.test(await page.locator('#tallyTxt').innerText()), 'the tally reads 1 of 2');
    const rec = await ev(page, () => { const k = Object.keys(localStorage).filter(x => /friction-sandbox/.test(x) || /profile/.test(x)); return k.map(x => localStorage.getItem(x)).join(' '); });
    ok(/friction-sandbox/.test(rec) && /65J-7TGT/.test(rec), 'the profile record is saved under the student');
    ok(errors.length === 0, 'no errors ' + JSON.stringify(errors));
    await ctx.close();
  }

  console.log('the physics on screen');
  {
    const { ctx, page, errors } = await open(browser, '#key');
    await page.click('#keyPageClose');
    await ev(page, () => { __fp.set('surf', 'wood'); __fp.set('m', 12); __fp.grow(); __fp.step(240 * 9); });
    const pts = await ev(page, () => __fp.fpts()), peak = Math.max(...pts.map(p => p[1])), tail = pts.filter(p => p[0] > 70).map(p => p[1]);
    ok(Math.abs(peak - 58.8) < 0.01 && tail.length && tail.every(f => Math.abs(f - 35.28) < 0.01), 'growing the push: friction climbs to 58.8 N, then flat at 35.3 N (peak ' + peak.toFixed(2) + ')');
    await page.click('#bReset'); await ev(page, () => { __fp.set('F', 80); __fp.push(); __fp.step(240); __fp.set('F', 20); __fp.step(240 * 6); });
    const s = await ev(page, () => { const t = __fp.st(); return { v: t.v, x: t.x }; }); await ev(page, () => __fp.step(480)); const s2 = await ev(page, () => __fp.st().x);
    ok(s.v === 0 && s2 === s.x, 'below mu_k N the crate stops and stays stopped');
    await page.click('#bReset'); await ev(page, () => { __fp.set('F', 70); __fp.push(); __fp.step(240); __fp.set('F', 45); __fp.step(240 * 3); });
    ok(await ev(page, () => __fp.st().moving), 'between mu_k N and mu_s N a sliding crate keeps sliding');
    await page.click('#bReset'); await ev(page, () => { __fp.set('planet', 'moon'); __fp.set('F', 30); __fp.push(); __fp.step(240); });
    ok(await ev(page, () => __fp.st().moving), 'on the Moon a 30 N push slides the 12 kg wood crate');
    await page.click('#btnKey'); ok(/unlock code/i.test(await page.locator('#keyPanel').innerText()), 'live numbers show in #key');
    ok(errors.length === 0, 'no errors ' + JSON.stringify(errors));
    await ctx.close();
  }

  console.log('teacher key page');
  {
    const { ctx, page, errors } = await open(browser, '#key');
    ok(await page.locator('#start').isHidden() && await page.locator('#keyPage').isVisible(), '#key opens the key, no start card');
    const t = await page.locator('#kpBody').innerText();
    ok(/Checkpoint 1/.test(t) && /Checkpoint 2/.test(t) && /Checkpoint 3/.test(t) && /μs N/.test(t), 'the key explains all three checkpoints');
    await page.locator('[data-demo="1"]').click(); await page.waitForTimeout(100);
    ok(await page.locator('#keyPage').isHidden() && await ev(page, () => __fp.P.m === 12 && __fp.P.mus === 0.4 && +document.getElementById('rF').value === 55), 'Load puts a setup in the sandbox');
    ok(errors.length === 0, 'no errors ' + JSON.stringify(errors));
    await ctx.close();
  }

  console.log('checkpoints');
  {
    const { ctx, page, errors } = await open(browser, '', SAT);
    await page.fill('#mrd-id', '65J-7TGT'); await page.fill('#mrd-period', '3'); await page.locator('#mrd-period').blur(); await page.waitForTimeout(200); await page.click('#bBegin');
    await page.click('#btnCp'); await page.waitForTimeout(300);
    const tab = i => page.locator('.cptab').nth(i - 1);
    const answer = async (t, right) => { const q = await ev(page, x => __fp.cp.q(x), t); await page.fill('#cpNum', String(right ? q.answer : q.answer + (t === 'cp2' ? 0.25 : 40))); await page.click('#cpCheck'); return q; };
    for (let i = 0; i < 3; i++) { await answer('cp1', true); if (i < 2) await page.click('#cpBody .primary'); }
    ok(/passed/i.test(await tab(1).innerText()) && /1 of 3/.test(await page.locator('#cpCount').innerText()), 'three right in a row pass checkpoint 1');
    await tab(2).click();
    await page.click('#cpLoad'); const myst = await ev(page, () => __fp.mystery());
    ok(myst && await page.locator('#oMus').innerText() === '?' && await page.locator('#rMus').isDisabled(), 'the mystery crate hides mu and locks the sliders');
    const q2 = await answer('cp2', false); const fb = await page.locator('#cpBody .fb').innerText();
    ok(/Misses in a row: 1/.test(fb) && fb.indexOf(q2.answer.toFixed(2)) < 0, 'a miss gives a hint without the answer');
    ok(!(await ev(page, () => __fp.mystery())), 'after the answer the mystery crate is cleared');
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
    ok(await ev(page, () => __fp.cp.state().cp1.passed) === true, 'unlocking one checkpoint did not reset another');
    await tab(3).click(); for (let i = 0; i < 3; i++) { await answer('cp3', true); if (i < 2) await page.click('#cpBody .primary'); }
    ok(/3 of 3/.test(await page.locator('#cpCount').innerText()), 'all three checkpoints pass');
    ok(errors.length === 0, 'no errors ' + JSON.stringify(errors));
    await ctx.close();
  }
  await browser.close();
  console.log(bad ? bad + ' failed' : 'all passed'); process.exit(bad ? 1 : 0);
})();
