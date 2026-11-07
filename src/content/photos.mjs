/* Photos on each drive's page, in the "Photos" gallery.

   Your own photos come first: they're original, and Google rewards first-hand travel content.
   1. Put the files in public/photos/<drive id>/, for example public/photos/glendalough/upper-lake.jpg.
      JPG, PNG or WebP, about 1600 px on the long side and under 400 KB each. An optional 800 px copy
      (`small`) is served to phones.
   2. List them below. The first photo is shown large when there are three or more.
   3. Run `npm run build`.

   Drive ids: glendalough, boyne, cooley, loughcrew, slievebloom, leinster, cashel, copper, hook.
   alt describes the photo for people who can't see it. credit is the photographer.

   Photos from Wikimedia Commons also need `source` (the Commons file page), `licence` and, except for
   public domain, `licenceUrl`. Only CC0, public domain and CC BY are used (no NC, ND or SA), each was
   approved by the site owner, and every one is listed in docs/image-credits.md. They were resized and
   converted to WebP, which CC BY credits say ("resized").

   Example of your own photo:
   { file: 'glendalough/upper-lake.jpg', alt: 'The Upper Lake at Glendalough on a still morning', caption: 'The Upper Lake, early on a weekday', credit: 'Your name' },
*/

const CC0 = ['CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'];
const BY2 = ['CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/'];
const BY3 = ['CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/'];
const BY4 = ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'];
const PD = ['Public domain', ''];
const commons = (/** @type {string} */ source, /** @type {string} */ credit, /** @type {string[]} */ [licence, licenceUrl]) => ({ credit, licence, licenceUrl, source });

/**
 * @typedef {object} Photo
 * @property {string} file path under public/photos/, about 1600 px wide
 * @property {string} [small] an 800 px copy for phones
 * @property {string} alt
 * @property {string} [caption]
 * @property {string} [credit] photographer
 * @property {string} [licence] e.g. "CC BY 2.0"; absent for your own photos
 * @property {string} [licenceUrl]
 * @property {string} [source] page the photo came from, e.g. its Wikimedia Commons file page
 */

/** @type {Record<string, Photo[]>} */
export const PHOTOS = {
  glendalough: [
    { file: 'glendalough/upper-lake-1600.webp', small: 'glendalough/upper-lake-800.webp', alt: 'The Upper Lake at Glendalough in autumn: still water reflecting wooded slopes in orange and green, low mist on the hills, and rocks along the shore in the foreground.', caption: 'The Upper Lake in autumn', ...commons('https://commons.wikimedia.org/wiki/File:Glendalough_upper_lake_autumn.jpg', 'Bananenfalter', CC0) },
    { file: 'glendalough/round-tower-1600.webp', small: 'glendalough/round-tower-800.webp', alt: 'The round tower at Glendalough rising above a graveyard of old headstones and stone crosses, beside the roofless ruin of the cathedral, with wooded hills behind.', caption: 'The round tower and cathedral ruins', ...commons('https://commons.wikimedia.org/wiki/File:Glendalough_Round_Tower,_Cemetery_%26_Cathedral.jpg', 'Zairon', BY4) },
    { file: 'glendalough/lough-tay-1600.webp', small: 'glendalough/lough-tay-800.webp', alt: 'Lough Tay seen from above: a dark lake in a steep green valley, with a pale beach at its far end and fields and woods below.', caption: 'Lough Tay from the road above', ...commons('https://commons.wikimedia.org/wiki/File:Lough_Tay,_Wicklow,_Ireland.jpg', 'kilgarron', BY2) },
  ],
  boyne: [
    { file: 'boyne/newgrange-1600.webp', small: 'boyne/newgrange-800.webp', alt: 'Newgrange across the fields: a large round grassy mound with a white stone wall around its front, on a ridge above bare winter trees.', caption: 'Newgrange from across the fields, in winter', ...commons('https://commons.wikimedia.org/wiki/File:Newgrange_passage_tomb_-_2258633855.jpg', 'Jimmy Harris', BY2) },
  ],
  cooley: [
    { file: 'cooley/carlingford-1600.webp', small: 'cooley/carlingford-800.webp', alt: 'Carlingford from the hillside above: sheep in a field, the village’s grey and white houses and a stone tower, and Carlingford Lough stretching away beyond.', caption: 'Carlingford and the lough', ...commons('https://commons.wikimedia.org/wiki/File:Carlingford_Town.JPG', 'Cargoking', BY3) },
  ],
  slievebloom: [
    { file: 'slievebloom/r440-1600.webp', small: 'slievebloom/r440-800.webp', alt: 'The R440 crossing the Slieve Bloom Mountains: a narrow road with yellow edge lines climbing over brown moorland under a grey sky.', caption: 'The R440 over the Slieve Bloom Mountains', ...commons('https://commons.wikimedia.org/wiki/File:IMG_R440SlieveBlooms.jpg', 'Sarah777', PD) },
    { file: 'slievebloom/clonmacnoise-1600.webp', small: 'slievebloom/clonmacnoise-800.webp', alt: 'The graveyard at Clonmacnoise on an overcast day: rows of lichen-covered stone crosses behind a low stone wall, with tall pines around them.', caption: 'The graveyard at Clonmacnoise', ...commons('https://commons.wikimedia.org/wiki/File:Clonmacnoise_Cemetery.png', 'A.-K. D.', CC0) },
  ],
  leinster: [
    { file: 'leinster/brownshill-dolmen-1600.webp', small: 'leinster/brownshill-dolmen-800.webp', alt: 'Brownshill Dolmen: an enormous granite capstone resting on smaller upright stones in a green field, with the sun low behind it.', caption: 'Brownshill Dolmen', ...commons('https://commons.wikimedia.org/wiki/File:IMG_BrownshillDolmen.jpg', 'Sarah777', PD) },
  ],
  cashel: [
    { file: 'cashel/cahir-castle-1600.webp', small: 'cashel/cahir-castle-800.webp', alt: 'Cahir Castle from across the water: high grey stone walls with battlements and square towers, built on a rock that shows at the base of the wall.', caption: 'Cahir Castle', ...commons('https://commons.wikimedia.org/wiki/File:Cahir_Castle,_Castle_St,_Cahir_(506765)_(28498329851).jpg', 'Robert Linsdell from St. Andrews, Canada', BY2) },
    { file: 'cashel/knockmealdowns-1600.webp', small: 'cashel/knockmealdowns-800.webp', alt: 'The Knockmealdown Mountains on the horizon under low cloud, beyond a wide plain of fields and woodland, with a grassy field in the foreground.', caption: 'The Knockmealdown Mountains in the distance', ...commons('https://commons.wikimedia.org/wiki/File:Knockmealdowns_in_distance.JPG', 'Seighean', PD) },
  ],
  copper: [
    { file: 'copper/geopark-cove-1600.webp', small: 'copper/geopark-cove-800.webp', alt: 'A sheltered cove on the Copper Coast: dark cliffs topped with grass around clear blue-green water, a sandy beach and a single stack of rock standing on the sand.', caption: 'A cove on the Copper Coast', ...commons('https://commons.wikimedia.org/wiki/File:Copper_Coast_Geopark.JPG', 'Veekrokki', PD) },
  ],
  hook: [
    { file: 'hook/hook-lighthouse-1600.webp', small: 'hook/hook-lighthouse-800.webp', alt: 'Hook Lighthouse in evening light: a squat round tower with two broad black bands and a white lantern on top, beside the white former keepers’ houses and a lawn with picnic tables.', caption: 'Hook Lighthouse and the former keepers’ houses', ...commons('https://commons.wikimedia.org/wiki/File:Hook_head_lighthouse.jpg', 'Bananenfalter', CC0) },
  ],
};
