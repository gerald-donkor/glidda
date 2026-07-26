import { RailStation } from "@/components/layout/rail-station"
import { Hero } from "@/components/sections/hero"

/**
 * Composition only (§9).
 *
 * The three sections below the hero are **stubs**. They exist so the Rail has a page to span and
 * the Ask bar has a page to scroll past; each is deleted outright as its real section lands. The
 * remaining sections of §8 arrive in prompts 06 and up.
 */
export default function Home() {
  return (
    <>
      <Hero />

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
