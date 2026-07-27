/**
 * "Build your own guide" copy (§8 row 10, §9, §11).
 *
 * §11.1's fixture policy applies to none of this. The row makes no claim about a customer, a
 * person, or a metric — the headline, subcopy, fine print, CTA, and the three card lines are
 * feature copy, ours to write freely, and they are the real copy until someone changes them.
 * (Phrased without the literal flag string on purpose: §14's pre-deploy grep must not match a
 * comment.)
 *
 * The line to hold: every card line is a statement about what Glidda does. The moment one becomes
 * a number or a comparison it has turned into proof, §11.1 starts applying, and it should be cut
 * rather than softened.
 */

import type { NavLink } from "@/lib/copy/shell"

export type CapabilityCard = { heading: string; line: string }

export const buildGuide: {
  station: string
  eyebrow: string
  headline: string
  subcopy: string
  /** Exactly two lines (§5.1), rendered as two paragraphs rather than one string with a break. */
  finePrint: readonly [string, string]
  cta: NavLink
  cards: readonly [CapabilityCard, CapabilityCard, CapabilityCard]
} = {
  station: "Build",
  eyebrow: "Build",
  headline: "Point Glidda at your product and it drafts the first guide.",
  subcopy:
    "It reads what you have already published — your site, your docs, your release notes — and writes a guide you can edit before a visitor ever sees it.",
  finePrint: [
    "Glidda reads only pages that are already public.",
    "You review every guide before it goes live, and you can turn one off in a click.",
  ],
  // The same label and destination as the header pill, the hero primary, the live demo CTA, and
  // the Route CTA: the action keeps its name through the whole flow (§11).
  cta: { label: "Start a guide", href: "#ask" },
  cards: [
    {
      heading: "Guides sound like your docs",
      line: "The wording comes from your own pages, so a guide answers the way your team already writes.",
    },
    {
      heading: "Every visitor gets their own language",
      line: "A guide answers in the language the page was opened in. You do not ship a second version.",
    },
    {
      heading: "You see where people stop",
      line: "Each guide reports the questions it could not answer and the step people left on.",
    },
  ],
}
