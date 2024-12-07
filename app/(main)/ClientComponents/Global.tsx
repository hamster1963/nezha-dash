"use client";

import { ServerApi } from "@/app/types/nezha-api";
import { nezhaFetcher } from "@/lib/utils";
import useSWR from "swr";

import { geoJsonString } from "../../../lib/geo-json-string";
import GlobalInfo from "./GlobalInfo";
import GlobalLoading from "./GlobalLoading";
import { InteractiveMap } from "./InteractiveMap";
import { TooltipProvider } from "./TooltipContext";

export default function ServerGlobal() {
  const { data: nezhaServerList, error } = useSWR<ServerApi>(
    "/api/server",
    nezhaFetcher,
  );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm font-medium opacity-40">{error.message}</p>
      </div>
    );

  if (!nezhaServerList) {
    return <GlobalLoading />;
  }

  const countryList: string[] = [];
  const serverCounts: { [key: string]: number } = {};

  nezhaServerList.result.forEach((server) => {
    if (server.host.CountryCode) {
      const countryCode = server.host.CountryCode.toUpperCase();
      if (!countryList.includes(countryCode)) {
        countryList.push(countryCode);
      }
      serverCounts[countryCode] = (serverCounts[countryCode] || 0) + 1;
    }
  });

  const width = 900;
  const height = 500;

  const geoJson = JSON.parse(geoJsonString);
  const filteredFeatures = geoJson.features.filter(
    (feature: any) => feature.properties.iso_a3_eh !== "",
  );

  return (
    <section className="flex flex-col gap-4 mt-[3.2px]">
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
  );
}
