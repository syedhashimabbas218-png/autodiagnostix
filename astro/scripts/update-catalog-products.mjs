// Bring the live 2026-11 catalog products in line with
// scripts/data/catalog-2026-11/products.json by editing them in place (PUT), so
// document ids, URLs and untouched images stay as they are.
//
// Usage (from astro/):
//   STRAPI_KEY=... node scripts/update-catalog-products.mjs --images=<slugs>           # dry run: prints every change
//   STRAPI_KEY=... node scripts/update-catalog-products.mjs --images=<slugs> --apply
// Options: --images=slug1,slug2  replace these products' images with the files in the data folder
//          --only=slug1,slug2    limit the run to these products (canary)
//          --keep-media          do not delete images that no product uses any more
// Env: STRAPI_URL (default https://strapi.autodiagnostix.com.pk), STRAPI_KEY or STRAPI_API_TOKEN.
//
// Safety:
// - Writes an authenticated backup (published + drafts) before any change.
// - Products are matched by slug or by `previousSlugs` (renames); nothing is created or deleted.
// - Only fields that differ are sent; a product that already matches is skipped.
// - Replaced images are uploaded under content-hashed names, so a re-run with the
//   same --images list sees them as current and does not upload them again.
// - Old images are deleted only when no product references them any more.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { STRAPI_URL, requireToken, sleep, parseArgs, api, listAll, FULL_POPULATE, featureItems, uploadImage, writeBackup } from './lib/strapi-rest.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(HERE, 'data', 'catalog-2026-11');
const { flags, list } = parseArgs();
const APPLY = flags.has('--apply');
const KEEP_MEDIA = flags.has('--keep-media');
const ONLY = list('only');
const IMAGES = list('images') || new Set();

requireToken();

const pairs = (rows = [], a, b) => rows.map(row => ({ [a]: row?.[a] ?? '', [b]: row?.[b] ?? '' }));
const imageName = (slug, index, file) =>
  `${slug}-${index + 1}-${crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 10)}${path.extname(file)}`;

function desiredFields(p, brandBySlug, categoryBySlug) {
  const technicalTable = pairs(p.technicalTable, 'label', 'value');
  return {
    name: p.name,
    slug: p.slug,
    summary: p.summary,
    description: p.description || p.summary,
    badge: p.badge ?? null,
    brand: [...(p.brands || [])].sort(),
    category: p.category,
    features: featureItems(p.features),
    functions: featureItems(p.functions),
    technicalTable,
    specs: technicalTable.map(({ label, value }) => ({ label: 'Spec', value: `${label}: ${value}` })),
  };
}

function currentFields(row) {
  return {
    name: row.name,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    badge: row.badge ?? null,
    brand: (row.brand || []).map(b => b.slug).sort(),
    category: row.category?.slug ?? null,
    features: pairs(row.features, 'title', 'description'),
    functions: pairs(row.functions, 'title', 'description'),
    technicalTable: pairs(row.technicalTable, 'label', 'value'),
    specs: pairs(row.specs, 'label', 'value'),
  };
}

const show = value => (Array.isArray(value) ? `${value.length} item(s)` : JSON.stringify(value)?.slice(0, 80));

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
  console.log(`Mode: ${APPLY ? 'APPLY (writes to CMS)' : 'DRY RUN (read-only)'} | CMS: ${STRAPI_URL}`);

  // 1. Read everything (authenticated: includes drafts) and back it up.
  const [published, drafts, brands, categories] = await Promise.all([
    listAll(`/api/products?status=published&${FULL_POPULATE}`),
    listAll('/api/products?status=draft&fields[0]=slug&fields[1]=badge&fields[2]=updatedAt'),
    listAll('/api/brands?fields[0]=name&fields[1]=slug'),
    listAll('/api/categories?fields[0]=name&fields[1]=slug'),
  ]);
  const backup = writeBackup(path.join(HERE, '..', '.tmp', 'cms-backup'), 'products-before-update', { published, drafts });
  console.log(`Backup: ${published.length} published, ${drafts.length} draft versions -> ${path.relative(path.join(HERE, '..'), backup)}`);

  // 2. Match every product and work out what differs.
  const brandBySlug = Object.fromEntries(brands.map(b => [b.slug, b.documentId]));
  const categoryBySlug = Object.fromEntries(categories.map(c => [c.slug, c.documentId]));
  const bySlug = new Map(published.map(row => [row.slug, row]));
  const problems = [];
  const plan = [];
  for (const p of products.filter(p => !ONLY || ONLY.has(p.slug))) {
    const row = bySlug.get(p.slug) || (p.previousSlugs || []).map(s => bySlug.get(s)).find(Boolean);
    if (!row) { problems.push(`${p.slug}: no published product with this slug or a previous slug`); continue; }
    const clash = [...published, ...drafts].find(other => other.slug === p.slug && other.documentId !== row.documentId);
    if (clash) problems.push(`${p.slug}: slug already used by another product (${clash.documentId})`);
    for (const b of p.brands || []) if (!brandBySlug[b]) problems.push(`${p.slug}: unknown brand ${b}`);
    if (!categoryBySlug[p.category]) problems.push(`${p.slug}: unknown category ${p.category}`);
    for (const img of p.images || []) if (!fs.existsSync(path.join(DATA_DIR, img))) problems.push(`${p.slug}: missing image ${img}`);

    const want = desiredFields(p, brandBySlug, categoryBySlug);
    const have = currentFields(row);
    const changed = Object.keys(want).filter(key => JSON.stringify(want[key]) !== JSON.stringify(have[key]));
    let images = null;
    if (IMAGES.has(p.slug)) {
      const names = p.images.map((img, i) => imageName(p.slug, i, path.join(DATA_DIR, img)));
      const current = (row.heroImages || []).map(h => h.image?.name);
      if (JSON.stringify(names) !== JSON.stringify(current)) images = { names, current, oldIds: (row.heroImages || []).map(h => h.image?.id).filter(Boolean) };
    }
    plan.push({ p, row, want, have, changed, images });
  }
  for (const slug of IMAGES) if (!products.some(p => p.slug === slug)) problems.push(`--images: unknown slug ${slug}`);

  const work = plan.filter(item => item.changed.length || item.images);
  console.log(`\nTo update (${work.length} of ${plan.length}):`);
  for (const { p, row, want, have, changed, images } of work) {
    console.log(`  ~ ${row.slug}${row.slug !== p.slug ? ` -> ${p.slug}` : ''} (${row.documentId})`);
    for (const key of changed) console.log(`      ${key}: ${show(have[key])} -> ${show(want[key])}`);
    if (images) console.log(`      images: ${images.current.length} -> ${images.names.length} (re-upload)`);
  }
  const unchanged = plan.filter(item => !work.includes(item));
  if (unchanged.length) console.log(`Already up to date: ${unchanged.map(item => item.p.slug).join(', ')}`);
  if (problems.length) {
    console.error(`\nProblems (nothing changed):\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  if (!APPLY) { console.log('\nDry run only. Re-run with --apply to make these changes.'); return; }

  // 3. Apply. The REST update publishes by default (core service uses status: 'published').
  const oldMediaIds = new Set();
  for (const { p, row, want, changed, images } of work) {
    const data = {};
    for (const key of changed) {
      if (key === 'brand') data.brand = want.brand.map(slug => brandBySlug[slug]);
      else if (key === 'category') data.category = categoryBySlug[want.category];
      else data[key] = want[key];
    }
    if (images) {
      data.heroImages = [];
      for (const [index, img] of p.images.entries()) {
        const file = await uploadImage(path.join(DATA_DIR, img), `${p.name}${index ? ` image ${index + 1}` : ''}`, images.names[index]);
        data.heroImages.push({ image: file.id });
      }
      images.oldIds.forEach(id => oldMediaIds.add(id));
    }
    await api('PUT', `/api/products/${row.documentId}`, { data });
    console.log(`updated ${p.slug}: ${[...changed, ...(images ? ['images'] : [])].join(', ')}`);
    await sleep(150);
  }

  // 4. Remove images no product uses any more.
  if (!KEEP_MEDIA && oldMediaIds.size) {
    const after = await listAll('/api/products?status=published&fields[0]=slug&populate[heroImages][populate][image][fields][0]=name');
    const afterDrafts = await listAll('/api/products?status=draft&fields[0]=slug&populate[heroImages][populate][image][fields][0]=name');
    const stillUsed = new Set([...after, ...afterDrafts].flatMap(row => (row.heroImages || []).map(h => h.image?.id)).filter(Boolean));
    let removed = 0;
    for (const id of oldMediaIds) {
      if (stillUsed.has(id)) continue;
      try { await api('DELETE', `/api/upload/files/${id}`); removed++; } catch (error) { console.warn(`could not delete media ${id}: ${error.message}`); }
    }
    console.log(`removed ${removed} unused media files`);
  }

  // 5. Verify through the public API.
  let failures = 0;
  for (const { p, images, row } of work) {
    const res = await fetch(`${STRAPI_URL}/api/products?filters[slug][$eq]=${encodeURIComponent(p.slug)}&fields[0]=name&fields[1]=badge&populate[heroImages][populate][image][fields][0]=url`);
    const live = (await res.json()).data?.[0];
    const expectedImages = images ? p.images.length : (row.heroImages || []).length;
    const ok = live && live.name === p.name && (live.badge ?? null) === (p.badge ?? null) && (live.heroImages || []).length === expectedImages;
    if (!ok) failures++;
    console.log(`${ok ? 'ok ' : 'MISMATCH'} ${p.slug}${live ? ` (${live.heroImages?.length || 0} images, badge ${live.badge})` : ' (not found)'}`);
  }
  console.log(failures ? `\n${failures} product(s) did not verify.` : '\nDone.');
  if (failures) process.exit(1);
}

main().catch(error => { console.error(error); process.exit(1); });
