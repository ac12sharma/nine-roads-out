# Handoff

Where the project stands at the end of Phase 4 (7 November 2026), for whoever picks it up next. Everything is on the `launch` branch, committed but **not pushed**. `main` is the original launch-prep version and stays deployable.

## Ground rules from the owner

These apply to every phase:

- **Never invent facts**, reviews, statistics, prices or opening hours. Check claims against an official source and record them in [fact-check.md](fact-check.md). Where no source exists, soften or remove the claim and say so.
- **Every paid or affiliate link** carries `rel="sponsored"` and a visible disclosure. A test enforces this.
- **No secrets** in the repository or in chat. Tell the owner which dashboard field a key goes in.
- **No personal details** beyond what the legal pages already need. The public contact is hello@nineroadsout.com.
- **No runtime dependencies.** Dev dependencies for tests and checks are fine.
- **Small commits** on `launch`, each one building on its own.
- **Ask first** before buying anything, creating accounts, pushing to GitHub, deploying, or anything irreversible.

## What's done

| Phase | Done | Docs |
| --- | --- | --- |
| 1. Audit | Playwright, axe, link and Lighthouse scripts; baselines recorded | [metrics.md](metrics.md) |
| 2. Quality | Shared planner and level modules; 90 tests (content, levels, site output, planner evaluation, newsletter, events, AI back end, policies); `tsc --checkJs` with strict mode for `src/shared/`; html-validate; WCAG 2.2 AA audit at 320, 390 and 1280 px in light and dark mode; CI workflow with a Lighthouse budget | [planner-eval.md](planner-eval.md), [accessibility.md](accessibility.md), [metrics.md](metrics.md) |
| 3. Content and SEO | Practical details on all nine drives fact-checked, with a "checked" date on each page; FAQs with FAQPage data on the car hire and Boyne pages; five 800-word sourced guides; GPX files of verified stops; at least three related links on every page; schema.org validation (`check-seo`); titles of 70 characters or fewer; 12 credited Wikimedia Commons photos | [fact-check.md](fact-check.md), [image-credits.md](image-credits.md) |
| 4. Money and privacy | Buttondown sign-up wired but off; affiliate programmes listed; cookieless click events (off); AI planner with per-visitor rate limits (off); Privacy and Terms rendered from the config, with tests | [newsletter-setup.md](newsletter-setup.md), [launch-checklist.md](launch-checklist.md), [analytics.md](analytics.md), [ai-planner.md](ai-planner.md) |

Current numbers:
- **Lighthouse (mobile):** 92 to 100 on the key pages, 100 on desktop; accessibility, best practices and SEO 100.
- **axe:** 0 issues across 90 page views.
- **Planner evaluation:** 121 of 124 correct, and 25 of 28 on the held-out set.
- **External links:** 0 broken.

Every switch in `site.config.mjs` is **off**: AdSense, the newsletter (`newsletter.action`), Cloudflare Web Analytics, click events and AI answers. The Privacy page follows whatever is switched on.

## What needs the owner

Nothing here can be done by an agent. Details are in [launch-checklist.md](launch-checklist.md).

1. **Decide where to host.** The README assumes Cloudflare Pages, but the repo also has `netlify.toml` and `vercel.json`. Click events and the AI back end are Cloudflare Pages Functions.
2. **Buy the domain** and create the hosting account.
3. **Contact address:** set up email forwarding for hello@nineroadsout.com. Until then it bounces.
4. **Newsletter:** create the Buttondown account and paste the form address into `newsletter.action` ([newsletter-setup.md](newsletter-setup.md)).
5. **Affiliates:** apply to Discover Cars, Booking.com and GetYourGuide once the site is live. Paste the tracked links into `affiliates.*.url`.
6. **GitHub:** create the repository, and approve the push. Then uncomment the CI badge in the README with the real `OWNER/REPO`. CI has never run on GitHub.
7. **Optional:** a ShareAlike photo of the Rock of Cashel, if the owner wants to approve a specific file, and a Loughcrew photo of their own.
8. **Worth doing:** move the project out of `~/Desktop`. macOS is offloading its files (see "Working notes").

## What's next

- **Phase 5, launch.** Ask the owner at every login step. Deploy and record Lighthouse on the live site. Add the hosting steps to [launch-checklist.md](launch-checklist.md), including the Analytics Engine and KV bindings if events or AI are switched on. Write `docs/adsense-readiness.md`, and **don't** apply for AdSense.
- **Phase 6, portfolio.** Rewrite the README, and write `docs/case-study.md`, CV bullets and a 60-second walkthrough. The owner's CV is in `reference/`, which is git-ignored. `reference/target-roles.md` and `reference/cv.pdf` don't exist yet; ask for them.

## Known gaps

- **Not fact-checked yet:** the route descriptions (history and descriptions of stops), the theme pages and the driving guide. The restaurant listings were checked in October 2026, before this work.
- **Planner misses** on the held-out set: "how fast can I drive", "international driving permit", "shortest drive". Fix them by adding similar cases to the tuning set, never by editing the held-out set ([planner-eval.md](planner-eval.md)).
- **Not tested:** screen readers, forced colours and target size ([accessibility.md](accessibility.md)); live API calls for the AI planner; the CI workflow on GitHub.
- **No photo:** Loughcrew, and the Rock of Cashel itself.
- **Six GPX stops** have no verified position: Long Woman's Grave, The Cut, the Nine Stones, the Vee, the Metal Man and Clonea Strand.

## Working notes

- **Verify from a real clone.** `git clone --branch launch <repo> /tmp/x && cd /tmp/x && npm ci && npm test && npm run typecheck && npm run build && npm run validate-html && npm run check-seo`. Copying the folder instead hides files git doesn't track: `src/functions/chat.js` was never committed until Phase 4 because of a too-broad `.gitignore` rule.
- **The Desktop folder is synced and offloaded by macOS.** Reads can stall or time out (`ETIMEDOUT`). One `git commit` hung for 12 minutes, and duplicate files like `dist/index 2.html` appeared. Building and testing in a clone under the scratchpad avoids this.
- **Sources that block automated fetches:** Citizens Information and NDLS. Read them in a browser. carlowtourism.com sits behind a Cloudflare challenge.
- **Wikimedia and Nominatim** need a User-Agent with contact details. The scripts use the site's public address.
- **Lighthouse varies** by several points between runs, so the budget uses the median of three.
