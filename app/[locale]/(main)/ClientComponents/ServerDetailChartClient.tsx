"use client"

import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import { Card, CardContent } from "@/components/ui/card";
import useSWR from "swr";
import { NezhaAPISafe } from "../../types/nezha-api";
import { formatRelativeTime, formatTime, nezhaFetcher } from "@/lib/utils";
import getEnv from "@/lib/env-entry";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";


type cpuChartData = {
    timeStamp: string;
    cpu: number;
}

export default function ServerDetailChartClient({
    server_id,
}: {
    server_id: number;
}) {
    const { data, error } = useSWR<NezhaAPISafe>(
        `/api/detail?server_id=${server_id}`,
        nezhaFetcher,
        {
            refreshInterval: Number(getEnv("NEXT_PUBLIC_NezhaFetchInterval")) || 5000,
        },
    );

    const [chartData, setChartData] = useState([] as cpuChartData[]);

    useEffect(() => {
        if (data) {
            const timestamp = Date.now().toString();
            const newData = [
                ...chartData,
                { timeStamp: timestamp, cpu: data.status.CPU },
            ];
            if (newData.length > 30) {
                newData.shift();
            }
            setChartData(newData);
        }
    }, [data]);

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


    const chartConfig = {
        cpu: {
            label: "CPU",
        },
    } satisfies ChartConfig

    return (
        <section className="grid md:grid-cols-3 grid-cols-1">
            <Card className=" rounded-sm">
                <CardContent className="px-6 py-3 h-[217px]">
                    <section className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium md:text-base">
                                CPU
                            </p>
                            <section className="flex items-center gap-2">
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
                        </div>

                        <ChartContainer config={chartConfig}>
                            <AreaChart
                                accessibilityLayer
                                data={chartData}
                                margin={{
                                    top: 12,
                                    left: 12,
                                    right: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="timeStamp"
                                    tickLine={false}
                                    axisLine={false}
                                    ticks={[chartData[0]?.timeStamp, chartData[chartData.length - 1]?.timeStamp]}
                                    tickFormatter={(value) => formatRelativeTime(value)}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    mirror={true}
                                    tickMargin={-15}
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                {/* <ChartTooltip
                                    isAnimationActive={false}
                                    cursor={false}
                                    content={<ChartTooltipContent indicator={"line"} labelFormatter={(_, payload) => {
                                        return formatTime(Number(payload[0].payload.timeStamp));
                                    }} />}
                                /> */}
                                <Area
                                    isAnimationActive={false}
                                    dataKey="cpu"
                                    type="step"
                                    fill="hsl(var(--chart-1))"
                                    fillOpacity={0.3}
                                    stroke="hsl(var(--chart-1))"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </section>
                </CardContent>
            </Card>
        </section>
    )
}