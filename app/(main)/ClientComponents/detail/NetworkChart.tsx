"use client"

import { useTranslations } from "next-intl"
import * as React from "react"
import { useCallback, useMemo } from "react"
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"
import useSWR from "swr"
import NetworkChartLoading from "@/components/loading/NetworkChartLoading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { NezhaAPIMonitor, ServerMonitorChart } from "@/lib/drivers/types"
import { getClientPollingInterval } from "@/lib/polling"
import { formatTime, nezhaFetcher } from "@/lib/utils"

interface ResultItem {
  created_at: number
  [key: string]: number
}

export function NetworkChartClient({ server_id, show }: { server_id: number; show: boolean }) {
  const t = useTranslations("NetworkChartClient")
  const refreshInterval = getClientPollingInterval(15000)
  const { data, error } = useSWR<NezhaAPIMonitor[]>(
    `/api/monitor?server_id=${server_id}`,
    nezhaFetcher,
    {
      refreshInterval,
      isVisible: () => show,
    },
  )

  if (error) {
    return (
      <>
        <div className="flex flex-col items-center justify-center">
          <p className="font-medium text-sm opacity-40">{error.message}</p>
          <p className="font-medium text-sm opacity-40">{t("chart_fetch_error_message")}</p>
        </div>
        <NetworkChartLoading />
      </>
    )
  }

  if (!data) return <NetworkChartLoading />

  const transformedData = transformData(data)

  const formattedData = formatData(data)

  const initChartConfig = {
    avg_delay: {
      label: t("avg_delay"),
      color: "hsl(var(--chart-1))",
    },
    packet_loss: {
      label: t("packet_loss"),
      color: "hsl(45, 100%, 60%)", // Yellow color for packet loss area
    },
  } satisfies ChartConfig

  const chartDataKey = Object.keys(transformedData)

  return (
    <NetworkChart
      chartDataKey={chartDataKey}
      chartConfig={initChartConfig}
      chartData={transformedData}
      serverName={data[0].server_name}
      formattedData={formattedData}
    />
  )
}

export const NetworkChart = React.memo(function NetworkChart({
  chartDataKey,
  chartConfig,
  chartData,
  serverName,
  formattedData,
}: {
  chartDataKey: string[]
  chartConfig: ChartConfig
  chartData: ServerMonitorChart
  serverName: string
  formattedData: ResultItem[]
}) {
  const t = useTranslations("NetworkChart")

  const defaultChart = "All"

  const [activeChart, setActiveChart] = React.useState(defaultChart)
  const [isPeakEnabled, setIsPeakEnabled] = React.useState(false)

  const handleButtonClick = useCallback(
    (chart: string) => {
      setActiveChart((prev) => (prev === chart ? defaultChart : chart))
    },
    [defaultChart],
  )

  const getColorByIndex = useCallback(
    (chart: string) => {
      const index = chartDataKey.indexOf(chart)
      return `hsl(var(--chart-${(index % 10) + 1}))`
    },
    [chartDataKey],
  )

  const chartButtons = useMemo(
    () =>
      chartDataKey.map((key) => (
        <button
          type="button"
          key={key}
          data-active={activeChart === key}
          className={
            "relative z-30 flex grow basis-0 cursor-pointer flex-col justify-center gap-1 border-neutral-200 border-b px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-6 dark:border-neutral-800"
          }
          onClick={() => handleButtonClick(key)}
        >
          <span className="whitespace-nowrap text-muted-foreground text-xs">{key}</span>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-md leading-none sm:text-lg">
              {chartData[key][chartData[key].length - 1].avg_delay.toFixed(2)}ms
            </span>
            {chartData[key].some((item) => item.packet_loss !== undefined) && (
              <span className="text-muted-foreground text-xs">
                {(
                  chartData[key]
                    .filter((item) => item.packet_loss !== undefined)
                    .reduce((sum, item) => sum + (item.packet_loss ?? 0), 0) /
                  chartData[key].filter((item) => item.packet_loss !== undefined).length
                ).toFixed(2)}
                % avg loss
              </span>
            )}
          </div>
        </button>
      )),
    [chartDataKey, activeChart, chartData, handleButtonClick],
  )

  const chartElements = useMemo(() => {
    const elements = []

    if (activeChart !== defaultChart) {
      // Single chart view - show delay line and packet loss area
      elements.push(
        <Area
          key="packet-loss-area"
          isAnimationActive={false}
          dataKey="packet_loss"
          stroke="none"
          fill="hsl(45, 100%, 60%)"
          fillOpacity={0.3}
          yAxisId="packet-loss"
        />,
        <Line
          key="delay-line"
          isAnimationActive={false}
          strokeWidth={1}
          type="linear"
          dot={false}
          dataKey="avg_delay"
          stroke={getColorByIndex(activeChart)}
          yAxisId="delay"
        />,
      )
    } else {
      // Multi chart view - only show delay lines for all monitors
      elements.push(
        ...chartDataKey.map((key) => (
          <Line
            key={key}
            isAnimationActive={false}
            strokeWidth={1}
            type="linear"
            dot={false}
            dataKey={key}
            stroke={getColorByIndex(key)}
            connectNulls={true}
            yAxisId="delay"
          />
        )),
      )
    }

    return elements
  }, [activeChart, defaultChart, chartDataKey, getColorByIndex])

  const processedData = useMemo(() => {
    if (!isPeakEnabled) {
      return activeChart === defaultChart ? formattedData : chartData[activeChart]
    }

    const data = (
      activeChart === defaultChart ? formattedData : chartData[activeChart]
    ) as ResultItem[]

    const windowSize = 11 // 增加窗口大小以获取更好的统计效果
    const alpha = 0.3 // EWMA平滑因子

    // 辅助函数：计算中位数
    const getMedian = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
    }

    // 辅助函数：异常值处理
    const processValues = (values: number[]) => {
      if (values.length === 0) return null

      const median = getMedian(values)
      const deviations = values.map((v) => Math.abs(v - median))
      const medianDeviation = getMedian(deviations) * 1.4826 // MAD估计器

      // 使用中位数绝对偏差(MAD)进行异常值检测
      const validValues = values.filter(
        (v) =>
          Math.abs(v - median) <= 3 * medianDeviation && // 更严格的异常值判定
          v <= median * 3, // 限制最大值不超过中位数的3倍
      )

      if (validValues.length === 0) return median // 如果没有有效值，返回中位数

      // 计算EWMA
      let ewma = validValues[0]
      for (let i = 1; i < validValues.length; i++) {
        ewma = alpha * validValues[i] + (1 - alpha) * ewma
      }

      return ewma
    }

    // 初始化EWMA历史值
    const ewmaHistory: { [key: string]: number } = {}

    return data.map((point, index) => {
      if (index < windowSize - 1) return point

      const window = data.slice(index - windowSize + 1, index + 1)
      const smoothed = { ...point } as ResultItem

      if (activeChart === defaultChart) {
        for (const key of chartDataKey) {
          const values = window
            .map((w) => w[key])
            .filter((v) => v !== undefined && v !== null) as number[]

          if (values.length > 0) {
            const processed = processValues(values)
            if (processed !== null) {
              // 应用EWMA平滑
              if (ewmaHistory[key] === undefined) {
                ewmaHistory[key] = processed
              } else {
                ewmaHistory[key] = alpha * processed + (1 - alpha) * ewmaHistory[key]
              }
              smoothed[key] = ewmaHistory[key]
            }
          }
        }
      } else {
        const values = window
          .map((w) => w.avg_delay)
          .filter((v) => v !== undefined && v !== null) as number[]

        if (values.length > 0) {
          const processed = processValues(values)
          if (processed !== null) {
            // 应用EWMA平滑
            if (ewmaHistory.current === undefined) {
              ewmaHistory.current = processed
            } else {
              ewmaHistory.current = alpha * processed + (1 - alpha) * ewmaHistory.current
            }
            smoothed.avg_delay = ewmaHistory.current
          }
        }
      }

      return smoothed
    })
  }, [isPeakEnabled, activeChart, formattedData, chartData, chartDataKey, defaultChart])

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 p-0 sm:flex-row">
        <div className="flex flex-none flex-col justify-center gap-1 border-b px-6 py-4">
          <CardTitle className="flex flex-none items-center gap-0.5 text-md">
            {serverName}
          </CardTitle>
          <CardDescription className="text-xs">
            {chartDataKey.length} {t("ServerMonitorCount")}
          </CardDescription>
          <div className="mt-0.5 flex items-center space-x-2">
            <Switch checked={isPeakEnabled} onCheckedChange={setIsPeakEnabled} />
            <Label className="text-xs" htmlFor="Peak">
              Peak cut
            </Label>
          </div>
        </div>
        <div className="flex w-full flex-wrap">{chartButtons}</div>
      </CardHeader>
      <CardContent className="py-4 pr-2 pl-0 sm:pt-6 sm:pr-6 sm:pb-6 sm:pl-2">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <ComposedChart accessibilityLayer data={processedData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="created_at"
              tickLine={true}
              tickSize={3}
              axisLine={false}
              tickMargin={8}
              minTickGap={80}
              ticks={processedData
                .filter((item, index, array) => {
                  if (array.length < 6) {
                    return index === 0 || index === array.length - 1
                  }

                  // 计算数据的总时间跨度（毫秒）
                  const timeSpan = array[array.length - 1].created_at - array[0].created_at
                  const hours = timeSpan / (1000 * 60 * 60)

                  // 根据时间跨度调整显示间隔
                  if (hours <= 12) {
                    // 12小时内，每60分钟显示一个刻度
                    return (
                      index === 0 ||
                      index === array.length - 1 ||
                      new Date(item.created_at).getMinutes() % 60 === 0
                    )
                  }
                  // 超过12小时，每2小时显示一个刻度
                  const date = new Date(item.created_at)
                  return date.getMinutes() === 0 && date.getHours() % 2 === 0
                })
                .map((item) => item.created_at)}
              tickFormatter={(value) => {
                const date = new Date(value)
                const minutes = date.getMinutes()
                return minutes === 0 ? `${date.getHours()}:00` : `${date.getHours()}:${minutes}`
              }}
            />
            <YAxis
              yAxisId="delay"
              tickLine={false}
              axisLine={false}
              tickMargin={15}
              minTickGap={20}
              tickFormatter={(value) => `${value}ms`}
            />
            {activeChart !== defaultChart && (
              <YAxis
                yAxisId="packet-loss"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={15}
                minTickGap={20}
                tickFormatter={(value) => `${value}%`}
              />
            )}
            <ChartTooltip
              isAnimationActive={false}
              content={
                <ChartTooltipContent
                  indicator={"line"}
                  labelKey="created_at"
                  labelFormatter={(_, payload) => {
                    return formatTime(payload[0].payload.created_at)
                  }}
                  formatter={(value, name) => {
                    let formattedValue: string
                    let label: string

                    if (name === "packet_loss") {
                      formattedValue = `${Number(value).toFixed(2)}%`
                      label = t("packet_loss")
                    } else if (name === "avg_delay") {
                      formattedValue = `${Number(value).toFixed(2)}ms`
                      label = t("avg_delay")
                    } else {
                      // For monitor names (in multi-chart view) - delay data
                      formattedValue = `${Number(value).toFixed(2)}ms`
                      label = name as string
                    }

                    return (
                      <div className="flex flex-1 items-center justify-between leading-none">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="ml-2 font-medium text-foreground tabular-nums">
                          {formattedValue}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            {activeChart === defaultChart && <ChartLegend content={<ChartLegendContent />} />}
            {chartElements}
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
})

const transformData = (data: NezhaAPIMonitor[]) => {
  const monitorData: ServerMonitorChart = {}

  for (const item of data) {
    const monitorName = item.monitor_name

    if (!monitorData[monitorName]) {
      monitorData[monitorName] = []
    }

    for (let i = 0; i < item.created_at.length; i++) {
      monitorData[monitorName].push({
        created_at: item.created_at[i],
        avg_delay: item.avg_delay[i],
        packet_loss: item.packet_loss?.[i] ?? 0,
      })
    }
  }

  return monitorData
}

const formatData = (rawData: NezhaAPIMonitor[]) => {
  const result: { [time: number]: ResultItem } = {}

  const allTimes = new Set<number>()
  for (const item of rawData) {
    for (const time of item.created_at) {
      allTimes.add(time)
    }
  }

  const allTimeArray = Array.from(allTimes).sort((a, b) => a - b)

  for (const item of rawData) {
    const { monitor_name, created_at, avg_delay } = item

    for (const time of allTimeArray) {
      if (!result[time]) {
        result[time] = { created_at: time }
      }

      const timeIndex = created_at.indexOf(time)
      // @ts-expect-error - avg_delay is an array
      result[time][monitor_name] = timeIndex !== -1 ? avg_delay[timeIndex] : null
      // Add packet loss data if available
      if (item.packet_loss) {
        // @ts-expect-error - packet_loss is an array
        result[time][`${monitor_name}_packet_loss`] =
          timeIndex !== -1 ? item.packet_loss[timeIndex] : null
      }
    }
  }

  return Object.values(result).sort((a, b) => a.created_at - b.created_at)
}
