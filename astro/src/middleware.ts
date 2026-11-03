import { defineMiddleware } from 'astro:middleware';
import { CMSUnavailableError } from './lib/cms-client.mjs';

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    return await next();
  } catch (error) {
    if (!(error instanceof CMSUnavailableError)) throw error;
    // Never expose CMS URLs, transport errors or stack traces to visitors.
    if (context.url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Catalog temporarily unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': '60', 'X-Robots-Tag': 'noindex' },
      });
    }
    context.locals.cmsUnavailable = true;
    const response = await context.rewrite('/404');
    const headers = new Headers(response.headers);
    headers.set('Retry-After', '60');
    headers.set('Cache-Control', 'no-store');
    return new Response(response.body, { status: 503, headers });
  }
});
