/* Shared per-lesson overrides for the self-paced calculus Unit 4 lessons (4.1 to 4.3). Each lesson file is only its id and its station plan.
   Self-paced: no clock, no trimming, no skipping, no end mark, no stamp or report code. The standard tests that assume the placement warm-up, the clock-called
   huddle, the pace trim and the stamp are replaced. Station plan steps: ['s', n, value] sets slider n; ['c'] presses Check; ['ok'] picks the right choice
   (the engine marks the right button data-ok); ['b', name] presses a button by its name; ['m', id] matches the three graphs (letters shuffled by the seed). */
const assert = require('assert');

module.exports = function (ID, DATE, PLAN, WRONG) {
  const STORE = 'le.' + ID + '.v1', STATIONS = Object.keys(PLAN);
  async function setRange(box, n, v) { await box.locator('input[type=range]').nth(n).evaluate((el, val) => { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }, String(v)); }
  async function station(H, page, id) {
    const box = page.locator('.card .q[data-qid="' + id + '"]');
    for (const st of PLAN[id]) {
      if (st[0] === 's') await setRange(box, st[1], st[2]);
      else if (st[0] === 'c') await box.getByRole('button', { name: /^Check/ }).click();
      else if (st[0] === 'ok') await box.locator('button[data-ok]').first().click();
      else if (st[0] === 'b') await box.getByRole('button', { name: st[1], exact: true }).click();
      else if (st[0] === 'm') { const order = await page.evaluate(seed => LE.shuffle([0, 1, 2], LE.seedRng(seed)), st[1]); for (let k = 0; k < 3; k++) await box.getByRole('button', { name: 'Graph ' + 'ABC'[order.indexOf(k)], exact: true }).click(); }
      await H.tick(page, 150);
    }
  }
  async function solveCard(H, page) { for (const id of STATIONS) if (await page.locator('.card .q[data-qid="' + id + '"]').count()) await station(H, page, id); await H.answer(page, false); }
  async function walkTo(H, page, target) {
    await H.start(page, H.myId, '3'); await H.next(page);
    for (const id of ['warmup', 'predict', 'explore', 'huddle', 'build']) {
      if (await H.step(page) === target) return;
      assert.strictEqual(await H.step(page), id); await solveCard(H, page); await H.tick(page, 400); await H.next(page);
    }
  }
  const D = (d) => '2026-10-21T' + d + ':00-04:00';
  return {
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
        for (const hhmm of ['12:20', '12:33', '12:45', '12:58']) { await page.clock.setSystemTime(new Date(D(hhmm))); await H.tick(page, 2500); }
        assert.strictEqual(await H.step(page), 'predict', 'the clock never moves the student');
        assert.strictEqual(await page.locator('#endbar').isHidden(), true, 'no end banner, even after the bell');
        const S = await page.evaluate(() => LE.S()); assert.ok(!S.ended && !S.hfired && !(S.skip && Object.keys(S.skip).length) && !(S.trim && Object.keys(S.trim).length), 'nothing trimmed, skipped or ended');
        assert.strictEqual(await page.evaluate(() => LE.cfg().pacing), undefined); assert.deepStrictEqual(errs, []); await ctx.close();
      },
      'Pace trim: far behind skips Explore and shrinks Build; core tabs stay': async H => {
        const { ctx, page } = await H.open(H.br, '', D('12:44')); await H.tick(page); await H.start(page, H.myId, '3'); await H.tick(page, 3000);
        await page.evaluate(() => LE.goto('build')); assert.strictEqual(await H.step(page), 'start', 'cannot jump ahead at minute 34');
        await H.next(page); await H.answer(page, false); await H.next(page); await H.tick(page, 2000);
        await page.evaluate(() => LE.goto('build')); assert.strictEqual(await H.step(page), 'predict', 'Explore and Huddle are not skippable');
        assert.strictEqual(await page.evaluate(() => { const s = LE.S(); return !!(s.skip && Object.keys(s.skip).length); }), false); await ctx.close();
      },
      'Keypad: the answer box has an on-screen keypad that types into it': async H => {
        const { ctx, page } = await H.open(H.br); await H.tick(page); await walkTo(H, page, 'build');
        assert.strictEqual(await H.step(page), 'build');
        if (await page.locator('.card .q input[type=text]').count()) {
          assert.ok(await page.locator('.mrd-kp').count() >= 1, 'a keypad is offered with the answer box');
          const digits = await page.locator('.mrd-kp button[aria-label="2"]').count();   // a typed-expression keypad has symbols only
          const keys = digits ? ['2', '5'] : ['open parenthesis'], want = digits ? '25' : '(';
          for (const k of keys) await page.locator('.mrd-kp button[aria-label="' + k + '"]').first().click();
          assert.ok((await page.locator('.card .q input[type=text]').evaluateAll(l => l.map(i => i.value))).some(v => v.includes(want)), 'the keypad typed ' + want + ' into an answer box');
        }
        await ctx.close();
      },
      '#key: every tab open, huddle needs no code, answers marked, Concepts button works': async H => {
        const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
        assert.ok(await page.locator('.mrd-tb').isVisible());
        assert.strictEqual(await page.locator('#steps button:not([disabled])').count(), 9);
        await page.locator('#steps button', { hasText: 'Notes' }).click(); await H.tick(page, 300);
        assert.ok(await page.locator('.hd-line input.keyed').count() >= 1);
        await page.getByRole('button', { name: 'Concepts' }).click(); assert.ok(await page.locator('.cp-panel').isVisible());
        await page.keyboard.press('Escape'); assert.ok(!(await page.locator('.cp-panel').isVisible()));
        assert.deepStrictEqual(errs, []); await ctx.close();
      },
      'Full run to the stamp after the end mark, no name anywhere': async H => {
        const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await walkTo(H, page, 'practice');
        assert.strictEqual(await H.step(page), 'practice');
        for (let k = 0; k < 4; k++) { await H.answer(page, false); await H.tick(page, 400); await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400); }
        await H.next(page); assert.strictEqual(await H.step(page), 'check'); await H.answer(page, false); await H.tick(page, 500); await H.next(page);
        assert.strictEqual(await H.step(page), 'notes');
        await page.clock.setSystemTime(new Date(D('12:58'))); await H.tick(page, 2500);
        const text = await page.locator('#stage').innerText();
        assert.ok(!/\b[A-Z]{3}-\d{3,}/.test(text), 'no stamp'); assert.ok(!/report code/i.test(text), 'no report code'); assert.ok(!/Name:/.test(text));
        assert.ok(/pick up where you stopped/.test(text), 'tells the student they can resume'); assert.ok(await page.getByRole('button', { name: 'View my notes' }).count());
        const rec = await page.evaluate(id => MrD.profile.all().filter(r => r.lesson === id).length, ID); assert.strictEqual(rec, 1, 'profile record kept');
        assert.deepStrictEqual(errs, []); await ctx.close();
      }
    },
    extra: [
      ['Explore: every station is required, in order; a wrong try gives the named message', async H => {
        const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await walkTo(H, page, 'explore');
        assert.strictEqual(await H.step(page), 'explore'); assert.strictEqual(await page.locator('#btn-next').isDisabled(), true);
        await WRONG(H, page);
        for (const id of STATIONS) { await station(H, page, id); assert.ok(await page.evaluate(i => LE.qs(i).done, id), id + ' done'); }
        assert.strictEqual(await page.locator('#btn-next').isDisabled(), true, 'the observe questions are still required');
        await H.answer(page, false); assert.strictEqual(await page.locator('#btn-next').isDisabled(), false); assert.deepStrictEqual(errs, []); await ctx.close();
      }],
      ['Resume: stop mid-lesson, open it the next evening on the same device, carry on where you stopped', async H => {
        let r = await H.open(H.br); await H.tick(r.page); await walkTo(H, r.page, 'explore'); await station(H, r.page, STATIONS[0]); await station(H, r.page, STATIONS[1]);
        const saved = await r.page.evaluate(k => localStorage.getItem(k), STORE); assert.ok(saved); await r.ctx.close();
        r = await H.open(H.br, '', '2026-10-22T20:00:00-04:00'); await r.ctx.addInitScript(([k, v]) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, v); sessionStorage.setItem('seeded', '1'); } }, [STORE, saved]); await r.page.reload();
        await H.tick(r.page);
        const S = await r.page.evaluate(() => LE.S()); assert.strictEqual(S.step, 'explore');
        assert.ok(S.q[STATIONS[0]].done && S.q[STATIONS[1]].done && !(S.q[STATIONS[2]] && S.q[STATIONS[2]].done)); assert.ok(!S.ended);
        assert.strictEqual(await r.page.locator('.card .q[data-qid="' + STATIONS[0] + '"]').getByText(/Station done/).count(), 1, 'finished stations show as done');
        assert.strictEqual(await r.page.locator('#endbar').isHidden(), true); assert.deepStrictEqual(r.errs, []); await r.ctx.close();
      }],
      ['Page: every tab renders without errors in #key', async H => {
        const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
        for (const id of ['warmup', 'predict', 'explore', 'huddle', 'build', 'practice', 'check', 'notes']) { await page.evaluate(i => LE.forceGoto(i), id); await H.tick(page, 300); assert.ok((await page.locator('.card').innerText()).length > 40, id); }
        assert.deepStrictEqual(errs, []); await ctx.close();
      }]
    ]
  };
};
