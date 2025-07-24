"use client"

import { Activity } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"

export function NetworkButton() {
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
