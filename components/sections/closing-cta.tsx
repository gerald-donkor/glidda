import { RailTerminus } from "@/components/layout/rail-terminus"
import { Button } from "@/components/ui/button"
import { closingCta } from "@/lib/copy/closing-cta"

/**
 * The closing CTA (§8, row 13) — the page's last section before the footer.
 *
 * §15 left this section's visual open and said only what it must not be: not hands, which are the
 * reference's pun on *its* product name and are named in §5.3's "leave" list. The concept here is
 * **the terminus**. Glidda's subject is a guided line, the Rail has carried the whole page, and
 * `<Rail />` is rendered inside `<main>` while the footer sits outside it — so the line's physical
 * extent ends here. The arrival is a true statement about the page's geometry, not a metaphor, and
 * it needs no new artwork, image asset, or texture.
 *
 * Nothing animates (§7.3's three moments are spent). The moment a reader experiences is the rail's
 * existing scrubbed paint reaching the marker — so there is no tween here, and therefore no
 * reduced-motion branch to write.
 *
 * Full-bleed by being a section background: the section is already viewport-wide, and `w-screen`
 * would add horizontal overflow equal to the scrollbar width (§12). No hairline — the fill is its
 * own edge against the `--ground` section above it (§6.3).
 *
 * The closing line is an `h2` at `--text-headline`: the page has one `h1` and `--text-hero` belongs
 * to it (§6.2, §12).
 *
 * No hue: this is not a feature panel, so §6.1 is absolute here.
 */
export function ClosingCta() {
  return (
    <section id="start" className="section-rhythm anchor-offset bg-surface">
      <div className="rail-offset relative">
        <RailTerminus label={closingCta.station} />

        <h2 className="max-w-[22ch] text-headline">{closingCta.headline}</h2>

        <div className="mt-10 flex flex-wrap">
          <Button
            variant="pill"
            size="pill"
            nativeButton={false}
            render={<a href={closingCta.cta.href} />}
          >
            {closingCta.cta.label}
          </Button>
        </div>
      </div>
    </section>
  )
}
