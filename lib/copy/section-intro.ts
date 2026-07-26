/**
 * Section intro copy (§8, row 7; §9, §11). One headline and one paragraph, introducing the three
 * capability sections that follow. Nothing here is a claim about a customer, a person, or a
 * metric, so §11.1's fixture policy applies to none of it — no fixture flag, no `PLACEHOLDER`
 * chip. (Phrased without the literal flag string on purpose: §14's pre-deploy grep must not match
 * a comment.)
 */

export const sectionIntro: {
  headline: string
  body: string
} = {
  headline: "Three things a guide does once it is on your site.",
  body:
    "It answers the question a visitor is holding, shows the product doing the thing they asked about, and stays with them through the first week. Each one runs on its own, in any language, at any hour.",
}
