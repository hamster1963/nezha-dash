import { devGeoString } from "@/lib/dev-geo";
import DottedMap, { getMapJSON } from "dotted-map";

export default function GlobalGen() {
  const devGeoJson = JSON.parse(devGeoString);
  const geoList = devGeoJson.features
    .filter((x: any) => x.id !== "ATA") // 添加这一行来过滤掉南极洲
    .map((x: any) => {
      return x.id;
    });
  console.log(geoList);

  const mapString = getMapJSON({
    height: 150,
    countries: geoList, // look into `countries.geo.json` to see which keys to use. You can also omit this parameter and the whole world will be used
    grid: "diagonal", // how points should be aligned
  });

  //   const finalMap = map.getSVG({
  //     radius: 0.35,
  //     color: "#D1D5DA",
  //     shape: "circle",
  //   });

  // const mapJsonString = getMapJSON({ height: 60, grid: 'diagonal' });
  console.log(mapString);

  return (
    // <section className="flex flex-col gap-4 mt-[3.2px]">
    //   <img
    //     src={`data:image/svg+xml;utf8,${encodeURIComponent(finalMap)}`}
    //     alt="World Map with Highlighted Countries"
    //   />
    // </section>
    null
  );
}
