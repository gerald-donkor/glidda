import { CapabilitySection } from "@/components/sections/capability-section"
import { capabilities } from "@/lib/copy/capabilities"

/** Demos (§8, row 8). Cable route, panel left — the alternation the reference's three feature
 *  rows use, and the reason the row reads as a sequence rather than as three of the same block. */
export function Demos() {
  return <CapabilitySection capability={capabilities.demos} route="cable" side="left" />
}
