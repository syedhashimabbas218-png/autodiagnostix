import type { APIRoute } from 'astro';
import { CMS_URL } from '../lib/strapi';
import { loadSitemapUrls, sitemapXml } from '../utils/sitemap.mjs';

export const prerender = false;

let cached: { xml: string; expires: number } | undefined;
let pending: Promise<string> | undefined;

export const GET: APIRoute = async () => {
  try {
    if (!cached || cached.expires <= Date.now()) {
      pending ??= loadSitemapUrls(CMS_URL).then(urls => {
        const xml = sitemapXml(urls);
        cached = { xml, expires: Date.now() + 300_000 };
        return xml;
      }).finally(() => { pending = undefined; });
      await pending;
    }
    return new Response(cached!.xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  } catch (error) {
    console.error('Catalog sitemap unavailable:', error instanceof Error ? error.message : 'CMS error');
    return new Response('Sitemap temporarily unavailable. Please retry.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '60' },
    });
  }
};
