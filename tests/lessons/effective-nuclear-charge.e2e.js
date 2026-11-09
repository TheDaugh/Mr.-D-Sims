/* Per-lesson overrides for Effective Nuclear Charge and Shielding (Unit 3, slot 15). Run with
     python3 -m http.server 8123 &
     TZ=America/New_York TEMPLATE=chem PLAYWRIGHT_DIR=/opt/node-tools/node_modules/playwright PAGE=chemistry/unit-3-atoms-ions/effective-nuclear-charge.html node tests/template.e2e.js
   This lesson is v3 (pacing.clock = 'v3'): huddle 1 at minute 3 is a hold screen, huddle 2 at minute 25 is the writable tab, three warm-up items with no placement,
   nothing is trimmed. So it replaces the standard tests that assume the placement warm-up, the minute-18 huddle, pace trimming and nine tabs, and adds tests
   for the Pull Meter, the Models tab and the banned words. The chem bell for these tests is 10:41, so minute 3 is 10:44 and minute 25 is 11:06. */
const C = require('../../chemistry/unit-3-atoms-ions/day-cards/slot-15.content.js');
const Z = C.Z;
const EARLY = '2026-10-21T10:41:30-04:00', H1 = '2026-10-21T10:44:10-04:00', H2 = '2026-10-21T11:06:10-04:00', LATE = '2026-10-21T11:30:00-04:00';

async function solve(page, H, wrong) {
  for (let guard = 0; guard < 60; guard++) {
    const todo = await page.evaluate(() => window.__q.map((q, i) => ({ i, id: q.id, type: q.type, answer: q.answer, wrongI: q.type === 'choice' ? q.options.map((o, k) => k).filter(k => k !== q.answer)[0] : null, done: !!(LE.qs(q.id) && LE.qs(q.id).done) })).filter(x => !x.done));
    if (!todo.length) return;
    const t = todo[0], box = page.locator('.card .q').nth(t.i);
    if (t.type === 'num') { await box.locator('input[type=text]').first().fill(String(wrong ? t.answer + 123 : t.answer)); await box.getByRole('button', { name: 'Check', exact: true }).click(); }
    else await box.locator('button.opt[data-i="' + (wrong ? t.wrongI : t.answer) + '"]').first().click();
    await H.tick(page, 900);
  }
}
async function walkModel(H, page) {
  for (let g = 0; g < 12; g++) {
    await solve(page, H, false);
    const nm = page.getByRole('button', { name: /^(Move 1|Next move)$/ });
    if (await nm.count()) { await nm.first().click(); await H.tick(page, 500); } else return;
  }
}
const huddleCode = (page, key) => page.evaluate(k => LE.codeFor('effective-nuclear-charge', k), key);
async function enterCode(page, H, key) {
  const code = await huddleCode(page, key);
  await page.locator('input[aria-label^="Huddle"]').fill(code); await page.getByRole('button', { name: 'Enter code' }).click(); await H.tick(page, 500);
}
/* mark the core rings of both atoms on the open Pull Meter run; clicks the invisible hit targets */
async function markCore(page, wrongOuter) {
  const spec = await page.evaluate(() => LE.S().d.pm.cur.spec);
  for (const [fig, z] of [[0, spec.a], [1, spec.b]]) {
    const n = Z.atom(z).n;
    for (let i = 0; i < n - 1; i++) await page.locator('.enc-pair figure').nth(fig).locator('.zr-hit[data-i="' + i + '"]').dispatchEvent('click');
    if (wrongOuter && fig === 0) await page.locator('.enc-pair figure').nth(0).locator('.zr-hit[data-i="' + (n - 1) + '"]').dispatchEvent('click');
  }
  return spec;
}

module.exports = {
  tests: {
    'Placement: all right climbs to band 4; misses stop at band 1': async H => {   // v3: three easy items, no placement; everyone starts at band 1
      const { ctx, page, errs } = await H.open(H.br, '', EARLY); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'warmup');
      H.assert.strictEqual(await page.evaluate(() => window.__q.length), 3, 'three warm-up items');
      H.assert.ok(await page.locator('.card .q svg').count() >= 2, 'W1 and W2 carry the atom picture');
      await solve(page, H, true); await H.tick(page, 900);
      H.assert.strictEqual(await page.evaluate(() => LE.S().band0), 1, 'wrong answers still start at band 1'); H.assert.strictEqual(await page.evaluate(() => LE.S().d.place.done), true);
      H.assert.strictEqual(await page.evaluate(() => LE.S().warm), 0);
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    },
    'Timed huddle: at minute 18 the clock pulls the class in, blanks can be written, Continue returns': async H => {   // v3: minute 3 hold, minute 25 writable
      const { ctx, page, errs } = await H.open(H.br, '', EARLY); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await solve(page, H, false); await H.tick(page, 900); await H.next(page); H.assert.strictEqual(await H.step(page), 'predict');
      await page.clock.setSystemTime(new Date(H1)); await H.tick(page, 2500);
      H.assert.strictEqual(await H.step(page), 'huddle');
      let text = await page.locator('.card').innerText();
      H.assert.ok(text.includes('Huddle 1: eyes up'), 'huddle 1 is the hold screen'); H.assert.strictEqual(await page.locator('.hd-line input').count(), 0, 'nothing to write at huddle 1');
      await page.locator('input[aria-label^="Huddle"]').fill('0000'); await page.getByRole('button', { name: 'Enter code' }).click(); H.assert.ok(await page.locator('.msg.bad').isVisible(), 'a wrong code is refused');
      await enterCode(page, H, 'h1'); H.assert.ok(await page.locator('.msg.ok').count(), 'code accepted');
      await H.next(page); H.assert.strictEqual(await H.step(page), 'predict', 'returns to where the student was');
      await page.clock.setSystemTime(new Date(H1)); await H.tick(page, 2500); H.assert.strictEqual(await H.step(page), 'predict', 'huddle 1 fires once');
      await page.clock.setSystemTime(new Date(H2)); await H.tick(page, 2500);
      H.assert.strictEqual(await H.step(page), 'huddle'); text = await page.locator('.card').innerText();
      H.assert.ok(!text.includes('eyes up'), 'huddle 2 is the writable tab');
      const blanks = await page.evaluate(() => { const sp = window.SPECS['effective-nuclear-charge'], out = []; (sp.huddle.defs || []).forEach(d => MrD.huddle.parse(d.text).forEach(p => p.b && out.push(p.b))); return out; });
      await page.locator('.hd-line input').first().fill(blanks[0]); await page.locator('.hd-line input').nth(1).fill(blanks[1]);
      await page.getByRole('button', { name: 'Check mine' }).click(); H.assert.ok(await page.locator('.hd-line input.ok').count() >= 2);
      H.assert.strictEqual(await page.evaluate(() => window.__q.length), 3, 'three crux questions follow the blanks');
      await solve(page, H, false); await H.tick(page, 600);
      H.assert.strictEqual(await page.evaluate(() => ['K1', 'K2', 'K3'].every(id => LE.qs(id).ok && LE.qs(id).misses === 0)), true);
      await enterCode(page, H, 'h2'); H.assert.notStrictEqual(await huddleCode(page, 'h1'), await huddleCode(page, 'h2'), 'two different codes a day');
      await H.next(page); H.assert.strictEqual(await H.step(page), 'predict');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    },
    'Pace trim: far behind skips Explore and shrinks Build; core tabs stay': async H => {   // v3 never trims or skips
      const { ctx, page, errs } = await H.open(H.br, '', EARLY); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await page.evaluate(() => { const S = LE.S(); S.band0 = S.band = 1; S.d.place = { done: true, placed: 1, log: [], asked: 3, band: 1, misses: 0, cleared: 1, maxBand: 3, maxItems: 3 }; S.step = 'predict'; S.hfired = ['h1', 'h2']; LE.save(); LE.render(); });
      await page.clock.setSystemTime(new Date(LATE)); await H.tick(page, 2500);
      const S = await page.evaluate(() => ({ skip: LE.S().skip, trim: LE.S().trim }));
      H.assert.ok(!S.skip || !Object.keys(S.skip).length, 'nothing skipped'); H.assert.ok(!S.trim || !S.trim.trigger, 'nothing trimmed');
      H.assert.strictEqual(await page.locator('#pacebar').isVisible().catch(() => false), false);
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    },
    'Keypad: the answer box has an on-screen keypad that types into it': async H => {
      const { ctx, page } = await H.open(H.br, '', EARLY); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      H.assert.ok(await page.locator('.mrd-kp').count() >= 1);
      const inp = page.locator('.card .q input[type=text]').first();
      for (const k of ['7', 'decimal point', '5']) await page.locator('.mrd-kp button[aria-label="' + k + '"]').first().click();
      H.assert.strictEqual(await inp.inputValue(), '7.5'); await page.locator('.mrd-kp button[aria-label="delete"]').first().click(); H.assert.strictEqual(await inp.inputValue(), '7.'); await ctx.close();
    },
    '#key: every tab open, huddle needs no code, answers marked, Concepts button works': async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      H.assert.ok(await page.locator('.mrd-tb').isVisible());
      H.assert.strictEqual(await page.locator('#steps button:not([disabled])').count(), 10);
      await page.evaluate(() => { LE.S().hkey = 'h2'; LE.save(); });
      await page.locator('#steps button', { hasText: 'Huddle' }).click(); await H.tick(page, 300);
      H.assert.ok(await page.locator('.hd-line input.keyed').count() >= 5);
      await page.locator('#steps button', { hasText: 'Explore' }).click(); await H.tick(page, 300);
      H.assert.ok((await page.locator('.keyline').first().innerText()).startsWith('KEY:'), 'the Pull Meter shows its key line');
      await page.getByRole('button', { name: 'Concepts' }).click(); H.assert.ok(await page.locator('.cp-panel').isVisible());
      await page.keyboard.press('Escape'); H.assert.ok(!(await page.locator('.cp-panel').isVisible()));
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    },
    'Full run to the stamp after the end mark, no name anywhere': async H => {
      const { ctx, page, errs } = await H.open(H.br, '', EARLY); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await solve(page, H, false); await H.tick(page, 900); await H.next(page);                           // warm-up
      await solve(page, H, false); await H.tick(page, 500); await H.next(page);                           // predict
      await H.next(page);                                                                                 // explore (its own test below)
      await page.evaluate(() => { const S = LE.S(); S.hfired = ['h1', 'h2']; S.huddle = { h1: true, h2: true }; S.d.hud = { 'd0.1': 'sum' }; LE.save(); });
      H.assert.strictEqual(await H.step(page), 'huddle'); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'models');
      for (let m = 0; m < 3; m++) { await walkModel(H, page); if (m < 2) { await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 500); } }
      H.assert.ok(await page.evaluate(() => ENC_UI.modelsDone()), 'all three models done'); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'build'); await solve(page, H, false); await H.tick(page, 600); await H.next(page);
      for (let k = 0; k < 4; k++) { await solve(page, H, false); await H.tick(page, 400); if (k < 3) { await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400); } }
      await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'check'); await solve(page, H, false); await H.tick(page, 500);
      H.assert.strictEqual(await page.evaluate(() => ['X1', 'X2', 'X3'].filter(id => LE.qs(id).ok && LE.qs(id).misses === 0).length), 3); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'notes');
      await page.clock.setSystemTime(new Date(LATE)); await H.tick(page, 2500);
      const text = await page.locator('#stage').innerText();
      H.assert.ok(text.includes('Guided notes are over'), 'the lesson ends by the clock'); H.assert.ok(!/\b[A-Z]{3}-\d{3,}/.test(text), 'no stamp'); H.assert.strictEqual(await page.locator('.longcode').count(), 0, 'no report code'); H.assert.ok(!/Name:/.test(text), 'no name label');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }
  },
  extra: [
    ['Pull Meter: wrong marks get picture feedback, two misses show the answer, the prediction is logged before the meter, the ladder rises on first-try runs', async H => {
      const { ctx, page, errs } = await H.open(H.br, '', EARLY); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await page.evaluate(() => { const S = LE.S(); S.hfired = ['h1', 'h2']; S.huddle = { h1: true, h2: true }; S.d.place = { done: true, placed: 1, log: [], asked: 3, band: 1, misses: 0, cleared: 1, maxBand: 3, maxItems: 3 }; S.band0 = S.band = 1; S.step = 'explore'; LE.save(); LE.render(); });
      await H.tick(page, 400);
      H.assert.ok((await page.locator('.card h3').first().innerText()).startsWith('Run 1'), 'run 1 is open');
      H.assert.strictEqual(await page.locator('.enc-pair figure').count(), 2, 'two atoms drawn');
      H.assert.ok((await page.locator('.enc-guide').innerText()).includes('How to read the pull meter'), 'a reading guide is on the page');
      // wrong marks: the outer ring marked as core
      let spec = await markCore(page, true); await page.getByRole('button', { name: 'Check my rings' }).click(); await H.tick(page, 300);
      H.assert.ok((await page.locator('.msg').first().innerText()).includes('outer ring holds the electron we pull on'), 'named feedback for marking the outer ring');
      // un-mark the outer ring, then the right marks pass
      await page.locator('.enc-pair figure').nth(0).locator('.zr-hit[data-i="' + (Z.atom(spec.a).n - 1) + '"]').dispatchEvent('click');
      await page.getByRole('button', { name: 'Check my rings' }).click(); await H.tick(page, 300);
      H.assert.strictEqual(await page.evaluate(() => LE.S().d.pm.cur.stage), 'predict');
      H.assert.ok((await page.locator('.card table').last().innerText()).includes('Z_eff = Z'), 'the Z_eff table shows after the marks');
      H.assert.strictEqual(await page.locator('.enc-bar').count(), 0, 'the meter is not shown before the prediction');
      const right = spec.answer === 'a' ? spec.a : spec.b;
      await page.getByRole('button', { name: Z.NAME[right], exact: true }).first().click(); await H.tick(page, 300);
      H.assert.strictEqual(await page.evaluate(() => LE.S().d.pm.cur.pred), spec.answer, 'the prediction is logged');
      H.assert.strictEqual(await page.locator('.enc-bar').count(), 2, 'the meter shows two bars');
      H.assert.ok((await page.locator('.msg').first().innerText()).includes('The meter agrees'));
      await page.getByRole('button', { name: 'Next pair' }).click(); await H.tick(page, 400);
      let last = await page.evaluate(() => LE.S().d.pm.runs[0]); H.assert.strictEqual(last.ok, true); H.assert.strictEqual(last.first, false, 'a miss on the marks means the run is not first try');
      // two clean first-try runs climb a band
      for (let k = 0; k < 2; k++) {
        spec = await markCore(page, false); await page.getByRole('button', { name: 'Check my rings' }).click(); await H.tick(page, 300);
        const w = spec.answer === 'a' ? spec.a : spec.b; await page.getByRole('button', { name: Z.NAME[w], exact: true }).first().click(); await H.tick(page, 300);
        await page.getByRole('button', { name: 'Next pair' }).click(); await H.tick(page, 400);
      }
      H.assert.strictEqual(await page.evaluate(() => LE.S().d.pm.lad.band), 2, 'two first-try runs raise the hidden band to 2');
      H.assert.strictEqual(await page.evaluate(() => LE.S().d.pm.runs.length), 3);
      // two misses on the marks reveal the right marks
      await page.getByRole('button', { name: 'Check my rings' }).click(); await H.tick(page, 200); await page.getByRole('button', { name: 'Check my rings' }).click(); await H.tick(page, 300);
      H.assert.strictEqual(await page.evaluate(() => LE.S().d.pm.cur.stage), 'predict'); H.assert.strictEqual(await page.evaluate(() => LE.S().d.pm.cur.shown), true);
      const text = await page.locator('.card').innerText(); H.assert.ok(!/band/i.test(text), 'no band name is shown to the student');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Models: M1 watch, M2 with me, M3 you do; the slip shows after the answer; the core rings are painted only once the core is known', async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      await page.locator('#steps button', { hasText: 'Models' }).click(); await H.tick(page, 300);
      H.assert.strictEqual(await page.locator('.ecm-rail li').count(), 5);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 400);
      for (let i = 0; i < 4; i++) { await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300); }
      H.assert.ok((await page.locator('.ecm-main').innerText()).includes('Watch for: Counting the outer electron as core.'), 'M1 slip');
      await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 400);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 300);
      await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300);    // move 2 shown: a typed move
      H.assert.ok(!(await page.locator('.ecm-fig svg').innerHTML()).includes('#c07a00'), 'M2: the core is not painted before the student counts it');
      await walkModel(H, page);
      H.assert.ok((await page.locator('.ecm-main').innerText()).includes('Watch for: Using Z = 11'), 'M2 slip');
      await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 400);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 300); await walkModel(H, page);
      H.assert.ok((await page.locator('.ecm-main').innerText()).includes('Watch for: Subtracting only the 2 electrons of ring 1'), 'M3 slip');
      H.assert.ok(await page.evaluate(() => ENC_UI.modelsDone()));
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Banned words: nothing on any tab says extension, challenge, optional or stars; no band is named', async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      const n = await page.locator('#steps button').count();
      for (let i = 0; i < n; i++) {
        await page.locator('#steps button').nth(i).click(); await H.tick(page, 300);
        const t = (await page.locator('.card').innerText()).toLowerCase();
        for (const w of ['extension', 'challenge', 'optional', 'stars', '★', '☆']) H.assert.ok(!t.includes(w), 'tab ' + i + ' says ' + w);
      }
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }]
  ]
};
