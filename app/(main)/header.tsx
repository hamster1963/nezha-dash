"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { DateTime } from "luxon";

function Header() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <section className="flex items-center justify-between">
        <section className="text-md flex items-center font-medium">
          <div className="mr-1 flex flex-row items-center justify-start">
            <Image
              width={40}
              height={40}
              unoptimized
              alt="apple-touch-icon"
              src={"/apple-touch-icon.png"}
              className="relative !m-0 h-6 w-6 border-2 border-white object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
            />
          </div>
          HomeDash
          <Separator
            orientation="vertical"
            className="mx-2 hidden h-4 w-[1px] md:block"
          />
          <p className="hidden text-sm font-medium opacity-40 md:block">
            Simple and beautiful dashboard
          </p>
        </section>
        {/* <LiveTag /> */}
      </section>
      <Overview />
    </div>
  );
}

function Overview() {
  const [mouted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const time = DateTime.TIME_SIMPLE;
  time.hour12 = true;

  return (
    <section className={"md:mt-16 mt-10 flex flex-col"}>
      <p className="text-md font-semibold">👋 Overview</p>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium opacity-50">where the time is</p>
        {mouted && (
          <p className="opacity-1 text-sm font-medium">
            {DateTime.now().setLocale("en-US").toLocaleString(time)}
          </p>
        )}
      </div>
    </section>
  );
}

export default Header;
