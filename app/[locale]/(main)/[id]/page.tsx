"use client";

import { NetworkChartClient } from "@/app/[locale]/(main)/ClientComponents/NetworkChart";
import ServerDetailChartClient from "@/app/[locale]/(main)/ClientComponents/ServerDetailChartClient";
import ServerDetailClient from "@/app/[locale]/(main)/ClientComponents/ServerDetailClient";
import TabSwitch from "@/components/TabSwitch";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const t = useTranslations("TabSwitch");

  const tabs = [t("Detail"), t("Network")];
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-2">
      <ServerDetailClient server_id={Number(params.id)} />
      <section className="flex items-center my-2 w-full">
        <Separator className="flex-1" />
        <div className="flex justify-center w-full max-w-[200px]">
          <TabSwitch
            tabs={tabs}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        </div>
        <Separator className="flex-1" />
      </section>
      <div style={{ display: currentTab === tabs[0] ? "block" : "none" }}>
        <ServerDetailChartClient
          server_id={Number(params.id)}
          show={currentTab === tabs[0]}
        />
      </div>
      <div style={{ display: currentTab === tabs[1] ? "block" : "none" }}>
        <NetworkChartClient
          server_id={Number(params.id)}
          show={currentTab === tabs[1]}
        />
      </div>
    </div>
  );
}
