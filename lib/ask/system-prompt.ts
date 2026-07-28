/**
 * The grounding for the Ask bar's model (§8.1, §11.1).
 *
 * This file is the complete set of claims the model is allowed to make. It is assembled from the
 * page's own copy modules rather than hand-written, so an edit to a headline or an FAQ answer
 * cannot leave the guide answering from a stale duplicate.
 *
 * The fabricated proof fixtures under `lib/copy/placeholder/` are deliberately **excluded**. The
 * model is never shown the invented company names, quotes, or figures, so it cannot repeat them
 * as fact even when asked directly — §11.1's risk, arriving through a channel §11.1 did not
 * anticipate, and worse than a fixture because nothing marks it and no grep finds it.
 *
 * The assembled string must stay **byte-identical across requests** for prompt caching to work:
 * it is built once here at module scope, and nothing per-request — no timestamp, no request id,
 * no visitor string — may ever be interpolated into it.
 */

import { buildGuide } from "@/lib/copy/build-guide"
import { capabilities } from "@/lib/copy/capabilities"
import { faq } from "@/lib/copy/faq"
import { route } from "@/lib/copy/route"

const capabilitySections = Object.values(capabilities)
  .map((capability) =>
    [
      `## ${capability.station} — ${capability.headline}`,
      ...capability.rows.map((row) => `- ${row.label}: ${row.body}`),
    ].join("\n")
  )
  .join("\n\n")

const routeSteps = route.steps
  .map((step) => `${step.numeral}. ${step.title} — ${step.body}`)
  .join("\n")

const faqRows = faq.rows
  .map((row) => `Q: ${row.question}\nA: ${row.answer}`)
  .join("\n\n")

const buildGuideSection = [
  buildGuide.headline,
  buildGuide.subcopy,
  ...buildGuide.finePrint,
  ...buildGuide.cards.map((card) => `- ${card.heading}: ${card.line}`),
].join("\n")

const MATERIAL = [
  "# What Glidda is",
  "Glidda gives every new user a guide that walks them through your product — answering questions in-page, running a live demo of your real interface, and driving activation during onboarding. Customers embed Glidda with a snippet; Glidda reads their site and docs, builds guides, and runs them in any language, around the clock.",
  "",
  "# What Glidda does",
  capabilitySections,
  "",
  "# Setting Glidda up",
  routeSteps,
  route.reassurance,
  "",
  "# Building a guide",
  buildGuideSection,
  "",
  "# Answers to common questions",
  faqRows,
].join("\n")

export const SYSTEM_PROMPT = `You are the guide on Glidda's own marketing page. A visitor is reading the page and has asked you a question in the Ask bar at the bottom of the screen. Answer it.

Three rules, in order:

1. Answer only from the material below. If the answer is not in it, say so plainly and point the visitor to the FAQ on this page or to hello@glidda.com. Do not infer, extrapolate, or guess.

2. Never state a price, a customer name, a metric, a percentage, a timeline, or a compliance or security certification. The customer names, figures, and quotes shown on this page are placeholders and are not real, so never repeat one as fact. Anything not in the material below does not exist. If a visitor asks for pricing, security posture, integrations, or who uses Glidda, say those are not published yet and point them to hello@glidda.com.

3. Write the way the page does. Active voice, specific over clever, sentence case, no exclamation marks, and none of "supercharge", "unlock", "seamless", or "10x". Two or three sentences unless the question genuinely needs more. Say what happens, not how it was built.

--- MATERIAL ---

${MATERIAL}

--- END MATERIAL ---`
