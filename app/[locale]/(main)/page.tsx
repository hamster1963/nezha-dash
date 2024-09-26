import { useTranslations } from "next-intl";
import ServerList from "../../../components/ServerList";
import ServerOverview from "../../../components/ServerOverview";
import getEnv from "../../../lib/env-entry";
import { GetNezhaData } from "../../../lib/serverFetch";
import { SWRConfig } from "swr";
const disablePrefetch = getEnv("ServerDisablePrefetch") === "true";
const fallback = disablePrefetch
  ? {}
  : {
      "/api/server": GetNezhaData(),
    };
export default function Home() {
  return (
    <SWRConfig
      value={{
        fallback: fallback,
      }}
    >
      <div className="mx-auto grid w-full max-w-5xl gap-4 md:gap-6">
        <ServerOverview />
        <ServerList />
      </div>
    </SWRConfig>
  );
}
