"use client"

import { useRef } from "react"

import type { SlipstreamRoute } from "@/components/motion/slipstream"
import { Slipstream } from "@/components/motion/slipstream"
import { Vignette } from "@/components/motion/vignette"
import type { Capability } from "@/lib/copy/capabilities"
import { CAPABILITY, EASE } from "@/lib/gsap/motion"
import { gsap, useGSAP } from "@/lib/gsap/register"

/**
 * A capability panel: the square box, its slipstream, and its vignette — plus the carriage
 * (§6.4), the short scrubbed translation that makes the panel read as carried along the rail
 * rather than as a square floating beside it.
 *
 * A client component only because the carriage needs a ref on the box itself. Its two children
 * are client components already, so the boundary costs nothing: the section around it stays a
 * server component.
 *
 * The box supplies the positioning, the clip, and the radius that `Slipstream` requires. The fill
 * is `--ground`, not the wash — the streaks *are* the wash, so a washed fill would render an
 * invisible texture, the same reasoning as the live demo panel.
 */
export function CapabilityPanel({
  capability,
  route,
}: {
  capability: Capability["id"]
  route: SlipstreamRoute
}) {
  const boxRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const box = boxRef.current
      if (!box) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // §7.2: no trigger at all, so the panel simply sits at rest.
          if (context.conditions?.reduced) return

          gsap.fromTo(
            box,
            { y: CAPABILITY.drift },
            {
              y: -CAPABILITY.drift,
              ease: EASE.linear,
              scrollTrigger: {
                trigger: box,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          )
        },
      )

      return () => mm.revert()
    },
    { scope: boxRef },
  )

  return (
    <div ref={boxRef} className="capability-panel rounded-panel hairline bg-ground">
      <Slipstream route={route} density="panel" />
      <Vignette capability={capability} />
    </div>
  )
}
