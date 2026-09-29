# Moda Water — hospitality1 landing page

Static landing page for **Moda Water** (Water Vend Pty Ltd).

- Production: https://go.modawater.com/
- Vercel: https://hospitality1-beta.vercel.app/

No framework, no build step, no dependencies. Plain HTML, CSS and JS, served
exactly as it sits in this repo.

## Pages

| Page | URL |
|---|---|
| `index.html` | https://go.modawater.com/ |
| `privacy.html` | https://go.modawater.com/privacy.html |
| `thankyou.html` | https://go.modawater.com/thankyou.html |

## Layout

This repo is **one page, served from the root**. `index.html` and `assets/` sit at
the top level, so the page is the site.

Adding a second landing page means a **new repo and a new Vercel project**, not a
new folder here. Vercel serves this repo from its root, so a `hospitality2/` folder
dropped alongside would sit at `/hospitality2/` while this page stays at `/` — the
two would share a domain and a deploy, which is not what these per-campaign pages
want.

## Deploying

Vercel auto-deploys on every push to `main`. No build command, no output directory —
the Root Directory setting in the Vercel project must be empty (the repo root), not
a subfolder.

## vercel.json

```json
{ "trailingSlash": true }
```

Every asset path in this page is **relative**. `trailingSlash: true` keeps Vercel's
URL normalisation consistent so those relative paths always resolve against the same
base. Do not remove it.

## Working on the designer's files

`index.html`, `privacy.html`, `thankyou.html`, `assets/` and the favicons are the
designer's deliverable and are kept byte-for-byte as supplied, apart from two agreed
changes: the GTM container snippet, and renaming the Matter Regular font file to
match the stylesheet. Report other problems back to the designer rather than patching
them here, so the source files and what is live do not drift apart.

### Known issues to send back to the designer

- `index.html`, `privacy.html`, `thankyou.html` line 24 reference
  `assets/img/favicon.png`, and line 25 `assets/img/apple-touch-icon.png`. Neither
  file exists — two 404s on every page load. The `favicon_*.png` links immediately
  below them are correct and already cover both cases.
- Open Graph and canonical URLs are still the placeholder `https://example.com.au/`,
  and the referenced `og-image.jpg` is not in the repo. Link previews will break.
- The HubSpot form GUID in `assets/js/main.js` was decoded from a share link rather
  than supplied directly. Verify it against the form's URL in HubSpot.

## Analytics

Google Tag Manager container **GTM-PTG8SZWD**, on all three pages. The form pushes a
`form_submission` event to `dataLayer` on a successful HubSpot submit, before
redirecting to `thankyou.html`.

## Form

`assets/js/main.js` posts the booking form as JSON to the HubSpot Forms API v3
(portal `5379330`), then redirects to `thankyou.html`.

## Local preview

```sh
npx serve .
```

Then open http://localhost:3000/

Note that `npx serve` strips `.html` from URLs (it 301s `/privacy.html` →
`/privacy`). That is a quirk of `serve` only — on Vercel the `.html` URLs are
served directly.
