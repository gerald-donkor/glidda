"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useRef, useState } from "react"

import { Monogram } from "@/components/layout/monogram"
import { Button } from "@/components/ui/button"
import { testimonialQuotes } from "@/lib/copy/placeholder/testimonials"
import { testimonials } from "@/lib/copy/testimonials"
import { EASE, TESTIMONIAL } from "@/lib/gsap/motion"
import { gsap, useGSAP } from "@/lib/gsap/register"

/**
 * The testimonial carousel (§5.1 row 11, §8 row 11).
 *
 * Manual only — §5.1 observed no autoplay, and an auto-advancing carousel would be the fourth
 * copy of the accordion's timer mechanic on one page. The arrows never disable: with three quotes
 * the index wraps, and a button that goes dead under the reader's own cursor loses focus and
 * breaks the keyboard path.
 *
 * **The height never changes.** All three slides share one grid cell via `crossfade-stack`, so the
 * block is always as tall as the tallest quote at the current width — computed by the browser,
 * recomputed for free on resize and on font load. Nothing is measured in JavaScript, there is no
 * `min-height` magic number, and the swap animates exactly one property. §7.1 forbids animating
 * height, and this is the layout that makes the ban costless.
 *
 * Each slide is itself a two-row grid so all three attributions land on the same line, which is
 * what lets the arrows bottom-align to them rather than to the tallest quote alone.
 *
 * `components/ui/carousel.tsx` is deliberately not used: it is a translate-based slider, and §5.1
 * and §5.2 both observed a crossfade with no horizontal movement. Adopting it would mean importing
 * a slider to defeat its only job, and would put embla's per-frame `translate3d` in competition
 * with GSAP for the same transform.
 */
export function TestimonialCarousel() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  /** The previously-active index, so the effect knows which slide to fade out. */
  const prevRef = useRef(0)

  const step = (delta: number) =>
    setActive((index) => gsap.utils.wrap(0, testimonialQuotes.length, index + delta))

  useGSAP(
    () => {
      const root = rootRef.current
      const from = prevRef.current
      // Written inside the hook, never during render — `react-hooks/refs` flags the latter, and
      // `capability-accordion.tsx` documents that boundary.
      prevRef.current = active
      if (!root || from === active) return

      const slides = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-slide]"))
      const out = slides[from]
      const into = slides[active]
      if (!out || !into) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // §7.2 — build nothing. React has already re-rendered `data-active`, so CSS is showing
          // the right quote: no fade, no half-faded frame, nothing left frozen mid-tween.
          if (context.conditions?.reduced) return

          // Both tweens are `fromTo`: by the time this runs, CSS has already hidden the outgoing
          // slide, so a plain `to` would animate 0 → 0 and no fade would ever appear.
          const tl = gsap.timeline({ defaults: { ease: EASE.entrance } })
          tl.fromTo(out, { autoAlpha: 1 }, { autoAlpha: 0, duration: TESTIMONIAL.out }, 0).fromTo(
            into,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: TESTIMONIAL.in },
            TESTIMONIAL.overlap
          )
        }
      )

      return () => mm.revert()
    },
    // `revertOnUpdate` is what makes rapid clicking safe: a second click kills the running
    // timeline and strips its inline styles before the next is built, and React's re-rendered
    // `data-active` is already the correct resting state underneath.
    { scope: rootRef, dependencies: [active], revertOnUpdate: true }
  )

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={testimonials.carousel}
      className="mt-10 grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
    >
      <div className="crossfade-stack" aria-live="polite" aria-atomic="false">
        {testimonialQuotes.map((quote, index) => (
          <figure
            key={quote.name}
            data-slide
            data-active={index === active}
            role="group"
            aria-roledescription="slide"
            aria-label={testimonials.slideLabel(index + 1, testimonialQuotes.length)}
            aria-hidden={index !== active}
            inert={index !== active}
            className="grid grid-rows-[1fr_auto] gap-8"
          >
            <blockquote className="type-display max-w-[52ch] self-start text-quote leading-[1.06] text-ink">
              {quote.quote}
            </blockquote>

            <figcaption className="flex items-center gap-3 text-small text-rail-muted">
              <Monogram initials={quote.monogram} />
              <span>
                <span className="text-ink">{quote.name}</span>
                {", "}
                {quote.role}
                {", "}
                {quote.company}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Without a script these two would be live-looking buttons that do nothing, which is worse
          than absent (§12). `scripting-only` removes them at no hydration cost. */}
      <div className="scripting-only justify-end gap-3">
        <Button variant="pillSecondary" size="icon-pill" onClick={() => step(-1)}>
          <ArrowLeft aria-hidden />
          <span className="sr-only">{testimonials.previous}</span>
        </Button>
        <Button variant="pillSecondary" size="icon-pill" onClick={() => step(1)}>
          <ArrowRight aria-hidden />
          <span className="sr-only">{testimonials.next}</span>
        </Button>
      </div>
    </div>
  )
}
