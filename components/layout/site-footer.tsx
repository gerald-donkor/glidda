import { footer, shell } from "@/lib/copy/shell"
import { cn, focusRing } from "@/lib/utils"

/**
 * Two-column footer (§5.1 #14): a two-paragraph disclaimer taking roughly 60% of the width, and
 * two link columns. No social icons, no newsletter, no bottom bar. The bottom padding reserves
 * the fixed Ask bar's height so it never covers the last line at any width.
 */
export function SiteFooter() {
  return (
    <footer className="hairline-t">
      <div className="content-shell ask-bar-reserve flex flex-col gap-12 pt-rhythm lg:flex-row lg:justify-between lg:gap-16">
        <div className="flex flex-col gap-4 text-small text-rail-muted lg:basis-3/5">
          {footer.disclaimer.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <nav
          aria-label={shell.footerNavLabel}
          className="grid grid-cols-2 gap-8 sm:gap-16 lg:shrink-0"
        >
          {footer.columns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-4">
              <h2 className="type-utility text-rail-muted">{column.heading}</h2>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={cn(
                        "rounded-chip text-small text-ink transition-colors duration-(--duration-micro) ease-(--ease-entrance) hover:text-rail-muted",
                        focusRing
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  )
}
