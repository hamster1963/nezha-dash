/**
 * Nezha monitoring system driver implementation
 */

import { connection } from "next/server"
import type { MakeOptional } from "@/app/types/utils"
import getEnv from "@/lib/env-entry"
import { BaseDriver } from "../base"
import type { DriverConfig, NezhaAPI, NezhaAPIMonitor, ServerApi } from "../types"
import { DriverOperationError } from "../types"

export class NezhaDriver extends BaseDriver {
  private authToken: string | null = null

  constructor() {
    super("nezha", {
      supportsMonitoring: true,
      supportsRealTimeData: true,
      supportsHistoricalData: true,
      supportsIpInfo: true,
      supportsPacketLoss: true,
      supportsAlerts: false,
    })
  }

  protected async onInitialize(config: DriverConfig): Promise<void> {
    this.authToken = config.auth || getEnv("NezhaAuth") || null

    if (!this.authToken) {
      throw new DriverOperationError(this.name, "initialize", "Authorization token is required")
    }
  }

  async getServers(): Promise<ServerApi> {
    await connection()
    this.ensureInitialized()

    const response = await fetch(`${this.config?.baseUrl}/api/v1/server/details`, {
      ...this.createFetchOptions({
        Authorization: this.authToken || "",
      }),
    })

    const resData = await this.handleFetchResponse(response)

    if (!resData.result) {
      throw new DriverOperationError(this.name, "getServers", "'result' field is missing")
    }

    const nezhaData = resData.result as NezhaAPI[]
    const data: ServerApi = {
      live_servers: 0,
      offline_servers: 0,
      total_out_bandwidth: 0,
      total_in_bandwidth: 0,
      total_in_speed: 0,
      total_out_speed: 0,
      result: [],
    }

    const forceShowAllServers = getEnv("ForceShowAllServers") === "true"
    const nezhaDataFiltered = forceShowAllServers
      ? nezhaData
      : nezhaData.filter((element) => !element.hide_for_guest)

    const timestamp = Date.now() / 1000
    data.result = nezhaDataFiltered.map(
      (element: MakeOptional<NezhaAPI, "ipv4" | "ipv6" | "valid_ip">) => {
        const isOnline = timestamp - element.last_active <= 180
        element.online_status = isOnline

        if (isOnline) {
          data.live_servers += 1
          data.total_out_bandwidth += element.status.NetOutTransfer
          data.total_in_bandwidth += element.status.NetInTransfer
          data.total_in_speed += element.status.NetInSpeed
          data.total_out_speed += element.status.NetOutSpeed
        } else {
          data.offline_servers += 1
        }

        // Remove sensitive properties
        element.ipv4 = ""
        element.ipv6 = ""
        element.valid_ip = ""

        return element
      },
    )

    return data
  }

  async getServerDetail(serverId: number): Promise<NezhaAPI> {
    await connection()
    this.ensureInitialized()

    const response = await fetch(`${this.config?.baseUrl}/api/v1/server/details?id=${serverId}`, {
      ...this.createFetchOptions({
        Authorization: this.authToken || "",
      }),
    })

    const resData = await this.handleFetchResponse(response)
    const detailDataList = resData.result

    if (!detailDataList || !Array.isArray(detailDataList) || detailDataList.length === 0) {
      throw new DriverOperationError(
        this.name,
        "getServerDetail",
        "'result' field is missing or empty",
      )
    }

    const timestamp = Date.now() / 1000
    const detailData = detailDataList.map((element) => {
      element.online_status = timestamp - element.last_active <= 180
      element.ipv4 = ""
      element.ipv6 = ""
      element.valid_ip = ""
      return element
    })[0]

    return detailData
  }

  protected async onGetServerMonitor(serverId: number): Promise<NezhaAPIMonitor[]> {
    await connection()
    this.ensureInitialized()

    const response = await fetch(`${this.config?.baseUrl}/api/v1/monitor/${serverId}`, {
      ...this.createFetchOptions({
        Authorization: this.authToken || "",
      }),
    })

    const resData = await this.handleFetchResponse(response)
    const monitorData = resData.result as NezhaAPIMonitor[]

    if (!monitorData) {
      throw new DriverOperationError(this.name, "getServerMonitor", "'result' field is missing")
    }

    // Check if packet loss calculation is enabled (default to true for backward compatibility)
    const enablePacketLoss = getEnv("EnablePacketLossCalculation") !== "false"

    // Calculate packet loss for each monitor if enabled
    const enhancedMonitorData = monitorData.map((monitor) => {
      if (enablePacketLoss && monitor.avg_delay?.length > 0) {
        const packetLossRates = this.calculatePacketLoss(monitor.avg_delay)
        return {
          ...monitor,
          packet_loss: packetLossRates,
        } as NezhaAPIMonitor
      }
      return monitor
    })

    return enhancedMonitorData
  }

  protected async onGetServerIP(serverId: number): Promise<string> {
    await connection()
    this.ensureInitialized()

    const response = await fetch(`${this.config?.baseUrl}/api/v1/server/details`, {
      ...this.createFetchOptions({
        Authorization: this.authToken || "",
      }),
    })

    const resData = await this.handleFetchResponse(response)

    if (!resData.result) {
      throw new DriverOperationError(this.name, "getServerIP", "'result' field is missing")
    }

    const nezhaData = resData.result as NezhaAPI[]
    const server = nezhaData.find((element) => element.id === serverId)

    if (!server) {
      throw new DriverOperationError(
        this.name,
        "getServerIP",
        `Server with ID ${serverId} not found`,
      )
    }

    return server?.valid_ip || server?.ipv4 || server?.ipv6 || ""
  }

  protected async onHealthCheck(): Promise<void> {
    this.ensureInitialized()

    const response = await fetch(`${this.config?.baseUrl}/api/v1/server/details`, {
      ...this.createFetchOptions({
        Authorization: this.authToken || "",
      }),
    })

    if (!response.ok) {
      throw new DriverOperationError(this.name, "healthCheck", `HTTP ${response.status}`)
    }
  }
}
