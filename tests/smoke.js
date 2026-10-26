/* Smoke test: every page a student or teacher opens must load with no JavaScript errors.
   Run from the repo root with a static server:
     python3 -m http.server 8123 &
     node tests/smoke.js              (add  KEY=1  to open each lesson in #key mode as well)
   Reads the lesson list from shared/lessons.js, then adds the hubs, the teacher pages and the portal.
   Playwright and Chromium locations come from PLAYWRIGHT_DIR and CHROMIUM when the defaults are wrong. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const PW = process.env.PLAYWRIGHT_DIR || ['/opt/npm-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/playwright'].find(p => fs.existsSync(p));
const { chromium } = require(PW);
const CHROME = process.env.CHROMIUM || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const BASE = process.env.BASE || 'http://localhost:8123';

function lessonList() {
  const win = { MrD: {} }; win.window = win; vm.createContext(win);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'shared/lessons.js'), 'utf8'), win);
  return win.MrD.lessons || [];
}
const extra = ['index.html', 'physics/index.html', 'chemistry/index.html', 'calculus/index.html', 'teacher/index.html', 'portal/index.html',
  'physics/lessons/teacher.html', 'chemistry/teacher.html'];

(async () => {
  const pages = [];
  lessonList().forEach(l => { pages.push(l.href); if (process.env.KEY) pages.push(l.href + '#key'); if (l.teacher) pages.push(l.teacher); });
  extra.forEach(p => pages.push(p));
  ['arrow', 'elevator', 'friction', 'twoblock', 'rope', 'chain'].forEach(id => pages.push('physics/lessons/sims/' + id + '.html'));   // slot 4 sims
  (process.env.PAGES || '').split(',').filter(Boolean).forEach(p => pages.push(p));
  const seen = new Set(), list = pages.filter(p => !seen.has(p) && seen.add(p) && fs.existsSync(path.join(ROOT, p.split('#')[0])));
  const br = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  let bad = 0;
  for (const p of list) {
    const page = await (await br.newContext({ reducedMotion: 'reduce', viewport: { width: 1366, height: 768 } })).newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
    await page.clock.install({ time: new Date('2026-10-21T09:00:00-04:00') });
    try { await page.goto(BASE + '/' + p, { waitUntil: 'load' }); await page.waitForTimeout(500); } catch (e) { errors.push('load: ' + e.message.slice(0, 100)); }
    console.log((errors.length ? 'FAIL ' : 'ok   ') + p + (errors.length ? '  -> ' + errors.slice(0, 2).join(' | ').slice(0, 200) : ''));
    if (errors.length) bad++;
    await page.context().close();
  }
  await br.close();
  console.log(bad ? `\n${bad} of ${list.length} pages have errors` : `\nall ${list.length} pages load clean`);
  process.exit(bad ? 1 : 0);
})();
