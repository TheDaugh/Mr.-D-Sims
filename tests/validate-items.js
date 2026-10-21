/* Static check of a lesson's item bank. Run: node tests/validate-items.js physics/lessons/content/n2l-items.js N2L
   Catches the cheap mistakes before a browser run: cloze placeholders vs blanks, option counts, answer indexes,
   missing hints/worked text, and numeric answers that fail their own checker. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const [file, ns] = process.argv.slice(2);
if (!file || !ns) { console.log('usage: node tests/validate-items.js <items.js> <Namespace>'); process.exit(2); }
const root = path.resolve(__dirname, '..');
const win = { LE: { fbdSVG: () => '<svg/>', fmt: x => String(x), fmtN: x => String(x), rng: seed => { let h = 2166136261; for (const c of String(seed)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h += 0x6D2B79F5; let t = Math.imul(h ^ (h >>> 15), 1 | h); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; } } };
win.window = win; win.MrD = {};
const ctx = vm.createContext(win);
for (const f of [path.join(root, 'physics/lessons/engine/cart-sim.js'), path.resolve(file)]) { try { vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f }); } catch (e) { if (!/cart-sim/.test(f)) throw e; } }
const lib = win[ns]; if (!lib) { console.log('namespace', ns, 'not found'); process.exit(2); }
const bad = [], warn = []; const note = m => bad.push(m);
Object.entries(lib.cloze || {}).forEach(([b, z]) => { const n = (z.text.match(/\{\d+\}/g) || []).length; if (n !== z.blanks.length) note(`cloze band ${b}: ${n} placeholders, ${z.blanks.length} blanks`); const ids = (z.text.match(/\{(\d+)\}/g) || []); if (new Set(ids).size !== ids.length) note(`cloze band ${b}: a placeholder repeats`); });
if (lib.misc) { const n = (lib.misc.text.match(/\{\d+\}/g) || []).length; if (n !== lib.misc.blanks.length) note(`misc: ${n} placeholders, ${lib.misc.blanks.length} blanks`); }
(lib.warm || []).forEach(q => { if (!q.options || q.answer == null || !q.options[q.answer]) note('warm ' + q.id + ': answer index invalid'); });
(lib.preds || []).forEach((p, i) => { if (p.correct !== 0) note('pred ' + (i + 1) + ': correct option must be index 0 (portal and report decode rely on letter A)'); });
let count = 0;
(lib.skills || []).forEach(sk => { for (let b = 1; b <= 4; b++) for (let k = 0; k < 150; k++) { const q = sk.gen(b, win.LE.rng(sk.id + b + k)); count++;
  const tag = `${sk.id} b${b} #${k}`;
  if (!q.prompt || !q.hint || !q.worked) note(tag + ': missing prompt/hint/worked');
  if (q.type === 'choice') { if (!q.options || q.options.length < 2 || !q.options[q.answer]) note(tag + ': bad options'); else if (new Set(q.options.map(o => typeof o === 'string' ? o : o.label)).size !== q.options.length) note(tag + ': duplicate options'); }
  else if (q.type === 'num') { if (!isFinite(q.answer)) note(tag + ': non-finite answer'); if (q.chk != null && Math.abs(q.chk - q.answer) > Math.max(1e-9, Math.abs(q.answer) * (q.tol || 0.02))) note(tag + ': answer ' + q.answer + ' disagrees with independent chk ' + q.chk); } else note(tag + ': unknown type ' + q.type); } });
const uniq = {}; (lib.skills || []).forEach(sk => { for (let b = 1; b <= 4; b++) { const s = new Set(); for (let k = 0; k < 150; k++) s.add(sk.gen(b, win.LE.rng(sk.id + b + k)).prompt); if (s.size < 8) warn.push(`${sk.id} band ${b}: only ${s.size} distinct prompts in 150 draws`); } });
console.log(`${ns}: ${count} generated questions checked, ${bad.length} problem(s), ${warn.length} variety warning(s)`); warn.slice(0, 6).forEach(m => console.log('  ~ ' + m)); bad.slice(0, 25).forEach(m => console.log('  - ' + m)); process.exit(bad.length ? 1 : 0);
