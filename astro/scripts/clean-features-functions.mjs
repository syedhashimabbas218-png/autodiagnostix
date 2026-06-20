const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';

function cleanItem(item) {
  let title = (item.title || '').trim();
  let description = (item.description || '').trim();

  // Drop the header row entirely
  if (title === 'Functions | Description | √' || description === 'Functions | Description | √') {
    return null;
  }

  // Strip trailing " | √" from both
  title = title.replace(/\s*\|\s*√\s*$/, '').trim();
  description = description.replace(/\s*\|\s*√\s*$/, '').trim();

  // Strip leading "1. " / "2. " etc. from both
  title = title.replace(/^\d+\.\s*/, '').trim();
  description = description.replace(/^\d+\.\s*/, '').trim();

  // If title looks like "Label | rest of description" and description is the same
  // pipe-separated form, split into title=Label, description=full sentence
  if (title.includes('|')) {
    const parts = title.split('|').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      // Title = first part, description = full original (with trailing-√ stripped)
      const newTitle = parts[0];
      const newDesc = description || title;
      return { title: newTitle, description: newDesc };
    }
  }

  // If title and description are identical, just keep one
  if (title === description) {
    return { title, description };
  }

  return { title, description };
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

  const res = await api('/content-manager/collection-types/api::product.product?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const products = res.results || [];
  console.log(`Found ${products.length} products`);

  let productsUpdated = 0, itemsCleaned = 0, itemsRemoved = 0;
  for (const p of products) {
    let productChanged = false;
    const newFeatures = [];
    for (const f of (p.features || [])) {
      const cleaned = cleanItem(f);
      if (cleaned === null) { itemsRemoved++; productChanged = true; continue; }
      if (cleaned.title !== f.title || cleaned.description !== f.description) {
        itemsCleaned++;
        productChanged = true;
      }
      newFeatures.push(cleaned);
    }

    const newFunctions = [];
    for (const f of (p.functions || [])) {
      const cleaned = cleanItem(f);
      if (cleaned === null) { itemsRemoved++; productChanged = true; continue; }
      if (cleaned.title !== f.title || cleaned.description !== f.description) {
        itemsCleaned++;
        productChanged = true;
      }
      newFunctions.push(cleaned);
    }

    if (!productChanged) continue;

    const r = await api(`/content-manager/collection-types/api::product.product/${p.documentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: newFeatures, functions: newFunctions }),
    });
    if (r.error) { console.log(`  ! Failed ${p.slug}: ${r.error.message}`); continue; }
    await api(`/content-manager/collection-types/api::product.product/${p.documentId}/actions/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    productsUpdated++;
    console.log(`  ✓ ${p.slug} (cleaned/removed ${newFeatures.length + newFunctions.length} items kept)`);
    await sleep(200);
  }

  console.log(`\nDone. Products updated: ${productsUpdated}, items cleaned: ${itemsCleaned}, items removed: ${itemsRemoved}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
