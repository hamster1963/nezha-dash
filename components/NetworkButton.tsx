"use client"

import { Activity } from "lucide-react"
import Link from "next/link"
import getEnv from "@/lib/env-entry"
import { Button } from "./ui/button"

export function NetworkButton() {
  // Hide network button in Komari mode since network delay charts are not supported
  const isKomariMode = getEnv("NEXT_PUBLIC_Komari") === "true"

  if (isKomariMode) {
    return null
  }

  return (
    <Link href="/network" prefetch={true}>
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer rounded-full bg-white px-[9px] hover:bg-accent/50 dark:bg-black dark:hover:bg-accent/50"
        title="Network Charts"
      >
        <Activity className="size-4" />
        <span className="sr-only">Network Charts</span>
      </Button>
    </Link>
  )
}
