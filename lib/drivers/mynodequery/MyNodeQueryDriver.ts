/**
 * MyNodeQuery monitoring system driver implementation
 */

import { connection } from "next/server"
import { BaseDriver } from "../base"
import type {
  DriverConfig,
  MyNodeQueryDetailResponse,
  MyNodeQueryListResponse,
  MyNodeQueryNode,
  MyNodeQueryOverview,
  NezhaAPI,
  NezhaAPIMonitor,
  ServerApi,
} from "../types"
import { DriverOperationError } from "../types"

type DetailCacheEntry = {
  timestamp: number
  overview: MyNodeQueryOverview | null
}

export class MyNodeQueryDriver extends BaseDriver {
  private serverIdMap = new Map<number, string>()
  private nodeCache = new Map<string, MyNodeQueryNode>()
  private detailCache = new Map<string, DetailCacheEntry>()
  private readonly detailCacheTtl = 30_000 // cache detailed overview for 30 seconds
  private sessionCookie: string | null = null
  private sessionCookieTimestamp = 0
  private readonly sessionTtl = 10 * 60 * 1000
  private csrfToken: string | null = null

  constructor() {
    super("mynodequery", {
      supportsMonitoring: false,
      supportsRealTimeData: true,
      supportsHistoricalData: false,
      supportsIpInfo: true,
      supportsPacketLoss: false,
      supportsAlerts: false,
    })
  }

  protected async onInitialize(_config: DriverConfig): Promise<void> {
    try {
      await this.validateApi()
    } catch (error) {
      throw new DriverOperationError(
        this.name,
        "initialize",
        `Failed to connect to MyNodeQuery API: ${error}`,
      )
    }
  }

  async getServers(): Promise<ServerApi> {
    await connection()
    this.ensureInitialized()
    await this.ensureSession()

    const nodeList = await this.fetchNodeList()
    const timestamp = Math.floor(Date.now() / 1000)
    const data: ServerApi = {
      live_servers: 0,
      offline_servers: 0,
      total_out_bandwidth: 0,
      total_in_bandwidth: 0,
      total_in_speed: 0,
      total_out_speed: 0,
      result: [],
    }

    // Refresh caches with the latest snapshot
    this.nodeCache.clear()
    const uniqueIdSet = new Set<string>()
    for (const node of nodeList) {
      this.nodeCache.set(node.UniqueID, node)
      uniqueIdSet.add(node.UniqueID)
    }

    const serverPromises = nodeList.map(async (node, index) => {
      const overview = await this.getOverviewWithCache(node.UniqueID)
      const nezhaServer = this.convertNodeToNezha(
        node,
        overview,
        timestamp,
        nodeList.length - index,
      )

      if (nezhaServer.online_status) {
        data.live_servers += 1
        data.total_out_bandwidth += nezhaServer.status.NetOutTransfer || 0
        data.total_in_bandwidth += nezhaServer.status.NetInTransfer || 0
        data.total_in_speed += nezhaServer.status.NetInSpeed || 0
        data.total_out_speed += nezhaServer.status.NetOutSpeed || 0
      } else {
        data.offline_servers += 1
      }

      return nezhaServer
    })

    data.result = await Promise.all(serverPromises)

    // Prune stale detail cache entries
    for (const key of this.detailCache.keys()) {
      if (!uniqueIdSet.has(key)) {
        this.detailCache.delete(key)
      }
    }

    return data
  }

  async getServerDetail(serverId: number): Promise<NezhaAPI> {
    await connection()
    this.ensureInitialized()

    const uniqueId = await this.getUniqueIdByServerId(serverId)
    const node = await this.getNodeByUniqueId(uniqueId)

    let overview: MyNodeQueryOverview | null = null
    try {
      overview = await this.fetchNodeDetail(uniqueId)
      this.detailCache.set(uniqueId, { timestamp: Date.now(), overview })
    } catch (error) {
      console.warn(
        `Failed to fetch detailed data for server ${serverId} (${uniqueId}), returning cached/basic data:`,
        error,
      )
      overview = this.detailCache.get(uniqueId)?.overview ?? null
    }

    const timestamp = Math.floor(Date.now() / 1000)
    return this.convertNodeToNezha(node, overview, timestamp, 0)
  }

  protected async onGetServerMonitor(_serverId: number): Promise<NezhaAPIMonitor[]> {
    console.warn("Monitor data not available in MyNodeQuery mode")
    return []
  }

  protected async onGetServerIP(serverId: number): Promise<string> {
    this.ensureInitialized()
    await this.ensureSession()

    const uniqueId = await this.getUniqueIdByServerId(serverId)
    const node = await this.getNodeByUniqueId(uniqueId)

    const preferredIps = [node.IPv4, node.IPv6].filter(Boolean)
    for (const ipCandidate of preferredIps) {
      const normalized = this.normalizeIp(ipCandidate)
      if (normalized) {
        return normalized
      }
    }

    try {
      const overview = await this.fetchNodeDetail(uniqueId)
      const overviewIps = [overview?.IP, overview?.IPv4, overview?.IPv6].filter(Boolean)
      for (const ip of overviewIps) {
        const normalized = this.normalizeIp(ip)
        if (normalized) {
          return normalized
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch IP information for server ${serverId}:`, error)
    }

    throw new DriverOperationError(this.name, "getServerIP", "IP information not available")
  }

  protected async onHealthCheck(): Promise<void> {
    this.ensureInitialized()
    await this.validateApi()
  }

  protected async onDispose(): Promise<void> {
    this.serverIdMap.clear()
    this.nodeCache.clear()
    this.detailCache.clear()
    this.sessionCookie = null
    this.sessionCookieTimestamp = 0
    this.csrfToken = null
  }

  private async fetchNodeList(): Promise<MyNodeQueryNode[]> {
    await this.ensureSession()
    if (!this.sessionCookie) {
      throw new DriverOperationError(this.name, "getServers", "Session cookie is unavailable")
    }
    if (!this.csrfToken) {
      throw new DriverOperationError(this.name, "getServers", "CSRF token is unavailable")
    }

    const response = await fetch(`${this.config?.baseUrl}/Dashboard/GetNodes`, {
      ...this.createFetchOptions({
        Cookie: this.sessionCookie || "",
        "X-CSRF-TOKEN": this.csrfToken,
      }),
      method: "POST",
      body: "{}",
    })

    const resData: MyNodeQueryListResponse = await this.handleFetchResponse(response)

    if (!resData.Success || !Array.isArray(resData.Data)) {
      throw new DriverOperationError(this.name, "getServers", "Invalid MyNodeQuery list response")
    }

    return resData.Data
  }

  private async fetchNodeDetail(uniqueId: string): Promise<MyNodeQueryOverview | null> {
    await this.ensureSession()
    if (!this.sessionCookie) {
      throw new DriverOperationError(this.name, "getServerDetail", "Session cookie is unavailable")
    }
    if (!this.csrfToken) {
      throw new DriverOperationError(this.name, "getServerDetail", "CSRF token is unavailable")
    }

    const response = await fetch(`${this.config?.baseUrl}/Detail/GetDetail`, {
      ...this.createFetchOptions({
        Cookie: this.sessionCookie || "",
        "X-CSRF-TOKEN": this.csrfToken,
      }),
      method: "POST",
      body: JSON.stringify({ UniqueID: uniqueId }),
    })

    const resData: MyNodeQueryDetailResponse = await this.handleFetchResponse(response)

    if (!resData?.Success) {
      throw new DriverOperationError(
        this.name,
        "getServerDetail",
        resData?.Message || "Failed to fetch MyNodeQuery detail data",
      )
    }

    return resData?.Data?.Overview ?? null
  }

  private async getOverviewWithCache(uniqueId: string): Promise<MyNodeQueryOverview | null> {
    const cached = this.detailCache.get(uniqueId)
    if (cached && Date.now() - cached.timestamp < this.detailCacheTtl) {
      return cached.overview
    }

    try {
      const overview = await this.fetchNodeDetail(uniqueId)
      this.detailCache.set(uniqueId, { timestamp: Date.now(), overview })
      return overview
    } catch (error) {
      console.warn(`Failed to update detailed overview for ${uniqueId}:`, error)
      this.detailCache.set(uniqueId, { timestamp: Date.now(), overview: null })
      return null
    }
  }

  /**
   * Ensure we have a valid antiforgery session cookie before calling POST endpoints.
   */
  private async ensureSession(): Promise<void> {
    if (
      this.sessionCookie &&
      this.csrfToken &&
      Date.now() - this.sessionCookieTimestamp < this.sessionTtl
    ) {
      return
    }

    if (!this.config?.baseUrl) {
      throw new DriverOperationError(this.name, "ensureSession", "Base URL is not configured")
    }

    const response = await fetch(`${this.config.baseUrl}/Dashboard`, {
      method: "GET",
      headers: {
        "User-Agent": "NezhaDash/1.0 (+https://github.com/hamster1963/nezha-dash)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    })

    if (!response.ok) {
      throw new DriverOperationError(
        this.name,
        "ensureSession",
        `Failed to establish session (HTTP ${response.status})`,
      )
    }

    const headersWithRaw = response.headers as unknown as {
      raw?: () => Record<string, string[]>
    }
    const rawHeaders = headersWithRaw.raw ? headersWithRaw.raw() : undefined
    let cookieHeaders: string[] = []
    if (rawHeaders?.["set-cookie"]) {
      cookieHeaders = rawHeaders["set-cookie"]
    } else {
      const singleCookie = response.headers.get("set-cookie")
      if (singleCookie) {
        cookieHeaders = [singleCookie]
      }
    }

    const formattedCookies = cookieHeaders
      .map((cookie) => cookie?.split(";")[0]?.trim())
      .filter((cookie): cookie is string => Boolean(cookie))

    if (formattedCookies.length === 0) {
      throw new DriverOperationError(
        this.name,
        "ensureSession",
        "Antiforgery cookie not received from MyNodeQuery dashboard",
      )
    }

    const html = await response.text()

    const tokenMatch =
      html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/i) ||
      html.match(/name='__RequestVerificationToken'[^>]*value='([^']+)'/i) ||
      html.match(/__RequestVerificationToken"\s*:\s*"([^"]+)"/i)

    const token = tokenMatch?.[1]?.trim()
    if (!token) {
      this.csrfToken = null
      throw new DriverOperationError(
        this.name,
        "ensureSession",
        "CSRF token not found in MyNodeQuery dashboard response",
      )
    }

    this.sessionCookie = formattedCookies.join("; ")
    this.sessionCookieTimestamp = Date.now()
    this.csrfToken = token
  }

  private convertNodeToNezha(
    node: MyNodeQueryNode,
    overview: MyNodeQueryOverview | null,
    timestamp: number,
    displayIndex = 0,
  ): NezhaAPI {
    const id = this.generateNumericId(node.UniqueID)
    this.serverIdMap.set(id, node.UniqueID)

    const isOnline = node.Status?.toLowerCase() === "online"
    const lastActive =
      timestamp - (isOnline ? 0 : this.parseDurationToSeconds(node.LastUptime || "")) || timestamp

    const uptimeSeconds = overview ? this.parseDurationToSeconds(overview.Uptime) : 0
    const bootTime = uptimeSeconds > 0 ? Math.max(0, Math.floor(timestamp - uptimeSeconds)) : 0

    const rawMemTotal = this.parseDataSize(overview?.RAMTotal)
    const memTotal = rawMemTotal > 0 ? rawMemTotal : 100
    const memUsed =
      overview?.RAMUsage !== undefined && overview?.RAMUsage !== null
        ? this.parseDataSize(overview.RAMUsage)
        : (this.safeNumber(node.RAM) / 100) * memTotal

    const rawDiskTotal = this.parseDataSize(overview?.DiskTotal)
    const diskTotal = rawDiskTotal > 0 ? rawDiskTotal : 100
    const diskUsed =
      overview?.DiskUsage !== undefined && overview?.DiskUsage !== null
        ? this.parseDataSize(overview.DiskUsage)
        : (this.safeNumber(node.Disk) / 100) * diskTotal

    const [load1, load5, load15] = this.parseLoadAverages(overview?.Load, node.Load)

    const NetInTransfer = this.parseDataSize(overview?.RX)
    const NetOutTransfer = this.parseDataSize(overview?.TX)

    const NetInSpeed = this.parseSpeed(overview?.RXSpeed || node.RXSpeed)
    const NetOutSpeed = this.parseSpeed(overview?.TXSpeed || node.TXSpeed)

    const cpuUsage =
      overview && typeof overview.LoadCPURate === "number"
        ? this.clampPercentage(overview.LoadCPURate)
        : this.clampPercentage(node.Load)

    const countryCode = this.normalizeCountryCode(overview?.Country || node.Country)

    return {
      id,
      name: node.Name,
      tag: countryCode,
      last_active: lastActive,
      online_status: isOnline,
      ipv4: "",
      ipv6: "",
      valid_ip: "",
      display_index: displayIndex,
      hide_for_guest: false,
      host: {
        Platform: overview?.OSName || "",
        PlatformVersion: overview?.OSkernel || "",
        CPU: overview?.CPUName ? [overview.CPUName] : [],
        MemTotal: memTotal,
        DiskTotal: diskTotal,
        SwapTotal: 0,
        Arch: overview?.CPUFlags || "",
        Virtualization: "",
        BootTime: bootTime,
        CountryCode: countryCode,
        Version: "",
        GPU: [],
      },
      status: {
        CPU: cpuUsage,
        MemUsed: memUsed > 0 ? memUsed : 0,
        SwapUsed: 0,
        DiskUsed: diskUsed > 0 ? diskUsed : 0,
        NetInTransfer,
        NetOutTransfer,
        NetInSpeed,
        NetOutSpeed,
        Uptime: uptimeSeconds,
        Load1: load1,
        Load5: load5,
        Load15: load15,
        TcpConnCount: 0,
        UdpConnCount: 0,
        ProcessCount: 0,
        Temperatures: 0,
        GPU: 0,
      },
    }
  }

  private async getUniqueIdByServerId(serverId: number): Promise<string> {
    const cached = this.serverIdMap.get(serverId)
    if (cached) {
      return cached
    }

    const nodeList = await this.fetchNodeList()
    for (const node of nodeList) {
      const id = this.generateNumericId(node.UniqueID)
      this.serverIdMap.set(id, node.UniqueID)
      this.nodeCache.set(node.UniqueID, node)
      if (id === serverId) {
        return node.UniqueID
      }
    }

    throw new DriverOperationError(
      this.name,
      "getUniqueIdByServerId",
      `Server with ID ${serverId} not found`,
    )
  }

  private async getNodeByUniqueId(uniqueId: string): Promise<MyNodeQueryNode> {
    const cached = this.nodeCache.get(uniqueId)
    if (cached) {
      return cached
    }

    const nodeList = await this.fetchNodeList()
    for (const node of nodeList) {
      this.nodeCache.set(node.UniqueID, node)
      const id = this.generateNumericId(node.UniqueID)
      this.serverIdMap.set(id, node.UniqueID)
      if (node.UniqueID === uniqueId) {
        return node
      }
    }

    throw new DriverOperationError(
      this.name,
      "getNodeByUniqueId",
      `Server with UniqueID ${uniqueId} not found`,
    )
  }

  private generateNumericId(uniqueId: string): number {
    if (!uniqueId) return 0
    const cleaned = uniqueId.replace(/[^0-9a-f]/gi, "").slice(0, 12)
    if (cleaned) {
      return Number.parseInt(cleaned, 16)
    }

    let hash = 0
    for (let i = 0; i < uniqueId.length; i += 1) {
      hash = (hash << 5) - hash + uniqueId.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }

  private parseDataSize(value?: string | number | null): number {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0
    }
    if (!value) return 0

    const normalized = value.toString().trim().toUpperCase()
    if (normalized === "N/A" || normalized === "--") return 0

    const match = normalized.match(/([\d.]+)\s*(B|KB|MB|GB|TB|PB)/)
    if (!match) return 0

    const amount = Number.parseFloat(match[1])
    const unit = match[2]
    if (!Number.isFinite(amount)) return 0

    const multipliers: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
      PB: 1024 ** 5,
    }

    return amount * (multipliers[unit] || 1)
  }

  private parseSpeed(value?: string | number | null): number {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0
    }
    if (!value) return 0

    const normalized = value.toString().trim().toUpperCase()
    if (normalized === "N/A" || normalized === "--") return 0

    const match = normalized.match(/([\d.]+)\s*(B|KB|MB|GB|TB)\/S/)
    if (!match) return 0

    const amount = Number.parseFloat(match[1])
    const unit = match[2]
    if (!Number.isFinite(amount)) return 0

    const multipliers: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
    }

    return amount * (multipliers[unit] || 1)
  }

  private parseLoadAverages(
    loadString?: string | null,
    fallback?: number,
  ): [number, number, number] {
    if (loadString) {
      const parts = loadString
        .split(/\s+/)
        .map((part) => Number.parseFloat(part))
        .filter((num) => Number.isFinite(num))

      if (parts.length >= 3) {
        return [parts[0], parts[1], parts[2]]
      }
      if (parts.length === 1) {
        return [parts[0], parts[0], parts[0]]
      }
    }

    const fallbackValue = Number.isFinite(fallback) ? Number(fallback) : 0
    return [fallbackValue, fallbackValue, fallbackValue]
  }

  private parseDurationToSeconds(value: string): number {
    if (!value) return 0

    const normalized = value.replace(/[^0-9a-zA-Z\u4e00-\u9fa5.]/g, "")
    const regex =
      /(\d+(?:\.\d+)?)(天|日|小时|時|h|H|分|分钟|分鐘|m|M|秒钟|秒|s|S|day|days|hour|hours|minute|minutes|second|seconds)/g

    let totalSeconds = 0
    let match = regex.exec(normalized)
    while (match !== null) {
      const amount = Number.parseFloat(match[1])
      if (!Number.isFinite(amount)) continue

      const unit = match[2].toLowerCase()
      switch (unit) {
        case "天":
        case "日":
        case "day":
        case "days":
        case "d":
          totalSeconds += amount * 86400
          break
        case "小时":
        case "時":
        case "hour":
        case "hours":
        case "h":
          totalSeconds += amount * 3600
          break
        case "分":
        case "分钟":
        case "分鐘":
        case "minute":
        case "minutes":
        case "m":
          totalSeconds += amount * 60
          break
        case "秒钟":
        case "秒":
        case "second":
        case "seconds":
        case "s":
          totalSeconds += amount
          break
        default:
          break
      }

      match = regex.exec(normalized)
    }

    return totalSeconds
  }

  private normalizeCountryCode(country?: string): string {
    if (!country) return ""
    return country.trim().toUpperCase()
  }

  private normalizeIp(ip?: string): string {
    if (!ip) return ""
    const trimmed = ip.trim()
    if (!trimmed || trimmed === "N/A" || trimmed === "--" || trimmed.includes("*")) {
      return ""
    }
    return trimmed
  }

  private clampPercentage(value: number | undefined): number {
    if (!Number.isFinite(value)) return 0
    return Math.min(100, Math.max(0, Number(value)))
  }

  private safeNumber(value: number | undefined): number {
    if (!Number.isFinite(value)) return 0
    return Number(value)
  }

  private async validateApi(): Promise<void> {
    if (!this.config?.baseUrl) {
      throw new Error("Base URL is not configured")
    }

    await this.ensureSession()
    if (!this.sessionCookie) {
      throw new Error("Session cookie not available")
    }
    if (!this.csrfToken) {
      throw new Error("CSRF token not available")
    }

    const response = await fetch(`${this.config.baseUrl}/Dashboard/GetNodes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: this.sessionCookie || "",
        "X-CSRF-TOKEN": this.csrfToken,
      },
      body: "{}",
      next: {
        revalidate: 60,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = (await response.json()) as MyNodeQueryListResponse
    if (!data.Success) {
      throw new Error(data.Message || "Invalid API response")
    }
  }
}
