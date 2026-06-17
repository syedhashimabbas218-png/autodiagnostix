import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const SITE_URL = 'https://autodiagnostix.com';

function getAllRoutes() {
  const staticRoutes = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/products', priority: '0.8', changefreq: 'weekly' },
    { loc: '/brands', priority: '0.7', changefreq: 'weekly' },
  ];

  // Try to read products.json and categories.json for dynamic routes
  const dataDir = path.resolve(__dirname, '../../api/data');
  const routes = [...staticRoutes];

  try {
    const productsPath = path.join(dataDir, 'products.json');
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
      products.forEach(p => {
        routes.push({
          loc: `/product/${p.id}`,
          priority: '0.9',
          changefreq: 'monthly',
        });
        const catSlug = (p.category || '')
          .toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
        if (catSlug && !routes.find(r => r.loc === `/category/${catSlug}`)) {
          routes.push({
            loc: `/category/${catSlug}`,
            priority: '0.8',
            changefreq: 'weekly',
          });
        }
        const brandSlug = (p.brand || '')
          .toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (brandSlug && !routes.find(r => r.loc === `/brand/${brandSlug}`)) {
          routes.push({
            loc: `/brand/${brandSlug}`,
            priority: '0.7',
            changefreq: 'weekly',
          });
        }
      });
    }
  } catch (err) {
    console.warn('Warning: Could not read product data for sitemap:', err.message);
  }

  return routes;
}

function generateSitemapXml(routes) {
  const urls = routes.map(r => `  <url>
    <loc>${SITE_URL}${r.loc}</loc>
    <priority>${r.priority}</priority>
    <changefreq>${r.changefreq}</changefreq>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

const routes = getAllRoutes();
const xml = generateSitemapXml(routes);

if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf-8');
console.log(`✅ sitemap.xml generated at ${path.join(DIST, 'sitemap.xml')} (${routes.length} URLs)`);
