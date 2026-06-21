import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const ASTRO_DIR = '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro';
const SOURCE_URL = 'https://www.autooltech.com/product/autool-spt360-spark-plug-tester-tool/';
const SOURCE_HTML = '/tmp/spt360-page.html';

const SLUG = 'autool-spt360-spark-plug-tester-tool';

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function extractFromHtml(html) {
  // Title: <h3 class="red_text FLAG-title">...</h3>
  const titleMatch = html.match(/class="red_text FLAG-title"[^>]*>([^<]+?)\s*</);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Description: <div class="product_detail_right_content FLAG-info"> ... <p>...</p> ... </div>
  const descMatch = html.match(/class="product_detail_right_content FLAG-info"[^>]*>([\s\S]*?)<\/div>/);
  let description = '';
  if (descMatch) {
    const inner = descMatch[1];
    const paras = [...inner.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(p => p && !p.includes('pt_blank'));
    description = paras.join(' ').replace(/\s+/g, ' ').trim();
    description = description
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
  }

  // Images
  const imgsMatch = html.match(/class="swiper-wrapper FLAG-imgs"[^>]*>([\s\S]*?)<\/ul>/);
  const images = [];
  if (imgsMatch) {
    const srcs = [...imgsMatch[1].matchAll(/<img[^>]+src="([^"]+)"/g)]
      .map(m => m[1])
      .filter(s => s.includes('/wp-content/uploads/'));
    const seen = new Set();
    for (const s of srcs) {
      if (!seen.has(s)) { seen.add(s); images.push(s); }
    }
  }

  // Specs
  const specsMatch = html.match(/FLAG-Specifications"[^>]*>([\s\S]*?)<div class="product_content_item video_content/);
  const specs = [];
  if (specsMatch) {
    const block = specsMatch[1];
    const rows = [...block.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
    for (const row of rows) {
      const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)]
        .map(m => m[1].replace(/<[^>]+>/g, '').trim()
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'"));
      if (cells.length >= 2) {
        const label = cells[0];
        const value = cells.slice(1).join(' ').replace(/\s+/g, ' ').trim();
        if (label && value && label !== value) specs.push({ label, value });
      }
    }
  }

  // Features: each <p><strong>Title</strong>Body</p> in the Description tab
  // (Title and body share the same <p>)
  const features = [];
  const descSectionMatch = html.match(/class="product_content_item description_content FLAG-Description"[^>]*>([\s\S]*?)<div class="product_content_item/);
  if (descSectionMatch) {
    const block = descSectionMatch[1];
    // First skip the leading "Working Principle" paragraph (it's an intro,
    // not a feature). Match <p><strong>Title:</strong> Body</p>.
    const featureMatches = [...block.matchAll(/<p[^>]*>\s*<strong>([^<]+)<\/strong>\s*([\s\S]*?)<\/p>/g)];
    for (const m of featureMatches) {
      const t = m[1].replace(/<[^>]+>/g, '').trim().replace(/:$/, '');
      const body = m[2].replace(/<[^>]+>/g, '').trim();
      if (!t || !body) continue;
      // Skip the first "Working Principle" intro (no colon, no body)
      if (t === 'Working Principle') continue;
      features.push({ title: t, description: body });
    }
  }

  return { title, description, images, specs, features };
}

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
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
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

async function getBrands(token) {
  const res = await api('/content-manager/collection-types/api::brand.brand?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.results || [];
}

async function getCategories(token) {
  const res = await api('/content-manager/collection-types/api::category.category?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.results || [];
}

async function getProductBySlug(token, slug) {
  const res = await api(`/content-manager/collection-types/api::product.product?filters[slug][$eq]=${slug}&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.results?.[0];
}

async function createProduct(token, data) {
  return api('/content-manager/collection-types/api::product.product', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function makeFeatures(description) {
  // The description is a single paragraph. For AUTOOL SPT360, the page has a
  // dedicated Features section. We split by common feature markers. If the
  // description has no obvious markers, return as a single feature.
  if (!description) return [];
  // Heuristic: split on "Features" heading marker by looking for sentences
  // that start with a capitalized phrase and end with a period.
  const sentences = description.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
  // If a sentence starts with a bold prefix (e.g. "5 Testing Sockets:"),
  // split it into a feature.
  const features = [];
  let current = '';
  for (const s of sentences) {
    if (/^[A-Z][\w\s\-'&]+:/.test(s) || /^\d+\s+/.test(s)) {
      if (current) features.push(current);
      current = s;
    } else if (current) {
      current += ' ' + s;
    } else {
      current = s;
    }
  }
  if (current) features.push(current);
  return features.length > 0 ? features : [description];
}

async function main() {
  // 1) Re-fetch the page if needed
  if (!fs.existsSync(SOURCE_HTML)) {
    console.log(`Downloading ${SOURCE_URL} ...`);
    execSync(`curl -sSL -A "Mozilla/5.0" "${SOURCE_URL}" -o ${SOURCE_HTML}`);
  }
  const html = fs.readFileSync(SOURCE_HTML, 'utf8');

  const { title, description, images, specs, features } = extractFromHtml(html);
  console.log('--- Extracted data ---');
  console.log('Title:', title);
  console.log('Description:', description.slice(0, 200), '...');
  console.log('Images:', images.length);
  console.log('Specs:', specs.length);
  for (const s of specs) console.log(`  ${s.label} = ${s.value}`);
  console.log(`Features parsed: ${features.length}`);
  features.forEach((f, i) => console.log(`  ${i + 1}. ${f.title} - ${f.description.slice(0, 60)}...`));

  if (!title) {
    console.log('! Failed to extract title, aborting');
    return;
  }

  // 2) Login
  const token = await login();
  if (!token) { console.log('Login failed'); return; }
  console.log('\nLogged in');

  // 3) Find brand (AUTOOL)
  const brands = await getBrands(token);
  const brand = brands.find(b => b.name.toUpperCase() === 'AUTOOL' || b.slug === 'autool');
  if (!brand) { console.log('! AUTOOL brand not found'); return; }
  console.log(`Brand: ${brand.name} (id=${brand.id})`);

  // 4) Find a category. Use "maintenance" as best fit.
  const cats = await getCategories(token);
  const cat = cats.find(c => c.slug === 'maintenance') || cats[0];
  console.log(`Category: ${cat.name} (id=${cat.id})`);

  // 5) Download + upload images (first 4 only — gallery)
  const downloaded = [];
  let imgIdx = 0;
  for (const url of images) {
    if (downloaded.length >= 4) break;
    // Sanitize filename: keep only ASCII letters/digits
    const urlBase = url.split('?')[0];
    const origExt = path.extname(urlBase).toLowerCase() || '.jpg';
    const ext = ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(origExt) ? origExt : '.jpg';
    imgIdx++;
    const fname = `spt360-${imgIdx}${ext}`;
    const fpath = path.join(ASTRO_DIR, 'public', 'images', 'spt360', fname);
    fs.mkdirSync(path.dirname(fpath), { recursive: true });
    console.log(`Downloading ${url} -> ${fname}`);
    try {
      execSync(`curl -sSL -A "Mozilla/5.0" "${url}" -o ${fpath}`);
      // Verify file is non-empty and has a valid image header
      const buf = fs.readFileSync(fpath);
      if (buf.length < 1000) {
        console.log(`  ! Skipping, file too small (${buf.length} bytes)`);
        continue;
      }
      const uploaded = await uploadImage(token, fpath);
      console.log(`  ✓ Uploaded: id=${uploaded.id}`);
      downloaded.push({ image: uploaded.id });
      await sleep(300);
    } catch (e) {
      console.log(`  ! Failed: ${e.message}`);
    }
  }

  // 6) Build product data
  const productData = {
    name: title,
    slug: SLUG,
    summary: description.slice(0, 280) + (description.length > 280 ? '...' : ''),
    description: description,
    brand: { set: [{ id: brand.id }] },
    category: cat.id,
    features: features.length > 0
      ? features.map(f => ({ title: f.title.slice(0, 60), description: f.description }))
      : [{ title: title, description: description.slice(0, 280) }],
    functions: [],
    technicalTable: specs.map(s => ({ label: s.label, value: s.value })),
    heroImages: downloaded,
  };

  // 8) Check if product exists, then create or update
  const existing = await getProductBySlug(token, SLUG);
  let r;
  if (existing) {
    console.log(`\nProduct already exists, updating: ${existing.name}`);
    r = await updateProduct(token, existing.documentId, productData);
  } else {
    console.log(`\nCreating product: ${title}`);
    r = await createProduct(token, productData);
  }
  if (r.error) {
    console.log('! Error:', r.error.message);
    return;
  }
  const docId = r.data?.documentId || existing.documentId;
  await sleep(500);
  await publish(token, docId);
  console.log(`✓ Published (docId=${docId})`);

  console.log('\nDone.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
