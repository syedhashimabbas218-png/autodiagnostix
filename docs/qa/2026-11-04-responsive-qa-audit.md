# Responsive pass and QA audit: issue list

Date: 2026-11-04. Scope: the production Astro app in `astro/` (live at https://www.autodiagnostix.com.pk), rendered locally against the live public CMS. The legacy `app/` SPA is not deployed and was not audited.

## Method

- **Pages:** all 97 sitemap URLs, plus `/products`, `/brand/gti-tools` (alias) and an unknown URL (404).
- **Representative templates:** home, about, contact, products, brands, brand, two categories, two products, two pillar pages, privacy and 404. Each was screenshotted (fold and full page) at all 11 required viewports: 360×640, 390×844, 414×896, 768×1024, 1024×768, 1280×720, 1366×768, 1440×900, 1536×864, 1920×1080 and 2560×1440.
- **Automated checks on every page** at 390, 1366 and 1920 widths:
  - horizontal overflow
  - console errors
  - failed requests
  - H1 count
  - heading order
  - missing alt text
  - unnamed controls
  - touch targets under 44px (on mobile)
  - duplicate titles and descriptions
- **Lighthouse 12** (mobile and desktop) on the live site.
- **Live checks** of HTTP behavior for forms, PDF, search, sitemap and robots.
- **Source review** of every template and component.

Browser coverage is Chromium only (Playwright). Safari, iOS and Firefox risks are covered by source review only (see "Cross-browser" below). No real devices were used.

### What passed

- No page-level horizontal scrolling at any tested width.
- No JavaScript console errors or failed asset requests, apart from the intentional 404 page.
- Exactly one H1 on every page.
- Every image has an `alt` attribute.
- Every icon button has an accessible name.
- Sitemap, canonical and favicon are working (from the previous SEO pass).
- Phone (`tel:`) and email (`mailto:`) links are well-formed.
- Search API returns results.

## Critical

| # | Page / area | Viewport | Problem |
|---|---|---|---|
| C1 | `/contact` form | All | The form posts to `/api/contact`, which does not exist. The live site returns 404 and a local POST is rejected with 403. **Every submission is lost.** There are no validation messages and no success or error state. |
| C2 | Every page using icons (`/contact`, `/about`, pillar pages) | Mobile | The Material Symbols stylesheet requests the full variable icon font: a **3.9 MB** woff2 to draw 14 icons. Live Lighthouse (mobile) on `/contact`: LCP **22.6 s**, Performance **55**. The stylesheet also renders ligature words such as "location_on" until the font arrives. |
| C3 | Home: "Diagnostic Intelligence" and "Maintenance Optimized" panels | All | The panels load `diagnostics-intelligence.png` (**6.1 MB**) and `adas-pro.png` (**1.9 MB**), even though WebP and AVIF versions are already in `public/images`. |
| C4 | Product "Technical Sheet" (`/api/product-pdf/:slug`) | All | Live response took 57 s, then 16 s, then failed with **500 after 76 s**. Each request launches a new Chromium. No caching. The raw error message is returned to the visitor, and the button shows no feedback while waiting. |

## High

| # | Page / area | Viewport | Problem |
|---|---|---|---|
| H1 | Header, all pages | 768–1439 | All category links sit behind the hamburger menu, including on 1280, 1366 and 1440 laptops. At 1440–1535 the full nav is crammed against the logo, with "Wheel Alignment" appearing twice (two different destinations). |
| H2 | `/product/*` hero | 1024–2560 (laptops worst) | The product image starts below the fold, behind the sticky action bar. A 300–1,000 character summary is centered at ~120 characters per line. On mobile, about 180px of empty space sits above the title. |
| H3 | Home hero | All | The tagline and highlighted word use `#97000d` on a 70% black overlay, a contrast of about 1.8:1 (fails WCAG AA). The small tagline is nearly invisible. |
| H4 | Header logo | All | `logo-full.webp` is 62% transparent padding, so the visible mark renders at about 100×21px. Hard to read on every screen. |
| H5 | Touch targets | Mobile | Targets under 44px: footer links (20px), social icons (20×20), breadcrumbs (16px), contact phone and email links (20px), filter chips (29px), catalog search box (34px), hero CTAs (40px), category tiles (40px), gallery arrows (40px), gallery dots and hero slide bars, and the search "ESC" button (20px). |
| H6 | Home category strip | 768–1919 | The category strip is a horizontal scroll row with a hidden scrollbar. At 1280–1536 the last category ("EV Equipment") is clipped at the edge with no affordance. On mobile, 7 items in 2 columns leave an orphan tile. "Lifts & Jacks" wraps onto three lines. |
| H7 | Focus visibility | All | The focus ring uses `currentColor`. It is invisible on white-text buttons over light surfaces (header CTA, Send Message, filter chips) and on the red CTA sections. There is no skip-to-content link. |
| H8 | Color contrast | All | Lighthouse fails contrast on: New Arrivals summaries (zinc-400), lifts tagline, footer 10px zinc-400 text (~2.5:1), filter chips, breadcrumb separators, and the category and brand descriptions. |
| H9 | Server response time | All, mobile worst | Every request re-fetches the catalog from Strapi with no caching. Live TTFB is 0.6–1.4 s, and mobile LCP is 3.4 s (home) and 3.8 s (products). |

## Medium

| # | Page / area | Viewport | Problem |
|---|---|---|---|
| M1 | Site-wide containers | 1366+ | The header, home and footer use a 1536px container, while catalog, contact, about, pillar pages and the product bar use 1280px. Left edges misalign by 11px at 1366 and 128px at 1920. |
| M2 | Home hero slide indicators | 1600+ | Indicators are pinned to the viewport edge (x=32) while the copy sits in the centered container (x=544 at 2560). |
| M3 | Home hero image | 1920+ | The source is only 1024×576 and is upscaled 2.5× on 2560 screens. See question Q5. |
| M4 | Product cards (products, category, home New Arrivals) | All | Summaries are cut mid-word with `substring()` (for example "featurin…", "strength of"). An ellipsis is appended even to short or empty text. A missing brand row misaligns titles across a row. |
| M5 | `/products` filter bar | Mobile, tablet | The sticky bar wraps to 2–3 rows (~110px). It sticks 8px below the 56px mobile header (`top-16`). The page heading takes about 45% of a 720px laptop fold. |
| M6 | Home "New Arrivals" heading | Mobile | Right-aligned by mistake (`items-end` on a column flex container). |
| M7 | Home "Heavy Duty Workshop Solutions" | All | The category list in the data is empty, leaving the heading over a blank gap of about 150px. |
| M8 | 18 pillar pages | All | The intro section has an unclosed `<div>` (and on 15 pages an unclosed `<p>`), which is invalid markup. |
| M9 | `/contact` info cards | 1024–1279 | Four narrow columns break email addresses mid-word ("autodiagnostix.co / m.pk"). |
| M10 | Footer | 768+ | One column has 13 links and the others have 5, which reads as unbalanced. Text is 10px at low contrast. |
| M11 | Home "Our Clients" grid | 640–1279 | 14 logos in 3-, 4- or 5-column grids leave ragged final rows. |
| M12 | Heading order | Products, home | 25 product pages jump from H1 to H3 (an H3 in the sticky bar). `/products` jumps H1 to H3. Home jumps H2 to H4. |
| M13 | CMS images | All | No `srcset` or `sizes`, although Strapi already generates 500/750/1000px variants. Lighthouse estimates 491 KiB savings on `/products`. |
| M14 | Header icons | All | The hamburger and close SVGs use JSX attribute names (`strokeWidth`) inside an `.astro` file, so they render at the default 1px stroke. |
| M15 | Product sticky action bar | Mobile | 96px tall. With the 56px header, that is 152px of fixed chrome on a 640px screen. |
| M16 | Breadcrumbs | Catalog, pillar pages | `<nav>` has no accessible name, and the separators are read aloud. |
| M17 | Home "Explore Our Range" and similar CTAs | 360–414 | Primary CTAs are 40px tall, and some uppercase 10px labels are hard to read. |

## Low

| # | Page / area | Problem |
|---|---|---|
| L1 | Pillar pages | The two adjacent "Delivery" and "Comparison" sections on pillar pages share one background, doubling the padding into a 160px gap. |
| L2 | `/brands` | Brand cards show a product photo rather than the brand logo. Logos exist in `/images/brands/`. |
| L3 | Social previews | `og-image.svg` is not rendered by Facebook, LinkedIn or WhatsApp. A 1200×630 raster image is needed. |
| L4 | Search modal | No visible close control on touch devices (only the small "ESC" key cap). |
| L5 | `robots.txt` | The Cloudflare-managed `Content-Signal` line costs 8 points in Lighthouse SEO (92). This is set at the edge, not in this repo. |

## Questions and design decisions for the owner (not changed)

| # | Question |
|---|---|
| Q1 | **Contact form destination.** No email or SMTP service, CRM, or WhatsApp number is configured. The interim fix hands the validated message to the visitor's email app, addressed to `info@autodiagnostix.com.pk` and `sales@autodiagnostix.com.pk`, with phone fallbacks. Should submissions go to (a) an email service such as Resend or SMTP, (b) a Strapi "Inquiry" collection, or (c) WhatsApp? Option (a) or (b) is a small follow-up once credentials exist. |
| Q2 | **WhatsApp.** The brief asks to test WhatsApp links, but the site has none. Which number is on WhatsApp Business? A floating click-to-chat button is a common lead driver in Pakistan. |
| Q3 | **Inconsistent business stats.** The home page says "15+ years, 500+ clients, 7+ brands, 30+ products". The About page says "50+ products, 6 brands, 8 categories". The CMS has 59 products, 6 brands and 7 categories. Which numbers are correct? |
| Q4 | **Punctuation artifacts.** Many titles and some copy contain " , " where an em dash was likely intended (for example "Scanners in Pakistan , Scanners Products"). These look like a bulk find-and-replace. Titles were kept because of the earlier SEO decision. Should they be corrected? |
| Q5 | **Hero imagery.** Only 1024px-wide hero images exist. Can higher-resolution originals (at least 1920px, ideally 2560px) be supplied? |
| Q6 | **CMS data.** Some products have no brand assigned (for example AUTOOL SPT360, and UNITE PL-FS40, which shows "Workshop"). Please assign them in Strapi. |
| Q7 | **Map.** The contact page links to Google Maps rather than embedding a map. An embed would add about 500 KB of third-party script. Keep the link (recommended) or embed? |
