import { PlaceholderChip } from "@/components/layout/placeholder-chip"
import { RailStation } from "@/components/layout/rail-station"
import { Reveal } from "@/components/motion/reveal"
import type { SlipstreamRoute } from "@/components/motion/slipstream"
import { CapabilityAccordion } from "@/components/sections/capability-accordion"
import { CapabilityPanel } from "@/components/sections/capability-panel"
import type { Capability } from "@/lib/copy/capabilities"

/**
 * The shared shape of the three capability sections (§8, row 8). Three rows that differ only in
 * hue, side, and copy, so the layout exists once and `answers.tsx`, `demos.tsx`, and
 * `onboarding.tsx` are the three thin files that name it — §9's one-file-per-section still holds
 * and `app/page.tsx` still reads as a list of sections.
 *
 * A server component: the accordion and the panel are the client boundaries and both are
 * imported, not authored here.
 *
 * DOM order is always text then panel, on every width and in all three sections, so reading order
 * and tab order never depend on which side the panel is drawn. `side` flips the `lg:` column order
 * and nothing else — the DOM is never reordered to move the panel.
 */
export function CapabilitySection({
  capability,
  route,
  side,
}: {
  capability: Capability
  route: SlipstreamRoute
  side: "left" | "right"
}) {
  return (
    <section id={capability.id} className="section-rhythm anchor-offset">
      <Reveal className="rail-offset relative">
        <RailStation label={capability.station} />

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            {/* A label, not a heading — promoting it would put an h3 above its own h2. */}
            <p className="type-utility inline-block rounded-chip bg-surface px-2 py-1 text-rail-muted">
              {capability.eyebrow}
            </p>

            <h2 className="mt-6 max-w-[16ch] text-headline">{capability.headline}</h2>

            {/* §5.1's large deliberate gap between the headline and the first row. */}
            <div className="mt-[clamp(48px,6vw,80px)]">
              <CapabilityAccordion rows={capability.rows} />
            </div>
          </div>

          <div className={side === "left" ? "lg:order-first" : undefined}>
            <CapabilityPanel capability={capability.id} route={route} />

            {/* Outside the panel's `aria-hidden` subtree on purpose (§11.1): the fabricated
                content is hidden from the accessibility tree, the fact that it is fabricated is
                not. The space is reserved statically, so switching the markers off reflows
                nothing. */}
            <div className="mt-4 min-h-[26px]">
              <PlaceholderChip />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
