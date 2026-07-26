"use client"

import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { ask, shell } from "@/lib/copy/shell"
import { DURATION, EASE } from "@/lib/gsap/motion"
import { gsap, useGSAP } from "@/lib/gsap/register"

/**
 * The suggested-question row that rises in above the Ask bar on focus (§8.1).
 *
 * It is absolutely positioned out of flow, so revealing it changes no layout anywhere on the
 * page and the reveal is a pure opacity + y tween (§7.1, prompt 03 decision 6). While collapsed
 * the row is `inert`, which takes its buttons out of both the tab order and the accessibility
 * tree in one attribute.
 */
export function AskChips({
  expanded,
  onSelect,
}: {
  expanded: boolean
  onSelect: (question: string) => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const row = rowRef.current
      if (!row) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const reduced = context.conditions?.reduced ?? false

          gsap.to(row, {
            opacity: expanded ? 1 : 0,
            // Reduced motion fades without rising (§7.2).
            y: reduced ? 0 : expanded ? 0 : 8,
            duration: DURATION.micro,
            ease: EASE.entrance,
          })
        }
      )

      return () => mm.revert()
    },
    { dependencies: [expanded], scope: rowRef }
  )

  return (
    <div
      ref={rowRef}
      inert={!expanded}
      aria-label={shell.askSuggestions}
      role="group"
      className="ask-chips-row hidden gap-2 overflow-x-auto opacity-0 sm:flex"
    >
      {ask.chips.map((question) => (
        <Button
          key={question}
          variant="chip"
          size="chip"
          type="button"
          onClick={() => onSelect(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  )
}
