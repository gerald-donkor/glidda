# 02 — Design system revision

## Goal

Replace the design system delivered in `prompts/01-design-system.md` with one derived from the
full-page screenshot the user supplied, using the **"same feel, our own values"** approach the user
chose. Structure, density, and hierarchy come from the reference; every specific colour, face, and
size is Glidda's own.

Token **names** are unchanged — only their values, the type scale, the radii, and the display face
change. That keeps the diff to five files and leaves all 60 shadcn primitives and both button
variants working untouched.

`AGENTS.md` §6 is rewritten in the same pass, because it is the stated source of truth and would
otherwise contradict the code from the moment this lands.

No page sections, no GSAP, no motion.

## Skills and docs read

- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` — `axes`, `weight`,
  `variable`, `display`. Confirmed: for a variable font only `wght` is included by default; extra
  axes must be named in `axes`, and `weight` is omitted so the whole range stays available.
- `AGENTS.md` §2, §5.3, §6, §9, §10, §12, §13, §14
- `prompts/01-design-system.md` — the system being replaced

Not re-read: `.agents/skills/tailwind-design-system` and `.agents/skills/shadcn`. Prompt 01 already
applied their structure (three-tier tokens, `@theme inline`, `@utility`, CVA-in-place), and this
revision changes values inside that structure, not the structure itself.

## Reference measurement — how these numbers were obtained

The screenshot (`1146×6516`, handhold.io full page) was decoded to raw RGB with `ffmpeg` and sampled
programmatically. These are measured, not estimated:

| Reading | Measured |
| --- | --- |
| Page background | `#FFFFFF` — 56% of all page pixels |
| Panel / announce-bar / card fill | `#F2F1ED` — 13% of all page pixels, a warm greige |
| Text and buttons | `#000000`, with `#18181B` appearing (a Tailwind zinc default) |
| Muted label text | `#737373`; footer legal `#9B9B9B` |
| Hairline rules | ~`#E5E5E5` (sampled `#CCCCCC` at the antialiased core of a 1px rule) |
| In-panel accent | `#2B8BFF` — appears in all three panels, never on the page itself |
| Panel washes | amber `#F5D897`, mint `#9AE5B4`, peach `#FDE9D0` |
| Hero headline | glyph span 61px, line pitch 65px → ~64px at `line-height: 1.02` |
| Section headline | span 34px, pitch 37px → ~35px at `line-height: 1.06` |
| FAQ question | span 33px, pitch 35px → same size as a section headline |

**The two structural findings that matter most:**

1. **The page is white and the panels are the tinted surface** — the inverse of the current system,
   where the page is zinc mist `#E9EBEE` and panels are near-white `#F7F8F9`.
2. **There are only two display sizes** — one hero size (~64px) and one "everything else" size
   (~35px) used for section headlines, feature headlines, FAQ questions, and card headings alike.
   The current scale has four distinct display steps and a 52px section headline. Collapsing to two
   is most of what makes the reference read as calm.

Colour is confined entirely to the inside of feature panels. The page chrome — buttons, links,
rules, text — is monochrome. That is why the reference tolerates so much whitespace without looking
empty, and it is the single most portable idea in the screenshot.

## Existing code inspected

- `app/globals.css` (276 lines) — brand tokens in `:root`, `@theme inline` map, shadcn semantic
  remap, inert `.dark` block, seven `@utility` blocks, `@layer base`.
- `app/layout.tsx` — Archivo (`axes: ["wdth"]`), Instrument Sans 400/500, Martian Mono 500.
- `components/ui/button.tsx` — `pill` / `pillSecondary` variants referencing `bg-ink`, `text-paper`,
  `bg-surface`, `hover:bg-rail-subtle`, `rounded-pill`, `hairline`. **No edit needed** under a
  names-unchanged revision.
- `app/design-system/page.tsx` (181 lines) — references `ink`, `ground`, `surface`, `paper`, `rail`,
  `rail-muted`, `rail-hairline`, `rail-subtle`, `signal`, and the three route hues. Needs its
  swatch labels, contrast figures, and type specimens updated; token names it uses all survive.
- `design-system/tokens.json`, `design-system/tokens.css` — reference artifacts, imported nowhere.
- `ref/reference.md` — **stale and unrelated.** It is a copy of a different project's `AGENTS.md`
  (PIXCA, a news-analysis app). It has no bearing on this work and is not treated as guidance.

## Decisions and assumptions

### 1. This overrides `AGENTS.md` §6, on the user's explicit instruction

§2 permits a user request to override project rules when the deviation is explicitly asked for. The
user was shown the §5.3 conflict, confirmed the current system does not match what they want, chose
"same feel, our own values", and asked that the fonts be changed too. §6 is therefore rewritten as
part of this prompt rather than silently contradicted.

### 2. §5.3 still holds, and is what "our own values" means here

We take from the screenshot: the white ground, the single tinted surface tone, the monochrome page
chrome, colour confined to panels, the two-step display scale, the low-density spacing, black pill
buttons, faint hairlines. We do **not** take: their greige `#F2F1ED`, their pure `#000000`, their
`bureauSerif` display face, their `#2B8BFF`, their amber/mint/peach wash trio, or the grainy mesh
gradient. Glidda's slipstream (§6.3) remains the panel texture, and the Rail (§6.4) remains — the
reference has no equivalent of either.

### 3. Token names do not change; values do

`--rail` keeps its name but stops being steel-grey and becomes the hairline tone. `--signal` keeps
its name but is demoted from "the one accent" to "the Answers route wash", because the reference's
page chrome carries no accent colour at all and adopting that is most of the effect.

### 4. The Rail survives, restyled — flag for confirmation at approval

The screenshot has no rail; the Rail is Glidda's own signature (§6.4, §8) and the user did not ask
to drop it. Recommendation: **keep it**, but repaint it — inactive length `--rail` (`#E4E5E3`),
travelled length `--ink`, station labels in the Utility face. Signal yellow no longer paints it.
That keeps Glidda's identity while adopting the reference's monochrome chrome. **If you want the
Rail removed instead, say so at approval — it changes §6.4 and every later section prompt.**

### 5. Display face — Newsreader, weight 300

This is the largest single visual change and the one the user explicitly asked for ("make sure you
add the fonts too"). The reference's look is driven by a light-weight serif set very large with
near-1.0 leading. Archivo — a grotesk, deliberately "not a serif" under the current §6.2 — cannot
produce that feel at any weight.

`Newsreader` (Google Fonts, variable 200–800, `opsz` axis) at weight 300. It is an editorial
low-contrast serif, distinct from the reference's licensed `bureauSerif`, and its optical-size axis
means it holds up at 64px without the thin strokes shattering.

Alternate if Newsreader reads too editorial in review: `Source Serif 4` Light. Stated here so the
swap is a one-line change rather than a rethink.

Body stays **Instrument Sans** (the reference uses Inter; ours is already a different, neutral
grotesque — no reason to churn it). Utility stays **Martian Mono**. Only the display face changes.

### 6. `--ink` is not pure black

The reference uses `#000000`. `#101114` at 18.9:1 on white is functionally identical in contrast,
avoids the harshness of true black against a light serif, and is ours rather than theirs.

### 7. Radii move off the §6.3 ladder

The reference's large panels are ~24px and its cards ~14px. §6.3's "nothing between 4 and 12" is
replaced by an explicit four-value set: `6 / 14 / 24 / 999`. Recorded in the §6 rewrite.

### 8. Muted text is authored, not mixed

Prompt 01 derived `--rail-muted` via `color-mix` and flagged a §6.1/§12 contradiction. Under the new
palette the mix arithmetic no longer lands anywhere useful, so `--rail-muted` is authored directly
as `#5F6266` — 6.13:1 on `--ground`, 5.4:1 on `--surface`, passing on both. The §6.1 wording that
caused the contradiction is deleted in the rewrite rather than left to be re-discovered.

### 9. Dark mode still out of scope; `.dark` block still inert and untouched

## Files likely to change

| File | Change |
| --- | --- |
| `AGENTS.md` | §6 rewritten; §5.3 gains a line recording this override; §12's contrast note updated |
| `app/globals.css` | token values, type scale, radii, wash tokens, base-layer leading |
| `app/layout.tsx` | Archivo → Newsreader |
| `app/design-system/page.tsx` | swatch values, contrast figures, type specimens |
| `design-system/tokens.json` | regenerated to the new values |
| `design-system/tokens.css` | regenerated to the new values |

Not touched: `components/ui/*` (all 60, including `button.tsx`), `lib/utils.ts`, `app/page.tsx`,
`package.json`, `components.json`, the `.dark` block.

## Implementation requirements

### Brand tokens — `:root`

```css
--ink:     #101114;   /* text, buttons, the travelled rail */
--ground:  #FFFFFF;   /* the page */
--surface: #F0F1EE;   /* panels, cards, announce bar, inset blocks */
--rail:    #E4E5E3;   /* hairlines, the untravelled rail */
--paper:   #FFFFFF;   /* inputs, floating chips, the Ask bar — white on a tinted panel */
--signal:  #FFC531;   /* no longer a page accent; the Answers wash only */

--route-signal: #FFC531;
--route-cable:  #2F6BE8;
--route-spruce: #16736B;
```

Derived:

```css
--rail-muted:    #5F6266;                                        /* authored, see decision 8 */
--rail-hairline: var(--rail);                                    /* no 40% mix — the tone is the hairline */
--rail-subtle:   color-mix(in oklab, var(--rail) 45%, transparent);
--wash-signal:   color-mix(in oklab, var(--route-signal) 34%, white);
--wash-cable:    color-mix(in oklab, var(--route-cable)  22%, white);
--wash-spruce:   color-mix(in oklab, var(--route-spruce) 24%, white);
--ask-shadow:    0 10px 40px -12px color-mix(in oklab, var(--ink) 14%, transparent);
```

Layout and motion primitives are unchanged from prompt 01, except:

```css
--section-rhythm: clamp(112px, 13vw, 200px);   /* was 96/12vw/176 — the reference is airier */
```

### Type scale — `@theme inline`

Two display steps, per the measurement above. Fluid 360 → 1440.

| Token | clamp | Was |
| --- | --- | --- |
| `--text-hero` | `clamp(2.5rem, 1.5rem + 4.44vw, 4.75rem)` (40 → 76px) | 44 → 84 |
| `--text-headline` | `clamp(1.625rem, 1.236rem + 1.73vw, 2.5rem)` (26 → 40px) | 30 → 52 |
| `--text-panel` | `clamp(1.25rem, 1.083rem + 0.74vw, 1.625rem)` (20 → 26px) | 22 → 28 |
| `--text-quote` | `clamp(1.375rem, 0.986rem + 1.73vw, 2.25rem)` (22 → 36px) | 22 → 34 |
| `--text-body` | `clamp(0.9375rem, 0.909rem + 0.12vw, 1rem)` (15 → 16px) | 16 → 17 |
| `--text-small` | `0.875rem` (14px) | unchanged |
| `--text-eyebrow` | `0.6875rem` (11px) | unchanged |

`--text-headline` is used for section headlines, feature headlines, FAQ questions, and card headings
alike. `--text-panel` exists only for the small headings inside vignettes and capability cards.

### Radii

```css
--radius-chip:  6px;
--radius-card:  14px;
--radius-panel: 24px;
--radius-pill:  999px;
```

shadcn's `--radius-sm…4xl` ladder stays as-is so the primitives keep working.

### Fonts — `app/layout.tsx`

```ts
Newsreader({ subsets: ["latin"], axes: ["opsz"], variable: "--font-display-family", display: "swap" })
```

`weight` omitted so the full 200–800 range is available; 300 is set in CSS. Archivo and its
`axes: ["wdth"]` are removed. Instrument Sans and Martian Mono are unchanged, as are their variable
names, so `@theme inline` needs no font edits.

### Utilities and base layer

- `type-display` — Newsreader, `font-weight: 300`, `letter-spacing: -0.01em`. **Delete
  `font-variation-settings: "wdth" 115`** — Newsreader has no width axis and the declaration would
  be silently inert.
- `hairline` / `hairline-b` / `hairline-t` — `1px solid var(--rail-hairline)`, unchanged in shape.
- `content-shell`, `section-rhythm`, `type-utility` — unchanged.
- `@layer base`: `body` background becomes `--ground` (now white). `h1` `line-height: 1.02`,
  `h2`–`h4` `line-height: 1.06`, all at weight 300 with `-0.01em` tracking.

### Semantic remap — `:root`

Names untouched. `--background: var(--ground)` now resolves to white; `--card` / `--popover` /
`--secondary` / `--muted` / `--accent` resolve to the greige `--surface`, which is what gives every
shadcn primitive the reference's panel tone for free. `--border` / `--input: var(--rail-hairline)`.

### `app/design-system/page.tsx`

Same structure, updated content: the six core swatches at their new values with recomputed contrast
ratios, the three route hues **plus their three wash tokens**, the two-step display scale shown as
live specimens at both sizes, the four new radii, the hairline, the Ask shadow, and both button
variants in default / hover / focus / disabled. Stays a server component, stays `robots: index:
false`, stays under 200 lines. Add a short note that `--signal` is a wash, not an accent.

### `AGENTS.md` §6 rewrite

Replace §6.1–§6.3 wholesale with the values above. Specifically:

- §6.1's colour table takes the new hex values; the "muted text at ≥60%" clause that contradicted
  §12 is **deleted** and replaced by "muted text uses `--rail-muted` only".
- §6.2's "Engineered and signage-like, deliberately not a serif" and the Archivo paragraph are
  replaced by the Newsreader specification; the type-scale table takes the two-step scale.
- §6.3's radius rule takes `6 / 14 / 24 / 999`.
- §6.4 is edited only where it names signal yellow: the travelled rail paints to `--ink`.
- §5.3 gains one line recording that the user approved a structural revision from their screenshot
  on 2026-07-26, and that the "leave" list is otherwise unchanged and still binding.

Everything else in `AGENTS.md` — §7 motion, §8 structure, §9 architecture, §11 copy, §12 quality —
is left exactly as written.

## Visual spec

- **Page** is white. **Panels, cards, and the announcement bar** are `--surface` greige, at
  `--radius-panel` for full-width blocks and `--radius-card` for cards.
- **Buttons** are `--ink` pills with `--paper` labels; the secondary is `--surface` with a hairline.
  Unchanged from prompt 01 — the tokens carry the new values automatically.
- **Rules** are 1px `--rail` and near-invisible by design; they separate, they do not decorate.
- **Colour appears only inside feature panels**, as a `--wash-*` gradient. Nothing on the page
  chrome — no coloured link, no coloured button, no coloured focus ring — carries a route hue.
- **Density is low.** Section rhythm 112 → 200px, and body copy sits at 15–16px against a 26–40px
  headline. The contrast between the two is what carries hierarchy, not weight or colour.
- Responsive: unchanged container (1200px) and gutters (16 → 24px).

## Motion spec

None, as in prompt 01. The only movement is the existing 200ms button hover colour transition at
`--duration-micro` / `--ease-entrance`. No GSAP, no `@keyframes`, no `motion`. §7.3's three
orchestrated moments belong to later prompts.

## Accessibility requirements

Computed with the WCAG relative-luminance formula against the new palette:

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `--ink` on `--ground` | **18.88:1** | pass |
| `--ink` on `--surface` | **16.65:1** | pass |
| `--paper` on `--ink` | **18.88:1** | pass |
| `--rail-muted` on `--ground` | **6.13:1** | pass |
| `--rail-muted` on `--surface` | **5.4:1** | pass |
| `--route-cable` on `--ground` | 4.78:1 | pass — panels only |
| `--route-spruce` on `--ground` | 5.68:1 | pass — panels only |
| `--rail` on `--ground` | 1.26:1 | **never text** — hairlines only |
| `--signal` on `--ground` | 1.58:1 | **never text** — wash only |

- Body copy at 15px minimum; `--text-small` (14px) is the floor and never carries `--rail`.
- A light-weight serif at 15–16px is a legibility risk: **body copy never uses the display face.**
  Newsreader 300 is permitted at `--text-panel` and above only. Enforce in review, note it in §6.2.
- Focus stays `--ring: var(--ink)` via `focusRing`; no outline removed anywhere.
- Primitives route: one `h1`, `h2` per group, in order; swatches carry visible text labels.

## Acceptance criteria

1. Every value in this prompt exists as a token in `app/globals.css` and is reachable as a Tailwind
   utility.
2. No hex literal and no arbitrary value in any `.tsx`.
3. Newsreader loads through `next/font`, self-hosted, no external font request, no layout shift.
   Archivo no longer appears in the bundle.
4. `font-variation-settings` is absent from `type-display` and from the base heading rule.
5. The page background is `#FFFFFF` and panel surfaces are `#F0F1EE` — verified in devtools.
6. All 60 shadcn primitives and both button variants render correctly with **zero edits** to
   `components/ui/`.
7. `AGENTS.md` §6 matches `app/globals.css` value for value.
8. `npm run typecheck`, `npm run lint` pass clean; `npm run build` succeeds (fonts changed).
9. No horizontal scroll on `/design-system` at 360 / 768 / 1024 / 1440.
10. `app/page.tsx` untouched; `design-system/tokens.css` imported nowhere.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rniE "#[0-9a-f]{6}" app components --include=*.tsx        # expect zero
grep -rnE "\[[0-9]+(px|rem)\]" app components --include=*.tsx   # expect zero
grep -rn "Archivo\|wdth" app components                         # expect zero
```

`grep -rn "placeholder: true" lib/copy/` is not applicable — this prompt creates no fixtures.

## Manual review steps

```bash
npm run dev
```

1. Open `http://localhost:3000/design-system`.
2. Page background is pure white; every panel and card is the greige `#F0F1EE`. The old zinc-mist
   page background is gone.
3. Inspect the hero specimen: computed `font-family` Newsreader, `font-weight` 300,
   `letter-spacing` −0.01em, `line-height` 1.02, and **no** `font-variation-settings`.
4. Inspect a section-headline specimen and a FAQ-style heading — both resolve to `--text-headline`.
   Confirm the scale now has two display steps, not four.
5. Inspect an eyebrow: Martian Mono, uppercase, 11px, tracking 0.12em — unchanged.
6. Confirm the three wash swatches are pale enough to carry `--ink` text at 4.5:1, and that no
   route hue appears anywhere outside them.
7. Hover both button variants — colour shifts over ~200ms, nothing moves or resizes.
8. Resize through 360 / 768 / 1024 / 1440. Hero scales 40 → 76px, section headline 26 → 40px. No
   horizontal page scroll at any width.
9. Tab the whole page — every focusable element shows a visible near-black ring on an offset.
10. Open `http://localhost:3000/` — still the untouched placeholder.
