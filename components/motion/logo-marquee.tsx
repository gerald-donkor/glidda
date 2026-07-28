"use client"

import { useRef } from "react"

import type { CompanyFixture } from "@/lib/copy/placeholder/types"
import { EASE, MARQUEE } from "@/lib/gsap/motion"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/register"

/**
 * The logo band's marquee (§5.1). Measured off `ref/fullanimations.webm`: the band scrolls left at
 * ~17px/s behind a soft fade at each edge.
 *
 * Ambient texture, in the same class as the slipstream — a continuous transform-only loop with no
 * trigger, no sequence, and no arrival — so it adds no fifth orchestrated moment (§7.3).
 *
 * The names render twice. The first copy is the real list; the duplicate is `aria-hidden`, so the
 * accessibility tree still contains exactly seven names and the track can wrap at `xPercent: -50`
 * with no visible seam.
 *
 * **Speed, not duration.** The duration is computed from the measured track width, so the band
 * moves at the same on-screen velocity at 360px as at 1440px. It is recomputed on resize inside
 * `gsap.matchMedia()`, whose revert handles the teardown.
 *
 * It pauses on hover and on keyboard focus entering it — the one deliberate departure from what
 * the reference does, and the reason is WCAG 2.2.2, not preference.
 */
export function LogoMarquee({ companies }: { companies: readonly CompanyFixture[] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  /** The running loop, so the pointer and focus handlers can pause it without rebuilding it. */
  const loopRef = useRef<gsap.core.Tween | null>(null)
  /** The reader is driving — a pointer is over the band, or focus is inside it. */
  const heldRef = useRef(false)
  /** The band is in the viewport. Starts false: a band below the fold should not be mid-wrap
   *  by the time anyone reaches it. */
  const visibleRef = useRef(false)

  const sync = () => {
    const loop = loopRef.current
    if (!loop) return
    if (heldRef.current || !visibleRef.current) loop.pause()
    else loop.play()
  }

  useGSAP(
    () => {
      const root = rootRef.current
      const track = trackRef.current
      if (!root || !track) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // §7.2: no tween at all. The row is a static list and the duplicate copy is not even
          // rendered, so nothing is left frozen part-way through a wrap.
          if (context.conditions?.reduced) return

          // Rebuilt whenever the measured width changes. Progress carries over, so the rebuild is
          // invisible: `xPercent` is a share of the track's own width, and the same progress puts
          // a name in the same relative place at any width. Killing and re-creating is what keeps
          // the velocity constant instead of the duration.
          const build = () => {
            const half = track.scrollWidth / 2
            if (half <= 0) return

            const progress = loopRef.current?.progress() ?? 0
            loopRef.current?.kill()

            loopRef.current = gsap.to(track, {
              xPercent: -50,
              duration: half / MARQUEE.speed,
              ease: EASE.linear,
              repeat: -1,
            })
            loopRef.current.progress(progress)
            sync()
          }

          build()

          const trigger = ScrollTrigger.create({
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            // ScrollTrigger already refreshes on resize, so this is the resize hook as well.
            onRefresh: build,
            onToggle: ({ isActive }) => {
              visibleRef.current = isActive
              sync()
            },
          })

          // onToggle only fires on a change, so a band already in view at mount has to be marked
          // visible explicitly.
          visibleRef.current = trigger.isActive
          sync()

          return () => {
            // Created inside `build`, which also runs from `onRefresh` — after the context has
            // finished collecting — so this tween is killed by hand rather than by the revert.
            loopRef.current?.kill()
            loopRef.current = null
          }
        },
      )

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  // Not wrapped in `contextSafe`: these handlers create nothing, they pause and play a tween the
  // hook already owns, so the wrapper would add no cleanup. Same reasoning as the accordion's.
  const hold = () => {
    heldRef.current = true
    sync()
  }

  const release = () => {
    heldRef.current = false
    sync()
  }

  return (
    <div
      ref={rootRef}
      className="marquee-window"
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocusCapture={hold}
      onBlurCapture={release}
    >
      <div ref={trackRef} className="flex w-max">
        <ul className="flex shrink-0 gap-x-[clamp(40px,6vw,88px)] pr-[clamp(40px,6vw,88px)]">
          {companies.map((company) => (
            <li key={company.name} className="type-display whitespace-nowrap text-panel text-ink">
              {company.name}
            </li>
          ))}
        </ul>

        {/* The wrap copy. Hidden from the accessibility tree so the seven names are announced
            once, and not displayed at all where nothing loops — see `marquee-wrap`. */}
        <ul
          aria-hidden
          className="marquee-wrap shrink-0 gap-x-[clamp(40px,6vw,88px)] pr-[clamp(40px,6vw,88px)]"
        >
          {companies.map((company) => (
            <li key={company.name} className="type-display whitespace-nowrap text-panel text-ink">
              {company.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
