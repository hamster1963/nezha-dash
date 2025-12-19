/**
 * Common types and interfaces for data source drivers
 */

// Import and re-export API types
import type {
  BillingData as _BillingData,
  KomariAPIResponse as _KomariAPIResponse,
  KomariRecentData as _KomariRecentData,
  KomariRecentResponse as _KomariRecentResponse,
  KomariServer as _KomariServer,
  MyNodeQueryDetailResponse as _MyNodeQueryDetailResponse,
  MyNodeQueryListResponse as _MyNodeQueryListResponse,
  MyNodeQueryNode as _MyNodeQueryNode,
  MyNodeQueryOverview as _MyNodeQueryOverview,
  NezhaAPI as _NezhaAPI,
  NezhaAPIHost as _NezhaAPIHost,
  NezhaAPIMonitor as _NezhaAPIMonitor,
  NezhaAPISafe as _NezhaAPISafe,
  NezhaAPIStatus as _NezhaAPIStatus,
  ServerApi as _ServerApi,
  ServerMonitorChart as _ServerMonitorChart,
} from "./api-types"

// Re-export API types
export type ServerApi = _ServerApi
export type NezhaAPI = _NezhaAPI
export type NezhaAPISafe = _NezhaAPISafe
export type NezhaAPIHost = _NezhaAPIHost
export type NezhaAPIStatus = _NezhaAPIStatus
export type NezhaAPIMonitor = _NezhaAPIMonitor
export type ServerMonitorChart = _ServerMonitorChart
export type BillingData = _BillingData
export type KomariAPIResponse = _KomariAPIResponse
export type KomariServer = _KomariServer
export type KomariRecentResponse = _KomariRecentResponse
export type KomariRecentData = _KomariRecentData
export type MyNodeQueryNode = _MyNodeQueryNode
export type MyNodeQueryOverview = _MyNodeQueryOverview
export type MyNodeQueryListResponse = _MyNodeQueryListResponse
export type MyNodeQueryDetailResponse = _MyNodeQueryDetailResponse

/**
 * Driver configuration interface
 */
export interface DriverConfig {
  baseUrl: string
  auth?: string
  timeout?: number
  revalidate?: number
  [key: string]: any
}

/**
 * Driver capabilities interface
 */
export interface DriverCapabilities {
  supportsMonitoring: boolean
  supportsRealTimeData: boolean
  supportsHistoricalData: boolean
  supportsIpInfo: boolean
  supportsPacketLoss: boolean
  supportsAlerts: boolean
}

/**
 * Base driver interface that all drivers must implement
 */
export interface IDataSourceDriver {
  /**
   * Driver name for identification
   */
  readonly name: string

  /**
   * Driver capabilities
   */
  readonly capabilities: DriverCapabilities

  /**
   * Initialize the driver with configuration
   */
  initialize(config: DriverConfig): Promise<void>

  /**
   * Get all servers with their current status
   */
  getServers(): Promise<ServerApi>

  /**
   * Get detailed information for a specific server
   */
  getServerDetail(serverId: number): Promise<NezhaAPI>

  /**
   * Get monitoring data for a specific server (if supported)
   */
  getServerMonitor(serverId: number): Promise<NezhaAPIMonitor[]>

  /**
   * Get server IP information (if supported)
   */
  getServerIP(serverId: number): Promise<string>

  /**
   * Health check for the driver
   */
  healthCheck(): Promise<boolean>

  /**
   * Cleanup resources
   */
  dispose(): Promise<void>
}

/**
 * Driver factory interface
 */
export interface IDriverFactory {
  createDriver(driverType: string, config: DriverConfig): IDataSourceDriver
  getSupportedDrivers(): string[]
}

/**
 * Driver manager interface
 */
export interface IDriverManager {
  getCurrentDriver(): IDataSourceDriver
  switchDriver(driverType: string, config: DriverConfig): Promise<void>
  getAvailableDrivers(): string[]
}

/**
 * Error types for driver operations
 */
export class DriverError extends Error {
  constructor(
    message: string,
    public readonly driverName: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = "DriverError"
  }
}

export class DriverNotFoundError extends DriverError {
  constructor(driverType: string) {
    super(`Driver not found: ${driverType}`, driverType, "DRIVER_NOT_FOUND")
    this.name = "DriverNotFoundError"
  }
}

export class DriverConfigError extends DriverError {
  constructor(driverName: string, message: string) {
    super(`Driver configuration error: ${message}`, driverName, "CONFIG_ERROR")
    this.name = "DriverConfigError"
  }
}

export class DriverOperationError extends DriverError {
  constructor(driverName: string, operation: string, message: string) {
    super(`Driver operation failed (${operation}): ${message}`, driverName, "OPERATION_ERROR")
    this.name = "DriverOperationError"
  }
}
