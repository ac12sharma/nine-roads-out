# Accessibility

The target is [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA. This page lists what the site does, how it is tested, what was fixed, and what has not been tested yet.

## How it is tested

| Check | Tool | Where | Runs in CI |
| --- | --- | --- | --- |
| WCAG 2.2 A and AA rules, plus axe best practices | axe-core 4 in Chromium (`scripts/audit-pages.mjs`) | Every page at 320, 390 and 1280 px | Yes |
| Dark colour scheme | The same, with `--dark` | Every page at 320, 390 and 1280 px | No, run by hand |
| Reflow (1.4.10): no sideways scrolling at 320 CSS px | `audit-pages.mjs` | Every page | Yes |
| Keyboard: Tab through 60 stops from the top; fail if focus gets stuck or lands on something invisible | `audit-pages.mjs` | Every page, every width | Yes |
| Trip planner: focus moves into it when opened, back to the button when closed, and on phones Tab can't leave it | `audit-pages.mjs` | Home page | Yes |
| County map: one Tab stop, arrow keys move between counties, Space selects | `audit-pages.mjs` | Your Ireland page | Yes |
| Duplicate ids, `aria-labelledby`, `aria-describedby`, `aria-controls` and `for` point at real ids | `tests/site.test.mjs` | Every page | Yes |
| Valid HTML | html-validate, recommended rules | Every page | Yes |
| Lighthouse accessibility score | Lighthouse CI, fails under 95 | Six key pages | Yes |

Automated tools find roughly a third to a half of accessibility problems. The rest need people, so the gaps are listed at the end.

## What the site does

- **Works without JavaScript.** Every page is complete HTML. JavaScript adds the planner, the map and the filters on top.
- **Skip link** to the main content, and labelled landmarks (`nav` for the main menu, breadcrumbs and footer).
- **Irish place names** are marked `lang="ga"`, so screen readers pronounce them as Irish rather than as English.
- **Visible focus.** Links and buttons get a 2 px outline in the accent colour. The map counties, drive dots and planner input each have their own focus style in place of the outline.
- **Contrast.** Text colours meet 4.5:1 in both colour schemes. The lightest text colour (`--ink-3`) is #5C6861: 5.0:1 on the page background and 5.5:1 on cards.
- **Not by colour alone.** Drives too far for the chosen drive time are muted on the home page, and screen readers also hear "(further than 1 h 45)".
- **Status messages** (copied, counted, the planner's replies) are in live regions, so screen readers announce them without moving focus.
- **The trip planner** is a labelled dialog. Focus goes to its input when it opens and back to the button when it closes, and Escape closes it. On phones it covers the page, so the rest of the page is made `inert` and the dialog is marked modal. On wider screens it sits beside the page and stays non-modal.
- **The county map** is a single Tab stop (roving tabindex): arrow keys move to the nearest county in that direction, and Space or Enter selects it. Below the map is a list of all 26 counties as ordinary buttons, the same choices in alphabetical order.
- **Reduced motion.** With "reduce motion" switched on, the animated scenes are not animated, and transitions and the planner's typing delay are removed.
- **Tables** for speed limits, daylight and levels use header cells with `scope`.

## What was fixed (November 2026)

| Problem | WCAG | Fix |
| --- | --- | --- |
| Grey text (`--ink-3`, #69756E) at 4.1:1 on the page background, on every page | 1.4.3 Contrast | Darkened to #5C6861 (5.0:1) |
| Out-of-range drives on the home page faded to 40% opacity, 2.4:1 | 1.4.3 Contrast | Muted with the grey text colour instead, plus hidden text for screen readers |
| On phones, Tab could leave the full-screen planner and reach links hidden behind it | 2.4.3 Focus Order | The rest of the page is `inert` while the planner covers it |
| The county map took 26 Tab presses to get past | 2.1.1 Keyboard (usability) | One Tab stop with arrow-key movement |

axe violations: 46 across 50 page views before the fixes, 0 after. See [metrics.md](metrics.md#accessibility-axe-core-4-wcag-22-aa--best-practice) for the history.

## Latest results (6 November 2026)

- Light colour scheme: 75 page views (24 pages plus the 404, at 320, 390 and 1280 px) and the planner and map checks. 0 issues.
- Dark colour scheme: the same 75 page views. 0 issues.
- Lighthouse accessibility: 100 on all six key pages (median of three runs).

## Not tested yet

- **Screen readers.** Nothing has been tried with VoiceOver, NVDA or TalkBack. The planner (live region plus dialog) and the map (SVG paths with `role="checkbox"`) are the parts most worth checking by hand.
- **Zoom to 200% and text spacing (1.4.4, 1.4.12)** on a desktop browser. The 320 px reflow check covers much of this, but not text spacing overrides.
- **Target size (2.5.8).** Chips and buttons look larger than 24 by 24 px, but this hasn't been measured on every control.
- **Windows High Contrast / forced colours.** The scene canvases and the SVG map haven't been checked with forced colours.
- **Focus indicator contrast.** The planner input shows focus with a border colour change rather than an outline. That meets 2.4.7, but its contrast against the unfocused border hasn't been measured.
