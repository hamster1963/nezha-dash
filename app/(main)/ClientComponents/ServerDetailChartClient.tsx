"use client"

import { ServerDetailChartLoading } from "@/app/(main)/ClientComponents/ServerDetailLoading"
import { NezhaAPISafe, ServerApi } from "@/app/types/nezha-api"
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar"
import { Card, CardContent } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { formatBytes, formatNezhaInfo, formatRelativeTime, nezhaFetcher } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import useSWRImmutable from "swr/immutable"

type cpuChartData = {
  timeStamp: string
  cpu: number
}

type processChartData = {
  timeStamp: string
  process: number
}

type diskChartData = {
  timeStamp: string
  disk: number
}

type memChartData = {
  timeStamp: string
  mem: number
  swap: number
}

type networkChartData = {
  timeStamp: string
  upload: number
  download: number
}

type connectChartData = {
  timeStamp: string
  tcp: number
  udp: number
}

export default function ServerDetailChartClient({
  server_id,
}: {
  server_id: number
  show: boolean
}) {
  const t = useTranslations("ServerDetailChartClient")

  const { data: allFallbackData } = useSWRImmutable<ServerApi>("/api/server", nezhaFetcher)
  const fallbackData = allFallbackData?.result?.find((item) => item.id === server_id)

  const { data, error } = useSWRImmutable<NezhaAPISafe>(
    `/api/detail?server_id=${server_id}`,
    nezhaFetcher,
    {
      fallbackData,
    },
  )

  if (error) {
    return (
      <>
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium opacity-40">{error.message}</p>
          <p className="text-sm font-medium opacity-40">{t("chart_fetch_error_message")}</p>
        </div>
      </>
    )
  }
  if (!data) return <ServerDetailChartLoading />

  return (
    <section className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-3">
      <CpuChart data={data} />
      <ProcessChart data={data} />
      <DiskChart data={data} />
      <MemChart data={data} />
      <NetworkChart data={data} />
      <ConnectChart data={data} />
    </section>
  )
}

function CpuChart({ data }: { data: NezhaAPISafe }) {
  const [cpuChartData, setCpuChartData] = useState([] as cpuChartData[])

  const { cpu } = formatNezhaInfo(data)

  useEffect(() => {
    if (data) {
      const timestamp = Date.now().toString()
      let newData = [] as cpuChartData[]
      if (cpuChartData.length === 0) {
        newData = [
          { timeStamp: timestamp, cpu: cpu },
          { timeStamp: timestamp, cpu: cpu },
        ]
      } else {
        newData = [...cpuChartData, { timeStamp: timestamp, cpu: cpu }]
      }
      if (newData.length > 30) {
        newData.shift()
      }
      setCpuChartData(newData)
    }
  }, [data])

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
            <p className="text-md font-medium">CPU</p>
            <section className="flex items-center gap-2">
              <p className="text-xs text-end w-10 font-medium">{cpu.toFixed(0)}%</p>
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

function ProcessChart({ data }: { data: NezhaAPISafe }) {
  const t = useTranslations("ServerDetailChartClient")

  const [processChartData, setProcessChartData] = useState([] as processChartData[])

  const { process } = formatNezhaInfo(data)

  useEffect(() => {
    if (data) {
      const timestamp = Date.now().toString()
      let newData = [] as processChartData[]
      if (processChartData.length === 0) {
        newData = [
          { timeStamp: timestamp, process: process },
          { timeStamp: timestamp, process: process },
        ]
      } else {
        newData = [...processChartData, { timeStamp: timestamp, process: process }]
      }
      if (newData.length > 30) {
        newData.shift()
      }
      setProcessChartData(newData)
    }
  }, [data])

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
            <p className="text-md font-medium">{t("Process")}</p>
            <section className="flex items-center gap-2">
              <p className="text-xs text-end w-10 font-medium">{process}</p>
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

function MemChart({ data }: { data: NezhaAPISafe }) {
  const t = useTranslations("ServerDetailChartClient")

  const [memChartData, setMemChartData] = useState([] as memChartData[])

  const { mem, swap } = formatNezhaInfo(data)

  useEffect(() => {
    if (data) {
      const timestamp = Date.now().toString()
      let newData = [] as memChartData[]
      if (memChartData.length === 0) {
        newData = [
          { timeStamp: timestamp, mem: mem, swap: swap },
          { timeStamp: timestamp, mem: mem, swap: swap },
        ]
      } else {
        newData = [...memChartData, { timeStamp: timestamp, mem: mem, swap: swap }]
      }
      if (newData.length > 30) {
        newData.shift()
      }
      setMemChartData(newData)
    }
  }, [data])

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
                <p className=" text-xs text-muted-foreground">{t("Mem")}</p>
                <div className="flex items-center gap-2">
                  <AnimatedCircularProgressBar
                    className="size-3 text-[0px]"
                    max={100}
                    min={0}
                    value={mem}
                    primaryColor="hsl(var(--chart-8))"
                  />
                  <p className="text-xs font-medium">{mem.toFixed(0)}%</p>
                </div>
              </div>
              <div className="flex flex-col">
                <p className=" text-xs text-muted-foreground">{t("Swap")}</p>
                <div className="flex items-center gap-2">
                  <AnimatedCircularProgressBar
                    className="size-3 text-[0px]"
                    max={100}
                    min={0}
                    value={swap}
                    primaryColor="hsl(var(--chart-10))"
                  />
                  <p className="text-xs font-medium">{swap.toFixed(0)}%</p>
                </div>
              </div>
            </section>
            <section className="flex flex-col items-end gap-0.5">
              <div className="flex text-[11px] font-medium items-center gap-2">
                {formatBytes(data.status.MemUsed)} / {formatBytes(data.host.MemTotal)}
              </div>
              <div className="flex text-[11px] font-medium items-center gap-2">
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

function DiskChart({ data }: { data: NezhaAPISafe }) {
  const t = useTranslations("ServerDetailChartClient")

  const [diskChartData, setDiskChartData] = useState([] as diskChartData[])

  const { disk } = formatNezhaInfo(data)

  useEffect(() => {
    if (data) {
      const timestamp = Date.now().toString()
      let newData = [] as diskChartData[]
      if (diskChartData.length === 0) {
        newData = [
          { timeStamp: timestamp, disk: disk },
          { timeStamp: timestamp, disk: disk },
        ]
      } else {
        newData = [...diskChartData, { timeStamp: timestamp, disk: disk }]
      }
      if (newData.length > 30) {
        newData.shift()
      }
      setDiskChartData(newData)
    }
  }, [data])

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
            <p className="text-md font-medium">{t("Disk")}</p>
            <section className="flex flex-col items-end gap-0.5">
              <section className="flex items-center gap-2">
                <p className="text-xs text-end w-10 font-medium">{disk.toFixed(0)}%</p>
                <AnimatedCircularProgressBar
                  className="size-3 text-[0px]"
                  max={100}
                  min={0}
                  value={disk}
                  primaryColor="hsl(var(--chart-5))"
                />
              </section>
              <div className="flex text-[11px] font-medium items-center gap-2">
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

function NetworkChart({ data }: { data: NezhaAPISafe }) {
  const t = useTranslations("ServerDetailChartClient")

  const [networkChartData, setNetworkChartData] = useState([] as networkChartData[])

  const { up, down } = formatNezhaInfo(data)

  useEffect(() => {
    if (data) {
      const timestamp = Date.now().toString()
      let newData = [] as networkChartData[]
      if (networkChartData.length === 0) {
        newData = [
          { timeStamp: timestamp, upload: up, download: down },
          { timeStamp: timestamp, upload: up, download: down },
        ]
      } else {
        newData = [...networkChartData, { timeStamp: timestamp, upload: up, download: down }]
      }
      if (newData.length > 30) {
        newData.shift()
      }
      setNetworkChartData(newData)
    }
  }, [data])

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
              <div className="flex flex-col w-20">
                <p className="text-xs text-muted-foreground">{t("Upload")}</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex  size-1.5 rounded-full bg-[hsl(var(--chart-1))]"></span>
                  <p className="text-xs font-medium">{up.toFixed(2)} M/s</p>
                </div>
              </div>
              <div className="flex flex-col w-20">
                <p className=" text-xs text-muted-foreground">{t("Download")}</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex  size-1.5 rounded-full bg-[hsl(var(--chart-4))]"></span>
                  <p className="text-xs font-medium">{down.toFixed(2)} M/s</p>
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

function ConnectChart({ data }: { data: NezhaAPISafe }) {
  const [connectChartData, setConnectChartData] = useState([] as connectChartData[])

  const { tcp, udp } = formatNezhaInfo(data)

  useEffect(() => {
    if (data) {
      const timestamp = Date.now().toString()
      let newData = [] as connectChartData[]
      if (connectChartData.length === 0) {
        newData = [
          { timeStamp: timestamp, tcp: tcp, udp: udp },
          { timeStamp: timestamp, tcp: tcp, udp: udp },
        ]
      } else {
        newData = [...connectChartData, { timeStamp: timestamp, tcp: tcp, udp: udp }]
      }
      if (newData.length > 30) {
        newData.shift()
      }
      setConnectChartData(newData)
    }
  }, [data])

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
              <div className="flex flex-col w-12">
                <p className="text-xs text-muted-foreground">TCP</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex  size-1.5 rounded-full bg-[hsl(var(--chart-1))]"></span>
                  <p className="text-xs font-medium">{tcp}</p>
                </div>
              </div>
              <div className="flex flex-col w-12">
                <p className=" text-xs text-muted-foreground">UDP</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex  size-1.5 rounded-full bg-[hsl(var(--chart-4))]"></span>
                  <p className="text-xs font-medium">{udp}</p>
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
