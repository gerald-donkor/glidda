import { RailStation } from "@/components/layout/rail-station"
import { Hero } from "@/components/sections/hero"
import { LogoBand } from "@/components/sections/logo-band"
import { ProofBand } from "@/components/sections/proof-band"

/**
 * Composition only (§9).
 *
 * The three `answers` / `demos` / `faq` sections below are still **stubs**. They exist so the Rail
 * has a page to span and the Ask bar has a page to scroll past; each is deleted outright as its
 * real section lands. Outstanding from §8: the live demo panel, the section intro, the three
 * capability sections, the Route, the generator and capability cards, the testimonial carousel,
 * the real FAQ, and the closing CTA.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <LogoBand />
      <ProofBand />

      {/* TODO(prompt 06+): replaced by the Answers capability section. */}
      <section id="answers" className="section-rhythm anchor-offset">
        <div className="rail-offset relative">
          <RailStation label="Answers" />
          <h2 className="text-headline">Answers, where the question was asked.</h2>
          <p className="mt-6 max-w-prose text-body text-rail-muted">
            A visitor asks about pricing, limits, or whether you integrate with the tool they
            already run. Glidda answers on the page they are standing on.
          </p>
        </div>
      </section>

      {/* TODO(prompt 06+): replaced by the Demos capability section. */}
      <section id="demos" className="section-rhythm anchor-offset">
        <div className="rail-offset relative">
          <RailStation label="Demos" />
          <h2 className="text-headline">A demo that runs your real interface.</h2>
          <p className="mt-6 max-w-prose text-body text-rail-muted">
            Glidda drives the product itself rather than playing a recording, so what a visitor
            sees is what they get when they sign up.
          </p>
        </div>
      </section>

      {/* TODO(prompt 07+): replaced by the real FAQ section. */}
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
