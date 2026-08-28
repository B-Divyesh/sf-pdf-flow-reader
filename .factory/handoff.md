# PDF Flow Reader — review 1 handoff

## Status: FAIL

This reviewer changed no product code. The complete adversarial review is in `.factory/review-1.md`.

## Completed verification

- Opened the live site cold at 390 px and desktop. The first screen clearly states the product, audience, and sample action.
- Verified the one-click demo, persistent banner, reset, isolated `demo:pdf-flow-reader` namespace, no demo record in the regular library, same-origin GET-only requests, and live offline demo reload.
- Ran every exact command in `.factory/claims.json` after clean `npm ci`: all ten passed in desktop and mobile.
- Ran `npm test` (15 unit tests and 36 browser tests, with two expected desktop skips), `npm run typecheck`, `npm run lint`, and `npm run build`: all passed and `dist/` was produced.
- Checked live routes, metadata, links, h1/main/lang, mobile overflow, designed HTTP 404, and axe serious/critical results.
- Read all earlier verification records and the prior handoff; their previously reported defects are fixed and did not reproduce.

## Remaining work

The product does not pass this review because `.factory/review-1.md` records seven findings: undeclared public claims, missing focus/announcement on route changes, missing `/404/` canonical metadata, inconsistent route chrome, inconsistent saved-position terminology, an ambiguous shortcut button, and a context-free explanatory heading.

## Re-run

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
PLAYWRIGHT_BASE_URL=https://pdf-flow-reader.sociobot.in npx playwright test
```
