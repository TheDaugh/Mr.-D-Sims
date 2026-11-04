/* Lesson board check (stats.html#lesson=3.4): opens, shows every frame, reveals an answer, keeps what you write across a reload,
   and starts over. Needs `python3 -m http.server 8123` from the repo root.
   Run: PLAYWRIGHT_DIR=/opt/node-tools/node_modules/playwright node tests/lesson-board.e2e.js */
const { chromium } = require(process.env.PLAYWRIGHT_DIR || 'playwright');
const URL = 'http://localhost:8123/stats/whiteboard/index.html#lesson=3.4';
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } });
  const p = await ctx.newPage();
  const errs = [], ext = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push(e.message));
  p.on('request', r => { if (!r.url().startsWith('http://localhost:8123')) ext.push(r.url()); });
  p.on('dialog', d => d.accept());
  await p.goto(URL); await p.waitForSelector('.excalidraw'); await p.waitForTimeout(2500);
  const frames = await p.evaluate(() => window.MRD_API.getSceneElements().filter(e => String(e.id).indexOf('lesson-frame-') === 0).length);
  ok(frames === 7, 'seven lesson frames (' + frames + ')');
  const covers = await p.evaluate(() => window.MRD_API.getSceneElements().filter(e => e.backgroundColor === '#ffd8a8' && e.type === 'rectangle').length);
  ok(covers > 20, 'answer covers present (' + covers + ')');
  const x0 = await p.evaluate(() => window.MRD_API.getAppState().scrollX);
  await p.click('.frames button:nth-child(3)'); await p.waitForTimeout(900);
  const x1 = await p.evaluate(() => window.MRD_API.getAppState().scrollX);
  ok(x0 !== x1, 'frame button scrolls the board');
  /* reveal: delete one cover, as the teacher would */
  const cid = await p.evaluate(() => { const e = window.MRD_API.getSceneElements().find(e => e.backgroundColor === '#ffd8a8' && e.type === 'rectangle'); window.MRD_API.updateScene({ elements: window.MRD_API.getSceneElements().map(x => x.id === e.id ? { ...x, isDeleted: true } : x) }); return e.id; });
  await p.waitForTimeout(1200);
  await p.reload(); await p.waitForSelector('.excalidraw'); await p.waitForTimeout(2500);
  const gone = await p.evaluate(id => { const e = window.MRD_API.getSceneElements().find(x => x.id === id); return !e || e.isDeleted; }, cid);
  ok(gone, 'a revealed answer stays revealed after reload');
  const saved = await p.evaluate(() => localStorage.getItem('mrd-stats-lesson-3.4-v1') !== null && localStorage.getItem('mrd-stats-whiteboard-v1') === null);
  ok(saved, 'lesson saves under its own key and leaves the plain stats board alone');
  await p.click('.frames button:last-child'); await p.waitForTimeout(2500);
  const back = await p.evaluate(() => window.MRD_API.getSceneElements().filter(e => e.backgroundColor === '#ffd8a8' && e.type === 'rectangle' && !e.isDeleted).length);
  ok(back === covers, 'Start over redraws the lesson (' + back + ' covers, as at the start)');
  ok(errs.length === 0, 'no console errors ' + JSON.stringify(errs));
  ok(ext.length === 0, 'no outside requests ' + JSON.stringify(ext));
  await b.close();
  console.log(bad ? bad + ' failed' : 'all passed');
  process.exit(bad ? 1 : 0);
})();
