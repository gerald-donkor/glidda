"use client"

import { useRef } from "react"

import { Bubble, Chip, Cursor, Field, WireCard } from "@/components/motion/vignette-parts"
import type { VignetteCopy } from "@/lib/copy/placeholder/vignette"
import {
  answersVignette,
  demosVignette,
  onboardingVignette,
} from "@/lib/copy/placeholder/vignette"
import { CAPABILITY, DURATION, EASE, STAGGER } from "@/lib/gsap/motion"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap/register"

/**
 * The looping vignette that floats over a capability panel's slipstream (§5.1, §7.3 #3).
 *
 * Two scenes, stacked. The first is the base layer and stays painted; the second crossfades in
 * over it, holds, and fades back out — which is what makes the loop seamless at its wrap, where a
 * fade-out-then-fade-in pair would blink the panel empty once a cycle.
 *
 * Its loop is deliberately **not** wired to the accordion beside it (§5.2, decision 5): the panel
 * should read as the product running continuously, not as an illustration of whichever sentence
 * happens to be open.
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

/** Scene one is the base layer; scene two crossfades over it. */
function scenesFor(id: string, copy: VignetteCopy) {
  if (id === "demos") {
    return [<TourScene key="a" copy={copy} />, <ChatScene key="b" copy={copy} choice={false} />]
  }
  if (id === "onboarding") {
    return [<AgentCardScene key="a" copy={copy} />, <TourScene key="b" copy={copy} />]
  }
  return [<ChatScene key="a" copy={copy} choice />, <InfoScene key="b" copy={copy} />]
}

export function Vignette({ capability }: { capability: "answers" | "demos" | "onboarding" }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const copy = COPY[capability]

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const scenes = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".vignette-scene"))
      const [base, overlay] = scenes
      if (!base || !overlay) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // §7.2: the static first scene is already the reduced-motion state, so no timeline is
          // built and nothing is left frozen mid-tween.
          if (context.conditions?.reduced) return

          const half = CAPABILITY.vignette / 2
          const items = (scene: HTMLElement) =>
            gsap.utils.toArray<HTMLElement>(scene.querySelectorAll("[data-item]"))

          const master = gsap.timeline({
            repeat: -1,
            defaults: { duration: DURATION.entrance, ease: EASE.entrance },
          })

          master.fromTo(
            items(base),
            { autoAlpha: 0, y: CAPABILITY.vignetteRise },
            { autoAlpha: 1, y: 0, stagger: STAGGER },
            0,
          )

          const progress = base.querySelector("[data-progress]")
          if (progress) {
            master.fromTo(
              progress,
              { scaleX: 0.15 },
              { scaleX: 0.85, duration: half, ease: EASE.loop },
              0,
            )
          }

          master
            .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, half)
            .fromTo(
              items(overlay),
              { autoAlpha: 0, y: CAPABILITY.vignetteRise },
              { autoAlpha: 1, y: 0, stagger: STAGGER },
              half,
            )
            .to(overlay, { autoAlpha: 0 }, CAPABILITY.vignette - DURATION.entrance)

          // One ScrollTrigger, on the top-level timeline only — never on a nested child.
          const trigger = ScrollTrigger.create({
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            onToggle: ({ isActive }) => {
              if (isActive) master.play()
              else master.pause()
            },
          })

          // onToggle only fires on a change, so a panel that mounts below the fold has to be
          // paused explicitly.
          if (!trigger.isActive) master.pause()
        },
      )

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} aria-hidden className="absolute inset-0">
      {scenesFor(capability, copy)}
    </div>
  )
}
