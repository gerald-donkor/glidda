# 18 — Deploy readiness for the Ask route: a durable rate-limit store and a spend ceiling

## Goal

Close the two §15 open decisions that stand between `/api/ask` and a publicly reachable URL:

1. **A durable rate-limit store.** `lib/ask/rate-limit.ts` keeps its window in a module-scope `Map`.
   §15 already records what that means and requires a shared store before any public deploy.
2. **A spend ceiling.** Nothing in this repo caps how much the route can spend. §15 names a per-day
   ceiling and an alert as a deploy-readiness item.

They are one prompt because they are one mechanism: a counter in a shared store, read before the
model call. Building the store for the per-IP limiter and then bolting the spend ceiling onto a
second, different mechanism a week later would be the wrong shape.

**This prompt does not deploy anything.** It makes the route safe to deploy. Choosing a platform,
enabling billing, and pushing are the user's acts, and two of them are blocking questions this
prompt raises rather than answers (see "Decisions this prompt cannot make alone").

Out of scope, still and explicitly: multi-turn history and conversation persistence (§15,
untouched), authentication, analytics, a test runner or CI (this repo has neither and acquiring one
inside a prompt about rate limiting is the same mistake prompt 15 correctly refused to make), any
change to a page section, the Rail, the header, the footer, or any pixel of the Ask bar's UI beyond
one new error string rendering through the slot that already exists.

## Skills and docs read

- `AGENTS.md` §9 (`lib/ask/` is where the Ask bar's server-side modules live; copy lives in
  `lib/copy/`), §11 (errors say what happened and what to do next, do not apologise, are never
  vague — and by extension never name a provider or a quota), §12, §13 (**the environment-variable
  table must change in the same commit as any new variable**; no `any`; centralise magic numbers;
  no secrets in client code), §14 (the checks and the lint bar), §15 (both open decisions, quoted
  above).
- `prompts/15-ask-bar-post-submit.md` — **decision 6** (the limiter's exact contract: 8 requests /
  60s, `x-forwarded-for` first entry → `x-real-ip` → `"unknown"`, both headers client-supplied and
  trivially spoofed; and the instruction that the limitation be *stated*, not discovered) and
  **decision 7** (the four failure paths, the table of what the reader sees, the rule that the key
  is read at request time so a keyless `npm run build` succeeds, and that the body never says *why*
  auth failed).
- `prompts/16-ask-bar-gemini-backend.md` including the **2026-07-28 addendum** — the provider is
  `@google/genai`, the model is `gemini-3.5-flash` on a **free-tier** key, `api_version: "v1beta"`,
  `vertexai: false`, streamed via `client.interactions.create`. The addendum is the direct
  antecedent of part B: the model was downgraded *because* the free tier's per-model daily request
  cap was the real constraint, and it says in as many words that enabling billing is a prerequisite
  for a public deploy and is the same decision as §15's spend ceiling.
- `prompts/17-route-min-width-overflow.md` — read for the house style of a narrow, non-visual
  prompt, and because it names this exact work as out of its own scope.

**Not read, and why it matters that you know:**

- **No Next.js doc.** §2 requires one for anything touching routing, server/client boundaries,
  fonts, images, metadata, or config. This touches none of those: `app/api/ask/route.ts` already
  exists with its `runtime`/`maxDuration` exports settled, and nothing here adds a route, a config
  key, or a boundary crossing. **One exception the implementer must handle:** if the chosen store
  client turns out to need anything from `next.config.ts` (`serverExternalPackages`, for instance),
  read `node_modules/next/dist/docs/` before touching that file rather than editing it from memory.
- **No GSAP skill.** Nothing animates.
- **No `shadcn` skill.** No primitive is added or extended.
- **`@upstash/ratelimit` / `@upstash/redis` docs were not read**, because nothing is installed and
  §2 forbids me from installing inside a prompt-writing pass. Every API shape this prompt names for
  those packages is **provisional** — read the installed `.d.ts` and write the call against what is
  actually there, exactly as prompt 16 decision 3 required for the Gemini SDK. If a field named
  here does not exist, use the real one and say so in the report. Do not cast to `any` (§13).
- **I did not verify Google's current free-tier quota for `gemini-3.5-flash`.** The addendum
  records `gemini-3.6-flash` at 20 requests/day; the 3.5 figure is unknown to me. Part B's sizing
  depends on it, so **look it up on `https://ai.google.dev/gemini-api/docs/rate-limits` before
  choosing the number** and put the real figure in the report.

## Existing code inspected

- **`lib/ask/rate-limit.ts`** (49 lines, read in full). Two exports.
  - `clientKey(request)` — `x-forwarded-for` split on `,`, first entry, trimmed; else `x-real-ip`
    trimmed; else the literal `"unknown"`.
  - `isRateLimited(key, now = Date.now())` — **synchronous**, returns `boolean`. Sweeps every
    expired window on each call, then increments. `WINDOW_MS = 60_000`, `MAX_REQUESTS = 8`. Note
    the exact semantics: a fresh window is created with `count: 1` and returns `false`; the check
    is `count > MAX_REQUESTS`, so the **ninth** request in a window is the first rejected. Prompt
    16 acceptance criterion 5 depends on that off-by-one being preserved.
  - The file's doc comment already states the per-process caveat and points at §15. That comment
    is the thing this prompt makes obsolete, and it must be rewritten, not left lying.
- **`app/api/ask/route.ts`** — `isRateLimited(clientKey(request))` is called at line 44, before the
  JSON parse, before Zod, before the key read. `MODEL = "gemini-3.5-flash"`,
  `MAX_OUTPUT_TOKENS = 1024`. `json(body, status)` helper sends `Cache-Control: no-store`. The
  `GEMINI_API_KEY` read at line 60 is inside the handler for the keyless-build reason.
- **`lib/ask/types.ts`** — `askRequestSchema` caps the question at 600 characters after trim;
  `ASK_MAX_QUESTION_LENGTH = 600` is shared with the client guard. This is the input-side half of
  the cost bound part B relies on.
- **`lib/copy/shell.ts`** — `ask.errors` is a two-key object, `{ rateLimited, failed }`, and its
  type annotation is written inline on the export. A third key means editing both the type and the
  value.
- **`lib/ask/system-prompt.ts`** — assembled once at module scope, byte-identical per request for
  prefix caching. **Nothing in this prompt may interpolate anything into it.**
- **`package.json`** — no store client, no test runner, no CI. Scripts are `dev`, `build`, `start`,
  `lint`, `typecheck`.
- **`.env.example`** — tracked (`.gitignore` has `!.env.example`), currently one variable,
  `GEMINI_API_KEY=`, with three comment lines. `.env.local` exists locally and is ignored.
- **`AGENTS.md` §13** — the environment-variable table has exactly one row today and its prose says
  "One route exists". Both need editing.
- Verified by running it: `grep -rn "placeholder: true" lib/copy/` returns **17** hits today.

## Decisions and assumptions

### 1. The store choice is real, and it is blocked on the platform

§15 says "Redis, Upstash, a platform primitive" without choosing, because there is nothing to
choose against: **no deployment platform has been picked.** That is not a detail — it changes
whether this work is necessary at all.

| Target | Does the current `Map` work? | Realistic store | Trade-off |
| --- | --- | --- | --- |
| One long-lived Node process (`next start` on a VPS, a single container, one Fly machine) | **Yes, as designed.** One process, one map, no cold starts. | none needed | The limiter is already correct here. Part A collapses to deleting the caveat comment and writing down why. Part B is still required — a single process can still spend money all night. |
| Serverless functions (Vercel, Netlify, AWS Lambda, Cloud Run scale-to-zero) | **No.** Per-request isolates, each cold start an empty map. | Upstash Redis over HTTP | The case §15 is actually worried about. |
| Multiple Node instances behind a load balancer | No — one map per instance, so the effective limit is `8 × instances`. | any shared Redis | Same fix, cheaper if you already run Redis. |
| Cloudflare Workers / edge runtime | No, and worse — the route is pinned `runtime = "nodejs"` and a move to edge is its own decision. | platform primitive or Upstash | Out of scope. Do not change the runtime here. |

**Recommendation: Upstash Redis over its HTTP/REST client**, behind a small interface, with the
existing in-memory `Map` kept as the fallback when the store is not configured.

Why Upstash specifically, stated as trade-offs and not as enthusiasm:

- It speaks **HTTP, not the Redis wire protocol**, so it needs no connection pool and survives an
  environment that gives every request a fresh isolate. A TCP Redis client (`ioredis`, `node-redis`)
  in a serverless function is the classic connection-exhaustion footgun, and working around it is
  more infrastructure than this route deserves.
- It is **platform-neutral**, which is the whole point while the platform is undecided. Vercel KV is
  the same product with a Vercel-shaped wrapper and a Vercel-shaped lock-in; picking it now would
  quietly resolve decision 1 by the back door.
- `@upstash/ratelimit` implements sliding-window and token-bucket algorithms server-side in a Lua
  script, so the increment-and-check is one atomic round trip rather than a read-modify-write race.
  **Do not hand-roll `GET` then `SET`** — under concurrency that limiter does not limit.
- Against it: it is a third-party dependency holding visitor IPs (see decision 4), it adds ~20–50ms
  to every request before the model is even called, and its free tier has its own daily command
  cap, which is a ceiling on a ceiling.

**A platform primitive** (Vercel's WAF rate limiting, Cloudflare's rate-limiting rules) is a
genuinely better answer for part A when it exists: it rejects the request before the function
boots, so an attacker cannot cost you compute at all. It is worse for part B, because it counts
requests per path and knows nothing about a daily model budget. If the user picks a platform that
has one, the right shape is **primitive for the per-IP limit, store for the spend ceiling** — but
that is a fork this prompt cannot take blind.

**So: do not install anything until the user answers decision 1 below.** If the answer is "a single
long-lived Node process", implement part B only and rewrite the caveat comment to say the limiter
is adequate *for that topology* and why.

### 2. The limiter's contract changes from sync to async, and that is the ripple

Any network-backed store makes the check a promise. `isRateLimited` becomes:

```ts
export async function checkRateLimit(request: Request): Promise<RateLimitVerdict>
```

Deliberate shape choices:

- **It takes the `Request`, not a pre-derived key.** Today the route calls
  `isRateLimited(clientKey(request))`, which puts the key-derivation policy — the part that is
  platform-specific and security-relevant (decision 3) — at the call site. Moving it inside means
  the route never handles a raw IP and there is exactly one place to change when the platform is
  chosen. `clientKey` stops being exported and becomes internal.
- **It returns a verdict object, not a boolean**, because part B needs a second kind of rejection
  with a different message: `{ allowed: true } | { allowed: false; reason: "burst" | "daily" }`.
  The route maps `reason` to a copy key. A boolean would force the route to re-derive which limit
  tripped, which it cannot.
- **`MAX_REQUESTS = 8` per 60 seconds is preserved exactly**, including the off-by-one. Prompt 16's
  acceptance criterion 5 ("nine rapid submissions produce a 429 on the ninth") must still pass
  unchanged. Changing the number and the storage in one step means a failure tells you nothing.
- The route's line 44 call site becomes `await`. It is already an `async function POST`, so this is
  one keyword and no restructuring. **The rate-limit check stays first**, before the JSON parse —
  a limited caller should not get to allocate a body parse.

### 3. What the key derives from is a decision, not a default

`clientKey`'s current fallback chain has two real problems, both worth fixing while the file is
open:

- **`x-forwarded-for` is client-supplied.** Anyone can send `X-Forwarded-For: 1.2.3.4` and get a
  fresh bucket per request, which is the caveat already written in the file. It stops being true
  only when a trusted proxy *overwrites* rather than appends the header — which is exactly what
  a real platform does, and exactly what `npm run dev` on localhost does not. **The correct header
  is platform-specific:** Cloudflare gives `cf-connecting-ip` and strips forgeries; Vercel
  normalises `x-forwarded-for`; a bare nginx does whatever its config says. So the header list must
  become a **named constant with a comment naming the platform it is correct for**, not an
  inherited guess. This is the second thing blocked on decision 1.
- **`"unknown"` is one shared bucket.** If the platform sets neither header, every visitor on the
  site shares eight requests a minute between them, and the Ask bar — the page's primary conversion
  device (§8.1) — breaks for everyone at once with a message telling each of them they asked too
  much. That is a self-inflicted outage that would look like a bug. **Decide it explicitly**: keep
  the shared bucket (fails safe for cost, terrible for users) or exempt `"unknown"` from the
  per-IP limit and let the global daily ceiling in part B be the only thing holding it (good for
  users, and safe *only because* part B exists). **Recommendation: the latter**, plus a
  `console.error` on the first such request per process, because a production deploy that cannot
  identify a client is a misconfiguration that should be loud rather than silently degraded.

### 4. Hash the key before it leaves the process

A raw IP address is personal data in the EU/UK, and this design ships it to a third party's
database. It does not need to: the limiter only ever compares keys for equality.

**Store `sha256(ip + ASK_RATE_LIMIT_SALT)`, truncated to 32 hex chars, with a key prefix
(`ask:burst:`).** Node's built-in `crypto` — no dependency. The salt is a server-only env var; a
missing salt is a `console.error` and the raw-but-still-hashed key (unsalted hashes of IPv4 are
brute-forceable in seconds, so an unsalted hash is not a privacy control and must not be described
as one).

Every key gets a **TTL equal to its window** (60s for burst, expiring at UTC midnight for the daily
counters), so nothing accumulates and there is no retention policy to write.

The cost is debuggability: a hashed key cannot be traced back to an abusive client. That is the
correct trade for a marketing page; note it in the code comment so it is a decision and not an
oversight.

### 5. When the store is unreachable: **fail open for the burst limit, fail closed for the spend
ceiling**

This is the security/UX call the prompt must make rather than gloss, and the answer is different
for the two limits — which is the whole reason to say it out loud.

**Burst limit → fail open, degrading to the in-memory `Map`.** If Upstash is down, the alternative
is that every visitor to the landing page gets "That's a lot of questions at once" on their first
question. A rate limiter taking down the page's primary CTA is a worse outcome than a window of
weak limiting, and "fail open" here does not mean *unlimited* — it means falling back to the
limiter that already exists and already works on one process. Log once per outage window (a
module-scope timestamp, not once per request; a log line per request during an outage is its own
denial of service against your log budget).

**Spend ceiling → fail closed.** Money is asymmetric. If the counter cannot be read, the route
cannot know it is under budget, and the failure mode of guessing wrong is an unbounded bill rather
than an annoyed visitor. A store outage returns the daily-limit message. This is also what makes
decision 5's first half defensible: the burst limiter is allowed to be soft precisely because
something behind it is hard.

State both halves in the code comment. A future reader will otherwise "fix" the inconsistency.

### 6. The spend ceiling is counted in **requests**, not tokens and not dollars

The honest reason: **you cannot know the cost before the call, and you often cannot know it after
one either.** Token usage arrives in the stream's terminal metadata, and this route's most common
non-happy path is the reader abandoning an answer — `request.signal` aborts, the loop breaks at
`if (cancelled) break`, and no usage event is ever read. A token-denominated ceiling would
systematically undercount exactly the requests that already cost money.

A request, by contrast, has a **computable worst case**, because both ends are already capped:

| Component | Bound | Source |
| --- | --- | --- |
| Question | 600 characters | `askRequestSchema`, `lib/ask/types.ts` |
| System instruction | fixed, byte-identical every request | `lib/ask/system-prompt.ts` |
| Thinking | `thinking_level: "minimal"` | `route.ts` |
| Output | 1024 tokens | `MAX_OUTPUT_TOKENS` |

So `worst-case cost per request × N` is a real dollar bound, and it is enforceable **before** the
model call, which is the only place enforcement is worth anything. **Compute that figure from the
current published price for `gemini-3.5-flash` and put it in the code comment next to the
constant**, so the number `N` has a stated dollar meaning instead of being a magic number someone
later doubles because it "seems low".

Three counters, all in the same store, all checked before the model call and after the burst check:

| Counter | Key | Window | Purpose |
| --- | --- | --- | --- |
| Burst | `ask:burst:<hash>` | 60s | Unchanged from today: 8 per IP |
| Per-IP daily | `ask:day:<hash>:<yyyy-mm-dd>` | UTC day | The missing one. 8/min is 11,520/day for one IP — the burst limit does nothing against a patient script. |
| Global daily | `ask:day:global:<yyyy-mm-dd>` | UTC day | The actual spend ceiling. |

**The window is the UTC calendar day, deliberately, because that is how Google's own quota
resets.** A rolling 24-hour window would drift out of phase with the provider's, and the two
ceilings would mask each other in a way that makes an incident unreadable.

The global counter must be **incremented before the model call and never decremented** — not on
abort, not on provider error. It counts requests admitted to the provider, and a request that
failed after the call still consumed input tokens. Under-counting is the only failure mode that
costs money.

### 7. What the reader sees when the ceiling trips

A third key in `lib/copy/shell.ts`'s `ask.errors`, rendering through the assistant-slot error path
prompt 15 already built. §11 governs it: say what happened and what to do next, do not apologise,
do not be vague, and — the addition this case forces — **do not leak the provider, the word
"quota", the word "billing", or any number.** "Glidda's daily Gemini quota is exhausted" tells an
attacker their script worked and tells an honest visitor something about our vendor relationship
that is none of their business.

Proposed, to be approved or rewritten at implementation time:

> `dailyLimit`: "Glidda has answered as many questions as it can today. Try again tomorrow, or
> email hello@glidda.com."

The per-IP daily counter reuses the **existing** `rateLimited` string. "Give it a minute" is
technically wrong for a 24-hour window, so either accept the imprecision or — better — reword
`rateLimited` to drop the interval: **"That's a lot of questions at once. Give it a moment and ask
again."** Flag this as a copy change in the report; it is a shipped string.

Both return **429**, not 503. The client's read path already handles a non-2xx by rendering
`body.error`, and 429 is semantically correct for both ("you may retry later"). 503 would invite a
crawler to treat the page as down.

### 8. The alert, and the free tier's accidental protection

**The most important fact in this prompt: the ceiling that protects us today is Google's, not
ours.** The key is on the free tier, which imposes a hard per-model daily request cap — that is
what forced the model change in prompt 16's addendum. Nobody chose it, it is not in our code, and
**enabling billing removes it silently.** There is no warning, no confirmation step, and no diff.

Therefore the sequence is not negotiable and must be stated in the completion report:

> **The application ceiling must be deployed and verified before billing is enabled, not after.**

Alerting, given that this repo has no monitoring, no CI, and no error tracker:

| Option | What it catches | Honest assessment |
| --- | --- | --- |
| Structured `console.warn` at 50% / 80% / 100% of the global daily counter | Our own count | Free, no dependency, works everywhere. **Only useful if someone reads the logs** — which nobody will unless the platform has an alert-on-log-pattern feature. Recommended as the floor. |
| A **Google Cloud billing budget + alert** on the API project | Actual dollars, at the provider | The only one that cannot be bypassed by a bug in our counter, a second deploy, or a leaked key. Requires billing enabled. **Recommended as the real alarm.** |
| Webhook to email/Slack on threshold crossing | Our own count, pushed | A new outbound dependency, a new secret, and a new failure path inside a request handler. **Not recommended in this prompt.** |
| Provider hard cap | — | Google does not expose a per-key spend cap; the billing budget alert is advisory and does not stop spend. Worth knowing: **there is no provider-side kill switch.** Our counter is the kill switch. Verify this before writing it down as fact. |

Implement the log thresholds. The billing budget is a console task for the user, listed in the
manual steps, not something code can do.

### 9. Environment variables

Server-only, never `NEXT_PUBLIC_`, and — the constraint prompt 15 decision 7 established and this
prompt must not break — **read inside the handler or a function it calls, never at module scope,
so a keyless `npm run build` still succeeds.**

The wrinkle: store clients typically read the environment **at construction**
(`Redis.fromEnv()`). So construct **lazily on first use** and memoise into a module-scope
`let client: Redis | null = null`. A module-scope `new Redis(...)` would break the build on a
machine without the vars, which is the exact failure mode §13's rule exists to prevent — and CI, if
it ever exists, will not have them.

| Variable | Scope | Required by | Notes |
| --- | --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | Server only | `lib/ask/rate-limit.ts` | Absent → in-memory fallback for burst, fail-closed for the ceiling |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | `lib/ask/rate-limit.ts` | Same |
| `ASK_RATE_LIMIT_SALT` | Server only | `lib/ask/rate-limit.ts` | Any random string. Absent → `console.error`; hashing still happens but is not a privacy control (decision 4) |
| `ASK_DAILY_REQUEST_LIMIT` | Server only | `lib/ask/rate-limit.ts` | Optional integer. A code default is authoritative; this only overrides it per environment. Parse with Zod's coercion or a guarded `Number.parseInt` — a malformed value must fall back to the default and log, **never** become `NaN` and disable the ceiling |

Four new variables is a lot for one prompt. `ASK_RATE_LIMIT_SALT` is the one that could be dropped
(at the cost of decision 4's privacy argument) and `ASK_DAILY_REQUEST_LIMIT` is the one that could
be hard-coded (at the cost of tuning without a deploy). Both are listed under the decisions below.

All four go into `.env.example` **and** `AGENTS.md` §13's table in the same change, per §13. §13's
prose "One route exists — `app/api/ask/route.ts`, the Ask bar's backend. Its key is server-only…"
needs rewording too: it is now a route with four more variables, none of which is *the* key.

## Files likely to change

| File | Change |
| --- | --- |
| `package.json` | edit — add the store client(s). **Nothing else.** No test runner. |
| `lib/ask/rate-limit.ts` | rewrite — async verdict API, three counters, hashed keys, lazy client, fail-open/fail-closed split, rewritten doc comment |
| `app/api/ask/route.ts` | edit — `await` the check, map `reason` to a copy key. Everything else verbatim, including order of operations |
| `lib/copy/shell.ts` | edit — add `ask.errors.dailyLimit` to the type and the value; possibly reword `rateLimited` (decision 7) |
| `.env.example` | edit — four variables, commented, no values |
| `AGENTS.md` | edit — §13's table and its surrounding prose; §15's two open-decision bullets marked resolved with the date and this prompt's filename, in the style of the two already resolved |

Explicitly **not** modified: `components/ask/*` (no UI change beyond a string it already renders),
`lib/ask/system-prompt.ts` (**nothing per-request may be interpolated into it — a request counter
included**), `lib/ask/types.ts`, `lib/copy/placeholder/*`, `app/globals.css`, `app/page.tsx`,
`app/layout.tsx`, `components/ui/*`, `components/sections/*`, `components/layout/*`,
`next.config.ts` (unless decision 1's store forces it — read the Next docs first if so).

## Implementation requirements

`POST`'s order of operations, with the change marked:

1. **`await checkRateLimit(request)`** → on `{ allowed: false }`, `429` with the copy key its
   `reason` selects, before any parsing. *(changed: awaited, returns a verdict)*
2. `await request.json()` in a `try` → `400`. *(unchanged)*
3. Zod parse → `400`. *(unchanged)*
4. `process.env.GEMINI_API_KEY`, read here → missing is `console.error` + generic `500`.
   *(unchanged)*
5. Open the stream, pipe deltas, return `text/plain; charset=utf-8` + `nosniff` + `no-store`.
   *(unchanged)*

Hard requirements:

- **`runtime = "nodejs"` and `maxDuration = 30` do not change.** A store that would push this route
  to `edge` is the wrong store; that is a separate decision with its own prompt.
- **Increment atomically.** One round trip that increments and returns the new count. Never
  `GET` → compute → `SET`; two concurrent requests both read the old value and the limit is
  meaningless under exactly the load it exists for.
- **The 8-per-60s burst behaviour is bit-for-bit preserved**, ninth-request rejection included.
- **No `any`** (§13), and no `as` cast used to make a store client's types line up. Read the `.d.ts`.
- **Centralise the numbers** (§13): window lengths, the three limits, the key prefixes and the
  alert thresholds are named constants at the top of `lib/ask/rate-limit.ts` with the dollar
  reasoning from decision 6 in a comment. No duplicated literal.
- **The file's doc comment is rewritten, not appended to.** It currently tells the reader the
  limiter is a speed bump and points at §15. After this prompt that is false and the pointer is
  stale. The new comment states the topology it is correct for, the fail-open/fail-closed split,
  and the hashing trade.
- **Safe error handling on everything async** (§13). A store call that rejects must be caught at
  its own call site and routed to the correct fallback — burst falls back, ceiling refuses. No
  swallowed promise, and no `try` so wide it catches the model call too.

## Visual spec

**None — no pixel changes.** Stating it rather than leaving it blank, because §4 requires the
section and "none" without a reason is indistinguishable from a section someone forgot.

The one reader-visible addition, `ask.errors.dailyLimit`, is a **string rendered by an existing
component through an existing path**: prompt 15 built the assistant-slot error row with its own
styling, and `rateLimited` already flows through it. No new element, no new class, no new token, no
change to `app/globals.css`. The only visual property worth checking is that the new string's
length wraps acceptably in the thread at 360px — it is one line longer than `rateLimited`, and the
thread's width is fixed by the Ask bar, so verify it rather than assume it.

## Motion spec

**None.** No tween is added, removed, or retimed. No `ScrollTrigger`. §7.3's three orchestrated
moments and prompt 15's fourth (the streaming dots) are untouched, and the reduced-motion branches
are not in play — the daily-limit message arrives on the same path as every other error, which
never animated in the first place.

## Accessibility requirements

Unchanged, and inherited rather than added. The new error renders in the thread's existing
`role="log"` / `aria-live="polite"` region with the visually-hidden speaker prefix, so it is
announced like any other assistant row. The input is still never disabled (a reader must be able to
type even when the last attempt failed), focus stays where it was, and there is no new interactive
element to put in the tab order.

The one thing to actually verify rather than inherit: the daily-limit row **is announced** and does
not arrive as a silent DOM insertion — the failure mode where a screen-reader user submits, hears
nothing, and submits again.

## Acceptance criteria

Every one of these is checkable. Numbers 1–4 are the standing repo bar and must be pasted verbatim
in the report.

1. `npm run typecheck` — clean, no output.
2. `npm run lint` — **exactly three errors, one each in `components/layout/wordmark.tsx`,
   `components/ui/carousel.tsx`, and `hooks/use-mobile.ts`.** The same three files, not merely the
   same count. Any new error is a failure.
3. `npm run build` — succeeds, **with none of the four new variables and no `GEMINI_API_KEY`
   present.** This is the keyless-build guarantee from prompt 15 decision 7 and it is the criterion
   most likely to be broken by a module-scope client construction.
4. `grep -rn "placeholder: true" lib/copy/` returns **17** hits — unchanged.
5. `grep -rn "UPSTASH\|ASK_DAILY\|ASK_RATE_LIMIT" components/ hooks/ app/` finds **no hit outside
   `app/api/ask/`**, and no `NEXT_PUBLIC_` variable is added anywhere.
6. With the store configured: nine rapid submissions still produce a 429 on the **ninth**, and the
   message is still `ask.errors.rateLimited`.
7. With the store configured and `ASK_DAILY_REQUEST_LIMIT=3`: the fourth question of the day
   returns 429 with `ask.errors.dailyLimit`, and the response body contains no provider name, no
   quota figure, and no store detail. Verified by reading the raw response in the network tab, not
   just the rendered bubble.
8. **Two separate processes share one limit.** Run `npm run dev` and `npm run start` (or two dev
   servers on different ports) against the same store; exhausting the limit on one blocks the
   other. This is the single criterion that proves the durable store actually works, and the
   current code fails it by construction.
9. With the store env vars **removed**: the Ask bar still answers (burst limiter falls back to the
   in-memory map), and the server logs the degradation **once**, not once per request.
10. With the store vars pointing at an **unreachable** URL: burst still falls back and answers;
    the global ceiling refuses with `ask.errors.dailyLimit`. The two halves of decision 5,
    demonstrated rather than asserted.
11. `AGENTS.md` §13's table lists all four new variables with scope and required-by, and §15's
    "durable rate-limit store" and "spend ceiling" bullets are struck through and dated in the same
    style as the two already-resolved entries.
12. `.env.example` lists all four with comments and **no values**, and `git status` shows it
    tracked and modified — not ignored.
13. No `any`, no `as` cast around the store client, and no new dependency beyond the store client
    itself.

## Checks to run

```bash
npm install
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
grep -rn "UPSTASH\|ASK_DAILY\|ASK_RATE_LIMIT" app components hooks lib
grep -rn "NEXT_PUBLIC_" app components lib
git check-ignore -v .env.example   # must print nothing
```

Paste the real output of each. Do not report a check that was not run.

## Manual review steps

```bash
# 1. Keyless build — run this FIRST, before adding anything to .env.local
mv .env.local .env.local.bak
npm run build          # must succeed
mv .env.local.bak .env.local
```

Then, with the store credentials in `.env.local`:

2. `npm run dev`, open `http://localhost:3000`, ask "What does Glidda do?" — it still streams. The
   store adds a round trip before the model call; if the first token is now noticeably later,
   say so in the report with a rough figure rather than letting the user discover it.
3. **Nine submissions inside a minute.** The ninth shows the burst message. Wait 60s; the tenth
   answers.
4. **Set `ASK_DAILY_REQUEST_LIMIT=3` and restart.** Ask four questions. The fourth shows the daily
   message. Open DevTools → Network → the 429 → Response, and confirm the body names no provider,
   no quota, and no store.
5. **Restart the dev server** and ask again — still blocked. This is the point of the whole prompt:
   a process restart no longer resets the count.
6. **Two processes.** `npm run dev` on 3000 and a second on 3001 against the same store. Exhaust on
   3000, then ask on 3001. Blocked. If it is not, the key namespace or the atomic increment is
   wrong.
7. **Comment out the store vars, restart.** The bar answers, and the terminal logs the degradation
   once — not once per question.
8. **Point the store URL at something unreachable, restart.** The bar still answers (fallback), and
   once the global counter cannot be read, the ceiling refuses. Confirm both halves.
9. **Read the daily-limit message at 360px** in the thread. Confirm it wraps without overflowing
   its bubble, per §12's no-horizontal-scroll rule.
10. **With a screen reader or VoiceOver**, trigger the daily limit and confirm the row is announced
    through the existing live region.
11. **Console task, not code:** open the Google AI Studio / Cloud console and confirm what the
    current free-tier daily cap for `gemini-3.5-flash` actually is, and whether a billing budget
    alert can be set. Record both figures in the completion report — decision 6's sizing and
    decision 8's alarm both depend on them and neither is verified in this prompt.

## Decisions this prompt cannot make alone

Bring these to the user before implementing. The first one blocks the rest.

1. **Where is this deployed?** Serverless (Vercel/Netlify/Lambda), one long-lived Node process, or
   multiple instances? If it is one long-lived process, part A is largely unnecessary and this
   prompt shrinks to part B plus a corrected comment. Everything below assumes an answer here.
2. **Which store?** Upstash Redis (recommended, platform-neutral, HTTP), a platform primitive
   (better for part A, useless for part B), or a self-hosted Redis (only sensible if one already
   exists).
3. **The `"unknown"` bucket** (decision 3): keep it as one shared bucket that fails safe for cost
   and badly for users, or exempt it and rely on the global ceiling? Recommendation: exempt, plus a
   loud log.
4. **Confirm the fail-open / fail-closed split** (decision 5): burst soft, ceiling hard. Both
   halves have a cost and the user should own the trade.
5. **The numbers.** The global daily request ceiling, and the per-IP daily sub-cap. These are
   business decisions denominated in dollars, and the dollar figure per request must be computed
   from current pricing before they can be chosen sensibly.
6. **Hash the IP, or not?** (decision 4) Hashing costs traceability during an incident; not hashing
   ships visitor IPs to a third party. Recommendation: hash, and drop `ASK_RATE_LIMIT_SALT` only if
   the user would rather have three env vars than four.
7. **Billing: is it being enabled, and when?** The application ceiling must ship and be verified
   **before** billing removes the free tier's accidental protection. If billing is not being
   enabled at all, part B is still worth building — but it becomes a guard against hitting the free
   quota mid-visit rather than against a bill, and the ceiling number should be set below the free
   quota so our message wins over the provider's error.
8. **Reword `ask.errors.rateLimited`?** (decision 7) "Give it a minute" becomes inaccurate once the
   same string covers a 24-hour per-IP window.

## What this prompt does not resolve

- **Multi-turn and persistence** (§15) — untouched, still open, and would change part B's cost
  arithmetic substantially if it lands, because history goes into every request's input.
- **Whether the Ask bar should answer at all on a pre-launch page** — prompt 16 raised it and it is
  still the user's call. The grounding rules in `lib/ask/system-prompt.ts` remain the only
  mitigation for what the model *says*; this prompt only bounds what it *costs*.
- **The outstanding placeholder swap** (§15) — 17 fixtures still flagged. §11.1 requires them
  listed in any deploy report, and this prompt is a deploy-readiness prompt, so: they are still
  there, and a public deploy carrying them needs explicit sign-off.
- **No automated test covers any of this.** Every acceptance criterion above is manual, because the
  repo has no test runner and adding one here would be a second, larger prompt wearing this one as
  a disguise. That is a real gap in a change whose whole purpose is to fail correctly under
  conditions that are hard to reproduce by hand, and it should be stated in the completion report
  rather than left implicit.
