import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Autodiagnostix';
const SITE_URL = 'https://autodiagnostix.com';
const DEFAULT_OG_IMAGE = '/og-image.png';

export default function SeoHead({
  title,
  description = 'Precision engineering for automotive professionals.',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonical,
  jsonLd,
  noindex,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const ogUrl = canonical || SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
