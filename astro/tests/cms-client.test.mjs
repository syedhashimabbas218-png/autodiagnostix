import test from 'node:test';
import assert from 'node:assert/strict';
import { createCmsClient, CMSUnavailableError } from '../src/lib/cms-client.mjs';

test('published empty lookup is not an outage', async () => {
  const client = createCmsClient('https://cms.example', async () => Response.json({ data: [] }));
  assert.deepEqual((await client.read('/products?filters[slug][$eq]=unknown')).data, []);
});

test('HTTP, transport, JSON and response-shape failures are typed, not empty success', async () => {
  for (const fetcher of [
    async () => new Response('Unavailable', { status: 503 }),
    async () => { throw new Error('ECONNREFUSED'); },
    async () => new Response('invalid json'),
    async () => Response.json({ error: 'Not authorized' }),
  ]) {
    const client = createCmsClient('https://cms.example', fetcher);
    await assert.rejects(() => client.read('/products'), CMSUnavailableError);
  }
});

test('concurrent identical reads share transport and failed reads can recover', async () => {
  let calls = 0;
  const client = createCmsClient('https://cms.example/', async () => {
    calls++;
    return calls === 1 ? new Response('Down', { status: 500 }) : Response.json({ data: [{ slug: 'scanner' }] });
  });
  const failed = await Promise.allSettled([client.read('/products'), client.read('/products')]);
  assert.equal(calls, 1);
  assert.ok(failed.every(item => item.status === 'rejected'));
  assert.equal((await client.read('/products')).data[0].slug, 'scanner');
  assert.equal(calls, 2);
});

test('general catalog reads all 205 products instead of stopping at 100', async () => {
  const client = createCmsClient('https://cms.example', async url => {
    const page = Number(new URL(url).searchParams.get('pagination[page]'));
    const data = Array.from({ length: page === 3 ? 5 : 100 }, (_, i) => ({ slug: `product-${(page - 1) * 100 + i}` }));
    return Response.json({ data, meta: { pagination: { page, pageCount: 3, total: 205 } } });
  });
  const rows = await client.list('/products?populate[brand]=*');
  assert.equal(rows.length, 205);
  assert.equal(rows[204].slug, 'product-204');
});

test('category reads continue beyond 50 entries', async () => {
  const client = createCmsClient('https://cms.example', async url => {
    const params = new URL(url).searchParams;
    assert.equal(params.get('pagination[pageSize]'), '50');
    const page = Number(params.get('pagination[page]'));
    return Response.json({ data: Array.from({ length: page === 1 ? 50 : 7 }, (_, i) => ({ slug: `category-${page}-${i}` })), meta: { pagination: { page, pageCount: 2, total: 57 } } });
  });
  assert.equal((await client.list('/categories?populate=*', 50)).length, 57);
});

test('an incomplete or wrong CMS page cannot masquerade as a complete catalog', async () => {
  for (const pagination of [
    { page: 2, pageCount: 1, total: 1 },
    { page: 1, pageCount: 1, total: 50 },
    { page: 1, pageCount: -1 },
    { page: 1, total: -1 },
  ]) {
    const client = createCmsClient('https://cms.example', async () => Response.json({ data: [{ slug: 'tool' }], meta: { pagination } }));
    await assert.rejects(() => client.list('/products'), CMSUnavailableError);
  }
});

test('a later-page outage rejects the whole collection rather than returning partial data', async () => {
  let calls = 0;
  const client = createCmsClient('https://cms.example', async () => {
    if (++calls > 1) return new Response('Down', { status: 503 });
    return Response.json({ data: [{ slug: 'tool' }], meta: { pagination: { page: 1, pageCount: 2, total: 2 } } });
  });
  await assert.rejects(() => client.list('/products'), CMSUnavailableError);
});

test('metadata-free short collections and total-only pagination work', async () => {
  const short = createCmsClient('https://cms.example', async () => Response.json({ data: [{ slug: 'tool' }] }));
  assert.equal((await short.list('/products')).length, 1);
  let page = 0;
  const total = createCmsClient('https://cms.example', async () => Response.json({ data: [{ slug: `tool-${++page}` }], meta: { pagination: { total: 2 } } }));
  assert.equal((await total.list('/products')).length, 2);
});
