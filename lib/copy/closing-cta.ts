/**
 * The closing CTA (§8 row 13, §9, §11).
 *
 * §11.1's fixture policy applies to none of this. A closing line and a button label are not a
 * customer, a person, a quote, or a metric — they are feature copy, ours to write freely, and they
 * are the real copy until someone changes them. (Phrased without the literal flag string on
 * purpose: §14's pre-deploy grep must not match a comment.)
 *
 * The line to hold: the closing line must not smuggle in a number to add urgency. "Join 200 teams"
 * and "be live in ten minutes" are fabricated proof wearing a CTA's clothes. Say what the reader
 * gets, not how many other people got it.
 */

import type { NavLink } from "@/lib/copy/shell"

export const closingCta: {
  /** The Rail's last stop — the only place this word appears on the page (§6.4). */
  station: string
  headline: string
  cta: NavLink
} = {
  station: "Terminus",
  headline: "See what your product looks like with a guide running on it.",
  // The same label and destination as the header pill, the hero primary, the live demo CTA, the
  // Route CTA, and the build panel's CTA: the action keeps its name through the whole flow (§11).
  cta: { label: "Start a guide", href: "#ask" },
}
