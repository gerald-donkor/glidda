# 04 — The slipstream

## Goal

Build `components/motion/slipstream.tsx` — the one texture component in the system (§6.3) — and a
review surface for it on `/design-system`. Nothing on `/` changes in this prompt.

The slipstream is where the reference uses morphing blobs. §6.3 rejects those outright: Glidda's
texture is **long parallel streaks sheared ~12°, drifting along their own axis**, with an SVG
`feTurbulence` grain over the top. It must read as motion *along a line* — the same idea as the
Rail — and never as a lava lamp.

It is built before the hero deliberately. Five surfaces consume it later (the hero, the live demo
panel, and the three capability panels), so settling it against a bare review page is cheaper than
discovering on the hero that it does not survive being tinted three different ways.

## Skills and docs read

- `.agents/skills/gsap-react` — `useGSAP` with `scope`, automatic revert on unmount, no GSAP during
  SSR, `contextSafe` for handlers created after the hook runs. Refs for targets, not selector
  strings, unless a scope is passed.
- `.agents/skills/gsap-core` — `gsap.matchMedia()` with a named-conditions object and
  `context.conditions`; `mm.revert()` and never `gsap.context()` nested inside it; transform
  aliases (`xPercent`) over raw `transform`; `ease: "none"` for anything that must not accelerate.
- `.agents/skills/gsap-timeline` — `repeat: -1` on the timeline rather than per tween; `defaults`
  so child tweens do not repeat a duration; the `"<"` position parameter to start layers together.
- `.agents/skills/gsap-performance` — transform and opacity only; `will-change: transform` **only**
  on elements that actually animate; pause off-screen animations; do not create many overlapping
  tweens.
- `.agents/skills/gsap-scrolltrigger` (via prompt 03's reading) — `ScrollTrigger.create` with
  `onToggle` is the cheap way to know whether an element is on screen; every trigger is created
  inside `useGSAP` so its revert is automatic.
- `AGENTS.md` §6.1 (colour), §6.3 (texture), §7.1–§7.3 (motion), §9 (architecture), §12 (quality
  floor), §13 (code standards).

Not read: `gsap-utils` (no clamp/mapRange needed — the loop is one `xPercent` tween),
`gsap-plugins` (no plugin required; §3 says check licensing first, and nothing here needs one),
`frontend-design`. §3 scopes `frontend-design` to surfaces with no spec yet, and §6.3 is a spec:
form, angle, colour source, grain, and the explicit rejection of blobs are all stated.

## Existing code inspected

- `app/globals.css` — after prompt 03: six brand tokens, three route hues and their washes
  (`--wash-signal` 34% in white, `--wash-cable` 22%, `--wash-spruce` 24%), four radii, the rail and
  Ask bar geometry, motion primitives, and thirteen `@utility` blocks. No texture token exists yet.
- `lib/gsap/register.ts` — the single `registerPlugin` site; exports `gsap`, `ScrollTrigger`,
  `useGSAP`. This component imports from there and registers nothing.
- `lib/gsap/motion.ts` — `DURATION`, `EASE` (including `EASE.loop = "power1.inOut"` and
  `EASE.linear = "none"`), `STAGGER`, `TYPEWRITER`. Gains the slipstream's loop durations.
- `components/layout/rail.tsx` — the existing `gsap.matchMedia()` + `mm.revert()` shape this
  component follows exactly, so there is one reduced-motion idiom in the repo, not two.
- `app/design-system/page.tsx` — a `Group`-per-topic review route, `robots: { index: false }`,
  server component. Its `<main>` was demoted to a `<div>` in `e5db484`. Gains one `Group`.
- `components/motion/` — **does not exist yet.** §9 reserves it; this prompt creates it.

## Decisions and assumptions

### 1. The hero's slipstream is monochrome — flag this one

**This is the one decision here you may want to overrule, so it is first.**

§8's diagram puts a slipstream in the hero, and §6.3 says the component takes a hue prop. But §6's
governing rule is unambiguous: *"the page chrome is monochrome, and colour lives only inside feature
panels"*, and §6.1 lists the three route hues as existing *"only inside feature panels — one per
section, never on text, never on the rail, never two at once."* The hero is not a feature panel.

So the component ships **four** variants: `mono` plus the three routes. The hero and the live demo
panel get `mono` — streaks in `--surface` and `--rail` against `--ground`. The three capability
panels get their route.

This costs the hero its colour, which is a real loss. It buys two things: §6's rule survives intact,
and the first coloured surface on the page is the Answers panel, which is where colour is supposed
to mean something. A hero that is already amber makes the amber panel say nothing.

If you want the hero tinted, say so at approval and I will use `signal` there and record it in
`AGENTS.md` §6.1 as a stated exception rather than an undocumented drift.

### 2. Streaks are DOM elements with gradient backgrounds, not SVG, not canvas

Three layers of absolutely positioned `<span>`s inside a sheared, clipped container. Each streak
carries a horizontal `linear-gradient` running transparent → wash → transparent, so it has no hard
end and reads as a light streak rather than a bar.

Rejected — **SVG shapes**: no benefit here. There is no morphing, no path, no stroke; a rect with a
gradient fill is a div with more ceremony.

Rejected — **canvas**: it would give per-pixel control we do not need, cost a render loop we do not
want, produce nothing in the SSR HTML, and be invisible to `prefers-reduced-motion` without hand-
written branching. §7.1's whole point is that transform-only DOM work is enough.

### 3. The grain is a static CSS background, not a live filter

§6.3 specifies an `feTurbulence` grain overlay. It is implemented as a **single absolutely
positioned overlay element whose `background-image` is a `data:` URI SVG containing one
`feTurbulence` on one rect**, at low opacity with `mix-blend-mode: multiply`.

It is deliberately **not** `filter: url(#grain)` applied to the moving streaks. That would re-run
the turbulence filter on every animated frame, on a full-bleed element — the most expensive way to
draw noise the browser offers. A static overlay is painted once and then composited, and the streaks
sliding underneath it are what makes the grain read as moving.

The `data:` URI also sidesteps SVG `id` collisions: five slipstreams on one page would otherwise
need `useId()`-generated filter ids for no gain. The URI lives in `app/globals.css`, once.

### 4. The loop is three layers at three speeds, seamless by doubling

Each layer holds its streaks **twice**, side by side, and tweens `xPercent: 0 → -50` with
`ease: "none"`, `repeat: -1`. At -50% the second copy sits exactly where the first started, so the
loop has no seam and never resets visibly.

Three layers at different durations (§7.1's 8–20s ambient window: 20s, 15.5s, 11s) give depth
without parallax maths and without a shared period — the three only re-align every few minutes, so
the texture does not visibly repeat. Three tweens total, on three elements. `will-change: transform`
goes on those three elements and nowhere else (gsap-performance).

Rejected — **one layer with per-streak stagger**: staggered streaks drift apart and the band stops
reading as parallel.

### 5. `ease: "none"`, not `EASE.loop`

§7.1 gives `power1.inOut` for ambient loops, and that is right for something that breathes — a
vignette, a morph. A translating band easing in and out would visibly stall at each cycle boundary,
which is exactly the seam decision 4 exists to remove. Linear is the correct reading of §7.1's
intent here; noting it because it departs from the letter of the table.

### 6. The shear is on the container, and it is `rotate`, not `skew`

`rotate: -12deg` on a container that is oversized (`inset: -25%`) and clipped by an
`overflow: hidden` parent. Rotating keeps the streaks' thickness constant; `skewY` would stretch
them and thin the gradients unevenly. Oversizing prevents the rotated rectangle's corners from
pulling away from the panel edges.

The rotation is a **static** transform set in CSS, not animated — GSAP only touches `xPercent` on
the three layers, so there is no transform conflict between CSS and GSAP on the same element.

### 7. Off-screen loops are paused

One `ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onToggle })`
per instance, pausing and resuming the timeline. With five slipstreams on the finished page, only
the one or two in view run. Created inside `useGSAP`, so revert is automatic (§7.1).

### 8. The route is a `data-route` attribute, not an inline style

`data-route="signal" | "cable" | "spruce" | "mono"` on the root, with four CSS rules in
`app/globals.css` setting `--slipstream-wash` and `--slipstream-edge`. No colour value appears in
TSX and every hue stays in the one file that owns hues (§6.1, §13). An inline
`style={{ "--slipstream-wash": "var(--wash-signal)" }}` would work but scatters the mapping.

### 9. Intensity, not a second component

A `density` prop (`"panel" | "band"`) changes streak count and thickness only: `band` is the wide
shallow treatment the hero needs behind a CTA row, `panel` the denser fill for a ~1:1 feature panel.
Both are the same markup and the same three tweens — §6.3 says *one implementation, one component*,
and this keeps that true.

### 10. It renders something with JavaScript off

The streaks and the grain are CSS. Without JS the slipstream is a static sheared gradient field —
which is exactly the reduced-motion state (§7.2) — rather than an empty box. §12's JS-disabled
requirement is met by construction.

## Files likely to change

| File | Change |
| --- | --- |
| `components/motion/slipstream.tsx` | new — client, the whole component |
| `app/globals.css` | `--slipstream-*` tokens, the grain `data:` URI, `@utility` blocks `slipstream`, `slipstream-shear`, `slipstream-layer`, `slipstream-streak`, `slipstream-grain`; four `[data-route]` rules |
| `lib/gsap/motion.ts` | `+ SLIPSTREAM` — the three layer durations |
| `app/design-system/page.tsx` | `+ one Group` rendering all four routes and both densities |

Not touched: `app/page.tsx`, `app/layout.tsx`, everything in `components/layout/`,
`components/ask/`, `components/ui/`, `lib/copy/`. **No section on `/` consumes the slipstream in
this prompt** — the hero is prompt 05.

## Implementation requirements

### `components/motion/slipstream.tsx` — client

```tsx
export type SlipstreamRoute = "mono" | "signal" | "cable" | "spruce"
export type SlipstreamDensity = "band" | "panel"

export function Slipstream({
  route = "mono",
  density = "panel",
  className,
}: {
  route?: SlipstreamRoute
  density?: SlipstreamDensity
  className?: string
}): React.JSX.Element
```

- Root: `aria-hidden`, `data-route`, `data-density`, `slipstream` utility, `className` merged
  through `cn()`. It is decorative and conveys nothing (§12).
- Inside: one `slipstream-shear` element (the rotated, oversized frame), holding **three**
  `slipstream-layer` elements; each layer holds its streaks twice (decision 4). Then one
  `slipstream-grain` overlay, a sibling of the shear frame so the grain is not rotated with it.
- Streak count per layer comes from `density`: `band` → 3, `panel` → 5. Thicknesses and vertical
  offsets are a fixed array in the module, not random — a random field cannot be reviewed twice.
- Layers are targeted by **ref array**, not selector strings (`gsap-react`: refs for targets).
- One `useGSAP` scoped to the root:
  - `gsap.matchMedia()` with the same named-conditions shape as `components/layout/rail.tsx`.
  - Reduced branch: create nothing. The CSS-rendered static field is already the fallback (§7.2,
    decision 10). Return immediately.
  - Motion branch: one `gsap.timeline({ repeat: -1 })` is *not* right here, because the three
    layers have different periods. Use **three tweens**, each
    `gsap.to(layer, { xPercent: -50, duration: SLIPSTREAM.durations[i], ease: EASE.linear, repeat: -1 })`.
  - One `ScrollTrigger.create` per decision 7, pausing and resuming those three tweens.
  - Cleanup: `return () => mm.revert()`.

### `app/globals.css`

Tokens in `:root`:

```css
--slipstream-shear: -12deg;
--slipstream-grain-opacity: 0.14;
```

Route mapping — four rules, the only place the component meets a hue:

```css
[data-route="mono"]   { --slipstream-wash: var(--surface); --slipstream-edge: var(--rail); }
[data-route="signal"] { --slipstream-wash: var(--wash-signal); --slipstream-edge: var(--ground); }
[data-route="cable"]  { --slipstream-wash: var(--wash-cable);  --slipstream-edge: var(--ground); }
[data-route="spruce"] { --slipstream-wash: var(--wash-spruce); --slipstream-edge: var(--ground); }
```

Scope those selectors to the component (`.slipstream[data-route=…]`) so `data-route` never becomes
a global attribute hook (§13's specificity rule).

`@utility` blocks:

- `slipstream` — `position: absolute; inset: 0; overflow: hidden; isolation: isolate;`
  (`isolation` so the grain's `mix-blend-mode` composites against the slipstream only, never
  against the page behind it).
- `slipstream-shear` — `position: absolute; inset: -25%; rotate: var(--slipstream-shear);`
- `slipstream-layer` — `position: absolute; inset: 0; display: flex; width: 200%;
  will-change: transform;`
- `slipstream-streak` — the gradient:
  `background: linear-gradient(90deg, transparent, var(--slipstream-wash) 45%, var(--slipstream-wash) 55%, transparent);`
- `slipstream-grain` — `position: absolute; inset: 0; mix-blend-mode: multiply;
  opacity: var(--slipstream-grain-opacity); background-image: url("data:image/svg+xml,…");`
  where the URI is one `<svg>` containing
  `<filter><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3"/></filter>` over a
  full-size rect. `background-repeat: repeat` on a ~180px tile so the noise does not scale with the
  element.

Streak thickness and vertical position are set per-streak in TSX via CSS custom properties on the
element (`--streak-h`, `--streak-top`) from the fixed array — a custom property carrying a length is
not an arbitrary Tailwind value and keeps the geometry in one reviewable place.

### `lib/gsap/motion.ts`

```ts
export const SLIPSTREAM = {
  /** Three layer periods, seconds. Deliberately not multiples of each other, so the three
   *  layers do not re-align on a short cycle. Inside §7.1's 8–20s ambient window. */
  durations: [20, 15.5, 11],
} as const
```

### `app/design-system/page.tsx`

One new `Group title="Texture — the slipstream"` containing:

- A one-paragraph note in `--rail-muted` stating what the texture is for and that the page chrome
  variant is `mono` (decision 1), so the reviewer knows the monochrome one is intentional.
- A `band` specimen at full width, ~200px tall, on `--ground`, with a headline and a pill sitting on
  top of it — the hero's actual arrangement, because a texture reviewed on its own tells you nothing
  about whether copy survives on top of it.
- A row of three `panel` specimens, one per route, each a `rounded-panel` ~1:1 square, so the three
  hues can be compared side by side and against §6.1's "never two at once" rule (they are two at
  once *here*, on the review route, which is the point of a review route).

The parent of every specimen is `relative` and `overflow-hidden` — the component is `absolute
inset-0` and must be given a positioned box (document this in the component's doc comment).

## Visual spec

- **Angle** — `-12deg`, static, identical across every instance. It echoes the Rail's verticality by
  contradicting it slightly; it is not a decorative diagonal.
- **Streaks** — `band`: 3 per layer, 14–34px thick. `panel`: 5 per layer, 10–26px thick. Thickness
  varies within a layer; the *gaps* are wider than the streaks so the field stays open, never
  striped.
- **Colour** — the wash only, at full token strength, against `--ground`. The wash tokens are
  already 22–34% mixes, so no further opacity is applied to the streak itself; a second dilution
  would put the panels below the point where the three hues are distinguishable.
- **Grain** — `feTurbulence` at `baseFrequency: 0.8`, `numOctaves: 3`, tiled at ~180px,
  `mix-blend-mode: multiply`, opacity `0.14`. Visible as texture at arm's length, not as dirt.
- **Edges** — the streak gradients fade to transparent at both ends, so no streak ever ends in a
  hard vertical edge against the panel's rounded corner.
- **Responsive** — no breakpoint behaviour. It is a background: it fills its box at every width. The
  streak array is in percentages so 360px and 1440px get the same composition, not a cropped one.
- **Layering** — grain above streaks, both below content. Content sits in a sibling with a stacking
  context; the slipstream never needs a `z-index` above 0.

## Motion spec

| What | Trigger | Duration | Ease | Reduced motion |
| --- | --- | --- | --- | --- |
| Layer 1 drift (`xPercent` 0 → -50) | mount, `repeat: -1` | 20s | `none` | not created; static field |
| Layer 2 drift | mount, `repeat: -1` | 15.5s | `none` | not created |
| Layer 3 drift | mount, `repeat: -1` | 11s | `none` | not created |
| Pause / resume | `ScrollTrigger` `onToggle` | — | — | nothing to pause |

Transform only. No opacity animation, no filter animation, no colour animation. This is **not** a
fourth orchestrated moment (§7.3) — it is ambient texture, the same category as §7.3's note that
ambient loops run at 8–20s, and it is explicitly called for by §6.3.

## Accessibility requirements

- Root is `aria-hidden` and contains no text, no focusable node, and no `img` (§12 — decorative
  visuals are hidden).
- `prefers-reduced-motion: reduce` creates no tween at all; the static field is the fallback (§7.2).
- The grain must not reduce the contrast of anything on top of it. Any text placed over a slipstream
  is `--ink` on a wash that is at most 34% of its hue in white; the review surface exists partly to
  confirm this by eye, and the `band` specimen carries live copy for that reason.
- No `motion` package import; no `registerPlugin` outside `lib/gsap/register.ts`.
- The page renders with JS disabled: streaks and grain are CSS (decision 10).

## Acceptance criteria

1. `/design-system` renders one `band` specimen and three `panel` specimens; the three hues are
   distinguishable from each other and from `mono` at a glance.
2. The three layers drift continuously with no visible seam, reset, or stall over a 60-second watch.
3. The texture reads as parallel motion along one axis. If it reads as blobs, drifting fog, or a
   lava lamp, it is wrong regardless of what the code does (§6.3).
4. `--ink` copy and a solid pill sitting on the `band` specimen remain legible.
5. `prefers-reduced-motion: reduce`: a static sheared field, nothing moving, no tween created.
6. Scrolling a specimen out of view pauses its tweens; scrolling back resumes them.
7. With JavaScript disabled the field still renders.
8. Zero hex literals and zero arbitrary Tailwind values in `components/motion/`. Every colour comes
   from a wash or brand token.
9. No `registerPlugin` outside `lib/gsap/register.ts`; no `motion` import.
10. `npm run typecheck`, `npm run lint`, and `npm run build` all pass.
11. `/` is byte-for-byte unchanged in behaviour — no section consumes the slipstream yet.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build

grep -rniE '#[0-9a-f]{6}' components/motion --include='*.tsx'     # expect zero
grep -rnE '\[[0-9]+(px|rem)\]' components/motion --include='*.tsx' # expect zero
grep -rn registerPlugin app components lib                         # expect one: lib/gsap/register.ts
grep -rn 'from "motion' app components lib hooks                    # expect zero
git diff --stat app/page.tsx app/layout.tsx                         # expect no output
```

## Manual review steps

```bash
npm run dev
```

1. Open `http://localhost:3000/design-system` and scroll to "Texture — the slipstream".
2. Watch the `band` specimen for a full minute. Confirm: continuous drift in one direction, no
   seam, no stall, no moment where the three layers visibly line up.
3. Confirm the headline and pill on the `band` specimen stay legible against the moving texture.
4. Compare the three `panel` specimens. Each should be recognisably its route hue. If cable and
   spruce read as the same blue-green at panel size, say so — that is a §6.1 token problem, not a
   component problem, and it needs its own decision.
5. Squint at a panel. It should read as parallel streaks travelling along an axis. Report honestly
   if it reads as blobs.
6. Scroll the specimens fully off screen and back. Nothing should jump on return — a paused tween
   resumes where it stopped.
7. Resize 360 → 1440. The composition fills the box at every width; no streak ends in a hard edge.
8. Enable OS reduced motion, reload: a static field, nothing moving.
9. Disable JavaScript, reload: the field still renders.
10. Open `http://localhost:3000/` and confirm it is unchanged from prompt 03.
```
