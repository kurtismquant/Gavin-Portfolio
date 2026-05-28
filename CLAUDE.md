# CLAUDE.md

## Current Project State

GavinPortfolio is a static single-page digital marketing portfolio built with plain HTML, CSS, and JavaScript. It now has fixed navigation, an About hero, a Work section, a Contact section, local video previews, and a video modal.

The signature remains the brand anchor. The inline SVG in `index.html` still uses the original mask-based CSS handwriting reveal, and `gavin-signature-animated2.svg` is the standalone source that should stay in sync with it.

The current visual implementation is light/off-white with thin typography. If returning to the original dark direction, do it intentionally and consistently across the whole UI.

## Files That Matter

- `index.html`: entry point, semantic sections, inline signature SVG, contact form, video dialog.
- `css/style.css`: layout, responsive rules, fixed signature positioning, reveal states, reduced-motion rules.
- `js/main.js`: company data, Work rendering, nav state, scroll-based custom morphing, contact placeholder, video modal.
- `gavin-signature-animated2.svg`: standalone signature SVG; keep synced with inline SVG when signature markup changes.
- `company1.svg`: current Work morph target artwork for Excited to Eat.
- `video1.mp4`, `video2.mp4`, `video3.mp4`: current local Work videos.
- `verification-*.png`: local visual QA screenshots; do not treat as app source.
- `CLAUDE.md`: secondary agent notes.

## Current Features

- Fixed nav with active link updates for `About`, `Work`, and `Contact`.
- Hero signature draws on load using CSS inside the inline SVG.
- Hero copy fades in after the draw: `Stories that stop the scroll.`
- Work is data-driven from the `companies` array in `js/main.js`.
- Current client: `Excited to Eat`, using `company1.svg` plus three local MP4 cards.
- Scroll into Work swaps from the masked signature artwork to `#morph-path`.
- Morphing is custom JavaScript path interpolation, not GSAP/MorphSVG.
- Contact form is a frontend placeholder; no real delivery target is connected.
- Reduced-motion disables major transitions and scroll snap.

## Running Locally

```powershell
npx serve .
# or
python -m http.server 8080
```

Then open the served URL and visually verify desktop and mobile layouts.

## Design Direction

- Keep the portfolio minimal, premium, thin, and signature-first.
- Do not let cards, decoration, gradients, or loud colors compete with the signature.
- Use generous whitespace and lightweight typography.
- Keep nav text uppercase with subtle letter spacing.
- If editing video cards, preserve the vertical `9 / 16` format.
- Avoid fake client names, fake metrics, or fake TikTok URLs unless asked for placeholders.

## SVG Rules

- Preserve `viewBox="15 78 195 105"` unless intentionally re-exporting artwork.
- Do not remove or rename `#path1`, `#draw-gavin`, `#draw-i-dot`, `#signature-mask`, `#signature-art`, or `#morph-path` without a clear migration plan.
- Do not manually edit complex `d` path data unless the task explicitly requires a small targeted change.
- Do not add white cover shapes, clipped holes, or mask hacks to hide signature crossings.
- When changing the signature SVG, update both the inline SVG in `index.html` and `gavin-signature-animated2.svg`.

## JavaScript Rules

- Keep Work content data-driven through the `companies` array.
- Adding a client should mean adding a company object plus assets, not rewriting layout markup.
- The current morph system parses paths, normalizes target points, and interpolates segment values on scroll.
- Do not add GSAP unless the task explicitly asks for the animation migration.
- If GSAP is added later, verify plugin availability before relying on MorphSVG, DrawSVG, ScrollTrigger, ScrollSmoother, or SplitText.
- Respect `prefers-reduced-motion` for new animations.

## Contact Rules

- The contact form posts to FormSubmit.co (AJAX endpoint: `https://formsubmit.co/ajax/gavinquant@gmail.com`).
- **Important for Gavin:** the very first form submission triggers a confirmation email to gavinquant@gmail.com. He must click the confirmation link once. After that, all submissions arrive in his inbox automatically.
- Social links are live: Instagram @gavin_quant, LinkedIn gavin-quant-78a993256.
- Resume download button points to `gavin-quant-resume.pdf` at the project root. Drop the file there when ready.
- `_next` redirect URL is not set (using AJAX delivery, no page redirect needed).

## Agent Workflow

- Inspect relevant files before editing.
- Make focused, minimal changes that support the requested task.
- Preserve the signature animation unless explicitly asked to change it.
- Do not introduce a build system or heavy dependency casually.
- Use plain HTML/CSS/JS unless the repo is intentionally migrated.
- Be careful with user or generated changes already present in the worktree.
- Validate by serving locally when the change affects UI, SVG, navigation, video, or motion.

## Verification Checklist

- Page loads without console errors.
- Signature appears and still draws unless intentionally changed.
- Navigation scrolls to the correct sections and active states update.
- Work section renders the current company and opens video previews.
- Morph target renders during Work scroll.
- Contact placeholder still responds on submit.
- Desktop and mobile layouts remain usable.
- Reduced-motion users get visible content without required animation.

## Screenshot Verification (REQUIRED for UI work)

- After ANY frontend/UI change, use the puppeteer MCP tool to screenshot the page
- Compare screenshot against intended design before considering the task done
- If something looks off, fix it and screenshot again
- Dev server runs on: http://localhost:5173