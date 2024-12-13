"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { localeItems } from "@/i18n-metadata"
import { setUserLocale } from "@/i18n/locale"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import { useLocale } from "next-intl"
import * as React from "react"

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
          className="rounded-full px-[9px] bg-white dark:bg-black cursor-pointer hover:bg-accent/50 dark:hover:bg-accent/50"
        >
          {localeItems.find((item) => item.code === locale)?.name}
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col gap-0.5" align="end">
        {localeItems.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onSelect={(e) => handleSelect(e, item.code)}
            className={locale === item.code ? "bg-muted gap-3" : ""}
          >
            {item.name} {locale === item.code && <CheckCircleIcon className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
