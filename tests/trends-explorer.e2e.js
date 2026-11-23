/* Trends Explorer (chemistry/unit-4-bonding/trends-explorer.html) in Chromium.
     python3 -m http.server 8123 &
     node tests/trends-explorer.e2e.js
   Checks: #key opens every stage and the table fills with what is measured; a student in class starts locked, picks and logs; the page goes black
   20 minutes after the bell with no code, stays black on reload, and does not count as leaving; after the bell it opens normally. */
const fs = require('fs');
const PW = process.env.PLAYWRIGHT_DIR || ['/opt/npm-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/playwright'].find(p => fs.existsSync(p));
const { chromium } = require(PW);
const CHROME = process.env.CHROMIUM || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1243/chrome-linux/chrome'].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
const ORIGIN = process.env.BASE || 'http://localhost:8123', URL = ORIGIN + '/chemistry/unit-4-bonding/trends-explorer.html';
const SHOTS = process.env.SHOTS || '';
const STUB = () => { let f = null; const fire = () => document.dispatchEvent(new Event('fullscreenchange'));
  Object.defineProperty(document, 'fullscreenElement', { get: () => f, configurable: true });
  Element.prototype.requestFullscreen = function () { f = this; setTimeout(fire, 0); return Promise.resolve(); };
  document.exitFullscreen = function () { f = null; setTimeout(fire, 0); return Promise.resolve(); }; };
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } else console.log('ok  ', m); };
async function open(br, at, hash) {
  const ctx = await br.newContext({ viewport: { width: 1366, height: 768 } }), page = await ctx.newPage(); page.setDefaultTimeout(6000);
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errors.push(m.text()); });
  await page.route(/fonts\./, r => r.abort()); await page.addInitScript(STUB); await page.clock.install({ time: new Date(at) });
  await page.goto(URL + (hash || '')); return { ctx, page, errors };
}
(async () => {
  const br = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  // 1. teacher key: every stage open, measured tiles fill the table, patterns graded from the student's own tiles
  { const { ctx, page, errors } = await open(br, '2026-10-21T10:55:00-04:00', '#key');
    ok(await page.locator('.t').count() === 31, '31 atoms in the table (H through Cs and Ba)');
    ok(!(await page.locator('#st3').isDisabled()), 'all stages open in #key');
    await page.click('.t[data-sym="Na"]'); ok((await page.locator('.t[data-sym="Na"] i').textContent()) === '180', 'picking an atom measures its size on the table');
    ok((await page.locator('.t[data-sym="Cl"] i').textContent()) === '', 'an atom you did not pick stays blank');
    await page.click('#acts .big >> nth=0'); await page.waitForTimeout(300);
    await page.click('.vb[data-v="ie"]'); ok((await page.locator('.t[data-sym="Na"] i').textContent()) === '496', 'removing an electron measures ionization energy');
    await page.click('#st2'); await page.click('.t[data-sym="Na"]'); await page.click('.t[data-sym="Cl"]'); await page.click('#acts .big >> nth=2'); await page.waitForTimeout(600);
    ok((await page.textContent('#result')).includes('NaCl'), 'Na + Cl makes NaCl');
    await page.click('.vb[data-v="en"]'); ok((await page.locator('.t[data-sym="Cl"] i').textContent()) === '3.16', 'electronegativity appears once the atoms meet');
    await page.click('.t[data-sym="Ne"]'); await page.click('.t[data-sym="F"]'); await page.click('#acts .big >> nth=2'); await page.waitForTimeout(300);
    ok((await page.textContent('#result')).includes('Nothing happens'), 'a noble gas does nothing');
    if (SHOTS) await page.screenshot({ path: SHOTS + '/te-pair.png' });
    await page.click('#st3'); for (const s of ['Na', 'Na', 'O']) await page.click('.t[data-sym="' + s + '"]'); await page.click('#acts .big >> nth=0'); await page.waitForTimeout(500);
    ok((await page.textContent('#result')).includes('Na₂O'), 'two Na and one O make Na2O');
    if (SHOTS) await page.screenshot({ path: SHOTS + '/te-mix.png' });
    await page.click('#btnKey'); ok((await page.textContent('#keyBody')).includes('Unlock code'), 'key shows the unlock code');
    ok(errors.length === 0, 'no JS errors in #key ' + errors.join('|')); await ctx.close(); }
  // 2. a student at 10 minutes in: locked start; stages unlock by measuring; record
  { const { ctx, page, errors } = await open(br, '2026-10-21T10:50:00-04:00');
    await page.fill('#mrd-id', '65J-7TGT'); await page.fill('#mrd-period', '3'); await page.locator('#mrd-period').blur(); await page.waitForTimeout(400);
    if (SHOTS) await page.screenshot({ path: SHOTS + '/te-start.png' });
    await page.click('#bBegin'); await page.waitForTimeout(300);
    ok(await page.evaluate(() => !!document.fullscreenElement), 'full screen starts at Begin');
    ok(await page.locator('#st2').isDisabled(), 'stage 2 starts closed');
    for (const s of ['Cs', 'F', 'Li']) { await page.click('.t[data-sym="' + s + '"]'); await page.click('#acts .big >> nth=0'); await page.waitForTimeout(150); }
    ok(!(await page.locator('#st2').isDisabled()), 'stage 2 opens after three ionization energies');
    const rec = await page.evaluate(() => MrD.profile.all().filter(r => r.lesson === 'chem-u4-d1-trends-lab')[0]);
    ok(rec && rec.items.length === 5 && rec.items[1].ok === true, 'ionization energies are recorded locally');
    await page.click('.dir >> nth=0'); ok((await page.textContent('#findMsg')).length > 0, 'a pattern guess gets feedback from the student\'s own tiles');
    if (SHOTS) await page.screenshot({ path: SHOTS + '/te-explore.png' });
    // 3. the clock reaches 20 minutes: black, no code, no lock counted
    await page.clock.fastForward(11 * 60 * 1000); await page.waitForTimeout(1200);
    ok(await page.locator('#dark').isVisible(), 'black at 20 minutes');
    ok(!(await page.locator('.ll-ov').count()) || !(await page.locator('.ll-ov').isVisible()), 'no lock screen over the black');
    ok((await page.locator('#dark input').count()) === 0, 'no code box on the black screen');
    ok(!(await page.evaluate(() => /lock:/.test(Object.keys(localStorage).join(',')) && JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /^lock:/.test(k)))||'null') && JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /^lock:/.test(k)))).exits > 0)), 'going black is not counted as leaving');
    await page.reload(); await page.waitForTimeout(600);
    ok(await page.locator('#dark').isVisible(), 'still black after a reload in class');
    ok(errors.length === 0, 'no JS errors in class ' + errors.join('|')); await ctx.close(); }
  // 4. late arrival, and after the bell
  { const { ctx, page } = await open(br, '2026-10-21T11:05:00-04:00'); await page.waitForTimeout(500);
    ok(await page.locator('#dark').isVisible(), 'opening at minute 25 is black at once'); await ctx.close(); }
  { const { ctx, page } = await open(br, '2026-10-21T15:30:00-04:00'); await page.waitForTimeout(500);
    ok(!(await page.locator('#dark').isVisible()) && await page.locator('#start').isVisible(), 'after school it opens normally (home practice)'); await ctx.close(); }
  await br.close(); console.log(bad ? bad + ' problem(s)' : 'trends-explorer: all checks pass'); process.exit(bad ? 1 : 0);
})();
