"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { Minus, Plus } from "lucide-react"

import type { FaqRow } from "@/lib/copy/faq"
import { cn, focusRing } from "@/lib/utils"

/**
 * The FAQ's six rows (§5.1 row 12, §8 row 12).
 *
 * It composes `Accordion.Root / Item / Header / Trigger / Panel` from Base UI directly rather than
 * the wrapper in `components/ui/accordion.tsx`, which is left untouched. That wrapper's content
 * part animates height — `h-(--accordion-panel-height)` with `animate-accordion-down` — and §7.1
 * forbids animating `height` outright. Composing the primitive keeps the real `aria-expanded`,
 * the trigger/panel association, and Base UI's own keyboard behaviour, and drops only the
 * keyframes.
 *
 * Opening a row therefore changes the layout instantly and pushes the rows below it down, which is
 * what §5.1 describes. There is no fade on the panel either: a fade-in inside a slot that has just
 * reflowed draws the eye to the reflow. `keepMounted` is left at its default of `false`, so a
 * closed panel is not in the DOM and the height variable is never engaged.
 *
 * `multiple` defaults to `false` in Base UI, so it is set explicitly — §5.1 requires more than one
 * row open at once. All six start closed: the questions *are* the content here, and opening one by
 * default buries the sixth below a fold of answer text nobody asked for. That is a deliberate
 * departure from `capability-accordion.tsx`, which always keeps exactly one row open because its
 * column would otherwise show an empty slot.
 *
 * The whole row is one control. §5.2 observed that clicking either the question or the circle
 * toggles the row, so the circle is a decorative `<span>` inside the single trigger — never a
 * button inside a button, which is invalid markup and gives a keyboard user two stops for one
 * action. Its `+`/`−` state is read from the trigger's own `aria-expanded`.
 *
 * Nothing here is animated in JavaScript: no GSAP, no ScrollTrigger, no `gsap.matchMedia()`. The
 * only motion is two colour transitions at `--duration-micro`, so §7.2 is satisfied by
 * construction rather than by a fallback branch.
 */
export function FaqAccordion({ rows }: { rows: readonly FaqRow[] }) {
  return (
    <AccordionPrimitive.Root multiple defaultValue={[]} className="flex flex-col">
      {rows.map((row) => (
        <AccordionPrimitive.Item key={row.id} value={row.id} className="not-last:hairline-b">
          {/* Base UI's Header renders an `<h3>` natively, which is the order this page needs:
              h1 hero → h2 section → h3 question (§12). No `render` override required. */}
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger
              className={cn(
                "group/faq-row flex w-full items-start justify-between gap-6 rounded-chip py-6 text-left lg:py-8",
                focusRing
              )}
            >
              <span className="type-display max-w-[26ch] text-headline text-rail-muted transition-colors duration-(--duration-micro) ease-(--ease-entrance) group-hover/faq-row:text-ink group-aria-expanded/faq-row:text-ink">
                {row.question}
              </span>

              {/* Decorative: `aria-expanded` on the trigger already carries the open state, and a
                  screen reader announcing "plus" adds nothing. */}
              <span
                aria-hidden
                className="hairline flex size-10 shrink-0 items-center justify-center rounded-pill bg-paper text-ink transition-colors duration-(--duration-micro) ease-(--ease-entrance) group-hover/faq-row:bg-surface group-aria-expanded/faq-row:border-ink group-aria-expanded/faq-row:bg-ink group-aria-expanded/faq-row:text-paper"
              >
                <Plus className="size-4 group-aria-expanded/faq-row:hidden" />
                <Minus className="hidden size-4 group-aria-expanded/faq-row:block" />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>

          <AccordionPrimitive.Panel className="max-w-[62ch] pb-8 text-body text-rail-muted">
            {row.answer}
          </AccordionPrimitive.Panel>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  )
}
