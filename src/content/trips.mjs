/**
 * One drive. `slug`, `tags`, `counties`, `words` and the fields in EXTRA are filled in at the end of
 * this file.
 * @typedef {object} Drive
 * @property {string} id
 * @property {string} scene illustration used for the drive's images
 * @property {string} ga Irish name
 * @property {string} en English name
 * @property {string} via
 * @property {string} county
 * @property {string} sig the signature sight
 * @property {number} lat
 * @property {number} lon
 * @property {number} mins minutes from Dublin to the first stop
 * @property {number} km round trip
 * @property {number} drive hours at the wheel for the round trip
 * @property {string} best
 * @property {string} lede
 * @property {{ road: string, n: string, t: string, home?: boolean }[]} stops the last one is the way home
 * @property {string[]} know
 * @property {[string, string][]} links label and official URL
 * @property {{ way: string[], dest: string }} maps
 * @property {string} alt
 * @property {string} desc
 * @property {string} stay
 * @property {string} stayLabel
 * @property {string | null} tour
 * @property {string} slug
 * @property {string[]} tags
 * @property {string[]} counties
 * @property {string[]} words
 * @property {string} checked date (YYYY-MM-DD) the practical details and links were last checked against
 *   the official pages in `links`; shown on the drive page. Only change it after re-reading those pages.
 */
export const TRIPS=/** @type {Drive[]} */ ([
{id:'glendalough',scene:'glendalough',ga:'Gleann Dá Loch',en:'Glendalough',via:'By the Sally Gap and the Military Road',county:'Wicklow',
 sig:'Lough Tay',lat:53.106,lon:-6.258,mins:50,km:140,drive:3.25,best:'Early, on a clear weekday',
 lede:'The nearest escape from the city is also the wildest. The Military Road climbs from Rathfarnham onto open blanket bog, passes the black water of Lough Tay and drops into the valley where St Kevin built his monastery between two lakes.',
 stops:[
  {road:'R115',n:'Glencree',t:'British Army engineers cut this road through the mountains after the 1798 Rebellion. The suburbs are behind you within twenty minutes.'},
  {road:'R115',n:'Sally Gap',t:'A crossroads on open bog at about 500 m, on one of only two roads across the Wicklow Mountains. The Liffey rises in the bog nearby.'},
  {road:'R759',n:'Lough Tay viewpoint',t:'Turn left for a few kilometres to look down on the dark lake and its pale beach below Luggala. The estate is private, so this is a view from the roadside. Come back the same way.'},
  {road:'R115',n:'Glenmacnass Waterfall',t:'Heading south, the river falls off the edge of the plateau into a long glacial valley. There is parking right beside it.'},
  {road:'R115',n:'Glendalough',t:'A 6th-century monastic city with a 30 m round tower. Walk the Green Road or the boardwalk to the Upper Lake.'},
  {road:'R756 · N81',n:'Home over the Wicklow Gap',t:'Climb out of the valley by the second pass and return through Blessington.',home:true}
 ],
 know:[
  'In sunny weather, especially at weekends, traffic and parking at Glendalough can be a problem. The car park in Laragh, beside the Woollen Mills, opens 8am–8pm and is a 3 km walk through the woods along the Green Road.',
  'The Upper Lake car park charges at the entrance, and the Visitor Centre car park charges too. Parking isn’t allowed on the valley road, and cars parked there can be towed or ticketed.',
  'The Sally Gap is high, open bog. In snow or ice, check conditions before you take the Military Road.',
  'In fog there is nothing to see on the bog. Pick a clear day.'
 ],
 links:[['Glendalough parking','https://www.nationalparks.ie/wicklow/parking-in-glendalough/']],
 maps:{way:['Sally Gap, County Wicklow','Lough Tay Viewing Point, County Wicklow','Glenmacnass Waterfall, County Wicklow'],dest:'Glendalough Upper Lake Car Park, County Wicklow'},
 alt:'Illustration: a round tower and a small stone church with a steep roof in a wooded valley, with a lake between steep green hills.'},

{id:'boyne',scene:'boyne',ga:'Gleann na Bóinne',en:'Boyne Valley',via:'Monasterboice, Newgrange, Slane and Tara',county:'Louth & Meath',
 sig:'Brú na Bóinne',lat:53.6947,lon:-6.4466,mins:50,km:150,drive:2.5,best:'A morning tour slot, the hills after lunch',
 lede:'The passage tomb at Newgrange was built around 3200 BC, before Stonehenge and before the pyramids at Giza. It sits in a bend of the Boyne with Knowth beside it, and the royal hills of Slane and Tara are a short drive away.',
 stops:[
  {road:'M1',n:'Monasterboice',t:'A round tower and some of the finest high crosses in Ireland. Muiredach’s Cross is carved all over with 10th-century scenes. Free and always open.'},
  {road:'Local road',n:'Brú na Bóinne',t:'Every visit to Newgrange and Knowth starts at this visitor centre, with a shuttle bus across the river. The main tour takes about three hours. At the winter solstice, sunrise shines down Newgrange’s 19 m passage through a roof-box above the door.'},
  {road:'N51',n:'Hill of Slane',t:'Tradition says St Patrick lit a fire here in 433 in defiance of the High King. The ruined friary on top looks out over the Boyne valley.'},
  {road:'N51 · N3',n:'Hill of Tara',t:'The seat of the High Kings. There is little stone to see, just grassy earthworks and the Lia Fáil coronation stone, with long views over the plain. Free.'},
  {road:'M3',n:'Home',t:'Back down the M3, about 40 minutes.',home:true}
 ],
 know:[
  'Book Brú na Bóinne ahead: availability is very limited. From April to the start of November, tickets go on sale online 30 days in advance; in winter, 7 days. You cannot go straight to the tombs.',
  'Every visit starts at the visitor centre, where the shuttle bus to Newgrange and Knowth leaves from.',
  'From 2 November to the end of February only the Newgrange tour runs. Knowth tours run from March.'
 ],
 links:[['Brú na Bóinne tickets','https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-knowth-and-dowth/']],
 maps:{way:['Monasterboice, County Louth','Brú na Bóinne Visitor Centre, Donore','Hill of Slane, County Meath'],dest:'Hill of Tara, County Meath'},
 alt:'Illustration: winter dawn over the Boyne valley, with the white quartz front of the Newgrange mound catching the low sun and the river curving behind.'},

{id:'cooley',scene:'cooley',ga:'Cairlinn',en:'Carlingford',via:'And the Cooley Peninsula',county:'Louth',
 sig:'Carlingford',lat:54.0406,lon:-6.1874,mins:75,km:240,drive:3.25,best:'Late afternoon, with the sun on the Mournes',
 lede:'A medieval harbour town on a glacial fjord, with the Mourne Mountains across the water and a single-track road over the Windy Gap. This is the country of the Táin, the great cattle-raid epic of Irish legend.',
 stops:[
  {road:'M1 · R173',n:'Proleek Dolmen',t:'A portal tomb in the grounds of the Ballymascanlon House Hotel. Land a pebble on the capstone and, the story goes, you will marry within a year.'},
  {road:'R173',n:'Carlingford',t:'Narrow medieval lanes, the Norman ruin of King John’s Castle on the shore, and Slieve Foy (589 m) rising behind the town. Order the local oysters.'},
  {road:'R173',n:'Omeath',t:'The quiet end of the lough, looking straight across the water at the Mournes.'},
  {road:'Local road',n:'Long Woman’s Grave, Windy Gap',t:'A pass between the peaks with a small car park, a sad legend about a Spanish bride and views down the valley. The Magic Hill, where parked cars seem to roll uphill, is on the same road.'},
  {road:'Local road · M1',n:'Home',t:'Down to Dundalk and south on the M1.',home:true}
 ],
 know:[
  'Drive the Windy Gap road in daylight and take it slowly.',
  'For the widest view, drive the Turf Road up Black Mountain to the TV mast and walk to Clermont Cairn.',
  'The Mournes across the lough are in Northern Ireland. This route stays on the southern shore.'
 ],
 links:[['Carlingford & Cooley','https://carlingford.ie/cooley-peninsula/']],
 maps:{way:['Proleek Dolmen, Ballymascanlon','Carlingford, County Louth','Omeath, County Louth'],dest:"Long Woman's Grave, Omeath"},
 alt:'Illustration: evening over Carlingford Lough, with the pink-lit Mourne Mountains across calm water, sailing boats, and a ruined Norman castle on the near shore below a dark mountain.'},

{id:'loughcrew',scene:'loughcrew',ga:'Loch Craobh',en:'Loughcrew',via:'Kells, the Hill of the Witch and Fore',county:'Meath & Westmeath',
 sig:'Cairn T',lat:53.7447,lon:-7.1123,mins:80,km:210,drive:3,best:'A clear afternoon, or dawn at an equinox',
 lede:'Passage tombs on a chain of hilltops in north-west Meath, about 5,000 years old and much quieter than Newgrange. You walk up through sheep fields to Cairn T, and on a clear day the view is said to reach 18 counties.',
 stops:[
  {road:'M3',n:'Kells',t:'The monastery that gave its name to the Book of Kells. Its round tower and high crosses stand in the churchyard in town.'},
  {road:'R163',n:'Loughcrew Cairns',t:'A very steep climb from the car park to Cairn T, one of about 30 passage tombs on these hills, built some 5,000 years ago. At the spring and autumn equinoxes, the rising sun shines down its passage onto the carved stones at the back of the chamber.'},
  {road:'R195',n:'Fore Abbey',t:'Ruins of a Benedictine priory in a quiet valley, and the Seven Wonders of Fore, among them a tree that will not burn and water that will not boil.'},
  {road:'M4',n:'Home',t:'Through Castlepollard and Mullingar, then the M4.',home:true}
 ],
 know:[
  'The inside of Cairn T is closed for conservation work. The hilltop and the other cairns stay open, free, all year.',
  'In the summer months OPW guides are on the hill to answer questions. Out of season you may have it to yourself.',
  'The approach road is very narrow, and the climb to Cairn T is very steep, so wear suitable footwear. There is no access for wheelchairs. Dogs must be on a lead.',
  'The Loughcrew Estate, below the hills, has gardens and a coffee shop.'
 ],
 links:[['Loughcrew (Heritage Ireland)','https://heritageireland.ie/places-to-visit/loughcrew-megalithic-cemetery/'],['Loughcrew Cairns (Discover Boyne Valley)','https://www.discoverboynevalley.ie/boyne-valley-drive/heritage-sites/loughcrew-cairns']],
 maps:{way:['Kells, County Meath','Loughcrew Cairns, Oldcastle'],dest:'Fore Abbey, County Westmeath'},
 alt:'Illustration: equinox sunrise from a hilltop, with a round stone cairn catching a line of gold light and layers of misty hills below.'},

{id:'slievebloom',scene:'slievebloom',ga:'Sliabh Bladhma',en:'Slieve Bloom',via:'The Cut, Birr and Clonmacnoise',county:'Laois & Offaly',
 sig:'The Cut',lat:53.0924,lon:-7.5559,mins:80,km:330,drive:4.75,best:'A dry, clear day for the views',
 lede:'The only real mountains in the Midlands, crossed by two quiet roads. Take both, see the telescope in Birr that was the largest in the world for 70 years, and finish at a monastery on the Shannon.',
 stops:[
  {road:'M7',n:'The Cut',t:'Leave the motorway for Mountmellick and Clonaslee. Above the village, the mountain road between Mountrath and Clonaslee passes through a notch in the rock at 430 m. The car park beside it looks north over the valley of Glendineoregan.'},
  {road:'R440',n:'Kinnitty',t:'From Mountrath, the R440 crosses the watershed at 458 m over open bog, then drops through forest into the village of Kinnitty.'},
  {road:'R440',n:'Birr Castle',t:'Home of the Leviathan of Parsonstown, a telescope built in the 1840s with a 72-inch mirror. It was the largest in the world for about 70 years, and it still moves. The gardens cover 120 acres.'},
  {road:'R444',n:'Clonmacnoise',t:'St Ciarán founded this monastery on the Shannon in the 6th century. Two round towers, three high crosses and more than 700 early Christian grave slabs remain.'},
  {road:'M6',n:'Home',t:'North to Athlone and home on the M6.',home:true}
 ],
 know:[
  'Clonmacnoise is fully closed to visitors from 19 October 2026 until 1 January 2027 while its car park is rebuilt. Check before you go.',
  'Birr Castle gardens open from 9am, with hours that change by season. There’s no parking inside the demesne: use the Marian Hall pay-and-display car park (coins only) across from the entrance.',
  'The mountain roads are remote. Bring lunch or eat in Birr.'
 ],
 links:[['The Cut (Coillte)','https://www.coillte.ie/site/the-cut/'],['Birr Castle','https://birrcastle.com/'],['Clonmacnoise','https://heritageireland.ie/places-to-visit/clonmacnoise-monastic-site/']],
 maps:{way:['The Cut, Slieve Bloom Mountains','Kinnitty, County Offaly','Birr Castle, County Offaly'],dest:'Clonmacnoise, County Offaly'},
 alt:'Illustration: dusk from a mountain road cresting between dark conifer forests, with the flat Midlands below, a river catching the last light and the first stars.'},

{id:'leinster',scene:'leinster',ga:'Stua Laighean',en:'Mount Leinster',via:'Brownshill, Borris and the Nine Stones',county:'Carlow',
 sig:'Nine Stones',lat:52.6369,lon:-6.7937,mins:100,km:250,drive:3.75,best:'A clear, still afternoon',
 lede:'South Carlow is quiet farmland along the River Barrow, with the Blackstairs Mountains on its eastern edge. The Mount Leinster Heritage Drive climbs to the Nine Stones, a saddle where the county spreads out below you.',
 stops:[
  {road:'M9',n:'Brownshill Dolmen',t:'A portal tomb with a granite capstone estimated at over 100 tonnes, often called the heaviest in Europe. A short path leads from the car park.'},
  {road:'R705',n:'Borris',t:'A Georgian village built of granite above the Barrow. Walk the path beneath the old railway viaduct.'},
  {road:'~Heritage Drive',n:'Nine Stones',t:'Free parking on the saddle below Mount Leinster (795 m). The nine small stones by the road are said to mark nine shepherds lost in a winter storm.'},
  {road:'~Heritage Drive',n:'Bunclody',t:'Down the far side through Kilbrannish Forest to this town on the River Slaney.'},
  {road:'M11',n:'Home',t:'Back to Dublin by the M11, about 1 h 30.',home:true}
 ],
 know:[
  'Mount Leinster rises to 795 m. If you walk up from the Nine Stones, go prepared for hill weather.',
  'Stock up in Borris or Bunclody before the mountain road.',
  'The Heritage Drive is a signposted 75 km loop, and you can join it at any point. This route follows it over the mountain between Borris and Bunclody.'
 ],
 links:[['Mount Leinster Heritage Drive','https://carlowtourism.com/mount-leinster-heritage-drive/']],
 maps:{way:['Brownshill Dolmen, County Carlow','Borris, County Carlow','Nine Stones Viewing Point, Mount Leinster'],dest:'Bunclody, County Wexford'},
 alt:'Illustration: afternoon on the heather slopes of Mount Leinster with a transmitter mast on the summit, a patchwork of fields below, and a row of nine small stones in the foreground.'},

{id:'cashel',scene:'cashel',ga:'Caiseal',en:'Cashel',via:'The Rock, Cahir and the Vee',county:'Tipperary',
 sig:'Rock of Cashel',lat:52.52,lon:-7.8906,mins:105,km:430,drive:5,best:'Late May to early June, when the Vee is in flower',
 lede:'The Rock of Cashel rises out of the Tipperary plain crowned by a round tower, a Romanesque chapel and a roofless cathedral. Carry on to Cahir Castle, then climb the hairpins of the Vee for a view back over the Golden Vale.',
 stops:[
  {road:'M7 · M8',n:'Rock of Cashel',t:'Seat of the Kings of Munster until they gave it to the Church in 1101. Most of what stands dates from the 12th to 15th centuries.'},
  {road:'On foot',n:'Hore Abbey',t:'A roofless Cistercian abbey in the fields below the Rock, a short walk away. Free and usually empty.'},
  {road:'M8',n:'Cahir Castle',t:'One of the largest and best-preserved castles in Ireland, built on a rock island in the River Suir.'},
  {road:'R668',n:'The Vee',t:'Hairpin bends climb to a gap at about 337 m in the Knockmealdown Mountains. Bay Lough lies below, and beyond it the Golden Vale, the Galtees and Slievenamon.'},
  {road:'M8',n:'Home',t:'Back through Clogheen to Mitchelstown and the M8. Allow about 2 h 30.',home:true}
 ],
 know:[
  'Cormac’s Chapel can only be seen on a guided tour. Places are limited and sold only at the Rock, so ring ahead for tour times.',
  'The Rock is very exposed and can close at short notice. In bad weather, ring before you set off.',
  'There is a public car park close to the Rock.',
  'The Vee is a sharp V-shaped bend. If you stop for the view, pull in with care.'
 ],
 links:[['Rock of Cashel (Heritage Ireland)','https://heritageireland.ie/places-to-visit/the-rock-of-cashel/'],['The Vee','https://clogheen.net/see-do/the-vee/']],
 maps:{way:['Rock of Cashel, County Tipperary','Cahir Castle, County Tipperary','Clogheen, County Tipperary'],dest:'The Vee, Knockmealdown Mountains'},
 alt:'Illustration: golden-hour silhouette of the Rock of Cashel, with its round tower, cathedral and chapel on a limestone outcrop above patchwork fields.'},

{id:'copper',scene:'copper',ga:'Trá Mhór go Dún Garbhán',en:'Copper Coast',via:'Tramore to Dungarvan on the R675',county:'Waterford',
 sig:'Tramore',lat:52.1622,lon:-7.152,mins:120,km:420,drive:6,best:'A clear summer evening',
 lede:'Twenty-five kilometres of cliffs, coves and sea stacks between Tramore and Dungarvan, now a UNESCO Global Geopark. The rocks hold 460 million years of the earth’s history, and the cliff tops still carry the engine houses of 19th-century copper mines.',
 stops:[
  {road:'M9 · R675',n:'Metal Man, Tramore',t:'A painted iron sailor on a pillar at Newtown Head, pointing ships away from the bay for two centuries.'},
  {road:'R675',n:'Annestown',t:'A small village on a hill above its cove. Pull-ins along this stretch look down on hidden beaches.'},
  {road:'R675',n:'Tankardstown engine house',t:'The stone engine house and chimney of a 19th-century copper mine, standing right on the cliff edge.'},
  {road:'R675',n:'Bunmahon',t:'The Copper Coast Geopark Centre, a surfing beach and the old mining village at the mouth of the Mahon.'},
  {road:'R675',n:'Clonea Strand',t:'A long Blue Flag beach backed by dunes, 5 km short of Dungarvan.'},
  {road:'N25 · M9',n:'Home from Dungarvan',t:'Dungarvan has a Norman castle on its harbour. From there it is about 2 h 30 back to Dublin.',home:true}
 ],
 know:[
  'This is the longest day here: about 2 hours each way, plus 90 minutes for the coast road without stops. A night in Dungarvan makes it easy.',
  'Take the coast road slowly: it twists along the cliffs.',
  'The Geopark visitor centre and café in Bunmahon open seasonally, so check before you go.',
  'Pair it with Hook Head using the car ferry between Passage East and Ballyhack: a crossing of about 5 minutes, daily except Christmas Day and St Stephen’s Day, with no booking needed.'
 ],
 links:[['Copper Coast UNESCO Global Geopark','https://coppercoastgeopark.com/'],['Passage East ferry','https://www.passageferry.ie/']],
 maps:{way:['Metal Man, Tramore','Tankardstown Engine House, County Waterford','Bunmahon, County Waterford'],dest:'Dungarvan, County Waterford'},
 alt:'Illustration: sunset over the sea from copper-coloured cliffs, with a ruined mine engine house and chimney on the cliff top and two sea stacks offshore.'},

{id:'hook',scene:'hook',ga:'Rinn Duáin',en:'Hook Head',via:'The Ring of Hook',county:'Wexford',
 sig:'Hook Lighthouse',lat:52.1238,lon:-6.9296,mins:135,km:370,drive:5,best:'Any clear day, staying for dusk',
 lede:'A low, windswept finger of limestone pointing into the Celtic Sea, with a lighthouse that has stood at its tip for about 800 years. The Ring of Hook loops past a Cistercian abbey, the beach where the Normans landed, a haunted house and a star-shaped fort.',
 stops:[
  {road:'M11 · N30',n:'Tintern Abbey',t:'Founded around 1200 by William Marshal, who vowed to build an abbey if he survived a storm at sea. The restored Colclough Walled Garden is next door.'},
  {road:'~Ring of Hook',n:'Fethard-on-Sea and Baginbun',t:'Baginbun Head is where a Norman force landed in 1170, and where, the saying goes, Ireland was lost and won.'},
  {road:'~Ring of Hook',n:'Hook Lighthouse',t:'One of the oldest working lighthouses in the world. Guided tours leave every half-hour and climb 115 steps to the balcony.'},
  {road:'~Ring of Hook',n:'Loftus Hall',t:'The peninsula’s famous haunted house. It has been closed inside since 2020, so see it from the road.'},
  {road:'~Ring of Hook',n:'Duncannon Fort',t:'A star-shaped fort built in the 1580s against the Spanish Armada, above a long sandy beach.'},
  {road:'N30 · M11',n:'Home via New Ross',t:'Or take the ferry from Ballyhack and carry on to the Copper Coast.',home:true}
 ],
 know:[
  'Hook Lighthouse tours must be pre-booked. They run every hour from September to June and every half-hour in July and August. The visitor centre is in the old lighthouse keepers’ houses.',
  'Between November and February, humpback, fin and minke whales are often seen in the waters off Hook Head.'
 ],
 links:[['Hook Lighthouse tours','https://hookheritage.ie/tours/tour-information/'],['Whale watching at Hook','https://hookheritage.ie/event/whale-watching-season/'],['Passage East ferry','https://www.passageferry.ie/']],
 maps:{way:['Tintern Abbey, County Wexford','Fethard-on-Sea, County Wexford','Hook Lighthouse, County Wexford'],dest:'Duncannon Fort, County Wexford'},
 alt:'Illustration: blue hour at Hook Head, with the black-and-white banded lighthouse sweeping its beam over a dark sea under the first stars.'}
]);

/* SEO descriptions, booking-search places and tour searches for each drive.
   stay = where the "Stay nearby" link searches; tour = guided-tour search, or null where tours from Dublin are rare. */
/** @type {Record<string, { desc: string, stay: string, stayLabel: string, tour: string | null }>} */
const EXTRA={
  glendalough:{desc:'Drive from Dublin over the Sally Gap and Military Road to Lough Tay and Glendalough. Stops, road numbers, parking tips and a ready Google Maps route.',stay:'Laragh, County Wicklow',stayLabel:'Laragh',tour:'Glendalough day trip from Dublin'},
  boyne:{desc:'Newgrange, Knowth, Monasterboice, Slane and Tara in one day from Dublin. The route, Brú na Bóinne booking tips and a ready Google Maps route.',stay:'Slane, County Meath',stayLabel:'Slane',tour:'Newgrange tour from Dublin'},
  cooley:{desc:'Carlingford, the Cooley Peninsula and the Windy Gap: a day drive from Dublin with the Mourne Mountains across the lough. Stops, roads and tips.',stay:'Carlingford, County Louth',stayLabel:'Carlingford',tour:null},
  loughcrew:{desc:'Loughcrew Cairns, Kells and Fore Abbey: 5,000-year-old passage tombs on a hilltop, on a quiet day drive from Dublin. Route, roads and tips.',stay:'Kells, County Meath',stayLabel:'Kells',tour:null},
  slievebloom:{desc:'Cross the Slieve Bloom Mountains twice, see the giant telescope at Birr Castle and finish at Clonmacnoise. A day drive from Dublin, stop by stop.',stay:'Birr, County Offaly',stayLabel:'Birr',tour:null},
  leinster:{desc:'Brownshill Dolmen, Borris and the Nine Stones on the Mount Leinster Heritage Drive. A day trip by car from Dublin, with the route and tips.',stay:'Borris, County Carlow',stayLabel:'Borris',tour:null},
  cashel:{desc:'The Rock of Cashel, Cahir Castle and the hairpin bends of the Vee in the Knockmealdown Mountains. A long day drive from Dublin, stop by stop.',stay:'Cashel, County Tipperary',stayLabel:'Cashel',tour:'Rock of Cashel tour from Dublin'},
  copper:{desc:'Drive the Copper Coast UNESCO Geopark from Tramore to Dungarvan: cliffs, coves and mine ruins. The route and tips for a long day from Dublin.',stay:'Dungarvan, County Waterford',stayLabel:'Dungarvan',tour:null},
  hook:{desc:'The Ring of Hook in Wexford: Hook Lighthouse, Tintern Abbey, Baginbun and Duncannon Fort. A day trip by car from Dublin, with the route and tips.',stay:'Fethard-on-Sea, County Wexford',stayLabel:'Fethard-on-Sea',tour:null}
};
/* When each drive's "Know before you go" notes and official links were last checked against the
   official pages (see docs/fact-check.md). The route descriptions are not covered by this date. */
/** @type {Record<string, string>} */
const CHECKED={glendalough:'2026-11-07',boyne:'2026-11-07',cooley:'2026-11-07',loughcrew:'2026-11-07',slievebloom:'2026-11-07',leinster:'2026-11-07',cashel:'2026-11-07',copper:'2026-11-07',hook:'2026-11-07'};
/** @type {Record<string, string[]>} */
const TAGS={glendalough:['mountains','heritage'],boyne:['heritage'],cooley:['coast','mountains'],loughcrew:['heritage'],slievebloom:['mountains','heritage'],leinster:['mountains'],cashel:['heritage','mountains'],copper:['coast'],hook:['coast','heritage']};
/* Counties each round trip drives through from Dublin, including the roads there and back.
   Used by the traveller levels on /how-much-of-ireland/. */
/** @type {Record<string, string[]>} */
const COUNTIES={
  glendalough:['Dublin','Wicklow'],
  boyne:['Dublin','Meath','Louth'],
  cooley:['Dublin','Meath','Louth'],
  loughcrew:['Dublin','Meath','Westmeath','Kildare'],
  slievebloom:['Dublin','Kildare','Laois','Offaly','Westmeath','Meath'],
  leinster:['Dublin','Kildare','Carlow','Wexford','Wicklow'],
  cashel:['Dublin','Kildare','Laois','Kilkenny','Tipperary','Cork'],
  copper:['Dublin','Kildare','Carlow','Kilkenny','Waterford'],
  hook:['Dublin','Wicklow','Wexford']
};
/* Extra words people use for each drive, so the trip planner can match free text. */
/** @type {Record<string, string[]>} */
const WORDS={
  glendalough:['glendalough','wicklow','sally gap','lough tay','guinness lake','military road','glenmacnass','laragh','round tower','st kevin','wicklow gap','glencree'],
  boyne:['boyne','newgrange','knowth','slane','tara','meath','monasterboice','bru na boinne','brú na bóinne','passage tomb','solstice','high cross'],
  cooley:['carlingford','cooley','louth','omeath','mourne','mournes','windy gap','oyster','oysters','long woman','proleek','dolmen','fjord'],
  loughcrew:['loughcrew','kells','fore','oldcastle','cairn','cairns','westmeath','equinox','hill of the witch'],
  slievebloom:['slieve bloom','birr','clonmacnoise','shannon','offaly','laois','telescope','leviathan','kinnitty','the cut','athlone'],
  leinster:['mount leinster','carlow','borris','nine stones','brownshill','dolmen','blackstairs','bunclody','st mullins','barrow'],
  cashel:['cashel','rock of cashel','tipperary','cahir','vee','knockmealdown','golden vale','hore abbey'],
  copper:['copper coast','copper','waterford','tramore','dungarvan','bunmahon','geopark','unesco','sea stack','metal man'],
  hook:['hook','hook head','wexford','lighthouse','tintern','loftus','haunted','duncannon','ring of hook','baginbun','ballyhack','whale','whales']
};
TRIPS.forEach(t=>{Object.assign(t,EXTRA[t.id]);t.tags=TAGS[t.id];t.slug=t.id;t.counties=COUNTIES[t.id];t.words=WORDS[t.id];t.checked=CHECKED[t.id];});
export const FILTERS=[['all','All nine'],['coast','Coast'],['mountains','Mountains'],['heritage','Heritage']];
