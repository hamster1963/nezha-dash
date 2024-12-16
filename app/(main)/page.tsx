import ServerListClient from "./ClientComponents/main/ServerListClient"
import ServerOverviewClient from "./ClientComponents/main/ServerOverviewClient"

export default async function Home() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 md:gap-6">
      <ServerOverviewClient />
      <ServerListClient />
    </div>
  )
}
