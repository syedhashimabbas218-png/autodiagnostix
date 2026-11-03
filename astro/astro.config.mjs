// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import { SITE_URL } from './src/utils/site.mjs';

export default defineConfig({
  output: 'server',
  site: SITE_URL,
  trailingSlash: 'never',
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
