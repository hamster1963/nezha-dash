"use client";

import { ReactNode, createContext, useContext, useState } from "react";

export interface TooltipData {
  centroid: [number, number];
  country: string;
  count: number;
  servers: Array<{
    name: string;
    status: boolean;
  }>;
}

interface TooltipContextType {
  tooltipData: TooltipData | null;
  setTooltipData: (data: TooltipData | null) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  return (
    <TooltipContext.Provider value={{ tooltipData, setTooltipData }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error("useTooltip must be used within a TooltipProvider");
  }
  return context;
}
