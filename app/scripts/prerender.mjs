import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const DATA_DIR = path.resolve(__dirname, '../../api/data');
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

function loadData() {
  const productsPath = path.join(DATA_DIR, 'products.json');
  const categoriesPath = path.join(DATA_DIR, 'categories.json');

  if (!fs.existsSync(productsPath)) return null;

  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  const categories = fs.existsSync(categoriesPath)
    ? JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))
    : [];

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

function buildRouteTable(data) {
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
    routes.push({ path: `/product/${p.id}`, file: `product/${p.id}/index.html` });
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

  return routes;
}

function makeAPIHandler(data) {
  if (!data) return null;

  const { products, categories, brands } = data;
  const allProducts = products.map(transformProduct);

  const cache = {
    products: JSON.stringify(toPayloadDocs(allProducts)),
    categories: JSON.stringify(toPayloadDocs(categories)),
    brands: JSON.stringify(toPayloadDocs(brands)),
  };

  return function handleAPI(route) {
    const url = new URL(route.request().url());
    const pathname = url.pathname;

    if (pathname === '/api/products') {
      const where = url.searchParams.get('where');
      if (where) {
        const m = where.match(/\[equals\]=([^&]+)/);
        if (m) {
          const product = allProducts.find(x => String(x.id) === m[1]) || null;
          return route.fulfill({ body: JSON.stringify(toPayloadDocs(product ? [product] : [])) });
        }
      }
      return route.fulfill({ body: cache.products });
    }

    if (pathname === '/api/categories') {
      return route.fulfill({ body: cache.categories });
    }

    if (pathname === '/api/brands') {
      return route.fulfill({ body: cache.brands });
    }

    route.fulfill({ status: 404, body: '{}' });
  };
}

function startServer(command, args, name) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: path.resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let started = false;
    const timeout = setTimeout(() => {
      if (!started) { proc.kill(); reject(new Error(`${name} did not start within 15s`)); }
    }, 15000);
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('exit', (code) => {
      if (!started) { clearTimeout(timeout); reject(new Error(`${name} exited with code ${code}`)); }
    });
    setTimeout(() => {
      if (!started) { started = true; clearTimeout(timeout); resolve(proc); }
    }, 8000);

    function onData(data) {
      const text = data.toString();
      if (!started && text.includes('Local:')) {
        started = true;
        clearTimeout(timeout);
        resolve(proc);
      }
    }
  });
}

async function prerender() {
  console.log('Prerendering...');

  const data = loadData();
  const routes = buildRouteTable(data);
  console.log(`Routes: ${routes.length}`);

  if (!data) {
    console.log('(static routes only -- no product data found)');
  }

  let serverProc;
  try {
    serverProc = await startServer('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], 'preview');
  } catch (err) {
    console.error('Failed to start preview:', err.message);
    return;
  }

  const handleAPI = makeAPIHandler(data);
  const browser = await chromium.launch({ headless: true });
  let success = 0;
  let failed = 0;

  for (const route of routes) {
    const url = `${BASE}${route.path}`;
    const outputPath = path.join(DIST, route.file);

    try {
      const page = await browser.newPage();

      if (handleAPI) {
        await page.route(/\/api\//, handleAPI);
      }

      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(500);
      const html = await page.content();
      await page.close();

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, html, 'utf-8');

      const hasTitle = html.includes('<title');
      const hasContent = html.length > 2000;
      if (hasTitle && hasContent) {
        success++;
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);
        console.log(`  \u2713 ${route.path}  ${titleMatch ? titleMatch[1] : ''}`);
      } else {
        success++;
        console.log(`  ? ${route.path} (${html.length} bytes)`);
      }
    } catch (err) {
      failed++;
      console.error(`  x ${route.path}: ${err.message.slice(0, 80)}`);
    }
  }

  await browser.close().catch(() => {});
  if (serverProc) serverProc.kill();

  console.log(`\nDone: ${success} ok, ${failed} failed`);
}

prerender().catch(err => {
  console.error('Prerender failed:', err.message);
  process.exit(0);
});
