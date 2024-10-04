"use client";

import { ServerApi } from "../../types/nezha-api";
import ServerCard from "../../../../components/ServerCard";
import { nezhaFetcher } from "../../../../lib/utils";
import useSWR from "swr";
import getEnv from "../../../../lib/env-entry";
import Switch from "@/components/Switch";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ServerListClient() {
  const t = useTranslations("ServerListClient");

  const [tag, setTag] = useState<string>(t("defaultTag"));

  const { data, error } = useSWR<ServerApi>("/api/server", nezhaFetcher, {
    refreshInterval: Number(getEnv("NEXT_PUBLIC_NezhaFetchInterval")) || 2000,
  });
  if (error)
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm font-medium opacity-40">{error.message}</p>
        <p className="text-sm font-medium opacity-40">{t("error_message")}</p>
      </div>
    );
  if (!data) return null;

  const { result } = data;

  const sortedServers = result.sort((a, b) => {
    const displayIndexDiff = (b.display_index || 0) - (a.display_index || 0);
    if (displayIndexDiff !== 0) return displayIndexDiff;
    return a.id - b.id;
  });

  const allTag = sortedServers.map((server) => server.tag).filter((tag) => tag);
  const uniqueTags = [...new Set(allTag)];

  uniqueTags.unshift(t("defaultTag"));

  const filteredServers =
    tag === t("defaultTag")
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
