import { createHash } from "node:crypto"

import { Redis } from "@upstash/redis"

/**
 * The Ask route's admission control (prompt 18, resolving two §15 open decisions).
 *
 * Three counters, all incremented before the model call and none of them ever decremented:
 * a per-IP burst window, a per-IP daily sub-cap, and a global daily ceiling. The last of those is
 * the spend ceiling — it is what stands between a loop in someone's console and the whole day's
 * quota.
 *
 * **The topology this is written for is serverless** (Vercel/Netlify/Lambda), where every request
 * may land in a fresh isolate. That is why the counters live in Upstash Redis over HTTP rather
 * than in a module-scope `Map`: a map is correct on one long-lived Node process and degrades to
 * approximately nothing when each request starts with an empty one. HTTP rather than the Redis
 * wire protocol because an isolate cannot keep a connection pool.
 *
 * **Failure is handled differently for the two kinds of limit, deliberately.**
 * - *The burst limiter fails open*, degrading to the in-memory map below. If the store is
 *   unreachable, the alternative is every visitor's first question being refused, and a limiter
 *   that takes down the page's primary CTA (§8.1) is a worse outcome than a window of weak
 *   limiting. It is soft precisely because the thing behind it is hard.
 * - *The spend ceiling fails closed.* Money is asymmetric: if the counter cannot be read, the
 *   route cannot know it is under budget, and guessing wrong costs a bill rather than an annoyed
 *   visitor.
 *
 * Do not "fix" that inconsistency — it is the design.
 *
 * Keys are hashed before they leave the process (see `hashClient`), so a raw visitor IP is never
 * written to a third party's database.
 */

// --- Limits -----------------------------------------------------------------------------------

const BURST_MAX_REQUESTS = 8
const BURST_WINDOW_SECONDS = 60

/** 8/minute is 11,520/day for one address, so the burst window does nothing against a patient
 *  script. This is the sub-cap that does. */
const PER_IP_DAILY_MAX_REQUESTS = 50

/**
 * The spend ceiling, in requests per UTC day.
 *
 * **Counted in requests, not tokens or dollars, because the cost of a call is not knowable before
 * it and often not after it either** — usage arrives in the stream's terminal metadata, and this
 * route's most common non-happy path is the reader abandoning an answer, which aborts before that
 * event is ever read. A token-denominated ceiling would systematically undercount exactly the
 * requests that already cost money.
 *
 * A request has a computable worst case, because both ends are capped: the question at 600
 * characters (`askRequestSchema`), the grounding block fixed and identical every time
 * (`system-prompt.ts`), thinking at `minimal`, and the answer at `MAX_OUTPUT_TOKENS` = 1024. That
 * is roughly 950 input + 1024 output tokens, which at `gemini-3.5-flash`'s published $1.50/M in
 * and $9.00/M out is about **$0.012 per request at worst**.
 *
 * So this default is ~$14/day *if billing were enabled* — which it is not. The key is on the free
 * tier, and this number is chosen to sit under the free tier's own per-day request allowance so
 * that our message reaches the reader before the provider's error does. **If billing is ever
 * enabled, re-derive this number from the dollar figure above rather than keeping it** — the free
 * tier is the only thing currently making 1,200 a safe number, and enabling billing removes that
 * protection silently, with no warning and no diff.
 */
const GLOBAL_DAILY_MAX_REQUESTS = 1_200

/** Fractions of the global ceiling that log a warning as they are crossed. Compared against the
 *  exact returned count, so each threshold logs on one request rather than on every request past
 *  it. */
const ALERT_FRACTIONS = [0.5, 0.8, 1] as const

const DAY_SECONDS = 86_400
const KEY_PREFIX = "ask"
const HASH_LENGTH = 32

/** A store outage logs at most this often. A line per request during an outage is its own denial
 *  of service, against the log budget. */
const OUTAGE_LOG_INTERVAL_MS = 300_000

/**
 * Where the client's address comes from, in order. Correct for a platform that **overwrites**
 * `x-forwarded-for` at its edge — Vercel, Netlify, and Lambda behind API Gateway all do.
 *
 * It is not correct anywhere else, and that matters: the header is client-supplied, so behind a
 * proxy that appends rather than overwrites (or behind nothing at all), anyone can send their own
 * and get a fresh bucket per request. Moving to Cloudflare means putting `cf-connecting-ip` first;
 * a bare nginx means whatever its config sets. Change this list when the platform changes.
 */
const CLIENT_IP_HEADERS = ["x-forwarded-for", "x-real-ip"] as const

// --- Types ------------------------------------------------------------------------------------

/**
 * A verdict rather than a boolean, because the two refusals carry different messages and the route
 * cannot re-derive which limit tripped.
 *
 * `client` is "this visitor has asked too much" — either the burst window or their daily sub-cap.
 * Both are the visitor's own budget, both are temporary, and both say the same thing to them.
 * `ceiling` is the global daily one, which is not about them at all.
 */
export type RateLimitVerdict =
  | { allowed: true }
  | { allowed: false; reason: "client" | "ceiling" }

type MemoryWindow = { count: number; resetAt: number }

// --- Store ------------------------------------------------------------------------------------

let store: Redis | null = null
let storeResolved = false
const lastOutageLogAt = new Map<string, number>()
let loggedMissingSalt = false
let loggedMissingClient = false

/**
 * Constructed lazily and memoised. **Never at module scope** — the environment is read on first
 * use so that `npm run build` succeeds on a machine with none of these variables set, which is the
 * same guarantee `GEMINI_API_KEY` has in the route handler (§13).
 */
function getStore(): Redis | null {
  if (storeResolved) return store

  storeResolved = true
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      "[ask] UPSTASH_REDIS_REST_URL/TOKEN are not set — rate limiting and the daily spend ceiling " +
        "are counting in-process only. That is fine for local development and wrong for a deploy: " +
        "on serverless every isolate starts at zero. See AGENTS.md §13."
    )
    return null
  }

  // One retry rather than the client's default of five with exponential backoff: this call sits in
  // front of the model call, so an unreachable store must fail in a fraction of a second rather
  // than spend the request's latency budget discovering it.
  store = new Redis({ url, token, retry: { retries: 1, backoff: () => 100 } })
  return store
}

/**
 * A store outage affects every request, so an un-throttled line per request is its own denial of
 * service against the log budget — and it buries the one line anyone needed to read. One line per
 * message per interval.
 */
function logOutage(scope: string, message: string, error: unknown): void {
  const now = Date.now()
  if (now - (lastOutageLogAt.get(scope) ?? 0) < OUTAGE_LOG_INTERVAL_MS) return
  lastOutageLogAt.set(scope, now)
  console.error(message, error)
}

// --- Counters ---------------------------------------------------------------------------------

const memoryWindows = new Map<string, MemoryWindow>()

/** Sweeps expired windows so the map cannot grow without bound in a long-lived process. */
function incrementInMemory(key: string, ttlSeconds: number, now: number): number {
  for (const [existing, window] of memoryWindows) {
    if (window.resetAt <= now) memoryWindows.delete(existing)
  }

  const window = memoryWindows.get(key)
  if (!window || window.resetAt <= now) {
    memoryWindows.set(key, { count: 1, resetAt: now + ttlSeconds * 1000 })
    return 1
  }

  window.count += 1
  return window.count
}

/**
 * One atomic round trip: `INCR`, then `EXPIRE … NX` so the window is anchored to the first request
 * and later requests cannot push its end out.
 *
 * Never `GET` → compute → `SET`. Two concurrent requests both read the old value, and the limiter
 * stops limiting under exactly the load it exists for.
 */
async function incrementInStore(redis: Redis, key: string, ttlSeconds: number): Promise<number> {
  const [count] = await redis
    .multi()
    .incr(key)
    .expire(key, ttlSeconds, "NX")
    .exec<[number, 0 | 1]>()

  return count
}

// --- Keys -------------------------------------------------------------------------------------

function clientAddress(request: Request): string | null {
  for (const header of CLIENT_IP_HEADERS) {
    const value = request.headers.get(header)
    const first = value?.split(",")[0]?.trim()
    if (first) return first
  }
  return null
}

/**
 * A raw IP is personal data in the EU/UK and this design would otherwise ship it to a third party's
 * database. The limiter only ever compares keys for equality, so it does not need one.
 *
 * The salt is what makes this a privacy control rather than a gesture: an unsalted hash of an IPv4
 * address is brute-forceable in seconds, so a missing salt is logged loudly and the result must not
 * be described as anonymised.
 *
 * The cost is that a hashed key cannot be traced back to an abusive client during an incident.
 * That is the right trade for a marketing page, and it is a decision rather than an oversight.
 */
function hashClient(address: string): string {
  const salt = process.env.ASK_RATE_LIMIT_SALT
  if (!salt && !loggedMissingSalt) {
    loggedMissingSalt = true
    console.error(
      "[ask] ASK_RATE_LIMIT_SALT is not set — client keys are hashed but not salted, which is not " +
        "a privacy control. Set it before deploying."
    )
  }
  return createHash("sha256")
    .update(`${address}${salt ?? ""}`)
    .digest("hex")
    .slice(0, HASH_LENGTH)
}

function utcDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}

/**
 * The ceiling's window is the **UTC calendar day, deliberately, because that is how the provider's
 * own quota resets.** A rolling 24-hour window would drift out of phase with it, and the two
 * ceilings would then mask each other in a way that makes an incident unreadable.
 */
function dailyLimit(): number {
  const raw = process.env.ASK_DAILY_REQUEST_LIMIT
  if (!raw) return GLOBAL_DAILY_MAX_REQUESTS

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.error(
      `[ask] ASK_DAILY_REQUEST_LIMIT is "${raw}", which is not a positive integer — falling back ` +
        `to ${GLOBAL_DAILY_MAX_REQUESTS}.`
    )
    return GLOBAL_DAILY_MAX_REQUESTS
  }
  return parsed
}

// --- The check --------------------------------------------------------------------------------

/**
 * Called first in the route handler, before the body is parsed: a caller who is over the limit
 * should not get to allocate a JSON parse.
 *
 * Takes the `Request` rather than a pre-derived key so that the key-derivation policy — the part
 * that is platform-specific and security-relevant — lives here, in one place, and the route never
 * handles a raw address.
 */
export async function checkRateLimit(request: Request, now = Date.now()): Promise<RateLimitVerdict> {
  const redis = getStore()
  const address = clientAddress(request)
  const day = utcDay(now)

  // Burst — per IP, fails open.
  //
  // An address the platform did not give us is exempt rather than sharing one global bucket with
  // every other unidentified visitor: that bucket would break the Ask bar for everyone at once and
  // tell each of them they had asked too much, which is a self-inflicted outage that looks like a
  // bug. Exempting it is only safe because the global ceiling below is not exempt.
  if (address) {
    const hashed = hashClient(address)
    const burstKey = `${KEY_PREFIX}:burst:${hashed}`
    let burstCount: number

    if (redis) {
      try {
        burstCount = await incrementInStore(redis, burstKey, BURST_WINDOW_SECONDS)
      } catch (error) {
        logOutage(
          "burst",
          "[ask] rate-limit store unreachable — burst limiting is degraded in-process",
          error
        )
        burstCount = incrementInMemory(burstKey, BURST_WINDOW_SECONDS, now)
      }
    } else {
      burstCount = incrementInMemory(burstKey, BURST_WINDOW_SECONDS, now)
    }

    if (burstCount > BURST_MAX_REQUESTS) return { allowed: false, reason: "client" }

    // Per-IP daily. Shares the ceiling's fail-closed posture: it is part of what bounds spend.
    const dayKey = `${KEY_PREFIX}:day:${hashed}:${day}`
    try {
      const dayCount = redis
        ? await incrementInStore(redis, dayKey, DAY_SECONDS)
        : incrementInMemory(dayKey, DAY_SECONDS, now)
      if (dayCount > PER_IP_DAILY_MAX_REQUESTS) return { allowed: false, reason: "client" }
    } catch (error) {
      logOutage(
        "per-ip-daily",
        "[ask] cannot read the per-IP daily counter — refusing rather than guessing",
        error
      )
      return { allowed: false, reason: "ceiling" }
    }
  } else if (!loggedMissingClient) {
    loggedMissingClient = true
    console.error(
      "[ask] no client address on the request — per-IP limiting is off and only the global daily " +
        "ceiling applies. Check which header this platform sets (see CLIENT_IP_HEADERS)."
    )
  }

  // The spend ceiling — global, fails closed.
  //
  // Incremented before the model call and never decremented: not on abort, not on a provider
  // error. It counts requests *admitted to the provider*, and a request that failed after the call
  // still consumed input tokens. Under-counting is the only failure mode here that costs money.
  const limit = dailyLimit()
  const globalKey = `${KEY_PREFIX}:day:global:${day}`
  try {
    const globalCount = redis
      ? await incrementInStore(redis, globalKey, DAY_SECONDS)
      : incrementInMemory(globalKey, DAY_SECONDS, now)

    for (const fraction of ALERT_FRACTIONS) {
      if (globalCount === Math.floor(limit * fraction)) {
        console.warn(
          `[ask] daily request ceiling at ${Math.round(fraction * 100)}% — ${globalCount}/${limit} on ${day}`
        )
      }
    }

    if (globalCount > limit) return { allowed: false, reason: "ceiling" }
  } catch (error) {
    logOutage(
      "ceiling",
      "[ask] cannot read the daily spend ceiling — refusing rather than guessing",
      error
    )
    return { allowed: false, reason: "ceiling" }
  }

  return { allowed: true }
}
