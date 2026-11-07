# Newsletter setup (Buttondown)

The sign-up form is already wired for Buttondown. It stays hidden until you paste one value into `site.config.mjs`. These steps take about ten minutes. Everything here is done by you in your own browser; nothing in this repository creates an account or charges anything.

Facts below are from Buttondown's own pages, read on 7 November 2026. Its dashboard can change, so if a menu has moved, use the settings address given with each step.

## 1. Create the free account

1. Go to [buttondown.com](https://buttondown.com/) and choose **Sign up**.
2. Pick your **username** carefully. It becomes your newsletter's address (`https://buttondown.com/USERNAME`) and part of the form address you'll paste later. Buttondown's docs say you can change it later, but the form address changes with it.
3. Stay on the free plan. Buttondown's [pricing page](https://buttondown.com/pricing) says the first 100 subscribers cost nothing. Its pricing page doesn't say whether a card is needed to sign up; if it asks for one, you don't have to continue.

Add-ons such as tagging and automations are paid. The site doesn't use any of them.

## 2. Check double opt-in is on

You shouldn't need to do anything here. Buttondown's [double opt-in page](https://docs.buttondown.com/double-opt-in) says it "requires double opt-in for all newsletters by default". New subscribers get a confirmation email with a link, and they aren't added until they click it. Their status shows as `unactivated` until then, and `regular` afterwards.

There is no switch to turn this off for an ordinary sign-up form; Buttondown only disables it on request in special cases. Leave it as it is: the site's Privacy page and the line under the form both tell people they'll get a confirmation email.

**Check it works** after step 4: sign up with your own address, confirm you get the confirmation email, click it, and check the address shows as a subscriber.

## 3. Find your form address

1. In Buttondown, open the embedding settings: [buttondown.com/settings/embedding](https://buttondown.com/settings/embedding).
2. Find the **HTML embed** snippet. It starts like this:

   ```html
   <form
     action="https://buttondown.com/api/emails/embed-subscribe/YOUR-BUTTONDOWN-USERNAME"
     method="post"
     class="embeddable-buttondown-form"
   >
   ```

3. Copy only the address inside `action="…"`: `https://buttondown.com/api/emails/embed-subscribe/` followed by your username. Ignore the rest of the snippet; the site has its own form that sends the same fields (`email`, and a hidden `embed` set to `1`).

## 4. Paste it into `site.config.mjs`

Open `site.config.mjs` and find the `newsletter` section. Change **one line**:

| Field | What to put there |
| --- | --- |
| `action` | The address from step 3, in quotes: `'https://buttondown.com/api/emails/embed-subscribe/YOUR-BUTTONDOWN-USERNAME'` |
| `provider` | Leave as `'Buttondown'`. The Privacy page names it. |
| `field` | Leave as `'email'`. It matches Buttondown's form. |
| `hidden` | Leave as `{ embed: '1' }`. It matches Buttondown's form. |
| `heading`, `pitch` | Optional: the text shown on the sign-up box. |

Then:

```bash
npm run build
```

The build prints a warning if the address doesn't look like a Buttondown form address. Commit the change and deploy as usual (the launch checklist covers deploying).

Once it's live, the sign-up box appears on the home page, every drive page and the theme pages, and the Privacy page gains a "Newsletter" section.

## 5. Settings worth knowing

- **Open and click tracking** are opt-in on Buttondown, so they are off unless you turn them on ([open tracking](https://docs.buttondown.com/open-tracking), [click tracking](https://docs.buttondown.com/click-tracking)). The Privacy page doesn't mention email tracking. If you switch either on, tell me and I'll add a line saying so.
- **Where the data goes.** Buttondown's [Data Processing Agreement](https://buttondown.com/legal/data-processing-agreement) says subscriber data is processed in the United States, with the EU Standard Contractual Clauses as the transfer safeguard. The DPA is a public page and doesn't describe a signing step. Read it before you collect any addresses.
- **Unsubscribes.** Buttondown keeps unsubscribed addresses with an "unsubscribed" status (a soft delete) unless subscriber cleanup is on, and full ("hard") deletion is something you ask its support to enable ([subscriber cleanup](https://docs.buttondown.com/subscriber-cleanup)). The Privacy page tells people to email you to have their address deleted altogether, so you'll handle those requests yourself.

## Turning it off again

Set `action` back to `''` and rebuild. The sign-up box and the Privacy page's newsletter section both disappear.
