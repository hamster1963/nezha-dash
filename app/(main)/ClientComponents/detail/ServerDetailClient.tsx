"use client"

import countries from "i18n-iso-countries"
import enLocale from "i18n-iso-countries/langs/en.json"
import { notFound, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { useServerData } from "@/app/context/server-data-context"
import { BackIcon } from "@/components/Icon"
import { ServerDetailLoading } from "@/components/loading/ServerDetailLoading"
import ServerFlag from "@/components/ServerFlag"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  cn,
  convertEmojiToCountryCode,
  formatBytes,
  formatNezhaInfo,
  isEmojiFlag,
} from "@/lib/utils"

countries.registerLocale(enLocale)

// Function to get country name, handling both country codes and emoji flags
function getCountryDisplayName(countryCode: string): string {
  if (isEmojiFlag(countryCode)) {
    // Convert emoji to country code for name lookup
    const convertedCode = convertEmojiToCountryCode(countryCode)
    if (convertedCode) {
      return countries.getName(convertedCode, "en") || ""
    }
    return ""
  }
  return countries.getName(countryCode, "en") || ""
}

export default function ServerDetailClient({ server_id }: { server_id: number }) {
  const t = useTranslations("ServerDetailClient")
  const router = useRouter()

  const [hasHistory, setHasHistory] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [])

  useEffect(() => {
    const previousPath = sessionStorage.getItem("fromMainPage")
    if (previousPath) {
      setHasHistory(true)
    }
  }, [])

  const linkClick = () => {
    if (hasHistory) {
      router.back()
    } else {
      router.push("/")
    }
  }

  const { data: serverList, error, isLoading } = useServerData()
  const serverData = serverList?.result?.find((item) => item.id === server_id)

  if (!serverData && !isLoading) {
    notFound()
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="font-medium text-sm opacity-40">{error.message}</p>
        <p className="font-medium text-sm opacity-40">{t("detail_fetch_error_message")}</p>
      </div>
    )
  }

  if (!serverData) return <ServerDetailLoading />

  const {
    name,
    online,
    uptime,
    version,
    arch,
    mem_total,
    disk_total,
    country_code,
    platform,
    platform_version,
    cpu_info,
    gpu_info,
    load_1,
    load_5,
    load_15,
    net_out_transfer,
    net_in_transfer,
    last_active_time_string,
    boot_time_string,
  } = formatNezhaInfo(serverData)

  return (
    <div>
      <div
        onClick={linkClick}
        className="flex flex-none cursor-pointer items-center gap-0.5 break-all font-semibold text-xl leading-none tracking-tight transition-opacity duration-300 hover:opacity-50"
      >
        <BackIcon />
        {name}
      </div>
      <section className="mt-3 flex flex-wrap gap-2">
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("status")}</p>
              <Badge
                className={cn(
                  "-mt-[0.3px] w-fit rounded-[6px] px-1 py-0 text-[9px] dark:text-white",
                  {
                    "bg-green-800": online,
                    "bg-red-600": !online,
                  },
                )}
              >
                {online ? t("Online") : t("Offline")}
              </Badge>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("Uptime")}</p>
              <div className="text-xs">
                {" "}
                {uptime / 86400 >= 1
                  ? `${Math.floor(uptime / 86400)} ${t("Days")} ${Math.floor((uptime % 86400) / 3600)} ${t("Hours")}`
                  : `${Math.floor(uptime / 3600)} ${t("Hours")}`}
              </div>
            </section>
          </CardContent>
        </Card>
        {version && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{t("Version")}</p>
                <div className="text-xs">{version} </div>
              </section>
            </CardContent>
          </Card>
        )}
        {arch && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{t("Arch")}</p>
                <div className="text-xs">{arch} </div>
              </section>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("Mem")}</p>
              <div className="text-xs">{formatBytes(mem_total)}</div>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("Disk")}</p>
              <div className="text-xs">{formatBytes(disk_total)}</div>
            </section>
          </CardContent>
        </Card>
        {country_code && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{t("Region")}</p>
                <section className="flex items-start gap-1">
                  {getCountryDisplayName(country_code) && (
                    <div className="text-start text-xs">{getCountryDisplayName(country_code)}</div>
                  )}
                  <ServerFlag className="-mt-px text-[11px]" country_code={country_code} />
                </section>
              </section>
            </CardContent>
          </Card>
        )}
      </section>
      <section className="mt-1 flex flex-wrap gap-2">
        {platform && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{t("System")}</p>

                <div className="text-xs">
                  {" "}
                  {platform} - {platform_version}{" "}
                </div>
              </section>
            </CardContent>
          </Card>
        )}
        {cpu_info && cpu_info.length > 0 && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{t("CPU")}</p>

                <div className="text-xs"> {cpu_info.join(", ")}</div>
              </section>
            </CardContent>
          </Card>
        )}
        {gpu_info && gpu_info.length > 0 && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{"GPU"}</p>
                <div className="text-xs"> {gpu_info.join(", ")}</div>
              </section>
            </CardContent>
          </Card>
        )}
      </section>
      <section className="mt-1 flex flex-wrap gap-2">
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("Load")}</p>
              <div className="text-xs">
                {load_1 || "0.00"} / {load_5 || "0.00"} / {load_15 || "0.00"}
              </div>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("Upload")}</p>
              {net_out_transfer ? (
                <div className="text-xs"> {formatBytes(net_out_transfer)} </div>
              ) : (
                <div className="text-xs">Unknown</div>
              )}
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("Download")}</p>
              {net_in_transfer ? (
                <div className="text-xs"> {formatBytes(net_in_transfer)} </div>
              ) : (
                <div className="text-xs">Unknown</div>
              )}
            </section>
          </CardContent>
        </Card>
      </section>
      <section className="mt-1 flex flex-wrap gap-2">
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("BootTime")}</p>
              <div className="text-xs">{boot_time_string ? boot_time_string : "N/A"}</div>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("LastActive")}</p>
              <div className="text-xs">
                {last_active_time_string ? last_active_time_string : "N/A"}
              </div>
            </section>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
