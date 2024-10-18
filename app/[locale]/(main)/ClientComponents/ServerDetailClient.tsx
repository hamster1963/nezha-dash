"use client";

import { NezhaAPISafe } from "@/app/[locale]/types/nezha-api";
import { BackIcon } from "@/components/Icon";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import getEnv from "@/lib/env-entry";
import { cn, formatBytes, nezhaFetcher } from "@/lib/utils";
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
                <Card className="rounded-[10px] bg-transparent border-none shadow-none">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex flex-col items-start gap-0.5">
                            <p className="text-xs text-muted-foreground">Status</p>
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
                <Card className="rounded-[10px] bg-transparent border-none shadow-none">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex flex-col items-start gap-0.5">
                            <p className="text-xs text-muted-foreground">Uptime</p>
                            <div className="text-xs">
                                {" "}
                                {(data?.status.Uptime / 86400).toFixed(0)} Days{" "}
                            </div>
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px] bg-transparent border-none shadow-none">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex flex-col items-start gap-0.5">
                            <p className="text-xs text-muted-foreground">Version</p>
                            <div className="text-xs">
                                {data?.host.Version || "Unknown"}{" "}
                            </div>
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px] bg-transparent border-none shadow-none">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex flex-col items-start gap-0.5">
                            <p className="text-xs text-muted-foreground">Arch</p>
                            <div className="text-xs">
                                {data?.host.Arch || "Unknown"}{" "}
                            </div>
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px] bg-transparent border-none shadow-none">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex flex-col items-start gap-0.5">
                            <p className="text-xs text-muted-foreground">Mem</p>
                            <div className="text-xs">
                                {formatBytes(data?.host.MemTotal)}
                            </div>
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px] bg-transparent border-none shadow-none">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex flex-col items-start gap-0.5">
                            <p className="text-xs text-muted-foreground">Disk</p>
                            <div className="text-xs">
                                {formatBytes(data?.host.DiskTotal)}
                            </div>
                        </section>
                    </CardContent>
                </Card>
            </section>
            <section className="flex flex-wrap gap-2 mt-1">
                <Card className="rounded-[10px] bg-transparent border-none shadow-none">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex flex-col items-start gap-0.5">
                            <p className="text-xs text-muted-foreground">System</p>
                            {data?.host.Platform ? (
                                <div className="text-xs">
                                    {" "}
                                    {data?.host.Platform || "Unknown"} -{" "}
                                    {data?.host.PlatformVersion}{" "}
                                </div>) : <div className="text-xs">Unknown</div>}
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px] bg-transparent border-none shadow-none">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex flex-col items-start gap-0.5">
                            <p className="text-xs text-muted-foreground">CPU</p>
                            {data?.host.CPU ? (
                                <div className="text-xs">
                                    {" "}
                                    {data?.host.CPU}
                                </div>) : <div className="text-xs">Unknown</div>}
                        </section>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
