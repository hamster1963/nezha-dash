import ServerList from "@/components/ServerList";
import ServerOverview from "@/components/ServerOverview";
import { unstable_setRequestLocale } from "next-intl/server";

export const runtime = 'edge';

export default function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 md:gap-6">
      <ServerOverview />
      <ServerList />
    </div>
  );
}
