const test = require('node:test'), assert = require('node:assert');
const kp = require('../../shared/keypad.js');
test('digits insert at the caret and replace a selection', () => {
  assert.deepStrictEqual(kp.insert('12', 1, 1, 'd5'), { value: '152', caret: 2 });
  assert.deepStrictEqual(kp.insert('12', 0, 2, 'd7'), { value: '7', caret: 1 });
});
test('fraction and root put the caret inside the first bracket', () => {
  assert.deepStrictEqual(kp.insert('', 0, 0, 'frac'), { value: '()/()', caret: 1 });
  assert.deepStrictEqual(kp.insert('2', 1, 1, 'sqrt'), { value: '2sqrt()', caret: 7 - 1 });
});
test('back deletes one character or the selection', () => {
  assert.deepStrictEqual(kp.insert('abc', 3, 3, 'back'), { value: 'ab', caret: 2 });
  assert.deepStrictEqual(kp.insert('abc', 0, 0, 'back'), { value: 'abc', caret: 0 });
  assert.deepStrictEqual(kp.insert('abc', 0, 2, 'back'), { value: 'c', caret: 0 });
});
test('every inserted math string is something mathcheck can read', () => {
  const MC = require('../../calculus/shared/mathcheck.js');
  const m = globalThis.MC;
  for (const k of ['frac', 'pow', 'sqrt', 'pi', 'mul', 'div']) {
    const filled = kp.KEYS[k].ins.replace(/\(\)/g, '(2)');
    const text = k === 'pow' ? '3' + filled : k === 'mul' || k === 'div' ? '3' + filled + '4' : filled;
    assert.doesNotThrow(() => m.parse(text, ['x']), k + ' -> ' + text);
  }
});
