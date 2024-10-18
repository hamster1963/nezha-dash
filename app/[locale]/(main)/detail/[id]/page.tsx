import ServerDetailClient from "@/app/[locale]/(main)/ClientComponents/ServerDetailClient";
import ServerDetailChartClient from "@/app/[locale]/(main)/ClientComponents/ServerDetailChartClient";
import { Separator } from "@/components/ui/separator";

export default function Page({ params }: { params: { id: string } }) {
  return <div className="mx-auto grid w-full max-w-5xl gap-2">
    <ServerDetailClient server_id={Number(params.id)} />
    <Separator className="mt-1 mb-2" />
    <ServerDetailChartClient server_id={Number(params.id)} />
  </div>
    ;
}
