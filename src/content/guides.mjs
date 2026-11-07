/* Content for the theme pages (/coastal-drives-from-dublin/ and so on) and the no-car guide.
   Facts here repeat what is on the drive pages in trips.mjs, which link to their official sources.
   If a drive's details change, update both files. */

export const THEMES = [
  {
    key: 'coast', slug: 'coastal-drives-from-dublin', og: 'hook',
    nav: 'Coastal drives',
    title: 'Coastal drives from Dublin: three day trips to the sea',
    h1: 'Coastal day drives from Dublin',
    lede: 'Three of the nine drives end at the sea: a glacial fjord in Louth, a cliff coast in Waterford and a lighthouse headland in Wexford. Here is how they compare, and how to choose.',
    desc: 'The best coastal day drives from Dublin: Carlingford Lough, the Copper Coast and Hook Head, compared by drive time, with the routes and tips for each.',
    pick: (t) => t.tags.includes('coast'),
    angle: {
      cooley: 'Carlingford Lough is a glacial fjord, with the Mourne Mountains rising straight out of the water on the far side. The R173 follows the shore from Carlingford to Omeath, the quiet end of the lough.',
      copper: 'The R675 runs for about 25 km from Tramore to Dungarvan past cliffs, coves, sea stacks and the engine houses of 19th-century copper mines. Pull-ins look down on hidden beaches.',
      hook: 'The signed Ring of Hook circles a low limestone headland to Hook Lighthouse, one of the oldest working lighthouses in the world, with Baginbun and the beach at Duncannon on the way.',
    },
    choose: 'Carlingford is the closest, at about 1 h 15 up the M1, and the easiest to fit into a short day. The Copper Coast is the longest day on this site and the most dramatic coast road. Hook Head is the one for history as well as sea views.',
    tips: [
      ['Time it for the light', 'Carlingford is best in late afternoon, with the sun on the Mournes. The Copper Coast is at its finest on a clear summer evening, and at Hook Head it is worth staying for dusk.'],
      ['Expect wind', 'Headlands and cliff tops are exposed. Check the forecast from Met Éireann the night before, and keep a closer drive in reserve.'],
      ['Narrow coast roads', 'The R675 on the Copper Coast is narrow and winding. Take it slowly and use the pull-ins to let traffic past.'],
      ['Make a weekend of it', 'The car ferry between Passage East and Ballyhack links the Copper Coast and Hook Head, so you can do one each day with a night in between.'],
      ['Winter whales', 'Minke and fin whales feed off Hook Head in winter, and the lighthouse balcony makes a good lookout.'],
    ],
  },
  {
    key: 'mountains', slug: 'mountain-drives-from-dublin', og: 'glendalough',
    nav: 'Mountain drives',
    title: 'Mountain drives from Dublin: five scenic passes for a day trip',
    h1: 'Mountain day drives from Dublin',
    lede: 'Bog passes, a notch cut through rock by hand and a climb up hairpin bends. Five of the nine drives cross real mountain roads, from the Sally Gap, under an hour from the city, to the Vee in the Knockmealdowns.',
    desc: 'Five scenic mountain drives from Dublin for a day trip: the Sally Gap, the Windy Gap, Slieve Bloom, Mount Leinster and the Vee, with routes and safety tips.',
    pick: (t) => t.tags.includes('mountains'),
    angle: {
      glendalough: 'The Military Road climbs onto open blanket bog at the Sally Gap, about 500 m up, past the black water of Lough Tay. You come home over a second pass, the Wicklow Gap.',
      cooley: 'A single-track road climbs to the Windy Gap between the peaks of the Cooley Mountains, with views down the valley and the Magic Hill on the same road.',
      slievebloom: 'Two quiet roads cross the only real mountains in the Midlands: The Cut, a notch cut through the rock by hand at 430 m, and the R440 over open bog at 458 m.',
      leinster: 'The Mount Leinster Heritage Drive climbs to the Nine Stones, a saddle below the 795 m summit, with the farmland of south Carlow spread out below.',
      cashel: 'After the Rock of Cashel and Cahir Castle, the R668 climbs in hairpins to the Vee, a gap at about 337 m in the Knockmealdown Mountains, above Bay Lough.',
    },
    choose: 'Glendalough is the closest and wildest, and the obvious first choice. Slieve Bloom and Mount Leinster are quieter and less known. The Vee is the most dramatic road, but it comes at the end of a long day.',
    tips: [
      ['Fog changes everything', 'In fog there is nothing to see on the bog or from the passes. Pick a clear day, check Met Éireann and keep a lower drive in reserve.'],
      ['Ice and snow', 'Some mountain roads, including the R759 over the Sally Gap, are not gritted and can be impassable in snow or ice.'],
      ['Single-track manners', 'On single-track roads like the Windy Gap, whoever is nearer a gateway or wide spot pulls in. Drive them in daylight.'],
      ['Bring lunch', 'There are no shops or cafés on the Slieve Bloom mountain roads, and no toilets or cafés at the Nine Stones. Stock up in the towns below.'],
      ['Pull in with care', 'The lay-bys at the top of the Vee are small and sit on sharp bends.'],
    ],
  },
  {
    key: 'heritage', slug: 'historic-day-trips-from-dublin', og: 'boyne',
    nav: 'Historic drives',
    title: 'Historic day trips from Dublin by car: tombs, monasteries and castles',
    h1: 'Historic day drives from Dublin',
    lede: 'Five thousand years of Irish history within a day’s drive of Dublin: passage tombs older than the pyramids, early Christian monasteries, the seat of the Kings of Munster and a lighthouse that has stood for about 800 years.',
    desc: 'Historic day trips from Dublin by car: Newgrange, Loughcrew, Glendalough, the Rock of Cashel and Hook Head, with booking tips and the free sites on each route.',
    pick: (t) => t.tags.includes('heritage'),
    angle: {
      boyne: 'Newgrange was built around 3200 BC. Visits to it and Knowth start at the Brú na Bóinne visitor centre, and the high crosses at Monasterboice and the hills of Slane and Tara are on the same loop.',
      loughcrew: 'Passage tombs about 5,000 years old on a chain of hilltops in north-west Meath. The hilltop is free and open all year, and usually far quieter than Newgrange.',
      glendalough: 'St Kevin’s 6th-century monastic city, with its 30 m round tower, sits between two lakes at the end of the Military Road.',
      slievebloom: 'Birr Castle is home to the Leviathan, an 1840s telescope that was the largest in the world for about 70 years. Clonmacnoise, the drive’s last stop, is closed until 1 January 2027.',
      cashel: 'The Rock of Cashel was the seat of the Kings of Munster until they gave it to the Church in 1101. Cahir Castle, one of the best preserved in Ireland, is on the same route.',
      hook: 'Tintern Abbey from around 1200, the headland where the Normans landed in 1170, one of the oldest working lighthouses in the world and a star fort built against the Armada.',
    },
    choose: 'For the most famous site, it’s the Boyne Valley, but book ahead. For the same age of tomb with almost nobody around, go to Loughcrew. For a single unforgettable building, it’s the Rock of Cashel.',
    tips: [
      ['Book Brú na Bóinne early', 'Tickets go on sale 30 days ahead in season and often sell out. From early November to the end of February only the Newgrange tour runs.'],
      ['OPW Heritage Card', 'Brú na Bóinne, the Rock of Cashel, Cahir Castle and Clonmacnoise are run by the Office of Public Works. One Heritage Card covers entry to all of them for a year.'],
      ['Free and always open', 'Monasterboice, the Hill of Tara, Hore Abbey below the Rock of Cashel and the Loughcrew hilltop cost nothing to visit.'],
      ['Guided tours only', 'Cormac’s Chapel at Cashel can only be seen on a guided tour, with places sold on the day at the Rock.'],
      ['Sunrise in the tombs', 'At the winter solstice, sunrise shines down the passage at Newgrange. At the spring and autumn equinoxes, it lights the carved stone at the back of Cairn T at Loughcrew.'],
    ],
  },
  {
    key: 'short', slug: 'short-drives-from-dublin', og: 'loughcrew',
    nav: 'Short drives',
    title: 'Short day drives from Dublin: four trips under 3½ hours at the wheel',
    h1: 'Short day drives from Dublin',
    lede: 'Not every day out needs six hours in the car. These four drives keep the total driving under three and a half hours, which leaves time for the stops even in midwinter, when there are fewer than eight hours of daylight.',
    desc: 'Four short day drives from Dublin with under 3½ hours of driving in total: Glendalough, the Boyne Valley, Loughcrew and Carlingford. Good for winter days and half days.',
    pick: (t) => t.drive <= 3.25,
    daylight: true,
    angle: {
      boyne: 'The shortest day here, at about 2 h 30 at the wheel. Book a morning tour at Brú na Bóinne and do the Hill of Slane and the Hill of Tara after lunch.',
      loughcrew: 'About 3 hours of driving. The climb from the car park to Cairn T takes 10 to 15 minutes, and the hilltop is free and open all year.',
      glendalough: 'Into the mountains in 50 minutes, about 3 h 15 of driving in all. Go early: the Glendalough car parks fill on sunny weekends.',
      cooley: 'About 3 h 15 of driving, most of it on the M1. Drive the Windy Gap in daylight: it is single-track with sharp bends and no lighting.',
    },
    choose: 'For a half day, the Boyne Valley. For the biggest change of scene in the least time, Glendalough. Loughcrew and Carlingford make good winter days if you set off by mid-morning.',
    tips: [
      ['Watch the sunset time', 'Plan to be off mountain and single-track roads before dark. Sunrise and sunset for every month are in the driving guide.'],
      ['Winter at Brú na Bóinne', 'From early November to the end of February only the Newgrange tour runs. Knowth reopens in March.'],
      ['Ice on the Sally Gap', 'The R759 over the Sally Gap is not gritted. In a cold snap, skip the Sally Gap and take the main route via the N11.'],
      ['Parking at Glendalough', 'The council’s free car park in Laragh is a 3 km walk along the Green Road. Parking on the valley road is banned and cars are towed.'],
    ],
  },
];

/* No car? How each drive works without one.
   level: 'easy' (bus or tour works well), 'part' (you can reach part of it), 'car' (you need a car). */
export const NOCAR = {
  glendalough: { level: 'easy', text: 'St Kevin’s Bus runs from St Stephen’s Green North to Glendalough all year except Christmas Day. The late-morning bus out and the late-afternoon return give you a few hours in the valley, enough to walk to the Upper Lake. You miss the Sally Gap and Lough Tay, which are the best of the drive.', links: [['St Kevin’s Bus timetable', 'https://www.glendaloughbus.com/timetable.aspx']] },
  boyne: { level: 'easy', text: 'Guided day tours from Dublin are the simplest way, and many include the Newgrange visit. You can’t drive or walk to the tombs anyway: every visit starts at the Brú na Bóinne visitor centre with a shuttle bus across the river. By public transport, the nearest bus station is Drogheda. Check onward times in the TFI Journey Planner.', links: [['Brú na Bóinne tickets', 'https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-knowth-and-dowth/']] },
  cashel: { level: 'part', text: 'Day tours from Dublin often include the Rock of Cashel as one of several stops. Cashel has bus links, but services have changed in recent years, so check the TFI Journey Planner. The Vee needs a car.', links: [] },
  cooley: { level: 'part', text: 'You can reach Carlingford town by bus: the 161 runs from Dundalk through Carlingford to Newry, and Dundalk has trains and buses from Dublin. The Windy Gap and the rest of the peninsula need a car.', links: [['Bus Éireann route 161', 'https://www.buseireann.ie/routes-and-timetables/161']] },
  copper: { level: 'part', text: 'Trains run from Dublin Heuston to Waterford, and the 360 and 360A buses go on to Tramore. The R675 coast road beyond Tramore needs a car.', links: [['Irish Rail timetables by route', 'https://www.irishrail.ie/en-ie/train-timetables/timetables-by-route'], ['Waterford city bus routes (TFI)', 'https://www.transportforireland.ie/getting-around/network-maps/waterford-city-bus-services/']] },
  loughcrew: { level: 'car', text: 'The cairns are on a hilltop down a very narrow country road, about 3 km east of Oldcastle. There is no practical bus, so you need a car.', links: [['Loughcrew (Heritage Ireland)', 'https://heritageireland.ie/places-to-visit/loughcrew-megalithic-cemetery/']] },
  slievebloom: { level: 'car', text: 'The point of this drive is the two mountain roads, and no buses cross them. You need a car.', links: [] },
  leinster: { level: 'car', text: 'The Heritage Drive and the Nine Stones are only reachable by road, with no public transport. You need a car.', links: [] },
  hook: { level: 'car', text: 'Hook Head is at the end of a long peninsula with no practical public transport. You need a car.', links: [] },
};
