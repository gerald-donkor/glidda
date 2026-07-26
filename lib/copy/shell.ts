/**
 * Shell copy (§9, §11). Every string the shell renders lives here so the page's voice is
 * reviewable in one place. None of this is fabricated proof — the shell makes no claim about a
 * customer, a person, or a metric, so §11.1's fixture flag applies to nothing here.
 */

export type NavLink = { label: string; href: string }
export type FooterColumn = { heading: string; links: NavLink[] }

/**
 * A product statement we intend to be true, not a metric and not a funding claim (§11.2).
 */
export const announcement: { text: string; href: string } = {
  text: "Glidda runs your guide in any language, around the clock.",
  href: "#answers",
}

export const nav: NavLink[] = [
  { label: "Answers", href: "#answers" },
  { label: "Demos", href: "#demos" },
  { label: "FAQ", href: "#faq" },
]

export const headerCta: NavLink = { label: "Start a guide", href: "#ask" }

export const footer: {
  disclaimer: [string, string]
  columns: [FooterColumn, FooterColumn]
} = {
  disclaimer: [
    "Glidda gives every new user a guide that walks them through your product — answering questions in-page, running a live demo of your real interface, and driving activation during onboarding.",
    "This site is pre-launch. The customer names, figures, and quotes on this page are placeholders and do not describe real accounts or results. They are replaced before launch.",
  ],
  columns: [
    {
      heading: "Product",
      links: [
        { label: "Answers", href: "#answers" },
        { label: "Demos", href: "#demos" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "Contact us", href: "mailto:hello@glidda.com" },
        { label: "Start a guide", href: "#ask" },
        { label: "Back to top", href: "#main" },
      ],
    },
  ],
}

export const ask: {
  restQuestions: [string, string, string]
  focusPlaceholder: string
  reducedMotionPlaceholder: string
  chips: [string, string, string]
} = {
  restQuestions: [
    "What does Glidda do?",
    "How long does setup take?",
    "Can Glidda run inside my app?",
  ],
  focusPlaceholder: "Ask me anything",
  reducedMotionPlaceholder: "Ask me anything about Glidda",
  chips: ["What is Glidda?", "How does setup work?", "Show me a demo"],
}

export const shell = {
  skipLink: "Skip to content",
  wordmark: "glidda",
  wordmarkLabel: "Glidda — home",
  navLabel: "Page sections",
  footerNavLabel: "Footer",
  askLabel: "Ask Glidda a question",
  askSend: "Send question",
  askSuggestions: "Suggested questions",
} as const
