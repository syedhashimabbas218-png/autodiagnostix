// Test the actual helper against a local read-only HTTP fixture, not production.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

let calls = 0;
let mode = 'success';
const server = createServer((request, response) => {
  calls++;
  response.setHeader('Content-Type', 'application/json');
  if (mode === 'malformed') return response.end('{broken');
  if (mode === 'aborted-body') {
    response.write('{"data":');
    return setTimeout(() => response.destroy(), 50);
  }
  if (request.url.startsWith('/api/brands')) {
    const slug = new URL(request.url, 'http://localhost').searchParams.get('filters[slug][$eq]');
    return response.end(JSON.stringify({ data: slug === 'autool' ? [{ slug: 'autool', name: 'AUTOOL', description: 'Existing CMS description' }] : [] }));
  }
  response.end(JSON.stringify({ data: [{ slug: 'test-product', name: 'Test product', summary: 'Original summary', description: 'Original description', brand: { name: 'Launch' }, category: { name: 'Scanners' }, heroImages: [], features: [], functions: [], technicalTable: [], specs: [] }] }));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
try {
  const source = (await readFile('astro/src/lib/strapi.ts', 'utf8')).replace(/^const CMS_URL = .*;$/m, `const CMS_URL = ${JSON.stringify(url)};`);
  const module = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`);
  const products = await Promise.all(Array.from({ length: 10 }, () => module.getProducts({ summaryOnly: true })));
  assert.equal(calls, 1, 'Concurrent identical queries must share a request');
  assert(products.every(list => list[0].summary === 'Original summary'));
  mode = 'malformed';
  assert.deepEqual(await module.getProducts({ summaryOnly: true }), []);
  mode = 'aborted-body';
  assert.deepEqual(await module.getProducts({ summaryOnly: true }), []);
  mode = 'success';
  assert.equal((await module.getProducts({ summaryOnly: true }))[0].id, 'test-product');
  assert.equal((await module.getBrandDetails('autool')).name, 'AUTOOL');
  assert.equal(await module.getBrandDetails('missing'), null, 'Fixture should model unknown brands');
  console.log('PASS request deduplication, body-error recovery, fresh reads and CMS-only brands');
} finally { await new Promise(resolve => server.close(resolve)); }
