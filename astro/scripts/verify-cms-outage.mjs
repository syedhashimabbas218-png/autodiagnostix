// Run only against a local test instance configured with an unreachable CMS.
import assert from 'node:assert/strict';

const base = process.env.CMS_OUTAGE_BASE_URL || 'http://127.0.0.1:4328';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Outage checks must target a local test instance');
const paths = ['/', '/products', '/brands', '/product/x-431-pro3-link', '/category/wheel-alignment', '/brand/launch', '/wheel-alignment-in-pakistan', '/api/search?q=lift', '/api/product-pdf/x-431-pro3-link', '/sitemap-0.xml'];
for (const path of paths) {
  const response = await fetch(`${base}${path}`);
  const body = await response.text();
  assert.equal(response.status, 503, path);
  assert.equal(response.headers.get('Retry-After'), '60', path);
  assert.equal(response.headers.get('Cache-Control'), 'no-store', path);
  assert.equal(body.includes('ECONNREFUSED') || body.includes('127.0.0.1:9'), false, 'Do not leak CMS transport details');
  if (!path.startsWith('/api/') && path !== '/sitemap-0.xml') {
    assert.ok(body.includes('Catalog temporarily unavailable'), path);
    assert.equal(body.includes('rel="canonical"'), false, path);
    assert.equal(body.includes('name="robots" content="noindex'), false, path);
  }
}
assert.equal((await fetch(`${base}/contact`)).status, 200, 'CMS-independent contact page remains available');
console.log(`${paths.length} outage routes returned retryable 503; contact remains 200.`);
