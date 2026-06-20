const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';

const DISCONTINUED_SLUGS = new Set(['tlt440w', 'tlt840waf', 'ismarttlt-242', 'tlt630a']);

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

  const res = await api('/content-manager/collection-types/api::product.product?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const products = res.results || [];
  console.log(`Found ${products.length} products`);

  let updated = 0, unchanged = 0, failed = 0;
  for (const p of products) {
    const shouldBe = DISCONTINUED_SLUGS.has(p.slug) ? 'DISCONTINUED' : null;
    if (p.badge === shouldBe) { unchanged++; continue; }

    const r = await api(`/content-manager/collection-types/api::product.product/${p.documentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge: shouldBe }),
    });
    if (r.error) { console.log(`  ! Failed ${p.slug}: ${r.error.message}`); failed++; continue; }
    await api(`/content-manager/collection-types/api::product.product/${p.documentId}/actions/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    updated++;
    console.log(`  ✓ ${p.slug} -> badge=${shouldBe || 'null'}`);
    await sleep(200);
  }

  console.log(`\nDone. Updated: ${updated}, Unchanged: ${unchanged}, Failed: ${failed}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
