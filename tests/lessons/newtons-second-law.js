/* The only lesson-specific part of the e2e run: how to complete Investigate. Copy this file for a new lesson. */
module.exports = {
  id: 'newtons-second-law',
  ns: 'N2L',
  async investigate(page, h, band) {
    const parts = page.locator('details.part');
    const testBtns = async scope => { for (let k = 0; k < 6; k++) { const bt = scope.locator('button:not([disabled])', { hasText: /^Test / }); if (!(await bt.count())) break; await bt.first().click(); await page.waitForTimeout(500); await h.solveAll(); } };
    const runAll = async scope => { const n = await scope.locator('select option').count(); for (let i = 0; i < n; i++) { await scope.locator('select').selectOption({ index: i }); await scope.locator('button', { hasText: /^Run$/ }).click(); await page.waitForTimeout(450); } };
    const A = parts.nth(0); await runAll(A); await h.solveAll(); await testBtns(A);
    const B = parts.nth(1); await B.locator('input[name=bpred][value="1"]').click(); await B.locator('button', { hasText: 'Lock my prediction' }).click(); await page.waitForTimeout(100); await runAll(B); await h.solveAll(); await testBtns(B);
    const C = parts.nth(2); await h.solveAll();
    const cp = await page.evaluate(b => N2L.pC(b), band);
    await C.locator('input[type=number]').fill(cp.Fneed.toFixed(3)); await C.locator('button', { hasText: /^Run/ }).click(); await page.waitForTimeout(500); await h.solveAll(); await testBtns(C);
    const D = parts.nth(3); await h.solveAll(); await runAll(D); await h.solveAll(); await testBtns(D);
    const done = await page.evaluate(() => { const I = LE.S().d.inv; return [I.A.done, I.B.done, I.C.done, I.D.done]; });
    if (done.some(x => !x)) throw new Error('investigation parts not all done: ' + done);
  }
};
