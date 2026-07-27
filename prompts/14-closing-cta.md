# 14 — The closing CTA

## Goal

Build §8 row 13: the **closing CTA** — a full-bleed band carrying one line of display copy and the
solid ink pill, and the page's last section before the footer.

§15 lists this section's visual as an open decision and says only what it must not be: not hands.
This prompt resolves it. The concept is **the terminus** — the Rail has run the whole page as its
signature element, and this is where it arrives.

With this, §8 is structurally complete: every row from the announcement bar to the footer exists.
What remains after it is all §15 — swapping the fixtures, the snippet host, the post-submit Ask bar
UI, and the unused `motion` package.

Out of scope, explicitly: any change to the Rail, the footer, the Ask bar, or any other section. No
backend. No new orchestrated motion.

## Skills and docs read

- `AGENTS.md` §5.1 row 13 (a full-bleed band, one line of display copy, a solid pill; the
  reference's reaching hands are the visual pun on *its* product name), §5.3 (the hands are in the
  "leave" list by name), §6.1 (monochrome — this is not a feature panel, so no hue at all), §6.2
  (two display steps; the closing line is `--text-headline`, because `--text-hero` belongs to the
  one `h1`), §6.3 (radii, hairlines, the one permitted shadow is the Ask bar's), **§6.4 (the Rail —
  the whole basis of this section)**, §7.1–7.3 (the motion budget is spent), §8 mapping table row
  "Closing CTA" ("Our own image concept — not hands"), §9–§13, §15.
- `.agents/skills/shadcn/rules/base-vs-radix.md` — `render`, not `asChild`; `nativeButton={false}`
  when a `Button` renders an anchor.

Deliberately **not** read, and why:

- The GSAP skills — nothing here animates in JavaScript (decision 4). The rail paint arriving is
  §7.3's second moment doing its existing job across a new marker.
- `node_modules/next/dist/docs/` — no image asset, no `next/image`, no routing, config, font,
  metadata, or server-boundary change.

## Existing code inspected

- **`app/layout.tsx`** — the load-bearing fact for this whole concept. `<Rail />` is rendered
  inside `<main>`, and `<SiteFooter />` sits **outside** it. The Rail is `absolute inset-0` against
  `<main>`, so the line's physical extent is exactly `<main>`'s height — and this section, as the
  last child of `main`, is where it stops. The terminus is therefore a true statement about the
  page's geometry, not a metaphor.
- `components/layout/rail.tsx` — the track, the paint, and the `z-10` note explaining that the rail
  paints *over* full-bleed section backgrounds on purpose ("the rail is the route, the slipstream is
  the ground it crosses"). This section relies on that: the band's fill must not cover the line.
  **Do not modify this file.**
- `components/layout/rail-station.tsx` — the marker this section's marker is a variant of: a node
  centred on the line at `left: var(--rail-x); margin-left: -3px`, with a Utility-face label 12px to
  its right, dropped below 640px. **Do not modify this file** — see decision 3.
- `app/globals.css` — `rail-station`, `rail-node`, `rail-offset`, `node-square` (7px), `--rail-x`,
  `--rail-gap`, `--station-lead`, `section-rhythm`, `anchor-offset`, `type-utility`,
  `--text-headline`. Note that `rail-node` sets `top: 0.38em` because it is tuned to a numeral's cap
  height — it is the wrong utility here (decision 3).
- `components/sections/hero.tsx` — the full-bleed idiom: a section is already viewport-wide, so a
  band needs no `w-screen` trick, and `w-screen` would add horizontal overflow equal to the
  scrollbar width, which §12 forbids outright.
- `components/sections/live-demo.tsx` and `components/sections/build-panel.tsx` — the CTA pattern
  (`Button variant="pill" size="pill" nativeButton={false} render={<a href={…} />}`) and the
  standing decision that a block the reference centres is left-aligned here.
- `lib/copy/build-guide.ts` — the copy-module pattern: one typed export with an explicit type
  annotation and a header comment stating whether §11.1 applies, phrased so §14's grep cannot match
  the comment.
- `app/page.tsx` — composition only. `<ClosingCta />` goes last, after `<Faq />`.

## Decisions and assumptions

### 1. The concept: the terminus

The reference closes with two blurred hands almost touching — a visual pun on *its* product name.
§5.3 names that artwork in the "leave" list, and the pun does not transfer to ours anyway.

Glidda's subject is a guided line (§6), and the page has spent its whole length building one: the
Rail enters at the hero, carries station markers at every section, and paints itself `--ink` behind
the reader as they descend. **This section is where the line arrives.** It is the only concept
available that pays off the element the entire page is built around, and it needs no new artwork,
no image asset, and no new texture.

Concretely: a full-bleed `--surface` band, the rail crossing it exactly as it crosses every other
section, and a **terminus marker** on the line — a node larger than a station's, with a Utility-face
label — with one line of display copy and the pill beside it.

The rejected alternative worth naming: a full-bleed slipstream band echoing the hero's. It would
bookend the page, but it repeats an effect the reader has already seen twice and says nothing new.
The terminus says something the page has been setting up for 4000px.

### 2. What the terminus honestly claims

A reviewer will ask whether the hairline visibly *stops* at the marker. It does not, and it must not
be made to.

The track runs the full height of `<main>`, so below the marker it continues through this section's
bottom padding before ending at `main`'s edge. Forcing a hard stop at the marker would mean either
covering the track with the band's fill — which fights `rail.tsx`'s deliberate `z-10` — or
shortening the track, which is a change to the Rail and out of scope.

So the marker means **last stop**, not truncation, which is what a terminus is in the signage
vocabulary §6 is drawn from. The line arriving at its final station and running a little past it
into the buffers is the correct reading, and it is also literally what the DOM does.

State this in the completion report rather than leaving a reviewer to discover it.

### 3. A new marker component, and no change to `rail-station.tsx`

The terminus is a station marker with a larger node. Three ways to get one, and only one is right:

- **Add a `terminus` prop to `RailStation`.** Rejected: it would put a boolean in a component used
  nine times to serve one caller.
- **Reuse `rail-node`.** Rejected: that utility sets `top: 0.38em` because prompt 10 tuned it to the
  cap height of a Display-face numeral, and it positions against its parent's font size. Neither is
  true here.
- **A new `RailTerminus` component with its own `rail-terminus` utility.** Chosen.

`rail-terminus` is `rail-station`'s geometry at 11px instead of 7px:

```css
/* The Rail's last stop (§6.4). `rail-station`'s geometry with a larger node — the half-node
   centring is therefore -5px, not -3px. Not `node-square`, which is fixed at 7px and is shared
   with the wordmark; a terminus that matched every other station would not read as an arrival. */
@utility rail-terminus {
  position: absolute;
  top: 0;
  left: var(--rail-x);
  margin-left: -5px;
  display: flex;
  align-items: center;
  gap: 12px;
}
```

with an 11px square drawn in the component. 11px keeps the marker on §6.3's 4px scale relative to
the 7px node (+4px) and stays small enough to read as a node rather than as a button.

`components/layout/rail-terminus.tsx` mirrors `rail-station.tsx` exactly otherwise: `aria-hidden`,
`pointer-events-none select-none`, label hidden below 640px (§6.4).

**`components/layout/rail-station.tsx` is not modified.** This section renders `RailTerminus`
*instead of* `RailStation`, not in addition to it — two markers at one section's top edge would be
a mistake, not emphasis.

### 4. Nothing animates

§7.3's three moments are spent and all three are built. This section adds none.

The moment a reader actually experiences here is the rail's paint reaching the terminus — which is
§7.3's second moment doing its existing job across a new marker, exactly as the Route section's
three step nodes do. Nothing in this prompt creates a tween, a timeline, or a ScrollTrigger, so
there is no `gsap.matchMedia()` branch to write and nothing that could be left frozen (§7.2).

The only motion is the pill's existing `--duration-micro` colour transition on hover.

Explicitly rejected: fading or scaling the terminus node in on scroll. It would be a fourth
scroll-linked moment, §7.3 requires a stated reason for one, and "the node could arrive" is not a
reason — the paint arriving *is* the arrival.

### 5. Left-aligned, and `--text-headline` not `--text-hero`

Left-aligned, following `live-demo.tsx`'s documented standing decision: this page has one strong
left edge and a centred block beside it reads as a mistake rather than as emphasis. Here the
argument is at its strongest — the section is *about* the left edge.

The closing line is an `<h2>` at `--text-headline`. §12 allows exactly one `h1` and the hero has it;
§6.2 gives the page two display steps and `--text-hero` belongs to that one `h1`. A closing line at
hero size would also compete with the hero across a single scroll of the page.

### 6. Nothing here is a fixture

§11.1 governs fabricated proof — customers, quotes, people, metrics. A closing line and a button
label are none of those. No fixture file, no flag, no marker chip, and the pre-deploy grep count is
unchanged at **seventeen**.

The closing line must not smuggle in a metric to add urgency. "Join 200 teams" and "be live in ten
minutes" are both fabricated proof wearing a CTA's clothes. Say what the reader gets, not how many
other people got it.

## Files likely to change

| File | Change |
| --- | --- |
| `lib/copy/closing-cta.ts` | new — station label, headline, CTA |
| `components/layout/rail-terminus.tsx` | new — the larger marker (server) |
| `components/sections/closing-cta.tsx` | new — the band (server) |
| `app/globals.css` | edit — the `rail-terminus` utility only |
| `app/page.tsx` | edit — `<ClosingCta />` last, and the outstanding-work comment emptied |

Explicitly **not** modified: `components/layout/rail.tsx`, `components/layout/rail-station.tsx`,
`components/layout/site-footer.tsx`, `app/layout.tsx`, `lib/gsap/*`, `lib/utils.ts` (no new
`--text-*` token, so §13's tailwind-merge list is untouched), `components/ui/*`, and everything
under `lib/copy/placeholder/`.

## Implementation requirements

### `lib/copy/closing-cta.ts`

One typed export, `closingCta`, explicit type annotation, header comment in the house pattern
stating §11.1 applies to none of it and phrased so §14's grep cannot match the comment.

```ts
export const closingCta: {
  station: string
  headline: string
  cta: NavLink        // reuse the type from lib/copy/shell
}
```

- `station`: `"Terminus"` — the signage voice, and the only place on the page that word appears. It
  is the Utility-face label beside the marker, and it is the payoff of the hero's `"Start"`.
- `headline`: `"See what your product looks like with a guide running on it."` One line, sentence
  case, no exclamation mark, no metric (§11, decision 6).
- `cta`: `{ label: "Start a guide", href: "#ask" }` — the same label and destination as the header
  pill, the hero primary, the live demo CTA, the Route CTA, and the build panel's CTA. The action
  keeps its name through the whole flow (§11).

### `components/layout/rail-terminus.tsx`

Server component. `{ label }: { label: string }`. Mirrors `rail-station.tsx`: `aria-hidden`,
`pointer-events-none select-none`, the `rail-terminus` utility on the root, an 11px `--ink` square
(`size-[11px] shrink-0 bg-ink` — not `node-square`, which is fixed at 7px), and the label in
`type-utility text-rail-muted hidden whitespace-nowrap sm:block`.

Its header comment states what it is, why it is not a prop on `RailStation`, and that the hairline
continues past it by design (decision 2).

### `components/sections/closing-cta.tsx`

Server component, exported as `ClosingCta`.

```
<section id="start" className="section-rhythm anchor-offset bg-surface">
  <div className="rail-offset relative">
    <RailTerminus label={closingCta.station} />
    <h2 className="max-w-[22ch] text-headline">{closingCta.headline}</h2>
    <div className="mt-10 flex flex-wrap">
      <Button variant="pill" size="pill" nativeButton={false}
              render={<a href={closingCta.cta.href} />}>
```

The band is full-bleed by being a section background — `bg-surface` on the `<section>`. No
`w-screen`, no negative margins, no full-bleed trick: the section is already viewport-wide and
`w-screen` would add horizontal overflow equal to the scrollbar width (§12).

The section carries `id="start"`, so the announcement bar and any future "get started" link have a
target that is not the Ask bar itself.

No hairline on the band. Its fill is its edge, and the section above it is `--ground`, so the tone
change alone draws the boundary (§6.3).

### `app/globals.css`

The `rail-terminus` utility exactly as written in decision 3, placed immediately after
`rail-station` so the two read as a pair. Nothing else in the file changes — no new colour, no new
type token, no new radius.

### `app/page.tsx`

One import and one element, `<ClosingCta />`, after `<Faq />`. The doc comment's outstanding list is
now empty, so replace it with a line stating that §8's structure is complete and that what remains
is §15's open decisions — do not delete the comment.

## Visual spec

**Band.** Full-bleed `--surface`, `section-rhythm` vertical padding (`clamp(112px, 13vw, 200px)`),
no radius, no hairline, no shadow. The rail crosses it, painted `--ink` by the time a reader is
here.

| Element | Face | Size | Colour | Notes |
| --- | --- | --- | --- | --- |
| Terminus node | — | 11px square | `--ink` | on the line, at the section's top edge |
| Terminus label | Utility | `--text-eyebrow` 11px | `--rail-muted` | 12px right of the node; hidden below 640px (§6.4) |
| Headline (`h2`) | Display | `--text-headline` | `--ink` | `max-w-[22ch]`, left-aligned, hangs off the rail |
| CTA | Body 500 | `--text-body` | `--paper` on `--ink` | existing `pill` variant, `--radius-pill`, `mt-10` |

**Colour.** `--ink`, `--surface`, `--rail`, `--rail-muted`, `--paper`. Nothing else. No route hue,
no `--signal`, not on the node, the label, the fill, or the focus ring (§6.1).

**Responsive.** 360 — one column, label hidden, node still on the line at `--rail-x: 4px`, headline
wraps to three or four lines, pill not clipped by the fixed Ask bar. 768 / 1024 — label visible,
`--station-lead` reserving its row. 1440 — 1200px shell; the band's fill runs the full viewport
width while its content stays in the shell, which is the point of the full-bleed.

**States.** CTA: the existing pill hover and `focusRing`, never removed. The terminus has no state —
it is not a control.

## Motion spec

| What | Trigger | Duration | Ease | Reduced motion (§7.2) |
| --- | --- | --- | --- | --- |
| Rail paint arriving at the terminus | existing page scrub (§7.3 #2) | — | — | already handled in `rail.tsx` |
| CTA hover / focus | hover, focus-visible | `--duration-micro` | `--ease-entrance` | unchanged — a colour change is not motion |

Nothing else. No timeline, no ScrollTrigger, no tween, no GSAP import in any file added by this
prompt.

## Accessibility requirements

- One `<h2>`; still exactly one `<h1>` on the page, in the hero.
- The terminus marker is `aria-hidden` and `pointer-events-none`, like every other rail element
  (§12). Its label repeats nothing a screen reader needs.
- The CTA is a real anchor through `Button` with `nativeButton={false}`, reachable by Tab, visible
  focus ring, and it moves focus to the Ask bar via `#ask` like every other primary CTA.
- Contrast: the headline is `--ink` on `--surface`; the label is `--rail-muted`, 5.41:1 on
  `--surface`. `--rail` carries no text.
- No horizontal page scroll at any width — specifically, no `w-screen` anywhere.
- The band is the last thing before the footer, and the footer already reserves `ask-bar-reserve`,
  so the fixed Ask bar cannot cover the CTA at the bottom of the page. Confirm this at 360px rather
  than assuming it.
- With JavaScript disabled the section renders in full and the CTA still navigates.

## Acceptance criteria

1. The band renders at 360, 768, 1024, and 1440px with no horizontal page scroll at any width.
2. The band's fill spans the full viewport width while its content stays inside the 1200px shell.
3. The terminus node sits **on** the rail at every width, is visibly larger than a station node, and
   carries its label above 640px only.
4. The rail's paint reaches the terminus as the reader arrives, using the existing scrub — no new
   ScrollTrigger exists anywhere in the section.
5. `components/layout/rail.tsx` and `components/layout/rail-station.tsx` are unmodified.
6. The section renders `RailTerminus` and not `RailStation`; there is exactly one marker at its top.
7. The CTA reads "Start a guide" and points at `#ask`, verbatim matching the other five primaries.
8. Heading order holds: one `h1` on the page, this section contributes one `h2`.
9. No colour but `--ink`, `--surface`, `--rail`, `--rail-muted`, `--paper` appears in the section,
   and no hex literal appears in any file added by this prompt.
10. No file added by this prompt imports GSAP or `motion`, and no `w-screen` appears anywhere.
11. `grep -rn "placeholder: true" lib/copy/` still returns **seventeen** hits — unchanged.
12. `app/page.tsx` gains one import and one element and still contains no layout maths, copy, or
    animation.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
```

`build` because `app/page.tsx` — a route file — changes.

Paste the real output of all four. **The lint bar:** exactly three pre-existing errors, one each in
`components/layout/wordmark.tsx`, `components/ui/carousel.tsx`, and `hooks/use-mobile.ts` — the same
three files, not merely the same count. Any new error is a failure, including in a new file.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **Scroll the whole page to the bottom at 1440px.** Watch the rail's paint arrive at the terminus.
   That is the entire concept — if the marker does not read as an arrival, the node is too small or
   the label is wrong, and both are one-line changes.
2. **The band's edge.** The `--ground` → `--surface` boundary should read as a change of ground, not
   as a card. If it reads as a card, the section has picked up a radius it should not have.
3. **The hairline past the marker** (decision 2). Confirm it continues to the footer edge and that
   this reads as buffers rather than as a bug. If it genuinely reads as a bug, say so — the fix is a
   change to the Rail and belongs in its own prompt, not a patch here.
4. **360px.** Node still on the line, label gone, headline wrapping cleanly, and — specifically —
   the fixed Ask bar not covering the pill when the page is scrolled to the very bottom.
5. **Tab to the end of the page.** The CTA takes focus with a visible ring, and activating it moves
   focus into the Ask bar.
6. **Reduced motion.** Nothing in this section should behave differently, because nothing in it
   moves.
7. **Read the closing line cold.** It is the last sentence on the page. If it does not make you want
   to press the button beside it, it is one string in `lib/copy/closing-cta.ts`.

## Open questions this raises for later prompts

- **Whether the rail should physically stop at the terminus.** Decision 2 says it should not, and
  says why. If review disagrees, that is a change to `rail.tsx`'s track height and it needs its own
  prompt — do not patch it from this section.
- **§8 is structurally complete after this.** Everything outstanding is §15: swapping the seventeen
  fixtures, correcting the `cdn.glidda.com` host in the Route snippet, designing the post-submit Ask
  bar UI and its backend, and either removing the unused `motion` package or documenting where each
  library is used. None of those is a section; each is its own decision.
- **The Glidda mark (§15)** is still undesigned. The header still carries a text-only wordmark, and
  the interchange in the build panel is one section's illustration, not a logo.
