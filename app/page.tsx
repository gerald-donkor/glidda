import { RailStation } from "@/components/layout/rail-station"
import { Answers } from "@/components/sections/answers"
import { Demos } from "@/components/sections/demos"
import { Hero } from "@/components/sections/hero"
import { LiveDemo } from "@/components/sections/live-demo"
import { LogoBand } from "@/components/sections/logo-band"
import { Onboarding } from "@/components/sections/onboarding"
import { ProofBand } from "@/components/sections/proof-band"
import { RouteSection } from "@/components/sections/route"
import { SectionIntro } from "@/components/sections/section-intro"

/**
 * Composition only (§9).
 *
 * The `faq` section below is still a **stub**. It exists so the Rail has a page to span and the
 * Ask bar has a page to scroll past, and it is deleted outright when its real section lands.
 * Outstanding from §8: the generator and capability cards, the testimonial carousel,
 * the real FAQ, and the closing CTA.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <LogoBand />
      <ProofBand />
      <LiveDemo />
      <SectionIntro />

      <Answers />
      <Demos />
      <Onboarding />
      <RouteSection />

      {/* TODO(prompt 11+): replaced by the real FAQ section. */}
      <section id="faq" className="section-rhythm anchor-offset">
        <div className="rail-offset relative">
          <RailStation label="FAQ" />
          <h2 className="text-headline">Questions people ask before they start.</h2>
          <p className="mt-6 max-w-prose text-body text-rail-muted">
            Setup, languages, what Glidda reads, and what happens to the conversations it has.
          </p>
        </div>
      </section>
    </>
  )
}
