/* Slot 7 live class split: a student's locked gate answer reaches the (mock) worker, and the projector page turns beats into bars.
     python3 -m http.server 8123 &      node tests/lessons/coulombs-law-live.e2e.js */
const fs = require('fs');
const PW = process.env.PLAYWRIGHT_DIR || ['/opt/node-tools/node_modules/playwright', '/opt/npm-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/playwright'].find(p => fs.existsSync(p));
const { chromium } = require(PW);
const BASE = process.env.BASE || 'http://localhost:8123', DIR = BASE + '/chemistry/unit-3-atoms-ions/';
const ok = (c, m) => { if (!c) { console.log('FAIL', m); process.exitCode = 1; throw new Error(m); } console.log('ok  ', m); };
(async () => {
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const mockCfg = r => r.fulfill({ contentType: 'application/javascript', body: 'window.MrD=window.MrD||{};window.MrD.config={liveUrl:"http://mock.test"};' });
  // student side
  const beats = [];
  let ctx = await br.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  await ctx.route('**/shared/config.js', mockCfg);
  await ctx.route('http://mock.test/**', r => { if (r.request().method() === 'POST') beats.push(JSON.parse(r.request().postData())); r.fulfill({ status: 200, body: 'ok', headers: { 'access-control-allow-origin': '*' } }); });
  const s = await ctx.newPage(); const errs = []; s.on('pageerror', e => errs.push(e.message));
  await s.clock.install({ time: new Date('2026-10-21T09:00:00-04:00') });
  await s.goto(DIR + 'coulombs-law.html');
  const id = await s.evaluate(() => MrD.ids.derive('k', 'Live Student', '3'));
  await s.fill('#mrd-id', id); await s.fill('#mrd-period', '3'); await s.click('text=Start →');
  await s.evaluate(() => { __qa.ST.check.res = CoulombPractice.route({ c1: '2 times as big', c2: '3 times as big' }); __qa.showPart(4); document.getElementById('app').append(__qa.BLOCK.gate2({}, () => {})); });
  await s.evaluate(() => { const c = [...document.querySelectorAll('#app .card')].filter(x => x.textContent.includes('Check-in')).pop(); c.querySelectorAll('label')[1].querySelector('input').click(); [...c.querySelectorAll('button')].find(b => b.textContent.startsWith('Lock in')).click(); });
  await s.waitForTimeout(300);
  const last = beats[beats.length - 1];
  ok(last && last.gate === 'B', 'gate answer B reaches the worker immediately (nudge)');
  ok(last.chk && /^\d+,\d+,\d+,\d+$/.test(last.chk), 'check summary sent as lin,inv,invsq,other: ' + last.chk);
  ok(last.first === id, 'only the student ID is sent');
  ok(errs.length === 0, 'no JS errors on the student page');
  // projector side
  const fake = [{ first: 'A1', period: '3', gate: 'B', chk: '2,0,0,0' }, { first: 'A2', period: '3', gate: 'A', chk: '0,2,0,0' }, { first: 'A3', period: '3', gate: 'B', chk: '0,0,1,0' }, { first: 'A4', period: '5', gate: 'D', chk: '1,0,0,0' }, { first: 'A5', period: '5', gate: '', chk: '' }];
  ctx = await br.newContext({ viewport: { width: 1366, height: 768 } });
  await ctx.route('**/shared/config.js', mockCfg);
  await ctx.route('http://mock.test/**', r => r.request().headers()['x-teacher'] === 'tok' ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fake), headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'x-teacher' } }) : r.fulfill({ status: 401, body: 'no', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'x-teacher' } }));
  const b = await ctx.newPage(); const be = []; b.on('pageerror', e => be.push(e.message));
  await b.goto(DIR + 'coulombs-law-board.html'); await b.click('button[data-p=tally]');
  await b.fill('#lt', 'wrong'); await b.click('#lgo'); await b.waitForTimeout(300);
  ok(/Wrong token/.test(await b.textContent('#lmsg')), 'a wrong token is reported');
  await b.fill('#lt', 'tok'); await b.click('#lgo'); await b.waitForTimeout(400);
  const nums = async id => b.$$eval('#' + id + ' .n', e => e.map(x => +x.textContent));
  ok(JSON.stringify(await nums('pulse')) === '[1,2,0,1]', 'class split bars A,B,C,D = 1,2,0,1 got ' + JSON.stringify(await nums('pulse')) + ' msg ' + await b.textContent('#lmsg'));
  ok(JSON.stringify(await nums('errs')) === '[2,1,1,0]', 'error-type bars (students with any): ' + JSON.stringify(await nums('errs')));
  await b.selectOption('#lp', '3'); await b.waitForTimeout(100);
  ok(JSON.stringify(await nums('pulse')) === '[1,2,0,0]', 'period filter works');
  ok(/3 of 3 students/.test(await b.textContent('#lmsg')) || /3 of 3/.test(await b.textContent('#lmsg')), 'status line counts students: ' + await b.textContent('#lmsg'));
  await b.screenshot({ path: process.env.SHOT || '/tmp/live-split.png' });
  ok(be.length === 0, 'no JS errors on the projector page');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
