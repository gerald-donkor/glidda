"use client"

import { useRef } from "react"

import { EASE, HERO } from "@/lib/gsap/motion"
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
 * The Rail also owns its half of the hero load (§7.3 #1): a `--ground`-coloured cover retreating
 * downward off the top of the track. It is built from the same `HERO` constants as the hero's
 * timeline, so the two read as one moment without either component knowing the other's internals.
 *
 * Station markers are not drawn here. Each section renders its own `<RailStation>`, so the
 * markers exist in the server HTML and nothing has to be measured or refreshed (prompt 03,
 * decision 3).
 */
export function Rail() {
  const rootRef = useRef<HTMLDivElement>(null)
  const paintRef = useRef<HTMLDivElement>(null)
  const leadRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const paint = paintRef.current
      const lead = leadRef.current
      // The trigger is the `<main>` this is rendered into, reached through the DOM rather than a
      // selector — the Rail must not know a class name that lives in `app/layout.tsx`.
      const main = rootRef.current?.parentElement
      if (!paint || !lead || !main) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reduced) {
            gsap.set(paint, { scaleY: 1 })
            // The rail is simply present, undrawn (§7.2).
            gsap.set(lead, { scaleY: 0 })
            return
          }

          // One viewport of cover per 0.7s, which above the fold reads as the line drawing in
          // from the top edge. Below the fold nothing is observable at load, so nothing is spent
          // animating it. Transform only (§7.1).
          gsap.to(lead, {
            scaleY: 0,
            duration: HERO.railDraw,
            ease: EASE.entrance,
          })

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

  // `z-10` on the root: the hero's full-bleed band is a positioned element later in `<main>`, so
  // at equal z-index it would paint over the line and sever it for the band's height. §6.4
  // requires a single continuous line, and the rail crossing over the slipstream is the right
  // reading anyway — the rail is the route, the slipstream is the ground it crosses. Safe: the
  // rail sits at --rail-x and content starts --rail-gap further in, and --z-ask keeps the Ask bar
  // above it regardless.
  return (
    <div
      ref={rootRef}
      aria-hidden
      className="content-shell pointer-events-none absolute inset-0 z-10"
    >
      <div className="rail-track">
        <div ref={leadRef} className="rail-lead" />
        <div ref={paintRef} className="rail-paint" />
      </div>
    </div>
  )
}
