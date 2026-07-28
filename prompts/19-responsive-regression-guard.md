# 19 — A responsive regression guard for the §12 no-horizontal-scroll rule

## Goal

Add one script that loads `/` at 360, 768, 1024, and 1440 and asserts the page is not wider than
the viewport, so the class of bug fixed in prompt 17 cannot ship again unnoticed.

**This is infrastructure, not product.** §13 forbids unrequested features, so it has to earn its
place on the record, not on principle:

| | |
| --- | --- |
| When the bug entered | prompt 10 (`components/sections/route.tsx`, the Route grid) |
| When it was found | prompt 17 |
| How long it survived | roughly a week and seven prompts, every one of which ran §14's checks |
| What it looked like at 768px | `scrollWidth` 795 against a 768 viewport — **27px** |
| Why §14 missed it | §14's responsive review is a human step at four widths, and 27px of sideways travel on a 1300px-tall page is not visible by eye |
| What in the repo measures page width | nothing |

27px is the number that matters. The 360px case was 376px over and would have been caught
eventually by anyone who looked; the 768px case is the one that hides, and it is the one a machine
finds for free. Typecheck and lint both passed for the entire week the page scrolled sideways,
because neither of them has any idea what a viewport is.

**Out of scope, deliberately:** a test runner, a CI pipeline, a pre-commit hook, visual/screenshot
diffing, any assertion about the Ask bar's behaviour or the `/api/ask` route, and every other §12
floor item beyond page width (see decision 6). No component, no copy, no token, no motion changes.
The page's rendered output must be byte-identical before and after this prompt.

## Skills and docs read

- `AGENTS.md` §12 (the rule being guarded, verbatim: "Responsive from 360px up. Test 360, 768,
  1024, 1440. No horizontal page scroll ever — wide content scrolls inside its own container"),
  §13 (no `any`, centralise magic numbers, no unrelated refactors), §14 (the standing checks and
  the lint bar), §9 (file layout — note that it has no slot for scripts, which is decision 3),
  §4 (this prompt's required sections).
- `prompts/17-route-min-width-overflow.md` in full — the bug, its measurements, and its closing
  "Open questions this raises for later prompts", which sketches exactly this guard and flags the
  test-runner decision as unresolved. This prompt is that sketch, costed.
- **No Next.js doc was read, and none is needed.** This adds no route, no config, no font, no
  image, no metadata, and no server/client boundary. It adds a script that drives a browser
  against the app the framework already builds. Reading a routing guide to justify a `scrollWidth`
  comparison would be theatre — the same reasoning prompt 17 gave for the same reason.
- **No GSAP skill was read.** Nothing animates. The guard *observes* the page's motion state,
  which is decision 5, but it creates none.
- The `shadcn` skill is not involved: no primitive is touched.

**Not read, and stated rather than implied:** Playwright's own documentation was not consulted for
this prompt; the API shape below (`chromium.launch`, `browser.newContext({ viewport, reducedMotion })`,
`page.goto`, `page.evaluate`) is from memory and the implementer should verify it against the
installed version's types before writing the file. If any name is wrong, the types will say so.

## Existing code inspected

- **`package.json`** — scripts are `dev`, `build`, `start`, `lint`, `typecheck`. **No test runner,
  no CI config, no `test` script, no hook manager, no Playwright.** Dev dependencies are exactly
  the Tailwind/ESLint/TypeScript floor. This repo has never had a test.
- **`tsconfig.json`** — `include` is `["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts",
  ".next/dev/types/**/*.ts", "**/*.mts"]`. Two things follow, and both shape decision 3: a script
  written in TypeScript anywhere in the repo is already covered by `npm run typecheck` for free,
  and **`**/*.mts` is already listed**, which is a ready-made slot for an ES-module script that
  the repo's existing config anticipates. `strict: true`, so §13's no-`any` rule is enforced by
  the compiler, not by review.
- **`eslint.config.mjs`** — flat config, `eslint-config-next` core-web-vitals + typescript, with
  ignores for `.next/`, `out/`, `build/`, `next-env.d.ts`. A new script file is not ignored.
- **`node -v` → v26.5.0.** Node has run TypeScript directly via type stripping since v22.6 and
  does so without a flag from v23 on, so a `.mts` script needs **no ts-node, no tsx, no build
  step, and no bundler**. This is the single fact that makes decision 3 cheap.
- `components/sections/route.tsx:29` and `components/sections/embed-panel.tsx:21` — the two
  `min-w-0` classes prompt 17 added, and the comment at `route.tsx:25-27` explaining the automatic
  minimum size. **`embed-panel.tsx:21` is the negative test's target** (acceptance criterion 1).
- `components/sections/copy-embed.tsx:86` — the `<pre className="overflow-x-auto …">` whose
  existing, correct `overflow-x: auto` was being defeated. It is what the guard must *not* flag:
  content wider than its box, correctly clipped, is the §12-compliant outcome, not a failure.
- `.gitignore` — `/coverage` is already ignored; nothing else here needs adding.
- `~/.cache/ms-playwright` exists on this machine and holds `chromium-1234`,
  `chromium_headless_shell-1234`, and `ffmpeg-1011`, each marked `INSTALLATION_COMPLETE`. **It is
  not this repo's** — nothing in `package.json` or `node_modules` refers to Playwright. It is the
  agent harness's cache and it is a fact about one developer's machine, not about the project.
  Decision 2 turns on that distinction.

## Decisions and assumptions

### 1. The assertion is `scrollWidth === innerWidth`, plus an unclipped-spill walk

Two checks per width, both cheap, and the second is the one worth having:

**a. The gate.** `document.documentElement.scrollWidth === window.innerWidth`. This is the literal
§12 rule and it is what failed. Measured on the running dev server for prompt 17:

| Viewport | Before the fix | After the fix |
| --- | --- | --- |
| 360 | 736 | 360 |
| 768 | 795 | 768 |
| 1024 | 1024 | 1024 |
| 1440 | 1440 | 1440 |

So this assertion is known to distinguish the broken page from the fixed one at two widths, and
known not to false-positive at the other two. That is the entire value proposition.

**b. The diagnosis.** For every element whose bounding box extends past the viewport, walk its
ancestors and check whether any has a computed `overflow-x` other than `visible`. Report the ones
where none does. This was run by hand at all four widths after prompt 17's fix and returned **zero
unclipped spills**, so it can be asserted empty today, not merely printed.

It is strictly stronger than (a) and it is the reason to bother: (a) says *the page is 27px too
wide*, which leaves the reader to find the element. (b) says *this `<div class="…">` sticks out and
nothing clips it*, which is the actual answer. It also catches the near-miss case (a) cannot see —
an element spilling past the right edge inside a container that happens to be exactly viewport-wide.

Both run in one `page.evaluate`. Tolerance is 1px on (b) to absorb sub-pixel layout; (a) is exact,
because it is integer by definition.

**Known risk, stated rather than discovered:** (b) is the more brittle of the two. Fixed-position
elements — the Ask bar — and transformed decorative layers are the likely sources of noise. It
passes clean today at all four widths, so it ships as an assertion; **if it proves noisy in
practice, demote it to a printed warning and keep (a) as the gate.** Do not add an allowlist of
element selectors to keep it quiet — an allowlist is how a guard stops meaning anything.

### 2. `playwright-core`, not `playwright`, and the browser stays out of the repo

The dependency weight is the real decision here, and the two packages differ in exactly the way
that matters:

| | `playwright` | `playwright-core` |
| --- | --- | --- |
| Install size | small package, **plus a ~130MB Chromium download on every `npm ci`** | small package, no download |
| Works out of the box | yes | only if a compatible browser is already on the machine |
| Cost imposed on a fresh clone | a browser download nobody asked for | none |
| Cost imposed on a future CI | a browser download per run unless cached | must install a browser explicitly |

For a marketing site with one route and one assertion, making every install of this repo pull a
browser is out of proportion. **Recommendation: `playwright-core` in `devDependencies`**, launched
against a browser found on the machine, with the resolution order: an explicit `PLAYWRIGHT_CHROMIUM`
path if set, else Playwright's default cache lookup, else a clear failure.

**When no browser is found the script exits non-zero with the one-line fix**
(`npx playwright install chromium`) — it does **not** skip. A guard that silently skips is worse
than no guard, because it reports success. This is the whole reason to state it as a decision.

I have **not verified** that `playwright-core` resolves the `chromium_headless_shell-1234` build
already sitting in `~/.cache/ms-playwright` — the version numbering there is unfamiliar and I
installed nothing. If it does not resolve, the implementer runs `npx playwright install chromium`
once, locally, and says so in the report. That is a one-time local cost, not a repo cost.

**If the human wants this to gate CI later**, the answer changes to `playwright` in
`devDependencies` and a cached browser step. That is a different prompt, made after a CI exists.

### 3. A standalone script and an npm script — no test runner

The options, honestly compared:

| Option | What it costs | What it buys here |
| --- | --- | --- |
| **Standalone `.mts` script + npm script** | one file, one dependency, one line in `package.json` | exactly the assertion, and nothing to learn |
| `vitest` + a browser dep | a runner, a config file, a globals/environment decision, ~10 transitive additions | reporters, watch mode, parallelism, fixtures — for four assertions |
| `@playwright/test` | a runner, `playwright.config.ts`, a `test-results/` directory, its own reporter and trace tooling | a browser-test framework's full surface, plus retries and traces we have no use for |

**Recommendation: the standalone script.** Adopting a runner is a commitment to a testing strategy
this repo has not made and this prompt is not the place to make it. Four assertions across one
route do not need parallelism, retries, or fixtures, and the moment a runner exists the pressure
to fill it with tests arrives with it — which is scope creep with a config file attached.

The script goes at **`scripts/check-responsive.mts`**:

- `.mts` because `package.json` has no `"type": "module"`, so `.mts` states ESM unambiguously
  rather than relying on Node's syntax detection — and because `tsconfig.json` already includes
  `**/*.mts`, so `npm run typecheck` covers it on day one with no config change.
- `scripts/` because §9's layout has no slot for this and inventing one under `lib/` would be
  worse: `lib/` is application code that ships, and this never ships.
- Wired as `"check:responsive"` in `package.json`. Namespaced with a colon so a future
  `check:a11y` reads as a sibling rather than as a rename.

**I did not verify that ESLint's flat config picks up `.mts` files** — `eslint-config-next` may or
may not list that extension in its `files` globs. The implementer must check: if `npm run lint`
does not lint the new file, say so in the report rather than assuming coverage. Typecheck coverage
is certain; lint coverage is not.

### 4. The script owns the server, and refuses to reuse one

The false-pass path is specific and worth naming: a developer leaves `npm run dev` running from
before their change, the guard connects to it, measures stale output, and passes. That is a guard
that lies, which is worse than the week of silence it was written to end.

So:

- The script **spawns its own server** on a dedicated port — **3210**, not 3000, so it never
  collides with a `npm run dev` the developer has open and never inherits one.
- It **probes the port first**. If anything answers on 3210, it exits non-zero saying the port is
  occupied. It does not adopt the listener.
- It runs against **`next start`**, not `next dev`, and requires a build to exist. Production
  output is what ships; dev serves an error overlay, dev-only attributes, and unminified CSS, and
  the guard should not be measuring any of them. The npm script therefore chains the build:
  `"check:responsive": "next build && node scripts/check-responsive.mts"`.
- It kills the child on every exit path, including the failure path and `SIGINT`.
- It accepts `--url <origin>` to point at an already-running server, for the fast local loop. That
  flag is the escape hatch for a human who knows what their server is serving; it is not the
  default, precisely because the default must not be able to lie.
- **No `GEMINI_API_KEY` is needed.** §13 has the Ask route read its key inside the handler, so the
  build succeeds without one and the page loads without one. The guard never calls `/api/ask`.
- **Placeholder markers stay at their default (visible).** §11.1 renders a `PLACEHOLDER` chip
  unless `NEXT_PUBLIC_SHOW_PLACEHOLDER_MARKERS === "false"`, and the chip adds width. The guard
  must measure the wider of the two states, so it must not set that variable.

### 5. Reduced motion on, and a scroll pass before the second measurement

Two things about *when* to measure, both consequences of §7:

**Launch the context with `reducedMotion: "reduce"`.** Not for accessibility coverage — for
determinism. §7.2 puts every ambient and scroll-linked animation behind `gsap.matchMedia()` with a
reduce branch in which the slipstream is a static gradient, the rail paints instantly, and
entrances are plain opacity fades. Geometry is therefore final the moment the page loads, with no
in-flight transforms. In the motion-on branch a mid-entrance transform can transiently widen the
document, and the guard would either flake or need an arbitrary settle delay tuned to the longest
tween. A transient overflow during a 0.6s entrance is not what §12 is about; a settled page 27px
too wide is. **Assumption, stated:** Playwright's `reducedMotion` context option emulates the
media feature such that `gsap.matchMedia()` takes the reduce branch. Verify it — the cheap check
is that the rail renders in its painted state immediately.

**Measure twice: once after load, once after a full scroll to the bottom.** §7.3's second and
third orchestrated moments are scroll-linked, and content whose layout only settles after a
`ScrollTrigger` fires would be missed by a load-time measurement alone. Scroll in viewport-height
steps to `document.body.scrollHeight`, then re-measure. Both measurements must pass. Wait on
`document.fonts.ready` before the first — §6.2 loads three faces through `next/font` and metrics
before they land are not the metrics that ship.

**A fresh page per width**, via a new context, not a `setViewportSize` on the same page. The
layout has `lg:` breakpoints and `gsap.matchMedia()` bindings; resizing a live page can leave
either in a state a real visitor never sees, in both directions.

### 6. Tight scope: page width only, and here is what is being left out

The temptation is real and should be resisted in this prompt. Every §12 item below is machine-
checkable and none of them is this bug:

| Deferred check | Cost | Why not now |
| --- | --- | --- |
| Exactly one `h1` | two lines, never flaky | Genuinely cheap and the most likely first addition. Left out only so this guard's failure has one unambiguous meaning: *the page is too wide*. |
| Heading order (no skipped levels) | moderate | Needs a rule for `aria-hidden` and visually-hidden headings; a judgement call per finding. |
| Visible focus ring on every interactive element | high, and flaky | Requires tabbing the whole page and comparing computed outline against a baseline. A real project, not a rider. |
| `next/image` with explicit dimensions | low | There is currently no `next/image` on the page — `embed-panel.tsx` is markup, not a screenshot. Nothing to assert against yet. |
| Text contrast ≥ 4.5:1 | moderate, and noisy | Overlaps §6.1, which already fixes the tokens and states their ratios. A checker would re-derive what the design system asserts. |
| No-JS readability (§12) | moderate | A second context with JavaScript disabled. A good follow-up, and a different question from width. |

**Recommendation: ship (a) and (b) from decision 1 and nothing else.** Revisit the `h1` count as
prompt 20-something, once this guard has been seen to fail and then pass at least once in anger.

### 7. Whether AGENTS.md §14 should name the new check

The guard is worthless if nobody runs it. §14 is the list every implementation prompt runs, so the
honest thing is to add one line there — but **AGENTS.md is the project's highest-priority guidance
and this prompt must not edit it silently.** Surfacing it is the point of this decision.

**Recommendation, pending the human's approval:** add to §14 —

> `npm run check:responsive` — required for any prompt that changes layout, spacing, a section's
> markup, or the type scale. Not required for copy-only, backend-only, or motion-only changes.

...and strike the "Nothing guards this" bullet from prompt 17's open questions by noting the
resolution in §15. Conditional rather than universal because it runs a production build and takes
tens of seconds, and a check that is mandatory on every trivial change gets routed around.

## Files likely to change

| File | Change |
| --- | --- |
| `scripts/check-responsive.mts` | **new** — the whole guard, one file |
| `package.json` | edit — add `"check:responsive"` to `scripts`, add `playwright-core` to `devDependencies` |
| `package-lock.json` | edit — generated by the install; do not hand-edit |
| `AGENTS.md` | edit — §14 and §15, **only if decision 7 is approved**; otherwise untouched |

Explicitly **not** modified: every file under `app/`, `components/`, `lib/`, and `hooks/`;
`app/globals.css`; `tsconfig.json`; `eslint.config.mjs`; `next.config.ts`; `.gitignore`;
`components.json`. In particular `components/sections/route.tsx`, `embed-panel.tsx`, and
`copy-embed.tsx` are read by this prompt and edited only *temporarily*, during the negative test,
and must be restored — acceptance criterion 8 is the proof.

No new directory other than `scripts/`. No config file. No `test-results/`, no `coverage/`, no
snapshot directory, so `.gitignore` needs no entry.

## Implementation requirements

- **One file.** If `scripts/check-responsive.mts` passes ~150 lines, the scope grew — stop and say
  so rather than splitting it, because a two-file guard for one assertion is the runner argument
  arriving through the back door.
- **No `any`** (§13). `page.evaluate`'s return type is explicit. `strict` is on and will enforce it.
- **Centralise the magic numbers** (§13) as named module constants: the four widths as one
  `const WIDTHS = [360, 768, 1024, 1440] as const`, the viewport height, the port, the spill
  tolerance, the server-ready timeout. No literal appears twice.
- The widths come from §12 and are not to be "improved" — no 320, no 1920, no extra breakpoints.
  Matching §12 exactly is what lets the guard be described in one sentence.
- **Exit codes:** `0` all widths clean; `1` any assertion failed; `2` the guard could not run
  (no browser, port occupied, server never became ready, navigation failed). A failure to run must
  never be reportable as a pass, and must be distinguishable from a real failure at a glance.
- **Output.** On success, one line per width, the measured and expected widths, and a final
  summary. On failure, the failing width first, then the offending elements from the spill walk —
  tag name, `class` attribute truncated to something readable, and measured right edge. The
  developer should be able to open the named file without re-deriving anything. Print all four
  widths' results before exiting; do not bail on the first failure, because two failures with one
  cause are useful information and one at a time is three more runs.
- **No output is written to disk.** No report file, no screenshot, no trace. Terminal only.
- **Server lifecycle is airtight.** Poll the origin until it answers or the timeout expires; kill
  the child in a `finally` and on `SIGINT`; never leave a process on 3210.
- Safe error handling on everything async (§13) — no swallowed promise, no bare `catch {}`.
- The script never modifies the app. It is read-only against a running server.
- Comment the *why*, in the repo's existing register: why `min-width: auto` is the failure mode
  being guarded, why reduce is on, why the server is not reused. Do not comment what
  `scrollWidth` is.

## Visual spec

**None — this prompt adds no UI.** Leaving the section blank would hide a real question, so the
answer stated plainly: nothing renders, no token is read, no class is added, and the page's output
is byte-identical before and after. If anything about the page's appearance changes, the
implementation went wrong and acceptance criterion 6 catches it.

The one surface this does produce is the **terminal output**, and it is designed under §11 like
any other copy the project owns: active voice, says what happened and what to do next, no
apology, no mood. `Port 3210 is in use. Stop the process on it, or pass --url to measure a server
you already trust.` — not `Error: EADDRINUSE`. `No Chromium found. Run: npx playwright install
chromium` — not a stack trace. A failure reads as an instruction.

## Motion spec

**None.** No tween, no timeline, no `ScrollTrigger` is created, retimed, or removed, and §7.3's
three orchestrated moments are untouched.

The guard *observes* motion state in two ways, both stated in decision 5 and neither of them an
animation: it runs the page in its `prefers-reduced-motion: reduce` branch for deterministic
geometry, and it drives a scroll to the bottom so scroll-linked layout has fired before the second
measurement. Programmatic scrolling is instrumentation, not motion.

## Accessibility requirements

No user-facing surface, so nothing to make accessible — but the rule being guarded is itself an
accessibility rule and that is worth being explicit about:

- A page that scrolls horizontally at 360px is a **reflow failure** (WCAG 1.4.10) for anyone at
  that width, and equally for a desktop user at 400% zoom, where 1440px reflows to roughly the
  360px case. The guard's four widths are a proxy for a zoom axis nobody tests by hand.
- Running the page in the reduce branch means the guard exercises the §7.2 fallback on every run.
  It asserts nothing about it, but a reduce branch that throws would surface here rather than in
  front of a user who needs it.
- The guard must not "fix" a failure by making content wrap or shrink. §12's remedy is that wide
  content scrolls **inside its own container**, and `copy-embed.tsx`'s `<pre>` stays keyboard-
  scrollable, exactly as prompt 17 required.

## Acceptance criteria

**1. The negative test — the criterion that decides whether this prompt succeeded.**
A guard that has never been seen to fail is not known to work; it is only known to run. So:

- Temporarily delete `min-w-0` from `components/sections/embed-panel.tsx:21`.
- Run `npm run check:responsive`.
- It must **exit 1** and fail at **360 and 768**, reporting widths in the neighbourhood of **736
  and 795** against 360 and 768 (prompt 17's measured figures), while **1024 and 1440 pass**.
- The spill walk must **name the embed panel** as unclipped, not merely report that the page is
  wide.
- Restore the class. Re-run. It must exit 0 at all four widths.
- **Paste both outputs — the failing one and the passing one — into the completion report.** A
  report containing only the passing run does not demonstrate anything and does not satisfy this
  criterion.

2. `npm run check:responsive` exits 0 on the current `main` at all four widths, and the spill walk
   reports zero unclipped elements — matching the by-hand result recorded in this prompt.
3. Running it while `npm run dev` is up on port 3000 still works and still measures its own server.
   Running it with something already on 3210 exits **2** with the message from the visual spec, not
   a stack trace, and not a pass.
4. With no browser resolvable, it exits **2** and names the install command. It does not skip and
   it does not exit 0. (Simulate with an invalid `PLAYWRIGHT_CHROMIUM` path.)
5. No server process survives the run, on any path — success, assertion failure, or `SIGINT`
   mid-run. Confirm with `lsof -i :3210` after each.
6. The rendered page is unchanged: the diff touches no file under `app/`, `components/`, `lib/`,
   or `hooks/`.
7. The diff is confined to the "Files likely to change" table, and `AGENTS.md` appears in it only
   if decision 7 was approved.
8. `git status` is clean of the negative test's edit — `components/sections/embed-panel.tsx` is
   byte-identical to `main`.
9. `grep -rn "placeholder: true" lib/copy/` still returns **seventeen** hits.
10. Typecheck and build clean; **no new lint error** against the bar below. The report states
    plainly whether ESLint actually linted `.mts` (decision 3) rather than assuming it did.

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
npm run check:responsive
grep -rn "placeholder: true" lib/copy/
```

**The lint bar:** exactly three pre-existing errors, one each in `components/layout/wordmark.tsx`,
`components/ui/carousel.tsx`, and `hooks/use-mobile.ts` — the same three files, not merely the same
count. Any new error is a failure.

`npm run build` is listed separately even though `check:responsive` chains it, because a build
failure inside the guard must not be reported as a guard failure.

**These figures were not re-verified while writing this prompt** — no check was run, nothing was
installed, and the dev server was not started. The 17 placeholder hits and the three-file lint bar
are carried forward from prompt 17 and from a `grep` of `lib/copy/` alone. Re-establish both at
implementation time before treating them as the baseline.

## Manual review steps

```bash
npm install                  # brings in playwright-core
npx playwright install chromium   # once, only if the guard reports no browser
```

1. **Run it clean.** `npm run check:responsive`. Read the output as a stranger would: does it say
   which widths passed, and what it measured? If the output is a bare "OK", the §11 pass on the
   terminal copy was skipped.
2. **Break it on purpose** — the negative test in acceptance criterion 1. This is the step that
   matters; do not skip it because the passing run looked convincing.
3. **Break it a second, different way.** Add `w-[2000px]` to any element in
   `components/sections/route.tsx`, run, confirm the spill walk names *that* element and not the
   embed panel, then remove it. The point is that the diagnosis follows the bug rather than
   pattern-matching prompt 17's.
4. **Occupy the port.** Start something on 3210, run the guard, confirm exit 2 and the written
   message.
5. **Kill it mid-run** with `Ctrl-C`, then `lsof -i :3210`. Nothing must be listening.
6. **Point it at a live server:** `npm run dev` on 3000, then the guard with
   `--url http://localhost:3000`. Confirm it measures and does not spawn a second server.
7. **Confirm reduce actually applied** (decision 5's stated assumption): with the guard's browser
   open non-headless, or by a one-off Playwright snippet, check the rail renders in its painted
   state at load. If it animates, the reduce emulation is not reaching `gsap.matchMedia()` and
   decision 5's determinism argument does not hold — report that rather than papering over it with
   a settle delay.
8. **`git diff` before committing.** No `min-w-0` missing, no `w-[2000px]` left behind, no
   stray script.

## Notes on this prompt

- **The number.** §4 says take the next number after the highest existing; the highest in
  `prompts/` is **17** and **18 does not exist**. This file was requested as 19, so 19 it is — the
  gap is recorded here so nobody later reads it as a lost prompt.
- **What was not read:** any file under `node_modules/next/dist/docs/` (no framework code here),
  any GSAP skill (no motion), prompts 01–16 other than 16's opening for voice, and Playwright's
  documentation. The Playwright API names in this prompt are from memory and are to be checked
  against the installed types.
- **What was not verified:** that `playwright-core` resolves the browser already cached at
  `~/.cache/ms-playwright`; that ESLint's flat config lints `.mts`; that Playwright's
  `reducedMotion` option reaches `gsap.matchMedia()`. Each is called out at its decision and each
  has a stated fallback.
- **What was verified by experiment, previously, on the running dev server:** the four scrollWidth
  figures before and after prompt 17's fix, and the zero-unclipped-spill result at all four widths
  after it. Those are the two facts this whole prompt rests on.

## Open questions this raises for later prompts

- **There is still no CI.** This guard runs when a human types it. Decision 7's §14 line is the
  only thing making that likely, and it is a convention, not a mechanism.
- **Only `/` is measured.** There is one route today (§1), so the loop over routes is a `for` over
  a one-element array. When a second route lands, the array grows — and the guard should be
  extended in that route's own prompt, not retrofitted later.
- **The rest of the §12 floor** — the deferred table in decision 6, most cheaply the `h1` count.
- Unchanged and still open from §15: the durable rate-limit store, Ask bar multi-turn, the spend
  ceiling, swapping the placeholders, the closing-CTA visual, the Glidda mark, and the unused
  `motion` package.
