// Long-form guides. Each one is written from the official pages in `sources`, read on `checked`, and
// lists them at the bottom of the page. tests/content.test.mjs checks that every guide has at least
// 800 words of body text, at least two https sources and three related pages.
// `body(h)` returns HTML. `h` gives it links to other pages (h.u('/path/')) and the site's own data.
//
// Facts from the sources are stated as the sources state them. Where a source doesn't say something
// (a walk's distance, an entry fee), the guide says it isn't published rather than guessing.

/**
 * @typedef {object} Helpers
 * @property {(p: string) => string} u link to another page on the site
 * @property {(m: number) => string} fmtMins
 * @property {(d: Date) => string} fmtClock
 * @property {(d: Date) => { rise: Date, set: Date }} sun sunrise and sunset in Dublin
 * @property {{ id: string, en: string, slug: string, mins: number, drive: number, best: string }[]} trips
 */
/**
 * @typedef {object} Article
 * @property {string} slug
 * @property {string} title for the <title> and search results
 * @property {string} h1
 * @property {string} lede HTML
 * @property {string} desc meta description
 * @property {string} og drive id whose share image the page uses
 * @property {string[]} related paths of related pages, shown at the end
 * @property {string} checked YYYY-MM-DD the sources were read
 * @property {[string, string][]} sources label and URL
 * @property {(h: Helpers) => string} body
 */

const HI_BRU = 'https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-knowth-and-dowth/';
const HI_SOL = 'https://heritageireland.ie/visit/newgrange-winter-solstice/';
const LOTTERY = 'https://solsticelottery.ie/';
const NPWS_TRAILS = 'https://www.nationalparks.ie/wicklow/things-to-do/';
const NPWS_PARKING = 'https://www.nationalparks.ie/wicklow/parking-in-glendalough/';
const NPWS_WORKS = 'https://www.nationalparks.ie/wicklow/glendalough-trail-works-2026/';
const HI_LOUGHCREW = 'https://heritageireland.ie/places-to-visit/loughcrew-megalithic-cemetery/';
const DBV_LOUGHCREW = 'https://www.discoverboynevalley.ie/boyne-valley-drive/heritage-sites/loughcrew-cairns';
const DBV_WALK = 'https://www.discoverboynevalley.ie/plan-your-visit/things-to-do/hill-walking-loughcrew';
const LOUGHCREW_ESTATE = 'https://loughcrew.com/';
const HOOK_TOURS = 'https://hookheritage.ie/tours/tour-information/';
const HOOK_ABOUT = 'https://hookheritage.ie/about-us/about-hook-lighthouse/';
const HOOK_EXPLORE = 'https://hookheritage.ie/plan-your-visit/explore-hook/';
const HOOK_WHALES = 'https://hookheritage.ie/event/whale-watching-season/';
const VW_TRAILS = 'https://www.visitwexford.ie/best-walking-trails-in-wexford/';
const VW_BAGINBUN = 'https://www.visitwexford.ie/directory/baginbun-beach/';
const HI_TINTERN = 'https://heritageireland.ie/places-to-visit/tintern-cistercian-abbey/';
const FERRY = 'https://www.passageferry.ie/pages/faq';
const HI_CASHEL = 'https://heritageireland.ie/places-to-visit/the-rock-of-cashel/';
const HI_CLON = 'https://heritageireland.ie/places-to-visit/clonmacnoise-monastic-site/';
const GEOPARK_FAQ = 'https://coppercoastgeopark.com/faqs/';
const BIRR = 'https://birrcastle.com/';

const a = (/** @type {string} */ href, /** @type {string} */ text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

/** @type {Article[]} */
export const ARTICLES = [
  {
    slug: 'newgrange-winter-solstice',
    title: 'Newgrange winter solstice: how the lottery and booking work',
    h1: 'Newgrange at the winter solstice: the lottery, and how to visit',
    lede: 'For a few mornings around 21 December, the rising sun shines into the heart of Newgrange. Only a few dozen people a year see it from inside. Here is how the lottery works, what to do if you don’t win, and how to book a visit on any other day.',
    desc: 'How the Newgrange winter solstice lottery works, who can enter and when it closes, the livestream, and how to book Newgrange and Knowth the rest of the year.',
    og: 'boyne',
    related: ['/boyne/', '/historic-day-trips-from-dublin/', '/best-time-of-year-for-each-drive/', '/day-trips-from-dublin-without-a-car/'],
    checked: '2026-11-06',
    sources: [
      ['Heritage Ireland: Newgrange winter solstice', HI_SOL],
      ['Solstice lottery: how to enter (OPW)', LOTTERY],
      ['Heritage Ireland: Brú na Bóinne Visitor Centre, Newgrange, Knowth and Dowth', HI_BRU],
    ],
    body: (h) => `
<h2 id="what-happens">What happens at the solstice</h2>
<p>Newgrange is a passage tomb in the bend of the River Boyne, part of the Brú na Bóinne complex with Knowth and Dowth. Above its entrance is a small opening called the roof-box. On the mornings around the winter solstice, as the sun comes up, a beam of light passes through the roof-box and travels up to 19 metres (62 feet) along the passage, widening until it lights the whole chamber. After about 17 minutes it fades back down the passage, as the sun moves out of line.</p>
<p>The Office of Public Works (OPW), which runs the site, says the light can last for up to 17 minutes depending on the weather. Ireland in December is often cloudy, and the sources don’t say what happens on a grey morning, so treat a clear sunrise as a bonus rather than a promise.</p>
<p>The OPW gives the solstice mornings as 18 to 22 December on Heritage Ireland, and as 19 to 23 December on the lottery site. The middle of both ranges is 21 December, the solstice itself.</p>

<h2 id="lottery">Who gets inside: the lottery</h2>
<p>The chamber is small, and places inside on solstice mornings are given out by a public lottery each year. The rules on the official lottery site are:</p>
<ul>
<li><strong>Entry is online only</strong>, through the official form at ${a(LOTTERY, 'solsticelottery.ie')}. Applications sent any other way are not entered into the draw.</li>
<li><strong>One entry per email address.</strong></li>
<li><strong>Applicants must be over 10</strong>, and anyone under 18 must be with an adult.</li>
<li><strong>Winners show photo ID</strong> at the visitor centre when they arrive on the morning.</li>
<li><strong>Places can’t be transferred</strong> to someone else.</li>
</ul>
<p>For the 2027 solstice, the lottery site says entries received after midnight, Irish time, on Sunday 26 September 2027 won’t be valid. It doesn’t give a date for the draw. The lottery site doesn’t mention a fee either way.</p>
<h3>How the draw works, and your chances</h3>
<p>The 2026 draw took place on 15 October 2026 at the Brú na Bóinne Visitor Centre. Children from three local primary schools drew the winners: Donore National School, Scoil Naomh Pio in Knockcommon and St Patrick’s National School in Slane. There were 34,263 online entries and 38 winners, each of whom can bring one guest into the chamber at dawn during the solstice period.</p>
<p>That works out at about one winner for every 900 entries. It is worth entering every year, but plan your December trip around the other options below rather than around winning.</p>

<h2 id="if-you-dont-win">If you don’t win</h2>
<p><strong>Watch the livestream.</strong> The OPW streams the solstice sunrise. For 2026 it says the solstice will be broadcast on Monday 21 December across OPW platforms, with details to follow. Recordings of the livestreams from 2020, 2021, 2023, 2024 and 2025 are on the OPW’s YouTube channel, so you can see what the light looks like before you decide whether to make the trip.</p>
<p><strong>Know that normal tours stop.</strong> On solstice mornings, 18 to 22 December, the visitor centre opens earlier and the regular tour options are suspended. If you want a standard tour of Newgrange in December, go earlier in the month. The centre then closes from 23 to 27 December, and on 1 January.</p>
<p><strong>Check travel details first.</strong> When this guide was written, the OPW said it would “shortly” announce travel and traffic arrangements for the 2026 solstice. Its solstice page is the place to look before you drive up.</p>

<h2 id="booking">Visiting Newgrange the rest of the year</h2>
<p>You can’t drive or walk straight to the tombs. Every visit to Newgrange and Knowth starts at the Brú na Bóinne Visitor Centre near Donore, and a shuttle bus takes you across to the monuments. The OPW is blunt about it: if you go directly to the monuments, you won’t get in.</p>
<h3>When tickets go on sale</h3>
<ul>
<li>1 January to 1 March: 7 days in advance.</li>
<li>1 April to 1 November: 30 days in advance.</li>
<li>2 November to 31 December: 7 days in advance.</li>
</ul>
<p>Tickets are released online at midnight, Irish time. Pre-booking is essential and availability is very limited, so set a reminder for the night your date opens. Cancelled tickets go back on sale each morning between 8.30 and 9.30, and each afternoon between 3pm and 4pm, which is worth knowing if your date has sold out. Only tickets from the official Brú na Bóinne booking site are valid; tickets bought from other sites or resale platforms won’t get you in. Everyone needs a ticket, including children and infants, and under-18s can’t visit without an adult. You don’t need to book if you only want to visit the visitor centre.</p>
<h3>Which tours run when</h3>
<p>From 1 March to 1 November, the main option is the Brú na Bóinne tour with the Newgrange chamber. There is also one Newgrange tour with the exhibition each day, and one Knowth tour with the exhibition each day. From 2 November to the end of February, the Newgrange tour with the exhibition is the only tour on the list, so Knowth is a spring-to-autumn visit. There is no access to the chambers at Knowth at any time of year.</p>
<h3>Access</h3>
<p>The passage and chamber at Newgrange are low and narrow, and the OPW says they may not suit visitors with claustrophobia or mobility issues. Access at the monuments is limited. If you use a wheelchair or need assistance, the OPW asks you to email brunaboinne@opw.ie before you book. The visitor centre has a lift and an accessible toilet, and only assistance dogs are allowed.</p>
<p>The visitor centre is open all year, with hours that change by month, from a 9am or 9.30am opening to a late-afternoon close. Check the Heritage Ireland page for the month you plan to go.</p>

<h2 id="plan-the-day">Making a day of it</h2>
<p>Brú na Bóinne is about 50 minutes from Dublin. Our ${`<a href="${h.u('/boyne/')}">Boyne Valley drive</a>`} builds a day around it, with Monasterboice and its high crosses before your tour and the Hill of Slane and Hill of Tara afterwards. If you don’t have a car, guided tours from Dublin often include the Newgrange visit; see <a href="${h.u('/day-trips-from-dublin-without-a-car/')}">day trips without a car</a>. For more ancient sites within reach of the city, see <a href="${h.u('/historic-day-trips-from-dublin/')}">historic day trips from Dublin</a>, and for when each drive is at its best, our <a href="${h.u('/best-time-of-year-for-each-drive/')}">season-by-season guide</a>.</p>
<p>Loughcrew, about 80 minutes north-west of Dublin, has its own alignment: its Cairn T faces the sunrise at the spring and autumn equinoxes rather than midwinter. Our <a href="${h.u('/loughcrew-walk/')}">guide to the Loughcrew walk</a> covers it.</p>`,
  },
  {
    slug: 'glendalough-walks',
    title: 'The best walk at Glendalough: the Spinc, the Miners’ Road and the lakes',
    h1: 'The best walk at Glendalough',
    lede: 'Glendalough has nine waymarked trails, from a 30-minute stroll to a four-hour mountain loop. If you only do one, make it the Spinc. Here is how it compares with the gentler walks, where they start, and what to bring.',
    desc: 'Glendalough’s nine waymarked walks compared: the Spinc and Glenealo Valley loop, the Miners’ Road and the Green Road, with distances, times, parking and trail works in 2026.',
    og: 'glendalough',
    related: ['/glendalough/', '/mountain-drives-from-dublin/', '/short-drives-from-dublin/', '/day-trips-from-dublin-without-a-car/'],
    checked: '2026-11-07',
    sources: [
      ['Wicklow Mountains National Park: things to do (walking trails)', NPWS_TRAILS],
      ['Wicklow Mountains National Park: parking in Glendalough', NPWS_PARKING],
      ['Wicklow Mountains National Park: home page (parking and trails)', 'https://www.nationalparks.ie/wicklow/'],
      ['Wicklow Mountains National Park: Glendalough trail works 2026', NPWS_WORKS],
    ],
    body: (h) => `
<h2 id="where-walks-start">Where the walks start</h2>
<p>All nine of Glendalough’s waymarked trails start and finish at the National Park Information Office near the Upper Lake, about 200 metres from the Upper Lake car park. Each trail has its own colour on the waymarkers, so you can follow one route from start to finish without a map, although the National Parks and Wildlife Service (NPWS), which runs the park, still asks walkers to check the weather and bring one.</p>
<p>Distances and times below are the NPWS’s own, and they call them approximate. Times are for walking at a steady pace without long stops.</p>

<h2 id="the-spinc">The best walk: the Spinc and the Glenealo Valley (white route)</h2>
<p>The white route is the one to do if you have the legs and the weather. It is a loop of about 9.5 km that the NPWS grades as strenuous, and it takes about 3 hours 15 minutes. It climbs onto the Spinc ridge, runs along a stretch of wooden boardwalk, and comes back through the Glenealo Valley by the old Miners’ Village. The NPWS sums up its highlights as stunning views, mountain scenery and herds of deer.</p>
<p>The terrain is a mix of rocky trail, boardwalk and forest road. The NPWS recommends hiking boots and rain gear for it. On a clear day, the views over the Upper Lake from the ridge are the best in the valley.</p>
<h3>Trail works in 2026</h3>
<p>From 20 July 2026, the NPWS began upgrading the white trail for five or six months, on the section known as the White Zig Zags, from the Miners’ Village up to the footbridge. It says the trails will stay open, except on days when a helicopter is moving materials, when the Spinc routes close for part of the day. The blue route may also be disrupted at times. Check the trail works page before you go.</p>
<h3>Shorter and longer versions</h3>
<ul>
<li><strong>Spinc, short route (blue):</strong> about 5.5 km and 2 hours, also strenuous, on rough mountain tracks and forest roads, with views of the Upper Lake. A good choice if you want the ridge but not the whole loop.</li>
<li><strong>Spinc and the Wicklow Way (red):</strong> about 11.5 km and 4 hours 15 minutes, strenuous, with a climb of about 490 metres on rough mountain tracks and forest roads. The longest of the nine.</li>
</ul>

<h2 id="easier-walks">The easier walks</h2>
<p>If the cloud is down, or you are with small children, the valley floor walks are still lovely, and two of them are graded easy:</p>
<ul>
<li><strong>Miners’ Road Walk (purple):</strong> about 5 km there and back, about an hour, easy, with a climb of only 20 metres on forest road and track. It runs through native pine woodland to the ruins of the Miners’ Village, with a view of St Kevin’s Bed.</li>
<li><strong>Green Road Walk (green):</strong> a loop of about 3 km and 45 minutes, easy, with a 20-metre climb on track and boardwalk. The NPWS picks out the views of the valley from the boardwalk.</li>
<li><strong>Woodland Road (silver):</strong> about 4 km and an hour, moderate, with a 90-metre climb on rough tracks and some public road, through woodland and along St Kevin’s Way to the Lower Lake.</li>
<li><strong>Derrybawn Woodland Trail (orange):</strong> about 8 km and 2 hours, moderate, with a 160-metre climb on forest road and track, giving views over both lakes. After storm damage it has been re-routed around the Poulanass Waterfall.</li>
</ul>
<p>Two short routes have been affected by storm damage. The NPWS lists the Poulanass and St Kevin’s Cell loop (bronze, about 1 km) as closed, although you can still reach St Kevin’s Cell and return the way you came. On the Poulanass route (pink, about 1.6 km), the path beyond the falls has collapsed and a detour is signed with silver arrows.</p>

<h2 id="parking">Parking</h2>
<p>In sunny weather, especially at weekends, traffic and parking at Glendalough can be a problem, so arrive early. There are three places to park:</p>
<ul>
<li><strong>The Upper Lake car park</strong>, closest to the walks, which charges at the entrance. The NPWS says its opening hours vary and to contact Wicklow County Council for details.</li>
<li><strong>The Visitor Centre car park</strong>, which is pay by coin or card and open from 8am to 8pm. From there it is about a 20-minute walk to the Upper Lake along the Green Road or the Lower Lake boardwalk.</li>
<li><strong>The car park in Laragh</strong>, beside the Woollen Mills and the GAA pitch, open 8am to 8pm, a 3 km walk through the woods along the Green Road to the Upper Lake.</li>
</ul>
<p>Parking isn’t allowed on the road through the valley, and the NPWS says cars parked there illegally are liable to be towed or ticketed.</p>

<h2 id="before-you-go">Before you go</h2>
<ul>
<li>Wear hiking boots or other suitable footwear. For the white and red routes, the NPWS recommends boots and rain gear.</li>
<li>Check the weather before you set off, and bring a map.</li>
<li>Dogs are welcome but must stay on a lead.</li>
<li>Walkers who go off the tracks may be bitten by ticks, so stay on the marked trails.</li>
<li>Groups of more than 50 need a hiking permit from the park.</li>
</ul>

<h2 id="make-a-day">Making a day of it</h2>
<p>Glendalough is about 50 minutes from Dublin, and our <a href="${h.u('/glendalough/')}">Glendalough drive</a> gets there the scenic way, over the Sally Gap and past Lough Tay, with a walk in the valley at the end. The drive and the white route together make a full day. With no car, St Kevin’s Bus runs from St Stephen’s Green to Glendalough; see <a href="${h.u('/day-trips-from-dublin-without-a-car/')}">day trips without a car</a>. For more hill country close to the city, see <a href="${h.u('/mountain-drives-from-dublin/')}">mountain drives from Dublin</a>.</p>`,
  },
  {
    slug: 'loughcrew-walk',
    title: 'Walking up to the Loughcrew cairns: the climb, the equinox and what to know',
    h1: 'The walk up to the Loughcrew cairns',
    lede: 'Loughcrew is the quiet one: about 30 passage tombs, some 5,000 years old, on hilltops in north-west Meath, free to visit all year. Here is what the climb is like, why people gather at the equinoxes, and what to know before you go.',
    desc: 'Walking to the Loughcrew cairns in County Meath: the steep climb to Cairn T, the spring and autumn equinox sunrise, access, dogs, directions and what to combine it with.',
    og: 'loughcrew',
    related: ['/loughcrew/', '/historic-day-trips-from-dublin/', '/newgrange-winter-solstice/', '/best-time-of-year-for-each-drive/'],
    checked: '2026-11-07',
    sources: [
      ['Heritage Ireland: Loughcrew Megalithic Cemetery', HI_LOUGHCREW],
      ['Discover Boyne Valley: Loughcrew Cairns', DBV_LOUGHCREW],
      ['Discover Boyne Valley: Hill walking at Loughcrew', DBV_WALK],
      ['Loughcrew Estate', LOUGHCREW_ESTATE],
    ],
    body: (h) => `
<h2 id="what-it-is">What you are climbing to</h2>
<p>The Loughcrew cairns are a passage tomb cemetery spread over the hills near Oldcastle in County Meath. The Office of Public Works (OPW) describes it as spread over four undulating peaks, with tombs dating to around 3000 BC. Discover Boyne Valley, the county’s tourism site, counts around 30 passage tombs and calls them roughly contemporary with Newgrange. Loughcrew Estate, below the hills, describes Loughcrew as one of the four main passage tomb cemeteries in Ireland.</p>
<p>The sources don’t agree exactly on the age. The OPW dates the tombs to around 3000 BC; Discover Boyne Valley puts them alongside Newgrange, which it dates to 3200 BC; Loughcrew Estate says the 4th millennium BC. Either way, they are about 5,000 years old. The hills are also known as Slieve na Calliagh, the name both Discover Boyne Valley and Loughcrew Estate use.</p>
<p>The best known tomb is Cairn T. Unlike Newgrange, there is no visitor centre, no shuttle bus and no ticket: you park, climb and walk among the cairns yourself. The OPW lists the site as free and open all year.</p>

<h2 id="the-climb">The climb</h2>
<p>The OPW and Discover Boyne Valley both describe the climb to Cairn T as very steep. Wear suitable footwear (Discover Boyne Valley says stout footwear) and dress for the weather.</p>
<p>If you want to see more than Cairn T, Discover Boyne Valley’s hill-walking page gives a walk of 3 to 4 km across the hills, graded a medium challenge. It doesn’t publish a time or a waymarked route. For a visit to the cairns themselves, it suggests about an hour on average.</p>
<p>A few rules apply on the hill:</p>
<ul>
<li><strong>Don’t climb on the cairns.</strong> Discover Boyne Valley asks visitors not to climb on Cairn T, and access is to the outside of the monuments only.</li>
<li><strong>Dogs must be on a lead.</strong></li>
<li><strong>There is no access for wheelchairs.</strong></li>
</ul>
<p>The OPW publishes a visual guide to the site as a PDF, linked from its Loughcrew page, which is useful if you, or someone you are bringing, would like to know what to expect before arriving.</p>
<h3>Inside Cairn T</h3>
<p>The OPW says access to the interior of Cairn T is not possible at present, because of ongoing conservation works. The rest of the monuments on the hill are not affected. Check the Heritage Ireland page before you go, in case this has changed.</p>

<h2 id="equinox">The equinox sunrise</h2>
<p>Newgrange is aligned with the midwinter sunrise. Cairn T is aligned with sunrise at the spring and autumn equinoxes, in March and September. Discover Boyne Valley describes how, on those mornings, the rising sun shines down the passage and lights the symbols carved on the back wall of the chamber. The OPW says people gather on the hill at the equinoxes to greet the first rays of the sun.</p>
<p>With the interior closed for conservation, you may not be able to see inside on the morning itself, but the hilltop at dawn around the equinox is still worth the early start. Neither source lists organised equinox events, so check the OPW’s Loughcrew page and social media nearer the time.</p>

<h2 id="guides">Guides and when to go</h2>
<p>In the summer months, OPW guides are on the hill to answer questions. For 2026 the OPW says the guides have finished for the season. Out of season you may have the hilltop almost to yourself, which is half the point of coming here rather than to the Boyne. The climb is easiest in dry weather.</p>
<p>For more on choosing a season, see our <a href="${h.u('/best-time-of-year-for-each-drive/')}">best time of year for each drive</a>.</p>

<h2 id="getting-there">Getting there</h2>
<p>The OPW gives Loughcrew’s location as 3 km east of Oldcastle, off the R163, about 80 km north-west of Dublin. It warns that the approach road is very narrow and that extreme caution is needed, so drive it slowly and be ready to pull in for oncoming traffic. There is a car park.</p>
<p>From Dublin, Discover Boyne Valley’s directions take the M3 and N3, then the R163 and R154, before a right turn onto the L2800, with the site on the left. There is no practical public transport, so you need a car.</p>

<h2 id="make-a-day">Making a day of it</h2>
<p>Our <a href="${h.u('/loughcrew/')}">Loughcrew drive</a> builds a day around the cairns: the round tower and high crosses at Kells on the way out, Loughcrew in the middle, and the ruins of Fore Abbey in its quiet valley on the way home. It is about 80 minutes from Dublin to the first stop, with around three hours at the wheel in all.</p>
<p>Loughcrew Estate, below the hills, has gardens dating back to the 17th century, a fairy trail for children and a coffee shop. Our drive page lists other cafés nearby, in Oldcastle and at Fore.</p>
<p>If you have seen Newgrange already, Loughcrew is the perfect contrast: built around the same time, but on a hilltop with no visitor centre and no queue. If you haven’t, our guide to <a href="${h.u('/newgrange-winter-solstice/')}">Newgrange and the winter solstice</a> explains how to book it. Both are on our list of <a href="${h.u('/historic-day-trips-from-dublin/')}">historic day trips from Dublin</a>.</p>`,
  },
  {
    slug: 'hook-head-walks',
    title: 'Walks at Hook Head: Baginbun, the lighthouse and the Tintern woods',
    h1: 'The best walks on the Hook peninsula',
    lede: 'Hook Head is better for short walks than long hikes. The woodland trails at Tintern are the best proper walk on the peninsula, Baginbun is the best stretch of coast, and the lighthouse is 115 steps straight up. Here is what each is like, from the official pages.',
    desc: 'Walking on the Hook peninsula in Wexford: the woodland trails at Tintern Abbey, the coast at Baginbun, climbing Hook Lighthouse, and whale watching from November to February.',
    og: 'hook',
    related: ['/hook/', '/coastal-drives-from-dublin/', '/copper/', '/best-time-of-year-for-each-drive/'],
    checked: '2026-11-07',
    sources: [
      ['Heritage Ireland: Tintern Abbey', HI_TINTERN],
      ['Visit Wexford: best walking trails in Wexford', VW_TRAILS],
      ['Visit Wexford: Baginbun Beach', VW_BAGINBUN],
      ['Hook Lighthouse: tour information', HOOK_TOURS],
      ['Hook Lighthouse: about the lighthouse', HOOK_ABOUT],
      ['Hook Lighthouse: explore Hook', HOOK_EXPLORE],
      ['Hook Lighthouse: whale watching season', HOOK_WHALES],
      ['Passage East car ferry: questions', FERRY],
    ],
    body: (h) => `
<h2 id="honest-note">First, what isn’t published</h2>
<p>The Hook peninsula doesn’t have a well-known coast path with a published route. We looked on the lighthouse’s own site and on Visit Wexford, the county tourism site, and neither gives a waymarked walk around the headland with a distance and a time. So this guide doesn’t invent one. It covers the three walks that the official pages do describe, and says what each of them publishes.</p>

<h2 id="tintern">The best proper walk: the woods at Tintern Abbey</h2>
<p>Tintern Abbey, at Saltmills near the start of our Hook drive, is the place for a real walk. The Office of Public Works (OPW) describes the abbey as surrounded by woodland with walking trails, and lists a river walk, a bike trail and a picnic area among its facilities. Visit Wexford says there are four walking routes here, from just under 1 km to 7.2 km, taking in forestry, the Colclough Walled Garden and a stone bridge. The shortest, the Gardener’s Trail, is suitable for everyone, including wheelchairs and prams.</p>
<p>The abbey itself is Cistercian, founded around 1200 by William, Earl Marshal, and known as Tintern de Voto. It was a daughter house of Tintern in Wales. The Colclough family were granted it in the sixteenth century and lived there until the mid-twentieth. Look for the restored Colclough Walled Garden in the old estate; a combined ticket for the abbey and the garden is sold at reception.</p>
<p><strong>When to go:</strong> the abbey runs to a season. In 2026 it opened from 5 March to 4 November, and the OPW now says it is closed until 2027. Visit Wexford says the walled garden is open all year, but its article is a few years old, so ring ahead in winter. The OPW asks for appropriate footwear, as walkways are uneven, and allows only assistance dogs.</p>

<h2 id="baginbun">The best coast: Baginbun</h2>
<p>Baginbun Head, just outside Fethard-on-Sea, is where to walk by the sea. Visit Wexford describes a walk along the coastline here with views of the golden sands of Baginbun Beach, and calls the beach ideal for families. It is also a stop for sea cave kayaking.</p>
<p>The name carries the peninsula’s biggest story. Visit Wexford says Baginbun is known as the place “where Ireland was lost and won”, and that the name comes from the Norman ships that landed here, La Bague and La Bonne. That history is now celebrated with a Norman festival each year.</p>
<p>Visit Wexford doesn’t give a distance, a time or a start point for the Baginbun walk. Treat it as a short coastal stroll from the beach, take care near any drop to the sea, and follow its general advice for every walk in the county: be ready for all weather and wear comfortable shoes.</p>

<h2 id="lighthouse">The shortest climb: Hook Lighthouse</h2>
<p>Hook Lighthouse is the reason most people drive this far. Its own site calls it the oldest intact operational lighthouse in the world, built about 800 years ago, in the 13th century, by William Marshal. The tower stands just over 35 metres tall, and the guided tour climbs its 115 well-worn steps to the balcony at the top.</p>
<ul>
<li><strong>Book ahead.</strong> All tours must be pre-booked.</li>
<li><strong>Tour times.</strong> From September to June, tours run every hour from 10am to 4pm. In July and August they run every half-hour from 10am to 5pm.</li>
<li><strong>How long.</strong> Allow 45 minutes for the tour, and up to two hours to see the whole site.</li>
<li><strong>Fitness.</strong> The lighthouse says some fitness is needed for the 115 steps. Young children are welcome.</li>
<li><strong>Dogs</strong> are allowed in the grounds on a lead.</li>
<li><strong>Closing.</strong> Once the site closes for the day there is no admittance to the grounds, so don’t plan a sunset walk here.</li>
</ul>
<p>The visitor centre is in the former lighthouse keepers’ houses.</p>

<h2 id="whales">Whales, dolphins and seals</h2>
<p>Hook Lighthouse says that during winter, between November and February in particular, the waters here are frequently visited by humpback, fin and minke whales. It also mentions dolphins and seals. Bring binoculars, and a warm coat: winter on an exposed headland is cold even on a bright day.</p>
<p>For more on picking a season for each drive, see our <a href="${h.u('/best-time-of-year-for-each-drive/')}">best time of year for each drive</a>.</p>

<h2 id="make-a-day">Making a day of it</h2>
<p>Hook Head is the furthest of our nine drives, about 2 hours 15 minutes from Dublin. Our <a href="${h.u('/hook/')}">Hook Head drive</a> links all three walks in one loop: Tintern first, then Fethard and Baginbun, the lighthouse, and back past Loftus Hall and Duncannon Fort. There are cafés at the lighthouse and in Fethard-on-Sea.</p>
<p>To make a weekend of it, cross Waterford Harbour on the car ferry between Ballyhack and Passage East and carry on along the <a href="${h.u('/copper/')}">Copper Coast</a>. The ferry says the crossing takes about five minutes, it sails every day except Christmas Day and St Stephen’s Day, and you don’t need to book. Both drives are on our list of <a href="${h.u('/coastal-drives-from-dublin/')}">coastal drives from Dublin</a>.</p>`,
  },
  {
    slug: 'best-time-of-year-for-each-drive',
    title: 'The best time of year for each drive from Dublin, season by season',
    h1: 'The best time of year for each drive',
    lede: 'Every one of these drives works in any month, but not equally well. Daylight, opening seasons and a few dates fixed in the sky decide which drive to do when. Here is a season-by-season guide.',
    desc: 'When to do each of the nine day drives from Dublin: daylight by season, opening seasons for Newgrange, Knowth, Tintern and Cashel, the solstice and equinoxes, and winter whales at Hook Head.',
    og: 'copper',
    related: ['/driving-guide/', '/newgrange-winter-solstice/', '/loughcrew-walk/', '/hook-head-walks/', '/short-drives-from-dublin/'],
    checked: '2026-11-07',
    sources: [
      ['Heritage Ireland: Brú na Bóinne Visitor Centre, Newgrange, Knowth and Dowth', HI_BRU],
      ['Heritage Ireland: Newgrange winter solstice', HI_SOL],
      ['Heritage Ireland: Loughcrew Megalithic Cemetery', HI_LOUGHCREW],
      ['Heritage Ireland: Rock of Cashel', HI_CASHEL],
      ['Heritage Ireland: Clonmacnoise', HI_CLON],
      ['Heritage Ireland: Tintern Abbey', HI_TINTERN],
      ['Hook Lighthouse: tour information', HOOK_TOURS],
      ['Hook Lighthouse: whale watching season', HOOK_WHALES],
      ['Copper Coast Geopark: questions', GEOPARK_FAQ],
      ['Birr Castle', BIRR],
      ['Wicklow Mountains National Park: parking in Glendalough', NPWS_PARKING],
    ],
    body: (h) => {
      const y = 2027, mid = (/** @type {number} */ m) => new Date(Date.UTC(y, m, 15, 12));
      const day = (/** @type {number} */ m) => { const s = h.sun(mid(m)); return { s, hrs: (s.set.getTime() - s.rise.getTime()) / 36e5 }; };
      const fits = (/** @type {number} */ hrs) => h.trips.filter((t) => t.drive + 3 <= hrs);
      const row = (/** @type {number} */ m, /** @type {string} */ name) => { const d = day(m), f = fits(d.hrs); return `<tr><th scope="row">${name}</th><td>${h.fmtClock(d.s.rise)} to ${h.fmtClock(d.s.set)}</td><td>${h.fmtMins(d.hrs * 60)}</td><td>${f.length === h.trips.length ? 'All nine' : f.length + ' of nine'}</td></tr>`; };
      const tooLong = fits(day(11).hrs);
      const missDec = h.trips.filter((t) => !tooLong.includes(t)).map((t) => t.en);
      const link = (/** @type {string} */ id) => { const t = h.trips.find((x) => x.id === id); return t ? `<a href="${h.u('/' + t.slug + '/')}">${t.en}</a>` : id; };
      return `
<h2 id="daylight">Daylight decides the long drives</h2>
<p>The simplest rule is light. Our drives take between 2½ and 6 hours at the wheel, and you want about three hours on top of that for stops. In midsummer that is easy; in December it isn’t. This table shows sunrise and sunset in Dublin in the middle of each season’s first month, worked out with the same sunrise equation as our <a href="${h.u('/driving-guide/')}">driving guide</a>, and how many of the nine drives fit in the daylight.</p>
<table class="t"><thead><tr><th scope="col">Mid-month</th><th scope="col">Sunrise to sunset</th><th scope="col">Daylight</th><th scope="col">Drives that fit</th></tr></thead><tbody>
${row(11, 'December')}${row(2, 'March')}${row(5, 'June')}${row(8, 'September')}
</tbody></table>
<p>“Fit” here means the time at the wheel plus three hours for stops, before dark. Times are Irish time and approximate. In mid-December, ${missDec.length ? missDec.join(', ').replace(/, ([^,]*)$/, ' and $1') + (missDec.length > 1 ? ' need' : ' needs') + ' more light than the day gives, so start before dawn, cut a stop, or stay the night' : 'every drive fits, just'}.</p>

<h2 id="winter">Winter: December to February</h2>
<p><strong>Go for: the Boyne, Glendalough, and whales at Hook Head.</strong></p>
<p>Winter is the season for the short drives. ${link('boyne')} and ${link('glendalough')} are both about 50 minutes from Dublin, and short enough to fit the light. From 2 November to the end of February, only the Newgrange tour runs at Brú na Bóinne, and tickets go on sale seven days ahead. Around 21 December the visitor centre opens early for the solstice and regular tours are suspended for a few days; the centre is then closed from 23 to 27 December and on 1 January. Our guide to <a href="${h.u('/newgrange-winter-solstice/')}">the Newgrange solstice</a> explains the lottery for the chamber.</p>
<p>In the mountains, check the forecast before you go. On high open roads like the Sally Gap, snow and ice can make the road unwise, and in fog there is nothing to see.</p>
<p>Winter is also the one reason to do the longest drive in the shortest days: Hook Lighthouse says that between November and February in particular, humpback, fin and minke whales are frequently seen in the waters off the headland. Tours of the lighthouse run hourly outside July and August. See <a href="${h.u('/hook-head-walks/')}">walks at Hook Head</a>.</p>

<h2 id="spring">Spring: March to May</h2>
<p><strong>Go for: Loughcrew at the equinox, Knowth, Cashel and Tintern reopening.</strong></p>
<p>The days lengthen fast in March. ${link('loughcrew')}’s Cairn T is aligned with sunrise at the spring equinox, around 20 March, and the OPW says people gather on the hill to greet it. See our <a href="${h.u('/loughcrew-walk/')}">Loughcrew walk</a>.</p>
<p>At Brú na Bóinne, the tour options widen from 1 March, with the Brú na Bóinne tour and Newgrange chamber as the main option, and a daily tour of Knowth. From 1 April, tickets go on sale 30 days ahead. At the Rock of Cashel, the longer summer hours (9am to 5.30pm) start on 17 March. Tintern Abbey, on the Hook drive, opened for its 2026 season on 5 March.</p>

<h2 id="summer">Summer: June to August</h2>
<p><strong>Go for: the long coast drives, the Copper Coast and Slieve Bloom.</strong></p>
<p>With 16 hours or more of daylight, summer is when the longest drives make sense as day trips. The ${link('copper')} drive is about 6 hours at the wheel and ${link('slievebloom')} about 4¾. The Copper Coast Geopark says its visitor centre and café in Bunmahon open seasonally, so check before an off-season visit. At Hook Lighthouse, tours run every half-hour in July and August, and at Loughcrew, OPW guides are on the hill in the summer months.</p>
<p>The catch is everyone else. Glendalough’s park says traffic and parking can be a problem in sunny weather, especially at weekends, so go on a weekday or arrive early. Book Newgrange as soon as your date goes on sale, 30 days ahead.</p>

<h2 id="autumn">Autumn: September to November</h2>
<p><strong>Go for: Cashel and the Vee, the Boyne before the winter timetable, Loughcrew at the autumn equinox.</strong></p>
<p>Autumn keeps enough light for the middle-length drives into October. Loughcrew’s second equinox sunrise is around 22 September. The Rock of Cashel’s summer hours run to 15 October, and its winter hours (9am to 4.30pm) start the next day. At Brú na Bóinne, 1 November is the last day of the summer tour options and the 30-day booking window.</p>
<p>Two closures matter this year. Clonmacnoise, on the ${link('slievebloom')} drive, is fully closed to visitors from 19 October 2026 until 1 January 2027 for car park works. Tintern Abbey closed for the season on 5 November 2026 and the OPW says it reopens in 2027. Birr Castle’s gardens stay open, with shorter November hours (9am to 4.30pm).</p>

<h2 id="book-ahead">What to book ahead, in any season</h2>
<ul>
<li><strong>Newgrange and Knowth:</strong> always. Tickets are released online at midnight, Irish time, 30 days ahead from April to the start of November and 7 days ahead the rest of the year. Cancelled tickets go back on sale each morning and afternoon.</li>
<li><strong>Hook Lighthouse:</strong> every tour must be pre-booked.</li>
<li><strong>Cormac’s Chapel at the Rock of Cashel:</strong> tickets are sold only at the site and places are limited, so ring ahead for tour times.</li>
<li><strong>Loughcrew:</strong> nothing to book, and admission is free.</li>
<li><strong>Glendalough:</strong> only groups of more than 50 need a hiking permit, but the car parks charge.</li>
</ul>
<h2 id="at-a-glance">Each drive at a glance</h2>
<table class="t"><thead><tr><th scope="col">Drive</th><th scope="col">From Dublin</th><th scope="col">At the wheel</th><th scope="col">Our tip</th></tr></thead><tbody>
${h.trips.map((t) => `<tr><th scope="row"><a href="${h.u('/' + t.slug + '/')}">${t.en}</a></th><td>${h.fmtMins(t.mins)}</td><td>≈ ${h.fmtMins(t.drive * 60)}</td><td>${t.best}</td></tr>`).join('')}
</tbody></table>
<p>Whatever the season, opening hours change, and some sites close at short notice in bad weather. Each drive page lists the official pages to check before you set off. For short days, start with our <a href="${h.u('/short-drives-from-dublin/')}">short drives from Dublin</a>.</p>`;
    },
  },
];
