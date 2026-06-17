const CMS_URL = 'http://localhost:3000'
const API_URL = `${CMS_URL}/api`

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
    body: JSON.stringify({ email: 'admin@autodiagnostix.com', password: 'admin123!' }),
  })
  return (await res.json()).token
}

async function main() {
  const token = await login()
  console.log('Logged in')

  const patches = [
    {
      id: 'uz30c',
      name: 'UZ30C',
      summary: '3 Ton Capacity Mid-Rise Scissor Lift by UNITE for automotive workshops.',
      description: 'The UNITE UZ30C is a 3-ton capacity mid-rise scissor lift designed for automotive workshops. Ideal for tire service, brake work, transmission repair, and under-vehicle inspections. Features durable construction, safety locks, and easy operation.',
      specs: [{ value: '3 Ton (6,600 lbs) lifting capacity' }, { value: 'Mid-rise scissor lift design' }, { value: 'Safety locking mechanism' }, { value: 'Ideal for tire and brake service' }],
      features: [{ title: '3 Ton Capacity', description: 'Handles most passenger vehicles and light trucks' }, { title: 'Safety Locks', description: 'Built-in safety locking mechanism for secure operation' }],
      technicalTable: [{ label: 'Capacity', value: '3 Ton / 6,600 lbs' }, { label: 'Type', value: 'Mid-Rise Scissor Lift' }],
    },
    {
      id: 'cnc-605a',
      name: 'CNC 605A',
      summary: 'CNC605A is a GDI injector cleaner and tester for direct injection fuel systems.',
      description: 'The CNC605A is a GDI injector cleaner and tester designed specifically for cleaning and testing gasoline direct injection fuel injectors. Features ultrasonic cleaning technology and comprehensive testing functions to maintain optimal fuel system performance.',
      specs: [{ value: 'GDI injector cleaning and testing' }, { value: 'Ultrasonic cleaning technology' }, { value: 'Comprehensive testing functions' }, { value: 'Suitable for direct injection systems' }],
      features: [{ title: 'GDI Cleaning', description: 'Specialized cleaning for gasoline direct injection injectors' }, { title: 'Ultrasonic Technology', description: 'Effective ultrasonic cleaning removes carbon deposits' }],
      technicalTable: [{ label: 'Type', value: 'GDI Injector Cleaner & Tester' }, { label: 'Application', value: 'Gasoline Direct Injection Systems' }],
    },
    {
      id: 'autool-spt-360',
      name: 'AUTOOL SPT 360',
      summary: 'AUTOOL SPT360 is a car spark plug tester with five-hole flashover analysis.',
      description: 'The AUTOOL SPT360 Car Spark Plug Tester is an automotive ignition diagnostic tool featuring five-hole spark plug flashover analysis. Works with 110-220V power supply. Tests ignition performance, spark intensity, and detects misfires in gasoline engines.',
      specs: [{ value: 'Five-hole spark plug flashover analysis' }, { value: '110-220V power supply' }, { value: 'Ignition performance testing' }, { value: 'Detects misfires and spark issues' }],
      features: [{ title: 'Five-Hole Analysis', description: 'Five-hole spark plug flashover analyzer for comprehensive ignition testing' }, { title: 'Universal Power', description: 'Works with 110-220V power supply for workshop compatibility' }],
      technicalTable: [{ label: 'Power Supply', value: '110-220V' }, { label: 'Type', value: 'Spark Plug Tester' }, { label: 'Application', value: 'Automotive Ignition Diagnostics' }],
    },
    {
      id: 'ismartvideo400',
      name: 'ISMARTVIDEO400',
      summary: 'SmartSafe iSmartVideo400 is a professional videoscope for TPMS and vehicle inspections.',
      description: 'SmartSafe iSmartVideo400 is a professional videoscope designed for TPMS diagnostics and vehicle inspections. Features high-definition imaging, flexible probe, and comprehensive inspection capabilities for hard-to-reach areas in vehicles.',
      specs: [{ value: 'Professional videoscope for TPMS diagnostics' }, { value: 'High-definition imaging' }, { value: 'Flexible probe design' }, { value: 'Vehicle inspection capabilities' }],
      features: [{ title: 'HD Imaging', description: 'High-definition camera for clear inspection views' }, { title: 'Flexible Probe', description: 'Flexible probe reaches tight spaces in vehicles' }],
      technicalTable: [{ label: 'Type', value: 'Videoscope' }, { label: 'Application', value: 'TPMS & Vehicle Inspection' }],
    },
    {
      id: 'g68',
      name: 'G68',
      summary: 'UNITE G68 Digital Wheel Balancer with LCD display and precision calibration.',
      description: 'The UNITE G68 is a digital wheel balancer with LCD display featuring precision calibration, heavy-duty motor, auto-positioning, quick cycle, and durable design. Ideal for professional tire shops and automotive workshops.',
      specs: [{ value: 'Digital LCD display' }, { value: 'Precision calibration' }, { value: 'Heavy-duty motor' }, { value: 'Auto-positioning' }, { value: 'Quick cycle time' }],
      features: [{ title: 'Digital Display', description: 'LCD display for clear readouts and easy operation' }, { title: 'Precision Calibration', description: 'Accurate wheel balancing with precision calibration system' }],
      technicalTable: [{ label: 'Type', value: 'Digital Wheel Balancer' }, { label: 'Display', value: 'LCD Display' }, { label: 'Motor', value: 'Heavy-Duty' }],
    },
    {
      id: 'g55',
      name: 'G55',
      summary: 'UNITE G55 Pro-Line Wheel Balancer for professional tire service.',
      description: 'The UNITE G55 is a professional wheel balancer designed for automotive workshops requiring precision balancing. Features reliable performance, durable construction, and easy operation for consistent balancing results.',
      specs: [{ value: 'Professional wheel balancing' }, { value: 'Durable construction' }, { value: 'Easy operation' }, { value: 'Consistent balancing results' }],
      features: [{ title: 'Professional Grade', description: 'Designed for demanding workshop environments' }, { title: 'Reliable Performance', description: 'Consistent and accurate wheel balancing' }],
      technicalTable: [{ label: 'Type', value: 'Wheel Balancer' }, { label: 'Grade', value: 'Professional / Pro-Line' }],
    },
  ]

  for (const p of patches) {
    try {
      await api('PATCH', `/products/${p.id}`, p, token)
      console.log(`Fixed ${p.id}`)
    } catch (e) {
      console.log(`FAIL ${p.id}: ${e.message.slice(0, 80)}`)
    }
  }

  console.log('\nDone')
}

main().catch(e => { console.error(e.message); process.exit(1) })
