/**
 * Hero copy (§9, §11). The hero makes no claim about a customer, a person, or a metric, so
 * §11.1's placeholder policy applies to none of it — there is no fixture flag and no
 * `PLACEHOLDER` chip here. This is the real copy until someone changes it. (Phrased without the
 * literal flag string on purpose: §14's pre-deploy grep must not match a comment.)
 */

import type { NavLink } from "@/lib/copy/shell"

export const hero: {
  /** Two elements because §7.3 stages the headline's two lines separately — the tuple is the
   *  animation unit, not a promise about where the visual line breaks fall. Below ~560px each
   *  half wraps to two rows and the entrance still staggers in two groups. */
  headline: readonly [string, string]
  subcopy: string
  ctas: { primary: NavLink; secondary: NavLink }
} = {
  headline: ["A guide that walks people", "through your product."],
  subcopy:
    "Glidda answers questions on the page a visitor is standing on, runs a live demo of your real interface, and gets new users to their first result — in any language, at any hour.",
  ctas: {
    // The same label as the header's pill, on purpose: the action keeps its name through the
    // whole flow (§11).
    primary: { label: "Start a guide", href: "#ask" },
    secondary: { label: "See it run", href: "#demos" },
  },
}
