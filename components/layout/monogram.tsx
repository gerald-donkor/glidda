import { cn } from "@/lib/utils"

/**
 * A monogram avatar: two initials on `--surface` in the Utility face.
 *
 * §11.1 allows no photograph of a person anywhere on this page — never a stock face, never a
 * generated one — so every attribution on the site uses this instead.
 *
 * Extracted from `proof-band.tsx` when the testimonial carousel became the second consumer. The
 * radius moved from `rounded-full` to `rounded-pill` on the way: the two render identically, but
 * §6.3 permits exactly four radii and `rounded-pill` is the one this is.
 */
export function Monogram({ initials, className }: { initials: string; className?: string }) {
  return (
    /* The name follows in text, so announcing the initials would be noise. */
    <span
      aria-hidden
      className={cn(
        "type-utility flex size-10 shrink-0 items-center justify-center rounded-pill bg-surface text-rail-muted",
        className
      )}
    >
      {initials}
    </span>
  )
}
