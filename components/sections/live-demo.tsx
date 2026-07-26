import { RailStation } from "@/components/layout/rail-station"
import { Slipstream } from "@/components/motion/slipstream"
import { Button } from "@/components/ui/button"
import { liveDemo } from "@/lib/copy/live-demo"

/**
 * The live demo panel (§8, row 6). A full-width rounded panel with a slipstream backdrop, an
 * eyebrow, a headline, one line of subcopy, and the solid ink pill.
 *
 * A server component: `Slipstream` is the only client boundary and it is imported, not authored
 * here. Nothing new animates (§7.3) — the drift below is the existing ambient loop, which starts
 * and pauses itself and already carries its own reduced-motion branch.
 *
 * The fill is `--ground`, not `--surface`: `mono`'s streaks *are* `--surface`, so a surface fill
 * would render an invisible texture. The pale grey a reader sees is the streak field itself, and
 * the hairline is what keeps the panel's edge legible where a streak fades out near it.
 *
 * Left-aligned, like everything else on this page — the reference centres its equivalent, but a
 * single centred block on a page with one strong left edge reads as a mistake, not as emphasis.
 */
export function LiveDemo() {
  return (
    <section id="live-demo" className="section-rhythm anchor-offset">
      <div className="rail-offset relative">
        <RailStation label={liveDemo.station} />

        {/* `Slipstream` is absolute, so this box supplies the positioning, the clip, and the
            radius — without the radius here the streaks square off the rounded corners. */}
        <div className="relative overflow-hidden rounded-panel hairline bg-ground">
          {/* `band`, not `panel`: this box is wide and shallow like the hero's, and the panel
              density's five streaks per layer would crowd it into stripes (§6.3). */}
          <Slipstream route="mono" density="band" />

          {/* `relative` alone stacks this above the slipstream. No `z-` utility: a z-index here
              would start a stacking context the Ask bar then has to out-rank. */}
          <div className="relative px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24">
            {/* A label, not a heading — promoting it would put an h3 above its own h2. */}
            <p className="type-utility text-rail-muted">{liveDemo.eyebrow}</p>

            <h2 className="mt-6 max-w-[20ch] text-headline">{liveDemo.headline}</h2>

            <p className="mt-6 max-w-[52ch] text-body text-rail-muted">{liveDemo.subcopy}</p>

            <div className="mt-10 flex flex-wrap">
              <Button
                variant="pill"
                size="pill"
                nativeButton={false}
                render={<a href={liveDemo.cta.href} />}
              >
                {liveDemo.cta.label}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
