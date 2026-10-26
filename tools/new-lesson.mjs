#!/usr/bin/env node
/* Start a new guided lesson from the template for its course.
     node tools/new-lesson.mjs physics newtons-third-law "Newton's Third Law"
     node tools/new-lesson.mjs chem    mole-ratios       "Mole Ratios"          --unit unit-4-reactions
     node tools/new-lesson.mjs stats   3-2-z-scores     "3.2 z-Scores"        --unit unit-3-normal
     node tools/new-lesson.mjs calc    2-8-quotient-rule "2.8 The Quotient Rule" --unit unit-2-differentiation
   It copies templates/<course>/{lesson.html, content.js, spec.js} to the right folders, fixes the paths and ids, and adds the lesson to
   shared/lessons.js (the teacher hub and the code table read that list). Then you edit ONLY the spec (and the Explore picture in content.js).
   Add  --prefix ABC  for the 3-letter stamp prefix (default: first letters of the id). */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2), flag = n => { const i = a.indexOf('--' + n); return i < 0 ? null : a.splice(i, 2)[1]; };
const unit = flag('unit'), prefixArg = flag('prefix');
const [course, id, ...rest] = a, title = rest.join(' ');
const T = { physics: 'tpl-physics', calc: 'tpl-calc', chem: 'tpl-chem', stats: 'tpl-stats' };
if (!T[course] || !/^[a-z0-9][a-z0-9-]*$/.test(id || '') || !title) { console.error('usage: node tools/new-lesson.mjs <physics|calc|chem|stats> <lesson-id> "<Title>" [--unit <folder>] [--prefix ABC]'); process.exit(2); }
if (course !== 'physics' && !unit) { console.error('chem, calc and stats lessons live in a unit folder: add  --unit unit-4-reactions'); process.exit(2); }

const tdir = path.join(ROOT, 'templates', course), read = f => fs.readFileSync(path.join(tdir, f), 'utf8');
const prefix = (prefixArg || id.replace(/[^a-z]/g, '').slice(0, 3) || 'LSN').toUpperCase();
const folder = course === 'physics' ? 'physics/lessons' : (course === 'calc' ? 'calculus/' : course === 'stats' ? 'stats/' : 'chemistry/') + unit;
if (!fs.existsSync(path.join(ROOT, course === 'physics' ? 'physics/lessons' : folder.split('/')[0]))) { console.error('no such course folder'); process.exit(1); }
fs.mkdirSync(path.join(ROOT, folder, course === 'physics' ? 'content' : ''), { recursive: true });

const specDest = course === 'physics' ? `${folder}/content/${id}.spec.js` : `${folder}/${id}.spec.js`;
const contDest = course === 'physics' ? `${folder}/content/${id}.js` : `${folder}/${id}.content.js`;
const htmlDest = `${folder}/${id}.html`;
for (const d of [specDest, contDest, htmlDest]) if (fs.existsSync(path.join(ROOT, d))) { console.error('already exists: ' + d); process.exit(1); }

const fix = s => s.split(T[course]).join(id).replace(/ \(template\)/g, '').replace(/Template(?=['"])/, 'Lessons');
let spec = fix(read('spec.js')).replace(/title: '[^']*'/, `title: '${title.replace(/'/g, "\\'")}'`);
let content = fix(read('content.js')).replace(/prefix: '[A-Z]{3}'/, `prefix: '${prefix}'`).replace(/TEMPLATE LESSON \((\w+)\)/, 'LESSON ($1)');
let html = fix(read('lesson.html')).replace(/<title>[^<]*<\/title>/, `<title>${title} · Mr. D</title>`).replace(/<h1 id="title">[^<]*<\/h1>/, `<h1 id="title">${title}</h1>`)
  .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${title}. Online guided lesson.">`);
const sp = path.posix.basename(specDest), cp = path.posix.basename(contDest);
html = html.replace('<script src="spec.js"></script>', `<script src="${course === 'physics' ? 'content/' : ''}${sp}"></script>`).replace('<script src="content.js"></script>', `<script src="${course === 'physics' ? 'content/' : ''}${cp}"></script>`);
if (course === 'physics') {   // the template sits two folders below the repo root; physics lessons sit in physics/lessons/
  html = html.split('../../physics/lessons/engine/').join('engine/').replace('<link rel="stylesheet" href="../../physics/lessons/engine/lesson.css">', '<link rel="stylesheet" href="engine/lesson.css">')
    .replace('href="../README.md">&larr; Templates<', 'href="../index.html">&larr; Physics<');
} else html = html.replace('href="../README.md">&larr; Templates<', `href="../index.html">&larr; ${course === 'calc' ? 'Calculus' : course === 'stats' ? 'Statistics' : 'Chemistry'}<`);
html = html.replace(/<!-- Paths below[^>]*-->\n/, '');
const w = (d, s) => fs.writeFileSync(path.join(ROOT, d), s);
w(specDest, spec); w(contDest, content); w(htmlDest, html);

/* registry line for the teacher hub */
const regPath = path.join(ROOT, 'shared/lessons.js'); let reg = fs.readFileSync(regPath, 'utf8');
const teacher = course === 'physics' ? 'physics/lessons/teacher.html' : course === 'chem' ? 'chemistry/teacher.html' : '';
const entry = `  { course: "${course}", id: "${id}", title: ${JSON.stringify(title)}, unit: ${JSON.stringify(unit || 'Lessons')},\n    href: "${htmlDest}", ${teacher ? `teacher: "${teacher}",\n    ` : ''}spec: "${specDest}",\n    gates: [{ key: "h1", label: "Huddle" }], live: true },\n`;
reg = reg.replace(/\n\];\s*$/, ',\n' + entry.replace(/,\n$/, '\n') + '];\n');
fs.writeFileSync(regPath, reg);

console.log(`Created:\n  ${htmlDest}\n  ${specDest}   <- edit this: targets, concepts, huddle, predictions, skills, misconceptions, pacing\n  ${contDest}   <- only the Explore picture lives here\nRegistered in shared/lessons.js.\nNext:\n  node --test tests/unit/\n  node tools/build-keys.mjs ${specDest}\n  open ${htmlDest}#key`);
