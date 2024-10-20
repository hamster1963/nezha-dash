import { auth } from "@/auth";
import ServerList from "@/components/ServerList";
import ServerOverview from "@/components/ServerOverview";
import { SignIn } from "@/components/sign-in";
import { unstable_setRequestLocale } from "next-intl/server";

export default async function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  const session = await auth()
  if (!session) return <SignIn />



  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 md:gap-6">
      <ServerOverview />
      <ServerList />
    </div>
  );
}
