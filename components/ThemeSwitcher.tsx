"use client"

import { CheckCircleIcon, Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

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
          className="cursor-pointer rounded-full bg-white px-[9px] hover:bg-accent/50 dark:bg-black dark:hover:bg-accent/50"
        >
          <Sun className="dark:-rotate-90 h-4 w-4 rotate-0 scale-100 transition-all dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col gap-0.5" align="end">
        <DropdownMenuItem
          className={cn("rounded-b-[5px]", {
            "gap-3 bg-muted font-semibold": theme === "light",
          })}
          onSelect={(e) => handleSelect(e, "light")}
        >
          {t("Light")} {theme === "light" && <CheckCircleIcon className="size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("rounded-[5px]", {
            "gap-3 bg-muted font-semibold": theme === "dark",
          })}
          onSelect={(e) => handleSelect(e, "dark")}
        >
          {t("Dark")} {theme === "dark" && <CheckCircleIcon className="size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("rounded-t-[5px]", {
            "gap-3 bg-muted font-semibold": theme === "system",
          })}
          onSelect={(e) => handleSelect(e, "system")}
        >
          {t("System")} {theme === "system" && <CheckCircleIcon className="size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
