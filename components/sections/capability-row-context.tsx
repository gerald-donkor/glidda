"use client"

import { createContext, useContext, useMemo, useState } from "react"

/**
 * The open row of a capability section, shared by its accordion and its panel (§5.2, §7.3 #3).
 *
 * Measured off `ref/fullanimations.webm`: the panel illustrates the sentence that is open, and it
 * swaps on the same beat the accordion advances on. That is one piece of state, and it lives here
 * rather than in either column so neither owns the other and the two cannot drift apart.
 *
 * Children arrive as `children` and are therefore rendered on the server and passed in, exactly as
 * `Reveal` and `HeroEntrance` do — `capability-section.tsx` stays a server component and only this
 * provider joins the client bundle.
 */

type CapabilityRowState = {
  openIndex: number
  setOpenIndex: (index: number | ((current: number) => number)) => void
}

const CapabilityRowContext = createContext<CapabilityRowState | null>(null)

export function CapabilityRowProvider({ children }: { children: React.ReactNode }) {
  const [openIndex, setOpenIndex] = useState(0)
  const value = useMemo(() => ({ openIndex, setOpenIndex }), [openIndex])

  return <CapabilityRowContext value={value}>{children}</CapabilityRowContext>
}

export function useCapabilityRow(): CapabilityRowState {
  const value = useContext(CapabilityRowContext)
  if (!value) {
    throw new Error("useCapabilityRow must be used inside a CapabilityRowProvider.")
  }
  return value
}
