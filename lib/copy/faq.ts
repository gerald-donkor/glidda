/**
 * FAQ copy (§8 row 12, §9, §11).
 *
 * §11.1's fixture policy applies to none of this: a question about our own product is not a claim
 * about a customer, a person, or a metric. There is no fixture flag here and no marker chip in the
 * section. (Phrased without the literal flag string on purpose: §14's pre-deploy grep must not
 * match a comment.)
 *
 * Three questions a buyer will certainly ask are deliberately absent — pricing, security and data
 * handling, and integrations. Nobody has decided any of them, and §11.2 is explicit that a question
 * we cannot answer honestly is cut rather than invented. An invented compliance sentence is the
 * most damaging thing that could go on this page, because it is the kind a reader acts on.
 *
 * No answer contains a metric. "Setup takes under ten minutes" is a fabricated statistic wearing a
 * sentence's clothes; "you add one script tag" describes the product.
 */

/** `id` is a stable slug, not derived from the question text — it is the accordion's `value`, so
 *  deriving it would change every row's DOM identity whenever a word is edited. */
export type FaqRow = { id: string; question: string; answer: string }

export const faq: {
  station: string
  eyebrow: string
  headline: string
  rows: readonly FaqRow[]
} = {
  station: "FAQ",
  eyebrow: "Questions",
  headline: "What people ask before they start.",
  rows: [
    {
      id: "what-it-does",
      question: "What does Glidda actually do?",
      answer:
        "It reads your site and your docs, builds a guide from them, and runs that guide on the page a visitor is already standing on. It answers their questions, walks them through your real interface, and gets new users to their first result.",
    },
    {
      id: "setup",
      question: "How long does setup take?",
      answer:
        "You add one script tag, and Glidda drafts the first guide from what you have already published. The rest is you reading what it wrote and correcting it, which takes as long as you want to spend.",
    },
    {
      id: "sources",
      question: "What does Glidda read to build a guide?",
      answer:
        "Whatever you point it at — your site, your docs, your changelog. It does not go looking anywhere else.",
    },
    {
      id: "in-app",
      question: "Does it work inside my product, or only on the marketing site?",
      answer:
        "Both, from the same snippet. That is what lets one guide carry someone from a question on your pricing page to their first real result inside the product.",
    },
    {
      id: "languages",
      question: "What languages does it run in?",
      answer:
        "It answers in the language the visitor writes in. You write the guide once.",
    },
    {
      id: "wrong-answers",
      question: "What happens when it gets something wrong?",
      answer:
        "It answers from what you published, and it says when it does not know rather than guessing. Every conversation comes back to you, so the answers you had to correct are the fastest list you will get of what your docs are missing.",
    },
  ],
}
