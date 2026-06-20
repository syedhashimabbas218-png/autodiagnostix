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
    slug: 'launch-evm324',
    name: 'Launch EVM324 Battery Equalizer & Charge-Discharge Device',
    summary: 'All-in-one solution for EV repairs. Paired with an X-431 diagnostic tool, technicians can perform EV diagnostics, battery cell balancing, and battery pack charging & discharging tasks. EVM324 makes EV repair more efficient and effective.',
    category: 'ev-equipment',
    features: [
      'Up to 24 battery cells equalization',
      'Compatible with multiple battery types',
      'Supports 40A charging and 20A discharging',
      'Comprehensive battery safety protection',
      'Covers over 95% of electric vehicles on the market for thorough diagnostic capabilities',
      'Testing maintenance of core EV components',
      'In-depth battery pack inspection',
      'Multitasking with floating window mode',
      'Works with X-431 diagnostic tools',
      'EV diagnostic functions require the purchase of the EV Add-on Kit with software available',
    ],
    technicalTable: [
      { label: 'Input Power', value: 'AC 100~240V / 50~60Hz' },
      { label: 'Battery Module Voltage Range', value: 'DC 0-112V' },
      { label: 'Battery Cell Voltage Range', value: '1.6~5V' },
      { label: 'Charging Current Range', value: '0.5~40A, Max. Power 3.2kw' },
      { label: 'Discharging Current Range', value: '0.1-20A, Max. Power 2.4kw' },
      { label: 'Single Cell Voltage Accuracy', value: '0.1%FS+5mV (Max. Range 5V)' },
      { label: 'Single Cell Current Accuracy', value: '0.5%FS 0.05A (Max. Range 20A)' },
      { label: 'Communication', value: 'Wi-Fi, Bluetooth' },
      { label: 'Equalization Interface', value: '12PINx1+13PINx1' },
      { label: 'Charging Control', value: 'Constant Voltage Charging, Constant Current Charging' },
      { label: 'Discharging Control', value: 'Constant Voltage Discharging, Constant Current Discharging' },
      { label: 'Charge-Discharge Protection', value: 'Overcharge, Over-discharge, Overtemperature Protection for Battery Modules' },
      { label: 'Reverse Connection Protection', value: 'Support' },
      { label: 'Overtemperature Protection', value: 'Heat Dissipation Box Overtemperature Protection at 85°C' },
      { label: 'Main Device Protection', value: 'Overtemperature, Overcurrent, and Current Out-of-Control Shutdown Protection' },
      { label: 'Abnormal Protection', value: 'Power Line and Main Cable Power Loss' },
    ],
    images: [
      { file: 'public/images/evm324/evm324-1.jpg', name: 'launch-evm324-1.jpg' },
      { file: 'public/images/evm324/evm324-2.jpg', name: 'launch-evm324-2.jpg' },
    ],
  },
  {
    slug: 'launch-ev-diagnosis-add-on-kit',
    name: 'Launch EV Diagnosis Add-on Kit',
    summary: 'LAUNCH New Energy Battery Pack Diagnostic Upgrade Kit comes with battery pack testing cables for various vehicle brands. The battery pack diagnostic software and some diagnostic software for new energy vehicles can be activated and downloaded with the included activation card.',
    category: 'ev-equipment',
    features: [
      'Supports various battery pack diagnostic methods including non-standard battery pack connector, jumper cables and 16 PIN OBD',
      'Quick reading for battery pack information, such as number of battery pack modules, SOC, SOH, temperature, single cell voltage and temperature of each module, etc., which will help technician to know about the battery status',
      'Battery pack data streaming helps to locate issues accurately and improve repairing efficiency',
      'Battery pack diagnostic report can be printed and shared via email',
      'Includes specialty cables for Tesla and other major EV brands',
    ],
    technicalTable: [
      { label: 'Compatibility', value: 'LAUNCH X-431 diagnostic tools with EV Add-on Kit activation' },
      { label: 'Connection Methods', value: 'Non-standard battery pack connector, Jumper cables, 16 PIN OBD' },
      { label: 'Battery Pack Data', value: 'Modules count, SOC, SOH, Temperature, Per-cell voltage & temperature' },
      { label: 'Report Output', value: 'Printable and email-shareable diagnostic reports' },
      { label: 'Activation', value: 'Software activated via included activation card' },
      { label: 'Included Specialty Cables', value: 'Tesla and additional vehicle brand adapters' },
    ],
    images: [
      { file: 'public/images/ev-diagnosis-addon-kit/ev-kit-1.png', name: 'launch-ev-diagnosis-addon-kit-1.png' },
      { file: 'public/images/ev-diagnosis-addon-kit/ev-kit-2.jpg', name: 'launch-ev-diagnosis-addon-kit-2.jpg' },
      { file: 'public/images/ev-diagnosis-addon-kit/ev-kit-3.jpg', name: 'launch-ev-diagnosis-addon-kit-3.jpg' },
      { file: 'public/images/ev-diagnosis-addon-kit/ev-kit-4.jpg', name: 'launch-ev-diagnosis-addon-kit-4.jpg' },
    ],
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

  const uploadedImages = {};
  for (const p of PRODUCTS) {
    for (const img of p.images) {
      const imgPath = path.join(ASTRO_DIR, img.file);
      if (!fs.existsSync(imgPath)) {
        console.log(`  ! Image not found: ${imgPath}`);
        continue;
      }
      try {
        const uploaded = await uploadImage(token, imgPath);
        uploadedImages[img.name] = uploaded;
        console.log(`  ✓ Uploaded: ${img.name} (id=${uploaded.id})`);
        await sleep(300);
      } catch (e) {
        console.log(`  ! Upload failed for ${img.name}: ${e.message.slice(0, 100)}`);
      }
    }
  }

  const brands = await getBrands(token);
  let launchBrand = brands.find(b => b.name === 'Launch' || b.name === 'LAUNCH');
  if (!launchBrand) {
    console.log('Launch brand not found, creating...');
    const r = await api('/content-manager/collection-types/api::brand.brand', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Launch', slug: 'launch', description: 'LAUNCH — Global leader in automotive diagnostic technology' }),
    });
    if (r.error) { console.log('  ! Failed to create Launch brand:', r.error.message); return; }
    launchBrand = r.data;
    await publish(token, 'api::brand.brand', launchBrand.documentId);
    console.log(`  ✓ Created Launch brand (id=${launchBrand.id})`);
  } else {
    console.log(`Launch brand found (id=${launchBrand.id})`);
  }

  const categories = await getCategories(token);

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
      .filter(n => uploadedImages[n.name])
      .map(n => ({ image: uploadedImages[n.name].id }));

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
      brand: { set: [{ id: launchBrand.id }] },
      category: cat.id,
      features,
      functions: [],
      technicalTable,
      heroImages,
    };

    const existingDoc = slugToDoc.get(p.slug);
    if (existingDoc) {
      const r = await updateEntry(token, 'api::product.product', existingDoc.documentId, data);
      if (r.error) { console.log(`  ! Update failed ${p.slug}: ${r.error.message}`); continue; }
      await publish(token, 'api::product.product', existingDoc.documentId);
      console.log(`  ✓ Updated ${p.slug}`);
    } else {
      const r = await createEntry(token, 'api::product.product', data);
      if (r.error) { console.log(`  ! Create failed ${p.slug}: ${r.error.message}`); continue; }
      await publish(token, 'api::product.product', r.data.documentId);
      console.log(`  ✓ Created ${p.slug}`);
    }
    await sleep(400);
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
