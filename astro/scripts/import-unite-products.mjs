import fs from 'fs';
import path from 'path';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const ASTRO_DIR = '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro';

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
  const mime = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';
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

async function getAllProducts(token) {
  const res = await api('/content-manager/collection-types/api::product.product?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.results || [];
}

async function createEntry(token, ct, data) {
  return api(`/content-manager/collection-types/${ct}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function updateEntry(token, ct, docId, data) {
  return api(`/content-manager/collection-types/${ct}/${docId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function publish(token, ct, docId) {
  return api(`/content-manager/collection-types/${ct}/${docId}/actions/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

const PRODUCTS = [
  {
    slug: 'hp-2690a-4en',
    name: 'UNITE HP-2690A/4EN Nitrogen Tyre Inflator',
    summary: 'Professional fully automatic nitrogen generator and tyre inflation system designed for high-volume workshops. Produces 95-99% pure nitrogen on demand from a built-in air compressor, eliminating oxygen and moisture to extend tyre life, improve fuel economy, and maintain consistent tyre pressure. Ideal for car, SUV, and light truck service.',
    category: 'maintenance',
    features: [
      'Fully automatic operation with one-touch inflation cycle for consistent, repeatable results',
      'Built-in high-precision filtration system removes oil, water, and particulates from the air supply',
      'Integrated 70L nitrogen storage tank delivers 70-90 L/min output for fast tyre fill times',
      'Adjustable N2 output pressure from 1-6 bar (15-87 psi) covers passenger car, SUV, and light truck tyres',
      'Wide 9-10 bar (130-145 psi) air inlet range compatible with most workshop air compressors',
      'LCD digital display shows real-time pressure, purity status, and operational diagnostics',
      'Dual-stage oil/water separator with high-precision filter extends nitrogen purity up to 99%',
      'Compact 730 x 530 x 1395 mm floor-standing design with small workshop footprint',
    ],
    technicalTable: [
      { label: 'Model', value: 'HP-2690A/4EN' },
      { label: 'Mode', value: 'Fully automatic' },
      { label: 'Display', value: 'LCD digital screen' },
      { label: 'Hose Reel', value: 'Included' },
      { label: 'Hose Length', value: '4 x 10 m' },
      { label: 'High Precision Filter', value: 'Included' },
      { label: 'Water/Oil Filter & Separator', value: 'Included' },
      { label: 'Voltage', value: 'AC220V ± 10%, 50/60 Hz' },
      { label: 'Power', value: '46 W' },
      { label: 'Nitrogen Purity', value: '95-99%' },
      { label: 'Air Inlet Pressure', value: '9-10 bar / 130-145 psi' },
      { label: 'Air Compressor Required', value: '5.5-7.5 kW, 10 bar, 1-1.5 m³/min' },
      { label: 'N2 Output Pressure', value: '1-6 bar, 15-87 psi' },
      { label: 'Output Air Flow Rate', value: '70-90 L/min' },
      { label: 'N2 Tank Capacity', value: '70 L / 18.5 gallon' },
      { label: 'Dimension', value: '730 x 530 x 1395 mm' },
      { label: 'Net Weight / Gross Weight', value: '126 / 132 kg' },
    ],
    images: ['hp-2690a-4en.webp'],
  },
  {
    slug: 'u-va2023',
    name: 'UNITE U-VA2023 3D Wheel Alignment',
    summary: 'Precision 3D wheel alignment system for cars and light trucks. Uses industrial-grade HD cameras and rugged fiberglass targets to deliver fast, accurate, and reliable alignment measurements. In-house software with rich vehicle database and free upgrades ensures your workshop stays current with new models. Engine frame adjustment via fingertip controls makes every alignment intuitive.',
    category: 'wheel-alignment',
    features: [
      'Intuitive real-time data display with side-by-side comparison against manufacturer standards',
      'Industrial-grade HD cameras provide total coverage across the full vehicle and platform',
      'Precision wheelbase and track detection with consistent repeatability for shop productivity',
      'Rugged fiberglass targets — fast, stable, and strong enough for daily workshop use',
      'Engine frame adjustment performed directly from the operator fingertips at the column',
      'In-house developed software with rich vehicle data and free lifetime updates',
    ],
    technicalTable: [
      { label: 'Model', value: 'U-VA2023' },
      { label: 'Power Supply', value: '110-220 V, 50/60 Hz' },
      { label: 'Position', value: 'Display Precision: 1\' / 0.01° / 0.1 mm' },
      { label: 'Total Toe', value: 'Range ±20° | Accuracy ±2\' | Max ±45°' },
      { label: 'Individual Toe', value: 'Range ±10° | Accuracy ±1\' | Max ±45°' },
      { label: 'Camber', value: 'Range ±15° | Accuracy ±1.5\' | Max ±45°' },
      { label: 'Caster', value: 'Range ±20° | Accuracy ±2.1\' | Max ±45°' },
      { label: 'King-Pin', value: 'Range ±20° | Accuracy ±2.1\' | Max ±45°' },
      { label: 'Set Back', value: 'Range ±5° | Accuracy ±2\' | Max ±45°' },
      { label: 'Thrust Angle', value: 'Range ±5° | Accuracy ±2\' | Max ±45°' },
      { label: 'Track Width', value: 'Range < 2400 mm | Accuracy ±2.5 mm | Max 1400-2500 mm' },
      { label: 'Wheel Base', value: 'Range < 3750 mm | Accuracy ±2.5 mm | Max 1950-4000 mm' },
    ],
    images: ['u-va2023.webp'],
  },
];

async function main() {
  let token = await login();
  if (!token) {
    console.log('Admin login rate limited, waiting 60s...');
    await sleep(60000);
    token = await login();
  }
  console.log('Logged in');

  // Upload images
  const uploadedImages = {};
  for (const p of PRODUCTS) {
    for (const imgName of p.images) {
      const imgPath = path.join(ASTRO_DIR, 'public', 'images', imgName);
      if (!fs.existsSync(imgPath)) {
        console.log(`  ! Image not found: ${imgPath}`);
        continue;
      }
      try {
        const uploaded = await uploadImage(token, imgPath);
        uploadedImages[imgName] = uploaded;
        console.log(`  ✓ Uploaded: ${imgName} (id=${uploaded.id})`);
        await sleep(300);
      } catch (e) {
        console.log(`  ! Upload failed for ${imgName}: ${e.message.slice(0, 100)}`);
      }
    }
  }

  // Get brands and categories
  const brands = await getBrands(token);
  const uniteBrand = brands.find(b => b.name === 'Unite' || b.name === 'UNITE');
  if (!uniteBrand) {
    console.log('Unite brand not found');
    return;
  }
  console.log(`Unite brand id=${uniteBrand.id}`);

  const categories = await getCategories(token);
  console.log(`Categories: ${categories.map(c => c.slug).join(', ')}`);

  // Check existing products
  const existing = await getAllProducts(token);
  const slugToDoc = new Map();
  for (const p of existing) {
    slugToDoc.set(p.slug, p);
    slugToDoc.set(p.slug.toLowerCase(), p);
  }

  for (const p of PRODUCTS) {
    const cat = categories.find(c => c.slug === p.category);
    if (!cat) { console.log(`  ! Category not found: ${p.category}`); continue; }

    const heroImages = p.images
      .filter(n => uploadedImages[n])
      .map(n => ({ image: uploadedImages[n].id }));

    const features = p.features.map(text => ({
      title: text.length > 60 ? text.slice(0, 57) + '...' : text,
      description: text,
    }));
    const technicalTable = p.technicalTable.map(t => ({ label: t.label, value: t.value }));

    const data = {
      name: p.name,
      slug: p.slug,
      summary: p.summary,
      description: p.summary,
      brand: { set: [{ id: uniteBrand.id }] },
      category: cat.id,
      features,
      functions: [],
      technicalTable,
      heroImages,
    };

    const existingDoc = slugToDoc.get(p.slug);
    if (existingDoc) {
      // Update
      const r = await updateEntry(token, 'api::product.product', existingDoc.documentId, data);
      if (r.error) { console.log(`  ! Update failed ${p.slug}: ${r.error.message}`); continue; }
      await publish(token, 'api::product.product', existingDoc.documentId);
      console.log(`  ✓ Updated ${p.slug}`);
    } else {
      // Create
      const r = await createEntry(token, 'api::product.product', data);
      if (r.error) { console.log(`  ! Create failed ${p.slug}: ${r.error.message}`); continue; }
      await publish(token, 'api::product.product', r.data.documentId);
      console.log(`  ✓ Created ${p.slug}`);
    }
    await sleep(300);
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
