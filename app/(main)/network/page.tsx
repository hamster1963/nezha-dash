import { redirect } from "next/navigation"
import { useTranslations } from "next-intl"
import { AggregatedNetworkCharts } from "@/app/(main)/ClientComponents/network/AggregatedNetworkCharts"
import getEnv from "@/lib/env-entry"

export default function NetworkPage() {
  const t = useTranslations("NetworkPage")

  // Check if Komari mode is enabled and redirect to main page
  const isKomariMode = getEnv("NEXT_PUBLIC_Komari") === "true"
  if (isKomariMode) {
    redirect("/")
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-4 md:gap-6">
      <div className="space-y-2">
        <h1 className="font-semibold text-xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>
      <AggregatedNetworkCharts />
    </main>
  )
}
