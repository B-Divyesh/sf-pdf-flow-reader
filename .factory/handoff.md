# PDF Flow Reader — repair 4 handoff

## Status

Complete. The three minor findings from `.factory/review-3.md` are closed. The deployed static PWA remains a local-only PDF reading adaptation layer for knowledge workers with low vision.

- Live: <https://pdf-flow-reader.sociobot.in/>
- Demo: <https://pdf-flow-reader.sociobot.in/?demo=1>
- Implementation candidate and deployed runtime: `14802df8a1d75b59306898cf9f8624177d3cde4f`
- Azure Static Web Apps deployment: `d08b02b2-2a3d-46e3-a589-f608fc6a1a07` — succeeded.
- Documentation/evidence SHA: `c19a69a258f711241cfde453b42f89fb4ae51335` (report-only; it does not change the deployed runtime).

## What changed

- Replaced the context-free landing heading **Inspect the flow** with **Check the text order**.
- Replaced the vague heading **Read your way** with **Adjust the reading view**.
- Replaced typography jargon and the conflicting public term **measure** with **line width** in the landing instruction.
- Added a browser regression that checks the three landing headings as a screen-reader heading list, follows the one-click sample path, and confirms that the visible reader control also says **Line width**.
- Strengthened `@claim:demo-sample`: it now seeds a real-library document, uses the sample, resets it, starts for real, and proves the real IndexedDB record is unchanged.
- Updated `.factory/claims.json` sandbox instructions and the complete landing copy audit. The catalog line remains the verb-first 48-character description: “Read long PDFs in one adjustable reading column.” It was copied to `/work/.evidence/catalog-description.txt`.

## Current disposition of earlier findings

| History item | Current disposition and evidence |
| --- | --- |
| Review 1 F-1-1 | Closed. Extraction-boundary and extraction-confidence are declared and passed from the clean clone. |
| Review 1 F-1-2 | Closed. The live browser suite covers route focus and polite heading announcements, including Back and 404. |
| Review 1 F-1-3 | Closed. Live `/404/` has the route metadata and canonical regression coverage. |
| Review 1 F-1-4 | Closed. Live Home, Demo, Privacy, Terms, and 404 share header/footer coverage. |
| Review 1 F-1-5 | Closed. Public saved-location copy remains **reading place**. |
| Review 1 F-1-6 | Closed. The visible control remains **Show keyboard shortcuts**. |
| Review 1 F-1-7 | Closed. The explanatory section remains **How PDF Flow Reader reads your PDF locally**. |
| Review 2 F-2-1 | Closed. The manifest-completeness assurance remains removed. |
| Review 2 F-2-2 | Closed. `no-api-key-or-backend` passed from the clean clone. |
| Review 2 F-2-3 | Closed. `artwork-provenance` passed from the clean clone. |
| Verification 2–4 blockers | Closed and rechecked: declared-claim coverage, mobile drawer/focus/target semantics, dialog labels, metadata/404 shell, import recovery, reader-state reset, installed offline start, loading h1, and serial browser execution are covered by the final local and live suites. |
| Review 3 F-3-1 | Closed. The landing step now says **Check the text order** and the new browser regression passes desktop and mobile. |
| Review 3 F-3-2 | Closed. The landing step now says **Adjust the reading view** and the new browser regression passes desktop and mobile. |
| Review 3 F-3-3 | Closed. The landing and reader both use **line width**; the new browser regression checks the matching visible control. |

## Verification

### Clean clone

Fresh clone: `/tmp/pdf-flow-reader-repair-4.Xso8ch` at `14802df`, followed by `npm ci` (80 packages added; 0 vulnerabilities).

- All 14 exact `.factory/claims.json` commands passed with `CI=1`: 28 desktop/mobile project runs.
- The strengthened demo claim proved the persistent sample banner, Reset demo, Start for real, and unchanged contents of a pre-existing real-library record.

### Local candidate

- `CI=1 npm test`: 15 unit tests passed; 50 browser tests passed; 2 expected desktop skips for mobile-only checks.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/` with `dist/index.html` at its root.
- `git diff --check`: passed.
- Factory URL verifier passed local Home: title, `lang=en`, one h1, main landmark, alt text, labelled buttons, and no console errors.
- Playwright Axe integration passed serious/critical checks for Home, Demo, all reader contrast treatments, Privacy, Terms, and 404.
- Local Lighthouse mobile Demo: Performance 99, Accessibility 100, Best Practices 100; FCP 1.4 s, LCP 2.0 s, TBT 0 ms, CLS 0, transfer 134 KiB.
- Initial main JavaScript is 9.55 KiB gzip and CSS is 4.95 KiB gzip. PDF.js remains lazy-loaded at 110.27 KiB gzip.

### Deployed HTTPS product

- Fresh `verify-url.sh` checks passed for Home, Demo, and Privacy. All had HTTP 200, correct route title, `lang=en`, one h1, a main landmark, complete image alternatives, labelled buttons, and no console errors.
- Fresh desktop and 390 × 844 phone screenshots show the job, audience, and **Try it with sample data** before scrolling. The one-click sample opens the realistic two-page routine with the persistent “Demo — sample data, nothing is saved to your real library” banner, Reset demo, and Start for real.
- Live serial Playwright suite: 50 passed, 2 expected desktop skips. It covers demo isolation/reset/real-data preservation, privacy requests, offline reload, keyboard reading, reader adjustments, mobile focus/targets, route structure, legal pages, 404, and Axe.
- Live Lighthouse mobile Demo: Performance 100, Accessibility 100, Best Practices 100; FCP 1.2 s, LCP 1.5 s, TBT 20 ms, CLS 0, transfer 133 KiB.
- The deployed main JS, shared JS, shared CSS, service worker, and manifest all matched the local `dist/` SHA-256 bytes.
- Home, Privacy, Terms, `/404/`, manifest, and service worker returned HTTP 200. An unknown route returned the designed page with HTTP 404.
- HTTPS headers include CSP, HSTS, Referrer-Policy, Permissions-Policy, `X-Content-Type-Options`, and frame denial.

Evidence is in `.factory/repair-4-artifacts/`.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
```

Run an individual public claim with the exact `test` command in `.factory/claims.json`.

## Known scope boundaries

No product finding remains. Scanned/image-only PDFs require an external OCR workflow, complex layouts must be checked against the source PDF, and owner text-copy restrictions are not bypassed. These are intentional limits from the brief.

The standalone `@axe-core/cli` could not launch its Selenium-managed Chrome in this worker, even when pointed at the Playwright executable. This is a worker-tool limitation, not an accessibility result: the repository’s `@axe-core/playwright` integration ran and passed the same local and live routes.
