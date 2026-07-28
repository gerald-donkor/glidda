import { buildGuide } from "@/lib/copy/build-guide"

/**
 * The right column of §8 row 10 — three peers, not a list.
 *
 * Hand-rolled boxes rather than `components/ui/card.tsx`: that primitive brings shadcn's own radius
 * scale, `ring-1` where this page uses a hairline, a `--card-spacing` variable, and a
 * header/content/footer structure none of which this needs. Three padded boxes are not a card
 * component, and overriding all of it costs more than the markup does (§10) — the same conclusion
 * `embed-panel.tsx` reached.
 *
 * Headings are `--text-panel`, which §6.2's table names for capability cards specifically. At
 * `--text-headline` beside a full panel they would out-shout the section's own `h2`.
 *
 * They carry no numbering. §6.4 allows that in the Route section alone, where it encodes a real
 * ordered sequence; these three are unordered and numbering them would be decoration.
 */
export function CapabilityCards() {
  return (
    <div className="flex flex-col gap-4">
      {buildGuide.cards.map((card) => (
        <div
          key={card.heading}
          data-reveal-item
          className="hairline rounded-card bg-surface p-6 sm:p-8"
        >
          <h3 className="text-panel">{card.heading}</h3>
          <p className="mt-3 max-w-[42ch] text-body text-rail-muted">{card.line}</p>
        </div>
      ))}
    </div>
  )
}
