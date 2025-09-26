"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import useSWR from "swr"
import type { ServerApi } from "@/lib/drivers/types"
import getEnv from "@/lib/env-entry"
import { nezhaFetcher } from "@/lib/utils"

export interface ServerDataWithTimestamp {
  timestamp: number
  data: ServerApi
}

interface ServerDataContextType {
  data: ServerApi | undefined
  error: Error | undefined
  isLoading: boolean
  history: ServerDataWithTimestamp[]
}

const ServerDataContext = createContext<ServerDataContextType | undefined>(undefined)

export const MAX_HISTORY_LENGTH = 30

export function ServerDataProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ServerDataWithTimestamp[]>([])

  const { data, error, isLoading } = useSWR<ServerApi>("/api/server", nezhaFetcher, {
    refreshInterval: Number(getEnv("NEXT_PUBLIC_NezhaFetchInterval")) || 2000,
    dedupingInterval: 1000,
  })

  useEffect(() => {
    if (data) {
      setHistory((prev) => {
        const newHistory = [
          {
            timestamp: Date.now(),
            data: data,
          },
          ...prev,
        ].slice(0, MAX_HISTORY_LENGTH)

        return newHistory
      })
    }
  }, [data])

  return (
    <ServerDataContext.Provider value={{ data, error, isLoading, history }}>
      {children}
    </ServerDataContext.Provider>
  )
}

export function useServerData() {
  const context = useContext(ServerDataContext)
  if (context === undefined) {
    throw new Error("useServerData must be used within a ServerDataProvider")
  }
  return context
}
