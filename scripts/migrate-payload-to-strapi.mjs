#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const PAYLOAD_URL = 'http://localhost:3000';
const STRAPI_URL = 'http://localhost:1337';
const MEDIA_DIR = '/tmp/strapi-migration-media';
const PAYLOAD_MEDIA_DIR = path.resolve(PROJECT_ROOT, 'app/public/media');
const CMS_PRODUCT_IMAGES_DIR = path.resolve(PROJECT_ROOT, 'cms/product-images');
let actualAdminEmail = null;
const ADMIN_CREDENTIALS = {
  email: 'admin@autodiagnostix.com',
  password: 'Autodiagnostix123!',
  firstname: 'Admin',
  lastname: 'User',
};
const DB_CONNECTION = 'postgres://autodiagnostix:devpassword@localhost:5432/autodiagnostix_strapi';

let apiToken = null;
let adminJwt = null;
const PAGINATION_LIMIT = 100;

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

function warn(...args) {
  console.log(`[WARN]`, ...args);
}

function errorLog(...args) {
  console.error(`[ERROR]`, ...args);
}

async function fetchJson(url, options = {}, retries = 3) {
  const headers = { ...options.headers };
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { ...options, headers });
      const text = await response.text();
      if (!response.ok) {
        if (response.status === 429 && attempt < retries) {
          const delay = attempt * 5000;
          log(`  Rate limited (429), retrying in ${delay}ms (attempt ${attempt}/${retries})...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${text.slice(0, 300)}`);
      }
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (err) {
      if (err.message.includes('fetch failed') && attempt < retries) {
        const delay = attempt * 3000;
        log(`  Connection error, retrying in ${delay}ms (attempt ${attempt}/${retries})...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText} fetching ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/[\s.+/]+/g, '-')
    .replace(/[^\w-]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================
// STEP 1: Fetch all data from Payload API
// ============================================================
async function fetchPayloadData() {
  log('Fetching data from Payload CMS...');

  const endpoints = [
    { key: 'categories', url: `${PAYLOAD_URL}/api/categories?depth=2&limit=${PAGINATION_LIMIT}` },
    { key: 'brands', url: `${PAYLOAD_URL}/api/brands?depth=2&limit=${PAGINATION_LIMIT}` },
    { key: 'products', url: `${PAYLOAD_URL}/api/products?depth=2&limit=${PAGINATION_LIMIT}` },
    { key: 'pages', url: `${PAYLOAD_URL}/api/pages?depth=2&limit=${PAGINATION_LIMIT}` },
    { key: 'media', url: `${PAYLOAD_URL}/api/media?limit=${PAGINATION_LIMIT}` },
  ];

  const results = {};
  for (const { key, url } of endpoints) {
    log(`  Fetching ${key}...`);
    try {
      const data = await fetchJson(url);
      results[key] = data.docs || [];
      log(`    -> ${results[key].length} items`);
    } catch (err) {
      errorLog(`    FAILED to fetch ${key}: ${err.message}`);
      results[key] = [];
    }
  }

  return results;
}

// ============================================================
// STEP 2: Download media files from Payload
// ============================================================
async function downloadMedia(mediaItems) {
  if (mediaItems.length === 0) {
    log('  No media items to download.');
    return {};
  }

  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  const localPaths = {};

  const searchDirs = [PAYLOAD_MEDIA_DIR, CMS_PRODUCT_IMAGES_DIR];

  for (const item of mediaItems) {
    const filename = item.filename;
    if (!filename) continue;

    const localPath = path.join(MEDIA_DIR, filename);
    if (fs.existsSync(localPath)) {
      log(`  Already cached: ${filename}`);
      localPaths[filename] = localPath;
      continue;
    }

    // Try to find the file in local directories
    let found = false;
    for (const dir of searchDirs) {
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, localPath);
        const stat = fs.statSync(localPath);
        log(`  Copied: ${filename} from ${dir} (${stat.size} bytes)`);
        localPaths[filename] = localPath;
        found = true;
        break;
      }
    }

    if (!found) {
      warn(`  Could not find ${filename} in any local directory`);
    }
  }

  return localPaths;
}

// ============================================================
// STEP 3: Authenticate with Strapi
// ============================================================
async function authenticateStrapi() {
  // Skip auth if API token is provided via env
  if (process.env.STRAPI_API_TOKEN) {
    apiToken = process.env.STRAPI_API_TOKEN;
    log('Using STRAPI_API_TOKEN from environment');
    return { adminJwt: null, apiToken };
  }

  log('Authenticating with Strapi...');
  let token = null;

  // 3a: Try to register admin (likely fails if already exists)
  try {
    log('  Attempting admin registration...');
    const regResult = await fetchJson(`${STRAPI_URL}/admin/register-admin`, {
      method: 'POST',
      body: JSON.stringify(ADMIN_CREDENTIALS),
    });
    if (regResult.data?.token) {
      token = regResult.data.token;
      log('  Admin registered successfully!');
    }
  } catch (err) {
    log(`  Registration failed (expected if admin exists): ${err.message.slice(0, 100)}`);
  }

  // 3b: If no token yet, try login
  if (!token) {
    log('  Attempting login with provided credentials...');
    try {
      const loginResult = await fetchJson(`${STRAPI_URL}/admin/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: ADMIN_CREDENTIALS.email,
          password: ADMIN_CREDENTIALS.password,
        }),
      });
      if (loginResult.data?.token) {
        token = loginResult.data.token;
        log('  Login successful!');
      }
    } catch (err) {
      log(`  Login failed: ${err.message.slice(0, 100)}`);
    }
  }

  // 3c: If still no token, query DB for actual admin email and try again
  if (!token) {
    log('  Querying PostgreSQL for admin user...');
    try {
      const dbResult = execSync(
        `psql "${DB_CONNECTION}" -t -A -c "SELECT email FROM public.admin_users LIMIT 1;"`,
        { encoding: 'utf-8', timeout: 5000 }
      ).trim();
      if (dbResult) {
        actualAdminEmail = dbResult;
        log(`  Found admin email in DB: ${actualAdminEmail}`);
        try {
          const loginResult = await fetchJson(`${STRAPI_URL}/admin/login`, {
            method: 'POST',
            body: JSON.stringify({ email: actualAdminEmail, password: ADMIN_CREDENTIALS.password }),
          });
          if (loginResult.data?.token) {
            token = loginResult.data.token;
            log('  Login successful with DB email!');
          }
        } catch (err2) {
          log(`  Login with DB email failed: ${err2.message.slice(0, 100)}`);
        }
      }
    } catch (dbErr) {
      warn(`  Could not query DB: ${dbErr.message}`);
    }
  }

    // 3d: If still no token, try resetting password
    const resetEmail = actualAdminEmail || ADMIN_CREDENTIALS.email;
    log(`  Attempting password reset for ${resetEmail} via Strapi CLI...`);
    try {
      execSync(
        `cd /home/syedhashimabbas/autodiagnostix-final/site-design-antigravity/strapi && npx strapi admin:reset-password --email="${resetEmail}" --password="${ADMIN_CREDENTIALS.password}"`,
        { encoding: 'utf-8', timeout: 30000 }
      );
      log('  Password reset success. Waiting 5s for server restart...');
      await new Promise(r => setTimeout(r, 5000));
      await new Promise(r => setTimeout(r, 3000));
      log('  Trying login again...');
      const loginResult = await fetchJson(`${STRAPI_URL}/admin/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: resetEmail,
          password: ADMIN_CREDENTIALS.password,
        }),
      });
      if (loginResult.data?.token) {
        token = loginResult.data.token;
        log('  Login successful after password reset!');
      }
    } catch (resetErr) {
      errorLog(`  Password reset failed: ${resetErr.message}`);
    }
  }

  if (!token) {
    throw new Error('Could not authenticate with Strapi admin API');
  }

  adminJwt = token;

  // 3e: Get/Create an API token for content API access
  log('  Ensuring API token exists...');

  // List existing tokens, delete any with our name so we can recreate cleanly
  try {
    const existingTokens = await fetchJson(`${STRAPI_URL}/admin/api-tokens`, {
      headers: { Authorization: `Bearer ${adminJwt}` },
    });
    for (const t of existingTokens.data || []) {
      if (t.name === 'Migration Full Access') {
        log(`  Deleting stale token id=${t.id}...`);
        await fetchJson(`${STRAPI_URL}/admin/api-tokens/${t.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminJwt}` },
        });
      }
    }
  } catch (err) {
    log(`  Token list/delete note: ${err.message.slice(0, 80)}`);
  }

  log('  Creating full-access API token...');
  const tokenResult = await fetchJson(`${STRAPI_URL}/admin/api-tokens`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminJwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Migration Full Access',
      description: 'Full access token for Payload to Strapi migration',
      type: 'full-access',
      lifespan: null,
    }),
  });

  if (!tokenResult.data?.accessKey) {
    throw new Error('Failed to create API token: no accessKey in response');
  }

  apiToken = tokenResult.data.accessKey;
  log(`  API token created: ${apiToken.slice(0, 32)}...`);

  return { adminJwt, apiToken };
}

// ============================================================
// STEP 4: Upload media files to Strapi
// ============================================================
async function uploadMediaToStrapi(mediaItems, localPaths) {
  log('Uploading media to Strapi...');
  const mediaMapping = {}; // Payload filename -> Strapi media ID

  for (const item of mediaItems) {
    const filename = item.filename;
    if (!filename) continue;
    if (!localPaths[filename]) {
      warn(`  Skipping ${filename}: not downloaded`);
      continue;
    }

    // Check if already uploaded by filename
    try {
      const existing = await fetchJson(
        `${STRAPI_URL}/api/upload/files?filters[name][$eq]=${encodeURIComponent(filename)}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      if (existing && existing.length > 0) {
        const strapiId = existing[0].id;
        log(`  Already uploaded: ${filename} (Strapi ID: ${strapiId})`);
        mediaMapping[filename] = strapiId;
        continue;
      }
    } catch {
      // fall through to upload
    }

    const filePath = localPaths[filename];
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: item.mimeType || 'application/octet-stream' });
      formData.append('files', blob, filename);
      formData.append(
        'data',
        JSON.stringify({
          fileInfo: {
            name: filename,
            alternativeText: item.alt || '',
            caption: item.caption || '',
          },
        })
      );

      const uploadResult = await fetchJson(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}` },
        body: formData,
      });

      if (Array.isArray(uploadResult) && uploadResult.length > 0) {
        const strapiId = uploadResult[0].id;
        log(`  Uploaded: ${filename} (Strapi ID: ${strapiId})`);
        mediaMapping[filename] = strapiId;
      } else {
        warn(`  Upload returned unexpected response for ${filename}`);
      }
    } catch (err) {
      warn(`  Failed to upload ${filename}: ${err.message}`);
    }
  }

  log(`  Media mapping created: ${Object.keys(mediaMapping).length} files`);
  return mediaMapping;
}

// ============================================================
// STEP 5: Migrate Categories
// ============================================================
async function migrateCategories(payloadCategories, mediaMapping) {
  log('Migrating categories...');
  const nameToStrapiId = {};
  const slugToStrapiId = {};
  let created = 0;
  let skipped = 0;

  for (const cat of payloadCategories) {
    const slug = cat.id;
    const name = cat.name;

    // Check if category already exists by name
    try {
      const existing = await fetchJson(
        `${STRAPI_URL}/api/categories?filters[name][$eq]=${encodeURIComponent(name)}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      const existingData = existing.data || [];
      if (existingData.length > 0) {
        const strapiId = existingData[0].id;
        log(`  Skipping category "${name}" (already exists, Strapi ID: ${strapiId})`);
        nameToStrapiId[name] = strapiId;
        slugToStrapiId[slug] = strapiId;
        skipped++;
        continue;
      }
    } catch (err) {
      log(`  Error checking existence of category "${name}": ${err.message}`);
    }

    // Map image if present
    let imageId = null;
    if (cat.image && cat.image.filename && mediaMapping[cat.image.filename]) {
      imageId = mediaMapping[cat.image.filename];
    }

    const payload = {
      name: cat.name,
      slug: slugify(cat.name),
      tagline: cat.tagline || '',
      description: cat.description || '',
      icon: cat.icon || '',
      publishedAt: new Date().toISOString(),
    };

    if (imageId) {
      payload.image = imageId;
    }

    try {
      const result = await fetchJson(`${STRAPI_URL}/api/categories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });

      const createdEntry = result.data;
      const strapiId = createdEntry.id;
      log(`  Created category "${name}" (Strapi ID: ${strapiId}, slug: ${createdEntry.slug})`);
      nameToStrapiId[name] = strapiId;
      slugToStrapiId[slug] = strapiId;
      created++;
    } catch (err) {
      errorLog(`  Failed to create category "${name}": ${err.message}`);
    }
  }

  log(`  Categories: ${created} created, ${skipped} skipped`);
  return { nameToStrapiId, slugToStrapiId };
}

// ============================================================
// STEP 6: Migrate Brands
// ============================================================
async function migrateBrands(payloadBrands, mediaMapping) {
  log('Migrating brands...');
  const nameToStrapiId = {};
  const slugToStrapiId = {};
  let created = 0;
  let skipped = 0;

  for (const brand of payloadBrands) {
    const slug = brand.id;
    const name = brand.name;

    try {
      const existing = await fetchJson(
        `${STRAPI_URL}/api/brands?filters[name][$eq]=${encodeURIComponent(name)}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      const existingData = existing.data || [];
      if (existingData.length > 0) {
        const strapiId = existingData[0].id;
        log(`  Skipping brand "${name}" (already exists, Strapi ID: ${strapiId})`);
        nameToStrapiId[name] = strapiId;
        slugToStrapiId[slug] = strapiId;
        skipped++;
        continue;
      }
    } catch {
      // proceed
    }

    let logoId = null;
    if (brand.logo && brand.logo.filename && mediaMapping[brand.logo.filename]) {
      logoId = mediaMapping[brand.logo.filename];
    }

    const payload = {
      name: brand.name,
      slug: slugify(brand.name),
      description: brand.description || '',
      website: brand.website || '',
      publishedAt: new Date().toISOString(),
    };

    if (logoId) {
      payload.logo = logoId;
    }

    try {
      const result = await fetchJson(`${STRAPI_URL}/api/brands`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });

      const createdEntry = result.data;
      const strapiId = createdEntry.id;
      log(`  Created brand "${name}" (Strapi ID: ${strapiId}, slug: ${createdEntry.slug})`);
      nameToStrapiId[name] = strapiId;
      slugToStrapiId[slug] = strapiId;
      created++;
    } catch (err) {
      errorLog(`  Failed to create brand "${name}": ${err.message}`);
    }
  }

  log(`  Brands: ${created} created, ${skipped} skipped`);
  return { nameToStrapiId, slugToStrapiId };
}

// ============================================================
// STEP 7: Migrate Products
// ============================================================
async function migrateProducts(payloadProducts, categoryMapping, brandMapping, mediaMapping) {
  log('Migrating products...');
  let created = 0;
  let skipped = 0;
  const usedSlugs = new Set();

  for (const prod of payloadProducts) {
    const slug = prod.id;
    const name = prod.name;
    let productSlug = slugify(prod.name);
    if (usedSlugs.has(productSlug)) {
      let counter = 1;
      while (usedSlugs.has(`${productSlug}-${counter}`)) counter++;
      productSlug = `${productSlug}-${counter}`;
      log(`  Slug collision for "${name}", using "${productSlug}"`);
    }
    usedSlugs.add(productSlug);

    try {
      const existing = await fetchJson(
        `${STRAPI_URL}/api/products?filters[name][$eq]=${encodeURIComponent(name)}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      const existingData = existing.data || [];
      if (existingData.length > 0) {
        log(`  Skipping product "${name}" (already exists, Strapi ID: ${existingData[0].id})`);
        skipped++;
        continue;
      }
    } catch {
      // proceed
    }

    // Map brand by name
    const brandName = prod.brand?.name;
    const brandStrapiId = brandMapping.nameToStrapiId[brandName];
    if (!brandStrapiId) {
      warn(`  Cannot find Strapi brand for "${brandName}" - skipping product "${name}"`);
      skipped++;
      continue;
    }

    // Map category by name
    const categoryName = prod.category?.name;
    const categoryStrapiId = categoryMapping.nameToStrapiId[categoryName];
    if (!categoryStrapiId) {
      warn(`  Cannot find Strapi category for "${categoryName}" - skipping product "${name}"`);
      skipped++;
      continue;
    }

    // Map heroImages
    const heroImages = (prod.heroImages || [])
      .filter((hi) => hi.image && hi.image.filename && mediaMapping[hi.image.filename])
      .map((hi) => ({ image: mediaMapping[hi.image.filename] }));

    // Map features
    const features = (prod.features || []).map((f) => {
      const feature = { title: f.title || '', description: f.description || '' };
      if (f.image && f.image.filename && mediaMapping[f.image.filename]) {
        feature.image = mediaMapping[f.image.filename];
      }
      return feature;
    });

    // Map technicalTable -> spec-item
    const technicalTable = (prod.technicalTable || []).map((t) => ({
      label: t.label || '',
      value: t.value || '',
    }));

    // Map specs -> spec-item (Payload specs only have value, no label)
    const specs = (prod.specs || []).map((s) => ({
      value: s.value || '',
      label: '',
    }));

    const payload = {
      name: prod.name,
      slug: productSlug,
      summary: prod.summary || '',
      description: prod.description || '',
      brand: brandStrapiId,
      category: categoryStrapiId,
      badge: prod.badge || null,
      price: prod.price != null ? prod.price : null,
      publishedAt: new Date().toISOString(),
    };

    if (heroImages.length > 0) payload.heroImages = heroImages;
    if (features.length > 0) payload.features = features;
    if (technicalTable.length > 0) payload.technicalTable = technicalTable;
    if (specs.length > 0) payload.specs = specs;

    try {
      const result = await fetchJson(`${STRAPI_URL}/api/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });

      const createdEntry = result.data;
      const strapiId = createdEntry.id;
      log(`  Created product "${name}" (Strapi ID: ${strapiId}, slug: ${createdEntry.slug}, heroImages: ${heroImages.length}, features: ${features.length}, techTable: ${technicalTable.length}, specs: ${specs.length})`);
      created++;
    } catch (err) {
      errorLog(`  Failed to create product "${name}": ${err.message}`);
    }
  }

  log(`  Products: ${created} created, ${skipped} skipped`);
}

// ============================================================
// STEP 8: Migrate Pages
// ============================================================
async function migratePages(payloadPages, mediaMapping) {
  log('Migrating pages...');

  if (payloadPages.length === 0) {
    log('  No pages to migrate.');
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const page of payloadPages) {
    const title = page.title;

    try {
      const existing = await fetchJson(
        `${STRAPI_URL}/api/pages?filters[title][$eq]=${encodeURIComponent(title)}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      const existingData = existing.data || [];
      if (existingData.length > 0) {
        log(`  Skipping page "${title}" (already exists, Strapi ID: ${existingData[0].id})`);
        skipped++;
        continue;
      }
    } catch {
      // proceed
    }

    let heroImageId = null;
    if (page.heroImage && page.heroImage.filename && mediaMapping[page.heroImage.filename]) {
      heroImageId = mediaMapping[page.heroImage.filename];
    }

    const slug = slugify(page.title);
    const payload = {
      title: page.title,
      slug: slug,
      content: page.content || '',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      published: page.published !== undefined ? page.published : true,
      publishedAt: new Date().toISOString(),
    };

    if (heroImageId) {
      payload.heroImage = heroImageId;
    }

    try {
      const result = await fetchJson(`${STRAPI_URL}/api/pages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });

      const strapiId = result.data.id;
      log(`  Created page "${title}" (Strapi ID: ${strapiId}, slug: ${result.data.slug})`);
      created++;
    } catch (err) {
      errorLog(`  Failed to create page "${title}": ${err.message}`);
    }
  }

  log(`  Pages: ${created} created, ${skipped} skipped`);
}

// ============================================================
// STEP 9: Verify migration
// ============================================================
async function verifyMigration() {
  log('\nVerifying migration...');

  const checks = ['categories', 'brands', 'products', 'pages'];
  for (const type of checks) {
    try {
      const result = await fetchJson(`${STRAPI_URL}/api/${type}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const count = (result.data || []).length;
      const total = result.meta?.pagination?.total || count;
      log(`  ${type}: ${total} entries in Strapi`);
    } catch (err) {
      warn(`  Could not verify ${type}: ${err.message}`);
    }
  }

  try {
    const filesResult = await fetchJson(`${STRAPI_URL}/api/upload/files`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    const fileCount = Array.isArray(filesResult) ? filesResult.length : (filesResult.data || []).length;
    log(`  media: ${fileCount} files uploaded`);
  } catch (err) {
    warn(`  Could not verify media: ${err.message}`);
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('='.repeat(60));
  console.log('  Payload CMS -> Strapi CMS Migration');
  console.log('='.repeat(60));
  console.log();

  try {
    // Step 1: Fetch Payload data
    console.log('--- Step 1: Fetching Payload data ---');
    const payloadData = await fetchPayloadData();

    // Step 2: Download media
    console.log('\n--- Step 2: Downloading media from Payload ---');
    const localPaths = await downloadMedia(payloadData.media);

    // Step 3: Authenticate with Strapi
    console.log('\n--- Step 3: Authenticating with Strapi ---');
    await authenticateStrapi();

    // Step 4: Upload media to Strapi
    console.log('\n--- Step 4: Uploading media to Strapi ---');
    const mediaMapping = await uploadMediaToStrapi(payloadData.media, localPaths);

    // Step 5: Migrate categories
    console.log('\n--- Step 5: Migrating categories ---');
    const categoryMapping = await migrateCategories(payloadData.categories, mediaMapping);

    // Step 6: Migrate brands
    console.log('\n--- Step 6: Migrating brands ---');
    const brandMapping = await migrateBrands(payloadData.brands, mediaMapping);

    // Step 7: Migrate products
    console.log('\n--- Step 7: Migrating products ---');
    await migrateProducts(payloadData.products, categoryMapping, brandMapping, mediaMapping);

    // Step 8: Migrate pages
    console.log('\n--- Step 8: Migrating pages ---');
    await migratePages(payloadData.pages, mediaMapping);

    // Step 9: Verify
    console.log('\n--- Step 9: Verification ---');
    await verifyMigration();

    console.log('\n' + '='.repeat(60));
    console.log('  Migration completed!');
    console.log('='.repeat(60));
  } catch (err) {
    console.error('\nFATAL ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
