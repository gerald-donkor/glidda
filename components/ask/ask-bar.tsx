"use client"

import { ArrowUp } from "lucide-react"
import { useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent } from "react"

import { AskChips } from "@/components/ask/ask-chips"
import { Button } from "@/components/ui/button"
import { useTypewriterPlaceholder } from "@/hooks/use-typewriter-placeholder"
import { ask, shell } from "@/lib/copy/shell"
import { cn } from "@/lib/utils"

/**
 * The Ask bar (§8.1) — the page's primary conversion device, fixed to the bottom of the viewport
 * at every scroll position.
 *
 * The send button is deliberately **inert**: post-submit UI is undesigned (§15), so the form's
 * submit handler prevents the default and does nothing else. It is not `disabled` — a disabled
 * control would drop out of the tab order and break §12's full-keyboard requirement, and would
 * misrepresent a feature that is coming.
 */
export function AskBar() {
  const shellRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  useTypewriterPlaceholder(inputRef, {
    questions: ask.restQuestions,
    staticText: ask.focusPlaceholder,
    reducedMotionText: ask.reducedMotionPlaceholder,
    paused: focused,
  })

  // Focus is tracked on the shell, not the input, so moving from the input to a chip keeps the
  // bar expanded.
  function handleBlurCapture(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && shellRef.current?.contains(next)) return
    setFocused(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return
    inputRef.current?.blur()
    setFocused(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Intentionally inert until the post-submit UI is designed and approved (§15).
    event.preventDefault()
  }

  function handleChipSelect(question: string) {
    const input = inputRef.current
    if (!input) return
    input.value = question
    setHasValue(true)
    input.focus()
  }

  const solidSend = focused || hasValue

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
      <AskChips expanded={focused} onSelect={handleChipSelect} />

      <form
        onSubmit={handleSubmit}
        className="flex h-(--ask-bar-height) items-center gap-2 rounded-pill bg-paper pr-2 pl-6 shadow-ask ring-ring ring-offset-2 ring-offset-ground has-[input:focus-visible]:ring-2"
      >
        <input
          ref={inputRef}
          type="text"
          aria-label={shell.askLabel}
          autoComplete="off"
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
