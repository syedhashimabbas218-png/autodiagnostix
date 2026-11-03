# Public route inventory and catalog overlap

Observed 2026-11-03. AutoDiagnostix paths below are delivered on `https://www.autodiagnostix.com.pk`; current canonical tags predominantly use the redirecting bare host. Paths are unchanged. Inventory covers sitemap and link discovery, not inaccessible/unlinked CMS entries.

## AutoDiagnostix: 32 core, category and pillar paths

All returned final 200; each has a title, meta description and one H1. Existing metadata was captured during the crawl; no title or description was rewritten.

```text
/
/2-post-car-lifts-pakistan
/4-post-car-lifts-pakistan
/about
/adas-calibration-pakistan
/alignment-lifts-pakistan
/battery-testers-pakistan
/brands
/bulletproof-car-lifts-pakistan
/car-lifts-in-pakistan
/category/ev-equipment
/category/lifts-jacks
/category/maintenance
/category/scanners
/category/tire-changers
/category/wheel-alignment
/category/wheel-balancers
/contact
/ev-diagnostics-pakistan
/launch-injector-machines-pakistan
/launch-lifts-pakistan
/launch-x431-pakistan
/privacy-policy
/products
/scissor-lifts-pakistan
/terms-of-service
/tyre-changers-pakistan
/tyre-inflators-pakistan
/videoscope-pakistan
/wheel-alignment-in-pakistan
/wheel-balancers-pakistan
/workshop-equipment-pakistan
```

## AutoDiagnostix: seven brand routes

All final 200. No brand routes are in the live sitemap. GTI aliases share metadata/content; the existing intended path is the legacy `/brand/gtitools`, with three measured clicks in the baseline. Do not migrate it automatically.

```text
/brand/autool
/brand/gti-tools
/brand/gtitools
/brand/launch
/brand/liberty-lifts
/brand/smartsafe
/brand/unite
```

## AutoDiagnostix: 35 product routes

All final 200, with title, description, one H1 and JSON-LD scripts; none is in the live sitemap. Product schema uses the common Offer defaults documented in the audit. A successful response does not establish inventory availability.

```text
/product/919-max
/product/autool-spt360-spark-plug-tester-tool
/product/bst-560-bst-860-battery-tester
/product/cnc-605-pro-plus
/product/gti-g-extreme
/product/gti-lcd-premium
/product/gti-power-x
/product/gti-rft-pro
/product/hj-937
/product/hp-2690a-4en
/product/ismarttlt-242
/product/launch-ev-diagnosis-add-on-kit
/product/launch-evm324
/product/launch-jack-stand-3-ton-and-6-ton
/product/launch-x-431-cnc-605a
/product/lh-330-lh-340-dual-pump-floor-jack
/product/liberty-fr-6105
/product/liberty-fr-6108
/product/liberty-tpf-15c
/product/pl-fs40
/product/tlt440w
/product/tlt630a
/product/tlt840waf
/product/u-va2023
/product/u-z30c
/product/value-ac519-a-c-service-station
/product/vsp-600-video-scope
/product/vsp-800-video-scope
/product/wa613-wireless-3d-wheel-aligner
/product/x-431-adas-pro-plus
/product/x-431-hd-iii-heavy-duty-module
/product/x-431-pad-9-link
/product/x-431-pro3-link
/product/x861-lite-wheelalignment-machine
/product/x861-pro-wheel-alignment-machine
```

## Twenty corresponding product pairs

Left paths use AutoDiagnostix www; right paths use `https://launchx431.com.pk`. Matching slugs/model identity establish catalog overlap, not automatically duplicate-content penalties or proven cannibalization. Preserve both pages. Exact overlap in manufacturer facts is expected; product introductions such as PRO3 LINK share text and may merit an approved, purpose-driven editorial differentiation later.

| AutoDiagnostix | Launch X431 reference |
|---|---|
| `/product/919-max` | `/scanners/919-max/` |
| `/product/bst-560-bst-860-battery-tester` | `/maintenance/bst-560-bst-860-battery-tester/` |
| `/product/cnc-605-pro-plus` | `/maintenance/cnc-605-pro-plus/` |
| `/product/ismarttlt-242` | `/lifts-jacks/ismarttlt-242/` |
| `/product/launch-jack-stand-3-ton-and-6-ton` | `/lifts-jacks/launch-jack-stand-3-ton-and-6-ton/` |
| `/product/launch-x-431-cnc-605a` | `/maintenance/launch-x-431-cnc-605a/` |
| `/product/lh-330-lh-340-dual-pump-floor-jack` | `/lifts-jacks/lh-330-lh-340-dual-pump-floor-jack/` |
| `/product/tlt440w` | `/lifts-jacks/tlt440w/` |
| `/product/tlt630a` | `/lifts-jacks/tlt630a/` |
| `/product/tlt840waf` | `/lifts-jacks/tlt840waf/` |
| `/product/value-ac519-a-c-service-station` | `/maintenance/value-ac519-a-c-service-station/` |
| `/product/vsp-600-video-scope` | `/maintenance/vsp-600-video-scope/` |
| `/product/vsp-800-video-scope` | `/maintenance/vsp-800-video-scope/` |
| `/product/wa613-wireless-3d-wheel-aligner` | `/wheel-alignment/wa613-wireless-3d-wheel-aligner/` |
| `/product/x-431-adas-pro-plus` | `/wheel-alignment/x-431-adas-pro-plus/` |
| `/product/x-431-hd-iii-heavy-duty-module` | `/scanners/x-431-hd-iii-heavy-duty-module/` |
| `/product/x-431-pad-9-link` | `/scanners/x-431-pad-9-link/` |
| `/product/x-431-pro3-link` | `/scanners/x-431-pro3-link/` |
| `/product/x861-lite-wheelalignment-machine` | `/wheel-alignment/x861-lite-wheelalignment-machine/` |
| `/product/x861-pro-wheel-alignment-machine` | `/wheel-alignment/x861-pro-wheel-alignment-machine/` |

## Other sister-site HTML destinations

These were read only; no fixes or targeting changes were made. Traffic/ranking strength cannot be derived from this inventory.

```text
/
/about-us/
/category/uncategorized/
/contact-us/
/dealer-authentication/
/elementor-hf/launch-x-431-header/
/elementor-hf/launch-x431-footer/
/hello-world/
/lifts-jacks/
/maintenance/
/our-clients/
/products/
/scanners/
/scanners/launch-x-431-pro-se-2026-edition/
/update/
/wheel-alignment/
/author/admin/   (noindex)
```

Variants additionally encountered: bare root without slash; uppercase X861 PRO/LITE URLs (some redirect, some final 200 with lowercase canonical); two broken links:

- `/scanners/launch-x-431-pro-se-2025-edition/` → 404, linked from `/scanners/`.
- `/lifts-jacks/Launch%20Jack%20Stand%203-Ton%20and%206-Ton%E2%80%8B` → 404.

Do not repair these in this project. Any sister-site work requires a separate explicit authorization.
