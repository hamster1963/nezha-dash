"use client"

import { useTranslations } from "next-intl"
import { useServerData } from "@/app/context/server-data-context"
import { Progress } from "@/components/ui/progress"
import { formatNezhaInfo } from "@/lib/utils"

export default function ServerDetailSummary({ server_id }: { server_id: number }) {
  const _t = useTranslations("ServerDetailChartClient")
  const { data: serverList, error } = useServerData()

  const data = serverList?.result?.find((item) => item.id === server_id)

  if (error || !data) {
    return null
  }

  const { cpu, gpu, mem, swap, disk, up, down, tcp, udp, process } = formatNezhaInfo(data)

  return (
    <div className="mb-4 flex flex-wrap gap-4">
      <section className="flex w-24 flex-col gap-1 px-1.5 py-1">
        <section className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">CPU</span>
          <span className="font-medium text-[10px]">{cpu.toFixed(2)}%</span>
        </section>
        <UsageBar value={cpu} />
      </section>
      {gpu > 0 && (
        <section className="flex w-24 flex-col gap-1 px-1.5 py-1">
          <section className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">GPU</span>
            <span className="font-medium text-[10px]">{gpu.toFixed(2)}%</span>
          </section>
          <UsageBar value={gpu} />
        </section>
      )}
      <section className="flex w-24 flex-col gap-1 px-1.5 py-1">
        <section className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{_t("Mem")}</span>
          <span className="font-medium text-[10px]">{mem.toFixed(2)}%</span>
        </section>
        <UsageBar value={mem} />
      </section>
      {swap > 0 && (
        <section className="flex w-24 flex-col gap-1 px-1.5 py-1">
          <section className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{_t("Swap")}</span>
            <span className="font-medium text-[10px]">{swap.toFixed(2)}%</span>
          </section>
          <UsageBar value={swap} />
        </section>
      )}
      <section className="flex w-24 flex-col gap-1 px-1.5 py-1">
        <section className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{_t("Disk")}</span>
          <span className="font-medium text-[10px]">{disk.toFixed(2)}%</span>
        </section>
        <UsageBar value={disk} />
      </section>
      <section className="flex w-32 flex-col gap-0.5 px-1.5 py-1">
        <section className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{_t("Upload")}</span>
          <span className="font-medium text-[10px]">{up.toFixed(2)}M/s</span>
        </section>
        <section className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{_t("Download")}</span>
          <span className="font-medium text-[10px]">{down.toFixed(2)}M/s</span>
        </section>
      </section>
      <section className="flex w-20 flex-col gap-0.5 px-1.5 py-1">
        <section className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">TCP</span>
          <span className="font-medium text-[10px]">{tcp}</span>
        </section>
        <section className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">UDP</span>
          <span className="font-medium text-[10px]">{udp}</span>
        </section>
      </section>
      <section className="flex w-24 flex-col justify-center gap-1 px-1.5 py-1">
        <section className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{_t("Process")}</span>
          <span className="font-medium text-[10px]">{process}</span>
        </section>
      </section>
    </div>
  )
}

type UsageBarProps = {
  value: number
}

function UsageBar({ value }: UsageBarProps) {
  return (
    <Progress
      aria-label={"Server Usage Bar"}
      aria-labelledby={"Server Usage Bar"}
      value={value}
      indicatorClassName={value > 90 ? "bg-red-500" : value > 70 ? "bg-orange-400" : "bg-green-500"}
      className={"h-[3px] rounded-sm bg-neutral-200 dark:bg-neutral-700"}
    />
  )
}
