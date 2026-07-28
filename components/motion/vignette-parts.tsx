import { ArrowUp, MousePointer2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * The pieces a capability panel's vignette is drawn from (§5.1, §8 row 8).
 *
 * Every part is monochrome — `--paper`, `--surface`, `--ink`, `--rail` and the four radii, and
 * nothing else. The route hue arrives entirely from the slipstream behind them (§6.1), so a part
 * dropped into any of the three panels reads correctly without a hue prop.
 *
 * The whole vignette is `aria-hidden` at its root (§12), so nothing here is a control, nothing
 * takes focus, and no part carries a fabricated string of its own — every string is passed in
 * from `lib/copy/placeholder/vignette.ts` (§11.1).
 *
 * `data-item` is the animation hook: `vignette.tsx` staggers the parts carrying it as their scene
 * arrives. It is on the outermost element of each part so nothing nested is tweened twice.
 */

/** A chat bubble. Visitor bubbles sit right on paper; the guide's sit left on surface. */
export function Bubble({ side, children }: { side: "visitor" | "agent"; children: string }) {
  return (
    <div
      data-item
      className={cn(
        "max-w-[82%] rounded-card px-3 py-2 text-small leading-snug",
        side === "visitor"
          ? "vignette-surface self-end text-ink"
          : "self-start bg-ink/90 text-paper",
      )}
    >
      {children}
    </div>
  )
}

/** A small label chip. `dot` marks it as a status line — the square node, not a spinner: a
 *  spinning glyph would be a new ambient loop, and §7.3's set is fixed. */
export function Chip({
  children,
  dot = false,
  solid = false,
  className,
}: {
  children: string
  dot?: boolean
  solid?: boolean
  className?: string
}) {
  return (
    <div
      data-item
      className={cn(
        "type-utility inline-flex w-fit items-center gap-2 rounded-chip px-2.5 py-1.5",
        solid ? "bg-ink text-paper" : "vignette-surface text-rail-muted",
        className,
      )}
    >
      {dot ? <span className="node-square shrink-0" /> : null}
      {children}
    </div>
  )
}

/** The decorative ask field (decision 7). A `<div>`, never an `<input>` and never a disabled
 *  control: §8.1 makes the Ask bar the page's one input, and a second live field competing with
 *  it is a conversion problem, not a stylistic one. */
export function Field({ placeholder }: { placeholder: string }) {
  return (
    <div
      data-item
      className="vignette-surface flex items-center gap-3 rounded-pill py-1.5 pr-1.5 pl-4"
    >
      <span className="flex-1 truncate text-small text-rail-muted">{placeholder}</span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink">
        <ArrowUp className="size-3.5 text-paper" />
      </span>
    </div>
  )
}

/** The pointer the guide moves with, over the wireframe. Static — the scene's own entrance is
 *  what makes it read as arriving. */
export function Cursor({ className }: { className?: string }) {
  return (
    <span data-item className={cn("absolute", className)}>
      <MousePointer2 className="size-5 fill-ink text-ink" />
    </span>
  )
}

/** One empty card in the wireframe grid. `active` is the card the guide is pointing at. */
export function WireCard({ active = false }: { active?: boolean }) {
  return (
    <span
      className={cn(
        "block rounded-chip bg-paper",
        // A hairline ring, not a paler fill: white-on-wash alone leaves the grid invisible at
        // 360px, where the panel is at its smallest.
        active ? "ring-1 ring-ink" : "ring-1 ring-rail",
      )}
    />
  )
}
