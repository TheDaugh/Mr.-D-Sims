/* End-to-end for the Unit 3 quiz and test pages (engine/assess.js). Needs a static server on :8123 (python3 -m http.server 8123).
     TZ=America/New_York node tests/assessment.e2e.js
   Checks, for each page: review needs every item; the scored part is one try with no hint ladder; N - need + 1 misses fail (no next link, a retake with new
   questions, a different set); exactly the pass mark passes and shows the next link; both tries are kept; no page errors; #key opens every tab. */
const fs = require('fs'), assert = require('assert');
const PW = process.env.PLAYWRIGHT_DIR || ['/opt/npm-tools/node_modules/playwright', '/opt/node-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/playwright'].find(p => fs.existsSync(p));
const { chromium } = require(PW);
const CHROME = process.env.CHROMIUM || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const BASE = process.env.BASE || 'http://localhost:8123/calculus/unit-3-composite-implicit-inverse/', ids = require('../shared/ids.js');
const PAGES = [{ f: 'unit-3-quiz', N: 15, need: 13, next: '3-4-inverse-trig.html', review: 6 }, { f: 'unit-3-test', N: 20, need: 17, next: '4-1-derivative-context.html', review: 10 }];

async function open(br, f, hash) {
  const ctx = await br.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' }), page = await ctx.newPage(), errs = [];
  page.on('pageerror', e => errs.push(e.message)); await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await page.clock.install({ time: new Date('2026-10-21T12:15:00-04:00') }); await page.goto(BASE + f + '.html' + (hash || ''), { waitUntil: 'load' });
  await page.evaluate(() => { window.__q = []; const o = LE.ask; LE.ask = function (p, q) { window.__q.push(q); return o.apply(this, arguments); }; const r = LE.render; LE.render = function () { window.__q = []; return r.apply(this, arguments); }; });
  return { ctx, page, errs };
}
const tick = (page, ms) => page.clock.runFor(ms || 900);
/* answer every unanswered question on the card; the first `wrong` of them are answered wrongly */
async function answer(page, wrong) {
  let n = 0;
  for (let guard = 0; guard < 60; guard++) {
    const todo = await page.evaluate(() => { const txt = h => { const d = document.createElement('div'); d.innerHTML = String(h); return d.textContent.replace(/\s+/g, ' ').trim(); };
      return window.__q.map((q, i) => ({ i, id: q.id, type: q.type || 'num', answer: q.answer, wrongI: q.type === 'choice' ? q.options.map((o, k) => k).filter(k => k !== q.answer)[0] : null, done: !!(LE.qs(q.id) && LE.qs(q.id).done) })).filter(x => !x.done); });
    if (!todo.length) return;
    const t = todo[0], box = page.locator('.card .q').nth(t.i), bad = n++ < (wrong || 0);
    if (t.type === 'num' || t.type === 'expr') {
      await box.locator('input[type=text]').first().fill(t.type === 'expr' ? (bad ? 'x+999' : String(t.answer)) : String(bad ? t.answer + 123.5 : t.answer)); await box.getByRole('button', { name: 'Check', exact: true }).click();
    } else await box.locator('button.opt[data-i="' + (bad ? t.wrongI : t.answer) + '"]').first().click();
    await tick(page);
  }
}
const step = page => page.evaluate(() => LE.S().step), next = async page => { await page.locator('#btn-next').click(); await tick(page, 400); };
const prompts = page => page.evaluate(() => window.__q.map(q => q.prompt).join('|'));

(async () => {
  const myId = await ids.derive('unit-test-secret', 'Test Student', '3'), br = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] }), results = [];
  async function t(name, fn) { try { await fn(); results.push(['ok  ', name]); } catch (e) { results.push(['FAIL', name + ' -> ' + String(e.message).split('\n')[0]]); if (process.env.DEBUG) console.log(e.stack); } }
  for (const P of PAGES) {
    await t(P.f + ': review needs every item; scored part is one try, no hints; one miss over the line fails with a retake; the pass mark passes', async () => {
      const { ctx, page, errs } = await open(br, P.f); await tick(page, 1200);
      await page.fill('#mrd-id', myId); await page.fill('#mrd-period', '3'); await page.locator('#mrd-period').blur(); await tick(page, 500); await next(page);
      assert.strictEqual(await step(page), 'review'); assert.strictEqual(await page.locator('.card .q').count(), P.review); assert.strictEqual(await page.locator('#btn-next').isDisabled(), true);
      await answer(page, 0); assert.strictEqual(await page.locator('#btn-next').isDisabled(), false); await next(page);
      assert.strictEqual(await step(page), 'quiz'); assert.strictEqual(await page.locator('.card .q').count(), P.N);
      const first = await prompts(page);
      await answer(page, P.N - P.need + 1);   // one too many wrong
      assert.strictEqual(await page.locator('#btn-next').isDisabled(), false); await next(page);
      assert.strictEqual(await step(page), 'result'); let text = await page.locator('#stage').innerText();
      assert.ok(new RegExp((P.need - 1) + ' of ' + P.N).test(text) && /Not yet/.test(text), 'failing score shown: ' + text.slice(0, 120));
      assert.strictEqual(await page.locator('a[href$="' + P.next + '"]').count(), 0, 'no next link on a fail');
      await page.getByRole('button', { name: 'Retake with new questions' }).click(); await tick(page, 600);
      assert.strictEqual(await step(page), 'quiz'); assert.ok(/try 2/.test(await page.locator('#stage h2').first().innerText())); assert.strictEqual(await page.locator('.card .q').count(), P.N);
      assert.notStrictEqual(await prompts(page), first, 'a retake is a different set');
      await answer(page, P.N - P.need);   // exactly the pass mark
      await next(page); text = await page.locator('#stage').innerText();
      assert.ok(new RegExp(P.need + ' of ' + P.N).test(text) && /Passed/.test(text), 'passing score shown: ' + text.slice(0, 120));
      assert.strictEqual(await page.locator('a[href$="' + P.next + '"]').count(), 1, 'next link on a pass');
      const S = await page.evaluate(() => ({ h: LE.S().d.hist, rec: MrD.profile.all().filter(r => r.lesson === LE.cfg().id).length }));
      assert.deepStrictEqual(S.h.map(h => [h.got, h.pass]), [[P.need - 1, false], [P.need, true]]); assert.strictEqual(S.rec, 1);
      assert.deepStrictEqual(errs, []); await ctx.close();
    });
    await t(P.f + ': #key opens every tab without errors and the quiz has no hint ladder', async () => {
      const { ctx, page, errs } = await open(br, P.f, '#key'); await tick(page, 1200);
      for (const id of ['review', 'quiz', 'result']) { await page.evaluate(i => LE.forceGoto(i), id); await tick(page, 300); assert.ok((await page.locator('.card').innerText()).length > 10, id); }
      await page.evaluate(() => LE.forceGoto('quiz')); await tick(page, 300);
      assert.strictEqual(await page.getByRole('button', { name: /hint/i }).count(), 0, 'no hint button in the scored part');
      assert.deepStrictEqual(errs, []); await ctx.close();
    });
  }
  await br.close(); results.forEach(r => console.log(r.join(' '))); const bad = results.filter(r => r[0] === 'FAIL').length; console.log(bad ? bad + ' failed' : 'all passed'); process.exit(bad ? 1 : 0);
})();
