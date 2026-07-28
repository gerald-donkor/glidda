# 20 — Repo housekeeping: remove the unused `motion` package and make AGENTS.md true

## Goal

Two things, both maintenance, neither of them design:

1. **Remove the `motion` dependency.** §15 has left it as an open decision — "installed and unused.
   Either commit to GSAP alone and remove it, or document where each library is used." A grep
   across `app/`, `components/`, `hooks/`, and `lib/` returns **zero** imports. Under §13 ("no dead
   code") an unused runtime dependency is dead weight, and §3 already names GSAP as *the* animation
   library. This resolves the decision by taking the first branch.
2. **Correct the statements in `AGENTS.md` that the repo has since made false.** §14 still tells the
   next agent that `npm run typecheck` does not exist. §15 still lists as open two things that
   shipped. §9's tree omits directories that exist. None of this is cosmetic: `AGENTS.md` is the
   first thing every agent reads and the only source of truth §2 recognises, so a stale line in it
   costs real work every session.

**This prompt changes no pixel and no tween.** It is a dependency removal plus documentation edits.
Findings that would require a design or architecture decision are collected in the last section for
a later prompt and are deliberately **not** folded in here — §13 forbids unrelated refactors and
unrequested features, and "while I'm in there" is exactly how that rule gets broken.

Out of scope, and still open after this prompt: the durable rate-limit store, Ask bar multi-turn and
persistence, the spend ceiling, swapping the placeholder fixtures, and the Glidda mark proper.

### A note on this file's number

§4 says take the next number after the highest existing. The highest existing is `17`, so §4 would
name this `18`. It is `20` because the number was specified in the request. **18 and 19 will never
exist**, and that gap is now a permanent, slightly confusing feature of `prompts/`. Flagged rather
than silently absorbed; if the human would rather this be `18`, rename before approving — it is
cheaper now than ever again.

## Skills and docs read

- **`AGENTS.md` in full**, which is the subject of half this prompt: §2 (workflow), §3 (the skills
  table and the animation-library decision), §4 (required prompt sections), §8 (the definitive
  section list), §9 (file layout), §13 (no dead code, no unrelated refactors, the env-var table),
  §14 (checks), §15 (open decisions).
- **No Next.js doc was read, and none is needed.** Nothing here touches routing, a server/client
  boundary, `next/font`, `next/image`, metadata, or `next.config.ts`. §2 requires the docs for
  framework code; removing a package nothing imports is not framework code, and reading the routing
  guide to justify an `npm uninstall` would be theatre. **If implementation discovers that removing
  the package requires a config change, stop and read the relevant guide before proceeding** — that
  discovery would mean this prompt's premise was wrong.
- **No GSAP skill was read.** No animation is added, removed, or retimed. Every existing tween keeps
  its file, its trigger, and its timing.
- **The `shadcn` skill is not involved.** No primitive under `components/ui/` is touched. The grep
  in "Existing code inspected" covers all 60 files there and none of them imports `motion`.

## Existing code inspected

Everything below was verified by running the command shown, not inferred.

| What | How verified | Result |
| --- | --- | --- |
| `motion` imports anywhere in app code | `grep -rn "from \"motion\|from 'motion\|require(.motion.\|framer-motion" app components hooks lib` | **zero hits** |
| `motion` declared | `package.json:25` | `"motion": "^12.42.2"` |
| `framer-motion` in the tree | `package-lock.json:6099`, `:8068`, `:8074` | present **only** as a dependency of `motion` — nothing declares it directly |
| `typecheck` script | `package.json:10` | `"typecheck": "tsc --noEmit"` — exists |
| Sections composed on `/` | `app/page.tsx` | 13 sections, hero → closing CTA |
| Closing CTA built | `components/sections/closing-cta.tsx`, `prompts/14-closing-cta.md`, `lib/copy/closing-cta.ts` | exists; concept is the rail's terminus, explicitly not hands |
| Wordmark | `components/layout/wordmark.tsx` | text-only wordmark in the Display face with a `node-square` mark |
| Ask backend | `app/api/ask/route.ts`, `lib/ask/{rate-limit,system-prompt,types}.ts` | exists |
| `.env.example` | `ls -a`; `.gitignore:37` (`!.env.example`) | exists and is un-ignored — §13's env table is **accurate** |
| Placeholder fixtures | `grep -rn "placeholder: true" lib/copy/ \| wc -l` | **17** |
| Design tokens vs §6.1 | `grep` of `app/globals.css:103-117` and `design-system/tokens.json` | all six tokens plus `--rail-muted` and the three route hues match §6.1 exactly — **no drift** |
| Lint baseline | **`npm run lint`, run while writing this prompt** | 3 errors: `components/layout/wordmark.tsx`, `components/ui/carousel.tsx`, `hooks/use-mobile.ts` — matches §14's bar |
| Typecheck | **`npm run typecheck`, run while writing this prompt** | clean, exit 0 |

**What was not read.** The 60 files in `components/ui/` were grepped, not read. `npm run build` was
not run (the request forbade it) — so the build's current state is asserted from typecheck and lint
only, and step 1 of the checks below is what actually establishes it. `node_modules/next/dist/docs/`
was not opened, for the reason given above.

### `components/motion/` is not the `motion` package

Stated because the names collide and a careless grep conflates them.
`components/motion/{slipstream,vignette,vignette-parts}.tsx` are this project's own GSAP animation
components, mandated by §9's layout and §10. `tw-animate-css` is a separate, unrelated Tailwind
plugin. **Neither is affected.** The only thing being removed is the npm package named `motion`.

## Decisions and assumptions

### 1. Remove `motion` rather than document it

§15 offers two branches. The second — "document where each library is used" — cannot be taken
honestly, because the answer is "nowhere". Keeping a declared dependency that nothing imports costs
install time, lockfile surface, and a supply-chain entry, and it actively misleads: §3's "do not use
both in one component" reads as though a second library is in play, so an agent may reach for it.
Removing it makes §3's animation-library decision unambiguous.

### 2. `framer-motion` leaves with it, and nothing else should

`framer-motion` appears in the lockfile only as `motion`'s own dependency (`package-lock.json:8074`).
It is not declared in `package.json`. Removing `motion` should therefore drop both. **The lockfile
diff is expected to be exactly those two packages plus their exclusive transitive deps** — if
`npm uninstall` proposes touching `gsap`, `@gsap/react`, `next`, `react`, or any `@base-ui/*`
entry, stop and report rather than committing it.

### 3. The `.agents/skills/motion-framer` and `framer-motion-animator` skill directories stay

Both exist on disk and both are listed in `skills-lock.json` (lines 10 and 64). Neither is listed in
§3's table, so no agent following `AGENTS.md` should be reaching for them anyway. They are tooling,
not application code; deleting them is a separate call about the skills install and is **not** made
here. Raised as a decision for the human below.

### 4. Other unused-looking dependencies are not touched

`recharts`, `date-fns`, `cmdk`, `input-otp`, `react-day-picker`, `react-resizable-panels`,
`embla-carousel-react`, `@shadcn/react`, and `shadcn` are all declared. Several of them exist only
to support primitives sitting unused in `components/ui/`, which §10 explicitly treats as a stocked
library ("It already has … and ~50 more") rather than dead code. **`motion` is different, and the
difference is the whole justification for removing it: §15 already names it as a decision to
resolve.** Auditing the rest is a separate prompt with a separate argument to make, and is listed at
the end.

### 5. `design-system/tokens.{json,css}` are not dead weight

They look like strays at the repo root. They are not: `prompts/01-design-system.md:117-119` and
`prompts/02-design-system-revision.md:73` both declare them deliberate reference artifacts,
imported nowhere by design. **Do not delete them.** Their absence from §9's tree is a documentation
gap, fixed below.

### 6. AGENTS.md edits are corrections of fact only

Every edit below changes a statement that is demonstrably false into one that is true, or moves a
resolved item into the resolved form §15 already uses (strikethrough + `resolved <date>` + the file
that resolved it, as the Ask bar entries do). **No rule, token, constraint, or scope boundary is
weakened, relaxed, or deleted.** If implementation finds itself wanting to change what a rule
*says* rather than whether it is *true*, that is out of scope — stop and ask.

### 7. The `gemini-3.6-flash` / `gemini-3.5-flash` comment in `route.ts`

`app/api/ask/route.ts:31-34` reads:

```
/** Chosen because it answers on the free tier: `gemini-3.6-flash` allows 20 requests a day there,
 *  which cannot run a page-wide Ask bar. Revisit alongside the spend ceiling (§15) if billing is
 *  ever enabled. */
const MODEL = "gemini-3.5-flash"
```

The comment names one model and the constant sets another, and "Chosen because" attaches to the
model that was *not* chosen. The intended meaning is legible — 3.6 was rejected for its free-tier
quota, so 3.5 is used — but as written the comment contradicts the line beneath it. This is a
comment fix, no behaviour change, and `MODEL` keeps its current value.

**Do not change the model.** Which model the Ask bar runs is a product decision with cost
implications and it is not being made in a housekeeping prompt.

## Files likely to change

| File | Change |
| --- | --- |
| `package.json` | remove the `"motion"` dependency line |
| `package-lock.json` | regenerated by `npm uninstall motion` — `motion` and `framer-motion` drop out |
| `AGENTS.md` | §3, §9, §14, §15 corrections — detailed below |
| `app/api/ask/route.ts` | rewrite the 3-line comment at :31-34 so it agrees with `MODEL` |
| `app/page.tsx` | one clause in the file comment at :20 — drops "and the unused `motion` package" |

Explicitly **not** modified: every file under `components/`, `lib/`, `hooks/`, `app/globals.css`,
`app/layout.tsx`, `app/design-system/`, `next.config.ts`, `components.json`, `tsconfig.json`,
`design-system/tokens.*`, `.env.example`, and every existing file in `prompts/`.

## Implementation requirements

### A. Remove the package

1. `npm uninstall motion` from the project root. Do not hand-edit `package.json` and do not
   hand-edit `package-lock.json`.
2. Inspect `git diff package-lock.json` before going further. Expected: `motion` and `framer-motion`
   removed, plus any dependency exclusive to them. Any change to `gsap`, `@gsap/react`, `next`,
   `react`, `react-dom`, `@base-ui/react`, or `@google/genai` means something else happened —
   stop and report it instead of continuing.
3. Re-run the grep from "Existing code inspected" and confirm it still returns zero hits.

### B. AGENTS.md corrections

Each of these replaces a false statement. Keep the surrounding prose, tone, and structure.

| Location | Says now | Must say |
| --- | --- | --- |
| §3, line 73 | "GSAP is the animation library for this project. `motion` is also installed; do not use both in one component, and do not add new `motion` usage without asking." | GSAP is the animation library for this project, and the only one. `motion` was removed as unused (prompt 20). Adding any second animation library needs its own prompt and approval. |
| §9, tree | omits `app/api/`, `app/design-system/`, `lib/ask/`, `lib/copy/placeholder/`, `hooks/` contents, and `design-system/` at the repo root | add them, each with a one-line role. Note that `design-system/tokens.*` is a reference artifact imported nowhere. |
| §9, tree | `motion/  slipstream, vignettes, typewriter` | the typewriter is `hooks/use-typewriter-placeholder.ts`, consumed by `components/ask/ask-bar.tsx:16`. `components/motion/` holds the slipstream and the vignettes. Correct the line. |
| §14, line 513 | "`npm run typecheck` — **this script does not exist yet.** Add … Until then run `npx tsc --noEmit`." | the script exists (`package.json:10`). Reduce to the plain instruction to run `npm run typecheck`. |
| §14 | does not state the lint bar, though every recent prompt restates it | record the three-error baseline once, naming the three files, so prompts can cite §14 rather than repeat it |
| §15, closing CTA | "**Closing CTA visual** — needs its own concept; must not be hands." | strike through and mark resolved (prompt 14), citing `components/sections/closing-cta.tsx`. The concept is the rail's terminus. |
| §15, `motion` | "installed and unused. Either commit to GSAP alone and remove it, or document where each library is used." | strike through and mark resolved (this prompt) — removed; GSAP alone. |
| §15, the Glidda mark | "no wordmark or logo exists yet. The header currently needs a text-only wordmark in the Display face." | **partially** resolved: the text-only wordmark exists (`components/layout/wordmark.tsx`); a real mark still does not. `components/layout/interchange-mark.tsx` is one section's illustration and its own file comment says it is not the logo. Reword to leave only the actual open part. |

**§15 items that are genuinely still open and must be left exactly as they are:** the durable
rate-limit store, Ask bar multi-turn and persistence, the spend ceiling, swapping the placeholders
(17 `placeholder: true` hits remain), and dark mode.

### C. The two comment corrections

- `app/api/ask/route.ts:31-34` — per decision 7. `MODEL`'s value does not change.
- `app/page.tsx:20` — the comment lists "the unused `motion` package" among what remains; after this
  prompt it no longer does. Remove that clause and leave the rest of the sentence intact.

### D. Do not

- Do not add, remove, or reorder any section in `app/page.tsx`.
- Do not touch any file under `components/` or `lib/`.
- Do not run a formatter across anything.
- Do not delete the `.agents/skills/motion-framer` or `framer-motion-animator` directories, or edit
  `skills-lock.json`, without the decision below being answered first.
- Do not resolve, reword, or soften any §15 item not named in the table above.

## Visual spec

**None. No pixel changes at any viewport.** That is a claim, so here is how it is established rather
than assumed:

- Nothing under `components/`, `app/globals.css`, or `lib/copy/` is edited, so no markup, class,
  token, or copy string changes.
- `motion` can only affect a rendered pixel by being imported. The grep in "Existing code inspected"
  covers `app/`, `components/` (including all 60 `components/ui/` files), `hooks/`, and `lib/`, for
  both `motion` and `framer-motion`, in `import` and `require` form, and returns zero hits. A package
  with no import path into the bundle cannot render anything.
- `tw-animate-css` — which *does* affect CSS — is a different package and is untouched.
- The only edits to `.tsx` files are inside `/** */` comment blocks, which the compiler discards.

The visual acceptance criterion is therefore "identical", and it is checkable: see step 5 of the
manual review.

## Motion spec

**None. No tween is added, removed, retimed, or re-eased, and no `ScrollTrigger` is created or
destroyed.** The hero load timeline, the rail's scrubbed progress paint, the panel vignettes (§7.3's
three orchestrated moments), the accordion auto-advance, the testimonial crossfade, and the Ask bar
typewriter all keep their existing files and behaviour.

The `prefers-reduced-motion` branches in §7.2 are likewise untouched — they live in
`gsap.matchMedia()` calls inside components this prompt does not open.

The removed package is the *reason* there is a motion spec to write at all: if `motion` were driving
anything, removing it would delete an animation. It is not, and the grep is the evidence.

## Accessibility requirements

Unchanged, and that is the requirement. No element, role, label, heading level, focus ring, or
`aria-*` attribute is touched. Nothing regresses because nothing rendering is edited.

The §12 floor — one `h1`, visible focus on every interactive element, full keyboard operation, ≥4.5:1
text contrast, decorative visuals `aria-hidden`, no horizontal page scroll — must still hold
afterwards, and step 5 of the manual review re-confirms the last of those at 360px, since prompt 17
established that the page had a live overflow bug as recently as this week.

## Acceptance criteria

1. `grep -rn "from \"motion\"\|from 'motion'\|framer-motion" app components hooks lib` returns
   **zero** hits (unchanged — it must not start returning hits either).
2. `"motion"` is absent from `package.json`. `motion` and `framer-motion` are absent from
   `package-lock.json`.
3. `git diff package-lock.json` shows removals only, and nothing removed or altered under `gsap`,
   `@gsap/react`, `next`, `react`, `react-dom`, `@base-ui/react`, or `@google/genai`.
4. `npm run typecheck` — clean.
5. `npm run lint` — **exactly three errors, one each in `components/layout/wordmark.tsx`,
   `components/ui/carousel.tsx`, and `hooks/use-mobile.ts`.** The same three files, not merely the
   same count. Any new error is a failure. (Baseline confirmed by running it while writing this
   prompt.)
6. `npm run build` — succeeds. **This one is mandatory here, not belt-and-braces:** a dependency is
   being removed and the lockfile regenerated, so a build is the only thing that proves no module
   resolution broke. §14 asks for it when routes or config change; a dependency removal is the same
   class of change.
7. `grep -rn "placeholder: true" lib/copy/` still returns **seventeen** hits.
8. **The page renders and animates identically.** Verified by steps 5–6 of the manual review, not by
   assertion.
9. `AGENTS.md` contains no remaining statement contradicted by the repo. Specifically: §14 no longer
   says `typecheck` is missing; §15's `motion` and closing-CTA entries are struck through with the
   resolving file named; the Glidda-mark entry names only the part still open; the five genuinely
   open items are unchanged.
10. The diff is confined to the five files in "Files likely to change". No file under `components/`
    or `lib/` appears in it.
11. `.agents/skills/`, `skills-lock.json`, and `design-system/tokens.*` are unchanged.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
grep -rn "placeholder: true" lib/copy/
grep -rn "from \"motion\"\|from 'motion'\|framer-motion" app components hooks lib   # expect nothing
git diff --stat
```

Paste the real output of each, per §14. `npm run build` is required, per criterion 6.

## Manual review steps

```bash
npm run dev   # http://localhost:3000
```

1. **Before touching anything**, with the dev server on `main`, capture full-page screenshots of `/`
   at **360, 768, 1024, and 1440px**, plus one of `/design-system`. These are the comparison
   baseline; without them criterion 8 is an opinion.
2. Apply the change and re-run `npm install` if needed so `node_modules` matches the new lockfile.
3. **Load `/` and watch the hero load.** The rail must draw, the headline lines must stagger in, the
   slipstream must fade up last and begin looping. Under 1.2s (§7.3).
4. **Scroll the whole page once.** The rail's progress paint must track the viewport midpoint, the
   three capability accordions must auto-advance with their underline sweep, the panel vignettes
   must loop, the testimonial arrows must crossfade, and the FAQ rows must open and close. If any of
   these stopped, the grep was wrong and the change must be reverted.
5. **Re-shoot the four widths and `/design-system` and diff against step 1.** They must be identical.
   While at 360px, confirm in the console that
   `document.documentElement.scrollWidth === window.innerWidth` — prompt 17's fix must still hold.
6. **Toggle the OS reduced-motion setting and reload.** The slipstream must be static, the rail must
   paint to its final state instantly, and the Ask bar placeholder must show one static string.
   Nothing may keep moving.
7. **Open the Ask bar, type a question, and send it.** The thread must stream an answer. This is the
   only path that exercises `app/api/ask/route.ts`, whose comment was edited — the edit is inside a
   comment block and cannot change behaviour, but the route is the newest code in the repo and one
   send is cheap. Requires `GEMINI_API_KEY` in `.env.local`; if it is absent, say so in the report
   rather than claiming the step passed.
8. **Re-read the edited sections of `AGENTS.md` end to end** — §3, §9, §14, §15 — as a whole, not as
   a diff. A correction that reads fine in isolation and contradicts its neighbour two lines later is
   the exact failure this prompt exists to fix.

## Decisions the human needs to make before approval

1. **File number.** This is `20`; §4's rule would make it `18`. Rename, or accept the permanent gap?
2. **The `motion` skills.** `.agents/skills/motion-framer/` and `.agents/skills/framer-motion-animator/`
   remain on disk and in `skills-lock.json` after the package is gone. This prompt leaves them
   (decision 3). Delete them instead, or leave them as unlisted tooling §3 already excludes?
3. **The duplicate prompt number 07.** `prompts/07-logo-and-proof-bands.md` (added in `ce261cd`) and
   `prompts/07-proof.md` (added later, in `63f5c14`) both carry number 07 and both describe building
   the logo band and proof band. §4 says "never overwrite, never renumber", so one of them is a
   violation, but **I cannot tell from the files or the git history which one was actually executed**,
   and deleting the wrong one destroys a record. This prompt does not touch either. How should it be
   resolved — leave both, renumber the later one, or delete a draft?
4. **Scope check on the AGENTS.md edits.** §9's tree and §14's lint bar are the two edits that add
   material rather than correct a falsehood. Confirm those are wanted, or cut them and keep this to
   strictly false → true.

## Findings deferred to later prompts

Verified, real, and deliberately not fixed here:

- **`app/design-system/` is an undocumented second route.** §1 says "Scope for now — the marketing
  landing page only. One route, `/`". `app/design-system/page.tsx` exists (with `robots: {index:
  false}`), built by prompts 01–02 as a token reference. Either §1 should acknowledge it as a
  non-public internal route or it should go. That is a scope decision, not housekeeping.
- **No regression guard for page width.** Prompt 17 closed with this and it is still true: nothing
  automated measures `scrollWidth`, so the 360/768 overflow bug survived seven prompts. It needs its
  own prompt and a decision about whether this repo wants a test runner at all — it has none.
- **The rest of the dependency list is unaudited.** `recharts`, `date-fns`, `cmdk`, `input-otp`,
  `react-day-picker`, `react-resizable-panels`, `@shadcn/react`, and `shadcn` are declared; whether
  each is reachable from `/` was not checked. §10's stocked-library framing may justify all of them.
  A real audit needs to trace `components/ui/` usage and is a prompt of its own.
- **The `motion` npm package and `components/motion/` share a name.** Harmless now that the package
  is gone, and renaming a directory §9 mandates is a bigger change than the confusion warrants.
  Noted only so the next reader is not surprised.
