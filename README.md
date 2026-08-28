# PDF Flow Reader

PDF Flow Reader is a free, local-first reading adaptation for knowledge workers with low vision. It turns selectable PDF text into a stable single-column reading view, makes the extracted order visible, and remembers the reader’s place without uploading the document.

Live: <https://pdf-flow-reader.sociobot.in>

## What it does

- Opens PDFs locally in the browser with lazy-loaded PDF.js.
- Reflows selectable text into adjustable prose with four contrast treatments, three type choices, and controls for size, line spacing, word spacing, and measure.
- Detects likely headings and provides a navigable document map.
- Supports keyboard reading with `J`/`K`, `[`/`]`, `T`, `H`, Space, and Shift+Space.
- Reports extraction confidence instead of claiming to repair the source document.
- Saves extracted text, settings, and the last reading block in IndexedDB; data can be exported, imported, or erased.
- Installs as a PWA and reloads offline after the first visit.

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
npm run build  # reproducible static output in ./dist
npm run preview
```

The Playwright version is pinned to the factory-provided browser version. Production deployment should publish `dist/` as a static site, preserving `/privacy/` and `/terms/` directory routes.

## Privacy and design

There are no analytics, trackers, cloud OCR calls, CDN scripts, or remote fonts. See [the privacy policy](https://pdf-flow-reader.sociobot.in/privacy/) and [terms](https://pdf-flow-reader.sociobot.in/terms/).

The researched product scope lives in [`.factory/brief.json`](.factory/brief.json), the visual and asset rationale in [`.factory/design.md`](.factory/design.md), and verification notes in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT © 2026 Sociobot (Param Factory).
