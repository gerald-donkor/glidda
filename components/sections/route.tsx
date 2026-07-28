import { RailStation } from "@/components/layout/rail-station"
import { EmbedPanel } from "@/components/sections/embed-panel"
import { Button } from "@/components/ui/button"
import { route } from "@/lib/copy/route"

/**
 * The Route section (§8, row 9) — the setup sequence, and the one place on the page where
 * numbering is allowed (§6.4), because it encodes a real ordered sequence.
 *
 * The steps are stations on the page's own rail rather than free-floating numbers: each carries a
 * node on the line, so the rail's existing scroll paint travels through all three as the reader
 * passes them. That is why this section creates no motion of its own — the only scroll-linked
 * thing here is §7.3's second moment doing its job across new markers, not a fourth moment.
 *
 * A server component. The only client boundary in the section is `CopyEmbed`, three levels down.
 *
 * No hue anywhere: this row is outside every feature panel, so §6.1 is absolute here.
 */
export function RouteSection() {
  return (
    <section id="route" className="section-rhythm anchor-offset">
      <div className="rail-offset relative">
        <RailStation label={route.station} />

        {/* Both children carry `min-w-0`. A grid item's automatic minimum is its min-content
            width, so one unbreakable token anywhere inside — the embed snippet is exactly that —
            sizes the track wider than the viewport and scrolls the whole page (§12). */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            {/* A label, not a heading — promoting it would put an h3 above its own h2. */}
            <p className="type-utility text-rail-muted">{route.eyebrow}</p>

            <h2 className="mt-6 max-w-[18ch] text-headline">{route.headline}</h2>

            {/* An `<ol>` because it is an ordered sequence and that is what the element means.
                The numerals are authored, and `aria-hidden` so the list is not counted twice. */}
            <ol className="mt-12 list-none lg:mt-16">
              {route.steps.map((step, index) => (
                <li
                  key={step.numeral}
                  className={
                    index === route.steps.length - 1
                      ? "py-[clamp(28px,3vw,40px)]"
                      : "hairline-b py-[clamp(28px,3vw,40px)]"
                  }
                >
                  {/* `relative` so the node aligns to this element's cap height, not the row's
                      box — see the `rail-node` utility. */}
                  <p aria-hidden className="type-display relative text-headline leading-none">
                    <span className="node-square rail-node" />
                    {step.numeral}
                  </p>

                  {/* `font-body` is not decoration: `@layer base` sets the Display face on every
                      h1–h4, and §6.2 forbids that face below --text-panel. */}
                  <h3 className="mt-5 font-body text-body font-medium tracking-normal">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-[46ch] text-body text-rail-muted">{step.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-12 flex flex-wrap">
              <Button
                variant="pill"
                size="pill"
                nativeButton={false}
                render={<a href={route.cta.href} />}
              >
                {route.cta.label}
              </Button>
            </div>

            <p className="mt-4 max-w-[46ch] text-small text-rail-muted">{route.reassurance}</p>
          </div>

          {/* DOM order is text then panel at every width; the panel never reorders. */}
          <EmbedPanel />
        </div>
      </div>
    </section>
  )
}
