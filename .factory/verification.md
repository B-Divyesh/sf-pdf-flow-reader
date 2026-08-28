# Independent verification — FAIL

**Candidate:** `2daa73473e8ae03cc9e9913df33025d4c3d22bc6`  
**Live URL:** https://pdf-flow-reader.sociobot.in/  
**Verified:** 2026-08-28 (fresh `npm ci`, Node 22.23.2 / npm 10.9.8)

## Release decision

**FAIL.** The candidate is a working local PDF-reader prototype, but it fails two mandatory factory acceptance gates before feature quality is considered:

1. `.factory/claims.json` is absent. There were therefore no declared claim tests to run from the demo entry point. This is explicitly release-blocking.
2. The cold live first screen has no one-click **“Try it with sample data”** action. `/demo` and `/?demo=1` both render the ordinary empty upload screen. They contain no sample action and no “Demo — sample data, nothing is saved” banner. `.factory/demo.md` is also absent, and the only IndexedDB database observed is the real namespace, `pdf-flow-reader`, not a `demo:` namespace.

### First-read result (cold live page)

It appears to turn a chosen PDF’s selectable text into an adjustable single reading column. It asks the visitor to click **“Choose a PDF”** first. It does **not** say on the first screen that it is for knowledge workers with low vision, and it provides no sample-PDF demo. The missing demo alone fails the first-read/demo contract.

## Required claims check

| Check | Result | Evidence |
| --- | --- | --- |
| `.factory/claims.json` exists | **FAIL** | File was absent in the clean candidate checkout. |
| Run every declared claim test through demo | **BLOCKED / FAIL** | No manifest or demo entry point exists. |
| Claim-test tags | **FAIL** | `rg '@claim:' tests README.md src .factory` returned no tags. |
| Cross-check claim-like copy | **FAIL** | The live app/README promise “No upload,” “No tracking,” “Works offline,” “Remembers your place,” local-only processing, and keyboard support, without entries in the required manifest. |

The live normal flow was additionally observed to make only same-origin requests, but that is **not** an acceptable substitute for the required demo-scoped privacy claim test.

## What passed

### Clean checkout quality gates

- `npm ci`: passed; 80 packages installed; audit reported 0 vulnerabilities.
- `npm run test:unit`: **3/3 passed**.
- `npx playwright test --project=desktop`: **4/4 passed**.
- `npx playwright test --project=mobile`: **4/4 passed**.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/`.
- No lint script is defined in `package.json`.

The Playwright suites exercised a real generated PDF, extraction, keyboard navigation, text-size change and persistence/resume, invalid-PDF recovery, axe serious/critical checks, the skip link, 390px-class mobile overflow, and an offline reload. Independent spot checks also confirmed text-size keyboard bounds of **18px–36px**, a visible 4px focus outline, a confidence warning, and a blank/image-only PDF’s honest recovery path.

### Live deployment and privacy observations

- The deployment matches the candidate. SHA-256 matched local `dist/` for `index.html`, app/CSS/PDF chunks, worker, service worker, manifest, offline page, and privacy/terms HTML.
- A fresh live upload/extraction run rendered `LIVE FLOW CHECK`, logged no page/console errors, and made only same-origin requests (the app shell, local illustration, lazy PDF.js chunk, and worker).
- No sign-in, backend API, or server-side product endpoint is present; rate-limit and Entra checks are not applicable.
- Local PWA check: a service worker controlled a reload, cache `pdf-flow-reader-v1` was present, and offline reload passed in both local Playwright projects.
- Mobile check at 390×844: no horizontal overflow; `prefers-reduced-motion: reduce` reduced the upload-zone transition to `1e-05s`; no console errors.
- Axe: the provided desktop and mobile empty/reader suite reported no serious or critical violations.

### Performance/build evidence

- Initial `main` JavaScript: 28.32 kB raw / 10.08 kB gzip; shared bootstrap JS: 0.75 kB raw / 0.44 kB gzip.
- Initial CSS: 17.80 kB raw / 4.73 kB gzip; no web-font payload.
- PDF.js is lazy after file selection: 375.38 kB raw / 110.27 kB gzip. The worker is 1.04 MB raw.
- Responsive 720px AVIF hero is 22,742 bytes. The initial app budget is within the stated 200 kB JS / 50 kB CSS budget.

## Defects

### Blocker

- **Missing claims manifest and executable claim coverage.** No `.factory/claims.json`; all public reliance claims are unlisted and no `@claim:` tests exist. This directly violates the claims contract.
- **No one-click, isolated sample-data demo.** No visible sample action, shipped sample, demo banner/reset/start-real controls, demo storage namespace, direct demo route behavior, or `.factory/demo.md`. The first screen therefore fails the required try-before-upload experience.

### High

- **First screen does not identify the intended low-vision audience in plain words.** It explains the reflow effect, but not who it serves. It also uses a product/metaphor headline (“From rigid pages to readable flow”) rather than the required plain job headline.

### Medium

- **Response policy is incomplete.** Live responses include HSTS, `nosniff`, and Referrer-Policy, but no Content-Security-Policy, Permissions-Policy, X-Frame-Options, or cross-origin isolation policy. This does not meet the stated security-header requirement.
- **Caching is not production-grade.** Every inspected hashed asset and `sw.js` returned `Cache-Control: public, must-revalidate, max-age=30`, rather than a long-lived immutable policy for hashed assets. The manifest is served as `application/octet-stream`, not `application/manifest+json` or `application/json`.
- **There is no real 404 route.** `/missing-page` returns the normal landing shell with HTTP 200; the required designed 404 and correct status are absent.
- **Service-worker cache version is hard-coded to `pdf-flow-reader-v1`.** The built worker precaches successfully, but a new build does not derive a new cache name. Its advertised update behavior could retain stale entries absent a manual source edit.

### Low

- The landing header has no navigation landmark or Demo link, and the footer lacks the requested Param Factory/build identifier.

## Reproduction commands

```sh
npm ci
npm run test:unit
npx playwright test --project=desktop
npx playwright test --project=mobile
npm run typecheck
npm run build
npm run preview
```

Then inspect `https://pdf-flow-reader.sociobot.in/?demo=1`: it shows the ordinary upload screen, rather than a demo. The report’s desktop cold-page screenshot was captured at `/tmp/pdf-flow-live-cold-desktop.png` during verification.

## Required remediation before re-verification

1. Add a complete `.factory/claims.json`, one observable `@claim:<id>` test per public claim, and run all entries from a fresh demo context.
2. Ship a direct `/demo` or `?demo=1` route with a realistic bundled sample PDF, a visible first-screen “Try it with sample data” action, persistent demo/reset/start-real banner, isolated `demo:` storage, and `.factory/demo.md`.
3. Rewrite the first-screen heading/subtitle to name the low-vision reader and the concrete job in plain words.
4. Add the required security, cache, manifest MIME, 404, and service-worker-version deployment configuration; re-run live header and update checks.
