# 01 — Design system

## Goal

Stand up Glidda's design system as defined in `AGENTS.md` §6 — colour tokens, three route hues, three
type faces, the fluid type scale, spacing/radius/hairline primitives — as a **standard Tailwind v4
CSS-first token layer**, wired into `app/globals.css` and `app/layout.tsx` so every later section
inherits it. Emit the `extract-design-system` skill's token artifacts, add the Glidda button variants
every §8 section depends on, and add a throwaway primitives route so the system is reviewable.

No page sections, no GSAP, no motion. This prompt produces tokens, the shell that carries them, and
the two button variants.

## Skills and docs read

- `.agents/skills/extract-design-system/SKILL.md`, `references/workflow.md`, `references/outputs.md`
- `.agents/skills/tailwind-design-system/SKILL.md`, `references/details.md`,
  `references/advanced-patterns.md` — v4 CSS-first config, token hierarchy, `@theme inline` vs
  `@theme`, `@utility`, CVA variants, `color-mix()` alpha variants, namespace overrides,
  React 19 ref-as-prop, container tokens
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` — `axes`, `variable`,
  `weight`, `subsets`, `display`
- `AGENTS.md` §5.3, §6, §9, §10, §12, §13, §14

## Extraction result and why it is not the source

Ran `npx extract-design-system https://handhold.io --extract-only`. Artifacts kept at
`.extract-design-system/raw.json` and `normalized.json`.

| Field | Result |
| --- | --- |
| `colors.palette` | one entry, `lab(0 0 0)`; `cssVariables` empty — the site's colour is canvas/WebGL, not computed CSS |
| `typography` | `bureauSerif` weight 200 headings, `Inter` 400/500 body |
| `borderRadius` | `3.35544e+07px` ×39 (pill), plus 8 / 24 / 32px |
| `spacing` | 8px scale with strays (`22.7969px`, `42.7969px`) |
| `shadows` | three low-confidence multi-layer ring stacks |
| `frameworks` | Tailwind + Radix + Headless UI + Prime + Fluent |

Unusable as a token source, and adopting it would violate §5.3 — `bureauSerif` is a licensed
commercial serif and the serif-display look is explicitly on the "leave" list. **Every token below is
hand-authored from §6.** Per the skill's own safety boundaries: a single page is not proof of a whole
design system, and extracted output is not authoritative without review. This is that review, and the
verdict is reject. The artifacts stay as a record of what was checked.

The skill's one genuinely portable finding is structural, not visual: the reference is
Tailwind + a headless primitive library, which is the stack we are already on. Nothing else carries over.

## Existing code inspected

- `app/globals.css` — Tailwind v4, `@import "shadcn/tailwind.css"`, `@theme inline` block mapping
  shadcn semantic vars, `:root` + `.dark` oklch neutral palettes, `@layer base`.
- `app/layout.tsx` — Geist + Geist_Mono, `create-next-app` metadata.
- `app/page.tsx` — placeholder `<div>Home</div>`.
- `components/ui/button.tsx` — CVA-based, `@base-ui/react`, existing `variant`/`size` sets.
- `components/ui/` — 60 primitives total. Only `button.tsx` is touched.
- `lib/utils.ts` — `cn()` only.
- `package.json` — no `typecheck` script (§14 says add it here).

## Decisions and assumptions

1. **Three-tier token hierarchy**, per the tailwind skill's Core Concept 1:

   ```text
   brand    §6.1 raw values      --ink, --ground, --signal, --route-cable …
     └── semantic  purpose       --color-background, --color-primary, --color-border …
           └── component         button pill variants, --shadow-ask
   ```

   Brand tokens are authored once in `:root`. Semantic tokens are the **existing shadcn var names
   remapped to point at brand tokens** — so all 60 primitives render in Glidda's palette with no fork
   of any of them. This is a value remap only; no var is renamed or removed. It is also the skill's
   "use semantic tokens, not `bg-blue-500`" rule applied to a codebase that already has a semantic layer.

2. **Tokens are authored in hex, not OKLCH — a deliberate deviation from the tailwind skill.** The
   skill's Do's recommend OKLCH for perceptual uniformity. `AGENTS.md` §6.1 is normative and specifies
   exact hex values, and `AGENTS.md` outranks a skill. Re-authoring them as OKLCH invites drift from
   the spec on every future diff. The OKLCH equivalents are recorded in `design-system/tokens.json`
   for reference and for any future perceptual ramp work:

   | Token | Hex | OKLCH |
   | --- | --- | --- |
   | `--ink` | `#17191C` | `oklch(21.26% 0.0067 258.37)` |
   | `--ground` | `#E9EBEE` | `oklch(93.94% 0.0046 258.33)` |
   | `--surface` | `#F7F8F9` | `oklch(97.87% 0.0017 247.84)` |
   | `--rail` | `#8A94A0` | `oklch(66.24% 0.0213 252.95)` |
   | `--signal` | `#FFC531` | `oklch(85.30% 0.1628 85.16)` |
   | `--paper` | `#FFFFFF` | `oklch(100% 0 0)` |
   | `--route-cable` | `#2F6BE8` | `oklch(56.23% 0.1998 262.56)` |
   | `--route-spruce` | `#16736B` | `oklch(50.28% 0.0823 186.03)` |

3. **`@theme inline` throughout**, since every Glidda theme var references another CSS var — that is
   exactly the skill's stated condition for `inline`. The existing block already uses it.

4. **Custom classes are `@utility`, not `@layer` classes.** The skill's v4 pattern; unlike a plain
   `.font-display` class they compose with variants and responsive modifiers, and they keep
   specificity flat as §13 requires.

5. **Namespace override `--color-*: initial` was considered and rejected.** It would hard-enforce
   §6.1's "never hardcode a hex" by deleting Tailwind's default palette, but the 60 shadcn primitives
   reference defaults (`bg-black/80`, destructive reds) and would break en masse. Enforcement is the
   grep check in §Checks instead. Revisit only if the primitives are ever audited.

6. **Dark mode stays out, and the `.dark` block stays in, unmodified.** The tailwind skill's "don't
   forget dark mode" is overridden by §6.1, which puts it out of scope. Deleting the block and
   `@custom-variant dark` would break `dark:` utilities baked into the primitives and is an unrelated
   refactor (§13). Nothing toggles it, so it is inert — but note it now carries stale neutral values
   that no longer relate to the Glidda palette. Flagged, not fixed.

7. **Archivo's width axis is exposed**, so §6.2's "set it wide (~115)" is honoured properly:
   `axes: ["wdth"]` plus `font-variation-settings: "wdth" 115`. Per the font docs, `weight` must be
   omitted when `axes` is used; weight 600 is set in CSS. No `transform: scaleX`.

8. **Geist and Geist_Mono are removed** — `create-next-app` defaults, not §6 faces. The dangling
   `--font-mono: var(--font-geist-mono)` is repointed at Martian Mono.

9. **`design-system/tokens.json` and `tokens.css` are hand-authored in the skill's documented output
   shape**, not produced by `npx extract-design-system init` — `init` would regenerate them from the
   rejected handhold.io normalization. `tokens.css` is a **reference artifact and is not imported**;
   `app/globals.css` is the single runtime source. Two live files defining the same vars is exactly
   the specificity fight §13 forbids.

10. **`components/ui/button.tsx` gains two variants and is the only primitive touched.** §8 uses a
    solid ink pill and a light secondary pill in the header, hero, demo panel, route, generator, and
    closing CTA — six sections. Per §10, a primitive needing a variant gets it via `cva` *in that
    file*, never a wrapper. Adding them here means no section prompt re-invents a button. This is a
    small scope addition beyond pure tokens; it is called out rather than slipped in.

11. **Motion tokens are CSS custom properties only** — durations and eases from §7.1, so §13's "never
    repeat a duration literal" holds at the CSS layer for the 0.15–0.25s hovers. No `@keyframes`, no
    `--animate-*`: nothing animates yet, and §7 assigns real motion to GSAP.

12. Fluid type uses `clamp()`, min at 360px and max at 1440px per §12's test widths.

13. **The primitives route is out of §1's one-route scope** and was approved as a review surface. It
    lives at `/design-system`, is `robots: { index: false }`, and is listed as a deletion candidate in
    the completion report.

## Files likely to change

| File | Change |
| --- | --- |
| `app/globals.css` | brand tokens, `@theme inline` additions, semantic remap, `@utility` blocks, base styles |
| `app/layout.tsx` | three `next/font/google` faces, Glidda metadata |
| `components/ui/button.tsx` | two CVA variants + one size, no other edit |
| `lib/utils.ts` | add `focusRing` and `disabledState` composables |
| `design-system/tokens.json` | new — normalized token record incl. OKLCH equivalents |
| `design-system/tokens.css` | new — standalone reference, not imported |
| `app/design-system/page.tsx` | new — primitives review route |
| `package.json` | add `"typecheck": "tsc --noEmit"` |
| `.gitignore` | add `.extract-design-system/` |

Not touched: the other 59 files in `components/ui/`, `components.json`, `app/page.tsx`.

## Implementation requirements

### Brand tokens — `:root`

Exactly the §6.1 and §6.3 values:

```css
--ink: #17191C;  --ground: #E9EBEE;  --surface: #F7F8F9;
--rail: #8A94A0; --signal: #FFC531;  --paper: #FFFFFF;
--route-signal: #FFC531; --route-cable: #2F6BE8; --route-spruce: #16736B;
```

Derived, via `color-mix()` per the skill's alpha-variant pattern, so no component recomputes them:

```css
--rail-hairline: color-mix(in oklab, var(--rail) 40%, transparent);  /* §6.3 */
--rail-muted:    color-mix(in oklab, var(--rail) 60%, var(--ink));   /* text-safe, see a11y */
--rail-subtle:   color-mix(in oklab, var(--rail) 30%, transparent);
--shadow-ask: 0 8px 32px -8px color-mix(in oklab, var(--ink) 18%, transparent);
```

Layout primitives:

```css
--rail-inset: clamp(16px, 4vw, 64px);
--section-rhythm: clamp(96px, 12vw, 176px);
--gutter: clamp(16px, 4vw, 24px);
```

Motion primitives (§7.1):

```css
--duration-micro: 200ms;  --duration-entrance: 600ms;
--ease-entrance: cubic-bezier(0.22, 0.61, 0.36, 1);   /* power2.out */
--ease-arrested: cubic-bezier(0.16, 1, 0.3, 1);       /* power3.out */
```

### Theme exposure — `@theme inline`

- **Colours** → `--color-ink`, `--color-ground`, `--color-surface`, `--color-rail`, `--color-signal`,
  `--color-paper`, `--color-route-signal`, `--color-route-cable`, `--color-route-spruce`,
  `--color-rail-muted`, `--color-rail-hairline`
- **Fonts** → `--font-display`, `--font-body`, `--font-utility`; repoint `--font-sans` → body,
  `--font-mono` → utility, `--font-heading` → display
- **Type scale** → `--text-hero`, `--text-headline`, `--text-panel`, `--text-quote`, `--text-body`,
  `--text-small`, `--text-eyebrow`
- **Radii** → `--radius-chip: 4px`, `--radius-card: 12px`, `--radius-panel: 20px`,
  `--radius-pill: 999px`. §6.3 says nothing between 4 and 12; shadcn's existing `--radius-sm…4xl`
  ladder is left alone so primitives keep working, but Glidda surfaces use the four named radii only.
- **Spacing** → `--spacing-rhythm`, `--spacing-gutter`
- **Container** → `--container-content: 1200px` (§6.3 max-width), per the skill's container-token pattern
- **Shadow** → `--shadow-ask`

Type scale (§6.2, fluid 360 → 1440):

| Token | clamp |
| --- | --- |
| hero | `clamp(2.75rem, 1.36rem + 6.19vw, 5.25rem)` |
| headline | `clamp(1.875rem, 1.146rem + 3.24vw, 3.25rem)` |
| panel | `clamp(1.375rem, 1.176rem + 0.88vw, 1.75rem)` |
| quote | `clamp(1.375rem, 0.977rem + 1.77vw, 2.125rem)` |
| body | `clamp(1rem, 0.967rem + 0.15vw, 1.0625rem)` |
| small | `0.875rem` |
| eyebrow | `0.6875rem` |

### Semantic remap — `:root`

Values only, names untouched:

```text
--background: var(--ground)          --foreground: var(--ink)
--card / --popover / --secondary / --accent / --muted: var(--surface)
--card-foreground / --popover-foreground / --secondary-foreground / --accent-foreground: var(--ink)
--primary: var(--ink)                --primary-foreground: var(--paper)
--muted-foreground: var(--rail-muted)
--border / --input: var(--rail-hairline)
--ring: var(--ink)                   --radius: 0.75rem
```

### Utilities — `@utility`

- `font-display` — Archivo, weight 600, `font-variation-settings: "wdth" 115`, tracking `-0.02em`
- `font-utility` — Martian Mono, 500, uppercase, tracking `0.12em`, `--text-eyebrow`
- `hairline-b` / `hairline-t` — `1px solid var(--rail-hairline)` on one edge
- `content-shell` — `max-width: var(--container-content)`, inline auto margins, `--gutter` padding
- `section-rhythm` — `padding-block: var(--section-rhythm)`. §13: section spacing lives on the section
  element only; children never set outer margins.

### Base layer

`body` → body face, `--text-body`, `bg-ground`, `text-ink`, antialiased. Headings → display face,
weight 600, tracking `-0.02em`; `h1` adds leading `0.95`. Keep every selector single-class or element,
no nesting depth.

### Fonts — `app/layout.tsx`

```ts
Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display-family", display: "swap" })
Instrument_Sans({ subsets: ["latin"], weight: ["400","500"], variable: "--font-body-family", display: "swap" })
Martian_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-utility-family", display: "swap" })
```

All three `.variable` classes plus `antialiased` on `<html>`. `@theme inline` maps
`--font-display: var(--font-display-family), sans-serif`, and so on. Metadata becomes Glidda's title
plus a one-line description consistent with §1. Both Geist imports removed.

### Button variants — `components/ui/button.tsx`

Extend the existing `cva` config in place. Add to `variant`:

- `pill` — `bg-ink text-paper rounded-pill` , hover lightens via
  `hover:bg-ink/90`, `transition-colors duration-[--duration-micro] ease-[--ease-entrance]`
- `pillSecondary` — `bg-surface text-ink rounded-pill hairline`, hover `hover:bg-rail-subtle`

Add to `size`: `pill` — `h-11 px-6 text-body`. Do not change existing variants, do not add a wrapper
component, do not use `forwardRef` (React 19 passes ref as a prop). Both variants compose `focusRing`
from `lib/utils.ts`.

### `lib/utils.ts`

Add alongside `cn()`, per the skill's utility-functions pattern:

```ts
export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ground";
export const disabledState = "disabled:pointer-events-none disabled:opacity-50";
```

### Token artifacts — `design-system/`

`tokens.json` follows `references/outputs.md`'s normalized shape (`source`, `colors`, `typography`,
`spacing`, `radius`, `shadows`), with `source.extractor: "hand-authored"`, hex plus OKLCH per colour,
and a `source.note` recording that the handhold.io extraction was reviewed and rejected per §5.3.
`tokens.css` is the same values as flat `:root` custom properties, headed by a comment stating it is a
reference artifact and that `app/globals.css` is the runtime source.

### Primitives route — `app/design-system/page.tsx`

Server component. No `"use client"`, no GSAP, no animation. Renders, each labelled with its token name
in the Utility face: six core swatches with measured contrast ratios, three route hues, the full type
scale as live specimens, the four radii, the hairline, the one permitted shadow, and both button
variants in default / hover / focus / disabled. Tokens via Tailwind utilities only — no hex, no
arbitrary values (the skill's "extend `@theme` instead" rule). Under 200 lines; extract a local
`Swatch` subcomponent if it runs over. `export const metadata = { robots: { index: false } }`.

### `package.json`

Add `"typecheck": "tsc --noEmit"`.

## Accessibility requirements

Measured, not assumed — computed with the WCAG relative-luminance formula:

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `--ink` on `--ground` | **14.75:1** | pass |
| `--ink` on `--surface` | **16.57:1** | pass |
| `--paper` on `--ink` | **17.61:1** | pass |
| `--rail` on `--ground` | **2.58:1** | **fails — never text** |
| `--signal` on `--ground` | **1.32:1** | **fails — never text** |
| `--rail-muted` (`#5C636B`) on `--ground` | **5.09:1** | pass |
| `--route-cable` on `--paper` | 4.78:1 | pass |
| `--route-spruce` on `--paper` | 5.68:1 | pass |

**One conflict inside `AGENTS.md` needs a decision.** §6.1 permits `--rail` as "muted text at ≥60%
only". Read literally as 60% *opacity over `--ground`*, that lightens the colour toward the
background and lands at roughly 1.9:1 — worse than raw `--rail`'s already-failing 2.58:1, and a direct
violation of §12's 4.5:1 floor. §12 is the stricter rule, so it wins. Resolution: `--rail-muted` mixes
rail **60% toward `--ink`**, giving `#5C636B` at **5.09:1**. That is the only token permitted for muted
body text. Raw `--rail` is hairlines and the inactive rail length only. Flag this in the completion
report so §6.1's wording can be corrected.

Also:

- `--signal` at 1.32:1 is a **surface and rail accent only** — never text, never a lone focus ring.
  The primitives route must label it as such.
- Focus is `--ring: var(--ink)` via `focusRing`; no outline removed anywhere (§12).
- Primitives route: one `h1`, `h2` per group, in order.
- Swatches carry visible text labels — never colour alone.
- Button variants keep an accessible name and a visible focus ring in every state.

## Motion spec

None. No GSAP, no `useGSAP`, no `motion`, no `@keyframes`. The only movement is the button hover
colour transition, at `--duration-micro` (200ms, inside §7.1's 0.15–0.25s micro band) with
`--ease-entrance`. A `prefers-reduced-motion` branch is not required for a colour transition, and §7.3's
three orchestrated moments belong to later prompts.

## Acceptance criteria

1. Every §6.1 colour, §6.2 face and size, and §6.3 spacing/radius/hairline value exists as a token and
   is reachable as a Tailwind utility.
2. No hex literal and no arbitrary value (`text-[44px]`, `bg-[#fff]`) in any `.tsx`.
3. Three faces load through `next/font`, self-hosted, no layout shift, no external font request.
4. Archivo renders at `wdth` 115 — verified in devtools computed styles, not assumed.
5. The other 59 shadcn primitives pick up Glidda's palette with zero edits to their files.
6. Both button variants render as pills at `--radius-pill`, with visible focus.
7. `npm run typecheck` and `npm run lint` pass clean; `npm run build` succeeds (fonts, metadata, and
   config changed, so build is required per §14).
8. No horizontal scroll on the primitives route at 360 / 768 / 1024 / 1440.
9. `app/page.tsx` untouched; `design-system/tokens.css` imported nowhere.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rniE "#[0-9a-f]{6}" app components --include=*.tsx        # expect zero
grep -rnE "\[[0-9]+(px|rem)\]" app components --include=*.tsx   # expect zero
```

`grep -rn "placeholder: true" lib/copy/` is not applicable — this prompt creates no fixtures.

## Manual review steps

```bash
npm run dev
```

1. Open `http://localhost:3000/design-system`.
2. Background is zinc mist `#E9EBEE` — cool, not cream. Text is graphite `#17191C`, not pure black.
3. Inspect the hero specimen: computed `font-family` Archivo, `font-weight` 600,
   `font-variation-settings: "wdth" 115`, `letter-spacing` −0.02em, `line-height` 0.95.
4. Inspect an eyebrow: Martian Mono, uppercase, 11px, tracking 0.12em.
5. Hover both button variants — colour shifts over ~200ms, nothing moves or resizes.
6. Resize through 360 / 768 / 1024 / 1440. Hero scales 44 → 84px. No horizontal page scroll at any width.
7. Tab the whole page — every focusable element shows a visible graphite ring on an offset.
8. Confirm the muted-text swatch reads as `#5C636B`, not `#8A94A0`.
9. Open `http://localhost:3000/` — still the untouched placeholder.
