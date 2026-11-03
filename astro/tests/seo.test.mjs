import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { SITE_URL, canonicalUrl, normalizeSiteUrls, brandSlug } from '../src/utils/site.mjs';
import { CORE_PATHS, fetchSitemapRows, catalogSitemapUrls, loadSitemapUrls, sitemapXml } from '../src/utils/sitemap.mjs';
import { organizationSchema, productSchema, itemListSchema, webPageSchema, websiteSchema, breadcrumbListSchema, brandSchema } from '../src/utils/schema.ts';
import sharp from 'sharp';

test('canonical hostname, root, query and trailing slash policy', () => {
  assert.equal(canonicalUrl(), `${SITE_URL}/`);
  assert.equal(canonicalUrl('http://autodiagnostix.com.pk/products/?utm_source=x#top'), `${SITE_URL}/products`);
  assert.equal(canonicalUrl('/product/x-431-pro3-link'), `${SITE_URL}/product/x-431-pro3-link`);
  assert.equal(canonicalUrl('/brand/gtitools'), `${SITE_URL}/brand/gtitools`);
});

test('cross-domain canonicals are rejected', () => {
  assert.throws(() => canonicalUrl('https://launchx431.com.pk/'), /AutoDiagnostix/);
  assert.throws(() => canonicalUrl('//example.com/product/tool'), /AutoDiagnostix/);
});

test('schema normalization retains IDs, search templates and external identities', () => {
  const source = {
    '@id': 'https://autodiagnostix.com.pk/#organization',
    url: 'https://autodiagnostix.com.pk',
    target: 'https://autodiagnostix.com.pk/products?q={search_term_string}',
    sameAs: ['https://launchx431.com.pk/', 'https://www.wikidata.org/wiki/Q140443798'],
    text: 'Contact info@autodiagnostix.com.pk',
  };
  const result = normalizeSiteUrls(source);
  assert.equal(result['@id'], `${SITE_URL}/#organization`);
  assert.equal(result.url, `${SITE_URL}/`);
  assert.equal(result.target, `${SITE_URL}/products?q={search_term_string}`);
  assert.deepEqual(result.sameAs, source.sameAs);
  assert.equal(result.text, source.text);
  assert.equal(source.url, 'https://autodiagnostix.com.pk');
});

test('quote-only Product never invents offers, SKU, dates or reviews', () => {
  const result = productSchema({ id: 'tool', name: 'Tool', summary: 'Visible summary', price: 100000, brand: 'LAUNCH', heroImages: ['/tool.webp'] });
  for (const key of ['offers', 'sku', 'dateModified', 'review', 'aggregateRating', 'availability']) assert.equal(key in result, false);
  assert.equal(result.url, `${SITE_URL}/product/tool`);
  assert.deepEqual(result.image, [`${SITE_URL}/tool.webp`]);
  assert.equal(result.description, 'Visible summary');
});

test('schema does not expose an unrendered fallback description', () => {
  const result = productSchema({ id: 'tool', name: 'Tool', description: 'Not displayed on this product template' });
  assert.equal(result.description, undefined);
});

test('real brand relation values remain separate; missing brand is not guessed', () => {
  const result = productSchema({ id: 'tool', name: 'Tool', brand: 'Launch / SmartSafe', brands: ['Launch', 'SmartSafe', 'Launch'] });
  assert.deepEqual(result.brand, [{ '@type': 'Brand', name: 'Launch' }, { '@type': 'Brand', name: 'SmartSafe' }]);
  assert.equal(productSchema({ id: 'autool-tool', name: 'Tool' }).brand, undefined);
});

test('CollectionPage nests a genuine ItemList with sequential positions', () => {
  const result = itemListSchema([{ name: 'Tool', url: 'https://autodiagnostix.com.pk/product/tool' }], 'CollectionPage');
  assert.equal(result['@type'], 'CollectionPage');
  assert.equal(result.mainEntity['@type'], 'ItemList');
  assert.equal(result.mainEntity.itemListElement[0].position, 1);
  assert.equal(result.mainEntity.itemListElement[0].url, `${SITE_URL}/product/tool`);
  assert.equal('itemListElement' in result, false);
  assert.equal('dateModified' in result.mainEntity, false);
});

test('commercial pages have WebPage identity without manufactured freshness', () => {
  const result = webPageSchema({ headline: 'Equipment', description: 'Equipment selection', url: 'https://autodiagnostix.com.pk/products' });
  assert.equal(result['@type'], 'WebPage');
  assert.equal(result.isPartOf['@id'], websiteSchema()['@id']);
  assert.equal('datePublished' in result, false);
  assert.equal('dateModified' in result, false);
});

test('breadcrumb URLs use the production host', () => {
  const result = breadcrumbListSchema([{ name: 'Home', url: 'https://autodiagnostix.com.pk/' }]);
  assert.equal(result.itemListElement[0].item, `${SITE_URL}/`);
});

test('manufacturer schema does not equate dealer collection with manufacturer sameAs', () => {
  assert.equal('sameAs' in brandSchema({ name: 'LAUNCH', url: `${SITE_URL}/brand/launch` }), false);
});

const catalog = {
  products: [
    { slug: 'scanner', brand: [{ name: 'Launch' }, { name: 'SmartSafe' }] },
    { slug: 'changer', brand: { name: 'GTI.tools' } },
  ],
  categories: [{ slug: 'scanners' }],
  brands: [{ name: 'LAUNCH', slug: 'launch' }, { name: 'GTI.tools', slug: 'gti-tools' }, { name: 'AUTOOL', slug: 'autool' }],
};

test('sitemap includes catalog, brand arrays and brands without assigned products', () => {
  const urls = catalogSitemapUrls(catalog);
  for (const path of ['/product/scanner', '/product/changer', '/category/scanners', '/brand/launch', '/brand/smartsafe', '/brand/autool', '/brand/gtitools']) {
    assert.ok(urls.includes(canonicalUrl(path)), path);
  }
  assert.equal(urls.includes(canonicalUrl('/brand/gti-tools')), false);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.every(url => url.startsWith(`${SITE_URL}/`)));
  assert.ok(urls.every(url => !/\/admin|\/api\/|\?|#/.test(url)));
  assert.equal(brandSlug('GTI.tools'), 'gtitools');
});

test('every core sitemap path corresponds to an existing page, not a new landing page', () => {
  for (const path of CORE_PATHS) {
    const file = path === '/' ? 'index' : path.slice(1);
    const flat = new URL(`../src/pages/${file}.astro`, import.meta.url);
    const index = new URL(`../src/pages/${file}/index.astro`, import.meta.url);
    assert.ok([flat, index].some(url => { try { readFileSync(url); return true; } catch { return false; } }), path);
  }
});

test('invalid slugs and empty catalogs fail instead of silently omitting URLs', () => {
  assert.throws(() => catalogSitemapUrls({ ...catalog, products: [] }), /empty/);
  assert.throws(() => catalogSitemapUrls({ ...catalog, products: [{ slug: '../admin' }] }), /slug/);
  assert.throws(() => catalogSitemapUrls({ ...catalog, categories: [{ slug: undefined }] }), /slug/);
});

test('all CMS pages are read past the original 100-product cap', async () => {
  const calls = [];
  const rows = await fetchSitemapRows('https://cms.example/', 'products?populate[brand]=*', async url => {
    calls.push(url);
    const page = Number(new URL(url).searchParams.get('pagination[page]'));
    const data = Array.from({ length: page === 3 ? 5 : 100 }, (_, i) => ({ slug: `tool-${(page - 1) * 100 + i}` }));
    return Response.json({ data, meta: { pagination: { page, pageCount: 3, total: 205 } } });
  });
  assert.equal(rows.length, 205);
  assert.equal(calls.length, 3);
  assert.equal(new URL(calls[0]).searchParams.get('populate[brand]'), '*');
});

test('pagination supports total-only and no-metadata responses', async () => {
  let page = 0;
  const rows = await fetchSitemapRows('https://cms.example', 'products', async () => Response.json({ data: [{ id: ++page }], meta: { pagination: { total: 2 } } }));
  assert.equal(rows.length, 2);
  assert.equal((await fetchSitemapRows('https://cms.example', 'products', async () => Response.json({ data: [{ id: 1 }] }))).length, 1);
});

test('HTTP, JSON, shape and partial-page errors reject sitemap generation', async () => {
  for (const fetcher of [
    async () => new Response('down', { status: 503 }),
    async () => new Response('not json'),
    async () => Response.json({ error: 'forbidden' }),
    async () => Response.json({ data: [], meta: { pagination: { page: 1, pageCount: 2, total: 5 } } }),
    async () => Response.json({ data: [{ id: 1 }], meta: { pagination: { page: 1, pageCount: 1, total: 5 } } }),
  ]) await assert.rejects(() => fetchSitemapRows('https://cms.example', 'products', fetcher));
});

test('loading never falls back to a partial list if any catalog source fails', async () => {
  await assert.rejects(() => loadSitemapUrls('https://cms.example', async () => new Response('down', { status: 500 })));
});

test('XML escapes values and emits no fabricated lastmod', () => {
  const xml = sitemapXml(['https://example.com/?a=1&b=<test>']);
  assert.ok(xml.includes('&amp;b=&lt;test&gt;'));
  assert.equal(xml.includes('lastmod'), false);
});

test('origin robots sitemap is canonical and training exceptions do not override edge policy', () => {
  const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
  assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap-index.xml`));
  assert.match(robots, /User-agent: GPTBot\s+Disallow: \//);
  assert.match(robots, /User-agent: Claude-Web\s+Disallow: \//);
  assert.ok(robots.includes('Disallow: /admin'));
  assert.ok(robots.includes('Disallow: /api/'));
});

test('all commercial page callers use WebPage rather than Article', () => {
  const pagesDir = new URL('../src/pages/', import.meta.url);
  for (const file of readdirSync(pagesDir).filter(name => name.endsWith('.astro'))) {
    assert.equal(readFileSync(new URL(file, pagesDir), 'utf8').includes('articleSchema('), false, file);
  }
});

test('preferred favicon is the restored AX brand, never the framework default', () => {
  const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
  assert.ok(svg.includes('AutoDiagnostix AX'));
  assert.equal(svg.includes('#863bff'), false);
  const legacy = readFileSync(new URL('../../app/public/favicon.svg', import.meta.url), 'utf8');
  assert.equal(legacy, svg);
  assert.ok(readFileSync(new URL('../../app/index.html', import.meta.url), 'utf8').includes('favicon.svg?v=ax-20261103'));
  const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
  assert.ok(layout.includes('favicon.svg?v=ax-20261103'));
  assert.ok(layout.includes('type="image/png" sizes="48x48"'));
  assert.equal(layout.includes('type="image/png" href="/favicon.webp"'), false);
  assert.equal(organizationSchema().logo, `${SITE_URL}/logo-full.webp`);
});

test('restored raster icons are square, correctly sized, and ICO has multiple frames', async () => {
  for (const [file, size] of [['favicon-32x32.png', 32], ['favicon-48x48.png', 48], ['apple-touch-icon.png', 180]]) {
    const metadata = await sharp(readFileSync(new URL(`../public/${file}`, import.meta.url))).metadata();
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
    assert.equal(metadata.format, 'png');
  }
  const ico = readFileSync(new URL('../public/favicon.ico', import.meta.url));
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
});
