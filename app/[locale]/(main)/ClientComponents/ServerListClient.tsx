"use client";

import { ServerApi } from "../../types/nezha-api";
import ServerCard from "../../../../components/ServerCard";
import { nezhaFetcher } from "../../../../lib/utils";
import useSWR from "swr";
import getEnv from "../../../../lib/env-entry";
export default function ServerListClient() {
  const { data, error } = useSWR<ServerApi>("/api/server", nezhaFetcher, {
    refreshInterval: Number(getEnv("NEXT_PUBLIC_NezhaFetchInterval")) || 2000,
  });
  if (error)
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm font-medium opacity-40">{error.message}</p>
        <p className="text-sm font-medium opacity-40">
          Please check your environment variables and review the server console logs for more details.
        </p>
      </div>
    );
  if (!data) return null;
  const { result } = data;

  const positiveDisplayIndex = result
    .filter((server) => server.display_index > 0)
    .sort((a, b) => b.display_index - a.display_index);

  const noDisplayIndex = result
    .filter((server) => !server.display_index)
    .sort((a, b) => a.id - b.id);

  const negativeDisplayIndex = result
    .filter((server) => server.display_index < 0)
    .sort((a, b) => b.display_index - a.display_index);

  const sortedServers = [
    ...positiveDisplayIndex,
    ...noDisplayIndex,
    ...negativeDisplayIndex,
  ];
  return (
    <section className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {sortedServers.map((serverInfo) => (
        <ServerCard key={serverInfo.id} serverInfo={serverInfo} />
      ))}
    </section>
  );
}
