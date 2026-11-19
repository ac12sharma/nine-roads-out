# Analytics

Two kinds, both cookieless, both off until you switch them on in `site.config.mjs`.

| What | Tool | Switch | Counts |
| --- | --- | --- | --- |
| Page views and page speed | Cloudflare Web Analytics | `analytics.cloudflareToken`, or turn it on in the Cloudflare Pages dashboard | Visits per page, referrers, countries, Core Web Vitals |
| Clicks and actions | This site's own `/api/event` function, storing to Cloudflare Workers Analytics Engine | `analytics.events: true` | The events below |

Cloudflare Web Analytics doesn't record custom events, which is why the clicks have their own small pipeline.

## The events

Defined in [`src/shared/events.mjs`](../src/shared/events.mjs). The browser and the function both refuse anything not on this list.

| Event | Label | Measures | Why it matters |
| --- | --- | --- | --- |
| `sponsored_click` | host of the link, e.g. `discovercars.com` | A click on any link marked `rel="sponsored"`: affiliate links and featured listings | Which partners and listings send people on. Compare with the partner dashboards to see what converts. Also the evidence to show a business before it renews a featured listing. |
| `maps_open` | drive id | "Open the route in Google Maps" | Which drives people actually set off on |
| `gpx_download` | drive id | GPX download | Whether the GPX files are worth keeping |
| `print_route` | drive id | "Print route card" | Same, for the print card |
| `share` | `copy`, `whatsapp` or `native` | Share buttons on drive pages and the map page | Which share options to keep |
| `drive_done` | drive id | Ticking "I've done this drive" | Which drives people have done |
| `planner_open` | (empty) | Opening the trip planner | How many people use it |
| `planner_answer` | kind of answer: `drives`, `one`, `food`, `food-none`, `topic-tolls`, `fallback` and so on | The planner answering a question | How often it falls back to "I can't help". That is the cue to add a case to the [planner evaluation](planner-eval.md). The question itself is never sent. |
| `newsletter_submit` | `home`, `trip` or `theme` | Submitting the sign-up form | Which placement works. Buttondown counts confirmed subscribers. |

## What is sent, and what isn't

Each event is a small JSON object, for example:

```json
{"e":"sponsored_click","p":"/glendalough/","l":"discovercars.com"}
```

- **Sent:** the event name, the page path (without any query string) and the label.
- **Never sent or stored:** cookies, user or session IDs, IP addresses, user agents, anything typed into the planner or the sign-up form.
- **Not sent at all** when the browser has Global Privacy Control or Do Not Track switched on.
- The function only accepts events from this site's own pages, refuses names not on the list, cleans the path and label, and caps the size of each event.
- Analytics Engine keeps data for three months.

This was checked in a browser: with events on, clicking through a drive page sent exactly the events above and nothing else. With Global Privacy Control on, it sent nothing. The tests cover the function's handling of bad input.

The Privacy page describes the click events whenever `analytics.events` is on, and says nothing about them while it is off.

## Switching events on

You do this in Cloudflare after the site is deployed (Phase 5). From Cloudflare's [Pages bindings documentation](https://developers.cloudflare.com/pages/functions/bindings/), read 7 November 2026:

1. In the Cloudflare dashboard, open the Pages project, then **Settings** > **Bindings** > **Add** > **Analytics engine**.
2. **Variable name:** `EVENTS`. **Dataset:** for example `nineroadsout_events`. Cloudflare creates the dataset the first time something is written to it.
3. In `site.config.mjs`, set `analytics: { …, events: true }`, then build and deploy. The build writes `functions/api/event.js`; without the binding, that function accepts events and quietly drops them.

On cost: Cloudflare's [pricing page](https://developers.cloudflare.com/analytics/analytics-engine/pricing/) (updated 23 April 2026) says Analytics Engine isn't billed yet. It lists 100,000 data points written per day on the Workers Free plan, and says billing will start later. One event is one data point.

## Reading the numbers

Analytics Engine is queried with SQL over Cloudflare's API. You'll need your account ID and an API token with the **Account Analytics: Read** permission. Create it in the dashboard and keep it out of the repository and out of chat.

```bash
curl "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/analytics_engine/sql" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  --data "SELECT blob1 AS event, blob3 AS label, SUM(_sample_interval) AS count FROM nineroadsout_events WHERE timestamp > NOW() - INTERVAL '30' DAY GROUP BY event, label ORDER BY count DESC"
```

`blob1` is the event, `blob2` the page path and `blob3` the label. `SUM(_sample_interval)` gives the count, allowing for Cloudflare's sampling at high volumes.
