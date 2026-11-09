/* Per-lesson overrides for 4.3 Rates in Other Settings. Run with
     TZ=America/New_York TEMPLATE=calc PAGE=calculus/unit-4-contextual-applications/4-3-rates-other.html node tests/template.e2e.js */
const assert = require('assert');
module.exports = require('./_unit4.js')('4-3-rates-other', null, {
  X1: [['s', 0, 30], ['s', 1, 40], ['c'], ['s', 0, 50], ['s', 1, 1], ['c'], ['ok']],
  X2: [['s', 0, 10], ['c'], ['s', 0, 16], ['c'], ['ok'], ['ok']],
  X3: [['m', 'roc-x3']],
  X4: [['b', 'Interval [0, 2]'], ['b', 'Interval [2, 4]'], ['b', 'Interval [4, 6]'], ['b', 'Interval [6, 8]'], ['b', 'Interval [8, 10]'], ['ok'], ['ok']]
}, async (H, page) => {
  const x1 = page.locator('.card .q[data-qid="X1"]'); await x1.getByRole('button', { name: /^Check/ }).click(); await H.tick(page, 300);
  assert.ok((await x1.locator('.fb').innerText()).length > 10, 'station 1 miss gives feedback');
});
