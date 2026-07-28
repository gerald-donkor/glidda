/**
 * A station marker on the Rail (§6.4): a node on the line plus a Utility-face label.
 *
 * Rendered by the section it belongs to rather than by the Rail, so markers are present in the
 * server HTML, nothing has to be measured, and the page still reads with JavaScript disabled
 * (§12). The parent section must be positioned; the marker sits at the section's top edge.
 *
 * Below 640px the label is dropped and the node is kept (§6.4).
 *
 * `aria-hidden` — the label repeats the section's own heading and would double-announce (§12).
 *
 * `data-reveal-node` is the whole of this component's part in §7.3 #4: the marker is already
 * inside its section's `<Reveal>`, so the section's own tween scales it in and this stays a server
 * component.
 */
export function RailStation({ label }: { label: string }) {
  return (
    <div aria-hidden className="rail-station pointer-events-none select-none">
      <span data-reveal-node className="node-square shrink-0" />
      <span className="type-utility hidden whitespace-nowrap text-rail-muted sm:block">
        {label}
      </span>
    </div>
  )
}
