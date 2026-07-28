# 16 — Move the Ask bar's backend to the Gemini API

## Goal

Prompt 15 shipped the Ask bar's post-submit UI and a backend built on Claude. The user has since
chosen **Gemini** as the provider. This prompt swaps the provider and nothing else.

**The UI does not change.** `ask-bar.tsx`, `ask-thread.tsx`, `ask-message.tsx`, the copy in
`lib/copy/shell.ts`, and the `ask-thread` CSS all stay exactly as they are — they talk to
`/api/ask` over plain text and have no idea which model is behind it. That the provider swap is
this contained is the point of the plain-text contract in prompt 15, and it is worth stating
rather than rediscovering.

**Also unchanged:** the grounding in `lib/ask/system-prompt.ts` (it is assembled from the page's
own copy and is provider-agnostic), the rate limiter, the Zod request schema, the order of
operations in the handler, the generic-error policy, and the rule that the key is read inside the
handler rather than at module scope.

Out of scope, still: conversation persistence, multi-turn history, authentication, analytics, and
any change to a page section, the Rail, the header, or the footer.

## Skills and docs read

- `AGENTS.md` §8.1, §11 (errors say what happened and what to do next), §13 (**the
  environment-variable table added by prompt 15 has to change with the variable**), §14, §15.
- `prompts/15-ask-bar-post-submit.md` — the decisions being preserved, especially decision 3 (the
  model answers only from the page's copy), decision 6 (the in-memory limiter and its stated
  limitation), and decision 7 (four failure paths, no provider detail in the response body).
- `node_modules/next/dist/docs/01-app/02-guides/streaming.md` § "Streaming in Route Handlers" —
  unchanged from prompt 15; the `ReadableStream` + `TextEncoder` + `new Response(stream, …)` shape
  and its `X-Content-Type-Options: nosniff` header stay exactly as built.
- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` — unprefixed variables
  stay server-side; `.env*` is gitignored by the template.
- **`https://ai.google.dev/gemini-api/docs/models`** — read because the model IDs in my training
  data are stale. `gemini-2.5-flash` was proposed and the user correctly rejected it. The current
  stable text models are `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`,
  `gemini-3.1-flash-lite`, `gemini-2.5-pro`, and `gemini-2.5-flash(-lite)`. `gemini-2.0-flash`,
  `gemini-2.0-flash-lite`, and `gemini-3-pro-preview` are shut down.
- **`https://ai.google.dev/gemini-api/docs/text-generation`** and the `js-genai` README — the v2
  SDK exposes a new `ai.interactions.create({ … , stream: true })` alongside the older
  `ai.models.generateContentStream`. Streaming deltas arrive as events with
  `event_type === "step.delta"` and `delta.type === "text"`.
- The `claude-api` skill is **deliberately not used**. It produces Anthropic SDK code, and this
  prompt removes Anthropic from the project.

Not read: any GSAP skill — no motion changes here, and no `ScrollTrigger` anywhere in this prompt.

## Existing code inspected

- **`app/api/ask/route.ts`** — the only file whose body materially changes. Everything before the
  provider call (rate limit → JSON parse → Zod → key) is provider-agnostic and is kept verbatim.
- `lib/ask/system-prompt.ts` — one exported `SYSTEM_PROMPT` string. It becomes the Gemini call's
  system instruction; the file itself is untouched.
- `lib/ask/rate-limit.ts`, `lib/ask/types.ts` — untouched.
- `package.json` — `@anthropic-ai/sdk@^0.75.0` and `zod@^4.4.3` were added by prompt 15. Zod stays.
- `.env.example`, `AGENTS.md` §13 and §15 — both name `ANTHROPIC_API_KEY` and both must change.

## Decisions and assumptions

### 1. `@google/genai`, and `@anthropic-ai/sdk` comes out

`@google/genai@^2.13.0` is the current Google Gen AI SDK. The older `@google/generative-ai`
(0.24.1) is the legacy package and is not used.

`@anthropic-ai/sdk` is **removed from `package.json`** rather than left installed. §13 forbids dead
code, and an unused provider SDK is the kind of thing that later reads as "we support both".

### 2. Model: `gemini-3.6-flash`, chosen by the user

The current balanced flagship for text. Fast enough for a bar the reader is watching, and the
strongest rule-adherence in the flash tier — which matters here more than usual, because
decision 3 of prompt 15 is the whole safety story (see §5 below).

**Do not substitute a cheaper or older model without asking.** In particular, do not reach for a
model ID from memory: the ID in this prompt came from the live model list, and the first ID I
proposed from training data no longer exists.

### 3. `interactions.create` with `stream: true`, chosen by the user

The v2 SDK's newer unified surface, which Google positions as the recommended path.
`ai.models.generateContentStream` remains available and is the fallback if the interactions
surface turns out not to support a system instruction plus an output cap in one call.

**The exact config field names must come from the installed `.d.ts`, not from this prompt and not
from memory.** The published docs show `system_instruction` on the JS example but do not show
`maxOutputTokens` or the thinking control for `interactions.create`, and the SDK is versioned
faster than the docs. So: install, read `node_modules/@google/genai/**/*.d.ts` for the
`interactions.create` params type, and write the call against what is actually there. If a field
this prompt names does not exist under that name, **use the real one and say so in the completion
report** — do not invent a shape that type-checks by being cast to `any` (§13 forbids `any`).

### 4. Thinking and output cap

Gemini 3-series models think by default. Ask for the **lowest thinking level the SDK exposes** —
these are two-or-three-sentence answers from a fixed grounding block, and the latency budget is
better spent on the first token — and cap output at roughly **1024 tokens**, sized for a
several-paragraph answer with headroom.

If the interactions surface does not expose a thinking control, leave thinking at its default
rather than reaching for an undocumented field, and note it in the report. A slightly slower first
token is the correct trade against a guessed parameter.

### 5. The grounding rules are unchanged, and they are the load-bearing part

`SYSTEM_PROMPT` is passed as the system instruction, byte-for-byte as assembled today. Its three
rules — answer only from the material, never state a price or a customer name or a metric or a
certification, follow §11's voice — are what stop a live model inventing proof about an unlaunched
product at runtime (§11.1's risk arriving through a channel §11.1 never anticipated).

**A provider swap does not carry those guarantees across.** They were verified against Claude only
in the sense that they were never verified at all — prompt 15 shipped without an API key, and
manual steps 2 and 3 (ask for pricing; ask which companies use Glidda) are still outstanding.
They must be run against Gemini before this route is trusted, and the report must say plainly
whether they were.

### 6. Prompt caching: nothing to configure

Prompt 15 set `cache_control: { type: "ephemeral" }` on the Anthropic system block. That parameter
is Anthropic-specific and comes out. Gemini caches implicitly on repeated prefixes, so the
byte-identical-system-prompt discipline in `lib/ask/system-prompt.ts` still pays off — the comment
in that file stays accurate and stays put.

### 7. `GEMINI_API_KEY`

The variable is renamed. It is passed to the client **explicitly** rather than picked up from the
environment, so the name is ours; the SDK's own default is `GOOGLE_GENAI_API_KEY`, which is worth a
one-line comment so nobody is surprised later. Server-only, never `NEXT_PUBLIC_`, still read inside
the handler so `npm run build` succeeds on a machine without a key.

### 8. Error handling: typed, never string-matched

Prompt 15 used Anthropic's typed error classes. The equivalent for this SDK must be read off the
installed types — most likely an `ApiError` carrying a status. Branch on the type and the status
code, **never on the error message text**. The client-facing behaviour does not change: a specific
line in the server log, the generic message in the body, and no provider detail on the wire.

## Files likely to change

| File | Change |
| --- | --- |
| `package.json` | edit — add `@google/genai`, remove `@anthropic-ai/sdk`; `zod` stays |
| `app/api/ask/route.ts` | edit — provider call, error branches, model constant; everything before the call kept verbatim |
| `.env.example` | edit — `GEMINI_API_KEY=` replaces `ANTHROPIC_API_KEY=` |
| `AGENTS.md` | edit — §13's environment-variable table row; §15's resolved-backend line |

Explicitly **not** modified: `components/ask/*`, `lib/ask/system-prompt.ts`, `lib/ask/rate-limit.ts`,
`lib/ask/types.ts`, `lib/copy/**`, `app/globals.css`, `app/page.tsx`, `app/layout.tsx`,
`components/ui/*`, `components/sections/*`, `components/layout/*`.

## Implementation requirements

Order of operations in `POST` is **unchanged** from prompt 15:

1. Rate-limit check on the derived IP → `429` before any parsing or model call.
2. `await request.json()` inside a `try` → malformed JSON is a `400`.
3. Zod-parse (`{ question: string }`, trimmed, 1–600) → `400` on failure.
4. Read `process.env.GEMINI_API_KEY`; missing → `console.error` server-side, `500` generic body.
5. Open the Gemini stream, pipe its text deltas into a `ReadableStream`, return
   `text/plain; charset=utf-8` + `X-Content-Type-Options: nosniff` + `Cache-Control: no-store`.

Also unchanged: `runtime = "nodejs"`, `maxDuration = 30`, and the rule that an error thrown after
the stream has started is logged server-side and closed quietly — never `controller.error()` with a
provider message attached, because the status is already on the wire and a leaked provider string
is a leak either way.

The client's read loop already treats a stream that carried no text as the generic error and a
truncated one as a complete-enough answer. That contract holds; do not change `ask-bar.tsx`.

## Visual spec

None. No pixel on the page changes.

## Motion spec

None. No tween is added, removed, or retimed.

## Accessibility requirements

Unchanged from prompt 15 and untouched by this prompt: `role="log"` + `aria-live="polite"`, the
visually-hidden speaker prefixes, the keyboard-reachable scroll container, the never-disabled
input, and the reduced-motion branches.

## Acceptance criteria

1. Submitting a question streams a visible answer into the thread, token by token.
2. `grep -rn "ANTHROPIC" app components lib` returns **nothing**, and `@anthropic-ai/sdk` is absent
   from `package.json`.
3. `GEMINI_API_KEY` appears in `app/api/ask/route.ts` and `.env.example` and **nowhere else**; it is
   not referenced from any client component and no `NEXT_PUBLIC_` variable is added.
4. With the key unset: the UI shows the generic error, the server logs a specific one, the response
   body contains no provider detail, and `npm run build` still succeeds.
5. Nine rapid submissions still produce a 429 on the ninth; an empty question and a 601-character
   question still do not submit.
6. **The model declines to answer something not on the page (ask it for pricing) and never repeats a
   placeholder company name, quote, or statistic (ask it who uses Glidda).** Outstanding since
   prompt 15 — this is the run that has to happen.
7. `grep -rn "placeholder: true" lib/copy/` still returns **seventeen** hits.
8. No new lint error; typecheck and build clean; no `any` in any file this prompt touches.
9. `AGENTS.md` §13's table names `GEMINI_API_KEY` and §15 records Gemini as the chosen provider.

## Checks to run

```bash
npm install
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
grep -rn "ANTHROPIC" app components lib
grep -rn "GEMINI" app components lib
```

Paste the real output. **The lint bar:** exactly three pre-existing errors, one each in
`components/layout/wordmark.tsx`, `components/ui/carousel.tsx`, and `hooks/use-mobile.ts` — the
same three files, not merely the same count. Any new error is a failure.

## Manual review steps

```bash
cp .env.example .env.local   # then paste a real Gemini key into .env.local
npm run dev                  # http://localhost:3000
```

1. **Ask "What does Glidda do?"** Watch the answer stream. If the first token takes more than ~2s
   the dots are doing their job; if there are no dots, something regressed in the status handling.
2. **Ask "How much does Glidda cost?"** It must decline and point somewhere real. If it invents a
   price, the system prompt's second rule is not landing on this model and that is a blocker.
3. **Ask "Which companies use Glidda?"** It must not name Rivetworks, Halden, or any other fixture.
   Same severity.
4. **Unset the key**, restart, ask anything: generic message in the UI, specific one in the
   terminal, nothing about the provider in the network response body.
5. **Submit twice quickly.** The first request aborts, the second answers, and no stray text from
   the first appears in the second's message.
6. **Read three answers cold.** They should sound like the page — active, specific, sentence case,
   no "seamless". If they do not, the fix is the voice rule in `lib/ask/system-prompt.ts`, not the
   UI, and not the model.

## Open questions this raises for later prompts

- **A durable rate-limit store** — unchanged and still open. The limiter is per-process and is a
  speed bump, not a defence. Required before any public deploy.
- **Conversation persistence and multi-turn** — unchanged and still open.
- **A spend ceiling** — unchanged and still open, and now denominated in a different provider's
  billing.
- **Whether the Ask bar should answer at all on a pre-launch page** — unchanged. The system
  prompt's rules are the mitigation; shipping it publicly is the user's call.

---

## Addendum — 2026-07-28: the model changed to `gemini-3.5-flash`

Decision 2 above named `gemini-3.6-flash` and said not to substitute without asking. Asked and
answered: the user chose to use a model that works on the free tier.

**Why.** The key is on the free tier, where `gemini-3.6-flash` allows 20 requests a day
(`generate_content_free_tier_requests, limit: 20`). That allowance was spent during this prompt's
own verification, which is what kept acceptance criteria 1 and 6 open for two days. Twenty requests
a day cannot run a page-wide Ask bar under any circumstances, so the ceiling — not the model — was
the real constraint.

`gemini-3.5-flash` answers on the same key, is present in the installed SDK's own model union, and
is the model every grounding run has actually been performed against. Committing it makes the
shipped code and the verified code the same thing for the first time.

**What this does not resolve.** The free tier is still a ceiling, just a higher one. Enabling
billing remains a prerequisite for a public deploy, and is the same decision as §15's spend
ceiling.

Everything else in this prompt stands: `api_version: "v1beta"`, `vertexai: false`, the
`thinking_level`/`max_output_tokens` config, the error branches, and the grounding rules.
