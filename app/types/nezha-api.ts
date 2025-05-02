export type ServerApi = {
  live_servers: number
  offline_servers: number
  total_out_bandwidth: number
  total_in_bandwidth: number
  total_out_speed: number
  total_in_speed: number
  result: NezhaAPISafe[]
}

export type NezhaAPISafe = Omit<NezhaAPI, "ipv4" | "ipv6" | "valid_ip">

export interface NezhaAPI {
  id: number
  name: string
  tag: string
  last_active: number
  online_status: boolean
  ipv4: string
  ipv6: string
  valid_ip: string
  display_index: number
  hide_for_guest: boolean
  host: NezhaAPIHost
  status: NezhaAPIStatus
}

export interface NezhaAPIHost {
  Platform: string
  PlatformVersion: string
  CPU: string[]
  MemTotal: number
  DiskTotal: number
  SwapTotal: number
  Arch: string
  Virtualization: string
  BootTime: number
  CountryCode: string
  Version: string
  GPU: string[]
}

export interface NezhaAPIStatus {
  CPU: number
  MemUsed: number
  SwapUsed: number
  DiskUsed: number
  NetInTransfer: number
  NetOutTransfer: number
  NetInSpeed: number
  NetOutSpeed: number
  Uptime: number
  Load1: number
  Load5: number
  Load15: number
  TcpConnCount: number
  UdpConnCount: number
  ProcessCount: number
  Temperatures: number
  GPU: number
}

export type ServerMonitorChart = {
  [key: string]: {
    created_at: number
    avg_delay: number
  }[]
}

export interface NezhaAPIMonitor {
  monitor_id: number
  monitor_name: string
  server_id: number
  server_name: string
  created_at: number[]
  avg_delay: number[]
}
