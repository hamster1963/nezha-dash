"use client"

import { useRouter } from "next/navigation"
import { Activity } from "lucide-react"
import { Button } from "./ui/button"

export function NetworkButton() {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="sm"
      className="cursor-pointer rounded-full bg-white px-[9px] hover:bg-accent/50 dark:bg-black dark:hover:bg-accent/50"
      onClick={() => router.push("/network")}
      title="Network Charts"
    >
      <Activity className="size-4" />
      <span className="sr-only">Network Charts</span>
    </Button>
  )
}