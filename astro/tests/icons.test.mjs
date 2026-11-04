import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = new URL('../src/', import.meta.url).pathname;

function files(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  }).filter(path => /\.(astro|tsx?|jsx?)$/.test(path));
}

test('every Material Symbols ligature is included in the self-hosted subset font', async () => {
  const { ICON_NAMES: listed } = await import('../scripts/fetch-fonts.mjs');
  assert.deepEqual(listed, [...listed].sort(), 'Google Fonts requires icon_names in alphabetical order');

  const used = new Set();
  for (const file of files(SRC)) {
    for (const match of readFileSync(file, 'utf8').matchAll(/material-symbols-outlined[^>]*>\s*([a-z0-9_]+)\s*</g)) {
      used.add(match[1]);
    }
  }
  const missing = [...used].filter(name => !listed.includes(name));
  assert.deepEqual(missing, [], `Add these icons to ICON_NAMES in scripts/fetch-fonts.mjs and re-run it: ${missing.join(', ')}`);
});
