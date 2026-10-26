#!/usr/bin/env node
/* Static conformance check for guided lessons against docs/LESSON-STANDARD.md. No browser, runs in a second.
 *   node tools/check-lessons.mjs            report; exit 1 only on ERROR
 *   node tools/check-lessons.mjs --strict   also exit 1 on GAP (decided rules a v2 lesson does not meet yet)
 *
 * Generations:
 *   v2      the page loads physics/lessons/engine/standard.js (spec-driven; what new lessons are made from)
 *   legacy  everything else that is registered in shared/lessons.js
 *
 * ERROR   breaks the standard: a v2 lesson with no spec, a local gate hash or PREVIEW flag, a missing shared script,
 *         a registered file that does not exist, duplicate ids.
 * GAP     a rule Ian has decided that this lesson does not meet yet (today: locked mode). Fails only with --strict.
 * LEGACY  what an older page still does its own way. Never fails; it is the migration list.
 * WARN    pages in lesson folders that are not registered, so the teacher hub and codes cannot see them.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(rd('shared/lessons.js'), sandbox, { filename: 'shared/lessons.js' });
const registry = sandbox.window.MrD.lessons;

const out = { ERROR: [], GAP: [], LEGACY: [], WARN: [] };
const note = (level, id, msg) => out[level].push(`${id}: ${msg}`);

/* the lesson's own code: its page, its spec, and every local script it loads outside shared/ and engine/ */
function ownSources(href, spec) {
  const dir = path.posix.dirname(href);
  const html = rd(href);
  const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1])
    .filter((s) => !/^https?:/.test(s))
    .map((s) => path.posix.normalize(path.posix.join(dir, s.split('?')[0])))
    .filter((p) => !p.startsWith('shared/') && !/(^|\/)engine\//.test(p) && exists(p));
  const files = [...new Set([href, ...srcs, ...(spec && exists(spec) ? [spec] : [])])];
  return { html, files, text: files.map(rd).join('\n') };
}

const rows = [];
const seenIds = new Set();
for (const L of registry) {
  const id = L.id;
  if (seenIds.has(id)) note('ERROR', id, 'duplicate id in shared/lessons.js');
  seenIds.add(id);
  if (!exists(L.href)) { note('ERROR', id, `registered page missing: ${L.href}`); continue; }
  if (L.teacher && !exists(L.teacher)) note('ERROR', id, `teacher page missing: ${L.teacher}`);

  const src = ownSources(L.href, L.spec);
  const isV2 = /standard\.js/.test(src.html);
  const isTemplate = L.unit === 'Templates';
  const has = (s) => new RegExp(s.replace('.', '\\.')).test(src.html);
  // Engine lessons (v2 and the older physics ones) turn locked mode on only with `lock: true` in their config; loading
  // shared/lock.js alone does nothing. Older chemistry and calculus pages drive lock.js from their own code.
  const lockOn = isV2 ? /\block\s*:\s*true\b/.test(src.text) : (/\block\s*:\s*true\b/.test(src.text) || has('lock.js'));
  const localGate = /\bPREVIEW\b|hashCode|function\s+gate\s*\(/.test(src.text);

  if (isV2) {
    for (const s of ['bell.js', 'ids.js', 'pace.js', 'codes.js']) if (!has(s)) note('ERROR', id, `v2 page does not load shared/${s}`);
    if (!L.spec) note('ERROR', id, 'v2 lesson has no `spec` in shared/lessons.js (keys, tests and the hub read it)');
    else if (!exists(L.spec)) note('ERROR', id, `spec file missing: ${L.spec}`);
    if (localGate) note('ERROR', id, 'local gate hash or PREVIEW flag; use MrD.codes.gate / MrD.codes.huddle');
    if (!lockOn) note('GAP', id, 'locked mode is off: add `lock: true` to the lesson config (Ian: every guided lesson is locked), then add it to TARGETS in tests/lock.e2e.js');
  } else {
    if (!has('bell.js')) note('LEGACY', id, 'does not use shared/bell.js (no clock rules)');
    if (!has('ids.js')) note('LEGACY', id, 'asks for a name, not a student ID (shared/ids.js)');
    if (localGate) note('LEGACY', id, 'has its own gate hash or PREVIEW flag');
    if (!lockOn) note('LEGACY', id, 'locked mode is off');
  }
  rows.push({ id, course: L.course, gen: isV2 ? (isTemplate ? 'v2 (template)' : 'v2') : 'legacy', lock: lockOn ? 'yes' : 'NO' });
}

/* pages sitting in lesson folders that the registry does not know about */
const registered = new Set(registry.map((L) => L.href));
const SKIP = /teacher|board|projector|virtual|lab|kit-demo|toolkit|key|index|^templates\//i;
const walk = (d) => fs.existsSync(path.join(ROOT, d)) ? fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.posix.join(d, e.name)) : [path.posix.join(d, e.name)]) : [];
const roots = ['physics/lessons', ...fs.readdirSync(ROOT).filter((n) => ['chemistry', 'calculus', 'stats'].includes(n)).flatMap((c) => fs.readdirSync(path.join(ROOT, c)).filter((n) => /^unit-/.test(n)).map((n) => `${c}/${n}`))];
for (const f of roots.flatMap(walk).filter((f) => f.endsWith('.html') && !registered.has(f) && !SKIP.test(path.posix.basename(f)))) {
  note('WARN', f, 'not in shared/lessons.js (lesson, lab or sim? register it or ignore it on purpose)');
}

/* ---------- report ---------- */
const pad = (s, n) => String(s).padEnd(n);
console.log(pad('lesson', 24) + pad('course', 9) + pad('generation', 15) + 'locked');
for (const r of rows) console.log(pad(r.id, 24) + pad(r.course, 9) + pad(r.gen, 15) + r.lock);
for (const lvl of ['ERROR', 'GAP', 'WARN', 'LEGACY']) {
  if (!out[lvl].length) continue;
  console.log(`\n${lvl} (${out[lvl].length})`);
  out[lvl].forEach((m) => console.log('  ' + m));
}
const v2 = rows.filter((r) => r.gen === 'v2').length, tpl = rows.filter((r) => r.gen === 'v2 (template)').length, leg = rows.filter((r) => r.gen === 'legacy').length;
console.log(`\n${rows.length} registered: ${v2} on v2, ${tpl} templates, ${leg} legacy. ${out.ERROR.length} error(s), ${out.GAP.length} gap(s), ${out.WARN.length} unregistered.`);
process.exit(out.ERROR.length || (strict && out.GAP.length) ? 1 : 0);
