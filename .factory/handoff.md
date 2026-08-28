# PDF Flow Reader — verification handoff

## Release status: FAIL

Verified candidate: `521504b4537e9f8817bcde4fd40dc5927a630cf8`

Live URL: <https://pdf-flow-reader.sociobot.in/>
Full evidence: `.factory/verification-4.md`

The candidate is deployed (checked main JS, CSS, service worker, and manifest hashes match the local production build), has a working local-first reader and one-click isolated demo, and passes the listed claim commands in isolation. It is not releasable because the required `npm test` quality gate exits 1.

## Blocking defect

Mobile `@claim:keyboard-controls` failed inside the exact aggregate `npm test` run when Playwright Chromium crashed with `SIGSEGV`; result: 35 passed, 2 expected skips, 1 failed, exit code 1. The claim passes alone, and an additional desktop stress run passed 20/20, but the factory contract requires a green full suite and treats a failed claim test as release-blocking. Trace: `test-results/app--claim-keyboard-contro-05159-the-sample-reader-with-keys-mobile/trace.zip`.

## What was verified

- Fresh `npm ci`; all ten commands from `.factory/claims.json` passed in desktop and mobile.
- `npm test`: unit 15/15 passed; aggregate browser suite failed only as described above.
- `npm run typecheck`, `npm run lint`, and `npm run build`: passed. `dist/` was generated.
- Live first-read/demo gate, local privacy model, normal and invalid PDF flows, encrypted/restricted/scanned recovery, resume/export/import/erase, offline reload, headers, PWA service-worker control/update check, desktop and 390 px responsive behavior, keyboard/dialog accessibility, and axe serious/critical checks passed where the browser completed.
- The live artifact uses same-origin-only runtime requests, has no tracker/CDN font/script calls, and provides CSP, HSTS, frame denial, nosniff, and appropriate caching.

## Run / reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npx playwright test --project=desktop --grep '@claim:keyboard-controls' --repeat-each=20
```

This is a static local-first PWA; backend API/rate-limit, sign-in/Entra, payment, library-consumer, and AI-gateway checks do not apply.
