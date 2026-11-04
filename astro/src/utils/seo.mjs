import { excerpt } from './grid.mjs';

export const SITE_NAME = 'Autodiagnostix';
const TITLE_BUDGET = 60;

// Search results show roughly the first 60 characters of a title and already
// display the site name separately, so the " | Autodiagnostix" suffix is only
// added when it fits. The home page always keeps the brand.
export function pageTitle(title, { isHome = false } = {}) {
  const clean = String(title || '').trim();
  if (!clean) return `${SITE_NAME} | Launch, Smartsafe, UNITE Dealer in Pakistan`;
  if (clean.toLowerCase().includes(SITE_NAME.toLowerCase())) return clean;
  const branded = `${clean} | ${SITE_NAME}`;
  return isHome || branded.length <= TITLE_BUDGET ? branded : clean;
}

// Meta descriptions generated from CMS text (product summaries can exceed
// 1,000 characters) are cut at a word boundary to what search results show.
export function metaDescription(text, max = 158) {
  return excerpt(text, max);
}
