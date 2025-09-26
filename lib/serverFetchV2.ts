/**
 * New server data fetching implementation using the driver architecture
 * This provides a clean, decoupled API for fetching server data from various sources
 */

"use server"

import type { NezhaAPI, NezhaAPIMonitor, ServerApi } from "./drivers"
import { initializeDriverManager } from "./drivers"

// Singleton driver manager instance
let driverManagerPromise: Promise<any> | null = null

/**
 * Get or initialize the driver manager
 */
async function getOrInitializeDriverManager() {
  if (!driverManagerPromise) {
    driverManagerPromise = initializeDriverManager().catch((error) => {
      // Reset the promise on error so we can retry
      driverManagerPromise = null
      throw error
    })
  }
  return await driverManagerPromise
}

/**
 * Get all servers with their current status
 * This is the main API endpoint for fetching server data
 */
export async function GetServerData(): Promise<ServerApi> {
  try {
    const driverManager = await getOrInitializeDriverManager()
    const driver = driverManager.getCurrentDriver()
    return await driver.getServers()
  } catch (error) {
    console.error("GetServerData error:", error)
    throw error
  }
}

/**
 * Get detailed information for a specific server
 */
export async function GetServerDetail({ server_id }: { server_id: number }): Promise<NezhaAPI> {
  try {
    const driverManager = await getOrInitializeDriverManager()
    const driver = driverManager.getCurrentDriver()
    return await driver.getServerDetail(server_id)
  } catch (error) {
    console.error("GetServerDetail error:", error)
    throw error
  }
}

/**
 * Get monitoring data for a specific server
 * Returns empty array if the current driver doesn't support monitoring
 */
export async function GetServerMonitor({
  server_id,
}: {
  server_id: number
}): Promise<NezhaAPIMonitor[]> {
  try {
    const driverManager = await getOrInitializeDriverManager()
    const driver = driverManager.getCurrentDriver()

    if (!driver.capabilities.supportsMonitoring) {
      console.warn(`Current driver (${driver.name}) does not support monitoring data`)
      return []
    }

    return await driver.getServerMonitor(server_id)
  } catch (error) {
    console.error("GetServerMonitor error:", error)
    throw error
  }
}

/**
 * Get server IP information
 * Returns empty string if the current driver doesn't support IP info
 */
export async function GetServerIP({ server_id }: { server_id: number }): Promise<string> {
  try {
    const driverManager = await getOrInitializeDriverManager()
    const driver = driverManager.getCurrentDriver()

    if (!driver.capabilities.supportsIpInfo) {
      console.warn(`Current driver (${driver.name}) does not support IP information`)
      return ""
    }

    return await driver.getServerIP(server_id)
  } catch (error) {
    console.error("GetServerIP error:", error)
    throw error
  }
}

/**
 * Get information about the current data source driver
 */
export async function GetDriverInfo() {
  try {
    const driverManager = await getOrInitializeDriverManager()
    const driver = driverManager.getCurrentDriver()

    return {
      name: driver.name,
      capabilities: driver.capabilities,
      availableDrivers: driverManager.getAvailableDrivers(),
    }
  } catch (error) {
    console.error("GetDriverInfo error:", error)
    throw error
  }
}

/**
 * Perform a health check on the current driver
 */
export async function PerformHealthCheck(): Promise<boolean> {
  try {
    const driverManager = await getOrInitializeDriverManager()
    return await driverManager.healthCheck()
  } catch (error) {
    console.error("PerformHealthCheck error:", error)

    // Try to provide more detailed error information
    if (error instanceof Error) {
      const errorName = error.constructor.name
      if (errorName === "DriverConfigError") {
        console.error("Configuration issue - check environment variables")
      } else if (errorName === "DriverOperationError") {
        console.error("Driver operation failed - check data source connectivity")
      }
    }

    return false
  }
}

/**
 * Switch to a different data source driver (for admin use)
 * Note: This would require additional authentication/authorization in a real application
 */
export async function SwitchDataSource(driverType: string, config: any): Promise<void> {
  try {
    const driverManager = await getOrInitializeDriverManager()
    await driverManager.switchDriver(driverType, config)

    // Reset the promise to force re-initialization with new driver
    driverManagerPromise = null
  } catch (error) {
    console.error("SwitchDataSource error:", error)
    throw error
  }
}

// Legacy compatibility exports - these maintain the same API as the original functions
export { GetServerData as GetNezhaData }
