import fs from 'fs';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';

async function login() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  return data.data.token;
}

async function api(path, options = {}) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function getExisting(token, contentType) {
  const res = await api(
    `/content-manager/collection-types/${contentType}?pageSize=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.results || [];
}

async function createEntry(token, contentType, data) {
  const res = await api(
    `/content-manager/collection-types/${contentType}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return res;
}

async function deleteEntry(token, contentType, id) {
  await api(
    `/content-manager/collection-types/${contentType}/${id}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

async function publishEntry(token, contentType, id) {
  await api(
    `/content-manager/collection-types/${contentType}/${id}/actions/publish`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }
  );
}

async function main() {
  const token = await login();
  console.log('Logged in');

  // Read all data from the public API (which works with SQL data)
  const [brands, categories, products] = await Promise.all([
    api('/api/brands?populate=*', { headers: { Authorization: `Bearer ${token}` } }).then(d => d.data || []),
    api('/api/categories?populate=*', { headers: { Authorization: `Bearer ${token}` } }).then(d => d.data || []),
    api('/api/products?populate[features]=*&populate[technicalTable]=*&populate[heroImages]=*&populate[brand]=*&populate[category]=*&pageSize=100', { headers: { Authorization: `Bearer ${token}` } }).then(d => d.data || []),
  ]);

  console.log(`Found ${brands.length} brands, ${categories.length} categories, ${products.length} products in DB`);

  // Delete old content-manager entries (from previous failed attempts)
  const existingBrands = await getExisting(token, 'api::brand.brand');
  const existingCategories = await getExisting(token, 'api::category.category');
  const existingProducts = await getExisting(token, 'api::product.product');

  for (const b of existingBrands) await deleteEntry(token, 'api::brand.brand', b.id);
  for (const c of existingCategories) await deleteEntry(token, 'api::category.category', c.id);
  for (const p of existingProducts) await deleteEntry(token, 'api::product.product', p.id);

  console.log('Cleaned up old content-manager entries');

  // Re-create brands via content-manager API
  const brandMap = {};
  for (const b of brands) {
    const attrs = b.attributes || b;
    const created = await createEntry(token, 'api::brand.brand', {
      name: attrs.name,
      slug: attrs.slug,
      description: attrs.description || '',
      website: attrs.website || '',
    });
    if (created.data) {
      brandMap[attrs.slug || attrs.name] = created.data.id;
      await publishEntry(token, 'api::brand.brand', created.data.id);
      console.log(`  Created brand: ${attrs.name} (id=${created.data.id})`);
    }
  }

  // Re-create categories via content-manager API
  const categoryMap = {};
  for (const c of categories) {
    const attrs = c.attributes || c;
    const created = await createEntry(token, 'api::category.category', {
      name: attrs.name,
      slug: attrs.slug,
      tagline: attrs.tagline || '',
      description: attrs.description || '',
      icon: attrs.icon || '',
    });
    if (created.data) {
      categoryMap[attrs.slug || attrs.name] = created.data.id;
      await publishEntry(token, 'api::category.category', created.data.id);
      console.log(`  Created category: ${attrs.name} (id=${created.data.id})`);
    }
  }

  // Re-create products via content-manager API
  for (const p of products) {
    const attrs = p.attributes || p;
    const brandSlug = attrs.brand?.data?.attributes?.slug || attrs.brand?.slug;
    const categorySlug = attrs.category?.data?.attributes?.slug || attrs.category?.slug;

    const productData = {
      name: attrs.name,
      slug: attrs.slug,
      summary: attrs.summary || '',
      description: attrs.description || '',
      badge: attrs.badge || null,
      price: attrs.price || null,
      brand: brandMap[brandSlug] ? brandMap[brandSlug] : null,
      category: categoryMap[categorySlug] ? categoryMap[categorySlug] : null,
      features: (attrs.features || []).map(f => ({
        title: f.title || '',
        description: f.description || '',
      })),
      technicalTable: (attrs.technicalTable || []).map(t => ({
        label: t.label || '',
        value: t.value || '',
      })),
      heroImages: (attrs.heroImages || []).map(h => ({
        image: null, // can't transfer media via API
      })),
    };

    const created = await createEntry(token, 'api::product.product', productData);
    if (created.data) {
      await publishEntry(token, 'api::product.product', created.data.id);
      console.log(`  Created product: ${attrs.name} (id=${created.data.id})`);
    }
  }

  console.log('\nDone! All entries re-created in content-manager.');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
