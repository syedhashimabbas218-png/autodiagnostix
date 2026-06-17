import { chromium } from 'playwright'
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMG_DIR = resolve(__dirname, '../product-images')
if (!existsSync(IMG_DIR)) mkdirSync(IMG_DIR, { recursive: true })

const CMS_URL = 'http://localhost:3000'
const API_URL = `${CMS_URL}/api`
const CREDENTIALS = { email: 'admin@autodiagnostix.com', password: 'admin123!' }

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (!res.ok) { const t = await res.text(); throw new Error(t.slice(0, 200)) }
  return res.json()
}

async function login() {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
  })
  return (await res.json()).token
}

async function downloadAndUpload(url, filePath, fileName, token) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(filePath, buf)
  
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' }
  const ext = fileName.split('.').pop().toLowerCase()
  const blob = new Blob([buf], { type: mimeMap[ext] || 'application/octet-stream' })
  const fd = new FormData()
  fd.append('file', blob, fileName)
  const res2 = await fetch(`${API_URL}/media`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
  })
  if (!res2.ok) throw new Error(await res2.text())
  const result = await res2.json()
  return result.doc?.id || result.id
}

async function main() {
  const token = await login()
  console.log('Logged in')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  // 1. Retry bst-360
  console.log('\n=== Retry bst-360 ===')
  try {
    await page.goto('https://en.cnlaunch.com/products-detail/i-77.html', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(4000)
    await page.waitForFunction(() => document.title !== '' && !document.title.startsWith('Loading'), { timeout: 5000 }).catch(() => {})
    
    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img')
      const results = []; const seen = new Set()
      imgs.forEach(img => {
        let src = img.src || ''
        if (!src.startsWith('http')) src = 'https://' + window.location.host + (src.startsWith('/') ? '' : '/') + src
        if (img.naturalWidth > 100 && src && !src.includes('data:') && !seen.has(src)) {
          seen.add(src); results.push({ src, alt: img.alt, w: img.naturalWidth, h: img.naturalHeight })
        }
      })
      results.sort((a, b) => b.w - a.w)
      return results.slice(0, 3)
    })
    
    console.log(`Found ${images.length} images`)
    const mediaIds = []
    for (let i = 0; i < images.length; i++) {
      const ext = (images[i].src.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?|$)/i) || [,'jpg'])[1].toLowerCase()
      const fileName = `bst-360-${i+1}.${ext}`
      const filePath = resolve(IMG_DIR, fileName)
      const mid = await downloadAndUpload(images[i].src, filePath, fileName, token)
      mediaIds.push(mid)
      console.log(`Uploaded image ${i+1} as media ID ${mid}`)
    }
    if (mediaIds.length > 0) {
      await api('PATCH', '/products/bst-360', { heroImages: mediaIds.map(id => ({ image: id })) }, token)
      console.log('bst-360 updated')
    }
  } catch (e) {
    console.log(`bst-360 failed: ${e.message.slice(0, 100)}`)
  }

  // 2. For UNITE products (Cloudflare blocked), use Freepik/Unsplash or placeholder
  // Let's try to find images for these products through Google Images or other sources
  // UZ30C - mid-rise scissor lift
  // G68 - wheel balancer  
  // G55 - wheel balancer
  // PL 4 2DBS - 2 post lift

  // Let me try searching for these product images via the web
  const searchQueries = [
    { id: 'uz30c', query: 'UNITE UZ30C mid-rise scissor lift automotive' },
    { id: 'g68', query: 'UNITE G68 digital wheel balancer' },
    { id: 'g55', query: 'UNITE G55 pro line wheel balancer' },
    { id: 'pl-4-2dbs', query: 'UNITE PL-4 2DBS two post lift vehicle lift' },
  ]

  for (const sq of searchQueries) {
    console.log(`\n=== Searching for ${sq.id} ===`)
    try {
      const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(sq.query)}`
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
      await page.waitForTimeout(3000)

      const images = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img')
        const results = []; const seen = new Set()
        imgs.forEach(img => {
          let src = img.src || ''
          if (img.naturalWidth > 150 && src && !src.includes('data:') && !src.includes('google') && !src.includes('gstatic') && !seen.has(src)) {
            seen.add(src); results.push({ src, w: img.naturalWidth, h: img.naturalHeight })
          }
        })
        results.sort((a, b) => b.w - a.w)
        return results.slice(0, 2)
      })
      
      console.log(`Found ${images.length} images via search`)
      const mediaIds = []
      for (let i = 0; i < images.length; i++) {
        const ext = (images[i].src.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?|$)/i) || [,'jpg'])[1].toLowerCase()
        const fileName = `${sq.id}-${i+1}.${ext}`
        const filePath = resolve(IMG_DIR, fileName)
        try {
          const mid = await downloadAndUpload(images[i].src, filePath, fileName, token)
          mediaIds.push(mid)
          console.log(`Uploaded image ${i+1} as media ID ${mid}`)
        } catch (e2) {
          console.log(`Failed image ${i+1}: ${e2.message.slice(0, 80)}`)
        }
      }
      if (mediaIds.length > 0) {
        await api('PATCH', `/products/${sq.id}`, { heroImages: mediaIds.map(id => ({ image: id })) }, token)
        console.log(`${sq.id} updated`)
      }
    } catch (e) {
      console.log(`${sq.id} failed: ${e.message.slice(0, 100)}`)
    }
  }

  await browser.close()
  console.log('\nDone')
}

main().catch(e => { console.error(e); process.exit(1) })
