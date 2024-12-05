import ServerList from "@/components/ServerList";
import ServerOverview from "@/components/ServerOverview";
import dynamic from "next/dynamic";

import GlobalLoading from "./ClientComponents/GlobalLoading";

const ServerGlobal = dynamic(() => import("./ClientComponents/Global"), {
  loading: () => <GlobalLoading />,
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const global = (await searchParams).global;
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 md:gap-6">
      <ServerOverview />
      {!global && <ServerList />}
      {global && <ServerGlobal />}
    </div>
  );
}
