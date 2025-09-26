"use client"

import { use, useState } from "react"
import { NetworkChartClient } from "@/app/(main)/ClientComponents/detail/NetworkChart"
import ServerDetailChartClient from "@/app/(main)/ClientComponents/detail/ServerDetailChartClient"
import ServerDetailClient from "@/app/(main)/ClientComponents/detail/ServerDetailClient"
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

  // Check if Komari mode is enabled
  const isKomariMode = getEnv("NEXT_PUBLIC_Komari") === "true"

  // Always show both tabs, but disable Network tab in Komari mode
  const tabs: TabType[] = ["Detail", "Network"]
  const disabledTabs: TabType[] = isKomariMode ? ["Network"] : []
  const [currentTab, setCurrentTab] = useState<TabType>(tabs[0])

  // Handle tab switching - prevent switching to disabled tabs
  const handleTabSwitch = (tab: string) => {
    if (!disabledTabs.includes(tab as TabType)) {
      setCurrentTab(tab as TabType)
    }
  }

  const tabContent = {
    Detail: <ServerDetailChartClient server_id={serverId} show={currentTab === "Detail"} />,
    Network: isKomariMode ? (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <p className="mb-2 font-medium text-lg">网络延迟图表不可用</p>
          <p className="text-muted-foreground text-sm">
            在 Komari 模式下，网络延迟监控功能未提供。
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

      {tabContent[currentTab]}
    </main>
  )
}
