"use client";

import { IPInfo } from "@/app/api/server-ip/route";
import { nezhaFetcher } from "@/lib/utils";
import useSWR from "swr";

export default function ServerIPInfo({ server_id }: { server_id: number }) {
  const { data } = useSWR<IPInfo>(
    `/api/server-ip?server_id=${server_id}`,
    nezhaFetcher,
  );

  if (!data) {
    return <div>Loading...</div>;
  }

  console.log(data);

  return (
    <div>
      <h1>Server IP Info</h1>
    </div>
  );
}
