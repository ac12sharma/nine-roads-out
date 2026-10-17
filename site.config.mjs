// Nine Roads Out: everything you need to change before launch lives in this file.
// After editing, run `npm run build` and deploy the `dist` folder.

export default {
  name: 'Nine Roads Out',

  // Your live address, with no trailing slash. Used for canonical links, the sitemap and share images.
  siteUrl: 'https://nineroadsout.com',

  owner: {
    name: 'Achal Sharma', // shown on the About, Privacy and Terms pages
    city: 'Dublin',
  },

  // A real address people can write to. Google AdSense expects a working contact route.
  // Example: 'hello@nineroadsout.com'. Leave empty and the Contact page says so instead.
  contactEmail: '',

  // Google AdSense. Paste your publisher ID (ca-pub-…) once your account exists.
  // Leave `slots` empty to use Auto ads, or paste ad-unit IDs to place ads in the reserved spots.
  // Consent for visitors in the EEA, UK and Switzerland is handled by Google's own consent message:
  // turn it on in AdSense under Privacy & messaging. No extra code is needed here.
  adsense: {
    client: '', // 'ca-pub-0000000000000000'
    slots: {
      home: '',      // between the drive cards and the map on the home page
      inArticle: '', // after the introduction on each drive page
      sidebar: '',   // under the booking links on each drive page (wide screens)
      footer: '',    // above "More drives" on each drive page
      guide: '',     // middle of the driving guide
    },
  },

  // Cloudflare Web Analytics token (cookieless, so no consent banner needed for it).
  // On Cloudflare Pages you can also switch it on in the dashboard and leave this empty.
  analytics: { cloudflareToken: '' },

  // Affiliate links. Replace each URL with the tracked link from your partner dashboard.
  // `{q}` is replaced with the place name for that drive. Until you change them, these are
  // plain links that still help visitors but earn nothing.
  affiliates: {
    carHire: { partner: 'Discover Cars', url: 'https://www.discovercars.com/' },
    stays: { partner: 'Booking.com', url: 'https://www.booking.com/searchresults.html?ss={q}' },
    tours: { partner: 'GetYourGuide', url: 'https://www.getyourguide.com/s/?q={q}' },
  },

  // Month the facts were last checked against official sources. Shown in the footer.
  checked: 'October 2026',
};
