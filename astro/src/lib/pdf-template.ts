import fs from 'fs';
import path from 'path';

const LOGO_PATH = path.join(process.cwd(), 'public', 'logo-full.png');
const LOGO_BASE64 = fs.readFileSync(LOGO_PATH).toString('base64');
const LOGO_DATA_URL = `data:image/png;base64,${LOGO_BASE64}`;

export interface PdfProduct {
  name: string;
  slug: string;
  summary: string;
  brands: string[];
  category: string;
  heroImages: string[];
  features: { title: string; description: string }[];
  functions: { title: string; description: string }[];
  technicalTable: { label: string; value: string }[];
  badge: string | null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function featureListItem(text: string, i: number): string {
  return `
    <li class="feat-item">
      <span class="num">${String(i + 1).padStart(2, '0')}</span>
      <span>${escapeHtml(text)}</span>
    </li>
  `;
}

function specCard(label: string, value: string): string {
  return `
    <div class="spec-card">
      <span class="spec-label">${escapeHtml(label)}</span>
      <div class="spec-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function imageBlock(url: string, alt: string): string {
  return `
    <div class="image-block">
      <img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />
    </div>
  `;
}

export function renderProductPdf(p: PdfProduct): string {
  const brandText = p.brands.length > 0 ? p.brands.join(' / ') : '';
  const featureItems = p.features.map((f, i) => featureListItem(f.description || f.title, i)).join('');
  const functionItems = p.functions.map((f, i) => featureListItem(f.description || f.title, i)).join('');
  const specCards = p.technicalTable.map(t => specCard(t.label, t.value)).join('');
  const imageBlocks = p.heroImages.map((url, i) => imageBlock(url, `${p.name} image ${i + 1}`)).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(p.name)} — Technical Sheet</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0a0a0a;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* Wrapper that spans the full content; per-page margins come from @page */
    .doc {
      width: 100%;
    }
    /* Each "page" is a logical section that may flow into the next */
    .page {
      width: 100%;
      padding-top: 0;
    }
    /* When a forced page break occurs, add top spacing so content
       doesn't hug the top of the next page */
    .page-break {
      break-before: page;
      page-break-before: always;
    }
    /* After a forced break, add extra breathing room */
    .page-break + * { margin-top: 0; }

    /* Section spacing + keep sections together where possible */
    .header { margin-bottom: 10mm; }
    .product-intro { margin-bottom: 10mm; }
    .gallery { margin-bottom: 10mm; }
    .section { margin-bottom: 10mm; page-break-inside: avoid; }
    .section:last-child { margin-bottom: 0; }

    /* Page break before sections that are heavy so they don't get cut */
    .section-title {
      page-break-after: avoid;
    }
    .feat-grid, .specs-grid, .gallery {
      page-break-inside: avoid;
    }
    /* Allow large lists to break across pages cleanly */
    .feat-item, .spec-card, .image-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .header {
      text-align: center;
      padding-bottom: 6mm;
      border-bottom: 2px solid #97000d;
      margin-bottom: 8mm;
    }
    .header img { height: 12mm; width: auto; margin-bottom: 4mm; }
    .brand-name {
      font-size: 11pt;
      font-weight: 800;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #97000d;
    }
    .brand-name.discontinued { color: #b91c1c; }

    .product-intro {
      text-align: center;
      margin-bottom: 8mm;
    }
    h1 {
      font-size: 22pt;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.15;
      margin: 0 0 3mm;
      color: #0a0a0a;
    }
    .summary {
      font-size: 10.5pt;
      line-height: 1.55;
      color: #3f3f46;
      max-width: 170mm;
      margin: 0 auto;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      background: #fef2f2;
      color: #97000d;
      border: 1px solid #97000d;
      border-radius: 999px;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin: 0 3px;
    }
    .badge.discontinued { color: #b91c1c; border-color: #b91c1c; }

    .gallery {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4mm;
      margin-bottom: 10mm;
    }
    .gallery.images-1 { grid-template-columns: 1fr; }
    .gallery.images-3,
    .gallery.images-5 { grid-template-columns: 1fr 1fr 1fr; }
    .image-block {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      padding: 5mm;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 75mm;
    }
    .image-block img { max-width: 100%; max-height: 100%; object-fit: contain; }

    .section { margin-bottom: 10mm; page-break-inside: avoid; }
    .section-title {
      font-size: 10pt;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #97000d;
      margin-bottom: 4mm;
      padding-bottom: 2mm;
      border-bottom: 1px solid #e4e4e7;
      text-align: center;
      page-break-after: avoid;
    }
    .feat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4mm 6mm;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .feat-item {
      display: flex;
      align-items: flex-start;
      gap: 3mm;
      font-size: 9.5pt;
      line-height: 1.5;
      color: #27272a;
      padding: 1mm 0;
    }
    .feat-item .num {
      flex-shrink: 0;
      min-width: 7mm;
      height: 7mm;
      padding: 0 2mm;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(151, 0, 13, 0.08);
      color: #97000d;
      border-radius: 3px;
      font-size: 8.5pt;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.5mm;
      background: #e4e4e7;
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      overflow: hidden;
    }
    .spec-card {
      background: #fff;
      padding: 4mm 4mm;
      display: flex;
      flex-direction: column;
      gap: 2mm;
    }
    .spec-label {
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #71717a;
    }
    .spec-value {
      font-size: 11pt;
      font-weight: 500;
      color: #18181b;
      line-height: 1.3;
    }
    .footer {
      margin-top: 12mm;
      padding-top: 5mm;
      border-top: 1px solid #e4e4e7;
      text-align: center;
      font-size: 8pt;
      color: #71717a;
    }
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

    ${p.heroImages.length > 0 ? `<div class="gallery images-${p.heroImages.length}">${imageBlocks}</div>` : ''}

    ${p.features.length > 0 ? `
      <div class="section">
        <div class="section-title">Key Features</div>
        <ul class="feat-grid">${featureItems}</ul>
      </div>
    ` : ''}

    ${p.functions.length > 0 ? `
      <div class="section">
        <div class="section-title">Functions</div>
        <ul class="feat-grid">${functionItems}</ul>
      </div>
    ` : ''}

    ${p.technicalTable.length > 0 ? `
      <div class="section">
        <div class="section-title">Technical Specifications</div>
        <div class="specs-grid">${specCards}</div>
      </div>
    ` : ''}

    <div class="footer">
      <img src="${LOGO_DATA_URL}" alt="Autodiagnostix" />
      <div><span class="brand">Autodiagnostix</span> — Pakistan's authorized dealer for LAUNCH, SMARTSAFE, UNITE</div>
      <div style="margin-top:1mm">autodiagnostix.com.pk</div>
    </div>
  </div>
</body>
</html>`;
}
