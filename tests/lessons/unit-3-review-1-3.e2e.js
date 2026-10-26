/* Review 3.1 to 3.3 keeps its own versions of the template tests that assume a huddle, an eight-item placement, nine tabs and an Explore tab,
   and adds tests for what is new: six-item placement across blocks A and B, picture first, interleaving, per-target levels, fading hints,
   the wrap-up sentence and the report code by target ID. The standard ID and keypad tests still run. */
const path = require('path'), ID = 'unit-3-review-1-3', TARGETS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'];
async function toWarm(H, hash, time) { const r = await H.open(H.br, hash, time); await H.tick(r.page); await H.start(r.page, H.myId, '3'); await H.next(r.page); return r; }
async function warmUp(H, page, right) { for (let i = 0; i < 8 && !(await page.evaluate(() => LE.S().band0)); i++) { await H.answer(page, !right); await H.tick(page, 900); } }
async function toPractice(H, page, right) { await warmUp(H, page, right); await H.tick(page, 1500); await H.next(page); H.assert.strictEqual(await H.step(page), 'practice'); }
const cur = page => page.evaluate(() => { const S = LE.S(), R = S.d.rv; return { tid: R.cur.tid, n: S.d.more.n, tb: Object.assign({}, R.tb), q: window.__q.map(q => ({ id: q.id, type: q.type, answer: q.answer, tag: q.tag, n: q.options && q.options.length })) }; });
/* next practice item right, or missed on purpose (two different wrong options for choices, a wrong number three times for numbers) */
async function doItem(H, page, miss) {
  const q = (await cur(page)).q[0], box = page.locator('.card .q').first();
  if (!miss) await H.answer(page, false);
  else if (q.type === 'choice') { const wrong = [...Array(q.n).keys()].filter(i => i !== q.answer).slice(0, 2); for (const w of wrong) { await box.locator('button.opt[data-i="' + w + '"]').click(); await H.tick(page, 200); } }
  else await H.answer(page, true);
  await H.tick(page, 300); const nb = page.getByRole('button', { name: 'Next question' }); await nb.click(); await H.tick(page, 400);
}
async function force(page, tid, band) {   // put a chosen target at a chosen level on screen as practice item 100+
  await page.evaluate(([tid, band]) => { const S = LE.S(); S.step = 'practice'; S.band0 = S.band0 || 2; const R = S.d.rv = S.d.rv || { tb: {}, queue: [], last: '', round: 0 }, M = S.d.more = S.d.more || { n: 0, log: [] }; M.n = 100 + Math.floor(Math.random() * 1e6); R.cur = { n: M.n, tid }; R.tb[tid] = band; LE.save(); LE.render(); }, [tid, band]);
}

module.exports = { tests: {
  'Placement: all right climbs to band 4; misses stop at band 1': async H => {
    let r = await toWarm(H); const dom = await r.page.evaluate(() => { const q = document.querySelector('.card .q'), k = [...q.children].map(c => c.className); return { pic: k.indexOf('qpic'), text: k.indexOf('qtext'), rem: !!q.querySelector('.qremember'), svg: !!q.querySelector('.qpic svg') }; });
    H.assert.ok(dom.svg && dom.pic >= 0 && dom.pic < dom.text, 'the picture comes before the question'); H.assert.ok(dom.rem, 'band 1 shows a Remember line');
    await warmUp(H, r.page, true); let S = await r.page.evaluate(() => ({ b: LE.S().band0, asked: LE.S().d.place.asked, log: LE.S().d.try.log.map(x => x.skill) }));
    H.assert.strictEqual(S.b, 4); H.assert.strictEqual(S.asked, 6, 'always six items'); H.assert.deepStrictEqual(S.log, ['T1', 'T2', 'T4', 'T7', 'T8', 'T9'], 'three from block A, three from block B'); H.assert.deepStrictEqual(r.errs, []); await r.ctx.close();
    r = await toWarm(H); await warmUp(H, r.page, false); S = await r.page.evaluate(() => ({ b: LE.S().band0, asked: LE.S().d.place.asked }));
    H.assert.strictEqual(S.b, 1); H.assert.strictEqual(S.asked, 6, 'misses do not cut the six items short'); await r.ctx.close();
  },
  'Timed huddle: at minute 18 the clock pulls the class in, blanks can be written, Continue returns': async H => {
    const r = await toWarm(H); await r.page.clock.setSystemTime(new Date('2026-10-21T' + H.T18 + ':00-04:00')); await H.tick(r.page, 2500);
    H.assert.strictEqual(await H.step(r.page), 'warmup', 'no huddle: the clock never pulls anyone away');
    H.assert.deepStrictEqual((await r.page.locator('#steps button').allInnerTexts()).map(t => t.replace(/ \(skipped\)$/, '')), ['1 Start', '2 Warm-up', '3 Practice', '4 Wrap-up']); H.assert.deepStrictEqual(r.errs, []); await r.ctx.close();
  },
  'Pace trim: far behind skips Explore and shrinks Build; core tabs stay': async H => {
    const { ctx, page, errs } = await toWarm(H); await warmUp(H, page, true);
    await page.evaluate(() => { LE.S().step = 'practice'; LE.save(); LE.render(); }); await page.clock.setSystemTime(new Date('2026-10-21T10:17:00-04:00')); await H.tick(page, 2500);   // 17 minutes in: behind, but enough time left to shrink Practice rather than skip it
    const S = await page.evaluate(() => ({ skip: LE.S().skip || {}, trim: LE.S().trim || {}, items: LE.items('practice', 12) }));
    H.assert.strictEqual(S.items, 8, 'practice shrinks to 8 of 12'); H.assert.ok(!S.skip.warmup && !S.skip.notes, 'warm-up and wrap-up stay'); H.assert.ok(await page.locator('#pacebar').isVisible()); H.assert.deepStrictEqual(errs, []); await ctx.close();
  },
  '#key: every tab open, huddle needs no code, answers marked, Concepts button works': async H => {
    const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
    H.assert.ok(await page.locator('.mrd-tb').isVisible()); H.assert.strictEqual(await page.locator('#steps button:not([disabled])').count(), 4);
    for (const n of ['Warm-up', 'Practice', 'Wrap-up']) { await page.locator('#steps button', { hasText: n }).click(); await H.tick(page, 300); }
    await page.locator('#steps button', { hasText: 'Practice' }).click(); await H.tick(page, 300); H.assert.ok(await page.locator('.qpic svg').count() >= 1, 'picture on a practice item');
    await page.getByRole('button', { name: 'Concepts' }).click(); H.assert.ok(await page.locator('.cp-panel').isVisible()); H.assert.strictEqual(await page.locator('.cp-panel h3').count(), 9); H.assert.strictEqual(await page.locator('.cp-tab').count(), 0, 'no z-table in this review');
    await page.keyboard.press('Escape'); H.assert.deepStrictEqual(errs, []); await ctx.close();
  },
  'Full run to the stamp after the end mark, no name anywhere': async H => {
    const { ctx, page, errs } = await toWarm(H); await toPractice(H, page, true);
    for (let i = 0; i < 12; i++) await doItem(H, page, false);
    H.assert.strictEqual(await page.locator('#btn-next').isDisabled(), false, 'Continue opens after 12 items'); await H.next(page); H.assert.strictEqual(await H.step(page), 'notes');
    H.assert.ok(await page.locator('.card .q textarea').isVisible(), 'the one-sentence question'); H.assert.match(await page.locator('#stage').innerText(), /Keep practicing/, 'practice continues until the end mark');
    await page.locator('.card .q textarea').fill('The curve area idea still feels shaky.'); await page.getByRole('button', { name: 'Lock it in' }).click(); await H.tick(page, 400);
    await page.clock.setSystemTime(new Date('2026-10-21T' + H.T44 + ':00-04:00')); await H.tick(page, 2500);
    const text = await page.locator('#stage').innerText(); H.assert.ok(/\bRV3-\d{3,}/.test(text), 'stamp shown'); H.assert.ok(text.includes(H.myId), 'ID shown'); H.assert.ok(!/Name:/.test(text), 'no name label');
    const code = (await page.locator('.longcode').innerText()).trim(), dec = await page.evaluate(([id, c]) => LE.decodeReport(id, c), [ID, code]);
    H.assert.ok(dec.ok, 'checksum'); H.assert.strictEqual(dec.fields[0], 'v1'); H.assert.strictEqual(dec.fields[1], H.myId); H.assert.strictEqual(dec.fields[10], '12-12'); H.assert.strictEqual(dec.fields[13], 'curve_area');
    H.assert.match(dec.fields[12], /^T\d:\d+\/\d+(,T\d:\d+\/\d+)*$/, 'skills by target ID'); H.assert.deepStrictEqual(dec.fields[12].split(',').map(x => x.split(':')[0]), TARGETS, 'every target appears');
    H.assert.strictEqual(dec.fields[12].split(',').reduce((a, x) => a + +x.split('/')[1], 0), 18, '6 warm-up + 12 practice items');
    await page.addScriptTag({ path: path.join(__dirname, '../../portal/adapters.js') });
    const rec = await page.evaluate(c => PortalAdapters.statsReport(c, LE), code); H.assert.strictEqual(rec.course, 'stats'); H.assert.strictEqual(rec.first, H.myId); H.assert.strictEqual(rec.items.length, 18); H.assert.deepStrictEqual([...new Set(rec.items.map(i => i.skill))], TARGETS); H.assert.ok(rec.items.every(i => i.firstTry), 'all right the first time'); H.assert.match(rec.flags, /curve area/);
    const prof = await page.evaluate(() => MrD.profile.all().filter(r => r.lesson === 'unit-3-review-1-3').pop()); H.assert.ok(prof && prof.course === 'stats' && prof.items.length === 18 && prof.items.every(i => /^T[1-9]$/.test(i.skill)), 'profile record by target ID');
    H.assert.deepStrictEqual(errs, []); await ctx.close();
  } },
  extra: [
    ['Practice interleaves all nine targets, never the same twice in a row; a missed target returns within four items', async H => {
      const { ctx, page, errs } = await toWarm(H); await toPractice(H, page, true); const seq = [];
      for (let i = 0; i < 9; i++) { seq.push((await cur(page)).tid); await doItem(H, page, false); }
      H.assert.deepStrictEqual([...seq].sort(), TARGETS, 'the first nine items cover all nine targets');
      const missed = (await cur(page)).tid; seq.push(missed); await doItem(H, page, true); const next = [];
      for (let i = 0; i < 4; i++) { next.push((await cur(page)).tid); await doItem(H, page, false); }
      H.assert.ok(next.includes(missed), 'missed ' + missed + ' returns in ' + next.join(',')); const all = seq.concat(next); all.forEach((t, i) => i && H.assert.notStrictEqual(t, all[i - 1], 'no repeat at ' + i)); H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Each target keeps its own level: first-try right climbs, two misses drop', async H => {
      const { ctx, page, errs } = await toWarm(H); await warmUp(H, page, false); await H.tick(page, 1500); await H.next(page);
      let c = await cur(page); await doItem(H, page, false); let tb = (await cur(page)).tb; H.assert.strictEqual(tb[c.tid], 2, 'right the first time: level 1 to 2');
      c = await cur(page); await force(page, c.tid, 3); await doItem(H, page, true); tb = (await cur(page)).tb; H.assert.strictEqual(tb[c.tid], 2, 'two misses: level 3 to 2'); H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Hints fade: Remember at level 1, hint after a miss at 2, nudge then hint at 3, hint only after the second miss at 4', async H => {
      const { ctx, page, errs } = await toWarm(H); await warmUp(H, page, true); const fb = () => page.locator('.card .q .fb').innerText(), box = () => page.locator('.card .q').first();
      const wrongNum = async () => { const a = (await cur(page)).q[0].answer; await box().locator('input[type=text]').first().fill(String(a + 123.5)); await box().getByRole('button', { name: 'Check', exact: true }).click(); await H.tick(page, 200); };
      const full = { T2: /Find how far the score is from the mean/, T5: /stretches the SD/ }, nudge = /Subtract the mean first\. Then divide\./;
      await force(page, 'T2', 1); H.assert.ok(await page.locator('.qremember').count() === 1, 'level 1: Remember line'); await wrongNum(); H.assert.match(await fb(), full.T2, 'level 1: full hint');
      await force(page, 'T2', 2); H.assert.strictEqual(await page.locator('.qremember').count(), 0, 'level 2: no Remember line'); await wrongNum(); H.assert.match(await fb(), full.T2, 'level 2: full hint after one miss');
      await force(page, 'T2', 3); await wrongNum(); H.assert.match(await fb(), nudge, 'level 3: a nudge first'); H.assert.ok(!full.T2.test(await fb())); await wrongNum(); H.assert.match(await fb(), full.T2, 'level 3: full hint after the second miss');
      await force(page, 'T5', 4); H.assert.strictEqual((await cur(page)).q[0].type, 'num'); await wrongNum(); H.assert.strictEqual((await fb()).trim(), 'Not quite.', 'level 4: nothing after the first miss'); await wrongNum(); H.assert.match(await fb(), full.T5, 'level 4: hint after the second miss');
      const wrongChoice = async () => { const q = (await cur(page)).q[0], w = [...Array(q.n).keys()].find(i => i !== q.answer); await box().locator('button.opt[data-i="' + w + '"]').click(); await H.tick(page, 200); };
      await force(page, 'T3', 3); await wrongChoice(); H.assert.match(await fb(), /Do not compare the raw scores/, 'choice, level 3: nudge');
      await force(page, 'T3', 4); await wrongChoice(); H.assert.strictEqual((await fb()).trim(), 'Not quite.', 'choice, level 4: no hint'); H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['No tiers, no minutes, no stars on the student page', async H => {
      const { ctx, page } = await toWarm(H); await toPractice(H, page, true); const txt = await page.locator('#stage').innerText();
      H.assert.ok(!/\b(extension|challenge|stars?|optional)\b|★/i.test(txt), 'banned words'); H.assert.ok(!/\b\d+\s*(min|minutes)\b/i.test(txt), 'no minutes printed'); await ctx.close();
    }]
  ] };
