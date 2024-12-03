import ServerList from "@/components/ServerList";
import ServerOverview from "@/components/ServerOverview";
import { Suspense } from "react";

import ServerGlobal from "./ClientComponents/Global";
import GlobalLoading from "./ClientComponents/GlobalLoading";

export const runtime = "edge";

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
      {global && (
        <Suspense fallback={<GlobalLoading />}>
          <ServerGlobal />
        </Suspense>
      )}
    </div>
  );
}
