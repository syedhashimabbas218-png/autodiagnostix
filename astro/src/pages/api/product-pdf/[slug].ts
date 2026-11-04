import type { APIRoute } from 'astro';
import { getProduct } from '../../../lib/strapi';
import { renderProductPdf } from '../../../lib/pdf-template';

export const prerender = false;

// Launching Chromium per request made each download take 15–60 s and fail
// under load. Keep one browser alive, render each sheet once per hour, and
// share in-flight renders between concurrent requests for the same product.
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 60;
const RENDER_TIMEOUT_MS = 25_000;

type Sheet = { pdf: Uint8Array; filename: string; expires: number };
const cache = new Map<string, Sheet>();
const inFlight = new Map<string, Promise<Sheet | null>>();

let cachedPuppeteer: any = null;
let browserPromise: Promise<any> | null = null;

async function getPuppeteer() {
  if (cachedPuppeteer) return cachedPuppeteer;
  const mod = await import('puppeteer');
  cachedPuppeteer = mod.default || mod;
  return cachedPuppeteer;
}

async function getBrowser() {
  if (browserPromise) {
    const browser = await browserPromise.catch(() => null);
    if (browser?.connected ?? browser?.isConnected?.()) return browser;
    browserPromise = null;
  }
  browserPromise = getPuppeteer().then(puppeteer => puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    }),
  }));
  const browser = await browserPromise;
  browser.on?.('disconnected', () => { browserPromise = null; });
  return browser;
}

async function renderSheet(slug: string): Promise<Sheet | null> {
  const product = await getProduct(slug);
  if (!product) return null;

  const html = renderProductPdf({
    name: product.name,
    slug: product.id,
    summary: product.summary,
    brands: product.brands && product.brands.length > 0 ? product.brands : [product.brand].filter(Boolean),
    category: product.category,
    heroImages: product.heroImages,
    features: product.features,
    functions: product.functions,
    technicalTable: product.technicalTable,
    badge: product.badge,
  });

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // `load` waits for images; networkidle0 could hang on a slow third party.
    await page.setContent(html, { waitUntil: 'load', timeout: RENDER_TIMEOUT_MS });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: RENDER_TIMEOUT_MS,
    });
    const safeName = product.name.replace(/[^a-zA-Z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    return { pdf, filename: `${safeName || 'product'}-technical-sheet.pdf`, expires: Date.now() + CACHE_TTL_MS };
  } finally {
    await page.close().catch(() => {});
  }
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug as string;
  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  let sheet = cache.get(slug);
  if (!sheet || sheet.expires < Date.now()) {
    let pending = inFlight.get(slug);
    if (!pending) {
      pending = renderSheet(slug).finally(() => inFlight.delete(slug));
      inFlight.set(slug, pending);
    }
    try {
      const rendered = await pending;
      if (!rendered) return new Response('Product not found', { status: 404 });
      sheet = rendered;
      cache.delete(slug);
      cache.set(slug, sheet);
      while (cache.size > CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value!);
    } catch (err) {
      // CMS outages are handled by middleware (503); anything else is a
      // rendering failure. Log details server-side, never to the visitor.
      if ((err as Error)?.name === 'CMSUnavailableError') throw err;
      console.error('PDF generation error:', err);
      return new Response('The technical sheet could not be generated right now. Please try again in a minute.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '30', 'Cache-Control': 'no-store' },
      });
    }
  }

  return new Response(sheet.pdf as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${sheet.filename}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
