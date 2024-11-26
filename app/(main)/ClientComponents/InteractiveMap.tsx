"use client";

import { geoEquirectangular, geoPath } from "d3-geo";
import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface InteractiveMapProps {
  countries: string[];
  serverCounts: { [key: string]: number };
  width: number;
  height: number;
  filteredFeatures: any[];
}

export function InteractiveMap({
  countries,
  serverCounts,
  width,
  height,
  filteredFeatures,
}: InteractiveMapProps) {
  const t = useTranslations("Global");

  const [tooltipData, setTooltipData] = useState<{
    centroid: [number, number];
    country: string;
    count: number;
  } | null>(null);

  const projection = geoEquirectangular()
    .scale(140)
    .translate([width / 2, height / 2])
    .rotate([-12, 0, 0]);

  const path = geoPath().projection(projection);

  return (
    <div className="relative w-full aspect-[2/1]">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <defs>
          <pattern id="dots" width="2" height="2" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="currentColor" />
          </pattern>
        </defs>
        <g>
          {filteredFeatures.map((feature, index) => {
            const isHighlighted = countries.includes(
              feature.properties.iso_a2_eh,
            );

            if (isHighlighted) {
              console.log(feature.properties.iso_a2_eh);
            }

            const serverCount = serverCounts[feature.properties.iso_a2_eh] || 0;

            return (
              <path
                key={index}
                d={path(feature) || ""}
                className={
                  isHighlighted
                    ? "fill-orange-500 hover:fill-orange-300 stroke-orange-500 dark:stroke-amber-900  dark:fill-amber-900 dark:hover:fill-amber-700 transition-all cursor-pointer"
                    : "fill-neutral-200/50 dark:fill-neutral-800 stroke-neutral-300/40 dark:stroke-neutral-700 stroke-[0.5]"
                }
                onMouseEnter={() => {
                  if (isHighlighted && path.centroid(feature)) {
                    setTooltipData({
                      centroid: path.centroid(feature),
                      country: feature.properties.name,
                      count: serverCount,
                    });
                  }
                }}
                onMouseLeave={() => setTooltipData(null)}
              />
            );
          })}
        </g>
      </svg>
      <AnimatePresence mode="wait">
        {tooltipData && (
          <m.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            className="absolute hidden lg:block pointer-events-none bg-white dark:bg-neutral-800 px-2 py-1 rounded shadow-lg text-sm dark:border dark:border-neutral-700"
            key={tooltipData.country}
            style={{
              left: tooltipData.centroid[0],
              top: tooltipData.centroid[1],
              transform: "translate(-50%, -50%)",
            }}
          >
            <p className="font-medium">{tooltipData.country}</p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {tooltipData.count} {t("Servers")}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
