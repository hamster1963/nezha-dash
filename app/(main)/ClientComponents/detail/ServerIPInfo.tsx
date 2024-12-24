"use client"

import { IPInfo } from "@/app/api/server-ip/route"
import { Loader } from "@/components/loading/Loader"
import { Card, CardContent } from "@/components/ui/card"
import { nezhaFetcher } from "@/lib/utils"
import { useTranslations } from "next-intl"
import useSWRImmutable from "swr/immutable"

export default function ServerIPInfo({ server_id }: { server_id: number }) {
  const t = useTranslations("IPInfo")

  const { data } = useSWRImmutable<IPInfo>(`/api/server-ip?server_id=${server_id}`, nezhaFetcher)

  if (!data) {
    return (
      <div className="mb-11">
        <Loader visible />
      </div>
    )
  }

  return (
    <>
      <section className="flex flex-wrap gap-2 mb-4">
        {data.asn?.autonomous_system_organization && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{"ASN"}</p>
                <div className="text-xs">{data.asn.autonomous_system_organization}</div>
              </section>
            </CardContent>
          </Card>
        )}
        {data.asn?.autonomous_system_number && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("asn_number")}</p>
                <div className="text-xs">AS{data.asn.autonomous_system_number}</div>
              </section>
            </CardContent>
          </Card>
        )}
        {data.city?.registered_country?.names.en && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("registered_country")}</p>
                <div className="text-xs">{data.city.registered_country?.names.en}</div>
              </section>
            </CardContent>
          </Card>
        )}
        {data.city?.country?.iso_code && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{"ISO"}</p>
                <div className="text-xs">{data.city.country?.iso_code}</div>
              </section>
            </CardContent>
          </Card>
        )}
        {data.city?.city?.names.en && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("city")}</p>
                <div className="text-xs">{data.city.city?.names.en}</div>
              </section>
            </CardContent>
          </Card>
        )}
        {data.city?.location?.longitude && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("longitude")}</p>
                <div className="text-xs">{data.city.location?.longitude}</div>
              </section>
            </CardContent>
          </Card>
        )}
        {data.city?.location?.latitude && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("latitude")}</p>
                <div className="text-xs">{data.city.location?.latitude}</div>
              </section>
            </CardContent>
          </Card>
        )}
        {data.city?.location?.time_zone && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("time_zone")}</p>
                <div className="text-xs">{data.city.location?.time_zone}</div>
              </section>
            </CardContent>
          </Card>
        )}
        {data.city?.postal && (
          <Card className="rounded-[10px] bg-transparent border-none shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-xs text-muted-foreground">{t("postal_code")}</p>
                <div className="text-xs">{data.city.postal?.code}</div>
              </section>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  )
}
