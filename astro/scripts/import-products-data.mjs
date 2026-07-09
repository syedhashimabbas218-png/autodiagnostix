import fs from 'fs';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const DATA_FILE = '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro/output/products_data.json';
const SCRAPED_FILE = '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro/scraped_products.json';

const CATEGORY_MAP = {
  'lifts-jacks': { name: 'Lifts & Jacks', slug: 'lifts-jacks', tagline: 'Professional lifting equipment' },
  'maintenance': { name: 'Maintenance', slug: 'maintenance', tagline: 'Workshop maintenance tools' },
  'scanners': { name: 'Scanners', slug: 'scanners', tagline: 'Professional diagnostic scanners' },
  'wheel-alignment': { name: 'Wheel Alignment', slug: 'wheel-alignment', tagline: 'Precision wheel alignment systems' },
};

// Manual brand overrides for slugs not in scraped_products.json
const BRAND_OVERRIDES = {
  'tlt440w': 'Unite',
  'tlt840waf': 'Unite',
  'ismarttlt-242': 'Unite',
  'tlt630a': 'Unite',
  'x-431-hd-iii-heavy-duty-module': 'Launch',
};

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseFeatures(featuresText) {
  if (!featuresText) return [];
  return featuresText
    .split(/\n/)
    .map(l => l.replace(/^[-*\u2022]\s*/, '').trim())
    .filter(l => l.length > 0)
    .map(text => ({ title: text.length > 60 ? text.slice(0, 57) + '...' : text, description: text }));
}

function parseTechnicalTable(specsText) {
  if (!specsText) return [];
  const result = [];
  for (const raw of specsText.split(/\n/)) {
    const line = raw.trim();
    if (!line) continue;
    // Pipe-separated: "Label | Value | Extra"
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        result.push({ label: parts[0], value: parts.slice(1).join(' | ') });
        continue;
      }
    }
    // Colon-separated: "Label: Value" (scanner style)
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const label = line.slice(0, colonIdx).trim().replace(/:+$/, '');
      const value = line.slice(colonIdx + 1).trim();
      if (label && value) {
        result.push({ label, value });
        continue;
      }
    }
    // Fallback: single-line spec with no separator
    if (line.length > 0) {
      result.push({ label: 'Spec', value: line });
    }
  }
  return result;
}

function parseSpecs(specsText) {
  if (!specsText) return [];
  return specsText
    .split(/\n/)
    .map(l => l.replace(/^[-*\u2022]\s*/, '').trim())
    .filter(l => l.length > 0)
    .map(value => ({ label: 'Spec', value }));
}

async function api(path, options = {}) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function login() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  return (await res.json()).data.token;
}

async function getExisting(token, contentType) {
  const res = await api(
    `/content-manager/collection-types/${contentType}?pageSize=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.results || [];
}

async function createEntry(token, contentType, data) {
  return api(`/content-manager/collection-types/${contentType}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function publishEntry(token, contentType, id) {
  return api(`/content-manager/collection-types/${contentType}/${id}/actions/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

function buildBrandLookup(scraped) {
  const m = {};
  for (const p of scraped) {
    m[norm(p.name)] = p.brand;
    m[norm(p.title)] = p.brand;
  }
  return m;
}

function deriveBrand(product, lookup) {
  const slugKey = norm(product.slug);
  if (BRAND_OVERRIDES[product.slug]) return BRAND_OVERRIDES[product.slug];
  if (BRAND_OVERRIDES[slugKey]) return BRAND_OVERRIDES[slugKey];
  if (lookup[slugKey]) return lookup[slugKey];
  if (product.title) {
    const titleKey = norm(product.title);
    if (lookup[titleKey]) return lookup[titleKey];
  }
  // Heuristic fallbacks
  const t = (product.title || '').toLowerCase();
  if (t.includes('creader') || t.includes('crp') || t.includes('x-431') || t.includes('launch')) return 'Launch';
  if (t.includes('tlt') || t.includes('ismarttlt')) return 'Unite';
  return 'Launch';
}

function normalizeBrandName(b) {
  // Map "Launch / SmartSafe" -> separate handling: pick the first stable one
  return b;
}

function getBrandSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const token = await login();
  console.log('Logged in');

  const rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const scraped = JSON.parse(fs.readFileSync(SCRAPED_FILE, 'utf8')).products;
  const brandLookup = buildBrandLookup(scraped);

  // Dedupe by slug (keep first)
  const seen = new Set();
  const data = rawData.filter(p => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
  console.log(`Loaded ${rawData.length} products, ${data.length} after dedup`);

  // Create categories
  const categoryMap = {};
  for (const [slug, cat] of Object.entries(CATEGORY_MAP)) {
    const created = await createEntry(token, 'api::category.category', cat);
    if (created.data) {
      categoryMap[slug] = created.data;
      await publishEntry(token, 'api::category.category', created.data.documentId || created.data.id);
      console.log(`  Created category: ${cat.name} (id=${created.data.id})`);
    } else {
      console.error(`  Failed to create category ${cat.name}:`, created);
    }
  }

  // Discover unique brands
  const brandNames = new Set();
  for (const p of data) {
    const b = deriveBrand(p, brandLookup);
    if (b) brandNames.add(b);
  }
  console.log(`Brands to create: ${[...brandNames].join(', ')}`);

  // Create brands
  const brandMap = {};
  for (const name of brandNames) {
    const slug = getBrandSlug(name);
    const created = await createEntry(token, 'api::brand.brand', {
      name,
      slug,
      description: `${name} automotive equipment`,
      website: '',
    });
    if (created.data) {
      brandMap[name] = created.data;
      await publishEntry(token, 'api::brand.brand', created.data.documentId || created.data.id);
      console.log(`  Created brand: ${name} (id=${created.data.id})`);
    } else {
      console.error(`  Failed to create brand ${name}:`, created);
    }
  }

  // Create products
  let ok = 0, fail = 0;
  for (const p of data) {
    const brandName = deriveBrand(p, brandLookup);
    const brandEntry = brandMap[brandName];
    const catEntry = categoryMap[p.category];

    const tabs = p.tabs || {};
    const description = tabs.Description || p.short_description || '';
    const features = parseFeatures(tabs.Features);
    const technicalTable = parseTechnicalTable(tabs.Specifications);
    const specs = parseSpecs(tabs.Specifications);

    // Build a name: use title, or synthesize from slug if empty
    const name = (p.title && p.title.trim()) || p.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const productData = {
      name,
      slug: p.slug.toLowerCase(),
      summary: p.short_description || '',
      description,
      badge: null,
      price: null,
      brand: brandEntry ? brandEntry.id : null,
      category: catEntry ? catEntry.id : null,
      features,
      technicalTable,
      specs,
      heroImages: [],
    };

    const created = await createEntry(token, 'api::product.product', productData);
    if (created.data) {
      await publishEntry(token, 'api::product.product', created.data.documentId || created.data.id);
      ok++;
      console.log(`  Created product: ${name} (id=${created.data.id})`);
    } else {
      fail++;
      console.error(`  Failed to create product ${p.slug}:`, JSON.stringify(created).slice(0, 300));
    }
  }

  console.log(`\nDone! Products: ${ok} ok, ${fail} failed.`);
}

main().catch(e => {
  console.error('Error:', e.message, e.stack);
  process.exit(1);
});
