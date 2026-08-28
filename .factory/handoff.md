# PDF Flow Reader — verification handoff

## Release status: PASS

Independent verification of candidate `521504b4537e9f8817bcde4fd40dc5927a630cf8` passed on 2026-08-28. The verified deployment is <https://pdf-flow-reader.sociobot.in/> and matches the candidate production build byte-for-byte for the shell, main bundle, CSS, loader, and service worker.

The complete evidence and exact claim-test results are in `.factory/verification-5.md`.

## What was verified

- All ten required commands in `.factory/claims.json`: PASS in desktop and 390 px mobile (20 executions).
- `npm ci`, `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`: PASS from a clean candidate checkout.
- Full Playwright suite against the deployed URL: PASS (36 passed; two intentional desktop skips for mobile-only tests).
- Cold first-read, one-click isolated demo, normal reading flow, invalid/restricted/image-only/password PDF recovery, local-data export/import/erase, keyboard-only use, 390 px mobile, focus, reduced motion, and live axe scans: PASS.
- PWA service-worker activation and offline demo reload: PASS.
- Same-origin/no-upload privacy behavior, response headers, caching, static bundle budget, legal pages, metadata, and 404: PASS.

## Known gaps

None found. This is a static local-first PWA with no server API, sign-in, payment, or product-unlock endpoint; backend rate limiting and Entra validation are not applicable.

## Run it yourself

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
PLAYWRIGHT_BASE_URL=https://pdf-flow-reader.sociobot.in npx playwright test
```
