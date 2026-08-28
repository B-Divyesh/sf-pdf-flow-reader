# PDF Flow Reader — polish round 2 handoff

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

Implementation commit: `bdba4fa` (`test: cover remaining public claims`).

## Exact verification evidence

### Fresh GitHub clone

Clone: `origin/main` at `bdba4fa`, installed with `npm ci` (80 packages added; 0 vulnerabilities).

- Every exact command in `.factory/claims.json` passed independently: 14 claim IDs × desktop/mobile = 28 passing project runs.
- `npm test`: 15 unit tests passed; 48 browser checks passed; 2 expected desktop skips for mobile-only checks.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/index.html`.
- Initial JavaScript: 119.81 KB gzip (`main` 9.54 KB + lazy PDF module 110.27 KB). CSS: 4.95 KB gzip.

### Local production build

- Factory URL verifier passed Home and `?demo=1`: correct title, `lang=en`, one h1, one main, complete image alt text, labelled buttons, and no console errors.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, CLS 0, TBT 0 ms.
- Playwright axe coverage found no serious or critical issue on Home, the reader, Privacy, Terms, 404, or any of the four reader contrast treatments.
- Evidence: `.factory/polish-2-artifacts/local-home/`, `.factory/polish-2-artifacts/local-demo/`, and `.factory/polish-2-artifacts/lighthouse-local.json`.

### Deployment and cold live check

- Deployed `dist/` with `/opt/fleet/lib/deploy-static.sh pdf-flow-reader dist`.
- Azure Static Web Apps deployment ID: `37e72825-9623-4897-9f9a-ee701c4ae218`; production upload status: Succeeded.
- Cold factory verifier passed Home, Demo, and Privacy with no console errors.
- Full live Playwright suite: 48 passed; 2 expected desktop skips. This includes offline reload, demo database isolation/reset, privacy request tracing, axe, keyboard behavior, 390 px targets/overflow, route focus/announcement, titles/canonicals, shared legal chrome, and 404 recovery.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 0 ms.
- Route checks returned 200 for `/`, `/?demo=1`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`; `/does-not-exist-polish-2` returned a real HTTP 404 with the designed page.
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
