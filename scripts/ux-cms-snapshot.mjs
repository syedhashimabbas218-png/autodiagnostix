// Test-only deterministic public CMS data. Never imported by the application.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const cms = new URL(process.env.AUDIT_CMS_URL || 'https://strapi.autodiagnostix.com.pk');
const filename = new URL('../.playwright-mcp/ux-audit/cms-snapshot.json', import.meta.url);
if (process.argv[2] === 'capture') {
  const source = await readFile(new URL('../astro/src/lib/strapi.ts', import.meta.url), 'utf8');
  const populate = source.match(/const POPULATE = '([^']+)'/)[1];
  const queries = { products: `products?${populate}&pagination[pageSize]=100`, categories: 'categories?populate=*&pagination[pageSize]=50', brands: 'brands?populate=*' };
  const entries = await Promise.all(Object.entries(queries).map(async ([key, path]) => {
    const response = await fetch(new URL(`/api/${path}`, cms), { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`CMS snapshot ${key}: ${response.status}`);
    const json = await response.json();
    if (!json.data?.length) throw new Error(`Empty CMS snapshot: ${key}`);
    return [key, json];
  }));
  await mkdir(new URL('../.playwright-mcp/ux-audit/', import.meta.url), { recursive: true });
  await writeFile(filename, JSON.stringify(Object.fromEntries(entries)));
  console.log('Saved public CMS snapshot for deterministic visual/interaction tests.');
} else {
  const snapshot = JSON.parse(await readFile(filename, 'utf8'));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, options) => {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
    const key = url.pathname.replace(/^\/api\//, '');
    if (url.hostname !== cms.hostname || !snapshot[key] || (options?.method && options.method !== 'GET')) return originalFetch(input, options);
    const response = structuredClone(snapshot[key]);
    const slug = url.searchParams.get('filters[slug][$eq]');
    if (slug !== null) response.data = response.data.filter(item => item.slug === slug);
    return new Response(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' } });
  };
  console.log('TEST ONLY: serving a frozen public CMS snapshot. Do not use this process for Lighthouse measurements.');
}
