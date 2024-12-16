"use client"

import { NetworkChartClient } from "@/app/(main)/ClientComponents/detail/NetworkChart"
import ServerDetailChartClient from "@/app/(main)/ClientComponents/detail/ServerDetailChartClient"
import ServerDetailClient from "@/app/(main)/ClientComponents/detail/ServerDetailClient"
import TabSwitch from "@/components/TabSwitch"
import { Separator } from "@/components/ui/separator"
import getEnv from "@/lib/env-entry"
import { use, useState } from "react"

import ServerIPInfo from "../../ClientComponents/detail/ServerIPInfo"

export default function Page(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const tabs = ["Detail", "Network"]
  const [currentTab, setCurrentTab] = useState(tabs[0])
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-2">
      <ServerDetailClient server_id={Number(params.id)} />
      <section className="flex items-center my-2 w-full">
        <Separator className="flex-1" />
        <div className="flex justify-center w-full max-w-[200px]">
          <TabSwitch tabs={tabs} currentTab={currentTab} setCurrentTab={setCurrentTab} />
        </div>
        <Separator className="flex-1" />
      </section>
      <div style={{ display: currentTab === tabs[0] ? "block" : "none" }}>
        <ServerDetailChartClient server_id={Number(params.id)} show={currentTab === tabs[0]} />
      </div>
      <div style={{ display: currentTab === tabs[1] ? "block" : "none" }}>
        {getEnv("NEXT_PUBLIC_ShowIpInfo") && <ServerIPInfo server_id={Number(params.id)} />}
        <NetworkChartClient server_id={Number(params.id)} show={currentTab === tabs[1]} />
      </div>
    </div>
  )
}
