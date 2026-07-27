"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { route } from "@/lib/copy/route"

type Status = "idle" | "done" | "failed"

/** How long the button holds its result before returning to its idle label. */
const RESET_MS = 2400

/* Whether a clipboard API exists, read as what it is: a value owned by the browser, not by
   React. `useSyncExternalStore` with a no-op subscription is the primitive for that — it renders
   `false` on the server and during hydration, then the browser's answer, without a setState in an
   effect. Support does not change during a session, so there is nothing to subscribe to. */
const subscribeNever = () => () => {}
const readClipboardSupport = () => Boolean(navigator.clipboard)
const noClipboardOnServer = () => false

/**
 * The embed snippet and its copy button (§8, row 9).
 *
 * The affordance does the thing rather than miming it. Unlike the Ask bar's send button there is
 * no undesigned behaviour hiding behind it (§15) — it is a clipboard write of a static string.
 *
 * The snippet is real, selectable text in a `<code>`, so with JavaScript disabled it is still
 * readable and copyable by hand. The button is only rendered once a clipboard API is confirmed
 * present, so it is absent rather than dead. That check runs in an effect because the server has
 * no `navigator` and rendering the button on the server would mismatch on hydration.
 *
 * The rejection path is handled, not swallowed (§13): the snippet's text is selected and the
 * outcome says what happened and what to do next (§11). The message is visible *and*
 * `aria-live`, so it reaches a sighted reader and a screen reader through the same element.
 */
export function CopyEmbed() {
  const [status, setStatus] = useState<Status>("idle")
  const codeRef = useRef<HTMLElement>(null)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canCopy = useSyncExternalStore(
    subscribeNever,
    readClipboardSupport,
    noClipboardOnServer
  )

  useEffect(
    () => () => {
      if (resetRef.current) clearTimeout(resetRef.current)
    },
    []
  )

  function selectSnippet() {
    const node = codeRef.current
    const selection = window.getSelection()
    if (!node || !selection) return
    const range = document.createRange()
    range.selectNodeContents(node)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  function settle(next: Status) {
    setStatus(next)
    if (resetRef.current) clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => setStatus("idle"), RESET_MS)
  }

  function handleCopy() {
    navigator.clipboard.writeText(route.snippet).then(
      () => settle("done"),
      () => {
        selectSnippet()
        settle("failed")
      }
    )
  }

  return (
    <div className="mt-3">
      {/* Scrolls inside its own box: one script tag is wider than 360px and §12 forbids
          horizontal page scroll. Mono family, normal case and tracking — a code snippet is not
          the Utility *voice* (§6.2); tracking mangles a URL and uppercasing makes it wrong to
          retype. */}
      <pre className="overflow-x-auto rounded-chip bg-surface px-3 py-2.5">
        <code ref={codeRef} className="font-mono text-small whitespace-pre text-ink">
          {route.snippet}
        </code>
      </pre>

      {canCopy ? (
        <Button
          variant="pillSecondary"
          size="chip"
          className="mt-3"
          onClick={handleCopy}
        >
          {route.copy[status]}
        </Button>
      ) : null}

      {/* One line of height is reserved so the common outcome does not reflow the card. */}
      <p aria-live="polite" className="mt-2 min-h-[1lh] text-small text-rail-muted">
        {status === "idle" ? "" : route.status[status]}
      </p>
    </div>
  )
}
