"use client"

import { use, useState } from "react"
import { NetworkChartClient } from "@/app/(main)/ClientComponents/detail/NetworkChart"
import ServerDetailChartClient from "@/app/(main)/ClientComponents/detail/ServerDetailChartClient"
import ServerDetailClient from "@/app/(main)/ClientComponents/detail/ServerDetailClient"
import ServerDetailSummary from "@/app/(main)/ClientComponents/detail/ServerDetailSummary"
import ServerIPInfo from "@/app/(main)/ClientComponents/detail/ServerIPInfo"
import TabSwitch from "@/components/TabSwitch"
import { Separator } from "@/components/ui/separator"
import getEnv from "@/lib/env-entry"

type PageProps = {
  params: Promise<{ id: string }>
}

type TabType = "Detail" | "Network"

export default function Page({ params }: PageProps) {
  const { id } = use(params)
  const serverId = Number(id)

  // Check if alternative driver modes are enabled
  const isKomariMode = getEnv("NEXT_PUBLIC_Komari") === "true"
  const isMyNodeQueryMode = getEnv("NEXT_PUBLIC_MyNodeQuery") === "true"
  const disableNetworkTab = isKomariMode || isMyNodeQueryMode

  // Always show both tabs, but disable Network tab in Komari mode
  const tabs: TabType[] = ["Detail", "Network"]
  const disabledTabs: TabType[] = disableNetworkTab ? ["Network"] : []
  const [currentTab, setCurrentTab] = useState<TabType>(tabs[0])

  // Handle tab switching - prevent switching to disabled tabs
  const handleTabSwitch = (tab: string) => {
    if (!disabledTabs.includes(tab as TabType)) {
      setCurrentTab(tab as TabType)
    }
  }

  const tabContent = {
    Detail: <ServerDetailChartClient server_id={serverId} show={currentTab === "Detail"} />,
    Network: disableNetworkTab ? (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <p className="mb-2 font-medium text-lg">网络延迟图表不可用</p>
          <p className="text-muted-foreground text-sm">
            当前数据源模式下，网络延迟监控功能未提供。
          </p>
        </div>
      </div>
    ) : (
      <>
        {getEnv("NEXT_PUBLIC_ShowIpInfo") && <ServerIPInfo server_id={serverId} />}
        <NetworkChartClient server_id={serverId} show={currentTab === "Network"} />
      </>
    ),
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-2">
      <ServerDetailClient server_id={serverId} />

      {/* Always show tab navigation */}
      <nav className="my-2 flex w-full items-center">
        <Separator className="flex-1" />
        <div className="flex w-full max-w-[200px] justify-center">
          <TabSwitch
            tabs={tabs}
            currentTab={currentTab}
            setCurrentTab={handleTabSwitch}
            disabledTabs={disabledTabs}
          />
        </div>
        <Separator className="flex-1" />
      </nav>

      {/* detail lists */}
      <section>
        <ServerDetailSummary server_id={serverId} />
      </section>

      {tabContent[currentTab]}
    </main>
  )
}
