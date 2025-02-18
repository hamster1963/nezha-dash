"use client"

import AnimateCountClient from "@/components/AnimatedCount"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ModeToggle } from "@/components/ThemeSwitcher"
import { Separator } from "@/components/ui/separator"

import getEnv from "@/lib/env-entry"
import { DateTime } from "luxon"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { memo, useCallback, useEffect, useState } from "react"

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
    const timer = setInterval(() => {
      const now = DateTime.now().setLocale("en-US")
      setTime({
        hh: now.hour,
        mm: now.minute,
        ss: now.second,
      })
    }, 1000)

    return () => clearInterval(timer)
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
          className="flex items-center gap-1 text-sm font-medium opacity-50 transition-opacity hover:opacity-100"
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

  return (
    <section className={"mt-10 flex flex-col md:mt-16"}>
      <p className="text-base font-semibold">{t("p_2277-2331_Overview")}</p>
      <div className="flex items-center gap-1">
        <p className="text-sm font-medium opacity-50">{t("p_2390-2457_wherethetimeis")}</p>
        <div className="flex items-center text-sm font-medium">
          <AnimateCountClient count={time.hh} minDigits={2} />
          <span className="text-sm mb-[1px] font-medium opacity-50">:</span>
          <AnimateCountClient count={time.mm} minDigits={2} />
          <span className="text-sm mb-[1px] font-medium opacity-50">:</span>
          <span className="text-sm font-medium">{time.ss.toString().padStart(2, "0")}</span>
        </div>
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
        <section
          onClick={handleLogoClick}
          className="flex cursor-pointer items-center text-base font-medium hover:opacity-50 transition-opacity duration-300"
        >
          <div className="mr-1 flex flex-row items-center justify-start">
            <img
              width={40}
              height={40}
              alt="apple-touch-icon"
              src={customLogo ? customLogo : "/apple-touch-icon.png"}
              className="relative m-0! border-2 border-transparent h-6 w-6 object-cover object-top p-0! dark:hidden"
            />
            <img
              width={40}
              height={40}
              alt="apple-touch-icon"
              src={customLogo ? customLogo : "/apple-touch-icon-dark.png"}
              className="relative m-0! border-2 border-transparent h-6 w-6 object-cover object-top p-0! hidden dark:block"
            />
          </div>
          {customTitle ? customTitle : "NezhaDash"}
          <Separator orientation="vertical" className="mx-2 hidden h-4 w-[1px] md:block" />
          <p className="hidden text-sm font-medium opacity-40 md:block">
            {customDescription ? customDescription : t("p_1079-1199_Simpleandbeautifuldashbo")}
          </p>
        </section>
        <section className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Links />
          </div>
          <LanguageSwitcher />
          <ModeToggle />
        </section>
      </section>
      <div className="w-full flex justify-end sm:hidden mt-1">
        <Links />
      </div>
      <Overview />
    </div>
  )
}

export default Header
