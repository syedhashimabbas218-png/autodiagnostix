import fs from 'fs';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const DATA_FILE = '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro/output/products_data.json';

function parseBulletList(text) {
  if (!text) return [];
  return text
    .split(/\n/)
    .map(l => l.replace(/^[-*\u2022]\s*/, '').trim())
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

  let updated = 0, skipped = 0, failed = 0;
  for (const p of unique) {
    const functionsText = p.tabs?.Functions || '';
    if (!functionsText) { skipped++; continue; }

    const sp = slugToDoc.get(p.slug) || slugToDoc.get(p.slug.toLowerCase());
    if (!sp) { console.log(`  ! Not found: ${p.slug}`); failed++; continue; }

    const functions = parseBulletList(functionsText);
    if (functions.length === 0) { skipped++; continue; }

    const res = await api(`/content-manager/collection-types/api::product.product/${sp.documentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ functions }),
    });
    if (res.error) { console.log(`  ! Failed ${p.slug}: ${res.error.message}`); failed++; continue; }
    await api(`/content-manager/collection-types/api::product.product/${sp.documentId}/actions/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    updated++;
    console.log(`  ✓ ${p.slug} (${functions.length} functions)`);
    await sleep(200);
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
