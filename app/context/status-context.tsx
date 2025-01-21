"use client"

import React, { ReactNode, createContext, useContext, useState } from "react"

type Status = "all" | "online" | "offline"

interface StatusContextType {
  status: Status
  setStatus: (status: Status) => void
}

const StatusContext = createContext<StatusContextType | undefined>(undefined)

export function StatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("all")

  return <StatusContext.Provider value={{ status, setStatus }}>{children}</StatusContext.Provider>
}

export function useStatus() {
  const context = useContext(StatusContext)
  if (context === undefined) {
    throw new Error("useStatus must be used within a StatusProvider")
  }
  return context
}
