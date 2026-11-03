// Builds shared/whiteboard/app/ (app.js, app.css, fonts/) from tools/whiteboard/src. One bundle runs every board
// (chem, stats); each board's index.html sets window.MRD_BOARD.
// Setup once: cd tools/whiteboard && npm install. Then: node tools/whiteboard/build.mjs
import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync, existsSync, statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../shared/whiteboard');
const out = path.join(root, 'app');

if (!existsSync(path.join(here, 'node_modules'))) {
  console.error('Run `npm install` in tools/whiteboard first.');
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

await build({
  entryPoints: [path.join(here, 'src/app.jsx')],
  outfile: path.join(out, 'app.js'),
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  conditions: ['production'],
  nodePaths: [path.join(here, 'node_modules')],
  define: { 'process.env.NODE_ENV': '"production"', 'process.env.IS_PREACT': '"false"' },
  loader: { '.woff2': 'file', '.ttf': 'file', '.png': 'file', '.svg': 'file' },
  logLevel: 'info',
});

// Excalidraw loads its fonts from EXCALIDRAW_ASSET_PATH + "fonts/"; keep only the families the board uses.
const fonts = path.join(here, 'node_modules/@excalidraw/excalidraw/dist/prod/fonts');
const keep = ['Excalifont', 'Nunito', 'Assistant', 'Virgil', 'Cascadia', 'Liberation', 'ComicShanns', 'Lilita'];
for (const dir of keep) {
  if (existsSync(path.join(fonts, dir))) cpSync(path.join(fonts, dir), path.join(out, 'fonts', dir), { recursive: true });
}

const size = (p) => (existsSync(p) ? (statSync(p).size / 1e6).toFixed(2) + ' MB' : 'missing');
console.log('app.js', size(path.join(out, 'app.js')), ' app.css', size(path.join(out, 'app.css')), ' fonts', readdirSync(path.join(out, 'fonts')).join(', '));
