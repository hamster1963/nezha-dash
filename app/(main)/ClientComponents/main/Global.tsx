"use client"

import GlobalInfo from "@/app/(main)/ClientComponents/main/GlobalInfo"
import { InteractiveMap } from "@/app/(main)/ClientComponents/main/InteractiveMap"
import { useServerData } from "@/app/context/server-data-context"
import { TooltipProvider } from "@/app/context/tooltip-context"
import GlobalLoading from "@/components/loading/GlobalLoading"
import { geoJsonString } from "@/lib/geo/geo-json-string"

export default function ServerGlobal() {
  const { data: nezhaServerList, error } = useServerData()

  if (error)
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="font-medium text-sm opacity-40">{error.message}</p>
      </div>
    )

  if (!nezhaServerList) {
    return <GlobalLoading />
  }

  const countryList: string[] = []
  const serverCounts: { [key: string]: number } = {}

  for (const server of nezhaServerList.result) {
    if (server.host.CountryCode) {
      const countryCode = server.host.CountryCode.toUpperCase()
      if (!countryList.includes(countryCode)) {
        countryList.push(countryCode)
      }
      serverCounts[countryCode] = (serverCounts[countryCode] || 0) + 1
    }
  }

  const width = 900
  const height = 500

  const geoJson = JSON.parse(geoJsonString)
  const filteredFeatures = geoJson.features.filter(
    (feature: any) => feature.properties.iso_a3_eh !== "",
  )

  return (
    <section className="mt-[3.2px] flex flex-col gap-4">
      <GlobalInfo countries={countryList} />
      <div className="w-full overflow-x-auto">
        <TooltipProvider>
          <InteractiveMap
            countries={countryList}
            serverCounts={serverCounts}
            width={width}
            height={height}
            filteredFeatures={filteredFeatures}
            nezhaServerList={nezhaServerList}
          />
        </TooltipProvider>
      </div>
    </section>
  )
}
