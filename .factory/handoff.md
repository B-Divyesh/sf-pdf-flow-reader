# PDF Flow Reader — verification handoff

## Release status: **FAIL**

Independent verification of candidate `2daa73473e8ae03cc9e9913df33025d4c3d22bc6` against https://pdf-flow-reader.sociobot.in/ completed on 2026-08-28. The live deployment exactly matches the built candidate assets, and core PDF reading, offline reload, mobile, keyboard, axe, typecheck, build, and test checks pass. It is **not releasable** because `.factory/claims.json` is missing and there is no required one-click, isolated sample-data demo. The cold first screen also does not name the low-vision target reader.

See [`.factory/verification.md`](verification.md) for exact commands, observed output, severity-ranked defects, and remediation. The existing builder notes below are historical implementation notes, not an acceptance result.

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
npm test
npm run build
```

- `npm test`: 3 unit tests and 8 Playwright tests pass across desktop Chromium and a 390 px-class mobile viewport. Coverage includes a real generated PDF, extraction, keyboard navigation, setting persistence, resume, invalid input, offline reload, responsive overflow, skip-link focus, and axe serious/critical checks on both empty and reading views.
- `npm run build`: produces `dist/index.html`, `dist/privacy/index.html`, `dist/terms/index.html`, manifest, service worker, and all local assets.
- Initial app code: 28.3 KB raw / 10.1 KB gzip JS; shared CSS: 17.8 KB raw / 4.7 KB gzip; no font payload. PDF.js is a post-selection lazy chunk (110.3 KB gzip), so it is outside first load.
- Hero: 24 KB AVIF / 36 KB WebP at 720 px, 84 KB AVIF / 112 KB WebP at 1280 px.
- Lighthouse mobile (local production preview, Chromium): Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 2.0 s, TBT 0 ms, CLS 0, Speed Index 1.1 s.
- Factory `verify-url.sh`: HTTP 200, title/lang/main present, one h1, all images have alt attributes, no unlabeled buttons, and no console errors (622 ms local load).
- Manual visual review completed at 1440×1000 and 390×844 for the empty state, and at 1440×1000 for the populated reader. No horizontal overflow observed.

## Known gaps / honest limits

- There is no OCR. Scanned PDFs produce a clear “no selectable text” error.
- Extraction cannot reliably reconstruct every multi-column layout, table, equation, footnote, or tagged reading order. The confidence panel makes this limitation visible; the app does not claim WCAG remediation or certification.
- The original PDF is not retained, by design. Resume uses locally stored extracted text, so comparison against the source requires reopening it in another viewer.
- Local processing is capped at 100 MB to reduce browser memory risk.
- Lighthouse was measured against the empty state on a local preview; device and hosting conditions will vary.

## Next steps

- Moderate with low-vision users against the stated 8-of-10 resume/task benchmark.
- Add opt-in, on-device OCR only if a dependable offline model fits the performance and privacy budgets.
- Add a side-by-side original-page preview only if testing shows it improves confidence without destabilizing reading.
