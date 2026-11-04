// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import { SITE_URL } from './src/utils/site.mjs';

export default defineConfig({
  output: 'server',
  site: SITE_URL,
  trailingSlash: 'never',
  // Product slugs renamed when the 2026-11-04 import was replaced (see
  // scripts/replace-new-products.mjs). The video scope was a duplicate of
  // the existing VSP-600 entry.
  redirects: {
    '/product/launch-x-431-pro-se-2026': { status: 301, destination: '/product/launch-x-431-pro-se' },
    '/product/gti-tools-catalytic-dpf-cleaner-orange-ai': { status: 301, destination: '/product/gti-tools-catalytic-dpf-cleaner-c2025-ai' },
    '/product/gti-tools-catalytic-dpf-cleaner-blackred-hho-power-x': { status: 301, destination: '/product/gti-tools-catalytic-dpf-cleaner-hho-power-x' },
    '/product/launch-ismart-video400-videoscope': { status: 301, destination: '/product/vsp-600-video-scope' },
  },
  server: {
    host: true,
  },
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    react(),
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
