# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-file static portfolio page (`index.html`) featuring an animated cursive "Gavin" signature drawn with SVG path animations.

## Running the Project

No build step — open `index.html` directly in a browser, or serve it with any static file server:

```powershell
npx serve .
# or
python -m http.server 8080
```

## Architecture

Everything lives in `index.html` — inline CSS, inline SVG, and inline JavaScript.

**SVG structure:** The signature is split into 7 `<path>` segments (`#s1`–`#s7`) drawn in order: capital G → lowercase a → v → i stem → n → exit flourish → underline flourish. A `<circle id="dot">` handles the i-dot separately.

**Animation approach:** Each segment uses the `strokeDasharray` / `strokeDashoffset` technique. On each `requestAnimationFrame` tick, a global progress value (eased with `easeInOutQuad`) is converted to a "total length drawn" value. Segments are revealed sequentially by setting their `strokeDashoffset` proportionally. A `#pen-dot` circle tracks the tip of the currently-drawing stroke.

**Timing:** Total animation duration is `4200ms` with a `600ms` initial delay. Each segment's time share is proportional to its path length so longer strokes take longer — mimicking natural handwriting speed. The i-dot appears once the i-stem segment finishes.
