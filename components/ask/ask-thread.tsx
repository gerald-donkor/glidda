"use client"

import { useEffect, useRef, useState } from "react"

import { AskMessage } from "@/components/ask/ask-message"
import type { AskMessage as AskMessageData, AskStatus } from "@/lib/ask/types"
import { shell } from "@/lib/copy/shell"
import { DURATION, EASE, STAGGER } from "@/lib/gsap/motion"
import { gsap, useGSAP } from "@/lib/gsap/register"
import { focusRing } from "@/lib/utils"

/** How close to the bottom still counts as "following along", in px. A reader who has scrolled
 *  further up than this is re-reading an earlier answer and is not yanked back down mid-read. */
const FOLLOW_THRESHOLD = 48

/**
 * The Ask bar's post-submit thread (§8.1, prompt 15).
 *
 * It renders inside the existing `ask-bar` shell, so the bar remains the single fixed thing on
 * the page and the one permitted shadow (§6.3) still belongs to one element. Like `AskChips` it
 * is absolutely positioned out of flow — revealing it changes no layout anywhere on the page —
 * and it is `inert` while empty, which drops it from the tab order and the accessibility tree in
 * one attribute.
 *
 * `role="log"` + `aria-live="polite"`, never `assertive`: an answer arriving interrupts nothing.
 */
export function AskThread({
  messages,
  status,
}: {
  messages: AskMessageData[]
  status: AskStatus
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLSpanElement>(null)
  const [scrollable, setScrollable] = useState(false)

  const open = messages.length > 0
  const last = messages.at(-1)
  const awaitingFirstToken = status === "streaming" && last?.role === "assistant" && !last.text

  useGSAP(
    () => {
      const panel = panelRef.current
      if (!panel) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const reduced = context.conditions?.reduced ?? false

          gsap.to(panel, {
            opacity: open ? 1 : 0,
            // Reduced motion fades without rising (§7.2).
            y: reduced ? 0 : open ? 0 : 8,
            duration: DURATION.micro,
            ease: EASE.entrance,
          })
        }
      )

      return () => mm.revert()
    },
    { dependencies: [open], scope: panelRef }
  )

  // The streaming indicator. An ambient loop outside §7.3's set, and the reason §7.3 asks
  // for: it is the only signal that the model is working before the first token arrives. Its
  // reduced-motion branch is a static element that communicates the same state.
  useGSAP(
    () => {
      const dots = dotsRef.current
      if (!dots || !awaitingFirstToken) return

      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(dots.children, {
          opacity: 0.2,
          duration: 0.6,
          ease: EASE.loop,
          stagger: STAGGER,
          repeat: -1,
          yoyo: true,
        })
      })

      return () => mm.revert()
    },
    { dependencies: [awaitingFirstToken], scope: dotsRef }
  )

  // Auto-scroll to the newest content. Scroll position is not an animated property, so §7.1's
  // transform-only rule is not in play here.
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    setScrollable(panel.scrollHeight > panel.clientHeight)

    const distance = panel.scrollHeight - panel.scrollTop - panel.clientHeight
    if (distance > FOLLOW_THRESHOLD) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    panel.scrollTo({ top: panel.scrollHeight, behavior: reduced ? "auto" : "smooth" })
  }, [messages, status])

  return (
    <div
      ref={panelRef}
      inert={!open}
      role="log"
      aria-live="polite"
      aria-label={shell.askThreadLabel}
      // A scrollable region unreachable by keyboard is a WCAG failure, so the panel takes focus
      // once it actually scrolls — and never while it is empty and inert.
      tabIndex={open && scrollable ? 0 : -1}
      className={`ask-thread hairline flex flex-col gap-3 rounded-card bg-paper p-4 opacity-0 ${focusRing}`}
    >
      {/* The assistant row is appended empty and filled by the stream, so an untouched one is
          skipped rather than drawn as an empty bubble — the dots below are its stand-in. */}
      {messages
        .filter((message) => message.role === "visitor" || message.text.length > 0)
        .map((message) => (
          <AskMessage key={message.id} message={message} />
        ))}

      {awaitingFirstToken ? (
        <div className="flex items-center gap-2">
          <span className="sr-only">{shell.askStreaming}</span>
          <span ref={dotsRef} aria-hidden className="flex items-center gap-1">
            <span className="size-1 rounded-pill bg-rail-muted" />
            <span className="size-1 rounded-pill bg-rail-muted" />
            <span className="size-1 rounded-pill bg-rail-muted" />
          </span>
        </div>
      ) : null}
    </div>
  )
}
