import { RailStation } from "@/components/layout/rail-station"
import { Reveal } from "@/components/motion/reveal"
import { FaqAccordion } from "@/components/sections/faq-accordion"
import { faq } from "@/lib/copy/faq"

/**
 * The FAQ (§8, row 12). A single column: eyebrow, headline, and six rows.
 *
 * A server component — `FaqAccordion` is the only client boundary, and it takes its rows as a prop
 * so the copy module is imported once, here.
 *
 * The rows are capped well short of the 1200px shell. A 40px Display-face question run that wide
 * is unreadable, and the whitespace left of the right edge is what keeps this section looking like
 * the rest of the page (§6.3).
 *
 * No hue: this is not a feature panel, so §6.1 is absolute here.
 */
export function Faq() {
  return (
    <section id="faq" className="section-rhythm anchor-offset">
      <Reveal className="rail-offset relative">
        <RailStation label={faq.station} />

        {/* A label, not a heading — promoting it would put an h3 above its own h2. */}
        <p className="type-utility text-rail-muted">{faq.eyebrow}</p>

        <h2 className="mt-6 max-w-[18ch] text-headline">{faq.headline}</h2>

        <div className="mt-[clamp(48px,6vw,72px)] max-w-[72ch]">
          <FaqAccordion rows={faq.rows} />
        </div>
      </Reveal>
    </section>
  )
}
