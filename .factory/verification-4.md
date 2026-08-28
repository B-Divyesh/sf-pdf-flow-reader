# Independent verification 4 — FAIL

**Candidate:** `521504b4537e9f8817bcde4fd40dc5927a630cf8`

**Live URL:** <https://pdf-flow-reader.sociobot.in/>
**Verified:** 2026-08-28 from a clean `npm ci` checkout with Node 22.23.2, npm 10.9.8, and Playwright/Chromium 1.58.2.

## Release decision

**FAIL — release-blocking quality gate.** The deployed artifact matches the candidate for the checked entry assets and behaves correctly in the manual, isolated-claim, accessibility, privacy, PWA, and build checks below. However, the required exact `npm test` command exits **1**: mobile `@claim:keyboard-controls` fails because the supplied Chromium process crashes with `SIGSEGV` while PDF.js activity is under way. The claims contract makes any failing claim test release-blocking, and the product contract requires `npm test` to pass. A standalone claim pass does not turn the complete required command green.

## Mandatory first-read and demo gate — PASS

Cold live first screen, in plain words:

- **What it does:** “Read long PDFs in a steady column.”
- **For whom:** knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view.
- **First action:** **Try it with sample data**; adjacent copy says the sample opens immediately.

One click opens `/demo/`, extracts the realistic bundled reading routine, and displays the persistent “Demo — sample data, nothing is saved to your real library” banner with **Reset demo** and **Start for real**. Demo storage is `demo:pdf-flow-reader`, not `pdf-flow-reader`.

## Claims gate

`.factory/claims.json` exists and its ten declared commands were run in order after fresh `npm ci`; the shell proceeded through every command, so all ten exited zero. Each ran desktop and 390 px mobile.

| Claim | Exact declared command | Isolated result |
| --- | --- | --- |
| `demo-sample` | `npx playwright test --grep @claim:demo-sample` | PASS |
| `private-local` | `npx playwright test --grep @claim:private-local` | PASS |
| `offline-reload` | `npx playwright test --grep @claim:offline-reload` | PASS |
| `resume-place` | `npx playwright test --grep @claim:resume-place` | PASS |
| `keyboard-controls` | `npx playwright test --grep @claim:keyboard-controls` | PASS |
| `local-data-control` | `npx playwright test --grep @claim:local-data-control` | PASS |
| `stored-data-scope` | `npx playwright test --grep @claim:stored-data-scope` | PASS |
| `scan-report` | `npx playwright test --grep @claim:scan-report` | PASS |
| `copy-restrictions` | `npx playwright test --grep @claim:copy-restrictions` | PASS |
| `reader-adjustments` | `npx playwright test --grep @claim:reader-adjustments` | PASS |

The required aggregate run is nevertheless non-green: `npm test` reported **35 passed, 2 expected desktop skips, 1 failed**, exit code 1. The failed test was mobile `@claim:keyboard-controls`; Playwright reports `browser.newContext: Target page, context or browser has been closed`, with Chromium `Received signal 11 SEGV_MAPERR`. The retained trace is `test-results/app--claim-keyboard-contro-05159-the-sample-reader-with-keys-mobile/trace.zip`.

Additional isolation: `npx playwright test --project=desktop --grep '@claim:keyboard-controls' --repeat-each=20` passed **20/20**. This demonstrates intermittent test/browser instability, not a waiver of the green-suite requirement.

## Local quality gates

- `npm ci`: PASS — 80 packages installed; audit reported 0 vulnerabilities.
- Unit portion of `npm test`: PASS — 15/15 tests.
- Browser portion of `npm test`: FAIL as described above.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced the root, demo, privacy, terms, 404, manifest, service worker, assets, and offline fallback.
- Initial application JS: 11,381 bytes gzip (`main`); CSS: 4,953 bytes gzip; no downloaded fonts. PDF.js is dynamically imported after a file is chosen. This meets the 200 KB initial-JS and 50 KB CSS budgets.

The exercised normal and recovery paths include generated selectable PDFs and resume, invalid bytes, malformed/legacy import rejection and recovery, encrypted PDF password prompt, copy-restricted PDF refusal, image-only/scanned-PDF no-OCR error, export/erase/import, all reading adjustments, headings/keyboard navigation, dialogs, and Open another. The full suite covers these paths; all except the browser-crashed test passed in the aggregate run.

## Live deployment, privacy, security, accessibility, and PWA

- Candidate/deployment match: SHA-256 of live and locally built `assets/main-C5zPtrPo.js`, `assets/style-CZ03nGpJ.css`, `sw.js`, and `manifest.webmanifest` matched exactly. The observed live HTML references those same hashed assets.
- Cold live requests were same-origin only (HTML, assets, icon, and hero image), with no console or page errors. Source review found only same-origin sample fetching; no analytics, tracking, remote fonts, CDN scripts, API, sign-in, or payment endpoint.
- Live desktop and 390 × 844 mobile checks across `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`: one `h1`, one `main`, `lang=en`, no horizontal overflow, no console/page errors, no external runtime requests, and no axe serious/critical violations.
- Keyboard/focus, dialog focus restoration, touch-target sizing, four reader contrast treatments, reduced-motion styling, and screen-reader semantics are covered by the browser suite; the applicable non-crashed tests passed.
- Live PWA: active service worker controls scope `/`, has cache `pdf-flow-reader-877a411d62fe`, and `registration.update()` completed without error. After the first visit, a 390 px live demo reload succeeded offline with the reflowed reading routine and the offline status message. The manifest installed start URL `/?source=installed-v3` also opened the app shell offline.
- Live headers: HTTPS/HSTS, CSP restricting all runtime sources to self, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, and Permissions-Policy are present. Hashed assets are one-year immutable, `sw.js` is `no-cache`, manifest MIME is correct, and an unknown route returns a styled HTTP 404. All first-party navigation links and the external Sociobot contact link returned 200.
- No server-side API exists, so rate-limit, persistence-boundary, health, concurrency, and Entra checks are not applicable.

## Defects

### Blocker

1. **`npm test` is nondeterministically non-green during a claim test.** In this clean verification run Chromium crashed (`SIGSEGV`) while the mobile keyboard-controls claim was being scheduled/executed, causing the required full suite to exit 1. Reproduce with `npm test`; inspect the retained trace above. The builder must make the prescribed test run stable (or remove the crash-inducing condition) and provide a fresh green full-suite run before release.

### High / medium / low

No additional defects found in this verification.
