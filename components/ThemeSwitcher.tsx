"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const t = useTranslations("ThemeSwitcher")

  const handleSelect = (e: Event, newTheme: string) => {
    e.preventDefault()
    setTheme(newTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-[9px] bg-white dark:bg-black cursor-pointer hover:bg-accent/50 dark:hover:bg-accent/50"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col gap-0.5" align="end">
        <DropdownMenuItem
          className={cn({ "gap-3 bg-muted": theme === "light" })}
          onSelect={(e) => handleSelect(e, "light")}
        >
          {t("Light")} {theme === "light" && <CheckCircleIcon className="size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn({ "gap-3 bg-muted": theme === "dark" })}
          onSelect={(e) => handleSelect(e, "dark")}
        >
          {t("Dark")} {theme === "dark" && <CheckCircleIcon className="size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn({ "gap-3 bg-muted": theme === "system" })}
          onSelect={(e) => handleSelect(e, "system")}
        >
          {t("System")} {theme === "system" && <CheckCircleIcon className="size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
