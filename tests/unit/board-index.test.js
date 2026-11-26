/* teacher/boards.html lists the lesson boards from shared/whiteboard/lessons.js, which tools/whiteboard/build.mjs writes from
   src/app.jsx. This fails if a lesson board is added or renamed without rebuilding, so the navigation page never goes stale. */
const test = require('node:test'), assert = require('node:assert'), path = require('path'), fs = require('fs');
const root = path.resolve(__dirname, '../..');

test('lessons.js matches the boards registered in app.jsx', async () => {
  const { lessonIndex } = await import(path.join(root, 'tools/whiteboard/lesson-index.mjs'));
  const want = lessonIndex(path.join(root, 'tools/whiteboard'));
  const src = fs.readFileSync(path.join(root, 'shared/whiteboard/lessons.js'), 'utf8');
  const have = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
  assert.deepStrictEqual(have, want);
  assert.ok(want.length >= 14);
  for (const L of want) {
    assert.ok(['chem', 'stats', 'physics'].includes(L.board), L.id + ' board');
    assert.ok(L.title && L.frames.length >= 3, L.id + ' has a title and frames');
  }
});

test('every lesson board has a class tab on boards.html', () => {
  const page = fs.readFileSync(path.join(root, 'teacher/boards.html'), 'utf8');
  for (const b of ['physics', 'chem', 'stats']) assert.ok(page.includes("board: '" + b + "'"), b);
});
