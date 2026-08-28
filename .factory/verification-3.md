# Independent verification 3 — FAIL

Candidate: `6315386f718b2254772bad2e2e2c23dd7aa4a924`

Live URL: <https://pdf-flow-reader.sociobot.in/>

Verified: 2026-08-28 with Node v22.23.2, npm 10.9.8, Chromium from Playwright 1.58.2, and Lighthouse 12.8.2.

## Release decision

**FAIL.** The deployed product is byte-for-byte consistent with the candidate, the core local PDF flow works, and every exact claim command passes after dependency installation. The candidate is not releasable because a claim-tagged test failed in the required full test run, the installed PWA start URL does not open the reader offline, and malformed imported data can blank the application on every subsequent load.

## Mandatory first-read gate

**PASS on desktop and 390 × 844 mobile.** A cold visitor can answer all three questions from the first viewport:

- What it does: “Read long PDFs in a steady column.”
- For whom: knowledge workers with low vision who need selectable PDF text in a stable, adjustable view.
- What to click first: “Try it with sample data.” The nearby note says the sample opens now.

The action opens a realistic two-page reading routine in one click. The persistent banner says “Demo — sample data, nothing is saved to your real library” and provides **Reset demo** and **Start for real**. The demo uses only `demo:pdf-flow-reader`; it does not create the real `pdf-flow-reader` database.

Evidence: `qa-artifacts/live-first-read/desktop.png`, `qa-artifacts/live-first-read/mobile.png`, and `qa-artifacts/browser-audit.json`.

## Claims gate

`.factory/claims.json` exists with ten entries. Each identifier occurs in exactly one tagged test definition.

The mandatory pre-install invocation could not resolve `@playwright/test`, as expected in the dependency-free clone. After the required `npm ci`, all exact manifest commands passed in both configured projects:

| Claim | Exact command | Result after install |
| --- | --- | --- |
| `demo-sample` | `npx playwright test --grep @claim:demo-sample` | PASS — desktop and mobile |
| `private-local` | `npx playwright test --grep @claim:private-local` | PASS — desktop and mobile |
| `offline-reload` | `npx playwright test --grep @claim:offline-reload` | PASS — desktop and mobile |
| `resume-place` | `npx playwright test --grep @claim:resume-place` | PASS — desktop and mobile |
| `keyboard-controls` | `npx playwright test --grep @claim:keyboard-controls` | PASS — desktop and mobile |
| `local-data-control` | `npx playwright test --grep @claim:local-data-control` | PASS — desktop and mobile |
| `stored-data-scope` | `npx playwright test --grep @claim:stored-data-scope` | PASS — desktop and mobile |
| `scan-report` | `npx playwright test --grep @claim:scan-report` | PASS — desktop and mobile |
| `copy-restrictions` | `npx playwright test --grep @claim:copy-restrictions` | PASS — desktop and mobile |
| `reader-adjustments` | `npx playwright test --grep @claim:reader-adjustments` | PASS — desktop and mobile |

However, the first complete `npm test` run failed `@claim:keyboard-controls` on desktop: after `J`, `[data-current="true"]` remained at block `0` for the full five-second assertion window. This is a release-blocking claim-test failure under the supplied contract. The code starts smooth scrolling in `goToBlock`, while a debounced scroll observer can independently recalculate and write the active block. Forty isolated stress repetitions later passed, confirming that the failure is intermittent rather than a consistently missing feature.

A second complete run was also non-green because Chromium itself segfaulted before the desktop `@claim:local-data-control` context was created; that infrastructure crash is not treated as a product assertion failure. It does mean neither full-suite attempt was green.

The live landing page and README claims map to the ten manifest entries; no additional material landing/README claim was found.

Evidence: `qa-artifacts/claim-logs-postinstall/`, `qa-artifacts/gates/npm-test.log`, `qa-artifacts/gates/npm-test-rerun.log`, and `qa-artifacts/keyboard-stress.log`.

## Clean checkout and build gates

| Gate | Result |
| --- | --- |
| Candidate identity | PASS — exact requested commit |
| `npm ci` | PASS — 80 packages, 0 vulnerabilities |
| All ten exact claim commands | PASS after install — 20 project executions |
| `npm test`, first run | **FAIL** — 8 unit pass; Playwright 29 pass, 2 expected skips, 1 claim assertion failure |
| `npm test`, second run | **FAIL (runner)** — 8 unit pass; Playwright 29 pass, 2 expected skips, Chromium segfault before one claim case |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — exact production `dist/` produced |

## End-to-end and recovery exercise

Passed:

- One-click sample extraction, heading map, confidence note, reader controls, and separate demo storage.
- Representative selectable PDF extraction on the live site with no upload.
- Resume position and settings after reload.
- Text-size limits stop at 18 px and 36 px; block navigation stops at indices 0 and 9 for the ten-block sample.
- Wrong file type, malformed PDF, image-only PDF, and a 100 MB plus one-byte PDF return explicit errors.
- Password-protected PDF: password field gets focus, a wrong password recovers, and the correct password opens the file.
- Copy-restricted PDF is refused.
- Valid export, erase, and re-import restore the saved document.
- A syntactically invalid JSON import reports an error without losing the current document.

Failed:

- A correctly branded but structurally malformed import is accepted as “Imported 1 saved document.” On reload, `homeView` calls `escapeHtml` with the missing document name, throws `TypeError: Cannot read properties of undefined (reading 'replace')`, and leaves only the skip link visible. This reproduces on local and live. The user cannot reach **Manage local data** to recover and must clear browser site data.
- After reading a document, **Open another** renders the chooser without clearing `current`. Pressing `J` then throws because no reading block exists; pressing `H` throws because no outline panel exists. The chooser remains visible, but documented keyboard shortcuts produce console/page errors in this normal transition.

Evidence: `qa-artifacts/browser-audit.json`, `qa-artifacts/malformed-import.jsonl`, `qa-artifacts/open-another-keyboard-errors.json`, and `qa-artifacts/control-boundaries.json`.

## PWA and offline behavior

Passed:

- A controlled `/demo/` reload works offline on local and live, including the sample and offline status banner.
- The live versioned cache is `pdf-flow-reader-a271f7ea36a4` with 32 entries after runtime use.
- In an isolated copy, changing the service-worker version exposed the update toast; choosing **Reload** removed the old cache and the updated app continued working offline.
- The manifest has a standalone display, matching colors, and valid 192, 512, and maskable 512 icons.

Failed:

- The manifest start URL is `/?source=installed-v2`, but the service worker precaches `/` and `/index.html`, not the query-bearing start URL, and cache matching does not ignore the query string. After visiting `/` and obtaining service-worker control, navigating to the installed start URL offline produces `Offline — PDF Flow Reader` instead of the reader. The fallback link can recover to cached `/`, but an installed offline launch does not fulfill “Works offline after the first visit.”

Evidence: `qa-artifacts/pwa-installed-start-offline.json`, `qa-artifacts/browser/live-installed-start-offline.png`, `qa-artifacts/pwa-update.json`, and `qa-artifacts/pwa-cache-count.json`.

## Accessibility and responsive checks

Passed:

- Home, demo reader, Privacy, Terms, and 404 have `lang=en`, a title, one main landmark, and one h1 in their steady states.
- Factory URL verification passes local and live with no load-time console errors, missing image alternatives, or unnamed buttons.
- Axe reports zero serious/critical findings on the local and live demo. The repository suite also covers all four reader treatments and legal/404 routes.
- Keyboard focus is visible (4 px cobalt on light chrome and signal yellow on dark reader surfaces), skip links work, closed mobile drawers are inert, and closing a drawer restores focus.
- At 390 px there is no horizontal overflow, the fixed Previous/Next controls are visible and 72 × 44 px, and reduced-motion media changes transitions/animations to `0.00001s`.
- A 200% root-text stress check showed no horizontal overflow or missing content.

Failed:

- The mobile footer **Terms** link is 38 × 44 px; the privacy-page `sociobot.in` link is 80 × 20 px; focused skip links are 42 px high. These miss the supplied 44 × 44 CSS-pixel target floor. Hidden radio inputs are not counted because their 70 px labels provide the operative targets.
- The transient PDF loading screen has a main landmark but zero h1 elements; “Building a stable flow…” is an h2. This violates the supplied one-h1 semantic baseline for that application state.

Evidence: `qa-artifacts/mobile-small-targets.json`, `qa-artifacts/loading-semantics.json`, `qa-artifacts/verify-url/`, and `qa-artifacts/browser/`.

## Privacy, network, and response policy

- Demo and uploaded-document flows made same-origin GET requests only, with no request bodies. The selected PDF bytes were not sent.
- No analytics, advertising, tracker, remote font, CDN script, cloud OCR, cookie, or external runtime request was observed.
- Saved IndexedDB data contains extracted blocks, confidence data, settings, and position, but neither original PDF bytes nor password.
- CSP, HSTS, Permissions-Policy, Referrer-Policy, frame denial, and nosniff are present. HTTP redirects to HTTPS.
- HTML uses a 30-second revalidation policy, hashed assets are immutable for one year, the manifest caches for one day, and `sw.js` is `no-cache`.
- Unknown paths return the designed 404 with HTTP 404. All visible internal links and the operator link resolve successfully.
- This is a static PWA with no product API, product-unlock call, or other server-side endpoint. `POST /` returns 405. Rate-limit threshold, backend concurrency/persistence, health identity, and Entra sign-in checks are not applicable.

Evidence: `qa-artifacts/live-upload-network.json`, `qa-artifacts/headers/`, `qa-artifacts/link-crawl.tsv`, and `qa-artifacts/static-post.txt`.

## Deployment identity and performance

- 37 of 37 publicly served build files match the local production build byte-for-byte by SHA-256. `staticwebapp.config.json` is the only remaining `dist` file and correctly returns the designed 404 rather than exposing deployment configuration; its response rules are demonstrably active.
- Live Lighthouse mobile `/demo/`: Performance 100, Accessibility 100, Best Practices 100, FCP 1.20 s, LCP 1.65 s, TBT 13.5 ms, CLS 0, transfer 134,682 bytes.
- Clean local Lighthouse rerun: Performance 99, Accessibility 100, Best Practices 100, FCP 1.51 s, LCP 1.96 s, TBT 71 ms, CLS 0, transfer 135,591 bytes. An earlier run under concurrent stress scored 87 with 470 ms TBT; the clean rerun and live result meet the contract.
- Initial JS is 11,211 bytes gzip, initial CSS is 4,901 bytes gzip, no fonts ship, and the 390 px hero AVIF is 22,742 bytes. The lazy PDF.js application chunk is 110,271 bytes gzip; its worker is loaded only when a PDF opens.

Evidence: `qa-artifacts/deployment-identity.tsv`, `qa-artifacts/lighthouse/summary.txt`, `qa-artifacts/lighthouse/local-rerun-summary.txt`, and `qa-artifacts/bundle-budgets.tsv`.

## Defects by severity

### Blocker

1. A claim-tagged keyboard test failed in the required `npm test` run; the full required test gate is not deterministic or green.
2. The installed PWA start URL is not precached, so a first offline installed launch shows only the fallback page and disproves the broad offline claim.

### High

1. Weak import validation accepts malformed records that crash all subsequent loads and remove in-app recovery controls.

### Medium

1. **Open another** leaves stale reader keyboard state; `J` and `H` throw page errors on the chooser.
2. Several mobile links miss the mandatory 44 × 44 target size.
3. The PDF loading state has no h1.

## Reproduction

~~~sh
npm ci
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
npm test
npm run typecheck
npm run lint
npm run build
npm run preview -- --port 4173
~~~

For the installed-start failure, visit `/`, wait for service-worker control, go offline, then navigate to `/?source=installed-v2`. For the import crash, import a `pdf-flow-reader` JSON document with `id`, `blocks: []`, and `settings: {}` but no `name`, then reload. For stale keyboard state, open `/demo/`, choose **Open another**, and press `J` or `H`.
