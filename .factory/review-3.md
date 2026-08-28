# Adversarial first-read review 3 — PDF Flow Reader

Reviewed 2026-08-28 against <https://pdf-flow-reader.sociobot.in/> from fresh Chromium contexts at 390 × 844 and 1440 × 900. Product code was not changed.

## Verdict: FAIL

There are no blocking findings. The cold first screen, one-click demo, sandbox isolation, all declared claims, and the end-to-end reader pass. Three minor plain-language defects remain, so this cannot be a zero-finding `PASS`.

## Cold first read

Before scrolling or interacting, I could answer all three required questions at both widths:

- **What does it do?** It reads long PDFs in one steady, adjustable text column. The exact headline is “Read long PDFs in a steady column.”
- **For whom?** “Knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view.”
- **What should I click first?** **Try it with sample data**. The adjacent sentence “The sample opens now” states the result.

The primary action, the real-file action, and all three facts remain above the fold at 390 px. There is no horizontal overflow or load-time console/page error in a normal fresh browser context. This gate passes.

## Copy audit

Counts use whitespace-separated words. Repeated footer/header copy is grouped by wording. Labels and headings are included because the brief also requires their clarity. No sentence exceeds 22 words, and no banned marketing term appears.

### Landing page

| Exact copy | Words | Result |
| --- | ---: | --- |
| Skip to reader | 3 | Pass — action label |
| PDF FLOW READER | 3 | Pass — wordmark |
| Local only | 2 | Pass — fact fragment |
| Demo | 1 | Pass — link |
| Privacy | 1 | Pass — link |
| Show keyboard shortcuts | 3 | Pass — result-naming action |
| Manage local data | 3 | Pass — result-naming action |
| You’re offline. | 2 | Pass — conditional sentence |
| The local reader stays available. | 5 | Pass — conditional sentence |
| A steadier way through PDFs | 5 | Pass — eyebrow |
| Read long PDFs in a steady column. | 7 | Pass — h1 and repeated footer line |
| For knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view. | 17 | Pass |
| Try it with sample data | 5 | Pass — result-naming action |
| Choose a PDF | 3 | Pass — result-naming action |
| The sample opens now. | 4 | Pass |
| Your PDF is processed on this device. | 7 | Pass |
| No upload | 2 | Pass — fact fragment |
| Remembers your reading place | 4 | Pass — fact fragment |
| Works offline | 2 | Pass — fact fragment |
| Paper fragments feed into a blue mechanical press and emerge as one orderly column of text. | 16 | Pass — image alternative |
| We place extracted text in one reading column. | 8 | Pass |
| We never alter or certify the source PDF. | 8 | Pass |
| What happens here | 3 | Pass — eyebrow |
| How PDF Flow Reader reads your PDF locally | 8 | Pass — h2 |
| Open locally | 2 | Pass — h3 |
| Your browser reads the file. | 5 | Pass |
| It never travels to a server. | 6 | Pass |
| Inspect the flow | 3 | **F-3-1** |
| We show a confidence note. | 5 | Pass |
| Check the source PDF when meaning matters. | 7 | Pass |
| Read your way | 3 | **F-3-2** |
| Set size, spacing, measure, and contrast. | 6 | **F-3-3** |
| Return to the same reading place. | 6 | Pass |
| Terms | 1 | Pass — link |
| No upload. | 2 | Pass |
| No tracking. | 2 | Pass |
| Built by Param Factory · v1.0.0 | 6 | Pass — attribution/version |
| Original AI-generated artwork. | 3 | Pass — declared provenance claim |

Shared landing dialogs and conditional states were also checked:

| Exact copy | Words | Result |
| --- | ---: | --- |
| Keyboard shortcuts | 2 | Pass — dialog heading |
| Next / previous block | 4 | Pass — shortcut description |
| Increase / decrease text | 4 | Pass — shortcut description |
| Cycle contrast | 2 | Pass — shortcut description |
| Open headings | 2 | Pass — shortcut description |
| Move down one screen | 4 | Pass — shortcut description |
| Local reading data | 3 | Pass — dialog heading |
| Extracted text, settings, and your reading place live only in this browser. | 12 | Pass |
| Export my data | 3 | Pass — result-naming action |
| Import data | 2 | Pass — result-naming action |
| Erase all local data | 4 | Pass — result-naming action |
| An app update is ready. | 5 | Pass |
| Reload | 1 | Pass — result-naming action |
| Password protected | 2 | Pass — dialog heading |
| This PDF needs its open password. | 6 | Pass |
| The password is used only for this attempt and is never saved. | 12 | Pass |
| PDF password | 2 | Pass — field label |
| Unlock locally | 2 | Pass — result-naming action |
| Cancel | 1 | Pass — standard action |

### README

| Exact copy | Words | Result |
| --- | ---: | --- |
| PDF Flow Reader | 3 | Pass — document title |
| Read long PDFs in a steady column. | 7 | Pass |
| PDF Flow Reader is for knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view. | 21 | Pass |
| Live | 1 | Pass — label |
| What it does | 3 | Pass — heading |
| Try it with sample data before opening your own PDF. | 10 | Pass |
| Process selectable text in your browser, with no document upload or tracking request. | 13 | Pass |
| Adjust text size, spacing, line width, typeface, and contrast. | 9 | Pass |
| Use a heading map and keyboard controls: J/K, [/], T, H, Space, and Shift+Space. | 14 | Pass |
| Save your reading place and settings in this browser; export, import, or erase that local library. | 16 | Pass |
| Reload offline after the first visit. | 6 | Pass |
| Scanned/image-only PDFs need OCR and are reported as unsupported. | 9 | Pass |
| Check the source PDF for tables, equations, columns, and footnotes. | 10 | Pass |
| Owner restrictions on text copying are respected. | 7 | Pass |
| Run locally | 2 | Pass — heading |
| Requires Node.js 20 or newer. | 5 | Pass — setup requirement |
| Then open the local URL printed by Vite. | 8 | Pass — instruction |
| No API keys or backend are required. | 7 | Pass — declared claim |
| Test and build | 3 | Pass — heading |
| The Playwright version is pinned to the factory-provided browser version. | 10 | Pass — repository note |
| Production deployment should publish dist/ as a static site, preserving /demo/, /privacy/, /terms/, and the included staticwebapp.config.json response policy. | 19 | Pass — deployment instruction |
| Privacy and design | 3 | Pass — heading |
| There are no analytics, trackers, cloud OCR calls, CDN scripts, or remote fonts. | 13 | Pass |
| The ?demo=1 demo uses a separate demo:pdf-flow-reader IndexedDB database and never touches a regular library. | 15 | Pass |
| See .factory/claims.json for tested product claims. | 6 | Pass — repository pointer |
| The researched product scope lives in .factory/brief.json, the visual and asset rationale in .factory/design.md, and verification notes in .factory/handoff.md. | 19 | Pass — repository map |
| License | 1 | Pass — heading |
| MIT © 2026 Sociobot (Param Factory). | 6 | Pass — license notice |

The shell-command annotations “unit + Playwright desktop/mobile/offline/axe checks” and “reproducible static output in ./dist” are fragments, not prose sentences. The corresponding full suite and build were nevertheless run successfully.

## Demo and sandbox

- One click on **Try it with sample data** opened `/?demo=1` at both widths and immediately showed the two-page **A QUIET READING ROUTINE** document, document map, confidence note, reading controls, and realistic prose.
- The persistent banner says “Demo — sample data, nothing is saved to your real library” and exposes **Reset demo** and **Start for real**.
- **Reset demo** returned the changed reader to “Page 1 of 2” and restored the bundled sample.
- The demo wrote only to `demo:pdf-flow-reader`. A valid pre-existing record in `pdf-flow-reader` remained present and became resumable after **Start for real**.
- **Start for real** removed all records from the demo database before returning to the normal reader.
- The live request log contained only same-origin `GET` requests with no request bodies. The only fetch/XHR document request was `/samples/reading-routine.pdf`.
- A live, service-worker-controlled demo reloaded with the context offline and retained the sample and offline status.

The demo gate passes.

## Declared claims

A clean clone was created at `/tmp/pdf-flow-review-3.dr9gHh/repo` from base `88c76d5b600f125cf50a9a4019a3a06dbb5a4b25`, followed by `npm ci`. Every exact `test` command in `.factory/claims.json` was run independently with CI serialization; each passed in desktop and mobile:

| Claim id | Result |
| --- | --- |
| demo-sample | PASS — 2 projects |
| private-local | PASS — 2 projects |
| offline-reload | PASS — 2 projects |
| resume-place | PASS — 2 projects |
| keyboard-controls | PASS — 2 projects |
| local-data-control | PASS — 2 projects |
| stored-data-scope | PASS — 2 projects |
| scan-report | PASS — 2 projects |
| copy-restrictions | PASS — 2 projects |
| reader-adjustments | PASS — 2 projects |
| extraction-boundary | PASS — 2 projects |
| extraction-confidence | PASS — 2 projects |
| no-api-key-or-backend | PASS — 2 projects |
| artwork-provenance | PASS — 2 projects |

Result: 14/14 commands and 28/28 claim-project runs passed. The manifest has one tagged test per id. The live landing, legal pages, reader states, and README do not add an uncovered product reliance claim.

## Earlier findings checked from scratch

| Earlier finding | Live and code result |
| --- | --- |
| F-1-1 — extraction/boundary claims absent from manifest | Fixed. `extraction-boundary` and `extraction-confidence` exist and both exact commands pass. |
| F-1-2 — route changes did not focus or announce the h1 | Fixed. Privacy, Terms, Demo, Home, Back/Forward, and 404 focus/announcement regression passes live; `src/chrome.ts` implements the handoff. |
| F-1-3 — 404 lacked a canonical | Fixed. `/404/` and the live unknown-route page expose the 404 canonical and matching OG URL. |
| F-1-4 — route chrome differed | Fixed. Home, Demo, Privacy, Terms, and 404 share the header controls and footer copy/links/version. |
| F-1-5 — saved-place terminology differed | Fixed. Public saved-location copy consistently says “reading place.” |
| F-1-6 — “Shortcuts” was an ambiguous action | Fixed. Its accessible name is “Show keyboard shortcuts”; the compact “Keys” text is hidden from assistive technology. |
| F-1-7 — explanatory h2 lacked a subject | Fixed. It now reads “How PDF Flow Reader reads your PDF locally.” |
| F-2-1 — manifest-completeness assurance remained | Fixed. The assurance was removed; the README now uses a neutral file pointer. |
| F-2-2 — keyless/backend-free claim lacked a test | Fixed. `no-api-key-or-backend` passes from a credential-scrubbed static preview. |
| F-2-3 — artwork provenance lacked a test | Fixed. `artwork-provenance` passes and joins the displayed asset to its source, prompt, generator record, date, and footer credit. |

No earlier finding is reopened.

## Structure, accessibility, links, and quality gates

- `/`, `/?demo=1`, `/demo/`, `/privacy/`, `/terms/`, `/404/`, and an unknown route have `lang="en"`, one h1, one main, route-appropriate title, description, canonical, Open Graph/Twitter metadata, favicon, and consistent chrome.
- The unknown route returns HTTP 404 and a designed recovery screen. The explicit `/404/` document returns 200 as a directly inspectable route.
- Every rendered internal link and the external `sociobot.in` link returned 200. `robots.txt`, `sitemap.xml`, the manifest, social image, and icons returned 200.
- Address-bar deep links, reload, Back/Forward, h1 focus, and polite route announcements passed in the live browser suite.
- The 390 px routes have no horizontal overflow. Focus styles, reduced-motion rules, landmarks, alt text, and 44 px targets are present. Playwright axe found no serious or critical violations in the tested route, reader, and contrast states.
- The visual identity is distinct: newsprint, ink rules, signal yellow, cobalt, square physical controls, and the original mechanical reflow illustration match `.factory/design.md`; it is not a generic SaaS card/gradient layout.
- Clean-clone `npm test`: 15 unit tests passed; 48 browser tests passed; 2 expected desktop skips. The same live-target browser suite passed 48 with 2 expected skips.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed. `dist/` was produced. Initial Home JavaScript is about 13.17 KB gzip; the lazy PDF chunk is 110.27 KB gzip.

## Missed leverage

No additional feature is implied strongly enough to add. Import, export, erase, offline use, reading-place resume, adjustments, and a sample already cover the brief. Cloud OCR or a gateway AI feature would conflict with the explicit local-only boundary unless the product introduced a separate, opt-in document-upload workflow; that is not an obvious requirement here. No provider key or decorative runtime AI feature is present.

## Findings

### Minor

#### F-3-1 — “Inspect the flow” is a context-free, branded heading

**Exact location and quote:** landing page, second step h3: “Inspect the flow”.

**Why this fails:** in a screen-reader heading list, “flow” does not name what the visitor should inspect. The section is actually about checking extraction confidence and the source PDF.

**Concrete fix:** replace the heading with **Check the text order**.

#### F-3-2 — “Read your way” does not name the step’s result

**Exact location and quote:** landing page, third step h3: “Read your way”.

**Why this fails:** the phrase is generic and does not make sense as a standalone heading. The step configures the reading view and returns to a saved place.

**Concrete fix:** replace the heading with **Adjust the reading view**.

#### F-3-3 — “Measure” is typography jargon and conflicts with “line width”

**Exact location and quote:** landing page, third step: “Set size, spacing, measure, and contrast.” README and the reader control instead use “line width.”

**Why this fails:** a first-time visitor should not have to translate a specialist term, and the same control has two names.

**Concrete fix:** rewrite the sentence as **“Set text size, spacing, line width, and contrast.”** Use “line width” everywhere public.

## What would make this perfect

Apply the three exact copy changes above, update the copy audit, and add a small regression that asserts the three landing step headings and the public “line width” term. Then repeat the cold mobile/desktop read and full claim suite. With no new finding, the next round can pass.
