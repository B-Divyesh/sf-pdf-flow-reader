# PDF Flow Reader — polish 1 handoff

## Status: PASS

All seven findings in `.factory/review-1.md` are fixed. No earlier `review-*` or `polish-*` file exists in repository history. No known product, test, accessibility, privacy, offline, or deployment gap remains.

Live product: <https://pdf-flow-reader.sociobot.in/>

Deployed repair artifact: `cb3bae193313522f27d73e1de989c6fc8bc53a7b`

Azure deployment id: `6146fa15-aeea-451b-8835-9ba5a09e5ad7`

## What changed

- Added the one-click `/?demo=1` entry. A cold landing visit no longer creates the real IndexedDB, so the demo uses only `demo:pdf-flow-reader` until Start for real.
- Added two declared extraction claims and observable browser tests for the source-PDF boundary and confidence note.
- Centralized the header, footer, shortcut dialog, and local-data dialog across Home, Demo, Privacy, Terms, and 404.
- Added route-change h1 focus and polite announcements for forward navigation, Back/Forward, Demo, Home, legal pages, and 404.
- Added the 404 canonical and verified unique titles, canonicals, one h1, legal links, real URLs, and HTTP 404 behavior.
- Rewrote the explanatory heading, shortcut action, extraction copy, and every saved-location reference to use “reading place”.
- Kept all header controls on 390 px screens with compact labels and 44 px targets.
- Updated `.factory/claims.json`, `.factory/demo.md`, `.factory/copy-audit.md`, README, and the verb-first catalog description.

## Exact verification

A fresh GitHub clone at the deployed commit was created at `/tmp/pdf-flow-reader-polish-1-clean.Fsj3Zh/repo`.

- `npm ci`: PASS, 0 vulnerabilities.
- Every one of the 12 exact commands in `.factory/claims.json`: PASS in desktop and mobile, 24 project runs total.
- `npm test`: PASS — 15 unit tests; 44 browser tests; 2 expected desktop skips for mobile-only cases.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/index.html` produced.
- Live `PLAYWRIGHT_BASE_URL=https://pdf-flow-reader.sociobot.in npx playwright test`: PASS — 44 passed, 2 expected skips.
- Worker `verify-url.sh` against live Home: PASS — title, `lang=en`, one h1, main, image alternatives, button names, and zero console errors.
- Playwright axe integration on Home, Demo, Privacy, Terms, 404, and all four reader contrast treatments: no serious or critical violations.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 0 ms.
- Local Lighthouse: 100/100/100/100; LCP 1.7 s, CLS 0, TBT 0 ms.
- Initial bundles: main JS 9.54 KiB gzip + shared chrome JS 3.63 KiB gzip; CSS 4.95 KiB gzip. PDF.js stays lazy at 110.27 KiB gzip.
- Live unknown route: HTTP 404. Home, `/?demo=1`, Privacy, Terms, explicit 404, robots, and sitemap: HTTP 200.
- SHA-256 matches between `dist/` and live for Home HTML, main JS, shared chrome JS/CSS, service worker, and manifest.

Evidence: `.factory/polish-1.md` and `.factory/polish-1-artifacts/`.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Known gaps and next steps

None.
