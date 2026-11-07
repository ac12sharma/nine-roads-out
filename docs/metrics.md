# Metrics

Measured numbers only. Each section says how it was measured so it can be reproduced. Anything not yet measured is marked "to measure".

## How Lighthouse is measured

- **Tool:** Lighthouse 12.8.2 in headless Chrome 156 (Playwright's Chromium build), run by `scripts/lighthouse.mjs`.
- **Mobile:** Lighthouse's default mobile emulation with simulated throttling (150 ms RTT, about 1.6 Mbps, 4x CPU slowdown). **Desktop:** `--preset=desktop`.
- **Server:** `scripts/serve.mjs` on the same machine.
- **Runs:** single simulated runs vary by several points, so the current numbers are the median of three runs per page and form factor (`--runs 3`). The two baselines below were single runs.

```bash
npm run build
node scripts/lighthouse.mjs --runs 3            # six key pages, mobile and desktop
node scripts/lighthouse.mjs / /hook/ --runs 3   # or any pages you name
```

## Current (4 November 2026, after the Phase 2 fixes)

Branch `launch`. The local server now gzips text files, as Cloudflare Pages does in production.

| Page | Form factor | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Page weight |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | mobile | 92 | 100 | 100 | 100 | 3.2 s | 80 ms | 0 | 491 KiB |
| `/` | desktop | 100 | 100 | 100 | 100 | 0.7 s | 0 ms | 0 | 608 KiB |
| `/glendalough/` | mobile | 99 | 100 | 100 | 100 | 2.3 s | 0 ms | 0 | 228 KiB |
| `/glendalough/` | desktop | 100 | 100 | 100 | 100 | 0.6 s | 0 ms | 0 | 423 KiB |
| `/driving-guide/` | mobile | 100 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 | 140 KiB |
| `/driving-guide/` | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 ms | 0 | 140 KiB |
| `/car-hire-dublin/` | mobile | 100 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 | 139 KiB |
| `/car-hire-dublin/` | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 ms | 0 | 139 KiB |
| `/day-trips-from-dublin-without-a-car/` | mobile | 100 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 | 139 KiB |
| `/day-trips-from-dublin-without-a-car/` | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 ms | 0 | 139 KiB |
| `/coastal-drives-from-dublin/` | mobile | 98 | 100 | 100 | 100 | 2.5 s | 0 ms | 0 | 355 KiB |
| `/coastal-drives-from-dublin/` | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 ms | 0 | 355 KiB |

Every key page now meets the targets: mobile performance 90 or more, accessibility 100, SEO 100. The home page is the slowest (92), because its 98 KiB hero image downloads alongside the two preloaded fonts on a simulated slow phone connection.

## Lighthouse CI (6 November 2026)

The same budget CI applies (`lighthouserc.json`), run locally with `npx @lhci/cli@0.15.1 autorun`: three runs per page, assertions on the median run. **All assertions passed.**

| Page | Performance (3 runs) | Accessibility | Best practices | SEO | Page weight (median) |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | 93, 91, 93 | 100 | 100 | 100 | 495 KiB |
| `/glendalough/` | 99, 97, 98 | 100 | 100 | 100 | 232 KiB |
| `/driving-guide/` | 100, 100, 64 | 100 | 100 | 100 | 143 KiB |
| `/car-hire-dublin/` | 99, 75, 100 | 100 | 100 | 100 | 143 KiB |
| `/day-trips-from-dublin-without-a-car/` | 99, 100, 100 | 100 | 100 | 100 | 142 KiB |
| `/coastal-drives-from-dublin/` | 99, 98, 99 | 100 | 100 | 100 | 359 KiB |

Two runs (64 and 75) were far below the others. Other work was running on the same machine at the time, so these are most likely measurement noise rather than the pages. That is why the budget uses the median of three runs. GitHub's runners are shared too, so expect the same occasional outlier there.

## Page weight, every page (6 November 2026)

Measured with `node scripts/page-weight.mjs`: Chromium at 390 px wide and 3x density (an iPhone-class phone), gzip on, until the network goes quiet. Bytes are transferred bytes, including headers. Lighthouse's numbers above are lower for the home page because its phone has 2.6x density, so it picks smaller card images.

| Page | Requests | Total KiB | HTML | CSS | JS | Fonts | Images |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 16 | 711 | 6 | 10 | 31 | 121 | 543 |
| `/glendalough/` | 8 | 231 | 6 | 10 | 31 | 121 | 63 |
| `/boyne/` | 8 | 231 | 6 | 10 | 31 | 121 | 63 |
| `/cooley/` | 8 | 236 | 6 | 10 | 31 | 121 | 69 |
| `/loughcrew/` | 9 | 254 | 5 | 10 | 31 | 121 | 86 |
| `/slievebloom/` | 9 | 248 | 6 | 10 | 31 | 121 | 81 |
| `/leinster/` | 9 | 280 | 5 | 10 | 31 | 121 | 113 |
| `/cashel/` | 8 | 229 | 6 | 10 | 31 | 121 | 61 |
| `/copper/` | 8 | 230 | 6 | 10 | 31 | 121 | 63 |
| `/hook/` | 8 | 187 | 6 | 10 | 31 | 121 | 20 |
| `/coastal-drives-from-dublin/` | 13 | 418 | 4 | 10 | 31 | 121 | 253 |
| `/mountain-drives-from-dublin/` | 12 | 434 | 4 | 10 | 31 | 121 | 268 |
| `/historic-day-trips-from-dublin/` | 12 | 435 | 4 | 10 | 31 | 121 | 268 |
| `/short-drives-from-dublin/` | 11 | 411 | 4 | 10 | 31 | 121 | 245 |
| `/car-hire-dublin/` | 6 | 142 | 4 | 10 | 31 | 97 | 0 |
| `/day-trips-from-dublin-without-a-car/` | 6 | 141 | 4 | 10 | 31 | 97 | 0 |
| `/how-much-of-ireland/` | 7 | 172 | 10 | 10 | 31 | 121 | 0 |
| `/driving-guide/` | 6 | 142 | 5 | 10 | 31 | 97 | 0 |
| `/about/` | 6 | 141 | 3 | 10 | 31 | 97 | 0 |
| `/advertise/` | 6 | 140 | 3 | 10 | 31 | 97 | 0 |
| `/contact/` | 6 | 140 | 2 | 10 | 31 | 97 | 0 |
| `/privacy/` | 6 | 141 | 3 | 10 | 31 | 97 | 0 |
| `/terms/` | 6 | 140 | 3 | 10 | 31 | 97 | 0 |

Fonts are the largest fixed cost on pages without photos (97 to 121 KiB). The home and theme pages are mostly drive-card images. At 3x density the browser picks the 960 px cards, and lazy cards close to the first screen load straight away.

## Baseline 2: the launch-prep version (4 November 2026, before any fixes)

Commit `7c9b371` ("Launch prep: guides, theme pages, newsletter and featured listings"), 24 pages. Single runs. The local server did **not** compress, so the text-compression and cache audits failed here when they would pass in production.

| Page | Form factor | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Page weight |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | mobile | **59** | 96 | 100 | 92* | 8.0 s | 70 ms | 0 | 982 KiB |
| `/` | desktop | 98 | 96 | 100 | 100 | 1.1 s | 0 ms | 0 | 1,131 KiB |
| `/glendalough/` | mobile | **85** | 100 | 100 | 100 | 4.0 s | 0 ms | 0 | 561 KiB |
| `/glendalough/` | desktop | 99 | 100 | 100 | 100 | 0.9 s | 0 ms | 0 | 830 KiB |
| `/driving-guide/` | mobile | 92 | 100 | 100 | 100 | 2.9 s | 0 ms | 0.106 | 348 KiB |
| `/driving-guide/` | desktop | 100 | 100 | 100 | 100 | 0.6 s | 0 ms | 0 | 348 KiB |
| `/car-hire-dublin/` | mobile | 95 | 100 | 100 | 100 | 2.9 s | 0 ms | 0.032 | 347 KiB |
| `/car-hire-dublin/` | desktop | 100 | 100 | 100 | 100 | 0.6 s | 0 ms | 0 | 347 KiB |
| `/day-trips-from-dublin-without-a-car/` | mobile | 96 | 100 | 100 | 100 | 2.7 s | 0 ms | 0.001 | 346 KiB |
| `/day-trips-from-dublin-without-a-car/` | desktop | 100 | 100 | 100 | 100 | 0.6 s | 0 ms | 0 | 346 KiB |
| `/coastal-drives-from-dublin/` | mobile | **83** | 100 | 100 | 100 | 4.4 s | 0 ms | 0.023 | 816 KiB |
| `/coastal-drives-from-dublin/` | desktop | 99 | 100 | 100 | 100 | 0.9 s | 0 ms | 0 | 816 KiB |

Bold marks mobile performance under the target of 90. \*The SEO 92 was a failed `robots.txt` fetch in that one run; the file was valid, and every later run scored 100.

## Baseline 1: the original 17-page version (4 November 2026)

Commit `2d23b88`, single runs, no compression on the local server.

| Page | Form factor | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Page weight |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | mobile | 71 | 96 | 100 | 100 | 5.9 s | 220 ms | 0 | 973 KiB |
| `/` | desktop | 98 | 96 | 100 | 100 | 1.1 s | 0 ms | 0 | 1,122 KiB |
| `/glendalough/` | mobile | 87 | 100 | 100 | 100 | 3.9 s | 0 ms | 0 | 553 KiB |
| `/glendalough/` | desktop | 99 | 100 | 100 | 100 | 0.9 s | 0 ms | 0 | 822 KiB |
| `/driving-guide/` | mobile | 96 | 100 | 100 | 100 | 2.9 s | 0 ms | 0 | 340 KiB |
| `/driving-guide/` | desktop | 100 | 100 | 100 | 100 | 0.6 s | 0 ms | 0 | 340 KiB |

## What changed performance, and by how much

Measured on the launch-prep version, mobile, one change set at a time.

| Change | Effect |
| --- | --- |
| Variable fonts cut to the axis ranges used, Newsreader's optical size pinned (`scripts/slim-fonts.py`) | Font bytes 369 KB → 123 KB (Archivo 90 → 59 KB, Newsreader 132 → 40 KB, Newsreader Italic 147 → 24 KB) |
| Scene canvas starts after `load` in idle time; skipped with Save-Data | Scene painting no longer runs before the hero image has loaded |
| Hero image preloaded ahead of the fonts, with `fetchpriority=high` | The LCP image starts downloading with the first batch of requests |
| Local server gzips text, as Cloudflare does | HTML and CSS transfer about 70% smaller (site CSS 35 KB → 10 KB) |
| Fonts, canvas, preload and gzip together | Home 59 → 87, Glendalough 85 → 99 (single runs) |
| 720 px card images with `srcset`; home cards all lazy (they sit below the hero) | Home 87 → 92 (median of 3); home mobile page weight 646 → 491 KiB |
| Photo galleries on seven drive pages (12 Wikimedia Commons photos, 1600 px and 800 px WebP, lazy-loaded), 7 November 2026 | `/glendalough/` mobile 99 → 97 and 228 → 459 KiB; `/cashel/` mobile 97, 379 KiB; `/copper/` mobile 98, 308 KiB; desktop 100 on all three (median of 3). Still within the budget. |

## Accessibility (axe-core 4, WCAG 2.2 AA + best practice)

Measured with `node scripts/audit-pages.mjs`: every page in the sitemap plus the 404 page, at 390 px and 1280 px. Since 4 November it also checks that Tab stays inside the planner on a phone, and that the county map is one Tab stop that works with the arrow keys and Space.

| Date | Version | Page views | Violations | Notes |
| --- | --- | ---: | ---: | --- |
| 4 Nov 2026 | Original (17 pages) | 36 | 32 | All `color-contrast`: `--ink-3` (#69756E) was 4.1:1 on the page background. Faded out-of-range rows on the home page were 2.4:1. |
| 4 Nov 2026 | Launch prep (24 pages) | 50 | 46 | Same two causes, now also on the theme pages and car hire guide. |
| 4 Nov 2026 | After fixes | 51 | 0 | `--ink-3` is #5C6861 (5.0:1 on the page, 5.5:1 on cards). Includes the new planner and map keyboard checks. |
| 6 Nov 2026 | Added 320 px (WCAG reflow width) | 75 | 0 | 24 pages plus the 404 at 320, 390 and 1280 px. |
| 6 Nov 2026 | Dark colour scheme (`--dark`) | 75 | 0 | First check of dark mode. |

## External links

Measured with `node scripts/check-links.mjs`. Google Maps and WhatsApp share links are skipped by default (see the script header). "Blocked" means the site refused an automated request (HTTP 403), so those links need checking by hand in a browser.

| Date | Version | Links | OK | Moved | Blocked | Broken |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 4 Nov 2026 | Original | 34 | 29 | 1 | 3 | 1 |
| 4 Nov 2026 | Launch prep | 36 | 31 | 1 | 3 | 1 |
| 4 Nov 2026 | After fixes | 35 | 31 | 1 | 3 | 0 |

The broken link was the Copper Coast Geopark page on visitwaterford.com (404). It now points to the Geopark's own site, coppercoastgeopark.com. The three blocked links are GetYourGuide searches, which answer automated requests with 403. The moved link was dataprotection.ie redirecting to `/en`; the site now links there directly, and the result above was measured before that change.

## Trip planner accuracy

121 of 124 questions answered correctly (97.6%): 96 of 96 on the tuning set and 25 of 28 on the held-out set. The baseline before the parser fixes was 90 of 96. Method and details: [planner-eval.md](planner-eval.md).

## Still to measure

- The CI workflow on GitHub's runners. Its steps have been run locally, but the workflow itself hasn't run because nothing is pushed yet.
- Lighthouse on the live site after deployment, with Cloudflare's own compression and caching.
- Real-user Core Web Vitals and traffic: to measure after launch.
