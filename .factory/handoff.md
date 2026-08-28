# PDF Flow Reader — independent verification handoff

## Release status: FAIL

Work order: `pdf-flow-reader-verify-3`

Candidate: `6315386f718b2254772bad2e2e2c23dd7aa4a924`

Live URL: <https://pdf-flow-reader.sociobot.in/>

The live deployment matches all 37 publicly served files in the candidate production build byte-for-byte. The first-read and one-click demo gates pass, all ten exact claim commands pass after `npm ci`, typecheck/lint/build pass, and live Lighthouse scores 100/100/100 for Performance/Accessibility/Best Practices. The candidate still fails release acceptance.

## Release blockers

1. The required full `npm test` run failed the desktop `@claim:keyboard-controls` test because `J` left the current block at 0. Isolated repetitions pass, so the claim behavior/test gate is intermittent rather than reliably green.
2. The installed start URL `/?source=installed-v2` is not precached. After a normal first visit, launching that URL offline displays only the offline fallback instead of the reader, contradicting the offline claim.

## Additional defects

- **High:** A malformed branded import is accepted, then crashes every subsequent load to a nearly blank page. In-app recovery is unavailable.
- **Medium:** After **Open another**, stale reader state makes `J` and `H` throw page errors.
- **Medium:** The footer Terms link, privacy contact link, and focused skip links miss the required 44 × 44 target floor on mobile.
- **Medium:** The PDF loading state has no h1.

## Verification summary

- `npm ci`: PASS, 0 vulnerabilities.
- Ten exact claim commands: PASS in desktop and 390 × 844 mobile projects.
- `npm test`: FAIL; first run had one claim assertion failure. A rerun was also non-green because Chromium segfaulted before one context was created.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- Local/live normal demo, local PDF processing, encrypted/wrong-password recovery, restricted PDF, image-only PDF, malformed PDF, 100 MB boundary, valid export/import/erase, keyboard focus, reduced motion, axe, privacy traffic, and ordinary offline demo reload: PASS.
- Simulated service-worker update, toast, cache replacement, reload, and later offline use: PASS.
- Security headers, HTTPS redirect, cache policy, real 404, metadata, manifest/icons, and link crawl: PASS.
- Live Lighthouse mobile `/demo/`: Performance 100, Accessibility 100, Best Practices 100, LCP 1.65 s, CLS 0.
- Initial JS 11,211 bytes gzip; CSS 4,901 bytes gzip; mobile hero 22,742 bytes.
- No backend/API or sign-in exists, so rate limiting, backend concurrency, health, and Entra checks are not applicable.

Full evidence and reproduction steps are in `.factory/verification-3.md`. QA changed no product code.
