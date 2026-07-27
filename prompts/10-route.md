# 10 — The Route section

## Goal

Build §8 row 9: **Route** — the setup sequence. A two-column row with three numbered steps and a
CTA in the text column, and a rounded pale panel holding an embed mock in the other.

This is the one place on the page where numbering is allowed (§6.4), because it encodes a real
ordered sequence. It is also the first section that has to answer "what do I actually do?" — the
page's single job is to get someone to start a guide without booking a call, and this row is where
that becomes concrete.

After it, `/` reads hero → customers → proof → live demo → intro → three capabilities → route →
FAQ stub.

Out of scope, explicitly: the generator and capability cards, the testimonial carousel, the real
FAQ, the closing CTA, and any change to the Ask bar. No backend. No new orchestrated motion.

## Skills and docs read

- `AGENTS.md` §5.1 row 9 (numbers set large in the display face on their own line, hairline between
  steps, CTA plus one line of reassurance, right column a pale panel with an overlapping product
  screenshot and a "Copy embed code" affordance), §5.3 (what may not be carried across), §6.1
  (monochrome chrome — this section is outside every feature panel, so **no route hue appears in
  it at all**), §6.2 (two display steps; the Utility face's remit), §6.3 (radii, hairlines, one
  shadow on the page and the Ask bar has it), §6.4 (**numbered steps are stations on the route**),
  §7.1–7.3 (the motion budget is spent), §9–§13.
- `.agents/skills/gsap-react` — read, and then deliberately not used: see decision 3. Nothing in
  this section animates in JavaScript.
- `.agents/skills/shadcn/rules/base-vs-radix.md` — `render` not `asChild`, `nativeButton={false}`
  when a `Button` renders an anchor. The CTA follows the pattern already in `live-demo.tsx`.

Deliberately **not** read, and why:

- `node_modules/next/dist/docs/` **images guide** — no `next/image` call is added, because no image
  asset exists or is created (decision 2). Nothing else here touches routing, config, fonts,
  metadata, or a server boundary.
- The GSAP scroll, timeline, and performance skills — no timeline, no ScrollTrigger, no tween.

## Existing code inspected

- `components/sections/capability-section.tsx` — the two-column row this matches: `<section
  className="section-rhythm anchor-offset">` → `rail-offset relative` → `RailStation` → a
  `grid gap-12 lg:grid-cols-2 lg:gap-16`. Same shell, same gaps.
- `components/sections/live-demo.tsx` — the CTA pattern: `Button variant="pill" size="pill"
  nativeButton={false} render={<a href={...} />}`, label read from copy.
- `components/layout/rail-station.tsx` and the `rail-station` / `rail-offset` utilities — how a
  marker is placed on the line from inside a section. `rail-station` is pinned to `top: 0`, so it
  cannot mark a row partway down a section; that gap is what decision 1 fills.
- `components/motion/vignette-parts.tsx` — `WireCard` is already the "one empty card in a
  wireframe" primitive, hairline-ringed on paper. The dashboard mock reuses it rather than
  authoring a second one (§10).
- `components/layout/placeholder-chip.tsx` and `lib/copy/placeholder/` — inspected to confirm
  nothing here needs them: this section makes no claim about a customer, a person, or a metric, so
  §11.1 does not apply to any of it and no chip is rendered (decision 5).
- `lib/copy/live-demo.ts` — the copy-module pattern: one typed export, explicit annotation, header
  comment stating whether §11.1 applies, phrased so §14's grep cannot match the comment.
- `lib/gsap/motion.ts` — read, unchanged. This section adds no constant because it creates no
  tween.
- `app/globals.css` — `rail-offset`, `rail-station`, `node-square`, `hairline`, `hairline-b`,
  `--rail-x`, `--rail-gap`, `--radius-panel`, `--radius-card`, `--font-mono`, `--duration-micro`.
- `app/page.tsx` — `<RouteSection />` is inserted after `<Onboarding />`, before the `#faq` stub.

## Decisions and assumptions

### 1. The three steps are real stations on the page's rail

§6.4 is not decorative about this: "Numbered steps are stations on the route." The reference sets
three free-floating numbers in a column; ours put a node **on the line** beside each step, so the
page rail's existing scroll paint travels through all three as the reader passes them.

That needs one new utility, because `rail-station` is pinned to `top: 0` and can only mark the top
of a section. `rail-node` is the same node, positioned against its own row instead: a child of
`rail-offset` sits `--rail-gap` inside the line, so the node backs out by `calc(-1 * var(--rail-gap)
- 3px)` — the same `-3px` half-node centring `rail-station` already uses.

The payoff is that this section needs **no motion of its own at all**. The steps read as a route
because they are literally on it, and the only thing that moves is the rail paint that was already
built in §7.3 #2.

### 2. The "product screenshot" is markup, not an image

§5.1 describes a screenshot; §5.3 forbids carrying across handhold.io's artwork; and no Glidda
product exists to screenshot. So there is no image asset, no `next/image` call, and no fabricated
UI passed off as a capture. The panel holds a **wireframe**: an ink sidebar strip and a grid of
`WireCard`s behind, with a floating paper card in front carrying the embed snippet.

This is the same honesty the vignettes already run on, and it has three side benefits: no layout
shift on load, nothing to swap when the real product exists, and no §12 image obligation to meet.

The one thing it must not become is a *convincing* fake screenshot. It stays visibly schematic —
no fake data, no fake chart, no invented company name anywhere in it. That is also why §11.1 does
not bite here (decision 5): there is nothing fabricated to flag, only shapes.

### 3. No JavaScript motion in this section

§7.3 spends the whole budget on three moments and they are all built. This section adds none, and
that is a deliberate result of decision 1 rather than an omission: the scroll-linked thing a reader
sees here is the rail paint passing three nodes, which is moment 2 doing its job across new
markers, not a fourth moment.

The only motion is the CSS `--duration-micro` colour transition already used on every hover in the
repo, plus the copy button's label swap (decision 4), which is a state change and not a tween.

### 4. "Copy embed code" genuinely copies

The reference shows the affordance; ours does the thing. A clipboard write of a static string is
five lines, is fully keyboard operable, and raises none of §15's undesigned questions — unlike the
Ask bar's send button, there is no unspecified downstream behaviour hiding behind it. Shipping it
inert would be the odd choice on a page whose whole argument is "you can start this yourself right
now".

Requirements that come with it:

- One `"use client"` component, `components/sections/copy-embed.tsx`. It is the only client
  boundary in the section.
- `navigator.clipboard.writeText` is a promise and is not swallowed (§13). On rejection — insecure
  context, denied permission, no API — the button falls back to selecting the snippet text and its
  label says so, rather than silently claiming success. Errors state what happened and what to do
  next; they do not apologise (§11).
- The result is announced: an `aria-live="polite"` region carries "Copied" or the fallback
  direction. The label itself reverts after a short delay, and the timer is cleared on unmount.
- With JavaScript disabled the snippet is still fully readable and selectable — it is real text in
  a `<code>`, not a canvas or an image — and the button, which can do nothing, is not rendered at
  all rather than rendered dead.

### 5. Nothing in this section is a fixture

§11.1 governs fabricated **proof**: customers, quotes, people, metrics. This row has none. The step
sentences, the CTA, and the reassurance line are ours to write freely under §11 and are the real
copy until someone changes it. No `placeholder: true`, no `PLACEHOLDER` chip, and the pre-deploy
grep count is unchanged at fourteen.

The one string that needs care is the snippet's host — see the open questions. It is written once,
in `lib/copy/route.ts`, so it is a one-line change when the real host is known.

### 6. The snippet uses the Utility *family*, not the Utility *voice*

§6.2 restricts the Utility face to eyebrows, station labels, stat labels, and data chips — uppercase,
tracked `0.12em`, 11–12px. A code snippet is none of those and must never be uppercased or tracked:
tracking mangles a URL and uppercasing makes it wrong to retype.

So the snippet is set in `--font-mono` (which resolves to the same family) at `--text-small`, normal
case, normal tracking, and it does **not** use the `type-utility` utility. The step numbers are the
Display face per §5.1; the eyebrow above the headline is the only real Utility-voice element here.

### 7. Rejected alternatives

- **A local sub-rail drawn through the three steps.** A second line beside the page's own line is
  two rails, and §6.4 asks for one continuous one. Decision 1 puts the steps on the real one instead.
- **Animating the step numbers in on scroll.** A fourth scroll-linked moment for no reading benefit.
  §7.3 says anything beyond the three needs a reason, and "the numbers could fade in" is not one.
- **An `<ol>` with CSS counters.** The markup is an `<ol>` — it is an ordered sequence and that is
  what the element means — but the numerals are authored in the copy object, not generated by a
  counter, because they are set in the Display face at headline size and are typographic content,
  not a list marker. `list-none` and the numeral in its own element.
- **A `Card` primitive for the floating snippet card.** `components/ui/card.tsx` brings a header /
  content / footer structure and shadcn's own radius scale. This is one padded box with a hairline
  and `--radius-card`; composing the primitive would cost more overrides than markup.

## Files likely to change

| File | Change |
| --- | --- |
| `lib/copy/route.ts` | new — eyebrow, headline, three steps, CTA, reassurance, snippet, copy labels |
| `components/sections/route.tsx` | new — the section (server), text column and steps |
| `components/sections/embed-panel.tsx` | new — the pale panel and its wireframe mock (server) |
| `components/sections/copy-embed.tsx` | new — client; the snippet block and its copy button |
| `app/globals.css` | edit — the `rail-node` utility only |
| `app/page.tsx` | edit — `<RouteSection />` after `<Onboarding />` |

Explicitly not modified: `lib/gsap/motion.ts`, `lib/gsap/register.ts`, `lib/utils.ts`,
`components/ui/*`, `components/layout/rail.tsx`, `components/layout/rail-station.tsx`,
`components/motion/vignette-parts.tsx` (`WireCard` is imported as shipped), and everything under
`lib/copy/placeholder/`.

## Implementation requirements

### `lib/copy/route.ts`

One typed export, `route`. Header comment in the house pattern, stating §11.1 applies to none of it
and phrased so §14's grep cannot match the comment.

```ts
{
  station: string
  eyebrow: string
  headline: string
  steps: readonly [Step, Step, Step]   // exactly three, tuple-typed
  cta: NavLink                          // reuse the type from lib/copy/shell
  reassurance: string
  snippet: string
  copy: { idle: string; done: string; failed: string }
}
```

`Step` is `{ numeral: string; title: string; body: string }`. `numeral` is `"01" | "02" | "03"` as
authored text (decision 7).

Copy is ours under §11 — active voice, specific, sentence case, no "seamless", no exclamation. The
CTA label is **"Start a guide"**, the same label and destination as the hero's primary, the header
pill, and the live demo CTA: the action keeps its name through the whole flow.

The reassurance line is one sentence and must be a statement we can stand behind. It is not a
pricing claim and not a metric — say what removing the snippet does, not what it costs.

### `components/sections/route.tsx`

Server component, exported as `RouteSection` (the file is `route.tsx`; the component is not called
`Route`, which reads as a Next.js primitive).

```
<section id="route" className="section-rhythm anchor-offset">
  <div className="rail-offset relative">
    <RailStation label={route.station} />
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      text column  — eyebrow, h2, <ol> of three steps, CTA pill, reassurance line
      panel column — <EmbedPanel />
```

Each `<li>` is `relative`, carries a `rail-node` marker, sets its numeral in the Display face at
`--text-headline` on its own line, then the title and body beneath it, with `hairline-b` between
steps and none after the last.

DOM order is text then panel on every width. The panel does not alternate — it sits right, like
Answers and Onboarding, and unlike the capability rows this section has no `side` prop because
there is only one of it.

If the file passes ~200 lines, the step list is extracted to a subcomponent in the same directory
(§13).

### `components/sections/embed-panel.tsx`

Server component. A `--surface` box at `--radius-panel` with generous padding, holding:

- **Behind:** the dashboard wireframe — an `--ink` sidebar strip at ~18% width with three paler
  bars in it, and a content area of `WireCard`s in a grid. Schematic, never convincing (decision 2).
- **In front:** the floating card, `--paper`, `--radius-card`, one hairline, offset so it overlaps
  the wireframe's lower-left. It contains a Utility-voice label, then `<CopyEmbed />`.

The overlap is the composition §5.1 describes and is achieved with `relative`/`absolute` plus a
negative margin at `lg:`, never with a `box-shadow` — §6.3 allows exactly one shadow on the page
and the Ask bar has it. Depth comes from the hairline and the fill difference.

Below `lg` the two stack rather than overlap: an overlapping card at 360px covers the thing it is
meant to sit on. The card goes under the wireframe, full width.

The wireframe is `aria-hidden` (§12) — it conveys nothing a screen-reader user needs. The floating
card is **not**, because the snippet in it is real information.

### `components/sections/copy-embed.tsx`

`"use client"`. Renders the snippet and the button:

- The snippet is `<pre><code>` in `--font-mono` at `--text-small`, normal case and tracking
  (decision 6), `--surface` fill, `--radius-chip`, and it **scrolls inside its own container**
  (`overflow-x: auto`) — §12 forbids horizontal page scroll and a one-line script tag is wider than
  360px.
- The button is a `Button variant="pill" size="pill"`-family control or a plain button with
  `focusRing`, whichever matches the existing secondary treatment; label from `route.copy.idle`.
- On click: `navigator.clipboard.writeText(route.snippet)`, `.then` sets the label to
  `route.copy.done`, `.catch` selects the snippet's text range and sets it to `route.copy.failed`.
  No swallowed promise (§13).
- The label reverts after ~2s. The timeout id is held in a ref and cleared on unmount.
- An `aria-live="polite"` `<span>` carries the same message so the outcome is announced, not only
  drawn.
- Feature-detected: if `navigator.clipboard` is absent the button does not render, and the snippet
  is still selectable text.

## Visual spec

**Row.** Two equal columns from 1024px, `gap-16`; single column below, text then panel, `gap-12`.
Section spacing on the `<section>` only; no child sets an outer margin (§13).

**Text column.**

| Element | Face | Size | Colour | Notes |
| --- | --- | --- | --- | --- |
| Eyebrow | Utility | `--text-eyebrow` | `--rail-muted` | plain label, no chip fill — the capability sections own the chip treatment |
| Headline | Display | `--text-headline` | `--ink` | `max-w-[18ch]`, hangs off the rail |
| Step numeral | Display | `--text-headline` | `--ink` | own line, `line-height: 1` |
| Step title | Body 500 | `--text-body` | `--ink` | |
| Step body | Body | `--text-body` | `--rail-muted` | `max-w-[46ch]`, two lines |
| Reassurance | Body | `--text-small` | `--rail-muted` | one line, directly under the CTA |

Steps are separated by `hairline-b`, with `clamp(28px, 3vw, 40px)` of padding above and below each.
The node sits on the line, vertically aligned to the numeral's cap height rather than the row's box
— a marker floating beside blank space reads as a mistake.

**Panel.** `--surface`, `--radius-panel`, no hairline (the fill is the edge), padding
`clamp(20px, 3vw, 40px)`. Wireframe: ink sidebar at 18%, cards on `--paper` with a `--rail` ring,
`--radius-chip`. Floating card: `--paper`, `--radius-card`, `1px solid var(--rail)`, padding 16–20px.

**No hue anywhere.** This section is outside every feature panel, so §6.1's rule is absolute here:
no `--signal`, no route colour, not on a rule, an icon, a button, or a focus ring.

**Responsive.** 360 — one column; card stacks under the wireframe; snippet scrolls inside itself;
nodes still on the line at `--rail-x: 4px`. 768 — still stacked, panel wider. 1024 — two columns,
card overlaps. 1440 — 1200px shell, panel does not outgrow the text column.

**States.** CTA: the existing pill hover. Copy button: `--duration-micro` fill change, `focusRing`
never removed, label swaps to "Copied" and back. Steps have no hover state — they are content, not
controls.

## Motion spec

| What | Trigger | Duration | Ease | Reduced motion (§7.2) |
| --- | --- | --- | --- | --- |
| Rail paint through the three nodes | existing page scrub | — | — | already handled in `rail.tsx` |
| CTA hover | hover | `--duration-micro` | `--ease-entrance` | unchanged — a colour change is not motion |
| Copy button label | click | none | none | unchanged |

Nothing else. No timeline, no ScrollTrigger, no tween is created by any file in this prompt
(decision 3), so there is no `gsap.matchMedia()` branch to write and nothing that could be left
frozen.

## Accessibility requirements

- One `<h2>`; the eyebrow is a `<p>`. Step titles are `<h3>`, keeping h1 → h2 → h3 in order.
- The steps are an `<ol>`; the authored numerals are `aria-hidden` so a screen reader hears the
  list's own numbering once rather than twice.
- The `rail-node` markers are `aria-hidden` — decorative, like every other rail element.
- The wireframe is `aria-hidden`; the snippet and its button are not.
- The copy button is a real `<button>` with a visible focus ring, operable by `Enter` and `Space`,
  and its result is announced through `aria-live="polite"`.
- The snippet is selectable text in a `<code>`, readable and copyable by hand with JavaScript off.
- No horizontal page scroll at any width — the snippet scrolls inside its own container (§12).
- Contrast: every muted string is `--rail-muted`; `--rail` carries no text; the display face carries
  no body copy.

## Acceptance criteria

1. The section renders at 360, 768, 1024, and 1440px with no horizontal page scroll, including with
   the snippet line longer than the viewport.
2. Three nodes sit on the page rail, one per step, and the rail's scroll paint passes through them.
3. DOM order is text then panel at every width; the panel never reorders the DOM.
4. The numerals are `01 / 02 / 03` in the Display face on their own lines, hairlines between steps
   and none after the last — and no other numbering appears anywhere else on the page (§6.4).
5. "Copy embed code" copies the exact string from `lib/copy/route.ts`, the label becomes "Copied"
   and reverts, and the outcome is announced through the live region.
6. With the clipboard API unavailable or rejecting, the snippet's text is selected and the label
   says what to do instead. No unhandled rejection appears in the console.
7. With JavaScript disabled the whole section reads, the snippet is selectable, and the copy button
   is absent rather than dead.
8. No GSAP import appears in any file added by this prompt.
9. No route hue, `--signal`, or any colour but `--ink`, `--ground`, `--surface`, `--rail`,
   `--rail-muted`, and `--paper` appears in the section.
10. No image, no `next/image`, and no asset is added.
11. `grep -rn "placeholder: true" lib/copy/` still returns **fourteen** hits — unchanged, because
    nothing here is a fixture.
12. `lib/gsap/motion.ts`, `lib/gsap/register.ts`, `lib/utils.ts`, `components/ui/*`,
    `components/layout/rail.tsx`, and `components/motion/vignette-parts.tsx` are unmodified.
13. `app/page.tsx` gains one section element and still contains no layout maths, copy, or animation.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
```

`build` because a new client boundary lands on the route and an SSR mistake inside `"use client"`
only surfaces in a production build.

Paste real output for all four. Lint must still be the same three pre-existing errors, in
`components/ui/carousel.tsx`, `hooks/use-mobile.ts`, and `components/layout/wordmark.tsx` — the same
three files, not merely the same count. Any new error is a failure, including in a new file.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **1440px.** Scroll through the section and watch the rail paint reach each of the three nodes.
   That is the whole argument for decision 1 — if the nodes do not read as stations the steps
   should go back to being plain numbers and the utility comes out.
2. **The panel.** Does the wireframe read as schematic, or does it read as a screenshot of
   something that exists? It must be the former (decision 2). Say if it drifts.
3. **Copy the snippet.** Click it, paste it somewhere, confirm the string matches. Then Tab to it
   and press Enter, and confirm the focus ring and the announcement.
4. **Force the failure.** Load the page over plain `http://` from another device on the LAN, where
   `navigator.clipboard` is unavailable in a non-secure context, and confirm the fallback selects
   the text and says what to do.
5. **JavaScript disabled.** The section reads, the snippet is selectable, the button is gone.
6. **360px and 768px.** Card stacked under the wireframe, snippet scrolling inside its own box, the
   page not scrolling sideways, nodes still on the line.
7. **The reassurance line.** Read it cold and say whether it is a sentence we can stand behind. If
   not, it is one string in `lib/copy/route.ts`.

## Open questions this raises for later prompts

- **The snippet's host.** `cdn.glidda.com` does not exist. It is written once in
  `lib/copy/route.ts` so it is a one-line change, but it is a product statement rendered as fact and
  it must be corrected before any public deploy — the same standard §11.2 applies to the
  announcement bar. Flag it in the deploy report alongside the fixture grep.
- **The Glidda mark (§15).** The wireframe's sidebar has an obvious place for one and currently has
  a plain block. Leave it a block until the mark exists.
- **`rail-node` beyond this section.** Once the utility exists, the testimonial carousel and the FAQ
  may want markers partway down a section too. Do not generalise it further here.
