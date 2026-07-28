# 15 — The Ask bar's post-submit UI and its backend

## Goal

Make the Ask bar answer. §8.1 calls it "the single most important component" and "the page's primary
conversion device", and today its send button is deliberately inert — `ask-bar.tsx`'s `handleSubmit`
calls `preventDefault()` and stops. This prompt resolves the first two items in §15: the post-submit
UI, and the backend behind it.

**Both were open decisions, and both were settled by the user before this prompt was written:**

- **Post-submit UI — inline expanding thread.** The bar grows upward into a scrollable thread above
  the field and stays fixed bottom-centre. Rejected: a side sheet (covers a third of the page and
  needs a dismissal affordance the page does not otherwise have) and a full takeover (abandons the
  marketing page mid-scroll and loses the reader's place).
- **Backend — a real route, not a stub.** An App Router route handler streaming from a real model
  provider, with a server-only key, rate limiting, and designed error and timeout states.

Out of scope, explicitly: conversation persistence across reloads, multi-turn history beyond the
current page session, authentication, analytics, and any change to a page section, the Rail, the
header, or the footer. The thread lives and dies with the tab.

## Skills and docs read

- `AGENTS.md` **§8.1 (the whole section — the mechanic this extends)**, §5.1 row 15 and §5.2's final
  paragraph (the reference's focus expansion, and its recording ending before submit — "**Design ours
  from scratch — do not guess at the reference's**"), §6.1 (monochrome chrome — the thread is page
  chrome, so no route hue anywhere in it), §6.2 (`--text-body` for message text; the Display face is
  never body copy), §6.3 (radii; **the Ask bar is the one element permitted a shadow**), §7.1–7.2
  (transform/opacity only, reduced motion), §9 (`components/ask/`, `lib/copy/`), §10, §11 (error
  states get direction, not mood), §12, **§13 (secrets — "when the Ask bar gets a backend, its model
  key is server-only and this file gets an environment-variable table")**, §14, §15.
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` — `route.ts` in `app/`,
  the exported-method convention, `POST` is never cached, and a `route.ts` may not sit at the same
  segment as a `page.tsx`.
- `node_modules/next/dist/docs/01-app/02-guides/streaming.md` § "Streaming in Route Handlers" — the
  `ReadableStream` + `TextEncoder` + `new Response(stream, …)` shape, including the
  `X-Content-Type-Options: nosniff` header it sets.
- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` — `.env*` → `process.env`,
  unprefixed variables stay server-side, `NEXT_PUBLIC_` is the browser opt-in, `.env*` is gitignored
  by the template.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/`
  — `runtime` (`'nodejs'` default) and `maxDuration`.
- The `claude-api` skill — current model IDs, the streaming helper, thinking/effort semantics on the
  chosen model, prompt caching, and the typed error classes. **Everything in "Model and request
  shape" below comes from that skill, not from memory.**
- `.agents/skills/gsap-react` — `useGSAP`, scoped refs, cleanup; and `.agents/skills/gsap-core` for
  `gsap.matchMedia()`.

Deliberately **not** read: `.agents/skills/gsap-scrolltrigger` (nothing here is scroll-linked) and
`.agents/skills/shadcn` beyond what `ask-bar.tsx` already uses — the thread is composed from the
existing `Button` plus plain markup; there is no shadcn primitive for a message list, and §10 says to
build the ones that have no equivalent.

## Existing code inspected

- **`components/ask/ask-bar.tsx`** — the file this prompt changes most. Already has: the shell ref,
  `focused`/`hasValue` state, `handleBlurCapture` (focus tracked on the shell so moving to a chip
  keeps it expanded), `Escape` handling, `handleChipSelect`, and the inert `handleSubmit` with its
  comment explaining exactly why. Note the input is **uncontrolled** — `handleChipSelect` writes
  `input.value` directly and `hasValue` is derived in `onChange`. That stays; see decision 4.
- **`components/ask/ask-chips.tsx`** — the pattern the thread follows: absolutely positioned out of
  flow so revealing it changes no layout anywhere on the page, `inert` while collapsed to drop it
  from the tab order *and* the accessibility tree in one attribute, and a `useGSAP` +
  `gsap.matchMedia()` opacity/`y` tween with a reduced-motion branch. **This is the template.**
- `hooks/use-typewriter-placeholder.ts` — the `paused` prop already exists. It is paused on focus; it
  must also pause once a thread exists (decision 5).
- `app/globals.css` — `--ask-bar-height: 56px`, `--z-ask: 50`, `--shadow-ask`, `ask-bar`,
  `ask-chips-row`, `ask-bar-reserve` (the footer already reserves the bar's height), `rounded-panel`,
  `rounded-pill`, `--duration-micro`, `--ease-entrance`.
- `lib/copy/shell.ts` — the `ask` object (`restQuestions`, `focusPlaceholder`,
  `reducedMotionPlaceholder`, `chips`) and the `shell` const of a11y labels. New strings extend
  these rather than starting a new module — see decision 8.
- `lib/copy/faq.ts`, `lib/copy/build-guide.ts`, `lib/copy/capabilities.ts`, `lib/copy/route.ts` —
  the page's own answers. These become the model's grounding (decision 3).
- `package.json` — **`@anthropic-ai/sdk` is not installed.** `zod@4.4.3` is present in
  `node_modules` but is **not** a declared dependency; both must be added explicitly.
- `components/ui/button.tsx` — the `pill` / `chip` variants and `focusRing` the thread reuses.

## Decisions and assumptions

### 1. The thread is part of the Ask bar, not a new surface

`AskThread` renders inside the existing `ask-bar` shell, above the form, in the same stacking
context — so the one permitted shadow (§6.3) still belongs to one element, and the bar remains the
single fixed thing on the page. Like `AskChips`, it is **absolutely positioned out of flow**: the
form stays exactly where it is at every point, the page behind never reflows, and the reveal is a
pure opacity + `y` tween (§7.1).

The thread and the chips row occupy the same space above the field, so **they are mutually
exclusive**: chips show while the thread is empty, the thread replaces them on the first message.
Rendering both would stack two panels over the page and push the thread's top edge off-screen at
768px and below.

### 2. Model, request shape, and why

Per the `claude-api` skill, which is authoritative over recalled patterns:

- **Model: `claude-opus-5`.** The skill's default and the current flagship. Do not substitute a
  smaller model for cost — that is the user's call, not ours.
- **Streaming, via the SDK's `client.messages.stream(...)`.** Non-negotiable here: the reader is
  watching a fixed bar at the bottom of a marketing page, and a four-second blank pause reads as
  broken. Streaming also keeps the request under HTTP timeouts.
- **`thinking: { type: "adaptive" }` with `output_config: { effort: "low" }`.** Thinking is **on by
  default** on this model — omitting the field does not disable it — and `max_tokens` caps thinking
  *plus* response text together, so it must be sized for both. `low` effort is right for short
  grounded answers about one product and is where the latency budget goes.

  The skill documents two failure modes for `thinking: { type: "disabled" }` on this model — tool
  calls emitted as plain text, and `<thinking>` tags leaking into the visible response — and
  recommends low effort with thinking on over disabling it. We have no tools, so only the second
  would apply, but the recommendation stands and we follow it. **Do not "optimise" this to
  `disabled` without measuring.** If a future prompt does, it must also stay at effort `high` or
  below, because `disabled` + `xhigh`/`max` is a 400 on this model.
- **`max_tokens: 2048.** Enough for a several-paragraph answer plus thinking headroom. Answers are
  short by design (decision 3), so this is a ceiling, not a target.
- **Prompt caching** via `cache_control: { type: "ephemeral" }` on the system block. The grounding
  block is the same bytes on every request, and the cacheable minimum on this model is 512 tokens —
  the assembled grounding clears that comfortably. The caching rule that matters: **the system
  prompt must be byte-identical every time.** No timestamp, no request ID, no per-user string
  anywhere in it, or nothing ever caches. Assemble it once at module scope, not per request.

Rejected: the Batches API (wrong shape entirely — this is interactive), and any agentic/tool-using
setup. This is a single grounded Q&A call. §16.1 — keep it small.

### 3. The model answers only from the page's own copy

The Ask bar sits on a marketing page for a product that does not exist yet. An unconstrained model
will happily invent pricing, integrations, SOC 2 status, and customer names — which is exactly the
failure §11.1 exists to prevent, arriving through a channel §11.1 never anticipated. **Fabricated
proof generated at runtime is still fabricated proof**, and it is worse than a fixture because
nothing marks it and no grep finds it.

So the system prompt is assembled **from the copy modules themselves** — `faq.rows`,
`buildGuide`, the capability copy, and the Route steps — and instructs the model to answer only from
that material and to say plainly when it cannot. It is not a hand-written duplicate of the page's
claims, which would drift the moment someone edits a copy module.

Three rules go in the system prompt, and they are the load-bearing part of this whole prompt:

- Answer only from the provided material. If the answer is not in it, say so and point to the FAQ or
  `hello@glidda.com` — do not infer, extrapolate, or guess.
- **Never state a price, a customer name, a metric, a percentage, a timeline, or a compliance
  certification.** The page's placeholder proof is fictional (§11.1) and must not be repeated as
  fact, and anything not on the page does not exist.
- Follow §11's voice: active, specific, sentence case, no exclamation marks, no "supercharge" /
  "unlock" / "seamless". Two or three sentences unless the question genuinely needs more.

Also per §11.1's spirit: the placeholder fixtures are **excluded** from the grounding. The model is
never shown the fake quotes, the fake stats, or the invented company names, so it cannot repeat them
even if asked directly.

### 4. Client state — messages in `AskBar`, input stays uncontrolled

`AskBar` gains `messages: AskMessage[]` and `status: "idle" | "streaming" | "error"`. The thread is a
prop-driven presentational component; `AskBar` owns the state and the fetch.

**The input stays uncontrolled.** It already is, `handleChipSelect` already writes `.value` directly,
and converting it to a controlled input would rewrite working focus/blur logic for no benefit —
§13's no-unrelated-refactors rule. Submit reads `inputRef.current.value`, clears it, and sets
`hasValue` to false.

Streaming accumulates into the last assistant message. **Do not `setState` per chunk without
batching** — React 19 batches automatically inside the fetch continuation, but the reader loop must
append to the existing message object rather than pushing a new one per delta.

An `AbortController` is stored in a ref: a second submit while streaming aborts the first. The
component's unmount cleanup aborts too, so a pending fetch cannot `setState` after unmount.

### 5. What happens to the typewriter and the chips

Once the thread has a message the bar is no longer advertising itself, so:

- The typewriter placeholder **pauses permanently** (`paused: focused || messages.length > 0`) and
  the placeholder becomes the static `ask.focusPlaceholder`. A placeholder cycling questions above a
  live conversation is the label doing double duty, which §11 forbids.
- The chips row hides for good once the first message exists (decision 1).

### 6. Rate limiting — in-memory, and honest about it

The route gets a fixed-window limiter keyed by client IP, in a module-scope `Map`: **8 requests per
60 seconds**, plus a cheap 600-character cap on the question and a rejection of anything empty.

**State this limitation in the completion report rather than letting a reviewer find it.** A
module-scope `Map` is per-process. On a single dev server or a single long-lived Node process it
works exactly as intended. On a serverless platform with per-request isolates it degrades to
approximately nothing — each cold start begins with an empty map. It is a speed bump against a
casual loop, not a defence against a determined one.

The honest alternative is a shared store (Redis, Upstash, a platform rate-limit primitive), and that
is **infrastructure this project does not have and should not acquire inside a prompt about a chat
UI**. So: implement the in-memory limiter, comment it with exactly this caveat, and add "a durable
rate-limit store before any public deploy" to §15's open decisions. A public deploy of this route
without one is a decision the user makes with the limitation stated, not a surprise.

The IP comes from `x-forwarded-for` (first entry) falling back to `x-real-ip` and then a literal
`"unknown"` bucket. Note in the code comment that both headers are client-supplied and trivially
spoofed unless a trusted proxy sets them — same caveat, same reason it is a speed bump.

Also: `maxDuration = 30` and `runtime = "nodejs"` (the default, stated explicitly because a streaming
handler holding a connection is exactly where someone would later reach for `edge` and should have to
make that change deliberately).

### 7. Errors and the missing key

Four failure paths, each with copy in `lib/copy/shell.ts` and each rendering in the thread as an
assistant-slot message with the error styling, never as a browser `alert` or a silent no-op:

| Case | HTTP | What the reader sees |
| --- | --- | --- |
| Empty or over-long question | 400 | Client-side guard; the form does not submit at all |
| Rate limited | 429 | "That's a lot of questions at once. Give it a minute and ask again." |
| Missing/invalid API key, provider error, timeout | 500/502 | "Something went wrong answering that. Try again, or email hello@glidda.com." |
| Network failure / abort | — | Same as above, except a user-initiated abort renders nothing |

§11: errors say what happened and what to do next, they do not apologise, and they are not vague.

**The key is validated at request time, not at module scope.** `process.env.ANTHROPIC_API_KEY` is
read inside the handler and a missing key returns the 500 path — because throwing at module scope
would break `npm run build` on any machine without the key, including CI, which is a worse failure
than a degraded Ask bar. The dev-time signal is a `console.error` on the server, never a detail in
the response body: §13's no-secrets rule extends to not telling a client *why* auth failed.

`.env.local` holds the key and is already gitignored by the Next.js template. `.env.example` is
committed with the variable name and no value.

### 8. Copy lives in `lib/copy/shell.ts`, grounding in its own module

The new UI strings (error messages, the thread's a11y labels, the streaming indicator's label) join
the existing `ask` object in `lib/copy/shell.ts` — same surface, same module, §9's rule that copy is
reviewable in one place.

The **grounding assembly** is different in kind: it is not page copy, it is a prompt. It gets
`lib/ask/system-prompt.ts`, a new `lib/ask/` directory, so that a reviewer auditing what the model
is allowed to say has exactly one file to read. It imports from `lib/copy/` and exports one
assembled string constant.

### 9. Motion

One tween, following `ask-chips.tsx` exactly: the thread panel fades and rises `8px` on first
appearance, `--duration-micro`, `--ease-entrance`, with a `gsap.matchMedia()` reduced-motion branch
that fades without rising. Auto-scrolling the thread to the newest message uses
`scrollTop` assignment (`behavior: "auto"` under reduced motion, `"smooth"` otherwise) — that is
scroll position, not an animated property, so §7.1's transform-only rule is not in play.

The streaming indicator is three dots at `--rail-muted` with a staggered opacity loop —
`0.06s` stagger per §7.1, static at full opacity under reduced motion. This is a fourth ambient
motion beyond §7.3's three, and the stated reason §7.3 requires is: **it is the only signal that the
model is working before the first token arrives**, and its reduced-motion branch is a static
element that still communicates the same state.

## Files likely to change

| File | Change |
| --- | --- |
| `package.json` | edit — add `@anthropic-ai/sdk` and `zod` to `dependencies` |
| `.env.example` | new — `ANTHROPIC_API_KEY=` with a comment, no value |
| `lib/ask/system-prompt.ts` | new — assembled grounding, one exported constant |
| `lib/ask/types.ts` | new — `AskMessage`, the request/response Zod schema |
| `lib/ask/rate-limit.ts` | new — the in-memory limiter and its caveat comment |
| `app/api/ask/route.ts` | new — `POST` handler, streaming, server-only key |
| `components/ask/ask-thread.tsx` | new — the thread panel (client) |
| `components/ask/ask-message.tsx` | new — one message row (client or server; presentational) |
| `components/ask/ask-bar.tsx` | edit — state, submit, fetch, thread/chips swap |
| `lib/copy/shell.ts` | edit — new strings on the `ask` object |
| `app/globals.css` | edit — `ask-thread` utility and a `--ask-thread-max-h` token |
| `AGENTS.md` | edit — §13 environment-variable table; §15 updated |

Explicitly **not** modified: every file under `components/sections/`, `components/layout/`,
`lib/copy/placeholder/`, `lib/gsap/`, `app/page.tsx`, `app/layout.tsx`, and `components/ui/*`.

## Implementation requirements

### `app/api/ask/route.ts`

```ts
export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: Request) { … }
```

Order of operations, and it matters:

1. Rate-limit check on the derived IP → `429` with a JSON body before any parsing or model call.
2. `await request.json()` inside a `try` → malformed JSON is a `400`, never an unhandled rejection.
3. Zod-parse the body (`{ question: string }`, trimmed, 1–600 chars) → `400` on failure.
4. Read `process.env.ANTHROPIC_API_KEY`; missing → `console.error` server-side, `500` with the
   generic message.
5. `client.messages.stream({ … })`, then pipe its text deltas into a `ReadableStream` per the Next.js
   streaming guide, returning `new Response(stream, { headers: { "Content-Type": "text/plain;
   charset=utf-8", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" } })`.

**Plain text, not SSE.** The client needs one thing — the next chunk of an answer — and
`text/plain` + `TextDecoder` is the whole protocol. SSE would add framing, an event vocabulary, and a
parser on both ends to carry exactly the same payload. If a later prompt adds citations or tool
status, that is when the format earns its complexity.

Errors thrown *after* the stream has started cannot become an HTTP status — the status is already
sent. Catch them inside the stream's `start`, log server-side, and `controller.close()`; the client
treats a truncated stream with no content as the generic error, and a truncated stream with partial
content as a complete-enough answer. Never `controller.error()` with a provider message attached —
that can leak provider detail to the client.

Use the SDK's typed error classes (`RateLimitError`, `APIConnectionError`, `APIStatusError`) in a
most-specific-first chain, per the `claude-api` skill. **Never string-match error messages.**

### `lib/ask/system-prompt.ts`

One exported `const SYSTEM_PROMPT: string`, assembled at module scope from the copy modules. A header
comment stating that this is the complete set of claims the model may make, that placeholder fixtures
are deliberately excluded, and that the string must stay byte-identical across requests for prompt
caching to work.

The three rules from decision 3 go in verbatim.

### `components/ask/ask-thread.tsx`

Client component. Props: `{ messages: AskMessage[]; status: AskStatus }`.

- Root: `ask-thread` utility (absolute, bottom-anchored above the form, `overflow-y: auto`,
  `max-height: var(--ask-thread-max-h)`, `rounded-panel`, `bg-paper`).
- `role="log"` with `aria-live="polite"` and `aria-label={shell.askThreadLabel}` — a live region so a
  screen-reader user hears answers arrive. **`polite`, never `assertive`**: this interrupts nothing.
- `inert` when `messages.length === 0`, exactly as `AskChips` does.
- The `useGSAP` reveal from decision 9, keyed on whether the thread has become non-empty.
- Auto-scroll to bottom in a `useEffect` on `messages` — guarded so a reader who has scrolled up to
  re-read an earlier answer is not yanked back down mid-read.
- The streaming indicator renders as the last row when `status === "streaming"` and the last message
  has no text yet.

### `components/ask/ask-message.tsx`

Presentational. `{ message: AskMessage }`. A visitor message is right-aligned on `--surface`; an
assistant message is left-aligned on `--paper` with a hairline. Both `--text-body`, `--ink`, wrapping
freely, `rounded-panel` at the smaller radius. An error message uses the same assistant slot with
`--rail-muted` text — **no red, no coloured icon**: §6.1 has no error colour and this prompt does not
invent one. The distinction is carried by the wording, which §11 requires to be specific anyway.

### `components/ask/ask-bar.tsx`

The existing focus/blur/Escape/chip logic is **unchanged**. Added:

- `messages`, `status`, `abortRef`.
- `handleSubmit` becomes real: guard on empty/over-long, append the visitor message and an empty
  assistant message, clear the input, `POST /api/ask`, read `response.body` with a
  `TextDecoder`, append deltas to the last message, set `status` on completion or failure.
- `Escape` currently blurs. It keeps doing that; it does **not** clear the thread. Destroying a
  reader's answers with a keystroke that elsewhere on this page just closes something is a trap.
- The comment block explaining the inert send button is **replaced**, not deleted — it becomes the
  comment explaining what post-submit now does and what is still out of scope (persistence,
  multi-turn).

### `AGENTS.md`

Two edits, both required by the file itself:

- **§13 gains the environment-variable table** it says it will gain "the moment this lands":
  `ANTHROPIC_API_KEY` — server-only, required by `app/api/ask/route.ts`, never `NEXT_PUBLIC_`.
- **§15 is updated**: the post-submit UI and the backend rows are resolved (with a one-line record of
  what was chosen), and a new open decision is added — **a durable rate-limit store before any
  public deploy** (decision 6).

## Visual spec

**Thread panel.** Sits directly above the form inside the bar, `12px` gap, same width as the bar
(`min(560px, 100% - gutter*2)`). `--paper` fill, `1px solid var(--rail)` hairline, `14px` radius,
**no shadow of its own** — it sits inside the element that already owns the page's one shadow (§6.3).
`max-height: min(52vh, 420px)`, scrolling inside itself. Padding `16px`; `12px` between messages.

| Element | Face | Size | Colour | Notes |
| --- | --- | --- | --- | --- |
| Visitor message | Body | `--text-body` | `--ink` on `--surface` | right-aligned, `max-width: 85%`, 14px radius |
| Assistant message | Body | `--text-body` | `--ink` on `--paper` | left-aligned, `max-width: 100%`, hairline |
| Error message | Body | `--text-small` | `--rail-muted` on `--paper` | assistant slot; no colour, no icon |
| Streaming dots | — | 4px | `--rail-muted` | three dots, staggered opacity loop |

**Colour.** `--ink`, `--paper`, `--surface`, `--rail`, `--rail-muted`. Nothing else. No route hue, no
`--signal`, no error red, not on a border and not on a focus ring (§6.1).

**Responsive.** 360 — panel is full width minus gutters, `max-height: 45vh` so the on-screen keyboard
and the thread do not fight (§8.1), chips already hidden below `sm`. 768 / 1024 / 1440 — 560px,
centred, `min(52vh, 420px)`.

**States.** Idle: no panel, chips on focus, typewriter running. Streaming: panel with dots, send
button solid `--ink`, input still typeable. Error: error row, send button back to pale. The input is
**never disabled** — a disabled control drops out of the tab order (§12) and re-submitting is a
legitimate response to an error.

## Motion spec

| What | Trigger | Duration | Ease | Reduced motion (§7.2) |
| --- | --- | --- | --- | --- |
| Thread reveal | first message exists | `--duration-micro` | `--ease-entrance` | opacity only, no `y` |
| Chips → thread swap | same | `--duration-micro` | `--ease-entrance` | opacity only |
| Streaming dots | `status === "streaming"` | 1.2s loop, `0.06s` stagger | `power1.inOut` | static, full opacity, no loop |
| Auto-scroll to newest | new content | — | — | `behavior: "auto"` instead of `"smooth"` |
| Send button fill | existing | `--duration-micro` | `--ease-entrance` | unchanged |

Every tween inside `useGSAP` with a scoped ref, every ambient one inside `gsap.matchMedia()` (§7.1).
No `ScrollTrigger` anywhere in this prompt.

## Accessibility requirements

- The thread is `role="log"` + `aria-live="polite"` + a label from `lib/copy/shell.ts`. Polite, not
  assertive.
- The streaming state is announced once via a visually-hidden status string, **not** by the animated
  dots, which are `aria-hidden` (§12: decorative visuals are hidden, informational ones are not).
- Each message identifies its speaker to assistive tech without relying on alignment or fill — a
  visually-hidden "You said" / "Glidda said" prefix, since colour and position are the only visual
  cues and neither survives a screen reader.
- Full keyboard operation: Tab reaches the field, the chips, and the send button; `Enter` submits;
  `Escape` collapses the bar without destroying the thread; the thread scrolls with the keyboard
  because it is a focusable scroll container (`tabIndex={0}` when scrollable, with a visible focus
  ring — a scrollable region unreachable by keyboard is a WCAG failure).
- Contrast: `--ink` on `--paper` and on `--surface`; `--rail-muted` at 5.41:1 on `--surface`. `--rail`
  carries no text.
- No horizontal page scroll at any width; long unbroken strings in an answer wrap inside the panel
  (`overflow-wrap: anywhere`) rather than widening it.
- **With JavaScript disabled** the Ask bar renders, the field is typeable, and the form does nothing —
  unchanged from today, and acceptable under §12 because the page's information is all in the
  sections above. Do not add a no-JS form POST fallback; that would need a full page route and a
  server-rendered answer page, which is a different prompt.
- The bar must not cover the closing CTA at 360px when scrolled to the bottom — `ask-bar-reserve` on
  the footer already handles the collapsed height; **verify it with the thread open**, which is
  taller.

## Acceptance criteria

1. Submitting a question streams a visible answer into the thread, token by token, at 360, 768, 1024,
   and 1440px, with no horizontal page scroll at any width.
2. The page behind the bar does not reflow when the thread opens — the form stays at the same
   position at every point.
3. Chips and thread are never both visible.
4. `ANTHROPIC_API_KEY` appears in `app/api/ask/route.ts` and `.env.example` and **nowhere else**;
   `grep -rn "ANTHROPIC" app components lib` returns no hit in a client component, and no
   `NEXT_PUBLIC_` variable is added.
5. With the key unset, the UI shows the generic error message and the server logs a specific one; the
   response body contains no provider detail. `npm run build` still succeeds with no key set.
6. Nine rapid submissions produce a 429 and the rate-limit message on the ninth.
7. A question over 600 characters does not submit; an empty question does not submit.
8. The model declines to answer something not on the page (ask it for pricing) and never repeats a
   placeholder company name, quote, or statistic (ask it who uses Glidda).
9. Reduced motion: no dot loop, no rise on reveal, instant auto-scroll — and the bar remains fully
   usable.
10. Keyboard: Tab to the field, `Enter` to submit, `Escape` collapses without clearing, the thread is
    reachable and scrollable, every focus ring visible.
11. `grep -rn "placeholder: true" lib/copy/` still returns **seventeen** hits — unchanged.
12. No file added by this prompt imports `motion`, and no hex literal appears in any of them.
13. `AGENTS.md` §13 has the environment-variable table and §15 records both resolved decisions plus
    the new rate-limit-store one.

## Checks to run

```bash
npm install
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
grep -rn "ANTHROPIC" app components lib
```

`build` because a route file and `package.json` change. `npm install` first because two dependencies
are added.

Paste the real output of all of them. **The lint bar:** exactly three pre-existing errors, one each
in `components/layout/wordmark.tsx`, `components/ui/carousel.tsx`, and `hooks/use-mobile.ts` — the
same three files, not merely the same count. Any new error is a failure, including in a new file.

## Manual review steps

```bash
cp .env.example .env.local   # then paste a real key into .env.local
npm run dev                  # http://localhost:3000
```

1. **Ask "What does Glidda do?" at 1440px.** Watch the thread open and the answer stream. If the
   first token takes more than ~2s, the dots are doing their job; if there are no dots, the bar looks
   broken.
2. **Ask "How much does Glidda cost?"** It must decline and point somewhere real. If it invents a
   price, the system prompt's second rule is not landing and that is a blocker, not a polish item.
3. **Ask "Which companies use Glidda?"** It must not name Rivetworks, Halden, or any other fixture.
   Same severity.
4. **Unset the key** (comment it out in `.env.local`, restart) and ask anything. Generic message in
   the UI, specific one in the terminal, nothing about the provider in the network response body.
5. **360px, scrolled to the very bottom, thread open.** The bar must not cover the closing CTA's
   pill, and the thread must not exceed 45vh.
6. **Tab through the whole bar** with the thread open. Field, chips (when empty), send button, thread
   scroll container — every stop has a visible ring.
7. **Reduced motion.** Dots static, no rise, instant scroll, everything still usable.
8. **Submit twice quickly.** The first request aborts, the second answers, and no stray text from the
   first appears in the second's message.
9. **Read three answers cold.** They should sound like the page — active, specific, sentence case, no
   "seamless". If they don't, the fix is the voice rule in `lib/ask/system-prompt.ts`, not the UI.

## Open questions this raises for later prompts

- **A durable rate-limit store** (decision 6). The in-memory limiter is a speed bump and is
  per-process. A public deploy needs a shared store, and that is infrastructure, not a component.
- **Conversation persistence and multi-turn.** The thread dies with the tab and every question is
  answered independently — the model gets no prior turns. A follow-up like "what about the second
  one?" will not work, by design, this round. Multi-turn is a real feature with real context-window
  and cost implications and deserves its own prompt.
- **Cost and abuse ceiling.** Nothing caps total spend. A per-day org-level ceiling and an alert are
  a deploy-readiness item, not a UI one.
- **Whether the Ask bar should answer at all on a pre-launch page.** Worth asking once, plainly: the
  footer disclaimer already says the proof is placeholder, and a live model answering questions about
  an unlaunched product is a claim surface. The system prompt's rules are the mitigation; the
  decision to ship it publicly is the user's.
- **Still open from §15**: swapping the seventeen fixtures, the `cdn.glidda.com` host in
  `lib/copy/route.ts:58`, the Glidda mark, and removing the unused `motion` package.
