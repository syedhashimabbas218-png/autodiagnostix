# AutoDiagnostix SEO, AEO and GEO audit

Date: 2026-11-03 UTC. Status: **baseline audit and proposed implementation; application changes not yet made**.

This document preserves the pre-change baseline. The subsequently approved fixes and their validation are recorded in [implementation-and-validation.md](implementation-and-validation.md).

## Executive decision

Prioritize technical accuracy and preserve existing traffic. Do not rewrite visible copy, change titles, consolidate landing pages, change product URLs, or alter Launch X431. The evidence supports correcting AutoDiagnostix's canonical signals to its **existing HTTPS www delivery hostname**, restoring product/brand sitemap coverage, and removing unsupported schema assertions. These are not reasons to deindex LAUNCH products.

The keyword ownership matrix is in [keyword-ownership.md](keyword-ownership.md). The route inventory and overlap pairs are in [route-inventory.md](route-inventory.md). Read both before implementation.

## Scope and limitations

- Audited the Astro application in `astro/`; the live site's Astro generator and rendered output match this application. Root npm commands target the older `app/` application, so implementation/build validation must explicitly target `astro/`.
- Read-only public crawl: 107 AutoDiagnostix URL requests, 106 final 200 responses and one 404; 74 distinct successful paths after hostname normalization. The 107 count includes redirecting non-www sitemap URLs and their www equivalents, not 107 independent pages.
- AutoDiagnostix inventory: 32 core/category/pillar pages, 35 products, seven brand routes (including a GTI alias). No URLs remained in the discovered crawl queue. This does not prove there are no unlinked CMS products or undisclosed routes.
- Sister-site crawl: 43 HTML URL requests, including variants and two 404s. Its sitemap processing additionally encountered 93 image URLs; these are media, not pages, and are excluded from the HTML inventory. No discovered queue remained. All access was read-only.
- Crawl started from each public sitemap and home page and followed same-site HTML links with three concurrent requests. Query strings, admin routes, API routes, downloads and media were not recursively crawled. Selected URL variations and unknown routes were tested separately.
- Parsed raw HTML including JSON-LD, then checked the live PRO3 LINK page in a JavaScript-enabled browser. Browser coverage is representative, not an exhaustive rendered crawl of every URL.
- Connected Search Console account lists `sc-domain:autodiagnostix.com.pk`, but not Launch X431. No sister-site search performance is available. Its claimed strong rankings are business context, not independently measured findings.
- No analytics/conversion data was queried. No credible organic-lead, revenue, or AI-referral baseline is available from this audit.
- PageSpeed Insights returned HTTP 429 (API daily quota exceeded). No LCP/INP/CLS field or lab result is claimed. No infrastructure or WAF changes were made.
- Initial Code Mode HTTP probes obscured redirect statuses. Findings below use native HTTP GET/HEAD and Search Console inspection instead; do not rely on the initial apparent 200s for hostname variants.

## A. Technical audit

| Finding / evidence | Affected URLs or source | Severity | Proposed remedy / authorization |
|---|---|---|---|
| Non-www HTTPS returns 301 to www, but canonical, OG, JSON-LD and sitemap URLs predominantly use non-www. Google-selected canonicals are www on all inspected indexable pages. | Sitewide; `astro.config.mjs`, `BaseLayout.astro`, `utils/schema.ts`, page frontmatter | High | Align signals to the existing `https://www.autodiagnostix.com.pk` host. Do not reverse redirects or migrate paths. Check all absolute URLs, not just the layout. |
| All 32 live sitemap entries use redirecting non-www URLs. No product or brand entries are present. | `/sitemap-index.xml`, `/sitemap-0.xml` | High | Generate canonical, successful, indexable product/category/brand entries; no artificial lastmod. See sitemap design below. |
| Sitemap CMS fetching silently returns an incomplete sitemap on failure; products are capped at 100 and categories at 50. Brand handling assumes `p.brand.name` although runtime code supports brand arrays. | `astro/astro.config.mjs:10-68` | High | Paginate; support actual relation shapes; use the same brand slug policy as rendered pages; surface errors instead of silently accepting an incomplete production artifact. |
| Every product receives an Offer, InStock, NewCondition and a fixed 2027-12-31 price expiry even without a public price or known inventory. Google reports missing-price errors for PRO3 LINK. | All `/product/*`; `utils/schema.ts:44-81` | High | Keep accurate Product data. Omit Offer for quote-only products. Do not substitute zero or invent ratings. Only expose commercial facts supported by visible, verified data. |
| URL slug is presented as SKU without a dedicated verified SKU source. Multiple brand names can be joined into a single manufactured Brand value. AUTOOL SPT360 currently has no schema brand. | Product normalizer and Product schema | Medium | Omit unverified SKU; retain actual brand entities separately where source data supports them. Do not guess a missing manufacturer from a slug. Business/CMS verification needed for missing brand assignment. |
| Render-time dates impersonate editorial modifications; 2024-01-01 publication date is supplied globally without supporting evidence. | BaseLayout, Product/ItemList/Article helpers | Medium | Remove invented defaults; only emit supported timestamps. Product and ItemList are not generic CreativeWorks for dateModified use. |
| Home/commercial landing pages emit Article markup and article metadata despite commercial purpose. | Home and equipment pillar pages | Medium | Use WebPage/CollectionPage where appropriate; reserve Article for real editorial content. No visible content changes required. |
| CollectionPage helper puts itemListElement directly on CollectionPage rather than nesting a genuine ItemList. | `/products`; `itemListSchema(..., 'CollectionPage')` | Medium | Model CollectionPage.mainEntity as ItemList. Preserve product links and list order. |
| A manufacturer Brand's sameAs refers back to the dealer's own brand listing. This does not establish manufacturer identity. | `/brand/*`; `brandSchema` | Medium | Omit self-referential identity assertion; only add verified manufacturer sameAs URLs. No claim that the dealer is the manufacturer. |
| GTI alias routes share title/content and canonicalize to legacy `/brand/gtitools` (itself currently on the wrong host). That legacy path has measured traffic. | `/brand/gti-tools`, `/brand/gtitools` | Medium | Preserve both routes and existing legacy canonical path initially. List only canonical `/brand/gtitools` in sitemap. No redirect/new URL policy without approval. |
| Product-to-category matching and breadcrumbs infer slugs from names instead of retaining CMS relationship slugs. This can fail when a display name and slug differ. | Dynamic product/category templates and Strapi normalizer | Medium | Verify all relationships; retain authoritative category slug internally if needed. Do not invent category routes or alter the approved visible label. |
| CMS fetch errors become empty arrays; a product lookup outage becomes a 404 and collection pages can appear empty with 200. | `lib/strapi.ts:79-95`, product/category/brand templates | Medium | Separate true not-found from upstream failure; propose retryable 503/Retry-After for outages without replacing the existing UI. Failure behavior needs focused tests before adoption. |
| Live Cloudflare robots output differs materially from repository robots. Live file has Content-Signal training restrictions and training-bot blocks; no sitemap line was present in the fetched live response. Repository explicitly allows GPTBot and Claude-Web. | Live `/robots.txt` vs `astro/public/robots.txt` | High governance / medium discovery | Do not overwrite policy or permit training bots. Reconcile edge/origin ownership and retain business training restrictions. Add a correct sitemap reference only after confirming which layer owns output. |
| Cloudflare email-protection URL returns 404 to a non-JS crawl. | `/cdn-cgi/l/email-protection` linked from contact/privacy/terms | Low / investigate | Not a product 404 or evidence the contact form fails. Verify hydrated email links and crawlable contact details before changing edge obfuscation. |
| Heading levels skip from section H1 to product-card H3 on category/brand collections. | Dynamic category/brand templates | Low | Can adjust element semantics while retaining exact styling; no copy/layout rewrite. One H1 is already present on all discovered successful AutoDiagnostix paths. |
| Default social image is SVG; some social platforms do not reliably support SVG previews. | `BaseLayout.astro`, `/og-image.svg` | Low / proposal | Check real previews and availability of an approved raster equivalent. Do not generate or replace imagery without approval. |

### Positive findings

- No missing title or description was found on the 74 successful AutoDiagnostix paths. There is no evidence for a blanket metadata rewrite.
- No JSON parse errors were found in extracted AutoDiagnostix JSON-LD. Syntactic JSON validity is **not** vocabulary validation or Google rich-result eligibility.
- All crawled AutoDiagnostix pages had image alt attributes. Attribute presence does not establish that every description is useful or accurate.
- Product summaries, features and technical specification values are in initial server HTML. The app already uses server rendering; a wholesale SSR migration is unnecessary.
- Product, category, brand and generic unknown-path probes each returned actual 404 responses, not 200 soft-404s.
- HTTPS www `/products/` returns 301 to `/products`. Preserve that trailing-slash policy.
- `/products?q=lift` returns 200 with canonical `/products`; preserve current query indexation behavior pending search-rendering review. Do not automatically noindex parameter URLs.
- `/api/search` has existing `X-Robots-Tag: noindex` in source. Existing `/admin` and `/api/` origin restrictions should be preserved when reconciling robots policy.

### Hostname evidence

| Request | First response |
|---|---|
| `http://autodiagnostix.com.pk/` | 301 → `https://autodiagnostix.com.pk/` |
| `http://www.autodiagnostix.com.pk/` | 301 → `https://www.autodiagnostix.com.pk/` |
| `https://autodiagnostix.com.pk/` | 301 → `https://www.autodiagnostix.com.pk/` |
| `https://www.autodiagnostix.com.pk/` | 200 |

The HTTP bare-host route has two hops. Collapsing that chain is an infrastructure recommendation, **not authorized domain-wide redirect work**. Correcting metadata to the already-served www hostname does not require changing these redirects.

### Search Console inspection evidence

- [www home inspection](https://search.google.com/search-console/inspect?resource_id=sc-domain:autodiagnostix.com.pk&id=h6ZVnvHKzjG-Po8JtfaUDg): submitted/indexed, fetch successful, Google canonical www, declared canonical non-www; last crawl 2026-11-02.
- [non-www home inspection](https://search.google.com/search-console/inspect?resource_id=sc-domain:autodiagnostix.com.pk&id=9DgVqD6Jj0BWu5dT5Rbk9w): page with redirect; Google canonical www.
- [PRO3 LINK inspection](https://search.google.com/search-console/inspect?resource_id=sc-domain:autodiagnostix.com.pk&id=k4cyVB8NlnUZ9KAQXh_I2w): indexed; Product snippets and Merchant listings FAIL due to missing price. Missing reviews/ratings are warnings, not permission to fabricate them. Breadcrumb detected.
- [wheel alignment inspection](https://search.google.com/search-console/inspect?resource_id=sc-domain:autodiagnostix.com.pk&id=LpxNV4RNwku8uVD8X5N27Q): submitted/indexed, fetch successful, breadcrumb rich-result verdict PASS; last crawl 2026-11-03.

Inspection results describe Google's stored crawl, not a live validation of proposed code. The mobile-usability verdict was unspecified; do not label it a pass.

## B. Keyword ownership and overlap

See [the complete ownership matrix](keyword-ownership.md). Principal decisions:

1. LAUNCH-specific expertise, scanner pricing and exact-model commercial intent remain provisionally owned by Launch X431, subject to its missing GSC baseline.
2. Existing AutoDiagnostix car-lift, wheel-alignment, tyre-service, workshop procurement and multi-brand intent is supported by actual clicks. Strengthen existing pages instead of cloning keyword variants.
3. Twenty matching product slugs exist on both domains. This establishes catalog overlap, not proven ranking harm. PRO3 LINK introductory product text is substantially shared; model facts may legitimately match. A full paragraph-level duplication percentage was not calculated.
4. AutoDiagnostix `/launch-x431-pakistan` earned 20 clicks and 459 impressions in the latest baseline. Do not remove, retarget, redirect, or deindex it just to implement a theoretical ownership map.
5. LAUNCH-branded wheel-service and lift queries belong primarily to Launch X431 when the query explicitly selects that manufacturer; generic equipment comparison/procurement intent belongs to AutoDiagnostix. SMARTSAFE/LAUNCH co-branded models require verified source attribution, not automatic brand exclusivity.

## C. SEO implementation status and design

**Implemented application changes: none.** Only this audit, the inventory and the keyword matrix have been added. Existing metadata, UI, URLs, crawler policy and sister-site resources are unchanged. Exact title/description changes have not been applied.

### Approaches considered

1. **Conservative technical patch (recommended):** correct existing hostname signals, sitemap completeness and inaccurate schema; keep titles, descriptions, paths, visible copy and interactions unchanged. Low editorial risk, directly addresses observed failures.
2. **Metadata and architecture expansion:** rewrite homepage/category/product targeting and differentiate LAUNCH content. Potentially useful, but medium/high risk given existing traffic and missing sister-site GSC data. Separate approved phase.
3. **Consolidate overlapping pages across domains:** redirects, deindexation or cross-domain canonicals. Not supported by evidence and explicitly excluded.

### Recommended patch boundaries (approval pending)

- Introduce one AutoDiagnostix canonical URL policy: HTTPS www, root `/`, no trailing slash on other paths, no fragments or tracking query parameters. Apply it to canonical, og:url, sitemap and site-owned schema URLs without rewriting manufacturer/media/external links. Existing explicit GTI alias canonical remains a same-domain exception.
- Cover every valid product/brand/category from paginated public CMS data. Keep current paths. Exclude error, admin, API, query and noncanonical alias URLs. Do not invent lastmod. Fail or clearly block a production build when authoritative sitemap data cannot be fetched, rather than silently dropping the catalog; choose runtime generation only if deployment constraints require it.
- Render factual Product identity/summary/images/category only. No Offer for quote-only pages; no SKU from a slug. Brand values must come from verified catalog relationships. Do not publish a hidden CMS price that is absent from page content.
- Remove invented date defaults and unsupported availability/expiry assertions. Correct CollectionPage/ItemList modeling. Represent commercial pages as WebPage/CollectionPage rather than automatically calling them articles.
- Retain business address/contact values already visible on the site; flag unverified founding year, map coordinates, opening hours and social identity relationships for owner review rather than expanding them.
- Preserve the separate manufacturer/dealer distinction. Do not add legal parent/subsidiary relationships or change existing business-ownership assertions without owner verification.
- Keep all existing page titles/descriptions in this patch. Add regression coverage for unique dynamic metadata rather than rewriting traffic-bearing pages.
- No new routes, FAQ text, visible breadcrumb UI, style changes, AI-only text, llms.txt or cross-domain links.

Primary affected implementation files: `astro/astro.config.mjs`, `astro/src/layouts/BaseLayout.astro`, `astro/src/utils/schema.ts`, and page frontmatter with hardcoded site-owned absolute URLs. Only make additional normalizer/template edits where tests demonstrate a real data or semantic mismatch. Preserve public assets and CSS.

## D. AEO audit and recommendations

Already available: visible FAQs use HTML details/summary, product features and specifications are server-rendered, and equipment pillar pages provide introductory explanations. Important product details are not exclusively embedded in images.

Proposed nonvisual improvements: factual JSON-LD, semantic collection modeling, correct heading levels and authoritative category relationships. Do not inject new answers into schema if they are absent from visible content.

Content approval backlog:

| Buyer question | Existing destination to strengthen | Proposed addition, not published |
|---|---|---|
| What equipment does a new Pakistan workshop need? | `/workshop-equipment-pakistan` | Owner-reviewed equipment checklist by service scope, bay constraints and utilities; distinguish essential vs optional equipment. |
| Two-post vs four-post lift? | `/car-lifts-in-pakistan` with existing subtype pages | Short comparison covering wheel access, alignment use, bay dimensions, slab/anchoring and manufacturer installation requirements. Do not prescribe generic safety-critical slab specs. |
| Which alignment machine is appropriate? | `/wheel-alignment-in-pakistan` | Selection criteria: vehicle coverage, space, workflow, lift compatibility, calibration and support. No invented comparative accuracy claims. |
| Tyre changer vs wheel balancer? | Existing tyre-changer and wheel-balancer pages | Explain mounting/demounting vs imbalance measurement/correction; link only compatible verified equipment. |
| What does an EV service center need? | `/ev-diagnostics-pakistan` | Manufacturer-specific diagnostic coverage, safety training and verified tooling limits. No implication that scanners qualify staff for high-voltage work. |
| What must an ADAS equipment buyer verify? | `/adas-calibration-pakistan` | Coverage, targets, subscriptions, alignment/environment requirements, training and OEM procedure compliance. |
| What should scanner buyers verify? | `/category/scanners` | Vehicle/function coverage, updates, genuine-source verification and warranty evidence; preserve sister-site branded expertise. |

FAQPage markup does not make a commercial equipment site generally eligible for Google's FAQ rich results. Speakable markup is not a general AEO ranking mechanism. Prioritize useful visible answers over extra schema types.

## E. GEO and entity findings

- AutoDiagnostix's current entity description identifies multi-brand supply, but sameAs includes a `launch-pakistan` LinkedIn page and a share-style Facebook URL. Verify these identities and public canonical profile URLs before treating them as equivalent organizations.
- The sister site's dealer-authentication page publicly names AutoDiagnostix. This corroborates a disclosed commercial association; it does not establish a legal parent/subsidiary structure or verify every manufacturer's authorization.
- Founding year 2020, hours, exact coordinates, dealer authorization, customer logos, warranty, training, installation and nationwide delivery claims need a business evidence register. Existing visible claims were not rewritten or newly endorsed.
- Preserve business training restrictions. Check OAI-SearchBot/ChatGPT-User, Googlebot, Bingbot and PerplexityBot separately from training bots and separately from CDN/WAF decisions. The live wildcard rule alone does not prove every bot gets an unchallenged response. No blanket crawler allowlist was installed.
- `/llms.txt` returns 404. This is **not a technical SEO defect**. Google documents no special AI text file or special schema requirement for its AI search features. Revisit an optional, factual directory file only after core signals are fixed and an owner wants it.
- Manufacturer documentation, actual installation case studies and authorized-dealer directory listings are better credibility opportunities than synthetic authority claims. No backlinks, third-party profiles or Wikidata entries were created or edited.

## F. Sister-site protection

- No Launch X431 code, metadata, URLs, robots, sitemaps, links, infrastructure or Search Console submissions were changed.
- No AutoDiagnostix LAUNCH page was removed, deindexed, redirected, or cross-domain canonicalized.
- No page targeting was shifted on the basis of estimated rankings or URL existence. Sister-site strongest landing pages and traffic queries remain **unknown** until authorized performance data is provided.
- Keep all 20 overlapping product pairs discoverable. Any content differentiation must be separately approved and grounded in real multi-brand procurement use, not invented product differences.
- Incidental sister-site 404s were found at the 2025 PRO SE scanner link and an encoded jack-stand link. These are reference-only observations; repair belongs to a separately authorized sister-site task.
- Do not introduce sitewide reciprocal links. An accurately disclosed, useful sister-site referral could be proposed later; none was added.

## G. Validation performed and acceptance criteria

### Performed

- Native HTTP redirect/status probes, sitemap traversal and same-site HTML link crawl.
- Per-page title, description, canonical, OG URL, H1, image-alt attribute presence and JSON-LD parsing checks across discovered HTML pages.
- Live JavaScript browser evaluation of PRO3 LINK confirmed one H1, readable product text and Product/BreadcrumbList scripts. All images on that page had alt attributes.
- Read-only GSC sitemap listing, search analytics and four priority URL inspections.
- Source review of Astro routing, dynamic templates, CMS access, sitemap and structured-data helpers.
- Initial git working tree was clean. No build or application regression suite has been run, because no application patch is implemented.

### Not performed / not claimed

- Google Rich Results Test live UI validation and Schema Markup Validator validation of revised output; there is no revised output yet. GSC supplies the existing product error evidence above.
- Exhaustive rendered browser crawl, complete CMS orphan audit, performance lab/field validation, mobile interaction regression or screenshot equivalence.
- Search engine submissions, requests for recrawl, or ranking/AI-citation improvement measurements.

### Patch acceptance criteria

1. `npm run build --prefix astro` passes with authoritative CMS data and a complete sitemap. Test pagination and CMS failure explicitly.
2. All sitemap URLs are unique, canonical www URLs with 200 responses and no noindex; all verified products/categories/canonical brands are represented, aliases excluded, no synthetic lastmod.
3. Canonical and og:url agree on every representative route and query variation. Product/brand/category paths stay unchanged. Unknown paths remain 404; upstream failure is not mistaken for deletion.
4. JSON-LD parses safely and passes vocabulary checks. Quote-only products have no fabricated commercial attributes. Google may still find such a Product ineligible for rich results; that is expected, not an error to fix with fake data.
5. Validate revised examples with Schema Markup Validator and Rich Results Test. Record URLs, date and actual results, separating vocabulary validity from Google eligibility.
6. Capture fixed-viewport before/after screenshots with deterministic slideshow timing and compare rendered DOM text, computed layout and critical interactions. No visible copy/style/layout change is acceptable.
7. Check diff contains only authorized AutoDiagnostix changes and supporting tests/docs. No sister-site mutation calls or Search Console submissions.

## H. Outstanding approvals and external dependencies

- Approve the conservative implementation boundary above before application edits.
- Provide read-only Launch X431 GSC access or matching query/page exports for the same baseline periods. Do not alter its property or request ownership changes.
- Provide analytics access/exports if lead attribution, AI referrals and organic revenue are required. Define quote-form success, phone and WhatsApp conversions without logging customer PII.
- Verify business/legal identity, each authorized dealer relationship, social profiles, founding year, address/map pin, business hours, warranty and service coverage. Do not change ownership schema on assumption.
- Confirm edge robots ownership and training/search policy. Repository and Cloudflare behavior currently conflict.
- Retry field performance access when PSI quota is available or use authorized CrUX/GSC CWV exports. A local Lighthouse run can supplement, not replace, field data; INP is not interchangeable with lab TBT.
- Review current category/pillar overlap using query-to-page data; do not consolidate successful pages based on a similarity label alone.
- Review CMS-only/unlinked products and relation integrity with a paginated catalog export. A link crawl cannot prove orphan absence.
- Approve any content proposal separately. No city doorway pages, model-comparison claims, prices or warranty promises should be autogenerated.

## I. Baseline and monitoring

Source: GSC domain property, Web search, final data, all countries/devices. No country filter means these are not Pakistan-only totals. Average position is an aggregate, not a stable live rank. Query/page data can omit anonymized queries and does not reconcile perfectly to property totals.

| Metric | 2026-09-06–2026-10-03 | 2026-10-04–2026-10-31 |
|---|---:|---:|
| Clicks | 321 | 348 |
| Impressions | 6,147 | 5,898 |
| CTR | 5.22% | 5.90% |
| Average position | 5.87 | 6.25 |

These are **pre-change observations**, not effects of this work. Latest-period device clicks: mobile 258, desktop 88, tablet 2. Mobile contributes 74.1% of clicks.

Latest period: 525 returned query rows, 80 page rows; additional overlap analysis used 1,365 query/page rows for 2026-08-03–2026-10-31. Each result was below its 5,000-row page size, so no continuation was required. GSC may still limit/anonymize underlying data.

Visible-query clicks total only 88 of 348 property clicks. A provisional `auto[\s-]?diagnosti[xc]` brand classifier yields six visible branded clicks and 82 visible non-branded clicks. **Do not report 82 as the complete site's non-branded traffic or infer a sitewide percentage from it.** Refine spelling variants with the owner and report coverage explicitly.

| AutoDiagnostix landing path (www) | Clicks | Impressions | Avg position |
|---|---:|---:|---:|
| `/wheel-alignment-in-pakistan` | 62 | 827 | 4.10 |
| `/car-lifts-in-pakistan` | 52 | 1,131 | 5.99 |
| `/2-post-car-lifts-pakistan` | 42 | 921 | 5.34 |
| `/scissor-lifts-pakistan` | 28 | 516 | 5.52 |
| `/` | 25 | 219 | 5.21 |
| `/tyre-changers-pakistan` | 22 | 551 | 6.05 |
| `/launch-x431-pakistan` | 20 | 459 | 6.63 |
| `/category/lifts-jacks` | 8 | 223 | 13.65 |
| `/category/wheel-alignment` | 8 | 230 | 8.79 |

Submitted sitemap in GSC: `https://www.autodiagnostix.com.pk/sitemap-index.xml`, last downloaded 2026-11-03, zero errors/warnings, reported submitted count 31. Live traversal found 32 entries. The API's indexed count of zero is not a reliable statement that no pages are indexed; individual URL inspections confirm indexing.

### Monitoring framework

- Record deployment date, exact commit, affected templates and crawl snapshots. No deployment has occurred as part of this audit.
- Re-crawl immediately after deployment and after 7/14/28 days. Check canonical agreement, 404/503 rates, sitemap coverage, rich-result issue categories and robots output.
- Compare rolling 28-day periods with matching weekdays; use previous-year comparison when available. Segment device, country, brand/nonbrand, equipment topic and landing-page template. Do not mix page-aggregated and property-aggregated totals.
- AutoDiagnostix growth: track nonbrand coverage-qualified clicks, impressions, key workshop topic cohorts, category/product clicks, quote conversions and identifiable AI referrals. No numerical growth promises.
- Launch protection: obtain the top LAUNCH queries/model URLs before any targeting change; monitor their clicks, impressions, CTR, average positions and landing-page shifts alongside AutoDiagnostix overlap cohorts. No baseline is available yet.
- Review sustained declines in high-value LAUNCH cohorts before expanding branded targeting. Investigate seasonality, search updates, uptime, attribution and sister-site changes before assigning cause.
- Track combined leads/traffic only when both datasets share compatible attribution periods and definitions. GA4 identifiable referrers are not a complete measure of AI visibility; Google's AI Search traffic is included in GSC Web data, not isolated by this audit.

## References

- [Google: AI features and websites](https://developers.google.com/search/docs/appearance/ai-features) — no special AI schema or AI text file required.
- [Google: Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) — factual offers and required fields; eligibility is not guaranteed.
- [Astro sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — custom pages and filtering; queried current documentation through Context7.
- [AutoDiagnostix sitemap](https://www.autodiagnostix.com.pk/sitemap-index.xml), [robots](https://www.autodiagnostix.com.pk/robots.txt).
- [Sister-site sitemap](https://launchx431.com.pk/sitemap_index.xml), [dealer authentication disclosure](https://launchx431.com.pk/dealer-authentication/). Reference-only.
