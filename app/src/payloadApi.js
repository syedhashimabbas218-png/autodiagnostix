const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000'

async function fetchAPI(endpoint) {
  const res = await fetch(`${CMS_URL}/api${endpoint}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json()
}

function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('/api/')) return `${CMS_URL}${url}`
  return url
}

export function normalizeProduct(p) {
  return {
    id: p.id,
    name: p.name,
    summary: p.summary || '',
    description: p.description || '',
    brand: p.brand?.name || p.brand || '',
    category: p.category?.name || p.category || '',
    heroImages: (p.heroImages || []).map(h => resolveImageUrl(h.image?.url || h.image || '')),
    features: (p.features || []).map(f => ({
      title: f.title,
      description: f.description,
      image: resolveImageUrl(f.image?.url || f.image || ''),
    })),
    specs: (p.specs || []).map(s => s.value || s),
    technicalTable: (p.technicalTable || []).map(t => ({
      label: t.label,
      value: t.value,
    })),
    badge: p.badge || null,
    price: p.price || null,
  }
}

export function normalizeCategory(c) {
  return {
    id: c.id,
    name: c.name,
    tagline: c.tagline || '',
    icon: c.icon || '',
    description: c.description || '',
    image: resolveImageUrl(c.image?.url || c.image || ''),
  }
}

export async function getProducts() {
  const data = await fetchAPI('/products?depth=2&limit=100')
  return (data.docs || data).map(normalizeProduct)
}

export async function getProduct(id) {
  const data = await fetchAPI(`/products?where[id][equals]=${id}&depth=2`)
  const docs = data.docs || data
  return docs.length > 0 ? normalizeProduct(docs[0]) : null
}

export async function getCategories() {
  const data = await fetchAPI('/categories?depth=1&limit=50')
  return (data.docs || data).map(normalizeCategory)
}

export async function getBrands() {
  const data = await fetchAPI('/brands?depth=1&limit=50')
  return data.docs || data
}

// Admin API helpers
export async function createProduct(data) {
  const token = localStorage.getItem('payload-token')
  const res = await fetch(`${CMS_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Create failed: ${res.status}`)
  return res.json()
}

export async function updateProduct(id, data) {
  const token = localStorage.getItem('payload-token')
  const res = await fetch(`${CMS_URL}/api/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Update failed: ${res.status}`)
  return res.json()
}

export async function deleteProduct(id) {
  const token = localStorage.getItem('payload-token')
  const res = await fetch(`${CMS_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
  return res.json()
}
