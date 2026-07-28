import { PlaceholderChip } from "@/components/layout/placeholder-chip"
import { LogoMarquee } from "@/components/motion/logo-marquee"
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
 * A marquee at every width, drifting left at a measured ~17px/s (§5.1). No breakpoint fallback and
 * no grid: a track that scrolls already fits seven names at 360px, which is the whole reason the
 * reference scrolls its band rather than wrapping it.
 *
 * The band arrives as one block, not as seven staggered names: §7.1 caps a stagger at six items
 * and there are seven, so the cap decides it. The marquee's own drift is ambient and starts
 * independently of that arrival.
 */
export function LogoBand() {
  return (
    <section id="customers" className="section-rhythm-tight anchor-offset">
      <Reveal className="rail-offset relative">
        <h2 className="sr-only">{proofCopy.logoBandHeading}</h2>

        <PlaceholderChip className="mb-10" />

        <LogoMarquee companies={companies} />
      </Reveal>
    </section>
  )
}
