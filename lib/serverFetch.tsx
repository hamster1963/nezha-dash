"use server"

import { connection } from "next/server"
import type {
  KomariAPIResponse,
  KomariRecentResponse,
  KomariServer,
  NezhaAPI,
  NezhaAPIMonitor,
  ServerApi,
} from "@/app/types/nezha-api"
import type { MakeOptional } from "@/app/types/utils"
import getEnv from "@/lib/env-entry"

// Packet loss calculation utility
function calculatePacketLoss(delays: number[]): number[] {
  if (!delays || delays.length === 0) return []

  const packetLossRates: number[] = []
  const windowSize = Math.min(10, Math.max(3, Math.floor(delays.length / 10))) // Adaptive window size
  const timeoutThreshold = 3000 // Consider delays over 3000ms as potential packet loss
  const extremeDelayThreshold = 10000 // Delays over 10000ms indicate severe issues

  for (let i = 0; i < delays.length; i++) {
    const currentDelay = delays[i]
    let lossRate = 0

    // Calculate packet loss based on delay characteristics
    if (currentDelay === 0 || currentDelay === null || currentDelay === undefined) {
      // No response - 100% packet loss
      lossRate = 100
    } else if (currentDelay >= extremeDelayThreshold) {
      // Extreme delay suggests high packet loss
      lossRate = Math.min(95, 60 + (currentDelay - extremeDelayThreshold) / 1000)
    } else if (currentDelay >= timeoutThreshold) {
      // High delay suggests some packet loss
      lossRate = Math.min(50, (currentDelay - timeoutThreshold) / 200)
    } else {
      // Analyze variance in a sliding window
      const start = Math.max(0, i - Math.floor(windowSize / 2))
      const end = Math.min(delays.length, i + Math.ceil(windowSize / 2))
      const windowDelays = delays.slice(start, end).filter((d) => d > 0)

      if (windowDelays.length > 2) {
        const mean = windowDelays.reduce((sum, d) => sum + d, 0) / windowDelays.length
        const variance =
          windowDelays.reduce((sum, d) => sum + (d - mean) ** 2, 0) / windowDelays.length
        const standardDeviation = Math.sqrt(variance)
        const coefficientOfVariation = standardDeviation / mean

        // High variation suggests network instability and potential packet loss
        if (coefficientOfVariation > 0.8) {
          lossRate = Math.min(25, coefficientOfVariation * 15)
        } else if (coefficientOfVariation > 0.5) {
          lossRate = Math.min(10, coefficientOfVariation * 8)
        } else if (coefficientOfVariation > 0.3) {
          lossRate = Math.min(5, coefficientOfVariation * 5)
        }

        // Additional factor: if current delay is significantly higher than average
        if (currentDelay > mean * 2.5) {
          lossRate += Math.min(15, (currentDelay / mean - 2.5) * 10)
        }
      }
    }

    // Smooth the packet loss rate with exponential moving average
    if (i > 0) {
      const alpha = 0.3 // Smoothing factor
      lossRate = alpha * lossRate + (1 - alpha) * packetLossRates[i - 1]
    }

    // Ensure packet loss rate is within bounds
    packetLossRates.push(Math.max(0, Math.min(100, lossRate)))
  }

  return packetLossRates.map((rate) => Number(rate.toFixed(2)))
}

// Convert Komari server data to Nezha-compatible format
function convertKomariToNezha(komariServer: KomariServer, timestamp: number): NezhaAPI {
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

  return {
    id: id,
    name: komariServer.name,
    tag: komariServer.tags || komariServer.group || "",
    last_active: timestamp, // Use current timestamp as servers from Komari are considered active
    online_status: true, // Komari only returns active servers
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
      BootTime: 0, // Not available in Komari data
      CountryCode: komariServer.region,
      Version: "",
      GPU: komariServer.gpu_name ? [komariServer.gpu_name] : [],
    },
    status: {
      CPU: 0, // Runtime data not available in Komari static info
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

async function GetKomariRecentData(uuid: string): Promise<NezhaAPI> {
  let komariBaseUrl = getEnv("KomariBaseUrl")
  if (!komariBaseUrl) {
    console.error("KomariBaseUrl is not set")
    throw new Error("KomariBaseUrl is not set")
  }

  // Remove trailing slash
  komariBaseUrl = komariBaseUrl.replace(/\/$/, "")

  try {
    // Get recent data for the specific node
    const recentResponse = await fetch(`${komariBaseUrl}/api/recent/${uuid}`, {
      next: {
        revalidate: 0,
      },
    })

    if (!recentResponse.ok) {
      const errorText = await recentResponse.text()
      throw new Error(`Failed to fetch Komari recent data: ${recentResponse.status} ${errorText}`)
    }

    const recentData: KomariRecentResponse = await recentResponse.json()

    if (recentData.status !== "success" || !recentData.data || recentData.data.length === 0) {
      throw new Error("Komari recent data fetch failed: invalid response format")
    }

    // Get server info from main data to find the server by UUID
    const mainResponse = await fetch(`${komariBaseUrl}/api/nodes`, {
      next: {
        revalidate: 0,
      },
    })
    const komariResponse: KomariAPIResponse = await mainResponse.json()
    const komariServer = komariResponse.data.find((server) => server.uuid === uuid)

    if (!komariServer) {
      throw new Error(`Server with UUID ${uuid} not found`)
    }

    const timestamp = Date.now() / 1000
    const recent = recentData.data[0]

    // Convert to Nezha format with recent data
    const nezhaServer = convertKomariToNezha(komariServer, timestamp)

    // Update with recent stats
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
      Temperatures: 0, // Not available in Komari data
      GPU: 0, // Not available in Komari data
    }

    return nezhaServer
  } catch (error) {
    console.error("GetKomariRecentData error:", error)
    throw error
  }
}

async function GetKomariDataWithDetails(): Promise<ServerApi> {
  let komariBaseUrl = getEnv("KomariBaseUrl")
  if (!komariBaseUrl) {
    console.error("KomariBaseUrl is not set")
    throw new Error("KomariBaseUrl is not set")
  }

  // Remove trailing slash
  komariBaseUrl = komariBaseUrl.replace(/\/$/, "")

  try {
    // First get the server list
    const response = await fetch(`${komariBaseUrl}/api/nodes`, {
      next: {
        revalidate: 0,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch Komari data: ${response.status} ${errorText}`)
    }

    const resData: KomariAPIResponse = await response.json()

    if (resData.status !== "success" || !resData.data) {
      throw new Error("Komari data fetch failed: invalid response format")
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
        // Try to get recent data for this server
        const recentResponse = await fetch(`${komariBaseUrl}/api/recent/${komariServer.uuid}`, {
          next: {
            revalidate: 0,
          },
        })

        const nezhaServer = convertKomariToNezha(komariServer, timestamp)

        if (recentResponse.ok) {
          const recentData: KomariRecentResponse = await recentResponse.json()
          if (recentData.status === "success" && recentData.data && recentData.data.length > 0) {
            const recent = recentData.data[0]

            // Update server status with recent data
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
              Temperatures: 0, // Not available in Komari data
              GPU: 0, // Not available in Komari data
            }
            nezhaServer.online_status = true
          }
        }

        // Remove unwanted properties for safe output
        const safeServer = { ...nezhaServer }
        safeServer.ipv4 = undefined as any
        safeServer.ipv6 = undefined as any
        safeServer.valid_ip = undefined as any
        return safeServer
      } catch (error) {
        console.warn(`Failed to fetch recent data for server ${komariServer.uuid}:`, error)
        // Return server without recent data if fetch fails
        const nezhaServer = convertKomariToNezha(komariServer, timestamp)
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
  } catch (error) {
    console.error("GetKomariDataWithDetails error:", error)
    throw error
  }
}

// Helper function to find UUID by server ID in Komari mode
async function getKomariUuidById(serverId: number): Promise<string> {
  let komariBaseUrl = getEnv("KomariBaseUrl")
  if (!komariBaseUrl) {
    throw new Error("KomariBaseUrl is not set")
  }

  komariBaseUrl = komariBaseUrl.replace(/\/$/, "")

  const response = await fetch(`${komariBaseUrl}/api/nodes`, {
    next: {
      revalidate: 0,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Komari server list")
  }

  const resData: KomariAPIResponse = await response.json()

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
    return id === serverId
  })

  if (!server) {
    throw new Error(`Server with ID ${serverId} not found`)
  }

  return server.uuid
}

export async function GetNezhaData() {
  await connection()

  // Check if Komari mode is enabled
  const isKomariMode = getEnv("NEXT_PUBLIC_Komari") === "true"

  if (isKomariMode) {
    return GetKomariDataWithDetails()
  }

  let nezhaBaseUrl = getEnv("NezhaBaseUrl")
  if (!nezhaBaseUrl) {
    console.error("NezhaBaseUrl is not set")
    throw new Error("NezhaBaseUrl is not set")
  }

  // Remove trailing slash
  nezhaBaseUrl = nezhaBaseUrl.replace(/\/$/, "")

  try {
    const response = await fetch(`${nezhaBaseUrl}/api/v1/server/details`, {
      headers: {
        Authorization: getEnv("NezhaAuth") as string,
      },
      next: {
        revalidate: 0,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch data: ${response.status} ${errorText}`)
    }

    const resData = await response.json()

    if (!resData.result) {
      throw new Error("NezhaData fetch failed: 'result' field is missing")
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

        // Remove unwanted properties
        element.ipv4 = undefined
        element.ipv6 = undefined
        element.valid_ip = undefined

        return element
      },
    )

    return data
  } catch (error) {
    console.error("GetNezhaData error:", error)
    throw error // Rethrow the error to be caught by the caller
  }
}

export async function GetServerMonitor({ server_id }: { server_id: number }) {
  await connection()

  // Check if Komari mode is enabled - if so, return empty array as Komari doesn't support monitor data
  const isKomariMode = getEnv("NEXT_PUBLIC_Komari") === "true"
  if (isKomariMode) {
    console.warn("Monitor data not available in Komari mode")
    return []
  }

  let nezhaBaseUrl = getEnv("NezhaBaseUrl")
  if (!nezhaBaseUrl) {
    console.error("NezhaBaseUrl is not set")
    throw new Error("NezhaBaseUrl is not set")
  }

  // Remove trailing slash
  nezhaBaseUrl = nezhaBaseUrl.replace(/\/$/, "")

  try {
    const response = await fetch(`${nezhaBaseUrl}/api/v1/monitor/${server_id}`, {
      headers: {
        Authorization: getEnv("NezhaAuth") as string,
      },
      next: {
        revalidate: 0,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch data: ${response.status} ${errorText}`)
    }

    const resData = await response.json()
    const monitorData = resData.result as NezhaAPIMonitor[]

    if (!monitorData) {
      console.error("MonitorData fetch failed:", resData)
      throw new Error("MonitorData fetch failed: 'result' field is missing")
    }

    // Check if packet loss calculation is enabled (default to true for backward compatibility)
    const enablePacketLoss = getEnv("EnablePacketLossCalculation") !== "false"

    // Calculate packet loss for each monitor if enabled
    const enhancedMonitorData = monitorData.map((monitor) => {
      if (enablePacketLoss && monitor.avg_delay?.length > 0) {
        const packetLossRates = calculatePacketLoss(monitor.avg_delay)
        return {
          ...monitor,
          packet_loss: packetLossRates,
        } as NezhaAPIMonitor
      }
      return monitor
    })

    return enhancedMonitorData
  } catch (error) {
    console.error("GetServerMonitor error:", error)
    throw error
  }
}

export async function GetServerIP({ server_id }: { server_id: number }): Promise<string> {
  await connection()

  // Check if Komari mode is enabled - if so, return empty string as Komari doesn't expose IP info
  const isKomariMode = getEnv("NEXT_PUBLIC_Komari") === "true"
  if (isKomariMode) {
    console.warn("IP information not available in Komari mode")
    return ""
  }

  let nezhaBaseUrl = getEnv("NezhaBaseUrl")
  if (!nezhaBaseUrl) {
    console.error("NezhaBaseUrl is not set")
    throw new Error("NezhaBaseUrl is not set")
  }

  // Remove trailing slash
  nezhaBaseUrl = nezhaBaseUrl.replace(/\/$/, "")

  try {
    const response = await fetch(`${nezhaBaseUrl}/api/v1/server/details`, {
      headers: {
        Authorization: getEnv("NezhaAuth") as string,
      },
      next: {
        revalidate: 0,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch data: ${response.status} ${errorText}`)
    }

    const resData = await response.json()

    if (!resData.result) {
      throw new Error("NezhaData fetch failed: 'result' field is missing")
    }

    const nezhaData = resData.result as NezhaAPI[]

    // Find the server with the given ID
    const server = nezhaData.find((element) => element.id === server_id)

    if (!server) {
      throw new Error(`Server with ID ${server_id} not found`)
    }

    return server?.valid_ip || server?.ipv4 || server?.ipv6 || ""
  } catch (error) {
    console.error("GetNezhaData error:", error)
    throw error // Rethrow the error to be caught by the caller
  }
}

export async function GetServerDetail({ server_id }: { server_id: number }) {
  await connection()

  // Check if Komari mode is enabled
  const isKomariMode = getEnv("NEXT_PUBLIC_Komari") === "true"
  if (isKomariMode) {
    // For Komari mode, find the UUID by server ID and get detailed data
    try {
      const uuid = await getKomariUuidById(server_id)
      const serverDetail = await GetKomariRecentData(uuid)
      return serverDetail
    } catch (error) {
      console.warn(
        "Failed to get detailed data for server %s, falling back to basic data:",
        server_id,
        error,
      )
      // Fallback to basic data if detailed fetch fails
      const mainData = await GetKomariDataWithDetails()
      const server = mainData.result.find((s) => s.id === server_id)
      if (!server) {
        throw new Error(`Server with ID ${server_id} not found in Komari data`)
      }
      return server
    }
  }

  let nezhaBaseUrl = getEnv("NezhaBaseUrl")
  if (!nezhaBaseUrl) {
    console.error("NezhaBaseUrl is not set")
    throw new Error("NezhaBaseUrl is not set")
  }

  // Remove trailing slash
  nezhaBaseUrl = nezhaBaseUrl.replace(/\/$/, "")

  try {
    const response = await fetch(`${nezhaBaseUrl}/api/v1/server/details?id=${server_id}`, {
      headers: {
        Authorization: getEnv("NezhaAuth") as string,
      },
      next: {
        revalidate: 0,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch data: ${response.status} ${errorText}`)
    }

    const resData = await response.json()
    const detailDataList = resData.result

    if (!detailDataList || !Array.isArray(detailDataList) || detailDataList.length === 0) {
      console.error("MonitorData fetch failed:", resData)
      throw new Error("MonitorData fetch failed: 'result' field is missing or empty")
    }

    const timestamp = Date.now() / 1000
    const detailData = detailDataList.map((element) => {
      element.online_status = timestamp - element.last_active <= 180
      element.ipv4 = undefined
      element.ipv6 = undefined
      element.valid_ip = undefined
      return element
    })[0]

    return detailData
  } catch (error) {
    console.error("GetServerDetail error:", error)
    throw error // Rethrow the error to be handled by the caller
  }
}
