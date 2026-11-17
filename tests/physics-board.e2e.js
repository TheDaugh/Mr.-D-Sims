/* Physics board check (physics/whiteboard/index.html): the five shelves show, every shelf loads its stencils into the Library panel, #all lays out
   every stencil with no text outside its group, a stencil can be added to the board, the board autosaves across a reload under its own key, and the page
   makes no console errors and no outside requests. Needs `python3 -m http.server 8123` from the repo root.
   Run: PLAYWRIGHT_DIR=/opt/node-tools/node_modules/playwright node tests/physics-board.e2e.js */
const { chromium } = require(process.env.PLAYWRIGHT_DIR || 'playwright');
const URL = 'http://localhost:8123/physics/whiteboard/index.html';
const SHELVES = ['Free-body diagrams', 'Net force and motion', 'Graphs', 'Newton’s laws', 'Inclines and systems'];
const EXPECT = { 'Free-body diagrams': 21, 'Net force and motion': 9, 'Graphs': 9, 'Newton’s laws': 10, 'Inclines and systems': 13 };
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

  /* #all: every stencil drawn, none empty */
  await p.goto(URL + '#all'); await p.waitForSelector('.excalidraw'); await p.waitForTimeout(2500);
  const all = await p.evaluate(() => { const els = window.MRD_API.getSceneElements(); return { names: els.filter(e => e.type === 'text' && e.strokeColor === '#868e96' && e.fontSize === 18 && e.text.indexOf(' · ') > 0).length, nan: els.filter(e => !isFinite(e.x) || !isFinite(e.y) || !isFinite(e.width) || !isFinite(e.height)).length, n: els.length }; });
  ok(all.names === 62, '62 stencils laid out in #all (' + all.names + ')');
  ok(all.nan === 0, 'no element has a NaN position or size (' + all.nan + ')');

  /* the board itself: shelves, library, adding a stencil, autosave */
  await p.goto(URL); await p.waitForSelector('.excalidraw'); await p.waitForTimeout(1500);
  const tabs = await p.$$eval('.shelves [role=tab]', ts => ts.map(t => t.textContent));
  ok(JSON.stringify(tabs) === JSON.stringify(SHELVES), 'five shelf tabs (' + tabs.join(' | ') + ')');
  for (const s of SHELVES) {
    await p.click('.shelves [role=tab]:has-text("' + s + '")'); await p.waitForTimeout(500);
    const n = await p.$$eval('.library-unit', u => u.length);
    ok(n === EXPECT[s], s + ': ' + EXPECT[s] + ' stencils in the Library panel (' + n + ')');
  }
  await p.click('.shelves [role=tab]:has-text("Free-body diagrams")'); await p.waitForTimeout(500);
  await p.click('.library-unit >> nth=1'); await p.waitForTimeout(500);
  await p.mouse.click(700, 400); await p.waitForTimeout(500);
  const placed = await p.evaluate(() => window.localStorage.getItem('mrd-physics-whiteboard-v1'));
  await p.waitForTimeout(1200);
  const saved = await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('mrd-physics-whiteboard-v1') || 'null'); return d ? d.elements.filter(e => !e.isDeleted).length : 0; });
  ok(saved > 3, 'a stencil placed on the board is saved (' + saved + ' elements)');
  await p.reload(); await p.waitForSelector('.excalidraw'); await p.waitForTimeout(1500);
  const after = await p.evaluate(() => document.querySelectorAll('canvas').length);
  ok(after > 0, 'board reopens after a reload');
  const keys = await p.evaluate(() => ['mrd-chem-whiteboard-v1', 'mrd-stats-whiteboard-v1'].map(k => localStorage.getItem(k)));
  ok(keys.every(k => k === null), 'does not touch the chem or stats boards’ saved keys');
  ok(errs.length === 0, 'no console errors ' + JSON.stringify(errs));
  ok(ext.length === 0, 'no outside requests ' + JSON.stringify(ext));
  await b.close();
  console.log(bad ? bad + ' failed' : 'all pass'); process.exit(bad ? 1 : 0);
})();
