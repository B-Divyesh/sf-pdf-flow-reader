# Independent verification 2 — FAIL

Candidate: baa6d122b537d1e0f84c0e2d5b064a7d703782f1

Live URL: https://pdf-flow-reader.sociobot.in/

Verified: 2026-08-28 with Node v22.23.2, npm 10.9.8, and Chromium from Playwright 1.58.2

## Release decision

FAIL. The candidate is deployed byte-for-byte and its core local PDF flow, declared claim behaviors, offline reload, security policy, and performance all work. It is not releasable under the supplied contract because:

1. Public reliance claims remain outside .factory/claims.json. The claims contract explicitly makes any unlisted claim release-blocking.
2. At 390 px, both closed reader drawers remain in the keyboard Tab order while positioned offscreen. Closing either drawer also leaves focus on an offscreen close button.
3. The fixed previous/next reading controls render as blank 50 by 36 px squares on mobile. They have accessible names, but sighted low-vision users cannot identify them and the targets are shorter than 44 px.

## Mandatory first-read gate

PASS.

Cold first-screen reading:

- What it does: “Read long PDFs in a steady column.”
- For whom: knowledge workers with low vision who need selectable PDF text in a stable, adjustable view.
- What to click first: “Try it with sample data,” with adjacent copy explaining that the sample opens immediately.

The one-click sample opened /demo/, extracted the bundled two-page reading routine, and displayed the persistent demo banner with Reset demo and Start for real.

Evidence:

- .factory/verification-artifacts/live-cold-desktop.png
- .factory/verification-artifacts/live-demo-mobile.png

## Claims gate

.factory/claims.json exists. Before dependency installation, the first exact claim command could not load @playwright/test from the clean clone. After the required npm ci setup, all five exact manifest commands passed in both configured projects:

| Claim | Exact command | Result |
| --- | --- | --- |
| demo-sample | npx playwright test --grep @claim:demo-sample | PASS — desktop and mobile |
| private-local | npx playwright test --grep @claim:private-local | PASS — desktop and mobile |
| offline-reload | npx playwright test --grep @claim:offline-reload | PASS — desktop and mobile |
| resume-place | npx playwright test --grep @claim:resume-place | PASS — desktop and mobile |
| keyboard-controls | npx playwright test --grep @claim:keyboard-controls | PASS — desktop and mobile |

Each manifest identifier has exactly one matching test definition. The observable claim behaviors therefore pass.

### Release-blocking unlisted claims

The live product and README make additional promises with no claims.json entry or matching tagged test:

- Export, import, and erase the local library.
- Store extracted text and settings but not the original PDF.
- Never save a PDF password.
- Report scanned/image-only PDFs without cloud OCR.
- Respect owner restrictions on text copying.
- Adjust line spacing, word spacing, measure, typeface, and four contrast treatments.
- Use no analytics, advertising, tracking pixels, CDN scripts, or remote fonts. The private-local test rejects cross-origin and non-GET requests, but it does not prove the broader absence of same-origin analytics.

These behaviors passed the manual cases exercised where applicable, but manual verification is not a substitute for listing and testing each public claim under the supplied contract.

## Clean checkout and build gates

| Gate | Result |
| --- | --- |
| git rev-parse HEAD | baa6d122b537d1e0f84c0e2d5b064a7d703782f1 |
| npm ci | PASS — 80 packages, 0 vulnerabilities |
| npm test | PASS — 5 unit tests and 14 Playwright tests |
| npm run typecheck | PASS |
| npm run lint | PASS |
| npm run build | PASS — dist produced |

The exact production build completed with Vite 7.3.6.

## Independent product exercise

### Normal and recovery flows

- One-click demo: PASS; realistic two-page sample appears immediately.
- Normal generated PDF: PASS; extracted headings and prose appeared in a single reading column with a confidence note.
- Resume: PASS; reading block and 24 px setting survived reload.
- Keyboard: PASS for J/K movement, text-size bounds of 18–36 px, and theme cycling.
- Wrong file type: PASS; “Choose a file ending in .pdf.”
- Malformed PDF: PASS; valid/supported-PDF error and retry action.
- Blank/image-only PDF: PASS; explicit selectable-text/OCR explanation.
- 100 MB plus one byte: PASS; rejected before extraction with the documented local limit.
- Encrypted PDF: PASS; password field receives focus, wrong password recovers, correct password opens the document.
- Copy-restricted PDF: PASS; extraction is refused without bypassing the restriction.
- Export: PASS; downloaded JSON contained one document and no original PDF bytes.
- Invalid JSON import: PASS; an error was shown without losing saved data.
- Erase: PASS; cancel preserved data and confirmation removed all saved records.

The exported record contained blocks, confidence, timestamps, id, name, page count, settings, and current block only.

### Privacy and network

- Fresh demo and uploaded-document flows made same-origin GET requests only, with no request body.
- No analytics, external font, third-party script, upload, OCR, sign-in, or product API request was observed.
- Real and demo IndexedDB namespaces remained separate.
- This static PWA exposes no server-side API or product-unlock endpoint. Burst rate-limit and persistence/concurrency checks are not applicable.
- There is no sign-in, so the Microsoft Entra authority requirement is not applicable.

### Accessibility and mobile

Passed:

- Home, demo reader, privacy, terms, and 404 each have lang=en, one h1, and one main.
- Axe found no serious or critical findings on home, legal pages, 404, reader, or cream/white/dark/high-contrast reader treatments.
- The skip link is visible on focus and skips header navigation.
- No horizontal overflow at 390 by 844.
- Reduced motion changes panel transition duration to 0.01 ms.
- Dialog focus moves to the password field and wrong-password errors are announced.

Failed:

- Closed heading and settings drawers are translated offscreen but are not hidden or inert. Tab reaches Close headings and both heading buttons before reaching the visible Headings control. It later reaches all offscreen settings controls.
- Closing a drawer leaves focus on its translated-offscreen close control instead of returning it to the opener.
- Mobile previous/next buttons are visibly blank because font-size is set to zero and the first-letter rule does not render a label. Their measured size is 50 by 36 px.
- Other sub-44 px targets include the 180 by 36 px wordmark and 39 by 44 px Demo link.
- The global cobalt focus color has only 2.43:1 contrast on the dark reader and 2.84:1 on black, below the required 3:1 focus contrast.
- Native dialogs expose their headings as content but have no programmatic accessible name on the dialog element.

### Deployment identity, response policy, and PWA

- Local dist and production matched SHA-256 byte-for-byte for all HTML routes, scripts, styles, worker, images, manifest, sample PDF, offline page, and service worker.
- Unknown paths return the designed 404 with HTTP 404.
- All crawled internal links and the sociobot.in contact link resolved as intended.
- CSP, Permissions-Policy, Referrer-Policy, X-Content-Type-Options, X-Frame-Options, HSTS, and HTTP-to-HTTPS redirect are present.
- Hashed assets return Cache-Control: public, max-age=31536000, immutable.
- sw.js returns no-cache; the manifest has application/manifest+json.
- A fresh live context was service-worker controlled with one versioned cache containing 31 entries, then reloaded the demo offline.
- A simulated service-worker version change displayed the update toast, replaced the old cache, reloaded, and still worked offline.
- The manifest contains name, short name, start URL, standalone display, theme/background colors, 192/512 icons, and a maskable 512 icon.

The site lacks the required Open Graph and Twitter metadata/social image declarations. The designed 404 also omits the standard site header and footer.

### Performance

Local production Lighthouse mobile on /demo/:

- Performance: 97
- Accessibility: 100
- Best practices: 100
- FCP: 1.5 s
- LCP: 2.0 s
- Total blocking time: 170 ms
- CLS: 0
- Transferred page weight: 132 KiB

Build budgets:

- Initial application JS: 10.97 KiB gzip combined.
- Initial CSS: 4.88 KiB gzip.
- Lazy PDF.js application chunk: 109.82 KiB gzip.
- Fonts: none.
- Mobile hero AVIF: 22,742 bytes.

All stated performance budgets pass.

## Defects by severity

### Blocker

1. Multiple public reliance claims are absent from .factory/claims.json and have no tagged sandbox tests. This is an explicit claims-contract failure.

### High

1. Mobile closed drawers expose offscreen controls in sequential focus order and do not restore focus after close. This breaks the keyboard-first job for the target user.
2. Mobile previous/next reading buttons are visually blank and only 36 px high. Their purpose is unavailable to sighted users without assistive technology.

### Medium

1. Focus outlines fail 3:1 contrast in dark and high-contrast reader modes.
2. Several mobile targets do not meet 44 by 44 px.
3. Dialog elements have no programmatic accessible name.
4. Required Open Graph/Twitter metadata and a 1200 by 630 social image declaration are absent.

### Low

1. The 404 page does not use the shared header/footer skeleton.

## Reproduction

~~~sh
npm ci
while IFS=$'\t' read -r id command; do bash -lc "$command"; done < <(jq -r '.[] | [.id,.test] | @tsv' .factory/claims.json)
npm test
npm run typecheck
npm run lint
npm run build
npm run preview -- --port 4173
~~~

At 390 px, open /demo/ and press Tab from Start for real. Focus next enters the closed, offscreen headings drawer. Open Headings and activate Close headings; focus remains on that offscreen button. The fixed reading controls at the bottom display as two blank squares.
