# Fact-check log

Claims on the site that were checked against an official source, what the source says, and what changed. "Checked" means the page was read on that date, not that the fact can't change, so re-check before relying on it. Each drive page shows the date its "Know before you go" notes and official links were last checked (`checked` in `src/content/trips.mjs`).

Citizens Information refuses automated requests, so it was read in a browser. Everything else was read with an HTTP fetch.

**Not covered yet:** the route descriptions (the history and description of each stop), the theme pages, the driving guide, and the restaurant listings (checked separately in October 2026, as noted in `restaurants.mjs`).

## Car hire guide (`/car-hire-dublin/`), read 6 November 2026

| Claim (before) | Source | Finding | Now says |
| --- | --- | --- | --- |
| EU and UK licences are fine, "and so are licences from the US, Canada, Australia and New Zealand, without an International Driving Permit" | [Citizens Information: Foreign driving licences in Ireland](https://www.citizensinformation.ie/en/travel-and-recreation/motoring/driver-licensing/exchanging-foreign-driving-permit/) | **Wrong for the US.** EU/EEA: fine while valid. UK: fine for visitors. Recognised states (they include Australia, Canada, New Zealand): up to 1 year when visiting. Anywhere else, including the US: up to 12 months as a visitor *if* you also have an international driving permit. | Follows Citizens Information, country group by group |
| Hire prices include third-party cover and CDW | [CCPC: Renting a car](https://www.ccpc.ie/consumer-advice/cars/renting-a-car) | Companies "only have to offer basic third party insurance", which doesn't cover the rental car. CDW isn't mentioned. | Third-party is the legal minimum; most quotes add cover for the car, with a high excess |
| The excess "often runs to €1,500 or more" | CCPC | Excess "often" high; no figure. No official figure found. | Number removed: check the figure in your quote |
| Desk excess cover, or standalone excess insurance | CCPC | Supported. If you claim on another insurer, the company still takes the excess and you claim it back. | Kept, with that detail |
| Tyres, glass, the underside and wrong fuel are often excluded | CCPC | Not stated | "Read what's excluded" |
| Credit card in the main driver's name; ask if you only have a debit card | CCPC | Supported | Kept |
| Many credit cards exclude Ireland | None found | Not stated by CCPC | "Check whether your card's cover applies in Ireland" |
| M50 toll between junctions 6 and 7, cameras, pay by 8pm the next day, ask who pays | [eFlow: How it works](https://eflow.ie/how-it-works) | Supported. "Many larger rental companies" pay it themselves. | Kept, with junction names |
| M1, M3, M7/M8 have toll plazas, card or cash | [TII: Pay a toll](https://www.tii.ie/en/roads-tolling/tolling-information/pay-a-toll/) | Every toll road except the M50 has barrier plazas; manual lanes take cash or card | Kept, M4 added |
| Age 25, young-driver fees, limits over 70 or 75 | None official | Rental company terms | "Many have age limits"; CCPC's "at least two years' experience" added |
| Most hire cars are manual; automatics sell out in summer; photocopies of licences not accepted; most hires are full to full | None found | Generalisations | Softened ("many", "ask when you book", "check the fuel policy", which CCPC advises) |

## No-car guide (`/day-trips-from-dublin-without-a-car/`), read 6 and 7 November 2026

| Claim | Source | Finding | Change |
| --- | --- | --- | --- |
| St Kevin's Bus from St Stephen's Green North, all year except Christmas Day; morning bus out, late-afternoon return | [St Kevin's Bus timetable](https://www.glendaloughbus.com/timetable.aspx) | Supported; the bus out is at 11.00 | "Late-morning bus" |
| The 161 runs Dundalk–Carlingford–Newry | [Bus Éireann 161](https://www.buseireann.ie/routes-and-timetables/161) | Supported | Link added |
| Trains from Heuston to Waterford; 360 and 360A buses to Tramore | [Irish Rail timetables](https://www.irishrail.ie/en-ie/train-timetables/timetables-by-route), [TFI Waterford](https://www.transportforireland.ie/plan-a-journey/network-maps/waterford-city-bus-services/) | Supported | Links added |
| Loughcrew: "a car park for about ten cars", "tours rarely come here" | [Heritage Ireland: Loughcrew](https://heritageireland.ie/places-to-visit/loughcrew-megalithic-cemetery/) | Not stated. The page does say the approach road is very narrow, 3 km east of Oldcastle. | Replaced with what the page says |

## Drive pages: "Know before you go", read 7 November 2026

Only the claims that changed are listed. The rest were supported by the drive's official links.

| Drive | Claim (before) | Finding | Now says |
| --- | --- | --- | --- |
| Glendalough | Car parks "fill early"; Laragh car park is the council's and free | [NPWS parking](https://www.nationalparks.ie/wicklow/parking-in-glendalough/): "traffic and parking can be an issue" in sunny weather at weekends; Laragh car park open 8am–8pm, 3 km walk. Owner and price not stated. | As the page says, without "free" |
| Glendalough | Parking on the valley road "banned" and "cars are towed" | "Not permitted"; cars "liable to be towed or ticketed" | As the page says |
| Glendalough | The R759 "is not gritted" | Not stated on any official page found | "Check conditions in snow or ice" |
| Boyne Valley | Tickets "often sell out"; "the exhibition comes first" | [Heritage Ireland](https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-knowth-and-dowth/): "availability is very limited"; order of the visit not stated | "Very limited"; the shuttle leaves from the visitor centre |
| Carlingford | Windy Gap road "single-track with sharp bends and no lighting" | Not stated by [carlingford.ie](https://carlingford.ie/cooley-peninsula/) | "Drive it in daylight and take it slowly" |
| Loughcrew | Guides "late May to early September"; car park "about ten cars"; "wear boots" | Guides "in the summer months" ([Discover Boyne Valley](https://www.discoverboynevalley.ie/boyne-valley-drive/heritage-sites/loughcrew-cairns)); car park size not stated; "suitable footwear"; dogs on lead; approach road very narrow | As the pages say |
| Loughcrew (route) | "A steep 10 to 15 minute climb" | "Very steep"; time not stated. About 30 passage tombs, about 5,000 years old. | "A very steep climb"; tomb count and age added from the sources |
| Slieve Bloom | Clonmacnoise "closed until 1 January 2027, visitor centre rebuilt until spring 2027" | [Heritage Ireland](https://heritageireland.ie/places-to-visit/clonmacnoise-monastic-site/): fully closed from 19 October until 1 January 2027 for car park works; no end date for the visitor centre | Dates as the page gives them |
| Slieve Bloom | Birr Castle grounds "open daily from 9am" | [birrcastle.com](https://birrcastle.com/visit-us/): November hours 09:00–16:30, "daily" not stated; Marian Hall car park is pay and display, coins only, no parking inside | From 9am, seasonal hours; parking detail added |
| Slieve Bloom (route) | The Cut "cut by hand in the 1940s"; what the noticeboard says you can see | [Coillte](https://www.coillte.ie/site/the-cut/): 430 m, on the road between Mountrath and Clonaslee, car park overlooks Glendineoregan. The rest not stated. | Rewritten from Coillte |
| Mount Leinster | Summit "about 90 minutes on foot", road "closed to cars", "stretches near 20%"; "no toilets or cafés"; St Mullins "7th-century", "20 minutes" | [Carlow Tourism](https://carlowtourism.com/mount-leinster-heritage-drive/): 795 m; the Heritage Drive is a signposted 75 km loop. The rest not stated. | Replaced with what the page says |
| Cashel | Cormac's Chapel tickets "sold on the day"; parking "€4 in 2026" | [Heritage Ireland](https://heritageireland.ie/places-to-visit/the-rock-of-cashel/): tickets only at the site, "ring ahead for tour times"; "public car park close to site", no charge stated | As the page says |
| Copper Coast | The Geopark Centre "keeps irregular hours outside summer"; the R675 "narrow and winding" | [Geopark FAQ](https://coppercoastgeopark.com/faqs/): visitor centre and café "operate seasonally"; road not described | "Open seasonally"; road note kept as advice only |
| Copper Coast | The Passage East ferry | [Passage East ferry FAQ](https://www.passageferry.ie/pages/faq): about 5 minutes, every day except Christmas Day and St Stephen's Day, no booking | Details added |
| Hook Head | "Tours run every half-hour" | [Hook Lighthouse tours](https://hookheritage.ie/tours/tour-information/): hourly September to June, half-hourly July and August; must be pre-booked; visitor centre in the former keepers' houses | As the page says |
| Hook Head | "Winter is whale season. Minke and fin whales feed off the headland, and the lighthouse balcony makes a good lookout." | [Hook Heritage](https://hookheritage.ie/event/whale-watching-season/): November to February, humpback, fin and minke whales; feeding and balcony not stated | As the page says |
| Hook Head | "The signed Ring of Hook takes under an hour" | Not on any official page found | Removed |

## Brú na Bóinne and the solstice, read 6 November 2026

From [Heritage Ireland: Brú na Bóinne](https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-knowth-and-dowth/), [Newgrange winter solstice](https://heritageireland.ie/visit/newgrange-winter-solstice/) and [solsticelottery.ie](https://solsticelottery.ie/):

- All visits to Newgrange and Knowth start at the visitor centre, with a shuttle bus. "Do not go directly to the monuments as you will not gain entry."
- Booking windows: 7 days ahead from 1 January to 1 March and from 2 November to 31 December; 30 days ahead from 1 April to 1 November. Tickets are released online at midnight, Irish time. Only tickets from the official site are valid.
- The visitor centre is open year round, with hours that vary by month; it is closed 23 to 27 December and 1 January.
- The Newgrange passage is low and narrow. There is no access to the chambers at Knowth.
- Solstice: the light lasts up to 17 minutes, depending on the weather. **The OPW's two sites disagree on the dates**: Heritage Ireland says 18 to 22 December, solsticelottery.ie says 19 to 23 December. The site says "the mornings around 21 December".
- Lottery: online only, one entry per email address, applicants over 10, under-18s with an adult, photo ID on the day, places not transferable. 2027 entries close at midnight on 26 September 2027. The 2026 draw was on 15 October 2026: 34,263 entries, 38 winners each with a guest, drawn by children from three local primary schools. Whether entry is free is not stated.
