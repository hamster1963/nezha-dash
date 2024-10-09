"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useSWR from "swr";
import { ServerMonitorChart } from "../../types/nezha-api";
import { formatTime, nezhaFetcher } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { BackIcon } from "@/components/Icon";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import NetworkChartLoading from "./NetworkChartLoading";

export function NetworkChartClient({ server_id }: { server_id: number }) {
  const t = useTranslations("NetworkChartClient");
  const { data, error } = useSWR<ServerMonitorChart>(
    `/api/monitor?server_id=${server_id}`,
    nezhaFetcher,
  );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm font-medium opacity-40">{error.message}</p>
      </div>
    );
  if (!data) return <NetworkChartLoading />;

  const initChartConfig = {
    avg_delay: {
      label: t("avg_delay"),
    },
  } satisfies ChartConfig;

  const chartDataKey = Object.keys(data);

  return (
    <NetworkChart
      chartDataKey={chartDataKey}
      chartConfig={initChartConfig}
      chartData={data}
    />
  );
}

export function NetworkChart({
  chartDataKey,
  chartConfig,
  chartData,
}: {
  chartDataKey: string[];
  chartConfig: ChartConfig;
  chartData: ServerMonitorChart;
}) {
  const t = useTranslations("NetworkChart");
  const router = useRouter();
  const locale = useLocale();

  const [activeChart, setActiveChart] = React.useState<
    keyof typeof chartConfig
  >(chartDataKey[0]);

  const getColorByIndex = (chart: string) => {
    const index = chartDataKey.indexOf(chart);
    return `hsl(var(--chart-${(index % 5) + 1}))`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 p-0 sm:flex-row">
        <div className="flex flex-none flex-col justify-center gap-1 border-b px-6 py-4">
          <CardTitle
            onClick={() => {
              router.push(`/${locale}/`);
            }}
            className="flex flex-none cursor-pointer items-center gap-0.5 text-xl"
          >
            <BackIcon />
            {chartData[chartDataKey[0]][0].server_name}
          </CardTitle>
          <CardDescription className="text-xs">
            {chartDataKey.length} {t("ServerMonitorCount")}
          </CardDescription>
        </div>
        <div className="flex flex-wrap">
          {chartDataKey.map((key, index) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-b px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-6`}
                onClick={() => setActiveChart(key as keyof typeof chartConfig)}
              >
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {chart}
                </span>
                <span className="text-md font-bold leading-none sm:text-lg">
                  {chartData[key][chartData[key].length - 1].avg_delay.toFixed(
                    2,
                  )}
                  ms
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData[activeChart]}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="created_at"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatRelativeTime(value)}
            />
            <YAxis
              dataKey="avg_delay"
              tickLine={false}
              axisLine={false}
              mirror={true}
              tickMargin={-15}
              minTickGap={20}
              tickFormatter={(value) => `${value}ms`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator={"dot"}
                  className="w-fit"
                  nameKey="avg_delay"
                  labelKey="created_at"
                  labelClassName="text-muted-foreground"
                  labelFormatter={(_, payload) => {
                    return formatTime(payload[0].payload.created_at);
                  }}
                />
              }
            />
            <Line
              isAnimationActive={false}
              strokeWidth={2}
              type="linear"
              dot={false}
              dataKey="avg_delay"
              stroke={getColorByIndex(activeChart)}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
