# Polish round 1 — finding closure

Reviewed inputs: `.factory/review-1.md`, all prior verification records, the prior handoff, `.factory/brief.json`, and `.factory/design.md`. Git history contains no earlier `review-*` or `polish-*` file.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — unlisted public claims | Added `extraction-boundary` and `extraction-confidence` to `.factory/claims.json`. Added one observable browser test for each. Rewrote the complex-layout statement as the instruction “Check the source PDF…”. | `@claim:extraction-boundary`; `@claim:extraction-confidence`; both passed from the clean clone and live in desktop/mobile. Live reader: <https://pdf-flow-reader.sociobot.in/?demo=1>. Screenshot: `.factory/polish-1-artifacts/live-demo-mobile.png`. |
| F-1-2 — route focus and announcement | Added navigation intent tracking, h1 focus, a polite atomic route status, and Back/Forward handling. | `route links focus and announce each new h1, including Back and the 404 route` passed locally, clean-clone, and live in desktop/mobile. It covers Privacy, Terms, Back, Home, Demo, and 404. |
| F-1-3 — missing 404 canonical | Added `https://pdf-flow-reader.sociobot.in/404/` as canonical and added the 404 Open Graph URL. | `publishes complete social metadata…`; `every document route uses…canonical metadata`; live <https://pdf-flow-reader.sociobot.in/404/>. An unknown live path returned HTTP 404. |
| F-1-4 — inconsistent route chrome | Created `src/chrome.ts` as the single shared header, footer, shortcut dialog, local-data dialog, live regions, and route behavior. Legal and 404 pages now retain all applicable controls and the same one-line/provenance footer. | `every document route uses the same header, footer, controls, and canonical metadata`; axe route sweep; live screenshots `.factory/polish-1-artifacts/live-home-desktop.png` and `.factory/polish-1-artifacts/live-privacy-mobile.png`. |
| F-1-5 — three saved-position names | Standardized visible saved-location wording to “reading place” in first-screen facts, steps, resume status, data dialog, privacy copy, README, claims, and erase confirmation. | `@claim:resume-place`; updated `.factory/copy-audit.md`; live Home screenshot `.factory/polish-1-artifacts/live-home-desktop.png`. |
| F-1-6 — ambiguous Shortcuts label | Renamed the accessible action to “Show keyboard shortcuts”; mobile keeps the same accessible name with the compact visible label “Keys”. | `every document route uses the same header, footer, controls, and canonical metadata`; mobile target regression; live screenshots for Home, Demo, and Privacy. |
| F-1-7 — context-free explanatory heading | Replaced it with “How PDF Flow Reader reads your PDF locally”. | Empty-state accessibility test; copy audit; live Home screenshot `.factory/polish-1-artifacts/live-home-desktop.png`. |

## Controller-required acceptance checks

- First screen: headline, audience, action, adjacent result, and three facts remain visible and plain.
- One-click demo: the landing action opens `/?demo=1`; banner, Reset demo, and Start for real persist. A cold landing no longer creates the real database.
- Demo isolation: `@claim:demo-sample` asserts that only `demo:pdf-flow-reader` exists before Start for real.
- Claims: all 12 manifest commands passed independently from a clean GitHub clone, and the manifest/tag bijection unit test passed.
- Routing and metadata: unique titles and canonicals, one h1, shared legal links, route focus/announcement, and real HTTP 404 passed locally and live.
- Mobile: no horizontal overflow; header controls and tested reader/footer targets are at least 44 px; mobile drawers remain inert when closed and restore focus.
- Accessibility/privacy/offline: live full suite passed; axe found no serious/critical issues; demo requests remained same-origin GETs; live offline reload restored the sample.
- Performance: live Lighthouse 100/100/100/100 with LCP 1.5 s, CLS 0, and TBT 0 ms.
- Deployment identity: SHA-256 matched local and live Home HTML, main/shared JS, CSS, service worker, and manifest.

## Evidence index

- Live verifier: `.factory/polish-1-artifacts/live-verify/verify.json`
- Live Lighthouse: `.factory/polish-1-artifacts/lighthouse-live.json`
- Local Lighthouse: `.factory/polish-1-artifacts/lighthouse-local.json`
- Live desktop Home: `.factory/polish-1-artifacts/live-home-desktop.png`
- Live mobile Demo: `.factory/polish-1-artifacts/live-demo-mobile.png`
- Live mobile Privacy: `.factory/polish-1-artifacts/live-privacy-mobile.png`

Result: every finding is closed; no severity is deferred.
