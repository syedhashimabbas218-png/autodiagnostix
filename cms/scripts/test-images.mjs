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

async function download(url, filePath) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(filePath, buf)
  return buf
}

async function login() {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
  })
  return (await res.json()).token
}

async function upload(filePath, fileName, token) {
  const blob = new Blob([readFileSync(filePath)])
  const fd = new FormData()
  fd.append('file', blob, fileName)
  const res = await fetch(`${API_URL}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function main() {
  const token = await login()
  console.log('Logged in')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  // Test: VSP-800 on en.cnlaunch.com
  const testUrl = 'https://en.cnlaunch.com/products-detail/i-80.html'
  console.log(`\nNavigating to ${testUrl}`)
  await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForTimeout(3000)

  const images = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img')
    const results = []
    const seen = new Set()
    imgs.forEach(img => {
      let src = img.src || ''
      if (!src.startsWith('http')) src = 'https://' + window.location.host + (src.startsWith('/') ? '' : '/') + src
      if (img.naturalWidth > 100 && src && !src.includes('data:') && !seen.has(src)) {
        seen.add(src)
        results.push({ src, alt: img.alt, w: img.naturalWidth, h: img.naturalHeight })
      }
    })
    results.sort((a, b) => b.w - a.w)
    return results.slice(0, 3)
  })

  console.log(`Found ${images.length} images:`)
  for (const img of images) {
    console.log(`  ${img.w}x${img.h} - ${img.alt || '(no alt)'}`)
    console.log(`  ${img.src}`)
  }

  // Test download and upload for first image
  if (images.length > 0) {
    const img = images[0]
    const ext = (img.src.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?|$)/i) || [,'jpg'])[1].toLowerCase()
    const fileName = `test-vsp800.${ext}`
    const filePath = resolve(IMG_DIR, fileName)

    console.log(`\nDownloading ${fileName} from ${img.src}...`)
    try {
      const buf = await download(img.src, filePath)
      console.log(`Downloaded ${buf.length} bytes`)

      console.log('Uploading to CMS...')
      const result = await upload(filePath, fileName, token)
      const mediaId = result.doc?.id || result.id
      console.log(`Uploaded as media ID: ${mediaId}`)

      // Update product
      const res = await fetch(`${API_URL}/products/vsp-800`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ heroImages: [{ image: mediaId }] }),
      })
      const update = await res.json()
      console.log(`Product updated: heroImages set`)
    } catch (e) {
      console.log(`Error: ${e.message}`)
    }
  }

  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
