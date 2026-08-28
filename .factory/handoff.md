# PDF Flow Reader — repair handoff

## Release status: PASS

Work order: `pdf-flow-reader-repair-3`

- Verifier report: `021baa1335e806a617b3cda33d9bcb225fdd2946`
- Repaired candidate: `6315386f718b2254772bad2e2e2c23dd7aa4a924`
- Repair commit: `6f37741`
- Live URL: <https://pdf-flow-reader.sociobot.in/>

All findings in `.factory/verification-3.md` were reproduced and repaired. The researched brief, local-first PWA deployment class, one-click isolated demo, privacy model, reader controls, visual system, and previously passing behavior remain intact.

## Repairs

- Made keyboard block movement deterministic. Programmatic movement now commits the target before an instant scroll and briefly ignores scroll-observer feedback. The reader also removes old global scroll handlers when its view closes.
- Added the manifest start URL to the precache and made service-worker navigation lookup ignore query strings. `/?source=installed-v3` now opens the application shell offline after the first visit.
- Replaced shallow import checks with complete validation of the export version, document fields, block structure, settings, bounds, and allowed keys. Invalid imports are rejected before any write. Invalid legacy IndexedDB records are discarded during startup, so they cannot blank the app or block recovery.
- Made **Open another** save the active document, remove reader state and listeners, and disable reader-only shortcuts on the chooser.
- Raised the loading-state heading to the page’s single `h1`.
- Gave skip links, footer links, and legal-page links a minimum 44 × 44 CSS-pixel target.
- Allowed the Playwright base URL to be overridden so the same regressions can run against production.

## Exact regression coverage

- `@claim:keyboard-controls` repeats delayed J/K navigation five times in each project and asserts the exact active block before and after observer debounce.
- `@claim:offline-reload` now navigates to the manifest start URL while offline and asserts the real app shell, not `offline.html`.
- `rejects malformed branded imports and recovers from invalid legacy records` checks both the rejected import path and a directly seeded old corrupt record across reload.
- `Open another clears reader shortcuts and produces no page errors` presses J and H on the chooser and requires zero console/page errors.
- `mobile reading controls stay visible and all reported targets meet 44px` now covers the footer Terms link, privacy contact link, and focused skip link at 390 px.
- `PDF loading state keeps the page h1 semantic` holds PDF.js loading long enough to assert exactly one loading-state `h1`.
- `tests/unit/db-validation.test.ts` covers complete, missing, empty, out-of-range, incomplete, malformed-block, and unexpected-PDF-data records.

## Verification evidence

Fresh install and gates:

- `npm ci`: PASS — 80 packages, 0 vulnerabilities.
- Every exact command in `.factory/claims.json`: PASS — all 10 commands, 2 projects each, 20 executions.
- `npm test`: PASS — 15 unit tests and 36 browser tests; 2 expected desktop skips for mobile-only cases.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/index.html` and all direct routes produced.
- Keyboard stress: `npx playwright test --project=desktop --grep '@claim:keyboard-controls' --repeat-each=20` — 20/20 PASS.

Browser, accessibility, privacy, and PWA:

- Full Playwright suite passed in desktop Chromium and 390 × 844 mobile Chromium, including keyboard, recovery, encrypted/restricted/image-only PDFs, responsive behavior, all four reader treatments, dialogs, focus restoration, and axe serious/critical checks.
- Factory URL verification passed locally and live with title, `lang=en`, one `h1`, one `main`, complete image alternatives, named buttons, and zero console errors. Evidence: `.factory/qa-artifacts/repair-local/` and `.factory/qa-artifacts/repair-live/`.
- Live blocker-focused suite: 15 passed, 1 expected desktop skip. Live demo/privacy suite: 4/4 passed. Demo and PDF activity remained same-origin GET-only with no request body.
- Installed-start offline launch passed in desktop and mobile against both local production and the live deployment.
- Simulated service-worker update showed the update toast, replaced the old cache, reloaded, and retained the sample offline. Evidence: `.factory/qa-artifacts/pwa-update.json`.

Performance and deployment:

- Local Lighthouse mobile `/demo/`: Performance 99, Accessibility 100, Best Practices 100; FCP 1.5 s, LCP 2.0 s, TBT 0 ms, CLS 0, 133 KiB transferred.
- Live Lighthouse mobile `/demo/`: Performance 100, Accessibility 100, Best Practices 100; FCP 1.2 s, LCP 1.5 s, TBT 0 ms, CLS 0, 132 KiB transferred.
- Initial JS is 11.85 KiB gzip combined; CSS is 4.93 KiB gzip; fonts are 0; mobile hero AVIF is 22,742 bytes. Lazy PDF.js remains outside the first load.
- `/opt/fleet/lib/deploy-static.sh pdf-flow-reader dist` completed successfully against the existing `centralus` Static Web App.
- All 37 publicly served build files matched local `dist/` byte-for-byte by SHA-256 after deployment.
- Live response policy passed: CSP, Permissions-Policy, Referrer-Policy, HSTS, `nosniff`, and frame denial are present; hashed assets are one-year immutable; manifest MIME is `application/manifest+json`; `sw.js` is `no-cache`; unknown paths return 404; `POST /` returns 405.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run preview -- --port 4173
```

Run production checks with the same suite by setting `PLAYWRIGHT_BASE_URL=https://pdf-flow-reader.sociobot.in`.

## Known gaps and applicability

No release-blocking product gaps remain from the independent report. Package/consumer, backend concurrency, rate-limit, health-identity, payment, AI-gateway, and Entra checks are not applicable to this static, local-only PWA. No runtime AI feature was added because the researched job does not require one.
