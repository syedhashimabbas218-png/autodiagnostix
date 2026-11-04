// Replace the products that were imported incorrectly on 2026-11-04 (all
// carry the NEW badge) with researched data from manufacturer sites or, where
// no official page exists, the AutoDiagnostix portfolio PDF.
//
// Usage (from astro/):
//   STRAPI_KEY=... node scripts/replace-new-products.mjs            # dry run (default): reads only
//   STRAPI_KEY=... node scripts/replace-new-products.mjs --apply    # deletes + re-creates
// Options: --keep-media (do not delete the old products' unused media files)
//          --only=slug1,slug2 (canary: delete and re-create only these slugs)
//
// Recommended order: dry run -> --apply --only=<one slug> -> check the site -> --apply.
// Env: STRAPI_URL (default https://strapi.autodiagnostix.com.pk), STRAPI_KEY or STRAPI_API_TOKEN.
//
// Safety:
// - Only products with badge NEW AND createdAt on 2026-11-04 are deleted.
// - A full authenticated backup (drafts + published) is written before any change.
// - Media files are deleted only when no remaining product references them.
// - Products whose slug already exists (and is not being deleted) are skipped, so
//   a re-run after a partial failure does not create duplicates.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(HERE, 'data', 'catalog-2026-11');
const STRAPI_URL = (process.env.STRAPI_URL || 'https://strapi.autodiagnostix.com.pk').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_KEY || process.env.STRAPI_API_TOKEN || '';
const args = new Set(process.argv.slice(2).filter(a => !a.includes('=')));
const opts = Object.fromEntries(process.argv.slice(2).filter(a => a.includes('=')).map(a => a.replace(/^--/, '').split('=')));
const APPLY = args.has('--apply');
const KEEP_MEDIA = args.has('--keep-media');
const ONLY = opts.only ? new Set(opts.only.split(',')) : null;
const BAD_IMPORT_DAY = '2026-11-04';

if (!TOKEN) {
  console.error('Missing STRAPI_KEY (or STRAPI_API_TOKEN). Aborting.');
  process.exit(1);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function api(method, route, body, { raw = false, retries = 3 } = {}) {
  for (let attempt = 1; ; attempt++) {
    const headers = { Authorization: `Bearer ${TOKEN}` };
    let payload = body;
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const response = await fetch(`${STRAPI_URL}${route}`, { method, headers, body: payload });
    if (response.status >= 500 && attempt < retries) { await sleep(1500 * attempt); continue; }
    const text = await response.text();
    if (!response.ok) throw new Error(`${method} ${route} -> ${response.status}: ${text.slice(0, 500)}`);
    if (raw) return text;
    return text ? JSON.parse(text) : null;
  }
}

async function listAll(route) {
  const rows = [];
  for (let page = 1; page < 50; page++) {
    const sep = route.includes('?') ? '&' : '?';
    const res = await api('GET', `${route}${sep}pagination[pageSize]=100&pagination[page]=${page}`);
    rows.push(...res.data);
    if (page >= (res.meta?.pagination?.pageCount ?? 1)) break;
  }
  return rows;
}

const FULL_POPULATE = 'populate[heroImages][populate][image]=true&populate[features][fields][0]=title&populate[features][fields][1]=description&populate[functions][fields][0]=title&populate[functions][fields][1]=description&populate[technicalTable]=true&populate[specs]=true&populate[brand]=true&populate[category]=true';

function featureItems(list = []) {
  // Same convention as the existing catalog: short title, full text in description.
  return list.filter(Boolean).map(text => {
    const clean = String(text).replace(/\s+/g, ' ').trim();
    const title = clean.length > 60 ? `${clean.slice(0, 57).trimEnd()}...` : clean;
    return { title, description: clean };
  });
}

async function uploadImage(file, alt) {
  const buffer = fs.readFileSync(file);
  const ext = path.extname(file).slice(1).toLowerCase();
  const type = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' }[ext] || 'application/octet-stream';
  const form = new FormData();
  form.append('files', new Blob([buffer], { type }), path.basename(file));
  form.append('fileInfo', JSON.stringify({ alternativeText: alt, caption: alt }));
  const res = await api('POST', '/api/upload', form);
  return Array.isArray(res) ? res[0] : res;
}

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
  console.log(`Mode: ${APPLY ? 'APPLY (writes to CMS)' : 'DRY RUN (read-only)'} | CMS: ${STRAPI_URL}`);

  // 1. Read everything (authenticated: includes drafts) and back it up.
  const [published, drafts, brands, categories] = await Promise.all([
    listAll(`/api/products?status=published&${FULL_POPULATE}`),
    listAll(`/api/products?status=draft&fields[0]=slug&fields[1]=badge&fields[2]=createdAt`),
    listAll('/api/brands?fields[0]=name&fields[1]=slug'),
    listAll('/api/categories?fields[0]=name&fields[1]=slug'),
  ]);
  const backupDir = path.join(HERE, '..', '.tmp', 'cms-backup');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(path.join(backupDir, `products-${stamp}.json`), JSON.stringify({ published, drafts }, null, 1));
  console.log(`Backup: ${published.length} published, ${drafts.length} draft versions -> .tmp/cms-backup/products-${stamp}.json`);

  // 2. Deletion set: NEW badge AND created on the bad import day.
  const byDoc = new Map();
  for (const row of [...published, ...drafts]) byDoc.set(row.documentId, { ...byDoc.get(row.documentId), ...row });
  // With --only (canary runs), deletion is limited to those slugs as well.
  const toDelete = [...byDoc.values()].filter(row => row.badge === 'NEW' && String(row.createdAt).startsWith(BAD_IMPORT_DAY) && (!ONLY || ONLY.has(row.slug)));
  const notMatching = [...byDoc.values()].filter(row => row.badge === 'NEW' && !String(row.createdAt).startsWith(BAD_IMPORT_DAY));
  console.log(`\nTo delete (${toDelete.length}):`);
  toDelete.forEach(row => console.log(`  - ${row.slug}  (created ${row.createdAt})`));
  if (notMatching.length) console.log(`NEW-badge products NOT created on ${BAD_IMPORT_DAY} (kept): ${notMatching.map(r => r.slug).join(', ')}`);

  // 3. Validate the replacement data.
  const brandBySlug = Object.fromEntries(brands.map(b => [b.slug, b.documentId]));
  const categoryBySlug = Object.fromEntries(categories.map(c => [c.slug, c.documentId]));
  const deletingSlugs = new Set(toDelete.map(r => r.slug));
  const existingSlugs = new Set([...byDoc.values()].map(r => r.slug).filter(s => !deletingSlugs.has(s)));
  const problems = [];
  const plan = products.filter(p => !ONLY || ONLY.has(p.slug));
  for (const p of plan) {
    if (!p.slug || !p.name) problems.push(`${p.slug || '?'}: missing slug or name`);
    for (const b of p.brands || []) if (!brandBySlug[b]) problems.push(`${p.slug}: unknown brand ${b}`);
    if (!categoryBySlug[p.category]) problems.push(`${p.slug}: unknown category ${p.category}`);
    if (!(p.images || []).length) problems.push(`${p.slug}: no images`);
    for (const img of p.images || []) if (!fs.existsSync(path.join(DATA_DIR, img))) problems.push(`${p.slug}: missing image ${img}`);
  }
  console.log(`\nTo create (${plan.length}):`);
  plan.forEach(p => console.log(`  + ${p.slug} | ${p.name} | ${p.category} | ${(p.brands || []).join(',')} | ${p.images.length} img | ${(p.features || []).length} feat | ${(p.technicalTable || []).length} specs | ${p.source}`));
  const skipped = plan.filter(p => existingSlugs.has(p.slug));
  if (skipped.length) console.log(`Already present (will be skipped): ${skipped.map(p => p.slug).join(', ')}`);
  if (problems.length) {
    console.error(`\nData problems:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  if (!APPLY) { console.log('\nDry run only. Re-run with --apply to make these changes.'); return; }

  // 4. Delete the wrong products, then any media only they used.
  const oldMediaIds = new Set();
  for (const row of toDelete) {
    const full = published.find(p => p.documentId === row.documentId);
    for (const h of full?.heroImages || []) if (h.image?.id) oldMediaIds.add(h.image.id);
    await api('DELETE', `/api/products/${row.documentId}`);
    console.log(`deleted ${row.slug}`);
    await sleep(150);
  }
  if (!KEEP_MEDIA && oldMediaIds.size) {
    const stillUsed = new Set();
    for (const p of published.filter(p => !deletingSlugs.has(p.slug))) for (const h of p.heroImages || []) if (h.image?.id) stillUsed.add(h.image.id);
    for (const id of oldMediaIds) {
      if (stillUsed.has(id)) continue;
      try { await api('DELETE', `/api/upload/files/${id}`); } catch (error) { console.warn(`could not delete media ${id}: ${error.message}`); }
    }
    console.log(`removed ${[...oldMediaIds].filter(id => !stillUsed.has(id)).length} unused media files`);
  }

  // 5. Create the replacements.
  const created = [];
  for (const p of plan) {
    if (existingSlugs.has(p.slug)) { console.log(`skip ${p.slug} (exists)`); continue; }
    const heroImages = [];
    for (const [index, img] of p.images.entries()) {
      const file = await uploadImage(path.join(DATA_DIR, img), `${p.name}${index ? ` image ${index + 1}` : ''}`);
      heroImages.push({ image: file.id });
    }
    const technicalTable = (p.technicalTable || []).map(({ label, value }) => ({ label, value }));
    const data = {
      name: p.name,
      slug: p.slug,
      summary: p.summary,
      description: p.description || p.summary,
      brand: (p.brands || []).map(b => brandBySlug[b]),
      category: categoryBySlug[p.category],
      heroImages,
      features: featureItems(p.features),
      functions: featureItems(p.functions),
      technicalTable,
      specs: technicalTable.map(({ label, value }) => ({ label: 'Spec', value: `${label}: ${value}` })),
    };
    const res = await api('POST', '/api/products?status=published', { data });
    created.push(res.data);
    console.log(`created ${p.slug} (${res.data.documentId})`);
    await sleep(150);
  }

  // 6. Verify through the public API.
  for (const p of created) {
    const res = await fetch(`${STRAPI_URL}/api/products?filters[slug][$eq]=${encodeURIComponent(p.slug)}&populate[heroImages][populate][image][fields][0]=url`);
    const json = await res.json();
    const row = json.data?.[0];
    console.log(`${row ? 'ok ' : 'MISSING'} ${p.slug}${row ? ` (${row.heroImages?.length || 0} images)` : ''}`);
  }
  console.log('\nDone.');
}

main().catch(error => { console.error(error); process.exit(1); });
