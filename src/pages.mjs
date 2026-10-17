// Page templates. Every page is plain HTML generated at build time, so it is fast, indexable and works without JavaScript.
import { esc, fmtMins, mapsURL, fillQ, windWords, sunTimes, fmtClock } from './lib.mjs';
import { FILTERS } from './content/trips.mjs';

export function createRenderer({ config, trips, assets, preview }) {
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

  function header(u, active, onHome) {
    const h = (p) => (onHome && p.startsWith('/#') ? p.slice(1) : u(p));
    const links = [['/#drives', 'Drives', 'drives'], ['/#map', 'Drive-time map', 'map'], ['/driving-guide/', 'Driving guide', 'guide'], ['/about/', 'About', 'about']];
    const nav = links.map(([p, l, k]) => `<a href="${h(p)}"${active === k ? ' aria-current="page"' : ''}>${l}</a>`).join('');
    return `<header class="mast"><div class="mast-in">
<a class="brand" href="${onHome ? '#top' : u('/')}">${logo}<span class="brand-t">${esc(config.name)}</span></a>
<nav class="nav" aria-label="Main">${nav}</nav>
<details class="menu"><summary>Menu</summary><nav class="menu-panel" aria-label="Main menu">${nav}</nav></details>
</div></header>`;
  }

  function footer(u) {
    return `<footer class="foot"><div class="wrap foot-grid">
<div class="foot-brand"><a class="brand" href="${u('/')}">${logo}<span class="brand-t">${esc(config.name)}</span></a>
<p>An independent guide to the most beautiful day drives from Dublin city. Made in ${esc(config.owner.city)}.</p></div>
<nav aria-label="The drives"><h2>The drives</h2><ul>${trips.map((t) => `<li><a href="${u(tripPath(t))}">${esc(t.en)}</a></li>`).join('')}</ul></nav>
<nav aria-label="This site"><h2>This site</h2><ul><li><a href="${u('/driving-guide/')}">Driving guide</a></li><li><a href="${u('/about/')}">About</a></li><li><a href="${u('/contact/')}">Contact</a></li><li><a href="${u('/privacy/')}">Privacy and cookies</a></li><li><a href="${u('/terms/')}">Terms of use</a></li>${adsOn ? '<li><button type="button" class="linkish" data-consent>Cookie settings</button></li>' : ''}</ul></nav>
</div>
<div class="wrap foot-base"><p>Some links on this site are affiliate links. If you book through them, we may earn a commission at no extra cost to you.${adsOn ? ' Ads are served by Google.' : ''} Drive times are approximate. Details were last checked in ${esc(config.checked)}, but opening times and access change, so check official sites before you go.</p>
<p>© ${year} ${esc(config.name)}. Illustrations drawn in code.</p></div></footer>`;
  }

  function layout({ path, depth, title, desc, ogImage = '/og/home.jpg', ogType = 'website', jsonld = [], body, active = '', onHome = false, fragment = false, preload = '' }) {
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
<link rel="preload" href="${u('/fonts/archivo.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u('/fonts/newsreader.woff2')}" as="font" type="font/woff2" crossorigin>
${preload}
<link rel="stylesheet" href="${u(assets.css)}">
${adsHead}
${analytics}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}`;
    const doc = `<a class="skip" href="#main">Skip to content</a>
<span id="top"></span>
${header(u, active, onHome)}
<main id="main">${body}</main>
${footer(u)}
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
  function card(t, u, eager = false) {
    return `<li class="card" data-id="${t.id}"><a class="card-a" href="${u(tripPath(t))}">
<span class="card-img"><img src="${u('/images/scenes/' + t.id + '-card.webp')}" width="960" height="640" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></span>
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

  function planBox(t) {
    const A = config.affiliates;
    const items = [
      { href: A.carHire.url, title: 'Hire a car in Dublin', note: `Compare car hire prices on ${A.carHire.partner}` },
      { href: fillQ(A.stays.url, t.stay), title: `Stay near ${t.stayLabel}`, note: `Make a weekend of it. Places to stay on ${A.stays.partner}` },
    ];
    if (t.tour) items.push({ href: fillQ(A.tours.url, t.tour), title: 'No car? Take a guided tour', note: `Day tours from Dublin on ${A.tours.partner}` });
    return `<section class="plan" aria-labelledby="plan-${t.id}"><h2 id="plan-${t.id}">Plan this trip</h2><ul>${items.map((it) => `<li><a href="${esc(it.href)}" target="_blank" rel="sponsored noopener"><span class="plan-t">${esc(it.title)}</span><span class="plan-n">${esc(it.note)}</span></a></li>`).join('')}</ul><p class="plan-d">Affiliate links: if you book through them, we may earn a commission at no extra cost to you.</p></section>`;
  }

  function daylightBlock() {
    const s = sunTimes(new Date());
    const dh = (s.set - s.rise) / 36e5;
    return `<div class="daylight" aria-live="polite">
<p class="dl-label">Today in Dublin, <span id="dl-date">${new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Dublin' })}</span></p>
<div class="dl-times"><div><span class="dl-t" id="dl-rise">${fmtClock(s.rise)}</span><span class="dl-k">Sunrise</span></div><span class="dl-arrow" aria-hidden="true">→</span><div><span class="dl-t" id="dl-set">${fmtClock(s.set)}</span><span class="dl-k">Sunset</span></div></div>
<p class="dl-len" id="dl-len">${fmtMins(dh * 60)} of daylight</p>
<p class="dl-advice" id="dl-advice">Allow about three hours for stops on top of the driving time.</p></div>`;
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
<p class="hero-ctas"><a class="btn btn-light" href="#drives">See the nine drives</a><a class="hero-link" href="#map">Plan by drive time</a></p>
</div>
</section>

<section id="drives" class="wrap drives">
<div class="sec-head"><h2>The nine drives</h2><p class="sub">Sorted by drive time from Dublin city centre. Every one loops back to the city in a day.</p>
<div class="filters" id="filters" role="group" aria-label="Filter by scenery">${FILTERS.map(([k, l]) => `<button type="button" class="chip" data-f="${k}" aria-pressed="${k === 'all'}">${l} <span class="n">${counts[k]}</span></button>`).join('')}</div>
<p class="filter-note" id="filter-note" aria-live="polite"></p></div>
<ul class="cards" id="cards">${trips.map((t, i) => card(t, u, i < 3)).join('')}</ul>
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
      preload: `<link rel="preload" as="image" href="${u('/images/scenes/hero-wide.webp')}" media="(min-width: 641px)"><link rel="preload" as="image" href="${u('/images/scenes/hero-tall.webp')}" media="(max-width: 640px)">`,
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
    const route = `<li class="stop start"><h3>Dublin city centre</h3></li>` + t.stops.map((s) => `<li class="leg" aria-label="Road: ${esc(s.road.replace(/~/g, ''))}">${roadChips(s.road)}</li><li class="stop${s.home ? ' home' : ''}"><h3>${esc(s.n)}</h3><p>${esc(s.t)}</p></li>`).join('');
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
<div class="share" data-url="${esc(abs(path))}" data-title="${esc(shareText)}"><button type="button" class="share-b" data-share="copy">Copy link</button><a class="share-b" href="https://wa.me/?text=${encodeURIComponent(shareText + ' ' + abs(path))}" target="_blank" rel="noopener">Send on WhatsApp</a><button type="button" class="share-b" data-share="native" hidden>Share</button><span class="share-msg" role="status"></span></div>
${adSlot('inArticle')}
<h2 class="sec-h">The route</h2>
<ol class="route">${route}</ol>
<aside class="know"><h2 class="know-tag">Know before you go</h2><ul>${t.know.map((k) => `<li>${esc(k)}</li>`).join('')}</ul><p class="official">${t.links.map((l) => `<a href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])}</a>`).join('')}</p></aside>
</div>
<aside class="trip-side" aria-label="Plan this drive"><div class="side-in">
<a class="btn btn-block" href="${esc(mapsURL(t))}" target="_blank" rel="noopener">Open the route in Google Maps</a>
<p class="maps-note">Directions from Dublin through the main stops.</p>
${planBox(t)}
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
      path, depth: 1, ogType: 'article', ogImage: `/og/${t.id}.jpg`,
      title: `${t.en} day trip from Dublin: ${t.via.replace(/^And /, 'and ')} | ${config.name}`,
      desc: t.desc,
      preload: `<link rel="preload" as="image" href="${u('/images/scenes/' + t.id + '-plate.webp')}" media="(min-width: 641px)"><link rel="preload" as="image" href="${u('/images/scenes/' + t.id + '-plate-sm.webp')}" media="(max-width: 640px)">`,
      jsonld: [
        {
          '@context': 'https://schema.org', '@type': 'TouristTrip', name: `${t.en}: ${t.via}`, description: t.desc, url: abs(path), image: abs(`/og/${t.id}.jpg`),
          touristType: 'Day trip by car from Dublin',
          itinerary: { '@type': 'ItemList', numberOfItems: stops.length, itemListElement: stops.map((s, k) => ({ '@type': 'ListItem', position: k + 1, item: { '@type': 'TouristAttraction', name: s.n, description: s.t } })) },
        },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') }, { '@type': 'ListItem', position: 2, name: t.en, item: abs(path) }] },
      ],
      body,
    });
  }

  /* ---------- prose pages ---------- */
  function prosePage({ path, title, h1, lede, desc, content, active = '', jsonld = [] }) {
    const u = urlFor(1);
    const body = `<nav class="wrap crumbs" aria-label="Breadcrumb"><ol><li><a href="${u('/')}">Home</a></li><li aria-current="page">${esc(h1)}</li></ol></nav>
<article class="wrap prose-page"><header class="prose-head"><h1>${esc(h1)}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</header><div class="prose">${content(u)}</div></article>`;
    return layout({ path, depth: 1, title: `${title} | ${config.name}`, desc, body, active, jsonld });
  }

  function guide() {
    const y = new Date().getFullYear();
    const rows = Array.from({ length: 12 }, (_, m) => {
      const d = new Date(Date.UTC(y, m, 15, 12));
      const s = sunTimes(d);
      return `<tr><th scope="row">${d.toLocaleDateString('en-IE', { month: 'long', timeZone: 'UTC' })}</th><td>${fmtClock(s.rise)}</td><td>${fmtClock(s.set)}</td><td>${fmtMins((s.set - s.rise) / 6e4)}</td></tr>`;
    }).join('');
    return prosePage({
      path: '/driving-guide/', active: 'guide',
      title: 'Driving from Dublin: tolls, speed limits, road signs and daylight',
      h1: 'Driving from Dublin: the day-trip guide',
      lede: 'What makes a day drive from Dublin go smoothly: tolls, speed limits, how to read Irish road signs, narrow roads, weather and how much daylight you will get.',
      desc: 'A practical guide to day drives from Dublin: the M50 toll, Irish speed limits, how to read road signs, narrow country roads, weather and daylight by month.',
      jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Driving from Dublin: the day-trip guide', author: { '@type': 'Person', name: config.owner.name }, publisher: { '@type': 'Organization', name: config.name }, inLanguage: 'en-IE', url: abs('/driving-guide/') }],
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

<h2 id="heritage-card">OPW Heritage Card</h2>
<p>Brú na Bóinne, the Rock of Cashel, Cahir Castle and Clonmacnoise are run by the Office of Public Works. If you will visit several in a year, the <a href="https://heritageireland.ie/" target="_blank" rel="noopener">Heritage Card</a> covers entry to all of them.</p>

<h2 id="drives">The drives</h2>
<ul class="drive-list">${trips.map((t) => `<li><a href="${u(tripPath(t))}">${esc(t.en)}</a>, ${fmtMins(t.mins)} from Dublin, about ${fmtMins(t.drive * 60)} at the wheel</li>`).join('')}</ul>`,
    });
  }

  function about() {
    return prosePage({
      path: '/about/', active: 'about', title: 'About', h1: 'About Nine Roads Out',
      lede: `Nine Roads Out is an independent guide to the most beautiful day drives from Dublin city, made in ${esc(config.owner.city)} by ${esc(config.owner.name)}.`,
      desc: 'Who makes Nine Roads Out, how the drives are chosen and checked, and how the site is funded.',
      content: (u) => `
<h2>How the drives are chosen</h2>
<p>Each drive fits comfortably into a day from Dublin city centre, loops back rather than retracing its steps where it can, and has at least one stop worth the journey on its own. Between them they cover the bog passes of Wicklow, the passage tombs of the Boyne, the fjord at Carlingford, the Midland mountains and the coasts of Waterford and Wexford.</p>
<h2>How the details are checked</h2>
<p>Opening arrangements, closures, booking rules and parking are checked against official sources such as Heritage Ireland, the National Parks and Wildlife Service, Coillte and local tourism offices. Each drive page links to the sources that matter for it. Details were last checked in ${esc(config.checked)}.</p>
<p>Things change. If you spot something out of date, please <a href="${u('/contact/')}">get in touch</a> and it will be fixed.</p>
<h2>How the site is funded</h2>
<p>The site is free to use. It is paid for by advertising and by affiliate links to car hire, places to stay and tours. If you book through one of those links, the site may earn a commission at no extra cost to you. No place on the site has paid to be included, and recommendations are not for sale.</p>
<h2>The pictures</h2>
<p>The scenes are illustrations drawn in code, in the spirit of the old Irish railway and tourism posters. Each one shows the drive's signature view, from the round tower at Glendalough to the lighthouse at Hook Head.</p>`,
    });
  }

  function contact() {
    const e = config.contactEmail;
    return prosePage({
      path: '/contact/', title: 'Contact', h1: 'Contact',
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
    return prosePage({
      path: '/privacy/', title: 'Privacy and cookies', h1: 'Privacy and cookies',
      lede: `This policy explains what information this site collects, why, and the choices you have. Last updated ${esc(config.checked)}.`,
      desc: 'How Nine Roads Out handles personal data, advertising cookies and affiliate links, and your rights under GDPR.',
      content: (u) => `
<h2>Who is responsible</h2>
<p>${esc(config.name)} is run by ${esc(config.owner.name)} in ${esc(config.owner.city)}, Ireland, who is the data controller for this site. You can get in touch ${contactLine(u)}.</p>
<h2>What we collect</h2>
<p>You do not need an account to use this site and we do not ask for your name or email address. The fonts, images and scripts that make up the site are served from our own host, so loading a page does not send your details to font or script services.</p>
<ul>
<li><strong>Server logs.</strong> Our hosting provider records technical information such as IP address, browser type and the page requested, to keep the site secure and working. These logs are kept for a short period and are not used to identify you.</li>
<li><strong>Analytics.</strong> We may use Cloudflare Web Analytics to count visits. It does not use cookies and does not track you across other sites.</li>
</ul>
<h2>Advertising</h2>
<p>This site shows ads served by Google AdSense. If you are in the European Economic Area, the UK or Switzerland, you will be asked for your consent before any advertising cookies are set. With your consent, Google and its partners may use cookies to show ads based on your interests and to measure them. Without it, Google may still show limited, non-personalised ads.</p>
<p>You can change your choice at any time with the Cookie settings link at the bottom of every page. Google explains how it uses information from sites like this one at <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">policies.google.com</a>.</p>
<h2>Affiliate links</h2>
<p>Some links to car hire, accommodation and tour companies are affiliate links. When you follow one, that company may set its own cookies so it can credit us if you book. Their privacy policies apply on their sites.</p>
<h2>Legal basis</h2>
<p>We rely on your consent for advertising cookies, and on our legitimate interest in running a secure, working website for server logs and cookieless analytics.</p>
<h2>Your rights</h2>
<p>Under the GDPR you can ask to access, correct or delete personal data we hold about you, object to how it is used, or withdraw consent. To do so, contact us as above. You also have the right to complain to the Data Protection Commission in Ireland at <a href="https://www.dataprotection.ie/" target="_blank" rel="noopener">dataprotection.ie</a>.</p>
<h2>Changes</h2>
<p>If this policy changes, the new version will be posted here with a new date.</p>`,
    });
  }

  function terms() {
    return prosePage({
      path: '/terms/', title: 'Terms of use', h1: 'Terms of use',
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

  function notFound() {
    const u = urlFor(0);
    const body = `<section class="wrap prose-page nf"><h1>This road doesn't go anywhere</h1><p class="lede">The page you were looking for isn't here. Try one of the nine drives instead.</p><ul class="cards cards-3">${trips.slice(0, 3).map((t) => card(t, u)).join('')}</ul><p><a class="btn" href="${u('/')}">Go to the home page</a></p></section>`;
    return layout({ path: '/404.html', depth: 0, title: `Page not found | ${config.name}`, desc: 'This page could not be found.', body });
  }

  return { home, trip, guide, about, contact, privacy, terms, notFound };
}
