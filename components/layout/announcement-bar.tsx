import { ArrowRight } from "lucide-react"

import { announcement } from "@/lib/copy/shell"
import { cn, focusRing } from "@/lib/utils"

/**
 * Full-bleed announcement bar (§5.1). The whole bar is one link; the trailing arrow slides in on
 * hover and focus and the text never moves. CSS transition, not GSAP — it is a 200ms hover (§7.3).
 */
export function AnnouncementBar() {
  return (
    <div className="hairline-b bg-surface">
      <a
        href={announcement.href}
        className={cn(
          // `min-h`, not `h`: at 360px the line wraps to two rows and a fixed 40px would clip it.
          "group flex min-h-10 w-full items-center justify-center gap-1.5 px-gutter py-2 text-center text-small text-rail-muted",
          focusRing
        )}
      >
        <span>{announcement.text}</span>
        <ArrowRight
          aria-hidden
          className="size-3.5 -translate-x-1 opacity-0 transition-all duration-(--duration-micro) ease-(--ease-entrance) group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        />
      </a>
    </div>
  )
}
