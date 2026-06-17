import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '../../api/data')

const CMS_URL = 'http://localhost:3000'
const API_URL = `${CMS_URL}/api`

const CREDENTIALS = {
  email: 'admin@autodiagnostix.com',
  password: 'admin123!',
}

const SLUG_MAP = {
  'vsp-800': 'vsp-800',
  'vsp-828': 'vsp-828',
  'bst-360': 'bst360',
  'bst-560s': 'bst-560s',
  'bst-860s': 'bst-860s',
  'crp-919-max': 'crp-919-max',
  'crt-511s-v2': 'creader-tpms-511s-v2',
  'pad-9-link': 'x-431-pad9-link',
  '3-ton-jack-lh-330': 'lh-330-340',
  'pro-se-2026-model': 'x-431-pro-se-2026',
  'pro-3-link': 'x-431-pro3-link',
  'x613': 'x-613',
  'i-tpms': 'i-tpms',
  'adas-prov2': 'adas-pro-plus-v2',
}

async function api(method, path, body, token) {
  const url = `${API_URL}${path}`
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (!res.ok) { const t = await res.text(); throw new Error(`${method} ${url} \u2192 ${res.status}: ${t.slice(0, 200)}`) }
  return res.json()
}

async function login() {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
  })
  const data = await res.json()
  return data.token
}

async function main() {
  const token = await login()
  console.log('Logged in')

  // Load old products data
  const oldProducts = JSON.parse(readFileSync(resolve(DATA_DIR, 'products.json'), 'utf-8'))
  const oldBySlug = {}
  for (const p of oldProducts) {
    oldBySlug[p.id] = p
  }

  console.log(`Loaded ${oldProducts.length} old products\n`)

  // Enrich matching products
  let enriched = 0
  for (const [newSlug, oldSlug] of Object.entries(SLUG_MAP)) {
    const old = oldBySlug[oldSlug]
    if (!old) {
      console.log(`  SKIP ${newSlug}: no old data for ${oldSlug}`)
      continue
    }

    const patch = {}
    if (old.description) patch.description = old.description
    if (old.summary) patch.summary = old.summary
    if (old.specs && old.specs.length) patch.specs = old.specs.map(s => ({ value: typeof s === 'string' ? s : s.value || '' }))
    if (old.features && old.features.length) patch.features = old.features.map(f => ({ title: f.title, description: f.description }))
    if (old.technicalTable && old.technicalTable.length) patch.technicalTable = old.technicalTable

    try {
      await api('PATCH', `/products/${newSlug}`, patch, token)
      console.log(`  Enriched ${newSlug} (from ${oldSlug})`)
      enriched++
    } catch (e) {
      console.log(`  FAIL ${newSlug}: ${e.message.slice(0, 80)}`)
    }
  }

  console.log(`\nEnriched ${enriched} products from old data`)

  // Create manual data for products without old matches
  console.log('\n--- Creating manual entries ---')

  // X861L (WA861 LITE)
  try {
    await api('PATCH', '/products/x861l', {
      name: 'X861L',
      summary: 'SMARTSAFE WA861 LITE is a stationary 3D wheel aligner using 3D imaging for high-precision tire data.',
      description: 'SMARTSAFE WA861 LITE uses 3D imaging principle to collect ultra-high-speed and high-precision tire data of vehicles. Classic stationary 3D wheel aligner with 50000+ vehicle database and 10-15cm rolling compensation.',
      specs: [{ value: '50000+ global vehicle model database, lifetime free upgrade' }, { value: '10-15cm rolling compensation' }, { value: 'Classic stationary design' }, { value: 'High-precision 3D measurement' }],
      features: [{ title: 'Extensive Database', description: '50000+ global vehicle model database, lifetime free upgrade' }, { title: 'Rolling Compensation', description: '10-15cm rolling compensation, saving time and effort' }],
      technicalTable: [{ label: 'Display Accuracy', value: "1'/0.01/0.1mm" }, { label: 'Toe', value: "\u00b12'" }, { label: 'Camber', value: "\u00b12'" }, { label: 'Caster', value: "\u00b14'" }],
    }, token)
    console.log('  Enriched X861L')
  } catch (e) {}

  // X861 PRO
  try {
    await api('PATCH', '/products/x861-pro', {
      name: 'X861 PRO',
      summary: 'Launch/SmartSafe X861 PRO is an Ultra HD 4-wheel alignment machine with adaptive tracking.',
      description: 'SMARTSAFE WA861 PRO is an Ultra HD 4-wheel alignment machine. Automatically adjusts beam height according to target height. Features 5MP industrial camera, 50000+ vehicle database, and adaptive tracking system.',
      specs: [{ value: '50000+ global vehicle model database' }, { value: '5MP industrial camera' }, { value: '8-12cm rolling compensation' }, { value: 'Adaptive tracking system' }, { value: 'Movable for multi-station sharing' }, { value: 'Four-wheel alignment with standard and quick modes' }],
      features: [{ title: 'Extensive Database', description: '50000+ global vehicle model database, lifetime free upgrade' }, { title: 'Ultra HD Camera', description: '5MP industrial camera, adapts to various lighting environments' }, { title: 'Adaptive Tracking', description: 'Automatically tracks target and adjusts beam height' }],
      technicalTable: [{ label: 'Display Accuracy', value: "1'/0.01/0.1mm" }, { label: 'Toe', value: "\u00b12'" }, { label: 'Camber', value: "\u00b12'" }, { label: 'Caster', value: "\u00b14'" }, { label: 'Kingpin Inclination', value: "\u00b16'" }, { label: 'Trust Angle', value: "\u00b12'" }],
    }, token)
    console.log('  Enriched X861 PRO')
  } catch (e) {}

  // ISMARTVIDEO400
  try {
    await api('PATCH', '/products/ismartvideo400', {
      name: 'ISMARTVIDEO400',
      summary: 'SmartSafe iSmartVideo400 is a professional videoscope for TPMS and vehicle inspections.',
      description: 'SmartSafe iSmartVideo400 is a professional-grade videoscope designed for TPMS diagnostics and vehicle inspections. Features high-definition imaging, flexible probe, and comprehensive inspection capabilities.',
    }, token)
    console.log('  Enriched ISMARTVIDEO400')
  } catch (e) {}

  // CNC 605A
  try {
    await api('PATCH', '/products/cnc-605a', {
      name: 'CNC 605A',
      summary: 'CNC605A is a GDI injector cleaner and tester for automotive fuel system maintenance.',
      description: 'The CNC605A is a GDI injector cleaner and tester designed for cleaning and testing gasoline direct injection fuel injectors. Features ultrasonic cleaning technology and comprehensive testing functions.',
    }, token)
    console.log('  Enriched CNC 605A')
  } catch (e) {}

  // Autool SPT 360
  try {
    await api('PATCH', '/products/autool-spt-360', {
      name: 'AUTOOL SPT 360',
      summary: 'AUTOOL SPT360 is a car spark plug tester for ignition system diagnostics.',
      description: 'The AUTOOL SPT360 Car Spark Plug Tester is an automotive diagnostic tool featuring five-hole spark plug flashover analysis. Works with 110-220V power supply for professional ignition testing.',
    }, token)
    console.log('  Enriched AUTOOL SPT 360')
  } catch (e) {}

  // ADAS PRO+V2 name fix
  try {
    await api('PATCH', '/products/adas-prov2', {
      name: 'ADAS PRO+V2',
      summary: 'ADAS PRO+ V2 is a professional-grade passenger car ADAS calibration device with 75-inch 4K display.',
      description: 'ADAS PRO+ V2 is a professional-grade passenger car ADAS calibration device equipped with a 75-inch high-definition LCD screen and digital display of front camera targets. Supports more than 30 front camera targets.',
      specs: [{ value: '75-inch high-definition LCD screen with 4K resolution' }, { value: 'Digital display of front camera targets' }, { value: 'Supports more than 30 front camera targets' }],
      features: [{ title: 'Digital Target Display', description: 'Digital display of front camera targets, eliminates installation steps for target head' }, { title: '75-inch 4K Display', description: 'Equipped with a 75-inch high-definition LCD screen, 4K resolution' }],
      technicalTable: [{ label: 'Display', value: '75-inch HD LCD, 4K resolution' }],
    }, token)
    console.log('  Fixed ADAS PRO+V2 name')
  } catch (e) {}

  console.log('\nEnrichment complete')
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
