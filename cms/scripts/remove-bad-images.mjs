import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CMS_URL = 'http://localhost:3000'
const API_URL = `${CMS_URL}/api`
const CREDENTIALS = { email: 'admin@autodiagnostix.com', password: 'admin123!' }

async function api(method, path, body, token) {
  const url = `${API_URL}${path}`
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (!res.ok) { const t = await res.text(); throw new Error(t.slice(0, 200)) }
  return res.json()
}

async function login() {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
  })
  return (await res.json()).token
}

// Media IDs that are bad (logos, icons, banners)
const BAD_MEDIA_IDS = [5, 6, 8, 9, 12, 14, 15, 17, 18, 35, 37, 39, 40, 54, 56]

// Products with their good image IDs to keep
const PRODUCT_FIXES = {
  'vsp-828':           { keep: [4] },
  'bst-560s':          { keep: [7] },
  'bst-860s':          { keep: [10, 11] },
  'x613':              { keep: [13] },
  '3-ton-jack-lh-330': { keep: [16] },
  'cnc-605-pro-plus':  { keep: [] },
  'x861-pro':          { keep: [38] },
  'ismartvideo400':    { keep: [55] },
  'cnc-605a':          { keep: [53] },
}

async function main() {
  const token = await login()
  console.log('Logged in to CMS\n')

  // Step 1: Update products to remove bad image references
  for (const [slug, fix] of Object.entries(PRODUCT_FIXES)) {
    const heroImages = fix.keep.map(id => ({ image: id }))
    await api('PATCH', `/products/${slug}`, { heroImages }, token)
    console.log(`[${slug}] Updated heroImages (${heroImages.length} images)`)
  }

  // Step 2: Delete bad media entries
  for (const id of BAD_MEDIA_IDS) {
    try {
      await api('DELETE', `/media/${id}`, null, token)
      console.log(`[Media ${id}] Deleted`)
    } catch (e) {
      console.log(`[Media ${id}] Delete failed: ${e.message.slice(0, 60)}`)
    }
  }

  console.log('\nDone. Products now have only good images.')
  console.log('Products needing re-scrape:')
  for (const [slug, fix] of Object.entries(PRODUCT_FIXES)) {
    if (fix.keep.length < 2) {
      console.log(`  ${slug} (${fix.keep.length} image(s) - needs more)`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
