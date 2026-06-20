import { Client } from 'pg';

const CO_DEV_SLUGS = new Set([
  'launch-x-431-cnc-605a',
  'wa613-wireless-3d-wheel-aligner',
  'x-431-adas-pro-plus',
  'cnc-605-pro-plus',
  'x861-lite-wheelalignment-machine',
]);

const SMARTSAFE_ONLY_SLUGS = new Set([
  'value-ac519-a-c-service-station',
]);

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'autodiagnostix',
  password: 'devpassword',
  database: 'autodiagnostix_strapi',
});

await client.connect();

// Get brand IDs
const { rows: brands } = await client.query("SELECT id, name FROM brands WHERE name IN ('Launch', 'Smartsafe')");
const launchId = brands.find(b => b.name === 'Launch').id;
const smartsafeId = brands.find(b => b.name === 'Smartsafe').id;
console.log(`Launch id=${launchId}, Smartsafe id=${smartsafeId}`);

// First, delete all existing brand links for the affected products
const allSlugs = [...CO_DEV_SLUGS, ...SMARTSAFE_ONLY_SLUGS];
const { rows: products } = await client.query(
  `SELECT id, slug FROM products WHERE slug = ANY($1)`,
  [allSlugs.map(s => s.toLowerCase())]
);
console.log(`Found ${products.length} affected products`);

for (const p of products) {
  const target = CO_DEV_SLUGS.has(p.slug) ? [launchId, smartsafeId] : [smartsafeId];
  await client.query('DELETE FROM products_brand_lnk WHERE product_id = $1', [p.id]);
  for (let i = 0; i < target.length; i++) {
    await client.query(
      'INSERT INTO products_brand_lnk (product_id, brand_id, product_ord) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [p.id, target[i], i + 1]
    );
  }
  const names = target.map(id => id === launchId ? 'Launch' : 'Smartsafe').join(' + ');
  console.log(`  ✓ ${p.slug} (id=${p.id}) -> [${names}]`);
}

await client.end();
console.log('\nDone.');
