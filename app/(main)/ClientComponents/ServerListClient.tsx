"use client";

import { ServerApi } from "@/app/types/nezha-api";
import ServerCard from "@/components/ServerCard";
import { nezhaFetcher } from "@/lib/utils";
import useSWR from "swr";

export default function ServerListClient() {
  const { data } = useSWR<ServerApi>("/api/server", nezhaFetcher, {
    refreshInterval: Number(process.env.NEXT_PUBLIC_NezhaFetchInterval) || 2000,
  });

  if (!data) return null;

  const sortedServers = data.result.sort((a, b) => {
    if (a.display_index && b.display_index) {
      return b.display_index - a.display_index;
    }
    if (a.display_index) return -1;
    if (b.display_index) return 1;
    return a.id - b.id;
  });

  return (
    <section className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {sortedServers.map((serverInfo) => (
        <ServerCard key={serverInfo.id} serverInfo={serverInfo} />
      ))}
    </section>
  );
}
