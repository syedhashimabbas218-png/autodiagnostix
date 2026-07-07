import type { APIRoute } from 'astro';
import { getProduct } from '../../../lib/strapi';
import { renderProductPdf } from '../../../lib/pdf-template';

export const prerender = false;

let cachedPuppeteer: any = null;

async function getPuppeteer() {
  if (cachedPuppeteer) return cachedPuppeteer;
  const mod = await import('puppeteer');
  cachedPuppeteer = mod.default || mod;
  return cachedPuppeteer;
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug as string;
  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  const product = await getProduct(slug);
  if (!product) {
    return new Response('Product not found', { status: 404 });
  }

  const html = renderProductPdf({
    name: product.name,
    slug: product.slug,
    summary: product.summary,
    brands: product.brands && product.brands.length > 0 ? product.brands : [product.brand].filter(Boolean),
    category: product.category,
    heroImages: product.heroImages,
    features: product.features,
    functions: product.functions,
    technicalTable: product.technicalTable,
    badge: product.badge,
  });

  let browser: any;
  try {
    const puppeteer = await getPuppeteer();
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      }),
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    await browser.close();

    const safeName = product.name.replace(/[^a-zA-Z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    const filename = `${safeName || 'product'}-technical-sheet.pdf`;

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    console.error('PDF generation error:', err);
    return new Response(`Failed to generate PDF: ${err.message || 'Unknown error'}`, { status: 500 });
  }
};
