# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

Static portfolio splash page — an animated cursive "Gavin" signature. No build step, no framework.

- `index.html` — entry point; contains all CSS and the inline SVG
- `gavin-signature-animated2.svg` — standalone SVG source; keep in sync with the inline SVG in `index.html`
- `assets/` — static assets
- `Gavin-Portfolio/` — additional portfolio files

## Running

```powershell
npx serve .
# or
python -m http.server 8080
```

## Layout

`.signature` SVG sizing:

```css
width: min(95vw, clamp(500px, 80vw, 900px));
height: auto;
padding-top: 10vh;
```

Root SVG viewBox (cropped to signature content):

```svg
viewBox="15 78 195 105"
```

Keep this viewBox unless artwork is intentionally re-exported.

## SVG Structure

Visible black artwork — do not edit `d` data or animate directly:

```svg
<g inkscape:label="Signature" id="layer1">
  <path id="path1" ... />
</g>
```

Handwriting reveal uses a mask:

```svg
<mask id="signature-mask">
  <rect width="210" height="297" fill="black" />
  <path id="draw-gavin" pathLength="400" ... />
  <ellipse id="draw-i-dot" ... />
</mask>

<g id="signature-art" mask="url(#signature-mask)"> ... </g>
```

## Animation

CSS-only, no JS.

| Element | Timing |
|---|---|
| `#draw-gavin` | `3.2s cubic-bezier(.65, 0, .25, 1)` |
| `#draw-i-dot` | `0.25s ease-out 3.15s` |
| `#signature-art` | `0.01s delay 0.04s` (avoids first-frame mask artifact) |

`@media (prefers-reduced-motion: reduce)` disables animation and shows the full signature.

## Important Notes

- Do **not** add white cover shapes, clipped holes, or `intersection-*` mask elements for the G crossing — prior attempts made the animation worse and were removed.
- If the G crossing needs work, fix the draw path in a vector editor or split into ordered segments.
- When editing the SVG, update **both** `gavin-signature-animated2.svg` and the inline SVG in `index.html`.
