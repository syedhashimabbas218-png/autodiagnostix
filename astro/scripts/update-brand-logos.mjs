import fs from 'fs';
import path from 'path';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const ASTRO_DIR = process.env.IMG_DIR || '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro';
const BRANDS_DIR = path.join(ASTRO_DIR, 'public', 'images', 'brands');

const BRANDS = [
  { slug: 'launch', name: 'Launch', file: 'launch.png' },
  { slug: 'smartsafe', name: 'Smartsafe', file: 'smartsafe.png' },
  { slug: 'unite', name: 'Unite', file: 'unite.png' },
  { slug: 'liberty-lifts', name: 'Liberty Lifts', file: 'liberty-lifts.png' },
  { slug: 'gti-tools', name: 'GTI.tools', file: 'gti-tools.png' },
];

async function login() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const d = await res.json();
  return d.data?.token;
}

async function api(path, options = {}) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function uploadImage(token, filePath) {
  const buffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filename).slice(1);
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const form = new FormData();
  form.append('files', new Blob([buffer], { type: mime }), filename);
  const res = await fetch(`${STRAPI_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Upload failed: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data[0];
}

async function getBrandBySlug(token, slug) {
  const res = await api(`/content-manager/collection-types/api::brand.brand?filters[slug][$eq]=${slug}&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.results?.[0];
}

async function updateBrand(token, docId, data) {
  return api(`/content-manager/collection-types/api::brand.brand/${docId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function publishBrand(token, docId) {
  return api(`/content-manager/collection-types/api::brand.brand/${docId}/actions/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

async function createBrand(token, data) {
  return api('/content-manager/collection-types/api::brand.brand', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  let token = await login();
  if (!token) { console.log('Login failed'); return; }
  console.log('Logged in');

  for (const brand of BRANDS) {
    const existing = await getBrandBySlug(token, brand.slug);
    if (!existing) {
      console.log(`! Brand ${brand.slug} not found, skipping`);
      continue;
    }

    let updateData = {};
    if (brand.file) {
      const filePath = path.join(BRANDS_DIR, brand.file);
      if (!fs.existsSync(filePath)) {
        console.log(`! File not found: ${filePath}`);
        continue;
      }
      console.log(`Uploading logo for ${brand.slug}: ${brand.file}`);
      const uploaded = await uploadImage(token, filePath);
      console.log(`  ✓ Uploaded: id=${uploaded.id} url=${uploaded.url}`);
      updateData.logo = uploaded.id;
      await sleep(500);
    }

    if (Object.keys(updateData).length === 0) continue;

    const r = await updateBrand(token, existing.documentId, updateData);
    if (r.error) {
      console.log(`  ! Update failed: ${r.error.message}`);
      continue;
    }
    await sleep(300);
    await publishBrand(token, existing.documentId);
    console.log(`  ✓ ${brand.slug} updated and published`);
    await sleep(500);
  }

  // Create the new Autool brand
  console.log('\nCreating Autool brand...');
  const autoolFile = path.join(BRANDS_DIR, 'autool.png');
  if (!fs.existsSync(autoolFile)) {
    console.log('  ! autool.png not found');
    return;
  }
  const autoolExisting = await getBrandBySlug(token, 'autool');
  if (autoolExisting) {
    console.log('  Autool already exists, updating logo');
    const uploaded = await uploadImage(token, autoolFile);
    await updateBrand(token, autoolExisting.documentId, { logo: uploaded.id });
    await publishBrand(token, autoolExisting.documentId);
    console.log('  ✓ Autool updated');
  } else {
    const uploaded = await uploadImage(token, autoolFile);
    const created = await createBrand(token, {
      name: 'AUTOOL',
      slug: 'autool',
      description: 'AUTOOL — Professional automotive diagnostic and service tools',
      website: 'https://www.autooltech.com',
      logo: uploaded.id,
    });
    if (created.error) {
      console.log(`  ! Create failed: ${created.error.message}`);
    } else {
      await publishBrand(token, created.data.documentId);
      console.log(`  ✓ Autool created (id=${created.data.id})`);
    }
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
