import { chromium } from 'playwright'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMG_DIR = resolve(__dirname, '../product-images')
if (!existsSync(IMG_DIR)) mkdirSync(IMG_DIR, { recursive: true })

const CMS_URL = 'http://localhost:3000'
const API_URL = `${CMS_URL}/api`

const CREDENTIALS = { email: 'admin@autodiagnostix.com', password: 'admin123!' }

const PRODUCTS = [
  { id: 'vsp-800', url: 'https://en.cnlaunch.com/products-detail/i-80.html' },
  { id: 'vsp-828', url: 'https://en.cnlaunch.com/products-detail/i-266.html' },
  { id: 'bst-360', url: 'https://en.cnlaunch.com/products-detail/i-77.html' },
  { id: 'bst-560s', url: 'https://en.cnlaunch.com/products-detail/i-311.html' },
  { id: 'bst-860s', url: 'https://en.cnlaunch.com/products-detail/i-312.html' },
  { id: 'x613', url: 'https://en.cnlaunch.com/products-detail/i-318.html' },
  { id: '3-ton-jack-lh-330', url: 'https://en.cnlaunch.com/products-detail/i-228.html' },
  { id: 'crp-919-max', url: 'https://en.cnlaunch.com/products-detail/i-269.html' },
  { id: 'pro-se-2026-model', url: 'https://en.cnlaunch.com/products-detail/i-206.html' },
  { id: 'pro-3-link', url: 'https://en.cnlaunch.com/products-detail/i-226.html' },
  { id: 'pad-9-link', url: 'https://en.cnlaunch.com/products-detail/i-301.html' },
  { id: 'crt-511s-v2', url: 'https://en.cnlaunch.com/products-detail/i-327.html' },
  { id: 'i-tpms', url: 'https://en.cnlaunch.com/products-detail/i-271.html' },
  { id: 'cnc-605-pro-plus', url: 'https://launchx431.com.pk/maintenance/cnc-605-pro-plus/' },
  { id: 'x861-pro', url: 'https://launchx431.com.pk/wheel-alignment/x861-pro-wheel-alignment-machine/' },
  { id: 'adas-prov2', url: 'https://newsmartsafe.com/adas-calibration-tools/adas-pro-v2-adas-calibration-tool' },
  { id: 'ac-519-plus', url: 'https://newsmartsafe.com/maintenance-service/refrigerant-recovery-equipment' },
  { id: 'ac-519', url: 'https://newsmartsafe.com/maintenance-service/ac519-ac-service-station' },
  { id: 'x861l', url: 'https://newsmartsafe.com/tire-service/stationary-3d-wheel-aligner' },
  { id: 'cnc-605a', url: 'https://www.scanzed.co.nz/product-page/cnc605-gdi-injector-cleaner-tester' },
  { id: 'ismartvideo400', url: 'https://www.scanzed.co.nz/product-page/smartsafe-ismartlink-st10-d01-with-smartlink-vci' },
  { id: 'autool-spt-360', url: 'https://shop.autooltech.com/product/autool-spt360-car-spark-plug-tester-ignition-testers-automotive-diagnostic-tool-five-hole-spark-plug-flashover-analyzer-110-220v/' },
  { id: 'uz30c', url: 'https://www.uniteautomotive.com/3-t-capacity-u-z30-mid-rise-scissor-lift' },
  { id: 'g68', url: 'https://www.uniteautomotive.com/g-68-digital-wheel-balancer-with-lcd-display-precision-calibration-heavy-duty-motor-auto-positioning-quick-cycle-and-durable-design' },
  { id: 'g55', url: 'https://www.uniteautomotive.com/pro-line-wheel-balancer-ad-banner-g55-tire-balancer' },
  { id: 'pl-4-2dbs', url: 'https://www.uniteequipment.com/pl-4-0-2de-2-post-lift-floor-cover-plate-two-post-vehicle-lift/' },
]

function getExt(url) {
  const m = url.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?|$)/i)
  return m ? m[1].toLowerCase() : 'jpg'
}

function getFileName(id, idx, imgUrl) {
  const ext = getExt(imgUrl)
  return `${id}-${idx}.${ext}`
}

async function downloadImage(url, filePath) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(filePath, buf)
  return buf
}

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

async function uploadImage(filePath, fileName, token) {
  const fs = await import('fs')
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' }
  const ext = fileName.split('.').pop().toLowerCase()
  const mimeType = mimeMap[ext] || 'application/octet-stream'
  const blob = new Blob([fs.readFileSync(filePath)], { type: mimeType })
  const formData = new FormData()
  formData.append('file', blob, fileName)
  const res = await fetch(`${API_URL}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) { const t = await res.text(); throw new Error(t.slice(0, 200)) }
  return res.json()
}

function getSiteSelectors(url) {
  if (url.includes('en.cnlaunch.com')) {
    return ['.i-pic img', '.product-main-pic img', '.bigpic img']
  }
  if (url.includes('shop.autooltech.com')) {
    return ['.woocommerce-product-gallery img']
  }
  if (url.includes('scanzed.co.nz')) {
    return ['.tLH_hT img']
  }
  if (url.includes('newsmartsafe.com')) {
    return ['.detBan-img img']
  }
  if (url.includes('launchx431.com.pk')) {
    return ['.swiper-slide img', '.wp-post-image', '[class*=gallery] img', '[class*=slide] img']
  }
  if (url.includes('uniteequipment.com')) {
    return ['.product-gallery img', '.woocommerce-product-gallery img', '[class*=gallery] img', '[class*=swiper] img']
  }
  return []
}

async function main() {
  console.log('Launching browser...')
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })

  const token = await login()
  console.log('Logged in to CMS\n')

  const imageMap = {}

  for (const p of PRODUCTS) {
    const page = await ctx.newPage()
    const productImages = []
    
    try {
      console.log(`[${p.id}] Navigating to ${p.url}`)
      await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {})
      await page.waitForTimeout(4000)

      const title = await page.title()
      if (title.includes('Just a moment') || title.includes('Cloudflare')) {
        console.log(`[${p.id}] Blocked by Cloudflare`)
        await page.close()
        imageMap[p.id] = []
        continue
      }

      const selectors = getSiteSelectors(p.url)
      if (selectors.length === 0) {
        console.log(`[${p.id}] No site-specific selectors, skipping`)
        await page.close()
        imageMap[p.id] = []
        continue
      }

      const images = await page.evaluate(({ selectors }) => {
        const results = []
        const seen = new Set()
        selectors.forEach(sel => {
          document.querySelectorAll(sel).forEach(el => {
            const src = el.src || el.getAttribute('data-src') || el.getAttribute('src') || ''
            if (src && !src.includes('data:') && !seen.has(src)) {
              seen.add(src)
              results.push({ src, alt: el.alt || '', w: el.naturalWidth, h: el.naturalHeight })
            }
          })
        })
        return results
      }, { selectors })

      console.log(`[${p.id}] Found ${images.length} images via selectors`)

      if (images.length === 0) {
        console.log(`[${p.id}] No images found via selectors, skipping`)
        await page.close()
        imageMap[p.id] = []
        continue
      }

      for (let i = 0; i < Math.min(images.length, 5); i++) {
        const img = images[i]
        const fileName = getFileName(p.id, i + 1, img.src)
        const filePath = resolve(IMG_DIR, fileName)
        try {
          const buf = await downloadImage(img.src, filePath)
          console.log(`  [${p.id}] Downloaded ${fileName} (${buf.length} bytes)`)
          const uploaded = await uploadImage(filePath, fileName, token)
          const mediaId = uploaded.doc?.id || uploaded.id
          productImages.push(mediaId)
          console.log(`  [${p.id}] Uploaded as media ID ${mediaId}`)
        } catch (e) {
          console.log(`  [${p.id}] Failed: ${e.message.slice(0, 100)}`)
        }
      }
    } catch (e) {
      console.log(`[${p.id}] Error: ${e.message.slice(0, 80)}`)
    }

    await page.close()

    if (productImages.length > 0) {
      try {
        await api('PATCH', `/products/${p.id}`, {
          heroImages: productImages.map(id => ({ image: id })),
        }, token)
        console.log(`[${p.id}] Updated heroImages\n`)
      } catch (e) {
        console.log(`[${p.id}] Failed to update: ${e.message.slice(0, 60)}\n`)
      }
    }
    
    imageMap[p.id] = productImages
  }

  await browser.close()
  console.log('\n=== Summary ===')
  let withImages = 0
  for (const [id, imgs] of Object.entries(imageMap)) {
    const status = imgs.length > 0 ? `OK (${imgs.length} img)` : 'NO IMAGE'
    if (imgs.length > 0) withImages++
    console.log(`  ${id.padEnd(20)} ${status}`)
  }
  console.log(`\n${withImages}/26 products have images`)
}

main().catch(e => { console.error(e); process.exit(1) })
