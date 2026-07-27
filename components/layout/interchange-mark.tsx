/**
 * The interchange (§8 row 10, §6).
 *
 * The reference fills this slot with three overlapping grainy circles in coral, amber, and green.
 * §5.3 names that artwork in the "leave" list and §6 rejects soft organic blobs outright, so this
 * is built from the subject §6 does give us: a guided line, engineered and directional.
 *
 * Three separate lines enter from the left. The outer two turn through a quarter circle and merge
 * into the middle one, which continues alone to the right edge as a single heavier trunk. Markers
 * sit where each line begins and where the three become one, drawn at `node-square`'s exact 7px
 * geometry so the mark, the rail's station nodes, and the wordmark's leading mark read as one
 * vocabulary.
 *
 * It says what the section says — several scattered sources of product knowledge become one guide.
 *
 * Decorative, so `aria-hidden` and `focusable="false"` (§12). No hue: this row is outside every
 * feature panel, so §6.1 is absolute here. `--rail` is legitimate on a stroke — §6.1 forbids it as
 * a *text* colour, and a hairline is exactly what the token is for.
 *
 * This is **not** the Glidda logo. §15 leaves the mark undesigned; this is one section's
 * illustration and it does not belong in the header.
 */
export function InterchangeMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 400 120"
      preserveAspectRatio="xMinYMid meet"
      fill="none"
      className={className}
    >
      {/* The three approaches, and the two quarter-circle merges. Every arc is r=36 across a
          36×36 box, so each turn is a true quarter circle rather than an eased curve. */}
      <path
        d="M16 24H204A36 36 0 0 1 240 60"
        className="stroke-rail"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M16 60H240"
        className="stroke-rail"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M16 96H204A36 36 0 0 0 240 60"
        className="stroke-rail"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />

      {/* The trunk: everything after the junction, and the only travelled length here. Heavier
          than the approaches, which is what makes the merge read as a merge. */}
      <path
        d="M240 60H384"
        className="stroke-ink"
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
      />

      {/* Station markers: three origins and the junction. `node-square` is 7px. */}
      <rect x="12.5" y="20.5" width="7" height="7" className="fill-ink" />
      <rect x="12.5" y="56.5" width="7" height="7" className="fill-ink" />
      <rect x="12.5" y="92.5" width="7" height="7" className="fill-ink" />
      <rect x="236.5" y="56.5" width="7" height="7" className="fill-ink" />
    </svg>
  )
}
