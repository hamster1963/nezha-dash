"use client";

import { NezhaAPISafe } from "@/app/[locale]/types/nezha-api";
import { BackIcon } from "@/components/Icon";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import getEnv from "@/lib/env-entry";
import { cn, nezhaFetcher } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import useSWR from "swr";

export default function ServerDetailClient({
    server_id,
}: {
    server_id: number;
}) {
    const router = useRouter();
    const locale = useLocale();
    const { data, error } = useSWR<NezhaAPISafe>(
        `/api/detail?server_id=${server_id}`,
        nezhaFetcher,
        {
            refreshInterval: Number(getEnv("NEXT_PUBLIC_NezhaFetchInterval")) || 5000,
        },
    );
    if (error) {
        return (
            <>
                <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-medium opacity-40">{error.message}</p>
                    <p className="text-sm font-medium opacity-40">
                        {/* {t("chart_fetch_error_message")} */}
                        fetch_error_message
                    </p>
                </div>
            </>
        );
    }
    if (!data) return null;
    return (
        <div>
            <div
                onClick={() => {
                    router.push(`/${locale}/`);
                }}
                className="flex flex-none cursor-pointer font-semibold leading-none items-center break-all tracking-tight gap-0.5 text-xl"
            >
                <BackIcon />
                {data?.name}
            </div>
            <section className="flex flex-wrap gap-2 mt-2">
                <Card className="rounded-[10px]">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">Status</p>
                            <Badge
                                className={cn(
                                    "text-xs rounded-[6px] w-fit px-1 py-0 dark:text-white",
                                    {
                                        " bg-green-800": data?.online_status,
                                        " bg-red-600": !data?.online_status,
                                    },
                                )}
                            >
                                {data?.online_status ? "Online" : "Offline"}
                            </Badge>
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px]">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">Uptime</p>
                            <Badge
                                className="text-xs rounded-[6px] w-fit px-1 py-0"
                                variant="secondary"
                            >
                                {" "}
                                {(data?.status.Uptime / 86400).toFixed(0)} Days{" "}
                            </Badge>
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px]">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">Arch</p>
                            <Badge
                                className="text-xs rounded-[6px] w-fit px-1 py-0"
                                variant="secondary"
                            >
                                {" "}
                                {data?.host.Arch || "Unknown"}{" "}
                            </Badge>
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px]">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">Version</p>
                            <Badge
                                className="text-xs rounded-[6px] w-fit px-1 py-0"
                                variant="secondary"
                            >
                                {" "}
                                {data?.host.Version || "Unknown"}{" "}
                            </Badge>
                        </section>
                    </CardContent>
                </Card>
            </section>
            <section className="flex flex-wrap gap-2 mt-2">
                <Card className="rounded-[10px] flex flex-col justify-center">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">System</p>
                            {data?.host.Platform ? (
                                <div className="text-xs w-fit font-medium">
                                    {" "}
                                    {data?.host.Platform || "Unknown"} -{" "}
                                    {data?.host.PlatformVersion}{" "}
                                </div>
                            ) : (
                                <div className="text-xs w-fit font-medium"> Unknown </div>
                            )}
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px] flex flex-col justify-center">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">CPU</p>
                            {data?.host.CPU ? (
                                <div className="text-xs w-fit font-medium">
                                    {" "}
                                    {data?.host.CPU || "Unknown"}
                                </div>
                            ) : (
                                <div className="text-xs w-fit font-medium"> Unknown </div>
                            )}
                        </section>
                    </CardContent>
                </Card>
            </section>
            {/* <section className="flex flex-wrap gap-2 mt-1">
                <Card className="rounded-[10px]">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">CPU</p>
                            <p className="text-xs text-end w-10 font-medium">
                                {data?.status.CPU.toFixed(0)}%
                            </p>
                            <AnimatedCircularProgressBar
                                className="size-3 text-[0px]"
                                max={100}
                                min={0}
                                value={data?.status.CPU}
                            />
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px]">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">Mem</p>
                            <p className="text-xs w-10 text-end font-medium">
                                {((data?.status.MemUsed / data?.host.MemTotal) * 100).toFixed(
                                    0,
                                )}
                                %
                            </p>
                            <AnimatedCircularProgressBar
                                className="size-3 text-[0px]"
                                max={100}
                                min={0}
                                value={(data?.status.MemUsed / data?.host.MemTotal) * 100}
                            />
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px]">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">Swap</p>
                            <p className="text-xs w-10 text-end font-medium">
                                {data?.status.SwapUsed
                                    ? (
                                        (data?.status.SwapUsed / data?.host.SwapTotal) *
                                        100
                                    ).toFixed(0)
                                    : 0}
                                %
                            </p>
                            <AnimatedCircularProgressBar
                                className="size-3 text-[0px]"
                                max={100}
                                min={0}
                                value={(data?.status.SwapUsed / data?.host.SwapTotal) * 100}
                            />
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px]">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">Disk</p>
                            <p className="text-xs w-10 text-end font-medium">
                                {((data?.status.DiskUsed / data?.host.DiskTotal) * 100).toFixed(
                                    0,
                                )}
                                %
                            </p>
                            <AnimatedCircularProgressBar
                                className="size-3 text-[0px]"
                                max={100}
                                min={0}
                                value={(data?.status.DiskUsed / data?.host.DiskTotal) * 100}
                            />
                        </section>
                    </CardContent>
                </Card>
            </section> */}
        </div>
    );
}
