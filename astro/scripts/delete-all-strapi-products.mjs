import fs from 'fs';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';

async function login() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  return data.data.token;
}

async function api(path, options = {}) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function getExisting(token, contentType) {
  const res = await api(
    `/content-manager/collection-types/${contentType}?pageSize=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.results || [];
}

async function deleteEntry(token, contentType, docId) {
  return api(
    `/content-manager/collection-types/${contentType}/${docId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

async function main() {
  const token = await login();
  console.log('Logged in');

  const targets = [
    { type: 'api::product.product', label: 'products' },
    { type: 'api::brand.brand', label: 'brands' },
    { type: 'api::category.category', label: 'categories' },
  ];

  for (const { type, label } of targets) {
    const existing = await getExisting(token, type);
    console.log(`Found ${existing.length} ${label}`);
    let ok = 0;
    let fail = 0;
    for (const e of existing) {
      const docId = e.documentId || e.id;
      const res = await deleteEntry(token, type, docId);
      if (res && res.error) {
        fail++;
        console.error(`  Failed to delete ${label} #${docId}: ${res.error.message || JSON.stringify(res.error)}`);
      } else {
        ok++;
      }
    }
    console.log(`  Deleted ${ok}/${existing.length} ${label}${fail ? ` (${fail} failed)` : ''}`);
  }

  console.log('\nDone.');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
