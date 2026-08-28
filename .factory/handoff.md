# PDF Flow Reader — independent verification handoff

## Release status: FAIL

Candidate baa6d122b537d1e0f84c0e2d5b064a7d703782f1 was independently verified on 2026-08-28 against https://pdf-flow-reader.sociobot.in/. Production matches the candidate byte-for-byte, but the acceptance contract is not met.

Full evidence and reproduction details are in .factory/verification-2.md.

## Release blockers

1. The live product and README contain public claims that are not listed in .factory/claims.json and have no tagged sandbox tests, including export/import/erase, original-file retention, password storage, OCR/restriction handling, reader adjustment capabilities, and broader no-analytics promises.
2. The 390 px reader keeps both closed drawers in the Tab order offscreen and fails to restore focus to the opener after close.
3. Mobile previous/next reading buttons render as blank 50 by 36 px squares, hiding their purpose from sighted low-vision users and missing the touch-target minimum.

## Verification summary

- First-read and one-click sample gate: PASS.
- Five declared claim commands: PASS in desktop and mobile after npm ci.
- npm test: PASS — 5 unit and 14 end-to-end tests.
- npm run typecheck: PASS.
- npm run lint: PASS.
- npm run build: PASS; dist produced.
- Live normal, invalid, blank, oversize, encrypted, wrong-password, restricted, export, invalid-import, erase, resume, and recovery flows: PASS.
- Live privacy observation: same-origin GET only; no document request body.
- Axe serious/critical: none on primary, legal, 404, reader, or four contrast modes.
- Live offline reload and simulated service-worker update/offline reload: PASS.
- Deployment identity: all checked production files match local dist.
- Lighthouse mobile /demo/: Performance 97, Accessibility 100, Best Practices 100, LCP 2.0 s, CLS 0.

## Additional findings

- Focus outline contrast is 2.43:1 on the dark reader and 2.84:1 on black, below 3:1.
- Several mobile targets are smaller than 44 by 44 px.
- Dialogs have no programmatic accessible name.
- Open Graph/Twitter metadata and the required social image declaration are missing.
- The 404 route omits the standard header/footer.

## Evidence

- .factory/verification-2.md
- .factory/verification-artifacts/live-cold-desktop.png
- .factory/verification-artifacts/live-demo-mobile.png
- .factory/verification-artifacts/live-desktop-full.png

## Next steps

Add manifest entries and one observable claim test for every public promise. Make closed drawers inert/hidden, restore focus on close, and keep mobile reading controls visibly labeled and at least 44 px high. Then repair the remaining accessibility/metadata findings and rerun the exact verification sequence.
