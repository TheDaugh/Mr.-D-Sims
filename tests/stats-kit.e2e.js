/* Browser test for the stats widgets on stats/shared/kit-demo.html, plus the Concepts panel tabs in the stats template.
   Needs a static server on :8123.   TZ=America/New_York node tests/stats-kit.e2e.js     SHOTS=<dir> also writes 1366x768 screenshots. */
const fs = require('fs'), assert = require('assert'), path = require('path');
const PW = process.env.PLAYWRIGHT_DIR || ['/opt/npm-tools/node_modules/playwright', '/opt/node-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/playwright'].find(p => fs.existsSync(p));
const { chromium } = require(PW);
const CHROME = process.env.CHROMIUM || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const BASE = process.env.BASE || 'http://localhost:8123', NK = require('../stats/shared/normal-kit.js'), SHOTS = process.env.SHOTS;
const results = [];
async function open(br, url, opts) {
  const ctx = await br.newContext(Object.assign({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' }, opts || {})), page = await ctx.newPage(), errs = [];
  page.on('pageerror', e => errs.push(e.message)); await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await page.goto(BASE + url, { waitUntil: 'load' }); return { ctx, page, errs };
}
const tab = async (page, name) => { await page.locator('#tabs button', { hasText: name }).click(); };
const shot = async (page, name) => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); } };
async function cellBox(page, id, col) { return page.locator('.nk-zt td[data-r="' + id + '"][data-c="' + col + '"]'); }

(async () => {
  const br = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  async function t(name, fn) { try { await fn(); results.push(['ok  ', name]); } catch (e) { if (process.env.DEBUG) console.log(e.stack.split('\n').slice(0, 6).join('\n')); results.push(['FAIL', name + ' -> ' + String(e.message).split('\n')[0].slice(0, 220)]); } }

  await t('demo page: every widget tab opens with no JS errors', async () => {
    const { ctx, page, errs } = await open(br, '/stats/shared/kit-demo.html');
    for (const [n, f] of [['curve', 'curve'], ['zTable', 'table'], ['tiles', 'tiles'], ['ruler', 'ruler'], ['dotplot', 'dotplot'], ['hist', 'hist'], ['routine', 'routine']]) { await tab(page, n); await page.waitForTimeout(150); assert.ok(await page.locator('#' + f).isVisible(), n); await shot(page, 'demo-' + f); }
    assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await t('curve: readout hidden until commit; drag snaps to 0.25; keyboard moves a step', async () => {
    const { ctx, page, errs } = await open(br, '/stats/shared/kit-demo.html#curve');
    const r = page.locator('#curve .nk-readout').first(), m = page.locator('#curve .nk-marker').first();
    assert.ok(!/0\.\d{4}/.test(await r.innerText()), 'area hidden'); assert.strictEqual(await m.getAttribute('aria-valuenow'), '1.25');
    const bb = await m.locator('.nk-mdot').boundingBox(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down(); await page.mouse.move(bb.x - 120, bb.y + 5, { steps: 6 }); await page.mouse.up();
    const z = +(await m.getAttribute('aria-valuenow')); assert.ok(z < 1.25 && Math.abs(z * 4 - Math.round(z * 4)) < 1e-9, 'snapped ' + z);
    assert.ok(!/0\.\d{4}/.test(await r.innerText()), 'still hidden while dragging');
    await m.focus(); await page.keyboard.press('ArrowRight'); assert.strictEqual(+(await m.getAttribute('aria-valuenow')), z + 0.25);
    await page.locator('#curve').getByRole('button', { name: 'Show the area' }).first().click();
    assert.ok((await r.innerText()).includes(NK.cdf4(z + 0.25).toFixed(4)), await r.innerText());
    const b2 = page.locator('#curve .nk-curve').nth(1).locator('.nk-readout'); assert.ok(/between/.test(await b2.innerText()), await b2.innerText());
    await page.getByRole('button', { name: 'Shade right' }).click(); assert.ok((await r.innerText()).includes(NK.round4(1 - NK.cdf(z + 0.25)).toFixed(4)));
    await shot(page, 'curve-committed'); assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await t('zTable: wrong row, wrong column, then right; right-tail area read from the wrong side is named', async () => {
    const { ctx, page, errs } = await open(br, '/stats/shared/kit-demo.html#table');
    assert.strictEqual(await page.locator('.nk-zt tbody tr').count(), 70); assert.strictEqual(await page.locator('.nk-zt td').count(), 700);
    await page.locator('#table').getByRole('button', { name: 'Lookup: left of z = −1.67' }).click();
    const fb = page.locator('.nk-zt-fb');
    await (await cellBox(page, 'n17', 7)).click(); assert.match(await fb.innerText(), /Wrong row.*−1\.6.*−1\.7/);
    await (await cellBox(page, 'n16', 3)).click(); assert.match(await fb.innerText(), /Wrong column.*\.07.*\.03/);
    await (await cellBox(page, 'n10', 1)).click(); assert.match(await fb.innerText(), /Wrong row.*Wrong column/);
    await (await cellBox(page, 'n16', 7)).click(); assert.match(await fb.innerText(), new RegExp('Right cell.*' + NK.table.fmt(NK.cdf4(-1.67)).replace('.', '\\.')));
    await page.locator('#table').getByRole('button', { name: 'Lookup: right of z = 1.23' }).click();
    await (await cellBox(page, 'p12', 3)).click(); assert.match(await fb.innerText(), /subtract from 1/); assert.ok(await page.locator('.nk-zt-step2').isVisible());
    await page.locator('.nk-zt-step2 input').fill(String(NK.cdf4(1.23))); await page.locator('.nk-zt-step2').getByRole('button', { name: 'Check' }).click(); assert.match(await fb.innerText(), /area to the LEFT/);
    await page.locator('.nk-zt-step2 input').fill('0.1093'); await page.locator('.nk-zt-step2').getByRole('button', { name: 'Check' }).click(); assert.match(await fb.innerText(), /^Yes/);
    await shot(page, 'table-lookup'); assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await t('zTable: inverse mode accepts the closest cell, names the wrong side, row and column', async () => {
    const { ctx, page, errs } = await open(br, '/stats/shared/kit-demo.html#table'); const fb = page.locator('.nk-zt-fb');
    await page.locator('#table').getByRole('button', { name: 'Inverse: right area 0.0500' }).click();
    const lo = NK.bestCell(0.05), hi = NK.bestCell(0.95);
    await (await cellBox(page, lo.id, lo.col)).click(); assert.match(await fb.innerText(), /right-tail.*LEFT/);
    await (await cellBox(page, hi.id, hi.col)).click(); assert.match(await fb.innerText(), /Closest cell/);
    await page.locator('#table').getByRole('button', { name: 'Inverse: left area 0.9000' }).click();
    await (await cellBox(page, 'p12', 9)).click(); assert.match(await fb.innerText(), /Right row, wrong column/);
    await (await cellBox(page, 'p13', 8)).click(); assert.match(await fb.innerText(), /Right column, wrong row/);
    await (await cellBox(page, 'p12', 8)).click(); assert.match(await fb.innerText(), /z = 1\.28/);
    await shot(page, 'table-inverse'); assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await t('zTable: keyboard moves the finger cursor and picks a cell; row and column highlight', async () => {
    const { ctx, page } = await open(br, '/stats/shared/kit-demo.html#table');
    await page.locator('#table').getByRole('button', { name: 'Explore mode' }).click();
    await (await cellBox(page, 'p0', 0)).focus(); for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight'); for (let i = 0; i < 12; i++) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter'); assert.match(await page.locator('.nk-zt-fb').innerText(), new RegExp('z = 1\\.23 .* ' + NK.table.fmt(NK.cdf4(1.23)).replace('.', '\\.')));
    assert.ok(await page.locator('.nk-zt .nk-hot').count() >= 70, 'row and column lit'); assert.ok(await page.locator('.nk-finger').isVisible(), 'finger');
    await ctx.close();
  });

  const SLOT = i => '#tiles .nk-slot[data-slot="s' + i + '"]', TILE = id => '#tiles .nk-tile[data-tile="' + id + '"]', ORDER = ['picture', 'z', 'row', 'col', 'area', 'sentence'];
  await t('tiles: mouse drag snaps a right tile; a wrong tile shakes, goes home, and hints after two misses', async () => {
    const { ctx, page, errs } = await open(br, '/stats/shared/kit-demo.html#tiles');
    const drag = async (id, i) => { const a = await page.locator(TILE(id)).boundingBox(), b = await page.locator(SLOT(i)).boundingBox(); await page.mouse.move(a.x + 10, a.y + 10); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await page.mouse.up(); };
    await drag('picture', 0); assert.ok(await page.locator(SLOT(0) + ' .nk-tile').count() === 1, 'placed');
    await drag('area', 1); assert.ok(await page.locator(TILE('area') + '.nk-shake').count() === 1, 'shake'); assert.ok(await page.locator('#tiles .nk-bank ' + 'div[data-tile="area"]').count() === 1, 'went home'); assert.ok(!/Hint/.test(await page.locator('.nk-hint').innerText()));
    await drag('row', 1); assert.match(await page.locator('.nk-hint').innerText(), /^Hint: Move 2 comes after Picture/);
    await shot(page, 'tiles-hint'); assert.deepStrictEqual(errs, []); await ctx.close();
  });
  await t('tiles: keyboard only (Tab, Enter to pick up, arrows to a slot, Enter to drop) finishes the routine', async () => {
    const { ctx, page, errs } = await open(br, '/stats/shared/kit-demo.html#tiles');
    for (let i = 0; i < 6; i++) {
      await page.locator(TILE(ORDER[i])).focus(); await page.keyboard.press('Enter');
      assert.ok(await page.locator(TILE(ORDER[i]) + '.nk-held').count() === 1, 'held');
      assert.ok(await page.locator('.nk-live').textContent() !== undefined);
      await page.keyboard.press('Enter');   // the cursor starts on the first empty slot, which is the right one in order
      assert.ok(await page.locator(SLOT(i) + ' .nk-tile').count() === 1, 'dropped ' + ORDER[i]);
    }
    assert.match(await page.locator('#tiles-done').innerText(), /in order/);
    await ctx.close();
    const r = await open(br, '/stats/shared/kit-demo.html#tiles');   // arrows choose another slot; Escape cancels
    await r.page.locator(TILE('z')).focus(); await r.page.keyboard.press('Enter'); await r.page.keyboard.press('ArrowRight');
    assert.ok(await r.page.locator(SLOT(1) + '.nk-target').count() === 1, 'cursor on slot 2'); await r.page.keyboard.press('Enter');
    assert.ok(await r.page.locator(SLOT(1) + ' .nk-tile').count() === 1, 'z dropped with arrows');
    await r.page.locator(TILE('row')).focus(); await r.page.keyboard.press('Enter'); await r.page.keyboard.press('Escape'); assert.ok(await r.page.locator(TILE('row') + '.nk-held').count() === 0, 'cancelled');
    assert.deepStrictEqual(errs.concat(r.errs), []); await r.ctx.close();
  });
  await t('tiles: touch tap (tap a tile, tap a slot) and a touch drag both work', async () => {
    const { ctx, page, errs } = await open(br, '/stats/shared/kit-demo.html#tiles', { hasTouch: true });
    await page.locator(TILE('picture')).tap(); assert.ok(await page.locator(TILE('picture') + '.nk-held').count() === 1);
    await page.locator(SLOT(0)).tap(); assert.ok(await page.locator(SLOT(0) + ' .nk-tile').count() === 1, 'tap placed');
    const cdp = await ctx.newCDPSession(page), a = await page.locator(TILE('z')).boundingBox(), b = await page.locator(SLOT(1)).boundingBox(), P = (x, y) => [{ x, y, id: 1 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: P(a.x + 10, a.y + 10) });
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: P(a.x + 10 + (b.x + b.width / 2 - a.x - 10) * i / 6, a.y + 10 + (b.y + b.height / 2 - a.y - 10) * i / 6) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.ok(await page.locator(SLOT(1) + ' .nk-tile').count() === 1, 'touch drag placed'); assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await t('ruler, dot plot and histogram respond', async () => {
    const { ctx, page, errs } = await open(br, '/stats/shared/kit-demo.html#ruler');
    await tab(page, 'ruler'); const rm = page.locator('#ruler .nk-marker'); await rm.focus(); await page.keyboard.press('ArrowRight');
    assert.match(await page.locator('#ruler .nk-readout').innerText(), /z = 2\.00|2\.00 SD above/);   // 85 + 5 = 90 is 2 SD
    await tab(page, 'dotplot'); const dm = page.locator('#dotplot .nk-marker'); await dm.focus(); await page.keyboard.press('Home'); assert.match(await page.locator('#dotplot .nk-readout').innerText(), /^0 of 17|^[0-9]+ of 17 dots/);
    await page.keyboard.press('End'); assert.match(await page.locator('#dotplot .nk-readout').innerText(), /^17 of 17.*100th/);
    await tab(page, 'hist'); const n0 = await page.locator('#hist .nk-bar').count(); await page.locator('#hist input[type=range]').fill('0'); const n1 = await page.locator('#hist .nk-bar').count(); assert.ok(n1 > n0 * 3, n0 + ' -> ' + n1);
    assert.match(await page.locator('#hist .nk-readout').innerText(), /normal curve/); await shot(page, 'hist-thin');
    assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await t('stats template: Concepts opens Table, Routine and Example tabs; the table answers a click', async () => {
    const { ctx, page, errs } = await open(br, '/templates/stats/lesson.html#key');
    await page.getByRole('button', { name: 'Concepts' }).click(); const p = page.locator('.cp-panel'); assert.ok(await p.isVisible());
    assert.deepStrictEqual(await p.locator('.cp-tab').allInnerTexts(), ['Concepts', 'z-table', 'Routine', 'Example']);
    assert.ok(/Standard deviation/.test(await p.innerText()), 'concept list still first');
    await p.locator('.cp-tab', { hasText: 'z-table' }).click(); assert.strictEqual(await p.locator('.nk-zt td').count(), 700);
    await p.locator('.nk-zt td[data-r="p12"][data-c="3"]').click(); assert.ok((await p.locator('.nk-zt-fb').innerText()).includes('0.8907'), await p.locator('.nk-zt-fb').innerText()); await shot(page, 'concepts-table');
    await p.locator('.cp-tab', { hasText: 'Routine' }).click(); assert.strictEqual(await p.locator('.nk-routine li').count(), 6); await shot(page, 'concepts-routine');
    await p.locator('.cp-tab', { hasText: 'Example' }).click(); assert.ok((await p.locator('.nk-example').innerText()).includes('93.32%')); await shot(page, 'concepts-example');
    await page.keyboard.press('Escape'); assert.ok(!(await p.isVisible())); assert.deepStrictEqual(errs, []); await ctx.close();
  });
  await t('physics Concepts panel is unchanged (no tabs)', async () => {
    const { ctx, page, errs } = await open(br, '/templates/physics/lesson.html#key');
    await page.getByRole('button', { name: 'Concepts' }).click(); assert.strictEqual(await page.locator('.cp-tab').count(), 0); assert.ok(await page.locator('.cp-panel h3').count() >= 1); assert.deepStrictEqual(errs, []); await ctx.close();
  });

  await br.close(); results.forEach(r => console.log(r[0] + ' ' + r[1]));
  const bad = results.filter(r => r[0] === 'FAIL').length; console.log(bad ? '\n' + bad + ' failed' : '\nall passed'); process.exit(bad ? 1 : 0);
})();
