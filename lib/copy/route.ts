/**
 * Route section copy (§9, §11). Nothing here is fabricated proof — the section makes no claim
 * about a customer, a person, or a metric, so §11.1's fixture policy applies to none of it and
 * there is no flag to set. This is the real copy until someone changes it. (Phrased without the
 * literal flag string on purpose: §14's pre-deploy grep must not match a comment.)
 *
 * One string here is a product statement rendered as fact: `snippet`'s host. `cdn.glidda.com`
 * does not exist yet. It is written once, on one line, so correcting it before a public deploy is
 * a one-line change — and it is listed in the deploy report alongside the fixture grep (§11.2).
 */

import type { NavLink } from "@/lib/copy/shell"

/** One station on the route. `numeral` is authored text, not a CSS counter — it is set in the
 *  Display face at headline size, so it is typographic content rather than a list marker. */
export type RouteStep = { numeral: string; title: string; body: string }

export const route: {
  station: string
  eyebrow: string
  headline: string
  steps: readonly [RouteStep, RouteStep, RouteStep]
  cta: NavLink
  reassurance: string
  snippetLabel: string
  snippet: string
  /** Button labels. Kept to one or two words so the control does not change width mid-press;
   *  the direction a reader needs after a failure is in `status` instead. */
  copy: { idle: string; done: string; failed: string }
  /** The announced — and visible — outcome. Says what happened and what to do next (§11). */
  status: { done: string; failed: string }
} = {
  station: "Route",
  eyebrow: "Setup",
  headline: "Three steps to a guide that runs itself.",
  steps: [
    {
      numeral: "01",
      title: "Add the snippet",
      body: "One script tag in your site's head. It loads after your page has painted, so nothing you already ship gets slower.",
    },
    {
      numeral: "02",
      title: "Let Glidda read your product",
      body: "Point it at your site and your docs. It drafts the first guide from what you have already published, and you edit what it got wrong.",
    },
    {
      numeral: "03",
      title: "Turn the guide on",
      body: "Publish, and the Ask bar starts answering on every page — in the visitor's language, at whatever hour they arrived.",
    },
  ],
  // The same label and destination as the hero's primary, the header pill, and the live demo
  // CTA: the action keeps its name through the whole flow (§11).
  cta: { label: "Start a guide", href: "#ask" },
  reassurance: "Remove the script tag and every guide stops the same minute.",
  snippetLabel: "Embed code",
  snippet: '<script src="https://cdn.glidda.com/guide.js" async></script>',
  copy: {
    idle: "Copy embed code",
    done: "Copied",
    failed: "Copy blocked",
  },
  status: {
    done: "The snippet is on your clipboard.",
    failed: "Your browser blocked the copy. The snippet is selected — press Ctrl or Cmd + C.",
  },
}
