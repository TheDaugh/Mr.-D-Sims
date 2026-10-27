/* Per-lesson overrides for 3.6 Finding Boundary Values (stats, Unit 3 slot 11). Run with
     TZ=America/New_York TEMPLATE=stats PAGE=stats/unit-3-normal-distribution/3-6-boundary-values.html node tests/template.e2e.js
   It replaces the four standard tests that assume the placement warm-up, the two-question check and nine tabs, and adds tests for the Explore sim,
   the Models tab, the Build order, the exit tolerance, the board page and the banned words. */
const C = require('../../stats/unit-3-normal-distribution/day-cards/stats-11.content.js');
const BASE = process.env.BASE || 'http://localhost:8123';
const ID = '3-6-boundary-values';

/* answer whatever is open on the card: num (one or two numbers), choice and typed (custom) items. wrong=true answers wrongly. Returns when nothing is left. */
async function solve(page, wrong) {
  for (let guard = 0; guard < 80; guard++) {
    const todo = await page.evaluate(() => window.__q.map((q, i) => ({ i, id: q.id, type: q.type, answer: q.answer, answer2: q.answer2, key: q.keyText,
      wrongI: q.type === 'choice' ? q.options.map((o, k) => k).filter(k => k !== q.answer)[0] : null, done: !!(LE.qs(q.id) && LE.qs(q.id).done) })).filter(x => !x.done));
    if (!todo.length) return;
    const t = todo[0], box = page.locator('.card .q').nth(t.i);
    if (t.type === 'num') {
      const v = wrong ? String(t.answer + 123) : (t.answer2 != null ? t.answer + ', ' + t.answer2 : String(t.answer));
      await box.locator('input[type=text]').first().fill(v); await box.getByRole('button', { name: 'Check', exact: true }).click();
    } else if (t.type === 'custom') {
      await box.locator('input[type=text]').first().fill(wrong ? 'nope' : t.key); await box.getByRole('button', { name: 'Check', exact: true }).click();
    } else await box.locator('button.opt[data-i="' + (wrong ? t.wrongI : t.answer) + '"]').first().click();
    await page.clock.runFor(900);
  }
}
/* walk every move of the open model; the Next move button appears when the move is answered */
async function walkModel(H, page) {
  for (let g = 0; g < 14; g++) {
    await solve(page, false);
    const nm = page.getByRole('button', { name: /^(Move 1|Next move)$/ });
    if (await nm.count()) { await nm.first().click(); await H.tick(page, 500); } else return;
  }
}
const typeIn = async (page, i, text) => { const box = page.locator('.card .q').nth(i); await box.locator('input[type=text]').first().fill(text); await box.getByRole('button', { name: 'Check', exact: true }).click(); await page.clock.runFor(400); };
const fbText = (page, i) => page.locator('.card .q').nth(i).locator('.fb, .worked').first().innerText();
const markerValue = page => page.locator('.nk-boundary [role=slider]').getAttribute('aria-valuenow').then(Number);

module.exports = {
  tests: {
    'Placement: all right climbs to band 4; misses stop at band 1': async H => {
      let r = await H.open(H.br); await H.tick(r.page); await H.start(r.page, H.myId, '3'); await H.next(r.page);
      await solve(r.page, false); await H.tick(r.page, 900);
      H.assert.strictEqual(await r.page.evaluate(() => LE.S().band0), 2, 'six first-try rights place at band 2 (the warm-up has bands 1 and 2)'); await r.ctx.close();
      r = await H.open(H.br); await H.tick(r.page); await H.start(r.page, H.myId, '3'); await H.next(r.page);
      await solve(r.page, true); await H.tick(r.page, 900);
      H.assert.strictEqual(await r.page.evaluate(() => LE.S().band0), 1); H.assert.ok(await r.page.evaluate(() => LE.S().d.place.done)); await r.ctx.close();
      r = await H.open(H.br); await H.tick(r.page); await H.start(r.page, H.myId, '3'); await H.next(r.page);
      const n = await r.page.locator('.card .q').count(); H.assert.strictEqual(n, 6, 'six warm-up questions on one card');
      await solve(r.page, false); H.assert.strictEqual(await r.page.evaluate(() => LE.S().band0), 2); await r.ctx.close();
    },
    'Timed huddle: at minute 18 the clock pulls the class in, blanks can be written, Continue returns': async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await solve(page, false); await H.tick(page, 900); await H.next(page); H.assert.strictEqual(await H.step(page), 'predict');
      await page.clock.setSystemTime(new Date('2026-10-21T' + H.T18 + ':00-04:00')); await H.tick(page, 2500);
      H.assert.strictEqual(await H.step(page), 'huddle');
      const blanks = await page.evaluate(() => { const sp = window.SPECS['3-6-boundary-values'], out = []; (sp.huddle.defs || []).forEach(d => MrD.huddle.parse(d.text).forEach(p => p.b && out.push(p.b))); return out; });
      await page.locator('.hd-line input').first().fill(blanks[0]); await page.locator('.hd-line input').nth(1).fill(blanks[1]);
      await page.getByRole('button', { name: 'Check mine' }).click();
      H.assert.ok(await page.locator('.hd-line input.ok').count() >= 2);
      H.assert.ok((await page.locator('.card').innerText()).includes(C.talk[0]), 'the huddle talk line is on the tab');
      H.assert.ok(await page.locator('.hd-fig svg.nfig').count() === 1, 'the labeled curve is drawn in code');
      H.assert.strictEqual(await page.locator('#btn-next').isDisabled(), false);
      await H.next(page); H.assert.strictEqual(await H.step(page), 'predict', 'returns to where the student was');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    },
    '#key: every tab open, huddle needs no code, answers marked, Concepts button works': async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      H.assert.ok(await page.locator('.mrd-tb').isVisible());
      H.assert.strictEqual(await page.locator('#steps button:not([disabled])').count(), 10);
      await page.locator('#steps button', { hasText: 'Huddle' }).click(); await H.tick(page, 300);
      H.assert.ok(await page.locator('.hd-line input.keyed').count() >= 5);
      await page.getByRole('button', { name: 'Concepts' }).click(); H.assert.ok(await page.locator('.cp-panel').isVisible());
      await page.keyboard.press('Escape'); H.assert.ok(!(await page.locator('.cp-panel').isVisible()));
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    },
    'Full run to the stamp after the end mark, no name anywhere': async H => {
      const { ctx, page, errs } = await H.open(H.br, '', '2026-10-21T' + H.T0 + ':00-04:00'); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await solve(page, false); await H.tick(page, 900); await H.next(page);                              // warm-up
      await solve(page, false); await H.tick(page, 500); await H.next(page);                              // predict
      await H.next(page);                                                                                 // explore is skipped here (its own test below)
      await page.evaluate(() => { const S = LE.S(); S.hfired = ['h1']; S.d.hud = { 'd0.1': 'sum' }; LE.save(); });
      H.assert.strictEqual(await H.step(page), 'huddle'); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'models');
      for (let m = 0; m < 5; m++) { await walkModel(H, page); if (m < 4) { await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 500); } }
      H.assert.ok(await page.evaluate(() => BV_UI.modelsDone()), 'all five models done'); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'build'); await solve(page, false); await H.tick(page, 600); await H.next(page);
      for (let k = 0; k < 4; k++) { await solve(page, false); await H.tick(page, 400); if (k < 3) { await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400); } }
      await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'check'); await solve(page, false); await H.tick(page, 500);
      H.assert.strictEqual(await page.evaluate(() => ['X1', 'X2', 'X3'].filter(id => LE.qs(id).ok && LE.qs(id).misses === 0).length), 3); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'notes');
      await page.clock.setSystemTime(new Date('2026-10-21T' + H.T44 + ':00-04:00')); await H.tick(page, 2500);
      const text = await page.locator('#stage').innerText();
      H.assert.ok(/\bBOU-\d{3,}/.test(text), 'stamp shown'); H.assert.ok(text.includes(H.myId), 'ID shown'); H.assert.ok(!/Name:/.test(text), 'no name label');
      const code = await page.locator('.longcode').innerText(), f = await page.evaluate(([i, c]) => LE.decodeReport(i, c).fields, [ID, code]);
      H.assert.strictEqual(f[6], '1-1-1', 'the report code carries the three exit bits'); H.assert.strictEqual(f[3], '2');
      const rec = await page.evaluate(() => MrD.profile.all().pop()); H.assert.strictEqual(rec.lesson, ID);
      H.assert.ok(rec.items.some(x => x.skill === 'check-x2') && rec.items.some(x => x.skill === 'predict-3'), 'the record carries the exit and the predictions');
      await page.locator('#btn-notes').click(); await H.tick(page, 400);
      const notes = await page.locator('#notes-print-root, #stage').first().innerText();
      H.assert.ok(/Models/.test(notes) && /M1:/.test(notes) && /Watch for/.test(notes), 'the finished models are in the notes');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }
  },
  extra: [
    ['Explore: the area is hidden until Commit; a miss names the direction; four targets in order; the run log has target, boundary, area and tries', async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      await page.locator('#steps button', { hasText: 'Explore' }).click(); await H.tick(page, 300);
      const m = page.locator('.nk-boundary [role=slider]'), ro = page.locator('.nk-readout');
      H.assert.ok((await page.locator('.card h3').first().innerText()).includes('Boundary 1 of 4'));
      H.assert.ok((await page.locator('.keyline').innerText()).includes('KEY: 30 minutes'), 'the key shows the exact value');
      H.assert.ok(!/\d\.\d{3}/.test(await ro.innerText()), 'no area before Commit');
      H.assert.strictEqual(await markerValue(page), 18);
      /* a mouse drag moves the boundary: onto the mean of the curve */
      const sv = await page.locator('.nk-boundary svg').boundingBox(), hd = await m.boundingBox();
      const px = v => sv.x + (24 + (v - 9) / 42 * 512) / 560 * sv.width;   // minutes to screen x (viewBox 560 wide, axis 24..536 for 9..51)
      await page.mouse.move(hd.x + hd.width / 2, hd.y + 12); await page.mouse.down(); await page.mouse.move(px(30), hd.y + 12, { steps: 8 }); await page.mouse.up();
      H.assert.ok(Math.abs(await markerValue(page) - 30) <= 0.3, 'the drag put the boundary near 30: ' + await markerValue(page));
      await m.focus(); await page.keyboard.press('Home'); for (let i = 0; i < 7; i++) await page.keyboard.press('PageUp');
      H.assert.strictEqual(await markerValue(page), 30);
      await page.getByRole('button', { name: 'Commit' }).click();
      H.assert.ok(/Area to the left: 0\.5000/.test(await ro.innerText())); H.assert.ok((await page.locator('.card .msg.ok').first().innerText()).includes('The exact boundary is 30 minutes'));
      await page.getByRole('button', { name: 'Next boundary' }).click(); await H.tick(page, 300);
      /* target 0.90: commit at the start (a miss), see the direction, move: the readout hides again */
      H.assert.ok((await page.locator('.card h3').first().innerText()).includes('Boundary 2 of 4'));
      await page.getByRole('button', { name: 'Commit' }).click();
      H.assert.ok((await page.locator('.card .msg.bad').first().innerText()).includes('Move the boundary to the right'));
      H.assert.ok(/0\.0228/.test(await ro.innerText()), 'the area shows after Commit');
      await m.focus(); await page.keyboard.press('ArrowRight'); H.assert.ok(!/\d\.\d{3}/.test(await ro.innerText()), 'moving hides the area again');
      for (let i = 0; i < 6; i++) await page.keyboard.press('PageUp');      // 18.5 + 18 = 36.5
      for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowRight');  // 37.5
      await page.getByRole('button', { name: 'Commit' }).click();
      H.assert.ok((await page.locator('.card .msg.ok').first().innerText()).includes('The exact boundary is 37.7 minutes'));
      await page.getByRole('button', { name: 'Next boundary' }).click(); await H.tick(page, 300);
      await m.focus(); for (let i = 0; i < 2; i++) await page.keyboard.press('PageUp'); for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowRight');   // 25
      await page.getByRole('button', { name: 'Commit' }).click(); H.assert.ok(await page.getByRole('button', { name: 'Next boundary' }).count());
      await page.getByRole('button', { name: 'Next boundary' }).click(); await H.tick(page, 300);
      await m.focus(); for (let i = 0; i < 7; i++) await page.keyboard.press('PageUp'); for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowRight');   // 40
      await page.getByRole('button', { name: 'Commit' }).click(); await page.getByRole('button', { name: 'Done' }).click(); await H.tick(page, 300);
      const runs = await page.evaluate(() => LE.S().d.bnd.runs);
      H.assert.deepStrictEqual(runs.map(r => r.target), [0.5, 0.9, 0.2, 0.95]); H.assert.deepStrictEqual(runs.map(r => r.tries), [1, 2, 1, 1]);
      runs.forEach((r, i) => { H.assert.ok(Math.abs(r.area - r.target) <= 0.01 && typeof r.boundary === 'number', JSON.stringify(r)); });
      H.assert.strictEqual(await page.locator('.card table tbody tr').count(), 4); H.assert.ok((await page.locator('.card').innerText()).includes('All four boundaries found'));
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Models: M1 watch, M2 with me, M3 you do, M4 watch, M5 with me; the curve and the answer appear only when earned; wrong tries show the card\'s own text', async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      await page.locator('#steps button', { hasText: 'Models' }).click(); await H.tick(page, 300);
      H.assert.strictEqual(await page.locator('.bvm-rail li').count(), 5);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 400);
      H.assert.ok(await page.locator('.bvm-fig svg').count() === 1 && !/37\.7/.test(await page.locator('.bvm-fig').innerHTML()), 'M1: the curve is shaded, the value is not printed yet');
      for (let i = 0; i < 2; i++) { await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300); }
      H.assert.ok(/37\.7/.test(await page.locator('.bvm-fig').innerHTML()), 'M1: the boundary is labeled after move 3');
      for (let i = 0; i < 2; i++) { await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300); }
      H.assert.ok((await page.locator('.bvm-main').innerText()).includes('Watch for: ' + C.models[0].slip), 'M1 slip');
      await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 400);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 300);
      H.assert.ok(!/20%/.test(await page.locator('.bvm-fig').innerHTML()), 'M2: the area is not printed before the student gives it');
      await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300);   // move 2 is typed: a wrong tail
      await typeIn(page, 0, '0.8'); H.assert.ok((await fbText(page, 0)).includes(C.models[1].slip), 'M2 move 2: the card slip names the tail');
      await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300);   // move 3: arguments out of order
      await typeIn(page, 1, 'invNorm(30, 6, 0.2)'); H.assert.ok((await fbText(page, 1)).includes(C.misconceptions[3].fix), 'M2 move 3: the card names the argument order');
      await walkModel(H, page);
      H.assert.ok((await page.locator('.bvm-main').innerText()).includes('Watch for: ' + C.models[1].slip));
      await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 400);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 300);
      H.assert.strictEqual(await page.locator('.bvm-fig').count(), 0, 'M3: no curve before the student answers move 1');
      await walkModel(H, page); H.assert.ok((await page.locator('.bvm-main').innerText()).includes('Watch for: ' + C.models[2].slip), 'M3 slip');
      await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 400);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 300);
      H.assert.ok(/mean = \?/.test(await page.locator('.bvm-fig').innerHTML()), 'M4: the mean is the unknown on the curve');
      for (let i = 0; i < 4; i++) { await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300); }
      H.assert.ok(/32\.3/.test(await page.locator('.bvm-fig').innerHTML()), 'M4: the mean is filled in at the end');
      await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 400);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 300);
      await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300); await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300);
      await typeIn(page, 0, '40 = 30 + 1.28 * SD'); await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300);
      await typeIn(page, 1, '12.8'); H.assert.ok((await fbText(page, 1)).includes(C.misconceptions[4].fix), 'M5 move 4: multiplying names the card fix');
      await walkModel(H, page); H.assert.ok((await page.locator('.bvm-main').innerText()).includes('Watch for: ' + C.models[4].slip), 'M5 slip');
      H.assert.ok(/7\.8/.test(await page.locator('.bvm-fig').innerHTML()), 'M5: the SD is filled in at the end');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Build: the card\'s four parts in order; shrunk to two it keeps direction and the upper tail and cuts the missing mean or SD', async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      await page.evaluate(() => { const S = LE.S(); S.band0 = S.band = 2; LE.save(); LE.forceGoto('build'); }); await H.tick(page, 400);
      const q = await page.evaluate(() => window.__q.map(q => ({ id: q.id, tag: q.tag, itemType: q.itemType, left: q.meta && q.meta.leftAreas, pic: !!q.pic, prompt: q.prompt })));
      H.assert.strictEqual(q.length, 4); H.assert.deepStrictEqual(q.map(x => x.id), ['b.0', 'b.1', 'b.2', 'b.3']);
      H.assert.strictEqual(q[0].itemType, 'sort'); H.assert.ok(/area question or a boundary question/.test(q[0].prompt));
      H.assert.ok(q[1].left.length === 1 && q[1].left[0] > 0.5, 'part 2 is an upper-tail boundary: ' + JSON.stringify(q[1]));
      H.assert.ok(q[2].left.length === 1 && q[2].left[0] < 0.5, 'part 3 is a lower-tail boundary: ' + JSON.stringify(q[2]));
      H.assert.strictEqual(q[3].tag, 'T14'); H.assert.ok(q[1].pic && q[2].pic && q[3].pic, 'boundary and missing items are drawn with a curve');
      H.assert.strictEqual(await page.locator('.card .q .qpic svg.nfig').count(), 3);
      await ctx.close();
      const r = await H.open(H.br); await H.tick(r.page); await H.start(r.page, H.myId, '3'); await H.next(r.page);
      await r.page.evaluate(() => { const S = LE.S(); S.band0 = S.band = 2; S.d.place = { done: true, placed: 2, log: [], asked: 3, band: 2, misses: 0, cleared: 2, maxBand: 4, maxItems: 8 }; S.step = 'predict'; S.hfired = ['h1']; LE.save(); LE.render(); });
      await r.page.clock.setSystemTime(new Date('2026-10-21T' + H.T18 + ':00-04:00')); await H.tick(r.page, 2500);   // 14 minutes in, behind: Build shrinks to 2 (later it is skipped)
      H.assert.deepStrictEqual(await r.page.evaluate(() => LE.S().trim), { build: 2 });
      await r.page.evaluate(() => { LE.S().step = 'build'; LE.save(); LE.render(); }); await H.tick(r.page, 300);
      const ids = await r.page.evaluate(() => window.__q.map(q => q.id + ':' + q.tag));
      H.assert.strictEqual(ids.length, 2, 'Build shrinks to two when the class is behind'); H.assert.ok(ids.every(s => !/T14/.test(s)), 'the missing mean or SD is the part cut: ' + ids);
      H.assert.deepStrictEqual(r.errs, []); await r.ctx.close();
    }],
    ['Check: a number within 0.1 passes, 0.2 off does not; a student who rounds z to 2 decimals is right', async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await page.evaluate(() => { const S = LE.S(); S.band0 = S.band = 2; LE.save(); LE.forceGoto('check'); }); await H.tick(page, 300);
      await page.locator('.card .q').nth(0).locator('button.opt').first().click();   // X1 (any option; this test is about the numbers)
      await typeIn(page, 1, '75.36'); H.assert.ok(await page.evaluate(() => LE.qs('X2').ok), '70 + 8 * 0.67 = 75.36 passes (the exact value is 75.4)');
      await typeIn(page, 2, '59.5'); H.assert.ok(!(await page.evaluate(() => LE.qs('X3').done)), '59.5 is 0.2 from 59.7: not accepted'); H.assert.strictEqual(await page.evaluate(() => LE.qs('X3').misses), 1);
      await typeIn(page, 2, '59.6'); H.assert.ok(await page.evaluate(() => LE.qs('X3').ok), '59.6 is within 0.1 of 59.7');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Concepts: a Calculator tab (invNorm and normalcdf) and a Table backward tutorial, in front of the kit tabs', async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await page.getByRole('button', { name: 'Concepts' }).click();
      H.assert.deepStrictEqual(await page.locator('.cp-tab').allInnerTexts(), ['Concepts', 'Calculator', 'Table backward', 'z-table', 'Routine', 'Example']);
      await page.locator('.cp-tab', { hasText: 'Calculator' }).click();
      const out = page.locator('.nk-calc .nk-readout'); H.assert.ok((await out.nth(0).innerText()).includes('invNorm(0.9, 30, 6) = 37.69'));
      H.assert.ok((await out.nth(1).innerText()).includes('Area to the left = 0.8997'), 'z = 1.28 gives the percentile');
      await page.getByLabel('Area to the left').fill('0.05'); await page.getByLabel('Mean').first().fill('30'); H.assert.ok((await out.nth(0).innerText()).includes('= 20.13'));
      await page.getByLabel('Area to the left').fill('1.5'); H.assert.ok((await out.nth(0).innerText()).includes('between 0 and 1'));
      await page.getByLabel('Value or z').fill('37.69'); await page.getByLabel('Mean').nth(1).fill('30'); await page.getByLabel('SD').nth(1).fill('6'); H.assert.ok((await out.nth(1).innerText()).includes('Area to the left = 0.9000'));
      await page.locator('.cp-tab', { hasText: 'Table backward' }).click(); H.assert.ok((await page.locator('.nk-steps').innerText()).includes('1.28'));
      H.assert.ok(await page.locator('.cp-panel .nk-zt-table').count() >= 1, 'the table is under the steps');
      await page.keyboard.press('Escape'); await page.evaluate(() => LE.forceGoto('models')); await H.tick(page, 300);
      H.assert.ok((await page.locator('.card').innerText()).includes('Open Concepts, then Calculator'));
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Board page: Forward fills the four blanks, then walks model M1; the curve is static; Back undoes', async H => {
      const ctx = await H.br.newContext({ viewport: { width: 1366, height: 768 } }), page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(e.message));
      await page.goto(BASE + '/stats/unit-3-normal-distribution/3-6-boundary-values-board.html'); await page.waitForTimeout(300);
      H.assert.strictEqual(await page.locator('#fig svg.nfig').count(), 1); H.assert.strictEqual(await page.locator('#fig [tabindex]').count(), 0, 'not interactive');
      H.assert.strictEqual(await page.locator('.bd-blank.on').count(), 0);
      await page.click('#fw'); H.assert.strictEqual(await page.locator('.bd-blank.on').count(), 1);
      await page.click('#bk'); H.assert.strictEqual(await page.locator('.bd-blank.on').count(), 0);
      for (let i = 0; i < 4; i++) await page.click('#fw'); H.assert.strictEqual(await page.locator('.bd-blank.on').count(), 4, 'all four blanks of the three definitions');
      const bare = await page.locator('#fig').innerHTML(); H.assert.ok(!/#cfe0ff/.test(bare), 'the curve is bare until the worked example');
      await page.click('#fw'); H.assert.ok(/#cfe0ff/.test(await page.locator('#fig').innerHTML()), 'move 1: shaded'); H.assert.ok(!/%<\/text>/.test(await page.locator('#fig').innerHTML()), 'move 1: no percent yet');
      await page.click('#fw'); H.assert.ok(/90%<\/text>/.test(await page.locator('#fig').innerHTML()), 'move 2: the area is labeled');
      await page.click('#fw'); H.assert.ok(/37\.7/.test(await page.locator('#fig').innerHTML()), 'move 3: the boundary is labeled');
      await page.click('#fw'); await page.click('#fw'); H.assert.ok((await page.locator('#items').innerText()).includes('About 90% of deliveries take less than 37.7 minutes.'));
      H.assert.strictEqual(await page.locator('#fw').isDisabled(), true);
      await page.click('#bk'); H.assert.ok(!(await page.locator('#items').innerText()).includes('About 90% of deliveries take less than 37.7 minutes.'));
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Practice items carry a drawn curve; the fixed order of options and the figure never show the answer', async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await page.evaluate(() => { const S = LE.S(); S.band0 = S.band = 1; LE.save(); LE.forceGoto('practice'); }); await H.tick(page, 300);
      for (let k = 0; k < 6; k++) {
        const info = await page.evaluate(() => { const q = window.__q[0]; return { tag: q.tag, title: q.head, figure: q.figure && q.figure.boundary, pic: q.pic || '', ans: q.answer }; });
        if (info.figure === '?') H.assert.ok(!new RegExp('>' + info.ans + '<').test(info.pic), 'the picture of an unknown boundary does not print it: ' + info.ans);
        await solve(page, false); await H.tick(page, 300); await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400);
      }
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Student-facing text: no tier words on any tab or in the notes', async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await page.evaluate(() => { const S = LE.S(); S.band0 = S.band = 2; LE.save(); });
      const texts = [];
      for (const id of ['warmup', 'predict', 'explore', 'huddle', 'models', 'build', 'check']) { await page.evaluate(i => LE.forceGoto(i), id); await H.tick(page, 300); texts.push(await page.locator('#stage').innerText()); }
      await page.locator('#btn-notes').click(); await H.tick(page, 300); texts.push(await page.locator('#notes-print-root, #stage').first().innerText());
      const bad = /extension|challenge|optional|\bstars?\b|★|\brigor\b/i; texts.forEach(t => H.assert.ok(!bad.test(t), (t.match(bad) || [])[0]));
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }]
  ]
};
