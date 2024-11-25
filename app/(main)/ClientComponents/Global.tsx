import { countryCodeMapping } from "@/lib/geo";
import { GetNezhaData } from "@/lib/serverFetch";
import { geoEqualEarth, geoPath } from "d3-geo";

import { geoJsonString } from "../../../lib/geo-json-string";
import GlobalInfo from "./GlobalInfo";

interface GlobalProps {
  countries?: string[];
}

export default async function ServerGlobal() {
  const nezhaServerList = await GetNezhaData();

  const countrytList: string[] = [];
  nezhaServerList.result.forEach((server) => {
    if (server.host.CountryCode) {
      server.host.CountryCode = server.host.CountryCode.toUpperCase();
      if (!countrytList.includes(server.host.CountryCode)) {
        countrytList.push(server.host.CountryCode);
      }
    }
  });

  return <Global countries={countrytList} />;
}

export async function Global({ countries = [] }: GlobalProps) {
  const width = 900;
  const height = 500;

  const projection = geoEqualEarth()
    .scale(180)
    .translate([width / 2, height / 2])
    .rotate([0, 0]); // 调整旋转以优化显示效果

  const path = geoPath().projection(projection);

  const geoJson = JSON.parse(geoJsonString);
  const countries_alpha3 = countries
    .map((code) => countryCodeMapping[code])
    .filter((code) => code !== undefined);

  const filteredFeatures = geoJson.features.filter(
    (feature: any) => feature.properties.iso_a3 !== "",
  );

  return (
    <section className="flex flex-col gap-4 mt-[3.2px]">
      <GlobalInfo countries={countries} />
      <div className="w-full overflow-x-auto">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <defs>
            <pattern
              id="dots"
              width="2"
              height="2"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.5" fill="currentColor" />
            </pattern>
          </defs>
          <g>
            {/* @ts-ignore */}
            {filteredFeatures.map((feature, index) => {
              const isHighlighted = countries_alpha3.includes(
                feature.properties.iso_a3,
              );
              return (
                <path
                  key={index}
                  d={path(feature) || ""}
                  className={
                    isHighlighted
                      ? "fill-orange-500 stroke-orange-500 dark:stroke-amber-900  dark:fill-amber-900"
                      : " fill-neutral-200/50 dark:fill-neutral-800 stroke-neutral-300/40 dark:stroke-neutral-700 stroke-[0.5]"
                  }
                />
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}
