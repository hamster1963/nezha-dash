import ServerList from "@/components/ServerList";
import ServerOverview from "@/components/ServerOverview";
import { GetNezhaData } from "@/lib/serverFetch";

import { SWRConfig } from "swr";

export default function Home() {
  return (
    <SWRConfig
      value={{
        fallback: {
          "/api/server": GetNezhaData(),
        },
      }}
    >
      <div className="mx-auto grid w-full max-w-5xl gap-4 md:gap-6">
        <ServerOverview />
        <ServerList />
      </div>
    </SWRConfig>
  );
}
