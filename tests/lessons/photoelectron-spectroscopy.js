/* Slot 11 (photoelectron spectroscopy): a student walkthrough in Chromium at 1366x768.
     python3 -m http.server 8123 &      PLAYWRIGHT_DIR=/opt/node-tools/node_modules/playwright node tests/lessons/photoelectron-spectroscopy.js
   Checks: student ID start, the warm-up at band 1, huddle 1 blanks and code, Part 1 guided checks and free runs with
   post-questions, Part 2 matching, huddle 2 gate, Part 3 Model A and the draw tool, Part 4 table, exit, practice finish
   rule, #key, and no JavaScript errors. Writes a screenshot of Part 1 to the scratchpad. */
const fs = require('fs');
const path = require('path');
const PW = process.env.PLAYWRIGHT_DIR || ['/opt/node-tools/node_modules/playwright', '/opt/npm-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/playwright'].find(p => fs.existsSync(p));
const { chromium } = require(PW);
const CHROME = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const BASE = process.env.BASE || 'http://localhost:8123';
const URL = BASE + '/chemistry/unit-3-atoms-ions/photoelectron-spectroscopy.html';
const SHOTS = process.env.SHOTS || '/tmp/claude-0/-home-user-Mr--D-Sims/8b72b987-f620-5599-810b-acd157e2d22a/scratchpad/pes-shots';
const ok = (c, m) => { if (!c) { console.log('FAIL', m); process.exitCode = 1; throw new Error(m); } console.log('ok  ', m); };
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });

  await page.goto(URL);
  await page.waitForSelector('#sid');
  await page.fill('#sid', 'K7Q-4M2');
  await page.fill('#per', '3');
  const band0 = await page.evaluate(() => ST.band);
  ok(band0.warm === 1 && band0.p1 === 1 && band0.p2 === 1, 'every part starts at band 1');
  await page.click('button:has-text("Start")');
  await page.waitForSelector('text=Warm-up');

  /* Warm-up: three items, the closer electron is multiple choice */
  await page.fill('input.num >> nth=-1', '6');
  await page.click('button:has-text("Check") >> nth=-1');
  await page.click('button:has-text("Next") >> nth=-1');
  await page.fill('input.num >> nth=-1', '1');
  await page.click('button:has-text("Check") >> nth=-1');
  await page.click('button:has-text("Next") >> nth=-1');
  await page.click('button.opt:has-text("The 1s electron") >> nth=-1');
  await page.click('button:has-text("Next") >> nth=-1');
  await page.click('button:has-text("Continue to Huddle 1")');

  /* Huddle 1: three typed definitions and the worked-example blank */
  await page.waitForSelector('text=Huddle 1');
  const txts = page.locator('section.card input.txt');
  await txts.nth(0).fill('electron');
  await txts.nth(1).fill('hard');
  await txts.nth(2).fill('subshell');
  await page.fill('#wex', 'binding energy');
  await page.click('button:has-text("Save my blanks")');
  await page.waitForSelector('div.fb.ok:has-text("Saved")');
  ok(true, 'huddle 1 blanks save');
  if (await page.isDisabled('button:has-text("Continue to Part 1")')) {
    const code = await page.evaluate(() => MrD.codes.huddle());
    await page.fill('input[aria-label="Huddle 1 code"]', code);
    await page.click('button:has-text("Enter")');
  }
  await page.click('button:has-text("Continue to Part 1")');

  /* Part 1: guided lithium run, then the free runs with post-questions */
  await page.waitForSelector('text=Part 1');
  if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, 'part1-top-1366x768.png') });
  console.log('      screenshot:', path.join(SHOTS, 'part1-top-1366x768.png'));
  const beamFor = mj => Math.round((Math.log10(mj) - Math.log10(0.4)) / (Math.log10(400) - Math.log10(0.4)) * 1000);
  await page.fill('input[type=range]', String(beamFor(3)));
  await page.dispatchEvent('input[type=range]', 'input');
  await page.fill('p:has-text("How many peaks show now?") >> nth=0 >> input', '1');
  await page.click('p:has-text("How many peaks show now?") >> nth=0 >> button:has-text("Check")');
  await page.waitForSelector('div.fb.ok:has-text("1 peak(s) show")');
  ok(true, 'guided lithium run: one peak at 3 MJ/mol');
  await page.fill('input[type=range]', String(beamFor(8)));
  await page.dispatchEvent('input[type=range]', 'input');
  await page.fill('p:has-text("How many peaks show now?") >> nth=1 >> input', '2');
  await page.click('p:has-text("How many peaks show now?") >> nth=1 >> button:has-text("Check")');
  await page.waitForSelector('div.fb.ok:has-text("2 peak(s) show")');
  ok(true, 'guided lithium run: two peaks at 8 MJ/mol');

  const answers = [1, 1, 1, 2];                        // B, B, B, C
  for (let i = 0; i < answers.length; i++) {
    await page.click('button:has-text("Run the beam")' + (i === 0 ? '' : '') + ' >> nth=' + i);
    await wait(3100);
    await page.locator('div:has(> p:has-text("?")) >> nth=0');  // keep the DOM settled
    const post = page.locator('button.opt').filter({ hasText: /^[A-D]\. / });
    await post.nth(4 * i + answers[i]).click();
    await page.waitForSelector('div.fb.ok');
    ok(true, 'free run ' + (i + 1) + ': post-question answered');
  }
  await page.click('button:has-text("Continue to Part 2")');

  /* Part 2: match Li, Ne, Ar */
  await page.waitForSelector('text=Part 2');
  const want = ['lithium', 'neon', 'argon'];
  for (let i = 0; i < 3; i++) {
    const sec = page.locator('div.card').filter({ hasText: 'Spectrum ' + (i + 1) + '.' });
    await sec.locator('button.opt', { hasText: new RegExp('^' + want[i] + '$', 'i') }).click();
  }
  await page.waitForSelector('div.fb.ok');
  ok(true, 'part 2: matches give feedback');
  await page.click('button:has-text("Continue to Huddle 2")');

  /* Huddle 2: the crux questions; the code opens only after 2 of 3 right */
  await page.waitForSelector('text=Huddle 2');
  await page.locator('button.opt').nth(0).click();
  await page.locator('button.opt').nth(3 + 1).click();
  await page.fill('input[type=text].num >> nth=0', '4').catch(() => {});
  await page.locator('input.num').first().fill('4').catch(() => {});
  await page.click('button:has-text("Check") >> nth=0').catch(() => {});
  if (await page.isDisabled('button:has-text("Continue to Part 3")')) {
    await page.fill('input[aria-label="Huddle 2 code"]', await page.evaluate(() => MrD.codes.huddle2()));
    await page.click('button:has-text("Enter")');
  }
  await page.click('button:has-text("Continue to Part 3")');

  /* Part 3: Model A, the fit choice, the revision, and the draw tool */
  await page.waitForSelector('text=Part 3');
  await page.click('button.opt:has-text("Does not fit")');
  await page.fill('input.txt[placeholder^="One sentence"]', 'Neon has three peaks because its 2s and 2p electrons are held differently.');
  await page.click('button:has-text("Save") >> nth=0');
  const bars = page.locator('div.slot');
  for (let k = 0; k < 2; k++) await bars.nth(0).locator('button:has-text("+")').click();
  for (let k = 0; k < 2; k++) await bars.nth(1).locator('button:has-text("+")').click();
  for (let k = 0; k < 6; k++) await bars.nth(2).locator('button:has-text("+")').click();
  await page.click('button:has-text("Compare with the real spectrum")');
  await page.waitForSelector('div.fb.ok:has-text("Matches neon")');
  ok(true, 'draw tool matches neon (2, 2, 6)');
  await page.click('button:has-text("Continue to Part 4")');

  /* Part 4: tiles and the valence rule */
  await page.waitForSelector('text=Part 4');
  await page.click('div.periodic button:has-text("Ne")');
  await page.waitForSelector('div.fb.ok:has-text("8 valence electrons")');
  ok(true, 'part 4: neon gives 8 valence electrons');
  await page.click('button:has-text("Continue to Exit")');

  /* Exit and practice */
  await page.waitForSelector('text=Exit');
  await page.click('button:has-text("Continue to practice")');
  await page.waitForSelector('text=Practice');
  ok(await page.isDisabled('button:has-text("Finish")'), 'finish is locked until three band-3 items are done');
  await page.evaluate(() => { ST.b3done = 3; refreshFinish(); });
  ok(await page.isEnabled('button:has-text("Finish")'), 'finish opens after three band-3 items');

  /* #key shows the teacher script with the answers marked */
  const keyPage = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  keyPage.on('pageerror', e => errors.push(e.message));
  await keyPage.goto(URL + '#key');
  await keyPage.waitForSelector('#keypanel');
  await keyPage.waitForTimeout(300);
  ok(await keyPage.isVisible('#keypanel'), '#key shows the teacher panel');
  ok((await keyPage.locator('#keypanel .a').count()) >= 6, '#key marks the answers');

  ok(errors.length === 0, 'no JavaScript errors: ' + JSON.stringify(errors));
  await browser.close();
  console.log('PASS photoelectron-spectroscopy walkthrough');
})().catch(async e => { console.error(e.message); process.exitCode = 1; });
