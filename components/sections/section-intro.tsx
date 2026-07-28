import { Reveal } from "@/components/motion/reveal"
import { sectionIntro } from "@/lib/copy/section-intro"

/**
 * The section intro (§8, row 7). A left-aligned headline and a two-line paragraph, and nothing
 * else on the row.
 *
 * No station marker (§6.4): the intro is a sentence that introduces what follows, not a place the
 * reader arrives at — the three capability sections after it carry their own stations, and
 * marking the same arrival twice would say the rail stops here. The rail runs behind it unbroken.
 *
 * The two `max-w` measures are what produce the two-line wraps at desktop width without a
 * hard-coded break; neither is a promise about where the break lands at every width.
 */
export function SectionIntro() {
  return (
    <section id="capabilities" className="section-rhythm anchor-offset">
      <Reveal className="rail-offset relative">
        <h2 className="max-w-[20ch] text-headline">{sectionIntro.headline}</h2>
        <p className="mt-6 max-w-[62ch] text-body text-rail-muted">{sectionIntro.body}</p>
      </Reveal>
    </section>
  )
}
