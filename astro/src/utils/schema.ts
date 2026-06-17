const SITE_URL = 'https://autodiagnostix.com';
const CURRENCY = 'PKR';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Autodiagnostix',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: 'Precision Engineering for Automotive Professionals. We provide diagnostic tools, scanners, and workshop equipment.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: `${SITE_URL}/#contact`,
    },
  };
}

export function breadcrumbListSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productSchema(product: {
  id: string;
  name: string;
  summary?: string;
  description?: string;
  heroImages?: string[];
  brand?: string;
  category?: string;
  price?: number | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary || product.description?.substring(0, 200) || '',
    image: product.heroImages || [],
    sku: product.id,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.id}`,
      availability: 'https://schema.org/InStock',
      priceCurrency: CURRENCY,
      ...(product.price ? { price: product.price } : {}),
    },
    category: product.category,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Autodiagnostix',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function itemListSchema(items: { name: string; url: string }[], type: 'ItemList' | 'CollectionPage' = 'ItemList') {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: item.url,
      name: item.name,
    })),
  };
}

export function brandSchema(brand: { name: string; url: string; description?: string; image?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.name,
    url: brand.url,
    ...(brand.description ? { description: brand.description } : {}),
    ...(brand.image ? { image: brand.image } : {}),
  };
}
