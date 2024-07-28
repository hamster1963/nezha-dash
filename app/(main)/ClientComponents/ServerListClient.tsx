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
  const sortedResult = data.result.sort((a: any, b: any) => a.id - b.id);
  const timestamp = Date.now() / 1000;

  return (
    <section className={"grid grid-cols-1 gap-2 md:grid-cols-2"}>
      {sortedResult.map((server: any) => (
        <ServerCard
          key={server.id}
          id={server.id}
          cpu={server.status.CPU}
          name={server.name}
          up={server.status.NetOutSpeed / 1024 / 1024}
          down={server.status.NetInSpeed / 1024 / 1024}
          status={timestamp - server.last_active > 300 ? "offline" : "online"}
          uptime={server.status.Uptime / 86400}
          mem={(server.status.MemUsed / server.host.MemTotal) * 100}
          stg={(server.status.DiskUsed / server.host.DiskTotal) * 100}
        />
      ))}
    </section>
  );
}
