// Match the existing production redirect destination; never migrate URLs here.
export const SITE_URL = 'https://www.autodiagnostix.com.pk';

const siteHosts = new Set(['autodiagnostix.com.pk', 'www.autodiagnostix.com.pk']);

// Preserve the established product-derived brand paths (e.g. GTI.tools → gtitools).
export function brandSlug(name) {
  return name.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function canonicalUrl(input = '/') {
  const url = new URL(input, `${SITE_URL}/`);
  if (!siteHosts.has(url.hostname)) {
    throw new Error('Canonical URLs must belong to AutoDiagnostix');
  }
  return `${SITE_URL}${url.pathname.replace(/\/+$/, '') || '/'}`;
}

// Preserve fragments (entity IDs) and search templates. Only normalize our own
// absolute URLs, never manufacturer identities, media hosts, or the sister site.
export function normalizeSiteUrls(value) {
  if (typeof value === 'string' && /^https?:\/\/(?:www\.)?autodiagnostix\.com\.pk(?=[/?#]|$)/i.test(value)) {
    return value.replace(/^https?:\/\/(?:www\.)?autodiagnostix\.com\.pk/i, SITE_URL)
      .replace(/^https:\/\/www\.autodiagnostix\.com\.pk(?=[?#]|$)/, `${SITE_URL}/`);
  }
  if (Array.isArray(value)) return value.map(normalizeSiteUrls);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeSiteUrls(item)]));
  }
  return value;
}
