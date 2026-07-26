import { proofCopy } from "@/lib/copy/proof"
import { cn } from "@/lib/utils"

/**
 * The visible marker that sits beside any fabricated proof block (§11.1). One chip per block —
 * not one per stat — so it reads as a warning rather than as decoration.
 *
 * On by default. The comparison is written against the exact string `"false"` rather than as an
 * inverted guard, so an unset, empty, or misspelled variable falls through to **visible**, which
 * is the policy's stated default. Turning the markers off is a deliberate act, and it does not
 * make the content real.
 *
 * Not `aria-hidden`: a screen-reader user is exactly who should not be misled by an unmarked
 * fabricated statistic.
 */
export function PlaceholderChip({ className }: { className?: string }) {
  if (process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS === "false") return null

  return (
    <span
      className={cn(
        "hairline type-utility inline-block rounded-chip bg-surface px-2 py-1 text-rail-muted",
        className,
      )}
    >
      {proofCopy.placeholderChip}
    </span>
  )
}
