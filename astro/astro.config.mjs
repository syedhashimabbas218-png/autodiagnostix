// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://autodiagnostix.com',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    css: {
      postcss: './postcss.config.cjs',
    },
  },
});
