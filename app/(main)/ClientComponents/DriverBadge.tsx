"use client"

import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { nezhaFetcher } from "@/lib/utils"

interface DriverInfo {
  name: string
  capabilities: {
    supportsMonitoring: boolean
    supportsRealTimeData: boolean
    supportsHistoricalData: boolean
    supportsIpInfo: boolean
    supportsPacketLoss: boolean
    supportsAlerts: boolean
  }
  availableDrivers: string[]
}

interface DriverInfoError {
  error: string
  environment: {
    komariMode: boolean
    hasKomariUrl: boolean
    hasNezhaUrl: boolean
    hasNezhaAuth: boolean
  }
  availableDrivers: string[]
  configuredDriver: string
}

interface HealthInfo {
  healthy: boolean
  timestamp: string
  status: string
  error?: string
}

export function DriverBadge() {
  const { data: driverInfo, error: driverError } = useSWR<DriverInfo | DriverInfoError>(
    "/api/driver-info",
    nezhaFetcher,
    {
      refreshInterval: 30000,
    },
  )

  const { data: healthInfo } = useSWR<HealthInfo>("/api/health", nezhaFetcher, {
    refreshInterval: 10000,
  })

  // 如果没有数据或者是 Nezha 驱动，不显示
  if (!driverInfo) return null

  const hasError = driverError || "error" in driverInfo
  const errorInfo = hasError ? (driverInfo as DriverInfoError) : null
  const normalInfo = hasError ? null : (driverInfo as DriverInfo)

  // 只有非 Nezha 驱动才显示
  const driverName = normalInfo?.name || errorInfo?.configuredDriver
  if (driverName === "nezha") return null

  const isHealthy = healthInfo?.healthy !== false
  const badgeVariant = hasError ? "destructive" : isHealthy ? "default" : "secondary"

  return (
    <Badge variant={badgeVariant} className="text-xs capitalize">
      {driverName}
    </Badge>
  )
}

export default DriverBadge
