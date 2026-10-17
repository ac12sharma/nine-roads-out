# Nine Roads Out

The most beautiful day drives from Dublin, as a fast static website that is ready for ads and affiliate links.

- 17 pages: home, nine drive pages, Your Ireland, a driving guide, About, Contact, Privacy and cookies, Terms, and a 404 page.
- A trip planner chat on every page ("Where do you want to go?") that suggests drives by scenery, drive time or place, and finds places to eat by type and cuisine. It runs in the visitor's browser from the site's own data, so it costs nothing to run. You can optionally let it pass harder questions to Claude.
- Places to eat on every drive (31 cafés, pubs, restaurants and fine dining rooms), with filters for type and cuisine.
- Traveller levels: visitors tick off drives and tap counties on a map of Ireland to see what percentage of the Republic's 26 counties they've driven, and whether they're a Level 1, 2 or 3 traveller. Progress is saved only in their own browser, and results can be shared.
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
| `src/content/trips.mjs` | All drive content: stops, roads, tips, links, search descriptions, scenery tags, the counties each drive passes through, and the place names the planner recognises. |
| `src/content/restaurants.mjs` | Places to eat on each drive. |
| `src/content/ireland-map.json` | County outlines for the Your Ireland map (Natural Earth, public domain). |
| `src/assets/app.js` | Everything interactive: the trip planner, traveller levels, the map, filters and the drive-time dial. |
| `src/functions/chat.js` | Template for the optional AI back end (see below). |
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

## The trip planner, levels and places to eat

### How the planner works

The planner is the "Plan a trip" button in the corner of every page. It understands scenery ("the coast", "mountains", "castles"), drive times ("under an hour", "2 h 30"), places and stops ("anything near Kells", "Hook Head"), food ("lunch", "seafood", "fine dining", "vegan") and practical questions (tolls, speed limits, daylight, weather, car hire, levels). It runs entirely in the browser from a small data file the build generates, so there is no server, no cost and nothing to break.

To teach it a new place name, add it to that drive's `WORDS` list in `src/content/trips.mjs`.

### Traveller levels

Levels are based on how many of the Republic's 26 counties someone has driven in:

| Level | Name | Counties | Share |
| --- | --- | --- | --- |
| 1 | Day-tripper | 1 to 8 | up to 31% |
| 2 | Road-tripper | 9 to 17 | 35% to 65% |
| 3 | Grand tourer | 18 to 26 | 69% to 100% |

Ticking off a drive counts every county it passes through (listed in `COUNTIES` in `src/content/trips.mjs`). All nine drives together cover 14 counties, which is Level 2, so reaching Level 3 means driving further afield and tapping those counties on the map. Progress is stored in the visitor's own browser (`localStorage`) and is never sent anywhere.

### Places to eat

Listings are independent and unpaid. Each one links to a Google Maps search rather than a fixed address, so it keeps working if a place moves. Restaurants close and change hands more often than anything else on the site, so check `src/content/restaurants.mjs` whenever you re-check the drives.

### Optional: AI answers for questions the planner can't handle

By default the planner answers from the site's data and, when it doesn't understand a question, offers suggestions. You can let it pass those questions to Claude instead. It costs a small amount per question, paid to Anthropic.

1. Host on Cloudflare Pages with the Git integration (step 2 below), or deploy with `npx wrangler pages deploy dist` from this folder. Uploading the `dist` folder by drag and drop does not include the back end.
2. Create an API key in the [Claude Console](https://console.anthropic.com) and set a monthly spend limit there.
3. In the Cloudflare Pages project, open **Settings > Variables and Secrets** and add a secret called `ANTHROPIC_API_KEY` with the key. Optionally add `CHAT_MODEL` to use a different model.
4. Set `chat.ai` to `true` in `site.config.mjs` and push. The build generates `functions/api/chat.js` with the site's drives and restaurants built in, and Cloudflare serves it at `/api/chat`.
5. Add a rate limiting rule in Cloudflare (**Security > WAF > Rate limiting rules**) for requests to `/api/chat`, for example 10 requests per 10 seconds per IP, so nobody can run up your bill.

The back end only accepts requests from your own domain, sends at most the last eight messages, and keeps replies short. Claude is told to recommend only the drives and places on the site and not to invent opening hours or prices. When it's on, the Privacy page automatically says that unanswered planner questions are sent to Anthropic to generate a reply.

## Keeping it accurate

Opening times and access change. Each drive's "Know before you go" list links to its official sources. Re-check those every few months, update `src/content/trips.mjs` and `src/content/restaurants.mjs`, and change `checked` in `site.config.mjs`.

## Licences

Archivo and Newsreader are used under the SIL Open Font License. The licence files are in `public/fonts/`. County boundaries are from [Natural Earth](https://www.naturalearthdata.com), which is in the public domain.
