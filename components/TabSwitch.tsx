"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useState } from "react";

export default function TabSwitch({
  tabs,
  currentTab,
  setCurrentTab,
}: {
  tabs: string[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}) {
  return (
    <div className="z-50 flex flex-col items-start rounded-[50px]">
      <div className="flex items-center gap-1 rounded-[50px] bg-stone-100 p-[3px] dark:bg-stone-800">
        {tabs.map((tab: string) => (
          <div
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={cn(
              "relative cursor-pointer rounded-3xl px-2.5 py-[8px] text-[13px] font-[600] transition-all duration-500",
              currentTab === tab
                ? "text-black dark:text-white"
                : "text-stone-400 dark:text-stone-500",
            )}
          >
            {currentTab === tab && (
              <motion.div
                layoutId="tab-switch"
                className="absolute inset-0 z-10 h-full w-full content-center bg-white shadow-lg shadow-black/5 dark:bg-stone-700 dark:shadow-white/5"
                style={{
                  originY: "0px",
                  borderRadius: 46,
                }}
              />
            )}
            <div className="relative z-20 flex items-center gap-1">
              <p className="whitespace-nowrap">{tab}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
