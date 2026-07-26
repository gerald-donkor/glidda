/**
 * Live demo panel copy (§8, row 6; §9, §11). The panel makes no claim about a customer, a person,
 * or a metric, so §11.1's fixture policy applies to none of it — there is no fixture flag and no
 * `PLACEHOLDER` chip here. This is the real copy until someone changes it. (Phrased without the
 * literal flag string on purpose: §14's pre-deploy grep must not match a comment.)
 */

import type { NavLink } from "@/lib/copy/shell"

export const liveDemo: {
  eyebrow: string
  headline: string
  subcopy: string
  /** The same label and destination as the hero's primary and the header's pill: the action
   *  keeps its name through the whole flow (§11). */
  cta: NavLink
  station: string
} = {
  eyebrow: "Live demo",
  headline: "Watch a guide run on a real product.",
  subcopy:
    "It drives the interface, not a recording — every click you see is one a new user would make.",
  cta: { label: "Start a guide", href: "#ask" },
  station: "Live demo",
}
