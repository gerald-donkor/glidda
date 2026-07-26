import { ArrowRight } from "lucide-react"

import { HeroEntrance } from "@/components/sections/hero-entrance"
import { RailStation } from "@/components/layout/rail-station"
import { Slipstream } from "@/components/motion/slipstream"
import { Button } from "@/components/ui/button"
import { hero } from "@/lib/copy/hero"

/**
 * The hero (§8, row 3). A server component: only `HeroEntrance` is a client boundary, and the
 * markup below reaches it through `children`, so none of this copy joins the client bundle.
 *
 * Everything is left-aligned against the Rail — the headline hangs off the line rather than
 * centring, which is the deliberate divergence from the reference recorded in §8's mapping table.
 * The slipstream band is full-bleed and sits below the CTA row; it carries `mono-signal`, the one
 * place a route hue appears outside a feature panel (§6.1).
 */
export function Hero() {
  return (
    <section id="hero" className="section-rhythm anchor-offset">
      <HeroEntrance>
        <div className="rail-offset relative">
          <RailStation label="Start" />

          {/* Exactly one h1 on the page (§12). The two staged lines are spans inside it, so the
              accessible name is the full sentence. */}
          <h1 className="text-hero">
            {hero.headline.map((line) => (
              <span key={line} data-hero="line" className="block">
                {line}
              </span>
            ))}
          </h1>

          <p data-hero="sub" className="mt-6 max-w-[52ch] text-body text-rail-muted">
            {hero.subcopy}
          </p>

          {/* Wraps below 400px so two pills never force horizontal scroll (§12). */}
          <div data-hero="ctas" className="mt-10 flex flex-wrap gap-3">
            <Button
              variant="pill"
              size="pill"
              nativeButton={false}
              render={<a href={hero.ctas.primary.href} />}
              className="group"
            >
              {hero.ctas.primary.label}
              {/* The announcement bar's idiom, verbatim — the repo has one hover arrow, not two. */}
              <ArrowRight
                aria-hidden
                className="size-3.5 -translate-x-1 opacity-0 transition-all duration-(--duration-micro) ease-(--ease-entrance) group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
              />
            </Button>

            <Button
              variant="pillSecondary"
              size="pill"
              nativeButton={false}
              render={<a href={hero.ctas.secondary.href} />}
            >
              {hero.ctas.secondary.label}
            </Button>
          </div>
        </div>

        {/* Decorative (§12). `Slipstream` is absolute, so this box supplies the positioning and
            the clip it needs. */}
        <div data-hero="band" className="hero-band relative overflow-hidden">
          <Slipstream route="mono-signal" density="band" />
        </div>
      </HeroEntrance>
    </section>
  )
}
