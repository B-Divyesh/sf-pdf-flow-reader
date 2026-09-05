# Copy audit — 2026-09-05 repair 4

## Complete landing-page copy

The table covers each static landing phrase, plus visible conditional states and shared dialog copy. Counts use whitespace-separated words.

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to reader | 3 | Pass — result-naming skip link |
| PDF FLOW READER | 3 | Pass — wordmark |
| Local only | 2 | Pass — privacy fact fragment |
| Demo | 1 | Pass — route link |
| Privacy | 1 | Pass — route link |
| Show keyboard shortcuts | 3 | Pass — result-naming action |
| Manage local data | 3 | Pass — result-naming action |
| A steadier way through PDFs | 5 | Pass — descriptive eyebrow |
| Read long PDFs in a steady column. | 7 | Pass — job-first headline |
| For knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view. | 17 | Pass — audience and change |
| Try it with sample data | 5 | Pass — primary action |
| Choose a PDF | 3 | Pass — real-file action |
| The sample opens now. | 4 | Pass — immediate action result |
| Your PDF is processed on this device. | 7 | Pass — `private-local` |
| No upload | 2 | Pass — `private-local` fact |
| Remembers your reading place | 4 | Pass — `resume-place` fact |
| Works offline | 2 | Pass — `offline-reload` fact |
| We place extracted text in one reading column. | 8 | Pass — `extraction-boundary` |
| We never alter or certify the source PDF. | 8 | Pass — `extraction-boundary` |
| What happens here | 3 | Pass — section label |
| How PDF Flow Reader reads your PDF locally | 8 | Pass — descriptive section heading |
| Open locally | 2 | Pass — clear standalone step heading |
| Your browser reads the file. | 5 | Pass — `private-local` |
| It never travels to a server. | 6 | Pass — `private-local` |
| We show a confidence note. | 5 | Pass — `extraction-confidence` |
| Check the source PDF when meaning matters. | 7 | Pass — `extraction-confidence` |
| Check the text order | 4 | Pass — clear standalone step heading |
| Adjust the reading view | 4 | Pass — clear standalone step heading |
| Set text size, spacing, line width, and contrast. | 8 | Pass — `reader-adjustments`; matches the reader control |
| Return to the same reading place. | 6 | Pass — `resume-place` |
| You’re offline. | 2 | Pass — offline state |
| The local reader stays available. | 5 | Pass — `offline-reload` |
| Terms | 1 | Pass — route link |
| Read long PDFs in a steady column. | 7 | Pass — footer one-line |
| No upload. | 2 | Pass — `private-local` |
| No tracking. | 2 | Pass — `private-local` |
| Built by Param Factory · v1.0.0 | 6 | Pass — attribution and version |
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
| Text line-length control | line width |
