# AdSense readiness

**Don't apply yet.** This page sets out what Google asks of a site before it shows AdSense ads, where Nine Roads Out stands on each point, and what to do when you decide to apply. The decision and the application are yours. Nothing here applies for anything.

Everything attributed to Google is from its AdSense and Search Console help pages, read on 19 November 2026 and linked below. Google gives **no minimum site age and no minimum amount of content** in any of those pages. Anyone who tells you "wait six months" or "write 30 posts" is guessing, so the advice below is about meeting Google's stated criteria, not about waiting a set time.

## What Google asks for

| Requirement (Google's words, short) | Source | Where the site stands |
| --- | --- | --- |
| "You're 18 or over" and own the content | [Eligibility](https://support.google.com/adsense/answer/9724) | **Yours to confirm.** |
| Access to the site's HTML source | [Eligibility](https://support.google.com/adsense/answer/9724) | **Done.** You own the code. |
| "High-quality, original" content that "attract[s] an audience" | [Eligibility](https://support.google.com/adsense/answer/9724) | **Partly.** The drives, guides and FAQs are written for this site and sourced ([fact-check.md](fact-check.md)). Photos are credited Commons images, not scraped. The route descriptions haven't been fact-checked yet. There is no audience yet. |
| Site "live and contain enough content for our specialists to evaluate"; no test pages with only ad code | [Set up](https://support.google.com/adsense/answer/76228), [Not approved](https://support.google.com/adsense/answer/81904) | **Not yet: the site isn't live.** 29 content pages are ready. |
| Not "too little text"; no ad code on "auto-generated pages" | [Not approved](https://support.google.com/adsense/answer/81904) | **Done.** Every guide is 800+ words. The sitemap lists only real pages. The GPX files and the 404 page have no ad slots. |
| Easy to navigate | [Program policies](https://support.google.com/adsense/answer/48182) | **Done.** Main menu, breadcrumbs, at least three related links on every page, and a sitemap. |
| A privacy policy that "clearly discloses any data collection", including cookies and third parties placing and reading them | [Publisher policies](https://support.google.com/adsense/answer/10502938) | **Done, automatically.** With `adsense.client` set, the Privacy page describes Google's ad cookies and consent. A test checks it. |
| No ads on screens "without publisher-content", "under construction", or with more ads than content | [Publisher policies](https://support.google.com/adsense/answer/10502938) | **Done.** Ad slots exist only on the home page, drive pages, guides and theme pages, each labelled "Advertisement". Legal, contact and 404 pages have none. |
| Ads not placed where they might be mistaken for navigation | [Program policies](https://support.google.com/adsense/answer/48182) | **Done.** The slots sit between content sections, with a label, away from menus. |
| No clicking your own ads, no asking for clicks, no traffic from click or impression services | [Program policies](https://support.google.com/adsense/answer/48182) | **Yours to keep.** The site's own click events record links marked `rel="sponsored"` (affiliates and featured listings), not ad clicks. |
| EEA, UK, Switzerland: a certified consent tool (CMP) integrated with the TCF, required since 16 January 2024 (Switzerland: 31 July 2024) | [CMP requirement](https://support.google.com/adsense/answer/13554116) | **Ready to switch on.** Use AdSense's own **Privacy & messaging** European regulations message, which Google says is certified. The footer's "Cookie settings" link reopens it. |
| `ads.txt` at the site root: not mandatory, "highly recommended" | [ads.txt](https://support.google.com/adsense/answer/12171612) | **Done, automatically.** With `adsense.client` set, the build writes `/ads.txt` in Google's format: `google.com, pub-…, DIRECT, f08c47fec0942fa0`. |
| Identity verification: "Starting June 2026, you may need to verify your identity" | [Set up](https://support.google.com/adsense/answer/76228) | **Yours.** Google gives 45 days from the first request. |

Google's reasons for turning a site down ([Not approved](https://support.google.com/adsense/answer/81904)) are a duplicate account, insufficient content, content quality, policy violations, site navigation, traffic sources, and an unsupported language. The site is in English, which isn't an issue.

## When to apply

My suggestion, based on Google's criteria rather than any time it gives:

1. **The site is live** on `nineroadsout.com` and working, contact address included (steps 1 to 7 in [launch-checklist.md](launch-checklist.md)).
2. **Search Console shows the pages indexed.** That shows Google can crawl them, and the Performance report starts to show whether people find them.
3. **The route descriptions are fact-checked.** They are the one large body of text not yet checked against sources ([handoff.md](handoff.md)). Google may review every page, not only the one you submit.
4. **Ideally, a few of your own photos.** First-hand photos are the clearest sign of original travel content.

Then it's your call. Google says review "usually takes a few days, but in some cases it can take 2-4 weeks", and that you have six months to finish setting up an account once it's open.

## When you apply

1. Apply at [adsense.google.com](https://adsense.google.com) with `nineroadsout.com`.
2. Paste your publisher ID (`ca-pub-…`) into `adsense.client` in `site.config.mjs`, then build and deploy. That adds the AdSense account meta tag, the AdSense script and `/ads.txt`. The Privacy page switches to its advertising text, and the footer gains "Cookie settings". Tests check the Privacy page both ways.
3. In AdSense, open **Privacy & messaging** and set up the European regulations message, before any ads show to visitors in the EEA, UK or Switzerland.
4. Choose **Auto ads**, or create ad units and paste their IDs into `adsense.slots`. They fill the reserved spaces: one on the home page, three on each drive page, and one in each guide.
5. Check `https://nineroadsout.com/ads.txt` loads. Google says the status can take "a few days" to become Authorized, or "up to a month" with little traffic.

## After ads go live

- Re-run Lighthouse. The ad script will lower the performance score, and CI's budget of 90 is set for the site without ads. Agree a new budget then, rather than letting CI fail.
- Ads load Google's script from another host. The Privacy page already says so when ads are on, and its test checks that.
