/* Slot 4 keeps its own versions of the tests for the steps it changed: the Vectors and Proportions Check (instead of the 8-item placement),
   the huddle with its formative gate, and the full run through Build with the report code. The standard ID, pace-trim and keypad tests still run. */
const fs = require('fs');
const BANNED = /\b(extension|challenge|stars?|optional)\b|★/i, MINUTES = /\b\d+\s*(min|minutes)\b/i;
async function toWarm(H, hash, time) { const r = await H.open(H.br, hash, time); await H.tick(r.page); await H.start(r.page, H.myId, '3'); await H.next(r.page); return r; }
/* answer the six check items: bits[i] = 1 answers item i right, 0 wrong (the page marks one try each) */
async function warm(H, page, bits) {
  for (let i = 0; i < 6; i++) { const q = await page.evaluate(i => { const q = window.__q[i]; return { id: q.id, type: q.type, answer: q.answer, wrongI: q.type === 'choice' ? q.options.map((_, k) => k).filter(k => k !== q.answer)[0] : null }; }, i);
    const box = page.locator('.card .q').nth(i);
    if (q.type === 'num') { await box.locator('input[type=text]').first().fill(String(bits[i] ? q.answer : q.answer + 7.5)); await box.getByRole('button', { name: 'Check', exact: true }).click(); }
    else await box.locator('button.opt[data-i="' + (bits[i] ? q.answer : q.wrongI) + '"]').first().click();
    await H.tick(page, 500); }
}
async function visibleText(page) { return page.locator('#stage').innerText(); }

module.exports = {
  tests: {
    'Placement: all right climbs to band 4; misses stop at band 1': async H => {
      let r = await toWarm(H, '', undefined); await warm(H, r.page, [1, 1, 1, 1, 1, 1]); await H.tick(r.page, 800);
      let S = await r.page.evaluate(() => ({ b: LE.S().band0, v: LE.S().d.vp })); H.assert.strictEqual(S.b, 3, 'six right starts at band 3'); H.assert.ok(S.v.fluent && !S.v.scaffold, 'fluent, no scaffold'); await r.ctx.close();
      r = await toWarm(H); await warm(H, r.page, [0, 0, 0, 0, 0, 0]); await H.tick(r.page, 800);
      S = await r.page.evaluate(() => ({ b: LE.S().band0, v: LE.S().d.vp })); H.assert.strictEqual(S.b, 1, 'none right starts at band 1'); H.assert.ok(S.v.scaffold && !S.v.fluent, 'arrow table first'); await r.ctx.close();
      r = await toWarm(H); await warm(H, r.page, [1, 1, 0, 1, 1, 1]); await H.tick(r.page, 800);
      S = await r.page.evaluate(() => ({ b: LE.S().band0, v: LE.S().d.vp })); H.assert.strictEqual(S.b, 3); H.assert.ok(S.v.scaffold, 'one direction miss puts the arrow table first even for a high start'); H.assert.ok(!S.v.fluent); await r.ctx.close();
      r = await toWarm(H); await warm(H, r.page, [0, 1, 0, 1, 0, 1]); await H.tick(r.page, 800);
      S = await r.page.evaluate(() => LE.S().band0); H.assert.strictEqual(S, 2, 'three right starts at band 2'); await r.ctx.close();
    },
    'Timed huddle: at minute 18 the clock pulls the class in, blanks can be written, Continue returns': async H => {
      const { ctx, page, errs } = await toWarm(H); await warm(H, page, [1, 1, 1, 1, 1, 1]); await H.tick(page, 800); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'predict');
      await page.clock.setSystemTime(new Date('2026-10-21T' + H.T18 + ':00-04:00')); await H.tick(page, 2500);
      H.assert.strictEqual(await H.step(page), 'huddle', 'the clock pulls everyone in');
      H.assert.strictEqual(await page.locator('.hd-line input').count(), 0, 'blanks wait for the check-in');
      H.assert.strictEqual(await page.locator('#btn-next').isDisabled(), true, 'cannot leave before the check-in and the code');
      // check-in: first diagram wrong, others right -> code M?? with C for the rest
      await page.evaluate(() => { window.__q = window.__q.filter(q => /^G\d$/.test(q.id)); });
      for (let i = 0; i < 3; i++) { const q = await page.evaluate(i => ({ a: window.__q[i].answer, w: window.__q[i].options.map((_, k) => k).filter(k => k !== window.__q[i].answer)[0] }), i);
        await page.locator('.card .q').nth(i).locator('button.opt[data-i="' + (i === 0 ? q.w : q.a) + '"]').first().click(); await H.tick(page, 500); }
      const code = (await page.locator('.stamp').first().innerText()).trim(); H.assert.match(code, /^[CMXS]{3}$/); H.assert.ok(code[0] !== 'C' && code[1] === 'C' && code[2] === 'C', 'code ' + code);
      const blanks = await page.evaluate(() => { const sp = window.SPECS['fbd-net-force'], out = []; sp.huddle.defs.forEach(d => MrD.huddle.parse(d.text).forEach(p => p.b && out.push(p.b))); return out; });
      await page.locator('.hd-line input').first().fill(blanks[0]); await page.locator('.hd-line input').nth(1).fill(blanks[1]); await page.getByRole('button', { name: 'Check mine' }).click();
      H.assert.ok(await page.locator('.hd-line input.ok').count() >= 2);
      H.assert.strictEqual(await page.locator('#btn-next').isDisabled(), true, 'the huddle code still closes the tab');
      await page.fill('input[aria-label="Huddle code"]', await page.evaluate(() => LE.codeFor('fbd-net-force', 'h1'))); await page.getByRole('button', { name: 'Enter code' }).click(); await H.tick(page, 500);
      H.assert.strictEqual(await page.locator('#btn-next').isDisabled(), false); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'predict', 'returns to where the student was');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    },
    '#key: every tab open, huddle needs no code, answers marked, Concepts button works': async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      H.assert.ok(await page.locator('.mrd-tb').isVisible());
      H.assert.strictEqual(await page.locator('#steps button:not([disabled])').count(), 9);
      await page.locator('#steps button', { hasText: 'Huddle' }).click(); await H.tick(page, 300);
      H.assert.ok(await page.locator('.hd-line input.keyed').count() >= 8, 'huddle answers shown');
      H.assert.ok(await page.locator('.q .opt.keyans').count() >= 3, 'gate answers outlined');
      await page.getByRole('button', { name: 'Concepts' }).click(); H.assert.ok(await page.locator('.cp-panel').isVisible()); await page.keyboard.press('Escape');
      await page.locator('#steps button', { hasText: 'Build' }).click(); await H.tick(page, 300); H.assert.strictEqual(await page.locator('.card .q').count(), 12, 'twelve Build items when nobody is trimming');
      await page.locator('#steps button', { hasText: 'Explore' }).click(); await H.tick(page, 300); H.assert.ok(await page.locator('table.data td', { hasText: 'The Earth' }).count() >= 1, 'catalog answers shown in key');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    },
    'Full run to the stamp after the end mark, no name anywhere': async H => {
      const { ctx, page, errs } = await toWarm(H); const seen = [];
      await warm(H, page, [1, 0, 1, 0, 1, 1]); await H.tick(page, 800); seen.push(await visibleText(page)); await H.next(page);                     // direction miss: scaffold + band 3
      await H.answer(page, false); seen.push(await visibleText(page)); await H.next(page);                                                      // predict
      H.assert.strictEqual(await H.step(page), 'explore');       for (const b of await page.locator('.card .row button.btn').all()) await b.click();
      H.assert.ok(await page.locator('svg text', { hasText: /^W$/ }).count() >= 1, 'arrows appear'); H.assert.ok(await page.locator('table.data td', { hasText: 'The Earth' }).count() >= 1, 'catalog row fills');
      await H.answer(page, false); seen.push(await visibleText(page)); await H.next(page);
      await page.evaluate(() => { const S = LE.S(); S.hfired = ['h1']; LE.save(); }); await page.clock.setSystemTime(new Date('2026-10-21T' + H.T25 + ':00-04:00')); await H.tick(page, 2500);
      H.assert.strictEqual(await H.step(page), 'huddle'); await H.answer(page, false); await H.tick(page, 600);
      await page.fill('input[aria-label="Huddle code"]', await page.evaluate(() => LE.codeFor('fbd-net-force', 'h1'))); await page.getByRole('button', { name: 'Enter code' }).click(); await H.tick(page, 500); seen.push(await visibleText(page)); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'build');
      await H.answer(page, false); await H.tick(page, 600); seen.push(await visibleText(page));
      const nq = await page.evaluate(() => window.__q.length), full = await page.evaluate(() => LE.items('build', 12)); H.assert.strictEqual(nq, 3 + (full >= 12 ? 12 : 6), 'arrow table (3) + the Build items the pace plan allows (this run is behind, so six)'); H.assert.strictEqual(full, 6, 'a class that is far behind gets the compact six'); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'practice');
      for (let k = 0; k < 4; k++) { await H.answer(page, false); await H.tick(page, 400); if (k < 3) { await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400); } }
      seen.push(await visibleText(page)); await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'check'); await H.answer(page, false); await H.tick(page, 500); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'notes'); await page.clock.setSystemTime(new Date('2026-10-21T' + H.T44 + ':00-04:00')); await H.tick(page, 2500);
      const text = await visibleText(page); seen.push(text);
      H.assert.ok(/FBD-\d{4}/.test(text), 'stamp shown'); H.assert.ok(text.includes(H.myId), 'ID shown'); H.assert.ok(!/Name:/.test(text), 'no name label');
      const code = (await page.locator('.longcode').innerText()).trim(), dec = await page.evaluate(c => LE.decodeReport('fbd-net-force', c), code);
      H.assert.ok(dec && dec.ok && dec.fields.length === 16, 'report decodes'); H.assert.strictEqual(dec.fields[0], 'v2'); H.assert.strictEqual(dec.fields[12].length, 6, 'six warm-up bits'); H.assert.match(dec.fields[13], /^[CMXS]{3}$/); H.assert.ok(dec.fields[14].split(';').length >= (nq - 3) + 4, 'a log entry per Build and Practice question'); H.assert.ok(/scaf/.test(dec.fields[15]), 'scaffold flag');
      const rec = await page.evaluate(() => MrD.profile.all().filter(r => r.lesson === 'fbd-net-force').pop()); H.assert.ok(rec && rec.items.length >= 20, 'profile record saved'); H.assert.ok(rec.items.some(x => x.skill === 'fbd') && rec.items.some(x => x.skill === 'net'));
      const bad = seen.filter(t => BANNED.test(t) || MINUTES.test(t)); H.assert.deepStrictEqual(bad.map(t => (t.match(BANNED) || t.match(MINUTES))[0]), [], 'student pages carry no tier words or minutes');
      const tex = await page.evaluate(() => LE.buildTex()); H.assert.ok(/Build problems/.test(tex) && /force catalog/i.test(tex));
      fs.writeFileSync('/tmp/fbd-notes.tex', tex); fs.writeFileSync('/tmp/fbd-report.txt', code);
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }
  },
  extra: [
    ['Report decode: the portal reads the slot 4 report code and every skill maps to a strand', async H => {
      const code = fs.readFileSync('/tmp/fbd-report.txt', 'utf8').trim();
      const ctx = await H.br.newContext(), page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(e.message)); await page.route(/fonts\./, r => r.abort());
      await page.goto((process.env.BASE || 'http://localhost:8123') + '/portal/index.html'); await page.waitForTimeout(500);
      const out = await page.evaluate(async c => { const r = PortalAdapters.physicsReport(c, LE, NFL, window.N2L), std = await (await fetch('standards.json')).json();
        return { r, unmapped: r ? [...new Set(r.items.map(x => x.skill))].filter(k => !std.skills['physics/fbd-net-force/' + k]) : null }; }, code);
      H.assert.ok(out.r, 'adapter returned a record'); H.assert.strictEqual(out.r.lesson, 'fbd-net-force'); H.assert.ok(out.r.items.length >= 20, 'items ' + out.r.items.length); H.assert.deepStrictEqual(out.unmapped, [], 'every skill maps to a strand');
      H.assert.ok(/scaf/.test(out.r.flags)); H.assert.ok(out.r.items.some(x => x.skill === 'vp-dir') && out.r.items.some(x => x.skill === 'gate-fbd') && out.r.items.some(x => x.skill === 'fbd'));
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Projector page: six situations, reveal, tallies, class split, codes, errors to warm-up, vocabulary and core ideas', async H => {
      const ctx = await H.br.newContext({ viewport: { width: 1366, height: 768 } }), page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(e.message)); await page.route(/fonts\./, r => r.abort());
      await page.goto((process.env.BASE || 'http://localhost:8123') + '/physics/lessons/fbd-net-force-projector.html'); await page.waitForTimeout(300);
      H.assert.strictEqual(await page.locator('.pj-card').count(), 6);
      await page.locator('.pj-card').nth(1).getByRole('button', { name: 'Show diagram' }).click(); H.assert.ok(await page.locator('.pj-card').nth(1).locator('svg').count() === 1);
      await page.locator('.pj-card').nth(1).locator('.tally button').nth(2).click();   // one student added a force of motion
      await page.getByRole('button', { name: 'Class split' }).click(); await page.fill('#codes', 'CCS\nXCC\nbad'); await page.getByRole('button', { name: 'Add these codes' }).click();
      H.assert.match(await page.locator('#codemsg').innerText(), /2 codes added.*1 not readable/);
      const verdict = await page.locator('#verdict').innerText(); H.assert.match(verdict, /Biggest split: situation 1/); H.assert.match(verdict, /extra force/);
      await page.getByRole('button', { name: 'Common errors' }).click(); await page.locator('.err input').first().check(); H.assert.ok((await page.locator('#warm').innerText()).includes('Draw the forces on'));
      await page.getByRole('button', { name: 'Vocabulary' }).click(); H.assert.ok((await page.locator('#p-vocab').innerText()).includes('Free-body diagram')); await page.getByRole('button', { name: 'Core ideas' }).click(); H.assert.ok((await page.locator('#p-core').innerText()).includes('Net force'));
      await page.screenshot({ path: '/tmp/fbd-projector-core.png' });
      await page.getByRole('button', { name: 'Six situations' }).click(); await page.screenshot({ path: '/tmp/fbd-projector.png' });
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }]
  ]
};
