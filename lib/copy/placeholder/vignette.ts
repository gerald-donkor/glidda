import { companies } from "@/lib/copy/placeholder/companies"
import type { Placeholder } from "@/lib/copy/placeholder/types"

/**
 * The three capability panels' vignette content (§11.1, prompt 09 decision 9).
 *
 * These strings are drawn inside what looks like a product screenshot on a marketing page — an
 * invented company, a headcount, a plan tier. The panel is hidden from the accessibility tree,
 * but that attribute is not a disclaimer and a sighted reader does not experience it as
 * decoration, so every object here is flagged and every panel carries a visible marker beneath
 * it. Nothing fabricated is written inline in a vignette part.
 *
 * Figures are round and notional (§11.2). No percentage, no currency, no date.
 */

export type VignetteBubble = {
  readonly side: "visitor" | "agent"
  readonly text: string
}

export type VignetteCopy = {
  /** Read from the logo band's fixtures, so the page has one list of invented companies. */
  readonly company: string
  readonly bubbles: readonly VignetteBubble[]
  /** The recommended option first — it is the one drawn as the solid pill. */
  readonly choice: readonly [string, string]
  readonly infoLabel: string
  readonly fields: readonly string[]
  readonly caption: string
  readonly status: string
  readonly agentName: string
  readonly agentQuestion: string
  readonly agentAnswer: string
  /** The decorative field's text. It is a `<div>`, never an input (decision 7). */
  readonly fieldPlaceholder: string
}

const [, rivetworks, piperlane, , coalspring] = companies

export const answersVignette: Placeholder & VignetteCopy = {
  placeholder: true,
  company: rivetworks.name,
  bubbles: [
    { side: "visitor", text: "Does this work with the tools we already run?" },
    { side: "agent", text: "Yes — it reads whatever you have documented." },
    { side: "visitor", text: "Can I see that part?" },
  ],
  choice: ["See a demo", "Not yet"],
  infoLabel: "Visitor",
  fields: ["Rivetworks", "Team of 60", "Growth plan", "Wants faster setup"],
  caption: "Answering on the pricing page.",
  status: "Reading your docs",
  agentName: "Guide",
  agentQuestion: "Where do I invite my team?",
  agentAnswer: "In settings, under people.",
  fieldPlaceholder: "Ask about this page",
}

export const demosVignette: Placeholder & VignetteCopy = {
  placeholder: true,
  company: piperlane.name,
  bubbles: [
    { side: "visitor", text: "Show me how permissions work." },
    { side: "agent", text: "Opening the roles screen now." },
  ],
  choice: ["Keep going", "Skip ahead"],
  infoLabel: "Visitor",
  fields: ["Piperlane", "Team of 40", "Trial", "Evaluating for Q4"],
  caption: "Opening the roles screen.",
  status: "Driving the product",
  agentName: "Guide",
  agentQuestion: "Who can edit billing?",
  agentAnswer: "Owners and admins only.",
  fieldPlaceholder: "Ask about this screen",
}

export const onboardingVignette: Placeholder & VignetteCopy = {
  placeholder: true,
  company: coalspring.name,
  bubbles: [
    { side: "agent", text: "Two steps left before your first report." },
    { side: "visitor", text: "Walk me through them." },
  ],
  choice: ["Walk me through it", "I'll do it later"],
  infoLabel: "Day 3",
  fields: ["Coalspring", "Team of 20", "Starter plan", "Setup half done"],
  caption: "Picking up where they stopped.",
  status: "Checking what stalled",
  agentName: "Guide",
  agentQuestion: "What is left to set up?",
  agentAnswer: "Connect a source, then invite your team.",
  fieldPlaceholder: "Ask about this step",
}
