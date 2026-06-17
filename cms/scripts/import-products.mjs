import { JSDOM } from 'jsdom'

const CMS_URL = 'http://localhost:3000'
const API_URL = `${CMS_URL}/api`

const CREDENTIALS = {
  email: 'admin@autodiagnostix.com',
  password: 'admin123!',
}

const BRAND_BY_DOMAIN = {
  'en.cnlaunch.com': 'launch',
  'newsmartsafe.com': 'smartsafe',
  'launchx431.com.pk': 'launch',
  'uniteautomotive.com': 'unite',
  'uniteequipment.com': 'unite',
  'shop.autooltech.com': 'autool',
  'www.scanzed.co.nz': 'smartsafe',
  'scanzed.co.nz': 'smartsafe',
}

const NEW_CATEGORIES = [
  { id: 'adas-calibration-tools', name: 'ADAS Calibration Tools', tagline: 'Professional ADAS Calibration Solutions', icon: 'radar', description: 'High-quality ADAS calibration equipment for automotive workshops and service centers.' },
  { id: 'injector-cleaners-testers', name: 'Injector Cleaners & Testers', tagline: 'Professional Fuel System Solutions', icon: 'oil_barrel', description: 'Professional injector cleaning and testing equipment for automotive workshops.' },
  { id: 'videoscopes', name: 'Videoscopes', tagline: 'Professional Inspection Solutions', icon: 'videocam', description: 'High-quality videoscopes and inspection cameras for automotive diagnostics.' },
  { id: 'battery-testers', name: 'Battery Testers', tagline: 'Professional Battery Solutions', icon: 'battery_full', description: 'Professional battery testing equipment for automotive workshops.' },
  { id: 'ac-service-equipment', name: 'AC Service Equipment', tagline: 'Professional AC Solutions', icon: 'ac_unit', description: 'Professional air conditioning service equipment for automotive workshops.' },
  { id: 'spark-plug-testers', name: 'Spark Plug Testers', tagline: 'Professional Ignition Solutions', icon: 'bolt', description: 'Professional spark plug testing equipment for automotive diagnostics.' },
  { id: 'tpms-tools', name: 'TPMS Tools', tagline: 'Professional TPMS Solutions', icon: 'speed', description: 'Professional TPMS service tools for automotive workshops.' },
  { id: 'wheel-aligners', name: 'Wheel Aligners', tagline: 'Professional Alignment Solutions', icon: 'swap_horiz', description: 'High-quality wheel alignment equipment for automotive workshops.' },
  { id: 'wheel-balancers', name: 'Wheel Balancers', tagline: 'Professional Balancing Solutions', icon: 'balance', description: 'Professional wheel balancing equipment for automotive workshops.' },
  { id: 'jacks-lifts', name: 'Jacks & Lifts', tagline: 'Professional Lifting Solutions', icon: 'vertical_align_top', description: 'Professional jacks and lifting equipment for automotive workshops.' },
  { id: 'diagnostic-scanners', name: 'Diagnostic Scanners', tagline: 'Professional Diagnostic Solutions', icon: 'qr_code_scanner', description: 'Professional diagnostic scanners for automotive workshops and service centers.' },
  { id: 'car-lifts', name: 'Car Lifts', tagline: 'Professional Workshop Solutions', icon: 'garage', description: 'Professional car lifts for automotive workshops and service centers.' },
]

const PRODUCTS = [
  { url: 'https://newsmartsafe.com/adas-calibration-tools/adas-pro-v2-adas-calibration-tool', brand: 'smartsafe', category: 'adas-calibration-tools', name: 'ADAS PRO+V2' },
  { url: 'https://launchx431.com.pk/maintenance/cnc-605-pro-plus/', brand: 'launch', category: 'injector-cleaners-testers', name: 'CNC 605 PRO+' },
  { url: 'https://www.scanzed.co.nz/product-page/cnc605-gdi-injector-cleaner-tester', brand: 'smartsafe', category: 'injector-cleaners-testers', name: 'CNC 605A' },
  { url: 'https://en.cnlaunch.com/products-detail/i-80.html', brand: 'launch', category: 'videoscopes', name: 'VSP 800' },
  { url: 'https://en.cnlaunch.com/products-detail/i-266.html', brand: 'launch', category: 'videoscopes', name: 'VSP 828' },
  { url: 'https://www.scanzed.co.nz/product-page/smartsafe-ismartlink-st10-d01-with-smartlink-vci', brand: 'smartsafe', category: 'tpms-tools', name: 'ISMARTVIDEO400' },
  { url: 'https://en.cnlaunch.com/products-detail/i-77.html', brand: 'launch', category: 'battery-testers', name: 'BST 360' },
  { url: 'https://en.cnlaunch.com/products-detail/i-311.html', brand: 'launch', category: 'battery-testers', name: 'BST 560S' },
  { url: 'https://en.cnlaunch.com/products-detail/i-312.html', brand: 'launch', category: 'battery-testers', name: 'BST 860S' },
  { url: 'https://newsmartsafe.com/maintenance-service/refrigerant-recovery-equipment', brand: 'smartsafe', category: 'ac-service-equipment', name: 'AC 519+' },
  { url: 'https://newsmartsafe.com/maintenance-service/ac519-ac-service-station', brand: 'smartsafe', category: 'ac-service-equipment', name: 'AC 519' },
  { url: 'https://shop.autooltech.com/product/autool-spt360-car-spark-plug-tester-ignition-testers-automotive-diagnostic-tool-five-hole-spark-plug-flashover-analyzer-110-220v/', brand: 'autool', category: 'spark-plug-testers', name: 'AUTOOL SPT 360' },
  { url: 'https://newsmartsafe.com/tire-service/stationary-3d-wheel-aligner', brand: 'smartsafe', category: 'wheel-aligners', name: 'X861L' },
  { url: 'https://launchx431.com.pk/wheel-alignment/x861-pro-wheel-alignment-machine/', brand: 'launch', category: 'wheel-aligners', name: 'X861 PRO' },
  { url: 'https://en.cnlaunch.com/products-detail/i-318.html', brand: 'launch', category: 'wheel-aligners', name: 'X613' },
  { url: 'https://www.uniteautomotive.com/g-68-digital-wheel-balancer-with-lcd-display-precision-calibration-heavy-duty-motor-auto-positioning-quick-cycle-and-durable-design', brand: 'unite', category: 'wheel-balancers', name: 'G68' },
  { url: 'https://www.uniteautomotive.com/pro-line-wheel-balancer-ad-banner-g55-tire-balancer', brand: 'unite', category: 'wheel-balancers', name: 'G55' },
  { url: 'https://en.cnlaunch.com/products-detail/i-228.html', brand: 'launch', category: 'jacks-lifts', name: '3 TON JACK LH 330' },
  { url: 'https://en.cnlaunch.com/products-detail/i-269.html', brand: 'launch', category: 'diagnostic-scanners', name: 'CRP 919 MAX' },
  { url: 'https://en.cnlaunch.com/products-detail/i-206.html', brand: 'launch', category: 'diagnostic-scanners', name: 'PRO SE 2026 MODEL' },
  { url: 'https://en.cnlaunch.com/products-detail/i-226.html', brand: 'launch', category: 'diagnostic-scanners', name: 'PRO 3 LINK' },
  { url: 'https://en.cnlaunch.com/products-detail/i-301.html', brand: 'launch', category: 'diagnostic-scanners', name: 'PAD 9 LINK' },
  { url: 'https://en.cnlaunch.com/products-detail/i-327.html', brand: 'launch', category: 'diagnostic-scanners', name: 'CRT 511S V2' },
  { url: 'https://en.cnlaunch.com/products-detail/i-271.html', brand: 'launch', category: 'tpms-tools', name: 'I-TPMS' },
  { url: 'https://www.uniteequipment.com/pl-4-0-2de-2-post-lift-floor-cover-plate-two-post-vehicle-lift/', brand: 'unite', category: 'car-lifts', name: 'PL 4 2DBS' },
  { url: 'https://www.uniteautomotive.com/3-t-capacity-u-z30-mid-rise-scissor-lift', brand: 'unite', category: 'car-lifts', name: 'UZ30C' },
]

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

async function api(method, path, body, token) {
  const url = `${API_URL}${path}`
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
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

async function login() {
  console.log('Logging in...')
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CREDENTIALS.email, password: CREDENTIALS.password }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Login failed: ${res.status} ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  console.log('  Login OK')
  return data.token
}

async function deleteAllProducts(token) {
  console.log('\nDeleting all existing products...')
  const data = await api('GET', '/products?limit=100', null, token)
  let count = 0
  for (const p of data.docs || []) {
    try {
      await api('DELETE', `/products/${encodeURIComponent(p.id)}`, null, token)
      count++
    } catch (err) {
      console.log(`  DELETE failed for ${p.id}: ${err.message.slice(0, 80)}`)
    }
  }
  console.log(`  Deleted ${count} products`)
}

async function replaceCategories(token) {
  console.log('\nReplacing categories...')

  const data = await api('GET', '/categories?limit=50', null, token)
  for (const c of data.docs || []) {
    try {
      await api('DELETE', `/categories/${encodeURIComponent(c.id)}`, null, token)
      console.log(`  Deleted old category: ${c.id}`)
    } catch (err) {
      console.log(`  Skip delete ${c.id}: ${err.message.slice(0, 80)}`)
    }
  }

  for (const cat of NEW_CATEGORIES) {
    try {
      await api('POST', '/categories', cat, token)
      console.log(`  Created category: ${cat.id}`)
    } catch (err) {
      try {
        await api('PATCH', `/categories/${cat.id}`, cat, token)
        console.log(`  Updated category: ${cat.id}`)
      } catch (e) {
        console.log(`  SKIP category ${cat.id}: ${e.message.slice(0, 80)}`)
      }
    }
  }
}

async function ensureBrandsExist(token) {
  console.log('\nEnsuring brands exist...')

  const brandIds = new Set(PRODUCTS.map(p => p.brand))
  const data = await api('GET', '/brands?limit=50', null, token)
  const existingBrands = new Set((data.docs || []).map(b => b.id))

  const brandNames = {
    'launch': 'LAUNCH',
    'smartsafe': 'SMARTSAFE',
    'unite': 'UNITE',
    'autool': 'AUTOOL',
  }

  for (const id of brandIds) {
    if (!existingBrands.has(id)) {
      try {
        await api('POST', '/brands', { id, name: brandNames[id] || id.toUpperCase() }, token)
        console.log(`  Created brand: ${id}`)
      } catch (err) {
        console.log(`  SKIP brand ${id}: ${err.message.slice(0, 80)}`)
      }
    } else {
      console.log(`  Brand exists: ${id}`)
    }
  }
}

async function scrapeUrl(url) {
  console.log(`  Fetching: ${url}`)
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    signal: AbortSignal.timeout(30000),
  })
  const html = await res.text()
  const dom = new JSDOM(html)
  const doc = dom.window.document

  const name =
    doc.querySelector('h1')?.textContent?.trim() ||
    doc.title?.trim() ||
    ''

  const metaDesc = doc.querySelector('meta[name="description"]')
  let summary = metaDesc?.getAttribute('content')?.trim() || ''
  if (summary.length > 200) summary = summary.substring(0, 197) + '...'

  const descEl = doc.querySelector('.product-description, .description, .full-desc, [itemprop="description"], .product-info, .product-detail, .tab-content, #tab-description, .woocommerce-product-details__short-description')
  let description = ''
  if (descEl) {
    const paragraphs = descEl.querySelectorAll('p, li, h2, h3, h4')
    description = Array.from(paragraphs).map(p => p.textContent.trim()).filter(Boolean).join('\n')
    if (!description) description = descEl.textContent.trim()
  }

  if (!description) {
    const main = doc.querySelector('main, article, .main, #main, .content')
    if (main) {
      const paragraphs = main.querySelectorAll('p')
      description = Array.from(paragraphs).map(p => p.textContent.trim()).filter(t => t.length > 20).join('\n')
    }
  }

  const images = []
  const imgEls = doc.querySelectorAll('.product-gallery img, .gallery img, .woocommerce-product-gallery img, .product-image img, .main-image img, [data-image] img, .product-photo img')
  const seenUrls = new Set()
  imgEls.forEach(img => {
    let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || ''
    if (src && !src.startsWith('data:') && !seenUrls.has(src)) {
      if (src.startsWith('/')) {
        const u = new URL(url)
        src = `${u.protocol}//${u.host}${src}`
      }
      seenUrls.add(src)
      images.push(src)
    }
  })

  if (images.length === 0) {
    doc.querySelectorAll('img').forEach(img => {
      let src = img.getAttribute('src') || ''
      if (src && !src.startsWith('data:') && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar') && !seenUrls.has(src)) {
        if (src.startsWith('/')) {
          const u = new URL(url)
          src = `${u.protocol}//${u.host}${src}`
        }
        seenUrls.add(src)
        images.push(src)
      }
    })
  }

  const features = []
  const featureEls = doc.querySelectorAll('.features li, .benefits li, .product-features li, .key-features li, .feature-list li, ul.checklist li, ul.benefits li')
  featureEls.forEach(li => {
    const text = li.textContent.trim()
    if (text && text.length > 5 && text.length < 200) {
      features.push(text)
    }
  })

  const technicalTable = []
  const tables = doc.querySelectorAll('.specifications table, .specs table, .technical-specs table, .product-specs table, table.shop_attributes, .woocommerce-product-attributes table')
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr')
    rows.forEach(row => {
      const cells = row.querySelectorAll('th, td')
      if (cells.length >= 2) {
        const label = cells[0].textContent.trim()
        const value = cells[1].textContent.trim()
        if (label && value) {
          technicalTable.push({ label, value })
        }
      }
    })
  })

  const specEls = doc.querySelectorAll('.specs li, .specifications li, .product-specs li, ul.specs li')
  const specs = []
  specEls.forEach(li => {
    const text = li.textContent.trim()
    if (text && text.length > 3) specs.push(text)
  })

  const domain = new URL(url).hostname.replace(/^www\./, '')
  const brandId = BRAND_BY_DOMAIN[domain] || ''

  return {
    name,
    summary,
    description,
    images: images.slice(0, 5),
    features: features.slice(0, 10),
    technicalTable: technicalTable.slice(0, 15),
    specs: specs.slice(0, 15),
    brandId,
    url,
  }
}

async function createProduct(token, productMeta, scraped) {
  const id = slugify(productMeta.name)

  const productData = {
    id,
    name: scraped.name || productMeta.name,
    summary: scraped.summary || '',
    description: scraped.description || '',
    brand: productMeta.brand,
    category: productMeta.category,
    specs: scraped.specs.map(s => ({ value: s })),
    features: scraped.features.map(f => ({
      title: f.length > 60 ? f.substring(0, 57) + '...' : f,
      description: f,
    })),
    technicalTable: scraped.technicalTable,
  }

  try {
    await api('POST', '/products', productData, token)
    return true
  } catch (err) {
    try {
      await api('PATCH', `/products/${id}`, productData, token)
      return true
    } catch (err2) {
      console.log(`    FAILED: ${err2.message.slice(0, 120)}`)
      return false
    }
  }
}

async function main() {
  console.log('=== AutoDiagnostix Product Import Script ===\n')

  const token = await login()

  await deleteAllProducts(token)
  await ensureBrandsExist(token)
  await replaceCategories(token)

  console.log(`\n=== Scraping ${PRODUCTS.length} products ===\n`)

  let success = 0
  let failed = 0

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i]
    console.log(`\n[${i + 1}/${PRODUCTS.length}] ${p.name}`)
    console.log(`  URL: ${p.url}`)
    console.log(`  Brand: ${p.brand}, Category: ${p.category}`)

    try {
      const scraped = await scrapeUrl(p.url)
      const ok = await createProduct(token, p, scraped)
      if (ok) {
        console.log(`  \u2713 Created (slug: ${slugify(p.name)})`)
        success++
      } else {
        console.log(`  \u2717 Failed to create`)
        failed++
      }
    } catch (err) {
      console.log(`  \u2717 Error: ${err.message.slice(0, 150)}`)
      failed++
    }
  }

  console.log(`\n=== Import Complete ===`)
  console.log(`  Success: ${success}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Total: ${PRODUCTS.length}`)
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})

// Fix: AC 519+ slug collision - update it to ac-519-plus
// Fix: CNC 605 PRO+ slug - was cnc-605-pro, should be more specific

async function fixProducts(token) {
  console.log('\n=== Fixing slug collisions ===')

  // AC 519+ was stored as ac-519, overwriting AC 519. Recreate both properly.
  // First delete the wrong ac-519 (which had AC 519+ data)
  try {
    await api('DELETE', '/products/ac-519', null, token)
    console.log('  Deleted wrong ac-519 product')
  } catch (e) {
    console.log('  No ac-519 to delete (or already fixed)')
  }

  // Create AC 519+ with proper slug
  try {
    await api('POST', '/products', {
      id: 'ac-519-plus',
      name: 'AC 519+',
      summary: 'AC 519+ is a fully automatic intelligent automobile air-conditioning maintenance equipment suitable for fuel vehicles, pure electric vehicles and hybrid vehicles.',
      description: 'AC519+ is a fully automatic intelligent automobile air-conditioning maintenance equipment suitable for fuel vehicles, pure electric vehicles and hybrid vehicles. Integrates functions such as disassembly-free cleaning, refrigerant recovery, filling, vacuuming. Equipped with automobile refrigerant model database, supports R134A or R1234YF refrigerants. Features 128L/min dual-stage vacuum capacity, 10.1-inch touch screen display, and automatic mode one-click operation.',
      brand: 'smartsafe',
      category: 'ac-service-equipment',
      specs: [{ value: 'Fully automatic intelligent AC maintenance' }, { value: 'Suitable for fuel, EV, and hybrid vehicles' }, { value: 'Supports R134A and R1234YF' }, { value: '128L/min dual-stage vacuum pump' }, { value: '10.1-inch touch screen' }, { value: 'Automatic one-click operation' }],
      features: [
        { title: 'Auto Database', description: 'Equipped with automobile refrigerant model database, updated free of charge' },
        { title: 'Dual Refrigerant Support', description: 'Supports two refrigerants: R134A or R1234YF' },
        { title: 'High Efficiency', description: '128L/min dual-stage vacuum capacity, significantly boosts work efficiency' },
      ],
      technicalTable: [
        { label: 'Power Supply', value: 'AC110V/AC220V 50Hz/60Hz' },
        { label: 'Power', value: '1000W' },
        { label: 'Working Environment Temperature', value: '10~50\u2103' },
        { label: 'Display', value: '10.1-inch touch screen' },
        { label: 'Vacuum Pump Capacity', value: 'Dual-stage 128L/min' },
        { label: 'Working Tank Capacity', value: '22kg' },
        { label: 'Product Size', value: '1135mm(H)\u00d7660mm(D)\u00d7530mm(W)' },
      ],
    }, token)
    console.log('  Created AC 519+ (ac-519-plus)')
  } catch (e) {
    console.log(`  SKIP AC 519+: ${e.message.slice(0, 80)}`)
  }

  // Create AC 519 with proper slug
  try {
    await api('POST', '/products', {
      id: 'ac-519',
      name: 'AC 519',
      summary: 'AC519 is a fully automatic intelligent automobile air conditioning maintenance equipment that integrates functions such as disassembly-free cleaning, refrigerant recovery, filling, and vacuuming.',
      description: 'AC519 is a fully automatic intelligent automobile air conditioning maintenance equipment that integrates functions such as disassembly-free cleaning, refrigerant recovery, filling, and vacuuming. Equipped with automobile refrigerant model database, supports R134A or R1234YF refrigerants. Automatic mode one-key operation.',
      brand: 'smartsafe',
      category: 'ac-service-equipment',
      specs: [{ value: 'Equipped with automobile refrigerant model database' }, { value: 'Supports R134A or R1234YF' }, { value: 'Automatic mode one-click operation' }],
      features: [
        { title: 'Auto Database', description: 'Equipped with automobile refrigerant model database, no manual setting is required' },
        { title: 'Dual Refrigerant Support', description: 'Supports two refrigerants: R134A or R1234YF' },
      ],
      technicalTable: [
        { label: 'Power Supply', value: 'AC110V/AC220V 50Hz/60Hz' },
        { label: 'Recycling Capacity', value: 'Gaseous: 400g/min, Liquid: 700g/min' },
        { label: 'Main Engine Power', value: '700W' },
      ],
    }, token)
    console.log('  Created AC 519 (ac-519)')
  } catch (e) {
    console.log(`  SKIP AC 519: ${e.message.slice(0, 80)}`)
  }

  // Fix CNC 605 PRO+ slug
  try {
    await api('DELETE', '/products/cnc-605-pro', null, token)
    console.log('  Deleted wrong cnc-605-pro product')
  } catch (e) {
    console.log('  No cnc-605-pro to delete')
  }

  try {
    await api('POST', '/products', {
      id: 'cnc-605-pro-plus',
      name: 'CNC 605 PRO+',
      summary: 'CNC605+ is a cleaning and testing equipment suitable for piezoelectric (140V), GDI (65V/12V) and conventional fuel injectors.',
      description: 'SmartSafe CNC 605 PRO PLUS is a cleaning and testing equipment suitable for piezoelectric (140V), GDI (65V/12V) and conventional fuel injectors. It uses ultrasonic cleaning technology combined with microprocessor oil pressure control technology to simulate various engine working conditions and clean and test automobile fuel injectors.',
      brand: 'launch',
      category: 'injector-cleaners-testers',
      specs: [
        { value: 'Working mode selection: EFI (12V), GDI (65V) or PIEZO (140V)' },
        { value: 'Ultrasonic cleaning of multiple injectors simultaneously' },
        { value: 'Low resistance testing with short circuit and open circuit detection' },
        { value: 'Uniformity/Spray testing with background light observation' },
        { value: 'Sealing test for leakage detection' },
        { value: 'Fuel injection quantity detection' },
        { value: 'Automatic cleaning and testing function' },
        { value: 'Reverse flush function for internal contaminants' },
        { value: 'Non-dismantle cleaning with various adapters' },
      ],
      features: [
        { title: 'Multi-Mode Operation', description: 'Can select EFI (12V), GDI (65V) or PIEZO (140V) operating mode based on the injector type' },
        { title: 'Ultrasonic Cleaning', description: 'Capable of simultaneously ultrasonic cleaning multiple injectors, effectively removing carbon buildup' },
        { title: 'Comprehensive Testing', description: 'Includes low resistance testing, uniformity/spray testing, sealing test, and fuel injection quantity detection' },
      ],
      technicalTable: [
        { label: 'Host Power Supply', value: 'AC110V/AC220V 50Hz/60Hz' },
        { label: 'Simulation Speed Range', value: '100~9900rpm Step length 10rpm' },
        { label: 'Host Power', value: '500W' },
        { label: 'Pulse Width', value: '0.1-25ms, step length: 0.1ms' },
        { label: 'Fuel Tank Capacity', value: '2500 ml' },
        { label: 'Resistance Test Accuracy', value: '1%' },
        { label: 'Ultrasonic Cleaning Power', value: '100W' },
        { label: 'Resistance Test Range', value: '0-100\u03a9' },
        { label: 'Working Pressure', value: '0.1-9bar' },
        { label: 'Host Size', value: '412\u00d7398\u00d7550mm' },
      ],
    }, token)
    console.log('  Created CNC 605 PRO+ (cnc-605-pro-plus)')
  } catch (e) {
    console.log(`  SKIP CNC 605 PRO+: ${e.message.slice(0, 80)}`)
  }

  // Try PL 4 2DBS again
  console.log('\n=== Retrying PL 4 2DBS ===')
  try {
    const res = await fetch('https://www.uniteequipment.com/pl-4-0-2de-2-post-lift-floor-cover-plate-two-post-vehicle-lift/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    })
    console.log(`  HTTP ${res.status}`)
    const html = await res.text()
    const dom = new JSDOM(html)
    const doc = dom.window.document

    await api('POST', '/products', {
      id: 'pl-4-2dbs',
      name: 'PL 4 2DBS',
      summary: '4 Ton 2 Post Clearfloor Lift by UNITE',
      description: doc.querySelector('h1')?.textContent?.trim() || doc.title?.trim() || 'PL 4 2DBS 4 Ton 2 Post Clearfloor Lift',
      brand: 'unite',
      category: 'car-lifts',
    }, token)
    console.log('  Created PL 4 2DBS (pl-4-2dbs)')
  } catch (err) {
    // Fallback with minimal data
    try {
      await api('POST', '/products', {
        id: 'pl-4-2dbs',
        name: 'PL 4 2DBS',
        summary: '4 Ton 2 Post Clearfloor Lift by UNITE',
        description: 'The PL 4 2DBS is a 4 Ton 2 Post Clearfloor Lift designed for automotive workshops. Features include floor cover plate design for easy installation, durable construction, and reliable performance.',
        brand: 'unite',
        category: 'car-lifts',
        technicalTable: [
          { label: 'Capacity', value: '4 Ton' },
          { label: 'Type', value: '2 Post Clearfloor' },
        ],
      }, token)
      console.log('  Created PL 4 2DBS (fallback data)')
    } catch (e) {
      console.log(`  SKIP PL 4 2DBS: ${e.message.slice(0, 80)}`)
    }
  }
}

async function fixMain() {
  console.log('=== Fix Script ===')
  const token = await login()
  await fixProducts(token)
  console.log('\n=== Fix Complete ===')
}

fixMain().catch(err => {
  console.error('Fix error:', err.message)
  process.exit(1)
})
