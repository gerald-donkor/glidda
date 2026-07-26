"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/**
 * The single registration site for GSAP plugins (§7.1). Every animated component imports
 * `gsap`, `ScrollTrigger`, and `useGSAP` from here and never calls `registerPlugin` itself.
 * Registering `useGSAP` is what lets tweens created inside the hook be reverted automatically.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger)

export { gsap, ScrollTrigger, useGSAP }
