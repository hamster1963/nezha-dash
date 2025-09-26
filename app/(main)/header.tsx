"use client"

import { DateTime } from "luxon"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { memo, useCallback, useEffect, useState } from "react"
import DriverBadge from "@/app/(main)/ClientComponents/DriverBadge"
import AnimateCountClient from "@/components/AnimatedCount"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NetworkButton } from "@/components/NetworkButton"
import { SearchButton } from "@/components/SearchButton"
import { ModeToggle } from "@/components/ThemeSwitcher"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import getEnv from "@/lib/env-entry"

interface TimeState {
  hh: number
  mm: number
  ss: number
}

interface CustomLink {
  link: string
  name: string
}

const useCurrentTime = () => {
  const [time, setTime] = useState<TimeState>({
    hh: DateTime.now().setLocale("en-US").hour,
    mm: DateTime.now().setLocale("en-US").minute,
    ss: DateTime.now().setLocale("en-US").second,
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = DateTime.now().setLocale("en-US")
      setTime({
        hh: now.hour,
        mm: now.minute,
        ss: now.second,
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  return time
}

const Links = memo(function Links() {
  const linksEnv = getEnv("NEXT_PUBLIC_Links")
  const links: CustomLink[] | null = linksEnv ? JSON.parse(linksEnv) : null

  if (!links) return null

  return (
    <div className="flex items-center gap-2">
      {links.map((link) => (
        <a
          key={link.link}
          href={link.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-medium text-sm opacity-50 transition-opacity hover:opacity-100"
        >
          {link.name}
        </a>
      ))}
    </div>
  )
})

const Overview = memo(function Overview() {
  const t = useTranslations("Overview")
  const time = useCurrentTime()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className={"mt-10 flex flex-col md:mt-16"}>
      <p className="font-semibold text-base">{t("p_2277-2331_Overview")}</p>
      <div className="flex items-center gap-1">
        <p className="font-medium text-sm opacity-50">{t("p_2390-2457_wherethetimeis")}</p>
        {mounted ? (
          <div className="flex items-center font-medium text-sm">
            <AnimateCountClient count={time.hh} minDigits={2} />
            <span className="mb-[1px] font-medium text-sm opacity-50">:</span>
            <AnimateCountClient count={time.mm} minDigits={2} />
            <span className="mb-[1px] font-medium text-sm opacity-50">:</span>
            <span className="font-medium text-sm">
              <AnimateCountClient count={time.ss} minDigits={2} />
            </span>
          </div>
        ) : (
          <Skeleton className="h-[21px] w-16 animate-none rounded-[5px] bg-muted-foreground/10" />
        )}
      </div>
    </section>
  )
})

function Header() {
  const t = useTranslations("Header")
  const customLogo = getEnv("NEXT_PUBLIC_CustomLogo")
  const customTitle = getEnv("NEXT_PUBLIC_CustomTitle")
  const customDescription = getEnv("NEXT_PUBLIC_CustomDescription")

  const router = useRouter()

  const handleLogoClick = useCallback(() => {
    sessionStorage.removeItem("selectedTag")
    router.push("/")
  }, [router])

  return (
    <div className="mx-auto w-full max-w-5xl">
      <section className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex cursor-pointer items-center font-medium text-base transition-opacity duration-300 hover:opacity-50"
        >
          <div className="mr-1 flex flex-row items-center justify-start">
            <img
              width={40}
              height={40}
              alt="apple-touch-icon"
              src={customLogo ? customLogo : "/apple-touch-icon.png"}
              className="relative m-0! h-6 w-6 border-2 border-transparent object-cover object-top p-0! dark:hidden"
            />
            <img
              width={40}
              height={40}
              alt="apple-touch-icon"
              src={customLogo ? customLogo : "/apple-touch-icon-dark.png"}
              className="relative m-0! hidden h-6 w-6 border-2 border-transparent object-cover object-top p-0! dark:block"
            />
          </div>
          {customTitle ? customTitle : "NezhaDash"}
          <Separator orientation="vertical" className="mx-2 hidden h-4 w-[1px] md:block" />
          <p className="hidden font-medium text-sm opacity-40 md:block">
            {customDescription ? customDescription : t("p_1079-1199_Simpleandbeautifuldashbo")}
          </p>
        </button>
        <section className="flex items-center gap-2">
          <DriverBadge />
          <div className="hidden sm:block">
            <Links />
          </div>
          <NetworkButton />
          <SearchButton />
          <LanguageSwitcher />
          <ModeToggle />
        </section>
      </section>
      <div className="mt-1 flex w-full justify-end sm:hidden">
        <Links />
      </div>
      <Overview />
    </div>
  )
}

export default Header
