import type { Metadata } from "next";

import { Button } from "@/components/ui/button";

import { Swatch } from "./swatch";
import { WashSwatch } from "./wash-swatch";

export const metadata: Metadata = {
  title: "Glidda design system",
  robots: { index: false },
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-panel">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    // A plain div, not <main>: the root layout already provides the page's one <main>.
    <div className="content-shell section-rhythm flex flex-col gap-16">
      <header className="flex flex-col gap-4">
        <p className="type-utility text-rail-muted">Glidda · primitives</p>
        <h1 className="text-hero">Design system</h1>
        <p className="text-body text-rail-muted max-w-prose">
          Every token in AGENTS.md §6, rendered live. This route is a review surface, not part of
          the product — delete it once the sections are built.
        </p>
      </header>

      <Group title="Core colour">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          <Swatch token="--ink" fill="bg-ink" contrast="18.88:1 on ground" note="Text, the travelled rail, solid buttons" />
          <Swatch token="--ground" fill="bg-ground" note="The page. White." />
          <Swatch token="--surface" fill="bg-surface" note="Panels, cards, announce bar, inset blocks" />
          <Swatch token="--rail" fill="bg-rail" contrast="1.26:1 — never text" note="Hairlines, the untravelled rail" />
          <Swatch token="--signal" fill="bg-signal" contrast="1.58:1 — never text" note="The Answers wash. Not a page accent." />
          <Swatch token="--paper" fill="bg-paper" note="Inputs, chips, the Ask bar — white on a tinted panel" />
        </div>
        <p className="text-body text-rail-muted max-w-prose">
          The page chrome is monochrome. No button, link, rule, or focus ring carries a hue —
          colour appears only inside a feature panel, as one of the three washes below.
        </p>
      </Group>

      <Group title="Route hues and washes">
        <p className="text-body text-rail-muted max-w-prose">
          Feature panels only. Never on text, never on the rail, never two at once. The hue is the
          source; the wash is what actually gets painted.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Swatch token="--route-signal" fill="bg-route-signal" note="Answers" />
          <Swatch token="--route-cable" fill="bg-route-cable" contrast="4.78:1 — panels only" note="Demos" />
          <Swatch token="--route-spruce" fill="bg-route-spruce" contrast="5.68:1 — panels only" note="Onboarding" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <WashSwatch token="--wash-signal" fill="bg-wash-signal" />
          <WashSwatch token="--wash-cable" fill="bg-wash-cable" />
          <WashSwatch token="--wash-spruce" fill="bg-wash-spruce" />
        </div>
      </Group>

      <Group title="Derived">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Swatch
            token="--rail-muted"
            fill="bg-rail-muted"
            contrast="6.13:1 on ground · 5.4:1 on surface"
            note="The only token permitted for muted body text"
          />
          <Swatch token="--rail-hairline" fill="bg-rail-hairline" note="Every hairline. The tone is the hairline — no mix." />
          <Swatch
            token="--rail-subtle"
            fill="bg-rail-subtle"
            note="Secondary pill hover fill — surface stepped toward ink, so hover darkens"
          />
        </div>
        <p className="text-body text-rail-muted max-w-prose">
          Muted body copy renders in <span className="text-ink">--rail-muted</span>, not raw
          --rail. This paragraph is the specimen.
        </p>
      </Group>

      <Group title="Type scale">
        <p className="text-body text-rail-muted max-w-prose">
          Two display steps, not four. --text-headline carries section headlines, feature
          headlines, FAQ questions, and card headings alike; the gap between it and 15–16px body
          copy is what carries hierarchy, without weight or colour doing any work.
        </p>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-hero · Newsreader 300 · 40 → 76px</p>
            <p className="type-display text-hero">Ride the rail</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-headline · Newsreader 300 · 26 → 40px</p>
            <p className="type-display text-headline">A guide that knows your product</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-headline · the same step, as a FAQ question</p>
            <p className="type-display text-headline">How long does a guide take to set up?</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-panel · Newsreader 300 · 20 → 26px</p>
            <p className="type-display text-panel">Runs demo sessions</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-quote · Newsreader 300 · 22 → 36px</p>
            <p className="type-display text-quote max-w-prose">
              A pull-quote sits at this size, and it is set in the display face so it reads as a
              statement rather than as body copy.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-body · Instrument Sans 400 · 15 → 16px</p>
            <p className="text-body max-w-prose">
              Body copy carries the argument. It stays in the body face at every size, and it never
              borrows the display face for emphasis — a 300-weight serif at 15px is a legibility
              risk, so Newsreader is permitted at --text-panel and above only.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-small · Instrument Sans 400 · 14px</p>
            <p className="text-small text-rail-muted">Small print, captions, and reassurance lines.</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-eyebrow · Martian Mono 500 · 11px</p>
            <p className="type-utility text-ink">Inbound answers</p>
          </div>
        </div>
      </Group>

      <Group title="Shape">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <div className="h-20 rounded-chip hairline bg-surface" />
            <p className="type-utility text-ink">--radius-chip · 6px</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-20 rounded-card hairline bg-surface" />
            <p className="type-utility text-ink">--radius-card · 14px</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-20 rounded-panel hairline bg-surface" />
            <p className="type-utility text-ink">--radius-panel · 24px</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-20 rounded-pill hairline bg-surface" />
            <p className="type-utility text-ink">--radius-pill · 999px</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="hairline-t pt-4">
            <p className="type-utility text-ink">--rail-hairline · 1px top edge</p>
          </div>
          <div className="rounded-panel bg-paper p-8 shadow-ask">
            <p className="type-utility text-ink">--shadow-ask</p>
            <p className="text-small text-rail-muted">
              The only shadow in the system. The Ask bar, and nothing else.
            </p>
          </div>
        </div>
      </Group>

      <Group title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="pill" size="pill">
            Start a guide
          </Button>
          <Button variant="pillSecondary" size="pill">
            See it run
          </Button>
          <Button variant="pill" size="pill" disabled>
            Disabled
          </Button>
          <Button variant="pillSecondary" size="pill" disabled>
            Disabled
          </Button>
        </div>
        <p className="text-body text-rail-muted max-w-prose">
          Hover shifts colour over --duration-micro; nothing moves or resizes. Tab to each button
          for the graphite focus ring on a ground offset.
        </p>
      </Group>
    </div>
  );
}
