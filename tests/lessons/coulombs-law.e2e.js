/* Slot 7 (coulombs-law): a student walkthrough in Chromium at 1366×768, once per route (standard, scaffolded, fluent).
     python3 -m http.server 8123 &      node tests/lessons/coulombs-law.e2e.js
   Checks: ID entry, the 8-item check and its hidden routing, every part's blocks, the sim tables, the gate code, the closing ladder,
   practice, the journal, the stamp, typed-response logging, and no JavaScript errors. Pinned to Wednesday 9:00 AM (home mode). */
const fs = require('fs');
const PW = process.env.PLAYWRIGHT_DIR || ['/opt/node-tools/node_modules/playwright', '/opt/npm-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/playwright'].find(p => fs.existsSync(p));
const { chromium } = require(PW);
const CHROME = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const URL = (process.env.BASE || 'http://localhost:8123') + '/chemistry/unit-3-atoms-ions/coulombs-law.html';
const ok = (c, m) => { if (!c) { console.log('FAIL', m); process.exitCode = 1; throw new Error(m); } console.log('ok  ', m); };

/* In-page helpers, run through page.evaluate. They use real clicks and input events. */
const H = {
  click: (root, text) => { const b = [...root.querySelectorAll('button')].find(x => !x.disabled && x.textContent.trim().startsWith(text)); if (!b) return false; b.click(); return true; },
  setv: (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); },
};
async function solve(page, k) {   // solve card k of the current part
  return page.evaluate(async ([k]) => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const click = (root, text) => { const b = [...root.querySelectorAll('button')].find(x => !x.disabled && x.textContent.trim().startsWith(text)); if (!b) throw new Error('no button ' + text); b.click(); };
    const setv = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
    const card = __qa.cards()[k], b = card._b, strip = s => String(s).replace(/<[^>]+>/g, '');
    if (b.type === 'mcq') {
      const labels = [...card.querySelectorAll('.opts label')], want = b.predict ? 0 : labels.findIndex(l => l.textContent.trim() === strip(b.opts.find(o => o.ok).t).trim());
      const i = b.predict ? 0 : want; if (i < 0) throw new Error('no ok label'); labels[i].querySelector('input').click(); click(card, b.predict ? 'Lock' : 'Check');
    } else if (b.type === 'num') { setv(card.querySelector('input'), String(b.ans)); click(card, 'Check'); }
    else if (b.type === 'numpred') { setv(card.querySelector('input'), '10'); click(card, 'Lock'); }
    else if (b.type === 'cloze') { [...card.querySelectorAll('select')].forEach((s, i) => { s.value = b.items[i].a; }); click(card, 'Check'); }
    else if (b.type === 'open') { setv(card.querySelector('textarea'), 'Doubling the distance makes the force one quarter, and a doubled charge doubles it.'); click(card, 'Save'); }
    else if (b.type === 'gate2') {
      [...card.querySelectorAll('label')][1].querySelector('input').click(); click(card, 'Lock in');
      await wait(30); const inp = card.parentNode.querySelector('input[maxlength="4"]'); if (inp) { setv(inp, MrD.codes.gate('coulombs-law', 'h1')); click(card.parentNode, 'Unlock'); }
    }
    else if (b.type === 'widget') {
      const sl = card.querySelector('input[type=range]');
      const rec = () => click(card, 'Record this run'), segs = [...card.querySelectorAll('.seg')];
      const guess = card.querySelector('input[aria-label="My guess for the force"]'), F = () => { const t = card.querySelector('.scene text:last-of-type'); return t; };
      const fixRatios = () => { const rows = [...card.querySelectorAll('tbody tr')]; const f = r => parseFloat(r.children[r.children.length - 3 + ((card.querySelector('thead').textContent.includes('My guess')) ? 0 : 1)].textContent);
        const head = [...card.querySelectorAll('thead th')].map(t => t.textContent), fi = head.indexOf('Force (units)'), f0 = parseFloat(rows[0].children[fi].textContent);
        rows.forEach((r, i) => { if (i === 0) return; const inp = r.querySelector('input'); if (inp.disabled) return; setv(inp, String(parseFloat(r.children[fi].textContent) / f0)); }); click(card, 'Check my ratios'); };
      if (b.id === 'hook') { setv(sl, 1); setv(sl, 6); }
      else if (b.id === 'coulomb') {
        const flu = !!guess, g = v => { if (guess) setv(guess, String(v)); };
        if (b.cfg.exp === 'dist') { for (const r of [1, 2, 3]) { setv(sl, r); g(36 / (r * r)); rec(); } fixRatios(); }
        else if (b.cfg.exp === 'charge') { for (const q of [1, 2, 3]) { [...segs[0].querySelectorAll('button')][q - 1].click(); g(36 * q); rec(); } fixRatios(); }
        else { rec(); setv(sl, 2); [...segs[0].querySelectorAll('button')][1].click(); g(18); rec(); [...segs[1].querySelectorAll('button')][1].click(); g(36); rec(); fixRatios(); }
      } else if (b.id === 'shell') {
        const ions = [...segs[0].querySelectorAll('button')], shells = [...segs[1].querySelectorAll('button')], gi = card.querySelector('input[aria-label="My guess for the pull"]');
        for (const [i, n, a] of [[0, 2, '1/16'], [0, 3, '1/81'], [1, 1, '2'], [2, 1, '3']]) { ions[i].click(); shells[n - 1].click(); setv(gi, a); click(card, 'Check my guess'); }
      } else if (b.id === 'zeff') { setv(sl, 2); }
    }
    else if (b.type === 'ladder') { /* driven by the test loop below */ }
    else if (b.type === 'cer') { card.querySelectorAll('textarea').forEach(t => setv(t, 'Shell 1 is 81 times harder, since the distance is 9 times smaller.')); click(card, 'Save'); }
    return b.type;
  }, [k]);
}
async function run(route) {
  const br = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await (await br.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push(m.text()); });
  await page.route(/fonts\./, r => r.abort());
  await page.clock.install({ time: new Date('2026-10-21T09:00:00-04:00') });
  await page.goto(URL); await page.waitForTimeout(300);
  console.log('--- route', route);
  const id = await page.evaluate(() => MrD.ids.derive('testsecret', 'Test Student', '3'));
  await page.fill('#mrd-id', id); await page.fill('#mrd-period', '3'); await page.click('text=Start →');
  ok(await page.isVisible('text=Push and Pull check'), 'check screen opens');
  // the check: answer by tag
  const pick = { std: { c1: 'inv', c2: 'inv' }, scaf: { c1: 'lin', c2: 'lin' }, fluent: {} }[route];
  for (let i = 0; i < 8; i++) {
    const it = await page.evaluate(i => ({ q: document.querySelector('#app .q').textContent, i }), i);
    const isTable = await page.$('#app table.wtbl');
    if (isTable) {
      const vals = await page.evaluate(() => { const q = document.querySelector('#app .q').textContent; return q.includes('36') ? [9, 4, 1] : [12, 18, 36]; });
      const ins = await page.$$('#app table.wtbl input'); for (let j = 0; j < ins.length; j++) await ins[j].fill(String(vals[j]));
    } else {
      const choice = await page.evaluate(([i, pick]) => { const C = CoulombPractice.CHECK, ids = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'], it = C[i]; const want = pick[it.id] || 'ok'; return it.opts.find(o => o.tag === want).t; }, [i, pick]);
      await page.click(`#app .opts label:has-text("${choice.replace(/"/g, '\\"')}")`, { strict: false }).catch(async () => { const ls = await page.$$('#app .opts label'); for (const l of ls) if ((await l.textContent()).trim() === choice) { await l.click(); break; } });
    }
    await page.click('#app button:has-text("' + (i < 7 ? 'Next' : 'Finish') + '")');
  }
  ok(await page.isVisible('text=Check saved'), 'check saved');
  ok(!(await page.textContent('#app')).match(/route|scaffold|fluent|linear/i), 'no route labels shown to the student');
  const got = await page.evaluate(() => __qa.ST.route); ok(got === route, 'routed to ' + route + ' (got ' + got + ')');
  await page.click('text=Start the lesson →');
  // parts 1..7
  for (let p = 0; p < 7; p++) {
    await page.waitForSelector('#app h2');
    const title = await page.textContent('#app h2'); ok(title.startsWith('Part ' + (p + 1)), title);
    let guard = 0, k = 0;
    while (guard++ < 60) {
      const st = await page.evaluate(() => ({ n: __qa.cards().length, nextDisabled: document.querySelector('#app .btn.big').disabled }));
      if (p === 6) break;
      if (!st.nextDisabled) break;
      // solve the first unsolved interactive card
      const t = await page.evaluate(k => { const c = __qa.cards()[k]; return c ? c._b.type : null; }, k);
      if (t == null) { await page.waitForTimeout(50); continue; }
      const type = await solve(page, k); if (process.env.DBG) console.log('  solved', p + 1, k, type, await page.evaluate(() => { const n = document.querySelector('#app .note[aria-live]'); return n ? JSON.stringify(__qa.ST.data.dist) + n.textContent + ' | ' + [...document.querySelectorAll('.task')].map(t => t.className).join(',') : ''; })); await page.waitForTimeout(40); k++;
    }
    if (p === 6) {
      await page.waitForTimeout(100);
      const levels = [];
      for (let n = 0; n < 6; n++) {
        const spec = await page.evaluate(() => window.__spec); if (!spec || !(await page.$('#app .card input[type=text]:not([disabled])'))) break;
        const nextExists = await page.$('#app button:has-text("Next →")');
        const before = await page.evaluate(() => document.querySelectorAll('#app .card').length);
        await page.evaluate(a => { const inps = [...document.querySelectorAll('#app .card input[type=text]')].filter(x => !x.disabled); const inp = inps[inps.length - 1]; inp.value = String(a); [...inp.closest('.card').querySelectorAll('button')].find(b => b.textContent === 'Check').click(); }, spec.ans);
        levels.push(spec.band);
        const nb = await page.$('#app button:has-text("Next →")'); if (!nb) break; await nb.click();
        if (await page.$('#app .card textarea')) break;
      }
      ok(levels.length >= 2, 'closing ladder ran: bands ' + levels.join(','));
      ok(levels[0] === { scaf: 1, std: 2, fluent: 3 }[route], 'ladder starts at the hidden band for ' + route);
      await page.waitForSelector('#app textarea');
      const cards = await page.evaluate(() => __qa.cards().length);
      await page.evaluate(() => { const t = [...document.querySelectorAll('#app textarea')]; t.forEach(x => { x.value = 'Shell 1 is 81 times harder, since the distance is 9 times smaller.'; x.dispatchEvent(new Event('input', { bubbles: true })); }); [...document.querySelectorAll('#app button')].find(b => b.textContent.startsWith('Save my argument')).click(); });
      await page.waitForTimeout(80);
    }
    await page.click('#app .btn.big:has-text("→")');
  }
  ok(await page.isVisible('h2:has-text("Takeaways")'), 'home mode goes straight to the takeaways (class mode would open practice first)');
  await page.evaluate(() => __qa.showPractice());
  for (let n = 0; n < 3; n++) { const sp = await page.evaluate(() => window.__spec); await page.evaluate(a => { const inp = [...document.querySelectorAll('#app input[type=text]')].filter(x => !x.disabled).pop(); inp.value = String(a); [...inp.closest('.card').querySelectorAll('button')].find(b => b.textContent === 'Check').click(); }, sp.ans); await page.click('#app button:has-text("Next problem")'); }
  ok(true, 'three practice problems answered');
  await page.evaluate(() => __qa.showTakeaways());
  await page.evaluate(() => { const rows = document.querySelectorAll('#app .card')[0]; const sels = [...rows.querySelectorAll('select')], want = ['× ¼', '× 1⁄9', '× 2', '× 4', '× ½']; sels.forEach((s, i) => { s.value = [...s.options].findIndex(o => o.textContent === want[i]) - 1; s.value = String([...s.options].findIndex(o => o.textContent === want[i]) - 1); }); });
  // selects hold the option VALUE (index); set by index above. Check it, then the open + journal.
  await page.evaluate(() => { [...document.querySelectorAll('#app .card')[0].querySelectorAll('button')].find(b => b.textContent === 'Check').click(); });
  await page.evaluate(() => { const c = document.querySelectorAll('#app .card')[1], t = c.querySelector('textarea'); t.value = 'A near electron is held harder because the force falls off with distance squared.'; t.dispatchEvent(new Event('input', { bubbles: true })); [...c.querySelectorAll('button')].find(b => b.textContent === 'Save my answer').click(); });
  await page.waitForSelector('#app .card:nth-of-type(3)');
  await page.evaluate(() => { const c = [...document.querySelectorAll('#app .card')].find(x => x.textContent.includes('Atom journal')); const ins = [...c.querySelectorAll('input[type=text]')]; ins.forEach(i => { if (!i.value) i.value = 'Doubling the distance makes the force one quarter.'; i.dispatchEvent(new Event('input', { bubbles: true })); }); ins.forEach(i => { i.value = i.value || 'x'; i.dispatchEvent(new Event('input', { bubbles: true })); }); c.querySelector('.seg button:nth-child(3)').click(); [...c.querySelectorAll('button')].find(b => b.textContent === 'Save my journal').click(); });
  await page.click('text=Get my stamp and notes');
  ok(await page.isVisible('.stamp'), 'stamp shown');
  const stamp = await page.textContent('.stamp .big'); ok(/^✔ COUL-\d{4}$/.test(stamp), 'stamp ' + stamp);
  const info = await page.evaluate(() => ({ typed: __qa.ST.typed.length, res: __qa.ST.check.res, kinds: [...new Set(__qa.ST.typed.map(t => t.id.split('-')[0]))] }));
  ok(info.typed > 25, 'typed responses logged: ' + info.typed + ' (' + info.kinds.join(',') + ')');
  const rec = await page.evaluate(() => JSON.stringify(MrD.profile && MrD.profile.all ? MrD.profile.all() : {}).length); 
  await page.evaluate(() => document.getElementById('open-notes').click()); await page.waitForTimeout(200);
  const notes = await page.evaluate(() => document.body.innerText); ok(/Claim, evidence, reasoning/.test(notes) && /Atom journal/.test(notes), 'notes hold CER and journal');
  ok(errs.length === 0, 'no JavaScript errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await br.close();
}
(async () => { for (const r of (process.env.ROUTES || 'std,scaf,fluent').split(',')) await run(r); })().catch(e => { console.error(e); process.exit(1); });
