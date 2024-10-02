"use client";

import { ServerApi } from "../../types/nezha-api";
import ServerCard from "../../../../components/ServerCard";
import { nezhaFetcher } from "../../../../lib/utils";
import useSWR from "swr";
import getEnv from "../../../../lib/env-entry";
import Switch from "@/components/Switch";
import { useState } from "react";

const defaultTag = "All";

export default function ServerListClient() {
  const [tag, setTag] = useState<string>(defaultTag);

  const { data, error } = useSWR<ServerApi>("/api/server", nezhaFetcher, {
    refreshInterval: Number(getEnv("NEXT_PUBLIC_NezhaFetchInterval")) || 2000,
  });
  if (error)
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm font-medium opacity-40">{error.message}</p>
        <p className="text-sm font-medium opacity-40">
          Please check your environment variables and review the server console
          logs for more details.
        </p>
      </div>
    );
  if (!data) return null;

  const { result } = data;

  const allTag = result.map((server) => server.tag).filter((tag) => tag);
  const uniqueTags = [...new Set(allTag)];
  uniqueTags.unshift(defaultTag);

  const sortedServers = result.sort((a, b) => {
    const displayIndexDiff = (b.display_index || 0) - (a.display_index || 0);
    if (displayIndexDiff !== 0) return displayIndexDiff;
    return a.id - b.id;
  });

  const filteredServers =
    tag === defaultTag
      ? sortedServers
      : sortedServers.filter((server) => server.tag === tag);

  return (
    <>
      {getEnv("NEXT_PUBLIC_ShowTag") === "true" && uniqueTags.length > 1 && (
        <Switch allTag={uniqueTags} nowTag={tag} setTag={setTag} />
      )}
      <section className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {filteredServers.map((serverInfo) => (
          <ServerCard key={serverInfo.id} serverInfo={serverInfo} />
        ))}
      </section>
    </>
  );
}
