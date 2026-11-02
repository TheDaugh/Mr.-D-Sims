// Node check for chemistry/shared/pes-practice.js: every item across bands 1-3 and many seeds is recomputed from pes-data.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../../chemistry/shared/pes-data.js');
const P = require('../../chemistry/shared/pes-practice.js');

function check(item) {
  const expect = P.recompute(item.p);
  if (item.type === 'num') {
    assert.equal(typeof item.ans, 'number', item.q);
    assert.equal(item.ans, expect, item.q + ' (' + JSON.stringify(item.p) + ')');
    assert.ok(Number.isInteger(item.ans) && item.ans >= 0, 'integer answer: ' + item.q);
  } else {
    assert.ok(Array.isArray(item.opts) && item.opts.length >= 2, 'options: ' + item.q);
    assert.ok(item.ans >= 0 && item.ans < item.opts.length, 'answer index in range: ' + item.q);
    if (item.p.kind === 'tallest') {
      assert.equal(item.opts[item.ans].split(' (')[0], expect, item.q);
    } else if (item.p.kind === 'leftmost') {
      assert.equal(item.opts[item.ans], expect, item.q);
    } else if (item.p.kind === 'why') {
      assert.equal(item.ans, 0);
      assert.ok(item.opts[0].includes('protons'));
      assert.ok(item.p.lo < item.p.hi, 'lower-Z comparison atom');
    } else if (item.p.kind === 'claim') {
      assert.equal(item.ans, 0);
      assert.ok(item.opts[0].startsWith('Taller means more electrons'));
    }
  }
  assert.ok(item.hint && item.why, 'hint and why present: ' + item.q);
}

test('every generated item across bands 1-3 recomputes from pes-data (200 seeds x 40 items)', () => {
  let count = 0;
  for (let band = 1; band <= 3; band++) {
    for (let seed = 1; seed <= 200; seed++) {
      for (let n = 0; n < 40; n++) {
        const item = P.spec(n, band, seed);
        assert.equal(item.band, band);
        check(item);
        count++;
      }
    }
  }
  assert.equal(count, 24000);
});

test('band 1 only uses Z 1, 2, 3, 10 and shows subshell tags', () => {
  for (let seed = 1; seed <= 100; seed++) {
    for (let n = 0; n < 20; n++) {
      const it = P.spec(n, 1, seed);
      assert.ok(it.tags === true);
      assert.ok([1, 2, 3, 10].includes(it.p.Z), 'band-1 element: ' + it.p.Z);
    }
  }
});

test('band 2 and 3 never show tags and use only sourced elements', () => {
  const sourced = D.simElements();
  for (const band of [2, 3]) {
    for (let seed = 1; seed <= 50; seed++) {
      for (let n = 0; n < 20; n++) {
        const it = P.spec(n, band, seed);
        assert.equal(it.tags, false);
        if (it.p.Z !== undefined) assert.ok(sourced.includes(it.p.Z), it.q);
        if (it.p.hi !== undefined) assert.ok(sourced.includes(it.p.hi) && sourced.includes(it.p.lo), it.q);
      }
    }
  }
});

test('spec is deterministic for the same n, band and seed', () => {
  assert.deepEqual(P.spec(4, 2, 77), P.spec(4, 2, 77));
});
