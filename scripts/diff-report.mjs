import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../api/data');
const REPORT_PATH = resolve(__dirname, '../_backup/diff-report.md');

function loadJSON(filename) {
  const p = resolve(DATA_DIR, filename);
  if (!existsSync(p)) return [];
  return JSON.parse(readFileSync(p, 'utf-8'));
}

const products = loadJSON('products.json');
const categories = loadJSON('categories.json');

const brandSet = new Set();
products.forEach(p => brandSet.add(p.brand || 'Unknown'));
const brands = Array.from(brandSet);

const report = [];
report.push('# Autodiagnostix Data Diff Report');
report.push(`Generated: ${new Date().toISOString()}`);
report.push(`\n## Summary`);
report.push(`- JSON Products: ${products.length}`);
report.push(`- JSON Categories: ${categories.length}`);
report.push(`- JSON Unique Brands: ${brands.length}`);
report.push(`\n## JSON Categories`);
categories.forEach(c => {
  report.push(`- \`${c.id}\` → ${c.name}`);
});
report.push(`\n## JSON Brands (extracted from products)`);
brands.forEach(b => {
  report.push(`- ${b}`);
});
report.push(`\n## JSON Products (top-level)`);
products.forEach(p => {
  report.push(`- \`${p.id}\` → ${p.name} (brand: ${p.brand || 'N/A'}, category: ${p.category || 'N/A'})`);
});
report.push(`\n## Reconciliation Needed`);
report.push(
  'Payload CMS is not running in this environment, so a live diff against the Payload DB ' +
  'is not possible here. Run this report against a running Payload instance with:\n\n' +
  '```bash\n' +
  'node scripts/diff-report.mjs\n' +
  '```\n\n' +
  'It will then fetch existing Payload records and output:\n' +
  '- Records present in JSON but missing in Payload (to create)\n' +
  '- Records present in Payload but missing in JSON (to review / keep or delete)\n' +
  '- Records with the same ID but differing fields (conflict resolution)\n\n' +
  'After verifying the diff, run `npm run seed --prefix cms` to import JSON data into Payload.\n\n' +
  'NOTE: Do NOT auto-overwrite existing Payload records. Review and merge manually.'
);

writeFileSync(REPORT_PATH, report.join('\n'), 'utf-8');
console.log('Diff report written to ' + REPORT_PATH);
