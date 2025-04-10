"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckIcon, MinusIcon, Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useId } from "react"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"

const items = [
  { value: "light", label: "Light", image: "/ui-light.png" },
  { value: "dark", label: "Dark", image: "/ui-dark.png" },
  { value: "system", label: "System", image: "/ui-system.png" },
]

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const t = useTranslations("ThemeSwitcher")

  const handleSelect = (newTheme: string) => {
    setTheme(newTheme)
  }
  const id = useId()

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
      <DropdownMenuContent className="px-2 pt-2 pb-1.5" align="end">
        <fieldset className="space-y-4">
          <RadioGroup className="flex gap-2" defaultValue={theme} onValueChange={handleSelect}>
            {items.map((item) => (
              <label key={`${id}-${item.value}`}>
                <RadioGroupItem
                  id={`${id}-${item.value}`}
                  value={item.value}
                  className="peer sr-only after:absolute after:inset-0"
                />
                <img
                  src={item.image}
                  alt={item.label}
                  width={88}
                  height={70}
                  className="relative cursor-pointer overflow-hidden rounded-[8px] border border-neutral-300 shadow-xs outline-none transition-[color,box-shadow] peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-data-disabled:cursor-not-allowed peer-data-[state=checked]:bg-accent peer-data-disabled:opacity-50 dark:border-neutral-700"
                />
                <span className="group mt-2 flex items-center gap-1 peer-data-[state=unchecked]:text-muted-foreground/70">
                  <CheckIcon
                    size={16}
                    className="group-peer-data-[state=unchecked]:hidden"
                    aria-hidden="true"
                  />
                  <MinusIcon
                    size={16}
                    className="group-peer-data-[state=checked]:hidden"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-xs">{t(item.label)}</span>
                </span>
              </label>
            ))}
          </RadioGroup>
        </fieldset>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
