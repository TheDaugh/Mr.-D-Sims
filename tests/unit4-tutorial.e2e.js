/* E2E for the eight Unit 4 visual-tutorial lessons (4.4 to 4.7, parts 1 and 2). Needs: python3 -m http.server 8123 (repo root).
     TZ=America/New_York PLAYWRIGHT_DIR=/opt/node-tools/node_modules/playwright node tests/unit4-tutorial.e2e.js [lesson-id ...]
   Checks per lesson: #key opens every tab with no errors; a student walks Start > Warm-up > Predict > Concept > I do > You do with Next locked until each question is answered;
   no huddle, no codes, no stamp; Practice and Check render; the notes tab is reached; keypad on number answers; no teacher name or tier words on the page. */
const assert = require('assert'), fs = require('fs');
const PW = process.env.PLAYWRIGHT_DIR || ['/opt/node-tools/node_modules/playwright', '/opt/npm-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/playwright'].find(p => fs.existsSync(p));
const { chromium } = require(PW);
const CHROME = process.env.CHROMIUM || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const BASE = process.env.BASE || 'http://localhost:8123', DIR = '/calculus/unit-4-contextual-applications/';
const ALL = ['4-4-pt1-setup', '4-4-pt2-differentiate', '4-5-pt1-triangles', '4-5-pt2-volumes', '4-6-pt1-local-linearity', '4-6-pt2-approximating', '4-7-pt1-lhopital-once', '4-7-pt2-lhopital-more'];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const OUT = process.env.OUT || '/tmp/u4shots'; fs.mkdirSync(OUT, { recursive: true });

async function solve(page) {
  return page.evaluate(() => { let n = 0;
    document.querySelectorAll('.q[data-qid]').forEach(box => {
      const id = box.dataset.qid, q = LE.debug.qs[id], st = LE.qs(id); if (!q || (st && st.done)) return;
      if (q.type === 'choice') { const b = box.querySelector('.opt[data-i="' + q.answer + '"]'); if (b && !b.disabled) { b.click(); n++; } }
      else if (q.type === 'num') { const inp = box.querySelector('input'), btn = box.querySelector('button.btn'); if (inp && !inp.disabled) { inp.value = String(+Number(q.answer).toPrecision(6)); btn.click(); n++; } }
      else if (q.type === 'expr') { const inp = box.querySelector('input'), btn = box.querySelector('button.btn'); if (inp && !inp.disabled) { inp.value = String(q.answer); inp.dispatchEvent(new Event('input', { bubbles: true })); btn.click(); n++; } }
    }); return n; });
}
const settle = async page => { for (let k = 0; k < 40; k++) { if (!(await solve(page))) break; await page.waitForTimeout(60); } };
const step = page => page.evaluate(() => LE.S().step);

async function one(br, id) {
  const errs = [], mk = async (hash, time) => { const ctx = await br.newContext({ reducedMotion: 'reduce', viewport: { width: 1366, height: 768 } }); const page = await ctx.newPage(); page.setDefaultTimeout(8000);
    page.on('pageerror', e => errs.push(id + ': ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load resource/.test(m.text())) errs.push(id + ': ' + m.text()); });
    await page.route(/fonts\./, r => r.abort()); await page.clock.install({ time: new Date(time || '2026-11-18T12:15:00-05:00') }); await page.goto(BASE + DIR + id + '.html' + (hash || '')); await page.waitForTimeout(500); return { ctx, page }; };
  /* 1. #key */
  { const { ctx, page } = await mk('#key');
    const labels = await page.locator('#steps button').allInnerTexts(); assert.ok(labels.length >= 8, id + ' tabs: ' + labels.join('|'));
    assert.ok(!labels.some(l => /huddle|notes huddle/i.test(l)), 'no huddle tab');
    assert.strictEqual(await page.locator('#steps button:not([disabled])').count(), labels.length, 'all tabs open in #key');
    for (const t of ['concept', 'ido', 'build', 'practice', 'check', 'notes']) { await page.evaluate(i => LE.forceGoto(i), t); await page.waitForTimeout(300); const txt = await page.locator('.card').first().innerText(); assert.ok(txt.length > 40, id + ' ' + t + ' renders');
      if (t === 'concept' || t === 'ido') assert.ok(await page.locator('.vt-fig svg, .vt-fig canvas, .vt-fig table').count() >= 1, id + ' ' + t + ' has a picture'); }
    await page.evaluate(() => LE.forceGoto('concept')); await page.waitForTimeout(300); await page.screenshot({ path: OUT + '/' + id + '-key-concept.png' });
    await page.evaluate(() => LE.forceGoto('ido')); await page.waitForTimeout(300); await page.screenshot({ path: OUT + '/' + id + '-key-ido.png' });
    await ctx.close(); }
  /* 2. student walk */
  { const { ctx, page } = await mk('');
    await page.fill('#mrd-id', '65J-7TGT'); await page.fill('#mrd-period', '3'); await page.locator('#mrd-period').blur(); await page.waitForTimeout(400);
    const nextBtn = page.locator('#btn-next'); const next = async () => { await page.waitForTimeout(250); assert.strictEqual(await nextBtn.isDisabled(), false, id + ' Continue unlocked at ' + await step(page)); await nextBtn.click(); await page.waitForTimeout(250); };
    await next(); assert.strictEqual(await step(page), 'warmup'); assert.strictEqual(await nextBtn.isDisabled(), true, 'warm-up gates Continue'); await settle(page); await next();
    assert.strictEqual(await step(page), 'predict'); await settle(page); await next();
    assert.strictEqual(await step(page), 'concept');
    /* Next inside the slide show is locked until the question is answered */
    const vtNext = page.locator('.vt-next'); assert.ok(await page.locator('.vt-fig').count(), 'concept shows a picture');
    if (await page.locator('.vt-side .q').count()) assert.strictEqual(await vtNext.isDisabled(), true, id + ' concept Next locked until answered');
    assert.strictEqual(await nextBtn.isDisabled(), true, 'cannot leave Concept early');
    await page.screenshot({ path: OUT + '/' + id + '-student-concept1.png' });
    for (let k = 0; k < 14; k++) { await settle(page); if (await vtNext.isDisabled()) break; const t = await vtNext.innerText(); if (/End of this part/.test(t)) break; await vtNext.click(); await page.waitForTimeout(200); }
    await settle(page); await next(); assert.strictEqual(await step(page), 'ido');
    await page.screenshot({ path: OUT + '/' + id + '-student-ido1.png' });
    for (let k = 0; k < 14; k++) { await settle(page); const t = await vtNext.innerText(); if (/End of this part/.test(t)) break; await vtNext.click(); await page.waitForTimeout(200); }
    await settle(page); await next(); assert.strictEqual(await step(page), 'build');
    /* keypad on a number answer, if the first question is numeric */
    if (await page.locator('.card .q input[type=text], .card .q input[inputmode]').count()) assert.ok(await page.locator('.mrd-kp').count() >= 1, id + ': keypad offered with the answer box');
    await page.screenshot({ path: OUT + '/' + id + '-student-youdo.png' });
    await settle(page); await next();
    assert.strictEqual(await step(page), 'practice'); await page.screenshot({ path: OUT + '/' + id + '-student-practice.png' });
    for (let k = 0; k < 4; k++) { await settle(page); const b = page.getByRole('button', { name: 'Next question' }); if (await b.count()) { await b.click(); await page.waitForTimeout(250); } }
    await next(); assert.strictEqual(await step(page), 'check'); await settle(page); await next(); assert.strictEqual(await step(page), 'notes');
    const text = await page.locator('#stage').innerText();
    assert.ok(!/\b[A-Z]{3}-\d{3,}/.test(text.replace(/65J-7TGT/g, '')), 'no stamp'); assert.ok(!/report code|huddle code|class code/i.test(text), 'no codes');
    const body = await page.evaluate(() => document.body.innerText); assert.ok(!/Mr\.? ?D\b|\bextension\b|\bchallenge\b|\boptional\b/i.test(body), 'no teacher name or tier words');
    await ctx.close(); }
  return errs;
}
(async () => {
  const br = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] }); let fail = 0;
  for (const id of ids) { try { const e = await one(br, id); if (e.length) { fail++; console.log('FAIL', id, e.slice(0, 3)); } else console.log('ok  ', id); } catch (e) { fail++; console.log('FAIL', id, e.message.split('\n')[0]); } }
  await br.close(); console.log(fail ? fail + ' failed' : 'all ' + ids.length + ' passed'); process.exit(fail ? 1 : 0);
})();
