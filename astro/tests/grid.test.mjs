import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardGridCols } from '../src/utils/grid.mjs';

const columnsAt = (classes, prefix) => {
  const order = ['', 'sm:', 'md:', 'lg:', 'xl:'];
  let cols = 1;
  for (const p of order) {
    const m = classes.match(new RegExp(`(?:^|\\s)${p.replace(':', '\\:')}grid-cols-(\\d+)`));
    if (m) cols = Number(m[1]);
    if (p === prefix) break;
  }
  return cols;
};

test('even counts never leave a single orphan card on any breakpoint', () => {
  for (const n of [2, 3, 4, 6, 8, 9, 12]) {
    for (const bp of ['', 'sm:', 'md:', 'lg:', 'xl:']) {
      const cols = columnsAt(cardGridCols(n), bp);
      const remainder = n % cols;
      assert.ok(remainder === 0 || remainder > 1 || cols === 1, `${n} items at ${bp || 'base'} -> ${cols} columns leaves one card alone`);
    }
  }
});
