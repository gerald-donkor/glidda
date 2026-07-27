# 07 — Logo band, proof band, and the placeholder fixture system

## Goal

Build §8 rows 4 and 5 — the logo band and the proof band — and, with them, the §11.1 placeholder
infrastructure they are the first consumers of: `lib/copy/placeholder/`, the required
`placeholder: true` field, and the `PLACEHOLDER` marker chip.

Two sections in one prompt because they share that infrastructure. Designing the fixture type once
against two different shapes — seven bare wordmarks and a stat/quote row — is the reason to do them
together; retrofitting it when the testimonial carousel arrives with a third shape is the reason
not to split them.

Out of scope: the live demo panel, the section intro, and everything below it. No animation.

## Skills and docs read

- `AGENTS.md` §11.1 and §11.2 (the placeholder policy and the exact fixture values), §5.1 rows 4–5
  (what the reference's two bands are), §6.1–6.3 (tokens, the two-step display scale, hairlines,
  radii), §9 (copy in `lib/copy/`, server components by default), §12 (responsive floor, contrast,
  heading order), §13 (no `any`, spacing on the section element).

Deliberately **not** read, and why:

- Every `gsap-*` skill — nothing animates here. See the motion spec.
- `node_modules/next/dist/docs/` — one exception applies and is handled below: `process.env` inlining
  for a `NEXT_PUBLIC_*` variable is a build-time behaviour, so the implementation reads the config
  docs on environment variables before writing the marker chip's gate. No routing, font, image, or
  metadata surface is touched.
- `.agents/skills/shadcn` — neither band composes a primitive. A wordmark row, a stat, and a
  monogram circle have no shadcn equivalent, and §10's list does not offer one.

## Existing code inspected

- `lib/copy/hero.ts`, `lib/copy/shell.ts` — the copy-module pattern: a typed object with an explicit
  annotation, a header comment stating whether §11.1 applies, no inline strings in JSX. `shell.ts`
  already ships the footer disclaimer that says this page's names, figures, and quotes are
  placeholders — so the page-level honesty statement exists and this prompt adds the per-block one.
- `components/sections/hero.tsx` — the section shape to match: `<section id className="section-rhythm
  anchor-offset">` wrapping `<div className="rail-offset relative">` with a `<RailStation>` inside.
  Server component; only the entrance wrapper is a client boundary.
- `components/layout/rail-station.tsx` — takes one `label` string, `aria-hidden`, node visible at all
  widths and label from 640px up.
- `app/globals.css` — `type-display`, `type-utility`, `hairline-t`, `section-rhythm`,
  `section-rhythm-tight`, `rail-offset`, `node-square`, and (from prompt 06) `--station-lead`.
- `lib/utils.ts` — `cn()` with the type scale registered. No new `--text-*` token here, so it is
  untouched.
- No `.env` file exists in the repo, so `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS` is undefined and the
  markers are visible by default, which is what §11.1 asks for.

## Decisions and assumptions

### 1. `placeholder: true` is a required literal field on every fixture type

Typed as `placeholder: true` — the literal, not `boolean`. §11.1 wants a real record to be
impossible to add without deleting the flag and a fake one impossible to add without setting it;
`boolean` would let `placeholder: false` compile and quietly defeat both halves. The literal type
makes the only legal value the honest one, and it keeps §14's `grep -rn "placeholder: true"` exact.

### 2. Fixtures live in three files, split by shape rather than by section

`lib/copy/placeholder/types.ts` holds the shared `Placeholder` base and the marker gate;
`customers.ts` holds the seven invented wordmarks; `proof.ts` holds the two stats and the quote.
The carousel in a later prompt reuses `types.ts` and the same seven company names for its
attributions, which is why the names are not buried inside the logo band's own file.

### 3. The marker chip is one component, gated once, and rendered per proof block

`components/layout/placeholder-chip.tsx`. It reads
`process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS !== "false"` as a full literal expression so
Next's build-time inlining applies, and returns `null` when off. It is a server component and joins
no client bundle.

It goes in `components/layout/` rather than `components/ui/`, because §10 reserves `components/ui/`
for shadcn primitives to extend and this is neither a primitive nor a fork of one. It is not in
`components/sections/` either — it belongs to no section and three sections will render it.

One chip per fabricated proof *block*, not per fabricated *item*: one for the logo band as a whole,
one for the proof band as a whole. Seven chips down a row of seven names would be noise, and the
block is the unit that gets swapped.

### 4. Both bands get a station, and the logo band's label is `Customers`

§8's diagram gives both rows a node. Prompt 06's label-width table omitted the logo band, which was
an oversight in that table rather than a decision — with 06's geometry landed, an 86px label costs
nothing, so honouring the §8 diagram is free. `Customers` and `Proof`.

The tension worth naming: a station labelled `Customers` above seven invented names states a claim
more confidently than a bare row of names does. That is exactly what §11.1's chip and the footer's
existing disclaimer are for, and both are present. If it still reads as overclaiming at review, the
fix is to drop the label to nodes-only for this one band — say so at step 3 of the manual review.

### 5. The logo band wraps; it does not scroll and it does not shrink to fit

§5.1 describes one even row, and seven Display-face names do not fit one row at 360px. The band is
a centred `flex-wrap` row with a fluid gap: one row from roughly 1024px up, two or three below it.
§12 forbids horizontal page scroll and an inner scroller for seven decorative names would be a
worse answer than a wrap. The names are set at `--text-panel` — the smallest step §6.2 permits the
Display face — so they stay wordmark-sized rather than becoming body copy.

### 6. Neither band carries a visible heading, so each carries a screen-reader one

§5.1 gives both bands no heading, and adding one would invent hierarchy the design does not have.
But a `<section>` with no accessible name is a landmark that announces as nothing, so each gets an
`sr-only` `<h2>`. Heading order stays h1 → h2 → h2 → …, and the copy for those two headings is real
copy in `lib/copy/proof.ts`, not a fixture.

### 7. The two bands sit tight against each other

The logo band uses `section-rhythm-tight`, the proof band uses `section-rhythm`. Two full
112–200px bands stacked between the hero and the live demo panel would read as a gap rather than as
two related pieces of evidence. The proof band also takes `hairline-t` per §5.1's rule above it.

### 8. Rejected: rendering the wordmarks as images or as a marquee

§11.2 is explicit — text wordmarks in the Display face, never logo images, not even temporarily.
And §5.1 observed the reference's band as static, with no marquee. Nothing moves here.

## Files likely to change

| File | Change |
| --- | --- |
| `lib/copy/placeholder/types.ts` | new — `Placeholder` base type, marker gate constant |
| `lib/copy/placeholder/customers.ts` | new — the seven §11.2 wordmarks |
| `lib/copy/placeholder/proof.ts` | new — two stats, one quote with monogram |
| `lib/copy/proof.ts` | new — the two `sr-only` headings and the two station labels |
| `components/layout/placeholder-chip.tsx` | new — the gated `PLACEHOLDER` chip |
| `components/sections/logo-band.tsx` | new — §8 row 4 |
| `components/sections/proof.tsx` | new — §8 row 5 |
| `app/page.tsx` | compose both between `<Hero />` and the answers stub |

Explicitly not modified: `app/globals.css` (no new token is needed — every value below already
exists), `lib/utils.ts` (no new `--text-*`), `components/layout/rail-station.tsx`, and everything
under `components/motion/`.

## Implementation requirements

### `lib/copy/placeholder/types.ts`

```ts
/** Fabricated proof (§11.1). The literal `true` is the point: a real record cannot keep it. */
export type Placeholder = { placeholder: true }
```

Plus `showPlaceholderMarkers`, a `const` boolean reading the env expression in full literal form.

### `lib/copy/placeholder/customers.ts`

Seven objects, §11.2's exact names in that order, each `Placeholder & { name: string }`.

### `lib/copy/placeholder/proof.ts`

Two stats — `50%` / "fewer support tickets in week one" and `2×` / "more accounts reaching first
value" — and one quote: §11.2's exact 40-word placeholder text, attributed to A. Mensah, Head of
Growth, Rivetworks, with `monogram: "AM"`. Every object carries the flag.

### `components/layout/placeholder-chip.tsx`

`type-utility`, `--text-eyebrow`, `--rail-muted` on `--surface`, 6px radius, 1px `--rail` hairline,
small symmetric padding. Text `PLACEHOLDER`. It is real information about the page, not decoration,
so it is **not** `aria-hidden`.

### Sections

Both follow `hero.tsx`'s shape exactly: `<section id className="section-rhythm… anchor-offset">` →
`<div className="rail-offset relative">` → `<RailStation>` → content. `id="customers"` and
`id="proof"`. Both are server components with no `"use client"`.

## Visual spec

**Logo band.** Centred flex-wrap row. Names in `type-display` at `--text-panel`, weight 300, colour
`--ink`, sentence case as given. Gap `clamp(28px, 4vw, 56px)` row and column. The `PLACEHOLDER` chip
sits above the row, left-aligned to the rail's content edge, `16px` below the station row.

**Proof band.** `hairline-t` above. Two columns from 1024px up — stats left, quote right, aligned to
their tops, `--rail-gap`-scale space between. Below 1024px they stack, stats first.

| Element | Face | Size | Colour |
| --- | --- | --- | --- |
| Stat figure | Display | `--text-headline` | `--ink` |
| Stat label | Utility | `--text-eyebrow` | `--rail-muted` |
| Quote | Body | `--text-body` | `--ink` |
| Name | Body 500 | `--text-small` | `--ink` |
| Role, company | Body | `--text-small` | `--rail-muted` |
| Monogram | Utility | `--text-eyebrow` | `--rail-muted` on `--surface` |

The stat figure sits above its label, not beside it — the reference puts the label beside the
figure, but at `--text-headline` rather than the reference's much larger figure there is not enough
height beside it for two lines. Stats are separated by a `hairline` and `40px` of space, matching
`--station-lead` so the band's internal rhythm agrees with the rail's.

Monogram: `40px` circle (`999px` radius), `--surface` fill, initials centred. No image, no border.

Quote is `max-w-[46ch]` so the §11.2 text wraps to three or four lines rather than one long
measure. Attribution row sits `24px` below it: monogram, then name and role stacked beside it.

**Responsive.** 360 — everything single-column, wordmarks wrap to three rows, chip full-width-left.
768 — wordmarks two rows, proof still stacked. 1024 — proof splits to two columns. 1440 — wordmarks
one row inside the 1200px shell.

**States.** Nothing here is interactive. No hover, no focus, no cursor change.

## Motion spec

**Nothing animates.** §7.3 allows three orchestrated moments and this is none of them; §7.1's
budget is not spent on a static evidence row. No GSAP import, no `useGSAP`, no `ScrollTrigger`, no
CSS transition appears in either section.

Consequently there is no reduced-motion branch to write, and both sections are byte-identical with
JavaScript disabled.

If review says the bands feel inert against the animated hero above them, that is a real observation
and the answer is a stated addition in prompt 08 — not an entrance tween added here without one.

## Accessibility requirements

- One `sr-only` `<h2>` per section; heading order stays h1 → h2 → h2.
- The `PLACEHOLDER` chip is announced. It tells a screen-reader user the same thing it tells a
  sighted one.
- The quote is a `<blockquote>` with the attribution in a `<figcaption>` inside a `<figure>`, so the
  quote and who said it are programmatically associated.
- The monogram is `aria-hidden` — the name is right beside it in text.
- `RailStation` stays `aria-hidden` as built.
- Contrast: `--rail-muted` on `--ground` is 6.13:1 and on `--surface` 5.41:1. `--rail` carries no
  text anywhere in either section.
- No focusable element is added, so the tab order is unchanged.
- No horizontal page scroll at any width — the wrap, not a scroller, is what guarantees it.

## Acceptance criteria

1. Both sections render at 360, 768, 1024, and 1440px with no horizontal page scroll.
2. All seven §11.2 names appear, in order, as text in the Display face. No `<img>`, no SVG logo, no
   real company name anywhere.
3. The proof band shows both stats and the quote with a monogram avatar and no photograph.
4. `grep -rn "placeholder: true" lib/copy/` returns exactly ten hits — seven customers, two stats,
   one quote — and every one is under `lib/copy/placeholder/`.
5. No fabricated string appears inline in any component; every one resolves through `lib/copy/`.
6. `PLACEHOLDER` chips are visible with no env var set, and both disappear with
   `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS=false`.
7. Setting `placeholder: false` on any fixture is a TypeScript error.
8. Station labels clear their content at every width ≥640px — prompt 06's geometry must still hold
   for two sections it was not written against.
9. Neither section file contains `"use client"`, a GSAP import, or a transition.
10. `app/page.tsx` gains two elements and nothing else — no layout maths, no copy, no animation.
11. `app/globals.css` and `lib/utils.ts` are unmodified.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
```

`build` because new route content and a `NEXT_PUBLIC_*` read are involved — the inlining is only
honestly testable in a production build. Paste real output for all four. Lint must still be the
same three pre-existing errors in `components/ui/carousel.tsx`, `hooks/use-mobile.ts`, and
`components/layout/wordmark.tsx` — the same three files, not merely the same count.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **1440px.** Seven names on one row, evenly spaced, no orphan. The proof band's two columns should
   read as one row of evidence, not two unrelated blocks.
2. **768px, then 360px.** Confirm the wordmark row wraps cleanly with no single name stranded on its
   own line, and that the proof band stacks stats above quote.
3. **The `Customers` station label.** Decision 4's open tension: say plainly whether a station label
   reading `Customers` above seven invented names overclaims. Nodes-only for this band is the
   fallback and it is a one-line change.
4. **The chips.** Confirm both are visible, then restart with
   `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS=false npm run dev` and confirm both are gone and nothing
   reflows.
5. **JavaScript disabled.** Both bands must render identically.
6. **Full scroll.** The rail stays continuous through two new sections and its paint still tracks the
   viewport midpoint.

## Open questions this raises for prompt 08

- **The stat figure size.** `--text-headline` is what the two-step scale in §6.2 offers, and the
  reference sets its figures considerably larger. If `50%` reads as undersized beside a 76px hero,
  the honest fix is a §6.2 conversation about a third display step — not a one-off `text-[56px]`
  in this file. Do not resolve it here.
- **Whether the bands need an entrance.** See the motion spec. A stated addition in a later prompt,
  or nothing.
