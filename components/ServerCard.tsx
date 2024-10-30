import { NezhaAPISafe } from "@/app/types/nezha-api";
import ServerFlag from "@/components/ServerFlag";
import ServerUsageBar from "@/components/ServerUsageBar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import getEnv from "@/lib/env-entry";
import { cn, formatBytes, formatNezhaInfo } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ServerCard({
  serverInfo,
}: {
  serverInfo: NezhaAPISafe;
}) {
  const t = useTranslations("ServerCard");
  const router = useRouter();
  const { id, name, country_code, online, cpu, up, down, mem, stg } =
    formatNezhaInfo(serverInfo);

  const showFlag = getEnv("NEXT_PUBLIC_ShowFlag") === "true";

  const showNetTransfer = getEnv("NEXT_PUBLIC_ShowNetTransfer") === "true";

  return online ? (
    <Link href={`/${id}`} prefetch={true}>
      <Card
        className={
          "flex flex-col items-center justify-start gap-3 p-3 md:px-5 lg:flex-row cursor-pointer"
        }
      >
        <section
          className="grid items-center gap-2 lg:w-28 "
          style={{ gridTemplateColumns: "auto auto 1fr" }}
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-green-500 self-center"></span>
          <div
            className={cn(
              "flex items-center justify-center",
              showFlag ? "min-w-[17px]" : "min-w-0",
            )}
          >
            {showFlag ? <ServerFlag country_code={country_code} /> : null}
          </div>
          <p
            className={cn(
              "break-all font-bold tracking-tight",
              showFlag ? "text-xs" : "text-sm",
            )}
          >
            {name}
          </p>
        </section>
        <div className="flex flex-col gap-2">
          <section className={"grid  grid-cols-5 items-center gap-3"}>
            <div className={"flex w-14 flex-col"}>
              <p className="text-xs text-muted-foreground">{t("CPU")}</p>
              <div className="flex items-center text-xs font-semibold">
                {cpu.toFixed(2)}%
              </div>
              <ServerUsageBar value={cpu} />
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-xs text-muted-foreground">{t("Mem")}</p>
              <div className="flex items-center text-xs font-semibold">
                {mem.toFixed(2)}%
              </div>
              <ServerUsageBar value={mem} />
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-xs text-muted-foreground">{t("STG")}</p>
              <div className="flex items-center text-xs font-semibold">
                {stg.toFixed(2)}%
              </div>
              <ServerUsageBar value={stg} />
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-xs text-muted-foreground">{t("Upload")}</p>
              <div className="flex items-center text-xs font-semibold">
                {up >= 1024
                  ? `${(up / 1024).toFixed(2)}G/s`
                  : `${up.toFixed(2)}M/s`}
              </div>
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-xs text-muted-foreground">{t("Download")}</p>
              <div className="flex items-center text-xs font-semibold">
                {down >= 1024
                  ? `${(down / 1024).toFixed(2)}G/s`
                  : `${down.toFixed(2)}M/s`}
              </div>
            </div>
          </section>
          {showNetTransfer && (
            <section
              onClick={() => {
                router.push(`/${id}`);
              }}
              className={"flex items-center justify-between gap-1"}
            >
              <Badge
                variant="secondary"
                className="items-center flex-1 justify-center rounded-[8px] text-nowrap text-[11px] border-muted-50 shadow-md shadow-neutral-200/30 dark:shadow-none"
              >
                {t("Upload")}:{formatBytes(serverInfo.status.NetOutTransfer)}
              </Badge>
              <Badge
                variant="outline"
                className="items-center flex-1 justify-center rounded-[8px] text-nowrap text-[11px] shadow-md shadow-neutral-200/30 dark:shadow-none"
              >
                {t("Download")}:{formatBytes(serverInfo.status.NetInTransfer)}
              </Badge>
            </section>
          )}
        </div>
      </Card>
    </Link>
  ) : (
    <Card
      className={cn(
        "flex flex-col items-center justify-start gap-3 p-3 md:px-5 lg:flex-row",
        showNetTransfer
          ? "lg:min-h-[91px] min-h-[123px]"
          : "lg:min-h-[61px] min-h-[93px]",
      )}
    >
      <Popover>
        <PopoverTrigger asChild>
          <section
            className="grid items-center gap-2 lg:w-28"
            style={{ gridTemplateColumns: "auto auto 1fr" }}
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 self-center"></span>
            <div
              className={cn(
                "flex items-center justify-center",
                showFlag ? "min-w-[17px]" : "min-w-0",
              )}
            >
              {showFlag ? <ServerFlag country_code={country_code} /> : null}
            </div>
            <p
              className={cn(
                "break-all font-bold tracking-tight",
                showFlag ? "text-xs" : "text-sm",
              )}
            >
              {name}
            </p>
          </section>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-2" side="top">
          <p className="text-sm text-muted-foreground">{t("Offline")}</p>
        </PopoverContent>
      </Popover>
    </Card>
  );
}
