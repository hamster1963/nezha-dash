import type { NezhaAPISafe } from "@/app/types/nezha-api"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNezhaInfo(serverInfo: NezhaAPISafe) {
  return {
    ...serverInfo,
    cpu: serverInfo.status.CPU,
    process: serverInfo.status.ProcessCount || 0,
    up: serverInfo.status.NetOutSpeed / 1024 / 1024 || 0,
    down: serverInfo.status.NetInSpeed / 1024 / 1024 || 0,
    last_active_time_string: serverInfo.last_active
      ? new Date(serverInfo.last_active * 1000).toLocaleString()
      : "",
    online: serverInfo.online_status,
    uptime: serverInfo.status.Uptime || 0,
    version: serverInfo.host.Version || null,
    tcp: serverInfo.status.TcpConnCount || 0,
    udp: serverInfo.status.UdpConnCount || 0,
    arch: serverInfo.host.Arch || "",
    mem_total: serverInfo.host.MemTotal || 0,
    swap_total: serverInfo.host.SwapTotal || 0,
    disk_total: serverInfo.host.DiskTotal || 0,
    platform: serverInfo.host.Platform || "",
    platform_version: serverInfo.host.PlatformVersion || "",
    mem: (serverInfo.status.MemUsed / serverInfo.host.MemTotal) * 100 || 0,
    swap: (serverInfo.status.SwapUsed / serverInfo.host.SwapTotal) * 100 || 0,
    disk: (serverInfo.status.DiskUsed / serverInfo.host.DiskTotal) * 100 || 0,
    stg: (serverInfo.status.DiskUsed / serverInfo.host.DiskTotal) * 100 || 0,
    net_out_transfer: serverInfo.status.NetOutTransfer || 0,
    net_in_transfer: serverInfo.status.NetInTransfer || 0,
    country_code: serverInfo.host.CountryCode,
    cpu_info: serverInfo.host.CPU || [],
    gpu_info: serverInfo.host.GPU || [],
    load_1: serverInfo.status.Load1?.toFixed(2) || 0.0,
    load_5: serverInfo.status.Load5?.toFixed(2) || 0.0,
    load_15: serverInfo.status.Load15?.toFixed(2) || 0.0,
  }
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

export function getDaysBetweenDates(date1: string, date2: string): number {
  const oneDay = 24 * 60 * 60 * 1000 // 一天的毫秒数
  const firstDate = new Date(date1)
  const secondDate = new Date(date2)

  // 计算两个日期之间的天数差异
  return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay))
}

export const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText)
      }
      return res.json()
    })
    .then((data) => data.data)
    .catch((err) => {
      console.error(err)
      throw err
    })

export const nezhaFetcher = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    // @ts-expect-error - res.json() returns a Promise<any>
    error.info = await res.json()
    // @ts-expect-error - res.status is a number
    error.status = res.status
    throw error
  }

  return res.json()
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }
  if (seconds >= 0) {
    return `${seconds}s`
  }
  return "0s"
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const seconds = date.getSeconds().toString().padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
