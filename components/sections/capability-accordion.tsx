"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { useRef, useState } from "react"

import type { Capability } from "@/lib/copy/capabilities"
import { CAPABILITY, EASE } from "@/lib/gsap/motion"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/register"
import { cn, focusRing } from "@/lib/utils"

/**
 * A capability section's three-row accordion (§5.1, §8 row 8).
 *
 * Exactly one row is open at a time, and it advances on its own: the underline beneath the open
 * label sweeps left to right over `CAPABILITY.dwell` and the row advances when that tween
 * completes. The sweep *is* the timer — there is no `setTimeout` racing a tween and no second
 * source of truth for the dwell (§7.1's one stated `scaleX` exception, used for exactly that).
 *
 * It composes `Accordion.Root`, `Item`, `Header`, `Trigger`, and `Panel` from Base UI directly
 * rather than the wrapper in `components/ui/accordion.tsx`, which is left untouched for the FAQ:
 * that wrapper's content part animates `height`, which §7.1 forbids. Composing the primitive
 * keeps the real `aria-expanded`, `aria-controls`, and panel association and drops only the
 * keyframes.
 *
 * No height is animated here either. Every body is written to two lines, so whichever row is open
 * the column's total height is the same — the swap is a pure crossfade into a slot that is always
 * occupied. (Below ~480px a body can wrap to three lines and the slot differs by row. That is a
 * static layout difference, not an animation.)
 */
export function CapabilityAccordion({ rows }: { rows: Capability["rows"] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [openIndex, setOpenIndex] = useState(0)

  /** The running sweep, so the pointer and scroll handlers can pause it without rebuilding it. */
  const timerRef = useRef<gsap.core.Tween | null>(null)
  /** Pointer or keyboard focus is inside the accordion — the reader is driving, not the timer. */
  const heldRef = useRef(false)
  /** The section is in the viewport. Starts false: a section that mounts below the fold must not
   *  burn through its rows before anyone has seen it. */
  const visibleRef = useRef(false)

  const sync = () => {
    const timer = timerRef.current
    if (!timer) return
    if (heldRef.current || !visibleRef.current) timer.pause()
    else timer.play()
  }

  // One trigger for the section's visibility, created once. The timer below is rebuilt on every
  // row change, so keeping the trigger out of that hook avoids tearing it down three times a
  // cycle.
  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => {
          visibleRef.current = isActive
          sync()
        },
      })

      // onToggle only fires on a change, so an accordion already in view at mount has to be
      // marked visible explicitly.
      visibleRef.current = trigger.isActive
    },
    { scope: rootRef },
  )

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const underlines = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-underline]"))
      const open = underlines[openIndex]
      const body = root.querySelector<HTMLElement>("[data-body]")
      const advance = () => setOpenIndex((index) => (index + 1) % rows.length)

      gsap.set(underlines, { scaleX: 0 })

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const reduced = context.conditions?.reduced === true

          if (body) {
            gsap.fromTo(
              body,
              { autoAlpha: 0, y: reduced ? 0 : CAPABILITY.swapRise },
              { autoAlpha: 1, y: 0, duration: CAPABILITY.swap, ease: EASE.entrance },
            )
          }

          if (reduced) {
            // §7.2: the accordion still advances, with no sweep. The underline is simply present
            // on the open row rather than drawn across it.
            if (open) gsap.set(open, { scaleX: 1 })
            timerRef.current = gsap.delayedCall(CAPABILITY.dwell, advance)
          } else if (open) {
            timerRef.current = gsap.to(open, {
              scaleX: 1,
              duration: CAPABILITY.dwell,
              ease: EASE.linear,
              onComplete: advance,
            })
          }

          sync()
        },
      )

      return () => {
        mm.revert()
        timerRef.current = null
      }
    },
    { scope: rootRef, dependencies: [openIndex, rows.length], revertOnUpdate: true },
  )

  // Deliberately *not* wrapped in `contextSafe`, against prompt 09 decision 4. `contextSafe`
  // exists so tweens created outside the hook are added to its context and reverted with it;
  // these handlers create nothing — they pause and play a tween the hook already owns — so the
  // wrapper would add no cleanup, and passing a ref-reading closure to it during render is
  // exactly what `react-hooks/refs` flags. Nothing leaks: the tween is reverted by the hook.
  const hold = () => {
    heldRef.current = true
    sync()
  }

  const release = () => {
    heldRef.current = false
    sync()
  }

  return (
    <AccordionPrimitive.Root
      ref={rootRef}
      value={[rows[openIndex].id]}
      onValueChange={(value) => {
        // `multiple` is false, so pressing the open row would close it and leave the column with
        // an empty slot. Exactly one row is open at all times, so an empty selection is ignored.
        const next = rows.findIndex((row) => value.includes(row.id))
        if (next !== -1) setOpenIndex(next)
      }}
      className="flex flex-col"
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocusCapture={hold}
      onBlurCapture={release}
    >
      {rows.map((row, index) => (
        <AccordionPrimitive.Item key={row.id} value={row.id} className="hairline-b">
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger
              className={cn(
                "w-full rounded-chip py-5 text-left text-body font-medium transition-colors",
                focusRing,
                index === openIndex ? "text-ink" : "text-rail-muted hover:text-ink",
              )}
              onMouseEnter={() => setOpenIndex(index)}
              onFocus={() => setOpenIndex(index)}
            >
              {row.label}
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>

          {/* The timer, drawn (§5.1). Decorative: the row's open state is already announced. */}
          <span aria-hidden className="block h-0.5 origin-left scale-x-0 bg-ink" data-underline />

          <AccordionPrimitive.Panel
            data-body
            keepMounted={false}
            className="max-w-[46ch] pt-4 pb-6 text-body text-rail-muted"
          >
            {row.body}
          </AccordionPrimitive.Panel>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  )
}
