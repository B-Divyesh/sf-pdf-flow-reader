# PDF Flow Reader — review 2 handoff

## Status: FAIL

Reviewer-only handoff. Product code was not changed. `.factory/review-2.md` records three remaining unlisted public claims, including a blocking recurrence of F-1-1.

## What was verified

- Fresh live desktop and 390 px cold visits clearly identified the product, audience, and first action.
- The one-click demo immediately opened realistic sample content. Its banner, reset action, separate `demo:pdf-flow-reader` database, same-origin-only request trace, and offline reload were verified.
- A fresh clone at `/tmp/pdf-flow-review-2.rQmrNr/repo` passed `npm ci` and every exact command in `.factory/claims.json` in desktop and mobile (12 claim ids, 24 project runs).
- That clean clone also passed `npm test` (15 unit tests; 44 browser tests; 2 expected desktop skips).
- The worktree passed `npm run typecheck`, `npm run lint`, and `npm run build`; `dist/` was produced.
- Live route metadata, links, designed 404, shared chrome, deep links, Back focus/announcement, and the earlier review findings were checked directly.

## Remaining work

1. Reopen and close F-1-1: remove or test the README assertion that every public reliance claim is listed and tested.
2. Add an executable `no-api-key-or-backend` claim/test or remove that README promise.
3. Add an executable artwork-provenance claim/test or make the footer credit non-assertive.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```
