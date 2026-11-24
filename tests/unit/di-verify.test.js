const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const run = (...a) => spawnSync('python3', ['-I', 'tools/di_verify.py', ...a], { encoding: 'utf8' });

test('a clean DI spec passes', () => {
  assert.strictEqual(run('tests/di-verify/good.json').status, 0);
});
test('a bad spec fails on clock, budget, question, shared text and student file', () => {
  const r = run('tests/di-verify/bad.json', '--student', 'tests/di-verify/student-bad.txt');
  assert.strictEqual(r.status, 1);
  for (const s of ['clock:', 'budget: chunks', 'budget: live_questions', 'addresses the student',
                   'shared text', 'placeholder', 'teacher named', 'stage direction'])
    assert.ok(r.stdout.includes(s), 'missing: ' + s);
});
