"use client"

import { Home, Languages, Moon, Sun, SunMoon } from "lucide-react"

import { useServerData } from "@/app/context/server-data-context"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { localeItems } from "@/i18n-metadata"
import { setUserLocale } from "@/i18n/locale"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function DashCommand() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { data } = useServerData()
  const router = useRouter()
  const { setTheme } = useTheme()
  const t = useTranslations("DashCommand")

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  if (!data?.result) return null

  const sortedServers = data.result.sort((a, b) => {
    const displayIndexDiff = (b.display_index || 0) - (a.display_index || 0)
    if (displayIndexDiff !== 0) return displayIndexDiff
    return a.id - b.id
  })

  const languageShortcuts = localeItems.map((item) => ({
    keywords: ["language", "locale", item.code.toLowerCase()],
    icon: <Languages />,
    label: item.name,
    action: () => setUserLocale(item.code),
    value: `language ${item.name.toLowerCase()} ${item.code}`,
  }))

  const shortcuts = [
    {
      keywords: ["home", "homepage"],
      icon: <Home />,
      label: t("Home"),
      action: () => router.push("/"),
    },
    {
      keywords: ["light", "theme", "lightmode"],
      icon: <Sun />,
      label: t("ToggleLightMode"),
      action: () => setTheme("light"),
    },
    {
      keywords: ["dark", "theme", "darkmode"],
      icon: <Moon />,
      label: t("ToggleDarkMode"),
      action: () => setTheme("dark"),
    },
    {
      keywords: ["system", "theme", "systemmode"],
      icon: <SunMoon />,
      label: t("ToggleSystemMode"),
      action: () => setTheme("system"),
    },
    ...languageShortcuts,
  ].map((item) => ({
    ...item,
    value: `${item.keywords.join(" ")} ${item.label}`,
  }))

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("TypeCommand")} value={search} onValueChange={setSearch} />
        <CommandList className="border-t">
          <CommandEmpty>{t("NoResults")}</CommandEmpty>
          <CommandGroup heading={t("Servers")}>
            {sortedServers.map((server) => (
              <CommandItem
                key={server.id}
                value={server.name}
                onSelect={() => {
                  router.push(`/server/${server.id}`)
                  setOpen(false)
                }}
              >
                {server.online_status ? (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-green-500 self-center" />
                ) : (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 self-center" />
                )}
                <span>{server.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />

          <CommandGroup heading={t("Shortcuts")}>
            {shortcuts.map((item) => (
              <CommandItem
                key={item.label}
                value={item.value}
                onSelect={() => {
                  item.action()
                  setOpen(false)
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
