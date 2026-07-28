import { Answers } from "@/components/sections/answers"
import { BuildGuide } from "@/components/sections/build-guide"
import { ClosingCta } from "@/components/sections/closing-cta"
import { Demos } from "@/components/sections/demos"
import { Faq } from "@/components/sections/faq"
import { Hero } from "@/components/sections/hero"
import { LiveDemo } from "@/components/sections/live-demo"
import { LogoBand } from "@/components/sections/logo-band"
import { Onboarding } from "@/components/sections/onboarding"
import { ProofBand } from "@/components/sections/proof-band"
import { RouteSection } from "@/components/sections/route"
import { SectionIntro } from "@/components/sections/section-intro"
import { Testimonials } from "@/components/sections/testimonials"

/**
 * Composition only (§9).
 *
 * §8's structure is complete — every row from the announcement bar to the footer exists. What
 * remains is §15's open decisions, not sections: swapping the fixtures, the snippet host, the
 * post-submit Ask bar UI and its backend, and the Glidda mark.
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
      <BuildGuide />
      <Testimonials />
      <Faq />
      <ClosingCta />
    </>
  )
}
