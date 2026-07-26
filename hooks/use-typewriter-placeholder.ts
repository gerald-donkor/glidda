"use client"

import { useRef, type RefObject } from "react"

import { EASE, TYPEWRITER } from "@/lib/gsap/motion"
import { gsap, useGSAP } from "@/lib/gsap/register"

type Options = {
  /** The questions to type and delete, in order. */
  questions: readonly string[]
  /** The static string shown while paused — the Ask bar's focused placeholder (§8.1). */
  staticText: string
  /** The string shown instead of any animation under `prefers-reduced-motion` (§7.2). */
  reducedMotionText: string
  /** True while the bar is focused. Pauses the loop and writes `staticText`. */
  paused: boolean
}

/**
 * Types and deletes a loop of questions into an input's `placeholder` (§8.1).
 *
 * This writes the DOM property directly rather than through state, so a 25-character question
 * costs zero React re-renders instead of fifty. It renders nothing, which is why it is a hook
 * and not a component in `components/motion/` (prompt 03, decision 14).
 */
export function useTypewriterPlaceholder(
  inputRef: RefObject<HTMLInputElement | null>,
  { questions, staticText, reducedMotionText, paused }: Options
) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      const write = (value: string) => {
        if (inputRef.current) inputRef.current.placeholder = value
      }

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reduced) {
            // No timeline at all — one static string (§7.2).
            write(reducedMotionText)
            timelineRef.current = null
            return
          }

          const timeline = gsap.timeline({ repeat: -1 })

          for (const question of questions) {
            const cursor = { n: 0 }
            const render = () => write(question.slice(0, Math.round(cursor.n)))

            timeline
              .to(cursor, {
                n: question.length,
                duration: question.length * TYPEWRITER.typeSpeed,
                ease: EASE.linear,
                snap: { n: 1 },
                onUpdate: render,
              })
              .to(cursor, {
                n: 0,
                duration: question.length * TYPEWRITER.deleteSpeed,
                ease: EASE.linear,
                snap: { n: 1 },
                onUpdate: render,
                delay: TYPEWRITER.hold,
              })
              .to({}, { duration: TYPEWRITER.pause })
          }

          timelineRef.current = timeline
          return () => {
            timelineRef.current = null
          }
        }
      )

      return () => mm.revert()
    },
    // No `scope` — the hook selects nothing; it writes to one element it already holds a ref to.
    { dependencies: [questions, reducedMotionText] }
  )

  // Pausing is a separate effect so toggling focus never rebuilds the timeline.
  useGSAP(
    () => {
      const timeline = timelineRef.current
      if (!timeline) return

      if (paused) {
        timeline.pause()
        if (inputRef.current) inputRef.current.placeholder = staticText
        return
      }

      // Restart rather than resume: resuming can land mid-hold, leaving the focused placeholder
      // on screen for over a second after the bar has collapsed.
      timeline.restart()
    },
    { dependencies: [paused, staticText] }
  )
}
