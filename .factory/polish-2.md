# Polish round 2 — cumulative finding closure

Reviewed `.factory/review-2.md`, `.factory/review-1.md`, `.factory/polish-1.md`, the brief, visual thesis, claims, demo notes, source, and tests. The production site was then checked cold after deployment.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — unlisted extraction claims | Retained the round 1 `extraction-boundary` and `extraction-confidence` manifest entries and their observable demo tests. Kept the complex-layout copy as a source-check instruction. | Test: `@claim:extraction-boundary` and `@claim:extraction-confidence`, both passing from the fresh clone and live. Screenshot: `.factory/polish-2-artifacts/live-demo/screenshot-mobile.png`. Live: <https://pdf-flow-reader.sociobot.in/?demo=1>. |
| F-1-2 — route focus and announcement | Retained h1 focus transfer and polite route announcements for links and Back/Forward. | Test: `route links focus and announce each new h1, including Back and the 404 route`, passing locally and live in both projects. Screenshot: `.factory/polish-2-artifacts/live-privacy/screenshot-mobile.png`. Live: <https://pdf-flow-reader.sociobot.in/privacy/>. |
| F-1-3 — missing 404 canonical | Retained the explicit 404 canonical and matching Open Graph URL. | Test: `every document route uses the same header, footer, controls, and canonical metadata`. Screenshot: `.factory/polish-2-artifacts/live-home/screenshot-desktop.png` for shared chrome. Live: <https://pdf-flow-reader.sociobot.in/404/>; unknown path `/does-not-exist-polish-2` returned HTTP 404. |
| F-1-4 — inconsistent route chrome | Retained the shared header, controls, footer, legal links, product line, provenance, build version, and dialogs on every document route. | Test: `every document route uses the same header, footer, controls, and canonical metadata`, passing live. Screenshot: `.factory/polish-2-artifacts/live-privacy/screenshot-mobile.png`. Live: Home, Demo, Privacy, Terms, and 404 all passed. |
| F-1-5 — three saved-position names | Kept “reading place” as the single visible term across Home, reader, data controls, Privacy, README, and claims. | Test: `@claim:resume-place`. Screenshot: `.factory/polish-2-artifacts/live-home/screenshot-mobile.png`. Live: <https://pdf-flow-reader.sociobot.in/>. |
| F-1-6 — ambiguous Shortcuts label | Kept the accessible action “Show keyboard shortcuts”; compact mobile text remains “Keys”. | Test: shared route-chrome regression and `mobile reading controls stay visible and all reported targets meet 44px`. Screenshot: `.factory/polish-2-artifacts/live-home/screenshot-mobile.png`. Live: <https://pdf-flow-reader.sociobot.in/>. |
| F-1-7 — context-free explanatory heading | Kept “How PDF Flow Reader reads your PDF locally”. | Test: `empty state is accessible and fits the viewport`. Screenshot: `.factory/polish-2-artifacts/live-home/screenshot-desktop.png`. Live: <https://pdf-flow-reader.sociobot.in/>. |
| F-2-1 — recurring manifest-completeness assurance | Removed “Every public reliance claim…” from the README. Replaced it with the non-assuring pointer “See `.factory/claims.json` for tested product claims.” | Test: `lists every public claim with exactly one tagged regression test` plus all 14 exact manifest commands. Screenshot: `.factory/polish-2-artifacts/live-home/screenshot-desktop.png`. Live check: all remaining visible product claims mapped to the manifest; <https://pdf-flow-reader.sociobot.in/>. |
| F-2-2 — untested keyless/backend-free promise | Added `no-api-key-or-backend`. Its test builds, starts only static Vite preview with credentials absent, opens the sample, and proves all requests are same-origin GETs without bodies. | Test: `@claim:no-api-key-or-backend`, passing from the clean clone in desktop/mobile. Screenshot: `.factory/polish-2-artifacts/live-demo/screenshot-mobile.png`. Live: <https://pdf-flow-reader.sociobot.in/?demo=1>; Azure deployment reported no API directory or Functions. |
| F-2-3 — untested artwork provenance | Added `artwork-provenance`. Its test verifies the rendered asset and footer against the original PNG, both prompt records, exact matching prompt, documented generator/date, design record, optimized derivatives, and social card. | Test: `@claim:artwork-provenance`, passing from the clean clone and live. Screenshot: `.factory/polish-2-artifacts/live-home/screenshot-desktop.png`. Live: <https://pdf-flow-reader.sociobot.in/>. |

## Acceptance evidence

- Claims: 14 independently invoked commands, 28 desktop/mobile passes from a fresh GitHub clone.
- Full clean-clone suite: 15 unit and 48 browser passes; 2 expected desktop skips.
- Full live browser suite: 48 passes; 2 expected desktop skips.
- Accessibility/privacy/offline: Playwright axe found no serious/critical issues; demo traffic stayed same-origin GET-only; the service-worker-controlled demo reloaded offline.
- Mobile: 390 px Home, Demo, and Privacy have no horizontal overflow; applicable controls meet the 44 px regression checks.
- Performance: live Lighthouse 100/100/100/100, LCP 1.4 s, CLS 0, TBT 0 ms.
- Deployment identity: six key local/live SHA-256 pairs match in `.factory/polish-2-artifacts/deployment-identity.tsv`.

Result: every finding from both adversarial rounds is closed; nothing is deferred.

## Retry 2 verification — 2026-08-28

The controller reported that a prior full pass was interrupted by a Chromium
SIGSEGV during the mobile keyboard-controls claim. The product changes above
were retained. `playwright.config.ts` now explicitly uses one worker whenever
`CI=1`, so a factory CI run cannot re-enable parallel Chromium workers.

| Finding / acceptance item | Change retained or made | Fresh evidence |
| --- | --- | --- |
| F-1-1, F-2-1, F-2-2, F-2-3 | The complete 14-entry claim map remains present; catalog wording is now “Read long PDFs in one adjustable reading column,” mapped to `extraction-boundary` and `reader-adjustments`. | Fresh clone `/tmp/pdf-flow-reader-polish-2-final-dDzYk7`: every exact manifest grep command passed, 2 projects each (28 claim runs); `npm test` passed 15 unit tests and 48 browser tests with 2 expected mobile-only desktop skips. |
| F-1-2 through F-1-7 | Route focus/live region, canonical 404 metadata, shared chrome, “reading place,” clear shortcuts, and the concrete local-reading heading remain unchanged. | Live serial browser suite passed; `retry2-live-home/`, `retry2-live-demo/`, and `retry2-live-privacy/verify.json` record no console errors and one h1/main on cold pages. |
| Demo, privacy, offline, accessibility, mobile | Isolated `?demo=1`, banner/reset/start-real, local-only requests, service-worker offline reload, drawer/focus controls, and axe coverage remain unchanged. | Live serial suite includes `@claim:demo-sample`, `@claim:private-local`, `@claim:offline-reload`, keyboard, mobile, route, and axe tests; all passed under `CI=1` and one worker. |
| Routing, metadata, legal links, and 404 | Existing real routes, metadata, shared legal chrome, CSP, and response override remain deployed. | Cold checks: Home, `?demo=1`, `/demo/`, `/privacy/`, `/terms/`, `/404/` returned 200; `/does-not-exist-polish-2-retry2` returned 404 with `Page not found — PDF Flow Reader`. Live: <https://pdf-flow-reader.sociobot.in/>. |

Deployment: `d8d9feb1-feda-472d-8828-b7956e50ec38` (Succeeded). The repaired
CI configuration is commit `619ee50123e719c4da5671b8c03b52fdf448ffb6`.
