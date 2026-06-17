/**
 * Seed script for Payload CMS.
 * Run AFTER Payload is deployed and PostgreSQL is connected.
 *
 * Usage: CMS_BASE_URL=http://localhost:3000/api PAYLOAD_API_KEY=<token> node scripts/seed.mjs
 */

const CMS_API = process.env.CMS_BASE_URL || 'http://localhost:3000/api'
const API_KEY = process.env.PAYLOAD_API_KEY

async function api(method, path, body) {
  const url = `${CMS_API}${path}`
  const headers = { 'Content-Type': 'application/json' }
  if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${url} \u2192 ${res.status}: ${text.slice(0, 200)}`)
  }

  return res.json()
}

async function seed() {
  console.log('Seeding Payload CMS...\n')

  const { readFileSync, existsSync } = await import('fs')
  const { resolve, dirname } = await import('path')
  const { fileURLToPath } = await import('url')
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const DATA_DIR = resolve(__dirname, '../../api/data')

  const productsPath = resolve(DATA_DIR, 'products.json')
  const categoriesPath = resolve(DATA_DIR, 'categories.json')

  if (!existsSync(productsPath) || !existsSync(categoriesPath)) {
    console.error('Data files not found at', DATA_DIR)
    process.exit(1)
  }

  const products = JSON.parse(readFileSync(productsPath, 'utf-8'))
  const categories = JSON.parse(readFileSync(categoriesPath, 'utf-8'))

  console.log(`${products.length} products, ${categories.length} categories\n`)

  // 1. Import categories (strip media fields for now)
  console.log('--- Categories ---')
  for (const cat of categories) {
    const payload = {
      id: cat.id,
      name: cat.name,
      tagline: cat.tagline || '',
      description: cat.description || '',
    }
    if (cat.icon) payload.icon = cat.icon
    try {
      await api('POST', '/categories', payload)
      console.log(`  OK ${cat.id} \u2192 ${cat.name}`)
    } catch (err) {
      try {
        await api('PATCH', `/categories/${cat.id}`, payload)
        console.log(`  OK ${cat.id} \u2192 updated`)
      } catch {
        console.log(`  SKIP ${cat.id}: ${err.message.slice(0, 80)}`)
      }
    }
  }

  // 2. Extract and create brands
  const brandSet = new Set()
  products.forEach(p => brandSet.add(p.brand || 'Unknown'))
  const brands = Array.from(brandSet).map(name => ({
    id: name.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, ''),
    name,
  }))

  console.log('\n--- Brands ---')
  for (const brand of brands) {
    try {
      await api('POST', '/brands', brand)
      console.log(`  OK ${brand.id} \u2192 ${brand.name}`)
    } catch (err) {
      try {
        await api('PATCH', `/brands/${brand.id}`, brand)
        console.log(`  OK ${brand.id} \u2192 updated`)
      } catch {
        console.log(`  SKIP ${brand.id}: ${err.message.slice(0, 80)}`)
      }
    }
  }

  // 3. Import products
  console.log('\n--- Products ---')
  let count = 0
  for (const p of products) {
    const brandId = p.brand?.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '') || ''
    const catName = (p.category || '').toLowerCase()
    const categoryMap = {
      'scanners': 'scanners-tpms',
    }
    const catId = categoryMap[catName] || catName.replace(/ & /g, '-').replace(/\s+/g, '-')

    const productData = {
      id: p.id,
      name: p.name,
      summary: p.summary || '',
      brand: brandId,
      category: catId,
      badge: p.badge || null,
      specs: (p.specs || []).map(s => ({ value: s })),
      features: (p.features || []).map(f => ({
        title: f.title,
        description: f.description,
      })),
      technicalTable: p.technicalTable || [],
    }

    if (p.price != null) productData.price = p.price
    if (p.description) productData.description = p.description

    try {
      await api('POST', '/products', productData)
      count++
    } catch (err) {
      try {
        await api('PATCH', `/products/${p.id}`, productData)
        count++
      } catch {
        console.log(`  SKIP ${p.id}: ${err.message.slice(0, 80)}`)
      }
    }
  }

  console.log(`\nSeed complete: ${count}/${products.length} products imported`)
}

seed().catch(err => {
  console.error('\nSeed failed:', err.message)
  process.exit(1)
})
