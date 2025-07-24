"use client"

import { MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import { useCommand } from "@/app/context/command-context"
import { Button } from "./ui/button"

export function SearchButton() {
  const { openCommand } = useCommand()

  return (
    <Button
      variant="outline"
      size="sm"
      className="cursor-pointer rounded-full bg-white px-[9px] hover:bg-accent/50 dark:bg-black dark:hover:bg-accent/50"
      onClick={openCommand}
    >
      <MagnifyingGlassIcon className="size-4" />
      <span className="sr-only">Search</span>
    </Button>
  )
}
