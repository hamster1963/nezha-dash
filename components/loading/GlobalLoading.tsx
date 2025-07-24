"use client"

import { useTranslations } from "next-intl"
import { Loader } from "@/components/loading/Loader"

export default function GlobalLoading() {
  const t = useTranslations("Global")
  return (
    <section className="mt-[3.2px] flex flex-col gap-4">
      <div className="flex min-h-40 flex-col items-center justify-center font-medium text-sm">
        {t("Loading")}
        <Loader visible={true} />
      </div>
    </section>
  )
}
