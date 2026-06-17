import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMG_DIR = resolve(__dirname, '../../app/public/images')

const CMS_URL = 'http://localhost:3000'
const API_URL = `${CMS_URL}/api`
const CREDENTIALS = { email: 'admin@autodiagnostix.com', password: 'admin123!' }

async function login() {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
  })
  return (await res.json()).token
}

async function upload(filePath, fileName, token) {
  const buf = readFileSync(filePath)
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' }
  const ext = fileName.split('.').pop().toLowerCase()
  const blob = new Blob([buf], { type: mimeMap[ext] || 'application/octet-stream' })
  const fd = new FormData()
  fd.append('file', blob, fileName)
  const res = await fetch(`${API_URL}/media`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
  })
  if (!res.ok) throw new Error(await res.text())
  const result = await res.json()
  return result.doc?.id || result.id
}

async function main() {
  const token = await login()
  console.log('Logged in')

  // Map products to existing images
  const assignments = {
    'uz30c': ['lift-scissor.webp', 'lift-showcase.webp'],
    'g68': ['wheel-balancer.webp'],
    'g55': ['wheel-balancer.webp'],
    'pl-4-2dbs': ['lift-2post.webp', 'lift-4post.webp'],
  }

  for (const [productId, imageFiles] of Object.entries(assignments)) {
    const mediaIds = []
    for (const file of imageFiles) {
      const filePath = resolve(IMG_DIR, file)
      try {
        const mid = await upload(filePath, `${productId}-${file}`, token)
        mediaIds.push(mid)
        console.log(`${productId}: Uploaded ${file} -> media ${mid}`)
      } catch (e) {
        console.log(`${productId}: Failed ${file}: ${e.message.slice(0, 100)}`)
      }
    }

    if (mediaIds.length > 0) {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ heroImages: mediaIds.map(id => ({ image: id })) }),
      })
      if (!res.ok) console.log(`${productId}: PATCH failed: ${(await res.text()).slice(0, 100)}`)
      else console.log(`${productId}: Updated with ${mediaIds.length} images`)
    }
  }

  console.log('\nDone')
}

main().catch(e => { console.error(e); process.exit(1) })
