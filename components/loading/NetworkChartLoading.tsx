import { useTranslations } from "next-intl"
import { Loader } from "@/components/loading/Loader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import ShinyText from "../ui/shiny-text"

export default function NetworkChartLoading() {
  const t = useTranslations("ServerListClient")
  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
          <CardTitle className="flex items-center gap-0.5 text-xl">
            <div className="aspect-auto h-[20px] w-24 bg-muted" />
          </CardTitle>
          <div className="mt-[2px] aspect-auto h-[14px] w-32 bg-muted" />
        </div>
        <div className="hidden pt-4 pr-4 sm:block">
          <ShinyText
            icon={<Loader visible={true} />}
            text={`${t("connecting")}...`}
            speed={3}
            delay={0}
            className={cn(
              "font-medium text-[14px] opacity-50 transition-opacity duration-500 hover:opacity-100",
            )}
          />
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="aspect-auto h-[250px] w-full" />
      </CardContent>
    </Card>
  )
}
