import { RailStation } from "@/components/layout/rail-station"
import { BuildPanel } from "@/components/sections/build-panel"
import { CapabilityCards } from "@/components/sections/capability-cards"
import { buildGuide } from "@/lib/copy/build-guide"

/**
 * "Build your own guide" (§8, row 10) — the page's last argument before the social proof and the
 * FAQ: what do I get, and what does it cost me to find out?
 *
 * A server component, and so are both of its columns: nothing in this row is interactive except
 * the CTA anchor, and nothing in it animates (§7.3's three moments are spent, and a mark that drew
 * itself in would compete with the Rail for the same idea).
 *
 * `items-start` so the card stack does not stretch to the panel's height.
 */
export function BuildGuide() {
  return (
    <section id="build" className="section-rhythm anchor-offset">
      <div className="rail-offset relative">
        <RailStation label={buildGuide.station} />

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <BuildPanel />
          <CapabilityCards />
        </div>
      </div>
    </section>
  )
}
