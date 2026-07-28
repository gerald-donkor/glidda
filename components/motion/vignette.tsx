"use client"

import { useRef, useState } from "react"

import { Bubble, Chip, Cursor, Field, WireCard } from "@/components/motion/vignette-parts"
import { useCapabilityRow } from "@/components/sections/capability-row-context"
import type { VignetteCopy } from "@/lib/copy/placeholder/vignette"
import {
  answersVignette,
  demosVignette,
  onboardingVignette,
} from "@/lib/copy/placeholder/vignette"
import { CAPABILITY, DURATION, EASE, STAGGER, TESTIMONIAL } from "@/lib/gsap/motion"
import { gsap, useGSAP } from "@/lib/gsap/register"

/**
 * The vignette that floats over a capability panel's slipstream (§5.1, §7.3 #3).
 *
 * Three scenes, one per accordion row, and the panel shows the scene belonging to the sentence
 * that is open. That coupling is measured, not assumed: in `ref/fullanimations.webm` the panel
 * swaps on exactly the accordion's beat and illustrates the row that just opened.
 *
 * It therefore owns no timer and no `ScrollTrigger` of its own. The accordion already holds its
 * dwell on hover, on focus, and while the section is off-screen, and the panel inherits all three
 * for free — the two can no longer drift out of sync because there is only one clock.
 *
 * At most two scenes are ever mounted: the open one, and the one it replaced, kept only so the
 * swap has something to fade out. DOM order is always [outgoing, incoming], which is what lets
 * `vignette-scene`'s `:not(:first-child)` rule supply both resting states with no JavaScript.
 *
 * Decorative and `aria-hidden` (§12) — its mock text would be noise in the accessibility tree, and
 * nothing in it is focusable. Every string comes from the flagged fixtures (§11.1); the visible
 * marker that says so is rendered outside this subtree by the section.
 */

const COPY: Record<string, VignetteCopy> = {
  answers: answersVignette,
  demos: demosVignette,
  onboarding: onboardingVignette,
}

/** Scene padding and stack gap, shared by all six scenes. */
const SCENE = "vignette-scene gap-3 p-5 sm:p-7"

function ChatScene({ copy, choice }: { copy: VignetteCopy; choice: boolean }) {
  return (
    <div className={SCENE}>
      <Chip dot className="self-start">
        {copy.status}
      </Chip>
      {copy.bubbles.map((bubble) => (
        <Bubble key={bubble.text} side={bubble.side}>
          {bubble.text}
        </Bubble>
      ))}
      {choice ? (
        <div data-item className="flex flex-wrap gap-2 self-end">
          <span className="rounded-pill bg-ink px-3 py-1.5 text-small text-paper">
            {copy.choice[0]}
          </span>
          <span className="vignette-surface rounded-pill px-3 py-1.5 text-small text-rail-muted">
            {copy.choice[1]}
          </span>
        </div>
      ) : (
        <Field placeholder={copy.fieldPlaceholder} />
      )}
    </div>
  )
}

function InfoScene({ copy }: { copy: VignetteCopy }) {
  return (
    <div className={SCENE}>
      <Chip dot className="self-start">
        {copy.infoLabel}
      </Chip>
      {copy.fields.map((field) => (
        <span
          key={field}
          data-item
          className="vignette-surface w-fit rounded-pill px-3 py-1.5 text-small text-ink"
        >
          {field}
        </span>
      ))}
    </div>
  )
}

/** A simplified wireframe of an app — sidebar and a grid of empty cards, one of them outlined,
 *  with the guide's pointer on it. Never a screenshot of a real product. */
function TourScene({ copy }: { copy: VignetteCopy }) {
  return (
    <div className={SCENE}>
      <div data-item className="vignette-surface relative flex flex-1 gap-2 rounded-card p-2">
        <span className="w-1/5 shrink-0 rounded-chip bg-ink/10" />
        <span className="grid flex-1 grid-cols-2 grid-rows-3 gap-2">
          <WireCard />
          <WireCard />
          <WireCard active />
          <WireCard />
          <WireCard />
          <WireCard />
        </span>
        <Cursor className="top-[46%] left-[62%]" />
      </div>
      <Chip dot>{copy.status}</Chip>
      <Chip solid>{copy.caption}</Chip>
    </div>
  )
}

function AgentCardScene({ copy }: { copy: VignetteCopy }) {
  return (
    <div className={SCENE}>
      <Chip dot className="self-start">
        {copy.status}
      </Chip>
      <div data-item className="vignette-surface rounded-card p-4">
        <p className="type-utility text-rail-muted">{copy.agentName}</p>
        <p className="mt-3 text-panel type-display text-ink">{copy.agentQuestion}</p>
        <p className="mt-2 text-small text-rail-muted">{copy.agentAnswer}</p>
        {/* The route's own progress, drawn as a scaleX bar — never an animated width (§7.1). */}
        <span className="mt-4 block h-1 rounded-pill bg-rail">
          <span
            data-progress
            className="block h-full origin-left rounded-pill bg-ink"
            style={{ transform: "scaleX(0.15)" }}
          />
        </span>
      </div>
      <Field placeholder={copy.fieldPlaceholder} />
    </div>
  )
}

/**
 * One scene per accordion row, in row order (§5.1's table). Onboarding's mapping mirrors the
 * reference's own sequence, and the row it ends on — following up on what stalled — is the one
 * `onboardingVignette`'s "Day 3" fixture already reads as.
 */
function scenesFor(id: string, copy: VignetteCopy) {
  if (id === "demos") {
    return [
      <TourScene key="drives" copy={copy} />,
      <ChatScene key="adapts" copy={copy} choice={false} />,
      <AgentCardScene key="hands-off" copy={copy} />,
    ]
  }
  if (id === "onboarding") {
    return [
      <TourScene key="knows" copy={copy} />,
      <AgentCardScene key="walks" copy={copy} />,
      <InfoScene key="follows-up" copy={copy} />,
    ]
  }
  return [
    <ChatScene key="in-context" copy={copy} choice={false} />,
    <ChatScene key="limits" copy={copy} choice />,
    <InfoScene key="thread" copy={copy} />,
  ]
}

export function Vignette({ capability }: { capability: "answers" | "demos" | "onboarding" }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const copy = COPY[capability]
  const { openIndex } = useCapabilityRow()

  // The scene that is leaving, kept mounted only until the next swap. Derived from `openIndex`
  // during render rather than in an effect, so the outgoing node is present in the same commit
  // the incoming one arrives in and the crossfade never starts a frame late.
  const [shown, setShown] = useState({ previous: -1, current: openIndex })
  if (shown.current !== openIndex) {
    setShown({ previous: shown.current, current: openIndex })
  }

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const scenes = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".vignette-scene"))
      const incoming = scenes.at(-1)
      const outgoing = scenes.length > 1 ? scenes[0] : null
      if (!incoming) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // §7.2: the row still advances and the scene still swaps, at identical timing. Only the
          // rise is dropped and the progress bar is set rather than swept — nothing is frozen
          // mid-tween and nothing keeps moving.
          const reduced = context.conditions?.reduced === true

          const timeline = gsap.timeline()

          if (outgoing) {
            timeline.to(outgoing, { autoAlpha: 0, duration: DURATION.micro }, 0)
          }

          timeline.fromTo(
            incoming,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: DURATION.entrance, ease: EASE.entrance },
            // The same overlap the carousel's quote swap uses: short enough to hide the seam,
            // short enough that the panel is never empty between two scenes.
            TESTIMONIAL.overlap,
          )

          // Opacity is the scene's, never also the parts' — two fades multiply into a dimmer
          // mid-flight frame. The parts carry the rise and nothing else.
          const items = gsap.utils
            .toArray<HTMLElement>(incoming.querySelectorAll("[data-item]"))
            .slice(0, 6) // §7.1's cap. No scene has more; the slice is what keeps it true.

          if (items.length > 0 && !reduced) {
            timeline.fromTo(
              items,
              { y: CAPABILITY.vignetteRise },
              {
                y: 0,
                duration: DURATION.entrance,
                ease: EASE.entrance,
                stagger: STAGGER,
                clearProps: "transform",
              },
              TESTIMONIAL.overlap,
            )
          }

          // The route's own progress, swept across the row's dwell so it lands as the accordion
          // hands over. A scaleX bar — never an animated width (§7.1).
          const progress = incoming.querySelector("[data-progress]")
          if (progress) {
            if (reduced) {
              gsap.set(progress, { scaleX: 0.85 })
            } else {
              timeline.fromTo(
                progress,
                { scaleX: 0.15 },
                { scaleX: 0.85, duration: CAPABILITY.dwell, ease: EASE.loop },
                0,
              )
            }
          }
        },
      )

      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [openIndex], revertOnUpdate: true },
  )

  const scenes = scenesFor(capability, copy)

  return (
    <div ref={rootRef} aria-hidden className="absolute inset-0">
      {shown.previous !== -1 ? scenes[shown.previous] : null}
      {scenes[shown.current]}
    </div>
  )
}
