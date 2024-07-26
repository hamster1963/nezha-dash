"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";

export const siteUrlList = [
  {
    name: "Home",
    header: "👋 Overview",
    url: "/",
  },
  {
    name: "Service",
    header: "🎛️ Service",
    url: "/service",
  },
];
export default function Nav() {
  const nowPath = usePathname();
  return (
    <div className={"flex flex-col items-center justify-center"}>
      <div
        className={
          "fixed bottom-6 z-50 flex items-center gap-1 rounded-[50px] bg-stone-700 bg-opacity-80 px-2 py-1.5 backdrop-blur-lg"
        }
      >
        {siteUrlList.map((site, index) => (
          <div key={site.name} className={"flex items-center gap-1"}>
            {index !== 0 && (
              <p key={index} className={"pointer-events-none text-stone-500"}>
                /
              </p>
            )}
            <Link
              key={site.name}
              href={site.url}
              scroll={true}
              className={cn(
                "rounded-[50px] px-2.5 py-1.5 text-[16px] font-[500] text-stone-400 transition-colors sm:hover:text-white",
                clsx(
                  nowPath === site.url &&
                  "bg-stone-500 text-white dark:bg-stone-600",
                ),
              )}
            >
              {site.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
