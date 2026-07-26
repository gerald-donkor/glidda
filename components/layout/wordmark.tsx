import { shell } from "@/lib/copy/shell"
import { cn, focusRing } from "@/lib/utils"

/**
 * Text-only wordmark (§15 — no logo exists yet). The leading square is the same node shape the
 * rail's station markers use, so the mark and the rail read as one idea.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <a
      href="/"
      aria-label={shell.wordmarkLabel}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-chip text-ink",
        focusRing,
        className
      )}
    >
      <span aria-hidden className="node-square" />
      <span className="type-display text-panel leading-none">{shell.wordmark}</span>
    </a>
  )
}
