"use client"

import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ModeToggle } from "@/components/ThemeSwitcher"
import { Separator } from "@/components/ui/separator"

import getEnv from "@/lib/env-entry"
import NumberFlow, { NumberFlowGroup } from "@number-flow/react"
import { DateTime } from "luxon"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import React from "react"

function Header() {
  const t = useTranslations("Header")
  const customLogo = getEnv("NEXT_PUBLIC_CustomLogo")
  const customTitle = getEnv("NEXT_PUBLIC_CustomTitle")
  const customDescription = getEnv("NEXT_PUBLIC_CustomDescription")

  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-5xl">
      <section className="flex items-center justify-between">
        <section
          onClick={() => {
            sessionStorage.removeItem("selectedTag")
            router.push("/")
          }}
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

type links = {
  link: string
  name: string
}

function Links() {
  const linksEnv = getEnv("NEXT_PUBLIC_Links")

  const links: links[] | null = linksEnv ? JSON.parse(linksEnv) : null

  if (!links) return null

  return (
    <div className="flex items-center gap-2">
      {links.map((link) => {
        return (
          <a
            key={link.link}
            href={link.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium opacity-50 transition-opacity hover:opacity-100"
          >
            {link.name}
          </a>
        )
      })}
    </div>
  )
}

function Overview() {
  const t = useTranslations("Overview")
  const [time, setTime] = React.useState({
    hh: DateTime.now().setLocale("en-US").hour,
    mm: DateTime.now().setLocale("en-US").minute,
    ss: DateTime.now().setLocale("en-US").second,
  })

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime({
        hh: DateTime.now().setLocale("en-US").hour,
        mm: DateTime.now().setLocale("en-US").minute,
        ss: DateTime.now().setLocale("en-US").second,
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className={"mt-10 flex flex-col md:mt-16"}>
      <p className="text-base font-semibold">{t("p_2277-2331_Overview")}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium opacity-50">{t("p_2390-2457_wherethetimeis")}</p>
        <NumberFlowGroup>
          <div
            style={{ fontVariantNumeric: "tabular-nums" }}
            className="flex text-sm font-medium mt-0.5"
          >
            <NumberFlow trend={1} value={time.hh} format={{ minimumIntegerDigits: 2 }} />
            <NumberFlow
              prefix=":"
              trend={1}
              value={time.mm}
              digits={{ 1: { max: 5 } }}
              format={{ minimumIntegerDigits: 2 }}
            />
            <NumberFlow
              prefix=":"
              trend={1}
              value={time.ss}
              digits={{ 1: { max: 5 } }}
              format={{ minimumIntegerDigits: 2 }}
            />
          </div>
        </NumberFlowGroup>
      </div>
    </section>
  )
}
export default Header
