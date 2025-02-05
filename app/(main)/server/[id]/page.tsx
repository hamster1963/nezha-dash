"use client"

import { NetworkChartClient } from "@/app/(main)/ClientComponents/detail/NetworkChart"
import ServerDetailChartClient from "@/app/(main)/ClientComponents/detail/ServerDetailChartClient"
import ServerDetailClient from "@/app/(main)/ClientComponents/detail/ServerDetailClient"
import ServerIPInfo from "@/app/(main)/ClientComponents/detail/ServerIPInfo"
import TabSwitch from "@/components/TabSwitch"
import { Separator } from "@/components/ui/separator"
import getEnv from "@/lib/env-entry"
import { use, useState } from "react"

type PageProps = {
  params: Promise<{ id: string }>
}

type TabType = "Detail" | "Network"

export default function Page({ params }: PageProps) {
  const { id } = use(params)
  const serverId = Number(id)
  const tabs: TabType[] = ["Detail", "Network"]
  const [currentTab, setCurrentTab] = useState<TabType>(tabs[0])

  const tabContent = {
    Detail: <ServerDetailChartClient server_id={serverId} show={currentTab === "Detail"} />,
    Network: (
      <>
        {getEnv("NEXT_PUBLIC_ShowIpInfo") && <ServerIPInfo server_id={serverId} />}
        <NetworkChartClient server_id={serverId} show={currentTab === "Network"} />
      </>
    ),
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-2">
      <ServerDetailClient server_id={serverId} />

      <nav className="flex items-center my-2 w-full">
        <Separator className="flex-1" />
        <div className="flex justify-center w-full max-w-[200px]">
          <TabSwitch
            tabs={tabs}
            currentTab={currentTab}
            setCurrentTab={(tab: string) => setCurrentTab(tab as TabType)}
          />
        </div>
        <Separator className="flex-1" />
      </nav>

      {tabContent[currentTab]}
    </main>
  )
}
