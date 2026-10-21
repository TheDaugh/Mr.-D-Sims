/* End-to-end: a lesson template through a simulated class period (Wed 2026-10-21; physics 9:00-9:50, calc 12:10-1:00).
   Needs a static server on :8123 (python3 -m http.server 8123).
     node tests/template.e2e.js              physics template
     TEMPLATE=calc node tests/template.e2e.js */
const TEMPLATE = process.env.TEMPLATE || 'physics', CALC = TEMPLATE === 'calc', T0 = CALC ? '12:15' : '09:05', T18 = CALC ? '12:29' : '09:19', T25 = CALC ? '12:35' : '09:25', T33 = CALC ? '12:43' : '09:33', T44 = CALC ? '12:56' : '09:44', PFX = CALC ? 'TPC-' : 'TPL-';
const fs = require('fs'), path = require('path'), assert = require('assert');
const PW = process.env.PLAYWRIGHT_DIR || ['/opt/npm-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/playwright'].find(p => fs.existsSync(p));
const { chromium } = require(PW);
const CHROME = process.env.CHROMIUM || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const BASE = process.env.BASE || 'http://localhost:8123', URL = BASE + '/' + (process.env.PAGE || 'templates/' + TEMPLATE + '/lesson.html');
const ids = require('../shared/ids.js');

async function open(br, hash, time) {
  const ctx = await br.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' }), page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await page.clock.install({ time: new Date(time || '2026-10-21T' + T0 + ':00-04:00') });
  await page.goto(URL + (hash || ''), { waitUntil: 'load' });
  await page.evaluate(() => { window.__q = []; const o = LE.ask; LE.ask = function (p, q) { window.__q.push(q); return o.apply(this, arguments); }; const r = LE.render; LE.render = function () { window.__q = []; return r.apply(this, arguments); }; });
  return { ctx, page, errs };
}
const tick = (page, ms) => page.clock.runFor(ms || 1200);
/* answer every unanswered question on the card; wrong=true answers wrongly */
async function answer(page, wrong) {
  for (let guard = 0; guard < 40; guard++) {
    const todo = await page.evaluate(() => { const txt = h => { const d = document.createElement('div'); d.innerHTML = String(h); return d.textContent.replace(/\s+/g, ' ').trim(); };
      return window.__q.map((q, i) => ({ i, id: q.id, type: q.type, answer: q.answer,
        opt: q.type === 'choice' ? txt(q.options[q.answer]) : null,
        wrongOpt: q.type === 'choice' ? txt(q.options[q.options.map((o, k) => k).filter(k => k !== q.answer)[0]]) : null,
        done: !!(LE.qs(q.id) && LE.qs(q.id).done) })).filter(x => !x.done); });
    if (!todo.length) return;
    const t = todo[0], box = page.locator('.card .q').nth(t.i);
    if (t.type === 'num' || t.type === 'expr') {
      const val = t.type === 'expr' ? (wrong ? 'x+999' : String(t.answer)) : String(wrong ? t.answer + 123.5 : t.answer);
      await box.locator('input[type=text]').first().fill(val); await box.getByRole('button', { name: 'Check', exact: true }).click();
    } else await box.locator('button, label', { hasText: (wrong ? t.wrongOpt : t.opt).slice(0, 30) }).first().click();
    await tick(page, 900);
  }
}
async function start(page, id, period) {
  await page.fill('#mrd-id', id); await page.fill('#mrd-period', period); await page.locator('#mrd-period').blur(); await tick(page, 500);
}
const step = page => page.evaluate(() => LE.S().step);
const next = async page => { await page.locator('#btn-next').click(); await tick(page, 400); };

(async () => {
  const secret = 'unit-test-secret', myId = await ids.derive(secret, 'Test Student', '3');
  const br = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const results = [];
  async function t(name, fn) { try { await fn(); results.push(['ok  ', name]); } catch (e) { if (process.env.DEBUG) console.log(e.stack.split('\n').slice(0, 6).join('\n')); results.push(['FAIL', name + ' -> ' + (e.message || e).toString().split('\n')[0].slice(0, 220)]); } }

  await t('ID: a typo is refused, the right ID unlocks Continue', async () => {
    const { ctx, page, errs } = await open(br); await tick(page);
    const bad = myId.slice(0, 6) + (myId[6] === 'A' ? 'B' : 'A'); await start(page, bad, '3');
    assert.strictEqual(await page.locator('#btn-next').isDisabled(), true);
    await start(page, myId, '3'); assert.strictEqual(await page.locator('#btn-next').isDisabled(), false);
    assert.strictEqual(await page.evaluate(() => LE.S().first), myId);
    assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await t('Placement: all right climbs to band 4; misses stop at band 1', async () => {
    let r = await open(br); await tick(r.page); await start(r.page, myId, '3'); await next(r.page);
    for (let i = 0; i < 6 && !(await r.page.evaluate(() => LE.S().band0)); i++) { await answer(r.page, false); await tick(r.page, 900); }
    assert.strictEqual(await r.page.evaluate(() => LE.S().band0), 4); await r.ctx.close();
    r = await open(br); await tick(r.page); await start(r.page, myId, '3'); await next(r.page);
    for (let i = 0; i < 6 && !(await r.page.evaluate(() => LE.S().band0)); i++) { await answer(r.page, true); await tick(r.page, 900); }
    assert.strictEqual(await r.page.evaluate(() => LE.S().band0), 1);
    assert.ok(await r.page.evaluate(() => LE.S().d.place.asked <= 2)); await r.ctx.close();
  });

  await t('Timed huddle: at minute 18 the clock pulls the class in, blanks can be written, Continue returns', async () => {
    const { ctx, page, errs } = await open(br); await tick(page); await start(page, myId, '3'); await next(page);
    await page.evaluate(() => { LE.S().band0 = 2; LE.S().band = 2; LE.S().d.place = { done: true, placed: 2, log: [], asked: 3, band: 2, misses: 0, cleared: 2, maxBand: 4, maxItems: 8 }; LE.save(); }); await page.evaluate(() => LE.render());
    await next(page); assert.strictEqual(await step(page), 'predict');
    await page.clock.setSystemTime(new Date('2026-10-21T' + T18 + ':00-04:00')); await tick(page, 2500);
    assert.strictEqual(await step(page), 'huddle');
    await page.locator('.hd-line input').first().fill(CALC ? 'slope' : 'sum'); await page.locator('.hd-line input').nth(1).fill(CALC ? 'power' : 'velocity');
    await page.getByRole('button', { name: 'Check mine' }).click();
    assert.ok(await page.locator('.hd-line input.ok').count() >= 2);
    assert.strictEqual(await page.locator('#btn-next').isDisabled(), false);
    await next(page); assert.strictEqual(await step(page), 'predict', 'returns to where the student was');
    await page.clock.setSystemTime(new Date('2026-10-21T' + T25 + ':00-04:00')); await tick(page, 2500);
    assert.strictEqual(await step(page), 'predict', 'the huddle fires once');
    assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await t('Pace trim: far behind skips Explore and shrinks Build; core tabs stay', async () => {
    const { ctx, page, errs } = await open(br); await tick(page); await start(page, myId, '3'); await next(page);
    await page.evaluate(() => { const S = LE.S(); S.band0 = S.band = 2; S.d.place = { done: true, placed: 2, log: [], asked: 3, band: 2, misses: 0, cleared: 2, maxBand: 4, maxItems: 8 }; S.step = 'predict'; S.hfired = ['h1']; LE.save(); LE.render(); });
    await page.clock.setSystemTime(new Date('2026-10-21T' + T33 + ':00-04:00')); await tick(page, 2500);
    const S = await page.evaluate(() => ({ skip: LE.S().skip, trim: LE.S().trim }));
    assert.ok(S.skip && S.skip.explore, 'explore skipped'); assert.ok(!S.skip.practice && !S.skip.check && !S.skip.warmup, 'core kept');
    assert.ok(await page.locator('#pacebar').isVisible());
    assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await t('Keypad: the answer box has an on-screen keypad that types into it', async () => {
    const { ctx, page } = await open(br); await tick(page); await start(page, myId, '3'); await next(page);
    assert.ok(await page.locator('.mrd-kp').count() >= 1);
    const inp = page.locator('.card .q input[type=text]').first();
    if (CALC) {
      await page.locator('.mrd-kp button[aria-label="power"]').first().click();
      assert.strictEqual(await inp.inputValue(), '^()');
      assert.ok(await page.locator('.q-field .preview').first().isVisible(), 'live preview');
    } else {
      for (const k of ['7', 'decimal point', '5']) await page.locator('.mrd-kp button[aria-label="' + k + '"]').first().click();
      assert.strictEqual(await inp.inputValue(), '7.5');
      await page.locator('.mrd-kp button[aria-label="delete"]').first().click();
      assert.strictEqual(await inp.inputValue(), '7.');
    }
    await ctx.close();
  });

  await t('#key: every tab open, huddle needs no code, answers marked, Concepts button works', async () => {
    const { ctx, page, errs } = await open(br, '#key'); await tick(page);
    assert.ok(await page.locator('.mrd-tb').isVisible());
    assert.strictEqual(await page.locator('#steps button:not([disabled])').count(), 9);
    await page.locator('#steps button', { hasText: 'Huddle' }).click(); await tick(page, 300);
    assert.ok(await page.locator('.hd-line input.keyed').count() >= 5);
    await page.getByRole('button', { name: 'Concepts' }).click(); assert.ok(await page.locator('.cp-panel').isVisible());
    await page.keyboard.press('Escape'); assert.ok(!(await page.locator('.cp-panel').isVisible()));
    assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await t('Full run to the stamp after the end mark, no name anywhere', async () => {
    const { ctx, page, errs } = await open(br, '', '2026-10-21T' + T0 + ':00-04:00'); await tick(page); await start(page, myId, '3'); await next(page);
    for (let i = 0; i < 6 && !(await page.evaluate(() => LE.S().band0)); i++) { await answer(page, false); }
    await tick(page, 1500); await next(page);
    for (const s of ['predict', 'explore']) { await answer(page, false); await tick(page, 500); if (s === 'explore') {} await next(page); }
    await page.evaluate(() => { const S = LE.S(); S.hfired = ['h1']; S.d.hud = { 'd0.1': 'sum' }; LE.save(); });
    assert.strictEqual(await step(page), 'huddle'); await next(page);
    assert.strictEqual(await step(page), 'build'); await answer(page, false); await tick(page, 600); await next(page);
    for (let k = 0; k < 4; k++) { await answer(page, false); await tick(page, 400); if (k < 3) { await page.getByRole('button', { name: 'Next question' }).click(); await tick(page, 400); } }
    await page.getByRole('button', { name: 'Next question' }).click(); await tick(page, 400); await next(page);
    assert.strictEqual(await step(page), 'check'); await answer(page, false); await tick(page, 500); await next(page);
    assert.strictEqual(await step(page), 'notes');
    await page.clock.setSystemTime(new Date('2026-10-21T' + T44 + ':00-04:00')); await tick(page, 2500);
    const text = await page.locator('#stage').innerText();
    assert.ok(text.includes(PFX), 'stamp shown'); assert.ok(text.includes(myId), 'ID shown'); assert.ok(!/Name:/.test(text), 'no name label');
    assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await br.close();
  results.forEach(r => console.log(r[0] + ' ' + r[1]));
  const bad = results.filter(r => r[0] === 'FAIL').length; console.log(bad ? `\n${bad} failed` : '\nall passed'); process.exit(bad ? 1 : 0);
})();
