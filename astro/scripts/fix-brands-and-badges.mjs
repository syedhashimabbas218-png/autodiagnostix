const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';

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

async function getLaunchBrand(token) {
  const res = await api('/content-manager/collection-types/api::brand.brand?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (res.results || []).find(b => b.name === 'Launch' || b.name === 'LAUNCH');
}

async function getAllProducts(token) {
  const res = await api('/content-manager/collection-types/api::product.product?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.results || [];
}

async function updateProduct(token, docId, data) {
  return api(`/content-manager/collection-types/api::product.product/${docId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function publishProduct(token, docId) {
  return api(`/content-manager/collection-types/api::product.product/${docId}/actions/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const token = await login();
  console.log('Logged in');

  const launchBrand = await getLaunchBrand(token);
  if (!launchBrand) throw new Error('Launch brand not found');
  console.log(`Launch brand id=${launchBrand.id}, documentId=${launchBrand.documentId}`);

  const products = await getAllProducts(token);
  console.log(`Found ${products.length} products`);

  const fixBrandSlugs = new Set(['tlt440w', 'tlt840waf', 'ismarttlt-242', 'tlt630a']);

  let brandFixed = 0, badgeAdded = 0, errors = 0;
  for (const p of products) {
    const update = {};
    if (fixBrandSlugs.has(p.slug)) {
      update.brand = launchBrand.id;
    }
    update.badge = 'DISCONTINUED';

    const res = await updateProduct(token, p.documentId, update);
    if (res.error) {
      errors++;
      console.log(`  ! Failed ${p.slug}: ${res.error.message}`);
      continue;
    }
    await publishProduct(token, p.documentId);
    if (fixBrandSlugs.has(p.slug)) {
      brandFixed++;
      console.log(`  ✓ Fixed brand + badge: ${p.slug} (${p.brand?.name} -> Launch)`);
    } else {
      badgeAdded++;
    }
    await sleep(200);
  }

  console.log(`\nDone. Brand fixed: ${brandFixed}, Badges added: ${badgeAdded}, Errors: ${errors}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
