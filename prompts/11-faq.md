# 11 — The FAQ section

## Goal

Build §8 row 12: **FAQ** — six rows, each a Display-face question with a circular `+` control at the
right that becomes `−` and inverts to solid ink when the row is open. Multiple rows open at once.
Hairlines between rows. The answer is grey body copy that pushes the following rows down.

This replaces the stub currently inlined in `app/page.tsx`. That stub is the reason this section
goes before the generator and the carousel: the header nav, the footer's Product column, and the
announcement bar all link to `#faq`, so three live links currently land on placeholder text.

After it, `/` reads hero → customers → proof → live demo → intro → three capabilities → route →
FAQ. Outstanding from §8: the generator and capability cards, the testimonial carousel, and the
closing CTA.

Out of scope, explicitly: any other section, the Ask bar, and any backend. No new fixtures.

## Skills and docs read

- `AGENTS.md` §5.1 row 12 (six rows; Display-face question left, circular `+` right that becomes
  `−` and inverts to solid black; multiple rows open at once; hairlines between; the answer pushes
  following rows down), §5.2 (hovering the row highlights the question; clicking **either** the
  question or the `+` toggles it), §5.3, §6.1 (monochrome — this section is not a feature panel, so
  no hue at all), §6.2 (`--text-headline` for a FAQ question; the Display face never carries body
  copy), §6.3 (hairlines, radii, no shadows), §6.4 (the rail; **no numbering** — the Route section
  owns the page's only numerals), §7.1 (**transform and opacity only; `height` is forbidden**),
  §7.2, §7.3 (the three moments are spent), §9–§13.
- `.agents/skills/shadcn/rules/base-vs-radix.md` — this project is `@base-ui/react`. `render`, not
  `asChild`. Relevant here because the Header must render an `<h3>` and the Root must be `multiple`.

Deliberately **not** read, and why:

- The GSAP skills — nothing in this section is animated in JavaScript (decision 3). No `useGSAP`,
  no ScrollTrigger, no timeline.
- `node_modules/next/dist/docs/` — no routing, config, font, image, metadata, or server-boundary
  change. One client component is added, and the boundary pattern is already established by
  `capability-accordion.tsx`.

## Existing code inspected

- **`components/ui/accordion.tsx` — read, and deliberately not used.** Its `AccordionContent`
  animates height: `h-(--accordion-panel-height)` with `data-open:animate-accordion-down` and
  `data-closed:animate-accordion-up`. §7.1 forbids animating `height` outright. It also hardcodes
  `text-sm`, `hover:underline`, and a chevron pair, none of which this section wants.
  `capability-accordion.tsx`'s header comment says this wrapper is "left untouched for the FAQ" —
  that reservation is hereby resolved the other way, and the wrapper stays untouched anyway: this
  section composes the Base UI primitive directly, exactly as the capability accordion does.
  **Do not modify `components/ui/accordion.tsx`.** Nothing else imports it, and editing it to suit
  one consumer is the fork §10 warns against.
- `components/sections/capability-accordion.tsx` — the precedent for composing
  `AccordionPrimitive.Root / Item / Header / Trigger / Panel` directly: keeps the real
  `aria-expanded`, `aria-controls`, and panel association and drops only the keyframes. Read its
  `keepMounted={false}` usage and its `focusRing` + `cn()` trigger pattern and follow both. Note
  what differs: that accordion is single-open, timed, and hover-driven; this one is
  multi-open, untimed, and click-driven only.
- `components/sections/route.tsx` — the current section shell idiom: `<section id className=
  "section-rhythm anchor-offset">` → `<div className="rail-offset relative">` → `<RailStation />`
  → content. The FAQ is a single column, so there is no grid.
- `components/layout/rail-station.tsx` — the marker. `aria-hidden`; label dropped below 640px.
- `lib/copy/route.ts` and `lib/copy/capabilities.ts` — the copy-module pattern: one typed export,
  an explicit type annotation rather than `as const`, and a header comment stating whether §11.1
  applies, phrased so §14's grep cannot match the comment.
- `app/globals.css` — `hairline-b`, `rounded-pill`, `type-display`, `text-headline`, `text-body`,
  `--rail-muted`, `--duration-micro`, `--ease-entrance`, `anchor-offset`. Every value this section
  needs already has a token; none is written literally in TSX.
- `lib/utils.ts` — `cn`, `focusRing`, and the §13 tailwind-merge note (the type scale is
  registered; `text-headline` and `text-ink` on one `cn()` call are safe).
- `lib/gsap/motion.ts` — read, **unchanged**. This section creates no tween, so it adds no constant.
- `app/page.tsx` — the inline `#faq` stub and its `TODO(prompt 11+)` comment are **deleted** and
  replaced with `<Faq />`. The comment above `Home` listing what is outstanding is updated to drop
  the FAQ.

## Decisions and assumptions

### 1. Base UI's primitive, composed directly, with `multiple`

`AccordionPrimitive.Root` takes `multiple` — §5.1 requires more than one row open at once, so it is
set, and `defaultValue={[]}` leaves every row closed at rest.

All-closed is the right rest state and is a deliberate departure from the capability accordion,
which always has exactly one row open because its column would otherwise show an empty slot. Here
the six questions *are* the content: a reader scans them to find theirs. Opening one by default
buries the sixth question below a fold of answer text and answers a question nobody asked.

`AccordionPrimitive.Header` must render an `<h3>` via `render={<h3 />}` — §12 requires headings in
order and the page is h1 (hero) → h2 (section) → h3 (question). Base UI's Header does not emit a
heading element on its own.

### 2. The whole row is one control, and the circle is decorative

§5.2 observed that clicking either the question or the `+` toggles the row. That means one
`AccordionPrimitive.Trigger` spanning the full row, with the question and the circle inside it —
**not** a button nested inside a button, which is invalid HTML and gives a keyboard user two tab
stops for one action.

So the circle is a `<span aria-hidden>` styled as a control, and the `+`/`−` state is read from the
trigger's own `aria-expanded` through the `group/` pattern already used in
`components/ui/accordion.tsx`. Nothing about the circle is announced: `aria-expanded` on the
trigger already carries the open state, and a screen reader saying "plus" adds nothing.

### 3. Nothing animates in JavaScript, and the height change is not animated at all

§7.1 forbids animating `height`, and §7.3's three moments are spent. Opening a row therefore
changes the layout **instantly** and pushes the following rows down — which is exactly what §5.1
describes the reference doing, and is a layout change rather than an animation.

`keepMounted={false}`, so a closed panel is not in the DOM and the `--accordion-panel-height`
machinery is never engaged. No fade on the panel either: a fade-in inside a slot that has just
reflowed draws the eye to the reflow. The answer is simply there.

The only motion in the section is two CSS micro-interactions on the circle and the question, both
at `--duration-micro` with `--ease-entrance`, both on colour and transform only.

Consequence: there is **no `gsap.matchMedia()` branch to write**, and §7.2 is satisfied by
construction rather than by a fallback. State that in the completion report rather than leaving a
reviewer to wonder whether it was forgotten.

### 4. Six questions we can actually answer, and the ones we cut

§11.2 is explicit: real answers we can stand behind, and "if we cannot answer a question honestly,
cut the question rather than invent an answer."

Three obvious FAQ questions are therefore **deliberately absent**, and this is a decision, not an
oversight:

- **Pricing.** No pricing exists. §15 does not even list a pricing page as in scope.
- **Security, compliance, data retention, SOC 2, where data is stored.** Nobody has decided any of
  it. An invented compliance claim is the single most damaging sentence that could go on this page,
  and it is the kind a reader acts on.
- **Integrations / "does it work with X".** No integration surface has been specified.

If the user wants any of those three answered, it needs a decision from them first, not a sentence
from us. Flag it in the completion report.

### 5. Nothing here is a fixture

§11.1 governs fabricated **proof** — customers, quotes, people, metrics. Six questions and six
answers about our own product are none of those. So: no fixture flag, no `PLACEHOLDER` chip, no
file under `lib/copy/placeholder/`, and the pre-deploy grep count stays at **fourteen**.

The answers must contain no metric. "Setup takes under ten minutes" is a fabricated statistic
wearing a sentence's clothes; "you add one script tag" is a description of the product. Write the
second kind only.

### 6. Rejected alternatives

- **Using `components/ui/accordion.tsx` and overriding the animation classes.** The override would
  have to defeat `animate-accordion-down`, `data-starting-style:h-0`, and the height variable — more
  fighting than composing, and it leaves a wrapper in the tree whose whole purpose is the thing
  being disabled.
- **A `<details>/<summary>` pair.** Genuinely tempting: it is multi-open, keyboard-operable, and
  works with JavaScript off for free. Rejected because styling `summary`'s marker consistently
  across browsers costs more than the primitive does, and the repo already has one accordion
  composed from Base UI — two different accordion mechanisms on one page is the inconsistency §13
  is trying to prevent. With JavaScript off this section renders as six visible questions with no
  answers, which §12 tolerates ("readable and navigable ... minus the animation") but is worth
  stating out loud.
- **Animating the panel's height "just a little".** No. §7.1 has no small-amounts clause.
- **Numbering the questions.** §6.4 gives the page exactly one numbered sequence and the Route
  section has it.

## Files likely to change

| File | Change |
| --- | --- |
| `lib/copy/faq.ts` | new — station, eyebrow, headline, six question/answer rows with stable ids |
| `components/sections/faq.tsx` | new — the section shell, server component |
| `components/sections/faq-accordion.tsx` | new — `"use client"`; the accordion itself |
| `app/page.tsx` | edit — delete the stub, render `<Faq />`, update the outstanding-work comment |

Explicitly **not** modified: `components/ui/accordion.tsx`, `lib/gsap/motion.ts`,
`lib/gsap/register.ts`, `lib/utils.ts`, `app/globals.css` (every utility this needs exists),
`components/sections/capability-accordion.tsx`, and everything under `lib/copy/placeholder/`.

If no new CSS utility is required — and none should be — say so in the report. A new `@utility`
here would be a signal that something is being hand-rolled that a token already covers.

## Implementation requirements

### `lib/copy/faq.ts`

One typed export, `faq`, with an explicit type annotation. Header comment in the house pattern
stating §11.1 applies to none of it, phrased so §14's grep cannot match the comment.

```ts
export type FaqRow = { id: string; question: string; answer: string }

export const faq: {
  station: string
  eyebrow: string
  headline: string
  rows: readonly FaqRow[]   // six
}
```

`id` is a stable slug (`what-it-does`, `setup`, `sources`, `in-app`, `languages`, `wrong-answers`).
It is the accordion's `value` and must not be derived from the question text, which would change
the DOM identity every time a word is edited.

Station label: `FAQ`. Eyebrow and headline are ours to write under §11.

The six rows, as approved content — edit for rhythm, not for meaning:

1. **What does Glidda actually do?** — It reads your site and your docs, builds a guide from them,
   and runs that guide on the page a visitor is already standing on. It answers their questions,
   walks them through your real interface, and gets new users to their first result.
2. **How long does setup take?** — You add one script tag, and Glidda drafts the first guide from
   what you have already published. The rest is you reading what it wrote and correcting it, which
   takes as long as you want to spend.
3. **What does Glidda read to build a guide?** — Whatever you point it at — your site, your docs,
   your changelog. It does not go looking anywhere else.
4. **Does it work inside my product, or only on the marketing site?** — Both, from the same snippet.
   That is what lets one guide carry someone from a question on your pricing page to their first
   real result inside the product.
5. **What languages does it run in?** — It answers in the language the visitor writes in. You write
   the guide once.
6. **What happens when it gets something wrong?** — It answers from what you published and says when
   it does not know rather than guessing. Every conversation comes back to you, so the answers you
   had to correct are the fastest list you will get of what your docs are missing.

No metric, no superlative, no exclamation mark, sentence case, active voice (§11).

### `components/sections/faq.tsx`

Server component, exported as `Faq`.

```
<section id="faq" className="section-rhythm anchor-offset">
  <div className="rail-offset relative">
    <RailStation label={faq.station} />
    eyebrow (<p className="type-utility text-rail-muted">)
    <h2 className="text-headline">
    <FaqAccordion rows={faq.rows} />
```

Single column. The rows are capped at `max-w-[72ch]` so a question line does not run the full
1200px shell — a 40px Display-face line that wide is unreadable, and the whitespace to its right is
what makes the section feel like the rest of the page.

### `components/sections/faq-accordion.tsx`

`"use client"` — it needs interaction state. It takes `rows` as a prop and imports no copy itself.

- `AccordionPrimitive.Root` with `multiple` and `defaultValue={[]}`.
- One `Item` per row, `value={row.id}`, `className="hairline-b"` on every item **including the
  last** — §5.1 shows rules between rows; whether the final rule stays is a judgement call, so
  make it and say which you chose in the report.
- `Header` renders an `<h3>` (`render={<h3 />}`).
- `Trigger`: full width, `flex items-start justify-between gap-6`, generous vertical padding
  (`py-6` to `py-8` band), `text-left`, `focusRing` from `lib/utils`, and a `rounded-chip` so the
  focus ring has a shape. The question is `type-display text-headline`, `--ink` when open,
  `--rail-muted` → `--ink` on hover when closed (§5.2), transitioning `color` over
  `--duration-micro`.
- The circle: `<span aria-hidden>`, `size-10 shrink-0 rounded-pill`, `hairline`, `--paper` fill,
  centred lucide `Plus`; when the trigger is expanded it swaps to `Minus` and the fill inverts to
  `--ink` with a `--paper` glyph, via the `group-aria-expanded/…` pattern. Transition `colors` only,
  `--duration-micro`, `--ease-entrance`. `size-10` is 40px — comfortably over the 24px minimum and
  the row itself is the real hit target anyway.
- `Panel` with `keepMounted={false}`, `max-w-[62ch] pb-8 text-body text-rail-muted`. No animation
  classes, no height variable.

If the file passes ~200 lines it is too big for what it is — it should land near 80.

## Visual spec

| Element | Face | Size | Colour | Notes |
| --- | --- | --- | --- | --- |
| Eyebrow | Utility | `--text-eyebrow` | `--rail-muted` | plain label, no chip fill |
| Section headline | Display | `--text-headline` | `--ink` | `max-w-[18ch]`, hangs off the rail |
| Question | Display | `--text-headline` | `--ink` open / `--rail-muted` closed | `max-w-[26ch]` so it never collides with the circle |
| Answer | Body | `--text-body` | `--rail-muted` | `max-w-[62ch]` |
| Circle | — | 40px | `--paper` on `--rail` hairline; inverts to `--ink` | glyph `--ink`, inverting to `--paper` |

Row rhythm: `py-6` at 360px rising to `py-8` at 1024px+. Hairline between rows at
`1px solid var(--rail)`, full opacity (§6.3). Gap between the headline and the first row:
`clamp(48px, 6vw, 72px)`.

**No hue.** Not on a rule, a glyph, a fill, or a focus ring — §6.1 is absolute outside feature
panels.

**Responsive.** 360 — question wraps to three lines, circle stays on the first line via
`items-start`, never shrinks (`shrink-0`), answer full width. 768 — same, more padding. 1024/1440 —
`max-w-[72ch]` block, whitespace to the right, rail nodes untouched.

**States.** Closed: muted question, pale circle. Hover: question goes `--ink`, circle fill goes
`--surface`. Open: question `--ink`, circle solid `--ink`. Focus-visible: `focusRing` on the
trigger, never removed.

## Motion spec

| What | Trigger | Duration | Ease | Reduced motion (§7.2) |
| --- | --- | --- | --- | --- |
| Question colour | hover / open | `--duration-micro` | `--ease-entrance` | unchanged — a colour change is not motion |
| Circle fill and glyph colour | open | `--duration-micro` | `--ease-entrance` | unchanged |
| Panel open/close | click | none — instant | none | unchanged |

No timeline, no ScrollTrigger, no tween, no `gsap.matchMedia()`. Nothing in this section can be
left frozen by a reduced-motion setting because nothing in it moves.

## Accessibility requirements

- One `<h2>` for the section; each question is an `<h3>` inside `AccordionPrimitive.Header`. Order
  h1 → h2 → h3 holds.
- Exactly one focusable control per row — the trigger. The circle is `aria-hidden` and is not a
  button (decision 2).
- `aria-expanded` and the trigger/panel association come from the primitive. Do not hand-roll them
  and do not add a redundant `aria-label` that repeats the question.
- Visible focus ring on every trigger, via `focusRing`. Never removed.
- Full keyboard operation: Tab between rows, Enter and Space toggle, and the primitive's own arrow-
  key behaviour is left as it ships.
- Contrast: the closed question is `--rail-muted` (6.13:1 on `--ground`), the answer is
  `--rail-muted`, and `--rail` carries no text at any opacity.
- No horizontal page scroll at any width.
- With JavaScript disabled the six questions render and are readable; the answers are not
  reachable. That is a stated consequence of decision 6, not a defect to fix in this prompt.

## Acceptance criteria

1. Six rows render at 360, 768, 1024, and 1440px with no horizontal page scroll.
2. More than one row can be open at the same time, and all six start closed.
3. Clicking the question **or** the circle toggles the row; there is exactly one tab stop per row.
4. The circle shows `+` closed and `−` open, and inverts to solid `--ink` when open.
5. Opening a row pushes the rows below it down instantly. No height, width, or margin is animated
   anywhere in the section.
6. No GSAP import appears in any file added by this prompt, and no `gsap.matchMedia()` call.
7. `components/ui/accordion.tsx` is unmodified.
8. Heading order is h1 → h2 → h3, verified in the rendered HTML.
9. No colour but `--ink`, `--ground`, `--surface`, `--rail`, `--rail-muted`, and `--paper` appears
   in the section.
10. The `#faq` stub is gone from `app/page.tsx`, the header nav, footer, and announcement links all
    land on the real section, and `page.tsx` still contains no layout maths, copy, or animation.
11. `grep -rn "placeholder: true" lib/copy/` still returns **fourteen** hits.
12. No new `@utility` was added to `app/globals.css`.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
```

`build` because a new client boundary lands on the route.

Paste real output for all four. **Lint must still be exactly three errors, in
`components/layout/wordmark.tsx`, `components/ui/carousel.tsx`, and `hooks/use-mobile.ts`** — the
same three files, not merely the same count. Any new error is a failure, including in a new file.
Note that `react-hooks/set-state-in-effect` is enforced in this repo: if a browser-only value is
ever needed, read it with `useSyncExternalStore` as `components/sections/copy-embed.tsx` does. This
section should need neither.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **Click the header's FAQ link.** It should land on the real section with the heading clear of the
   viewport top (`anchor-offset`), not on the old stub text.
2. **1440px.** Open rows 1, 3, and 5 together. Do the rules still read as separators rather than as
   decoration, and does the block still feel like the rest of the page with the whitespace on the
   right?
3. **Keyboard only.** Tab through all six rows — exactly six stops, ring visible on each, Enter and
   Space both toggle, and the circle is never focusable on its own.
4. **360px.** A three-line question must not collide with the circle, and the circle must stay on
   the question's first line rather than centring against the whole block.
5. **Read the six answers cold.** Any sentence that reads as a metric or a guarantee we have not
   decided is a bug — say which one and it is a single string in `lib/copy/faq.ts`.
6. **Reduced motion.** Toggle the OS setting and confirm the section behaves identically, because
   nothing in it is animated.

## Open questions this raises for later prompts

- **The three cut questions** (decision 4): pricing, security/data handling, and integrations. Each
  needs a product decision before it can be answered, and each is a question a real buyer will ask.
  Surface them to the user in the completion report; do not answer them here.
- **JavaScript-disabled answers.** Decision 6 accepts that the answers are unreachable without
  JavaScript. If that becomes unacceptable, the fix is `<details>`/`<summary>` and it is a rewrite
  of this component, not a patch — raise it before starting rather than after.
- **The last row's hairline.** Whichever way it goes, the Route section made the opposite choice
  (no rule after the last step). If they should match, that is a one-line change in both.
