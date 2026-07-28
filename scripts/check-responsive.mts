import { spawn, type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"

import { chromium, type Browser } from "playwright-core"

/**
 * Guards §12's "no horizontal page scroll ever" at the four widths §12 names.
 *
 * It exists because the failure it catches is invisible. A grid item's default `min-width: auto`
 * let one unbreakable 634px token size its track wider than the viewport, so the `overflow-x: auto`
 * that should have contained it never engaged. At 768px the page was 795px wide — 27px of sideways
 * travel on a 1300px-tall page, which no one sees by eye. It survived seven prompts and a week of
 * §14 checks, because typecheck and lint have no idea what a viewport is.
 *
 * Run with `--url <origin>` to measure a server you already trust. Without it the script builds
 * and starts its own, because a guard that can measure a stale server is a guard that can lie.
 */

const WIDTHS = [360, 768, 1024, 1440] as const
const VIEWPORT_HEIGHT = 900
/** Not 3000: a `npm run dev` the developer already has open must never be adopted or collided with. */
const PORT = 3210
/** Sub-pixel layout rounds; 1px of it is not a §12 failure. The page-width check below is exact,
 *  because `scrollWidth` is integer by definition. */
const SPILL_TOLERANCE = 1
const SERVER_READY_TIMEOUT_MS = 60_000
const SERVER_POLL_INTERVAL_MS = 250

type Spill = { tag: string; className: string; right: number }
type Measurement = { scrollWidth: number; innerWidth: number; spills: Spill[] }

function fail(message: string): never {
  console.error(message)
  process.exit(2)
}

async function isPortFree(origin: string): Promise<boolean> {
  try {
    await fetch(origin, { signal: AbortSignal.timeout(1000) })
    return false
  } catch {
    return true
  }
}

async function waitForServer(origin: string, child: ChildProcess): Promise<void> {
  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (child.exitCode !== null) fail(`The server exited with code ${child.exitCode} before it was ready.`)
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(2000) })
      if (response.ok) return
    } catch {
      // Not up yet. Poll again until the deadline.
    }
    await new Promise((resolve) => setTimeout(resolve, SERVER_POLL_INTERVAL_MS))
  }
  fail(`The server did not answer on ${origin} within ${SERVER_READY_TIMEOUT_MS / 1000}s.`)
}

/** Measures once, and reports both the page width and — the useful half — which elements stick out
 *  with nothing clipping them. The second answers *where*, which the first leaves you to find. */
async function measure(browser: Browser, width: number, origin: string): Promise<Measurement[]> {
  // A fresh context per width rather than a resize: the layout has `lg:` breakpoints and
  // `gsap.matchMedia()` bindings, and resizing a live page can leave either in a state no real
  // visitor ever sees.
  //
  // Reduce is on for determinism, not for coverage. §7.2 puts every ambient and scroll-linked
  // animation behind a reduce branch in which geometry is final at load, so there is no
  // in-flight transform to transiently widen the document and no settle delay to tune.
  const context = await browser.newContext({
    viewport: { width, height: VIEWPORT_HEIGHT },
    reducedMotion: "reduce",
  })

  try {
    const page = await context.newPage()
    await page.goto(origin, { waitUntil: "load" })
    // Three faces load through `next/font`; metrics taken before they land are not the ones that ship.
    await page.evaluate(() => document.fonts.ready)

    const read = () =>
      page.evaluate<Measurement, number>((tolerance) => {
        const limit = window.innerWidth + tolerance
        const clipped = (el: Element) => {
          for (let p = el.parentElement; p; p = p.parentElement) {
            if (getComputedStyle(p).overflowX !== "visible") return true
          }
          return false
        }
        const spills = []
        for (const el of document.querySelectorAll("*")) {
          const rect = el.getBoundingClientRect()
          if (rect.width === 0 || rect.height === 0) continue
          if (rect.right <= limit || clipped(el)) continue
          // Only the outermost offender: every child of a spilling element also spills, and a
          // list of forty of them names the symptom forty times and the cause never.
          const parent = el.parentElement
          if (parent && parent.getBoundingClientRect().right > limit && !clipped(parent)) continue
          spills.push({
            tag: el.tagName.toLowerCase(),
            className: el.getAttribute("class")?.slice(0, 80) ?? "",
            right: Math.round(rect.right),
          })
        }
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          spills,
        }
      }, SPILL_TOLERANCE)

    const atLoad = await read()

    // §7.3's scroll-linked moments have not fired yet at load, and layout that only settles after
    // a ScrollTrigger would be missed by a load-time measurement alone.
    await page.evaluate(async () => {
      const step = window.innerHeight
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y)
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      }
      window.scrollTo(0, 0)
    })
    const afterScroll = await read()

    return [atLoad, afterScroll]
  } finally {
    await context.close()
  }
}

function report(width: number, phase: string, m: Measurement): boolean {
  const wide = m.scrollWidth !== m.innerWidth
  const spilled = m.spills.length > 0
  if (!wide && !spilled) {
    console.log(`  ${phase.padEnd(12)} ${m.scrollWidth}px wide, viewport ${m.innerWidth}px — clean`)
    return true
  }
  if (wide) {
    console.error(
      `  ${phase.padEnd(12)} page is ${m.scrollWidth}px against a ${m.innerWidth}px viewport ` +
        `— ${m.scrollWidth - m.innerWidth}px of horizontal scroll`
    )
  }
  for (const spill of m.spills) {
    console.error(`    <${spill.tag} class="${spill.className}"> reaches ${spill.right}px, nothing clips it`)
  }
  return false
}

async function main(): Promise<void> {
  const urlFlag = process.argv.indexOf("--url")
  const externalOrigin = urlFlag === -1 ? null : process.argv[urlFlag + 1]
  if (urlFlag !== -1 && !externalOrigin) fail("--url needs an origin, for example --url http://localhost:3000")

  const origin = externalOrigin ?? `http://localhost:${PORT}`
  let child: ChildProcess | null = null
  let browser: Browser | null = null

  const shutdown = () => {
    if (child && child.exitCode === null) child.kill("SIGTERM")
  }
  process.on("SIGINT", () => {
    shutdown()
    process.exit(2)
  })

  try {
    // `playwright-core` ships no browser — that is the point of choosing it over `playwright`, so
    // that a fresh clone does not pull ~130MB nobody asked for. It also means the path it hands
    // back may not exist, so check rather than discover it at launch. A guard that cannot run must
    // say so and stop; skipping would report success.
    let executablePath: string
    try {
      executablePath = process.env.PLAYWRIGHT_CHROMIUM || chromium.executablePath()
    } catch {
      fail("No Chromium found. Run: npx playwright install chromium")
    }
    if (!existsSync(executablePath)) {
      fail(`No Chromium at ${executablePath}. Run: npx playwright install chromium`)
    }

    if (!externalOrigin) {
      if (!(await isPortFree(origin))) {
        fail(`Port ${PORT} is in use. Stop the process on it, or pass --url to measure a server you already trust.`)
      }
      // `next start`, not `next dev`: production output is what ships, and dev serves an error
      // overlay, dev-only attributes, and unminified CSS the guard has no business measuring.
      child = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore" })
      child.on("error", (error) => fail(`Could not start the server: ${error.message}`))
      await waitForServer(origin, child)
    }

    browser = await chromium.launch({ executablePath })
    console.log(`Measuring ${origin} at ${WIDTHS.join(", ")}px\n`)

    let passed = true
    for (const width of WIDTHS) {
      console.log(`${width}px`)
      const [atLoad, afterScroll] = await measure(browser, width, origin)
      // Every width is reported before exiting: two failures with one cause is useful, and one at
      // a time is three more runs.
      passed = report(width, "at load", atLoad) && passed
      passed = report(width, "after scroll", afterScroll) && passed
    }

    console.log(passed ? "\nClean at all four widths." : "\nHorizontal scroll found. See above.")
    process.exitCode = passed ? 0 : 1
  } finally {
    if (browser) await browser.close()
    shutdown()
  }
}

await main()
