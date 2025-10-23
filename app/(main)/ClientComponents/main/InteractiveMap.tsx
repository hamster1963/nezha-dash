"use client"

import { geoEquirectangular, geoPath } from "d3-geo"
import MapTooltip from "@/app/(main)/ClientComponents/main/MapTooltip"
import { useTooltip } from "@/app/context/tooltip-context"
import { countryCoordinates } from "@/lib/geo/geo-limit"
import { getCountryCodeForMap } from "@/lib/utils"

interface InteractiveMapProps {
  countries: string[]
  serverCounts: { [key: string]: number }
  width: number
  height: number
  filteredFeatures: any[]
  nezhaServerList: any
}

export function InteractiveMap({
  countries,
  serverCounts,
  width,
  height,
  filteredFeatures,
  nezhaServerList,
}: InteractiveMapProps) {
  const { setTooltipData } = useTooltip()

  const projection = geoEquirectangular()
    .scale(140)
    .translate([width / 2, height / 2])
    .rotate([-12, 0, 0])

  const path = geoPath().projection(projection)

  return (
    <div className="relative aspect-2/1 w-full" onMouseLeave={() => setTooltipData(null)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full"
      >
        <title>Interactive Map</title>
        <defs>
          <pattern width="2" height="2" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="currentColor" />
          </pattern>
        </defs>
        <g>
          {/* Background rect to handle mouse events in empty areas */}
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="transparent"
            onMouseEnter={() => setTooltipData(null)}
          />
          {filteredFeatures.map((feature, index) => {
            const isHighlighted = countries.includes(feature.properties.iso_a2_eh)

            const serverCount = serverCounts[feature.properties.iso_a2_eh] || 0

            return (
              <path
                key={feature.properties.iso_a2_eh + String(index)}
                d={path(feature) || ""}
                className={
                  isHighlighted
                    ? "cursor-pointer fill-green-700 transition-all hover:fill-green-600 dark:fill-green-900 dark:hover:fill-green-700"
                    : "fill-neutral-200/50 stroke-[0.5] stroke-neutral-300/40 dark:fill-neutral-800 dark:stroke-neutral-700"
                }
                onMouseEnter={() => {
                  if (!isHighlighted) {
                    setTooltipData(null)
                    return
                  }
                  if (path.centroid(feature)) {
                    const countryCode = feature.properties.iso_a2_eh
                    const countryServers = nezhaServerList.result
                      .filter((server: any) => {
                        const serverCountryCode = getCountryCodeForMap(server.host.CountryCode)
                        return serverCountryCode === countryCode
                      })
                      .map((server: any) => ({
                        id: server.id,
                        name: server.name,
                        status: server.online_status,
                      }))
                    setTooltipData({
                      centroid: path.centroid(feature),
                      country: feature.properties.name,
                      count: serverCount,
                      servers: countryServers,
                    })
                  }
                }}
              />
            )
          })}

          {/* 渲染不在 filteredFeatures 中的国家标记点 */}
          {countries.map((countryCode) => {
            // 检查该国家是否已经在 filteredFeatures 中
            const isInFilteredFeatures = filteredFeatures.some(
              (feature) => feature.properties.iso_a2_eh === countryCode,
            )

            // 如果已经在 filteredFeatures 中，跳过
            if (isInFilteredFeatures) return null

            // 获取国家的经纬度
            const coords = countryCoordinates[countryCode]
            if (!coords) return null

            // 使用投影函数将经纬度转换为 SVG 坐标
            const [x, y] = projection([coords.lng, coords.lat]) || [0, 0]
            const serverCount = serverCounts[countryCode] || 0

            return (
              <g
                key={countryCode}
                onMouseEnter={() => {
                  const countryServers = nezhaServerList.result
                    .filter((server: any) => {
                      const serverCountryCode = getCountryCodeForMap(server.host.CountryCode)
                      return serverCountryCode === countryCode
                    })
                    .map((server: any) => ({
                      id: server.id,
                      name: server.name,
                      status: server.online_status,
                    }))
                  setTooltipData({
                    centroid: [x, y],
                    country: coords.name,
                    count: serverCount,
                    servers: countryServers,
                  })
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={4}
                  className="fill-sky-700 stroke-white transition-all hover:fill-sky-600 dark:fill-sky-900 dark:hover:fill-sky-700"
                />
              </g>
            )
          })}
        </g>
      </svg>
      <MapTooltip />
    </div>
  )
}
