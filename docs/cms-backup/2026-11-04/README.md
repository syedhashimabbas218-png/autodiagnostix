# Strapi catalog backup (2026-11-04)

Read via the public REST API on 2026-11-04 (published versions; drafts were identical), before the 24 products created on 2026-11-04 with the `NEW` badge were removed and re-created.

- `products.json`: all 59 products with images, features, functions, specifications, brand and category relations
- `brands.json`, `categories.json`: brand and category records with their `documentId`s

The media files themselves are not included; their URLs are recorded in `products.json` under `heroImages[].image.url`.

## Replacement run (2026-11-04, ~20:00 UTC)

`astro/scripts/replace-new-products.mjs` deleted the 24 NEW-badge products from the 13:37 import, removed the 37 media files only they used, and re-created 24 products from `astro/scripts/data/catalog-2026-11/` (manufacturer pages where they exist, otherwise the AutoDiagnostix portfolio PDF). Order: dry run, a one-product canary (`launch-bst360-battery-tester`), then the full run. The other 35 products were not touched.

- `authenticated-before-replace-2026-11-04T20-00-32-674Z.json`: the script's own backup taken just before the canary, read with the API token, so it includes draft versions as well as published ones.
- Renamed or dropped slugs are redirected (301) in `astro/astro.config.mjs`.
