"use client"

import { ArrowUp } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react"

import { AskChips } from "@/components/ask/ask-chips"
import { AskThread } from "@/components/ask/ask-thread"
import { Button } from "@/components/ui/button"
import { useTypewriterPlaceholder } from "@/hooks/use-typewriter-placeholder"
import { ASK_MAX_QUESTION_LENGTH, type AskMessage, type AskStatus } from "@/lib/ask/types"
import { ask, shell } from "@/lib/copy/shell"
import { cn } from "@/lib/utils"

/**
 * The Ask bar (§8.1) — the page's primary conversion device, fixed to the bottom of the viewport
 * at every scroll position.
 *
 * Submitting sends the question to `/api/ask` and streams the answer into a thread that grows
 * upward from the bar (prompt 15). What is deliberately **not** here: the thread lives and dies
 * with the tab — nothing is persisted across reloads — and every question is answered
 * independently, with no prior turns sent to the model. Multi-turn and persistence are tracked
 * open decisions (§15), not oversights.
 */
export function AskBar() {
  const shellRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const [messages, setMessages] = useState<AskMessage[]>([])
  const [status, setStatus] = useState<AskStatus>("idle")

  const started = messages.length > 0

  useTypewriterPlaceholder(inputRef, {
    questions: ask.restQuestions,
    staticText: ask.focusPlaceholder,
    reducedMotionText: ask.reducedMotionPlaceholder,
    // Once a thread exists the bar is no longer advertising itself, so the loop stops for good:
    // a placeholder cycling questions above a live conversation is the label doing double duty.
    paused: focused || started,
  })

  // A pending fetch must not outlive the component and set state after unmount.
  useEffect(() => () => abortRef.current?.abort(), [])

  // Focus is tracked on the shell, not the input, so moving from the input to a chip keeps the
  // bar expanded.
  function handleBlurCapture(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && shellRef.current?.contains(next)) return
    setFocused(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return
    // Escape collapses the bar. It does **not** clear the thread: destroying a reader's answers
    // with the keystroke that elsewhere on this page just closes something is a trap.
    inputRef.current?.blur()
    setFocused(false)
  }

  function appendDelta(delta: string) {
    setMessages((current) => {
      const next = [...current]
      const last = next.at(-1)
      if (!last || last.role !== "assistant") return current
      // Append to the existing message object rather than pushing one per delta.
      next[next.length - 1] = { ...last, text: last.text + delta }
      return next
    })
  }

  function failLast(text: string) {
    setMessages((current) => {
      const next = [...current]
      const last = next.at(-1)
      if (!last || last.role !== "assistant") return current
      // A truncated stream that carried some text is a complete-enough answer; only a silent one
      // becomes the error notice.
      if (last.text.length > 0) return current
      next[next.length - 1] = { ...last, text, error: true }
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const input = inputRef.current
    if (!input) return

    const question = input.value.trim()
    if (!question || question.length > ASK_MAX_QUESTION_LENGTH) return

    // A second submit while streaming abandons the first.
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const stamp = Date.now()
    setMessages((current) => [
      ...current,
      { id: `v-${stamp}`, role: "visitor", text: question },
      { id: `a-${stamp}`, role: "assistant", text: "" },
    ])
    setStatus("streaming")

    input.value = ""
    setHasValue(false)

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        failLast(response.status === 429 ? ask.errors.rateLimited : ask.errors.failed)
        setStatus("error")
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        appendDelta(decoder.decode(value, { stream: true }))
      }

      failLast(ask.errors.failed)
      setStatus("idle")
    } catch {
      // A reader-initiated abort renders nothing — the next question is already on its way.
      if (controller.signal.aborted) return
      failLast(ask.errors.failed)
      setStatus("error")
    } finally {
      if (abortRef.current === controller) abortRef.current = null
    }
  }

  function handleChipSelect(question: string) {
    const input = inputRef.current
    if (!input) return
    input.value = question
    setHasValue(true)
    input.focus()
  }

  const solidSend = focused || hasValue || status === "streaming"

  return (
    <div
      ref={shellRef}
      id="ask"
      // The fragment target for "Start a guide". No `anchor-offset` — scroll-margin does nothing
      // on a fixed element; following the link moves sequential focus here, so the next Tab
      // lands in the field.
      tabIndex={-1}
      className="ask-bar"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={handleBlurCapture}
      onKeyDown={handleKeyDown}
    >
      {/* The chips and the thread occupy the same space above the field, so they are mutually
          exclusive: chips while the thread is empty, the thread from the first message on. */}
      {started ? (
        <AskThread messages={messages} status={status} />
      ) : (
        <AskChips expanded={focused} onSelect={handleChipSelect} />
      )}

      <form
        onSubmit={handleSubmit}
        className="flex h-(--ask-bar-height) items-center gap-2 rounded-pill bg-paper pr-2 pl-6 shadow-ask ring-ring ring-offset-2 ring-offset-ground has-[input:focus-visible]:ring-2"
      >
        <input
          ref={inputRef}
          type="text"
          aria-label={shell.askLabel}
          autoComplete="off"
          maxLength={ASK_MAX_QUESTION_LENGTH}
          placeholder={ask.reducedMotionPlaceholder}
          onChange={(event) => setHasValue(event.currentTarget.value.length > 0)}
          className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-rail-muted"
        />

        {/* The online dot is --ink, not green: this is page chrome, and the chrome is
            monochrome (§6, prompt 03 decision 8). */}
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-pill bg-(--dot-online) transition-opacity duration-(--duration-micro) ease-(--ease-entrance)",
            focused ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Never `disabled` — a disabled control drops out of the tab order (§12), and
            re-submitting is a legitimate response to an error. */}
        <Button
          type="submit"
          variant="pill"
          size="pill"
          aria-label={shell.askSend}
          className={cn(
            "size-10 shrink-0 p-0",
            solidSend ? "bg-ink text-paper" : "bg-surface text-ink hover:bg-rail-subtle"
          )}
        >
          <ArrowUp aria-hidden />
        </Button>
      </form>
    </div>
  )
}
