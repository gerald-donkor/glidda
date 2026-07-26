import { RailStation } from "@/components/layout/rail-station"

/**
 * Composition only (§9).
 *
 * The three sections below are **stubs**. They exist so the Rail has a page to span and the Ask
 * bar has a page to scroll past; each is deleted outright as its real section lands. The real
 * fourteen sections of §8 arrive in prompts 04 and up.
 */
export default function Home() {
  return (
    <>
      {/* TODO(prompt 04): replaced by the real hero, which owns the page's one h1. */}
      <section className="section-rhythm anchor-offset">
        <div className="rail-offset relative">
          <RailStation label="Start" />
          <h1 className="text-hero">A guide that walks people through your product.</h1>
          <p className="mt-6 max-w-prose text-body text-rail-muted">
            Glidda answers questions in-page, runs a live demo of your real interface, and
            gets new users to their first result — in any language, at any hour.
          </p>
        </div>
      </section>

      {/* TODO(prompt 05+): replaced by the Answers capability section. */}
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

      {/* TODO(prompt 05+): replaced by the Demos capability section. */}
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

      {/* TODO(prompt 06+): replaced by the real FAQ section. */}
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
