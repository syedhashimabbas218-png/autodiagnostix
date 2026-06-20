import fs from 'fs';
import path from 'path';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const ASTRO_DIR = '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro';
const SLUG = 'pl-fs40';
const NEW_IMAGE_PATH = path.join(ASTRO_DIR, 'public', 'images', 'pl-fs40', 'pl-fs40-new.png');

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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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

async function getProductBySlug(token, slug) {
  const res = await api(`/content-manager/collection-types/api::product.product?filters[slug][$eq]=${slug}&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.results?.[0];
}

async function updateProduct(token, docId, data) {
  return api(`/content-manager/collection-types/api::product.product/${docId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function publish(token, docId) {
  return api(`/content-manager/collection-types/api::product.product/${docId}/actions/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

async function deleteFile(token, fileId) {
  return api(`/upload/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function main() {
  const token = await login();
  if (!token) { console.log('Login failed'); return; }
  console.log('Logged in');

  const product = await getProductBySlug(token, SLUG);
  if (!product) { console.log(`Product not found: ${SLUG}`); return; }
  console.log(`Found product: ${product.name} (docId=${product.documentId})`);

  // Get current heroImage info
  const oldHeroImages = product.heroImages || [];
  console.log(`Current heroImages: ${oldHeroImages.length}`);
  let oldFileId = null;
  for (const hi of oldHeroImages) {
    console.log(`  heroImage id=${hi.id}, image id=${hi.image?.id} url=${hi.image?.url}`);
    if (hi.image?.id) oldFileId = hi.image.id;
  }

  // Upload new image
  console.log(`Uploading new image: ${NEW_IMAGE_PATH}`);
  const newFile = await uploadImage(token, NEW_IMAGE_PATH);
  console.log(`  ✓ Uploaded: id=${newFile.id} url=${newFile.url}`);
  await sleep(300);

  // Update product with new heroImage (replace)
  const data = {
    heroImages: [{ image: newFile.id }],
  };
  const r = await updateProduct(token, product.documentId, data);
  if (r.error) { console.log(`  ! Update failed: ${r.error.message}`); return; }
  console.log('  ✓ Product updated with new image');
  await sleep(300);

  await publish(token, product.documentId);
  console.log('  ✓ Product re-published');

  // Delete old file
  if (oldFileId) {
    await sleep(500);
    const delRes = await deleteFile(token, oldFileId);
    if (delRes.error) {
      console.log(`  ! Could not delete old file ${oldFileId}: ${delRes.error.message}`);
    } else {
      console.log(`  ✓ Old file ${oldFileId} deleted`);
    }
  }

  // Also clean up local public/images/pl-fs40.webp
  const localOld = path.join(ASTRO_DIR, 'public', 'images', 'pl-fs40.webp');
  if (fs.existsSync(localOld)) {
    fs.unlinkSync(localOld);
    console.log(`  ✓ Deleted local file: ${localOld}`);
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
