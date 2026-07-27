import { Monogram } from "@/components/layout/monogram"
import { PlaceholderChip } from "@/components/layout/placeholder-chip"
import { RailStation } from "@/components/layout/rail-station"
import { proofQuote, proofStats } from "@/lib/copy/placeholder/proof"
import { proofCopy } from "@/lib/copy/proof"

/**
 * The proof band (§8, row 5). Two stats on the left, one customer quote on the right, one row,
 * no cards, no borders, one hairline above.
 *
 * Every figure, name, and sentence in it is fabricated (§11.1) and flagged as such — see
 * `lib/copy/placeholder/`. The hairline is a `border-top` on the inner box so the rule starts at
 * the rail-hung content edge, aligned with where every headline on the page begins.
 */
export function ProofBand() {
  return (
    <section id="proof" className="section-rhythm anchor-offset">
      <div className="rail-offset relative">
        <RailStation label={proofCopy.proofStation} />

        <h2 className="sr-only">{proofCopy.proofHeading}</h2>

        <div className="hairline-t pt-10">
          <PlaceholderChip className="mb-10" />

          <div className="grid gap-x-12 gap-y-14 lg:grid-cols-[1.1fr_1fr]">
            <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {proofStats.map((stat) => (
                <div key={stat.figure} className="flex items-baseline gap-4">
                  <dt className="type-display shrink-0 text-headline text-ink">{stat.figure}</dt>
                  <dd className="type-utility max-w-[16ch] text-rail-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>

            <figure>
              <blockquote className="max-w-[46ch] text-body text-ink">
                {proofQuote.quote}
              </blockquote>

              <figcaption className="mt-8 flex items-center gap-3 text-small text-rail-muted lg:justify-end">
                <Monogram initials={proofQuote.monogram} />
                <span>
                  <span className="text-ink">{proofQuote.name}</span>
                  {", "}
                  {proofQuote.role}
                  {", "}
                  {proofQuote.company}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
