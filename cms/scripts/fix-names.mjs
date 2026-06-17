const CMS_URL = 'http://localhost:3000'
const API_URL = `${CMS_URL}/api`

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
    body: JSON.stringify({ email: 'admin@autodiagnostix.com', password: 'admin123!' }),
  })
  const data = await res.json()
  return data.token
}

async function main() {
  const token = await login()
  console.log('Logged in')

  const fixes = [
    { id: 'uz30c', name: 'UZ30C', summary: '3 Ton Capacity Mid-Rise Scissor Lift by UNITE', description: 'The UZ30C is a 3 Ton capacity mid-rise scissor lift designed for automotive workshops. Ideal for tire service, brake work, and under-vehicle inspections.' },
    { id: 'g68', name: 'G68', summary: 'Digital Wheel Balancer with LCD Display by UNITE', description: 'The G68 is a digital wheel balancer with LCD display featuring precision calibration, heavy-duty motor, auto-positioning, quick cycle, and durable design.' },
    { id: 'g55', name: 'G55', summary: 'Pro-Line Wheel Balancer by UNITE', description: 'The G55 is a professional wheel balancer from UNITE designed for automotive workshops requiring precision balancing.' },
  ]

  for (const f of fixes) {
    try {
      await api('PATCH', `/products/${f.id}`, { name: f.name, summary: f.summary, description: f.description }, token)
      console.log(`Fixed ${f.id} -> ${f.name}`)
    } catch (e) {
      console.log(`FAIL ${f.id}: ${e.message.slice(0, 80)}`)
    }
  }

  console.log('\nDone')
}

main().catch(e => { console.error(e.message); process.exit(1) })
