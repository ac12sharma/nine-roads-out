// Places to eat on or near each drive. Independent and unpaid: nobody pays to be listed.
// Each one was checked against a 2025-26 listing or the venue's own site in October 2026.
// type: one of TYPES. cuisine: short tags used by the filters and the trip-planner chat.
// Re-check these when you re-check the drives: restaurants open, close and change hands.

export const TYPES = ['Café', 'Pub', 'Restaurant', 'Fine dining'];

export const RESTAURANTS = {
  glendalough: [
    { name: 'The Wicklow Heather', town: 'Laragh', type: 'Restaurant', cuisine: ['Irish', 'European'], near: 'Glendalough', note: 'Restaurant in Laragh, a few minutes from the monastic site, with Irish and European cooking.' },
    { name: "Lynham's of Laragh", town: 'Laragh', type: 'Pub', cuisine: ['Irish'], near: 'Glendalough', note: 'Pub and hotel in Laragh village serving food.' },
    { name: 'Glendalough Green', town: 'Laragh', type: 'Café', cuisine: ['Irish'], near: 'Glendalough', note: 'Café in Laragh, handy for coffee and something to eat before or after the walk to the lakes.' },
  ],
  boyne: [
    { name: 'Monasterboice Inn', town: 'Monasterboice', type: 'Pub', cuisine: ['Irish'], near: 'Monasterboice', note: 'Inn near the high crosses at Monasterboice, with seasonal, locally sourced food.' },
    { name: 'Brambles at Brú na Bóinne', town: 'Donore', type: 'Café', cuisine: ['Irish'], near: 'Brú na Bóinne', note: 'Café inside the Brú na Bóinne visitor centre, for breakfast, lunch or coffee around your tour.' },
    { name: 'Conyngham Arms', town: 'Slane', type: 'Restaurant', cuisine: ['Irish'], near: 'Hill of Slane', note: 'Hotel restaurant in Slane village with a seasonal menu from local producers. Afternoon tea is served in the library.' },
    { name: 'Brabazon at Tankardstown House', town: 'Slane', type: 'Fine dining', cuisine: ['Irish', 'European'], near: 'Hill of Slane', note: 'Fine dining on an estate near Slane, cooking with vegetables from its walled garden. Book ahead.' },
  ],
  cooley: [
    { name: "PJ O'Hare's", town: 'Carlingford', type: 'Pub', cuisine: ['Irish'], near: 'Carlingford', note: 'Traditional pub in Carlingford village serving food.' },
    { name: 'Fishy Dishy', town: 'Carlingford', type: 'Restaurant', cuisine: ['Seafood', 'Irish'], near: 'Carlingford', note: 'Seafood in Carlingford village.' },
    { name: 'Kingfisher Bistro', town: 'Carlingford', type: 'Restaurant', cuisine: ['Irish', 'European'], near: 'Carlingford', note: 'Bistro in Carlingford with Irish and European cooking.' },
    { name: 'Ghan House', town: 'Carlingford', type: 'Fine dining', cuisine: ['Irish', 'Seafood'], near: 'Carlingford', url: 'https://ghanhouse.com/restaurant/', note: 'Georgian country-house restaurant using lough shellfish and Cooley lamb and beef. Dinner only, closed Monday and Tuesday at last check. Book ahead.' },
  ],
  loughcrew: [
    { name: 'Loughcrew Megalithic Centre café', town: 'Oldcastle', type: 'Café', cuisine: ['Irish'], near: 'Loughcrew Cairns', note: 'Café close to the cairns, open at weekends at last check.' },
    { name: 'The Happy Cup Café', town: 'Oldcastle', type: 'Café', cuisine: ['Irish'], near: 'Loughcrew Cairns', note: 'Café in Oldcastle, the nearest town to the cairns.' },
    { name: 'Fore Abbey Coffee Shop', town: 'Fore', type: 'Café', cuisine: ['Irish'], near: 'Fore Abbey', note: 'Café in Fore village, near the abbey ruins.' },
  ],
  slievebloom: [
    { name: 'The Thatch', town: 'Crinkill, Birr', type: 'Pub', cuisine: ['Irish'], near: 'Birr Castle', note: 'Thatched pub just outside Birr serving food.' },
    { name: "Hackett's Eatery", town: 'Birr', type: 'Restaurant', cuisine: ['Irish', 'Mediterranean'], near: 'Birr Castle', note: 'Irish and Mediterranean cooking in Birr town.' },
    { name: 'The Loft Café', town: 'Birr', type: 'Café', cuisine: ['Irish'], near: 'Birr Castle', note: 'Café in Birr town.' },
  ],
  leinster: [
    { name: 'Step House Hotel', town: 'Borris', type: 'Restaurant', cuisine: ['Irish', 'European'], near: 'Borris', note: 'Restaurant at the Step House Hotel in Borris village.' },
    { name: 'Mullichain Café', town: 'St Mullins', type: 'Café', cuisine: ['Irish'], near: 'Borris', url: 'https://themullichaincafe.ie/', note: 'Café in an old grain store on the Barrow quay at St Mullins, about 20 minutes south of Borris.' },
  ],
  cashel: [
    { name: 'Chez Hans', town: 'Cashel', type: 'Restaurant', cuisine: ['Irish', 'European'], near: 'Rock of Cashel', note: 'Restaurant in a former church at the foot of the Rock.' },
    { name: "Mikey Ryan's Bar & Kitchen", town: 'Cashel', type: 'Pub', cuisine: ['Irish'], near: 'Rock of Cashel', note: 'Bar and kitchen in Cashel town.' },
    { name: 'Ladyswell Restaurant', town: 'Cashel', type: 'Café', cuisine: ['Irish'], near: 'Rock of Cashel', note: 'Casual café-restaurant in Cashel town.' },
    { name: "The Bishop's Buttery", town: 'Cashel', type: 'Fine dining', cuisine: ['French', 'Irish'], near: 'Rock of Cashel', note: 'Restaurant at the Cashel Palace Hotel, with French and Irish cooking. Book ahead.' },
  ],
  copper: [
    { name: 'Cupán C', town: 'Bunmahon', type: 'Café', cuisine: ['Irish'], near: 'Bunmahon', url: 'https://cupanc.com/', note: 'Café in Bunmahon, halfway along the Copper Coast, for coffee, lunch and something sweet.' },
    { name: 'The Tannery', town: 'Dungarvan', type: 'Restaurant', cuisine: ['Irish', 'European'], near: 'Home from Dungarvan', note: 'Restaurant in Dungarvan with Irish and European cooking.' },
    { name: "Merry's Gastro Pub", town: 'Dungarvan', type: 'Pub', cuisine: ['Irish'], near: 'Home from Dungarvan', note: 'Gastro pub in Dungarvan town.' },
  ],
  hook: [
    { name: 'Hook Lighthouse café', town: 'Hook Head', type: 'Café', cuisine: ['Irish'], near: 'Hook Lighthouse', note: 'Café in the visitor centre at the foot of the lighthouse.' },
    { name: 'The Wheelhouse Café', town: 'Fethard-on-Sea', type: 'Café', cuisine: ['Irish'], near: 'Fethard-on-Sea and Baginbun', note: 'Café in Fethard-on-Sea village.' },
    { name: 'Roches Bar', town: 'Duncannon', type: 'Pub', cuisine: ['Irish'], near: 'Duncannon Fort', note: 'Pub in Duncannon village, near the fort and the beach.' },
    { name: 'The Harvest Room at Dunbrody', town: 'Arthurstown', type: 'Fine dining', cuisine: ['Irish', 'European'], near: 'Home via New Ross', note: 'Restaurant at Dunbrody Country House in Arthurstown, near the Ballyhack ferry. Book ahead.' },
  ],
};

export const mapsSearch = (r) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${r.name}, ${r.town}, Ireland`);
