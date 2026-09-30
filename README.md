# Moda Water — hospitality1 landing page

Static landing page for **Moda Water** (Water Vend Pty Ltd).

- Production: https://go.modawater.com/hospitality1/
- Vercel: https://hospitality1-beta.vercel.app/hospitality1/

No framework, no build step, no dependencies. Plain HTML, CSS and JS, served
exactly as it sits in this repo.

## Pages

| Page | URL |
|---|---|
| `hospitality1/index.html` | https://go.modawater.com/hospitality1/ |
| `hospitality1/privacy.html` | https://go.modawater.com/hospitality1/privacy.html |
| `hospitality1/thankyou.html` | https://go.modawater.com/hospitality1/thankyou.html |

## Layout

The page lives in `hospitality1/`, not at the repo root, so it is served under the
`/hospitality1/` path rather than at `/`. The site root redirects there.

```
hospitality1/      the campaign page — index.html, privacy.html, thankyou.html,
                   favicons, assets/
vercel.json        trailingSlash + the root redirect
context/           the designer's original zip (gitignored, never deployed)
```

Every asset path inside the page is **relative**, so the folder name is the only
thing that decides the public path. A second campaign page is a sibling folder —
`hospitality2/` — served at `/hospitality2/`, sharing this domain and this deploy.

## Deploying

Vercel auto-deploys on every push to `main`. No build command, no output directory.
The Root Directory setting in the Vercel project must be **empty** (the repo root),
not `hospitality1/` — `vercel.json` lives at the root and the redirect is what puts
visitors on the page.

## Domain

`go.modawater.com` is attached to the `hospitality1` Vercel project, pointed at
Production. DNS is at sddomains.net (nameservers `ns1/2/3.sddomains.net`), where
`go` is a CNAME to the target Vercel issued for this project. Before the cutover it
was an A record to a LiteSpeed host that 301'd everything to `modawater.com`.

## vercel.json

```json
{
  "trailingSlash": true,
  "redirects": [
    { "source": "/", "destination": "/hospitality1/", "permanent": false }
  ]
}
```

`trailingSlash: true` keeps Vercel's URL normalisation consistent so the page's
relative asset paths always resolve against the same base, and makes
`/hospitality1` resolve to `/hospitality1/`. Do not remove it.

The root redirect is a **307, not a 301** — deliberately. Nothing else is served at
`/` yet, but a second campaign page or a real index would make a cached permanent
redirect very hard to undo in visitors' browsers.

## Working on the designer's files

`index.html`, `privacy.html`, `thankyou.html`, `assets/` and the favicons are the
designer's deliverable and are kept byte-for-byte as supplied, apart from two agreed
changes: the GTM container snippet, and renaming the Matter Regular font file to
match the stylesheet. Report other problems back to the designer rather than patching
them here, so the source files and what is live do not drift apart.

### Known issues to send back to the designer

- All three pages reference `assets/img/favicon.png` and
  `assets/img/apple-touch-icon.png`. Neither file exists — two 404s on every page
  load. The `favicon_*.png` links immediately below them are correct and already
  cover both cases.
- Open Graph and canonical URLs are still the placeholder `https://example.com.au/`,
  and the referenced `og-image.jpg` is not in the repo. On the real domain these now
  need to be `https://go.modawater.com/hospitality1/...`. Link previews will break
  until they are, and the canonical tags point search engines at a domain that does
  not exist.
- The HubSpot form GUID in `assets/js/main.js` was decoded from a share link rather
  than supplied directly. Verify it against the form's URL in HubSpot.

## Analytics

Google Tag Manager container **GTM-PTG8SZWD**, on all three pages. The form pushes a
`form_submission` event to `dataLayer` on a successful HubSpot submit, before
redirecting to `thankyou.html`.

## Form

`assets/js/main.js` posts the booking form as JSON to the HubSpot Forms API v3
(portal `5379330`), then redirects to `thankyou.html`. The redirect target is
relative, so it follows whatever domain and folder the page is served from.

## Local preview

```sh
npx serve .
```

Then open http://localhost:3000/hospitality1/

Note that `npx serve` strips `.html` from URLs (it 301s `/privacy.html` →
`/privacy`) and does not read `vercel.json`, so the root redirect will not fire
locally. Both are quirks of `serve` only — on Vercel the `.html` URLs are served
directly and `/` redirects.
