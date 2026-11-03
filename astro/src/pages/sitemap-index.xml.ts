import type { APIRoute } from 'astro';
import { canonicalUrl } from '../utils/site.mjs';

export const prerender = false;

export const GET: APIRoute = () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${canonicalUrl('/sitemap-0.xml')}</loc></sitemap></sitemapindex>`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } },
);
