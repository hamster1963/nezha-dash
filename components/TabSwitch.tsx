"use client"

import { useLocale, useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export default function TabSwitch({
  tabs,
  currentTab,
  setCurrentTab,
  disabledTabs = [],
}: {
  tabs: string[]
  currentTab: string
  setCurrentTab: (tab: string) => void
  disabledTabs?: string[]
}) {
  const t = useTranslations("TabSwitch")
  const [indicator, setIndicator] = useState<{ x: number; w: number }>({
    x: 0,
    w: 0,
  })
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const locale = useLocale()

  useEffect(() => {
    const currentTabElement = tabRefs.current[tabs.indexOf(currentTab)]
    if (currentTabElement) {
      const parentPadding = 1
      setIndicator({
        x:
          tabs.indexOf(currentTab) !== 0
            ? currentTabElement.offsetLeft - parentPadding
            : currentTabElement.offsetLeft,
        w: currentTabElement.offsetWidth,
      })
    }
  }, [currentTab, tabs, locale])

  return (
    <div className="z-50 flex flex-col items-start rounded-[50px]">
      <div className="relative flex items-center gap-1 rounded-[50px] bg-stone-100 p-[3px] dark:bg-stone-800">
        {indicator.w > 0 && (
          <div
            className="absolute top-[3px] left-0 z-10 h-[35px] bg-white shadow-black/5 shadow-lg dark:bg-stone-700 dark:shadow-white/5"
            style={{
              borderRadius: 24,
              width: `${indicator.w}px`,
              transform: `translateX(${indicator.x}px)`,
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        )}
        {tabs.map((tab: string, index) => {
          const isDisabled = disabledTabs.includes(tab)
          return (
            <div
              key={tab}
              ref={(el) => {
                tabRefs.current[index] = el
              }}
              onClick={() => !isDisabled && setCurrentTab(tab)}
              className={cn(
                "relative rounded-3xl px-2.5 py-[8px] font-[600] text-[13px]",
                "transition-all duration-500 ease-in-out",
                {
                  "cursor-pointer text-stone-400 hover:text-stone-950 dark:text-stone-500 hover:dark:text-stone-50":
                    !isDisabled,
                  "cursor-not-allowed text-stone-300 dark:text-stone-600": isDisabled,
                  "text-stone-950 dark:text-stone-50": currentTab === tab && !isDisabled,
                },
              )}
              title={isDisabled ? t("disabled_tooltip") : undefined}
            >
              <div className="relative z-20 flex items-center gap-1">
                <p className="whitespace-nowrap">{t(tab)}</p>
                {isDisabled && <span className="ml-1 text-[10px] opacity-50">🚫</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
