"use server"

import { NezhaAPI, ServerApi } from "@/app/types/nezha-api"
import { MakeOptional } from "@/app/types/utils"
import getEnv from "@/lib/env-entry"
import { unstable_noStore as noStore } from "next/cache"

export async function GetNezhaData() {
  noStore()

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
        const isOnline = timestamp - element.last_active <= 300
        element.online_status = isOnline

        if (isOnline) {
          data.live_servers += 1
        } else {
          data.offline_servers += 1
        }

        data.total_out_bandwidth += element.status.NetOutTransfer
        data.total_in_bandwidth += element.status.NetInTransfer
        data.total_in_speed += element.status.NetInSpeed
        data.total_out_speed += element.status.NetOutSpeed

        // Remove unwanted properties
        delete element.ipv4
        delete element.ipv6
        delete element.valid_ip

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
    const monitorData = resData.result

    if (!monitorData) {
      console.error("MonitorData fetch failed:", resData)
      throw new Error("MonitorData fetch failed: 'result' field is missing")
    }

    return monitorData
  } catch (error) {
    console.error("GetServerMonitor error:", error)
    throw error
  }
}

export async function GetServerIP({ server_id }: { server_id: number }): Promise<string> {
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
      element.online_status = timestamp - element.last_active <= 300
      delete element.ipv4
      delete element.ipv6
      delete element.valid_ip
      return element
    })[0]

    return detailData
  } catch (error) {
    console.error("GetServerDetail error:", error)
    throw error // Rethrow the error to be handled by the caller
  }
}
