# Nine Roads Out

The most beautiful day drives from Dublin, as a fast static website that is ready for ads and affiliate links.

- 24 pages: home, nine drive pages, four theme pages (coastal, mountain, historic and short drives), a car hire guide, a no-car guide, Your Ireland, a driving guide, About, Advertise, Contact, Privacy and cookies, Terms, and a 404 page.
- A trip planner chat on every page ("Where do you want to go?") that suggests drives by scenery, drive time or place, and finds places to eat by type and cuisine. It runs in the visitor's browser from the site's own data, so it costs nothing to run. You can optionally let it pass harder questions to Claude.
- Places to eat on every drive (31 cafés, pubs, restaurants and fine dining rooms), with filters for type and cuisine.
- Traveller levels: visitors tick off drives and tap counties on a map of Ireland to see what percentage of the Republic's 26 counties they've driven, and whether they're a Level 1, 2 or 3 traveller. Progress is saved only in their own browser, and results can be shared.
- Every page is plain HTML generated at build time, so it loads fast, ranks well and works without JavaScript.
- Search-ready: unique titles and descriptions, canonical links, share cards (Open Graph images) for every drive, structured data (TouristTrip, ItemList, BreadcrumbList, Article), `sitemap.xml` and `robots.txt`.
- Money-ready: reserved ad spaces that switch on when you add your Google AdSense ID; a "Plan this trip" box on every drive with car hire, stays and tour links; a car hire guide and a no-car guide written for people ready to book; labelled featured listings you can sell to local businesses; and a newsletter sign-up that switches on when you connect a provider.
- A printable route card for every drive, and a ready-made gallery for your own photos.
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
| `src/content/restaurants.mjs` | Places to eat on each drive. Add `featured: true` to a listing someone has paid for. |
| `src/content/guides.mjs` | The theme pages (coastal, mountain, historic, short) and the no-car guide. |
| `src/content/photos.mjs` | Your own photos for each drive (see "Adding your photos"). |
| `src/content/ireland-map.json` | County outlines for the Your Ireland map (Natural Earth, public domain). |
| `src/assets/app.js` | Everything interactive: the trip planner, traveller levels, the map, filters and the drive-time dial. |
| `src/functions/chat.js` | Template for the optional AI back end (see below). |
| `src/pages.mjs` | Page templates, including the driving guide, car hire guide, About, Advertise, Privacy and Terms text. |
| `src/assets/site.css` | All styling. |
| `src/assets/scenes.js` | The illustrated scenes. |
| `public/` | Fonts, icons, pre-rendered images and hosting headers, copied into the build as they are. |

## Launch checklist

The fastest way live: buy the domain and host the site on Cloudflare (free), uploading the ready-built folder. About 20 minutes.

### 1. Make a Cloudflare account and buy the domain

Sign up at [cloudflare.com](https://dash.cloudflare.com/sign-up). Under **Domain Registration > Register Domains**, search for `nineroadsout.com` and buy it. It was about $11 a year when checked in October 2026, and Cloudflare sells domains at cost. If you pick a different name, change `siteUrl` in `site.config.mjs` and rebuild before uploading.

Buy the domain before you launch: every page's canonical link and share card points at `siteUrl`.

### 2. Upload the site

Vercel's free Hobby plan does not allow ads or affiliate-led sites ([fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)), so use Cloudflare Pages.

1. In the Cloudflare dashboard, open **Workers & Pages**, choose **Create**, then the **Pages** tab, then **Upload assets** (the wording may shift slightly as Cloudflare updates its dashboard).
2. Name the project `nineroadsout` and upload the contents of the `dist` folder, or the `nine-roads-out-upload.zip` file, which is the same thing.
3. When it's deployed, open the project's **Custom domains** tab and add `nineroadsout.com`. Add `www.nineroadsout.com` too if you like.

To update the site later, run `npm run build` and upload `dist` again as a new deployment.

**Automatic deploys instead (recommended once you're editing regularly):** push this folder to a GitHub repository and create the Pages project with **Connect to Git** instead. Build command `node src/build.mjs`, output directory `dist`. Every push then redeploys the site, and it's required if you switch on the AI planner.

Netlify (free) and Vercel Pro (paid) also work: `netlify.toml` and `vercel.json` already set the build. The `_headers` file sets long caching for fonts, scripts and images on Cloudflare and Netlify.

### 3. Make the contact address work

The site lists `hello@nineroadsout.com` (set in `contactEmail`). In Cloudflare, open the domain, then **Email > Email Routing**, and create `hello@` with your own inbox as the destination. It's free, and you reply from your normal email. AdSense reviewers look for a working contact route.

### 4. Tell Google the site exists

Add the domain in [Google Search Console](https://search.google.com/search-console), verify it (Cloudflare can add the DNS record for you), and submit `https://nineroadsout.com/sitemap.xml`. Do the same in [Bing Webmaster Tools](https://www.bing.com/webmasters), which can import from Search Console in one click.

### 5. Apply for Google AdSense (not on day one)

Wait until the site has some visitors from search and you've added a few more pages or your own photos. "Low value content" is a common reason small sites are turned down, and it's easier to be approved first time than to reapply.

1. Apply at [adsense.google.com](https://adsense.google.com) with your domain. Google reviews the whole site, which can take from a few days to a few weeks.
2. Paste your publisher ID (`ca-pub-…`) into `adsense.client` and redeploy. This adds the AdSense script, the verification tag and `ads.txt`.
3. In AdSense, open **Privacy & messaging** and turn on the European regulations (GDPR) message. Visitors in the EEA, UK and Switzerland must consent before personalised ads, and this is Google's own certified consent tool, so you don't need anything else. The "Cookie settings" link in the footer reopens it.
4. Either switch on **Auto ads**, or create ad units and paste their IDs into `adsense.slots`. They will appear in the reserved spaces: one on the home page, three on each drive page, and one each in the driving guide, the car hire guide and the theme pages.

### 6. Join the affiliate programmes

Sign up with the partners in `site.config.mjs` (Discover Cars, Booking.com, GetYourGuide) or your own choices. Paste each tracked link into `affiliates`, keeping `{q}` where the place name should go. Links already carry `rel="sponsored"`, and every booking box and the footer disclose that they are affiliate links.

Do this on day one. Some programmes review your site before approving it, but they're generally less strict about traffic than AdSense, and the car hire guide is written to send people to car hire.

### 7. Analytics

Turn on Cloudflare Web Analytics for the Pages project. It is cookieless, so it needs no consent. If you host elsewhere, paste the token into `analytics.cloudflareToken`.

### 8. Optional: newsletter

Create a free list with Buttondown, Kit or Mailchimp, copy its embed form's action URL and email field name into `newsletter` in `site.config.mjs`, and rebuild. The sign-up box then appears on the home page, every drive page and the theme pages, and the Privacy page gains a newsletter section.

## Earning from the site

In roughly the order they start paying:

1. **Car hire affiliate.** The best fit for a road-trip site. Discover Cars pays a share of its profit on each booking and tracks clicks for a year. The links are on every drive page, the car hire guide, the no-car guide and the driving guide.
2. **Tours and stays.** GetYourGuide links appear on the drives where tours from Dublin exist and in the no-car guide; Booking.com links on every drive page. Swap in your tracked links.
3. **Featured listings.** Once you have a few thousand visitors a month, offer cafés, pubs, restaurants and places to stay on each route a featured spot (see `/advertise/`). Add `featured: true` to their entry in `src/content/restaurants.mjs`: they move to the top of that drive's list with a "Featured partner" label, their website link is marked sponsored, and the planner labels them too. Always label paid placements; it's required under Irish advertising rules and by Google.
4. **Newsletter sponsorship.** A labelled mention in the monthly email, once the list is worth something.
5. **Display ads (AdSense).** They pay per thousand views, so they only add up once traffic grows. Apply once the site has some search traffic.

What grows all of these is search traffic, and what grows that is more useful pages and your own photos. Good next pages: a drive-by-season guide, Newgrange solstice and booking tips, and a page for each drive's best walk.

## Adding your photos

Your own photos from the drives are the best upgrade you can make: they're original, Google rewards first-hand travel content, and they show up in image search.

1. Put the files in `public/photos/<drive id>/`, for example `public/photos/glendalough/upper-lake.jpg`. JPG, PNG or WebP, about 1600 px on the long side and under 400 KB each.
2. List them in `src/content/photos.mjs` with a description (`alt`) and, if you like, a caption and credit.
3. Run `npm run build`. A gallery called "On the road" appears on that drive's page. The build reads each photo's size and stops with a clear message if a listed file is missing.

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

Listings are independent and unpaid unless marked `featured: true` (see "Earning from the site"). Each one links to a Google Maps search rather than a fixed address, so it keeps working if a place moves. Restaurants close and change hands more often than anything else on the site, so check `src/content/restaurants.mjs` whenever you re-check the drives.

### Optional: AI answers for questions the planner can't handle

By default the planner answers from the site's data and, when it doesn't understand a question, offers suggestions. You can let it pass those questions to Claude instead. It costs a small amount per question, paid to Anthropic.

1. Host on Cloudflare Pages with the Git integration (step 2 above), or deploy with `npx wrangler pages deploy dist` from this folder. Uploading the `dist` folder by drag and drop does not include the back end.
2. Create an API key in the [Claude Console](https://console.anthropic.com) and set a monthly spend limit there.
3. In the Cloudflare Pages project, open **Settings > Variables and Secrets** and add a secret called `ANTHROPIC_API_KEY` with the key. Optionally add `CHAT_MODEL` to use a different model.
4. Set `chat.ai` to `true` in `site.config.mjs` and push. The build generates `functions/api/chat.js` with the site's drives and restaurants built in, and Cloudflare serves it at `/api/chat`.
5. Add a rate limiting rule in Cloudflare (**Security > WAF > Rate limiting rules**) for requests to `/api/chat`, for example 10 requests per 10 seconds per IP, so nobody can run up your bill.

The back end only accepts requests from your own domain, sends at most the last eight messages, and keeps replies short. Claude is told to recommend only the drives and places on the site and not to invent opening hours or prices. When it's on, the Privacy page automatically says that unanswered planner questions are sent to Anthropic to generate a reply.

## Keeping it accurate

Opening times and access change. Each drive's "Know before you go" list links to its official sources. Re-check those every few months, update `src/content/trips.mjs`, `src/content/guides.mjs` (bus and tour details change too) and `src/content/restaurants.mjs`, and change `checked` in `site.config.mjs`.

## Licences

Archivo and Newsreader are used under the SIL Open Font License. The licence files are in `public/fonts/`. County boundaries are from [Natural Earth](https://www.naturalearthdata.com), which is in the public domain.
