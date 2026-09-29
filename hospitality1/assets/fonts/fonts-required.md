# Fonts required

The page is set in **Matter**, matching the current MODA site. The `@font-face` blocks are
already written in `/assets/css/styles.css`, so the only step is dropping the woff2 files
into this folder using these exact filenames:

| Filename | Weight | Used for |
|---|---|---|
| `Matter-Regular.woff2` | 400 | Body copy |
| `Matter-Medium.woff2` | 500 | Subheadings, emphasis |
| `Matter-SemiBold.woff2` | 600 | Headings, labels, buttons |
| `Matter-Bold.woff2` | 700 | Wordmark, step numerals |

Matter is a commercial typeface from Displaay Type Foundry. A webfont licence is needed for
the domain this page runs on. If MODA already licences Matter for their main site, the same
licence usually needs extending to any additional domain, so check before launch. Ask the
client's web team for the existing woff2 files rather than re-purchasing.

If only the Regular and Bold weights are licensed, delete the Medium and SemiBold
`@font-face` blocks in the stylesheet. The browser will synthesise nothing and simply fall
back to the nearest available weight.

**Until these files exist**, the page renders in the system UI stack, which is a close
enough geometric sans that nothing breaks. It is not the brand face, so do not sign the
page off visually until Matter is in place.

**One thing to remember:** the preload tags in the `<head>` of `index.html` are commented
out on purpose. Preloading files that are not there fires 404s on every page load.
Uncomment them once the woff2 files are in this folder.
