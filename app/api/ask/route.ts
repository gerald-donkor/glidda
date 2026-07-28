import { ApiError, GoogleGenAI } from "@google/genai"

import { checkRateLimit } from "@/lib/ask/rate-limit"
import { SYSTEM_PROMPT } from "@/lib/ask/system-prompt"
import { askRequestSchema } from "@/lib/ask/types"
import { ask } from "@/lib/copy/shell"

/**
 * The Ask bar's backend (§8.1, prompts 15 and 16).
 *
 * Answers one question at a time from the page's own copy, streaming plain text back to the
 * client. There is no conversation history: every question is answered independently, and
 * multi-turn is a tracked open decision (§15).
 *
 * `GEMINI_API_KEY` is read here and nowhere else. It is server-only — never `NEXT_PUBLIC_`,
 * never referenced from a client component (§13) — and it is read *inside* the handler rather
 * than at module scope, so `npm run build` still succeeds on a machine without a key (CI
 * included). A missing key is a server-side `console.error` plus the generic 500 body; the client
 * is never told why auth failed.
 *
 * The client talks to this route over plain text and has no idea which model is behind it, which
 * is why the provider swap in prompt 16 touched nothing under `components/ask/`.
 */

// Stated explicitly rather than left to the default: a streaming handler that holds a connection
// open is exactly where someone would later reach for `edge`, and that should be a deliberate
// change rather than a silent one.
export const runtime = "nodejs"
export const maxDuration = 30

/** Chosen because it answers on the free tier. `gemini-3.6-flash` was the first choice and allows
 *  only 20 requests a day there, which cannot run a page-wide Ask bar; this one's free-tier
 *  allowance is what the daily ceiling in `lib/ask/rate-limit.ts` is sized against. Revisit both
 *  together if billing is ever enabled. */
const MODEL = "gemini-3.5-flash"
/** Response text only — thinking is budgeted separately by `thinking_level`. Answers are short by
 *  design, so this is a ceiling rather than a target. */
const MAX_OUTPUT_TOKENS = 1024

function json(body: { error: string }, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: Request) {
  // First, before the body is even parsed: a caller who is over the limit should not get to
  // allocate a JSON parse. Both refusals are 429 rather than 503 — the client renders `error` from
  // any non-2xx, and 503 would invite a crawler to treat the page as down.
  const verdict = await checkRateLimit(request)
  if (!verdict.allowed) {
    const error = verdict.reason === "ceiling" ? ask.errors.dailyLimit : ask.errors.rateLimited
    return json({ error }, 429)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: ask.errors.failed }, 400)
  }

  const parsed = askRequestSchema.safeParse(body)
  if (!parsed.success) {
    return json({ error: ask.errors.failed }, 400)
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error(
      "[ask] GEMINI_API_KEY is not set — the Ask bar cannot answer. Add it to .env.local."
    )
    return json({ error: ask.errors.failed }, 500)
  }

  // The key is passed explicitly rather than picked up from the environment: the SDK's own default
  // variable is GOOGLE_GENAI_API_KEY, and the name in .env.local is ours to choose.
  //
  // `vertexai: false` is not a default worth trusting. The SDK reads GOOGLE_GENAI_USE_VERTEXAI
  // from the ambient environment, and a developer machine with gcloud or the Gemini CLI set up has
  // it exported — which silently routes this handler at aiplatform.googleapis.com, where the
  // interactions surface does not exist. Pinning it keeps the route behaving the same on every
  // machine.
  const client = new GoogleGenAI({ apiKey, vertexai: false })
  const encoder = new TextEncoder()

  // Set when the reader goes away — a new question aborting the one in flight, or a closed tab.
  // Without it the loop below keeps enqueueing into a closed controller, which throws
  // ERR_INVALID_STATE and logs a disconnect as though it were a provider failure.
  let cancelled = false

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const interaction = await client.interactions.create(
          {
            // The SDK defaults this path segment to `v1beta1`, which 404s for interactions on the
            // Gemini API. `v1beta` is where the surface actually lives. Pinned rather than left to
            // the default so a silent SDK change cannot move it.
            api_version: "v1beta",
            model: MODEL,
            stream: true,
            // The grounding is the same bytes on every request, so Gemini's implicit prefix cache
            // can hit. Nothing per-request may ever be interpolated into it (see
            // lib/ask/system-prompt.ts).
            system_instruction: SYSTEM_PROMPT,
            input: parsed.data.question,
            generation_config: {
              max_output_tokens: MAX_OUTPUT_TOKENS,
              // 3-series models think by default. These are short answers from a fixed grounding
              // block, so the latency budget goes to the first token instead.
              thinking_level: "minimal",
            },
          },
          // Hands the client's disconnect to the upstream request, so abandoning an answer stops
          // generating it rather than paying for tokens nobody will read.
          { fetchOptions: { signal: request.signal } }
        )

        for await (const event of interaction) {
          if (cancelled) break
          if (event.event_type === "step.delta" && event.delta.type === "text") {
            controller.enqueue(encoder.encode(event.delta.text))
          } else if (event.event_type === "error") {
            // A provider failure that lands after the stream opens arrives as an SSE event rather
            // than a thrown error, so the catch below never sees it. Without this the request ends
            // as a silent empty stream: the reader shows the generic message and the server log
            // says nothing at all, which is the hardest possible thing to debug.
            console.error("[ask] provider stream error", event.error?.code, event.error?.message)
          }
        }
      } catch (error) {
        // A reader that walked away is not a failure and must not be logged as one — it is the
        // ordinary shape of asking a second question before the first has finished.
        if (cancelled || request.signal.aborted) return
        // The status is already on the wire by the time anything in here can fail, so this can
        // never become an HTTP status. Log it server-side and close: the client treats a stream
        // that carried no text as the generic error, and a truncated one as a complete-enough
        // answer. Never `controller.error()` with a provider message attached — that would leak
        // provider detail to the browser.
        //
        // Branch on the typed error and its status, never on the message text.
        if (error instanceof ApiError) {
          if (error.status === 429) {
            console.error("[ask] provider rate limit", error.status)
          } else {
            console.error("[ask] provider error", error.status, error.message)
          }
        } else {
          console.error("[ask] unexpected failure", error)
        }
      } finally {
        // Closing a controller the reader already cancelled throws, and `finally` runs even on
        // the early return above.
        if (!cancelled) controller.close()
      }
    },
    cancel() {
      cancelled = true
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  })
}
