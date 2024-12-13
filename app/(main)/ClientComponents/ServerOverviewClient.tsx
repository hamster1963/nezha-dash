"use client"

import { ServerApi } from "@/app/types/nezha-api"
import { Loader } from "@/components/loading/Loader"
import { Card, CardContent } from "@/components/ui/card"
import getEnv from "@/lib/env-entry"
import { useFilter } from "@/lib/network-filter-context"
import { useStatus } from "@/lib/status-context"
import { cn, formatBytes, nezhaFetcher } from "@/lib/utils"
import blogMan from "@/public/blog-man.webp"
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from "@heroicons/react/20/solid"
import { useTranslations } from "next-intl"
import Image from "next/image"
import useSWRImmutable from "swr/immutable"

export default function ServerOverviewClient() {
  const { status, setStatus } = useStatus()
  const { filter, setFilter } = useFilter()
  const t = useTranslations("ServerOverviewClient")

  const { data, error, isLoading } = useSWRImmutable<ServerApi>("/api/server", nezhaFetcher)
  const disableCartoon = getEnv("NEXT_PUBLIC_DisableCartoon") === "true"

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm font-medium opacity-40">
          Error status:{error.status} {error.info?.cause ?? error.message}
        </p>
        <p className="text-sm font-medium opacity-40">{t("error_message")}</p>
      </div>
    )
  }

  return (
    <>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card
          onClick={() => {
            setFilter(false)
            setStatus("all")
          }}
          className={cn("cursor-pointer hover:border-blue-500 transition-all group")}
        >
          <CardContent className="flex h-full items-center px-6 py-3">
            <section className="flex flex-col gap-1">
              <p className="text-sm font-medium md:text-base">{t("p_816-881_Totalservers")}</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                </span>
                {data?.result ? (
                  <div className="text-lg font-semibold">{data?.result.length}</div>
                ) : (
                  <div className="flex h-7 items-center">
                    <Loader visible={true} />
                  </div>
                )}
              </div>
            </section>
          </CardContent>
        </Card>
        <Card
          onClick={() => {
            setFilter(false)
            setStatus("online")
          }}
          className={cn(
            "cursor-pointer hover:ring-green-500 ring-1 ring-transparent transition-all",
            {
              "ring-green-500 ring-2 border-transparent": status === "online",
            },
          )}
        >
          <CardContent className="flex h-full items-center px-6 py-3">
            <section className="flex flex-col gap-1">
              <p className="text-sm font-medium md:text-base">{t("p_1610-1676_Onlineservers")}</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                {data?.result ? (
                  <div className="text-lg font-semibold">{data?.live_servers}</div>
                ) : (
                  <div className="flex h-7 items-center">
                    <Loader visible={true} />
                  </div>
                )}
              </div>
            </section>
          </CardContent>
        </Card>
        <Card
          onClick={() => {
            setFilter(false)
            setStatus("offline")
          }}
          className={cn(
            "cursor-pointer hover:ring-red-500 ring-1 ring-transparent transition-all",
            {
              "ring-red-500 ring-2 border-transparent": status === "offline",
            },
          )}
        >
          <CardContent className="flex h-full items-center px-6 py-3">
            <section className="flex flex-col gap-1">
              <p className="text-sm font-medium md:text-base">{t("p_2532-2599_Offlineservers")}</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </span>
                {data?.result ? (
                  <div className="text-lg font-semibold">{data?.offline_servers}</div>
                ) : (
                  <div className="flex h-7 items-center">
                    <Loader visible={true} />
                  </div>
                )}
              </div>
            </section>
          </CardContent>
        </Card>
        <Card
          onClick={() => {
            setStatus("all")
            setFilter(true)
          }}
          className={cn(
            "cursor-pointer hover:ring-purple-500 ring-1 ring-transparent transition-all group",
            {
              "ring-purple-500 ring-2 border-transparent": filter === true,
            },
          )}
        >
          <CardContent className="flex h-full items-center relative px-6 py-3">
            <section className="flex flex-col gap-1 w-full">
              <div className="flex items-center w-full justify-between">
                <p className="text-sm font-medium md:text-base">{t("network")}</p>
              </div>
              {data?.result ? (
                <>
                  <section className="flex items-start flex-row z-[999] pr-2 sm:pr-0 gap-1">
                    <p className="sm:text-[12px] text-[10px] text-blue-800 dark:text-blue-400   text-nowrap font-medium">
                      ↑{formatBytes(data?.total_out_bandwidth)}
                    </p>
                    <p className="sm:text-[12px] text-[10px]  text-purple-800 dark:text-purple-400  text-nowrap font-medium">
                      ↓{formatBytes(data?.total_in_bandwidth)}
                    </p>
                  </section>
                  <section className="flex flex-col sm:flex-row -mr-1 sm:items-center items-start gap-1">
                    <p className="text-[11px] flex items-center text-nowrap font-semibold">
                      <ArrowUpCircleIcon className="size-3 mr-0.5 sm:mb-[1px]" />
                      {formatBytes(data?.total_out_speed)}/s
                    </p>
                    <p className="text-[11px] flex items-center  text-nowrap font-semibold">
                      <ArrowDownCircleIcon className="size-3 mr-0.5" />
                      {formatBytes(data?.total_in_speed)}/s
                    </p>
                  </section>
                </>
              ) : (
                <div className="flex h-[38px] items-center">
                  <Loader visible={true} />
                </div>
              )}
            </section>
            {!disableCartoon && (
              <Image
                className="absolute right-3 top-[-85px] z-10 w-20 scale-90 group-hover:opacity-50 md:scale-100 transition-all"
                alt={"Hamster1963"}
                src={blogMan}
                priority
                placeholder="data:image/png;base64,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"
              />
            )}
          </CardContent>
        </Card>
      </section>
      {data?.result === undefined && !isLoading && (
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium opacity-40">{t("error_message")}</p>
        </div>
      )}
    </>
  )
}
