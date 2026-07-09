const CMS_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';

const FALLBACK_IMAGES: Record<string, string[]> = {
  "lh-330-lh-340-dual-pump-floor-jack": ["/images/lh-330-lh-340-dual-pump-floor-jack_img1.webp"],
  "launch-x-431-cnc-605a": ["/images/launch-x-431-cnc-605a_img1.webp", "/images/launch-x-431-cnc-605a_img2.webp"],
  "tlt440w": ["/images/tlt440w_img1.webp"],
  "wa613-wireless-3d-wheel-aligner": ["/images/wa613-wireless-3d-wheel-aligner_img1.webp"],
  "x-431-pad-9-link": ["/images/x-431-pad-9-link_img1.webp", "/images/x-431-pad-9-link_img2.webp", "/images/x-431-pad-9-link_img3.webp", "/images/x-431-pad-9-link_img4.webp", "/images/x-431-pad-9-link_img5.webp"],
  "x-431-adas-pro-plus": ["/images/x-431-adas-pro-plus_img1.webp", "/images/x-431-adas-pro-plus_img2.webp", "/images/x-431-adas-pro-plus_img3.webp"],
  "launch-jack-stand-3-ton-and-6-ton": ["/images/launch-jack-stand-3-ton-and-6-ton_img1.webp"],
  "vsp-800-video-scope": ["/images/vsp-800-video-scope_img1.webp", "/images/vsp-800-video-scope_img2.webp", "/images/vsp-800-video-scope_img3.webp", "/images/vsp-800-video-scope_img4.webp"],
  "cnc-605-pro-plus": ["/images/cnc-605-pro-plus_img1.webp"],
  "tlt840waf": ["/images/tlt840waf_img1.webp"],
  "x-431-pro3-link": ["/images/x-431-pro3-link_img1.webp", "/images/x-431-pro3-link_img2.webp", "/images/x-431-pro3-link_img3.webp", "/images/x-431-pro3-link_img4.webp", "/images/x-431-pro3-link_img5.webp"],
  "bst-560-bst-860-battery-tester": ["/images/bst-560-bst-860-battery-tester_img1.webp", "/images/bst-560-bst-860-battery-tester_img2.webp", "/images/bst-560-bst-860-battery-tester_img3.webp", "/images/bst-560-bst-860-battery-tester_img4.webp"],
  "x861-lite-wheelalignment-machine": ["/images/X861-lite-wheelalignment-Machine_img1.webp"],
  "value-ac519-a-c-service-station": ["/images/value-ac519-a-c-service-station_img1.webp"],
  "vsp-600-video-scope": ["/images/vsp-600-video-scope_img1.webp", "/images/vsp-600-video-scope_img2.webp", "/images/vsp-600-video-scope_img3.webp", "/images/vsp-600-video-scope_img4.webp"],
  "919-max": ["/images/919-max_img1.webp", "/images/919-max_img2.webp"],
  "x861-pro-wheel-alignment-machine": ["/images/X861-PRO-wheel-alignment-Machine_img1.webp"],
  "x-431-hd-iii-heavy-duty-module": ["/images/x-431-hd-iii-heavy-duty-module_img1.webp", "/images/x-431-hd-iii-heavy-duty-module_img2.webp"],
  "ismarttlt-242": ["/images/ismarttlt-242_img1.webp"],
  "tlt630a": ["/images/tlt630a_img1.webp"],
};

// Normalized types for the frontend (same shape as before)
export interface Product {
  id: string;
  name: string;
  summary: string;
  description: string;
  brand: string;
  brands: string[];
  category: string;
  heroImages: string[];
  features: { title: string; description: string; image: string }[];
  functions: { title: string; description: string; image: string }[];
  specs: string[];
  technicalTable: { label: string; value: string }[];
  badge: string | null;
  price: number | null;
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  image: string;
}

function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `${CMS_URL}${url}`;
  return url;
}

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const POPULATE = 'populate[heroImages][populate][image][populate]=*&populate[brand][fields][0]=name&populate[category][fields][0]=name&populate[features][fields][0]=title&populate[features][fields][1]=description&populate[features][populate][image][fields][0]=url&populate[functions][fields][0]=title&populate[functions][fields][1]=description&populate[technicalTable]=*&populate[specs]=*';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const res = await fetch(`${CMS_URL}/api${endpoint}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Strapi API ${res.status}: ${res.statusText}`);
    return res.json();
  } catch {
    return { data: [] } as unknown as T;
  }
}

interface StrapiListResponse<T> {
  data: T[];
  meta: { pagination: { total: number; page: number; pageSize: number } };
}

interface StrapiHeroImage {
  id: number;
  image?: {
    id: number;
    url: string;
    alternativeText?: string;
  };
}

interface StrapiFeature {
  id: number;
  title: string;
  description: string;
  image?: {
    id: number;
    url: string;
  };
}

interface StrapiSpec {
  id: number;
  label: string;
  value: string;
}

interface StrapiProduct {
  id: number;
  slug: string;
  name: string;
  summary: string;
  description: string;
  badge: string | null;
  price: number | null;
  brand: { id: number; name: string }[] | { id: number; name: string } | null;
  category: { id: number; name: string } | null;
  heroImages: StrapiHeroImage[];
  features: StrapiFeature[];
  functions: StrapiFeature[];
  technicalTable: StrapiSpec[];
  specs: StrapiSpec[];
}

interface StrapiCategory {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  image: { id: number; url: string } | null;
}

function normalizeBrands(b: StrapiProduct['brand']): string[] {
  if (!b) return [];
  const names = Array.isArray(b) ? b.map(x => x.name).filter(Boolean) : (b.name ? [b.name] : []);
  // Sort with Launch first, then Smartsafe, then alphabetical
  const priority: Record<string, number> = { Launch: 0, SmartSafe: 1, Smartsafe: 1 };
  return names.sort((a, b) => (priority[a] ?? 99) - (priority[b] ?? 99) || a.localeCompare(b));
}

function normalizeProduct(p: StrapiProduct): Product {
  const heroImages = (p.heroImages || []).map(h => resolveImageUrl(h.image?.url));
  if (heroImages.length === 0 || !heroImages[0]) {
    const fallbacks = FALLBACK_IMAGES[p.slug];
    if (fallbacks) heroImages.push(...fallbacks);
  }
  const brands = normalizeBrands(p.brand);
  return {
    id: p.slug,
    name: p.name,
    summary: p.summary || '',
    description: p.description || '',
    brand: brands.join(' / '),
    brands,
    category: p.category?.name || '',
    heroImages,
    features: (p.features || []).map(f => ({
      title: f.title,
      description: f.description,
      image: resolveImageUrl(f.image?.url),
    })),
    functions: (p.functions || []).map(f => ({
      title: f.title,
      description: f.description,
      image: resolveImageUrl(f.image?.url),
    })),
    specs: (p.specs || []).map(s => s.value || ''),
    technicalTable: (p.technicalTable || []).map(t => ({
      label: t.label,
      value: t.value,
    })),
    badge: p.badge || null,
    price: p.price || null,
  };
}

function normalizeCategory(c: StrapiCategory): Category {
  return {
    id: c.slug,
    name: c.name,
    tagline: c.tagline || '',
    icon: c.icon || '',
    description: c.description || '',
    image: resolveImageUrl(c.image?.url),
  };
}

export async function getProducts(): Promise<Product[]> {
  const data = await fetchAPI<StrapiListResponse<StrapiProduct>>(`/products?${POPULATE}&pagination[pageSize]=100`);
  return (data.data || []).map(normalizeProduct);
}

export function sortByAvailability(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const aDisc = a.badge === 'DISCONTINUED' ? 1 : 0;
    const bDisc = b.badge === 'DISCONTINUED' ? 1 : 0;
    return aDisc - bDisc;
  });
}

export async function getProduct(slug: string): Promise<Product | null> {
  const data = await fetchAPI<StrapiListResponse<StrapiProduct>>(`/products?filters[slug][$eq]=${slug}&${POPULATE}`);
  const items = data.data || [];
  return items.length > 0 ? normalizeProduct(items[0]) : null;
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchAPI<StrapiListResponse<StrapiCategory>>('/categories?populate=*&pagination[pageSize]=50');
  return (data.data || []).map(normalizeCategory);
}

export async function getCategory(slug: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find(c => c.id === slug || c.name.toLowerCase() === slug.replace(/-/g, ' ')) || null;
}

export async function getBrands(): Promise<Brand[]> {
  const products = await getProducts();
  const brandMap = new Map<string, Product[]>();
  for (const p of products) {
    for (const name of (p.brands.length > 0 ? p.brands : [p.brand])) {
      if (!name) continue;
      if (!brandMap.has(name)) brandMap.set(name, []);
      brandMap.get(name)!.push(p);
    }
  }
  return Array.from(brandMap.entries())
    .filter(([name]) => name && name !== 'Other')
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, prods]) => ({
      id: toSlug(name),
      name,
      slug: toSlug(name),
      description: '',
      productCount: prods.length,
      image: prods[0]?.heroImages?.[0] || '',
    }));
}
