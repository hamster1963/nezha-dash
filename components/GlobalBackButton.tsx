"use client";

import { ServerStackIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GlobalBackButton() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(`/`);
  }, []);

  return (
    <button
      onClick={() => {
        router.push(`/`);
      }}
      className="rounded-[50px] w-fit bg-stone-100 p-[10px] transition-all hover:bg-stone-200 dark:hover:bg-stone-700 dark:bg-stone-800"
    >
      <ServerStackIcon className="size-4" />
    </button>
  );
}
