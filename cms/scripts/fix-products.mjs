import { JSDOM } from 'jsdom'

const CMS_URL = 'http://localhost:3000'
const API_URL = `${CMS_URL}/api`

const CREDENTIALS = {
  email: 'admin@autodiagnostix.com',
  password: 'admin123!',
}

async function api(method, path, body, token) {
  const url = `${API_URL}${path}`
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${url} \u2192 ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json()
}

async function login() {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CREDENTIALS.email, password: CREDENTIALS.password }),
  })
  if (!res.ok) throw new Error('Login failed')
  const data = await res.json()
  console.log('Logged in')
  return data.token
}

async function fix() {
  const token = await login()

  // Delete wrong ac-519 (had AC 519+ data)
  try { await api('DELETE', '/products/ac-519', null, token); console.log('Deleted wrong ac-519') } catch (e) {}

  // Delete wrong cnc-605-pro
  try { await api('DELETE', '/products/cnc-605-pro', null, token); console.log('Deleted wrong cnc-605-pro') } catch (e) {}

  // Create AC 519+
  try {
    await api('POST', '/products', {
      id: 'ac-519-plus',
      name: 'AC 519+',
      summary: 'AC 519+ is a fully automatic intelligent automobile air-conditioning maintenance equipment for fuel, EV, and hybrid vehicles.',
      description: 'AC519+ is a fully automatic intelligent automobile air-conditioning maintenance equipment suitable for fuel vehicles, pure electric vehicles and hybrid vehicles. Integrates functions such as disassembly-free cleaning, refrigerant recovery, filling, vacuuming. Equipped with automobile refrigerant model database, supports R134A or R1234YF refrigerants. Features 128L/min dual-stage vacuum capacity, 10.1-inch touch screen display, and automatic mode one-click operation.',
      brand: 'smartsafe',
      category: 'ac-service-equipment',
      technicalTable: [{ label: 'Power Supply', value: 'AC110V/AC220V 50Hz/60Hz' }, { label: 'Power', value: '1000W' }, { label: 'Vacuum Pump', value: 'Dual-stage 128L/min' }, { label: 'Display', value: '10.1-inch touch screen' }, { label: 'Tank Capacity', value: '22kg' }],
      features: [{ title: 'Auto Database', description: 'Equipped with automobile refrigerant model database, updated free of charge' }, { title: 'Dual Refrigerant Support', description: 'Supports R134A or R1234YF' }, { title: 'High Efficiency', description: '128L/min dual-stage vacuum capacity' }],
      specs: [{ value: 'Fully automatic intelligent AC maintenance' }, { value: 'Suitable for fuel, EV, and hybrid vehicles' }, { value: 'Supports R134A and R1234YF' }, { value: '128L/min dual-stage vacuum pump' }, { value: '10.1-inch touch screen' }],
    }, token)
    console.log('Created AC 519+ (ac-519-plus)')
  } catch (e) { console.log('SKIP AC 519+:', e.message.slice(0, 80)) }

  // Create AC 519
  try {
    await api('POST', '/products', {
      id: 'ac-519',
      name: 'AC 519',
      summary: 'AC519 is a fully automatic intelligent automobile air conditioning maintenance equipment.',
      description: 'AC519 is a fully automatic intelligent automobile air conditioning maintenance equipment. Integrates disassembly-free cleaning, refrigerant recovery, filling, and vacuuming. Equipped with automobile refrigerant model database, supports R134A or R1234YF.',
      brand: 'smartsafe',
      category: 'ac-service-equipment',
      technicalTable: [{ label: 'Power Supply', value: 'AC110V/AC220V 50Hz/60Hz' }, { label: 'Recycling Capacity', value: 'Gaseous: 400g/min, Liquid: 700g/min' }, { label: 'Power', value: '700W' }],
      features: [{ title: 'Auto Database', description: 'Equipped with automobile refrigerant model database' }, { title: 'Dual Refrigerant', description: 'Supports R134A or R1234YF' }],
      specs: [{ value: 'Equipped with automobile refrigerant model database' }, { value: 'Supports R134A or R1234YF' }, { value: 'Automatic mode one-click operation' }],
    }, token)
    console.log('Created AC 519 (ac-519)')
  } catch (e) { console.log('SKIP AC 519:', e.message.slice(0, 80)) }

  // Create CNC 605 PRO+
  try {
    await api('POST', '/products', {
      id: 'cnc-605-pro-plus',
      name: 'CNC 605 PRO+',
      summary: 'CNC605+ is a cleaning and testing equipment for piezoelectric (140V), GDI (65V/12V) and conventional fuel injectors.',
      description: 'SmartSafe CNC 605 PRO PLUS is a cleaning and testing equipment suitable for piezoelectric (140V), GDI (65V/12V) and conventional fuel injectors. Uses ultrasonic cleaning technology combined with microprocessor oil pressure control to simulate various engine working conditions.',
      brand: 'launch',
      category: 'injector-cleaners-testers',
      technicalTable: [{ label: 'Power Supply', value: 'AC110V/AC220V 50Hz/60Hz' }, { label: 'Speed Range', value: '100~9900rpm' }, { label: 'Power', value: '500W' }, { label: 'Fuel Tank', value: '2500 ml' }, { label: 'Host Size', value: '412x398x550mm' }],
      features: [{ title: 'Multi-Mode', description: 'EFI (12V), GDI (65V) or PIEZO (140V) modes' }, { title: 'Ultrasonic Cleaning', description: 'Simultaneously cleans multiple injectors' }, { title: 'Comprehensive Testing', description: 'Resistance, spray, sealing, and quantity tests' }],
      specs: [{ value: 'EFI/GDI/PIEZO mode selection' }, { value: 'Ultrasonic cleaning' }, { value: 'Low/high resistance testing' }, { value: 'Spray uniformity test' }, { value: 'Sealing test' }, { value: 'Fuel quantity detection' }],
    }, token)
    console.log('Created CNC 605 PRO+ (cnc-605-pro-plus)')
  } catch (e) { console.log('SKIP CNC 605 PRO+:', e.message.slice(0, 80)) }

  // Try PL 4 2DBS via direct scraping
  console.log('\nRetrying PL 4 2DBS...')
  try {
    const res = await fetch('https://www.uniteequipment.com/pl-4-0-2de-2-post-lift-floor-cover-plate-two-post-vehicle-lift/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    })
    const html = await res.text()
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const title = doc.querySelector('h1')?.textContent?.trim() || doc.title?.trim() || 'PL 4 2DBS'
    await api('POST', '/products', {
      id: 'pl-4-2dbs',
      name: 'PL 4 2DBS',
      summary: '4 Ton 2 Post Clearfloor Lift by UNITE',
      description: title,
      brand: 'unite',
      category: 'car-lifts',
    }, token)
    console.log('Created PL 4 2DBS')
  } catch (err) {
    try {
      await api('POST', '/products', {
        id: 'pl-4-2dbs',
        name: 'PL 4 2DBS',
        summary: '4 Ton 2 Post Clearfloor Lift',
        description: 'The PL 4 2DBS is a 4 Ton 2 Post Clearfloor Lift by UNITE. Features floor cover plate design, durable construction.',
        brand: 'unite',
        category: 'car-lifts',
        technicalTable: [{ label: 'Capacity', value: '4 Ton' }, { label: 'Type', value: '2 Post Clearfloor' }],
      }, token)
      console.log('Created PL 4 2DBS (fallback)')
    } catch (e) { console.log('SKIP PL 4 2DBS:', e.message.slice(0, 80)) }
  }

  console.log('\nFix complete')
}

fix().catch(err => { console.error('Error:', err.message); process.exit(1) })
