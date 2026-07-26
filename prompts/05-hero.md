# 05 — The hero

## Goal

Build the landing page's hero (§8, row 3): the one `h1` on the site, its subcopy, the two-CTA row,
and the full-bleed `mono-signal` slipstream band beneath them — all hanging off the Rail rather
than centred. Deliver §7.3's first orchestrated moment, the hero load, under 1.2s.

This replaces the stub currently occupying `app/page.tsx` lines 13–23. The other three stubs stay
until their own prompts land.

The hero is the first section that has to prove the design system actually works: a 300-weight
serif at 76px, a monochrome page chrome, and a texture that is only allowed one diluted warm
layer. If the hero reads as bare paper, the exception granted to `mono-signal` in §6.1 was not
enough and we will know it here rather than five sections later.

## Skills and docs read

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` —
  `"use client"` marks a boundary, and **everything the client module imports or directly renders
  joins the client bundle**, but *"does not apply to Server Components passed as children or other
  props. Those components are rendered on the server and passed to the Client Component as
  rendered output."* This is the whole basis of decision 2 below: the motion wrapper is a client
  component, and the hero's markup and copy stay server-rendered by arriving through `children`.
- `.agents/skills/gsap-react` — `useGSAP` with `scope`, automatic revert, no GSAP during SSR.
  Selector strings are acceptable **only** when a `scope` is passed; that is what makes decision 2
  work, since a `children` slot gives the wrapper no refs to its own content.
- `.agents/skills/gsap-timeline` — one `gsap.timeline()` with `defaults`, the position parameter
  (`"<"`, `"<0.06"`, absolute numbers) rather than chained `delay`s, and labels for readability.
- `.agents/skills/gsap-core` (via prompt 04's reading) — `gsap.matchMedia()` with named
  conditions and `context.conditions`; `mm.revert()` in the cleanup.
- `.agents/skills/gsap-performance` (via prompt 04's reading) — transform and opacity only;
  `will-change` only on elements that actually animate.
- `AGENTS.md` §6.1 (colour and the `mono-signal` exception), §6.2 (two display steps), §6.3
  (spacing, radii, texture), §6.4 (the Rail), §7.1–§7.3 (motion, reduced motion, the hero load),
  §8 (page structure), §9 (architecture), §11 (copy), §12 (quality floor), §13 (code standards).

Not read: `gsap-scrolltrigger` (the hero load is a mount timeline, not scroll-linked — the Rail's
existing scrub and the Slipstream's existing off-screen pause are untouched), `gsap-utils`,
`gsap-plugins`, `frontend-design` (§3 scopes it to surfaces with no spec; §6 and §8 specify this
one down to the token).

## Existing code inspected

- `app/page.tsx` — composition only, four stub sections each wrapping a `RailStation` in a
  `rail-offset relative` block. The first is the hero stub this prompt deletes.
- `app/globals.css` — six brand tokens, the two-step display scale, four radii, rail geometry
  (`--rail-x`, `--rail-gap`), motion primitives, and the `.slipstream[data-route]` block including
  `mono-signal`, whose accent is `--wash-signal` at 60%.
- `components/motion/slipstream.tsx` — `route` × `density` props; `position: absolute; inset: 0`,
  so **the consumer must supply a positioned, overflow-clipped box**. Already `aria-hidden`,
  already reduced-motion-branched, already pauses off-screen. Not modified by this prompt.
- `components/layout/rail.tsx` — `rail-track` + `rail-paint`, a scrubbed `scaleY` against
  `<main>`, `gsap.matchMedia()` cleanup shape. Gains an entrance element (decision 4).
- `components/layout/rail-station.tsx` — `aria-hidden`, node + Utility label, label dropped below
  640px. Reused as-is.
- `components/layout/announcement-bar.tsx` — the repo's one hover-arrow idiom: `-translate-x-1
  opacity-0` → `group-hover:translate-x-0 group-hover:opacity-100`, mirrored on
  `group-focus-visible`. The hero's primary CTA reuses it verbatim rather than inventing a second.
- `components/layout/site-header.tsx` — the pill-as-link pattern:
  `<Button variant="pill" size="pill" nativeButton={false} render={<a href=… />}>`. Reused exactly.
- `components/ui/button.tsx` — `pill` and `pillSecondary` variants and the `pill` size (`h-11
  gap-2 px-6 text-body`) already exist from prompt 01. **Nothing is added to this file.**
- `components/ask/ask-bar.tsx` — carries `id="ask"` and `tabIndex={-1}` on its shell, so `#ask` is
  a live fragment target that also moves sequential focus. The primary CTA points at it.
- `lib/copy/shell.ts` — the typed-copy-object shape this prompt copies for `lib/copy/hero.ts`.
- `lib/gsap/motion.ts` — `DURATION`, `EASE`, `STAGGER`, `SLIPSTREAM`, `TYPEWRITER`. Gains `HERO`.
- `lib/utils.ts` — `cn()` with the registered `--text-*` scale, `focusRing`, `disabledState`.
- `components/sections/` — **does not exist yet.** §9 reserves it; this prompt creates it.

## Decisions and assumptions

### 1. Approved in conversation, recorded here

- **The slipstream band is full-bleed**, spanning the viewport rather than clipped to the 1200px
  content shell, and sits *below* the CTA row rather than behind the headline. §8's diagram
  (`══════ slipstream ══════`) and §5.1's "spans edge to edge" both point here.
- **The hero's height is content-driven.** No `vh`, `svh`, or `dvh` on the section. Its height is
  its content plus §6.3's `--section-rhythm`. Nothing is deliberately pushed below the fold, and
  there is no mobile-URL-bar resize class of bug to have.

### 2. The hero is a server component; only the motion wrapper is a client component

§9 wants sections that are pure markup to stay server components, but the hero load is a GSAP
timeline, which needs a hook. The docs paragraph quoted above resolves it cleanly:

```
components/sections/hero.tsx          server — markup + copy, no "use client"
  └─ <HeroEntrance>                   client — the timeline, no markup of its own
       └─ {children}                  server output, passed as a prop, never imported
```

`HeroEntrance` renders a single positioned `<div>` and its `children`. Because the hero's markup
arrives as `children` rather than as an import, the copy object, the `RailStation`, and the two
`Button`s are rendered on the server and shipped as RSC payload — only the wrapper's timeline
lands in the client bundle.

The cost: the wrapper holds no refs to content it did not create, so the timeline targets
`[data-hero="…"]` selector strings. `gsap-react` permits exactly this when `scope` is passed, and
the scope is the wrapper's own ref, so nothing outside the hero can be matched.

### 3. Copy is real copy, not a fixture

The hero makes no claim about a customer, a person, or a metric, so §11.1's placeholder policy
applies to none of it and **no `placeholder: true` flag and no `PLACEHOLDER` chip belong here.**
Written fresh under §11 (active voice, specific, sentence case, no "unlock"/"seamless"/"10x"):

- **Headline**, as an explicit two-element tuple: `["A guide that walks people", "through your
  product."]`
- **Subcopy**: "Glidda answers questions on the page a visitor is standing on, runs a live demo of
  your real interface, and gets new users to their first result — in any language, at any hour."
- **Primary CTA**: "Start a guide" → `#ask`. The same label as the header's pill, on purpose: §11
  says the action keeps its name through the whole flow.
- **Secondary CTA**: "See it run" → `#demos`.

The headline is a tuple, not a string, because §7.3 stages "the headline's two lines" separately —
the animation needs two elements. **The tuple is the animation unit, not a promise about visual
line breaks**: below roughly 560px each half wraps to two visual rows and the entrance still
staggers in two groups. That is correct and is not a bug to chase.

### 4. The rail's entrance is a retreating cover, and it lives in `rail.tsx`

§7.3 says the hero load begins with "the rail draws down from the top edge". The obvious
implementation — `scaleY` on `rail-track` — does not work: the track spans all of `<main>`, so
drawing several thousand pixels in 0.7s makes the visible portion flash past in under a frame.

Instead: one `--ground`-coloured element inside the track, `height: 100svh`, `transform-origin:
bottom`, animated `scaleY: 1 → 0`. It retreats downward at exactly one viewport per 0.7s, which
above the fold reads as the line drawing in from the top edge, and it collapses to zero height so
it can never mask the track later. Below the fold nothing is observable at load, so nothing is
spent animating it. Pure transform (§7.1).

**Accepted tradeoff:** this makes the hero load two timelines rather than the literal one §7.3
asks for — the Rail owns the draw, the hero owns everything else. A single timeline would force
`rail.tsx` to know about hero internals or the hero to reach into a layout component, and both are
worse. They read as one moment because both are built from the same `HERO` constants in
`lib/gsap/motion.ts`, and the draw is the only thing running for the first 200ms.

### 5. The Rail needs `z-10`, or the band paints over it

Both `<Rail>` and the hero band are positioned elements inside `<main>`, and the band comes later
in the DOM — so at equal z-index the full-bleed band wins and the rail is severed for the band's
height. §6.4 requires "a single continuous 1px vertical line". Adding `z-10` to the Rail's root
(already `pointer-events-none`) fixes it, and the rail passing *over* the slipstream is the right
reading anyway: the rail is the route, the slipstream is the ground it crosses.

Safe because the rail sits at `--rail-x` and content starts at `--rail-x + --rail-gap` — they
never overlap — and `--z-ask: 50` keeps the Ask bar above it regardless.

### 6. No-JS initial state via `@media (scripting: enabled)`

§12 requires the page be readable with JavaScript disabled. If the entrance's hidden state is
plain CSS, a no-JS visitor gets an invisible hero. If it is applied by GSAP instead, the finished
hero paints first and then jumps, because hydration runs after the first paint.

`@media (scripting: enabled)` resolves both: the hidden state applies only where a script can
undo it. With JS off, `scripting: none`, the rule never matches, and the hero renders fully
visible and unanimated. The timeline uses `fromTo`, not `from` — with CSS already at `opacity: 0`,
a `from` tween would animate 0 → 0 and the hero would never appear.

**Accepted risk, stated rather than hidden:** if JS is enabled but the GSAP bundle fails to load,
the hero stays hidden. The mitigation is that in a browser that does not support the `scripting`
media feature the rule is simply dropped and the old paint-then-animate behaviour returns, which
is a graceful direction to fail in. Not adding a timeout fallback — it is machinery for a case
where the page's own JavaScript is already broken.

### 7. The primary CTA's glyph does not animate on its own

§5.1 notes "a small animated glyph" on the reference's primary pill. §7.3 allows three
orchestrated moments and "everything else is a 0.2s hover", and a perpetually animating glyph
would be a fourth ambient loop bought for nothing. The pill gets a trailing `ArrowRight` that
slides in on hover and focus — the announcement bar's exact idiom, so the repo has one.

## Files likely to change

| File | Change |
| --- | --- |
| `lib/copy/hero.ts` | **new** — typed hero copy object |
| `components/sections/hero.tsx` | **new** — server component, the hero's markup |
| `components/sections/hero-entrance.tsx` | **new** — client, the hero-load timeline |
| `components/layout/rail.tsx` | edit — `z-10`, the entrance cover, its tween and reduced branch |
| `lib/gsap/motion.ts` | edit — add `HERO` |
| `app/globals.css` | edit — `--hero-band-h`, `--hero-gap`, `hero-band` and `rail-lead` utilities, the `scripting: enabled` block |
| `app/page.tsx` | edit — stub replaced by `<Hero />`; stale TODO numbers on the other three corrected |

No new dependency. `components/ui/button.tsx` is not touched. `components/motion/slipstream.tsx`
is not touched.

## Implementation requirements

### `lib/copy/hero.ts`

One exported `hero` object, typed, matching `lib/copy/shell.ts`'s shape and comment density.
`headline` is `readonly [string, string]`. `ctas` is a `{ primary: NavLink; secondary: NavLink }`
reusing the `NavLink` type imported from `shell.ts` rather than redeclaring it. A file comment
states that none of this is fabricated proof, so §11.1 does not apply.

### `components/sections/hero.tsx`

Server component. No `"use client"`.

```
<section id="hero" className="section-rhythm anchor-offset flex flex-col gap-(--hero-gap)">
  <HeroEntrance>
    <div className="rail-offset relative">
      <RailStation label="Start" />
      <h1  data-hero="line"  …>   line 1 </h1>   ← see note
      …
    </div>
    <div data-hero="band" className="hero-band relative overflow-hidden">
      <Slipstream route="mono-signal" density="band" />
    </div>
  </HeroEntrance>
</section>
```

Note on the `h1`: there is exactly **one** `h1` (§12). The two staged lines are two
`<span data-hero="line" className="block">` elements *inside* it, not two headings.

The vertical gap between the copy block and the band is the section's flex `gap`, never a margin
on a child (§13). `--hero-gap` is a token, not a literal.

CTAs, both pills, both links, following `site-header.tsx` exactly:

```tsx
<Button variant="pill" size="pill" nativeButton={false} render={<a href={hero.ctas.primary.href} />} className="group">
  {hero.ctas.primary.label}
  <ArrowRight aria-hidden className="…announcement-bar's transition classes…" />
</Button>
<Button variant="pillSecondary" size="pill" nativeButton={false} render={<a href={hero.ctas.secondary.href} />}>
  {hero.ctas.secondary.label}
</Button>
```

The CTA row wraps below 400px (`flex flex-wrap gap-3`) so two pills never force horizontal scroll.

### `components/sections/hero-entrance.tsx`

`"use client"`. Props: `{ children: React.ReactNode }`. Renders one `<div ref={rootRef}
className="contents">`— no, use a plain `<div className="flex flex-col gap-(--hero-gap)">`;
`display: contents` would break the flex gap and is a known accessibility-tree hazard. Move the
flex to the wrapper and leave the `<section>` with only `section-rhythm anchor-offset`.

One `useGSAP` with `{ scope: rootRef }`, one `gsap.matchMedia()` with `motion` / `reduced`
conditions, `return () => mm.revert()`.

Both branches build **one** timeline with
`defaults: { duration: DURATION.entrance, ease: EASE.entrance }` and use `fromTo` throughout.
`reduced` differs only in dropping every `y` (§7.2: "entrances become plain opacity fades"); the
timing is unchanged, so the two branches are one timeline definition with a `y` value that is
`HERO.rise` or `0`. Do not write the timeline twice.

### `components/layout/rail.tsx`

Add `z-10` to the root. Add `<div ref={leadRef} className="rail-lead" />` inside `rail-track`,
before `rail-paint`. In the existing `matchMedia`: the `reduced` branch adds
`gsap.set(lead, { scaleY: 0 })` alongside its current `scaleY: 1` paint set; the `motion` branch
adds `gsap.to(lead, { scaleY: 0, duration: HERO.railDraw, ease: EASE.entrance })`. The scrubbed
paint tween is unchanged.

### `lib/gsap/motion.ts`

```ts
/** The hero load (§7.3 #1). One budget, in seconds, shared by the hero's timeline and the
 *  Rail's entrance so the two read as one moment. Total 1.10s, inside §7.3's 1.2s. */
export const HERO = {
  railDraw: 0.7,   // one viewport of cover retreating, from t=0
  lines: 0.2,      // first headline line starts here; the second at +STAGGER
  sub: 0.38,
  ctas: 0.44,
  band: 0.5,       // + DURATION.entrance = 1.10s
  rise: 24,        // px, the entrance's y offset
} as const
```

Every one of these is referenced by name. No duration literal appears in a component (§13).

### `app/globals.css`

- `:root` gains `--hero-band-h: clamp(140px, 18vw, 240px)` and `--hero-gap: clamp(56px, 7vw, 96px)`.
- `@utility hero-band` — `width: 100%; height: var(--hero-band-h);`. It needs no full-bleed trick:
  the section is already viewport-wide, and `w-screen` would introduce horizontal overflow equal
  to the scrollbar width, which §12 forbids outright.
- `@utility rail-lead` — `position: absolute; inset-inline: 0; top: 0; height: 100svh;
  background: var(--ground); transform-origin: bottom; transform: scaleY(0);` — **`0`**, so a
  no-JS visitor sees the full rail immediately.
- One `@media (scripting: enabled)` block, in `@layer base`, setting `[data-hero]{opacity:0}` and
  `.rail-lead{transform:scaleY(1)}`. Commented with the reasoning from decision 6.

### `app/page.tsx`

Delete the hero stub, import and render `<Hero />`, leave the other three sections. Correct their
now-stale `TODO(prompt 05+)` / `TODO(prompt 06+)` comments. Composition only — no layout maths, no
copy, no animation enters this file (§9).

## Visual spec

**Layout.** Everything left-aligned against the rail — no centring anywhere in the hero. This is
the deliberate divergence from the reference recorded in §8's mapping table. The copy block is
`rail-offset` (`padding-left: calc(var(--rail-x) + var(--rail-gap))`), so the headline hangs off
the line rather than sitting near it (§6.4).

| | 360px | 768px | 1440px |
| --- | --- | --- | --- |
| Rail x | 4px | `--gutter` | `--gutter` (24px) |
| Rail gap | 24px | ~31px | 56px |
| `--text-hero` | 40px | ~53px | 76px |
| Band height | 140px | ~140px | 240px |
| Hero gap | 56px | ~56px | 96px |
| Station label | hidden | shown | shown |

**Type.** `h1` at `--text-hero`, Display face, weight 300, `letter-spacing: -0.01em`,
`line-height: 1.02` — all four already inherited from the `@layer base` `h1` rule, so the element
carries `text-hero` and nothing else. Subcopy at `--text-body` in `--rail-muted`, capped at
`max-w-[52ch]` so the measure does not run to 1200px at desktop. Buttons at `--text-body` via the
`pill` size.

**Colour.** `--ground` page, `--ink` headline, `--rail-muted` subcopy, `--ink` primary pill with
`--paper` label, `--surface` secondary pill with a hairline. The band is the only colour on the
screen and it arrives through `mono-signal`'s single 60%-diluted `--wash-signal` layer. No
coloured button, link, rule, icon, or focus ring anywhere (§6).

**Spacing.** Section `padding-block: var(--section-rhythm)`. Within the copy block: headline →
subcopy `mt-6`, subcopy → CTA row `mt-10`. Copy block → band is the wrapper's `--hero-gap`.

**States.** Primary pill: `hover:bg-ink/90` (already in the variant) plus the arrow sliding from
`-translate-x-1 opacity-0` to `translate-x-0 opacity-100`, 200ms, `--ease-entrance`, mirrored on
`group-focus-visible`. Secondary pill: `hover:bg-rail-subtle`. Both carry `focusRing` from the
variant — a 2px `--ink` ring on a `--ground` offset, never removed (§12).

## Motion spec

One moment (§7.3 #1). Everything else here is a 200ms CSS hover.

| t (s) | Target | From → To | Duration | Ease |
| --- | --- | --- | --- | --- |
| 0.00 | `.rail-lead` | `scaleY 1 → 0` | 0.70 | `power2.out` |
| 0.20 | `[data-hero="line"]` #1 | `opacity 0→1`, `y 24→0` | 0.60 | `power2.out` |
| 0.26 | `[data-hero="line"]` #2 | same (`stagger: 0.06`) | 0.60 | `power2.out` |
| 0.38 | `[data-hero="sub"]` | `opacity 0→1`, `y 24→0` | 0.60 | `power2.out` |
| 0.44 | `[data-hero="ctas"]` | `opacity 0→1`, `y 24→0` | 0.60 | `power2.out` |
| 0.50 | `[data-hero="band"]` | `opacity 0→1` | 0.60 | `power2.out` |

Ends at **1.10s** (§7.3's budget is 1.2s). Four staggered items, well inside §7.1's limit of six.
Transform and opacity only. Nothing here is scroll-linked.

The band fades up; it does not rise. The slipstream's own drift is started by `Slipstream` on
mount and is not sequenced from here — "begins its loop" in §7.3 is satisfied by the loop becoming
visible as the band fades, and reaching across a component boundary to gate it would buy nothing.

**Reduced motion** (§7.2). Same timeline, same durations, `y` dropped to `0` — plain opacity
fades. `.rail-lead` is set to `scaleY(0)` with no tween, so the rail is simply present; the
existing paint branch already snaps to `scaleY(1)`. The slipstream is already static in its own
reduced branch and is not re-handled here.

## Accessibility requirements

- Exactly one `h1` on the page, and it is this one. The two animated spans are `<span>`s inside
  it, so the accessible name is the full sentence.
- The band and the slipstream inside it are decorative: `data-hero="band"` carries no text, and
  `Slipstream` is already `aria-hidden` (§12).
- `RailStation` stays `aria-hidden` — its label repeats the section and would double-announce.
- Both CTAs are real `<a href>` elements, reachable by Tab, with the variant's visible focus ring.
  The arrow glyph is `aria-hidden`; the label carries the meaning.
- `#ask` and `#demos` are both live targets in the current DOM. Following the primary CTA moves
  sequential focus to the Ask bar shell (`tabIndex={-1}`), so the next Tab lands in the field.
- The hero is fully readable and both CTAs are followable with JavaScript disabled (decision 6).
- No text on the slipstream. Contrast is `--ink` on `--ground` (17.4:1) and `--rail-muted` on
  `--ground` (6.13:1).

## Acceptance criteria

1. `app/page.tsx` renders `<Hero />` plus the three remaining stubs, and contains no copy, no
   layout maths, and no animation.
2. `components/sections/hero.tsx` has no `"use client"`, and the hero's copy and markup are absent
   from the client bundle.
3. All hero copy comes from `lib/copy/hero.ts`. No string is inline in JSX.
4. Exactly one `h1` in the rendered document.
5. The headline's left edge sits at `--rail-x + --rail-gap` at every breakpoint, matching the
   three stub sections below it — the hero hangs off the rail, it is not centred.
6. The slipstream band spans the full viewport width at 360, 768, 1024, and 1440px, and the page
   has no horizontal scrollbar at any of them.
7. The rail is unbroken through the band — visible over it, not behind it.
8. The hero load completes in ≤1.2s and matches the motion-spec table.
9. Under `prefers-reduced-motion: reduce`, nothing translates, the rail is present immediately,
   the slipstream is static, and every element ends fully visible.
10. With JavaScript disabled the hero renders complete and unanimated; nothing is stuck invisible.
11. Keyboard: Tab reaches both CTAs with a visible ring; the primary lands focus on the Ask bar.
12. No duration, offset, or geometry literal appears in a component — all via `HERO` or a CSS
    token.
13. No `placeholder: true` and no `PLACEHOLDER` chip is introduced (decision 3).
14. `components/ui/button.tsx` and `components/motion/slipstream.tsx` are unmodified.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

`build` is included: `app/page.tsx` changes and a new server/client boundary is introduced, so §14
requires it. Paste the real output of all three, including any warnings.

Then, and reported honestly rather than assumed:

```bash
grep -rn "placeholder: true" lib/copy/   # must stay empty — the hero adds no fixtures
grep -rn "use client" components/sections/   # must match hero-entrance.tsx only
```

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **Hero load.** Hard-reload. Confirm the rail draws down from the top edge, then the two
   headline lines, subcopy, CTA row, and band arrive in that order and the whole thing settles in
   about a second. Reload two or three times — the sequence must be identical every time.
2. **360px.** DevTools at 360×640. Confirm no horizontal scrollbar, the band still reaches both
   edges, the CTA row wraps rather than overflowing, the station label is hidden and its node is
   not, and the headline is legible at 40px.
3. **768px and 1024px.** Confirm the station label has appeared, the subcopy measure is capped
   (roughly 52 characters, not the full width), and the gap between the CTA row and the band does
   not read as a hole.
4. **1440px.** Confirm the headline is at 76px, that the 300-weight serif holds its thin strokes,
   and — the real question this prompt exists to answer — that the `mono-signal` band keeps the
   hero from reading as bare paper without pre-empting the Answers panel. Say plainly if it does
   not; that is a §6.1 decision to revisit, not something to fix by nudging the opacity.
5. **The rail through the band.** Look at where the rail crosses the slipstream. The line must be
   continuous and on top.
6. **Reduced motion.** Enable it at the OS level (GNOME:
   `gsettings set org.gnome.desktop.interface enable-animations false`), hard-reload, and confirm
   nothing slides, the rail is immediately present, the slipstream is frozen, and the hero is
   fully visible. Then turn it back on.
7. **No JavaScript.** DevTools → Command palette → "Disable JavaScript" → hard-reload. The hero
   must be complete and readable, both CTAs followable. Re-enable.
8. **Keyboard.** From the address bar, Tab through: skip link → announcement bar → wordmark → nav
   → header pill → hero primary → hero secondary. Each must show a ring. Press Enter on the hero
   primary and confirm the next Tab lands in the Ask bar's field.
