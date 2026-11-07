# Launch checklist: what needs you

Things only the site owner can do: accounts, applications and anything that costs money. Nothing in this repository signs up for, applies to or buys anything. Phase 5 adds the hosting and domain steps to this list.

## Affiliate programmes

The site already has its booking links in place: car hire on the car hire guide and every drive page, places to stay and tours in each drive's "Plan this trip" box. Right now they are **plain links**. They work for visitors but earn nothing, because there are no approved partner accounts yet (`reference/affiliate-approvals.md` doesn't exist). Every one is already marked `rel="sponsored"` and labelled as an affiliate link, and a test keeps it that way.

Apply to these three programmes. Each decides for itself whether to accept the site, and may want to see it live with some traffic first, so apply once it's deployed.

| Link on the site | Programme | Apply at | Paste the tracked link into |
| --- | --- | --- | --- |
| Car hire (Discover Cars) | Discover Cars affiliate programme | [discovercars.com/affiliate](https://www.discovercars.com/affiliate) | `affiliates.carHire.url` |
| Places to stay (Booking.com) | Booking.com Affiliate Partner Programme | [booking.com/affiliate-program](https://www.booking.com/affiliate-program/v2/index.html) | `affiliates.stays.url` |
| Tours (GetYourGuide) | GetYourGuide Partner Program | [partner.getyourguide.com](https://partner.getyourguide.com/) | `affiliates.tours.url` |

All three fields are in `site.config.mjs`. When you're approved:

1. Copy the tracked link from the partner dashboard. For **stays** and **tours**, the site searches for each drive's town, so keep `{q}` where the search term goes: the site replaces it with, for example, "Slane, County Meath". For example, a tours link might look like `https://www.getyourguide.com/s/?q={q}&partner_id=YOURID`. Use the format the dashboard gives you, and put `{q}` in place of its search term.
2. Run `npm run build`. The build lists "Swap the affiliate URLs for your tracked partner links" until every link has a tracking parameter (`aid`, `a_aid`, `partner_id`, `affiliate` or `ref`).
3. Save the approval emails or terms somewhere private (for example `reference/affiliate-approvals.md`, which is git-ignored with the rest of `reference/`). Each programme has its own rules on disclosure and where links may appear. Read them, and tell me if one asks for something the site doesn't do yet.

If a programme turns you down, leave its plain link: it still helps visitors.

## Newsletter

Create the free Buttondown account and paste the form address into `newsletter.action`. Step by step: [newsletter-setup.md](newsletter-setup.md).

## Contact address

`hello@nineroadsout.com` is shown on the Contact page, but it won't receive mail until you set up forwarding (Cloudflare Email Routing, when the domain is on Cloudflare). Until then, email to it bounces. Phase 5 covers it with the domain.

## Not yet

- **Google AdSense:** don't apply yet. Phase 5 writes `docs/adsense-readiness.md` with what to have in place first.
- **AI answers in the trip planner:** off (`chat.ai: false`). It needs an Anthropic API key stored as a secret in the hosting dashboard, never in the repository. The README explains when it's worth switching on.
