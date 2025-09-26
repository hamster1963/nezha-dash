/**
 * Driver factory for creating data source driver instances
 */

import { KomariDriver } from "./komari"
import { NezhaDriver } from "./nezha"
import type { DriverConfig, IDataSourceDriver, IDriverFactory } from "./types"
import { DriverNotFoundError } from "./types"

/**
 * Registry of available drivers
 */
const DRIVER_REGISTRY = {
  nezha: () => new NezhaDriver(),
  komari: () => new KomariDriver(),
} as const

export type SupportedDriverType = keyof typeof DRIVER_REGISTRY

export class DriverFactory implements IDriverFactory {
  private static instance: DriverFactory | null = null

  /**
   * Get singleton instance of the driver factory
   */
  static getInstance(): DriverFactory {
    if (!DriverFactory.instance) {
      DriverFactory.instance = new DriverFactory()
    }
    return DriverFactory.instance
  }

  /**
   * Create a driver instance of the specified type
   */
  createDriver(driverType: string, _config: DriverConfig): IDataSourceDriver {
    const normalizedType = driverType.toLowerCase() as SupportedDriverType

    if (!this.isValidDriverType(normalizedType)) {
      throw new DriverNotFoundError(driverType)
    }

    const driverConstructor = DRIVER_REGISTRY[normalizedType]
    const driver = driverConstructor()

    return driver
  }

  /**
   * Get list of supported driver types
   */
  getSupportedDrivers(): string[] {
    return Object.keys(DRIVER_REGISTRY)
  }

  /**
   * Check if a driver type is supported
   */
  isValidDriverType(driverType: string): driverType is SupportedDriverType {
    return driverType in DRIVER_REGISTRY
  }

  /**
   * Get driver capabilities without creating an instance
   */
  getDriverCapabilities(driverType: string) {
    const normalizedType = driverType.toLowerCase() as SupportedDriverType

    if (!this.isValidDriverType(normalizedType)) {
      throw new DriverNotFoundError(driverType)
    }

    // Create temporary instance to get capabilities
    const driver = DRIVER_REGISTRY[normalizedType]()
    return driver.capabilities
  }

  /**
   * Register a new driver type (for extensibility)
   */
  registerDriver(driverType: string, driverFactory: () => IDataSourceDriver): void {
    const registry = DRIVER_REGISTRY as any
    registry[driverType.toLowerCase()] = driverFactory
  }
}

/**
 * Convenience function to create a driver
 */
export function createDriver(driverType: string, config: DriverConfig): IDataSourceDriver {
  const factory = DriverFactory.getInstance()
  return factory.createDriver(driverType, config)
}

/**
 * Convenience function to get supported drivers
 */
export function getSupportedDrivers(): string[] {
  const factory = DriverFactory.getInstance()
  return factory.getSupportedDrivers()
}

/**
 * Convenience function to get driver capabilities
 */
export function getDriverCapabilities(driverType: string) {
  const factory = DriverFactory.getInstance()
  return factory.getDriverCapabilities(driverType)
}
