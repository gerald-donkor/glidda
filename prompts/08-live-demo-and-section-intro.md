# 08 — Live demo panel and section intro

## Goal

Build §8's rows 6 and 7: the **live demo panel** (a full-width rounded panel with a slipstream
backdrop, an eyebrow, a headline, one line of subcopy, and the solid ink pill) and the **section
intro** (a left-aligned headline plus a two-line paragraph that opens the three capability
sections). After this prompt, `/` reads hero → logo band → proof band → live demo panel → section
intro → the three stubs.

These two ship together because the second is meaningless alone: the section intro exists to
introduce the capability sections, and putting it directly under the proof band with the demo panel
still missing would design its spacing against a neighbour that is about to change.

This is also the first consumption of `Slipstream`'s `mono` route, which prompt 04 built and
nothing has used. Prompt 07's hand-off asked that `mono` be confirmed at panel size before anything
is designed around it — decision 2 is that confirmation and it changes the answer.

No new dependency, no new route, no Ask-bar change, no shadcn primitive is forked, no fixture is
added.

## Skills and docs read

- `AGENTS.md` §6.1 (colour, and the rule that colour lives only inside feature panels), §6.2 (two
  display steps, the Utility face's four permitted jobs), §6.3 (spacing, the four radii, the
  slipstream), §6.4 (the Rail and station markers), §8 (rows 6 and 7 and the mapping table), §9
  (file layout, copy in `lib/copy/`, server by default), §10 (check `components/ui/` first), §11
  (copy rules — this is real copy, not fixtures), §12 (quality floor), §13, §14.
- `.agents/skills/gsap-react` and `.agents/skills/gsap-scrolltrigger` — read to confirm what
  `Slipstream` already does on mount, not to write anything new. Nothing in this prompt creates a
  tween (decision 7).
- `.agents/skills/shadcn` — `Card` and `Badge` checked against the panel and the eyebrow.
  Findings in decision 6.

Deliberately **not** read, and why:

- `node_modules/next/dist/docs/` — no routing, server/client boundary, font, image, metadata, or
  config surface is touched. Both sections are server components composed into the existing
  `app/page.tsx`. There is no screenshot and no `next/image` here: §8's mapping table replaces the
  reference's blurred bust with the slipstream, and the embed screenshot belongs to the Route
  section, not this one.

## Existing code inspected

- `components/motion/slipstream.tsx` — `route` × `density`, absolutely positioned, `aria-hidden`,
  starts and pauses its own drift via its own `ScrollTrigger`, renders the static field from CSS
  with JS off. **The consumer must supply a positioned, overflow-clipped box**, plus a radius when
  the box is rounded.
- `app/globals.css` — the `.slipstream[data-route="mono"]` rule: `--slipstream-wash: var(--surface)`
  and `--slipstream-edge: var(--rail)`. This is the fact decision 2 turns on.
- `components/sections/hero.tsx` — the section shape, and the `hero-band relative overflow-hidden`
  box the slipstream sits in.
- `components/sections/proof-band.tsx` and `logo-band.tsx` (prompt 07) — the current last two
  sections; the section intro follows them and must not fight their rhythm.
- `components/ui/button.tsx` — `variant="pill"` / `size="pill"`, and the `nativeButton={false}` +
  `render={<a/>}` idiom the hero uses for a link that looks like a button.
- `lib/copy/hero.ts`, `lib/copy/proof.ts`, `lib/copy/shell.ts` — the copy-module idiom: one typed
  exported object, a header comment stating whether §11.1 applies.
- `lib/gsap/motion.ts` — `SLIPSTREAM.durations`, `HERO`, `EASE`. Untouched.
- `prompts/06-station-geometry.md` — its measured label table lists ten station labels, one of
  which is `Live demo` (82px) and none of which belongs to a section intro. Decision 3.
- `components/ui/card.tsx`, `badge.tsx` — read in full before deciding to hand-build both
  (decision 6).

## Decisions and assumptions

### 1. The panel's fill is `--ground`, not `--surface`

§5.1 describes the reference's demo block as a very pale grey panel. Painting ours `--surface` and
then putting a `mono` slipstream on it renders an invisible texture: `mono`'s wash **is**
`--surface`, so surface streaks on a surface fill have zero contrast and the whole backdrop
disappears.

So the panel is `--ground` with a `1px solid var(--rail)` hairline and `--radius-panel`, and the
slipstream's `--surface` streaks are what give it its pale tone. The result reads as the same
pale-grey block, except the grey is textured and moving rather than flat — which is the point of
having a slipstream at all. The hairline is what keeps the panel's edge legible where a streak
happens to fade out near it.

### 2. The panel uses `density="band"`, not `density="panel"`

Prompt 07 asked for this to be confirmed rather than assumed, and the honest answer is that the
name is misleading. `density="panel"` is tuned for the ~1:1 feature panels in §8's capability
sections: five streaks per layer, sized for a tall square. The live demo panel is wide and shallow
— the same proportion as the hero band — so `panel` density crowds it and the streaks read as
stripes rather than as an open field, which §6.3 explicitly forbids.

`density="band"` is the correct treatment for this shape. The prop is named for the composition,
not for the component it sits in, and this prompt does not rename it: renaming a public prop to
fix one confusing call site is a refactor, and §13 forbids unrelated refactors. Both call sites
carry a comment saying which shape they are.

If manual review finds the band field too sparse across a panel this wide, the fallback is a fourth
`band` streak per layer in `slipstream.tsx`'s fixed array — not a density switch, and not a random
field.

### 3. Station markers: `Live demo` for the panel, none for the section intro

§8's diagram draws a node beside every row, but prompt 06's measured table is the authority on
which labels exist, and it lists `Live demo` and nothing for a section intro. That is right for the
same reason the logo band has none (prompt 07, decision 4): the section intro is a sentence that
introduces what follows, not a place the reader arrives at. Its own headline is already the
arrival announcement for the three sections after it, and putting a station on both would mark the
same arrival twice.

The rail runs behind the section intro uninterrupted.

### 4. Both sections are left-aligned; nothing on this page centres

§5.1 centres the reference's demo block. Ours does not. The hero already made this trade
deliberately — §8's mapping table records "headline hangs off the rail rather than centring" — and
a single centred block in the middle of a page with one strong left edge would read as a mistake
rather than as emphasis. The panel's content therefore starts at the panel's own left padding, and
the panel itself starts at `rail-offset`'s content edge, so the demo headline, the hero headline,
and the proof band's hairline all begin at the same x.

If review disagrees, the change is one `items-start` → `items-center` on the panel's inner box; do
not make it silently.

### 5. The hero's secondary CTA now has a real target

`lib/copy/hero.ts` points "See it run" at `#demos`, which is a stub. The live demo panel is
literally the thing that phrase describes, so the href moves to `#live-demo`. One string in one
copy module — no component changes, and the label is untouched, so §11's "the action keeps its
name" still holds.

This is the only edit to previously-shipped work in this prompt. Flagging it because prompt 07
explicitly listed the hero as not-modified and this reverses that for one line.

### 6. The panel and the eyebrow are hand-built

Checked against §10's "compose primitives before building":

- **`Card`** — brings `rounded-xl border py-6 shadow-sm` plus a header/content/footer slot
  structure. Our panel is `--radius-panel` (24px, one of §6.3's four radii — `rounded-xl` is not),
  has no shadow at all (§6.3 reserves the only shadow for the Ask bar), and has one content block
  rather than three slots. Overriding all of that is forking, not composing.
- **`Badge`** — same finding as prompt 07, decision 6: `rounded-4xl text-xs font-medium` is the
  wrong radius, the wrong size, and the wrong face. The eyebrow is a `<p className="type-utility">`
  with no chrome at all — it is not a chip here, unlike the capability sections' pill eyebrow, and
  that difference is deliberate: a chip inside a panel that already has a border is one frame too
  many.

`Button` **is** used, unchanged, at `variant="pill" size="pill"` (§10's rule working as intended).

### 7. Nothing new animates

§7.3 permits three orchestrated moments and this is none of them. The slipstream's drift is an
existing ambient loop that starts and pauses itself; mounting a second instance of a built
component is not a new moment. No `useGSAP`, no `ScrollTrigger`, no entrance, no scroll reveal.

Both section files are therefore pure server components — `Slipstream` is the only client boundary
and it is imported, not authored here.

Consequence for §7.2: neither section needs a reduced-motion branch of its own, because
`Slipstream` already has one. Confirm it rather than assume it.

### 8. Copy: two modules, and it is real copy

`lib/copy/live-demo.ts` and `lib/copy/section-intro.ts`. Two small files rather than one shared
one, following `hero.ts`'s granularity — `proof.ts` covers two sections only because they are one
proof idea.

Neither module contains a claim about a customer, a person, or a metric, so §11.1 does not apply
to either: no fixture flag, no `PLACEHOLDER` chip, nothing added to `lib/copy/placeholder/`. Each
file's header comment says so, phrased without the literal flag string so §14's grep stays clean
(prompt 07, decision 3).

Draft copy, to be reviewed as part of this prompt rather than treated as fixed:

- **Live demo panel** — eyebrow `Live demo`; headline "Watch a guide run on a real product.";
  subcopy "It drives the interface, not a recording — every click you see is one a new user would
  make."; CTA `Start a guide` → `#ask`.
- **Section intro** — headline "Three things a guide does once it is on your site." with a
  two-line paragraph: "It answers the question a visitor is holding, shows the product doing the
  thing they asked about, and stays with them through the first week. Each one runs on its own,
  in any language, at any hour."

Both obey §11: active voice, sentence case, no exclamation, nothing from the banned-word list, and
the CTA says exactly what happens.

### 9. The demo panel's CTA is the same action as the hero's

`Start a guide` → `#ask`, identical to the hero's primary and the header's pill. §11 requires the
action to keep its name through the whole flow, and inventing a third label for the same
destination would suggest three different things happen. The Ask bar remains inert on submit
(§8.1) and this prompt does not change that.

## Files likely to change

| File | Change |
| --- | --- |
| `lib/copy/live-demo.ts` | new — eyebrow, headline, subcopy, CTA, station label |
| `lib/copy/section-intro.ts` | new — headline and paragraph |
| `components/sections/live-demo.tsx` | new |
| `components/sections/section-intro.tsx` | new |
| `lib/copy/hero.ts` | one line — the secondary CTA's href (decision 5) |
| `app/page.tsx` | compose both sections between `<ProofBand />` and the `answers` stub |

Explicitly **not** modified: `components/motion/slipstream.tsx`, `app/globals.css` (no new token —
every value this needs already exists), `lib/utils.ts`, `lib/gsap/*`, `components/layout/*`,
`components/ui/*`, `lib/copy/placeholder/*`, and the three stub sections.

## Implementation requirements

### `lib/copy/live-demo.ts`

One typed exported object: `eyebrow`, `headline`, `subcopy`, `cta` (reusing `NavLink` from
`shell.ts`), `station`. Header comment in the `hero.ts` idiom.

### `lib/copy/section-intro.ts`

One typed exported object: `headline`, `body`. Header comment likewise.

### `components/sections/live-demo.tsx`

```
<section id="live-demo" className="section-rhythm anchor-offset">
  <div className="rail-offset relative">
    <RailStation label={…} />
    <div className="relative overflow-hidden rounded-panel hairline bg-ground">
      <Slipstream route="mono" density="band" />
      <div className="relative …padding…">
        <p className="type-utility text-rail-muted">eyebrow</p>
        <h2 className="text-headline">…</h2>
        <p className="text-body text-rail-muted max-w-[52ch]">…</p>
        <Button variant="pill" size="pill" nativeButton={false} render={<a href={…}/>}>…</Button>
      </div>
    </div>
  </div>
</section>
```

- The panel box supplies `relative overflow-hidden` **and** the radius, per `Slipstream`'s
  contract — without the radius on the clipping box the streaks square off the corners.
- The content box is `relative` so it stacks above the absolutely positioned slipstream. Do not
  reach for a `z-` utility: one positioned sibling later in the DOM is enough, and adding a
  z-index here would start a stacking context the Ask bar has to out-rank.
- Panel padding: `px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24`, on §6.3's 4px scale.
- Vertical rhythm inside the panel comes from the content box's own `space-y`/`mt-*`, matching the
  hero's intervals: eyebrow → headline 24px, headline → subcopy 24px, subcopy → CTA 40px.
- No shadow. No route hue. Nothing coloured (§6.1) — `mono`, not `mono-signal`: the hero's
  exception is the hero's alone.

### `components/sections/section-intro.tsx`

```
<section id="capabilities" className="section-rhythm anchor-offset">
  <div className="rail-offset relative">
    <h2 className="text-headline max-w-[20ch]">…</h2>
    <p className="mt-6 max-w-[62ch] text-body text-rail-muted">…</p>
  </div>
</section>
```

- No `RailStation` (decision 3), no panel, no CTA, nothing else on the row (§5.1, item 7).
- `max-w-[20ch]` on the headline is what produces §5.1's two lines at desktop width without a
  hard-coded `<br>`; the paragraph's `max-w-[62ch]` gives its two lines. Neither is a promise about
  where the break lands at every width, and neither may cause a horizontal scroll.

### `lib/copy/hero.ts`

`ctas.secondary.href`: `#demos` → `#live-demo`. Nothing else in the file changes.

### `app/page.tsx`

Import and render `<LiveDemo />` and `<SectionIntro />` immediately after `<ProofBand />`. Update
the header comment's outstanding list. Composition only.

## Visual spec

**Colour.** `--ground` panel fill, `--rail` hairline, `--ink` headline and CTA fill, `--paper` CTA
label, `--rail-muted` eyebrow and body. The slipstream contributes `--surface` streaks over `--rail`
edges and nothing else. No route hue anywhere in either section: the page chrome is monochrome and
neither of these is a feature panel.

**Type.**

| Element | Token | Face |
| --- | --- | --- |
| Panel eyebrow | `--text-eyebrow` | Utility, uppercase |
| Panel headline | `--text-headline` | Display, 300 |
| Panel subcopy | `--text-body` | Body |
| CTA label | `--text-body` | Body (from `size="pill"`) |
| Intro headline | `--text-headline` | Display, 300 |
| Intro paragraph | `--text-body` | Body |

**Responsive.**

| | 360px | 768px | 1024px | 1440px |
| --- | --- | --- | --- | --- |
| Panel padding | 24 / 64 | 40 / 80 | 56 / 96 | 56 / 96 |
| Panel headline | ~3 lines | 2 lines | 2 lines | 2 lines |
| `Live demo` station label | hidden, node only | shown | shown | shown |
| CTA | full row, wraps if needed | inline | inline | inline |
| Intro headline | ~3 lines | 2 lines | 2 lines | 2 lines |

**Spacing.** Both sections take the full `--section-rhythm`. The demo panel is a new arrival after
the proof band and the intro is a new arrival before the capability sections; neither is a
continuation, so neither takes `--section-rhythm-tight`. All inner spacing is on the 4px scale and
lives on the section or on the one content wrapper (§13).

**Shape.** `--radius-panel` on the panel, `999px` on the CTA. No card radius, no shadow anywhere.

**States.** The CTA is the only interactive element across both sections: the `pill` variant's
existing hover and its `focusRing`, both already defined in `button.tsx`. Nothing else hovers.
If the implementation writes a new `hover:` class in either file, it has added an affordance the
design does not have.

## Motion spec

**Nothing new animates.** No GSAP import, no `ScrollTrigger`, no timeline, no CSS transition
beyond the ones `Button`'s `pill` variant already carries.

The one moving thing is the slipstream instance inside the panel, which is the existing component
running its existing ambient loop: three `xPercent` tweens at `SLIPSTREAM.durations`
(20 / 15.5 / 11s), `EASE.linear`, `repeat: -1`, paused when the section is off-screen by the
component's own `ScrollTrigger`.

Existing motion must be unaffected. Two things to re-confirm rather than assume:

1. The hero load timeline is untouched and still completes in 1.10s. The hero's own slipstream now
   has a second instance elsewhere on the page; confirm the two do not interfere and that the
   hero's still starts at `HERO.band`.
2. The rail's scrubbed paint spans a taller `<main>` again — a longer scroll for the same tween.
   It must still track the viewport midpoint.

**Reduced motion.** Nothing new to branch on. Under `prefers-reduced-motion: reduce` the panel's
slipstream renders as the static sheared field from CSS and the section is otherwise identical.
With JavaScript disabled, both sections render completely, including the static field.

## Accessibility requirements

- Heading order stays `h1` (hero) → `h2` × N with no level skipped. Both new sections contribute
  one visible `h2`. Still exactly one `h1` on the page (§12).
- The slipstream instance is `aria-hidden` by the component (§12, decorative). The station marker
  stays `aria-hidden`.
- The eyebrow is a `<p>`, not a heading — it labels the panel, it does not open a section, and
  promoting it would put an `h3` above its own `h2`.
- The CTA is an anchor rendered through `Button`, so it is a real link: in the tab order, reachable
  by Tab, activated by Enter, with the existing visible focus ring. It must not be a `<button>`
  that navigates.
- Tab order across the page becomes: skip link → header → hero CTAs → demo panel CTA → Ask bar.
- Contrast: `--ink` and `--rail-muted` on `--ground`, and both again over `--surface` streaks —
  6.13:1 and 5.41:1 respectively, both above §12's 4.5:1. The grain overlay is at 0.14 multiply and
  darkens the ground very slightly, which moves both ratios up, not down. Confirm the eyebrow over
  the densest streak rather than assuming.
- No horizontal page scroll at any width. The panel is inside `rail-offset`, so it inherits the
  content shell's box and cannot exceed it; the slipstream's oversized sheared frame is clipped by
  the panel's `overflow-hidden`, which is the specific risk to check.

## Acceptance criteria

1. `/` renders hero → logo band → proof band → live demo panel → section intro → the three stubs,
   in that order.
2. The demo panel is a rounded, hairlined, ground-filled box with a visible moving slipstream
   behind its text, and the streaks are clipped to the rounded corners at every corner.
3. The panel's eyebrow, headline, subcopy, and CTA all render from `lib/copy/live-demo.ts`; the
   intro's headline and paragraph from `lib/copy/section-intro.ts`. No copy string is inline in
   either component.
4. The panel carries the `Live demo` station marker; the section intro carries none, and the rail
   is unbroken behind it.
5. The hero's "See it run" now scrolls to the live demo panel and lands with the heading clear of
   the viewport top (`anchor-offset` doing its job).
6. Neither section file contains `"use client"`, a GSAP import, a `z-` utility, a shadow, a route
   hue, or a new `hover:` class.
7. `grep -rn "placeholder: true" lib/copy/` returns exactly the same 11 hits as prompt 07 — this
   prompt adds no fixture.
8. No horizontal page scroll at 360, 768, 1024, or 1440px.
9. The panel's left edge and both headlines start at the same x as the hero headline and the proof
   band's hairline.
10. The hero load is unchanged and the rail still paints on scroll across the taller page.
11. `app/globals.css` and `components/motion/slipstream.tsx` are unmodified.
12. With JavaScript disabled, both sections are fully readable and the slipstream renders as a
    static field rather than as an empty box.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
```

`build` is included: two route-level components join `app/page.tsx`. Paste the real output of all
four. Confirm the lint error count is still the same three pre-existing files —
`components/ui/carousel.tsx`, `hooks/use-mobile.ts`, `components/layout/wordmark.tsx` — and name
them, not just a number.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **1440px.** The panel at full width. Judge the `band` density across a box this wide (decision
   2): is it an open field of long streaks, or has it thinned out into a few lonely bars on white?
   Report which — the fallback is a fourth streak per layer, not a density switch.
2. **The corners.** Look at all four. A streak fading out near a rounded corner must be clipped by
   the radius, not squared off. This is the specific failure mode of putting an absolutely
   positioned, oversized, rotated frame inside a rounded box.
3. **Contrast on texture.** Read the eyebrow and the subcopy where a thick streak passes directly
   behind them. If the 11px Utility face becomes hard to read over a streak plus grain, say so —
   the fix is a lower grain opacity for this instance, not a darker text token.
4. **768px and 360px.** Panel padding steps down, the headline rewraps, the CTA stays inside the
   panel and does not touch its right padding. No horizontal scrollbar at 360.
5. **The station.** `Live demo` is the longest label prompt 06 measured at 82px. Confirm it clears
   the panel's top edge at 768px, where prompt 06 found the room budget tightest, and that it
   collapses to a node at 360px.
6. **"See it run".** Click it from the hero. It should scroll to the panel, not to the `demos`
   stub, and the panel's heading should not sit under the top of the viewport.
7. **Two slipstreams.** Scroll the hero off-screen and back. Both instances must pause off-screen
   and resume on-screen, and the hero's must not re-trigger its load fade.
8. **Reduced motion and JS off.** Toggle the OS setting, then disable JavaScript. In both states
   the panel keeps its static sheared field and its text — an empty white box means the CSS
   fallback broke.
9. **Read the two together.** The panel makes a promise and the intro sets up three sections that
   have to keep it. If the intro's paragraph restates the panel's subcopy rather than moving the
   reader forward, that is a copy problem worth reporting, not a layout one.

## Open questions this raises for prompt 09

- **The capability sections are next**, and they are the largest piece of the page: three
  alternating rows, the auto-advancing accordion with its progress underline, and the panel
  vignettes (§7.3 #3). That is almost certainly more than one prompt — expect to split the
  accordion mechanic from the vignette scenes.
- **Prompt 06's unresolved question finally lands there.** The station label and the capability
  sections' pill eyebrow chip occupy the same slot, and the capability sections are the first place
  both exist at once. It cannot be deferred again.
- **`density="panel"` gets its first real use there too**, which is where its five-streak field was
  designed to sit. If decision 2's band/panel confusion caused trouble here, that is the moment to
  decide whether the prop is named right.
