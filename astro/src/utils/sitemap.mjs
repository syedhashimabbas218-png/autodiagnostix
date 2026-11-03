import { canonicalUrl, brandSlug } from './site.mjs';

// Existing editorial/commercial URLs only. Category, brand and product routes
// come from published CMS data, never from keyword variants or guessed URLs.
export const CORE_PATHS = [
  '/', '/products', '/brands', '/about', '/contact', '/privacy-policy', '/terms-of-service',
  '/car-lifts-in-pakistan', '/2-post-car-lifts-pakistan', '/4-post-car-lifts-pakistan',
  '/scissor-lifts-pakistan', '/bulletproof-car-lifts-pakistan', '/alignment-lifts-pakistan',
  '/launch-lifts-pakistan', '/launch-x431-pakistan', '/launch-injector-machines-pakistan',
  '/wheel-alignment-in-pakistan', '/tyre-changers-pakistan', '/wheel-balancers-pakistan',
  '/adas-calibration-pakistan', '/ev-diagnostics-pakistan', '/battery-testers-pakistan',
  '/videoscope-pakistan', '/workshop-equipment-pakistan', '/tyre-inflators-pakistan',
];

// Strict reader: an upstream outage must not silently remove catalog URLs.
export async function fetchSitemapRows(cmsUrl, endpoint, fetcher = fetch) {
  const rows = [];
  const separator = endpoint.includes('?') ? '&' : '?';
  for (let page = 1; page <= 1000; page++) {
    const response = await fetcher(`${cmsUrl.replace(/\/$/, '')}/api/${endpoint}${separator}pagination[pageSize]=100&pagination[page]=${page}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Sitemap CMS request failed (${response.status})`);
    const payload = await response.json();
    if (!Array.isArray(payload.data)) throw new Error('Invalid sitemap CMS response');
    rows.push(...payload.data);
    const pagination = payload.meta?.pagination;
    if (pagination?.pageCount !== undefined) {
      if (!Number.isInteger(pagination.pageCount) || pagination.pageCount < 0) throw new Error('Invalid CMS page count');
      if (pagination.page !== undefined && pagination.page !== page) throw new Error('CMS returned an unexpected page');
      if (page >= pagination.pageCount) {
        if (pagination.total !== undefined && rows.length !== pagination.total) throw new Error('Incomplete CMS sitemap data');
        return rows;
      }
      if (!payload.data.length) throw new Error('Empty intermediate CMS page');
    } else if (pagination?.total !== undefined) {
      if (!Number.isInteger(pagination.total) || pagination.total < rows.length) throw new Error('Invalid CMS total');
      if (rows.length === pagination.total) return rows;
      if (!payload.data.length) throw new Error('Incomplete CMS sitemap data');
    } else if (payload.data.length < 100) {
      return rows;
    }
  }
  throw new Error('CMS sitemap pagination limit exceeded');
}

function segment(value) {
  if (typeof value !== 'string' || !value || /[/\\?#\s]/.test(value)) throw new Error('Invalid CMS URL slug');
  return encodeURIComponent(value);
}

export function catalogSitemapUrls({ products, categories, brands }) {
  if (!products.length || !categories.length || !brands.length) throw new Error('Refusing an empty catalog sitemap');
  const urls = new Set(CORE_PATHS.map(path => canonicalUrl(path)));
  const productBrands = new Map();
  const brandKey = name => name.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const product of products) {
    urls.add(canonicalUrl(`/product/${segment(product.slug)}`));
    const relations = Array.isArray(product.brand) ? product.brand : (product.brand ? [product.brand] : []);
    for (const brand of relations) {
      if (!brand.name || brand.name === 'Other') continue;
      const slug = brandSlug(brand.name);
      productBrands.set(brandKey(brand.name), slug);
      urls.add(canonicalUrl(`/brand/${segment(slug)}`));
    }
  }
  for (const category of categories) urls.add(canonicalUrl(`/category/${segment(category.slug)}`));
  for (const brand of brands) {
    if (!brand.name || brand.name === 'Other') continue;
    // Match the existing product-derived canonical (including legacy gtitools).
    const slug = productBrands.get(brandKey(brand.name)) || brand.slug;
    urls.add(canonicalUrl(`/brand/${segment(slug)}`));
  }
  return [...urls].sort();
}

export async function loadSitemapUrls(cmsUrl, fetcher = fetch) {
  const [products, categories, brands] = await Promise.all([
    fetchSitemapRows(cmsUrl, 'products?fields[0]=slug&populate[brand][fields][0]=name', fetcher),
    fetchSitemapRows(cmsUrl, 'categories?fields[0]=slug', fetcher),
    fetchSitemapRows(cmsUrl, 'brands?fields[0]=name&fields[1]=slug', fetcher),
  ]);
  return catalogSitemapUrls({ products, categories, brands });
}

export function escapeXml(value) {
  return value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]);
}

export function sitemapXml(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${escapeXml(url)}</loc></url>`).join('')}</urlset>`;
}
