# Moda Water — landing pages

Static landing pages for **Moda Water** (Water Vend Pty Ltd), hosted on Vercel at
**go.modawater.com**.

No framework, no build step, no dependencies. Every page is plain HTML, CSS and JS,
served exactly as it sits in this repo.

## Pages

| Folder | Live URL |
|---|---|
| `hospitality1/` | https://go.modawater.com/hospitality1/ |

Each page folder also carries its own supporting pages, e.g.
`hospitality1/privacy.html` → https://go.modawater.com/hospitality1/privacy.html

## Adding a new page

1. Drop the new folder at the root of this repo, e.g. `hospitality2/`, with its
   `index.html` and an `assets/` folder beside it.
2. Add a row to the table above.
3. Commit and push to `main`.

Vercel auto-deploys on every push to `main`, so the page is live at
`https://go.modawater.com/<folder>/` a few moments later.

## vercel.json

```json
{
  "trailingSlash": true,
  "redirects": [
    { "source": "/", "destination": "/hospitality1/", "permanent": false }
  ]
}
```

**`trailingSlash`** — every asset path in these pages is **relative**, so a request
for `/hospitality1` without the trailing slash would resolve `assets/css/styles.css`
against the root instead of the page folder and the CSS, fonts and images would 404.
`trailingSlash: true` makes Vercel redirect `/hospitality1` → `/hospitality1/`,
which keeps the relative paths correct. Do not remove it.

**`redirects`** — there is no page at the repo root, so the bare domain would
otherwise return a Vercel 404. This sends `/` to the current live page.

It is deliberately `"permanent": false` (a 307, not a 308). A permanent redirect
gets cached hard by browsers and is painful to undo, and the root is expected to
change once there is more than one page here. When a second page goes live, either
repoint `destination` or replace the redirect with a real root `index.html`.

## Working on the designer's files

The contents of each page folder are the designer's deliverable and are kept
byte-for-byte as supplied. Report problems back to the designer rather than
patching them here, so the source files and what is live do not drift apart.

## Local preview

```sh
npx serve .
```

Then open http://localhost:3000/hospitality1/

Note that `npx serve` strips `.html` from URLs (it 301s `/hospitality1/privacy.html`
→ `/hospitality1/privacy`). That is a quirk of `serve` only — on Vercel the
`.html` URLs are served directly.
