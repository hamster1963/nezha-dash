"use client";

import { ServerApi } from "@/app/types/nezha-api";
import ServerCard from "@/components/ServerCard";
import { nezhaFetcher } from "@/lib/utils";
import useSWR from "swr";

export default function ServerListClient() {
  const { data } = useSWR<ServerApi>("/api/server", nezhaFetcher, {
    refreshInterval: 3000,
  });
  if (!data) return null;
  const sortedResult = data.result.sort((a, b) => a.id - b.id);
  const timestamp = Date.now() / 1000;

  return (
    <section className={"grid grid-cols-1 gap-2 md:grid-cols-2"}>
      {sortedResult.map((serverInfo) => (
        <ServerCard key={serverInfo.id} timestamp={timestamp} serverInfo={serverInfo} />
      ))}
    </section>
  );
}
