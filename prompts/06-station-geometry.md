# 06 — Station geometry

## Goal

Fix the Rail's station markers so a Utility-face station label never overlaps the section heading
it belongs to. This is a §6.4 geometry defect that predates the hero: it is present in all four
sections on `/` today, and it will be present in the eleven §8 sections still to be built. Fix it
once, centrally, before the rest of the page is designed around it.

Nothing else changes. No new section, no copy, no animation, no new component.

## Skills and docs read

- `AGENTS.md` §6.4 (the Rail and its station markers), §6.3 (spacing, the 4px scale), §6.2 (the
  Utility face and where it is allowed), §12 (responsive floor, contrast, decorative visuals),
  §13 (centralised magic numbers, CSS specificity, section spacing on the section element only).

Deliberately **not** read, and why:

- `node_modules/next/dist/docs/` — no routing, boundary, font, image, metadata, or config surface
  is touched. §2 requires the docs for framework code; this is CSS geometry and one presentational
  component.
- Every `gsap-*` skill — nothing animates in this change. The Rail's two existing tweens (the
  scrubbed paint and the hero-load cover) are untouched, and this prompt must not alter either.
- `.agents/skills/shadcn` — `RailStation` has no shadcn equivalent (§10 says so explicitly) and
  gains no primitive here.

## Existing code inspected

- `app/globals.css` — `--rail-x` (`4px`, raised to `--gutter` at ≥640px), `--rail-gap`
  (`clamp(24px, 4vw, 56px)`), `--gutter` (`clamp(16px, 4vw, 24px)`), and the three utilities that
  consume them: `rail-track`, `rail-station`, `rail-offset`.
- `components/layout/rail-station.tsx` — one flex row: a 7px `node-square` and a `type-utility`
  label with `gap: 12px`, the label `hidden sm:block`. `aria-hidden`.
- `components/layout/rail.tsx` — draws the track and the paint. Renders no station markers, so it
  is **not** touched by this prompt beyond nothing at all.
- `app/page.tsx` and `components/sections/hero.tsx` — the four current consumers, each a
  `<div className="rail-offset relative">` holding a `<RailStation>` plus a heading.

## The defect, measured

`rail-station` is `position: absolute; top: 0; left: var(--rail-x); margin-left: -3px`, then a 7px
node and a 12px gap. So the label's left edge lands at:

```
label left  = --rail-x - 3 + 7 + 12  = --rail-x + 16
```

The heading's left edge, from `rail-offset`, lands at:

```
heading left = --rail-x + --rail-gap
```

Both are at the section's top edge, so the horizontal room the label has before it collides is
`--rail-gap - 16`. Measured against the labels §8 actually needs, in the Utility face at 11px with
`0.12em` tracking:

| Label | Width |
| --- | --- |
| `FAQ` | 28px |
| `Start` · `Demos` · `Route` · `Proof` · `Build` | 46px |
| `Answers` | 64px |
| `Live demo` | 82px |
| `Onboarding` | 91px |
| `Testimonials` | 109px |

Against a room budget of **40px at 1440px** and **14.7px at 768px**. Every label except `FAQ`
overlaps at every width where the label is visible. Measured on the current page:

| Section | Overlap at 768px | Overlap at 1440px |
| --- | --- | --- |
| hero | 30px | 5px |
| answers | 48px | 23px |
| demos | 30px | 5px |
| faq | 12px | −13px (clears) |

The worst case is around 640–767px, where `--rail-x` has already jumped to the gutter but
`--rail-gap` is still near its floor.

## Decisions and assumptions

### 1. Reserve a label row above the section content

The station marker keeps its shape — node on the line, label 12px to its right, one flex row — and
the section's content starts *below* it instead of beside it. A new token, `--station-lead`,
reserves that row as `padding-top` on `rail-offset`.

This is the fix because it removes the constraint rather than negotiating with it: the label no
longer competes with the heading for the `--rail-gap` channel at all, so it works for a 28px label
and a 109px one identically, at every width, forever. It also reads correctly — a station sign
above the platform, not crowded beside it.

It costs `--station-lead` of vertical space per section, which lands inside the existing
`--section-rhythm` band and is not noticeable at 112–200px of section padding. It shifts the node
from roughly the heading's first line up to above it; that is a visual change to accept
deliberately, not a side effect to hide.

### 2. Rejected alternatives, recorded

- **Widen `--rail-gap` to fit the longest label.** Arithmetically it needs `109 + 16 = 125px`. At
  360px that leaves the headline about 215px of measure, and §6.3 caps the gutter at 24px, so the
  page would be mostly empty channel on mobile. Not viable at any width, not merely inelegant.
- **Rotate the label vertically along the rail** (`writing-mode: vertical-rl`). Costs no horizontal
  space and is arguably the most literal signage idiom. Rejected: 11px uppercase mono rotated is
  slow to scan, it shares a ~40px channel with the rail's own 1px line, and it is a larger visual
  invention than the defect justifies. Worth revisiting if decision 1 reads as clutter once several
  sections exist.
- **Move the label into the content column as its own element above the heading.** Splits one
  marker into two unrelated things, and §5.1/§8 already put an eyebrow chip in exactly that slot on
  the capability sections. Rejected.

### 3. The label stays hidden below 640px, so the lead collapses there

§6.4 is explicit that mobile "thins its station labels to nodes only". The label is already
`hidden sm:block`, so `--station-lead` must be `0` below 640px and take its value at and above it —
reserving an empty 40px band on mobile would be dead space. This uses the same `@media
(min-width: 640px)` block that already raises `--rail-x`, so the two mobile rail rules stay
together.

A consequence worth stating: the label now costs no horizontal space, so showing it on mobile
became cheap. This prompt does **not** do that, because §6.4 says nodes only. If we want it, that
is a §6.4 revision and its own decision.

### 4. `--station-lead` is a flat value, not fluid

`40px`: a 16px label row plus 24px of clearance, both on §6.3's 4px scale. It is measured from the
section's top edge, so it is the same reserved band regardless of whether the heading below it is
`--text-hero` at 76px or `--text-headline` at 26px. A `clamp()` here would vary the band while the
thing it clears does not change height at all.

### 5. Padding on the element, not a margin on a child

§13: section spacing lives on the section element and children never set their own outer margins.
`--station-lead` therefore goes on `rail-offset` as `padding-top`, alongside the `padding-left` it
already sets — not as a `margin-top` on the heading, and not on the `<section>`, whose
`padding-block` is `--section-rhythm` and means something else.

Absolutely positioned children resolve against the padding box, whose top edge is the border box's
top edge, so `rail-station`'s `top: 0` still puts the marker at the very top of `rail-offset` and
needs no change.

## Files likely to change

| File | Change |
| --- | --- |
| `app/globals.css` | add `--station-lead` (0, raised at ≥640px); add `padding-top` to `rail-offset`; extend the `rail-station` comment |

That is the whole change. Explicitly **not** modified:

- `components/layout/rail-station.tsx` — its markup is already correct; only the space around it
  was wrong. If the implementation finds itself editing this file, the approach has drifted.
- `components/layout/rail.tsx`, `components/sections/hero.tsx`, `app/page.tsx`,
  `lib/gsap/motion.ts` — no consumer changes, because the fix is in the utility they already use.

No new dependency, no new file, no new component.

## Implementation requirements

### `app/globals.css`

1. In `:root`, beside the existing rail geometry comment, add:

```css
/* Vertical room reserved above a section's content for its station label row (§6.4). The label
   cannot sit beside the heading: it needs --rail-gap - 16px of room and the longest station name
   is 109px against 40px available at 1440px. So the marker gets its own row and the content
   starts below it. 16px label row + 24px clearance, on §6.3's 4px scale. Zero below 640px, where
   §6.4 thins the markers to nodes only and there is no label to clear. */
--station-lead: 0px;
```

2. In the existing `@media (min-width: 640px)` block that raises `--rail-x`, add
   `--station-lead: 40px`.

3. In `@utility rail-offset`, add `padding-top: var(--station-lead)`.

4. Extend the `rail-station` comment to record that the label occupies its own reserved row and
   that `rail-offset`'s `padding-top` is what clears it — so the two are not separated later by
   someone who cannot see the dependency.

Use `0px` rather than `0` for the mobile value: it is consumed as a length by `padding-top` and
keeping the unit makes the media-query override obviously the same kind of value.

## Visual spec

**Layout.** Unchanged horizontally. The station marker sits at the top of each section's content
block, node centred on the rail at `--rail-x`, label 12px to its right, free to be as wide as it
needs. The heading begins `--station-lead` below the marker's row and keeps its left edge at
`--rail-x + --rail-gap`, so headlines still hang off the rail exactly as before.

| | 360px | 640px | 768px | 1440px |
| --- | --- | --- | --- | --- |
| Station label | hidden | shown | shown | shown |
| `--station-lead` | 0px | 40px | 40px | 40px |
| Heading left edge | 28px | 49.6px | 54.7px | 200px (in a centred 1200px shell) |
| Label/heading overlap | n/a | none | none | none |

**Type and colour.** Nothing changes. The label stays `type-utility` in `--rail-muted`; the node
stays `--ink`. No token is added to the colour or type scale, so `lib/utils.ts`'s tailwind-merge
list is untouched.

**Spacing.** The only new space is `--station-lead` inside `rail-offset`. Section rhythm is
untouched, so total section height grows by 40px at ≥640px and not at all below it.

**States.** The marker is decorative and has no states.

## Motion spec

**Nothing animates.** No timeline, no ScrollTrigger, no transition is added.

The Rail's two existing tweens must both still behave exactly as they do now: the scrubbed
`scaleY` paint against `<main>`, and the hero-load `rail-lead` cover retreating over
`HERO.railDraw`. Neither depends on `rail-offset`'s padding, so neither should change — but the
hero load's timing must be re-confirmed after the change rather than assumed, because the reserved
row moves the hero's headline down by 40px and the entrance animates `y` on it.

Reduced motion is unaffected: there is nothing new to branch on.

## Accessibility requirements

- `RailStation` stays `aria-hidden` — the change is spatial only, and the label still repeats the
  section's own heading, so it must not be announced (§12).
- Heading order is untouched: one `h1` in the hero, `h2` elsewhere.
- No focusable element is added, moved, or reordered, so the tab order is byte-identical.
- The reserved row must not introduce a horizontal scrollbar at any width (§12) — it is vertical
  padding, so it should not, and that is worth confirming rather than reasoning about.
- Contrast is unchanged; no text moves onto a new background.

## Acceptance criteria

1. At 640, 768, 1024, and 1440px, for **every** section on `/`, the station label's right edge is
   left of the heading's left edge — measured, not eyeballed. Overlap must be negative or the
   label must be absent.
2. At 360px the label is absent, the node is present, and `--station-lead` computes to `0px`, so no
   empty band is reserved.
3. Headings still begin at `--rail-x + --rail-gap` at every width — the fix must not have moved
   content horizontally.
4. No horizontal page scroll at 360, 768, 1024, or 1440px.
5. The rail is still one continuous line, still painted by scroll, still above the hero's
   slipstream band.
6. The hero load still matches prompt 05's motion table and still completes within 1.2s.
7. Under `prefers-reduced-motion: reduce`, and with JavaScript disabled, the page renders exactly
   as it did before this change apart from the reserved row.
8. `components/layout/rail-station.tsx`, `components/layout/rail.tsx`,
   `components/sections/hero.tsx`, `app/page.tsx`, and `lib/gsap/motion.ts` are all unmodified.
9. No new token in the `--text-*` or colour namespace, so `lib/utils.ts` needs no edit.
10. No duration, offset, or geometry literal is introduced in a component — the one new value is a
    CSS custom property.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

`build` is included even though §14 does not strictly require it for a CSS-only change: the fix
depends on `@utility` emission and cascade-layer ordering, which the production CSS pipeline is the
only honest test of. Paste the real output of all three, and confirm the lint error count is still
the three pre-existing ones in `components/ui/carousel.tsx`, `hooks/use-mobile.ts`, and
`components/layout/wordmark.tsx` — not a number, the same three files.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **The collision itself.** At 768px, look at all four sections. `START`, `ANSWERS`, `DEMOS`, and
   `FAQ` must each sit clear above their heading with no character touching it. This is the whole
   point of the prompt; if any label still overlaps, the fix is wrong.
2. **640px exactly.** The worst case before the fix. Confirm the label has appeared and clears.
3. **360px.** Confirm the label is gone, the node is still on the line, and there is no empty gap
   above the headline where the label would have been.
4. **1440px.** Confirm the marker reads as a sign above the headline rather than as a stray chip,
   and that the 40px clearance does not look like a mistake against the 76px display serif. Say
   plainly if it reads as clutter — decision 2's vertical-label alternative is the fallback, and
   that is a §6.4 conversation rather than something to fix by trimming the value.
5. **Hero load.** Hard-reload at 1440px and confirm the sequence is unchanged: rail draws, then
   headline lines, subcopy, CTAs, band.
6. **Full scroll.** Scroll to the bottom and back. The rail must stay continuous and its paint must
   still track the viewport midpoint.

## Open question this raises for prompt 07

§8's three capability sections each carry a station label *and* a pill eyebrow chip (§5.1). With
the station label now occupying the row directly above the headline, those two land in the same
slot and will read as two eyebrows stacked. That needs resolving when the capability sections are
built — drop the eyebrow chip and let the station label do the job, or move one of them — and it is
a copy and hierarchy decision, not a geometry one. **Do not resolve it in this prompt.**
