import { CapabilitySection } from "@/components/sections/capability-section"
import { capabilities } from "@/lib/copy/capabilities"

/** Answers (§8, row 8). Signal route, panel right — the first arrival of a hue on the page. */
export function Answers() {
  return (
    <CapabilitySection capability={capabilities.answers} route="signal" side="right" />
  )
}
