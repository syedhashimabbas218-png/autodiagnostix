import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = 'http://localhost:1337';
const ASTRO_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ASTRO_DIR, 'public');
const DOWNLOADS_DIR = path.join(PUBLIC_DIR, 'downloads');
const OUTPUT_FILE = path.join(DOWNLOADS_DIR, 'catalog.pdf');

const LOGO_PATH = path.join(PUBLIC_DIR, 'logo-full.png');
const LOGO_BASE64 = fs.readFileSync(LOGO_PATH).toString('base64');
const LOGO_DATA_URL = `data:image/png;base64,${LOGO_BASE64}`;

// Light logo (white "Autodiagnostix" text + red "AX" mark) used on dark backgrounds
const LOGO_LIGHT_PATH = path.join(PUBLIC_DIR, 'logo-light.png');
const LOGO_LIGHT_BASE64 = fs.readFileSync(LOGO_LIGHT_PATH).toString('base64');
const LOGO_LIGHT_DATA_URL = `data:image/png;base64,${LOGO_LIGHT_BASE64}`;

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const CATEGORY_ORDER = [
  { slug: 'scanners', tagline: 'Professional OBD-II diagnostic systems with bi-directional control, coding, and ADAS support' },
  { slug: 'wheel-alignment', tagline: '3D and wireless wheel alignment machines for precision service' },
  { slug: 'lifts-jacks', tagline: 'Heavy-duty 2-post, 4-post, scissor and mid-rise lifting solutions' },
  { slug: 'tire-changers', tagline: 'Motorcycle to commercial-grade tyre changers with pneumatic assist' },
  { slug: 'wheel-balancers', tagline: 'Digital and sonar wheel balancers for cars and light trucks' },
  { slug: 'maintenance', tagline: 'Battery testers, videoscopes, A/C service stations and injector cleaners' },
  { slug: 'ev-equipment', tagline: 'Electric vehicle battery diagnostics, equalization and charge-discharge equipment' },
];

async function fetchAllProducts() {
  const POPULATE = 'populate[brand][fields][0]=name&populate[category][fields][0]=slug&populate[category][fields][1]=name&populate[heroImages][populate][image][populate]=*&populate[technicalTable][fields][0]=label&populate[technicalTable][fields][1]=value';
  const res = await fetch(
    `${STRAPI_URL}/api/products?pagination[pageSize]=100&${POPULATE}`
  );
  const data = await res.json();
  if (!data.data) {
    throw new Error(`API returned: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data.data;
}

function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${STRAPI_URL}${url}`;
  return url;
}

function normalize(p) {
  const brands = Array.isArray(p.brand) ? p.brand.map(b => b.name) : (p.brand?.name ? [p.brand.name] : []);
  return {
    name: p.name,
    slug: p.slug,
    summary: p.summary || '',
    description: p.description || '',
    brands,
    categorySlug: p.category?.slug || 'other',
    categoryName: p.category?.name || 'Other',
    heroImages: (p.heroImages || [])
      .map(h => resolveImageUrl(h.image?.url))
      .filter(Boolean)
      .slice(0, 1),
    specs: (p.technicalTable || []).slice(0, 6),
    badge: p.badge || null,
  };
}

function groupByCategory(products) {
  const groups = new Map();
  for (const p of products) {
    if (!groups.has(p.categorySlug)) groups.set(p.categorySlug, []);
    groups.get(p.categorySlug).push(p);
  }
  for (const [, list] of groups) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}

function renderCoverPage(totalProducts, categoryCount) {
  return `
    <section class="page cover">
      <div class="cover-bg"></div>
      <div class="cover-content">
        <img src="${LOGO_LIGHT_DATA_URL}" alt="Autodiagnostix" class="cover-logo" />
        <div class="cover-eyebrow">Product Catalog</div>
        <h1 class="cover-title">The Complete<br/>Workshop<br/>Catalogue</h1>
        <div class="cover-stats">
          <div class="stat">
            <div class="stat-num">${totalProducts}</div>
            <div class="stat-label">Products</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="stat-num">${categoryCount}</div>
            <div class="stat-label">Categories</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="stat-num">5+</div>
            <div class="stat-label">Brands</div>
          </div>
        </div>
        <div class="cover-brands">
          LAUNCH &middot; SMARTSAFE &middot; UNITE &middot; Liberty Lifts &middot; GTI.tools
        </div>
        <div class="cover-foot">
          Pakistan's authorized dealer of professional automotive diagnostic equipment.<br/>
          <span class="cover-link">autodiagnostix.com</span> &middot; <span class="cover-link">sales@autodiagnostix.com</span>
        </div>
      </div>
    </section>
  `;
}

function renderTocPage(groups) {
  const rows = CATEGORY_ORDER
    .filter(c => groups.has(c.slug))
    .map((c, i) => {
      const list = groups.get(c.slug);
      return `
        <li class="toc-row">
          <span class="toc-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="toc-name">${escapeHtml(c.slug.replace(/-/g, ' '))}</span>
          <span class="toc-count">${list.length} ${list.length === 1 ? 'product' : 'products'}</span>
          <span class="toc-dots"></span>
        </li>
      `;
    }).join('');
  return `
    <section class="page toc">
      <div class="toc-header">
        <div class="toc-eyebrow">Contents</div>
        <h2 class="toc-title">Product Categories</h2>
      </div>
      <ul class="toc-list">${rows}</ul>
      <div class="toc-foot">
        <img src="${LOGO_DATA_URL}" alt="Autodiagnostix" />
        <div>Autodiagnostix Product Catalog &middot; ${new Date().getFullYear()}</div>
      </div>
    </section>
  `;
}

function renderCategoryDivider(cat, products, pageNum) {
  return `
    <section class="page divider">
      <div class="divider-bg"></div>
      <div class="divider-content">
        <div class="divider-eyebrow">Category ${String(pageNum).padStart(2, '0')}</div>
        <h2 class="divider-title">${escapeHtml(cat.slug.replace(/-/g, ' ').toUpperCase())}</h2>
        <p class="divider-tagline">${escapeHtml(cat.tagline)}</p>
        <div class="divider-stats">
          <span><strong>${products.length}</strong> products</span>
          <span class="dot">&middot;</span>
          <span><strong>${new Set(products.map(p => p.brands[0]).filter(Boolean)).size}</strong> brands</span>
        </div>
        <div class="divider-list">
          ${products.map((p, i) => `<span>${String(i + 1).padStart(2, '0')}. ${escapeHtml(p.name)}</span>`).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderProductCard(p) {
  const brand = p.brands[0] || '';
  const img = p.heroImages[0] || '';
  const specs = p.specs.slice(0, 4).map(s => `
    <div class="card-spec">
      <span class="card-spec-label">${escapeHtml(s.label)}</span>
      <span class="card-spec-value">${escapeHtml(s.value)}</span>
    </div>
  `).join('');
  return `
    <div class="card">
      <div class="card-image">
        ${img
          ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" />`
          : `<div class="card-image-placeholder">${escapeHtml(p.name.charAt(0))}</div>`
        }
        ${brand ? `<span class="card-brand">${escapeHtml(brand)}</span>` : ''}
        ${p.badge ? `<span class="card-badge">${escapeHtml(p.badge)}</span>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-name">${escapeHtml(p.name)}</h3>
        <p class="card-summary">${escapeHtml(p.summary)}</p>
        <div class="card-specs">${specs}</div>
        <a class="card-cta" href="https://autodiagnostix.com/product/${escapeHtml(p.slug)}">View product &rarr;</a>
      </div>
    </div>
  `;
}

function chunkProducts(products, size) {
  const out = [];
  for (let i = 0; i < products.length; i += size) {
    out.push(products.slice(i, i + size));
  }
  return out;
}

function renderCategoryPages(groups) {
  const pages = [];
  let pageNum = 0;
  for (const cat of CATEGORY_ORDER) {
    if (!groups.has(cat.slug)) continue;
    pageNum++;
    const products = groups.get(cat.slug);
    pages.push(renderCategoryDivider(cat, products, pageNum));
    const chunks = chunkProducts(products, 4);
    for (const chunk of chunks) {
      pages.push(`
        <section class="page products">
          <div class="products-header">
            <span class="products-eyebrow">${escapeHtml(cat.slug.replace(/-/g, ' ').toUpperCase())}</span>
            <span class="products-count">${chunk.length} of ${products.length}</span>
          </div>
          <div class="products-grid">
            ${chunk.map(renderProductCard).join('')}
          </div>
          <div class="products-foot">
            <img src="${LOGO_DATA_URL}" alt="Autodiagnostix" class="products-foot-logo" />
            <div class="products-foot-phones">
              <span>+92 300 1234567</span>
              <span class="dot">&middot;</span>
              <span>+92 42 1234567</span>
              <span class="dot">&middot;</span>
              <span>WhatsApp +92 321 7654321</span>
            </div>
          </div>
        </section>
      `);
    }
  }
  return pages;
}

function renderClosingPage() {
  return `
    <section class="page closing">
      <div class="closing-bg"></div>
      <div class="closing-content">
        <img src="${LOGO_LIGHT_DATA_URL}" alt="Autodiagnostix" class="closing-logo" />
        <h2 class="closing-title">Let's equip your workshop.</h2>
        <p class="closing-sub">From single-bay service centers to multi-site dealer networks, we supply and support the diagnostic equipment Pakistan's professionals trust.</p>
        <div class="closing-grid">
          <div>
            <div class="closing-label">Sales</div>
            <div class="closing-val">sales@autodiagnostix.com</div>
          </div>
          <div>
            <div class="closing-label">Support</div>
            <div class="closing-val">support@autodiagnostix.com</div>
          </div>
          <div>
            <div class="closing-label">Phone</div>
            <div class="closing-val">+92 (300) 000-0000</div>
          </div>
          <div>
            <div class="closing-label">Web</div>
            <div class="closing-val">autodiagnostix.com</div>
          </div>
        </div>
        <div class="closing-foot">Pakistan's authorized dealer of LAUNCH, SMARTSAFE, UNITE, Liberty Lifts, and GTI.tools</div>
      </div>
    </section>
  `;
}

function renderCatalogHtml(groups) {
  const totalProducts = Array.from(groups.values()).reduce((s, p) => s + p.length, 0);
  const cover = renderCoverPage(totalProducts, groups.size);
  const toc = renderTocPage(groups);
  const body = renderCategoryPages(groups);
  const closing = renderClosingPage();
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Autodiagnostix Product Catalog</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #0a0a0a; background: #fafafa; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 297mm; height: 210mm; position: relative; overflow: hidden; background: #fff; page-break-after: always; }
    .page:last-child { page-break-after: auto; }

    /* ========== COVER ========== */
    .cover { background: #0a0a0a; color: #fff; }
    .cover-bg {
      position: absolute; inset: 0;
      background:
        radial-gradient(circle at 20% 10%, rgba(151,0,13,0.35) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(151,0,13,0.25) 0%, transparent 40%),
        linear-gradient(135deg, #0a0a0a 0%, #1a0509 100%);
    }
    .cover-content { position: absolute; inset: 0; padding: 18mm 28mm 22mm; display: flex; flex-direction: column; justify-content: flex-start; }
    .cover-logo { height: 16mm; width: auto; align-self: flex-start; }
    .cover-eyebrow { font-size: 11pt; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-top: 14mm; }
    .cover-title { font-size: 76pt; font-weight: 800; letter-spacing: -0.04em; line-height: 0.95; margin: 4mm 0 0; }
    .cover-stats { display: flex; align-items: center; gap: 14mm; margin-top: 10mm; }
    .stat-num { font-size: 36pt; font-weight: 800; color: #fff; letter-spacing: -0.02em; line-height: 1; }
    .stat-label { font-size: 9pt; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-top: 2mm; }
    .stat-divider { width: 1px; height: 24mm; background: rgba(255,255,255,0.15); }
    .cover-brands { font-size: 11pt; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-top: auto; }
    .cover-foot { font-size: 9pt; color: rgba(255,255,255,0.55); line-height: 1.6; margin-top: 4mm; }
    .cover-link { color: #fff; }

    /* ========== TOC ========== */
    .toc { padding: 24mm 28mm; display: flex; flex-direction: column; }
    .toc-header { padding-bottom: 12mm; border-bottom: 2px solid #97000d; margin-bottom: 14mm; }
    .toc-eyebrow { font-size: 10pt; letter-spacing: 0.3em; text-transform: uppercase; color: #97000d; font-weight: 700; }
    .toc-title { font-size: 38pt; font-weight: 800; letter-spacing: -0.02em; margin: 4mm 0 0; }
    .toc-list { list-style: none; padding: 0; margin: 0; flex: 1; }
    .toc-row { display: flex; align-items: baseline; gap: 6mm; padding: 5mm 0; border-bottom: 1px solid #e4e4e7; font-size: 14pt; }
    .toc-num { font-weight: 800; color: #97000d; font-variant-numeric: tabular-nums; min-width: 14mm; }
    .toc-name { font-weight: 600; text-transform: capitalize; }
    .toc-count { font-size: 10pt; color: #71717a; letter-spacing: 0.05em; }
    .toc-dots { flex: 1; border-bottom: 1px dotted #d4d4d8; transform: translateY(-2mm); }
    .toc-foot { display: flex; align-items: center; gap: 6mm; padding-top: 12mm; border-top: 1px solid #e4e4e7; color: #71717a; font-size: 9pt; }
    .toc-foot img { height: 8mm; }

    /* ========== DIVIDER ========== */
    .divider { background: #0a0a0a; color: #fff; }
    .divider-bg {
      position: absolute; inset: 0;
      background:
        linear-gradient(120deg, #0a0a0a 0%, #1a0509 60%, #0a0a0a 100%);
    }
    .divider-content { position: absolute; inset: 0; padding: 24mm 28mm; display: flex; flex-direction: column; justify-content: center; }
    .divider-eyebrow { font-size: 12pt; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.55); font-weight: 600; }
    .divider-title { font-size: 88pt; font-weight: 800; letter-spacing: -0.04em; line-height: 0.95; margin: 4mm 0; color: #fff; }
    .divider-tagline { font-size: 14pt; color: rgba(255,255,255,0.7); max-width: 180mm; line-height: 1.5; margin: 0 0 16mm; }
    .divider-stats { display: flex; align-items: center; gap: 8mm; font-size: 11pt; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.85); margin-bottom: 14mm; }
    .divider-stats strong { color: #fff; font-size: 18pt; font-weight: 800; }
    .divider-stats .dot { color: rgba(255,255,255,0.3); }
    .divider-list { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 12mm; font-size: 11pt; color: rgba(255,255,255,0.85); }
    .divider-list span { padding: 1mm 0; }

    /* ========== PRODUCTS PAGE ========== */
    .products { padding: 16mm 18mm; display: flex; flex-direction: column; }
    .products-header { display: flex; align-items: baseline; justify-content: space-between; padding-bottom: 4mm; border-bottom: 1px solid #e4e4e7; margin-bottom: 8mm; }
    .products-eyebrow { font-size: 9pt; letter-spacing: 0.3em; text-transform: uppercase; color: #97000d; font-weight: 700; }
    .products-count { font-size: 8pt; color: #71717a; letter-spacing: 0.1em; text-transform: uppercase; }
    .products-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6mm; flex: 1; align-items: stretch; }
    .card { border: 1px solid #e4e4e7; border-radius: 6px; overflow: hidden; background: #fff; display: flex; flex-direction: column; break-inside: avoid; height: 100%; }
    .card-image { position: relative; aspect-ratio: 4/3; background: #fafafa; display: flex; align-items: center; justify-content: center; padding: 4mm; border-bottom: 1px solid #e4e4e7; }
    .card-image img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .card-image-placeholder { font-size: 32pt; font-weight: 800; color: #d4d4d8; }
    .card-brand { position: absolute; top: 3mm; left: 3mm; font-size: 7pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; background: #97000d; color: #fff; padding: 1mm 2.5mm; border-radius: 2px; }
    .card-badge { position: absolute; top: 3mm; right: 3mm; font-size: 7pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; background: #fef2f2; color: #b91c1c; border: 1px solid #b91c1c; padding: 1mm 2.5mm; border-radius: 2px; }
    .card-body { padding: 4mm 4mm 5mm; display: flex; flex-direction: column; gap: 2mm; flex: 1; }
    .card-name { font-size: 10pt; font-weight: 700; letter-spacing: -0.01em; line-height: 1.2; margin: 0; color: #18181b; min-height: 2.4em; }
    .card-summary { font-size: 8pt; line-height: 1.45; color: #52525b; margin: 1mm 0 2mm; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.6em; }
    .card-specs { display: flex; flex-direction: column; gap: 1mm; margin-top: auto; padding-top: 2mm; border-top: 1px solid #f4f4f5; }
    .card-spec { display: flex; flex-direction: column; gap: 0.5mm; }
    .card-spec-label { font-size: 6.5pt; letter-spacing: 0.1em; text-transform: uppercase; color: #a1a1aa; font-weight: 600; }
    .card-spec-value { font-size: 8pt; color: #18181b; font-weight: 500; line-height: 1.3; }
    .card-cta { font-size: 8pt; color: #97000d; font-weight: 700; text-decoration: none; margin-top: 2mm; letter-spacing: 0.05em; }
    .products-foot { display: flex; align-items: center; gap: 5mm; padding-top: 5mm; border-top: 1px solid #e4e4e7; margin-top: 6mm; font-size: 8pt; color: #71717a; }
    .products-foot-logo { height: 6mm; width: auto; flex-shrink: 0; }
    .products-foot-phones { display: flex; align-items: center; gap: 4mm; flex-wrap: wrap; }
    .products-foot-phones .dot { color: #d4d4d8; }
    .products-foot-phones span:not(.dot) { color: #97000d; font-weight: 600; }

    /* ========== CLOSING ========== */
    .closing { background: #0a0a0a; color: #fff; }
    .closing-bg {
      position: absolute; inset: 0;
      background:
        radial-gradient(circle at 80% 20%, rgba(151,0,13,0.4) 0%, transparent 40%),
        linear-gradient(135deg, #0a0a0a 0%, #1a0509 100%);
    }
    .closing-content { position: absolute; inset: 0; padding: 24mm 28mm; display: flex; flex-direction: column; justify-content: space-between; }
    /* Logo aspect ratio is 600:337 (≈1.78:1). Pin both dimensions to
       prevent the browser from distorting it on the closing page. */
    .closing-logo { height: 16mm; width: calc(16mm * 1.78); max-width: 100%; object-fit: contain; flex-shrink: 0; }
    .closing-title { font-size: 52pt; font-weight: 800; letter-spacing: -0.03em; line-height: 1; margin: 12mm 0 6mm; }
    .closing-sub { font-size: 13pt; color: rgba(255,255,255,0.7); max-width: 200mm; line-height: 1.5; }
    .closing-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8mm; padding: 12mm 0; border-top: 1px solid rgba(255,255,255,0.15); border-bottom: 1px solid rgba(255,255,255,0.15); margin: 8mm 0; }
    .closing-label { font-size: 9pt; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 2mm; }
    .closing-val { font-size: 13pt; color: #fff; font-weight: 500; }
    .closing-foot { font-size: 10pt; letter-spacing: 0.1em; color: rgba(255,255,255,0.55); }
  </style>
</head>
<body>
  ${cover}
  ${toc}
  ${body.join('\n')}
  ${closing}
</body>
</html>`;
}

async function main() {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  console.log(`Output: ${OUTPUT_FILE}`);

  console.log('Fetching products from Strapi...');
  const raw = await fetchAllProducts();
  console.log(`Found ${raw.length} products`);
  const products = raw.map(normalize);
  const groups = groupByCategory(products);
  console.log(`Categories: ${groups.size}`);

  const html = renderCatalogHtml(groups);
  const htmlPath = path.join(DOWNLOADS_DIR, 'catalog.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`Wrote intermediate HTML: ${htmlPath}`);

  console.log('Launching Puppeteer...');
  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  }).then(pdf => {
    fs.writeFileSync(OUTPUT_FILE, pdf);
    console.log(`✓ Wrote ${OUTPUT_FILE} (${(pdf.length / 1024).toFixed(1)} KB)`);
  });
  await browser.close();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
