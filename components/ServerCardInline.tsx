import type { NezhaAPISafe } from "@/app/types/nezha-api"
import ServerFlag from "@/components/ServerFlag"
import ServerUsageBar from "@/components/ServerUsageBar"
import { Card } from "@/components/ui/card"
import getEnv from "@/lib/env-entry"
import { GetFontLogoClass, GetOsName, MageMicrosoftWindows } from "@/lib/logo-class"
import { cn, formatBytes, formatNezhaInfo } from "@/lib/utils"
import { useTranslations } from "next-intl"
import Link from "next/link"

import { Separator } from "./ui/separator"

export default function ServerCardInline({
  serverInfo,
}: {
  serverInfo: NezhaAPISafe
}) {
  const t = useTranslations("ServerCard")
  const { id, name, country_code, online, cpu, up, down, mem, stg, host } =
    formatNezhaInfo(serverInfo)

  const showFlag = getEnv("NEXT_PUBLIC_ShowFlag") === "true"

  const saveSession = () => {
    sessionStorage.setItem("fromMainPage", "true")
  }

  return online ? (
    <Link onClick={saveSession} href={`/server/${id}`} prefetch={true}>
      <Card
        className={cn(
          "flex w-full min-w-[900px] cursor-pointer items-center justify-start gap-3 p-3 hover:border-stone-300 hover:shadow-md md:px-5 lg:flex-row dark:hover:border-stone-700",
        )}
      >
        <section
          className={cn("grid items-center gap-2 lg:w-36")}
          style={{ gridTemplateColumns: "auto auto 1fr" }}
        >
          <span className="h-2 w-2 shrink-0 self-center rounded-full bg-green-500" />
          <div
            className={cn(
              "flex items-center justify-center",
              showFlag ? "min-w-[17px]" : "min-w-0",
            )}
          >
            {showFlag ? <ServerFlag country_code={country_code} /> : null}
          </div>
          <div className="relative w-28">
            <p
              className={cn(
                "break-normal font-bold tracking-tight",
                showFlag ? "text-xs " : "text-sm",
              )}
            >
              {name}
            </p>
          </div>
        </section>
        <Separator orientation="vertical" className="mx-0 ml-2 h-8" />
        <div className="flex flex-col gap-2">
          <section className={cn("grid flex-1 grid-cols-9 items-center gap-3")}>
            <div className={"flex flex-row items-center gap-2 whitespace-nowrap"}>
              <div className="font-semibold text-xs">
                {host.Platform.includes("Windows") ? (
                  <MageMicrosoftWindows className="size-[10px]" />
                ) : (
                  <p className={`fl-${GetFontLogoClass(host.Platform)}`} />
                )}
              </div>
              <div className={"flex w-14 flex-col"}>
                <p className="text-muted-foreground text-xs">{t("System")}</p>
                <div className="flex items-center font-semibold text-[10.5px]">
                  {host.Platform.includes("Windows") ? "Windows" : GetOsName(host.Platform)}
                </div>
              </div>
            </div>
            <div className={"flex w-20 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("Uptime")}</p>
              <div className="flex items-center font-semibold text-xs">
                {(serverInfo?.status.Uptime / 86400).toFixed(0)} {"Days"}
              </div>
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("CPU")}</p>
              <div className="flex items-center font-semibold text-xs">{cpu.toFixed(2)}%</div>
              <ServerUsageBar value={cpu} />
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("Mem")}</p>
              <div className="flex items-center font-semibold text-xs">{mem.toFixed(2)}%</div>
              <ServerUsageBar value={mem} />
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("STG")}</p>
              <div className="flex items-center font-semibold text-xs">{stg.toFixed(2)}%</div>
              <ServerUsageBar value={stg} />
            </div>
            <div className={"flex w-16 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("Upload")}</p>
              <div className="flex items-center font-semibold text-xs">
                {up >= 1024 ? `${(up / 1024).toFixed(2)}G/s` : `${up.toFixed(2)}M/s`}
              </div>
            </div>
            <div className={"flex w-16 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("Download")}</p>
              <div className="flex items-center font-semibold text-xs">
                {down >= 1024 ? `${(down / 1024).toFixed(2)}G/s` : `${down.toFixed(2)}M/s`}
              </div>
            </div>
            <div className={"flex w-20 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("TotalUpload")}</p>
              <div className="flex items-center font-semibold text-xs">
                {formatBytes(serverInfo.status.NetOutTransfer)}
              </div>
            </div>
            <div className={"flex w-20 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("TotalDownload")}</p>
              <div className="flex items-center font-semibold text-xs">
                {formatBytes(serverInfo.status.NetInTransfer)}
              </div>
            </div>
          </section>
        </div>
      </Card>
    </Link>
  ) : (
    <Link onClick={saveSession} href={`/server/${id}`} prefetch={true}>
      <Card
        className={cn(
          "flex min-h-[61px] min-w-[900px] flex-row items-center justify-start gap-3 p-3 hover:border-stone-300 hover:shadow-md md:px-5 dark:hover:border-stone-700",
        )}
      >
        <section
          className={cn("grid items-center gap-2 lg:w-40")}
          style={{ gridTemplateColumns: "auto auto 1fr" }}
        >
          <span className="h-2 w-2 shrink-0 self-center rounded-full bg-red-500" />
          <div
            className={cn(
              "flex items-center justify-center",
              showFlag ? "min-w-[17px]" : "min-w-0",
            )}
          >
            {showFlag ? <ServerFlag country_code={country_code} /> : null}
          </div>
          <div className="relative w-28">
            <p
              className={cn(
                "break-normal font-bold tracking-tight",
                showFlag ? "text-xs" : "text-sm",
              )}
            >
              {name}
            </p>
          </div>
        </section>
      </Card>
    </Link>
  )
}
