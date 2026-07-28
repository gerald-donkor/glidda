"use client"

import { useRef } from "react"

import { DURATION, EASE, REVEAL, STAGGER } from "@/lib/gsap/motion"
import { gsap, useGSAP } from "@/lib/gsap/register"

/**
 * A section arrival (§7.3 #4) — the wrapper, and the only implementation of it.
 *
 * It replaces a section's inner `rail-offset` box rather than wrapping the `<section>`: §13 puts
 * section spacing on the section element only, so animating the element that owns the vertical
 * rhythm would carry the spacing along with the content. The section keeps its rhythm and stays
 * put; its contents arrive.
 *
 * Like `HeroEntrance`, the content arrives through `children` and is therefore rendered on the
 * server and passed in as output rather than imported — every section stays a server component and
 * nothing but this wrapper joins the client bundle.
 *
 * Two shapes, and the difference is what keeps this from being the templated every-element fade:
 *
 * - **block** (the default) — the whole box fades and rises as one thing.
 * - **stagger** — the box fades as one thing and only its `[data-reveal-item]` children rise, at
 *   `STAGGER`. Opacity stays on the box so the two never multiply into a dimmer mid-flight frame.
 *   Used only where a section has a genuine set of siblings, never beyond six (§7.1).
 *
 * `once: true` on every trigger: nothing re-animates on scroll back, and the trigger kills itself
 * after it fires. Instances are created in `app/page.tsx`'s composition order, which is page order,
 * so no `refreshPriority` is needed.
 *
 * **No `document.fonts.ready` refresh here, and the reason is measured, not assumed.** Three faces
 * load through `next/font` and their metrics move the page, so the obvious thing is one
 * `ScrollTrigger.refresh()` once they land. It breaks deep links: a refresh drives the scroller to
 * measure, and doing that after the browser has begun its same-document anchor scroll cancels it —
 * `/#faq` landed at scrollY 112 instead of 9806, with and without this call, on the same build.
 * ScrollTrigger's default `autoRefreshEvents` already includes `load`, which `next/font`'s
 * preloaded faces delay, so the refresh was redundant as well as harmful.
 */
export function Reveal({
  children,
  className,
  stagger = false,
}: {
  children: React.ReactNode
  className?: string
  stagger?: boolean
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // §7.2: entrances become plain opacity fades. Only the offsets change — the timing and
          // the trigger are identical, so this is one definition, not two.
          const reduced = Boolean(context.conditions?.reduced)
          const rise = reduced ? 0 : REVEAL.rise

          const timeline = gsap.timeline({
            defaults: { duration: DURATION.entrance, ease: EASE.entrance },
            scrollTrigger: { trigger: root, start: REVEAL.start, once: true },
          })

          // The station node, ahead of the content. It is a descendant of the box that fades, so
          // the lead reads as the marker settling to full size first rather than appearing first.
          const node = root.querySelector("[data-reveal-node]")
          if (node) {
            timeline.fromTo(
              node,
              { opacity: 0, scale: reduced ? 1 : REVEAL.nodeScale },
              { opacity: 1, scale: 1 },
              0
            )
          }

          const items = stagger
            ? gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-reveal-item]"))
            : []

          // `fromTo`, not `from`: `[data-reveal]` is already at opacity 0 under
          // `@media (scripting: enabled)` in globals.css, and a `from` tween would animate 0 → 0.
          if (items.length > 0) {
            timeline
              .fromTo(root, { opacity: 0 }, { opacity: 1 }, REVEAL.nodeLead)
              // `clearProps` so no transform is left behind on a box that other sections position
              // absolutely against. At rest the offset is 0, so clearing changes nothing visible.
              .fromTo(
                items,
                { y: rise },
                { y: 0, stagger: STAGGER, clearProps: "transform" },
                REVEAL.nodeLead
              )
          } else {
            timeline.fromTo(
              root,
              { opacity: 0, y: rise },
              { opacity: 1, y: 0, clearProps: "transform" },
              REVEAL.nodeLead
            )
          }
        }
      )

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <div ref={rootRef} data-reveal className={className}>
      {children}
    </div>
  )
}
