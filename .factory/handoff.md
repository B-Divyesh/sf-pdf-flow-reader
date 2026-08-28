# PDF Flow Reader — repair handoff

## Release status: DEPLOYED

Repair work order: `pdf-flow-reader-repair-2`. Base verifier report commit: `9abc7aab239c1df55273d9e04aef65a1c8f12333`. Failed candidate: `baa6d122b537d1e0f84c0e2d5b064a7d703782f1`.

Every release blocker and additional finding in `.factory/verification-2.md` is repaired. The researched scope, local-first PWA artifact, static deployment class, and previously passing PDF flows remain intact.

## Repairs

- Expanded `.factory/claims.json` from five to ten public claims. Each ID has exactly one tagged Playwright test. New coverage performs export/erase/import, unlocks a real encrypted fixture, inspects the exact IndexedDB record, rejects a real copy-restricted fixture, reports a generated blank PDF without cloud OCR, applies every reading adjustment, and observes privacy/network surfaces.
- Closed mobile drawers now use `inert` and `aria-hidden`; their controls leave the accessibility tree and Tab order. Close and Escape return focus to the opener. Selecting a heading closes the drawer and focuses the chosen reading block.
- Replaced blank 36px mobile reading controls with visible Previous/Next labels and 44px targets. The reported wordmark, Demo link, range inputs, and footer links also meet the 44px target floor.
- Added a signal-yellow focus treatment for dark and black reader surfaces. Tests assert the rendered outline color in both modes.
- Named all native dialogs with `aria-labelledby`. The encrypted-PDF flow still moves focus to the password field and clears the entered password when the view is rebuilt.
- Added Open Graph and Twitter card metadata to every route. `public/assets/social-card.jpg` is a reproducible 1200 × 630 crop of the product’s original reflow-gate art; provenance is recorded in `.factory/design.md`.
- Put the designed 404 inside the shared product header, navigation, and footer.
- Normalized the first detected document heading to level two, preserving a valid heading outline when mobile drawers are hidden.
- Pinned the mobile browser project to exactly 390 × 844 and expanded the copy audit.

## Verification evidence

Run from `/work/repo`:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
while IFS=$'\t' read -r id command; do bash -lc "$command"; done < <(node -e "for (const c of require('./.factory/claims.json')) console.log(c.id+'\\t'+c.test)")
```

- Clean `npm ci`: PASS — 80 packages, 0 vulnerabilities.
- All ten exact claim commands: PASS in desktop and 390 × 844 mobile projects.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm test`: PASS — 8 unit/config tests; 30 Playwright passes; 2 expected desktop skips for mobile-only checks.
- `npm run build`: PASS — `dist/` contains all routes, PWA assets, response policy, sample PDF, social card, and content-derived service worker.
- Initial app JS: 31.59 KB raw / 11.21 KB gzip. Initial CSS: 19.07 KB raw / 4.90 KB gzip. PDF.js stays lazy at 110.27 KB gzip. The 390px hero AVIF is 22,742 bytes.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo/`: HTTP 200; title, `lang`, one h1, main, alt text, button names, and console PASS; 705ms local load.
- Lighthouse mobile `/demo/`: Performance **99**, Accessibility **100**, Best Practices **100**, LCP **2.1s**, CLS **0**, total blocking time **0ms**.
- Playwright Axe: no serious or critical findings on home, reader, all four contrast modes, Privacy, Terms, or 404.
- Keyboard: J/K, brackets, T, H, Escape, Space, Shift+Space, drawer focus restoration, and closed-drawer Tab exclusion PASS.
- Product flows: sample, normal extraction, encrypted/wrong-password path, restricted PDF, image-only PDF, malformed PDF, local resume, adjustments, export/import/erase, privacy observation, and recovery PASS.
- Offline/update: a fresh service-worker-controlled demo reloads offline with its sample and local state. The live cache changed from `pdf-flow-reader-5b5dfa03d15e` to `pdf-flow-reader-a271f7ea36a4`; the in-app update signal appeared, control remained active, and the updated demo reloaded offline.
- Local artifacts: `.factory/repair-artifacts/local/` contains desktop/mobile screenshots, `verify.json`, Lighthouse JSON, and the local `dist` SHA-256 manifest.

## Known limits

- There is no OCR. Image-only PDFs receive an explicit local error.
- Best-effort extraction may not preserve complex columns, tables, equations, footnotes, or source reading order. The reader does not claim to repair or certify a PDF.
- The original PDF is not retained. Comparing against the source requires reopening it in another viewer.
- Local processing is capped at 100 MB to limit browser memory use.

## Deployment

Repair commit `2b95f93cadccb0b20daee0ecdfd9b71eb6876373` was pushed to `origin/main`. The corresponding `dist/` was deployed on 2026-08-28 with `/opt/fleet/lib/deploy-static.sh pdf-flow-reader ./dist` to Azure Static Web App `sf-pdf-flow-reader` in `centralus` (deployment ID `589b12cf-fd95-4f13-ad09-a1afa6ce0b90`). Production URL: `https://pdf-flow-reader.sociobot.in/`.

Live verification:

- Factory URL verification on `/demo/`: HTTP 200, 881ms load, correct title/lang/h1/main, no missing alts or unnamed buttons, and no console errors.
- All 37 publicly served build files match the local `dist/` SHA-256 byte-for-byte.
- CSP, Permissions-Policy, HSTS, frame denial, nosniff, and Referrer-Policy are present. Hashed assets are immutable; `sw.js` is no-cache; the manifest uses `application/manifest+json`. HTTP redirects to HTTPS. Unknown routes return the designed page with HTTP 404.
- Every crawled internal link returns 200. The operator link at `https://sociobot.in` returns 200.
- Live Axe: zero serious/critical findings on home, Privacy, Terms, 404, and all four reader treatments.
- Live Lighthouse mobile `/demo/`: Performance **100**, Accessibility **100**, Best Practices **100**, LCP **1.6s**, CLS **0**, total blocking time **40ms**.
- Live evidence is stored in `.factory/repair-artifacts/live/`.
