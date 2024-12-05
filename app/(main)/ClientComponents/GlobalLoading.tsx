"use client";

import { Loader } from "@/components/loading/Loader";
import { useTranslations } from "next-intl";

export default function GlobalLoading() {
  const t = useTranslations("Global");
  return (
    <section className="flex flex-col gap-4 mt-[3.2px]">
      <div className="flex min-h-40 flex-col items-center justify-center font-medium text-sm">
        {t("Loading")}
        <Loader visible={true} />
      </div>
    </section>
  );
}
