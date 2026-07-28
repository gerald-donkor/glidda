import { PlaceholderChip } from "@/components/layout/placeholder-chip"
import { Reveal } from "@/components/motion/reveal"
import { companies } from "@/lib/copy/placeholder/companies"
import { proofCopy } from "@/lib/copy/proof"

/**
 * The logo band (§8, row 4). Seven invented customer wordmarks, typeset in the Display face —
 * never logo images (§11.1).
 *
 * No station marker: the band is the hero's tail rather than a place the reader arrives at, and
 * it has no headline of its own to hang off the line. The rail runs behind it uninterrupted.
 *
 * It also takes the tighter section rhythm, so the row reads as a continuation of the hero's
 * slipstream rather than as a new section separated by 400px of white.
 *
 * A single row only above 1280px, where the seven names measurably fit; a three- then two-column
 * grid below that. Not a marquee — §5.2 observed the reference's band as static, and a marquee is
 * an ambient loop, which §7.3 #4 is not.
 *
 * The band arrives as one block, not as seven staggered names: §7.1 caps a stagger at six items
 * and there are seven, so the cap decides it.
 */
export function LogoBand() {
  return (
    <section id="customers" className="section-rhythm-tight anchor-offset">
      <Reveal className="rail-offset relative">
        <h2 className="sr-only">{proofCopy.logoBandHeading}</h2>

        <PlaceholderChip className="mb-10" />

        <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 sm:gap-x-8 xl:flex xl:justify-between xl:gap-x-8">
          {companies.map((company) => (
            <li
              key={company.name}
              className="type-display whitespace-nowrap text-panel text-ink"
            >
              {company.name}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
