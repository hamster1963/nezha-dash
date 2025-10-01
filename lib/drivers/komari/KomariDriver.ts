/**
 * Komari monitoring system driver implementation
 */

import { connection } from "next/server"
import getEnv from "@/lib/env-entry"
import { BaseDriver } from "../base"
import type {
  DriverConfig,
  KomariAPIResponse,
  KomariRecentData,
  KomariRecentResponse,
  KomariServer,
  NezhaAPI,
  NezhaAPIMonitor,
  ServerApi,
} from "../types"
import { DriverOperationError } from "../types"

export class KomariDriver extends BaseDriver {
  private serverUuidMap: Map<number, string> = new Map()

  constructor() {
    super("komari", {
      supportsMonitoring: false,
      supportsRealTimeData: true,
      supportsHistoricalData: false,
      supportsIpInfo: false,
      supportsPacketLoss: false,
      supportsAlerts: false,
    })
  }

  protected async onInitialize(_config: DriverConfig): Promise<void> {
    // Komari doesn't require auth token, but we can validate the base URL
    try {
      // Validate configuration by making a test request
      // Don't call onHealthCheck() here as it requires initialization to be complete
      await this.validateKomariAPI()
    } catch (error) {
      throw new DriverOperationError(
        this.name,
        "initialize",
        `Failed to connect to Komari API: ${error}`,
      )
    }
  }

  /**
   * Convert Komari server data to Nezha-compatible format
   */
  private convertKomariToNezha(komariServer: KomariServer, timestamp: number): NezhaAPI {
    // Generate a numeric ID from UUID for compatibility
    const id = Math.abs(
      komariServer.uuid
        .split("-")
        .join("")
        .slice(0, 8)
        .split("")
        .reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0)
          return a & a
        }, 0),
    )

    // Store UUID mapping for later use
    this.serverUuidMap.set(id, komariServer.uuid)

    return {
      id: id,
      name: komariServer.name,
      tag: komariServer.group || "",
      last_active: timestamp,
      online_status: true,
      ipv4: "",
      ipv6: "",
      valid_ip: "",
      display_index: komariServer.weight,
      hide_for_guest: komariServer.hidden,
      host: {
        Platform: komariServer.os,
        PlatformVersion: komariServer.kernel_version,
        CPU: [komariServer.cpu_name],
        MemTotal: komariServer.mem_total,
        DiskTotal: komariServer.disk_total,
        SwapTotal: komariServer.swap_total,
        Arch: komariServer.arch,
        Virtualization: komariServer.virtualization,
        BootTime: 0,
        CountryCode: komariServer.region,
        Version: "",
        GPU: komariServer.gpu_name ? [komariServer.gpu_name] : [],
      },
      status: {
        CPU: 0,
        MemUsed: 0,
        SwapUsed: 0,
        DiskUsed: 0,
        NetInTransfer: 0,
        NetOutTransfer: 0,
        NetInSpeed: 0,
        NetOutSpeed: 0,
        Uptime: 0,
        Load1: 0,
        Load5: 0,
        Load15: 0,
        TcpConnCount: 0,
        UdpConnCount: 0,
        ProcessCount: 0,
        Temperatures: 0,
        GPU: 0,
      },
    }
  }

  /**
   * Update Nezha server object with Komari recent data
   */
  private updateServerWithRecentData(nezhaServer: NezhaAPI, recent: KomariRecentData): NezhaAPI {
    nezhaServer.status = {
      CPU: recent.cpu.usage,
      MemUsed: recent.ram.used,
      SwapUsed: recent.swap.used,
      DiskUsed: recent.disk.used,
      NetInTransfer: recent.network.totalDown,
      NetOutTransfer: recent.network.totalUp,
      NetInSpeed: recent.network.down,
      NetOutSpeed: recent.network.up,
      Uptime: recent.uptime,
      Load1: recent.load.load1,
      Load5: recent.load.load5,
      Load15: recent.load.load15,
      TcpConnCount: recent.connections.tcp,
      UdpConnCount: recent.connections.udp,
      ProcessCount: recent.process,
      Temperatures: 0,
      GPU: 0,
    }
    nezhaServer.online_status = true
    return nezhaServer
  }

  async getServers(): Promise<ServerApi> {
    await connection()
    this.ensureInitialized()

    // First get the server list
    const response = await fetch(`${this.config?.baseUrl}/api/nodes`, this.createFetchOptions())
    const resData: KomariAPIResponse = await this.handleFetchResponse(response)

    if (resData.status !== "success" || !resData.data) {
      throw new DriverOperationError(this.name, "getServers", "Invalid response format")
    }

    const timestamp = Date.now() / 1000
    const forceShowAllServers = getEnv("ForceShowAllServers") === "true"

    // Filter servers based on hidden status
    const komariDataFiltered = forceShowAllServers
      ? resData.data
      : resData.data.filter((server) => !server.hidden)

    const data: ServerApi = {
      live_servers: 0,
      offline_servers: 0,
      total_out_bandwidth: 0,
      total_in_bandwidth: 0,
      total_in_speed: 0,
      total_out_speed: 0,
      result: [],
    }

    // Fetch recent data for each server concurrently
    const serverPromises = komariDataFiltered.map(async (komariServer) => {
      try {
        const nezhaServer = this.convertKomariToNezha(komariServer, timestamp)

        // Try to get recent data for this server
        const recentResponse = await fetch(
          `${this.config?.baseUrl}/api/recent/${komariServer.uuid}`,
          this.createFetchOptions(),
        )

        if (recentResponse.ok) {
          const recentData: KomariRecentResponse = await recentResponse.json()
          if (recentData.status === "success" && recentData.data && recentData.data.length > 0) {
            this.updateServerWithRecentData(nezhaServer, recentData.data[0])
          }
        }

        // Remove sensitive properties for safe output
        const safeServer = { ...nezhaServer }
        safeServer.ipv4 = undefined as any
        safeServer.ipv6 = undefined as any
        safeServer.valid_ip = undefined as any
        return safeServer
      } catch (error) {
        console.warn(`Failed to fetch recent data for server ${komariServer.uuid}:`, error)
        // Return server without recent data if fetch fails
        const nezhaServer = this.convertKomariToNezha(komariServer, timestamp)
        nezhaServer.online_status = false
        const safeServer = { ...nezhaServer }
        safeServer.ipv4 = undefined as any
        safeServer.ipv6 = undefined as any
        safeServer.valid_ip = undefined as any
        return safeServer
      }
    })

    const servers = await Promise.all(serverPromises)

    // Calculate totals
    servers.forEach((server) => {
      if (server.online_status) {
        data.live_servers += 1
        data.total_out_bandwidth += server.status.NetOutTransfer
        data.total_in_bandwidth += server.status.NetInTransfer
        data.total_in_speed += server.status.NetInSpeed
        data.total_out_speed += server.status.NetOutSpeed
      } else {
        data.offline_servers += 1
      }
    })

    data.result = servers
    return data
  }

  async getServerDetail(serverId: number): Promise<NezhaAPI> {
    await connection()
    this.ensureInitialized()

    // Find UUID by server ID
    const uuid = await this.getKomariUuidById(serverId)

    try {
      // Get recent data for the specific node
      const recentResponse = await fetch(
        `${this.config?.baseUrl}/api/recent/${uuid}`,
        this.createFetchOptions(),
      )

      if (!recentResponse.ok) {
        const errorText = await recentResponse.text()
        throw new DriverOperationError(
          this.name,
          "getServerDetail",
          `HTTP ${recentResponse.status}: ${errorText}`,
        )
      }

      const recentData: KomariRecentResponse = await recentResponse.json()

      if (recentData.status !== "success" || !recentData.data || recentData.data.length === 0) {
        throw new DriverOperationError(
          this.name,
          "getServerDetail",
          "Invalid recent data response format",
        )
      }

      // Get server info from main data to find the server by UUID
      const mainResponse = await fetch(
        `${this.config?.baseUrl}/api/nodes`,
        this.createFetchOptions(),
      )
      const komariResponse: KomariAPIResponse = await this.handleFetchResponse(mainResponse)
      const komariServer = komariResponse.data.find((server) => server.uuid === uuid)

      if (!komariServer) {
        throw new DriverOperationError(
          this.name,
          "getServerDetail",
          `Server with UUID ${uuid} not found`,
        )
      }

      const timestamp = Date.now() / 1000
      const nezhaServer = this.convertKomariToNezha(komariServer, timestamp)

      // Update with recent stats
      this.updateServerWithRecentData(nezhaServer, recentData.data[0])

      return nezhaServer
    } catch (error) {
      console.warn(
        `Failed to get detailed data for server ${serverId}, falling back to basic data:`,
        error,
      )

      // Fallback to basic data if detailed fetch fails
      const mainData = await this.getServers()
      const server = mainData.result.find((s) => s.id === serverId)
      if (!server) {
        throw new DriverOperationError(
          this.name,
          "getServerDetail",
          `Server with ID ${serverId} not found`,
        )
      }
      // Convert to full NezhaAPI by adding missing properties
      return {
        ...server,
        ipv4: "",
        ipv6: "",
        valid_ip: "",
      }
    }
  }

  protected async onGetServerMonitor(_serverId: number): Promise<NezhaAPIMonitor[]> {
    // Komari doesn't support historical monitoring data
    console.warn("Monitor data not available in Komari mode")
    return []
  }

  protected async onGetServerIP(_serverId: number): Promise<string> {
    // Komari doesn't expose IP information
    console.warn("IP information not available in Komari mode")
    return ""
  }

  protected async onHealthCheck(): Promise<void> {
    this.ensureInitialized()

    const response = await fetch(`${this.config?.baseUrl}/api/nodes`, {
      ...this.createFetchOptions(),
      next: { revalidate: 60 }, // Cache health check for 1 minute
    })

    if (!response.ok) {
      throw new DriverOperationError(this.name, "healthCheck", `HTTP ${response.status}`)
    }

    const data = await response.json()
    if (!data || data.status !== "success") {
      throw new DriverOperationError(this.name, "healthCheck", "Invalid API response")
    }
  }

  /**
   * Validate Komari API during initialization (without ensureInitialized check)
   */
  private async validateKomariAPI(): Promise<void> {
    if (!this.config?.baseUrl) {
      throw new Error("Base URL is not configured")
    }

    const response = await fetch(`${this.config.baseUrl}/api/nodes`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    if (!data || data.status !== "success") {
      throw new Error("Invalid API response")
    }
  }

  /**
   * Helper function to find UUID by server ID
   */
  private async getKomariUuidById(serverId: number): Promise<string> {
    // Check cache first
    const cachedUuid = this.serverUuidMap.get(serverId)
    if (cachedUuid) {
      return cachedUuid
    }

    this.ensureInitialized()

    const response = await fetch(`${this.config?.baseUrl}/api/nodes`, this.createFetchOptions())
    const resData: KomariAPIResponse = await this.handleFetchResponse(response)

    // Find server by matching the generated ID
    const server = resData.data.find((komariServer) => {
      const id = Math.abs(
        komariServer.uuid
          .split("-")
          .join("")
          .slice(0, 8)
          .split("")
          .reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0)
            return a & a
          }, 0),
      )
      // Update cache
      this.serverUuidMap.set(id, komariServer.uuid)
      return id === serverId
    })

    if (!server) {
      throw new DriverOperationError(
        this.name,
        "getKomariUuidById",
        `Server with ID ${serverId} not found`,
      )
    }

    return server.uuid
  }

  protected async onDispose(): Promise<void> {
    this.serverUuidMap.clear()
  }
}
