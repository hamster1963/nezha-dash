import { countryCodeMapping, reverseCountryCodeMapping } from "@/lib/geo";
import { countryCoordinates } from "@/lib/geo-limit";
import { GetNezhaData } from "@/lib/serverFetch";
import * as turf from "@turf/turf";
import DottedMap from "dotted-map/without-countries";

import { geoJsonString } from "../../../lib/geo-json-string";
import { mapJsonString } from "../../../lib/map-string";
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
  const map = new DottedMap({ map: JSON.parse(mapJsonString) });

  const countries_alpha3 = countries
    .map((code) => countryCodeMapping[code])
    .filter((code) => code !== undefined);

  const geoJson = JSON.parse(geoJsonString);

  countries_alpha3.forEach((countryCode) => {
    const feature = geoJson.features.find(
      (f: any) => f.properties.iso_a3 === countryCode,
    );

    if (feature) {
      if (countryCode === "RUS") {
        // 获取俄罗斯的多个边界
        const bboxList = feature.geometry.coordinates.map((polygon: any) =>
          turf.bbox({ type: "Polygon", coordinates: polygon }),
        );

        const spacing = 20; // 单位为千米
        const options = { units: "kilometers" };

        bboxList.forEach((bbox: any) => {
          // @ts-expect-error ignore
          const pointGrid = turf.pointGrid(bbox, spacing, options);

          // 过滤出位于当前多边形内部的点
          const pointsWithin = turf.pointsWithinPolygon(pointGrid, feature);

          if (pointsWithin.features.length === 0) {
            const centroid = turf.centroid(feature);
            const [lng, lat] = centroid.geometry.coordinates;
            map.addPin({
              lat,
              lng,
              svgOptions: { color: "#FF4500", radius: 0.3 },
            });
          } else {
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
      }
      // 获取国家的边界框
      const bbox = turf.bbox(feature);

      const spacing = 20; // 单位为千米，值越小点越密集
      const options = { units: "kilometers" };
      // @ts-expect-error ignore
      const pointGrid = turf.pointGrid(bbox, spacing, options);

      // 过滤出位于国家多边形内部的点
      const pointsWithin = turf.pointsWithinPolygon(pointGrid, feature);

      // 如果没有点在多边形内部，则使用国家的中心点
      if (pointsWithin.features.length === 0) {
        const centroid = turf.centroid(feature);
        const [lng, lat] = centroid.geometry.coordinates;
        map.addPin({
          lat,
          lng,
          svgOptions: { color: "#FF4500", radius: 0.3 },
        });
      } else {
        pointsWithin.features.forEach((point: any) => {
          const [lng, lat] = point.geometry.coordinates;
          map.addPin({
            lat,
            lng,
            svgOptions: { color: "#FF4500", radius: 0.3 },
          });
        });
      }
    } else {
      // 如果找不到feature，使用countryCoordinates中的坐标
      const alpha2Code = reverseCountryCodeMapping[countryCode];
      if (alpha2Code && countryCoordinates[alpha2Code]) {
        const coordinates = countryCoordinates[alpha2Code];
        map.addPin({
          lat: coordinates.lat,
          lng: coordinates.lng,
          svgOptions: { color: "#FF4500", radius: 0.3 },
        });
      }
    }
  });

  const finalMap = map.getSVG({
    radius: 0.35,
    color: "#D1D5DA",
    shape: "circle",
  });

  return (
    <section className="flex flex-col gap-4 mt-[3.2px]">
      <GlobalInfo countries={countries} />
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(finalMap)}`}
        alt="World Map with Highlighted Countries"
      />
    </section>
  );
}
