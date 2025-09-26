/**
 * Base driver class providing common functionality for all data source drivers
 */

import type {
  DriverCapabilities,
  DriverConfig,
  IDataSourceDriver,
  NezhaAPI,
  NezhaAPIMonitor,
  ServerApi,
} from "../types"
import { DriverConfigError, DriverOperationError } from "../types"

export abstract class BaseDriver implements IDataSourceDriver {
  protected config: DriverConfig | null = null
  protected initialized = false

  constructor(
    public readonly name: string,
    public readonly capabilities: DriverCapabilities,
  ) {}

  /**
   * Initialize the driver with configuration
   */
  async initialize(config: DriverConfig): Promise<void> {
    if (!config.baseUrl) {
      throw new DriverConfigError(this.name, "baseUrl is required")
    }

    // Normalize base URL (remove trailing slash)
    config.baseUrl = config.baseUrl.replace(/\/$/, "")

    // Set default values
    config.timeout = config.timeout || 30000
    config.revalidate = config.revalidate || 0

    this.config = config
    await this.onInitialize(config)
    this.initialized = true
  }

  /**
   * Template method for driver-specific initialization
   */
  protected abstract onInitialize(config: DriverConfig): Promise<void>

  /**
   * Get all servers with their current status
   */
  abstract getServers(): Promise<ServerApi>

  /**
   * Get detailed information for a specific server
   */
  abstract getServerDetail(serverId: number): Promise<NezhaAPI>

  /**
   * Get monitoring data for a specific server
   */
  async getServerMonitor(serverId: number): Promise<NezhaAPIMonitor[]> {
    if (!this.capabilities.supportsMonitoring) {
      console.warn(`Driver ${this.name} does not support monitoring data`)
      return []
    }
    return this.onGetServerMonitor(serverId)
  }

  /**
   * Template method for driver-specific monitor data fetching
   */
  protected abstract onGetServerMonitor(serverId: number): Promise<NezhaAPIMonitor[]>

  /**
   * Get server IP information
   */
  async getServerIP(serverId: number): Promise<string> {
    if (!this.capabilities.supportsIpInfo) {
      console.warn(`Driver ${this.name} does not support IP information`)
      return ""
    }
    return this.onGetServerIP(serverId)
  }

  /**
   * Template method for driver-specific IP information fetching
   */
  protected abstract onGetServerIP(serverId: number): Promise<string>

  /**
   * Health check for the driver
   */
  async healthCheck(): Promise<boolean> {
    if (!this.initialized || !this.config) {
      return false
    }

    try {
      // Attempt to fetch a minimal amount of data to verify connectivity
      await this.onHealthCheck()
      return true
    } catch (error) {
      console.error(`Health check failed for driver ${this.name}:`, error)
      return false
    }
  }

  /**
   * Template method for driver-specific health check
   */
  protected abstract onHealthCheck(): Promise<void>

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    await this.onDispose()
    this.initialized = false
    this.config = null
  }

  /**
   * Template method for driver-specific cleanup
   */
  protected async onDispose(): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Helper method to ensure driver is initialized
   */
  protected ensureInitialized(): void {
    if (!this.initialized || !this.config) {
      throw new DriverOperationError(this.name, "operation", "Driver not initialized")
    }
  }

  /**
   * Helper method to create fetch options with common settings
   */
  protected createFetchOptions(headers: Record<string, string> = {}): RequestInit {
    this.ensureInitialized()

    return {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      next: {
        revalidate: this.config?.revalidate,
      },
    }
  }

  /**
   * Helper method to handle fetch errors consistently
   */
  protected async handleFetchResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const errorText = await response.text()
      throw new DriverOperationError(this.name, "fetch", `HTTP ${response.status}: ${errorText}`)
    }

    try {
      return await response.json()
    } catch (error) {
      throw new DriverOperationError(this.name, "parse", `Failed to parse response: ${error}`)
    }
  }

  /**
   * Helper method to calculate packet loss from delay data
   */
  protected calculatePacketLoss(delays: number[]): number[] {
    if (!delays || delays.length === 0) return []

    const packetLossRates: number[] = []
    const windowSize = Math.min(10, Math.max(3, Math.floor(delays.length / 10)))
    const timeoutThreshold = 3000
    const extremeDelayThreshold = 10000

    for (let i = 0; i < delays.length; i++) {
      const currentDelay = delays[i]
      let lossRate = 0

      if (currentDelay === 0 || currentDelay === null || currentDelay === undefined) {
        lossRate = 100
      } else if (currentDelay >= extremeDelayThreshold) {
        lossRate = Math.min(95, 60 + (currentDelay - extremeDelayThreshold) / 1000)
      } else if (currentDelay >= timeoutThreshold) {
        lossRate = Math.min(50, (currentDelay - timeoutThreshold) / 200)
      } else {
        const start = Math.max(0, i - Math.floor(windowSize / 2))
        const end = Math.min(delays.length, i + Math.ceil(windowSize / 2))
        const windowDelays = delays.slice(start, end).filter((d) => d > 0)

        if (windowDelays.length > 2) {
          const mean = windowDelays.reduce((sum, d) => sum + d, 0) / windowDelays.length
          const variance =
            windowDelays.reduce((sum, d) => sum + (d - mean) ** 2, 0) / windowDelays.length
          const standardDeviation = Math.sqrt(variance)
          const coefficientOfVariation = standardDeviation / mean

          if (coefficientOfVariation > 0.8) {
            lossRate = Math.min(25, coefficientOfVariation * 15)
          } else if (coefficientOfVariation > 0.5) {
            lossRate = Math.min(10, coefficientOfVariation * 8)
          } else if (coefficientOfVariation > 0.3) {
            lossRate = Math.min(5, coefficientOfVariation * 5)
          }

          if (currentDelay > mean * 2.5) {
            lossRate += Math.min(15, (currentDelay / mean - 2.5) * 10)
          }
        }
      }

      if (i > 0) {
        const alpha = 0.3
        lossRate = alpha * lossRate + (1 - alpha) * packetLossRates[i - 1]
      }

      packetLossRates.push(Math.max(0, Math.min(100, lossRate)))
    }

    return packetLossRates.map((rate) => Number(rate.toFixed(2)))
  }
}
