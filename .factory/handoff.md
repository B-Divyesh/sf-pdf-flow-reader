# PDF Flow Reader — repair handoff

## Release status: **DEPLOYED**

Repair commits: `e4f01e35ab286027627a1cc0e8497e78aed74a1c` (demo, claims, static policy) and `083e1990f342d46007718866e3ec083a1ed26527` (manifest MIME). Base verified candidate: `2daa73473e8ae03cc9e9913df33025d4c3d22bc6`; verifier report: `4570572ab9911612851506f06d719f7f6c30d772`.

Deployed to production at `https://pdf-flow-reader.sociobot.in/` on 2026-08-28 using `swa deploy ./dist --env production` against Azure Static Web App `sf-pdf-flow-reader`.

All release-blocking verifier findings have been repaired without changing the local-first reader’s existing PDF flow:

- Added `.factory/claims.json` with five executable `@claim:` Playwright checks: demo sample, local-only privacy, offline reload, local resume, and keyboard controls.
- Added the direct `/demo/` (and `?demo=1`) sandbox, a bundled two-page realistic `reading-routine.pdf`, persistent demo banner, Reset demo, Start for real, and an isolated `demo:pdf-flow-reader` IndexedDB namespace. Demo data is cleared before leaving it.
- Rewrote the first screen to name knowledge workers with low vision and use the plain job headline “Read long PDFs in a steady column.”
- Added static deployment policy: CSP, Permissions-Policy, frame protection, cache rules, manifest MIME, designed 404 override, and a navigation fallback configuration that lets unknown paths return the 404 response.
- Made the service-worker cache name a SHA-256-derived build identifier; it now precaches directory URLs such as `/demo/` as well as assets, so the demo reloads offline.
- Added Demo navigation and Param Factory/version identity in the footer. Added copy and demo documentation.

## Built

- Local PDF opening and extraction with PDF.js loaded only after a user chooses a file.
- Stable single-column prose, best-effort paragraph/heading grouping, page labels, heading navigation, and an explicit extraction-confidence explanation.
- Low-vision controls for 18–36 px type, line and word spacing, line measure, typeface, and warm/white/dark/high-contrast reading treatments.
- Keyboard reading position (`J`/`K`), text sizing (`[`/`]`), contrast (`T`), headings (`H`), native page scrolling, designed focus states, mobile drawers, and 44 px controls.
- IndexedDB persistence for extracted text, last block, and display settings; resume card plus JSON export/import and confirmed erase.
- Password flow for encrypted PDFs, refusal of copy-restricted PDFs, clear scanned/invalid/oversize errors, cancellable loading, online/offline status, and service-worker update messaging.
- Installable offline PWA with versioned precache, runtime fallback, manifest, 192/512/maskable icons, and standalone theme.
- Dedicated privacy and terms pages; no analytics, external fonts, CDN runtime scripts, file upload, or cloud OCR.
- Product-specific neo-brutalist utility system and original reflow-gate illustration with source/prompt provenance and AVIF/WebP/JPEG responsive outputs.

## Verification

Run from `/work/repo`:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npx playwright test --project=desktop
npx playwright test --project=mobile
```

- Clean `npm ci`: passed, 80 packages installed, 0 vulnerabilities.
- `npm run typecheck`, `npm run lint`, and `npm run test:unit`: passed (5 unit tests).
- Desktop and 390×844 mobile Playwright: **7/7 each** passed. This includes normal upload/extraction, invalid PDF recovery, resume/settings, skip link, overflow, keyboard, offline demo reload, isolated storage, reset/start-real, request interception, and axe serious/critical checks on empty and reader views.
- Each claim command in `.factory/claims.json` targets exactly one observable `@claim:` test; the five tests passed in both browser projects from fresh contexts.
- `npm run build`: passed and produced `dist/` with `/demo/`, `/privacy/`, `/terms/`, `/404/`, `staticwebapp.config.json`, sample PDF, manifest, and the generated cache-versioned service worker.
- Initial main JavaScript is 29.92 KB raw / 10.54 KB gzip; initial CSS is 18.72 KB raw / 4.86 KB gzip; no font payload. PDF.js remains lazy after opening a file (110.27 KB gzip).
- Lighthouse mobile on local production preview `/demo/`: Performance **99**, Accessibility **100**, LCP **2.0 s**, CLS **0** (`CHROME_PATH=…chrome-headless-shell … --chrome-flags='--no-sandbox'`).
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo/`: HTTP 200; title, `lang`, one h1, `<main>`, image alts, button labels, and console all pass (789 ms local load). The provided Playwright Axe integration passes with no serious or critical violations; standalone `axe-cli` could not start without `--no-sandbox` in this container.
- The response policy and 404/cache/manifest/service-worker rules are regression-tested by `tests/unit/release-config.test.ts`; live hosting headers must be rechecked immediately after deployment because Vite preview does not apply Static Web Apps rules.
- Live production recheck: `/demo/` returned 200 and `verify-url.sh` reported title `Demo — PDF Flow Reader`, `lang=en`, one h1, main, 0 missing image alts, 0 unlabeled buttons, and no console errors (812 ms). `/missing-page` returns the designed page with HTTP **404**. `/assets/main-CakAyJas.js` returns `Cache-Control: public, max-age=31536000, immutable`; `/manifest.webmanifest` returns `application/manifest+json` and `max-age=86400`; CSP, Permissions-Policy, X-Frame-Options, nosniff, and Referrer-Policy are present.

## Known gaps / honest limits

- There is no OCR. Scanned PDFs produce a clear “no selectable text” error.
- Extraction cannot reliably reconstruct every multi-column layout, table, equation, footnote, or tagged reading order. The confidence panel makes this limitation visible; the app does not claim WCAG remediation or certification.
- The original PDF is not retained, by design. Resume uses locally stored extracted text, so comparison against the source requires reopening it in another viewer.
- Local processing is capped at 100 MB to reduce browser memory risk.
- Lighthouse was measured against the demo on a local production preview; device and hosting conditions will vary.

## Next steps

- Moderate with low-vision users against the stated 8-of-10 resume/task benchmark.
- Add opt-in, on-device OCR only if a dependable offline model fits the performance and privacy budgets.
- Add a side-by-side original-page preview only if testing shows it improves confidence without destabilizing reading.
- Consider moderated low-vision research before extending the scope.
