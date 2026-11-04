import { brandSlug as toSlug } from '../utils/site.mjs';
import { createCmsClient } from './cms-client.mjs';
import { responsiveImage } from './media.mjs';

export const CMS_URL = (process.env.PUBLIC_STRAPI_URL || process.env.STRAPI_URL || import.meta.env.PUBLIC_STRAPI_URL || import.meta.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');

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
  categorySlug: string;
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

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('/uploads/')) url = `${CMS_URL}${url}`;
  // The public CMS supports HTTPS; do not expose mixed-content media URLs.
  if (url.startsWith('http://strapi.autodiagnostix.com.pk/')) return url.replace('http:', 'https:');
  return url;
}

const POPULATE = 'populate[heroImages][populate][image][populate]=*&populate[brand][fields][0]=name&populate[category][fields][0]=name&populate[category][fields][1]=slug&populate[features][fields][0]=title&populate[features][fields][1]=description&populate[features][populate][image][fields][0]=url&populate[functions][fields][0]=title&populate[functions][fields][1]=description&populate[technicalTable]=*&populate[specs]=*';
const SUMMARY_POPULATE = 'populate[heroImages][populate][image][fields][0]=url&populate[brand][fields][0]=name&populate[category][fields][0]=name&populate[category][fields][1]=slug';

// Every SSR page reads the whole catalog. Reuse successful CMS responses for a
// short time (CMS_CACHE_SECONDS, default 60) and refresh them in the
// background for up to 10 minutes, so page views no longer wait on several
// Strapi round trips. Edits in Strapi appear within about a minute.
// Set CMS_CACHE_SECONDS=0 to disable; development always reads live.
const cacheSeconds = Number(process.env.CMS_CACHE_SECONDS ?? 60);
const cmsClient = createCmsClient(CMS_URL, fetch, import.meta.env.DEV || !(cacheSeconds > 0)
  ? {}
  : { freshMs: cacheSeconds * 1000, staleMs: 10 * 60 * 1000 });

async function fetchAPI<T>(endpoint: string): Promise<T> {
  return await cmsClient.read(endpoint) as T;
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
  category: { id: number; name: string; slug?: string } | null;
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
    categorySlug: p.category?.slug || '',
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

export async function getProducts({ summaryOnly = false }: { summaryOnly?: boolean } = {}): Promise<Product[]> {
  // Listing/search callers do not consume feature/specification relations.
  // Full product and PDF requests retain the original population contract.
  const products = await cmsClient.list(`/products?${summaryOnly ? SUMMARY_POPULATE : POPULATE}`) as StrapiProduct[];
  return products.map(normalizeProduct);
}

export function sortByAvailability(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const aDisc = a.badge === 'DISCONTINUED' ? 1 : 0;
    const bDisc = b.badge === 'DISCONTINUED' ? 1 : 0;
    return aDisc - bDisc;
  });
}

export async function getProduct(slug: string): Promise<Product | null> {
  const data = await fetchAPI<StrapiListResponse<StrapiProduct>>(`/products?filters[slug][$eq]=${encodeURIComponent(slug)}&${POPULATE}`);
  const items = data.data || [];
  return items.length > 0 ? normalizeProduct(items[0]) : null;
}

export async function getCategories(): Promise<Category[]> {
  const categories = await cmsClient.list('/categories?populate=*', 50) as StrapiCategory[];
  return categories.map(normalizeCategory);
}

export async function getCategory(slug: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find(c => c.id === slug || c.name.toLowerCase() === slug.replace(/-/g, ' ')) || null;
}

export async function getBrands(existingProducts?: Product[]): Promise<Brand[]> {
  const products = existingProducts ?? await getProducts();
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

// Brands without assigned products still have real, crawlable CMS pages.
export async function getBrandDetails(slug: string): Promise<Brand | null> {
  const response = await fetchAPI<StrapiListResponse<{ slug: string; name: string; description?: string; logo?: { url: string } }>>(
    `/brands?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[logo][fields][0]=url`,
  );
  const brand = response.data?.[0];
  return brand ? {
    id: brand.slug, slug: brand.slug, name: brand.name,
    description: brand.description || '', productCount: 0,
    image: resolveImageUrl(brand.logo?.url),
  } : null;
}

// Brand records with logos and descriptions (homepage partner strip).
// Optional decoration: an outage yields an empty list rather than a 503.
export async function getBrandRecords(): Promise<{ slug: string; name: string; description?: string; logo?: { url: string } }[]> {
  try {
    const response = await fetchAPI<StrapiListResponse<{ slug: string; name: string; description?: string; logo?: { url: string } }>>('/brands?populate=*');
    return response.data || [];
  } catch {
    return [];
  }
}

// Public origin of CMS media, used to recognise CMS uploads for /media/.
const CMS_ORIGIN = (() => { try { return new URL(CMS_URL).origin; } catch { return ''; } })();
export const CMS_PUBLIC_ORIGIN = CMS_ORIGIN.startsWith('https:') ? CMS_ORIGIN : '';
const CMS_ORIGINS = [CMS_ORIGIN, 'https://strapi.autodiagnostix.com.pk'].filter(Boolean);

// Spread onto <img>: same-origin, resized WebP for CMS photos (see
// pages/media), unchanged src for anything else.
export function cardImage(url: string | undefined, sizes = '(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw') {
  const { src, srcset } = responsiveImage(url, CMS_ORIGINS, [320, 480, 640]);
  return srcset ? { src, srcset, sizes } : { src };
}

export function heroImage(url: string | undefined, sizes = '(min-width: 1024px) 50vw, 100vw') {
  const { src, srcset } = responsiveImage(url, CMS_ORIGINS, [480, 640, 960]);
  return srcset ? { src, srcset, sizes } : { src };
}
