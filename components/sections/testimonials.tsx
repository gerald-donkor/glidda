import { PlaceholderChip } from "@/components/layout/placeholder-chip"
import { RailStation } from "@/components/layout/rail-station"
import { Reveal } from "@/components/motion/reveal"
import { TestimonialCarousel } from "@/components/sections/testimonial-carousel"
import { testimonials } from "@/lib/copy/testimonials"

/**
 * The testimonial carousel's section shell (§8, row 11).
 *
 * Every quote in it is fabricated and flagged (§11.1) — see `lib/copy/placeholder/testimonials.ts`.
 * The marker chip renders **once for the section**, on the label row and outside the crossfade
 * stack, so it never fades with a slide, never inherits an inactive slide's `aria-hidden`, and
 * reads as a warning about the block rather than as decoration on each quote.
 *
 * The small grey label is the real `<h2>` rather than an `sr-only` heading with a visible twin
 * beside it: this section has a label slot, and one element doing one job beats two saying the
 * same thing (§11). `type-utility` overrides the `@layer base` display-face rule for h1–h4.
 */
export function Testimonials() {
  return (
    <section id="stories" className="section-rhythm anchor-offset">
      <Reveal className="rail-offset relative">
        <RailStation label={testimonials.station} />

        {/* The row reserves its height so turning the markers off reflows nothing. */}
        <div className="flex min-h-[26px] flex-wrap items-center gap-3">
          <h2 className="type-utility text-rail-muted">{testimonials.label}</h2>
          <PlaceholderChip />
        </div>

        <TestimonialCarousel />
      </Reveal>
    </section>
  )
}
