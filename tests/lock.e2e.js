/* Locked mode, end to end, for every guided lesson and virtual lab that opts in (shared/lock.js).
     python3 -m http.server 8123 &
     node tests/lock.e2e.js                 all targets
     node tests/lock.e2e.js physics         one target by name (substring match)
   Per target it checks: the lock engages from the Start click (fullscreen, exit counter at 0); one exit warns and waits;
   the second exit locks until the per-student code (or the unlock-any-student code) is typed; closing and reopening the
   page asks for a code; #key never locks; outside the class period (after 3 PM) never locks; #nolock=<code> never locks.
   Chromium headless has no real fullscreen, so a small stub gives the page a working requestFullscreen/exitFullscreen. */
const { chromium } = require(process.env.PLAYWRIGHT_DIR || '/opt/npm-tools/node_modules/playwright');
const ORIGIN = process.env.BASE || 'http://localhost:8123';

/* Each target says how to reach a locked start. clockAt pins a time inside that course's period (a Wednesday, before the end mark). */
const TARGETS = [
  { name: 'physics newtons-first-law', url: '/physics/lessons/newtons-first-law.html', clockAt: '2026-10-21T09:05:00-04:00',
    begin: async page => { await page.fill('input[aria-label="First name"]', 'Lockie'); await page.fill('input[aria-label="Class period"]', '3'); await page.click('#btn-next'); } },
  { name: 'physics newtons-second-law', url: '/physics/lessons/newtons-second-law.html', clockAt: '2026-10-21T09:05:00-04:00',
    begin: async page => { await page.fill('input[aria-label="First name"]', 'Lockie'); await page.fill('input[aria-label="Class period"]', '3'); await page.click('#btn-next'); } },
  { name: 'calculus 2-7-product-rule', url: '/calculus/unit-2-differentiation/2-7-product-rule.html', clockAt: '2026-10-21T12:15:00-04:00',
    begin: async page => { await page.fill('#who-first', 'Lockie'); await page.fill('#who-period', '3'); await page.click('button:has-text("Begin the warm-up")'); } },
  /* Spec-built (Standard v2) lessons are locked by default (engine/standard.js sets lock: true). They ask for a student ID,
     not a name, so the target enters one (valid check character) and uses it as the student for the unlock code.
     The stats period in shared/bell.js is a placeholder until Ian sets the real times; update clockAt with it. */
  ...[['physics', 'templates/physics/lesson.html', '2026-10-21T09:05:00-04:00'], ['chem', 'templates/chem/lesson.html', '2026-10-21T10:45:00-04:00'],
      ['calc', 'templates/calc/lesson.html', '2026-10-21T12:15:00-04:00'], ['calc', 'calculus/unit-3-composite-implicit-inverse/3-1-chain-rule.html', '2026-10-21T12:15:00-04:00'], ['stats', 'templates/stats/lesson.html', '2026-10-21T10:05:00-04:00'], ['stats', 'stats/unit-3-normal-distribution/3-6-boundary-values.html', '2026-10-21T10:05:00-04:00']].map(([c, url, at]) => ({
    name: url.indexOf('templates/') === 0 ? 'v2 template ' + c : 'v2 lesson ' + url.split('/').pop().replace('.html', ''), url: '/' + url, clockAt: at, student: '65J-7TGT',
    begin: async page => { await page.fill('#mrd-id', '65J-7TGT'); await page.fill('#mrd-period', '3'); await page.locator('#mrd-period').blur(); await page.waitForTimeout(400); await page.click('#btn-next'); } })),
  { name: 'chem electron-config-1', url: '/chemistry/unit-3-atoms-ions/electron-config-1.html', clockAt: '2026-10-21T10:45:00-04:00', student: '65J-7TGT',
    begin: async page => { await page.fill('#mrd-id', '65J-7TGT'); await page.fill('#mrd-period', '3'); await page.locator('#mrd-period').blur(); await page.waitForTimeout(400); await page.click('#btn-next'); } },
  ...[['unknown-solids', ''], ['heating', '?lab=heating'], ['rutherford', '?lab=rutherford'], ['flame', '?lab=flame']].map(([id, q]) => ({
    name: 'virtual lab ' + id, url: '/chemistry/virtual-lab/index.html' + q, clockAt: '2026-10-21T10:45:00-04:00', student: 'Lockie Test', teacherBuild: true, saveMs: 6000,
    begin: async page => { await page.waitForTimeout(900); await page.fill('#student', 'Lockie Test'); await page.click('button:has-text("Start the pre-lab")'); },
    reopen: async page => { const b = page.locator('button:has-text("Continue where I left off")'); if (await b.count()) await b.click(); },
    gateInput: 'input[aria-label="Unlock code from Mr. D"]', gateButton: 'button:has-text("Unlock")' })),
  /* the physics virtual lab runs on the shared lab app from physics/virtual-lab, in physics' own period; #key is its teacher switch */
  { name: 'virtual lab physics 05-fan-cart', url: '/physics/virtual-lab/index.html?lab=05-fan-cart', clockAt: '2026-10-21T09:05:00-04:00', student: 'Lockie Test', saveMs: 6000,
    begin: async page => { await page.waitForTimeout(900); await page.fill('#student', 'Lockie Test'); await page.click('#introGo'); },
    reopen: async page => { const b = page.locator('button:has-text("Continue where I left off")'); if (await b.count()) await b.click(); },
    gateInput: 'input[aria-label="Unlock code from Mr. D"]', gateButton: 'button:has-text("Unlock")' },
];

const STUB = () => {
  let fs = null;
  const fire = () => document.dispatchEvent(new Event('fullscreenchange'));
  Object.defineProperty(document, 'fullscreenElement', { get: () => fs, configurable: true });
  Element.prototype.requestFullscreen = function () { fs = this; setTimeout(fire, 0); return Promise.resolve(); };
  document.exitFullscreen = function () { fs = null; setTimeout(fire, 0); return Promise.resolve(); };
};

async function open(browser, t, { hash = '', at = t.clockAt, teacher = false } = {}) {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1100, height: 900 } });
  const page = await ctx.newPage(); page.setDefaultTimeout(6000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.route(/fonts\./, r => r.abort());
  await page.addInitScript(STUB);
  if (teacher) await page.addInitScript(() => { window.__TEACHER__ = true; });
  await page.clock.install({ time: new Date(at) });
  await page.goto(ORIGIN + t.url + hash);
  return { ctx, page, errors };
}
const fsOn = page => page.evaluate(() => !!document.fullscreenElement);
const overlay = page => page.locator('.ll-ov');

async function run(browser, t) {
  const fails = [], who = t.student || 'Lockie';
  const check = (cond, msg) => { if (!cond) fails.push(msg); };

  // 1. the lock engages, one exit warns, the second locks, codes free the student
  {
    const { ctx, page, errors } = await open(browser, t);
    await t.begin(page); await page.waitForTimeout(150);
    check(await fsOn(page), 'fullscreen did not start from the Start click');
    check(await page.evaluate(() => LessonLock.stats().exits) === 0, 'exit counter should start at 0');
    await page.evaluate(() => document.exitFullscreen()); await page.waitForTimeout(200);
    check(await overlay(page).count() === 1, 'leaving fullscreen did not cover the lesson');
    check(/exit 1/i.test(await overlay(page).innerText()), 'first exit should show the warning');
    await page.clock.runFor(9000);
    await page.click('.ll-ov button:has-text("Go back to the lesson")'); await page.waitForTimeout(150);
    check(await overlay(page).count() === 0 && await fsOn(page), 'could not return after the wait');
    await page.evaluate(() => document.exitFullscreen()); await page.waitForTimeout(200);
    check(/Locked/i.test(await overlay(page).innerText()), 'second exit should lock the screen');
    await page.fill('.ll-ov input', '0000'); await page.click('.ll-ov button:has-text("Unlock")');
    check(await overlay(page).count() === 1, 'a wrong code unlocked the screen');
    const code = await page.evaluate((w) => LessonLock.unlockCode(w, 2), who);
    await page.fill('.ll-ov input', code); await page.click('.ll-ov button:has-text("Unlock")'); await page.waitForTimeout(150);
    check(await overlay(page).count() === 0, 'the student code did not unlock');
    await page.evaluate(() => document.exitFullscreen()); await page.waitForTimeout(200);
    await page.fill('.ll-ov input', await page.evaluate(() => LessonLock.overrideCode())); await page.click('.ll-ov button:has-text("Unlock")'); await page.waitForTimeout(150);
    check(await overlay(page).count() === 0, 'the unlock-any-student code did not unlock');
    check(errors.length === 0, 'JS errors: ' + errors.join(' | '));
    await ctx.close();
  }

  // 2. closing the page and reopening asks for a code (same browser storage)
  {
    const { ctx, page } = await open(browser, t);
    await t.begin(page); await page.waitForTimeout(150);
    if (t.saveMs) await page.clock.runFor(t.saveMs);   // the lab autosaves on a timer
    await page.reload(); await page.waitForTimeout(900);
    if (t.reopen) { await t.reopen(page); await page.waitForTimeout(300); }
    const input = t.gateInput || 'input[aria-label="Unlock code from Mr. D"]', unlockBtn = t.gateButton || 'button:has-text("Unlock")';
    check(await page.locator(input).count() > 0, 'reopening the page did not ask for a code');
    const n = await page.evaluate(() => LessonLock.lockNo());
    const code = await page.evaluate(([w, k]) => LessonLock.unlockCode(w, k), [who, n]);
    await page.fill(input, code); await page.click(unlockBtn); await page.waitForTimeout(200);
    check(await fsOn(page), 'the right code did not return the student to fullscreen');
    await ctx.close();
  }

  // 3. never locked: #key, after 3 PM, and with the #nolock link
  const never = [t.teacherBuild ? ['the teacher build', { teacher: true }] : ['#key', { hash: '#key' }], ['after the bell', { at: '2026-10-21T16:00:00-04:00' }]];
  for (const [label, opt] of never) {
    const { ctx, page } = await open(browser, t, opt);
    if (label === '#key' || label === 'the teacher build') { await page.waitForTimeout(150); check(await overlay(page).count() === 0 && !(await fsOn(page)), label + ' should never lock'); }
    else { await t.begin(page); await page.waitForTimeout(150); check(!(await fsOn(page)), label + ' should not lock'); }
    await ctx.close();
  }
  {
    const probe = await open(browser, t); const off = await probe.page.evaluate(() => LessonLock.offCode()); await probe.ctx.close();
    const { ctx, page } = await open(browser, t, { hash: '#nolock=' + off });
    await t.begin(page); await page.waitForTimeout(150);
    check(!(await fsOn(page)), '#nolock=<code> should switch the lock off');
    await ctx.close();
  }
  return fails;
}

(async () => {
  const only = process.argv[2];
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  let bad = 0;
  for (const t of TARGETS.filter(x => !only || x.name.includes(only))) {
    let fails; try { fails = await run(browser, t); } catch (e) { fails = ['threw: ' + e.message.split('\n').slice(0, 4).join(' | ')]; }
    console.log((fails.length ? 'FAIL ' : 'ok   ') + t.name); fails.forEach(f => console.log('       - ' + f)); bad += fails.length;
  }
  await browser.close();
  console.log(bad ? bad + ' problem(s)' : 'all locked-mode targets pass'); process.exit(bad ? 1 : 0);
})();
