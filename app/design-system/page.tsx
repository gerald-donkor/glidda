import type { Metadata } from "next";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Glidda design system",
  robots: { index: false },
};

type SwatchProps = {
  token: string;
  fill: string;
  contrast?: string;
  note?: string;
};

function Swatch({ token, fill, contrast, note }: SwatchProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-20 w-full rounded-card hairline ${fill}`} />
      <p className="type-utility text-ink">{token}</p>
      {contrast ? <p className="text-small text-rail-muted">{contrast}</p> : null}
      {note ? <p className="text-small text-rail-muted">{note}</p> : null}
    </div>
  );
}

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
    <main className="content-shell section-rhythm flex flex-col gap-16">
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
          <Swatch token="--ink" fill="bg-ink" contrast="14.75:1 on ground" note="Text, rail, solid buttons" />
          <Swatch token="--ground" fill="bg-ground" note="Page background" />
          <Swatch token="--surface" fill="bg-surface" note="Panels, cards, inset blocks" />
          <Swatch token="--rail" fill="bg-rail" contrast="2.58:1 — never text" note="Hairlines, inactive rail" />
          <Swatch token="--signal" fill="bg-signal" contrast="1.32:1 — never text" note="Surface and rail accent only" />
          <Swatch token="--paper" fill="bg-paper" note="Inputs, chips, the Ask bar" />
        </div>
      </Group>

      <Group title="Route hues">
        <p className="text-body text-rail-muted max-w-prose">
          Feature panels only. Never on text, never on the rail, never two at once.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Swatch token="--route-signal" fill="bg-route-signal" note="Answers" />
          <Swatch token="--route-cable" fill="bg-route-cable" note="Demos" />
          <Swatch token="--route-spruce" fill="bg-route-spruce" note="Onboarding" />
        </div>
      </Group>

      <Group title="Derived">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Swatch
            token="--rail-muted"
            fill="bg-rail-muted"
            contrast="5.41:1 on ground"
            note="The only token permitted for muted body text"
          />
          <Swatch token="--rail-hairline" fill="bg-rail-hairline" note="Every hairline (rail at 40%)" />
          <Swatch token="--rail-subtle" fill="bg-rail-subtle" note="Secondary pill hover fill" />
        </div>
        <p className="text-body text-rail-muted max-w-prose">
          Muted body copy renders in <span className="text-ink">--rail-muted</span>, not raw
          --rail. This paragraph is the specimen.
        </p>
      </Group>

      <Group title="Type scale">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-hero · Archivo 600 · 44 → 84px</p>
            <p className="type-display text-hero">Ride the rail</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-headline · Archivo 600 · 30 → 52px</p>
            <p className="type-display text-headline">A guide that knows your product</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-panel · Archivo 600 · 22 → 28px</p>
            <p className="type-display text-panel">Runs demo sessions</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-quote · Archivo 600 · 22 → 34px</p>
            <p className="type-display text-quote max-w-prose">
              A pull-quote sits at this size, and it is set in the display face so it reads as a
              statement rather than as body copy.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-utility text-rail-muted">--text-body · Instrument Sans 400 · 16 → 17px</p>
            <p className="text-body max-w-prose">
              Body copy carries the argument. It stays in the body face at every size, and it never
              borrows the display face for emphasis.
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
            <p className="type-utility text-ink">--radius-chip · 4px</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-20 rounded-card hairline bg-surface" />
            <p className="type-utility text-ink">--radius-card · 12px</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-20 rounded-panel hairline bg-surface" />
            <p className="type-utility text-ink">--radius-panel · 20px</p>
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
    </main>
  );
}
