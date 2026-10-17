# Nine Roads Out

The most beautiful day drives from Dublin, as a fast static website that is ready for ads and affiliate links.

- 16 pages: home, nine drive pages, a driving guide, About, Contact, Privacy and cookies, Terms, and a 404 page.
- Every page is plain HTML generated at build time, so it loads fast, ranks well and works without JavaScript.
- Search-ready: unique titles and descriptions, canonical links, share cards (Open Graph images) for every drive, structured data (TouristTrip, ItemList, BreadcrumbList, Article), `sitemap.xml` and `robots.txt`.
- Money-ready: reserved ad spaces that switch on when you add your Google AdSense ID, and a "Plan this trip" box on every drive with car hire, stays and tour links that you point at your affiliate accounts.
- GDPR-friendly by default: fonts, images and scripts are self-hosted, analytics is cookieless, and ad consent is handled by Google's own certified consent message.

## Commands

You need Node 18 or newer. There are no runtime dependencies.

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the site into `dist/`. Deploy this folder. |
| `npm run preview` | Builds a copy into `preview/` with relative links and visible ad placeholders. |
| `npm run images` | Re-renders the scene pictures, share cards and icons (needs `npm i` and `npx playwright install chromium` first). |

## Where things live

| File | What to change there |
| --- | --- |
| `site.config.mjs` | Domain, your name, contact email, AdSense ID and ad slots, analytics, affiliate links. Start here. |
| `src/content/trips.mjs` | All drive content: stops, roads, tips, links, search descriptions. |
| `src/pages.mjs` | Page templates, including the guide, About, Privacy and Terms text. |
| `src/assets/site.css` | All styling. |
| `src/assets/scenes.js` | The illustrated scenes. |
| `public/` | Fonts, icons, pre-rendered images and hosting headers, copied into the build as they are. |

## Launch checklist

### 1. Get the domain

`nineroadsout.com` was available for about $11 a year when checked on 17 October 2026. Buy it from any registrar. Cloudflare Registrar sells at cost and makes step 2 simpler. If you pick a different name, update `siteUrl` in `site.config.mjs`.

### 2. Host it somewhere that allows ads

Vercel's free Hobby plan does not allow ads or affiliate-led sites ([fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)), so use one of these:

- **Cloudflare Pages (recommended, free).** Push this folder to a GitHub repository, then in the Cloudflare dashboard create a Pages project connected to it. Set the build command to `node src/build.mjs` and the output directory to `dist`. Every push then redeploys the site. If you don't want GitHub, you can upload the `dist` folder directly instead. Add your domain under the project's Custom domains.
- **Netlify (free).** Connect the repository; `netlify.toml` already sets the build.
- **Vercel Pro (paid).** `vercel.json` already sets the build.

The `_headers` file sets long caching for fonts, scripts and images on Cloudflare and Netlify.

### 3. Fill in `site.config.mjs`

Set `siteUrl` to your live address and `contactEmail` to an inbox you check. Then push, or rebuild and upload again. The build prints anything still missing.

### 4. Tell Google the site exists

Add the domain in [Google Search Console](https://search.google.com/search-console), verify it, and submit `https://yourdomain/sitemap.xml`.

### 5. Apply for Google AdSense

1. Apply at [adsense.google.com](https://adsense.google.com) with your domain. Google reviews the whole site, which can take from a few days to a few weeks.
2. Paste your publisher ID (`ca-pub-…`) into `adsense.client` and redeploy. This adds the AdSense script, the verification tag and `ads.txt`.
3. In AdSense, open **Privacy & messaging** and turn on the European regulations (GDPR) message. Visitors in the EEA, UK and Switzerland must consent before personalised ads, and this is Google's own certified consent tool, so you don't need anything else. The "Cookie settings" link in the footer reopens it.
4. Either switch on **Auto ads**, or create ad units and paste their IDs into `adsense.slots`. They will appear in the reserved spaces: one on the home page, three on each drive page and one in the guide.

### 6. Join the affiliate programmes

Sign up with the partners in `site.config.mjs` (Discover Cars, Booking.com, GetYourGuide) or your own choices. Paste each tracked link into `affiliates`, keeping `{q}` where the place name should go. Links already carry `rel="sponsored"`, and every booking box and the footer disclose that they are affiliate links.

### 7. Optional: analytics

Turn on Cloudflare Web Analytics for the Pages project. It is cookieless, so it needs no consent. If you host elsewhere, paste the token into `analytics.cloudflareToken`.

## Keeping it accurate

Opening times and access change. Each drive's "Know before you go" list links to its official sources. Re-check those every few months, update `src/content/trips.mjs`, and change `checked` in `site.config.mjs`.

## Licences

Archivo and Newsreader are used under the SIL Open Font License. The licence files are in `public/fonts/`.
