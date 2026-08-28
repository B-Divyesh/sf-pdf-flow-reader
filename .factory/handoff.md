# PDF Flow Reader — polish round 2 retry 2 handoff

## Status

Complete. All findings in `.factory/review-1.md` and `.factory/review-2.md` are closed in source, tests, and the deployed site. There are no deferred findings.

Live: <https://pdf-flow-reader.sociobot.in/>

Demo: <https://pdf-flow-reader.sociobot.in/?demo=1>

## What changed

- Removed the README’s self-referential claim-manifest completeness assurance.
- Added `no-api-key-or-backend` and `artwork-provenance` to `.factory/claims.json` with one observable Playwright test each.
- The credential-free test starts only the built static preview in a scrubbed process, opens the sample, and asserts same-origin GET requests with no request body.
- The provenance test joins the displayed asset to its original PNG, prompt sidecars, matching prompt, generator, date, design record, and rendered credit.
- Updated the catalog description to a 66-character verb-first sentence.
- Rechecked and retained every round 1 repair: first-screen wording, isolated `?demo=1`, storage reset, reader terminology, route focus/announcement, shared chrome, metadata, canonical URLs, mobile layout, and designed 404.

Round-two product repairs remain in `bdba4fa` and `833f3cb`. Retry 2 adds the
CI safety repair in `619ee50123e719c4da5671b8c03b52fdf448ffb6`
(`test: serialize browser checks in CI`): Playwright explicitly uses one worker
when `CI=1`, preventing the prior multi-browser Chromium crash condition.

## Exact verification evidence

### Fresh GitHub clone

Clone: `/tmp/pdf-flow-reader-polish-2-final-dDzYk7` at
`619ee50123e719c4da5671b8c03b52fdf448ffb6`; installed with
`npm ci --include=dev` (80 packages added; 0 vulnerabilities). The explicit
dev inclusion was needed because this worker's base environment omits dev
dependencies from a plain install.

- Every exact command in `.factory/claims.json` passed independently with `CI=1`: 14 claim IDs × desktop/mobile = 28 passing project runs.
- `npm test` under `CI=1`: 15 unit tests passed; 48 browser checks passed; 2 expected desktop skips for mobile-only checks. Chromium ran with one worker and completed without SIGSEGV/browser-closed errors.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/index.html`; `git diff --check` passed.
- Initial JavaScript: 119.81 KB gzip (`main` 9.54 KB + lazy PDF module 110.27 KB). CSS: 4.95 KB gzip.

### Local production build

- Factory URL verifier passed Home and `?demo=1`: correct title, `lang=en`, one h1, one main, complete image alt text, labelled buttons, and no console errors.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, CLS 0, TBT 0 ms.
- Playwright axe coverage found no serious or critical issue on Home, the reader, Privacy, Terms, 404, or any of the four reader contrast treatments.
- Evidence: `.factory/polish-2-artifacts/local-home/`, `.factory/polish-2-artifacts/local-demo/`, and `.factory/polish-2-artifacts/lighthouse-local.json`.

### Deployment and cold live check

- Deployed `dist/` with `/opt/fleet/lib/deploy-static.sh pdf-flow-reader dist`.
- Azure Static Web Apps deployment ID: `d8d9feb1-feda-472d-8828-b7956e50ec38`; production upload status: Succeeded.
- Cold factory verifier passed Home, Demo, and Privacy with no console errors. Evidence: `.factory/polish-2-artifacts/retry2-live-home/`, `.factory/polish-2-artifacts/retry2-live-demo/`, and `.factory/polish-2-artifacts/retry2-live-privacy/`.
- Full live Playwright suite under `CI=1`/one worker: 48 passed; 2 expected desktop skips. This includes offline reload, demo database isolation/reset, privacy request tracing, axe, keyboard behavior, 390 px targets/overflow, route focus/announcement, titles/canonicals, shared legal chrome, and 404 recovery.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 0 ms.
- Route checks returned 200 for `/`, `/?demo=1`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`; `/does-not-exist-polish-2-retry2` returned a real HTTP 404 with the designed page.
- Production headers include CSP, HSTS, Referrer-Policy, Permissions-Policy, frame protection, and `X-Content-Type-Options`.
- SHA-256 matched local and live Home HTML, main/shared JS, CSS, service worker, and manifest. See `.factory/polish-2-artifacts/deployment-identity.tsv`.
- Screenshots and verifier reports: `.factory/polish-2-artifacts/live-home/`, `.factory/polish-2-artifacts/live-demo/`, and `.factory/polish-2-artifacts/live-privacy/`.
- Live Lighthouse: `.factory/polish-2-artifacts/lighthouse-live.json`.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
```

For any declared claim, run its exact `test` command from `.factory/claims.json`.

## Known scope boundaries

No unresolved defect or review finding remains. Image-only PDFs still require an external OCR workflow, and complex layouts must be checked against the source PDF. These are explicit product boundaries required by the brief, not deferred work.
