"use client";

import { useFilter } from "@/lib/network-filter-context";
import { useStatus } from "@/lib/status-context";
import { ServerStackIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GlobalBackButton() {
  const router = useRouter();
  const { setStatus } = useStatus();
  const { setFilter } = useFilter();

  useEffect(() => {
    setStatus("all");
    setFilter(false);
    sessionStorage.removeItem("selectedTag");
    router.prefetch(`/`);
  }, []);

  return (
    <button
      onClick={() => {
        router.push(`/`);
      }}
      className="rounded-[50px] cursor-pointer w-fit bg-stone-100 p-[10px] transition-all hover:bg-stone-200 dark:hover:bg-stone-700 dark:bg-stone-800"
    >
      <ServerStackIcon className="size-4" />
    </button>
  );
}
