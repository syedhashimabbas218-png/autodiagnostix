const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';

// Products scraped from scraped_products.json as "Launch / SmartSafe" — assign BOTH Launch + Smartsafe
const CO_DEV_SLUGS = new Set([
  'launch-x-431-cnc-605a',
  'wa613-wireless-3d-wheel-aligner',
  'x-431-adas-pro-plus',
  'cnc-605-pro-plus',
  'x861-lite-wheelalignment-machine',
]);

// Products that should be ONLY Smartsafe (not Launch)
const SMARTSAFE_ONLY_SLUGS = new Set([
  'value-ac519-a-c-service-station',
]);

// All other products stay as-is (Launch only)

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

async function getBrands(token) {
  const res = await api('/content-manager/collection-types/api::brand.brand?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.results || [];
}

async function getProducts(token) {
  const res = await api('/content-manager/collection-types/api::product.product?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.results || [];
}

async function createBrand(token, name) {
  return api('/content-manager/collection-types/api::brand.brand', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description: `${name} automotive equipment` }),
  });
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

async function deleteBrand(token, docId) {
  return api(`/content-manager/collection-types/api::brand.brand/${docId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function main() {
  const token = await login();
  console.log('Logged in');

  // 1) Find existing brands
  const brands = await getBrands(token);
  let launch = brands.find(b => b.name === 'Launch');
  let smartsafe = brands.find(b => b.name === 'Smartsafe');
  const combined = brands.find(b => b.name === 'Launch / SmartSafe');

  if (!launch) throw new Error('Launch brand not found');

  // 2) Create Smartsafe if missing
  if (!smartsafe) {
    const r = await createBrand(token, 'Smartsafe');
    if (r.error) throw new Error(`Failed to create Smartsafe: ${r.error.message}`);
    smartsafe = r.data;
    await api(`/content-manager/collection-types/api::brand.brand/${smartsafe.documentId}/actions/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    console.log(`Created Smartsafe brand (id=${smartsafe.id})`);
  } else {
    console.log(`Smartsafe already exists (id=${smartsafe.id})`);
  }

  // 3) Reassign products
  const products = await getProducts(token);
  const slugToDoc = new Map();
  for (const p of products) {
    slugToDoc.set(p.slug, p);
    slugToDoc.set(p.slug.toLowerCase(), p);
  }

  let updated = 0, failed = 0;
  for (const slug of [...CO_DEV_SLUGS, ...SMARTSAFE_ONLY_SLUGS]) {
    const p = slugToDoc.get(slug) || slugToDoc.get(slug.toLowerCase());
    if (!p) { console.log(`  ! Not found: ${slug}`); failed++; continue; }

    let brandSet;
    if (CO_DEV_SLUGS.has(slug)) brandSet = [{ id: launch.id }, { id: smartsafe.id }];
    else if (SMARTSAFE_ONLY_SLUGS.has(slug)) brandSet = [{ id: smartsafe.id }];
    else continue;

    const r = await updateProduct(token, p.documentId, { brand: { set: brandSet } });
    if (r.error) { console.log(`  ! Failed ${slug}: ${r.error.message}`); failed++; continue; }
    await publishProduct(token, p.documentId);
    updated++;
    const names = brandSet.map(b => b.id === launch.id ? 'Launch' : 'Smartsafe').join(' + ');
    console.log(`  ✓ ${slug} -> [${names}]`);
    await sleep(200);
  }

  // 4) Delete the combined brand
  if (combined) {
    const productsUsingCombined = products.filter(p => Array.isArray(p.brand) ? p.brand.some(b => b.id === combined.id) : p.brand?.id === combined.id);
    if (productsUsingCombined.length === 0) {
      await deleteBrand(token, combined.documentId);
      console.log(`Deleted combined brand 'Launch / SmartSafe' (id=${combined.id})`);
    } else {
      console.log(`  ! ${productsUsingCombined.length} products still reference combined brand, skipping delete`);
    }
  }

  console.log(`\nDone. Products updated: ${updated}, Failed: ${failed}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
