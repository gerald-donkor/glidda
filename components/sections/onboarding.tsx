import { CapabilitySection } from "@/components/sections/capability-section"
import { capabilities } from "@/lib/copy/capabilities"

/** Onboarding (§8, row 8). Spruce route, panel right. */
export function Onboarding() {
  return (
    <CapabilitySection capability={capabilities.onboarding} route="spruce" side="right" />
  )
}
