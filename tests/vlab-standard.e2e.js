/* The virtual lab standard (shared/virtual-lab/STANDARD.md), checked on every lab in a browser:
     python3 -m http.server 8123 &
     TZ=America/New_York node tests/vlab-standard.e2e.js [lab-name-substring]
   Every lab: a demo button that plays to the end with no page errors; #key opens a creative mode that skips the name screen and the pre-lab;
   adding or removing #key on an open page restarts it. Labs with huddles: the bell calls huddle 1 at minute 3 and huddle 2 at minute 25,
   whatever time the student started. */
const { chromium } = require(process.env.PLAYWRIGHT_DIR || '/opt/node-tools/node_modules/playwright');
const ORIGIN = process.env.BASE || 'http://localhost:8123';
const LABS = [
  { name: 'chem 1 unknown solids', url: '/chemistry/virtual-lab/index.html' }, { name: 'chem 2 heating curves', url: '/chemistry/virtual-lab/index.html?lab=heating' },
  { name: 'chem 3 gold foil', url: '/chemistry/virtual-lab/index.html?lab=rutherford' }, { name: 'chem 4 flame tests', url: '/chemistry/virtual-lab/index.html?lab=flame', huddles: true, course: 'chem' },
  { name: 'physics 5 fan cart', url: '/physics/virtual-lab/index.html', huddles: true, course: 'physics' }];
const want = process.argv[2], fails = [];
const check = (c, m) => { if (!c) { fails.push(m); console.log('FAIL ' + m); } else console.log('ok   ' + m); };
(async () => {
  const browser = await chromium.launch();
  for (const lab of LABS.filter((l) => !want || l.name.includes(want))) {
    const open = async (hash, at) => {
      const ctx = await browser.newContext({ reducedMotion: 'reduce', timezoneId: 'America/New_York', viewport: { width: 1400, height: 800 } }), page = await ctx.newPage(); page.setDefaultTimeout(8000);
      page.errors = []; page.on('pageerror', (e) => page.errors.push(e.message)); await page.route(/fonts\./, (r) => r.abort());
      await page.clock.setFixedTime(new Date(at || '2026-10-21T07:30:00-04:00')); await page.goto(ORIGIN + lab.url + (hash || '')); return { ctx, page };
    };
    // demo plays to the end
    { const { ctx, page } = await open(); await page.waitForSelector('#student'); const b = page.locator('button:has-text("Watch the demo")');
      check(await b.count() > 0, lab.name + ': the intro has a demo button'); await b.first().click(); await page.waitForSelector('#demoBar:not([hidden])');
      await page.waitForFunction(() => document.querySelector('#demoBar').hidden, null, { timeout: 120000 }); check(page.errors.length === 0, lab.name + ': the demo plays to the end with no errors' + page.errors.join('|')); await ctx.close(); }
    // #key: creative mode, no name screen, no pre-lab
    { const { ctx, page } = await open('#key'); await page.waitForFunction(() => window.__vl && __vl.S, null, { timeout: 10000 });
      check(await page.evaluate(() => __vl.S.stage) === 'lab', lab.name + ': #key skips the name screen and the pre-lab'); check(await page.locator('#btnKey').isVisible(), lab.name + ': #key shows the Key button');
      await page.evaluate(() => { location.hash = ''; }); await page.waitForSelector('#student', { timeout: 10000 }).catch(() => {}); check(await page.locator('#student').isVisible().catch(() => false), lab.name + ': removing #key restarts as a student page');
      await page.evaluate(() => { location.hash = '#key'; }); await page.waitForFunction(() => window.__vl && __vl.S && __vl.S.stage === 'lab', null, { timeout: 10000 }).catch(() => {}); check(await page.evaluate(() => window.__vl && __vl.S.stage) === 'lab', lab.name + ': adding #key restarts in creative mode');
      check(page.errors.length === 0, lab.name + ': no errors in #key' + page.errors.join('|')); await ctx.close(); }
    if (!lab.huddles) { const { ctx, page } = await open('', '2026-10-21T10:44:00-04:00'); await page.waitForSelector('#student'); await page.fill('#student', 'Clock Test'); await page.waitForTimeout(300); check(!(await page.locator('#dlgHuddle').count()) || !(await page.locator('#dlgHuddle').evaluate((d) => d.open)), lab.name + ': no huddle yet (legacy lab, listed in STANDARD.md)'); await ctx.close(); continue; }
    // the bell calls huddle 1 at minute 3 for a student who is still in the pre-lab
    const inClass = lab.course === 'physics' ? ['2026-10-21T09:04:00-04:00', '2026-10-21T09:26:00-04:00'] : ['2026-10-21T10:44:00-04:00', '2026-10-21T11:06:00-04:00'];
    { const { ctx, page } = await open('', inClass[0]); await page.waitForSelector('#student'); await page.fill('#student', 'Clock Test'); await page.click('button:has-text("Start the pre-lab")').catch(() => {});
      await page.waitForFunction(() => document.querySelector('#dlgHuddle') && document.querySelector('#dlgHuddle').open, null, { timeout: 9000 }).catch(() => {});
      check(await page.evaluate(() => !!(document.querySelector('#dlgHuddle') || {}).open), lab.name + ': the bell calls huddle 1 at minute 3'); await ctx.close(); }
    { const { ctx, page } = await open('', inClass[1]); await page.waitForSelector('#student'); await page.fill('#student', 'Clock Test'); await page.click('button:has-text("Start the pre-lab")').catch(() => {}); await page.waitForTimeout(400);
      await page.evaluate(() => { __vl.S.flame.huddle1 = true; __vl.S.flame.forced1 = true; __vl.S.stage = 'lab'; document.querySelectorAll('dialog[open]').forEach((d) => d.close()); });
      await page.waitForFunction(() => document.querySelector('#dlgHuddle') && document.querySelector('#dlgHuddle').open, null, { timeout: 9000 }).catch(() => {});
      check(await page.evaluate(() => !!(document.querySelector('#dlgHuddle') || {}).open), lab.name + ': the bell calls huddle 2 at minute 25 whatever time the student started'); await ctx.close(); }
  }
  await browser.close(); console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nall passed'); process.exit(fails.length ? 1 : 0);
})();
