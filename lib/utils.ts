import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * Glidda's type scale (§6.2) lives in Tailwind's `--text-*` namespace, so `text-body` and
 * `text-hero` are font sizes. tailwind-merge cannot tell those from `text-ink` — it has no view
 * of the theme — and classifies any unrecognised `text-<word>` as a colour. Left unextended it
 * silently drops the colour when both land on one element: `cn("text-paper", "text-body")`
 * returns `text-body` alone, and the element falls back to inherited colour. That is how the
 * solid ink pill lost its white label. Registering the scale as font sizes fixes every such
 * pairing at once; add any new `--text-*` token here.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["hero", "headline", "panel", "quote", "body", "small", "eyebrow"] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Graphite focus ring on a ground-coloured offset. Never removed, only replaced (§12). */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ground"

export const disabledState =
  "disabled:pointer-events-none disabled:opacity-50"
