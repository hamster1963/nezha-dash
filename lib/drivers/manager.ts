/**
 * Driver manager for managing the active data source driver
 */

import getEnv from "@/lib/env-entry"
import { DriverFactory, type SupportedDriverType } from "./factory"
import type { DriverConfig, IDataSourceDriver, IDriverManager } from "./types"
import { DriverOperationError } from "./types"

export class DriverManager implements IDriverManager {
  private static instance: DriverManager | null = null
  private currentDriver: IDataSourceDriver | null = null
  private factory: DriverFactory

  private constructor() {
    this.factory = DriverFactory.getInstance()
  }

  /**
   * Get singleton instance of the driver manager
   */
  static getInstance(): DriverManager {
    if (!DriverManager.instance) {
      DriverManager.instance = new DriverManager()
    }
    return DriverManager.instance
  }

  /**
   * Initialize the driver manager with automatic driver selection based on environment
   */
  async initialize(): Promise<void> {
    if (this.currentDriver) {
      await this.currentDriver.dispose()
      this.currentDriver = null
    }

    // Determine driver type from environment
    const isMyNodeQueryMode = getEnv("NEXT_PUBLIC_MyNodeQuery") === "true"
    const isKomariMode = getEnv("NEXT_PUBLIC_Komari") === "true"
    const hasMyNodeQueryConfig = !!getEnv("MyNodeQueryBaseUrl")
    const hasKomariConfig = !!getEnv("KomariBaseUrl")
    const hasNezhaConfig = !!getEnv("NezhaBaseUrl") && !!getEnv("NezhaAuth")
    const driverPreferences: SupportedDriverType[] = []

    if (isMyNodeQueryMode) {
      if (hasMyNodeQueryConfig) {
        driverPreferences.push("mynodequery")
      } else {
        console.warn("MyNodeQuery mode enabled but MyNodeQueryBaseUrl is not configured")
      }
    }

    if (isKomariMode) {
      if (hasKomariConfig) {
        driverPreferences.push("komari")
      } else {
        console.warn("Komari mode enabled but KomariBaseUrl is not configured")
      }
    }

    // Always consider Nezha as a fallback when credentials are available
    if (hasNezhaConfig && !driverPreferences.includes("nezha")) {
      driverPreferences.push("nezha")
    }

    if (driverPreferences.length === 0) {
      throw new DriverOperationError(
        "manager",
        "initialize",
        "No driver preferences available. Check datasource environment variables.",
      )
    }

    let lastError: unknown = null

    for (const driverType of driverPreferences) {
      let config: DriverConfig

      try {
        config = this.createDriverConfig(driverType)
      } catch (configError) {
        console.warn(`Configuration for driver ${driverType} is invalid:`, configError)
        lastError = configError
        continue
      }

      try {
        await this.switchDriver(driverType, config)
        console.info(`Initialized ${driverType} driver`)
        return
      } catch (error) {
        console.error(`Failed to initialize ${driverType} driver:`, error)
        lastError = error
      }
    }

    if (lastError) {
      throw lastError
    }

    throw new DriverOperationError(
      "manager",
      "initialize",
      "No suitable driver could be initialized",
    )
  }

  /**
   * Get the currently active driver
   */
  getCurrentDriver(): IDataSourceDriver {
    if (!this.currentDriver) {
      throw new DriverOperationError("manager", "getCurrentDriver", "No driver initialized")
    }
    return this.currentDriver
  }

  /**
   * Switch to a different driver
   */
  async switchDriver(driverType: string, config: DriverConfig): Promise<void> {
    // Dispose current driver if exists
    if (this.currentDriver) {
      await this.currentDriver.dispose()
    }

    // Create and initialize new driver
    const newDriver = this.factory.createDriver(driverType, config)
    await newDriver.initialize(config)

    // Verify the new driver works
    const isHealthy = await newDriver.healthCheck()
    if (!isHealthy) {
      await newDriver.dispose()
      throw new DriverOperationError(
        driverType,
        "switchDriver",
        "Health check failed after driver initialization",
      )
    }

    this.currentDriver = newDriver
  }

  /**
   * Get list of available driver types
   */
  getAvailableDrivers(): string[] {
    return this.factory.getSupportedDrivers()
  }

  /**
   * Get capabilities of the current driver
   */
  getCurrentDriverCapabilities() {
    if (!this.currentDriver) {
      return null
    }
    return this.currentDriver.capabilities
  }

  /**
   * Perform health check on current driver
   */
  async healthCheck(): Promise<boolean> {
    if (!this.currentDriver) {
      return false
    }
    return await this.currentDriver.healthCheck()
  }

  /**
   * Dispose the driver manager and cleanup resources
   */
  async dispose(): Promise<void> {
    if (this.currentDriver) {
      await this.currentDriver.dispose()
      this.currentDriver = null
    }
  }

  /**
   * Create driver configuration based on driver type and environment variables
   */
  private createDriverConfig(driverType: SupportedDriverType): DriverConfig {
    switch (driverType) {
      case "nezha": {
        const baseUrl = getEnv("NezhaBaseUrl") || ""
        const auth = getEnv("NezhaAuth") || ""

        if (!baseUrl) {
          throw new DriverOperationError(
            "manager",
            "createDriverConfig",
            "NezhaBaseUrl is required for Nezha driver",
          )
        }
        if (!auth) {
          throw new DriverOperationError(
            "manager",
            "createDriverConfig",
            "NezhaAuth is required for Nezha driver",
          )
        }

        return {
          baseUrl,
          auth,
          timeout: 30000,
          revalidate: 0,
        }
      }

      case "komari": {
        const baseUrl = getEnv("KomariBaseUrl") || ""

        if (!baseUrl) {
          throw new DriverOperationError(
            "manager",
            "createDriverConfig",
            "KomariBaseUrl is required for Komari driver",
          )
        }

        return {
          baseUrl,
          timeout: 30000,
          revalidate: 0,
        }
      }

      case "mynodequery": {
        const baseUrl = getEnv("MyNodeQueryBaseUrl") || ""

        if (!baseUrl) {
          throw new DriverOperationError(
            "manager",
            "createDriverConfig",
            "MyNodeQueryBaseUrl is required for MyNodeQuery driver",
          )
        }

        return {
          baseUrl,
          timeout: 30000,
          revalidate: 0,
        }
      }

      default:
        throw new DriverOperationError(
          "manager",
          "createDriverConfig",
          `Unknown driver type: ${driverType}`,
        )
    }
  }

  /**
   * Auto-detect and configure the appropriate driver based on environment
   */
  async autoDetectAndConfigure(): Promise<string> {
    const availableDrivers = this.getAvailableDrivers()

    // Priority order for auto-detection
    const detectionOrder: SupportedDriverType[] = ["nezha", "komari", "mynodequery"]

    for (const driverType of detectionOrder) {
      if (!availableDrivers.includes(driverType)) continue

      try {
        const config = this.createDriverConfig(driverType)

        // Check if required configuration is available
        if (!config.baseUrl) continue

        // Try to initialize and test the driver
        const testDriver = this.factory.createDriver(driverType, config)
        await testDriver.initialize(config)

        const isHealthy = await testDriver.healthCheck()
        await testDriver.dispose()

        if (isHealthy) {
          // Switch to the working driver
          await this.switchDriver(driverType, config)
          return driverType
        }
      } catch (error) {
        console.warn(`Auto-detection failed for driver ${driverType}:`, error)
      }
    }

    throw new DriverOperationError(
      "manager",
      "autoDetectAndConfigure",
      "No working drivers found during auto-detection",
    )
  }
}

/**
 * Global driver manager instance
 */
let globalDriverManager: DriverManager | null = null

/**
 * Get the global driver manager instance
 */
export function getDriverManager(): DriverManager {
  if (!globalDriverManager) {
    globalDriverManager = DriverManager.getInstance()
  }
  return globalDriverManager
}

/**
 * Initialize the global driver manager
 */
export async function initializeDriverManager(): Promise<DriverManager> {
  const manager = getDriverManager()
  try {
    // If already initialized, avoid resetting the selected driver
    manager.getCurrentDriver()
    return manager
  } catch {
    await manager.initialize()
    return manager
  }
}
