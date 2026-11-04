/* Per-lesson overrides for 3.3 Derivatives of Inverse Functions (calculus Unit 3). Run with
     TZ=America/New_York TEMPLATE=calc PAGE=calculus/unit-3-composite-implicit-inverse/3-3-inverse.html node tests/template.e2e.js
   3.3 is self-paced: no clock, no trimming, no skipping, no end mark, no stamp or report code. The standard tests that assume the placement warm-up,
   the clock-called huddle, the pace trim and the stamp are replaced; extras cover the four Explore stations, the wrong tries, and resuming the next day. */
const STORE = 'le.3-3-inverse.v1';

async function setRange(box, n, v) { await box.locator('input[type=range]').nth(n).evaluate((el, val) => { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }, String(v)); }
async function station(page, id) {
  const box = page.locator('.card .q[data-qid="' + id + '"]'), chk = box.getByRole('button', { name: /^Check/ });
  if (id === 'X1') for (const v of [10, -10, 5]) { await setRange(box, 0, v); await chk.click(); await page.clock.runFor(300); }
  if (id === 'X2') for (const [r, s] of [[2, 1], [4, 1], [3, 1]]) { await setRange(box, 0, r); await setRange(box, 1, s); await chk.click(); await page.clock.runFor(300); }
  if (id === 'X3') { await setRange(box, 0, 0); await chk.click(); await page.clock.runFor(300); }
  if (id === 'X4') for (const [l, r] of [['3', '1/3'], ['−2', '−1/2'], ['1/5', '5'], ['4', '1/4']]) { await box.getByRole('button', { name: l, exact: true }).click(); await box.getByRole('button', { name: r, exact: true }).click(); await page.clock.runFor(300); }
}
async function solveCard(H, page) { for (const id of ['X1', 'X2', 'X3', 'X4']) if (await page.locator('.card .q[data-qid="' + id + '"]').count()) await station(page, id); await H.answer(page, false); }
/* walk a student from Start to the given step, answering everything, no skipping */
async function walkTo(H, page, target) {
  await H.start(page, H.myId, '3'); await H.next(page);
  for (const id of ['warmup', 'predict', 'explore', 'huddle', 'build']) {
    if (await H.step(page) === target) return;
    assert.strictEqual(await H.step(page), id); await solveCard(H, page); await H.tick(page, 400); await H.next(page);
  }
}
const assert = require('assert');

module.exports = {
  tests: {
    'Placement: all right climbs to band 4; misses stop at band 1': async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      assert.strictEqual(await H.step(page), 'warmup'); assert.strictEqual(await page.locator('.card .q').count(), 3, 'three review items');
      assert.strictEqual(await page.locator('#btn-next').isDisabled(), true);
      await H.answer(page, false); await H.tick(page, 400);
      const S = await page.evaluate(() => LE.S()); assert.strictEqual(S.band0, 1); assert.strictEqual(S.band, 1); assert.strictEqual(S.d.place, undefined, 'no placement');
      assert.strictEqual(await page.locator('#btn-next').isDisabled(), false); assert.deepStrictEqual(errs, []); await ctx.close();
    },
    'Timed huddle: at minute 18 the clock pulls the class in, blanks can be written, Continue returns': async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await H.answer(page, false); await H.next(page);
      for (const hhmm of ['12:20', '12:33', '12:45', '12:58']) { await page.clock.setSystemTime(new Date('2026-10-21T' + hhmm + ':00-04:00')); await H.tick(page, 2500); }
      assert.strictEqual(await H.step(page), 'predict', 'the clock never moves the student');
      assert.strictEqual(await page.locator('#endbar').isHidden(), true, 'no end banner, even after the bell');
      const S = await page.evaluate(() => LE.S()); assert.ok(!S.ended && !S.hfired && !(S.skip && Object.keys(S.skip).length) && !(S.trim && Object.keys(S.trim).length), 'nothing trimmed, skipped or ended');
      assert.strictEqual(await page.evaluate(() => LE.cfg().pacing), undefined); assert.deepStrictEqual(errs, []); await ctx.close();
    },
    'Pace trim: far behind skips Explore and shrinks Build; core tabs stay': async H => {
      const { ctx, page } = await H.open(H.br, '', '2026-10-21T12:44:00-04:00'); await H.tick(page); await H.start(page, H.myId, '3'); await H.tick(page, 3000);
      await page.evaluate(() => LE.goto('build')); assert.strictEqual(await H.step(page), 'start', 'cannot jump ahead at minute 34');
      await H.next(page); await H.answer(page, false); await H.next(page); await H.tick(page, 2000);
      await page.evaluate(() => LE.goto('build')); assert.strictEqual(await H.step(page), 'predict', 'Explore and Huddle are not skippable');
      assert.strictEqual(await page.evaluate(() => { const s = LE.S(); return !!(s.skip && Object.keys(s.skip).length); }), false); await ctx.close();
    },
    'Keypad: the answer box has an on-screen keypad that types into it': async H => {
      const { ctx, page } = await H.open(H.br); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page); await H.answer(page, false); await H.next(page); await H.answer(page, false); await H.next(page);
      await solveCard(H, page); await H.next(page); await solveCard(H, page); await H.next(page);
      assert.strictEqual(await H.step(page), 'build');
      assert.ok(await page.locator('.mrd-kp').count() >= 1);
      const inp = page.locator('.card .q input[type=text]').first();
      for (const k of ['2', 'decimal point', '5']) await page.locator('.mrd-kp button[aria-label="' + k + '"]').first().click();
      assert.strictEqual(await inp.inputValue(), '2.5'); await ctx.close();
    },
    'Full run to the stamp after the end mark, no name anywhere': async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await walkTo(H, page, 'practice');
      assert.strictEqual(await H.step(page), 'practice');
      for (let k = 0; k < 4; k++) { await H.answer(page, false); await H.tick(page, 400); await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400); }
      await H.next(page); assert.strictEqual(await H.step(page), 'check'); await H.answer(page, false); await H.tick(page, 500); await H.next(page);
      assert.strictEqual(await H.step(page), 'notes');
      await page.clock.setSystemTime(new Date('2026-10-21T12:58:00-04:00')); await H.tick(page, 2500);
      const text = await page.locator('#stage').innerText();
      assert.ok(!/\b[A-Z]{3}-\d{3,}/.test(text), 'no stamp'); assert.ok(!/report code/i.test(text), 'no report code'); assert.ok(!/Name:/.test(text));
      assert.ok(/pick up where you stopped/.test(text), 'tells the student they can resume'); assert.ok(await page.getByRole('button', { name: 'View my notes' }).count());
      const rec = await page.evaluate(() => MrD.profile.all().filter(r => r.lesson === '3-3-inverse').length); assert.strictEqual(rec, 1, 'profile record kept');
      assert.deepStrictEqual(errs, []); await ctx.close();
    }
  },
  extra: [
    ['Explore: each station is required, in order; wrong tries give the right message', async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await walkTo(H, page, 'explore');
      assert.strictEqual(await H.step(page), 'explore'); assert.strictEqual(await page.locator('#btn-next').isDisabled(), true);
      const x1 = page.locator('.card .q[data-qid="X1"]'); await x1.getByRole('button', { name: /^Check/ }).click(); await H.tick(page, 300);
      assert.ok(/star is at \(4, 2\)/.test(await x1.locator('.fb').innerText()), 'station 1 miss names the star');
      await station(page, 'X1'); assert.ok(await page.evaluate(() => LE.qs('X1').done));
      const x2 = page.locator('.card .q[data-qid="X2"]'); await setRange(x2, 0, 1); await setRange(x2, 1, 2); await x2.getByRole('button', { name: /^Check/ }).click(); await H.tick(page, 300);
      assert.ok(/copies the slope of f/.test(await x2.locator('.fb').innerText()), 'station 2 copying the slope is named');
      await setRange(x2, 0, 3); await setRange(x2, 1, 5); await x2.getByRole('button', { name: /^Check/ }).click(); await H.tick(page, 300);
      assert.ok(/cuts the green curve/.test(await x2.locator('.fb').innerText()));
      await station(page, 'X2');
      const x3 = page.locator('.card .q[data-qid="X3"]'); assert.ok(/slope of the inverse: 0\.33/.test(await x3.innerText())); await x3.getByRole('button', { name: /^Check/ }).click(); await H.tick(page, 300);
      assert.ok(/not flat/.test(await x3.locator('.fb').innerText())); await setRange(x3, 0, 0); assert.ok(/undefined \(vertical\)/.test(await x3.innerText())); await station(page, 'X3');
      const x4 = page.locator('.card .q[data-qid="X4"]'); await x4.getByRole('button', { name: '3', exact: true }).click(); await x4.getByRole('button', { name: '1/4', exact: true }).click(); await H.tick(page, 300);
      assert.ok(/not partners/.test(await x4.locator('.fb').innerText())); await station(page, 'X4');
      assert.strictEqual(await page.locator('#btn-next').isDisabled(), true, 'the observe questions are still required');
      await H.answer(page, false); assert.strictEqual(await page.locator('#btn-next').isDisabled(), false); assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Resume: stop mid-lesson, open it the next evening on the same device, carry on where you stopped', async H => {
      let r = await H.open(H.br); await H.tick(r.page); await walkTo(H, r.page, 'explore'); await station(r.page, 'X1'); await station(r.page, 'X2');
      const saved = await r.page.evaluate(k => localStorage.getItem(k), STORE); assert.ok(saved); await r.ctx.close();
      r = await H.open(H.br, '', '2026-10-22T20:00:00-04:00'); await r.ctx.addInitScript(([k, v]) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, v); sessionStorage.setItem('seeded', '1'); } }, [STORE, saved]); await r.page.reload();   // seeded before the page loads, so its own unload save cannot overwrite it
       await H.tick(r.page);
      const S = await r.page.evaluate(() => LE.S()); assert.strictEqual(S.step, 'explore'); assert.ok(S.q.X1.done && S.q.X2.done && !(S.q.X3 && S.q.X3.done)); assert.ok(!S.ended);
      assert.strictEqual(await r.page.locator('.card .q[data-qid="X1"]').getByText(/Station done/).count(), 1, 'finished stations show as done');
      assert.strictEqual(await r.page.locator('#endbar').isHidden(), true); assert.deepStrictEqual(r.errs, []); await r.ctx.close();
    }],
    ['Page: the print view and every tab render without errors in #key', async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      for (const id of ['warmup', 'predict', 'explore', 'huddle', 'build', 'practice', 'check', 'notes']) { await page.evaluate(i => LE.forceGoto(i), id); await H.tick(page, 300); assert.ok((await page.locator('.card').innerText()).length > 40, id); }
      assert.deepStrictEqual(errs, []); await ctx.close();
    }]
  ]
};
