const test = require('node:test'), assert = require('node:assert');
const h = require('../../shared/huddle.js');
test('parse splits text and blanks', () => {
  assert.deepStrictEqual(h.parse('a = [[3]] m/s² and [[up]]'), [{ t: 'a = ' }, { b: '3' }, { t: ' m/s² and ' }, { b: 'up' }]);
  assert.deepStrictEqual(h.parse('plain'), [{ t: 'plain' }]);
});
test('plain gives a blank sheet or the answers', () => {
  const spec = { defs: [{ term: 'Net force', text: 'The [[vector sum]] of forces.' }], example: { prompt: 'P', steps: ['a = [[3]]'] }, label: { tags: [{ n: 1, text: '[[fan]]' }] } };
  assert.deepStrictEqual(h.plain(spec, false).defs, ['Net force: The ________ of forces.']);
  assert.deepStrictEqual(h.plain(spec, true).example, ['P', 'a = 3']);
  assert.deepStrictEqual(h.plain(spec, true).tags, ['1. fan']);
});
test('norm forgives case, spacing and a trailing period', () => { assert.strictEqual(h.norm(' Vector  SUM. '), 'vector sum'); });
