import { z } from "zod"

/**
 * The Ask bar's post-submit types (§8.1). Shared by the client component and the route handler,
 * so the request shape is written once and validated on the server rather than trusted.
 */

/** One row in the thread. `error` rows render in the assistant slot with the error styling. */
export type AskMessage = {
  /** Stable per-message key. Assigned on the client; never sent to the server. */
  id: string
  role: "visitor" | "assistant"
  text: string
  /** True when this assistant row is a failure notice rather than an answer. */
  error?: boolean
}

export type AskStatus = "idle" | "streaming" | "error"

/** The one thing the field accepts. Trimmed first, so whitespace alone fails the minimum. */
export const askRequestSchema = z.object({
  question: z.string().trim().min(1).max(600),
})

export type AskRequest = z.infer<typeof askRequestSchema>

/** The client's own guard uses the same ceiling as the server's (§8.1 acceptance criterion 7). */
export const ASK_MAX_QUESTION_LENGTH = 600
