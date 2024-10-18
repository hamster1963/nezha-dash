import ServerDetailClient from "@/app/[locale]/(main)/ClientComponents/ServerDetailClient";

export default function Page({ params }: { params: { id: string } }) {
  return <ServerDetailClient server_id={Number(params.id)} />;
}
