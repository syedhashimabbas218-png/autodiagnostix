const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const DATA_FILE = '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro/output/products_data.json';

// Index-based split for each slug (0-indexed). Items in the array = Functions, others stay in Features.
// Indices are based on the visible list shown in the import script output.
const SPLITS = {
  'x-431-pro3-link': [
    // Functions: diagnostic/operational
    3,  // Full system OE-Level diagnostics
    4,  // Full diagnostic functionality
    5,  // Optional ADAS calibration capability
    6,  // Expand via "Mall"
    7,  // Info Center
    8,  // Diagnostic History
    9,  // Smartlink C light/medium/heavy duty
    10, // Full system vehicle coverage
    12, // Intelligent diagnostic
    13, // Intelligent and local diagnostic
    14, // Guided functions for VW and AUDI
    15, // Optional ADAS calibration function
    16, // Advanced coding and programming
    17, // TPMS service
    18, // MALL software purchase
    19, // Repair info and training videos
    // Features (hardware/design): 0, 1, 2, 11
  ],
  'x-431-pad-9-link': [
    // Functions: diagnostic/operational
    0,  // Full system vehicle coverage
    1,  // MALL software
    2,  // Topology mapping
    3,  // X-431 FIX diagnostic database
    4,  // Communication protocols
    5,  // Guided function VW/AUDI
    6,  // Basic functions (DTC, remote, bi-directional)
    7,  // Advanced coding/programming
    8,  // Multi-channel high-speed scan
    9,  // SGW access
    10, // Multi-system data streams
    11, // AI software
    12, // ADAS calibration
    13, // TPMS service
    14, // Repair info and training
    // Features (hardware): 15
  ],
  'x-431-hd-iii-heavy-duty-module': [
    // Functions: diagnostic/operational
    0,  // HD truck diagnostic software
    1,  // 13 Special Functions
    2,  // Calibration
    6,  // Supported brands
    // Features (hardware): 3, 4, 5
  ],
};

function parseBulletList(text) {
  if (!text) return [];
  return text
    .split(/\n/)
    .map(l => l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*\u2022]\s*/, '').trim())
    .filter(l => l.length > 0)
    .map(text => ({ title: text.length > 60 ? text.slice(0, 57) + '...' : text, description: text }));
}

async function login() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  return (await res.json()).data.token;
}

async function api(path, options = {}) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const token = await login();
  console.log('Logged in');

  const fs = await import('fs');
  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const seen = new Set();
  const unique = products.filter(p => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  const allRes = await api('/content-manager/collection-types/api::product.product?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const strapiProducts = allRes.results || [];
  const slugToDoc = new Map();
  for (const sp of strapiProducts) {
    slugToDoc.set(sp.slug, sp);
    slugToDoc.set(sp.slug.toLowerCase(), sp);
  }

  for (const [slug, functionIndices] of Object.entries(SPLITS)) {
    const p = unique.find(x => x.slug === slug);
    if (!p) { console.log(`  ! Not in JSON: ${slug}`); continue; }
    const sp = slugToDoc.get(slug) || slugToDoc.get(slug.toLowerCase());
    if (!sp) { console.log(`  ! Not in Strapi: ${slug}`); continue; }

    const allItems = parseBulletList(p.tabs?.Features || '');
    if (allItems.length === 0) { console.log(`  ! No features in JSON for ${slug}`); continue; }

    const features = [];
    const functions = [];
    allItems.forEach((item, i) => {
      if (functionIndices.includes(i)) functions.push(item);
      else features.push(item);
    });

    console.log(`  ${slug}: ${features.length} features + ${functions.length} functions (was ${allItems.length} features)`);

    const r = await api(`/content-manager/collection-types/api::product.product/${sp.documentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ features, functions }),
    });
    if (r.error) { console.log(`    ! Failed: ${r.error.message}`); continue; }
    await api(`/content-manager/collection-types/api::product.product/${sp.documentId}/actions/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    await sleep(200);
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
