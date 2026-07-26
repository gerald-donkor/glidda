/**
 * Copy for the logo band and the proof band (§9, §11).
 *
 * Nothing in this file is a claim about a customer, a person, or a metric — those live in
 * `lib/copy/placeholder/` and carry the fixture flag. These are the two bands' headings, the
 * proof band's station label, and the marker chip's own label, and they are real copy.
 *
 * Both headings are visually hidden: neither band shows a headline — that is the shape in §8 —
 * but §12 requires the document outline to run h1 → h2 → h2 without a gap.
 */
export const proofCopy = {
  logoBandHeading: "Customers using Glidda",
  proofHeading: "Proof",
  proofStation: "Proof",
  placeholderChip: "Placeholder",
} as const
