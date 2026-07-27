# 12 — Build your own guide + capability cards

## Goal

Build §8 row 10: **build your own guide** — a two-column row. Left is a rounded pale panel
carrying a headline, subcopy, a mark of our own, two lines of fine print, and the row that in the
reference is an input beside a solid pill. Right is a stack of three rounded pale capability cards,
each a display-size heading and one short grey line.

This row is the page's last argument before the social proof and the FAQ: it answers "what do I
get, and what does it cost me to find out?" It is also the row where the reference's identity is
most concentrated — three grainy circles in coral, amber, and green — so it is the row where §5.3
has to be enforced hardest.

Out of scope, explicitly: the testimonial carousel (prompt 11), the FAQ and closing CTA
(prompt 13), any change to the Ask bar, any backend, any new orchestrated motion, and any change to
`components/ui/*`.

**One decision in this prompt needs the user's answer before it is built — decision 1.** It is
written with a recommendation and a fully specified alternative, and the alternative is not built
unless it is chosen.

## Skills and docs read

- `AGENTS.md` in full. Load-bearing here: §5.1 row 10 (the row's structure), §5.3 (what may not
  cross over — the three grainy circles are named in the "leave" list by name), §6.1 (**this row is
  outside every feature panel, so no route hue, no `--signal`, nothing but the monochrome tokens**),
  §6.2 (two display steps; `--text-panel` is named as the size for "small headings inside vignettes
  and capability cards", which is exactly this column), §6.3 (four radii, hairlines, one shadow on
  the page and the Ask bar has it), §6.4 (the Rail; **numbering is allowed only in the Route
  section**, so nothing in the card stack is numbered), §7.1–7.3 (the motion budget is spent),
  §8 mapping table row "Build your own guide", §8.1 (the Ask bar is the page's one live input),
  §9–§13, §15 (the Ask bar backend is undesigned; the Glidda mark does not exist).
- `.agents/skills/shadcn/rules/base-vs-radix.md` — `render`, not `asChild`; `nativeButton={false}`
  when a `Button` renders an `<a>`. The pill CTA follows the pattern already in `live-demo.tsx`.
- `.agents/skills/gsap-react` — read, then deliberately not used. Nothing in this row animates in
  JavaScript (decision 3).

Deliberately **not** read, and why:

- `node_modules/next/dist/docs/` images guide — no image asset is added and no `next/image` call is
  made. The mark is authored geometry (decision 2). Nothing here touches routing, fonts, metadata,
  config, or a server module.
- The GSAP timeline, ScrollTrigger, utils, and performance skills — no tween, no trigger, no
  timeline is created by any file in this prompt.

## Existing code inspected

- `components/sections/live-demo.tsx` — the section shell idiom this copies: `<section
  className="section-rhythm anchor-offset">` → `<div className="rail-offset relative">` →
  `<RailStation label={…} />`, plus the CTA pattern `Button variant="pill" size="pill"
  nativeButton={false} render={<a href={…} />}`. Also the standing decision that a block the
  reference centres is **left-aligned here** — its header comment states why, and this panel follows
  it rather than re-litigating it.
- `components/sections/route.tsx` — the same shell with a two-column body: `grid gap-12
  lg:grid-cols-2 lg:gap-16`, text column then panel column in DOM order at every width.
- `components/sections/embed-panel.tsx` — the recent pale-panel composition: `rounded-panel
  bg-surface p-5 sm:p-8 lg:p-10`, inner boxes on `bg-paper` with a `hairline`, depth from fill and
  hairline and never from a shadow, and the standing rejection of `components/ui/card.tsx` for a
  simple padded box.
- `components/sections/capability-section.tsx` — the two-column grid with `items-start`, and the
  `PlaceholderChip` slot pattern (inspected only to confirm nothing here needs it — decision 4).
- `app/globals.css` — every token and utility this row uses already exists: `--radius-panel`,
  `--radius-card`, `--radius-chip`, `--radius-pill`, `--text-headline`, `--text-panel`,
  `--text-body`, `--text-small`, `--text-eyebrow`, `type-display`, `type-utility`, `hairline`,
  `node-square`, `rail-offset`, `rail-station`, `section-rhythm`, `anchor-offset`,
  `--duration-micro`, `--ease-entrance`. No new token is needed and no hex is written in TSX.
- `lib/utils.ts` — `cn()` with the extended `font-size` class group, and `focusRing`. No new
  `--text-*` token is introduced, so the tailwind-merge list in §13 is unchanged.
- `components/ui/button.tsx` — has the `pill` variant and the `pill` size already. **Composed as
  shipped; no new variant, no wrapper.**
- `components/ui/input.tsx` — inspected and, under the recommended decision 1, **not used**. It is
  shadcn-shaped (`h-8`, `rounded-lg`, `border-input`, `ring-3`, `md:text-sm`) and would need our
  `--radius-chip`, `--text-body`, and `focusRing` overriding on top of it. Noted for the
  alternative in decision 1 only.
- `components/ui/card.tsx` — inspected and **not used**. It brings shadcn's own radius scale
  (`rounded-xl`), `ring-1 ring-foreground/10` instead of our hairline, a `--card-spacing` variable,
  a `text-sm` default, and a header/content/footer structure this row has no use for. Overriding all
  of that costs more than a `div` with `rounded-card bg-surface hairline`. Same conclusion
  `embed-panel.tsx` reached; §10 says extend rather than duplicate, and there is nothing here to
  extend — three padded boxes are not a card component.
- `components/motion/vignette-parts.tsx` — `Field` is the repo's existing answer to this exact
  tension: a decorative ask field is "a `<div>`, never an `<input>` and never a disabled control:
  §8.1 makes the Ask bar the page's one input, and a second live field competing with it is a
  conversion problem, not a stylistic one." Decision 1 is that comment applied one level up, where
  the surrounding markup is not `aria-hidden`.
- `components/ask/ask-bar.tsx` — the page's one live input. `id="ask"`, `tabIndex={-1}`, and a
  submit handler that is **intentionally inert** until post-submit UI is designed (§15). Every
  primary CTA on the page already routes to `#ask`.
- `components/sections/copy-embed.tsx` — the established pattern for a browser-only value in a
  client component: `useSyncExternalStore` with a no-op subscription, never a setState inside an
  effect, because `react-hooks/set-state-in-effect` is enforced. Relevant only if the alternative in
  decision 1 is chosen.
- `lib/copy/live-demo.ts` and `lib/copy/route.ts` — the copy-module pattern: one typed export with
  an explicit type annotation, and a header comment stating whether §11.1 applies, phrased so §14's
  grep for the literal fixture-flag string cannot match the comment.
- `components/layout/wordmark.tsx` — precedent for a brand graphic living in `components/layout/`
  rather than `components/motion/`, which is why the mark goes there (decision 2).
- `app/page.tsx` — composition only. `<BuildGuide />` is inserted after `<RouteSection />` and
  before the `#faq` stub, and the stub's TODO comment is left for prompt 13.

## Decisions and assumptions

### 1. The input — needs the user's answer

**The problem.** §5.1 row 10 and §8's mapping table both describe an input beside the pill. There is
no backend: §15 lists the Ask bar's model provider, route, and rate limiting as undesigned, and
nothing in this repo can generate a guide from a URL. So a field here would look live, accept
typing, and then either do nothing or hand off to a send button that also does nothing. That is a
trap, and it is worse than a missing field because it costs the reader an action before it fails.

It is also not only an honesty problem. §8.1 makes the Ask bar **the page's one live input** and the
page's primary conversion device. A second text field sitting a few hundred pixels above a fixed bar
that answers the same question splits the conversion device in two, and neither half wins. The repo
has already settled this once, at a smaller scale, in `vignette-parts.tsx`'s `Field`.

**Recommended — 1A: no second field.** The row keeps its shape and loses the field. The panel is
headline → subcopy → mark → two lines of fine print → one solid ink pill, **"Start a guide"**,
linking to `#ask`, the same label and destination as the header pill, the hero primary, the live
demo CTA, and the Route CTA. The action keeps its name through the whole flow (§11), and the reader
lands in the one field on this page that is genuinely the product.

What this gives up: literal agreement with §8's mapping-table wording, "Input + button and three
cards". That is a deliberate deviation and it is the reason this decision is going to the user
rather than being taken silently (§2, step 5). It gives up nothing structural — the panel is still a
pale panel with a headline, a mark, fine print, and a CTA row.

**Alternative — 1B: a real field that funnels into the Ask bar.** If the user wants the field, it is
built like this and no other way:

- A real `<form>` with a real `<input type="url" inputMode="url">`, a visible `<label>` (not a
  placeholder doing double duty — §11, one job per element), and the pill as its submit button.
- On submit: `preventDefault()`, then focus the Ask bar's input and prefill it with a question
  naming what was typed. Nothing is sent. The Ask bar's send stays inert per §8.1.
- The fine print then must say plainly, in the panel, that the button takes you to the Ask bar to
  start and that nothing is submitted yet. Stated, not hidden.
- It adds one client component and one small change to `components/ask/ask-bar.tsx` to accept the
  handoff. The field would be a raw `<input>` in the Ask bar's idiom, not `components/ui/input.tsx`,
  for the override cost listed above.
- Any browser-only value it reads uses `useSyncExternalStore`, per `copy-embed.tsx`, because
  `react-hooks/set-state-in-effect` is enforced.

**1B is not built unless the user picks it.** Do not build both. The rest of this prompt is written
against 1A; where 1B changes something it is called out.

### 2. The mark — the interchange

§5.3 names the reference's three grainy circles in the "leave" list, so nothing round, nothing
overlapping, and nothing grainy-coloured comes across. §6 rejects soft organic blobs outright and
gives the replacement subject: a guided line, engineered and directional, signage and station
markers.

**The mark is an interchange diagram.** Three parallel horizontal lines enter from the left at even
spacing. The outer two bend inward with a single constant-radius curve and merge into the middle
one, which continues alone to the right edge as a single heavier line. Three `node-square` markers
sit where each line begins; one more sits at the junction where the three become one.

It says the thing the section says — many scattered sources of product knowledge become one guide —
and it is drawn from the same vocabulary as the Rail and the wordmark's leading mark, so it reads as
part of this page and not as decoration bought from somewhere.

Concretely:

| Property | Value |
| --- | --- |
| Format | one bespoke inline `<svg>`, `viewBox="0 0 400 120"`, `preserveAspectRatio="xMinYMid meet"` |
| Sizing | `w-full max-w-[420px] h-auto` — scales with the panel, no fixed pixel height, no layout shift |
| Stroke | `1.5` with `vector-effect="non-scaling-stroke"` so the line stays a hairline at every size |
| Untravelled lines | `stroke: var(--rail)` — the two branch lines before the junction |
| Trunk | `stroke: var(--ink)` — the merged line after the junction |
| Nodes | 7×7 `rect`s in `var(--ink)`, matching `node-square`'s geometry exactly |
| Fill | `none` on every path |
| Grain | none |
| Colour | none — no route hue, no `--signal`. §6.1 is absolute outside a feature panel. |

**Why inline SVG and not CSS or lucide.** §10 bans inline SVG **icon sets** — hand-rolled
replacements for `lucide-react`. This is not an icon and there is no lucide glyph for it; §10's own
list of things to build by hand (the rail, the slipstream, the wordmark's mark) is exactly this
category, and `globals.css` already inlines an SVG for the slipstream grain. Flat CSS boxes cannot
draw a constant-radius merge without stacking pseudo-elements and magic offsets, which §13's
specificity rule is written against.

It is `aria-hidden` with `focusable="false"` (§12) — it conveys nothing a screen-reader user needs
that the headline does not already say. It carries no text, so `--rail` on a stroke is legitimate:
§6.1 forbids `--rail` as a **text** colour, and a hairline is precisely what the token is for.

The mark lives at `components/layout/interchange-mark.tsx`, beside `wordmark.tsx` — it is a brand
graphic, not a motion component, and `components/motion/` is for the slipstream, the vignettes, and
the typewriter (§9).

**This is not the Glidda logo.** §15 leaves the mark undesigned and this prompt does not resolve it.
The interchange is one section's illustration; do not promote it to the header.

### 3. Nothing in this row animates

§7.3 spends the motion budget on three moments and all three are built. This row adds none, and
that is a decision rather than an omission:

- The mark is **static**. An animating mark beside a page whose one moving line is the Rail would
  compete with the signature element for the same idea, and §7.3 says a fourth moment needs a stated
  reason. "The mark could draw itself in" is not one.
- The cards do not stagger in on scroll. Three boxes fading in adds nothing a reader gains.
- The only movement in this row is the pill's existing `--duration-micro` colour transition on
  hover, which is CSS and is not a tween.

Consequently no file in this prompt imports GSAP, creates a `ScrollTrigger`, or needs a
`gsap.matchMedia()` branch — and nothing here can be left frozen by a reduced-motion branch that
does not exist (§7.2).

### 4. Nothing in this row is a fixture

§11.1 governs fabricated **proof**: customers, quotes, people, metrics. This row has none of the
four. The panel headline, subcopy, fine print, button label, and the three card headings and lines
are feature copy, ours to write freely under §11, and they are the real copy until someone changes
them.

So: no `lib/copy/placeholder/` file, no fixture flag, no `PlaceholderChip`, and the pre-deploy grep
count is **unchanged at fourteen**.

The one thing to hold the line on: every card line must be a statement about what Glidda does that
we would stand behind, not a number and not a comparison. If a card line drifts into "teams see N%
more…", it has become proof and §11.1 starts applying — cut it instead.

### 5. Left-aligned, not centred

§5.1 describes the reference's panel as centred. `live-demo.tsx` already made and documented the
opposite call for the same reason it applies here: this page has one strong left edge, the Rail, and
a centred block beside it reads as a mistake rather than as emphasis. Panel text is left-aligned,
and the mark is anchored left and spans toward the panel's right edge, so it reads as a line
running *through* the panel rather than as a centred emblem.

### 6. The cards are `--text-panel`, and they are not numbered

§6.2's table assigns `--text-panel` to "small headings inside vignettes and **capability cards**" —
this column by name — while `--text-headline` is for section and feature headlines. Three stacked
cards beside a full panel at 26–40px would out-shout the section's own `h2`.

They carry no `01 / 02 / 03`. §6.4 allows numbering in the Route section only, because there it
encodes a real ordered sequence; these three are unordered and numbering them would be decoration.

### 7. Rejected alternatives

- **`components/ui/card.tsx` for the three cards.** Costs more overrides than markup — see
  "existing code inspected".
- **A disabled input.** A disabled control drops out of the tab order and misrepresents a feature
  that is coming; `ask-bar.tsx` rejects the same thing in its header comment for the send button.
- **A decorative `<div>` styled as an input, in the `Field` idiom.** It works inside a vignette
  because the whole vignette is `aria-hidden` and unreachable. In live markup it is a field a reader
  can click into and get nothing from, which is the trap decision 1 exists to avoid.
- **Three overlapping shapes with grain, restyled monochrome.** Still the reference's composition;
  §5.3 names it directly.
- **A hue in the mark, "just to warm the panel up".** This row is outside every feature panel. The
  hero's `mono-signal` exception is stated, dated, and scoped to the hero in §6.1; it does not
  generalise.

## Files likely to change

| File | Change |
| --- | --- |
| `lib/copy/build-guide.ts` | new — station, eyebrow, headline, subcopy, two fine-print lines, CTA, three cards |
| `components/sections/build-guide.tsx` | new — the section shell and the two-column grid (server) |
| `components/sections/build-panel.tsx` | new — the left pale panel and its CTA row (server) |
| `components/sections/capability-cards.tsx` | new — the right stack of three cards (server) |
| `components/layout/interchange-mark.tsx` | new — the bespoke SVG mark (server, no props but an optional `className`) |
| `app/page.tsx` | edit — `<BuildGuide />` after `<RouteSection />` |

Under 1B only, additionally: `components/sections/build-form.tsx` (new, client) and a small change
to `components/ask/ask-bar.tsx`.

Explicitly not modified: `app/globals.css` (no new token is needed), `lib/utils.ts` (no new
`--text-*` token, so the tailwind-merge list is untouched), `lib/gsap/*`, `components/ui/*`,
`components/layout/rail.tsx`, `components/layout/rail-station.tsx`, `components/ask/*` (under 1A),
and everything under `lib/copy/placeholder/`.

## Implementation requirements

### `lib/copy/build-guide.ts`

One typed export, `buildGuide`, with an explicit type annotation. Header comment in the house
pattern, stating §11.1 applies to none of it, phrased so §14's grep cannot match the comment.

```ts
export type CapabilityCard = { heading: string; line: string }

export const buildGuide: {
  station: string
  eyebrow: string
  headline: string
  subcopy: string
  finePrint: readonly [string, string]   // exactly two lines (§5.1)
  cta: NavLink                            // reuse the type from lib/copy/shell
  cards: readonly [CapabilityCard, CapabilityCard, CapabilityCard]
}
```

The copy, to be used as written unless the user changes it:

- `station`: `"Build"`
- `eyebrow`: `"Build"`
- `headline`: `"Point Glidda at your product and it drafts the first guide."`
- `subcopy`: `"It reads what you have already published — your site, your docs, your release
  notes — and writes a guide you can edit before a visitor ever sees it."`
- `finePrint[0]`: `"Glidda reads only pages that are already public."`
- `finePrint[1]`: `"You review every guide before it goes live, and you can turn one off in a
  click."`
- `cta`: `{ label: "Start a guide", href: "#ask" }`
- `cards`:
  1. `"Guides sound like your docs"` — `"The wording comes from your own pages, so a guide answers
     the way your team already writes."`
  2. `"Every visitor gets their own language"` — `"A guide answers in the language the page was
     opened in. You do not ship a second version."`
  3. `"You see where people stop"` — `"Each guide reports the questions it could not answer and the
     step people left on."`

Under 1B, add `field: { label: string; placeholder: string; note: string }` and the note must say
what submitting actually does.

Check every string against §11 before writing it: active voice, specific over clever, sentence case,
no "seamless", "unlock", "supercharge", or "10x", no exclamation marks.

### `components/sections/build-guide.tsx`

Server component, exported as `BuildGuide`.

```
<section id="build" className="section-rhythm anchor-offset">
  <div className="rail-offset relative">
    <RailStation label={buildGuide.station} />
    <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
      <BuildPanel />        {/* left */}
      <CapabilityCards />   {/* right */}
```

DOM order is panel then cards at every width; nothing reorders. If the file approaches ~200 lines,
it is already split three ways and should not need more (§13).

### `components/sections/build-panel.tsx`

Server component. A `rounded-panel bg-surface` box with padding matching `embed-panel.tsx`
(`p-5 sm:p-8 lg:p-10`), holding, in order:

1. The eyebrow — a `<p className="type-utility text-rail-muted">`, a label and not a heading;
   promoting it would put an `h3` above its own `h2`.
2. The section's `<h2>` at `--text-headline`, `max-w-[20ch]`.
3. One paragraph of subcopy at `--text-body`, `text-rail-muted`, `max-w-[46ch]`.
4. `<InterchangeMark />`, with generous space above and below — this is the panel's breathing room
   and the reason the panel is worth being a panel.
5. Two lines of fine print at `--text-small`, `text-rail-muted`. Two separate `<p>`s, not one string
   with a `<br>`.
6. The CTA row: `Button variant="pill" size="pill" nativeButton={false} render={<a
   href={buildGuide.cta.href} />}`.

No shadow anywhere (§6.3). The panel's edge is its fill; add a `hairline` only if the fill alone
does not hold the edge at 1440px, and say so if it does not.

Under 1B, item 6 becomes `<BuildForm />` and the pill moves inside it as the submit button.

### `components/sections/capability-cards.tsx`

Server component. A vertical stack — `flex flex-col gap-4` — of three boxes. Each box:

```
rounded-card bg-surface hairline p-6 sm:p-8
  <h3 className="text-panel">        heading
  <p  className="mt-3 text-body text-rail-muted max-w-[42ch]">   line
```

`h3`, keeping h1 → h2 → h3 in order. Hand-rolled `div`s, not `components/ui/card.tsx`
(decision 7). No icons, no numbers, no hover state — these are content, not controls.

### `components/layout/interchange-mark.tsx`

Server component. Props: `{ className?: string }` only. One `<svg>` per decision 2, `aria-hidden`,
`focusable="false"`, no `<title>`, no `<desc>`.

Every colour is `var(--ink)` or `var(--rail)` written as a `stroke`/`fill` attribute or a Tailwind
class — never a hex (§6.1). All path data is in one file and is not repeated anywhere else. If the
path `d` strings need commenting, comment what each line represents, not the numbers.

### `app/page.tsx`

One import and one element, `<BuildGuide />`, between `<RouteSection />` and the `#faq` stub. The
stub's TODO comment is updated to drop this row from its outstanding list and nothing else about the
file changes — no layout maths, no copy, no animation (§9).

## Visual spec

**Row.** Two columns from `lg` (1024px), `gap-16`; one column below, `gap-12`, panel first.
`items-start`, so the card stack does not stretch to the panel's height. Section spacing lives on
the `<section>` only; no child sets an outer margin (§13).

**Panel (left).**

| Element | Face | Size | Colour | Notes |
| --- | --- | --- | --- | --- |
| Eyebrow | Utility | `--text-eyebrow` | `--rail-muted` | uppercase, `0.12em`, plain — no chip fill; the capability sections own that treatment |
| Headline (`h2`) | Display | `--text-headline` | `--ink` | `max-w-[20ch]`, left-aligned |
| Subcopy | Body | `--text-body` | `--rail-muted` | `max-w-[46ch]` |
| Mark | — | `max-w-[420px]`, `h-auto` | `--ink` / `--rail` strokes | left-anchored, `clamp(40px,6vw,64px)` of space above and below |
| Fine print ×2 | Body | `--text-small` | `--rail-muted` | two `<p>`s, `max-w-[46ch]` |
| CTA | Body 500 | `--text-body` | `--paper` on `--ink` | existing `pill` variant, `--radius-pill` |

Panel fill `--surface`, radius `--radius-panel` (24px), padding `p-5 sm:p-8 lg:p-10`.

**Cards (right).** Fill `--surface`, radius `--radius-card` (14px), `1px solid var(--rail)`, padding
`p-6 sm:p-8`, `gap-4` between them. Heading Display at `--text-panel` in `--ink`; line Body at
`--text-body` in `--rail-muted`, `max-w-[42ch]`.

**Colour.** `--ink`, `--ground`, `--surface`, `--rail`, `--rail-muted`, `--paper`. Nothing else. No
route hue, no `--signal`, not on a stroke, a rule, a fill, a focus ring, or a hover state. `--rail`
appears only as a hairline and as an SVG stroke, never as text (§6.1, §12).

**Responsive.**

- **360** — one column; panel first, cards under it; mark scales down with the panel and never
  forces horizontal scroll; fine print wraps to three or four lines and that is fine.
- **768** — still one column, panel wider, mark at or near its `max-w`.
- **1024** — two columns; the card stack's total height should sit close to the panel's without
  being forced to match it.
- **1440** — 1200px content shell; the panel does not outgrow its column and the mark stops at its
  `max-w` rather than stretching.

**States.** CTA: existing pill hover, `--duration-micro`, `--ease-entrance`, `focusRing` never
removed. Cards: no hover, no focus — they contain no interactive element. Mark: no state at all.

## Motion spec

| What | Trigger | Duration | Ease | Stagger | Reduced motion (§7.2) |
| --- | --- | --- | --- | --- | --- |
| CTA hover / focus | hover, focus-visible | `--duration-micro` (200ms) | `--ease-entrance` | — | unchanged — a colour change is not motion |
| Rail paint past this section's node | existing page scrub (§7.3 #2) | — | — | — | already handled in `rail.tsx` |

Nothing else. No timeline, no ScrollTrigger, no tween, no GSAP import in any file added by this
prompt (decision 3). There is therefore no `gsap.matchMedia()` branch to write here, and no element
that could be left mid-animation when reduced motion is on.

Under 1B this table is unchanged: a focus move and a value prefill are state changes, not tweens.

## Accessibility requirements

- One `<h2>` for the section (the panel headline). The eyebrow is a `<p>`. The three card headings
  are `<h3>`. Order stays h1 → h2 → h3; no level is skipped and no level is chosen for its size.
- The mark is `aria-hidden` with `focusable="false"` — decorative, like the rail and the vignettes.
- The station marker is `aria-hidden`, as `RailStation` already handles.
- The CTA is a real anchor rendered through `Button` with `nativeButton={false}`, reachable by Tab,
  with the standard `focusRing`, and it moves focus to the Ask bar's shell via `#ask` — the same
  behaviour every other primary CTA on the page has.
- The cards contain no controls, take no focus, and have no `tabindex`.
- No horizontal page scroll at any width from 360px up; the mark is a `viewBox` SVG with
  `max-width`, so it cannot push the page wide (§12).
- Every muted string is `--rail-muted`; `--rail` carries no text at any opacity; the Display face
  carries no body copy.
- With JavaScript disabled the whole row renders and reads, and the CTA still navigates to `#ask`.
- Under 1B: the input has a visible `<label>` bound by `htmlFor`/`id`, the placeholder is an
  example and not a label, the form is submittable by `Enter`, and the focus handoff does not trap
  focus or scroll the page unexpectedly.

## Acceptance criteria

1. The row renders at 360, 768, 1024, and 1440px with no horizontal page scroll at any width.
2. The panel is left-aligned, matching `live-demo.tsx`'s standing decision — not centred.
3. The mark is the interchange described in decision 2: straight lines merging into one trunk, with
   `node-square`-sized markers. It is not circular, not overlapping, not grainy, and not coloured.
4. No route hue, `--signal`, or any value outside `--ink`, `--ground`, `--surface`, `--rail`,
   `--rail-muted`, `--paper` appears anywhere in the row, and no hex literal appears in any TSX file
   added by this prompt.
5. Card headings are `--text-panel` in the Display face; card lines are `--text-body` in
   `--rail-muted`; no card is numbered.
6. Heading order is h2 then three h3s, with exactly one h2 in the section and still exactly one h1
   on the page.
7. The CTA reads "Start a guide" and points at `#ask`, matching the header pill, the hero primary,
   the live demo CTA, and the Route CTA verbatim.
8. Under 1A, there is no `<input>`, no `<form>`, and no element styled to look like a field anywhere
   in the row. Under 1B, the field is real, labelled, keyboard-submittable, and its fine print says
   plainly that nothing is sent yet.
9. No file added by this prompt imports GSAP or `motion`.
10. `app/globals.css`, `lib/utils.ts`, `lib/gsap/*`, and `components/ui/*` are unmodified.
11. `grep -rn "placeholder: true" lib/copy/` still returns **fourteen** hits — unchanged, because
    nothing here is a fixture.
12. `app/page.tsx` gains one import and one element and still contains no layout maths, copy, or
    animation.
13. With JavaScript disabled the row reads in full.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
```

`build` is required because `app/page.tsx` — a route file — changes.

Paste the real output of all four; do not claim a check passed without running it (§14).

**The lint bar to hold.** The current baseline is exactly **three** pre-existing errors, one each in
`components/layout/wordmark.tsx`, `components/ui/carousel.tsx`, and `hooks/use-mobile.ts`. After
this prompt the output must be the same three errors in those same three files — the same files, not
merely the same count. Any new error is a failure, including in a new file.

`react-hooks/set-state-in-effect` is enforced in this repo. Under 1A no client component is added,
so it cannot bite. Under 1B, any browser-only value is read with `useSyncExternalStore` and a no-op
subscription, following `components/sections/copy-embed.tsx` — never a `setState` inside an effect.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **1440px.** Scroll to the row. Does the panel sit as one calm block, and does the card stack read
   as three peers rather than as a list? Confirm the panel does not outgrow its column and the mark
   has stopped at its `max-w` rather than stretching.
2. **The mark, cold.** Look at it without reading the copy and say what it is. If the answer is not
   "several things joining into one line", it has failed and the geometry needs another pass — that
   is the whole justification for authoring it rather than dropping the element.
3. **The mark against the reference.** Confirm nothing about it is circular, overlapping, grainy, or
   coloured (§5.3).
4. **1024px.** Two columns. Check the card stack's height against the panel's; if the mismatch is
   ugly, the fix is the mark's vertical space, not `items-stretch`.
5. **768px and 360px.** One column, panel above the cards, no sideways page scroll, fine print
   wrapping cleanly, CTA pill not clipped by the fixed Ask bar. At 360px specifically, confirm the
   Ask bar does not cover the CTA when the row is at the bottom of the viewport (§8.1).
6. **Tab through it.** From the Route CTA: the only stop in this row is the "Start a guide" pill. It
   shows a visible focus ring, and activating it moves focus to the Ask bar so the next Tab lands in
   the field.
7. **Reduced motion.** Turn the OS setting on and reload. Nothing in this row should change, because
   nothing in it moves. If something does change, a tween got in.
8. **JavaScript disabled.** The row renders in full and the CTA still jumps to `#ask`.
9. **Read the three card lines cold.** Each must be a statement about what Glidda does that we can
   stand behind, with no number and no comparison in it (decision 4). If one has drifted, it is one
   string in `lib/copy/build-guide.ts`.

## Open questions this raises for later prompts

- **Decision 1 needs the user's answer before implementation starts.** 1A (no second field) or 1B
  (a field that funnels into the Ask bar). Everything else in this prompt is settled.
- **The Glidda mark (§15) is still undesigned.** The interchange is one section's illustration, not
  a logo. If the user likes it enough to want it in the header, that is its own prompt — the header
  currently carries a text-only wordmark by decision, and promoting a section illustration to brand
  identity should not happen as a side effect.
- **The card claims.** "Every visitor gets their own language" and "you see where people stop"
  describe product behaviour from §1. They are real copy, not fixtures, which means they must be
  true. If either is not true today, cut the card rather than soften it — §11.2 applies the same
  standard to the announcement bar.
- **`rail-node` in this row.** Prompt 10 added `rail-node` for markers partway down a section. This
  row deliberately does not use it: three cards are not stations and nothing here is an ordered
  sequence (§6.4).
