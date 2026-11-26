/* teacher/boards.html: the class tabs list the right lesson boards, a frame button opens the board at that frame,
   a second click reuses the same board tab (the board reloads on a hash change), and nothing errors.
   Run (server on 8123 from the repo root): PLAYWRIGHT_DIR=/opt/node-tools/node_modules/playwright node tests/boards-page.e2e.js */
const { chromium } = require(process.env.PLAYWRIGHT_DIR || 'playwright');
const BASE = 'http://localhost:8123/';
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
/* which lesson frame is closest to the middle of the screen */
const onFrame = (p) => p.evaluate(() => {
  const api = window.MRD_API, st = api.getAppState(), cx = window.innerWidth / 2 / st.zoom.value - st.scrollX;
  const fr = api.getSceneElements().filter(e => String(e.id).indexOf('lesson-frame-') === 0);
  let best = null, d = 1e12;
  fr.forEach(e => { const dd = Math.abs(e.x + e.width / 2 - cx); if (dd < d) { d = dd; best = Number(String(e.id).slice(13)); } });
  return best;
});
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1500, height: 950 } });
  const errs = [];
  ctx.on('page', p => p.on('pageerror', e => errs.push(e.message)));
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + 'teacher/boards.html#physics');
  ok(await p.locator('text=Friction').count() > 0, 'physics tab lists the friction board');
  ok(await p.locator('a.btn', { hasText: 'Blank board' }).getAttribute('href') === '../physics/whiteboard/index.html', 'blank physics board link');
  await p.click('button[role=tab]:has-text("Chemistry")');
  ok(/#chem$/.test(p.url()), 'chem tab sets #chem');
  ok(await p.locator('.lesson').count() >= 10, 'chem tab lists the Unit 4 boards (' + await p.locator('.lesson').count() + ')');
  const names = await p.locator('.lesson .name').allTextContents();
  ok(names[0].indexOf('Day 1') === 0 && names.some(n => /^Day 9/.test(n)), 'chem boards in day order');
  await p.fill('#q', 'naming');
  ok(await p.locator('.lesson').count() === 1, 'search narrows the list');
  await p.fill('#q', '');
  await p.click('button[role=tab]:has-text("Calculus")');
  ok(await p.locator('text=No calculus board yet.').count() === 1, 'calculus says there is no board yet');
  await p.click('button[role=tab]:has-text("Physics")');
  const [bp] = await Promise.all([ctx.waitForEvent('page'), p.click('.frames a:has-text("3 Kinetic friction")')]);
  await bp.waitForSelector('.excalidraw'); await bp.waitForTimeout(2500);
  ok(/#lesson=friction&frame=3$/.test(bp.url()), 'frame link opens the friction board at frame 3 (' + bp.url().split('#')[1] + ')');
  ok(await onFrame(bp) === 3, 'the board shows frame 3');
  const pages0 = ctx.pages().length;
  await p.click('.frames a:has-text("4 Solving")'); await bp.waitForTimeout(3500);
  ok(ctx.pages().length === pages0, 'a second click reuses the board tab');
  ok(/frame=4$/.test(bp.url()) && await onFrame(bp) === 4, 'the reused tab moved to frame 4');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close();
  console.log(bad ? bad + ' failed' : 'all passed'); process.exit(bad ? 1 : 0);
})();
