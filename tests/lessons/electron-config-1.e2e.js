/* Per-lesson overrides for Electron Configurations I (Unit 3, slot 9). Run with
     TZ=America/New_York TEMPLATE=chem PAGE=chemistry/unit-3-atoms-ions/electron-config-1.html node tests/template.e2e.js
   It replaces the four standard tests that assume the placement warm-up and the two-question check, and adds tests for the Orbital Filler,
   the Models tab, the board page and the banned words. */
const C = require('../../chemistry/unit-3-atoms-ions/day-cards/slot-09.content.js');
const BASE = process.env.BASE || 'http://localhost:8123';

/* answer whatever is open on the card: num, config, choice and the "draw the boxes" item. wrong=true answers wrongly. Returns when nothing is left. */
async function solve(page, wrong) {
  for (let guard = 0; guard < 80; guard++) {
    const todo = await page.evaluate(() => window.__q.map((q, i) => ({ i, id: q.id, type: q.type, answer: q.answer, answer2: q.answer2, text: q.type === 'choice' ? null : String(q.answer),
      wrongI: q.type === 'choice' ? q.options.map((o, k) => k).filter(k => k !== q.answer)[0] : null, done: !!(LE.qs(q.id) && LE.qs(q.id).done) })).filter(x => !x.done));
    if (!todo.length) return;
    const t = todo[0], box = page.locator('.card .q').nth(t.i);
    if (t.type === 'num') {
      const v = wrong ? String(t.answer + 123) : (t.answer2 != null ? t.answer + ', ' + t.answer2 : String(t.answer));
      await box.locator('input[type=text]').first().fill(v); await box.getByRole('button', { name: 'Check', exact: true }).click();
    } else if (t.type === 'config') {
      await box.locator('input[type=text]').first().fill(wrong ? '1s9' : t.answer); await box.getByRole('button', { name: 'Check', exact: true }).click();
    } else if (t.type === 'custom') {
      const Z = { M2: 16, M3: 26 }[t.id.split('.')[1]], f = C.fill(Z), sub = f[f.length - 1][0], want = C.occupancy(Z)[sub];
      if (!wrong) for (let k = 0; k < want.length; k++) for (let n = 0; n < want[k]; n++) await box.locator('.cl-box[data-k="' + k + '"]').click();
      await box.getByRole('button', { name: 'Check', exact: true }).click();
    } else await box.locator('button.opt[data-i="' + (wrong ? t.wrongI : t.answer) + '"]').first().click();
    await page.clock.runFor(900);
  }
}
const nextBtn = async (page, tick) => { await page.locator('#btn-next').click(); await tick(page, 400); };
/* walk every move of the open model; the Next move button appears when the move is answered */
async function walkModel(H, page) {
  for (let g = 0; g < 14; g++) {
    await solve(page, false);
    const nm = page.getByRole('button', { name: /^(Move 1|Next move)$/ });
    if (await nm.count()) { await nm.first().click(); await H.tick(page, 500); } else return;
  }
}

module.exports = {
  tests: {
    'Placement: all right climbs to band 4; misses stop at band 1': async H => {
      let r = await H.open(H.br); await H.tick(r.page); await H.start(r.page, H.myId, '3'); await H.next(r.page);
      await solve(r.page, false); await H.tick(r.page, 900);
      H.assert.strictEqual(await r.page.evaluate(() => LE.S().band0), 2, 'six first-try rights place at band 2 (the warm-up has bands 1 and 2)'); await r.ctx.close();
      r = await H.open(H.br); await H.tick(r.page); await H.start(r.page, H.myId, '3'); await H.next(r.page);
      await solve(r.page, true); await H.tick(r.page, 900);
      H.assert.strictEqual(await r.page.evaluate(() => LE.S().band0), 1); H.assert.ok(await r.page.evaluate(() => LE.S().d.place.done)); await r.ctx.close();
    },
    'Timed huddle: at minute 18 the clock pulls the class in, blanks can be written, Continue returns': async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await solve(page, false); await H.tick(page, 900); await H.next(page); H.assert.strictEqual(await H.step(page), 'predict');
      await page.clock.setSystemTime(new Date('2026-10-21T' + H.T18 + ':00-04:00')); await H.tick(page, 2500);
      H.assert.strictEqual(await H.step(page), 'huddle');
      const blanks = await page.evaluate(() => { const sp = window.SPECS['electron-config-1'], out = []; (sp.huddle.defs || []).forEach(d => MrD.huddle.parse(d.text).forEach(p => p.b && out.push(p.b))); return out; });
      await page.locator('.hd-line input').first().fill(blanks[0]); await page.locator('.hd-line input').nth(1).fill(blanks[1]);
      await page.getByRole('button', { name: 'Check mine' }).click();
      H.assert.ok(await page.locator('.hd-line input.ok').count() >= 2);
      H.assert.ok((await page.locator('.card').innerText()).includes('After 3p, where does the next electron go?'), 'the huddle talk line is on the tab');
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
      for (let m = 0; m < 3; m++) { await walkModel(H, page); if (m < 2) { await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 500); } }
      H.assert.ok(await page.evaluate(() => EC_UI.modelsDone()), 'all three models done'); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'build'); await solve(page, false); await H.tick(page, 600); await H.next(page);
      for (let k = 0; k < 4; k++) { await solve(page, false); await H.tick(page, 400); if (k < 3) { await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400); } }
      await page.getByRole('button', { name: 'Next question' }).click(); await H.tick(page, 400); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'check'); await solve(page, false); await H.tick(page, 500);
      H.assert.strictEqual(await page.evaluate(() => ['X1', 'X2', 'X3'].filter(id => LE.qs(id).ok && LE.qs(id).misses === 0).length), 3); await H.next(page);
      H.assert.strictEqual(await H.step(page), 'notes');
      await page.clock.setSystemTime(new Date('2026-10-21T' + H.T44 + ':00-04:00')); await H.tick(page, 2500);
      const text = await page.locator('#stage').innerText();
      H.assert.ok(/\b[A-Z]{3}-\d{3,}/.test(text), 'stamp shown'); H.assert.ok(text.includes(H.myId), 'ID shown'); H.assert.ok(!/Name:/.test(text), 'no name label');
      const code = await page.locator('.longcode').innerText(), f = await page.evaluate(c => LE.decodeReport('electron-config-1', c).fields, code);
      H.assert.strictEqual(f[6], '1-1-1', 'the report code carries the three exit bits'); H.assert.strictEqual(f[3], '2');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }
  },
  extra: [
    ['Orbital Filler: drag places an electron; each rule rejects with its one-line reason; the record table fills from the ladder', async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      await page.locator('#steps button', { hasText: 'Explore' }).click(); await H.tick(page, 300);
      H.assert.ok((await page.locator('.card h3').first().innerText()).includes('lithium (Z = 3)'), 'title shows element and Z');
      H.assert.strictEqual(await page.locator('.cl-box').count(), 18, 'eighteen boxes drawn from the start');
      const box = s => page.locator('.cl-fig .cl-box[data-sub="' + s + '"][data-k="0"]');
      await box('2p').click(); H.assert.ok((await page.locator('.cl-msg').innerText()).includes('A lower subshell still has room.'));
      const e = await page.locator('.cl-e').boundingBox(), t = await box('1s').boundingBox();
      await page.mouse.move(e.x + e.width / 2, e.y + e.height / 2); await page.mouse.down(); await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 5 }); await page.mouse.up();
      H.assert.ok((await page.locator('.cl-read').innerText()).replace(/\s+/g, ' ').includes('Electrons left 2'), 'a drag placed one electron');
      await box('1s').click(); await H.tick(page, 800); await box('1s').click();
      H.assert.ok((await page.locator('.cl-msg').innerText()).includes('A box holds 2 electrons, spins opposite.'));
      await H.tick(page, 800); await box('2s').click(); await H.tick(page, 300);
      H.assert.ok((await page.locator('.cl-read').innerText()).replace(/\s+/g, ' ').includes('Electrons left 0'));
      const rej = await page.evaluate(() => LE.S().d.ec.runs[0].rej); H.assert.deepStrictEqual(rej, { aufbau: 1, pauli: 1, hund: 0 });
      await solve(page, false); await H.tick(page, 1000);
      for (const Z of [7, 11, 15, 19]) {
        const need = await page.evaluate(() => (document.querySelector('.card h3') || {}).textContent);
        H.assert.ok(need.includes('Z = ' + Z), 'next atom is Z = ' + Z + ' (' + need + ')');
        const fill = await page.evaluate(z => { const run = LE.S().d.ec.runs.filter(x => !x.closed && x.Z === z).pop(); while (!EnergyLadder.full(run)) { const sub = EnergyLadder.ORDER.find(s => run.boxes[s].some(n => n < 2)), arr = run.boxes[sub]; let k = arr.findIndex(n => n === 0); if (k < 0) k = arr.findIndex(n => n === 1); EnergyLadder.place(run, sub, k); } LE.save(); LE.render(); return EnergyLadder.config(run); }, Z);
        H.assert.strictEqual(fill, C.cfg(Z)); await solve(page, false); await H.tick(page, 1000);
      }
      await solve(page, false); await H.tick(page, 500);
      H.assert.ok((await page.locator('.card').innerText()).includes('Table complete: s 2, p 6, d 10.'));
      H.assert.strictEqual(await page.locator('.card table tbody tr').count(), 5);
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Models: M1 watch, M2 with me, M3 you do; the slip shows after the answer; the ladder is not drawn before the drawing is answered', async H => {
      const { ctx, page, errs } = await H.open(H.br, '#key'); await H.tick(page);
      await page.locator('#steps button', { hasText: 'Models' }).click(); await H.tick(page, 300);
      H.assert.strictEqual(await page.locator('.ecm-rail li').count(), 6);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 400);
      for (let i = 0; i < 5; i++) { await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300); }
      H.assert.ok((await page.locator('.ecm-main').innerText()).includes('Watch for: Pairing the 3p electrons.'), 'M1 slip');
      H.assert.ok(await page.locator('.ecm-fig svg').count() === 1, 'M1 shows the ladder');
      await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 400);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 300);
      for (let i = 0; i < 3; i++) { await page.getByRole('button', { name: 'Next move' }).click(); await H.tick(page, 300); }   // moves 2, 3, 4 shown
      H.assert.strictEqual(await page.locator('.ecm-fig').count(), 0, 'M2: no ladder before the student writes and draws');
      await walkModel(H, page);
      H.assert.ok((await page.locator('.ecm-main').innerText()).includes('Watch for: Putting the fourth 3p electron'), 'M2 slip');
      await page.getByRole('button', { name: 'Next model' }).click(); await H.tick(page, 400);
      await page.getByRole('button', { name: 'Move 1' }).click(); await H.tick(page, 300); await walkModel(H, page);
      H.assert.ok((await page.locator('.ecm-main').innerText()).includes('Watch for: Filling 3d before 4s.'), 'M3 slip');
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Board page: Forward fills blanks, then runs the phosphorus counter 15, 13, 11, 5, 3, 0; Back undoes', async H => {
      const ctx = await H.br.newContext({ viewport: { width: 1366, height: 768 } }), page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(e.message));
      await page.goto(BASE + '/chemistry/unit-3-atoms-ions/electron-config-1-board.html'); await page.waitForTimeout(300);
      H.assert.strictEqual(await page.locator('.cl-box').count(), 18); H.assert.strictEqual(await page.locator('.cl-box[tabindex]').count(), 0, 'not interactive');
      H.assert.strictEqual(await page.locator('.bd-blank.on').count(), 0);
      await page.click('#fw'); H.assert.strictEqual(await page.locator('.bd-blank.on').count(), 1);
      await page.click('#bk'); H.assert.strictEqual(await page.locator('.bd-blank.on').count(), 0);
      for (let i = 0; i < 5; i++) await page.click('#fw'); H.assert.strictEqual(await page.locator('.bd-blank.on').count(), 5, 'all five blanks of the three definitions');
      const seen = []; for (let i = 0; i < 7; i++) { await page.click('#fw'); const c = await page.locator('#count').innerText(); if (c) seen.push(+c.replace(/\D/g, '')); }
      H.assert.deepStrictEqual(seen.slice(0, 6), [15, 15, 13, 11, 5, 3], 'counter while the moves run (move 1, move 2, then each subshell)');
      await page.click('#fw'); await page.click('#fw'); await page.click('#fw');
      H.assert.ok((await page.locator('#items').innerText()).includes('Check: 2 + 2 + 6 + 2 + 3 = 15.'));
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }],
    ['Student-facing text: no tier words or minutes on any tab', async H => {
      const { ctx, page, errs } = await H.open(H.br); await H.tick(page); await H.start(page, H.myId, '3'); await H.next(page);
      await page.evaluate(() => { const S = LE.S(); S.band0 = S.band = 2; LE.save(); });
      const texts = [];
      for (const id of ['warmup', 'predict', 'explore', 'huddle', 'models', 'build', 'check']) { await page.evaluate(i => LE.forceGoto(i), id); await H.tick(page, 300); texts.push(await page.locator('#stage').innerText()); }
      await page.locator('#btn-notes').click(); await H.tick(page, 300); texts.push(await page.locator('#notes-print-root, #stage').first().innerText());
      const bad = /extension|challenge|optional|\bstars?\b|★|minutes?\b/i; texts.forEach(t => H.assert.ok(!bad.test(t), (t.match(bad) || [])[0]));
      H.assert.deepStrictEqual(errs, []); await ctx.close();
    }]
  ]
};
