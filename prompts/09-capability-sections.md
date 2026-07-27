# 09 — The three capability sections

## Goal

Build §8 row 8 end to end: **Answers**, **Demos**, and **Onboarding** — three alternating two-column
rows, each with an auto-advancing three-row accordion in the text column and a hue-washed slipstream
panel carrying a looping vignette in the other. This lands §7.3's third orchestrated moment and the
last of §6.4's rail behaviours (panels carried along the line).

This is the page's centrepiece and the only place a route hue is painted at full strength. After it,
`/` reads hero → customers → proof → live demo → intro → three capabilities → FAQ stub.

Out of scope, explicitly: the Route section, the generator, the carousel, the real FAQ, the closing
CTA, and the Ask bar. No backend, no post-submit anything.

## Skills and docs read

- `AGENTS.md` §5.1 row 8 and the vignette scene descriptions, §5.2 (accordion takes over from the
  timer on hover; the panel loop does **not** reset when the row changes; nothing pins), §5.3 (what
  we may not carry across), §6.1 (route hues and washes), §6.2 (two display steps), §6.3 (radii,
  hairlines, the slipstream), §6.4 (panels translate along the rail), §7.1–7.3 (motion budget,
  reduced motion, the three moments), §9–§13.
- `.agents/skills/gsap-react` — `useGSAP` scoped to a ref, `contextSafe` for handlers created after
  the hook runs, automatic revert. Every animation here obeys it.
- `.agents/skills/gsap-timeline` — position parameter and labels for the vignette scene loops;
  `defaults` on the constructor; **ScrollTrigger belongs on the top-level timeline, never on a
  nested child**, which shapes decision 6.
- `.agents/skills/shadcn/rules/base-vs-radix.md` — `render` not `asChild`, `nativeButton={false}`
  for non-button triggers. `components/ui/accordion.tsx` is `@base-ui/react/accordion`.

Deliberately **not** read, and why:

- `node_modules/next/dist/docs/` — no route, config, font, image, or metadata surface is touched.
  Three new section files and their client children, composed into the existing `/`.
- `.agents/skills/gsap-plugins` — ScrollTrigger is already registered in `lib/gsap/register.ts` and
  no other plugin is needed. Nothing here scrubs a path, splits text, or pins.

## Existing code inspected

- `components/sections/live-demo.tsx` — the closest existing shape: a server section wrapping
  `rail-offset` → `RailStation` → a `relative overflow-hidden rounded-panel` box that supplies the
  clip and radius `Slipstream` needs. The capability panels are the same construction at 1:1.
- `components/motion/slipstream.tsx` — already accepts `route="signal" | "cable" | "spruce"` and
  `density="panel"`. **The panel density exists and is unused; this prompt is its first consumer.**
  It already pauses itself off-screen via `ScrollTrigger` and already carries its reduced-motion
  branch, so the panels inherit both for free.
- `lib/gsap/register.ts` — the single `registerPlugin` site. `lib/gsap/motion.ts` — `DURATION`,
  `EASE`, `STAGGER`, `SLIPSTREAM`, `HERO`, `TYPEWRITER`. This prompt adds one `CAPABILITY` block
  there rather than writing a duration literal in a component (§13).
- `components/ui/accordion.tsx` — Base UI. `AccordionContent` currently hardcodes
  `data-open:animate-accordion-down` and a `h-(--accordion-panel-height)` box; that is a height
  animation, which §7.1 forbids. See decision 2.
- `lib/utils.ts` — `cn()` with the type scale registered, plus `focusRing`. `text-panel` is already
  in the font-size group, so no edit is needed here.
- `app/globals.css` — `--wash-signal/cable/spruce`, `--radius-panel`, `--radius-card`,
  `--radius-chip`, `hairline`, `hairline-b`, `rail-offset`, `section-rhythm`, `anchor-offset`,
  `type-display`, `type-utility`, `--duration-micro`, `--ease-entrance`.
- `app/page.tsx` — the `#answers` and `#demos` stubs are deleted by this prompt. The `#faq` stub
  stays until its own prompt.
- `lib/copy/live-demo.ts`, `lib/copy/section-intro.ts` — the copy-module pattern to match: one
  typed export, an explicit annotation, a header comment stating whether §11.1 applies, phrased so
  §14's pre-deploy grep cannot match the comment itself.

## Decisions and assumptions

### 1. One shared `CapabilitySection`, three thin section files

The three rows differ only in hue, side, and copy. One parameterised component, three files
(`answers.tsx`, `demos.tsx`, `onboarding.tsx`) that each render it with their own data — so §9's
"one file per section in section 8" holds and `app/page.tsx` still reads as a list of sections,
while the layout exists once. Three near-identical 180-line files would be the wrong answer.

### 2. The accordion does not animate its height, and `components/ui/accordion.tsx` is not modified

§7.1 forbids animating `height`, and Base UI's `AccordionContent` ships a height keyframe. Rather
than edit the shared primitive — three other sections will want it as-is — this section composes
`AccordionPrimitive.Root` and `Item` for state and ARIA and renders its own row body.

What makes that honest rather than a dodge: **exactly one row is open at a time and every body is
written to two lines**, so the accordion's total height is constant and the swap is a pure
crossfade. Nothing needs to expand because nothing collapses to zero — the closed rows are labels,
the open row's body occupies a slot that is always occupied. Opacity and a 4px `y`, 0.2s. No layout
animation exists to forbid.

Below ~480px a two-line body may wrap to three, so the slot height can differ by row at that width.
That is a static layout difference, not an animation, and §7.1 is a rule about what we animate.

### 3. The progress underline is `scaleX` on a `transform-origin: left` element

§7.1's one stated exception, used exactly as written — never `width`. The underline is the timer:
the tween's duration *is* the dwell time, so there is no second source of truth and no `setTimeout`
racing a tween. `onComplete` advances to the next row.

### 4. Hover takes over from the timer; leaving resumes

Per §5.2: hovering a closed row opens it immediately and the timer restarts on that row. Pointer
entering the accordion pauses the sweep; leaving resumes it from wherever it was. Click and keyboard
focus select a row the same way hover does — a row is a real `<button>` in the tab order, and
focusing it must not leave the user racing an auto-advance they cannot see.

Handlers created after `useGSAP` runs are wrapped in `contextSafe` so they are reverted with the
rest (gsap-react skill, "Context-Safe Callbacks").

### 5. The vignette loop is independent of the accordion, per §5.2

Two separate timelines, deliberately unsynchronised. §5.2 observed the reference's panel loop not
resetting when the accordion row changes, and that is the better behaviour: the panel reads as the
product running continuously rather than as an illustration of the sentence currently open. Do not
wire the accordion's row index into the vignette.

### 6. One ScrollTrigger per panel, on the top-level vignette timeline only

The gsap-timeline skill is explicit that ScrollTrigger belongs on a top-level tween or timeline and
never on a nested child. Each vignette builds one master timeline containing its scenes as nested
children, and one `ScrollTrigger` toggles that master. `Slipstream` keeps its own separate trigger —
it already has one and it is a sibling, not a child.

Both must handle mounting off-screen, the way `slipstream.tsx` already does: `onToggle` only fires
on a change, so an instance below the fold has to be paused explicitly after creation.

### 7. The vignette's chat input is decorative and non-interactive

§5.1 notes the reference's mock has a genuinely typeable "Chat with me…" field. Ours does not, for
two reasons: §8.1 makes the Ask bar the page's one input and the conversion device, and a second
live field competing with it is a real conversion problem, not a stylistic one; and a functioning
input would immediately raise §15's undesigned post-submit question inside a decorative panel.

So the field is a styled `<div>`, not an `<input>` — not a disabled input, which would still be a
control announcing itself as one. The whole panel is `aria-hidden` (§12) and adds nothing to the tab
order.

### 8. The panels translate along the rail — scrubbed, small, transform-only

§6.4 requires it: "feature panels translate a short distance along the rail as their section
passes, so they read as carried by it." A scrubbed `y` of ±`CAPABILITY.drift` (32px) across the
section's scroll range. Small enough to read as carriage rather than as parallax decoration, and it
must never open a visible gap at the panel's edge — the box is clipped, the slipstream fills it, and
only the panel's own transform moves.

### 9. Vignette content is flagged fixture data, and every panel carries a chip

**Decided by the user, 2026-07-27, against my initial reading — recorded here because the reasoning
that lost is the reasoning someone will re-derive later.**

The visitor-info scene shows a mock CRM record: a company, a headcount, a goal. I argued §11.1
governs "fabricated proof: customers, quotes, people, and metrics", and that a company name inside
an `aria-hidden` drawing of a UI is furniture rather than a claim — so the strings could live
unflagged in `lib/copy/capabilities.ts` with no chip.

The strict reading wins, and it is the right call: a reader does not experience the panel as
`aria-hidden` decoration. They see an invented company name rendered inside what looks like a
product screenshot on a marketing page, which is precisely "invented name shown as if real" — the
failure mode §11.1 exists to prevent. The `aria-hidden` attribute is an accessibility decision about
the *tree*; it is not a disclaimer, and it is invisible to the sighted reader who is most likely to
be misled.

So:

- **Vignette fixtures live in `lib/copy/placeholder/vignette.ts`**, one object per capability, each
  carrying `placeholder: true` and typed against the existing `Placeholder` base in `types.ts`.
  Nothing fabricated is written inline in a vignette part.
- **Company names come from `lib/copy/placeholder/companies.ts`**, not a fresh invented set, so the
  page still has exactly one list of invented companies and one place to swap it.
- **One `PLACEHOLDER` chip renders per panel**, outside the rounded box and beneath it, using the
  existing `components/layout/placeholder-chip.tsx` unchanged. It is not `aria-hidden`, so it is
  announced — the panel's contents are hidden from the accessibility tree but the marker saying
  those contents are fabricated is not.
- Figures inside the vignette follow §11.2 regardless: round and obviously notional. No "37%".

The cost accepted: three more chips on the page, on blocks that are decorative rather than
evidential. The counter-argument I raised — that chipping decoration devalues the chips on the logo
and proof bands — is noted and overruled. If the page ends up looking chip-spotted at review, the
fix is a §11.1 conversation about chip *placement*, not about dropping the flag.

The other live consequence: §14's pre-deploy grep now covers this data too, so the vignettes are
listed alongside the logo band and proof band in every deploy report until real content replaces
them. That is the behaviour the strict reading buys and it is worth the chips.

### 10. Rejected alternatives

- **Pinning the panel while the accordion advances.** §5.2 is explicit that the reference does not
  pin and nothing scroll-jacks. Neither do we.
- **Editing `components/ui/accordion.tsx` to add a flat variant.** §10 prefers a `cva` variant in
  the primitive's own file, but the change needed here is removing an animation the primitive is
  built around, not adding a visual variant. Composing `Root`/`Item` directly is smaller and leaves
  the primitive intact for the FAQ, which wants multi-open and can use it as shipped.
- **A fourth ambient loop for the accordion rows.** The underline sweep *is* the accordion's motion.
  No hover shimmer, no icon spin.

## Files likely to change

| File | Change |
| --- | --- |
| `lib/copy/capabilities.ts` | new — three capabilities: eyebrow, headline, three rows (real copy, §11) |
| `lib/copy/placeholder/vignette.ts` | new — three flagged vignette fixtures (decision 9) |
| `lib/gsap/motion.ts` | edit — add the `CAPABILITY` constants block |
| `components/sections/capability-section.tsx` | new — the shared two-column row (server) |
| `components/sections/capability-accordion.tsx` | new — client; Base UI Root/Item, timer, underline |
| `components/sections/answers.tsx` | new — signal, panel right |
| `components/sections/demos.tsx` | new — cable, panel left |
| `components/sections/onboarding.tsx` | new — spruce, panel right |
| `components/motion/vignette.tsx` | new — client; the scene loop shell and its ScrollTrigger |
| `components/motion/vignette-parts.tsx` | new — bubble, chip, field, cursor, card primitives |
| `app/globals.css` | edit — panel aspect + vignette surface utilities only |
| `app/page.tsx` | edit — three sections replace the `#answers` and `#demos` stubs |

Explicitly not modified: `components/ui/accordion.tsx` (decision 2), `lib/utils.ts` (no new
`--text-*` token), `components/motion/slipstream.tsx`, `lib/gsap/register.ts`,
`components/layout/placeholder-chip.tsx` (used as shipped), and the existing
`lib/copy/placeholder/{types,companies,proof}.ts` — decision 9 adds a file to that directory and
changes nothing already in it.

## Implementation requirements

### `lib/copy/capabilities.ts`

One typed export, `capabilities`, keyed `answers | demos | onboarding`. Per capability:

```ts
{
  id: "answers"
  station: string          // rail station label, Utility face
  eyebrow: string          // the pill chip
  headline: string         // two lines at --text-headline
  rows: readonly [Row, Row, Row]   // exactly three (§5.1)
}
```

No vignette strings here — decision 9 moves them to `lib/copy/placeholder/vignette.ts`. This file
carries the same header comment as `live-demo.ts` stating that §11.1 applies to none of *its*
contents, and phrased so §14's grep cannot match the comment.

`Row` is `{ label: string; body: string }` — `body` written to land on two lines at the column's
measure. Exactly three rows, typed as a fixed tuple so a fourth is a compile error and the
underline's timer arithmetic cannot silently drift.

Copy here is ours under §11 — active voice, specific, sentence case, no "seamless" — and none of it
is a claim about a customer, a person, or a metric. The three row subjects follow §5.1's structure
without its sentences:

- **Answers** — answers in context / knows what it does not know / carries the thread
- **Demos** — drives the real interface / adapts to what they ask / hands off when they are ready
- **Onboarding** — knows the product / walks them through it / follows up on what stalled

### `lib/copy/placeholder/vignette.ts`

Three fixtures — `answers`, `demos`, `onboarding` — each `Placeholder & VignetteCopy`, importing
the `Placeholder` base from `./types` and its company name from `./companies` rather than restating
it. `VignetteCopy` holds every string a scene renders: bubble text, choice labels, the visitor-info
field list, the caption chip, the status chip, the agent name and question, and the decorative
field's placeholder.

Every figure in it is round and notional per §11.2 — a headcount, a plan tier, a goal. No percentage,
no currency amount that looks researched, no date.

The file gets the standard §11.1 header comment. Its three objects take `grep -rn "placeholder:
true" lib/copy/` from eleven hits to fourteen, which is criterion 12.

### `lib/gsap/motion.ts`

Append one block, documented like the others:

```ts
export const CAPABILITY = {
  /** Accordion dwell per row, seconds. The underline's tween duration is the timer (§7.1). */
  dwell: 5,
  /** Row-body crossfade. */
  swap: DURATION.micro,
  /** px of scrubbed carriage along the rail (§6.4). */
  drift: 32,
  /** One full vignette scene cycle, seconds. Inside §7.1's 8–20s ambient window, and
   *  deliberately coprime with SLIPSTREAM.durations so panel and texture never lock. */
  vignette: 13,
} as const
```

No duration literal appears in any component in this prompt.

### `components/sections/capability-section.tsx`

Server component. Props: `capability`, `route: SlipstreamRoute`, `side: "left" | "right"`.

Shape, matching `live-demo.tsx` exactly:

```
<section id={id} className="section-rhythm anchor-offset">
  <div className="rail-offset relative">
    <RailStation label={station} />
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      text column   — eyebrow chip, h2, CapabilityAccordion
      panel column  — Vignette (client) inside the clipped rounded box,
                      then <PlaceholderChip /> beneath it (decision 9)
```

The chip is a sibling of the panel box, not a child — it must not sit inside the `aria-hidden`
subtree or it stops being announced, which is the whole point of rendering it.

DOM order is always text then panel, so the reading and tab order are identical in all three
sections and on every width. `side` flips only the `lg:` column order — `lg:order-first` on the
panel for Demos. **Do not reorder the DOM to move the panel.**

### `components/sections/capability-accordion.tsx`

`"use client"`. Composes `AccordionPrimitive.Root` (controlled `value`, `openMultiple={false}`) and
`AccordionPrimitive.Item`; the trigger is a real `<button>` spanning the row with `focusRing` from
`lib/utils.ts`.

- One `useGSAP` scoped to the root ref, one `gsap.matchMedia()` with `motion` / `reduced` branches.
- Motion branch: `gsap.to(underline, { scaleX: 1, duration: CAPABILITY.dwell, ease: EASE.linear,
  onComplete: advance })`, restarting on the new row each time the value changes.
- Reduced branch: §7.2 — the accordion still auto-advances, with no sweep. The underline renders at
  full `scaleX` on the open row and the advance is a `gsap.delayedCall(CAPABILITY.dwell, advance)`.
- Off-screen: one `ScrollTrigger` pauses the timer when the section leaves the viewport, including
  the mounted-off-screen case.
- `contextSafe` wraps the pointer and focus handlers (decision 4).

### `components/motion/vignette.tsx` and `vignette-parts.tsx`

`"use client"`, `aria-hidden`, absolutely positioned above the slipstream inside the panel box. All
strings come from `lib/copy/placeholder/vignette.ts` — no fabricated string is written inline in a
part or a scene (§11.1).

Two scenes per capability, crossfading on one master timeline (`repeat: -1`), scenes as nested
child timelines added with the position parameter. Transform and opacity only.

| Capability | Scene A | Scene B |
| --- | --- | --- |
| Answers | chat — three alternating bubbles staggering in, then a two-option choice row | visitor info — a header chip and four small pills staggering in |
| Demos | product tour — wireframe sidebar and card grid, one card outlined, a cursor arrow, a caption chip | chat — two bubbles and the decorative field |
| Onboarding | agent card — name, question, answer, a `scaleX` progress bar | product tour, spruce variant |

`vignette-parts.tsx` holds the shared pieces: `Bubble` (side prop), `Chip` (with an optional
spinner), `Field` (the decorative `<div>` of decision 7), `Cursor`, `WireCard`. Every part uses
`--paper`, `--surface`, `--ink`, `--rail`, and the four radii — the hue comes entirely from the
slipstream behind them, never from a part.

Stagger `STAGGER`, max six items (§7.1). Never more than six pills or bubbles in a scene.

### `app/globals.css`

Two additions only, both because they cannot be expressed as a utility in markup without repeating
a magic number in three files:

- a panel utility fixing the ~1:1 aspect with a sensible `min-height` floor at narrow widths,
- a vignette surface utility for the frosted `--paper` panel the parts sit on.

No new colour, no new `--text-*` token, no new radius.

## Visual spec

**Row.** Two equal columns from 1024px, `gap-16`; single column below, text then panel, `gap-12`.
Section spacing lives on the `<section>` only; no child sets an outer margin (§13).

**Text column.**

| Element | Face | Size | Colour | Notes |
| --- | --- | --- | --- | --- |
| Eyebrow chip | Utility | `--text-eyebrow` | `--rail-muted` | `--surface` fill, `--radius-chip`, small symmetric padding |
| Headline | Display | `--text-headline` | `--ink` | `max-w-[16ch]`, hangs off the rail |
| Row label | Body 500 | `--text-body` | `--ink` open, `--rail-muted` closed |  |
| Row body | Body | `--text-body` | `--rail-muted` | `max-w-[46ch]`, two lines |
| Underline | — | 2px | `--ink` | `scaleX`, `transform-origin: left`, on the open row only |

A large deliberate gap between the headline and the first row — `clamp(48px, 6vw, 80px)`, per
§5.1's "large deliberate gap". `hairline-b` under every row. Rows are `--station-lead`-scale tall so
the column's rhythm agrees with the rail's.

**Panel.** `--radius-panel`, `overflow-hidden`, `hairline`, aspect ~1:1 capped at 560px, fill
`--ground` — the same reasoning as `live-demo.tsx`: the streaks *are* the wash, so a washed fill
would render an invisible texture. `Slipstream route={route} density="panel"`.

Vignette parts float above it on `--paper` with `--radius-card`, one hairline, no shadow — §6.3
allows exactly one shadow on the page and the Ask bar has it.

The `PLACEHOLDER` chip sits 16px below the panel box, left-aligned to the box's left edge, styled
entirely by the existing component — no override, no `className` beyond the margin. Reserving that
space is a static layout decision, so nothing reflows when the markers are switched off.

**Hue per section.** Answers `signal`, Demos `cable`, Onboarding `spruce`. Never two at once, never
on text, never on the rail (§6.1).

**Responsive.** 360 — one column, panel below text, panel floors at 320px tall, chip row wraps.
768 — still stacked, panel wider. 1024 — two columns, alternation begins. 1440 — 1200px shell,
panel capped at 560px so it never outgrows the text column.

**States.** Row hover: label goes to `--ink`, no underline, no translate. Focus: `focusRing`,
never removed. Panel: no hover state at all — it is decoration.

## Motion spec

| What | Trigger | Duration | Ease | Reduced motion (§7.2) |
| --- | --- | --- | --- | --- |
| Underline sweep | row opens | `CAPABILITY.dwell` | `EASE.linear` | no sweep; underline at full, `delayedCall` advances |
| Row body swap | value change | `CAPABILITY.swap` | `EASE.entrance` | plain opacity, no `y` |
| Row label colour | hover/focus | `--duration-micro` | `--ease-entrance` | unchanged — a colour change is not motion |
| Vignette scenes | ambient loop | `CAPABILITY.vignette` | `EASE.loop` | timeline never created; scene A renders statically |
| Panel carriage | scrub | — | `EASE.linear` | no trigger; panel sits at rest |
| Slipstream | already built | — | — | already handled in that component |

Everything is transform and opacity. The underline's `scaleX` is §7.1's one stated exception and is
used for exactly that. All three timers pause when their section is off-screen.

This is §7.3's third moment and it is fully spent here. No entrance tween on the section itself — if
review wants one, it is a stated addition in a later prompt.

## Accessibility requirements

- Each section is `<section>` with one `<h2>`; order stays h1 → h2 × n. The eyebrow is a `<p>`, not
  a heading — promoting it would put an h3 above its own h2.
- Accordion rows are real `<button>`s inside `AccordionPrimitive.Item`; Base UI supplies
  `aria-expanded` and the panel association. Tab reaches every row; `Enter`/`Space` opens it;
  arrow-key roving comes from the primitive.
- Auto-advance must not move focus. It changes the open row only; the focused element stays focused.
- The panel box itself, slipstream and vignette, is `aria-hidden` — it conveys nothing a
  screen-reader user needs, and its mock text would be noise. The `PLACEHOLDER` chip beneath it is
  **outside** that subtree and **is** announced (decision 9): the fabricated content is hidden, the
  fact that it is fabricated is not.
- The decorative field is a `<div>`, never an `<input>` or a disabled control (decision 7).
- Contrast: closed row labels and all bodies are `--rail-muted` (6.13:1 on `--ground`). `--rail` and
  the three route hues carry no text anywhere in these sections.
- With JavaScript disabled the first row of each accordion is open and readable, the panels render
  their static slipstream, and no control is broken — nothing is behind a click that JS must handle.
- No horizontal page scroll at any width; the panel is capped, not full-bleed.

## Acceptance criteria

1. All three sections render at 360, 768, 1024, and 1440px with no horizontal page scroll.
2. Panels alternate at ≥1024px — right, left, right — and DOM order is text-then-panel everywhere.
3. Exactly one accordion row is open per section at all times; the total column height does not jump
   when the row changes at ≥480px.
4. The underline sweeps left to right over `CAPABILITY.dwell` and the row advances on its completion,
   wrapping 3 → 1.
5. Hovering a closed row opens it immediately and restarts the timer there; leaving resumes.
6. The vignette loop does not reset when the accordion row changes (§5.2).
7. All three timers and both slipstream sets pause when their section is off-screen, including a
   section that mounts below the fold.
8. Under `prefers-reduced-motion: reduce`: no sweep, no vignette loop, no carriage, static
   slipstream — and the accordion still advances. Nothing is frozen mid-animation.
9. Every keyboard path works: Tab to a row, Enter to open, arrows to move, focus ring always visible,
   and auto-advance never steals focus.
10. No `width`, `height`, `top`, `left`, `margin`, or `box-shadow` is animated anywhere.
11. No duration or px literal appears in a component — all of it resolves through `lib/gsap/motion.ts`
    or a CSS custom property.
12. `grep -rn "placeholder: true" lib/copy/` returns **fourteen** hits — the existing eleven plus
    three vignette fixtures, all under `lib/copy/placeholder/`. No fabricated string appears inline
    in any component, and no vignette string lives in `lib/copy/capabilities.ts`.
13. A `PLACEHOLDER` chip renders beneath each of the three panels, outside the `aria-hidden`
    subtree, and all three disappear under `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS=false` with no
    reflow.
14. `components/ui/accordion.tsx`, `lib/utils.ts`, `components/motion/slipstream.tsx`,
    `components/layout/placeholder-chip.tsx`, and `lib/gsap/register.ts` are unmodified.
15. `app/page.tsx` loses the `#answers` and `#demos` stubs, gains three section elements, and still
    contains no layout maths, copy, or animation.
16. No route hue appears on any text, rule, icon, button, or focus ring.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
```

`build` because three new client components and their ScrollTriggers land on the route, and an SSR
mistake in a `"use client"` boundary only surfaces in a production build.

Paste real output for all four. Lint must still be the same three pre-existing errors, in
`components/ui/carousel.tsx`, `hooks/use-mobile.ts`, and `components/layout/wordmark.tsx` — the same
three files, not merely the same count. Any new error is a failure, including in a new file.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **1440px, full scroll.** The three panels should read as carried by the rail, not as floating
   squares. Confirm the alternation and confirm the hue changes once per section and never bleeds
   into text or the rail.
2. **Watch one accordion for two full cycles without touching it.** The underline should be a
   legible timer, not a decoration; 5s per row is the guess and it is the first thing to retune.
3. **Hover mid-sweep, then leave.** Takeover and resume should feel deliberate rather than jumpy.
   Then Tab into the rows and confirm the auto-advance does not yank focus.
4. **Decision 9 — the chips.** Three chips now sit beneath three panels, on a page that already has
   two. Scroll the whole page and say whether it reads as chip-spotted. If it does, the fix is a
   §11.1 conversation about chip *placement* — one marker for the section, say, rather than one per
   panel — and explicitly not about dropping the flag. Then restart with
   `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS=false npm run dev` and confirm all five vanish with no
   reflow.
5. **The panel loop against the accordion.** Confirm they are visibly unsynchronised, and say
   whether that reads as alive or as sloppy — §5.2 says the reference does it and the reasoning in
   decision 5 is mine, so it is worth a second opinion.
6. **Reduced motion.** Toggle the OS setting, reload, and walk all three sections: no sweep, no
   scene loop, no carriage, static texture, accordion still advancing.
7. **JavaScript disabled.** First row open in each section, panels static, nothing visibly broken.
8. **360px and 768px.** Panel floors, chip wraps, two-line bodies, no horizontal scroll.

## Open questions this raises for later prompts

- **`CAPABILITY.dwell`.** 5s is §5.1's observed "roughly 4–5s". If review says it is too fast to
  read two lines, change the constant — not the mechanism.
- **Chip placement across the page.** Decision 9 takes the count from two to five. If review says
  that is too many markers, the §11.1 change is about where a marker attaches — per fabricated
  block, per section, or once per page — and it should be settled before the testimonial carousel
  adds a sixth.
- **The vignette parts kit.** `Bubble`, `Chip`, and `Field` are exactly what the Ask bar's
  post-submit UI will need if it ever becomes an inline thread (§15). Do not generalise them for
  that here; note the overlap when the Ask bar prompt lands.
- **A third display step.** Prompt 07 left this open for the proof band's figures. Nothing here
  needs it — every headline is `--text-headline` — so it stays open.
