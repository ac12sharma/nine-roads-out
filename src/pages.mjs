// Page templates. Every page is plain HTML generated at build time, so it is fast, indexable and works without JavaScript.
import { esc, fmtMins, mapsURL, fillQ, windWords, sunTimes, fmtClock } from './lib.mjs';
import { FILTERS } from './content/trips.mjs';
import { TYPES, mapsSearch } from './content/restaurants.mjs';
import { THEMES, NOCAR } from './content/guides.mjs';
import { TOTAL, levelFor, levelBands } from './shared/levels.mjs';
import { FAQS } from './content/faqs.mjs';
import { ARTICLES } from './content/articles.mjs';

export function createRenderer({ config, trips, assets, preview, restaurants, irelandMap, photos = {}, coords = {} }) {
  const adsOn = !!config.adsense.client && !preview;
  const year = new Date().getFullYear();
  const abs = (p) => config.siteUrl + p;
  const tripPath = (t) => '/' + t.slug + '/';
  const countyLabel = (c) => (c.includes('&') ? 'Counties ' + c.replace(' & ', ' and ') : 'County ' + c);

  // Production uses root-relative clean URLs. The preview build rewrites them to relative file paths.
  const urlFor = (depth) => (p) => {
    if (!preview) return p;
    const [pp, hash] = p.split('#');
    let rel = pp.replace(/^\//, '');
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    return (depth ? '../'.repeat(depth) : './') + rel + (hash !== undefined ? '#' + hash : '');
  };

  const logo = '<span class="mark" aria-hidden="true">9</span>';

  function adSlot(key, cls = '') {
    if (preview) return `<aside class="ad ad-demo ${cls}" aria-label="Advertisement"><p class="ad-label">Advertisement</p><div class="ad-box">Ad space, filled by Google AdSense after launch</div></aside>`;
    if (!adsOn) return '';
    const slot = config.adsense.slots[key];
    if (!slot) return ''; // Auto ads: Google chooses placements itself.
    return `<aside class="ad ${cls}" aria-label="Advertisement"><p class="ad-label">Advertisement</p><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(config.adsense.client)}" data-ad-slot="${esc(slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></aside>`;
  }

  // Newsletter sign-up. Hidden until config.newsletter.action is set; the preview shows a demo.
  function newsletter(where, u) {
    const N = config.newsletter || {};
    const demo = preview && !N.action;
    if (!N.action && !demo) return '';
    const hidden = Object.entries(N.hidden || {}).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('');
    return `<section class="news news-${where}" aria-labelledby="news-${where}"><div class="news-in">
<div class="news-copy"><h2 id="news-${where}">${esc(N.heading)}</h2><p>${esc(N.pitch)}</p></div>
<div class="news-act"><form class="news-form" action="${esc(N.action || '#')}" method="post" target="_blank"${demo ? ' data-demo' : ''}>
<label class="sr" for="news-email-${where}">Email address</label><input id="news-email-${where}" type="email" name="${esc(N.field || 'email')}" required placeholder="Your email address" autocomplete="email">${hidden}
<button class="btn" type="submit">Sign me up</button></form>
<p class="news-small">No spam, unsubscribe any time. See the <a href="${u('/privacy/')}">privacy policy</a>.</p></div>
</div></section>`;
  }

  const themeLinks = (t, u) => THEMES.filter((th) => th.pick(t)).map((th) => `<a href="${u('/' + th.slug + '/')}">${esc(th.nav)}</a>`).join('');

  function header(u, active, onHome) {
    const h = (p) => (onHome && p.startsWith('/#') ? p.slice(1) : u(p));
    const links = [['/#drives', 'Drives', 'drives'], ['/how-much-of-ireland/', 'Your Ireland', 'ireland'], ['/car-hire-dublin/', 'Car hire', 'hire'], ['/driving-guide/', 'Driving guide', 'guide'], ['/about/', 'About', 'about']];
    const nav = links.map(([p, l, k]) => `<a href="${h(p)}"${active === k ? ' aria-current="page"' : ''}>${l}</a>`).join('');
    return `<header class="mast"><div class="mast-in">
<a class="brand" href="${onHome ? '#top' : u('/')}">${logo}<span class="brand-t">${esc(config.name)}</span></a>
<nav class="nav" aria-label="Main">${nav}</nav>
<a class="lvl-pill" href="${u('/how-much-of-ireland/')}" hidden></a>
<details class="menu"><summary>Menu</summary><nav class="menu-panel" aria-label="Main menu">${nav}</nav></details>
</div></header>`;
  }

  function footer(u) {
    return `<footer class="foot"><div class="wrap foot-grid">
<div class="foot-brand"><a class="brand" href="${u('/')}">${logo}<span class="brand-t">${esc(config.name)}</span></a>
<p>An independent guide to the most beautiful day drives from Dublin city. Made in ${esc(config.owner.city)}.</p></div>
<nav aria-label="The drives"><h2>The drives</h2><ul>${trips.map((t) => `<li><a href="${u(tripPath(t))}">${esc(t.en)}</a></li>`).join('')}</ul></nav>
<nav aria-label="Plan your trip"><h2>Plan your trip</h2><ul>${THEMES.map((th) => `<li><a href="${u('/' + th.slug + '/')}">${esc(th.nav)}</a></li>`).join('')}<li><a href="${u('/car-hire-dublin/')}">Hiring a car in Dublin</a></li><li><a href="${u('/day-trips-from-dublin-without-a-car/')}">No car? Tours and buses</a></li><li><a href="${u('/driving-guide/')}">Driving guide</a></li></ul></nav>
<nav aria-label="This site"><h2>This site</h2><ul><li><a href="${u('/how-much-of-ireland/')}">Your Ireland map</a></li><li><a href="${u('/about/')}">About</a></li><li><a href="${u('/advertise/')}">Advertise with us</a></li><li><a href="${u('/contact/')}">Contact</a></li><li><a href="${u('/privacy/')}">Privacy and cookies</a></li><li><a href="${u('/terms/')}">Terms of use</a></li>${adsOn ? '<li><button type="button" class="linkish" data-consent>Cookie settings</button></li>' : ''}</ul></nav>
</div>
<div class="wrap foot-base"><p>Some links on this site are affiliate links. If you book through them, we may earn a commission at no extra cost to you.${adsOn ? ' Ads are served by Google.' : ''} Drive times are approximate. Details were last checked in ${esc(config.checked)}, but opening times and access change, so check official sites before you go.</p>
<p>© ${year} ${esc(config.name)}. Illustrations drawn in code.</p></div></footer>`;
  }

  function layout({ path, depth, title, desc, ogImage = '/og/home.jpg', ogType = 'website', jsonld = [], body, active = '', onHome = false, fragment = false, preload = '', tripId = '' }) {
    const u = urlFor(depth);
    const adsHead = adsOn ? `<meta name="google-adsense-account" content="${esc(config.adsense.client)}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(config.adsense.client)}" crossorigin="anonymous"></script>` : '';
    const analytics = config.analytics.cloudflareToken && !preview ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${esc(config.analytics.cloudflareToken)}"}'></script>` : '';
    const head = `<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(abs(path))}">
<meta property="og:site_name" content="${esc(config.name)}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(abs(path))}">
<meta property="og:image" content="${esc(abs(ogImage))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_IE">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ECEFE8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0F1613" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${u('/apple-touch-icon.png')}">
<link rel="manifest" href="${u('/site.webmanifest')}">
${preload}
<link rel="preload" href="${u('/fonts/archivo-v2.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u('/fonts/newsreader-v2.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u(assets.css)}">
${adsHead}
${analytics}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}`;
    const doc = `<a class="skip" href="#main">Skip to content</a>
<span id="top"></span>
${header(u, active, onHome)}
<main id="main">${body}</main>
${footer(u)}
<div id="planner" data-src="${u(assets.data)}" data-root="${preview ? (depth ? '../'.repeat(depth) : './') : '/'}" data-index="${preview ? 'index.html' : ''}" data-ai="${config.chat.ai && !preview ? esc(config.chat.endpoint) : ''}" data-site="${esc(config.siteUrl)}" data-trip="${tripId}"></div>
<script src="${u(assets.scenes)}" defer></script>
<script src="${u(assets.app)}" defer></script>`;
    if (fragment) return head + '\n' + doc + '\n';
    return `<!doctype html>
<html lang="en-IE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${head}
</head>
<body>
${doc}
</body>
</html>
`;
  }

  /* ---------- shared pieces ---------- */
  // Scene card image with a 720px version for phones. `sizes` is the width the image is shown at.
  const CARD_SIZES = { card: '(max-width: 640px) calc(100vw - 32px), (max-width: 1000px) 46vw, 360px', hub: '(max-width: 900px) 46vw, 280px', wide: '(max-width: 640px) calc(100vw - 32px), 420px' };
  const cardImg = (id, u, sizes, eager = false) => `<img src="${u('/images/scenes/' + id + '-card.webp')}" srcset="${u('/images/scenes/' + id + '-card-sm.webp')} 720w, ${u('/images/scenes/' + id + '-card.webp')} 960w" sizes="${CARD_SIZES[sizes]}" width="960" height="640" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

  function card(t, u, eager = false) {
    return `<li class="card" data-id="${t.id}"><a class="card-a" href="${u(tripPath(t))}">
<span class="card-img">${cardImg(t.id, u, 'card', eager)}</span>
<span class="card-ga" lang="ga">${esc(t.ga)}</span>
<span class="card-en">${esc(t.en)}</span>
<span class="card-meta"><span class="card-time">${fmtMins(t.mins)}</span><span class="card-dir" title="Heading from Dublin">${t.wind}</span><span class="card-wheel">about ${fmtMins(t.drive * 60)} at the wheel</span></span>
<span class="card-via">${esc(t.via)}</span>
</a></li>`;
  }

  function roadChips(road) {
    return road.split(' · ').map((code) => {
      let m;
      if (code.charAt(0) === '~') return `<span class="road road-brown" title="Signposted scenic drive">${esc(code.slice(1))}</span>`;
      if (/^M\d/.test(code)) return `<span class="road road-m" title="Motorway">${esc(code)}</span>`;
      if ((m = /^N(\d+)/.exec(code))) return +m[1] < 50 ? `<span class="road road-np" title="National primary road">${esc(code)}</span>` : `<span class="road road-ns" title="National secondary road">${esc(code)}</span>`;
      if (/^R\d/.test(code)) return `<span class="road road-r" title="Regional road">${esc(code)}</span>`;
      return `<span class="road road-local">${esc(code)}</span>`;
    }).join('');
  }

  function planBox(t, u) {
    const A = config.affiliates;
    const items = [
      { href: A.carHire.url, title: 'Hire a car in Dublin', note: `Compare car hire prices on ${A.carHire.partner}` },
      { href: fillQ(A.stays.url, t.stay), title: `Stay near ${t.stayLabel}`, note: `Make a weekend of it. Places to stay on ${A.stays.partner}` },
    ];
    if (t.tour) items.push({ href: fillQ(A.tours.url, t.tour), title: 'No car? Take a guided tour', note: `Day tours from Dublin on ${A.tours.partner}` });
    return `<section class="plan" aria-labelledby="plan-${t.id}"><h2 id="plan-${t.id}">Plan this trip</h2><ul>${items.map((it) => `<li><a href="${esc(it.href)}" target="_blank" rel="sponsored noopener"><span class="plan-t">${esc(it.title)}</span><span class="plan-n">${esc(it.note)}</span></a></li>`).join('')}</ul><p class="plan-d">Affiliate links: if you book through them, we may earn a commission at no extra cost to you.</p><p class="plan-more"><a href="${u('/car-hire-dublin/')}">Read this before you hire a car</a><a href="${u('/day-trips-from-dublin-without-a-car/')}">No car? Which drives work by bus or tour</a></p></section>`;
  }

  function eatSection(t) {
    const list = [...(restaurants[t.id] || [])].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    if (!list.length) return '';
    const anyFeatured = list.some((r) => r.featured);
    const types = TYPES.filter((ty) => list.some((r) => r.type === ty));
    const cuisines = [...new Set(list.flatMap((r) => r.cuisine))].filter((c) => c !== 'Irish');
    const chip = (f, label, n, on = false) => `<button type="button" class="chip" data-f="${esc(f)}" aria-pressed="${on}">${esc(label)} <span class="n">${n}</span></button>`;
    const chips = [chip('all', 'All', list.length, true), ...types.map((ty) => chip('type:' + ty, ty, list.filter((r) => r.type === ty).length)), ...cuisines.map((c) => chip('cuisine:' + c, c, list.filter((r) => r.cuisine.includes(c)).length))].join('');
    return `<section class="eat" aria-labelledby="eat-${t.id}" data-eat>
<h2 class="sec-h" id="eat-${t.id}">Where to eat</h2>
${list.length > 2 ? `<div class="filters eat-filters" role="group" aria-label="Filter places to eat">${chips}</div>` : ''}
<ul class="eat-list">${list.map((r) => `<li class="eat-item${r.featured ? ' eat-featured' : ''}" data-type="${esc(r.type)}" data-cuisine="${esc(r.cuisine.join('|'))}">
${r.featured ? '<p class="eat-feat">Featured partner</p>' : ''}<div class="eat-top"><h3>${esc(r.name)}</h3><span class="eat-type">${esc(r.type)}</span></div>
<p class="eat-where">${esc(r.town)}, near ${esc(r.near.replace(/^Home (from|via) /, ''))}. ${esc(r.cuisine.join(', '))}.</p>
<p class="eat-note">${esc(r.note)}</p>
<p class="eat-links"><a href="${esc(mapsSearch(r))}" target="_blank" rel="noopener">Find on Google Maps</a>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="${r.featured ? 'sponsored noopener' : 'noopener'}">Website</a>` : ''}</p></li>`).join('')}</ul>
<p class="eat-disc">${anyFeatured ? 'Listings are independent and unpaid, except those marked Featured partner, which are paid placements.' : 'Listings are independent and unpaid.'} Opening hours change, so check before you go. <button type="button" class="linkish eat-ask" data-open-planner>Ask the trip planner</button></p>
</section>`;
  }

  function daylightBlock() {
    const s = sunTimes(new Date());
    const dh = (s.set.getTime() - s.rise.getTime()) / 36e5;
    return `<div class="daylight" aria-live="polite">
<p class="dl-label">Today in Dublin, <span id="dl-date">${new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Dublin' })}</span></p>
<div class="dl-times"><div><span class="dl-t" id="dl-rise">${fmtClock(s.rise)}</span><span class="dl-k">Sunrise</span></div><span class="dl-arrow" aria-hidden="true">→</span><div><span class="dl-t" id="dl-set">${fmtClock(s.set)}</span><span class="dl-k">Sunset</span></div></div>
<p class="dl-len" id="dl-len">${fmtMins(dh * 60)} of daylight</p>
<p class="dl-advice" id="dl-advice">Allow about three hours for stops on top of the driving time.</p></div>`;
  }

  /** "Photo: author, licence, via Wikimedia Commons", linked to the source page and the licence. */
  function photoCredit(/** @type {{ credit?: string, licence?: string, licenceUrl?: string, source?: string }} */ p) {
    if (!p.credit) return '';
    const who = p.source ? `<a href="${esc(p.source)}" target="_blank" rel="noopener">${esc(p.credit)}</a>` : esc(p.credit);
    if (!p.licence) return ` <span class="ph-credit">Photo: ${who}</span>`;
    const lic = p.licenceUrl ? `<a href="${esc(p.licenceUrl)}" target="_blank" rel="noopener license">${esc(p.licence)}</a>` : esc(p.licence.toLowerCase());
    const changed = /^CC BY/.test(p.licence) ? ', resized' : '';
    return ` <span class="ph-credit">Photo: ${who}, ${lic}${changed}${/commons\.wikimedia\.org/.test(p.source || '') ? ', via Wikimedia Commons' : ''}</span>`;
  }

  /** The "Image credits" section on the About page: every photo not taken for the site, with its licence. */
  function imageCredits(/** @type {(p: string) => string} */ u) {
    const rows = trips.flatMap((t) => (photos[t.id] || []).filter((p) => p.licence).map((p) => `<li><a href="${u(tripPath(t))}">${esc(t.en)}</a>: ${esc(p.caption || p.alt)}.${photoCredit(p).replace(' <span class="ph-credit">', ' ').replace(/<\/span>$/, '')}</li>`));
    if (!rows.length) return '';
    return `<h2 id="image-credits">Image credits</h2><p>The photos on the drive pages are from Wikimedia Commons, used under their CC0, CC BY or public domain terms. Each is credited under the photo, and listed here.</p><ul class="credits">${rows.join('')}</ul>`;
  }

  function photoGallery(t, u) {
    const list = photos[t.id] || [];
    if (!list.length) return '';
    const wide = (/** @type {number} */ k) => k === 0 && list.length !== 2;
    const img = (/** @type {any} */ p, /** @type {number} */ k) => `<img src="${u('/photos/' + p.file)}"${p.small ? ` srcset="${u('/photos/' + p.small)} 800w, ${u('/photos/' + p.file)} 1600w" sizes="${wide(k) || list.length === 1 ? '(max-width: 760px) 100vw, 760px' : '(max-width: 760px) 100vw, 380px'}"` : ''} width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy" decoding="async">`;
    return `<section class="photos" aria-labelledby="ph-${t.id}"><h2 class="sec-h" id="ph-${t.id}">Photos</h2><div class="ph-grid">${list.map((p, k) => `<figure class="ph${wide(k) ? ' ph-wide' : ''}">${img(p, k)}${p.caption || p.credit ? `<figcaption>${esc(p.caption || '')}${photoCredit(p)}</figcaption>` : ''}</figure>`).join('')}</div></section>`;
  }

  /* ---------- home ---------- */
  function home({ fragment = false } = {}) {
    const u = urlFor(0);
    const data = trips.map((t) => ({ id: t.id, en: t.en, mins: t.mins, drive: t.drive, wind: t.wind, b: Math.round(t.b * 10) / 10, tags: t.tags, url: u(tripPath(t)) }));
    const rows = trips.map((t) => `<li><a class="row" href="${u(tripPath(t))}" data-id="${t.id}"><span class="bear" title="Heading from Dublin: ${Math.round(t.b)}°">${t.wind}</span><span class="row-main"><span class="row-name">${esc(t.en)}</span><span class="row-meta">${esc(t.county)}, about ${fmtMins(t.drive * 60)} at the wheel</span><span class="wheel" aria-hidden="true"><i style="width:${Math.min(100, (t.drive / 6) * 100).toFixed(1)}%"></i></span></span><span class="row-time">${fmtMins(t.mins)}</span></a></li>`).join('');
    const counts = Object.fromEntries(FILTERS.map(([k]) => [k, k === 'all' ? trips.length : trips.filter((t) => t.tags.includes(k)).length]));
    const body = `
<section class="hero">
<picture class="hero-still"><source media="(max-width: 640px)" srcset="${u('/images/scenes/hero-tall.webp')}"><img src="${u('/images/scenes/hero-wide.webp')}" width="1600" height="900" alt="" fetchpriority="high"></picture>
<canvas data-scene="hero" role="img" aria-label="Illustration: dawn over Lough Tay in the Wicklow Mountains, a black lake with a pale crescent beach below steep slopes, with mist in the valley."></canvas>
<div class="wrap hero-in">
<p class="hero-kicker">Day trips by car from Dublin city</p>
<p class="hero-ga" lang="ga">Naoi mBóthar Amach</p>
<h1>Nine Roads Out</h1>
<p class="hero-lede">Bog passes, a glacial fjord, cliff coasts and tombs older than the pyramids. The nine most beautiful day drives from Dublin, with every stop, every road number and what to know before you go.</p>
<p class="hero-ctas"><a class="btn btn-light" href="#drives">See the nine drives</a><a class="hero-link" href="#map">Plan by drive time</a><button type="button" class="hero-link hero-ask" data-open-planner>Ask the trip planner</button></p>
</div>
</section>

<section id="drives" class="wrap drives">
<div class="sec-head"><h2>The nine drives</h2><p class="sub">Sorted by drive time from Dublin city centre. Every one loops back to the city in a day.</p>
<div class="filters" id="filters" role="group" aria-label="Filter by scenery">${FILTERS.map(([k, l]) => `<button type="button" class="chip" data-f="${k}" aria-pressed="${k === 'all'}">${l} <span class="n">${counts[k]}</span></button>`).join('')}</div>
<p class="filter-note" id="filter-note" aria-live="polite"></p></div>
<ul class="cards" id="cards">${trips.map((t) => card(t, u)).join('')}</ul>
</section>

<section class="wrap hubs" aria-labelledby="hubs-h">
<div class="sec-head"><h2 id="hubs-h">Find your kind of drive</h2></div>
<ul class="hub-list">${THEMES.map((th) => `<li><a class="hub" href="${u('/' + th.slug + '/')}"><span class="hub-img">${cardImg(th.og, u, 'hub')}</span><span class="hub-t"><span class="hub-n">${esc(th.nav)}</span><span class="hub-m">${trips.filter(th.pick).length} drives</span></span></a></li>`).join('')}</ul>
<p class="hub-more">No car? <a href="${u('/day-trips-from-dublin-without-a-car/')}">Here’s which drives work by bus or tour</a>. Hiring one? <a href="${u('/car-hire-dublin/')}">Read this first</a>.</p>
</section>

${adSlot('home', 'wrap')}

<section id="map" class="wrap pick">
<div class="sec-head"><h2>Plan by drive time</h2><p class="sub">Each drive sits on its real compass bearing from the city, at the distance of its drive time. Set how long you'll drive each way and the rest fade back.</p></div>
<div class="pick-grid">
<figure class="dial"><svg id="dial" viewBox="0 0 520 520" role="group" aria-label="Map of the nine drives by compass bearing and drive time from Dublin"></svg>
<div class="range"><label for="reach">How long will you drive each way?</label><div class="range-row"><output id="reach-out" for="reach">1 h 45</output><span class="count" id="reach-count"></span></div><input id="reach" type="range" min="45" max="150" step="5" value="105"></div></figure>
<div><ul class="index" id="index">${rows}</ul><p class="index-note">Times run from Dublin city centre to the first big stop. The bar shows total hours at the wheel for the round trip.</p></div>
</div>
</section>

<section class="wrap lvl-teaser" aria-labelledby="lvl-h"><div class="lvl-band">
<div><h2 id="lvl-h">How much of Ireland have you driven?</h2><p>Tick off drives and counties on the map to find your traveller level, from Level 1 day-tripper to Level 3 grand tourer.</p></div>
<div class="lvl-band-r"><p class="lvl-now" data-lvl-now hidden></p><a class="btn" href="${u('/how-much-of-ireland/')}">Find your level</a></div>
</div></section>

<div class="wrap">${newsletter('home', u)}</div>

<section id="before" class="wrap before">
<div class="sec-head"><h2>Before you set off</h2></div>
<div class="before-grid">
${daylightBlock()}
<div>
<ul class="tips">
<li><h3>Tolls</h3><p>The M50 toll is barrier-free, so pay online at <a href="https://www.eflow.ie/" target="_blank" rel="noopener">eflow.ie</a> by 8pm the next day. The M1, M3 and M7/M8 have toll plazas you pay as you pass.</p></li>
<li><h3>Narrow roads</h3><p>Regional and mountain roads are narrow, often with stone walls tight to the tarmac. Expect sheep, tractors and cyclists round blind bends.</p></li>
<li><h3>Weather</h3><p>On the mountain and coast drives, the weather is the view. Check <a href="https://www.met.ie/" target="_blank" rel="noopener">Met Éireann</a> the night before and keep a closer drive in reserve.</p></li>
<li><h3>Heritage Card</h3><p>Brú na Bóinne, the Rock of Cashel, Cahir Castle and Clonmacnoise are OPW sites. The OPW Heritage Card covers entry to all of them for a year.</p></li>
</ul>
<p class="more-link"><a href="${u('/driving-guide/')}">Read the full driving guide</a>, with speed limits, road signs and daylight for every month.</p>
</div>
</div>
</section>
<script type="application/json" id="trip-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
    return layout({
      path: '/', depth: 0, onHome: true, fragment,
      title: preview ? config.name : `${config.name}: the most beautiful day drives from Dublin`,
      desc: 'Nine of the most beautiful day trips by car from Dublin city: Glendalough, Newgrange, Carlingford, the Copper Coast, Hook Head and more, with routes, road numbers and tips.',
      preload: `<link rel="preload" as="image" fetchpriority="high" href="${u('/images/scenes/hero-wide.webp')}" media="(min-width: 641px)"><link rel="preload" as="image" fetchpriority="high" href="${u('/images/scenes/hero-tall.webp')}" media="(max-width: 640px)">`,
      jsonld: [
        { '@context': 'https://schema.org', '@type': 'WebSite', name: config.name, url: abs('/'), inLanguage: 'en-IE' },
        { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Day drives from Dublin', itemListElement: trips.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(tripPath(t)), name: t.en })) },
      ],
      body,
    });
  }

  /* ---------- drive pages ---------- */
  function trip(t, i) {
    const path = tripPath(t), u = urlFor(1);
    const prev = trips[i - 1], next = trips[i + 1];
    const more = [1, 2, 3].map((k) => trips[(i + k) % trips.length]);
    const stops = t.stops.filter((s) => !s.home);
    const shareText = `${t.en}: a day drive from Dublin`;
    const route = `<li class="stop start"><h3>Dublin city centre</h3></li>` + t.stops.map((s) => `<li class="leg"><span class="sr">Road: </span>${roadChips(s.road)}</li><li class="stop${s.home ? ' home' : ''}"><h3>${esc(s.n)}</h3><p>${esc(s.t)}</p></li>`).join('');
    const body = `
<nav class="wrap crumbs" aria-label="Breadcrumb"><ol><li><a href="${u('/')}">Home</a></li><li><a href="${u('/#drives')}">Drives</a></li><li aria-current="page">${esc(t.en)}</li></ol></nav>
<article class="trip">
<div class="wrap">
<figure class="plate">
<picture><source media="(max-width: 640px)" srcset="${u('/images/scenes/' + t.id + '-plate-sm.webp')}"><img src="${u('/images/scenes/' + t.id + '-plate.webp')}" width="1600" height="700" alt="" fetchpriority="high"></picture>
<canvas data-scene="${t.scene}" role="img" aria-label="${esc(t.alt)}"></canvas>
<figcaption>${esc(t.sig)}, ${t.lat.toFixed(3)}° N, ${Math.abs(t.lon).toFixed(3)}° W</figcaption>
</figure>
<header class="trip-head"><p class="ga" lang="ga">${esc(t.ga)}</p><h1 class="trip-title">${esc(t.en)}</h1><p class="via">${esc(t.via)}. ${countyLabel(t.county)}.</p></header>
<div class="trip-grid">
<div class="trip-main">
<dl class="facts">
<div><dt>From Dublin</dt><dd>${fmtMins(t.mins)}<small title="Heads ${windWords(t.wind)} from Dublin">${t.wind}</small></dd></div>
<div><dt>Round trip</dt><dd>≈ ${t.km} km</dd></div>
<div><dt>At the wheel</dt><dd>≈ ${fmtMins(t.drive * 60)}</dd></div>
<div><dt>Best time</dt><dd class="best">${esc(t.best)}</dd></div>
</dl>
<p class="lede">${esc(t.lede)}</p>
<div class="share" data-url="${esc(abs(path))}" data-title="${esc(shareText)}"><button type="button" class="share-b" data-share="copy">Copy link</button><a class="share-b" href="https://wa.me/?text=${encodeURIComponent(shareText + ' ' + abs(path))}" target="_blank" rel="noopener">Send on WhatsApp</a><button type="button" class="share-b" data-share="native" hidden>Share</button><button type="button" class="share-b" data-print>Print route card</button><span class="share-msg" role="status"></span></div>
<div class="done"><button type="button" class="done-b" data-done="${t.id}" data-counties="${esc(t.counties.join('|'))}" aria-pressed="false"><span class="done-box" aria-hidden="true"></span><span class="done-t">I've done this drive</span></button><p class="done-msg" data-done-msg aria-live="polite">Tick it off to add ${t.counties.length} counties to <a href="${u('/how-much-of-ireland/')}">your Ireland map</a>.</p></div>
${adSlot('inArticle')}
<h2 class="sec-h">The route</h2>
<ol class="route">${route}</ol>
${photoGallery(t, u)}
<aside class="know" aria-labelledby="know-${t.id}"><h2 class="know-tag" id="know-${t.id}">Know before you go</h2><ul>${t.know.map((k) => `<li>${esc(k)}</li>`).join('')}</ul><p class="official">${t.links.map((l) => `<a href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])}</a>`).join('')}</p><p class="checked">Checked against these official pages on <time datetime="${t.checked}">${longDate(t.checked)}</time>. Opening times and rules change, so check before you go.</p></aside>
${eatSection(t)}
${faqSection(t.id)}
<p class="th-links"><span>More like this:</span>${themeLinks(t, u)}</p>
${relatedLine([...ARTICLES.filter((ar) => ar.related.includes(path)).map((ar) => `/${ar.slug}/`), '/best-time-of-year-for-each-drive/'].filter((p, i, l) => l.indexOf(p) === i), u, 'Guides')}
${newsletter('trip', u)}
<p class="print-only print-foot">${esc(abs(path).replace(/^https?:\/\//, ''))}. Drive times are approximate. Check opening times and road conditions before you set off.</p>
</div>
<aside class="trip-side" aria-label="Plan this drive"><div class="side-in">
<a class="btn btn-block" href="${esc(mapsURL(t))}" target="_blank" rel="noopener">Open the route in Google Maps</a>
<p class="maps-note">Directions from Dublin through the main stops.</p>
${gpxLink(t, u)}
${planBox(t, u)}
${adSlot('sidebar', 'ad-side')}
</div></aside>
</div>
<nav class="trip-foot" aria-label="Previous and next drive">
${prev ? `<a class="pn pn-prev" href="${u(tripPath(prev))}"><span class="pn-k">Previous drive</span><span class="pn-n">${esc(prev.en)}</span><span class="pn-m">${fmtMins(prev.mins)} from Dublin</span></a>` : `<a class="pn pn-prev" href="${u('/#drives')}"><span class="pn-k">Back to</span><span class="pn-n">All drives</span><span class="pn-m">Nine roads out of Dublin</span></a>`}
${next ? `<a class="pn pn-next" href="${u(tripPath(next))}"><span class="pn-k">Next drive</span><span class="pn-n">${esc(next.en)}</span><span class="pn-m">${fmtMins(next.mins)} from Dublin, heading ${windWords(next.wind)}</span></a>` : `<a class="pn pn-next" href="${u('/driving-guide/')}"><span class="pn-k">Before you go</span><span class="pn-n">Driving guide</span><span class="pn-m">Tolls, speed limits, signs and daylight</span></a>`}
</nav>
</div>
</article>
${adSlot('footer', 'wrap')}
<section class="wrap more"><h2>More drives from Dublin</h2><ul class="cards cards-3">${more.map((m) => card(m, u)).join('')}</ul></section>`;
    return layout({
      path, depth: 1, ogType: 'article', ogImage: `/og/${t.id}.jpg`, tripId: t.id,
      title: `${t.en} day trip from Dublin | ${config.name}`,
      desc: t.desc,
      preload: `<link rel="preload" as="image" fetchpriority="high" href="${u('/images/scenes/' + t.id + '-plate.webp')}" media="(min-width: 641px)"><link rel="preload" as="image" fetchpriority="high" href="${u('/images/scenes/' + t.id + '-plate-sm.webp')}" media="(max-width: 640px)">`,
      jsonld: [
        {
          '@context': 'https://schema.org', '@type': 'TouristTrip', name: `${t.en}: ${t.via}`, description: t.desc, url: abs(path), image: abs(`/og/${t.id}.jpg`),
          touristType: 'Day trip by car from Dublin',
          itinerary: { '@type': 'ItemList', numberOfItems: stops.length, itemListElement: stops.map((s, k) => ({ '@type': 'ListItem', position: k + 1, item: { '@type': 'TouristAttraction', name: s.n, description: s.t } })) },
        },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') }, { '@type': 'ListItem', position: 2, name: t.en, item: abs(path) }] },
        ...faqJsonld(t.id),
      ],
      body,
    });
  }

  /* ---------- prose pages ---------- */
  const longDate = (/** @type {string} */ iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const plain = (/** @type {string} */ html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

  /** Visible questions and answers, each linking to the official page it comes from. */
  function faqSection(/** @type {string} */ key, heading = 'Questions people ask') {
    const list = FAQS[key];
    if (!list) return '';
    return `<section class="faq" aria-labelledby="faq-${key}"><h2 id="faq-${key}">${esc(heading)}</h2>${list.map((f) => `<h3>${esc(f.q)}</h3><p>${f.a} <a class="faq-src" href="${esc(f.source)}" target="_blank" rel="noopener">Source</a></p>`).join('')}</section>`;
  }
  /** The same questions as FAQPage structured data. */
  function faqJsonld(/** @type {string} */ key) {
    const list = FAQS[key];
    if (!list) return [];
    return [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })) }];
  }
  /** "Sources" list at the bottom of a guide: [label, url] pairs, all read on `checked`. */
  function sourcesList(/** @type {[string, string][]} */ list, /** @type {string} */ checked) {
    return `<h2 id="sources">Sources</h2><p class="src-note">Official pages this guide is based on, read on ${longDate(checked)}. Timetables, prices and rules change, so check them before you travel.</p><ul class="sources">${list.map(([label, url]) => `<li><a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a></li>`).join('')}</ul>`;
  }

  /** Download link for the drive's GPX file, saying how many stops it holds. */
  function gpxLink(/** @type {{ id: string, slug: string, stops: { home?: boolean }[] }} */ t, /** @type {(p: string) => string} */ u) {
    const list = coords[t.id] || [], ok = list.filter((/** @type {{ lat?: number }} */ c) => c.lat != null).length;
    if (!ok) return '';
    return `<p class="gpx"><a href="${u('/gpx/' + t.slug + '.gpx')}" download>Download the stops as GPX</a><span>${ok} of ${list.length} stops, for a sat-nav or mapping app.${ok < list.length ? ' Stops without a verified position are left out.' : ''}</span></p>`;
  }

  function prosePage({ path, title, h1, lede, desc, content, active = '', jsonld = [], ogImage = '/og/home.jpg', ogType = 'website', related = [] }) {
    const u = urlFor(1);
    const body = `<nav class="wrap crumbs" aria-label="Breadcrumb"><ol><li><a href="${u('/')}">Home</a></li><li aria-current="page">${esc(h1)}</li></ol></nav>
<article class="wrap prose-page"><header class="prose-head"><h1>${esc(h1)}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</header><div class="prose">${content(u)}${relatedLine(related, u)}</div></article>`;
    return layout({ path, depth: 1, title: `${title} | ${config.name}`, desc, body, active, jsonld, ogImage, ogType });
  }

  function guide() {
    const y = new Date().getFullYear();
    const rows = Array.from({ length: 12 }, (_, m) => {
      const d = new Date(Date.UTC(y, m, 15, 12));
      const s = sunTimes(d);
      return `<tr><th scope="row">${d.toLocaleDateString('en-IE', { month: 'long', timeZone: 'UTC' })}</th><td>${fmtClock(s.rise)}</td><td>${fmtClock(s.set)}</td><td>${fmtMins((s.set.getTime() - s.rise.getTime()) / 6e4)}</td></tr>`;
    }).join('');
    return prosePage({
      path: '/driving-guide/', active: 'guide', related: ['/best-time-of-year-for-each-drive/', '/car-hire-dublin/', '/day-trips-from-dublin-without-a-car/'],
      title: 'Driving from Dublin: tolls, speed limits and signs',
      h1: 'Driving from Dublin: the day-trip guide',
      lede: 'What makes a day drive from Dublin go smoothly: tolls, speed limits, how to read Irish road signs, narrow roads, weather and how much daylight you will get.',
      desc: 'A practical guide to day drives from Dublin: the M50 toll, Irish speed limits, how to read road signs, narrow country roads, weather and daylight by month.',
      jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Driving from Dublin: the day-trip guide', author: { '@type': 'Person', name: config.owner.name }, publisher: { '@type': 'Organization', name: config.name }, inLanguage: 'en-IE', url: abs('/driving-guide/'), image: abs('/og/home.jpg') }],
      content: (u) => `
<h2 id="tolls">Tolls</h2>
<p>The M50 ring road around Dublin has a barrier-free toll between junctions 6 and 7. There is no booth: cameras read your number plate and you pay online at <a href="https://www.eflow.ie/" target="_blank" rel="noopener">eflow.ie</a> by 8pm the next day. If you are driving a hire car, ask at the desk how the company handles it.</p>
<p>The M1, M3, M7/M8 and a few other roads have toll plazas you pay as you drive through, by card or cash. Several of the drives on this site use one of them.</p>

<h2 id="speed">Speed limits</h2>
<p>Limits are in kilometres per hour, and the posted sign always wins. Where no sign says otherwise, the defaults are:</p>
<table class="t"><thead><tr><th scope="col">Road</th><th scope="col">Default limit</th></tr></thead><tbody>
<tr><th scope="row">Motorways</th><td>120 km/h</td></tr>
<tr><th scope="row">National roads</th><td>100 km/h</td></tr>
<tr><th scope="row">Regional roads</th><td>80 km/h</td></tr>
<tr><th scope="row">Rural local roads</th><td>60 km/h (cut from 80 in February 2025)</td></tr>
<tr><th scope="row">Towns and built-up areas</th><td>50 km/h, with many streets moving to 30 km/h</td></tr>
</tbody></table>
<p>More changes are on the way, including lower limits on national secondary roads and 30 km/h in many towns, so watch the signs rather than relying on memory.</p>

<h2 id="signs">Reading Irish road signs</h2>
<p>The colour of a direction sign tells you what kind of road it leads to. The road numbers on each drive page use the same colours.</p>
<ul class="signs">
<li><span class="road road-m">M1</span><span><strong>Motorways</strong> have blue signs with white lettering.</span></li>
<li><span class="road road-np">N11</span><span><strong>National primary roads</strong> have green signs, with the route number in yellow.</span></li>
<li><span class="road road-ns">N51</span><span><strong>National secondary roads</strong> also have green signs, with the route number in white.</span></li>
<li><span class="road road-r">R759</span><span><strong>Regional roads</strong> have white signs with black lettering.</span></li>
<li><span class="road road-brown">Ring of Hook</span><span><strong>Brown signs</strong> point to visitor attractions and signposted scenic drives.</span></li>
</ul>
<p>Place names are bilingual. The Irish name comes first in italics, with the English name below in capitals. In Gaeltacht areas, signs are in Irish only. The drive pages on this site follow the same convention in their headings.</p>
<p>Warning signs are yellow diamonds, not the red triangles used in Britain. Speed limits and distances are in kilometres.</p>

<h2 id="roads">Narrow roads</h2>
<p>Once you leave the motorway, roads narrow quickly. Many regional and local roads have stone walls or hedges right at the edge of the tarmac, and mountain roads like the Windy Gap are single-track in places.</p>
<ul><li>Slow down for blind bends. Sheep, tractors and cyclists are normal.</li><li>On single-track roads, whoever is nearer a gateway or wide spot pulls in.</li><li>Park only where it is allowed. Blocking a gate or a passing place stops farm traffic and emergency vehicles.</li></ul>

<h2 id="weather">Weather</h2>
<p>On the mountain and coast drives, the weather is the view. Fog on the Sally Gap or the Windy Gap means seeing nothing at all. Check <a href="https://www.met.ie/" target="_blank" rel="noopener">Met Éireann</a> the night before and keep a closer drive in reserve. Some mountain roads, including the R759 over the Sally Gap, are not gritted and can be impassable in snow or ice.</p>

${adSlot('guide')}

<h2 id="daylight">Daylight through the year</h2>
<p>Sunrise and sunset in Dublin on the 15th of each month, in Irish time. In midwinter there are fewer than eight hours of daylight, so pick a drive with under three and a half hours at the wheel.</p>
<div class="t-scroll"><table class="t t-num"><thead><tr><th scope="col">Month</th><th scope="col">Sunrise</th><th scope="col">Sunset</th><th scope="col">Daylight</th></tr></thead><tbody>${rows}</tbody></table></div>

<h2 id="car-hire">Hiring a car</h2>
<p>Most of these drives need a car. If you are hiring one in Dublin, book early for summer weekends. Automatic cars are less common in Irish rental fleets and tend to cost more, so reserve one well ahead if you need it. Check what the insurance covers before you sign, and ask how the company charges for the M50 toll.</p>
<p><a class="btn" href="${esc(config.affiliates.carHire.url)}" target="_blank" rel="sponsored noopener">Compare car hire on ${esc(config.affiliates.carHire.partner)}</a></p>
<p class="small">Affiliate link: if you book through it, we may earn a commission at no extra cost to you.</p>
<p>More on insurance, deposits, the toll and what to check at the desk: <a href="${u('/car-hire-dublin/')}">hiring a car in Dublin for a day trip</a>. No car at all? <a href="${u('/day-trips-from-dublin-without-a-car/')}">Here's which drives work without one</a>.</p>

<h2 id="heritage-card">OPW Heritage Card</h2>
<p>Brú na Bóinne, the Rock of Cashel, Cahir Castle and Clonmacnoise are run by the Office of Public Works. If you will visit several in a year, the <a href="https://heritageireland.ie/" target="_blank" rel="noopener">Heritage Card</a> covers entry to all of them.</p>

<h2 id="drives">The drives</h2>
<ul class="drive-list">${trips.map((t) => `<li><a href="${u(tripPath(t))}">${esc(t.en)}</a>, ${fmtMins(t.mins)} from Dublin, about ${fmtMins(t.drive * 60)} at the wheel</li>`).join('')}</ul>`,
    });
  }

  function about() {
    return prosePage({
      path: '/about/', active: 'about', related: ['/driving-guide/', '/how-much-of-ireland/', '/contact/', '/advertise/'], title: 'About', h1: 'About Nine Roads Out',
      lede: `Nine Roads Out is an independent guide to the most beautiful day drives from Dublin city, made in ${esc(config.owner.city)} by ${esc(config.owner.name)}.`,
      desc: 'Who makes Nine Roads Out, how the drives are chosen and checked, and how the site is funded.',
      content: (u) => `
<h2>How the drives are chosen</h2>
<p>Each drive fits comfortably into a day from Dublin city centre, loops back rather than retracing its steps where it can, and has at least one stop worth the journey on its own. Between them they cover the bog passes of Wicklow, the passage tombs of the Boyne, the fjord at Carlingford, the Midland mountains and the coasts of Waterford and Wexford.</p>
<h2>How the details are checked</h2>
<p>Opening arrangements, closures, booking rules and parking are checked against official sources such as Heritage Ireland, the National Parks and Wildlife Service, Coillte and local tourism offices. Each drive page links to the sources that matter for it. Details were last checked in ${esc(config.checked)}.</p>
<p>Things change. If you spot something out of date, please <a href="${u('/contact/')}">get in touch</a> and it will be fixed.</p>
<h2>How the site is funded</h2>
<p>The site is free to use. It is paid for by ${adsOn ? 'advertising, by ' : ''}affiliate links to car hire, places to stay and tours, and by featured listings.${adsOn ? '' : ' It does not show ads at the moment.'} If you book through an affiliate link, the site may earn a commission at no extra cost to you.</p>
<p>Featured listings are paid placements for businesses on the routes, and they are always labelled. Nobody can pay to have a drive included, to change what we say about a place, or to remove an independent listing. <a href="${u('/advertise/')}">How advertising works</a>.</p>
<h2>The pictures</h2>
<p>The scenes are illustrations drawn in code, in the spirit of the old Irish railway and tourism posters. Each one shows the drive's signature view, from the round tower at Glendalough to the lighthouse at Hook Head.</p>
${imageCredits(u)}`,
    });
  }

  function contact() {
    const e = config.contactEmail;
    return prosePage({
      path: '/contact/', related: ['/about/', '/advertise/', '/privacy/'], title: 'Contact', h1: 'Contact',
      lede: 'Corrections, suggestions and partnership enquiries are all welcome.',
      desc: 'How to contact Nine Roads Out with corrections, suggestions or partnership enquiries.',
      content: () => (e
        ? `<p>Email <a href="mailto:${esc(e)}">${esc(e)}</a>. You will usually get a reply within a few days.</p>
<p class="copy-row"><code id="email">${esc(e)}</code> <button type="button" class="share-b" data-copy="#email">Copy address</button><span class="share-msg" role="status"></span></p>`
        : `<p>A contact email address will be listed here.</p>`) + `
<h2>Reporting something out of date</h2>
<p>Tell us which drive and stop it is, what has changed and, if you can, where you saw the new information. Closures and booking rules matter most, because they can spoil a day out.</p>`,
    });
  }

  function privacy() {
    const e = config.contactEmail;
    const contactLine = (u) => (e ? `by email at <a href="mailto:${esc(e)}">${esc(e)}</a>` : `through the <a href="${u('/contact/')}">contact page</a>`);
    // Every statement below follows site.config.mjs, so the policy describes what the built site really does.
    const newsOn = !!(config.newsletter && config.newsletter.action);
    const cfToken = !!config.analytics.cloudflareToken;
    const thirdParty = [adsOn && "Google's ad script", cfToken && "Cloudflare's analytics script"].filter(Boolean);
    return prosePage({
      path: '/privacy/', related: ['/terms/', '/contact/', '/about/'], title: 'Privacy and cookies', h1: 'Privacy and cookies',
      lede: `This policy explains what information this site collects, why, and the choices you have. Last updated ${esc(config.checked)}.`,
      desc: 'How Nine Roads Out handles personal data, advertising cookies and affiliate links, and your rights under GDPR.',
      content: (u) => `
<h2>Who is responsible</h2>
<p>${esc(config.name)} is run by ${esc(config.owner.name)} in ${esc(config.owner.city)}, Ireland, who is the data controller for this site. You can get in touch ${contactLine(u)}.</p>
<h2>What we collect</h2>
<p>${config.newsletter && config.newsletter.action ? 'You do not need an account to use this site, and we only ask for your email address if you choose to sign up for the newsletter.' : 'You do not need an account to use this site and we do not ask for your name or email address.'} ${thirdParty.length ? `The fonts and images that make up the site are served from our own host. The exceptions are ${thirdParty.join(' and ')}, described below.` : 'The fonts, images and scripts that make up the site are served from our own host, so loading a page does not send your details to font or script services.'} This site does not set any cookies of its own.</p>
<ul>
<li><strong>Server logs.</strong> Our hosting provider records technical information such as IP address, browser type and the page requested, to keep the site secure and working. These logs are kept for a short period and are not used to identify you.</li>
<li><strong>Analytics.</strong> We may use Cloudflare Web Analytics to count visits. It does not use cookies and does not track you across other sites.</li>
<li><strong>Your Ireland map.</strong> If you tick off drives or counties, that list is saved in your browser's local storage on your device so it is there next time. It is never sent to us, and clearing your browser data removes it.</li>
</ul>
${config.newsletter && config.newsletter.action ? `<h2>Newsletter</h2>
<p>If you sign up for the newsletter, your email address is stored by our newsletter provider and used only to send you the newsletter. You can unsubscribe at any time with the link in every email, and your address is then removed from the list. We rely on your consent for this.</p>
` : ''}<h2>Trip planner</h2>
<p>The trip planner answers questions about drives, places to eat and timing inside your browser, using the information on this site.${config.chat.ai ? ' Questions it cannot answer that way are sent to Anthropic, the company that provides the AI model behind it, to generate a reply. Please do not type personal details into it.' : ' What you type is not sent anywhere.'}</p>
<h2>Advertising</h2>
${adsOn ? `<p>This site shows ads served by Google AdSense. If you are in the European Economic Area, the UK or Switzerland, you will be asked for your consent before any advertising cookies are set. With your consent, Google and its partners may use cookies to show ads based on your interests and to measure them. Without it, Google may still show limited, non-personalised ads.</p>
<p>You can change your choice at any time with the Cookie settings link at the bottom of every page. Google explains how it uses information from sites like this one at <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">policies.google.com</a>.</p>` : `<p>This site does not show ads at the moment, and no advertising cookies are set. If that changes, this policy will be updated before any ads appear, and visitors in the European Economic Area, the UK and Switzerland will be asked for consent before advertising cookies are used.</p>`}
<h2>Affiliate links</h2>
<p>Some links to car hire, accommodation and tour companies are affiliate links. When you follow one, that company may set its own cookies so it can credit us if you book. Their privacy policies apply on their sites.</p>
<h2>Legal basis</h2>
<p>${[adsOn && 'advertising cookies', newsOn && 'the newsletter'].filter(Boolean).length ? `We rely on your consent for ${[adsOn && 'advertising cookies', newsOn && 'the newsletter'].filter(Boolean).join(' and ')}, and on` : 'We rely on'} our legitimate interest in running a secure, working website for server logs and cookieless analytics.</p>
<h2>Your rights</h2>
<p>Under the GDPR you can ask to access, correct or delete personal data we hold about you, object to how it is used, or withdraw consent. To do so, contact us as above. You also have the right to complain to the Data Protection Commission in Ireland at <a href="https://www.dataprotection.ie/en" target="_blank" rel="noopener">dataprotection.ie</a>.</p>
<h2>Changes</h2>
<p>If this policy changes, the new version will be posted here with a new date.</p>`,
    });
  }

  function terms() {
    return prosePage({
      path: '/terms/', related: ['/privacy/', '/contact/', '/about/'], title: 'Terms of use', h1: 'Terms of use',
      lede: `By using ${esc(config.name)} you agree to these terms. Last updated ${esc(config.checked)}.`,
      desc: 'Terms of use for Nine Roads Out, including accuracy of information, safety, affiliate links and copyright.',
      content: () => `
<h2>Information only</h2>
<p>The routes, drive times, opening arrangements and other details on this site are for general information. They are checked carefully, but conditions change. Always check official sources before you travel, especially for bookings, closures and weather.</p>
<h2>Your safety</h2>
<p>You are responsible for driving safely and legally. Follow road signs, speed limits and local rules, and do not use this site while driving. Some roads described here are narrow, steep or exposed. Decide for yourself whether a road is suitable for you, your vehicle and the conditions on the day.</p>
<h2>Links to other sites</h2>
<p>This site links to other websites, including official sources, maps and booking services. We are not responsible for their content or for any booking you make with them. Some links are affiliate links, which may earn us a commission at no extra cost to you.</p>
<h2>Liability</h2>
<p>To the extent the law allows, ${esc(config.name)} is not liable for any loss or damage arising from use of this site or reliance on its content. Nothing in these terms limits liability that cannot be limited under Irish law.</p>
<h2>Copyright</h2>
<p>The text and illustrations on this site belong to ${esc(config.owner.name)}. You are welcome to link to any page and share it. Please do not copy the content or illustrations for other websites without permission.</p>
<h2>Governing law</h2>
<p>These terms are governed by the laws of Ireland.</p>`,
    });
  }

  function ireland() {
    const u = urlFor(1), M = irelandMap, names = Object.keys(M.counties);
    const all = new Set(trips.flatMap((t) => t.counties));
    const bands = levelBands();
    const at = (/** @type {number} */ n) => (n / TOTAL * 100).toFixed(2) + '%';
    const svg = `<svg class="ie-map" viewBox="0 0 ${M.w} ${M.h}" role="group" aria-label="Map of the 26 counties of the Republic of Ireland. Select a county to mark it as driven." aria-describedby="ie-keys">
<path class="ie-ni" d="${M.ni}"/><text class="ie-ni-lab" x="300" y="92" text-anchor="middle">Northern Ireland</text>
<g class="ie-counties">${names.map((c) => `<path class="ie-c" d="${M.counties[c]}" data-county="${esc(c)}" tabindex="${c === 'Dublin' ? 0 : -1}" role="checkbox" aria-checked="false" aria-label="${esc(c)}"><title>${esc(c)}</title></path>`).join('')}</g>
<circle class="ie-dub" cx="${M.dublin[0]}" cy="${M.dublin[1]}" r="3.5"/><text class="ie-dub-lab" x="${M.dublin[0] + 7}" y="${M.dublin[1] + 4}">Dublin</text>
</svg>`;
    const body = `<nav class="wrap crumbs" aria-label="Breadcrumb"><ol><li><a href="${u('/')}">Home</a></li><li aria-current="page">Your Ireland</li></ol></nav>
<section class="wrap ie">
<header class="prose-head"><h1>How much of Ireland have you driven?</h1><p class="lede">Tick off the drives you've done and tap any other county you've driven in. You'll see how much of the Republic's 26 counties you've covered, and what level of traveller that makes you.</p></header>
<div class="ie-grid">
<figure class="ie-fig">${svg}<figcaption><span class="ie-key ie-key-d"></span>From drives you've ticked off <span class="ie-key ie-key-m"></span>Counties you've added. Tap a county to add or remove it. Boundaries from Natural Earth.<span class="sr" id="ie-keys"> On a keyboard, the map is one stop: use the arrow keys to move to the neighbouring county, and Space or Enter to select it.</span></figcaption></figure>
<div class="ie-side">
<div class="lvl-card" aria-live="polite">
<div class="lvl-badge"><span class="lvl-plate" data-lvl-num>0</span><div><p class="lvl-k" data-lvl-k>Your level</p><p class="lvl-name" data-lvl-name>Not on the road yet</p></div></div>
<p class="lvl-pct"><span data-lvl-pct>0</span>%<span class="lvl-of"> of Ireland's counties</span></p>
<p class="lvl-count" data-lvl-count>0 of ${TOTAL} counties driven</p>
<div class="lvl-bar" aria-hidden="true"><i data-lvl-fill></i>${bands.slice(1).map((b) => `<span class="lvl-tick" style="left:${at(b.from)}"></span>`).join('')}</div>
<div class="lvl-scale" aria-hidden="true">${bands.map((b, i) => `<span${i ? ` style="left:${at(b.from)}"` : ''}>Level ${b.level.n}</span>`).join('')}</div>
<p class="lvl-next" data-lvl-next>Tick off a drive or tap a county to start.</p>
<div class="share lvl-share" data-url="${esc(abs('/how-much-of-ireland/'))}" data-title="How much of Ireland have you driven?"><button type="button" class="share-b" data-share="copy-level">Copy my result</button><a class="share-b" data-share-wa href="https://wa.me/?text=${encodeURIComponent('How much of Ireland have you driven? ' + abs('/how-much-of-ireland/'))}" target="_blank" rel="noopener">Send on WhatsApp</a><button type="button" class="share-b" data-share="native-level" hidden>Share</button><span class="share-msg" role="status"></span></div>
</div>
<h2 class="sec-h">Drives you've done</h2>
<ul class="ie-drives">${trips.map((t) => `<li><label class="ie-drive"><input type="checkbox" data-drive="${t.id}" data-counties="${esc(t.counties.join('|'))}"><span class="ie-drive-t"><span class="ie-drive-n">${esc(t.en)}</span><span class="ie-drive-c">${t.counties.join(', ')}</span></span></label><a class="ie-drive-link" href="${u(tripPath(t))}">See drive</a></li>`).join('')}</ul>
</div>
</div>
<section class="ie-all" aria-labelledby="ie-all-h"><h2 class="sec-h" id="ie-all-h">All 26 counties</h2><p class="sub">Tap any county you've driven in, on these drives or any other trip.</p>
<ul class="ie-chips">${names.map((c) => `<li><button type="button" class="chip ie-chip" data-county-chip="${esc(c)}" aria-pressed="false">${esc(c)}</button></li>`).join('')}</ul></section>
<section class="ie-how prose" aria-labelledby="ie-how-h"><h2 id="ie-how-h">How the levels work</h2>
<table class="t"><thead><tr><th scope="col">Level</th><th scope="col">Counties driven</th><th scope="col">Share of Ireland</th></tr></thead><tbody>
${bands.map((b) => `<tr><th scope="row">Level ${b.level.n}, ${b.level.name.toLowerCase()}</th><td>${b.from} to ${b.to}</td><td>${b.pctFrom}% to ${b.pctTo}%</td></tr>`).join('\n')}
</tbody></table>
<p>The share is of the 26 counties in the Republic. A county counts once you've driven on its roads, including on the way to somewhere else. All nine drives on this site together take in ${all.size} counties, which makes you a Level ${levelFor(all.size).n} traveller. Level 3 means heading west as well.</p>
<p>Your list is saved only in this browser, on this device. Nothing is sent to us.</p>
<p><button type="button" class="share-b" data-reset>Clear my map</button></p>
</section>
</section>`;
    return layout({
      path: '/how-much-of-ireland/', depth: 1, active: 'ireland', ogImage: '/og/ireland.jpg',
      title: `How much of Ireland have you driven? | ${config.name}`,
      desc: "Tick off the counties you've driven in and the drives you've done to see how much of Ireland you've covered by road, and whether you're a Level 1, 2 or 3 traveller.",
      body,
    });
  }

  /* ---------- theme pages: coastal, mountain, historic, short ---------- */
  function theme(th) {
    const path = '/' + th.slug + '/', u = urlFor(1);
    const list = trips.filter(th.pick);
    const others = THEMES.filter((x) => x !== th);
    const body = `<nav class="wrap crumbs" aria-label="Breadcrumb"><ol><li><a href="${u('/')}">Home</a></li><li><a href="${u('/#drives')}">Drives</a></li><li aria-current="page">${esc(th.nav)}</li></ol></nav>
<article class="wrap th">
<header class="prose-head"><h1>${esc(th.h1)}</h1><p class="lede">${esc(th.lede)}</p></header>
<div class="t-scroll th-compare"><table class="t"><caption class="sr">${esc(th.nav)} from Dublin compared</caption><thead><tr><th scope="col">Drive</th><th scope="col">From Dublin</th><th scope="col">At the wheel</th><th scope="col">Best time</th></tr></thead><tbody>
${list.map((t) => `<tr><th scope="row"><a href="${u(tripPath(t))}">${esc(t.en)}</a></th><td>${fmtMins(t.mins)}</td><td>≈ ${fmtMins(t.drive * 60)}</td><td>${esc(t.best)}</td></tr>`).join('')}
</tbody></table></div>
${th.daylight ? `<div class="th-daylight">${daylightBlock()}</div>` : ''}
<ol class="th-list">${list.map((t) => `<li class="th-item">
<a class="th-img" href="${u(tripPath(t))}" tabindex="-1" aria-hidden="true">${cardImg(t.id, u, 'wide')}</a>
<div class="th-body"><p class="th-ga" lang="ga">${esc(t.ga)}</p><h2><a href="${u(tripPath(t))}">${esc(t.en)}</a></h2>
<p class="th-meta">${fmtMins(t.mins)} from Dublin · about ${fmtMins(t.drive * 60)} at the wheel · ${countyLabel(t.county)}</p>
<p>${esc(th.angle[t.id] || t.lede)}</p>
<p class="th-go"><a href="${u(tripPath(t))}">See the route and every stop</a></p></div></li>`).join('')}</ol>
<section class="th-choose prose"><h2>Which one?</h2><p>${esc(th.choose)}</p></section>
${adSlot('guide')}
<section class="th-tips"><h2 class="sec-h">Before you go</h2><ul class="tips">${th.tips.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ul>
<p class="more-link"><a href="${u('/driving-guide/')}">Read the full driving guide</a> for tolls, speed limits, road signs and daylight by month.</p></section>
<nav class="th-more" aria-label="Other kinds of drive"><h2 class="sec-h">Other kinds of drive</h2><ul class="hub-list">${others.map((x) => `<li><a class="hub" href="${u('/' + x.slug + '/')}"><span class="hub-img">${cardImg(x.og, u, 'hub')}</span><span class="hub-t"><span class="hub-n">${esc(x.nav)}</span><span class="hub-m">${trips.filter(x.pick).length} drives</span></span></a></li>`).join('')}<li><a class="hub hub-plain" href="${u('/#drives')}"><span class="hub-t"><span class="hub-n">All nine drives</span><span class="hub-m">Sorted by drive time</span></span></a></li></ul></nav>
${newsletter('theme', u)}
</article>`;
    return layout({
      path, depth: 1, active: 'drives', ogImage: `/og/${th.og}.jpg`,
      title: `${th.title} | ${config.name}`, desc: th.desc, body,
      jsonld: [
        { '@context': 'https://schema.org', '@type': 'ItemList', name: th.h1, itemListElement: list.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(tripPath(t)), name: t.en })) },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') }, { '@type': 'ListItem', position: 2, name: th.nav, item: abs(path) }] },
      ],
    });
  }

  /* ---------- car hire guide (the main affiliate page) ---------- */
  function carHire() {
    const A = config.affiliates;
    const cta = (label) => `<div class="cta-box"><p class="cta-t">${label}</p><a class="btn" href="${esc(A.carHire.url)}" target="_blank" rel="sponsored noopener">Compare car hire on ${esc(A.carHire.partner)}</a><p class="small">Affiliate link: if you book through it, we may earn a commission at no extra cost to you.</p></div>`;
    const short = trips.filter((t) => t.drive <= 3.25);
    return prosePage({
      path: '/car-hire-dublin/', active: 'hire',
      title: 'Hiring a car in Dublin: insurance, tolls and tips',
      h1: 'Hiring a car in Dublin for a day trip',
      lede: 'Most of the drives on this site need a car. Here is what to sort out before you book one in Dublin: the insurance excess, the M50 toll, manual or automatic, and what to check before you drive off.',
      desc: 'What to know before hiring a car in Dublin for a day trip: insurance and the excess, credit card cover, the M50 toll in a hire car, licences, Northern Ireland and fuel.',
      jsonld: [...faqJsonld('car-hire'), { '@context': 'https://schema.org', '@type': 'Article', headline: 'Hiring a car in Dublin for a day trip', author: { '@type': 'Person', name: config.owner.name }, publisher: { '@type': 'Organization', name: config.name }, inLanguage: 'en-IE', url: abs('/car-hire-dublin/'), image: abs('/og/home.jpg') }],
      content: (u) => `
${cta('Compare prices from the big rental companies in one search.')}
<h2 id="where">Airport or city?</h2>
<p>Dublin Airport has the most rental desks, and it puts you straight onto the M1 and the M50, so you never have to drive through the city centre. A city pick-up can make sense if you are staying in town and only need the car for a day, but check the desk's opening hours, especially at weekends.</p>

<h2 id="automatic">Manual or automatic</h2>
<p>Many hire cars in Ireland are manual, and automatics are usually fewer, so if you need one, ask for it when you book. Everything is the mirror image of mainland Europe and North America: you drive on the left, and in a manual the gear stick is on your left.</p>

<h2 id="insurance">Insurance and the excess</h2>
<p>Car rental companies only have to offer basic third-party insurance, which doesn't cover damage to the rental car itself. Most quotes add cover for the car, often called collision damage waiver or CDW, but it usually comes with a high excess: the amount you pay if the car is damaged. Check the excess figure in your quote before you book.</p>
<ul>
<li><strong>The hire company's excess cover.</strong> You pay extra at the desk to bring the excess down. It is the simplest option.</li>
<li><strong>Excess insurance from another insurer.</strong> You buy a policy before you travel, which may cost less. If the car is damaged, the hire company still takes the excess from your card and you claim it back from your insurer.</li>
<li><strong>Read what's excluded.</strong> Whichever cover you choose, check what it leaves out before you sign. Country roads are narrow and often lined with stone walls.</li>
</ul>

<h2 id="credit-card">Paying, deposits and credit card cover</h2>
<p>You will usually need a credit card in the main driver's name for the security deposit, even if you booked with a debit card. If you decline the hire company's excess cover, ask how much they will hold on the card.</p>
<p>Some credit cards include rental car cover. Check your card's terms to see whether it applies in Ireland and what it asks of you, and get confirmation from the card provider before you rely on it.</p>

${cta('Ready to compare prices?')}

<h2 id="m50">The M50 toll in a hire car</h2>
<p>The M50 ring road has a barrier-free toll between Junction 6 (Blanchardstown) and Junction 7 (Lucan). Cameras on the gantry read the number plate, and the toll must be paid by 8pm the next day. Many of the larger rental companies pay the toll themselves, so ask at the desk who pays before you set off. If it is down to you, pay at <a href="https://eflow.ie/" target="_blank" rel="noopener">eflow.ie</a> in time to avoid penalties, and check the rental terms for any charge the company adds.</p>
<p>Every other toll road in Ireland, including the M1, M3, M4 and M7/M8, has a toll plaza with barriers. You pay as you pass, and the manual lanes take cash or card.</p>

<h2 id="licence">Licence and age</h2>
<p>Bring your full driving licence; the desk will want to see the licence itself. Which licences you can drive on depends on where they were issued:</p>
<ul>
<li><strong>EU and EEA licences</strong> can be used while they are valid. <strong>UK licences</strong> are fine for visitors.</li>
<li><strong>Licences from countries Ireland recognises for licence exchange</strong>, which include Australia, Canada and New Zealand, can be used for up to a year when visiting.</li>
<li><strong>Licences from anywhere else, including the US</strong>: Citizens Information says you can drive for up to 12 months as a visitor if you also have an international driving permit from your country.</li>
</ul>
<p>Hire companies set their own rules on top: many want at least two years' experience with a full licence, and many have age limits or extra fees for younger and older drivers. Check the terms before you book.</p>

<h2 id="northern-ireland">Driving into Northern Ireland</h2>
<p>There are no checks at the border, and on most roads you would not know you had crossed it. If you plan to drive into Northern Ireland, for example to the Mournes from Carlingford, tell the hire company when you book or pick up the car: some charge a cross-border fee, and their cover may depend on knowing. Speed limits in Northern Ireland are in miles per hour.</p>

<h2 id="fuel">Fuel</h2>
<p>Check the fuel policy in the rental agreement. Many are full to full: you collect the car with a full tank and return it full, or pay the company to fill it. Fill up near the return point and keep the receipt. Check whether the car takes petrol or diesel before you fill it, and read whether the cover you chose includes putting in the wrong fuel.</p>

<h2 id="checklist">Before you drive off</h2>
<ul>
<li>Walk round the car and photograph or film every panel, the wheels and the windscreen, with the rental agent if possible.</li>
<li>Check the fuel level and mileage match the paperwork.</li>
<li>Ask who pays the M50 toll and how.</li>
<li>Find the spare wheel or repair kit, the lights and the wipers before you leave the car park.</li>
<li>Save the company's breakdown number in your phone.</li>
</ul>

<h2 id="first-drive">Which drive first?</h2>
<p>If you are new to driving on the left, start with something short: ${short.map((t) => `<a href="${u(tripPath(t))}">${esc(t.en)}</a>`).join(', ').replace(/, ([^,]*)$/, ' and $1')} all keep the total driving under three and a half hours. See <a href="${u('/short-drives-from-dublin/')}">short drives from Dublin</a>, and the <a href="${u('/driving-guide/')}">driving guide</a> for speed limits and road signs.</p>
${adSlot('guide')}
${faqSection('car-hire')}
${sourcesList([
  ['Citizens Information: Foreign driving licences in Ireland', 'https://www.citizensinformation.ie/en/travel-and-recreation/motoring/driver-licensing/exchanging-foreign-driving-permit/'],
  ['Competition and Consumer Protection Commission: Renting a car', 'https://www.ccpc.ie/consumer-advice/cars/renting-a-car'],
  ['eFlow: About the M50 toll road', 'https://eflow.ie/how-it-works'],
  ['Transport Infrastructure Ireland: Pay a toll', 'https://www.tii.ie/en/roads-tolling/tolling-information/pay-a-toll/'],
], '2026-11-06')}
${cta('Compare car hire in Dublin')}
<p class="small">No car and don't want one? <a href="${u('/day-trips-from-dublin-without-a-car/')}">Here's which drives work by bus or on a tour</a>.</p>`,
    });
  }

  /* ---------- no car? ---------- */
  function noCar() {
    const A = config.affiliates;
    const groups = [
      ['easy', 'Easy without a car', 'Works without a car'],
      ['part', 'Part of the drive without a car', 'Partly'],
      ['car', 'You need a car', 'Needs a car'],
    ];
    const rows = (u) => trips.map((t) => `<tr><th scope="row"><a href="${u(tripPath(t))}">${esc(t.en)}</a></th><td>${groups.find((g) => g[0] === NOCAR[t.id].level)[2]}</td></tr>`).join('');
    const item = (t, u) => {
      const n = NOCAR[t.id];
      const links = n.links.map((l) => `<a href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])}</a>`);
      if (t.tour) links.unshift(`<a href="${esc(fillQ(A.tours.url, t.tour))}" target="_blank" rel="sponsored noopener">Find day tours on ${esc(A.tours.partner)}</a>`);
      return `<div class="nc-item"><h3><a href="${u(tripPath(t))}">${esc(t.en)}</a></h3><p>${esc(n.text)}</p>${links.length ? `<p class="nc-links">${links.join('')}</p>` : ''}</div>`;
    };
    return prosePage({
      path: '/day-trips-from-dublin-without-a-car/', active: 'drives',
      title: 'Day trips from Dublin without a car',
      h1: 'No car? Day trips from Dublin without driving',
      lede: 'Some of the nine drives work well by bus or on a guided tour. Others really need a car. Here is which is which, and the simplest way to do each one.',
      desc: 'Which day trips from Dublin work without a car: the bus to Glendalough, Newgrange tours, getting to Carlingford, Tramore and Cashel, and the drives that need a car.',
      jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Day trips from Dublin without a car', author: { '@type': 'Person', name: config.owner.name }, publisher: { '@type': 'Organization', name: config.name }, inLanguage: 'en-IE', url: abs('/day-trips-from-dublin-without-a-car/'), image: abs('/og/home.jpg') }],
      content: (u) => `
<table class="t"><thead><tr><th scope="col">Drive</th><th scope="col">Without a car</th></tr></thead><tbody>${rows(u)}</tbody></table>
<p>For buses and trains, the <a href="https://www.transportforireland.ie/" target="_blank" rel="noopener">TFI Journey Planner</a> has current times for every operator. Timetables change, so check it the day before.</p>
${groups.map(([k, h]) => `<h2 id="${k}">${h}</h2>${trips.filter((t) => NOCAR[t.id].level === k).map((t) => item(t, u)).join('')}`).join('\n')}
${sourcesList([
  ['St Kevin’s Bus: timetable', 'https://www.glendaloughbus.com/timetable.aspx'],
  ['Heritage Ireland: Brú na Bóinne', 'https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-knowth-and-dowth/'],
  ['Bus Éireann: route 161, Dundalk to Newry via Carlingford', 'https://www.buseireann.ie/routes-and-timetables/161'],
  ['Irish Rail: timetables by route', 'https://www.irishrail.ie/en-ie/train-timetables/timetables-by-route'],
  ['Transport for Ireland: Waterford city bus services', 'https://www.transportforireland.ie/plan-a-journey/network-maps/waterford-city-bus-services/'],
  ['Heritage Ireland: Loughcrew', 'https://heritageireland.ie/places-to-visit/loughcrew-megalithic-cemetery/'],
], '2026-11-07')}
<div class="cta-box"><p class="cta-t">Hire a car for the day</p><p>A one-day hire opens up all nine drives. <a href="${u('/car-hire-dublin/')}">Read what to know first</a>, then compare prices.</p><a class="btn" href="${esc(A.carHire.url)}" target="_blank" rel="sponsored noopener">Compare car hire on ${esc(A.carHire.partner)}</a><p class="small">Affiliate links: if you book through them, we may earn a commission at no extra cost to you.</p></div>`,
    });
  }

  /* ---------- advertise ---------- */
  function advertise() {
    const e = config.contactEmail;
    return prosePage({
      path: '/advertise/', related: ['/about/', '/contact/', '/coastal-drives-from-dublin/'], title: 'Advertise with us', h1: 'Advertise with Nine Roads Out',
      lede: `${esc(config.name)} is read by people planning a day out by car from Dublin, usually in the days before they go. If your business is on or near one of the nine routes, here is how to reach them.`,
      desc: 'Featured listings, newsletter sponsorship and sponsored guides for cafés, pubs, restaurants, places to stay and attractions on the day drives from Dublin.',
      content: (u) => `
<h2>Ways to work with us</h2>
<ul>
<li><strong>Featured listing on a drive.</strong> Your café, pub, restaurant or place to stay shown first in the listings for the drive that passes you, with a short description and a link to your website. It also shows up when someone asks the trip planner about that drive.</li>
<li><strong>Newsletter sponsorship.</strong> A short mention, clearly marked as sponsored, in the monthly newsletter.</li>
<li><strong>Sponsored guide.</strong> A clearly labelled article about your area, attraction or event, written to the same standard as the rest of the site.</li>
</ul>
<h2>The rules</h2>
<ul>
<li>Every paid placement is labelled, on the page and in the trip planner.</li>
<li>Nobody can pay to have a drive included, to change what we say about a place or to remove an independent listing.</li>
<li>Links to sponsors are marked as sponsored for search engines, as Google requires.</li>
<li>We only feature businesses we would be happy to send readers to.</li>
</ul>
<h2>Get in touch</h2>
${e ? `<p>Email <a href="mailto:${esc(e)}?subject=Advertising">${esc(e)}</a> with your business name, where you are and what you have in mind. We will reply with current visitor numbers for the drive and the rates.</p>` : `<p>Use the <a href="${u('/contact/')}">contact page</a> with your business name, where you are and what you have in mind.</p>`}
<p>Read <a href="${u('/about/')}">how the site is funded</a>.</p>`,
    });
  }

  function notFound() {
    const u = urlFor(0);
    const body = `<section class="wrap prose-page nf"><h1>This road doesn't go anywhere</h1><p class="lede">The page you were looking for isn't here. Try one of the nine drives instead.</p><ul class="cards cards-3">${trips.slice(0, 3).map((t) => card(t, u)).join('')}</ul><p><a class="btn" href="${u('/')}">Go to the home page</a></p></section>`;
    return layout({ path: '/404.html', depth: 0, title: `Page not found | ${config.name}`, desc: 'This page could not be found.', body });
  }

  /** "Related:" line of links at the end of a page. */
  function relatedLine(/** @type {string[]} */ paths, /** @type {(p: string) => string} */ u, label = 'Related') {
    if (!paths.length) return '';
    return `<p class="th-links"><span>${esc(label)}:</span>${paths.map((p) => `<a href="${u(p)}">${esc(pageLabel(p))}</a>`).join('')}</p>`;
  }

  /** A page's name for "Related" lists, from its path. */
  function pageLabel(/** @type {string} */ p) {
    const t = trips.find((x) => p === tripPath(x));
    if (t) return `${t.en} drive`;
    const th = THEMES.find((x) => p === `/${x.slug}/`);
    if (th) return th.h1;
    const ar = ARTICLES.find((x) => p === `/${x.slug}/`);
    if (ar) return ar.h1;
    /** @type {Record<string, string>} */
    const fixed = { '/about/': 'About Nine Roads Out', '/contact/': 'Contact', '/privacy/': 'Privacy and cookies', '/terms/': 'Terms of use', '/advertise/': 'Advertise with us', '/driving-guide/': 'Driving guide: tolls, speed limits, signs and daylight', '/car-hire-dublin/': 'Hiring a car in Dublin', '/day-trips-from-dublin-without-a-car/': 'Day trips from Dublin without a car', '/how-much-of-ireland/': 'How much of Ireland have you driven?' };
    if (fixed[p]) return fixed[p];
    throw new Error(`No label for related page ${p}`);
  }

  /** One of the long-form guides in src/content/articles.mjs. */
  function article(/** @type {import('./content/articles.mjs').Article} */ ar) {
    const path = `/${ar.slug}/`;
    return prosePage({
      path, active: 'drives', title: ar.title, h1: ar.h1, lede: ar.lede, desc: ar.desc, ogImage: `/og/${ar.og}.jpg`, ogType: 'article',
      jsonld: [
        { '@context': 'https://schema.org', '@type': 'Article', headline: ar.h1, description: ar.desc, image: abs(`/og/${ar.og}.jpg`), dateModified: ar.checked, author: { '@type': 'Person', name: config.owner.name }, publisher: { '@type': 'Organization', name: config.name }, inLanguage: 'en-IE', url: abs(path) },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') }, { '@type': 'ListItem', position: 2, name: ar.h1, item: abs(path) }] },
      ],
      content: (u) => `${ar.body({ u, fmtMins, fmtClock, sun: (d) => sunTimes(d), trips })}
${adSlot('guide')}
<h2 id="related">Related</h2><ul class="related">${ar.related.map((p) => `<li><a href="${u(p)}">${esc(pageLabel(p))}</a></li>`).join('')}</ul>
${sourcesList(ar.sources, ar.checked)}`,
    });
  }

  return { home, trip, guide, about, contact, privacy, terms, notFound, ireland, theme, carHire, noCar, advertise, article };
}
