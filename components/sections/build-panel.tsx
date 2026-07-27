import { InterchangeMark } from "@/components/layout/interchange-mark"
import { Button } from "@/components/ui/button"
import { buildGuide } from "@/lib/copy/build-guide"

/**
 * The left panel of §8 row 10 — the section's argument, its mark, and its CTA.
 *
 * **There is no input here, by decision.** §5.1 and §8's mapping table both describe a field beside
 * the pill, but there is no backend (§15), so a field would accept typing and then fail — worse
 * than a missing field, because it costs the reader an action first. §8.1 also makes the Ask bar
 * the page's one live input; a second field a few hundred pixels above it splits the page's
 * conversion device in two. `vignette-parts.tsx`'s `Field` settles the same tension one level down.
 * So the panel ends in the pill that every other primary CTA on this page ends in.
 *
 * Left-aligned, not centred like the reference's equivalent — `live-demo.tsx` made and documented
 * that call already: this page has one strong left edge and a centred block beside it reads as a
 * mistake rather than as emphasis.
 *
 * Depth is fill and radius, never a shadow (§6.3).
 */
export function BuildPanel() {
  return (
    <div className="rounded-panel bg-surface p-5 sm:p-8 lg:p-10">
      {/* A label, not a heading — promoting it would put an h3 above its own h2. */}
      <p className="type-utility text-rail-muted">{buildGuide.eyebrow}</p>

      <h2 className="mt-6 max-w-[20ch] text-headline">{buildGuide.headline}</h2>

      <p className="mt-6 max-w-[46ch] text-body text-rail-muted">{buildGuide.subcopy}</p>

      {/* The mark's air is the reason this block is worth being a panel. */}
      <InterchangeMark className="my-[clamp(40px,6vw,64px)] h-auto w-full max-w-[420px]" />

      <div className="flex flex-col gap-1">
        {buildGuide.finePrint.map((line) => (
          <p key={line} className="max-w-[46ch] text-small text-rail-muted">
            {line}
          </p>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap">
        <Button
          variant="pill"
          size="pill"
          nativeButton={false}
          render={<a href={buildGuide.cta.href} />}
        >
          {buildGuide.cta.label}
        </Button>
      </div>
    </div>
  )
}
