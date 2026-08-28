# Adversarial first-read review 2 — PDF Flow Reader

Reviewed 2026-08-28 from fresh Chromium contexts at 390 × 844 and 1440 × 1000 against <https://pdf-flow-reader.sociobot.in/>. Product code was not changed.

## Verdict: FAIL

The first-read gate, reader demo, declared behaviour, routing, accessibility smoke checks, and live privacy/offline checks pass. Three public claims remain outside `.factory/claims.json`, including a recurrence of the prior review's claim-manifest finding. This is therefore not a zero-finding review.

## Cold first read

Before scrolling, at both sizes, I understood this as a local reader that turns selectable long-PDF text into one adjustable column. It is for “knowledge workers with low vision,” and the first action is **Try it with sample data**; “The sample opens now” describes the result. The 390 px first screen has no horizontal overflow or console/page error. This gate passes.

The visual identity is distinct rather than a generic SaaS template: warm newsprint, heavy ink rules, fluorescent-yellow controls, and the mechanical reflow artwork support the documented desk-tool thesis.

## Copy audit

Word counts use visible whitespace-separated words. Labels/fragments are included for completeness and marked as such. No landing or README sentence exceeds 22 words. No banned plain-words marketing term, jargon-only heading, inconsistent reading-place term, or non-result-naming action was found.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to reader | 3 | Pass — action label |
| PDF FLOW READER | 3 | Pass — wordmark |
| Local only | 2 | Pass — fragment |
| Demo | 1 | Pass — link |
| Privacy | 1 | Pass — link |
| Show keyboard shortcuts | 3 | Pass — result-naming action |
| Manage local data | 3 | Pass — action label |
| A steadier way through PDFs | 5 | Pass — eyebrow |
| Read long PDFs in a steady column. | 7 | Pass — h1 |
| For knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view. | 17 | Pass |
| Try it with sample data | 5 | Pass — result-naming action |
| Choose a PDF | 3 | Pass — result-naming action |
| The sample opens now. | 4 | Pass |
| Your PDF is processed on this device. | 7 | Pass — declared private-local claim |
| No upload | 2 | Pass — declared private-local fact |
| Remembers your reading place | 4 | Pass — declared resume-place fact |
| Works offline | 2 | Pass — declared offline-reload fact |
| Paper fragments feed into a blue mechanical press and emerge as one orderly column of text. | 16 | Pass — image alternative |
| We place extracted text in one reading column. | 8 | Pass — declared extraction-boundary claim |
| We never alter or certify the source PDF. | 8 | Pass — declared extraction-boundary claim |
| What happens here | 3 | Pass — eyebrow |
| How PDF Flow Reader reads your PDF locally | 8 | Pass — concrete h2 |
| Open locally | 2 | Pass — step heading |
| Your browser reads the file. | 5 | Pass — declared private-local claim |
| It never travels to a server. | 6 | Pass — declared private-local claim |
| Inspect the flow | 3 | Pass — step heading |
| We show a confidence note. | 5 | Pass — declared extraction-confidence claim |
| Check the source PDF when meaning matters. | 7 | Pass — declared extraction-confidence claim |
| Read your way | 3 | Pass — step heading |
| Set size, spacing, measure, and contrast. | 6 | Pass — declared reader-adjustments claim |
| Return to the same reading place. | 7 | Pass — declared resume-place claim |
| Terms | 1 | Pass — link |
| Read long PDFs in a steady column. | 7 | Pass — footer one-line |
| No upload. | 2 | Pass — declared private-local claim |
| No tracking. | 2 | Pass — declared private-local claim |
| Built by Param Factory · v1.0.0 | 5 | Pass — attribution/version |
| Original AI-generated artwork. | 3 | F-2-3 |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| PDF Flow Reader | 3 | Pass — document title |
| Read long PDFs in a steady column. | 7 | Pass |
| PDF Flow Reader is for knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view. | 21 | Pass |
| Try it with sample data before opening your own PDF. | 10 | Pass — declared demo-sample claim |
| Process selectable text in your browser, with no document upload or tracking request. | 13 | Pass — declared private-local claim |
| Adjust text size, spacing, line width, typeface, and contrast. | 9 | Pass — declared reader-adjustments claim |
| Use a heading map and keyboard controls: J/K, [ / ], T, H, Space, and Shift+Space. | 14 | Pass — declared keyboard-controls claim |
| Save your reading place and settings in this browser; export, import, or erase that local library. | 17 | Pass — declared resume-place/local-data-control claim |
| Reload offline after the first visit. | 5 | Pass — declared offline-reload claim |
| Scanned/image-only PDFs need OCR and are reported as unsupported. | 9 | Pass — declared scan-report claim |
| Check the source PDF for tables, equations, columns, and footnotes. | 10 | Pass — declared extraction-confidence boundary |
| Owner restrictions on text copying are respected. | 7 | Pass — declared copy-restrictions claim |
| Requires Node.js 20 or newer. | 5 | Pass — setup instruction |
| Then open the local URL printed by Vite. | 7 | Pass — setup instruction |
| No API keys or backend are required. | 7 | F-2-2 |
| The Playwright version is pinned to the factory-provided browser version. | 10 | Pass — developer setup note |
| Production deployment should publish dist/ as a static site, preserving /demo/, /privacy/, /terms/, and the included staticwebapp.config.json response policy. | 18 | Pass — deployment instruction |
| There are no analytics, trackers, cloud OCR calls, CDN scripts, or remote fonts. | 13 | Pass — declared private-local claim |
| The ?demo=1 demo uses a separate demo:pdf-flow-reader IndexedDB database and never touches a regular library. | 14 | Pass — declared demo-sample claim |
| Every public reliance claim and its executable browser test lives in .factory/claims.json. | 12 | F-2-1 |
| The researched product scope lives in .factory/brief.json, the visual and asset rationale in .factory/design.md, and verification notes in .factory/handoff.md. | 19 | Pass — repository map |
| MIT © 2026 Sociobot (Param Factory). | 5 | Pass — license notice |

## Demo and sandbox checks

- Clicking **Try it with sample data** once at both sizes opened `/?demo=1` directly into the two-page **A QUIET READING ROUTINE** reader, with headings, prose, position controls, settings, and keyboard hints already present.
- The persistent banner visibly stated **“Demo — sample data, nothing is saved to your real library.”** and included **Reset demo** and **Start for real**.
- In a fresh context, the only IndexedDB database after entering and resetting the demo was `demo:pdf-flow-reader`; the regular `pdf-flow-reader` database was absent. Reset returned the reader to “Page 1 of 2” and re-opened the bundled sample.
- The complete live demo request trace contained same-origin GETs only: document shell, local assets, PDF.js worker/chunk, icon, and bundled sample PDF. It sent no request body and made no cross-origin request.
- After a service-worker-controlled demo visit, setting the browser context offline and reloading the live demo produced HTTP 200, retained the sample reader, and showed “You’re offline. The local reader stays available.”

## Declared claims and local quality gates

A fresh clone was created at `/tmp/pdf-flow-review-2.rQmrNr/repo`; `npm ci` passed. Every exact command from `.factory/claims.json` passed in both desktop and mobile projects (24 claim-project runs):

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
| extraction-boundary | PASS |
| extraction-confidence | PASS |

The current worktree also passed `npm run typecheck`, `npm run lint`, and `npm run build`; `dist/` was produced. The source contains exactly one `@claim:<id>` test for each of the 12 manifest ids.

## Earlier review and handoff findings

I read `.factory/review-1.md`, `.factory/polish-1.md`, all verification records, and the prior handoff, then checked the live site and source rather than relying on their marked status.

- **F-1-2:** fixed. A live Privacy navigation focused the new h1 and announced “Opened Privacy, kept local.” Back focused/announced the home h1. `src/chrome.ts` implements the focus/announcement handling.
- **F-1-3:** fixed. Live `/404/` has canonical `https://pdf-flow-reader.sociobot.in/404/` and matching OG URL.
- **F-1-4:** fixed. Home, Demo, Privacy, Terms, and 404 share the same header controls and footer links/attribution/version in `src/chrome.ts`.
- **F-1-5:** fixed. The public product copy now consistently uses “reading place.”
- **F-1-6:** fixed. The accessible action is “Show keyboard shortcuts.”
- **F-1-7:** fixed. The landing h2 is “How PDF Flow Reader reads your PDF locally.”
- **F-1-1:** not fully fixed; it reopens below because the README still makes an unlisted assertion that every public reliance claim is listed and tested.

## Structure and link checks

- `/`, `/?demo=1`, `/demo/`, `/privacy/`, `/terms/`, `/404/`, and an unknown live route have `lang="en"`, exactly one h1, exactly one main, descriptions, canonical, OG image, favicon, and no console/page error in the checked views. Their titles follow the route pattern, including **Demo — PDF Flow Reader**, **Privacy — PDF Flow Reader**, and **Page not found — PDF Flow Reader**.
- An unknown live route returned HTTP 404 with the designed recovery page. Address-bar demo/legal deep links reload correctly. Header navigation, browser Back, focus handoff, and polite announcement work.
- The live crawl of every rendered link across Home, Demo, Privacy, Terms, and 404 returned HTTP 200 (or an intentional same-page hash); `robots.txt` and `sitemap.xml` list public routes.
- The live response supplies CSP, `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy, and frame protection. The source/test suite exercises the expected keyboard, focus, mobile drawer, and axe baseline behaviours.
- The brief does not imply a missing AI feature: cloud OCR would conflict with its explicit local-only/no-cloud-OCR boundary. Import, export, erase, offline reading, and the isolated sample are already present. No runtime AI provider key or decorative AI feature was found.

## Findings

### Blocking

#### F-2-1 — F-1-1 remains open: the README’s manifest-completeness assurance is itself an unlisted public claim

**Location and quote:** README, Privacy and design: “Every public reliance claim and its executable browser test lives in `.factory/claims.json`.”

**Why this fails:** this sentence was explicitly included in F-1-1 and remains in the public README, but no `.factory/claims.json` entry names or tests the claimed manifest completeness. It is an assurance a visitor/deployer is asked to trust, so the prior finding is only partially repaired. Per the required history check, this recurrence is blocking.

**Concrete fix:** either remove the sentence or add a `claim-manifest-complete` entry with an observable manifest-to-copy/tag validation test. The test must scan the public reliance copy and verify one declared claim and exactly one tagged test for each. Keep the sentence only after that test passes.

### Medium

#### F-2-2 — README promises a keyless/backend-free product without a declared test

**Location and quote:** README, Run locally: “No API keys or backend are required.”

**Why this fails:** this is a concrete reliance claim for a person deciding whether they can run the product, but no manifest entry claims or tests it. The existing private-local test proves the demo makes same-origin requests; it does not demonstrate that a fresh local run needs neither environment key nor backend.

**Concrete fix:** add a `no-api-key-or-backend` manifest entry and a clean-process test that starts the static app with no relevant environment variables, completes the sample flow, and verifies no API endpoint/key is needed; otherwise remove the sentence.

#### F-2-3 — Landing footer claims artwork provenance without a declared test

**Location and quote:** landing footer: “Original AI-generated artwork.”

**Why this fails:** the visible provenance statement is a claim but has no `.factory/claims.json` entry. The design document records provenance, which is useful evidence, but it is not an executable claim test as required.

**Concrete fix:** either replace this footer text with a non-assertive credit such as “Artwork provenance in the design notes,” or add an `artwork-provenance` manifest entry and a repository test that verifies the displayed asset’s required source/prompt sidecars and documented generator provenance.

## What would make this perfect

Close the three remaining unlisted public claims, especially the reopened F-1-1 assurance, with executable manifest coverage or by removing the untestable wording. Then repeat the exact clean-clone claim commands and the full route/copy audit; a zero-finding review would be possible.
