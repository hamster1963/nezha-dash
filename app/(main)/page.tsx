import ServerList from "@/components/ServerList";
import ServerOverview from "@/components/ServerOverview";

export default async function Home() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 md:gap-6">
      <ServerOverview />
      <ServerList />
    </div>
  );
}
