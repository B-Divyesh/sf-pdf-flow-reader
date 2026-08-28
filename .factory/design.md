# PDF Flow Reader — visual thesis

## Direction

**Neo-brutalist utility, softened for sustained reading.** The product should feel like a dependable piece of desk equipment: thick inked rules, square controls, explicit state labels, and a fluorescent page marker. Unlike decorative neo-brutalism, the reading plane is quiet and spacious. The hard-edged shell makes controls easy to locate; the calm paper-like center lets the document, not the interface, hold attention.

The visual metaphor is a PDF page passing through a mechanical reflow gate and leaving as one clean, continuous column. This directly explains the product and avoids implying that the source PDF has been repaired.

## Palette

All colors are encoded as CSS tokens and have checked high-contrast pairings.

- Ink `#171714`: primary text, rules, focus. It resembles dense printer ink.
- Newsprint `#F5F0E6`: primary reading background, warmer than screen white for long sessions.
- Paper `#FFFCF5`: elevated reading surface.
- Signal yellow `#F4FF57`: primary action and current-position marker; an unmistakable highlighter color.
- Cobalt `#1844D6`: links and informative status on light surfaces.
- Vermilion `#C93B28`: errors and warnings, always paired with text/iconography.
- Forest `#176B45`: successful local-save states.
- Night `#101722` and Night paper `#172131`: dark treatment, with text `#F8F4E9` and signal yellow retained.

Reader contrast presets are intentionally separate from app chrome: cream (default), white, dark, and high contrast. Each preserves at least 4.5:1 body-text contrast.

## Type

- Interface: `Arial`, `Helvetica Neue`, sans-serif. Heavy, compact labels suit the utility panel and remain available offline without font downloads.
- Reading: user-selectable `Georgia`, `Arial`, or `Atkinson Hyperlegible`-compatible system fallback. Georgia is the default because its large x-height, open counters, and familiar book rhythm aid long prose.
- Scale: 14, 16, 18, 22, 30, and fluid 44–68 px. Reader body is adjustable from 18–36 px.
- Measures: interface copy ≤ 68 characters; document prose defaults to 66ch with 1.65 line height.

## Layout and spacing

An 8 px base rhythm with 4 px micro-spacing. Desktop uses a 280 px navigation rail, a flexible reading plane, and a 300 px settings rail. At ≤ 900 px, panels become dismissible drawers. At 390 px, nonessential masthead metadata disappears, the primary upload remains full width, and the reading toolbar wraps without obscuring content. Targets are ≥ 44 px with ≥ 8 px separation.

The empty state uses an asymmetric poster grid: direct promise and upload on the left, explanatory reflow-gate illustration on the right. Once a document opens, content replaces the poster immediately and chrome defers.

## Interaction grammar

- Controls depress by 2 px and shed their offset shadow, like physical switches.
- The current section gets a thick left marker and explicit “Current” text.
- `J`/`K` move between readable blocks; `[`/`]` change text size; `T` cycles contrast; `H` opens headings; `?` opens shortcuts. Space/PageDown and Shift+Space/PageUp scroll predictably.
- File drop, processing, success, extraction warning, password prompt, offline, and error each have an explicit named state and next action.
- Reading position is stored as a block index plus scroll fraction and restored only after the user confirms from the document card.

## Motion

UI transitions last 160–220 ms and move only with opacity/transform. Panels enter from their originating edge, and the resume marker briefly fades to draw attention. No looping motion or flashing. Under `prefers-reduced-motion`, transitions and smooth scrolling become instant and the marker remains static.

## Asset plan and provenance

- `reflow-gate`: original generated editorial illustration used only in the empty state and app social preview. Subject: scattered facsimile page fragments entering a black mechanical reading gate and becoming one wide, calm column. World: tactile paper workshop. Materials: newsprint, black ink, cobalt enamel, fluorescent yellow tabs. Light: flat overcast studio light. Lens/composition: orthographic editorial still life, wide horizontal frame, clear negative space. Palette words: newsprint, ink black, cobalt, signal yellow, restrained vermilion. Negative list: no people, no eyes, no brands, no logos, no legible words, no watermarks, no UI screenshot, no gradients, no glossy 3D.
- `social-card.jpg`: a 1200 × 630 center crop composed from the original `reflow-gate` source. It adds no new generated or third-party material and is rebuilt by `npm run assets`.
- Generator: Azure AI Foundry factory image deployment via `/opt/fleet/lib/gen-image.sh`; generated 2026-08-28. Original asset generated for this product; no third-party source material. Prompt sidecar is stored beside the source asset.
- Interface icons and PWA icons: hand-authored SVG/PNG geometric “flow gate” mark, created for this product, MIT with the application.

### Generation prompt

Use case: stylized-concept. Asset type: landing-page empty-state illustration. Primary request: an editorial neo-brutalist still life showing fragmented paper strips entering a compact mechanical reading gate and emerging as one stable, generously spaced prose column. Scene: tactile print workshop tabletop. Style: flat cut-paper and screenprint, hard edges, subtle paper grain, deliberately imperfect ink registration. Composition: wide 3:2, machine centered right, calm negative space on left, no crop of main object. Lighting: flat overcast studio light. Palette: warm newsprint, dense ink black, cobalt enamel, fluorescent signal-yellow tabs, one restrained vermilion detail. Constraints: accessibility product metaphor, abstract pseudo-text lines only, no text, no people, no eyes, no logos, no watermark, no gradients, no glossy 3D, no brand marks.
