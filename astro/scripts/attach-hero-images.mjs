import fs from 'fs';
import path from 'path';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const PRODUCTS_FILE = '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro/output/products_data.json';
const IMAGES_DIR = '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro/output';

async function login() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  return (await res.json()).data.token;
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
    throw new Error(`Upload failed for ${filename}: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data[0];
}

async function getAllProducts(token) {
  const res = await fetch(`${STRAPI_URL}/content-manager/collection-types/api::product.product?pageSize=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (await res.json()).results || [];
}

async function updateProduct(token, docId, data) {
  const res = await fetch(`${STRAPI_URL}/content-manager/collection-types/api::product.product/${docId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function publishProduct(token, docId) {
  await fetch(`${STRAPI_URL}/content-manager/collection-types/api::product.product/${docId}/actions/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const token = await login();
  console.log('Logged in');

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  const seen = new Set();
  const unique = products.filter(p => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
  console.log(`${unique.length} unique products`);

  const strapiProducts = await getAllProducts(token);
  const slugToDoc = new Map();
  for (const sp of strapiProducts) slugToDoc.set(sp.slug, sp);

  let ok = 0, fail = 0, totalImages = 0;
  for (const p of unique) {
    const sp = slugToDoc.get(p.slug) || slugToDoc.get(p.slug.toLowerCase());
    if (!sp) { console.log(`  ! No Strapi product for slug: ${p.slug}`); continue; }

    const heroImages = [];
    for (const imgName of p.images) {
      const imgPath = path.join(IMAGES_DIR, imgName);
      if (!fs.existsSync(imgPath)) { console.log(`  ! Missing image: ${imgName}`); continue; }
      try {
        const uploaded = await uploadImage(token, imgPath);
        heroImages.push({ image: uploaded.id });
        totalImages++;
        await sleep(150); // gentle rate limit
      } catch (e) {
        console.log(`  ! Upload failed for ${imgName}: ${e.message.slice(0, 100)}`);
      }
    }

    if (heroImages.length === 0) continue;

    const res = await updateProduct(token, sp.documentId, { heroImages });
    if (res.error) {
      fail++;
      console.log(`  ! Failed to update ${p.slug}: ${res.error.message}`);
    } else {
      await publishProduct(token, sp.documentId);
      ok++;
      console.log(`  ✓ ${p.slug} (${heroImages.length} images)`);
      await sleep(200);
    }
  }

  console.log(`\nDone. Products updated: ${ok}, failed: ${fail}, total images uploaded: ${totalImages}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
