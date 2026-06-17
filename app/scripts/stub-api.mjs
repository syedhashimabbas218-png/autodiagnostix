import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../api/data');
const PORT = parseInt(process.env.STUB_PORT || '3000', 10);

function loadData() {
  const productsPath = path.join(DATA_DIR, 'products.json');
  const categoriesPath = path.join(DATA_DIR, 'categories.json');

  if (!fs.existsSync(productsPath)) {
    console.error('No data found at', productsPath);
    return null;
  }

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

const data = loadData();
if (!data) {
  console.error('Stub API: no data, exiting');
  process.exit(1);
}

const { products, categories, brands } = data;
const allProducts = products.map(transformProduct);
const cache = {
  products: JSON.stringify(toPayloadDocs(allProducts)),
  categories: JSON.stringify(toPayloadDocs(categories)),
  brands: JSON.stringify(toPayloadDocs(brands)),
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (pathname === '/api/products') {
    const where = url.searchParams.get('where');
    if (where) {
      const m = where.match(/\[equals\]=([^&]+)/);
      if (m) {
        const product = allProducts.find(x => String(x.id) === m[1]) || null;
        return res.end(JSON.stringify(toPayloadDocs(product ? [product] : [])));
      }
    }
    return res.end(cache.products);
  }

  if (pathname === '/api/categories') {
    return res.end(cache.categories);
  }

  if (pathname === '/api/brands') {
    return res.end(cache.brands);
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(PORT, () => {
  console.log(`Stub API running on http://localhost:${PORT}`);
});
