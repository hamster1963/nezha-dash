import ServerDetailClient from "@/app/[locale]/(main)/ClientComponents/ServerDetailClient";
import ServerDetailChartClient from "@/app/[locale]/(main)/ClientComponents/ServerDetailChartClient";

export default function Page({ params }: { params: { id: string } }) {
  return <div className="mx-auto grid w-full max-w-5xl gap-2">
    <ServerDetailClient server_id={Number(params.id)} />
    <ServerDetailChartClient server_id={Number(params.id)} />
  </div>
    ;
}
