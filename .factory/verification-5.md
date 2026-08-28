# Independent verification 5 — PDF Flow Reader

## Release decision: PASS

- Candidate commit: `521504b4537e9f8817bcde4fd40dc5927a630cf8`
- Verified live URL: <https://pdf-flow-reader.sociobot.in/>
- Verification date: 2026-08-28
- Scope: independent clean-checkout verification of the static local-first PWA. No product code was changed.

## Cold first read

Cold-loading the live mobile and desktop landing page answers the required questions in plain language:

- **What it does:** “Read long PDFs in a steady column.”
- **For whom:** “For knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view.”
- **What to do first:** the visible primary button is “Try it with sample data,” with “The sample opens now” beside it.

The button opens `/demo/` in one click. The bundled realistic two-page reading routine opens in the reader, with the persistent “Demo — sample data, nothing is saved to your real library” banner and Reset demo / Start for real controls. This passes the first-read and demo-sandbox acceptance checks.

## Required claim tests — all PASS

From the clean candidate checkout after `npm ci`, every exact test command in `.factory/claims.json` passed in both Playwright projects (desktop and 390 × 844 mobile):

| Claim id | Exact command | Result |
| --- | --- | --- |
| `demo-sample` | `npx playwright test --grep @claim:demo-sample` | PASS (2/2) |
| `private-local` | `npx playwright test --grep @claim:private-local` | PASS (2/2) |
| `offline-reload` | `npx playwright test --grep @claim:offline-reload` | PASS (2/2) |
| `resume-place` | `npx playwright test --grep @claim:resume-place` | PASS (2/2) |
| `keyboard-controls` | `npx playwright test --grep @claim:keyboard-controls` | PASS (2/2) |
| `local-data-control` | `npx playwright test --grep @claim:local-data-control` | PASS (2/2) |
| `stored-data-scope` | `npx playwright test --grep @claim:stored-data-scope` | PASS (2/2) |
| `scan-report` | `npx playwright test --grep @claim:scan-report` | PASS (2/2) |
| `copy-restrictions` | `npx playwright test --grep @claim:copy-restrictions` | PASS (2/2) |
| `reader-adjustments` | `npx playwright test --grep @claim:reader-adjustments` | PASS (2/2) |

The 20 required executions cover the real sample flow, privacy/network isolation, offline reload, saved reading place, keyboard controls, export/import/erase, encrypted PDFs without storing bytes/passwords, image-only rejection without cloud OCR, owner copy restrictions, and all reader adjustments.

## Clean checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 80 packages installed; 0 vulnerabilities reported |
| `npm test` | PASS — 15 unit tests; full browser suite passed (36 passed, 2 expected desktop skips for mobile-only cases) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — produces `dist/` |
| `PLAYWRIGHT_BASE_URL=https://pdf-flow-reader.sociobot.in npx playwright test` | PASS — full suite against production, 36 passed / 2 expected skips |

Manual boundary/recovery coverage is included in the browser suite: invalid non-PDF input, image-only PDF, password-protected PDF, owner copy restrictions, malformed import, corrupt legacy storage, reader reset, resume, and data export/import/erase. Independently on the live URL, a 104,857,601-byte PDF was rejected immediately with “That file is over the 100 MB local processing limit.” No server upload path exists.

## Deployment match and product behavior

Fresh `npm run build` output matches production byte-for-byte for the deployed shell and executable assets:

| File | SHA-256 |
| --- | --- |
| `index.html` | `82858cd36595b3bab5360cef86a54f658403a330bf97ad941de09a386c2bddcd` |
| `assets/main-C5zPtrPo.js` | `db69f7a1670eb099991279859dc9f33acdaad5526dad391726c78285d1587b5b` |
| `assets/style-DvT5HKA-.js` | `8fed4c1a3ce57c1fed4acd6b8a1488b6e45a4018bf38077bb481e443727a4795` |
| `assets/style-CZ03nGpJ.css` | `f2ffbbbd4a722707bad1f2dc7375f3eb2e0548b22ab0c5cad21661781d922880` |
| `sw.js` | `9c414503cfc1c81af12973476ffb0bc07fa1e3c238f63363dc5ec1b02b99a689` |

Live desktop and 390 px mobile checks found no horizontal overflow or console/page errors. Keyboard-only operation reaches the skip link, navigation, demo controls, reader controls, and footer links; J/K, brackets, H, Escape, and Space work in the reader. Focus remains visible. At reduced motion, the live reader reports `scroll-behavior: auto` and a `0.01ms` transition duration.

Live axe scans on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/` in both desktop and mobile reported **0 serious/critical violations**. Each route has `lang=en`, exactly one `h1`, and exactly one `main`.

The live PWA registers an activated root-scope service worker. From a fresh mobile context, after the first `/demo/` visit and a controlled reload, switching the context offline and reloading restored the bundled sample and showed the offline status. The update toast remains hidden when no waiting update exists; source and deployed worker implement `skipWaiting`, `clients.claim`, versioned precache, and update detection.

## Privacy, policy, caching, and budgets

- Live cold and demo request traces contain only same-origin GETs. The only runtime fetch/XHR is the bundled `/samples/reading-routine.pdf`; there is no request body or document upload.
- No cookie, analytics global, remote font, remote script, tracking pixel, or CDN request was observed. Source inspection corroborates this.
- The live response policy provides CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and restrictive Permissions-Policy. `sw.js` is `no-cache`; hashed assets use one-year `immutable` caching; manifest MIME is correct; an unknown path returns HTTP 404 with the styled 404 document.
- Initial JavaScript is 11.85 KiB gzip (main plus style loader); CSS is 4.93 KiB gzip; no web fonts load. PDF.js (110.27 KiB gzip) and its worker are loaded only when opening a document. These are within the static/PWA first-load budgets.
- This is a static PWA with no backend, product-unlock route, authentication, payment, or API endpoint. Request traces and source show no server-side endpoint. Fresh `GET /api`, `/api/`, `/api/v1`, and `/api/product-unlock` returned 404; POST returned 405. Rate-limit and Entra checks are therefore not applicable.

## Defects by severity

No critical, high, medium, or low defects found. No release-blocking deployment-only failure reproduced.
