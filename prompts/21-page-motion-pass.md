# 21 — A motion pass: section arrivals, hover polish, and station nodes

## Goal

Three related pieces of motion, in one prompt because they are one pass over the same page and
share one set of constants:

1. **Section arrivals.** Twelve sections below the hero currently appear with no acknowledgement at
   all. A short opacity + rise as each enters the viewport.
2. **Hover and focus polish.** The logo band, proof stats, capability cards, build panel,
   testimonial arrows, and closing CTA have no hover state today.
3. **Station arrival.** The rail's station nodes are static markup. They should arrive with the
   section they mark, on the same trigger.

**Piece 1 is a fourth ambient category and §7.3 permits exactly three.** That is the central
decision in this prompt and it is argued, not assumed, in decision 1. §7.3 must be amended in the
same change — the repo has declined a fourth moment twice on the record
(`components/sections/logo-band.tsx:17`, `lib/gsap/motion.ts:76-78`), and code that contradicts
`AGENTS.md` is the exact class of falsehood prompt 20 just spent a commit removing.

Out of scope: any new section, any copy change, any token change, the Ask bar, the vignettes, the
slipstream, the accordion's timer, the carousel's crossfade, and the three §7.3 moments themselves
— none of which is retimed, re-eased, or touched. No new dependency. No change to
`app/page.tsx`'s composition.

## Skills and docs read

- **`.agents/skills/gsap-react`** — `useGSAP` with a `scope` ref, automatic revert on unmount,
  `contextSafe` for handlers created after the hook runs, and the rule that GSAP never executes
  during SSR. Every animation in this repo is required to use it (§3).
- **`.agents/skills/gsap-scrolltrigger`** — `once: true` (kills the trigger after it fires),
  `toggleActions` vs `scrub` (never both), `start` in `"trigger viewport"` form, creating triggers
  in top-to-bottom page order or setting `refreshPriority`, and `ScrollTrigger.refresh()` after
  layout changes such as fonts landing. Also `ScrollTrigger.batch()`, which decision 4 rejects.
- **`node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`,
  line 178** — the fact this whole design rests on: *"It does not apply to Server Components passed
  as children or other props. Those components are not imported into the Client Component's module
  graph. They are rendered on the server and passed to the Client Component as rendered output."*
  A client wrapper taking `children` therefore does **not** pull the section into the client bundle.
  Line 299 names it the "slot" pattern. This is exactly what `HeroEntrance` already does.
- `AGENTS.md` §6.1 (the chrome is monochrome — a hover may not introduce colour), §6.4 (the rail
  and its stations), §7.1 (transform and opacity only; durations; easings; stagger ≤6; plugins
  registered once), §7.2 (the reduced-motion branch, per category), §7.3 (three moments — the rule
  being amended), §12 (**the page must be readable and navigable with JavaScript disabled**),
  §13 (no `any`, centralise magic numbers, no unrelated refactors).

**Not read, and why:** no `shadcn` skill — no primitive is added or extended, and the hover work is
Tailwind utilities on existing markup. No `gsap-plugins` — ScrollTrigger is already registered in
`lib/gsap/register.ts` and no second plugin is introduced. No `gsap-timeline` — each arrival is a
single tween, not a sequence; the one timeline in this repo stays in `HeroEntrance`.

## Existing code inspected

- **`lib/gsap/register.ts`** — the single `registerPlugin(useGSAP, ScrollTrigger)` site. Every
  animated component imports `gsap`, `ScrollTrigger`, and `useGSAP` from here. New code does the
  same and does not call `registerPlugin` itself.
- **`lib/gsap/motion.ts`** (106 lines, read in full) — `DURATION.micro` 0.2 / `DURATION.entrance`
  0.6, `EASE.entrance` `power2.out`, `EASE.linear` `"none"`, `STAGGER` 0.06, and the per-feature
  blocks `HERO`, `CAPABILITY`, `TESTIMONIAL`, `SLIPSTREAM`, `TYPEWRITER`. **`HERO.rise` is 24px**
  and its comment already states the §7.2 rule this prompt reuses: the offset drops to 0 in the
  reduced branch while the timing stays identical. A new `REVEAL` block belongs here and nowhere
  else.
- **`components/sections/hero-entrance.tsx`** — the pattern to copy exactly: `"use client"`, a
  `rootRef`, `useGSAP` with `{ scope: rootRef }`, `gsap.matchMedia()` with `motion`/`reduced`
  conditions, `return () => mm.revert()`, and **`fromTo` rather than `from`**, because the CSS has
  already set `opacity: 0` and a `from` tween would animate 0 → 0. Children arrive through
  `children` and stay server-rendered.
- **`app/globals.css:735-738`** — `@media (scripting: enabled) { [data-hero] { opacity: 0 } }`,
  with a comment at :730 explaining it: the rule applies only where a script exists to undo it, so
  with JavaScript off it never matches and the content is simply visible. **This is the single most
  important thing in this prompt to get right** (decision 3).
- **`components/layout/rail.tsx`** — the paint is a `scaleY` 0→1 scrubbed against `<main>` from
  `top center` to `bottom center`, plus the hero's retreating lead. Untouched here.
- **`components/layout/rail-station.tsx`** — 21 lines, a **server component**: a `node-square` span
  plus a Utility-face label, `aria-hidden`, label hidden below 640px. Rendered by each section, not
  by the Rail, so markers exist in the server HTML (prompt 03, decision 3).
- **`components/sections/capability-panel.tsx`** — already carries the panel along the rail
  (`CAPABILITY.drift`, 32px, scrubbed). Confirms the house pattern for a scroll-linked tween and is
  **not** modified.
- **Section structure**, verified across `logo-band.tsx` and `section-intro.tsx` and consistent:
  `<section class="section-rhythm anchor-offset">` → `<div class="rail-offset relative">` →
  content. Sections are server components with no client boundary today.
- **`components/sections/logo-band.tsx:17`** — *"§7.3 has no room for a fourth animated moment."*
  **`lib/gsap/motion.ts:76-78`** — *"Not a fourth orchestrated moment (§7.3)."* Both are arguments
  against this prompt, written into the repo by earlier prompts, and both must be revisited rather
  than left standing (decision 1).
- Which sections render a `<RailStation>` and which deliberately do not (the logo band and the
  section intro both document why they do not) — **the implementer must enumerate this from the
  code**; this prompt does not list it, and no section gains or loses a station.

## Decisions and assumptions

### 1. The fourth category, argued

**The case against, first, because it is real.** §6 and §7 are built on restraint: two display
steps, one accent confined to panels, three orchestrated moments, everything else a 0.2s hover.
"Every section fades in on scroll" is the most templated pattern on the web, and a page whose whole
character is calm has more to lose from it than most. Two earlier prompts looked at this and said
no.

**The case for.** All three of §7.3's moments are *local*: the hero at load, the vignettes inside
panels, and the rail — which is the only one that spans the page. The rail paints continuously past
twelve sections that never acknowledge it. That is the specific gap: the page's signature element
asserts travel, and nothing along the route responds to arriving. An entrance here is not
decoration on a section, it is the rail's progress meaning something.

**What keeps it from being the templated version**, and these are requirements, not aspirations:

- **One reveal per section, not per element.** A section arrives as a block. Stagger is allowed
  only where a section has a genuine set of siblings — the logo band's seven wordmarks, the proof
  band's two stats, the three capability cards — and never beyond six items (§7.1). A page where
  every heading, paragraph, and button arrives separately is the failure mode.
- **16px, not 40px.** Small enough to register as arrival rather than as travel. `HERO.rise` is
  24px and the hero is the loudest thing on the page; a section below it must be quieter, not
  equal.
- **`once: true`.** Nothing re-animates on scroll back. Content that fades out when you scroll up
  past it is actively hostile to re-reading, and it makes the page feel unstable.
- **Never on the rail, the slipstream, or a vignette.** Those already move.

**§7.3 is amended, not exceeded.** Add a fourth entry naming this category, its spec, and its
reduced-motion branch, and update the two code comments above so the repo stops arguing with
itself. If the human reads decision 1 and disagrees, **cut piece 1 and keep pieces 2 and 3** — they
stand on their own and need no amendment.

### 2. One `<Reveal>` wrapper, not twelve implementations

A single client component in `components/motion/reveal.tsx` taking `children`, following
`HeroEntrance` exactly. Per the Next doc at line 178, children passed as props are rendered on the
server and handed over as output, so **every section stays a server component** and nothing but
this one wrapper joins the client bundle.

```tsx
<Reveal>            // the section's inner content
<Reveal stagger>    // where the section has ≤6 real siblings to stagger
```

Rejected: putting `useGSAP` in each section (twelve client components, twelve copies of the
matchMedia branch); a single page-level controller (it would need to know every section's DOM, and
`app/page.tsx` composes and nothing else, §9).

**Where the wrapper goes in the markup** is a real choice with a visible consequence. It wraps the
inner `<div class="rail-offset relative">`, **not** the `<section>` — §13 puts section spacing on
the section element only, and animating the element that owns the vertical rhythm would move the
spacing along with the content. The `<section>` keeps its rhythm and stays put; its contents
arrive.

### 3. No-JS safety is the one thing that must not be got wrong

§12 requires the page readable with JavaScript disabled. If the reveal sets `opacity: 0` in plain
CSS, a visitor without JavaScript gets twelve blank sections and a hero — a catastrophically worse
page than no animation at all.

Reuse the existing mechanism exactly: a `[data-reveal] { opacity: 0 }` rule **inside
`@media (scripting: enabled)`** in `app/globals.css`, next to the `[data-hero]` rule and sharing
its comment. The tween is `fromTo`, never `from`, for the reason already written at
`globals.css:730`. Do not invent a second mechanism, do not use `visibility`, and do not gate on a
hydration flag — the comment there explains why `scripting: enabled` beats that.

**Verify it by actually disabling JavaScript**, not by reasoning about it. It is acceptance
criterion 6 and it is not optional.

### 4. `once: true` per section, not `ScrollTrigger.batch()`

`batch()` coordinates elements that enter together and would be the right tool for a grid of cards.
It is the wrong tool here: each `<Reveal>` is its own component instance with its own scope, and
batching across them would need a central registry of every section — reintroducing the page-level
controller decision 2 rejected. Twelve triggers, each with `once: true` so it kills itself after
firing, is the cheaper thing in practice and by far the simpler thing to read.

`start: "top 85%"` — the element's top reaching 85% down the viewport. Late enough that the content
is genuinely arriving, early enough that it is never still fading while being read. It is
deliberately *not* the rail's `top center`: the paint tracks the viewport midpoint, and revealing
there would mean content appearing when it is already half-read.

Create them in page order (the natural result of `app/page.tsx`'s composition order), per the
skill's refresh-order rule, so no `refreshPriority` is needed. Say so in a comment.

**Fonts:** three faces load through `next/font`, and metrics before they land are not the metrics
that ship. The skill requires `ScrollTrigger.refresh()` after layout-affecting changes. Check
whether anything in the repo already does this; if not, one `document.fonts.ready.then(() =>
ScrollTrigger.refresh())` belongs in `Reveal`, guarded so it runs once per page rather than once
per instance.

### 5. Hover polish is CSS, not GSAP

§7.1's micro-interaction budget is 0.15–0.25s, and the repo already does its hovers as Tailwind
`transition` utilities (`site-header.tsx`, `site-footer.tsx`, `announcement-bar.tsx`,
`faq-accordion.tsx`). Adding GSAP for a hover would be a second mechanism for a solved problem, and
a tween per pointerenter on a page with this many targets is worse, not better.

**Constraints, from §6.1 and §12:**

- **No colour.** The chrome is monochrome; a hover may change opacity, a `--surface` background, a
  border tone, or a small transform. It may not introduce a hue, and `--signal` is not a hover
  colour.
- **Never remove a focus outline without replacing it** (§12). Add `focus-visible` alongside
  `hover`, do not substitute one for the other, and check every target is reachable by Tab.
- **Transform and opacity for anything that moves** (§7.1). A background or border colour
  transition is permitted — it is a paint change, not a layout one — but nothing may transition
  `width`, `height`, `margin`, or `box-shadow`.
- Match `--duration-micro` / `DURATION.micro`. Do not introduce a new duration literal.

Targets: the logo band's wordmarks, the proof band's stats, the capability cards, the build panel's
input and button, the testimonial arrows, the closing CTA, and `copy-embed`'s copy control.
**Enumerate what already has a hover before adding one** — several do, and duplicating an existing
`transition` class is the "unrelated refactor" §13 forbids.

### 6. Station arrival rides the section's trigger

The obvious implementation — animating `RailStation` — would turn a 21-line server component into
twelve client components for one 0.3s node scale. Instead, the station is inside the section's
`rail-offset` wrapper, so it is already inside `<Reveal>`. Give the node a `data-reveal-node`
attribute and let the section's existing tween scale it from `0.6` and fade it in, slightly ahead
of the content.

`RailStation` therefore **stays a server component** and gains one attribute, nothing else.
`scale` is a transform (§7.1). If the DOM turns out not to place the station inside the wrapper,
**say so and stop** rather than restructuring a section's markup to make the animation possible —
that would be motion dictating layout.

### 7. Constants go in `lib/gsap/motion.ts`

A new `REVEAL` block beside `HERO` and `CAPABILITY`, in the same commented style:

| Name | Value | Note |
| --- | --- | --- |
| `rise` | 16 | px. Below `HERO.rise`'s 24 deliberately — see decision 1. Drops to 0 when reduced. |
| `start` | `"top 85%"` | The trigger point, written once. |
| `nodeScale` | 0.6 | The station node's start scale. |
| `nodeLead` | 0.08 | s the node precedes the content by. |

Duration is `DURATION.entrance`, ease is `EASE.entrance`, stagger is `STAGGER`. **Do not introduce
new values for these** — the whole point of the file is that a duration is written once (§13).

## Files likely to change

| File | Change |
| --- | --- |
| `components/motion/reveal.tsx` | **new** — the wrapper, the only new file |
| `lib/gsap/motion.ts` | add the `REVEAL` block; amend the comment at :76-78 |
| `app/globals.css` | one `[data-reveal]` rule inside the existing `@media (scripting: enabled)` block |
| `components/sections/*.tsx` | wrap inner content in `<Reveal>`; add hover utilities. **Markup structure otherwise unchanged** |
| `components/layout/rail-station.tsx` | one `data-reveal-node` attribute |
| `components/sections/logo-band.tsx` | the comment at :17 stops being true |
| `AGENTS.md` | §7.3 gains a fourth entry (decision 1) |

Explicitly **not** modified: `app/page.tsx`, `app/layout.tsx`, `components/layout/rail.tsx`,
`components/motion/slipstream.tsx`, `components/motion/vignette.tsx`,
`components/sections/hero-entrance.tsx`, `components/sections/capability-panel.tsx`,
`components/ask/*`, `lib/copy/*`, `components/ui/*`, `lib/gsap/register.ts`, `package.json`.

## Visual spec

Nothing changes at rest. Every section's final state — position, spacing, type scale, colour — is
byte-identical to today; the reveal only governs how it gets there, and the hover states only
appear under a pointer.

- **Arrival:** `opacity 0 → 1`, `y 16px → 0`, 0.6s, `power2.out`, once. Staggered at 0.06s only
  where decision 1 permits, never more than six items.
- **Station node:** `scale 0.6 → 1`, `opacity 0 → 1`, starting 0.08s before its section's content.
- **Hover:** a `--surface` background, a `--rail` border, or an opacity shift, over 0.2s. No hue,
  no shadow, no size change.
- **Widths:** the reveal is identical at 360, 768, 1024, and 1440 — it is not a breakpoint-
  dependent effect, and it must not introduce horizontal overflow at any of them. A 16px `y`
  offset cannot, but the guard runs anyway (acceptance criterion 4).

## Motion spec

| | Trigger | Duration | Ease | Stagger | Reduced |
| --- | --- | --- | --- | --- | --- |
| Section arrival | `top 85%`, `once: true` | 0.6s | `power2.out` | 0.06s, ≤6, only where sibling sets exist | `rise` → 0; plain opacity fade, same timing |
| Station node | same trigger, `-0.08s` | 0.6s | `power2.out` | — | scale held at 1; opacity fade only |
| Hover / focus | pointer / `focus-visible` | 0.2s | CSS default | — | unaffected — a hover is not ambient motion |

Every tween is created inside `useGSAP` with a `scope`, so its ScrollTrigger is reverted on unmount
automatically (§7.1, and the skill's cleanup rule). `gsap.matchMedia()` wraps the whole thing with
a `reduce` branch, and the branch returns a real animation rather than nothing — §7.2 says
entrances *become plain opacity fades*, not that they disappear. Nothing keeps moving.

The three §7.3 moments are untouched: no timing, ease, trigger, or constant belonging to the hero
load, the rail's paint, or the panel vignettes is read or written by this prompt.

## Accessibility requirements

- **JavaScript disabled: every section is visible and readable.** Decision 3. This is the one that
  can go badly wrong, and it is verified by turning JavaScript off, not by reading the CSS.
- **`prefers-reduced-motion: reduce`: no element travels.** Opacity only, and content still ends up
  visible — an entrance that never fires because its trigger was skipped is a blank page for the
  people who most need it not to be.
- **Focus is never lost or trapped**, and no focus outline is removed without a replacement (§12).
  Every element gaining a `hover:` also gains a `focus-visible:` where it is focusable.
- **Nothing decorative gains a role.** `RailStation` keeps its `aria-hidden`; the reveal wrapper
  adds no role, no `aria-live`, and no tabindex — it is a positioning div with a tween attached.
- **Heading order is untouched.** No wrapper may sit between a heading and its section in a way
  that changes the document outline.
- A reveal must never be the only thing that makes content reachable — no `display: none`, no
  `visibility: hidden`, no `height: 0`. Opacity and transform only, so the text is in the
  accessibility tree and findable by in-page search the whole time.

## Acceptance criteria

1. `npm run typecheck` — clean.
2. `npm run lint` — the §14 bar exactly: three errors, one each in `components/layout/wordmark.tsx`,
   `components/ui/carousel.tsx`, `hooks/use-mobile.ts`. Any new error fails.
3. `npm run build` — succeeds.
4. `npm run check:responsive` — exits 0, clean at all four widths. The guard now exists; use it
   (§14). Note it runs the page in its reduce branch, so a passing run does **not** exercise the
   motion branch's geometry — check that by hand at 1440.
5. `grep -rn "placeholder: true" lib/copy/` — still 17.
6. **JavaScript disabled, every section is visible.** Load `/` with JS off in DevTools and scroll
   to the footer. Any blank section is a failure of the whole prompt, not a detail.
7. **Reduced motion on: nothing travels, everything is visible.** Toggle the OS setting, reload,
   scroll the page. Sections fade, the rail is painted, the slipstream is static, nothing moves
   sideways or vertically.
8. **Nothing re-animates on scroll back up.** Scroll to the footer and back to the hero: no section
   fades out, nothing replays.
9. **Sections below the fold at load are not stuck invisible.** Deep-link to `#faq` and confirm the
   FAQ is visible — a trigger whose start is already past at load must still fire.
10. Every section is a server component still: `grep -rln '"use client"' components/sections/`
    returns the same list as before this prompt, plus nothing.
11. The three §7.3 moments are unchanged — hero load under 1.2s, rail paint tracking the midpoint,
    vignettes looping — confirmed by watching, and by `git diff` touching none of their files.
12. `AGENTS.md` §7.3 names the fourth category, and no code comment still claims there is no room
    for one.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
npm run check:responsive
grep -rn "placeholder: true" lib/copy/
grep -rln '"use client"' components/sections/
git diff --stat
```

Paste the real output of each (§14).

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **Scroll the whole page slowly at 1440.** Every section should arrive once, quietly. If it feels
   like a slideshow, `REVEAL.rise` is too large or the stagger is applied too widely — say so
   rather than shipping it.
2. **Scroll fast to the bottom.** Sections passed in a single flick must not be left half-faded or
   stuck at `opacity: 0`.
3. **Scroll back to the top.** Nothing replays (criterion 8).
4. **Repeat at 360 and 768.** The reveal is width-independent; confirm no horizontal movement.
5. **JavaScript off** (criterion 6). The most important step here.
6. **Reduced motion on** (criterion 7).
7. **Deep-link to `#faq` and `#customers`** (criterion 9).
8. **Tab through the page end to end.** Every element that gained a hover shows a visible focus
   ring, and the order is unchanged.
9. **Watch the hero load once more** — it must be exactly as it was; the new triggers must not have
   perturbed its timing or the rail's draw.

## Decisions the human needs to make before approval

1. **Piece 1 at all** (decision 1). It is a fourth ambient category and the repo has twice argued
   against one. Approving this prompt approves amending §7.3. Declining it leaves pieces 2 and 3,
   which need no amendment and stand alone.
2. **Stagger, or one block per section?** This prompt allows stagger only for the logo band's seven
   wordmarks, the proof band's two stats, and the three capability cards. Blanket stagger is the
   templated version; zero stagger is calmer still and one fewer thing to tune.
3. **16px.** Below `HERO.rise`'s 24 on purpose. If it reads as too subtle to be worth the code, the
   honest answer is to cut piece 1 rather than raise the number until it is noticeable.
