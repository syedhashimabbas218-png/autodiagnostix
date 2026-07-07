// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://autodiagnostix.com.pk';

/** @returns {Promise<string[]>} */
async function getCmsSitemapPages() {
  const cmsUrl = process.env.PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';
  try {
    const [products, categories] = await Promise.all([
      fetch(`${cmsUrl}/api/products?populate[brand]=*&pagination[pageSize]=100`).then(r => r.ok ? r.json() : { data: [] }),
      fetch(`${cmsUrl}/api/categories?pagination[pageSize]=50`).then(r => r.ok ? r.json() : { data: [] }),
    ]);

    const urls = [];
    const seenBrands = new Set();

    if (Array.isArray(products.data)) {
      for (const p of products.data) {
        if (p.slug) urls.push(`${SITE}/product/${p.slug}`);
        if (p.brand?.name && !seenBrands.has(p.brand.name)) {
          seenBrands.add(p.brand.name);
          const slug = p.brand.name.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '');
          urls.push(`${SITE}/brand/${slug}`);
        }
      }
    }

    if (Array.isArray(categories.data)) {
      for (const c of categories.data) {
        urls.push(`${SITE}/category/${c.slug}`);
      }
    }

    // Core pages
    urls.push(
      `${SITE}/products`, `${SITE}/brands`, `${SITE}/about`, `${SITE}/contact`,
      // SEO pillar pages
      `${SITE}/car-lifts-in-pakistan`,
      `${SITE}/2-post-car-lifts-pakistan`,
      `${SITE}/4-post-car-lifts-pakistan`,
      `${SITE}/scissor-lifts-pakistan`,
      `${SITE}/bulletproof-car-lifts-pakistan`,
      `${SITE}/alignment-lifts-pakistan`,
      `${SITE}/launch-lifts-pakistan`,
      `${SITE}/launch-x431-pakistan`,
      `${SITE}/launch-injector-machines-pakistan`,
      `${SITE}/wheel-alignment-in-pakistan`,
      `${SITE}/tyre-changers-pakistan`,
      `${SITE}/wheel-balancers-pakistan`,
      `${SITE}/adas-calibration-pakistan`,
      `${SITE}/ev-diagnostics-pakistan`,
      `${SITE}/battery-testers-pakistan`,
      `${SITE}/videoscope-pakistan`,
      `${SITE}/workshop-equipment-pakistan`,
      `${SITE}/tyre-inflators-pakistan`,
    );
    return [...new Set(urls)];
  } catch {
    return [
      `${SITE}/products`, `${SITE}/brands`, `${SITE}/about`, `${SITE}/contact`,
      `${SITE}/car-lifts-in-pakistan`, `${SITE}/launch-x431-pakistan`,
      `${SITE}/workshop-equipment-pakistan`,
    ];
  }
}

export default defineConfig({
  output: 'server',
  site: SITE,
  trailingSlash: 'never',
  server: {
    host: true,
  },
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    react(),
    sitemap({
      customPages: await getCmsSitemapPages(),
      filter: (page) => !page.includes('/admin') && !page.includes('/api/'),
    }),
  ],
  vite: {
    css: {
      postcss: './postcss.config.cjs',
    },
    build: {
      rollupOptions: {
        external: ['puppeteer'],
      },
    },
  },
});
