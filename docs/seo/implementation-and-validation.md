# AutoDiagnostix technical SEO implementation and validation

Date: 2026-11-03. Status: **implemented and locally tested; not deployed**.

Follow-up: [2026-11-04 responsive, favicon and catalog fixes](2026-11-04-responsive-favicon-and-catalog-fixes.md) adds the approved laptop pass, restores AX favicons, and resolves the general catalog pagination/outage deferrals below. It contains the latest test results.

Scope authorized after review of the [baseline audit](2026-11-03-audit-and-implementation-proposal.md) and [keyword ownership matrix](keyword-ownership.md). This is a conservative technical patch, not a content/targeting migration.

## A. Technical fixes

### Canonicals and metadata URLs

- `astro/src/utils/site.mjs` is the shared production hostname policy: `https://www.autodiagnostix.com.pk`.
- `BaseLayout.astro` normalizes every existing canonical prop, canonicalizes the current pathname if needed, and uses that same URL for `og:url`. Query parameters and fragments are excluded from canonicals; root retains `/` and other paths omit trailing slashes.
- JSON-LD site-owned absolute URLs and social-image URLs are normalized without rewriting external manufacturer, media or sister-site hosts. Entity fragments and the existing search action template are preserved.
- No new redirect rules or paths. No cross-domain canonicalization. No change to existing noindex decisions.
- No page titles, descriptions or visible copy were rewritten. A comparison against the public baseline confirmed identical titles, meta descriptions and H1 text across all 74 discovered successful paths, including the non-sitemap GTI alias.

### Sitemap

- Existing `/sitemap-index.xml` and `/sitemap-0.xml` URLs are retained, now served by Astro endpoints instead of a CMS-dependent build hook.
- Reason: the Dockerfile builds the application before runtime CMS connectivity is necessarily available. Runtime generation prevents a successful build from silently publishing a sitemap missing the catalog. It also reflects newly published products without requiring another frontend build.
- Products, categories and brands are read through paginated public CMS requests with timeouts. Product brand arrays and object relations are both supported. Published brands without assigned products can be included through their actual CMS routes.
- The same established brand-slug normalization is shared with the catalog. `/brand/gtitools` remains canonical; `/brand/gti-tools` is not added to the sitemap or redirected.
- Local catalog result: **73 unique canonical URLs: 25 core pages, seven categories, 35 products, six canonical brand pages**. The previous live sitemap had 32 entries on the redirecting hostname.
- Successful sitemap results are cached for five minutes, and concurrent generation requests share one fetch operation. A failed/empty/invalid CMS catalog produces HTTP 503, `Retry-After: 60`, and `Cache-Control: no-store`, not a partial successful sitemap.
- No guessed modification dates, priorities or change frequencies were added. No API/admin/search/filter/404/alias URLs are listed.
- This single sitemap is appropriate for the current catalog. Before approaching the sitemap protocol's 50,000-URL or 50-MB limits, split it into additional child sitemaps; it is not an unlimited catalog implementation.

### Origin robots

- Sitemap reference updated to the existing HTTPS www hostname.
- Existing admin/API restrictions remain. GPTBot and Claude-Web origin exceptions now deny access, consistent with the observed restrictive live edge policy rather than accidentally allowing training through the origin. PerplexityBot inherits the wildcard public-search rules, including private-path restrictions.
- Cloudflare/WAF settings were **not changed**. The live edge may replace rather than merge the repository's robots file; the sitemap reference and private-path exclusions must be verified after deployment. The origin patch alone cannot fix an edge-generated response.

## B. Keyword ownership and sister-site protection

- LAUNCH-specific commercial/model expertise remains provisionally assigned to Launch X431; generic workshop equipment, lifts, tyre service and multi-brand procurement remain AutoDiagnostix priorities.
- No title/description targeting changes were introduced, including the AutoDiagnostix LAUNCH pillar that already receives traffic.
- All 20 overlapping product pairs remain available. No LAUNCH page was deleted, redirected, deindexed or cross-domain canonicalized.
- No sister-site code, links, metadata, infrastructure, sitemap, robots or Search Console submissions were modified. No new cross-domain links were added.

## C. Structured data fixes

- Product markup keeps real name, visible summary, images, catalog category and supplied brand relations. Multiple real brand values are represented as separate Brand objects rather than a joined fictional brand name.
- Removed automatic Offer, InStock, NewCondition, fixed price expiry and slug-as-SKU assertions. A CMS-only price does not become a hidden public offer. No reviews/ratings were manufactured.
- Added stable, canonical Product URL and `#product` identity. Relative product images become absolute URLs.
- Commercial-page Article helper/callers now use WebPage, connected to a stable WebSite entity ID. Actual article metadata is conditional on article page type and explicitly supplied dates.
- Removed global fake publication dates and runtime-derived modification dates from metadata and Product/ItemList markup.
- Corrected CollectionPage → mainEntity → ItemList nesting and canonicalized breadcrumb/list URLs.
- Removed the manufacturer's self-referential `sameAs` assertion pointing at its dealer collection. Did not add speculative manufacturer URLs or legal relationships.
- Existing business details and legal/business claims have not been expanded or independently certified. Founding year, hours, map pin, social identities and dealer relationships still require owner review as documented in the baseline.

**Rich-result limitation:** quote-only Product markup without an actual Offer/review/rating may be ineligible for Google's product rich results. That is intentional; do not reintroduce false prices or stock information to suppress eligibility warnings.

## D. AEO improvements

- Product technical specifications now use native `dl`/`dt`/`dd` semantics, retaining the exact layout classes, values and appearance.
- Category and brand product headings use H2 instead of skipping from H1 to H3, retaining identical styling.
- Product/category relationships retain the actual CMS category slug. Structured-data breadcrumbs and category filtering prefer that slug over a guessed slug from a display name. Products without a category fall back to the real `/products` breadcrumb destination.
- Existing server-rendered summaries, specifications, features and product links remain accessible in initial HTML. No hidden AI text or new FAQ answers were inserted.

## E. GEO improvements

- Consistent AutoDiagnostix entity URLs across metadata, WebSite, WebPage, Product and breadcrumbs.
- Reduced misleading commercial/identity assertions: fictional offer defaults, artificial freshness and self-referential manufacturer sameAs were removed.
- No llms.txt, AI-only markup, fake authority signals or blanket crawler permissions were added. Existing externally controlled training restrictions remain in place.
- Missing catalog brand assignments were not guessed. For example, SPT360's manufacturer relation should be corrected in the CMS only after owner verification.

## F. Validation results

| Check | Result |
|---|---|
| `npm run build` in `astro/`, without CMS build connectivity | Pass |
| `npm run test:seo` | 20 tests passed |
| `npm run verify:seo` against a local production build with read-only public CMS data | 73 sitemap pages checked; zero failures |
| Sitemap catalog coverage | 35 products, seven categories, six canonical brands; all listed destinations returned 200 locally |
| Canonical/OG/indexability/one H1/title/description/JSON parsing checks | Pass on all 73 sitemap pages |
| Original title/description/H1 comparison | Unchanged on all 74 discovered paths, including GTI alias |
| Unknown product/category/brand/general URLs | Actual 404 responses retained |
| Product quote-only schema | No invented Offer, SKU, reviews or dateModified |
| Query URL | `/products?q=lift&utm_source=seo-check` keeps canonical `/products` |
| GTI alias | Both routes retained; alias canonical points to legacy `/brand/gtitools` |
| Outage simulation (CMS URL on a closed local port) | Sitemap 503; Retry-After 60; no-store; no partial XML |
| Desktop/mobile product and category DOM text and heading geometry | Identical to pre-change snapshots |
| Desktop/mobile full-page screenshots | Zero site-pixel differences outside Astro's development-toolbar overlay; baseline was dev mode, final was production mode |
| Mobile menu open/Escape close and quote link | Pass |
| Native product specification terms/definitions | Matching dt/dd counts; pass |
| Schema Markup Validator, locally generated PRO3 LINK Product + BreadcrumbList code | Two items; zero errors and zero warnings |
| Google Rich Results Test, same code sample | Breadcrumb valid; Product snippet ineligible (quote-only data has no Offer/review/rating) |
| `git diff --check` | Pass |

Screenshot viewports: 1280×900 desktop and 390×844 mobile. Product sample: `/product/x-431-pro3-link`; category sample: `/category/wheel-alignment`. Development-mode toolbar pixels are not the production website and were excluded explicitly; no claim of raw byte-identical dev-vs-production screenshots is made. Local artifacts are in `astro/.tmp/seo-before/` and `astro/.tmp/seo-after/` and are intentionally not tracked.

An intermediate comparison using an incorrectly decoded HTTP response string reported apparent metadata mismatches. Repeating the comparison on raw response bytes resolved those encoding artifacts: all 74 titles/descriptions/H1s matched. Another initial browser launch failed because Puppeteer's bundled Chrome was absent; validation used the installed Chrome executable. Neither issue required application changes.

External code validation was performed on the generated PRO3 LINK Product and BreadcrumbList sample. Schema Markup Validator detected two items with **zero errors and zero warnings**. [Google Rich Results Test result](https://search.google.com/test/rich-results/result?id=4M_VDdGGUCc_SCkc_RpK8A&hl=en) detected a valid Breadcrumb and an ineligible Product snippet, as expected for quote-only data without offers, reviews or aggregate ratings. Its exact Product eligibility message was: `Either "offers", "review", or "aggregateRating" should be specified`. Do not suppress that limitation with invented commercial data. Schema.org vocabulary validity and Google eligibility are different tests. This is not a claim that every page/schema type was externally certified or that a deployed URL was tested. Rerun both tools against deployed examples after release. Previous GSC inspections remain baseline-only.

Local external-validation screenshot: `astro/.tmp/seo-after/schema-validator-product.png`. The first external-validator attempt through a separate local Chrome session did not load the expected form; the connected browser loaded it successfully and supplied the recorded result.

## G. Reproducing checks

From `astro/`:

```powershell
npm run test:seo
npm run build

# Terminal 1: use the actual deployment CMS URL; do not use a token-bearing URL.
$env:PUBLIC_STRAPI_URL='https://strapi.autodiagnostix.com.pk'
$env:HOST='127.0.0.1'
$env:PORT='4322'
node dist/server/entry.mjs

# Terminal 2:
$env:SEO_BASE_URL='http://127.0.0.1:4322'
# Only needed if Puppeteer's bundled Chrome is unavailable:
$env:PUPPETEER_EXECUTABLE_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run verify:seo
```

The integration script is read-only. It checks initial HTML without executing page scripts for SEO assertions and does not submit sitemaps, request indexing or mutate CMS content. Test base URL and browser executable are configurable; the production hostname policy is intentionally fixed to the already-approved live hostname, not a request Host header.

## H. Deployment and outstanding work

1. Deploy the updated **Astro** application through the existing process; no deploy, push or production configuration change was performed in this task.
2. Confirm runtime `PUBLIC_STRAPI_URL` or `STRAPI_URL` resolves to the production CMS. The catalog/sitemap share that value, and home-page brand media fetching uses it too. Build-time values remain a fallback; no secrets are required for public catalog reads.
3. Verify the reverse proxy routes `/sitemap-index.xml` and `/sitemap-0.xml` to Astro and does not serve an old static sitemap. Purge existing cached sitemap/metadata responses through the authorized deployment procedure if needed.
4. Check live robots after Cloudflare processing: correct sitemap line, retained admin/API exclusions and the intended separation of search vs training policy. This may require an authorized Cloudflare configuration adjustment; it was not attempted here.
5. Validate deployed example markup externally. Reinspect a small priority URL set read-only in GSC after Google recrawls. Existing sitemap URL is retained; no property submissions were performed.
6. Retry field performance measurements when PageSpeed/CrUX access is available. No LCP/INP/CLS improvement is claimed.
7. Obtain sister-site GSC/analytics baselines before medium-risk targeting decisions. Continue the baseline report's 7/14/28-day monitoring plan.

### Deliberately deferred

- Visible FAQ/copy/title changes, commercial claims, manufacturer assignments, legal ownership/schema relationships, city pages and new cross-domain links require evidence and separate approval.
- General catalog CMS-failure status handling was initially deferred; it is now resolved by the separately approved follow-up, with retryable 503 responses and retained genuine 404 behavior.
- General catalog listing pagination was initially deferred; the follow-up now removes the 100-product/50-category caps and tests larger collections. The current public catalog still has 35 products/seven categories.
- No effort was made to repair sister-site broken links or metadata.

## I. Monitoring and outcomes

Baseline remains 348 clicks / 5,898 impressions for 2026-10-04–2026-10-31, all-country Web data from AutoDiagnostix's GSC domain property. Launch X431 performance, organic leads, revenue and AI referrals remain unavailable.

No deployment or post-change traffic/ranking/AI-citation measurement has occurred. Use the baseline and ownership matrix to evaluate both properties after deployment; do not attribute every ranking movement to this patch.
