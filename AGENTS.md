# AGENTS.md

Repository instructions for Codex and other AI coding agents working on this project.

## Project overview

This repository is a dark, elegant digital marketing portfolio for **Gavin** built around his cursive signature logo. The signature is the brand: the rest of the interface should feel quiet, premium, and intentionally minimal.

The main creative concept is a **morphing SVG signature**. The signature starts as a handwritten Gavin logo, then transforms into abstract shapes representing client companies as the user scrolls through the Work section.

**Current state:** The site is a static splash page with an animated cursive `Gavin` signature. The draw animation is CSS-only and already works. The goal is to evolve the splash page into a full single-page portfolio with About, Work, and Contact sections.

## Agent operating rules

- Make focused, minimal changes that directly support the requested task.
- Preserve the existing signature animation unless the task explicitly asks to change it.
- Do not rewrite the whole project unless specifically asked.
- Do not delete existing SVG structure, IDs, masks, or paths without a clear reason.
- Do not edit complex SVG `d` path data by hand unless the user explicitly asks for a small targeted change.
- When changing the signature SVG, keep the inline SVG in `index.html` and `gavin-signature-animated2.svg` in sync.
- Prefer plain HTML, CSS, and JavaScript unless the repository is intentionally migrated to a build setup.
- Keep the visual direction dark, thin, elegant, and minimal.
- Avoid heavy libraries beyond the approved animation stack unless requested.
- Respect `prefers-reduced-motion` for all major animations.
- Validate changes by running the local site and checking the visual result when possible.

## Existing files

- `index.html` — current entry point; contains all CSS and the inline SVG.
- `gavin-signature-animated2.svg` — standalone SVG source; must stay in sync with the inline SVG in `index.html`.
- `assets/` — static assets.
- `Gavin-Portfolio/` — additional portfolio files.

## Running locally

```powershell
npx serve .
# or
python -m http.server 8080
```

After starting the server, open the served URL in a browser and visually verify the signature animation.

## Core design direction

### Mood

- Dark
- Elegant
- Premium
- Minimal
- Thin typography
- Signature-first
- High whitespace
- No loud gradients unless requested
- No thick/bold UI treatments

### Design principle

The signature should remain the hero. UI, layout, copy, and animation should support the signature rather than compete with it.

## Design system

### Colors

```css
:root {
  --bg-primary:     #0a0a0a;
  --bg-surface:     #141414;
  --bg-hover:       #1a1a1a;
  --text-primary:   #ffffff;
  --text-secondary: #888888;
  --text-muted:     #444444;
  --border:         #222222;
}
```

### Typography

- Use a thin-weight sans-serif such as `Inter` or `Satoshi`.
- Preferred weights: `300` and `400`.
- Avoid bold weights unless explicitly requested.
- Nav text should be uppercase with `letter-spacing: 1px` to `2px`.
- Body text should use light weight and comfortable line height, around `1.7`.

### Spacing

- Sections should feel spacious.
- Use `100px` to `120px` vertical section padding where appropriate.
- Use `40px` to `60px` gaps between major content groups.
- When unsure, use more whitespace, not less.

### Animation values

- Morph easing: `power3.inOut`
- Morph duration: `0.8s` to `1.2s`
- Reveal easing: `power2.out`
- Reveal duration: `0.5s` to `0.8s`
- Stagger: around `0.1s`
- Initial signature draw plays on page load.
- Most other animations should be scroll-triggered.

## SVG structure: preserve carefully

The root SVG viewBox is cropped to the signature content:

```svg
viewBox="15 78 195 105"
```

Keep this viewBox unless the artwork is intentionally re-exported.

The visible black artwork is inside:

```svg
<g inkscape:label="Signature" id="layer1">
  <path id="path1" ... />
</g>
```

Do **not** directly edit the `d` attribute of `#path1` unless the task specifically requires manual path edits and the change is small and deliberate.

The handwriting reveal uses this mask pattern:

```svg
<mask id="signature-mask">
  <rect width="210" height="297" fill="black" />
  <path id="draw-gavin" pathLength="400" ... />
  <ellipse id="draw-i-dot" ... />
</mask>

<g id="signature-art" mask="url(#signature-mask)"> ... </g>
```

### Existing animation timing

| Element | Timing |
|---|---|
| `#draw-gavin` | `3.2s cubic-bezier(.65, 0, .25, 1)` |
| `#draw-i-dot` | `0.25s ease-out 3.15s` |
| `#signature-art` | `0.01s delay 0.04s` to avoid first-frame mask artifact |

`@media (prefers-reduced-motion: reduce)` must disable animation and show the full signature.

### SVG rules

- Do not add white cover shapes.
- Do not add clipped holes.
- Do not add `intersection-*` mask elements for the G crossing.
- Prior attempts at covering the G crossing made the animation worse and were removed.
- If the G crossing needs work, fix the draw path in a vector editor or split the signature into ordered segments.
- When editing SVG assets, update both:
  - `gavin-signature-animated2.svg`
  - the inline SVG in `index.html`

## Planned migration: CSS animation to GSAP

The current CSS draw animation works. Do not break it casually.

For the morphing concept, the site should eventually use GSAP so the initial draw, scroll effects, and signature morphs can live on coordinated timelines.

### Intended migration steps

1. Add package setup if needed.
2. Install GSAP.
3. Move the existing draw animation from CSS `stroke-dashoffset` into a GSAP timeline.
4. Preserve the same visual timing as the current CSS animation.
5. Extract the `d` attribute from `#path1`; this becomes the source shape for morphs.
6. Keep the existing mask-based reveal for the initial handwriting effect.
7. After the draw completes, transition to using the path directly for morphing.

### GSAP imports

Use this pattern only if the local package supports the plugins being imported:

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(
  ScrollTrigger,
  ScrollSmoother,
  DrawSVGPlugin,
  MorphSVGPlugin,
  SplitText
);
```

If a plugin import fails, do not fake the implementation. Report the issue and either use a supported fallback or ask before changing the animation approach.

## Target site architecture

The final site should be a single-page portfolio with three scroll sections and smooth scrolling.

```html
<section id="about">...</section>
<section id="work">...</section>
<section id="contact">...</section>
```

## Section 1: About / Home

The About section expands the current splash page into a full hero.

### Required pieces

1. Fixed top navigation
   - Links: `About`, `Work`, `Contact`
   - Transparent background at top
   - Thin uppercase text
   - `letter-spacing: 1px` to `2px`
   - Active link: white
   - Inactive links: `--text-muted`
   - On scroll: add `backdrop-filter: blur(10px)` and a subtle bottom border

2. Hero
   - Full viewport height
   - Signature SVG centered
   - Existing draw animation plays on load
   - Signature size: around `50vw` to `60vw` on desktop
   - Tagline fades up after the signature draw:
     - `Stories that stop the scroll.`
   - CTA fades in last:
     - subtle downward arrow or `View my work`

3. Trailing stroke
   - After the draw, the final stroke of the `n` should extend downward elegantly.
   - This should guide the user toward scrolling.
   - Prefer GSAP for this once the animation migration begins.

## Section 2: Work

The Work section is the creative centerpiece.

As the user scrolls, the signature morphs into abstract shapes representing each client. Each company gets a full viewport-height section.

### Scroll flow

1. Signature is visible from the hero.
2. Scrolling into Work morphs the signature into Company A's shape.
3. Company A name and video cards fade in around the shape.
4. Continued scrolling morphs into Company B's shape and swaps content.
5. Repeat for all companies.
6. Final company morphs back into the Gavin signature.

### Company layout

```text
┌─────────────────────────────────────────┐
│                                         │
│          [Morphed SVG shape]            │
│                                         │
│           COMPANY NAME                  │
│      Campaign type · Total views        │
│                                         │
│    ┌──────┐  ┌──────┐  ┌──────┐        │
│    │  ▶   │  │  ▶   │  │  ▶   │        │
│    │      │  │      │  │      │        │
│    └──────┘  └──────┘  └──────┘        │
│    Teaser     Launch     BTS            │
│                                         │
└─────────────────────────────────────────┘
```

### Video cards

- Aspect ratio: `9 / 16`
- Approximate desktop size: `180px x 320px`
- Background: `--bg-surface`
- Border: `1px solid var(--border)`
- Border radius: `12px`
- Hover state:
  - `transform: scale(1.03)`
  - brighter border
  - reveal play icon
- Click behavior:
  - lightbox or link to TikTok

### Work data structure

Client content should be data-driven. Adding a client should mean adding one object to the array, not rewriting layout markup.

```js
const companies = [
  {
    name: "Luxe Beauty",
    type: "Product Launch",
    views: "2.1M",
    targetPath: "M...",
    videos: [
      {
        title: "Teaser",
        thumbnail: "assets/videos/thumb.jpg",
        url: "https://tiktok.com/..."
      }
    ]
  }
];
```

### Morph pattern

Use this as conceptual guidance, not copy-paste code unless the surrounding implementation matches it:

```js
companies.forEach((company, i) => {
  const fromPath = i === 0 ? signaturePath : companies[i - 1].targetPath;

  ScrollTrigger.create({
    trigger: `#company-${i}`,
    start: "top center",
    end: "bottom center",
    scrub: 1,
    onEnter: () => {
      gsap.to("#morph-path", {
        morphSVG: company.targetPath,
        duration: 1,
        ease: "power3.inOut"
      });
    },
    onLeaveBack: () => {
      gsap.to("#morph-path", {
        morphSVG: fromPath,
        duration: 1,
        ease: "power3.inOut"
      });
    }
  });
});
```

## Section 3: Contact

### Required pieces

1. Heading
   - `Let's work together.`
   - Large, thin, centered or elegantly aligned.

2. Email form
   - Fields: Name, Email, Message
   - Dark inputs using `--bg-surface`
   - Thin borders using `--border`
   - Focus state transitions border to white
   - Submit button: outlined, thin, uppercase

3. Social links
   - TikTok
   - Instagram
   - LinkedIn
   - Email
   - Thin SVG icons
   - Horizontal row
   - Centered
   - Hover transitions to white

## Target file structure

The current repository may not match this structure yet. Migrate gradually and only when requested or useful for the current task.

```text
gavin-portfolio/
├── AGENTS.md
├── index.html
├── gavin-signature-animated2.svg
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── signature.js
│   └── work.js
├── assets/
│   ├── fonts/
│   └── videos/
├── package.json
└── node_modules/
    └── gsap/
```

## Implementation phases

### Phase 1: Foundation

- [ ] Initialize package setup if the repo does not already have it.
- [ ] Install GSAP if the task requires animation migration.
- [ ] Extract inline CSS from `index.html` into `css/style.css`.
- [ ] Switch background from white to dark theme using `--bg-primary`.
- [ ] Switch signature stroke from black to white.
- [ ] Add semantic section structure: `#about`, `#work`, `#contact`.
- [ ] Build fixed nav bar.
- [ ] Set up JavaScript entry file, likely `js/main.js`.
- [ ] Initialize smooth scrolling only after verifying it does not break layout or accessibility.

### Phase 2: Migrate signature animation

- [ ] Replace CSS `stroke-dashoffset` animation with GSAP draw animation.
- [ ] Verify the draw looks identical to the current CSS version.
- [ ] Add tagline and CTA fade-in chained after the draw timeline.
- [ ] Add trailing pen stroke extending down from the `n`.
- [ ] Extract the `#path1` `d` attribute as the morph source path.

### Phase 3: Work section morphing

- [ ] Design three placeholder target SVG paths.
- [ ] Keep each target path under roughly 500 anchor points.
- [ ] Build company section HTML template.
- [ ] Implement scroll-driven morphing with `MorphSVGPlugin` and `ScrollTrigger` if plugins are available.
- [ ] Tie company content fade-in and fade-out to scroll position.
- [ ] Build video card component or rendering helper.
- [ ] Add hover and click states for video cards.
- [ ] Morph the final company back into the Gavin signature.

### Phase 4: Contact section

- [ ] Build dark-themed form layout.
- [ ] Add social icon links.
- [ ] Add a form handler, such as Formspree or Netlify Forms, only when the deployment target is known.

### Phase 5: Polish

- [ ] Mobile responsiveness.
- [ ] Signature scales correctly on small screens.
- [ ] Video cards stack or become horizontal-scroll on mobile.
- [ ] Nav active state updates on scroll.
- [ ] `prefers-reduced-motion` skips morphs and shows content instantly.
- [ ] Use `will-change: transform` only where beneficial.
- [ ] Lazy-load thumbnails.
- [ ] Add favicon using a miniature `G` from the signature.

## MorphSVG notes

- Source path is `#path1` from the existing SVG.
- Extract the source `d` attribute carefully.
- Target shapes should be exported as SVG `<path>` elements from a vector editor when possible.
- If using `MorphSVGPlugin`, it can handle differing point counts.
- Use `shapeIndex: "auto"` or manually tune per company for cleaner morph mapping.
- `MorphSVGPlugin.convertToPath()` can help with basic shapes such as circles, rectangles, and polygons.
- Keep paths under roughly 500 anchor points for smoother animation.
- Use scroll-scrubbed animation so scroll position maps to morph progress.

## Placeholder company content

Use this until Gavin provides real client data:

```js
const companies = [
  {
    name: "Luxe Beauty",
    type: "Product Launch",
    views: "2.1M",
    targetPath: "",
    videos: [
      { title: "Teaser" },
      { title: "Unboxing" },
      { title: "Tutorial" }
    ]
  },
  {
    name: "Nova Tech",
    type: "Brand Awareness",
    views: "4.7M",
    targetPath: "",
    videos: [
      { title: "Launch" },
      { title: "Demo" },
      { title: "Story" },
      { title: "BTS" }
    ]
  },
  {
    name: "Apex Fitness",
    type: "UGC Campaign",
    views: "1.8M",
    targetPath: "",
    videos: [
      { title: "Before/After" },
      { title: "Routine" }
    ]
  }
];
```

## Definition of done

A task is done when the relevant requested changes are implemented and verified.

For the full target build, done means:

1. Page loads to a dark screen.
2. Gavin signature draws itself in white ink.
3. Draw timing still feels like the original `3.2s` animation.
4. Tagline fades up: `Stories that stop the scroll.`
5. Trailing stroke guides the eye downward.
6. Scrolling into Work smoothly morphs the signature into Company A's shape.
7. Company name, stats, and video cards fade in.
8. Continued scrolling morphs through each company.
9. Last company morphs back into the original signature.
10. Contact section includes form and social links.
11. Site remains responsive.
12. Reduced-motion users get a usable non-animated experience.
13. Visual performance remains smooth.

## Verification checklist

Before finishing a coding task, run the checks that apply:

```powershell
npx serve .
# or
python -m http.server 8080
```

Then verify:

- The page loads without console errors.
- The signature appears correctly.
- The signature draw animation still works unless intentionally replaced.
- Reduced-motion behavior still shows the signature.
- Navigation links scroll to the correct sections.
- Layout works on desktop and mobile widths.
- Any edited SVG still renders correctly.
- If both inline and standalone SVGs exist, they remain synced.

## Codex workflow

When using Codex in this repo:

1. Inspect the relevant files first.
2. Summarize the intended change before editing if the task is broad.
3. Make the smallest safe patch.
4. Do not introduce a build system unless the task requires it.
5. Preserve current behavior while adding new behavior.
6. Run available verification commands.
7. Report exactly what changed and what was verified.

## Things Codex should not do

- Do not replace the signature with a raster image.
- Do not flatten the SVG if the path needs to remain animatable.
- Do not remove `#path1`, `#draw-gavin`, `#draw-i-dot`, `#signature-mask`, or `#signature-art` unless replacing the whole SVG architecture by explicit request.
- Do not add white mask hacks to hide bad crossings.
- Do not hard-code real client names unless Gavin provides them.
- Do not add fake TikTok URLs.
- Do not use bold typography as the default style.
- Do not add bright accent colors that fight the black-and-white signature-first direction.
- Do not ignore mobile layout.
- Do not ignore reduced-motion users.
