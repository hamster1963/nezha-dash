"use server"

import { connection } from "next/server"
import type { NezhaAPI, NezhaAPIMonitor, ServerApi } from "@/app/types/nezha-api"
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

export async function GetNezhaData() {
  await connection()

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
