"use client"

import { useRef } from "react"

import { EASE } from "@/lib/gsap/motion"
import { gsap, useGSAP } from "@/lib/gsap/register"

/**
 * The Rail (§6.4, §7.3 #2). A single hairline running the full height of `<main>`, with the
 * travelled length painted `--ink` behind the viewport's midpoint.
 *
 * The paint is a `scaleY` 0 → 1 scrubbed against `<main>` from `top center` to `bottom center`.
 * At progress *p* the paint is `p × mainHeight` tall and the viewport midpoint sits `p ×
 * mainHeight` into `<main>`, so the paint's tip tracks the midpoint exactly — with no per-frame
 * measurement and transform-only work (§7.1).
 *
 * Station markers are not drawn here. Each section renders its own `<RailStation>`, so the
 * markers exist in the server HTML and nothing has to be measured or refreshed (prompt 03,
 * decision 3).
 */
export function Rail() {
  const rootRef = useRef<HTMLDivElement>(null)
  const paintRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const paint = paintRef.current
      // The trigger is the `<main>` this is rendered into, reached through the DOM rather than a
      // selector — the Rail must not know a class name that lives in `app/layout.tsx`.
      const main = rootRef.current?.parentElement
      if (!paint || !main) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reduced) {
            gsap.set(paint, { scaleY: 1 })
            return
          }

          gsap.to(paint, {
            scaleY: 1,
            ease: EASE.linear,
            scrollTrigger: {
              trigger: main,
              start: "top center",
              end: "bottom center",
              scrub: true,
            },
          })
        }
      )

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="content-shell pointer-events-none absolute inset-0"
    >
      <div className="rail-track">
        <div ref={paintRef} className="rail-paint" />
      </div>
    </div>
  )
}
