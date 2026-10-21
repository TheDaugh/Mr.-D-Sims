/* Drive a whole guided lesson in Chromium at a chosen starting band. Needs: playwright, a static server at the repo root.
     python3 -m http.server 8123 &
     node tests/e2e-lesson.js newtons-second-law 1 2 3 4        (add KEY=1 to run in #key mode)
   Generic steps (start, warm-up, predict, huddle, name, try, check, notes) are driven from each lesson's own debug hooks.
   Only Investigate is lesson-specific: tests/lessons/<id>.js exports investigate(page, helpers, band). */
const path = require('path'), fs = require('fs');
const { chromium } = require(process.env.PLAYWRIGHT_DIR || '/opt/npm-tools/node_modules/playwright');
const [lessonId, ...bandArgs] = process.argv.slice(2);
const spec = require('./lessons/' + lessonId + '.js');
const BASE = (process.env.BASE || 'http://localhost:8123') + '/physics/lessons/' + lessonId + '.html';
const OUT = process.env.OUT || path.join(require('os').tmpdir(), 'e2e-' + lessonId); fs.mkdirSync(OUT, { recursive: true });
const TEXT = 'Friction is an unbalanced external net force on the book so its velocity changes and this does not contradict the first law at all.';

async function solveVisible(page) {
  return page.evaluate(TEXT => { let n = 0;
    document.querySelectorAll('.q[data-qid]').forEach(box => {
      const id = box.dataset.qid, q = LE.debug.qs[id], st = LE.qs(id); if (!q || (st && st.done)) return;
      if (q.type === 'choice') { const b = box.querySelector('.opt[data-i="' + q.answer + '"]'); if (b && !b.disabled) { b.click(); n++; } }
      else if (q.type === 'num') { const inp = box.querySelector('input'), btn = box.querySelector('button.btn'); if (inp && !inp.disabled) { inp.value = String(+Number(q.answer).toPrecision(6)); btn.click(); n++; } }
      else if (q.type === 'cloze') { box.querySelectorAll('input.blank').forEach((x, k) => { x.value = q.blanks[k][0]; }); box.querySelector('button.btn').click(); n++; }
      else if (q.type === 'text') { const ta = box.querySelector('textarea'); if (ta && !ta.disabled) { ta.value = TEXT + ' ' + TEXT; ta.dispatchEvent(new Event('input')); const bt = box.querySelector('button.primary'); if (!bt.disabled) { bt.click(); n++; } } }
    }); return n; }, TEXT);
}
async function run(band) {
  const key = !!process.env.KEY, tag = 'band' + band + (key ? '-key' : '');
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await (await br.newContext({ reducedMotion: 'reduce', viewport: { width: 1100, height: 900 } })).newPage(); page.setDefaultTimeout(6000);
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.route(/fonts\./, r => r.abort());
  const h = { solveAll: async () => { for (let k = 0; k < 40; k++) { if (!(await solveVisible(page))) break; await page.waitForTimeout(60); } } };
  const next = async () => { global.__step = await page.evaluate(() => LE.S().step); const b = page.locator('#btn-next'); await b.waitFor({ state: 'visible' }); if (await b.isDisabled()) throw new Error('Continue disabled at ' + await page.evaluate(() => LE.S().step)); await b.click(); await page.waitForTimeout(80); };
  const codeIf = async (label, key) => { if (await page.locator(`input[aria-label="${label}"]`).count()) { await page.fill(`input[aria-label="${label}"]`, await page.evaluate(([i, k]) => LE.codeFor(i, k), [lessonId, key])); await page.click('button:has-text("Enter code")'); await page.waitForTimeout(100); } };
  await page.clock.install({ time: new Date('2026-10-21T09:00:00-04:00') }); // a Wednesday 9:00: class in session, before the end mark, codes asked
  await page.goto(BASE + (key ? '#key' : ''));
  await page.fill('input[aria-label="First name"]', 'T' + band); await page.fill('input[aria-label="Class period"]', '3'); await next();
  const want = { 1: 0, 2: 2, 3: 4, 4: 5 }[band]; // warm-up: answer wrong on the questions beyond the number we want right
  for (const id of ['W1', 'W2', 'W3', 'W4', 'W5'].slice(want)) await page.evaluate(id => { const box = document.querySelector('.q[data-qid="' + id + '"]'), q = LE.debug.qs[id]; const i = q.options.findIndex((_, i) => i !== q.answer); box.querySelector('.opt[data-i="' + i + '"]').click(); }, id);
  await h.solveAll();
  const b0 = await page.evaluate(() => LE.S().band0); if (b0 !== band) throw new Error('wanted band ' + band + ', got ' + b0);
  await next();
  for (let i = 0; i < 3; i++) { await page.click(`input[name=p${i}] >> nth=1`); await page.click(`input[name=c${i}][value="3"]`); await page.fill(`textarea[aria-label="Reason for prediction ${i + 1}"]`, 'Because I think a bigger push means a bigger speed'); }
  for (let i = 0; i < 3; i++) await page.locator('button', { hasText: 'Lock this prediction' }).first().click();
  await next();
  await spec.investigate(page, h, band); await next();
  await codeIf('Class code', 'h1'); await h.solveAll(); await next();
  await h.solveAll();
  await page.evaluate(ns => { document.querySelectorAll('.fbdbox .cell').forEach(cell => { const sc = window[ns].fbdScenes.find(s => cell.textContent.includes(s.title)); if (!sc) return; const cbs = cell.querySelectorAll('input[type=checkbox]'); if (!cbs.length) return; window[ns].fbdForces.forEach((f, i) => { if (sc.need.includes(f.k)) cbs[i].checked = true; }); cell.querySelector('button').click(); }); }, spec.ns);
  await page.waitForTimeout(100); await h.solveAll(); await next();
  for (let i = 0; i < 6; i++) { await h.solveAll(); await page.locator('.nextq button').click(); await page.waitForTimeout(60); }
  const path = await page.evaluate(() => LE.S().d.try.log.map(x => x.band + ':' + x.misses).join(' ')); await next();
  await codeIf('Second class code', 'h2'); await h.solveAll();
  await page.click('input[name=cfC1][type=radio] >> nth=1'); await page.click('input[name=cfC2][type=radio] >> nth=2'); await next();
  let practice = 0;
  if (!key) { for (let k = 0; k < 2; k++) { await h.solveAll(); await page.locator('.nextq button').first().click(); await page.waitForTimeout(80); practice++; } if (await page.locator('.stamp').count()) throw new Error('stamp showed before the end mark'); }
  else if (!(await page.locator('.stamp').count())) throw new Error('no stamp in key mode');
  await page.click('button:has-text("View my notes")'); await page.waitForTimeout(150);
  fs.writeFileSync(path_(tag + '.tex'), await page.evaluate(() => LE.buildTex()));
  await page.screenshot({ path: path_(tag + '-notes.png'), fullPage: true });
  await br.close();
  function path_(n) { return require('path').join(OUT, n); }
  return { band, path, practice, errors };
}
(async () => { let fail = 0; for (const b of (bandArgs.length ? bandArgs.map(Number) : [1, 2, 3, 4])) { try { const r = await run(b); console.log('band', b, r.errors.length ? 'JS ERRORS ' + JSON.stringify(r.errors) : 'OK', '| band path', r.path); if (r.errors.length) fail = 1; } catch (e) { fail = 1; console.log('band', b, 'FAILED at', global.__step, '-',  e.message.split('\n').slice(0,3).join(' ')); } } console.log('output in', OUT); process.exit(fail); })();
