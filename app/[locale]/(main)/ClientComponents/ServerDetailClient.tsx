"use client";

import useSWR from "swr";
import { NezhaAPISafe } from "@/app/[locale]/types/nezha-api";
import { nezhaFetcher } from "@/lib/utils";
import getEnv from "@/lib/env-entry";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { BackIcon } from "@/components/Icon";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ServerDetailClient({ server_id }: { server_id: number }) {
    const router = useRouter();
    const locale = useLocale();
    const { data, error } = useSWR<NezhaAPISafe>(
        `/api/detail?server_id=${server_id}`,
        nezhaFetcher,
        {
            refreshInterval:
                Number(getEnv("NEXT_PUBLIC_NezhaFetchInterval")) || 5000,
        },
    );
    return (
        <div className="mx-auto grid w-full max-w-5xl gap-1">
            <div
                onClick={() => {
                    router.push(`/${locale}/`);
                }}
                className="flex flex-none cursor-pointer font-semibold leading-none items-center break-all tracking-tight gap-0.5 text-xl"
            >
                <BackIcon />
                HomeDash
            </div>
            <section className="flex flex-wrap gap-4 mt-2">
                <Card className="rounded-[10px] flex flex-col justify-center">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">
                                ID
                            </p>
                            <div className="text-xs w-fit"> {server_id} </div>
                        </section>
                    </CardContent>
                </Card>
                <Card className="rounded-[10px]">
                    <CardContent className="px-1.5 py-1">
                        <section className="flex items-center gap-2">
                            <p className="text-xs font-semibold">
                                Tag
                            </p>
                            <Badge className="text-xs rounded-[6px] w-fit px-1 py-0" variant="secondary"> {data?.tag} </Badge>
                        </section>
                    </CardContent>
                </Card>
            </section>
        </div>
    )



}