"use client"

import { LazyMotion } from "framer-motion"

const loadFeatures = () => import("./framer-lazy-feature").then((res) => res.default)

export const MotionProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <LazyMotion features={loadFeatures} strict key="framer">
      {children}
    </LazyMotion>
  )
}
