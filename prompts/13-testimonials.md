# 13 — The testimonial carousel

## Goal

Build §8 row 11: **the testimonial carousel** — a small label, one long pull-quote set large in the
Display face at `--text-quote`, and below it the attribution (monogram, name, role, company) on the
left with a pair of circular prev/next buttons on the right.

Three quotes. Manual arrows only, **no autoplay** (§5.1 row 11, §5.2). Quotes swap by **crossfade,
never a slide**, and the attribution swaps with its quote.

Every quote, name, role, and company in this section is fabricated, so §11.1 applies to the whole
section in full: fixtures in `lib/copy/placeholder/`, the required flag on every object, invented
company names taken from §11.2's list, monogram circles rather than photographs, and one visible
`PLACEHOLDER` chip.

After it, `/` reads hero → customers → proof → live demo → intro → three capabilities → route →
stories → FAQ stub.

Out of scope, explicitly: the generator and capability cards (prompt 11), the real FAQ (prompt 12),
the closing CTA, any change to the Ask bar, any backend, autoplay, and any new orchestrated motion
beyond the click-driven crossfade argued in decision 2.

## Skills and docs read

- `AGENTS.md` — §5.1 row 11 (label, three-line pull-quote in the display face, avatar + name + role
  left, circular prev/next right, manual only, crossfade with no horizontal slide), §5.2
  ("hover darkens the circular button fill; clicking advances the quote and the attribution
  together via crossfade"), §5.3 (nothing of theirs comes across — not a quote, not a name, not a
  role, not a company), §6.1 (monochrome chrome: this section sits outside every feature panel, so
  **no route hue appears in it at all**), §6.2 (`--text-quote` is the pull-quote step; Utility face
  for labels; the Display face never carries body copy), §6.3 (four radii, hairlines, one shadow on
  the page and the Ask bar has it), §6.4 (every section carries a station), §7.1 (transform and
  opacity only; micro-interactions 0.15–0.25s), §7.2 (reduced motion), §7.3 (the three orchestrated
  moments are spent — see decision 2), §9 (layer separation, server by default), §10 (check
  `components/ui/` first; extend a primitive via `cva` in its own file; lucide only), §11 and
  §11.1–11.2 (the centre of this task), §12, §13, §14, §15.
- `.agents/skills/gsap-react` — `useGSAP`, scoped to a ref, `dependencies` + `revertOnUpdate` for a
  tween that must be rebuilt when state changes, automatic revert on unmount.
- `.agents/skills/gsap-core` — `gsap.matchMedia()` and the `(prefers-reduced-motion: reduce)`
  branch; `fromTo` vs `from` when CSS already owns the resting state.
- `.agents/skills/gsap-utils` — `gsap.utils.wrap` for the index, so prev at 0 lands on 2.
- `.agents/skills/shadcn/rules/base-vs-radix.md` — `@base-ui/react` `Button` takes `render`, not
  `asChild`; these two stay native buttons, so no `render` is needed.

Deliberately **not** read, and why:

- `node_modules/next/dist/docs/` — nothing here touches routing, config, fonts, metadata,
  `next/image`, or a server boundary. `app/page.tsx` gains one element in an existing list.
- `.agents/skills/gsap-scrolltrigger`, `-timeline`, `-plugins`, `-performance` — no ScrollTrigger,
  no loop, no plugin, and two opacity tweens have no performance question to answer.

## Existing code inspected

- `lib/copy/placeholder/types.ts` — `Placeholder = { readonly placeholder: true }` (a literal
  `true`, not a `boolean`, so a fixture cannot be quietly demoted to a claim) and
  `QuoteFixture = Placeholder & { quote, name, role, company, monogram }`. **This type already
  fits exactly**; the new fixtures reuse it and `types.ts` is not edited.
- `lib/copy/placeholder/companies.ts` — the seven §11.2 wordmarks. `Halden`, `Piperlane`, and
  `Coalspring` are indices 0, 2, and 4.
- `lib/copy/placeholder/proof.ts` — the house fixture voice: the quote **announces itself as a
  placeholder in its own text** ("Placeholder quote… Replace before launch."), the figures are
  round and notional, and the attributed company is read from `companies[n].name` "so the two
  cannot drift". The new fixtures follow all three habits.
- `components/sections/proof-band.tsx` — the existing quote block. The monogram is **inline**
  (lines 42–47): an `aria-hidden` span, `type-utility flex size-10 shrink-0 items-center
  justify-center rounded-full bg-surface text-rail-muted`, with the comment "The name follows in
  text, so announcing the initials would be noise." There is **no monogram component today** — see
  decision 6, which puts extracting it in scope.
- `components/layout/placeholder-chip.tsx` — `process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS ===
  "false"` returns `null`, so unset/empty/misspelled falls through to visible. Its own comment
  fixes the granularity: "One chip per block — not one per stat — so it reads as a warning rather
  than as decoration." Not `aria-hidden`. Reused as-is, unchanged.
- `components/ui/carousel.tsx` — embla-based, horizontal translate slider. **Not used** — decision
  3. Left untouched, exactly as prompt 09 left `components/ui/accordion.tsx` untouched for the FAQ.
- `components/sections/capability-accordion.tsx` — the repo's hand-rolled interactive client
  component, and the pattern this one copies: `"use client"`, a `rootRef`, `useGSAP(..., { scope,
  dependencies: [openIndex], revertOnUpdate: true })`, `gsap.matchMedia()` with named `motion` /
  `reduced` conditions, `focusRing` from `lib/utils.ts` on the interactive element, handlers left
  outside `contextSafe` when they create no tween, and the standing note that no height is animated
  because the swapping slot is always occupied.
- `components/motion/vignette.tsx` — the crossfade precedent, and the reduced-motion move worth
  copying verbatim: "the static first scene is already the reduced-motion state, so no timeline is
  built and nothing is left frozen mid-tween." Also the `vignette-scene` idea of letting CSS own
  the resting state and GSAP own only the transition.
- `components/sections/capability-section.tsx` — the section shell: `<section id className=
  "section-rhythm anchor-offset">` → `rail-offset relative` → `RailStation` → content; and the
  placeholder chip rendered **outside** the fabricated subtree with `min-h-[26px]` reserved so
  toggling markers off reflows nothing.
- `components/sections/copy-embed.tsx` — the established `useSyncExternalStore` workaround for a
  browser-only value under the enforced `react-hooks/set-state-in-effect` rule. Read, and **not
  needed here** (decision 8 uses CSS `@media (scripting: enabled)` instead, which costs no JS at
  all) — but it is the pattern to reach for if any browser-only value does turn up during
  implementation. Do not introduce a `useEffect` + `setState` pair.
- `components/ui/button.tsx` — `pillSecondary` is already exactly the reference's circular
  button: `rounded-pill hairline bg-surface text-ink hover:bg-rail-subtle` plus `focusRing` and
  `disabledState`, transitioning on `--duration-micro`. Sizes today: `icon` (`size-8`), `icon-lg`
  (`size-9`), `pill` (`h-11`). None is a 44px circle — decision 3b adds one via `cva` in this file.
- `components/layout/rail-station.tsx` — `aria-hidden`, node plus label, label dropped below 640px.
- `app/globals.css` — `section-rhythm`, `anchor-offset`, `rail-offset`, `rail-station`,
  `type-utility`, `type-display`, `hairline`, `--text-quote` (already defined, clamp 22 → 36px),
  `--radius-pill`, `--radius-chip`, `--duration-micro`, `--ease-entrance`, and the `@layer base`
  h1–h4 rule that sets `line-height: 1.06` on display headings. `vignette-scene` is the nearest
  existing stacking utility but it is absolutely positioned, which is wrong here (decision 1).
- `lib/utils.ts` — `cn()` with the extended `font-size` class group, which **already lists
  `"quote"`**. No new `--text-*` token is introduced by this prompt, so §13's tailwind-merge list is
  correct as-is and `lib/utils.ts` is not edited. `focusRing` and `disabledState` are reused.
- `lib/gsap/motion.ts` — `DURATION.micro = 0.2`, `EASE.entrance = "power2.out"`, and the house
  habit of one exported block per section with the reasoning in the doc comment.
- `lib/gsap/register.ts` — the single `registerPlugin` site. Import `gsap` and `useGSAP` from here.
- `app/page.tsx` — composition only; `<Testimonials />` goes after `<RouteSection />` and before
  the `#faq` stub, and the stub's TODO comment is updated to drop "the testimonial carousel".
- `app/design-system/page.tsx` — the only current consumer of `text-quote`. The landing page has
  never used it; this section is its first real consumer.

Baseline confirmed by running `npm run lint` before starting:

```
✖ 3 problems (3 errors, 0 warnings)
```

in `components/layout/wordmark.tsx`, `components/ui/carousel.tsx:98`, and `hooks/use-mobile.ts:14`
— the last two are `react-hooks/set-state-in-effect`. **That is the bar: exactly 3, same 3 files.**

## Decisions and assumptions

### 1. The crossfade changes no height, because nothing is ever measured or animated to fit

The three quotes are different lengths, so a naive crossfade would change the block's height and
the arrows and the FAQ below would jump. §7.1 forbids animating `height` outright, and animating it
would be the wrong fix anyway.

The fix is layout, not motion. **All three slides live in one CSS grid cell.** A new
`crossfade-stack` utility sets `display: grid` and puts every direct child in `grid-area: 1 / 1`.
The container's height therefore resolves to the **tallest of the three at the current width**,
computed by the browser, re-computed for free on resize and on font load, and identical before,
during, and after a swap. Nothing is measured in JavaScript, nothing has a `min-height` magic
number, and the swap animates exactly one property: opacity.

Grid stacking, not the absolute positioning `vignette-scene` uses: an absolutely positioned stack
collapses its parent to zero height and would need a hardcoded reserve, which is precisely the
magic number §13 rules out.

Second-order problem, also solved by layout: the attribution row must sit at the **same y in all
three slides**, or the arrows (aligned to the bottom of the stack) would only ever line up with the
attribution of the tallest quote. So each slide is itself `grid grid-rows-[1fr_auto]` — the
blockquote takes the flexible row and is `self-start`, the figcaption takes the auto row at the
bottom. Grid children stretch by default, so all three slides are the stack's full height and all
three figcaptions land on the same line. The gap between a short quote and its attribution is
larger than for a long one, which is correct and is what the reference shows.

### 2. Why this animation exists at all, when §7.3's three moments are spent

Argued both ways, and the answer is that **it is not a fourth orchestrated moment.**

§7.3 reserves its budget for *orchestrated* motion: multi-element timelines, with sequencing and
stagger, that run without anyone asking — the hero load, the scrubbed rail, the looping vignettes.
Its closing line is "Everything else is a 0.2s hover." What this section adds is a two-tween
opacity change on one pair of elements, at `DURATION.micro`, fired only by a user's click. It is in
the same class as `CAPABILITY.swap` — the accordion's row-body crossfade, also `DURATION.micro`,
also a state change, which prompt 09 shipped without spending a moment on it.

The case against: it is 0.30s end to end, not 0.20s, and it does have two ordered tweens rather
than one. Taken at face value that is a sequence, and a strict reading of §7.3 would want a stated
reason. This is that stated reason, and the mitigations are that it starts only on a click, ends
within a third of a second, animates nothing but opacity, and runs no loop and no ScrollTrigger.

The alternative — an instant swap with no fade — was rejected because §5.1 and §5.2 both name the
crossfade specifically, and a hard cut on a three-line 36px quote reads as a glitch.

Either way, **do not add autoplay.** §5.1 says "Manual only — no autoplay observed", and an
auto-advancing carousel would also duplicate the accordion's timer mechanic on a page that already
has three of them.

### 3. Do not use `components/ui/carousel.tsx`; hand-roll the swap and extend `Button`

**a. The carousel primitive is rejected.** Four independent reasons, any one sufficient:

1. Its entire mechanic is the wrong one. Embla is a translate-based horizontal slider: `Carousel
   Content` renders `overflow-hidden` around a `flex` track that embla moves with a transform.
   §5.1 and §5.2 both observed a **crossfade with no horizontal slide**. Adopting it would mean
   importing a slider in order to defeat its only job.
2. It would create two owners of one transform. §7.1 puts every transform under GSAP; embla writes
   `translate3d` on the track every frame. `app/globals.css` already documents this hazard for the
   slipstream ("GSAP only ever touches xPercent on the layers, so the two never write the same
   transform"). We would be creating the collision that comment exists to prevent.
3. Cost. It pulls the `embla-carousel-react` runtime, a React context, four sub-components, and a
   `canScrollPrev/Next` state machine, to move between three static quotes.
4. It carries one of the repo's three pre-existing lint errors
   (`carousel.tsx:98 react-hooks/set-state-in-effect`). Importing it into the landing page would
   put a knowingly-broken file in `/`'s dependency graph and create pressure to fix it — an
   unrelated refactor under §13. Leaving it unimported keeps the baseline honest: still 3 errors,
   still in files `/` does not use.

This mirrors prompt 09's precedent exactly, where `components/ui/accordion.tsx` was left alone and
the Base UI primitive was composed directly, because the wrapper animated `height`.

**b. What we do reuse.** `components/ui/button.tsx`. Both arrows are `Button` with
`variant="pillSecondary"` — which is already the reference's behaviour (`bg-surface` filling,
`hover:bg-rail-subtle` darkening it, `rounded-pill`, `focusRing`, `--duration-micro`). §10 says a
primitive that needs a variant gets it via `cva` **in that file**, so add one size:

```
"icon-pill": "size-11"
```

44px — matching `size: pill`'s `h-11` so the two button shapes share a height, and clearing WCAG
2.5.8's target size, which `icon-lg`'s 36px does not comfortably do for the page's only
pointer-driven navigation. `rounded-pill` comes from the variant and beats the base
`rounded-lg` through `cn()`'s tailwind-merge. No new component wraps the button.

**c. Icons.** `lucide-react` only (§10): `ArrowLeft` and `ArrowRight`. Arrows, not chevrons — the
announcement bar's trailing `→` already established the arrow as this page's directional glyph.

### 4. Reduced motion: the swap is instant, and GSAP builds nothing

§7.2's contract is "nothing becomes unusable and nothing keeps moving". Here that is easy, because
CSS owns the resting state (decision 5) and GSAP owns only the transition. In the `reduced` branch
of `gsap.matchMedia()`, **return before building any tween** — verbatim the vignette's move. React
has already re-rendered `data-active`, so the new quote is simply shown and the old one is simply
hidden, with no fade, no half-faded frame, and nothing left frozen mid-tween. The arrows, the wrap,
the announcement, and the keyboard path are all unchanged.

### 5. CSS owns the resting state; GSAP uses `fromTo`, never `from`

Each slide carries `data-active={index === active}`. A component-scoped rule hides inactive slides:

```css
[data-slide][data-active="false"] { opacity: 0; }
```

This is the same three-way payoff `globals.css` already documents for `[data-hero]` and
`vignette-scene`: it is the JavaScript-disabled state (quote 1 renders, the others stay out of the
way), it is the reduced-motion state, and it is what `revertOnUpdate: true` reverts *to* — so
after GSAP strips its inline styles the DOM is already correct for the new index.

The consequence is subtle and must be implemented deliberately: at the moment the effect runs, the
outgoing slide is **already hidden by CSS**. So both tweens must be `fromTo` —
`fromTo(outgoing, { autoAlpha: 1 }, { autoAlpha: 0 })` and
`fromTo(incoming, { autoAlpha: 0 }, { autoAlpha: 1 })`. A plain `from`/`to` would animate 0 → 0 and
the fade would never appear, which is exactly the trap `globals.css` documents for the hero.

Use `autoAlpha`, not `opacity`, so an inactive slide is also `visibility: hidden` mid-tween and
cannot be hit-tested or picked up by a find-in-page.

### 6. Extract the monogram; it is not an unrelated refactor

The monogram avatar exists today only as six inline lines in `proof-band.tsx`. §10 says to identify
reusable components before creating new ones and to extend rather than duplicate, and this section
is the second consumer arriving — which is exactly when extraction is warranted rather than
speculative.

So: create `components/layout/monogram.tsx` (server component, `{ initials, className? }`, keeping
the `aria-hidden` and the "the name follows in text" comment), and change `proof-band.tsx` to call
it. That is the **only** edit to `proof-band.tsx`; nothing else in that file is touched.

One normalisation rides along and should be stated rather than smuggled: the inline version uses
`rounded-full`, and §6.3 permits exactly four radii. `999px` and `9999px` render identically, but
the extracted component uses `rounded-pill` so the token set actually holds. Nothing moves a pixel.

Copying the six lines into a second file instead was rejected: two hand-maintained monograms drift,
and the next reviewer cannot tell which is canonical.

### 7. The visible marker renders once for the section, not once per quote

`placeholder-chip.tsx`'s own comment settles it: one chip per fabricated **block**, not one per
item, "so it reads as a warning rather than as decoration". The carousel is one block — all three
quotes are fixtures and only one is ever visible.

It renders on the label row, **outside** the crossfade stack, so it never fades, never moves, and
never gets `aria-hidden` along with an inactive slide. Its row reserves `min-h-[26px]` exactly as
`capability-section.tsx` does, so setting `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS=false` reflows
nothing.

### 8. The arrows are hidden when there is no script to run them

§12 requires the page to be readable and navigable with JavaScript disabled. Without JS the stack
shows quote 1 and the arrows would be two live-looking buttons that do nothing — worse than absent.

Solve it in CSS, at no JS and no hydration cost, reusing the `@media (scripting: enabled)` idiom
`globals.css` already uses twice:

```css
@utility scripting-only {
  display: none;
  @media (scripting: enabled) { display: flex; }
}
```

No `useSyncExternalStore`, no effect, no `setState` — nothing for
`react-hooks/set-state-in-effect` to catch.

### 9. The visible label is the `h2`

`proof-band.tsx` uses an `sr-only` h2 because that band has no label slot. This section has one, so
the small grey label **is** the heading: `<h2 className="type-utility text-rail-muted">`. §6.2
allows the Utility face for labels, §11's "one job per element" prefers one element over a hidden
heading plus a near-duplicate visible label, and §12's outline stays h1 → h2 → h2 → … with a real,
visible entry. `type-utility` overrides the `@layer base` display-face rule for h1–h4, and
`--rail-muted` is 6.13:1 on `--ground`.

The pull-quote is a `<blockquote>`, not a heading, even though it is the largest type in the
section.

### 10. Rejected alternatives, briefly

- **Autoplay with a progress underline**, mirroring the accordion — rejected: §5.1 says manual
  only, and the page already runs that mechanic three times.
- **A horizontal slide or a scroll-snap track** — rejected: §5.1 and §5.2 both name the crossfade
  and rule out the slide.
- **Disabling the arrows at the ends** (what `CarouselPrevious/Next` do) — rejected: with three
  quotes, wrapping via `gsap.utils.wrap` is better than a dead button, and a button that disables
  under the user's own cursor loses focus and breaks the keyboard path.
- **An `ArrowLeft`/`ArrowRight` keydown handler on the region**, as the shadcn carousel has —
  rejected: it hijacks arrow keys from anyone who has tabbed into the region, and the two buttons
  already deliver the full keyboard operation §12 asks for.
- **Rendering only the active slide** — rejected: the stack could then no longer size itself to the
  tallest quote (decision 1), and there would be nothing to crossfade from.
- **Adding a `y` rise to the incoming quote**, as `CAPABILITY.swapRise` does for the accordion —
  rejected: 4px is invisible on 15px body copy but a visible shift on a three-line 36px display
  quote, which is the "slide" §5.1 rules out. The accordion's rise exists because opacity alone
  reads as a flicker at body size; a pull-quote does not need the help.

## Files likely to change

New:

- `lib/copy/placeholder/testimonials.ts` — three `QuoteFixture` objects.
- `lib/copy/testimonials.ts` — the section's real copy (label, station, button labels).
- `components/sections/testimonials.tsx` — server component; section shell, station, label row,
  marker chip; renders the client carousel.
- `components/sections/testimonial-carousel.tsx` — `"use client"`; the stack, the arrows, the GSAP
  crossfade.
- `components/layout/monogram.tsx` — extracted per decision 6.

Edited:

- `components/sections/proof-band.tsx` — inline monogram → `<Monogram />`. Nothing else.
- `components/ui/button.tsx` — one new `size` entry, `"icon-pill"`.
- `lib/gsap/motion.ts` — one new exported `TESTIMONIAL` block.
- `app/globals.css` — `crossfade-stack` and `scripting-only` utilities, and the inactive-slide
  rule in `@layer components`.
- `app/page.tsx` — `<Testimonials />` inserted; the FAQ stub's TODO comment updated.

Explicitly **not** edited, and each for a stated reason:

- `components/ui/carousel.tsx` — decision 3a. It must still contain exactly the same one lint error
  afterwards.
- `lib/copy/placeholder/types.ts` — `QuoteFixture` already fits.
- `lib/utils.ts` — no new `--text-*` token, so §13's tailwind-merge list needs no addition.
  Confirm this by checking that no new `--text-*` custom property is added to `globals.css`.
- `hooks/`, `components/ask/`, `components/motion/`.

## Implementation requirements

### `lib/copy/placeholder/testimonials.ts`

Header comment in the house style: what this is, that it is fictional by construction, and that it
is removable in one pass — **phrased so §14's pre-deploy grep string never appears in a comment**,
exactly as `types.ts` and `live-demo.ts` are careful to do.

Type it `readonly QuoteFixture[]` imported from `./types`. Read each `company` from
`companies[n].name` so the carousel and the logo band cannot drift.

The three quotes, to be used verbatim. Each is 32–36 words, each announces itself as a placeholder
in its own text (matching `proofQuote`), and none resembles any real company's testimonial:

1. `companies[0]` — Halden — J. Okonkwo, Head of Onboarding, monogram `JO`:
   > "Placeholder quote. Three sentences of roughly forty words, written so the pull-quote wraps to
   > three lines at desktop width and the attribution row below it is designed against a real
   > length. Replace before launch."
2. `companies[2]` — Piperlane — R. Lindqvist, VP Product, monogram `RL`:
   > "Placeholder quote, second of three. It runs a little longer than the first, so the stack sizes
   > itself to the tallest quote and the arrows never move when a reader steps between them. Replace
   > before launch."
3. `companies[4]` — Coalspring — T. Baptiste, Growth lead, monogram `TB`:
   > "Placeholder quote, third of three. It is the shortest of the set, so the crossfade is tested
   > against a change in height as well as a change in words. Replace before launch."

Three different companies, and none of them Rivetworks — the proof band already attributes to
Rivetworks, and reusing it would read as one customer supplying two quotes.

Monograms are authored, not derived — `types.ts` already says why.

### `lib/copy/testimonials.ts`

Real copy, not fixtures. Header comment saying so, again without the grep string.

```
label       "Customer stories"      // the visible h2, Utility face
station     "Stories"               // the rail station label
carousel    "Customer stories"      // aria-label on the carousel group
previous    "Previous quote"        // sr-only label on the left arrow
next        "Next quote"            // sr-only label on the right arrow
slideLabel  (n, total) => `${n} of ${total}`   // per-slide aria-label
```

Explicit type annotation on the export, per the pattern in `lib/copy/live-demo.ts`.

### `components/layout/monogram.tsx`

Server component. `{ initials, className }: { initials: string; className?: string }`. Renders the
`aria-hidden` span with `cn("type-utility flex size-10 shrink-0 items-center justify-center
rounded-pill bg-surface text-rail-muted", className)`. Carry across the "the name follows in text,
so announcing the initials would be noise" comment.

### `components/sections/testimonials.tsx`

Server component, composition only for this section:

```
<section id="stories" className="section-rhythm anchor-offset">
  <div className="rail-offset relative">
    <RailStation label={testimonials.station} />
    <div className="flex min-h-[26px] flex-wrap items-center gap-3">
      <h2 className="type-utility text-rail-muted">{testimonials.label}</h2>
      <PlaceholderChip />
    </div>
    <TestimonialCarousel />
  </div>
</section>
```

The carousel imports its own fixtures; do not pass them through as props from here.

### `components/sections/testimonial-carousel.tsx`

`"use client"`. Under ~150 lines; if it approaches 200, extract the slide (§13).

State: `const [active, setActive] = useState(0)`. Refs: `rootRef`, and `prevRef` holding the
previously-active index, initialised to `0`.

`step = (delta: number) => setActive((i) => gsap.utils.wrap(0, quotes.length, i + delta))`.

Markup:

```
<div ref={rootRef} className="mt-10 grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
     role="group" aria-roledescription="carousel" aria-label={testimonials.carousel}>

  <div className="crossfade-stack" aria-live="polite" aria-atomic="false">
    {quotes.map((q, i) => (
      <figure key={q.name} data-slide data-active={i === active}
              role="group" aria-roledescription="slide"
              aria-label={testimonials.slideLabel(i + 1, quotes.length)}
              aria-hidden={i !== active} inert={i !== active}
              className="grid grid-rows-[1fr_auto] gap-8">
        <blockquote className="type-display self-start text-quote leading-[1.06] text-ink
                               max-w-[52ch]">
          {q.quote}
        </blockquote>
        <figcaption className="flex items-center gap-3 text-small text-rail-muted">
          <Monogram initials={q.monogram} />
          <span>
            <span className="text-ink">{q.name}</span>{", "}{q.role}{", "}{q.company}
          </span>
        </figcaption>
      </figure>
    ))}
  </div>

  <div className="scripting-only justify-end gap-3">
    <Button variant="pillSecondary" size="icon-pill" onClick={() => step(-1)}>
      <ArrowLeft aria-hidden />
      <span className="sr-only">{testimonials.previous}</span>
    </Button>
    <Button variant="pillSecondary" size="icon-pill" onClick={() => step(1)}>
      <ArrowRight aria-hidden />
      <span className="sr-only">{testimonials.next}</span>
    </Button>
  </div>
</div>
```

`inert` is a real React 19 boolean prop (React 19.2 is installed) — do not hand-roll a
`tabIndex={-1}` sweep.

Motion, in one `useGSAP`:

```
useGSAP(() => {
  const root = rootRef.current
  const from = prevRef.current
  prevRef.current = active
  if (!root || from === active) return          // first mount animates nothing

  const slides = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-slide]"))
  const out = slides[from], into = slides[active]
  if (!out || !into) return

  const mm = gsap.matchMedia()
  mm.add({ motion: "(prefers-reduced-motion: no-preference)",
           reduced: "(prefers-reduced-motion: reduce)" }, (context) => {
    if (context.conditions?.reduced) return     // §7.2 — CSS already shows the right slide
    const tl = gsap.timeline({ defaults: { ease: EASE.entrance } })
    tl.fromTo(out,  { autoAlpha: 1 }, { autoAlpha: 0, duration: TESTIMONIAL.out }, 0)
      .fromTo(into, { autoAlpha: 0 }, { autoAlpha: 1, duration: TESTIMONIAL.in },
              TESTIMONIAL.overlap)
  })
  return () => mm.revert()
}, { scope: rootRef, dependencies: [active], revertOnUpdate: true })
```

`revertOnUpdate: true` is what makes rapid clicking safe: a second click kills the running timeline
and strips its inline styles before the next one is built, and React's re-rendered `data-active`
is already the correct resting state underneath. No `kill()` bookkeeping, no `setTimeout`.

Writing `prevRef` inside the hook (an effect), never during render — `react-hooks/refs` flags the
latter, and `capability-accordion.tsx` documents that boundary.

The click handlers create no tween, so — following the accordion's stated reasoning — they are
**not** wrapped in `contextSafe`.

### `lib/gsap/motion.ts`

```ts
/**
 * The testimonial carousel's quote swap (§8 row 11). Not a fourth orchestrated moment (§7.3) — a
 * click-driven opacity change on one pair of elements, in the same class as CAPABILITY.swap.
 */
export const TESTIMONIAL = {
  /** The outgoing quote's fade. */
  out: 0.15,
  /** The incoming quote's fade. Matches --duration-micro. */
  in: DURATION.micro,
  /** Seconds after the fade-out starts that the fade-in begins. Deliberately most of the way
   *  through the out tween: two three-line quotes overlapping at half opacity ghosts, so the
   *  overlap is short enough to hide the seam and short enough not to read as a dissolve.
   *  Total 0.30s. */
  overlap: 0.1,
} as const
```

No other duration literal appears in the component (§13).

### `app/globals.css`

```css
/* Every child in one grid cell, so a stack of alternatives is as tall as its tallest member at
   every width and a crossfade between them changes no height (§7.1). Grid, not absolute
   positioning: an absolute stack collapses its parent and would need a hardcoded reserve. */
@utility crossfade-stack {
  display: grid;
  > * { grid-area: 1 / 1; }
}

/* For an affordance that is inert without JavaScript. Absent rather than dead (§12). */
@utility scripting-only {
  display: none;
  @media (scripting: enabled) { display: flex; }
}
```

and in `@layer components`, beside the existing scoped component rules:

```css
/* The resting state of a crossfade stack: one slide shown, the rest out of the way. This is also
   the JavaScript-disabled state and the reduced-motion state (§7.2), and it is what
   `revertOnUpdate` reverts to — GSAP writes inline opacity, which beats this regardless of layer. */
[data-slide][data-active="false"] { opacity: 0; }
```

### `app/page.tsx`

`import { Testimonials } from "@/components/sections/testimonials"`; render after `<RouteSection />`
and before the `#faq` stub. Update the stub's TODO/doc comment so it no longer lists the
testimonial carousel as outstanding.

## Visual spec

**Layout.** `section-rhythm anchor-offset` → `rail-offset relative` → station marker → label row →
carousel. Content max-width 1200px, gutters from `--gutter`, everything hanging off the rail by
`--rail-x + --rail-gap` like every other section.

- Label row: `flex flex-wrap items-center gap-3 min-h-[26px]`. `h2` in `type-utility`
  (11px / 500 / `0.12em` / uppercase) at `--rail-muted`; the `PLACEHOLDER` chip beside it.
- Carousel row: `mt-10` (40px). At ≥640px, `grid-cols-[minmax(0,1fr)_auto] items-end gap-8` — the
  stack left, the arrows right, bottom-aligned to the attribution line. Below 640px it is one
  column and the arrows sit under the attribution, `justify-end`.
- Slide: `grid grid-rows-[1fr_auto] gap-8`. Blockquote `self-start`; figcaption in the bottom row.

**Type.**

| Element | Token / class | Face |
| --- | --- | --- |
| Section label (`h2`) | `type-utility`, `--text-eyebrow` 11px | Utility |
| `PLACEHOLDER` chip | `type-utility` | Utility |
| Pull-quote | `type-display text-quote leading-[1.06]` (22 → 36px) | Display |
| Name / role / company | `text-small` 14px | Body |
| Monogram | `type-utility` | Utility |

`leading-[1.06]` is §6.2's non-hero display leading and matches the `@layer base` h1–h4 rule; it is
an arbitrary value only because no leading token exists yet. If a third consumer needs it, promote
it to a custom property then — not now.

Quote measure `max-w-[52ch]`. At 1440px that lands a 32–36 word quote on **three lines**, which is
the reference's shape; at 1024px it is three to four; below 768px it is more, which is why the
stack sizes itself to the tallest slide rather than to a number.

**Colour.** `--ink` for the quote and the name; `--rail-muted` for the label, role, company, and
monogram initials; `--surface` for the monogram fill and the arrows' fill; `--rail-subtle` for the
arrow hover; `--rail` for the arrows' hairline. **No route hue, no `--signal`, nothing coloured** —
this section is outside every feature panel (§6.1). No shadow (§6.3 — the Ask bar has the only one).

**Shape.** Monogram and arrows `rounded-pill`; the marker chip `rounded-chip`. No cards, no
borders around the quote, one hairline only on the arrows.

**States.**

- Arrow rest: `bg-surface`, hairline, ink glyph.
- Arrow hover: fill darkens to `--rail-subtle` over `--duration-micro` (§5.2).
- Arrow focus-visible: the shared `focusRing` — 2px ring in `--ring` (`--ink`) with a
  `--ground` offset. Never removed.
- Arrow active: the base `Button` class's `translate-y-px`.
- Arrows are never disabled — the index wraps.
- Inactive slide: `opacity: 0`, `visibility: hidden` mid-tween, `aria-hidden`, `inert`.
- No-JS: arrows absent; quote 1 shown; everything else identical.

**Responsive.** 360 / 768 / 1024 / 1440. No horizontal page scroll at any width; nothing here needs
its own scroll container. Below 640px the rail station thins to a node, as everywhere else.

## Motion spec

| | |
| --- | --- |
| What animates | The outgoing slide's `autoAlpha` 1 → 0 and the incoming slide's 0 → 1. Nothing else. |
| Trigger | A click, Enter, or Space on either arrow. Never scroll, never a timer, never on load. |
| Duration | out `TESTIMONIAL.out` 0.15s; in `TESTIMONIAL.in` 0.20s starting at `TESTIMONIAL.overlap` 0.10s. Total 0.30s. Each tween is inside §7.1's 0.15–0.25s micro window. |
| Easing | `EASE.entrance` (`power2.out`) on both. No bounce, no elastic. |
| Stagger | None — two elements. |
| Properties | Opacity (and visibility, via `autoAlpha`) only. **No transform, no height, no width.** No horizontal movement of any kind (§5.1). |
| Height | Never animated and never changes: the grid stack is always as tall as the tallest quote (decision 1). |
| Loops / ScrollTrigger | None. No autoplay. No plugin beyond the already-registered set. |
| First mount | Animates nothing; the guard `from === active` returns early. |
| Rapid clicks | `revertOnUpdate: true` kills and reverts the running timeline before the next is built. |
| Reduced motion | `gsap.matchMedia()` `reduced` branch returns before building anything; the swap is instant, driven entirely by the `data-active` CSS rule. Everything stays operable. |
| Cleanup | One `useGSAP` scoped to `rootRef`, returning `mm.revert()`. Nothing survives unmount. |

## Accessibility requirements

- **Roles.** The carousel wrapper is `role="group"` with `aria-roledescription="carousel"` and an
  `aria-label` — **not** `role="region"` (which the shadcn primitive uses), because it sits inside
  a `<section>` that already has a heading and a second landmark there would be noise.
- **Slides.** Each is `role="group"` with `aria-roledescription="slide"` and
  `aria-label="1 of 3"`, so a screen-reader user knows both position and count without a visible
  counter.
- **Announcement.** The slides container is `aria-live="polite" aria-atomic="false"`. This is APG's
  prescription for a carousel with no auto-rotation: when `aria-hidden` lifts from the new slide it
  enters the accessibility tree and is announced, quote and attribution together. Verify this
  against a real screen reader in the manual review — some readers also read the departing slide,
  which is tolerable but should be observed rather than assumed.
- **Inactive slides** get both `aria-hidden` and `inert`, so their text is neither announced nor
  reachable by find-in-page. They contain nothing focusable regardless.
- **Keyboard, complete.** Tab reaches both arrows in DOM order; Enter and Space activate them
  natively; focus never moves and never lands on a disabled control, because the arrows never
  disable and never re-order. No arrow-key handler is added (decision 10) — the buttons are the
  whole interface.
- **Visible focus** on both arrows via the `focusRing` already baked into `pillSecondary`. Not
  removed, not replaced, not restyled.
- **Names.** Each arrow's accessible name comes from an `sr-only` span ("Previous quote" / "Next
  quote"); the lucide glyph is `aria-hidden`.
- **Monogram** stays `aria-hidden` — the name follows in text.
- **Heading order** holds: h1 (hero) → … → this h2. One `h1` on the page.
- **Contrast**: `--ink` on `--ground` and `--rail-muted` (6.13:1) on `--ground` and (5.41:1) on
  `--surface`. `--rail` carries no text anywhere here.
- **Target size**: 44px arrows.
- **The `PLACEHOLDER` chip is not `aria-hidden`** — a screen-reader user is exactly who must not be
  handed an unmarked fabricated quote.
- **Without JavaScript**: one quote, its attribution, the label, and the chip all render from the
  server; the arrows are absent rather than dead.

## Acceptance criteria

1. `/` renders a testimonial section between the route section and the FAQ stub, with a station on
   the rail labelled "Stories".
2. Three quotes; clicking next cycles 1 → 2 → 3 → 1 and prev cycles the other way. No autoplay: the
   quote never changes on its own, at any scroll position, over at least 60 seconds of observation.
3. The quote and its attribution change **together**, by crossfade. Nothing slides horizontally.
4. The block's height does not change when the quote changes, at any of the four widths, and
   nothing below the section moves.
5. Both arrows are 44px circles, show the hover darkening and a visible focus ring, are operable by
   Enter and Space, and are never disabled.
6. All three quotes, names, roles, and companies come from `lib/copy/placeholder/testimonials.ts`;
   every object carries the required flag; nothing fabricated appears inline in any component.
7. Companies are drawn from `lib/copy/placeholder/companies.ts` by reference, not retyped.
8. Avatars are monogram circles. No photograph, no generated face, no image file, no `next/image`
   call anywhere in the section.
9. Exactly one `PLACEHOLDER` chip renders for the section. With
   `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS=false` it disappears and **nothing reflows**.
10. With `prefers-reduced-motion: reduce`, the swap is instantaneous, nothing fades, nothing is
    stuck part-faded, and the arrows still work.
11. With JavaScript disabled the section renders the label, chip, first quote, and its attribution,
    and the arrows are absent.
12. `components/ui/carousel.tsx` is byte-identical to its current state and is imported by nothing
    on `/`.
13. `proof-band.tsx`'s only change is the monogram call; the proof band is pixel-identical.
14. No route hue, no `--signal`, no shadow, and no hardcoded hex anywhere in the new files.
15. No new `--text-*` token, therefore no change needed in `lib/utils.ts` — and that is verified,
    not assumed.
16. Lint is still exactly **3 errors**, in `wordmark.tsx`, `carousel.tsx`, and `use-mobile.ts`.
17. `grep -rn "placeholder: true" lib/copy/` returns **17** hits, up from 14. Three new hits, all
    in `lib/copy/placeholder/testimonials.ts`. The rise is intended and is the direct consequence of
    §11.1 — the section ships with content rather than empty — and all 17 remain outstanding under
    §15 until real quotes replace them. No public deploy without the user's explicit sign-off.

## Checks to run

Report the real output of each; do not claim a pass without pasting it.

```
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
grep -rn "placeholder: true" lib/copy/ | wc -l          # expect 17
git diff --stat components/ui/carousel.tsx              # expect: no output
grep -rn "#[0-9a-fA-F]\{3,8\}" components/sections/testimonials.tsx \
  components/sections/testimonial-carousel.tsx \
  components/layout/monogram.tsx lib/copy/testimonials.ts \
  lib/copy/placeholder/testimonials.ts                  # expect: no output
```

`npm run build` is included because `app/page.tsx` changes and a section is added to a route.

Lint must end in `✖ 3 problems (3 errors, 0 warnings)` — the same three files as the pre-existing
baseline. Any fourth error, in any file, blocks the prompt. In particular `react-hooks/
set-state-in-effect` is enforced: no `useEffect` that calls `setState`; if a browser-only value is
needed, use the `useSyncExternalStore` pattern from `components/sections/copy-embed.tsx`.

## Manual review steps

`npm run dev`, then `http://localhost:3000/#stories`.

**Widths — 360, 768, 1024, 1440.** At each, state what was seen:

1. No horizontal page scroll. Resize slowly through each breakpoint and watch for overflow.
2. The label row, the chip, the quote, the attribution, and the arrows are all present and legible.
3. Click next twice and prev twice. **The section's height does not change and the FAQ stub below
   does not move.** Watch the arrows specifically — they must stay put.
4. 1440: the quote wraps to three lines. 360: the arrows sit below the attribution, right-aligned,
   and the 44px targets are comfortable with a thumb.
5. Below 640px the rail station is a node with no label, as in every other section.

**Interaction.**

6. Hover each arrow — the fill darkens; nothing else moves.
7. Tab from the route section's CTA: focus reaches prev then next, each with a visible ring.
   Activate with Enter, then with Space. Cycle past the end and confirm it wraps rather than
   dead-ends.
8. Click next five times as fast as possible. No flicker, no stuck half-faded quote, no two quotes
   legible at once, and the final state matches the arrow count.
9. Watch the section for a full minute without touching it. Nothing changes.

**Reduced motion.** Toggle the OS setting (GNOME: `gsettings set org.gnome.desktop.interface
enable-animations false`, or DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`),
reload, and confirm: the swap is instant, no fade is visible, no slide is left partly transparent,
and both arrows still cycle correctly. Toggle back and confirm the crossfade returns.

**Placeholder policy.** Restart dev with `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS=false npm run dev`
and confirm the chip disappears and the layout does not shift by a pixel. Restart without it and
confirm the chip is back — unset must mean visible.

**No JavaScript.** DevTools → Settings → Debugger → Disable JavaScript, reload: the label, chip,
first quote, and attribution all render; the arrows are absent, not dead. No layout shift versus the
scripted first paint.

**Screen reader.** With Orca or VoiceOver: confirm the carousel announces its role and label, the
slide announces "1 of 3", and pressing next announces the new quote and its attribution. Note
verbatim what is announced — including whether the departing slide is read — rather than assuming.

## Open questions this raises for later prompts

- **Swapping the fixtures (§15).** Three more `placeholder: true` records now stand between this
  page and a public deploy. Worth deciding soon whether real quotes exist at all, since a real
  testimonial's length will change the `52ch` measure and the three-line target.
- **A display leading token.** `leading-[1.06]` is now written in two places (the `@layer base`
  h1–h4 rule and this blockquote). A third consumer should promote it to a custom property.
- **`crossfade-stack` is general.** The FAQ does not need it, but a future post-submit Ask bar view
  or the closing CTA might. It is deliberately named for the mechanic, not this section.
