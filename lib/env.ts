import { env } from "next-runtime-env"

/**
 * Server-side environment variables
 */
export interface ServerEnvConfig {
  /** Nezha API base URL */
  NezhaBaseUrl: string
  /** Nezha API authentication token */
  NezhaAuth: string
  /** Default locale for the application */
  DefaultLocale: string
  /** Force show all servers */
  ForceShowAllServers: boolean
}

/**
 * Client-side environment variables (NEXT_PUBLIC_*)
 */
export interface ClientEnvConfig {
  /** Nezha data fetch interval in milliseconds */
  NezhaFetchInterval: number
  /** Show country flags */
  ShowFlag: boolean
  /** Disable cartoon effects */
  DisableCartoon: boolean
  /** Show server tags */
  ShowTag: boolean
  /** Show network transfer information */
  ShowNetTransfer: boolean
  /** Force use SVG flags */
  ForceUseSvgFlag: boolean
  /** Fix server names at the top */
  FixedTopServerName: boolean
  /** Custom logo URL */
  CustomLogo: string
  /** Custom site title */
  CustomTitle: string
  /** Custom site description */
  CustomDescription: string
  /** Custom navigation links */
  Links: string
  /** Disable search engine indexing */
  DisableIndex: boolean
  /** Show tag count */
  ShowTagCount: boolean
  /** Show IP information */
  ShowIpInfo: boolean
}

/**
 * 环境变量键的类型定义
 */
export type EnvKey = ServerEnvKey | ClientEnvKey

/**
 * 服务器端环境变量键
 */
export type ServerEnvKey = keyof ServerEnvConfig

/**
 * 客户端环境变量键
 */
export type ClientEnvKey = `NEXT_PUBLIC_${keyof ClientEnvConfig}`

/**
 * Get a server-side environment variable
 * @param key - Environment variable key
 * @returns Environment variable value
 */
export function getServerEnv<K extends keyof ServerEnvConfig>(key: K): string {
  const value = process.env[key]
  if (!value) {
    console.warn(`Environment variable ${key} is not set`)
  }
  return value || ""
}

/**
 * Get a client-side environment variable
 * @param key - Environment variable key
 * @returns Environment variable value
 */
export function getClientEnv<K extends keyof ClientEnvConfig>(key: K): string {
  const envKey = `NEXT_PUBLIC_${key}`
  const value = env(envKey)
  if (!value) {
    console.warn(`Environment variable ${envKey} is not set`)
  }
  return value || ""
}

/**
 * Parse boolean environment variable
 * @param value - Environment variable value
 * @returns Parsed boolean value
 */
export function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === "true"
}

/**
 * Parse number environment variable
 * @param value - Environment variable value
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed number value
 */
export function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? defaultValue : parsed
}

/**
 * Get all environment variables with their current values
 */
export function getAllEnvConfig(): { server: ServerEnvConfig; client: ClientEnvConfig } {
  return {
    server: {
      NezhaBaseUrl: getServerEnv("NezhaBaseUrl"),
      NezhaAuth: getServerEnv("NezhaAuth"),
      DefaultLocale: getServerEnv("DefaultLocale"),
      ForceShowAllServers: parseBoolean(getServerEnv("ForceShowAllServers")),
    },
    client: {
      NezhaFetchInterval: parseNumber(getClientEnv("NezhaFetchInterval"), 5000),
      ShowFlag: parseBoolean(getClientEnv("ShowFlag")),
      DisableCartoon: parseBoolean(getClientEnv("DisableCartoon")),
      ShowTag: parseBoolean(getClientEnv("ShowTag")),
      ShowNetTransfer: parseBoolean(getClientEnv("ShowNetTransfer")),
      ForceUseSvgFlag: parseBoolean(getClientEnv("ForceUseSvgFlag")),
      FixedTopServerName: parseBoolean(getClientEnv("FixedTopServerName")),
      CustomLogo: getClientEnv("CustomLogo"),
      CustomTitle: getClientEnv("CustomTitle"),
      CustomDescription: getClientEnv("CustomDescription"),
      Links: getClientEnv("Links"),
      DisableIndex: parseBoolean(getClientEnv("DisableIndex")),
      ShowTagCount: parseBoolean(getClientEnv("ShowTagCount")),
      ShowIpInfo: parseBoolean(getClientEnv("ShowIpInfo")),
    },
  }
} 
