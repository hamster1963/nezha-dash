import { NezhaAPISafe } from "@/app/types/nezha-api";
import ServerFlag from "@/components/ServerFlag";
import ServerUsageBar from "@/components/ServerUsageBar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  const { id, name, country_code, online, cpu, up, down, mem, stg, tcp, udp } =
    formatNezhaInfo(serverInfo);

  const showFlag = getEnv("NEXT_PUBLIC_ShowFlag") === "true";
  const showNetTransfer = getEnv("NEXT_PUBLIC_ShowNetTransfer") === "true";
  const fixedTopServerName =
    getEnv("NEXT_PUBLIC_FixedTopServerName") === "true";

  return online ? (
    <Link href={`/${id}`} prefetch={true}>
      <Card
        className={cn(
          "flex flex-col items-center justify-start gap-3 p-3 md:px-5 cursor-pointer",
          {
            "flex-col": fixedTopServerName,
            "lg:flex-row": !fixedTopServerName,
          },
        )}
      >
        <section
          className={cn("grid items-center gap-2", {
            "lg:w-40": !fixedTopServerName,
          })}
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
          <div className="relative">
            <p
              className={cn(
                "break-all font-bold tracking-tight",
                showFlag ? "text-xs" : "text-sm",
              )}
            >
              {name}
            </p>
          </div>
        </section>
        <div className="flex flex-col gap-2">
          <section
            className={cn("grid grid-cols-5 items-center gap-3", {
              "lg:grid-cols-7": fixedTopServerName,
            })}
          >
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
            {fixedTopServerName && (
              <div className={" w-14 flex-col hidden lg:flex"}>
                <p className="text-xs text-muted-foreground">TCP</p>
                <div className="flex items-center text-xs font-semibold gap-1">
                  <span className="relative inline-flex  size-1.5 rounded-full bg-[hsl(var(--chart-1))]"></span>
                  <div className="flex items-center text-xs font-semibold">
                    {tcp}
                  </div>
                </div>
              </div>
            )}
            {fixedTopServerName && (
              <div className={"w-14 flex-col hidden lg:flex"}>
                <p className="text-xs text-muted-foreground">UDP</p>
                <div className="flex items-center text-xs font-semibold gap-1">
                  <span className="relative inline-flex  size-1.5 rounded-full bg-[hsl(var(--chart-4))]"></span>
                  <div className="flex items-center text-xs font-semibold">
                    {udp}
                  </div>
                </div>
              </div>
            )}
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
        "flex flex-col items-center justify-start gap-3 p-3 md:px-5",
        showNetTransfer
          ? "lg:min-h-[91px] min-h-[123px]"
          : "lg:min-h-[61px] min-h-[93px]",
        {
          "flex-col": fixedTopServerName,
          "lg:flex-row": !fixedTopServerName,
        },
      )}
    >
      <section
        className={cn("grid items-center gap-2", {
          "lg:w-40": !fixedTopServerName,
        })}
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
        <div className="relative">
          <p
            className={cn(
              "break-all font-bold tracking-tight",
              showFlag ? "text-xs max-w-[80px]" : "text-sm",
            )}
          >
            {name}
          </p>
        </div>
      </section>
    </Card>
  );
}
