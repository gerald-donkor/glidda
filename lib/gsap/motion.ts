/**
 * Shared motion constants (§7.1, §13). These mirror the CSS motion primitives in
 * `app/globals.css` so a duration or an ease is written once for the whole codebase.
 */

export const DURATION = {
  /** Hover and state changes. Matches --duration-micro. */
  micro: 0.2,
  /** Entrances. Matches --duration-entrance. */
  entrance: 0.6,
} as const

export const EASE = {
  entrance: "power2.out",
  loop: "power1.inOut",
  arrested: "power3.out",
  /** Scrubbed tweens must map linearly to scroll. */
  linear: "none",
} as const

/** Entrance stagger. Never applied to more than six items (§7.1). */
export const STAGGER = 0.06

/**
 * The slipstream's three drifting layers (§6.3, §7.1). One xPercent tween per layer.
 */
export const SLIPSTREAM = {
  /**
   * Three layer periods, seconds. Deliberately not multiples of each other, so the layers only
   * re-align every few minutes and the texture never visibly repeats. Inside §7.1's 8–20s
   * ambient window.
   */
  durations: [20, 15.5, 11],
} as const

/**
 * The hero load (§7.3 #1). One budget, in seconds, shared by the hero's timeline and the Rail's
 * entrance so the two read as one moment. Total 1.10s, inside §7.3's 1.2s.
 */
export const HERO = {
  /** One viewport of cover retreating, from t=0. */
  railDraw: 0.7,
  /** The first headline line starts here; the second at +STAGGER. */
  lines: 0.2,
  sub: 0.38,
  ctas: 0.44,
  /** + DURATION.entrance = 1.10s. */
  band: 0.5,
  /** px, the entrance's y offset. Dropped to 0 in the reduced-motion branch (§7.2). */
  rise: 24,
} as const

/**
 * The three capability sections (§8, row 8; §7.3 #3).
 */
export const CAPABILITY = {
  /** Accordion dwell per row, seconds. The underline's tween duration *is* the timer (§7.1), so
   *  there is no second source of truth and no setTimeout racing a tween. */
  dwell: 5,
  /** Row-body crossfade. */
  swap: DURATION.micro,
  /** px the row body rises through as it swaps in. */
  swapRise: 4,
  /** px of scrubbed carriage along the rail (§6.4). Small enough to read as the panel being
   *  carried by the line rather than as parallax decoration. */
  drift: 32,
  /** One full vignette scene cycle, seconds — two scenes, so each holds for about half of it.
   *  Inside §7.1's 8–20s ambient window, and deliberately coprime with SLIPSTREAM.durations so
   *  the panel's scenes and its texture never lock into a visible beat. */
  vignette: 13,
  /** px the vignette's parts rise through as their scene arrives. */
  vignetteRise: 8,
} as const

/**
 * The testimonial carousel's quote swap (§8 row 11). Not a fourth orchestrated moment (§7.3) — a
 * click-driven opacity change on one pair of elements, in the same class as `CAPABILITY.swap`.
 */
export const TESTIMONIAL = {
  /** The outgoing quote's fade. */
  out: 0.15,
  /** The incoming quote's fade. Matches --duration-micro. */
  in: DURATION.micro,
  /** Seconds after the fade-out starts that the fade-in begins. Deliberately most of the way
   *  through the out tween: two three-line quotes overlapping at half opacity ghosts, so the
   *  overlap is short enough to hide the seam and short enough not to read as a dissolve.
   *  Total 0.30s. */
  overlap: 0.1,
} as const

/**
 * Ask-bar typewriter timings, in seconds. One question costs
 * TYPE_SPEED×len + HOLD + DELETE_SPEED×len + PAUSE; three questions of ~25 characters land
 * the full cycle inside §7.1's 8–20s ambient window.
 */
export const TYPEWRITER = {
  /** Seconds per character while typing. */
  typeSpeed: 0.055,
  /** Seconds per character while deleting. */
  deleteSpeed: 0.028,
  /** Seconds the finished question stays on screen. */
  hold: 1.4,
  /** Seconds of empty field before the next question starts. */
  pause: 0.3,
} as const
