import fs from 'fs';
import path from 'path';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const ASTRO_DIR = process.env.IMG_DIR || '/home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/astro';

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
    slug: 'liberty-fr-6105',
    name: 'Liberty FR-6105 3.5 Ton Scissor Lift',
    summary: 'Mid-rise 3.5 ton scissor lift with flush-floor installation for service bays, tire shops, and general repair. Italian motor pumps and seal kits, Taiwanese hydraulic cylinders, and special-treated cylinder assemblies deliver smooth, leak-free operation. 24V control system with limit switch and manually-controlled long-distance lock release ensure safe, reliable service day after day.',
    category: 'lifts-jacks',
    features: [
      'Under-floor installation saves bay space and gives clean workshop look',
      'Italian motor pumps and seal kits for the cylinder deliver proven reliability',
      'All hydraulic cylinders imported from Taiwan with special surface treatment that prevents oil leaks',
      'Mechanical safety valve for anti-explosion protection of the hydraulic system',
      '24V control system and limit switch for safe electrical operation',
      'While switch is addendary, it is controlled from long distance for operator safety',
      'Optional SUV support frame and rubber support pads for raising taller vehicles',
      'Adjustable platform length 1650-2045 mm handles passenger cars through SUVs',
    ],
    technicalTable: [
      { label: 'Model', value: 'FR-6105' },
      { label: 'Capacity', value: '3.5 Ton' },
      { label: 'Lifting Height', value: '300-2130 mm' },
      { label: 'Platform Length', value: '1650-2045 mm' },
      { label: 'Platform Width', value: '540 mm' },
      { label: 'Between Table Width', value: '850 mm' },
      { label: 'SUV Support (Optional)', value: '90-180 mm rubber pads / SUV support frame' },
    ],
    images: ['liberty-lift-full-rise-scissor-lift.webp', 'liberty-lift-full-rise-scissor-lift.jpg'],
  },
  {
    slug: 'liberty-fr-6108',
    name: 'Liberty FR-6108 4.2 / 5.0 Ton Wheel Alignment Scissor Lift',
    summary: 'Ultra-thin surface-mounted scissor lift for wheel alignment and general service. Space-saving design maximizes workshop layout, while 4-cylinder drive with imported seals and explosion-proof valves provides smooth, level lifting. Drive-on ramps give easy vehicle access and the ergonomic control box keeps operation comfortable during long alignment jobs.',
    category: 'lifts-jacks',
    features: [
      'Ultra-thin surface-mounted design for maximum workshop space efficiency',
      '4-cylinder drive with imported seals and explosion-proof valves for smooth, level lifting',
      'Electronic upper limit switch prevents over-travel and protects against mechanical damage',
      'Drive-on ramps provide easy vehicle access without needing a separate approach ramp',
      'Ergonomically positioned control box keeps operator comfortable during long alignment jobs',
      '4.2 / 5.0 ton dual capacity covers passenger cars, SUVs, and light commercial vehicles',
      'Long 4500-5000 mm platforms accommodate long-wheelbase vehicles and wheel alignment jigs',
      'Made in Italy motor pumps and seal kits for proven long-term reliability',
    ],
    technicalTable: [
      { label: 'Model', value: 'FR-6108' },
      { label: 'Capacity', value: '4.2 / 5.0 Ton' },
      { label: 'Lifting Height', value: '33-1850 mm' },
      { label: 'Platform Length', value: '4500-5000 mm' },
      { label: 'Platform Width', value: '630 mm' },
      { label: 'Between Table Width', value: '900 mm' },
    ],
    images: ['liberty-lift-5-ton-wheel-alignment-scissor-lift.webp', 'liberty-lift-5-ton-wheel-alignment-scissor-lift_1.webp', 'liberty-lift-5-ton-wheel-alignment-scissor-lift.jpg', 'liberty-lift-5-ton-wheel-alignment-scissor-lift_1.jpg'],
  },
  {
    slug: 'liberty-tpf-15c',
    name: 'Liberty TPF-15C 6.8 Ton Auto-Manual Two-Post Lift',
    summary: 'Heavy-duty 6.8 ton two-post lift with auto-manual dual operation, designed for super-heavy-duty cars, SUVs, and light commercial vehicles. Extra-long 1800 mm symmetrical arms with 150 mm adapter reach maximum vehicle coverage, while automatic arm lock release and U-shape pads protect the underbody during service.',
    category: 'lifts-jacks',
    features: [
      'Auto-manual dual operation mode adapts to any workshop workflow',
      'Symmetric 1800 mm long arms with optional 150 mm longer adapters reach maximum vehicle footprint',
      'Automatic arm lock release mechanism reduces operator fatigue and speeds cycle times',
      'U-shape lifting pads grip securely on frame rails and protect the underbody',
      'High carriage design with 1800-2065 mm lift height provides comfortable working clearance',
      '3000 mm width between posts and 2670 mm drive-through fits full-size vehicles and vans',
      '880-1800 mm straight arm reach covers everything from city cars to long-wheelbase trucks',
      '6.8 ton capacity handles super-heavy-duty cars, large SUVs, and light commercial vehicles',
    ],
    technicalTable: [
      { label: 'Model', value: 'TPF-15C' },
      { label: 'Capacity', value: '6.8 Ton' },
      { label: 'Lifting Height', value: '110-2065 mm' },
      { label: 'Overall Height', value: '2830 mm' },
      { label: 'Mount Width', value: '3680 mm' },
      { label: 'Drive Thru Width', value: '2670 mm' },
      { label: 'Straight Arm Size (3/3)', value: '880-1800 mm' },
      { label: 'Width Between Posts', value: '3000 mm' },
    ],
    images: ['liberty-lift-6-8-ton-super-heavy-duty-car-lift.webp', 'liberty-lift-6-8-ton-super-heavy-duty-car-lift_1.webp', 'liberty-lift-6-8-ton-super-heavy-duty-car-lift.jpg', 'liberty-lift-6-8-ton-super-heavy-duty-car-lift_1.jpg'],
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

  // Create or get Liberty brand
  const brands = await getBrands(token);
  let libertyBrand = brands.find(b => b.name === 'Liberty' || b.name === 'LIBERTY' || b.name === 'Liberty Lifts' || b.name === 'Liberty Lifts / Liberty Lift' || b.name === 'Liberty Lift');
  if (!libertyBrand) {
    console.log('Liberty brand not found, creating...');
    const r = await api('/content-manager/collection-types/api::brand.brand', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Liberty Lifts', slug: 'liberty-lifts', description: 'Liberty Lifts — heavy-duty vehicle lifts' }),
    });
    if (r.error) { console.log('  ! Failed to create Liberty brand:', r.error.message); return; }
    libertyBrand = r.data;
    await publish(token, 'api::brand.brand', libertyBrand.documentId);
    console.log(`  ✓ Created Liberty brand (id=${libertyBrand.id})`);
  } else {
    console.log(`Liberty brand found (id=${libertyBrand.id})`);
  }

  const categories = await getCategories(token);
  console.log(`Categories: ${categories.map(c => c.slug).join(', ')}`);

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
      brand: { set: [{ id: libertyBrand.id }] },
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
