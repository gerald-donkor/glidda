# 22 — Reference motion conformance

## Goal

Bring the landing page's motion into line with what `ref/fullanimations.webm` actually does, using
measured timings rather than estimated ones. Three behaviours differ from the reference; two of them
are behaviours AGENTS.md currently documents **incorrectly**, so the doc is corrected in the same
commit as the code.

This is a motion-conformance pass, not a visual one. Section 5.3's "leave" list is untouched: no
artwork, wordmark, logo, headline, quote, statistic, or copy from handhold.io comes across. The
slipstream stays the slipstream, the rail stays monochrome, the closing CTA stays our terminus.

## Skills and docs read

- `.agents/skills/gsap-react` — `useGSAP`, scope, `contextSafe`, cleanup on unmount, no GSAP during
  SSR. Required for every animation in this repo (§3).
- `lib/gsap/motion.ts` and `lib/gsap/register.ts` — the existing constant and plugin surface.
- AGENTS.md §5.1, §5.2, §5.3, §6, §7, §8, §9, §11.1, §12, §13.

No Next.js docs read: nothing here touches routing, server/client boundaries beyond adding one
client provider, fonts, images, metadata, or config.

## Existing code inspected

- `components/motion/vignette.tsx` — two scenes per section on an independent 13s repeating timeline,
  with its own `ScrollTrigger` for offscreen pausing.
- `components/motion/vignette-parts.tsx` — `Bubble`, `Chip`, `Field`, `Cursor`, `WireCard`.
- `components/sections/capability-accordion.tsx` — owns `openIndex`, the `scaleX` underline sweep
  that *is* the dwell timer, hold-on-hover/focus, and offscreen pause.
- `components/sections/capability-section.tsx` — server component; accordion and panel are the two
  client boundaries.
- `components/sections/logo-band.tsx` — static responsive grid, with a comment citing §5.1.
- `components/motion/reveal.tsx` — the §7.3 #4 section arrival, just landed in prompt 21.
- `lib/copy/capabilities.ts`, `lib/copy/placeholder/vignette.ts`.

## Method — how the numbers were measured

All figures below were measured off `ref/fullanimations.webm` (1145×758, 240s, 60fps), not estimated.

- **Event cadence** via ffmpeg scene detection on a cropped region:
  `-vf "crop=W:H:X:Y,select='gt(scene,T)',metadata=print"`, run over windows where the page is
  parked and not scrolling.
- **Marquee velocity** by sampling the logo band at 4fps and reading one wordmark's x position
  across five consecutive frames.
- **Scene coupling** by extracting single frames either side of a measured accordion beat.

Windows polluted by the recordist's scrolling were discarded; every interval quoted comes from a
window where the page is stationary.

## Findings

| # | Behaviour | Reference (measured) | Repo today | Verdict |
|---|---|---|---|---|
| 1 | Accordion auto-advance dwell | **8.0s** — intervals 8.036, 8.035, 8.055, 7.984 over a 46s parked window | `CAPABILITY.dwell = 5` | Change |
| 2 | Panel vignette | **One scene per accordion row**, swapping on the same 8.0s beat | Two scenes, independent 13s loop | Change |
| 3 | Logo band | **Marquee, ~17 px/s leftward**, soft opacity fade at both edges | Static grid | Change |
| 4 | Within-scene item entrance | ~2.26s between items (mean of 17 intervals, 2.19–2.34) | `STAGGER` 0.06s | See decision 4 |
| 5 | Hero ribbon | Continuous horizontal phase drift, never hard-resets | Slipstream, 3 layers at [20, 15.5, 11]s | No change |
| 6 | Section arrivals, rail, testimonial crossfade, FAQ, Ask bar typewriter and focus expansion | Present | Present | No change |

**Finding 2 is the significant one.** At the beat at t≈111.75s the onboarding panel swapped from a
wireframe with a "Mapping the product…" status chip — matching the open row *"Knows your product
inside out"* — to a wireframe with a pointer and a floating agent card, matching the row that had
just opened, *"Navigates directly inside your UI"*. The panel illustrates the open sentence. Two
crops confirm it, and the accordion beat timestamps appear in the vignette region's change log at
exactly the 8.04s cadence, interleaved with the slower within-scene cadence.

AGENTS.md §5.2 states the opposite — *"the panel vignette runs its own independent loop and does not
reset when the accordion row changes"* — and `vignette.tsx:22-24` cites that line as the reason for
the current design. §5.1 likewise records the logo band as *"Static in the recording — no marquee
scroll observed."* Both statements are wrong and both must be corrected, or the next agent will read
the doc and undo this work.

## Decisions and assumptions

1. **"Exactly as in the reference" is read as motion, not artwork.** The user's instruction was about
   the animations. §5.3's "leave" list is a separate, still-binding constraint on visual identity and
   was not raised; nothing in this prompt copies their ribbon, bust, hands, circles, logos, or copy.
   If a wider visual adoption is wanted, that is a different prompt.
2. **The marquee is ambient texture, not a fifth orchestrated moment (§7.3).** It is in the same
   class as the slipstream: a continuous transform-only loop with no trigger, no sequence, and no
   arrival. §7.3's cap governs orchestrated moments, and this adds none.
3. **The vignette gets simpler, not more complex.** Driven by the row index it loses its repeating
   master timeline and its own `ScrollTrigger` entirely — the accordion already pauses its timer
   offscreen and on hover/focus, so the panel inherits all of that for free and the two can no
   longer drift out of sync.
4. **Finding 4 is not adopted as a stagger.** 2.26s between items is not an entrance stagger; it is
   the reference's scene playing out as a scripted sequence over its 8s dwell. Matching it would mean
   rebuilding each scene as its own sub-timeline, which is a much larger change than this prompt, and
   §7.1 caps entrance stagger at 0.06s. Scene items keep `STAGGER`; the scene arrives as a unit. Flag
   this in the completion report as the one measured behaviour deliberately not matched.
5. **Pause-on-hover is added to the marquee, which the reference does not do.** §12 is a quality
   floor and WCAG 2.2.2 applies to content that moves automatically for more than five seconds
   alongside other content. This is the one deliberate deviation from "exactly as observed", and the
   reason is accessibility, not preference.
6. **No new copy fixtures.** Every section's existing `VignetteCopy` already carries bubbles, fields,
   a tour caption, and an agent card — enough for three distinct scenes per section with nothing
   invented. `placeholder: true` count does not change.

## Files likely to change

```
AGENTS.md                                       §5.1, §5.2 corrections; §7.3 note
lib/gsap/motion.ts                              CAPABILITY.dwell, vignette constants, MARQUEE
components/sections/capability-row-context.tsx  NEW — shared open-row state
components/sections/capability-section.tsx      wrap both columns in the provider
components/sections/capability-accordion.tsx    read/write row state from context
components/motion/vignette.tsx                  one scene per row; drop master loop + ScrollTrigger
components/motion/logo-marquee.tsx              NEW — the seamless track
components/sections/logo-band.tsx               render the marquee
app/globals.css                                 marquee edge-fade mask
```

## Implementation requirements

### A. Accordion dwell

`CAPABILITY.dwell: 5` → `8`. Update its comment to cite the measurement, not a guess. Nothing else
in the accordion changes: the underline sweep is still the timer, still `scaleX`, still
`EASE.linear`, and still calls `advance` on complete. Full cycle becomes 24s per section.

### B. Vignette coupled to the open row

**New `components/sections/capability-row-context.tsx`** — `"use client"`. A provider holding
`{ openIndex, setOpenIndex }` and a `useCapabilityRow()` hook. Children arrive as `children` and are
rendered on the server and passed in, exactly as `Reveal` and `HeroEntrance` do, so
`capability-section.tsx` stays a server component and only the provider joins the client bundle.

**`capability-section.tsx`** — wrap the two-column grid in the provider. Layout, `side` handling, and
DOM order are unchanged.

**`capability-accordion.tsx`** — `openIndex` moves from local `useState` to the context. The timer,
hold, visibility, and `revertOnUpdate` behaviour are otherwise untouched.

**`vignette.tsx`** — three scenes per section, one per row, rendered by index:

| Section | Row 1 | Row 2 | Row 3 |
|---|---|---|---|
| Answers | `ChatScene` (field) — *Answers in context* | `ChatScene` (choice) — *Knows what it does not know* | `InfoScene` — *Carries the thread* |
| Demos | `TourScene` — *Drives the real interface* | `ChatScene` (field) — *Adapts to what they ask* | `AgentCardScene` — *Hands off when they are ready* |
| Onboarding | `TourScene` — *Knows the product* | `AgentCardScene` — *Walks them through it* | `InfoScene` — *Follows up on what stalled* |

Onboarding's mapping mirrors the reference's own sequence, and `onboardingVignette`'s existing
`infoLabel: "Day 3"` / `fields: [… "Setup half done"]` already reads as a follow-up.

Motion on scene change, in a `useGSAP` keyed to `openIndex` with `revertOnUpdate: true`:

- Outgoing scene: `autoAlpha` → 0 over `DURATION.micro`.
- Incoming scene: `autoAlpha` 0 → 1 over `DURATION.entrance`, `EASE.entrance`, starting at
  `TESTIMONIAL.overlap` so the two never blink the panel empty — the same overlap the carousel uses.
- Scene items: `[data-item]` from `y: CAPABILITY.vignetteRise`, `stagger: STAGGER`, capped at six.
- `AgentCardScene`'s `[data-progress]` bar sweeps `scaleX` 0.15 → 0.85 across the dwell.

Delete the master repeat timeline, the `ScrollTrigger`, and `CAPABILITY.vignette`. Only the scene
currently open is rendered, so all three scenes no longer sit stacked in the DOM.

**Reduced motion (§7.2):** the row still advances and the scene still swaps — the swap becomes a
plain opacity crossfade at identical timing, `vignetteRise` drops to 0, and the progress bar is set
to its end state rather than swept. Nothing keeps moving and nothing becomes unusable.

The panel stays `aria-hidden` (§12); the `PlaceholderChip` stays outside that subtree.

### C. Logo band marquee

**New `components/motion/logo-marquee.tsx`** — `"use client"`.

- The seven names render **twice**. The first copy is the real list; the duplicate carries
  `aria-hidden` so the accessibility tree still contains exactly seven names.
- One tween: `xPercent: 0 → -50` on the track, `repeat: -1`, `ease: "none"`. Transform only (§7.1).
- **Duration is derived, not hardcoded.** Measure the first copy's width and compute
  `width / MARQUEE.speed` so the on-screen velocity is ~17 px/s regardless of how the seven names
  measure at the current breakpoint and font size. Recompute on resize; do it inside
  `gsap.matchMedia()` so the revert is automatic.
- Pause on hover and on focus-within (decision 5); resume on leave/blur.
- Pause offscreen with a `ScrollTrigger` created inside `useGSAP`, matching the accordion's pattern.
- Reduced motion: no tween at all. The row renders static and the duplicate copy is not rendered, so
  a reduced-motion reader gets the plain seven-name list.

**`lib/gsap/motion.ts`** — add:

```ts
/** The logo band's marquee (§5.1). Speed, not duration: the track's width depends on the
 *  breakpoint and the loaded face, and a fixed duration would make the band visibly faster on
 *  mobile. Measured off ref/fullanimations.webm at ~17px/s leftward. */
export const MARQUEE = { speed: 17 } as const
```

**`app/globals.css`** — an edge fade via `mask-image: linear-gradient(...)` on the marquee's
overflow container, ~48px at each end, matching the reference's faded partial items. A mask, not an
animated property.

**`logo-band.tsx`** — replace the responsive grid with the marquee at every width; a marquee needs no
breakpoint fallback since it already handles any track width. Keep the `sr-only` heading, keep the
`PlaceholderChip`, keep `section-rhythm-tight`, keep the `Reveal` wrapper. Correct the file comment —
it currently cites §5.1's now-corrected claim. The band still arrives as one block, not seven
staggered names.

### D. AGENTS.md corrections

- **§5.1, logo band** — replace "Static in the recording — no marquee scroll observed" with the
  measured marquee, its direction, its speed, and the edge fade.
- **§5.1, feature sections** — the panel vignette is driven by the open accordion row, one scene per
  row, on the same timer.
- **§5.2** — replace "The panel vignette runs its own independent loop and does *not* reset when the
  accordion row changes" with the measured coupling. Record the 8.0s dwell.
- **§7.3 #3** — restate: the vignettes are row-driven, not independently looping.
- Add a dated line noting these came from `ref/fullanimations.webm` and that §5.3 is unchanged, in
  the style of the existing "2026-07-26 — approved structural revision" note.

## Accessibility requirements

- The seven company names appear exactly once in the accessibility tree; the duplicated marquee track
  is `aria-hidden`.
- The marquee pauses on hover and on keyboard focus entering it, and is static under
  `prefers-reduced-motion: reduce`.
- The vignette remains `aria-hidden`; its swap announces nothing.
- The accordion keeps its Base UI `aria-expanded` / `aria-controls` wiring, its visible focus ring,
  and full keyboard operation. The longer dwell must not change tab order or trap focus.
- No horizontal page scroll at any width — the marquee scrolls inside its own container (§12).
- Semantic heading order unchanged; still one `h1`.

## Acceptance criteria

1. The accordion advances every 8.0s, and the underline sweep still completes exactly as it advances.
2. Changing the open row — by timer, hover, or keyboard — changes the panel's scene, in all three
   sections, in both directions.
3. Each section shows three distinct scenes across a full 24s cycle.
4. The logo band scrolls left at ~17px/s, seamlessly, with no visible seam at the wrap and no jump on
   resize.
5. Under `prefers-reduced-motion: reduce`: the band is static, the rows still advance, the scenes
   still swap, nothing is frozen mid-tween, nothing keeps moving.
6. With JavaScript disabled the logo band shows seven readable names and every section is visible.
7. No `ScrollTrigger` or tween survives unmount.
8. `placeholder: true` count in `lib/copy/` is unchanged.
9. AGENTS.md no longer contains either corrected claim.

## Checks to run

- `npm run typecheck` — must be clean.
- `npm run lint` — baseline is three pre-existing errors in `wordmark.tsx`, `carousel.tsx`, and
  `use-mobile.ts`. Same three files, no new ones (§14).
- `npm run check:responsive` — **required**: the logo band's markup changes.
- `npm run build` — not required; no route, config, font, or server module changes.

## Manual review steps

1. `npm run dev`, open `/`.
2. Scroll to Answers. Watch one full 24s cycle without touching anything: three rows, three scenes,
   the underline completing as each row hands over.
3. Hover a closed row — it opens immediately, the scene follows, the timer holds. Move away, the
   timer resumes.
4. Tab into the accordion and arrow between rows; confirm the scene follows keyboard focus.
5. Repeat 2–4 on Demos and Onboarding, confirming nine distinct scenes overall.
6. Watch the logo band through a full wrap; look specifically for a seam or a jump.
7. Hover the band — it stops. Move away — it resumes.
8. Resize 1440 → 768 → 360 and confirm the band's speed looks unchanged and no horizontal scroll
   appears at any width.
9. Toggle the OS reduced-motion setting and repeat 2 and 6.
10. Disable JavaScript and reload; confirm seven names and twelve visible sections.
