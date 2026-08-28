# Adversarial first-read review 1 — PDF Flow Reader

Reviewed 2026-08-28 against <https://pdf-flow-reader.sociobot.in/> from fresh desktop and 390 × 844 browser contexts. Product code was not changed.

## Verdict: FAIL

The first-read, sample demo, declared claim tests, offline behavior, and primary reader flow pass. The findings below remain, so this is not a zero-finding review.

## Cold first read

Before scrolling, at both sizes, I understood the product as a local reader that turns a selectable long PDF into one adjustable reading column. It is for “knowledge workers with low vision,” and the first action is **Try it with sample data**. The adjacent text, “The sample opens now,” says what happens next. This gate passes.

The 390 px view had no horizontal overflow or load-time console error. The visual system is distinct from a generic SaaS landing page: the ink rules, paper surface, signal-yellow controls, mechanical reflow illustration, and reading-first layout match the documented desk-tool direction.

## Copy audit

Word counts treat visible text separated by spaces as words. Labels and headings are included so the audit is complete; fragment labels are identified as such.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to reader | 3 | Pass — action label |
| PDF FLOW READER | 3 | Pass — wordmark |
| Local only | 2 | Pass — fragment |
| Demo | 1 | Pass — link |
| Privacy | 1 | Pass — link |
| Shortcuts | 1 | F-1-6 |
| Manage local data | 3 | Pass — action label |
| You’re offline. | 2 | Pass |
| The local reader stays available. | 5 | Pass |
| A steadier way through PDFs | 5 | Pass — eyebrow |
| Read long PDFs in a steady column. | 7 | Pass |
| For knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view. | 17 | Pass |
| Try it with sample data | 5 | Pass — result-naming action |
| Choose a PDF | 3 | Pass — result-naming action |
| The sample opens now. | 4 | Pass |
| Your PDF is processed on this device. | 7 | Pass |
| No upload | 2 | Pass — fact |
| Remembers your place | 3 | F-1-5 |
| Works offline | 2 | Pass — fact |
| Paper fragments feed into a blue mechanical press and emerge as one orderly column of text. | 16 | Pass — image alternative |
| We extract readable text. | 4 | F-1-1 |
| We never alter or certify the source file. | 8 | F-1-1 |
| What happens here | 3 | Pass — eyebrow |
| The document stays yours. | 4 | F-1-7 |
| Open locally | 2 | Pass — step heading |
| Your browser reads the file. | 5 | Pass |
| It never travels to a server. | 6 | Pass |
| Inspect the flow | 3 | Pass — step heading |
| We show a confidence note because extraction can get reading order wrong. | 12 | F-1-1 |
| Read your way | 3 | Pass — step heading |
| Set size, spacing, measure, and contrast. | 6 | Pass |
| Return at the same paragraph. | 5 | F-1-5 |
| No upload. | 2 | Pass |
| No tracking. | 2 | Pass |
| Built by Param Factory · v1.0.0 | 5 | Pass — attribution |
| Original AI-generated artwork. | 3 | Pass — provenance credit |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Read long PDFs in a steady column. | 7 | Pass |
| PDF Flow Reader is for knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view. | 21 | Pass |
| Try it with sample data before opening your own PDF. | 10 | Pass |
| Process selectable text in your browser, with no document upload or tracking request. | 13 | Pass |
| Adjust text size, spacing, line width, typeface, and contrast. | 9 | Pass |
| Use a heading map and keyboard controls: J/K, [ / ], T, H, Space, and Shift+Space. | 14 | Pass |
| Save the last reading place and settings in this browser; export, import, or erase that local library. | 17 | F-1-5 |
| Reload offline after the first visit. | 5 | Pass |
| Scanned/image-only PDFs need OCR and are reported honestly as unsupported. | 9 | Pass — declared scan-report limitation |
| Complex tables, equations, columns, and footnotes may not preserve the author’s intended order. | 13 | F-1-1 |
| Owner restrictions on text copying are respected. | 7 | Pass — declared copy-restrictions behavior |
| Requires Node.js 20 or newer. | 5 | Pass — setup instruction |
| Then open the local URL printed by Vite. | 7 | Pass — setup instruction |
| No API keys or backend are required. | 7 | Pass — setup instruction |
| The Playwright version is pinned to the factory-provided browser version. | 10 | Pass — developer note |
| Production deployment should publish dist/ as a static site, preserving /demo/, /privacy/, /terms/, and the included staticwebapp.config.json response policy. | 18 | Pass — deployment instruction |
| There are no analytics, trackers, cloud OCR calls, CDN scripts, or remote fonts. | 13 | Pass — declared private-local behavior |
| The demo uses a separate demo:pdf-flow-reader IndexedDB database and never touches a regular library. | 14 | Pass — declared demo-sample behavior |
| Every public reliance claim and its executable browser test lives in .factory/claims.json. | 12 | F-1-1 |
| The researched product scope lives in .factory/brief.json, the visual and asset rationale in .factory/design.md, and verification notes in .factory/handoff.md. | 19 | Pass — repository map |
| MIT © 2026 Sociobot (Param Factory). | 5 | Pass — license notice |

No audited sentence exceeds 22 words and no banned marketing word appears. The concerns are unlisted claims, terminology, an ambiguous button label, and a context-free heading—not length.

## Demo and sandbox verification

- Clicking **Try it with sample data** opened `/demo/` in one click and immediately displayed the two-page “QUIET READING ROUTINE” in the reader.
- The persistent banner said “Demo — sample data, nothing is saved to your real library,” with **Reset demo** and **Start for real**.
- In a fresh live context, the only database before and after Reset was `demo:pdf-flow-reader`; the normal `pdf-flow-reader` database was not created until Start for real returned to the normal app, and it contained no demo record.
- The full demo request trace contained same-origin GET requests only, including the bundled sample PDF; there was no request body or cross-origin request.
- After service-worker control, switching the fresh production context offline and reloading `/demo/` retained the sample and showed “You’re offline. The local reader stays available.”

## Declared claims and local quality gates

After a clean `npm ci`, each exact command in `.factory/claims.json` passed in the desktop and mobile Playwright projects:

| Claim id | Result |
| --- | --- |
| demo-sample | PASS |
| private-local | PASS |
| offline-reload | PASS |
| resume-place | PASS |
| keyboard-controls | PASS |
| local-data-control | PASS |
| stored-data-scope | PASS |
| scan-report | PASS |
| copy-restrictions | PASS |
| reader-adjustments | PASS |

`npm test` passed (15 unit tests; 36 browser tests; 2 intentional desktop skips for mobile-only checks). `npm run typecheck`, `npm run lint`, and `npm run build` also passed, and `dist/` was produced. Live axe scans at 390 px found no serious or critical violations on `/`, `/demo/`, `/privacy/`, `/terms/`, or the not-found route.

## Earlier review and handoff findings

There are no earlier `review-*` or `polish-*` files. I read `verification.md`, `verification-2.md`, `verification-3.md`, `verification-4.md`, `verification-5.md`, and the prior handoff. Their reported failures are fixed in the current code and live product: the claim manifest and isolated demo exist; mobile drawers are inert and restore focus; visible controls meet the tested mobile target checks; dialog labels, metadata, social card, 404 shell, import validation, reader-state reset, installed offline start behavior, loading h1, and PWA update behavior are covered by the current suite. The earlier intermittent full-suite failure did not reproduce: this review’s full `npm test` passed.

## Findings

### High

#### F-1-1 — Unlisted public claims remain in the landing copy and README

**Location and quote:** landing figcaption, “We extract readable text. We never alter or certify the source file.”; landing step 2, “We show a confidence note because extraction can get reading order wrong.”; README, “Complex tables, equations, columns, and footnotes may not preserve the author’s intended order.” The README also says, “Every public reliance claim and its executable browser test lives in .factory/claims.json.”

**Why this fails:** none of the ten manifest `claim` fields lists extraction fidelity, the non-alteration/non-certification boundary, the confidence warning, or the complex-layout limitation. Existing tests incidentally exercise some of these states, but they are not declared claims with the promised observable outcome. A visitor is being asked to rely on exact limits without the required claim-to-test entry.

**Concrete fix:** add separately tagged manifest entries and demo-scoped tests for the confidence/boundary behaviors, or remove/rewrite the unsupported promises. For the complex-layout sentence, prefer a direct instruction such as “Check the source PDF for tables, equations, columns, and footnotes,” unless an observable limitation test can be defined. Update the README’s “Every public reliance claim…” sentence only after the manifest is complete.

### Medium

#### F-1-2 — Route changes leave keyboard focus on `<body>` and do not announce the new page

**Location and evidence:** on the live mobile site, selecting the header **Privacy** link navigated to `/privacy/`, but `document.activeElement` was `<body>`, not `<h1>Privacy, kept local.</h1>`. Browser Back returned to `/` with focus again on `<body>`. The legal-page source has no route announcement region or focus handoff.

**Why this fails:** a keyboard or screen-reader visitor receives neither a focus target nor an announcement after navigation, contrary to the route-change requirement. It makes the visitor rediscover where the new content begins.

**Concrete fix:** on each document route, programmatically focus a temporarily focusable h1 after load and publish its page name in an `aria-live="polite"` region. Verify Privacy, Terms, Demo, Home, 404, and Back/Forward in a Playwright test.

### Low

#### F-1-3 — The explicit `/404/` route has no canonical link

**Location and evidence:** live `/404/` has a title, description, Open Graph data, favicon, h1, main, header, and footer, but no `<link rel="canonical">`.

**Why this fails:** this is the only inspected first-party document route that misses the required canonical metadata pattern.

**Concrete fix:** add `<link rel="canonical" href="https://pdf-flow-reader.sociobot.in/404/">` to `404/index.html` (while retaining `noindex`).

#### F-1-4 — Header and footer are not consistent across routes

**Location and quote:** Home header includes “● Local only”, “Shortcuts”, and “Manage local data”; `/privacy/` and `/terms/` omit all three. Home footer says “No upload. No tracking.” and “Original AI-generated artwork.”; legal footers instead say “Files stay on this device.” and omit the asset credit.

**Why this fails:** the site-structure contract calls for a consistent header/footer. The state changes make the legal pages feel detached from the reader and hide the local-data control where a privacy visitor is most likely to seek it.

**Concrete fix:** render one shared chrome component on every route, retaining the wordmark, Demo/Privacy links, Privacy/Terms footer links, product one-liner, Param Factory attribution, version, and the same applicable controls.

#### F-1-5 — One saved-position concept has three names

**Location and quote:** landing “Remembers your place” and “Return at the same paragraph”; README “Save the last reading place”; local-data copy uses “reading positions.”

**Why this fails:** the product stores and restores a block index, which can be a heading or paragraph. Alternating among place, paragraph, and position makes the saved behavior sound less precise.

**Concrete fix:** use **reading place** everywhere, for example rewrite the landing step as “Return to the same reading place.”

#### F-1-6 — “Shortcuts” is not a result-naming button label

**Location and quote:** header button “Shortcuts”.

**Why this fails:** the label does not tell a first-time visitor what activating it will show.

**Concrete fix:** rename it **Show keyboard shortcuts**.

#### F-1-7 — The main explanatory heading lacks a concrete subject

**Location and quote:** landing h2 “The document stays yours.”

**Why this fails:** heard alone in a heading list, it does not identify the local-PDF process or the information that follows.

**Concrete fix:** use **How PDF Flow Reader reads your PDF locally** and retain the three existing steps beneath it.

## Structure, links, and scope checks

- `/`, `/demo/`, `/privacy/`, `/terms/`, and the unknown-route 404 have one h1, one main, `lang="en"`, descriptions, Open Graph/Twitter metadata, favicon, and no 390 px horizontal overflow. Titles follow the required route pattern.
- Unknown routes return the designed 404 with HTTP 404; its recovery links work. All first-party navigational links and the external `sociobot.in` contact link returned 200. `robots.txt` and `sitemap.xml` exist and list the public pages.
- No additional AI feature is expected from the brief: cloud OCR or a decorative AI layer would conflict with the explicit local-only/no-cloud-OCR boundary. Export, import, erase, sample demo, and offline support are already present.

## What would make this perfect

Declare and test the remaining public extraction/limitation claims, make route changes announce and focus their h1, then make the 404 metadata and shared shell/copy consistent. Re-run the exact claim commands plus the full suite after those changes.
