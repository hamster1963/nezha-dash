import { useTheme } from "next-themes"
import type React from "react"
import { cn } from "@/lib/utils"

interface ShinyTextProps {
  icon?: React.ReactNode
  text: string
  disabled?: boolean
  speed?: number
  delay?: number
  highlightColor?: string
  textColor?: string
  className?: string
  style?: React.CSSProperties
}

const ShinyText: React.FC<ShinyTextProps> = ({
  icon,
  text,
  disabled = false,
  speed = 3,
  delay = 0.6,
  highlightColor,
  textColor,
  className = "",
  style,
}) => {
  const { theme, systemTheme } = useTheme()
  const resolvedTheme = theme === "system" ? systemTheme : theme
  const animationDuration = `${speed}s`
  const animationDelay = `${delay}s`
  const defaultTextColor = resolvedTheme === "dark" ? "#f0f0f0" : "#333333"
  const defaultHighlightColor = resolvedTheme === "dark" ? "#646464" : "#ffffff"
  const finalTextColor = textColor ?? defaultTextColor
  const finalHighlightColor = highlightColor ?? defaultHighlightColor
  const computedStyle: React.CSSProperties = {
    color: finalTextColor,
    backgroundColor: "currentColor",
    backgroundImage: `linear-gradient(to left, currentColor, ${finalHighlightColor} 50%, currentColor)`,
    backgroundSize: "50% 200%",
    backgroundPosition: "-100% top",
    backgroundRepeat: "no-repeat",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animationDuration,
    animationDelay,
    animationTimingFunction: "linear",
    ...(style ?? {}),
  }

  return (
    <div
      className={cn("inline-flex items-center bg-clip-text", className, {
        "animate-shine": !disabled,
      })}
      style={computedStyle}
    >
      {icon && <span className="mr-2.5 ml-0.5">{icon}</span>}
      {text}
    </div>
  )
}

export default ShinyText
