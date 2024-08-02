"use client";

import { ServerApi } from "@/app/types/nezha-api";
import ServerCard from "@/components/ServerCard";
import { nezhaFetcher } from "@/lib/utils";
import useSWR from "swr";

export default function ServerListClient() {
  const { data } = useSWR<ServerApi>("/api/server", nezhaFetcher, {
    refreshInterval: process.env.NEXT_PUBLIC_NezhaFetchInterval
      ? Number(process.env.NEXT_PUBLIC_NezhaFetchInterval)
      : 2000,
  });
  if (!data) return null;
  const sortedResult = data.result.sort((a, b) => a.id - b.id);

  return (
    <section className={"grid grid-cols-1 gap-2 md:grid-cols-2"}>
      {sortedResult.map((serverInfo) => (
        <ServerCard key={serverInfo.id} serverInfo={serverInfo} />
      ))}
    </section>
  );
}
