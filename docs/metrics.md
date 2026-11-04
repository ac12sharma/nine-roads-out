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

## Accessibility (axe-core 4, WCAG 2.2 AA + best practice)

Measured with `node scripts/audit-pages.mjs`: every page in the sitemap plus the 404 page, at 390 px and 1280 px. Since 4 November it also checks that Tab stays inside the planner on a phone, and that the county map is one Tab stop that works with the arrow keys and Space.

| Date | Version | Page views | Violations | Notes |
| --- | --- | ---: | ---: | --- |
| 4 Nov 2026 | Original (17 pages) | 36 | 32 | All `color-contrast`: `--ink-3` (#69756E) was 4.1:1 on the page background. Faded out-of-range rows on the home page were 2.4:1. |
| 4 Nov 2026 | Launch prep (24 pages) | 50 | 46 | Same two causes, now also on the theme pages and car hire guide. |
| 4 Nov 2026 | After fixes | 51 | 0 | `--ink-3` is #5C6861 (5.0:1 on the page, 5.5:1 on cards). Includes the new planner and map keyboard checks. |

## External links

Measured with `node scripts/check-links.mjs`. Google Maps and WhatsApp share links are skipped by default (see the script header). "Blocked" means the site refused an automated request (HTTP 403), so those links need checking by hand in a browser.

| Date | Version | Links | OK | Moved | Blocked | Broken |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 4 Nov 2026 | Original | 34 | 29 | 1 | 3 | 1 |
| 4 Nov 2026 | Launch prep | 36 | 31 | 1 | 3 | 1 |
| 4 Nov 2026 | After fixes | 35 | 31 | 1 | 3 | 0 |

The broken link was the Copper Coast Geopark page on visitwaterford.com (404). It now points to the Geopark's own site, coppercoastgeopark.com. The three blocked links are GetYourGuide searches, which answer automated requests with 403. The moved link was dataprotection.ie redirecting to `/en`; the site now links there directly, and the result above was measured before that change.

## Still to measure

- Total page weight for every page, not just the six above.
- Lighthouse on the live site after deployment, with Cloudflare's own compression and caching.
- Trip planner accuracy on the evaluation set (Phase 2).
- Real-user Core Web Vitals and traffic: to measure after launch.
