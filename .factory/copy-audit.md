# Copy audit — 2026-08-28 polish 2

## First screen and landing-page sentences

| Copy | Words | Result |
| --- | ---: | --- |
| Read long PDFs in a steady column. | 7 | Pass — job-first headline |
| For knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view. | 17 | Pass — audience and change |
| The sample opens now. | 4 | Pass — immediate action result |
| Your PDF is processed on this device. | 7 | Pass — `private-local` |
| We place extracted text in one reading column. | 8 | Pass — `extraction-boundary` |
| We never alter or certify the source PDF. | 8 | Pass — `extraction-boundary` |
| Your browser reads the file. | 5 | Pass — `private-local` |
| It never travels to a server. | 6 | Pass — `private-local` |
| We show a confidence note. | 5 | Pass — `extraction-confidence` |
| Check the source PDF when meaning matters. | 7 | Pass — `extraction-confidence` |
| Set size, spacing, measure, and contrast. | 6 | Pass — `reader-adjustments` |
| Return to the same reading place. | 7 | Pass — `resume-place` |
| You’re offline. | 2 | Pass — offline state |
| The local reader stays available. | 5 | Pass — `offline-reload` |
| Read long PDFs in a steady column. | 7 | Pass — footer one-line |
| No upload. | 2 | Pass — `private-local` |
| No tracking. | 2 | Pass — `private-local` |
| Original AI-generated artwork. | 3 | Pass — `artwork-provenance` |
| Extracted text, settings, and your reading place live only in this browser. | 12 | Pass — `stored-data-scope` |
| This PDF needs its open password. | 6 | Pass — password state |
| The password is used only for this attempt and is never saved. | 12 | Pass — `stored-data-scope` |

The first screen states the job, audience, first action, its immediate result, and three short facts. Its buttons use result-naming verbs.

## Round 2 README and catalog checks

| Copy | Words | Result |
| --- | ---: | --- |
| No API keys or backend are required. | 7 | Pass — `no-api-key-or-backend` |
| See .factory/claims.json for tested product claims. | 6 | Pass — repository pointer, not a completeness assurance |
| Read long PDFs in one adjustable reading column. | 8 | Pass — verb-first catalog line, 48 characters |

The self-referential sentence “Every public reliance claim…” was removed. No audited sentence exceeds 22 words or uses a banned marketing term.

## Terminology

| Concept | One term used |
| --- | --- |
| Source file | PDF |
| Adapted text view | reading view |
| Bundled try-out | sample data / demo |
| Saved location in a document | reading place |
| Saved browser records | local reading data / local library |
| Adaptation controls | reading setup |
