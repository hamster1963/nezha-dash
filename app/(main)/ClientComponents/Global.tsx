import { GetNezhaData } from "@/lib/serverFetch";

import { geoJsonString } from "../../../lib/geo-json-string";
import GlobalInfo from "./GlobalInfo";
import { InteractiveMap } from "./InteractiveMap";

export default async function ServerGlobal() {
  const nezhaServerList = await GetNezhaData();

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
        <InteractiveMap
          countries={countryList}
          serverCounts={serverCounts}
          width={width}
          height={height}
          filteredFeatures={filteredFeatures}
        />
      </div>
    </section>
  );
}
