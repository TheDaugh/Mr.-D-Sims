const test = require('node:test'), assert = require('node:assert');
const ids = require('../../shared/ids.js');

test('derive is deterministic, well-formed, and passes its own check', async () => {
  const a = await ids.derive('secret', 'Jane  Smith', '3'), b = await ids.derive('secret', 'jane smith', ' 3 ');
  assert.strictEqual(a, b);
  assert.match(a, /^[0-9A-Z]{3}-[0-9A-Z]{4}$/);
  assert.ok(ids.validate(a).ok);
});
test('a different secret or period gives a different ID', async () => {
  const a = await ids.derive('s1', 'Jane Smith', '3');
  assert.notStrictEqual(a, await ids.derive('s2', 'Jane Smith', '3'));
  assert.notStrictEqual(a, await ids.derive('s1', 'Jane Smith', '4'));
});
test('every single-character typo is caught by the check character', async () => {
  const id = (await ids.derive('k', 'Ann Lee', '2')).replace('-', '');
  for (let i = 0; i < 7; i++) for (const c of ids.ALPHABET) {
    if (c === id[i]) continue;
    const bad = id.slice(0, i) + c + id.slice(i + 1);
    assert.strictEqual(ids.validate(bad).ok, false, bad);
  }
});
test('lookalike letters and spacing are forgiven', async () => {
  const id = await ids.derive('k', 'Ann Lee', '2');
  assert.strictEqual(ids.validate(id.toLowerCase().replace('-', ' ')).id, id);
});
test('validate reasons', () => {
  assert.strictEqual(ids.validate('').why, 'empty');
  assert.strictEqual(ids.validate('ABC').why, 'shape');
});
test('roster: parse, derive without collisions, decode', async () => {
  const rows = ids.parseRoster('Name, Period\nSmith, Jane, 3\nLee\t2\n\nbad line');
  assert.deepStrictEqual(rows, [{ name: 'Smith, Jane', period: '3' }, { name: 'Lee', period: '2' }]);
  const many = Array.from({ length: 300 }, (_, i) => ({ name: 'Student ' + i, period: String(1 + i % 6) }));
  const t = await ids.deriveRoster(many, 'x');
  assert.strictEqual(new Set(t.map(r => r.id)).size, 300);
  assert.deepStrictEqual(ids.decode(t[5].id.toLowerCase(), t), { name: t[5].name, period: t[5].period });
  assert.strictEqual(ids.decode('000-0000', t), null);
});
