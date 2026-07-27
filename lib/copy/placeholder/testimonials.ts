import { companies } from "@/lib/copy/placeholder/companies"
import type { QuoteFixture } from "@/lib/copy/placeholder/types"

/**
 * The testimonial carousel's three quotes (§11.2).
 *
 * Fictional by construction, like everything else in this directory: no person here exists, no
 * company here trades, and no result here was measured. Each quote announces itself in its own
 * text, so it cannot be mistaken for a customer claim even with the visible marker turned off.
 * Removable in one pass — delete this file and its one import.
 *
 * Lengths are 32–36 words, deliberately unequal, so the layout is designed against a real spread:
 * the stack has to size itself to the tallest of the three and the attribution row has to hold its
 * line whichever quote is showing.
 *
 * None of the three is attributed to Rivetworks — the proof band already quotes that name, and one
 * fictional customer supplying two quotes reads as thin. Companies are read from `companies` so
 * these and the logo band can never drift apart.
 *
 * Monograms are authored, not derived from the names — `types.ts` says why.
 */
export const testimonialQuotes: readonly QuoteFixture[] = [
  {
    placeholder: true,
    quote:
      "Placeholder quote. Three sentences of roughly forty words, written so the pull-quote wraps to three lines at desktop width and the attribution row below it is designed against a real length. Replace before launch.",
    name: "J. Okonkwo",
    role: "Head of Onboarding",
    company: companies[0].name,
    monogram: "JO",
  },
  {
    placeholder: true,
    quote:
      "Placeholder quote, second of three. It runs a little longer than the first, so the stack sizes itself to the tallest quote and the arrows never move when a reader steps between them. Replace before launch.",
    name: "R. Lindqvist",
    role: "VP Product",
    company: companies[2].name,
    monogram: "RL",
  },
  {
    placeholder: true,
    quote:
      "Placeholder quote, third of three. It is the shortest of the set, so the crossfade is tested against a change in height as well as a change in words. Replace before launch.",
    name: "T. Baptiste",
    role: "Growth lead",
    company: companies[4].name,
    monogram: "TB",
  },
]
