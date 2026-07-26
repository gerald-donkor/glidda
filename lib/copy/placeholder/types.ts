/**
 * Fabricated proof fixtures (§11.1).
 *
 * Everything in this directory is fictional by construction. No company here trades, no person
 * here exists, and no figure here was measured. It is design material — a logo band, a stat row,
 * and a pull-quote cannot be laid out against nothing — and it is removable in one pass: delete
 * the directory, delete its three imports, done.
 *
 * The flag below is a required literal `true`, not a `boolean`. A real record cannot be added
 * without changing this type, which is a reviewable diff; with `boolean`, a fixture could be
 * quietly demoted to a claim. §14's pre-deploy grep over this directory is the release gate, and
 * no comment in it reproduces that grep's search string.
 */

export type Placeholder = { readonly placeholder: true }

export type CompanyFixture = Placeholder & { readonly name: string }

export type StatFixture = Placeholder & {
  readonly figure: string
  readonly label: string
}

export type QuoteFixture = Placeholder & {
  readonly quote: string
  readonly name: string
  readonly role: string
  readonly company: string
  /** Two initials, authored not derived — §11.1 allows no photograph, and a split-on-space
   *  derivation breaks on the first name that does not have two words. */
  readonly monogram: string
}
