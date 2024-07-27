"use client";

import ServerCard from "@/components/ServerCard";
import { nezhaFetcher } from "@/lib/utils";
import useSWR from "swr";
import { DateTime } from "luxon";

export default function ServerListClient() {
  const { data } = useSWR('/api/server', nezhaFetcher, {
    refreshInterval: 3000,
  });
  if (!data) return null;
  const sortedResult = data.result.sort((a: any, b: any) => a.id - b.id);

  return (
    <section className={"grid grid-cols-1 gap-2  md:grid-cols-2"}>
      {sortedResult.map(
        (server: any) => (
          <ServerCard
            key={server.id}
            id={server.id}
            cpu={server.status.CPU}
            name={server.name}
            up={server.status.NetOutSpeed / 1024 / 1024}
            down={server.status.NetInSpeed / 1024 / 1024}
            status={DateTime.now().toUnixInteger() - server.last_active > 300 ? "offline" : "online"}
            uptime={server.status.Uptime / 86400}
            mem={(server.status.MemUsed / server.host.MemTotal) * 100}
            stg={server.status.DiskUsed / server.host.DiskTotal}
          />
        ),
      )}
    </section>
  );
}
