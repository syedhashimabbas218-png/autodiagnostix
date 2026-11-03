# UX and engineering refinement — 2026-11-03

## Approved scope

Preserve the incumbent Astro UI, content, images, branding and dependencies. Repair verified responsive and keyboard defects in place, optimize redundant work and media loading, validate structured data, and add repeatable browser checks. No framework/design-system migration, production configuration changes, database writes or new external integrations. The existing modification to `app/scripts/prerender.mjs` was initially excluded; the user subsequently authorized its review and improvement (see follow-up below).

## Initial audit (before implementation)

Production identifies itself as Astro 6.4.8; `astro/` is the matching server-rendered frontend with React islands, Tailwind and GSAP. `app/` is a separate legacy React SPA. Strapi supplies catalogue data; PDF generation uses Puppeteer. Existing native anchors preserve browser navigation. Images largely use WebP and several components already reserve media aspect ratios.

| Severity | Finding | User impact / intended correction |
|---|---|---|
| High | Contact form POSTs to missing `/api/contact` | Messages cannot be delivered. Integration requires owner authorization; do not fake success or introduce a service. |
| High | Home exceeds 320px viewport (364px); footer exceeds 375px (392px) | Horizontal scrolling; fix intrinsic sizing/wrapping only where broken. |
| High | 768px header has 976px scroll width | Navigation/CTA clipped; retain existing mobile menu until full navigation fits. |
| High | Search has no dialog semantics, focus containment/restore, input label or stale-request cancellation | Keyboard escape/background interactions and wrong results; repair lifecycle and accessibility. |
| High | Home passes schema functions instead of calling them | Empty Organization and WebSite JSON-LD; call existing helpers without changing claims. |
| Medium | Header assigns class lists every scroll event | Redundant style recalculation; update only when threshold state changes, passive listener. |
| Medium | All homepage islands hydrate immediately | Noncritical JavaScript competes with hero; defer below-fold interactivity. |
| Medium | Hero loads all backgrounds eagerly; inactive slides remain focusable | Network contention and invisible keyboard targets. |
| Medium | Reveal/carousel effects ignore reduced motion | Motion-sensitive users cannot opt out. |
| Medium | Lift selectors are click-only and pending timers are not cleaned up | Keyboard inaccessible, rapid-click races. |
| Medium | Product bottom bar obscures footer and can overflow narrow screens | Reserve bottom space and repair compact-width sizing. |
| Medium | Two homepage links use nonexistent `*-in-pakistan` paths | Broken journeys; point to existing equivalent URLs, preserving destinations. |
| Medium | CMS fetches repeated serially; deployment `STRAPI_URL` ignored by helper | Latency and unreliable data resolution; reuse homepage data and support existing server environment variable. |

## Measurement protocol

`node scripts/ux-audit.mjs baseline` and `node scripts/ux-audit.mjs after` capture local screenshots and JSON for every static public Astro page plus representative catalogue routes at 320, 768 and 1440px; homepage additionally 375, 430, 600, 1024 and 1920px. Outputs are under `.playwright-mcp/ux-audit/` (local artifacts, not production assets). Production homepage baselines also captured at eight widths through browser tooling. Local tests use read-only public CMS data. No real contact submission or PDF load testing against production.

Performance scores must be reported only from measured production builds, not the development server. Lighthouse is lab data, not real-user INP or CrUX. Browser engine availability and incomplete checks must be stated explicitly.

## Implemented improvements

### Performance and code quality

- Homepage CMS work reduced from repeated serial catalogue/category fetches to three independent, parallel requests. Brand pages reuse their catalogue instead of refetching it.
- Listing/search callers opt into summary-only relation population. The measured public CMS response falls from **202,417 to 51,493 bytes** for the same **35 products** (74.6% reduction). Product detail and PDF population are unchanged.
- Below-fold homepage islands hydrate near the viewport, retaining server-rendered HTML and the existing animations. Below-fold media uses native lazy loading and asynchronous decoding where appropriate.
- The hero prioritizes the first image; other backgrounds load and decode on selection before the same crossfade. Hidden slides are inert and automatic rotation pauses for focus, hover, reduced motion and hidden tabs.
- Hero media reuses the repository's existing, same-dimension WebP variants. First-slide source is **18,166 bytes instead of 313,762 bytes**; no original assets were removed or overwritten. Visual comparison must verify the darkened hero rendering, not assume encoding equivalence.
- Header style updates occur only when crossing the existing scroll threshold, with a passive listener. Lift selection cancels obsolete timers and cleans up on unmount.
- Existing server-side `STRAPI_URL` is supported alongside `PUBLIC_STRAPI_URL`. Known public CMS media URLs are upgraded to HTTPS in code; no infrastructure configuration changed.
- Identical in-flight CMS queries share a promise, without persisting stale editorial data. JSON body parsing is awaited inside the error handler so a body timeout cannot bypass it. A local HTTP-fixture test verifies ten-way deduplication, malformed JSON, interrupted bodies and recovery on subsequent fresh reads.

### Responsiveness and UX

- The existing mobile menu is used below 1280px where the full category navigation cannot fit. Existing desktop presentation is retained at larger widths.
- Menu state is exposed through `aria-expanded`/`aria-controls`; Escape, outside clicks and breakpoint changes dismiss it. Its scroll region is bounded by the dynamic viewport, including short landscape screens.
- Footer legal/social links wrap only when necessary. The small-mobile hero title shrinks only below 374px; intrinsic sizing and minimum hero height prevent clipped content on narrow/short screens.
- Contact email addresses can wrap inside their existing cards. Inputs receive appropriate autofill hints.
- Product action bar receives safe-area clearance, compact-width padding and reserved document space so footer links remain accessible.
- Navigation CTAs use native anchors with unchanged labels/styles/destinations. This also repairs an Astro button using a React-only event handler. Two broken homepage paths now target existing equivalent pages.
- Product catalogue query URLs now actually initialize the existing search filter, including the existing structured-data search action.
- CMS brands with no assigned products now resolve to their existing brand page instead of a false 404. Existing descriptions come from the CMS; no new marketing copy was written.
- Normal-motion verification uncovered a baseline hero defect: primary CTAs remained translated and secondary CTAs remained at zero opacity after loading. Explicit GSAP start/end values restore the existing animation's intended final state, with the same timings, easing and stagger. Revealing the already-present secondary CTA is an intentional functional correction, not a redesign.

### Accessibility

- Search uses the browser's top-layer modal dialog, outside-background dismissal, Escape, explicit focus cycling/restoration, input labeling, loading announcements and an accessible close control. Visual overlay styling is retained.
- Search requests are debounced and cancelled on replacement/close; out-of-order responses cannot replace current results. Network errors produce feedback rather than stale results.
- Lift selectors and hero slide indicators are keyboard-operable with exposed state. Inactive slides cannot receive keyboard focus. Gallery rotation pauses for keyboard focus and reduced motion.
- Existing entrance effects honor reduced motion. Targeted CSS disables associated transitions for that preference without replacing normal animations.
- Added keyboard-visible outlines and larger invisible hit areas for search/slide controls, without changing resting layouts.

### Technical SEO

- Existing Organization and WebSite schema helpers are called rather than serialized as functions. JSON-LD serialization escapes `<` safely; existing schema types and claims are retained.
- The organization contact URL points to the existing contact route. Titles, descriptions, visible headings, URLs and page copy are unchanged.
- Invalid catalogue URLs render the existing error page with **404**, rather than redirecting to a soft-404 page. The existing 404 page is available to SSR rewrites and returns 404 itself. This was verified against a production build, not just development routing.

## Testing status and boundaries

- Initial and first optimized production builds both pass. A trial build outside `astro/` failed dependency resolution; the successful isolated builds remain inside `astro/.tmp/`. This was a local test-path issue, not a deployment change.
- First complete baseline and optimized passes: **29 routes / 92 viewport checks each**. Baseline: **59** overflow/header-clipping checks; optimized: **0**. Baseline malformed JSON-LD: all eight homepage sizes; optimized: **0**. Browser runtime errors: **0** in both completed sweeps.
- Chromium is available. Installed Edge is available. Firefox and WebKit executables are absent; actual Safari, iOS and Android devices have not been tested. Chromium viewport emulation is not equivalent to those platforms.
- The root lint command delegates to the **unchanged legacy `app/`**, not Astro. It fails with five pre-existing errors and one warning in `ProductGrid.jsx`, `AdminDashboard.jsx`, `BrandWrapper.jsx`, `CategoryWrapper.jsx`, and `ProductWrapper.jsx`. Those files were not edited. Astro has no configured lint script or installed Astro type-checker; the successful build is not a full type-check.
- Contact native validation is tested without submitting personal data. **Actual message delivery is not functional until an authorized backend integration is supplied.** No success response has been fabricated.
- Chromium and Edge each pass **13 interaction checks**, including normal-motion hero completion, menu/search/filter/lift/FAQ/gallery/back-navigation/native validation, using a fixed snapshot of the actual public CMS data. Integration link checking against the live CMS separately verifies **75 internal public destinations, with no redirect/error responses** after fixes. No authenticated admin operations, real contact submissions or external service writes were performed.
- Product PDF smoke test passes locally: HTTP 200, `application/pdf`, `%PDF-1.4`, 640,198 bytes. It uses the existing installed Chromium executable through the already-supported environment variable. Run the server from `astro/`, as deployment does: the existing PDF template resolves its logo relative to that working directory. Production container configuration was inspected, not modified.
- The mechanical UI detector found only two warnings about the incumbent Inter font. These are intentionally not acted upon: typography preservation overrides a generic aesthetic warning.

## Before/after performance (homepage lab tests)

These are **single Lighthouse runs** against unmodified and optimized local **production builds**, using the real public CMS, not the deterministic test snapshot. No scores are claimed for other pages. Network, CMS response time and local machine load vary; these are not guaranteed deployed scores or field data.

| Metric | Before mobile | Optimized mobile | Before desktop | Optimized desktop |
|---|---:|---:|---:|---:|
| Performance | 58 | 65 | 80 | 84 |
| Accessibility | 93 | 95 | 89 | 91 |
| Best Practices | 100 | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 | 100 |
| LCP | 10.1s | 4.4s | 2.1s | 2.0s |
| CLS | 0.000 | 0.004 | 0.008 | 0.008 |
| Total Blocking Time | 320ms | 430ms | 30ms | 70ms |
| Speed Index | 11.9s | 8.9s | 4.5s | 2.6s |

The original live homepage separately measured **54 / 93 / 77 / 100**, LCP 7.8s and CLS 0.000. Comparing that hosted measurement directly with localhost would conflate infrastructure and code changes, so the table uses local builds for both sides. The table uses the final animation/CMS-hardened production build, not a best-of-run selection. Earlier optimization passes measured 69 mobile and 87 desktop; the final run's mobile root response took 3.1s versus 1.63s in an earlier pass, illustrating the external CMS variability. Remeasure after deployment before accepting targets.

**Targets not fully met:** mobile LCP and both performance scores remain outside the requested targets; desktop accessibility remains below 95. TBT did not improve in these runs. INP/p75 field CWV were not available and were not inferred from TBT. Remaining bottlenecks include CMS/server latency, render-blocking font/CSS delivery, React/GSAP main-thread work and existing visual effects. Further optimization must not silently remove the pinned appearance or animations.

## Responsive and visual verification

| Coverage | Tested |
|---|---|
| 29 public route variants | 320, 768, 1440px |
| Homepage additional widths | 375, 430, 600, 1024, 1920px |
| Interaction landscape | 768 × 375px |
| Mobile interaction | 375 × 812px and 320 × 640px |
| Settled visual comparisons | All 29 route variants, each at 375 and 1440px (58 pairs) |

Routes include every public static page, all SEO pillar pages, legal pages, 404, homepage, products, brands, and representative category (`scanners`), brand (`launch`) and product (`919-max`) pages. The separate link sweep covers all discovered catalogue destinations, not screenshots of all 35 products.

The deterministic visual pass uses a frozen, read-only snapshot of the same public CMS data for both builds, scrolls through lazy content, and compares normalized main content without scripts/styles. **All 58 main-content comparisons matched.** Real-CMS concurrency exposed transient body-read timeouts, so those unstable screenshots are not accepted as proof of content changes. Screenshot pixel differences are inspected rather than blindly classified as design failures.

The animated homepage and catalogue were rechecked with normal motion and completed island hydration. Every desktop pair measured **less than 0.1%** changed pixels above a 16/255 per-channel threshold within shared image dimensions (homepage 0.0817%). All desktop page heights match except the intentional 96px product-action clearance. Mobile residual differences correspond primarily to footer wrapping, restored hero CTAs and action-bar clearance; the homepage mobile pair measured 0.9383%. This is a scoped regression comparison, not a claim that all binary image files are identical.

Intentional differences: narrow footer wrapping (including a 1px measured rounding/height change at 375px), existing mobile navigation at crowded tablet/laptop widths, small-mobile title fitting, focus-only outlines/hit areas, reduced-motion states, restored hero CTA end states, and 96px of bottom clearance on product pages (plus mobile safe area). The original images/branding remain; existing hero WebP encodings and normal browser rasterization can produce small pixel differences. No pixel-perfect or full WCAG-conformance claim is made.

### Reproduction and artifacts

- Audit: `node scripts/ux-audit.mjs <label>` with `AUDIT_URL` set to a running production build.
- Interactions: `node scripts/ux-interactions.mjs`, optionally `AUDIT_BROWSER=edge`.
- CMS helper unit test: `node scripts/ux-cms-test.mjs` (Node 24 used; native TypeScript stripping is experimental).
- Stable public fixture: `node scripts/ux-cms-snapshot.mjs capture`; launch a local test server with `node --import ../scripts/ux-cms-snapshot.mjs <server-entry>` from `astro/`. **Never use fixture-backed servers for Lighthouse scores or deployment.**
- Visual comparison: `node scripts/ux-visual-compare.mjs` with `BEFORE_URL` and `AFTER_URL`; `VISUAL_ROUTES=/,/products` can recheck animated routes.
- Link check: `node scripts/ux-links.mjs` with `AUDIT_URL` set to the real-CMS local build.
- Local screenshots, JSON results and the public CMS fixture: `.playwright-mcp/ux-audit/` (gitignored).
- Lighthouse raw JSON: `.playwright-mcp/baseline-build-mobile.json`, `final-check-mobile.json`, `baseline-build-desktop.json`, `final-check-desktop.json`, and `live-baseline-mobile.json`. Earlier intermediate reports are retained separately.

## Remaining recommendations requiring follow-up

1. **Contact delivery — high priority:** authorize and specify an existing mail/CRM service or backend handler. Then implement server validation, delivery, rate limiting, error feedback and duplicate-submission protection. Current `/api/contact` is absent.
2. **Infrastructure:** choose a single canonical hostname (`www` currently receives production traffic while existing canonicals use non-`www`), align redirects/canonicals/sitemaps after approval, and evaluate public page/CMS caching and compression. No deployment, CDN, database or service configuration was changed.
   The existing CMS fallback still yields an empty catalogue if the CMS is unavailable. In-flight deduplication and body-error handling reduce failure amplification, but do not replace a proper availability strategy. An explicit unavailable/stale-content policy and user-facing outage state should be agreed before changing that behavior across the site.
3. **Design/content approval:** low-contrast muted text and hero-before-main-heading order remain; achieving full WCAG AA would require changing pinned colors/opacity or existing heading structure. Do not silently make those design/content changes to chase a score.
4. **SEO claims:** review existing Product offers without prices and automatically generated modification dates with the content owner; do not invent prices, availability or update dates. Sitemap fetches currently cap products at 100 and categories at 50; implement pagination before exceeding those counts (current measured products: 35).
5. **Device QA:** test real iOS Safari/Android Chrome, text-only enlargement, screen readers and Firefox. Measure p75 real-user INP/LCP/CLS through an approved analytics setup or Search Console/CrUX access. Lab TBT is not INP.

## Authorized follow-up: legacy prerender reliability

The user's original `shell: process.platform === 'win32'` change correctly addressed Windows spawning of `npx`. With permission, the shell/child-process path has been replaced by the existing Vite programmatic preview API. It awaits actual server readiness, works cross-platform, enforces the requested port and closes in `finally`; there is no shell command to quote and no preview child tree to leak.

Additional fixes in `app/scripts/prerender.mjs`:

- Navigation, browser execution and catalogue API failures now fail the build; they are no longer swallowed or counted as successful HTML.
- Readiness checks require a rendered navigation/footer/heading, a nonempty title and the correct route canonical rather than a byte-count heuristic and arbitrary extra delay.
- All routes are captured before replacing any entry HTML. Failed capture leaves the original SPA entry intact; successful files are individually written via a temporary file and rename.
- Actual Payload filter syntax `where[id][equals]` is parsed correctly; mocked collection responses carry JSON/CORS headers.
- Duplicate routes are eliminated, invalid product IDs/output-directory traversal are rejected, and malformed catalogue arrays are reported.
- Missing legacy catalogue exports now produce a clear nonzero CLI exit. This repository has no `api/data/products.json`; provide a legacy-format export via `PRERENDER_DATA_DIR` when using the legacy build. No catalogue was invented or copied into a production data directory. The active Astro frontend does not use this script.
- The legacy sitemap generator reads the same optional catalogue directory, so pointing prerender at an export cannot silently leave its product/category/brand routes out of the sitemap.
- Regression coverage lives in `app/scripts/prerender.test.mjs`, including actual Chromium/Vite fixture captures, a rendering failure with no output replacement, port collision, cleanup after browser launch failure, data/filter validation and CLI exit status. Run with `node --test app/scripts/prerender.test.mjs`.

This follow-up does not change application UI, assets, metadata wording, Astro code, dependencies or deployment configuration. The existing legacy sitemap's `.com` hostname remains unchanged; it must not be confused with the `.com.pk` production Astro sitemap.

Validation: **11/11 regression tests pass** on Windows, including real Chromium/Vite fixture captures and sitemap/export consistency. The actual legacy Vite production bundle also builds successfully in an isolated temporary output directory, which was removed afterward. The full legacy build/prerender pipeline is intentionally not claimed successful without the missing real catalogue export. No change to the earlier Astro Lighthouse results is claimed from this build-tool follow-up.
