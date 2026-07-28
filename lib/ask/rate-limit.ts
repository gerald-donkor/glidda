/**
 * A fixed-window limiter for the Ask route (prompt 15, decision 6).
 *
 * **Read this before relying on it.** The window lives in a module-scope `Map`, which is
 * per-process. On a single dev server or one long-lived Node process it works exactly as
 * intended. On a serverless platform with per-request isolates it degrades to approximately
 * nothing — every cold start begins with an empty map. It is a speed bump against a casual loop,
 * not a defence against a determined one. A durable shared store (Redis, Upstash, a platform
 * rate-limit primitive) is a tracked open decision in AGENTS.md §15 and is required before any
 * public deploy of this route.
 */

const WINDOW_MS = 60_000
const MAX_REQUESTS = 8

type Window = { count: number; resetAt: number }

const windows = new Map<string, Window>()

/**
 * Both headers are supplied by the client and are trivially spoofed unless a trusted proxy is the
 * only thing that can set them. Same caveat as above, and the same reason this is a speed bump:
 * an attacker who can forge the header gets a fresh bucket per request.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}

/** True when the caller is over the limit. Sweeps expired windows so the map cannot grow without
 *  bound in a long-lived process. */
export function isRateLimited(key: string, now = Date.now()): boolean {
  for (const [existing, window] of windows) {
    if (window.resetAt <= now) windows.delete(existing)
  }

  const window = windows.get(key)
  if (!window || window.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  window.count += 1
  return window.count > MAX_REQUESTS
}
