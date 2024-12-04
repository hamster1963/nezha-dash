"use client";

import { ServerDetailLoading } from "@/app/(main)/ClientComponents/ServerDetailLoading";
import { NezhaAPISafe, ServerApi } from "@/app/types/nezha-api";
import { BackIcon } from "@/components/Icon";
import ServerFlag from "@/components/ServerFlag";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import getEnv from "@/lib/env-entry";
import { cn, formatBytes, nezhaFetcher } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";

export default function ServerDetailClient({
  server_id,
}: {
  server_id: number;
}) {
  const t = useTranslations("ServerDetailClient");
  const router = useRouter();

  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const previousPath = sessionStorage.getItem("fromMainPage");
    if (previousPath) {
      setHasHistory(true);
    }
  }, []);

  const linkClick = () => {
    if (hasHistory) {
      router.back();
    } else {
      router.push(`/`);
    }
  };

  const { data: allFallbackData, isLoading } = useSWRImmutable<ServerApi>(
    "/api/server",
    nezhaFetcher,
  );
  const fallbackData = allFallbackData?.result?.find(
    (item) => item.id === server_id,
  );

  if (!fallbackData && !isLoading) {
    notFound();
  }

  const { data, error } = useSWR<NezhaAPISafe>(
    `/api/detail?server_id=${server_id}`,
    nezhaFetcher,
    {
      refreshInterval: Number(getEnv("NEXT_PUBLIC_NezhaFetchInterval")) || 5000,
      fallbackData,
      revalidateOnMount: false,
      revalidateIfStale: false,
    },
  );

  if (error) {
    return (
      <>
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium opacity-40">{error.message}</p>
          <p className="text-sm font-medium opacity-40">
            {t("detail_fetch_error_message")}
          </p>
        </div>
      </>
    );
  }

  if (!data) return <ServerDetailLoading />;

  return (
    <div>
      <div
        onClick={linkClick}
        className="flex flex-none cursor-pointer font-semibold leading-none items-center break-all tracking-tight gap-0.5 text-xl"
      >
        <BackIcon />
        {data?.name}
      </div>
      <section className="flex flex-wrap gap-2 mt-3">
        <Card className="rounded-[10px] bg-transparent border-none shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-xs text-muted-foreground">{t("status")}</p>
              <Badge
                className={cn(
                  "text-[9px] rounded-[6px] w-fit px-1 py-0 -mt-[0.3px] dark:text-white",
                  {
                    " bg-green-800": data?.online_status,
                    " bg-red-600": !data?.online_status,
                  },
                )}
              >
                {data?.online_status ? t("Online") : t("Offline")}
              </Badge>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] bg-transparent border-none shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-xs text-muted-foreground">{t("Uptime")}</p>
              <div className="text-xs">
                {" "}
                {(data?.status.Uptime / 86400).toFixed(0)} {t("Days")}{" "}
              </div>
            </section>
          </CardContent>
        </Card>
        {data?.host.Version && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("Version")}</p>
                <div className="text-xs">{data?.host.Version} </div>
              </section>
            </CardContent>
          </Card>
        )}
        {data?.host.Arch && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("Arch")}</p>
                <div className="text-xs">{data?.host.Arch} </div>
              </section>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-[10px] bg-transparent border-none shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-xs text-muted-foreground">{t("Mem")}</p>
              <div className="text-xs">{formatBytes(data?.host.MemTotal)}</div>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] bg-transparent border-none shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-xs text-muted-foreground">{t("Disk")}</p>
              <div className="text-xs">{formatBytes(data?.host.DiskTotal)}</div>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] bg-transparent border-none shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-xs text-muted-foreground">{t("Region")}</p>
              <section className="flex items-start gap-1">
                <div className="text-xs text-start">
                  {data?.host.CountryCode.toUpperCase()}
                </div>
                <ServerFlag
                  className="text-[11px] -mt-[1px]"
                  country_code={data?.host.CountryCode}
                />
              </section>
            </section>
          </CardContent>
        </Card>
      </section>
      <section className="flex flex-wrap gap-2 mt-1">
        {data?.host.Platform && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("System")}</p>

                <div className="text-xs">
                  {" "}
                  {data?.host.Platform} - {data?.host.PlatformVersion}{" "}
                </div>
              </section>
            </CardContent>
          </Card>
        )}
        {data?.host.CPU && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("CPU")}</p>

                <div className="text-xs"> {data?.host.CPU.join(", ")}</div>
              </section>
            </CardContent>
          </Card>
        )}
        {data?.host.GPU && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{"GPU"}</p>
                <div className="text-xs"> {data?.host.GPU.join(", ")}</div>
              </section>
            </CardContent>
          </Card>
        )}
      </section>
      <section className="flex flex-wrap gap-2 mt-1">
        <Card className="rounded-[10px] bg-transparent border-none shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-xs text-muted-foreground">{t("Load")}</p>
              <div className="text-xs">
                {data.status.Load1.toFixed(2) || "0.00"} /{" "}
                {data.status.Load5.toFixed(2) || "0.00"} /{" "}
                {data.status.Load15.toFixed(2) || "0.00"}
              </div>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] bg-transparent border-none shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-xs text-muted-foreground">{t("Upload")}</p>
              {data.status.NetOutTransfer ? (
                <div className="text-xs">
                  {" "}
                  {formatBytes(data.status.NetOutTransfer)}{" "}
                </div>
              ) : (
                <div className="text-xs">Unknown</div>
              )}
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] bg-transparent border-none shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-xs text-muted-foreground">{t("Download")}</p>
              {data.status.NetInTransfer ? (
                <div className="text-xs">
                  {" "}
                  {formatBytes(data.status.NetInTransfer)}{" "}
                </div>
              ) : (
                <div className="text-xs">Unknown</div>
              )}
            </section>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
