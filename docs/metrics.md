# Metrics

Measured numbers only. Each section says how it was measured so it can be reproduced. Anything not yet measured is marked "to measure".

## Lighthouse baseline (before any Phase 2 changes)

- **Date:** 4 November 2026, on branch `launch` at the first audit commit.
- **Tool:** Lighthouse 12.8.2, headless Chrome 156 (Playwright's Chromium build).
- **Mobile:** Lighthouse's default mobile emulation with simulated throttling (150 ms RTT, about 1.6 Mbps, 4x CPU slowdown).
- **Desktop:** `--preset=desktop`.
- **Server:** `node scripts/serve.mjs dist 4180` on the same machine. This local server does not compress or set cache headers, so the "text compression" and "cache lifetime" audits fail here when they would pass on Cloudflare Pages. The scores below are therefore slightly pessimistic for HTML, CSS and JS. Images and fonts are already compressed, so their numbers are representative.

```bash
npm run build
node scripts/serve.mjs dist 4180
npx lighthouse@12.8.2 http://127.0.0.1:4180/ --only-categories=performance,accessibility,best-practices,seo
```

| Page | Form factor | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Page weight |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home `/` | Mobile | **71** | 96 | 100 | 100 | 5.9 s | 220 ms | 0 | 973 KiB |
| Home `/` | Desktop | 98 | 96 | 100 | 100 | 1.1 s | 0 ms | 0 | 1,122 KiB |
| Drive `/glendalough/` | Mobile | **87** | 100 | 100 | 100 | 3.9 s | 0 ms | 0 | 553 KiB |
| Drive `/glendalough/` | Desktop | 99 | 100 | 100 | 100 | 0.9 s | 0 ms | 0 | 822 KiB |
| Guide `/driving-guide/` | Mobile | 96 | 100 | 100 | 100 | 2.9 s | 0 ms | 0 | 340 KiB |
| Guide `/driving-guide/` | Desktop | 100 | 100 | 100 | 100 | 0.6 s | 0 ms | 0 | 340 KiB |

Bold marks scores under the target of 90 for mobile performance.

### What drives the mobile scores

- **LCP element:** the pre-rendered scene image (`hero-tall.webp`, 98 KiB, on the home page; `glendalough-plate-sm.webp`, 63 KiB, on the drive page). It competes for bandwidth with two preloaded fonts (Archivo 88 KiB, Newsreader 129 KiB), and Newsreader Italic (143 KiB) loads soon after.
- **Fonts are the largest single cost:** 360 KiB across the three files, which is more than every image on the drive page combined. They are full variable fonts and not subset to the characters the site uses.
- **Script:** `scenes.js` spends about 1.0 s of main-thread time on the mobile home page (4x CPU slowdown) animating the hero canvas, which causes the 220 ms of blocking time.
- **Render-blocking CSS:** `site.css` (35 KiB uncompressed) blocks the first paint. Lighthouse estimates up to 870 ms could be saved, though some of that is down to the local server not compressing.
- **Images without `srcset`:** card images are 960 px wide (about 64 KiB each) and are shown at about 360 px on a phone.

## Accessibility (axe-core 4, WCAG 2.2 AA + best practice)

Measured with `node scripts/audit-pages.mjs` across all 18 pages at 390 px and 1280 px (36 page views).

| Date | Page views | Violations | Notes |
| --- | ---: | ---: | --- |
| 4 Nov 2026 (baseline) | 36 | 32 (all `color-contrast`) | `--ink-3` (#69756E on #ECEFE8) is 4.13:1, under the 4.5:1 needed. Faded "out of range" rows on the home page are 2.38:1. |

## External links

Measured with `node scripts/check-links.mjs`. Google Maps and WhatsApp share links are skipped by default (see the script header).

| Date | Links | OK | Moved | Blocked (check by hand) | Broken |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4 Nov 2026 (baseline) | 34 | 29 | 1 | 3 | 1 |

## Still to measure

- Total page weight for every page (only the three pages above so far).
- Lighthouse on the live site after deployment, with Cloudflare compression and caching.
- Trip planner accuracy on the evaluation set (Phase 2).
- Real-user Core Web Vitals and traffic: to measure after launch.
