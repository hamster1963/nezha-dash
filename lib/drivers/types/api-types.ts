/**
 * API Types for Data Source Drivers
 *
 * This file contains all the API type definitions for different monitoring systems.
 * Originally from app/types/nezha-api.ts, now centralized in the drivers layer.
 */

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
    packet_loss?: number
  }[]
}

export interface NezhaAPIMonitor {
  monitor_id: number
  monitor_name: string
  server_id: number
  server_name: string
  created_at: number[]
  avg_delay: number[]
  packet_loss?: number[]
}

// Komari API types
export interface KomariAPIResponse {
  status: string
  message: string
  data: KomariServer[]
}

export interface KomariServer {
  uuid: string
  name: string
  cpu_name: string
  virtualization: string
  arch: string
  cpu_cores: number
  os: string
  kernel_version: string
  gpu_name: string
  region: string
  public_remark?: string
  mem_total: number
  swap_total: number
  disk_total: number
  weight: number
  price: number
  billing_cycle: number
  auto_renewal: boolean
  currency: string
  expired_at: string | null
  group: string
  tags: string
  hidden: boolean
  traffic_limit: number
  traffic_limit_type: string
  created_at: string
  updated_at: string
}

// Komari recent data API types
export interface KomariRecentResponse {
  status: string
  message: string
  data: KomariRecentData[]
}

export interface KomariRecentData {
  cpu: {
    usage: number
  }
  ram: {
    total: number
    used: number
  }
  swap: {
    total: number
    used: number
  }
  load: {
    load1: number
    load5: number
    load15: number
  }
  disk: {
    total: number
    used: number
  }
  network: {
    up: number
    down: number
    totalUp: number
    totalDown: number
  }
  connections: {
    tcp: number
    udp: number
  }
  uptime: number
  process: number
  message: string
  updated_at: string
}

// MyNodeQuery API types
export interface MyNodeQueryNode {
  UniqueID: string
  Name: string
  Status: string
  IPv4: string
  IPv6: string
  RXSpeed: string
  TXSpeed: string
  Load: number
  RAM: number
  Disk: number
  LastUptime: string
  EnableNotifi: boolean
  LoadNotifiValue: number
  RAMNotifiValue: number
  DiskNotifiValue: number
  Country: string
}

export interface MyNodeQueryListResponse {
  Success: boolean
  Message: string | null
  Data: MyNodeQueryNode[]
}

export interface MyNodeQueryDetailResponse {
  Success: boolean
  Message: string | null
  Data: {
    Name: string
    Overview: MyNodeQueryOverview
  } | null
}

export interface MyNodeQueryOverview {
  IP: string
  IPv4: string
  IPv6: string
  NodeStatus: string
  LastUptime: string
  Uptime: string
  OSName: string
  OSkernel: string
  CPUName: string
  CPUFlags: string
  CPUCoreCount: number
  CPUFreq: string
  CPUFreqs: string
  AllCPUTemps: string
  FileHandles: string
  FileHandles_Formated: string
  RXSpeed: string
  TXSpeed: string
  RX: string
  TX: string
  LoadCPU: string
  LoadCPURate: number
  Load: string
  RAMUsage: string
  RAMTotal: string
  RAMUsageRate: number
  DiskUsage: string
  DiskTotal: string
  DiskUsageRate: number
  EnableNotifi: boolean
  LoadNotifiValue: number
  RAMNotifiValue: number
  DiskNotifiValue: number
  NIC: string
  PingNodeGroupID: number
  Country: string
  BuyUrl: string
  ShowRealReport: boolean
}
