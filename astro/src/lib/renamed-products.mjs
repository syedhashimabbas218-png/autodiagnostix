// Product slugs that changed. The product page consults this only when a slug is
// not in the CMS, and redirects only if the target exists, so a live product is
// never shadowed and CMS renames and deploys can happen in either order.
const RENAMED_PRODUCTS = {
  // 2026-11-04 catalog replacement (see scripts/replace-new-products.mjs).
  'launch-x-431-pro-se': 'launch-x-431-pro-se-2026',
  // Reverse of the above, only used while the CMS still has the short slug.
  'launch-x-431-pro-se-2026': 'launch-x-431-pro-se',
  'gti-tools-catalytic-dpf-cleaner-orange-ai': 'gti-tools-catalytic-dpf-cleaner-c2025-ai',
  'gti-tools-catalytic-dpf-cleaner-blackred-hho-power-x': 'gti-tools-catalytic-dpf-cleaner-hho-power-x',
  // Duplicate of the existing VSP-600 entry.
  'launch-ismart-video400-videoscope': 'vsp-600-video-scope',
};

export function renamedProductSlug(slug) {
  return Object.hasOwn(RENAMED_PRODUCTS, slug) ? RENAMED_PRODUCTS[slug] : null;
}
