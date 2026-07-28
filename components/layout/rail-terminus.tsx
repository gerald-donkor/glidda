/**
 * The Rail's last stop (§6.4): a station marker with a larger node, rendered by the closing CTA.
 *
 * Its own component rather than a `terminus` prop on `RailStation`, which is used nine times and
 * would carry a boolean to serve one caller. The closing CTA renders this *instead of*
 * `RailStation`, never in addition to it — two markers at one section's top edge would be a
 * mistake, not emphasis.
 *
 * **The hairline does not stop here, by design.** The track runs the full height of `<main>`, so it
 * continues past the marker through this section's bottom padding. A terminus in the signage
 * vocabulary §6 draws from means *last stop*, not truncation — the line arriving at its final
 * station and running a little way past it into the buffers is the correct reading, and it is also
 * literally what the DOM does.
 *
 * Below 640px the label is dropped and the node is kept (§6.4).
 *
 * `aria-hidden` — the label repeats nothing a screen reader needs (§12).
 */
export function RailTerminus({ label }: { label: string }) {
  return (
    <div aria-hidden className="rail-terminus pointer-events-none select-none">
      {/* Not `node-square`: that is fixed at 7px and shared with the wordmark. `data-reveal-node`
          for the same reason `rail-station.tsx` carries it — the last stop arrives like every
          other station (§7.3 #4), and it is the one marker it would be visible to leave out. */}
      <span data-reveal-node className="size-[11px] shrink-0 bg-ink" />
      <span className="type-utility hidden whitespace-nowrap text-rail-muted sm:block">
        {label}
      </span>
    </div>
  )
}
