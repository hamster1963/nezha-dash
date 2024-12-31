"use client"

import getEnv from "@/lib/env-entry"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import React, { createRef, useEffect, useRef, useState } from "react"

export default function Switch({
  allTag,
  nowTag,
  tagCountMap,
  onTagChange,
}: {
  allTag: string[]
  nowTag: string
  tagCountMap: Record<string, number>
  onTagChange: (tag: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const tagRefs = useRef(allTag.map(() => createRef<HTMLDivElement>()))
  const t = useTranslations("ServerListClient")
  const [indicator, setIndicator] = useState<{ x: number; w: number }>({ x: 0, w: 0 })

  useEffect(() => {
    const savedTag = sessionStorage.getItem("selectedTag")
    if (savedTag && allTag.includes(savedTag)) {
      onTagChange(savedTag)
    }
  }, [allTag, onTagChange])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const isOverflowing = container.scrollWidth > container.clientWidth
    if (!isOverflowing) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      container.scrollLeft += e.deltaY
    }

    container.addEventListener("wheel", onWheel, { passive: false })

    return () => {
      container.removeEventListener("wheel", onWheel)
    }
  }, [])

  useEffect(() => {
    const currentTagElement = tagRefs.current[allTag.indexOf(nowTag)]?.current
    if (currentTagElement) {
      const parentPadding = 1
      setIndicator({
        x:
          allTag.indexOf(nowTag) !== 0
            ? currentTagElement.offsetLeft - parentPadding
            : currentTagElement.offsetLeft,
        w: currentTagElement.offsetWidth,
      })
    }
  }, [nowTag])

  useEffect(() => {
    const currentTagElement = tagRefs.current[allTag.indexOf(nowTag)]?.current
    const container = scrollRef.current

    if (currentTagElement && container) {
      const containerRect = container.getBoundingClientRect()
      const tagRect = currentTagElement.getBoundingClientRect()

      const scrollLeft = currentTagElement.offsetLeft - (containerRect.width - tagRect.width) / 2

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth",
      })
    }
  }, [nowTag])

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hidden z-50 flex flex-col items-start overflow-x-scroll rounded-[50px]"
    >
      <div className="relative flex items-center gap-1 rounded-[50px] bg-stone-100 p-[3px] dark:bg-stone-800">
        {indicator.w > 0 && (
          <div
            className="absolute top-[3px] left-0 z-10 h-[35px] bg-white shadow-lg shadow-black/5 dark:bg-stone-700 dark:shadow-white/5"
            style={{
              borderRadius: 24,
              width: `${indicator.w}px`,
              transform: `translateX(${indicator.x}px)`,
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        )}
        {allTag.map((tag, index) => (
          <div
            key={tag}
            ref={tagRefs.current[index]}
            onClick={() => {
              onTagChange(tag)
              sessionStorage.setItem("selectedTag", tag)
            }}
            className={cn(
              "relative cursor-pointer rounded-3xl px-2.5 py-[8px] text-[13px] font-[600]",
              "transition-all duration-500 ease-in-out text-stone-400 dark:text-stone-500",
              {
                "text-stone-950 dark:text-stone-50": nowTag === tag,
              },
            )}
          >
            <div className="relative z-20 flex items-center gap-1">
              <div className="whitespace-nowrap flex items-center gap-2">
                {tag === "defaultTag" ? t("defaultTag") : tag}{" "}
                {getEnv("NEXT_PUBLIC_ShowTagCount") === "true" && tag !== "defaultTag" && (
                  <div className="w-fit px-1.5 rounded-full bg-muted">{tagCountMap[tag]}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
