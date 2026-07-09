const SITE_URL = 'https://autodiagnostix.com.pk';
const CURRENCY = 'PKR';
const LAST_UPDATED = new Date().toISOString().slice(0, 10);

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Autodiagnostix',
    alternateName: 'Autodiagnostix Pakistan',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: 'Precision Engineering for Automotive Professionals. We provide diagnostic tools, scanners, and workshop equipment.',
    disambiguatingDescription: 'Authorized dealer for LAUNCH, SMARTSAFE, UNITE, GTI.tools, Liberty Lifts and AUTOOL automotive diagnostic and workshop equipment based in Sahiwal, Punjab, Pakistan. Distinct from AUTODIAGNOSTIK LTD (UK) and AUTO DIAGNOSTIX SRL (Romania).',
    foundingDate: '2020',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: `${SITE_URL}/#contact`,
    },
    sameAs: [
      'https://www.wikidata.org/wiki/Q140443798',
      'https://www.facebook.com/share/1aVWEp7poQ/?mibextid=wwXIfr',
      'https://www.linkedin.com/company/launch-pakistan/',
      'https://www.instagram.com/autodiagnostix',
    ],
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
    dateModified: LAST_UPDATED,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.id}`,
      availability: 'https://schema.org/InStock',
      priceCurrency: CURRENCY,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Autodiagnostix',
        url: SITE_URL,
      },
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
    dateModified: LAST_UPDATED,
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
    sameAs: [`${SITE_URL}/brand/${brand.url.split('/').pop()}`],
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    '@id': `${SITE_URL}/#business`,
    name: 'Autodiagnostix',
    alternateName: 'Autodiagnostix Pakistan',
    parentOrganization: { '@type': 'Organization', '@id': `${SITE_URL}/#organization` },
    description: "Pakistan's authorized dealer for LAUNCH, SMARTSAFE, UNITE, GTI.tools, Liberty Lifts, and AUTOOL. Professional automotive diagnostic equipment, workshop tools, car lifts, wheel alignment, tyre changers, wheel balancers, ADAS calibration, and EV service equipment for B2B and professional service centers.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-full.webp`,
    image: `${SITE_URL}/og-image.svg`,
    telephone: '+92-322-7041953',
    email: 'info@autodiagnostix.com.pk',
    priceRange: 'PKR',
    foundingDate: '2020',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shalimar Town, Main Bypass Road',
      addressLocality: 'Sahiwal',
      addressRegion: 'Punjab',
      postalCode: '57000',
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.6644,
      longitude: 73.1085,
    },
    areaServed: [
      { '@type': 'Country', name: 'Pakistan' },
      { '@type': 'City', name: 'Karachi' },
      { '@type': 'City', name: 'Lahore' },
      { '@type': 'City', name: 'Islamabad' },
      { '@type': 'City', name: 'Rawalpindi' },
      { '@type': 'City', name: 'Faisalabad' },
      { '@type': 'City', name: 'Multan' },
      { '@type': 'City', name: 'Peshawar' },
      { '@type': 'City', name: 'Sahiwal' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      'https://www.wikidata.org/wiki/Q140443798',
      'https://www.facebook.com/share/1aVWEp7poQ/?mibextid=wwXIfr',
      'https://www.linkedin.com/company/launch-pakistan/',
      'https://www.instagram.com/autodiagnostix',
    ],
    brand: [
      { '@type': 'Brand', name: 'LAUNCH' },
      { '@type': 'Brand', name: 'SMARTSAFE' },
      { '@type': 'Brand', name: 'UNITE' },
      { '@type': 'Brand', name: 'Liberty Lifts' },
      { '@type': 'Brand', name: 'GTI.tools' },
      { '@type': 'Brand', name: 'AUTOOL' },
    ],
    knowsAbout: [
      'Automotive diagnostics',
      'OBD2 scanners',
      'Launch X431',
      'Car lifts',
      '2-post lifts',
      '4-post lifts',
      'Scissor lifts',
      'Bulletproof vehicle lifts',
      'Wheel alignment',
      '3D wheel alignment',
      'Tyre changers',
      'Wheel balancers',
      'ADAS calibration',
      'EV diagnostics',
      'Battery testers',
      'Videoscopes',
      'Nitrogen tyre inflation',
      'Workshop equipment',
      'Injector cleaning machines',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Automotive Workshop Equipment Catalog',
      itemListElement: [
        { '@type': 'OfferCatalog', name: 'Diagnostic Scanners' },
        { '@type': 'OfferCatalog', name: 'Car Lifts' },
        { '@type': 'OfferCatalog', name: 'Wheel Alignment Machines' },
        { '@type': 'OfferCatalog', name: 'Tyre Changers & Wheel Balancers' },
        { '@type': 'OfferCatalog', name: 'ADAS Calibration Equipment' },
        { '@type': 'OfferCatalog', name: 'EV Diagnostic Equipment' },
      ],
    },
  };
}

export function speakableSchema(url: string, cssSelectors: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url: url,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
  };
}

export function definitionBlock(term: string, definition: string, url?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term,
    description: definition,
    ...(url ? { url } : {}),
  };
}

export function articleSchema(opts: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  keywords?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
    image: opts.image ? [opts.image] : [`${SITE_URL}/og-image.svg`],
    datePublished: opts.datePublished || '2024-01-01',
    dateModified: opts.dateModified || LAST_UPDATED,
    keywords: opts.keywords?.join(', '),
    inLanguage: 'en-PK',
    author: {
      '@type': 'Organization',
      name: 'Autodiagnostix',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Autodiagnostix',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-full.webp` },
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

export function howToSchema(steps: { name: string; text: string; image?: string }[], opts: { name: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.image ? { image: s.image } : {}),
    })),
  };
}

export function serviceSchema(service: { name: string; description: string; url: string; area?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: service.url,
    areaServed: service.area || 'Pakistan',
    provider: {
      '@type': 'AutomotiveBusiness',
      name: 'Autodiagnostix',
      url: SITE_URL,
    },
  };
}
