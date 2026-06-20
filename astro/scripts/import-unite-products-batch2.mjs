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
    slug: 'hj-937',
    name: 'UNITE HJ 937 Wall-Mounted Tyre Inflator',
    summary: 'Compact wall-mounted automatic tyre inflator for high-traffic service stations, workshops, and car washes. Fully automatic operation with hands-free touchless control, IP55 aluminium waterproof faceplate, and ±0.02 bar inflation accuracy. Voice-control models (HJ 937S / HJ 938S) available for hands-free inflation at the pump bay.',
    category: 'maintenance',
    features: [
      'IP55 rated aluminium waterproof faceplate built for permanent outdoor or wash-bay mounting',
      '±0.02 bar inflation accuracy delivers consistent, repeatable pressure results',
      'Voice-control option (HJ 937S / HJ 938S) for completely hands-free inflation at the pump',
      'Quick-release nozzle provides fast connect/disconnect with excellent air-tightness',
      'Intelligent error alarm notifies staff of over-pressure, low-pressure, or hose issues',
      'Dual inlet pressure ranges 4-10 bar (58-145 psi) and output 1-5 bar / 1-7 bar (15-100 psi) cover passenger car through light truck',
      'Compact 330 x 230 x 105 mm wall-mountable design fits in any bay layout',
      'LED display with backlit digital readout for clear visibility in low light',
    ],
    technicalTable: [
      { label: 'Model', value: 'HJ 937' },
      { label: 'Mode', value: 'Fully automatic' },
      { label: 'Display', value: 'LED screen' },
      { label: 'Hose Reel', value: 'Optional' },
      { label: 'Hose', value: 'Standard Φ13 mm x 10 m' },
      { label: 'Voice Control', value: 'Optional (HJ 937S / HJ 938S)' },
      { label: 'Touchless Button', value: 'Optional' },
      { label: 'Water/Oil Filter & Separator', value: 'Included' },
      { label: 'Power Supply', value: 'AC 220V (Standard) / AC 110V (Optional)' },
      { label: 'Power', value: '< 28 W' },
      { label: 'Air Inlet Pressure', value: '4-10 bar / 58-145 psi' },
      { label: 'Air Outlet Pressure', value: '1-5 bar / 15-72 psi (Car), 1-7 bar / 15-100 psi (Truck)' },
      { label: 'Hose Size & Quantity', value: 'Φ13 mm x 10 m, 1 pc' },
      { label: 'Dimension', value: '330 x 230 x 105 mm' },
    ],
    images: ['hj-937.webp'],
  },
  {
    slug: 'pl-fs40',
    name: 'UNITE PL-FS40 Four Post Vehicle Lift',
    summary: 'Heavy-duty 4.0-ton four-post vehicle lift for wheel alignment, inspection, and general service. Standard-equipped with an electric rolling jack and dual manual/pneumatic safety lock release for fast, safe operation. Synchronized hydraulic cylinders and large steel cable pulleys ensure level, stable lifting every time.',
    category: 'lifts-jacks',
    features: [
      'Standard-equipped electric rolling jack with manual and optional pneumatic lock release for fast service',
      'Synchronized hydraulic cylinders and steel cable pulleys keep the runways perfectly level during lifting',
      'Big pulley for steel rope and mechanical safety valve deliver dependable anti-explosion protection',
      'Each column is equipped with main insurance and rope break insurance for redundant operator safety',
      'Manual and electromagnetic safety lock release options to suit workshop workflow',
      'Optional drive-by-wire button for remote lifting control from the bay',
      'Optional power unit cover and chain protector for oil hose to extend equipment life',
      '4.0 ton (4T) lifting capacity handles most passenger cars, SUVs, and light commercial vehicles',
    ],
    technicalTable: [
      { label: 'Model', value: 'PL-FS40' },
      { label: 'Capacity', value: '4.0 Ton' },
      { label: 'Lifting Height', value: '1750 mm (69")' },
      { label: 'Min Height', value: '250 mm (9 4/5")' },
      { label: 'Platform Length', value: '4250 mm (167")' },
      { label: 'Power Supply', value: '220V 1PH 50/60Hz 2.2 kW / 220V/380V 3PH 50/60Hz 2.2 kW' },
      { label: 'Lock Release', value: 'Manual (Standard) / Pneumatic (Optional)' },
      { label: 'Rolling Jack', value: 'Standard equipped, 2T/3T' },
      { label: 'Drive-by-wire Button', value: 'Optional' },
      { label: 'Power Unit Cover', value: 'Optional (with oil hose chain protector)' },
    ],
    images: ['pl-fs40.webp'],
  },
  {
    slug: 'u-z30c',
    name: 'UNITE U-Z30C Mobile Mid-rise Scissor Lift',
    summary: 'Compact 3.0-ton mobile mid-rise scissor lift with synchronized hydraulic cylinders and electrical safety locks. No floor pit required — ideal for fast bay-to-bay relocation with heavy-duty rubber pads. Adjustable platform length from 1400-2030 mm covers everything from city cars to long-wheelbase SUVs.',
    category: 'lifts-jacks',
    features: [
      'No floor pit required — true mobile mid-rise scissor lift that relocates between bays with ease',
      'Synchronized hydraulic cylinders deliver smooth, level lifting across the full platform',
      'Electrical safety locks engage automatically when lowering for fail-safe operation',
      'Electromagnetic lowering control for precise, controlled descent',
      'Height limit switch prevents over-travel and protects against mechanical damage',
      'Safety valve for anti-explosion of the hydraulic system under load',
      'Rubber pads on lifting arms protect vehicle underbody and prevent slippage',
      'Adjustable platform length 1400-2030 mm fits everything from compact cars to long-wheelbase SUVs',
    ],
    technicalTable: [
      { label: 'Model', value: 'U-Z30C' },
      { label: 'Capacity', value: '3.0 Ton' },
      { label: 'Max. Lifting Height', value: '1000 mm (39 3/8")' },
      { label: 'Min Height', value: '115 mm (4 1/2")' },
      { label: 'Platform Length', value: '1400-2030 mm (55 1/16 - 79 9/10")' },
      { label: 'Power Supply', value: '220-240V 1PH 50/60Hz 2.2 kW / 300-415V 3PH 50/60Hz 2.2 kW' },
      { label: 'Lock Release', value: 'Electrical' },
      { label: 'Lowering Control', value: 'Electromagnetic' },
      { label: 'Rubber Pads', value: '4 pcs (160 x 120 x 35 mm)' },
    ],
    images: ['u-z30c.webp'],
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
    await sleep(300);
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
