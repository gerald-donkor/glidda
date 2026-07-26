import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/layout/wordmark"
import { headerCta, nav, shell } from "@/lib/copy/shell"
import { cn, focusRing } from "@/lib/utils"

/**
 * The header is deliberately not sticky (§8) — the Rail carries continuity down the page instead.
 * Nav is three in-page anchors; below `md` only the wordmark and the pill remain.
 */
export function SiteHeader() {
  return (
    <header className="hairline-b">
      <div className="content-shell flex h-20 items-center justify-between gap-4">
        <Wordmark />

        <div className="flex items-center gap-2">
          <nav aria-label={shell.navLabel} className="hidden items-center gap-1 md:flex">
            {nav.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-pill px-3 py-2 text-small text-ink transition-colors duration-(--duration-micro) ease-(--ease-entrance) hover:bg-surface",
                  focusRing
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Button
            variant="pill"
            size="pill"
            nativeButton={false}
            render={<a href={headerCta.href} />}
          >
            {headerCta.label}
          </Button>
        </div>
      </div>
    </header>
  )
}
