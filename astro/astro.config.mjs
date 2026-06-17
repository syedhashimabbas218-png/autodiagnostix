// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://autodiagnostix.com';

/** @returns {Promise<string[]>} */
async function getCmsSitemapPages() {
  const cmsUrl = process.env.PAYLOAD_URL || 'http://localhost:3000';
  try {
    const [products, categories, brands] = await Promise.all([
      fetch(`${cmsUrl}/api/products?limit=100&fields=id`).then(r => r.ok ? r.json() : { docs: [] }),
      fetch(`${cmsUrl}/api/categories?limit=50&fields=id,name`).then(r => r.ok ? r.json() : { docs: [] }),
      fetch(`${cmsUrl}/api/products?limit=100&fields=brand`).then(r => r.ok ? r.json() : { docs: [] }),
    ]);

    const urls = [];

    if (Array.isArray(products.docs)) {
      for (const p of products.docs) {
        if (p.id) urls.push(`${SITE}/product/${p.id}`);
      }
    }

    if (Array.isArray(categories.docs)) {
      for (const c of categories.docs) {
        urls.push(`${SITE}/category/${c.id}`);
      }
    }

    urls.push(`${SITE}/products`);
    urls.push(`${SITE}/brands`);

    if (Array.isArray(brands.docs)) {
      const seen = new Set();
      for (const p of brands.docs) {
        const name = (typeof p.brand === 'string') ? p.brand : p.brand?.name;
        if (name && !seen.has(name)) {
          seen.add(name);
          const slug = name.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '');
          urls.push(`${SITE}/brand/${slug}`);
        }
      }
    }

    return [...new Set(urls)];
  } catch {
    return [`${SITE}/products`, `${SITE}/brands`];
  }
}

export default defineConfig({
  output: 'static',
  site: SITE,
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    react(),
    sitemap({
      customPages: await getCmsSitemapPages(),
    }),
  ],
  vite: {
    css: {
      postcss: './postcss.config.cjs',
    },
  },
});
