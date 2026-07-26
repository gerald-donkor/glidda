import { companies } from "@/lib/copy/placeholder/companies"
import type { QuoteFixture, StatFixture } from "@/lib/copy/placeholder/types"

/**
 * The proof band's two stats and one quote (§11.2).
 *
 * The figures are deliberately round and notional. A specific-looking number is what makes a
 * fabricated statistic read as researched, so there isn't one here.
 */
export const proofStats: readonly [StatFixture, StatFixture] = [
  { placeholder: true, figure: "50%", label: "fewer support tickets in week one" },
  // U+00D7, not the letter x — so it is not read out as "2 x".
  { placeholder: true, figure: "2×", label: "more accounts reaching first value" },
]

/** The attributed company is read from the logo band's fixtures so the two cannot drift. */
export const proofQuote: QuoteFixture = {
  placeholder: true,
  quote:
    "Placeholder quote. Two sentences, roughly forty words, so the proof band is designed against a realistic length rather than a short one. Replace before launch.",
  name: "A. Mensah",
  role: "Head of Growth",
  company: companies[1].name,
  monogram: "AM",
}
