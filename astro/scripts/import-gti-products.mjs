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
    slug: 'gti-g-extreme',
    name: 'GTI.tools G-Extreme 24" Tyre Changer with Digital Handheld Gauge',
    summary: 'Heavy-duty 24" tyre changer engineered for versatility, with dedicated motorcycle adaptor and high-density cast aluminum pneumatic system. Enhanced inner box structure resists mechanical deformation for long-term precision under heavy-duty operation. Durable iron stamping pedal system stands up to daily workshop use.',
    category: 'tire-changers',
    features: [
      'Dedicated motorcycle adaptor handles a wide range of two-wheeler rim types for versatile operation',
      'Enhanced inner box structure resists mechanical deformation to maintain precision under heavy loads',
      'High-density cast aluminum piston in the large bead breaker cylinder extends pneumatic system service life',
      'Specialized motorcycle-optimized bead breaker design reduces risk of rim damage on two-wheeler wheels',
      'Thickened bead-breaker rubber protection adapts to a wider variety of motorcycle rim profiles',
      'Durable iron stamping pedal system withstands daily workshop use; aluminum pedals available as upgrade',
      'Digital handheld gauge provides accurate real-time pressure readings for precise inflation',
    ],
    technicalTable: [
      { label: 'Model', value: 'G-Extreme' },
      { label: 'Rim Clamping (Outside)', value: '10" - 22"' },
      { label: 'Rim Clamping (Inside)', value: '12" - 24"' },
      { label: 'Max. Wheel Diameter', value: '1040 mm (41")' },
      { label: 'Max. Wheel Width', value: '3" - 15"' },
      { label: 'Bead Breaker Force', value: '2500 kg' },
      { label: 'Operating Pressure', value: '8-10 bar' },
      { label: 'Motor Power', value: '0.75 kW / 1.1 kW' },
      { label: 'Voltage', value: '220V / 380V' },
    ],
    images: ['gti-g-extreme-1.png', 'gti-g-extreme-2.png', 'gti-g-extreme-3.png', 'gti-g-extreme-4.png'],
  },
  {
    slug: 'gti-power-x',
    name: 'GTI.tools POWER X 28" Tyre Changer with Right Arm and Low Profile Attachment',
    summary: 'High-efficiency 28" tyre changer with an integrated left helper arm for low-profile and run-flat tyres. Compact space-saving design preserves workshop space while the enhanced inner box structure and high-density pneumatic system deliver long-term durability. Universal bead breaker handles a wide range of tyre types and sizes.',
    category: 'tire-changers',
    features: [
      'Integrated left helper arm assists with low-profile and run-flat tyres without cluttering the workspace',
      'Enhanced inner box structure resists mechanical deformation during heavy-duty tasks',
      'High-density cast aluminum bead-breaker piston delivers maximum force and long-term durability',
      'Precision-cast high-grade steel clamping jaws provide superior grip and durability',
      'Protective sleeves on clamping jaws prevent damage to expensive alloy rims and tyres',
      'Adjustable slider position accommodates a wider variety of wheel sizes',
      'Universal bead breaker design provides high compatibility and faster bead breaking across tyre types',
      'Heavy-duty iron stamping pedals as standard; aluminum pedal set available as optional upgrade',
    ],
    technicalTable: [
      { label: 'Model', value: 'POWER X' },
      { label: 'Primary Advantage', value: 'Equipped with Left Helper Arm' },
      { label: 'Clamping System', value: 'Precision Steel Cast Jaws' },
      { label: 'Piston Material', value: 'High-Density Cast Aluminum' },
      { label: 'Structural Design', value: 'Enhanced Inner Box (Anti-Deformation)' },
      { label: 'Bead Breaker', value: 'Universal Application' },
      { label: 'Standard Pedal', value: 'Iron Stamping (Durable)' },
      { label: 'Optional Upgrade', value: 'Aluminum Pedal Set' },
    ],
    images: ['gti-power-x-1.png', 'gti-power-x-2.png'],
  },
  {
    slug: 'gti-rft-pro',
    name: 'GTI.tools RFT PRO Low Profile Tyre Changer with Digital Gauge',
    summary: 'Low-profile RFT tyre changer with central auto helper arm for effortless mounting and demounting of run-flat and low-profile tyres. Reinforced S41 mounting bar resists deformation, while precision steel-cast clamping jaws and protective sleeves keep alloy rims safe. Compact structure saves valuable workshop space.',
    category: 'tire-changers',
    features: [
      'Central auto helper arm with compact structure saves workshop space and speeds mounting/demounting',
      'Reinforced S41 mounting bar resists deformation under heavy, repeated use',
      'Precision steel-cast clamping jaws provide firm, reliable grip built for long-term durability',
      'Deformation-resistant inner box extends the machine service life during intensive operations',
      'Specialized protective sleeves prevent marring of alloy rims and damage to tyre beads',
      'Universal bead-breaker design handles a wide variety of tyre types and sizes efficiently',
      'Heavy-duty iron stamping pedals standard; aluminum pedal upgrade available',
      'Adjustable clamping range via slider position adapts to different wheel sizes',
    ],
    technicalTable: [
      { label: 'Model', value: 'RFT (PRO)' },
      { label: 'Helper Arm Type', value: 'Central Auto Helper' },
      { label: 'Mounting Bar Material', value: 'S41 Reinforced Steel' },
      { label: 'Clamping Jaw Material', value: 'Precision Steel Cast' },
      { label: 'Pedal Construction', value: 'Iron Stamping (Aluminum optional)' },
      { label: 'Structural Integrity', value: 'Enhanced Inner Box (Anti-Deformation)' },
      { label: 'Protection', value: 'Rim / Tyre Protective Sleeves Included' },
      { label: 'Application', value: 'Universal Bead Breaker' },
    ],
    images: ['gti-rft-pro-1.png', 'gti-rft-pro-2.png'],
  },
  {
    slug: 'gti-lcd-premium',
    name: 'GTI.tools LCD Premium Fully Automatic Wheel Balancer with Sonar System',
    summary: 'Premium digital wheel balancer with sonar system for pinpoint accuracy on passenger car and light truck wheels. Multiple balancing modes for dynamic, static, and ALUS alloy programs. Automatic distance and diameter entry reduce human error, while low-speed balancing extends machine life and improves workshop safety.',
    category: 'wheel-balancers',
    features: [
      'High-precision dynamic balancing with advanced sensors detects even the smallest imbalances',
      'Multiple balancing modes for dynamic, static, and specialized ALUS alloy programs',
      'Automatic distance and diameter entry streamlines setup and reduces human error',
      'User-friendly digital interface with bright real-time display for easy weight placement',
      'Built-in self-test and calibration programs maintain factory-level accuracy long-term',
      'Ergonomic shaft with high-quality locking wing nut secures wheel without rim hub damage',
      'Low-speed balancing reduces machine wear and provides safer workshop operation',
      'Sonar system technology ensures precision for premium wheel service',
    ],
    technicalTable: [
      { label: 'Model', value: 'LCD PREMIUM' },
      { label: 'Rim Diameter', value: '10" - 24"' },
      { label: 'Rim Width', value: '1.5" - 20"' },
      { label: 'Max. Wheel Weight', value: '65 kg' },
      { label: 'Balancing Precision', value: '±1 g' },
      { label: 'Cycle Time', value: '~8 seconds' },
      { label: 'Rotation Speed', value: '200 rpm' },
      { label: 'Power Supply', value: '220V (Single Phase)' },
      { label: 'Display Type', value: 'LED / Digital' },
    ],
    images: ['gti-lcd-premium-1.png', 'gti-lcd-premium-2.png'],
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

  const brands = await getBrands(token);
  let gtiBrand = brands.find(b => b.name === 'GTI.tools' || b.name === 'GTI.TOOLS' || b.name === 'GTI Tools');
  if (!gtiBrand) {
    console.log('GTI.tools brand not found, creating...');
    const r = await api('/content-manager/collection-types/api::brand.brand', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'GTI.tools', slug: 'gti-tools', description: 'GTI.tools — German-engineered tyre changers, wheel balancers, and service equipment' }),
    });
    if (r.error) { console.log('  ! Failed to create GTI.tools brand:', r.error.message); return; }
    gtiBrand = r.data;
    await publish(token, 'api::brand.brand', gtiBrand.documentId);
    console.log(`  ✓ Created GTI.tools brand (id=${gtiBrand.id})`);
  } else {
    console.log(`GTI.tools brand found (id=${gtiBrand.id})`);
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
      brand: { set: [{ id: gtiBrand.id }] },
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
