# 07 — Placeholder fixtures, logo band, and proof band

## Goal

Build §11.1's placeholder-fixture infrastructure once, then render the two §8 rows that consume it:
the **logo band** (row 4) and the **proof band** (row 5). After this prompt, `/` reads hero →
seven customer wordmarks → two stats and a quote, and every fabricated claim on the page is
flagged, typed, and removable in one `rm -r`.

The fixture layer is deliberately built here rather than in its own prompt: a policy with no
consumer cannot be reviewed, and these are the first two sections that need it. The testimonial
carousel and any later proof block reuse what this lands.

No animation, no new route, no Ask-bar change, no shadcn primitive is forked.

## Skills and docs read

- `AGENTS.md` §11 (copy rules), §11.1 (placeholder content policy — the governing section for this
  prompt), §11.2 (the exact fixture inventory), §6.1–6.4 (colour, type, spacing, the Rail), §8
  (rows 4 and 5 and the mapping table), §9 (file layout, copy in `lib/copy/`, server by default),
  §10 (check `components/ui/` first), §12 (quality floor), §13 (code standards), §14 (checks).
- `.agents/skills/shadcn` — consulted for whether `Badge`, `Separator`, `Avatar`, and `Marker`
  cover the chip, the hairline rule, the monogram, and the stat row. Findings in decision 6.

Deliberately **not** read, and why:

- Every `gsap-*` skill — nothing animates (decision 8). §7.3 allows exactly three orchestrated
  moments and neither of these bands is one of them.
- `node_modules/next/dist/docs/` — no routing, server/client boundary, font, image, metadata, or
  config surface is touched. Both sections are plain server components composed into the existing
  `app/page.tsx`, and §11.1 forbids `next/image` here outright: there are no logo images, only
  typeset names.

## Existing code inspected

- `app/page.tsx` — composition only. Holds three stub sections (`answers`, `demos`, `faq`) that
  each get deleted as their real section lands; none of them is replaced by this prompt, so all
  three stay.
- `app/layout.tsx` — `<main id="main" className="relative flex-1">` holds `<Rail />` plus the page.
  Sections mount as direct children of `main`.
- `components/sections/hero.tsx` — the shape every section follows: `<section id class="section-rhythm anchor-offset">` wrapping `<div class="rail-offset relative">` with a
  `<RailStation>` inside it.
- `components/layout/rail-station.tsx` — node plus `type-utility` label, `aria-hidden`, label
  `hidden sm:block`.
- `lib/copy/hero.ts` and `lib/copy/shell.ts` — the copy-module pattern: one typed exported object,
  a header comment stating whether §11.1 applies. Note that `shell.ts`'s footer disclaimer already
  tells the reader in prose that the names, figures, and quotes on this page are placeholders. That
  disclaimer becomes true for the first time with this prompt.
- `lib/utils.ts` — the tailwind-merge `--text-*` registration. No new size token is added here, so
  it is untouched.
- `app/globals.css` — tokens, `rail-offset` / `section-rhythm` / `hairline-t` / `type-utility` /
  `type-display` utilities.
- `components/ui/` — `badge.tsx`, `separator.tsx`, `avatar.tsx`, `marker.tsx`, `card.tsx` read in
  full before deciding to hand-build the chip and the monogram (decision 6).
- `prompts/06-station-geometry.md` — its station-label width table omits any label for the logo
  band, which decision 4 makes explicit rather than inferred.

## Decisions and assumptions

### 1. The fixture layer is three files under `lib/copy/placeholder/`, and nothing else

§11.1 requires one directory to swap and one directory to grep. So:

- `types.ts` — the shared types, including the `placeholder: true` obligation.
- `companies.ts` — the seven invented wordmarks.
- `proof.ts` — the two stats and the one quote.

Testimonial fixtures are **not** written here — the carousel is a later prompt and writing three
40-word quotes now would design them against no layout. `types.ts` does define `QuoteFixture` now,
because the proof band's quote and the carousel's quotes are the same shape and discovering that
later means editing the proof band.

### 2. `placeholder: true` is a required literal-`true` field, not a boolean

```ts
export type Placeholder = { readonly placeholder: true }
```

Literal `true`, not `boolean`. §11.1's stated intent is that "a real record cannot be added without
deleting the flag" — with `boolean`, `placeholder: false` type-checks and the fixture quietly
becomes a claim. With the literal, the only way to add a real record is to change the type, which
is a reviewable diff. Every fixture type intersects `Placeholder`.

### 3. The literal string `placeholder: true` appears only in fixture data

§14's pre-deploy grep is `grep -rn "placeholder: true" lib/copy/`. A comment or a type alias
containing that exact string would produce a false hit and train the reader to skim the output.
`lib/copy/hero.ts` already sets this precedent — its header comment describes the flag without
writing it. Follow it: in `types.ts` the field is declared as `placeholder: true` inside the type
(unavoidable and correct — it is one hit, in one file, and it is the definition), and no comment
anywhere reproduces the string.

### 4. The logo band carries no station marker; the proof band's station is `Proof`

§8's diagram draws a node beside every row, but prompt 06's measured label table lists ten labels
and none of them belongs to the logo band. That was the right instinct and this prompt makes it a
decision: the logo band is the hero's tail — in the reference it literally sits on the ribbon — and
it has no headline of its own to hang off the line. A station is a place the reader arrives at; the
logo band is not one. The rail runs behind it uninterrupted.

The proof band gets `Proof` (46px, well inside prompt 06's reserved row).

### 5. Both bands need an accessible heading, and neither shows one

§12 requires semantic headings in order. Neither band has a visible headline — that is the
reference's shape and ours. So each gets an `sr-only` `<h2>` ("Customers using Glidda", "Proof")
so the document outline is `h1` → `h2` → `h2` with no gap and no invented visual furniture. These
strings live in `lib/copy/proof.ts` with the rest of the sections' non-fabricated copy.

### 6. The chip and the monogram are hand-built; the hairline rule is not `Separator`

Checked against §10's "compose primitives before building":

- **`Badge`** — `h-5 rounded-4xl text-xs font-medium` plus six colour variants. The `PLACEHOLDER`
  chip needs `--radius-chip` (§6.3 permits exactly four radii and `rounded-4xl` is not one),
  `type-utility` at 11px with `0.12em` tracking, and `--surface`/`--rail-muted`. That overrides
  every property the primitive sets; per §10 that is forking, not composing. Build a 12-line local
  component.
- **`Avatar`** — wraps Base UI's image/fallback logic for a `src` that this project will never
  have: §11.1 forbids photographs of people outright. A monogram circle is a `<span>` with two
  initials. No primitive.
- **`Separator`** — `"use client"`, and it renders a Base UI separator element. The proof band's
  rule is a `border-top` on a box that already exists, which is what the `hairline-t` utility is
  for. Using `Separator` would add a client boundary to an otherwise fully static section.
- **`Marker`** — unrelated to the Rail's station markers despite the name; it is a list-item
  decoration. Not used.

### 7. The `PLACEHOLDER` chip is one server component reading one env var

`components/layout/placeholder-chip.tsx`. It renders `null` when
`process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS === "false"` and renders the chip otherwise —
the comparison is written that way round, not `!== "false"` inverted into a guard, so an unset,
misspelled, or empty variable falls through to **visible**, which is §11.1's stated default.

It goes in `components/layout/` rather than a new `components/placeholder/` directory: §9 fixes the
directory list and adding to it is a §9 amendment, not an implementation detail. `layout/` already
holds the non-shadcn page chrome that is not a section (`rail-station`, `wordmark`), and the chip
is exactly that.

No `.env.example` and no `next.config` change — the variable's only job is to turn the marker off,
the default is on, and an env file nobody has to create is one more thing to keep in sync.

One chip per fabricated proof **block**, per §11.1: one on the logo band, one on the proof band —
not one per stat and one per quote, which would read as decoration rather than as a warning.

### 8. Nothing animates

§7.3: three orchestrated moments, and everything else is a 0.2s hover. Neither band is one of the
three. A scroll-reveal on the logo band would be a fourth moment and §7.3 requires a stated reason;
there isn't one. The reference confirms it — §5.2 records no state change on logo-band hover and no
motion in the proof band.

Consequences to hold to: no `useGSAP`, no `ScrollTrigger`, no `"use client"` in either section, no
`transition` beyond none at all (there is no interactive element in either band — no link, no
button, no hover target). Both files are pure server components.

### 9. Seven wordmarks: one row only where one row actually fits

§5.1 and §11.2 want a single evenly spaced row. Measured, that is not available at every width. At
`--text-panel` the seven names need roughly 940–980px including gaps; `rail-offset`'s content width
is 1096px at 1440px, 920px at 1024px, and 264px at 360px.

So: a single flex row at ≥1280px, a three-column grid from 640px (7 → 3 + 3 + 1), and a
two-column grid below that. Equal-width grid columns are wrong at the top end — `Bright Harbour`
is the widest name and a 7-column grid would give it a 156px cell and wrap it — hence flex with
`justify-between` there and `whitespace-nowrap` on every name.

Not a marquee. §5.1 observed the reference's band as static and §7.3 has no room for a fourth
loop.

### 10. Stat figures use `--text-headline` in the Display face; labels use the Utility face

§6.2 permits two display steps and a figure is not a third. `50%` at `--text-headline` beside an
11px Utility label is the size relationship §5.1 describes ("a large figure with a two-line label
beside it") without inventing a scale step. The label is one of the four things §6.2 explicitly
allows the Utility face to do ("stat labels").

The quote is body copy at `--text-body`, **not** the Display face: §5.1 puts the proof-band quote
at body size, and §6.2 forbids the display face below `--text-panel`. The 22–36px `--text-quote`
step belongs to the testimonial carousel's pull-quote, which is a different component.

### 11. The logo band uses a tighter section rhythm

`--section-rhythm` is 112–200px on both edges. Applied here it would put up to 400px of white
between the hero's slipstream band and the proof band's hairline for a row of seven words. The logo
band is the hero's tail, so it gets `--section-rhythm-tight` (`clamp(72px, 8vw, 120px)`) via a new
`section-rhythm-tight` utility. The proof band keeps the full rhythm.

This is a new centralised token, not a one-off `py-` literal in a component (§13). It is expected
to be reused by the closing CTA and the section intro; if it is still used exactly once when the
page is complete, fold it back.

## Files likely to change

| File | Change |
| --- | --- |
| `lib/copy/placeholder/types.ts` | new — `Placeholder`, `CompanyFixture`, `StatFixture`, `QuoteFixture` |
| `lib/copy/placeholder/companies.ts` | new — the seven §11.2 wordmarks |
| `lib/copy/placeholder/proof.ts` | new — two stats, one quote |
| `lib/copy/proof.ts` | new — the two bands' non-fabricated copy (sr-only headings, station label) |
| `components/layout/placeholder-chip.tsx` | new — the `PLACEHOLDER` marker |
| `components/sections/logo-band.tsx` | new |
| `components/sections/proof-band.tsx` | new |
| `app/globals.css` | add `--section-rhythm-tight` and the `section-rhythm-tight` utility |
| `app/page.tsx` | compose the two sections between `<Hero />` and the `answers` stub |

Explicitly **not** modified: `lib/utils.ts` (no new `--text-*` token), `components/layout/rail.tsx`,
`components/layout/rail-station.tsx`, `components/sections/hero.tsx`, `lib/gsap/*`, anything in
`components/ui/`, and the three stub sections in `app/page.tsx`.

No new dependency.

## Implementation requirements

### `lib/copy/placeholder/types.ts`

```ts
export type Placeholder = { readonly placeholder: true }

export type CompanyFixture = Placeholder & { readonly name: string }

export type StatFixture = Placeholder & {
  readonly figure: string
  readonly label: string
}

export type QuoteFixture = Placeholder & {
  readonly quote: string
  readonly name: string
  readonly role: string
  readonly company: string
  /** Two initials, authored not derived — §11.1 allows no photograph, and a split-on-space
   *  derivation breaks on the first name that does not have two words. */
  readonly monogram: string
}
```

A header comment states what this directory is, that everything in it is fictional by construction,
that it is deleted in one pass, and that §14's grep is the release gate — without reproducing the
grep's search string (decision 3).

### `lib/copy/placeholder/companies.ts`

Exactly the seven §11.2 names, in that order, each `placeholder: true`:
`Halden` · `Rivetworks` · `Piperlane` · `Nomad Fleet` · `Coalspring` · `Tessellate` ·
`Bright Harbour`. Typed `readonly CompanyFixture[]`.

### `lib/copy/placeholder/proof.ts`

The §11.2 values verbatim — no rewriting, no rounding, no additions:

| figure | label |
| --- | --- |
| `50%` | `fewer support tickets in week one` |
| `2×` | `more accounts reaching first value` |

`×` is U+00D7, not the letter `x`. The quote is §11.2's exact text, attributed
`A. Mensah` / `Head of Growth` / `Rivetworks`, monogram `AM`. `Rivetworks` must be one of the seven
company fixtures — reference the company fixture's `name` rather than retyping the string, so the
two cannot drift.

### `lib/copy/proof.ts`

Non-fabricated copy for both bands: the logo band's `sr-only` heading, the proof band's `sr-only`
heading, the proof band's station label, and the chip's own label (`PLACEHOLDER`). Header comment
in the `shell.ts` idiom, stating that nothing in this file is a claim about a customer.

### `components/layout/placeholder-chip.tsx`

Server component. Props: none, or an optional `className` for placement only. Renders `null` on the
exact string `"false"` (decision 7). Markup is one `<span>` with `type-utility`, `text-rail-muted`,
`bg-surface`, `rounded-chip`, `px-2 py-1`, `hairline`, `inline-block`. Not `aria-hidden` — it is
information about the content, and a screen-reader user is exactly who should not be misled by an
unmarked fabricated statistic.

### `components/sections/logo-band.tsx`

```
<section id="customers" className="section-rhythm-tight anchor-offset">
  <div className="rail-offset relative">
    <h2 className="sr-only">…</h2>
    <PlaceholderChip />
    <ul>…seven <li> names…</ul>
  </div>
</section>
```

- No `RailStation` (decision 4).
- A `<ul>`, because it is a list of seven things.
- Each name: `type-display text-panel text-ink whitespace-nowrap`, read from the fixture array,
  keyed by `name`.
- Layout classes: `grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 sm:gap-x-8 xl:flex xl:justify-between xl:gap-x-8`.
- Chip sits above the row, `mb-10`.

### `components/sections/proof-band.tsx`

```
<section id="proof" className="section-rhythm anchor-offset">
  <div className="rail-offset relative">
    <RailStation label={…} />
    <h2 className="sr-only">…</h2>
    <div className="hairline-t pt-10">      ← the rule starts at the rail-hung edge
      <PlaceholderChip />
      <div className="grid …">
        <dl>…two stats…</dl>
        <figure>…quote…</figure>
      </div>
    </div>
  </div>
</section>
```

- The hairline is `border-top` on an inner box so it begins at `rail-offset`'s content edge
  (`--rail-x + --rail-gap`) and aligns with where every headline on the page begins. It must not be
  a full-bleed rule and must not start at the shell's gutter.
- Stats are a `<dl>`: `<dt>` the figure, `<dd>` the label. Each pair is a flex row — figure
  (`type-display text-headline`), label (`type-utility text-rail-muted max-w-[16ch]`, which is what
  makes it wrap to two lines as §5.1 describes). The two pairs sit side by side from 640px and
  stack below it.
- The quote is a `<figure>` containing `<blockquote>` (`text-body`, `max-w-[46ch]`) and a
  `<figcaption>`. The caption row is right-aligned from 1024px: monogram circle then
  name · role · company, `text-small text-rail-muted`, with the name in `text-ink`.
- Monogram: `size-10 rounded-full bg-surface`, initials centred in `type-utility text-rail-muted`,
  `aria-hidden` — the name follows it in text, so announcing `AM` is noise.
- Outer grid: `grid gap-x-12 gap-y-14 lg:grid-cols-[1.1fr_1fr]`. No cards, no borders, no shadow
  (§5.1: "All on one row, no cards, no borders").

### `app/globals.css`

In `:root`, beside `--section-rhythm`:

```css
/* A tighter band for sections that read as a continuation of the one above rather than as a new
   arrival — the logo band sits directly under the hero's slipstream. Roughly 0.6 of
   --section-rhythm at both ends of its range. */
--section-rhythm-tight: clamp(72px, 8vw, 120px);
```

Add `--spacing-rhythm-tight: var(--section-rhythm-tight)` to `@theme inline` beside
`--spacing-rhythm`, and a `section-rhythm-tight` utility beside `section-rhythm`.

### `app/page.tsx`

Import and render `<LogoBand />` and `<ProofBand />` immediately after `<Hero />`. Update the file's
header comment: the stub list is now three sections and the comment's "prompts 06 and up" should
say what is actually outstanding. Composition only — no layout, no copy, no props.

## Visual spec

**Colour.** `--ink` for the wordmarks and stat figures, `--rail-muted` for labels, quote
attribution, and the chip's text, `--surface` for the chip and monogram fills, `--rail` for the one
hairline. No route hue, no `--signal`, nothing coloured anywhere in either band — the page chrome
is monochrome (§6) and neither of these is a feature panel.

**Type.**

| Element | Token | Face |
| --- | --- | --- |
| Wordmark | `--text-panel` | Display, 300 |
| Stat figure | `--text-headline` | Display, 300 |
| Stat label | `--text-eyebrow` | Utility, uppercase |
| Quote | `--text-body` | Body |
| Attribution | `--text-small` | Body |
| Monogram | `--text-eyebrow` | Utility |
| `PLACEHOLDER` chip | `--text-eyebrow` | Utility |

**Responsive.**

| | 360px | 768px | 1024px | 1440px |
| --- | --- | --- | --- | --- |
| Wordmarks | 2 cols (4 rows) | 3 cols (3 rows) | 3 cols | one row, `justify-between` |
| Station label (`Proof`) | hidden, node only | shown | shown | shown |
| Stats | stacked | side by side | side by side | side by side |
| Stats ↔ quote | stacked | stacked | side by side | side by side |
| Attribution | left | left | right-aligned | right-aligned |

**Spacing.** Logo band `--section-rhythm-tight` block padding; proof band `--section-rhythm`. Chip
to content: 40px. Hairline to content: 40px. Everything on the 4px scale, all of it on the section
or on the one wrapper — no child sets an outer margin except the chip's `mb-10` (§13).

**Shape.** `--radius-chip` on the chip, `999px` on the monogram. No card radius: there are no cards.
No shadow anywhere — §6.3 reserves the only shadow for the Ask bar.

**States.** There is no interactive element in either band. Nothing hovers, nothing focuses,
nothing has a pressed state. If the implementation finds itself writing a `hover:` class here, it
has added a link that the design does not have.

## Motion spec

**Nothing animates.** No GSAP, no ScrollTrigger, no CSS transition, no entrance, no loop. Decision
8 gives the reason. Neither file is a client component.

Existing motion must be unaffected: the hero load timeline is unchanged, and the rail's scrubbed
paint now spans a taller `<main>` — that is a longer scroll for the same tween, not a behaviour
change, and it must still track the viewport midpoint. Re-confirm it rather than assume it.

Reduced motion: nothing new to branch on. Both bands render identically under
`prefers-reduced-motion: reduce` and with JavaScript disabled, which is worth stating because it is
the first part of the page for which that is trivially true.

## Accessibility requirements

- Heading order stays `h1` (hero) → `h2` (logo band, `sr-only`) → `h2` (proof band, `sr-only`) →
  the stub sections' `h2`s. Exactly one `h1` on the page (§12).
- The wordmark row is a `<ul>`; the stats are a `<dl>`; the quote is `<figure>` +
  `<blockquote>` + `<figcaption>`. Real semantics, because this is real information — unlike the
  slipstream and the rail, none of it is decorative and none of it is `aria-hidden`.
- The `PLACEHOLDER` chip is announced. The monogram is `aria-hidden`; the station marker stays
  `aria-hidden` as it already is.
- No focusable element is added, so the tab order across the page is unchanged: skip link, header,
  hero CTAs, Ask bar.
- Contrast: `--rail-muted` on `--ground` is 6.13:1 and on `--surface` 5.41:1, both above §12's
  4.5:1. `--rail` carries no text. The wordmarks and stat figures are `--ink`.
- The `2×` figure must use U+00D7 so it is not read as the letter x.
- No horizontal page scroll at any width — the seven-name row is the risk, and the flex row only
  applies from 1280px where it measurably fits.

## Acceptance criteria

1. `/` renders hero → logo band → proof band → the three existing stubs, in that order.
2. All seven §11.2 company names render, spelled exactly, in the given order, as text in the
   Display face. No image, no `next/image`, no SVG logo, no real company's name anywhere.
3. The proof band shows both §11.2 stats with their exact figures and labels, and the §11.2 quote
   with its attribution.
4. A `PLACEHOLDER` chip is visible on each band with no env var set, and both disappear with
   `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS=false`. An empty or misspelled value leaves them visible.
5. `grep -rn "placeholder: true" lib/copy/` returns exactly the fixture-data hits plus the one type
   definition — no comment, no component, no section file.
6. Every fixture object carries the flag, and removing `placeholder: true` from any one of them is
   a type error.
7. No component file contains a fabricated company name, figure, quote, or person's name.
8. Neither section file contains `"use client"`, a GSAP import, or a `transition`/`hover:` class.
9. No horizontal page scroll at 360, 768, 1024, or 1440px; no wordmark wraps mid-name at any width.
10. The proof band's hairline starts at the same x as the hero headline, not at the shell edge.
11. The rail runs unbroken behind both bands, still paints on scroll, and the hero load is
    unchanged.
12. `lib/utils.ts` is unmodified and no new `--text-*` token exists.
13. With JavaScript disabled, both bands are fully readable.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
```

`build` is included: two new route-level components join `app/page.tsx` and the CSS gains a token
and a utility, so the production pipeline is the honest test. Paste the real output of all four.
Confirm the lint error count is still the same three pre-existing files —
`components/ui/carousel.tsx`, `hooks/use-mobile.ts`, `components/layout/wordmark.tsx` — and name
them, not just a number.

Report the grep's hits explicitly in the completion message. Per §11.1 that list is now a standing
item on every deploy report until the fixtures are swapped.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **1440px.** The seven wordmarks sit on one line, evenly distributed, none wrapped, none touching.
   Judge whether the Display face at `--text-panel` reads as a customer row or as a sentence that
   lost its punctuation — if it reads as the latter, say so; the fallback is a size step down
   inside `--text-panel`'s clamp, not a face change (§6.2 forbids the display face below it).
2. **1279px, then 1280px.** The switch from three-column grid to single row. Confirm nothing
   overflows on either side of the boundary.
3. **360px.** Two columns, four rows, `Bright Harbour` fits its cell without wrapping. No
   horizontal scrollbar. The `Proof` station is a node with no label and no reserved gap.
4. **768px and 1024px.** The stats-to-quote transition from stacked to side by side. Confirm the
   quote's 40-word length still sets three-ish lines at `max-w-[46ch]` and that the attribution
   moves right at 1024 without colliding with the quote's last line.
5. **The chips.** Confirm both are visible by default, then restart dev with
   `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS=false npm run dev` and confirm both are gone and nothing
   reflows into a broken layout in their absence.
6. **The rail.** Scroll the full page. The line must be continuous through both new bands, the
   paint must still track the midpoint, and the proof band's hairline must not read as the rail
   being crossed out.
7. **Reduced motion and JS off.** Toggle the OS setting; then disable JavaScript. Both bands must
   be byte-identical in appearance in all three states.
8. **Read it as a stranger.** With the chips visible, is it obvious the numbers are notional? §11.1
   is a policy about not misleading someone — if `50%` still reads as a researched figure at a
   glance, the chip is in the wrong place or too quiet, and that is worth reporting rather than
   accepting.

## Open questions this raises for prompt 08

- **The section intro and the live demo panel** (§8 rows 6 and 7) are next, and the live demo panel
  is the first place `Slipstream` is used outside the hero — §8's mapping table says it carries the
  `mono` route, which prompt 04 built but nothing has consumed yet. Confirm `mono` still reads
  right at panel size before designing around it.
- **Testimonial fixtures.** Three 30–45-word quotes in `lib/copy/placeholder/testimonials.ts`,
  reusing `QuoteFixture` from this prompt. Do not write them until the carousel's layout exists.
- **Prompt 06's unresolved question stands** — the station label and the capability sections' pill
  eyebrow chip land in the same slot. Still not resolved here; neither of these bands has an
  eyebrow.
