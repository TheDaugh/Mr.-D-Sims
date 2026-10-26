# Shared stats widgets

`normal-kit.js` (+ `normal-kit.css`) is `NK`. Every stats lesson loads it; nothing is rebuilt per lesson. See `kit-demo.html` for each widget running, and the header of `normal-kit.js` for the API.

- `NK.zTable` has 69 rows (z = −3.4 to 3.4 by tenths) plus one extra `−0.0` row, so z from −0.01 to −0.09 has a row. Each cell is computed from an erf series at load and checked against `scipy.stats.norm.cdf` (`tests/fixtures/z-table-scipy.json`, `tests/unit/normal-kit.test.js`). Rounding is to four decimals.
- A lesson gets the Table, Routine and Example tabs in its Concepts panel automatically when `spec.course === 'stats'` and the page loads `normal-kit.js` before the engine (`templates/stats/lesson.html` does).
- `node tools/build-toolkit.mjs` prints the one-page toolkit to `keys/stats/toolkit.pdf`.
