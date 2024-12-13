"use client"

import React, { ReactNode, createContext, useContext, useState } from "react"

interface FilterContextType {
  filter: boolean
  setFilter: (filter: boolean) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<boolean>(false)

  return <FilterContext.Provider value={{ filter, setFilter }}>{children}</FilterContext.Provider>
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider")
  }
  return context
}
