#!/usr/bin/env node
/* Build the PDF keys for a lesson from its neutral spec (the same file the lesson page reads).
     node tools/build-keys.mjs templates/physics/spec.js          one spec
     node tools/build-keys.mjs --all                              every spec under templates/ and the course folders
   For each spec it writes, under keys/<course>/ :
     <id>-makeup.pdf   what an absent student copies into their notes (no personal time needed): targets, concepts, huddle with answers,
                       one worked sample per skill per level
     <id>-teacher.pdf  outline with minutes and priorities, the huddle script, every level's sample with answers, common misconceptions
   plus the .tex sources so a PDF can be rebuilt on any machine with pdflatex. Needs pdflatex (TeX Live). */
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { execFileSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url), ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const H = require('../shared/huddle.js');

function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const strip = s => String(s ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const stripKeep = s => String(s ?? '').replace(/<[^>]+>/g, '');   // keeps the spaces at the edges, for text that sits next to a blank
export function tex(s) {
  const raw = stripKeep(s);
  if (raw.includes('$') && !/^[^$]*\$[^$]*$/.test(raw)) {                 // text with $math$ segments: math goes through as TeX, text is escaped
    return raw.split(/(\$[^$]+\$)/).map(seg => /^\$[^$]+\$$/.test(seg) ? seg.replace(/[‘’]/g, "'").replace(/′/g, "'") : texText(seg)).join('');
  }
  return texText(raw);
}
function texText(raw) {
  return raw.replace(/\\/g, '\\textbackslash{}').replace(/([&%$#_{}])/g, '\\$1').replace(/\^/g, '\\textasciicircum{}').replace(/~/g, '\\textasciitilde{}')
    .replace(/²/g, '\\textsuperscript{2}').replace(/³/g, '\\textsuperscript{3}').replace(/⁻¹/g, '\\textsuperscript{-1}').replace(/₀/g, '\\textsubscript{0}').replace(/₁/g, '\\textsubscript{1}').replace(/₂/g, '\\textsubscript{2}')
    .replace(/[−–]/g, '--').replace(/—/g, '---').replace(/×/g, '$\\times$').replace(/÷/g, '$\\div$').replace(/π/g, '$\\pi$').replace(/Δ/g, '$\\Delta$').replace(/Σ/g, '$\\Sigma$')
    .replace(/≤/g, '$\\le$').replace(/≥/g, '$\\ge$').replace(/≈/g, '$\\approx$').replace(/→/g, '$\\rightarrow$').replace(/°/g, '$^\\circ$').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/…/g, '...').replace(/·/g, '$\\cdot$').replace(/[^\x00-\x7e]/g, '?');
}
let MC = null; try { require('../calculus/shared/mathcheck.js'); MC = globalThis.MC; } catch (e) {}
const ans = q => q.type === 'expr' && MC ? '$' + MC.toLatex(String(q.answer), q.vars || ['x']) + '$'
  : typeof q.answer === 'number' ? String(+q.answer.toFixed(4)) + (q.unit ? ' ' + q.unit : '') : strip(q.answer) + (q.unit ? ' ' + q.unit : '');
const sentenceOnly = t => tex(t);

function head(spec, kind) {
  return String.raw`\documentclass[11pt]{article}
\usepackage[letterpaper,margin=0.85in]{geometry}\usepackage[T1]{fontenc}\usepackage[utf8]{inputenc}\usepackage{amsmath,amssymb,enumitem,booktabs,array,xcolor,fancyhdr,tabularx}
\setlist{itemsep=2pt,topsep=3pt}\pagestyle{fancy}\fancyhf{}\renewcommand{\headrulewidth}{0.3pt}
\fancyhead[L]{\small ` + tex(spec.title) + String.raw`}\fancyhead[R]{\small ` + (kind === 'makeup' ? 'Make-up key' : 'Teacher key') + String.raw`}\fancyfoot[C]{\small\thepage}
\definecolor{ans}{RGB}{28,125,74}\newcommand{\A}[1]{\textcolor{ans}{\textbf{#1}}}
\begin{document}
`;
}
function huddleBlock(spec, withAnswers) {
  const p = H.plain(spec.huddle, true), out = [];
  const line = t => H.parse(t).map(x => x.t != null ? tex(x.t) : '\\A{' + tex(x.b) + '}').join('');
  out.push('\\subsection*{Definitions}\\begin{itemize}');
  (spec.huddle.defs || []).forEach(d => out.push('\\item \\textbf{' + tex(d.term) + ':} ' + line(d.text)));
  out.push('\\end{itemize}');
  if (spec.huddle.example) {
    out.push('\\subsection*{Worked example}', tex(spec.huddle.example.prompt) + '\\\\', '\\begin{itemize}');
    (spec.huddle.example.steps || []).forEach(s => out.push('\\item ' + line(s)));
    out.push('\\end{itemize}');
  }
  if (spec.huddle.label) {
    out.push('\\subsection*{' + tex(spec.huddle.label.title || 'Label it') + '}', '\\begin{enumerate}');
    (spec.huddle.label.tags || []).forEach(t => out.push('\\item ' + line(t.text)));
    out.push('\\end{enumerate}');
  }
  return out.join('\n');
}
function samples(spec, perBand) {
  const o = [];
  (spec.skills || []).forEach(sk => {
    o.push('\\subsection*{' + tex(sk.title) + '}');
    for (let b = 1; b <= 4; b++) { const q = sk.gen(b, rng(b * 101 + 7));
      o.push('\\noindent\\textbf{Level ' + b + '.} ' + tex(q.prompt) + '\\\\ \\A{Answer: ' + tex(ans(q)) + '} \\quad ' + tex(q.worked) + '\\par\\medskip'); }
  });
  return o.join('\n');
}
function makeup(spec) {
  const o = [head(spec, 'makeup')];
  o.push('\\section*{' + tex(spec.title) + '}', '\\textbf{You missed this lesson. Copy this into your notes. That is all you need to do.}\\par\\medskip');
  o.push('\\subsection*{Question of the day}', tex(spec.question) + '\\par');
  o.push('\\subsection*{Targets}\\begin{itemize}' + spec.targets.map(t => '\\item ' + tex(t)).join('\n') + '\\end{itemize}');
  if (spec.concepts) { o.push('\\subsection*{Concepts}\\begin{itemize}'); spec.concepts.forEach(c => o.push('\\item \\textbf{' + tex(c.title) + '}' + (c.eq ? ' (' + tex(c.eq) + ')' : '') + ': ' + c.points.map(tex).join(' '))); o.push('\\end{itemize}'); }
  if (spec.predicts) { o.push('\\subsection*{What the class predicted, and what is true}\\begin{itemize}'); spec.predicts.forEach(p => o.push('\\item ' + tex(p.prompt) + ' \\A{' + tex(strip(p.options[p.answer])) + '.} ' + tex(p.why))); o.push('\\end{itemize}'); }
  o.push('\\section*{Huddle notes (answers filled in)}', huddleBlock(spec, true));
  o.push('\\section*{One worked sample of each skill}', samples(spec));
  o.push('\\end{document}');
  return o.join('\n');
}
function teacher(spec) {
  const o = [head(spec, 'teacher')], P = spec.pacing || { steps: [], huddles: [], budgetMin: 0 };
  o.push('\\section*{' + tex(spec.title) + ' --- teacher key}', '\\textbf{Question:} ' + tex(spec.question) + '\\par');
  o.push('\\subsection*{Outline and pacing (' + P.budgetMin + ' min)}\\begin{tabular}{@{}llll@{}}\\toprule Tab & Priority & Minutes & If behind\\\\\\midrule');
  P.steps.forEach(s => o.push(tex(s.id) + ' & ' + s.prio + ' & ' + s.min + ' & ' + (s.prio === 1 ? 'never trimmed' : s.prio === 3 ? 'skipped first' : 'shrinks to ' + s.minItems + ' of ' + s.parts) + '\\\\'));
  (P.huddles || []).forEach(h => o.push('Huddle ' + tex(h.key) + ' & clock & minute ' + h.atMin + ' & pulled in by the clock\\\\'));
  o.push('\\bottomrule\\end{tabular}');
  o.push('\\subsection*{Targets}\\begin{itemize}' + spec.targets.map(t => '\\item ' + tex(t)).join('\n') + '\\end{itemize}');
  if (spec.predicts) { o.push('\\subsection*{Predictions}\\begin{itemize}'); spec.predicts.forEach(p => o.push('\\item ' + tex(p.prompt) + ' \\A{' + tex(strip(p.options[p.answer])) + '.} ' + tex(p.why))); o.push('\\end{itemize}'); }
  o.push('\\section*{Huddle script (answers in green)}', huddleBlock(spec, true));
  o.push('\\section*{Every level, with answers}', samples(spec));
  if (spec.misconceptions) { o.push('\\section*{Common misconceptions}\\begin{tabularx}{\\textwidth}{@{}X X@{}}\\toprule Students say & Say instead\\\\\\midrule'); spec.misconceptions.forEach(m => o.push(tex(m.say) + ' & ' + tex(m.fix) + '\\\\')); o.push('\\bottomrule\\end{tabularx}'); }
  o.push('\\end{document}');
  return o.join('\n');
}

function build(specPath) {
  const spec = require(path.resolve(specPath)), dir = path.join(ROOT, 'keys', spec.course);
  fs.mkdirSync(dir, { recursive: true });
  for (const [kind, fn] of [['makeup', makeup], ['teacher', teacher]]) {
    const base = path.join(dir, spec.id + '-' + kind), tmp = fs.mkdtempSync('/tmp/keys-');
    fs.writeFileSync(base + '.tex', fn(spec));
    for (let i = 0; i < 2; i++) execFileSync('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', '-output-directory', tmp, base + '.tex'], { stdio: 'pipe' });
    fs.copyFileSync(path.join(tmp, spec.id + '-' + kind + '.pdf'), base + '.pdf'); fs.rmSync(tmp, { recursive: true, force: true });
    console.log('wrote', path.relative(ROOT, base + '.pdf'));
  }
}
function findSpecs() {
  const out = [], walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules' || e.name === '.git' || e.name === 'keys') continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/(^|\.)spec\.js$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p); } };
  walk(ROOT); return out;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2); const list = a[0] === '--all' ? findSpecs() : a;
  if (!list.length) { console.error('usage: node tools/build-keys.mjs <spec.js> | --all'); process.exit(2); }
  list.forEach(build);
}
