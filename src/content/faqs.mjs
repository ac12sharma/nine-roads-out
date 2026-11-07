// Frequently asked questions, shown on the page and published as FAQPage structured data.
// Every answer must come from the official page in `source`, read on the date in `checked`
// (tests/content.test.mjs enforces both). Re-read the source before changing an answer.
// `a` may contain simple HTML links; the structured data gets the plain text.

/** @typedef {{ q: string, a: string, source: string, checked: string }} Faq */

/** @type {Record<string, Faq[]>} page key -> questions, in the order shown */
export const FAQS = {
  'car-hire': [
    {
      q: 'Do I need an International Driving Permit to drive a hire car in Ireland?',
      a: 'It depends on where your licence is from. EU and EEA licences can be used while they are valid, and UK licences are fine for visitors. Licences from the countries Ireland recognises for licence exchange, which include Australia, Canada and New Zealand, can be used for up to a year when visiting. For a licence from anywhere else, including the US, Citizens Information says you can drive for up to 12 months as a visitor if you also have an international driving permit from your country. The hire company may have its own rules too, so check them when you book.',
      source: 'https://www.citizensinformation.ie/en/travel-and-recreation/motoring/driver-licensing/exchanging-foreign-driving-permit/',
      checked: '2026-11-06',
    },
    {
      q: 'What insurance comes with a hire car in Ireland?',
      a: 'Car rental companies only have to offer basic third-party insurance, which does not cover damage to the rental car itself. Cover for the car usually comes with a high excess, the amount you pay if it is damaged. You can usually buy extra cover from the hire company to reduce the excess, or buy excess insurance from another insurer, which may cost less. If you use another insurer, the hire company still takes the excess from your card and you claim it back.',
      source: 'https://www.ccpc.ie/consumer-advice/cars/renting-a-car',
      checked: '2026-11-06',
    },
    {
      q: 'Do I need a credit card to hire a car?',
      a: 'Usually, yes. The Competition and Consumer Protection Commission says you will need a credit card in the name of the main driver to pay the security deposit, and that a credit card is often required even if you booked with a debit card.',
      source: 'https://www.ccpc.ie/consumer-advice/cars/renting-a-car',
      checked: '2026-11-06',
    },
    {
      q: 'Who pays the M50 toll in a hire car?',
      a: 'Ask the rental company before you set off. eFlow, which runs the toll, says many larger rental companies pay the toll themselves, but if it is down to you, you must pay it by 8pm the next day. The toll is between Junction 6 (Blanchardstown) and Junction 7 (Lucan), and there are no barriers: cameras on the gantry record the number plate.',
      source: 'https://eflow.ie/how-it-works',
      checked: '2026-11-06',
    },
    {
      q: 'How do the other toll roads work?',
      a: 'Every toll road in Ireland except the M50 has a toll plaza with barriers. You pay as you pass, and the manual lanes take cash or card.',
      source: 'https://www.tii.ie/en/roads-tolling/tolling-information/pay-a-toll/',
      checked: '2026-11-06',
    },
  ],
  boyne: [
    {
      q: 'Can I drive straight to Newgrange?',
      a: 'No. Every visit to Newgrange and Knowth starts at the Brú na Bóinne Visitor Centre, and a shuttle bus takes you to the monuments. The OPW says not to go directly to the monuments, as you will not get in.',
      source: 'https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-knowth-and-dowth/',
      checked: '2026-11-06',
    },
    {
      q: 'Do I need to book Newgrange in advance?',
      a: 'Yes. Pre-booking is essential and tickets are limited. Tickets go on sale online at midnight, Irish time: 30 days ahead from 1 April to 1 November, and 7 days ahead in winter. Only tickets from the official Brú na Bóinne booking site are valid. You don\'t need to book to visit the visitor centre on its own.',
      source: 'https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-knowth-and-dowth/',
      checked: '2026-11-06',
    },
    {
      q: 'Can I go inside the tombs?',
      a: 'You can go into the passage and chamber at Newgrange on the tours that include it. The passage is low and narrow, so it may not suit people with claustrophobia or mobility issues. There is no access to the chambers at Knowth.',
      source: 'https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-knowth-and-dowth/',
      checked: '2026-11-06',
    },
    {
      q: 'How do I see the winter solstice inside Newgrange?',
      a: 'Places in the chamber on the mornings around the solstice, 21 December, are given out by a public lottery that you enter online at <a href="https://solsticelottery.ie/">solsticelottery.ie</a>, with one entry per email address. Each winner can bring one guest, and places can't be transferred. In 2026 there were 34,263 entries and 38 winners, drawn on 15 October by children from local primary schools. The OPW also livestreams the sunrise.',
      source: 'https://heritageireland.ie/visit/newgrange-winter-solstice/',
      checked: '2026-11-06',
    },
    {
      q: 'Is Brú na Bóinne open all year?',
      a: 'The visitor centre is open year round, with hours that change by month. It is closed from 23 to 27 December and on 1 January. Check the Heritage Ireland page for the current hours before you go.',
      source: 'https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-knowth-and-dowth/',
      checked: '2026-11-06',
    },
  ],
};
