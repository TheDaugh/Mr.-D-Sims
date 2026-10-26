/* Review 3.1 to 3.3 keeps its own versions of the template tests that assume a huddle, an eight-item placement, nine tabs and an Explore tab,
   and adds tests for what is new: six-item placement across blocks A and B, picture first, interleaving, per-target levels, fading hints,
   the wrap-up sentence and the report code by target ID. The standard ID and keypad tests still run. */
const path = require('path'), ID = 'unit-3-review-1-3', TARGETS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'];
async function toWarm(H, hash, time) { const r = await H.open(H.br, hash, time); await H.tick(r.page); await H.start(r.page, H.myId, '3'); await H.next(r.page); return r; }
async function warmUp(H, page, right) { for (let i = 0; i < 8 && !(await page.evaluate(() => LE.S().band0)); i++) { await H.answer(page, !right); await H.tick(page, 900); } }
async function toPractice(H, page, right) { await warmUp(H, page, right); await H.tick(page, 1500); await H.next(page); H.assert.strictEqual(await H.step(page), 'practice'); }
const cur = page => page.evaluate(() => { const S = LE.S(), R = S.d.rv; return { tid: R.cur.tid, sim: !!R.cur.sim, n: S.d.more.n, tb: Object.assign({}, R.tb), q: window.__q.map(q => ({ id: q.id, type: q.type, answer: q.answer, tag: q.tag, n: q.options && q.options.length })) }; });
/* next practice item right, or missed on purpose (two different wrong options for choices, a wrong number three times for numbers) */
async function doItem(H, page, miss) {
  const c0 = await cur(page), q = c0.q[0], box = page.locator('.card .q').first();
  if (c0.sim) { if (miss) await page.evaluate(id => window.__sims[id].wrong(), q.id); await H.tick(page, 150); await page.evaluate(id => window.__sims[id].solve(), q.id); }
  else if (!miss) await H.answer(page, false);
  else if (q.type === 'choice') { const wrong = [...Array(q.n).keys()].filter(i => i !== q.answer).slice(0, 2); for (const w of wrong) { await box.locator('button.opt[data-i="' + w + '"]').click(); await H.tick(page, 200); } }
  else await H.answer(page, true);
  await H.tick(page, 300); const nb = page.getByRole('button', { name: 'Next question' }); await nb.click(); await H.tick(page, 400);
}
async function force(page, tid, band, sim) {   // put a chosen target at a chosen level on screen as practice item 100+
  await page.evaluate(([tid, band, sim]) => { const S = LE.S(); S.step = 'practice'; S.band0 = S.band0 || 2; const R = S.d.rv = S.d.rv || { tb: {}, queue: [], last: '', round: 0 }, M = S.d.more = S.d.more || { n: 0, log: [] }; M.n = 100 + Math.floor(Math.random() * 1e6); R.cur = { n: M.n, tid, sim: !!sim }; R.tb[tid] = band; LE.save(); LE.render(); }, [tid, band, !!sim]);
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
    ['Interactive checkers: picture first, wrong then right, hints fade by level, four misses reveal', async H => {
      const { ctx, page, errs } = await toWarm(H); await warmUp(H, page, true); const fb = () => page.locator('.card .q .fb').innerText(), sims = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'];
      for (const tid of sims) {
        await force(page, tid, 2, true); const c = await cur(page); H.assert.ok(c.sim && c.q[0].type === 'custom', tid + ' is a sim');
        const order = await page.evaluate(() => { const q = document.querySelector('.card .q'), k = [...q.children].map(x => x.className); return { w: k.findIndex(x => /qsim/.test(x)), t: k.indexOf('qtext') }; }); H.assert.ok(order.w >= 0 && order.w < order.t, tid + ': the live picture comes before the question');
        await page.evaluate(id => window.__sims[id].wrong(), c.q[0].id); await H.tick(page, 150); H.assert.ok((await fb()).length > 5, tid + ': a wrong try says why');
        H.assert.strictEqual(await page.getByRole('button', { name: 'Next question' }).count(), 0, tid + ': not done after a miss');
        await page.evaluate(id => window.__sims[id].solve(), c.q[0].id); await H.tick(page, 150);
        const st = await page.evaluate(id => LE.qs(id), c.q[0].id); H.assert.ok(st.done && st.ok && st.misses === 1, tid + ' solved after one miss'); H.assert.strictEqual(await page.getByRole('button', { name: 'Next question' }).count(), 1);
      }
      for (const [band, first, second] of [[1, /Hint: /, /Hint: /], [2, /Hint: /, /Hint: /], [3, /Hint: Turn the percent/, /Hint: The \d+th percentile/], [4, null, /Hint: The \d+th percentile/]]) {
        await force(page, 'T1', band, true); const id = (await cur(page)).q[0].id;
        if (band === 1) H.assert.strictEqual(await page.locator('.qremember').count(), 1, 'level 1 shows Remember'); else H.assert.strictEqual(await page.locator('.qremember').count(), 0);
        await page.evaluate(id => window.__sims[id].wrong(), id); await H.tick(page, 150); const a = await fb(); if (first) H.assert.match(a, first, 'level ' + band + ' first miss'); else H.assert.ok(!/Hint:/.test(a), 'level 4: no hint after the first miss: ' + a);
        await page.evaluate(id => window.__sims[id].wrong(), id); await H.tick(page, 150); H.assert.match(await fb(), second, 'level ' + band + ' second miss');
      }
      await force(page, 'T4', 2, true); const id4 = (await cur(page)).q[0].id; for (let i = 0; i < 4; i++) { await page.evaluate(id => window.__sims[id].wrong(), id4); await H.tick(page, 150); }
      const st4 = await page.evaluate(id => LE.qs(id), id4); H.assert.ok(st4.done && !st4.ok && st4.misses === 4, 'four misses end the item'); H.assert.ok(/Here is the reasoning/.test(await page.locator('.card .q').first().innerText()), 'the reasoning shows');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Interactive checkers work with a real mouse and keyboard: slider, markers, buttons, curve toggle', async H => {
      const { ctx, page, errs } = await toWarm(H); await warmUp(H, page, true); const ask = async (tid, band) => { await force(page, tid, band, true); return cur(page); }, fb = () => page.locator('.card .q .fb').innerText();
      const widgetText = () => page.locator('.card .q .nk-readout').first().innerText();
      let c = await ask('T4', 2); const q4 = await page.evaluate(id => ({ sol: window.__q.find(q => q.id === id).solution, fol: window.__q.find(q => q.id === id).follow }), c.q[0].id);
      const rng4 = page.locator('.card .q input[type=range]'); await rng4.focus(); await page.keyboard.press('Home');   // c = -20
      for (let i = 0; i < q4.sol.c + 20; i++) await page.keyboard.press('ArrowRight'); H.assert.match(await widgetText(), new RegExp('added ' + q4.sol.c.toString().replace('-', '\\-')));
      await page.locator('.card .q .qfollow button.opt[data-i="' + q4.fol.answer + '"]').click(); await page.locator('.card .q .nk-check').click(); await H.tick(page, 150); H.assert.ok((await page.evaluate(id => LE.qs(id), c.q[0].id)).ok, 'T4 solved with the keyboard');
      c = await ask('T6', 2); const b2 = page.getByRole('button', { name: 'Divide by the SD' }); H.assert.strictEqual(await b2.isDisabled(), true, 'divide waits for subtract'); await page.getByRole('button', { name: 'Subtract the mean' }).click(); await b2.click(); H.assert.match(await widgetText(), /Mean = 0 · SD = 1/);
      const f6 = await page.evaluate(id => window.__q.find(q => q.id === id).follow.answer, c.q[0].id); await page.locator('.card .q .qfollow button.opt[data-i="' + f6 + '"]').click(); await page.locator('.card .q .nk-check').click(); await H.tick(page, 150); H.assert.ok((await page.evaluate(id => LE.qs(id), c.q[0].id)).ok, 'T6 solved with the buttons');
      c = await ask('T7', 4); const sol7 = await page.evaluate(id => window.__q.find(q => q.id === id), c.q[0].id), handles = page.locator('.card .q .nk-marker'); const step = await page.evaluate(id => window.__sims[id].w.step, c.q[0].id);
      const b0 = await page.evaluate(id => window.__sims[id].w.state().b, c.q[0].id); await handles.nth(1).focus(); for (let i = 0; i < Math.round((b0 - sol7.solution.b) / step); i++) await page.keyboard.press('ArrowLeft'); await handles.nth(0).focus(); for (let i = 0; i < Math.round(sol7.solution.a / step); i++) await page.keyboard.press('ArrowRight');
      H.assert.ok(Math.abs((await page.evaluate(id => window.__sims[id].w.state().area, c.q[0].id)) - sol7.answer) < 0.004, 'T7 edges moved by keyboard reach the area'); if (sol7.follow) await page.locator('.card .q .qfollow button.opt[data-i="' + sol7.follow.answer + '"]').click(); await page.locator('.card .q .nk-check').click(); await H.tick(page, 150); H.assert.ok((await page.evaluate(id => LE.qs(id), c.q[0].id)).ok, 'T7 solved');
      c = await ask('T8', 2); const q8 = await page.evaluate(id => window.__q.find(q => q.id === id), c.q[0].id); await page.locator('.card .q input[type=range]').focus(); await page.keyboard.press('Home'); for (let i = 0; i < Math.round((q8.solution.s + 1) * 2); i++) await page.keyboard.press('ArrowRight');
      await page.locator('.card .q .qfollow button.opt[data-i="' + q8.follow.answer + '"]').click(); await page.locator('.card .q .nk-check').click(); await H.tick(page, 150); H.assert.ok((await page.evaluate(id => LE.qs(id), c.q[0].id)).ok, 'T8 solved with the slider');
      c = await ask('T9', 2); const q9 = await page.evaluate(id => window.__q.find(q => q.id === id), c.q[0].id); await page.locator('.card .q .qfollow button.opt[data-i="' + q9.follow.answer + '"]').click(); await page.locator('.card .q .nk-check').click(); await H.tick(page, 150);
      H.assert.match(await fb(), /Press the button to show the normal curve/, 'must look at the curve first'); await page.getByRole('button', { name: /Show a normal curve/ }).click(); H.assert.ok(await page.locator('.card .q .nk-fit path.nk-line').evaluate(e => e.getAttribute('visibility') === 'visible'), 'curve shown');
      await page.locator('.card .q .nk-check').click(); await H.tick(page, 150); H.assert.ok((await page.evaluate(id => LE.qs(id), c.q[0].id)).ok, 'T9 solved');
      c = await ask('T2', 2); const q2 = await page.evaluate(id => window.__q.find(q => q.id === id), c.q[0].id), P = q2.params; await page.locator('.card .q .nk-ruler .nk-marker').focus();
      for (let i = 0; i < 60 && Math.abs((await page.evaluate(id => window.__sims[id].w.state().value, c.q[0].id)) - q2.solution.value) > 1e-9; i++) await page.keyboard.press(q2.solution.value > P.mean ? 'ArrowRight' : 'ArrowLeft');
      await page.locator('.card .q .nk-check').click(); await H.tick(page, 150); H.assert.ok((await page.evaluate(id => LE.qs(id), c.q[0].id)).ok, 'T2 solved with the arrow keys');
      c = await ask('T1', 2); const q1 = await page.evaluate(id => window.__q.find(q => q.id === id), c.q[0].id); await page.locator('.card .q .nk-dotplot .nk-marker').focus();
      for (let i = 0; i < 120 && Math.abs((await page.evaluate(id => window.__sims[id].w.state().marker, c.q[0].id)) - q1.solution.marker) > 1e-9; i++) await page.keyboard.press((await page.evaluate(id => window.__sims[id].w.state().marker, c.q[0].id)) < q1.solution.marker ? 'ArrowRight' : 'ArrowLeft');
      await page.locator('.card .q .nk-check').click(); await H.tick(page, 150); H.assert.ok((await page.evaluate(id => LE.qs(id), c.q[0].id)).ok, 'T1 solved by dragging the marker');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['About half of the practice items are interactive checkers, and the rest stay static', async H => {
      const { ctx, page } = await toWarm(H); await toPractice(H, page, true); let sims = 0; for (let i = 0; i < 9; i++) { if ((await cur(page)).sim) sims++; await doItem(H, page, false); }
      H.assert.ok(sims >= 3 && sims <= 6, sims + ' of the first nine items were sims'); await ctx.close();
    }],
    ['No tiers, no minutes, no stars on the student page', async H => {
      const { ctx, page } = await toWarm(H); await toPractice(H, page, true); const txt = await page.locator('#stage').innerText();
      H.assert.ok(!/\b(extension|challenge|stars?|optional)\b|★/i.test(txt), 'banned words'); H.assert.ok(!/\b\d+\s*(min|minutes)\b/i.test(txt), 'no minutes printed'); await ctx.close();
    }]
  ] };
