# 17 — Fix the horizontal page scroll at 360px and 768px

## Goal

The page scrolls horizontally at 360px and 768px, which §12 forbids outright ("No horizontal page
scroll ever — wide content scrolls inside its own container"). Measured on the running dev server:

| Viewport | `document.documentElement.scrollWidth` | Verdict |
| --- | --- | --- |
| 360px | 736 | overflows by 376px |
| 768px | 795 | overflows by 27px |
| 1024px | 1024 | clean |
| 1440px | 1440 | clean |

This prompt fixes that and nothing else.

**It is not a redesign of the Route section.** No copy changes, no spacing changes, no new
component, no motion. The section should look identical at every width where it is already correct
— 1024px and 1440px must be pixel-unchanged.

Out of scope: the Ask bar and its backend (prompts 15 and 16), the outstanding `gemini-3.6-flash`
grounding run, the durable rate-limit store, and every other item in §15.

## Skills and docs read

- `AGENTS.md` §12 (the quality floor the bug violates, and the 360/768/1024/1440 test widths), §13
  (no unrelated refactors; CSS specificity — "Section spacing lives on the section element only"),
  §9 (each section component owns its own layout), §14 (checks).
- **No Next.js doc was read, and none is needed.** This touches no route, no config, no font, no
  image, no metadata, and no server/client boundary — it is two utility classes in existing markup.
  Reading a routing guide to justify a `min-width` would be theatre.
- **No GSAP skill was read.** Nothing animates here. The Route section's motion is untouched.
- The `shadcn` skill is not involved: `<pre>`, `<ol>`, and the panel are plain markup, not
  primitives, and `components/ui/` has nothing to extend for this.

## Existing code inspected

- **`components/sections/route.tsx:25`** — `<div className="grid gap-12 lg:grid-cols-2 lg:gap-16">`
  with two children: the text column `<div>` (line 26) and `<EmbedPanel />` (line 77).
- **`components/sections/embed-panel.tsx:21`** — the panel's root, the second grid child.
- **`components/sections/copy-embed.tsx:86`** — the `<pre className="overflow-x-auto …">` wrapping
  the snippet. **Its author already anticipated exactly this bug**; the comment above it reads
  "Scrolls inside its own box: one script tag is wider than 360px and §12 forbids horizontal page
  scroll." The intent is correct and the markup is correct. What is missing is the one thing that
  lets `overflow-x: auto` actually engage.
- `lib/copy/route.ts:58` — `snippet` is
  `<script src="https://cdn.glidda.com/guide.js" async></script>`: a single token with no break
  opportunity, 634px wide at `--text-small` in the mono face.
- A grep for `<pre` across `app/` and `components/` returns **one** hit, so this is the only place
  the pattern occurs today.

## Decisions and assumptions

### 1. The cause is `min-width: auto` on a grid item, not the `<pre>`

A grid item's automatic minimum size is its **min-content** width, not zero. The snippet is one
unbreakable 634px token, so the panel's min-content is 634px+, so the single-column grid track at
360px is sized to 708px, so the section — and the document — is 708px wide. `overflow-x: auto` on
the `<pre>` never gets a chance to fire, because nothing upstream ever constrains the `<pre>`: it is
handed a box wider than the viewport and fills it.

This is why the bug is invisible at 1024px and 1440px. There the grid is two columns and the track
has room, so the min-content floor is never reached.

Diagnostic evidence, from walking every overflowing element up to its first clipping ancestor: the
slipstream layers extend past the viewport at *every* width but are correctly clipped by
`.slipstream` (`overflow-x: hidden`) and contribute nothing. The only unclipped overflowing elements
are the Route section's `<ol>`, its `<li>`s, and the text column `<div>` — all of which are merely
*stretched to* the oversized track. The panel is what sizes it.

### 2. The fix is `min-w-0` on both grid children

`min-width: 0` releases the automatic minimum, the track collapses to the available width, and the
`<pre>`'s existing `overflow-x: auto` takes over — the snippet scrolls inside its own box, which is
precisely what §12 asks for and what the code already tried to do.

**Verified live before writing this prompt**, by setting `min-width: 0` on the grid's children in
the running page and re-measuring:

| Viewport | scrollWidth before → after | `<pre>` box vs content | Scrolls internally |
| --- | --- | --- | --- |
| 360px | 736 → **360** | 242 vs 634 | yes |
| 768px | 795 → **768** | 583 vs 634 | yes |
| 1024px | 1024 → **1024** | 306 vs 634 | yes |
| 1440px | 1440 → **1440** | 338 vs 634 | yes |

1024 and 1440 are unchanged, which is the evidence that this is a fix and not a re-layout.

**Both children get it, not only the panel.** Only the panel needs it today. The text column is
given it as well so the track's sizing is stated rather than incidental: a long URL or an
unhyphenated product name landing in `lib/copy/route.ts` later would otherwise reintroduce exactly
this bug in the other column, and the failure mode — a page that scrolls sideways only below
1024px — is one nobody notices for weeks.

### 3. `min-w-0` in the markup, not a rule in `globals.css`

§13 makes Tailwind utilities in the markup the default and reserves scoped CSS for cases the
utilities cannot express. Two utility classes express this exactly. Adding a `.route-grid` rule to
`globals.css` would be a new selector, a new name to learn, and a specificity question, for
something one class already says.

### 4. Not fixed here: making the snippet wrap

Breaking the snippet across lines would also remove the overflow, and is the wrong fix. A wrapped
`<script src="…">` is harder to read and harder to retype correctly, and `copy-embed.tsx`'s comment
already rejected `white-space` and tracking changes for that reason. The snippet stays one line and
scrolls; only its container's sizing changes.

## Files likely to change

| File | Change |
| --- | --- |
| `components/sections/route.tsx` | edit — add `min-w-0` to the text column `<div>` (line 26) |
| `components/sections/embed-panel.tsx` | edit — add `min-w-0` to the panel root `<div>` (line 21) |

Two classes. Explicitly **not** modified: `components/sections/copy-embed.tsx` (its markup and its
comment are already right), `lib/copy/route.ts`, `app/globals.css`, `app/page.tsx`, every other
section, the Rail, the Ask bar, and anything under `lib/ask/` or `app/api/`.

## Implementation requirements

- Add `min-w-0` to the two grid children named above. Nothing else.
- Do not reorder, rename, or reformat surrounding classes.
- Do not touch the `lg:` variants — the two-column layout is correct and must stay byte-identical.
- If either file has a comment that would now be misleading, update it; do not add a comment
  restating what `min-w-0` does.

## Visual spec

No intended visual change at 1024px or 1440px — those must be pixel-identical before and after.

At 360px and 768px the Route section becomes narrower, because it stops being wider than the
screen. Everything inside it — headline, the three stations, their hairlines, the CTA, the panel —
reflows to the correct content width and the existing spacing tokens continue to apply unchanged.
The snippet's `<pre>` shows a horizontal scrollbar within its own rounded chip, per §12.

No colour, type, radius, spacing, or hairline token changes.

## Motion spec

None. No tween is added, removed, or retimed, and no `ScrollTrigger` is touched. The Rail's
progress paint is unaffected — it is a separate element and was never part of the overflow.

## Accessibility requirements

- Unchanged, and this is the point: the `<pre>` keeps a real scroll container, which is
  keyboard-scrollable and reachable. Do not add `tabindex` and do not remove the scrollbar.
- The `<ol>` stays an `<ol>`; the numerals stay `aria-hidden`; the copy button and its `aria-live`
  status line are untouched.
- Removing the horizontal page scroll is itself an accessibility improvement: a page that scrolls
  sideways at 360px is a reflow failure for anyone at that width or at high zoom.

## Acceptance criteria

1. `document.documentElement.scrollWidth === window.innerWidth` at **360, 768, 1024, and 1440**.
2. The snippet is still one unwrapped line and still scrolls inside its own `<pre>`.
3. The Route section at 1024px and 1440px is visually unchanged.
4. The copy button still copies, and the failure path still selects the snippet and reports it.
5. The diff is confined to the two files in the table above, and adds no rule to `globals.css`.
6. `grep -rn "placeholder: true" lib/copy/` still returns **seventeen** hits.
7. Typecheck and build clean; no new lint error.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
```

**The lint bar:** exactly three pre-existing errors, one each in `components/layout/wordmark.tsx`,
`components/ui/carousel.tsx`, and `hooks/use-mobile.ts` — the same three files, not merely the same
count. Any new error is a failure.

`npm run build` is included because §14 asks for it when routes or config change — they do not here,
so it is a belt-and-braces run rather than a requirement, and it is cheap.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **At 360px**, scroll to the Route section and try to drag the page sideways. It must not move.
   Confirm numerically in the console: `document.documentElement.scrollWidth` equals
   `window.innerWidth`.
2. **Drag the snippet sideways.** It must scroll *inside* its rounded chip while the page stays put.
   That is the §12 behaviour: wide content scrolls in its own container.
3. **Repeat at 768px**, which overflowed by only 27px and is the easier one to miss by eye.
4. **At 1024px and 1440px**, compare against `main`. The section must look identical — if the panel
   or the station rows shifted, the fix went further than intended.
5. **Click "Copy embed code"** and paste. The snippet must arrive intact on one line.
6. **Sweep the rest of the page at 360px** for any other section that scrolls sideways. A grep found
   only one `<pre>` in the repo, and a full-page ancestor walk at 360 and 768 found no other
   unclipped overflowing element — but the sweep is cheap and this bug survived several prompts.

## Open questions this raises for later prompts

- **Nothing guards this.** The bug shipped through prompt 10 and survived every prompt since,
  because no check measures page width — §14's visual review is a human step and this is 27px at
  768. A cheap regression guard (a script that loads `/` at the four widths and asserts
  `scrollWidth === innerWidth`) would catch the whole class. It needs its own prompt, and a decision
  about whether this repo wants a test runner at all — it currently has none.
- Unchanged and still open from §15: the durable rate-limit store, Ask bar multi-turn, the spend
  ceiling, swapping the placeholders, the closing-CTA visual, and the Glidda mark.
