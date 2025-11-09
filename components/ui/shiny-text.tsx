"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ShinyTextProps {
  icon?: React.ReactNode
  text: string
  disabled?: boolean
  speed?: number
  delay?: number
  className?: string
  style?: React.CSSProperties
}

const ShinyText: React.FC<ShinyTextProps> = ({
  icon,
  text,
  disabled = false,
  speed = 3,
  delay = 0.6,
  className = "",
  style,
}) => {
  const animationDuration = `${speed}s`
  const animationDelay = `${delay}s`

  const computedStyle: React.CSSProperties = {
    animationDuration,
    animationDelay,
    animationTimingFunction: "linear",
    ...(style ?? {}),
  }

  return (
    <div
      className={cn(
        "inline-flex items-center",
        "text-[#333] dark:text-[#f0f0f0]",
        "bg-[currentColor]",
        "bg-[linear-gradient(to_left,currentColor,#ffffff_50%,currentColor)] dark:bg-[linear-gradient(to_left,currentColor,#646464_50%,currentColor)]",
        "bg-size-[50%_200%]",
        "bg-position-[-100%_top]",
        "bg-no-repeat",
        "[-webkit-background-clip:text]",
        "bg-clip-text",
        "[-webkit-text-fill-color:transparent]",
        className,
        {
          "animate-shine": !disabled,
        },
      )}
      style={computedStyle}
    >
      {icon && <span className="mr-2.5 ml-0.5">{icon}</span>}
      {text}
    </div>
  )
}

export default ShinyText
