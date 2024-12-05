"use client";

import { useTranslations } from "next-intl";

type GlobalInfoProps = {
  countries: string[];
};

export default function GlobalInfo({ countries }: GlobalInfoProps) {
  const t = useTranslations("Global");
  return (
    <section className="flex items-center justify-between">
      <p className="text-sm font-medium opacity-40">
        {t("Distributions")} {countries.length} {t("Regions")}
      </p>
    </section>
  );
}
