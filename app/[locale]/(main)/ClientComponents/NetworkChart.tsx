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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useSWR from "swr";
import { NezhaAPIMonitor, ServerMonitorChart } from "../../types/nezha-api";
import { formatTime, nezhaFetcher } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { BackIcon } from "@/components/Icon";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import NetworkChartLoading from "./NetworkChartLoading";

interface ResultItem {
  created_at: number;
  [key: string]: number;
}

export function NetworkChartClient({ server_id }: { server_id: number }) {
  const t = useTranslations("NetworkChartClient");
  const { data, error } = useSWR<NezhaAPIMonitor[]>(
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

  function transformData(data: NezhaAPIMonitor[]) {
    const monitorData: ServerMonitorChart = {};

    data.forEach((item) => {
      const monitorName = item.monitor_name;

      if (!monitorData[monitorName]) {
        monitorData[monitorName] = [];
      }

      for (let i = 0; i < item.created_at.length; i++) {
        monitorData[monitorName].push({
          created_at: item.created_at[i],
          avg_delay: item.avg_delay[i],
        });
      }
    });

    return monitorData;
  }

  const formatData = (rawData: NezhaAPIMonitor[]) => {
    const result: { [time: number]: ResultItem } = {};

    // 遍历每个监控项
    rawData.forEach((item) => {
      const { monitor_name, created_at, avg_delay } = item;

      created_at.forEach((time, index) => {
        if (!result[time]) {
          result[time] = { created_at: time };
        }
        result[time][monitor_name] = parseFloat(avg_delay[index].toFixed(2));
      });
    });

    return Object.values(result).sort((a, b) => a.created_at - b.created_at);
  };

  const transformedData = transformData(data);

  const formattedData = formatData(data);

  const initChartConfig = {
    avg_delay: {
      label: t("avg_delay"),
    },
  } satisfies ChartConfig;

  const chartDataKey = Object.keys(transformedData);

  return (
    <NetworkChart
      chartDataKey={chartDataKey}
      chartConfig={initChartConfig}
      chartData={transformedData}
      serverName={data[0].server_name}
      formattedData={formattedData}
    />
  );
}

export function NetworkChart({
  chartDataKey,
  chartConfig,
  chartData,
  serverName,
  formattedData,
}: {
  chartDataKey: string[];
  chartConfig: ChartConfig;
  chartData: ServerMonitorChart;
  serverName: string;
  formattedData: ResultItem[];
}) {
  const t = useTranslations("NetworkChart");
  const router = useRouter();
  const locale = useLocale();

  const defaultChart = "All";

  const [activeChart, setActiveChart] = React.useState(defaultChart);

  const handleButtonClick = (chart: string) => {
    if (chart === activeChart) {
      setActiveChart(defaultChart);
    } else {
      setActiveChart(chart);
    }
  };

  const getColorByIndex = (chart: string) => {
    const index = chartDataKey.indexOf(chart);
    return `hsl(var(--chart-${(index % 10) + 1}))`;
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
            {serverName}
          </CardTitle>
          <CardDescription className="text-xs">
            {chartDataKey.length} {t("ServerMonitorCount")}
          </CardDescription>
        </div>
        <div className="flex flex-wrap">
          {chartDataKey.map((key) => {
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-b px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-6`}
                onClick={() => handleButtonClick(key)}
              >
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {key}
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
            data={
              activeChart === defaultChart
                ? formattedData
                : chartData[activeChart]
            }
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
                  className="gap-2"
                  labelKey="created_at"
                  labelClassName="text-muted-foreground"
                  labelFormatter={(_, payload) => {
                    return formatTime(payload[0].payload.created_at);
                  }}
                />
              }
            />
            {activeChart === defaultChart && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            {activeChart !== defaultChart && (
              <Line
                isAnimationActive={false}
                strokeWidth={1}
                type="linear"
                dot={false}
                dataKey="avg_delay"
                stroke={getColorByIndex(activeChart)}
              />
            )}
            {activeChart === defaultChart &&
              chartDataKey.map((key) => (
                <Line
                  key={key}
                  isAnimationActive={false}
                  strokeWidth={2}
                  type="linear"
                  dot={false}
                  dataKey={key}
                  stroke={getColorByIndex(key)}
                />
              ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
