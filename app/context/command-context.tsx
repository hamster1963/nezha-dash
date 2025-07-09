"use client"

import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

interface CommandContextType {
  isOpen: boolean
  openCommand: () => void
  closeCommand: () => void
  toggleCommand: () => void
}

const CommandContext = createContext<CommandContextType | undefined>(undefined)

export function CommandProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openCommand = () => setIsOpen(true)
  const closeCommand = () => setIsOpen(false)
  const toggleCommand = () => setIsOpen(!isOpen)

  return (
    <CommandContext.Provider
      value={{
        isOpen,
        openCommand,
        closeCommand,
        toggleCommand,
      }}
    >
      {children}
    </CommandContext.Provider>
  )
}

export function useCommand() {
  const context = useContext(CommandContext)
  if (context === undefined) {
    throw new Error("useCommand must be used within a CommandProvider")
  }
  return context
}
