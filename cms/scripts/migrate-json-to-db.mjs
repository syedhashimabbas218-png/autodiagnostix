import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '../../api/data')

function loadJSON(filename) {
  const p = resolve(DATA_DIR, filename)
  if (!existsSync(p)) {
    console.warn(`⚠️  ${filename} not found, skipping`)
    return []
  }
  return JSON.parse(readFileSync(p, 'utf-8'))
}

// This script generates a seed file for Payload CMS
// Run after setting up Payload with `payload run` or use the admin API

console.log('📦 Autodiagnostix Data Migration Tool')
console.log('====================================\n')

const products = loadJSON('products.json')
const categories = loadJSON('categories.json')

console.log(`Found ${products.length} products and ${categories.length} categories\n`)

// Extract unique brands from products
const brandSet = new Set()
products.forEach(p => {
  const name = p.brand || 'Unknown'
  brandSet.add(name)
})

const brands = Array.from(brandSet).map(name => ({
  id: name.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, ''),
  name,
}))

console.log(`Extracted ${brands.length} unique brands\n`)

// Generate a seed script
const seedContent = `
import type { Payload } from 'payload'

export const seed = async (payload: Payload): Promise<void> => {
  // Create brands
  const brandDocs = await Promise.all(
    ${JSON.stringify(brands, null, 2)}.map(b =>
      payload.create({
        collection: 'brands',
        data: b,
        overwriteExisting: true,
      }).catch(() => null)
    )
  )

  const brandMap: Record<string, string> = {}
  brandDocs.forEach((doc, i) => {
    if (doc) brandMap[brands[i].name.toLowerCase()] = doc.id
  })

  // Create categories
  const catDocs = await Promise.all(
    ${JSON.stringify(categories, null, 2)}.map(c =>
      payload.create({
        collection: 'categories',
        data: c,
        overwriteExisting: true,
      }).catch(() => null)
    )
  )

  const catMap: Record<string, string> = {}
  catDocs.forEach((doc, i) => {
    if (doc) catMap[categories[i].name.toLowerCase()] = doc.id
  })

  // Create products
  for (const p of ${JSON.stringify(products, null, 2)}) {
    const brandSlug = (p.brand || '').toLowerCase().replace(/[\\s/]+/g, '-').replace(/[^a-z0-9-]/g, '')
    const catSlug = (p.category || '').toLowerCase().replace(/ & /g, '-').replace(/\\s+/g, '-')

    await payload.create({
      collection: 'products',
      data: {
        id: p.id,
        name: p.name,
        summary: p.summary,
        description: p.description,
        brand: brandMap[p.brand?.toLowerCase()] || '',
        category: catMap[p.category?.toLowerCase()] || '',
        badge: p.badge || null,
        specs: (p.specs || []).map(s => ({ value: s })),
        technicalTable: p.technicalTable || [],
        features: p.features || [],
      },
      overwriteExisting: true,
    }).catch(err => console.error(\`Failed to create product \${p.id}: \${err.message}\`))
  }

  console.log('✅ Seed complete')
}
`.trim()

// Write the seed file
const seedPath = resolve(__dirname, '../seed.ts')
writeFileSync(seedPath, seedContent, 'utf-8')
console.log(`✅ Seed file written to ${seedPath}`)
console.log('\nTo run:')
console.log('  1. Ensure PostgreSQL is running')
console.log('  2. Set DATABASE_URL in .env')
console.log('  3. Run: npx payload run seed.ts')
`
