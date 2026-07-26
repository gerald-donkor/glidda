# AGENTS.md

You are a **principal-level full-stack engineer and design-minded implementation agent** working on **Glidda**, a production-style marketing site for an AI product-guide platform.

Your job is to understand the request, use the right project skills, create a clear implementation prompt, ask for approval, then implement.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 1. Product

**Glidda** gives every new user a guide that walks them through your product — answering questions in-page, running a live demo of the real UI, and driving activation during onboarding. Customers embed Glidda with a snippet; Glidda reads their site and docs, builds guides, and runs them 24/7 in any language.

Audience: growth, onboarding, and product-led-sales teams at B2B SaaS companies (roughly 20–200 people) who have traffic and signups but lose people between "interested" and "activated".

The page's single job: convince that visitor to start a guide themselves, right now, without booking a call.

**Scope for now — the marketing landing page only.** One route, `/`, plus the shared shell, design system, and the persistent Ask bar. Sign-in, dashboard, pricing, docs, and blog are out of scope until added to this file.

Do not overbuild. Do not invent product features that are not listed in section 8.

---

# 2. Workflow

For every implementation request:

1. Read `AGENTS.md` and follow it as the highest-priority project guidance. `AGENTS.md` is the source of truth for implementation decisions. User requests override these rules only when the user explicitly asks for the deviation.
2. Read `node_modules/next/dist/docs/` for anything touching routing, server/client boundaries, fonts, images, metadata, or config. Never write Next.js code from memory.
3. Read the skills the user names, then any clearly needed supporting skill from section 3.
4. Inspect only the code and assets relevant to the approved prompt. Do not refactor unrelated parts of the repo.
5. Ask a focused question only where two readings of the brief would produce materially different work.
6. Create a detailed prompt file in `prompts/`.
7. Ask: `I prepared the implementation prompt at prompts/<file-name>.md. Is this good to execute?`
8. On approval, re-read the approved prompt file and implement it strictly. `y` / `Y` means `Approved. Execute.`
9. Run the checks in section 14.
10. Share exact steps to run and review the completed work.

Do not write component code before creating the prompt, unless the user explicitly says to skip prompt creation.

## Design references and assets

The two recordings in `ref/` are the only visual references in this repo. They are described in full in section 5 — read that section instead of re-deriving it. If you need a frame you can extract one with `ffmpeg`, but do not re-transcribe the whole video.

Do not invent, assume, or request design references that do not exist. Do not fabricate customer logos, testimonials, headshots, funding announcements, or metrics — see section 11.

---

# 3. Skills and docs

Use only these, and only when relevant:

| Source | Use it for |
| --- | --- |
| `node_modules/next/dist/docs/` | Routing, App Router conventions, server/client boundaries, `next/font`, `next/image`, metadata, config |
| `.agents/skills/shadcn` | Component composition, registry, styling, Base UI vs Radix, forms, icons |
| `.agents/skills/gsap-core` | Tweens, easing, `gsap.matchMedia()`, reduced motion |
| `.agents/skills/gsap-react` | `useGSAP`, refs, cleanup on unmount — **required** for every animation in this repo |
| `.agents/skills/gsap-timeline` | Sequencing the hero load and the vignette loops |
| `.agents/skills/gsap-scrolltrigger` | The Rail, scroll-linked reveals, section progress |
| `.agents/skills/gsap-utils` | `clamp`, `mapRange`, `toArray`, `wrap` |
| `.agents/skills/gsap-performance` | Transform-only animation, avoiding layout thrash |
| `.agents/skills/gsap-plugins` | Only if a specific plugin is actually needed; check licensing first |
| `frontend-design` skill | Aesthetic direction when a new surface has no spec yet |

Do not invent new skills. For Tailwind v4, TypeScript, and Zod, use existing project patterns and package docs.

**Animation library decision:** GSAP is the animation library for this project. `motion` is also installed; do not use both in one component, and do not add new `motion` usage without asking. Prefer GSAP for anything scroll-linked or sequenced.

---

# 4. Prompt files

Prompt files live in `prompts/`. Prefix filenames with a two-digit sequential number:

- `prompts/01-design-system.md`
- `prompts/02-app-shell.md`
- `prompts/03-hero.md`

When creating a new prompt: find the highest existing number, create the next one, never overwrite, never renumber.

Each prompt must include:

- goal
- skills and docs read
- existing code inspected
- decisions or assumptions
- files likely to change
- implementation requirements
- **visual spec** — layout, type scale, spacing, colour tokens, responsive behaviour, states
- **motion spec** — what animates, trigger, duration, easing, stagger, reduced-motion fallback
- accessibility requirements
- acceptance criteria
- checks to run
- exact manual review steps

For UI tasks, identify reusable components in `components/ui/` before creating new ones, and extend rather than duplicate.

---

# 5. Reference recordings — detailed observations

Both files in `ref/` are 1366×768 screen recordings of **handhold.io**, a live AI sales-agent product. They are captured in Chrome with browser chrome visible; ignore the tab strip, bookmarks bar, and status tooltips.

- `glidda-landing.webm` — 48s, a single continuous top-to-bottom scroll of the landing page.
- `interact-ui.webm` — 5m 45s, the same page with deliberate hover, click, focus, and typing on each interactive element.

These recordings are a **structural and interaction-mechanics reference, not a visual target.** See section 5.3 for the hard boundary.

## 5.1 Landing page structure (`glidda-landing.webm`)

Top to bottom, in scroll order:

**1. Announcement bar.** Full-width, page background, single centered line of small text, whole bar is one link. A trailing `→` glyph appears on hover and is absent at rest — the arrow slides in, the text does not move.

**2. Header.** Not sticky; it scrolls away with the page. Wordmark left (small mark + lowercase logotype). Right cluster: one dropdown nav item with a chevron, a plain text link, then a solid black pill button. Generous height, hairline bottom border, no shadow.

**3. Hero.** Center-aligned, and the most characteristic thing on the page. Two-line display headline at roughly 68–72px, tight leading (~0.95), a serif face. One line of small grey subcopy beneath. Then two buttons side by side: primary solid black pill with a small animated glyph on its left, secondary light-grey pill. Behind and below the buttons, a **continuously animating ribbon** spans edge to edge — a wide sine-like band with a grainy, dotted texture, painted in a warm amber that bleeds into a saturated blue at the wave's crossing points. It loops horizontally with a slow phase shift; over ~13s it visibly translates and re-forms, never resetting hard. It is the page's signature element and it overlaps both the CTA row and the logo band.

**4. Logo band.** Seven customer wordmarks in a single evenly spaced row, all rendered flat near-black, sitting on top of the tail of the hero ribbon. Static in the recording — no marquee scroll observed.

**5. Proof band.** Hairline rule above. Left: two big-number stats, each a large figure with a two-line small-caps-ish grey label beside it. Right: a short customer quote in body size, with a small round avatar, name, and role right-aligned underneath. All on one row, no cards, no borders.

**6. Demo block.** Full-width rounded panel (~24px radius) in a very pale warm grey. Centered inside it: a small eyebrow label, a display-size headline, one line of grey subcopy, a solid black pill CTA. Behind the text, a soft blurred 3D bust/figure in pale iridescent pastels, plus five small out-of-focus spheres floating at different depths. The spheres drift slowly and independently — depth-of-field parallax, not a single moving image.

**7. Section intro.** Left-aligned two-line display headline plus a two-line grey paragraph. Nothing else on the row.

**8. Three feature sections.** The core of the page and the most interesting mechanic. Each is a two-column row, alternating side:

| # | Eyebrow | Headline | Panel side | Panel hue |
| --- | --- | --- | --- | --- |
| 1 | Inbound Q&A agent | Help leads validate with AI chat | right | amber → blue |
| 2 | Demo agent | Give 1:1 demos at scale with an AI expert | left | greens |
| 3 | Onboarding agent | Provide tailored onboarding with an AI guide | right | oranges |

The text column has: a small pill eyebrow chip on a light grey fill, a two-line display headline, a large deliberate gap, then a **three-row accordion**. Each row is a plain sentence with a hairline rule under it; exactly one row is open at a time, revealing two lines of grey body copy. The open row also draws a **short accent underline that animates its width** — it acts as a progress bar for an auto-advance timer, so the accordion cycles on its own roughly every 4–5s and also responds to hover. Section 1's rows: engages visitors / qualifies leads / retains memory. Section 2: runs demo sessions / gathers insights / turns visitors into customers. Section 3: knows your product / navigates inside your UI / helps users reach goals.

The panel column is a tall rounded square (~1:1, ~500px) filled with an **animated grainy mesh gradient** in that section's hue — soft blobs that slowly morph and drift, heavy film grain over the top. Floating on it, a looping vignette that cycles two or three scenes:

- *Chat scene:* alternating bubbles — visitor bubbles right-aligned white, agent bubbles left-aligned tinted and semi-transparent. Ends with a two-option choice row ("See demo" / "Skip") where the recommended option is a solid blue pill with a small agent avatar chip attached at its left edge.
- *Visitor-info scene:* a header chip reading "Visitor info:" with an avatar, then five small white pills staggering in — company name, ARR, headcount, offering, goal.
- *Product-tour scene (section 2 and 3):* a simplified wireframe of an app — sidebar, grid of empty cards — with one card outlined in blue and a small blue arrow cursor pointing at it, plus a caption chip beneath ("Let me pull up our dashboard…"). Section 3's variant shows a floating agent card with a named agent, a question, an answer, and a thin progress bar.

Each vignette also carries a small **status chip with a spinner** ("Collecting insights…") and, in some scenes, a **live text input** reading "Chat with me…" with a blue circular send button — the mock is genuinely interactive, not a screenshot.

**9. Setup steps.** Left column: display headline, then three numbered steps. The number is set large in the display face on its own line, the step text is body size below it, with a hairline rule between steps. A solid black pill CTA at the bottom and one line of grey reassurance text under it. Right column: a rounded pale panel holding an overlapping product screenshot — a dark-sidebar dashboard behind, and a floating white card in front showing a code snippet with a "Copy embed code" affordance. The numbering is legitimate here: it is a real ordered sequence.

**10. Self-serve generator + capability cards.** Two columns. Left is a rounded pale panel: centered display headline, grey subcopy, then **three overlapping circles** in coral, amber, and green, each with a heavy grain texture and a small black glyph at its centre (dots and bars — an audio-waveform-like mark). Below them two lines of grey fine print, then a bordered text input and a solid black pill button on one row. Right column is a stack of three rounded pale cards, each with a display-size heading and one short grey line beneath.

**11. Testimonial carousel.** Small grey label, then one long pull-quote set large in the display face (three lines, ~30px). Below it, avatar + name + role on the left and a pair of circular prev/next buttons on the right. Manual only — no autoplay observed. Quotes swap with a crossfade, no horizontal slide.

**12. FAQ.** Small grey label, then six rows. Each row is a display-face question on the left and a circular `+` button on the right that becomes `−` when open — the open button also inverts to solid black. Multiple rows can be open at once. Hairline rules between rows; the answer is grey body copy that pushes the following rows down.

**13. Closing CTA.** Full-bleed band with a pale iridescent gradient wash. Two soft blurred hands reach in from the left and right edges, almost touching at the centre. Centered: one line of display copy and a solid black pill button. The hands are the visual pun on the product name.

**14. Footer.** Two-paragraph legal disclaimer in small grey text on the left, taking about 60% of the width. Two link columns on the right, each with a grey heading and three links. No social icons, no newsletter form, no bottom bar.

**15. Persistent Ask bar.** Fixed to the bottom centre of the viewport for the entire scroll, at every scroll position. A wide white rounded-full input with a subtle shadow and a small circular arrow button at its right. Its placeholder **types itself out character by character and deletes**, cycling three questions on a loop: "What does Handhold do?", "How long does Handhold take to set up?", "How much does Handhold cost?". This is the second signature element and the page's primary conversion device — the product demonstrating itself on its own marketing site.

## 5.2 Interaction inventory (`interact-ui.webm`)

Everything below was observed directly:

- **Announcement bar hover** — trailing arrow appears; text stays put.
- **Wordmark and nav hover** — cursor becomes a pointer; no colour or scale change on the wordmark.
- **Header buttons** — the black pill's background lightens slightly on hover; the "Sign in" link gains a pale rounded hover surface behind it, wider than the text.
- **Hero ribbon** — animates on load and forever after, independent of scroll and of the cursor. No scroll-scrub, no mouse parallax.
- **Logo band hover** — no state change.
- **Feature accordions** — auto-advance on a timer with the accent underline as the progress indicator; hovering a closed row opens it immediately and takes over from the timer. The panel vignette runs its own independent loop and does *not* reset when the accordion row changes.
- **Feature panels** — the mesh gradient morphs continuously. The vignette's "Chat with me…" input is focusable and typeable.
- **Sections do not pin.** Scrolling is ordinary document scroll throughout. No scroll-jacking, no pinned panels, no smooth-scroll hijack.
- **Generator input** — normal focus ring, accepts typing, adjacent button stays enabled.
- **Testimonial arrows** — hover darkens the circular button fill; clicking advances the quote and the attribution together via crossfade.
- **FAQ rows** — hovering the row highlights the question; clicking either the question or the `+` toggles it; the icon rotates/swaps to `−` and inverts to solid black; multiple rows stay open.
- **Footer "Contact us"** — a `mailto:` link.
- **Ask bar focus** — the important one. On focus the bar **grows upward into a small stack**: a horizontally scrollable row of three suggested-question chips slides in above the input, the placeholder switches from the typewriter loop to a static "Ask me anything…", a small green online-status dot appears inside the field at the right, and the send button turns from pale grey to solid black. Typing keeps the chips visible. Clearing the field restores the pale send button but the bar stays expanded while focused.

The recording ends without submitting a message, so the post-submit conversation UI is unknown. **Design ours from scratch** — do not guess at the reference's.

## 5.3 What we take, what we leave

**Take** — the page skeleton (section 8), the interaction mechanics in 5.2, and three specific structural ideas that are genuinely good: the auto-advancing accordion driving a paired visual panel, the persistent self-demonstrating Ask bar, and colour-coding each capability section by hue.

**Leave — non-negotiable.** handhold.io is a real, live company. Do not copy or near-copy:

- their name, wordmark, logotype, or any of the seven customer logos
- any headline, subhead, feature sentence, FAQ answer, testimonial, name, headshot, role, statistic, or funding claim
- the hero ribbon artwork, the blurred bust, the reaching hands, or the three grainy circles
- the warm-off-white + serif-display + grainy-mesh look as a package

If a prompt or a piece of generated copy would be recognisable as handhold.io with the name swapped, it is wrong. Glidda's identity is defined in section 6 and is deliberately different.

---

# 6. Glidda design system

The subject is a **guided line** — Glidda's product is a rail a user rides through software. Every design decision derives from that, and the reference's soft organic blobs are explicitly rejected in favour of engineered, directional forms: funicular and cable-car livery, signage, station markers, travel along a fixed track.

## 6.1 Colour

Six tokens. Define them as CSS custom properties in `app/globals.css` under the existing `@theme inline` block; never hardcode a hex in a component.

| Token | Hex | Role |
| --- | --- | --- |
| `--ink` | `#17191C` | Graphite. All text, the rail, all solid buttons. Not pure black. |
| `--ground` | `#E9EBEE` | Zinc mist. Page background. Cool, **not** cream. |
| `--surface` | `#F7F8F9` | Panels, cards, inset blocks. |
| `--rail` | `#8A94A0` | Steel. Hairlines, the rail's inactive length, muted text at ≥60% only. |
| `--signal` | `#FFC531` | Signal yellow. The active rail, progress underlines, the one accent. |
| `--paper` | `#FFFFFF` | Inputs, floating chips, the Ask bar. |

Three **route hues** exist only inside feature panels — one per section, never on text, never on the rail, never two at once:

| Route | Hex | Section |
| --- | --- | --- |
| `--route-signal` | `#FFC531` | Answers |
| `--route-cable` | `#2F6BE8` | Demos |
| `--route-spruce` | `#16736B` | Onboarding |

Dark mode is **not in scope**. Do not add a dark theme until this file says to.

## 6.2 Typography

Three roles, loaded through `next/font/google` (read the fonts guide in `node_modules/next/dist/docs/` for the current API):

- **Display — Archivo.** Variable, weight 600, tracking `-0.02em`, leading `0.95` at hero sizes. Engineered and signage-like, deliberately not a serif. If the width axis is exposed, set it wide (~115); if not, use tracking alone and do not fake it with `transform: scaleX`.
- **Body — Instrument Sans.** Weights 400/500. All paragraphs, accordion rows, buttons, inputs.
- **Utility — Martian Mono.** Weight 500, uppercase, tracking `0.12em`, 11–12px. Only for eyebrows, station labels, stat labels, and data chips. Its wide monospace is the "signage" voice — using it anywhere else dilutes it.

Type scale (fluid via `clamp()`, mobile → desktop):

| Role | Size | Face |
| --- | --- | --- |
| Hero | 44 → 84px | Display |
| Section headline | 30 → 52px | Display |
| Panel/card heading | 22 → 28px | Display |
| Pull-quote | 22 → 34px | Display |
| Body | 16 → 17px | Body |
| Small / muted | 14px | Body |
| Eyebrow / label | 11px | Utility |

Sentence case everywhere except Utility-face labels, which are uppercase.

## 6.3 Spacing, shape, and texture

- 4px base scale. Section vertical rhythm: `clamp(96px, 12vw, 176px)`.
- Content max-width 1200px, 24px gutters, 16px on mobile.
- Radii: `4px` inputs and chips, `12px` cards, `20px` large panels, `999px` buttons. Nothing between 4 and 12.
- Hairlines are always `1px solid var(--rail)` at 40% opacity. No box shadows anywhere except the Ask bar, which gets exactly one soft shadow to lift it off the page.
- **Texture — the slipstream.** Where the reference uses morphing blobs, Glidda uses long parallel streaks of the route hue, sheared ~12°, with an SVG `feTurbulence` grain overlay at low opacity. It must read as motion *along a line*, not as a lava lamp. One implementation, one component, reused with a hue prop.

## 6.4 Signature element — the Rail

A single continuous 1px vertical line, inset from the left content edge, that enters at the hero and runs the full length of the page. It carries **station markers** at each section: a small square node on the line plus a Utility-face label.

- Scroll progress paints the rail from `--rail` to `--signal` behind the viewport's midpoint, so the travelled portion is visibly behind you. Bind it to `ScrollTrigger` scrub, transform/opacity only.
- Section headlines hang off the rail — they align to it, they do not merely sit near it.
- Feature panels translate a short distance along the rail as their section passes, so they read as carried by it.
- Numbered steps are stations on the route. **This is the only place numbering is allowed** — it encodes a real ordered sequence. Do not add `01 / 02 / 03` decoration anywhere else.

On mobile the rail moves to the extreme left gutter, thins its station labels to nodes only, and keeps the progress paint.

Spend the boldness here. Everything else stays quiet.

---

# 7. Motion system

Motion is GSAP, always via `useGSAP` from `@gsap/react`, always scoped to a ref, always cleaned up. Read `.agents/skills/gsap-react` before writing any of it.

## 7.1 Rules

- **Transform and opacity only.** No animating `width`, `height`, `top`, `left`, `margin`, or `box-shadow`. Exception: the accordion progress underline may animate `scaleX` on a transformed element — never `width`.
- Durations: micro-interactions `0.15–0.25s`, entrances `0.5–0.7s`, ambient loops `8–20s`.
- Easing: `power2.out` for entrances, `power1.inOut` for loops, `power3.out` for anything that should feel arrested. No bounce, no elastic.
- Stagger entrances at `0.06s`. Never stagger more than 6 items.
- Register plugins once in a client module, not per component.
- Every `ScrollTrigger` must be created inside `useGSAP` so its revert is automatic. Never leave a trigger attached after unmount.

## 7.2 Reduced motion

Wrap every ambient or scroll-linked animation in `gsap.matchMedia()` with a `(prefers-reduced-motion: reduce)` branch. In that branch: the slipstream is a static gradient, the rail paints instantly to its final state, the accordion still auto-advances but without the underline sweep, the Ask bar placeholder shows one static string instead of typing, entrances become plain opacity fades. Nothing becomes unusable and nothing keeps moving.

## 7.3 The three orchestrated moments

Three, deliberately. Everything else is a 0.2s hover.

1. **Hero load.** One timeline: the rail draws down from the top edge, the headline's two lines rise and fade in staggered, subcopy and CTAs follow, the slipstream fades up last and begins its loop. Under 1.2s total.
2. **Rail progress.** Scroll-scrubbed for the whole page, as described in 6.4.
3. **Panel vignettes.** Per-section looping timelines that play the scenes in 5.1, independent of the accordion's timer. Pause them when the section is off-screen.

Anything beyond these three needs a reason stated in the prompt file.

---

# 8. Landing page structure

Glidda's `/` in scroll order. Sections are numbered here for reference; the numbers are not UI.

```
┌──────────────────────────────────────────────────┐
│  announcement bar                                │
├──────────────────────────────────────────────────┤
│  ▪ wordmark              nav · sign in · [start] │
├──────────────────────────────────────────────────┤
│ │                                                │
│ ├─▪ HERO — display headline, hangs off the rail  │
│ │   subcopy · [start a guide] [see it run]       │
│ │   ══════ slipstream ══════════════════          │
│ ├─▪ logo band                                    │
│ ├─▪ proof — 2 stats + 1 quote                    │
│ ├─▪ live demo panel                              │
│ ├─▪ section intro                                │
│ ├─▪ ANSWERS   [accordion ×3] │ panel (signal)    │
│ ├─▪ DEMOS     panel (cable)  │ [accordion ×3]    │
│ ├─▪ ONBOARDING[accordion ×3] │ panel (spruce)    │
│ ├─▪ ROUTE — 3 stations + embed screenshot        │
│ ├─▪ build your own guide  │ 3 capability cards   │
│ ├─▪ testimonial carousel                         │
│ ├─▪ FAQ                                          │
│ └─▪ closing CTA                                  │
├──────────────────────────────────────────────────┤
│  footer — disclaimer │ links                     │
└──────────────────────────────────────────────────┘
        ╭───────── Ask bar (fixed) ─────────╮
```

Mapping to the reference and what changes:

| Glidda section | Reference equivalent | Deliberate difference |
| --- | --- | --- |
| Announcement bar | same | Same shape and hover. Ours carries a product line, not a funding claim. |
| Header | same | Not sticky; the rail carries continuity instead. |
| Hero | same | Slipstream replaces the ribbon; headline hangs off the rail rather than centring. |
| Logo band | same | Static row of seven fictional wordmarks set in the Display face — see section 11.2. |
| Proof band | same | Same shape, placeholder figures. |
| Live demo panel | demo block | Slipstream backdrop instead of the blurred bust. No floating spheres. |
| Three capability sections | three feature sections | Same accordion + panel mechanic, our hues and slipstream texture, panels carried by the rail. |
| Route | setup steps | Three stations on the rail, not free-floating numbers. |
| Build your own guide | generator + cards | Input + button and three cards. Replace the three grainy circles with our own mark. |
| Testimonial carousel | same | Same crossfade, manual arrows. Three placeholder quotes, monogram avatars. |
| FAQ | same | Same multi-open accordion. |
| Closing CTA | same | Our own image concept — not hands. |
| Footer | same | Same two-column shape. |
| Ask bar | same | Same mechanic including the focus expansion. Post-submit UI is ours to design. |

## 8.1 The Ask bar

The single most important component. Fixed bottom centre, present at every scroll position, on every route we ever add.

- **At rest:** white rounded-full field, one soft shadow, pale circular send button, placeholder typing and deleting through a short question loop.
- **On focus:** expands upward — suggested-question chips row slides in above, placeholder becomes a static "Ask me anything", an online dot appears, send button goes solid `--ink`.
- **Keyboard:** reachable by Tab with a visible focus ring, `Escape` collapses it, chips are real buttons in the tab order, `Enter` submits.
- **On mobile:** it must not fight the on-screen keyboard or cover the primary CTA. Full-width minus gutters, and it collapses its chip row.
- **Post-submit behaviour is undesigned.** Do not build it without a prompt and approval. Until then the send button is present but inert, and that must be stated in the prompt, not hidden.

---

# 9. Architecture and file layout

Keep these layers separate:

```
app/
  layout.tsx          fonts, metadata, the shell
  page.tsx            landing route — composition only
  globals.css         tokens, @theme, base styles
components/
  ui/                 shadcn primitives — extend, don't fork
  layout/             header, footer, announcement-bar, rail
  sections/           one file per section in section 8
  motion/             slipstream, vignettes, typewriter
  ask/                the Ask bar
lib/
  utils.ts            cn()
  copy/               page copy as typed objects
    placeholder/      fabricated proof fixtures — section 11.1
  gsap/               plugin registration, shared eases
hooks/
```

Rules:

- **`app/page.tsx` composes sections and nothing else.** No layout maths, no copy strings, no animation.
- Each section component owns its own layout and motion, and reads its copy from `lib/copy/`.
- Copy lives in typed objects under `lib/copy/`, not inline in JSX — it makes the whole page's voice reviewable in one place and keeps a future i18n pass cheap.
- Server Components by default. `"use client"` only on components that actually need a hook, a ref, or an event handler — that is the Ask bar, the accordions, the carousel, the FAQ, the rail, and the motion components. Sections that are pure markup stay server components.
- One component per file. No barrel files.

---

# 10. Component rules

- Check `components/ui/` before building anything. It already has `accordion`, `carousel`, `input`, `button`, `badge`, `card`, `separator`, `tooltip`, `sheet`, and ~50 more.
- This project uses **`@base-ui/react`, not Radix.** Read `.agents/skills/shadcn/rules/base-vs-radix.md` before touching a primitive.
- `components.json` is configured with style `base-nova`, base colour `neutral`, lucide icons, RSC on. Do not change it without asking.
- Prefer composing shadcn primitives over hand-rolling. If a primitive needs a variant, add it via `cva` in that file rather than wrapping it in a new component.
- Icons: `lucide-react` only. No inline SVG icon sets.
- The logo band, the slipstream, the rail, the typewriter, and the vignettes have no shadcn equivalent — build those, and put them in `components/motion/` or `components/layout/`.

---

# 11. Copy rules

Copy is design material. Write it from the reader's side of the screen.

- Active voice. A button says exactly what happens: "Start a guide", not "Submit". The action keeps its name through the whole flow.
- Name things by what the customer controls, never by how we built it. "Guides", not "agent orchestration".
- Be specific over clever. No "supercharge", "unlock", "seamless", "revolutionise", "10x".
- Sentence case. No exclamation marks.
- Empty and error states get direction, not mood. Say what happened and what to do next. Errors do not apologise and are never vague.
- One job per element: a label labels, an example demonstrates, nothing does double duty.

## 11.1 Placeholder content policy

**Every section in section 8 renders with content. Nothing is omitted, nothing ships empty.** You cannot design a logo band against nothing, and a carousel with no quote in it tells you nothing about how a three-line pull-quote sits against its attribution row. Placeholder content is the design material for social proof until real content exists.

The risk being managed is not "the page looks unfinished" — it is "invented proof leaks into something a real person reads as true". So placeholders are **fictional by construction and removable in one pass**:

- **All fixture data lives in `lib/copy/placeholder/`.** Nothing fabricated is written inline in a component, ever. One directory to swap, one directory to grep.
- **Every fixture object carries `placeholder: true`.** It is a required field on the type, so a real record cannot be added without deleting the flag and a fake one cannot be added without setting it.
- **Company names are invented, and rendered as text wordmarks in the Display face — never as logo images.** Do not use a real company's name, logo, or trademark anywhere, not even temporarily, not even "just to check the spacing". A row of seven typeset invented names loads the layout exactly as well and cannot be mistaken for a customer claim.
- **No photographs of people.** Testimonial avatars are monogram circles — two initials on `--surface` in the Utility face. Never a stock face, never a generated face, never a real person's headshot.
- **Numbers read as placeholders on sight.** Use round, obviously-notional figures and pair each with the `PLACEHOLDER` marker below. Never a specific-looking figure like "37%" or "2.4× faster" — specificity is what makes a fabricated stat read as researched.
- **A visible marker, on by default outside production.** A small Utility-face `PLACEHOLDER` chip renders next to any fabricated proof block whenever `process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS !== "false"`. Default visible. Turning markers off is a deliberate act, and turning them off does not make the content real.
- **Before any public deploy**, grep for `placeholder: true` and report every hit. A public deploy carrying unswapped fixtures needs the user's explicit sign-off, stated in the completion report — not a silent pass.

Copy that is *not* a factual claim — headlines, feature sentences, FAQ answers, button labels, empty states — is ours to write freely under the rules above. It is not placeholder; it is the real copy until someone changes it. The policy in this section applies only to fabricated **proof**: customers, quotes, people, and metrics.

## 11.2 Fixture inventory

These are the fixtures to build. Use these exact values so the layout is designed against stable content.

**Logo band** — seven invented wordmarks, Display face, `--ink`, one even row:
`Halden` · `Rivetworks` · `Piperlane` · `Nomad Fleet` · `Coalspring` · `Tessellate` · `Bright Harbour`

**Proof band** — two stats plus one quote:

| Figure | Label |
| --- | --- |
| `50%` | fewer support tickets in week one |
| `2×` | more accounts reaching first value |

> "Placeholder quote. Two sentences, roughly forty words, so the proof band is designed against a realistic length rather than a short one. Replace before launch."
> — A. Mensah, Head of Growth, Rivetworks

**Testimonial carousel** — three quotes, each 30–45 words so the three-line pull-quote wraps are real, each attributed to an invented name, role, and one of the fixture companies above, each with a monogram avatar.

**Announcement bar** — one product line, not a funding claim: e.g. "Glidda now runs guides in 50+ languages. See what's new →". This is a product statement we intend to be true, so it is real copy, not a fixture — do not write it if it is not true.

**FAQ** — six questions with real answers we can stand behind. Not fixtures. If we cannot answer a question honestly, cut the question rather than invent an answer.

---

# 12. Quality floor

Meet this without announcing it in the UI:

- Responsive from 360px up. Test 360, 768, 1024, 1440. No horizontal page scroll ever — wide content scrolls inside its own container.
- Visible keyboard focus on every interactive element. Never remove an outline without replacing it.
- Full keyboard operation: accordions, FAQ, carousel, Ask bar, chips.
- Semantic headings in order. One `h1` — the hero.
- `prefers-reduced-motion` respected per section 7.2.
- Text contrast ≥ 4.5:1. `--rail` as text colour only at 60%+ opacity on `--ground`, and never for body copy.
- Decorative visuals — slipstream, rail, vignettes — are `aria-hidden`. Anything conveying real information is not.
- Images through `next/image` with explicit dimensions. Fonts through `next/font`. No layout shift on load.
- The page must be readable and navigable with JavaScript disabled, minus the animation.

---

# 13. Code standards

- TypeScript. No `any`. Explicit props types, no implicit `React.FC`.
- Small components, small functions. If a section file passes ~200 lines, extract a subcomponent.
- Centralise magic numbers — durations, breakpoints, the rail inset — in `lib/gsap/` or as CSS custom properties. Never repeat a duration literal.
- **CSS specificity:** Tailwind utilities in the markup are the default. When a component needs custom CSS, scope it and keep specificity flat — do not write a type-level selector (`.section`) and an element-level one (`.cta`) that fight over the same padding. Section spacing lives on the section element only; children never set their own outer margins.
- No unrelated refactors, no unrequested features, no dead code, no commented-out blocks.
- Safe error handling on anything async. No swallowed promises.
- No secrets in client code. There are no server routes in scope yet; when the Ask bar gets a backend, its model key is server-only and this file gets an environment-variable table.

---

# 14. Commands and checks

Run from the project root and report the real output:

- `npm run typecheck` — **this script does not exist yet.** Add `"typecheck": "tsc --noEmit"` to `package.json` as part of the first implementation prompt. Until then run `npx tsc --noEmit`.
- `npm run lint` — ESLint.
- `npm run build` — only when routes, config, fonts, or server modules changed.
- `npm run dev` — dev server for manual review.

After every implementation run typecheck and lint at minimum. Add build when routes or config changed. Do not claim a check passed without running it; paste the output.

For visual work, also state what you reviewed at 360px, 768px, and 1440px, and confirm the reduced-motion branch by toggling the OS setting.

Before any deploy that will be publicly reachable, run `grep -rn "placeholder: true" lib/copy/` and list every hit in the report, per section 11.1.

---

# 15. Open decisions

Do not resolve these silently. Bring them up when a prompt reaches them.

- **Post-submit Ask bar UI** — undesigned. Inline expanding thread, side sheet, or full takeover.
- **Ask bar backend** — no model provider chosen, no route, no rate limiting. Section 13's secrets rule applies the moment this lands.
- **Swapping the placeholders** — the logo band, proof stats, and testimonials all ship with fixtures per section 11. Swapping them for real customers, numbers, and quotes is a tracked task, not a discovered surprise. Until it happens, every deploy report lists the outstanding `placeholder: true` hits.
- **Closing CTA visual** — needs its own concept; must not be hands.
- **The Glidda mark** — no wordmark or logo exists yet. The header currently needs a text-only wordmark in the Display face.
- **Dark mode** — out of scope. The token set in 6.1 is light-only by design.
- **`motion` package** — installed and unused. Either commit to GSAP alone and remove it, or document where each library is used.

---

# 16. When in doubt

1. Keep it small.
2. Read the Next.js docs in `node_modules/next/dist/docs/` before writing framework code.
3. Use the relevant skill.
4. Preserve server/client boundaries.
5. Derive every colour and type decision from section 6.
6. Save a prompt before coding.
7. Ask if it is good to execute.
8. Implement after confirmation.
9. Run the checks.
10. Share exact review steps, and say plainly what you did not finish.
