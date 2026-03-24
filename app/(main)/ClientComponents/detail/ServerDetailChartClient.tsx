"use client"

import { useTranslations } from "next-intl"
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  MAX_HISTORY_LENGTH,
  type ServerDataWithTimestamp,
  useServerData,
} from "@/app/context/server-data-context"
import { ServerDetailChartLoading } from "@/components/loading/ServerDetailLoading"
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar"
import { Card, CardContent } from "@/components/ui/card"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import type { NezhaAPISafe } from "@/lib/drivers/types"
import { formatBytes, formatNezhaInfo, formatRelativeTime } from "@/lib/utils"

type FormattedServerInfo = ReturnType<typeof formatNezhaInfo>

function buildServerMetricHistory<T extends Record<string, number>>({
  data,
  history,
  select,
}: {
  data: NezhaAPISafe
  history: ServerDataWithTimestamp[]
  select: (server: FormattedServerInfo) => T
}) {
  const historyPoints = [...history]
    .reverse()
    .map((snapshot) => {
      const server = snapshot.data.result.find((item) => item.id === data.id)
      if (!server) {
        return null
      }

      return {
        timeStamp: snapshot.timestamp.toString(),
        ...select(formatNezhaInfo(server)),
      }
    })
    .filter((point): point is { timeStamp: string } & T => point !== null)

  const currentMetrics = select(formatNezhaInfo(data))
  const currentPoint = {
    timeStamp: Date.now().toString(),
    ...currentMetrics,
  }

  if (historyPoints.length === 0) {
    return [currentPoint, currentPoint]
  }

  const lastPoint = historyPoints[historyPoints.length - 1]
  const hasCurrentSnapshot = Object.entries(currentMetrics).every(
    ([key, value]) => lastPoint[key] === value,
  )

  if (hasCurrentSnapshot) {
    return historyPoints.slice(-MAX_HISTORY_LENGTH)
  }

  return [...historyPoints, currentPoint].slice(-MAX_HISTORY_LENGTH)
}

export default function ServerDetailChartClient({ server_id }: { server_id: number }) {
  const t = useTranslations("ServerDetailChartClient")

  const { data: serverList, error, history } = useServerData()

  const data = serverList?.result?.find((item) => item.id === server_id)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="font-medium text-sm opacity-40">{error.message}</p>
        <p className="font-medium text-sm opacity-40">{t("chart_fetch_error_message")}</p>
      </div>
    )
  }
  if (!data) return <ServerDetailChartLoading />

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <CpuChart data={data} history={history} />
      {data.host.GPU && data.host.GPU.length > 0 ? (
        <GpuChart data={data} history={history} />
      ) : null}
      <MemChart data={data} history={history} />
      <DiskChart data={data} history={history} />
      <NetworkChart data={data} history={history} />
      <ConnectChart data={data} history={history} />
      <ProcessChart data={data} history={history} />
    </section>
  )
}

function CpuChart({ history, data }: { history: ServerDataWithTimestamp[]; data: NezhaAPISafe }) {
  const { cpu } = formatNezhaInfo(data)
  const cpuChartData = buildServerMetricHistory({
    data,
    history,
    select: (server) => ({ cpu: server.cpu }),
  })

  const chartConfig = {
    cpu: {
      label: "CPU",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-md">CPU</p>
            <section className="flex items-center gap-2">
              <p className="w-10 text-end font-medium text-xs">{cpu.toFixed(0)}%</p>
              <AnimatedCircularProgressBar
                className="size-3 text-[0px]"
                max={100}
                min={0}
                value={cpu}
                primaryColor="hsl(var(--chart-1))"
              />
            </section>
          </div>
          <ChartContainer config={chartConfig} className="aspect-auto h-[130px] w-full">
            <AreaChart
              accessibilityLayer
              data={cpuChartData}
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
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
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
  )
}

function GpuChart({ history, data }: { history: ServerDataWithTimestamp[]; data: NezhaAPISafe }) {
  const { gpu } = formatNezhaInfo(data)
  const gpuChartData = buildServerMetricHistory({
    data,
    history,
    select: (server) => ({ gpu: server.gpu }),
  })

  const chartConfig = {
    gpu: {
      label: "GPU",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-md">GPU</p>
            <section className="flex items-center gap-2">
              <p className="w-10 text-end font-medium text-xs">{gpu.toFixed(0)}%</p>
              <AnimatedCircularProgressBar
                className="size-3 text-[0px]"
                max={100}
                min={0}
                value={gpu}
                primaryColor="hsl(var(--chart-3))"
              />
            </section>
          </div>
          <ChartContainer config={chartConfig} className="aspect-auto h-[130px] w-full">
            <AreaChart
              accessibilityLayer
              data={gpuChartData}
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
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
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
              <Area
                isAnimationActive={false}
                dataKey="gpu"
                type="step"
                fill="hsl(var(--chart-3))"
                fillOpacity={0.3}
                stroke="hsl(var(--chart-3))"
              />
            </AreaChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  )
}

function ProcessChart({
  data,
  history,
}: {
  data: NezhaAPISafe
  history: ServerDataWithTimestamp[]
}) {
  const t = useTranslations("ServerDetailChartClient")
  const { process } = formatNezhaInfo(data)
  const processChartData = buildServerMetricHistory({
    data,
    history,
    select: (server) => ({ process: server.process }),
  })

  const chartConfig = {
    process: {
      label: "Process",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-md">{t("Process")}</p>
            <section className="flex items-center gap-2">
              <p className="w-10 text-end font-medium text-xs">{process}</p>
            </section>
          </div>
          <ChartContainer config={chartConfig} className="aspect-auto h-[130px] w-full">
            <AreaChart
              accessibilityLayer
              data={processChartData}
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
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatRelativeTime(value)}
              />
              <YAxis tickLine={false} axisLine={false} mirror={true} tickMargin={-15} />
              <Area
                isAnimationActive={false}
                dataKey="process"
                type="step"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.3}
                stroke="hsl(var(--chart-2))"
              />
            </AreaChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  )
}

function MemChart({ data, history }: { data: NezhaAPISafe; history: ServerDataWithTimestamp[] }) {
  const t = useTranslations("ServerDetailChartClient")
  const { mem, swap } = formatNezhaInfo(data)
  const memChartData = buildServerMetricHistory({
    data,
    history,
    select: (server) => ({ mem: server.mem, swap: server.swap }),
  })

  const chartConfig = {
    mem: {
      label: "Mem",
    },
    swap: {
      label: "Swap",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <section className="flex items-center gap-4">
              <div className="flex flex-col">
                <p className="text-muted-foreground text-xs">{t("Mem")}</p>
                <div className="flex items-center gap-2">
                  <AnimatedCircularProgressBar
                    className="size-3 text-[0px]"
                    max={100}
                    min={0}
                    value={mem}
                    primaryColor="hsl(var(--chart-8))"
                  />
                  <p className="font-medium text-xs">{mem.toFixed(0)}%</p>
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-muted-foreground text-xs">{t("Swap")}</p>
                <div className="flex items-center gap-2">
                  <AnimatedCircularProgressBar
                    className="size-3 text-[0px]"
                    max={100}
                    min={0}
                    value={swap}
                    primaryColor="hsl(var(--chart-10))"
                  />
                  <p className="font-medium text-xs">{swap.toFixed(0)}%</p>
                </div>
              </div>
            </section>
            <section className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-2 font-medium text-[11px]">
                {formatBytes(data.status.MemUsed)} / {formatBytes(data.host.MemTotal)}
              </div>
              <div className="flex items-center gap-2 font-medium text-[11px]">
                swap: {formatBytes(data.status.SwapUsed)}
              </div>
            </section>
          </div>
          <ChartContainer config={chartConfig} className="aspect-auto h-[130px] w-full">
            <AreaChart
              accessibilityLayer
              data={memChartData}
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
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
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
              <Area
                isAnimationActive={false}
                dataKey="mem"
                type="step"
                fill="hsl(var(--chart-8))"
                fillOpacity={0.3}
                stroke="hsl(var(--chart-8))"
              />
              <Area
                isAnimationActive={false}
                dataKey="swap"
                type="step"
                fill="hsl(var(--chart-10))"
                fillOpacity={0.3}
                stroke="hsl(var(--chart-10))"
              />
            </AreaChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  )
}

function DiskChart({ data, history }: { data: NezhaAPISafe; history: ServerDataWithTimestamp[] }) {
  const t = useTranslations("ServerDetailChartClient")
  const { disk } = formatNezhaInfo(data)
  const diskChartData = buildServerMetricHistory({
    data,
    history,
    select: (server) => ({ disk: server.disk }),
  })

  const chartConfig = {
    disk: {
      label: "Disk",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-md">{t("Disk")}</p>
            <section className="flex flex-col items-end gap-0.5">
              <section className="flex items-center gap-2">
                <p className="w-10 text-end font-medium text-xs">{disk.toFixed(0)}%</p>
                <AnimatedCircularProgressBar
                  className="size-3 text-[0px]"
                  max={100}
                  min={0}
                  value={disk}
                  primaryColor="hsl(var(--chart-5))"
                />
              </section>
              <div className="flex items-center gap-2 font-medium text-[11px]">
                {formatBytes(data.status.DiskUsed)} / {formatBytes(data.host.DiskTotal)}
              </div>
            </section>
          </div>
          <ChartContainer config={chartConfig} className="aspect-auto h-[130px] w-full">
            <AreaChart
              accessibilityLayer
              data={diskChartData}
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
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
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
              <Area
                isAnimationActive={false}
                dataKey="disk"
                type="step"
                fill="hsl(var(--chart-5))"
                fillOpacity={0.3}
                stroke="hsl(var(--chart-5))"
              />
            </AreaChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  )
}

function NetworkChart({
  data,
  history,
}: {
  data: NezhaAPISafe
  history: ServerDataWithTimestamp[]
}) {
  const t = useTranslations("ServerDetailChartClient")
  const { up, down } = formatNezhaInfo(data)
  const networkChartData = buildServerMetricHistory({
    data,
    history,
    select: (server) => ({ upload: server.up, download: server.down }),
  })

  let maxDownload = Math.max(...networkChartData.map((item) => item.download))
  maxDownload = Math.ceil(maxDownload)
  if (maxDownload < 1) {
    maxDownload = 1
  }

  const chartConfig = {
    upload: {
      label: "Upload",
    },
    download: {
      label: "Download",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center">
            <section className="flex items-center gap-4">
              <div className="flex w-20 flex-col">
                <p className="text-muted-foreground text-xs">{t("Upload")}</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex size-1.5 rounded-full bg-[hsl(var(--chart-1))]" />
                  <p className="font-medium text-xs">{up.toFixed(2)} M/s</p>
                </div>
              </div>
              <div className="flex w-20 flex-col">
                <p className="text-muted-foreground text-xs">{t("Download")}</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex size-1.5 rounded-full bg-[hsl(var(--chart-4))]" />
                  <p className="font-medium text-xs">{down.toFixed(2)} M/s</p>
                </div>
              </div>
            </section>
          </div>
          <ChartContainer config={chartConfig} className="aspect-auto h-[130px] w-full">
            <LineChart
              accessibilityLayer
              data={networkChartData}
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
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatRelativeTime(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                mirror={true}
                tickMargin={-15}
                type="number"
                minTickGap={50}
                interval="preserveStartEnd"
                domain={[1, maxDownload]}
                tickFormatter={(value) => `${value.toFixed(0)}M/s`}
              />
              <Line
                isAnimationActive={false}
                dataKey="upload"
                type="linear"
                stroke="hsl(var(--chart-1))"
                strokeWidth={1}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                dataKey="download"
                type="linear"
                stroke="hsl(var(--chart-4))"
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  )
}

function ConnectChart({
  data,
  history,
}: {
  data: NezhaAPISafe
  history: ServerDataWithTimestamp[]
}) {
  const { tcp, udp } = formatNezhaInfo(data)
  const connectChartData = buildServerMetricHistory({
    data,
    history,
    select: (server) => ({ tcp: server.tcp, udp: server.udp }),
  })

  const chartConfig = {
    tcp: {
      label: "TCP",
    },
    udp: {
      label: "UDP",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center">
            <section className="flex items-center gap-4">
              <div className="flex w-12 flex-col">
                <p className="text-muted-foreground text-xs">TCP</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex size-1.5 rounded-full bg-[hsl(var(--chart-1))]" />
                  <p className="font-medium text-xs">{tcp}</p>
                </div>
              </div>
              <div className="flex w-12 flex-col">
                <p className="text-muted-foreground text-xs">UDP</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex size-1.5 rounded-full bg-[hsl(var(--chart-4))]" />
                  <p className="font-medium text-xs">{udp}</p>
                </div>
              </div>
            </section>
          </div>
          <ChartContainer config={chartConfig} className="aspect-auto h-[130px] w-full">
            <LineChart
              accessibilityLayer
              data={connectChartData}
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
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatRelativeTime(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                mirror={true}
                tickMargin={-15}
                type="number"
                interval="preserveStartEnd"
              />
              <Line
                isAnimationActive={false}
                dataKey="tcp"
                type="linear"
                stroke="hsl(var(--chart-1))"
                strokeWidth={1}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                dataKey="udp"
                type="linear"
                stroke="hsl(var(--chart-4))"
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  )
}
