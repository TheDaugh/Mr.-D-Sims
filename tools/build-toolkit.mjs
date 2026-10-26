#!/usr/bin/env node
/* One-page printable stats toolkit: the six-move routine, the worked example, and the full z-table (every cell computed by NK, none typed).
     node tools/build-toolkit.mjs            writes stats/shared/toolkit.html and keys/stats/toolkit.pdf
   The PDF is printed from Chromium (Playwright), so no LaTeX is needed. Set PLAYWRIGHT_DIR / CHROMIUM when the defaults are wrong. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url);
const NK = require(path.join(ROOT, 'stats/shared/normal-kit.js'));
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const cellText = v => v.toFixed(4).replace(/^0/, '');

function tableHtml(rows) {
  let h = '<table><thead><tr><th>z</th>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => '<th>.0' + c + '</th>').join('') + '</tr></thead><tbody>';
  for (const r of rows) h += '<tr><th>' + esc(r.label) + '</th>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => '<td>' + cellText(NK.table.cell(r, c)) + '</td>').join('') + '</tr>';
  return h + '</tbody></table>';
}
const w = NK.workedExample();
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Stats toolkit · Mr. D</title>
<style>
@page{size:Letter;margin:.35in}
*{box-sizing:border-box}body{margin:0;font:9.5pt/1.3 system-ui,"Helvetica Neue",Arial,sans-serif;color:#111}
h1{font-size:15pt;margin:0 0 2pt}h2{font-size:10.5pt;margin:6pt 0 2pt}.sub{margin:0 0 4pt;color:#444}
.top{display:grid;grid-template-columns:1fr 1fr;gap:12pt}
ol.r{list-style:none;margin:0;padding:0;counter-reset:n}ol.r li{counter-increment:n;padding:2pt 0 2pt 18pt;position:relative}
ol.r li::before{content:counter(n);position:absolute;left:0;top:2pt;width:12pt;height:12pt;border-radius:50%;background:#2b4fd9;color:#fff;font:700 8pt/12pt sans-serif;text-align:center}
.ex ol{margin:0;padding-left:14pt}.ex li{margin:1.5pt 0}
.tables{display:grid;grid-template-columns:1fr 1fr;gap:10pt;margin-top:4pt}
table{border-collapse:collapse;width:100%;font:7.4pt/1 ui-monospace,Menlo,Consolas,monospace;text-align:center}
th,td{border:.4pt solid #999;padding:1.5pt 0}thead th,tbody th{background:#e8edf3}
.cap{font:600 8.5pt sans-serif;margin:0 0 2pt}.note{margin-top:4pt;font-size:8pt;color:#444}
</style></head><body>
<h1>Normal distribution toolkit</h1><p class="sub">The table gives the area to the LEFT of z. For the right, subtract from 1.</p>
<div class="top"><div><h2>The routine</h2><ol class="r">${NK.routine.moves.map(m => '<li><b>' + esc(m.name) + '.</b> ' + esc(m.say) + '</li>').join('')}</ol></div>
<div class="ex"><h2>Worked example (pretend numbers)</h2><ol>${w.steps.map(s => '<li><b>' + esc(s[0]) + ':</b> ' + esc(s[1]) + '</li>').join('')}</ol></div></div>
<div class="tables"><div><p class="cap">Negative z</p>${tableHtml(NK.table.rows.filter(r => r.neg))}</div><div><p class="cap">Positive z</p>${tableHtml(NK.table.rows.filter(r => !r.neg))}</div></div>
<p class="note">Row: whole number and first decimal of z. Column: second decimal. Example: z = 1.23 is row 1.2, column .03. Cells are computed from the normal curve and rounded to four decimals.</p>
</body></html>`;
fs.writeFileSync(path.join(ROOT, 'stats/shared/toolkit.html'), html);

const PW = process.env.PLAYWRIGHT_DIR || ['/opt/npm-tools/node_modules/playwright', '/opt/node-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/playwright'].find(p => fs.existsSync(p));
const CHROME = process.env.CHROMIUM || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const { chromium } = require(PW), br = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] }), page = await br.newPage();
await page.setContent(html); fs.mkdirSync(path.join(ROOT, 'keys/stats'), { recursive: true });
const out = path.join(ROOT, 'keys/stats/toolkit.pdf'); await page.pdf({ path: out, format: 'Letter', printBackground: true, preferCSSPageSize: true });
const pages = (fs.readFileSync(out, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length; await br.close();
console.log('wrote stats/shared/toolkit.html and keys/stats/toolkit.pdf (' + pages + ' page' + (pages === 1 ? '' : 's') + ')'); if (pages !== 1) { console.error('toolkit must fit one page'); process.exit(1); }
