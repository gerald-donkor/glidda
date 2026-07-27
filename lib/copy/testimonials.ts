/**
 * Testimonial carousel copy (§8 row 11, §9, §11).
 *
 * The strings here are real copy — a section label, a station name, and the accessible names of two
 * arrows. The fabricated part of this section is its three quotes, and those live in
 * `lib/copy/placeholder/testimonials.ts` under §11.1's policy, not here. (Phrased without the
 * literal flag string on purpose: §14's pre-deploy grep must not match a comment.)
 */
export const testimonials: {
  label: string
  station: string
  carousel: string
  previous: string
  next: string
  slideLabel: (index: number, total: number) => string
} = {
  label: "Customer stories",
  station: "Stories",
  carousel: "Customer stories",
  previous: "Previous quote",
  next: "Next quote",
  slideLabel: (index, total) => `${index} of ${total}`,
}
