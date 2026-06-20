import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = 'http://localhost:1337';
const ASTRO_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ASTRO_DIR, 'public');
const OUTPUT_DIR = path.join(ASTRO_DIR, 'output', 'pdfs');

const LOGO_PATH = path.join(PUBLIC_DIR, 'logo-full.png');
const LOGO_BASE64 = fs.readFileSync(LOGO_PATH).toString('base64');
const LOGO_DATA_URL = `data:image/png;base64,${LOGO_BASE64}`;

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function featureItem(text, i) {
  return `
    <li class="feat-item">
      <span class="num">${String(i + 1).padStart(2, '0')}</span>
      <span>${escapeHtml(text)}</span>
    </li>
  `;
}

function specCard(label, value) {
  return `
    <div class="spec-card">
      <span class="spec-label">${escapeHtml(label)}</span>
      <div class="spec-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function imageBlock(url, alt) {
  return `
    <div class="image-block">
      <img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />
    </div>
  `;
}

function renderPdfHtml(p) {
  const brandText = p.brands && p.brands.length > 0 ? p.brands.join(' / ') : '';
  const featureItems = (p.features || []).map((f, i) => featureItem(f.description || f.title, i)).join('');
  const functionItems = (p.functions || []).map((f, i) => featureItem(f.description || f.title, i)).join('');
  const specCards = (p.technicalTable || []).map(t => specCard(t.label, t.value)).join('');
  const imageBlocks = (p.heroImages || []).map((url, i) => imageBlock(url, `${p.name} image ${i + 1}`)).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(p.name)} — Technical Sheet</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #0a0a0a; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 210mm; min-height: 297mm; padding: 20mm 18mm; position: relative; }
    .header { text-align: center; padding-bottom: 6mm; border-bottom: 2px solid #97000d; margin-bottom: 10mm; }
    .header img { height: 12mm; width: auto; margin-bottom: 4mm; }
    .brand-name { font-size: 11pt; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; color: #97000d; }
    .brand-name.discontinued { color: #b91c1c; }
    .product-intro { text-align: center; margin-bottom: 10mm; }
    h1 { font-size: 22pt; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; margin: 0 0 3mm; }
    .summary { font-size: 10.5pt; line-height: 1.55; color: #3f3f46; max-width: 170mm; margin: 0 auto; }
    .badge { display: inline-block; padding: 3px 10px; background: #fef2f2; color: #97000d; border: 1px solid #97000d; border-radius: 999px; font-size: 8pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 3px; }
    .badge.discontinued { color: #b91c1c; border-color: #b91c1c; }
    .gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-bottom: 10mm; page-break-inside: avoid; }
    .gallery.images-1 { grid-template-columns: 1fr; }
    .gallery.images-3, .gallery.images-5 { grid-template-columns: 1fr 1fr 1fr; }
    .image-block { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 5mm; display: flex; align-items: center; justify-content: center; height: 75mm; break-inside: avoid; page-break-inside: avoid; }
    .image-block img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .section { margin-bottom: 10mm; page-break-inside: avoid; }
    .section-title { font-size: 10pt; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #97000d; margin-bottom: 4mm; padding-bottom: 2mm; border-bottom: 1px solid #e4e4e7; text-align: center; page-break-after: avoid; }
    .feat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 6mm; list-style: none; padding: 0; margin: 0; }
    .feat-item { display: flex; align-items: flex-start; gap: 3mm; font-size: 9.5pt; line-height: 1.5; color: #27272a; padding: 1mm 0; break-inside: avoid; page-break-inside: avoid; }
    .feat-item .num { flex-shrink: 0; min-width: 7mm; height: 7mm; padding: 0 2mm; display: inline-flex; align-items: center; justify-content: center; background: rgba(151, 0, 13, 0.08); color: #97000d; border-radius: 3px; font-size: 8.5pt; font-weight: 700; font-variant-numeric: tabular-nums; }
    .specs-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5mm; background: #e4e4e7; border: 1px solid #e4e4e7; border-radius: 6px; overflow: hidden; page-break-inside: avoid; }
    .spec-card { background: #fff; padding: 4mm 4mm; display: flex; flex-direction: column; gap: 2mm; break-inside: avoid; page-break-inside: avoid; }
    .spec-label { font-size: 7.5pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #71717a; }
    .spec-value { font-size: 11pt; font-weight: 500; color: #18181b; line-height: 1.3; }
    .footer { margin-top: 12mm; padding-top: 5mm; border-top: 1px solid #e4e4e7; text-align: center; font-size: 8pt; color: #71717a; }
    .footer img { height: 6mm; width: auto; margin-bottom: 1mm; }
    .footer .brand { color: #97000d; font-weight: 700; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <img src="${LOGO_DATA_URL}" alt="Autodiagnostix" />
      ${brandText ? `<div class="brand-name ${p.badge ? 'discontinued' : ''}">${escapeHtml(brandText)}</div>` : ''}
    </div>
    <div class="product-intro">
      <h1>${escapeHtml(p.name)}</h1>
      ${p.summary ? `<div class="summary">${escapeHtml(p.summary)}</div>` : ''}
      ${p.badge ? `<div style="margin-top:4mm"><span class="badge discontinued">${escapeHtml(p.badge)}</span></div>` : ''}
    </div>
    ${p.heroImages && p.heroImages.length > 0 ? `<div class="gallery images-${p.heroImages.length}">${imageBlocks}</div>` : ''}
    ${p.features && p.features.length > 0 ? `<div class="section"><div class="section-title">Key Features</div><ul class="feat-grid">${featureItems}</ul></div>` : ''}
    ${p.functions && p.functions.length > 0 ? `<div class="section"><div class="section-title">Functions</div><ul class="feat-grid">${functionItems}</ul></div>` : ''}
    ${p.technicalTable && p.technicalTable.length > 0 ? `<div class="section"><div class="section-title">Technical Specifications</div><div class="specs-grid">${specCards}</div></div>` : ''}
    <div class="footer">
      <img src="${LOGO_DATA_URL}" alt="Autodiagnostix" />
      <div><span class="brand">Autodiagnostix</span> — Pakistan's authorized dealer for LAUNCH, SMARTSAFE, UNITE</div>
      <div style="margin-top:1mm">autodiagnostix.com</div>
    </div>
  </div>
</body>
</html>`;
}

async function fetchAllProducts() {
  const POPULATE = 'populate[brand][fields][0]=name&populate[category][fields][0]=name&populate[heroImages][populate][image][populate]=*&populate[features][fields][0]=title&populate[features][fields][1]=description&populate[functions][fields][0]=title&populate[functions][fields][1]=description&populate[technicalTable][fields][0]=label&populate[technicalTable][fields][1]=value';
  const res = await fetch(
    `${STRAPI_URL}/api/products?pagination[pageSize]=100&${POPULATE}`
  );
  const data = await res.json();
  if (!data.data) {
    throw new Error(`API returned: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data.data;
}

function normalize(p) {
  const brands = Array.isArray(p.brand) ? p.brand.map(b => b.name) : (p.brand?.name ? [p.brand.name] : []);
  return {
    name: p.name,
    slug: p.slug,
    summary: p.summary || '',
    brands,
    category: p.category?.name || '',
    heroImages: (p.heroImages || []).map(h => {
      const url = h.image?.url;
      if (!url) return '';
      return url.startsWith('/uploads/') ? `${STRAPI_URL}${url}` : url;
    }).filter(Boolean),
    features: (p.features || []).map(f => ({ title: f.title, description: f.description })),
    functions: (p.functions || []).map(f => ({ title: f.title, description: f.description })),
    technicalTable: (p.technicalTable || []).map(t => ({ label: t.label, value: t.value })),
    badge: p.badge || null,
  };
}

function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'product';
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Output dir: ${OUTPUT_DIR}`);

  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const products = await fetchAllProducts();
  console.log(`Found ${products.length} products`);

  let ok = 0, failed = 0;
  for (const raw of products) {
    const p = normalize(raw);
    const filename = `${safeFilename(p.name)}-technical-sheet.pdf`;
    const filepath = path.join(OUTPUT_DIR, filename);
    try {
      const page = await browser.newPage();
      const html = renderPdfHtml(p);
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
      fs.writeFileSync(filepath, pdf);
      await page.close();
      ok++;
      console.log(`  ✓ ${p.name} -> ${filename}`);
    } catch (e) {
      failed++;
      console.log(`  ! Failed ${p.name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\nDone. Generated: ${ok}, Failed: ${failed}`);
  console.log(`PDFs saved to: ${OUTPUT_DIR}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
