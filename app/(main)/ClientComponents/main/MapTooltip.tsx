"use client"

import { useTooltip } from "@/app/context/tooltip-context"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { memo } from "react"

const MapTooltip = memo(function MapTooltip() {
  const { tooltipData } = useTooltip()
  const t = useTranslations("Global")

  if (!tooltipData) return null

  const sortedServers = tooltipData.servers.sort((a, b) => {
    return a.status === b.status ? 0 : a.status ? 1 : -1
  })

  const saveSession = () => {
    sessionStorage.setItem("fromMainPage", "true")
  }

  return (
    <div
      className="absolute hidden lg:block bg-white dark:bg-neutral-800 px-2 py-1 rounded shadow-lg text-sm dark:border dark:border-neutral-700 z-50 tooltip-animate"
      key={tooltipData.country}
      style={{
        left: tooltipData.centroid[0],
        top: tooltipData.centroid[1],
        transform: "translate(10%, -50%)",
      }}
      onMouseEnter={(e) => {
        e.stopPropagation()
      }}
    >
      <div>
        <p className="font-medium">
          {tooltipData.country === "China" ? "Mainland China" : tooltipData.country}
        </p>
        <p className="text-neutral-600 dark:text-neutral-400 font-light text-xs mb-1">
          {tooltipData.count} {t("Servers")}
        </p>
      </div>
      <div
        className="border-t dark:border-neutral-700 pt-1"
        style={{
          maxHeight: "200px",
          overflowY: "auto",
        }}
      >
        {sortedServers.map((server) => (
          <Link
            onClick={saveSession}
            href={`/server/${server.id}`}
            key={server.name}
            className="flex items-center gap-1.5 py-0.5 transition-colors text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
          >
            <span
              className={`w-1.5 h-1.5 shrink-0 rounded-full ${
                server.status ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs">{server.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
})

export default MapTooltip
