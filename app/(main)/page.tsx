import ServerList from "@/components/ServerList";
import ServerOverview from "@/components/ServerOverview";

export const runtime = "edge";

import { Loader } from "@/components/loading/Loader";
import { ServerStackIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { Suspense } from "react";

import ServerGlobal from "./ClientComponents/Global";

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
        <Suspense
          fallback={
            <section className="flex flex-col gap-4 mt-[3.2px]">
              <Link
                href={`/`}
                className="rounded-[50px] w-fit bg-stone-100 p-[10px] transition-all hover:bg-stone-200 dark:hover:bg-stone-700 dark:bg-stone-800"
              >
                <ServerStackIcon className="size-4" />
              </Link>
              <div className="flex min-h-40 flex-col items-center justify-center font-medium text-sm">
                Loading...
                <Loader visible={true} />
              </div>
            </section>
          }
        >
          <ServerGlobal />
        </Suspense>
      )}
    </div>
  );
}
