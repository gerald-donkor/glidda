import { WireCard } from "@/components/motion/vignette-parts"
import { CopyEmbed } from "@/components/sections/copy-embed"
import { route } from "@/lib/copy/route"

/**
 * The Route section's panel (§8, row 9): a pale panel holding a schematic of an app with the
 * embed card floating over it.
 *
 * It is markup, not a screenshot. §5.3 forbids carrying handhold.io's artwork across and no
 * Glidda product exists to capture, so there is no image, no `next/image`, and nothing dressed up
 * as a real interface. It must stay visibly a wireframe — no fake data, no fake chart, no
 * invented company name — which is also why §11.1 does not bite here: there is nothing fabricated
 * to flag, only shapes.
 *
 * The depth is a hairline and a fill difference, never a shadow: §6.3 allows exactly one shadow
 * on the page and the Ask bar has it. Below `lg` the card stacks under the wireframe instead of
 * overlapping it — at 360px an overlapping card covers the thing it is meant to sit on.
 */
export function EmbedPanel() {
  return (
    <div className="relative rounded-panel bg-surface p-5 sm:p-8 lg:p-10">
      <div
        aria-hidden
        className="flex aspect-video w-full overflow-hidden rounded-card hairline bg-paper"
      >
        {/* The sidebar. Its top block is where the Glidda mark goes once one exists (§15);
            until then it is a block like the rest. */}
        <div className="flex w-[18%] shrink-0 flex-col gap-2 bg-ink p-2 sm:p-3">
          <span className="h-2.5 w-2.5 rounded-chip bg-paper/70" />
          <span className="mt-2 h-1.5 w-full rounded-chip bg-paper/25" />
          <span className="h-1.5 w-3/4 rounded-chip bg-paper/25" />
          <span className="h-1.5 w-5/6 rounded-chip bg-paper/25" />
        </div>

        <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-2 p-2 sm:gap-3 sm:p-3">
          <WireCard />
          <WireCard />
          <WireCard />
          <WireCard />
          <WireCard />
          <WireCard />
        </div>
      </div>

      {/* Not `aria-hidden` — unlike the wireframe, the snippet in here is real information. */}
      <div className="mt-5 rounded-card hairline bg-paper p-4 sm:p-5 lg:absolute lg:bottom-8 lg:left-8 lg:mt-0 lg:w-4/5 lg:max-w-[380px]">
        <p className="type-utility text-rail-muted">{route.snippetLabel}</p>
        <CopyEmbed />
      </div>
    </div>
  )
}
