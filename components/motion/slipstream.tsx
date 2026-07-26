"use client"

import { useRef } from "react"

import { EASE, SLIPSTREAM } from "@/lib/gsap/motion"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/register"
import { cn } from "@/lib/utils"

/** Which hue the streaks are painted in. `mono` is the page-chrome variant (§6). */
export type SlipstreamRoute = "mono" | "signal" | "cable" | "spruce"

/** `band` is the wide shallow treatment behind a CTA row; `panel` fills a ~1:1 feature panel. */
export type SlipstreamDensity = "band" | "panel"

type Streak = {
  /** Thickness in px. */
  h: number
  /** Vertical position as a percentage of the sheared frame, so the composition is identical
   *  at 360px and at 1440px rather than cropped. */
  top: number
}

/**
 * The streak field, fixed rather than random: a random field cannot be reviewed twice. Gaps are
 * wider than the streaks so the texture stays open and never reads as stripes.
 */
const STREAKS: Record<SlipstreamDensity, readonly (readonly Streak[])[]> = {
  band: [
    [
      { h: 34, top: 12 },
      { h: 18, top: 44 },
      { h: 26, top: 74 },
    ],
    [
      { h: 14, top: 26 },
      { h: 30, top: 56 },
      { h: 20, top: 88 },
    ],
    [
      { h: 22, top: 6 },
      { h: 16, top: 36 },
      { h: 28, top: 66 },
    ],
  ],
  panel: [
    [
      { h: 26, top: 8 },
      { h: 12, top: 27 },
      { h: 20, top: 46 },
      { h: 14, top: 68 },
      { h: 24, top: 86 },
    ],
    [
      { h: 16, top: 16 },
      { h: 22, top: 34 },
      { h: 10, top: 55 },
      { h: 26, top: 74 },
      { h: 12, top: 93 },
    ],
    [
      { h: 12, top: 4 },
      { h: 18, top: 22 },
      { h: 24, top: 60 },
      { h: 10, top: 80 },
      { h: 16, top: 96 },
    ],
  ],
}

/** Each layer is rendered twice inside itself; -50% puts copy two exactly where copy one was. */
const COPIES = [0, 1]

/**
 * The slipstream (§6.3) — the one texture component in the system.
 *
 * Long parallel streaks, sheared -12°, drifting along their own axis under a static grain. Three
 * layers at three unrelated periods give depth without parallax maths. It must read as motion
 * *along a line*, the same idea as the Rail; if it reads as blobs or fog it is wrong.
 *
 * It is `position: absolute; inset: 0`, so **the consumer must supply a positioned,
 * overflow-clipped box** (`relative overflow-hidden`, plus a radius if the box is rounded).
 *
 * Decorative and `aria-hidden` (§12). With JavaScript off, or under
 * `prefers-reduced-motion: reduce`, the streaks and the grain still render from CSS — the static
 * sheared field is the fallback, and no tween is created (§7.2).
 */
export function Slipstream({
  route = "mono",
  density = "panel",
  className,
}: {
  route?: SlipstreamRoute
  density?: SlipstreamDensity
  className?: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      const root = rootRef.current
      const layers = layerRefs.current.filter(
        (layer): layer is HTMLDivElement => layer !== null
      )
      if (!root || layers.length === 0) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // The CSS-rendered field is already the reduced-motion state, so there is nothing to
          // build and nothing to freeze (§7.2).
          if (context.conditions?.reduced) return

          // Three tweens rather than one timeline: the layers have different periods, so a
          // shared timeline would have to fight its own duration to express them.
          const drifts = layers.map((layer, index) =>
            gsap.to(layer, {
              xPercent: -50,
              duration: SLIPSTREAM.durations[index],
              ease: EASE.linear,
              repeat: -1,
            })
          )

          // With five slipstreams on the finished page, only the ones in view should run.
          const trigger = ScrollTrigger.create({
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            onToggle: ({ isActive }) => {
              for (const drift of drifts) {
                if (isActive) drift.play()
                else drift.pause()
              }
            },
          })

          // onToggle only fires on a change, so an instance that mounts off-screen has to be
          // paused explicitly.
          if (!trigger.isActive) {
            for (const drift of drifts) drift.pause()
          }
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
      data-route={route}
      data-density={density}
      className={cn("slipstream", className)}
    >
      <div className="slipstream-shear">
        {STREAKS[density].map((streaks, layerIndex) => (
          <div
            key={layerIndex}
            ref={(element) => {
              layerRefs.current[layerIndex] = element
            }}
            className="slipstream-layer"
          >
            {COPIES.map((copy) => (
              <div key={copy} className="slipstream-half">
                {streaks.map((streak, streakIndex) => (
                  <span
                    key={streakIndex}
                    className="slipstream-streak"
                    style={
                      {
                        "--streak-h": `${streak.h}px`,
                        "--streak-top": `${streak.top}%`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="slipstream-grain" />
    </div>
  )
}
