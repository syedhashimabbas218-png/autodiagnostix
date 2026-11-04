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

test('excerpt cuts at a word boundary and only adds an ellipsis when it cuts', async () => {
  const { excerpt } = await import('../src/utils/grid.mjs');
  assert.equal(excerpt('Short summary.'), 'Short summary.');
  const long = 'Heavy-duty 6.8 ton two-post lift with auto-manual dual operation, designed for super-heavy-duty cars, SUVs, and light commercial vehicles. '.repeat(4);
  const out = excerpt(long, 120);
  assert.ok(out.length <= 121 && out.endsWith('…'));
  assert.ok(long.startsWith(out.slice(0, -1)), 'is a prefix of the original');
  assert.match(out.slice(0, -1), /\w$/, 'does not end on punctuation or a partial separator');
});
