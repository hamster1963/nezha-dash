"use client"

import { NetworkChart } from "@/app/(main)/ClientComponents/detail/NetworkChart"
import { useServerData } from "@/app/context/server-data-context"
import type { NezhaAPIMonitor } from "@/app/types/nezha-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import getEnv from "@/lib/env-entry"
import { cn, nezhaFetcher } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useMemo, useState } from "react"
import useSWR from "swr"

interface ResultItem {
  created_at: number
  [key: string]: number
}

type SelectionMode = "multi" | "single"

export function AggregatedNetworkCharts() {
  const t = useTranslations("AggregatedNetworkCharts")
  const { data: serverData } = useServerData()
  const [selectedServers, setSelectedServers] = useState<number[]>([])
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("multi")

  // Get online servers with stable sorting
  const onlineServers = useMemo(() => {
    if (!serverData?.result) return []
    return serverData.result
      .filter((server) => server.online_status)
      .sort((a, b) => {
        // Sort by display_index (descending), then by id (ascending) for stable ordering
        const displayIndexDiff = (b.display_index || 0) - (a.display_index || 0)
        return displayIndexDiff !== 0 ? displayIndexDiff : a.id - b.id
      })
  }, [serverData])

  // Initialize selected servers with first online server when data loads (for both multi and single mode)
  useEffect(() => {
    if (onlineServers.length > 0 && selectedServers.length === 0) {
      setSelectedServers([onlineServers[0].id])
    }
  }, [onlineServers, selectedServers.length])

  // Clean up selected servers that are no longer online
  useEffect(() => {
    if (selectedServers.length > 0) {
      const onlineServerIds = new Set(onlineServers.map((server) => server.id))
      const validSelectedServers = selectedServers.filter((id) => onlineServerIds.has(id))
      if (validSelectedServers.length !== selectedServers.length) {
        setSelectedServers(validSelectedServers)
      }
    }
  }, [onlineServers, selectedServers])

  // Handle mode switching
  const handleModeChange = useCallback(
    (newMode: SelectionMode) => {
      setSelectionMode(newMode)
      if (newMode === "single" && selectedServers.length > 1) {
        // Keep only the first selected server when switching to single mode
        setSelectedServers([selectedServers[0]])
      } else if (newMode === "multi" && selectedServers.length === 0 && onlineServers.length > 0) {
        // Auto-select first server when switching to multi mode with no selection
        setSelectedServers([onlineServers[0].id])
      }
    },
    [selectedServers, onlineServers],
  )

  const handleServerToggle = useCallback((serverId: number, checked: boolean) => {
    setSelectedServers((prev) => {
      if (checked) {
        return [...prev, serverId]
      }
      return prev.filter((id) => id !== serverId)
    })
  }, [])

  const handleSingleSelect = useCallback((serverId: string) => {
    setSelectedServers([Number.parseInt(serverId)])
  }, [])

  if (!serverData?.result) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="font-medium text-sm opacity-40">{t("loading")}</p>
      </div>
    )
  }

  if (onlineServers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="font-medium text-sm opacity-40">{t("no_online_servers")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Server Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("server_selection")}</CardTitle>
              <CardDescription>
                {selectionMode === "multi" ? t("select_servers_multi") : t("select_server_single")}
              </CardDescription>
            </div>
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant={selectionMode === "multi" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("multi")}
                className={cn("h-8 px-3 text-xs", selectionMode === "multi" && "shadow-sm")}
              >
                {t("multi_select_mode")}
              </Button>
              <Button
                variant={selectionMode === "single" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("single")}
                className={cn("h-8 px-3 text-xs", selectionMode === "single" && "shadow-sm")}
              >
                {t("single_select_mode")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {selectionMode === "multi" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {onlineServers.map((server) => (
                <Label
                  key={server.id}
                  htmlFor={`server-${server.id}`}
                  className="flex cursor-pointer items-center justify-between space-x-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex-1 font-medium text-sm leading-none">
                    {server.name}
                  </span>
                  <Switch
                    id={`server-${server.id}`}
                    checked={selectedServers.includes(server.id)}
                    onCheckedChange={(checked) => handleServerToggle(server.id, checked)}
                  />
                </Label>
              ))}
            </div>
          ) : (
            <RadioGroup
              value={selectedServers[0]?.toString() || ""}
              onValueChange={handleSingleSelect}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {onlineServers.map((server) => (
                <Label
                  key={server.id}
                  htmlFor={`server-radio-${server.id}`}
                  className="flex cursor-pointer items-center space-x-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
                >
                  <RadioGroupItem value={server.id.toString()} id={`server-radio-${server.id}`} />
                  <span className="flex-1 font-medium text-sm leading-none">
                    {server.name}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Network Charts */}
      {selectedServers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="font-medium text-sm opacity-40">{t("no_servers_selected")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...new Set(selectedServers)]
            .map((serverId) => {
              const server = onlineServers.find((s) => s.id === serverId)
              return server ? { serverId, server } : null
            })
            .filter((item): item is { serverId: number; server: any } => item !== null)
            .map(({ serverId, server }) => (
              <ServerNetworkChart key={`chart-${serverId}`} serverId={serverId} serverName={server.name} />
            ))}
        </div>
      )}
    </div>
  )
}

function ServerNetworkChart({ serverId, serverName }: { serverId: number; serverName: string }) {
  const swrKey = `/api/monitor?server_id=${serverId}`
  const { data, error } = useSWR<NezhaAPIMonitor[]>(swrKey, nezhaFetcher, {
    refreshInterval: Number(getEnv("NEXT_PUBLIC_NezhaFetchInterval")) || 15000,
    dedupingInterval: 1000, // Prevent excessive requests
  })

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-md">{serverName}</CardTitle>
          <CardDescription className="text-destructive text-xs">
            Error loading network data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            <p className="font-medium text-sm opacity-40">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-md">{serverName}</CardTitle>
          <CardDescription className="text-xs">Loading network monitoring data...</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-2 font-medium text-sm opacity-40">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const transformedData = transformData(data)
  const formattedData = formatData(data)

  const initChartConfig = {
    avg_delay: {
      label: "Avg Delay",
    },
  }

  const chartDataKey = Object.keys(transformedData)

  // Ensure we have valid data to display
  if (chartDataKey.length === 0 || formattedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-md">{serverName}</CardTitle>
          <CardDescription className="text-xs">No monitoring data available</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            <p className="font-medium text-sm opacity-40">
              No network monitoring data found for this server
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <NetworkChart
      chartDataKey={chartDataKey}
      chartConfig={initChartConfig}
      chartData={transformedData}
      serverName={serverName || data[0]?.server_name || `Server ${serverId}`}
      formattedData={formattedData}
    />
  )
}

const transformData = (data: NezhaAPIMonitor[]) => {
  const monitorData: { [key: string]: { created_at: number; avg_delay: number }[] } = {}

  for (const item of data) {
    const monitorName = item.monitor_name

    if (!monitorData[monitorName]) {
      monitorData[monitorName] = []
    }

    for (let i = 0; i < item.created_at.length; i++) {
      monitorData[monitorName].push({
        created_at: item.created_at[i],
        avg_delay: item.avg_delay[i],
      })
    }
  }

  return monitorData
}

const formatData = (rawData: NezhaAPIMonitor[]) => {
  const result: { [time: number]: ResultItem } = {}

  const allTimes = new Set<number>()
  for (const item of rawData) {
    for (const time of item.created_at) {
      allTimes.add(time)
    }
  }

  const allTimeArray = Array.from(allTimes).sort((a, b) => a - b)

  for (const item of rawData) {
    const { monitor_name, created_at, avg_delay } = item

    for (const time of allTimeArray) {
      if (!result[time]) {
        result[time] = { created_at: time }
      }

      const timeIndex = created_at.indexOf(time)
      // @ts-expect-error - avg_delay is an array
      result[time][monitor_name] = timeIndex !== -1 ? avg_delay[timeIndex] : null
    }
  }

  return Object.values(result).sort((a, b) => a.created_at - b.created_at)
}
