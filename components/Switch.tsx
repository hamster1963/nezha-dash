"use client"

import getEnv from "@/lib/env-entry"
import { cn } from "@/lib/utils"
import { m } from "framer-motion"
import { useTranslations } from "next-intl"
import React, { createRef, useEffect, useRef } from "react"

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
    const currentTagRef = tagRefs.current[allTag.indexOf(nowTag)]
    if (currentTagRef && currentTagRef.current) {
      currentTagRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [nowTag])

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hidden z-50 flex flex-col items-start overflow-x-scroll rounded-[50px]"
    >
      <div className="flex items-center gap-1 rounded-[50px] bg-stone-100 p-[3px] dark:bg-stone-800">
        {allTag.map((tag, index) => (
          <div
            key={tag}
            ref={tagRefs.current[index]}
            onClick={() => onTagChange(tag)}
            className={cn(
              "relative cursor-pointer rounded-3xl px-2.5 py-[8px] text-[13px] font-[600] transition-all duration-500",
              nowTag === tag ? "text-black dark:text-white" : "text-stone-400 dark:text-stone-500",
            )}
          >
            {nowTag === tag && (
              <m.div
                layoutId="nav-item"
                className="absolute inset-0 z-10 h-full w-full content-center bg-white shadow-lg shadow-black/5 dark:bg-stone-700 dark:shadow-white/5"
                style={{
                  originY: "0px",
                  borderRadius: 46,
                }}
              />
            )}
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
