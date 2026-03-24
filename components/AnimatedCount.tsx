import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function AnimateCountClient({
  count,
  className,
  minDigits,
}: {
  count: number
  className?: string
  minDigits?: number
}) {
  const [previousCount, setPreviousCount] = useState(count)

  useEffect(() => {
    if (count !== previousCount) {
      const timeoutId = window.setTimeout(() => {
        setPreviousCount(count)
      }, 300)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }
  }, [count])
  return (
    <AnimateCount
      key={count}
      preCount={previousCount}
      className={cn("inline-flex items-center leading-none", className)}
      minDigits={minDigits}
      data-issues-count-animation
    >
      {count}
    </AnimateCount>
  )
}

export default AnimateCountClient

export function AnimateCount({
  children: count,
  className,
  preCount,
  minDigits = 1,
  ...props
}: {
  children: number
  className?: string
  preCount?: number
  minDigits?: number
}) {
  const currentDigits = count.toString().split("")
  const previousDigits = (
    preCount !== undefined ? preCount.toString() : count - 1 >= 0 ? (count - 1).toString() : "0"
  ).split("")

  // Ensure both numbers meet the minimum length requirement and maintain the same length for animation
  const maxLength = Math.max(previousDigits.length, currentDigits.length, minDigits)
  while (previousDigits.length < maxLength) {
    previousDigits.unshift("0")
  }
  while (currentDigits.length < maxLength) {
    currentDigits.unshift("0")
  }

  const digitSlots = currentDigits.map((digit, index) => ({
    id: `digit-slot-${maxLength - index}`,
    digit,
    previousDigit: previousDigits[index],
  }))

  return (
    <div {...props} className={cn("flex h-[1em] items-center", className)}>
      {digitSlots.map((slot) => {
        const hasChanged = slot.digit !== slot.previousDigit
        return (
          <div
            key={slot.id}
            className={cn("relative flex h-full min-w-[0.6em] items-center text-center", {
              "min-w-[0.2em]": slot.digit === ".",
            })}
          >
            <div
              aria-hidden
              data-issues-count-exit
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                hasChanged ? "animate" : "opacity-0",
              )}
            >
              {slot.previousDigit}
            </div>
            <div
              data-issues-count-enter
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                hasChanged && "animate",
              )}
            >
              {slot.digit}
            </div>
          </div>
        )
      })}
    </div>
  )
}
