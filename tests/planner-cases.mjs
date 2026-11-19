// The trip planner evaluation set: questions people might type, and what a good answer contains.
// Expected answers come from the site's data (src/content/), not from what the planner happens to say.
// CASES was written before tuning the parser, and the parser was then fixed where it failed. HOLDOUT was
// written after those fixes and is never tuned against, so its score is the fairer estimate of how the
// planner does on questions nobody has seen. See docs/planner-eval.md.
//
// Each case:
//   q        the question
//   page     drive id when asked on that drive's page (the planner greets with that drive)
//   before   earlier questions in the same conversation
//   kind     which answer is right: drives, drives-none, one, food, food-none, similar, shorter,
//            more, surprise, clear, greet, thanks, level, fallback, topic-<tolls|speed|daylight|
//            weather|signs|nocar|car>
//   cards    the drives shown, in order          first   the first drive shown
//   tag      every drive shown has this tag      eats    the places to eat shown, any order
//   eatType  every place shown is this type      eatOn   every place shown is on one of these drives
//   says     the answer text includes this
//
// Drive ids and minutes from Dublin: glendalough 50, boyne 50, cooley (Carlingford) 75, loughcrew 80,
// slievebloom 80, leinster 100, cashel 105, copper 120, hook 135.

/**
 * @typedef {object} Case
 * @property {string} q
 * @property {string} kind
 * @property {string} [page]
 * @property {string[]} [before]
 * @property {string[]} [cards]
 * @property {string} [first]
 * @property {string} [tag]
 * @property {string[]} [eats]
 * @property {string} [eatType]
 * @property {string[]} [eatOn]
 * @property {string} [says]
 */

/** @type {Case[]} */
export const CASES = [
  // Scenery
  { q: 'The coast', kind: 'drives', cards: ['cooley', 'copper', 'hook'] },
  { q: 'Mountains', kind: 'drives', cards: ['glendalough', 'cooley', 'slievebloom'] },
  { q: 'History and ruins', kind: 'drives', tag: 'heritage', first: 'glendalough' },
  { q: 'something by the sea', kind: 'drives', cards: ['cooley', 'copper', 'hook'] },
  { q: 'I want to see castles', kind: 'drives', tag: 'heritage' },
  { q: 'hiking', kind: 'drives', tag: 'mountains', first: 'glendalough' },
  { q: 'lakes and waterfalls', kind: 'drives', tag: 'mountains' },
  { q: 'neolithic tombs', kind: 'drives', tag: 'heritage' },
  { q: 'old monasteries', kind: 'drives', tag: 'heritage' },
  { q: 'beaches near dublin', kind: 'drives', first: 'cooley', tag: 'coast' },
  { q: 'drives with mountains and the sea', kind: 'drives', first: 'cooley' },

  // Time limits
  { q: 'Under an hour', kind: 'drives', cards: ['glendalough', 'boyne'] },
  { q: 'within 90 minutes', kind: 'drives', cards: ['glendalough', 'boyne', 'cooley'] },
  { q: '1h30', kind: 'drives', cards: ['glendalough', 'boyne', 'cooley'] },
  { q: '1.5 hours', kind: 'drives', cards: ['glendalough', 'boyne', 'cooley'] },
  { q: 'an hour and a half', kind: 'drives', cards: ['glendalough', 'boyne', 'cooley'] },
  { q: 'max 45 mins', kind: 'drives', cards: ['glendalough', 'boyne'] },
  { q: '30 minutes', kind: 'drives-none' },
  { q: 'two and a half hours', kind: 'drives', cards: ['glendalough', 'boyne', 'cooley'] },
  { q: 'under 3 hours', kind: 'drives', cards: ['glendalough', 'boyne', 'cooley'] },
  { q: 'coast within 2 hours', kind: 'drives', cards: ['cooley', 'copper'] },
  { q: 'a castle within 2 hours', kind: 'drives', tag: 'heritage', cards: ['glendalough', 'boyne', 'loughcrew'] },
  { q: 'quick spin to the mountains', kind: 'drives', cards: ['glendalough'] },
  { q: 'the longest drive', kind: 'drives', first: 'hook' },
  { q: 'a full day out', kind: 'drives', first: 'hook' },

  // Lists and surprises
  { q: 'Show me all nine', kind: 'drives', cards: ['glendalough', 'boyne', 'cooley', 'loughcrew', 'slievebloom', 'leinster', 'cashel', 'copper', 'hook'] },
  { q: 'list every drive', kind: 'drives', first: 'glendalough' },
  { q: 'Surprise me', kind: 'surprise' },
  { q: "I don't know, you pick", kind: 'surprise' },
  { q: 'anything', kind: 'surprise' },

  // A drive by name or by a place on it
  { q: 'Glendalough', kind: 'one', cards: ['glendalough'] },
  { q: 'tell me about Newgrange', kind: 'one', cards: ['boyne'] },
  { q: 'Rock of Cashel', kind: 'one', cards: ['cashel'] },
  { q: 'Hook Lighthouse', kind: 'one', cards: ['hook'] },
  { q: 'Is the Sally Gap worth it?', kind: 'one', cards: ['glendalough'] },
  { q: 'Carlingford', kind: 'one', cards: ['cooley'] },
  { q: 'Copper Coast', kind: 'one', cards: ['copper'] },
  { q: 'Birr Castle', kind: 'one', cards: ['slievebloom'] },
  { q: 'Tramore', kind: 'one', cards: ['copper'] },
  { q: 'the Vee', kind: 'one', cards: ['cashel'] },
  { q: 'Loftus Hall', kind: 'one', cards: ['hook'] },
  { q: 'Kells', kind: 'one', cards: ['loughcrew'] },
  { q: 'the Wicklow mountains', kind: 'one', cards: ['glendalough'] },
  { q: 'Brú na Bóinne', kind: 'one', cards: ['boyne'] },
  { q: 'Mount Leinster', kind: 'one', cards: ['leinster'] },
  { q: 'Wexford', kind: 'one', cards: ['hook'] },
  { q: 'walks near Kells', kind: 'one', cards: ['loughcrew'] },
  { q: 'how long is the drive to Cashel', kind: 'one', cards: ['cashel'] },
  { q: 'Is Glendalough within an hour?', kind: 'drives', first: 'glendalough' },

  // Places to eat
  { q: 'Lunch stops', kind: 'food' },
  { q: 'lunch near Glendalough', kind: 'food', eats: ['The Wicklow Heather', "Lynham's of Laragh", 'Glendalough Green'] },
  { q: 'seafood in Carlingford', kind: 'food', eats: ['Fishy Dishy', 'Ghan House'] },
  { q: 'seafood near the coast', kind: 'food', eats: ['Fishy Dishy', 'Ghan House'] },
  { q: 'oysters', kind: 'food', eats: ['Fishy Dishy', 'Ghan House'] },
  { q: 'a pub on the Boyne drive', kind: 'food', eats: ['Monasterboice Inn'] },
  { q: 'coffee in Cashel', kind: 'food', eats: ['Ladyswell Restaurant'] },
  { q: 'fine dining', kind: 'food', eats: ['Brabazon at Tankardstown House', 'Ghan House', "The Bishop's Buttery", 'The Harvest Room at Dunbrody'] },
  { q: 'somewhere romantic for dinner', kind: 'food', eatType: 'Fine dining' },
  { q: 'french food', kind: 'food', eats: ["The Bishop's Buttery"] },
  { q: 'vegan options at Hook Head', kind: 'food', eatOn: ['hook'], says: 'dietary' },
  { q: 'gluten free', kind: 'food', says: 'dietary' },
  { q: 'cafés on the way to Loughcrew', kind: 'food', eats: ['Loughcrew Megalithic Centre café', 'The Happy Cup Café', 'Fore Abbey Coffee Shop'] },
  { q: 'where can I get a pint in Dungarvan', kind: 'food', eats: ["Merry's Gastro Pub"] },
  { q: 'food within an hour of Dublin', kind: 'food', eatOn: ['glendalough', 'boyne'] },
  { q: 'cheap eats in Birr', kind: 'food', eatOn: ['slievebloom'] },
  { q: 'breakfast near Slane', kind: 'food', eatType: 'Café', eatOn: ['boyne'] },
  { q: 'coffee stop on the way to Hook Head', kind: 'food', eats: ['Hook Lighthouse café', 'The Wheelhouse Café'] },
  { q: 'Where to eat on this drive', page: 'hook', kind: 'food', eatOn: ['hook'] },
  { q: 'lunch?', page: 'hook', kind: 'food', eatOn: ['hook'] },
  { q: 'seafood near the coast', page: 'hook', kind: 'food', eats: ['Fishy Dishy', 'Ghan House'] },
  { q: 'thai food in Carlingford', kind: 'food-none' },

  // Practical questions
  { q: 'how do the tolls work', kind: 'topic-tolls' },
  { q: 'do I need to pay the M50', kind: 'topic-tolls' },
  { q: 'speed limits on motorways', kind: 'topic-speed' },
  { q: 'what time is sunset', kind: 'topic-daylight' },
  { q: 'how many hours of daylight today', kind: 'topic-daylight' },
  { q: 'is it going to rain', kind: 'topic-weather' },
  { q: "I don't have a car", kind: 'topic-nocar' },
  { q: 'can I get there by bus', kind: 'topic-nocar' },
  { q: 'Glendalough by bus', kind: 'topic-nocar' },
  { q: 'renting a car in Dublin', kind: 'topic-car' },
  { q: 'what do the brown signs mean', kind: 'topic-signs' },

  // Follow-ups in a conversation
  { before: ['Glendalough'], q: 'something similar', kind: 'similar', cards: ['boyne', 'cooley', 'loughcrew'] },
  { before: ['Hook Head'], q: 'something shorter', kind: 'shorter', cards: ['copper', 'cashel', 'leinster'] },
  { before: ['Mountains'], q: 'another', kind: 'more', cards: ['leinster', 'cashel'] },
  { before: ['The coast'], q: 'under 2 hours', kind: 'drives', cards: ['cooley', 'copper'] },
  { before: ['coast within 2 hours'], q: 'Clear filters', kind: 'clear' },
  { before: ['Boyne Valley'], q: 'where to eat on this drive', kind: 'food', eatOn: ['boyne'] },
  { before: ['Carlingford'], q: 'what about pubs', kind: 'food', eats: ["PJ O'Hare's"] },
  { before: ['Rock of Cashel'], q: 'anywhere for fancy food', kind: 'food', eats: ["The Bishop's Buttery"] },

  // Chat and things the planner can't answer from its data
  { q: 'hi', kind: 'greet' },
  { q: 'thanks!', kind: 'thanks' },
  { q: 'what level am I', kind: 'level' },
  { q: 'how much of Ireland have I driven', kind: 'level' },
  { q: "what's the best hotel in Kilkenny", kind: 'fallback' },
  { q: 'is it open on Mondays', kind: 'fallback' },
];

// Written after the parser fixes of November 2026. Don't change the parser to pass these: add a new
// case to CASES instead, and leave this set as it is.
/** @type {Case[]} */
export const HOLDOUT = [
  { q: 'somewhere with a lighthouse', kind: 'one', cards: ['hook'] },
  { q: 'day trip to the seaside under 90 mins', kind: 'drives', cards: ['cooley'] },
  { q: 'what is there to do near Dungarvan', kind: 'one', cards: ['copper'] },
  { q: 'Waterford coast', kind: 'one', cards: ['copper'] },
  { q: 'I love old ruins and abbeys', kind: 'drives', tag: 'heritage' },
  { q: 'nice lunch spot in Laragh', kind: 'food', eatOn: ['glendalough'] },
  { q: 'is there a pub near the Hill of Tara', kind: 'food', eats: ['Monasterboice Inn'] },
  { q: 'where to get cake in Birr', kind: 'food', eats: ['The Loft Café'] },
  { q: 'italian restaurant', kind: 'food-none' },
  { q: 'can I bring my dog', kind: 'fallback' },
  { q: 'how fast can I drive on a national road', kind: 'topic-speed' },
  { q: 'when does it get dark', kind: 'topic-daylight' },
  { q: 'do I need an international driving permit', kind: 'topic-car' },
  { q: 'shortest drive', kind: 'drives', first: 'glendalough' },
  { q: 'cliffs', kind: 'drives', cards: ['cooley', 'copper', 'hook'] },
  { q: 'mountain drive under 2 hours', kind: 'drives', cards: ['glendalough', 'cooley', 'slievebloom'] },
  { q: 'heritage sites in Tipperary', kind: 'one', cards: ['cashel'] },
  { q: 'Newgrange and lunch', kind: 'food', eatOn: ['boyne'] },
  { q: 'something in Carlow', kind: 'one', cards: ['leinster'] },
  { q: 'good views', kind: 'drives', tag: 'mountains' },
  { q: 'coastal drive with a castle', kind: 'drives', first: 'hook' },
  { q: 'where can we stay the night', kind: 'fallback' },
  { q: 'how long does Hook Head take', kind: 'one', cards: ['hook'] },
  { q: 'any breweries?', kind: 'fallback' },
  { before: ['The coast'], q: 'which one is closest', kind: 'drives', first: 'cooley' },
  { q: 'speed cameras', kind: 'topic-speed' },
  { q: 'brunch in Slane', kind: 'food', eatType: 'Café', eatOn: ['boyne'] },
  { q: 'things to do with kids', kind: 'fallback' },
];
