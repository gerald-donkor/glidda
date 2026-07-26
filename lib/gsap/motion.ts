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
