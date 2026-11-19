// The trip planner's logic: reads a question, works out what was asked, and chooses the answer from
// the site's own data. It returns plain data (text, drives, places to eat, suggested follow-ups);
// src/assets/app.js renders it. No DOM or network here, so tests/planner-eval.test.mjs can run the
// same code the browser does.
import { esc, fmtMins, sunTimes, fmtClock } from './format.mjs';
import { levelLine } from './levels.mjs';

/**
 * A drive as shipped to the browser in assets/data.*.json (built by src/data.mjs).
 * @typedef {object} Trip
 * @property {string} id
 * @property {string} slug
 * @property {string} en
 * @property {number} mins minutes from Dublin to the first stop
 * @property {number} drive hours at the wheel for the round trip
 * @property {string} wind compass heading from Dublin, e.g. "SSE"
 * @property {string[]} tags coast, mountains, heritage
 * @property {string} best
 * @property {string} desc
 * @property {string} blurb
 * @property {string[]} words lower-case names the planner recognises
 * @property {string[]} stops
 */
/**
 * @typedef {object} Eat
 * @property {string} name
 * @property {string} town
 * @property {string} type Café, Pub, Restaurant or Fine dining
 * @property {string[]} cuisine
 * @property {string} map
 * @property {boolean} featured
 */
/** @typedef {{ trips: Trip[], eat: Record<string, Eat[]> }} PlannerData */
/**
 * What the conversation is about so far, so follow-ups like "something shorter" make sense.
 * @typedef {{ tags: string[], max: number | null, trip: Trip | null, last: Trip[], offset: number }} Context
 */
/**
 * Things the planner needs from its surroundings.
 * @typedef {object} Env
 * @property {{ guide: (anchor?: string) => string, map: string, hire: string, noCar: string }} url
 * @property {() => import('./levels.mjs').Stats} stats the visitor's traveller level
 * @property {boolean} [ai] whether unanswered questions can go to the AI back end
 * @property {Date} [now]
 * @property {() => number} [random]
 */
/**
 * An answer. `text` is HTML (already escaped). `kind` says which branch answered, for tests.
 * @typedef {object} Reply
 * @property {string} kind
 * @property {string} text
 * @property {Trip[]} [cards]
 * @property {{ r: Eat, t: Trip | null }[]} [eats]
 * @property {string[]} [notes]
 * @property {string[]} chips suggested follow-up questions
 */
/**
 * @typedef {object} Intent
 * @property {string[]} tags
 * @property {number | null} max minutes
 * @property {boolean} [vague] the limit came from a word like "near", not a number
 * @property {boolean} food
 * @property {string | null} type
 * @property {string | null} cuisine
 * @property {boolean} diet
 * @property {Trip | null} trip
 * @property {boolean} surprise
 * @property {boolean} greet
 * @property {boolean} thanks
 * @property {string | null} topic
 * @property {boolean} level
 * @property {boolean} longer
 * @property {boolean} another
 * @property {boolean} similar
 * @property {boolean} shorter
 * @property {boolean} clear
 * @property {boolean} all
 * @property {boolean} [any] whether anything at all was recognised
 */

export const START = ['The coast', 'Mountains', 'History and ruins', 'Under an hour', 'Lunch stops', 'Surprise me'];
/** @type {Record<string, string>} */
const TAGNAME = { coast: 'the coast', mountains: 'mountains', heritage: 'history and ruins' };
/** @type {Record<string, string>} */
const TAGADJ = { coast: 'coastal', mountains: 'mountain', heritage: 'heritage' };
/** @type {Record<string, string>} */
const TYPEPL = { 'Café': 'cafés', 'Pub': 'pubs', 'Restaurant': 'restaurants', 'Fine dining': 'fine dining' };

/** @returns {Context} */
export const newContext = () => ({ tags: [], max: null, trip: null, last: [], offset: 0 });

const link = (/** @type {string} */ href, /** @type {string} */ label) => ' <a href="' + esc(href) + '">' + esc(label) + '</a>';
/** @type {Record<string, number>} */
const NUM = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5 };
/** Cuisines people ask for. Only some appear in the listings; asking for the others gets an honest "none listed". */
const CUISINES = ['seafood', 'french', 'mediterranean', 'european', 'irish', 'italian', 'pizza', 'indian', 'chinese', 'thai', 'japanese', 'sushi', 'mexican', 'spanish', 'tapas', 'burgers?', 'steak'];
const cap = (/** @type {string} */ s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The first message when the planner opens.
 * @param {PlannerData | null} data null if the drive data didn't load
 * @param {Context} ctx
 * @param {string} [pageTrip] id of the drive whose page this is
 * @returns {Reply}
 */
export function greeting(data, ctx, pageTrip) {
  const t = pageTrip && data ? data.trips.find((x) => x.id === pageTrip) : null;
  if (t) {
    ctx.trip = t; ctx.last = [t];
    return { kind: 'greet-trip', text: 'Planning the ' + esc(t.en) + ' drive? I can find places to eat on it, suggest something similar, or answer questions about timing and tolls.', chips: ['Where to eat on this drive', 'Something similar', 'Something shorter', 'The coast'] };
  }
  return { kind: 'greet', text: 'Where do you want to go? Pick a kind of day out, or tell me a place, how far you\'ll drive or what you\'d like to eat.', chips: START };
}

/**
 * Works out what a question is asking for.
 * @param {string} q
 * @param {PlannerData} data
 * @param {Context} ctx
 * @returns {Intent}
 */
export function parse(q, data, ctx) {
  const T = ' ' + q.toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\bhalf an? hour\b/g, '30 minutes')
    .replace(/\b(an?|one) hour and a half\b/g, '1.5 hours')
    .replace(/\b(an?|one|two|three|four|five)( and a half)? hours?\b/g, (_, n, half) => (NUM[n] + (half ? 0.5 : 0)) + ' hours') + ' ';
  /** @type {Intent} */
  const it = { tags: [], max: null, food: false, type: null, cuisine: null, diet: false, trip: null, surprise: false, greet: false, thanks: false, topic: null, level: false, longer: false, another: false, similar: false, shorter: false, clear: false, all: false };
  if (/\b(coast|coastal|sea|seaside|beach|beaches|cliffs?|ocean|coves?|harbour|lighthouse)\b/.test(T)) it.tags.push('coast');
  if (/\b(mountains?|hills?|hike|hiking|pass|passes|views?|scenic|bog|lakes?|lough|wild|walks?|walking)\b/.test(T)) it.tags.push('mountains');
  if (/\b(histor\w*|castles?|abbeys?|monaster\w*|ancient|tombs?|ruins?|heritage|cathedral|church|neolithic|celtic|medieval|monuments?)\b/.test(T)) it.tags.push('heritage');
  let m;
  if ((m = T.match(/(\d+)\s*(?:h|hr|hrs|hours?)\s*(\d{1,2})\b/))) it.max = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  else if ((m = T.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)\b/))) it.max = Math.round(parseFloat(m[1]) * 60);
  else if ((m = T.match(/(\d+)\s*(?:m|mins?|minutes?)\b/))) it.max = parseInt(m[1], 10);
  // "near", "quick" and the like only suggest a limit; if nothing fits, the closest drives are shown instead.
  if (it.max == null && /\b(close|near|nearby|short|quick|not far|closest|nearest)\b/.test(T) && !/\bnear [a-z]/.test(T.replace(/\bnear (me|dublin|the city)\b/, ''))) { it.max = 60; it.vague = true; }
  it.longer = /\b(long|longer|longest|far|further|farther|full day|weekend|furthest)\b/.test(T);
  it.food = /\b(eat|eats|eating|food|lunch|dinner|breakfast|brunch|restaurants?|cafes?|cafés?|coffee|pubs?|pint|seafood|fish|oysters?|fine dining|fancy|hungry|bite|cuisines?|meal|cake)\b/.test(T);
  if (/\b(cafes?|cafés?|coffee|brunch|breakfast|cake|snack)\b/.test(T)) it.type = 'Café';
  else if (/\b(pubs?|pint|gastro)\b/.test(T)) it.type = 'Pub';
  else if (/\b(fine dining|fancy|special occasion|tasting|treat|romantic|anniversary|posh)\b/.test(T)) it.type = 'Fine dining';
  else if (/\b(restaurants?|dinner)\b/.test(T)) it.type = 'Restaurant';
  if (/\b(seafood|fish|oysters?|shellfish|mussels|crab)\b/.test(T)) it.cuisine = 'Seafood';
  else if ((m = T.match(new RegExp('\\b(' + CUISINES.join('|') + ')\\b')))) it.cuisine = cap(m[1]);
  if (it.cuisine) it.food = true;
  it.diet = /\b(vegan|vegetarian|veggie|gluten|coeliac|celiac|halal|kosher|allerg\w*|dairy)\b/.test(T);
  it.surprise = /\b(surprise|random|you choose|you pick|dunno|don't know|no idea|whatever|another surprise)\b/.test(T);
  it.greet = /^\s*(hi|hello|hey|hiya|howya|good (morning|afternoon|evening))\b/.test(T);
  it.thanks = /\b(thanks|thank you|cheers)\b/.test(T);
  if (/\b(toll|tolls|m50|eflow)\b/.test(T)) it.topic = 'tolls';
  else if (/\b(speed|limits?|km\/h)\b/.test(T)) it.topic = 'speed';
  else if (/\b(sunset|sunrise|daylight|dark|light)\b/.test(T)) it.topic = 'daylight';
  else if (/\b(weather|rain|fog|snow|forecast)\b/.test(T)) it.topic = 'weather';
  else if (/\broad signs?\b|\bsigns?\b/.test(T) && !it.food) it.topic = 'signs';
  else if (/\b(no car|without a car|don't have a car|dont have a car|tours?|guided|public transport|bus|by bus|buses|train|trains)\b/.test(T)) it.topic = 'nocar';
  else if (/\b(car hire|hire a car|hiring a car|rent a car|renting|rental|hire car|insurance|excess|automatic)\b/.test(T)) it.topic = 'car';
  it.level = /\b(level|levels|how much of ireland|counties|my map|badge|traveller)\b/.test(T);
  it.another = /\b(another|other|different|something else|next)\b/.test(T);
  it.similar = /\b(similar|like this|like that)\b/.test(T);
  it.shorter = /\b(shorter|closer|nearer)\b/.test(T);
  it.clear = /\b(clear|reset|start again|start over)\b/.test(T);
  it.all = /\b(all nine|all of them|show all|every drive|all drives|list)\b/.test(T);
  // The drive mentioned by name: the one whose names match the most characters of the question.
  /** @type {Trip | null} */
  let best = null, score = 0;
  const hit = (/** @type {string} */ w) => new RegExp('(^|[^a-zà-ú])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-zà-ú]|$)').test(T);
  data.trips.forEach((t) => {
    let s = 0;
    [t.en.toLowerCase()].concat(t.words, t.stops.map((x) => x.toLowerCase())).forEach((w) => { if (w && w.length > 2 && hit(w)) s += w.length; });
    if (s > score) { score = s; best = t; }
  });
  if (/\b(this drive|this one|these|that one|on it)\b/.test(T) && !best) best = ctx.trip;
  it.trip = best;
  // "anything" on its own means "you pick"; "anything near Kells" or "anything coastal" doesn't.
  if (!it.surprise && /\banything\b/.test(T) && !it.trip && !it.tags.length && !it.food && it.max == null && !it.topic) it.surprise = true;
  it.any = !!(it.tags.length || it.max != null || it.food || it.trip || it.surprise || it.topic || it.level || it.diet || it.another || it.similar || it.shorter || it.clear || it.all || it.longer);
  return it;
}

/**
 * Answers a question, updating the conversation context.
 * @param {string} q
 * @param {PlannerData} data
 * @param {Context} ctx
 * @param {Env} env
 * @returns {Reply}
 */
export function reply(q, data, ctx, env) {
  const it = parse(q, data, ctx);
  if (it.greet && !it.any) return { kind: 'greet', text: 'Hello! Where do you want to go? Pick a kind of day out, or tell me a place, how far you\'ll drive or what you\'d like to eat.', chips: START };
  if (it.thanks && !it.any) return { kind: 'thanks', text: 'You\'re welcome. Enjoy the drive, and check opening times before you set off.', chips: ['Another drive', 'Lunch stops'] };
  if (it.topic) return topic(it.topic, data, env);
  if (it.level && !it.trip && !it.food) return level(env);
  if (it.clear) {
    ctx.tags = []; ctx.max = null; ctx.trip = null; ctx.last = [];
    return { kind: 'clear', text: 'Cleared. Where do you want to go?', chips: START };
  }
  if (it.food || it.diet) return food(it, data, ctx);
  if (it.similar && ctx.trip) {
    const base = ctx.trip;
    const list = data.trips.filter((t) => t.id !== base.id && t.tags.some((g) => base.tags.indexOf(g) > -1)).sort((a, b) => Math.abs(a.mins - base.mins) - Math.abs(b.mins - base.mins));
    if (list.length) {
      ctx.last = list; ctx.trip = list[0];
      return { kind: 'similar', text: 'If you like ' + esc(base.en) + ', try these. They share its ' + base.tags.map((g) => TAGNAME[g]).join(' and ') + '.', cards: list.slice(0, 3), chips: ['Where to eat on ' + list[0].en, 'Something shorter', 'Show all nine'] };
    }
  }
  if (it.shorter && ctx.trip && !it.tags.length && it.max == null) {
    const base = ctx.trip;
    const list = data.trips.filter((t) => t.mins < base.mins).sort((a, b) => b.mins - a.mins);
    if (!list.length) return { kind: 'shorter-none', text: esc(base.en) + ' is already one of the closest drives, at ' + fmtMins(base.mins) + ' from Dublin.', chips: ['Something similar', 'Where to eat on this drive'] };
    ctx.last = list; ctx.trip = list[0];
    return { kind: 'shorter', text: 'Closer to Dublin than ' + esc(base.en) + ':', cards: list.slice(0, 3), chips: ['Where to eat on ' + list[0].en, 'Something similar'] };
  }
  if (it.trip && it.max == null && !it.surprise && !it.another && !it.all) return one(it.trip, data, ctx);
  if (it.another && !it.tags.length && it.max == null && ctx.last.length > 1) {
    ctx.offset = (ctx.offset + 3) % ctx.last.length;
    return { kind: 'more', text: 'Here are some more:', cards: ctx.last.slice(ctx.offset, ctx.offset + 3), chips: refine(ctx) };
  }
  if (it.tags.length || it.max != null || it.surprise || it.longer || it.all || it.another) return drives(it, data, ctx, env);
  if (env.ai) return { kind: 'ai', text: '', chips: [] };
  return { kind: 'fallback', text: 'I can help you pick a drive, find somewhere to eat and plan timing. Try one of these, or ask something like "coast within 2 hours" or "lunch near Glendalough".', chips: START };
}

/** @param {Context} ctx */
function describe(ctx) {
  const p = [];
  if (ctx.tags.length) p.push(ctx.tags.map((g) => TAGNAME[g]).join(' or '));
  if (ctx.max != null) p.push('within ' + fmtMins(ctx.max) + ' of Dublin');
  return p.length ? p.join(', ') : '';
}
/** @param {Context} ctx */
function refine(ctx) {
  return ['Where to eat on these', ctx.max == null || ctx.max > 90 ? 'Under 1 h 30' : 'Under 2 h 15', ctx.tags.indexOf('coast') > -1 ? 'Mountains' : 'The coast', 'Clear filters'];
}

/**
 * @param {Intent} it
 * @param {PlannerData} data
 * @param {Context} ctx
 * @param {Env} env
 * @returns {Reply}
 */
function drives(it, data, ctx, env) {
  if (it.all) { ctx.tags = []; ctx.max = null; }
  if (it.tags.length) ctx.tags = it.tags;
  if (it.max != null) ctx.max = it.max;
  let list = data.trips.slice();
  if (it.surprise) {
    const t = list[Math.floor((env.random || Math.random)() * list.length)];
    ctx.last = [t]; ctx.trip = t;
    return { kind: 'surprise', text: 'How about this one: <strong>' + esc(t.en) + '</strong>. ' + esc(t.blurb || t.desc), cards: [t], chips: ['Where to eat on this drive', 'Another surprise', 'Something similar'] };
  }
  const tags = ctx.tags, fit = (/** @type {Trip} */ t) => tags.filter((g) => t.tags.indexOf(g) > -1).length;
  if (tags.length) list = list.filter((t) => fit(t) > 0);
  // Drives with more of the scenery asked for come first ("mountains and the sea"), then by distance.
  list.sort((a, b) => fit(b) - fit(a) || (it.longer ? b.mins - a.mins : a.mins - b.mins));
  const max = ctx.max, within = list.filter((t) => max == null || t.mins <= max + 5);
  if (!within.length && it.vague && list.length) {
    const d = describe({ ...ctx, max: null }); ctx.max = null;
    ctx.last = list; ctx.offset = 0; ctx.trip = list[0];
    return { kind: 'drives', text: 'Nothing' + (d ? ' for ' + esc(d) : '') + ' is under an hour from Dublin. These are the closest:', cards: list.slice(0, 3), chips: refine(ctx) };
  }
  list = within;
  if (!list.length) {
    const d = describe(ctx); ctx.max = null;
    return { kind: 'drives-none', text: 'None of the nine drives match ' + esc(d || 'that') + '. The closest start about 50 minutes from the city.', chips: ['Under an hour', 'The coast', 'Mountains', 'Show all nine'] };
  }
  ctx.last = list; ctx.offset = 0; ctx.trip = list[0];
  const d = describe(ctx);
  const lead = it.all || !d
    ? 'All nine drives, ' + (it.longer ? 'longest first' : 'closest first') + '.'
    : (list.length === 1 ? 'One drive fits ' + esc(d) + '.' : list.length + ' drives fit ' + esc(d) + (list.length > 3 ? '. Here are the ' + (it.longer ? 'longest' : 'closest') + ' three.' : '.'));
  return { kind: 'drives', text: lead, cards: it.all ? list : list.slice(0, 3), chips: list.length > 3 && !it.all ? ['Another drive'].concat(refine(ctx)) : refine(ctx) };
}

/**
 * @param {Trip} t
 * @param {PlannerData} data
 * @param {Context} ctx
 * @returns {Reply}
 */
function one(t, data, ctx) {
  ctx.trip = t; ctx.last = [t];
  const n = (data.eat[t.id] || []).length;
  return { kind: 'one', text: '<strong>' + esc(t.en) + '</strong>. ' + esc(t.blurb || t.desc) + ' Best time: ' + esc(t.best.charAt(0).toLowerCase() + t.best.slice(1)) + '.', cards: [t], chips: /** @type {string[]} */ ([n ? 'Where to eat on this drive' : null, 'Something similar', 'Something shorter'].filter(Boolean)) };
}

/**
 * @param {Intent} it
 * @param {PlannerData} data
 * @param {Context} ctx
 * @returns {Reply}
 */
function food(it, data, ctx) {
  /* Which drives to search. A named drive wins. Otherwise scenery or a time limit in the question
     ("seafood near the coast") means every drive that matches, not just the one on screen. Only a
     bare food question ("lunch?", "a quick lunch") falls back to the drive being discussed. */
  const max = it.vague ? null : it.max;
  const scoped = data.trips.filter((t) => (!it.tags.length || it.tags.some((g) => t.tags.indexOf(g) > -1)) && (max == null || t.mins <= max + 5));
  const trips = it.trip ? [it.trip] : (it.tags.length || max != null) ? scoped : ctx.trip ? [ctx.trip] : null;
  const many = !!trips && trips.length > 1;
  let pre = '';
  if (it.diet) pre = 'The listings here don\'t include dietary details I can check, but most Irish cafés and restaurants can cater for vegetarian, vegan and coeliac diets if you ask ahead. Ring before you go to be sure. ';
  /** @type {[Eat, Trip][]} */
  let rows = [];
  (trips || data.trips).forEach((t) => (data.eat[t.id] || []).forEach((r) => rows.push([r, t])));
  if (it.type) rows = rows.filter((x) => x[0].type === it.type);
  const cuisine = it.cuisine;
  if (cuisine) rows = rows.filter((x) => x[0].cuisine.indexOf(cuisine) > -1);
  const single = trips && trips.length === 1 ? trips[0] : null;
  const where = single ? 'on the ' + esc(single.en) + ' drive' : trips ? 'on the ' + (it.tags.length ? it.tags.map((g) => TAGADJ[g]).join(' and ') + ' ' : '') + 'drives' + (max != null ? ' within ' + fmtMins(max) + ' of Dublin' : '') : 'across the nine drives';
  const what = (it.cuisine ? it.cuisine.toLowerCase() + ' ' : '') + (it.type ? TYPEPL[it.type] : 'places to eat');
  if (!rows.length) {
    const avail = single ? [...new Set((data.eat[single.id] || []).map((r) => r.type))] : [];
    return { kind: 'food-none', text: pre + 'I don\'t have any ' + esc(what) + ' listed ' + where + '.', chips: avail.length ? avail.map((ty) => cap(TYPEPL[ty]) + ' on this drive') : ['Seafood', 'Cafés', 'Fine dining'] };
  }
  if (it.trip) ctx.trip = it.trip;
  const more = single
    ? ['Cafés', 'Pubs', 'Restaurants', 'Fine dining'].filter((l) => (data.eat[single.id] || []).some((r) => TYPEPL[r.type] === l.toLowerCase()) && (!it.type || TYPEPL[it.type] !== l.toLowerCase())).map((l) => l + ' on this drive')
    : (many && trips ? trips : data.trips).slice(0, 3).map((t) => 'Lunch near ' + t.en);
  const notes = [];
  if (rows.length > 6) notes.push('And ' + (rows.length - 6) + ' more. Tell me which drive to narrow it down.');
  notes.push('Opening hours change, so check before you go.');
  return { kind: 'food', text: pre + esc(cap(what)) + ' ' + where + ':', eats: rows.slice(0, 6).map((x) => ({ r: x[0], t: single ? null : x[1] })), notes, chips: more };
}

/**
 * @param {string} k
 * @param {PlannerData} data
 * @param {Env} env
 * @returns {Reply}
 */
function topic(k, data, env) {
  const R = (/** @type {string} */ text, /** @type {string[]} */ chips) => ({ kind: 'topic-' + k, text, chips });
  if (k === 'tolls') return R('The M50 toll around Dublin is barrier-free: pay online at eflow.ie by 8pm the next day. The M1, M3 and M7/M8 have toll plazas you pay as you pass.' + link(env.url.guide('tolls'), 'More on tolls'), ['Speed limits', 'Under an hour']);
  if (k === 'speed') return R('Default limits are 120 km/h on motorways, 100 on national roads, 80 on regional roads, 60 on rural local roads and 50 in towns. The posted sign always wins.' + link(env.url.guide('speed'), 'Speed limits in full'), ['Tolls', 'Daylight today']);
  if (k === 'daylight') {
    const s = sunTimes(env.now || new Date()), dh = (s.set.getTime() - s.rise.getTime()) / 36e5, ok = data.trips.filter((t) => t.drive + 3 <= dh);
    return R('Today in Dublin the sun rises at ' + fmtClock(s.rise) + ' and sets at ' + fmtClock(s.set) + ', which is ' + fmtMins(dh * 60) + ' of daylight. That\'s enough for ' + (ok.length === data.trips.length ? 'any of the nine drives' : ok.length + ' of the nine drives') + ', allowing about three hours for stops.' + link(env.url.guide('daylight'), 'Daylight by month'), ['Under an hour', 'Surprise me']);
  }
  if (k === 'weather') return R('On the mountain and coast drives, the weather is the view: in fog you see nothing at all. Check Met Éireann the night before and keep a closer drive in reserve. Some mountain roads aren\'t gritted in ice or snow.' + link(env.url.guide('weather'), 'Weather tips'), ['History and ruins', 'Under an hour']);
  if (k === 'signs') return R('Blue signs mean motorways, green mean national roads, white mean regional roads and brown point to attractions. Place names show Irish in italics above English in capitals.' + link(env.url.guide('signs'), 'Reading Irish road signs'), ['Speed limits', 'Tolls']);
  if (k === 'nocar') return R('Glendalough and the Boyne Valley work well without a car: there\'s a daily bus to Glendalough, and guided tours from Dublin go to Newgrange. You can reach Carlingford, Tramore and Cashel by public transport too, but most of the other drives need a car.' + link(env.url.noCar, 'Which drives work without a car'), ['Glendalough', 'Boyne Valley', 'Hiring a car']);
  return R('Most of these drives need a car. Book early for summer weekends, especially if you need an automatic, check the insurance excess before you sign, and ask who pays the M50 toll.' + link(env.url.hire, 'Hiring a car in Dublin: what to know'), ['Under an hour', 'No car? Tours and buses']);
}

/** @param {Env} env @returns {Reply} */
function level(env) {
  const st = env.stats();
  const text = st.n
    ? 'You\'re a ' + esc(levelLine(st)) + '.' + (st.N ? ' ' + (st.N.min - st.n) + ' more counties to Level ' + st.N.n + '.' : '') + link(env.url.map, 'Open your map')
    : 'You haven\'t marked any counties yet. Tick off drives and counties on your map to find your traveller level.' + link(env.url.map, 'Open your map');
  return { kind: 'level', text, chips: ['Surprise me', 'The coast'] };
}
