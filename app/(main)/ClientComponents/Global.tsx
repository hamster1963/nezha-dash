import { GetNezhaData } from "@/lib/serverFetch";

import { geoJsonString } from "../../../lib/geo-json-string";
import GlobalInfo from "./GlobalInfo";
import { InteractiveMap } from "./InteractiveMap";

export default async function ServerGlobal() {
  const nezhaServerList = await GetNezhaData();

  const countrytList: string[] = [];
  const serverCounts: { [key: string]: number } = {};

  nezhaServerList.result.forEach((server) => {
    if (server.host.CountryCode) {
      const countryCode = server.host.CountryCode.toUpperCase();
      if (!countrytList.includes(countryCode)) {
        countrytList.push(countryCode);
      }
      serverCounts[countryCode] = (serverCounts[countryCode] || 0) + 1;
    }
  });

  countrytList.push("TW");
  countrytList.push("SG");
  countrytList.push("RU");

  const width = 900;
  const height = 500;

  const geoJson = JSON.parse(geoJsonString);
  const filteredFeatures = geoJson.features.filter(
    (feature: any) => feature.properties.iso_a3 !== "",
  );

  return (
    <section className="flex flex-col gap-4 mt-[3.2px]">
      <GlobalInfo countries={countrytList} />
      <div className="w-full overflow-x-auto">
        <InteractiveMap
          countries={countrytList}
          serverCounts={serverCounts}
          width={width}
          height={height}
          filteredFeatures={filteredFeatures}
        />
      </div>
    </section>
  );
}
