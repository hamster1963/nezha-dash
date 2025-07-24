"use client"

import { MapIcon, ViewColumnsIcon } from "@heroicons/react/20/solid"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { useFilter } from "@/app/context/network-filter-context"
import { useServerData } from "@/app/context/server-data-context"
import { useStatus } from "@/app/context/status-context"
import GlobalLoading from "@/components/loading/GlobalLoading"
import { Loader } from "@/components/loading/Loader"
import ServerCard from "@/components/ServerCard"
import ServerCardInline from "@/components/ServerCardInline"
import Switch from "@/components/Switch"
import getEnv from "@/lib/env-entry"
import { cn } from "@/lib/utils"

const ServerGlobal = dynamic(() => import("./Global"), {
  ssr: false,
  loading: () => <GlobalLoading />,
})

const sortServersByDisplayIndex = (servers: any[]) => {
  return servers.sort((a, b) => {
    const displayIndexDiff = (b.display_index || 0) - (a.display_index || 0)
    return displayIndexDiff !== 0 ? displayIndexDiff : a.id - b.id
  })
}

const filterServersByStatus = (servers: any[], status: string) => {
  return status === "all"
    ? servers
    : servers.filter((server) => [status].includes(server.online_status ? "online" : "offline"))
}

const filterServersByTag = (servers: any[], tag: string, defaultTag: string) => {
  return tag === defaultTag ? servers : servers.filter((server) => server.tag === tag)
}

const sortServersByNetwork = (servers: any[]) => {
  return [...servers].sort((a, b) => {
    if (!a.online_status && b.online_status) return 1
    if (a.online_status && !b.online_status) return -1
    if (!a.online_status && !b.online_status) return 0
    return b.status.NetInSpeed + b.status.NetOutSpeed - (a.status.NetInSpeed + a.status.NetOutSpeed)
  })
}

const getTagCounts = (servers: any[]) => {
  return servers.reduce((acc: Record<string, number>, server) => {
    if (server.tag) {
      acc[server.tag] = (acc[server.tag] || 0) + 1
    }
    return acc
  }, {})
}

const LoadingState = ({ t }: { t: any }) => (
  <div className="flex min-h-96 flex-col items-center justify-center ">
    <div className="flex items-center gap-2 font-semibold text-sm">
      <Loader visible={true} />
      {t("connecting")}...
    </div>
  </div>
)

const ErrorState = ({ error, t }: { error: Error; t: any }) => (
  <div className="flex flex-col items-center justify-center">
    <p className="font-medium text-sm opacity-40">{error.message}</p>
    <p className="font-medium text-sm opacity-40">{t("error_message")}</p>
  </div>
)

const ServerList = ({
  servers,
  inline,
  containerRef,
}: {
  servers: any[]
  inline: string
  containerRef: any
}) => {
  if (inline === "1") {
    return (
      <section
        ref={containerRef}
        className="scrollbar-hidden flex flex-col gap-2 overflow-x-scroll"
      >
        {servers.map((serverInfo) => (
          <ServerCardInline key={serverInfo.id} serverInfo={serverInfo} />
        ))}
      </section>
    )
  }

  return (
    <section ref={containerRef} className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {servers.map((serverInfo) => (
        <ServerCard key={serverInfo.id} serverInfo={serverInfo} />
      ))}
    </section>
  )
}

export default function ServerListClient() {
  const { status } = useStatus()
  const { filter } = useFilter()
  const t = useTranslations("ServerListClient")
  const containerRef = useRef<HTMLDivElement>(null)
  const defaultTag = "defaultTag"

  const [tag, setTag] = useState<string>(defaultTag)
  const [showMap, setShowMap] = useState<boolean>(false)
  const [inline, setInline] = useState<string>("0")

  useEffect(() => {
    const inlineState = localStorage.getItem("inline")
    if (inlineState !== null) {
      setInline(inlineState)
    }

    const showMapState = localStorage.getItem("showMap")
    if (showMapState !== null) {
      setShowMap(showMapState === "true")
    }

    const savedTag = sessionStorage.getItem("selectedTag") || defaultTag
    setTag(savedTag)
    restoreScrollPosition()
  }, [])

  const handleTagChange = (newTag: string) => {
    setTag(newTag)
    sessionStorage.setItem("selectedTag", newTag)
    sessionStorage.setItem("scrollPosition", String(containerRef.current?.scrollTop || 0))
  }

  const restoreScrollPosition = () => {
    const savedPosition = sessionStorage.getItem("scrollPosition")
    if (savedPosition && containerRef.current) {
      containerRef.current.scrollTop = Number(savedPosition)
    }
  }

  useEffect(() => {
    const handleRouteChange = () => {
      restoreScrollPosition()
    }

    window.addEventListener("popstate", handleRouteChange)
    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [])

  const { data, error } = useServerData()

  if (error) return <ErrorState error={error} t={t} />
  if (!data?.result) return <LoadingState t={t} />

  const { result } = data
  const sortedServers = sortServersByDisplayIndex(result)
  const filteredServersByStatus = filterServersByStatus(sortedServers, status)
  const allTag = filteredServersByStatus.map((server) => server.tag).filter(Boolean)
  const uniqueTags = [...new Set(allTag)]
  uniqueTags.unshift(defaultTag)

  let filteredServers = filterServersByTag(filteredServersByStatus, tag, defaultTag)

  if (filter) {
    filteredServers = sortServersByNetwork(filteredServers)
  }

  const tagCountMap = getTagCounts(filteredServersByStatus)

  return (
    <>
      <section className="flex w-full items-center gap-2 overflow-hidden">
        <button
          type="button"
          onClick={() => {
            const newShowMap = !showMap
            setShowMap(newShowMap)
            localStorage.setItem("showMap", String(newShowMap))
          }}
          className={cn(
            "inset-shadow-2xs inset-shadow-white/20 flex cursor-pointer flex-col items-center gap-0 rounded-[50px] bg-blue-100 p-[10px] text-blue-600 transition-all dark:bg-blue-900 dark:text-blue-100 ",
            {
              "inset-shadow-black/20 bg-blue-600 text-white dark:bg-blue-100 dark:text-blue-600":
                showMap,
            },
          )}
        >
          <MapIcon className="size-[13px]" />
        </button>
        <button
          type="button"
          onClick={() => {
            const newInline = inline === "0" ? "1" : "0"
            setInline(newInline)
            localStorage.setItem("inline", newInline)
          }}
          className={cn(
            "inset-shadow-2xs inset-shadow-white/20 flex cursor-pointer flex-col items-center gap-0 rounded-[50px] bg-blue-100 p-[10px] text-blue-600 transition-all dark:bg-blue-900 dark:text-blue-100 ",
            {
              "inset-shadow-black/20 bg-blue-600 text-white dark:bg-blue-100 dark:text-blue-600":
                inline === "1",
            },
          )}
        >
          <ViewColumnsIcon className="size-[13px]" />
        </button>
        {getEnv("NEXT_PUBLIC_ShowTag") === "true" && (
          <Switch
            allTag={uniqueTags}
            nowTag={tag}
            tagCountMap={tagCountMap}
            onTagChange={handleTagChange}
          />
        )}
      </section>
      {showMap && <ServerGlobal />}
      <ServerList servers={filteredServers} inline={inline} containerRef={containerRef} />
    </>
  )
}
