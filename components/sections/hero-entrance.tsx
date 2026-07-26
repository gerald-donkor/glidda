"use client"

import { useRef } from "react"

import { DURATION, EASE, HERO, STAGGER } from "@/lib/gsap/motion"
import { gsap, useGSAP } from "@/lib/gsap/register"

/**
 * The hero load (§7.3 #1) — the timeline and nothing else.
 *
 * The hero's markup and copy arrive through `children`, so they are rendered on the server and
 * passed in as rendered output rather than imported: nothing but this timeline joins the client
 * bundle. The cost is that this wrapper holds no refs to content it did not create, so the
 * timeline targets `[data-hero]` selector strings — permitted because `scope` is passed, and the
 * scope is this wrapper's own ref, so nothing outside the hero can be matched.
 *
 * The rail's draw is not sequenced here; it lives in `components/layout/rail.tsx`, built from the
 * same `HERO` constants. The two read as one moment, and the draw is the only thing running for
 * the first 200ms.
 */
export function HeroEntrance({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // §7.2: entrances become plain opacity fades. Only the offset changes — the timing is
          // identical, so this is one timeline definition, not two.
          const rise = context.conditions?.reduced ? 0 : HERO.rise

          const timeline = gsap.timeline({
            defaults: { duration: DURATION.entrance, ease: EASE.entrance },
          })

          // `fromTo`, not `from`: the CSS in globals.css has already set opacity to 0 under
          // `@media (scripting: enabled)`, and a `from` tween would animate 0 → 0.
          timeline
            .fromTo(
              '[data-hero="line"]',
              { opacity: 0, y: rise },
              { opacity: 1, y: 0, stagger: STAGGER },
              HERO.lines
            )
            .fromTo(
              '[data-hero="sub"]',
              { opacity: 0, y: rise },
              { opacity: 1, y: 0 },
              HERO.sub
            )
            .fromTo(
              '[data-hero="ctas"]',
              { opacity: 0, y: rise },
              { opacity: 1, y: 0 },
              HERO.ctas
            )
            // The band fades up; it does not rise. The slipstream's own drift is started by
            // `Slipstream` on mount and is not sequenced from here.
            .fromTo('[data-hero="band"]', { opacity: 0 }, { opacity: 1 }, HERO.band)
        }
      )

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <div ref={rootRef} className="flex flex-col gap-(--hero-gap)">
      {children}
    </div>
  )
}
