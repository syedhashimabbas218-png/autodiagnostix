---
goal: Fix Critical SEO Issues in Autodiagnostix SPA
version: 1.0
date_created: 2026-06-01
status: Planned
tags: seo, performance, ssr, metadata, structured-data
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan addresses the critical SEO deficiencies in the Autodiagnostix React SPA. The current implementation is a client-side-only Vite + React app with no SSR, no meta tags, no structured data, broken image alt attributes, and no sitemap. The plan is organized into independent phases to allow incremental delivery.

## 1. Requirements & Constraints

- **REQ-001**: Every page must have unique, descriptive `<title>` and `<meta name="description">` tags
- **REQ-002**: All product/category pages must have Open Graph (og:) and Twitter Card meta tags
- **REQ-003**: All images must use valid `alt` attributes (not `data-alt`)
- **REQ-004**: Google crawlers must be able to read full page content (requires SSR or prerendering)
- **REQ-005**: A `sitemap.xml` and `robots.txt` must be served
- **REQ-006**: Product, BreadcrumbList, and Organization JSON-LD structured data must be present on relevant pages
- **REQ-007**: Font loading must not block rendering
- **REQ-008**: The existing Express.js API must remain untouched (no backend changes)
- **CON-001**: The project must remain deployable without a Node.js server (static hosting compatible) — prerendering preferred over full Next.js migration
- **CON-002**: All phases must be independently deployable and testable

## 2. Implementation Steps

### Implementation Phase 1: SSR / Prerendering

- GOAL-001: Make page content readable by crawlers by prerendering the SPA to static HTML at build time. This avoids a full Next.js migration while solving the core SSR problem.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Install `@prerenderer/vite-plugin` in `app/` | | |
| TASK-002 | Configure `vite-plugin-prerender` in `app/vite.config.js` to prerender routes: `/`, `/products`, `/brands`, `/category/:id`, `/product/:id`, `/brand/:id` (use a routes list; dynamic routes will need a static path list from the API) | | |
| TASK-003 | Add a build step that fetches all product/category slugs from the Express API and generates the full route list for prerendering | | |
| TASK-004 | Verify prerendered output in `app/dist/` contains full HTML (head, body content, not just a shell) | | |
| TASK-005 | Add postbuild test: `grep -r '<title>' dist/` to confirm prerendered titles exist | | |

### Implementation Phase 2: Meta Tag Management

- GOAL-002: Dynamically inject unique `<title>`, `<meta name="description">`, OG, and Twitter Card tags per route using `react-helmet-async`.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Install `react-helmet-async` in `app/` | | |
| TASK-007 | Wrap `<App />` in `<HelmetProvider>` in `app/src/main.jsx` | | |
| TASK-008 | Create `app/src/components/SeoHead.jsx` component that accepts `{ title, description, ogImage, ogType }` and renders `<Helmet>` with: `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:type">`, `<meta name="twitter:card">`, `<meta name="twitter:title">`, `<meta name="twitter:description">` | | |
| TASK-009 | Add `<SeoHead>` to `HomePage.jsx` with brand-specific title + description | | |
| TASK-010 | Add `<SeoHead>` to `CategoryWrapper.jsx` (pass category name from API data) | | |
| TASK-011 | Add `<SeoHead>` to `ProductWrapper.jsx` (pass product name + description) | | |
| TASK-012 | Add `<SeoHead>` to `BrandsPage.jsx`, `BrandWrapper.jsx`, `AllProductsPage.jsx`, `AdminDashboard.jsx` | | |
| TASK-013 | Update `app/index.html` to remove hardcoded `<title>app</title>` and leave a generic fallback | | |

### Implementation Phase 3: Image Alt Attributes

- GOAL-003: Fix all invalid `data-alt` attributes to proper `alt` attributes across the entire codebase.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-014 | Search all `app/src/` `.jsx` files for `data-alt` occurrences and replace with `alt` | | |
| TASK-015 | Search all `.html` files in root (`category.html`, `product.html`, `screen.html`) for `data-alt` and replace with `alt` | | |
| TASK-016 | Verify no `data-alt` remains: `rg 'data-alt' --include='*.{jsx,html}'` returns empty | | |

### Implementation Phase 4: Structured Data (JSON-LD)

- GOAL-004: Add JSON-LD structured data for SEO rich results: Product, BreadcrumbList, Organization, and FAQ schemas.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-017 | Create `app/src/utils/schema.js` with helper functions: `productSchema(product)`, `breadcrumbListSchema(items)`, `organizationSchema()`, `faqPageSchema(faqs)` | | |
| TASK-018 | Add `<script type="application/ld+json">` via `<Helmet>` in `SeoHead.jsx` or per-page — inject `Organization` schema on homepage, `BreadcrumbList` on category/product pages, `Product` schema on product pages | | |
| TASK-019 | Add Organization JSON-LD to `HomePage.jsx` (name: "Autodiagnostix", url, logo) | | |
| TASK-020 | Add BreadcrumbList JSON-LD to `CategoryWrapper.jsx` and `ProductWrapper.jsx` | | |
| TASK-021 | Add Product JSON-LD to `ProductWrapper.jsx` (name, description, image, sku, brand, offers) | | |

### Implementation Phase 5: Sitemap & Robots

- GOAL-005: Generate `sitemap.xml` and `robots.txt` so search engines can discover and index all pages.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-022 | Create build-time script `app/scripts/generate-sitemap.mjs` that: fetches all products/categories from API, builds a URL list with `lastmod` dates, writes `sitemap.xml` to `app/dist/` | | |
| TASK-023 | Create `app/public/robots.txt` with: `User-agent: *`, `Allow: /`, `Sitemap: https://autodiagnostix.com/sitemap.xml` | | |
| TASK-024 | Wire the sitemap generation script into `app/package.json` build script: `"build": "vite build && node scripts/generate-sitemap.mjs"` | | |

### Implementation Phase 6: Performance & Font Optimization

- GOAL-006: Optimize Google Fonts loading and third-party resource delivery for Core Web Vitals.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-025 | Replace Google Fonts `@import` in `app/index.html` with `<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` + `<link href="...&display=swap" rel="stylesheet">` with `display=swap` | | |
| TASK-026 | Add `loading="lazy"` to all below-fold `<img>` elements in page components | | |
| TASK-027 | Add `width` and `height` attributes to all `<img>` elements to prevent CLS | | |
| TASK-028 | Add `<link rel="canonical" href="...">` to `SeoHead.jsx` | | |

## 3. Alternatives

- **ALT-001 (Full Next.js migration)**: Considered migrating to Next.js for built-in SSR/SSG. Rejected due to rewrite scope — prerendering achieves 90% of the benefit at ~10% of the cost.
- **ALT-002 (Prerender.io / SaaS middleware)**: Considered using a third-party prerendering service. Rejected because build-time prerendering is free, has no runtime dependency, and works with static hosting.
- **ALT-003 (react-helmet over react-helmet-async)**: `react-helmet` is unmaintained. `react-helmet-async` is the active fork with better concurrent rendering support.

## 4. Dependencies

- **DEP-001**: `@prerenderer/vite-plugin` (or `vite-plugin-prerender`) for build-time prerendering
- **DEP-002**: `react-helmet-async` for dynamic head management
- **DEP-003**: Express API must be running during build for sitemap generation and prerendering (to resolve dynamic routes)

## 5. Files

- **FILE-001**: `app/vite.config.js` — add prerender plugin config
- **FILE-002**: `app/src/main.jsx` — wrap with HelmetProvider
- **FILE-003**: `app/src/components/SeoHead.jsx` — new file for meta tag component
- **FILE-004**: `app/src/utils/schema.js` — new file for JSON-LD helpers
- **FILE-005**: `app/src/pages/HomePage.jsx` — add SeoHead + Organization schema
- **FILE-006**: `app/src/pages/CategoryWrapper.jsx` — add SeoHead + BreadcrumbList
- **FILE-007**: `app/src/pages/ProductWrapper.jsx` — add SeoHead + Product + BreadcrumbList
- **FILE-008**: `app/src/pages/BrandsPage.jsx` — add SeoHead
- **FILE-009**: `app/src/pages/BrandWrapper.jsx` — add SeoHead
- **FILE-010**: `app/src/pages/AllProductsPage.jsx` — add SeoHead
- **FILE-011**: `app/src/pages/AdminDashboard.jsx` — add SeoHead
- **FILE-012**: `app/index.html` — update title fallback, optimize font loading
- **FILE-013**: `app/public/robots.txt` — new file
- **FILE-014**: `app/scripts/generate-sitemap.mjs` — new file
- **FILE-015**: `app/package.json` — update build script
- **FILE-016**: `category.html` — fix data-alt → alt
- **FILE-017**: `product.html` — fix data-alt → alt
- **FILE-018**: `screen.html` — fix data-alt → alt (if exists)

## 6. Testing

- **TEST-001**: `npm run build` must succeed and produce HTML files with prerendered content (not just a JS shell)
- **TEST-002**: Each prerendered HTML file must contain unique `<title>` matching the page
- **TEST-003**: `rg 'data-alt' --include='*.{jsx,html}'` returns no matches
- **TEST-004**: `sitemap.xml` exists in `dist/` and contains valid XML with all expected URLs
- **TEST-005**: `robots.txt` exists in `dist/` and references the sitemap
- **TEST-006**: JSON-LD blocks render correctly — validate with `grep -c 'application/ld+json' dist/*.html`
- **TEST-007**: All pages render correctly in browser after build (visual regression check)
- **TEST-008**: Lighthouse SEO score >= 90 on all page types

## 7. Risks & Assumptions

- **RISK-001**: Prerendering dynamic routes (`/product/:id`) requires the API to be running at build time. If the API is down, those pages won't be prerendered. Mitigation: fail the build gracefully and log warnings for missing routes.
- **RISK-002**: The `@prerenderer/vite-plugin` may not support Vite 8 yet (project uses Vite 8.0.1). Mitigation: check compatibility before implementation; fallback to `vite-plugin-ssr` or a postbuild Puppeteer/Playwright script.
- **ASSUMPTION-001**: The Express API (`api/index.js`) returns a list of all product/category slugs at predictable endpoints.
- **ASSUMPTION-002**: The site will be hosted on a static file server or CDN that serves `robots.txt` and `sitemap.xml` from the root.

## 8. Related Specifications / Further Reading

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [JSON-LD Product Schema](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Vite Prerender Plugin](https://github.com/StarpTech/prerenderer)
- [react-helmet-async](https://github.com/staylor/react-helmet-async)
- [Core Web Vitals - Font Optimization](https://web.dev/font-best-practices/)
