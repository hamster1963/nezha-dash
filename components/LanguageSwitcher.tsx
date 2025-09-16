"use client"

import { CheckCircleIcon, LanguageIcon } from "@heroicons/react/20/solid"
import { useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { setUserLocale } from "@/i18n/locale"
import { localeItems } from "@/i18n-metadata"
import { cn } from "@/lib/utils"

export function LanguageSwitcher() {
  const locale = useLocale()

  const handleSelect = (e: Event, newLocale: string) => {
    e.preventDefault() // 阻止默认的关闭行为
    setUserLocale(newLocale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer rounded-full bg-white px-[9px] hover:bg-accent/50 dark:bg-black dark:hover:bg-accent/50"
          title="Change language"
        >
          <LanguageIcon className="size-4" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col gap-0.5" align="end">
        {localeItems.map((item, index) => (
          <DropdownMenuItem
            key={item.code}
            onSelect={(e) => handleSelect(e, item.code)}
            className={cn(
              {
                "gap-3 bg-muted font-semibold": locale === item.code,
              },
              {
                "rounded-t-[5px]": index === localeItems.length - 1,
                "rounded-[5px]": index !== 0 && index !== localeItems.length - 1,
                "rounded-b-[5px]": index === 0,
              },
            )}
          >
            {item.name} {locale === item.code && <CheckCircleIcon className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
