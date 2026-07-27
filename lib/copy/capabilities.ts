/**
 * Copy for the three capability sections (§8, row 8; §9, §11).
 *
 * Nothing here is a claim about a customer, a person, or a metric, so §11.1's fixture policy
 * applies to none of it — no fixture flag, no `PLACEHOLDER` chip on this text. This is the real
 * copy until someone changes it. The strings the vignette panels draw *are* fabricated and live
 * in `lib/copy/placeholder/vignette.ts` instead. (Phrased without the literal flag string on
 * purpose: §14's pre-deploy grep must not match a comment.)
 */

/** One accordion row. `body` is written to land on two lines at the column's measure (§5.1). */
export type CapabilityRow = {
  /** Stable per-row key, used as the accordion's controlled value. */
  id: string
  label: string
  body: string
}

export type Capability = {
  id: "answers" | "demos" | "onboarding"
  /** Rail station label, Utility face (§6.4). */
  station: string
  /** The pill chip above the headline. */
  eyebrow: string
  headline: string
  /** Exactly three (§5.1), typed as a fixed tuple so a fourth row is a compile error and the
   *  underline's dwell arithmetic cannot silently drift. */
  rows: readonly [CapabilityRow, CapabilityRow, CapabilityRow]
}

export const capabilities: Record<Capability["id"], Capability> = {
  answers: {
    id: "answers",
    station: "Answers",
    eyebrow: "Inbound questions",
    headline: "Answers where the question came up.",
    rows: [
      {
        id: "in-context",
        label: "Answers in context",
        body: "Someone asks on the pricing page and gets the pricing answer there, on the page they were already reading.",
      },
      {
        id: "knows-limits",
        label: "Knows what it does not know",
        body: "When the answer is not in your site or your docs, the guide says so and offers a route to someone who can answer it.",
      },
      {
        id: "carries-thread",
        label: "Carries the thread",
        body: "The next question picks up where the last one ended, so nobody explains their setup twice in one session.",
      },
    ],
  },
  demos: {
    id: "demos",
    station: "Demos",
    eyebrow: "Guided demos",
    headline: "A demo that drives your real product.",
    rows: [
      {
        id: "real-interface",
        label: "Drives the real interface",
        body: "The guide clicks through your live product, so what a visitor watches is the screen they land on after signing up.",
      },
      {
        id: "adapts",
        label: "Adapts to what they ask",
        body: "Ask about permissions halfway through and the demo goes there next, instead of finishing a script nobody asked for.",
      },
      {
        id: "hands-off",
        label: "Hands off when they are ready",
        body: "When someone wants to talk to a person, the guide passes the conversation over with everything it already learned.",
      },
    ],
  },
  onboarding: {
    id: "onboarding",
    station: "Onboarding",
    eyebrow: "First-week onboarding",
    headline: "Onboarding that stays for the first week.",
    rows: [
      {
        id: "knows-product",
        label: "Knows the product",
        body: "It reads your site, your docs, and your release notes, so it explains the version you shipped rather than last quarter's.",
      },
      {
        id: "walks-through",
        label: "Walks them through it",
        body: "It points at the next step inside your interface, waits while the person does it, and only then moves on.",
      },
      {
        id: "follows-up",
        label: "Follows up on what stalled",
        body: "If someone stops halfway through setup, the guide picks it back up the next time they are on the page.",
      },
    ],
  },
}
