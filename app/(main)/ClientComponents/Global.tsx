import { countryCodeMapping } from "@/lib/geo";
import { GetNezhaData } from "@/lib/serverFetch";
import { ServerStackIcon } from "@heroicons/react/20/solid";
import * as turf from "@turf/turf";
import DottedMap from "dotted-map/without-countries";
import Link from "next/link";

import { geoJsonString } from "../../../lib/geo-json-string";
import { mapJsonString } from "../../../lib/map-string";

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
  const map = new DottedMap({ map: JSON.parse(mapJsonString) });

  const countries_alpha3 = countries
    .map((code) => countryCodeMapping[code])
    .filter((code) => code !== undefined);

  const geoJson = JSON.parse(geoJsonString);

  countries_alpha3.forEach((countryCode) => {
    const feature = geoJson.features.find((f: any) => f.id === countryCode);

    if (feature) {
      // 获取国家的边界框
      const bbox = turf.bbox(feature);

      const spacing = 100; // 单位为千米，值越小点越密集
      const options = { units: "kilometers" };
      // @ts-expect-error ignore
      const pointGrid = turf.pointGrid(bbox, spacing, options);

      // 过滤出位于国家多边形内部的点
      const pointsWithin = turf.pointsWithinPolygon(pointGrid, feature);

      pointsWithin.features.forEach((point: any) => {
        const [lng, lat] = point.geometry.coordinates;
        map.addPin({
          lat,
          lng,
          svgOptions: { color: "#FF4500", radius: 0.3 },
        });
      });
    }
  });

  const finalMap = map.getSVG({
    radius: 0.35,
    color: "#D1D5DA",
    shape: "circle",
  });

  return (
    <section className="flex flex-col gap-4 mt-[3.2px]">
      <Link
        href={`/`}
        className="rounded-[50px] w-fit bg-stone-100 p-[10px] transition-all hover:bg-stone-200 dark:hover:bg-stone-700 dark:bg-stone-800"
      >
        <ServerStackIcon className="size-4" />
      </Link>
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(finalMap)}`}
        alt="World Map with Highlighted Countries"
      />
    </section>
  );
}
