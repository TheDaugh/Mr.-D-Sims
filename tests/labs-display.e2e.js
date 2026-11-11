/* Every lab link on a hub must SHOW its lab, not just return a page.
     python3 -m http.server 8123 &
     TZ=America/New_York node tests/labs-display.e2e.js
   Reads each virtual-lab card from chemistry/labs.js and physics/sims.js, opens the card's own address, and checks: the lab key is one the page knows, the loading
   message is gone, the lab's title is on screen (not the default lab's), the room canvas has painted, and nothing failed to load. An unknown key must say so, not fall back.
   Why: a new lab whose key was not registered (or not merged to main) used to open the default lab, or nothing, and every test that opened the lab by its own key still passed. */
const { chromium } = require(process.env.PLAYWRIGHT_DIR || '/opt/node-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const ORIGIN = process.env.BASE || 'http://localhost:8123', ROOT = path.join(__dirname, '..'), fails = [];
const check = (c, m) => { if (!c) { fails.push(m); console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const cards = [];
for (const [dir, file] of [['chemistry', 'labs.js'], ['physics', 'sims.js']]) {
  const src = fs.readFileSync(path.join(ROOT, dir, file), 'utf8');
  for (const m of src.matchAll(/href:\s*"([^"]*virtual-lab\/index\.html[^"]*)"/g)) cards.push({ dir, href: m[1], url: '/' + dir + '/' + m[1] });
}
(async () => {
  check(cards.length >= 6, 'found ' + cards.length + ' virtual-lab cards on the hubs');
  const browser = await chromium.launch();
  const open = async (url) => { const ctx = await browser.newContext({ timezoneId: 'America/New_York', viewport: { width: 1366, height: 768 } }), page = await ctx.newPage(), bad = [];
    page.on('pageerror', (e) => bad.push(e.message)); page.on('requestfailed', (r) => bad.push('failed ' + r.url())); page.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
    await page.clock.setFixedTime(new Date('2026-11-12T10:45:00-05:00')); await page.goto(ORIGIN + url); await page.waitForTimeout(2200); return { ctx, page, bad }; };
  for (const c of cards) {
    const { ctx, page, bad } = await open(c.url), st = await page.evaluate(() => ({ app: !document.getElementById('app').hidden, boot: !document.getElementById('boot').hidden, title: document.getElementById('title').textContent,
      px: (() => { const cv = document.getElementById('room'); if (!cv || !cv.width) return 0; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 4 * 97) if (d[i]) n++; return n; })() }));
    check(st.app && !st.boot, c.href + ': the lab is on screen');
    check(st.px > 50, c.href + ': the room has painted (' + st.px + ' sampled pixels)');
    check(bad.length === 0, c.href + ': nothing failed to load' + (bad.length ? ' ' + JSON.stringify(bad.slice(0, 3)) : ''));
    c.title = st.title; await ctx.close();
  }
  const seenU = new Set(), uniq = cards.filter((c) => !seenU.has(c.url.split('#')[0]) && seenU.add(c.url.split('#')[0])), titles = uniq.map((c) => c.title); check(new Set(titles).size === titles.length, 'every card opens a different lab (no card falls back to the default lab): ' + titles.map((t) => String(t).slice(0, 24)).join(' | '));
  { const { ctx, page } = await open('/chemistry/virtual-lab/index.html?lab=not-a-lab'); const t = await page.evaluate(() => document.getElementById('boot').textContent);
    check(/There is no lab called "not-a-lab"/.test(t), 'an unknown lab key says so instead of opening another lab'); await ctx.close(); }
  await browser.close(); console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nall passed'); process.exit(fails.length ? 1 : 0);
})();
