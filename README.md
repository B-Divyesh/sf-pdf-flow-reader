# PDF Flow Reader

Read long PDFs in a steady column. PDF Flow Reader is for knowledge workers with low vision who need selectable PDF text in a stable, adjustable reading view.

Live: <https://pdf-flow-reader.sociobot.in>

## What it does

- [Try it with sample data](https://pdf-flow-reader.sociobot.in/demo/) before opening your own PDF.
- Process selectable text in your browser, with no document upload or tracking request.
- Adjust text size, spacing, line width, typeface, and contrast.
- Use a heading map and keyboard controls: `J`/`K`, `[`/`]`, `T`, `H`, Space, and Shift+Space.
- Save the last reading place and settings in this browser; export, import, or erase that local library.
- Reload offline after the first visit.

Scanned/image-only PDFs need OCR and are reported honestly as unsupported. Complex tables, equations, columns, and footnotes may not preserve the author’s intended order. Owner restrictions on text copying are respected.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Then open the local URL printed by Vite. No API keys or backend are required.

## Test and build

```sh
npm test       # unit + Playwright desktop/mobile/offline/axe checks
npm run typecheck
npm run lint
npm run build  # reproducible static output in ./dist
npm run preview
```

The Playwright version is pinned to the factory-provided browser version. Production deployment should publish `dist/` as a static site, preserving `/demo/`, `/privacy/`, `/terms/`, and the included `staticwebapp.config.json` response policy.

## Privacy and design

There are no analytics, trackers, cloud OCR calls, CDN scripts, or remote fonts. The demo uses a separate `demo:pdf-flow-reader` IndexedDB database and never touches a regular library. See [the privacy policy](https://pdf-flow-reader.sociobot.in/privacy/) and [terms](https://pdf-flow-reader.sociobot.in/terms/).

Every public reliance claim and its executable browser test lives in [`.factory/claims.json`](.factory/claims.json). The researched product scope lives in [`.factory/brief.json`](.factory/brief.json), the visual and asset rationale in [`.factory/design.md`](.factory/design.md), and verification notes in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT © 2026 Sociobot (Param Factory).
