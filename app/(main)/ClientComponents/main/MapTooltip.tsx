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
      className="tooltip-animate absolute z-50 hidden rounded bg-white px-2 py-1 text-sm shadow-lg lg:block dark:border dark:border-neutral-700 dark:bg-neutral-800"
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
        <p className="mb-1 font-light text-neutral-600 text-xs dark:text-neutral-400">
          {tooltipData.count} {t("Servers")}
        </p>
      </div>
      <div
        className="border-t pt-1 dark:border-neutral-700"
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
            className="flex items-center gap-1.5 py-0.5 text-neutral-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
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
