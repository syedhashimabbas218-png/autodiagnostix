import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { preview } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const DATA_DIR = path.resolve(__dirname, '../../api/data');
const PORT = 4173;

export function loadData(dataDir = DATA_DIR) {
  const productsPath = path.join(dataDir, 'products.json');
  const categoriesPath = path.join(dataDir, 'categories.json');

  if (!fs.existsSync(productsPath)) return null;

  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  const categories = fs.existsSync(categoriesPath)
    ? JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))
    : [];
  if (!Array.isArray(products) || !Array.isArray(categories)) {
    throw new Error('Prerender products.json and categories.json must contain arrays');
  }

  const brandMap = {};
  (products || []).forEach(p => {
    const name = typeof p.brand === 'string' ? p.brand : '';
    if (name && !brandMap[name]) {
      brandMap[name] = {
        id: name.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, ''),
        name,
      };
    }
  });
  const brands = Object.values(brandMap);

  return { products, categories, brands };
}

function toPayloadDocs(items) {
  return {
    docs: items,
    totalDocs: items.length,
    limit: 0,
    totalPages: 1,
    page: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };
}

function transformProduct(p) {
  return {
    ...p,
    brand: typeof p.brand === 'string' ? { name: p.brand } : p.brand,
    category: typeof p.category === 'string' ? { name: p.category } : p.category,
  };
}

export function buildRouteTable(data) {
  const routes = [
    { path: '/', file: 'index.html' },
    { path: '/products', file: 'products/index.html' },
    { path: '/brands', file: 'brands/index.html' },
  ];

  if (!data) return routes;

  const { products } = data;
  const seenCats = new Set();
  const seenBrands = new Set();

  products.forEach(p => {
    const id = String(p.id ?? '');
    if (!id || id === '.' || id === '..' || /[/\\\u0000-\u001f]/.test(id)) {
      throw new Error(`Invalid product route ID: ${JSON.stringify(p.id)}`);
    }
    routes.push({ path: `/product/${encodeURIComponent(id)}`, file: `product/${id}/index.html` });
    const catSlug = (p.category || '').toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
    if (catSlug && !seenCats.has(catSlug)) {
      seenCats.add(catSlug);
      routes.push({ path: `/category/${catSlug}`, file: `category/${catSlug}/index.html` });
    }
    const brandSlug = (p.brand || '').toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (brandSlug && !seenBrands.has(brandSlug)) {
      seenBrands.add(brandSlug);
      routes.push({ path: `/brand/${brandSlug}`, file: `brand/${brandSlug}/index.html` });
    }
  });

  for (const route of routes) {
    const relative = path.relative(DIST, path.resolve(DIST, route.file));
    if (relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error(`Route escapes the output directory: ${route.path}`);
    }
  }
  return [...new Map(routes.map(route => [route.path, route])).values()];
}

export function makeAPIHandler(data) {
  if (!data) return null;

  const { products, categories, brands } = data;
  const allProducts = products.map(transformProduct);

  const cache = {
    products: JSON.stringify(toPayloadDocs(allProducts)),
    categories: JSON.stringify(toPayloadDocs(categories)),
    brands: JSON.stringify(toPayloadDocs(brands)),
  };
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  return function handleAPI(route) {
    const url = new URL(route.request().url());
    const pathname = url.pathname;

    if (pathname === '/api/products') {
      const id = url.searchParams.get('where[id][equals]');
      if (id !== null) {
        const product = allProducts.find(x => String(x.id) === id);
        return route.fulfill({ headers, body: JSON.stringify(toPayloadDocs(product ? [product] : [])) });
      }
      return route.fulfill({ headers, body: cache.products });
    }

    if (pathname === '/api/categories') {
      return route.fulfill({ headers, body: cache.categories });
    }

    if (pathname === '/api/brands') {
      return route.fulfill({ headers, body: cache.brands });
    }

    return route.fulfill({ headers, status: 404, body: '{}' });
  };
}

export async function prerender({
  distDir = DIST,
  dataDir = process.env.PRERENDER_DATA_DIR || DATA_DIR,
  port = PORT,
  launchBrowser = () => chromium.launch({ headless: true }),
} = {}) {
  console.log('Prerendering...');

  const data = loadData(dataDir);
  if (!data) {
    throw new Error(`Missing legacy catalogue: ${path.join(dataDir, 'products.json')}. Set PRERENDER_DATA_DIR to an exported legacy catalogue; Astro does not use this script.`);
  }
  const routes = buildRouteTable(data);
  console.log(`Routes: ${routes.length}`);

  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error(`Missing build entry: ${path.join(distDir, 'index.html')}. Run vite build first.`);
  }

  let server;
  let browser;
  const captures = [];
  const handleAPI = makeAPIHandler(data);
  let failed = 0;
  try {
    // The existing Vite API works on Windows without npx.cmd, a shell,
    // child-process trees, log matching or speculative startup delays.
    server = await preview({
      root: path.resolve(__dirname, '..'),
      logLevel: 'error',
      build: { outDir: distDir },
      preview: { host: '127.0.0.1', port, strictPort: true, open: false },
    });
    const base = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await launchBrowser();

    for (const route of routes) {
      let page;
      try {
        page = await browser.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => {
          if (/\/api\/(products|categories|brands)(?:\?|$)/.test(response.url()) && !response.ok()) {
            errors.push(`Catalogue API ${response.status()}: ${response.url()}`);
          }
        });
        page.on('requestfailed', request => {
          if (/\/api\/(products|categories|brands)(?:\?|$)/.test(request.url())) {
            errors.push(`Catalogue request failed: ${request.failure()?.errorText || request.url()}`);
          }
        });
        await page.route(/\/api\//, handleAPI);
        const response = await page.goto(`${base}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
        if (!response?.ok()) throw new Error(`Navigation returned HTTP ${response?.status() ?? 'no response'}`);
        await page.waitForFunction(expectedPath => {
          const root = document.getElementById('root');
          const canonical = document.querySelector('link[rel="canonical"]');
          return root?.querySelector('nav') && root.querySelector('footer') &&
            root.querySelector('h1')?.textContent.trim() && document.title.trim() &&
            canonical && new URL(canonical.href).pathname === expectedPath;
        }, route.path, { timeout: 10000 });
        if (errors.length) throw new Error(errors.join('; '));
        captures.push({ file: route.file, html: await page.content() });
        console.log(`  \u2713 ${route.path}  ${await page.title()}`);
      } catch (err) {
        failed++;
        console.error(`  x ${route.path}: ${err.message.slice(0, 200)}`);
      } finally {
        await page?.close();
      }
    }

    if (failed) throw new Error(`${failed} of ${routes.length} routes failed; no prerendered files were written`);
    // Keep the original SPA entry while capturing all routes, rather than
    // serving a partly prerendered homepage to later browser navigations.
    for (const capture of captures) {
      const outputPath = path.join(distDir, capture.file);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(`${outputPath}.tmp`, capture.html, 'utf-8');
      fs.renameSync(`${outputPath}.tmp`, outputPath);
    }
    console.log(`\nDone: ${captures.length} ok, 0 failed`);
    return captures.length;
  } finally {
    try { await browser?.close(); }
    finally { await server?.close(); }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prerender().catch(err => {
    console.error('Prerender failed:', err.message);
    process.exitCode = 1;
  });
}
