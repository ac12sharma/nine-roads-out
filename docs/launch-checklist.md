# Launch checklist: what needs you

Every step here needs your account, a payment, or a decision only you can make. Nothing in this repository signs up, buys, pushes or deploys on its own. Do the steps in order: each depends on the one before. After each step, tell me it's done, and I'll check it worked before you start the next.

Cloudflare's click paths are from its documentation, read on 19 November 2026; Google's are from its help pages, read the same day. Dashboards change. If a menu has moved, tell me what you see and I'll find the new path.

## 1. GitHub repository

**You:** go to [github.com/new](https://github.com/new) while signed in as `ac12sharma`.

- **Repository name:** `nine-roads-out`
- **Visibility:** *Private* until launch is my suggestion; you can make it public for your portfolio afterwards. CI runs either way: private repositories use your free GitHub Actions minutes, public ones don't.
- **Don't** tick "Add a README", ".gitignore" or "license". The repository must start empty.
- Select **Create repository**.

**Then I** (only once you say so): add it as `origin`, push `main` and `launch`, and open a pull request from `launch` into `main`. The push starts CI, so this is the workflow's first real run.

**Check:** `git ls-remote origin` lists both branches, and `gh run list` shows the CI run. I'll report the result of each job.

## 2. Merge `launch` into `main`

**You:** read the pull request (it lists every commit), then merge it on GitHub, or tell me to merge it. `main` is the branch Cloudflare will deploy, so this is the moment the new site becomes the deployable version.

**Check:** CI passes on `main`.

## 3. Cloudflare account

**You:** sign up at [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) and verify your email address. Domain registration needs a verified email.

## 4. Buy the domain (costs money)

`nineroadsout.com` was unregistered on 19 November 2026 (the .com registry had no record of it). That can change at any time.

**You:** in the Cloudflare dashboard, go to **Domain Registration > Register domains**. Search for `nineroadsout.com`, select **Purchase**, choose a term under **Payment option**, enter your contact details and payment, then **Complete purchase**. Check the price on that screen before you pay.

From Cloudflare's docs: renewal is automatic unless you turn it off, a domain registered with Cloudflare must use Cloudflare's nameservers, and personal details are redacted from WHOIS where the registry allows.

If you choose a different name, tell me before deploying: `siteUrl` in `site.config.mjs` has to change, because every canonical link, share card and the sitemap use it.

**Check:** the registry lookup returns the domain with Cloudflare's nameservers.

## 5. Pages project

**You:** in the Cloudflare dashboard, go to **Workers & Pages > Create application > Pages > Connect to Git**.

1. Choose **GitHub** and select **Install & Authorize**. Give it access to the `nine-roads-out` repository only, not all repositories. Then **Begin setup**.
2. In **Set up builds and deployments**:
   - **Project name:** `nineroadsout` (it becomes `nineroadsout.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** leave empty
   - **Environment variables:** none needed. Node 22 comes from `.nvmrc`.
3. Select **Save and Deploy**.

**Check:** I'll run the page audit and Lighthouse against the `*.pages.dev` address, and check the headers from `_headers` arrive.

## 6. Custom domain

**You:** open the Pages project, then **Custom domains > Set up a domain**. Enter `nineroadsout.com` and select **Continue**, then confirm. The domain is already a zone on your Cloudflare account, which an apex domain needs, so Cloudflare adds the DNS record itself.

For `www.nineroadsout.com`, add it the same way. Then tell me, and I'll find Cloudflare's current way to redirect `www` to the bare domain before you set it up. I haven't checked that path yet.

**Check:** `https://nineroadsout.com/` serves the site with a valid certificate, the canonical links match it, and `www` redirects.

## 7. Contact address (hello@nineroadsout.com)

Until this is done, mail to the address on the Contact page bounces.

**You:** in the Cloudflare dashboard:

1. **Compute > Email Service > Email Routing > Onboard Domain**, choose `nineroadsout.com`, review the DNS records Cloudflare will add (MX, plus TXT records for SPF and DKIM), then **Done**.
2. **Destination Addresses:** add the inbox you want the mail to go to, then open the verification email and select **Verify email address**. I don't need to know which inbox it is.
3. Select the domain, then **Routing Rules > Create routing rule**. Set **Email pattern** to `hello`, **Action** to *Send to an email*, choose your verified address as **Destination**, then **Save**.

**Check:** I'll confirm the MX records are published. You then send a test email to hello@nineroadsout.com from a different account and tell me whether it arrived. Cloudflare says DNS changes usually take 5 to 15 minutes.

## 8. Visit counts (Cloudflare Web Analytics)

Optional, but cookieless and free.

**You:** open the Pages project, then **Metrics**, and select **Enable** under Web Analytics. Cloudflare adds its script on the next deployment.

**Then I:** set `analytics.cloudflareDashboard: true` in `site.config.mjs`, so the Privacy page says the site counts visits, and redeploy through a commit you approve.

**Check:** the live pages carry Cloudflare's beacon, and the Privacy page has the "Visit counts" line.

## 9. Google Search Console

**You:** at [search.google.com/search-console](https://search.google.com/search-console), open the property selector, then **+ Add property > Domain**. Enter `nineroadsout.com` (no `https://`, no `www`).

- If Cloudflare appears as your domain provider, choose it and select **Start verification**, then sign in to Cloudflare when asked.
- Otherwise choose record type **TXT** and copy the value. In Cloudflare, go to the domain, then **DNS > Records > Add record**: **Type** TXT, **Name** `@`, **Content** the value. Back in Search Console, select **Verify**. Google says a manual record can take up to two or three days to be seen. Never delete the record: verification depends on it.

Then open **Sitemaps** (search.google.com/search-console/sitemaps), enter `sitemap.xml` under **Add a new sitemap**, and **Submit**.

**Check:** I'll confirm the TXT record is published. You tell me the sitemap's status once Search Console has read it.

## After launch, not on day one

- **Newsletter:** Buttondown account and `newsletter.action` ([newsletter-setup.md](newsletter-setup.md)).
- **Affiliate programmes:** apply once the site is live (below).
- **Google AdSense:** don't apply yet. See [adsense-readiness.md](adsense-readiness.md) for what Google asks for and where the site stands.
- **Click events and AI answers:** both are Pages Functions, built into `/functions` during the build. Cloudflare's docs don't say whether files generated during a Git build are deployed. Before relying on either, switch it on and check `/api/event` or `/api/chat` answers on the live site; I'll test it with you ([analytics.md](analytics.md), [ai-planner.md](ai-planner.md)).

## Affiliate programmes

The booking links are in place but are plain links: they work for visitors and earn nothing, because there are no approved partner accounts yet (`reference/affiliate-approvals.md` doesn't exist). Every one is already marked `rel="sponsored"` and labelled as an affiliate link, and a test keeps it that way.

Apply to these three once the site is live. Each programme decides whether to accept the site, and may want to see some traffic first.

| Link on the site | Programme | Apply at | Paste the tracked link into |
| --- | --- | --- | --- |
| Car hire (Discover Cars) | Discover Cars affiliate programme | [discovercars.com/affiliate](https://www.discovercars.com/affiliate) | `affiliates.carHire.url` |
| Places to stay (Booking.com) | Booking.com Affiliate Partner Programme | [booking.com/affiliate-program](https://www.booking.com/affiliate-program/v2/index.html) | `affiliates.stays.url` |
| Tours (GetYourGuide) | GetYourGuide Partner Program | [partner.getyourguide.com](https://partner.getyourguide.com/) | `affiliates.tours.url` |

All three fields are in `site.config.mjs`. When you're approved:

1. Copy the tracked link from the partner dashboard. For **stays** and **tours**, the site searches for each drive's town, so keep `{q}` where the search term goes. Use the link format the dashboard gives you, and put `{q}` in place of its search term.
2. Run `npm run build`. The build keeps listing "Swap the affiliate URLs for your tracked partner links" until every link has a tracking parameter (`aid`, `a_aid`, `partner_id`, `affiliate` or `ref`).
3. Keep the approval emails or terms somewhere private, for example `reference/affiliate-approvals.md` (git-ignored with the rest of `reference/`). Each programme has its own rules on disclosure and where links may appear. Read them, and tell me if one asks for something the site doesn't do yet.

If a programme turns you down, leave its plain link: it still helps visitors.
