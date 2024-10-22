"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useRef, useEffect } from "react";

export default function Switch({
  allTag,
  nowTag,
  setTag,
}: {
  allTag: string[];
  nowTag: string;
  setTag: (tag: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const isOverflowing = container.scrollWidth > container.clientWidth;

    if (!isOverflowing) {
      return;
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hidden z-50 flex flex-col items-start overflow-x-scroll rounded-[50px]"
    >
      <div className="flex items-center gap-1 rounded-[50px] bg-stone-100 p-[3px] dark:bg-stone-800">
        {allTag.map((tag) => (
          <div
            key={tag}
            onClick={() => setTag(tag)}
            className={cn(
              "relative cursor-pointer rounded-3xl px-2.5 py-[8px] text-[13px] font-[600] transition-all duration-500",
              nowTag === tag
                ? "text-black dark:text-white"
                : "text-stone-400 dark:text-stone-500"
            )}
          >
            {nowTag === tag && (
              <motion.div
                layoutId="nav-item"
                className="absolute inset-0 z-10 h-full w-full content-center bg-white shadow-lg shadow-black/5 dark:bg-stone-700 dark:shadow-white/5"
                style={{
                  originY: "0px",
                  borderRadius: 46,
                }}
              />
            )}
            <div className="relative z-20 flex items-center gap-1">
              <p className="whitespace-nowrap">{tag}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
