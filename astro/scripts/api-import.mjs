import fs from 'fs';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const SOURCE = '/home/syedhashimabbas/Downloads/scrape-ledas/data/scraped_products.json';

let TOKEN;

async function api(method, urlPath, body) {
  const opts = {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${STRAPI_URL}${urlPath}`, opts);
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

async function login() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const d = await res.json();
  TOKEN = d.data.token;
  console.log('Logged in');
}

async function createAndPublish(contentType, data, label, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const created = await api('POST', `/content-manager/collection-types/${contentType}`, data);
    if (!created.ok) {
      const msg = JSON.stringify(created.data).slice(0, 200);
      if (attempt < retries) {
        console.log(`  Retry ${attempt} for ${label}: ${msg}`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      console.error(`  FAILED ${label}: ${msg}`);
      return null;
    }
    const docId = created.data.data.documentId;
    console.log(`  Created ${label} (docId=${docId})`);

    const published = await api('POST', `/content-manager/collection-types/${contentType}/${docId}/actions/publish`, {});
    if (!published.ok) {
      console.error(`  WARN publish ${label}: ${JSON.stringify(published.data).slice(0, 100)}`);
    }
    return docId;
  }
  return null;
}

const CATEGORY_MAP = {
  1: 'Diagnostic Scanners', 2: 'Diagnostic Scanners', 3: 'Diagnostic Scanners',
  4: 'Service Tools', 5: 'Service Tools', 6: 'Service Tools',
  7: 'Inspection Scopes', 8: 'Inspection Scopes',
  9: 'Service Tools', 10: 'Service Tools', 11: 'Service Tools', 12: 'Service Tools',
  13: 'A/C Service',
  14: 'Wheel Alignment', 15: 'Wheel Alignment', 16: 'Wheel Alignment',
  17: 'ADAS Calibration',
  18: 'Lifting Equipment', 19: 'Lifting Equipment',
  20: 'EV Battery Service', 21: 'EV Battery Service', 22: 'EV Battery Service',
};

const CATEGORIES = [
  ['Diagnostic Scanners', 'Professional vehicle diagnostic scanners for comprehensive system analysis.', 'qr_code_scanner'],
  ['A/C Service', 'Air conditioning service stations for vehicle AC systems.', 'ac_unit'],
  ['EV Battery Service', 'Electric vehicle battery diagnostic and service equipment.', 'battery_charging_full'],
  ['Lifting Equipment', 'Professional vehicle lifts, jacks, and stands for workshop use.', 'vertical_align_top'],
  ['Wheel Alignment', '3D wheel alignment systems for precise vehicle geometry.', 'settings_input_component'],
  ['ADAS Calibration', 'Advanced driver-assistance systems calibration tools.', 'car_crash'],
  ['Inspection Scopes', 'Video scopes and inspection cameras for internal diagnostics.', 'tire_repair'],
  ['Service Tools', 'Specialized service tools for TPMS, battery, spark plugs, and more.', 'build'],
];

const BRAND_DESC = {
  'Launch': 'Leading manufacturer of automotive diagnostic equipment and solutions.',
  'Autool': 'Manufacturer of specialized automotive service tools and test equipment.',
  'SmartSafe': 'Authorized distributor of professional automotive diagnostic equipment.',
};

function normalizeBrand(name) {
  if (!name) return 'Launch';
  if (name.includes('/')) return name.split('/')[0].trim();
  return name.trim();
}

function parseFeatures(features, functions) {
  const result = [];
  const seen = new Set();

  const add = (text) => {
    if (!text || seen.has(text)) return;
    seen.add(text);
    let title = text;
    let desc = '';
    if (text.includes(':')) {
      title = text.split(':')[0].trim();
      desc = text.slice(title.length + 1).trim();
    }
    result.push({ title, description: desc });
  };

  // Features are comma-separated strings in an array
  for (const entry of (features || [])) {
    if (typeof entry === 'string') {
      for (const part of entry.split(',').map(s => s.trim())) {
        if (part) add(part);
      }
    }
  }

  // Functions are individual entries
  for (const entry of (functions || [])) {
    if (typeof entry === 'string' && entry.trim()) {
      add(entry.trim());
    }
  }

  return result;
}

function buildSpecs(specifications) {
  const result = [];
  if (!specifications || typeof specifications !== 'object') return result;
  for (const [key, value] of Object.entries(specifications)) {
    if (value !== null && value !== undefined && String(value).trim()) {
      result.push({ label: key, value: String(value) });
    }
  }
  return result;
}

async function main() {
  await login();

  const source = JSON.parse(fs.readFileSync(SOURCE, 'utf-8'));
  const scrapedProducts = source.products.filter(p => p.status === 'scraped' || !p.status);

  // 1. Create brands
  console.log('\n=== Creating Brands ===');
  const brandNameToDocId = {};
  for (const p of scrapedProducts) {
    const name = normalizeBrand(p.brand);
    if (!brandNameToDocId[name]) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const docId = await createAndPublish('api::brand.brand', {
        name,
        slug,
        description: BRAND_DESC[name] || '',
        website: name === 'Launch' ? 'https://launchx431.com.pk' : '',
      }, `Brand: ${name}`);
      if (docId) brandNameToDocId[name] = docId;
    }
  }

  // 2. Create categories
  console.log('\n=== Creating Categories ===');
  const catNameToDocId = {};
  for (const [name, desc, icon] of CATEGORIES) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const docId = await createAndPublish('api::category.category', {
      name,
      slug,
      tagline: desc,
      description: desc,
      icon,
    }, `Category: ${name}`);
    if (docId) catNameToDocId[name] = docId;
  }

  // 3. Create products
  console.log('\n=== Creating Products ===');
  for (const p of scrapedProducts) {
    const name = p.name || p.title || '';
    const slug = p.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace(/-+$/, '');
    const brandName = normalizeBrand(p.brand);
    const catName = CATEGORY_MAP[p.num] || 'Service Tools';
    const brandDocId = brandNameToDocId[brandName];
    const catDocId = catNameToDocId[catName];

    let description = p.description || p.long_description || '';
    let summary = p.short_description || '';
    if (!summary && description) {
      summary = description.length > 300 ? description.slice(0, 297) + '...' : description;
    }
    if (!summary) summary = name;

    const features = parseFeatures(p.features, p.functions);
    const technicalTable = buildSpecs(p.specifications);

    const productData = {
      name,
      slug,
      summary,
      description,
      badge: p.badge || null,
      price: p.price ? Number(p.price) : null,
      features,
      technicalTable,
      brand: brandDocId,
      category: catDocId,
    };

    console.log(`  Product: ${name} (${slug})`);
    const docId = await createAndPublish('api::product.product', productData, `Product: ${name}`);
    if (!docId) console.error(`  FAILED: ${name}`);
  }

  console.log(`\nDone! Created ${Object.keys(brandNameToDocId).length} brands, ${Object.keys(catNameToDocId).length} categories`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
